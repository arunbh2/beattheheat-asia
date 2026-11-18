#!/usr/bin/env node
// Common Shade: applies the confirmed NIUA learning-note claims (Climate Centre for Cities, 2026) in four places, the existing
// text kept: practical guides on three levers (data/core/LEVERS.json), one entry in Free books and guides (COOL_READING.json),
// one passage and source on the urban heat island consequence (CONSEQUENCES.json, uhi), and one organisation in the heat
// network (ORGANISATIONS.json; then run research/2026-11/heat-network/apply.js). Refused unless gate.js confirmed every claim
// a change carries and the linked page opened; a repeat run or a missing target stops it.
//   node research/2026-11/niua-cities-climate/gate.js && node research/2026-11/niua-cities-climate/apply.js
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
const L = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "inbox", "2026-11-niua-cities-climate", "link-check.json"), "utf8"));
const opened = k => /^(OK|REDIRECT)/.test(String(L[URL[k]] || ""));
const need = ["c-series", "c-results", "c-ward", "c-informal", "c-ccube"], miss = need.filter(c => !OK[c]);
const pages = ["m1-page", "m2-page", "ccube"].filter(k => !opened(k));
if (miss.length || pages.length) { console.error(`Nothing written: ${miss.length ? "claim " + miss.join(", ") + " not confirmed" : ""}${pages.length ? " page " + pages.join(", ") + " did not open" : ""}`); process.exit(1); }
const BY = "National Institute of Urban Affairs, Climate Centre for Cities (C-Cube), with GIZ India, 2026";
const NOTE2 = "Climate Change Adaptation Actions in Indian Cities (Learning Note 2)";
const GUIDES = {
  coolbydesign: `${NOTE2}: show results by pairing what is built, such as the number of roofs treated, with what changes for people, such as lower indoor temperatures and less heat illness (pp. 53-54)`,
  greencity: `${NOTE2}: show results by pairing what is built, such as hectares of green cover added, with what changes for people (pp. 53-54)`,
  coolingcentres: `${NOTE2}: show results by pairing what is built, such as cooling centres created, with what changes for people (pp. 51-54)`
};
const READ = { title: "Cities and Climate Fundamentals Primer, the first of four learning notes", by: BY + " and the International Climate Initiative (IKI)", url: URL["m1-page"],
  adds: "Free training for officials in Indian city governments, in four notes: climate fundamentals, adaptation actions, urban climate finance, and institutionalising climate action. The adaptation note covers resilience to heat, flooding and water stress." };
const UHI_ADD = " Within a city, heat stress varies from ward to ward and is far greater in densely built areas with little vegetation. In the reading of India's National Institute of Urban Affairs, shade, trees and cool spaces designed without people in informal settlements in mind may do little for those most at risk.";
const UHI_SRC = { label: "National Institute of Urban Affairs, Climate Centre for Cities, 2026: Climate Change Adaptation Actions in Indian Cities, Learning Note 2 (pp. 34, 51)", url: URL["m2-page"] };
const ORG = { id: "niua-ccube", role: "asia", name: "National Institute of Urban Affairs, Climate Centre for Cities (C-Cube)", url: URL["ccube"],
  does: "Works with Indian cities on climate action. Its heat work includes the Heat Resilient Cities Framework and a Building Heat Resilient Cities programme, and it publishes free learning notes for city officials.",
  levers: ["hap", "coolbydesign", "greencity"] };
const rd = f => JSON.parse(fs.readFileSync(path.join(CORE, f), "utf8")), wr = (f, v) => fs.writeFileSync(path.join(CORE, f), ser(v) + "\n");
const lev = rd("LEVERS.json"), read = rd("COOL_READING.json"), cons = rd("CONSEQUENCES.json"), orgs = rd("ORGANISATIONS.json"), bad = [];
for (const [id, title] of Object.entries(GUIDES)) { const v = lev.find(x => x.id === id); if (!v) bad.push(`no lever ${id}`); else if ((v.guides || []).some(g => g.url === URL["m2-page"])) bad.push(`${id} already has the guide`); else (v.guides = v.guides || []).push({ by: BY, title, url: URL["m2-page"] }); }
if (read.some(r => r.url === READ.url)) bad.push("the primer is already in COOL_READING"); else read.push(READ);
const u = cons.find(c => c.id === "uhi"); if (!u) bad.push("no consequence uhi"); else if (u.desc.includes("ward to ward")) bad.push("uhi already has the passage"); else { u.desc += UHI_ADD; u.sources.push(UHI_SRC); }
if (orgs.some(o => o.id === ORG.id || o.url === ORG.url)) bad.push("the organisation is already listed");
else { const at = orgs.map(o => o.role).lastIndexOf("asia"); orgs.splice(at + 1, 0, ORG); }
if (bad.length) { console.error("Nothing written: " + bad.join("; ")); process.exit(1); }
wr("LEVERS.json", lev); wr("COOL_READING.json", read); wr("CONSEQUENCES.json", cons); wr("ORGANISATIONS.json", orgs);
console.log(`applied ${need.length} confirmed claims: 3 guides, 1 reading entry, uhi passage, organisation ${ORG.id} (now run research/2026-11/heat-network/apply.js)`);
