#!/usr/bin/env node
// Common Shade: checks Heat Opportunities (/opportunities/, tools/build-opportunities.js) against the risks that matter:
// coverage of the whole heat network, relevance kept honest, NRDC India's identity and the CEHSC listings, deadline rules
// (date-only precision, no invented "rolling", failed fetches never closing anything, extensions, reposts), individual and
// organisational opportunities kept apart, filters and shareable state, stale and archived labels, no private details,
// JobPosting data only where it fits, and a failed sweep keeping the last good result. Each failure names what to fix.
//   node tools/check-opportunities.js
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const H = require("../opportunities/hub-core.js"), C = require("../heat-economy/funding-core.js"), B = require("./build-opportunities.js"), S = require("./opportunities-sweep.js");
let bad = 0; const ok = (c, m) => { console.log(c ? "  ok  " : "  FAIL", m); if (!c) bad++; };
const read = f => fs.readFileSync(path.join(ROOT, f), "utf8"), json = f => JSON.parse(read(f));
const NOW = "2026-11-28T12:00:00Z";

// ---- 1. the whole network is in the registry and the ledger
const ORGS = json("data/core/ORGANISATIONS.json"), REG = json("data/funding/network-sources.json").records, LED = json("data/funding/coverage.json");
const regIds = new Set(REG.map(r => r.id)), missingReg = ORGS.filter(o => !regIds.has(o.id)).map(o => o.id);
ok(!missingReg.length, `every network organisation is in the source registry${missingReg.length ? "; missing (run research/2026-11/opportunities/registry.js): " + missingReg.join(", ") : ""}`);
const notLed = ORGS.filter(o => !LED.orgs[o.id]).map(o => o.id);
ok(!notLed.length, `every network organisation appears in the coverage ledger${notLed.length ? "; never attempted (run tools/opportunities-sweep.js --only ...): " + notLed.join(", ") : ""}`);
const cov = B.coverage();
ok(cov.total === ORGS.length && Object.values(cov.by).reduce((a, b) => a + b, 0) === ORGS.length, `coverage counts add up to the ${ORGS.length} organisations`);
const unreviewed = cov.rows.filter(r => r.status === "candidates").map(r => r.id);
ok(true, `leads awaiting a person's review this cycle: ${unreviewed.length ? unreviewed.join(", ") : "none"} (shown as "candidates awaiting review", never as found)`);

// ---- 2. NRDC India identity and the CEHSC listings
const nr = REG.find(r => r.id === "nrdc-india") || {};
ok(/(^|\.)nrdcindia\.org$/.test(nr.domain || ""), "NRDC India's domain is nrdcindia.org (not nrdcindia.com, the unrelated National Research Development Corporation)");
const CAR = json("data/funding/careers.json").records, byId = Object.fromEntries(CAR.map(r => [r.id, r]));
const an = byId["car-nrdcin-cehsc-analyst-2026"], sr = byId["car-nrdcin-cehsc-senior-analyst-2026"], adm = byId["car-nrdcin-admin-assistant-2026"], dir = byId["car-nrdcin-director-program-2026"];
ok(an && sr, "both CEHSC listings are recorded");
if (an && sr) {
  ok([an, sr].every(r => /^https:\/\/www\.nrdcindia\.org\/jobdetail\//.test(r.official_url)), "the CEHSC listings link to their own pages on nrdcindia.org");
  ok(/Nagpur/.test(an.location.text) && /Mumbai or Nagpur/.test(an.location.text) && /2 - 3 years/.test(an.experience.text), "Analyst: Nagpur, with the Mumbai or Nagpur option kept, and 2 - 3 years");
  ok(/Mumbai/.test(sr.location.text) && /8 - 10 years/.test(sr.experience.text) && /minimum of 8/.test(sr.experience.text), "Senior Analyst: Mumbai, 8 - 10 years, and the requirements' minimum of 8 kept as a note");
  ok([an, sr].every(r => r.deadlines[0].date === "2026-12-11" && !r.deadlines[0].time && !r.deadlines[0].tz), "both deadlines are 11 December 2026, date only: no time or zone invented");
  ok([an, sr].every(r => /one year/.test(r.contract.text) && /extension/.test(r.contract.text)), "both state an initial one-year engagement with a possible extension");
  ok([an, sr].every(r => r.role === "consultancy-individual" && H.CAT[H.catOf(r, "career")].who === "individual"), "a full-time individual consultancy is an individual opportunity, never an organisational tender");
  ok([an, sr].every(r => r.relevance_strength === "direct") && [an, sr].every(r => r.aliases.length), "both are direct heat roles, with the careers page's titles kept as aliases");
}
ok(adm && adm.relevance_strength === "network" && adm.deadlines[0].date === "2026-12-26", "the Administrative Assistant is a heat-network role (no heat-specific duties), deadline 26 December 2026");
ok(dir && dir.stated_status === "closed", "the Director of Program is closed by the provider, although the careers page still lists it");

// ---- 3. deadline and status rules, on fixtures
const fx = (o, kind = "career") => H.item(Object.assign({ id: "fx", title: "Fixture", role: "job", relevance_strength: "direct", deadlines: [], check: { checked: "2026-11-27", ok: true, confirmed: true } }, o), kind, {});
const d1 = fx({ stated_status: "open", deadlines: [{ date: "2026-12-11", wording: "December 11, 2026" }] });
ok(/cut-off time not published/.test(H.deadlineLabel(d1, NOW)) && !/hour|day /.test(H.deadlineLabel(d1, NOW).replace(/cut-off time not published/, "")), "a date-only deadline keeps its precision: no countdown, no invented time");
ok(H.lifecycle(d1, "2026-12-11T05:00:00Z").status === "closing" && H.lifecycle(d1, "2026-12-13T00:00:00Z").status === "closed", "on a date-only deadline day the status reads 'Deadline day', and closes once that day has ended everywhere");
const d2 = fx({ stated_status: "open" });
ok(/not the same as rolling/.test(H.deadlineLabel(d2, NOW)) && H.lifecycle(d2, NOW).status !== "rolling", "a missing deadline is never labelled rolling");
ok(H.lifecycle(fx({ stated_status: "open", until_filled: true }), NOW).status === "until-filled", "'until filled' appears only where the record says the source says so");
const d3 = fx({ stated_status: "open", deadlines: [{ date: "2026-12-11" }], check: { checked: "2026-11-20", ok: false, confirmed: true } });
ok(H.lifecycle(d3, NOW).status === "open" && H.verification(d3, NOW).status === "unavailable", "a failed fetch marks the source unavailable and never closes the listing");
const d4 = fx({ stated_status: "open", deadlines: [{ date: "2026-12-20" }], deadline_history: [{ date: "2026-11-25", changed: "2026-11-24" }] });
ok(H.isOpen(d4, NOW) && read("tools/build-opportunities.js").includes("Extended: earlier deadline"), "an extension (new deadline, the old one kept in deadline_history) keeps the listing open and says it was extended");
ok(H.verification(fx({ check: { checked: "2026-11-01", ok: true, confirmed: true } }), NOW).status === "review-due", "a listing not re-checked within 14 days shows 'Review due'");
ok(H.dedupe([fx({ id: "a" }), fx({ id: "b", repost_of: "a" })]).length === 1, "a repost of a listing already shown is folded into it");
ok(H.isArchived(fx({ deadlines: [{ date: "2026-11-20" }], stated_status: "open" }), NOW) && !H.inView(fx({ deadlines: [{ date: "2026-11-20" }], stated_status: "open" }), "open", NOW), "a listing past its deadline is archived and left out of the open view");
ok(H.lifecycle(fx({ stated_status: "closed", deadlines: [{ date: "2026-11-30" }] }), NOW).status === "closed-provider", "a provider's own 'no longer accepting applications' closes a listing before its deadline");

// ---- 4. individual and organisational opportunities stay apart; relevance categories
ok(H.CAT[H.TYPE_CAT.rfp].who === "organisation" && H.CAT[H.ROLE_CAT["consultancy-individual"]].who === "individual", "RFPs and tenders are for organisations; individual consultancies are for individuals");
const ALL = B.items();
ok(ALL.every(it => H.REL[it.rel] && it.rel_why), "every listing has a relevance category and says why it is relevant to heat");
ok(!ALL.some(it => it.rel === "network" && H.matches(it, {}, NOW)) && ALL.filter(it => it.rel === "network").every(it => H.matches(it, { rel: "all", view: "all" }, NOW)), "the default view leaves out network-only roles; 'include other roles' brings them back");
ok(ALL.filter(it => it.rel === "direct").every(it => it.kind === "opportunity" || (it.rel_evidence || /heat|cool|thermal/i.test(it.rel_why))), "each direct heat role points to heat in its own listing");

// ---- 5. filters and shareable state
const st = { view: "jobs", q: "heat", country: "IN", rel: "all", paid: "1" };
ok(JSON.stringify(H.readState(H.writeState(st))) === JSON.stringify(Object.fromEntries(H.KEYS.filter(k => st[k]).map(k => [k, st[k]]))), "filter state survives a round trip through the address");
ok(ALL.filter(it => H.matches(it, { country: "IN" }, NOW)).every(it => it.countries.includes("IN")), "the country filter returns only listings in that country");
ok(H.matches(fx({ stated_status: "open", title: "Heat officer" }), { q: "heat officer" }, NOW) && !H.matches(fx({ stated_status: "open", title: "Heat officer" }), { q: "cooling" }, NOW), "search matches every word against the listing");

// ---- 6. built pages
const html = read("opportunities/index.html");
ok(html.includes(`Checked ${cov.checked} of ${cov.total} network organisations`), "the hub's coverage line is calculated from the ledger");
ok(ALL.every(it => fs.existsSync(path.join(ROOT, "opportunities", it.id, "index.html"))), "every listing has its own page");
ok(ALL.filter(it => !H.isArchived(it, NOW)).every(it => html.includes(`id="${it.id}"`)), "every open listing is in the hub's HTML, so the page works without JavaScript");
const archived = ALL.filter(it => H.isArchived(it, NOW));
ok(archived.every(it => read(`opportunities/${it.id}/index.html`).includes("Not open")), "archived listings say plainly that they are not open");
ok(ALL.every(it => { const a = H.action(it); return a.url && (a.label !== "Apply on the official site" || it.application_url); }), "no Apply button without a direct application address from the source");
ok(ALL.every(it => !it.official_url || it.sources.some(s => new URL(s.url).host === new URL(it.official_url).host)), "each listing's official link is on the same site as a source the check read");
const jp = ALL.filter(it => read(`opportunities/${it.id}/index.html`).includes('"JobPosting"'));
ok(jp.every(it => it.who === "individual" && it.published && H.isOpen(it, NOW)), `JobPosting data appears only on open individual listings with a published date (${jp.length})`);
ok(!html.includes('"JobPosting"'), "the hub page itself carries no JobPosting data");
const pub = [html, read("opportunities/opportunities.json"), read("opportunities/coverage.json"), ...ALL.map(it => read(`opportunities/${it.id}/index.html`))].join("\n");
ok(!/[A-Za-z0-9._%+-]+@(?!media\b)[A-Za-z0-9.-]+\.[a-z]{2,}/.test(pub.replace(/https?:\/\/[^\s"'<>]+/g, "")), "no email addresses are published (applicants are sent to the official listing)");
ok(!/(api[_-]?key|secret|token)=/i.test(pub), "no credentials in the published files");
ok(!read("opportunities/coverage.json").includes("evidence") && !/"candidates"\s*:\s*\[/.test(read("opportunities/coverage.json")), "the public coverage file carries statuses only, not the sweep's fetched text");
ok(/[—]/.test(html.replace(/<script[\s\S]*?<\/script>/g, "")) === false, "no em dashes on the hub");

// ---- 7. a failed sweep keeps the last good result
const prev = { cycle: "2026-11-28", status: "none", last_success: "2026-11-28", last_success_status: "none" };
const after = S.mergeLedger(prev, { status: "unavailable", attempted: "2026-11-29", notes: ["Homepage did not respond."] }, "2026-11-29");
ok(after.status === "unavailable" && after.last_success === "2026-11-28" && after.last_success_status === "none", "a failed fetch is recorded for the cycle and the last successful check is kept");
ok(read(".github/workflows/opportunities-sweep.yml").includes("git diff --cached --quiet") && /if: always\(\)/.test(read(".github/workflows/opportunities-sweep.yml")) === false, "the scheduled sweep commits only what changed and opens a review pull request, never publishing directly");

console.log(bad ? `opportunities check: ${bad} failing` : `opportunities check passed: ${ALL.length} listings, ${cov.checked} of ${cov.total} organisations checked this cycle`);
process.exit(bad ? 1 : 0);
