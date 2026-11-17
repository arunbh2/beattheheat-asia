# Stick scenes (drafts)

Scenes made with the `stick-scene` skill (`.agents/skills/stick-scene`, MIT). Drafts here are not on any page yet: embedding one adds the skill's runtime (`runtime/stick.js`, about 14 KB gzipped) to a page, which waits for the owner's approval.

## cooling-vest.js
An illustrative drawing of a checked finding on the Heat-safe work action ("Watch for", Oxfam America, 2026): an outdoor cleaner sweeping in the heat puts on a cooling vest from its stand and the heat eases a little; a blank badge shows where the vest covers it; the vest goes back on the stand and the heat returns.
- Choices (advised in review): no second figure doing the stopping; the badge is a blank outline, no mark; the heat lines thin only slightly, since the source does not report how well the vest cools; no words in the canvas (the page's caption carries the checked sentence and its source); colours read from the site's tokens (`--ember` heat, `--break` the vest, `--grey-500` the badge).
- Checked with the skill's contact sheet (`scripts/frames.mjs`) and motion check (`scripts/motion.mjs`: "motion is clean").
- If embedded: `play="click"` from a real button, `no-font`, a `figure` with the caption "Illustrative drawing" and the existing checked sentence, load the runtime only when the reader presses play, and update `tools/ai-use-text.js` (a new kind of generated media) in the same pull request.
