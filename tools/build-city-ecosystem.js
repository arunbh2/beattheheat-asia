#!/usr/bin/env node
// Common Shade: builds each city heat ecosystem profile at /cities/<city>/<slug>/ ("Bengaluru: who is doing what
// about heat?") from data/city-ecosystems/<city>.json, gated by its research batch (tools/city-ecosystem.js).
// Words shared with llms-full.txt: tools/city-ecosystem-text.js. Filters: cities/ecosystem.js (without JavaScript every
// card shows). Called from tools/build-pages.js; the cities index and city pages link here (tools/build-static.js).
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const E = require("./city-ecosystem.js");
const { W, md, stage, rupee, fmtDate } = require("./city-ecosystem-text.js");

module.exports = function cityEcosystems({ page, write, esc, hero, V }) {
 const built = [];
 for (const id of E.cities()) {
  const bad = E.validate(E.raw(id));
  if (bad.length) throw new Error(`data/city-ecosystems/${id}.json: ${bad.join("; ")}`);
  const P = E.load(id), slug = `cities/${id}/${P.slug}`;
  // links to the shared records only where they exist: the heat network and the Heat Tool Finder
  P.networkIds = new Set(JSON.parse(fs.readFileSync(path.join(ROOT, "data/core/ORGANISATIONS.json"), "utf8")).map(o => o.id));
  P.catalogueIds = new Set(JSON.parse(fs.readFileSync(path.join(ROOT, "data/heat-tools/catalogue.json"), "utf8")).records.map(r => r.id));
  const name = oid => esc((P.orgById[oid] || {}).name || oid);
  const orgLink = oid => P.orgs.some(o => o.id === oid) ? `<a href="#org-${oid}">${name(oid)}</a>` : P.authorities.some(a => a.id === oid) ? `<a href="#auth-${oid}">${name(oid)}</a>` : name(oid);
  const srcs = ids => { const s = P.sourcesFor(ids); return s.length ? `<p class="ce-src">Sources: ${s.map(x => `<a href="${esc(x.url)}" rel="noopener">${esc(x.label)}</a>`).join(" · ")}</p>` : ""; };
  const theme = Object.fromEntries(P.themes);
  const typeOf = oid => (P.orgById[oid] || {}).type || (P.authorities.some(a => a.id === oid) ? "authority" : "");
  // ---- activity cards
  const card = a => {
   const who = [a.lead, ...a.collaborators.map(c => c[0])].filter(Boolean), types = [...new Set(who.map(typeOf).filter(Boolean))];
   const eq = W.equity.map(([k, l]) => `<div><dt>${esc(l)}</dt><dd>${esc((a.equity || {})[k] || "Not documented in the sources reviewed.")}</dd></div>`).join("");
   const tools = P.tools.filter(t => t.claims.some(c => a.claims.includes(c)));
   return `<article class="cs-card ce-act" id="${a.id}" data-theme="${a.themes.join(" ")}" data-type="${types.join(" ")}" data-people="${esc(a.people.join("|").toLowerCase())}" data-precision="${a.precision}" data-stage="${a.status}" data-tool="${tools.length ? "yes" : "no"}" data-evidence="${a.evidence}">
    <p class="ce-tags"><span class="ce-stage ce-stage--${a.status}">${esc(stage(a.status))}</span>${a.season ? `<span class="ce-tag">${esc(a.season)}</span>` : ""}${a.themes.map(t => `<span class="ce-tag">${esc(theme[t])}</span>`).join("")}</p>
    <h3>${esc(a.title)}</h3><p>${esc(a.desc)}</p>
    <dl class="ce-dl"><div><dt>Lead</dt><dd>${a.lead ? orgLink(a.lead) + (a.lead_note ? `. ${esc(a.lead_note)}` : "") : "Not named in the sources reviewed"}</dd></div>
     ${a.collaborators.length ? `<div><dt>With</dt><dd>${a.collaborators.map(([o, r]) => `${orgLink(o)} (${esc(r)})`).join("; ")}</dd></div>` : ""}
     <div><dt>Where</dt><dd>${esc(a.place)} <span class="ce-muted">(${esc(E.PRECISION[a.precision])})</span></dd></div>
     ${a.people.length ? `<div><dt>People</dt><dd>${esc(a.people.join(", "))}</dd></div>` : ""}
     <div><dt>When</dt><dd>${esc(a.start ? fmtDate(a.start) : "Start not stated")}${a.end ? ` to ${esc(fmtDate(a.end))}` : ""}</dd></div>
     <div><dt>Outputs</dt><dd>${esc(a.outputs.join("; "))}</dd></div>
     <div><dt>Evaluation</dt><dd>${esc(a.evaluation)}</dd></div>
     <div><dt>Evidence</dt><dd>${esc(E.EVIDENCE[a.evidence])}; latest dated evidence ${esc(fmtDate(a.last))}</dd></div></dl>
    <details class="ce-more"><summary>Who is included, and how</summary><dl class="ce-dl ce-dl--eq">${eq}</dl><p class="ce-muted">Mentioned, consulted, deciding, receiving and benefiting are different things; a blank means the sources do not say.</p></details>
    ${tools.length ? `<p class="ce-link">Resource: ${tools.map(t => `<a href="#${t.id}">${esc(t.name)}</a>`).join(", ")}</p>` : ""}
    ${(a.related || []).length ? `<p class="ce-link">On Common Shade: ${a.related.map(([u, l]) => `<a href="${u}">${esc(l)}</a>`).join(" · ")}</p>` : ""}
    ${srcs(a.claims)}</article>`;
  };
  // ---- filters (hidden until the script runs; without it, every card shows)
  const people = [...new Set(P.activities.flatMap(a => a.people))].sort();
  const opt = (k, list) => `<label>${esc(k[1])}<select data-f="${k[0]}"><option value="">All</option>${list.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join("")}</select></label>`;
  const filters = `<form class="ce-filters" hidden aria-label="Filter the activities">${opt(["theme", "Theme"], P.themes)}${opt(["type", "Kind of organisation"], Object.entries(E.ORG_TYPES).filter(([k]) => P.activities.some(a => [a.lead, ...a.collaborators.map(c => c[0])].map(typeOf).includes(k))))}${opt(["people", "People or setting"], people.map(p => [p.toLowerCase(), p]))}${opt(["precision", "Geography"], Object.entries(E.PRECISION).filter(([k]) => P.activities.some(a => a.precision === k)))}${opt(["stage", "Stage"], E.ACTIVITY_STAGES.filter(s => P.activities.some(a => a.status === s)).map(s => [s, stage(s)]))}${opt(["tool", "Has a resource"], [["yes", "Yes"], ["no", "No"]])}${opt(["evidence", "Evidence"], Object.entries(E.EVIDENCE))}<button type="reset" class="ce-reset">Clear filters</button></form><p class="ce-count" aria-live="polite" data-total="${P.activities.length}">${P.activities.length} activities</p>`;
  // ---- the collective
  const C = P.collective;
  const collective = C && C.ok ? `<section class="container ce-sec" id="collective" aria-labelledby="ce-col-h"><h2 class="hub-h" id="ce-col-h">${esc(C.name)}</h2>
   <p>${esc(P.claimText["c-blr-launch"])} ${esc(W.notMember)}${C.network && P.networkIds.has(C.network) ? ` <a href="/heat-network/?q=${encodeURIComponent(C.name)}">The Collective in the heat network</a>` : ""}</p>
   <dl class="ce-dl ce-dl--wide"><div><dt>Launch event</dt><dd>${esc(fmtDate(C.event))}</dd></div><div><dt>Announcements published</dt><dd>${C.published.filter(p => p.claims.every(c => P.OK.has(c))).map(p => `${esc(fmtDate(p.date))} by ${orgLink(p.by)}`).join("; ")}</dd></div>
    <div><dt>Founding members</dt><dd>${P.orgs.filter(o => o.coalition === "founding").map(o => orgLink(o.id)).join(", ")}</dd></div></dl>
   <h3>Four priority areas</h3><p class="ce-muted">Named for the Collective's initial phase. These are priorities; the sources do not report them as delivered work.</p>
   <ol class="ce-prio">${C.priorities.map(p => `<li><b>${esc(p.short)}.</b> In the launch release's words: "${esc(p.text)}". <a href="#themes-${p.themes[0]}">Related work</a></li>`).join("")}</ol>
   <h3>Governance, as far as the sources show</h3><ul>${C.governance.known.filter(c => P.OK.has(c)).map(c => `<li>${esc(P.claimText[c])}</li>`).join("")}<li>${esc(C.governance.not_found)}</li></ul>
   ${C.launch_claims.filter(c => P.OK.has(c)).length ? `<h3>At the launch</h3><ul>${C.launch_claims.filter(c => P.OK.has(c)).map(c => `<li>${esc(P.claimText[c])}</li>`).join("")}</ul>` : ""}
   ${srcs([...C.purpose_claims, ...C.members_claims, ...C.priorities_claims, ...C.governance.known, ...C.launch_claims, "c-blr-pubdate", "c-blr-khpt-date"].filter(c => P.OK.has(c)))}</section>` : `<section class="container ce-sec" id="collective"><h2 class="hub-h">The Heat Collective</h2><p>Held back until the source check confirms its launch and membership.</p></section>`;
  // ---- themes
  const themes = `<section class="container ce-sec" id="themes" aria-labelledby="ce-th-h"><h2 class="hub-h" id="ce-th-h">${W.h.themes}</h2><p>${esc(W.themesIntro)}</p><div class="ce-themes">${P.themes.map(([t, l]) => { const as = P.activities.filter(a => a.themes.includes(t)); return `<div class="cs-card ce-theme" id="themes-${t}"><h3>${esc(l)}</h3>${as.length ? `<ul>${as.map(a => `<li><a href="#${a.id}">${esc(a.title)}</a> <span class="ce-muted">(${esc(stage(a.status))})</span></li>`).join("")}</ul>` : `<p class="ce-muted">No activity found in the sources reviewed.</p>`}</div>`; }).join("")}</div></section>`;
  // ---- tools
  const tools = `<section class="container ce-sec" id="tools" aria-labelledby="ce-tl-h"><h2 class="hub-h" id="ce-tl-h">${W.h.tools}</h2><p>${esc(W.toolsIntro)}</p><div class="ce-grid">${P.tools.map(t => `<article class="cs-card ce-tool" id="${t.id}">
   <p class="ce-tags"><span class="ce-tag">${esc(E.KINDS[t.kind])}</span><span class="ce-access ce-access--${t.access}">${esc(E.ACCESS[t.access])}</span></p><h3>${esc(t.name)}</h3>
   <dl class="ce-dl"><div><dt>By</dt><dd>${orgLink(t.owner)}${t.collaborators.length ? `, with ${t.collaborators.map(orgLink).join(", ")}` : ""}</dd></div><div><dt>Helps decide</dt><dd>${esc(t.decision)}</dd></div><div><dt>For</dt><dd>${esc(t.users)}</dd></div><div><dt>Covers</dt><dd>${esc(t.coverage)}</dd></div><div><dt>Resolution</dt><dd>${esc(t.resolution)}</dd></div><div><dt>Needs</dt><dd>${esc(t.inputs)}</dd></div><div><dt>Gives</dt><dd>${esc(t.outputs)}</dd></div><div><dt>Cost</dt><dd>${esc(t.cost || "Not stated")}</dd></div><div><dt>Language</dt><dd>${esc(t.language || "Not stated")}</dd></div><div><dt>Licence</dt><dd>${esc(t.licence || "Not stated; free to read is not permission to reuse")}</dd></div><div><dt>Status</dt><dd>${esc(t.status)}</dd></div><div><dt>Used in ${esc(P.name)}</dt><dd>${esc(t.bengaluru_use)}</dd></div></dl>
   <p class="ce-muted">Limits: ${esc(t.limits.join(" "))}</p>
   <p><a class="ce-btn" href="${esc(t.url)}" rel="noopener">${esc(t.button)}<span class="visually-hidden">: ${esc(t.name)}</span></a>${t.catalogue && P.catalogueIds && P.catalogueIds.has(t.catalogue) ? ` <a href="/heat-tools/${t.catalogue}/">In the Heat Tool Finder</a>` : ""}</p>${srcs(t.claims)}</article>`).join("")}</div></section>`;
  // ---- places (a table, not a map: office locations are never shown as coverage)
  const places = `<section class="container ce-sec" id="places" aria-labelledby="ce-pl-h"><h2 class="hub-h" id="ce-pl-h">${W.h.places}</h2><p>${esc(W.placesIntro)}</p><div class="ce-table" role="region" aria-label="Activities by place" tabindex="0"><table><thead><tr><th scope="col">Where</th><th scope="col">Precision</th><th scope="col">Activity</th><th scope="col">Stage</th></tr></thead><tbody>${P.activities.slice().sort((a, b) => Object.keys(E.PRECISION).indexOf(a.precision) - Object.keys(E.PRECISION).indexOf(b.precision)).map(a => `<tr><td>${esc(a.place)}</td><td>${esc(E.PRECISION[a.precision])}</td><td><a href="#${a.id}">${esc(a.title)}</a></td><td>${esc(stage(a.status))}</td></tr>`).join("")}</tbody></table></div></section>`;
  // ---- commitments and delivery
  const money = `<h3 id="money">${W.h.money}</h3><p>${esc(W.moneyIntro)}</p><div class="ce-table" role="region" aria-label="Money announced" tabindex="0"><table><thead><tr><th scope="col">Amount</th><th scope="col">For</th><th scope="col">Stated by</th><th scope="col">Stage, as the source describes it</th><th scope="col">Heat-specific?</th></tr></thead><tbody>${P.money.map(m => `<tr id="${m.id}"><td>${esc(rupee(m))}${m.parent ? `<br><span class="ce-muted">part of ${esc(rupee(P.money.find(x => x.id === m.parent) || {}))}, not added to it</span>` : ""}</td><td>${esc(m.what)}</td><td>${orgLink(m.who)}, ${esc(fmtDate(m.date))}</td><td><b>${esc(stage(m.stage))}.</b> ${esc(m.stage_note)}</td><td>${esc(m.heat)}</td></tr>`).join("")}</tbody></table></div>${srcs(P.money.flatMap(m => m.claims))}${(P.signals || []).length ? `<p class="ce-link">Followed step by step in Signals: ${P.signals.map(s => `<a href="/signals/#${s}">from announcement to delivery</a>`).join(" · ")}</p>` : ""}`;
  const timeline = `<h3 id="timeline">${W.h.timeline}</h3><p>${esc(W.timelineIntro)}</p><ol class="ce-time">${P.timeline.map(t => `<li><span class="ce-date">${esc(fmtDate(t.date))}</span> <span class="ce-tag">${esc({ plan: "Plan", delivery: "Delivery", event: "Event", money: "Money", authority: "Authority" }[t.kind] || t.kind)}</span> ${esc(t.text)}</li>`).join("")}</ol>`;
  const delivery = `<section class="container ce-sec" id="delivery" aria-labelledby="ce-dl-h"><h2 class="hub-h" id="ce-dl-h">${W.h.delivery}</h2>${money}${timeline}</section>`;
  // ---- organisations and authorities
  const orgs = `<section class="container ce-sec" id="orgs" aria-labelledby="ce-or-h"><h2 class="hub-h" id="ce-or-h">${W.h.orgs}</h2><p>${esc(W.orgsIntro)}</p><div class="ce-grid">${P.orgs.map(o => `<article class="cs-card ce-org" id="org-${o.id}"><h3>${esc(o.name)}</h3>${o.aliases.length ? `<p class="ce-muted">Also written: ${esc(o.aliases.join(", "))}</p>` : ""}
   <p class="ce-tags"><span class="ce-tag">${esc(E.ORG_TYPES[o.type])}</span>${o.coalition === "founding" ? `<span class="ce-tag ce-tag--member">Founding member of the Collective</span>` : `<span class="ce-tag">Not a member of the Collective</span>`}<span class="ce-tag">Based: ${esc(o.based)}</span></p>
   <p>${o.verified ? esc(o.summary) : "Details held back until the source check confirms them."}</p>
   ${o.activities.length ? `<p class="ce-link">Activities: ${o.activities.filter(x => P.activities.some(a => a.id === x)).map(x => `<a href="#${x}">${esc(P.activities.find(a => a.id === x).title)}</a>`).join("; ")}</p>` : ""}
   ${o.outside ? `<p class="ce-muted"><b>Outside ${esc(P.name)}:</b> ${esc(o.outside)}</p>` : ""}
   ${o.unknowns.length ? `<details class="ce-more"><summary>Not known</summary><ul>${o.unknowns.map(u => `<li>${esc(u)}</li>`).join("")}</ul></details>` : ""}
   <p class="ce-link"><a href="${esc(o.site)}" rel="noopener">Website<span class="visually-hidden">: ${esc(o.name)}</span></a>${P.networkIds.has(o.network) ? ` · <a href="/heat-network/?q=${encodeURIComponent(o.name)}">In the heat network</a>` : ""}</p>${o.verified ? srcs(o.summary_claims) : ""}</article>`).join("")}</div>
   <h3 id="authorities">${W.h.authorities}</h3><p>${esc(W.authoritiesIntro)}</p><ul class="ce-auth">${P.authorities.map(a => `<li id="auth-${a.id}"><b>${esc(a.name)}</b>${a.aliases.length ? ` (${esc(a.aliases.join(", "))})` : ""}${a.since ? `, since ${esc(fmtDate(a.since))}` : ""}${a.until ? `, until ${esc(fmtDate(a.until))}` : ""}: ${esc(a.role)}${a.network && P.networkIds.has(a.network) ? ` <a href="/heat-network/?q=${encodeURIComponent(a.name.replace(/ \(.*$/, ""))}">In the heat network</a>` : ""}</li>`).join("")}</ul>${srcs(P.authorities.flatMap(a => a.claims))}</section>`;
  // ---- gaps, contradictions, held back, method
  const gaps = `<section class="container ce-sec" id="gaps" aria-labelledby="ce-gp-h"><h2 class="hub-h" id="ce-gp-h">${W.h.gaps}</h2><p>${esc(W.gapsIntro)}</p><ul>${P.gaps.map(g => `<li>${esc(g)}</li>`).join("")}</ul>
   <h3>${W.h.contradictions}</h3><ul>${P.contradictions.map(c => `<li>${esc(c.text)}</li>`).join("")}</ul>
   ${P.held.length ? `<details class="ce-more"><summary>${W.h.held} (${P.held.length})</summary><p class="ce-muted">These rest on a claim the source check did not confirm, so they are not shown above. Each can return once its source holds it.</p><ul>${P.held.map(h => `<li>${esc(h.name)}</li>`).join("")}</ul></details>` : ""}</section>`;
  const method = `<section class="container ce-sec" id="method" aria-labelledby="ce-me-h"><h2 class="hub-h" id="ce-me-h">${W.h.method}</h2><p>${esc(P.scope)}</p>
   <p>${P.nConfirmed} of ${P.nClaims} claims passed the source check${P.checked ? `, last run ${esc(fmtDate(P.checked))}` : ""}: each was kept only when every word it rests on was found on its source. A source that only opened does not count. The date of the check is not a date any project moved.</p>
   <p>CSTEP's organisational mapping of heat actors was used to find leads; every entry used here was checked separately. The research matrix and the claims are published as files: <a href="/research/2026-11/${P.batch}/matrix.md">research matrix</a> · <a href="/research/2026-11/${P.batch}/claims.json">claims</a> · <a href="/research/2026-11/${P.batch}/confirmed.json">confirmed claims</a>.</p>
   <h3 id="contribute">${W.h.contribute}</h3><p>${esc(W.contribute)} <a href="/corrections/">Corrections</a> · <a href="/join/">Join Common Shade</a></p></section>`;
  // ---- start here and the opening
  const glance = [["activities", P.activities.length], ["organisations", P.orgs.length], ["tools and resources", P.tools.length], ["public bodies", P.authorities.length]];
  const start = `<section class="container ce-sec" id="start" aria-labelledby="ce-st-h">${P.orientation.map(o => `<p class="ce-lede">${esc(o.text)}</p>`).join("")}
   <p class="ce-glance">${glance.map(([l, n]) => `<span><b>${n}</b> ${l}</span>`).join("")}</p><p class="ce-muted">${esc(P.scope)}</p>
   <h2 class="hub-h" id="ce-st-h">${W.h.start}</h2><div class="ce-grid ce-grid--start">${P.start_here.map(s => `<div class="cs-note cs-note--example"><span class="cs-note__label">${esc(s.who)}</span><p>${esc(s.text)}${s.ref.length ? ` ${s.ref.filter(r => P.activities.some(a => a.id === r)).map(r => `<a href="#${r}">${esc(P.activities.find(a => a.id === r).title)}</a>`).join(" · ")}` : ""}</p></div>`).join("")}</div>
   <p class="ce-link">Also on Common Shade: <a href="/cities/${id}/">${esc(P.name)}: heat today, heat over time and plans</a> · <a href="/heat-network/">Organisations working on extreme heat</a> · <a href="/heat-tools/">Heat Tool Finder</a> · <a href="/resources/heat-action-plans/india/?q=${encodeURIComponent(P.name)}">India heat action plan archive</a> · <a href="/signals/">Signals</a></p></section>`;
  const directory = `<section class="container ce-sec" id="directory" aria-labelledby="ce-di-h"><h2 class="hub-h" id="ce-di-h">${W.h.directory}</h2><p>${esc(W.directoryIntro)}</p><p class="cs-note cs-note--watch"><span class="cs-note__label">Kept apart</span>${esc(W.claimsNote)}</p>${filters}<div class="ce-acts">${P.activities.map(card).join("")}</div><p class="ce-none" hidden>No activity matches these filters. This describes the records here, not the city.</p></section>`;
  const body = `${hero(W.eyebrow, esc(P.title), esc(W.lede))}
  <nav class="container sol-jump" aria-label="On this page">${W.jump.map(([a, l]) => `<a href="#${a}">${esc(l)}</a>`).join(" · ")}</nav>
  ${start}${directory}${collective}${themes}${tools}${places}${delivery}${orgs}${gaps}${method}
  <script src="/cities/ecosystem.js?v=${V}" defer></script>`;
  const css = `\n  <link rel="stylesheet" href="/cities/ecosystem.css?v=${V}">`;
  write(slug, page(slug, P.title, `Who is working on heat in ${P.name}, what they are doing, what can be used and what is still only planned: ${P.activities.length} activities, the Bengaluru Heat Collective, tools, announced money and open questions, each checked against its source.`, body, css));
  built.push({ id, slug, title: P.title });
 }
 return built;
};
module.exports.md = SITE => E.cities().map(id => { const P = E.load(id); P.networkIds = new Set(); return md(P, SITE); }).join("\n\n");
// a short entry for the cities index and each city's page
module.exports.entries = () => E.cities().map(id => { const P = E.load(id); return { id, name: P.name, url: `/cities/${id}/${P.slug}/`, title: P.title, n: P.activities.length, orgs: P.orgs.length, tools: P.tools.length }; });
