// Renders a drawn film from tools/films/<name>.html into media/films/<name>.mp4, with a .jpg poster.
// Every CSS animation is paused and moved to each frame's time, so the result does not depend on machine speed.
// If tools/films/<name>.timing.json exists (written by narrate.py), scenes take their start and length from it,
// cards marked data-beat appear as the voice names them, and media/films/<name>.voice.wav is mixed in under a soft
// synthesised music bed (music.py). Otherwise the film is silent and uses the timings written in the page.
// Usage: node tools/films/render.js heat-and-lenders [seconds] [fps] [posterSecond]
// Needs Playwright with Chromium, ffmpeg, and python3 for the music.
const { chromium } = require(process.env.PW || "playwright");
const { spawn, execFileSync } = require("child_process"), path = require("path"), fs = require("fs");
const [name = "heat-and-lenders", secs = "58", fpsArg = "25", posterAt = "3"] = process.argv.slice(2);
const ROOT = path.join(__dirname, "..", ".."), fps = +fpsArg;
// FILM_DIR and FILM_OUT render another set of films, e.g. FILM_DIR=tools/shorts FILM_OUT=shorts
const DIR = process.env.FILM_DIR ? path.resolve(ROOT, process.env.FILM_DIR) : __dirname, OUTSUB = process.env.FILM_OUT || "films";
const timingFile = path.join(DIR, name + ".timing.json"), timing = fs.existsSync(timingFile) ? JSON.parse(fs.readFileSync(timingFile, "utf8")) : null;
const total = Math.round((timing ? timing.total : +secs) * fps);
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  await p.goto("file://" + path.join(DIR, name + ".html")); await p.evaluate(() => document.fonts.ready);
  if (timing) await p.evaluate(T => document.querySelectorAll("section.s").forEach((sec, i) => { const s = T.scenes[i]; if (!s) return;
    sec.style.setProperty("--start", s.start + "s"); sec.style.setProperty("--dur", s.dur + "s");
    sec.querySelectorAll("[data-beat]").forEach(el => { const b = s.beats[+el.dataset.beat]; if (b != null) el.style.setProperty("--d", (b + 0.1) + "s"); }); }), timing);
  const out = path.join(ROOT, "media", OUTSUB, name);
  const voice = out + ".voice.wav", sound = timing && fs.existsSync(voice);
  if (sound) execFileSync("python3", [path.join(__dirname, "music.py"), out + ".music.wav", String(timing.total)], { stdio: "inherit" });
  const ff = spawn("ffmpeg", ["-v", "error", "-y", "-f", "image2pipe", "-framerate", String(fps), "-i", "-", ...(sound ? ["-i", voice, "-i", out + ".music.wav", "-filter_complex", "[2]volume=0.55[m];[1][m]amix=inputs=2:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[a]", "-map", "0:v", "-map", "[a]", "-c:a", "aac", "-b:a", "128k"] : []), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "24", "-preset", "slow", "-movflags", "+faststart", out + ".mp4"], { stdio: ["pipe", "inherit", "inherit"] });
  const seek = t => p.evaluate(ms => document.getAnimations().forEach(a => { a.pause(); a.currentTime = ms; }), t);
  for (let f = 0; f < total; f++) { await seek(f * 1000 / fps); ff.stdin.write(await p.screenshot({ type: "png" })); }
  ff.stdin.end(); await new Promise(r => ff.on("close", r));
  await seek(+posterAt * 1000); await p.screenshot({ path: out + ".jpg", type: "jpeg", quality: 85 });
  await b.close(); if (sound) fs.unlinkSync(out + ".music.wav");
  console.log("wrote", path.relative(ROOT, out) + ".mp4 and .jpg,", total, "frames,", sound ? "with narration and music" : "silent");
})();
