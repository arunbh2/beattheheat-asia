#!/usr/bin/env node
// Stages the sources for the Philippines' October 2026 labour advisories on heat (Labor Advisory No. 19 and No. 20,
// series of 2026) for checking. .github/workflows/verify-sources.yml with month 2026-11-ph-labor-advisories opens
// every link on GitHub and fills link-check.json and _excerpts.json. A claim reaches the site only when its source
// passed with every term it rests on found; the plan is PLAN.md and the claims ledger is ledger.md beside this file.
// Pass 1 (this file as first committed): the issuing agency's own pages and government and news reports. Pass 2 adds
// the two advisory PDFs once their official links are known (they are never guessed).
// Each record's expect lists the terms its claims rest on first, then probe terms (marked in ledger.md) whose excerpts
// settle open points; Signals evidence names only the terms that came back true.
"use strict";
const fs = require("fs"), path = require("path");
const OUT = path.join(__dirname, "..", "..", "..", "data", "inbox", "2026-11-ph-labor-advisories");
const S = (id, title, publisher, year, url, expect, kind) => ({ id: "phla-" + id, type: "source", region: "asia", title, publisher, year, url, kind, expect,
  note: "Staged to check the Philippines' October 2026 labour advisories on heat against their sources before the site uses them. Not published from the inbox." });
const R = [
  // the issuing agency
  S("bwc-list", "Labor advisories (issuances list)", "Bureau of Working Conditions, Department of Labor and Employment", 2026, "https://bwc.dole.gov.ph/issuances/labor-advisories/",
    ["Labor Advisory No. 20", "Labor Advisory No. 19", "Heat Stress", "Compensability"], "Government page"),
  S("dole-news", "DOLE outlines new protocols to protect workers amid El Nino", "Department of Labor and Employment", 2026, "https://dole.gov.ph/news/dole-outlines-new-protocols-to-protect-workers-amid-el-nino/",
    ["Labor Advisory No. 20", "heat index", "heat stress", "HIRAC", "flexible work", "PAGASA"], "Government press release"),
  // government news agency and news reports (secondary)
  S("pia", "Heat-related illnesses may qualify for workers' compensation", "Philippine Information Agency", 2026, "https://pia.gov.ph/news/luzon/ncr/heat-related-illnesses-may-qualify-for-workers-compensation",
    ["compensation", "heat", "Labor Advisory No. 19", "rhabdomyolysis", "syncope"], "Government news agency report"),
  S("newswatch", "DOLE releases advisory on safety protocols during El Nino", "NewsWatch Plus", 2026, "https://www.newswatchplus.ph/2026/10/28/dole-releases-advisory-on-safety-protocols-during-el-nino/",
    ["heat index", "flexible work", "52"], "News report"),
  S("sunstar", "Workers who fall ill from heat amid El Nino may qualify for benefits", "SunStar Cebu", 2026, "https://www.sunstar.com.ph/cebu/dole-workers-who-fall-ill-from-heat-amid-el-ni%C3%B1o-may-qualify-for-benefits",
    ["rhabdomyolysis", "syncope", "Employees' Compensation"], "News report"),
  S("bmirror", "Beat the heat, DOLE expands compensation list", "BusinessMirror", 2026, "https://businessmirror.com.ph/2026/10/26/beat-the-heat-dole-expands-compensation-list/",
    ["rhabdomyolysis", "syncope", "compensation"], "News report"),
  // a reading aid only: an HR association's circular that may reproduce the advisory; never cited on the site
  S("pmap", "Circular 2026-070: Labor Advisory No. 20, series of 2026", "People Management Association of the Philippines", 2026, "https://pmap.org.ph/circular-no-2026-070-labor-advisory-no-20-series-of-2026-guidelines-on-the-prevention-and-management-of-heat-stress-during-el-nino-and-other-periods-of-extreme-heat/",
    ["Labor Advisory No. 20", "heat stress", "Series of 2023", "repeal"], "Association circular (reading aid, not cited)"),
];
const ids = new Set(); for (const r of R) { if (ids.has(r.id)) throw new Error("duplicate id " + r.id); ids.add(r.id); }
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "sources.json"), JSON.stringify(R, null, 1) + "\n");
fs.writeFileSync(path.join(OUT, "README.md"), "# The Philippines' October 2026 labour advisories on heat: sources to check\n\nStaged by research/2026-11/ph-labor-advisories/stage.js. Run .github/workflows/verify-sources.yml with month `2026-11-ph-labor-advisories`. Nothing here is published; the plan and ledger are in research/2026-11/ph-labor-advisories/.\n");
console.log(`staged ${R.length} sources`);
