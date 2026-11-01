// Resources: the India heat action plan archive (/resources/heat-action-plans/india/), its parent pages, and the
// downloadable catalogue files. Every record and every count comes from research/india-hap-archive/ through
// tools/hap-archive.js; replacing the catalogue and rebuilding updates the page. Called by tools/build-pages.js.
// Client: /resources/heat-action-plans/india/hap.js (search and filters). With no JavaScript, every document is listed.
"use strict";
const fs = require("fs"), path = require("path");
const HAP = require("./hap-archive.js");

module.exports = function hapArchive({ page, write, esc, V, ROOT }) {
  const A = HAP.load();
  if (A.problems.length) throw new Error("India HAP archive: " + A.problems.join("; "));
  A.warnings.forEach(w => console.warn("India HAP archive: " + w));
  const { docs, leads, counts: C } = A;
  const SLUG = "resources/heat-action-plans/india", OUT = path.join(ROOT, SLUG);
  fs.mkdirSync(OUT, { recursive: true });

  // downloads: the catalogue and reports exactly as researched (the Python downloader stays in research/, outside the site)
  const L1 = A.files.leads.find(l => l[0] === "batch-1")[1], L2 = A.files.leads.find(l => l[0] === "batch-2")[1];
  const DL = [[A.files.catalogueCsv, "Verified catalogue (CSV)", `All ${C.total} verified documents, with the 16 original columns`],
    [A.files.catalogue, "Verified catalogue (JSON)", "The same records, with each document's type and verification date as fields"],
    [A.files.report, "Coverage report, second search (Markdown)", "What the second search added, the corrections it made, and the combined totals"],
    [A.files.reportFirst, "Coverage report, first search (Markdown)", "How documents were first found, checked and counted"],
    [L2, "Leads not yet verified, second search (CSV)", `${C.leadsByBatch["batch-2"] || 0} documents listed or located but not verified, with the reason for each`],
    [L1, "Documents not yet verified, first search (CSV)", `The first search's list, including ${C.resolved} since verified`]]
    .map(([f, t, d]) => { const out = path.basename(f); fs.copyFileSync(path.join(A.dir, f), path.join(OUT, out)); return { f: out, t, d, kb: Math.max(1, Math.round(fs.statSync(path.join(OUT, out)).size / 1024)) }; });
  // a catalogue file from an earlier release is not left on the site, where it could be mistaken for the current one
  for (const f of fs.readdirSync(OUT)) if (/\.(csv|json|md)$/.test(f) && !DL.some(x => x.f === f)) fs.unlinkSync(path.join(OUT, f));

  const n = x => x.toLocaleString("en-GB");
  const T = HAP.TYPES, ORDER = Object.keys(T).concat("REVIEW");
  const LVL = { national: 0, state: 1, district: 2, city: 3 };
  const yearKey = y => /^\d{4}/.test(y) ? y : "9999" + y;   // periods sort by their first year; "undated" last
  const sorted = docs.slice().sort((a, b) => (b.state === "India") - (a.state === "India") || a.state.localeCompare(b.state) ||
    (LVL[a.level] ?? 9) - (LVL[b.level] ?? 9) || a.place.localeCompare(b.place) || yearKey(a.year).localeCompare(yearKey(b.year)) || a.id.localeCompare(b.id));
  const verifiedOn = C.checked.length === 1 ? new Date(C.checked[0] + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : C.checked.join(", ");

  // filter options, all from the data
  const opts = (obj, sort, label = x => x) => Object.keys(obj).sort(sort).map(k => `<option value="${esc(k)}">${esc(label(k))} (${obj[k]})</option>`).join("");
  const states = { "India": docs.filter(d => d.state === "India").length, ...C.state };
  const stateOpts = opts(states, (a, b) => a === "India" ? -1 : b === "India" ? 1 : a.localeCompare(b), s => s === "India" ? "National (India)" : s);
  const levelOpts = opts(C.level, (a, b) => (LVL[a] ?? 9) - (LVL[b] ?? 9), l => HAP.LEVELS[l] || l);
  const yearOpts = opts(C.year, (a, b) => yearKey(a).localeCompare(yearKey(b)));
  const langOpts = opts(C.language, (a, b) => C.language[b] - C.language[a] || a.localeCompare(b));
  const typeOpts = opts(C.type, (a, b) => ORDER.indexOf(a) - ORDER.indexOf(b), t => (T[t] || { name: "Needs review" }).name);

  const ext = (u, label, cls = "") => `<a${cls ? ` class="${cls}"` : ""} href="${esc(u)}" target="_blank" rel="noopener">${label}<span class="visually-hidden"> (opens in a new tab)</span></a>`;
  const typeTag = t => `<span class="hap-type hap-type--${esc(t.toLowerCase().replace(/_/g, "-"))}">${esc((T[t] || { short: "Needs review" }).short)}</span>`;
  const flags = d => [/\bdraft\b/i.test(d.note) ? "Draft" : "", /adoption not established/i.test(d.note) ? "Adoption not established" : ""].filter(Boolean);
  const pagesText = d => d.pages == null ? "" : d.type === "EMBEDDED_HEAT_HEALTH_PLAN" ? `${n(d.pages)} (whole document)` : n(d.pages);
  const langText = d => d.languages.length > 1 ? `${esc(d.languageLabel)} <small>(a second language may cover part of the document only)</small>` : esc(d.languageLabel);

  const card = d => {
    const local = /^(district|city)$/.test(d.level) && d.district_or_city;   // a district or city name is shown only for district- and city-level records
    const where = d.state === "India" ? "India (national)" : local ? `${d.district_or_city}, ${d.state}` : d.state;
    const q = [d.title, d.district_or_city, d.state, d.publisher_agency, d.id].join(" ").toLowerCase();
    return `<li class="hap-doc" id="${esc(d.id)}" data-state="${esc(d.state)}" data-level="${esc(d.level)}" data-year="${esc(d.year)}" data-lang="${esc(d.languages.join("|"))}" data-type="${esc(d.type)}" data-q="${esc(q)}">
        <div class="hap-doc__top">${typeTag(d.type)}${flags(d).map(f => `<span class="hap-flag">${esc(f)}</span>`).join("")}</div>
        <h3 class="hap-doc__t">${esc(d.title)}</h3>
        <dl class="hap-doc__meta">
          <div><dt>Category</dt><dd>${esc((T[d.type] || { name: "Needs review" }).name)}</dd></div>
          <div><dt>Jurisdiction</dt><dd>${esc(where)} <small>· ${esc(HAP.LEVELS[d.level] || d.level)}</small></dd></div>
          <div><dt>Edition</dt><dd>${esc(d.year)}${d.year === "undated" ? " <small>(no printed year found)</small>" : ""}</dd></div>
          <div><dt>Language</dt><dd>${langText(d)}</dd></div>
          <div><dt>Publisher</dt><dd>${esc(d.publisher_agency)}</dd></div>
          ${pagesText(d) ? `<div><dt>Pages</dt><dd>${pagesText(d)}</dd></div>` : ""}
        </dl>
        ${d.note ? `<p class="hap-doc__note"><b>Note:</b> ${esc(d.note)}</p>` : ""}
        <p class="hap-doc__links">${ext(d.pdf_url, "Open PDF", "hap-pdf")}${d.alternate_url ? d.alternate_url.split("|").map(u => u.trim()).filter(Boolean).map(u => ext(u, "Alternate copy")).join("") : ""}${d.landing_page ? ext(d.landing_page, "Source page") : ""}${d.archive_org_url ? ext(d.archive_org_url, "Archived copy") : ""}</p>
        <p class="hap-doc__id">Catalogue ID: ${esc(d.id)}</p>
      </li>`;
  };

  // coverage, calculated
  const allStates = Object.keys(C.state).sort();
  const withEmbedded = allStates.filter(s => docs.some(d => d.state === s && d.type === "EMBEDDED_HEAT_HEALTH_PLAN"));
  const noStandalone = allStates.filter(s => !C.standaloneByState[s]);
  const LABEL = { HAP: ["standalone heat action plan", "standalone heat action plans"],
    EMBEDDED_HEAT_HEALTH_PLAN: ["heat-health plan inside a wider climate-and-health plan", "heat-health plans inside wider climate-and-health plans"],
    NATIONAL_PLAN: ["national heat-illness action plan", "national heat-illness action plans"],
    GUIDANCE: ["guidance, advisory or manual document", "guidance, advisory or manual documents"], REVIEW: ["document whose type needs review", "documents whose type needs review"] };
  const typeStat = t => C.type[t] ? `<li><b>${n(C.type[t])}</b><span>${esc(LABEL[t][C.type[t] === 1 ? 0 : 1])}</span></li>` : "";
  const plural = (k, one, many) => `${n(k)} ${k === 1 ? one : many}`;

  const gap = d => `<li class="hap-gap" id="lead-${esc(d.id)}"><b>${esc(d.title)}</b><span class="hap-gap__where">${esc(/^(district|city)$/.test(d.level) && d.district_or_city ? `${d.district_or_city}, ${d.state}` : d.state === "India" ? "India (national)" : d.state)} · ${esc(HAP.LEVELS[d.level] || d.level)}</span>
      ${d.note ? `<span class="hap-gap__why">${esc(d.note)}</span>` : ""}${d.landing_page ? `<span class="hap-gap__src">${ext(d.landing_page, "Where it was found")}</span>` : ""}</li>`;

  const LD = { "@context": "https://schema.org", "@type": "Dataset", name: "India heat action plan archive", url: `https://beattheheat.asia/${SLUG}/`,
    description: `A catalogue of ${C.total} verified Indian heat action plans, heat-health plans and guidance documents, with links to the source PDFs. Verified ${verifiedOn}.`,
    license: "https://creativecommons.org/licenses/by/4.0/", isAccessibleForFree: true, spatialCoverage: "India", dateModified: C.checked[C.checked.length - 1] || undefined,
    distribution: [{ "@type": "DataDownload", encodingFormat: "text/csv", contentUrl: `https://beattheheat.asia/${SLUG}/${A.files.catalogueCsv}` }, { "@type": "DataDownload", encodingFormat: "application/json", contentUrl: `https://beattheheat.asia/${SLUG}/${A.files.catalogue}` }] };

  write(SLUG, page(SLUG, "India heat action plan archive", `A searchable archive of ${C.total} verified Indian heat action plans, heat-health plans and guidance documents, with links to each PDF. Verified ${verifiedOn}; a growing archive, not a complete collection.`,
    `<header class="pg-hero"><div class="container"><p class="eyebrow">Resources · Heat action plans</p><h1 class="pg-h1">India heat action plan archive</h1>
      <p class="pg-lede">${n(C.total)} verified documents from across India: plans written by cities, districts and states, the heat-health plans inside wider climate-and-health plans, and the national plan and guidance behind them. A growing archive, not a complete collection.</p>
      <nav class="rf-jump" aria-label="On this page"><a href="#archive">Search the archive</a><a href="#method">How it was checked</a><a href="#gaps">Research gaps</a><a href="#downloads">Download the data</a></nav></div></header>

    <section class="container hap-sec" aria-labelledby="what-h">
      <h2 class="visually-hidden" id="what-h">What the archive holds</h2>
      <ul class="lv-sum hap-sum">${ORDER.map(typeStat).join("")}</ul>
      <p class="hap-p">That is ${plural(C.total - (C.type.GUIDANCE || 0), "plan document", "plan documents")} and ${plural(C.type.GUIDANCE || 0, "guidance document", "guidance documents")}, not ${n(C.total)} standalone plans. ${withEmbedded.length === allStates.length ? `Every one of the ${allStates.length} states and union territories in the archive has a verified heat-health plan inside a climate-and-health plan` : `${withEmbedded.length} of the ${allStates.length} states and union territories in the archive have a verified heat-health plan inside a climate-and-health plan`}; ${plural(allStates.length - noStandalone.length, "has", "have")} at least one verified standalone heat action plan.</p>
    </section>

    <section class="hap-band" id="archive" aria-labelledby="archive-h"><div class="container hap-sec">
      <h2 class="hub-h" id="archive-h">Search the archive</h2>
      <div class="sol-bar hap-bar" data-hap-bar hidden>
        <label class="hap-bar__q">Search title, place or publisher<input type="search" data-hap-q autocomplete="off" placeholder="For example: Ahmedabad, NCDC, Odisha"></label>
        <label>State or UT<select data-hap-f="state"><option value="">All</option>${stateOpts}</select></label>
        <label>Level<select data-hap-f="level"><option value="">All</option>${levelOpts}</select></label>
        <label>Year or period<select data-hap-f="year"><option value="">All</option>${yearOpts}</select></label>
        <label>Language<select data-hap-f="lang"><option value="">All</option>${langOpts}</select></label>
        <label>Document type<select data-hap-f="type"><option value="">All</option>${typeOpts}</select></label>
        <button type="button" class="hap-reset" data-hap-reset>Reset filters</button>
        <p class="sol-count hap-count" data-hap-count aria-live="polite">Showing all ${n(C.total)} documents</p>
      </div>
      <p class="hap-p hap-years">Years are as printed on each document. A period such as 2022-27 is a planning period, not a publication date, and “undated” means no printed year was found.</p>
      <ol class="hap-list" data-hap-list>${sorted.map(card).join("")}</ol>
      <div class="hap-none" data-hap-none hidden><p>No documents match these filters.</p><button type="button" class="hap-reset" data-hap-reset>Reset filters</button></div>
    </div></section>

    <section class="container hap-sec" id="method" aria-labelledby="method-h">
      <h2 class="hub-h" id="method-h">How it was checked</h2>
      <ul class="hap-method">
        <li><b>Source verification was conducted on ${esc(verifiedOn)}.</b> For each document, the source content was retrieved and read to confirm that it is a relevant plan or guidance document, and the edition printed on it was recorded.</li>
        <li><b>Verified means found, not endorsed.</b> Verification establishes that a relevant document was retrieved. It does not establish official adoption, the quality of implementation, or that the PDF can still be downloaded today.</li>
        <li><b>A gap is a gap in this research.</b> Where a place has no document here, it means none was obtained in the searches so far, not that no plan exists.</li>
        <li><b>A growing archive.</b> This is not a complete collection of every Indian plan or edition. Each release adds what new searches find and check, and documents first listed as gaps move into the archive once verified.</li>
        <li><b>Each edition is its own record.</b> Translations in the same PDF count once. Where a hosting site labels a year differently from the document’s cover, the cover is used and the note says so.</li>
        <li><b>Embedded plans are counted honestly.</b> For a heat-health plan inside a wider plan, the page count is for the whole document, and the note says where the heat chapter sits when that is known.</li>
        <li><b>Drafts and caveats stay visible.</b> Drafts, proposals, presentation-format plans and uncertain editions are kept with the researchers' notes, rather than smoothed over.</li>
      </ul>
      <p class="hap-p">Links open the source PDFs where they were found, on government and partner websites. Websites change; if a link no longer works, the catalogue ID and title will help find the document again, and we would be grateful to <a href="/corrections/">hear about it</a>.</p>
    </section>

    <section class="hap-band hap-band--quiet" id="gaps" aria-labelledby="gaps-h"><div class="container hap-sec">
      <h2 class="hub-h" id="gaps-h">Research gaps</h2>
      <p class="hap-p">${plural(noStandalone.length, "state or union territory has", "states and union territories have")} no verified standalone heat action plan in this release: ${esc(noStandalone.join(", "))}. Each has a heat-health plan inside its state or UT climate-and-health plan. These are gaps in the archive, not findings that no plan exists.</p>
      <h3 class="ix-h3">Found but not yet verified (${n(leads.length)})</h3>
      <p class="hap-p">These documents were listed or located but could not be retrieved or read, for example because a file was too large, a server timed out, a link opened an image, or a scan had no readable text. They are not counted in the archive above, and no PDF is offered for them. Some may turn out to be copies or earlier editions of documents already listed, and a few may appear in both lists below.</p>
      ${A.files.leads.map(([b, , label]) => { const rows = leads.filter(l => l.batch === b); return rows.length ? `<h4 class="hap-gaps-h">${esc(label)} (${n(rows.length)})</h4><ul class="hap-gaps">${rows.map(gap).join("")}</ul>` : ""; }).join("")}
    </div></section>

    <section class="container hap-sec" id="downloads" aria-labelledby="dl-h">
      <h2 class="hub-h" id="dl-h">Download the data</h2>
      <ul class="hap-dl">${DL.map(x => `<li><a href="/${SLUG}/${encodeURIComponent(x.f)}" download><b>${esc(x.t)}</b><span>${esc(x.d)}</span><small>${esc(x.f)} · ${x.kb} KB</small></a></li>`).join("")}</ul>
      <p class="hap-p">Free to reuse with credit to Common Shade, under CC BY 4.0. The documents themselves belong to their publishers. A script that downloads every PDF in the catalogue, with retries and checks, is kept with the research files in the site’s repository.</p>
      <p class="hap-p">See also: <a href="/worked-plans/">Worked plans</a> · <a href="/plan/">Plan a response</a> · <a href="/cities/">Cities</a></p>
    </section>
    <script type="application/ld+json">${JSON.stringify(LD).replace(/</g, "\\u003c")}</script><script src="/${SLUG}/hap.js?v=${V}" defer></script>`));

  // the parent pages, so every step of the address leads somewhere
  write("resources/heat-action-plans", page("resources/heat-action-plans", "Heat action plans", "Archives of heat action plans and related guidance, with links to the original documents.",
    `<header class="pg-hero"><div class="container"><p class="eyebrow">Resources</p><h1 class="pg-h1">Heat action plans</h1><p class="pg-lede">Archives of heat action plans and the guidance around them, with links to the original documents, starting with India.</p></div></header>
    <section class="container hub"><ul class="hub-grid"><li><a class="hub-card" href="/resources/heat-action-plans/india/"><b>India</b><span>${n(C.total)} verified documents: ${n(C.type.HAP || 0)} standalone plans, ${n(C.type.EMBEDDED_HEAT_HEALTH_PLAN || 0)} heat-health plans in wider plans, ${n(C.type.NATIONAL_PLAN || 0)} national plan and ${n(C.type.GUIDANCE || 0)} guidance documents</span></a></li></ul>
    <p class="hub-p">More countries will follow as their plans are found and checked. To learn from how places built their plans, see <a href="/worked-plans/">Worked plans</a>.</p></section>`));
  write("resources", page("resources", "Resources", "Archives and downloadable collections from Common Shade: heat action plans, printable one-pagers and the sources behind the site.",
    `<header class="pg-hero"><div class="container"><p class="eyebrow">Resources</p><h1 class="pg-h1">Resources</h1><p class="pg-lede">Collections to search, download and reuse.</p></div></header>
    <section class="container hub"><ul class="hub-grid">
      <li><a class="hub-card" href="/resources/heat-action-plans/india/"><b>India heat action plan archive</b><span>${n(C.total)} verified plans and guidance documents, searchable, with links to each PDF</span></a></li>
      <li><a class="hub-card" href="/sources/"><b>Sources and references</b><span>Every source the site cites, searchable</span></a></li>
      <li><a class="hub-card" href="/print/"><b>Printable one-pagers</b><span>Briefs for officials, partners and funders</span></a></li>
      <li><a class="hub-card" href="/intersections/#resources"><b>Learning resources</b><span>Games and materials on heat and health</span></a></li></ul></section>`));
  console.log(`India HAP archive: ${C.total} verified (${ORDER.filter(t => C.type[t]).map(t => `${t} ${C.type[t]}`).join(", ")}), ${leads.length} leads kept apart (${Object.entries(C.leadsByBatch).map(([k, v]) => `${k} ${v}`).join(", ")})${A.review.length ? `, ${A.review.length} need review` : ""}`);
};
