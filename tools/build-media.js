/* ==========================================================
   Builds /how-heat-is-reported/: what a curated bibliography of 71 news
   articles on extreme heat in South and Southeast Asia (2018–2026) shows,
   what it leaves less visible, and the whole list.

       node tools/build-media.js      (build-static.js runs it too)

   Data: research/2026-10/media/extreme-heat-journalism-2018-2026.csv
   Every count below is computed from that file; it describes the
   collection, not all reporting on heat.
   ========================================================== */
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), SITE = "https://beattheheat.asia", SLUG = "how-heat-is-reported";
const CSV = path.join(ROOT, "research", "2026-10", "media", "extreme-heat-journalism-2018-2026.csv");
// the October 2026 pilot review: 32 articles checked one by one, in ten languages (bylines left out)
const PILOT = path.join(ROOT, "research", "2026-10", "media", "pilot");
const PJ = f => JSON.parse(fs.readFileSync(path.join(PILOT, f), "utf8"));

// a small CSV reader: quoted fields, commas and doubled quotes inside them
function parseCSV(t) {
  const rows = []; let row = [], f = "", q = false;
  t = t.replace(/^﻿/, "");
  for (let i = 0; i < t.length; i++) { const c = t[i];
    if (q) { if (c === '"' && t[i + 1] === '"') { f += '"'; i++; } else if (c === '"') q = false; else f += c; }
    else if (c === '"') q = true; else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && t[i + 1] === "\n") i++; row.push(f); rows.push(row); row = []; f = ""; }
    else f += c; }
  if (f || row.length) { row.push(f); rows.push(row); }
  const [h, ...b] = rows; return b.filter(r => r.length > 1).map(r => Object.fromEntries(h.map((k, i) => [k.trim(), (r[i] || "").trim()])));
}
const ARTS = parseCSV(fs.readFileSync(CSV, "utf8")).filter(a => /^https?:\/\//.test(a["Full URL"]))
  .map(a => ({ year: +a.Year, pub: a.Publication, title: a["Article title / headline"], geo: a.Geography, angle: a["Story angle"], url: a["Full URL"], type: a["Link type"] }))
  .sort((a, b) => b.year - a.year || a.pub.localeCompare(b.pub));
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const ext = (u, t) => `<a href="${esc(u)}" target="_blank" rel="noopener">${t}<span class="visually-hidden"> (opens in a new tab)</span></a>`;
const go = (href, t) => `<a href="${href}">${esc(t)}&nbsp;<span aria-hidden="true">→</span></a>`;

// ---- counts, from the file ----
const N = ARTS.length;
const byYear = {}; ARTS.forEach(a => byYear[a.year] = (byYear[a.year] || 0) + 1);
const yrs = Object.keys(byYear).map(Number).sort();
const geo = k => ARTS.filter(a => a.geo.toLowerCase().includes(k.toLowerCase())).length;
const since24 = ARTS.filter(a => a.year >= 2024).length;
const NONE = ["Nepal", "Viet", "Indonesia", "Sri Lanka", "Pakistan"].filter(k => !geo(k)).map(k => k === "Viet" ? "Viet Nam" : k);
const pct = n => Math.round(n / N * 100);

const STATS = [
  [String(N), "articles in the collection", `From ${yrs[0]} to October ${yrs[yrs.length - 1]}, in ${new Set(ARTS.map(a => a.pub)).size} outlets across the region and beyond.`],
  [`${byYear[2024]} of ${N}`, "were published in 2024", `${pct(byYear[2024])}% of the collection, the year of severe heatwaves across the region and India’s general election.`],
  [String(geo("India")), "mention India", `Nearly half. Singapore appears in ${geo("Singapore")}, Bangladesh in ${geo("Bangladesh")}, the Philippines and Thailand in ${geo("Philippines")} each.`],
  ["0", `on ${NONE.slice(0, -1).join(", ")} or ${NONE[NONE.length - 1]}`, "A gap in this collection, not in all reporting. The pilot review below begins to fill it, in national languages."],
];

// ---- what the coverage does well, and what stays less visible ----
const PATTERNS = [
  ["Heat as an emergency", "Record temperatures, deaths, school closures, disrupted daily life.", "Long, repeated exposure between the heatwaves that make headlines.", "reactive"],
  ["Heat as inequality", "Outdoor workers, delivery riders and poorer households carry more of the burden.", "Who pays for protection and for the earnings lost.", "poverty"],
  ["Heat as lost work", "Less working capacity, factory disruption, strain on power and water.", "What it means for investment, competitiveness and supply chains.", "squeeze"],
  ["Cooling as the answer", "Air conditioning, reflective roofs, new materials, local fixes.", "How options compare on cost, upkeep and side effects.", "cooling"],
  ["Responsibility in pieces", "Workers, cities, employers and health systems appear in separate stories.", "How they could share the work and the cost.", "protection"],
  ["Coverage follows visibility", "India and Singapore are covered in depth.", "Detailed reporting from other South and Southeast Asian countries.", "invisible"],
];
const LOOPN = (() => { const vm = require("vm"), c = {}; vm.createContext(c);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "data.js"), "utf8") + ";this.L=LOOPS;", c);
  return Object.fromEntries(c.L.map(l => [l.id, l.name])); })();

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

// ---- the pilot review: a wider look, across languages ----
const LANG = { en: "English", ne: "Nepali", vi: "Vietnamese", si: "Sinhala", id: "Indonesian", ur: "Urdu", bn: "Bengali", tl: "Filipino", ms: "Malay", th: "Thai" };
const CTRY = c => c === "Lao People's Democratic Republic" ? "Lao PDR" : c;
const P_ARTS = PJ("articles.json").sort((a, b) => b.date.localeCompare(a.date));
const P_BY = Object.fromEntries(P_ARTS.map(a => [a.id, a]));
const PN = P_ARTS.length;
const P_NONEN = P_ARTS.filter(a => a.language !== "en").length;
const P_LANGS = new Set(P_ARTS.map(a => a.language)).size;
const P_CTRY = new Set(P_ARTS.filter(a => a.country_focus.length === 1).map(a => a.country_focus[0])).size;
const P_HOW = P_ARTS.filter(a => a.missing_middle >= 2).length;
const P_VOICE = P_ARTS.filter(a => a.voice_of_affected === "yes").length;
const P_STATS = [
  [String(PN), "articles, each opened and read", `Checked one by one in October 2026, from ${P_CTRY} countries, published ${P_ARTS[PN - 1].date.slice(0, 4)} to ${P_ARTS[0].date.slice(0, 4)}.`],
  [`${P_NONEN} of ${PN}`, "not in English", `${P_LANGS} languages in all, from Nepali and Sinhala to Filipino, Thai and Vietnamese.`],
  [`${P_HOW} of ${PN}`, "explain how protection is organised", "They name who acts, describe how help is delivered or paid for, or follow up on what happened."],
  [String(P_VOICE), "let affected people speak", "Workers, vendors, parents or residents describe heat in their own words, not only through officials or experts."],
];
// what national-language reporting adds: four plain-language examples, each linked to the original
const P_LOCAL = [
  ["pk-karachi-roles-2024", "Who does what in a city", "A city meeting in Karachi gives water points, hospital wards, power supply and ambulance lists each a named agency, with a control room to coordinate."],
  ["lk-school-directive-2024", "How guidance reaches a school", "Heat guidance travels from the education ministry, with health advice, through provincial and zonal directors to school principals."],
  ["ph-labour-day-2024", "Pay during a heat absence", "Time off in extreme heat stays unpaid unless a collective agreement between workers and their company changes that."],
  ["th-outdoor-rights-2025", "Who heat rules cover", "Whether an outdoor or platform worker is protected depends on their employment status, and the article sets out the rules that apply."],
];
// reporting that connects the dots: the six pieces that follow protection furthest, with neutral headings
const P_DOTS = [
  ["kh-measured-factory-2026", "Workers measuring the heat"],
  ["kh-factory-enforcement-2026", "From fainting incidents to inspection"],
  ["mm-power-workers-2024", "Power supply and factory heat"],
  ["in-insurance-followup-2025", "Going back to an insurance pilot"],
  ["in-insurance-design-2026", "How a heat-insurance trigger is set"],
  ["in-deaths-commentary-2023", "Why heat deaths are hard to count"],
];
const P_EX = Object.fromEntries(PJ("exemplars.json").map(e => [e.article_id, e]));
const pmeta = a => [a.outlet, a.date.slice(0, 4), a.country_focus.map(CTRY).join(", "), LANG[a.language] || a.language].join(" · ");
const ptitle = a => `<span dir="auto">${esc(a.title)}</span>` + (a.language !== "en" && a.title_en ? ` <span class="md-en">(${esc(a.title_en)})</span>` : "");
const plink = (a, t) => ext(a.url, t || ptitle(a));

const ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%2316202B'/%3E%3Cpath d='M5 14 Q16 4 27 14' fill='none' stroke='%23F26430' stroke-width='4.5' stroke-linecap='round'/%3E%3Cpath d='M9 13 V27 M23 13 V27' stroke='%23F6E7D7' stroke-width='2.6' stroke-linecap='round'/%3E%3C/svg%3E";
const V = (fs.readFileSync(path.join(ROOT, "index.html"), "utf8").match(/styles\.css\?v=(\d+)/) || [, "1"])[1];
const TITLE = "How extreme heat is reported in South and Southeast Asia";
const DESC = `What ${N + PN} news articles on extreme heat in South and Southeast Asia (2018–2026), in ${P_LANGS} languages, show: strong on the damage, and at their best, clear on how protection is organised, paid for and kept going. With the full bibliography.`;
const max = Math.max(...Object.values(byYear));

const body = `
    <section class="sol-page he lc md">
      <div class="container">
        <p class="eyebrow">Heat in the news · a reading of the coverage</p>
        <h1 class="h2 tool-h1">The damage is well reported. The strongest reporting also follows how protection is organised, paid for and kept going.</h1>
        <p class="tool-lede">Extreme heat is now reported as a human and economic crisis. A collection of ${N} articles from South and Southeast Asia shows three well-covered areas: the human toll, lost work and income, and cooling. The connection between them is reported less often: why known, measurable heat risks have not yet become steady protection for workers, reliable funding, and clear responsibility.</p>
        <p class="sol-caveat he-about"><b>About this reading.</b> This is an editorial question, not a claim that nobody has reported it; several journalists have covered heat’s human and economic effects in depth. The collection was curated in October 2026, and the searches captured more of 2024’s prominent reporting, so the counts describe the collection, not all coverage. Patterns come from headlines, descriptions and selected full texts, not a formal content analysis. Headlines are the outlets’ own; listing an article is not an endorsement of its framing.</p>
        <nav class="sol-jump lc-jump" aria-label="On this page"><b>Jump to:</b> <a href="#collection">The collection</a> · <a href="#patterns">Six patterns</a> · <a href="#middle">The missing middle</a> · <a href="#languages">Across languages</a> · <a href="#dots">Reporting that connects the dots</a> · <a href="#systems">Three deeper patterns</a> · <a href="#questions">Questions worth investigating</a> · <a href="#layers">How to use this site</a> · <a href="#bibliography">All ${N + PN} articles</a></nav>

        <section class="cty-s" id="collection" aria-labelledby="collection-h">
          <h2 id="collection-h">What the collection shows</h2>
          <div class="he-stats">
            ${STATS.map(([n, l, t]) => `<div class="he-stat"><span class="he-stat__n">${esc(n)}</span><span class="he-stat__l">${esc(l)}</span><span class="he-stat__t">${esc(t)}</span></div>`).join("\n            ")}
          </div>
          <figure class="md-years">
            <figcaption>Articles in the collection, by year of publication</figcaption>
            <ol>${yrs.map(y => `<li title="${y}: ${byYear[y]} article${byYear[y] > 1 ? "s" : ""}"><span class="md-y">${y}${y === yrs[yrs.length - 1] ? "*" : ""}</span><span class="md-bar"><i style="width:${(byYear[y] / max * 100).toFixed(1)}%"></i></span><span class="md-n">${byYear[y]}</span></li>`).join("")}</ol>
            <p class="md-note">*To October. A count of the articles collected, not of all news coverage. The 2024 peak reflects that year’s severe heatwaves, and that our searches captured more of its prominent reporting.</p>
          </figure>
        </section>

        <section class="cty-s" id="patterns" aria-labelledby="patterns-h">
          <h2 id="patterns-h">Six recurring patterns</h2>
          <div class="he-tablewrap" role="region" tabindex="0" aria-label="Six patterns in the coverage">
            <table class="he-table md-table">
              <caption class="visually-hidden">What the articles show, what stays less visible, and the cycle on the map it relates to</caption>
              <thead><tr><th scope="col">Pattern</th><th scope="col">What the articles show</th><th scope="col">What stays less visible</th><th scope="col">On the map</th></tr></thead>
              <tbody>${PATTERNS.map(([p, s, l, loop]) => `<tr><th scope="row">${esc(p)}</th><td>${esc(s)}</td><td>${esc(l)}</td><td class="he-breaks"><a href="/loops/#${loop}">${esc(LOOPN[loop])}</a></td></tr>`).join("")}</tbody>
            </table>
          </div>
        </section>

        <section class="cty-s" id="middle" aria-labelledby="middle-h">
          <h2 id="middle-h">The missing middle</h2>
          <p class="he-intro">Two valuable lenses run through the collection. Economic commentary links heat to growth, construction, food prices, power and decarbonisation. Close-up reporting follows delivery riders, port engineers, safety rules and earnings. Between the two sits a question asked less often.</p>
          <div class="md-mid" role="list">
            <div class="md-mid__b" role="listitem"><p class="lc-k">The big picture</p><p>Productivity, growth, competitiveness.</p></div>
            <div class="md-mid__b md-mid__b--gap" role="listitem"><p class="lc-k">The under-examined middle</p><p><b>Who pays? Who coordinates? What incentives change? Who is accountable?</b></p></div>
            <div class="md-mid__b" role="listitem"><p class="lc-k">The close-up</p><p>Worker safety, wages, households, practical cooling.</p></div>
          </div>
          <p class="he-intro">This is not an unreported subject. It is a chance to connect existing reporting into a clearer account of how an economic problem becomes an organised, funded response.</p>
        </section>

        <section class="cty-s" id="languages" aria-labelledby="languages-h">
          <h2 id="languages-h">A wider look, across languages</h2>
          <p class="he-intro">To test the first reading, a pilot review looked for reporting on work and protection in the countries and languages the collection missed. It found more of the missing middle than expected. The sharper question is not whether protection is reported, but whether coverage follows it all the way: from a named responsibility, through money and delivery, to results.</p>
          <div class="he-stats">
            ${P_STATS.map(([n, l, t]) => `<div class="he-stat"><span class="he-stat__n">${esc(n)}</span><span class="he-stat__l">${esc(l)}</span><span class="he-stat__t">${esc(t)}</span></div>`).join("\n            ")}
          </div>
          <h3 class="md-h3">What national-language reporting adds</h3>
          <p class="he-intro">Practical, institutional detail that readers can use. These examples are worth learning from; they do not show that one language reports heat better than another.</p>
          <ul class="md-local">
            ${P_LOCAL.map(([id, h, t]) => { const a = P_BY[id]; return `<li><b>${esc(h)}</b><p>${esc(t)}</p><p class="md-src">${plink(a)}<span>${esc(pmeta(a))}</span></p></li>`; }).join("\n            ")}
          </ul>
          <p class="sol-caveat he-about"><b>About the pilot.</b> ${PN} articles were chosen by searching for work and protection, so they show what good reporting can look like, not how common it is. They were coded once, with AI assistance and without a second coder, and translations from national languages still need review. The pilot does not yet compare coverage before, during and after heatwaves, or set coverage against measured heat. Every article below links to the original.</p>
        </section>

        <section class="cty-s" id="dots" aria-labelledby="dots-h">
          <h2 id="dots-h">Reporting that connects the dots</h2>
          <p class="he-intro">Six pieces that follow protection furthest: who pays, who decides and who checks. They are offered as examples to learn from, not as a ranking, and a report is not the same as a finding.</p>
          <div class="lc-readers">
            ${P_DOTS.map(([id, h]) => { const a = P_BY[id], e = P_EX[id]; return `<article class="lc-reader md-dot"><h3>${esc(h)}</h3><p>${esc(e.what_it_does_well)}</p><dl class="md-who"><dt>Who pays</dt><dd>${esc(e.who_pays)}</dd><dt>Who decides</dt><dd>${esc(e.who_decides)}</dd><dt>Who checks</dt><dd>${esc(e.who_checks)}</dd></dl><p class="md-src">${plink(a)}<span>${esc(pmeta(a))}</span></p><p class="lc-k lc-k--act">On the map</p><p class="he-breaks">${e.loop_ids.filter(l => LOOPN[l]).map(l => `<a href="/loops/#${l}">${esc(LOOPN[l])}</a>`).join(" · ")}</p></article>`; }).join("\n            ")}
          </div>
        </section>

        <section class="cty-s" id="systems" aria-labelledby="systems-h">
          <h2 id="systems-h">Three deeper patterns</h2>
          <div class="lc-readers">
            ${SYSTEMS.map(s => `<article class="lc-reader"><h3>${esc(s.h)}</h3><p>${s.p}</p><p class="lc-k lc-k--act">On the map</p><p class="he-breaks"><a href="/loops/#${s.loop}">${esc(LOOPN[s.loop])}</a>, and the solutions that can break it</p></article>`).join("\n            ")}
          </div>
        </section>

        <section class="cty-s" id="questions" aria-labelledby="questions-h">
          <h2 id="questions-h">Questions worth investigating</h2>
          <p class="he-intro">For reporters, researchers and anyone who funds or plans protection. A strong evidence base is now emerging beyond India and Singapore: ${ext("https://www.iied.org/22755iied", "IIED’s August 2026 study of informal workers in Dhaka")} is one place to start.</p>
          <ol class="lc-targets">${QUESTIONS.map(([w, t]) => `<li><span class="lc-when">${esc(w)}</span>${esc(t)}</li>`).join("")}</ol>
        </section>

        <section class="cty-s" id="layers" aria-labelledby="layers-h">
          <h2 id="layers-h">Five questions, and where this site answers them</h2>
          <p class="he-intro">Every link between a harm and a response on Common Shade is a question someone can check: each claim carries its source and how strong the evidence is. A reporter following delivery riders, for example, can trace heat to pay per delivery, platform rules, rest spaces, city responsibilities and household budgets.</p>
          <ol class="md-layers">${LAYERS.map(([q, d, h, t], i) => `<li><span class="md-layers__n">${i + 1}</span><span><b>${esc(q)}</b> ${esc(d)}</span>${go(h, t)}</li>`).join("")}</ol>
        </section>

        <section class="cty-s" id="bibliography" aria-labelledby="bibliography-h">
          <h2 id="bibliography-h">All ${N + PN} articles</h2>
          <p class="he-intro">The curated collection of ${N}, then the ${PN} from the ${go("#pilot-list", "pilot review")}. Newest first. Several are syndicated columns or wire stories; each links to the original. ${`<a href="/how-heat-is-reported/extreme-heat-journalism-2018-2026.csv" download>Download the list (CSV)</a>`}. Every article is also in ${go("/sources/#media", "Sources and references")}</p>
          <div class="refs__bar lc-bar"><label for="md-q" class="visually-hidden">Search the articles</label><input id="md-q" type="search" autocomplete="off" placeholder="Search ${N} articles: workers, Philippines, Guardian, cooling"><p class="refs__count" id="md-count" role="status" aria-live="polite">${N} articles</p></div>
          <ul class="refs__list" id="md-list">
            ${ARTS.map(a => `<li data-q="${esc([a.title, a.pub, a.geo, a.angle, a.year].join(" ").toLowerCase())}"><a class="refs__t" href="${esc(a.url)}" target="_blank" rel="noopener">${esc(a.title)}<span class="visually-hidden"> (opens in a new tab)</span></a><span class="refs__m">${esc([a.pub, a.year].join(" · "))}</span><span class="refs__where">${esc(a.geo)} · ${esc(a.angle)}</span></li>`).join("\n            ")}
          </ul>
          <h3 class="md-h3" id="pilot-list">The ${PN} articles in the pilot review, in ${P_LANGS} languages</h3>
          <p class="he-intro">Newest first. Headlines in national languages are followed by an English translation.</p>
          <ul class="refs__list md-plist">
            ${P_ARTS.map(a => `<li><a class="refs__t" href="${esc(a.url)}" target="_blank" rel="noopener">${ptitle(a)}<span class="visually-hidden"> (opens in a new tab)</span></a><span class="refs__m">${esc(pmeta(a))}</span><span class="refs__where">${esc(a.summary_plain)}</span></li>`).join("\n            ")}
          </ul>
        </section>
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
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap">
  <link rel="stylesheet" href="/styles.css?v=${V}">
</head>
<body data-page="media">
  <a class="skip-link" href="#main">Skip to the content</a>
  <main id="main" tabindex="-1">${body}</main>
  <footer class="wkp-foot"><div class="container">
    <p>A reading of a curated bibliography, October 2026. Articles and headlines belong to their publishers and authors. Know a strong article we missed, especially in a national language? <a href="/join/">Tell us</a>. Text: <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0<span class="visually-hidden"> (opens in a new tab)</span></a>. <a href="/sources/">All sources</a></p>
  </div></footer>
  <script>
  (function(){var q=document.getElementById("md-q"),items=[].slice.call(document.querySelectorAll("#md-list li")),c=document.getElementById("md-count");
  q.addEventListener("input",function(){var w=q.value.toLowerCase().split(/\\s+/).filter(Boolean),n=0;items.forEach(function(li){var ok=w.every(function(x){return li.dataset.q.indexOf(x)>-1;});li.hidden=!ok;if(ok)n++;});c.textContent=w.length?n+" of ${N} articles":"${N} articles";});})();
  </script>
</body>
</html>
`;
fs.mkdirSync(path.join(ROOT, SLUG), { recursive: true });
fs.writeFileSync(path.join(ROOT, SLUG, "index.html"), html);
fs.copyFileSync(CSV, path.join(ROOT, SLUG, "extreme-heat-journalism-2018-2026.csv"));
fs.writeFileSync(path.join(ROOT, "research", "2026-10", "media", "articles.json"), JSON.stringify(ARTS, null, 1) + "\n");
console.log(`how heat is reported: ${N} + ${PN} pilot articles, ${yrs.length} years, none on ${NONE.join(", ")}`);
