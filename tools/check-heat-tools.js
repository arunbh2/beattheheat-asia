// Heat Tool Finder check: the catalogue, the shared filter logic and the built pages, against the brief's rules.
// Fails with a message that says what to fix. Warns (does not fail) on records due for review and on links the last
// link check could not reach: a link check shows reachability, never accuracy, and a transient error is reported, not
// rewritten.   node tools/check-heat-tools.js
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), DIR = path.join(ROOT, "data", "heat-tools");
const H = require("../heat-tools/finder-core.js");
const CAT = JSON.parse(fs.readFileSync(path.join(DIR, "catalogue.json"), "utf8"));
const SCHEMA = JSON.parse(fs.readFileSync(path.join(DIR, "catalogue.schema.json"), "utf8"));
const bad = [], warn = [], ok = (c, m) => { if (!c) bad.push(m); };

// ---- 1. the JSON follows its schema (the keywords this schema uses), ids are unique, every reference resolves ----
function validate(v, s, at) {
  if (s.$ref) s = s.$ref.split("/").slice(1).reduce((o, k) => o[k], SCHEMA);
  if (s.anyOf) { if (!s.anyOf.some(x => { const n = bad.length; validate(v, x, at); const pass = bad.length === n; bad.length = n; return pass; })) bad.push(`${at}: matches none of the allowed shapes`); return; }
  if ("const" in s && v !== s.const) bad.push(`${at}: must be ${JSON.stringify(s.const)}`);
  if (s.enum && !s.enum.includes(v)) bad.push(`${at}: "${v}" is not one of ${s.enum.join(", ")}`);
  const types = [].concat(s.type || []), t = v === null ? "null" : Array.isArray(v) ? "array" : Number.isInteger(v) ? "integer" : typeof v;
  if (types.length && !types.some(x => x === t || (x === "number" && t === "integer"))) { bad.push(`${at}: expected ${types.join(" or ")}, found ${t}`); return; }
  if (typeof v === "string") {
    if (s.minLength && v.length < s.minLength) bad.push(`${at}: empty`);
    if (s.pattern && !new RegExp(s.pattern).test(v)) bad.push(`${at}: "${v}" does not match ${s.pattern}`);
    if (s.format === "date" && !(/^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v)))) bad.push(`${at}: "${v}" is not a date`);
    if (s.format === "uri" && !/^https?:\/\/[^\s]+$/.test(v)) bad.push(`${at}: "${v}" is not a web address`);
  }
  if (typeof v === "number" && "minimum" in s && v < s.minimum) bad.push(`${at}: below ${s.minimum}`);
  if (Array.isArray(v)) { if (s.minItems && v.length < s.minItems) bad.push(`${at}: needs at least ${s.minItems}`); if (s.items) v.forEach((x, i) => validate(x, s.items, `${at}[${i}]`)); }
  if (v && typeof v === "object" && !Array.isArray(v)) {
    (s.required || []).forEach(k => { if (!(k in v)) bad.push(`${at}: missing "${k}"`); });
    Object.entries(s.properties || {}).forEach(([k, sub]) => { if (k in v) validate(v[k], sub, `${at}.${k}`); });
  }
}
validate(CAT, SCHEMA, "catalogue");
const uniq = (list, what) => { const seen = new Set(); list.forEach(x => { ok(!seen.has(x.id), `${what} id "${x.id}" is used twice`); seen.add(x.id); }); };
uniq(CAT.records, "record"); uniq(CAT.sources, "source"); uniq(CAT.curated_pathways, "pathway");
const SRC = Object.fromEntries(CAT.sources.map(s => [s.id, s])), BY = Object.fromEntries(CAT.records.map(r => [r.id, r])), IDS = Object.keys(BY);
for (const r of CAT.records) {
  [...r.evidence.source_ids, ...r.field_provenance.provider_facts_source_ids].forEach(i => ok(SRC[i], `${r.id}: source "${i}" is not in sources`));
  ok(fs.existsSync(path.join(ROOT, r.links.common_shade_next_step, "index.html")), `${r.id}: next step ${r.links.common_shade_next_step} is not a page on the site`);
  ok(r.decision_tags.every(d => CAT.design.decisions.some(x => x.id === d)), `${r.id}: a decision tag is not in design.decisions`);
}
CAT.curated_pathways.forEach(p => p.steps.forEach(s => s.resource_ids.forEach(i => ok(BY[i], `pathway ${p.id}: "${i}" is not a record`))));

// ---- 2. readers never see a raw key: every value the data uses has words in finder-core.js ----
ok(JSON.stringify(H.DECISIONS) === JSON.stringify(CAT.design.decisions.map(d => [d.id, d.label])), "finder-core.js DECISIONS differ from design.decisions in the catalogue: copy them across");
const has = (list, v) => list.some(x => x[0] === v);
for (const r of CAT.records) {
  ok(H.TYPE[r.resource_type], `${r.id}: no words for resource type "${r.resource_type}" in finder-core.js`);
  r.user_roles.forEach(v => ok(has(H.ROLES, v), `${r.id}: no words for role "${v}"`));
  r.time_horizons.forEach(v => ok(has(H.HORIZONS, v), `${r.id}: no words for time horizon "${v}"`));
  r.heat_metrics.forEach(v => ok(has(H.METRICS, v), `${r.id}: no words for heat measure "${v}"`));
  ok(has(H.ACCESS, r.access.mode), `${r.id}: no words for access mode "${r.access.mode}"`);
  ok(H.SCOPE[r.geography.scope], `${r.id}: no words for scope "${r.geography.scope}"`);
  ok(H.APPLIC[r.geography.asia_applicability], `${r.id}: no words for applicability "${r.geography.asia_applicability}"`);
  ok(H.REVIEW[r.evidence.review_depth], `${r.id}: no words for review depth`);
  ok(H.LOCAL[r.evidence.local_validation_status], `${r.id}: no words for local validation "${r.evidence.local_validation_status}"`);
  ok(H.MAINT[r.publication.maintenance_status], `${r.id}: no words for maintenance "${r.publication.maintenance_status}"`);
  ok(H.API[r.technical.api_status] && H.INTEGRATION[r.technical.integration_mode], `${r.id}: no words for its API or integration status`);
  r.geography.country_codes.filter(c => c !== "US").forEach(c => ok(H.COUNTRY[c], `${r.id}: country ${c} is not in the finder's country list`));
  // nothing is presented as tested: no record may claim it until someone has run it
  ok(r.technical.live_execution_tested === false && r.technical.api_status !== "tested", `${r.id}: marked as run or tested; the finder never shows that without a recorded check`);
  ok(H.safeUrl(r.links.primary_url), `${r.id}: primary_url is not an https address`);
}
CAT.sources.forEach(s => ok(H.safeUrl(s.url), `source ${s.id}: not an https address`));

// ---- 3. the filtering policy ----
const all = s => H.filter(CAT.records, Object.assign(H.emptyState(), s)), flat = res => res.groups.flatMap(g => g.items);
for (const [c] of H.COUNTRIES) {
  const got = flat(all({ country: c }));
  ok(!got.some(r => r.geography.scope === "country_specific" && !r.geography.country_codes.includes(c)), `country ${c}: a country-specific service for another country appears`);
}
ok(!flat(all({ country: "IN" })).some(r => r.geography.country_codes.includes("SG")) && !flat(all({ country: "SG" })).some(r => r.geography.country_codes.includes("IN")), "India and Singapore services are mixed in a country result");
for (const r of CAT.records.filter(r => r.geography.scope !== "country_specific")) ok(H.groupOf(r) !== "country", `${r.id}: global or input-based, but grouped as country coverage`);
for (const r of CAT.records) ok(/not assessed|Not validated|not validated|not verified/i.test(H.rows(r)[2][1]), `${r.id}: its coverage row does not say local validation is unassessed`);
for (const r of CAT.records.filter(r => r.access.registration_required == null)) {
  ok(H.test(r, Object.assign(H.emptyState(), { noreg: true, caution: true })) !== true, `${r.id}: unknown registration passes the strict no-registration filter`);
  ok(H.regLabel(null) === "Registration not verified", "unknown registration is not labelled as not verified");
}
for (const r of CAT.records) {
  if (r.access.licence == null) ok(H.licenceLabel(r.access) === "Reuse licence not verified", `${r.id}: a missing licence does not read "Reuse licence not verified"`);
  if (r.access.price_amount == null) ok(!/free/i.test(H.priceLabel(r.access)), `${r.id}: an unknown price reads as free`);
}
ok(H.label(H.ACCESS, "public_read") !== H.label(H.ACCESS, "free_tool"), "free-to-read and free-to-use share a label");
const caution = CAT.records.filter(r => r.publication.status === "caution_listing");
ok(BY.niosh && BY.niosh.publication.status === "caution_listing" && !BY.niosh.publication.featured, "the NIOSH app is not a non-featured caution listing");
caution.forEach(r => { ok(!flat(all({})).includes(r), `${r.id}: a caution listing appears in default results`); ok(flat(all({ caution: true })).includes(r), `${r.id}: "Include caution listings" does not bring it back`); ok(!r.publication.featured, `${r.id}: a caution listing is featured`); });
ok(all({ decision: ["check_warnings"], type: ["guidance"], country: "SG" }).count === 0, "an impossible combination returned results: filters were loosened");
ok(CAT.records.every(r => { const g = H.groupOf(r); return r.origin === "common_shade" ? g === "cs" : g !== "cs"; }), "Common Shade pages and outside resources are mixed in one group");
const res0 = all({}); ok(res0.external === CAT.records.filter(r => r.origin !== "common_shade" && r.publication.status !== "caution_listing").length, "outside resources and Common Shade pages are counted together");

// ---- 4. the address: up to three to compare, unknown ids and values ignored, a round trip keeps the state ----
const st = H.parseState("?compare=ceew,imd,sg,bmd&decision=check_warnings,nonsense&country=xx&type=tool&caution=1", IDS);
ok(st.compare.length === 3 && st.compare.join() === "ceew,imd,sg", "compare does not stop at three in order");
ok(H.parseState("?compare=ceew,nope", IDS).compare.join() === "ceew", "an unknown compare id is not ignored");
ok(st.decision.join() === "check_warnings" && st.country === "", "an unknown filter value is not ignored");
ok(JSON.stringify(H.parseState(H.toQuery(st), IDS)) === JSON.stringify(st), "the address does not round-trip the state");

// ---- 5. exports: formula-like values neutralised; limits, addresses, ids and review dates present ----
["=SUM(A1)", "+1", "-1", "@cmd", "\t=1"].forEach(x => ok(H.cell(x).startsWith(`"'`), `CSV cell ${JSON.stringify(x)} is not neutralised`));
ok(H.cell('a "b"') === '"a ""b"""', "CSV quotes are not escaped");
const csv = H.csv([BY.ceew, BY.imd], SRC);
ok(csv.includes("ceew") && csv.includes(BY.ceew.limitations[0].slice(0, 30)) && csv.includes(BY.ceew.links.primary_url) && csv.includes(BY.ceew.evidence.reviewed_on) && csv.includes(SRC.ceew.url), "the CSV is missing an id, a limit, an address or a review date");
const FINDER = fs.readFileSync(path.join(ROOT, "heat-tools", "finder.js"), "utf8");
const PRINT = (FINDER.match(/const print = `[\s\S]*?<\/div>`;/) || [""])[0];
ok(["limitations", "primary_url", "reviewed_on", "s.url", "r.id"].every(k => PRINT.includes(k)), "the print-out does not carry limits, addresses, ids and review dates");

// ---- 6. the built pages: readable without JavaScript, cautions visible, no claim of testing, no logos ----
const visible = f => fs.readFileSync(f, "utf8").replace(/<(script|style|template|noscript)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ");
const idx = path.join(ROOT, "heat-tools", "index.html");
ok(fs.existsSync(idx), "/heat-tools/ is not built: run node tools/build-static.js");
if (fs.existsSync(idx)) {
  const html = fs.readFileSync(idx, "utf8"), text = visible(idx);
  CAT.records.forEach(r => ok(text.includes(r.name), `/heat-tools/: "${r.name}" is not in the page without JavaScript`));
  ok((html.match(/Important limit:/g) || []).length >= CAT.records.length, "/heat-tools/: a card is missing its Important limit");
  ok(/Illustrative workflow/.test(text) && CAT.curated_pathways.every(p => html.includes(`id="path-${p.id}"`)), "/heat-tools/: a workflow is missing or not marked illustrative");
  ok(!/<img\b/i.test(html), "/heat-tools/: an image appears (no provider logos without checked permission)");
}
for (const r of CAT.records) {
  const f = path.join(ROOT, "heat-tools", r.id, "index.html");
  if (!fs.existsSync(f)) { bad.push(`/heat-tools/${r.id}/ is not built`); continue; }
  const text = visible(f);
  ok(/\btested\b/i.test(text) === false, `/heat-tools/${r.id}/: says "tested"`);
  ["What decision it helps with", "What you need to provide", "What you get", "Coverage, scale and time horizon", "What it cannot tell you", "Access, registration, reuse licence and integration", "Sources, and what was actually reviewed", "What to do next"]
    .forEach(h => ok(text.includes(h), `/heat-tools/${r.id}/: no "${h}" section`));
  if (r.origin === "external") ok(text.includes("View source / access information") && !text.includes("Open tool"), `/heat-tools/${r.id}/: the source button is not labelled "View source / access information"`);
  if (r.publication.status === "caution_listing") ok(/Maintenance or coverage caution/.test(text) && /not an operational recommendation/.test(text), `/heat-tools/${r.id}/: the caution is not visible`);
  if (r.publication.status === "provisional_listing") ok(/further checks needed/.test(text), `/heat-tools/${r.id}/: the provisional status is not visible`);
  if (r.evidence.review_depth === "official_indexed_content_reviewed") ok(text.includes("direct verification incomplete"), `/heat-tools/${r.id}/: the incomplete direct check is not stated`);
}
if (fs.existsSync(idx)) ok(!/\btested\b/i.test(visible(idx)), "/heat-tools/: says \"tested\"");

// ---- 7. warnings, never failures: due reviews and the last link check ----
const today = new Date().toISOString().slice(0, 10), stale = CAT.maintenance.stale_after_days || 90;
CAT.records.forEach(r => { if ((Date.parse(today) - Date.parse(r.evidence.reviewed_on)) / 864e5 > stale) warn.push(`${r.id}: reviewed ${r.evidence.reviewed_on}, over ${stale} days ago; flagged for recheck (kept, not deleted)`); });
const lc = path.join(ROOT, "research", "2026-11", "heat-tools", "url-check.json");
if (fs.existsSync(lc)) {
  const j = JSON.parse(fs.readFileSync(lc, "utf8"));   // { url: { status: OK | BLOCKED | FAIL, code } } from tools/verify-urls.js
  Object.entries(j).filter(([, x]) => x.status !== "OK").forEach(([u, x]) => warn.push(`link check: ${u} answered ${x.status} (${x.code}); reported, not rewritten`));
} else warn.push("no link check yet: run verify-urls.yml with research/2026-11/heat-tools/urls.txt");

if (warn.length) console.warn("heat tools, to note:\n  " + warn.join("\n  "));
if (bad.length) { console.error(`heat tools check: ${bad.length} problems\n  ` + bad.join("\n  ")); process.exit(1); }
console.log(`heat tools check: ${CAT.records.length} records, ${CAT.sources.length} sources and ${CAT.curated_pathways.length} workflows follow the schema and the filtering policy; ${CAT.records.length + 1} pages read without JavaScript`);
