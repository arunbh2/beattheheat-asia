#!/usr/bin/env node
// Renders the Common Shade launch film (tools/launch/scene.html) into media/launch/.
// The counts on screen are read from the data at render time (the HAP archive, the solutions page, the organisations
// list), never typed. Each frame is seeked with window.tick(ms), so the result does not depend on machine speed.
//   node tools/launch/render.js 16x9|1x1|9x16 [--gentle] [--stills 0.5,9,19]
//   node tools/launch/render.js all          (every format, the gentle cut, the 6-second cut-downs, poster and captions)
// Needs Playwright (PW=<path>), ffmpeg and the films' Python (numpy) for the music: tools/launch/music.py.
"use strict";
const { chromium } = require(process.env.PW || "playwright");
const { spawn, execFileSync } = require("child_process"), path = require("path"), fs = require("fs");
const ROOT = path.join(__dirname, "..", ".."), OUT = path.join(ROOT, "media", "launch"), FPS = 30, DUR = 20;
const SIZES = { "16x9": [1920, 1080], "1x1": [1080, 1080], "9x16": [1080, 1920] };
const PY = process.env.FILM_PY || "/tmp/claude-0/venv/bin/python";

function counts() {
  const hap = require("../hap-archive.js").load();
  const solutions = (fs.readFileSync(path.join(ROOT, "solutions", "index.html"), "utf8").match(/class="sol"/g) || []).length;
  const orgs = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "core", "ORGANISATIONS.json"), "utf8"));
  const c = { hap: hap.docs.length, solutions, orgs: Array.isArray(orgs) ? orgs.length : Object.values(orgs).flat().length };
  if (!c.hap || !c.solutions || !c.orgs) throw new Error("a count came back empty; build the site first: " + JSON.stringify(c));
  return c;
}

async function render(fmt, { gentle = false, stills = null } = {}) {
  const [W, H] = SIZES[fmt], C = counts(), name = `launch-${fmt}${gentle ? "-gentle" : ""}`;
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: W, height: H } });
  await p.addInitScript(c => { window.COUNTS = c; }, C);
  await p.goto("file://" + path.join(__dirname, "scene.html") + (gentle ? "?gentle=1" : ""));
  await p.evaluate(() => window.ready);
  if (stills) {
    for (const s of stills) { await p.evaluate(ms => window.tick(ms), s * 1000); await p.screenshot({ path: path.join(process.env.STILLS || OUT, `${name}-${s}s.jpg`), type: "jpeg", quality: 90 }); }
    await b.close(); return;
  }
  const wav = path.join(OUT, name + ".music.wav");
  execFileSync(PY, [path.join(__dirname, "music.py"), wav, String(DUR), gentle ? "gentle" : "full"], { stdio: "inherit" });
  const mp4 = path.join(OUT, name + ".mp4");
  const ff = spawn("ffmpeg", ["-v", "error", "-y", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-", "-i", wav,
    "-filter_complex", "[1]loudnorm=I=-16:TP=-1.5:LRA=11[a]", "-map", "0:v", "-map", "[a]", "-c:a", "aac", "-b:a", "128k",
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "slow", "-crf", "22", "-maxrate", "2600k", "-bufsize", "5200k", "-tune", "animation",
    "-movflags", "+faststart", "-shortest", mp4], { stdio: ["pipe", "inherit", "inherit"] });
  for (let f = 0; f < FPS * DUR; f++) {
    await p.evaluate(ms => window.tick(ms), f * 1000 / FPS);
    const ok = ff.stdin.write(await p.screenshot({ type: "jpeg", quality: 92 }));
    if (!ok) await new Promise(r => ff.stdin.once("drain", r));
  }
  ff.stdin.end(); await new Promise(r => ff.on("close", r));
  await b.close(); fs.unlinkSync(wav);
  console.log("wrote", path.relative(ROOT, mp4), (fs.statSync(mp4).size / 1048576).toFixed(1) + " MB");
  return mp4;
}

// a 6-second cut for stories and previews: the tagline (10 to 13 s), then the end card (17 to 20 s)
function cutdown(fmt) {
  const src = path.join(OUT, `launch-${fmt}.mp4`), dst = path.join(OUT, `launch-${fmt}-6s.mp4`);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", src, "-filter_complex",
    "[0:v]trim=10:13,setpts=PTS-STARTPTS[v1];[0:v]trim=17:20,setpts=PTS-STARTPTS[v2];[0:a]atrim=10:13,asetpts=PTS-STARTPTS,afade=t=in:d=0.3,afade=t=out:st=2.8:d=0.2[a1];[0:a]atrim=17:20,asetpts=PTS-STARTPTS,afade=t=in:d=0.15[a2];[v1][a1][v2][a2]concat=n=2:v=1:a=1[v][a]",
    "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "22", "-preset", "slow", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", dst]);
  console.log("wrote", path.relative(ROOT, dst));
}

// captions: the film has no voice, so the captions carry its words and say what the music does
function captions() {
  const C = counts(), n = x => x.toLocaleString("en-GB");
  const cues = [["00:00.000", "00:03.500", "[Soft music]\nOne heatwave. Many harms."], ["00:04.000", "00:06.300", "[Music builds]"],
    ["00:06.400", "00:09.000", `${n(C.hap)} heat action plans and guidance documents, India\n${n(C.solutions)} solutions, with their evidence and cost\n${n(C.orgs)} organisations already at work`],
    ["00:09.300", "00:13.000", "Extreme heat, in one shared map."], ["00:13.000", "00:13.600", "[Silence]"],
    ["00:13.600", "00:20.000", "Common Shade. Explore the map.\nbeattheheat.asia - free and open"]];
  fs.writeFileSync(path.join(OUT, "launch.en.vtt"), "WEBVTT\n\n" + cues.map(([a, b, t]) => `${a} --> ${b}\n${t}`).join("\n\n") + "\n");
  console.log("wrote media/launch/launch.en.vtt");
}

(async () => {
  const args = process.argv.slice(2), fmt = args[0], gentle = args.includes("--gentle"), si = args.indexOf("--stills");
  if (fmt === "all") {
    for (const f of Object.keys(SIZES)) await render(f);
    await render("16x9", { gentle: true });
    cutdown("9x16"); cutdown("16x9");
    execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", "18.6", "-i", path.join(OUT, "launch-16x9.mp4"), "-frames:v", "1", "-q:v", "3", path.join(OUT, "launch-poster.jpg")]);
    captions();
    return;
  }
  if (!SIZES[fmt]) { console.error("usage: node tools/launch/render.js 16x9|1x1|9x16|all [--gentle] [--stills 0.5,9,19]"); process.exit(2); }
  await render(fmt, { gentle, stills: si > -1 ? args[si + 1].split(",").map(Number) : null });
})();
