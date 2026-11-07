#!/usr/bin/env node
// Common Shade: which Singapore brief claims the source check confirmed. Reads claims.json and the checker's
// data/inbox/2026-11-singapore-brief/link-check.json; a claim passes when every term it rests on was found on its
// source or quoted in the checker's excerpts of it (or, failing that, every term of its alternative source set). Writes confirmed.json (the claims the pages
// may use, with the source links that carried them) and dropped-after-check.json (the rest, with the missing terms).
//   node research/2026-11/singapore-brief/gate.js
"use strict";
const fs = require("fs"), path = require("path");
const HERE = __dirname, INBOX = path.join(HERE, "..", "..", "..", "data", "inbox", "2026-11-singapore-brief");
const C = JSON.parse(fs.readFileSync(path.join(HERE, "claims.json"), "utf8"));
const L = JSON.parse(fs.readFileSync(path.join(INBOX, "link-check.json"), "utf8")), T = L._terms || {};
const S = Object.fromEntries(C.sources.map(s => [s.key, s]));
const X = fs.existsSync(path.join(INBOX, "_excerpts.json")) ? JSON.parse(fs.readFileSync(path.join(INBOX, "_excerpts.json"), "utf8")) : {};
const said = key => [((X["src-sg-" + key] || {}).title || ""), ...((X["src-sg-" + key] || {}).around || [])].join(" ").toLowerCase().replace(/\s+/g, " ");
// a term counts when the checker found it, or when its excerpts of the page (what the reviewer reads) contain it
const ok = (key, term) => !!(T[S[key].url] || {})[term] || said(key).includes(term.toLowerCase());
const opens = key => /^(OK|REDIRECT|BLOCKED)/.test(String(L[S[key].url] || ""));
const test = set => { const miss = set.filter(([k, t]) => !(opens(k) && ok(k, t))).map(([k, t]) => `${k}: "${t}"`);
  return { pass: !miss.length, miss, used: [...new Set(set.map(([k]) => k))] }; };
const confirmed = [], dropped = [];
for (const c of C.claims) {
  const a = test(c.rests_on), b = c.alt ? test(c.alt) : null, win = a.pass ? a : b && b.pass ? b : null;
  if (win) confirmed.push({ id: c.id, where: c.where, text: c.text, sources: win.used.map(k => ({ label: `${S[k].publisher}: ${S[k].title}${S[k].year ? ", " + S[k].year : ""}`, url: S[k].url })) });
  else dropped.push({ id: c.id, where: c.where, text: c.text, missing: [...a.miss, ...(b ? b.miss : [])] });
}
fs.writeFileSync(path.join(HERE, "confirmed.json"), JSON.stringify(confirmed, null, 1) + "\n");
fs.writeFileSync(path.join(HERE, "dropped-after-check.json"), JSON.stringify(dropped, null, 1) + "\n");
console.log(`${confirmed.length} of ${C.claims.length} claims confirmed; dropped: ${dropped.map(d => d.id).join(", ") || "none"}`);
for (const d of dropped) console.log(`  ${d.id}: missing ${d.missing.join("; ")}`);
