#!/usr/bin/env node
// Common Shade: heat over time for city pages. Runs on GitHub (.github/workflows/city-history.yml), never in a browser.
//   node tools/city-history/run.js <ids or "all">   writes data/city-history/<id>.json
// Reads the Open-Meteo Historical Weather API (free, no account; CC BY 4.0) for one point at each city centre, with one named
// model (ERA5-Land, so a coastal city's cell is land and the series never switches models), local days and completed years only.
// Measures per year: warm nights and hot days (days above the city's own 90th percentile of the whole record, ETCCDI TN90p and
// TX90p style, as counts) and the hottest day (TXx). Trend: Sen's slope per decade, its 95% range and a tie-corrected
// Mann-Kendall test, in three tiers of words. Rainfall is left out (the model's tropical rain is unreliable).
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm"), S = require("./stats.js");
const ROOT = path.join(__dirname, "..", ".."), Y0 = 1991, Y1 = 2025, MODEL = "era5_land";
const ctx = {}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(ROOT, "data.js"), "utf8") + ";this.C=LIVE_CITIES", ctx);
const arg = process.argv[2] || "bangkok,kolkata", ids = arg === "all" ? ctx.C.map(c => c.id) : arg.split(",");
const UA = "CommonShade-city-history/1.0 (+https://beattheheat.asia/approach/)";
async function get(u) { for (let k = 0; k < 5; k++) { try { const r = await fetch(u, { headers: { "User-Agent": UA } }); if (r.ok) return r.json(); console.log(`  ${r.status} ${u}`); } catch (e) { console.log("  " + e.message); } await new Promise(z => setTimeout(z, 15000 * (k + 1))); } throw new Error("no answer from " + u); }
(async () => { let bad = 0;
  for (const id of ids) { const c = ctx.C.find(x => x.id === id); if (!c) { console.error("no city " + id); bad++; continue; }
    try {
      const u = `https://archive-api.open-meteo.com/v1/archive?latitude=${c.lat}&longitude=${c.lon}&start_date=${Y0}-01-01&end_date=${Y1}-12-31&daily=temperature_2m_max,temperature_2m_min&timezone=auto&models=${MODEL}`;
      const j = await get(u), d = j.daily || {};
      const days = (d.time || []).map((t, i) => ({ date: t, tmax: d.temperature_2m_max[i], tmin: d.temperature_2m_min[i] })).filter(x => x.tmax != null && x.tmin != null);
      const M = S.measures(days, [Y0, Y1]), yrs = M.years.filter(y => y.days >= 360);
      if (yrs.length < Y1 - Y0 + 1 - 1) throw new Error(`only ${yrs.length} complete years`);
      const series = k => yrs.map(y => y[k]);
      const out = { city: id, name: c.name, generated: new Date().toISOString().slice(0, 10), period: [Y0, Y1], model: MODEL,
        grid: { lat: j.latitude, lon: j.longitude, elevation_m: j.elevation }, thresholds: { warm_night_c: +M.thresholds.tn90.toFixed(1), hot_day_c: +M.thresholds.tx90.toFixed(1) },
        years: yrs.map(y => ({ year: y.year, warm_nights: y.warm_nights, hot_days: y.hot_days, hottest: +y.hottest.toFixed(1) })),
        trends: { warm_nights: S.trend(series("warm_nights")), hot_days: S.trend(series("hot_days")), hottest: S.trend(series("hottest")) },
        source: { name: "Open-Meteo Historical Weather API, ERA5-Land reanalysis (Copernicus Climate Change Service)", licence: "CC BY 4.0", url: "https://open-meteo.com/en/docs/historical-weather-api" } };
      fs.mkdirSync(path.join(ROOT, "data", "city-history"), { recursive: true });
      fs.writeFileSync(path.join(ROOT, "data", "city-history", id + ".json"), JSON.stringify(out, null, 1) + "\n");
      console.log(`${id}: ${yrs.length} years, grid ${j.latitude},${j.longitude} (${j.elevation} m); warm nights ${out.trends.warm_nights.words} (${out.trends.warm_nights.per_decade}/decade), hot days ${out.trends.hot_days.words}, hottest ${out.trends.hottest.words}`);
      await new Promise(z => setTimeout(z, 3000));
    } catch (e) { bad++; console.error(`FAILED ${id}: ${e.message}`); } }
  if (bad) process.exit(1);
})();
