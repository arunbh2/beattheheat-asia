// Renders a glossary explainer from tools/explainers/<id>.html into media/glossary/<id>.mp4 (1920 × 1080) and a .jpg cover.
// Every CSS animation is paused and moved to each frame's time, and window.tick(ms) sets the counting numbers,
// so the result does not depend on machine speed. The voice (media/glossary/<id>.voice.wav, from tools/films/narrate.py)
// is mixed over the music bed from tools/films/music.py.
// Usage: node tools/explainers/render.js <id> [fps] [coverSecond]
const { chromium } = require(process.env.PW || "playwright");
const { spawn, execFileSync } = require("child_process"), path = require("path"), fs = require("fs");
const [id, fpsArg = "25", coverAt = "2.4"] = process.argv.slice(2);
const ROOT = path.join(__dirname, "..", ".."), fps = +fpsArg;
const timing = JSON.parse(fs.readFileSync(path.join(__dirname, id + ".timing.json"), "utf8"));
const total = Math.round(timing.total * fps), out = path.join(ROOT, "media", process.env.FILM_OUT || "glossary", id), voice = out + ".voice.wav";
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto("file://" + path.join(__dirname, id + ".html")); await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => { window.__A = document.getAnimations(); window.__A.forEach(a => { a.pause(); a.currentTime = 0; }); });
  execFileSync("python3", [path.join(__dirname, "..", "films", "music.py"), out + ".music.wav", String(timing.total)], { stdio: "ignore" });
  const ff = spawn("ffmpeg", ["-v", "error", "-y", "-f", "image2pipe", "-framerate", String(fps), "-i", "-", "-i", voice, "-i", out + ".music.wav",
    "-filter_complex", "[2]volume=0.5[m];[1][m]amix=inputs=2:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[a]", "-map", "0:v", "-map", "[a]", "-c:a", "aac", "-b:a", "128k",
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "23", "-preset", "medium", "-tune", "animation", "-movflags", "+faststart", out + ".mp4"], { stdio: ["pipe", "inherit", "inherit"] });
  // hold every animation from the moment the page loads: once one has played out, the browser stops listing it
  const seek = ms => p.evaluate(ms => { (window.__A = window.__A || document.getAnimations()).forEach(a => { a.pause(); a.currentTime = ms; }); if (window.tick) window.tick(ms); }, ms);
  for (let f = 0; f < total; f++) { await seek(f * 1000 / fps); ff.stdin.write(await p.screenshot({ type: "jpeg", quality: 92 })); }
  ff.stdin.end(); await new Promise(r => ff.on("close", r));
  await seek(+coverAt * 1000); await p.screenshot({ path: out + ".jpg", type: "jpeg", quality: 85 });
  await b.close(); fs.unlinkSync(out + ".music.wav");
  console.log("wrote", path.relative(ROOT, out) + ".mp4,", (timing.total).toFixed(1), "s");
})();
