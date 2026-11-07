#!/usr/bin/env node
// Common Shade: applies one gap lens's checked changes to the map's data, from a patch file in this folder.
//   node research/2026-11/gap-lenses/apply.js 1        (reads patch-1.json)
// A patch only uses sources the checker confirmed (data/inbox/2026-11-gap-lenses/link-check.json). Every id must already
// exist; a link already on the map, a source already cited on a harm, or a question id already used is refused, so the
// script can be run again safely. Files keep their own formats (ser() from tools/build-data.js; learning.json by hand).
//
// patch-N.json:
//   harms:     [{ id, add: "sentence(s) appended to the description", sources: [{ label, url }] }]
//   links:     [[from, to, why]]
//   levers:    [{ id, example?, exampleSources?, watch?: [{ text, sources }] }]   (an example only where there is none)
//   atRisk:    [{ id, fact, source: { label, url } }]                           (added to the group's "more" facts)
//   questions: [{ id, loop, q, have, could, scale }]                            (added as open questions)
//   evidence:  [{ title, url, first_author, venue, date, review: { cycle, finding, grade, where, sample_size?, limit } }]
//   confirmed: { url: "exact quote" }   a source whose expected terms missed, confirmed by a quote that is in its saved text
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", "..", ".."), n = process.argv[2];
if (!/^[1-6]$/.test(n || "")) { console.error("usage: node research/2026-11/gap-lenses/apply.js <lens 1-6>"); process.exit(2); }
const P = JSON.parse(fs.readFileSync(path.join(__dirname, `patch-${n}.json`), "utf8"));
const src = fs.readFileSync(path.join(ROOT, "tools", "build-data.js"), "utf8");
const ser = new Function(src.slice(src.indexOf("function ser"), src.indexOf("\n}\n", src.indexOf("function ser")) + 3) + "; return ser;")();
const core = f => path.join(ROOT, "data", "core", f + ".json"), read = f => JSON.parse(fs.readFileSync(f, "utf8"));
const write = (f, v) => fs.writeFileSync(f, ser(v) + "\n");
const C = read(core("CONSEQUENCES")), S = read(core("SYSTEMS")), LK = read(core("LINKS")), LV = read(core("LEVERS")), AR = read(core("AT_RISK")), LO = read(core("LOOPS"));
const nodes = new Set(["heat", ...S.map(s => s.id), ...C.map(c => c.id)]), edges = new Set(LK.map(l => l[0] + ">" + l[1]));
const checked = (() => { try { const j = read(path.join(ROOT, "data", "inbox", "2026-11-gap-lenses", "link-check.json")); return u => ["OK", "REDIRECT", "BLOCKED"].includes(j[u]) && Object.values((j._terms || {})[u] || {}).some(Boolean); } catch (e) { return () => false; } })();
// a source confirmed by reading the checker's saved text (patch "confirmed": { url: "exact quote" }): the quote must be in a saved record
const EXC = ["data/inbox/2026-11-gap-lenses/_excerpts.json", "research/2026-11/health-deepening/excerpts.json"].map(f => { try { return fs.readFileSync(path.join(ROOT, f), "utf8").replace(/\\n/g, " ").replace(/\s+/g, " "); } catch (e) { return ""; } }).join(" ");
const quotes = u => [].concat((P.confirmed || {})[u] || []), quoted = u => quotes(u).length > 0 && quotes(u).every(q => EXC.includes(q.replace(/\s+/g, " ")));
const problems = [], done = [];
const okSrc = (x, where) => { if (!x || !x.label || !/^https:\/\//.test(x.url || "")) problems.push(`${where}: a source needs a label and an https url`);
  else if (!checked(x.url) && !quoted(x.url)) problems.push(`${where}: ${x.url} was not confirmed by the checker (no expected term found, and no "confirmed" quote that appears in its saved text)`); };

(P.harms || []).forEach(h => { const c = C.find(x => x.id === h.id); if (!c) return problems.push(`harm ${h.id}: not on the map`);
  h.sources.forEach(x => okSrc(x, `harm ${h.id}`));
  if (c.desc.includes(h.add)) return; c.desc = c.desc.trim() + " " + h.add.trim();
  h.sources.forEach(x => { if (!c.sources.some(y => y.url === x.url)) c.sources.push(x); }); done.push(`harm ${h.id}`); });
(P.links || []).forEach(([a, b, why]) => { if (!nodes.has(a) || !nodes.has(b)) return problems.push(`link ${a}>${b}: ${!nodes.has(a) ? a : b} is not on the map`);
  if (edges.has(a + ">" + b)) return; if (!why || why.length > 160) return problems.push(`link ${a}>${b}: needs a reason of at most 160 characters`);
  LK.push([a, b, why]); edges.add(a + ">" + b); done.push(`link ${a}>${b}`); });
(P.levers || []).forEach(p => { const v = LV.find(x => x.id === p.id); if (!v) return problems.push(`lever ${p.id}: not on the map`);
  if (p.example) { if (v.example) problems.push(`lever ${p.id}: already has an example; leave it, or add the new one as a watch-out or elsewhere`);
    else { (p.exampleSources || []).forEach(x => okSrc(x, `lever ${p.id} example`)); v.example = p.example; v.exampleSources = p.exampleSources; done.push(`example ${p.id}`); } }
  (p.watch || []).forEach(w => { w.sources.forEach(x => okSrc(x, `lever ${p.id} watch`)); v.watch = v.watch || [];
    if (!v.watch.some(y => y.text === w.text)) { v.watch.push(w); done.push(`watch ${p.id}`); } }); });
(P.atRisk || []).forEach(f => { const g = AR.find(x => x.id === f.id); if (!g) return problems.push(`at-risk ${f.id}: no such group`);
  okSrc(f.source, `at-risk ${f.id}`); g.more = g.more || [];
  if (!g.more.some(m => m.fact === f.fact)) { g.more.push({ fact: f.fact, source: f.source }); done.push(`fact ${f.id}`); } });

const lqFile = path.join(ROOT, "data", "site", "learning.json"), lqText = fs.readFileSync(lqFile, "utf8"), lq = JSON.parse(lqText);
const newQ = (P.questions || []).filter(q => { if (lq.questions.some(x => x.id === q.id)) return false;
  if (q.loop && !LO.some(l => l.id === q.loop)) { problems.push(`question ${q.id}: loop "${q.loop}" is not a cycle`); return false; } return true; });

const ev = P.evidence || [], evFile = path.join(ROOT, "data", "evidence", "inbox", "2026-W45.json");
ev.forEach(e => okSrc({ label: e.title, url: e.url }, `evidence ${e.title.slice(0, 40)}`));

if (problems.length) { console.error("Nothing written. Fix these in patch-" + n + ".json:\n- " + problems.join("\n- ")); process.exit(1); }
write(core("CONSEQUENCES"), C); write(core("LINKS"), LK); write(core("LEVERS"), LV); write(core("AT_RISK"), AR);
if (newQ.length) {
  const q = x => `  { "id": ${JSON.stringify(x.id)}, "loop": ${JSON.stringify(x.loop || "")}, "status": "open",\n    "q": ${JSON.stringify(x.q)},\n    "have": ${JSON.stringify(x.have)},\n    "could": ${JSON.stringify(x.could)}, "scale": ${JSON.stringify(x.scale)} }`;
  fs.writeFileSync(lqFile, lqText.replace(/\n \]\n\}\s*$/, ",\n" + newQ.map(q).join(",\n") + "\n ]\n}\n")); JSON.parse(fs.readFileSync(lqFile, "utf8"));
  newQ.forEach(x => done.push(`question ${x.id}`)); }
if (ev.length) {
  fs.mkdirSync(path.dirname(evFile), { recursive: true });
  const j = fs.existsSync(evFile) ? read(evFile) : { week: "2026-W45", note: "Studies from the November 2026 gap lenses, checked in data/inbox/2026-11-gap-lenses and reviewed in a Claude Code session; merging the pull request is the sign-off.", candidates: [] };
  ev.forEach(e => { if (!j.candidates.some(c => c.url === e.url && c.review && c.review.cycle === e.review.cycle)) { j.candidates.push(Object.assign({ decision: "accept" }, e)); done.push(`evidence ${e.review.cycle}`); } });
  fs.writeFileSync(evFile, JSON.stringify(j, null, 1) + "\n");
}
console.log(`lens ${n}: ${done.length} changes\n- ${done.join("\n- ")}`);
