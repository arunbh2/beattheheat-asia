#!/usr/bin/env node
// Common Shade, Living Knowledge: writes data/living-knowledge/practices.json, claims.json and sources.json from the
// hand-written records.js and sources.js, and checks every reference first (a claim's source exists, its terms are in that
// source's staged words, ids are unique). Run after editing either file, then stage.js.   node research/2026-11/living-knowledge/assemble.js
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", "..", ".."), OUT = path.join(ROOT, "data", "living-knowledge");
const S = require("./sources.js"), R = require("./records.js"), bad = [];
const src = Object.fromEntries(S.map(s => [s.id, s])), ids = new Set();
const uniq = id => { if (ids.has(id)) bad.push(`duplicate id ${id}`); ids.add(id); };
S.forEach(s => uniq("src-" + s.id));
const claims = [];
const practices = R.map(p => {
 uniq(p.id);
 (p.claims || []).forEach(cl => { uniq(cl.id);
  cl.terms.forEach(([sid, t]) => { if (!src[sid]) bad.push(`${cl.id}: source ${sid} not found`); else if (!(src[sid].expect || []).includes(t)) bad.push(`${cl.id}: term "${t}" not staged for ${sid}`); });
  claims.push(Object.assign({ practice: p.id, sources: [...new Set(cl.terms.map(t => t[0]))] }, cl)); });
 const out = Object.assign({}, p, { claims: (p.claims || []).map(c => c.id), status: "published", review: { by: "Common Shade editor (AI-assisted draft, reviewed against sources)", substantive: "2026-11-28", community: "Not reviewed by the communities described", expert: "Not reviewed by an external expert" },
  rights: { summary: "Written in Common Shade's own words, with citation; no text, images or designs reproduced from sources.", reuse: "Common Shade's summary: CC BY 4.0. Underlying sources keep their own licences (see each source).", sensitive: false, contributions: "No community contributions in this edition." } });
 return out;
});
if (bad.length) { console.error("assemble refused:\n  " + bad.join("\n  ")); process.exit(1); }
fs.mkdirSync(OUT, { recursive: true });
const w = (f, about, records) => fs.writeFileSync(path.join(OUT, f), JSON.stringify({ about, records }, null, 1) + "\n");
w("practices.json", "Living Knowledge practice records (build-only). Written from research/2026-11/living-knowledge/records.js by assemble.js; edit there. A practice is shown only when every claim it rests on passed the source check (tools/living-knowledge.js).", practices);
w("claims.json", "Living Knowledge claims: each says what kind of statement it is (status), what it is about (outcome) and the exact words in a source it rests on (terms).", claims);
w("sources.json", "Living Knowledge sources and studies: one record per underlying study; other hosted copies listed under copies.", S.map(s => Object.assign({ id: "src-" + s.id }, s, { id: s.id })));
console.log(`assembled ${practices.length} practices, ${claims.length} claims, ${S.length} sources`);
