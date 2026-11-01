# The launch film

A 20-second film for Common Shade, made entirely in code from real screens of the site. It plays in the homepage launch card (`#launch` in `index.html`), and its files in `media/launch/` are free to download and share.

| File | What it is |
|---|---|
| `scene.html` | The film as one page, moved frame by frame by `window.tick(ms)`. It adapts to 16:9, 1:1 and 9:16; `?gentle=1` drops the whip pan, the speed ramp and the motion blur |
| `shots/` | Screenshots of the built site (the map, the homepage, the India HAP archive on a phone, and nine pages for the closing reveal) |
| `music.py` | The music, synthesised to the film's beats (no samples, nothing to license) |
| `render.js` | Renders every version, reading the counts on screen from the data at render time |

**Beats:**
- 0 to 3.5 s: push in on the map, with the words "One heatwave. Many harms."
- 3.5 to 4.0 s: a whip pan.
- 4 to 9 s: an orbit of the phone with a speed ramp, then the counts.
- 9 to 13 s: a rack focus to the tagline, "Extreme heat, in one shared map."
- 13 to 13.6 s: a smash cut to black and silence.
- 13.6 to 20 s: a pull-back to the whole website, then the end card (beattheheat.asia).

## Re-render (for example, when the counts change)

1. Rebuild the site (`node tools/build-static.js`), so the solutions page and the HAP archive are current.
2. If pages have changed a lot, re-capture `shots/`, for example with a Playwright script like the one used first: the map element `#map-stage`, the archive summary at 390 px wide, and the reveal pages at 1440 × 900.
3. Run:

```
PW=<path to playwright> FILM_PY=<python with numpy> node tools/launch/render.js all
```

This writes the following to `media/launch/`:
- `launch-16x9.mp4`, `launch-1x1.mp4` and `launch-9x16.mp4`
- `launch-16x9-gentle.mp4`
- the 6-second cut-downs `launch-9x16-6s.mp4` and `launch-16x9-6s.mp4`
- `launch-poster.jpg`
- the captions, `launch.en.vtt`

To check a few frames first: `node tools/launch/render.js 16x9 --stills 0.5,9,19`.

## Rules the film keeps

- **Real screens only:** no mock-ups. The numbers on screen are read from the data, never typed. The HAP figure is described as plans *and guidance documents*, never as standalone plans.
- **The site's voice:** no "should" or "must", no names, drawn figures only, the site's brand colours and fonts.
- **Readable with the sound off.** No more than three flashes a second. There is a gentle version for people sensitive to motion.
- **Sound:** about −16 LUFS and −1.5 dBTP, with silence on the smash cut. Each MP4 is kept under about 8 MB.
