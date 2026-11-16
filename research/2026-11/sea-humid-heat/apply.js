#!/usr/bin/env node
// Common Shade: applies the confirmed Southeast Asia humid heat claims, beside the future heatwaves study (which covers
// daily maximum temperature in India and Pakistan, not humid heat or Southeast Asia). Each edit names the claims it
// carries and is refused unless gate.js confirmed them; a missing or repeated target stops the run.
//   node research/2026-11/sea-humid-heat/gate.js && node research/2026-11/sea-humid-heat/apply.js
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", "..", ".."), HERE = __dirname;
const OK = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(HERE, "confirmed.json"), "utf8")).map(c => [c.id, c]));
const URL = "https://doi.org/10.1038/s41598-025-28817-6";
const LABEL = "Scientific Reports, 2025: widespread heat stress will become the norm in a warming Southeast Asia (open access; Europe PMC PMC12756238)";
const files = {}, read = f => files[f] = files[f] || fs.readFileSync(path.join(ROOT, f), "utf8");
const problems = [];
function edit(claims, f, from, to) {
  const miss = [].concat(claims).filter(c => !OK[c]); if (miss.length) return problems.push(`${f}: claim ${miss.join(", ")} not confirmed, edit refused`);
  const t = read(f), n = t.split(from).length - 1;
  if (n !== 1) return problems.push(`${f}: expected the target once, found it ${n} times: ${from.slice(0, 70)}...`);
  files[f] = t.replace(from, to);
}
// 1. Heat action plans: a second watch-out, on humid heat in Southeast Asia, after the one on longer heatwaves
const WATCH = "Humid heat is a separate test. A 2025 study using WBGT and UTCI projects that people in Southeast Asia exposed to at least a week in a row of extreme WBGT could rise from 0.1 million to 7 to 17 million, and that Myanmar, Thailand and Cambodia face 6 to 9 hours of severe heat stress a day in peak months.";
if (WATCH.length > 320) problems.push(`watch text is ${WATCH.length} characters; the limit is 320`);
const PREV = `            "url": "https://www.nature.com/articles/s41467-026-76809-5"\n          }\n        ]\n      }\n    ]`;
edit(["c-week", "c-hours", "c-method"], "data/core/LEVERS.json", PREV,
  `            "url": "https://www.nature.com/articles/s41467-026-76809-5"\n          }\n        ]\n      },\n      {\n        "text": ${JSON.stringify(WATCH)},\n        "sources": [\n          {\n            "label": ${JSON.stringify(LABEL)},\n            "url": ${JSON.stringify(URL)}\n          }\n        ]\n      }\n    ]`);
// 2. Learning agenda: what we have on longer heat now includes humid heat in Southeast Asia
edit("c-week", "data/site/learning.json",
  `"have": "A 2026 modelling study projects that some future heatwaves in India and Pakistan could outlast the 2019 heatwave, the region’s reference event, even with low emissions.",`,
  `"have": "A 2026 modelling study projects that some future heatwaves in India and Pakistan could outlast the 2019 heatwave, the region’s reference event, even with low emissions. A 2025 study projects that far more people in Southeast Asia could face a week or more of extreme humid heat stress.",`);
if (problems.length) { console.error("Nothing written:\n  " + problems.join("\n  ")); process.exit(1); }
for (const [f, t] of Object.entries(files)) { JSON.parse(t); fs.writeFileSync(path.join(ROOT, f), t); }
console.log(`applied ${Object.keys(OK).length} confirmed claims across ${Object.keys(files).length} files: ${Object.keys(files).join(", ")}`);
