// Heat Tool Finder: turns the researched seed (common_shade_heat_tools.json, kept unchanged as provenance) into the
// site's catalogue, data/heat-tools/catalogue.json, applying only the wording edits in edits.json. Refuses an edit whose
// old text is not found exactly, so a changed seed never gets a silent half-edit. Ids, dates, statuses and sources are
// never touched. Also copies the schema beside the catalogue.
//   node research/2026-11/heat-tools/apply.js
"use strict";
const fs = require("fs"), path = require("path");
const HERE = __dirname, ROOT = path.join(HERE, "..", "..", "..");
const seed = JSON.parse(fs.readFileSync(path.join(HERE, "common_shade_heat_tools.json"), "utf8"));
const { edits } = JSON.parse(fs.readFileSync(path.join(HERE, "edits.json"), "utf8"));
const out = JSON.parse(JSON.stringify(seed));
const fail = [];
for (const e of edits) {
  const parts = e.where.split(".");
  let obj = out, key = parts[0];
  if (parts[0] === "records") { obj = out.records.find(r => r.id === parts[1]); parts.splice(0, 2); if (!obj) { fail.push(`${e.where}: no record`); continue; } key = parts.shift(); }
  else parts.shift();
  while (parts.length) { obj = obj[key]; key = parts.shift(); }
  if (obj == null || obj[key] !== e.from) { fail.push(`${e.where}: old text not found exactly`); continue; }
  obj[key] = e.to;
}
if (fail.length) { console.error("apply: refused\n" + fail.join("\n")); process.exit(1); }
// additions (additions-*.json): records, sources and workflows researched after the seed. A record joins only when every
// source its provider facts rest on passed the source check (a claim id from that source is in a batch's confirmed.json);
// 'patch' adds a field (such as 'seasonal') to an existing record without touching its researched text.
const OKC = new Set(["enso-asia", "enso-update"].flatMap(b => { const f = path.join(HERE, "..", b, "confirmed.json"); return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")).map(c => c.id) : []; }));
const held = [];
for (const f of fs.readdirSync(HERE).filter(f => /^additions-.*\.json$/.test(f)).sort()) {
  const A = JSON.parse(fs.readFileSync(path.join(HERE, f), "utf8")), conf = A.confirm || {};
  // Common Shade's own pages (internal: true) need no outside source check
  const okSrc = id => (A.sources || []).some(s => s.id === id && s.internal) || (conf[id] || []).some(c => OKC.has(c));
  for (const s of A.sources || []) if (okSrc(s.id) && !out.sources.find(x => x.id === s.id)) { const c = Object.assign({}, s); delete c.internal; out.sources.push(c); }
  for (const r of A.records || []) {
    if (out.records.find(x => x.id === r.id)) { fail.push(`${f}: record ${r.id} already exists`); continue; }
    const srcs = r.evidence.source_ids; if (srcs.some(id => !okSrc(id))) { held.push(`${r.id} (${srcs.filter(id => !okSrc(id)).join(", ")} not confirmed)`); continue; }
    out.records.push(r);
  }
  const have = new Set(out.records.map(r => r.id));
  for (const p of A.pathways || []) out.curated_pathways.push(Object.assign({}, p, { steps: p.steps.map(s => Object.assign({}, s, { resource_ids: s.resource_ids.filter(id => have.has(id)) })).filter(s => s.resource_ids.length) }));
  if (A.design_decisions) { const D = out.design.decisions, i = D.findIndex(x => x.id === A.design_decisions.after);
    for (const it of A.design_decisions.items.slice().reverse()) if (!D.some(x => x.id === it.id)) D.splice(i + 1, 0, it); }
  for (const [id, fields] of Object.entries(A.patch || {})) { const r = out.records.find(x => x.id === id); if (!r) { fail.push(`${f}: patch for missing record ${id}`); continue; } Object.assign(r, fields); }
}
if (fail.length) { console.error("apply: refused\n" + fail.join("\n")); process.exit(1); }
if (held.length) console.log("apply: held back until the source check confirms them: " + held.join("; "));
out.provenance = { seed: "research/2026-11/heat-tools/common_shade_heat_tools.json", wording_edits: "research/2026-11/heat-tools/edits.json", additions: "research/2026-11/heat-tools/additions-*.json", link_check: "research/2026-11/heat-tools/url-check.json" };
const dir = path.join(ROOT, "data", "heat-tools"); fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "catalogue.json"), JSON.stringify(out, null, 2) + "\n");
fs.copyFileSync(path.join(HERE, "common_shade_heat_tools.schema.json"), path.join(dir, "catalogue.schema.json"));
console.log(`heat tools: ${out.records.length} records, ${out.sources.length} sources, ${out.curated_pathways.length} pathways; ${edits.length} wording edits applied`);
