#!/usr/bin/env node
// Common Shade: stages deeper links for heat network records whose link opens only a homepage, for checking on GitHub.
// Reads every depth-<n>/leads.json here (id, the page on the organisation's own site that shows its heat work, the
// words the checker has to find there, and, where the description changes, the new words) and writes
// data/inbox/2026-11-heat-network/sources.json. Run .github/workflows/verify-sources.yml with 2026-11-heat-network,
// then node research/2026-11/heat-network/depth-apply.js. Only links whose page opens and holds every term are used.
"use strict";
const fs = require("fs"), path = require("path");
const HERE = __dirname, ROOT = path.join(HERE, "..", "..", ".."), OUT = path.join(ROOT, "data", "inbox", "2026-11-heat-network", "sources.json");
const ORGS = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(ROOT, "data/core/ORGANISATIONS.json"), "utf8")).map(o => [o.id, o]));
const prev = fs.existsSync(OUT) ? Object.fromEntries(JSON.parse(fs.readFileSync(OUT, "utf8")).map(r => [r.url, r])) : {};
const list = [], bad = [];
for (const d of fs.readdirSync(HERE).filter(d => /^depth-\d+$/.test(d)).sort())
  for (const l of JSON.parse(fs.readFileSync(path.join(HERE, d, "leads.json"), "utf8"))) {
    const o = ORGS[l.id]; if (!o) { bad.push(`${d}: "${l.id}" is not an organisation id`); continue; }
    if (!/^https:\/\//.test(l.url) || !(l.expect || []).length) { bad.push(`${d}: ${l.id} needs an https link and at least one term to find`); continue; }
    list.push({ id: "hn-" + l.id, type: "source", batch: d, org: l.id, title: `${o.name}: the page that shows its heat work`, publisher: o.name, url: l.url, expect: l.expect, archive: (prev[l.url] || {}).archive || undefined,
      note: "Staged from the heat network depth batch to check the page opens and holds these terms before the listing links to it. Not published from the inbox." });
  }
if (bad.length) { console.error(bad.join("\n")); process.exit(1); }
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(list, null, 1) + "\n");
console.log(`staged ${list.length} deeper links`);
