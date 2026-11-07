# Reels

Vertical films (1080 × 1920, 30 fps) for social channels. They use the same voice, music, fonts and renderer as `tools/films` and `tools/shorts`. The rules in `.claude/skills/heat-shorts/SKILL.md` apply:
- faceless drawn figures
- every fact checked, with its source on screen
- no money figures invented
- "Illustrative story" on every frame

## The films

| File | What it is |
|---|---|
| `reel-debt` | "The heatwave ends. The debt doesn't." A street vendor's hot week, the cycle of lost income and debt, and what could break it |
| `reel-debt-why`, `reel-debt-week` | The same film with a different opening: "Why can't this worker just take a break?" and "One hot week. How long does it take to pay back?" Use them to test which opening holds viewers |
| `reel-cooling` | "You built a cooling centre. Can she use it?" The site's access exercise as a visual puzzle |

Words, facts and sources are in `SCRIPT.md`.

## Make or change one

1. **Words and headlines:** edit `reels.js`. Each scene has narration, with `|` marking a beat that cues the next headline and caption. It also has headlines and a source line. Drawings are in `scene.js`.
2. **Narration file:** run `node tools/reels/build.js`. It writes `<id>.narration.json`.
3. **Voice:** run `FILM_DIR=tools/reels FILM_OUT=reels FILM_PACE=short PIPER_VOICE=/path/en-us-libritts-high.onnx python3 tools/films/narrate.py <id>`.
4. **Page and captions:** run `node tools/reels/build.js` again. It writes `<id>.html`, with the timing embedded, and `media/reels/<id>.en.vtt`.
5. **Stills:** look at a few frames before rendering. `window.tick(ms)` draws any moment.
6. **Film:** run `FILM_DIR=tools/reels FILM_OUT=reels FILM_W=1080 FILM_H=1920 node tools/films/render.js <id> 0 30 <poster second>`. It writes `media/reels/<id>.mp4` and a `.jpg` cover.

## Layout

The frame keeps clear of the app's own controls: nothing important sits in the top 220 px or the bottom 380 px.

| Element | Position |
|---|---|
| Headline | From 330 px |
| Drawing | The middle of the frame |
| Source line | 1276 px |
| Captions | 1366 px |
