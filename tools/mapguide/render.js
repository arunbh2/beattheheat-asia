#!/usr/bin/env node
// Renders the map guide film (tools/mapguide/scene.html) into media/mapguide/.
// Run after build.js (the words) and narrate.py (the voice and its timing); see README.md.
//   node tools/mapguide/render.js 9x16|16x9 [--stills 1,10,30]
//   node tools/mapguide/render.js all        (both formats, the poster and the captions)
// Needs Playwright (PW=<path>), ffmpeg and python3 (tools/films/music.py writes the soft music bed).
"use strict";
const { chromium } = require(process.env.PW || "playwright");
const { spawn, execFileSync } = require("child_process"), path = require("path"), fs = require("fs");
const ROOT = path.join(__dirname, "..", ".."), OUT = path.join(ROOT, "media", "mapguide"), FPS = 30, NAME = "map-guide";
const SIZES = { "9x16": [1080, 1920], "16x9": [1920, 1080] };
const read = f => JSON.parse(fs.readFileSync(path.join(__dirname, f), "utf8"));

async function render(fmt, stills) {
  const T = read(NAME + ".timing.json"), words = read(NAME + ".narration.json"), POINTS = read("shots/points.json");
  if (T.scenes.length !== words.scenes.length) throw new Error("the timing is out of date: run narrate.py again");
  const [W, H] = SIZES[fmt]; fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: W, height: H } });
  await p.addInitScript(d => { window.T = d.T; window.CAPS = d.CAPS; window.POINTS = d.POINTS; }, { T, CAPS: words.captions, POINTS });
  await p.goto("file://" + path.join(__dirname, "scene.html")); await p.evaluate(() => window.ready);
  if (stills) {
    for (const s of stills) { await p.evaluate(ms => window.tick(ms), s * 1000); await p.screenshot({ path: path.join(process.env.STILLS || OUT, `${NAME}-${fmt}-${s}s.jpg`), type: "jpeg", quality: 85 }); }
    return b.close();
  }
  const voice = path.join(OUT, NAME + ".voice.wav"), music = path.join(OUT, NAME + "-" + fmt + ".music.wav"), mp4 = path.join(OUT, `${NAME}-${fmt}.mp4`);
  execFileSync("python3", [path.join(ROOT, "tools", "films", "music.py"), music, String(T.total)], { stdio: "inherit" });
  const ff = spawn("ffmpeg", ["-v", "error", "-y", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-", "-i", voice, "-i", music,
    "-filter_complex", "[2]volume=0.5[m];[1][m]amix=inputs=2:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[a]", "-map", "0:v", "-map", "[a]",
    "-c:a", "aac", "-b:a", "128k", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "slow", "-crf", "30", "-maxrate", "900k", "-bufsize", "1800k", "-tune", "stillimage",
    "-movflags", "+faststart", "-shortest", mp4], { stdio: ["pipe", "inherit", "inherit"] });
  const frames = Math.round(T.total * FPS);
  for (let f = 0; f < frames; f++) {
    await p.evaluate(ms => window.tick(ms), f * 1000 / FPS);
    if (!ff.stdin.write(await p.screenshot({ type: "jpeg", quality: 90 }))) await new Promise(r => ff.stdin.once("drain", r));
  }
  ff.stdin.end(); await new Promise(r => ff.on("close", r));
  await b.close(); fs.unlinkSync(music);
  console.log("wrote", path.relative(ROOT, mp4), (fs.statSync(mp4).size / 1048576).toFixed(1) + " MB,", frames, "frames");
}

// captions: the words of each beat, from its start to the next beat (the film burns them in too)
function captions() {
  const T = read(NAME + ".timing.json"), words = read(NAME + ".narration.json");
  const ts = s => { const m = Math.floor(s / 60), r = (s - m * 60).toFixed(3).padStart(6, "0"); return `${String(m).padStart(2, "0")}:${r}`; };
  const cues = [];
  T.scenes.forEach((sc, i) => sc.beats.forEach((bt, j) => {
    const a = sc.start + bt, z = j + 1 < sc.beats.length ? sc.start + sc.beats[j + 1] : sc.start + sc.dur;
    cues.push(`${ts(a)} --> ${ts(z - 0.05)}\n${words.captions[i][j]}`);
  }));
  fs.writeFileSync(path.join(OUT, NAME + ".en.vtt"), "WEBVTT\n\n" + cues.join("\n\n") + "\n");
  console.log("wrote", path.relative(ROOT, path.join(OUT, NAME + ".en.vtt")));
}

(async () => {
  const args = process.argv.slice(2), fmt = args[0], si = args.indexOf("--stills");
  if (fmt === "all") {
    for (const f of Object.keys(SIZES)) await render(f);
    execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", "8", "-i", path.join(OUT, NAME + "-16x9.mp4"), "-frames:v", "1", "-q:v", "3", path.join(OUT, NAME + "-poster.jpg")]);
    captions(); return;
  }
  if (fmt === "captions") return captions();
  if (!SIZES[fmt]) { console.error("usage: node tools/mapguide/render.js 9x16|16x9|all|captions [--stills 1,10,30]"); process.exit(2); }
  await render(fmt, si > -1 ? args[si + 1].split(",").map(Number) : null);
})();
