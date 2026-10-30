/* ==========================================================
   Builds /sources/: every paper, report, dataset, organisation and
   other link the site cites, gathered from data.js and from the links
   written into the pages, with where on the site each one is used.

       node tools/build-sources.js      (build-static.js runs it too)

   Generated: add sources in data.js, not on the page.
   ========================================================== */
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, ".."), SITE = "https://beattheheat.asia";
const src = fs.readFileSync(path.join(ROOT, "data.js"), "utf8");
const names = [...src.matchAll(/^const ([A-Z][A-Z0-9_]*)\s*=/gm)].map(m => m[1]);
const ctx = {}; vm.createContext(ctx);
vm.runInContext(src + `\n;Object.assign(this, { ${names.join(", ")} });`, ctx);

// where on the site each part of data.js appears
const WHERE = [
  [/^(SYSTEMS|CONSEQUENCES|LINKS)$/, "The web"], [/^(LOOP|STORIES)/, "Vicious cycles"], [/^(LEVERS|PLAYBOOKS|PACKAGES|EVIDENCE$)/, "Actions"],
  [/^INSTITUTIONS$/, "Who can act"], [/^ORG/, "The heat network"], [/^(GLOSS|NBS_BOOK)/, "Glossary"],
  [/^(PLAN_|WORKED_|WHO_ELEMENTS|MCR2030)/, "Plan a response"], [/^AT_RISK/, "Who heat hits hardest"], [/^STALLS$/, "Why action stalls"],
  [/^(COOL_|HOME_HEATS)/, "Cooling options"], [/^LIVE_/, "Heat right now"], [/^HEATWAVE_DAY$/, "A day in a heatwave"], [/^HEATWAVES/, "Heatwaves that shaped Asia"],
  [/^CITY_/, "Your city"], [/^(ACTION_|EVIDENCE_STATUS)/, "Find practical actions"], [/^FINANCE$/, "Paying for protection"],
  [/^STRAIN$/, "Weather, work and the person"], [/^HEAT_WEEK$/, "A week in the heat"], [/^PLACE_SIM$/, "Make it work together"],
  [/^SECTION_FILMS$/, "Films"], [/^GUIDE$/, "How to use this site"]
];
const whereOf = k => (WHERE.find(([re]) => re.test(k)) || [, k.toLowerCase().replace(/_/g, " ")])[1];
const KIND = k => /^ORG/.test(k) ? "org" : /^LIVE_/.test(k) ? "data" : "ref";

const items = new Map();   // normalised url -> { url, label, kinds:Set, where:Set }
const norm = u => u.replace(/^http:/, "https:").replace(/#.*$/, "").replace(/\/$/, "");
const domainOf = u => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return ""; } };
const SKIP = /creativecommons\.org|github\.com\/arunbh2|beattheheat\.asia|commonshade\.|forms\.(office|cloud\.microsoft)|goatcounter|fonts\.(googleapis|gstatic)/;
function add(url, label, kind, where) {
  if (typeof url !== "string" || !/^https?:\/\//.test(url) || SKIP.test(url)) return;
  const k = norm(url); let it = items.get(k);
  if (!it) items.set(k, it = { url, label: "", kinds: new Set(), where: new Set() });
  label = String(label || "").replace(/\s+/g, " ").trim();
  if (label && (!it.label || (it.label.length < 12 && label.length > it.label.length))) it.label = label;
  it.kinds.add(kind); if (where) it.where.add(where);
}
// walk data.js: any object with a url is a citation; its label, name, title or source names it
function walk(v, top, seen = new Set()) {
  if (!v || typeof v !== "object" || seen.has(v)) return; seen.add(v);
  if (Array.isArray(v)) { v.forEach(x => walk(x, top, seen)); return; }
  if (typeof v.url === "string") add(v.url, v.label || v.title || v.name || v.source || v.org, KIND(top), whereOf(top));
  for (const [key, x] of Object.entries(v)) {
    if (typeof x === "string" && /^https?:\/\//.test(x) && key !== "url") add(x, "", KIND(top), whereOf(top));
    else walk(x, top, seen);
  }
}
names.forEach(n => { const v = ctx[n]; if (typeof v === "string") add(v, n === "NBS_BOOK" ? "Nature-Based Solutions for Cities (Edward Elgar, 2023)" : "", KIND(n), whereOf(n)); else walk(v, n); });

// links written straight into the interactive pages and scripts
const PAGES_HTML = { "index.html": "Home page", "news/index.html": "Heat in the news", "join/index.html": "Help build Common Shade", "plan/index.html": "Plan a response",
  "together/index.html": "Make it work together", "a-week-in-the-heat/index.html": "A week in the heat", "guide/index.html": "How to use this site",
  "solutions/index.html": "Solutions library", "countries/bangladesh/index.html": "Bangladesh snapshot", "countries/nepal/index.html": "Nepal snapshot",
  "countries/sri-lanka/index.html": "Sri Lanka snapshot", "countries/thailand/index.html": "Thailand snapshot", "countries/indonesia/index.html": "Indonesia snapshot",
  "countries/india/index.html": "India snapshot", "countries/philippines/index.html": "Philippines snapshot",
  "heat-economy/index.html": "The heat economy", "heat-economy/businesses/index.html": "The heat economy: businesses", "heat-economy/money/index.html": "The heat economy: money and support",
  "heat-economy/opportunities/index.html": "The heat economy: what could come up", "heat-economy/conditions/index.html": "The heat economy: what makes markets work" };
for (const [f, where] of Object.entries(PAGES_HTML)) {
  const t = fs.readFileSync(path.join(ROOT, f), "utf8");
  for (const m of t.matchAll(/<a [^>]*href="(https?:\/\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) add(m[1], m[2].replace(/<[^>]+>/g, "").replace(/\(opens in a new tab\)|↗/g, ""), "ref", where);
}
const DATA_TOOLS = [
  ["https://open-meteo.com/", "Open-Meteo: weather forecast API (live readings)", "Heat right now"],
  ["https://data.gov.sg/", "data.gov.sg: Singapore's measured wet-bulb globe temperature", "Heat right now"],
  ["https://europepmc.org/RestfulWebService", "Europe PMC REST API: new research with an Asian setting", "Heat in the news"],
  ["https://www.gdeltproject.org/", "The GDELT Project: global news monitoring", "Heat in the news"]
];
DATA_TOOLS.forEach(([u, l, w]) => add(u, l, "data", w));

const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const all = [...items.values()].map(it => ({ ...it, label: it.label || domainOf(it.url), domain: domainOf(it.url),
  kind: it.kinds.has("ref") ? "ref" : it.kinds.has("data") ? "data" : "org" }));
const sortKey = s => s.toLowerCase().replace(/^(the|a|an)\s+/, "").replace(/[^a-z0-9]/g, "");
all.sort((a, b) => sortKey(a.label).localeCompare(sortKey(b.label)));
const GROUPS = [
  { id: "research", kind: "ref", h: "Research, reports and guidance", p: "Papers, reports, guidance, news and datasets cited as evidence anywhere on the site." },
  { id: "organisations", kind: "org", h: "Organisations in the heat network", p: "Organisations working on extreme heat, as listed in The heat network. Listing one does not imply its partnership, affiliation or endorsement." },
  { id: "data", kind: "data", h: "Live data and tools behind the site", p: "Services the site reads from as you use it." }
];
const counts = Object.fromEntries(GROUPS.map(g => [g.kind, all.filter(x => x.kind === g.kind).length]));
const li = x => `<li data-q="${esc((x.label + " " + x.domain + " " + [...x.where].join(" ")).toLowerCase())}"><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.label)}<span class="visually-hidden"> (opens in a new tab)</span></a> <span class="refs__dom">${esc(x.domain)}</span>${x.where.size ? `<span class="refs__where">Cited in: ${[...x.where].sort().map(esc).join(" · ")}</span>` : ""}</li>`;
const ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%2316202B'/%3E%3Cpath d='M5 14 Q16 4 27 14' fill='none' stroke='%23F26430' stroke-width='4.5' stroke-linecap='round'/%3E%3Cpath d='M9 13 V27 M23 13 V27' stroke='%23F6E7D7' stroke-width='2.6' stroke-linecap='round'/%3E%3C/svg%3E";
const V = (fs.readFileSync(path.join(ROOT, "index.html"), "utf8").match(/styles\.css\?v=(\d+)/) || [, "1"])[1];
const total = all.length;
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sources and references | Common Shade</title>
  <meta name="description" content="Every paper, report, dataset and organisation cited on Common Shade, in one list you can search: ${total} sources, each with where it is used on the site.">
  <meta name="theme-color" content="#16202B">
  <link rel="canonical" href="${SITE}/sources/">
  <link rel="license" href="https://creativecommons.org/licenses/by/4.0/">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Common Shade">
  <meta property="og:url" content="${SITE}/sources/">
  <meta property="og:title" content="Sources and references">
  <meta property="og:description" content="Every source cited on Common Shade, in one searchable list.">
  <meta property="og:image" content="${SITE}/images/social-share-cs.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${ICON}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap">
  <link rel="stylesheet" href="/styles.css?v=${V}">
  <script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "WebPage", name: "Sources and references", url: `${SITE}/sources/`, isPartOf: { "@type": "WebSite", name: "Common Shade", url: SITE + "/" }, license: "https://creativecommons.org/licenses/by/4.0/" })}</script>
</head>
<body data-page="sources">
  <a class="skip-link" href="#refs-search">Skip to the search</a>
  <header class="wkp-top">
    <div class="container wkp-top__in">
      <a class="wkp-home" href="/"><span class="wordmark__mark" aria-hidden="true"></span>COMMON SHADE<span class="visually-hidden">: back to the map</span></a>
      <nav aria-label="Elsewhere on the site"><a href="/#explore">The map</a><a href="/practical/">Practical actions</a><a href="/solutions/">Solutions</a><a href="/plan/">Plan a response</a><a href="/news/">Heat in the news</a><a href="/join/">Help build Common Shade</a></nav>
    </div>
  </header>
  <main class="refs">
    <div class="container has-spot">
      <svg class="spot spot--method" viewBox="0 0 260 160" aria-hidden="true" focusable="false"><g fill="none" stroke="#16202B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M10 150 H250" opacity=".4"/><circle cx="40" cy="60" r="7"/><circle cx="96" cy="40" r="7"/><circle cx="90" cy="100" r="7"/><circle cx="150" cy="70" r="7"/><path d="M46 57 L89 43 M45 66 L84 96 M97 47 L92 93 M103 43 L143 66 M96 98 L144 74" opacity=".6"/><circle cx="160" cy="80" r="26" stroke="#F26430"/><path d="M178 99 L200 122" stroke="#F26430" stroke-width="5"/><circle cx="226" cy="88" r="8"/><path d="M226 96 V122 M226 122 L218 150 M226 122 L234 150 M226 102.0 L208 94.0"/></g></svg>
      <p class="eyebrow">Sources and references</p>
      <h1 class="h2 refs__h">Everything we cite, <br>in one place.</h1>
      <p class="refs__intro">Every claim on Common Shade links to its source. Here are all ${total} of them: ${counts.ref} papers, reports, guidance and datasets; ${counts.org} organisations; and ${counts.data} live services. Each shows where on the site it is used. Search by title, publisher or topic.</p>
      <div class="refs__bar">
        <label for="refs-search">Search the sources</label>
        <input id="refs-search" type="search" autocomplete="off" placeholder="For example: WHO, wet-bulb, India, insurance">
        <p class="refs__count" id="refs-count" role="status" aria-live="polite">${total} sources</p>
      </div>
      <nav class="refs__jump" aria-label="Jump to a group">${GROUPS.map(g => `<a href="#${g.id}">${esc(g.h)} <span>(${counts[g.kind]})</span></a>`).join("")}</nav>
${GROUPS.map(g => `      <section class="refs__group" id="${g.id}" aria-labelledby="${g.id}-h">
        <h2 id="${g.id}-h">${esc(g.h)} <span class="refs__n">${counts[g.kind]}</span></h2>
        <p class="refs__note">${esc(g.p)}</p>
        <ul class="refs__list">
${all.filter(x => x.kind === g.kind).map(x => "          " + li(x)).join("\n")}
        </ul>
      </section>`).join("\n")}
      <p class="refs__none" id="refs-none" hidden>No source matches that search.</p>
    </div>
  </main>
  <aside class="foot-close" aria-label="Common Shade">
    <div class="container">
      <svg class="foot-close__art" viewBox="0 0 132 72" aria-hidden="true" focusable="false"><path d="M8 22 Q66 0 124 22 L124 28 Q66 8 8 28 Z" fill="#F26430"/><g fill="none" stroke="#16202B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M14 27 V70 M118 27 V70 M66 13 V70"/><circle cx="28" cy="40" r="5"/><path d="M28 45 V58 L22 70 M28 58 L34 70 M28 49 L14 42"/><circle cx="104" cy="40" r="5"/><path d="M104 45 V58 L98 70 M104 58 L110 70 M104 49 L118 42"/><circle cx="80" cy="46" r="4"/><path d="M80 50 V60 L76 70 M80 60 L84 70 M80 53 L66 48"/><path d="M4 70 H128" opacity=".35"/></g></svg>
      <p class="foot-close__line">Shade is something we hold up together.</p>
      <a class="foot-close__go" href="/join/">Help build Common Shade&nbsp;<span aria-hidden="true">→</span></a>
    </div>
  </aside>
  <footer class="wkp-foot">
    <div class="container">
      <p>Links go to the original publishers, which hold their own rights. Found a broken link or a better source? Tell us through <a href="/join/">Help build Common Shade</a>. <a href="/">Back to the map of extreme heat</a></p>
    </div>
  </footer>
  <script>
  (function () {
    var q = document.getElementById("refs-search"), items = [].slice.call(document.querySelectorAll(".refs__list li")),
        groups = [].slice.call(document.querySelectorAll(".refs__group")), count = document.getElementById("refs-count"), none = document.getElementById("refs-none");
    q.addEventListener("input", function () {
      var words = q.value.toLowerCase().split(/\\s+/).filter(Boolean), shown = 0;
      items.forEach(function (li) { var ok = words.every(function (w) { return li.dataset.q.indexOf(w) >= 0; }); li.hidden = !ok; if (ok) shown++; });
      groups.forEach(function (g) { g.hidden = !g.querySelector("li:not([hidden])"); });
      count.textContent = words.length ? shown + " of ${total} sources" : "${total} sources"; none.hidden = shown > 0;
    });
  })();
  </script>
</body>
</html>
`;
fs.mkdirSync(path.join(ROOT, "sources"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "sources", "index.html"), html);
console.log(`sources: ${total} (${counts.ref} references, ${counts.org} organisations, ${counts.data} data)`);
