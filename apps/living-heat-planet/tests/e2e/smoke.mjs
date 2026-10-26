/**
 * Browser smoke tests (Playwright + Chromium) against the static build in browser mode.
 * Open-Meteo is intercepted with the labelled TEST FIXTURE where a test needs data, so the suite runs
 * where api.open-meteo.com is unreachable; failure tests use real aborts and HTTP errors.
 * Usage: BASE_URL=http://localhost:8765/living-heat-planet/ node tests/e2e/smoke.mjs
 */
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { currentResponse, forecastResponse, fixtureTemp } from "../fixtures/openMeteoFixture.mjs";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || "playwright");
const BASE = process.env.BASE_URL || "http://localhost:8765/living-heat-planet/";
const SHOTS = new URL("../../docs/screenshots/", import.meta.url).pathname; mkdirSync(SHOTS, { recursive: true });
const ARGS = ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"];
const results = []; let failed = 0;
const check = (name, ok, detail = "") => { results.push({ name, ok: !!ok, detail }); if (!ok) failed++; console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`); };
const caps = (await import("../../src/data/capitals.json", { with: { type: "json" } })).default.capitals;
const KTM = caps.find(c => c.id === "npl-kathmandu");

async function page(b, { w = 1440, h = 900, mode = "fixture", reduced = false, query = "" } = {}) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: reduced ? "reduce" : "no-preference" });
  const p = await ctx.newPage(), errors = [], requests = [];
  p.on("pageerror", e => errors.push(e.message)); p.on("console", m => { if (m.type() === "error" && !/net::ERR|Failed to load resource/.test(m.text())) errors.push(m.text()); });
  let n = 0;
  await p.route("https://api.open-meteo.com/**", async route => {
    const url = route.request().url(); requests.push(url); n++;
    if (mode === "down") return route.abort("failed");
    if (mode === "429-once" && n === 1) return route.fulfill({ status: 429, body: "{}" });
    // the second batch (capitals 26–50) stays down through every retry
    if (mode === "partial" && !url.includes("hourly=") && new URL(url).searchParams.get("latitude").startsWith(caps[25].lat.toFixed(4) + ",")) return route.fulfill({ status: 503, body: "{}" });
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(url.includes("hourly=") ? forecastResponse(url) : currentResponse(url)) });
  });
  await p.goto(BASE + query);
  return { p, ctx, errors, requests };
}
const ready = p => p.waitForFunction(() => document.documentElement.dataset.landPoints && document.documentElement.dataset.webgl === "ready", null, { timeout: 30000 });
const chip = p => p.textContent('[data-testid="status-chip"]');
const overflow = p => p.evaluate(() => document.documentElement.scrollWidth - innerWidth);

const b = await chromium.launch({ args: ARGS });
try {
  // 1. Desktop journey with data
  {
    const { p, ctx, errors, requests } = await page(b);
    await ready(p); await p.waitForFunction(() => /Live/.test(document.querySelector('[data-testid="status-chip"]')?.textContent || ""), null, { timeout: 20000 });
    check("land particles render from Natural Earth data", Number(await p.evaluate(() => document.documentElement.dataset.landPoints)) > 64000);
    const cur = requests.filter(u => !u.includes("hourly="));
    check("capitals fetched in batches of at most 25", cur.length === Math.ceil(caps.length / 25) && cur.every(u => new URL(u).searchParams.get("latitude").split(",").length <= 25), `${cur.length} requests`);
    check("status chip reports live capitals", /Live · 207\/207/.test(await chip(p)), await chip(p));
    await p.waitForTimeout(800); await p.screenshot({ path: SHOTS + "desktop-1440.png" });
    // idle spin is on
    const y0 = await p.evaluate(() => window.__lhp.ctl.yaw); await p.waitForTimeout(1200);
    check("globe spins slowly when idle", (await p.evaluate(() => window.__lhp.ctl.yaw)) > y0);
    // search with a partial, accent-free name and keyboard
    await p.fill('input[type="search"]', "kathm"); await p.keyboard.press("Enter");
    await p.waitForSelector('[data-city="npl-kathmandu"]'); await p.waitForTimeout(2200);
    check("search focuses Kathmandu and opens its dossier", (await p.textContent("#dossier-title")) === "Kathmandu");
    const pos = await p.evaluate(() => window.__lhp.ctl.project("npl-kathmandu")), centre = await p.evaluate(() => { const c = document.querySelector("canvas").getBoundingClientRect(); return { x: c.left + c.width / 2, y: c.top + c.height / 2 }; });
    const g = await p.evaluate(() => ({ x: window.__lhp.ctl.offset.x }));
    check("the globe turns Kathmandu to face the viewer", pos.visible && Math.abs(pos.y - centre.y) < 30, `projected ${Math.round(pos.x)},${Math.round(pos.y)}; globe offset ${g.x.toFixed(2)}`);
    await p.waitForFunction(() => window.__lhp.ctl.anim === null, null, { timeout: 15000 });
    check("spin pauses while a dossier is open", await p.evaluate(async () => { const a = window.__lhp.ctl.yaw; await new Promise(r => setTimeout(r, 900)); return Math.abs(window.__lhp.ctl.yaw - a) < 1e-6; }));
    const want = `${Math.round(fixtureTemp(KTM.lat, KTM.lon))}°C`;
    check("Now shows the exact upstream value and its source", (await p.textContent('[data-testid="now-temp"]')) === want && /Modelled current conditions · Open-Meteo/.test(await p.textContent(".dossier__body")), want);
    check("no invented official warning", /Official warning status not integrated/.test(await p.textContent(".dossier__body")));
    await p.screenshot({ path: SHOTS + "desktop-dossier-now.png" });
    await p.click("#tab-next"); await p.waitForSelector("svg[data-points]");
    check("72-hour forecast plots 72 hourly points", (await p.getAttribute("svg[data-points]", "data-points")) === "72");
    await p.screenshot({ path: SHOTS + "desktop-dossier-72h.png" });
    for (const [tab, re] of [["patterns", /Not integrated in this release/], ["people", /Not integrated in this release/], ["preparedness", /No verified record in the platform/], ["solutions", /No verified record in the platform/], ["investment", /No verified record in the platform/]]) {
      await p.click(`#tab-${tab}`); await p.waitForTimeout(150); const t = await p.textContent(".dossier__body");
      check(`${tab} tab shows its evidence state without fake metrics`, re.test(t) && !/score|\b0%|\b0 people/i.test(t));
    }
    await p.screenshot({ path: SHOTS + "desktop-dossier-people.png" });
    // units
    await p.click("#tab-now"); await p.click('button[role="radio"]:has-text("°F")');
    const f = `${Math.round(fixtureTemp(KTM.lat, KTM.lon) * 9 / 5 + 32)}°F`;
    check("°F changes the numbers shown", (await p.textContent('[data-testid="now-temp"]')) === f, f);
    await p.click('button[role="radio"]:has-text("°C")');
    // compare four
    for (const q of ["Dhaka", "New Delhi", "Bangkok"]) { await p.click('button:has-text("Add to compare")'); await p.fill('input[type="search"]', q); await p.keyboard.press("Enter"); await p.waitForTimeout(400); }
    await p.click('button:has-text("Add to compare")'); await p.click('button:has-text("Compare 4")');
    await p.waitForSelector(".compare tbody tr");
    check("compare shows four capitals, explicitly not a risk ranking", (await p.locator(".compare tbody tr").count()) === 4 && /not a ranking of heat risk/.test(await p.textContent(".modal__body")));
    await p.waitForTimeout(800); await p.screenshot({ path: SHOTS + "desktop-compare.png" });
    await p.keyboard.press("Escape");
    await p.click('button:has-text("Methods & data")'); check("methods panel lists sources and the licence note", /Natural Earth/.test(await p.textContent(".modal__body")) && /non-commercial/.test(await p.textContent(".modal__body")));
    await p.keyboard.press("Escape");
    await p.click('button:has-text("Why temperature is not risk")'); check("explainer is substantive", (await p.textContent(".modal__body")).length > 1500);
    await p.keyboard.press("Escape"); await p.keyboard.press("Escape");
    check("Escape closes the dossier", (await p.locator(".dossier").count()) === 0);
    check("no page errors on the desktop journey", errors.length === 0, errors.join(" | "));
    await ctx.close();
  }
  // 2. Picking, occlusion, tap vs drag, inertia
  {
    const { p, ctx } = await page(b, { reduced: true }); await ready(p); await p.waitForTimeout(1500);
    const far = await p.evaluate(() => window.__lhp.ctl.project("usa-washington-d-c")), near = await p.evaluate(() => window.__lhp.ctl.project("ind-new-delhi"));
    check("a far-side capital is reported hidden", far && far.visible === false);
    await p.mouse.click(far.x, far.y); await p.waitForTimeout(300);
    check("clicking where a far-side capital projects does not select it", (await p.locator('[data-city="usa-washington-d-c"]').count()) === 0);
    await p.mouse.click(near.x, near.y); await p.waitForSelector(".dossier", { timeout: 3000 }).catch(() => {});
    check("tapping a visible capital selects it", (await p.textContent("#dossier-title").catch(() => "")) === "New Delhi");
    await p.keyboard.press("Escape"); await p.waitForTimeout(300);
    const c = await p.evaluate(() => { const r = document.querySelector("canvas").getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    await p.mouse.move(c.x, c.y); await p.mouse.down(); await p.mouse.move(c.x + 3, c.y + 2); await p.mouse.up(); await p.waitForTimeout(200);
    check("a 3 px jitter counts as a tap, not a drag", await p.evaluate(() => window.__lhp.ctl.velYaw === 0));
    await ctx.close();
    const full = await page(b); await ready(full.p); await full.p.waitForTimeout(800);
    const r = await full.p.evaluate(() => { const r = document.querySelector("canvas").getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    await full.p.mouse.move(r.x - 150, r.y); await full.p.mouse.down();
    for (let i = 1; i <= 8; i++) { await full.p.mouse.move(r.x - 150 + i * 40, r.y); await full.p.waitForTimeout(12); }
    await full.p.mouse.up();
    const v1 = await full.p.evaluate(() => window.__lhp.ctl.velYaw); await full.p.waitForTimeout(500); const v2 = await full.p.evaluate(() => window.__lhp.ctl.velYaw);
    const rest = await full.p.waitForFunction(() => window.__lhp.ctl.velYaw === 0, null, { timeout: 15000 }).then(() => true, () => false);
    check("a fling keeps spinning, slows, and comes to rest", v1 > 0.3 && v2 > 0 && v2 < v1 && rest, `${v1.toFixed(2)} → ${v2.toFixed(2)} → rest: ${rest}`);
    await full.ctx.close();
  }
  // 3. Reduced motion
  {
    const { p, ctx } = await page(b, { reduced: true }); await ready(p); await p.waitForTimeout(800);
    const a = await p.evaluate(() => window.__lhp.ctl.yaw); await p.waitForTimeout(1500);
    check("reduced motion: no idle spin", Math.abs((await p.evaluate(() => window.__lhp.ctl.yaw)) - a) < 1e-6);
    check("reduced motion: controls say motion is paused", /Motion paused/.test(await p.textContent(".toolrow")));
    await ctx.close();
  }
  // 4. Viewports
  for (const [w, h, name] of [[390, 844, "mobile-390"], [768, 1024, "tablet-768"], [1440, 900, "desktop-1440b"]]) {
    const { p, ctx } = await page(b, { w, h }); await ready(p); await p.waitForTimeout(1200);
    const boxes = await p.evaluate(() => [".top__tools", ".legend", ".chip"].map(s => { const r = document.querySelector(s).getBoundingClientRect(); return { s, t: r.top, b: r.bottom, l: r.left, r: r.right }; }));
    const overlap = boxes[0].b > boxes[1].t && boxes[0].t < boxes[1].b && boxes[0].r > boxes[1].l && boxes[0].l < boxes[1].r;
    check(`${name}: no horizontal overflow and controls do not overlap`, (await overflow(p)) <= 0 && !overlap);
    if (w !== 1440) await p.screenshot({ path: SHOTS + `${name}.png` });
    if (w === 390) { await p.fill('input[type="search"]', "Dhaka"); await p.keyboard.press("Enter"); await p.waitForSelector(".dossier--drawer"); await p.waitForTimeout(1600);
      const d = await p.evaluate(() => { const r = document.querySelector(".dossier").getBoundingClientRect(); return { top: r.top, bottom: r.bottom, h: innerHeight }; });
      check("mobile: dossier opens as a bottom drawer within the screen", d.bottom <= d.h + 1 && d.top > d.h * 0.3, JSON.stringify(d)); await p.screenshot({ path: SHOTS + "mobile-390-dossier.png" }); }
    await ctx.close();
  }
  // 5. Failure paths
  {
    const { p, ctx, errors } = await page(b, { mode: "down" }); await ready(p);
    await p.waitForFunction(() => /unavailable/.test(document.querySelector('[data-testid="status-chip"]')?.textContent || ""), null, { timeout: 30000 });
    check("upstream down: globe still renders and says Current data unavailable", /Current data unavailable/.test(await chip(p)) && Number(await p.evaluate(() => document.documentElement.dataset.landPoints)) > 0);
    await p.fill('input[type="search"]', "Bangkok"); await p.keyboard.press("Enter"); await p.waitForSelector(".dossier");
    check("upstream down: dossier shows no temperature", (await p.locator('[data-testid="now-temp"]').count()) === 0 && /Current data unavailable/.test(await p.textContent(".dossier")));
    await p.click("#tab-next"); await p.waitForSelector("text=Forecast unavailable", { timeout: 20000 }).catch(() => {});
    check("upstream down: forecast says unavailable, not guessed", /Forecast unavailable/.test(await p.textContent(".dossier__body")));
    await p.screenshot({ path: SHOTS + "failure-unavailable.png" });
    check("no page errors when upstream is down", errors.length === 0, errors.join(" | ")); await ctx.close();
  }
  {
    const { p, ctx } = await page(b, { mode: "429-once" }); await ready(p);
    await p.waitForFunction(() => /Live/.test(document.querySelector('[data-testid="status-chip"]')?.textContent || ""), null, { timeout: 30000 }).catch(() => {});
    check("a 429 is retried with backoff and the data arrives", /Live · 207\/207/.test(await chip(p)), await chip(p)); await ctx.close();
  }
  {
    const { p, ctx } = await page(b, { mode: "partial" }); await ready(p);
    await p.waitForFunction(() => /Live|stale/.test(document.querySelector('[data-testid="status-chip"]')?.textContent || ""), null, { timeout: 40000 }).catch(() => {});
    check("one failed batch leaves 25 capitals unavailable and the rest live", /182\/207/.test(await chip(p)), await chip(p)); await ctx.close();
  }
  // 6. No WebGL
  {
    const nb = await chromium.launch({ args: ["--disable-webgl", "--disable-3d-apis", "--disable-gpu"] });
    const ctx = await nb.newContext({ viewport: { width: 1280, height: 800 } }), p = await ctx.newPage();
    await p.route("https://api.open-meteo.com/**", r => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(currentResponse(r.request().url())) }));
    await p.goto(BASE); await p.waitForSelector(".fallback .citytable tbody tr", { timeout: 20000 }).catch(() => {});
    check("without WebGL: 2D map and full capital table", (await p.locator(".fallback .citytable tbody tr").count()) === caps.length && (await p.locator("canvas.map2d").count()) === 1);
    await p.waitForTimeout(800); await p.screenshot({ path: SHOTS + "fallback-2d.png" }); await nb.close();
  }
  // 7. Embed mode and keyboard reach
  {
    const { p, ctx } = await page(b, { w: 760, h: 560, query: "?embed=hero" }); await ready(p); await p.waitForTimeout(1000);
    check("embed mode hides the page title and links to the full planet", (await p.locator("h1").count()) === 0 && (await p.locator('a:has-text("Open the full planet")').count()) === 1);
    await p.screenshot({ path: SHOTS + "embed-hero.png" });
    await p.keyboard.press("Tab"); await p.keyboard.press("Enter"); await p.waitForTimeout(100);
    check("skip link moves keyboard focus to the controls", await p.evaluate(() => location.hash === "#controls"));
    await ctx.close();
  }
} finally { await b.close(); }
writeFileSync(new URL("../../docs/e2e-results.json", import.meta.url), JSON.stringify({ ranAt: new Date().toISOString(), base: BASE, passed: results.filter(r => r.ok).length, failed, results }, null, 1));
console.log(`\n${results.length - failed}/${results.length} browser checks passed`);
process.exit(failed ? 1 : 0);
