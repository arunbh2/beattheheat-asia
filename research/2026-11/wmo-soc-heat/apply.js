#!/usr/bin/env node
// Common Shade: adds the confirmed WMO State of the Climate points to two Signals records' summaries (data/site/signals.json):
// India's April 2026 heat exposure and early-warning growth on sig-wmo-state-of-climate-2026, WHO's health emergency on
// sig-el-nino-2026-2027. Both already cite the WMO press release (source id wmo-press). Refused unless gate.js confirmed the
// claims; each target sentence must be found once. Then run node tools/signals-sync.js.
//   node research/2026-11/wmo-soc-heat/gate.js && node research/2026-11/wmo-soc-heat/apply.js && node tools/signals-sync.js
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", "..", ".."), HERE = __dirname, F = path.join(ROOT, "data", "site", "signals.json");
const OK = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(HERE, "confirmed.json"), "utf8")).map(c => [c.id, c]));
const S = JSON.parse(fs.readFileSync(F, "utf8")), problems = [];
function add(id, claims, sentence) {
  const miss = claims.filter(c => !OK[c]); if (miss.length) return problems.push(`${id}: claim ${miss.join(", ")} not confirmed`);
  const r = S.signals.find(x => x.id === id); if (!r) return problems.push(`${id}: no record`);
  if (!(r.sources || []).some(s => s.id === "wmo-press")) return problems.push(`${id}: does not cite wmo-press`);
  if (r.summary.includes(sentence)) return problems.push(`${id}: already added`);
  r.summary = r.summary.trimEnd() + " " + sentence; r.review.reviewed = "2026-11-17";
}
add("sig-wmo-state-of-climate-2026", ["c-india", "c-mhews"], "It estimates that 146.5 million people in India were exposed to extreme heat in an April 2026 heatwave, and that the number of countries reporting multi-hazard early warning systems rose from 56 in 2015 to 136 in 2025.");
add("sig-el-nino-2026-2027", ["c-who"], "WMO calls it a risk multiplier for health, and reports that WHO has, for the first time, classified the anticipated health impacts as a health emergency.");
if (problems.length) { console.error("Nothing written:\n  " + problems.join("\n  ")); process.exit(1); }
fs.writeFileSync(F, JSON.stringify(S, null, 1) + "\n");
console.log("applied 3 confirmed claims to 2 Signals records; now run node tools/signals-sync.js");
