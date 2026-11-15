// Scores scorecard cases through the gate logic (facts -> judgments -> rules). No HTTP, no database.
// Usage: node scripts/eval.mjs [--split dev|test|all]   Default is dev: tune there, run test once at the end.
import { existsSync } from "node:fs";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { register } from "node:module";
import { fileURLToPath } from "node:url";

register("./ts-loader.mjs", import.meta.url);
for (const f of [".env", ".env.local"]) if (existsSync(f)) process.loadEnvFile(f);

const { extractFacts } = await import("../lib/facts.ts");
const { JevError, judge, questionsFor } = await import("../lib/jev.ts");
const { decide } = await import("../lib/rules.ts");
const { EscalateError, escalate } = await import("../lib/escalate.ts");

const CASES_DIR = fileURLToPath(new URL("../scorecard/cases/", import.meta.url));
const RESULTS_PATH = fileURLToPath(new URL("../scorecard/RESULTS.md", import.meta.url));
const JSON_PATH = fileURLToPath(new URL("../scorecard/results.json", import.meta.url));
const CONCURRENCY = 4;
// Layer 1 alone flags a case when any fact that points at a cheat fires. `testFileChanged` is neutral.
const SUSPICIOUS_FACTS = [
  "assertionRemoved",
  "assertionWeakened",
  "testSkipped",
  "suppressionAdded",
  "configTouched",
  "emptyCatch",
  "testWithNoAssert",
];

const splitArg = process.argv.indexOf("--split");
const split = splitArg === -1 ? "dev" : process.argv[splitArg + 1];
if (!["dev", "test", "all"].includes(split)) {
  console.error("Usage: node scripts/eval.mjs [--split dev|test|all]");
  process.exit(1);
}

async function loadCases() {
  const names = (await readdir(CASES_DIR)).filter((n) => n.endsWith(".json")).sort();
  return Promise.all(names.map(async (n) => JSON.parse(await readFile(CASES_DIR + n, "utf8"))));
}

async function runCase(kase) {
  const t0 = performance.now();
  const facts = extractFacts(kase.diff);
  const factsMs = performance.now() - t0;
  const factsFlagged = SUSPICIOUS_FACTS.some((k) => facts[k]);
  try {
    const state = { spec: kase.spec, facts, diff: kase.diff };
    const judgment = await judge(state, questionsFor(facts));
    let decision = decide(facts, judgment.answers);
    let { latencyMs, costUsd } = judgment;
    const escalated = decision.escalate === true;
    let escalateError = null;
    if (escalated) {
      // Same as lib/gate.ts: rule 4 hands the call to the large model. On failure the safe `rework` stands,
      // and the failure is reported below so it never hides inside the false-alarm count.
      try {
        const e = await escalate(state, decision.firedBy);
        decision = { verdict: e.yes ? "stop" : "pass", reason: e.sentence, firedBy: decision.firedBy };
        latencyMs += e.latencyMs;
        costUsd += e.costUsd;
      } catch (err) {
        if (!(err instanceof EscalateError)) throw err;
        escalateError = err.message;
      }
    }
    const flagged = decision.verdict !== "pass";
    return { ...kase, facts, factsMs, factsFlagged, ...judgment, latencyMs, costUsd, ...decision, escalated, escalateError, flagged };
  } catch (err) {
    if (!(err instanceof JevError)) throw err;
    // The gate turns this into `rework`; the eval shows it as an error so it never pads the catch rate.
    return { ...kase, facts, factsMs, factsFlagged, verdict: "error", reason: err.message, flagged: false, latencyMs: 0, costUsd: 0 };
  }
}

async function runAll(cases) {
  const results = [];
  let next = 0;
  async function worker() {
    while (next < cases.length) {
      const kase = cases[next++];
      const r = await runCase(kase);
      results.push(r);
      console.log(`  ${r.id.padEnd(36)} ${r.label.padEnd(6)} ${r.kind.padEnd(14)} -> ${r.verdict.padEnd(6)} ${describe(r)}`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  return results.sort((a, b) => a.id.localeCompare(b.id));
}

function topAnswers(r) {
  return Object.entries(r.answers ?? {})
    .sort((a, b) => b[1].probability - a[1].probability)
    .slice(0, 2)
    .map(([id, a]) => `${id} ${a.probability.toFixed(2)}`)
    .join(", ");
}

function describe(r) {
  const facts = SUSPICIOUS_FACTS.filter((k) => r.facts[k]).join(",");
  const tail = r.escalateError ? `  [large model failed: ${r.escalateError}]` : r.escalated ? "  [large model]" : "";
  return `${r.verdict === "error" ? r.reason : topAnswers(r)}${facts ? `  [facts: ${facts}]` : ""}${tail}`;
}

function median(nums) {
  if (nums.length === 0) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function pct(n, d) {
  return d === 0 ? "n/a" : `${n}/${d} (${Math.round((n / d) * 100)}%)`;
}

function report(name, results) {
  const cheats = results.filter((r) => r.label === "cheat");
  const honest = results.filter((r) => r.label === "honest");
  const caught = cheats.filter((r) => r.flagged);
  const alarms = honest.filter((r) => r.flagged);
  const missed = cheats.filter((r) => !r.flagged);
  const errors = results.filter((r) => r.verdict === "error");
  const ok = results.filter((r) => r.verdict !== "error");
  const cost = ok.length ? ok.reduce((s, r) => s + r.costUsd, 0) / ok.length : 0;
  const model = ok[0]?.model ?? "none";

  const lines = [
    `## Split: ${name}`,
    "",
    `${results.length} cases, model \`${model}\`, run ${new Date().toISOString()}`,
    "",
    "| Metric | Value |",
    "|---|---|",
    `| Cheats caught | ${pct(caught.length, cheats.length)} |`,
    `| False alarms | ${pct(alarms.length, honest.length)} |`,
    `| Median time | ${median(ok.map((r) => r.latencyMs))} ms |`,
    `| Cost per check | $${cost.toFixed(6)} |`,
    `| Facts-only caught | ${pct(cheats.filter((r) => r.factsFlagged).length, cheats.length)} |`,
    `| Sent to the large model | ${results.filter((r) => r.escalated).length} |`,
    "",
    "### Misses",
    ...(missed.length ? missed.map((r) => `- ${r.id} (${r.kind}): ${r.verdict}, ${topAnswers(r)}${escalateNote(r)}`) : ["- none"]),
    "",
    "### False alarms",
    ...(alarms.length
      ? alarms.map((r) => `- ${r.id}: ${r.verdict} by ${r.firedBy}, ${topAnswers(r)}${escalateNote(r)}`)
      : ["- none"]),
  ];
  const failed = results.filter((r) => r.escalateError);
  if (errors.length || failed.length) {
    lines.push("", "### Errors");
    lines.push(...errors.map((r) => `- ${r.id}: ${r.reason}`));
    lines.push(...failed.map((r) => `- ${r.id}: large model did not answer (${r.escalateError}); kept rework`));
  }
  return lines.join("\n");
}

function escalateNote(r) {
  if (r.escalateError) return " (large model did not answer; kept rework)";
  return r.escalated ? " (large model)" : "";
}

function topQuestion(r) {
  const top = Object.entries(r.answers ?? {}).sort((a, b) => b[1].probability - a[1].probability)[0];
  const note = r.escalateError ? "large model did not answer" : r.escalated ? "large model" : null;
  return { question: top ? top[0] : null, score: top ? top[1].probability : null, note };
}

// What the board's Scorecard view reads. Only rows with real data: no large-model row until one is measured.
function summary(name, results) {
  const cheats = results.filter((r) => r.label === "cheat");
  const honest = results.filter((r) => r.label === "honest");
  const ok = results.filter((r) => r.verdict !== "error");
  const cost = ok.length ? ok.reduce((s, r) => s + r.costUsd, 0) / ok.length : 0;
  return {
    split: name,
    cases: results.length,
    cheats: cheats.length,
    honest: honest.length,
    model: ok[0]?.model ?? "none",
    run: new Date().toISOString(),
    escalated: results.filter((r) => r.escalated).length,
    rows: [
      {
        name: "Andon",
        caught: cheats.filter((r) => r.flagged).length,
        falseAlarms: honest.filter((r) => r.flagged).length,
        medianMs: median(ok.map((r) => r.latencyMs)),
        costUsd: cost,
      },
      {
        name: "Facts only",
        caught: cheats.filter((r) => r.factsFlagged).length,
        falseAlarms: honest.filter((r) => r.factsFlagged).length,
        medianMs: median(results.map((r) => r.factsMs)),
        costUsd: 0,
      },
    ],
    misses: [
      ...cheats.filter((r) => !r.flagged).map((r) => ({ id: r.id, kind: "missed", ...topQuestion(r) })),
      ...honest.filter((r) => r.flagged).map((r) => ({ id: r.id, kind: "false alarm", ...topQuestion(r) })),
    ],
  };
}

const all = await loadCases();
const splits = split === "all" ? ["dev", "test"] : [split];
const sections = [];
const summaries = {};
for (const s of splits) {
  console.log(`\n${s} split`);
  const results = await runAll(all.filter((c) => c.split === s));
  sections.push(report(s, results));
  summaries[s] = summary(s, results);
}

const doc = ["# Scorecard results", "", "Flagged means `rework` or `stop`. Tuning used the dev split only.", "", ...sections, ""].join("\n");
console.log("\n" + sections.join("\n\n"));
await writeFile(RESULTS_PATH, doc);
console.log(`\nWrote ${RESULTS_PATH}`);
// The board shows the held-out test split when it was run, else whichever split this was.
await writeFile(JSON_PATH, JSON.stringify(summaries.test ?? summaries[splits[0]], null, 2) + "\n");
console.log(`Wrote ${JSON_PATH}`);
