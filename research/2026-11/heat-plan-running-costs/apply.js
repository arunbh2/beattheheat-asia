#!/usr/bin/env node
// Common Shade: applies the confirmed running-costs claims. Each edit names the claims it carries and is refused unless
// gate.js confirmed them. Exact string replacements keep each file's formatting; a missing or repeated target stops the run.
//   node research/2026-11/heat-plan-running-costs/gate.js && node research/2026-11/heat-plan-running-costs/apply.js
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", "..", ".."), HERE = __dirname;
const OK = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(HERE, "confirmed.json"), "utf8")).map(c => [c.id, c]));
const S = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(HERE, "claims.json"), "utf8")).sources.map(s => [s.key, s]));
const srcText = (k, pad) => `${pad}{\n${pad}  "label": ${JSON.stringify(S[k].label)},\n${pad}  "url": ${JSON.stringify(S[k].url)}\n${pad}}`;
const files = {}, read = f => files[f] = files[f] || fs.readFileSync(path.join(ROOT, f), "utf8");
const problems = [];
function edit(claims, f, from, to) {
  const miss = [].concat(claims).filter(c => !OK[c]); if (miss.length) return problems.push(`${f}: claim ${miss.join(", ")} not confirmed, edit refused`);
  const t = read(f), n = t.split(from).length - 1;
  if (n !== 1) return problems.push(`${f}: expected the target once, found it ${n} times: ${from.slice(0, 70)}...`);
  files[f] = t.replace(from, to);
}

// 1. The cycle node: what the review of 37 plans found
edit("c-two-of-37", "data/core/CONSEQUENCES.json",
  `    "desc": "Warnings, cooling centres, outreach and heat-ready services get a small share of budgets compared with floods or storms.",\n    "sources": [\n      {\n        "label": "Centre for Policy Research, 2023: assessment of 37 heat action plans",\n        "url": "https://cprindia.org/briefsreports/how-is-india-adapting-to-heatwaves-an-assessment-of-heat-action-plans-with-insights-for-transformative-climate-action/"\n      }\n    ]`,
  `    "desc": "Warnings, cooling centres, outreach and heat-ready services get a small share of budgets compared with floods or storms. ${OK["c-two-of-37"] && OK["c-two-of-37"].text}",\n    "sources": [\n      {\n        "label": "Centre for Policy Research, 2023: assessment of 37 heat action plans",\n        "url": "https://cprindia.org/briefsreports/how-is-india-adapting-to-heatwaves-an-assessment-of-heat-action-plans-with-insights-for-transformative-climate-action/"\n      },\n${srcText("cpr-finance", "      ")}\n    ]`);

// 2. Cooling centres: a plan that counts who uses them
const ccText = fs.readFileSync(path.join(ROOT, "data/core/LEVERS.json"), "utf8").split("\n").find(l => l.includes("How much they protect health dep"));
edit("c-nara-users", "data/core/LEVERS.json",
  `${ccText}\n    "guides": [`,
  `${ccText}\n    "example": ${JSON.stringify(OK["c-nara-users"] && OK["c-nara-users"].text)},\n    "exampleSources": [\n${srcText("narayanganj", "      ")}\n    ],\n    "guides": [`);

// 3. Bangladesh snapshot: what the plans say about money (the snapshot is one line of JSON)
edit(["c-nara-costed", "c-hnap-cost"], "research/2026-10/bangladesh_snapshot.json",
  `"verified_role":"Plans include action and cost frameworks; releases not verified"`,
  `"verified_role":${JSON.stringify(`Plans include action and cost frameworks; releases not verified. ${OK["c-nara-costed"] && OK["c-nara-costed"].text} ${OK["c-hnap-cost"] && OK["c-hnap-cost"].text}`)}`);

if (problems.length) { console.error("Nothing written:\n  " + problems.join("\n  ")); process.exit(1); }
for (const [f, t] of Object.entries(files)) { JSON.parse(t); fs.writeFileSync(path.join(ROOT, f), t); }
console.log(`applied ${Object.keys(OK).length} confirmed claims across ${Object.keys(files).length} files: ${Object.keys(files).join(", ")}`);
