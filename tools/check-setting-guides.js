#!/usr/bin/env node
// Common Shade: checks the guides by setting (tools/setting-guides.js). Each guide is linked from Plan a response (step 2),
// Practical actions (interactive and as text, with its llms-full.txt twin), the Act hub (its own row, not repeated in
// "Also in Act") and the Evidence map (its gaps section), and the anchors those links use exist on the guide's page.
// A failure names the page and the guide to add.
//   node tools/check-setting-guides.js
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const SG = require("./setting-guides.js");
const read = f => fs.readFileSync(path.join(ROOT, f), "utf8");
let bad = 0; const ok = (c, m) => { console.log(c ? "  ok  " : "  FAIL", m); if (!c) bad++; };

const G = SG.list(), llms = read("llms-full.txt");
const pages = { "plan/index.html": g => g.url, "practical/index.html": g => g.url, "practical-actions/index.html": g => g.url, "act/index.html": g => g.url, "evidence-map/index.html": g => g.url + g.gaps };
for (const [f, href] of Object.entries(pages)) {
  const html = read(f), miss = G.filter(g => !html.includes(`href="${href(g)}"`)).map(g => href(g));
  ok(!miss.length, `${f} links every guide by setting${miss.length ? "; missing: " + miss.join(", ") + " (fill it from tools/setting-guides.js and rebuild)" : ""}`);
}
for (const g of G) {
  const f = g.url.replace(/^\//, "") + "index.html";
  ok(fs.existsSync(path.join(ROOT, f)), `${g.url} exists`);
  if (!fs.existsSync(path.join(ROOT, f))) continue;
  const html = read(f), miss = [g.lib, g.gaps].filter(a => !html.includes(`id="${a.slice(1)}"`));
  ok(!miss.length, `${g.url} has the anchors the links use${miss.length ? "; missing: " + miss.join(", ") + " (fix lib or gaps in tools/setting-guides.js)" : ""}`);
}
const act = read("act/index.html"), alsoAt = act.indexOf(">Also in Act<"), rowAt = act.indexOf('id="by-setting"');
ok(rowAt > 0, "the Act hub has its \"Guides by setting\" row");
ok(alsoAt < 0 || G.every(g => act.slice(alsoAt).indexOf(`href="${g.url}"`) < 0 || act.slice(alsoAt).indexOf(`href="${g.url}"`) > act.slice(alsoAt).indexOf("</ul>")), "no guide is repeated under \"Also in Act\"");
ok(G.every(g => llms.includes(`${g.title} (`)), "llms-full.txt names every guide in Practical actions");
console.log(bad ? `setting guides check: ${bad} failing` : `setting guides check passed: ${G.length} guides linked from the plan, practical actions, the Act hub and the evidence map`);
process.exit(bad ? 1 : 0);
