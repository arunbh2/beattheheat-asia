#!/usr/bin/env node
// Common Shade: checks the Signals model (tools/signals-model.js) and page cards (tools/build-signals.js) on fixed test
// records for the cases the real records do not yet contain, and checks the real records and built page.
//   node tools/check-signals.js
// Fixtures (never published): several deliverables at different steps; partial delivery with funding unknown; a future
// effective date; an evaluation with negative and with mixed findings; a superseded deliverable; a correction by the site;
// evidence at a later step that must not fill earlier steps; secondary-only, link-only and missing-term evidence.
// Real data: the derived stage and history are in step (signals-sync), the overview adds up, every record, deliverable and
// milestone has an anchor on the built page, and the page states its denominator.
"use strict";
const fs = require("fs"), path = require("path"), SM = require("./signals-model.js");
const ROOT = path.join(__dirname, ".."), fails = [], ok = (c, m) => { if (!c) fails.push(m); };
const TODAY = "2026-11-16";
const CHECKS = { urls: {
  "https://gov.example/rule": [{ kind: "content", batch: "fixture", checked: "2026-11-10", status: "OK", terms: { "adopted": true, "1 March 2027": true, "evaluation": true } }],
  "https://news.example/story": [{ kind: "content", batch: "fixture", checked: "2026-11-10", status: "OK", terms: { "pilot": true, "cancelled": true } }],
  "https://gov.example/missing": [{ kind: "content", batch: "fixture", checked: "2026-11-10", status: "OK", terms: { "budget": false } }],
  "https://link.example/only": [{ kind: "link", batch: "fixture", checked: "2026-11-07", status: "OK" }]
} };
const src = [{ id: "gov", type: "original", label: "Ministry, 2026", url: "https://gov.example/rule" }, { id: "news", type: "secondary", label: "Daily, 2026", url: "https://news.example/story" },
  { id: "gap", type: "original", label: "Budget, 2026", url: "https://gov.example/missing" }, { id: "link", type: "secondary", label: "Blog, 2026", url: "https://link.example/only" }];
const ev = (source, terms) => ({ source, establishes: "fixture", terms });
const F = {
  id: "sig-fixture", group: "year", kind: "commitment", date: "2026-02", title: "Fixture", summary: "A test record.", who: "A ministry", where: "Testland",
  places: ["region"], levers: [], next: "n", sources: src, relevance: { basis: "explicit" }, review: { reviewed: "2026-11-16", due: "2027-02-16" },
  corrections: [{ date: "2026-11-01", note: "An earlier version showed the wrong date." }],
  deliverables: [
    { id: "d-rule", what: "A rule", type: "rule", unknown: ["compliance"], next: "inspection reports",
      milestones: [{ id: "m-adopted", step: "adopted", date: "2026-03", note: "adopted", evidence: [ev("gov", ["adopted"])] },
                   { id: "m-effective", step: "effective", date: "2027-03-01", scheduled: true, note: "takes effect", evidence: [ev("gov", ["1 March 2027"])] }] },
    { id: "d-only-future", what: "A rule not yet in force", type: "rule", unknown: [], next: "n",
      milestones: [{ id: "m-eff", step: "effective", date: "2027-03-01", scheduled: true, note: "takes effect", evidence: [ev("gov", ["1 March 2027"])] }] },
    { id: "d-pilot", what: "A pilot, partly delivered, funding unknown", type: "service", unknown: ["funding: not disclosed"], next: "n",
      milestones: [{ id: "m-partial", step: "delivered-partial", date: "2026-06", note: "under way in two districts", evidence: [ev("news", ["pilot"])] }] },
    { id: "d-eval-neg", what: "An evaluated programme", type: "service", unknown: [], next: "n",
      milestones: [{ id: "m-eval", step: "evaluated", date: "2026-09", findings: "negative", note: "no effect found", evidence: [ev("gov", ["evaluation"])] }] },
    { id: "d-eval-mixed", what: "Another evaluated programme", type: "service", unknown: [], next: "n",
      milestones: [{ id: "m-eval", step: "evaluated", date: "2026-09", findings: "mixed", note: "mixed results", evidence: [ev("gov", ["evaluation"])] }] },
    { id: "d-old", what: "A superseded plan", type: "plan", unknown: [], next: "n",
      milestones: [{ id: "m-adopted", step: "adopted", date: "2026-02", note: "adopted", evidence: [ev("gov", ["adopted"])] }],
      events: [{ step: "superseded", date: "2026-08", note: "replaced by the 2026 rule", evidence: [ev("news", ["cancelled"])] }] },
    { id: "d-weak", what: "Funding resting on weak evidence", type: "funding", unknown: [], next: "n",
      milestones: [{ id: "m-terms", step: "funding-announced", date: "2026-05", note: "announced", evidence: [ev("gap", ["budget"])] },
                   { id: "m-link", step: "funding-committed", date: "2026-06", note: "committed", evidence: [ev("link")] }] }
  ]
};
const D = id => F.deliverables.find(d => d.id === id), row = (id, r) => SM.checklist(D(id), F, CHECKS, TODAY).find(c => c.rung === r);
// several deliverables keep their own steps
ok(SM.furthest(D("d-rule"), F, CHECKS, TODAY).rung === "adopted", "rule: furthest step is adopted (the future effective date does not count)");
ok(SM.furthest(D("d-pilot"), F, CHECKS, TODAY).rung === "delivered", "pilot: partly delivered sits on the delivered step");
// evidence at a later step does not fill earlier steps
ok(row("d-pilot", "announced").status === "none" && row("d-pilot", "adopted").status === "none", "pilot: announced and adopted are not filled in from delivery");
ok(row("d-pilot", "funded").status === "none", "pilot: funding stays not verified (unknown, not failed)");
ok(/Partly delivered/.test(row("d-pilot", "delivered").text), "pilot: the delivered step says partly delivered");
// a future effective date is scheduled, not reached, and does not imply compliance
ok(row("d-only-future", "adopted").status === "scheduled", "future effective date: shows as scheduled");
ok(SM.furthest(D("d-only-future"), F, CHECKS, TODAY).rung === null, "future effective date: not counted as reached");
ok(SM.upcoming(F, TODAY).some(u => u.date === "2027-03-01"), "future effective date: listed as coming up");
ok(row("d-rule", "delivered").status === "none", "rule: an effective date does not show implementation");
// evaluations carry their findings
ok(/negative findings/.test(row("d-eval-neg", "evaluated").text), "evaluation: negative findings are stated");
ok(/mixed findings/.test(row("d-eval-mixed", "evaluated").text), "evaluation: mixed findings are stated");
// evidence states
ok(row("d-pilot", "delivered").status === "reported", "secondary-only evidence shows as reported");
ok(SM.milestoneState(D("d-weak").milestones[0], F, CHECKS).state === "unverified", "a term the check did not find leaves the milestone not verified");
ok(SM.milestoneState(D("d-weak").milestones[1], F, CHECKS).state === "unverified", "a page that only opened in a link check is not evidence");
ok(SM.milestoneState(D("d-rule").milestones[0], F, CHECKS).state === "confirmed", "an original source with its terms found confirms the milestone");
// superseded: in the history, never on the ladder
ok(SM.timeline(D("d-old")).some(t => t.kind === "event" && t.step === "superseded"), "superseded event is kept in the history");
ok(SM.legacy(F, CHECKS, TODAY).history.every(h => SM.RUNGS.includes(h.stage)), "legacy history holds ladder steps only");
// the overview adds up on the fixture
const O = SM.overview({ signals: [F, { id: "sig-f2", kind: "finding" }], kinds: [{ id: "commitment" }, { id: "finding" }] }, CHECKS, TODAY);
ok(Object.values(O.buckets).reduce((a, b) => a + b.n, 0) === O.deliverables, "overview buckets add up to the deliverables");
ok(O.buckets.none.n === 1, "overview: a deliverable with only a scheduled date counts as no step with evidence");
// the card renders all of it
const B = require("./build-signals.js"), esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const ctx = Object.assign(B.context(TODAY), { CHECKS }), html = B.render(esc, ctx)(F);
for (const [needle, what] of [["Negative findings", "negative findings label"], ["Mixed findings", "mixed findings label"], ["Superseded", "superseded event"], ["Scheduled, not yet reached", "scheduled milestone"],
  ["/corrections/", "link to corrections"], ["no separate evidence recorded", "earlier steps not inferred"], ["not verified in the sources checked", "missing evidence worded as not verified"],
  ['id="sig-fixture--d-rule--m-effective"', "milestone anchor"], ['id="sig-fixture--d-pilot"', "deliverable anchor"], ["Reaching this date will not, by itself", "effective date caveat"]])
  ok(html.includes(needle), `card: shows the ${what}`);
ok(!/\bfailed\b|\bstalled\b/i.test(html.replace(/never failed/g, "")), "card: never says failed or stalled");
// the real records
const R = JSON.parse(fs.readFileSync(path.join(ROOT, "data/site/signals.json"), "utf8")), RC = JSON.parse(fs.readFileSync(path.join(ROOT, "data/site/signals-checks.json"), "utf8"));
const today = new Date().toISOString().slice(0, 10), RO = SM.overview(R, RC, today);
ok(Object.values(RO.buckets).reduce((a, b) => a + b.n, 0) === RO.deliverables, "real records: overview buckets add up");
for (const s of R.signals.filter(s => s.kind === "commitment")) { const g = SM.legacy(s, RC, today); ok(s.stage === g.stage && JSON.stringify(s.history) === JSON.stringify(g.history), `${s.id}: stage and history are derived (run node tools/signals-sync.js)`); }
const page = fs.existsSync(path.join(ROOT, "signals/index.html")) ? fs.readFileSync(path.join(ROOT, "signals/index.html"), "utf8") : "";
ok(page, "signals/index.html is built (node tools/build-static.js)");
for (const s of R.signals) { ok(page.includes(`id="${s.id}"`), `page: record ${s.id} has an anchor`);
  for (const d of s.deliverables || []) { ok(page.includes(`id="${s.id}--${d.id}"`), `page: deliverable ${s.id}--${d.id} has an anchor`);
    for (const m of d.milestones) ok(page.includes(`id="${s.id}--${d.id}--${m.id}"`), `page: milestone ${s.id}--${d.id}--${m.id} has an anchor`); } }
ok(/not a census of the region/.test(page), "page: states its denominator and that it is a selection");
ok(/<script src="\/signals\/signals\.js\?v=\d+" defer><\/script>/.test(page), "page: loads its finder script, deferred");
if (fails.length) { console.log(fails.map(f => "  FAIL " + f).join("\n")); process.exit(1); }
console.log(`signals check passed: model and card on fixtures (several deliverables, partial delivery, a future effective date, negative and mixed evaluations, supersession, a correction, weak evidence), ${R.signals.length} real records and their anchors`);
