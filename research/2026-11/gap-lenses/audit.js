#!/usr/bin/env node
// Common Shade: before a lens is applied, checks every source it cites against the checker's results and every number
// in its sentences against the terms found in that source.
//   node research/2026-11/gap-lenses/audit.js 1
// A number counts as found when the checker found it as a term on the page, its archived copy or its Europe PMC record.
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", "..", ".."), n = process.argv[2];
const P = JSON.parse(fs.readFileSync(path.join(__dirname, `patch-${n}.json`), "utf8"));
const LC = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "inbox", "2026-11-gap-lenses", "link-check.json"), "utf8"));
// a source confirmed by reading the checker's saved text (patch "confirmed": { url: "exact quote" }): the quote must be in a saved record
const EXC = ["data/inbox/2026-11-gap-lenses/_excerpts.json", "research/2026-11/health-deepening/excerpts.json"].map(f => { try { return fs.readFileSync(path.join(ROOT, f), "utf8").replace(/\\n/g, " ").replace(/\s+/g, " "); } catch (e) { return ""; } }).join(" ");
const quotes = u => [].concat((P.confirmed || {})[u] || []), quoted = u => quotes(u).length > 0 && quotes(u).every(q => EXC.includes(q.replace(/\s+/g, " ")));
const items = [
  ...(P.harms || []).map(h => [`harm ${h.id}`, h.add, h.sources]),
  ...(P.levers || []).flatMap(v => [v.example ? [`example ${v.id}`, v.example, v.exampleSources] : null, ...(v.watch || []).map(w => [`watch ${v.id}`, w.text, w.sources])]).filter(Boolean),
  ...(P.atRisk || []).map(f => [`fact ${f.id}`, f.fact, [f.source]]),
  ...(P.evidence || []).map(e => [`evidence ${e.review.cycle}`, e.review.finding + " " + (e.review.sample_size || ""), [{ url: e.url }]])];
const nums = s => (String(s).match(/\d[\d,]*\.\d+|\d{1,3}(?:,\d{3})+|\d{3,}|\d+(?=%)/g) || []).filter(x => !/^(19|20)\d\d$/.test(x));
let bad = 0;
for (const [what, text, srcs] of items) {
  const st = srcs.map(s => `${LC[s.url] || "NOT CHECKED"}${Object.values((LC._terms || {})[s.url] || {}).some(Boolean) ? "" : " (no term found)"}`);
  const found = t => srcs.some(s => ((LC._terms || {})[s.url] || {})[t] || (quoted(s.url) && quotes(s.url).some(q => q.includes(t))));
  const miss = nums(text).filter(t => !found(t) && !found(t.replace(/,/g, "")));
  const ok = srcs.every(s => quoted(s.url) || (["OK", "REDIRECT", "BLOCKED"].includes(LC[s.url]) && Object.values((LC._terms || {})[s.url] || {}).some(Boolean))) && !miss.length;
  if (!ok) bad++;
  console.log(`${ok ? "ok  " : "FIX "} ${what.padEnd(24)} ${st.join(" | ")}${miss.length ? "  numbers not found: " + miss.join(", ") : ""}`);
}
console.log(bad ? `${bad} item(s) to fix or drop` : "every source confirmed and every number found");
