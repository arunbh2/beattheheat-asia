// Renders a drawn film from tools/films/<name>.html into media/films/<name>.mp4, with a .jpg poster.
// Every CSS animation is paused and moved to each frame's time, so the result does not depend on machine speed.
// Usage: node tools/films/render.js heat-and-lenders [seconds] [fps] [posterSecond]
// Needs Playwright with Chromium, and ffmpeg.
const { chromium } = require(process.env.PW || "playwright");
const { spawn } = require("child_process"), path = require("path");
const [name = "heat-and-lenders", secs = "58", fpsArg = "25", posterAt = "3"] = process.argv.slice(2);
const ROOT = path.join(__dirname, "..", ".."), fps = +fpsArg, total = Math.round(+secs * fps);
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  await p.goto("file://" + path.join(__dirname, name + ".html")); await p.evaluate(() => document.fonts.ready);
  const out = path.join(ROOT, "media", "films", name);
  const ff = spawn("ffmpeg", ["-v", "error", "-y", "-f", "image2pipe", "-framerate", String(fps), "-i", "-", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "24", "-preset", "slow", "-movflags", "+faststart", out + ".mp4"], { stdio: ["pipe", "inherit", "inherit"] });
  const seek = t => p.evaluate(ms => document.getAnimations().forEach(a => { a.pause(); a.currentTime = ms; }), t);
  for (let f = 0; f < total; f++) { await seek(f * 1000 / fps); ff.stdin.write(await p.screenshot({ type: "png" })); }
  ff.stdin.end(); await new Promise(r => ff.on("close", r));
  await seek(+posterAt * 1000); await p.screenshot({ path: out + ".jpg", type: "jpeg", quality: 85 });
  await b.close(); console.log("wrote", path.relative(ROOT, out) + ".mp4 and .jpg,", total, "frames");
})();
