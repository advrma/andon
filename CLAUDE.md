# Andon: agent rules

Andon stops the line when a coding agent cheats to get green checks.
This is a one-day hackathon build. Working demo beats complete product.

## Read order

1. This file (always loaded).
2. `docs/PLAN.md`: find the first unchecked task. Do only that task.
3. Open other docs only when the task names them:
   - `docs/SPEC.md`: gate logic, data, API
   - `docs/DESIGN.md`: any UI work
   - `docs/SCORECARD.md`: the test set and eval script
   - `docs/DEMO.md`: demo flow and submission

Do not re-read a doc you already read in this session.

## Stack (do not change)

- One Next.js app (App Router, TypeScript, strict mode). No separate backend.
- Postgres on Tiger Data, using the `postgres` npm package. Plain SQL, no ORM.
- Tailwind for styling. No component library.
- Vitest for the few tests that are allowed.
- Sentry for errors.
- Add a new dependency only if a task cannot be done without it.

## How to work

- One task from PLAN.md per session. Stop when its "done when" check passes.
- Before coding, write a plan of 5 lines or fewer. Then build.
- Make the smallest change that finishes the task. No refactors on the side.
- Read only the files the task touches. Do not explore the repo.
- If the spec is unclear, pick the simplest reading, note it in one line, keep going.
- If you fail the same fix twice, stop and tell me. Do not loop.
- End each task with: tick the box in PLAN.md, one commit, a report of 5 lines or fewer.

## Testing rules (save tokens)

Write tests ONLY for:
- `lib/facts.ts` (the fact checks)
- `lib/rules.ts` (scores to verdict)

Nothing else gets tests. No UI tests, no API route tests, no snapshot tests,
no end-to-end tests, no browser automation, no screenshots unless I ask.

To verify a task, run only:
- `npx tsc --noEmit`
- `npx vitest run <the one test file you touched>` (if any)

Do not run the full test suite, the linter, or a build unless the task says so.
Do not start the dev server to "check". I will look at the UI myself.

## Hard rules (never break)

These are the same cheats Andon exists to catch. Do not commit them here.

- Never edit, delete, skip, or weaken an existing test to make it pass.
- Never add `@ts-ignore`, `@ts-expect-error`, `eslint-disable`, or `any` to silence an error.
- Never write an empty `catch`. Log to Sentry or rethrow.
- Never hard-code an answer to satisfy a test.
- Never touch `scorecard/cases/` labels, CI config, or `tsconfig.json` unless the task says so.
- Never put secrets in code. Keys live in `.env.local`. Keep `.env.example` current.
- Never send the agent's own explanation to Jev. Only spec, facts, and diff.

## Code style

- Small files. One job per file. No file over 200 lines.
- Pure functions in `lib/`. No database or network calls inside `facts.ts` or `rules.ts`.
- All thresholds live in `lib/config.ts`. No magic numbers anywhere else.
- Comments explain why, not what. No comment blocks, no README essays.
- User-facing words follow `docs/DESIGN.md` exactly.

## Folders

```
app/                 pages and API routes
components/          UI pieces
lib/                 facts.ts, jev.ts, rules.ts, gate.ts, db.ts, config.ts
scripts/             hook.mjs, replay.mjs, eval.mjs
scorecard/cases/     labeled diffs
demo-app/            tiny target repo the agent works on
docs/                specs (read-only for you unless I say so)
```
