#!/usr/bin/env node
// Common Shade: stages the gap-lens research (six separate ChatGPT replies, lenses 1-6) for checking on GitHub.
// Reads the cleaned replies in this folder (lens-N.md), merges sources that several lenses share (by link), and writes
// data/inbox/2026-11-gap-lenses/sources.json: one record per source, with the terms the checker must find on the page.
// The terms are the lens's own "expect" list plus every number the site would quote from that source (from the lens's
// findings and at-risk facts), so a figure only reaches the site if it is in its source.
//   node research/2026-11/gap-lenses/stage.js        then run .github/workflows/verify-sources.yml with 2026-11-gap-lenses
"use strict";
const fs = require("fs"), path = require("path");
const HERE = __dirname, OUT = path.join(HERE, "..", "..", "..", "data", "inbox", "2026-11-gap-lenses", "sources.json");
const prev = fs.existsSync(OUT) ? Object.fromEntries(JSON.parse(fs.readFileSync(OUT, "utf8")).map(r => [r.url, r])) : {};
const blocks = n => [...fs.readFileSync(path.join(HERE, `lens-${n}.md`), "utf8").matchAll(/```json\n([\s\S]*?)```/g)].map(m => JSON.parse(m[1]));
const nums = s => (String(s).match(/\d[\d,]*\.\d+|\d{1,3}(?:,\d{3})+|\d{3,}|\d+(?=%)/g) || []).map(x => x).filter(x => !/^(19|20)\d\d$/.test(x));
const by = {};
for (const n of [1, 2, 3, 4, 5, 6]) {
  const [H, L, V, E, F, Q, S] = blocks(n);
  for (const s of S) {
    const r = by[s.url] = by[s.url] || { id: "", type: "source", lenses: [], keys: [], title: s.title, publisher: s.by, year: s.year, url: s.url, kind: s.type, where: s.where, expect: [] };
    r.lenses.push(n); r.keys.push(`L${n}-${s.key}`);
    const uses = [...F.filter(f => f.sources.includes(s.key)).map(f => f.fact), s.finding];
    r.expect = [...new Set([...r.expect, ...(s.expect || []), ...uses.flatMap(nums)])];
  }
}
const list = Object.values(by).map((r, i) => Object.assign(r, { id: "src-gl-" + r.keys[0].toLowerCase(), archive: (prev[r.url] || {}).archive || undefined,
  note: "Staged from the gap lenses to check the page opens and holds these terms before any map change rests on it. Not published from the inbox." }));
fs.writeFileSync(OUT, JSON.stringify(list, null, 1) + "\n");
console.log(`staged ${list.length} sources (${list.filter(r => r.lenses.length > 1).length} shared by more than one lens) in data/inbox/2026-11-gap-lenses/sources.json`);
