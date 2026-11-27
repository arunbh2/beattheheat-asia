#!/usr/bin/env node
// Common Shade: "Documented health and equity provisions", a preliminary review of a defined set of heat action plans.
// Selection rule (hap-set.json): for each Indian city with a Common Shade city page, the most recent plan in the archive
// that covers it: the city's own plan where catalogued, otherwise its state's. Chennai has none (no Tamil Nadu state
// plan in the archive). Everything else in the archive is "Not assessed".
// Method: the text of each file (pdftotext -layout, in research/hap-text/<id>.txt; fingerprints in hap-files.sha256) is
// searched page by page for each dimension. On the pages that mention it, the review records five separate things:
// a mention, a concrete action (shall / will / to be / ensure / provide ...), a named responsible body, a resource
// (budget, fund, rupees ...) and a monitoring arrangement, each from the same paragraph. Status:
//   explicit   a paragraph with the mention, a concrete action and a named body
//   partial    mentions only, or action without a named body
//   notfound   no mention in the reviewed text
//   unreadable too little text per page to read reliably
// This is an automated first pass. Its excerpts are shown so readers can judge, and every record says it has not been
// checked by a person. It reviews what each document says, not what any city or state does. It never infers a plan's
// provisions from national guidance it cites. No score and no ranking.
//   node research/2026-11/health-equity/hap-review.js   writes data/site/hap-equity-review.json
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", "..", "..");
const SET = JSON.parse(fs.readFileSync(path.join(__dirname, "hap-set.json"), "utf8"));
const SHA = Object.fromEntries(fs.readFileSync(path.join(__dirname, "hap-files.sha256"), "utf8").trim().split("\n").map(l => { const [h, f] = l.trim().split(/\s+/); return [f.replace(/\.pdf$/, ""), h]; }));
const CAT = JSON.parse(fs.readFileSync(path.join(ROOT, "research", "india-hap-archive", "India_HAP_Combined_Verified.json"), "utf8"));
const DIMS = [
  ["maternal", "Maternal, postpartum and newborn needs", "v-maternal", /pregnan|antenatal|ante-natal|maternal|lactating|newborn|neonat|postpartum|post-partum/i],
  ["children-older", "Children and older people", null, /\bchild|infant|school|elderly|older (persons|people|adults)|senior citizen|aged (people|persons)/i],
  ["disability", "Disability access", "v-access", /disab|divyang|differently[- ]abled|wheelchair|handicap/i],
  ["indoor-home", "Indoor and home-based workers", null, /home[- ]based|indoor work|factor(y|ies)|domestic work|workshop/i],
  ["informal", "Informal, contract and piece-rate workers", null, /informal|unorgani[sz]ed|daily wage|labour(er)?s\b|construction worker|street vendor|hawker|rickshaw|MGNREGA|piece[- ]rate|contract worker/i],
  ["sanitation", "Worksite water, toilets and sanitation", "v-sanitation", /toilet|sanitation|drinking water|water kiosk|piyau|water point|water booth/i],
  ["earnings-rest", "Earnings protection and work-rest arrangements", "v-earnings", /working hours|work(ing)? timings|rest (break|period|shelter)|reschedul|shift (timing|work)|wage loss|compensation|paid leave|ex[- ]gratia/i],
  ["care", "Care-service continuity", "v-care", /anganwadi|cr[eè]che|day[- ]care|\bASHA\b|home visit|old age home|care home|uninterrupted|power back-?up|continuity/i],
  ["reporting", "Confidential reporting and referral", "v-reporting", /helpline|help line|toll[- ]free|grievance|complaint|referral/i],
  ["surveillance", "Heat-health surveillance beyond certified heatstroke deaths", null, /surveillance|IDSP|IHIP|heat[- ]related illness|morbidity|line[- ]list|case reporting|death audit|excess (death|mortality)/i],
  ["participation", "Community participation and decision-making", "v-participation", /civil society|\bNGOs?\b|self[- ]help group|\bSHGs?\b|ward committee|community participation|community[- ]based organi|stakeholder consultation|resident welfare/i],
  ["institutions", "Named implementing institutions", null, /nodal (officer|department|agency)|lead (agency|department)|roles and responsibilities|responsibility matrix/i],
  ["budget", "Budget or financing provisions", "v-funding", /budget|\bSDRF\b|\bSDMF\b|allocat|expenditure|\bRs\.?\s?\d|₹|\blakh|\bcrore/i],
  ["monitoring", "Monitoring and accountability", null, /monitor|evaluation|review meeting|indicator|after[- ]action|report card|accountab/i]
];
const ACTION = /\b(shall|will|to be|should be|ensure|provide|arrange|set up|establish|deploy|distribut|organi[sz]e|conduct)/i;
const BODY = /\b(department|dept\.?|municipal|corporation|authority|DDMA|SDMA|DDMO|collector|commissioner|hospital|PHC|CHC|health officer|labour|police|board|ministry|panchayat|nodal|district administration|ULB)\b/i;
const RES = /budget|fund|\bRs\.?\s?\d|₹|lakh|crore|allocat|SDRF/i, MON = /monitor|review|report(ing)? to|indicator|evaluat/i;
const clean = s => s.replace(/\s+/g, " ").trim();
const words30 = s => { const w = clean(s).split(" "); return w.length > 30 ? w.slice(0, 30).join(" ") + " …" : w.join(" "); };
const out = { about: "Documented health and equity provisions in a defined set of heat action plans. A preliminary automated review of what each document says; not a measure of any city's or state's performance, not a legal compliance finding, and not yet checked by a person. Written by research/2026-11/health-equity/hap-review.js.", reviewed: new Date().toISOString().slice(0, 10), method: "Keyword search of the extracted text page by page; within each matching paragraph, separate flags for a mention, a concrete action, a named responsible body, a resource and a monitoring arrangement; status explicit (mention, action and named body together), partial, not found in reviewed material, or unreadable.", selection: "For each Indian city with a Common Shade city page, the most recent plan in the archive covering it: the city's own plan where catalogued, otherwise its state's.", dims: DIMS.map(([id, label, tax]) => ({ id, label, tax })), plans: [], none: SET.filter(x => x.none).map(x => ({ city: x.city, state: x.none, why: "No plan covering it is catalogued in the archive" })) };
for (const s of SET.filter(x => x.id)) {
  const rec = CAT.find(r => r.id === s.id) || {}, f = path.join(ROOT, "research", "hap-text", s.id + ".txt");
  const pages = fs.existsSync(f) ? fs.readFileSync(f, "utf8").split("\f") : [];
  const chars = pages.join("").replace(/\s/g, "").length, perPage = pages.length ? chars / pages.length : 0;
  const all = pages.join(""), indic = (all.match(/[\u0900-\u0DFF]/g) || []).length, latin = (all.match(/[A-Za-z]/g) || []).length, otherLang = indic / Math.max(1, indic + latin) > 0.5;
  const plan = { id: s.id, city: s.city, title: rec.title || s.title, jurisdiction: [rec.district_or_city, rec.state].filter(Boolean).join(", ") || rec.state, level: rec.level, year: rec.year, publisher: rec.publisher_agency, url: rec.pdf_url || s.url, landing: rec.landing_page || "", file: `research/hap-text/${s.id}.txt`, sha256: SHA[s.id] || "", pages: pages.length, readable: perPage >= 200, limits: otherLang ? "Most of the text is in an Indian language (Marathi for Maharashtra); this first pass searched English terms only, so every dimension is Not assessed until a reader of that language reviews it." : perPage < 200 ? "Little extractable text per page (scanned or image-based); statuses may be incomplete." : "Text extracted with pdftotext; tables, maps and images may be missed, and layout can split sentences.", reviewer: "automated-preliminary", dims: {} };
  for (const [id, , , re] of DIMS) {
    if (!plan.readable) { plan.dims[id] = { status: "unreadable" }; continue; }
    if (otherLang) { plan.dims[id] = { status: "notassessed", why: "Mainly in an Indian language; this review searched English terms only" }; continue; }
    const hits = [];
    pages.forEach((pg, i) => pg.split(/\n\s*\n/).forEach(par => { if (re.test(par)) { const c = clean(par); hits.push({ page: i + 1, par: c, action: ACTION.test(c), body: BODY.test(c), res: RES.test(c), mon: MON.test(c) }); } }));
    if (!hits.length) { plan.dims[id] = { status: "notfound" }; continue; }
    const best = hits.find(h => h.action && h.body) || hits.find(h => h.action) || hits[0];
    const m = best.par.match(re), at = Math.max(0, best.par.search(re) - 120), ex = best.par.slice(at, at + 260);
    plan.dims[id] = { status: hits.some(h => h.action && h.body) ? "explicit" : "partial", mention: true, action: hits.some(h => h.action), body: hits.some(h => h.action && h.body), resource: hits.some(h => h.res && h.action), monitoring: hits.some(h => h.mon && h.action), pages: [...new Set(hits.map(h => h.page))].slice(0, 8), excerpt: words30(ex), excerptPage: best.page, term: m ? m[0] : "" };
  }
  out.plans.push(plan);
}
out.archive = { total: CAT.length, reviewed: out.plans.length };
fs.writeFileSync(path.join(ROOT, "data", "site", "hap-equity-review.json"), JSON.stringify(out, null, 1) + "\n");
console.log(`hap review: ${out.plans.length} plans reviewed of ${CAT.length} in the archive`);
for (const p of out.plans) console.log(" ", p.id, p.readable ? "" : "UNREADABLE", Object.entries(p.dims).map(([k, v]) => k + ":" + v.status[0]).join(" "));
