# Andon launch video plan

A 60-second launch film, YC style: hook first, product second, proof last.
Made with HyperFrames. Built in four steps: script, storyboard, build, polish.
Do not one-shot it.

## How it fits the 2-minute slot

| Time | What |
|---|---|
| 0:00 to 0:30 | You talk, live. Name, one-line pitch, who it's for. |
| 0:30 to 1:30 | This video plays. Do not talk over it. |
| 1:30 to 2:00 | Questions, or click around the live board. |

The video must work with the sound off too. Burned-in captions on every line.

## The one promise

"CI tells you the tests passed. Andon tells you if they were earned."

## Rules for the whole film

- First frame is the problem, not a logo. No intro card.
- One idea per shot. One camera move per shot.
- Zooms: ease in-out, 500 ms, max 1.6x. Hold 1.5 s after each zoom so people can read.
- Never zoom while text is animating.
- Between sections: 300 ms crossfade. Start and end: fade from and to the page color.
- A visible cursor in every product shot. It moves to the thing the voice is talking about, a beat before the voice says it.
- Colors and fonts come from `docs/DESIGN.md`. Light theme. Instrument Sans and JetBrains Mono.
- Voice: calm, confident, about 2 words per second. Full script is about 115 words.
- Music: low, steady pulse. It cuts to silence at the line stop, then comes back softer.
- Only real numbers from `scorecard/results.json`. If a number is missing, leave the shot out.

## 1. Script

About 115 words, about 2 words per second, so the voice never rushes.

| Time | Voice | On screen |
|---|---|---|
| 0:00 | "Your coding agent just made every test pass." | Green "All checks passed" badge, big |
| 0:03 | "By changing the test." | The two real lines from `video/assets/cheat-diff.txt` |
| 0:06 | "Agents write more code than anyone can review." | "+30% more code" |
| 0:09 | "So diffs merge unread." | "+49% review time". Small source line: "Harvard working paper, about 700 firms" |
| 0:12 | "And agents learn the cheap fix: weaken a test, skip a check, hide an error." | Three words stack: Weaken. Skip. Hide. |
| 0:19 | "Andon is the stop cord for coding agents." | Andon mark, then the line metaphor |
| 0:22 | "Plain code checks the facts. A System One model makes the judgment calls." | Flow: Agent, Facts, Jev, Rules, verdict |
| 0:28 | "Here, an agent adds a discount. Every change goes through Andon." | Board, chips turning green |
| 0:34 | "A rounding test fails. So the agent loosens it." | New chip arrives |
| 0:38 | "Andon stops the line." | Red bar sweeps, "Line stopped" |
| 0:41 | "The exact line. The question that fired. The score." | Weakened line, then verdict card |
| 0:47 | "On changes it never saw: [X] of 10 cheats caught." | Scorecard. Time and cost shown on screen, not spoken |
| 0:54 | "CI tells you the tests passed. Andon tells you if they were earned." | Closing card + repo URL |

Fill [X] from `scorecard/results.json` (test split). Hard limit: 60 seconds.

## 2. Storyboard

| # | Time | Shot | Camera | Transition in |
|---|---|---|---|---|
| 1 | 0:00 to 0:03 | Green check badge, centered, on page color | Slow push 1.0 to 1.1x | Fade from page color |
| 2 | 0:03 to 0:06 | The two lines from `cheat-diff.txt`, removed and added | Hard cut. Red strike draws through the old line | Hard cut (the twist) |
| 3 | 0:06 to 0:12 | Big numbers, one at a time: +30% code, +49% review time, with a small source line | None. Numbers count up | Crossfade |
| 4 | 0:12 to 0:19 | "Weaken. Skip. Hide." stacked, each with a tiny code snippet | None | Crossfade |
| 5 | 0:19 to 0:22 | Andon mark, then a factory line with one red lamp | Pull out 1.2 to 1.0x | Crossfade |
| 6 | 0:22 to 0:28 | Flow diagram: Agent, Facts, Jev, Rules, Pass/Rework/Stop. Draws left to right | None | Crossfade |
| 7 | 0:28 to 0:34 | Screen recording: board, chips turning green. Cursor rests on the line | Push to the line, 1.0 to 1.4x | Crossfade |
| 8 | 0:34 to 0:41 | The stop moment: red bar, chip drop, "Line stopped" | Pull out to full board at the stop, then push to the status pill | Hard cut on the stop |
| 9 | 0:41 to 0:47 | Cursor moves to the weakened diff line, then to the verdict card bars | Push to diff line 1.6x, hold, pan to verdict card | None |
| 10 | 0:47 to 0:54 | Scorecard tab: "Caught X of 10 cheats" and the comparison table | Push to the big number 1.3x | Cursor clicks the Scorecard tab |
| 11 | 0:54 to 1:00 | Closing card: promise line, Andon mark, repo URL | None | Crossfade, then fade to page color |

## 3. Assets to capture first

The demo footage must match the story: the discount task in `demo-app/`.
Do not use the scorecard cases (they are about other code, like dates).

Before recording:
- Create `demo/cases/` with 3 honest steps and 1 cheat for the discount task.
  The cheat loosens the rounding test in `demo-app/src/price.test.ts`.
  These are demo cases only. They are not part of the scorecard.
- Clear the board: empty the `events` table and resume the line.
- Make the cursor bigger: System Settings, Accessibility, Display, Pointer size.
- Turn on Do Not Disturb. Hide the bookmarks bar. Browser at 100% zoom.

Record with the cursor visible. Save into `video/assets/`.

| File | What to record |
|---|---|
| `board-green.mp4` | Replay the 3 honest demo cases. Chips turn green. 8 seconds. |
| `board-stop.mp4` | Replay the demo cheat. Full stop moment. Then move the cursor to the weakened line, then to the verdict card. 15 seconds. |
| `scorecard.mp4` | Click the Scorecard tab. Rest the cursor near the big number. 6 seconds. |
| `cheat-diff.txt` | The removed and added lines from the demo cheat. |

The recordings will not be exactly 16:9. That is fine: place every recording
inside a framed browser card on the page color, with a soft margin. Never
stretch or crop the product UI.

Shots 1 to 6 and 11 are built in HTML, not recorded.

## 4. Build and polish

- Build each section as its own sub-composition.
- Render a draft at low quality first. Watch it once with sound, once without.
- Polish pass: timing to the voice, caption line breaks, zoom holds, music level
  under the voice, one sound effect at the line stop (a short, low "clunk").
- Music: use a royalty-free track only. If none is ready, skip music and keep the
  silence-then-clunk at the line stop.
- Final render: 1920x1080, 30 fps, MP4. Keep a local copy for the demo. Do not
  stream it from the web on stage.
