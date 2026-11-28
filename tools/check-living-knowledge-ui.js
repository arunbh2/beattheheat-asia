#!/usr/bin/env node
// Common Shade: Living Knowledge in a real browser, on the built site served locally: filters and their shared links, reset,
// the comparison tray and table, the fit questions with their reasons, a record page and print button, keyboard focus, and no
// sideways scroll at 360px and 1280px. Needs the server (node tools/check-all.js starts one).
//   node tools/check-living-knowledge-ui.js [http://localhost:8765]
"use strict";
const { chromium } = require(process.env.PW || "playwright");
const B = process.argv[2] || "http://localhost:8765";
let bad = 0; const ok = (c, m) => { console.log(c ? "  ok  " : "  FAIL", m); if (!c) bad++; };
(async () => {
  const b = await chromium.launch(), errs = [];
  for (const width of [360, 1280]) {
    const ctx = await b.newContext({ viewport: { width, height: 820 } });
    await ctx.addInitScript(() => { try { sessionStorage.setItem("cs-invite-seen", "1"); localStorage.removeItem("cs-lk-compare"); localStorage.removeItem("cs-lk-fit"); } catch (e) {} });
    const open = async u => { const p = await ctx.newPage(); p.on("pageerror", e => errs.push(u + ": " + e.message)); await p.goto(B + u, { waitUntil: "load" }); return p; };
    const shown = p => p.$$eval(".lk-grid [data-id]", e => e.filter(x => !x.hidden).map(x => x.getAttribute("data-id")));
    const p = await open("/living-knowledge/");
    const all = await shown(p), data = await p.evaluate(() => window.LKDATA.practices.map(x => ({ id: x.id, domain: x.domain, fit: x.fit })));
    ok(all.length > 0 && await p.isVisible(".lk-filters"), `${width}px: filters appear and ${all.length} practices show`);
    const dom = data[0] && data[0].domain;
    if (dom) { await p.selectOption("[data-f=domain]", dom); const f = await shown(p);
      ok(f.length > 0 && f.every(id => data.find(d => d.id === id).domain === dom) && new RegExp("domain=" + dom).test(p.url()), `${width}px: the domain filter narrows the list and is kept in the address`);
      ok(/practice/.test(await p.textContent("[data-count]")), `${width}px: the result count is announced`); }
    await p.fill("[data-f=q]", "zzzz-nothing"); await p.waitForTimeout(30);
    ok(await p.isVisible("[data-none]"), `${width}px: an empty result says so and points to the gaps`);
    await p.click("[data-reset]");
    ok((await shown(p)).length === all.length && !/\?/.test(p.url()), `${width}px: Clear filters restores every practice`);
    // keyboard: the search box takes focus with a visible outline
    await p.focus("[data-f=q]"); const outline = await p.evaluate(() => getComputedStyle(document.activeElement).outlineStyle + "|" + getComputedStyle(document.activeElement).boxShadow);
    ok(outline !== "none|none", `${width}px: the search box shows focus`);
    // compare two
    const btns = await p.$$("[data-compare]"); if (btns.length >= 2) { await btns[0].click(); await btns[1].click(); }
    ok(await p.isVisible("[data-tray]") && /2 of 4/.test(await p.textContent("[data-tray-list]")), `${width}px: the comparison tray shows the two chosen practices`);
    const href = await p.getAttribute("[data-tray-go]", "href");
    if (width === 360) ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "360px: no sideways scroll on the browse page");
    await p.close();
    const c = await open(href);
    const cols = await c.$$eval(".lk-compare thead th", e => e.length);
    ok(cols === 3, `${width}px: the comparison table has a column for each chosen practice`);
    ok(!/undefined|NaN/.test(await c.textContent("[data-compare-out]")), `${width}px: the comparison shows no undefined or NaN values`);
    await c.close();
    // fit questions
    const fz = await open("/living-knowledge/fit/");
    await fz.check('input[name="humidity"][value="humid"]');
    const flagged = await fz.$$eval(".lk-limit", e => e.length), dryCount = data.filter(d => d.fit.humidity === "dry").length;
    ok(flagged >= dryCount && /may fit/.test(await fz.textContent("[data-fit-count]")), `${width}px: humid heat flags every dry-air practice with a reason (${flagged})`);
    await fz.check('input[name="setting"][value="livestock"]');
    const n = await fz.$$eval(".lk-fitres", e => e.length); ok(n > 0 && n < data.length, `${width}px: choosing a setting leaves out practices documented elsewhere`);
    await fz.close();
    // a record page
    const r = await open(`/living-knowledge/${all[0]}/`);
    ok(await r.isVisible("text=What makes this possible?") && await r.isVisible("[data-print]"), `${width}px: a record page shows the enabling conditions and a print button`);
    if (width === 360) ok(await r.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "360px: no sideways scroll on a record page");
    await r.close(); await ctx.close();
  }
  ok(!errs.length, `no script errors${errs.length ? ": " + errs.join("; ") : ""}`);
  await b.close();
  console.log(bad ? `living knowledge UI check: ${bad} failing` : "living knowledge UI check passed");
  process.exit(bad ? 1 : 0);
})();
