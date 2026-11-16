#!/usr/bin/env node
// Common Shade: the review workflow for Signals. Nothing here publishes on its own: a proposal becomes part of the record
// only through "apply", which refuses evidence the site's source check has not confirmed, and only lands on the site
// through a reviewed pull request. AI-assisted discovery may prepare proposals; a person approves them.
//   node tools/signals-review.js due [days]          records due for review within [days] (default 30), effective dates
//                                                    now passed (look for implementation evidence), and evidence not verified
//   node tools/signals-review.js sources <sig-id>    what each source's check found, and the state of each milestone
//   node tools/signals-review.js propose <sig-id> <d-id|new> <step> <YYYY[-MM[-DD]]>
//                                                    writes research/signals/proposals/<sig-id>--<date>.json to fill in
//   node tools/signals-review.js apply <proposal.json>
//                                                    adds the milestone (and a new source or deliverable) to signals.json,
//                                                    then run node tools/signals-sync.js and the checks
// A proposal records which source was checked and when, what it establishes, the terms the check found, any conflicting
// source, and who approved it. A reachable page or a matching phrase alone is not enough: the terms must have been found
// by a content check (stage the source with verify-sources.yml first; see data/inbox/README files).
"use strict";
const fs = require("fs"), path = require("path"), SM = require("./signals-model.js");
const ROOT = path.join(__dirname, ".."), F = path.join(ROOT, "data/site/signals.json"), FC = path.join(ROOT, "data/site/signals-checks.json");
const PROP = path.join(ROOT, "research/signals/proposals"), today = new Date().toISOString().slice(0, 10);
const D = JSON.parse(fs.readFileSync(F, "utf8")), C = fs.existsSync(FC) ? JSON.parse(fs.readFileSync(FC, "utf8")) : { urls: {} };
const [cmd, ...args] = process.argv.slice(2), sig = id => D.signals.find(s => s.id === id) || die(`no signal "${id}"`);
function die(m) { console.error(m); process.exit(1); }
const plus = n => { const d = new Date(today); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

if (cmd === "due") {
  const until = plus(+(args[0] || 30));
  const due = D.signals.filter(s => s.review && SM.key(s.review.due) <= SM.key(until)).sort((a, b) => SM.key(a.review.due).localeCompare(SM.key(b.review.due)));
  console.log(`Due for review by ${until} (${due.length}):`); due.forEach(s => console.log(`  ${s.review.due}  ${s.id}  (last reviewed ${s.review.reviewed})`));
  const passed = D.signals.flatMap(s => (s.deliverables || []).flatMap(d => d.milestones.filter(m => m.scheduled && SM.key(m.date) <= SM.key(today)).map(m => `  ${m.date}  ${s.id} ${d.id}: ${SM.STEPS[m.step].label} has passed; look for implementation evidence (the date alone shows no compliance)`)));
  console.log(`\nScheduled dates now passed (${passed.length}):`); passed.forEach(x => console.log(x));
  const weak = D.signals.flatMap(s => (s.deliverables || []).flatMap(d => d.milestones.map(m => [s, d, m, SM.milestoneState(m, s, C).state]).filter(x => x[3] !== "confirmed").map(([s, d, m, st]) => `  ${s.id} ${d.id} ${m.id}: ${SM.STATE[st].label}`)));
  console.log(`\nMilestones not checked against an original source (${weak.length}):`); weak.forEach(x => console.log(x));
} else if (cmd === "sources") {
  const s = sig(args[0]);
  console.log(`${s.id}: ${s.title}\nRecord last reviewed ${s.review.reviewed}; next review due ${s.review.due}.\n\nSources:`);
  for (const x of s.sources) { const c = SM.sourceCheck(x.url, C);
    console.log(`  [${x.id}] ${x.type}: ${x.label}\n    ${x.url}`);
    c.content.forEach(r => console.log(`    content check ${r.checked} (${r.batch}): ${r.status}; terms ${Object.entries(r.terms || {}).map(([t, v]) => `${v ? "found" : "NOT found"} "${t}"`).join(", ") || "none recorded"}`));
    c.link.forEach(r => console.log(`    link check ${r.checked} (${r.batch}): ${r.status}; content not checked`));
    if (!c.content.length && !c.link.length) console.log("    no check record in this repository"); }
  for (const d of s.deliverables || []) { console.log(`\n${d.id}: ${d.what}`);
    for (const m of d.milestones) { const r = SM.milestoneState(m, s, C); console.log(`  ${m.id} ${m.step} ${m.date}${m.scheduled ? " (scheduled)" : ""}: ${SM.STATE[r.state].label}`);
      r.evidence.forEach(x => console.log(`    - ${x.e.source}: ${x.state}${x.why ? " (" + x.why + ")" : ""}; establishes: ${x.e.establishes}`)); } }
} else if (cmd === "propose") {
  const [id, did, step, date] = args, s = sig(id);
  if (!SM.STEPS[step] && !SM.EVENTS[step]) die(`step must be one of ${[...Object.keys(SM.STEPS), ...Object.keys(SM.EVENTS)].join(", ")}`);
  if (!/^\d{4}(-\d{2}(-\d{2})?)?$/.test(date || "")) die("date is YYYY, YYYY-MM or YYYY-MM-DD");
  if (did !== "new" && !(s.deliverables || []).some(d => d.id === did)) die(`no deliverable "${did}" in ${id}; use "new" to propose one`);
  fs.mkdirSync(PROP, { recursive: true });
  const f = path.join(PROP, `${id}--${today}-${step}.json`);
  const P = { signal: id, deliverable: did, new_deliverable: did === "new" ? { id: "d-", what: "", type: Object.keys(SM.TYPES).join(" | ") } : undefined,
    milestone: { id: "m-", step, date, scheduled: false, note: "", findings: SM.STEPS[step] && step === "evaluated" ? Object.keys(SM.FINDINGS).join(" | ") : undefined },
    evidence: [{ source: "an existing source id, or the id of new_source", establishes: "what this source shows for this step, in one sentence", terms: ["exact words the content check found"] }],
    new_source: { id: "", type: "original | secondary", label: "", url: "" },
    conflicts: [], checked_on: today, proposed_by: "", approved_by: "", notes: "A reachable page or one matching phrase is not enough. Stage a new source with verify-sources.yml before applying." };
  fs.writeFileSync(f, JSON.stringify(P, null, 1) + "\n"); console.log(`wrote ${path.relative(ROOT, f)}; fill it in, then: node tools/signals-review.js apply ${path.relative(ROOT, f)}`);
} else if (cmd === "apply") {
  const f = path.resolve(args[0] || die("give the proposal file")), P = JSON.parse(fs.readFileSync(f, "utf8")), s = sig(P.signal), bad = [];
  if (!P.approved_by) bad.push("approved_by is empty: a person approves every revision");
  const ns = P.new_source && P.new_source.url ? P.new_source : null;
  if (ns && (!ns.id || !["original", "secondary"].includes(ns.type) || !ns.label)) bad.push("new_source needs an id, a type (original or secondary) and a label");
  if (ns && s.sources.some(x => x.id === ns.id)) bad.push(`source id "${ns.id}" is already used in ${s.id}`);
  const tmp = Object.assign({}, s, { sources: ns ? [...s.sources, ns] : s.sources });
  const m = Object.assign({}, P.milestone, { evidence: P.evidence });
  if (!m.scheduled) delete m.scheduled; if (m.step !== "evaluated") delete m.findings;
  for (const e of P.evidence || []) {
    if (!e.establishes || /in one sentence/.test(e.establishes)) bad.push(`evidence from "${e.source}" needs "establishes"`);
    const r = SM.evidenceState(e, tmp, C); if (r.state === "unverified") bad.push(`evidence from "${e.source}" is not verified: ${r.why}. Stage the source and run verify-sources.yml, then node tools/signals-sync.js`);
  }
  if (!m.note) bad.push("the milestone needs a short note");
  const isEvent = !!SM.EVENTS[m.step];
  let d = (s.deliverables || []).find(x => x.id === P.deliverable);
  if (P.deliverable === "new") { const nd = P.new_deliverable || {}; if (!/^d-[a-z0-9-]+$/.test(nd.id || "") || !nd.what || !SM.TYPES[nd.type]) bad.push("new_deliverable needs an id (d-words), what and a type"); else d = { id: nd.id, what: nd.what, type: nd.type, milestones: [], unknown: [], next: nd.next || "" }; }
  if (!d) bad.push("no deliverable to add to");
  if (d && !isEvent && (d.milestones || []).some(x => x.id === m.id)) bad.push(`milestone id "${m.id}" already exists in ${d.id}`);
  if (bad.length) die("Not applied:\n" + bad.map(b => "  - " + b).join("\n"));
  if (ns) s.sources.push(ns);
  if (P.deliverable === "new") (s.deliverables = s.deliverables || []).push(d);
  if (isEvent) (d.events = d.events || []).push({ step: m.step, date: m.date, note: m.note, evidence: m.evidence }); else d.milestones.push(m);
  if ((P.conflicts || []).length) d.conflicts = [...(d.conflicts || []), ...P.conflicts];
  s.review.reviewed = today;
  fs.writeFileSync(F, JSON.stringify(D, null, 1) + "\n");
  console.log(`applied to ${s.id} ${d.id}. Now: node tools/signals-sync.js && node tools/build-data.js --check && node tools/check-signals.js, then set review.due and open a pull request`);
} else {
  console.log(fs.readFileSync(__filename, "utf8").split("\n").slice(1, 17).map(l => l.replace(/^\/\/ ?/, "")).join("\n"));
}
