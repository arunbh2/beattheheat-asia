// Common Shade: the plan file. On /plan/, "Save the whole plan as a file" must write every part of a plan (place, actions,
// owners, notes and money), and "Open a saved plan" must bring it back unchanged, refuse a file that is not a saved plan,
// and keep everything in the browser. Opens /plan/ in a browser with a seeded plan, saves it, starts again, opens the file
// and compares; then tries a stranger's JSON file.
// python3 -m http.server 8765, then
//   node tools/check-plan-file.js [--base http://localhost:8765]
// Fails, naming the step, if any part of the plan does not survive the round trip.
"use strict";
const fs = require("fs"), os = require("os"), path = require("path");
const { chromium } = require("playwright");
const a = process.argv.slice(2), BASE = a.includes("--base") ? a[a.indexOf("--base") + 1] : "http://localhost:8765";
const KEY = "bth-plan-v1";
const SEED = { place: "Check town", group: "", levers: ["heatrules"], rows: { heatrules: { lead: "Labour office", measure: "Rest breaks kept at the market" } },
  example: null, stalls: [], triggers: {}, review: "2027-03-01", exposure: [], finance: { payout: "District maximum above 42 degrees", nopay: "The city's relief fund" }, reviewLog: {}, origins: {} };
const fails = [], ok = (c, m) => { if (!c) fails.push(m); };
// every value in the seed is still there (the page may add defaults of its own, such as a phase, which is not a loss)
const has = (got, want) => want && typeof want === "object" ? !!got && typeof got === "object" && Object.keys(want).every(k => has(got[k], want[k])) : JSON.stringify(got) === JSON.stringify(want);
(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "plan-file-"));
  const b = await chromium.launch(), c = await b.newContext({ acceptDownloads: true, viewport: { width: 390, height: 844 } });
  await c.addInitScript(() => { try { sessionStorage.setItem("cs-invite-seen", "1"); } catch (e) {} });
  const p = await c.newPage(), errs = [];
  p.on("pageerror", e => errs.push(e.message));
  try { await p.goto(BASE + "/plan/", { waitUntil: "load", timeout: 30000 }); }
  catch (e) { console.log(`plan file check: could not open ${BASE}/plan/ (is the server running?)`); process.exit(1); }
  await p.evaluate(([k, v]) => localStorage.setItem(k, JSON.stringify(v)), [KEY, SEED]);
  await p.reload({ waitUntil: "load" });
  const save = p.locator('[data-pl-act="save"]').first(), open = p.locator('[data-pl-act="open"]').first();
  ok(await save.count() && await open.count(), "the plan page has no save or open button");
  if (!fails.length) {
    await save.scrollIntoViewIfNeeded();
    const [dl] = await Promise.all([p.waitForEvent("download", { timeout: 10000 }), save.click()]);
    const file = path.join(dir, dl.suggestedFilename()); await dl.saveAs(file);
    let d = null; try { d = JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) {}
    ok(d && d.format === "common-shade-plan" && d.version === 1, "the saved file is not marked as a Common Shade plan");
    ok(/^heat-plan-check-town\.json$/.test(dl.suggestedFilename()), `the file is named ${dl.suggestedFilename()}, not after the place`);
    for (const k of ["place", "levers", "rows", "review", "finance"]) ok(d && has(d.plan[k], SEED[k]), `the saved file loses the plan's ${k}`);
    // start again, then open the file
    await p.locator('[data-pl-act="clear"]').first().click();
    const cleared = await p.evaluate(k => JSON.parse(localStorage.getItem(k) || "{}"), KEY);
    ok(!cleared.place && !(cleared.levers || []).length, "Start again did not clear the plan before the file was opened");
    const [fc] = await Promise.all([p.waitForEvent("filechooser", { timeout: 10000 }), p.locator('[data-pl-act="open"]').first().click()]);
    await fc.setFiles(file); await p.waitForTimeout(500);
    const back = await p.evaluate(k => JSON.parse(localStorage.getItem(k) || "{}"), KEY);
    for (const k of ["place", "levers", "rows", "review", "finance"]) ok(has(back[k], SEED[k]), `opening the file did not bring back the plan's ${k}`);
    const st = await p.locator("[data-pl-status]").first().textContent();
    ok(/Plan opened for Check town: 1 action/.test(st || ""), `the status after opening reads "${st}"`);
    // a JSON file that is not a plan is refused, and the plan stays as it was
    const stranger = path.join(dir, "not-a-plan.json"); fs.writeFileSync(stranger, JSON.stringify({ levers: ["x"], hello: 1 }));
    p.on("dialog", dg => dg.accept());
    const [fc2] = await Promise.all([p.waitForEvent("filechooser", { timeout: 10000 }), p.locator('[data-pl-act="open"]').first().click()]);
    await fc2.setFiles(stranger); await p.waitForTimeout(400);
    const st2 = await p.locator("[data-pl-status]").first().textContent();
    ok(/not a saved Common Shade plan/.test(st2 || ""), `a stranger's file was not refused (status "${st2}")`);
    const still = await p.evaluate(k => JSON.parse(localStorage.getItem(k) || "{}"), KEY);
    ok(still.place === SEED.place, "a refused file changed the plan");
  }
  ok(!errs.length, `page errors: ${errs.join(" | ")}`);
  await b.close(); fs.rmSync(dir, { recursive: true, force: true });
  if (fails.length) { console.log(fails.map(f => "  FAIL " + f).join("\n")); console.log("plan file check: " + fails.length + " failing"); process.exit(1); }
  console.log("plan file check passed: a seeded plan saves to a file with its place, actions, owners, notes, review date and money, opens back unchanged after Start again, and a stranger's file is refused");
})();
