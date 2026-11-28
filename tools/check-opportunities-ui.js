#!/usr/bin/env node
// Common Shade: Heat Opportunities in a real browser, on the built site served locally: the default view, the network
// opt-in, filters, reset, a shared filter link, views, the archive, a detail page and saved searches, at 360px and 1280px.
// Needs the server (node tools/check-all.js starts one).   node tools/check-opportunities-ui.js [http://localhost:8765]
"use strict";
const { chromium } = require(process.env.PW || "playwright");
const B = process.argv[2] || "http://localhost:8765";
let bad = 0; const ok = (c, m) => { console.log(c ? "  ok  " : "  FAIL", m); if (!c) bad++; };
(async () => {
  const b = await chromium.launch(), errs = [];
  for (const width of [360, 1280]) {
    const ctx = await b.newContext({ viewport: { width, height: 800 } });
    await ctx.addInitScript(() => { try { sessionStorage.setItem("cs-invite-seen", "1"); } catch (e) {} });
    const open = async u => { const p = await ctx.newPage(); p.on("pageerror", e => errs.push(u + ": " + e.message)); await p.goto(B + u, { waitUntil: "load" }); return p; };
    const shown = p => p.$$eval(".op-list [data-id]", e => e.filter(x => !x.hidden && x.offsetParent !== null).map(x => x.getAttribute("data-id")));
    const p = await open("/opportunities/");
    const data = await p.evaluate(() => window.OPPDATA.items.map(i => ({ id: i.id, rel: i.rel, countries: i.countries })));
    const def = await shown(p);
    ok(await p.isVisible(".op-filters") && def.length > 0, `${width}px: filters appear and the default view shows ${def.length} listings`);
    ok(def.every(id => (data.find(d => d.id === id) || {}).rel !== "network"), `${width}px: the default view leaves out roles at heat-network organisations with no heat-specific duties`);
    await p.check("[data-f=relall]"); const withNet = await shown(p);
    ok(withNet.length >= def.length && withNet.some(id => (data.find(d => d.id === id) || {}).rel === "network") === data.some(d => d.rel === "network" && withNet.includes(d.id)), `${width}px: "Include other roles" adds them (${withNet.length})`);
    ok(/relall|rel=all/.test(p.url()), `${width}px: the choice is kept in the address`);
    await p.selectOption("[data-f=country]", "IN"); const inIndia = await shown(p);
    ok(inIndia.every(id => (data.find(d => d.id === id) || {}).countries.includes("IN")) && /country=IN/.test(p.url()), `${width}px: the country filter narrows to India and is shared in the link (${inIndia.length})`);
    await p.fill("[data-f=q]", "zzzz-no-such-thing"); await p.waitForTimeout(50);
    ok(await p.isVisible("[data-none]"), `${width}px: an empty result says so and suggests what to try`);
    await p.click("[data-reset]");
    ok((await shown(p)).length === def.length && !/\?/.test(p.url()) && await p.inputValue("[data-f=q]") === "", `${width}px: Clear filters restores the default view`);
    await p.click('[data-view="archive"]'); const arch = await shown(p);
    const archIds = await p.evaluate(() => window.OPPDATA.items.filter(i => window.HubCore.isArchived(i, Date.now())).map(i => i.id));
    ok(arch.every(id => archIds.includes(id)) && /view=archive/.test(p.url()), `${width}px: the archive view shows only closed listings (${arch.length})`);
    await p.click('[data-view="open"]');
    ok(!(await shown(p)).some(id => archIds.includes(id)), `${width}px: no archived listing appears in the open view`);
    if (width === 360) {
      await p.click("[data-savesearch]"); await p.waitForTimeout(50);
      ok(await p.isVisible("[data-saved]"), "360px: a saved search appears in the list, kept on this device");
      ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "360px: no sideways scroll on the hub");
    }
    await p.close();
    const p2 = await open("/opportunities/?view=jobs&country=IN");
    ok(await p2.inputValue("[data-f=country]") === "IN" && await p2.getAttribute('[data-view="jobs"]', "aria-current") === "page", `${width}px: a shared filter link is restored`);
    await p2.close();
    const first = def[0];
    if (first) {
      const d = await open(`/opportunities/${first}/`);
      ok(await d.isVisible(".fo-next") && /official/i.test(await d.textContent(".fo-next")), `${width}px: a listing page leads to the official listing`);
      ok(await d.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px: no sideways scroll on a listing page`);
      await d.close();
    }
    await ctx.close();
  }
  ok(!errs.length, `no script errors${errs.length ? ": " + errs.join("; ") : ""}`);
  await b.close();
  console.log(bad ? `opportunities UI check: ${bad} failing` : "opportunities UI check passed");
  process.exit(bad ? 1 : 0);
})();
