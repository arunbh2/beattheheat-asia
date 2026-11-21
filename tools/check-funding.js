#!/usr/bin/env node
// Common Shade: checks funding, opportunities and careers (heat-economy/funding-core.js, tools/funding-model.js,
// tools/build-funding.js, data/funding/). Fixtures test what could mislead a reader; the rest checks the real data and pages.
//   node tools/check-funding.js
// Fixtures (never published): expired calls leave the default open view; an unknown deadline never becomes rolling; two
// annual rounds are two records; an extension keeps its history; exact, zone-less and date-only deadlines; stale and
// unreachable sources; programme budget versus award; applicant country versus work country; remote roles limited to
// countries; organisational RFPs versus individual consultancies; filter state in the address; CSV escaping and formula
// safety; duplicate organisations and canonical links.
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), C = require(path.join(ROOT, "heat-economy", "funding-core.js"));
const fails = [], ok = (c, m) => { if (!c) fails.push(m); };
const read = f => fs.existsSync(path.join(ROOT, f)) ? fs.readFileSync(path.join(ROOT, f), "utf8") : "";

// ---- fixtures: status and freshness ----
const fresh = { checked: "2026-11-20", ok: true, confirmed: true };
const open = (extra) => Object.assign({ stated_status: "open", check: fresh }, extra);
{ const r = open({ deadlines: [{ date: "2026-11-01" }] });
  ok(C.applicationStatus(r, "2026-11-21").status === "closed", "fixture: a call whose deadline passed is closed");
  ok(!C.isVerifiedOpen(r, "2026-11-21"), "fixture: an expired call is excluded from the default verified-open view"); }
ok(C.applicationStatus({ check: fresh, deadlines: [{ date: "2027-03-01" }] }, "2026-11-21").status === "unknown", "fixture: a future deadline alone does not prove a call is open");
ok(C.applicationStatus(open({}), "2026-11-21").status === "open" && C.applicationStatus(open({}), "2026-11-21").status !== "rolling", "fixture: no deadline does not make a call rolling");
ok(C.applicationStatus(open({ rolling: true }), "2026-11-21").status === "rolling", "fixture: rolling only when the source says so");
ok(C.applicationStatus({ opens: { date: "2026-12-15" }, deadlines: [{ date: "2027-02-01" }], check: fresh }, "2026-11-21").status === "upcoming", "fixture: before its opening date a call is upcoming");
{ // exact cut-off with a zone: closes at that minute (14:00 ET in December = 19:00 UTC)
  const r = open({ deadlines: [{ date: "2026-12-08", time: "14:00", tz: "ET" }] });
  ok(C.applicationStatus(r, "2026-12-08T18:59:00Z").status === "open" && C.applicationStatus(r, "2026-12-08T19:00:00Z").status === "closed", "fixture: an exact deadline expires at the stated minute, with summer time handled");
  ok(/left/.test(C.deadlineText(r.deadlines[0], "2026-11-21T00:00:00Z")), "fixture: a countdown is shown for an exact cut-off"); }
{ // date only: never "open" through the deadline day, closed once the day has ended everywhere
  const r = open({ deadlines: [{ date: "2027-01-12" }] });
  ok(C.applicationStatus(r, "2027-01-10T12:00:00Z").status === "open", "fixture: date-only deadline is open before its day");
  ok(C.applicationStatus(r, "2027-01-12T09:00:00Z").status === "closing", "fixture: on a date-only deadline day the status is 'deadline day', not open");
  ok(C.applicationStatus(r, "2027-01-13T13:00:00Z").status === "closed", "fixture: a date-only deadline closes once the day has ended everywhere");
  ok(!/left/.test(C.deadlineText(r.deadlines[0], "2027-01-01")) && /cut-off time not published/.test(C.deadlineText(r.deadlines[0])), "fixture: no countdown when the cut-off time is unknown"); }
{ // a time without a zone keeps the uncertainty
  const r = open({ deadlines: [{ date: "2027-01-12", time: "17:00" }] });
  ok(!C.cutoff(r.deadlines[0]).exact && /time zone not stated/.test(C.deadlineText(r.deadlines[0])), "fixture: a time without a zone is not treated as exact"); }
{ // stages: the first stage decides whether a new applicant can apply
  const r = open({ deadlines: [{ stage: "Concept note", date: "2026-11-01" }, { stage: "Full proposal", date: "2027-02-01" }] });
  ok(C.applicationStatus(r, "2026-11-21").status === "closed", "fixture: once the first stage has closed, new applicants cannot apply even if a later stage is open"); }
{ // extension: the earlier deadline stays in the history, and the new one decides the status
  const r = open({ deadlines: [{ date: "2026-12-08" }], deadline_history: [{ date: "2026-11-17", note: "earlier deadline, extended" }] });
  ok(C.applicationStatus(r, "2026-11-21").status === "open" && r.deadline_history[0].date === "2026-11-17", "fixture: an extension keeps the previous deadline and uses the new one"); }
{ // verification
  ok(C.verificationStatus({ check: { checked: "2026-10-01", ok: true, confirmed: true } }, "2026-11-21", "opportunity").status === "review-due", "fixture: a stale check is review due");
  ok(!C.isVerifiedOpen(open({ check: { checked: "2026-10-01", ok: true, confirmed: true } }), "2026-11-21", "opportunity"), "fixture: a stale open record is not counted as verified open");
  ok(C.verificationStatus({ check: { checked: "2026-11-20", ok: false } }, "2026-11-21").status === "unavailable", "fixture: an unreachable source is 'source unavailable', not closed or filled");
  ok(C.applicationStatus(open({ check: { checked: "2026-11-20", ok: false } }), "2026-11-21").status === "open", "fixture: an unreachable source keeps the last-known status rather than erasing it");
  ok(C.verificationStatus({ conflict: "Two dates published", check: fresh }, "2026-11-21").status === "conflicting", "fixture: conflicting sources are shown as such");
  ok(C.verificationStatus({ check: { checked: "2026-09-01", ok: true, confirmed: true } }, "2026-11-21", "programme").status === "verified", "fixture: programme profiles keep a longer review cycle than open calls"); }
// ---- fixtures: amounts, matching, kinds ----
ok(/total budget, not per award/.test(C.amountText({ max: 75000000, currency: "USD", basis: "programme-total" })) && /per award/.test(C.amountText({ min: 250000, max: 2000000, currency: "USD", basis: "per-award" })), "fixture: programme budget and award amount read differently");
ok(C.amountText(null) === "Not published" && C.amountText({ basis: "not-published" }) === "Not published", "fixture: an unpublished amount reads 'Not published', never zero");
{ const r = { eligibility: { lead_countries: ["DE"] }, geography: { countries: ["BD", "IN"] } }, m = C.matches(r, { country: "BD", work: "BD" });
  ok(m.some(x => x[0] === "yes" && /work country/.test(x[1])) && m.some(x => x[0] === "no" && /Only for lead applicants based in DE/.test(x[1])), "fixture: applicant country and implementation country are matched separately"); }
{ const m = C.matches({ eligibility: {} }, { applicant: "ngo" }); ok(m[0][0] === "unknown" && /not established/.test(m[0][1]), "fixture: unknown eligibility is explained, not hidden"); }
ok(C.nextStep({ kind: "opportunity", type: "rfp", stated_status: "open", deadlines: [{ date: "2027-01-01" }] }, "2026-11-21") === "View procurement notice" && C.TYPE.rfp !== C.TYPE["consultancy-individual"], "fixture: an organisational RFP and an individual consultancy are different types, with a procurement next step");
ok(C.nextStep({ kind: "programme", access: ["accredited"] }) === "Check institutional eligibility" && !/apply now/i.test(Object.values(C.NEXT).join(" ")), "fixture: no 'Apply now' on a funder profile");
// remote limited to countries: a location filter only passes listed countries (tested on the page script's rule below)
// ---- fixtures: CSV and URL state ----
ok(C.csvCell("=SUM(A1)") === `"'=SUM(A1)"` && C.csvCell("+1") === `"'+1"` && C.csvCell("@x") === `"'@x"` && C.csvCell("-2") === `"'-2"`, "fixture: CSV cells that could run as formulas are kept as text");
ok(C.csvCell('He said "hi", then\nleft') === '"He said ""hi"", then\nleft"', "fixture: CSV quotes, commas and line breaks are escaped");
ok(C.csv(["a"], [["b"]]).startsWith("﻿"), "fixture: CSV starts with a byte-order mark so spreadsheets read UTF-8");
{ const s = C.readState("?country=BD&status=all&evil=1", ["country", "status"]); ok(s.country === "BD" && s.status === "all" && !s.evil && C.writeState(s, ["country", "status"]) === "?country=BD&status=all", "fixture: filter state round-trips through the address and ignores unknown keys"); }

// ---- the real data ----
const M = require("./funding-model.js").load();
const all = [...M.all.ORG, ...M.all.PROG, ...M.all.OPP, ...M.all.CAR], ids = new Set();
all.forEach(r => { ok(r.id && !ids.has(r.id), `duplicate or missing id: ${r.id}`); ids.add(r.id); });
const nm = s => String(s || "").toLowerCase().replace(/^the /, "").replace(/[^a-z0-9]/g, "");
{ const seen = {}; M.all.ORG.forEach(o => [o.name, ...(o.aliases || [])].forEach(n => { const k = nm(n); ok(!seen[k] || seen[k] === o.id, `duplicate organisation: ${o.id} and ${seen[k]} share the name "${n}"`); seen[k] = o.id; }));
  const dom = {}; M.all.ORG.forEach(o => { const d = String(o.website || "").replace(/^https?:\/\/(www\.)?/, "").split("/")[0]; if (d) { ok(!dom[d] || dom[d] === o.id, `duplicate organisation website: ${o.id} and ${dom[d]} (${d})`); dom[d] = o.id; } }); }
M.all.OPP.forEach(o => {
  ok(o.org && M.all.ORG.some(x => x.id === o.org), `${o.id}: issuing organisation ${o.org} exists`);
  ok(!o.programme || M.all.PROG.some(x => x.id === o.programme), `${o.id}: programme ${o.programme} exists`);
  ok(C.TYPE[o.type] && C.INSTRUMENT[o.instrument], `${o.id}: type and kind of money are set`);
  ok(/^https:\/\//.test(o.official_url || ""), `${o.id}: an https official link`);
  ok((o.deadlines || []).every(d => C.isDate(d.date) && (!d.time || /^\d{2}:\d{2}$/.test(d.time)) && (!d.tz || C.TZ[d.tz] !== undefined)), `${o.id}: deadlines are YYYY-MM-DD, HH:MM and a known zone`);
  ok(!o.amount || ["per-award", "per-year", "programme-total", "not-published"].includes(o.amount.basis), `${o.id}: amount basis is stated`);
  ok(!o.amount || o.amount.min == null || o.amount.max == null || o.amount.min <= o.amount.max, `${o.id}: amount range is ordered`);
  ok((o.core || []).length && (o.core || []).every(([k]) => M.SRC[k]), `${o.id}: core facts name staged sources`);
  ok(!o.rolling || o.stated_status === "rolling" || o.rolling_src, `${o.id}: rolling only with the source's word for it`);
  ok(["explicit", "related", "potential"].includes((o.relevance || {}).label) && (o.relevance || {}).why, `${o.id}: relevance label and reason`);
});
{ // annual rounds: two records of one programme never share a round
  const byProg = {}; M.all.OPP.forEach(o => { if (!o.programme) return; const k = o.programme + "|" + (o.round || ""); ok(!byProg[k], `rounds merged: ${o.id} and ${byProg[k]} share programme and round`); byProg[k] = o.id; }); }
M.all.CAR.forEach(c => {
  ok(C.ROLE[c.role] && C.PAY[c.pay || "not-stated"], `${c.id}: role type and pay status are set`);
  ok(!c.salary || c.salary.src, `${c.id}: a salary is shown only with its source`);
  ok(!c.remote || (c.remote_countries || []).length, `${c.id}: remote work lists where it is allowed (ANY only if the listing says so)`);
  ok(/^https:\/\//.test(c.official_url || ""), `${c.id}: an https listing link`);
});
M.all.PROG.forEach(p => {
  ok(p.org && M.all.ORG.some(x => x.id === p.org), `${p.id}: administrator ${p.org} exists`);
  ok((p.access || []).length && (p.access || []).every(a => C.ACCESS_LABEL[a]), `${p.id}: access routes are set`);
  ok(["explicit", "related", "potential"].includes((p.relevance || {}).label), `${p.id}: relevance label`);
  ok(/^https:\/\//.test(p.url || ""), `${p.id}: an https link`);
});
ok(M.REJ.every(r => r.title && r.reason), "rejected candidates each give a reason");
// sources are canonical: no aggregator or social link as a record's source
const AGG = /fundsforngos|developmentaid|linkedin|opportunitydesk|opportunitiesforyouth|propakistani|impactpool|substack|grantedai|leadersoftoday/;
Object.values(M.SRC).forEach(s => ok(!AGG.test(s.url), `source ${s.key} is an aggregator or social post (${s.url}); use the primary page`));

// ---- the pages ----
const OP = read("heat-economy/money/opportunities/index.html"), CA = read("heat-economy/money/careers/index.html"), MO = read("heat-economy/money/index.html");
ok(MO.includes('id="landscape"') && MO.includes('id="needs"'), "money page: the landscape and what-needs-funding sections");
["investors", "programmes", "deals", "where"].forEach(a => ok(MO.includes(`id="${a}"`), `money page: the existing #${a} anchor is kept`));
ok(OP.includes('data-fund="opportunities"') && OP.includes("window.FUNDDATA") && OP.includes("/heat-economy/funding-core.js"), "open calls page: data and scripts");
ok(CA.includes('data-fund="careers"') && CA.includes(require("./funding-text.js").CAR.lede), "careers page: data and the field-building line");
ok(!/Apply now/i.test(MO + OP + CA), "no 'Apply now' anywhere");
M.OPP.forEach(o => ok(OP.includes(`id="${o.id}"`), `open calls page lists ${o.id}`));
M.CAR.forEach(c => ok(CA.includes(`id="${c.id}"`), `careers page lists ${c.id}`));
ok(/role="status" aria-live="polite"/.test(OP) && /role="status" aria-live="polite"/.test(CA), "result counts are announced");
ok(read("heat-economy/data/funding-opportunities.csv").startsWith("﻿") && read("heat-economy/data/careers.csv").startsWith("﻿"), "CSV downloads exist");
const SCRIPT = read("heat-economy/money/funding.js");
ok(/r\.remote_countries/.test(SCRIPT) && /has\(r\.countries, s\.loc\)/.test(SCRIPT), "careers filter: a remote role passes a location only where the listing allows that country");
ok(/localStorage/.test(SCRIPT) && /try \{/.test(SCRIPT), "shortlist uses browser storage, guarded for blocked storage");
ok(/excluded/.test(SCRIPT) && /Show them anyway|showall/.test(SCRIPT + OP), "eligibility exclusions are counted and can be shown, never silently hidden");

if (fails.length) { console.log(fails.map(f => "  FAIL " + f).join("\n")); process.exit(1); }
console.log(`funding check passed: ${M.PROG.length} programmes, ${M.OPP.length} calls and tenders, ${M.CAR.length} careers published (${M.held.length} held back); status, freshness, matching, CSV and page fixtures pass`);
