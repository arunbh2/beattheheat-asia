#!/usr/bin/env node
// Common Shade: checks the El Niño pages against their one shared outlook record (data/site/enso-outlook.json, read through
// tools/enso-outlook.js). Each failure says what to fix.
//   1. the record: dates in order, cross-year periods name both years, probabilities within 0-100 and adding up, strength bands
//      nested inside the El Niño total (never added to it); every claim confirmed by the source check
//   2. fixtures: validate() refuses each kind of broken record, so a future edit cannot slip one through
//   3. the pages say the same thing: the repeated status sentences appear, word for word, on /el-nino/, /el-nino-and-cities/,
//      the El Niño watch on /signals/ and the printable briefing, and in llms-full.txt
//   4. dates are kept apart: the bulletin's issue date, its forecast period and the editorial check are all shown where they
//      belong, and no page shows the build date as a verification date
//   5. anchors and links that other pages and old links rely on still exist; the journey links between the pages are there
//   6. an overdue bulletin is reported as due, never as newly checked
//   node tools/check-enso.js
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
let bad = 0; const ok = (c, m) => { if (c) console.log("  ok  ", m); else { bad++; console.log("  FAIL", m); } };
const read = f => fs.existsSync(path.join(ROOT, f)) ? fs.readFileSync(path.join(ROOT, f), "utf8") : "";
const dec = s => s.replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ");
const EO = require("./enso-outlook.js");

// ---- 1. the record ----
let L;
try { L = EO.load(); ok(true, "the outlook record loads: every claim confirmed, and validate() finds nothing wrong"); }
catch (e) { ok(false, `the outlook record does not load: ${e.message}`); console.log(`enso check: ${bad} failing`); process.exit(1); }
const O = L.O, S = O.status, P = O.phase;
ok(S.issued < S.next, `the bulletin (${S.issued}) is dated before its next scheduled issue (${S.next})`);
ok(O.checked >= S.issued, "the editorial check is not dated before the bulletin it checked");
ok(P.rows.every(r => r.elnino + r.neutral + r.lanina === 100), "each season's phase probabilities add to 100");
ok(O.others.every(x => x.claims.length) && (O.history || []).every(x => x.claims.length), "every current and historical bulletin names the claims it rests on");
ok(!O.others.some(x => /Meteorological Service Singapore/.test(x.issuer) && x.issued < "2026-11"), "the superseded October status from Singapore sits in history, not among current bulletins");

// ---- 2. fixtures: validate() refuses broken records ----
const fx = (name, mutate, expect) => { const o = JSON.parse(JSON.stringify(O)); mutate(o); const p = EO.validate(o); ok(p.some(x => expect.test(x)), `fixture refused: ${name}`); };
fx("phase categories that do not add to 100", o => { o.phase.rows[0].neutral = 5; }, /add to/);
fx("a probability above 100", o => { o.phase.rows[1].elnino = 120; o.phase.rows[1].neutral = -20; }, /out of 0-100/);
fx("strength bands added on top of El Niño (double-counting)", o => { o.phase.strength.weak = 80; }, /bands add to/);
fx("a cross-year period without both years", o => { o.others[0].period = "November to January 2027"; }, /crosses the year/);
fx("a season written as an abbreviation", o => { o.phase.rows[0].season = "JFM 2027"; }, /needs the form/);
fx("a next bulletin dated before the issue", o => { o.status.next = "2026-11-01"; }, /next bulletin date comes before/);
fx("an editorial check dated before the bulletin", o => { o.checked = "2026-11-01"; }, /dated before the bulletin/);
fx("a stale bulletin left among current ones", o => { o.others.push({ issuer: "Old", title: "Old", issued: "2026-06-01", kind: "Forecast", period: "June to August 2026", geography: "x", index: "x", says: "x", url: "https://example.org/", claims: ["e-mss"] }); }, /older than three months/);
fx("a bulletin with no kind of statement", o => { o.others[0].kind = "Advice"; }, /kind must be/);
ok(EO.crossYear("November 2026 to January 2027") && !EO.crossYear("November to January 2027") && EO.crossYear("January to March 2027"), "cross-year rule: names both years only when the months run over the turn of the year");

// ---- 3. the same sentences on every page ----
const F = EO.facts();
const pages = { "/el-nino/": "el-nino/index.html", "/el-nino-and-cities/": "el-nino-and-cities/index.html", "/signals/": "signals/index.html", "/print/el-nino-briefing/": "print/el-nino-briefing/index.html" };
const H = Object.fromEntries(Object.entries(pages).map(([u, f]) => [u, dec(read(f))]));
for (const [u, h] of Object.entries(H)) ok(h.length > 1000, `${u} is built (node tools/build-static.js)`);
const need = { "/el-nino/": ["status", "phase", "strength", "transition", "historic", "reading", "uncertain"], "/signals/": ["phase", "reading", "uncertain", "unchanged"],
  "/el-nino-and-cities/": ["phase"], "/print/el-nino-briefing/": ["status", "strength", "reading", "limit"] };
for (const [u, keys] of Object.entries(need)) for (const k of keys) ok(F[k] && H[u].includes(F[k]), `${u} carries the shared "${k}" sentence word for word (tools/enso-outlook.js facts())`);
for (const [u, h] of Object.entries(H)) ok(h.includes(S.label) && h.includes(EO.date(S.issued)), `${u} names the official status (${S.label}) and the bulletin's issue date (${EO.date(S.issued)})`);
const llms = dec(read("llms-full.txt"));
ok(llms.includes(F.phase) && llms.includes(F.reading), "llms-full.txt carries the same phase sentence and reading");
// no stray outlook numbers typed into page words: the explainer's and the cities guide's words get them from the record
const words = read("tools/el-nino-explainer-text.js") + read("tools/el-nino-text.js");
ok(!/80% for March to May|weak 53%|38% for April to June|about a 60% chance/.test(words), "no outlook probability is typed into the page words (they come from facts())");

// ---- 4. dates kept apart ----
ok(H["/signals/"].includes(`Strength: ${S.forecast_period}`) && H["/el-nino/"].includes(`Strength: ${S.forecast_period}`), "the watch shows the forecast period apart from the issue date");
ok(H["/el-nino/"].includes("not the three-month RONI"), "the observed weekly Niño-3.4 figure is labelled as weekly, not the three-month index");
const today = new Date().toISOString().slice(0, 10), todayLong = EO.date(today);
ok(!/Updated today|Page updated|Last updated/i.test(H["/el-nino/"] + H["/print/el-nino-briefing/"]), "no 'updated today' banner on the explainer or the briefing");
ok(!H["/print/el-nino-briefing/"].includes(`Printed ${todayLong}`), "the briefing prints no build date");

// ---- 5. anchors and the journey ----
const anchors = { "el-nino/index.html": ["outlook", "prepare", "regions", "faq", "sources"], "signals/index.html": ["el-nino-watch", "cop31"], "el-nino-and-cities/index.html": ["outlook", "protections", "protect-work", "protect-home", "protect-care", "protect-school", "windows", "window-before", "window-weeks", "window-warning", "window-during", "window-after", "school", "market", "handout"], "heat-tools/index.html": ["el-nino", "el-nino-a", "el-nino-b", "el-nino-c", "el-nino-d", "el-nino-e", "pathways", "path-enso-season"] };
for (const [f, ids] of Object.entries(anchors)) for (const id of ids) ok(read(f).includes(`id="${id}"`), `${f} keeps the anchor #${id}`);
ok(/href="\/el-nino-and-cities\/"/.test(read("el-nino/index.html")) && /href="\/heat-tools\/#el-nino"/.test(read("el-nino/index.html")) && /href="\/print\/el-nino-briefing\/"/.test(read("el-nino/index.html")), "the explainer leads on to the cities guide, the tools route and the briefing");
ok(/href="\/el-nino\/"/.test(read("signals/index.html")) && /href="\/print\/el-nino-briefing\/"/.test(read("signals/index.html")), "the watch leads to the explainer and the briefing");
ok(/beattheheat\.asia\/el-nino/.test(read("print/el-nino-briefing/index.html")), "the briefing points back to the online explainer");
ok(/href="\/heat-tools\/#el-nino"/.test(read("el-nino-and-cities/index.html")), "the cities guide leads to the tools route");
const CAT = JSON.parse(read("data/heat-tools/catalogue.json"));
const route = CAT.records.filter(r => r.seasonal && r.seasonal.route);
ok(["A", "B", "C", "D", "E"].every(k => route.some(r => r.seasonal.route === k)), "the tools route has at least one tool for each horizon (A to E)");
ok(route.every(r => r.seasonal.decision && r.seasonal.lead_time && r.seasonal.update_frequency && r.seasonal.product && r.links.primary_url), "every route tool states its decision, lead time, update frequency, product kind and official link");
ok(route.filter(r => r.origin === "external").every(r => /^https:\/\//.test(r.links.primary_url) && !/^https:\/\/[^/]+\/?$/.test(r.links.primary_url)), "outside route tools link to a product page, not a bare homepage");

// ---- 6. an overdue bulletin reads as due, never as newly checked ----
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const late = dec(EO.panel(esc, { today: S.next }));
ok(/has not yet been checked here/.test(late) && late.includes(EO.date(S.issued)), "after the next bulletin's date, the panel says it is due and not yet checked, and keeps the last verified bulletin");
const early = dec(EO.panel(esc, { today: S.issued }));
ok(!/has not yet been checked/.test(early), "before that date, the panel names the next bulletin without calling it overdue");

console.log(bad ? `enso check: ${bad} failing` : `enso check passed: one outlook record (${O.others.length + 1} bulletins, ${(O.history || []).length} in history), the same status sentences on four pages and in llms-full.txt, record rules tested on fixtures, anchors and the journey between pages`);
process.exit(bad ? 1 : 0);
