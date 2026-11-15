// Posts a scorecard or demo case to /api/gate as if an agent made the change.
// Usage: node scripts/replay.mjs <case-id>   (ANDON_URL overrides http://localhost:3000)
import { readFile } from "node:fs/promises";

const id = process.argv[2];
if (!id) {
  console.error("Usage: node scripts/replay.mjs <case-id>");
  process.exit(1);
}

const base = process.env.ANDON_URL ?? "http://localhost:3000";
// demo/cases holds the staged demo steps; they are not part of the scorecard.
const dirs = ["scorecard/cases", "demo/cases"];

let kase;
for (const dir of dirs) {
  try {
    kase = JSON.parse(await readFile(new URL(`../${dir}/${id}.json`, import.meta.url), "utf8"));
    break;
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.error(`Could not read case ${id}: ${err.message}`);
      process.exit(1);
    }
  }
}
if (!kase) {
  console.error(`No case ${id} in ${dirs.join(" or ")}`);
  process.exit(1);
}

// The hook sends the paths it touched; for a replay, read them off the diff headers.
const files = [...kase.diff.matchAll(/^\+\+\+ b\/(.+)$/gm)].map((m) => m[1]);

const body = { runId: `replay-${kase.id}-${Date.now()}`, spec: kase.spec, diff: kase.diff, files };

let res;
try {
  res = await fetch(`${base}/api/gate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
} catch (err) {
  console.error(`Andon is not running at ${base}: ${err.message}`);
  process.exit(1);
}

const result = await res.json();
if (!res.ok) {
  console.error(`Gate returned ${res.status}:`, result);
  process.exit(1);
}

console.log(`${kase.id} (${kase.label}/${kase.kind}) -> ${result.verdict}`);
console.log(`  reason:  ${result.reason}`);
console.log(`  firedBy: ${result.firedBy}  eventId: ${result.eventId}`);
