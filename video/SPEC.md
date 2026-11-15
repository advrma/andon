# Andon launch film: storyboard and spec

GOAL:    A judge who has watched 60 seconds with the sound off can say what Andon does
         and quote one number: ten of ten cheats caught.
OUTPUT:  HyperFrames, 1920 x 1080, 30 fps, MP4. Captions burned in on every voice line.
TIME:    60 s = 1800 frames. Hard limit. No BPM grid; cuts follow the voice.

## Look (from docs/DESIGN.md, nothing else)

- Ground `#F7F7F5` (page). Cards `#FFFFFF`, 1 px `#E4E4E0` border, 12 px radius, no shadow.
  One exception: the verdict card, `0 1px 2px rgba(22,24,29,.06)`.
- Ink `#16181D`. Secondary `#5E6168`. Rule `#E4E4E0`.
- Verdict colours: pass `#1F8A5B` / `#E8F5EE`, rework `#B7791F` / `#FDF3DC`, stop `#D92D20` / `#FDECEA`.
  Diff add `#EAF7EF`, diff del `#FCEDEC`.
- The only accent in any shot is one verdict colour. Shots 1 to 4 use pass green for the badge,
  then stop red for the strike and the three words. No purple, no gradient, no glow, no dark frame.
- Display: Instrument Sans 600. Hero numbers 160 px, hero words 120 px, titles 64 px, body 32 px,
  captions 36 px / 500. Tabular numerals on every number. Sentence case. Nothing under 28 px.
- Code: JetBrains Mono 500, 44 px in shots 2 and 4, 15 px native inside the product recordings.
- Fonts are not bundled: fetch Instrument Sans (400/500/600) and JetBrains Mono (400/500) woff2
  into `assets/fonts/` and declare `@font-face` in step 3.
- Medium: a printed inspection report. Flat colour, sharp edges, no texture, no grain, no vignette.
  Product recordings sit in a browser card: white, 1 px rule, 12 px radius, 64 px margin to the
  frame edge, never stretched or cropped.
- Captions: one line, Instrument Sans 500 36 px ink, on a white card 12 px radius with 1 px rule,
  centred, bottom edge at y = 972 (inside 80% title-safe). Same place every shot. Words enter
  light grey to ink, 70 ms apart; no slide, no fade-up.

## Objects

- Andon mark: ink square, 8 px radius, drawn at 160 px in shot 5 and 120 px in shot 11.
  Wordmark "Andon" Instrument Sans 600 beside it. From the top bar of the real board.
- Verdict shapes: circle = Pass, triangle = Rework, square = Stop. Inline SVG, same as the board.
- Rail: 2 px rule line, chips 36 px white with the shape inside at 16 px. Stop chip 44 px,
  stop-soft fill, stop border, raised 4 px.
- Cursor: macOS arrow, black with white edge, 72 px tall in HTML shots, native (enlarged) in recordings.
- Browser card: white card with a 44 px top bar (three 12 px rule-coloured dots) holding the recording.

## Motion

- enter: `expo.out`, 400 ms. move / camera: `power2.inOut`, 500 ms. exit: `power3.in`, 200 ms.
- Zooms: 500 ms, `power2.inOut`, never past 1.6x, then hold at least 1.5 s. No zoom while text animates.
- Crossfades between sections: 300 ms. Film opens and closes with a 400 ms fade from / to `#F7F7F5`.
- Springs only on the stop chip: stiffness 400, damping 22 (framer values), as the board does it.
- Titles land and hold dead still. Numbers count up over 600 ms, `power3.out`, then hold.
- Cursor moves 500 ms `power2.inOut` and arrives one beat (about 400 ms) before the voice names its target.

## Sound

- Voice: calm, about 2 words a second. 13 lines, `assets/vo/01.mp3` to `13.mp3`, placed at the times below.
- Music: one royalty-free low steady pulse, -22 dB under the voice, 0:00 to 0:38. Cuts hard at 0:38.0
  (frame 1140). Returns at 0:41 at -28 dB, fades out over the last 2 s. No track ready: keep the silence.
- One sound effect: short low clunk at 0:38.0, with the red bar. Nothing else.

## Shots

Frame = seconds x 30. Each shot: hero move, what is read, sound, hand-off.

| # | Frames | Time | Shot | Camera (one move) | Sound | In |
|---|---|---|---|---|---|---|
| 1 | 0–89 | 0:00–0:03 | Green badge "All checks passed": pass-soft card 720 x 200, pass circle with check at 64 px, text 64 px pass green. Centred. | Slow push 1.0 to 1.1x over the full 3 s, `power1.inOut` | VO 1. Music starts under. | Fade from page colour, 400 ms |
| 2 | 90–179 | 0:03–0:06 | The two real lines from `assets/cheat-diff.txt`, JetBrains Mono 44 px, left aligned, 1120 px wide. Line 1 on diff-del, "-" in stop red. Line 2 on diff-add, "+" in pass green. At frame 105 a 4 px stop-red strike draws left to right through line 1 in 300 ms. `.toBe(99.99)` and `.toBeCloseTo(99.99, 1)` in ink 600; the rest at graphite. | None (the strike is the move) | VO 2 | Hard cut (the twist) |
| 3 | 180–359 | 0:06–0:12 | Two numbers, one at a time. 180–269: "+30%" at 160 px ink, counts 0 to 30 in 600 ms; label "more code" 48 px graphite below. 270–359: "+30%" slides left 50% scale to the left third; "+49%" lands right, counts up; label "review time". Source line 28 px graphite at y = 880: "Harvard working paper, about 700 firms". | None. Numbers count, then hold | VO 3 at 180, VO 4 at 270 | Crossfade 300 ms |
| 4 | 360–569 | 0:12–0:19 | "Weaken." "Skip." "Hide." stack at 120 px ink, left aligned at x = 240, 160 px apart, landing at 390, 450, 510 (word blurs in 6 px to 0, 130 ms). Beside each, a 36 px mono snippet in a diff-del card: `toBe` → `toBeTruthy`; `it.skip(`; `catch (e) {}`. The three full stops in stop red. | None | VO 5 | Crossfade 300 ms |
| 5 | 570–659 | 0:19–0:22 | 570–599: Andon mark 160 px centred, a fill rises through it 200 ms, "Andon" 96 px wipes in beside it. 600–659: the lockup shrinks to the top; below, a rail 1440 px wide with 8 chips (7 pass circles, 1 stop square raised 4 px). Above the stop chip a lamp: 24 px stop-red square on a 2 px ink stem. | Pull out 1.2 to 1.0x, 500 ms, from frame 600 | VO 6 | Crossfade 300 ms |
| 6 | 660–839 | 0:22–0:28 | Flow, left to right, five nodes on one row at y = 540: Agent · Facts · Jev · Rules · verdict. Nodes are white cards 240 x 120, 40 px labels. A 2 px ink connector draws between them, 250 ms each, nodes land as the line reaches them (660, 700, 740, 780). Under Facts: "plain code" 28 px graphite. Under Jev: "System One model". The last node splits into three chips: Pass circle, Rework triangle, Stop square, with words. | None | VO 7 | Crossfade 300 ms |
| 7 | 840–1019 | 0:28–0:34 | `assets/board-green.mp4` in the browser card. Real board: top bar "Task: Add a 10% discount for orders over $100. Totals round to cents.", "Line running". Three chips slide in and turn pass green. Cursor rests on the rail. | Push to the rail 1.0 to 1.4x, frames 930–945, hold | VO 8 | Crossfade 300 ms |
| 8 | 1020–1229 | 0:34–0:41 | `assets/board-stop.mp4`. 1020–1139: a fourth chip arrives. 1140 (0:38.0): the stop. Red bar grows across the top in 300 ms, stop chip drops with the spring, pill flips to "Line stopped", other chips fade to 45%. 1170–1229: hold on the pill. | 1020–1139 pull out 1.4 to 1.0x at the chip arrival; at 1140 hard cut to the full board; 1170 push to the status pill 1.0 to 1.3x | VO 9 at 1020. Music cuts at 1140. Clunk at 1140. VO 10 at 1140. Silence after | Hard cut at 1140 |
| 9 | 1230–1409 | 0:41–0:47 | Still `board-stop.mp4`. Cursor moves to the flagged diff line (`toBeCloseTo`, 3 px stop bar, "Weakened" label). Then to the verdict card: Stop square, "Stop", reason sentence, "Test checks less than before" bar in the red zone. | Push to the diff line 1.6x (1230–1245), hold to 1320, pan right to the verdict card at the same scale (1320–1335), hold | VO 11. Music back at 1230, softer | None (same recording) |
| 10 | 1410–1619 | 0:47–0:54 | `assets/scorecard.mp4`. Cursor clicks the Scorecard tab. "Caught 10 of 10 cheats" at 48 px, "3 false alarms in 10 honest". Table: Andon 10/10, 3/10, 217 ms, $0.0005. Facts only 2/10, 3/10, <1 ms, $0. No large-model row. Footer: "Held-out test split, 20 changes." Time and cost on screen, not spoken. | Push to the big number 1.3x (1440–1455), hold | VO 12 | Cursor click on the tab is the cut |
| 11 | 1620–1799 | 0:54–1:00 | Closing card on page colour. 1620: "CI tells you the tests passed." 56 px ink, left aligned at x = 240, y = 420. 1680: "Andon tells you if they were earned." same size, "earned" in pass green. 1710: mark 120 px + "Andon" lockup above the lines, fill rises 200 ms. 1740: `github.com/aayushswami123/andon` 32 px graphite below. Holds to 1788. | None | VO 13. Music fades out 1740–1800 | Crossfade 300 ms in; fade to page colour over 1788–1799 |

Caption per shot: the voice line, verbatim from SCRIPT.md, landing with the VO start, leaving 200 ms before the next.

## Assets (state after the step 3 build, 2026-11-13)

| File | State | Note |
|---|---|---|
| `assets/cheat-diff.txt` | present | shot 2 |
| `assets/board-*.mp4`, `assets/scorecard.mp4` | not recorded | Board rebuilt in HTML (`compositions/board.html`, `stop.html`, `score.html`) from DESIGN.md with the real task line, demo diffs d01–d04 and results.json numbers. Per-check Jev scores on the Live board (0.11/0.06/0.04 for the honest check, 0.91/0.38/0.14/0.07 for the cheat) are illustrative until a live replay supplies them |
| `assets/fonts/InstrumentSans.woff2` | present | variable 400–600, Google Fonts (OFL). JetBrains Mono is bundled |
| `assets/vo/01..13.wav` + `.words.json` | present | Cartesia TTS, voice `cc00e582…`, silence trimmed, word timings drive the captions (`tools/build-captions.mjs`) |
| `assets/sfx/*.mp3` | present | HyperFrames bundled library (Pixabay licence): `clunk.mp3` = impact-bass-1 (peak 0.073 s, placed 37.96 so it lands at 38.03), `pop`, `click-soft`, `key-press`, `whoosh-short`. Each placed so its peak lands one frame after its picture |
| `assets/music/pulse.wav` | present, stand-in | synthesized low pulse, −33 LUFS. Clip A 0–38.0 (hard cut), clip B 41–60 at 0.55 with a 2 s fade. Swap for a licensed track when one is available |

Deviations from the storyboard: shot 2 mono is 36 px (44 px overflowed the safe box); the scorecard
push is 1.2x with the origin right of centre so the whole hero row stays in frame; the pill text is
`#176b47` / `#b42318` on the soft fills to pass 4.5:1 (DESIGN.md's own quality floor).

## Banned

Dark ground; glow, bloom, particles; gradients, glass cards; serif display, italic accent words,
"01 / 02" labels; everything centred; everything fading in at once; fade-and-slide-up on titles;
titles that drift after landing; corner labels, frame borders, HUD decoration; three cards in a row;
a title over a dimmed screenshot; the logo docked in a corner; an intro logo card; a zoom during text
animation; a zoom past 1.6x; any number not in `scorecard/results.json`; a stretched or cropped
product recording; emoji; all-caps.

## QA frames

| Frame | Must show |
|---|---|
| 0 | Page colour only, badge not yet visible |
| 60 | Badge full, caption 1 readable |
| 105–115 | Strike mid-draw through line 1, line 2 untouched |
| 300 | Both numbers landed, source line readable at 28 px |
| 510 | All three words landed and still; full stops red |
| 640 | Rail with 7 pass chips and 1 raised stop chip under the lamp |
| 780 | Four nodes landed, connector reaching the fifth |
| 945 | Rail at 1.4x, chip text at least 26 px, cursor visible |
| 1140 | Red bar starting; chip at top of its drop; music gone |
| 1245 | `toBeCloseTo` line at 1.6x with "Weakened" label; text at least 26 px |
| 1455 | "Caught 10 of 10 cheats" at 1.3x |
| 1788 | Full closing card; URL readable |
| 1799 | Page colour |
