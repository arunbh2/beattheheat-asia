#!/usr/bin/env node
// Common Shade: checks Heat in markets and street vending (/market-heat/) and its worksheet.
// The page reuses Heat inside factories' script (factory-heat/factory.js), which reads each card's [data-rec] and
// [data-f=...] fields for Compare and Shortlist; this check fails, naming the record and field, if any is missing, so the
// controls never show empty columns. It also checks the evidence gate (only confirmed claims on the page), the six
// flagship anchors, the page's own shortlist key, the worksheet, and that llms-full.txt carries the same records.
//   node tools/check-market-heat.js
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const T = require("./market-heat-text.js");
const B = require("./build-market-heat.js");
const read = f => fs.readFileSync(path.join(ROOT, f), "utf8");
let bad = 0; const ok = (c, m) => { console.log(c ? "  ok  " : "  FAIL", m); if (!c) bad++; };

const html = read("market-heat/index.html"), ws = read("market-heat/worksheet/index.html"), llms = read("llms-full.txt");
const conf = JSON.parse(read("research/2026-11/market-heat/confirmed.json")), OK = new Set(conf.map(c => c.id));
const C = JSON.parse(read("research/2026-11/market-heat/claims.json"));

// 1. Compare and Shortlist: every field factory.js reads, on every card
const FIELDS = ["t", "addresses", "how", "where", "works", "caution", "upfront", "recurrent", "owners", "equity", "ev", "measure"];
const cards = [...html.matchAll(/<article class="fh-rec[^"]*" id="rec-([a-z-]+)"[^>]*data-rec="([a-z-]+)"[^>]*>([\s\S]*?)<\/article>/g)];
ok(cards.length === T.RECORDS.length, `every record is a card (${cards.length} of ${T.RECORDS.length})`);
const missing = cards.flatMap(([, id, rec, body]) => [...(id !== rec ? [`${id}: anchor and data-rec differ`] : []), ...FIELDS.filter(f => !body.includes(`data-f="${f}"`)).map(f => `${id}: data-f="${f}"`)]);
ok(!missing.length, `each card carries every field Compare and Shortlist read${missing.length ? "; missing: " + missing.join(", ") : ""}`);
ok(!/id="rec-rec-/.test(html), "no doubled rec- prefix in anchors");
const FLAG = ["stall-buddy", "market-toilets", "shaded-creche", "vendor-shade", "spoilage-ice", "market-messengers"];
ok(FLAG.every(id => html.includes(`id="rec-${id}"`)), `the six flagship records have their anchors (#rec-${FLAG.join(", #rec-")})`);
ok(/window\.FH_OPTS=\{"key":"mh-shortlist"/.test(html), "the page keeps its own shortlist (mh-shortlist), apart from Heat inside factories'");
ok(html.includes('"where":"Market types and settings"'), "the comparison names its row \"Market types and settings\"");
ok(read("factory-heat/factory.js").includes("OPT.key || \"fh-shortlist\""), "factory.js still defaults to Heat inside factories' own key");

// 2. evidence: confirmed claims only
const dropped = C.claims.filter(c => !OK.has(c.id));
ok(!dropped.some(c => html.includes(c.text)), `no unconfirmed claim reaches the page${dropped.length ? ` (${dropped.length} held back)` : ""}`);
const evTypes = cards.map(([, id]) => [id, B.evidenceOf(T.RECORDS.find(r => r.id === id), OK)[0].type]);
ok(evTypes.every(([id, type]) => html.includes(`id="rec-${id}"`) && T.EV[type]), "every record shows an evidence type from the page's scale");
ok(T.RECORDS.every(r => r.gap), "every record states what is not known");
ok(!/721|49%/.test(html), "the exact Delhi survey figures, not on the checked page, are not shown");

// 3. structure, worksheet and the text twin
ok(T.ZONES.every(z => html.includes(`id="zone-${z.id}"`) && html.includes(`data-zone="${z.id}"`)), `all ${T.ZONES.length} zones are on the plan and listed in full`);
ok(html.includes('data-time-set="peak"') && html.includes('data-time="edge"'), "the midday and edge-of-day views are both on the page (shown together without JavaScript)");
ok(T.CONDITIONS.every(c => html.includes(`id="cond-${c.id}"`)), "every finder condition is in the table");
ok(ws.includes("Six quick checks") && ws.includes("Protection check before any upgrade") && ws.includes("CC BY 4.0"), "the worksheet has its three parts and the reuse note");
ok(T.RECORDS.every(r => llms.includes(`[rec-${r.id}]`)), "llms-full.txt carries every record");
ok(llms.includes(T.OPEN.q), "llms-full.txt carries the page's opening");
ok(!/—/.test(html.replace(/<script[\s\S]*?<\/script>/g, "")), "no em dashes on the page");

console.log(bad ? `market heat check: ${bad} failing` : `market heat check passed: ${cards.length} records with every comparison field, ${T.ZONES.length} zones, ${OK.size} confirmed claims, worksheet and text twin`);
process.exit(bad ? 1 : 0);
