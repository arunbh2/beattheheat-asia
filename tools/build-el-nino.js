// El Niño and the city (/el-nino-and-cities/): a five-minute decision guide for smaller Indian cities, starting in Maharashtra.
// Words come from tools/el-nino-text.js (shared with llms-full.txt). Each passage names the claims it rests on; the build stops,
// naming the claim, unless research/2026-11/el-nino-cities/confirmed.json holds it (the GitHub source check found every term).
// The page reads in full without JavaScript and prints as a handout. Called by tools/build-pages.js.
"use strict";
const fs = require("fs"), path = require("path");
const T = require("./el-nino-text.js");
const BATCH = path.join(__dirname, "..", "research", "2026-11", "el-nino-cities");
// readers see the public page of a document; the checker read the PDF or full-text record behind it
const PUBLIC = { "niua-m1": "https://niua.in/publication-details/Cities_and_Climate_Fundamentals_Primer", "niua-m2": "https://niua.in/publication-details/Climate_Change_Adaptation_Actions_in_Indian_Cities", "rohini-xml": "https://pmc.ncbi.nlm.nih.gov/articles/PMC4872222/", "roxy-xml": "https://doi.org/10.1038/s41467-017-00744-9" };

function load() {
  const C = JSON.parse(fs.readFileSync(path.join(BATCH, "claims.json"), "utf8"));
  const OK = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(BATCH, "confirmed.json"), "utf8")).map(c => [c.id, c]));
  const SRC = Object.fromEntries(C.sources.map(s => [s.key, Object.assign({}, s, { url: PUBLIC[s.key] || s.url })]));
  const missing = T.claimsUsed().filter(id => !OK[id]);
  if (missing.length) throw new Error(`el-nino-and-cities: claim ${missing.join(", ")} has not passed the source check (research/2026-11/el-nino-cities/confirmed.json)`);
  return { C, OK, SRC };
}

module.exports = function elNino({ page, write, esc, hero, V }) {
  const { OK, SRC } = load();
  const ext = (url, text) => `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(text)}<span class="visually-hidden"> (opens in a new tab)</span></a>`;
  // the sources that carried a set of claims, by the confirmed route (de-duplicated by public link)
  const srcOf = ids => { const seen = new Set(), out = [];
    ids.forEach(id => (OK[id].sources || []).forEach(s => { const key = Object.keys(SRC).find(k => SRC[k].publisher + ": " + SRC[k].title + (SRC[k].year ? ", " + SRC[k].year : "") === s.label) || null;
      const u = key ? SRC[key].url : s.url, label = key ? `${SRC[key].publisher}: ${SRC[key].title}` : s.label;
      if (!seen.has(u)) { seen.add(u); out.push([u, label]); } }));
    return out; };
  const srcFold = (ids, what = "Sources for this section") => { const ss = srcOf(ids); return ss.length ? `<details class="en-src"><summary>${esc(what)} (${ss.length})</summary><ul>${ss.map(([u, l]) => `<li>${ext(u, l)}</li>`).join("")}</ul></details>` : ""; };
  const tag = (label, kind) => `<span class="en-tag en-tag--${kind}">${esc(label)}</span>`;
  const kindOf = l => /^Observed/.test(l) ? "observed" : /^Forecast/.test(l) ? "forecast" : /Scenario/.test(l) ? "scenario" : "design";
  const related = items => `<ul class="en-related">${items.map(([u, t, d]) => `<li>${/^https?:/.test(u) ? ext(u, t) : `<a href="${esc(u)}">${esc(t)}</a>`}${d ? `: ${esc(d)}` : ""}</li>`).join("")}</ul>`;
  const O = T.OUTLOOK;

  const body = `${hero("Before the season", esc(T.TITLE), esc(T.DESC))}
  <section class="container en-sec" aria-labelledby="en-open-h">
    <h2 class="hub-h" id="en-open-h">What a city can do with the lead time El Niño offers</h2>
    <p class="en-open">${esc(T.OPENING.text)}</p>
    <p class="en-next"><b>The next decision</b>${esc(T.OPENING.next)}</p>
    <p class="en-pic">${esc(T.OPENING.picture)}</p>
    <p class="en-jump"><a href="#outlook">The outlook</a> · <a href="#risks">Six linked risks</a> · <a href="#windows">Preparation to response</a> · <a href="#market">A market at 2 p.m.</a> · <a href="#scale">City scale</a> · <a href="#handout">Handout</a> · <a href="#examples">What has been done</a> · <a href="#local">Akola, Nanded, Jalgaon</a></p>
  </section>

  <section class="container en-sec" id="outlook" aria-labelledby="en-outlook-h">
    <h2 class="hub-h" id="en-outlook-h">Where the outlook stands, as of ${esc(O.asOf)}</h2>
    <ul class="en-outlook">${O.items.map(i => `<li>${tag(i.kind, kindOf(i.kind))}<h3>${esc(i.who)}</h3>
      <p class="en-meta">Issued ${esc(i.issued)} · covers ${esc(i.period)}</p><p>${esc(i.says)}</p><p class="en-meta">${esc(i.means)}</p>
      <p class="en-latest">Newer issue? ${ext(SRC[i.latest[0]].url, i.latest[1])}</p></li>`).join("")}</ul>
    <p class="en-none">${esc(O.none)}</p>
    <p class="en-review">This section was checked on ${esc(T.REVIEWED)}. It will be reviewed ${esc(T.NEXT_REVIEW)}.</p>
    ${srcFold([...O.items.flatMap(i => i.claims), ...O.noneClaims])}
    <h3 class="en-h3">What a seasonal signal can and cannot tell a city</h3>
    <div class="en-cancan"><div><h3>It can</h3><p>${esc(T.SIGNAL.can.text)}</p></div><div><h3>It cannot</h3><p>${esc(T.SIGNAL.cannot)}</p></div></div>
    <p>${esc(T.SIGNAL.apart)}</p>
    ${srcFold(T.SIGNAL.can.claims)}
  </section>

  <section class="container en-sec" id="risks" aria-labelledby="en-risks-h">
    <h2 class="hub-h" id="en-risks-h">Six linked risks</h2>
    <p>Rain and flooding are kept apart: flooding also depends on drains and land use. Health and livelihoods show a pathway, not a probability.</p>
    <div class="en-tablewrap"><table class="en-table"><caption>Six risks: what the evidence supports, what turns it into harm, one response</caption>
      <thead><tr><th scope="col">Risk</th><th scope="col">What the evidence supports here</th><th scope="col">What turns it into harm locally</th><th scope="col">One municipal response</th></tr></thead>
      <tbody>${T.RISKS.map(r => `<tr id="risk-${esc(r.id)}"><th scope="row">${esc(r.risk)}<br>${tag(r.label, "basis")}</th><td data-label="What the evidence supports here">${esc(r.evidence)}</td><td data-label="What turns it into harm locally">${esc(r.harm)}</td><td data-label="One municipal response">${esc(r.act)}</td></tr>`).join("")}</tbody></table></div>
    ${srcFold(T.RISKS.flatMap(r => r.claims))}
    <h3 class="en-h3">Two compound scenarios</h3>
    <ul class="en-scen">${T.SCENARIOS.map(s => `<li>${tag(s.label, "scenario")}<h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join("")}</ul>
    ${srcFold(T.SCENARIOS.flatMap(s => s.claims))}
    ${related([["/loops/#energywater", "The energy–water loop", "how heat, power cuts and water shortages feed each other"], ["/loops/#reactive", "The reactive-spending loop", "why money that waits for the damage arrives late"], ["/who-is-at-risk/", "Who heat hits hardest", "the same heatwave, different barriers"]])}
  </section>

  <section class="container en-sec" id="windows" aria-labelledby="en-win-h">
    <h2 class="hub-h" id="en-win-h">From preparation to response</h2>
    <div class="en-tablewrap"><table class="en-table"><caption>Three decision windows</caption>
      <thead><tr><th scope="col">Window</th><th scope="col">Already running</th><th scope="col">Added when it arrives</th><th scope="col">Who decides</th></tr></thead>
      <tbody>${T.WINDOWS.map(w => `<tr id="window-${esc(w.id)}"><th scope="row">${esc(w.when)}</th><td data-label="Already running">${esc(w.running)}</td><td data-label="Added when it arrives">${esc(w.added)}</td><td data-label="Who decides">${esc(w.who)}</td></tr>`).join("")}</tbody></table></div>
    <p class="en-cont">${esc(T.CONTINUITY)}</p>
    ${srcFold(T.WINDOWS.flatMap(w => w.claims))}
    ${related([[SRC["imd-dw"].url, "IMD district-wise warnings", "the official warning for your district"], [SRC["rmc-nagpur"].url, "IMD Regional Meteorological Centre, Nagpur"], [SRC["rmc-mumbai"].url, "IMD Regional Meteorological Centre, Mumbai"],
      ["/resources/heat-action-plans/india/#IN-MH-STATE-MH-2024", "Maharashtra's state heat plan in the India archive", "with the district plans the archive holds"], [SRC["ncdc26"].url, "NCDC's advisory for summer 2026", "what health departments were asked to do"]])}
  </section>

  <section class="container en-sec" id="market" aria-labelledby="en-market-h">
    <h2 class="hub-h" id="en-market-h">Worked example: a municipal market at 2 p.m.</h2>
    <div class="en-design">${tag("Illustrative design", "design")}
      <p>${esc(T.MARKET.story)}</p>
      <h3>What each party could agree</h3>
      <ul class="en-roles">${T.MARKET.roles.map(r => `<li><b>${esc(r.who)}</b>${esc(r.agrees)}</li>`).join("")}</ul>
      <h3>On a warning day</h3><p>${esc(T.MARKET.warningDay)}</p>
      <h3>One trade-off, and the check</h3><p>${esc(T.MARKET.tradeoff)}</p>
      <div class="en-tablewrap"><table class="en-table"><caption>Every service has an owner and an operating requirement</caption>
        <thead><tr><th scope="col">Service</th><th scope="col">Owner</th><th scope="col">Operating requirement</th></tr></thead>
        <tbody>${[...T.MARKET.services, { service: "Or: " + T.MARKET.alternative.text.replace(/^A /, "a "), owner: T.MARKET.alternative.owner, needs: T.MARKET.alternative.needs }].map(s => `<tr><th scope="row">${esc(s.service)}</th><td data-label="Owner">${esc(s.owner)}</td><td data-label="Operating requirement">${esc(s.needs)}</td></tr>`).join("")}</tbody></table></div>
    </div>
    ${related([["/practical-actions/#market-canopy", "Shade over market stalls", "the action card, with what it depends on"], ["/practical-actions/#market-water", "A water point at the market", "the action card"], ["/practical/#market", "Explore an illustrative market", "shade, water, rest, a cooler roof and a vendor's day"], ["/practical-actions/#clinics-waiting", "Shaded clinic waiting areas", "the action card"], [SRC["ndma-cc"].url, "NDMA's guidelines for cooling centres", "site selection, retrofitting, operations and maintenance"]])}
  </section>

  <section class="container en-sec" id="scale" aria-labelledby="en-scale-h">
    <h2 class="hub-h" id="en-scale-h">What city scale means this season</h2>
    <p>${esc(T.SCALE.intro)}</p>
    <ul>${T.SCALE.points.map(p => `<li>${esc(p)}</li>`).join("")}</ul>
    <p>${esc(T.SCALE.pairsIntro)}</p>
    <ul class="en-pairs">${T.SCALE.pairs.map(([a, b]) => `<li><span><b>Output:</b> ${esc(a)}</span><span aria-hidden="true">→</span><span><b>Observable result:</b> ${esc(b)}</span></li>`).join("")}</ul>
    ${srcFold(T.SCALE.claims)}
    ${related([["/who-holds-it/", "Who holds it up", "who could permit, pay for, deliver and check each action"], ["/paying-for-protection/", "Paying for heat protection", "who pays, how money arrives, and whether it lasts"], ["/actions/#heatbudget", "Dedicated heat budgets", "including India's disaster mitigation funds for heatwave projects"], ["/practical-actions/#summer-forecast", "Release money on the forecast", "agree in advance what money moves, and when"]])}
  </section>

  <section class="container en-sec" id="handout" aria-labelledby="en-hand-h">
    <h2 class="hub-h" id="en-hand-h">A handout for the municipal meeting</h2>
    <div class="en-tablewrap"><table class="en-table en-hand"><caption>Copy, print or fill in: one row per service</caption>
      <thead><tr>${T.HANDOUT.cols.map(c => `<th scope="col">${esc(c)}</th>`).join("")}</tr></thead>
      <tbody><tr><th scope="row">${esc(T.HANDOUT.example[0])}<br>${tag("Illustrative", "design")}</th>${T.HANDOUT.example.slice(1).map((v, i) => `<td data-label="${esc(T.HANDOUT.cols[i + 1])}">${esc(v)}</td>`).join("")}</tr>
      ${[1, 2].map(() => `<tr class="en-blank"><th scope="row"><span class="visually-hidden">Blank row for your service</span></th>${T.HANDOUT.cols.slice(1).map(c => `<td data-label="${esc(c)}"></td>`).join("")}</tr>`).join("")}</tbody></table></div>
    <p class="en-handnote">${esc(T.HANDOUT.note)}</p>
    <p class="en-print">${esc(T.PRINT)}</p>
  </section>

  <section class="container en-sec" id="examples" aria-labelledby="en-ex-h">
    <h2 class="hub-h" id="en-ex-h">Preparedness that has happened</h2>
    <p>${esc(T.EXAMPLES_NOTE)} <a href="/actions/#hap">Heat action plans, with Ahmedabad's</a>.</p>
    <details class="en-src en-exfold" open><summary>Three documented examples: Nepal, Peru, Maharashtra</summary>
    <ul class="en-ex">${T.EXAMPLES.map(e => `<li>${tag(e.status, "observed")}<h3>${esc(e.place)}</h3><p>${esc(e.text)}</p></li>`).join("")}</ul></details>
    ${srcFold(T.EXAMPLES.flatMap(e => e.claims))}
  </section>

  <section class="container en-sec" id="local" aria-labelledby="en-local-h">
    <h2 class="hub-h" id="en-local-h">Akola, Nanded, Jalgaon and other smaller cities</h2>
    <p>${esc(T.LOCAL.text)}</p>
    <p>${esc(T.LOCAL.region)}</p>
    ${srcFold(T.LOCAL.claims)}
    ${related([["/resources/heat-action-plans/india/", "India heat action plan archive", "state, district and city plans, searchable"], ["/heat-tools/", "Heat Tool Finder", "which tool fits the decision in front of you"]])}
    <p class="en-review">Reviewed ${esc(T.REVIEWED)}. Next review ${esc(T.NEXT_REVIEW)}. See something to correct? <a href="/join/#join-form">Tell us</a>; corrections are listed on <a href="/corrections/">Corrections</a>.</p>
  </section>`;
  write(T.SLUG, page(T.SLUG, T.TITLE, T.DESC, body, `\n  <link rel="stylesheet" href="/${T.SLUG}/el-nino.css?v=${V}">`));
};
module.exports.md = SITE => { const { SRC } = load(); return T.md(SITE, SRC); };
