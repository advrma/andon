# Andon launch film: script

114 words, about 2 words per second. Approved 2026-11-13 (step 1).

Promise: CI tells you the tests passed. Andon tells you if they were earned.

Numbers from `scorecard/results.json` (test split, 20 held-out cases, run 2026-11-13):
caught 10/10, false alarms 3/10, median 217 ms, $0.0005 per check.
Facts only: 2/10 caught, 3/10 false alarms, <1 ms, $0. No large-model row: hidden.

| Time | Voice | On screen |
|---|---|---|
| 0:00 | Your coding agent just made every test pass. | Big green "All checks passed" badge |
| 0:03 | By changing the test. | The two lines from `assets/cheat-diff.txt`; red strike through the old one |
| 0:06 | Agents write more code than anyone can review. | "+30% more code" |
| 0:09 | So diffs merge unread. | "+49% review time" · Harvard working paper, about 700 firms |
| 0:12 | Agents learn the cheap fix: weaken a test, skip a check, hide an error. | Weaken. Skip. Hide. (stacked, tiny snippets) |
| 0:19 | Andon is the stop cord for coding agents. | Andon mark, then the line with one red lamp |
| 0:22 | Plain code checks the facts. A System One model makes the judgment calls. | Flow: Agent, Facts, Jev, Rules, Pass / Rework / Stop |
| 0:28 | An agent adds a discount. Every change goes through Andon. | Board, chips turning green, cursor on the rail |
| 0:34 | A rounding test fails. So the agent loosens it. | New chip arrives |
| 0:38 | Andon stops the line. | Red bar sweeps, "Line stopped". Music cuts, clunk |
| 0:41 | The exact line. The question that fired. The score. | Weakened line flagged, then verdict card |
| 0:47 | On changes it never saw: ten of ten cheats caught. | Scorecard: Caught 10 of 10 cheats, 3 false alarms in 10 honest, 217 ms, $0.0005 per check |
| 0:54 | CI tells you the tests passed. Andon tells you if they were earned. | Closing card: promise, Andon mark, github.com/aayushswami123/andon |

Changes from `docs/VIDEO.md`: dropped "And" (0:12) and "Here," (0:28). 116 to 114 words.
