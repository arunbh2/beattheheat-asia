#!/usr/bin/env node
// Common Shade: stages the funding rebuild's sources for the source check. Writes data/inbox/2026-11-funding-opps/sources.json
// from sources.js (new records) and from the October 2026 programme research (the legacy audit: does each programme page
// still open, and does it say applications are open or closed?). Keeps any check results already in the inbox; a source
// whose url or terms changed is re-checked on the next run because verify-inbox.js keys its results by url.
//   node research/2026-11/funding-opportunities/stage.js   then run verify-sources.yml with month 2026-11-funding-opps
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", "..", ".."), INBOX = path.join(ROOT, "data", "inbox", "2026-11-funding-opps");
const S = require("./sources.js");
const seen = new Set(), out = [];
const add = (key, s, note) => { if (seen.has(s.url)) return; seen.add(s.url);
  out.push({ id: `src-fo-${key}`, type: "source", keys: [key], title: s.title, publisher: s.publisher, year: 2026, url: s.url, kind: s.kind || "official page", where: "funding, opportunities and careers",
    expect: s.expect, note }); };
S.forEach(s => add(s.key, s, "Staged for the funding, opportunities and careers rebuild: a fact is published only when its term is found on this page. Not published from the inbox."));
// legacy audit: the 24 programmes of the October 2026 research
const PROG = JSON.parse(fs.readFileSync(path.join(ROOT, "research", "2026-10", "economy", "programmes.json"), "utf8"));
PROG.filter(p => /^https?:/.test(p.url || "")).forEach(p => add(`legacy-${p.id}`, { url: p.url, title: p.name, publisher: p.run_by || p.name,
  expect: [p.name.split(/[ (:,-]/).filter(w => w.length > 3)[0] || p.name, "apply", "applications", "closed", "2026"] }, "Legacy audit of the October 2026 programme research: does the page still open, and what does it say about applications?"));
fs.mkdirSync(INBOX, { recursive: true });
fs.writeFileSync(path.join(INBOX, "sources.json"), JSON.stringify(out, null, 1) + "\n");
console.log(`staged ${out.length} sources (${S.length} new, ${out.length - S.length} legacy) in data/inbox/2026-11-funding-opps/sources.json`);
