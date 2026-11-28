#!/usr/bin/env node
// Common Shade: every page a reader might look for can be reached from the menu or the footer. Reads sitemap.xml and
// data/site/nav.json; a page in neither fails, named, so a new section never goes missing from navigation.
// Families of pages are reached through their hub (a city through /cities/, a tool profile through /heat-tools/), and a
// few pages are deliberately left out; each is listed below with the reason.
//   node tools/check-nav-coverage.js
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const nav = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "site", "nav.json"), "utf8"));
const FAMILY = [
  [/^\/cities\/[^/]+\/$/, "a city page, reached from /cities/"], [/^\/countries\/[^/]+\/$/, "a country snapshot, reached from /countries/"],
  [/^\/heat-tools\/[^/]+\/$/, "a tool profile, reached from /heat-tools/"], [/^\/paths\/[^/]+\/$/, "a path, reached from Start here and /paths/"],
  [/^\/whats-new\/\d{4}-\d{2}\/$/, "a State of the field edition, reached from /whats-new/"], [/^\/print\/.+\/$/, "a printable sheet, reached from /print/ and its full page"],
  [/^\/briefs\/.+\/$/, "a brief, reached from /briefs/"], [/^\/resources\/.+\/$/, "a resource, reached from /resources/"],
  [/^\/heat-economy\/.+\/$/, "a heat economy page, reached from /heat-economy/ and its money page"], [/^\/solutions\/.+\/$/, "a solutions subpage, reached from /solutions/"],
  [/^\/lancet-countdown-2026\/.+\/$/, "a Lancet Countdown chapter, reached from its overview"], [/^\/[a-z-]+\/(?!$).+\/$/, "a subpage, reached from its parent"]
];
const UNLISTED = { "/404/": "the error page", "/signals/all/": "the no-JavaScript list of every Signals record, linked from /signals/", "/factory-heat/worksheet/": "the printable worksheet, linked from /factory-heat/" };
const inNav = new Set();
for (const g of nav.groups) { inNav.add(g.hub); inNav.add(g.lead[0].replace(/#.*$/, "")); for (const i of g.items) inNav.add(i[0].replace(/#.*$/, "")); }
for (const [u] of nav.footer_extra) inNav.add(u);
const pages = [...fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8").matchAll(/<loc>https:\/\/beattheheat\.asia(\/[^<]*)<\/loc>/g)].map(m => m[1]);
const missing = [];
let listed = 0, family = 0, unlisted = 0;
for (const u of pages) {
  if (u === "/") continue;
  if (inNav.has(u)) { listed++; continue; }
  if (UNLISTED[u]) { unlisted++; continue; }
  if (FAMILY.some(([re]) => re.test(u)) && u.split("/").length > 3) { family++; continue; }
  missing.push(u);
}
const dead = [...inNav].filter(u => u.startsWith("/") && !u.endsWith(".txt") && !pages.includes(u));
let bad = 0; const ok = (c, m) => { console.log(c ? "  ok  " : "  FAIL", m); if (!c) bad++; };
ok(!missing.length, `every top-level page is in the menu or footer${missing.length ? "; missing: " + missing.join(", ") + " (add it to data/site/nav.json, or to UNLISTED here with a reason)" : ""}`);
ok(!dead.length, `every menu and footer link points to a page that exists${dead.length ? "; not found: " + dead.join(", ") : ""}`);
const built = fs.readFileSync(path.join(ROOT, "solutions", "index.html"), "utf8");
const want = nav.groups.filter(g => g.items.some(i => i[3] === 2));
const shown = want.every(g => { const n = g.items.filter(i => i[3] === 2).length; const re = new RegExp(`More in ${g.h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</span> <span class="csn__more-n">${n}</span>`, "g"); return (built.match(re) || []).length === 2; });
ok(shown, "each section's further pages are listed under “More in …”, in both the desktop panel and the phone menu, with the right count");
console.log(bad ? `nav coverage check: ${bad} failing` : `nav coverage check passed: ${listed} pages in the menu or footer, ${family} reached through their section, ${unlisted} deliberately unlisted`);
process.exit(bad ? 1 : 0);
