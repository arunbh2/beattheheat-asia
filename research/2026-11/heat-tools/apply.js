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
out.provenance = { seed: "research/2026-11/heat-tools/common_shade_heat_tools.json", wording_edits: "research/2026-11/heat-tools/edits.json", link_check: "research/2026-11/heat-tools/url-check.json" };
const dir = path.join(ROOT, "data", "heat-tools"); fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "catalogue.json"), JSON.stringify(out, null, 2) + "\n");
fs.copyFileSync(path.join(HERE, "common_shade_heat_tools.schema.json"), path.join(dir, "catalogue.schema.json"));
console.log(`heat tools: ${out.records.length} records, ${out.sources.length} sources, ${out.curated_pathways.length} pathways; ${edits.length} wording edits applied`);
