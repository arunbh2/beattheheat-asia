# Short films

Twenty-five drawn films of 25 seconds or less, one for each city page and for section pages that had no film.
They use the same fonts, colours, voice, music and renderer as `tools/films`.

1. **Words and pictures:** edit `shorts.js`. Each film has four scenes: `title`, `stat`, `point` or `three` (three cards, cued by `|` in the narration), and a closing `close` card. Drawings are in `art.js`: faceless stick figures only. Every number must be one the site already cites, with its source.
2. **Pages:** `node tools/shorts/build.js` writes `<id>.html` and `<id>.narration.json`.
3. **Voice:** `FILM_DIR=tools/shorts FILM_OUT=shorts FILM_PACE=short PIPER_VOICE=/path/en-us-libritts-high.onnx python3 tools/films/narrate.py <id>`. Check that the total is 25 seconds or less.
4. **Film:** `FILM_DIR=tools/shorts FILM_OUT=shorts node tools/films/render.js <id> 0 25 3.2` writes `media/shorts/<id>.mp4` and a `.jpg` poster.
5. **On the site:** `node tools/build-static.js` places each film below its page's heading and writes captions (`media/shorts/<id>.en.vtt`) from the timing.
