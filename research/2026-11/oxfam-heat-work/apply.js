#!/usr/bin/env node
// Common Shade: adds the confirmed Oxfam America claims as a "Watch for" on the Heat-safe work lever (data/core/LEVERS.json,
// id heatrules), after its guides. Refused unless gate.js confirmed both claims; a missing or repeated target stops the run.
//   node research/2026-11/oxfam-heat-work/gate.js && node research/2026-11/oxfam-heat-work/apply.js
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", "..", ".."), HERE = __dirname, F = "data/core/LEVERS.json";
const OK = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(HERE, "confirmed.json"), "utf8")).map(c => [c.id, c]));
const miss = ["c-vests", "c-unions"].filter(c => !OK[c]);
if (miss.length) { console.error(`Nothing written: claim ${miss.join(", ")} not confirmed`); process.exit(1); }
const WATCH = "Protections work only when workers can use them. In Hong Kong, some outdoor cleaners given cooling vests were stopped from wearing them because the vests covered a company logo; in Cambodia, researchers found workers whose unions had bargained over heat exposure better protected, as Oxfam America reports.";
if (WATCH.length > 320) { console.error(`Nothing written: watch text is ${WATCH.length} characters; the limit is 320`); process.exit(1); }
const AFTER = `        "title": "Heat Resilient Cities Framework: occupational heat protection for informal workers indoors and out, and who carries duties where there is no single employer (pp. 4, 8)",\n        "url": "https://niua.in/publication-details/Heat_Resilient_Cities_Framework"\n      }\n    ]`;
const ADD = `,\n    "watch": [\n      {\n        "text": ${JSON.stringify(WATCH)},\n        "sources": [\n          {\n            "label": "Oxfam America, Politics of Poverty, 2026: the unequal burden of extreme heat at work",\n            "url": "https://politicsofpoverty.oxfamamerica.org/the-unequal-burden-of-extreme-heat-at-work/"\n          }\n        ]\n      }\n    ]`;
let t = fs.readFileSync(path.join(ROOT, F), "utf8");
const L = JSON.parse(t), lever = L.find(l => l.id === "heatrules");
if (!lever || lever.watch) { console.error("Nothing written: heatrules is missing or already has a watch"); process.exit(1); }
const n = t.split(AFTER).length - 1;
if (n !== 1) { console.error(`Nothing written: target found ${n} times, expected once`); process.exit(1); }
t = t.replace(AFTER, AFTER + ADD);
const check = JSON.parse(t).find(l => l.id === "heatrules");
if (!check.watch || check.watch[0].text !== WATCH) { console.error("Nothing written: the watch did not land on heatrules"); process.exit(1); }
fs.writeFileSync(path.join(ROOT, F), t);
console.log(`applied 2 confirmed claims to ${F} (heatrules watch)`);
