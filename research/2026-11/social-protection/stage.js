#!/usr/bin/env node
// Common Shade: stages the social protection research (one reply per country, sections A-K) for checking on GitHub.
// Reads every <country>.md in this folder, merges sources that countries share (by link), and writes
// data/inbox/2026-11-social-protection/sources.json: one record per source, with the terms the checker must find.
// The terms are the reply's own "expect" list plus every number quoted from that source (scheme amounts and timings,
// access-ladder findings, evidence, organisation reach), so a figure only reaches the site if it is in its source.
// To add a country: save its reply here as <country>.md, run this, then .github/workflows/verify-sources.yml with
// 2026-11-social-protection (it resumes; sources already checked are skipped).
"use strict";
const fs = require("fs"), path = require("path");
const HERE = __dirname, OUT = path.join(HERE, "..", "..", "..", "data", "inbox", "2026-11-social-protection", "sources.json");
const prev = fs.existsSync(OUT) ? Object.fromEntries(JSON.parse(fs.readFileSync(OUT, "utf8")).map(r => [r.url, r])) : {};
const nums = s => (String(s || "").match(/\d[\d,]*\.\d+|\d{1,3}(?:,\d{3})+|\d{2,}|\d+(?=%)/g) || []).filter(x => !/^(19|20)\d\d$/.test(x));
const by = {};
for (const f of fs.readdirSync(HERE).filter(f => f.endsWith(".md") && !/^(README|rejected)/i.test(f))) {
  const country = f.replace(/\.md$/, ""), t = fs.readFileSync(path.join(HERE, f), "utf8");
  const [S, L, E, O, F, Q, J] = [...t.matchAll(/```json\n([\s\S]*?)```/g)].map(m => JSON.parse(m[1]));
  const uses = k => [...S.filter(x => x.sources.includes(k)).flatMap(x => [x.gives, x.speed]), ...L.filter(x => x.sources.includes(k)).map(x => x.finding),
    ...E.filter(x => (x.sources || []).includes(k)).flatMap(x => [x.finding, x.effect]), ...O.filter(x => x.sources.includes(k)).flatMap(x => [x.reach_reported, x.reach_independent])];
  for (const s of J) {
    const r = by[s.url] = by[s.url] || { id: "", type: "source", countries: [], keys: [], title: s.title, publisher: s.by, year: s.year, url: s.url, kind: s.type, expect: [] };
    r.countries.push(country); r.keys.push(`${country}-${s.key}`);
    r.expect = [...new Set([...r.expect, ...(s.expect || []), ...uses(s.key).flatMap(nums)])];
  }
}
const list = Object.values(by).map(r => Object.assign(r, { id: "sp-" + r.keys[0].toLowerCase(), archive: (prev[r.url] || {}).archive || undefined,
  note: "Staged from the social protection research to check the page opens and holds these terms before the page uses it. Not published from the inbox." }));
fs.writeFileSync(OUT, JSON.stringify(list, null, 1) + "\n");
fs.writeFileSync(path.join(HERE, "urls.txt"), list.map(r => r.url).join("\n") + "\n");
console.log(`staged ${list.length} sources from ${new Set(list.flatMap(r => r.countries)).size} countries (${list.filter(r => r.countries.length > 1).length} shared)`);
