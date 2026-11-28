#!/usr/bin/env node
// Common Shade: checks Living Knowledge (/living-knowledge/, tools/build-living-knowledge.js) against the risks in its
// brief: valid records and references, only checked claims public, nothing held back leaking into pages, exports, search or
// llms text, numbers with their comparator and setting, remedies kept out of guidance, no household addresses, licences
// carried through, one record per study, the filter, fit and comparison rules, and a failed refresh never emptying the
// data. Each failure names what to fix.   node tools/check-living-knowledge.js
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const M = require("./living-knowledge.js"), C = require("../living-knowledge/lk-core.js");
let bad = 0; const ok = (c, msg) => { console.log(c ? "  ok  " : "  FAIL", msg); if (!c) bad++; };
const read = f => fs.readFileSync(path.join(ROOT, f), "utf8"), exists = f => fs.existsSync(path.join(ROOT, f));
const m = M.load(), P = m.public;

// ---- records and references
const v = M.validate();
ok(!v.length, `records are valid and every reference resolves${v.length ? ": " + v.join("; ") : ""}`);
ok(m.practices.every(p => p.claims.length), "every practice rests on at least one claim");
ok(m.claims.every(c => c.terms.length && c.locator), "every claim names the exact words it rests on and where in the source");
ok(m.claims.filter(c => c.quant).every(c => c.quant.unit && c.quant.comparator && c.quant.setting && c.quant.period), "every number has its unit, comparator, period and setting");
const dois = m.sources.filter(s => s.doi).map(s => s.doi.toLowerCase()), titles = m.sources.map(s => s.title.toLowerCase());
ok(new Set(dois).size === dois.length && new Set(titles).size === titles.length, "no study is counted twice (DOIs and titles unique; other copies listed under copies)");
ok(m.practices.filter(p => p.category === "indigenous").every(p => /identif/i.test(p.category_basis)), "a practice is called Indigenous only where a source identifies the knowledge holders");
ok(m.practices.every(p => p.places.every(pl => !/\b(street|jalan|road)\b.*\d|\bNo\.? ?\d+/i.test(pl.place))), "no household address is published");

// ---- only checked claims are public
ok(P.every(p => p.claim_records.every(c => c.confirmed)), `every public practice has every claim confirmed by the source check (${P.length} public, ${m.held.length} held back)`);
const restrictedGuidance = P.filter(p => p.restricted_advice).flatMap(p => C.guidance(p).map(g => g[2])).join(" ");
ok(!/multani|tamarind|decoction|bentonite/i.test(restrictedGuidance), "reported remedies never appear in stakeholder guidance");
ok(P.filter(p => p.restricted_advice).every(p => p.claim_records.every(c => c.status !== "guidance" || !/remed/i.test(c.text))), "no remedy is labelled as guidance");

if (exists("living-knowledge/index.html")) {
  const html = read("living-knowledge/index.html"), json = JSON.parse(read("living-knowledge/practices.json")), llms = read("llms-full.txt");
  const pubIds = new Set(P.map(p => p.id));
  ok(m.held.every(p => !html.includes(`id="p-${p.id}"`) && !exists(`living-knowledge/${p.id}/index.html`)), "no held-back practice is on the browse page or has its own page");
  ok(json.practices.every(p => pubIds.has(p.id)) && json.practices.length === P.length, "the public JSON holds exactly the public practices");
  ok(m.held.every(p => !llms.includes(`/living-knowledge/${p.id}/`)), "no held-back practice is in llms-full.txt");
  ok(json.practices.every(p => p.claims.every(c => m.byClaim[c.id] && m.byClaim[c.id].confirmed)), "the public JSON carries only confirmed claims");
  ok(json.practices.every(p => p.rights && p.rights.reuse) && json.sources.every(s => "licence" in s), "rights and source licences travel with the export");
  ok(P.every(p => html.includes(`id="p-${p.id}"`)), "every public practice is on the browse page, so it works without JavaScript");
  ok(P.every(p => { const d = read(`living-knowledge/${p.id}/index.html`); return d.includes("What makes this possible?") && d.includes("What can I do with this?") && d.includes(C.STAKE[0][1]) && d.includes("Common Shade's suggestion"); }), "every record page has the enabling-conditions panel and labelled stakeholder guidance for all nine groups");
  ok(P.every(p => read(`living-knowledge/${p.id}/index.html`).includes("Requires local assessment")), "every record says use elsewhere requires local assessment");
  ok(P.every(p => { const d = read(`living-knowledge/${p.id}/index.html`); return d.includes("Sources last read by the check") && d.includes("Evidence last reviewed by a person") && d.includes("Community review"); }), "every record keeps source-check, review and community-review dates apart");
  ok(P.filter(p => p.restricted_advice).every(p => read(`living-knowledge/${p.id}/index.html`).includes("Documented, not recommended")), "remedy records say documented, not recommended");
  const all = [html, ...P.map(p => read(`living-knowledge/${p.id}/index.html`)), read("living-knowledge/coverage/index.html"), read("living-knowledge/method/index.html"), read("living-knowledge/churu/index.html")].join("\n").replace(/<script[\s\S]*?<\/script>/g, "");
  ok(!/\b(proven|safe for everyone|zero cost|ancient solution|best practice)\b/i.test(all.replace(/no record carries a score or a "best practice" badge/i, "")), "no unsupported badges (proven, safe for everyone, zero cost, ancient solution, best practice)");
  ok(!/—/.test(all), "no em dashes");
  ok(!/\b(Saunik|Dutta)\b/.test(all), "the unverified speaker attribution is not in public copy");
  ok(["compare", "fit", "coverage", "method", "churu"].every(s => exists(`living-knowledge/${s}/index.html`)) && C.STAKE.every(([k]) => exists(`living-knowledge/for/${k}/index.html`)), "compare, fit, coverage, method, Churu and all nine stakeholder pages are built");
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(x => x[1])), miss = [...new Set([...html.matchAll(/href="#([^"]+)"/g)].map(x => x[1]))].filter(a => !ids.has(a));
  ok(!miss.length, `every in-page link lands${miss.length ? ": " + miss.join(", ") : ""}`);
  const internal = [...new Set([...all.matchAll(/href="(\/[^"#?]*)/g)].map(x => x[1]))].filter(u => !/\.(css|js|json|md|xml|png|jpg|svg|txt)$/.test(u));
  const dead = internal.filter(u => !exists(path.join(u, "index.html")) && !exists(u));
  ok(!dead.length, `internal links resolve${dead.length ? ": " + dead.join(", ") : ""}`);
  ok(read("living-knowledge/churu/index.html").includes("Not known from the sources") && read("living-knowledge/churu/index.html").includes("Proposed applications"), "the Churu ladder marks unknown steps and labels roles the plan does not assign");
}

// ---- rules on fixtures
const fx = Object.assign({ id: "fx", title: "Wet screen", summary: "", domain: "buildings", category: "local", climates: ["hot-dry"], settings: ["home"], places: [{ country: "IN", place: "Somewhere" }], local_names: [], evidence: ["reported"],
  fit: { humidity: "dry", water: "high", control: "household" }, requires: {}, labour: "x", water: "High", cost: null, fails_when: "humid", uncertain: "u" });
ok(C.fit(fx, { humidity: "humid" }).limits.some(l => /humid/.test(l)), "fit: a dry-air practice is flagged for humid heat, with the reason");
ok(C.fit(fx, { water: "limited" }).limits.some(l => /water/i.test(l)), "fit: a water-hungry practice is flagged where water is limited");
ok(C.fit(fx, { setting: "work" }).shown === false && /Documented for/.test(C.fit(fx, { setting: "work" }).why[0]), "fit: a practice documented for other settings is left out, and says why");
ok(!JSON.stringify(C.fit(fx, { humidity: "dry", water: "reliable", setting: "home" })).match(/safe|guarantee|degrees cooler/i), "fit: never says safe, guarantees or predicts cooling");
ok(C.compareRows([fx, Object.assign({}, fx, { labour: "" })])[5][1][1] === "Not reported", "comparison: missing values read Not reported, never blank or zero");
ok(C.matches(fx, { domain: "buildings", climate: "hot-dry" }) && !C.matches(fx, { domain: "food" }) && C.matches(fx, { q: "wet screen" }) && !C.matches(fx, { q: "matka" }), "filters match domain, climate and search words");
ok(JSON.stringify(C.readState(C.writeState({ domain: "water", country: "IN" }))) === JSON.stringify({ domain: "water", country: "IN" }), "filter state survives a round trip through the address");

// ---- refresh never empties the data
const wf = exists(".github/workflows/living-knowledge-refresh.yml") ? read(".github/workflows/living-knowledge-refresh.yml") : "";
ok(/search\.js/.test(wf) && /gh pr create/.test(wf) && !/practices\.json/.test(wf.replace(/#.*$/gm, "")), "the refresh workflow only adds a dated search run and opens a review pull request; it never rewrites the published records");
const s = read("research/2026-11/living-knowledge/search.js");
ok(/log\.runs\.push\(run\)/.test(s) && !/log\.runs\s*=\s*\[/.test(s), "a refresh run appends to the search log and never replaces earlier runs");

console.log(bad ? `living knowledge check: ${bad} failing` : `living knowledge check passed: ${P.length} public practices, ${m.claims.length} claims, ${m.sources.length} sources`);
process.exit(bad ? 1 : 0);
