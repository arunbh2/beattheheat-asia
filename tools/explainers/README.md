# Glossary explainers

The second set of glossary films, in the style of the first: 1920 × 1080, a logo header, captions burned into the picture,
a progress bar, a dark opening question, then diagrams that move on the word that names them.

1. **Words and diagrams:** edit `specs.js`. Each film is a list of scenes (`hook`, `term`, `show`, `statement`, `end`). Each line in `say` is one caption and one beat of narration, and a diagram's `at` is the line it appears on. Diagrams (`panels`, `scale`, `bars`, `stats`, `flow`, `grid`, `squares`, `cycle`, `clock`, `art`, `svg`) are drawn in `build.js`. Every number must be one the site already cites, with its source.
2. **First pass:** `node tools/explainers/build.js` writes `<id>.narration.json`.
3. **Voice:** `FILM_DIR=tools/explainers FILM_OUT=glossary PIPER_VOICE=/path/en-us-libritts-high.onnx python3 tools/films/narrate.py <id>` writes `<id>.timing.json`.
4. **Second pass:** `node tools/explainers/build.js` again, so every diagram follows the voice.
5. **Film:** `node tools/explainers/render.js <id>` writes `media/glossary/<id>.mp4` and a `.jpg` cover.
6. **On the site:** the term in `GLOSSARY` (data.js) carries `video` and `length`; the glossary player picks it up.
