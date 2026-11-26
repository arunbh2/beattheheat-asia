#!/usr/bin/env node
// Common Shade: renders the one link-preview image every page shares, images/share-systems-map.jpg (1200 x 630).
// It is a capture of the real systems map from the built homepage, never a redrawing: the same dots, links, rings and
// break markers, with the small consequence labels hidden (they cannot be read at preview size) and the whole circle
// in view. card.html holds the words and layout around it. Deterministic: the map's own fixed layout, a fixed viewport,
// no live data on the map. Re-run only as a deliberate change (platforms cache previews, and the file name is the cache
// key: change the name in data/site/share.json "image" if the picture changes a lot).
//   python3 -m http.server 8765 &   then   node tools/share-image/render.js [http://localhost:8765/]
// Needs the network for the card's Google Fonts (Anton, Hanken Grotesk), the fonts the site itself uses.
"use strict";
const { chromium } = require(process.env.PW || "playwright");
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", ".."), BASE = process.argv[2] || "http://localhost:8765/";
const OUT = path.join(ROOT, "images", "share-systems-map.jpg");
(async () => {
  const b = await chromium.launch();
  // 1. the map, from the homepage, at twice the size it is shown on the card
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  await p.goto(BASE, { waitUntil: "networkidle" });
  const st = await p.$("#map-stage"); await st.scrollIntoViewIfNeeded(); await p.waitForTimeout(2600);   // let the map settle
  await p.addStyleTag({ content: ".zoom,.wheel-hint,.map__hint,.panel{display:none!important}.node__label{display:none!important}.rim-label{font-size:96px!important}#map-stage{border:0!important;border-radius:0!important;box-shadow:none!important;background:#FAF7F2!important}#map-stage::before,#map-stage::after{display:none!important}" });  // controls, and labels too small to read at preview size
  await p.evaluate(() => {
    const st = document.querySelector("#map-stage"), s = st.querySelector("svg");
    s.setAttribute("viewBox", "-1720 -1720 3440 3440");                                      // the whole circle, rim labels included
    Object.assign(st.style, { width: "1260px", height: "1260px", maxWidth: "none", aspectRatio: "auto" });
    Object.assign(s.style, { width: "1260px", height: "1260px", maxWidth: "none" });
  });
  await p.setViewportSize({ width: 1440, height: 1400 }); await p.waitForTimeout(600);
  const map = await (await p.$("#map-stage")).screenshot({ type: "png" });
  // 2. the card around it
  const c = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  const html = fs.readFileSync(path.join(__dirname, "card.html"), "utf8").replace('src="MAP_SRC"', 'src="data:image/png;base64,' + map.toString("base64") + '"');
  await c.setContent(html, { waitUntil: "networkidle" }); await c.evaluate(() => document.fonts.ready);
  // the smallest file that keeps the map's lines clean, and well under the platforms' limits (WhatsApp is the strictest)
  let q = 86, buf;
  do { buf = await (await c.$("#card")).screenshot({ type: "jpeg", quality: q }); q -= 4; } while (buf.length > 250 * 1024 && q >= 60);
  fs.writeFileSync(OUT, buf);
  console.log(`wrote ${path.relative(ROOT, OUT)}: 1200 x 630, ${Math.round(buf.length / 1024)} KB (JPEG quality ${q + 4})`);
  await b.close();
})();
