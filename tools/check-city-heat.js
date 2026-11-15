#!/usr/bin/env node
// Common Shade: checks the heat-stress estimate on city pages and the homepage city view.
//   1. the formula in city-heat/heat-core.js uses the constants printed in its checked source (data/inbox/2026-11-city-heat/);
//   2. worked values, worked by hand from that published formula;
//   3. script.js's copies (wbgtEst, heatIndex) give the same numbers as heat-core.js;
//   4. daily peaks group hours by local day and skip days before today;
//   5. every city has an official warning link, and every city page carries the block, its data and its scripts;
//   6. every source the words cite opened with all its terms found.
// With --live (or on GitHub), also prints how far today's estimate for Singapore sits from NEA's highest measured WBGT,
// as information only: it never fails the check and is never shown on the site as a claim of accuracy.
// Usage: node tools/check-city-heat.js [--live]
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, ".."), H = require("../city-heat/heat-core.js");
const fails = [], fail = m => fails.push(m), near = (a, b, tol) => Math.abs(a - b) <= tol;
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, "data.js"), "utf8") + ";this.D={LIVE_CITIES,LIVE_WBGT,LIVE_LEVELS,LIVE_SOURCES}", ctx);
const D = ctx.D, INBOX = path.join(ROOT, "data", "inbox", "2026-11-city-heat");
const links = JSON.parse(fs.readFileSync(path.join(INBOX, "link-check.json"), "utf8")), ex = JSON.parse(fs.readFileSync(path.join(INBOX, "_excerpts.json"), "utf8"));

// 1. constants against the checked text of the Bureau of Meteorology's page
const bom = (ex["ch-bom-wbgt"] && ex["ch-bom-wbgt"].around || []).join(" ").replace(/\s+/g, " ");
if (!/WBGT = 0\.567 Ta \+ 0\.393 e \+ 3\.94/.test(bom)) fail("the checked source no longer shows WBGT = 0.567 Ta + 0.393 e + 3.94; re-read data/inbox/2026-11-city-heat/_excerpts.json");
if (!/6\.105 exp \( 17\.27 Ta \/ \( 237\.7 \+ Ta \) \)/.test(bom)) fail("the checked source no longer shows e = rh / 100 6.105 exp ( 17.27 Ta / ( 237.7 + Ta ) )");
const core = fs.readFileSync(path.join(ROOT, "city-heat", "heat-core.js"), "utf8");
if (!core.includes("0.567 * t + 0.393 * vapour(t, rh) + 3.94") || !core.includes("rh / 100 * 6.105 * Math.exp(17.27 * t / (237.7 + t))")) fail("city-heat/heat-core.js: wbgt() or vapour() differs from the published formula");

// 2. worked values (vapour pressure first, then WBGT), each worked by hand from the formula
[[30, 70, 29.60, 32.58], [35, 50, 28.01, 34.79], [25, 100, 31.58, 30.53], [40, 30, 22.04, 35.28]].forEach(([t, rh, e, w]) => {
  if (!near(H.vapour(t, rh), e, 0.02)) fail(`vapour(${t}, ${rh}) = ${H.vapour(t, rh).toFixed(3)}, worked value ${e}`);
  if (!near(H.wbgt(t, rh), w, 0.02)) fail(`wbgt(${t}, ${rh}) = ${H.wbgt(t, rh).toFixed(3)}, worked value ${w}`);
});

// 3. script.js keeps one-line copies; they agree with heat-core.js
const sj = fs.readFileSync(path.join(ROOT, "script.js"), "utf8");
const est = (sj.match(/const wbgtEst = (\(t, rh\) => [^;]+);/) || [])[1];
const hiSrc = (sj.match(/function heatIndex\(tc, rh\) \{[\s\S]*?\n  \}/) || [])[0];
if (!est) fail("script.js: no wbgtEst line found"); if (!hiSrc) fail("script.js: no heatIndex function found");
if (est && hiSrc) { const f = vm.runInNewContext(`(${est})`), g = vm.runInNewContext(`${hiSrc.trim()}\n;heatIndex`);
  for (let t = 15; t <= 46; t += 1.5) for (let rh = 5; rh <= 100; rh += 5) {
    if (!near(f(t, rh), H.wbgt(t, rh), 1e-9)) { fail(`script.js wbgtEst(${t}, ${rh}) differs from heat-core.js`); t = 99; break; }
    if (!near(g(t, rh), H.heatIndex(t, rh), 1e-9)) { fail(`script.js heatIndex(${t}, ${rh}) differs from heat-core.js`); t = 99; break; }
  } }

// 4. daily peaks: local days, today onwards, the hottest estimate in each
const hourly = { time: ["2026-11-14T13:00", "2026-11-15T09:00", "2026-11-15T14:00", "2026-11-15T15:00", "2026-11-16T13:00", "2026-11-16T14:00"],
  temperature_2m: [40, 28, 33, 34, 30, null], relative_humidity_2m: [50, 80, 60, 50, 70, 70] };
const pk = H.peaks(hourly, "2026-11-15", 4);
if (pk.length !== 2 || pk[0].date !== "2026-11-15" || pk[1].date !== "2026-11-16") fail("peaks(): wrong days " + JSON.stringify(pk.map(p => p.date)));
else { const want = Math.max(H.wbgt(28, 80), H.wbgt(33, 60), H.wbgt(34, 50)); if (!near(pk[0].wbgt, want, 1e-9) || pk[0].tmax !== 34) fail("peaks(): wrong peak for the first day"); if (pk[1].hour !== "13:00") fail("peaks(): a missing hour was counted"); }
if (H.band([[27, "a"], [33, "b"]], 26.9) !== -1 || H.band([[27, "a"], [33, "b"]], 33) !== 1) fail("band(): wrong level");

// 5. cities and their pages
for (const c of D.LIVE_CITIES) {
  if (!c.warn || !/^https:\/\//.test(c.warn.url || "") || !c.warn.label) fail(`${c.id}: no official warning link`);
  const f = path.join(ROOT, "cities", c.id, "index.html");
  if (!fs.existsSync(f)) { fail(`${c.id}: no city page`); continue; }
  const h = fs.readFileSync(f, "utf8");
  for (const [k, what] of [["data-city-heat", "the heat block"], ["window.CITY_HEAT=", "its data"], ["/city-heat/heat-core.js?v=", "heat-core.js"], ["/city-heat/city-heat.js?v=", "city-heat.js"], ['id="heat-today"', "the heat-today anchor"], [c.warn.url, "the warning link without JavaScript"]])
    if (!h.includes(k)) fail(`cities/${c.id}/: missing ${what}; rebuild with node tools/build-static.js`);
}

// 6. the sources the words cite passed the check
const src = JSON.parse(fs.readFileSync(path.join(INBOX, "sources.json"), "utf8"));
for (const u of [D.LIVE_WBGT.method.url, D.LIVE_WBGT.review.url]) {
  const r = src.find(x => x.url === u), st = links[u], terms = (links._terms || {})[u] || {};
  if (!r) fail(`LIVE_WBGT cites ${u}, which is not staged in data/inbox/2026-11-city-heat/`);
  else if (!/^(OK|REDIRECT)$/.test(st) || r.expect.some(t => !terms[t])) fail(`LIVE_WBGT cites ${u}, which did not pass the source check (${st})`);
}

(async () => {
  if (process.argv.includes("--live") || process.env.GITHUB_ACTIONS) {
    try {
      const sg = D.LIVE_CITIES.find(c => c.wbgt);
      const [m, n] = await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${sg.lat}&longitude=${sg.lon}&current=temperature_2m,relative_humidity_2m&timezone=auto`).then(r => r.json()),
        fetch("https://api-open.data.gov.sg/v2/real-time/api/weather?api=wbgt").then(r => r.json())]);
      const vals = JSON.stringify(n).match(/"wbgt":"([\d.]+)"/g).map(x => parseFloat(x.split('"')[3]));
      const e = H.wbgt(m.current.temperature_2m, m.current.relative_humidity_2m), top = Math.max(...vals);
      console.log(`  information: Singapore at ${m.current.time}, estimate ${e.toFixed(1)} °C (air ${m.current.temperature_2m} °C, ${m.current.relative_humidity_2m}%), NEA highest of ${vals.length} stations ${top.toFixed(1)} °C, difference ${(e - top).toFixed(1)} °C`);
    } catch (err) { console.log("  information: live comparison skipped (" + err.message + ")"); }
  }
  if (fails.length) { console.log(fails.map(x => "  FAIL " + x).join("\n")); console.log(`city heat check: ${fails.length} problem(s)`); process.exit(1); }
  console.log(`city heat check passed: formula matches its checked source, worked values, script.js copies agree, ${D.LIVE_CITIES.length} city pages carry the block`);
})();
