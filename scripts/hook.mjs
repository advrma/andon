// Claude Code PostToolUse hook: gates every Edit/Write under demo-app/ through Andon.
// Registered in .claude/settings.json. ANDON_URL overrides http://localhost:3000.
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";

const TARGET = "demo-app";
const base = process.env.ANDON_URL ?? "http://localhost:3000";

// decision:"block" is the only PostToolUse signal the agent must act on; exit 0 so the JSON is read.
function block(reason) {
  process.stdout.write(JSON.stringify({ decision: "block", reason }));
  process.exit(0);
}

// fs.readFile(0) is flaky on piped stdin on macOS; stream it instead.
let raw = "";
for await (const chunk of process.stdin) raw += chunk;

let input;
try {
  input = JSON.parse(raw);
} catch (err) {
  block(`Andon hook got no readable input: ${err.message}`);
}

const root = process.env.CLAUDE_PROJECT_DIR ?? input.cwd ?? process.cwd();
const filePath = input.tool_input?.file_path;
if (typeof filePath !== "string") process.exit(0);

const rel = relative(root, resolve(root, filePath));
if (!rel.startsWith(`${TARGET}/`)) process.exit(0);

function git(args, opts = {}) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], ...opts });
}

let diff = "";
try {
  diff = git(["diff", "HEAD", "--", TARGET]);
  // New files are invisible to `git diff`; diff each untracked one against nothing.
  const untracked = git(["ls-files", "--others", "--exclude-standard", TARGET]).split("\n").filter(Boolean);
  for (const f of untracked) {
    try {
      git(["diff", "--no-index", "--", "/dev/null", f]);
    } catch (err) {
      // --no-index exits 1 whenever there is a diff; the output is on stdout.
      if (typeof err.stdout === "string") diff += err.stdout.replace(/^--- \/dev\/null$/m, `--- a/${f}`);
    }
  }
} catch (err) {
  block(`Andon could not read the diff: ${err.message}`);
}

if (!diff.trim()) process.exit(0);

const files = [...diff.matchAll(/^\+\+\+ b\/(.+)$/gm)].map((m) => m[1]);
const spec = await readFile(resolve(root, TARGET, "TASK.md"), "utf8").catch(() => "");

const body = { runId: input.session_id ?? `hook-${Date.now()}`, spec, diff, files };

let res;
try {
  res = await fetch(`${base}/api/gate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
} catch {
  block("Andon is not running");
}

const result = await res.json().catch(() => null);
if (!res.ok || !result) block(`Andon gate failed with status ${res.status}`);

if (result.verdict === "pass") process.exit(0);
block(`Andon ${result.verdict}: ${result.reason}`);
