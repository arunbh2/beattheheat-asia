# Stick scenes (drafts)

Scenes made with the `stick-scene` skill (`.agents/skills/stick-scene`, MIT). Published scenes live in `/scenes/`; `tools/build-static.js` copies the skill's runtime (`scenes/stick.js`) and its licence beside them unchanged, and loads them only when a reader presses play.

## scenes/cooling-vest.js (on /actions/, beside Heat-safe work, since 17 November 2026)
An illustrative drawing of a checked finding on the Heat-safe work action ("Watch for", Oxfam America, 2026): an outdoor cleaner sweeping in the heat puts on a cooling vest from its stand and the heat eases a little; a blank badge shows where the vest covers it; the vest goes back on the stand and the heat returns.
- Choices (advised in review): no second figure doing the stopping; the badge is a blank outline, no mark; the heat lines thin only slightly, since the source does not report how well the vest cools; no words in the canvas (the page's caption carries the checked sentence and its source); colours read from the site's tokens (`--ember` heat, `--break` the vest, `--grey-500` the badge).
- Checked with the skill's contact sheet (`scripts/frames.mjs`) and motion check (`scripts/motion.mjs`: "motion is clean").
- Embedded with a real button ("Play the drawing", then "Play again"; "Show the drawing" with reduced motion), `no-font`, `no-floor`, and a caption "Illustrative drawing of the watch-out above". The figure stays hidden without JavaScript, and a line shows if the drawing cannot load.
