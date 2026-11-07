#!/usr/bin/env node
// Common Shade: stages the Singapore heat resilience brief batch for checking on GitHub.
// Reads claims.json in this folder (each insight from the brief, traced to the primary source behind it) and writes
// data/inbox/2026-11-singapore-brief/sources.json: one record per source, with every term the checker must find on
// its page (the source's own terms plus each term a claim rests on), so nothing reaches the site unless its source holds it.
//   node research/2026-11/singapore-brief/stage.js     then run .github/workflows/verify-sources.yml with 2026-11-singapore-brief
"use strict";
const fs = require("fs"), path = require("path");
const HERE = __dirname, DIR = path.join(HERE, "..", "..", "..", "data", "inbox", "2026-11-singapore-brief"), OUT = path.join(DIR, "sources.json");
const C = JSON.parse(fs.readFileSync(path.join(HERE, "claims.json"), "utf8"));
const prev = fs.existsSync(OUT) ? Object.fromEntries(JSON.parse(fs.readFileSync(OUT, "utf8")).map(r => [r.url, r])) : {};
const by = Object.fromEntries(C.sources.map(s => [s.key, { id: "src-sg-" + s.key, type: "source", keys: [s.key], title: s.title, publisher: s.publisher,
  year: s.year, url: s.url, kind: s.kind, where: "Singapore", expect: [...s.expect], claims: [] }]));
const bad = [];
for (const c of C.claims) for (const [k, term] of [...c.rests_on, ...(c.alt || [])]) {
  const r = by[k]; if (!r) { bad.push(`${c.id}: no source "${k}"`); continue; }
  if (!r.expect.includes(term)) r.expect.push(term);
  if (!r.claims.includes(c.id)) r.claims.push(c.id);
}
if (bad.length) { console.error(bad.join("\n")); process.exit(1); }
const list = Object.values(by).map(r => Object.assign(r, { archive: (prev[r.url] || {}).archive || undefined,
  note: "Staged from the Singapore heat resilience brief batch to check the page opens and holds these terms before any page change rests on it. Not published from the inbox." }));
fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(list, null, 1) + "\n");
fs.writeFileSync(path.join(DIR, "README.md"), `# Singapore heat resilience brief, November 2026: sources to check

Staged by research/2026-11/singapore-brief/stage.js from claims.json. Run .github/workflows/verify-sources.yml with
\`2026-11-singapore-brief\`; it fills link-check.json and _excerpts.json. Nothing here is published; pages only use a
claim when every term it rests on was found on its source.
`);
console.log(`staged ${list.length} sources for ${C.claims.length} claims in data/inbox/2026-11-singapore-brief/sources.json`);
