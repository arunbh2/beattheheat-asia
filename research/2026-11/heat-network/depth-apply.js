#!/usr/bin/env node
// Common Shade: applies the deeper links that passed the check on GitHub (see depth-stage.js) to
// data/core/ORGANISATIONS.json, editing the link (and, where a lead gives one, the description) in place so the file's
// formatting is kept. A link is used only if its page opened and held every staged term. Everything else is listed in
// depth-dropped.json with the reason, and the listing keeps its old link. Writes depth-applied.json (old and new link,
// old and new words, the date of the check), which apply.js reads for the "what the link shows" and "checked" facts.
// Safe to run again: a lead already applied is skipped.
//   node research/2026-11/heat-network/depth-apply.js [YYYY-MM-DD of the check] && node research/2026-11/heat-network/apply.js
"use strict";
const fs = require("fs"), path = require("path");
const HERE = __dirname, ROOT = path.join(HERE, "..", "..", ".."), FILE = path.join(ROOT, "data/core/ORGANISATIONS.json"), INBOX = path.join(ROOT, "data/inbox/2026-11-heat-network");
const J = f => JSON.parse(fs.readFileSync(f, "utf8"));
const staged = J(path.join(INBOX, "sources.json")), check = J(path.join(INBOX, "link-check.json")), terms = check._terms || {};
const DAY = process.argv[2] || fs.statSync(path.join(INBOX, "link-check.json")).mtime.toISOString().slice(0, 10);
const leads = Object.fromEntries(fs.readdirSync(HERE).filter(d => /^depth-\d+$/.test(d)).flatMap(d => J(path.join(HERE, d, "leads.json")).map(l => [l.id, l])));
const appliedFile = path.join(HERE, "depth-applied.json"), applied = fs.existsSync(appliedFile) ? J(appliedFile) : {};
let text = fs.readFileSync(FILE, "utf8"); const dropped = [];
const q = s => JSON.stringify(s);
for (const s of staged) {
  const l = leads[s.org], status = check[s.url], t = terms[s.url] || {}, missing = s.expect.filter(x => !t[x]);
  if (applied[s.org] && applied[s.org].url === s.url) continue;
  if (status !== "OK" && status !== "REDIRECT") { dropped.push({ id: s.org, url: s.url, why: `the page did not open for the check (${status || "not checked"})` }); continue; }
  if (missing.length) { dropped.push({ id: s.org, url: s.url, why: `the page opened but these words were not found on it: ${missing.join(", ")}` }); continue; }
  // the record's own block: from its "id" line to the next record
  const at = text.indexOf(`"id": ${q(s.org)},`); if (at < 0) { dropped.push({ id: s.org, url: s.url, why: "the record was not found in ORGANISATIONS.json" }); continue; }
  const end = text.indexOf("\n  }", at), block = text.slice(at, end), o = J(FILE).find(x => x.id === s.org);
  let nb = block.replace(`"url": ${q(o.url)}`, `"url": ${q(s.url)}`);
  if (l.does) nb = nb.replace(`"does": ${q(o.does)}`, `"does": ${q(l.does)}`);
  if (nb === block || (l.does && !nb.includes(q(l.does)))) { dropped.push({ id: s.org, url: s.url, why: "the record's link or words could not be replaced in place; edit by hand" }); continue; }
  text = text.slice(0, at) + nb + text.slice(end);
  applied[s.org] = Object.assign({ was: o.url, url: s.url, checked: DAY, found: s.expect }, l.link ? { link: l.link } : {}, l.does ? { wasDoes: o.does, does: l.does } : {});
}
JSON.parse(text);   // still valid
fs.writeFileSync(FILE, text);
fs.writeFileSync(appliedFile, JSON.stringify(applied, null, 1) + "\n");
fs.writeFileSync(path.join(HERE, "depth-dropped.json"), JSON.stringify(dropped, null, 1) + "\n");
console.log(`deeper links: ${Object.keys(applied).length} applied in all, ${dropped.length} not used this run` + dropped.map(d => `\n  not used: ${d.id}: ${d.why}`).join(""));
