#!/usr/bin/env node
// Common Shade: the share image for each published State of the field edition, whats-new/<YYYY-MM>/card.png (1200 x 630),
// used as the page's og:image so a link shared in a chat or feed shows the edition's month and argument.
// Renders with the pre-installed Playwright Chromium and the site's own font files (tools/films/fonts), so it needs no
// network. The words come from the published edition file, unchanged. tools/build-sof.js uses a card when it exists and
// the site's default image when it does not.
//   node tools/sof-card.js            every published edition without a card
//   node tools/sof-card.js 2026-11    one edition (overwrites)
"use strict";
const fs = require("fs"), path = require("path"), M = require("./sof-model.js");
const ROOT = M.ROOT, FONTS = path.join(ROOT, "tools", "films", "fonts");
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// fonts embedded as data: a page set with setContent cannot read file:// fonts
const font = (fam, file, w, st = "normal") => `@font-face{font-family:"${fam}";src:url(data:font/ttf;base64,${fs.readFileSync(path.join(FONTS, file)).toString("base64")}) format("truetype");font-weight:${w};font-style:${st}}`;

function html(e) {
  const h = e.argument.headline, size = h.length > 110 ? 44 : h.length > 80 ? 50 : 56;
  return `<!doctype html><meta charset="utf-8"><style>
${font("Anton", "Anton-Regular.ttf", 400)}${font("Hanken", "HankenGrotesk-Bold.ttf", 700)}${font("Hanken", "HankenGrotesk-Medium.ttf", 500)}
*{box-sizing:border-box;margin:0}html,body{width:1200px;height:630px}
body{background:#16202B;color:#FAF7F2;font-family:Hanken,sans-serif;padding:64px 72px;display:flex;flex-direction:column}
.top{display:flex;align-items:center;gap:18px}.rule{width:56px;height:6px;background:#F26430}
.k{font:700 22px/1 Hanken;letter-spacing:.14em;text-transform:uppercase;color:#F7B79C}
h1{font:400 76px/1 Anton;letter-spacing:.01em;text-transform:uppercase;margin-top:26px}
p.h{font:700 ${size}px/1.16 Hanken;margin-top:30px;max-width:1040px;text-wrap:balance}
.foot{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;font:500 22px/1.3 Hanken;color:#C9C3BA}
.foot b{font:400 30px/1 Anton;letter-spacing:.03em;color:#FAF7F2;text-transform:uppercase}
</style><div class="top"><span class="rule"></span><span class="k">${esc(M.label(e))} edition</span></div>
<h1>State of the field</h1><p class="h">${esc(h)}</p>
<div class="foot"><span>A monthly briefing on heat resilience<br>in South and Southeast Asia, with its sources</span><span style="text-align:right"><b>Common Shade</b><br>beattheheat.asia${esc(M.url(e))}</span></div>`;
}

(async () => {
  const one = process.argv[2], P = M.published().filter(e => !one || e.id === one);
  if (one && !P.length) { console.error(`no published edition ${one}`); process.exit(1); }
  const todo = P.filter(e => one || !fs.existsSync(path.join(ROOT, "whats-new", e.id, "card.png")));
  if (!todo.length) { console.log("sof-card: every published edition has a card"); return; }
  const { chromium } = require("playwright"), b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  for (const e of todo) {
    await p.setContent(html(e)); await p.evaluate(() => document.fonts.ready);
    fs.mkdirSync(path.join(ROOT, "whats-new", e.id), { recursive: true });
    await p.screenshot({ path: path.join(ROOT, "whats-new", e.id, "card.png") });
    console.log(`sof-card: whats-new/${e.id}/card.png`);
  }
  await b.close();
})();
