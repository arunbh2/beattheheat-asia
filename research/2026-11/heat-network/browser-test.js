const { chromium } = require("playwright");
// Browser tests for /heat-network/. Serve the repo on port 8765 (python3 -m http.server 8765), then: node research/2026-11/heat-network/browser-test.js
const B = "http://localhost:8765/heat-network/", S = require("os").tmpdir() + "/";
(async () => {
  const b = await chromium.launch(); let bad = 0; const ok = (c, m) => { console.log(c ? "  ok  " : "  FAIL", m); if (!c) bad++; };
  const mk = async (o) => { const c = await b.newContext(Object.assign({ viewport: { width: 390, height: 844 } }, o)); await c.addInitScript(() => { try { sessionStorage.setItem("cs-invite-seen", "1"); } catch (e) {} }); const p = await c.newPage(); const errs = []; p.on("pageerror", e => errs.push(e.message)); p.errs = errs; return p; };
  const vis = p => p.locator(".hn-card:not([hidden])").count();
  let p = await mk(); await p.goto(B); await p.waitForTimeout(600);
  const all = await p.locator(".hn-card").count(), first = await vis(p);
  ok(first === 40, `unfiltered, each of 8 groups opens on 5 rows (${first} shown)`);
  await p.locator(".hn-all").first().click(); ok(await vis(p) > first && await p.locator(".hn-all:visible").count() === 7, "Show all opens one group and leaves the others folded");
  ok(all > 300 && await p.locator("#hn-form").isVisible(), `form shows with the script; ${all} rows listed`);
  ok((await p.textContent("#hn-count")).includes(all + " organisations listed"), "count line says how many are listed");
  const visAll = async () => { while (await p.locator(".hn-all:visible").count()) await p.locator(".hn-all:visible").first().click(); return vis(p); };
  // three taps: place, action
  await p.selectOption("select[name=country]", "BD"); await p.selectOption("select[name=action]", "anticipatory");
  const n1 = await vis(p);
  ok(n1 > 0 && n1 < 30 && /country=BD/.test(p.url()) && /action=anticipatory/.test(p.url()), `Bangladesh + anticipatory action: ${n1} rows, state in the address`);
  ok(await p.locator(".hn-card:not([hidden])").evaluateAll(a => a.every(e => e.dataset.c.split(" ").includes("BD") && e.dataset.l.split(" ").includes("anticipatory"))), "every row shown matches both filters");
  ok(await p.locator(".hn-group:not([hidden]) h2").count() < 8, "groups with no match are hidden");
  await p.screenshot({ path: S + "hn-filtered.png" });
  // wider toggle
  await p.selectOption("select[name=action]", "");
  const bd = await vis(p); const moreBtn = p.locator("[data-wide='1']");
  ok(await moreBtn.count() === 1, "a country offers the regional and global bodies, not mixed in");
  await moreBtn.click(); const bdw = await vis(p); ok(bdw > bd && /wide=1/.test(p.url()), `showing them too: ${bd} to ${bdw}`);
  // reload restores, back button steps
  await p.reload(); await p.waitForTimeout(500); ok(await vis(p) === bdw && await p.inputValue("select[name=country]") === "BD", "a reload restores the filters from the address");
  await p.goBack(); await p.waitForTimeout(300); ok(await vis(p) === bd, "the back button steps to the earlier filter");
  // empty state
  await p.goto(B + "?country=MM"); await p.waitForTimeout(500);
  ok(await vis(p) === 0 && (await p.textContent("#hn-note")).includes("Not found yet") && (await p.textContent("#hn-note")).includes("describes the list"), "a place with nothing listed says Not found yet, about the list");
  await p.screenshot({ path: S + "hn-empty.png" });
  await p.locator("[data-drop=country]").click(); ok(await visAll() === all, "removing the filter from the empty state shows the list again");
  // search
  await p.fill("input[name=q]", "garment"); await p.waitForTimeout(400); const g = await vis(p);
  ok(g > 0 && g < 40 && await p.locator(".hn-card:not([hidden])").evaluateAll(a => a.every(e => /garment/i.test(e.textContent))), `search narrows to ${g} rows that contain the word`);
  await p.click("#hn-clear"); ok(await vis(p) >= 40 && !new URL(p.url()).search, "Clear filters empties the address and shows everything");
  // junk address
  await p.goto(B + "?country=XX&type=%3Cscript%3E&part=boss"); await p.waitForTimeout(400); ok(await visAll() === all, "an address with unknown values opens the full list");
  // deep link to one organisation, even through a filter that hides it
  await p.goto(B + "?country=SG#org-sewa"); await p.waitForTimeout(700);
  const top = await p.evaluate(() => { const e = document.getElementById("org-sewa"); return e.hidden ? -9999 : e.getBoundingClientRect().top; });
  ok(top > 0 && top < 500, `a link to one organisation shows it (top ${Math.round(top)}px)`);
  // group anchor
  await p.goto(B + "#funders"); await p.waitForTimeout(600); const ft = await p.evaluate(() => document.getElementById("funders").getBoundingClientRect().top); ok(ft > 0 && ft < 400, `old group anchor #funders still lands (top ${Math.round(ft)}px)`);
  // layout
  await p.goto(B); await p.waitForTimeout(500);
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "no sideways scroll at 390px");
  const small = await p.evaluate(() => [...document.querySelectorAll("#hn-form select, #hn-form input, #hn-form button, .hn-acts a, .hn-link")].filter(e => e.offsetParent && (e.getBoundingClientRect().height < 24)).length);
  ok(small === 0, "every control and action link is at least 24px tall");
  console.log("  page height at 390px:", await p.evaluate(() => document.documentElement.scrollHeight), "| median row height:", await p.evaluate(() => { const h = [...document.querySelectorAll(".hn-card")].map(e => { e.style.contentVisibility = "visible"; return e.getBoundingClientRect().height; }).sort((a, b) => a - b); return Math.round(h[h.length >> 1]); }));
  // keyboard only
  await p.goto(B); await p.waitForTimeout(500); await p.focus("select[name=country]"); await p.keyboard.type("Nepal"); await p.waitForTimeout(300);
  ok(await p.inputValue("select[name=country]") === "NP" && await vis(p) < 60 && await p.locator(".hn-all:visible").count() === 0, "the place filter works from the keyboard");
  ok(p.errs.length === 0, "no script errors" + (p.errs.length ? ": " + p.errs[0] : ""));
  // no JavaScript
  p = await mk({ javaScriptEnabled: false }); await p.goto(B);
  ok(await p.locator(".hn-card").count() === all && !(await p.locator("#hn-form").isVisible()), "without JavaScript every organisation is listed and no dead form shows");
  // entry links
  p = await mk(); await p.goto("http://localhost:8765/countries/nepal/"); await p.click("a[href='/heat-network/?country=NP']"); await p.waitForTimeout(600);
  ok(await p.inputValue("select[name=country]") === "NP", "the country page link opens the finder on that country");
  await p.goto("http://localhost:8765/actions/"); await p.locator("a[href='/heat-network/?action=heatrules']").click(); await p.waitForTimeout(600);
  ok(await p.inputValue("select[name=action]") === "heatrules" && await vis(p) > 0, "an action's 'Who works on this' opens the finder on that action");
  // desktop
  p = await mk({ viewport: { width: 1280, height: 800 } }); await p.goto(B + "?country=IN&part=demand"); await p.waitForTimeout(600); await p.screenshot({ path: S + "hn-desktop.png" });
  await b.close(); console.log(bad ? bad + " failing" : "all browser tests pass"); process.exit(bad ? 1 : 0);
})();
