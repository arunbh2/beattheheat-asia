#!/usr/bin/env node
// Common Shade: checks /heat-futures/. Each failure says what to fix.
//   1. the projected data (data/site/heat-futures.json): every city, indicator, scenario, period and percentile present,
//      p10 <= median <= p90, one grid cell per city, reference period and windows as labelled; a sample matches
//      research/2026-11/heat-futures/reproduce.json (an independent re-read of the source files)
//   2. the protection model (heat-futures/futures-core.js): the formula, coverage never above 100% or the ceiling, no
//      double counting, a later start never catching up by itself, the assumption range around the line
//   3. separation: protection settings never change the climate chart, the climate scenario never changes protection
//   4. the address: unknown values refused, valid ones restored
//   5. the page: evidence labels, time-window wording, no "business as usual", no probabilities for scenarios, no deaths
//      or costs, canonical without parameters, sources passed
//   node tools/check-heat-futures.js
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const F = require("../heat-futures/futures-core.js"), HS = require("./heat-interactives-sources.js");
const D = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "site", "heat-futures.json"), "utf8"));
let bad = 0; const ok = (c, m) => { console.log(c ? "  ok  " : "  FAIL", m); if (!c) bad++; };

// ---- 1. data ----
let missing = 0, order = 0;
for (const c of F.ENUM.city) for (const i of F.ENUM.ind) for (const [s, p] of [["historical", "1995-2014"], ...F.ENUM.sc.flatMap(x => F.ENUM.per.map(y => [x, y]))]) {
  const v = (((D.cities[c] || {}).values || {})[i] || {})[s]; const r = v && v[p];
  if (!r || ["p10", "median", "p90"].some(k => typeof r[k] !== "number")) { missing++; continue; }
  if (!(r.p10 <= r.median + 1e-9 && r.median <= r.p90 + 1e-9)) order++;
}
ok(missing === 0, `every city, measure, scenario, period and percentile is present (${missing} missing)`);
ok(order === 0, "10th percentile ≤ median ≤ 90th percentile everywhere");
ok(D.reference === "1995-2014" && JSON.stringify(D.periods) === JSON.stringify(["2020-2039", "2040-2059"]), "reference 1995–2014 and windows 2020–2039, 2040–2059, as the page labels them");
ok(F.ENUM.city.every(c => D.cities[c].cell && D.cities[c].cell.km_from_centre <= 30), "each city has one grid cell within 30 km of its centre point");
const maxBy = i => Math.max(...F.ENUM.city.flatMap(c => Object.values(D.cities[c].values[i]).flatMap(o => Object.values(o).map(r => r.p90))));
const minBy = i => Math.min(...F.ENUM.city.flatMap(c => Object.values(D.cities[c].values[i]).flatMap(o => Object.values(o).map(r => r.p10))));
for (const i of F.ENUM.ind) ok(maxBy(i) <= F.IND[i].hi && minBy(i) >= F.IND[i].lo, `${i}: every value fits the fixed axis ${F.IND[i].lo} to ${F.IND[i].hi}, so nothing is clipped`);
const RP = path.join(ROOT, "research", "2026-11", "heat-futures", "reproduce.json");
if (fs.existsSync(RP)) { const rp = JSON.parse(fs.readFileSync(RP, "utf8")); const diff = rp.samples.filter(s => Math.abs(D.cities[s.city].values[s.ind][s.scen][s.period][s.pct] - s.value) > 0.01); ok(rp.samples.length >= 5 && diff.length === 0, `${rp.samples.length} values independently re-read from the source files match`); }
else ok(false, "research/2026-11/heat-futures/reproduce.json is missing (run reproduce.py)");

// ---- 2. protection model ----
const p = { start: 2030, lead: 2, pace: 10, ceil: 80, rel: 50, use: 50 };
ok(F.nominal(p, 2031) === 0 && F.nominal(p, 2032) === 10 && F.nominal(p, 2040) === 80 && F.nominal(p, 2050) === 80, "nominal reach: zero before start + lead, then pace a year, up to the ceiling");
ok(Math.abs(F.usable(p, 2050) - 20) < 1e-9, "usable = nominal × reliability × ability to use (80% × 50% × 50% = 20%)");
let over = 0; for (let s = 2026; s <= 2045; s++) for (const pace of [1, 25]) for (const ceil of [10, 100]) for (const y of F.series({ start: s, lead: 0, pace, ceil, rel: 100, use: 100 })) if (y.nominal > ceil + 1e-9 || y.nominal > 100 || y.usable > y.nominal + 1e-9) over++;
ok(over === 0, "coverage never exceeds the ceiling or 100%, and usable never exceeds nominal (one group, nobody counted twice)");
const g = F.gapYears({ start: 2026, lead: 0, pace: 100 > 25 ? 25 : 25, ceil: 100, rel: 100, use: 100 });
ok(Math.abs(F.gapYears({ start: 2045, lead: 6, pace: 1, ceil: 10, rel: 0, use: 0 }) - 25) < 1e-9 && g > 0 && g < 25, "years without usable protection run from 0 to 25 over 2026–2050");
const d = F.delay(Object.assign({}, p, { pace: 3 }), 2038);
ok(d.extraGapYears > 0 && d.reach2050.later <= d.reach2050.earlier && d.paceNeeded > 3, "a later start adds years without protection, reaches no more by 2050 by itself, and needs a faster pace to catch up");
const R = F.range(p); ok(F.usable(R.low, 2050) <= F.usable(p, 2050) && F.usable(R.high, 2050) >= F.usable(p, 2050), "the assumption range brackets the line");
ok(Object.values(F.PATHWAYS).every(x => F.valid(x)), "the three pathways' assumptions are inside the allowed ranges");

// ---- 3. separation ----
const a = F.climateSvg(D, "delhi", "hd35", "ssp245", "2040-2059");
ok(a === F.climateSvg(D, "delhi", "hd35", "ssp245", "2040-2059") && F.climateSvg.length === 6 && !/ILLUSTRATIVE/.test(a) && /PROJECTED/.test(a), "the climate chart depends only on city, measure, scenario and period, and is labelled projected");
const pa = F.protectionSvg(F.PATHWAYS.uneven, null); ok(F.protectionSvg.length === 3 && /ILLUSTRATIVE/.test(pa) && !/PROJECTED/.test(pa), "the protection chart takes only its assumptions, a later start and a drawing width (no climate input), and is labelled illustrative");
const sv = F.climateSvg(D, "manila", "tr26", "ssp126", "2020-2039"), sv2 = F.climateSvg(D, "manila", "tr26", "ssp370", "2020-2039");
const ticks = s => (s.match(/class="hf-tick"[^>]*text-anchor="end">[^<]+/g) || []).join();
ok(ticks(sv) === ticks(sv2), "switching scenario keeps the same axis and units");

// ---- 4. the address ----
const q = s => F.fromQuery(new URLSearchParams(s));
const g1 = q("city=dhaka&ind=tr26&sc=ssp370&per=2020-2039&path=early&start=2030&lead=2&pace=6&ceil=80&rel=70&use=60&later=2040");
ok(g1.sel.city === "dhaka" && g1.sel.sc === "ssp370" && g1.prot.start === 2030 && g1.later === 2040 && !g1.bad.length, "a valid shared link restores the view and the assumptions");
const g2 = q("city=paris&ind=x&sc=ssp585&start=1999&pace=99&rel=50.5&later=abcd&use=<script>");
ok(g2.sel.city === F.DEF.city && g2.sel.sc === F.DEF.sc && g2.prot.start === F.PATHWAYS.uneven.start && g2.prot.rel === F.PATHWAYS.uneven.rel && g2.later === null && g2.bad.length === 8, "unknown or out-of-range values fall back to defaults and are named");
ok(F.toQuery(g1.sel, g1.prot, g1.later) === "city=dhaka&ind=tr26&sc=ssp370&per=2020-2039&path=early&start=2030&lead=2&pace=6&ceil=80&rel=70&use=60&later=2040", "the link written is the link read");

// ---- 5. the page ----
const html = fs.readFileSync(path.join(ROOT, "heat-futures", "index.html"), "utf8"), text = html.replace(/<!--csn-->[\s\S]*?<!--\/csn-->/g, "").replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ");
ok(/<link rel="canonical" href="https:\/\/beattheheat\.asia\/heat-futures\/">/.test(html), "canonical URL without parameters");
ok(/Projected/.test(text) && /Illustrative/.test(text) && /Observed/.test(text), "the three evidence labels are explained");
ok(/Around 2050: average for 2040–2059/.test(text) && /no 2035 window/.test(text), "time windows are labelled as 20-year averages, and the missing 2035 window is said plainly");
ok(!/business as usual|most likely scenario|current policies|uninhabitable|collapse score|countdown/i.test(text.replace("none is called “business as usual”", "")), "no “business as usual”, “most likely”, “uninhabitable” or collapse wording");
ok(!/\d+(\.\d+)?\s?% (chance|probability|likely)/i.test(text), "no probability attached to a scenario");
ok(!/\b(deaths? (avoided|prevented)|lives saved|lost work hours|income loss(es)? of|US\$|cost of \d)/i.test(text), "no deaths, work hours, income losses or costs estimated");
ok(/not illness, deaths or costs/.test(text), "the coverage measure says what it is not");
for (const k of ["cckp", "ipcc-spm"]) ok(HS.passed(k), `source ${k} passed the content check`);
ok(fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8").includes("<loc>https://beattheheat.asia/heat-futures/</loc>"), "the sitemap lists the page");
console.log(bad ? `heat futures check: ${bad} failing` : "heat futures check passed: data, protection model, separation, address, page wording and sources");
process.exit(bad ? 1 : 0);
