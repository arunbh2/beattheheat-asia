#!/usr/bin/env node
// Common Shade: /living-knowledge/ ("Living Knowledge: Local Practices for Heat Resilience"). Builds, from the public records
// only (tools/living-knowledge.js: every claim confirmed by the source check):
//   /living-knowledge/                 landing, browse and search (filters in the address; every card in the HTML)
//   /living-knowledge/<id>/            one page per practice: evidence drawer, climate fit, "What makes this possible?",
//                                      stakeholder guidance (editorial, labelled), review and rights; printable
//   /living-knowledge/compare/         up to four practices side by side (from ?ids=)
//   /living-knowledge/fit/             transparent fit questions
//   /living-knowledge/coverage/        country × domain ledger and research gaps
//   /living-knowledge/method/          method, evidence labels, rights, dates, updates and contributions
//   /living-knowledge/churu/           the Churu worked example
//   /living-knowledge/for/<group>/     a printable view for each stakeholder group
//   /living-knowledge/practices.json   public export with claims, sources, rights and limits
// plus md() for llms-full.txt and context() for linked pages. Rules: living-knowledge/lk-core.js. Words: tools/living-knowledge-text.js.
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), SITE = "https://beattheheat.asia";
const M = require("./living-knowledge.js"), C = require("../living-knowledge/lk-core.js"), T = require("./living-knowledge-text.js");
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const fmt = d => d ? new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : "Not yet";
const SOL = () => Object.fromEntries(JSON.parse(fs.readFileSync(path.join(ROOT, "research", "2026-10", "passive_solutions.json"), "utf8")).passive_solutions.map(s => [s.id, s.name]));
const ext = (u, l) => `<a href="${esc(u)}" rel="noopener" target="_blank">${esc(l)}<span class="visually-hidden"> (opens in a new tab)</span></a>`;
const chip = (cls, t, title) => `<span class="lk-chip lk-chip--${cls}"${title ? ` title="${esc(title)}"` : ""}>${esc(t)}</span>`;
const placeText = p => p.places.map(pl => `${pl.place}${pl.country !== "ASIA" ? "" : ""}`).join("; ");
const countries = p => [...new Set(p.places.map(pl => C.COUNTRY[pl.country]))].join(", ");

// a public practice as the browser needs it (no held claims, no restricted fields)
function pub(p, m) {
  return { id: p.id, title: p.title, summary: p.summary, domain: p.domain, category: p.category, climates: p.climates, settings: p.settings, places: p.places, local_names: p.local_names || [], evidence: p.evidence, fit: p.fit,
    requires: p.requires, labour: p.labour, water: p.water, cost: p.cost, fails_when: p.fails_when, uncertain: p.uncertain };
}
function card(p) {
  return `<article class="cs-card lk-card" id="p-${esc(p.id)}" data-id="${esc(p.id)}">
    <p class="lk-chips">${chip("domain", C.DOMAIN[p.domain])}${chip("cat", C.CATEGORY[p.category], C.CATEGORY_NOTE[p.category])}</p>
    <h3 class="lk-card__h"><a href="/living-knowledge/${esc(p.id)}/">${esc(p.title)}</a></h3>
    <p class="lk-where">${esc(placeText(p))}</p>
    <p>${esc(p.summary)}</p>
    <p class="lk-ev"><span class="lk-ev__k">Evidence</span> ${p.evidence.map(e => chip("ev-" + e, C.STATUS[e], C.STATUS_NOTE[e])).join("")}</p>
    <p class="lk-actions"><a class="lk-btn lk-btn--go" href="/living-knowledge/${esc(p.id)}/">Read the record</a> <button type="button" class="lk-btn" data-compare="${esc(p.id)}" aria-pressed="false" data-js hidden>Add to compare</button></p>
  </article>`;
}
function claimList(p, m) {
  return `<ul class="lk-claims">${p.claim_records.map(c => {
    const srcs = c.sources.map(s => m.src[s]).filter(Boolean);
    return `<li class="lk-claim lk-claim--${esc(c.status)}"><p>${chip("ev-" + c.status, C.STATUS[c.status], C.STATUS_NOTE[c.status])} ${esc(c.text)}</p>
      ${c.quant ? `<p class="lk-quant"><b>Number:</b> ${esc(c.quant.value)} ${esc(c.quant.unit)}. <b>Compared with:</b> ${esc(c.quant.comparator)}. <b>Period:</b> ${esc(c.quant.period)}. <b>Setting:</b> ${esc(c.quant.setting)}.</p>` : ""}
      ${c.restriction ? `<p class="lk-restrict">${esc(c.restriction)}</p>` : ""}${c.note ? `<p class="lk-sub">${esc(c.note)}</p>` : ""}
      <p class="lk-sub">Where: ${esc(c.locator)}. Source: ${srcs.map(s => ext(s.url, `${s.publisher}: ${s.title}`)).join("; ")}</p></li>`; }).join("")}</ul>`;
}
function sourceBlock(p, m) {
  return p.source_ids.map(id => m.src[id]).filter(Boolean).map(s => `<li><b>${esc(s.title)}</b>. ${esc(s.publisher)}${s.published ? `, ${esc(s.published)}` : ""}${s.doi ? `. DOI ${esc(s.doi)}` : ""}${s.pmid ? `; PMID ${esc(s.pmid)}` : ""}${s.pmcid ? `; ${esc(s.pmcid)}` : ""}.
    <span class="lk-sub">${esc(s.design || "")}${s.site ? `. ${esc(s.site)}` : ""}${s.sample ? `. ${esc(s.sample)}` : ""}${s.fieldwork ? `. Fieldwork: ${esc(s.fieldwork)}` : ""}. Access: ${esc(s.access || "Not stated")}. Licence: ${esc(s.licence || "Not stated")}. Funding: ${esc(s.funding || "Not reported")}. Limits: ${esc(s.limits || "")}</span>
    ${ext(s.url, "Open the source")}${(s.copies || []).length ? ` <span class="lk-sub">Other copies of the same study: ${esc(s.copies.join("; "))}</span>` : ""}</li>`).join("");
}

module.exports = function buildLivingKnowledge({ page, write, V }) {
  const bad = M.validate(); if (bad.length) throw new Error("living knowledge: " + bad.join("; "));
  const m = M.load(), P = m.public, sol = SOL(), css = `\n  <link rel="stylesheet" href="/living-knowledge/lk.css?v=${V}">`;
  const data = list => `<script>window.LKDATA=${JSON.stringify({ practices: list.map(p => pub(p, m)) }).replace(/</g, "\\u003c")};</script><script src="/living-knowledge/lk-core.js?v=${V}"></script><script src="/living-knowledge/lk.js?v=${V}"></script>`;
  const nav = cur => `<nav class="lk-nav" aria-label="Living Knowledge">${[["", "Browse"], ["fit/", "Fit questions"], ["compare/", "Compare"], ["churu/", "Churu example"], ["coverage/", "Coverage and gaps"], ["method/", "Method and rights"]].map(([u, l]) => `<a href="/living-knowledge/${u}"${cur === u ? ' aria-current="page"' : ""}>${esc(l)}</a>`).join("")}</nav>`;
  const hero = (eyebrow, h, lede) => `<header class="pg-hero"><div class="container"><p class="eyebrow">${eyebrow}</p><h1 class="pg-h1">${esc(h)}</h1>${lede ? `<p class="pg-lede">${esc(lede)}</p>` : ""}</div></header>`;
  const opts = (o, any) => `<option value="">${esc(any)}</option>` + o.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join("");
  const used = f => [...new Set(P.flatMap(f))];
  const tray = `<aside class="lk-tray cs-panel" data-tray hidden aria-label="Practices to compare"><p><b>Compare</b> <span data-tray-list></span></p><p><a class="lk-btn lk-btn--go" data-tray-go href="/living-knowledge/compare/">Compare side by side</a> <button type="button" class="lk-btn" data-tray-clear>Clear</button></p></aside>`;
  const ev = Object.keys(C.STATUS).filter(s => P.some(p => p.evidence.includes(s)));

  // ---- landing and browse
  const body = `${hero("Living Knowledge", T.title, T.lede)}
  <div class="container lk">${nav("")}
    <p class="lk-intro">${esc(T.intro)}</p>
    <p class="cs-note cs-note--limit"><span class="cs-note__label">Read this first</span>${esc(T.limits[0])} ${esc(T.limits[1])}</p>
    <section aria-labelledby="ways-h"><h2 class="hub-h" id="ways-h">Ways to explore</h2>
      <ul class="lk-ways">${Object.entries(C.DOMAIN).map(([k, l]) => { const n = P.filter(p => p.domain === k).length; return `<li><a href="?domain=${k}" data-quick="domain=${k}"><b>${esc(l)}</b><span>${n ? `${n} record${n === 1 ? "" : "s"}` : "No records yet: a gap"}</span></a></li>`; }).join("")}</ul>
      <p class="lk-more"><a href="/living-knowledge/fit/">Answer four questions about your setting</a> · <a href="/living-knowledge/churu/">How a city plan uses local practice</a> · <a href="/living-knowledge/coverage/">What has and has not been found</a> · Views for ${C.STAKE.map(([k, l]) => `<a href="/living-knowledge/for/${k}/">${esc(l.toLowerCase())}</a>`).join(", ")}</p></section>
    <section id="browse" aria-labelledby="browse-h"><h2 class="hub-h" id="browse-h">Browse the practices</h2>
      <form class="lk-filters" role="search" onsubmit="return false" aria-label="Filter practices" data-js hidden>
        <label class="lk-f lk-f--q"><span>Search names and places</span><input type="search" data-f="q" placeholder="For example: matka, roof, Dhaka"></label>
        <label class="lk-f"><span>Domain</span><select data-f="domain">${opts(Object.entries(C.DOMAIN).filter(([k]) => P.some(p => p.domain === k)), "Any domain")}</select></label>
        <label class="lk-f"><span>Country</span><select data-f="country">${opts(used(p => p.places.map(pl => pl.country)).map(c => [c, C.COUNTRY[c]]).sort((a, b) => a[1].localeCompare(b[1])), "Any country")}</select></label>
        <label class="lk-f"><span>Climate</span><select data-f="climate">${opts(used(p => p.climates).map(c => [c, C.CLIMATE[c]]), "Any climate")}</select></label>
        <label class="lk-f"><span>Setting</span><select data-f="setting">${opts(used(p => p.settings).map(s => [s, C.SETTING[s]]), "Any setting")}</select></label>
        <label class="lk-f"><span>Kind of evidence</span><select data-f="evidence">${opts(ev.map(e => [e, C.STATUS[e]]), "Any evidence")}</select></label>
        <label class="lk-f"><span>Knowledge category</span><select data-f="category">${opts(Object.entries(C.CATEGORY).filter(([k]) => P.some(p => p.category === k)), "Any category")}</select></label>
        <label class="lk-f"><span>Water it needs</span><select data-f="water">${opts(Object.entries(C.FIT.water).filter(([k]) => P.some(p => p.fit.water === k)), "Any")}</select></label>
        <p class="lk-tools"><button type="button" class="lk-btn" data-reset>Clear filters</button> <button type="button" class="lk-btn" data-copyview>Copy link to this view</button></p>
      </form>
      <p class="lk-count" data-count role="status" aria-live="polite">${P.length} practices with every claim checked against its source.</p>
      <div class="lk-grid" data-list>${P.map(card).join("\n")}</div>
      <p class="lk-none" data-none hidden>No practice matches these filters. Try fewer filters, or see <a href="/living-knowledge/coverage/">what has not been found yet</a>.</p>
    </section>
    <section class="cty-s" aria-labelledby="lim-h"><h2 id="lim-h">Limits of this repository</h2><ul class="he-list">${T.limits.map(l => `<li>${esc(l)}</li>`).join("")}</ul><p class="lk-sub">${esc(T.emergency)}</p></section>
    ${tray}
  </div>${data(P)}`;
  write("living-knowledge", page("living-knowledge", T.title, `${T.lede} ${P.length} documented practices from South and Southeast Asia, each with its evidence, limits and what it takes to keep it usable.`, body, css));

  // ---- detail pages
  const keep = new Set([...P.map(p => p.id), "compare", "fit", "coverage", "method", "churu", "for"]), dir = path.join(ROOT, "living-knowledge");
  fs.readdirSync(dir).filter(d => fs.statSync(path.join(dir, d)).isDirectory() && !keep.has(d)).forEach(d => fs.rmSync(path.join(dir, d), { recursive: true }));
  P.forEach(p => {
    const g = C.guidance(p), sourced = p.claim_records.filter(c => c.status === "guidance" || c.status === "policy");
    const possible = [["Authority", p.who.decides], ["Money", p.who.pays + (p.cost ? `. ${p.cost.text}` : ". Costs: not reported in the sources")], ["Maintenance", p.who.maintains], ["Labour", p.labour], ["Infrastructure and services", Object.entries(p.requires).map(([k, v]) => `${k}: ${v}`).join("; ")], ["Access", p.equity]];
    const b = `${hero(`<a href="/living-knowledge/">Living Knowledge</a> · ${esc(C.DOMAIN[p.domain])}`, p.title, p.summary)}
  <div class="container lk lk--one" data-one="${esc(p.id)}">${nav("x")}
    <p class="lk-chips">${chip("domain", C.DOMAIN[p.domain])}${chip("cat", C.CATEGORY[p.category], C.CATEGORY_NOTE[p.category])}${p.evidence.map(e => chip("ev-" + e, C.STATUS[e], C.STATUS_NOTE[e])).join("")}</p>
    <p class="lk-actions" data-js hidden><button type="button" class="lk-btn" data-compare="${esc(p.id)}" aria-pressed="false">Add to compare</button> <button type="button" class="lk-btn" data-print>Print this record</button> <button type="button" class="lk-btn" data-copy="${SITE}/living-knowledge/${esc(p.id)}/">Copy link</button></p>
    ${p.restricted_advice ? `<p class="cs-note cs-note--watch"><span class="cs-note__label">Documented, not recommended</span>${esc(T.emergency)}</p>` : ""}
    <section class="lk-sec"><h2>What people do</h2><p>${esc(p.description)}</p></section>
    <section class="lk-sec"><h2>Where, and whose knowledge</h2>
      <dl class="lk-dl"><div><dt>Documented in</dt><dd>${esc(placeText(p))} <span class="lk-sub">(${esc(countries(p))}; precision as the sources give it, no household locations)</span></dd></div>
      ${(p.local_names || []).length ? `<div><dt>Local names</dt><dd>${p.local_names.map(n => `<i lang="${n.language.startsWith("Hindi") ? "hi-Latn" : "und-Latn"}">${esc(n.name)}</i> (${esc(n.language)}): ${esc(n.note)}`).join("; ")}</dd></div>` : ""}
      <div><dt>Knowledge category</dt><dd>${esc(C.CATEGORY[p.category])}. ${esc(p.category_basis)}</dd></div>
      <div><dt>Settings</dt><dd>${esc(p.settings.map(s => C.SETTING[s]).join(", "))}</dd></div></dl></section>
    <section class="lk-sec"><h2>Why it might work</h2><p><span class="lk-reading">Proposed mechanism.</span> ${esc(p.mechanism)}</p></section>
    <section class="lk-sec"><h2>What the evidence says</h2><details class="lk-drawer" open><summary>Every claim, with its kind of evidence and source</summary>${claimList(p, m)}</details></section>
    <section class="lk-sec"><h2>Climate fit and transferability</h2><dl class="lk-dl">
      <div><dt>Documented here</dt><dd>${esc(p.climates.map(c => C.CLIMATE[c]).join(", "))}: ${esc(placeText(p))}</dd></div>
      <div><dt>What it depends on</dt><dd>${esc(C.FIT.humidity[p.fit.humidity])}. ${esc(C.FIT.water[p.fit.water])}. ${esc(C.FIT.control[p.fit.control])}.</dd></div>
      <div><dt>Where it may not work</dt><dd>${esc(p.fails_when)}</dd></div>
      <div><dt>Elsewhere</dt><dd>Requires local assessment. It has not been tested beyond the places named, and hotter nights, water shortages or crowding can change how it performs.</dd></div></dl></section>
    <section class="lk-sec"><h2>Benefits, uncertainties and cautions</h2><dl class="lk-dl"><div><dt>Observed or described benefits</dt><dd>${esc(p.benefits)}</dd></div><div><dt>Still uncertain</dt><dd>${esc(p.uncertain)}</dd></div><div><dt>Cautions</dt><dd>${esc(p.contraindications)}</dd></div></dl></section>
    <section class="lk-sec cs-panel lk-possible"><h2>What makes this possible?</h2><dl class="lk-dl">${possible.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl></section>
    <section class="lk-sec"><h2>What can I do with this?</h2>
      ${sourced.length ? `<h3>What the sources say</h3><ul class="he-list">${sourced.map(c => `<li>${chip("ev-" + c.status, C.STATUS[c.status])} ${esc(c.text)}</li>`).join("")}</ul>` : ""}
      <h3>Suggestions by group</h3><p class="lk-sub">${esc(T.editorial)}</p>
      <dl class="lk-dl lk-stake">${g.map(([k, l, t]) => `<div><dt><a href="/living-knowledge/for/${k}/">${esc(l)}</a></dt><dd>${esc(t)}</dd></div>`).join("")}</dl></section>
    <section class="lk-sec"><h2>Questions an evaluation could answer</h2><ul class="he-list">${p.evaluation.map(q => `<li>${esc(q)}</li>`).join("")}</ul></section>
    ${(p.links.solutions || []).length || (p.links.pages || []).length ? `<section class="lk-sec"><h2>Related on Common Shade</h2><ul class="sol-ul">${(p.links.solutions || []).map(s => `<li><a href="/solutions/#${esc(s)}">${esc(sol[s] || s)}</a> <span class="lk-sub">(solutions library: performance evidence)</span></li>`).join("")}${(p.links.pages || []).map(([u, l]) => `<li><a href="${esc(u)}">${esc(l)}</a></li>`).join("")}</ul></section>` : ""}
    <section class="lk-sec"><h2>Sources</h2><ol class="lk-sources">${sourceBlock(p, m)}</ol></section>
    <section class="lk-sec lk-review"><h2>Review, rights and corrections</h2><dl class="lk-dl">
      <div><dt>Sources last read by the check</dt><dd>${esc(fmt(p.checked))}</dd></div><div><dt>Evidence last reviewed by a person</dt><dd>${esc(fmt(p.review.substantive))} (${esc(p.review.by)})</dd></div>
      <div><dt>Community review</dt><dd>${esc(p.review.community)}</dd></div><div><dt>Expert review</dt><dd>${esc(p.review.expert)}</dd></div>
      <div><dt>Rights</dt><dd>${esc(p.rights.summary)} ${esc(p.rights.reuse)}</dd></div><div><dt>Corrections</dt><dd><a href="/corrections/">Tell us what is wrong or missing</a>.</dd></div></dl></section>
    ${tray}
  </div>${data([p])}`;
    write(`living-knowledge/${p.id}`, page(`living-knowledge/${p.id}`, `${p.title}: Living Knowledge`, p.summary.slice(0, 280), b, css));
  });

  // ---- compare
  write("living-knowledge/compare", page("living-knowledge/compare", "Compare practices: Living Knowledge", "Up to four documented practices side by side: climate, evidence, what each needs, labour, water, costs, upkeep and uncertainty.",
    `${hero('<a href="/living-knowledge/">Living Knowledge</a>', "Compare practices", "Up to four practices side by side. Missing information reads \"Not reported\"; nothing is filled in.")}
  <div class="container lk">${nav("compare/")}
    <div data-compare-out><p>Choose up to four practices with "Add to compare" on the <a href="/living-knowledge/#browse">browse page</a> or a practice's own page. ${esc("A comparison needs JavaScript; every record is also readable on its own page.")}</p></div>
  </div>${data(P)}`, css));

  // ---- fit questions
  const q = (name, legend, list) => `<fieldset class="lk-q"><legend>${esc(legend)}</legend>${list.map(([v, l]) => `<label><input type="radio" name="${name}" value="${esc(v)}"> ${esc(l)}</label>`).join("")}</fieldset>`;
  write("living-knowledge/fit", page("living-knowledge/fit", "Fit questions: Living Knowledge", "Four questions about your setting return the documented practices that may fit, with the reasons and limits for each. No prediction of cooling, no safety verdict.",
    `${hero('<a href="/living-knowledge/">Living Knowledge</a>', "Which practices might fit your setting?", "Four questions. The answers stay in your browser. Each result says why it is shown and what could make it unsuitable.")}
  <div class="container lk">${nav("fit/")}
    <p class="cs-note cs-note--limit"><span class="cs-note__label">What this is not</span>These are simple rules from each record's own fields. They do not predict how much cooler anything will be and do not say any practice is safe for a person or place. ${esc(T.emergency)}</p>
    <form class="lk-fit" data-fit data-js hidden onsubmit="return false">
      ${q("setting", "Where do you want to act?", Object.entries(C.SETTING))}
      ${q("humidity", "What is the heat usually like?", [["dry", "Dry heat"], ["humid", "Humid heat"], ["unsure", "Not sure, or both"]])}
      ${q("water", "Is water easy to get in the hot season?", [["reliable", "Usually"], ["limited", "Often limited"], ["unsure", "Not sure"]])}
      ${q("control", "Who can make the change?", [["none", "I can, on my own"], ["household", "My household"], ["owner", "The owner of the building or land"], ["employer", "An employer"], ["authority", "A council, city or authority"]])}
      <p><button type="button" class="lk-btn" data-fit-reset>Start again</button></p>
    </form>
    <noscript><p>The fit questions need JavaScript. You can <a href="/living-knowledge/#browse">browse every practice</a> and filter by setting, climate and water instead.</p></noscript>
    <p class="lk-count" data-fit-count role="status" aria-live="polite"></p>
    <ol class="lk-fitlist" data-fit-out></ol>
  </div>${data(P)}`, css));

  // ---- coverage and gaps
  const cov = M.coverage(), STATE = { documented: ["Documented", "Two or more checked records"], preliminary: ["Preliminary", "One checked record"], "searched-none": ["Searched; none located", "Searched in this edition; no eligible evidence located. This does not mean no practice exists."], "not-searched": ["Not searched", ""] };
  const dCounts = Object.keys(C.DOMAIN).map(d => [d, P.filter(p => p.domain === d).length]).sort((a, b) => a[1] - b[1]);
  const log = JSON.parse(fs.readFileSync(path.join(ROOT, "research", "2026-11", "living-knowledge", "search-log.json"), "utf8")), nq = log.runs.reduce((a, r) => a + r.queries.length, 0);
  const SCR = JSON.parse(fs.readFileSync(path.join(ROOT, "research", "2026-11", "living-knowledge", "screening.json"), "utf8")), BL = JSON.parse(fs.readFileSync(path.join(ROOT, "research", "2026-11", "living-knowledge", "blocked.json"), "utf8"));
  write("living-knowledge/coverage", page("living-knowledge/coverage", "Coverage and research gaps: Living Knowledge", "Which countries and domains were searched, what was found, where the evidence is thin, and which questions an evaluation could answer.",
    `${hero('<a href="/living-knowledge/">Living Knowledge</a>', "Coverage and research gaps", "What was searched, what was found, and where the record is thin. A blank is a gap in the evidence found, not in the practices that exist.")}
  <div class="container lk">${nav("coverage/")}
    <p>${nq} logged searches across ${log.runs.length} runs (Europe PMC and Crossref, ${esc(fmt(log.runs[0].date))}), plus official pages and the seed sources. Every country in South and Southeast Asia was named in the searches; local-language searches were not run systematically.</p>
    <ul class="lk-legend">${["documented", "preliminary", "searched-none"].map(k => `<li><span class="lk-cell lk-cell--${k}">${esc(STATE[k][0])}</span> ${esc(STATE[k][1])}</li>`).join("")}</ul>
    <div class="lk-tablewrap" role="region" aria-label="Coverage by country and domain" tabindex="0"><table class="lk-table"><caption class="visually-hidden">Coverage of each country and domain in this edition</caption>
      <thead><tr><th scope="col">Country</th>${Object.values(C.DOMAIN).map(d => `<th scope="col">${esc(d)}</th>`).join("")}</tr></thead>
      <tbody>${cov.map(r => `<tr><th scope="row">${esc(C.COUNTRY[r.code])} <span class="lk-sub">${esc(r.region)}</span></th>${Object.keys(C.DOMAIN).map(d => `<td><span class="lk-cell lk-cell--${r.cells[d]}">${esc(STATE[r.cells[d]][0])}</span></td>`).join("")}</tr>`).join("")}</tbody></table></div>
    <section class="cty-s"><h2>Where the evidence is thinnest</h2><ul class="he-list">${dCounts.slice(0, 4).map(([d, n]) => `<li><b>${esc(C.DOMAIN[d])}:</b> ${n} checked record${n === 1 ? "" : "s"}.</li>`).join("")}
      <li><b>Southeast Asia:</b> ${P.filter(p => p.places.some(pl => M.SOUTHEAST.includes(pl.country))).length} of ${P.length} records. Traditional houses in Malaysia, Indonesia and the Philippines are studied in architecture journals this edition could not read in full.</li>
      <li><b>Care, pregnancy and night heat:</b> the only study of women's adaptation in pregnancy in India found is a protocol, with findings still to come; a review of state heat plans found twelve of 35 with no recommendations for pregnant or lactating women.</li>
      <li><b>Measured effects on people:</b> measurements in this edition are of buildings, streets, sites and animals; none measures a local practice's effect on people's heat strain or illness.</li></ul></section>
    <section class="cty-s"><h2>Decisions that need evidence</h2><ul class="he-list"><li>Before a city distributes earthen pots or promotes traditional roofs, measure water safety and indoor temperatures in local homes.</li><li>Before changing work hours, check what happens to earnings, childcare and transport.</li><li>Before promoting evaporative practices, check humidity and water supply in the hot season.</li></ul><p class="lk-sub">${esc(T.editorial)}</p></section>
    <section class="cty-s"><h2>Leads for the next edition</h2><ul class="he-list">${SCR.leads_for_next_edition.map(l => `<li>${esc(l)}</li>`).join("")}</ul></section>
    <section class="cty-s"><h2>Sources that could not be read in full</h2><ul class="he-list">${BL.records.map(r => `<li>${esc(r.source)}: ${esc(r.status)}. ${esc(r.action)}</li>`).join("")}</ul></section>
    ${m.held.length ? `<p class="lk-sub">${m.held.length} draft record${m.held.length === 1 ? " is" : "s are"} held back until every claim passes the source check.</p>` : ""}
  </div>`, css));

  // ---- method and rights
  write("living-knowledge/method", page("living-knowledge/method", "Method and rights: Living Knowledge", "How the Living Knowledge repository was researched, what each evidence label means, how knowledge rights are handled, and how it is updated and corrected.",
    `${hero('<a href="/living-knowledge/">Living Knowledge</a>', "Method and rights", "How this was researched, what the labels mean, and whose knowledge it is.")}
  <div class="container lk">${nav("method/")}
    <section class="cty-s"><h2>How it was researched</h2><p>${esc(T.method.what)}</p><p>${esc(T.method.gate)}</p><p>This is a targeted evidence scan, not a systematic review. Open-access, English-language and biomedical-index biases are real; building, textile and craft knowledge is under-represented in the indexes searched.</p></section>
    <section class="cty-s"><h2>What each evidence label means</h2><dl class="lk-dl">${Object.keys(C.STATUS).map(k => `<div><dt>${chip("ev-" + k, C.STATUS[k])}</dt><dd>${esc(C.STATUS_NOTE[k])}</dd></div>`).join("")}</dl><p>No record carries a score or a "best practice" badge. Qualitative evidence can be strong about experience, power and acceptability without proving that a temperature fell.</p></section>
    <section class="cty-s"><h2>Knowledge categories</h2><dl class="lk-dl">${Object.keys(C.CATEGORY).map(k => `<div><dt>${esc(C.CATEGORY[k])}</dt><dd>${esc(C.CATEGORY_NOTE[k])}</dd></div>`).join("")}</dl><p>None is ranked above another. A practice is called Indigenous only where a source identifies the knowledge holders as Indigenous peoples; rural or desert location is never a basis.</p></section>
    <section class="cty-s"><h2>Rights and community authority</h2><p>${esc(T.rights)}</p><p>No community, organisation or expert was contacted, and no record claims their review, consent or partnership.</p></section>
    <section class="cty-s"><h2>Dates and updates</h2><p>${esc(T.method.dates)}</p><p>${esc(T.method.updates)}</p></section>
    <section class="cty-s"><h2>Corrections and contributions</h2><p>${esc(T.contribute)} <a href="/corrections/">Corrections</a> · <a href="/join/">Join</a></p></section>
    <section class="cty-s"><h2>All sources</h2><ol class="lk-sources">${m.sources.map(s => `<li><b>${esc(s.title)}</b>. ${esc(s.publisher)}. ${esc(s.design || "")}. Licence: ${esc(s.licence || "Not stated")}. Check: ${esc(/^OK|^REDIRECT/.test(s.check_status) ? "opened" : /^BLOCKED/.test(s.check_status) ? "refused automated reading (archived copy used where available)" : s.check_status)}${s.checked ? `, read ${esc(fmt(s.checked))}` : ""}. ${ext(s.url, "Open")}<span class="lk-sub">${esc(s.limits || "")}</span></li>`).join("")}</ol>
      <p class="lk-sub">Files: <a href="https://github.com/arunbh2/beattheheat-asia/tree/main/research/2026-11/living-knowledge">protocol, search log, screening, appraisal and blocked-source register</a> · <a href="/living-knowledge/practices.json">public data (JSON)</a></p></section>
  </div>`, css));

  // ---- Churu worked example
  const ch = id => m.byClaim[id] && m.byClaim[id].confirmed;
  const ladder = [["documented", ch("c-clothing-churu") || ch("c-lanes-churu") ? "yes" : "unknown", "Section 2.3.3 describes traditional clothing, diet and architecture."],
    ["assigned", ch("c-lime-churu") ? "yes" : "unknown", "The mitigation table names the Municipal Council Churu (with the Rajasthan Housing Board) for traditional architecture, and the council for cool clothing and community matkas."],
    ["budgeted", "partly", "The table names municipal funds and, for some measures, MP and MLA funds as sources; the estimated budget column is blank."],
    ["implemented", "unknown", "No report of delivery was found in the sources reviewed."], ["evaluated", "unknown", "No monitoring or evaluation was found in the sources reviewed."]];
  const LAB = { yes: "Yes, in the plan", partly: "Partly", unknown: "Not known from the sources" };
  write("living-knowledge/churu", page("living-knowledge/churu", "Churu worked example: Living Knowledge", "How Churu's heat action plan documents traditional clothing, food and architecture and turns some of it into measures with named responsibilities, and what is not yet known.",
    `${hero('<a href="/living-knowledge/">Living Knowledge</a>', T.churu.h, T.churu.lede)}
  <div class="container lk">${nav("churu/")}
    <ol class="lk-ladder">${ladder.map(([k, s, t]) => `<li class="lk-step lk-step--${s}"><b>${esc(T.churu.ladder.find(x => x[0] === k)[1])}</b> ${chip("step-" + s, LAB[s])}<p>${esc(t)}</p></li>`).join("")}</ol>
    <section class="cty-s"><h2>Practices the plan names</h2><ul class="sol-ul">${["loose-cotton-clothing", "rajasthani-garments", "lime-coating", "courtyards-lanes", "matka", "public-water"].filter(id => P.some(p => p.id === id)).map(id => { const p = P.find(x => x.id === id); return `<li><a href="/living-knowledge/${id}/">${esc(p.title)}</a></li>`; }).join("")}</ul></section>
    <section class="cty-s"><h2>Possible roles beyond the plan</h2><p class="lk-sub">Proposed applications, not assigned by the plan. ${esc(T.editorial)}</p><ul class="he-list"><li>Health services: check the safety of stored water in community pots, and pair cool clothing advice with heat illness signs.</li><li>Local artisans and builders: keep lime and earth skills available, with structural and fire checks.</li><li>Communities: say which practices still work, for whom, and at whose labour.</li><li>Researchers: measure indoor temperatures in traditional and new houses in the same wards.</li></ul></section>
    <p class="cs-note cs-note--limit"><span class="cs-note__label">One example</span>${esc(T.churu.note)}</p>
    <p class="lk-sub">Source: Churu Heat Action Plan (Municipal Council Churu with NRDC India and Mahila Housing Trust; posted by the Global Heat Health Information Network on 27 May 2025). ${ext(m.src.churu.url, "Open the plan")}</p>
  </div>`, css));

  // ---- stakeholder views
  C.STAKE.forEach(([k, l]) => {
    write(`living-knowledge/for/${k}`, page(`living-knowledge/for/${k}`, `${l}: Living Knowledge`, `What ${l.toLowerCase()} could do with each documented local heat practice, with the evidence, limits and enabling conditions.`,
      `${hero('<a href="/living-knowledge/">Living Knowledge</a>', `For ${l.toLowerCase()}`, "One line per practice: a suggestion, the strongest kind of evidence, and what it depends on. Printable.")}
  <div class="container lk">${nav("x")}
    <p class="lk-sub">${esc(T.editorial)} <button type="button" class="lk-btn" data-print data-js hidden>Print</button></p>
    <ol class="lk-stakelist">${P.map(p => { const t = C.guidance(p).find(x => x[0] === k)[2]; return `<li><h2 class="lk-card__h"><a href="/living-knowledge/${p.id}/">${esc(p.title)}</a></h2><p>${esc(t)}</p><p class="lk-sub">${esc(C.DOMAIN[p.domain])} · Evidence: ${esc(p.evidence.map(e => C.STATUS[e]).join("; "))} · Depends on: ${esc(C.FIT.control[p.fit.control])}; ${esc(C.FIT.water[p.fit.water]).toLowerCase()} · Documented in ${esc(countries(p))}</p></li>`; }).join("")}</ol>
    <p class="lk-sub">${esc(T.limits[0])} ${esc(T.emergency)} Sources and dates are on each practice's page.</p>
  </div>${data([])}`, css));
  });

  // ---- public export (public records only; no held claims)
  fs.writeFileSync(path.join(dir, "practices.json"), JSON.stringify({ about: "Living Knowledge (Common Shade): public practice records, each with its claims, sources, licences, limits and review status. Only records whose every claim passed the source check. Common Shade's summaries are CC BY 4.0; sources keep their own licences.", built: new Date().toISOString().slice(0, 10),
    practices: P.map(p => Object.assign(pub(p, m), { url: `${SITE}/living-knowledge/${p.id}/`, description: p.description, mechanism: p.mechanism, benefits: p.benefits, contraindications: p.contraindications, who: p.who, equity: p.equity, review: p.review, rights: p.rights, checked: p.checked,
      claims: p.claim_records.map(c => ({ id: c.id, text: c.text, status: c.status, kind: C.STATUS[c.status], outcome: c.outcome, locator: c.locator, quant: c.quant || null, restriction: c.restriction || null, sources: c.sources })) })),
    sources: m.sources.filter(s => P.some(p => p.source_ids.includes(s.id))).map(s => ({ id: s.id, title: s.title, publisher: s.publisher, url: s.url, doi: s.doi || null, pmid: s.pmid || null, pmcid: s.pmcid || null, published: s.published || null, design: s.design || null, licence: s.licence || null, limits: s.limits || null })) }, null, 1) + "\n");
  console.log(`living knowledge: ${P.length} public practices, ${m.held.length} held back, ${m.sources.length} sources`);
  return { public: P.length, held: m.held.length };
};

module.exports.md = function md() {
  const m = M.load(), P = m.public;
  return [`## Living Knowledge: local practices for heat resilience`, "", T.lede, "", `${SITE}/living-knowledge/ · data ${SITE}/living-knowledge/practices.json`, "", ...T.limits.map(l => `- ${l}`), "",
    ...P.map(p => `- ${p.title} (${C.DOMAIN[p.domain]}; ${C.CATEGORY[p.category]}; documented in ${countries(p)}; evidence: ${p.evidence.map(e => C.STATUS[e]).join(", ")}). ${p.summary} Limits: ${p.fails_when} ${SITE}/living-knowledge/${p.id}/`), ""].join("\n");
};
// "Local practices" lines on the pages a practice links to (between <!--lk-ctx--> markers, safe to rerun)
module.exports.context = function context() {
  const m = M.load(), byPage = {};
  m.public.forEach(p => (p.links.pages || []).forEach(([u]) => { (byPage[u] = byPage[u] || []).push(p); }));
  Object.entries(byPage).forEach(([u, list]) => {
    const f = path.join(ROOT, u.replace(/^\/|\/$/g, ""), "index.html"); if (!fs.existsSync(f)) return;
    let s = fs.readFileSync(f, "utf8").replace(/\n?\s*<!--lk-ctx-->[\s\S]*?<!--\/lk-ctx-->/, ""); const at = s.lastIndexOf("</main>"); if (at < 0) return;
    const block = `\n  <!--lk-ctx--><section class="container hub" aria-label="Local practices"><p class="hub-p"><b>Local practices documented for this topic.</b> ${list.map(p => `<a href="/living-knowledge/${esc(p.id)}/">${esc(p.title)}</a>`).join("; ")}. Each with its evidence and limits. <a href="/living-knowledge/">Living Knowledge <span aria-hidden="true">→</span></a></p></section><!--/lk-ctx-->`;
    fs.writeFileSync(f, s.slice(0, at).replace(/\s*$/, "") + block + "\n  " + s.slice(at));
  });
};
