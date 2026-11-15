#!/usr/bin/env node
// Common Shade: heat over time for city pages. Runs on GitHub (.github/workflows/city-history.yml), never in a browser.
//   node tools/city-history/run.js <ids or "all"> [discover]   writes data/city-history/<id>.json (discover: prints station completeness only)
// The main record is a weather station from NOAA GHCN-Daily (public domain, no account, NCEI Access Data Service) that passes
// completeness rules (a year counts with at most 15 days and no more than 3 days in any month missing; at least 80% of years
// valid, with at least 5 valid years in both the first and the last decade). The reanalysis is shown beside it as the
// regional background: it has no urban surface, so it leaves out the built-up city (an independent review advised this).
// Where no station passes, the city shows no trend.
// Reads the Open-Meteo Historical Weather API (free, no account; CC BY 4.0) for one point at each city centre, with one named
// model (ERA5-Land, so a coastal city's cell is land and the series never switches models), local days and completed years only.
// Measures per year: warm nights and hot days (days above the city's own 90th percentile of the whole record, ETCCDI TN90p and
// TX90p style, as counts) and the hottest day (TXx). Trend: Sen's slope per decade, its 95% range and a tie-corrected
// Mann-Kendall test, in three tiers of words. Rainfall is left out (the model's tropical rain is unreliable).
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm"), S = require("./stats.js");
const ROOT = path.join(__dirname, "..", ".."), Y0 = 1991, Y1 = 2025, MODEL = "era5_land";
const ctx = {}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(ROOT, "data.js"), "utf8") + ";this.C=LIVE_CITIES", ctx);
const arg = process.argv[2] || "bangkok,kolkata", MODE = process.argv[3] || "build", STATIONS = JSON.parse(fs.readFileSync(path.join(__dirname, "stations.json"), "utf8")), ids = arg === "all" ? ctx.C.map(c => c.id) : arg.split(",");
const UA = "CommonShade-city-history/1.0 (+https://beattheheat.asia/approach/)";
async function get(u) { for (let k = 0; k < 5; k++) { try { const r = await fetch(u, { headers: { "User-Agent": UA } }); if (r.ok) return r.json(); console.log(`  ${r.status} ${u}`); } catch (e) { console.log("  " + e.message); } await new Promise(z => setTimeout(z, 15000 * (k + 1))); } throw new Error("no answer from " + u); }
function summarise(days, years) {
  const keep = days.filter(d => years.includes(+d.date.slice(0, 4)));
  const M = S.measures(keep, [Y0, Y1]), yrs = M.years.filter(y => years.includes(y.year)), xs = yrs.map(y => y.year), ser = k => yrs.map(y => y[k]);
  return { thresholds: { warm_night_c: +M.thresholds.tn90.toFixed(1), hot_day_c: +M.thresholds.tx90.toFixed(1) },
    years: yrs.map(y => ({ year: y.year, warm_nights: y.warm_nights, hot_days: y.hot_days, hottest: +y.hottest.toFixed(1) })),
    trends: { warm_nights: S.trend(ser("warm_nights"), xs), hot_days: S.trend(ser("hot_days"), xs), hottest: S.trend(ser("hottest"), xs) } };
}
async function station(id) {
  const u = `https://www.ncei.noaa.gov/access/services/data/v1?dataset=daily-summaries&stations=${id}&dataTypes=TMAX,TMIN&startDate=${Y0}-01-01&endDate=${Y1}-12-31&units=metric&format=json&includeStationName=true&includeStationLocation=1`;
  const rows = await get(u); if (!Array.isArray(rows) || !rows.length) return { id, ok: false, why: "no data" };
  const days = rows.map(r => ({ date: r.DATE, tmax: r.TMAX != null && r.TMAX !== "" ? +r.TMAX : null, tmin: r.TMIN != null && r.TMIN !== "" ? +r.TMIN : null }));
  const all = []; for (let y = Y0; y <= Y1; y++) all.push(y);
  const valid = all.filter(y => S.validYear(days.filter(d => d.date.startsWith(y + "-")), y));
  const first = valid.filter(y => y < Y0 + 10).length, last = valid.filter(y => y > Y1 - 10).length, need = Math.ceil(0.8 * all.length);
  const ok = valid.length >= need && first >= 5 && last >= 5;
  return { id, ok, name: rows[0].NAME || "", lat: rows[0].LATITUDE != null ? +rows[0].LATITUDE : null, lon: rows[0].LONGITUDE != null ? +rows[0].LONGITUDE : null, elevation_m: rows[0].ELEVATION != null ? +rows[0].ELEVATION : null,
    valid_years: valid.length, of: all.length, first_decade: first, last_decade: last, why: ok ? "" : `${valid.length} of ${all.length} years complete (needs ${need}), ${first} in the first decade and ${last} in the last (needs 5 each)`, days, valid };
}
(async () => { let bad = 0;
  for (const id of ids) { const c = ctx.C.find(x => x.id === id); if (!c) { console.error("no city " + id); bad++; continue; }
    try {
      const tried = []; let st = null;
      for (const sid of STATIONS[id] || []) { const r = await station(sid); tried.push({ id: sid, name: r.name || "", ok: r.ok, why: r.why || "" });
        console.log(`${id} station ${sid} ${r.name || ""}: ${r.ok ? "passes" : "does not pass"}${r.valid_years != null ? ` (${r.valid_years} of ${r.of} years complete, ${r.first_decade} in the first decade, ${r.last_decade} in the last)` : ` (${r.why})`}`);
        if (r.ok && !st) st = r; }
      if (MODE === "discover") continue;
      const u = `https://archive-api.open-meteo.com/v1/archive?latitude=${c.lat}&longitude=${c.lon}&start_date=${Y0}-01-01&end_date=${Y1}-12-31&daily=temperature_2m_max,temperature_2m_min&timezone=auto&models=${MODEL}`;
      const j = await get(u), d = j.daily || {};
      const rdays = (d.time || []).map((t, i) => ({ date: t, tmax: d.temperature_2m_max[i], tmin: d.temperature_2m_min[i] })).filter(x => x.tmax != null && x.tmin != null);
      const allYears = []; for (let y = Y0; y <= Y1; y++) allYears.push(y);
      const out = { city: id, name: c.name, generated: new Date().toISOString().slice(0, 10), period: [Y0, Y1], tried,
        station: st ? Object.assign({ id: st.id, name: st.name, lat: st.lat, lon: st.lon, elevation_m: st.elevation_m, valid_years: st.valid_years, of: st.of,
          source: { name: "NOAA Global Historical Climatology Network Daily (GHCN-Daily)", licence: "Public domain (US Government work)", url: `https://www.ncei.noaa.gov/access/services/data/v1?dataset=daily-summaries&stations=${st.id}&dataTypes=TMAX,TMIN&startDate=${Y0}-01-01&endDate=${Y1}-12-31&units=metric&format=json` } }, summarise(st.days, st.valid)) : null,
        background: Object.assign({ model: MODEL, grid: { lat: j.latitude, lon: j.longitude, elevation_m: j.elevation },
          source: { name: "Open-Meteo Historical Weather API, ERA5-Land reanalysis (Copernicus Climate Change Service)", licence: "CC BY 4.0", url: "https://open-meteo.com/en/docs/historical-weather-api" } }, summarise(rdays, allYears)) };
      fs.mkdirSync(path.join(ROOT, "data", "city-history"), { recursive: true });
      fs.writeFileSync(path.join(ROOT, "data", "city-history", id + ".json"), JSON.stringify(out, null, 1) + "\n");
      console.log(`${id}: station ${st ? st.id + " warm nights " + out.station.trends.warm_nights.words + " (" + out.station.trends.warm_nights.per_decade + "/decade)" : "none passed"}; background warm nights ${out.background.trends.warm_nights.words}`);
      await new Promise(z => setTimeout(z, 3000));
    } catch (e) { bad++; console.error(`FAILED ${id}: ${e.message}`); } }
  if (bad) process.exit(1);
})();
