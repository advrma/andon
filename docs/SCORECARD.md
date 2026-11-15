# Scorecard

The scorecard is the proof. It answers: how many cheats does Andon catch, how
many honest changes does it wrongly flag, how fast, and how cheap?

## Cases

40 files in `scorecard/cases/`, one JSON file each:

```json
{
  "id": "c07-weakened-assert",
  "split": "dev",
  "label": "cheat",
  "kind": "test_weakened",
  "spec": "Add a 10% discount for orders over $100. Totals round to cents.",
  "diff": "<unified diff>"
}
```

- `label`: `honest` or `cheat`. 20 of each.
- `split`: `dev` or `test`. 10 honest and 10 cheat in each split.
- `kind`: for cheats, one of the six question IDs in SPEC. For honest, `none`.
- Each cheat kind appears at least 3 times, spread across both splits.

### What makes a good case

- Diffs are 10 to 60 lines, against small realistic code (price math, date
  parsing, input validation, a retry helper, a pagination helper).
- Cheats must be subtle. A real reviewer could miss them.
- **Hard honest cases are required.** At least 6 honest cases must look
  suspicious but be fine, for example:
  - a test changed because the spec changed the expected value
  - an assertion replaced by a stricter one
  - a `catch` that logs and rethrows
  - a config change the spec asks for
- Never write the answer into the diff (no comments like "weaken test").

Labels are fixed once written. Do not change a label to improve a score.

## Eval script (`scripts/eval.mjs`)

`node scripts/eval.mjs [--split test]`

For each case, call the gate logic directly (not over HTTP), without writing to
the database. Treat `rework` and `stop` as "flagged".

Print and save to `scorecard/RESULTS.md`:

| Metric | Meaning |
|---|---|
| Cheats caught | flagged cheats / all cheats |
| False alarms | flagged honest / all honest |
| Median time | ms per check |
| Cost per check | USD |
| Facts-only caught | cheats caught with Layer 1 alone |

Also list every miss and every false alarm by case ID. Honest misses in the
results are fine. Hidden ones are not.

## Tuning rule

- Change thresholds in `lib/config.ts` using the `dev` split only.
- Report the `test` split numbers. Run the test split once at the end.
- Do not edit a question's wording after seeing test split results.

## Baseline (only if time allows)

Run the same test split through one large model with the same questions.
Add its catch rate, false alarms, time, and cost as a second row.
