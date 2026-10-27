# Drawn films

Each film is a web page drawn in the site's style (`<name>.html`), rendered frame by frame into `media/films/<name>.mp4`.

1. **Words:** `<name>.narration.json` holds one line per scene. A `|` splits a scene into beats, and the cards marked `data-beat` appear on each beat.
2. **Voice:** `PIPER_VOICE=/path/en-us-libritts-high.onnx python3 tools/films/narrate.py <name>`. This speaks each scene with Piper (`pip install piper-tts`), using speaker 599 of the LibriTTS voice (CC BY 4.0, from https://github.com/rhasspy/piper/releases/tag/v0.0.2). It writes `<name>.timing.json` and a temporary `media/films/<name>.voice.wav`.
3. **Film:** `node tools/films/render.js <name>`. Scenes follow the timing, and the voice is mixed over a quiet music bed synthesised by `music.py`, so there are no samples to license. It writes the `.mp4` and a `.jpg` poster.
4. **Captions:** update `media/films/<name>.en.vtt` to the new timings.

Fonts (OFL) are in `fonts/`. The voice track is not kept in the repository; it is rebuilt by step 2.
