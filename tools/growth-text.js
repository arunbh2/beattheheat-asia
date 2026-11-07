// Common Shade: what /growing/ ("Watch Common Shade grow"), llms-full.txt and the exit card share, so they never
// differ. Reads the change record (data/site/growth.json), the publication dates (data/site/growth-dates.json, from
// tools/growth-dates.js) and each change's check files, and counts everything it shows: no number is typed.
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), J = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const has = p => fs.existsSync(path.join(ROOT, p));
const TITLE = "Watch Common Shade grow", SLUG = "growing";
const LEDE = "See what we are learning, what is changing, and how it connects to protection from extreme heat.";
const KINDS = [["evidence", "Evidence added"], ["experience", "Practical experience contributed"], ["plan", "Plan or guidance added"],
  ["tool", "Tool improved"], ["connection", "Connection documented"], ["interpretation", "Interpretation revised"],
  ["correction", "Correction published"], ["question-opened", "Question opened"], ["question-advanced", "Question advanced"]];
const KIND = Object.fromEntries(KINDS), REVISED = ["correction", "interpretation"];
const PLACES = [["region", "South and Southeast Asia"], ["bangladesh", "Bangladesh"], ["india", "India"], ["indonesia", "Indonesia"],
  ["nepal", "Nepal"], ["philippines", "Philippines"], ["singapore", "Singapore"], ["sri-lanka", "Sri Lanka"], ["thailand", "Thailand"]];
const PLACE = Object.fromEntries(PLACES);
const M = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const date = d => { if (!d || !/^\d{4}/.test(d)) return d || ""; const [y, m, dd] = d.split("-"); return dd ? `${+dd} ${M[+m - 1]} ${y}` : m ? `${M[+m - 1]} ${y}` : y; };

// labels for the map's own records (people, topics, link targets), read from data/core so they match the map
function vocab() {
  const c = n => J(`data/core/${n}.json`), arr = x => Array.isArray(x) ? x : Object.values(x);
  const people = Object.fromEntries(arr(c("AT_RISK")).map(r => [r.id, r.name || r.title || r.id]));
  const levers = Object.fromEntries(arr(c("LEVERS")).map(r => [r.id, r.title]));
  const loops = Object.fromEntries(arr(c("LOOPS")).map(r => [r.id, r.name || r.title || r.id]));
  return { people, levers, loops, topic: id => levers[id] || loops[id] || id };
}
// where a link target lives on the site, and its name
function target(to, V) {
  const [t, id] = to.split(":");
  if (t === "lever") return { type: "Action", name: V.levers[id], href: `/actions/#${id}` };
  if (t === "loop") return { type: "Vicious cycle", name: V.loops[id], href: `/loops/#${id}` };
  if (t === "people") return { type: "People at risk", name: V.people[id], href: `/who-is-at-risk/#${id}` };
  if (t === "page") return { type: "Page", name: id === "/" ? "The map" : id.replace(/\//g, " ").trim().replace(/-/g, " ").replace(/^./, s => s.toUpperCase()), href: id };
  return null;
}

// ---- what it took to add this: counted from each change's check files ----
const flat = x => Array.isArray(x) ? x.flatMap(flat) : x && typeof x === "object" ? Object.values(x).flatMap(flat) : [x];
function effort(e) {
  const f = e.effort; if (!f) return null;
  const out = { asked: f.asked, open: f.open, files: [], search: null, check: null, aside: null };
  const n = x => x.toLocaleString("en-GB");
  if (f.inbox && has(`${f.inbox}/link-check.json`)) {
    const src = J(`${f.inbox}/sources.json`), L = J(`${f.inbox}/link-check.json`), T = L._terms || {};
    const staged = (Array.isArray(src) ? src : src.sources || Object.values(src)).length;
    const urls = Object.keys(L).filter(k => !k.startsWith("_"));
    const ok = u => ["OK", "REDIRECT", "BLOCKED"].includes(L[u]) && (!Object.keys(T).length || Object.values(T[u] || {}).some(Boolean));
    const conf = urls.filter(ok).length, not = urls.filter(u => !ok(u));
    const blocked = not.filter(u => L[u] === "BLOCKED").length, failed = not.filter(u => /FAIL|UNREACH/.test(L[u])).length, missed = not.length - blocked - failed;
    out.counts = { staged, confirmed: conf, notConfirmed: not.length };
    out.search = `${n(staged)} sources were gathered for checking.`;
    out.check = `Each source was opened and read for the terms and numbers it was cited for: ${n(conf)} confirmed${not.length ? `, and ${n(not.length)} could not be (${[blocked && `${n(blocked)} blocked automated reading`, failed && `${n(failed)} did not respond`, missed && `${n(missed)} did not show the expected text`].filter(Boolean).join(", ")})` : ""}.`;
    out.files.push([`/${f.inbox}/link-check.json`, "the check results"]);
  }
  if (f.links && has(f.links)) {
    const L = J(f.links), v = Object.values(L).map(x => typeof x === "object" ? x.status : x);
    const ok = v.filter(s => s === "OK" || s === "REDIRECT").length, bl = v.filter(s => s === "BLOCKED").length, bad = v.length - ok - bl;
    out.counts = { staged: v.length, confirmed: ok, notConfirmed: v.length - ok };
    out.search = `${n(v.length)} links were gathered.`;
    out.check = `Each link was opened: ${n(ok)} answered${bl ? `, ${n(bl)} blocked automated reading` : ""}${bad ? `, and ${n(bad)} could not be reached` : ""}.`;
    out.files.push([`/${f.links}`, "the link check"]);
  }
  if (f.linkcheck && has(f.linkcheck)) {
    const L = J(f.linkcheck), v = Object.entries(L).filter(([k]) => !k.startsWith("_")).map(([, x]) => typeof x === "object" ? (x.status || x.verdict) : x);
    const ok = v.filter(s => s === "OK" || s === "REDIRECT").length, bl = v.filter(s => s === "BLOCKED").length;
    out.counts = { staged: v.length, confirmed: ok, notConfirmed: v.length - ok };
    out.search = `${n(v.length)} candidate sources were gathered.`;
    out.check = `Each was opened and read for its expected terms: ${n(ok)} answered directly${bl ? `, and ${n(bl)} blocked automated reading, so their text was confirmed through Europe PMC records where one exists` : ""}.`;
    out.files.push([`/${f.linkcheck}`, "the check results"]);
  }
  if (f.hap && has(f.hap)) {
    const x = J(f.hap), leads = Object.values(x.leads || {}).reduce((a, b) => a + b, 0);
    out.counts = { staged: x.verified + leads, confirmed: x.verified, notConfirmed: leads };
    out.search = `${n(x.verified + leads)} documents and leads were screened.`;
    out.check = `${n(x.verified)} plans and guidance documents were verified one by one, each typed and dated as printed; ${n(leads)} leads are kept apart and never counted as verified.`;
    out.files.push(["/research/india-hap-archive/README.md", "how the archive was verified"]);
  }
  if (f.dropped && has(f.dropped)) {
    const k = f.dropped.endsWith(".md") ? fs.readFileSync(path.join(ROOT, f.dropped), "utf8").split("\n").filter(l => /^- /.test(l)).length : flat(J(f.dropped)).filter(Boolean).length;
    out.aside = `${n(k)} items that rested on what could not be confirmed were set aside, regraded or reworded, each with its reason.`;
    out.files.push([`/${f.dropped}`, "what was set aside, and why"]);
  }
  if (f.held && has(f.held)) {
    const k = J(f.held).length;
    out.aside = `${out.aside ? out.aside + " " : ""}${n(k)} ${k === 1 ? "record was" : "records were"} held back because no first-hand source confirmed ${k === 1 ? "it" : "them"}.`;
    out.files.push([`/${f.held}`, "the records held back"]);
  }
  return out;
}
// one line for a card, from the effort counts
const effortLine = x => x && x.counts ? `${x.counts.staged.toLocaleString("en-GB")} checked · ${x.counts.confirmed.toLocaleString("en-GB")} confirmed${x.counts.notConfirmed ? ` · ${x.counts.notConfirmed.toLocaleString("en-GB")} not confirmed, each recorded` : ""}` : "";

// the date of the underlying work, from the entry or computed from its records ("span")
function eventText(e) {
  const ev = e.event || {}; let when = ev.date;
  if (ev.span) { let ys = [];
    if (ev.span === "hap") ys = J("research/india-hap-archive/India_HAP_Combined_Verified.json").map(p => +String(p.year).slice(0, 4));
    if (ev.span === "media") ys = J("research/2026-10/media/articles.json").map(a => +a.year);
    if (ev.span === "visibility") ys = J("data/core/HEAT_VISIBILITY.json").events.map(x => +String(x.date).slice(0, 4));
    ys = ys.filter(Boolean); when = ys.length ? `${Math.min(...ys)} to ${Math.max(...ys)}` : ""; }
  if (!when || when === "various") return `${ev.what || "Underlying work"}: dates vary; each source shows its own`;
  if (when === "live") return "Readings: live";
  if (when === "weekly") return `${ev.what}`;
  return `${ev.what} ${/^\d{4}-\d{2}/.test(when) ? date(when) : when}`;
}
const counted = e => e.count === "learning" ? J("data/site/learning.json").questions.filter(q => q.status !== "answered").length
  : e.count === "step-questions" ? J("research/2026-11/social-protection/step-questions.json").questions.length : null;

// ---- the three-year view: dated work by root, from growth-dates.json ----
function frames() {
  const G = J("data/site/growth-dates.json"), now = new Date(), Y = now.getUTCFullYear();
  const work = G.sources.filter(s => !s.org);
  const dated = work.filter(s => s.date && s.how !== "online"), years = [Y - 2, Y - 1, Y];
  const rootIds = G.roots.map(r => r.id);
  // dated steps toward protection (milestones) and verified plans, to give each year a few real landmarks
  const MS = J("data/site/milestones.json").milestones.map(m => ({ y: +m.year, title: m.title, href: "/atlas/" }))
    .concat(J("data/kb/milestone.json").map(m => ({ y: +String(m.date).slice(0, 4), title: m.title, href: "/atlas/" })));
  const HAP = J("research/india-hap-archive/India_HAP_Combined_Verified.json").map(p => +String(p.year).slice(0, 4));
  const tally = list => Object.fromEntries(rootIds.map(r => [r, list.filter(s => s.root === r).length]));
  const before = dated.filter(s => +s.date.slice(0, 4) < years[0]);
  const F = [{ key: "before", label: `Before ${years[0]}`, added: tally(before), total: tally(before), n: before.length, cum: before.length }];
  let cum = before.slice();
  years.forEach(y => { const inY = dated.filter(s => +s.date.slice(0, 4) === y); cum = cum.concat(inY);
    F.push({ key: String(y), label: y === Y ? `${y} so far` : String(y), added: tally(inY), total: tally(cum), n: inY.length, cum: cum.length,
      month: inY.filter(s => s.precision !== "year").length,
      steps: MS.filter(m => m.y === y).slice(0, 3), plans: HAP.filter(p => p === y).length }); });
  return { roots: G.roots, frames: F, years, all: work.length, dated: dated.length,
    undated: work.filter(s => !s.date).length, onlineOnly: work.filter(s => s.how === "online").length,
    orgs: G.sources.filter(s => s.org).length, how: dated.reduce((a, s) => (a[s.how] = (a[s.how] || 0) + 1, a), {}) };
}

function load() {
  const G = J("data/site/growth.json"), V = vocab();
  const entries = G.entries.slice().sort((a, b) => a.added < b.added ? 1 : a.added > b.added ? -1 : 0);
  return { entries, V, first: G.entries.map(e => e.added).sort()[0] };
}
function summary(L) {
  const e = L.entries;
  return { changes: e.length, revised: e.filter(x => REVISED.includes(x.kind)).length, questions: e.filter(x => x.kind.startsWith("question")).length,
    connections: e.filter(x => x.kind === "connection").length, first: L.first };
}

// the whole feature as plain text, for llms-full.txt
function md(SITE) {
  const L = load(), S = summary(L), F = frames(), V = L.V, out = [];
  out.push(`## ${TITLE}`, `${SITE}/${SLUG}/`, `${LEDE} This is a record of how the knowledge commons has changed, not a measure of protection achieved. ${S.changes} changes are recorded since ${date(S.first)}, ${S.revised} of them corrections or revised interpretations and ${S.questions} questions opened. "Why it matters" is Common Shade's reading; "What the source says" is quoted from the source.`);
  out.push(`### How the work behind the commons grew`, `Dated by the publication date of the work Common Shade draws on (${F.dated} of ${F.all} works dated; ${F.undated} have no established date yet${F.onlineOnly ? `, ${F.onlineOnly} only an "online by" date` : ""}; ${F.orgs} links to organisations are counted apart and never dated). Common Shade began gathering this work in October 2026; the dates below are when the work was published, not when it was added.`);
  F.frames.forEach(f => out.push(`- ${f.label}: ${f.key === "before" ? `${f.n} works` : `${f.n} works published (${f.month} with a known month), ${f.cum} in all by the end of the period`}. ${F.roots.map(r => `${r.name}: ${f.total[r.id]}`).join("; ")}.`));
  out.push(`### Changes, newest first`);
  L.entries.forEach(e => { const x = effort(e), c = counted(e);
    out.push(`- ${KIND[e.kind]}: ${e.title}${c != null ? ` (${c} questions)` : ""}. Added ${date(e.added)} · ${eventText(e)}. Why it matters (our reading): ${e.why}${e.finding ? ` What the source says: "${e.finding.text}" (${e.finding.source[0]}${/^https?:/.test(e.finding.source[1]) ? ` ${e.finding.source[1]}` : ""})` : ""} Places: ${e.places.map(p => PLACE[p]).join(", ")}.${e.people.length ? ` People: ${e.people.map(p => V.people[p]).join(", ")}.` : ""}${e.topics.length ? ` Topics: ${e.topics.map(V.topic).join(", ")}.` : ""} Review: ${e.review}. Next: ${e.action[0]} ${SITE}${e.action[1]}.${e.links.length ? ` Connections: ${e.links.map(l => { const t = target(l.to, V); return `${t ? t.name : l.to} (${l.basis === "record" ? "from the site's records" : "our reading"}): ${l.why}`; }).join(" ")}` : ""}${x ? ` What it took to add this: ${[x.asked && `The question: ${x.asked}`, x.search, x.check, x.aside, x.open && `Still open: ${x.open}`].filter(Boolean).join(" ")}` : ""}`); });
  out.push(`Inspired by Wystem.ai's approach to a living knowledge commons (https://wystem.ai/). Designed and implemented independently for Common Shade.`);
  return out.join("\n\n");
}
module.exports = { TITLE, SLUG, LEDE, KINDS, KIND, REVISED, PLACES, PLACE, date, vocab, target, effort, effortLine, eventText, counted, frames, load, summary, md };
