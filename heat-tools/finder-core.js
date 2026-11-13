/* Heat Tool Finder: the shared logic and words. One file, read by the page builder (tools/build-heat-tools.js), the
   check (tools/check-heat-tools.js) and the page script (heat-tools/finder.js), so the pages, the filters, the exports and
   the check never disagree. Follows the catalogue's filtering_policy: OR within a facet, AND between facets, unknown
   values never pass a strict filter, caution listings only on request, country coverage is never local validation,
   and filters are never loosened to fill an empty result. No scores, no ranking. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.HTCore = factory();
}(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const COUNTRIES = [["BD", "Bangladesh"], ["KH", "Cambodia"], ["IN", "India"], ["ID", "Indonesia"], ["NP", "Nepal"], ["PH", "Philippines"], ["SG", "Singapore"], ["LK", "Sri Lanka"], ["TH", "Thailand"], ["VN", "Viet Nam"]];
  const COUNTRY = Object.fromEntries(COUNTRIES);

  const TYPE = {
    assessment: ["Assessment", "assessment"], screening_tool: ["Tool: hazard screening", "tool"], modelling_tool: ["Tool: modelling", "tool"],
    calculator: ["Tool: calculator", "tool"], mobile_app: ["Tool: mobile app", "tool"], planning_tool: ["Tool: planning workbook", "tool"],
    data_portal: ["Dataset: data portal", "dataset"], dataset: ["Dataset", "dataset"], warning_service: ["Warning service", "warning"],
    guidance: ["Guidance", "guidance"], directory: ["Directory", "directory"], learning_exercise: ["Learning exercise", "learning"]
  };
  const TYPE_GROUPS = [["tool", "Tool"], ["dataset", "Dataset"], ["warning", "Warning service"], ["assessment", "Assessment"], ["guidance", "Guidance"], ["directory", "Directory"], ["learning", "Learning exercise"]];
  const ROLES = [["city", "City and district teams"], ["health", "Health workers and agencies"], ["employer", "Employers and workplaces"], ["ngo", "NGOs and community groups"], ["funder", "Funders"], ["designer", "Designers and engineers"], ["researcher", "Researchers"]];
  const ACCESS = [["public_read", "Free to read"], ["free_tool", "Free to use, as the provider describes it"], ["registration_for_data", "Registration needed for data"], ["unknown", "Access terms not verified"], ["freemium", "Free with paid options"], ["paid", "Paid"]];
  const HORIZONS = [["operational", "Current warnings and observations"], ["historical", "Past conditions"], ["historical_and_future", "Past and future climates"], ["design_scenario", "Design scenarios"], ["planning", "Planning"], ["multiple", "Several horizons"]];
  const METRICS = [["air_temperature", "Air temperature"], ["heat_index", "Heat index"], ["wbgt", "WBGT (wet-bulb globe temperature)"], ["utci", "UTCI (universal thermal climate index)"], ["mean_radiant_temperature", "Mean radiant temperature"], ["thermal_comfort", "Thermal-comfort indices"], ["composite_risk", "Composite risk index"], ["provider_defined", "Defined by the provider"], ["multiple_not_interchangeable", "Several metrics, not interchangeable"], ["energy_resource_use", "Energy and resource use (not a heat measure)"], ["not_applicable", "No heat measure (planning)"]];
  const STATUS = [["documented_listing", "Public documentation reviewed"], ["provisional_listing", "Source description found; further checks needed"], ["caution_listing", "Maintenance or coverage caution"]];
  const REVIEW = {
    source_page_reviewed: "Public description reviewed",
    method_documentation_reviewed: "Selected methodology documentation reviewed",
    official_indexed_content_reviewed: "Official indexed description reviewed; direct verification incomplete"
  };
  const SCOPE = {
    country_specific: "Country specific", global: "Global", global_except_antarctica: "Global (except Antarctica)", input_based_not_geographic: "Works from the inputs you give it",
    provider_coverage_check: "Coverage set by the provider; check your country", europe_adaptable: "Written for Europe; adaptable elsewhere", multiple_regions: "Several regions",
    asia_coverage_unverified: "Coverage in Asia not verified", global_guidance: "Global guidance", south_southeast_asia: "South and Southeast Asia", illustrative_not_geographic: "Illustrative, not a real place"
  };
  const APPLIC = {
    explicit_geographic_coverage: "Named coverage of the country. Coverage is not local validation.",
    editorial_relevance_not_local_validation: "Relevant by editorial judgement. Not validated locally.",
    requires_contextual_adaptation: "Needs adaptation to local law, climate and institutions.",
    unverified: "Coverage in Asia not verified."
  };
  const API = { not_checked: "API not checked", documented_not_tested: "API documented; not run by Common Shade", unavailable: "No API", tested: "API run by Common Shade" };
  const INTEGRATION = { link_out: "Link out only: nothing embedded, no API calls", api: "API", embedded: "Embedded" };
  const MAINT = { not_verified: "Maintenance not verified", provider_reports_updates_paused: "The provider reports updates are paused" };
  const LOCAL = { not_assessed: "Local validation not assessed" };
  const DECISIONS = [["check_warnings", "Check official warnings"], ["prioritise_places", "Decide where to focus"], ["understand_future_heat", "Understand future heat"], ["analyse_exposure", "Analyse heat exposure"], ["protect_workers", "Plan worker protection"], ["design_cooling", "Design cooler places"], ["plan_response", "Build a heat response"], ["assess_finance", "Explore financial protection"], ["check_inclusion", "Check who protection misses"], ["find_resources", "Browse other directories"]];

  // applicability groups, in the order they show; Common Shade's own pages always sit apart
  const GROUPS = [
    ["country", "Country services and assessments", "Named coverage of one country. Coverage is not local validation."],
    ["broader", "Broader tools to assess locally", "Global or multi-region coverage. Not validated for a particular place in Asia: check it against local conditions."],
    ["inputs", "Needs local inputs", "Works from the measurements or designs you give it. The answer is only as local as the inputs."],
    ["adapt", "Needs contextual adaptation", "Written for another region and adaptable. Not locally validated."],
    ["unverified", "Coverage in Asia not verified", "Listed for context, with a caution. Not an operational recommendation."],
    ["cs", "Continue in Common Shade", "Common Shade's own pages: useful next steps, not independent endorsements, and not counted as external tools."]
  ];
  const BROADER = ["global", "global_except_antarctica", "multiple_regions", "global_guidance", "provider_coverage_check"];
  function groupOf(r) {
    if (r.origin === "common_shade") return "cs";
    const s = r.geography.scope;
    if (s === "country_specific") return "country";
    if (s === "input_based_not_geographic") return "inputs";
    if (s === "europe_adaptable") return "adapt";
    if (r.geography.asia_applicability === "unverified" || s === "asia_coverage_unverified") return "unverified";
    if (BROADER.includes(s)) return "broader";
    return "broader";
  }

  const label = (list, id) => (list.find(x => x[0] === id) || [, id])[1];
  const typeLabel = t => (TYPE[t] || [t])[0];
  const typeGroup = t => (TYPE[t] || [, "tool"])[1];
  const regLabel = v => v === true ? "Registration required" : v === false ? "No registration needed" : "Registration not verified";
  const licenceLabel = a => a.licence == null ? "Reuse licence not verified" : a.licence;
  const priceLabel = a => a.price_amount == null ? "Price not verified" : `${a.price_amount} ${a.currency || ""}`.trim();
  const decisionLabel = r => r.decision_tags.map(d => label(DECISIONS, d)).join("; ");
  const countriesOf = r => r.geography.country_codes.map(c => COUNTRY[c] || c);
  const coverage = r => [SCOPE[r.geography.scope] || r.geography.scope, countriesOf(r).join(", ")].filter(Boolean).join(": ");

  // the facets the URL can carry; each value is checked against these lists, and anything else is ignored
  const FACETS = { decision: DECISIONS, type: TYPE_GROUPS, role: ROLES, access: ACCESS, horizon: HORIZONS, metric: METRICS, status: STATUS.slice(0, 2) };
  const FLAGS = ["noreg", "unverified", "caution"];
  function emptyState() { return { decision: [], type: [], role: [], access: [], horizon: [], metric: [], status: [], country: "", q: "", noreg: false, unverified: false, caution: false, compare: [] }; }
  function parseState(search, ids) {
    const p = new URLSearchParams(search || ""), s = emptyState();
    for (const k of Object.keys(FACETS)) {
      const ok = FACETS[k].map(x => x[0]);
      s[k] = [...new Set((p.get(k) || "").split(",").map(x => x.trim()).filter(x => ok.includes(x)))];
    }
    const c = (p.get("country") || "").toUpperCase(); s.country = COUNTRY[c] ? c : "";
    s.q = (p.get("q") || "").slice(0, 80);
    for (const f of FLAGS) s[f] = p.get(f) === "1";
    s.compare = [...new Set((p.get("compare") || "").split(",").filter(x => (ids || []).includes(x)))].slice(0, 3);
    return s;
  }
  function toQuery(s) {
    const p = new URLSearchParams();
    for (const k of Object.keys(FACETS)) if (s[k].length) p.set(k, s[k].join(","));
    if (s.country) p.set("country", s.country);
    if (s.q) p.set("q", s.q);
    for (const f of FLAGS) if (s[f]) p.set(f, "1");
    if (s.compare.length) p.set("compare", s.compare.join(","));
    const q = p.toString().replace(/%2C/g, ",");
    return q ? "?" + q : "";
  }

  const norm = x => String(x || "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
  function haystack(r) { return norm([r.name, r.provider, r.summary, decisionLabel(r), typeLabel(r.resource_type)].join(" ")); }

  // one record against the state: true, or the reason it is out (used to say which filter narrowed the set)
  function test(r, s) {
    if (r.publication.status === "archived") return "archived";
    if (r.publication.status === "caution_listing" && !s.caution) return "caution";
    if (s.country && r.geography.scope === "country_specific" && !r.geography.country_codes.includes(s.country)) return "country";
    const any = (want, have) => !want.length || want.some(w => have.includes(w));
    if (!any(s.decision, r.decision_tags)) return "decision";
    if (!any(s.type, [typeGroup(r.resource_type)])) return "type";
    if (!any(s.role, r.user_roles)) return "role";
    if (!any(s.access, [r.access.mode])) return "access";
    if (!any(s.horizon, r.time_horizons)) return "horizon";
    if (!any(s.metric, r.heat_metrics)) return "metric";
    if (!any(s.status, [r.publication.status])) return "status";
    if (s.noreg && !(r.access.registration_required === false || (s.unverified && r.access.registration_required == null))) return "noreg";
    if (s.q) { const words = norm(s.q).split(/\s+/).filter(Boolean); const h = haystack(r); if (!words.every(w => h.includes(w))) return "q"; }
    return true;
  }
  // the records that pass, in applicability groups, alphabetical within each; never loosened to fill a gap
  function filter(records, s) {
    const pass = records.filter(r => test(r, s) === true);
    const groups = GROUPS.map(([id, title, note]) => ({ id, title: id === "country" && s.country ? `Covers ${COUNTRY[s.country]}` : title, note,
      items: pass.filter(r => groupOf(r) === id).sort((a, b) => a.name.localeCompare(b.name, "en")) })).filter(g => g.items.length);
    const external = pass.filter(r => r.origin !== "common_shade").length;
    return { groups, count: pass.length, external, internal: pass.length - external };
  }
  // the filters a reader has applied, as removable chips: [key, value, words]
  function chips(s) {
    const out = [];
    for (const k of Object.keys(FACETS)) s[k].forEach(v => out.push([k, v, label(FACETS[k], v)]));
    if (s.country) out.push(["country", s.country, COUNTRY[s.country]]);
    if (s.q) out.push(["q", s.q, `Search: ${s.q}`]);
    if (s.noreg) out.push(["noreg", "1", s.unverified ? "No registration (unverified included)" : "No registration needed (confirmed)"]);
    if (s.caution) out.push(["caution", "1", "Caution listings included"]);
    return out;
  }

  // comparison rows: the same words in the comparison, the print-out, the CSV and every profile
  const ROWS = ["Decision supported", "Resource type", "Coverage and scale", "Inputs needed", "Outputs", "Metric", "Time horizon", "Access and licence", "What it cannot tell you", "Review depth", "Last checked", "API / integration status"];
  function rows(r) {
    const a = r.access, t = r.technical;
    return [
      ["Decision supported", `${decisionLabel(r)}. ${r.summary}`],
      ["Resource type", typeLabel(r.resource_type)],
      ["Coverage and scale", `${coverage(r)}. Scale: ${r.geography.spatial_scale}. ${APPLIC[r.geography.asia_applicability] || ""} ${LOCAL[r.evidence.local_validation_status] || r.evidence.local_validation_status}.`.replace(/\s+/g, " ").trim()],
      ["Inputs needed", r.inputs.join(" ")],
      ["Outputs", r.outputs.join(" ")],
      ["Metric", r.heat_metrics.map(m => label(METRICS, m)).join("; ")],
      ["Time horizon", r.time_horizons.map(h => label(HORIZONS, h)).join("; ")],
      ["Access and licence", `${label(ACCESS, a.mode)}. ${regLabel(a.registration_required)}. ${priceLabel(a)}. ${licenceLabel(a)}.`],
      ["What it cannot tell you", r.limitations.join(" ")],
      ["Review depth", `${REVIEW[r.evidence.review_depth]}. Reviewed is not validated or certified.`],
      ["Last checked", r.evidence.reviewed_on],
      ["API / integration status", `${API[t.api_status] || t.api_status}. ${INTEGRATION[t.integration_mode] || t.integration_mode}.`]
    ];
  }
  // a spreadsheet cell that begins with = + - @ (or a tab or return) could run as a formula: a leading apostrophe stops that
  function cell(v) {
    let x = String(v == null ? "" : v);
    if (/^[=+\-@\t\r]/.test(x)) x = "'" + x;
    return '"' + x.replace(/"/g, '""') + '"';
  }
  function csv(records, sourcesById) {
    const head = ["id", "name", "provider", ...ROWS, "Listing status", "Source / access information", "Sources reviewed"];
    const lines = [head.map(cell).join(",")];
    for (const r of records) {
      const src = r.evidence.source_ids.map(i => sourcesById[i]).filter(Boolean).map(x => `${x.title} (${x.publisher}) ${x.url}, accessed ${x.accessed_on}`).join(" | ");
      lines.push([r.id, r.name, r.provider, ...rows(r).map(x => x[1]), label(STATUS, r.publication.status), r.links.primary_url, src].map(cell).join(","));
    }
    return lines.join("\r\n") + "\r\n";
  }
  const safeUrl = u => /^https:\/\//.test(String(u || "")) || /^\/[^/]/.test(String(u || "")) ? u : "";
  const esc = x => String(x == null ? "" : x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  // the badge every listing carries: its review status in words, never a tick
  function badge(r) {
    const st = r.publication.status, cls = st === "caution_listing" ? "caution" : st === "provisional_listing" ? "provisional" : "documented";
    return `<span class="ht-badge ht-badge--${cls}">${esc(label(STATUS, st))}</span>`;
  }
  // one card; the same markup is written into the page at build time and redrawn by the page script
  function card(r, o) {
    o = o || {};
    const sel = (o.selected || []).includes(r.id);
    return `<article class="ht-card${r.publication.status === "caution_listing" ? " ht-card--caution" : ""}" id="tool-${esc(r.id)}">
      <p class="ht-card__meta"><span class="ht-type">${esc(typeLabel(r.resource_type))}</span>${badge(r)}</p>
      <h4 class="ht-card__h"><a href="/heat-tools/${esc(r.id)}/">${esc(r.name)}</a></h4>
      <p class="ht-card__prov">${esc(r.provider)}</p>
      <p class="ht-card__sum"><b>Helps you:</b> ${esc(decisionLabel(r).toLowerCase())}. ${esc(r.summary)}</p>
      <p class="ht-card__where">${esc(coverage(r))} · ${esc(r.geography.spatial_scale)} · ${esc(label(ACCESS, r.access.mode))}</p>
      <p class="ht-card__limit"><b>Important limit:</b> ${esc(r.limitations[0])}</p>
      <p class="ht-card__rev">${esc(REVIEW[r.evidence.review_depth])} · <time datetime="${esc(r.evidence.reviewed_on)}">${esc(r.evidence.reviewed_on)}</time></p>
      <div class="ht-card__acts"><a class="ht-card__go" href="/heat-tools/${esc(r.id)}/">View profile<span class="visually-hidden">: ${esc(r.name)}</span></a>
        <label class="ht-cmp"${o.js ? "" : " hidden"}><input type="checkbox" data-compare="${esc(r.id)}"${sel ? " checked" : ""}> Compare<span class="visually-hidden"> ${esc(r.name)}</span></label></div>
    </article>`;
  }
  function groupsHTML(res, o) {
    return res.groups.map(g => `<section class="ht-group ht-group--${g.id}" aria-labelledby="htg-${g.id}"><h3 class="ht-group__h" id="htg-${g.id}">${esc(g.title)} <span class="ht-group__n">${g.items.length}</span></h3>
      <p class="ht-group__note">${esc(g.note)}</p><div class="ht-cards">${g.items.map(r => card(r, o)).join("")}</div></section>`).join("");
  }

  return { esc, badge, card, groupsHTML, COUNTRIES, COUNTRY, TYPE, TYPE_GROUPS, ROLES, ACCESS, HORIZONS, METRICS, STATUS, REVIEW, SCOPE, APPLIC, API, INTEGRATION, MAINT, LOCAL, DECISIONS, GROUPS, FACETS, ROWS,
    label, typeLabel, typeGroup, regLabel, licenceLabel, priceLabel, decisionLabel, coverage, groupOf, emptyState, parseState, toQuery, test, filter, chips, rows, cell, csv, safeUrl };
}));
