#!/usr/bin/env node
// Common Shade: a first draft of each organisation's facets (countries, scale, type, link kind), read only from the
// record's own name, description, group and link in data/core/ORGANISATIONS.json. Nothing is looked up or guessed from
// outside the record: where the record names no place, countries stays empty and scale is "unstated".
// Writes facets-draft.json and facets-review.md (the rows a person has to settle; decisions go in facets-edits.json).
//   node research/2026-11/heat-network/facets-draft.js
"use strict";
const fs = require("fs"), path = require("path");
const HERE = __dirname, ROOT = path.join(HERE, "..", "..", "..");
const ORGS = JSON.parse(fs.readFileSync(path.join(ROOT, "data/core/ORGANISATIONS.json"), "utf8"));
// place words found in a record -> country code. Cities and states map to their country.
const PLACES = {
  IN: /\bindia(n)?\b|delhi|ahmedabad|mumbai|bengaluru|bangalore|kerala|tamil nadu|odisha|telangana|gujarat|rajasthan|chennai|jodhpur|hyderabad|pune\b|kolkata|lucknow|varanasi|churu|thane|kochi|maharashtra|uttar pradesh|bihar|andhra|karnataka|nagpur|surat|bhubaneswar|anganwadi|jharkhand|madhya pradesh|punjab, india/i,
  BD: /bangladesh|dhaka|cox.s bazar|chattogram|rajshahi/i, PK: /pakistan|karachi|sindh|lahore|jacobabad|islamabad/i,
  NP: /nepal|dhangadhi|kathmandu|nepalgunj/i, LK: /sri lanka|colombo/i, BT: /bhutan/i, MV: /maldives/i, AF: /afghanistan/i,
  PH: /philippine|quezon city|iloilo|manila|filipino/i, TH: /thai(land)?\b|bangkok/i, VN: /viet ?nam|hanoi|ho chi minh/i,
  ID: /indonesia|jakarta|katalis-heat|semarang|makassar/i, KH: /cambodia|phnom penh/i, MY: /malaysia|kuala lumpur/i,
  SG: /singapore|sentosa|tengah/i, MM: /myanmar/i, LA: /\blaos?\b|lao pdr/i, BN: /brunei/i, TL: /timor-leste/i,
  HK: /hong kong/i, CN: /\bchina\b|chinese/i, JP: /\bjapan/i, AU: /australia/i, GR: /athens/i, SL: /freetown/i
};
// when the words name no place, the link's own country domain is used and recorded as basis "domain"
const TLD = { in: "IN", bd: "BD", pk: "PK", np: "NP", lk: "LK", bt: "BT", mv: "MV", af: "AF", ph: "PH", th: "TH", vn: "VN", id: "ID", kh: "KH", my: "MY", sg: "SG", mm: "MM", la: "LA", bn: "BN", tl: "TL", hk: "HK" };
const REGIONAL = /south asia|southeast asia|south-east asia|asia[- ]pacific|\basean\b|mekong|himalaya|across asia|asian cities|\basia\b/i;
const TYPE = [   // first match wins; read from the name first, then the group
  ["multilateral", /^un[ -]|united nations|world bank|asian development bank|\bunicef\b|international labour organization|\bundp\b|\bunep\b|\bescap\b|food and agriculture organization|international energy agency|world meteorological|\bicimod\b|green climate fund|asian infrastructure/i],
  ["weather", /meteorolog|pagasa|bmkg|observatory|hydrology/i],
  ["redcross", /red cross|red crescent|\bifrc\b/i],
  ["city", /municipal|city (government|council|corporation)|metropolitan (administration|corporation)|city of |provincial government|mahanagara|sub-metropolitan|district administration/i],
  ["health", /ministry of health|health services|disease control|hospital|public health agency|world health organization/i],
  ["standards", /standardization|bureau of energy efficiency|standards/i],
  ["worker", /\bunion\b|self employed women|homenet|streetnet|wiego|workers.? (association|federation|union)|\biuf\b|trade union|hasiru dala|janpahal/i],
  ["government", /ministry|department of|authority|\bboard\b|government|agency|directorate|corporation, |council, singapore|regulator|reserve bank|bank of (thailand|indonesia)|bangko sentral|monetary authority|state bank/i],
  ["network", /network|alliance|coalition|consortium|\bc40\b|\biclei\b|united cities|forum|partnership|collective/i]
];
const BY_ROLE = { research: "research", funders: "funder", finance: "finance", lending: "finance", cooling: "company", ground: "ngo", asia: "government", global: "ngo" };
const linkKind = u => { let x; try { x = new URL(u); } catch (e) { return "home"; }
  if (/deccanherald|inquirer|tribune|gmanetwork|mongabay|downtoearth|onlinekhabar|nationthailand|weforum\.org|reliefweb|preventionweb|atachcommunity|rockefellerfoundation\.org\/perspective/.test(x.hostname + x.pathname)) return "third";
  return x.pathname.replace(/\/(en|index\.html?)?\/?$/, "").length <= 1 && !x.search ? "home" : "work"; };
const out = {}, review = [];
for (const o of ORGS) {
  const text = `${o.name}. ${o.does}`; let countries = Object.keys(PLACES).filter(c => PLACES[c].test(text)), basis = "text";
  if (!countries.length) { let tld = ""; try { tld = new URL(o.url).hostname.split(".").pop(); } catch (e) {} if (TLD[tld]) { countries = [TLD[tld]]; basis = "domain"; } }
  const regional = REGIONAL.test(text);
  let type = (TYPE.find(([, r]) => r.test(o.name)) || [])[0], guessed = false;
  if (!type) { type = BY_ROLE[o.role]; guessed = true; }
  let scale;
  if (type === "city") scale = "city";
  else if (countries.length === 1 && /\b(state disaster|provincial|province|district|kerala|sindh|delhi|odisha|gujarat|telangana|tamil nadu)\b/i.test(o.name)) scale = "subnational";
  else if (countries.length === 1) scale = "country";
  else if (countries.length > 1) scale = "multi-country";
  else if (regional) scale = "regional";
  else scale = o.role === "global" ? "global" : "unstated";
  const year = (o.does.match(/\b(20[12]\d)\b/g) || []).map(Number).sort().pop();
  out[o.id] = Object.assign({ countries, basis: countries.length ? basis : undefined, scale, type, link: linkKind(o.url) }, year ? { year } : {});
  const why = [];
  if (scale === "unstated") why.push("no place named");
  if (countries.length > 3) why.push("more than three countries");
  if (guessed) why.push("type from its group");
  if (why.length) review.push(`| ${o.id} | ${o.name.replace(/\|/g, "/")} | ${countries.join(" ") || "-"} | ${scale} | ${type} | ${why.join("; ")} |`);
}
fs.writeFileSync(path.join(HERE, "facets-draft.json"), JSON.stringify(out, null, 0).replace(/\},"/g, '},\n"') + "\n");
fs.writeFileSync(path.join(HERE, "facets-review.md"), `# Facets to settle\n\nRows where the record's own words did not settle the draft. Decisions go in \`facets-edits.json\`.\n\n| id | organisation | countries | scale | type | why |\n|---|---|---|---|---|---|\n${review.join("\n")}\n`);
console.log(`${ORGS.length} drafted, ${review.length} to settle`);
