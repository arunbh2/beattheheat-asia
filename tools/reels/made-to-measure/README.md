# Made to measure (Reel 3)

A 45-second vertical film made with the cinecode kit in Film mode: a tailor cuts each heat plan to the last heatwave's measurements, and the plans work until the heat outgrows the coat. The film is in `media/reels/reel-measure.mp4`, with its poster and captions beside it. The facts and the suggested caption are in `../SCRIPT.md` (Reel 3).

| File | What it is |
|---|---|
| `film.html` | The whole film in one page: picture (canvas 2D, a paper world in noon light through shutters) and sound (Web Audio: a synthesised piano and cello on a 72 BPM treadle, foley, one shared room) |
| `shots.json` | The nine shots with their timing, camera, reads and on-screen text |
| `SCRIPT.md`, `ROADMAP.md` | The approved script and roadmap |
| `audio/mix.json` | Lays the seven narration lines over the page's soundtrack |
| `LICENSES.csv` | Fonts (SIL OFL, bundled from `tools/films/fonts/`) and the narration voice |

To render it again with the cinecode kit:
1. Make a film folder with `init_film.py --quick`.
2. Copy these files into it, and copy the fonts from `tools/films/fonts/` into its `fonts/` folder.
3. Record the narration lines from `SCRIPT.md` with Piper (`en_US-libritts-high`, speaker 599, length scale 1.12) into `audio/vo-raw/`, then run `voice_treat.py apply audio/vo-raw/*.wav --medium close --space room --out audio/vo`.
4. Run `make.py final --size 1080x1920`.

No figure from the Nature Communications 2026 study on future heatwaves appears in the film until that study passes its source check.
