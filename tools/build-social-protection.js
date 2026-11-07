// Common Shade: /social-protection/, "Who could help a household through a hot season". Public schemes that could
// cushion a household's income and health costs in heat, country by country: a scheme finder, the steps of access with
// what is measured, delivery routes and organisations, the gaps, and what a map could show and how it could mislead.
// Data: SOCIAL_PROTECTION (data/social-protection/<country>.json, schema in its README); words shared with llms-full.txt
// in tools/social-protection-text.js. The page is complete without JavaScript; /social-protection/sp.js only filters.
// Called by tools/build-pages.js. Households appear in aggregate only; nothing here is an eligibility check.
"use strict";
const T = require("./social-protection-text.js");
module.exports = function socialProtection({ page, write, esc, hero, V, D }) {
  const SP = D.SOCIAL_PROTECTION || []; if (!SP.length) return;
  const n = T.counts(SP), sit = Object.fromEntries(T.SITUATIONS);
  const ext = (u, l) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(l)}<span class="visually-hidden"> (opens in a new tab)</span>&nbsp;<span aria-hidden="true">↗</span></a>`;
  const srcs = list => (list || []).length ? `<p class="sp-src">Sources: ${list.map(x => ext(x.url, x.label)).join(" · ")}</p>` : "";
  const val = v => v ? esc(v) : `<span class="sp-nc">${esc(T.NOT_CONFIRMED)}</span>`;
  const asOf = c => `Research as of ${esc(T.date(c.as_of))}${c.checked ? `; sources checked ${esc(T.date(c.checked))}` : ""}.`;

  const scheme = (s, c) => `<li class="sp-scheme" data-country="${c.id}" data-situations="${s.situations.join(" ")}" data-shock="${s.shock_responsive}" data-portable="${s.portable}">
      <details><summary><span class="sp-scheme__name">${esc(s.name)}</span><span class="sp-scheme__by">${esc(s.run_by)}</span>
        <span class="sp-tags"><span class="sp-tag">${esc(T.TYPE[s.type] || s.type)}</span><span class="sp-tag sp-tag--${s.status}">${esc(T.STATUS[s.status])}, as of ${esc(T.date(s.status_as_of))}</span>${s.situations.map(k => `<span class="sp-tag sp-tag--soft">${esc(sit[k])}</span>`).join("")}</span></summary>
        <dl class="sp-dl">
          <dt>Who is eligible</dt><dd>${val(s.who)}</dd><dt>What it gives</dt><dd>${val(s.gives)}</dd>
          <dt>How it is delivered</dt><dd>${val(s.delivery)}</dd><dt>Documents</dt><dd>${val(s.documents)}</dd>
          <dt>When it pays</dt><dd>${val(s.speed)}</dd><dt>If people move</dt><dd>${esc(T.PORTABLE[s.portable])}</dd>
          <dt>In a shock</dt><dd>${esc(T.SHOCK[s.shock_responsive])}</dd><dt>Why it matters in heat</dt><dd>${val(s.heat_relevance)}</dd>
          <dt>How sure</dt><dd>${esc(T.GRADE[s.grade])}. ${esc(s.level === "state" ? "A state scheme; rules differ by state." : "A national scheme; local delivery can differ.")}</dd>
        </dl>${srcs(s.sources)}</details></li>`;

  const country = (f, inner) => `<section class="sp-country" id="${esc(f.country.slug)}-${inner.key}" aria-labelledby="${esc(f.country.slug)}-${inner.key}-h">
      <h3 id="${esc(f.country.slug)}-${inner.key}-h" class="sp-country__h">${esc(f.country.name)}</h3>${inner.html}</section>`;
  const per = (key, fn) => SP.map(f => country(f, { key, html: fn(f) })).join("");

  const finder = per("schemes", f => `<p class="sp-meta">${asOf(f.country)}${f.country.unit_note ? " " + esc(f.country.unit_note) : ""}</p>
      <ul class="sp-schemes">${f.schemes.map(s => scheme(s, f.country)).join("")}</ul>`);
  const ladder = per("ladder", f => `<ol class="sp-ladder">${T.STEPS.map(([k, name]) => { const fs = f.ladder.filter(l => l.step === k);
      return `<li class="sp-step${fs.length ? "" : " is-empty"}"><b>${esc(name)}</b>${fs.length ? fs.map(l => `<p>${esc(l.finding)} <span class="sp-meta">${esc(l.group)}. ${esc(l.limit || "")}</span></p>${srcs(l.sources)}`).join("")
        : `<p class="sp-nc">Nobody has measured this here yet, in the sources checked.</p>`}</li>`; }).join("")}</ol>`);
  const routes = per("routes", f => f.routes.length ? `<ul class="sp-routes">${f.routes.map(r => `<li class="sp-route"><h4>${esc(r.name)} <span class="sp-meta">${esc(r.kind)}</span></h4>
      <p>${esc(r.does)} <span class="sp-meta">${esc(r.where)}</span></p>
      <div class="sp-two"><div><b>What it says about itself</b><p>${r.self_reported ? esc(r.self_reported) : `<span class="sp-nc">Nothing stated in the sources checked.</span>`}</p></div>
      <div><b>What independent studies found</b><p>${r.independent || r.evaluations ? esc([r.independent, r.evaluations].filter(Boolean).join(" ")) : `<span class="sp-nc">No independent study found in the sources checked.</span>`}</p></div></div>
      ${r.org_id ? `<p class="sp-meta"><a href="/heat-network/">In the heat network</a></p>` : ""}${srcs(r.sources)}</li>`).join("")}</ul>` : `<p class="sp-nc">No delivery route was confirmed in the sources checked.</p>`);
  const gaps = per("gaps", f => f.country.gaps.length ? `<ul class="sp-gaps">${f.country.gaps.map(g => `<li>${esc(g.text)}${srcs(g.sources)}</li>`).join("")}</ul>` : `<p class="sp-nc">No gap was confirmed in the sources checked.</p>`);
  const yn = v => v ? "Yes" : "Not established";
  const maps = per("maps", f => `<div class="sp-table" role="region" aria-label="Map data for ${esc(f.country.name)}" tabindex="0"><table>
      <thead><tr><th scope="col">What it measures</th><th scope="col">Place and year</th><th scope="col">Open licence</th><th scope="col">Shared place code</th></tr></thead>
      <tbody>${f.indicators.map(x => `<tr><td>${x.url ? ext(x.url, x.indicator) : esc(x.indicator)}<span class="sp-meta">${esc(x.publisher || "")}</span></td><td>${esc(x.unit_of_place || "")}${x.year ? `, ${esc(String(x.year))}` : ""}</td><td>${yn(x.open)}</td><td>${yn(x.joinable)}</td></tr>`).join("")}</tbody></table></div>
      ${f.country.map.rows.length ? `<details class="sp-more"><summary>A first map that would hold up</summary><dl class="sp-dl">${f.country.map.rows.map(([a, b]) => `<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join("")}</dl></details>` : ""}
      ${f.country.map.misreadings.length ? `<details class="sp-more"><summary>How it could mislead</summary><ul>${f.country.map.misreadings.map(m => `<li>${esc(m)}</li>`).join("")}</ul></details>` : ""}`);
  const questions = per("questions", f => `<ul class="sp-questions">${f.country.questions.map(q => `<li><b>${esc(q.q)}</b><p><span class="sp-meta">What is known:</span> ${esc(q.have)}</p><p><span class="sp-meta">A study that could answer it:</span> ${esc(q.could)} <span class="sp-meta">(${esc(q.scale)})</span></p></li>`).join("")}</ul>`);
  const evidence = SP.flatMap(f => f.evidence.map(e => ({ e, c: f.country })));
  const allSources = [...new Map(SP.flatMap(f => [...f.schemes, ...f.ladder, ...f.routes, ...f.evidence, ...f.country.summary, ...f.country.gaps].flatMap(x => x.sources || [])).map(s => [s.url, s])).values()];

  const body = `${hero("Act", esc(T.TITLE), `Heat cuts the hours people can safely work and brings costs for care. Public schemes can cushion part of that shock. ${n.schemes} schemes in ${n.countries} countries, what is known about who they reach, and where nothing responds.`)}
  <div class="container sp">
    <p class="sp-note"><b>This is not an eligibility check.</b> Rules change often and differ by place, so each scheme shows the date its status applies to; check with the scheme before relying on it. Households appear here only in aggregate.</p>
    <nav class="sp-jump" aria-label="On this page"><a href="#why">Why heat reaches household budgets</a><a href="#find">Find support</a><a href="#steps">Steps of access</a><a href="#routes">Delivery routes</a><a href="#gaps">Where nothing responds</a><a href="#maps">What a map could show</a><a href="#questions">Open questions</a><a href="#sources">Sources</a></nav>

    <section id="why" class="sp-sec" aria-labelledby="why-h"><h2 id="why-h" class="sp-h2">Why heat reaches household budgets</h2>
      <p>Heat cuts the hours people can safely work, and illness brings costs and lost days. On the map these are <a href="/#lost">Lost work hours and wages</a>, <a href="/#debt">Medical costs and debt</a> and <a href="/#heatstroke">Heatstroke and heat exhaustion</a>. Public schemes can cushion part of that shock. What the studies show:</p>
      <ul class="sp-evidence">${evidence.map(({ e, c }) => `<li><b>${esc(c.name)}:</b> ${esc(e.finding)}${e.effect ? ` <span class="sp-meta">${esc(e.effect)}</span>` : ""} <span class="sp-meta">Limit: ${esc(e.limit)}</span>${srcs(e.sources)}</li>`).join("")}</ul></section>

    <section id="find" class="sp-sec" aria-labelledby="find-h"><h2 id="find-h" class="sp-h2">Find support</h2>
      <p>Choose a country and a situation. Each scheme opens to show who runs it, who is eligible, what it gives, how it is delivered, the documents it asks for, whether it follows people who move, whether it can respond to a shock, and its sources.</p>
      <form class="sp-filter" id="sp-filter" hidden aria-label="Filter schemes">
        <label class="sp-field"><span>Country</span><select name="country"><option value="">All countries</option>${SP.map(f => `<option value="${f.country.id}">${esc(f.country.name)}</option>`).join("")}</select></label>
        <fieldset class="sp-field"><legend>Situation</legend><div class="sp-chips">${T.SITUATIONS.map(([k, l]) => `<label class="sp-chip"><input type="checkbox" name="need" value="${k}"><span>${esc(l)}</span></label>`).join("")}</div></fieldset>
        <div class="sp-toggles"><label class="sp-chip"><input type="checkbox" name="shock" value="1"><span>Can respond to a shock</span></label><label class="sp-chip"><input type="checkbox" name="moves" value="1"><span>Follows people who move</span></label></div>
        <p class="sp-count" id="sp-count" role="status" aria-live="polite"></p>
      </form>
      ${finder}
      <p class="sp-empty" id="sp-empty" hidden>No scheme in the checked set matches all of these. Try fewer choices; a scheme missing here may still exist.</p></section>

    <section id="steps" class="sp-sec" aria-labelledby="steps-h"><h2 id="steps-h" class="sp-h2">Steps of access</h2>
      <p>Between a scheme existing and a household receiving enough, on time, lie eight steps: aware, eligible, documented, applied, enrolled, received, adequate, on time. Where a step has been measured, the finding is shown with who was counted. The findings come from different studies of different people, so they are not one funnel.</p>
      ${ladder}</section>

    <section id="routes" class="sp-sec" aria-labelledby="routes-h"><h2 id="routes-h" class="sp-h2">Delivery routes and organisations</h2>
      <p>How support reaches people, in no particular order. What an organisation says about itself is kept apart from what independent studies found.</p>
      ${routes}</section>

    <section id="gaps" class="sp-sec" aria-labelledby="gaps-h"><h2 id="gaps-h" class="sp-h2">Where no public system responds</h2>
      <p>Gaps in the schemes checked here: these are not proof that nothing exists.</p>
      ${gaps}</section>

    <section id="maps" class="sp-sec" aria-labelledby="maps-h"><h2 id="maps-h" class="sp-h2">What a map could show, and how it could mislead</h2>
      <p>A map of heat and public support is tempting, and easy to misread. Very little of this data is both openly licensed and shares a place code, so it cannot yet be joined into one map that holds up. A few cautions apply everywhere:</p>
      <ul><li>Unknown is not zero: a place without data is not a place without need or support.</li><li>Counts from different schemes cannot be added up to a number of protected households, because people can be counted in several.</li><li>No single protection score is offered here, because the parts measure different things.</li><li>A scheme can exist on paper while delivery differs from place to place.</li></ul>
      ${maps}</section>

    <section id="questions" class="sp-sec" aria-labelledby="questions-h"><h2 id="questions-h" class="sp-h2">Open questions</h2>
      <p>What the evidence has not yet answered. Study sizes are illustrative, not power calculations.</p>
      ${questions}</section>

    <section id="sources" class="sp-sec" aria-labelledby="sources-h"><h2 id="sources-h" class="sp-h2">Sources</h2>
      <p>Every source was opened and checked for the terms and numbers quoted here before use. ${allSources.length} sources; all are also on <a href="/sources/">Sources and references</a>. Something wrong or out of date? <a href="/corrections/">Tell us, and we will correct it</a>.</p>
      <ul class="sp-srclist">${allSources.map(s => `<li>${ext(s.url, s.label)}</li>`).join("")}</ul></section>
  </div>
  <script src="/${T.SLUG}/sp.js?v=${V}" defer></script>`;
  write(T.SLUG, page(T.SLUG, T.TITLE, `Public schemes that could cushion a household through a hot season: ${n.schemes} schemes in ${n.countries} countries, the steps of access, delivery routes and where no public system responds.`, body,
    `\n  <link rel="stylesheet" href="/${T.SLUG}/sp.css?v=${V}">`));
  require("./site-counts.js")({ spSchemes: n.schemes, spCountries: n.countries });
};
