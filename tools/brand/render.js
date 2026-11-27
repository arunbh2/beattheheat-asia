#!/usr/bin/env node
// Common Shade: renders the PNG logo files on /brand/ from their vector originals, with transparent backgrounds.
//   - the symbols and the app icon: the SVG files tools/build-brand.js writes from the logo's own code
//   - the logo with its name: the header lockup (.csn__home in tools/site-nav.js: the mark, a gap of 0.53 em, then
//     COMMON SHADE in Anton with 0.06 em letter-spacing), set with the site's own copy of Anton (tools/films/fonts,
//     SIL Open Font License), so nothing is fetched and the result is the same on every machine
// Run after a change to the mark, then rebuild (node tools/build-static.js) so the pack and sizes follow.
//   node tools/brand/render.js
"use strict";
const { chromium } = require(process.env.PW || "playwright");
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", ".."), OUT = path.join(ROOT, "brand", "files");
const { SVGS } = require("../build-brand.js");
const ANTON = fs.readFileSync(path.join(ROOT, "tools", "films", "fonts", "Anton-Regular.ttf")).toString("base64");

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const [f, make] of Object.entries(SVGS)) fs.writeFileSync(path.join(ROOT, f), make());
  const b = await chromium.launch(), p = await b.newPage({ deviceScaleFactor: 1 });
  const shot = async (html, file) => {
    await p.setContent(`<!doctype html><html><head><style>@font-face{font-family:AntonLocal;src:url(data:font/ttf;base64,${ANTON})}html,body{margin:0;background:transparent}#x{display:inline-flex;align-items:center}</style></head><body><div id="x">${html}</div></body></html>`);
    await p.evaluate(() => document.fonts.ready);
    await (await p.$("#x")).screenshot({ path: path.join(OUT, file), omitBackground: true });
    console.log("wrote brand/files/" + file);
  };
  const svg = f => fs.readFileSync(path.join(ROOT, f), "utf8").replace(/ width="\d+" height="\d+"/, "");
  await shot(`<div style="width:1040px;height:800px">${svg("brand/files/common-shade-symbol-light-bg.svg").replace("<svg ", '<svg width="1040" height="800" ')}</div>`, "common-shade-symbol-light-bg.png");
  await shot(`<div style="width:1040px;height:800px">${svg("brand/files/common-shade-symbol-dark-bg.svg").replace("<svg ", '<svg width="1040" height="800" ')}</div>`, "common-shade-symbol-dark-bg.png");
  await shot(`<div style="width:512px;height:512px">${svg("brand/files/common-shade-app-icon.svg").replace("<svg ", '<svg width="512" height="512" ')}</div>`, "common-shade-app-icon.png");
  // the lockup at 120 px type, in the header's proportions (mark 30 x 23 px and a 10 px gap at 1.18rem type)
  const F = 120, k = F / 18.88, lock = (posts, ink) => `<span style="display:inline-flex;align-items:center;gap:${Math.round(10 * k)}px;padding:${Math.round(F * .18)}px ${Math.round(F * .12)}px;font-family:AntonLocal;font-size:${F}px;line-height:1;letter-spacing:.06em;color:${ink};white-space:nowrap">` +
    svg(posts === "#16202B" ? "brand/files/common-shade-symbol-light-bg.svg" : "brand/files/common-shade-symbol-dark-bg.svg").replace("<svg ", `<svg width="${Math.round(30 * k)}" height="${Math.round(23 * k)}" `) + `<span style="margin-right:-.06em">COMMON SHADE</span></span>`;
  await shot(lock("#16202B", "#16202B"), "common-shade-logo-light-bg.png");
  await shot(lock("#F6E7D7", "#F6E7D7"), "common-shade-logo-dark-bg.png");
  await b.close();
})().catch(e => { console.error("brand render failed:", e.message); process.exit(1); });
