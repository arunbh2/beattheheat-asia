#!/usr/bin/env node
// Common Shade: checks the district picture.
//   1. the geometry in tools/city-districts/geo.js on fixed shapes (point in polygon with a hole, an inside point for a
//      U shape, rings joined from loose ways, spherical area) - also run by the district job before it computes anything;
//   2. every data/city-districts/<city>.json: districts present with unique ids and names, numbers in range, district
//      residents adding up to the city total, every source with a name, licence, year and link, and a small file.
// Usage: node tools/check-city-districts.js [--geometry-only]
"use strict";
const fs = require("fs"), path = require("path"), G = require("./city-districts/geo.js");
const ROOT = path.join(__dirname, ".."), fails = [], fail = m => fails.push(m);
const sq = [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]], [[0.5, 0.5], [1.5, 0.5], [1.5, 1.5], [0.5, 1.5], [0.5, 0.5]]];
if (!G.inPolygon(0.25, 0.25, sq) || G.inPolygon(1, 1, sq) || G.inPolygon(3, 3, sq)) fail("geo.inPolygon: wrong answer on a square with a hole");
const U = [[[[0, 0], [3, 0], [3, 3], [2, 3], [2, 1], [1, 1], [1, 3], [0, 3], [0, 0]]]], ip = G.interiorPoint(U);
if (!ip || !G.inMulti(ip[0], ip[1], U)) fail("geo.interiorPoint: the point is not inside a U shape");
const rings = G.joinRings([[[0, 0], [1, 0]], [[1, 1], [1, 0]], [[1, 1], [0, 1], [0, 0]]]);
if (rings.length !== 1 || rings[0].length !== 5) fail("geo.joinRings: three loose ways did not close into one ring");
const eq = G.ringKm2([[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]);
if (Math.abs(eq - 12392) / 12392 > 0.01) fail(`geo.ringKm2: a 1 degree cell at the equator is ${eq.toFixed(0)} km2, expected about 12,392 (within 1%)`);
const hole = G.multiKm2([sq]), full = G.multiKm2([[sq[0]]]);
if (!(hole < full && Math.abs(hole / full - 0.75) < 0.01)) fail("geo.multiKm2: a hole of a quarter of the area is not taken off");
if (!process.argv.includes("--geometry-only")) {
  const DIR = path.join(ROOT, "data", "city-districts"), files = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter(f => f.endsWith(".json")) : [];
  for (const f of files) {
    const p = path.join(DIR, f), size = fs.statSync(p).size, d = JSON.parse(fs.readFileSync(p, "utf8")), at = `data/city-districts/${f}`;
    if (size > 200000) fail(`${at}: ${size} bytes; keep it under 200 KB so a phone can open it`);
    if (!Array.isArray(d.districts) || !d.districts.length) { fail(`${at}: no districts`); continue; }
    const ids = new Set(); for (const x of d.districts) { if (!x.id || !x.name) fail(`${at}: a district has no id or name`); if (ids.has(x.id)) fail(`${at}: id ${x.id} twice`); ids.add(x.id);
      for (const k of ["older_pct", "built_pct", "park_pct"]) if (x[k] != null && !(x[k] >= 0 && x[k] <= 100)) fail(`${at}: ${x.name} ${k} = ${x[k]} is not a share between 0 and 100`);
      for (const k of ["residents", "hospitals", "clinics"]) if (!(Number.isInteger(x[k]) && x[k] >= 0)) fail(`${at}: ${x.name} ${k} is not a whole number of 0 or more`);
      if (!(x.area_km2 > 0)) fail(`${at}: ${x.name} has no area`); }
    const sum = d.districts.reduce((a, x) => a + x.residents, 0);
    if (Math.abs(sum - d.totals.residents_in_districts) > d.districts.length) fail(`${at}: district residents add up to ${sum}, not the total ${d.totals.residents_in_districts}`);
    if (Math.abs(d.totals.residents_in_districts - d.totals.residents_in_city) > 0.001 * d.totals.residents_in_city + 10) fail(`${at}: residents counted in districts (${d.totals.residents_in_districts}) differ from those counted in the city (${d.totals.residents_in_city})`);
    for (const s of d.sources || []) if (!s.name || !s.licence || !s.year || !/^https:\/\//.test(s.url || "")) fail(`${at}: source "${s.id}" needs a name, licence, year and https link`);
    if ((d.sources || []).length < 4) fail(`${at}: expected four sources (outlines, WorldPop, WorldCover, OpenStreetMap)`);
  }
  if (!fails.length) console.log(`city districts check passed: geometry tests, ${files.length} city file(s)`);
} else if (!fails.length) console.log("city districts geometry tests passed");
if (fails.length) { console.log(fails.map(x => "  FAIL " + x).join("\n")); process.exit(1); }
