// Common Shade: checks the heat network finder (/heat-network/). Each failure says what to fix.
//   node tools/check-heat-network.js
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), N = require("../heat-network/network-core.js");
let bad = 0; const ok = m => console.log("  ok  ", m), no = m => { bad++; console.log("  FAIL", m); };
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), "utf8"));
const ORGS = J("data/core/ORGANISATIONS.json"), F = J("data/core/ORG_FACETS.json"), SIDE = J("data/core/ORG_SIDE.json"), LEVERS = new Set(J("data/core/LEVERS.json").map(v => v.id));
const FIX = "Run node research/2026-11/heat-network/apply.js (reviewed corrections go in facets-edits.json beside it).";

// 1. every organisation has facets, and every value is one the page has words for
{
  const none = ORGS.filter(o => !F[o.id]).map(o => o.id), extra = Object.keys(F).filter(id => !ORGS.some(o => o.id === id));
  none.length ? no(`organisations with no facets: ${none.slice(0, 8).join(", ")}. ${FIX}`) : ok(`all ${ORGS.length} organisations have facets`);
  extra.length ? no(`ORG_FACETS has ids that are not organisations: ${extra.slice(0, 8).join(", ")}. ${FIX}`) : ok("ORG_FACETS names no organisation that is not listed");
  const wrong = [];
  for (const [id, f] of Object.entries(F)) {
    (f.countries || []).forEach(c => { if (!N.COUNTRY[c]) wrong.push(`${id}: country ${c}`); });
    if (!N.SCALE[f.scale]) wrong.push(`${id}: scale ${f.scale}`);
    if (!N.TYPE[f.type]) wrong.push(`${id}: type ${f.type}`);
    if (!(f.link in N.LINK)) wrong.push(`${id}: link ${f.link}`);
    if (f.countries.length && !["text", "domain", "edit"].includes(f.basis)) wrong.push(`${id}: a place with no basis`);
    if (f.checked && !/^\d{4}-\d\d-\d\d$/.test(f.checked)) wrong.push(`${id}: checked ${f.checked}`);
    if (f.checked && f.linkStatus) wrong.push(`${id}: both checked and a link status`);
    if (f.scale === "city" && f.type !== "city" && !f.countries.length) wrong.push(`${id}: a city scale with no country`);
  }
  wrong.length ? no(`facet values the page has no words for: ${wrong.slice(0, 8).join("; ")}. Add the word to heat-network/network-core.js or correct facets-edits.json.`) : ok("every country, scale, kind and link value is one network-core.js names");
}
// 2. the list itself: sides, levers, links, and names that could be the same organisation twice
{
  const noSide = ORGS.filter(o => !SIDE[o.id]).map(o => o.id), badLever = ORGS.flatMap(o => (o.levers || []).filter(l => !LEVERS.has(l)).map(l => `${o.id}: ${l}`));
  noSide.length ? no(`organisations with no side in data/core/ORG_SIDE.json: ${noSide.join(", ")}`) : ok("every organisation has a side (demand, supply or platform)");
  badLever.length ? no(`levers that are not in data/core/LEVERS.json: ${badLever.join("; ")}`) : ok("every lever an organisation works on exists");
  const badUrl = ORGS.filter(o => { try { return new URL(o.url).protocol !== "https:"; } catch (e) { return true; } }).map(o => o.id);
  badUrl.length ? no(`links that are not https addresses: ${badUrl.join(", ")}`) : ok("every link is an https address");
  // known pairs are listed for the site owner's decision (research/2026-11/heat-network/BUILD_BRIEF.md, section 7); a new one fails
  const KNOWN = new Set(["ahmedabad|ahmedabadmunicipalcorpor", "htparekh|htparekhfoundation", "icicilombard|icicilombardgeneralinsur", "imd|indiameteorologicaldepar", "komida|komida2", "pagasa|pagasa2", "cept|ceptuniversity", "smu|singaporemanagementunive", "brac|bracuniversityjamespgran", "iclei|icleilocalgovernmentsfor", "ghhin|ghhinsea", "heatwatch|heatwatchfoundation", "helpage|helpageindia", "homenet|homenetsouthasia", "coolcoalition|unenvironmentprogramme",
    "atecf|ateenterprises" /* two different bodies with a shared name */].map(p => p.split("|").sort().join("|")));
  const key = n => N.norm(n).replace(/\b(the|of|and|for|with|india|philippines|indonesia|limited|ltd)\b/g, " ").replace(/\s+/g, " ").trim().split(" ").slice(0, 3).join(" "), seen = {}, twins = [];
  ORGS.forEach(o => { const k = key(o.name); if (seen[k] && !KNOWN.has([seen[k], o.id].sort().join("|"))) twins.push(`${seen[k]} and ${o.id}`); else seen[k] = seen[k] || o.id; });
  twins.length ? no(`organisations that may be listed twice: ${twins.join("; ")}. Merge them (with the owner's yes) or add the pair to KNOWN in this check.`) : ok("no new pair of organisations shares a name");
}
// 3. the page: every organisation is a row with the data the filters read, and reads the same without the script
{
  const html = fs.readFileSync(path.join(ROOT, "heat-network/index.html"), "utf8");
  const rows = [...html.matchAll(/<li class="hn-card" id="org-([^"]+)" data-c="([^"]*)" data-s="([^"]*)" data-p="([^"]*)" data-t="([^"]*)" data-l="([^"]*)">/g)];
  rows.length === ORGS.length ? ok(`the page lists all ${ORGS.length} organisations as rows`) : no(`the page has ${rows.length} rows for ${ORGS.length} organisations. Run node tools/build-static.js.`);
  const off = rows.filter(r => { const f = F[r[1]]; return !f || r[2] !== f.countries.join(" ") || r[3] !== f.scale || r[4] !== SIDE[r[1]] || r[5] !== f.type; }).map(r => r[1]);
  off.length ? no(`rows whose filter data differs from the data files: ${off.slice(0, 8).join(", ")}. Run node tools/build-static.js.`) : ok("every row carries the place, part and kind from the data");
  /<form id="hn-form"[^>]* hidden>/.test(html) ? ok("the filter form stays hidden until the script is ready, so no dead controls show without it") : no("the filter form is not hidden by default (tools/build-heat-network.js)");
  ["global", "asia", "research", "ground", "cooling", "finance", "lending", "funders"].every(id => html.includes(`<h2 id="${id}">`)) ? ok("the eight group anchors still land") : no("a group anchor (#global, #asia ...) is missing from the page");
  html.includes("It does not imply partnership, affiliation or endorsement.") ? ok("the inclusion sentence is on the page") : no("the inclusion sentence is missing from the page");
  /rank|score|leading|top \d|best /i.test(html.slice(html.indexOf('id="hn-form"'), html.indexOf('id="hn-list"'))) ? no("the filter area uses a ranking word") : ok("the filter area ranks nothing");
  const full = fs.readFileSync(path.join(ROOT, "llms-full.txt"), "utf8"), T = require("./build-heat-network.js").TEXT;
  full.includes(T.how) && html.includes(T.how) && full.includes(T.linkNote("").slice(0, 40)) ? ok("llms-full.txt carries the same reading notes as the page") : no("llms-full.txt differs from the page's reading notes. Run node tools/build-static.js.");
}
// 4. the filter rules, on the real data
{
  const R = ORGS.map(o => { const f = F[o.id]; return { c: f.countries, s: f.scale, p: SIDE[o.id], t: f.type, l: o.levers || [], h: N.norm(o.name + " " + o.does) }; });
  const S = o => Object.assign(N.emptyState(), o), eq = (a, b, m) => a === b ? ok(m) : no(`${m}: expected ${b}, got ${a}`);
  eq(N.count(R, S({})), ORGS.length, "no filter shows every organisation");
  eq(N.count(R, S({ country: "BD" })), ORGS.filter(o => F[o.id].countries.includes("BD")).length, "a country shows only listings that name it");
  const wide = ORGS.filter(o => N.isWide(F[o.id])).length;
  eq(N.count(R, S({ country: "BD", wide: true })), ORGS.filter(o => F[o.id].countries.includes("BD")).length + wide, "asking for regional and global bodies adds exactly those");
  eq(N.count(R, S({ country: "BD", part: "demand", type: "weather" })), ORGS.filter(o => F[o.id].countries.includes("BD") && SIDE[o.id] === "demand" && F[o.id].type === "weather").length, "filters narrow together (AND)");
  eq(N.count(R, S({ country: "MM" })), ORGS.filter(o => F[o.id].countries.includes("MM")).length, "a country with nothing listed gives an empty result, not a loosened one");
  const round = S({ country: "IN", action: "heatrules", part: "supply", type: "ngo", q: "heat workers", wide: true });
  JSON.stringify(N.parseState(N.toQuery(round))) === JSON.stringify(round) ? ok("a filter state survives a trip through the address") : no("a filter state changes when written to the address and read back (network-core.js parseState, toQuery)");
  const junk = N.parseState("?country=XX&part=boss&type=<script>&action=../x&wide=1");
  JSON.stringify(junk) === JSON.stringify(N.emptyState()) ? ok("unknown values in an address are dropped") : no("an address with unknown values is not reduced to the empty state");
  N.csvCell("=1+1") === "'=1+1" && N.csvCell('a,"b"') === '"a,""b"""' ? ok("spreadsheet cells are escaped, and formula starts are neutralised") : no("csvCell does not neutralise a formula or escape quotes");
}
// 5. the link check: reported, never rewritten here
{
  const n = k => ORGS.filter(o => k(F[o.id])).length, fail = ORGS.filter(o => F[o.id].linkStatus === "fail");
  console.log(`  note  links: ${n(f => f.checked)} answered the last check, ${n(f => f.linkStatus === "blocked")} turned the checker away, ${fail.length} did not answer; ${n(f => f.link === "home")} open a homepage only`);
  fail.forEach(o => console.log(`  note  did not answer: ${o.id} ${o.url}`));
}
console.log(bad ? `heat network check: ${bad} failing` : "heat network check passed");
process.exit(bad ? 1 : 0);
