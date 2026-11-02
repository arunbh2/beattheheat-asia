# The map guide film

A film of about 80 seconds in which a drawn, faceless guide (a stick figure in a sun hat, with a pointer) walks
through the real heat map. It covers:
- extreme heat at the centre
- the systems around it
- each harm as a dot
- tapping a dot
- the card that opens
- a vicious cycle
- a lever and its card
- a package of actions

It plays from the "Watch: how to read the map" button under the map's legend (`SECTION_FILMS`, id `mapguide`). Its
files in `media/mapguide/` can be downloaded and shared:
- `map-guide-9x16.mp4` for phones and social channels
- `map-guide-16x9.mp4` for the site and presentations
- `map-guide-poster.jpg`
- `map-guide.en.vtt`

| File | What it is |
|---|---|
| `capture.js` | Takes pictures of the real map in each state, using the map's own links (`#power`, `#loop-cooling`, `#break-greencity`, `#package-cities`). It also records where each dot sits (`shots/points.json`) |
| `build.js` | Writes the words (`map-guide.narration.json`). Every count is read from the data, never typed |
| `scene.html` | The film as one page, moved frame by frame by `window.tick(ms)`. It lays itself out for 9:16 or 16:9 |
| `render.js` | Renders both formats, the poster and the captions, and mixes the voice with a soft music bed |

## Re-make it (for example, when the map or its counts change)

1. Build the site with `node tools/build-static.js`. Serve it with `python3 -m http.server 8765`, then run `PW=<path to playwright> node tools/mapguide/capture.js`.
2. Write the words with `node tools/mapguide/build.js`.
3. Make the voice and its timing:
   ```
   FILM_DIR=tools/mapguide FILM_OUT=mapguide PIPER_VOICE=/path/en-us-libritts-high.onnx python3 tools/films/narrate.py map-guide
   ```
   This needs Piper with the LibriTTS voice (CC BY 4.0).
4. Check a few frames with `node tools/mapguide/render.js 9x16 --stills 9,32,53`.
5. Render everything with `node tools/mapguide/render.js all`. This writes to `media/mapguide/`.
6. If the length changed, update `length` for `mapguide` in `data/core/SECTION_FILMS.json`, then rebuild.

Never run git stash or pull while a render is writing files.

## Rules the film keeps

- Real screens of the map only. Every number is read from the data.
- The site's voice:
  - no "should" or "must", no em dashes, no names
  - a drawn, faceless figure
  - the map called "a guide for thinking, not a forecast"
- Captions are burned into the picture and also given as a `.vtt` file. No flashing. Loudness is about −16 LUFS.
