#!/usr/bin/env node
// Common Shade: which running-costs claims the reading passes confirmed. A claim passes when every term it rests on was
// found on its source (link-check.json) or appears in the checker's saved passages of it (_excerpts.json), in the inbox
// named for that source. Writes confirmed.json and dropped-after-check.json.
//   node research/2026-11/heat-plan-running-costs/gate.js
"use strict";
const fs = require("fs"), path = require("path");
const HERE = __dirname, INBOX = path.join(HERE, "..", "..", "..", "data", "inbox");
const C = JSON.parse(fs.readFileSync(path.join(HERE, "claims.json"), "utf8"));
const S = Object.fromEntries(C.sources.map(s => [s.key, s]));
const J = (d, f) => { const p = path.join(INBOX, d, f); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : {}; };
const norm = s => s.toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, " ");
const ok = (key, term) => { const s = S[key], L = J(s.inbox, "link-check.json"), X = J(s.inbox, "_excerpts.json");
  if (!/^(OK|REDIRECT|BLOCKED)/.test(String(L[s.url] || ""))) return false;
  if (((L._terms || {})[s.url] || {})[term]) return true;
  return norm([(X[s.id] || {}).title || "", ...((X[s.id] || {}).around || [])].join(" ")).includes(norm(term)); };
const confirmed = [], dropped = [];
for (const c of C.claims) {
  const miss = c.rests_on.filter(([k, t]) => !ok(k, t)).map(([k, t]) => `${k}: "${t}"`);
  if (!miss.length) confirmed.push({ id: c.id, where: c.where, text: c.text, sources: [...new Set(c.rests_on.map(([k]) => k))].map(k => ({ label: S[k].label, url: S[k].url })) });
  else dropped.push({ id: c.id, where: c.where, text: c.text, missing: miss });
}
fs.writeFileSync(path.join(HERE, "confirmed.json"), JSON.stringify(confirmed, null, 1) + "\n");
fs.writeFileSync(path.join(HERE, "dropped-after-check.json"), JSON.stringify(dropped, null, 1) + "\n");
console.log(`${confirmed.length} of ${C.claims.length} claims confirmed; dropped: ${dropped.map(d => d.id).join(", ") || "none"}`);
for (const d of dropped) console.log(`  ${d.id}: missing ${d.missing.join("; ")}`);
