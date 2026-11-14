#!/usr/bin/env node
// Common Shade: writes data/core/ORG_FACETS.json, the build-only facts about each organisation in the heat network
// (where its listed work is, what kind of body it is, what its link shows, and when that link last answered).
//   draft   facets-draft.json   from facets-draft.js: read only from each record's own words and link
//   edits   facets-edits.json   reviewed corrections, each with its reason ("why")
//   links   url-check.json      from .github/workflows/verify-urls.yml over urls.txt (run on GitHub; "archive: no")
//   deeper  depth-edits.json    (optional) confirmed deeper links and descriptions, applied to ORGANISATIONS.json itself
// It refuses an unknown id, country code, scale or type, and a record with no facets. Links that did not answer are
// listed in link-failures.json and reported; they are never rewritten here.
//   node research/2026-11/heat-network/apply.js [YYYY-MM-DD of the link check]
"use strict";
const fs = require("fs"), path = require("path"), cp = require("child_process");
const HERE = __dirname, ROOT = path.join(HERE, "..", "..", ".."), CORE = path.join(ROOT, "data", "core");
const J = f => JSON.parse(fs.readFileSync(f, "utf8")), has = f => fs.existsSync(path.join(HERE, f));
const N = require(path.join(ROOT, "heat-network", "network-core.js"));
cp.execFileSync("node", [path.join(HERE, "facets-draft.js")], { stdio: "ignore" });
const ORGS = J(path.join(CORE, "ORGANISATIONS.json")), ids = new Set(ORGS.map(o => o.id));
const draft = J(path.join(HERE, "facets-draft.json")), edits = J(path.join(HERE, "facets-edits.json"));
const links = has("url-check.json") ? J(path.join(HERE, "url-check.json")) : {};
// deeper links that passed the check on GitHub (depth-apply.js): their page opened and held the staged words on that date
const deeper = has("depth-applied.json") ? J(path.join(HERE, "depth-applied.json")) : {};
const DAY = process.argv[2] || (has("url-check.json") ? fs.statSync(path.join(HERE, "url-check.json")).mtime.toISOString().slice(0, 10) : "");
const bad = [];
for (const id of Object.keys(edits)) if (!ids.has(id)) bad.push(`facets-edits.json: "${id}" is not an organisation id`);
const out = {}, failures = [];
for (const o of ORGS) {
  const d = draft[o.id]; if (!d) { bad.push(`${o.id}: no draft facets`); continue; }
  const e = edits[o.id] || {}, f = { countries: e.countries || d.countries };
  if (f.countries.length) f.basis = e.countries ? "edit" : d.basis;
  f.type = e.type || d.type;
  f.scale = e.scale || (f.type === "city" ? "city" : e.countries ? (e.countries.length > 1 ? "multi-country" : d.scale === "subnational" ? d.scale : "country") : d.scale);
  f.link = d.link; if (d.year) f.year = d.year;
  const dp = deeper[o.id] && deeper[o.id].url === o.url ? deeper[o.id] : null;
  if (dp && dp.link) f.link = dp.link;
  const L = dp ? { status: "OK" } : links[o.url];
  if (dp) f.checked = dp.checked; else if (L && (L.status === "OK" || L.status === "REDIRECT")) f.checked = DAY; else if (L) { f.linkStatus = L.status === "BLOCKED" ? "blocked" : "fail"; failures.push({ id: o.id, name: o.name, url: o.url, status: L.status, code: L.code }); }
  f.countries.forEach(c => { if (!N.COUNTRY[c]) bad.push(`${o.id}: country code "${c}" is not in network-core.js COUNTRY`); });
  if (!N.SCALE[f.scale]) bad.push(`${o.id}: scale "${f.scale}" is not in network-core.js SCALE`);
  if (!N.TYPE[f.type]) bad.push(`${o.id}: type "${f.type}" is not in network-core.js TYPE`);
  out[o.id] = f;
}
if (bad.length) { console.error(bad.join("\n")); process.exit(1); }
fs.writeFileSync(path.join(CORE, "ORG_FACETS.json"), "{\n" + ORGS.map(o => ` ${JSON.stringify(o.id)}: ${JSON.stringify(out[o.id])}`).join(",\n") + "\n}\n");
fs.writeFileSync(path.join(HERE, "link-failures.json"), JSON.stringify(failures, null, 1) + "\n");
const n = k => ORGS.filter(o => k(out[o.id])).length;
console.log(`ORG_FACETS: ${ORGS.length} organisations; a place named for ${n(f => f.countries.length)}; link shows the work for ${n(f => f.link === "work")}, homepage only ${n(f => f.link === "home")}; ` +
  (DAY ? `links answering on ${DAY}: ${n(f => f.checked)}, blocked to the checker ${n(f => f.linkStatus === "blocked")}, not answering ${n(f => f.linkStatus === "fail")}` : "no link check yet"));
