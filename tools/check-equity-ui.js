#!/usr/bin/env node
// Common Shade: the health and equity features in a real browser, on the built site served locally. Needs the server
// (node tools/check-all.js starts one).   node tools/check-equity-ui.js [http://localhost:8765]
"use strict";
const { chromium } = require(process.env.PW || "playwright");
const B = process.argv[2] || "http://localhost:8765";
let bad = 0; const ok = (c, m) => { console.log(c ? "  ok  " : "  FAIL", m); if (!c) bad++; };
(async () => {
  const b = await chromium.launch(), errs = [];
  const ctx = await b.newContext({ viewport: { width: 360, height: 780 } });
  await ctx.addInitScript(() => { try { sessionStorage.setItem("cs-invite-seen", "1"); } catch (e) {} });
  const open = async u => { const p = await ctx.newPage(); p.on("pageerror", e => errs.push(u + ": " + e.message)); await p.goto(B + u, { waitUntil: "load" }); return p; };
  const noScroll = async p => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth);

  // Solutions: the equity filter
  const s = await open("/solutions/");
  const count = () => s.textContent("#sol-count");
  await s.selectOption("#sol-eq", "v-earnings");
  const inc = await s.$$eval(".sol:not([hidden])", e => e.length);
  ok(inc > 0 && /of \d+ solutions/.test(await count()) && await s.$$eval(".sol:not([hidden]) .sol-why", e => e.length) === inc, `“Includes earnings protection” shows ${inc} solutions, each with the reason it is listed`);
  await s.selectOption("#sol-eqs", "any"); const any = await s.$$eval(".sol:not([hidden])", e => e.length);
  await s.selectOption("#sol-eqs", "na"); const na = await s.$$eval(".sol:not([hidden])", e => e.length);
  ok(any >= inc && any + na === 131, `“includes or names it” (${any}) and “not yet assessed” (${na}) together cover every solution, with none hidden as unsuitable`);
  await s.click("#sol-reset");
  ok(/^131 solutions/.test(await count()) && await s.inputValue("#sol-eq") === "", "Clear all filters brings back every solution");
  ok(await noScroll(s), "Solutions: no sideways scroll at 360px");
  await s.close();
  const s2 = await open("/solutions/?eq=v-reporting&eqs=any");
  ok(await s2.inputValue("#sol-eq") === "v-reporting" && /of \d+ solutions/.test(await s2.textContent("#sol-count")), "a shared filter link is restored");
  await s2.close();
  const s3 = await open("/solutions/?eq=<script>&eqs=zzz");
  ok(await s3.inputValue("#sol-eq") === "" && await s3.inputValue("#sol-eqs") === "inc", "invalid filter values in the address are ignored");
  await s3.close();

  // Plan: the equity check
  const p = await open("/plan/");
  await p.locator('label:has(input[name="eq-income"][value="no"])').click();
  await p.locator('label:has(input[name="eq-coverage"][value="nap"])').click();
  ok(await p.isVisible('[data-eq="coverage"] .eq-q__reason'), "choosing “Not applicable” asks for the reason");
  await p.fill('[data-eq="coverage"] [data-f="reason"]', "No workers in this setting");
  ok(/3 of 4 questions still open/.test(await p.textContent("#plan-equity-sum")), "the summary lists what is still open (no score)");
  await p.reload({ waitUntil: "load" });
  ok(await p.locator('input[name="eq-income"][value="no"]').isChecked() && await p.inputValue('[data-eq="coverage"] [data-f="reason"]') === "No workers in this setting", "answers persist in this browser");
  ok(await noScroll(p), "Plan: no sideways scroll at 360px");
  await p.close();

  // Archive: filter and compare
  const h = await open("/resources/heat-action-plans/india/");
  await h.selectOption("[data-hr-dim]", "maternal");
  ok(/1 of 14 dimensions/.test(await h.textContent("[data-hr-count]")), "the provision filter narrows to one dimension");
  const boxes = await h.$$("[data-hr-plan]"); for (const x of boxes.slice(0, 3)) await x.check(); await boxes[3].click();
  ok(await h.$$eval(".hr-table thead th[data-plan]:not([hidden])", e => e.length) === 3, "comparison is limited to three plans");
  await h.click("[data-hr-reset]");
  ok(/14 of 14/.test(await h.textContent("[data-hr-count]")), "Show everything resets the review table");
  ok(await noScroll(h), "Archive: no sideways scroll at 360px (the table scrolls inside its own region)");
  await h.close();

  // Flagships: tabs by keyboard, and the worker comparison
  const d = await open("/home-is-also-the-workplace/");
  await d.focus("#tab-morning"); await d.keyboard.press("ArrowRight");
  ok(await d.evaluate(() => document.activeElement.id) === "tab-paid" && await d.isVisible("#day-paid") && !(await d.isVisible("#day-morning")), "“A day in one home” tabs work with the arrow keys");
  ok(await noScroll(d), "Home page: no sideways scroll at 360px");
  await d.close();
  const r = await open("/rest-without-losing-income/");
  ok(/can use the shade and water/.test(await r.textContent(".he-usesum")), "with paid breaks and no constraints the worker can use the protection");
  await r.locator('label:has(input[name="use-pay"][value="piece"])').click();
  await r.locator('label:has(input[name="use-targets"][value="same"])').click();
  ok(/2 of the five arrangements stand in the way/.test(await r.textContent(".he-usesum")) && /Piece rates or targets adjusted/.test(await r.textContent('[data-f="pay"]')), "piece rates and unchanged targets show what stands in the way and what would change it");
  await r.emulateMedia({ media: "print" });
  ok(!(await r.isVisible(".he-use")), "the comparison controls are hidden in print");
  await r.close();
  ok(errs.length === 0, "no script errors" + (errs.length ? ": " + errs.join("; ") : ""));
  await b.close();
  console.log(bad ? `equity panels check: ${bad} failing` : "equity panels check passed: solutions filter, plan check, plan review, day-in-a-home tabs and worker comparison");
  process.exit(bad ? 1 : 0);
})().catch(e => { console.log("  FAIL the browser check could not run:", e.message); process.exit(1); });
