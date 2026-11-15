#!/usr/bin/env node
// Common Shade: checks "Heat over time". 1. the statistics in tools/city-history/stats.js on fixed numbers (percentile, the
// normal distribution, Sen's slope, Mann-Kendall with ties, the three tiers of words); 2. every data/city-history/<id>.json:
// a full run of complete years, counts in range, a trend with words for each measure, the model and grid cell recorded.
// Usage: node tools/check-city-history.js [--stats-only]
"use strict";
const fs = require("fs"), path = require("path"), S = require("./city-history/stats.js");
const ROOT = path.join(__dirname, ".."), fails = [], fail = m => fails.push(m), near = (a, b, t) => Math.abs(a - b) <= t;
if (!near(S.percentile([1, 2, 3, 4, 5], 90), 4.6, 1e-9) || !near(S.percentile([10, 20], 50), 15, 1e-9)) fail("percentile: wrong value on fixed lists");
if (!near(S.phi(1.96), 0.975, 0.0005) || !near(S.phi(0), 0.5, 1e-9)) fail("phi: the normal distribution is off");
if (S.senSlope([1, 2, 3, 4, 5]) !== 1 || S.senSlope([5, 4, 3, 2, 1]) !== -1) fail("senSlope: wrong slope on a straight line");
const up = S.mannKendall([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]); if (up.S !== 45 || !(up.p < 0.001)) fail("mannKendall: a steady rise is not clear");
const flat = S.mannKendall([3, 1, 4, 1, 5, 9, 2, 6, 5, 3]); if (!(flat.p > 0.2)) fail("mannKendall: noise reads as a trend");
if (S.trend([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).words !== "a clear rise" || S.trend([3, 1, 4, 1, 5, 9, 2, 6, 5, 3]).words !== "no clear change") fail("trend: wrong words");
const M = S.measures([{ date: "2001-01-01", tmax: 30, tmin: 20 }, { date: "2001-01-02", tmax: 40, tmin: 30 }, { date: "2002-01-01", tmax: 35, tmin: 25 }], [2001, 2002]);
if (M.years.length !== 2 || M.years[0].hottest !== 40) fail("measures: wrong yearly grouping or hottest day");
if (!process.argv.includes("--stats-only")) {
  const DIR = path.join(ROOT, "data", "city-history"), files = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter(f => f.endsWith(".json")) : [];
  for (const f of files) { const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")), at = "data/city-history/" + f;
    const n = d.period[1] - d.period[0] + 1;
    if (d.years.length < n - 1) fail(`${at}: ${d.years.length} years of ${n}`);
    for (const y of d.years) { if (!(y.warm_nights >= 0 && y.warm_nights <= 366 && y.hot_days >= 0 && y.hot_days <= 366)) fail(`${at}: ${y.year} counts out of range`); if (!(y.hottest > 0 && y.hottest < 60)) fail(`${at}: ${y.year} hottest day ${y.hottest} °C is not plausible`); }
    for (const k of ["warm_nights", "hot_days", "hottest"]) if (!d.trends[k] || !d.trends[k].words) fail(`${at}: no trend words for ${k}`);
    if (d.model !== "era5_land" || !d.grid || d.grid.lat == null) fail(`${at}: the model and grid cell are not recorded`);
  }
  if (!fails.length) console.log(`city history check passed: statistics tests, ${files.length} city file(s)`);
} else if (!fails.length) console.log("city history statistics tests passed");
if (fails.length) { console.log(fails.map(x => "  FAIL " + x).join("\n")); process.exit(1); }
