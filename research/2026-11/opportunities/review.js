#!/usr/bin/env node
// Common Shade: applies a person's review of the sweep's leads (review-<cycle>.json beside this file) to the coverage ledger,
// data/funding/coverage.json: each organisation whose leads were read becomes "found" or "none" with the reviewer's note.
// An organisation reviewed for another cycle is left alone.   node research/2026-11/opportunities/review.js 2026-11-28
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", "..", ".."), cycle = process.argv[2];
if (!/^\d{4}-\d{2}-\d{2}$/.test(cycle || "")) { console.error("usage: review.js YYYY-MM-DD"); process.exit(1); }
const R = JSON.parse(fs.readFileSync(path.join(__dirname, `review-${cycle}.json`), "utf8")), LF = path.join(ROOT, "data", "funding", "coverage.json"), L = JSON.parse(fs.readFileSync(LF, "utf8"));
let n = 0; const missing = [];
for (const [id, [decision, note]] of Object.entries(R.orgs)) { const e = L.orgs[id]; if (!e || e.cycle !== cycle) { missing.push(id); continue; } e.reviewed = decision; e.review_note = note; n++; }
const open = Object.entries(L.orgs).filter(([, e]) => e.cycle === cycle && e.status === "candidates" && !e.reviewed).map(([k]) => k);
fs.writeFileSync(LF, JSON.stringify(L, null, 1) + "\n");
console.log(`reviewed ${n}${missing.length ? `; not in this cycle: ${missing.join(", ")}` : ""}${open.length ? `; still awaiting review: ${open.join(", ")}` : "; no leads await review"}`);
