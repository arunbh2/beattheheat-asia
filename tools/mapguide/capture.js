#!/usr/bin/env node
// Captures the real heat map in the states the map guide film walks through, from the built site served locally.
// It writes tools/mapguide/shots/<state>.jpg (the map), <state>-panel.jpg (the side card, where the film shows one)
// and points.json: where each dot the film points at sits in each picture, as fractions of its width and height.
//   python3 -m http.server 8765 &   then   PW=<path to playwright> node tools/mapguide/capture.js [http://localhost:8765/]
"use strict";
const { chromium } = require(process.env.PW || "playwright");
const path = require("path"), fs = require("fs");
const BASE = process.argv[2] || "http://localhost:8765/", OUT = path.join(__dirname, "shots");
// state name, the map's own link (hash), the dots and break markers to locate, and whether to keep the side card
const STATES = [
  ["web", "", ["heat", "power", "scarcity", "harvests", "deaths", "lost"], false],
  ["power", "power", ["power", "generators", "coldchain", "hsys", "scarcity", "demand"], true],
  ["loop", "loop-cooling", ["demand", "uhi"], false],
  ["lever", "break-greencity", ["demand", "uhi", "lever:greencity"], true],
  ["package", "package-cities", ["sleepless", "uhi", "homes"], false],
];
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch(), points = {};
  for (const [name, hash, ids, keepPanel] of STATES) {
    const p = await b.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1.5 });
    await p.goto(BASE + (hash ? "#" + hash : ""), { waitUntil: "networkidle" });
    await p.addStyleTag({ content: ".zoom, .wheel-hint { display: none !important; }" });
    const stage = await p.$("#map-stage");
    await stage.scrollIntoViewIfNeeded(); await p.waitForTimeout(2600);           // let the map finish flying
    const box = await stage.boundingBox();
    points[name] = await p.evaluate(({ ids, box }) => {
      const o = {};
      ids.forEach(id => {
        const el = id.startsWith("lever:") ? document.querySelector(`.lever[data-lever="${id.slice(6)}"] circle, .lever[data-lever="${id.slice(6)}"]`)
          : document.querySelector(`.node[data-id="${id}"] circle`);
        if (!el) return;
        const r = el.getBoundingClientRect();
        o[id] = [+((r.x + r.width / 2 - box.x) / box.width).toFixed(4), +((r.y + r.height / 2 - box.y) / box.height).toFixed(4)];
      });
      return o;
    }, { ids, box });
    await stage.screenshot({ path: path.join(OUT, name + ".jpg"), type: "jpeg", quality: 82 });
    if (keepPanel) await (await p.$("#panel")).screenshot({ path: path.join(OUT, name + "-panel.jpg"), type: "jpeg", quality: 85 });
    console.log(name, JSON.stringify(points[name]));
    await p.close();
  }
  fs.writeFileSync(path.join(OUT, "points.json"), JSON.stringify(points, null, 1) + "\n");
  await b.close();
})();
