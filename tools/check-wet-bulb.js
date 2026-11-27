#!/usr/bin/env node
// Common Shade: checks /wet-bulb-wall/. Each failure says what to fix.
//   1. the calculation (wet-bulb-wall/wetbulb-core.js) against CoolProp reference values
//      (research/2026-11/wet-bulb-wall/reference.json), and its physics: wet-bulb never above air temperature, equal at
//      100% humidity, rising with humidity at a fixed temperature, and invalid inputs returning null, never a number
//   2. the weather adapter (wet-bulb-wall/weather-adapter.js) on SYNTHETIC records only: parsing, units, time zones,
//      missing values kept missing, freshness, a failed city keeping its last record and its original time
//   3. the page: rendered chart, method and limits; no WBGT computed; overlays only from sources that passed the check;
//      no survival times or safe-line wording; canonical without parameters; links to and from the Heat Tool Finder
//   node tools/check-wet-bulb.js
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const W = require("../wet-bulb-wall/wetbulb-core.js"), A = require("../wet-bulb-wall/weather-adapter.js"), HS = require("./heat-interactives-sources.js");
let bad = 0; const ok = (c, m) => { console.log(c ? "  ok  " : "  FAIL", m); if (!c) bad++; };

// ---- 1. calculation ----
const R = require("../research/2026-11/wet-bulb-wall/reference.json");
let worst = 0; for (const p of R.points) worst = Math.max(worst, Math.abs(W.wetBulb(p.t, p.rh, p.p) - p.tw));
ok(worst < 0.05, `wet-bulb within 0.05 °C of CoolProp at ${R.points.length} points, 20 to 50 °C, 5 to 100% (worst ${worst.toFixed(3)} °C)`);
let above = 0, sat = 0, mono = 0;
for (let t = 10; t <= 50; t += 0.5) {
  let prev = -Infinity;
  for (let rh = 1; rh <= 100; rh += 1) { const tw = W.wetBulb(t, rh); if (tw > t + 1e-6) above++; if (tw < prev - 1e-9) mono++; prev = tw; }
  if (Math.abs(W.wetBulb(t, 100) - t) > 1e-6) sat++;
}
ok(above === 0, "wet-bulb is never above air temperature across the chart");
ok(sat === 0, "at 100% humidity, wet-bulb equals air temperature");
ok(mono === 0, "at a fixed temperature and pressure, wet-bulb rises with humidity");
ok([[NaN, 50], [35, NaN], [null, 50], ["35", 50], [35, 0], [35, 101], [-5, 50], [61, 50], [Infinity, 50]].every(([t, rh]) => W.wetBulb(t, rh) === null), "invalid or out-of-range inputs return null, never a number");
ok(W.wetBulb(35, 50, 1000) === null, "an impossible pressure returns null");
ok(Math.abs(W.rhFor(40, W.wetBulb(40, 37)) - 37) < 0.05, "the contour inverse finds the humidity that gives a wet-bulb temperature");

// ---- 2. weather adapter, synthetic records only ----
const CITIES = [{ id: "a", name: "Test city A", lat: 10, lon: 70 }, { id: "b", name: "Test city B", lat: -5, lon: 100 }];
const now = Date.parse("2030-01-01T12:00:00Z");
const synth = [
  { latitude: 10, longitude: 70, utc_offset_seconds: 19800, timezone: "Asia/Kolkata", timezone_abbreviation: "GMT+5:30", current_units: { temperature_2m: "°C", relative_humidity_2m: "%" }, current: { time: "2030-01-01T17:15", temperature_2m: 31.2, relative_humidity_2m: 64, surface_pressure: 1008.1 } },
  { latitude: -5, longitude: 100, utc_offset_seconds: 25200, current: { time: "2030-01-01T19:00", temperature_2m: null, relative_humidity_2m: 80 } }
];
const recs = A.parse(synth, CITIES, now);
ok(recs[0].status === "ok" && recs[0].t === 31.2 && recs[0].rh === 64 && recs[0].validAt === Date.parse("2030-01-01T11:45:00Z"), "a record keeps its values and turns local time plus offset into the right instant");
ok(recs[0].pressureType && /surface/.test(recs[0].pressureType) && recs[0].kind === "modelled", "pressure is labelled surface pressure and the record is labelled modelled");
ok(recs[1].status === "missing" && recs[1].t === undefined, "a missing temperature leaves the city missing, never zero");
ok(A.freshness(recs[0], now) === "fresh" && A.freshness(recs[0], now + 2 * 3600e3) === "stale" && A.freshness(recs[1], now) === "missing", "fresh within an hour, stale after, missing when empty");
const merged = A.merge(A.parse([null, null], CITIES, now + 3600e3), recs);
ok(merged[0].status === "ok" && merged[0].validAt === recs[0].validAt && merged[0].fromCache && merged[1].status === "missing", "a failed request keeps the last good record with its original time; a city never received stays missing");
ok(A.parse([{ utc_offset_seconds: 0, current_units: { temperature_2m: "°F" }, current: { time: "2030-01-01T12:00", temperature_2m: 88, relative_humidity_2m: 50 } }], CITIES.slice(0, 1), now)[0].status === "missing", "values in other units are refused, not converted silently");
ok(A.parse({}, CITIES, now).every(r => r.status === "missing") && A.parse(null, CITIES, now).every(r => r.status === "missing"), "an empty or broken response leaves every city listed as missing");
ok(/latitude=10,-5&longitude=70,100/.test(A.url(CITIES)) && !/key=|apikey/i.test(A.url(CITIES)), "one request for all cities, with no key in the address");

// ---- 3. the page ----
const html = fs.readFileSync(path.join(ROOT, "wet-bulb-wall", "index.html"), "utf8"), text = html.replace(/<!--csn-->[\s\S]*?<!--\/csn-->/g, "").replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ");
ok(/<title>The wet-bulb wall · Common Shade<\/title>/.test(html) && /<link rel="canonical" href="https:\/\/beattheheat\.asia\/wet-bulb-wall\/">/.test(html), "title and a canonical URL without parameters");
ok(/<svg class="wbw-svg"[\s\S]*?<path class="wbw-c"/.test(html), "the chart and its contours are in the HTML, without JavaScript");
ok(/It does not predict an individual’s survival or establish safe working conditions/.test(text), "the qualification is visible near the top");
ok(!/\bWBGT\b[^.]*\b(is|=)\s*\d/.test(text) && /cannot be calculated from temperature and humidity alone/.test(text), "no WBGT is calculated, and the page says why");
ok(!/survival time|hours? (to|until) death|mortality (risk|probability)|you are safe|safe zone|death threshold/i.test(text.replace(/this page does not turn temperature and humidity into survival times|This page gives no survival times/g, "")), "no survival times, mortality odds or safe-zone wording (beyond saying the page gives none)");
ok(/not a universal|cannot describe the limit across climates|not safety lines/i.test(text), "35 °C is not presented as a universal threshold, and overlays are not safety lines");
for (const k of ["wolf2023", "sherwood2010", "vecellio2022", "wang2026", "openmeteo"]) ok(HS.passed(k), `source ${k} passed the content check (data/inbox/2026-11-heat-interactives)`);
ok(HS.passed("wolf2023") === /data-ov="young-minact"/.test(html), "the Wolf et al. overlays appear only when their source passed");
ok((html.match(/data-ov="[a-z-]+" hidden/g) || []).length >= 1, "overlays are off by default");
const ht = fs.readFileSync(path.join(ROOT, "heat-tools", "index.html"), "utf8");
ok(ht.includes('href="/wet-bulb-wall/"') && ht.includes('href="/heat-futures/"'), "the Heat Tool Finder links to both interactives");
ok(fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8").includes("<loc>https://beattheheat.asia/wet-bulb-wall/</loc>"), "the sitemap lists the page");
ok(/wet-bulb wall ask Open-Meteo/.test(fs.readFileSync(path.join(ROOT, "privacy", "index.html"), "utf8")), "the privacy page names this page's Open-Meteo request");
console.log(bad ? `wet-bulb check: ${bad} failing` : "wet-bulb check passed: calculation against CoolProp, physics, synthetic weather records, page wording and sources");
process.exit(bad ? 1 : 0);
