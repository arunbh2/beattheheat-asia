#!/usr/bin/env node
// Stages the sources for the city heat briefing (research/2026-11/city-heat/BUILD_BRIEF.md) for checking.
// Each record carries the terms its page has to hold; .github/workflows/verify-sources.yml with month
// 2026-11-city-heat opens every link on GitHub and fills link-check.json and _excerpts.json. Only sources that pass
// with every term found are cited on the site.
"use strict";
const fs = require("fs"), path = require("path");
const OUT = path.join(__dirname, "..", "..", "..", "data", "inbox", "2026-11-city-heat");
const S = (id, step, title, publisher, year, url, expect, kind = "Method") => ({ id: "ch-" + id, type: "source", step, title, publisher, year, url, kind, expect,
  note: "Staged for the city heat briefing to check the page opens and holds these terms before the site uses it. Not published from the inbox." });
const R = [
  // step 1: the heat-stress estimate (WBGT) and the data it is calculated from
  S("bom-wbgt", 1, "Thermal comfort observations: about the approximation to the WBGT", "Australian Bureau of Meteorology", 2010, "http://www.bom.gov.au/info/thermal_stress/", ["0.567", "0.393", "3.94", "6.105", "17.27", "237.7"]),
  S("bom-wbgt-light-wind", 1, "Thermal comfort observations: the approximation's assumptions", "Australian Bureau of Meteorology", 2010, "http://www.bom.gov.au/info/thermal_stress/#approximation", ["light wind", "radiation"]),
  S("lemke-2012", 1, "Calculating workplace WBGT from meteorological data: a tool for climate change assessment", "Industrial Health (Lemke and Kjellstrom)", 2012, "https://www.jstage.jst.go.jp/article/indhealth/50/4/50_MS1352/_pdf", ["Bureau of Meteorology", "WBGT"], "Study"),
  S("lemke-2012-pubmed", 1, "Calculating workplace WBGT from meteorological data: a tool for climate change assessment (PubMed record)", "Industrial Health (Lemke and Kjellstrom)", 2012, "https://pubmed.ncbi.nlm.nih.gov/22673363/", ["WBGT", "meteorological"], "Study"),
  S("om-docs", 1, "Weather forecast API documentation", "Open-Meteo", 2026, "https://open-meteo.com/en/docs", ["relative_humidity_2m", "temperature_2m", "hourly"], "Data documentation"),
  S("om-sample", 1, "Weather forecast API: hourly temperature and humidity for Singapore and Bangkok", "Open-Meteo", 2026, "https://api.open-meteo.com/v1/forecast?latitude=1.35,13.75&longitude=103.82,100.5&current=temperature_2m,relative_humidity_2m&hourly=temperature_2m,relative_humidity_2m&timezone=auto&forecast_days=4", ["relative_humidity_2m", "utc_offset_seconds"], "Data sample"),
  S("sg-wbgt-sample", 1, "Real-time wet-bulb globe temperature, Singapore", "National Environment Agency via data.gov.sg", 2026, "https://api-open.data.gov.sg/v2/real-time/api/weather?api=wbgt", ["wbgt", "heatStress"], "Data sample"),
];
const ids = new Set(); for (const r of R) { if (ids.has(r.id)) throw new Error("duplicate id " + r.id); ids.add(r.id); }
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "sources.json"), JSON.stringify(R, null, 1) + "\n");
fs.writeFileSync(path.join(OUT, "README.md"), "# City heat briefing, November 2026: sources to check\n\nStaged by research/2026-11/city-heat/stage.js. Run .github/workflows/verify-sources.yml with `2026-11-city-heat`; it fills link-check.json and _excerpts.json. Only sources that open with every expected term found are cited. Not merged into the monthly knowledge base.\n");
console.log(`staged ${R.length} sources`);
