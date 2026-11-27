#!/usr/bin/env node
// Common Shade: /wet-bulb-wall/ and /heat-futures/ in a real browser (Playwright), on the built site served locally.
// City weather is intercepted and answered with SYNTHETIC records (never real weather), including a missing city and a
// failed request, so the states can be tested without the network. Needs the local server (node tools/check-all.js
// starts one).   node tools/check-interactives-ui.js [http://localhost:8765] [folder for screenshots]
"use strict";
const { chromium } = require(process.env.PW || "playwright");
const B = process.argv[2] || "http://localhost:8765", SHOTS = process.argv[3] || "";
let bad = 0; const ok = (c, m) => { console.log(c ? "  ok  " : "  FAIL", m); if (!c) bad++; };
const now = new Date(), pad = n => String(n).padStart(2, "0");
const localIso = off => { const d = new Date(now.getTime() + off * 1000); return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(Math.floor(d.getUTCMinutes() / 15) * 15)}`; };
const rec = (t, rh, off, tz) => ({ utc_offset_seconds: off, timezone: tz, timezone_abbreviation: "TEST", current_units: { temperature_2m: "°C", relative_humidity_2m: "%" }, current: { time: localIso(off), temperature_2m: t, relative_humidity_2m: rh, surface_pressure: 1005 } });
const SYNTH = [rec(31, 70, 19800, "Asia/Kolkata"), rec(22, 40, 19800, "Asia/Kolkata"), rec(30, 80, 21600, "Asia/Dhaka"), { utc_offset_seconds: 25200, current: { time: localIso(25200), temperature_2m: null, relative_humidity_2m: 75 } }, rec(32, 66, 25200, "Asia/Bangkok"), rec(31.5, 68, 28800, "Asia/Manila")];

(async () => {
  const b = await chromium.launch(), errs = [];
  const ctx = await b.newContext({ viewport: { width: 360, height: 780 }, permissions: ["clipboard-read", "clipboard-write"] });
  await ctx.route(/api\.open-meteo\.com/, r => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(SYNTH) }));
  const open = async (u, c = ctx) => { const p = await c.newPage(); p.on("pageerror", e => errs.push(u + ": " + e.message)); await p.goto(B + u, { waitUntil: "networkidle" }); return p; };

  // ---- the wet-bulb wall ----
  const p = await open("/wet-bulb-wall/");
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "wet-bulb wall: no sideways scroll at 360px");
  const tw = async () => p.textContent("[data-out=tw]");
  ok(/26\.1 °C/.test(await tw()), "the default scenario reads 35 °C, 50%, wet-bulb 26.1 °C");
  await p.fill("#wbw-rhn", "90"); await p.press("#wbw-rhn", "Enter");
  ok(/33\.5 °C/.test(await tw()), "typing 90% humidity updates the wet-bulb temperature at once (33.5 °C)");
  await p.focus(".wbw-mk"); await p.keyboard.press("ArrowLeft"); await p.keyboard.press("ArrowDown");
  ok(/34\.5 °C/.test(await p.textContent("[data-out=t]")) && /89%/.test(await p.textContent("[data-out=rh]")), "arrow keys on the marker move temperature by 0.5 °C and humidity by 1%");
  const box = await (await p.$(".wbw-mk")).boundingBox();
  await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await p.mouse.down(); await p.mouse.move(box.x - 60, box.y + 80, { steps: 5 }); await p.mouse.up();
  ok(!/34\.5 °C/.test(await p.textContent("[data-out=t]")), "dragging the marker changes the scenario");
  await p.waitForSelector(".wbw-cb");
  ok((await p.$$(".wbw-cb")).length === 6, "all six cities are listed, including one with no data");
  ok(/Not available/.test(await p.textContent(".wbw-cl li:nth-child(4)")) && (await p.$$(".wbw-cm")).length === 5, "a city with a missing value is listed but not plotted, and its value is not zero");
  await p.click(".wbw-cl li:nth-child(1) .wbw-cb");
  ok(/Modelled current conditions from Open-Meteo/.test(await p.textContent("[data-wbw-city]")) && /UTC/.test(await p.textContent("[data-wbw-city]")), "choosing a city shows it is modelled, with local and UTC time");
  const before = await p.$eval('.wbw-cm[data-city="mumbai"] path', e => e.getAttribute("d"));
  await p.click("[data-wbw-city] .wbw-btn");
  ok(/31\.0 °C/.test(await p.textContent("[data-out=t]")) && /started from Mumbai/.test(await p.textContent("[data-wbw-say]")), "“Explore from these conditions” copies the values into a labelled hypothetical scenario");
  await p.click("[data-wbw-plus2]");
  ok(/33\.0 °C/.test(await p.textContent("[data-out=t]")) && await p.isVisible("[data-wbw-plus2-note]") && await p.$eval('.wbw-cm[data-city="mumbai"] path', e => e.getAttribute("d")) === before, "Add 2 °C changes only the scenario, says what is held constant, and the city marker stays put");
  await p.click("[data-wbw-reset]");
  ok(/35\.0 °C/.test(await p.textContent("[data-out=t]")) && /50%/.test(await p.textContent("[data-out=rh]")), "Reset returns to the default scenario");
  await p.click("[data-wbw-unit]");
  ok(/95\.0 °F/.test(await p.textContent("[data-out=t]")), "°F is a display choice (35 °C shows as 95.0 °F)");
  await p.click("[data-wbw-unit]");
  await p.check('[data-ov-toggle="older-minact"]');
  ok(await p.isVisible('[data-ov="older-minact"]'), "a research overlay can be switched on");
  await p.click("[data-wbw-link]"); await p.waitForTimeout(150);
  const link = await p.evaluate(() => navigator.clipboard.readText());
  ok(/\/wet-bulb-wall\/\?t=35&rh=50$/.test(link), "Copy link writes the base page with validated values");
  if (SHOTS) await p.screenshot({ path: `${SHOTS}/wbw-360.png`, fullPage: false });
  await p.close();
  const r = await open("/wet-bulb-wall/?t=40.5&rh=55");
  ok(/40\.5 °C/.test(await r.textContent("[data-out=t]")) && /Restored from a shared link: a hypothetical scenario/.test(await r.textContent("[data-wbw-restored]")), "a shared link restores a labelled hypothetical scenario");
  await r.close();
  const m = await open("/wet-bulb-wall/?t=999&rh=<script>");
  ok(/35\.0 °C/.test(await m.textContent("[data-out=t]")) && /not valid/.test(await m.textContent("[data-wbw-restored]")), "malformed link values fall back to the default and say so");
  await m.close();
  // a failed weather request with nothing cached: the simulator still works and every city is listed as missing
  const c2 = await b.newContext({ viewport: { width: 390, height: 800 } });
  await c2.route(/api\.open-meteo\.com/, r2 => r2.abort());
  const f = await open("/wet-bulb-wall/", c2); await f.waitForSelector(".wbw-cb");
  ok((await f.$$(".wbw-cb")).length === 6 && /could not be reached/.test(await f.textContent("[data-wbw-cities]")) && (await f.$$(".wbw-cm")).length === 0, "a failed request lists every city as unavailable and plots none");
  await f.fill("#wbw-rhn", "70"); await f.press("#wbw-rhn", "Enter");
  ok(/30\.1 °C/.test(await f.textContent("[data-out=tw]")), "the simulator keeps working when the weather fails");
  await c2.close();

  // ---- heat futures ----
  const h = await open("/heat-futures/");
  ok(await h.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "heat futures: no sideways scroll at 360px");
  const chart = async () => h.$eval("[data-hf-chart]", e => e.innerHTML);
  const pchart = async () => h.$eval("[data-hf-pchart]", e => e.innerHTML);
  const c0 = await chart(), p0 = await pchart();
  await h.click('label.hf-opt:has(input[name="path"][value="early"])');
  ok(await chart() === c0 && await pchart() !== p0, "changing the protection pathway leaves the climate chart untouched");
  const p1 = await pchart();
  await h.click('label.hf-opt:has(input[name="sc"][value="ssp370"])');
  ok(await pchart() === p1 && await chart() !== c0, "changing the emissions path leaves the protection chart untouched");
  ok(/PROJECTED/.test(await chart()) && /ILLUSTRATIVE/.test(await pchart()), "each chart carries its evidence label");
  await h.click('label.hf-opt:has(input[name="city"][value="manila"])'); await h.click('label.hf-opt:has(input[name="ind"][value="tr26"])');
  ok(/Manila/.test(await h.textContent("[data-hf-say]")) && /grid cell centred at 14.5°N, 121°E/.test(await h.textContent("[data-hf-geo]")), "choosing a city redraws the interpretation and names its grid cell");
  await h.fill("#hf-later", "2040"); await h.dispatchEvent("#hf-later", "input");
  ok(/more years each/.test(await h.textContent("[data-hf-delay]")) && /Starts 2040/.test(await pchart()), "a later start adds years without protection and is drawn as its own line");
  await h.click("[data-hf-link]"); await h.waitForTimeout(150);
  const hl = await h.evaluate(() => navigator.clipboard.readText());
  ok(/city=manila&ind=tr26&sc=ssp370/.test(hl) && /later=2040/.test(hl), "Copy link writes the validated view");
  if (SHOTS) await h.screenshot({ path: `${SHOTS}/hf-360.png` });
  const [dl] = await Promise.all([h.waitForEvent("download"), h.click("[data-hf-png]")]);
  ok(/common-shade-heat-futures-manila-tr26-ssp370/.test(dl.suggestedFilename()), "the comparison image downloads with a descriptive name");
  await h.emulateMedia({ media: "print" });
  ok(await h.isVisible(".hf-printhead") && /PROJECTED/.test(await h.textContent(".hf-printhead")) && /ILLUSTRATIVE/.test(await h.textContent(".hf-printhead")), "the print view carries the selections and both evidence labels");
  await h.close();
  const hb = await open(`/heat-futures/?${new URLSearchParams(hl.split("?")[1])}`);
  ok(/Restored from a shared link/.test(await hb.textContent("[data-hf-restored]")) && await hb.$eval('input[name="city"][value="manila"]', e => e.checked), "a shared link restores the view");
  await hb.close();
  const hm = await open("/heat-futures/?city=paris&pace=999");
  ok(/not valid/.test(await hm.textContent("[data-hf-restored]")) && await hm.$eval('input[name="city"][value="delhi"]', e => e.checked), "malformed link values fall back to defaults and are named");
  await hm.close();
  // keyboard: radios and sliders work without a pointer
  const k = await open("/heat-futures/");
  await k.focus('input[name="ind"][value="hd35"]'); await k.keyboard.press("ArrowRight");
  ok(await k.$eval('input[name="ind"][value="tr26"]', e => e.checked), "radio choices work from the keyboard");
  await k.close();
  ok(errs.length === 0, "no script errors" + (errs.length ? ": " + errs.join("; ") : ""));
  await b.close();
  console.log(bad ? `interactives check: ${bad} failing` : "interactives check passed: wet-bulb wall and heat futures in a browser, with synthetic weather");
  process.exit(bad ? 1 : 0);
})().catch(e => { console.log("  FAIL the browser check could not run:", e.message); process.exit(1); });
