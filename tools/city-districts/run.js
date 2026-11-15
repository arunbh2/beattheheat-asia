#!/usr/bin/env node
// Common Shade: the district job. Runs on GitHub (.github/workflows/city-districts.yml), never in a visitor's browser.
//   node tools/city-districts/run.js <city> discover   print what each source offers (metadata, licences, counts); writes nothing
//   node tools/city-districts/run.js <city> build      write data/city-districts/<city>.json
// Sources (all open, no account): geoBoundaries district outlines; WorldPop 100 m age and sex rasters (residents and the share
// aged 65 and over); ESA WorldCover 10 m land cover, built from Copernicus Sentinel data (built-up share); OpenStreetMap through
// the Overpass API (hospitals and clinics, park area). Only package: geotiff (pinned in the workflow, installed for the job only).
// Method notes and limits are written into the output, and tools/check-city-districts.js checks it.
"use strict";
const fs = require("fs"), path = require("path"), G = require("./geo.js");
const ROOT = path.join(__dirname, "..", ".."), [CITY, MODE = "discover"] = process.argv.slice(2);
const CFG = JSON.parse(fs.readFileSync(path.join(__dirname, "cities.json"), "utf8"))[CITY];
if (!CFG) { console.error(`no city "${CITY}" in tools/city-districts/cities.json`); process.exit(2); }
const UA = "CommonShade-district-job/1.0 (+https://beattheheat.asia/approach/)";
const log = (...a) => console.log(...a);
async function getJSON(u, opt = {}) { for (let k = 0; k < 4; k++) { try { const r = await fetch(u, { headers: { "User-Agent": UA }, ...opt }); if (r.ok) return await r.json(); log(`  ${r.status} ${u}`); } catch (e) { log(`  ${e.message} ${u}`); } await new Promise(z => setTimeout(z, 4000 * (k + 1))); } throw new Error("could not fetch " + u); }

// 1. district outlines: geoBoundaries ADM2 inside the ADM1 unit named adm1Match
async function outlines() {
  const m2 = await getJSON(`https://www.geoboundaries.org/api/current/gbOpen/${CFG.iso3}/ADM2/`), m1 = await getJSON(`https://www.geoboundaries.org/api/current/gbOpen/${CFG.iso3}/ADM1/`);
  const meta = k => ({ id: k.boundaryID, source: k.boundarySource, licence: k.boundaryLicense, licenceDetail: k.licenseDetail, licenceSource: k.licenseSource, year: k.boundaryYearRepresented, updated: k.sourceDataUpdateDate, build: k.buildDate, url: k.gjDownloadURL });
  log("geoBoundaries ADM2:", JSON.stringify(meta(m2))); log("geoBoundaries ADM1:", JSON.stringify(meta(m1)));
  const g1 = await getJSON(m1.gjDownloadURL), g2 = await getJSON(m2.gjDownloadURL);
  const parent = g1.features.find(f => (f.properties.shapeName || "").toLowerCase().includes(CFG.adm1Match.toLowerCase()));
  if (!parent) throw new Error(`no ADM1 unit matching "${CFG.adm1Match}"; names: ${g1.features.map(f => f.properties.shapeName).join(", ")}`);
  const P = G.toMulti(parent.geometry);
  const districts = g2.features.map(f => ({ id: f.properties.shapeID, name: f.properties.shapeName, multi: G.toMulti(f.geometry) }))
    .filter(d => { const p = G.interiorPoint(d.multi); return p && G.inMulti(p[0], p[1], P); });
  log(`districts inside ${parent.properties.shapeName}: ${districts.length}`); log("  " + districts.map(d => d.name).join(", "));
  return { districts, meta: meta(m2), parent: parent.properties.shapeName };
}
// 2. WorldPop: list the age-structure products and this country's entries (discover), or read the chosen entry's files (build)
async function worldpopEntry() {
  const list = await getJSON("https://hub.worldpop.org/rest/data/age_structures");
  log("WorldPop age_structures products:"); for (const d of list.data || []) log(`  ${d.alias}: ${d.title || d.name || ""}`);
  if (!CFG.worldpop.alias) return null;
  const e = await getJSON(`https://hub.worldpop.org/rest/data/age_structures/${CFG.worldpop.alias}?iso3=${CFG.iso3}`);
  for (const d of e.data || []) log(`  entry ${d.id}: ${d.title} | year ${d.popyear} | ${(d.files || []).length} files | doi ${d.doi || ""} | licence ${d.license || ""} | first file ${(d.files || [])[0] || ""}`);
  return (e.data || []).find(d => String(d.id) === String(CFG.worldpop.entry)) || null;
}
// 3. OpenStreetMap through Overpass: health facilities (points or the centre of a shape) and park shapes
async function overpass(q) {
  for (const host of ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"]) {
    try { return await getJSON(host, { method: "POST", body: "data=" + encodeURIComponent(q), headers: { "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded" } }); } catch (e) { log("  overpass: " + e.message); } }
  throw new Error("Overpass did not answer");
}
async function osm() {
  const area = `area["ISO3166-2"="${CFG.osmArea}"]->.a;`;
  const h = await overpass(`[out:json][timeout:240];${area}nwr["amenity"~"^(hospital|clinic|doctors)$"](area.a);out center tags;`);
  const p = await overpass(`[out:json][timeout:240];${area}(way["leisure"="park"](area.a);relation["leisure"="park"](area.a););out geom;`);
  const health = (h.elements || []).map(e => ({ kind: e.tags.amenity, name: (e.tags.name || "").trim().toLowerCase(), x: e.lon ?? (e.center && e.center.lon), y: e.lat ?? (e.center && e.center.lat), t: e.type })).filter(e => e.x != null);
  // the same place mapped twice (a point and a shape with the same name within about 100 m) counts once
  const seen = [], uniq = health.filter(e => { if (e.name && seen.some(s => s.name === e.name && s.kind === e.kind && Math.abs(s.x - e.x) < 0.001 && Math.abs(s.y - e.y) < 0.001)) return false; seen.push(e); return true; });
  const parks = [];
  for (const e of p.elements || []) {
    if (e.type === "way" && e.geometry) { const r = e.geometry.map(n => [n.lon, n.lat]); if (r.length >= 4) parks.push({ multi: [[r]] }); }
    if (e.type === "relation" && e.members) { const outer = G.joinRings(e.members.filter(m => m.type === "way" && m.role !== "inner" && m.geometry).map(m => m.geometry.map(n => [n.lon, n.lat])));
      const inner = G.joinRings(e.members.filter(m => m.type === "way" && m.role === "inner" && m.geometry).map(m => m.geometry.map(n => [n.lon, n.lat])));
      for (const r of outer) parks.push({ multi: [[r, ...inner.filter(q => G.inRing(q[0][0], q[0][1], r))]] }); }
  }
  log(`OpenStreetMap: ${health.length} health records (${uniq.length} after joining duplicates), ${parks.length} park shapes`);
  return { health: uniq, parks, when: new Date().toISOString().slice(0, 10) };
}
// 4. rasters: geotiff, read only the window over the city
async function raster(url, step) {
  const { fromUrl, fromArrayBuffer } = await import("geotiff");
  // read only the window over the city where the server allows partial reads; otherwise download the file whole
  let tif; try { tif = await fromUrl(url); await tif.getImage(); } catch (e) {
    log(`  partial reads refused (${e.message}); downloading ${path.basename(url)} whole`);
    const r = await fetch(url, { headers: { "User-Agent": UA } }); if (!r.ok) throw new Error(`${r.status} for ${url}`); tif = await fromArrayBuffer(await r.arrayBuffer()); }
  const img = await tif.getImage(), [ox, oy] = img.getOrigin(), [rx, ry] = img.getResolution(), b = CFG.bbox;
  const x0 = Math.max(0, Math.floor((b[0] - ox) / rx)), x1 = Math.min(img.getWidth(), Math.ceil((b[2] - ox) / rx)), y0 = Math.max(0, Math.floor((b[3] - oy) / ry)), y1 = Math.min(img.getHeight(), Math.ceil((b[1] - oy) / ry));
  const w = x1 - x0, h = y1 - y0, sw = step ? Math.ceil(w / step) : w, sh = step ? Math.ceil(h / step) : h;
  const data = (await img.readRasters({ window: [x0, y0, x1, y1], samples: [0], width: sw, height: sh, resampleMethod: "nearest" }))[0];
  const px = (x1 - x0) / sw * rx, py = (y1 - y0) / sh * ry;
  return { data, w: sw, h: sh, lon: i => ox + x0 * rx + (i + .5) * px, lat: j => oy + y0 * ry + (j + .5) * py, nodata: img.getGDALNoData(), res: [rx, ry] };
}
// which district holds each cell of a grid (computed once per grid)
function assign(gr, districts) { const find = G.index(districts), out = new Int16Array(gr.w * gr.h).fill(-1);
  for (let j = 0; j < gr.h; j++) { const y = gr.lat(j); for (let i = 0; i < gr.w; i++) { const x = gr.lon(i); for (const k of find(x, y)) if (G.inMulti(x, y, districts[k].multi)) { out[j * gr.w + i] = k; break; } } }
  return out; }

(async () => {
  const O = await outlines(), wp = await worldpopEntry();
  const wcTiles = [...new Set([[CFG.bbox[1], CFG.bbox[0]], [CFG.bbox[3], CFG.bbox[2]], [CFG.bbox[1], CFG.bbox[2]], [CFG.bbox[3], CFG.bbox[0]]].map(([la, lo]) => { const a = Math.floor(la / 3) * 3, o = Math.floor(lo / 3) * 3; return `${a < 0 ? "S" : "N"}${String(Math.abs(a)).padStart(2, "0")}${o < 0 ? "W" : "E"}${String(Math.abs(o)).padStart(3, "0")}`; }))];
  const wcURL = t => `https://esa-worldcover.s3.eu-central-1.amazonaws.com/v200/2021/map/ESA_WorldCover_10m_2021_v200_${t}_Map.tif`;
  log("ESA WorldCover tiles:", wcTiles.join(" "));
  if (MODE === "discover") {
    for (const t of wcTiles) { const r = await fetch(wcURL(t), { method: "HEAD", headers: { "User-Agent": UA } }); log(`  ${t}: ${r.status} ${r.headers.get("content-length") || ""} bytes`); }
    const o = await osm(); log("health kinds:", JSON.stringify(o.health.reduce((m, e) => (m[e.kind] = (m[e.kind] || 0) + 1, m), {})));
    if (wp) log("chosen WorldPop entry:", wp.title, (wp.files || []).slice(0, 40).join("\n  "));
    log("discover done; nothing written"); return;
  }
  if (!wp) throw new Error("set worldpop.alias and worldpop.entry in tools/city-districts/cities.json from a discover run first");
  const D = O.districts, n = D.length, R = D.map(d => ({ id: d.id, name: d.name, area_km2: +G.multiKm2(d.multi).toFixed(2), residents: 0, older: 0, hospitals: 0, clinics: 0, cells: 0, built: 0, park: 0 }));
  // residents and 65+: every age and sex band on one shared grid
  // both sexes together ("_t_"), one raster per age band (00, 01, 05 ... 90); 65 and over are the bands from 65 up
  const files = (wp.files || []).filter(f => /_t_\d+_/.test(f) && /\.tif$/.test(f)), band = f => +f.match(/_t_(\d+)_/)[1];
  if (files.length < 15) throw new Error("expected about 20 age-band rasters for both sexes, found " + files.length);
  log(`WorldPop: ${files.length} age bands, ${files.filter(f => band(f) >= 65).length} of them 65 and over`);
  let grid = null, owner = null, inCity = 0;
  for (const f of files) { const r = await raster(f, 0); if (!grid) { grid = r; owner = assign(r, D); }
    if (r.w !== grid.w || r.h !== grid.h) throw new Error("WorldPop rasters do not share one grid: " + f);
    const old = band(f) >= 65; for (let c = 0; c < r.data.length; c++) { const v = r.data[c]; if (!(v > 0) || v === r.nodata) continue; const k = owner[c]; if (k < 0) continue; R[k].residents += v; if (old) R[k].older += v; inCity += v; }
    log(`  read ${path.basename(f)}`); }
  // built-up share and park share: one 50 m sample grid from WorldCover (class 50 is built-up)
  const wc = []; for (const t of wcTiles) wc.push(await raster(wcURL(t), 5));
  const o = await osm(), pfind = G.index(o.parks);
  for (const r of wc) { const own = assign(r, D); for (let j = 0; j < r.h; j++) for (let i = 0; i < r.w; i++) { const c = j * r.w + i, k = own[c]; if (k < 0 || r.data[c] === 0) continue;
    R[k].cells++; if (r.data[c] === 50) R[k].built++; const x = r.lon(i), y = r.lat(j); if (pfind(x, y).some(q => G.inMulti(x, y, o.parks[q].multi))) R[k].park++; } }
  for (const e of o.health) { const find = G.index(D); for (const k of find(e.x, e.y)) if (G.inMulti(e.x, e.y, D[k].multi)) { if (e.kind === "hospital") R[k].hospitals++; else R[k].clinics++; break; } }
  const out = { city: CITY, name: CFG.name, generated: new Date().toISOString().slice(0, 10), parent: O.parent,
    sources: [
      { id: "outlines", name: "geoBoundaries district outlines (ADM2)", source: O.meta.source, licence: O.meta.licence, year: O.meta.year, url: O.meta.url },
      { id: "worldpop", name: `WorldPop, Global2 constrained age and sex structures, ${CFG.worldpop.alias.includes("R25A") ? "release R2025A" : CFG.worldpop.alias}, 100 m: ${wp.title}`, year: wp.popyear, licence: "CC BY 4.0", doi: wp.doi || "", url: `https://hub.worldpop.org/geodata/summary?id=${wp.id}` },
      { id: "worldcover", name: "ESA WorldCover 10 m 2021 v200 (built from Copernicus Sentinel-1 and Sentinel-2 data)", year: 2021, licence: "CC BY 4.0", url: "https://esa-worldcover.org/" },
      { id: "osm", name: "OpenStreetMap contributors, through the Overpass API", year: o.when, licence: "ODbL 1.0", url: "https://www.openstreetmap.org/copyright" }],
    districts: R.map(r => ({ id: r.id, name: r.name, area_km2: r.area_km2, residents: Math.round(r.residents), older_pct: r.residents ? +(100 * r.older / r.residents).toFixed(1) : null,
      hospitals: r.hospitals, clinics: r.clinics, built_pct: r.cells ? +(100 * r.built / r.cells).toFixed(1) : null, park_pct: r.cells ? +(100 * r.park / r.cells).toFixed(1) : null })),
    totals: { residents_in_districts: Math.round(R.reduce((a, r) => a + r.residents, 0)), residents_in_city: Math.round(inCity), districts: n } };
  fs.mkdirSync(path.join(ROOT, "data", "city-districts"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "data", "city-districts", CITY + ".json"), JSON.stringify(out, null, 1) + "\n");
  log(`wrote data/city-districts/${CITY}.json: ${n} districts, ${out.totals.residents_in_districts} residents`);
})().catch(e => { console.error("FAILED: " + (e.stack || e.message)); process.exit(1); });
