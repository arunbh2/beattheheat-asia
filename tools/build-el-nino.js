// El Niño and India's smaller cities (/el-nino-and-cities/): a practical preparedness guide for Tier 2 and Tier 3 cities across India.
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
    <h2 class="hub-h" id="en-open-h">What a seasonal outlook is for</h2>
    <p class="en-open">${esc(T.OPENING.text)}</p>
    <div class="en-next"><b>The first decision</b><p class="en-q">${esc(T.OPENING.decision)}</p><p>${esc(T.OPENING.decisionNote)}</p></div>
    <div class="en-pic">${tag("Illustrative", "design")}<p>${T.OPENING.picture.map(esc).join(" ")}</p>
      <p><a href="#market">The full market example</a> · <a href="#handout">The worksheet to print</a></p></div>
    <p class="en-jump"><a href="#outlook">The outlook</a> · <a href="#adapt">Adapt this to your city</a> · <a href="#risks">Six linked risks</a> · <a href="#route">Your warning route</a> · <a href="#windows">Before, during, after</a> · <a href="#market">A market at 2 p.m.</a> · <a href="#scale">Reach</a> · <a href="#handout">Worksheet</a> · <a href="#examples">What has been done</a></p>
  </section>

  <section class="container en-sec" id="outlook" aria-labelledby="en-outlook-h">
    <h2 class="hub-h" id="en-outlook-h">Where the outlook stands, as of ${esc(O.asOf)}</h2>
    <ul class="en-outlook">${O.items.map(i => `<li>${tag(i.kind, kindOf(i.kind))}<h3>${esc(i.who)}</h3>
      <p class="en-meta">Issued ${esc(i.issued)} · covers ${esc(i.period)} · ${esc(i.where)}</p><p>${esc(i.says)}</p><p class="en-meta">${esc(i.means)}</p>
      <p class="en-latest">Newer issue? ${ext(SRC[i.latest[0]].url, i.latest[1])}</p></li>`).join("")}</ul>
    <p class="en-none">${esc(O.none)}</p>
    <p class="en-review">This section was checked on ${esc(T.REVIEWED)}. It will be reviewed ${esc(T.NEXT_REVIEW)}.</p>
    ${srcFold([...O.items.flatMap(i => i.claims), ...O.noneClaims])}
    <h3 class="en-h3">What a seasonal signal can and cannot tell a city</h3>
    <div class="en-cancan"><div><h3>It can</h3><p>${esc(T.SIGNAL.can.text)}</p></div><div><h3>It cannot</h3><p>${esc(T.SIGNAL.cannot)}</p></div></div>
    <p>${esc(T.SIGNAL.apart)}</p>
    ${srcFold(T.SIGNAL.can.claims)}
  </section>

  <section class="container en-sec" id="adapt" aria-labelledby="en-adapt-h"><span id="local" class="en-anchor" aria-hidden="true"></span>
    <h2 class="hub-h" id="en-adapt-h">Adapt this to your city</h2>
    <p>${esc(T.ADAPT.intro)}</p>
    <div class="en-tablewrap"><table class="en-table"><caption>Conditions your city may recognise, and the decision each raises</caption>
      <thead><tr><th scope="col">If this describes your city</th><th scope="col">The decision to make</th><th scope="col">Information you may already hold</th></tr></thead>
      <tbody>${T.ADAPT.rows.map(r => `<tr id="adapt-${esc(r.id)}"><th scope="row">${esc(r.if)}</th><td data-label="The decision to make">${esc(r.decide)}</td><td data-label="Information you may already hold">${esc(r.know)}</td></tr>`).join("")}</tbody></table></div>
    <p>${esc(T.ADAPT.thane)} ${ext(SRC["ndma-cc"].url, "NDMA's guidelines for cooling centres")} cover site selection, retrofitting, and operations and maintenance.</p>
    <p>${esc(T.ADAPT.close)}</p>
    ${srcFold(T.ADAPT.rows.flatMap(r => r.claims || []))}
    ${related([["/practical-actions/#summer", "Before summer: for municipalities", "the practical action cards for this season"], ["/resources/heat-action-plans/india/", "India heat action plan archive", "your state's and district's plans"], ["/heat-tools/", "Heat Tool Finder", "which tool fits the decision in front of you"]])}
  </section>

  <section class="container en-sec" id="risks" aria-labelledby="en-risks-h">
    <h2 class="hub-h" id="en-risks-h">Six linked risks</h2>
    <p>Each row keeps apart what the evidence shows, where it stops, and what your own city's information can add.</p>
    <div class="en-tablewrap"><table class="en-table"><caption>Six risks: the evidence and its limit, how it becomes harm, what to check locally</caption>
      <thead><tr><th scope="col">Risk</th><th scope="col">The evidence, and its limit</th><th scope="col">How it becomes harm</th><th scope="col">What to check locally</th></tr></thead>
      <tbody>${T.RISKS.map(r => `<tr id="risk-${esc(r.id)}"><th scope="row">${esc(r.risk)}<br>${tag(r.label, "basis")}</th><td data-label="The evidence, and its limit">${esc(r.evidence)}</td><td data-label="How it becomes harm">${esc(r.harm)}</td><td data-label="What to check locally">${esc(r.check)}</td></tr>`).join("")}</tbody></table></div>
    ${srcFold(T.RISKS.flatMap(r => r.claims))}
    <h3 class="en-h3">Two compound scenarios</h3>
    <ul class="en-scen">${T.SCENARIOS.map(s => `<li>${tag(s.label, "scenario")}<h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join("")}</ul>
    ${srcFold(T.SCENARIOS.flatMap(s => s.claims))}
    ${related([["/loops/#energywater", "The energy–water loop", "how heat, power cuts and water shortages feed each other"], ["/loops/#reactive", "The reactive-spending loop", "why money that waits for the damage arrives late"], ["/who-is-at-risk/", "Who heat hits hardest", "the same heatwave, different barriers"]])}
  </section>

  <section class="container en-sec" id="route" aria-labelledby="en-route-h">
    <h2 class="hub-h" id="en-route-h">Your warning route</h2>
    <p>${esc(T.ROUTE.intro)}</p>
    <ol class="en-route">${T.ROUTE.steps.map(x => `<li><b>${x.link ? ext(SRC[x.link].url, x.t) : x.href ? `<a href="${esc(x.href)}">${esc(x.t)}</a>` : esc(x.t)}</b><span>${esc(x.d)}</span></li>`).join("")}</ol>
    <p>${esc(T.ROUTE.health)} ${ext(SRC["ncdc26"].url, "NCDC's advisory for summer 2026")}.</p>
    <details class="en-src en-exfold"><summary>${esc(T.ROUTE.mh.title)}</summary>
      <p>${tag(T.ROUTE.mh.label, "observed")} ${esc(T.ROUTE.mh.text)}</p>
      ${related([[SRC["sdma"].url, "Maharashtra's heat action plan page"], [SRC["rmc-nagpur"].url, "IMD Regional Meteorological Centre, Nagpur"], [SRC["rmc-mumbai"].url, "IMD Regional Meteorological Centre, Mumbai"], ["/resources/heat-action-plans/india/#IN-MH-STATE-MH-2024", "Maharashtra's state plan in the India archive"]])}</details>
    ${srcFold([...T.ROUTE.claims, ...T.ROUTE.healthClaims, ...T.ROUTE.mh.claims])}
  </section>

  <section class="container en-sec" id="windows" aria-labelledby="en-win-h">
    <h2 class="hub-h" id="en-win-h">Before, during and after: a local calendar</h2>
    <p>Read each window against your city's own season, not a national date.</p>
    <div class="en-tablewrap"><table class="en-table"><caption>Three decision windows</caption>
      <thead><tr><th scope="col">Window</th><th scope="col">What happens</th><th scope="col">Who decides</th></tr></thead>
      <tbody>${T.WINDOWS.map(w => `<tr id="window-${esc(w.id)}"><th scope="row">${esc(w.when)}</th><td data-label="What happens">${esc(w.what)}</td><td data-label="Who decides">${esc(w.who)}</td></tr>`).join("")}</tbody></table></div>
    <p class="en-cont">${esc(T.CONTINUITY)}</p>
    ${srcFold(T.WINDOWS.flatMap(w => w.claims))}
  </section>

  <section class="container en-sec" id="market" aria-labelledby="en-market-h">
    <h2 class="hub-h" id="en-market-h">Worked example: a market at 2 p.m.</h2>
    <div class="en-design">${tag("Illustrative design", "design")}
      <p>${esc(T.MARKET.story)}</p>
      <h3>The local organisation's design role</h3><p><b>${esc(T.MARKET.community.who)}</b> ${esc(T.MARKET.community.role)} ${esc(T.MARKET.community.changes)}</p>
      <h3>Four roles, which can sit with different bodies</h3>
      <ul class="en-roles">${T.MARKET.roles.map(r => `<li><b>${esc(r.who)}</b>${esc(r.agrees)}</li>`).join("")}</ul>
      <h3>On a warning day</h3><p>${esc(T.MARKET.warningDay)}</p>
      <h3>One trade-off, and the check</h3><p>${esc(T.MARKET.tradeoff)}</p>
      <div class="en-tablewrap"><table class="en-table"><caption>Every service has an owner and an operating requirement</caption>
        <thead><tr><th scope="col">Service</th><th scope="col">Owner</th><th scope="col">Operating requirement</th></tr></thead>
        <tbody>${T.MARKET.services.map(s => `<tr><th scope="row">${esc(s.service)}</th><td data-label="Owner">${esc(s.owner)}</td><td data-label="Operating requirement">${esc(s.needs)}</td></tr>`).join("")}</tbody></table></div>
      <h3>${esc(T.MARKET.alternative.title)}</h3><p>${esc(T.MARKET.alternative.text)} Managed by: ${esc(T.MARKET.alternative.owner)}</p><p>${esc(T.MARKET.alternative.community)}</p>
    </div>
    ${related([["/practical-actions/#market-canopy", "Shade over market stalls", "the action card, with what it depends on"], ["/practical-actions/#market-water", "A water point at the market", "the action card"], ["/practical/#market", "Explore an illustrative market", "shade, water, rest, a cooler roof and a vendor's day"], ["/practical-actions/#clinics-waiting", "Shaded clinic waiting areas", "the action card"], ["/who-holds-it/", "Who holds it up", "who could permit, pay for, deliver and check each action"]])}
  </section>

  <section class="container en-sec" id="scale" aria-labelledby="en-scale-h">
    <h2 class="hub-h" id="en-scale-h">Reach: how much protection people got</h2>
    <p>${esc(T.REACH.intro)}</p>
    <ul class="en-measures">${T.REACH.measures.map(m => `<li><b>${esc(m.t)}</b>${esc(m.d)}</li>`).join("")}</ul>
    <p>${esc(T.REACH.pairsIntro)}</p>
    <ul class="en-pairs">${T.REACH.pairs.map(([a, b]) => `<li><span><b>Output:</b> ${esc(a)}</span><span aria-hidden="true">→</span><span><b>Observable result:</b> ${esc(b)}</span></li>`).join("")}</ul>
    <p>${esc(T.REACH.fail)}</p>
    <p>${esc(T.REACH.equity)}</p>
    ${srcFold(T.REACH.claims)}
    ${related([["/paying-for-protection/", "Paying for heat protection", "who pays, how money arrives, and whether it lasts"], ["/actions/#heatbudget", "Dedicated heat budgets", "including India's disaster mitigation funds for heatwave projects"], ["/practical-actions/#summer-forecast", "Release money on the forecast", "agree in advance what money moves, and when"], ["/#explore", "The systems map", "how heat, water, work and health connect"]])}
  </section>

  <section class="container en-sec" id="handout" aria-labelledby="en-hand-h">
    <h2 class="hub-h" id="en-hand-h">A worksheet for the first meeting</h2>
    <div class="en-tablewrap"><table class="en-table en-hand"><caption>Copy, print or fill in: one worksheet per service</caption>
      <thead><tr><th scope="col">Field</th><th scope="col">Illustrative answer</th><th scope="col">Our city</th></tr></thead>
      <tbody>${T.WORKSHEET.fields.map(([f, v]) => `<tr><th scope="row">${esc(f)}</th><td data-label="Illustrative answer">${esc(v)}</td><td data-label="Our city" class="en-blank"></td></tr>`).join("")}</tbody></table></div>
    <p class="en-handnote">${esc(T.WORKSHEET.note)}</p>
    <p class="en-print">${esc(T.PRINT)}</p>
  </section>

  <section class="container en-sec" id="examples" aria-labelledby="en-ex-h">
    <h2 class="hub-h" id="en-ex-h">Preparedness that has happened in India</h2>
    <p>${esc(T.EXAMPLES_NOTE)}</p>
    <ul class="en-ex">${T.EXAMPLES.map(e => `<li>${tag(e.status, "observed")}<h3>${esc(e.place)} <small>${esc(e.setting)}</small></h3><p><b>The decision: ${esc(e.decision.toLowerCase())}.</b> ${esc(e.text)}</p></li>`).join("")}</ul>
    <p class="en-large">${tag(T.LARGE.label, "observed")} <b>${esc(T.LARGE.place)}.</b> ${esc(T.LARGE.text)} <a href="/actions/#hap">Heat action plans, with Ahmedabad's</a>.</p>
    ${srcFold([...T.EXAMPLES.flatMap(e => e.claims), ...T.LARGE.claims])}
    <details class="en-src en-exfold"><summary>Seasonal preparation outside India: Nepal and Peru</summary>
    <ul class="en-ex">${T.ABROAD.map(e => `<li>${tag(e.status, "observed")}<h3>${esc(e.place)}</h3><p>${esc(e.text)}</p></li>`).join("")}</ul>
    ${srcFold(T.ABROAD.flatMap(e => e.claims))}</details>
    <p>${esc(T.CLOSE)}</p>
    <p class="en-review">Reviewed ${esc(T.REVIEWED)}. Next review ${esc(T.NEXT_REVIEW)}. See something to correct? <a href="/join/#join-form">Tell us</a>; corrections are listed on <a href="/corrections/">Corrections</a>.</p>
  </section>`;
  write(T.SLUG, page(T.SLUG, T.TITLE, T.DESC, body, `\n  <link rel="stylesheet" href="/${T.SLUG}/el-nino.css?v=${V}">`));
};
module.exports.md = SITE => { const { SRC } = load(); return T.md(SITE, SRC); };
