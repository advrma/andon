# Andon launch film: review and delivery note

## v2 (continuous motion), 2026-11-13: draft stage

- Structure: three compositions handed off through an identical object at each seam, no cuts or crossfades.
  `act1` (0–25.2 s): badge → added diff line → strike → the line lifts and its copies pile up faster than the
  review queue drains (+30% / +49%, small, unspoken) → the line glows, the strike splits into Weaken. Skip. Hide.
  → the words collapse into a dot → the dot becomes chip 1, the rail draws, more chips land → four chips open
  into Agent / Facts / Jev / Rules, a verdict dot lands at the end → the dot flies to where chip 1 sits on the
  board. `board2` (24.6–48.4): the board builds around that dot; one camera path on a single transform origin
  (push to the rail, chips 2–3 green, chip 4 arrives, the stop at 31.0, pull back for the red bar, push to the
  weakened line, glide to the verdict card, pull back); the top score bar rises out of the card and becomes
  "10 of 10" in the scorecard's hero slot; the scorecard builds around it; the red stop square grows from the
  status pill to the centre. `close2` (48.2–60): the square turns ink and becomes the Andon mark; the promise.
- Voice cut to 50 words in 6 lines (Cartesia, same voice). Captions only on spoken lines, 12 groups.
- Sound: pops on landings, key ticks on the three words and four nodes, whoosh on the split, the impact one
  frame after the stop at 31.0, then about a second of silence. Bed ducked ~10 dB under the voice through
  `data-automation`, builds through the green chips, cut on the stop frame, back softer at 32.1, 2 s fade at the
  end. `assets/music.mp3` was not present, so the synthesized pulse still stands in.
- Registry searched for morph / match-cut / carry-across / FLIP (`match-cut`, `modal-morph`, `code-morph`
  exist); every morph here is between specific objects, so they are hand-built on the match-cut pattern.
- Kept on purpose: the slow continuous camera push through act 1 (asked for), the empty first frame (fade
  from page colour), the board's native 15 px type (the pushes bring the named lines to 24–29 px).
- v1 scenes are in `archive/v1-compositions/`; the v1 final is `renders/andon-final.mp4`.

---

# v1 delivery note (kept for reference)

Final: `renders/andon-final.mp4`, 1920 x 1080, 30 fps, 60.0 s, `--quality delivery`. 2026-11-13.

## Creative calls

- Storyline is the one in `docs/VIDEO.md`: hook (the green check and the loosened test), tension (unread diffs,
  the three cheap fixes), reveal (the stop cord, the flow), proof (the board, the stop, the scorecard), claim.
  No alternative storylines were built; the brief fixed this one.
- The board is an HTML rebuild of the real UI from `docs/DESIGN.md`, not a screen recording: real task line,
  the real demo diffs d01–d04, real `scorecard/results.json` numbers. The per-check Jev scores on the Live
  board are illustrative until a live replay supplies them. Stated here and in `SPEC.md`.
- Voice is Cartesia TTS (the person's voice id). Every caption and the word-synced moments (Weaken / Skip /
  Hide, the flow nodes, chip 4, "Andon tells you") are timed from the TTS word timestamps.
- The stop at 0:38 is the one bold moment: music cuts, a low impact lands one frame after the red bar, the voice
  follows. Everything else stays quiet: pops on numbers and chips, key ticks on the words and nodes, one whoosh
  on the 0:03 cut, one soft click on the tab.
- The music bed is a synthesized low pulse (110 + 165 Hz, 84 BPM tremolo, −33 LUFS) because no catalog track was
  reachable (the free route needs the `heygen` CLI; generation needs a plan). It is a stand-in: swap
  `assets/music/pulse.wav` for a real track and keep the two clips' timing (cut at 38.0, softer return at 41.0).

## Measured vs looked at

- `npx hyperframes check`: 0 errors. Layout, contrast (4.5:1 on every text), runtime all pass.
- Frames: beat sheets, 15 seam strips and the phone sheet from `snapshot --review`, plus targeted frames after
  every fix. All read; the camera chain in the stop scene (rail → full → pill → line → card → full) has no jumps.
- Audio of the draft render: −19.4 LUFS integrated, true peak −1 dBTP, no clipping, voice present in every slot,
  the hit onset at 38.0. The final is measured the same way after render. Nobody has listened to it.
- Not checked by anyone: how the synthesized bed sounds in a room; whether the Cartesia voice's pacing suits the
  speaker's live intro.

## Weakest shot

Shot 5 (0:19–0:22, the mark and the line with one red lamp). The rail reads as a metaphor but is small on a
1920 frame; with more time it would be the real board's rail scaled up, with the lamp as the product's own
stop chip pulled above the line.

## Warnings kept on purpose

- `first_frame_empty`: VIDEO.md asks for a fade from the page colour; the badge is up by 0.4 s.
- `text_below_floor` / `line_unread` on the board scenes: the product UI is 15 px type at its real size; the
  pushes (1.4x, 1.6x) bring the lines the voice names up to 24–29 px. The rest is context, not reading text.
- `timeline_track_too_dense` on captions: captions.md asks for one host holding every group.
- `duplicate_audio_track` (vo01 vs vo02, 40 ms): fixed by trimming vo01's slot to 2.69 s.

## With more time

Record the three board takes per `docs/VIDEO.md` §3 and drop them into the browser card in place of the HTML
rebuild; replace the pulse with a licensed track; replay d04 live and copy the real Jev scores into
`stop.html`; a second Cartesia pass with slightly slower pacing on lines 7 and 8.
