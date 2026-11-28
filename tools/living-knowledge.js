#!/usr/bin/env node
// Common Shade: Living Knowledge, the model. Loads the build-only records in data/living-knowledge/ (practices, claims,
// sources), attaches the source check (data/inbox/2026-11-living-knowledge/: verify-sources.yml), and decides what may be
// public: a claim is confirmed only when every term it rests on was found on its source; a practice is public only when it
// is marked published and every one of its claims is confirmed. Everything else is held back and listed, never shown,
// exported, indexed or put in llms-full.txt. Also validates references and computes the country × domain coverage ledger.
// Read by tools/build-living-knowledge.js, tools/check-living-knowledge.js and the text twin. No network.
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), DIR = path.join(ROOT, "data", "living-knowledge"), INBOX = path.join(ROOT, "data", "inbox", "2026-11-living-knowledge");
const read = (f, d) => fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : d;
const norm = s => String(s || "").toLowerCase().replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, "-").replace(/\s+/g, " ");
const CORE = require("../living-knowledge/lk-core.js");

// countries searched in this edition (every query family named them by region) and the domains searched
const SOUTH = ["IN", "PK", "BD", "NP", "BT", "LK", "MV", "AF"], SOUTHEAST = ["ID", "PH", "VN", "TH", "KH", "LA", "MM", "MY", "SG", "BN", "TL"];

let _m;
function load(opts = {}) {
  if (_m && !opts.fresh) return _m;
  const P = read(path.join(DIR, "practices.json"), { records: [] }).records, CL = read(path.join(DIR, "claims.json"), { records: [] }).records, S = read(path.join(DIR, "sources.json"), { records: [] }).records;
  const LC = read(path.join(INBOX, "link-check.json"), {}), X = read(path.join(INBOX, "_excerpts.json"), {}), staged = read(path.join(INBOX, "sources.json"), []);
  const urlOf = Object.fromEntries(staged.map(r => [r.id.replace(/^src-lk-/, ""), r.url]));
  const src = Object.fromEntries(S.map(s => [s.id, s]));
  // a term is found when the checker marked it found on that url, or it is in the stored excerpt text
  const found = (sid, term) => { const u = urlOf[sid]; if (!u) return false; const t = (LC._terms || {})[u] || {}; if (t[term]) return true;
    const x = X[`src-lk-${sid}`] || {}; return norm([x.title || "", ...(x.around || []), x.opening || ""].join(" ")).includes(norm(term)); };
  const ran = sid => { const u = urlOf[sid]; return !!u && LC[u] !== undefined; };
  const status = sid => { const u = urlOf[sid]; return u ? String(LC[u] || "not checked") : "not staged"; };
  const checked = sid => (X[`src-lk-${sid}`] || {}).checked || null;
  const claims = CL.map(c => { const missing = c.terms.filter(([s, t]) => !found(s, t)).map(([s, t]) => `${s}: "${t}"`), notRun = [...new Set(c.terms.map(t => t[0]))].filter(s => !ran(s));
    return Object.assign({}, c, { confirmed: !missing.length && !notRun.length, missing, not_run: notRun }); });
  const byClaim = Object.fromEntries(claims.map(c => [c.id, c]));
  const practices = P.map(p => { const cs = p.claims.map(id => byClaim[id]).filter(Boolean), held = cs.filter(c => !c.confirmed);
    const pub = p.status === "published" && cs.length > 0 && !held.length && cs.length === p.claims.length;
    const srcIds = [...new Set(cs.flatMap(c => c.sources))];
    return Object.assign({}, p, { public: pub, held_claims: held.map(c => ({ id: c.id, missing: c.missing, not_run: c.not_run })), claim_records: cs, source_ids: srcIds,
      evidence: CORE.evidenceOf(cs), checked: srcIds.map(checked).filter(Boolean).sort()[0] || null }); });
  const sources = S.map(s => Object.assign({}, s, { check_status: status(s.id), checked: checked(s.id) }));
  _m = { practices, public: practices.filter(p => p.public), held: practices.filter(p => !p.public), claims, byClaim, sources, src: Object.fromEntries(sources.map(s => [s.id, s])), SOUTH, SOUTHEAST };
  return _m;
}

// the ledger: every country searched, every domain; documented (two or more public practices), preliminary (one),
// searched with no eligible evidence located (none). "None located" never means the practice does not exist.
function coverage() {
  const m = load(), rows = [];
  for (const code of [...SOUTH, ...SOUTHEAST]) {
    const cells = {};
    for (const d of Object.keys(CORE.DOMAIN)) {
      const n = m.public.filter(p => p.domain === d && p.places.some(pl => pl.country === code)).length;
      cells[d] = n >= 2 ? "documented" : n === 1 ? "preliminary" : "searched-none";
    }
    rows.push({ code, region: SOUTH.includes(code) ? "South Asia" : "Southeast Asia", cells, total: m.public.filter(p => p.places.some(pl => pl.country === code)).length });
  }
  return rows;
}

// refuses broken references and unknown labels
function validate() {
  const m = load(), bad = [], ids = new Set();
  m.practices.forEach(p => {
    if (ids.has(p.id)) bad.push(`duplicate practice ${p.id}`); ids.add(p.id);
    if (!/^[a-z0-9-]+$/.test(p.id)) bad.push(`${p.id}: id must be lowercase letters, digits and hyphens`);
    ["title", "summary", "description", "mechanism", "domain", "category", "category_basis"].forEach(k => { if (!p[k]) bad.push(`${p.id}: ${k} missing`); });
    if (!CORE.DOMAIN[p.domain]) bad.push(`${p.id}: domain ${p.domain}`);
    if (!CORE.CATEGORY[p.category]) bad.push(`${p.id}: category ${p.category}`);
    (p.climates || []).forEach(c => { if (!CORE.CLIMATE[c]) bad.push(`${p.id}: climate ${c}`); });
    (p.places || []).forEach(pl => { if (!CORE.COUNTRY[pl.country]) bad.push(`${p.id}: country ${pl.country}`); if (/\d+\s+[A-Za-z]+ (street|road)|No\.? \d/i.test(pl.place)) bad.push(`${p.id}: a place looks like a household address`); });
    if (p.category === "indigenous" && !/identif/i.test(p.category_basis)) bad.push(`${p.id}: Indigenous only where a source identifies the knowledge holders`);
    p.claims.forEach(cid => { if (!m.byClaim[cid]) bad.push(`${p.id}: claim ${cid} missing`); });
    const SOL = new Set(read(path.join(ROOT, "research", "2026-10", "passive_solutions.json"), { passive_solutions: [] }).passive_solutions.map(x => x.id));
    (p.links.solutions || []).forEach(s => { if (!SOL.has(s)) bad.push(`${p.id}: solution ${s} not in the solutions library`); });
  });
  m.claims.forEach(c => {
    if (!CORE.STATUS[c.status]) bad.push(`${c.id}: status ${c.status}`);
    c.sources.forEach(s => { if (!m.src[s]) bad.push(`${c.id}: source ${s} missing`); });
    if (c.quant && (!c.quant.unit || !c.quant.comparator || !c.quant.setting)) bad.push(`${c.id}: a number needs its unit, comparator and setting`);
    if (!c.locator) bad.push(`${c.id}: no locator`);
  });
  return bad;
}
module.exports = { load, coverage, validate, SOUTH, SOUTHEAST, ROOT, DIR, INBOX };
