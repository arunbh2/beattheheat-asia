#!/usr/bin/env node
// Common Shade: writes the heat network source registry, data/funding/network-sources.json, one record per organisation in
// data/core/ORGANISATIONS.json. The official domain is the record's own link unless that link is a third-party page (a news
// story, a journal, a partner's page), in which case DOMAINS below names the organisation's own site; the sweep then confirms
// the homepage names the organisation (identity) before reading anything. Pages a person has confirmed (careers, procurement,
// grants, research, an applicant-tracking system, a feed) are kept across runs; nothing a run discovered is lost.
//   node research/2026-11/opportunities/registry.js
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", "..", ".."), F = path.join(ROOT, "data", "funding", "network-sources.json");
const ORGS = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "core", "ORGANISATIONS.json"), "utf8"));
const FUND = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "funding", "organisations.json"), "utf8")).records;
const prev = fs.existsSync(F) ? Object.fromEntries(JSON.parse(fs.readFileSync(F, "utf8")).records.map(r => [r.id, r])) : {};
// the organisation's own site where its network record links to someone else's page (each confirmed by the sweep's identity check)
const DOMAINS = require("./domains.json");
const THIRD = /(mongabay|downtoearth|dhakatribune|onlinekhabar|dtnext|citizenmatters|inquirer\.net|preventionweb|doi\.org|weforum|deccanherald|linkedin|eco-business|reliefweb|philstar|vietnamnews|thefinancialexpress|thehindu|hindustantimes|indianexpress|timesofindia|ncbi|sciencedirect|nature\.com|springer|wiley|tandfonline|mdpi|frontiersin|youtube|github|medium\.com|wikipedia|thelancet)/i;
const host = u => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return ""; } };
const records = ORGS.map(o => {
 const p = prev[o.id] || {}, h = host(o.url), d = DOMAINS[o.id];
 const fund = FUND.find(f => f.network_id === o.id);
 return {
  id: o.id, name: o.name, aliases: p.aliases || [],
  domain: d ? d.domain : p.domain_confirmed ? p.domain : THIRD.test(h) ? null : h,
  domain_source: d ? "registry: " + d.why : THIRD.test(h) ? "network record links to a third-party page; no domain yet" : "network record's own link",
  domain_confirmed: p.domain_confirmed || false,
  careers: p.careers || null, procurement: p.procurement || null, grants: p.grants || null, research: p.research || null,
  ats: p.ats || null, feed: p.feed || null, funder_id: fund ? fund.id : (p.funder_id || null),
  notes: p.notes || ""
 };
});
fs.writeFileSync(F, JSON.stringify({ about: "The heat network source registry: one record per organisation in data/core/ORGANISATIONS.json, with its official domain and the pages where it publishes jobs, consultancies, tenders, grants and fellowships. Written by research/2026-11/opportunities/registry.js (keeps confirmed pages across runs); read by tools/opportunities-sweep.js, which records each check in data/funding/coverage.json. A page listed here is where to look, not a claim that anything is open.", records }, null, 1) + "\n");
console.log(`registry: ${records.length} organisations, ${records.filter(r => r.domain).length} with a domain, ${records.filter(r => !r.domain).length} without`);
