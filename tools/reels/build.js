#!/usr/bin/env node
// Common Shade Reels: writes <id>.narration.json for each film in reels.js and, once narrate.py has timed the voice
// (<id>.timing.json), the page <id>.html that render.js films at 1080 × 1920. The page embeds the timing, so headline,
// captions and drawings follow the voice. Layout keeps clear of the app's own controls: nothing important in the top
// 220 px or the bottom 380 px.
//   node tools/reels/build.js                      then narrate, build again, and render (see README.md)
"use strict";
const fs = require("fs"), path = require("path");
const HERE = __dirname, REELS = require("./reels.js");
const VOICE = { model: "en-us-libritts-high", speaker: 599, length_scale: 0.94, licence: "LibriTTS (CC BY 4.0), via the Piper voice en-us-libritts-high" };
const ENGINE = fs.readFileSync(path.join(HERE, "scene.js"), "utf8");
const FONTS = "../films/fonts";
const page = (id, R, timing) => `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>${R.title}</title>
<style>
@font-face{font-family:Anton;src:url(${FONTS}/Anton-Regular.ttf)}
@font-face{font-family:"Hanken Grotesk";font-weight:700;src:url(${FONTS}/HankenGrotesk-Bold.ttf)}
@font-face{font-family:"Hanken Grotesk";font-weight:500;src:url(${FONTS}/HankenGrotesk-Medium.ttf)}
html,body{margin:0;width:1080px;height:1920px;overflow:hidden;background:#16202B}
body{position:relative;color:#F6E7D7;font-family:"Hanken Grotesk",sans-serif}
.glow{position:absolute;inset:0;background:radial-gradient(70% 40% at 80% 34%,rgba(242,100,48,.22),transparent 70%)}
.top{position:absolute;left:72px;right:72px;top:236px;display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:30px;letter-spacing:.14em}
.mark{display:flex;gap:14px;align-items:center;font-family:Anton;font-weight:400;letter-spacing:.06em;font-size:36px}
.mark svg{width:46px;height:30px}
.chip{border:2px solid rgba(246,231,215,.5);border-radius:999px;padding:8px 20px;font-size:24px;color:#F6E7D7}
.head{position:absolute;left:72px;right:72px;top:330px;font-family:Anton;font-size:80px;line-height:1.04;text-transform:uppercase;letter-spacing:.01em;min-height:300px}
.head--big{font-size:98px}.head .hot{color:#F26430}
svg#stage{position:absolute;left:0;top:0;width:1080px;height:1920px}
.src{position:absolute;left:72px;right:72px;top:1276px;font-size:26px;line-height:1.35;color:#C9C2B6;font-weight:500}
.cap{position:absolute;left:60px;right:60px;top:1366px;text-align:center;font-weight:700;font-size:44px;line-height:1.25}
.cap:not(:empty){background:rgba(10,15,21,.72);padding:18px 26px;border-radius:22px}
.url{position:absolute;left:40px;right:40px;top:1268px;text-align:center;font-family:Anton;font-size:76px;color:#F26430;letter-spacing:.02em}.url--long{font-size:56px;top:1286px}
</style></head><body>
<div class="glow"></div>
<div class="top"><span class="mark"><svg viewBox="0 0 32 22" aria-hidden="true"><path d="M2 9 Q16 -1 30 9" fill="none" stroke="#F26430" stroke-width="4.5" stroke-linecap="round"/><path d="M7 8 V21 M25 8 V21" stroke="#F6E7D7" stroke-width="2.8" stroke-linecap="round"/></svg>COMMON SHADE</span><span class="chip">ILLUSTRATIVE STORY</span></div>
<div class="head" id="head"></div>
<svg id="stage" viewBox="0 0 1080 1920"><g transform="translate(150 590) scale(1.4)" id="art"></g></svg>
<div class="url" id="url"></div>
<div class="src" id="src"></div>
<div class="cap" id="cap"></div>
<script>window.FILM=${JSON.stringify({ id, scenes: R.scenes, timing })};</script>
<script>${ENGINE}</script>
</body></html>
`;
for (const [id, R] of Object.entries(REELS)) {
  fs.writeFileSync(path.join(HERE, id + ".narration.json"), JSON.stringify({ voice: VOICE, scenes: R.scenes.map(s => s.say) }, null, 1) + "\n");
  const tf = path.join(HERE, id + ".timing.json");
  if (fs.existsSync(tf)) { const T = JSON.parse(fs.readFileSync(tf, "utf8"));
    fs.writeFileSync(path.join(HERE, id + ".html"), page(id, R, T));
    // captions as a .vtt file too, one cue per beat, from the same timing as the burned-in captions
    const ts = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, x = (ms / 1000) % 60;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${x.toFixed(3).padStart(6, "0")}`; };
    const cues = T.scenes.flatMap((s, i) => { const parts = R.scenes[i].say.split("|").map(x => x.trim());
      return parts.map((p, j) => [s.start + s.beats[j], j + 1 < parts.length ? s.start + s.beats[j + 1] : s.start + s.dur, p]); });
    fs.mkdirSync(path.join(HERE, "..", "..", "media", "reels"), { recursive: true });
    fs.writeFileSync(path.join(HERE, "..", "..", "media", "reels", id + ".en.vtt"), "WEBVTT\n\n" + cues.map(([a, b, p]) => `${ts(a)} --> ${ts(b)}\n${p}\n`).join("\n")); }
  console.log(id, fs.existsSync(tf) ? "narration and page" : "narration (voice it, then build again)");
}
