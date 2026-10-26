// Renders tools/reel/reel.html to a 1080x1350, 60 fps H.264 video with its soundtrack.
// Usage: node tools/reel/render.js [out.mp4] [--stills 1,3.5,...]
// Needs Playwright with Chromium, ffmpeg, the Anton and Inter fonts installed, and python3 for the sound.
const { chromium } = require(process.env.PW || "playwright");
const { spawn, execFileSync } = require("child_process");
const path = require("path"), fs = require("fs");
const FPS = 60, here = __dirname;
(async () => {
  const args = process.argv.slice(2), si = args.indexOf("--stills");
  const out = path.resolve(args[0] && !args[0].startsWith("--") ? args[0] : path.join(here, "../../media/social/beattheheat-reel-20s.mp4"));
  const b = await chromium.launch(), pg = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  await pg.goto("file://" + path.join(here, "reel.html") + "?render=1"); await pg.evaluate(() => window.ready);
  const frame = async t => Buffer.from((await pg.evaluate(tt => { render(tt); return document.getElementById("c").toDataURL("image/png"); }, t)).split(",")[1], "base64");
  if (si >= 0) { const dir = path.dirname(out); fs.mkdirSync(dir, { recursive: true });
    for (const t of args[si + 1].split(",").map(Number)) fs.writeFileSync(path.join(dir, `still-${String(t).replace(".", "_")}.png`), await frame(t));
    await b.close(); return; }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const wav = path.join(path.dirname(out), "reel-sound.wav");
  execFileSync("python3", [path.join(here, "sound.py"), wav], { stdio: "inherit" });
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-f", "image2pipe", "-c:v", "png", "-i", "-", "-i", wav,
    "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", "-profile:v", "high", "-r", String(FPS),
    "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", "-shortest", out], { stdio: ["pipe", "inherit", "inherit"] });
  const total = Math.round(await pg.evaluate(() => DUR) * FPS);
  for (let i = 0; i < total; i++) { const buf = await frame(i / FPS); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r)); if (i % 120 === 0) process.stdout.write(`frame ${i}/${total}\n`); }
  ff.stdin.end(); await new Promise(r => ff.on("close", r)); fs.unlinkSync(wav); await b.close(); console.log("wrote", out);
})();
