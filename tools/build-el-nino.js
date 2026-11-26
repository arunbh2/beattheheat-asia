// El Niño and India's smaller cities (/el-nino-and-cities/): a practical preparedness guide for Tier 2 and Tier 3 cities across India.
// Words come from tools/el-nino-text.js (shared with llms-full.txt). Each passage names the claims it rests on; the build stops,
// naming the claim, unless research/2026-11/el-nino-cities/confirmed.json holds it (the GitHub source check found every term).
// The page reads in full without JavaScript and prints as a handout. Called by tools/build-pages.js.
"use strict";
const fs = require("fs"), path = require("path");
const T = require("./el-nino-text.js");
const BATCH = path.join(__dirname, "..", "research", "2026-11", "el-nino-cities");
// readers see the public page of a document; the checker read the PDF or full-text record behind it
const PUBLIC = { "niua-m1": "https://niua.in/publication-details/Cities_and_Climate_Fundamentals_Primer", "niua-m2": "https://niua.in/publication-details/Climate_Change_Adaptation_Actions_in_Indian_Cities", "rohini-xml": "https://pmc.ncbi.nlm.nih.gov/articles/PMC4872222/", "roxy-xml": "https://doi.org/10.1038/s41467-017-00744-9", "hess": "https://pmc.ncbi.nlm.nih.gov/articles/PMC6236972/" };

function load() {
  const C = JSON.parse(fs.readFileSync(path.join(BATCH, "claims.json"), "utf8"));
  const OK = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(BATCH, "confirmed.json"), "utf8")).map(c => [c.id, c]));
  // claims from the shared El Niño batches (enso-asia, enso-update) may be used too: their own confirmed lists decide
  const E = require("./enso-outlook.js").load();
  for (const [id, c] of Object.entries(E.OK)) if (!OK[id]) OK[id] = c;
  const SRC = Object.fromEntries([...E.C.sources, ...C.sources].map(s => [s.key, Object.assign({}, s, { url: PUBLIC[s.key] || s.url })]));
  const missing = T.claimsUsed().filter(id => !OK[id]);
  if (missing.length) throw new Error(`el-nino-and-cities: claim ${missing.join(", ")} has not passed the source check (research/2026-11/el-nino-cities, enso-asia or enso-update, confirmed.json)`);
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
  // related pages as full-width rows: the whole row is the tap target
  const related = items => `<ul class="en-related">${items.map(([u, t, d]) => { const out = /^https?:/.test(u);
    return `<li><a href="${esc(u)}"${out ? ' target="_blank" rel="noopener"' : ""}><b>${esc(t)}</b>${d ? `<span>${esc(d)}</span>` : ""}${out ? '<span class="visually-hidden"> (opens in a new tab)</span>' : ""}<i aria-hidden="true">${out ? "↗" : "→"}</i></a></li>`; }).join("")}</ul>`;
  const O = T.OUTLOOK;

  const body = `${hero("Before the season", esc(T.TITLE), esc(T.DESC))}
  <section class="container en-sec" aria-labelledby="en-open-h">
    <ul class="en-glance" aria-label="About this guide">${T.GLANCE.map(g => `<li>${esc(g)}</li>`).join("")}</ul>
    <h2 class="hub-h" id="en-open-h">What a seasonal outlook is for</h2>
    <p class="en-open">${esc(T.OPENING.text)}</p>
    <div class="en-next"><b>The first decision</b><p class="en-q">${esc(T.OPENING.decision)}</p><p>${esc(T.OPENING.decisionNote)}</p></div>
    <div class="en-settings" id="settings">
      <h3 class="en-h3" id="en-settings-h">Where people already have to be</h3>
      <p class="en-line">${esc(T.SETTINGS.line)}</p>
      <p>${esc(T.SETTINGS.intro)}</p>
      <ol class="en-set" aria-labelledby="en-settings-h">${T.SETTINGS.items.map((x, i) => `<li><a href="${esc(x.href)}"><span class="en-set__n" aria-hidden="true">${i + 1}</span><b>${esc(x.t)}</b><span>${esc(x.d)}</span><em>${esc(x.go)} <span aria-hidden="true">→</span></em></a></li>`).join("")}</ol>
      <p class="en-choose">${esc(T.SETTINGS.choose)} <a href="/print/${T.WORKSHEET.slug}/">The worksheet to print</a> has all four, and room for your own.</p>
      ${srcFold(T.SETTINGS.claims, "Source for this section")}
    </div>
    <nav class="en-toc" aria-label="On this page"><p class="en-toc__h">In this guide</p><ol>${[["outlook", "The outlook"], ["protections", "Four protections"], ["adapt", "Adapt to your city"], ["risks", "Six linked risks"], ["route", "Your warning route"], ["windows", "By lead time"], ["school", "A school at lunchtime"], ["market", "Markets, clinics, waiting spaces"], ["scale", "Reach"], ["handout", "Worksheet"], ["examples", "What has been done"]].map(([id, t], i) => `<li><a href="#${id}"><span aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>${esc(t)}</a></li>`).join("")}</ol></nav>
  </section>

  <section class="container en-sec" id="outlook" aria-labelledby="en-outlook-h">
    <p class="en-kicker" aria-hidden="true"><span>01</span>The evidence</p>
    <h2 class="hub-h" id="en-outlook-h">Where the outlook stands</h2>
    <p class="en-horizon"><b>A planning horizon, not a forecast.</b> ${esc(O.horizon.replace(/^"Summer 2027" in this guide's title is a planning horizon, not a forecast\. /, ""))}</p>
    <ul class="en-outlook">${O.items.map(i => `<li>${tag(i.kind, kindOf(i.kind))}<h3>${esc(i.who)}</h3>
      <p class="en-meta">Issued ${esc(i.issued)} · covers ${esc(i.period)} · ${esc(i.where)}</p><p>${esc(i.says)}</p><p class="en-meta">${esc(i.means)}</p>
      <p class="en-latest">Newer issue? ${ext(SRC[i.latest[0]].url, i.latest[1])}</p></li>`).join("")}</ul>
    <p class="en-none">${esc(O.none)}</p>
    ${srcFold([...O.items.flatMap(i => i.claims), ...O.noneClaims])}
    <p class="en-review">How El Niño works, region by region: <a href="/el-nino/">El Niño and heat in Asia</a>. The same bulletin is on the <a href="/signals/#el-nino-watch">El Niño watch</a>.</p>
    <h3 class="en-h3">What a seasonal signal can and cannot tell a city</h3>
    <div class="en-cancan"><div><h3>It can</h3><p>${esc(T.SIGNAL.can.text)}</p></div><div><h3>It cannot</h3><p>${esc(T.SIGNAL.cannot)}</p></div></div>
    <p>${esc(T.SIGNAL.apart)}</p>
    ${srcFold(T.SIGNAL.can.claims)}
  </section>

  <section class="container en-sec" id="protections" aria-labelledby="en-prot-h">
    <p class="en-kicker" aria-hidden="true"><span>02</span>Four protections</p>
    <h2 class="hub-h" id="en-prot-h">Four protections that keep working</h2>
    <p>${esc(T.PROTECT.intro)}</p>
    <p class="en-q"><b>The question:</b> ${esc(T.PROTECT.question)}</p>
    ${T.PROTECT.items.map(x => `<section class="en-prot" id="protect-${esc(x.id)}" aria-labelledby="protect-${esc(x.id)}-h"><h3 class="en-h3" id="protect-${esc(x.id)}-h">${esc(x.t)}</h3>
      <dl class="en-prot__dl">${T.PROTECT_Q.map(([k, q]) => `<div><dt>${esc(q)}</dt><dd>${esc(x[k])}</dd></div>`).join("")}</dl>
      ${x.respite ? `<div class="cs-note cs-note--watch en-prot__respite"><span class="cs-note__label">Before a school offers respite to the public</span><p>${esc(x.respite)}</p></div>` : ""}
      ${x.evidence ? `<p class="en-prot__ev"><b>What the evidence says:</b> ${esc(x.evidence)}</p>` : ""}
      <p class="en-prot__links">On Common Shade: ${x.links.map(([u, t]) => `<a href="${esc(u)}">${esc(t)}</a>`).join(" · ")}</p>
      ${srcFold(x.claims)}</section>`).join("")}
    <p class="en-small">Roles are prompts to confirm with whoever holds the mandate locally; the answers that are not cited are Common Shade's planning guidance, not national rules. Choose tools for each horizon in the <a href="/heat-tools/#el-nino">Heat Tool Finder's El Niño route</a>.</p>
  </section>

  <section class="container en-sec" id="adapt" aria-labelledby="en-adapt-h"><span id="local" class="en-anchor" aria-hidden="true"></span>
    <p class="en-kicker" aria-hidden="true"><span>03</span>Your city</p>
    <h2 class="hub-h" id="en-adapt-h">Adapt this to your city</h2>
    <p>${esc(T.ADAPT.intro)}</p>
    <div class="en-tablewrap"><table class="en-table"><caption>Conditions your city may recognise, and the decision each raises</caption>
      <thead><tr><th scope="col">If this describes your city</th><th scope="col">The decision to make</th><th scope="col">Information you may already hold</th></tr></thead>
      <tbody>${T.ADAPT.rows.map(r => `<tr id="adapt-${esc(r.id)}"><th scope="row">${esc(r.if)}</th><td data-label="The decision to make">${esc(r.decide)}</td><td data-label="Information you may already hold">${esc(r.know)}</td></tr>`).join("")}</tbody></table></div>
    <p>For cooling spaces, ${ext(SRC["ndma-cc"].url, "NDMA's guidelines for cooling centres")} cover site selection, retrofitting, and operations and maintenance.</p>
    <p>${esc(T.ADAPT.close)}</p>
    ${srcFold(T.ADAPT.rows.flatMap(r => r.claims || []))}
    ${related([["/practical-actions/#summer", "Before summer: for municipalities", "the practical action cards for this season"], ["/resources/heat-action-plans/india/", "India heat action plan archive", "your state's and district's plans"], ["/heat-tools/", "Heat Tool Finder", "which tool fits the decision in front of you"]])}
  </section>

  <section class="container en-sec" id="risks" aria-labelledby="en-risks-h">
    <p class="en-kicker" aria-hidden="true"><span>04</span>The evidence</p>
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
    <p class="en-kicker" aria-hidden="true"><span>05</span>Warnings</p>
    <h2 class="hub-h" id="en-route-h">Your warning route</h2>
    <p>${esc(T.ROUTE.intro)}</p>
    <ol class="en-route">${T.ROUTE.steps.map(x => `<li><b>${x.link ? ext(SRC[x.link].url, x.t) : x.href ? `<a href="${esc(x.href)}">${esc(x.t)}</a>` : esc(x.t)}</b><span>${esc(x.d)}</span></li>`).join("")}</ol>
    <p>${esc(T.ROUTE.health)} ${ext(SRC["ncdc26"].url, "NCDC's advisory for summer 2026")}.</p>
    ${srcFold([...T.ROUTE.claims, ...T.ROUTE.healthClaims])}
  </section>

  <section class="container en-sec" id="windows" aria-labelledby="en-win-h">
    <p class="en-kicker" aria-hidden="true"><span>06</span>Calendar</p>
    <h2 class="hub-h" id="en-win-h">By lead time: months, weeks, days, during, afterwards</h2>
    <p>Read each window against your city's own season, not a national date. El Niño is context for the months-ahead work; local forecasts and official warnings set the days-ahead action.</p>
    <div class="en-tablewrap" role="region" aria-label="Decision windows by lead time" tabindex="0"><table class="en-table"><caption>Five decision windows, by lead time</caption>
      <thead><tr><th scope="col">Window</th><th scope="col">What happens</th><th scope="col">Who decides</th></tr></thead>
      <tbody>${T.WINDOWS.map(w => `<tr id="window-${esc(w.id)}"><th scope="row">${esc(w.when)}</th><td data-label="What happens">${esc(w.what)}</td><td data-label="Who decides">${esc(w.who)}</td></tr>`).join("")}</tbody></table></div>
    <p class="en-cont">${esc(T.CONTINUITY)}</p>
    ${srcFold(T.WINDOWS.flatMap(w => w.claims))}
  </section>

  <section class="container en-sec" id="school" aria-labelledby="en-school-h">
    <p class="en-kicker" aria-hidden="true"><span>07</span>Worked example</p>
    <h2 class="hub-h" id="en-school-h">A school at lunchtime</h2>
    <div class="en-design">${tag("Illustrative scene", "design")}
      <p class="en-scene">${esc(T.SCHOOL.scene)}</p>
      <p>${esc(T.SCHOOL.insight)}</p>
    </div>
    <p>How a municipal team turns that observation into something it can deliver:</p>
    <ol class="en-steps">${T.SCHOOL.steps.map((x, i) => `<li id="school-${esc(x.id)}"><h3><span aria-hidden="true">${i + 1}</span>${esc(x.h)}</h3>${x.text ? `<p>${esc(x.text)}</p>` : ""}${x.roles ? `<ul class="en-roles">${x.roles.map(([w, r]) => `<li><b>${esc(w)}</b>${esc(r)}</li>`).join("")}</ul>` : ""}${x.links ? `<p class="en-steplinks">${x.links.map(([u, t]) => `<a href="${esc(u)}">${esc(t)}</a>`).join(" · ")}</p>` : ""}</li>`).join("")}</ol>
    <div class="en-next"><b>The question for the education team</b><p class="en-q">${esc(T.SCHOOL.question)}</p></div>
    ${srcFold(T.SCHOOL.claims, "Source for the check")}
    ${related([["/practical-actions/#schools", "Schools and childcare: the action cards", "roofs, shaded play, water and heat-ready timetables"], ["/print/actions-schools/", "The school actions as a one-pager", "to print for the headteacher and the School Management Committee"], ["/heat-tools/", "Heat Tool Finder", "which tool fits the decision in front of you"], ["/print/" + T.WORKSHEET.slug + "/", "The worksheet to print", "with this school example filled in"]])}
  </section>

  <section class="container en-sec" id="market" aria-labelledby="en-market-h">
    <p class="en-kicker" aria-hidden="true"><span>08</span>Three more settings</p>
    <h2 class="hub-h" id="en-market-h">Markets, clinics and waiting spaces</h2>
    <p>Each setting has its own decision, its own operator and its own way to tell whether people benefited.</p>
    <div class="en-tablewrap" role="region" aria-label="Three more settings" tabindex="0"><table class="en-table"><caption>The decision, who runs it, and what to check</caption>
      <thead><tr><th scope="col">Setting</th><th scope="col">The decision</th><th scope="col">Who runs it</th><th scope="col">What to check</th></tr></thead>
      <tbody>${T.SETTINGS_MORE.map(x => `<tr id="setting-${esc(x.id)}"><th scope="row">${esc(x.setting)}</th><td data-label="The decision">${esc(x.decision)}${x.voice ? ` ${esc(x.voice)}` : ""}</td><td data-label="Who runs it">${esc(x.runs)}</td><td data-label="What to check">${esc(x.check)}<span class="en-rowlinks">${x.links.map(([u, t]) => `<a href="${esc(u)}">${esc(t)}</a>`).join(" · ")}</span></td></tr>`).join("")}</tbody></table></div>
    <h3 class="en-h3" id="market-example">Worked example: a market at 2 p.m.</h3>
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
    </div>
    ${related([["/practical-actions/#market-canopy", "Shade over market stalls", "the action card, with what it depends on"], ["/practical-actions/#market-water", "A water point at the market", "the action card"], ["/practical/#market", "Explore an illustrative market", "shade, water, rest, a cooler roof and a vendor's day"], ["/practical-actions/#clinics-waiting", "Shaded clinic waiting areas", "the action card"], ["/who-holds-it/", "Who holds it up", "who could permit, pay for, deliver and check each action"]])}
  </section>

  <section class="container en-sec" id="scale" aria-labelledby="en-scale-h">
    <p class="en-kicker" aria-hidden="true"><span>09</span>Reach</p>
    <h2 class="hub-h" id="en-scale-h">Reach: how much protection people got</h2>
    <p>${esc(T.REACH.intro)}</p>
    <ul class="en-measures">${T.REACH.measures.map(m => `<li><b>${esc(m.t)}</b>${esc(m.d)}</li>`).join("")}</ul>
    <div class="en-tablewrap" role="region" aria-label="Reach, setting by setting" tabindex="0"><table class="en-table"><caption>Reach, setting by setting: state the denominator, and keep people apart from visits</caption>
      <thead><tr><th scope="col">Setting</th><th scope="col">Coverage, with its denominator</th><th scope="col">People and visits, kept apart</th></tr></thead>
      <tbody>${T.REACH.bySetting.map(([a, b, c]) => `<tr><th scope="row">${esc(a)}</th><td data-label="Coverage, with its denominator">${esc(b)}</td><td data-label="People and visits, kept apart">${esc(c)}</td></tr>`).join("")}</tbody></table></div>
    <p>${esc(T.REACH.pairsIntro)}</p>
    <ul class="en-pairs">${T.REACH.pairs.map(([a, b]) => `<li><span><b>Output:</b> ${esc(a)}</span><span aria-hidden="true">→</span><span><b>Observable result:</b> ${esc(b)}</span></li>`).join("")}</ul>
    <p>${esc(T.REACH.fail)}</p>
    <p>${esc(T.REACH.equity)}</p>
    ${srcFold(T.REACH.claims)}
    ${related([["/paying-for-protection/", "Paying for heat protection", "who pays, how money arrives, and whether it lasts"], ["/actions/#heatbudget", "Dedicated heat budgets", "including India's disaster mitigation funds for heatwave projects"], ["/practical-actions/#summer-forecast", "Release money on the forecast", "agree in advance what money moves, and when"], ["/#explore", "The systems map", "how heat, water, work and health connect"]])}
  </section>

  <section class="container en-sec" id="handout" aria-labelledby="en-hand-h">
    <p class="en-kicker" aria-hidden="true"><span>10</span>Worksheet</p>
    <h2 class="hub-h" id="en-hand-h">A worksheet for the first meeting</h2>
    <p>${esc(T.WORKSHEET.lede)}</p>
    <p>Tick one setting: ${T.WORKSHEET.settings.map(esc).join(", ")}, or write in your own.</p>
    <div class="en-filled">${tag(T.WORKSHEET.example.label, "design")}<dl>${T.WORKSHEET.example.rows.map(([a, b]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join("")}</dl></div>
    <ol class="en-ws">${T.WORKSHEET.parts.map((pt, i) => `<li><b><span aria-hidden="true">${i + 1}</span>${esc(pt.h)}</b><span>${esc(pt.sum)}</span></li>`).join("")}</ol>
    <p class="en-ws-go"><a class="btn btn--cta" href="/print/${T.WORKSHEET.slug}/">Open the worksheet to print (A4) <span aria-hidden="true">→</span></a></p>
    <p class="en-handnote">${esc(T.WORKSHEET.note)} ${esc(T.PRINT)}</p>
  </section>

  <section class="container en-sec" id="examples" aria-labelledby="en-ex-h">
    <p class="en-kicker" aria-hidden="true"><span>11</span>In practice</p>
    <h2 class="hub-h" id="en-ex-h">Preparedness that has happened in India</h2>
    <p>${esc(T.EXAMPLES_NOTE)}</p>
    <ul class="en-ex">${T.EXAMPLES.map(e => `<li>${tag(e.status, "observed")}<h3>${esc(e.place)} <small>${esc(e.setting)}</small></h3><p><b>The decision: ${esc(e.decision.toLowerCase())}.</b> ${esc(e.text)}</p></li>`).join("")}</ul>
    <p class="en-large">${tag(T.LARGE.label, "observed")} <b>${esc(T.LARGE.place)}.</b> ${esc(T.LARGE.text)} <a href="/actions/#hap">Heat action plans, with Ahmedabad's</a>.</p>
    ${srcFold([...T.EXAMPLES.flatMap(e => e.claims), ...T.LARGE.claims])}
    <p>${esc(T.CLOSE)}</p>
    <p class="en-review">See something to correct? <a href="/join/#join-form">Tell us</a>; corrections are listed on <a href="/corrections/">Corrections</a>.</p>
  </section>`;
  write(T.SLUG, page(T.SLUG, T.TITLE, T.DESC, body, `\n  <link rel="stylesheet" href="/${T.SLUG}/el-nino.css?v=${V}">`));
};
module.exports.md = SITE => { const { SRC } = load(); return T.md(SITE, SRC); };
