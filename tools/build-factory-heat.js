// Heat inside factories (/factory-heat/) and its worksheet (/factory-heat/worksheet/).
// Words come from tools/factory-heat-text.js (shared with llms-full.txt). A passage or evidence line names the claims it
// rests on; only claims in research/2026-11/factory-heat/confirmed.json (the GitHub source check found every term)
// reach the page. A passage whose claims did not all pass is left out, and named in the build log; an intervention
// record left with no checked evidence shows as a proposal requiring validation, with its gap stated.
// The page reads in full without JavaScript; factory.js adds the floor plan selection, the finder, comparison and the
// printable shortlist. Called by tools/build-pages.js; md() by tools/build-static.js.
"use strict";
const fs = require("fs"), path = require("path");
const T = require("./factory-heat-text.js");
const BATCH = path.join(__dirname, "..", "research", "2026-11", "factory-heat");
// readers see a public page; the checker read the record behind it (Europe PMC for PubMed)
const PUBLIC = { trial: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7618560/" };

function load() {
  const C = JSON.parse(fs.readFileSync(path.join(BATCH, "claims.json"), "utf8"));
  const conf = JSON.parse(fs.readFileSync(path.join(BATCH, "confirmed.json"), "utf8"));
  const OK = new Set(conf.map(c => c.id));
  const SRC = Object.fromEntries(C.sources.map(s => [s.key, Object.assign({}, s, { url: PUBLIC[s.key] || s.url })]));
  const CL = Object.fromEntries(C.claims.map(c => [c.id, c]));
  return { C, OK, SRC, CL };
}

// the evidence a record keeps after the check; none left means a proposal requiring validation
function evidenceOf(r, OK) {
  const ev = r.ev.map(e => Object.assign({}, e, { claims: e.claims.filter(id => OK.has(id)) })).filter(e => e.claims.length);
  const had = r.ev.some(e => e.claims.length);
  return ev.length ? ev : [{ type: "proposal", claims: [], note: r.gap || (had ? "Occupational guidance describes this measure, but its source has not yet passed Common Shade's automated check, so this page does not cite it." : "No checked source on this page yet.") }];
}

module.exports = function factoryHeat({ page, write, esc, hero, V }) {
  const { OK, SRC, CL } = load();
  const left = new Set();
  const all = ids => { const miss = (ids || []).filter(id => !OK.has(id)); miss.forEach(m => left.add(m)); return !miss.length; };
  const shown = x => !x.claims || all(x.claims);
  const ext = (url, text) => `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(text)}<span class="visually-hidden"> (opens in a new tab)</span></a>`;
  const srcKeys = ids => [...new Set((ids || []).filter(id => OK.has(id)).flatMap(id => CL[id].rests_on.map(([k]) => k)))];
  const srcLinks = ids => srcKeys(ids).map(k => ext(SRC[k].url, `${SRC[k].publisher}, ${SRC[k].year}`)).join("; ");
  const srcFold = (ids, what = "Sources for this section") => { const ks = srcKeys(ids); return ks.length ? `<details class="fh-src"><summary>${esc(what)} (${ks.length})</summary><ul>${ks.map(k => `<li>${ext(SRC[k].url, `${SRC[k].publisher}: ${SRC[k].title} (${SRC[k].year})`)} <span class="fh-src__k">${esc(SRC[k].kind)} · ${esc(SRC[k].where)}</span></li>`).join("")}</ul></details>` : ""; };
  const tag = (label, kind) => `<span class="fh-tag fh-tag--${kind}">${esc(label)}</span>`;
  const REC = Object.fromEntries(T.RECORDS.map(r => [r.id, r]));
  const recLink = id => `<a href="#rec-${esc(id)}">${esc(REC[id].t)}</a>`;
  const famOf = id => T.FAMILIES.find(f => f.id === id);
  const kicker = (n, label) => `<p class="fh-kicker" aria-hidden="true"><span>${n}</span>${esc(label)}</p>`;

  // 1. opening
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

  // 2. the floor plan and its zones
  const plan = `
  <section class="container fh-sec" id="explore" aria-labelledby="fh-explore-h">
    ${kicker("01", "Explore a factory")}
    <h2 class="hub-h" id="fh-explore-h">Walk through a garment factory</h2>
    <p>Choose a zone on the floor plan to see where heat comes from there, how hard the work is, who works there, what to ask and what to measure. ${tag("Illustrative floor plan, not a thermal survey", "illus")}</p>
    <div class="fh-planwrap">
      <div class="fh-plan" role="group" aria-label="Floor plan of an illustrative garment factory: choose a zone">
        ${T.ZONES.map(z => `<a class="fh-zone fh-zone--${esc(z.area)}" href="#zone-${esc(z.id)}" data-zone="${esc(z.id)}" aria-controls="zone-${esc(z.id)}"><b>${esc(z.short)}</b><span class="fh-zone__src">${esc(z.sources[0])}</span></a>`).join("")}
      </div>
      <p class="fh-plan__note">The upper floor sits under the roof above sewing and pressing; utility rooms hold boilers and generators; water, toilets and rest spaces serve everyone. The same zones are listed below in full.</p>
    </div>
    <div class="fh-zones">${T.ZONES.map(z => `
      <article class="fh-zonecard" id="zone-${esc(z.id)}" tabindex="-1" aria-labelledby="zone-${esc(z.id)}-h">
        <h3 id="zone-${esc(z.id)}-h">${esc(z.t)}</h3>
        <div class="fh-zonegrid">
          <div><h4>Heat sources</h4><ul>${z.sources.map(s => `<li>${esc(s)}</li>`).join("")}</ul></div>
          <div><h4>Work and duration</h4><p>${esc(z.intensity)}</p><h4>Who works here</h4><p>${esc(z.who)}</p></div>
          <div><h4>Ask the workers</h4><ul>${z.ask.map(s => `<li>${esc(s)}</li>`).join("")}</ul></div>
          <div><h4>Measurements that help</h4><ul>${z.measure.map(s => `<li>${esc(s)}</li>`).join("")}</ul></div>
        </div>
        <p class="fh-fixes"><b>Measures to consider:</b> ${z.fixes.map(recLink).join(" · ")}</p>
        <p class="fh-dep"><b>Depends on:</b> ${esc(z.depends)}</p>
      </article>`).join("")}
    </div>
  </section>`;

  // 3. understand the heat
  const U = T.UNDERSTAND;
  const understand = `
  <section class="container fh-sec" id="understand" aria-labelledby="fh-und-h">
    ${kicker("02", "Understand the heat")}
    <h2 class="hub-h" id="fh-und-h">Seven things set a worker's heat load</h2>
    <p>${esc(U.intro)}</p>
    <ul class="fh-factors">${U.factors.map(f => `<li id="heat-${esc(f.id)}"><h3>${esc(f.t)}</h3><p>${esc(f.d)}</p><p class="fh-ask"><b>Ask:</b> ${esc(f.ask)}</p></li>`).join("")}</ul>
    <div class="cs-note cs-note--watch fh-contact"><p class="cs-note__label">A different hazard</p><h3>${esc(U.contact.t)}</h3><p>${esc(U.contact.d)}</p></div>
    <h3 class="fh-h3">Four words that are easily confused</h3>
    <dl class="fh-terms">${U.terms.map(t => `<div><dt>${esc(t.t)}</dt><dd>${esc(t.d)}</dd></div>`).join("")}</dl>
    <div class="fh-whys">${U.why.map(w => `<div class="cs-card"><h3>${esc(w.t)}</h3><p>${esc(w.d)}</p></div>`).join("")}</div>
    <p class="fh-small">${esc(U.numbers)}</p>
    ${srcFold([...U.introClaims, ...U.termsClaims, ...U.factors.flatMap(f => f.claims || []), ...U.why.flatMap(w => w.claims || [])])}
  </section>`;

  // 4. health and equity
  const H = T.HEALTH, W = H.women;
  const health = `
  <section class="container fh-sec" id="health" aria-labelledby="fh-health-h">
    ${kicker("03", "Health and equity")}
    <h2 class="hub-h" id="fh-health-h">What heat does to workers, and why it is unequal</h2>
    <p>${esc(H.intro)}</p>
    <div class="fh-kinds">${H.kinds.filter(shown).map(k => `<div class="cs-card"><p class="cs-note__label">${esc(k.t)}</p><p>${esc(k.d)}</p></div>`).join("")}</div>
    <ul class="fh-paths">${H.pathways.filter(shown).map(p => `<li><b>${esc(p.t)}.</b> ${esc(p.d)}</li>`).join("")}</ul>
    <h3 class="fh-h3" id="women">${esc(W.h)}</h3>
    <p>${esc(W.intro)}</p>
    ${shown({ claims: W.gapClaims }) ? `<div class="cs-note cs-note--example"><p class="cs-note__label">From a laboratory study</p><p>${esc(W.gap)}</p></div>` : ""}
    <ul class="fh-women">${W.items.filter(shown).map(i => `<li id="women-${esc(i.id)}"><h4>${esc(i.t)}</h4><p>${esc(i.d)}</p></li>`).join("")}</ul>
    <p>${esc(W.within)}</p>
    <div class="cs-note fh-agency"><p class="cs-note__label">Accommodation, not exclusion</p><p>${esc(W.agency)}</p></div>
    ${srcFold([...H.kinds.flatMap(k => k.claims || []), ...H.pathways.flatMap(p => p.claims || []), ...W.gapClaims, ...W.items.flatMap(i => i.claims || [])])}
  </section>`;

  // 5-7. library, finder, compare
  const evTags = r => evidenceOf(r, OK).map(e => tag(T.EV[e.type], e.type)).join(" ");
  const recCard = r => { const ev = evidenceOf(r, OK); const prop = ev[0].type === "proposal";
    return `<article class="fh-rec${prop ? " fh-rec--prop" : ""}" id="rec-${esc(r.id)}" data-fam="${esc(r.fam)}" data-rec="${esc(r.id)}">
      <h4 data-f="t">${esc(r.t)}</h4>
      <p class="fh-rec__ev">${evTags(r)}</p>
      <p data-f="addresses"><b>Addresses:</b> ${esc(r.addresses)}</p>
      <details><summary>How it works, when it fits, and its evidence</summary>
        <dl class="fh-recdl">
          <div><dt>How it works</dt><dd data-f="how">${esc(r.how)}</dd></div>
          <div><dt>Factory types and tasks</dt><dd data-f="where">${esc(r.where)}</dd></div>
          <div><dt>Works if</dt><dd data-f="works">${r.works.map(esc).join("; ")}</dd></div>
          <div><dt>Take care</dt><dd data-f="caution">${r.caution.length ? r.caution.map(esc).join("; ") : "None noted."}</dd></div>
          <div><dt>Upfront</dt><dd data-f="upfront">${esc(r.upfront)}</dd></div>
          <div><dt>Running</dt><dd data-f="recurrent">${esc(r.recurrent)}</dd></div>
          <div><dt>Who installs, runs and maintains it</dt><dd data-f="owners">${esc(r.owners)}</dd></div>
          ${r.voice ? `<div><dt>Workers' part</dt><dd data-f="voice">${esc(r.voice)}</dd></div>` : ""}
          ${r.equity ? `<div><dt>Equity and access</dt><dd data-f="equity">${esc(r.equity)}</dd></div>` : ""}
          <div><dt>Evidence</dt><dd data-f="ev"><ul>${ev.map(e => `<li><b>${esc(T.EV[e.type])}.</b> ${e.note ? esc(e.note) + " " : ""}${e.claims.length ? srcLinks(e.claims) : ""}</li>`).join("")}</ul></dd></div>
          <div><dt>Measure before and after</dt><dd data-f="measure">${esc(r.measure)}</dd></div>
          <div><dt>Pairs with</dt><dd>${(r.pair || []).map(recLink).join(" · ") || "None listed."}</dd></div>
        </dl>
      </details>
    </article>`; };

  const finderStatic = `<div class="fh-tablewrap" role="region" aria-label="Observed conditions and where to look" tabindex="0"><table class="fh-table"><caption>What you observe, why it matters, where to look, what to find out next</caption>
    <thead><tr><th scope="col">If you see</th><th scope="col">Why it matters</th><th scope="col">Families to look at</th><th scope="col">Investigate next</th></tr></thead>
    <tbody>${T.CONDITIONS.map(c => `<tr id="cond-${esc(c.id)}"><th scope="row">${esc(c.t)}</th><td data-label="Why it matters">${esc(c.why)}</td><td data-label="Families to look at">${c.fams.map(f => `<a href="#fam-${esc(famOf(f).slug)}">${esc(famOf(f).t)}</a>`).join("; ")}</td><td data-label="Investigate next">${esc(c.next)}</td></tr>`).join("")}</tbody></table></div>`;

  const library = `
  <section class="container fh-sec" id="library" aria-labelledby="fh-lib-h">
    ${kicker("04", "Compare interventions")}
    <h2 class="hub-h" id="fh-lib-h">The intervention library</h2>
    <p>${T.RECORDS.length} measures in twelve families, each with what it addresses, how it works, when it fits, what it needs, who runs it, and the type of evidence behind it. Where this page has no checked source, the record says so and is marked a proposal requiring validation.</p>
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
      <p class="fh-famd">${esc(f.d)}${f.id === "L" ? " These are institutional measures: their effects are rarely evaluated, and the records say so." : ""}</p>
      <div class="fh-recs">${T.RECORDS.filter(r => r.fam === f.id).map(recCard).join("")}</div>
    </section>`).join("")}
    <div class="fh-compare" id="compare" hidden aria-labelledby="fh-cmp-h"><h3 class="fh-h3" id="fh-cmp-h">Compare side by side</h3><div class="fh-cmpbody"></div></div>
    <div class="fh-shortlist" id="shortlist" hidden aria-labelledby="fh-sl-h"><h3 class="fh-h3" id="fh-sl-h">Your shortlist</h3><p class="fh-small">Kept in this browser only.</p><ol class="fh-slist"></ol><p><button type="button" class="btn fh-print-sl">Print the shortlist</button></p></div>
    <noscript><p class="fh-small">With JavaScript on, you can tick conditions to filter the library, compare three measures side by side and print a shortlist. Every record is readable above without it.</p></noscript>
  </section>`;

  // other manufacturing
  const others = `
  <section class="container fh-sec" id="other-factories" aria-labelledby="fh-oth-h">
    ${kicker("05", "Other factories")}
    <h2 class="hub-h" id="fh-oth-h">Beyond garment assembly</h2>
    <p>${esc(T.OTHERS.intro)}</p>
    <ul class="fh-others">${T.OTHERS.rows.map(r => `<li><h3>${esc(r.t)}</h3><p>${esc(r.d)}</p></li>`).join("")}</ul>
  </section>`;

  // 8-9. worked examples, measurement, worksheet
  const M = T.MEASURE;
  const assess = `
  <section class="container fh-sec" id="assess" aria-labelledby="fh-assess-h">
    ${kicker("06", "Plan an assessment")}
    <h2 class="hub-h" id="fh-assess-h">Four worked examples</h2>
    <p>Each follows the same path: what was observed, what is still unknown, candidate measures, the arrangements that make them usable, and how to check they worked.</p>
    ${T.EXAMPLES.map(e => `<article class="fh-ex" id="${esc(e.id)}" aria-labelledby="${esc(e.id)}-h">
      <h3 id="${esc(e.id)}-h">${esc(e.t)}</h3>${tag(e.tag, "illus")}
      <ol class="fh-flow">
        <li><b>Observed problem</b><p>${esc(e.problem)}</p></li>
        <li><b>Missing information</b><p>${esc(e.missing)}</p></li>
        <li><b>Candidate measures</b><p>${e.measures.map(recLink).join(" · ")}</p></li>
        <li><b>Organisational arrangements</b><p>${esc(e.org)}</p></li>
        <li><b>Verification plan</b><p>${esc(e.verify)}</p></li>
      </ol>
    </article>`).join("")}
    ${srcFold(T.EXAMPLES.flatMap(e => e.claims), "Sources behind these examples")}

    <h2 class="hub-h fh-h2b" id="measure">Measure effectiveness responsibly</h2>
    <p>${esc(M.intro)}</p>
    <dl class="fh-terms">${M.metrics.map(m => `<div><dt>${esc(m.t)}</dt><dd>${esc(m.d)}</dd></div>`).join("")}</dl>
    <h3 class="fh-h3">Good practice</h3>
    <ul class="fh-list">${M.practice.map(p => `<li>${esc(p)}</li>`).join("")}</ul>
    <h3 class="fh-h3">Four things that can be true, separately</h3>
    <ol class="fh-levels">${M.levels.map(l => `<li><b>${esc(l.t)}</b><p>${esc(l.d)}</p></li>`).join("")}</ol>
    <h3 class="fh-h3" id="law">Thresholds and the law</h3>
    <p>${esc(M.law)}</p>
    <div class="fh-tablewrap" role="region" aria-label="Examples of rules by jurisdiction" tabindex="0"><table class="fh-table"><caption>Examples of what rules say, by jurisdiction (not a complete list, and not legal advice)</caption>
      <thead><tr><th scope="col">Jurisdiction</th><th scope="col">What applies there</th></tr></thead>
      <tbody>${M.jurisdictions.filter(shown).map(j => `<tr><th scope="row">${esc(j.where)}</th><td data-label="What applies there">${esc(j.what)}</td></tr>`).join("")}</tbody></table></div>
    ${srcFold([...M.metricsClaims, ...M.jurisdictions.flatMap(j => j.claims)])}

    <div class="fh-ws cs-panel" id="worksheet">
      <h3 class="fh-h3">The worksheet: walk the floor together</h3>
      <p>${esc(T.WORKSHEET.lede)}</p>
      <p><a class="btn" href="/${T.WORKSHEET.slug}/">Open the worksheet to print</a></p>
    </div>
  </section>`;

  // gaps and evidence table
  const used = new Set(T.claimsUsed().filter(id => OK.has(id)));
  const evRows = Object.values(SRC).map(s => { const cl = [...used].filter(id => CL[id].rests_on.some(([k]) => k === s.key)); return { s, n: cl.length }; }).filter(x => x.n);
  const evidence = `
  <section class="container fh-sec" id="gaps" aria-labelledby="fh-gaps-h">
    ${kicker("07", "What is not known")}
    <h2 class="hub-h" id="fh-gaps-h">Evidence gaps, stated plainly</h2>
    <ul class="fh-list">${T.GAPS.map(g => `<li>${esc(g)}</li>`).join("")}</ul>
    <h3 class="fh-h3" id="evidence">The evidence behind this page</h3>
    <p>Every source below passed Common Shade's automated check: the page opened (or its archived copy did) and held each term the claims rest on. Passing the check means the source says what is cited, not that the source is right.</p>
    <div class="fh-tablewrap" role="region" aria-label="Evidence table" tabindex="0"><table class="fh-table"><caption>Sources, what kind of evidence each is, where it comes from, and how many statements on this page rest on it</caption>
      <thead><tr><th scope="col">Source</th><th scope="col">Kind</th><th scope="col">Geography</th><th scope="col">Statements</th></tr></thead>
      <tbody>${evRows.map(({ s, n }) => `<tr><th scope="row">${ext(s.url, `${s.publisher}: ${s.title} (${s.year})`)}</th><td data-label="Kind">${esc(s.kind)}</td><td data-label="Geography">${esc(s.where)}</td><td data-label="Statements">${n}</td></tr>`).join("")}</tbody></table></div>
    <p class="fh-small">This library will keep growing as new interventions and evidence are checked. Found something we missed, or used one of these measures? <a href="/join/">Tell us through the join form</a>.</p>
  </section>
  <section class="container fh-sec" aria-labelledby="fh-rel-h">
    <h2 class="hub-h" id="fh-rel-h">Related on Common Shade</h2>
    <ul class="fh-related">
      <li><a href="/practical-actions/#work"><b>Practical actions at work</b><span>water, breaks, warnings and income in heat</span></a></li>
      <li><a href="/who-is-at-risk/"><b>Who is at risk</b><span>workers, women, pregnancy and older people</span></a></li>
      <li><a href="/heat-tools/?decision=protect_workers"><b>Heat Tool Finder: plan worker protection</b><span>apps and guidance, each with its limits</span></a></li>
      <li><a href="/social-protection/"><b>Who could help a household through a hot season</b><span>income protection when heat stops work</span></a></li>
      <li><a href="/plan/"><b>Plan a response</b><span>the planning workbook</span></a></li>
    </ul>
  </section>`;

  const body = `${hero("Workplaces", esc(T.TITLE), esc(T.SUB))}
  ${opening}${plan}${understand}${health}${library}${others}${assess}${evidence}
  <script>window.FH_CONDITIONS=${JSON.stringify(T.CONDITIONS.map(c => ({ id: c.id, t: c.t, why: c.why, fams: c.fams, recs: c.recs, next: c.next })))};window.FH_FAMILIES=${JSON.stringify(T.FAMILIES.map(f => ({ id: f.id, slug: f.slug, t: f.t })))};</script>
  <script src="/${T.SLUG}/factory.js?v=${V}" defer></script>`;
  write(T.SLUG, page(T.SLUG, T.TITLE, T.DESC, body, `\n  <link rel="stylesheet" href="/${T.SLUG}/factory.css?v=${V}">`));

  // the worksheet, an A4 handout
  const WS = T.WORKSHEET;
  const zoneRows = T.ZONES.map(z => `<tr><th scope="row">${esc(z.short)}</th>${"<td></td>".repeat(4)}</tr>`).join("") + `<tr><th scope="row">Other: ______</th>${"<td></td>".repeat(4)}</tr>`;
  const wsBody = `
  <section class="container fhw" aria-labelledby="fhw-h">
    <p class="fhw-back no-print"><a href="/${T.SLUG}/#worksheet">← Back to Heat inside factories</a> · <button type="button" class="btn" onclick="window.print()">Print this worksheet</button></p>
    <h1 class="fhw-h" id="fhw-h">${esc(WS.title)}</h1>
    <p class="fhw-lede">${esc(WS.lede)}</p>
    ${WS.parts.map(p => `<section class="fhw-part"><h2>${esc(p.h)}</h2>
      ${p.rows ? `<table class="fhw-t"><tbody>${p.rows.map(r => `<tr><th scope="row">${esc(r)}</th><td></td></tr>`).join("")}</tbody></table>` : ""}
      ${p.zone ? `<table class="fhw-t fhw-grid"><thead><tr>${p.cols.map(c => `<th scope="col">${esc(c)}</th>`).join("")}</tr></thead><tbody>${zoneRows}</tbody></table>` : ""}
      ${p.checks ? `<ul class="fhw-checks">${p.checks.map(c => `<li><span class="fhw-box" aria-hidden="true"></span>${esc(c)}</li>`).join("")}</ul>` : ""}
      ${p.cols && !p.zone ? `<table class="fhw-t fhw-grid"><thead><tr>${p.cols.map(c => `<th scope="col">${esc(c)}</th>`).join("")}</tr></thead><tbody>${"<tr>" + "<td></td>".repeat(p.cols.length) + "</tr>"}${("<tr>" + "<td></td>".repeat(p.cols.length) + "</tr>").repeat(3)}</tbody></table>` : ""}
      ${p.next ? `<p class="fhw-line">Next check on (date): ____________ · Agreed by (worker side): ____________ · (management): ____________</p>` : ""}
    </section>`).join("")}
    <p class="fhw-note">${esc(WS.note)} Source: beattheheat.asia/${T.SLUG}/</p>
  </section>`;
  write(WS.slug, page(WS.slug, WS.title, "A printable worksheet for worker representatives and managers to walk a factory floor together, record heat sources and worker reports, check whether people can use protection, and agree actions and checks.", wsBody, `\n  <link rel="stylesheet" href="/${T.SLUG}/factory.css?v=${V}">`));

  if (left.size) console.warn(`factory heat: left out passages resting on unconfirmed claims: ${[...left].join(", ")}`);
};

module.exports.md = function md(SITE) { const { OK } = load(); return T.md(SITE, OK); };
module.exports.evidenceOf = evidenceOf;
