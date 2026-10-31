// Places each short film on its page, below the heading and the opening paragraph, and writes its captions
// (media/shorts/<id>.en.vtt) from the narration timing. Runs at the end of tools/build-static.js; safe to run again.
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", ".."), SHORTS = require("./shorts");
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const ts = t => { const h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), s = (t % 60).toFixed(3).padStart(6, "0"); return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${s}`; };
const len = t => `${Math.floor(t / 60)}:${String(Math.round(t % 60)).padStart(2, "0")}`;
const CSS = `<style>.cs-short{margin:22px 0 26px;max-width:760px}.cs-short video{display:block;width:100%;height:auto;aspect-ratio:16/9;background:#16202B;border-radius:14px}.cs-short figcaption{margin-top:8px;font-size:.88rem;line-height:1.45;color:#5E6570}.cs-short figcaption b{color:#16202B}</style>`;

let n = 0;
for (const f of SHORTS) {
  const timing = path.join(__dirname, f.id + ".timing.json"), mp4 = path.join(ROOT, "media", "shorts", f.id + ".mp4"), page = path.join(ROOT, f.page);
  if (!fs.existsSync(timing) || !fs.existsSync(mp4) || !fs.existsSync(page)) continue;
  const T = JSON.parse(fs.readFileSync(timing, "utf8"));
  fs.writeFileSync(path.join(ROOT, "media", "shorts", f.id + ".en.vtt"), "WEBVTT\n\n" + T.scenes.map((s, i) =>
    `${i + 1}\n${ts(s.start + (s.beats[0] || 0))} --> ${ts(Math.min(T.total, s.start + s.dur))}\n${s.text}\n`).join("\n"));
  const block = `<!--short-->${CSS}<figure class="cs-short"><video controls playsinline preload="none" width="1280" height="720" poster="/media/shorts/${f.id}.jpg" aria-label="${esc(f.title)}: a short drawn film">` +
    `<source src="/media/shorts/${f.id}.mp4" type="video/mp4"><track kind="captions" srclang="en" label="English" src="/media/shorts/${f.id}.en.vtt" default></video>` +
    `<figcaption><b>Watch: ${esc(f.title)}</b> · ${len(T.total)} · narrated, with captions</figcaption></figure><!--/short-->`;
  let s = fs.readFileSync(page, "utf8").replace(/\n*<!--short-->[\s\S]*?<!--\/short-->/g, "");
  const h = s.indexOf("</h1>"); if (h < 0) continue;
  const rest = s.slice(h + 5), lead = rest.match(/^\s*<p\b[\s\S]*?<\/p>/);
  const at = h + 5 + (lead ? lead[0].length : 0);
  s = s.slice(0, at) + "\n" + block + s.slice(at);
  fs.writeFileSync(page, s); n++;
}
console.log("short films placed on", n, "pages");
