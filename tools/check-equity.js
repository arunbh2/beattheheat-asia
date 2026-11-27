#!/usr/bin/env node
// Common Shade: checks the health and equity work across the site. Each failure says what to fix.
//   1. taxonomy (data/site/equity-taxonomy.json): complete, unique, descriptive labels, valid patterns
//   2. Solutions: "includes", "names it as needed" and "not assessed" kept apart; every label has a quoted passage from
//      the record; silence is "not assessed", never a negative; the filter, reset and counts are on the page
//   3. heat action plan review (data/site/hap-equity-review.json): every assessment keeps title, jurisdiction, date,
//      URL, file, fingerprint, page and excerpt (30 words or fewer); "not found" only for readable English text;
//      no plan reviewed twice (versions stay separate); coverage stated; no score or ranking
//   4. reach panels: on every funding programme and Signals commitment; no money summed; unknowns stated
//   5. health and equity pages: claims only from checked sources, illustrative labels, no scores or certification
//      words, no clinical calculator, routes and anchors kept (#rec-buddy, #plan-step-6, #taxonomy)
//   node tools/check-equity.js
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const EQ = require("./equity-taxonomy.js"), G = require("./source-gate.js"), H = require("./health-equity-text.js");
let bad = 0; const ok = (c, m) => { console.log(c ? "  ok  " : "  FAIL", m); if (!c) bad++; };
const read = f => fs.readFileSync(path.join(ROOT, f), "utf8");
const text = h => h.replace(/<!--csn-->[\s\S]*?<!--\/csn-->/g, "").replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

// ---- 1. taxonomy ----
const probs = EQ.validate(); ok(!probs.length, "the taxonomy is complete and valid" + (probs.length ? ": " + probs.join("; ") : ""));
ok(EQ.T.people.length >= 8 && EQ.T.provisions.length >= 8 && EQ.T.status.some(s => s.id === "s-notassessed") && EQ.T.status.some(s => s.id === "s-notfound"), "people, provisions and statuses are separate, with distinct 'not assessed' and 'not found'");

// ---- 2. Solutions ----
let recs = []; for (const [f, k] of [["active_solutions.json", "active_solutions"], ["passive_solutions.json", null], ["policy_and_finance_solutions.json", null]]) { const d = JSON.parse(read("research/2026-10/" + f)); recs = recs.concat(d[k || Object.keys(d).find(x => x.endsWith("solutions"))]); }
let noPass = 0, wrongField = 0;
for (const r of recs) { const m = EQ.matchSolution(r); for (const v of EQ.T.provisions) { const x = m[v.id]; if (x.status !== "notassessed" && !x.passage) noPass++; if (x.status === "includes" && !/Name|How it works/.test(x.field)) wrongField++; if (x.status === "requires" && /Name|How it works/.test(x.field)) wrongField++; } }
ok(noPass === 0, "every equity label on a solution quotes the passage it rests on");
ok(wrongField === 0, "'includes' comes only from the solution's own description; 'names it as needed' only from fairness, conditions or barriers");
const fake = { name: "A rest break rule", mechanism: "Workers get paid rest breaks.", equity_and_risks: "Check tenants." };
const fm = EQ.matchSolution(fake);
ok(fm["v-earnings"].status === "includes" && fm["v-tenure"].status === "requires" && fm["v-maternal"].status === "notassessed", "a synthetic record: a provision in the description is 'includes', one in the fairness notes is 'names it as needed', silence is 'not assessed'");
const sol = read("solutions/index.html");
ok((sol.match(/class="sol-use"/g) || []).length === recs.length, `every solution card has "Can people actually use this?" (${recs.length})`);
ok(/id="sol-eq"/.test(sol) && /id="sol-eqs"/.test(sol) && /id="sol-reset"/.test(sol) && /Not yet assessed for it/.test(sol) && /One provision at a time/.test(sol), "the Equity and access filter states its logic, offers 'not yet assessed' and a reset");

// ---- 3. plan review ----
const R = JSON.parse(read("data/site/hap-equity-review.json"));
ok(R.plans.length >= 5 && R.archive.total > R.plans.length && /most recent plan/.test(R.selection), `a defined set is reviewed (${R.plans.length} of ${R.archive.total}) with its selection rule stated`);
ok(new Set(R.plans.map(p => p.id)).size === R.plans.length, "no plan version is reviewed twice or copied to another version");
let miss = [], long = 0, nf = 0;
for (const p of R.plans) {
  for (const k of ["title", "jurisdiction", "year", "url", "file", "sha256", "limits", "reviewer"]) if (!p[k]) miss.push(p.id + ":" + k);
  if (!fs.existsSync(path.join(ROOT, p.file))) miss.push(p.id + ": text file");
  for (const [d, x] of Object.entries(p.dims)) {
    if (["explicit", "partial"].includes(x.status) && (!x.excerpt || !x.excerptPage)) miss.push(`${p.id}/${d}: excerpt or page`);
    if (x.excerpt && x.excerpt.replace(" …", "").split(" ").length > 30) long++;
    if (x.status === "notfound" && (!p.readable || /Indian language/.test(p.limits))) nf++;
  }
}
ok(!miss.length, "every assessment keeps title, jurisdiction, date, URL, file, fingerprint, limits, reviewer status, and a page and excerpt for every finding" + (miss.length ? ": " + miss.slice(0, 5).join(", ") : ""));
ok(long === 0, "excerpts are 30 words or fewer");
ok(nf === 0, "'not found' is used only for readable text in the language searched; others are 'not assessed'");
ok(R.plans.every(p => p.reviewer === "automated-preliminary"), "every review says it is an automated first pass, not yet checked by a person");
const hap = read("resources/heat-action-plans/india/index.html");
ok(/id="provisions"/.test(hap) && /not a legal compliance finding/.test(hap) && /no score and no ranking/i.test(hap) && /Not assessed/.test(hap) && /Tell us if a finding is wrong/.test(hap), "the archive shows the review with its limits, coverage, corrections route and no ranking");

// ---- 4. reach panels ----
const money = read("heat-economy/money/index.html"), prog = JSON.parse(read("data/funding/programmes.json")).records;
const progCards = (money.match(/class="sol he-card fo-prog"/g) || []).length;
ok(progCards > 0 && (money.match(/class="eq-reach"/g) || []).length === progCards, `every funding programme card has a Health and equity reach panel (${progCards})`);
ok(/Within the records tracked by Common Shade/.test(money) && /no money is summed/.test(money) && /do not add up to a total/.test(money), "the reach summary counts records, never money, and says categories overlap");
const sigCards = read("signals/cards.json"), commits = JSON.parse(read("data/site/signals.json")).signals.filter(s => s.kind === "commitment").length;
const sigPage = read("signals/index.html"), panels = (sigCards.match(/eq-reach/g) || []).length + (sigPage.match(/class="eq-reach"/g) || []).length;
ok(panels === commits, `every Signals commitment has a reach panel, on the page or in cards.json (${panels} of ${commits})`);
ok(/a policy step is not funded action|No funding milestone recorded/.test(sigCards), "a commitment without a funding milestone says so, rather than implying money");

// ---- 5. pages ----
const pages = ["heat-health-and-equity", "home-is-also-the-workplace", "care-through-heat", "rest-without-losing-income"];
for (const p of pages) {
  const h = read(p + "/index.html"), t = text(h).replace("none assigns anyone a risk score", "");
  ok(new RegExp(`<link rel="canonical" href="https://beattheheat.asia/${p}/">`).test(h), `/${p}/ has its canonical URL`);
  ok(!/\b(pregnancy[- ]safe|newborn[- ]safe|tenant[- ]safe|gender[- ]equitable|clinically approved|risk score|vulnerability score)\b/i.test(t), `/${p}/ uses no certification labels or scores`);
  ok(!/\bshould\b|\bmust\b|—/i.test(t), `/${p}/ keeps the site's voice`);
}
ok(Object.values(H.CLAIMS).every(c => G.passed(c.src)), "every evidence statement on the health and equity pages rests on a source that passed its check");
ok(/Illustrative situation, a composite/.test(read("home-is-also-the-workplace/index.html")) && /Illustrative comparison\. It does not calculate safe working time/.test(read("rest-without-losing-income/index.html")) && /Illustrative disruptions/.test(read("care-through-heat/index.html")), "each interaction says it is illustrative and predicts nothing");
ok(/gives no personal medical advice and asks nothing about anyone’s pregnancy/.test(read("care-through-heat/index.html")), "the pregnancy section gives no personal advice and asks for no disclosure");
const fh = read("factory-heat/index.html");
ok(/id="rec-buddy"/.test(fh) && !/None noted\./.test(fh) && /Recommended practice in national occupational guidance/.test(fh) && /unpaid caring work/.test(fh), "the factory buddy card keeps its anchor, cites guidance, names its limits and no longer says 'None noted'");
const plan = read("plan/index.html");
ok(/id="plan-step-6"/.test(plan) && /id="plan-equity-check"/.test(plan) && /not part of WHO’s guidance/.test(plan), "the plan's step 6 keeps its anchor and labels the equity check as Common Shade's, not WHO's");
ok(/id="taxonomy"/.test(read("heat-health-and-equity/index.html")), "the route page holds the shared provisions at #taxonomy");
const sm = read("sitemap.xml"); ok(pages.every(p => sm.includes(`<loc>https://beattheheat.asia/${p}/</loc>`)), "the sitemap lists the four pages");
console.log(bad ? `equity check: ${bad} failing` : "equity check passed: taxonomy, solutions labels, plan review, reach panels, pages and anchors");
process.exit(bad ? 1 : 0);
