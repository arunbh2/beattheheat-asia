#!/usr/bin/env node
// Common Shade: the reading pass for the running-costs batch. Bangkok's financing strategy found that money to build is
// generally available but running costs are not always covered. This asks whether other heat plans in the region say the
// same. It stages six documents the site already cites, each with probe words (budget, maintenance, recurring and the
// like), so verify-sources.yml saves the passages around them to _excerpts.json. Claims are then written only from
// those passages (claims.json) and gated as usual. Nothing here reaches a page.
//   node research/2026-11/heat-plan-running-costs/probe.js   then run verify-sources.yml with 2026-11-heat-plan-running-costs
"use strict";
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "..", "..", "data", "inbox", "2026-11-heat-plan-running-costs");
const S = [
  ["ahmedabad", "Ahmedabad Heat Action Plan 2019", "Ahmedabad Municipal Corporation", 2019, "City heat action plan", "Ahmedabad",
    "https://heathealth.info/wp-content/uploads/ahmedabad-heat-action-plan-2018.pdf", ["budget", "maintenance", "fund", "Ahmedabad Municipal Corporation"]],
  ["cpr-hap", "How is India adapting to heatwaves? An assessment of heat action plans", "Centre for Policy Research", 2023, "Assessment of 37 heat action plans", "India",
    "https://cprindia.org/briefsreports/how-is-india-adapting-to-heatwaves-an-assessment-of-heat-action-plans-with-insights-for-transformative-climate-action/", ["fund", "budget", "financ", "heat action plans"]],
  ["cpr-finance", "Finding the finance: a guide to identifying centrally sponsored schemes to fund heat resilience solutions", "Centre for Policy Research", 2024, "Guide", "India",
    "https://cprindia.org/workingpapers/finding-the-finance-a-guide-to-identifying-centrally-sponsored-schemes-to-fund-heat-resilience-solutions/", ["centrally sponsored", "fund", "heat"]],
  ["narayanganj", "Heat Action Plan, Narayanganj City Corporation", "Narayanganj City Corporation, with ICLEI South Asia", 2025, "City heat action plan", "Bangladesh",
    "https://southasia.iclei.org/wp-content/uploads/2026/02/Heat-Action-Plan_Narayanganj_Final_9th-Sept_2025_compressed.pdf", ["operation and maintenance", "recurring", "budget", "Narayanganj"]],
  ["bd-hnap", "Bangladesh Health National Adaptation Plan 2026", "Government of Bangladesh (IEDCR)", 2026, "National health adaptation plan", "Bangladesh",
    "https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-iedcr/2026/2/9ef9325c-4d07-45ce-9159-94a51b2fce43.pdf", ["heat", "budget", "recurring", "operational"]],
  ["khulna", "Strengthening heat governance in Khulna, Bangladesh", "Practical Action", 2026, "Policy brief (summary page)", "Bangladesh",
    "https://practicalaction.org/knowledge-centre/resources/strengthening-heat-governance-in-khulna-bangladesh/", ["Khulna", "budget", "fund", "heat"]],
];
const list = S.map(([key, title, publisher, year, kind, where, url, expect]) => ({ id: "src-run-" + key, type: "source", keys: [key], title, publisher, year, url, kind, where, expect, claims: [],
  note: "Staged for the reading pass of the running-costs batch: the checker saves the passages around each probe word. Not published from the inbox." }));
fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(path.join(DIR, "sources.json"), JSON.stringify(list, null, 1) + "\n");
fs.writeFileSync(path.join(DIR, "README.md"), `# Running costs in the region's heat plans, November 2026: reading pass

Staged by research/2026-11/heat-plan-running-costs/probe.js. Run .github/workflows/verify-sources.yml with
\`2026-11-heat-plan-running-costs\`; it saves the passages around each probe word to _excerpts.json. Nothing here is
published; claims are written from those passages and gated before any page uses them.
`);
console.log(`staged ${list.length} documents for the reading pass`);
