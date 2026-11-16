/* ==========================================================
   Builds /how-heat-is-reported/: how reporting on extreme heat in South and Southeast Asia follows protection.
   The argument in three steps (the first reading of a curated collection, what a multilingual pilot review found,
   and the sharper question both raise), one explorer over every unique record, the reporting trail of each reviewed
   article, worked examples and comparisons, a question kit, and the method beside the claims it qualifies.

       node tools/build-media.js      (build-static.js runs it too)

   Model: tools/media-model.js (one record per unique URL, built from the collection CSV and the pilot files).
   Editorial layer: research/2026-10/media/editorial.json. Page script: how-heat-is-reported/media.js.
   Every count below is computed from the records; each says what it counts. It describes these collections,
   not all reporting on heat.
   ========================================================== */
"use strict";
const fs = require("fs"), path = require("path"), M = require("./media-model.js");
const ROOT = M.ROOT, SITE = "https://beattheheat.asia", SLUG = "how-heat-is-reported", ED = M.ED;
const CSV = path.join(M.DIR, "extreme-heat-journalism-2018-2026.csv");
const { records: R, collection: COLL } = M.records(), S = M.stats(), F = M.facets(), BY = Object.fromEntries(R.map(r => [r.id, r]));
// the link check (verify-urls.yml writes research/2026-11/media-rebuild/link-status.json); its date is the commit that wrote it
const LSF = path.join(ROOT, "research", "2026-11", "media-rebuild", "link-status.json");
const LINKS = fs.existsSync(LSF) ? JSON.parse(fs.readFileSync(LSF, "utf8")) : null;
const LDATE = LINKS ? (() => { try { return require("child_process").execFileSync("git", ["log", "-1", "--format=%cs", "--", LSF], { cwd: ROOT }).toString().trim(); } catch (e) { return ""; } })() || new Date().toISOString().slice(0, 10) : "";
const linkOf = u => { if (!LINKS) return null; const v = LINKS[u]; if (!v) return null; const st = typeof v === "string" ? v : v.status; const code = typeof v === "object" ? String(v.code) : "";
  return { st: st === "OK" || st === "REDIRECT" ? "opened" : st === "BLOCKED" || (st === "FAIL" && code === "timeout") ? "limited" : "notopen", archive: typeof v === "object" ? v.archive || "" : "" }; };
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const ext = (u, t) => `<a href="${esc(u)}" target="_blank" rel="noopener">${t}<span class="visually-hidden"> (opens in a new tab)</span></a>`;
const go = (href, t) => `<a href="${href}">${esc(t)}&nbsp;<span aria-hidden="true">→</span></a>`;
const LOOPN = (() => { const vm = require("vm"), c = {}; vm.createContext(c);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "data.js"), "utf8") + ";this.L=LOOPS;", c);
  return Object.fromEntries(c.L.map(l => [l.id, l.name])); })();
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const fdate = r => r.precision === "day" ? `${+r.date.slice(8)} ${MONTHS[+r.date.slice(5, 7) - 1]} ${r.date.slice(0, 4)}` : `${r.year} (year only recorded)`;
const pct = (n, d) => Math.round(n / d * 100);
const of = (n, d) => `${n} of ${d}`;
const FMT = ED.formats, LANG = M.LANG, COLLS = ED.collections, DEPTH = ED.depths;
const ex = (q) => `?${q}#explore`;

// ---- the existing editorial content, kept ----
const PATTERNS = [
  ["Heat as an emergency", "Record temperatures, deaths, school closures, disrupted daily life.", "Long, repeated exposure between the heatwaves that make headlines.", "reactive"],
  ["Heat as inequality", "Outdoor workers, delivery riders and poorer households carry more of the burden.", "Who pays for protection and for the earnings lost.", "poverty"],
  ["Heat as lost work", "Less working capacity, factory disruption, strain on power and water.", "What it means for investment, competitiveness and supply chains.", "squeeze"],
  ["Cooling as the answer", "Air conditioning, reflective roofs, new materials, local fixes.", "How options compare on cost, upkeep and side effects.", "cooling"],
  ["Responsibility in pieces", "Workers, cities, employers and health systems appear in separate stories.", "How they could share the work and the cost.", "protection"],
  ["Coverage follows visibility", "India and Singapore are covered in depth.", "Detailed reporting from other South and Southeast Asian countries.", "invisible"],
];
const SYSTEMS = [
  { h: "Heat can become a poverty trap, not just lost hours", p: `A worker too hot to work loses income, so may work longer or in worse conditions, gets ill, and has less to spend on rest or cooling. A study of nearly 400 workers in two Delhi settlements followed daily for a month in the summer of 2019 found their net earnings were about <b>40% lower</b> during the two heatwaves in that month, and medical spending rose. It describes those workers in that period, not a national figure. ${ext("https://heathealth.info/resources/heat-causes-large-earnings-losses-for-informal-sector-workers-in-india/", "Das and Somanathan, Environmental Research Letters, 2024")}`, loop: "poverty" },
  { h: "Heat hits markets, not only workers’ bodies", p: `Street vendors can lose working hours and customers at the same time, and take on more unpaid care at home. In a WIEGO survey of Delhi street vendors cited by the ${ext("https://www.oecd.org/en/publications/securing-the-livelihoods-of-informal-economy-workers-in-times-of-global-changes_7b0d17a9-en/full-report/informal-workers-and-emerging-risks-in-the-era-of-environmental-degradation-and-climate-change_3e3c5b34.html", "OECD Development Centre")}, <b>96% said they had fewer customers</b> in extreme heat; in Bangkok, ${ext("https://www.wiego.org/advocacy-worker-education-resources/too-hot-to-work-home-based-workers-street-vendors-bangkok/", "nearly 80% of surveyed workers")} cut their working hours. The same report estimates heat costs informal workers about <b>2.4% of working hours</b>, against 1.4% for formal workers (${ext("https://www.policyedge.in/p/oecd-finds-informal-workers-face-unequal-risks-from-heat-automation-and-ageing", "as summarised by The Policy Edge")}). In Dhaka, ${ext("https://www.iied.org/22755iied", "IIED’s 2026 study")} found outdoor workers lose about 24 working days a year to heat, and garment workers indoors report heat exhaustion almost as often. Its national estimates come in two sizes: wage losses alone (0.91% of GDP), and those losses plus modelled kidney-disease costs (1.38%), so figures quoted in the news can differ without contradicting each other.`, loop: "squeeze" },
  { h: "Protection has a shared-benefit, single-payer problem", p: `A cooler workplace helps workers, the factory, its buyers, insurers and the public purse, but often no single one of them has reason or money to pay for all of it. ${ext("https://apnews.com/article/eab8494242ecfdc108e12685535a4df3", "AP’s 2026 reporting from India’s textile factories")} shows cooling competing with every other cost an employer faces.`, loop: "protection" },
];
const QUESTIONS = [
  ["Industry and investment", "How much of the region’s manufacturing depends on people and machines working safely in hotter conditions, and which investment decisions would need to change?"],
  ["Informal work", "When rest breaks protect health but cut earnings, who could share the cost: employers, platforms, public programmes or insurance? Which approaches have evidence that they work?"],
  ["Coordination", "Why do heat warnings, worker protection, cooling, health services and social protection so often sit with different institutions, and what does good coordination look like in one city?"],
];
const LAYERS = [
  ["What is happening?", "The heat, where it falls and who is exposed.", "/#explore", "The map"],
  ["What does it change?", "Health, work, income, homes and public services.", "/#day", "A day in a heatwave"],
  ["Why does it persist?", "The cycles that feed it, and the gaps between institutions.", "/#loops", "Breaking the cycles"],
  ["What works?", "Responses, their evidence, cost, limits and side effects.", "/solutions/", "Solutions library"],
  ["Who makes protection happen?", "Who acts, who pays and who keeps it working.", "/heat-economy/", "The heat economy"],
];
// what national-language reporting adds: the four examples' own descriptions, kept from the first version of the page
const LOCAL_TEXT = {
  "pk-karachi-roles-2024": "A city meeting in Karachi gives water points, hospital wards, power supply and ambulance lists each a named agency, with a control room to coordinate.",
  "lk-school-directive-2024": "Heat guidance travels from the education ministry, with health advice, through provincial and zonal directors to school principals.",
  "ph-labour-day-2024": "Time off in extreme heat stays unpaid unless a collective agreement between workers and their company changes that.",
  "th-outdoor-rights-2025": "Whether an outdoor or platform worker is protected depends on their employment status, and the article sets out the rules that apply.",
};
const EXJ = Object.fromEntries(M.pilot().filter(a => a.exemplar).map(a => [a.id, a.exemplar]));

// ---- pieces ----
const langName = c => LANG[c] || c;
const titleHtml = (r, tag = "span") => `<${tag} lang="${esc(r.language)}" dir="auto">${esc(r.title)}</${tag}>`;
const trLabel = r => r.translation === "researcher" ? `Working translation, not yet reviewed by a speaker of ${langName(r.language)}` : r.translation === "not-recorded" ? "No English translation recorded" : "";
const enLine = r => r.language !== "en" ? `<p class="hr-en"><span lang="en">${r.title_en ? `English: ${esc(r.title_en)}` : "No English title recorded"}</span> <span class="hr-tr">${esc(trLabel(r))}</span></p>` : "";
const meta = r => [r.outlet + (r.original_outlet ? ` (from ${r.original_outlet})` : ""), fdate(r), r.places.join(", "), langName(r.language), r.format ? FMT[r.format] + (r.format_basis === "the collection's link type" ? " (from the link type)" : "") : "Format not recorded"].map(esc).join(" · ");
const badges = r => r.collections.map(c => `<span class="hr-b hr-b--${c}">${esc(COLLS[c].short)}</span>`).join("") + `<span class="hr-b hr-b--depth">${esc(DEPTH[r.depth].label)}</span>`;
const stateTag = st => `<span class="hr-st hr-st--${st}">${esc(ED.trail_states[st])}</span>`;
const trailHtml = r => !r.trail ? "" : `<details class="hr-trail"><summary>Reporting trail: what the review found</summary>
    <p class="hr-note">Provisional coding: one coder with AI assistance, from the full text read${r.checked ? ` on ${esc(fdate({ precision: "day", date: r.checked }))}` : ""}. States describe what the review found in the text, never what happened or a failure; see <a href="#method">the method</a>.</p>
    <dl class="hr-dl">${r.trail.map(t => `<div data-k="${t.k}"><dt>${esc(t.label)}</dt><dd>${stateTag(t.state)} <span>${esc(t.text)}</span>${t.basis ? ` <span class="hr-basis">(${esc(t.basis)})</span>` : ""}</dd></div>`).join("")}</dl>
    <p class="hr-note">What the article reports is not evidence of impact. Research the article cites was not checked in this review unless a caution says so.</p></details>`;
const dataAttrs = r => `data-id="${esc(r.id)}" data-place="${esc(r.places.join("|"))}" data-lang="${esc(r.language)}" data-year="${r.year}" data-fmt="${esc(r.format || "not-recorded")}" data-coll="${r.collections.join("|")}" data-depth="${r.depth}" data-loop="${esc(r.loops.length ? r.loops.join("|") : "not-assessed")}" data-pop="${r.depth !== "full" ? "not-assessed" : (Object.entries(r.pops).filter(([, v]) => v).map(([k]) => k).join("|") || "none-coded")}" data-has="${r.depth !== "full" ? "not-assessed" : ["organised", "followup", "voice", "budget"].filter(k => r[k]).join("|") || "none"}" data-angle="${esc(r.angle || "")}"`;
const recHtml = r => `<li class="hr-rec" id="rec-${esc(r.id)}" ${dataAttrs(r)}>
    <p class="hr-badges">${badges(r)}</p>
    <h3 class="hr-rec__t">${ext(r.url, titleHtml(r))}</h3>${enLine(r)}
    <p class="hr-meta">${meta(r)}</p>
    ${r.summary ? `<p class="hr-sum">${esc(r.summary)}</p>` : ""}${r.angle ? `<p class="hr-angle"><span class="hr-k">Story angle, as listed</span> ${esc(r.angle)}</p>` : ""}
    ${r.syndication ? `<p class="hr-note">${esc(r.syndication)}</p>` : ""}${r.collections.length > 1 ? `<p class="hr-note">In both collections (listed as ${esc(r.aliases.join(", "))} in the curated collection); counted once as a record.</p>` : ""}
    ${(() => { const l = linkOf(r.url); if (!l || l.st === "opened") return ""; return `<p class="hr-note">${l.st === "limited" ? `Link: could not be checked automatically on ${esc(fdate({ precision: "day", date: LDATE }))} (the publisher limits automated visits, needs a subscription or did not answer in time); it may open in a browser.` : `Link: did not open in an automated check on ${esc(fdate({ precision: "day", date: LDATE }))}; it may be moved or temporarily down.`}${l.archive ? ` ${ext(l.archive, "Archived copy")}` : ""}</p>`; })()}
    ${trailHtml(r)}
    <p class="hr-acts"><a class="hr-mini" href="#rec-${esc(r.id)}" data-hr-link>Link</a>${r.trail ? `<button type="button" class="hr-mini" data-hr-pick="${esc(r.id)}" aria-pressed="false" hidden>Add to comparison</button>` : ""}</p></li>`;
const recRef = id => { const r = BY[id]; return `<a href="#rec-${esc(id)}" class="hr-ref">${titleHtml(r)}</a> <span class="hr-meta">${esc(r.outlet)} · ${esc(fdate(r))} · ${esc(langName(r.language))}</span>`; };

// ---- the argument, step by step, with the records behind each claim ----
const yrs = S.years, maxY = Math.max(...Object.values(S.byYear));
const yearChart = `<figure class="hr-fig"><figcaption><b>Records in the curated collection, by year of publication</b> <span class="hr-note">(${S.collection} records; each bar opens them)</span></figcaption>
  <ol class="hr-bars">${yrs.map(y => `<li><a href="${ex(`collection=collection&year=${y}`)}"><span class="hr-bars__l">${y}${y === yrs[yrs.length - 1] ? "*" : ""}</span><span class="hr-bars__b"><i style="width:${(S.byYear[y] / maxY * 100).toFixed(1)}%"></i></span><span class="hr-bars__n">${S.byYear[y]}</span><span class="visually-hidden"> records: show them</span></a></li>`).join("")}</ol>
  <p class="hr-limit"><b>What this does not show.</b> *To October. A count of the articles collected, not of all news coverage. The 2024 peak reflects that year’s severe heatwaves, and that our searches captured more of its prominent reporting.</p></figure>`;
const P = S.inP;
const chain = [["organised", "Describe how protection is organised", S.pOrganised], ["voice", "Let affected people speak", S.pVoice], ["followup", "Revisit an earlier action or incident", S.pFollowup], ["budget", "Cite budget figures", S.pBudget]];
const chainChart = `<figure class="hr-fig"><figcaption><b>What the review found in the pilot’s full texts</b> <span class="hr-note">(each of ${P} records can count in several rows; each bar opens them)</span></figcaption>
  <ol class="hr-bars">${chain.map(([k, l, n]) => `<li><a href="${ex(`collection=pilot&has=${k}`)}"><span class="hr-bars__l hr-bars__l--w">${esc(l)}</span><span class="hr-bars__b"><i style="width:${(n / P * 100).toFixed(1)}%"></i></span><span class="hr-bars__n">${of(n, P)}</span><span class="visually-hidden"> records: show them</span></a></li>`).join("")}</ol>
  <p class="hr-limit"><b>What this does not show.</b> The pilot looked for reporting on work and protection, so these rows show what such reporting can contain, not how common it is. The codes are provisional: one coder, with AI assistance.</p></figure>`;
const orgFu = R.filter(r => r.organised && r.followup).length, orgBud = R.filter(r => r.organised && r.budget).length;
const argument = `<section class="hr-s" id="argument" aria-labelledby="argument-h">
  <h2 id="argument-h">What we first read, and what a wider look changed</h2>
  <ol class="hr-steps">
   <li class="hr-step" id="collection"><p class="hr-step__k">1 · The first reading</p>
    <h3>The damage is well reported; how protection is organised looked thin</h3>
    <p>A curated collection of ${S.collection} English-language articles (${yrs[0]} to October ${yrs[yrs.length - 1]}, from ${S.outlets} outlets) covers three areas well: the human toll, lost work and income, and cooling. Read at the level of headlines and listings, the connection between them looked less reported: why known, measurable heat risks have not yet become steady protection for workers, reliable funding and clear responsibility.</p>
    <ul class="hr-facts">
     <li><b>${of(S.byYear[2024], S.collection)}</b> were published in 2024 (${pct(S.byYear[2024], S.collection)}%), the year of severe heatwaves across the region and India’s general election. <a href="${ex("collection=collection&year=2024")}">Show them</a></li>
     <li><b>${S.cGeo("India")}</b> mention India; Singapore appears in ${S.cGeo("Singapore")}, Bangladesh in ${S.cGeo("Bangladesh")}, the Philippines and Thailand in ${S.cGeo("Philippines")} each. <a href="${ex("collection=collection&place=India")}">Show the India records</a></li>
     <li><b>None</b> on ${S.cNone.slice(0, -1).join(", ")} or ${S.cNone[S.cNone.length - 1]}. A gap in this collection, not in all reporting.</li>
    </ul>
    ${yearChart}
    <details class="hr-more" id="patterns"><summary>Six recurring patterns in the collection</summary>
     <div class="he-tablewrap" role="region" tabindex="0" aria-label="Six patterns in the coverage"><table class="he-table hr-table">
      <caption class="visually-hidden">What the articles show, what stays less visible, and the cycle on the map it relates to</caption>
      <thead><tr><th scope="col">Pattern</th><th scope="col">What the articles show</th><th scope="col">What stays less visible</th><th scope="col">On the map</th></tr></thead>
      <tbody>${PATTERNS.map(([p, s, l, loop]) => `<tr><th scope="row">${esc(p)}</th><td>${esc(s)}</td><td>${esc(l)}</td><td><a href="/loops/#${loop}">${esc(LOOPN[loop])}</a></td></tr>`).join("")}</tbody></table></div>
     <p class="hr-limit">Patterns come from headlines, descriptions and selected full texts, not a formal content analysis.</p></details></li>
   <li class="hr-step" id="languages"><p class="hr-step__k">2 · The wider look</p>
    <h3>Read in full and in national languages, reporting carried more institutional detail</h3>
    <p>To test the first reading, a pilot review searched for reporting on work and protection in the countries and languages the collection missed, and read ${P} articles in full: ${of(S.pNonEn, P)} not in English, in ${S.pLangs} languages, from ${S.pCountries} countries, published ${S.pYears[0]} to ${S.pYears[1]}. It found more of the missing middle than expected: <b>${of(S.pOrganised, P)}</b> describe how protection is organised, naming who acts and how help is delivered, paid for or followed up. <a href="${ex("collection=pilot&has=organised")}">Show the ${S.pOrganised}</a></p>
    <ul class="hr-local">${ED.examples.filter(e => e.group === "institutional").map(e => `<li><b>${esc(e.h)}.</b> ${esc(LOCAL_TEXT[e.id])}<br>${recRef(e.id)} <a class="hr-mini" href="#ex-${esc(e.id)}">How it follows protection</a></li>`).join("")}</ul>
    ${chainChart}
    <p class="hr-limit"><b>About the pilot.</b> ${P} articles were chosen by searching for work and protection, so they show what good reporting can look like, not how common it is. They were coded once, with AI assistance and without a second coder, and translations from national languages still need review. The pilot does not yet compare coverage before, during and after heatwaves, or set coverage against measured heat. Every article links to the original. These examples are worth learning from; they do not show that one language reports heat better than another.</p></li>
   <li class="hr-step" id="middle"><p class="hr-step__k">3 · The sharper question</p>
    <h3>Not whether protection is reported, but whether coverage follows it all the way</h3>
    <p>The combined reading changes the question: from a named responsibility, through money and delivery, to results. Of the ${S.pOrganised} pilot articles that describe how protection is organised, ${orgFu} revisit an earlier action or incident, and ${orgBud} cite budget figures. <a href="${ex("collection=pilot&has=followup")}">Show the follow-ups</a></p>
    <div class="hr-mid" role="list">
     <div class="hr-mid__b" role="listitem"><p class="hr-k">The big picture</p><p>Productivity, growth, competitiveness.</p></div>
     <div class="hr-mid__b hr-mid__b--gap" role="listitem"><p class="hr-k">The under-examined middle</p><p><b>Who pays? Who coordinates? What incentives change? Who is accountable?</b></p></div>
     <div class="hr-mid__b" role="listitem"><p class="hr-k">The close-up</p><p>Worker safety, wages, households, practical cooling.</p></div>
    </div>
    <p>This is not an unreported subject. Economic commentary links heat to growth, construction, food prices, power and decarbonisation; close-up reporting follows delivery riders, port engineers, safety rules and earnings. The opportunity is to connect existing reporting into a clearer account of how an economic problem becomes an organised, funded response.</p>
    <p class="hr-limit"><b>Read with care.</b> Neither collection is a sample of all reporting, and a gap in them is not an absence of reporting. The curated collection was read at listing depth and the pilot in full, so their counts are not compared with each other.</p></li>
  </ol></section>`;

// ---- the explorer ----
const optLabel = { place: v => v, language: v => langName(v), year: v => v, format: v => v === "not-recorded" ? "Not recorded" : FMT[v] || v, collection: v => COLLS[v].label, depth: v => DEPTH[v].label,
  loop: v => v === "not-assessed" ? "Not assessed (listing depth)" : LOOPN[v] || v, pop: v => ({ workers: "Outdoor and informal workers", women: "Women and care", children: "Children and schools", "none-coded": "None coded", "not-assessed": "Not assessed (listing depth)" }[v] || v) };
const HAS = [["organised", "Describes how protection is organised"], ["voice", "Affected people speak"], ["followup", "Revisits an earlier action"], ["budget", "Cites budget figures"], ["none", "None of these found"], ["not-assessed", "Not assessed (listing depth)"]];
const sel = (key, label, facet, fk) => `<div class="hr-f"><label for="hr-${key}">${esc(label)}</label><select id="hr-${key}" data-f="${key}"><option value="">All</option>${facet.map(([v, n]) => `<option value="${esc(v)}" data-label="${esc(optLabel[fk](v))}">${esc(optLabel[fk](v))} (${n})</option>`).join("")}</select></div>`;
const hasCounts = HAS.map(([k, l]) => [k, l, R.filter(r => (r.depth !== "full" ? ["not-assessed"] : (["organised", "followup", "voice", "budget"].filter(x => r[x]).length ? ["organised", "followup", "voice", "budget"].filter(x => r[x]) : ["none"])).includes(k)).length]);
const explorer = `<section class="hr-s" id="explore" aria-labelledby="explore-h">
  <span id="bibliography" class="hr-anchor"></span><span id="pilot-list" class="hr-anchor"></span><h2 id="explore-h">Find reporting</h2>
  <p class="hr-lede">Every record from both collections, once each: ${S.unique} unique records from ${S.memberships} publication records, because ${S.both} stories are in both. Newest first. Filters use only what each source records; anything else reads “not recorded” or “not assessed”.</p>
  <form class="hr-find" id="hr-find" role="search" aria-label="Find reporting" hidden>
   <div class="hr-f hr-f--q"><label for="hr-q">Search titles, outlets, places and summaries</label><input id="hr-q" type="search" autocomplete="off" data-f="q" placeholder="insurance, Karachi, factory, Tagalog"></div>
   <div class="hr-fgrid">${sel("place", "Place, as recorded", F.place, "place")}${sel("language", "Language", F.language, "language")}${sel("collection", "Collection", F.collection, "collection")}</div>
   <details class="hr-moref"><summary>More filters</summary><div class="hr-fgrid">
    ${sel("year", "Year published", F.year, "year")}${sel("format", "Format", F.format, "format")}${sel("depth", "Depth of review", F.depth, "depth")}
    ${sel("loop", "Cycle on the map (pilot coding)", F.loop, "loop")}${sel("pop", "Population (pilot coding)", F.pop, "pop")}
    <div class="hr-f"><label for="hr-has">What the review found (pilot)</label><select id="hr-has" data-f="has"><option value="">All</option>${hasCounts.map(([k, l, n]) => `<option value="${k}" data-label="${esc(l)}">${esc(l)} (${n})</option>`).join("")}</select></div>
   </div></details>
   <div class="hr-status"><p id="hr-count" role="status" aria-live="polite">${S.unique} records</p><div class="hr-chips" id="hr-chips"></div></div>
   <p class="hr-tools"><button type="button" class="hr-btn" data-hr-reset>Reset</button><button type="button" class="hr-btn" data-hr-share>Copy a link to this view</button><button type="button" class="hr-btn" data-hr-csv>Download these results (CSV)</button><span class="hr-said" role="status" aria-live="polite"></span></p>
  </form>
  <p class="hr-downloads">Downloads: <a href="/${SLUG}/records.csv" download>all ${S.unique} records (CSV)</a> · <a href="/${SLUG}/records.json">the same as JSON</a> · <a href="/${SLUG}/extreme-heat-journalism-2018-2026.csv" download>the curated collection as first published (CSV)</a>. Every article is also in ${go("/sources/#media", "Sources and references")}</p>
  <p class="hr-note" id="links-checked">${LINKS ? (() => { const c = { opened: 0, limited: 0, notopen: 0 }; R.forEach(r => { const l = linkOf(r.url); if (l) c[l.st]++; }); return `Links last checked automatically on ${esc(fdate({ precision: "day", date: LDATE }))}: ${c.opened} opened, ${c.limited} could not be checked automatically (publishers that limit automated visits, need a subscription or did not answer in time), and ${c.notopen} did not open. Opened means the page answered; its content was not re-read.`; })() : "Links were last checked automatically on 30 October 2026, for the curated collection."}</p>
  <div class="hr-empty" id="hr-empty" hidden><p><b>No records match all of these filters.</b> A missing combination describes these collections, not reporting in that place or language.</p><p><button type="button" class="hr-btn" data-hr-undo>Remove the last filter</button> <button type="button" class="hr-btn" data-hr-reset>Reset all filters</button></p></div>
  <div class="hr-cmp" id="hr-cmp" hidden aria-live="polite"></div>
  <ul class="hr-list" id="hr-list">${R.map(recHtml).join("\n")}</ul>
  <p class="hr-pager" id="hr-pager" hidden><button type="button" class="hr-btn" data-hr-more></button></p>
 </section>`;

// ---- learning from examples, and comparisons ----
const trailOf = (r, k) => r.trail.find(t => t.k === k);
const exCard = e => { const r = BY[e.id], X = EXJ[e.id];
  const row = (h, ks) => `<div><dt>${esc(h)}</dt><dd>${ks.map(k => { const t = trailOf(r, k); return `${stateTag(t.state)} ${esc(t.text)}`; }).join("<br>")}</dd></div>`;
  return `<article class="hr-ex" id="ex-${esc(e.id)}"><p class="hr-k">${e.group === "institutional" ? "Institutional detail" : "Follows protection further"}</p><h3>${esc(e.h)}</h3>
    <p>${recRef(e.id)}</p>${enLine(r)}
    <dl class="hr-dl">
     <div><dt>What it reports (reviewed summary)</dt><dd>${esc(r.summary)}</dd></div>
     ${X ? `<div><dt>What it does that is worth learning from</dt><dd>${esc(X.what_it_does_well)}</dd></div>` : ""}
     <div class="hr-sugg"><dt>A possible follow-up question <span class="hr-tag">Common Shade’s suggestion</span></dt><dd>${esc(e.followup)}</dd></div>
    </dl>
    <details class="hr-trail"><summary>How it follows protection</summary><dl class="hr-dl">
     ${row("Evidence and voices", ["harm", "voices"])}
     ${row("Responsibility, resources and delivery", ["responsible", "resources", "delivery", "checks"])}
     ${row("What remains open", ["followup", "open"])}
    </dl><p class="hr-note">${esc(ED.trail_note)}</p></details>
    <p class="hr-acts"><a class="hr-mini" href="#rec-${esc(e.id)}">See it in the list</a></p></article>`; };
const cmpHtml = c => `<section class="hr-cmpx" id="cmp-${esc(c.id)}" aria-labelledby="cmp-${esc(c.id)}-h"><h3 id="cmp-${esc(c.id)}-h">${esc(c.h)}</h3><p>${esc(c.why)}</p>
   <div class="hr-ctable" role="table" aria-label="${esc(c.h)}">
    <div class="hr-crow hr-crow--h" role="row"><span role="columnheader">What the review records</span>${c.records.map(id => `<span role="columnheader">${recRef(id)}</span>`).join("")}</div>
    ${c.rows.map(row => `<div class="hr-crow" role="row"><span role="rowheader">${esc(row.label)}</span>${c.records.map(id => { const cell = row.cells[id]; const r = BY[id];
      return `<span role="cell" data-label="${esc(r.outlet)}">${cell ? `${stateTag(cell.state)} “${esc(cell.quote)}” <span class="hr-basis">(${esc(cell.field.replace("notes.", "reviewer’s note, ").replace("exemplar.", "reviewer’s note, ").replace("mm_evidence", "reviewer’s note on the passage").replace("summary_plain", "reviewed summary"))})</span>` : stateTag("not_assessed")}</span>`; }).join("")}</div>`).join("")}
   </div><p class="hr-limit">Each cell quotes the review’s record of the article, not the article itself. The comparison sets reporting approaches side by side; it does not judge which story is better.</p></section>`;
const learn = `<section class="hr-s" id="learn" aria-labelledby="learn-h">
  <span id="dots" class="hr-anchor"></span><h2 id="learn-h">How these examples follow protection</h2>
  <p class="hr-lede">Ten articles from the pilot, chosen because they follow protection further, not as a ranking. For each: what it reports, whose voices and evidence it uses, how it connects responsibility, resources and delivery, and what it leaves open. A report is not the same as a finding.</p>
  <div class="hr-exs">${ED.examples.map(exCard).join("\n")}</div>
  <h3 class="hr-h3" id="compare">Compare two stories on the same protection</h3>
  ${ED.comparisons.map(cmpHtml).join("\n")}
  <p class="hr-note">Choose “Add to comparison” on any record read in full to compare up to three side by side. Records read only at listing depth have no reporting trail to compare.</p>
 </section>`;

// ---- develop a question ----
const places = F.place.filter(([v]) => R.some(r => r.places.includes(v))).map(([v]) => v);
const K = ED.kit;
const develop = `<section class="hr-s" id="develop" aria-labelledby="develop-h">
  <h2 id="develop-h">Develop a reporting question</h2>
  <p class="hr-lede">${esc(K.note)}</p>
  <p class="hr-note">The questions and kinds of record here were drafted with AI assistance and reviewed by the site’s maintainer: suggestions, not findings.</p>
  <form class="hr-kit" id="hr-kit" hidden>
   <div class="hr-fgrid">
    <div class="hr-f"><label for="kit-topic">Topic</label><select id="kit-topic">${K.topics.map(t => `<option value="${t.id}">${esc(t.label)}</option>`).join("")}</select></div>
    <div class="hr-f"><label for="kit-place">Place</label><select id="kit-place"><option value="">Any place</option>${places.map(p => `<option>${esc(p)}</option>`).join("")}</select></div>
    <div class="hr-f"><label for="kit-pop">Population</label><select id="kit-pop">${Object.entries(K.populations).map(([k, p]) => `<option value="${k}">${esc(p.label)}</option>`).join("")}</select></div>
   </div>
  </form>
  <div class="hr-brief" id="hr-brief" aria-live="polite"></div>
  <noscript><p class="hr-note">The question kit needs JavaScript. Its six starting questions are below.</p></noscript>
  <ul class="hr-kitlist" id="hr-kitlist">${K.topics.map(t => `<li><b>${esc(t.label)}.</b> ${esc(t.q.replace("{place}", "the place you report on").replace("{pop}", K.populations.any.text))}</li>`).join("")}</ul>
  <script type="application/json" id="hr-kit-data">${JSON.stringify({ topics: K.topics, populations: K.populations, loops: LOOPN }).replace(/</g, "\\u003c")}</script>
 </section>`;

// ---- what research adds, questions, and the site ----
const research = `<section class="hr-s" id="research" aria-labelledby="research-h">
  <span id="systems" class="hr-anchor"></span><h2 id="research-h">What research adds to the reporting</h2>
  <p class="hr-lede">Three patterns where checked research, rather than news reports, establishes the figures. Each figure was checked against its source in October 2026.</p>
  <div class="hr-exs">${SYSTEMS.map(s => `<article class="hr-ex"><h3>${esc(s.h)}</h3><p>${s.p}</p><p class="hr-k">On the map</p><p><a href="/loops/#${s.loop}">${esc(LOOPN[s.loop])}</a>, and the solutions that can break it</p></article>`).join("")}</div>
  <h3 class="hr-h3" id="questions">Questions worth investigating</h3>
  <p>For reporters, researchers and anyone who funds or plans protection. A strong evidence base is now emerging beyond India and Singapore: ${ext("https://www.iied.org/22755iied", "IIED’s August 2026 study of informal workers in Dhaka")} is one place to start.</p>
  <ol class="hr-qs">${QUESTIONS.map(([w, t]) => `<li><span class="hr-k">${esc(w)}</span> ${esc(t)}</li>`).join("")}</ol>
  <details class="hr-more" id="layers"><summary>Five questions, and where this site answers them</summary>
   <p>Every link between a harm and a response on Common Shade is a question someone can check: each claim carries its source and how strong the evidence is. A reporter following delivery riders, for example, can trace heat to pay per delivery, platform rules, rest spaces, city responsibilities and household budgets.</p>
   <ol class="hr-layers">${LAYERS.map(([q, d, h, t]) => `<li><b>${esc(q)}</b> ${esc(d)} ${go(h, t)}</li>`).join("")}</ol></details>
 </section>`;

// ---- method ----
const method = `<section class="hr-s" id="method" aria-labelledby="method-h">
  <h2 id="method-h">How this page was made</h2>
  <dl class="hr-dl hr-dl--method">
   ${Object.entries(COLLS).map(([k, c]) => `<div><dt>${esc(c.label)}</dt><dd>${esc(c.method)} Depth of review: ${esc(DEPTH[c.depth].label.toLowerCase())}. ${esc(DEPTH[c.depth].note)}</dd></div>`).join("")}
   <div><dt>Counting</dt><dd>${S.memberships} publication records (${S.collection} in the collection, ${S.pilot} in the pilot) make ${S.unique} unique records: ${S.both} stories appear in both, matched by their address. A check for near-identical headlines found no other copy of the same story; syndicated copies are noted on their record. Counts on this page say whether they count the collection, the pilot or unique records.</dd></div>
   <div><dt>Translation</dt><dd>${of(S.pTranslated, P)} pilot headlines are in a national language. Each has a working English translation that the publisher has not authorised and a speaker of the language has not yet reviewed. Original titles are shown first, in their own script and direction. <a href="/research/2026-11/media-rebuild/translation-review.csv" download>The translations to review (CSV)</a>. If you read one of these languages, you can <a href="/join/#join-form">offer a review through the join form</a> (a Microsoft Forms page; see <a href="/privacy/">Privacy</a>). A reviewed translation is credited in aggregate, as “reviewed by one speaker of the language”, with no names published.</dd></div>
   <div><dt>Second coding</dt><dd>The pilot was coded by one coder with AI assistance, so its codes stay provisional. <a href="/research/2026-10/media/pilot/second-coding-protocol.md">A protocol for a human second coder</a> is proposed, not scheduled.</dd></div>
  </dl>
  <details class="hr-more"><summary>Coding definitions</summary><dl class="hr-dl">${ED.definitions.map(([t, d]) => `<div><dt>${esc(t)}</dt><dd>${esc(d)}</dd></div>`).join("")}<div><dt>Reporting trail states</dt><dd>${Object.values(ED.trail_states).map(esc).join("; ")}. ${esc(ED.trail_note)}</dd></div></dl><p class="hr-note">${esc(ED.codebook_gap)} <a href="/research/2026-10/media/pilot/working-definitions-as-applied.md">Working definitions, as applied in the pilot records</a>: written after coding from the codes and evidence notes, not the original codebook.</p></details>
  <details class="hr-more"><summary>About this reading, and what it is not</summary><p>This is an editorial reading, not a claim that nobody has reported how protection is organised; several journalists have covered heat’s human and economic effects in depth. The collection was curated in October 2026, and the searches captured more of 2024’s prominent reporting, so the counts describe the collection, not all coverage. Patterns come from headlines, descriptions and selected full texts, not a formal content analysis; any stronger research claim would need a sampling method and a second coder. Headlines are the outlets’ own; listing an article is not an endorsement of its framing. Nothing here scores or ranks outlets, countries or languages.</p>
   <p>A link check on 30 October 2026 opened the collection’s links: some publishers block automated checks or ask for payment, and every article was kept. Articles and headlines belong to their publishers and authors; this page links to them and quotes only short passages from the review’s own notes.</p></details>
 </section>`;

const TITLE = "How extreme heat is reported in South and Southeast Asia";
const DESC = `How ${S.unique} news articles on extreme heat in South and Southeast Asia (2018–2026), in ${S.pLangs} languages, follow protection: an explorer with the reporting trail of each reviewed article, worked examples, comparisons and a question kit.`;
const V = (fs.readFileSync(path.join(ROOT, "index.html"), "utf8").match(/styles\.css\?v=(\d+)/) || [, "1"])[1];
const ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%2316202B'/%3E%3Cpath d='M5 14 Q16 4 27 14' fill='none' stroke='%23F26430' stroke-width='4.5' stroke-linecap='round'/%3E%3Cpath d='M9 13 V27 M23 13 V27' stroke='%23F6E7D7' stroke-width='2.6' stroke-linecap='round'/%3E%3C/svg%3E";
const body = `
    <section class="sol-page hr">
      <div class="container">
        <p class="eyebrow">Heat in the news · a reading of the coverage</p>
        <h1 class="h2 tool-h1">Heat’s damage is well reported. Does reporting follow protection all the way?</h1>
        <p class="tool-lede">A first reading of ${S.collection} English-language articles suggested that how protection is organised, paid for and kept going was rarely reported. A pilot that read ${P} articles in full, in ${S.pLangs} languages, found more of it than expected. Together they point to a more precise question: does coverage follow protection from a named responsibility, through money and delivery, to results?</p>
        <p class="hr-for">For journalists, researchers, practitioners and funders: find reporting across countries and languages, see what each article contains, and follow how protection is authorised, financed, delivered and examined.</p>
        <nav class="hr-jump" aria-label="On this page"><a href="#argument">The argument</a><a href="#explore">Find reporting</a><a href="#learn">Examples and comparisons</a><a href="#develop">Develop a question</a><a href="#research">What research adds</a><a href="#method">Method</a></nav>
        ${argument}
        ${explorer}
        ${learn}
        ${develop}
        ${research}
        ${method}
      </div>
    </section>`;
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(TITLE)} · Common Shade</title>
  <meta name="description" content="${esc(DESC)}">
  <meta name="theme-color" content="#16202B">
  <link rel="canonical" href="${SITE}/${SLUG}/">
  <link rel="license" href="https://creativecommons.org/licenses/by/4.0/">
  <meta property="og:type" content="article"><meta property="og:site_name" content="Common Shade">
  <meta property="og:url" content="${SITE}/${SLUG}/"><meta property="og:title" content="${esc(TITLE)}"><meta property="og:description" content="${esc(DESC)}">
  <meta property="og:image" content="${SITE}/images/social-share-cs.jpg"><meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${ICON}">
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;500;600;700;800&family=Newsreader:ital,wght@0,400;0,500;1,400&display=swap">
  <link rel="stylesheet" href="/styles.css?v=${V}">
  <link rel="stylesheet" href="/${SLUG}/media.css?v=${V}">
  <script src="/${SLUG}/media.js?v=${V}" defer></script>
</head>
<body data-page="media">
  <a class="skip-link" href="#main">Skip to the content</a>
  <main id="main" tabindex="-1">${body}</main>
  <footer class="wkp-foot"><div class="container">
    <p>A reading of two collections of news articles, October 2026, rebuilt November 2026. Articles and headlines belong to their publishers and authors. Know a strong article we missed, especially in a national language? <a href="/join/">Tell us</a>. Text: <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0<span class="visually-hidden"> (opens in a new tab)</span></a>. <a href="/sources/">All sources</a></p>
  </div></footer>
</body>
</html>
`;

// ---- downloads: one record per unique URL, as CSV and JSON ----
const COLS = [["id", r => r.id], ["also_listed_as", r => r.aliases.join(" ")], ["collections", r => r.collections.join(" ")], ["review_depth", r => DEPTH[r.depth].label], ["title", r => r.title], ["title_en", r => r.title_en || ""], ["translation", r => trLabel(r) || "Not needed"],
  ["language", r => langName(r.language)], ["outlet", r => r.outlet], ["original_outlet", r => r.original_outlet || ""], ["date", r => r.date], ["date_precision", r => r.precision], ["places", r => r.places.join("; ")],
  ["format", r => r.format ? FMT[r.format] : "Not recorded"], ["format_basis", r => r.format_basis || ""], ["story_angle", r => r.angle || ""], ["summary", r => r.summary || ""],
  ["organisation_of_protection_described", r => r.organised === null ? "Not assessed" : r.organised ? "yes" : "no"], ["follow_up", r => r.followup === null ? "Not assessed" : r.followup ? "yes" : "no"],
  ["affected_people_speak", r => r.voice === null ? "Not assessed" : r.voice ? "yes" : "no"], ["cycles", r => r.depth !== "full" ? "Not assessed" : r.loops.join(" ")],
  ["informal_work", r => r.depth !== "full" ? "Not assessed" : r.pops.workers ? "yes" : "no"], ["women_or_care", r => r.depth !== "full" ? "Not assessed" : r.pops.women ? "yes" : "no"],
  ["link_check", r => { const l = linkOf(r.url); return !l ? "Not checked" : l.st === "opened" ? `Opened ${LDATE}` : l.st === "limited" ? `Could not be checked automatically ${LDATE}` : `Did not open ${LDATE}`; }], ["archived_copy", r => (linkOf(r.url) || {}).archive || ""], ["url", r => r.url]];
const csvCell = v => /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v);
const csv = [COLS.map(c => c[0]).join(","), ...R.map(r => COLS.map(c => csvCell(c[1](r))).join(","))].join("\n") + "\n";
const json = { about: `How heat is reported: ${S.unique} unique records from ${S.memberships} publication records in two collections. Pilot codes are provisional (one coder, AI-assisted). Fields a source does not record are null. CC BY 4.0 for Common Shade's own fields; titles and articles belong to their publishers.`,
  generated: new Date().toISOString().slice(0, 10), collections: COLLS, depths: DEPTH, trail_states: ED.trail_states,
  link_check: LINKS ? { date: LDATE, note: "Opened means the page answered an automated request; its content was not re-read." } : null,
  records: R.map(r => Object.assign({}, r, { assessed: r.depth === "full" ? "full text, provisional coding" : "listing depth: content not assessed", link: linkOf(r.url), trail: r.trail ? r.trail.map(t => ({ k: t.k, label: t.label, state: t.state, text: t.text, basis: t.basis })) : null })) };

fs.mkdirSync(path.join(ROOT, SLUG), { recursive: true });
fs.writeFileSync(path.join(ROOT, SLUG, "index.html"), html);
fs.copyFileSync(CSV, path.join(ROOT, SLUG, "extreme-heat-journalism-2018-2026.csv"));
fs.writeFileSync(path.join(ROOT, SLUG, "records.csv"), csv);
fs.writeFileSync(path.join(ROOT, SLUG, "records.json"), JSON.stringify(json, null, 1) + "\n");
// working definitions, as applied: generated from the pilot records, never written by hand (the original codebook is not here)
{
  const PA = M.pilot(), cnt = f => { const m = {}; PA.forEach(a => [].concat(a[f]).forEach(v => { const k = String(v); m[k] = (m[k] || 0) + 1; })); return Object.entries(m).sort((x, y) => y[1] - x[1]); };
  // evidence notes as written, the most specific first (a note covering fewer codes); only the record id is given, because
  // passage locations can name people quoted in an article, and the site names no individuals
  const notes = f => { const all = []; PA.forEach(a => (a.notes.evidence || []).filter(e => (e.fields || []).includes(f)).forEach(e => all.push([e.note, a.id, e.fields.length])));
    all.sort((x, y) => x[2] - y[2]); const m = new Map(); all.forEach(([n, id]) => { if (!m.has(n) && m.size < 3) m.set(n, id); }); return [...m.entries()]; };
  const FIELDS = [["missing_middle", "Organisation of protection (shown on the page as \"described\" for levels 2 and 3)"], ["followup", "Follow-up"], ["voice_of_affected", "Affected people speak"], ["informal_work", "Informal work"], ["gender_or_care", "Women and care"],
    ["loop_ids", "Cycle on the map"], ["format", "Format"], ["frame_primary", "Main frame"], ["frames_secondary", "Other frames"], ["actors_quoted", "Who is quoted"], ["data_used", "Data used"], ["humidity_mentioned", "Humidity mentioned"], ["solutions_depth", "Depth on solutions (not shown on the page)"]];
  const defs = Object.fromEntries(ED.definitions);
  const out = ["# Working definitions, as applied in the pilot records", "",
    "Written after coding, from the codes and evidence notes each record carries. The pilot's original codebook was not available, so this file describes how codes were applied, not the method as designed. Generated by tools/build-media.js from research/2026-10/media/pilot/articles.json; do not edit by hand.", "",
    `Records: ${PA.length}, each read in full and coded once with AI assistance, without a second coder. Every code is provisional.`, ""];
  for (const [f, label] of FIELDS) {
    out.push(`## ${label} (\`${f}\`)`, "");
    const d = { missing_middle: defs["Organisation of protection described"], followup: defs["Follow-up"], voice_of_affected: defs["Affected people speak"], informal_work: defs["Informal work; women and care"], gender_or_care: defs["Informal work; women and care"], loop_ids: defs["Cycle on the map"] }[f];
    if (d) out.push(`As used on the page: ${d}`, "");
    out.push(`Values in the records: ${cnt(f).map(([v, n]) => `${v} (${n})`).join(", ")}.`, "");
    const ns = notes(f); if (ns.length) { out.push("Evidence notes as written (with the record they come from):", ""); ns.forEach(([n, w]) => out.push(`- ${n} (${w})`)); out.push(""); }
  }
  fs.writeFileSync(path.join(M.DIR, "pilot", "working-definitions-as-applied.md"), out.join("\n"));
  // the translations to review: one row per translated headline, with blank columns for a speaker of the language
  const TR = R.filter(r => r.translation === "researcher");
  fs.writeFileSync(path.join(ROOT, "research", "2026-11", "media-rebuild", "translation-review.csv"), ["id,language,original_title,working_english_translation,url,reviewed_translation,reviewer_notes,reviewed_on",
    ...TR.map(r => [r.id, langName(r.language), r.title, r.title_en, r.url, "", "", ""].map(csvCell).join(","))].join("\n") + "\n");
}
// the collection as other builders read it (Sources and references, Growing): unchanged shape
const ARTS = COLL.map(a => ({ year: a.year, pub: a.outlet, title: a.title, geo: a.places.join("; "), angle: a.angle, url: a.url, type: a.link_type })).sort((a, b) => b.year - a.year || a.pub.localeCompare(b.pub));
fs.writeFileSync(path.join(M.DIR, "articles.json"), JSON.stringify(ARTS, null, 1) + "\n");
require("./site-counts.js")({ mediaArticles: S.collection, mediaRecords: S.unique });
console.log(`how heat is reported: ${S.unique} unique records (${S.collection} collection + ${S.pilot} pilot, ${S.both} in both), ${S.years.length} years, none in the collection on ${S.cNone.join(", ")}`);
module.exports = { S };
