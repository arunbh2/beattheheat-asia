#!/usr/bin/env node
// Common Shade: applies the confirmed compound dry-hot claims to the map's "Drying soils" consequence (data/core/CONSEQUENCES.json,
// id drysoil): one added passage and its source, the existing text kept. Refused unless gate.js confirmed every claim it carries;
// a missing or repeated target stops the run.
//   node research/2026-11/compound-dry-hot/gate.js && node research/2026-11/compound-dry-hot/apply.js
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", "..", ".."), HERE = __dirname, F = "data/core/CONSEQUENCES.json";
const OK = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(HERE, "confirmed.json"), "utf8")).map(c => [c.id, c]));
const need = ["c-together", "c-yangtze", "c-limit"], miss = need.filter(c => !OK[c]);
if (miss.length) { console.error(`Nothing written: claim ${miss.join(", ")} not confirmed`); process.exit(1); }
const OLD = "In India's 2015 heatwave, drying soils and the heat they gave off added to the second peak of the heat, though not the first.";
const ADD = " Dry soils and extreme heat are also arriving together more often: a daily global estimate for 1961 to 2023 finds such compound events more frequent since 2000 in several hotspot regions, rising faster than either alone would suggest. In China's Yangtze River Basin, the median count per grid square rose from 10 events in 1961-1999 to 21 in 2000-2023. The estimate comes from reanalysis and leaves out irrigation.";
const SRC_BEFORE = `"label": "Ghatak et al., 2017: the role of local heating in the 2015 Indian heat wave (NASA abstract)",\n        "url": "https://ntrs.nasa.gov/citations/20180003614"\n      }`;
const SRC = `,\n      {\n        "label": "Aftab, Hagan et al., Earth System Science Data, 2026: a daily global data set and event catalogue for compound dry-hot extremes, 1961-2023 (open access)",\n        "url": "https://doi.org/10.5194/essd-18-7981-2026"\n      }`;
let t = fs.readFileSync(path.join(ROOT, F), "utf8");
const once = s => t.split(s).length - 1;
if (once(OLD) !== 1 || once(SRC_BEFORE) !== 1) { console.error(`Nothing written: target found ${once(OLD)} and ${once(SRC_BEFORE)} times, expected once each`); process.exit(1); }
if (t.includes("essd-18-7981-2026")) { console.error("Nothing written: the source is already on the record"); process.exit(1); }
t = t.replace(OLD, OLD + ADD).replace(SRC_BEFORE, SRC_BEFORE + SRC);
JSON.parse(t); fs.writeFileSync(path.join(ROOT, F), t);
console.log(`applied ${need.length} confirmed claims to ${F} (drysoil)`);
