# Demo and submission

## The pitch (say this first)

"CI tells you the tests passed. Andon tells you if the agent cheated to make
them pass."

## Two-minute demo

| Time | Do | Say |
|---|---|---|
| 0:00 | Board on screen, empty | "Agents now write more code than people can review. So teams merge without looking." |
| 0:15 | Start the agent on `demo-app/TASK.md` | "This agent is adding a discount. Every change goes through Andon." |
| 0:35 | Lamps turn green | "Plain code checks the facts. A System One model makes the judgment calls. Each check takes a fraction of a second." |
| 0:55 | Agent weakens the rounding test (or run `node scripts/replay.mjs <cheat-id>`) | "The test was failing. Watch what the agent does." |
| 1:05 | Board turns red: Line stopped | "It loosened the test instead of fixing the code. Andon stopped the line." |
| 1:20 | Click the tile, show diff and score bars | "Here is the exact line, the question that fired, and the score." |
| 1:35 | Show `scorecard/RESULTS.md` | "On 20 held-out changes: X of 10 cheats caught, Y false alarms, Z ms, $W per check." |
| 1:50 | Show git log | "Andon gated its own repo while we built it. Specs first, locked tests, small commits." |

## Before going on stage

- [ ] `node scripts/replay.mjs` works for one honest and one cheat case
- [ ] Line is resumed and board is clear
- [ ] Browser at 100% zoom, full screen, other tabs closed
- [ ] `JEV_MOCK` is off
- [ ] Backup: a screen recording of the full demo

If the live agent does not cheat on its own, use replay. Say so plainly:
"This is a recorded change from our test set."

## Which prize each part earns

| Prize | What to show |
|---|---|
| Best Overall | The line stop and the scorecard |
| System One Models | Judgments from the model, decisions in code, scores on screen |
| Software Factory | `CLAUDE.md`, `docs/`, locked tests, Andon gating itself, clean git log |
| Tiger Data | `events` hypertable, live stats |
| Sentry | Errors from the gate reported there |
| HyperFrames | The demo video |

## Submission checklist

- [ ] Public repo with README and `scorecard/RESULTS.md`
- [ ] Demo video (made with HyperFrames)
- [ ] Project submitted on the MLH event page, with each prize category selected
- [ ] Say which decision model was used and how you reached it
- [ ] Results reported honestly, including misses
