# Andon design rules (v2)

This file replaces the old DESIGN.md. Follow it exactly.

## The feel

Light, calm, and precise, like a clean inspection report.
Think Vercel deployment logs or Linear: white space, sharp type, one clear
story per screen. Smooth motion only where it means something.

The screen is shown on a projector to judges a few meters away.
Light themes read better on projectors, so this is light only.

One bold moment: **the line stop**. Everything else stays quiet.

## Stack for the UI

- Tailwind + shadcn/ui (button, tooltip, tabs, input, scroll-area only)
- framer-motion for motion
- lucide-react only for small UI icons (copy, play, check). Verdict shapes are
  our own inline SVG.
- No other UI packages. No OpenUI (it generates UI at runtime from a model,
  which this board does not need).

## Tokens

```css
:root {
  --surface:   #F7F7F5;  /* page */
  --card:      #FFFFFF;  /* panels */
  --ink:       #16181D;  /* headings, body, primary buttons */
  --graphite:  #5E6168;  /* secondary text */
  --rule:      #E4E4E0;  /* borders, rail */

  --pass:      #1F8A5B;  --pass-soft:   #E8F5EE;
  --rework:    #B7791F;  --rework-soft: #FDF3DC;  /* text on soft uses #8A5A00 */
  --stop:      #D92D20;  --stop-soft:   #FDECEA;

  --diff-add:  #EAF7EF;  --diff-del:    #FCEDEC;
}
```

- The only "accent" is the verdict color of the selected check. No purple,
  no brand gradient.
- Primary buttons: ink background, white text, 8px radius.
- Panels: white, 1px `--rule` border, 12px radius, no shadow.
  One exception: the verdict card gets `0 1px 2px rgba(22,24,29,.06)`.
- Color is never the only signal. Every verdict shows its word and its shape:
  Pass = circle, Rework = triangle, Stop = square.

## Type

- `Instrument Sans` (400, 500, 600) for all UI text. Use `tabular-nums` for
  every number.
- `JetBrains Mono` (400, 500) for diffs and code only.
- Load both with `next/font/google`. Fallbacks: `system-ui`, `ui-monospace`.

Scale (px): 15, 17, 20, 24, 32, 48. Nothing under 15.
Sentence case. No all-caps. No letter-spacing tricks.
Every number has a label next to it. Never a bare "0.15s".

## Layout

One page, two views: **Live** and **Scorecard** (shadcn Tabs in the top bar).
Built for 1440x900. Max content width 1360px, centered, 32px side padding.

```
+--------------------------------------------------------------------------+
| [mark] Andon      Task: Add a 10% discount for orders over $100          |
|                                                    [Live] [Scorecard]    |
| (status pill) Line running   Checks 31   Caught 4   Avg time 0.15 s   Cost $0.01 |
+--------------------------------------------------------------------------+
|  THE LINE                                                                |
|  --o----o----o----^----[#]----o----o----o--   (rail, newest on right)    |
|    1    2    3    4    5     6    7    8                                 |
+------------------------------------------+-------------------------------+
|  CHANGE VIEWER                           |  VERDICT CARD                 |
|  Check 12   2 files changed              |  [shape] Stop                 |
|  [dates.ts] [dates.test.ts]  (file tabs) |  Reason sentence, 20px        |
|                                          |                               |
|   14  - expect(d).toEqual(new Date(..))  |  What fired                   |
|   14  + expect(d).toBeTruthy()      <--  |  Test checks less   ===|  0.91|
|                                          |  Outside the task   =|    0.22|
|                                          |                               |
|                                          |  Facts                        |
|                                          |  (chip) Assertion weakened    |
|                                          |                               |
|                                          |  Check time 0.18 s  Cost $0.0003 |
+------------------------------------------+-------------------------------+
```

Columns: change viewer 62%, verdict card 38%. 24px gap. Left-aligned text.
The page never scrolls. Panels scroll inside with shadcn ScrollArea.

### Top bar

- Left: a small square mark (ink, 20px) and "Andon" at 20px/600.
  Next to it, the task in graphite: "Task: " + first line of `demo-app/TASK.md`.
- Right: Live / Scorecard tabs.
- Second row: status pill, then four labeled stats.
  - Status pill: "Line running" with a 8px pass-colored dot that pulses
    softly (opacity 1 to 0.4, 2s loop). Stopped: stop-soft background,
    stop text, square dot, no pulse.
  - Stats: label in graphite 15px, value in ink 20px/600.
    "Checks", "Caught" (rework + stop count), "Avg time", "Cost".

### The line

A horizontal rail (2px `--rule` line) with one chip per check, like parts on
a conveyor. Keep the last 30. Newest on the right; auto-scroll to it.

- Chip: 36px, 8px radius, white, 1px rule border, verdict shape inside (16px)
  in verdict color. Check number under it, 15px graphite.
- Selected chip: 2px border in its verdict color, and soft verdict background.
- Stop chip: 44px, stop-soft background, stop border. It sits higher on the
  rail by 4px so it reads as "pulled".
- Rework chips: rework-soft background.
- Hover (shadcn Tooltip): "Check 12: Stop. Test checks less than before."
- Chips are `<button>`s. Arrow keys move selection.

### Change viewer

- Header: "Check 12", "2 files changed", time ago ("12 s ago").
- File tabs: one per file, file name only, full path in tooltip.
- Diff body: parse the unified diff ourselves. Strip `diff --git`, `index`,
  `new file mode`, `---`, `+++` lines. Show hunks with old and new line
  numbers in a graphite gutter.
  - Added lines: `--diff-add` background, ink text, "+" in pass color.
  - Removed lines: `--diff-del` background, ink text, "-" in stop color.
  - Context lines: plain.
- Flagged lines: if a fact or the top question points at a line (for example
  an assertion that was weakened), add a 3px left bar in the verdict color
  and a small label at the end of the line: "Weakened".
  Do this with a simple regex match on the same patterns as `lib/facts.ts`.
- Open the file tab that has the flagged line first. Default: test file first.
- Mono 15px, line height 1.6. Long lines scroll sideways inside the panel.

### Verdict card

Top to bottom:
1. Verdict row: shape (24px) and word at 32px/600 in verdict color.
2. Reason: one sentence, 20px, ink. Pass shows "No problems found."
3. "What fired": the asked questions sorted high to low. Each row:
   - label (17px) on the left, value on the right (17px/600 tabular)
   - under it, a 8px bar split into three soft zones:
     0 to 0.35 pass-soft, 0.35 to 0.75 rework-soft, 0.75 to 1 stop-soft.
     A filled ink bar shows the score. No tick marks.
   - Questions not asked: one muted line at the bottom, "3 questions not asked".
4. "Facts": chips (rounded-full, rule border, 15px). Only facts that fired.
   None: "No facts fired."
5. Footer row, graphite: "Check time 0.18 s" and "Cost $0.0003".
   If escalated: "Sent to a large model".

## The line stop (the one bold moment)

When a new event has verdict `stop`, run this once, in order:

1. The rail stops: new chips stop sliding in (they still queue).
2. The stop chip drops onto the rail with a spring (framer-motion,
   stiffness 400, damping 22).
3. A 4px stop-colored bar grows across the very top of the page, left to
   right, 300ms.
4. The status pill flips to "Line stopped".
5. The verdict card border turns stop color. Under the reason, an inline
   form appears: an input "What did you check?" and an ink button "Resume line".
6. In the diff, the flagged line flashes stop-soft once (400ms) and scrolls
   into view.
7. Other chips fade to 45% opacity.

Resume: the top bar shrinks back, chips return to full opacity, the pill says
"Line resumed" for 2 s, then "Line running".

No other motion except:
- new chips slide in from the right (200ms ease-out)
- score bars animate width when the selection changes (200ms)
- tab switch crossfade (150ms)

`prefers-reduced-motion`: all of the above become instant.

## Scorecard view

Reads `scorecard/results.json` (written by `scripts/eval.mjs`).

```
+--------------------------------------------------------------+
|  Caught 9 of 10 cheats           1 false alarm in 10 honest  |
|  (48px numbers, 17px labels)                                 |
+--------------------------------------------------------------+
|              Caught   False alarms   Median time   Cost/check |
|  Andon        9/10        1/10         180 ms      $0.0003    |
|  Facts only   5/10        0/10           2 ms      $0         |
|  Large model  9/10        2/10        4.2 s        $0.012     |
+--------------------------------------------------------------+
|  Misses and false alarms                                     |
|  c14-special-case   missed   "Hard-coded for the test" 0.31  |
+--------------------------------------------------------------+
|  Held-out test split, 20 changes. Thresholds tuned on a      |
|  separate dev split.                                         |
+--------------------------------------------------------------+
```

- Andon row is ink and 600 weight. Other rows graphite.
- If the large model row has no data, hide it. Never show fake numbers.
- Each miss row is clickable and opens that case in the Live view.

## Words

| Thing | Text |
|---|---|
| verdicts | Pass, Rework, Stop |
| line states | Line running, Line stopped, Line resumed |
| resume input | What did you check? |
| resume button | Resume line |
| empty live view | No checks yet. Run the agent or replay a case. |
| API down | Can't reach the gate. Check that the server is running. |
| no results file | No scorecard yet. Run node scripts/eval.mjs. |

Question labels:

| ID | Label |
|---|---|
| `test_weakened` | Test checks less than before |
| `fake_test` | Test doesn't check the task |
| `special_case` | Hard-coded for the test |
| `error_hidden` | Error hidden, not fixed |
| `check_disabled` | A check was turned off |
| `out_of_scope` | Outside the task |

Fact labels: "Test file changed", "Assertion removed", "Assertion weakened",
"Test skipped", "Check silenced", "Config changed", "Empty catch",
"Test has no assert".

## Do not

- No dark theme. No gradients. No glows. No glassmorphism.
- No identical card grid. No shadows except the one on the verdict card.
- No spinners. Keep showing the last data until new data arrives.
- No emoji. No all-caps labels. No "A · B · C" meta strings.
- No mobile layout. Min width 1280px.

## Quality floor

- Text contrast at least 4.5:1. Rework text on soft background uses #8A5A00.
- Visible focus: 2px ink outline with 2px offset.
- All clickable things are real buttons.
- Check the stop moment at 1440x900 before calling it done.
