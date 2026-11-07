// Common Shade: when was the work behind each record published? For "Watch Common Shade grow" (/growing/).
// Reads every source the site cites (data/core, data/kb, data/social-protection, data/site) and the India heat action
// plan archive, and dates each one, by its link, once, from the best evidence available, never by guessing:
//   record   a date the record itself carries (a milestone's date, a plan's year, a knowledge-base record's date)
//   crossref the publication date Crossref holds for its DOI            (fetched on GitHub: tools/fetch-dates.js)
//   meta     the publication date in the page's own metadata           (fetched on GitHub: tools/fetch-dates.js)
//   url      a date in the link's own path, such as /2024/05/
//   label    the year printed in the source's label, such as "WHO, 2024"
//   online   the earliest archived copy: "online by", which is not a publication date (fetched on GitHub)
// Precision is "day", "month" or "year", and the page never shows a date more precise than this. Sources with no date
// stay undated and are counted as such. Each source joins one root of the canopy, from the record that cites it
// (ROOTS below: an editorial mapping, documented on the page). Writes data/site/growth-dates.json (build-only, never
// sent to visitors whole) and research/growth/undated.txt, the list tools/fetch-dates.js works through.
// Run: node tools/growth-dates.js        (build-static.js runs it too)
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), J = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const NOW_Y = new Date().getUTCFullYear();

// the five roots of the canopy, and the records that feed each (first match wins; anything else is evidence)
const ROOTS = [
  ["financing", "Financing", /^(FINANCE|MARKET_EXPLORER|PLAN_PAYERS|COOL_VALUE|COOL_COST_NOTE|kb:funding)$/],
  ["institutions", "Institutions and plans", /^(ORGANISATIONS|INSTITUTIONS|CITY_HAP|MCR2030|SYSTEMS|ORG_.*|milestones|kb:milestone|kb:role|hap|sp:routes)$/],
  ["practical", "Practical measures", /^(LEVERS|PLAN_.*|COOL_.*|PLAYBOOKS|ACTION_.*|NBS_BOOK|FIRST_FIVE|GUIDE|PACKAGES|LOOP_SOLUTIONS|kb:trigger|sp:schemes)$/],
  ["experience", "Experience", /^(STORIES|HEAT_WEEK|HEATWAVE_DAY|HOME_HEATS|WORKED_EXAMPLES|CITY_PROFILES|PLACE_SIM|STALLS)$/],
  ["evidence", "Evidence", /.*/]
];
const ORG = /^(ORGANISATIONS|INSTITUTIONS|ORG_.*|sp:routes)$/;   // organisation records: links to who, not to dated work
const rootOf = block => ROOTS.find(([, , re]) => re.test(block))[0];

const src = new Map();   // url -> { url, label, root, date, precision, how }
const ymd = (y, m, d) => [y, m && String(m).padStart(2, "0"), d && String(d).padStart(2, "0")].filter(Boolean).join("-");
function add(url, label, block, known) {
  if (!url || !/^https?:\/\//.test(url)) return;
  const u = url.trim(); let s = src.get(u);
  if (!s) src.set(u, s = { url: u, label: String(label || "").slice(0, 200), root: rootOf(block), org: ORG.test(block) });
  else if (!ORG.test(block)) s.org = false;   // cited as work somewhere, so it is dated like any source
  if (known && (!s.date || rank(known) > rank(s))) Object.assign(s, known);
}
const PREC = { day: 3, month: 2, year: 1 }, HOW = { record: 6, crossref: 5, meta: 4, url: 3, label: 2, online: 1 };
const rank = d => d && d.date ? HOW[d.how] * 10 + PREC[d.precision] : 0;
function dateFrom(s) {   // a date in a string: YYYY-MM-DD, YYYY-MM or YYYY
  const m = String(s || "").match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/); if (!m || +m[1] > NOW_Y) return null;
  return { date: ymd(m[1], m[2], m[3]), precision: m[3] ? "day" : m[2] ? "month" : "year" };
}

// walk any record tree; a record carrying a url and a label (or title, or by) is a source
// (a record's own date or year dates its own link; it is never passed down to the sources it cites)
function walk(x, block) {
  if (Array.isArray(x)) return x.forEach(v => walk(v, block));
  if (!x || typeof x !== "object") return;
  const own = dateFrom(x.date || x.published || x.year);
  if (x.url) add(x.url, x.label || x.title || x.by || x.name || x.pub, block, own && { ...own, how: "record" });
  for (const v of Object.values(x)) if (v && typeof v === "object") walk(v, block);
}

// data/core: one block per file
for (const f of fs.readdirSync(path.join(ROOT, "data/core")).filter(f => f.endsWith(".json") && f !== "manifest.json"))
  walk(J(`data/core/${f}`), f.replace(/\.json$/, ""));
// data/kb: records with their own dates, and their sources
for (const f of fs.readdirSync(path.join(ROOT, "data/kb")).filter(f => f.endsWith(".json") && !f.startsWith("_")))
  J(`data/kb/${f}`).forEach(r => { const block = `kb:${r.type || f.replace(/\.json$/, "")}`, d = dateFrom(r.date || r.published);
    if (r.url) add(r.url, r.title, block, d && { ...d, how: "record" }); walk(r, block); });
// data/site: milestones carry dates; learning questions, corrections
J("data/site/milestones.json").milestones.forEach(m => { const d = dateFrom(m.date);
  (m.sources || (m.source ? [m.source] : [])).forEach(s => add(s.url, s.label, "milestones", d && { ...d, how: "record" })); walk(m, "milestones"); });
walk(J("data/site/learning.json"), "learning"); walk(J("data/site/corrections.json"), "corrections");
// social protection: schemes, routes and evidence
const SP = path.join(ROOT, "data/social-protection");
if (fs.existsSync(SP)) fs.readdirSync(SP).filter(f => f.endsWith(".json")).forEach(f => { const c = J(`data/social-protection/${f}`);
  walk(c.schemes, "sp:schemes"); walk(c.routes, "sp:routes"); walk(c.evidence, "sp:evidence"); walk(c.ladder, "sp:ladder"); walk(c.country, "sp:country"); });
// research sets the site publishes: the heat economy and heat risk finance (financing), the media bibliography and
// the Lancet Countdown references (evidence), the solutions library (practical), stakeholders (institutions)
const R10 = "research/2026-10", rj = (p, block) => { if (fs.existsSync(path.join(ROOT, p))) walk(J(p), block); };
fs.readdirSync(path.join(ROOT, R10, "economy")).filter(f => f.endsWith(".json")).forEach(f => rj(`${R10}/economy/${f}`, "FINANCE"));
fs.readdirSync(path.join(ROOT, R10, "riskfin")).filter(f => /^R\d+\.json$/.test(f)).forEach(f => rj(`${R10}/riskfin/${f}`, "FINANCE"));
rj(`${R10}/media/articles.json`, "media"); rj(`${R10}/lancet-countdown-2026/references.json`, "lancet");
["active_solutions", "passive_solutions", "policy_and_finance_solutions"].forEach(f => rj(`${R10}/${f}.json`, "LEVERS"));
rj(`${R10}/stakeholders.json`, "INSTITUTIONS");
// the India heat action plan archive: each verified plan has its printed year
J("research/india-hap-archive/India_HAP_Combined_Verified.json").forEach(p => { const d = dateFrom(p.year);
  add(p.pdf_url || p.landing_page || p.alternate_url, p.title, "hap", d && { ...d, how: "record" }); });

// dates in the link's path, then the label's year
for (const s of src.values()) {
  const p = s.url.match(/\/((?:19|20)\d{2})[\/-](0[1-9]|1[0-2])(?:[\/-](0[1-9]|[12]\d|3[01]))?(?=[\/._-]|$)/);
  if (p && +p[1] <= NOW_Y) { const k = { date: ymd(p[1], p[2], p[3]), precision: p[3] ? "day" : "month", how: "url" }; if (rank(k) > rank(s)) Object.assign(s, k); }
  const ys = (s.label.match(/\b(?:19|20)\d{2}\b/g) || []).map(Number).filter(y => y <= NOW_Y && y >= 1950);
  if (ys.length) { const k = { date: String(Math.max(...ys)), precision: "year", how: "label" }; if (rank(k) > rank(s)) Object.assign(s, k); }
}
// dates fetched on GitHub (tools/fetch-dates.js), when that run has happened
const FETCHED = path.join(ROOT, "research/growth/fetched-dates.json");
if (fs.existsSync(FETCHED)) for (const [u, d] of Object.entries(J("research/growth/fetched-dates.json"))) {
  const s = src.get(u), k = d && dateFrom(d.date); if (s && k && HOW[d.how]) { const c = { ...k, how: d.how }; if (rank(c) > rank(s)) Object.assign(s, c); } }

const list = [...src.values()].sort((a, b) => a.url < b.url ? -1 : 1);
const undated = list.filter(s => !s.date && !s.org);
fs.mkdirSync(path.join(ROOT, "research/growth"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "research/growth/undated.txt"), list.filter(s => !s.org && (!s.date || s.how === "label")).map(s => s.url).join("\n") + "\n");
const out = { about: "Written by tools/growth-dates.js: one row per source link the site cites, with the best-evidenced date of the work it points to, its precision and how the date is known (record, crossref, meta, url, label, online). Undated rows have no date. Root is the canopy root of the record that cites it. org: true marks a link to an organisation (who), which the timeline counts apart and never dates.",
  roots: ROOTS.map(([id, name]) => ({ id, name })), sources: list };
fs.writeFileSync(path.join(ROOT, "data/site/growth-dates.json"), JSON.stringify(out, null, 1) + "\n");
if (require.main === module) {
  const by = {}; list.forEach(s => { const k = s.org && !s.date ? "organisation" : s.date ? `${s.how}/${s.precision}` : "undated"; by[k] = (by[k] || 0) + 1; });
  console.log(`growth dates: ${list.length} sources, ${list.length - undated.length} dated, ${undated.length} undated`, by);
}
module.exports = { ROOTS };
