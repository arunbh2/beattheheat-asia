// Common Shade: what /signals/ and llms-full.txt share about Signals (data/site/signals.json, model in
// tools/signals-model.js): the page's fixed words, the denominator sentence, and the plain-text version for AI systems
// and the Markdown twin. tools/build-signals.js draws the page from the same helpers, so the page and llms-full.txt never
// say different things. Checked by build-data.js --check (checkSignals) and tools/check-signals.js.
"use strict";
const fs = require("fs"), path = require("path"), SM = require("./signals-model.js");
const ROOT = path.join(__dirname, ".."), FILE = path.join(ROOT, "data", "site", "signals.json"), FC = path.join(ROOT, "data", "site", "signals-checks.json");
const date = SM.date;
const TITLE = "Signals";
const LEDE = "Which way heat policy, finance, research and practice are moving in South and Southeast Asia: what was announced, found or agreed, what the evidence confirms for each promise, and what would show the next step.";
const NOTE = "A count shows what this site has checked, not what has happened. Each deliverable is counted once, at the furthest step it has any evidence for; evidence at one step does not show the steps before it. Missing evidence means not verified, never failed. The ladder records how far a promise has got, never how well an institution performs, and it says nothing about places or institutions not shown.";
const USES = [
  "What changed in heat policy, finance, research and practice, with dates and sources.",
  "Which developments concern a place, an action or a group of people: use the filters.",
  "For each promise, what the evidence confirms, what is unknown, and what would show the next step.",
  "Where to explore the implications: actions, country pages and funding pages."
];
const DISTINCT = "Signals follows developments outside Common Shade. Watch Common Shade grow records changes to this site; the evidence map appraises what is known; the funding pages explain financial arrangements and the money traced.";
const NO_SYNTHESIS = "Not written yet. It will follow a review of the conference's final decisions and documents, not the closing date alone.";
const WATCH_NOTE = "Conference activity is not implementation: an announcement at a conference enters at the announced step, and later developments are added to the same record rather than as new cards.";
const SAVED_NOTE = "Saved records are kept only in this browser (localStorage key cs-signals-saved): no account, nothing sent anywhere.";
const MOVED_NOTE = n => `Steps dated in the last ${n} days, newest first: when each happened, not when Common Shade added it. Each links to its record, with the evidence behind it.`;
const MOVED_NONE = n => `No step in the records here is dated in the last ${n} days. The records below show where each one stands.`;
const AHEAD_NOTE = "A scheduled date is when a rule or plan is due to apply. Reaching it does not, by itself, show that it is applied.";
const SHOWING = (a, b) => `Showing the ${a} newest of ${b} records.`;
const SEE_ALL = n => `See all ${n} records on one page`;
const ALL_LEDE = "Every record on Signals, newest first, with its evidence. The main Signals page adds what moved, filters, saved records and the watches.";
const NEXT_STEP = "Next step, as the sources describe it";
const MADE_BY = who => `Commitment made by ${who}.`;
const COV_H = "Where records are";
const COV_NOTE = "Records tracked here for each place, in alphabetical order, and when the weekly search of public feeds last looked for new developments. A low number describes the records kept here, not what a place is doing.";
const COV_SEARCHED = "Searched";
const COV_NOT_YET = "Weekly search not yet run";
const COV_REGION = "Region-wide";
const PROOF = "From the checked page";
const PATH = "Dated path, as far as the evidence shows";
const OLDER = "Older records, newest first. Each opens here with its evidence; without JavaScript, on the page of every record.";
const EMPTY = "No record matches these filters. This describes the records tracked here, not what has happened in the world.";
const METHOD = [
  "One canonical record per initiative, with stable identifiers for each record, deliverable and milestone; later developments are added to the same record, and nothing inconvenient is deleted.",
  "A commitment is tracked deliverable by deliverable. Funding announced, committed, paid out and spent are separate steps, as are a rule's adoption, the date it takes effect, and evidence that it is applied.",
  "Each milestone names its sources and what each one establishes. Whether it is confirmed comes from the site's source check (data/inbox/*/link-check.json): a page that merely opens is not evidence, and a secondary report is shown as reported until the original is checked.",
  "An evaluation is recorded with its findings, positive, mixed or negative, and is not treated as proof of cause.",
  "Interpretation is labelled as Common Shade's reading and kept apart from what sources say. Broad climate or health funding is never shown as money for heat unless the source says so.",
  "Maintenance: node tools/signals-review.js lists records due for review and what each source's check found, and turns a proposed milestone into a record only with its evidence. Nothing is published without review."
];
const kindOf = s => ({ commitment: { label: "Commitment" }, gathering: { label: "Gathering" }, finding: { label: "Finding" }, guidance: { label: "Guidance" } })[s.kind] || { label: s.kind };
const V = (fs.readFileSync(path.join(ROOT, "index.html"), "utf8").match(/\?v=(\d+)/) || [])[1] || "1";
function load() {
  const D = JSON.parse(fs.readFileSync(FILE, "utf8"));
  const rung = Object.fromEntries(D.ladder.map((l, i) => [l.id, i]));
  const kind = Object.fromEntries(D.kinds.map(k => [k.id, k]));
  const byGroup = Object.fromEntries(D.groups.map(g => [g.id, D.signals.filter(s => s.group === g.id).sort((a, b) => String(b.date).localeCompare(String(a.date)))]));
  return Object.assign(D, { rung, kind, byGroup });
}
const checks = () => fs.existsSync(FC) ? JSON.parse(fs.readFileSync(FC, "utf8")) : { urls: {} };
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
function denominator(O) {
  return `Of ${plural(O.deliverables, "deliverable", "deliverables")} in ${plural(O.commitments, "commitment", "commitments")} tracked here, among ${plural(O.signals, "record", "records")} in all (${Object.entries(O.byKind).map(([k, n]) => `${n} ${k}${n === 1 ? "" : "s"}`).join(", ")}). This is a selection of developments the site has checked, not a census of the region.`;
}
// kept for /for-ai/ and older readers: where the tracked commitments stand, now by deliverable
function standing(D) {
  const O = SM.overview(D, checks(), new Date().toISOString().slice(0, 10)), b = O.buckets;
  const line = `${denominator(O)} ${b.delivered.n ? `${plural(b.delivered.n, "deliverable has", "deliverables have")} evidence of delivery` : "No deliverable has evidence of delivery"} and ${b.evaluated.n ? `${plural(b.evaluated.n, "has", "have")} a published evaluation` : "none has a published evaluation"}.`;
  return { counts: SM.RUNGS.map(r => b[r].n), total: O.commitments, deliverables: O.deliverables, line };
}
function md(SITE) {
  const D = load(), C = checks(), today = new Date().toISOString().slice(0, 10), O = SM.overview(D, C, today);
  const L = [`## ${TITLE}`, `${SITE}/signals/`, LEDE, NOTE, denominator(O),
    "Overview, by the furthest step each deliverable has evidence for: " + [...SM.RUNGS, "none"].filter(r => r !== "none" || O.buckets.none.n).map(r => `${r === "none" ? "no step with evidence" : SM.RUNG_LABEL[r]} ${O.buckets[r].n}${O.buckets[r].reportedOnly ? ` (${O.buckets[r].reportedOnly} on secondary reports only)` : ""}`).join("; ") + ".",
    "Evidence states: " + Object.values(SM.STATE).map(s => s.label).join("; ") + ".", "How records are kept: " + METHOD.join(" ")];
  L.push("### El Niño watch: implications for Asia's next hot season", require("./enso-outlook.js").md(SITE), `An outlook is a finding, not a commitment; it stays outside the commitment counts. Explainer: ${SITE}/el-nino/`, "A hot, dry season can strain water, power, work, schools and care at once, in the same households; the explainer shows how these pathways connect.");
  { const SH = require("./shared-heat-text.js"); L.push(`### ${SH.COMMITMENT.h}`, SH.COMMITMENT.intro, ...SH.COMMITMENT.questions.map(q => `- ${q}`)); }
  for (const g of D.groups) {
    L.push(`### ${g.label}`, g.intro);
    if (g.when) L.push(g.when + ".");
    if (g.scope) L.push(`Scope: ${g.scope} Review cut-off: ${date(g.cutoff)}.`);
    if (g.watching) L.push("Following: " + g.watching.join(", ") + ".");
    if (g.reading) L.push(`${g.reading.label}: ${g.reading.text}`);
    if (g.checkins) L.push("Check-ins: " + g.checkins.map(c => `${date(c.date)}, ${c.label}: ${c.note} (${c.added.join(", ")})`).join("; "));
    if (g.checkins) L.push("Closing synthesis: " + (g.synthesis ? g.synthesis.text : NO_SYNTHESIS));
    for (const s of D.byGroup[g.id]) L.push(record(s, C, today));
  }
  return L.join("\n\n");
}
// one record as plain text: the same facts, states and dates the page shows
function record(s, C, today) {
  const out = [`- ${s.title} [${s.id}] (${kindOf(s).label}; ${s.where}; latest development ${date(SM.latest(s, today))}). ${s.summary}`];
  if (s.relevance && s.relevance.basis === "interpreted") out.push(`  Heat link (Common Shade's reading): ${s.relevance.note}`);
  for (const d of s.deliverables || []) {
    out.push(`  Deliverable [${d.id}]: ${d.what} (${SM.TYPES[d.type].label}). Steps: ${SM.checklist(d, s, C, today).filter(c => c.status !== "na").map(c => `${c.label}: ${c.text}`).join("; ")}.`);
    for (const t of SM.timeline(d)) out.push(`    ${date(t.date)} ${t.kind === "event" ? SM.EVENTS[t.step] : SM.STEPS[t.step].label}${t.scheduled && SM.key(t.date) > SM.key(today) ? " (scheduled)" : ""}: ${t.note}. Evidence: ${(t.evidence || []).map(ev => { const r = SM.evidenceState(ev, s, C); return `${(r.src || {}).label} (${(r.src || {}).type}; ${SM.STATE[r.state].short}): ${ev.establishes}`; }).join(" | ")}`);
    if (d.unknown.length) out.push(`    Not known yet: ${d.unknown.join("; ")}.`);
    out.push(`    What would change this record: ${d.next}`);
  }
  if (!s.deliverables) out.push(`  What to watch: ${s.next}`);
  if (s.reading) out.push(`  Common Shade's reading (interpretation, reviewed ${date(s.reading.reviewed)}): changed: ${s.reading.changed} Why it may matter: ${s.reading.matters} Decisions: ${s.reading.decisions} Uncertain: ${s.reading.uncertain} Next: ${s.reading.examine}`);
  out.push(`  Review: record last reviewed ${date(s.review.reviewed)}; next review due ${date(s.review.due)}.`);
  out.push(`  Sources: ${s.sources.map(x => `${x.label} (${x.type}) ${x.url}`).join("; ")}`);
  return out.join("\n");
}
module.exports = { NEXT_STEP, MADE_BY, COV_H, COV_NOTE, COV_SEARCHED, COV_NOT_YET, COV_REGION, PROOF, PATH, OLDER, MOVED_NOTE, MOVED_NONE, AHEAD_NOTE, SHOWING, SEE_ALL, ALL_LEDE, TITLE, LEDE, NOTE, USES, DISTINCT, NO_SYNTHESIS, WATCH_NOTE, SAVED_NOTE, EMPTY, METHOD, V, date, kindOf, load, checks, denominator, standing, md, record };
