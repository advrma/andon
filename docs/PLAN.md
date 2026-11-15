# Build plan

Do tasks in order. One task per session. Tick the box when its check passes.
Tasks marked (cut) are dropped first if time runs short. Never cut task 8.

- [x] **1. Scaffold.** Next.js app with TypeScript strict, Tailwind, Vitest.
  Folders from CLAUDE.md. `.env.example` with `DATABASE_URL`,
  `TYPESAFE_API_KEY`, `OPENROUTER_API_KEY`, `JEV_MOCK`, `SENTRY_DSN`.
  Create `demo-app/` per SPEC "Demo target".
  *Done when:* `npx tsc --noEmit` passes.

- [x] **2. Fact checks.** `lib/facts.ts` per SPEC Layer 1, with
  `lib/facts.test.ts`: one true case and one false case per key.
  *Done when:* `npx vitest run lib/facts.test.ts` passes.

- [x] **3. Rules.** `lib/config.ts` and `lib/rules.ts` per SPEC Layer 3
  (skip rule 4), with `lib/rules.test.ts`: one case per rule.
  *Done when:* `npx vitest run lib/rules.test.ts` passes.

- [x] **4. Judgments.** `lib/jev.ts` and `lib/jev.mock.ts` per SPEC Layer 2.
  Read the TypeSafe quickstart first.
  *Done when:* `tsc` passes and a one-off script prints real answers for one
  sample diff with latency. Delete the one-off script after.

- [x] **5. Gate and data.** `lib/db.ts`, `db/schema.sql`, `lib/gate.ts`, and
  all routes in SPEC "API".
  *Done when:* `curl` to `/api/gate` with a sample body returns a verdict and
  a row appears in `events`.

- [x] **6. Replay.** `scripts/replay.mjs` per SPEC. Add 4 cases to
  `scorecard/cases/` per SCORECARD.md (2 honest, 2 cheat) to test with.
  *Done when:* replaying a cheat case returns `stop` or `rework`.

- [x] **7. Board UI.** The one page per DESIGN.md, including the line stop and
  "Resume line". Read DESIGN.md fully first. Polls every second.
  *Done when:* `tsc` passes. I will check the look myself.

- [x] **8. Scorecard.** Remaining cases and `scripts/eval.mjs` per SCORECARD.md.
  Tune `lib/config.ts` on the dev half only. Write results to
  `scorecard/RESULTS.md`.
  *Done when:* `node scripts/eval.mjs` prints the results table.

- [x] **9. Hook.** `scripts/hook.mjs` per SPEC. Read the Claude Code hooks docs
  first. From this task on, Andon gates its own repo.
  *Done when:* an edit in `demo-app/` shows up on the board.

- [x] **10. Sentry.** Init in the app and in `lib/jev.ts` error paths.
  *Done when:* a forced error appears in Sentry.

- [x] **11. (cut) Escalation.** SPEC "Escalation" and rule 4.
  *Done when:* an unsure case shows `escalated` on the board.

- [x] **12. (cut) Stats from Tiger Data.** A continuous aggregate for checks
  per minute by verdict, used by `/api/stats`.
  *Done when:* `/api/stats` reads from the aggregate.

- [x] **13. README.** 40 lines or fewer: what it is, the results table,
  how to run, how it was built (the factory). No more.
  *Done when:* the file exists.
