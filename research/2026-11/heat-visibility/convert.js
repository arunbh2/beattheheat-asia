#!/usr/bin/env node
// Turns the heat visibility research (research-raw.md, ChatGPT's reply) into data/core/HEAT_VISIBILITY.json, the data
// behind /how-heat-became-visible/, and folds in the source checks so the page only says what its sources carry.
//   node research/2026-11/heat-visibility/convert.js
// Inputs, all in this folder unless noted:
//   research-raw.md                                   the reply (A story, B timeline JSON, C IPCC tracker, D turning points, E sources JSON, F could not verify)
//   link-status.json                                  link results from .github/workflows/verify-urls.yml (optional)
//   data/inbox/2026-11-heat-visibility/sources.json   archived copies, written by .github/workflows/verify-sources.yml
//   data/inbox/2026-11-heat-visibility/link-check.json  link status and expected terms found, from the same workflow
//   edits.json                                        reviewed decisions: wording fixes, grade changes and drops, each with a reason
// Outputs: data/core/HEAT_VISIBILITY.json and dropped.md (everything left out or downgraded, and why).
// Rules: a source that fails and has no archived copy is dropped; an event, story line, tracker row or turning point
// left with no source is dropped; an event whose every source shows none of its expected terms becomes "uncertain".
"use strict";
const fs = require("fs"), path = require("path");
const HERE = __dirname, ROOT = path.join(HERE, "..", "..", ".."), INBOX = path.join(ROOT, "data", "inbox", "2026-11-heat-visibility");
const read = (f, d) => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { return d; } };
const md = fs.readFileSync(path.join(HERE, "research-raw.md"), "utf8");
const part = (a, b) => md.split(new RegExp(`^# ${a}\\.`, "m"))[1].split(new RegExp(`^# ${b}\\.`, "m"))[0];
const [EVENTS, SOURCES] = [...md.matchAll(/```json\n([\s\S]*?)\n```/g)].map(m => JSON.parse(m[1]));
const EDITS = read(path.join(HERE, "edits.json"), {});
const log = [];   // lines for dropped.md

// citations: "[S1, S5]", "[S40-S48]", "[S12, Annex VI]" -> ["S1","S5"], ["S40",...,"S48"], ["S12"]
function cites(text) {
  const keys = [];
  for (const m of text.matchAll(/\[(S\d+[^\]]*)\]/g))
    for (const bit of m[1].split(/,\s*/)) {
      const r = bit.match(/^S(\d+)-S(\d+)$/); if (r) { for (let i = +r[1]; i <= +r[2]; i++) keys.push("S" + i); continue; }
      const one = bit.match(/^S(\d+)$/); if (one) keys.push("S" + one[1]);
    }
  return [...new Set(keys)];
}
const strip = t => t.replace(/\s*\[S\d+[^\]]*\]/g, "").replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
const slug = t => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40).replace(/-$/, "");

// ---- sources, with the checks folded in ----
const inbox = Object.fromEntries(read(path.join(INBOX, "sources.json"), []).map(r => [r.key, r]));
const check = read(path.join(INBOX, "link-check.json"), {}), urlStatus = read(path.join(HERE, "link-status.json"), {});
const TYPE = { "IPCC report": "assessment", "UN decision": "decision", "Agency report": "agency", "Peer-reviewed study": "study", "Government plan": "plan" };
const sources = {};
for (const s of SOURCES) {
  const ib = inbox[s.key] || {}, st = check[s.url] || (urlStatus[s.url] || {}).status || "unchecked";
  const terms = (check._terms || {})[s.url], found = terms ? Object.values(terms).filter(Boolean).length : null;
  const archive = ib.archive || (urlStatus[s.url] || {}).archive || "";
  const src = { key: s.key, label: s.title, by: s.by, year: s.year, type: TYPE[s.type] || "agency", url: s.url, archive,
    status: String(st).toLowerCase(), terms: found == null ? "unchecked" : found === 0 ? "none" : found === (s.expect || []).length ? "all" : "some" };
  if ((EDITS.dropSources || {})[s.key]) { log.push(`- Source ${s.key} (${s.title}): dropped. ${EDITS.dropSources[s.key]}`); continue; }
  if (src.status === "fail" && !archive) { log.push(`- Source ${s.key} (${s.title}): dropped. The link failed and no archived copy exists.`); continue; }
  if (EDITS.kb && EDITS.kb[s.key]) src.kb = EDITS.kb[s.key];
  sources[s.key] = src;
}
const keep = (keys, what) => { const k = keys.filter(x => sources[x]); if (k.length < keys.length) log.push(`- ${what}: lost ${keys.filter(x => !sources[x]).join(", ")} with the dropped sources.`); return k; };

// ---- events ----
const HEAT = EDITS.heatwave || {};
const events = [];
for (const e of EVENTS) {
  const ed = (EDITS.events || {})[e.id] || {};
  if (ed.drop) { log.push(`- Event ${e.id} (${e.title}): dropped. ${ed.drop}`); continue; }
  const src = keep(e.sources, `Event ${e.id}`);
  if (!src.length) { log.push(`- Event ${e.id} (${e.title}): dropped. None of its sources survived the checks.`); continue; }
  let grade = (ed.grade || e.grade).toLowerCase();
  if (src.every(k => sources[k].terms === "none") && grade !== "uncertain") { log.push(`- Event ${e.id} (${e.title}): graded uncertain. Its sources showed none of their expected terms.`); grade = "uncertain"; }
  events.push({ id: e.id, date: e.date, precision: e.precision, title: ed.title || e.title, what: ed.what || e.what, why: ed.why || e.why,
    threads: e.threads, scope: e.scope, place: e.place || "", asia: e.asia === "direct", grade,
    first: e.first === "claimed" ? "claimed" : "no", quote: e.quote || "", quote_loc: e.quote_loc || "",
    ...(HEAT[e.id] ? { heatwave: HEAT[e.id] } : {}), sources: src });
}
// year-only dates first within their year, as the research sorts them; then by date
events.sort((a, b) => a.date.slice(0, 4).localeCompare(b.date.slice(0, 4)) || (a.precision === "year" ? -1 : b.precision === "year" ? 1 : a.date.localeCompare(b.date)));

// ---- the story (A): era bullets ----
const story = [];
for (const m of part("A", "B").matchAll(/^- \*\*([^*]+)\*\*\s*(.*)$/gm)) {
  const head = m[1].trim().replace(/\.$/, ""), [span, title] = head.includes(":") ? head.split(/:\s*/, 2) : ["", head];
  const src = keep(cites(m[2]), `Story "${head}"`);
  story.push({ id: slug(span || title), span: span.trim(), title: title.trim().replace(/^./, c => c.toUpperCase()), text: strip(m[2]), sources: src });
}
// ---- the IPCC tracker (C): table rows ----
const ipcc = [];
for (const line of part("C", "D").split("\n").filter(l => /^\| (?!Report|---)/.test(l))) {
  const [report, how, headline, change] = line.split("|").slice(1, 5).map(x => x.trim());
  const year = +(report.match(/(\d{4})(?!.*\d{4})/) || [])[1] || null;
  const audited = !/^Not audited\.?$/.test(headline);
  ipcc.push({ id: slug(report), report: report.replace(/,\s*\d{4}.*$/, "").replace(/,\s*approved.*$/, "").trim(), when: (report.match(/,\s*(.*)$/) || [, ""])[1], year,
    how: strip(how), headline: strip(headline), change: strip(change), audited, sources: keep(cites(line), `IPCC row ${report}`) });
}
// the tracker's own caveats: the paragraphs around its table
// the page shows the tracker as cards and names unread reports "not yet read", so its notes say the same (wording only)
const ipccNotes = part("C", "D").split("\n").slice(1).filter(l => l.trim() && !/^\|/.test(l)).map(strip).filter(Boolean)
  .map(n => n.replace(/^The table includes/, "This list includes").replace(/“Not audited” means/, "“Not yet read” means").replace(/Their heat content was not audited\./, "Their heat content was not read here."));
// ---- turning points (D) ----
const turning = [];
for (const m of part("D", "E").matchAll(/^\d+\. \*\*([^*]+)\*\*\s*(.*?)\s*\*\*Still unseen:\*\*\s*(.*)$/gm)) {
  const head = m[1].trim().replace(/\.$/, ""), [span, t] = head.split(/:\s*/, 2), title = t.replace(/^./, c => c.toUpperCase());
  turning.push({ id: slug(title), span, title, text: strip(m[2]), missing: strip(m[3]).replace(/^./, c => c.toUpperCase()), sources: keep(cites(m[2] + " " + m[3]), `Turning point ${head}`) });
}
const turningClose = strip((part("D", "E").match(/^Across these turning points[\s\S]*?$/m) || [""])[0]);
// ---- could not verify (F) ----
const unverified = [...part("F", "ZZ").matchAll(/^- \*\*([^*]+)\*\*\s*(.*)$/gm)].map(m => ({ topic: m[1].trim().replace(/\.$/, ""), text: strip(m[2]) }));

// ---- notes kept with the data ----
const A = part("A", "B"), cutoff = (A.match(/Research cut-off: \*\*([^*]+)\*\*/) || [, ""])[1];
const out = {
  about: "How heat became visible: when science, health, labour, finance and the UN began to notice extreme heat. Built by research/2026-11/heat-visibility/convert.js from checked research; shown on /how-heat-became-visible/.",
  cutoff, grades: { known: "Original documents, peer-reviewed papers, or institutions reporting their own actions.", inferred: "Reached through secondary accounts.", uncertain: "Its sources could not confirm the detail." },
  caveats: [
    "Grades describe the evidence for what happened. Why each event mattered is historical interpretation, not a measured effect.",
    "A claimed first is shown as claimed, with its source; no first use of an IPCC heat term is asserted.",
    "Absence from this timeline is not evidence of inaction. Country coverage is uneven."],
  story, turning, turningClose, events, ipcc, ipccNotes, unverified,
  sources: Object.values(sources)
};
// ---- the primary institutional sources join the knowledge base (data/kb/source.json), so the monthly update re-checks them ----
// Only sources that passed: an archived copy, and at least one expected term found. Idempotent: a link already there is kept as is.
const PRIMARY = /\b(IPCC|UNFCCC|United Nations|WHO|WMO|ILO|UNDRR|UNEP|UNICEF|UNFPA|UNCCD)\b/;
const KB_FILE = path.join(ROOT, "data", "kb", "source.json"), kbAll = read(KB_FILE, []), kbUrls = new Set(kbAll.map(r => r.url));
const today = new Date().toISOString().slice(0, 10), month = today.slice(0, 7), citedBy = {};
[...out.events, ...out.story, ...out.turning, ...out.ipcc].forEach(x => (x.sources || []).forEach(k => (citedBy[k] = citedBy[k] || []).push(x.title || x.report)));
let kbAdded = 0;
for (const src of out.sources) {
  const raw = SOURCES.find(x => x.key === src.key), ib = inbox[src.key] || {};
  if (!PRIMARY.test(src.by || "") || !src.archive || !["all", "some"].includes(src.terms)) continue;
  const id = ib.id ? ib.id.replace(/^src-hv-/, "src-") + "-" + slug(src.by).split("-")[0] + (src.year ? "-" + src.year : "") : "";
  src.kb = kbAll.find(r => r.url === src.url)?.id || id;
  if (kbUrls.has(src.url)) continue;
  const used = [...new Set(citedBy[src.key] || [])];
  kbAll.push({ id: src.kb, type: "source", title: src.label,
    summary: `${{ assessment: "IPCC assessment", decision: "UN decision", agency: "Report", study: "Study", plan: "Government plan" }[src.type] || "Report"} by ${src.by}${src.year ? `, ${src.year}` : ""}. Cited on How heat became visible${used.length ? ` for ${used.slice(0, 3).join("; ")}${used.length > 3 ? ` and ${used.length - 3} more` : ""}` : ""}.`,
    publisher: src.by, url: src.url, archive: src.archive, kind: ib.kind || "report", expect: (raw.expect || []).slice(0, 5),
    evidence: "known", sources: [], as_of: String(src.year || month), checked: today, status: "current", added: month, changed: month });
  kbUrls.add(src.url); kbAdded++;
}
if (kbAdded) fs.writeFileSync(KB_FILE, JSON.stringify(kbAll, null, 1) + "\n");
fs.writeFileSync(path.join(ROOT, "data", "core", "HEAT_VISIBILITY.json"), JSON.stringify(out, null, 1) + "\n");
fs.writeFileSync(path.join(HERE, "dropped.md"), `# What did not make it onto the page, and why\n\nWritten by convert.js from the source checks and edits.json.\n\n${log.length ? log.join("\n") : "- Nothing was dropped or downgraded."}\n`);
console.log(`knowledge base: ${kbAdded} primary sources added to data/kb/source.json`);
console.log(`HEAT_VISIBILITY: ${events.length} events, ${story.length} story lines, ${ipcc.length} IPCC rows, ${turning.length} turning points, ${unverified.length} unverified notes, ${Object.keys(sources).length} sources; ${log.length} notes in dropped.md`);
