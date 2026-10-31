// Places each site explainer (site.js) on its page: below the heading and opening paragraph, or, where a page
// already has a short film, before its first section heading. Captions are part of the picture. Safe to run again.
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", ".."), SITE = require("./site");
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const len = t => `${Math.floor(t / 60)}:${String(Math.round(t % 60)).padStart(2, "0")}`;
const CSS = `<style>.cs-ex{margin:24px 0 30px;max-width:860px}.cs-ex video{display:block;width:100%;height:auto;aspect-ratio:16/9;background:#16202B;border-radius:14px}.cs-ex figcaption{margin-top:8px;font-size:.88rem;line-height:1.45;color:#5E6570}.cs-ex figcaption b{color:#16202B}</style>`;
let n = 0;
for (const f of SITE) {
  const timing = path.join(__dirname, f.id + ".timing.json"), mp4 = path.join(ROOT, "media", "explainers", f.id + ".mp4"), page = path.join(ROOT, f.page);
  if (!fs.existsSync(timing) || !fs.existsSync(mp4) || !fs.existsSync(page)) continue;
  const T = JSON.parse(fs.readFileSync(timing, "utf8"));
  const block = `<!--explainer-->${CSS}<figure class="cs-ex"><video controls playsinline preload="none" width="1920" height="1080" poster="/media/explainers/${f.id}.jpg" aria-label="${esc(f.term)}: an explainer film with captions in the picture">` +
    `<source src="/media/explainers/${f.id}.mp4" type="video/mp4"></video><figcaption><b>Watch: ${esc(f.term)}</b> · ${len(T.total)} · narrated, captions in the picture</figcaption></figure><!--/explainer-->`;
  let s = fs.readFileSync(page, "utf8").replace(/<!--explainer-->[\s\S]*?<!--\/explainer-->/g, "");
  const h = s.indexOf("</h1>"); if (h < 0) continue;
  let at;
  if (f.place === "h2") { at = s.indexOf("<h2", h); if (at < 0) continue; }
  else { const short = s.indexOf("<!--/short-->", h), lead = s.slice(h + 5).match(/^\s*<p\b[\s\S]*?<\/p>/);
    at = short > 0 ? short + 13 : h + 5 + (lead ? lead[0].length : 0); }
  s = s.slice(0, at) + "\n" + block + "\n" + s.slice(at);
  fs.writeFileSync(page, s); n++;
}
console.log("explainers placed on", n, "pages");
