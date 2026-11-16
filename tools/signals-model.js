// Common Shade: the tracking model behind /signals/, shared by the page (tools/build-signals.js), the text twin and
// llms-full.txt (tools/signals-text.js), the checks (tools/build-data.js, tools/check-signals.js) and the maintenance tools
// (tools/signals-sync.js, tools/signals-review.js). One canonical record per initiative lives in data/site/signals.json.
//
// A commitment is tracked deliverable by deliverable (an office, a rule, a fund, a plan), never as one status for the whole
// initiative. Each deliverable has dated milestones; each milestone has evidence: a source (by stable id) and what that source
// establishes. Whether a milestone is checked is derived, never typed: from the source-check records of this repository
// (data/site/signals-checks.json, written by tools/signals-sync.js from data/inbox/*/link-check.json and the link checks).
//   - checked against an original: an original source passed a content check for the terms the milestone rests on
//   - reported: only secondary sources (news, legal updates, partner accounts) passed that content check
//   - not verified: no source passed a content check; a page that merely opened is not evidence
// Evidence at one step never implies the steps before it, an effective date passing never implies compliance, a published
// evaluation never implies good results or proven impact, and missing evidence means not verified, never failed.
"use strict";

// the familiar five-rung ladder, kept as an overview only
const RUNGS = ["announced", "adopted", "funded", "delivered", "evaluated"];
// milestone steps: each sits on one rung of the overview, with words that keep the distinctions the ladder hides
const STEPS = {
  "announced":              { rung: "announced", label: "Announced", says: "said in public" },
  "adopted":                { rung: "adopted",   label: "Adopted", says: "made formal: approved, issued or set up" },
  "effective":              { rung: "adopted",   label: "Takes effect", says: "the date a rule or plan applies from; it does not show compliance" },
  "funding-announced":      { rung: "funded",    label: "Funding announced", says: "money promised in public" },
  "funding-committed":      { rung: "funded",    label: "Funding committed", says: "money legally committed, for example a signed grant or budget line" },
  "funding-disbursed":      { rung: "funded",    label: "Funding paid out", says: "money transferred" },
  "funding-spent":          { rung: "funded",    label: "Funding spent", says: "money reported as spent" },
  "delivered-partial":      { rung: "delivered", label: "Partly delivered", says: "some of what was promised exists or is under way" },
  "delivered":              { rung: "delivered", label: "Delivered", says: "what was promised exists and people can use it" },
  "implementation-observed":{ rung: "delivered", label: "Implementation observed", says: "a source reports the rule or plan being applied, in a stated scope" },
  "evaluated":              { rung: "evaluated", label: "Evaluated", says: "results were assessed and published; findings may be positive, mixed or negative, and are not proof of cause" }
};
// changes in the world, recorded in a deliverable's history but never on the ladder
const EVENTS = {
  "superseded": "Superseded", "cancelled": "Cancelled", "expired": "Expired", "interrupted": "Interrupted",
  "scope-changed": "Scope changed", "timing-changed": "Timing changed", "funding-changed": "Funding changed"
};
const FINDINGS = { positive: "Positive findings", mixed: "Mixed findings", negative: "Negative findings", "not-assessed": "Findings not assessed by Common Shade" };
// which overview rungs apply to each kind of deliverable; the rest read "not tracked for this kind of deliverable"
const TYPES = {
  rule:      { label: "Rule or guideline", rungs: ["announced", "adopted", "delivered", "evaluated"] },
  plan:      { label: "Plan",              rungs: ["announced", "adopted", "funded", "delivered", "evaluated"] },
  office:    { label: "Office or body",    rungs: ["announced", "adopted", "funded", "delivered", "evaluated"] },
  platform:  { label: "Platform or initiative", rungs: ["announced", "adopted", "funded", "delivered", "evaluated"] },
  funding:   { label: "Funding",           rungs: ["announced", "funded", "delivered", "evaluated"] },
  service:   { label: "Service",           rungs: ["announced", "adopted", "funded", "delivered", "evaluated"] },
  framework: { label: "Framework or indicators", rungs: ["announced", "adopted", "delivered", "evaluated"] }
};
const RUNG_LABEL = { announced: "Announced", adopted: "Adopted", funded: "Funded", delivered: "Delivered", evaluated: "Evaluated" };
const STATE = {
  confirmed: { label: "Checked against an original source", short: "original checked" },
  reported:  { label: "Reported by secondary sources; original not checked", short: "reported" },
  unverified:{ label: "Not verified: no source passed a content check", short: "not verified" }
};
const REVIEW_SCOPE = "A review re-reads the sources cited here and the site's source-check records. It is not a full search for newer developments; a missing update means none was found in these sources, not that nothing happened.";
const M = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const date = d => { const [y, m, dd] = String(d || "").split("-"); return dd ? `${+dd} ${M[+m - 1]} ${y}` : m ? `${M[+m - 1]} ${y}` : y || ""; };
const precision = d => /^\d{4}-\d{2}-\d{2}$/.test(d) ? "day" : /^\d{4}-\d{2}$/.test(d) ? "month" : /^\d{4}$/.test(d) ? "year" : "";
// compare partial dates by their earliest moment, so "2026" sorts before "2026-03"
const key = d => String(d || "").padEnd(10, "-");

// a source's check status, from the check records: { content: {checked, batch, terms}, link: {checked, batch} }
function sourceCheck(url, CHECKS) {
  const rec = (CHECKS && CHECKS.urls && CHECKS.urls[url]) || [];
  const content = rec.filter(r => r.kind === "content" && /^(OK|REDIRECT)$/.test(r.status)).sort((a, b) => key(b.checked).localeCompare(key(a.checked)));
  const link = rec.filter(r => r.kind === "link" && /^(OK|REDIRECT)$/.test(r.status)).sort((a, b) => key(b.checked).localeCompare(key(a.checked)));
  return { content, link };
}
// did a content check find these terms (all of them) on this url? With no terms named, every expected term must have been found
function termsFound(url, terms, CHECKS) {
  const { content } = sourceCheck(url, CHECKS);
  for (const r of content) {
    const T = r.terms || {}, need = terms && terms.length ? terms : Object.keys(T);
    if (need.length && need.every(t => T[t] === true)) return r;
  }
  return null;
}
// the state of one piece of evidence and of a milestone (best of its evidence)
function evidenceState(ev, S, CHECKS) {
  const src = (S.sources || []).find(x => x.id === ev.source); if (!src) return { state: "unverified", why: "source not found" };
  const hit = termsFound(src.url, ev.terms, CHECKS), sc = sourceCheck(src.url, CHECKS);
  if (hit) return { state: src.type === "original" ? "confirmed" : "reported", check: hit, src };
  return { state: "unverified", src, why: sc.content.length ? "opened, but the terms this rests on were not all found" : sc.link.length ? "the page opened in a link check; its content was not checked for this" : "no check record in this repository" };
}
const RANK = { confirmed: 2, reported: 1, unverified: 0 };
function milestoneState(m, S, CHECKS) {
  const ev = (m.evidence || []).map(e => Object.assign({ e }, evidenceState(e, S, CHECKS)));
  const best = ev.reduce((b, x) => RANK[x.state] > RANK[b] ? x.state : b, "unverified");
  return { state: best, evidence: ev };
}
// the furthest overview rung a deliverable has evidence for (any state), and whether that rests on reports only
function furthest(d, S, CHECKS, today) {
  let at = -1, state = "unverified";
  for (const m of d.milestones || []) {
    const st = STEPS[m.step]; if (!st || (m.scheduled && key(m.date) > key(today))) continue;
    const r = RUNGS.indexOf(st.rung), ms = milestoneState(m, S, CHECKS).state;
    if (r > at || (r === at && RANK[ms] > RANK[state])) { at = r; state = ms; }
  }
  return { rung: at >= 0 ? RUNGS[at] : null, state };
}
// a deliverable's five-step checklist: for each rung, what the record shows (never filled in from a later rung)
function checklist(d, S, CHECKS, today) {
  const T = TYPES[d.type] || TYPES.platform;
  return RUNGS.map(r => {
    if (!T.rungs.includes(r)) return { rung: r, label: RUNG_LABEL[r], status: "na", text: "Not tracked for this kind of deliverable" };
    const ms = (d.milestones || []).filter(m => STEPS[m.step] && STEPS[m.step].rung === r);
    const past = ms.filter(m => !(m.scheduled && key(m.date) > key(today))), future = ms.filter(m => m.scheduled && key(m.date) > key(today));
    if (past.length) {
      const last = past.sort((a, b) => key(b.date).localeCompare(key(a.date)))[0], st = milestoneState(last, S, CHECKS).state;
      const f = last.step === "evaluated" ? ` (${(FINDINGS[last.findings] || FINDINGS["not-assessed"]).toLowerCase()})` : "";
      return { rung: r, label: RUNG_LABEL[r], status: st, step: last.step, date: last.date, text: `${STEPS[last.step].label}, ${date(last.date)}${f}: ${STATE[st].short}` };
    }
    if (future.length) { const f0 = future.sort((a, b) => key(a.date).localeCompare(key(b.date)))[0]; return { rung: r, label: RUNG_LABEL[r], status: "scheduled", step: f0.step, date: f0.date, text: `${STEPS[f0.step].label} scheduled for ${date(f0.date)}; not yet reached` }; }
    if (r === "evaluated") return { rung: r, label: RUNG_LABEL[r], status: "none", text: "No evaluation found in the sources checked" };
    return { rung: r, label: RUNG_LABEL[r], status: "none", text: "Not verified in the sources checked" };
  });
}
// events in a deliverable's life (ladder milestones and world events) in date order, for its history
function timeline(d) {
  return [...(d.milestones || []).map(m => Object.assign({ kind: "milestone" }, m)), ...(d.events || []).map(e => Object.assign({ kind: "event" }, e))]
    .sort((a, b) => key(a.date).localeCompare(key(b.date)));
}
// the latest dated development of a signal (its own date, or its latest past milestone or event)
function latest(S, today) {
  const ds = [S.date];
  for (const d of S.deliverables || []) for (const t of timeline(d)) if (!(t.scheduled && key(t.date) > key(today))) ds.push(t.date);
  return ds.sort((a, b) => key(b).localeCompare(key(a)))[0];
}
// what is coming: scheduled milestones still ahead, and the record's next review
function upcoming(S, today) {
  const out = [];
  for (const d of S.deliverables || []) for (const m of d.milestones || []) if (m.scheduled && key(m.date) > key(today)) out.push({ date: m.date, what: `${STEPS[m.step].label}: ${d.what}`, kind: "milestone", deliverable: d.id, milestone: m.id });
  if (S.review && S.review.due) out.push({ date: S.review.due, what: "Next review of this record", kind: "review" });
  return out.sort((a, b) => key(a.date).localeCompare(key(b.date)));
}
// the overview: deliverables by the furthest rung they have evidence for, non-cumulative, plus "no step with evidence"
function overview(D, CHECKS, today) {
  const C = D.signals.filter(s => s.kind === "commitment"), ds = C.flatMap(s => (s.deliverables || []).map(d => ({ s, d })));
  const b = Object.fromEntries([...RUNGS, "none"].map(r => [r, { n: 0, reportedOnly: 0, unverified: 0 }]));
  for (const { s, d } of ds) { const f = furthest(d, s, CHECKS, today), k = f.rung || "none"; b[k].n++; if (f.state === "reported") b[k].reportedOnly++; if (f.state === "unverified" && f.rung) b[k].unverified++; }
  return { buckets: b, deliverables: ds.length, commitments: C.length, signals: D.signals.length, byKind: Object.fromEntries((D.kinds || []).map(k => [k.id, D.signals.filter(s => s.kind === k.id).length])) };
}
// the legacy single stage and history, kept for readers of signals.json: derived from the deliverables, never typed.
// Scheduled milestones (a date a rule takes effect) are left out whatever the date, so the derived fields never change on
// their own when a date passes; the page shows them in full.
function legacy(S, CHECKS, today) {
  let top = -1; const hist = [];
  for (const d of S.deliverables || []) for (const m of d.milestones || []) {
    if (m.scheduled) continue;
    const r = RUNGS.indexOf(STEPS[m.step].rung); if (r > top) top = r;
    hist.push({ date: m.date, stage: STEPS[m.step].rung, note: m.note });
  }
  hist.sort((a, b) => key(a.date).localeCompare(key(b.date)));
  return { stage: top >= 0 ? RUNGS[top] : "announced", history: hist };
}
module.exports = { RUNGS, STEPS, EVENTS, FINDINGS, TYPES, RUNG_LABEL, STATE, REVIEW_SCOPE, date, precision, key,
  sourceCheck, termsFound, evidenceState, milestoneState, furthest, checklist, timeline, latest, upcoming, overview, legacy };
