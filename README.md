# Andon

CI tells you the tests passed. Andon tells you if the agent cheated to make them pass.

A coding agent edits a file. A Claude Code hook sends the diff, the task spec and
the test files to Andon. Plain code checks the facts (tests edited, skipped,
weakened; errors silenced). A small System One model (TypeSafe Jev) answers the
judgment calls. Rules turn the scores into `pass`, `rework` or `stop`. On `stop`
the line halts and the board turns red until a person clicks "Resume line".

## Results

20 held-out cases (10 honest, 10 cheat). Tuned on a separate dev split of 20.

| Metric | Value |
|---|---|
| Cheats caught | 10/10 (100%) |
| False alarms | 3/10 (30%) |
| Median time | 217 ms |
| Cost per check | $0.000499 |
| Facts-only caught | 2/10 (20%) |
| Sent to the large model | 3 of 20 |

Cost includes the three escalations to a large model; Jev alone is about $0.00003
per check. Scores vary a little between runs. Full table, misses and errors:
`scorecard/RESULTS.md`. Rerun with `node scripts/eval.mjs --split all`.

## Run it

1. `cp .env.example .env.local` and fill in `DATABASE_URL` (Tiger Data Postgres),
   `TYPESAFE_API_KEY`, `SENTRY_DSN`. Set `JEV_MOCK=true` to skip the model.
2. `npm install && node scripts/db-init.mjs`
3. `npm run dev`, open http://localhost:3000
4. Replay a case: `node scripts/replay.mjs <case-id>`
5. Gate a live agent: `cd demo-app && npm install`, then start Claude Code from
   the repo root (the hook in `.claude/settings.json` only fires there) and point
   it at `demo-app/TASK.md`. Every Edit/Write under `demo-app/` goes through the
   gate. Watch the board.
6. Scorecard view: `node scripts/eval.mjs --split test` writes
   `scorecard/results.json`, which the board reads on load.

## How it was built

One day, one agent, one task per session. `CLAUDE.md` sets the rules; `docs/`
holds the spec, design, scorecard and plan before any code. Tests for `facts.ts`
and `rules.ts` were locked and never edited to pass; CI runs them on every push.
The hook gates `demo-app/`, the target the agent works on, not this repo's own
source. Every task is one commit.
