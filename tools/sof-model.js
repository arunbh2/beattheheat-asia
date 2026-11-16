// Common Shade: the model behind State of the field (/whats-new/), shared by the page (tools/build-sof.js), the text
// twin, the Markdown briefing and llms-full.txt (tools/sof-text.js), the check (tools/check-sof.js) and the review tool
// (tools/sof-review.js).
// An edition is one file: data/site/briefs/<YYYY-MM>.json when published, data/site/briefs/drafts/<YYYY-MM>.json while a
// draft. Drafts never reach the public build. Each edition keeps a snapshot of every source it cites (title, date, url,
// what the site's source check found at the time, and a fingerprint of the record it came from), so a later change to
// the knowledge base or to Signals never rewrites what an edition said: the page shows the change beside the snapshot
// instead. data/site/briefs/_ledger.json holds a hash of each published edition after each revision; a published file
// that changes without a dated revision fails the check.
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const ROOT = path.join(__dirname, "..");
const DIR = path.join(ROOT, "data/site/briefs"), DRAFTS = path.join(DIR, "drafts"), LEDGER = path.join(DIR, "_ledger.json");
const SM = require("./signals-model.js");

const readJ = f => JSON.parse(fs.readFileSync(f, "utf8"));
const ID = /^\d{4}-\d{2}$/;
function load(opts = {}) {
  const pub = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter(f => ID.test(f.replace(/\.json$/, "")) && f.endsWith(".json")).map(f => Object.assign(readJ(path.join(DIR, f)), { _file: path.join(DIR, f) })) : [];
  const dr = opts.drafts && fs.existsSync(DRAFTS) ? fs.readdirSync(DRAFTS).filter(f => f.endsWith(".json")).map(f => Object.assign(readJ(path.join(DRAFTS, f)), { _file: path.join(DRAFTS, f) })) : [];
  return [...pub, ...dr].sort((a, b) => b.id.localeCompare(a.id));
}
const published = () => load().filter(e => e.status === "published");
const latest = () => published()[0] || null;
const ledger = () => fs.existsSync(LEDGER) ? readJ(LEDGER) : {};

// ---- dates ----
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function date(d) {
  if (!d) return "";
  const m = String(d).match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/); if (!m) return String(d);
  return [m[3] ? String(+m[3]) : "", m[2] ? MONTHS[+m[2] - 1] : "", m[1]].filter(Boolean).join(" ");
}
function range(p) {
  const [a, b] = [p.from, p.to]; if (!a || !b) return date(a || b);
  if (a.slice(0, 7) === b.slice(0, 7)) return `${+a.slice(8)} to ${date(b)}`;
  return `${date(a)} to ${date(b)}`;
}
const key = d => String(d || "").padEnd(10, "-");
// does a dated thing fall inside the reporting period? A month or year counts if it overlaps.
function inPeriod(d, p) { if (!d) return false; const s = String(d); return key(s) <= key(p.to) && (s + "-99").slice(0, 10) >= p.from; }
const label = e => date(e.id);
const url = e => `/whats-new/${e.id}/`;
const corrections = e => (e.revisions || []).filter(r => r.kind === "correction");
const revised = e => (e.revisions || []).filter(r => r.kind !== "published").map(r => r.date).sort().pop() || null;

// ---- hashing: everything an edition says, except its revision log ----
function canon(x) { if (Array.isArray(x)) return x.map(canon); if (x && typeof x === "object") return Object.keys(x).filter(k => !k.startsWith("_") && k !== "revisions").sort().reduce((o, k) => (o[k] = canon(x[k]), o), {}); return x; }
const hash = e => crypto.createHash("sha256").update(JSON.stringify(canon(e))).digest("hex").slice(0, 16);

// ---- sources: snapshot and current ----
let _kb = null, _sig = null, _checks = null;
const kb = () => _kb || (_kb = fs.readdirSync(path.join(ROOT, "data/kb")).filter(f => f.endsWith(".json") && !f.startsWith("_")).flatMap(f => readJ(path.join(ROOT, "data/kb", f))));
const sig = () => _sig || (_sig = readJ(path.join(ROOT, "data/site/signals.json")));
const checks = () => _checks || (_checks = readJ(path.join(ROOT, "data/site/signals-checks.json")));
function origin(o) {
  const i = String(o || "").indexOf(":"), kind = String(o || "").slice(0, i), rest = String(o || "").slice(i + 1); if (!rest) return null;
  if (kind === "kb") { const r = kb().find(x => x.id === rest); return r ? { kind, id: rest, rec: r } : null; }
  if (kind === "site") { const [pth, anc] = rest.split("#"), f = path.join(ROOT, pth.replace(/^\//, ""), "index.html");
    const ok = fs.existsSync(f) && (!anc || fs.readFileSync(f, "utf8").includes(`id="${anc}"`)); return ok ? { kind, id: rest, rec: { path: rest } } : null; }
  if (kind === "signals") { const [sid, src] = rest.split("/"); const s = sig().signals.find(x => x.id === sid); const so = s && s.sources.find(x => x.id === src); return so ? { kind, id: sid, src, rec: s, source: so } : null; }
  return null;
}
// a fingerprint of what matters in the record a source came from: a re-serialised file or a review date does not change it
function fingerprint(o) {
  const r = origin(o); if (!r || r.kind === "site") return null;
  if (r.kind === "kb") return crypto.createHash("sha256").update(JSON.stringify([r.rec.title, r.rec.summary, r.rec.status, r.rec.url || "", r.rec.as_of])).digest("hex").slice(0, 12);
  const C = checks(), s = r.rec;
  const steps = (s.deliverables || []).flatMap(d => [...d.milestones.map(m => [d.id, m.step, m.date, SM.milestoneState(m, s, C).state]), ...(d.events || []).map(ev => [d.id, ev.step, ev.date])]);
  return crypto.createHash("sha256").update(JSON.stringify([s.title, s.summary, s.date, steps])).digest("hex").slice(0, 12);
}
// what the site's source check holds for a url, on or before a date
function checkOn(u, by) {
  const C = checks(), rows = (C.urls[u] || []).filter(r => !by || key(r.checked) <= key(by));
  const content = rows.filter(r => r.kind === "content").sort((a, b) => b.checked.localeCompare(a.checked));
  if (content.length) { const r = content[0]; return { kind: "content", checked: r.checked, batch: r.batch, status: r.status, found: Object.entries(r.terms || {}).filter(([, v]) => v).map(([t]) => t), missing: Object.entries(r.terms || {}).filter(([, v]) => !v).map(([t]) => t) }; }
  const link = rows.filter(r => r.kind === "link").sort((a, b) => b.checked.localeCompare(a.checked))[0];
  return link ? { kind: "link", checked: link.checked, batch: link.batch, status: link.status } : { kind: "none" };
}
const CHECK = {
  content: "Content checked: the page opened and the terms relied on were found",
  link: "Link checked only: the page opened, its content was not checked",
  none: "No check record in this repository",
  site: "Common Shade's own page, built from its data"
};
function snapshot(s, by) {
  const r = origin(s.origin); if (!r) throw new Error(`source origin "${s.origin}" not found`);
  const out = Object.assign({}, s);
  if (r.kind === "site") { out.url = out.url || r.rec.path; out.type = "own"; out.check = { kind: "site" }; out.fp = null; return out; }
  if (r.kind === "kb") { const k = r.rec;
    out.title = out.title || k.title; out.publisher = out.publisher || k.publisher; out.url = out.url || k.url; out.archive = out.archive || k.archive || "";
    out.type = out.type || (k.kind === "news" ? "secondary" : "original"); out.date = out.date || k.as_of; }
  else { const so = r.source;
    out.title = out.title || so.label; out.url = out.url || so.url; out.type = out.type || so.type; out.date = out.date || r.rec.date; out.archive = out.archive || ""; }
  out.check = checkOn(out.url, by); out.fp = fingerprint(s.origin);
  return out;
}
// the current state of a source beside its snapshot: has the record it came from changed in a way that matters?
function current(s) {
  const r = origin(s.origin), fp = fingerprint(s.origin), now = r && r.kind === "site" ? { kind: "site" } : checkOn(s.url);
  return { exists: !!r, changed: !!r && !!s.fp && fp !== s.fp, gone: !r, check: now, link: r ? (r.kind === "signals" ? `/signals/#${r.id}` : null) : null };
}

// ---- derived text ----
function devDates(d, e) {
  return { occurred: d.occurred, reviewed: d.reviewed, inPeriod: inPeriod(d.occurred.date, e.period) };
}
function summary(e) {
  const L = [];
  L.push(`State of the field, ${label(e)}. Reporting period ${range(e.period)}; evidence cut-off ${date(e.cutoff)}; ${e.status === "published" ? `published ${date(e.published)}` : "draft, not published"}${revised(e) ? `; revised ${date(revised(e))}` : ""}.`);
  L.push(e.argument.claim);
  (e.developments || []).forEach(d => L.push(`- ${d.h}: ${d.gist}`));
  if (e.opportunity) L.push(`Opportunity: ${e.opportunity.h}. ${e.opportunity.gist}`);
  if (e.question) L.push(`Open question: ${e.question.q}`);
  if (corrections(e).length) L.push(`Corrected ${corrections(e).map(c => date(c.date)).join(", ")}: ${corrections(e).map(c => c.gist).join(" ")}`);
  return L;
}

// ---- validation, shared by the check, the review tool and build-data ----
const ROLES = ["authorise", "deliver", "finance", "maintain"];
const AUD = { city: "City and public-service teams", workers: "Worker and community organisations", funders: "Funders and philanthropic institutions", researchers: "Researchers and ecosystem builders" };
function validate(e, opts = {}) {
  const bad = [], need = (c, m) => { if (!c) bad.push(`${e.id || "?"}: ${m}`); };
  need(ID.test(e.id || ""), "id is YYYY-MM");
  need(e.schema === 2, "schema is 2");
  need(["published", "draft"].includes(e.status), "status is published or draft");
  need(e.period && /^\d{4}-\d{2}-\d{2}$/.test(e.period.from) && /^\d{4}-\d{2}-\d{2}$/.test(e.period.to) && e.period.from <= e.period.to, "period has from and to (YYYY-MM-DD)");
  need(/^\d{4}-\d{2}-\d{2}$/.test(e.cutoff || ""), "cutoff is YYYY-MM-DD");
  if (e.status === "published") {
    need(/^\d{4}-\d{2}-\d{2}$/.test(e.published || ""), "a published edition has a published date");
    need(!e.published || e.cutoff <= e.published, "the evidence cut-off is on or before publication");
    need((e.revisions || [])[0] && e.revisions[0].kind === "published" && e.revisions[0].date === e.published, "revisions start with the publication, dated as published");
    need(!!e.approved, "a published edition records who approved it (a role, never a person's name on the page)");
  } else need(!e.published, "a draft has no published date");
  const A = e.argument || {};
  need(A.headline && A.claim && A.rests_on, "argument has headline, claim and rests_on (the scope and limits of the inference)");
  const S = e.sources || {};
  for (const [k, s] of Object.entries(S)) {
    need(s.origin && origin(s.origin), `source ${k}: origin "${s.origin}" names a knowledge-base or Signals record that exists`);
    need(s.title && s.url && ["original", "secondary", "own"].includes(s.type) && s.date, `source ${k}: title, url, date and type (original or secondary); run node tools/sof-review.js snapshot ${e.id}`);
    need(s.check && s.check.kind, `source ${k}: a check snapshot (run node tools/sof-review.js snapshot ${e.id})`);
    if (s.check && !["none", "site"].includes(s.check.kind)) { const rows = (checks().urls[s.url] || []).filter(r => r.kind === s.check.kind && r.checked === s.check.checked && r.batch === s.check.batch);
      need(rows.length, `source ${k}: its check snapshot (${s.check.kind}, ${s.check.checked}, ${s.check.batch}) matches a record in signals-checks.json`); }
  }
  const usedSrc = new Set();
  const claimOk = (c, where) => {
    need(c.says && c.source && S[c.source], `${where}: each claim says something and names a source in this edition`);
    if (c.source) usedSrc.add(c.source);
    need(c.establishes, `${where}: each claim states what its source establishes, and what it does not`);
    if (c.kind === "not-found") need(c.searched, `${where}: a "not found" claim states what was searched, and when`);
    const s = S[c.source];
    if (s && s.check && !["content", "site"].includes(s.check.kind) && !c.unverified) bad.push(`${e.id}: ${where}: source ${c.source} was not content-checked; mark the claim "unverified": true so the page says so`);
  };
  const devs = e.developments || [];
  need(devs.length <= 3, "at most three developments");
  devs.forEach((d, i) => { const w = `development ${d.id || i + 1}`;
    need(d.id && d.h && d.gist && d.reading, `${w}: id, h, gist and reading`);
    need(d.occurred && d.occurred.date && d.occurred.what, `${w}: occurred {date, what}: when the event happened or the research was published`);
    need(/^\d{4}-\d{2}-\d{2}$/.test(d.reviewed || ""), `${w}: reviewed (YYYY-MM-DD): when Common Shade reviewed or added it`);
    need(!d.reviewed || d.reviewed <= (e.published || e.cutoff) || (e.revisions || []).some(r => r.date >= d.reviewed && r.kind !== "published"), `${w}: reviewed on or before publication, or added in a later revision`);
    if (d.occurred && !inPeriod(d.occurred.date, e.period)) need(d.why_here, `${w}: happened outside the reporting period, so it needs why_here: why it belongs in this edition`);
    need((d.claims || []).length, `${w}: at least one claim with its source`);
    (d.claims || []).forEach((c, j) => claimOk(c, `${w}, claim ${j + 1}`));
    need((d.limits || []).length, `${w}: limits (what the evidence does not show)`);
    need(d.would_change, `${w}: would_change (what evidence would strengthen or change the reading)`);
    if (d.signals) { const s = sig().signals.find(x => x.id === d.signals); need(s, `${w}: signals record ${d.signals} exists`);
      if (s && d.claimed_step) { const order = Object.keys(SM.STEPS), f = (s.deliverables || []).flatMap(dl => dl.milestones.filter(m => !m.scheduled).map(m => order.indexOf(m.step)));
        const max = Math.max(-1, ...f), sched = (s.deliverables || []).some(dl => dl.milestones.some(m => m.scheduled && m.step === d.claimed_step));
        need(order.indexOf(d.claimed_step) <= max || sched, `${w}: claims "${d.claimed_step}", further than the Signals record ${d.signals} shows (furthest: ${order[max] || "none"})`); } }
  });
  const O = e.opportunity;
  if (O) { need(O.h && O.gist && O.problem && O.mechanism && O.dependency && O.next_check, "opportunity: h, gist, problem, mechanism, dependency and next_check");
    need((O.claims || []).length, "opportunity: claims with sources"); (O.claims || []).forEach((c, j) => claimOk(c, `opportunity, claim ${j + 1}`));
    need((O.limits || []).length, "opportunity: limits");
    if (O.roles) { need(O.roles.proposal === true, "opportunity roles are marked proposal: true"); ROLES.forEach(r => need(O.roles[r], `opportunity roles: ${r}`)); } }
  const Q = e.question;
  if (Q) { need(Q.q && Q.why_now && Q.known && Q.unknown && Q.decision && Q.would_help, "question: q, why_now, known, unknown, decision and would_help");
    (Q.claims || []).forEach((c, j) => claimOk(c, `question, claim ${j + 1}`));
    if (Q.revisits) { const prev = load({ drafts: true }).find(x => x.id === Q.revisits.edition);
      need(prev && prev.status === "published" && prev.id < e.id, `question revisits ${Q.revisits.edition}: an earlier published edition`);
      need(Q.revisits.new_evidence && Q.revisits.changed && Q.revisits.unresolved, "question revisits: new_evidence, changed and unresolved"); } }
  (e.watch || []).forEach((w, i) => need(w.what && w.evidence, `watch ${i + 1}: what and the evidence that would matter`));
  (e.audiences || []).forEach(a => need(AUD[a.who] && a.q, `audience ${a.who}: one of ${Object.keys(AUD).join(", ")}, with a question`));
  (e.revisions || []).forEach((r, i) => { need(/^\d{4}-\d{2}-\d{2}$/.test(r.date || "") && ["published", "revision", "correction"].includes(r.kind) && r.note, `revision ${i + 1}: date, kind (published, revision or correction) and note`);
    if (r.kind === "correction") need(r.gist && r.id, `correction ${i + 1}: id and a one-sentence gist`); });
  for (const k of Object.keys(S)) need(usedSrc.has(k), `source ${k} is not cited by any claim`);
  return bad;
}

module.exports = { ROOT, DIR, DRAFTS, LEDGER, load, published, latest, ledger, date, range, key, inPeriod, label, url, corrections, revised, hash, origin, fingerprint, checkOn, CHECK, snapshot, current, devDates, summary, validate, ROLES, AUD };
