#!/usr/bin/env node
// Common Shade: applies the confirmed future-heatwaves claims. Each edit names the claims it carries and is refused
// unless gate.js confirmed them. Exact string replacements keep each file's formatting; a missing or repeated target
// stops the run. The workbook prompt is a question, not a claim, and rides on c-duration.
//   node research/2026-11/future-heatwaves/gate.js && node research/2026-11/future-heatwaves/apply.js
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", "..", ".."), HERE = __dirname;
const OK = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(HERE, "confirmed.json"), "utf8")).map(c => [c.id, c]));
const URL = "https://www.nature.com/articles/s41467-026-76809-5";
const LABEL = "Aglas-Leitner et al., Nature Communications, 2026: recent extreme heatwaves are no match for future events";
const files = {}, read = f => files[f] = files[f] || fs.readFileSync(path.join(ROOT, f), "utf8");
const problems = [];
function edit(claims, f, from, to) {
  const miss = [].concat(claims).filter(c => !OK[c]); if (miss.length) return problems.push(`${f}: claim ${miss.join(", ")} not confirmed, edit refused`);
  const t = read(f), n = t.split(from).length - 1;
  if (n !== 1) return problems.push(`${f}: expected the target once, found it ${n} times: ${from.slice(0, 70)}...`);
  files[f] = t.replace(from, to);
}

// 1. Heat action plans: a watch-out on plans sized to the worst heatwave in memory
const WATCH = "Plans are often sized to the worst heatwave in memory. A 2026 modelling study found that even with low emissions, 6 to 11% of future heatwaves in India and Pakistan, Europe and North Africa could outlast each region’s recent record heatwave; with high emissions, close to 1 in 5 in India and Pakistan.";
if (WATCH.length > 320) problems.push(`watch text is ${WATCH.length} characters; the limit is 320`);
edit(["c-duration", "c-lived"], "data/core/LEVERS.json",
  `        "url": "https://niua.in/publication-details/Heat_Resilient_Cities_Framework"\n      }\n    ]\n  },`,
  `        "url": "https://niua.in/publication-details/Heat_Resilient_Cities_Framework"\n      }\n    ],\n    "watch": [\n      {\n        "text": ${JSON.stringify(WATCH)},\n        "sources": [\n          {\n            "label": ${JSON.stringify(LABEL)},\n            "url": ${JSON.stringify(URL)}\n          }\n        ]\n      }\n    ]\n  },`);

// 2. Planning workbook: will it survive the next season?
edit("c-duration", "data/core/FINANCE.json",
  `"Who pays next year’s premium and running costs?",`,
  `"Who pays next year’s premium and running costs?", "Would the money and staff last through a heatwave longer than the worst on record?",`);

// 3. Learning agenda: a new open question
edit(["c-duration", "c-lived", "c-reference"], "data/site/learning.json",
  `    "could": "Follow consenting users and similar non-users through the rest of hot days, measuring exposure and health.", "scale": "Illustrative: about 150 people over six hot weeks" }\n ]`,
  `    "could": "Follow consenting users and similar non-users through the rest of hot days, measuring exposure and health.", "scale": "Illustrative: about 150 people over six hot weeks" },\n  { "id": "q-longer-heat", "loop": "reactive", "status": "open",\n    "history": [{ "date": "2026-11-09", "status": "open", "note": "Opened on the learning agenda" }],\n    "q": "Can heat plans, budgets and cooling spaces keep running through a heatwave longer than any on record?",\n    "have": "A 2026 modelling study projects that some future heatwaves in India and Pakistan will outlast the 2019 heatwave even with low emissions, and Bangkok reports that running costs are not always covered.",\n    "could": "Test one city’s plan, budget and staffing against a heatwave twice as long as its worst on record, with each department that would run it.", "scale": "Illustrative: one city, a two-day exercise with each lead department" }\n ]`);

if (problems.length) { console.error("Nothing written:\n  " + problems.join("\n  ")); process.exit(1); }
for (const [f, t] of Object.entries(files)) { JSON.parse(t); fs.writeFileSync(path.join(ROOT, f), t); }
console.log(`applied ${Object.keys(OK).length} confirmed claims across ${Object.keys(files).length} files: ${Object.keys(files).join(", ")}`);
