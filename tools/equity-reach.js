// Common Shade: "Health and equity reach" on funding programmes and Signals commitments. One panel shape for both, kept
// apart: a programme is money a funder offers; a commitment is a policy step, which is not funded action. Every field
// comes from the record's own checked words or its derived stage; anything else reads "Not assessed". No amounts are
// added up: the funding records do not track amounts consistently, so the summary counts records, never money.
//   programme(p, { esc, text, orgName })   panel for one funding programme
//   signal(s, { esc })                     panel for one Signals commitment
//   summary(programmes, signals, esc)       "Within the records tracked by Common Shade" counts (non-additive)
"use strict";
const EQ = require("./equity-taxonomy.js");
// topics in the funding dataset, read as protection categories (a record may sit in several; nothing is summed)
const CAT = { cooling: "Household or public cooling", homes: "Household cooling", work: "Workplace heat protection", health: "Healthcare and maternal services", "schools-care": "Care-service continuity", inclusion: "Earnings or social protection", warning: "Warning and response systems", municipal: "Public cooling and accessible infrastructure", nature: "Public cooling and accessible infrastructure", "value-chain": "Workplace heat protection" };
const LEVER_CAT = { heatrules: "Workplace heat protection", heatcash: "Earnings or social protection", socialprotection: "Earnings or social protection", coolingcentres: "Public cooling and accessible infrastructure", readyclinics: "Healthcare and maternal services", maternalheat: "Healthcare and maternal services", affordablecool: "Household cooling", coolhousing: "Household cooling", hap: "Warning and response systems", anticipatory: "Warning and response systems", childwater: "Water and sanitation" };
const NA = "Not assessed";
const PEOPLE_RX = { "p-pregnancy": /pregnan|maternal|postpartum/i, "p-children": /child|newborn|infant|school|student/i, "p-older": /older|elderly|aged/i, "p-disability": /disab/i, "p-informal": /informal|day[- ]wage|piece[- ]rate|street vendor|casual/i, "p-homebased": /home[- ]based|homeworker/i, "p-tenants": /tenant|renter/i, "p-migrant": /migrant/i, "p-carers": /care work|caregiver|carer/i, "p-gender": /\bwomen\b|gender/i };
function readPeople(t) { return EQ.T.people.filter(p => PEOPLE_RX[p.id] && PEOPLE_RX[p.id].test(t)).map(p => p.label); }
function readProv(t) { return EQ.T.provisions.filter(v => EQ.RX[v.id].test(t)).map(v => v.label); }
function panel(esc, rows, note) {
  return `<details class="eq-reach"><summary>Health and equity reach</summary><dl>${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v === NA ? `<span class="sol-na">${NA}</span>` : esc(v)}</dd></div>`).join("")}</dl><p class="sol-note">${esc(note)}</p></details>`;
}
function programme(p, o) {
  const t = [o.text(p.remit), o.text(p.recipients), o.text(p.geography)].join(" ");
  const ppl = readPeople(t), prov = readProv(t), cats = [...new Set((p.topics || []).map(x => CAT[x]).filter(Boolean))];
  return panel(o.esc, [
    ["Intended beneficiaries", ppl.length ? `Named in the remit: ${ppl.join(", ")}` : NA],
    ["Setting and geography", o.text(p.geography) || NA],
    ["Type of protection", cats.length ? cats.join("; ") : "Other or unclear"],
    ["Equity provisions", prov.length ? `Named in the remit: ${prov.join(", ")}` : NA],
    ["Who delivers", `Grantees or partners chosen by ${o.orgName}; no delivery organisation is named for specific work`],
    ["Participation or governance", prov.includes("Participation in decisions") ? "Named in the remit" : NA],
    ["Funding stage", "A programme a funder runs; no amounts or allocations to particular components are tracked in this record"],
    ["Implementation stage", p.operational === "operational" ? "Reported operational by the funder (not independently evaluated)" : NA],
    ["Evidence of actual reach", NA]
  ], "Read by script from this record's checked remit, recipients and geography. A programme mentioning households does not show who in a household benefits, and a remit is not a gender-responsive budget.");
}
function signal(s, o) {
  const t = [s.title, s.summary, s.who].join(" "), ppl = readPeople(t), prov = readProv(t);
  const cats = [...new Set((s.levers || []).map(l => LEVER_CAT[l]).filter(Boolean))];
  const ms = (s.deliverables || []).flatMap(d => (d.milestones || []).map(m => m.step || "")).join(" ");
  const fstage = /funding-spent/.test(ms) ? "Spent, where documented" : /funding-disbursed/.test(ms) ? "Disbursed" : /funding-committed/.test(ms) ? "Committed" : /funding-announced/.test(ms) ? "Announced" : "No funding milestone recorded: a policy step is not funded action";
  const STAGE = { announced: "Announced (proposed)", adopted: "Approved or adopted", effective: "In force", "delivered-partial": "Reported partly delivered", delivered: "Reported delivered", "implementation-observed": "Implementation observed", evaluated: "Evaluated" };
  return panel(o.esc, [
    ["Intended beneficiaries", ppl.length ? `Named in the record: ${ppl.join(", ")}` : NA],
    ["Setting and geography", s.where || NA],
    ["Type of protection", cats.length ? cats.join("; ") : "Other or unclear"],
    ["Equity provisions", prov.length ? `Named in the record: ${prov.join(", ")}` : NA],
    ["Who delivers", s.who || NA],
    ["Participation or governance", prov.includes("Participation in decisions") ? "Named in the record" : NA],
    ["Funding stage", fstage],
    ["Implementation stage", STAGE[s.stage] || NA],
    ["Evidence of actual reach", s.stage === "evaluated" ? "See the evaluation in the record" : NA]
  ], "Read by script from this record's own summary and its derived stage. Progress is never inferred from time passing.");
}
function summary(progs, sigs, esc) {
  const count = (list, fn) => { const c = {}; list.forEach(r => [...new Set(fn(r))].forEach(k => { c[k] = (c[k] || 0) + 1; })); return c; };
  const pc = count(progs, p => (p.topics || []).map(x => CAT[x]).filter(Boolean));
  const commits = sigs.filter(s => s.kind === "commitment"), sc = count(commits, s => (s.levers || []).map(l => LEVER_CAT[l]).filter(Boolean));
  const keys = [...new Set([...Object.keys(pc), ...Object.keys(sc)])].sort();
  return `<section class="container hub eq-sum-sec" id="equity-reach" aria-labelledby="eqr-h"><h2 class="hub-h" id="eqr-h">Health and equity reach</h2>
    <p class="hub-p">Within the records tracked by Common Shade: ${progs.length} funding programmes and ${commits.length} policy commitments on Signals. A record can sit under more than one kind of protection, so the counts do not add up to a total, and no money is summed: the records do not track amounts in a way that can be compared. Being absent here does not mean no funding exists.</p>
    <div class="eq-sum-wrap" role="region" aria-label="Records by kind of protection, scrollable" tabindex="0"><table class="hr-table"><caption>Records by the kind of protection they name (a record can count more than once)</caption><thead><tr><th scope="col">Kind of protection</th><th scope="col">Funding programmes</th><th scope="col">Policy commitments</th></tr></thead><tbody>${keys.map(k => `<tr><th scope="row">${esc(k)}</th><td>${pc[k] || 0}</td><td>${sc[k] || 0}</td></tr>`).join("")}</tbody></table></div>
    <p class="hub-p">What remains unknown across these records: who actually benefits, how money is split between components, and evidence of reach. Each card's "Health and equity reach" panel says which of these it documents. Little funding identified, an undisclosed amount, funding not yet researched and an evidenced financing gap are different things; these records establish none of the last.</p></section>`;
}
module.exports = { programme, signal, summary, CAT, LEVER_CAT };
