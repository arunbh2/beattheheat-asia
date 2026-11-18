#!/usr/bin/env node
// Common Shade: applies the confirmed India heat policy claims (NRDC's 2026 review of heat policy in India; NIUA's study of 20 city
// plans and its learning notes on climate finance and on institutions), the existing text kept:
//   LEVERS.json        examples on Cool by design, Green, cool cities, Heat action plans, Cooling centres and Dedicated heat budgets,
//                      each with NRDC as its source, and practical guides on the same five levers
//   CONSEQUENCES.json  one passage and source on "Heat protection underfunded" (underfund)
//   COOL_READING.json  the NRDC review in Free books and guides
//   ORGANISATIONS.json NRDC in the heat network (then run research/2026-11/heat-network/apply.js)
// Refused unless gate.js confirmed every claim a change carries and every linked page opened; a repeat run or a missing target stops it.
//   node research/2026-11/heat-india-policy/gate.js && node research/2026-11/heat-india-policy/apply.js
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", "..", ".."), HERE = __dirname, CORE = path.join(ROOT, "data", "core");

// readable JSON: short arrays of plain values on one line, everything else indented
function ser(v, ind = "") {
  const next = ind + "  ";
  if (Array.isArray(v)) {
    if (!v.length) return "[]";
    if (v.every(x => x === null || typeof x !== "object")) { const one = JSON.stringify(v); if (one.length < 110) return one; }
    return "[\n" + v.map(x => next + ser(x, next)).join(",\n") + "\n" + ind + "]";
  }
  if (v && typeof v === "object") {
    const ks = Object.keys(v); if (!ks.length) return "{}";
    return "{\n" + ks.map(k => next + JSON.stringify(k) + ": " + ser(v[k], next)).join(",\n") + "\n" + ind + "}";
  }
  return JSON.stringify(v);
}
const OK = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(HERE, "confirmed.json"), "utf8")).map(c => [c.id, c]));
const C = JSON.parse(fs.readFileSync(path.join(HERE, "claims.json"), "utf8")), URL = Object.fromEntries(C.sources.map(s => [s.key, s.url]));
const L = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "inbox", "2026-11-heat-india-policy", "link-check.json"), "utf8"));
const opened = k => /^(OK|REDIRECT)/.test(String(L[URL[k]] || ""));
// c-roofguide is held back: the NDMA handbook link did not open for the checker (ledger.md)
const need = C.claims.map(c => c.id).filter(id => id !== "c-roofguide"), miss = need.filter(c => !OK[c]);
const pages = ["nrdc", "cp-page", "m3-page", "m4-page", "ndma-cc"].filter(k => !opened(k));
if (miss.length || pages.length) { console.error(`Nothing written:${miss.length ? " claim " + miss.join(", ") + " not confirmed;" : ""}${pages.length ? " page " + pages.join(", ") + " did not open" : ""}`); process.exit(1); }
const NRDC = { label: "NRDC, 2026: Extreme Heat in India, a review of the evolving policy and practice landscape", url: URL.nrdc };
const NIUA = "National Institute of Urban Affairs, Climate Centre for Cities (C-Cube)";
const EX = {   // [lever, text to insert after (null: append, or set when the lever has none), added text]
  coolbydesign: [null, "Amravati's Cool Roof Bylaws 2025 make high-reflectance roofs mandatory for new government and commercial buildings and for homes over 500 sq m. Tamil Nadu's Green Schools initiative put cool roof coatings on 300 government schools, lowering classroom temperatures during school hours from 31 °C to 27 °C."],
  greencity: [null, " Tamil Nadu's Urban Greening Policy 2026 asks city governments to keep at least 15% of their area under green cover."],
  hap: ["by June 2026, India had more than 250.", " Uttar Pradesh sets heatwave thresholds district by district for its yellow, orange and red alerts, and in Kerala the Moodadi village council in Kozhikode wrote a village-level heat action plan."],
  coolingcentres: [null, " Under its heat action plan, Jodhpur built a net-zero cooling station for informal workers in a high-risk ward."],
  heatbudget: ["preparing for heat is still paid for separately.", " Since September 2024, states may also use their disaster mitigation funds for heatwave projects, and Kerala gave each district collector ₹1 crore for heat protection such as drinking water kiosks and cooling centres."]
};
const GUIDES = {
  coolbydesign: [
    { by: NIUA + ", 2026", title: "Institutionalisation of Climate Actions (Learning Note 4): a climate checklist for every project before approval, which asks whether it will increase flood or heat risk", url: URL["m4-page"] }],
  greencity: [
    { by: NIUA + ", 2024", title: "Climate Considerations in City Plans, a study of 20 master plans: green cover is widely planned, but heat islands are seldom studied through microclimate analysis, and vulnerability mapping often does not directly inform the plans", url: URL["cp-page"] }],
  hap: [
    { by: "Natural Resources Defense Council (NRDC), 2026", title: "Extreme Heat in India: how heat action plans are moving from short-term response to ward-level risk assessment, department roles and financing", url: URL.nrdc },
    { by: NIUA + ", 2026", title: "Institutionalisation of Climate Actions (Learning Note 4): a heat action plan's roles by department, from health (warnings and outreach) and engineering (shade, cool roofs, water points) to disaster management and ward offices", url: URL["m4-page"] }],
  coolingcentres: [
    { by: "National Disaster Management Authority, India, 2025 (in the GHHIN library)", title: "Guidelines for Cooling Centers: site selection in high-risk areas, retrofitting existing buildings, ventilation and cooling design, and operations and maintenance", url: URL["ndma-cc"] }],
  heatbudget: [
    { by: "Climate Policy Initiative and " + NIUA + ", 2026", title: "Understanding Urban Climate Finance (Learning Note 3): preparing a project for finance, with people protected from heat counted as a measurable outcome", url: URL["m3-page"] }]
};
const UNDER_ADD = " Across the world's cities, adaptation received about USD 10 billion a year in 2021-2022, out of USD 831 billion in urban climate finance, by the count of the 2024 State of Cities Climate Finance report.";
const UNDER_SRC = { label: "Climate Policy Initiative and National Institute of Urban Affairs, 2026: Understanding Urban Climate Finance, Learning Note 3, citing the 2024 State of Cities Climate Finance report", url: URL["m3-page"] };
const READ = { title: "Extreme Heat in India: A Review of the Evolving Policy and Practice Landscape", by: "Natural Resources Defense Council (NRDC), 2026", url: URL.nrdc,
  adds: "How India's heat action plans and state heat policies have changed since Ahmedabad's 2013 plan, with seven state and city approaches described side by side, and next steps on coverage, data, institutions, monitoring and long-term finance." };
const ORG = { id: "nrdc-india", role: "global", name: "Natural Resources Defense Council (NRDC), India programme", url: URL.nrdc,
  does: "Works with Indian cities and states on heat action plans. It developed Ahmedabad's 2013 heat action plan, the first in South Asia, with the Indian Institute of Public Health-Gandhinagar, and reviews heat policy in India.",
  levers: ["hap", "coolbydesign", "coolingcentres"] };
const rd = f => JSON.parse(fs.readFileSync(path.join(CORE, f), "utf8")), wr = (f, v) => fs.writeFileSync(path.join(CORE, f), ser(v) + "\n");
const lev = rd("LEVERS.json"), read = rd("COOL_READING.json"), cons = rd("CONSEQUENCES.json"), orgs = rd("ORGANISATIONS.json"), bad = [];
for (const [id, [after, add]] of Object.entries(EX)) {
  const v = lev.find(x => x.id === id); if (!v) { bad.push(`no lever ${id}`); continue; }
  if ((v.exampleSources || []).some(s => s.url === NRDC.url)) { bad.push(`${id} already cites NRDC`); continue; }
  if (after) { if ((v.example || "").split(after).length !== 2) { bad.push(`${id}: "${after}" not found once`); continue; } v.example = v.example.replace(after, after + add); }
  else v.example = v.example ? v.example + add : add.trim();
  (v.exampleSources = v.exampleSources || []).push(NRDC);
}
for (const [id, gs] of Object.entries(GUIDES)) {
  const v = lev.find(x => x.id === id); if (!v) continue;
  for (const g of gs) { if ((v.guides || []).some(x => x.url === g.url && x.title === g.title)) bad.push(`${id} already has "${g.title.slice(0, 40)}"`); else (v.guides = v.guides || []).push(g); }
}
const u = cons.find(c => c.id === "underfund"); if (!u) bad.push("no consequence underfund"); else if (u.desc.includes("USD 831 billion")) bad.push("underfund already has the passage"); else { u.desc += UNDER_ADD; u.sources.push(UNDER_SRC); }
if (read.some(r => r.url === READ.url)) bad.push("the NRDC review is already in COOL_READING"); else read.push(READ);
if (orgs.some(o => o.id === ORG.id || o.url === ORG.url)) bad.push("NRDC is already listed"); else { const at = orgs.map(o => o.role).lastIndexOf(ORG.role); orgs.splice(at + 1, 0, ORG); }
if (bad.length) { console.error("Nothing written: " + bad.join("; ")); process.exit(1); }
wr("LEVERS.json", lev); wr("COOL_READING.json", read); wr("CONSEQUENCES.json", cons); wr("ORGANISATIONS.json", orgs);
console.log(`applied ${need.length} confirmed claims: 5 examples, ${Object.values(GUIDES).flat().length} guides, underfund passage, 1 reading entry, organisation ${ORG.id} (now run research/2026-11/heat-network/apply.js)`);
