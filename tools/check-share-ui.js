#!/usr/bin/env node
// Common Shade: the "Share this page" panel in a real browser (Playwright), on the built site served locally.
// What a visitor does: open the panel from either button, read and edit the message, copy (when the browser allows it
// and when it refuses), open WhatsApp or LinkedIn, cancel the device's share sheet, close with Escape. Each failure says
// what broke. Needs the local server: node tools/check-all.js starts one, or python3 -m http.server 8765.
//   node tools/check-share-ui.js [http://localhost:8765] [folder for screenshots]
"use strict";
const { chromium } = require(process.env.PW || "playwright");
const B = process.argv[2] || "http://localhost:8765", SHOTS = process.argv[3] || "";
let bad = 0; const ok = (c, m) => { console.log(c ? "  ok  " : "  FAIL", m); if (!c) bad++; };
const say = p => p.textContent("[data-sh-say]");
const shot = async (p, name) => { if (SHOTS) await p.waitForTimeout(400), await p.screenshot({ path: `${SHOTS}/${name}.png` }); };

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, permissions: ["clipboard-read", "clipboard-write"] });
  const errs = [];
  const open = async (url, init) => { const p = await ctx.newPage(); p.on("pageerror", e => errs.push(url + ": " + e.message)); if (init) await p.addInitScript(init); await p.goto(B + url, { waitUntil: "load" }); return p; };

  // ---- the panel, its message and its links ----
  const p = await open("/el-nino/");
  const D = await p.evaluate(() => JSON.parse(document.getElementById("cs-share-data").textContent));
  await p.click(".cs-sh--top"); await p.waitForSelector("dialog.cs-shd[open]");
  ok(await p.evaluate(() => document.activeElement.id === "cs-shd-h"), "opening the panel moves focus to its heading (no phone keyboard pops up)");
  ok(await p.inputValue("#cs-shd-text") === D.text, "the message box holds the page's own suggested text");
  const wa = await p.getAttribute("[data-sh-wa]", "href");
  ok(wa.startsWith("https://wa.me/?text=") && decodeURIComponent(wa.slice(20)) === D.text + "\n\n" + D.url, "WhatsApp: no phone number; the message, a blank line, then the page's URL");
  ok(/%0A%0A/.test(wa) && /Ni%C3%B1o/.test(wa), "WhatsApp: line breaks and 'El Niño' are percent-encoded");
  ok(await p.getAttribute("[data-sh-li]", "href") === "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(D.url), "LinkedIn: only the page URL is passed");
  await shot(p, "share-panel-390");
  const edited = "Tom & Jerry ask: El Niño? 100% #heat\nSecond line";
  await p.fill("#cs-shd-text", edited);
  ok(decodeURIComponent((await p.getAttribute("[data-sh-wa]", "href")).slice(20)) === edited + "\n\n" + D.url, "an edited message with &, ?, %, #, ñ and a line break reaches WhatsApp unchanged");
  ok(await p.isVisible("[data-sh-reset]"), "editing shows 'Use the suggested text again'");
  await p.click("[data-sh-copy-all]"); await p.waitForTimeout(200);
  ok(await p.evaluate(() => navigator.clipboard.readText()) === edited + "\n\n" + D.url, "'Copy message and link' copies the edited message and the link");
  ok(/copied/i.test(await say(p)), "success is announced only after the copy is confirmed");
  await p.click("[data-sh-reset]");
  ok(await p.inputValue("#cs-shd-text") === D.text && !(await p.isVisible("[data-sh-reset]")), "reset brings back the suggested text");
  await p.click("[data-sh-copy-url]"); await p.waitForTimeout(200);
  ok(await p.evaluate(() => navigator.clipboard.readText()) === D.url, "'Copy link' copies the clean page URL");
  await p.evaluate(() => { navigator.clipboard.writeText = () => Promise.reject(new Error("denied")); });
  await p.click("[data-sh-copy-text]"); await p.waitForTimeout(200);
  ok(/blocked/.test(await say(p)) && !/copied\./i.test(await say(p)) && await p.evaluate(() => document.activeElement.id === "cs-shd-text" && document.activeElement.selectionEnd > 0), "when the browser refuses the clipboard, the panel says so and selects the text to copy by hand");
  for (let i = 0; i < 16; i++) await p.keyboard.press("Tab");
  ok(await p.evaluate(() => !!document.activeElement.closest("dialog.cs-shd")), "Tab keeps focus inside the open panel");
  await p.keyboard.press("Escape"); await p.waitForTimeout(150);
  ok(!(await p.$("dialog.cs-shd[open]")) && await p.evaluate(() => document.activeElement.classList.contains("cs-sh--top")), "Escape closes the panel and focus returns to the button that opened it");
  await p.click(".cs-sh--end");
  ok(!!(await p.$("dialog.cs-shd[open]")) && (await p.$$("dialog.cs-shd")).length === 1, "the button at the end of the page opens the same, single panel");
  const [tab] = await Promise.all([ctx.waitForEvent("page"), p.click("[data-sh-wa]")]);
  ok(/nothing is sent until you press send/.test(await say(p)) && !/posted/i.test(await say(p)), "after WhatsApp opens, the panel says nothing is sent until the visitor sends it (never 'posted')");
  await tab.close();
  await p.close();

  // ---- the device's own share sheet, cancelled ----
  const p2 = await open("/factory-heat/?utm_source=news&fbclid=abc#walk", () => { window.__opened = 0; window.open = () => { window.__opened++; }; navigator.share = () => { const e = new Error("cancel"); e.name = "AbortError"; return Promise.reject(e); }; });
  await p2.click(".cs-sh--top"); await p2.click("[data-sh-more]"); await p2.waitForTimeout(200);
  ok((await say(p2)).trim() === "" && await p2.evaluate(() => window.__opened) === 0, "cancelling the device's share sheet is quiet, and nothing else opens");
  ok(await p2.inputValue("#cs-shd-url") === "https://beattheheat.asia/factory-heat/", "tracking parameters and an unrequested #fragment stay out of the link");
  await p2.close();

  // ---- a section, and a deliberate view ----
  const p3 = await open("/el-nino-and-cities/#protections");
  await p3.click(".cs-sh--top");
  ok(await p3.inputValue("#cs-shd-url") === "https://beattheheat.asia/el-nino-and-cities/", "a #section is off by default");
  await p3.check("[data-sh-sec]");
  ok(await p3.inputValue("#cs-shd-url") === "https://beattheheat.asia/el-nino-and-cities/#protections", "the #section is added only when the visitor asks for it");
  await p3.close();
  const p4 = await open("/whats-new/?role=funder&utm_medium=x");
  await p4.click(".cs-sh--top");
  ok(await p4.inputValue("#cs-shd-url") === "https://beattheheat.asia/whats-new/?role=funder", "a deliberate view the page keeps (?role=) stays; tracking is dropped");
  await p4.close();

  // ---- a printable sheet ----
  const p5 = await open("/print/el-nino-briefing/");
  ok(await p5.isVisible("nav.tools [data-cs-share]"), "a printable sheet has its button in the page tools, outside the A4 sheet");
  await p5.click("nav.tools [data-cs-share]");
  ok(/printable one-page version/.test(await p5.textContent("dialog.cs-shd")) && !!(await p5.$('dialog.cs-shd a[href="/el-nino/"]')), "the panel says it shares the printable version and links the full page");
  await shot(p5, "share-panel-print");
  await p5.keyboard.press("Escape"); await p5.emulateMedia({ media: "print" });
  ok(!(await p5.isVisible("nav.tools [data-cs-share]")), "share controls are hidden when printing");
  await p5.close();

  // ---- phone widths, the home page, and no JavaScript ----
  for (const w of [360, 390]) {
    const q = await open("/heat-tools/"); await q.setViewportSize({ width: w, height: 740 }); await q.click(".cs-sh--top"); await q.waitForSelector("dialog.cs-shd[open]");
    const r = await q.evaluate(() => { const d = document.querySelector("dialog.cs-shd").getBoundingClientRect(); return { l: d.left, r: d.right, sw: document.documentElement.scrollWidth, iw: innerWidth }; });
    ok(r.l >= 8 && r.r <= r.iw - 8 && r.sw <= r.iw, `${w}px: the panel fits the screen with no sideways scroll`);
    if (w === 360) await shot(q, "share-panel-360");
    await q.close();
  }
  const h = await open("/");
  ok(await h.isVisible(".cs-sh-home [data-cs-share]"), "the home page has its share button before the footer (the opening stays as the owner set it)");
  await h.close();
  const nj = await b.newContext({ javaScriptEnabled: false }); const n = await nj.newPage(); await n.goto(B + "/el-nino/");
  ok(!(await n.isVisible("[data-cs-share]")), "without JavaScript the share buttons stay hidden (no dead buttons)");
  await nj.close();

  ok(errs.length === 0, "no script errors on the pages tested" + (errs.length ? ": " + errs.join("; ") : ""));
  await b.close();
  console.log(bad ? `share panel check: ${bad} failing` : "share panel check passed: message, links, copying, cancelling, keyboard, sections, printable sheets and phone widths");
  process.exit(bad ? 1 : 0);
})().catch(e => { console.log("  FAIL the browser check could not run:", e.message); process.exit(1); });
