#!/usr/bin/env node
// Common Shade: turns the checked social protection research into the page's data, one file per country:
// data/social-protection/<country>.json (schema in data/social-protection/README.md).
//   node research/2026-11/social-protection/convert.js           only what the source check confirmed
//   node research/2026-11/social-protection/convert.js --draft   everything, for building the page before the check (never commit)
// A record is kept only if every source it cites was confirmed (the page, its archived copy or its Europe PMC record
// held at least one expected term) and every number of two digits or more in its text is in a cited source's saved
// text. A scheme whose amount or timing is not confirmed keeps its other fields; that field says so instead. Everything
// left out is listed, with the reason, in dropped-after-check.json.
"use strict";
const fs = require("fs"), path = require("path");
const HERE = __dirname, ROOT = path.join(HERE, "..", "..", ".."), OUT = path.join(ROOT, "data", "social-protection");
const DRAFT = process.argv.includes("--draft"), INBOX = path.join(ROOT, "data", "inbox", "2026-11-social-protection");
const read = f => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { return null; } };
// open questions for the steps nobody has measured (reviewed by hand; see step-questions.json)
const STEPQ = (read(path.join(__dirname, "step-questions.json")) || { questions: [] }).questions;
const LC = read(path.join(INBOX, "link-check.json")) || {}, EX = read(path.join(INBOX, "_excerpts.json")) || {};
const TXT = {}; Object.values(EX).forEach(x => { TXT[x.url] = ((x.opening || "") + " " + (x.around || []).join(" ")).replace(/\s+/g, " "); });
const ORGS = read(path.join(ROOT, "data", "core", "ORGANISATIONS.json")) || [];
const CODES = { bangladesh: "bd", india: "in", indonesia: "id", nepal: "np", singapore: "sg", thailand: "th" };   // ISO 3166 alpha-2, lower case
const confirmed = u => DRAFT || (["OK", "REDIRECT", "BLOCKED"].includes(LC[u]) && Object.values((LC._terms || {})[u] || {}).some(Boolean));
const nums = s => (String(s || "").match(/\d[\d,]*\.\d+|\d{1,3}(?:,\d{3})+(?!\d)|\d{1,3}(?:,\d{2})*,\d{3}|\d{2,}|\d+(?=%)/g) || []).filter(x => !/^(19|20)\d\d$/.test(x));
const word = (txt, t) => new RegExp(`(^|[^\\d.,])${t.replace(/[.,]/g, m => "\\" + m)}(?![\\d]|[.,]\\d)`).test(txt);
const numFound = (t, urls) => DRAFT || urls.some(u => ((LC._terms || {})[u] || {})[t] || word(TXT[u] || "", t) || word(TXT[u] || "", t.replace(/,/g, "")));
const missingNums = (text, urls) => nums(text).filter(t => !numFound(t, urls));
// [S4-S15] and [S1, S2] style markers: the keys they name, and the text without them
const keysIn = s => [...String(s).matchAll(/\[([^\]]*\d[^\]]*)\]/g)].flatMap(m => m[1].split(/\s*,\s*/).flatMap(part => {
  const r = part.match(/^([A-Za-z]+)(\d+)\s*-\s*[A-Za-z]*(\d+)$/); if (r) { const out = []; for (let i = +r[2]; i <= +r[3]; i++) out.push(r[1] + i); return out; } return [part.trim()]; }));
const clean = s => String(s || "").replace(/\s*\[[^\]]*\d[^\]]*\]/g, "").replace(/\s+/g, " ").trim();
const STATUS = s => (String(s).match(/^(current|changed|closed|unclear)/i) || [, "unclear"])[1].toLowerCase();
const ENUM4 = v => ["yes", "partly", "no", "unknown"].includes(String(v).toLowerCase()) ? String(v).toLowerCase() : "unknown";
// the finder's situations, from a scheme's type and words (a reader's situation, never an eligibility rule)
function situations(s) {
  const w = `${s.name} ${s.who} ${s.gives} ${s.heat_relevance}`.toLowerCase(), t = s.type, out = new Set();
  if (["public-works", "welfare-fund"].includes(t) || /\b(wage employment|lost (work|wages|earnings)|unemploy|work injury|employment injury|workers?'? compensation)/.test(w)) out.add("work");
  if (t === "health" || /\b(hospital|health|medical|treatment|clinic|care)\b/.test(w) && t === "insurance") out.add("health");
  if (/\b(old.age|older (people|persons|adults)|elderly|senior|aged? (6\d|7\d)|(6\d|7\d) (years|and over|or older|and above))/.test(w)) out.add("older");
  if (/disab/.test(w)) out.add("disability");
  if (/\b(crop|farm|farmer|agricultur|livestock|harvest|fisher)/.test(w)) out.add("farm");
  if (["yes", "partly"].includes(ENUM4(s.portable)) || /migrant|moves? for work|inter-state|portab/.test(w)) out.add("moved");
  if (t === "food" || /(?<!-)\b(food|ration|rice|grain)\b/.test(w)) out.add("food");
  if (t === "relief" || /disaster|calamit|emergenc/.test(w)) out.add("disaster");
  if (!out.size || (["cash", "pension", "insurance", "credit"].includes(t) && !out.has("health") && !out.has("farm"))) out.add("income");
  return [...out];
}
const dropped = {}, drop = (c, what, why) => (dropped[c] = dropped[c] || []).push(`${what}: ${why}`);
fs.mkdirSync(OUT, { recursive: true });
const summary = [];
for (const f of fs.readdirSync(HERE).filter(f => f.endsWith(".md") && !/^(README|rejected)/i.test(f)).sort()) {
  const c = f.replace(/\.md$/, ""), code = CODES[c]; if (!code) throw new Error(`convert.js: add an ISO code for "${c}" to CODES`);
  const t = fs.readFileSync(path.join(HERE, f), "utf8");
  const [S, L, E, O, F, Q, J] = [...t.matchAll(/```json\n([\s\S]*?)```/g)].map(m => JSON.parse(m[1]));
  const src = Object.fromEntries(J.map(s => [s.key, s]));
  const label = s => [s.by, s.year].filter(Boolean).join(", ") + (s.title ? `: ${s.title}` : "");
  const sources = keys => keys.filter(k => src[k]).map(k => ({ label: label(src[k]), url: src[k].url }));
  // keep a record only if all its sources were confirmed and its numbers found; returns its resolved sources or null
  const gate = (what, keys, text) => {
    const urls = keys.map(k => src[k] && src[k].url).filter(Boolean);
    if (!urls.length) { drop(c, what, "no source"); return null; }
    const bad = urls.filter(u => !confirmed(u)); if (bad.length) { drop(c, what, `source not confirmed by the check (${bad.join(", ")})`); return null; }
    const miss = missingNums(text, urls); if (miss.length) { drop(c, what, `numbers not found in its source: ${miss.join(", ")}`); return null; }
    return sources(keys);
  };
  const date = (t.match(/(?:reference date|checked on)[:\s]+(\d{1,2} [A-Z][a-z]+ 2026)/) || [, ""])[1];
  const asOf = date ? new Date(date + " UTC").toISOString().slice(0, 10) : "2026-11";
  const section = (letter) => { const m = t.match(new RegExp(`## ${letter}\\. [^\\n]*\\n([\\s\\S]*?)(?=\\n## [A-Z]\\. |$)`)); return m ? m[1] : ""; };
  const bullets = body => body.split("\n").filter(l => /^- /.test(l)).map(l => l.slice(2).trim());
  const itemsOf = (letter, what) => bullets(section(letter)).map((b, i) => { const keys = keysIn(b), text = clean(b);
    if (!keys.length) return { text, sources: [] };   // a caution in the reply's own words, carrying no claim of fact
    const s = gate(`${what} ${i + 1}`, keys, text); return s ? { text, sources: s } : null; }).filter(Boolean);

  const schemes = S.map(s => {
    const what = `scheme ${s.id}`, keys = s.sources, urls = keys.map(k => src[k] && src[k].url).filter(Boolean);
    if (!urls.length || urls.some(u => !confirmed(u))) { drop(c, what, "source not confirmed by the check"); return null; }
    const rec = { id: `${code}-${s.id}`, level: s.level, name: s.name, type: s.type, run_by: s.run_by, who: s.who, gives: s.gives, delivery: s.delivery,
      documents: s.documents, portable: ENUM4(s.portable), speed: s.speed, shock_responsive: ENUM4(s.shock_responsive), heat_relevance: s.heat_relevance,
      status: STATUS(s.status), status_as_of: asOf, grade: s.grade, situations: situations(s), sources: sources(keys) };
    for (const k of ["who", "gives", "delivery", "documents", "speed", "heat_relevance"]) { const miss = missingNums(rec[k], urls);
      if (miss.length) { drop(c, `${what} ${k}`, `numbers not found in its source: ${miss.join(", ")}; the page says it was not confirmed`); rec[k] = null; } }
    return rec;
  }).filter(Boolean);
  const ids = new Set(schemes.map(s => s.id));
  const ladder = L.map((x, i) => { const s = gate(`ladder ${i + 1} (${x.step})`, x.sources, x.finding); if (!s) return null;
    return { scheme: ids.has(`${code}-${x.scheme}`) ? `${code}-${x.scheme}` : "", scheme_note: ids.has(`${code}-${x.scheme}`) ? "" : String(x.scheme || ""),
      group: x.group, step: String(x.step).toLowerCase().replace(/[-_]/g, " "), finding: x.finding, grade: x.grade, limit: x.limit, sources: s }; }).filter(Boolean);
  const evidence = E.map((x, i) => { const keys = x.sources && x.sources.length ? x.sources : []; const s = gate(`evidence ${i + 1}`, keys, `${x.finding} ${x.effect || ""}`); if (!s) return null;
    return { by: x.by, title: x.title, url: x.url, type: x.type, where: x.where, scale: x.scale, finding: x.finding, effect: x.effect, limit: x.limit, sources: s }; }).filter(Boolean);
  const routes = O.map(x => {
    if (x.id === "haqdarshak" && c !== "india") { drop(c, "route haqdarshak", "operation in this country not verified by the research; kept only for India"); return null; }
    const s = gate(`route ${x.id}`, x.sources, `${x.reach_reported} ${x.reach_independent}`); if (!s) return null;
    // the heat network record with the same name (never by id alone: Thailand's "nsf" is not the site's U.S. National Science Foundation)
    const nm = v => String(v).toLowerCase().replace(/\s*\(.*?\)\s*/g, " ").replace(/[’']/g, "'").trim();
    const known = ORGS.find(o => nm(o.name) === nm(x.name) || nm(o.name).startsWith(nm(x.name) + " ") || nm(x.name).startsWith(nm(o.name) + " "));
    return { id: `${code}-route-${x.id}`, name: x.name, kind: x.kind, does: x.does, where: x.where, self_reported: x.reach_reported, independent: x.reach_independent,
      evaluations: x.evaluations, url: x.url, org_id: known ? known.id : "", sources: s };
  }).filter(Boolean);
  const indicators = F.map(x => ({ id: `${code}-${x.id}`, layer: x.layer, indicator: x.indicator, definition: x.definition, unit: x.unit, unit_of_place: x.unit_of_place,
    year: x.year, publisher: x.publisher, url: x.url, licence: x.licence,
    open: /cc[- ]?by|open data licence|open data common|creative commons|cc0|public domain/i.test(x.licence || "") && !/not (stated|verified|established|checked)|unknown|unclear/i.test(x.licence || ""),
    joinable: /\b(code|codes|ISO|LGD|pcode|ADM\d)\b/i.test(x.place_code || "") && !/no (administrative|shared|verified|official|common|machine|province)|not (inspected|verified|parsed|a place|place)|only|none|spatial|grid|coordinates|crosswalk|labels|names|serial/i.test(x.place_code || ""),
    access: x.access, format: x.format, update: x.update, place_code: x.place_code, limit: x.limit }));
  const mapRows = (section("G").match(/^\| (?!-|Element)([^|]+)\|([^|]+)\|/gm) || []).map(r => r.split("|").slice(1, 3).map(v => clean(v)));
  const country = { id: code, slug: c, name: c[0].toUpperCase() + c.slice(1), as_of: asOf, checked: DRAFT ? "" : new Date().toISOString().slice(0, 10),
    unit_note: (t.match(/The requested schema uses state[^\n]*/) || [""])[0],
    summary: itemsOf("A", "summary"), gaps: itemsOf("H", "gap"), map: { rows: mapRows, misreadings: bullets(section("G")).map(clean) },
    questions: Q.map(q => ({ id: `${code}-${q.id}`, q: q.q, have: q.have, could: q.could, scale: q.scale }))
      .concat(STEPQ.filter(q => q.country === code).map(q => ({ id: `${code}-${q.id}`, steps: q.steps, q: q.q, have: q.have, could: q.could, scale: q.scale }))) };
  const out = { country, schemes, ladder, evidence, routes, indicators };
  fs.writeFileSync(path.join(OUT, `${c}.json`), JSON.stringify(out, null, 1) + "\n");
  summary.push(`${country.name}: ${schemes.length}/${S.length} schemes, ${ladder.length}/${L.length} ladder findings, ${evidence.length}/${E.length} evidence, ${routes.length}/${O.length} routes, ${country.gaps.length} gaps`);
}
if (!DRAFT) fs.writeFileSync(path.join(HERE, "dropped-after-check.json"), JSON.stringify(dropped, null, 1) + "\n");
console.log((DRAFT ? "DRAFT (not checked; do not commit)\n" : "") + summary.join("\n"));
