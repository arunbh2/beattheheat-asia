// Heat in markets and street vending (/market-heat/) and its worksheet (/market-heat/worksheet/).
// Words come from tools/market-heat-text.js (shared with llms-full.txt). A passage or evidence line names the claims it
// rests on; only claims in research/2026-11/market-heat/confirmed.json (the GitHub source check found every term) reach
// the page. A passage whose claims did not all pass is left out or shortened, and named in the build log; a record left
// with no checked evidence shows as a proposal requiring validation, with its gap stated.
// The page reads in full without JavaScript. It reuses Heat inside factories' stylesheet and script (factory-heat/
// factory.css and factory.js: the plan, finder, comparison and printable shortlist), with its own small stylesheet and
// its own shortlist key. Called by tools/build-pages.js; md() by tools/build-static.js.
"use strict";
const fs = require("fs"), path = require("path");
const T = require("./market-heat-text.js");
const BATCH = path.join(__dirname, "..", "research", "2026-11", "market-heat");

function load() {
  const C = JSON.parse(fs.readFileSync(path.join(BATCH, "claims.json"), "utf8"));
  const cf = path.join(BATCH, "confirmed.json");
  const conf = fs.existsSync(cf) ? JSON.parse(fs.readFileSync(cf, "utf8")) : [];
  const OK = new Set(conf.map(c => c.id));
  const SRC = Object.fromEntries(C.sources.map(s => [s.key, s]));
  const CL = Object.fromEntries(C.claims.map(c => [c.id, c]));
  return { C, OK, SRC, CL };
}

// the evidence a record keeps after the check (an entry may fall back to its alternative wording); none left: a proposal
function evidenceOf(r, OK) {
  const all = ids => ids.length && ids.every(id => OK.has(id));
  const ev = r.ev.map(e => Object.assign({}, e, { claims: all(e.claims) ? e.claims : (e.alt || []).filter(id => OK.has(id)) })).filter(e => e.claims.length);
  return ev.length ? ev : [{ type: "proposal", claims: [], note: r.gap }];
}

module.exports = function marketHeat({ page, write, esc, hero, V }) {
  const { OK, SRC, CL } = load();
  const left = new Set();
  const all = ids => { const miss = (ids || []).filter(id => !OK.has(id)); miss.forEach(m => left.add(m)); return !miss.length; };
  const ext = (url, text) => `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(text)}<span class="visually-hidden"> (opens in a new tab)</span></a>`;
  const srcKeys = ids => [...new Set((ids || []).filter(id => OK.has(id)).flatMap(id => CL[id].rests_on.map(([k]) => k)))];
  const srcLinks = ids => srcKeys(ids).map(k => ext(SRC[k].url, `${SRC[k].publisher}, ${SRC[k].year}`)).join("; ");
  const srcFold = (ids, what = "Sources for this section") => { const ks = srcKeys(ids); return ks.length ? `<details class="fh-src"><summary>${esc(what)} (${ks.length})</summary><ul>${ks.map(k => `<li>${ext(SRC[k].url, `${SRC[k].publisher}: ${SRC[k].title} (${SRC[k].year})`)} <span class="fh-src__k">${esc(SRC[k].kind)} · ${esc(SRC[k].where)}</span></li>`).join("")}</ul></details>` : ""; };
  const tag = (label, kind) => `<span class="fh-tag fh-tag--${kind}">${esc(label)}</span>`;
  const REC = Object.fromEntries(T.RECORDS.map(r => [r.id, r]));
  const recLink = id => `<a href="#rec-${esc(id)}">${esc(REC[id].t)}</a>`;
  const famOf = id => T.FAMILIES.find(f => f.id === id);
  const kicker = (n, label) => `<p class="fh-kicker" aria-hidden="true"><span>${n}</span>${esc(label)}</p>`;
  const LOOPS = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "core", "LOOPS.json"), "utf8")).map(l => [l.id, l.name]));
  // a factor keeps its checked sentence only when its claims passed; otherwise only its first sentence shows
  const factorText = f => (!f.claims || all(f.claims)) ? f.d : f.d.split(". ")[0] + ".";
  const dimText = d => (!d.claims || all(d.claims)) ? { d: d.d, claims: d.claims || [] } : (d.alt && all(d.alt.claims)) ? d.alt : null;

  const opening = `
  <section class="container fh-sec fh-open" aria-labelledby="fh-q">
    <h2 class="fh-q" id="fh-q">${esc(T.OPEN.q)}</h2>
    <p class="fh-lede">${esc(T.OPEN.a)}</p>
    <div class="fh-walk">${tag(T.OPEN.label, "illus")}
      <ol class="fh-stops">${T.OPEN.stops.map((s, i) => `<li><span class="fh-stops__n" aria-hidden="true">${i + 1}</span><div><h3>${esc(s.place)}</h3><p>${esc(s.text)}</p></div></li>`).join("")}</ol>
      <p class="fh-close">${esc(T.OPEN.close)}</p>
    </div>
    <nav class="fh-entries" aria-label="Ways into this page"><ul>${T.ENTRIES.map(e => `<li><a href="${esc(e.href)}"><b>${esc(e.t)}</b><span>${esc(e.d)}</span><i aria-hidden="true">→</i></a></li>`).join("")}</ul></nav>
  </section>`;

  const U = T.UNDERSTAND;
  const understand = `
  <section class="container fh-sec" id="understand" aria-labelledby="fh-und-h">
    ${kicker("01", "Understand market heat")}
    <h2 class="hub-h" id="fh-und-h">Seven things set a vendor's or porter's heat load</h2>
    <p>${esc(U.intro)}</p>
    <ul class="fh-factors">${U.factors.map(f => `<li id="heat-${esc(f.id)}"><h3>${esc(f.t)}</h3><p>${esc(factorText(f))}</p><p class="fh-ask"><b>Ask:</b> ${esc(f.ask)}</p></li>`).join("")}</ul>
    <p class="fh-small">${esc(U.numbers)}</p>
    ${srcFold(U.factors.flatMap(f => f.claims || []))}
  </section>`;

  const plan = `
  <section class="container fh-sec" id="explore" aria-labelledby="fh-explore-h">
    ${kicker("02", "Explore a market")}
    <h2 class="hub-h" id="fh-explore-h">Walk through an open street market</h2>
    <p>Choose a zone on the plan to see where heat comes from there, who works or waits there, what to ask and what to measure. ${tag("Illustrative market plan, not a survey", "illus")}</p>
    <div class="fh-timebar" role="group" aria-label="Time of day" hidden><span class="fh-timebar__l">Show the market</span> <button type="button" class="fh-btn" data-time-set="peak" aria-pressed="true">At peak midday (13:30)</button> <button type="button" class="fh-btn" data-time-set="edge" aria-pressed="false">At the edges of the day (07:00 and 17:30)</button></div>
    <div class="fh-planwrap">
      <div class="fh-plan mh-plan" role="group" aria-label="Plan of an illustrative street market: choose a zone">
        ${T.ZONES.map(z => `<a class="fh-zone mh-zone--${esc(z.area)}" href="#zone-${esc(z.id)}" data-zone="${esc(z.id)}" aria-controls="zone-${esc(z.id)}"><b>${esc(z.short)}</b><span class="fh-zone__src">${esc(z.sources[0])}</span></a>`).join("")}
      </div>
      <p class="fh-plan__note">The produce row runs down the middle, with the loading bay at its back and the waiting edge on the road side; water, toilets and a nearby room serve everyone. The same zones are listed below in full.</p>
    </div>
    <div class="fh-zones">${T.ZONES.map(z => `
      <article class="fh-zonecard" id="zone-${esc(z.id)}" tabindex="-1" aria-labelledby="zone-${esc(z.id)}-h">
        <h3 id="zone-${esc(z.id)}-h">${esc(z.t)}</h3>
        <p class="mh-when" data-time="peak"><b>Around 13:30:</b> ${esc(z.time.peak)}</p>
        <p class="mh-when" data-time="edge"><b>At the edges of the day:</b> ${esc(z.time.edge)}</p>
        <div class="fh-zonegrid">
          <div><h4>Heat sources</h4><ul>${z.sources.map(s => `<li>${esc(s)}</li>`).join("")}</ul></div>
          <div><h4>Who works or waits here</h4><p>${esc(z.who)}</p></div>
          <div><h4>Ask the vendors and porters</h4><ul>${z.ask.map(s => `<li>${esc(s)}</li>`).join("")}</ul></div>
          <div><h4>Measurements that help</h4><ul>${z.measure.map(s => `<li>${esc(s)}</li>`).join("")}</ul></div>
        </div>
        <p class="fh-fixes"><b>Measures to consider:</b> ${z.fixes.map(recLink).join(" · ")}</p>
        <p class="fh-dep"><b>Depends on:</b> ${esc(z.depends)}</p>
      </article>`).join("")}
    </div>
  </section>`;

  const H = T.HEALTH, dims = H.dims.map(d => Object.assign({ id: d.id, t: d.t }, dimText(d) || {})).filter(d => d.d);
  const health = `
  <section class="container fh-sec" id="health" aria-labelledby="fh-health-h">
    ${kicker("03", "Health and equity")}
    <h2 class="hub-h" id="fh-health-h">What heat does in markets, and why it is unequal</h2>
    <p>${esc(H.intro)}</p>
    <div class="fh-kinds">${H.split.map(s => `<div class="cs-card"><p class="cs-note__label">${esc(s.t)}</p><p>${esc(s.d)}</p></div>`).join("")}</div>
    <ul class="fh-women">${dims.map(d => `<li id="equity-${esc(d.id)}"><h4>${esc(d.t)}</h4><p>${esc(d.d)}</p></li>`).join("")}</ul>
    <div class="cs-note fh-agency"><p class="cs-note__label">Protection without eviction or lost turns</p><p>${esc(H.agency.replace(/^Protection without eviction or lost turns\.\s*/, ""))}</p></div>
    <p class="fh-small">More on who heat reaches, and why: <a href="/heat-health-and-equity/">Heat, health and the ability to act</a> · <a href="/intersections/">Intersections</a> · <a href="/who-is-at-risk/">Who heat hits hardest</a>.</p>
    ${srcFold(dims.flatMap(d => d.claims || []))}
  </section>`;

  const evTags = r => evidenceOf(r, OK).map(e => tag(T.EV[e.type], e.type)).join(" ");
  const recCard = r => { const ev = evidenceOf(r, OK); const prop = ev[0].type === "proposal";
    return `<article class="fh-rec${prop ? " fh-rec--prop" : ""}" id="rec-${esc(r.id)}" data-fam="${esc(r.fam)}" data-rec="${esc(r.id)}">
      <h4 data-f="t">${esc(r.t)}</h4>
      <p class="fh-rec__ev">${evTags(r)}</p>
      <p data-f="addresses"><b>Addresses:</b> ${esc(r.addresses)}</p>
      <details><summary>How it works, when it fits, and its evidence</summary>
        <dl class="fh-recdl">
          <div><dt>How it works</dt><dd data-f="how">${esc(r.how)}</dd></div>
          <div><dt>Market types and settings</dt><dd data-f="where">${esc(r.where)}</dd></div>
          <div><dt>Works if</dt><dd data-f="works">${r.works.map(esc).join("; ")}</dd></div>
          <div><dt>Take care</dt><dd data-f="caution">${r.caution.length ? r.caution.map(esc).join("; ") : "Not assessed yet."}</dd></div>
          <div><dt>Upfront</dt><dd data-f="upfront">${/^none\.?$/i.test(r.upfront) ? "No equipment to buy. Time and coordination: local costing needed." : esc(r.upfront)}</dd></div>
          <div><dt>Running</dt><dd data-f="recurrent">${/^none\.?$/i.test(r.recurrent) ? "Not assessed: local costing needed." : esc(r.recurrent)}</dd></div>
          <div><dt>Who installs, runs and maintains it</dt><dd data-f="owners">${esc(r.owners)}</dd></div>
          ${r.voice ? `<div><dt>Vendors' and porters' part</dt><dd data-f="voice">${esc(r.voice)}</dd></div>` : ""}
          <div><dt>Equity and access</dt><dd data-f="equity">${esc(r.equity)}</dd></div>
          <div><dt>Evidence</dt><dd data-f="ev"><ul>${ev.map(e => `<li><b>${esc(T.EV[e.type])}.</b> ${e.note ? esc(e.note) + " " : ""}${e.claims.length ? e.claims.map(id => esc(CL[id].text)).join(" ") + " " + srcLinks(e.claims) : ""}</li>`).join("")}${prop ? "" : `<li>${esc(r.gap)}</li>`}</ul></dd></div>
          ${r.use ? `<div class="fh-use"><dt>Can people actually use this?</dt><dd><dl>${[["access", "Who controls access"], ["cost", "What using it costs in money, time or earnings"], ["work", "Who does the additional work"], ["paid", "Is that work paid and supported"], ["excluded", "Who might be left out"], ["info", "What personal information it needs"], ["shape", "Can the people it serves shape it"], ["accountable", "Who is accountable if it fails"], ["check", "What to check locally"]].map(([k, l]) => `<div><dt>${l}</dt><dd>${esc(r.use[k] || "Not assessed")}</dd></div>`).join("")}</dl></dd></div>` : `<div><dt>Can people actually use this?</dt><dd>Not assessed yet for this measure. The questions are on <a href="/heat-health-and-equity/#taxonomy">Heat, health and the ability to act</a>.</dd></div>`}
          <div><dt>Measure before and after</dt><dd data-f="measure">${esc(r.measure)}</dd></div>
          <div><dt>Cycles it touches</dt><dd>${(T.CYCLES[r.id] || []).filter(id => LOOPS[id]).map(id => `<a href="/loops/#${esc(id)}">${esc(LOOPS[id])}</a>`).join(" · ") || "None listed."}</dd></div>
          <div><dt>Pairs with</dt><dd>${(r.pair || []).map(recLink).join(" · ") || "None listed."}</dd></div>
        </dl>
      </details>
    </article>`; };

  const finderStatic = `<div class="fh-tablewrap" role="region" aria-label="Observed conditions and where to look" tabindex="0"><table class="fh-table"><caption>What you observe, why it matters, where to look, what to find out next</caption>
    <thead><tr><th scope="col">If you see</th><th scope="col">Why it matters</th><th scope="col">Measures to look at</th><th scope="col">Find out next</th></tr></thead>
    <tbody>${T.CONDITIONS.map(c => `<tr id="cond-${esc(c.id)}"><th scope="row">${esc(c.t)}</th><td data-label="Why it matters">${esc(c.why)}</td><td data-label="Measures to look at">${c.recs.map(recLink).join("; ")}</td><td data-label="Find out next">${esc(c.next)}</td></tr>`).join("")}</tbody></table></div>`;

  const library = `
  <section class="container fh-sec" id="library" aria-labelledby="fh-lib-h">
    ${kicker("04", "Compare interventions")}
    <h2 class="hub-h" id="fh-lib-h">The intervention library</h2>
    <p>${T.RECORDS.length} measures in ${T.FAMILIES.length} families, each with what it addresses, how it works, when it fits, what it needs, who runs it, and the kind of evidence behind it. Where this page has no checked source for a measure, the record says so and is marked a proposal requiring validation.</p>
    <details class="fh-evkey"><summary>What the evidence types mean</summary><dl>${Object.keys(T.EV).map(k => `<div><dt>${tag(T.EV[k], k)}</dt><dd>${esc(T.EV_NOTE[k])}</dd></div>`).join("")}</dl></details>
    <div class="fh-finder" id="finder">
      <h3 class="fh-h3">Find measures by what you observe</h3>
      <p>${esc(T.FINDER.intro)}</p>
      <fieldset class="fh-conds" hidden><legend>What do you see?</legend>${T.CONDITIONS.map(c => `<label><input type="checkbox" value="${esc(c.id)}"> ${esc(c.t)}</label>`).join("")}</fieldset>
      <div class="fh-results" aria-live="polite" hidden></div>
      <details class="fh-findertable" open><summary>All conditions as a table</summary>${finderStatic}</details>
    </div>
    <nav class="fh-fams" aria-label="Intervention families"><ul>${T.FAMILIES.map(f => `<li><a href="#fam-${esc(f.slug)}" data-fam="${esc(f.id)}"><span aria-hidden="true">${esc(f.id)}</span>${esc(f.t)}</a></li>`).join("")}</ul></nav>
    <div class="fh-tray" hidden aria-live="polite"></div>
    ${T.FAMILIES.map(f => `<section class="fh-fam" id="fam-${esc(f.slug)}" aria-labelledby="fam-${esc(f.slug)}-h" data-fam="${esc(f.id)}">
      <h3 class="fh-famh" id="fam-${esc(f.slug)}-h"><span aria-hidden="true">${esc(f.id)}</span>${esc(f.t)}</h3>
      <p class="fh-famd">${esc(f.d)}</p>
      <div class="fh-recs">${T.RECORDS.filter(r => r.fam === f.id).map(recCard).join("")}</div>
    </section>`).join("")}
    <div class="fh-compare" id="compare" hidden aria-labelledby="fh-cmp-h"><h3 class="fh-h3" id="fh-cmp-h">Compare side by side</h3><div class="fh-cmpbody"></div></div>
    <div class="fh-shortlist" id="shortlist" hidden aria-labelledby="fh-sl-h"><h3 class="fh-h3" id="fh-sl-h">Your shortlist</h3><p class="fh-small">Kept in this browser only.</p><ol class="fh-slist"></ol><p><button type="button" class="btn fh-print-sl">Print the shortlist</button></p></div>
    <noscript><p class="fh-small">With JavaScript on, you can tick conditions to filter the library, compare three measures side by side and print a shortlist. Every record is readable above without it.</p></noscript>
  </section>`;

  const assess = `
  <section class="container fh-sec" id="assess" aria-labelledby="fh-assess-h">
    ${kicker("05", "Worked examples")}
    <h2 class="hub-h" id="fh-assess-h">Four worked examples</h2>
    <p>Each follows the same path: what was observed, what is still unknown, candidate measures, the arrangements among the market, the city and vendors' associations that make them usable, and how to check they worked.</p>
    ${T.EXAMPLES.map(e => `<article class="fh-ex" id="${esc(e.id)}" aria-labelledby="${esc(e.id)}-h">
      <h3 id="${esc(e.id)}-h">${esc(e.t)}</h3>${tag(e.tag, "illus")}
      <ol class="fh-flow">
        <li><b>Observed problem</b><p>${esc(e.problem)}</p></li>
        <li><b>Missing information</b><p>${esc(e.missing)}</p></li>
        <li><b>Candidate measures</b><p>${e.measures.map(recLink).join(" · ")}</p></li>
        <li><b>Market, city and association arrangements</b><p>${esc(e.org)}</p></li>
        <li><b>Verification plan</b><p>${esc(e.verify)}</p></li>
      </ol>
    </article>`).join("")}
    <div class="fh-ws cs-panel" id="worksheet">
      ${kicker("06", "Walk the market together")}
      <h3 class="fh-h3">The worksheet: a heat check on one page</h3>
      <p>${esc(T.WORKSHEET.lede)}</p>
      <p><a class="btn" href="/${T.WORKSHEET.slug}/">Open the worksheet to print</a></p>
    </div>
  </section>`;

  const used = new Set(T.claimsUsed().filter(id => OK.has(id)));
  const evRows = Object.values(SRC).map(s => ({ s, n: [...used].filter(id => CL[id].rests_on.some(([k]) => k === s.key)).length })).filter(x => x.n);
  const evidence = `
  <section class="container fh-sec" id="gaps" aria-labelledby="fh-gaps-h">
    ${kicker("07", "What is not known")}
    <h2 class="hub-h" id="fh-gaps-h">Evidence gaps, stated plainly</h2>
    <ul class="fh-list">${T.GAPS.map(g => `<li>${esc(g)}</li>`).join("")}</ul>
    <p>Where studies stand cycle by cycle: <a href="/evidence-map/">the evidence map</a>.</p>
    <h3 class="fh-h3" id="evidence">The evidence behind this page</h3>
    <p>Every source below passed Common Shade's automated check: the page opened (or its archived copy did) and held each term the statements rest on. Passing the check means the source says what is cited, not that the source is right.</p>
    ${evRows.length ? `<div class="fh-tablewrap" role="region" aria-label="Evidence table" tabindex="0"><table class="fh-table"><caption>Sources, what kind of evidence each is, where it comes from, and how many statements on this page rest on it</caption>
      <thead><tr><th scope="col">Source</th><th scope="col">Kind</th><th scope="col">Geography</th><th scope="col">Statements</th></tr></thead>
      <tbody>${evRows.map(({ s, n }) => `<tr><th scope="row">${ext(s.url, `${s.publisher}: ${s.title} (${s.year})`)}</th><td data-label="Kind">${esc(s.kind)}</td><td data-label="Geography">${esc(s.where)}</td><td data-label="Statements">${n}</td></tr>`).join("")}</tbody></table></div>` : `<p>No source has passed the check yet; until one does, every record here reads as a proposal requiring validation.</p>`}
    <p class="fh-small">Found something we missed, or tried one of these measures in a market? <a href="/join/">Tell us through the join form</a>.</p>
  </section>
  <section class="container fh-sec" aria-labelledby="fh-rel-h">
    <h2 class="hub-h" id="fh-rel-h">Related on Common Shade</h2>
    <ul class="fh-related">
      <li><a href="/practical-actions/#market"><b>Practical actions in markets and neighbourhoods</b><span>the heat-resilient market sketch and its cards</span></a></li>
      <li><a href="/factory-heat/"><b>Heat inside factories</b><span>the same approach for indoor work</span></a></li>
      <li><a href="/shared-heat/"><b>Who shares the heat</b><span>one market followed through a hot season</span></a></li>
      <li><a href="/intersections/"><b>Intersections</b><span>same heat, different lives: a note and a game</span></a></li>
      <li><a href="/who-is-at-risk/"><b>Who heat hits hardest</b><span>the barriers behind unequal heat</span></a></li>
      <li><a href="/social-protection/"><b>Who could help a household through a hot season</b><span>income protection when heat stops work</span></a></li>
      <li><a href="/plan/"><b>Plan a response</b><span>the planning workbook</span></a></li>
    </ul>
  </section>`;

  const body = `${hero("Workplaces", esc(T.TITLE), esc(T.SUB))}
  ${opening}${understand}${plan}${health}${library}${assess}${evidence}
  <script>window.FH_OPTS=${JSON.stringify({ key: "mh-shortlist", where: "Market types and settings", start: T.ZONES[0].id })};window.FH_CONDITIONS=${JSON.stringify(T.CONDITIONS.map(c => ({ id: c.id, t: c.t, why: c.why, fams: c.fams, recs: c.recs, next: c.next })))};window.FH_FAMILIES=${JSON.stringify(T.FAMILIES.map(f => ({ id: f.id, slug: f.slug, t: f.t })))};</script>
  <script src="/factory-heat/factory.js?v=${V}" defer></script>`;
  const css = `\n  <link rel="stylesheet" href="/factory-heat/factory.css?v=${V}">\n  <link rel="stylesheet" href="/${T.SLUG}/market.css?v=${V}">`;
  write(T.SLUG, page(T.SLUG, T.TITLE, T.DESC, body, css));

  // the worksheet: one A4 page
  const WS = T.WORKSHEET;
  const wsBody = `
  <section class="container fhw mhw" aria-labelledby="fhw-h">
    <p class="fhw-back no-print"><a href="/${T.SLUG}/#worksheet">← Back to Heat in markets and street vending</a> · <button type="button" class="btn" onclick="window.print()">Print this worksheet</button></p>
    <h1 class="fhw-h" id="fhw-h">${esc(WS.title)}</h1>
    <p class="fhw-line">Market, street or ward: ______________________ · Date and time: ____________ · Walked with: ______________________</p>
    <p class="fhw-lede">${esc(WS.lede)}</p>
    <section class="fhw-part"><h2>1. Six quick checks across the market</h2>
      <table class="fhw-t fhw-grid"><thead><tr><th scope="col">What to look at together</th><th scope="col">Questions to ask vendors and porters</th><th scope="col">What we saw or heard</th><th scope="col">What gets in the way (fees, locks, wind, rent, eviction fear)</th></tr></thead>
      <tbody>${WS.checks.map(c => `<tr><th scope="row">${esc(c.t)}</th><td class="mhw-q">${esc(c.q)}</td><td></td><td></td></tr>`).join("")}</tbody></table></section>
    <section class="fhw-part"><h2>2. Protection check before any upgrade starts</h2>
      <ul class="fhw-checks">${WS.protect.map(c => `<li><span class="fhw-box" aria-hidden="true"></span>${esc(c)}</li>`).join("")}</ul></section>
    <section class="fhw-part"><h2>3. Three practical steps for the next 30 days</h2>
      <table class="fhw-t fhw-grid"><thead><tr>${WS.steps.map(c => `<th scope="col">${esc(c)}</th>`).join("")}</tr></thead><tbody>${[1, 2, 3].map(n => `<tr><td>${n}.</td>${"<td></td>".repeat(WS.steps.length - 1)}</tr>`).join("")}</tbody></table></section>
    <p class="fhw-note">${esc(WS.note)} Source: beattheheat.asia/${T.SLUG}/</p>
  </section>`;
  write(WS.slug, page(WS.slug, "Walk the market together", "A one-page printable heat check for vendor associations, women's collectives, market committees and ward teams: six quick checks, a protection check before any upgrade, and three steps for the next 30 days.", wsBody, css));

  if (left.size) console.warn(`market heat: shortened or left out passages resting on unconfirmed claims: ${[...left].join(", ")}`);
  console.log(`Heat in markets and street vending: ${T.RECORDS.length} measures, ${T.ZONES.length} zones, ${used.size} checked statements from ${evRows.length} sources`);
};

module.exports.md = function md(SITE) { const { OK } = load(); return T.md(SITE, OK); };
module.exports.evidenceOf = evidenceOf;
