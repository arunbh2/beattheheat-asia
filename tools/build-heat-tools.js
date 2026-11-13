// Common Shade: /heat-tools/, "Heat Tool Finder". Which heat tool fits the decision in front of you? A starter
// catalogue of tools, datasets, warning services, assessments, guidance and directories, each with what it needs, what
// it gives, where its limits are and how far it was reviewed. Not a weather feed, a risk model, a complete inventory or a
// set of tested products: the page says so, and no score or ranking exists anywhere in it.
// Reads data/heat-tools/catalogue.json (written by research/2026-11/heat-tools/apply.js from the researched seed).
// Writes the index (every card in the HTML, so it reads without JavaScript), one profile page per record at
// /heat-tools/<id>/, and the "Heat Tool Finder" section of llms-full.txt. The words and the filter logic are shared with
// the page script and the check through heat-tools/finder-core.js. The address is /heat-tools/ because /tools/ holds the
// site's build scripts. Called by build-pages.js; checked by tools/check-heat-tools.js.
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), SITE = "https://beattheheat.asia", SLUG = "heat-tools";
const H = require("../heat-tools/finder-core.js");
module.exports = function heatTools({ page, write, esc, hero, V, D }) {
  const CAT = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "heat-tools", "catalogue.json"), "utf8"));
  const R = CAT.records, SRC = Object.fromEntries(CAT.sources.map(s => [s.id, s])), BY = Object.fromEntries(R.map(r => [r.id, r]));
  const TODAY = new Date().toISOString().slice(0, 10), STALE = CAT.maintenance.stale_after_days || 90;
  const ageDays = d => Math.floor((Date.parse(TODAY) - Date.parse(d)) / 864e5);
  const NAVJ = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "site", "nav.json"), "utf8"));
  const pageName = u => { for (const g of NAVJ.groups) for (const i of [g.lead, ...g.items]) if (i[0] === u) return i[1]; return NAVJ.names[u] || u; };
  const GC = (fs.readFileSync(path.join(ROOT, "data.js"), "utf8").match(/goatcounter:\s*"([a-z0-9-]+)"/) || [, ""])[1];
  const ext = (u, t, ev) => `<a href="${esc(H.safeUrl(u))}" target="_blank" rel="noopener"${ev ? ` data-ev="${ev}"` : ""}>${t}<span class="visually-hidden"> (opens in a new tab)</span></a>`;
  const track = `<script src="/${SLUG}/track.js?v=${V}" data-gc="${esc(GC)}" defer></script>`;
  const css = `\n  <link rel="stylesheet" href="/${SLUG}/heat-tools.css?v=${V}">`;
  const ext0 = R.filter(r => r.origin !== "common_shade"), int0 = R.filter(r => r.origin === "common_shade");
  const FIELD = { decision_tags: "what it helps decide", user_roles: "who it suits", "geography.asia_applicability": "how it applies in Asia", limitations: "its limits",
    "links.common_shade_next_step": "the next step on Common Shade", "access.licence": "reuse licence", "access.price_amount": "price", "geography.local_validation_countries": "where it has been validated locally",
    "access.registration_required": "whether registration is needed", "access.mode": "access", "technical.api_status": "API", "resource_type": "resource type", heat_metrics: "heat measure", time_horizons: "time horizon" };
  const field = f => FIELD[f] || f.split(".").pop().replace(/_/g, " ");
  const pathwaysOf = id => CAT.curated_pathways.filter(p => p.steps.some(s => s.resource_ids.includes(id)));

  // ---- the index ----
  const def = H.filter(R, H.emptyState());
  const caution = R.filter(r => r.publication.status === "caution_listing");
  const opt = (list, name, type) => list.map(([v, l]) => `<label class="ht-opt"><input type="${type || "checkbox"}" name="${name}" value="${esc(v)}"> ${esc(l)}</label>`).join("");
  const facet = (name, legend, list) => `<fieldset class="ht-fs"><legend>${esc(legend)}</legend><div class="ht-opts">${opt(list, name)}</div></fieldset>`;
  const pathway = p => {
    const ids = [...new Set(p.steps.flatMap(s => s.resource_ids))], cmp = ids.filter(i => BY[i] && BY[i].origin !== "common_shade").slice(0, 3);
    return `<article class="ht-path" id="path-${esc(p.id)}" aria-labelledby="path-${esc(p.id)}-h">
      <p class="ht-path__kind">${esc(p.kind.startsWith("Illustrative workflow") ? p.kind : "Illustrative workflow")}</p>
      <h3 class="ht-path__h" id="path-${esc(p.id)}-h">${esc(p.title)}</h3>
      <ol class="ht-steps">${p.steps.map(s => `<li><p class="ht-step__tools">${s.resource_ids.map(i => `<a href="/${SLUG}/${esc(i)}/">${esc(BY[i].name)}</a>`).join(" + ")}</p>
        <p class="ht-step__why"><b>Why:</b> ${esc(s.purpose)}</p>
        <p class="ht-step__open"><b>What it leaves open:</b> ${s.resource_ids.map(i => esc(BY[i].limitations[0])).join(" ")}</p></li>`).join("")}</ol>
      <p class="ht-path__acts"><a href="/${SLUG}/?compare=${cmp.join(",")}#compare" data-ev="pathway_open">Compare the outside tools in this workflow</a>
        <button type="button" class="ht-copy" data-copy="${SITE}/${SLUG}/#path-${esc(p.id)}" hidden>Copy a link to this workflow</button></p>
    </article>`;
  };
  const body = `<div class="ht">
  ${hero("Heat Tool Finder", "Which heat tool fits the decision in front of you?", esc(CAT.design.subhead))}
  <div class="container ht-wrap">
    <p class="ht-note">${esc(CAT.design.disclaimer)} It is not a weather feed, a risk score or a complete list, and Common Shade has not run any of these tools itself.</p>
    <form class="ht-form" id="ht-form" role="search" aria-label="Find a heat tool" hidden>
      <fieldset class="ht-fs ht-decide"><legend class="ht-legend">What do you need to do?</legend><div class="ht-opts ht-opts--chips">${opt(CAT.design.decisions.map(d => [d.id, d.label]), "decision")}</div></fieldset>
      <div class="ht-row">
        <label class="ht-field"><span>Country</span><select name="country"><option value="">Any country</option>${H.COUNTRIES.map(([c, n]) => `<option value="${c}">${esc(n)}</option>`).join("")}</select></label>
        <label class="ht-field ht-field--q"><span>Search names, providers and decisions</span><input type="search" name="q" maxlength="80" autocomplete="off"></label>
        <label class="ht-field"><span>Kind of resource</span><select name="type"><option value="">Any kind</option>${H.TYPE_GROUPS.map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join("")}</select></label>
      </div>
      <details class="ht-more" id="ht-more"><summary>More filters</summary><div class="ht-more__in">
        ${facet("role", "Who it suits", H.ROLES)}
        ${facet("access", "Access", H.ACCESS.filter(a => R.some(r => r.access.mode === a[0])))}
        <fieldset class="ht-fs"><legend>Registration</legend><div class="ht-opts">
          <label class="ht-opt"><input type="checkbox" name="noreg" value="1"> No registration needed (confirmed only)</label>
          <label class="ht-opt"><input type="checkbox" name="unverified" value="1"> Include resources where registration is not verified</label></div></fieldset>
        ${facet("horizon", "Time horizon", H.HORIZONS.filter(a => R.some(r => r.time_horizons.includes(a[0]))))}
        ${facet("metric", "Heat measure", H.METRICS.filter(a => R.some(r => r.heat_metrics.includes(a[0]))))}
        ${facet("status", "Review status", H.STATUS.slice(0, 2))}
        <fieldset class="ht-fs"><legend>Caution listings</legend><div class="ht-opts"><label class="ht-opt"><input type="checkbox" name="caution" value="1"> Include caution listings (maintenance or coverage concerns)</label></div></fieldset>
        <button type="button" class="ht-btn ht-btn--quiet" id="ht-more-done">Done</button>
      </div></details>
    </form>
    <div class="ht-status"><p id="ht-count" class="ht-count" role="status" aria-live="polite">${def.external} outside resources and ${def.internal} Common Shade pages, in groups by how they apply.</p>
      <ul class="ht-chips" id="ht-chips" aria-label="Filters applied"></ul></div>
    <div id="ht-results" class="ht-results">${H.groupsHTML(def, { js: false })}
      <section class="ht-group ht-group--unverified" id="ht-caution-static" aria-labelledby="htg-caution"><h3 class="ht-group__h" id="htg-caution">Caution listings</h3>
        <p class="ht-group__note">Left out of the results unless asked for. Listed for context, not as an operational recommendation.</p><div class="ht-cards">${caution.map(r => H.card(r, { js: false })).join("")}</div></section></div>

    <section class="ht-sec" id="compare" aria-labelledby="ht-cmp-h" hidden><h2 class="ht-h2" id="ht-cmp-h" tabindex="-1">Compare your shortlist</h2><div id="ht-compare"></div></section>

    <section class="ht-sec" id="pathways" aria-labelledby="ht-paths-h"><h2 class="ht-h2" id="ht-paths-h">Three illustrative workflows</h2>
      <p class="ht-p">For a practitioner, the useful answer is often a combination: regional context, an official warning or local measurement, then institutional action. These are illustrative workflows, not validated protocols, automated recommendations or endorsed procedures, and no partnership with any provider is implied.</p>
      <div class="ht-paths">${CAT.curated_pathways.map(pathway).join("")}</div></section>

    <section class="ht-sec ht-about" aria-labelledby="ht-about-h"><h2 class="ht-h2" id="ht-about-h">How this catalogue works</h2>
      <p class="ht-p">It lists ${ext0.length} outside resources and ${int0.length} Common Shade pages, researched up to ${esc(CAT.research_as_of)}. That number describes this starter catalogue only, not the size of the field or how well heat protection works.</p>
      <dl class="ht-dl">
        <div><dt>${esc(H.REVIEW.source_page_reviewed)}</dt><dd>The provider's public description was read.</dd></div>
        <div><dt>${esc(H.REVIEW.method_documentation_reviewed)}</dt><dd>Parts of the method documentation were read.</dd></div>
        <div><dt>${esc(H.REVIEW.official_indexed_content_reviewed)}</dt><dd>The official description was found in indexed text, but direct access was incomplete. That does not mean the service is broken.</dd></div>
      </dl>
      <p class="ht-p">Reviewed never means validated or certified, and none of these tools was run by Common Shade. "Not verified" means nobody has checked it yet, which is different from "no". Free to read is not an open-data licence, and a listed API is not a connection Common Shade has tried. Global coverage is not validation in an Asian city, and different heat measures (air temperature, heat index, WBGT, UTCI) are never interchangeable. Live warnings stay with the official agencies that issue them.</p>
      <p class="ht-p">Records are reviewed monthly, with a broader search each quarter; a record older than ${STALE} days is flagged for recheck and kept, not deleted. Know of a tool we have missed, or a detail that has changed? <a href="/join/?about=Heat%20Tool%20Finder#way-share">Tell us, with its source</a>: suggestions are checked before they appear. The catalogue is open as <a href="/data/heat-tools/catalogue.json">one JSON file</a>.</p>
      <p class="ht-p ht-small">Inspired by UNEP FI's approach to making risk tools easier to compare. Independently developed by Common Shade.</p>
    </section>
  </div>
  <div class="ht-bar" id="ht-bar" hidden></div>
  <script>window.HT=${JSON.stringify({ records: R, sources: CAT.sources, stale: STALE }).replace(/</g, "\\u003c")};</script>
  <script src="/${SLUG}/finder-core.js?v=${V}" defer></script>
  <script src="/${SLUG}/finder.js?v=${V}" defer></script>
  ${track}
</div>`;
  write(SLUG, page(SLUG, "Heat Tool Finder: which heat tool fits your decision", "Find tools for heat warnings, risk assessment, cooling and protection planning in South and Southeast Asia. Compare what each needs, what it gives and where its limits matter.", body, css));

  // ---- one profile per record ----
  for (const r of R) {
    const a = r.access, t = r.technical, st = r.publication.status, stale = ageDays(r.evidence.reviewed_on) > STALE;
    const kv = (k, v) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`;
    const next = r.links.common_shade_next_step, nextName = pageName(next);
    const banner = st === "caution_listing" ? `<p class="ht-banner ht-banner--caution"><b>${esc(H.label(H.STATUS, st))}.</b> ${esc(H.MAINT[r.publication.maintenance_status] || "")}. Listed for context only: not an operational recommendation, and left out of the finder's results unless asked for.</p>`
      : st === "provisional_listing" ? `<p class="ht-banner ht-banner--provisional"><b>${esc(H.label(H.STATUS, st))}.</b> Direct access was incomplete in the research run, or only an announcement was reviewed. That does not show the service is broken; it means the details below need checking at the source.</p>` : "";
    const own = r.origin === "common_shade" ? `<p class="ht-banner">This is one of Common Shade's own pages, listed as a next step. It is not an independent tool or an endorsement.</p>` : "";
    const sources = r.evidence.source_ids.map(i => SRC[i]).filter(Boolean);
    const prov = r.field_provenance;
    const body = `<div class="ht ht-prof">
  ${hero(`Heat Tool Finder · ${H.typeLabel(r.resource_type)}`, esc(r.name), `${esc(r.provider)}. ${esc(r.summary)}`)}
  <div class="container ht-wrap">
    <p class="ht-card__meta">${banner ? "" : H.badge(r)}${stale ? `<span class="ht-badge ht-badge--stale">Needs recheck: reviewed over ${STALE} days ago</span>` : ""}</p>
    ${banner}${own}
    <p class="ht-limit-lg"><b>Important limit:</b> ${esc(r.limitations[0])}</p>
    <p class="ht-prof__acts">${r.origin === "common_shade" ? `<a class="ht-btn" href="${esc(r.links.primary_url.replace(SITE, ""))}" data-ev="plan_click">Open ${esc(pageName(r.links.primary_url.replace(SITE, "")))}</a>` : `<a class="ht-btn" href="${esc(H.safeUrl(r.links.primary_url))}" target="_blank" rel="noopener" data-ev="source_click">View source / access information<span class="visually-hidden"> (opens in a new tab)</span></a>`}
      <a class="ht-btn ht-btn--quiet" href="/${SLUG}/?compare=${esc(r.id)}#compare">Add to a comparison</a></p>
    <section class="ht-sec"><h2 class="ht-h3">What decision it helps with</h2><p>${esc(H.decisionLabel(r))}. ${esc(r.summary)}</p><p class="ht-small">Suits: ${esc(r.user_roles.map(x => H.label(H.ROLES, x)).join(", "))}.</p></section>
    <section class="ht-sec"><h2 class="ht-h3">What you need to provide</h2><ul>${r.inputs.map(x => `<li>${esc(x)}</li>`).join("")}</ul></section>
    <section class="ht-sec"><h2 class="ht-h3">What you get</h2><ul>${r.outputs.map(x => `<li>${esc(x)}</li>`).join("")}</ul></section>
    <section class="ht-sec"><h2 class="ht-h3">Coverage, scale and time horizon</h2><dl class="ht-dl">
      ${kv("Coverage", esc(H.coverage(r)))}${kv("How it applies in Asia", esc(H.APPLIC[r.geography.asia_applicability] || ""))}${kv("Local validation", esc(H.LOCAL[r.evidence.local_validation_status] || r.evidence.local_validation_status))}
      ${kv("Scale", esc(r.geography.spatial_scale))}${kv("Time horizon", esc(r.time_horizons.map(h => H.label(H.HORIZONS, h)).join("; ")))}</dl></section>
    <section class="ht-sec"><h2 class="ht-h3">Measure and method</h2><dl class="ht-dl">${kv("Heat measure", esc(r.heat_metrics.map(m => H.label(H.METRICS, m)).join("; ")))}${kv("Method", esc(r.method_summary))}</dl>
      <p class="ht-small">Air temperature, surface temperature, heat index, WBGT and UTCI measure different things and are never interchangeable.</p></section>
    <section class="ht-sec"><h2 class="ht-h3">What it cannot tell you</h2><ul>${r.limitations.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
      <p class="ht-small"><b>Still to check:</b> ${esc(r.follow_up_checks.join(" "))}</p></section>
    <section class="ht-sec"><h2 class="ht-h3">Access, registration, reuse licence and integration</h2><dl class="ht-dl">
      ${kv("Access", esc(H.label(H.ACCESS, a.mode)))}${kv("Registration", esc(H.regLabel(a.registration_required)))}${kv("Price", esc(H.priceLabel(a)))}
      ${kv("Reuse licence", esc(H.licenceLabel(a)))}${kv("Rehosting", a.rehosting_allowed == null ? "Not verified" : a.rehosting_allowed ? "Allowed" : "Not allowed")}
      ${kv("API", esc(H.API[t.api_status] || t.api_status) + (t.api_docs_url ? ` · ${ext(t.api_docs_url, "documentation", "source_click")}` : ""))}${kv("How Common Shade uses it", esc(H.INTEGRATION[t.integration_mode] || t.integration_mode))}
      ${kv("Run by Common Shade", t.live_execution_tested ? "Yes" : "No: described from its sources only")}${kv("Maintenance", esc(H.MAINT[r.publication.maintenance_status] || r.publication.maintenance_status))}</dl></section>
    <section class="ht-sec"><h2 class="ht-h3">Sources, and what was actually reviewed</h2>
      <ul class="ht-srcs">${sources.map(s => `<li>${ext(s.url, esc(s.title), "source_click")} <span class="ht-small">${esc(s.publisher)} · ${esc(H.REVIEW[s.review_depth])} · accessed ${esc(s.accessed_on)}</span>${s.scope ? `<br><span class="ht-small">${esc(s.scope)}</span>` : ""}</li>`).join("")}</ul>
      <p class="ht-small">${esc(r.evidence.classification_basis)} Reviewed on ${esc(r.evidence.reviewed_on)}; next review due ${esc(r.publication.next_review_due)}.</p>
      <p class="ht-small">From the provider's sources: the description, inputs, outputs and access. Common Shade's editorial reading: ${esc(prov.editorial_fields.map(field).join(", "))}.${prov.unknown_fields.length ? ` Not yet known: ${esc(prov.unknown_fields.map(field).join(", "))}.` : ""}</p></section>
    ${pathwaysOf(r.id).length ? `<section class="ht-sec"><h2 class="ht-h3">Illustrative workflows it appears in</h2><ul>${pathwaysOf(r.id).map(p => `<li><a href="/${SLUG}/#path-${esc(p.id)}">${esc(p.title)}</a></li>`).join("")}</ul></section>` : ""}
    <section class="ht-sec ht-next"><h2 class="ht-h3">What to do next</h2><p>Carry what you learn into <a href="${esc(next)}" data-ev="plan_click">${esc(nextName)}</a> on Common Shade, or go back to <a href="/${SLUG}/">the Heat Tool Finder</a> to compare it with others.</p></section>
  </div>
  ${track.replace("defer>", `data-open="1" defer>`)}
</div>`;
    const desc = `${r.name} (${r.provider}) helps you ${H.decisionLabel(r).toLowerCase()}. Important limit: ${r.limitations[0]}`.slice(0, 300);
    write(`${SLUG}/${r.id}`, page(`${SLUG}/${r.id}`, `${r.name}: Heat Tool Finder`, desc, body, css));
  }

  // ---- "Find tools for this decision": one short line on the pages where a decision is made, all from this one list.
  // Each sits between <!--ht-ctx--> markers just before </main>, so a rebuild replaces it and never doubles it. Pages that
  // are not there are named in the build log rather than skipped silently.
  const CITY_CODE = { Singapore: "SG", Thailand: "TH", Vietnam: "VN", "Viet Nam": "VN", Philippines: "PH", Indonesia: "ID", India: "IN", Bangladesh: "BD", Nepal: "NP", "Sri Lanka": "LK", Cambodia: "KH" };
  const q = o => "/" + SLUG + "/" + H.toQuery(Object.assign(H.emptyState(), o));
  const CONTEXT = [
    ["plan", "Before you name triggers and payers, compare the warning services, assessments and guidance that could inform them, with what each cannot tell you.", q({ decision: ["check_warnings", "prioritise_places", "plan_response"] })],
    ["build", "Choosing where and how to cool? Compare modelling tools, assessments and inclusion checks, with their limits.", q({ decision: ["design_cooling", "prioritise_places", "check_inclusion"] })],
    ["paying-when-heat-strikes", "Assessing hazard, future heat or financial protection for a proposal? Compare screening tools and climate data, with what each cannot show.", q({ decision: ["prioritise_places", "understand_future_heat", "assess_finance"] })],
    ["finance", "Assessing hazard, future heat or financial protection for a proposal? Compare screening tools and climate data, with what each cannot show.", q({ decision: ["prioritise_places", "understand_future_heat", "assess_finance"] })],
    ...(D ? D.LIVE_CITIES.filter(c => CITY_CODE[c.country]).map(c => [`cities/${c.id}`, `Official warnings, heat risk and cooler places in ${c.country}: compare the tools that cover it, each with its limits.`, q({ country: CITY_CODE[c.country] })]) : [])
  ];
  const missingCtx = [];
  for (const [slug, words, href] of CONTEXT) {
    const f = path.join(ROOT, slug, "index.html"); if (!fs.existsSync(f)) { missingCtx.push(slug); continue; }
    let s = fs.readFileSync(f, "utf8").replace(/\n?\s*<!--ht-ctx-->[\s\S]*?<!--\/ht-ctx-->/, "");
    const block = `\n  <!--ht-ctx--><section class="container hub" aria-label="Find a heat tool"><p class="hub-p"><b>Find tools for this decision.</b> ${esc(words)} <a href="${esc(href)}">Heat Tool Finder <span aria-hidden="true">→</span></a></p></section><!--/ht-ctx-->`;
    const at = s.lastIndexOf("</main>"); if (at < 0) { missingCtx.push(slug); continue; }
    fs.writeFileSync(f, s.slice(0, at).replace(/\s*$/, "") + block + "\n  " + s.slice(at));
  }
  if (missingCtx.length) console.warn(`heat tools: no page to link from at ${missingCtx.join(", ")}`);

  // ---- llms-full.txt: the catalogue in plain text ----
  const md = ["## Heat Tool Finder", `${SITE}/${SLUG}/`, CAT.design.headline + " " + CAT.design.subhead, CAT.design.disclaimer + " Common Shade has not run any of these tools; reviewed never means validated or certified.",
    ...H.GROUPS.map(([gid, title, note]) => { const items = R.filter(r => H.groupOf(r) === gid).sort((x, y) => x.name.localeCompare(y.name, "en")); return items.length ? [`### ${title}`, note, ...items.map(r => `- ${r.name} (${r.provider}; ${H.typeLabel(r.resource_type)}; ${H.label(H.STATUS, r.publication.status)}): ${r.summary} Important limit: ${r.limitations[0]} Coverage: ${H.coverage(r)}. Access: ${H.label(H.ACCESS, r.access.mode)}; ${H.licenceLabel(r.access)}. ${H.REVIEW[r.evidence.review_depth]}, ${r.evidence.reviewed_on}. Source: ${r.links.primary_url} Profile: ${SITE}/${SLUG}/${r.id}/`)].join("\n") : ""; }).filter(Boolean),
    "### Illustrative workflows", "Not validated protocols or endorsed procedures.", ...CAT.curated_pathways.map(p => `- ${p.title}: ${p.steps.map(s => `${s.resource_ids.map(i => BY[i].name).join(" + ")} (${s.purpose})`).join(" then ")}`),
    `The catalogue as JSON: ${SITE}/data/heat-tools/catalogue.json`].join("\n\n");
  const f = path.join(ROOT, "llms-full.txt"); let s = fs.readFileSync(f, "utf8"); const i = s.indexOf("## Heat Tool Finder");
  if (i >= 0) { const j = s.indexOf("\n## ", i + 5); s = s.slice(0, i) + (j >= 0 ? s.slice(j + 1) : ""); }
  fs.writeFileSync(f, s.replace(/\n*$/, "\n\n") + md + "\n");
  const l = path.join(ROOT, "llms.txt"); let t = fs.readFileSync(l, "utf8"); const k = t.indexOf("## Heat Tool Finder");
  if (k >= 0) { const j = t.indexOf("\n## ", k + 5); t = t.slice(0, k) + (j >= 0 ? t.slice(j + 1) : ""); }
  fs.writeFileSync(l, t.replace(/\n*$/, "\n\n") + `## Heat Tool Finder\n\n- [Heat Tool Finder](${SITE}/${SLUG}/): which heat tool fits a decision (warnings, where to focus, future heat, exposure, worker protection, cooler places, response plans, financial protection, inclusion): ${ext0.length} outside resources and ${int0.length} Common Shade pages, each with what it needs, what it gives, its limits and how far it was reviewed; never ranked, and none run by Common Shade (also in llms-full.txt; data at ${SITE}/data/heat-tools/catalogue.json)\n`);
  require("./site-counts.js")({ heatTools: ext0.length });
  console.log(`heat tools: index and ${R.length} profiles (${ext0.length} outside resources, ${int0.length} Common Shade pages, ${CAT.curated_pathways.length} workflows)`);
  return R.length;
};
