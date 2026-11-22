/* ==========================================================
   Builds the crawlable, plain-HTML pages and AI-readable files
   from data.js, which is generated from data/core. Run after editing data/core:

       node tools/build-static.js

   The interactive site renders its content with JavaScript, which
   most AI crawlers and some search engines do not run. These pages
   carry the same content as plain HTML, so it can be found, read
   and cited. They are generated: edit data/core, not the pages or data.js.
   ========================================================== */
const fs = require("fs"), path = require("path"), vm = require("vm");
// data.js is generated from the knowledge base in data/ (tools/build-data.js); rebuild it first
require("child_process").execFileSync(process.execPath, [path.join(__dirname, "build-data.js")], { stdio: "inherit" });
const ROOT = path.join(__dirname, ".."), SITE = "https://beattheheat.asia";
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, "data.js"), "utf8") + `
;Object.assign(this, { SYSTEMS, CONSEQUENCES, LINKS, LOOP_GROUPS, LOOPS, INSTITUTIONS, LEVERS, LOOP_PLACES, EVIDENCE, ORG_ROLES,
  ORGANISATIONS, GLOSSARY_GROUPS, GLOSSARY, WORKED_EXAMPLES, AT_RISK, AT_RISK_BARRIERS, STALLS, COOL_PLACES, COOL_TRAPS,
  COOL_EVIDENCE, COOL_VALUE, COOL_READING, COOL_COST_NOTE, COOL_FX, COOL_REGION, HOME_HEATS, STRAIN, COOL_ASK, PLAN_GROUPS, PLAN_MECHANISMS, PLAN_MECH_NOTE, MCR2030, LIVE_FINGERPRINT, LOOP_STAKES, STAKES_LABEL, LIVE_CITIES, CITY_HAP, LIVE_WBGT, LIVE_LEVELS, LIVE_SOURCES, HEATWAVES, HEATWAVES_NOTE, ACTION_SETTINGS, ACTION_LINES, ACTION_JOURNEYS, FINANCE, EVIDENCE_STATUS, ACTION_HORIZONS, HEAT_WEEK, MARKET_EXPLORER, LOOP_SOLUTIONS, ORG_SIDES, ORG_SIDE });`, ctx);
Object.assign(ctx, require("./data-blocks.js")());   // plus build-only blocks (not in data.js)
const D = ctx, TODAY = new Date().toISOString().slice(0, 10);
// ---- the homepage's numbers: each [data-stat] holds a plain-HTML fallback (what readers see with no JavaScript, and what
// crawlers read). It is written here from the data, so no count on the homepage is typed by hand. script.js renderStats()
// sets the same values in the browser; a key added there needs adding here too.
{
  const live = vm.runInContext("typeof LIVE_CITIES !== 'undefined' ? LIVE_CITIES.length : 0", ctx);
  // cross-system links, counted as script.js counts them: unique links between two parts of the map in different systems, not loop links
  const sysOf = Object.fromEntries([...D.SYSTEMS.map(x => [x.id, x.id]), ...D.CONSEQUENCES.map(c => [c.id, c.sys])]);
  const seen = new Set([...D.SYSTEMS.map(x => "heat>" + x.id), ...D.CONSEQUENCES.map(c => c.sys + ">" + c.id)]);
  let cross = 0;
  D.LINKS.forEach(([from, to, , flag]) => { const id = from + ">" + to;
    if (!(from in sysOf) || !(to in sysOf) || seen.has(id)) return; seen.add(id);
    if (flag !== "loop" && sysOf[from] !== sysOf[to]) cross++; });
  const STAT = { cross, systems: D.SYSTEMS.length, consequences: D.CONSEQUENCES.length, loops: D.LOOPS.length, levers: D.LEVERS.length, institutions: D.INSTITUTIONS.length, cities: live, orgs: D.ORGANISATIONS.length };
  const file = path.join(ROOT, "index.html"), html = fs.readFileSync(file, "utf8"), unknown = new Set();
  const out = html.replace(/(data-stat="([a-z]+)"[^>]*>)([^<]*)(<)/g, (m, open, key, old, close) => key in STAT ? open + STAT[key] + close : (unknown.add(key), m));
  if (unknown.size) throw new Error(`index.html: data-stat "${[...unknown].join('", "')}" has no value in tools/build-static.js (STAT). Add it there and in script.js renderStats().`);
  if (out !== html) fs.writeFileSync(file, out);
}
// ---- shared conditions: blocks on the hand-written homepage and plan page, filled between <!--sh:KEY--> markers from
// tools/shared-heat-text.js, so the homepage, /plan/ and llms-full.txt never differ ----
{
  const SH = require("./shared-heat-text.js"), e = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const BLOCKS = {
    "index.html": { home: `<div class="cs-note sh-home" id="connected"><span class="cs-note__label">${e(SH.INTRO.h)}</span><p>${e(SH.INTRO.scene)}</p><p>${e(SH.INTRO.phrase)}</p><p>${e(SH.INTRO.resilience)} <a href="${SH.INTRO.go[0]}">${e(SH.INTRO.go[1])}&nbsp;<span aria-hidden="true">→</span></a></p></div>` },
    "plan/index.html": { plan: `<section class="container sh-plan" id="shared-plan" aria-labelledby="shared-plan-h"><h2 class="h3" id="shared-plan-h">${e(SH.PLAN.h)}</h2><p>${e(SH.PLAN.intro)}</p><ol>${SH.PLAN.questions.map(q => `<li><b>${e(q.t)}.</b> ${e(q.d)}</li>`).join("")}</ol><p><a href="${SH.PLAN.go[0]}">${e(SH.PLAN.go[1])}&nbsp;<span aria-hidden="true">→</span></a></p></section>` }
  };
  Object.entries(BLOCKS).forEach(([f, keys]) => {
    const file = path.join(ROOT, f), html = fs.readFileSync(file, "utf8");
    let out = html;
    Object.entries(keys).forEach(([k, block]) => {
      const re = new RegExp(`<!--sh:${k}-->[\\s\\S]*?<!--/sh:${k}-->`);
      if (!re.test(out)) throw new Error(`${f}: no <!--sh:${k}--> ... <!--/sh:${k}--> markers for the shared-conditions block`);
      out = out.replace(re, `<!--sh:${k}-->${block}<!--/sh:${k}-->`);
    });
    if (out !== html) fs.writeFileSync(file, out);
  });
}
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const SH = require("./shared-heat-text.js");
const plain = s => String(s || "").replace(/\n/g, " ");
const byId = Object.fromEntries([...D.SYSTEMS, ...D.CONSEQUENCES, { id: "heat", label: "Extreme heat" }].map(x => [x.id, x]));
const inst = Object.fromEntries(D.INSTITUTIONS.map(i => [i.id, i]));
const lever = Object.fromEntries(D.LEVERS.map(v => [v.id, v]));
const WHEN = { season: "Works this season", years: "1–3 years", decade: "A decade or more" };
const loopEdges = l => l.path.map((id, i) => id + ">" + l.path[(i + 1) % l.path.length]);
const leverLoops = v => D.LOOPS.filter(l => loopEdges(l).includes(v.edge.join(">")));
const loopLevers = l => D.LEVERS.filter(v => loopEdges(l).includes(v.edge.join(">")));
const name = id => plain((byId[id] || {}).label || id);
const ext = (url, label) => `<a href="${esc(url)}" rel="noopener">${esc(label)}</a>`;
const srcs = list => (list || []).length ? `<p class="src">Sources: ${list.map(s => ext(s.url, s.label || s.title)).join(" · ")}</p>` : "";

const PAGES = [
  { slug: "the-web", title: "The web of extreme heat: every consequence, system by system", short: "The web" },
  { slug: "loops", title: "Vicious cycles of extreme heat, and where they can be broken", short: "Vicious cycles" },
  { slug: "actions", title: "Actions that break the vicious cycles of extreme heat", short: "Actions" },
  { slug: "who-is-at-risk", title: "Who extreme heat hits hardest", short: "Who is at risk" },
  { slug: "cooling-options", title: "Cooling options by place, and what keeps them working", short: "Cooling options" },
  { slug: "worked-plans", title: "Worked heat action plans from Asia", short: "Worked plans" },
  { slug: "glossary", title: "Plain-language glossary of extreme heat", short: "Glossary" },
  { slug: "heat-network", title: "Organisations working on extreme heat", short: "Heat network" },
  { slug: "cities", title: `Extreme heat in ${D.CITY_PROFILES.length} Asian cities`, short: "Cities" },
  { slug: "heatwaves", title: "Heatwaves that shaped South and Southeast Asia, 1998 to 2026", short: "Heatwaves" },
  { slug: "practical-actions", title: "Practical actions against extreme heat, by setting", short: "Practical actions" },
  { slug: "paying-for-protection", title: "Paying for heat protection: who pays, how money arrives, and whether it lasts", short: "Paying for protection" }
];
// where each text page's "interactive version" button goes: the matching part of the site, never just the top of the homepage
const INTERACTIVE = { "the-web": "/#explore", loops: "/#loops", actions: "/#package-all", "who-is-at-risk": "/#at-risk", "cooling-options": "/#cooling", "worked-plans": "/#plan",
  glossary: "/#glossary", "heat-network": "/#network", cities: "/#city", heatwaves: "/atlas/", "practical-actions": "/practical/", "paying-for-protection": "/finance/" };
const INTERACTIVE_LABEL = { "the-web": "Open the interactive map", loops: "Open the cycles on the interactive map", actions: "See the actions on the interactive map", "who-is-at-risk": "Open the interactive version",
  "cooling-options": "Open the interactive cooling options", "worked-plans": "Open the interactive planner", glossary: "Open the glossary with its films", "heat-network": "Open the interactive network",
  cities: "Open the interactive city view", heatwaves: "Open the Atlas of Asia’s heat", "practical-actions": "Open the interactive practical actions", "paying-for-protection": "Open the interactive version" };
const LICENCE = "Text, data, films and illustrations © Common Shade contributors, shared under Creative Commons Attribution 4.0 (CC BY 4.0, https://creativecommons.org/licenses/by/4.0/): you may copy, adapt and translate them, with credit and a link to beattheheat.asia. Code is under the MIT licence. Linked sources, quotations, and organisations’ names and logos remain their owners’ and are not covered.";
const DISCLAIMER = "Common Shade is in beta, currently at beattheheat.asia. A group of organisations is helping shape it as a shared endeavour for protection from extreme heat. It is an independent, work-in-progress project, not an official publication of any one organisation. Listing an organisation does not imply its partnership, affiliation or endorsement. Every claim links to its source; where the evidence is still emerging, the map says so.";

function page(p, intro, body, extraLd) {
  const url = `${SITE}/${p.slug}/`;
  const ld = [{ "@context": "https://schema.org", "@type": "WebPage", name: p.title, url, inLanguage: "en", isPartOf: { "@type": "WebSite", name: "Common Shade", url: SITE + "/" }, dateModified: TODAY, description: intro, license: "https://creativecommons.org/licenses/by/4.0/", copyrightNotice: "© Common Shade contributors" },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Common Shade", item: SITE + "/" }, ...(p.parent ? [{ "@type": "ListItem", position: 2, name: p.parent.short, item: `${SITE}/${p.parent.slug}/` }] : []),
      { "@type": "ListItem", position: p.parent ? 3 : 2, name: p.short, item: url }] }]
    .concat(extraLd || []);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(p.title)} | Common Shade</title>
  <meta name="description" content="${esc(intro)}">
  <link rel="canonical" href="${url}">
  <link rel="license" href="https://creativecommons.org/licenses/by/4.0/">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Common Shade">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${esc(p.title)}">
  <meta property="og:description" content="${esc(intro)}">
  <meta property="og:image" content="${SITE}/images/social-share-cs.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%2316202B'/%3E%3Cpath d='M5 14 Q16 4 27 14' fill='none' stroke='%23F26430' stroke-width='4.5' stroke-linecap='round'/%3E%3Cpath d='M9 13 V27 M23 13 V27' stroke='%23F6E7D7' stroke-width='2.6' stroke-linecap='round'/%3E%3C/svg%3E">
  <link rel="alternate" type="text/plain" href="${SITE}/llms-full.txt" title="The whole map as plain text">
  <style>
    body{margin:0;font-family:"Hanken Grotesk","Segoe UI",Roboto,Arial,sans-serif;color:#16202B;background:#FAF7F2;line-height:1.55}
    a{color:#16202B;text-decoration-color:#F26430;text-decoration-thickness:2px;text-underline-offset:3px}
    header,main,footer{max-width:900px;margin:0 auto;padding:0 20px}
    header{padding-top:22px;display:flex;flex-wrap:wrap;gap:8px 18px;align-items:center;font-size:.9rem}
    header .home{font-weight:800;letter-spacing:.04em;text-decoration:none}
    nav a{margin-right:12px}
    h1{font-family:Anton,Impact,"Arial Narrow",sans-serif;font-weight:400;text-transform:uppercase;font-size:clamp(2rem,1.5rem + 3vw,3.2rem);line-height:1.02;margin:28px 0 10px}
    h2{font-size:1.375rem;margin:34px 0 6px;border-top:2px solid #16202B;padding-top:14px}
    h3{font-size:1.125rem;margin:22px 0 4px}
    h3>a{display:inline-block;min-height:24px}
    .lede{font-size:1.1rem;color:#39424D}
    .src,.meta{font-size:.85rem;color:#5E6570}
    .cta{display:inline-block;margin:14px 0;padding:10px 18px;border-radius:999px;background:#F26430;color:#16202B;font-weight:800;text-decoration:none}
    .en-promo{max-width:46rem;margin:22px 0;padding:20px;background:#fff;border:1px solid #E6DFD4;border-radius:12px}
    .en-promo .cs-note__label{display:block;font-size:.75rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#39424D}
    .en-promo__h{font-size:1.375rem;font-weight:700;line-height:1.15;margin:4px 0 6px}.en-promo p{margin:0 0 12px}.en-promo p:last-child{margin:0}
    .en-promo .btn{display:inline-flex;align-items:center;gap:8px;min-height:48px;padding:10px 24px;border-radius:999px;background:#F26430;color:#16202B;font-weight:800;text-decoration:none}
    footer{margin-top:48px;padding-bottom:40px;font-size:.85rem;color:#5E6570;border-top:1px solid #E6DFD4}
    ul{padding-left:20px} li{margin:4px 0}
  </style>
${ld.map(x => `  <script type="application/ld+json">${JSON.stringify(x)}</script>`).join("\n")}
</head>
<body>
  <header><a class="home" href="/">COMMON SHADE</a>
    <nav aria-label="Map as text">${PAGES.map(q => `<a href="/${q.slug}/"${q.slug === p.slug ? ' aria-current="page"' : ""}>${esc(q.short)}</a>`).join("")}</nav></header>
  <main>
    <h1>${esc(p.title)}</h1>
    <p class="lede">${esc(intro)}</p>
    <a class="cta" href="${INTERACTIVE[p.slug] || "/#explore"}">${esc(INTERACTIVE_LABEL[p.slug] || "Open the interactive map")}</a>
${body}
  </main>
  <footer><p>${esc(DISCLAIMER)}</p><p>Text, data, films and illustrations © Common Shade contributors, shared under <a rel="license" href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>: copy, adapt and translate them, with credit and a link to beattheheat.asia. Code is under the MIT licence. Linked sources, quotations, and organisations’ names and logos remain their owners’.</p><p>Generated from the map’s data on ${TODAY}. The whole map as plain text: <a href="/llms-full.txt">llms-full.txt</a>.</p></footer>
</body>
</html>
`;
}

// ---- page bodies, and the same content as markdown for llms-full.txt ----
const md = [];
const out = {};

// the web
{
  const p = PAGES[0], intro = `How extreme heat ripples through ${D.SYSTEMS.length} systems: ${D.CONSEQUENCES.length} consequences and the links between them, each with its evidence.`;
  const F = D.LIVE_FINGERPRINT;
  let h = `<h2 id="heat">Extreme heat: where every cycle starts</h2><p>${esc(F.mapText)}</p><p class="meta">${esc(F.season)}</p>
    <ul>${F.facts.map(f => `<li><strong>${esc(f.n)}</strong> ${esc(f.text)}</li>`).join("")}</ul>
    <p class="src">${esc(F.defn)} Source: ${ext(F.source.url, F.source.label)}. Today’s scores: ${ext(F.map.url, F.map.label)}.</p>`;
  let m = [`## ${p.title}`, intro, "### Extreme heat: where every cycle starts", F.mapText, `${F.season}:`, ...F.facts.map(f => `- ${f.n} ${f.text}`), `${F.defn} Source: ${F.source.label}, ${F.source.url}`];
  D.SYSTEMS.forEach(s => {
    h += `<h2 id="${s.id}">${esc(plain(s.label))}</h2><p>${esc(s.desc)}</p>`; m.push(`### ${plain(s.label)}`, s.desc);
    D.CONSEQUENCES.filter(c => c.sys === s.id).forEach(c => {
      const outs = D.LINKS.filter(l => l[0] === c.id).map(l => `${name(l[1])} (${l[2]})`);
      h += `<h3 id="${c.id}">${esc(plain(c.label))}</h3><p>${esc(c.desc)}</p>${outs.length ? `<p class="meta">Leads to: ${esc(outs.join("; "))}</p>` : ""}${srcs(c.sources)}<p class="meta"><a href="/#${c.id}">See it on the map</a></p>`;
      m.push(`#### ${plain(c.label)}`, c.desc, outs.length ? `Leads to: ${outs.join("; ")}` : "", ...(c.sources || []).map(x => `Source: ${x.label} ${x.url}`));
    });
  });
  out[p.slug] = page(p, intro, h); md.push(m.filter(Boolean).join("\n\n"));
}
// a drawn, faceless composite person for each cycle (data/site/people.json), and the one-minute check for places
const PEOPLE = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "site", "people.json"), "utf8"));
const FIGURE = `<svg viewBox="0 0 56 56" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 14 Q28 2 50 14" stroke="#F26430" stroke-width="3.4"/><circle cx="28" cy="22" r="5.5"/><path d="M28 27.5 V40 M28 40 L22 52 M28 40 L34 52 M28 31 L20 37 M28 31 L36 37"/></g></svg>`;
// cycles that risk-finance instruments name (tools/riskfin-data.js), so each links to Paying when heat strikes
const RFLOOPS = (() => { try { const c = {}; require("./riskfin-data.js").instruments.forEach(i => i.loops.forEach(l => { c[l] = (c[l] || 0) + 1; })); return c; } catch (e) { return {}; } })();
const rfLine = id => RFLOOPS[id] >= 2 ? `<p><strong>Money arranged before heat:</strong> ${RFLOOPS[id]} kinds of insurance, pooled funds, credit and forecast-based finance name this cycle. <a href="/paying-when-heat-strikes/">Paying when heat strikes</a> asks of each whether it paid, and when.</p>` : "";
const personOf = id => { const x = PEOPLE.people.find(q => q.loop === id); return x ? `<figure class="cs-person">${FIGURE}<figcaption><b>${esc(x.who)}</b><p>${esc(x.story)}</p><small>${esc(PEOPLE.note)}</small></figcaption></figure>` : ""; };
const FORM_URL = "https://forms.cloud.microsoft/e/SNfMp0esFh";
const PIN = `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 18s6-5.6 6-10a6 6 0 1 0-12 0c0 4.4 6 10 6 10z" fill="none" stroke="#F26430" stroke-width="2"/><circle cx="10" cy="8" r="2.2" fill="#F26430"/></svg>`;
const KB_DIR = path.join(ROOT, "data", "kb");
const KBR = fs.existsSync(KB_DIR) ? fs.readdirSync(KB_DIR).filter(f => f.endsWith(".json") && !f.startsWith("_")).flatMap(f => JSON.parse(fs.readFileSync(path.join(KB_DIR, f), "utf8"))).filter(r => r.status === "current" && r.type !== "source") : [];
const monthLabel = m => new Date(String(m).slice(0, 7) + "-01T00:00:00Z").toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
const recentFor = places => { const rs = KBR.filter(r => (r.places || []).some(p => places.includes(p))); return rs.length ? `<h2>Recently updated here</h2><ul>${rs.map(r => `<li>${esc(r.title)} <span class="meta">(added in the ${esc(monthLabel(r.added || r.as_of))} update)</span></li>`).join("")}</ul><p class="meta">Every change is checked before it appears. <a href="/whats-new/">What changed this month</a> · <a href="/corrections/">Corrections</a></p>` : ""; };
const checkFor = (key, label) => `<aside class="cs-check" data-check="${key}" data-label="${esc(label)}" data-form="${FORM_URL}"><p class="cs-check__q">Does this page feel right for ${esc(label)}?</p><p>If something is missing or not quite right, <a href="/corrections/">please tell us</a>. People who know a place help keep it accurate.</p></aside>`;

// loops
{
  const p = PAGES[1], intro = `${D.LOOPS.length} vicious cycles in which extreme heat feeds itself, traps people or overwhelms institutions, with where each one plays out in Asia, the evidence, and the actions that could break it.`;
  let h = "", m = [`## ${p.title}`, intro];
  D.LOOP_GROUPS.forEach(g => {
    h += `<h2>${esc(g.name)}</h2>`; m.push(`### ${g.name}`);
    D.LOOPS.filter(l => l.group === g.id).forEach(l => {
      const lv = loopLevers(l), ev = (D.EVIDENCE[l.id] || []);
      h += `<h3 id="${l.id}">${esc(l.name)}</h3><p>${esc(l.summary)}</p>${personOf(l.id)}
        <p class="meta">The cycle: ${esc(l.path.map(name).join(" → "))} → back to the start. Evidence: ${l.evidence === "established" ? "well established" : "emerging (each link is evidenced; the full cycle less so)"}.</p>
        ${(x => x ? `<p><strong>${esc(D.STAKES_LABEL[x.kind])} (${esc(x.where)}):</strong> ${esc(x.n)}. ${esc(x.text)} ${ext(x.url, x.by)}</p>${x.sea ? `<p><strong>In Southeast Asia (${esc(x.sea.where)}):</strong> ${esc(x.sea.n)}. ${esc(x.sea.text)} ${ext(x.sea.url, x.sea.by)}</p>` : ""}` : `<p class="meta">${esc(D.STAKES_LABEL.none)}.</p>`)(D.LOOP_STAKES[l.id])}
        ${D.LOOP_PLACES[l.id] ? `<p><strong>Where it plays out:</strong> ${esc(D.LOOP_PLACES[l.id])}</p>` : ""}
        ${lv.length ? `<p><strong>Where it breaks:</strong> ${lv.map(v => `<a href="/actions/#${v.id}">${esc(v.title)}</a>`).join(", ")}</p>` : ""}${rfLine(l.id)}
        ${(x => x ? `<p><strong>Solutions to try:</strong> ${x.note ? `${esc(x.note)} ` : ""}${x.items.map(i => `<a href="/solutions/#${i.id}">${esc(i.name)}</a> (${esc(i.why.replace(/\.$/, "").replace(/^./, c => c.toLowerCase()))})`).join("; ")}. A suggested match, not a measured effect on the cycle. <a href="/heat-economy/opportunities/#loop-${l.id}">Business ideas for this cycle</a>.</p>` : "")(D.LOOP_SOLUTIONS[l.id])}
        ${ev.length ? `<ul>${ev.map(e => `<li>${esc(e.finding)} ${ext(e.url, e.by)}${e.type ? `<br><span class="meta">${esc(e.type)} · ${esc(e.where)} · ${esc(e.scale)}. Limit: ${esc(e.limit)}</span>${e.reading ? `<br><span class="meta"><strong>Our reading:</strong> ${esc(e.reading)}</span>` : ""}` : ""}</li>`).join("")}</ul>` : ""}
        ${(x => x ? `<h4 id="${l.id}-shared">${esc(SH.LOOPS.label)}</h4><ul>${Object.keys(SH.LOOPS.heads).map(k => `<li><strong>${esc(SH.LOOPS.heads[k])}:</strong> ${esc(x[k])}</li>`).join("")}</ul><p class="meta">${esc(SH.LOOPS.note)} <a href="/${SH.SLUG}/">${esc(SH.INTRO.go[1])}</a>.</p>` : "")(SH.LOOPS.items[l.id])}
        <p class="meta"><a href="/#loop-${l.id}">Follow it on the map</a>${l.video ? ` · <a href="/${l.video}">Watch the film (${esc(l.length)})</a>` : ""}</p>`;
      m.push(`#### ${l.name}`, l.summary, `The cycle: ${l.path.map(name).join(" → ")} → back to the start.`,
        D.LOOP_STAKES[l.id] ? `${D.STAKES_LABEL[D.LOOP_STAKES[l.id].kind]} (${D.LOOP_STAKES[l.id].where}): ${D.LOOP_STAKES[l.id].n}. ${D.LOOP_STAKES[l.id].text} (${D.LOOP_STAKES[l.id].by}, ${D.LOOP_STAKES[l.id].url})` : `${D.STAKES_LABEL.none}.`,
        D.LOOP_STAKES[l.id] && D.LOOP_STAKES[l.id].sea ? `In Southeast Asia (${D.LOOP_STAKES[l.id].sea.where}): ${D.LOOP_STAKES[l.id].sea.n}. ${D.LOOP_STAKES[l.id].sea.text} (${D.LOOP_STAKES[l.id].sea.by}, ${D.LOOP_STAKES[l.id].sea.url})` : "", D.LOOP_PLACES[l.id] ? `Where it plays out: ${D.LOOP_PLACES[l.id]}` : "",
        lv.length ? `Where it breaks: ${lv.map(v => v.title).join(", ")}` : "", SH.LOOPS.items[l.id] ? `${SH.LOOPS.label} (${SH.LOOPS.note}) ${Object.keys(SH.LOOPS.heads).map(k => `${SH.LOOPS.heads[k]}: ${SH.LOOPS.items[l.id][k]}`).join(" ")}` : "", D.LOOP_SOLUTIONS[l.id] ? `Solutions to try (a suggested match, not a measured effect): ${D.LOOP_SOLUTIONS[l.id].items.map(i => `${i.name} (https://beattheheat.asia/solutions/#${i.id})`).join("; ")}` : "", ...ev.map(e => `- ${e.finding} (${e.by}, ${e.url})${e.type ? ` Type: ${e.type}. Where: ${e.where}. Scale: ${e.scale}. Limit: ${e.limit}${e.reading ? ` Our reading: ${e.reading}` : ""}` : ""}`));
    });
  });
  out[p.slug] = page(p, intro, h, [{ "@context": "https://schema.org", "@type": "ItemList", name: "Vicious cycles of extreme heat", numberOfItems: D.LOOPS.length,
    itemListElement: D.LOOPS.map((l, i) => ({ "@type": "ListItem", position: i + 1, name: l.name, description: l.summary, url: `${SITE}/loops/#${l.id}` })) }]);
  md.push(m.filter(Boolean).join("\n\n"));
}
// stick scenes: hand-drawn illustrative drawings beside a lever (scenes/, made with the stick-scene skill, MIT). The runtime and its
// licence are copied unchanged from the skill; the drawing loads only when a reader presses play, and the figure stays hidden without JavaScript.
const SCENE_AT = { heatrules: { id: "cooling-vest", caption: "Illustrative drawing of the watch-out above: an outdoor cleaner sweeping in the heat puts on a cooling vest from its stand, then hangs it back up." } };
{
  const SK = path.join(ROOT, ".agents", "skills", "stick-scene");
  for (const [from, to] of [["runtime/stick.js", "stick.js"], ["LICENSE", "LICENSE-stick-scene.txt"]]) {
    const a = path.join(SK, from), b = path.join(ROOT, "scenes", to);
    if (fs.existsSync(a) && (!fs.existsSync(b) || fs.readFileSync(a, "utf8") !== fs.readFileSync(b, "utf8"))) fs.copyFileSync(a, b);
  }
}
const SCENE_V = (fs.readFileSync(path.join(ROOT, "index.html"), "utf8").match(/\?v=(\d+)/) || [])[1] || "1";
const sceneFig = (sc) => `<figure class="sc-fig" data-scene="${sc.id}" data-v="${SCENE_V}" data-label="${esc(sc.caption)}" hidden><div class="sc-stage" hidden></div><figcaption>${esc(sc.caption)}</figcaption></figure>`;
const SCENE_JS = `<style>.sc-fig{margin:12px 0 20px;max-width:560px}.sc-stage stick-scene{display:block;width:100%;aspect-ratio:380/230;height:auto}.sc-btn{min-height:44px;padding:10px 18px;border:2px solid #16202B;border-radius:999px;background:#fff;color:#16202B;font:inherit;font-weight:600;cursor:pointer}.sc-btn:focus-visible{outline:3px solid #F26430;outline-offset:2px}.sc-fig figcaption{margin-top:6px;font-size:.9rem;line-height:1.5;color:#39424D}.sc-fig [role=status]{font-size:.9rem;color:#39424D}</style>
<script>(function(){"use strict";var rm=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches,run=null;
function load(u){return new Promise(function(ok,no){var s=document.createElement("script");s.src=u;s.onload=ok;s.onerror=no;document.head.appendChild(s);});}
Array.prototype.forEach.call(document.querySelectorAll("figure[data-scene]"),function(box){var v=box.getAttribute("data-v"),id=box.getAttribute("data-scene"),stage=box.querySelector(".sc-stage"),el=null,b=document.createElement("button");
b.type="button";b.className="sc-btn";b.textContent=rm?"Show the drawing":"Play the drawing";box.insertBefore(b,stage);box.hidden=false;
b.addEventListener("click",function(){if(el){el.click();return;}if(b.disabled)return;var label=b.textContent;b.disabled=true;b.textContent="Loading the drawing";
run=run||load("/scenes/stick.js?v="+v);run.then(function(){return load("/scenes/"+id+".js?v="+v);}).then(function(){el=document.createElement("stick-scene");el.setAttribute("scene",id);el.setAttribute("play","click");el.setAttribute("no-font","");el.setAttribute("no-floor","");el.setAttribute("aria-label",box.getAttribute("data-label"));stage.appendChild(el);stage.hidden=false;b.disabled=false;
if(rm){b.hidden=true;}else{b.textContent="Play again";b.focus();requestAnimationFrame(function(){el.click();});}})
.catch(function(){run=null;b.disabled=false;b.textContent=label;if(!box.querySelector("[role=status]")){var m=document.createElement("p");m.setAttribute("role","status");m.textContent="The drawing could not load. The watch-out above says what it shows.";box.appendChild(m);}});});});})();</script>`;
// actions
{
  const p = PAGES[2], intro = `${D.LEVERS.length} actions that cut a link in one or more vicious cycles of extreme heat: who can take each one, how soon it works, examples from Asia and practical guides.`;
  let h = "", m = [`## ${p.title}`, intro];
  D.LEVERS.forEach(v => {
    const ls = leverLoops(v), who = (v.who || []).map(i => (inst[i] || {}).name).filter(Boolean);
    h += `<h2 id="${v.id}">${esc(v.title)}</h2><p>${esc(v.text)}</p>
      <p class="meta">Cuts the link: ${esc(name(v.edge[0]))} → ${esc(name(v.edge[1]))}. ${WHEN[v.when] ? "How soon it works: " + esc(WHEN[v.when]) + "." : ""} Who can act: ${esc(who.join(", "))}.${v.measure ? " How to track it: " + esc(v.measure) + "." : ""}</p>
      ${ls.length ? `<p><strong>Could help interrupt:</strong> ${ls.map(l => `<a href="/loops/#${l.id}">${esc(l.name)}</a>`).join(", ")}</p>` : ""}
      ${v.example ? `<p><strong>In practice:</strong> ${esc(v.example)}</p>${srcs(v.exampleSources)}` : ""}
      ${(v.watch || []).map(w => `<p><strong>Watch for:</strong> ${esc(w.text)}</p>${srcs(w.sources)}`).join("")}
      ${SCENE_AT[v.id] ? sceneFig(SCENE_AT[v.id]) : ""}
      ${(v.guides || []).length ? `<h3>Practical guides</h3><ul>${v.guides.map(g => `<li>${ext(g.url, g.title)} <span class="meta">${esc(g.by)}</span></li>`).join("")}</ul>` : ""}
      <p class="meta"><a href="/#break-${v.id}">See it on the map</a>${D.ORGANISATIONS.some(o => (o.levers || []).includes(v.id)) ? ` · <a href="/heat-network/?action=${v.id}">Who works on this</a>` : ""}</p>${require("./signals-context.js").leverLine(esc, v.id)}`;
    m.push(`### ${v.title}`, v.text, `Cuts the link: ${name(v.edge[0])} → ${name(v.edge[1])}. Who can act: ${who.join(", ")}.`, ls.length ? `Could help interrupt: ${ls.map(l => l.name).join(", ")}` : "",
      v.example ? `In practice: ${v.example}` : "", ...(v.watch || []).map(w => `Watch for: ${w.text} (${w.sources.map(x => `${x.label}, ${x.url}`).join("; ")})`), SCENE_AT[v.id] ? `On the page: ${SCENE_AT[v.id].caption}` : "", ...(v.guides || []).map(g => `- Guide: ${g.title} (${g.by}) ${g.url}`));
  });
  if (D.LEVERS.some(v => SCENE_AT[v.id])) h += SCENE_JS;
  out[p.slug] = page(p, intro, h, [{ "@context": "https://schema.org", "@type": "ItemList", name: "Actions against extreme heat", numberOfItems: D.LEVERS.length,
    itemListElement: D.LEVERS.map((v, i) => ({ "@type": "ListItem", position: i + 1, name: v.title, description: v.text, url: `${SITE}/actions/#${v.id}` })) }]);
  md.push(m.filter(Boolean).join("\n\n"));
}
// who is at risk
{
  const p = PAGES[3], intro = "The same heatwave lands differently. Who is harmed depends on how exposed people are and what stands between them and safety.";
  let h = `<h2 id="shared">${esc(SH.UNEQUAL.h)}</h2><p>${esc(SH.UNEQUAL.text)} <a href="/${SH.SLUG}/">${esc(SH.INTRO.go[1])}</a>.</p><h2>Five questions behind every barrier</h2><ul>${D.AT_RISK_BARRIERS.map(b => `<li><strong>${esc(b.q)}</strong> ${esc(b.a)}</li>`).join("")}</ul><p>These barriers rarely come alone. <a href="/intersections/">Intersections</a> is a short note and a game about where they meet, and who protection reaches.</p><p>For farm and processing work, <a href="/cotton-and-heat/">Heat from field to factory</a> follows cotton from field to gin, and asks who can actually stop work when it is too hot.</p><p>For workers indoors, <a href="/factory-heat/">Heat inside factories</a> follows heat by task, place and time through a garment factory, with a section on women's work, pregnancy and the arrangements around them.</p>`, m = [`## ${p.title}`, intro, `### ${SH.UNEQUAL.h}`, SH.UNEQUAL.text, ...D.AT_RISK_BARRIERS.map(b => `- ${b.q} ${b.a}`)];
  // the short films and simulation that go with each group (the same pairs as the map's version, in script.js)
  const RISK_FILMS = { older: ["olderheat", "checkins", "sleepheat"], mothers: ["pregnancyheat", "babyheat"], settlements: ["homeheat", "shadegap"], women: ["kitchenheat"],
    disability: ["kidneyheat", "mindheat"], excluded: ["closedplaces"], workers: ["firstaid", "workrest"], farmers: ["drysoilloop", "nightcrops"], coastal: ["saltwater"], remote: ["clinicheat", "telecomheat"] };
  const RISK_SIM = { older: ["/a-night-in-the-heat/", "Live through a hot night"], mothers: ["/a-night-in-the-heat/", "Live through a hot night"], disability: ["/a-night-in-the-heat/", "Live through a hot night"],
    settlements: ["/a-city-under-strain/", "See a city under strain"], workers: ["/a-week-in-the-heat/", "Live through a worker’s week"] };
  D.AT_RISK.forEach(g => {
    const facts = [g.fact ? g : null, ...(g.more || [])].filter(Boolean);
    h += `<h2 id="${g.id}">${esc(g.name)}</h2><p><strong>Exposed to:</strong> ${esc(g.exposure)}</p><p><strong>Held back by:</strong> ${esc(g.barriers)}</p>
      ${facts.map(f => `<p>${esc(f.fact)} ${ext(f.source.url, f.source.label)}</p>`).join("")}
      <p><strong>What helps:</strong> ${g.levers.map(id => lever[id] ? `<a href="/actions/#${id}">${esc(lever[id].title)}</a>` : "").filter(Boolean).join(", ")}</p>
      ${(w => w.length ? `<p><strong>Watch:</strong> ${w.map(t => `<a href="/${t.video}">${esc(t.term)} (${esc(t.length)})</a>`).join(", ")}${RISK_SIM[g.id] ? `. Or <a href="${RISK_SIM[g.id][0]}">${esc(RISK_SIM[g.id][1].toLowerCase())}</a>` : ""}.</p>` : "")((RISK_FILMS[g.id] || []).map(id => D.GLOSSARY.find(t => t.id === id && t.video)).filter(Boolean))}`;
    m.push(`### ${g.name}`, `Exposed to: ${g.exposure}`, `Held back by: ${g.barriers}`, ...facts.map(f => `${f.fact} (${f.source.label}, ${f.source.url})`), `What helps: ${g.levers.map(id => (lever[id] || {}).title).filter(Boolean).join(", ")}`);
  });
  const S = D.STRAIN, src = f => `${ext(f.source.url, f.source.label)}${f.also ? ` ${ext(f.also.url, f.also.label)}` : ""}`;
  h += `<h2 id="strain">Weather, work and the person</h2><p>${esc(S.intro)}</p>
    ${S.parts.map(x => `<h3>${esc(x.name)}</h3><p>${esc(x.text)}</p><ul>${x.facts.map(f => `<li>${esc(f.text)} ${src(f)}</li>`).join("")}</ul>`).join("")}
    <p>${esc(S.close)}</p><h3>Three groups heat plans often miss</h3>
    ${S.groups.map(g => `<p><strong>${esc(g.name)}.</strong> ${esc(g.text)} ${esc(g.caution)} ${ext(g.source.url, g.source.label)}</p>`).join("")}
    <p><strong>For heat plans:</strong> ${esc(S.plans)} <a href="/print/weather-work-person/">Print the one-pager</a> · <a href="/media/films/weather-work-and-the-person.mp4">Watch the film (1:30)</a></p>`;
  m.push("### Weather, work and the person", S.intro, ...S.parts.flatMap(x => [`#### ${x.name}`, x.text, ...x.facts.map(f => `- ${f.text} (${f.source.label}, ${f.source.url}${f.also ? `; ${f.also.label}, ${f.also.url}` : ""})`)]),
    S.close, "#### Three groups heat plans often miss", ...S.groups.map(g => `- ${g.name}: ${g.text} ${g.caution} (${g.source.label}, ${g.source.url})`), `For heat plans: ${S.plans}`);
  out[p.slug] = page(p, intro, h); md.push(m.join("\n\n"));
}
// cooling options
{
  const p = PAGES[4], intro = "What to build or change where people are: homes, outdoor work, schools, markets, waiting areas, heat with waterlogging and greening where water is short. With what keeps each option working, rough costs and the traps to avoid.";
  const FXr = D.COOL_FX.inrPerUsd, usd = n => { const v = n / FXr, e = 10 ** (Math.floor(Math.log10(v)) - 1); return "US$" + (v >= 10 ? (Math.round(v / e) * e).toLocaleString("en-US") : String(Math.round(v * 10) / 10)); };
  const cost = c => !c || c.conf === "low" || !c.high ? "No range solid enough to share: get local quotes." : `about ${usd(c.low)}–${usd(c.high)} per ${c.unit} (₹${c.low.toLocaleString("en-IN")}–₹${c.high.toLocaleString("en-IN")} at Indian prices; planning estimate, ${c.conf === "medium" ? "medium" : "low to medium"} confidence)${c.src ? `; ${c.src.label}` : ""}`;
  let h = `<p class="meta">${esc(D.COOL_COST_NOTE)}</p>`, m = [`## ${p.title}`, intro, D.COOL_COST_NOTE];
  D.COOL_PLACES.forEach(pl => {
    h += `<h2 id="${pl.id}">${esc(pl.name)}</h2><p><strong>Protects:</strong> ${esc(pl.protects)}</p><p><strong>Key caution:</strong> ${esc(pl.caution)}</p>
      <ul>${pl.options.map(o => `<li><strong>${esc(o.name)}.</strong> ${esc(o.does)} Keeps working with: ${esc(o.keeps)} Avoid: ${esc(o.avoid)} <span class="meta">Rough cost: ${esc(cost(o.cost))}</span></li>`).join("")}</ul>
      ${(pl.facts || []).map(f => `<p>${esc(f.fact)} ${ext(f.source.url, f.source.label)}</p>`).join("")}
      ${pl.kitchen ? `<h3>${esc(pl.kitchen.title)}</h3><p>${esc(pl.kitchen.text)} ${ext(pl.kitchen.source.url, pl.kitchen.source.label)}</p><ul>${pl.kitchen.questions.map(q => `<li>${esc(q)}</li>`).join("")}</ul>` : ""}
      <p class="meta">How you will know: ${esc(pl.measure)}</p>`;
    if (pl.kitchen) m.push(`#### ${pl.kitchen.title}`, `${pl.kitchen.text} (${pl.kitchen.source.label}, ${pl.kitchen.source.url})`, ...pl.kitchen.questions.map(q => `- ${q}`));
    m.push(`### ${pl.name}`, `Protects: ${pl.protects}`, `Key caution: ${pl.caution}`, ...pl.options.map(o => `- ${o.name}: ${o.does} Keeps working with: ${o.keeps} Avoid: ${o.avoid} Rough cost: ${cost(o.cost)}`), ...(pl.facts || []).map(f => `${f.fact} (${f.source.label}, ${f.source.url})`));
  });
  const A = D.COOL_ASK;
  h += `<h2>Questions before you choose</h2><p>${A.frame.map(f => `<strong>${esc(f.name)}:</strong> ${esc(f.text)}`).join(" ")} ${ext(A.frameSource.url, A.frameSource.label)}</p>
    <ul>${A.questions.map(q => `<li>${esc(q)}</li>`).join("")}</ul><p><strong>Keep the outcomes apart.</strong> ${esc(A.outcomes)}</p>`;
  m.push("### Questions before you choose", ...A.frame.map(f => `- ${f.name}: ${f.text}`), `(${A.frameSource.label}, ${A.frameSource.url})`, ...A.questions.map(q => `- ${q}`), `Keep the outcomes apart. ${A.outcomes}`);
  h += `<h2>Five traps that waste cooling money</h2><ul>${D.COOL_TRAPS.map(t => `<li><strong>${esc(t.name)}.</strong> ${esc(t.what)} Instead: ${esc(t.fix)}</li>`).join("")}</ul>
    <h2>What changes the result</h2>${D.COOL_EVIDENCE.map(e => `<h3>${esc(e.name)}</h3><p>${esc(e.text)} ${ext(e.source.url, e.source.label)}</p>`).join("")}
    <h2 id="four-heats">Four heats in a home</h2><p>${esc(D.HOME_HEATS.intro)}</p>
    <ol>${D.HOME_HEATS.heats.map(h => `<li><strong>${esc(h.name)}.</strong> ${esc(h.text)}${h.source ? ` ${ext(h.source.url, h.source.label)}` : ""}</li>`).join("")}</ol>
    <p><strong>At night.</strong> ${esc(D.HOME_HEATS.night.text)} ${ext(D.HOME_HEATS.night.source.url, D.HOME_HEATS.night.source.label)}</p>
    <ul>${D.HOME_HEATS.facts.map(f => `<li><strong>${esc(f.n)}</strong> ${esc(f.text)} ${ext(f.source.url, f.source.label)}</li>`).join("")}</ul>
    <p>${esc(D.HOME_HEATS.nuance.text)} ${ext(D.HOME_HEATS.nuance.source.url, D.HOME_HEATS.nuance.source.label)}</p>
    <p><strong>For heat plans:</strong> ${esc(D.HOME_HEATS.plans)} <a href="/media/films/four-heats-in-a-home.mp4">Watch the film (1:25)</a></p>
    <h2>What cooling costs elsewhere in the region</h2><p>${esc(D.COOL_REGION.why.text)} ${ext(D.COOL_REGION.why.source.url, D.COOL_REGION.why.source.label)}</p>
    <ul>${D.COOL_REGION.prices.map(x => `<li><strong>${esc(x.place)}: ${esc(x.what)}.</strong> ${esc(x.figure)}. ${esc(x.result)} ${x.sources.map(z => ext(z.url, z.label)).join(" · ")}</li>`).join("")}</ul>
    <p>${esc(D.COOL_REGION.returns.text)} ${ext(D.COOL_REGION.returns.source.url, D.COOL_REGION.returns.source.label)}</p>
    <h2>Putting a value on cooling</h2><p>${esc(D.COOL_VALUE.text)}</p><p>${esc(D.COOL_VALUE.lesson)}</p>${srcs(D.COOL_VALUE.sources)}
    <h2>Free books and guides</h2><ul>${D.COOL_READING.map(r => `<li>${ext(r.url, r.title)} <span class="meta">${esc(r.by)}</span> ${esc(r.adds)}</li>`).join("")}</ul>`;
  m.push("### Five traps that waste cooling money", ...D.COOL_TRAPS.map(t => `- ${t.name}: ${t.what} Instead: ${t.fix}`), "### What changes the result", ...D.COOL_EVIDENCE.map(e => `- ${e.name}: ${e.text} (${e.source.url})`), "### Putting a value on cooling", D.COOL_VALUE.text, D.COOL_VALUE.lesson,
    "### Four heats in a home", D.HOME_HEATS.intro, ...D.HOME_HEATS.heats.map(h => `- ${h.name}: ${h.text}${h.source ? ` (${h.source.label}, ${h.source.url})` : ""}`),
    `At night: ${D.HOME_HEATS.night.text} (${D.HOME_HEATS.night.source.label}, ${D.HOME_HEATS.night.source.url})`, ...D.HOME_HEATS.facts.map(f => `- ${f.n} ${f.text} (${f.source.url})`),
    D.HOME_HEATS.nuance.text, `For heat plans: ${D.HOME_HEATS.plans}`);
  // what has been measured, and where (tools/city-districts/measured.js): single-site field measurements, never added up
  { const M = require("./city-districts/measured.js"), R = M.rows();
    h += `<h2 id="measured">${esc(M.WORDS.title)}</h2><p>${esc(M.WORDS.lede)}</p><div style="overflow-x:auto"><table style="border-collapse:collapse;font-size:.875rem;min-width:640px"><thead><tr>${M.WORDS.cols.map(c => `<th scope="col" style="text-align:left;padding:6px 8px 6px 0;border-top:1px solid #E6DFD4">${esc(c)}</th>`).join("")}</tr></thead><tbody>${R.map(r => `<tr>${[r.measure, r.place, r.when, r.measured].map(v => `<td style="vertical-align:top;padding:6px 8px 6px 0;border-top:1px solid #E6DFD4">${esc(v)}</td>`).join("")}<td style="vertical-align:top;padding:6px 8px 6px 0;border-top:1px solid #E6DFD4">${esc(r.found)} <span class="src">Source: ${ext(r.url, r.label)}</span></td></tr>`).join("")}</tbody></table></div>`;
    m.push(`### ${M.WORDS.title}`, M.WORDS.lede, ...R.map(r => `- ${r.measure}, ${r.place} (${r.when}). Measured: ${r.measured}. Found: ${r.found} Source: ${r.label}, ${r.url}`)); }
  out[p.slug] = page(p, intro, h); md.push(m.join("\n\n"));
}
// the India heat action plan archive (research/india-hap-archive/), for links from worked plans and Indian city pages
const HAPA = require("./hap-archive.js").load();
const hapFor = name => HAPA.docs.filter(d => d.district_or_city === name || (d.state === name && !d.district_or_city));
// an Indian city with no plan of its own on file points to its state's plans in the archive, where there are any
const hapState = c => {
  const st = c.state ? HAPA.docs.filter(d => d.state === c.state && d.level === "state") : [], all = `<a href="/resources/heat-action-plans/india/">India heat action plan archive</a>`;
  return `<h2>Heat action plans on file</h2><p>The ${all} has no verified document for ${esc(c.name)} itself yet.${st.length ? ` It holds ${st.length} state-level ${st.length === 1 ? "plan" : "plans"} for ${esc(c.state)}, which ${st.length === 1 ? "covers" : "cover"} the city: <a href="/resources/heat-action-plans/india/?state=${encodeURIComponent(c.state)}&amp;level=state">see the ${esc(c.state)} ${st.length === 1 ? "plan" : "plans"}</a>.` : " Plans for its state and national guidance are there."}</p>`;
};
// worked plans
{
  const p = PAGES[5], intro = "How places in Asia have turned heat risk into a plan: what happened, what they decided, what changed, and who leads each action.";
  let h = "", m = [`## ${p.title}`, intro];
  h += `<p>Looking for the documents themselves? The <a href="/resources/heat-action-plans/india/">India heat action plan archive</a> lists ${HAPA.docs.length} verified plans and guidance documents from across India, with a link to each PDF.</p>`;
  m.push(`The India heat action plan archive lists ${HAPA.docs.length} verified plans and guidance documents from across India, with a link to each PDF: ${"https://beattheheat.asia"}/resources/heat-action-plans/india/`);
  D.WORKED_EXAMPLES.forEach(x => {
    h += `<h2 id="${x.id}">${esc(x.title)}</h2><p class="meta">${esc(x.place)} · ${esc(x.year)}</p>
      <p><strong>What happened:</strong> ${esc(x.trigger)}</p><p><strong>What they decided:</strong> ${esc(x.decision)}</p><p><strong>What changed:</strong> ${esc(x.result)}</p>
      <ul>${x.actions.map(a => `<li><a href="/actions/#${a.lever}">${esc((lever[a.lever] || {}).title || a.lever)}</a>: led by ${esc((inst[a.lead] || {}).name || a.lead)}; paid by ${esc(a.payer)}; ${esc(a.measure)}</li>`).join("")}</ul>${srcs(x.sources)}`;
    m.push(`### ${x.title} (${x.place}, ${x.year})`, `What happened: ${x.trigger}`, `What they decided: ${x.decision}`, `What changed: ${x.result}`, ...x.actions.map(a => `- ${(lever[a.lever] || {}).title}: led by ${(inst[a.lead] || {}).name}; paid by ${a.payer}; ${a.measure}`), ...x.sources.map(s => `Source: ${s.label} ${s.url}`));
  });
  if (D.PLAN_MECHANISMS) {
    const F = [["problem", "The problem"], ["mechanism", "How they work together"], ["resources", "Authority and money"], ["delivery", "What reaches people"], ["unresolved", "Still unresolved"], ["check", "Before adapting it, check"]];
    h += `<h2 id="mechanisms">Adapt the mechanism, not the city: how five cities organise for heat</h2><p class="meta">${esc(D.PLAN_MECH_NOTE)} ${ext(D.MCR2030.url, D.MCR2030.label)}</p>`
      + D.PLAN_MECHANISMS.map(x => `<h3 id="${x.id}">${esc(x.city)}</h3><p class="meta">${esc(x.size)} · ${esc(x.pages)}</p><ul>${F.map(([k, l]) => `<li><strong>${l}:</strong> ${esc(x[k])}</li>`).join("")}</ul>`).join("");
    m.push("### Adapt the mechanism, not the city: how five cities organise for heat", `${D.PLAN_MECH_NOTE} (${D.MCR2030.label}, ${D.MCR2030.url})`, ...D.PLAN_MECHANISMS.flatMap(x => [`#### ${x.city} (${x.pages})`, ...F.map(([k, l]) => `- ${l}: ${x[k]}`)]));
  }
  out[p.slug] = page(p, intro, h); md.push(m.join("\n\n"));
}
// glossary
{
  const p = PAGES[6], terms = D.GLOSSARY, intro = `${terms.length} terms that come up again and again in extreme heat, explained in a sentence or two.`;
  const groups = [...D.GLOSSARY_GROUPS, { id: "extra", name: "Also explained on the map" }];
  let h = "", m = [`## ${p.title}`, intro];
  groups.forEach(g => { const ts = terms.filter(t => t.group === g.id); if (!ts.length) return;
    h += `<h2>${esc(g.name)}</h2><dl>${ts.map(t => `<dt id="${t.id}"><strong>${esc(t.term)}</strong></dt><dd>${esc(t.text)}${t.video ? ` <a href="/${t.video}">Watch the explainer (${esc(t.length)})</a>` : ""}${t.source ? ` <span class="meta">Source: ${ext(t.source.url, t.source.label)}</span>` : ""}</dd>`).join("")}</dl>`;
    m.push(`### ${g.name}`, ...ts.map(t => `- **${t.term}**: ${t.text}`)); });
  out[p.slug] = page(p, intro, h, [{ "@context": "https://schema.org", "@type": "DefinedTermSet", name: "Plain-language glossary of extreme heat", url: `${SITE}/glossary/`,
    hasDefinedTerm: terms.map(t => ({ "@type": "DefinedTerm", name: t.term, description: t.text, url: `${SITE}/glossary/#${t.id}` })) }]);
  md.push(m.join("\n\n"));
}
// heat network
{
  require("./site-counts.js")({ organisations: D.ORGANISATIONS.length, levers: D.LEVERS.length, heatwaves: D.HEATWAVES.length, atRisk: D.AT_RISK.length, cities: D.CITY_PROFILES.length, loops: D.LOOPS.length, glossaryTerms: D.GLOSSARY.length, glossaryFilms: D.GLOSSARY.filter(g => g.video).length });
  const p = PAGES[7], intro = `${D.ORGANISATIONS.length} organisations across Asia and the world already working on parts of the web of extreme heat. Inclusion describes relevant published work. It does not imply partnership, affiliation or endorsement.`;
  const sideName = id => (D.ORG_SIDES.find(x => x.id === D.ORG_SIDE[id]) || {}).name || "";
  const missing = D.ORGANISATIONS.filter(o => !D.ORG_SIDE[o.id]).map(o => o.id);
  if (missing.length) throw new Error("ORG_SIDE has no side for: " + missing.join(", "));
  const sidesIntro = `Each organisation is marked with its main side in a heat alliance. ${D.ORG_SIDES.map(x => `${x.name}: ${x.text}`).join(" ")} Many play more than one part; this is the main one.`;
  // the list, its filters, the Markdown and the spreadsheet all come from tools/build-heat-network.js
  const HNV = (fs.readFileSync(path.join(ROOT, "index.html"), "utf8").match(/\?v=(\d+)/) || [])[1] || "1";   // the site's cache version
  const HN = require("./build-heat-network.js").body({ D, esc, ext, V: HNV });
  const h = HN.h, m = [`## ${p.title}`, intro, ...HN.m];
  fs.writeFileSync(path.join(ROOT, "heat-network", "heat-network.csv"), HN.csv);
  out[p.slug] = page(p, intro, h); md.push(m.join("\n\n"));
}

// heat today and the next three days on each city page: an estimate of heat stress (WBGT) filled in the browser by
// city-heat/city-heat.js from Open-Meteo, with the words in LIVE_WBGT. With no JavaScript the official warning link stays.
const CHV = (fs.readFileSync(path.join(ROOT, "index.html"), "utf8").match(/\?v=(\d+)/) || [])[1] || "1";
const CH_CSS = `<style>.ch{margin:10px 0 6px;padding:14px 16px;border:1px solid #E6DFD4;border-radius:12px;background:#fff}.ch-msg{margin:0}.ch-k{margin:0;font-size:.75rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#5E6570}.ch-v{margin:2px 0 0;font-size:2.4rem;font-weight:800;line-height:1.15}.ch-v span{font-size:1rem;font-weight:700}.ch-n{margin:0;font-weight:700}.ch-air{margin:2px 0 8px;font-size:.875rem;color:#5E6570}.ch-meas,.ch-lv{margin:8px 0;font-size:.875rem}.ch-days{width:100%;border-collapse:collapse;margin:10px 0;font-size:.875rem}.ch-days caption{text-align:left;font-weight:700;margin-bottom:4px}.ch-days th,.ch-days td{text-align:left;padding:6px 8px 6px 0;border-top:1px solid #E6DFD4;vertical-align:top}.ch-h{color:#5E6570}.ch-note,.ch-src{margin:6px 0 0;font-size:.875rem;color:#5E6570}.ch-how{margin:8px 0}.ch-how summary{cursor:pointer;font-weight:700;min-height:24px}.visually-hidden{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}</style>`;
function cityHeat(c) {
  const W = D.LIVE_WBGT, LV = D.LIVE_LEVELS[c.country];
  const levels = LV && (!LV.only || LV.only.includes(c.id)) ? LV : null;
  const credit = `Sources: ${ext(D.LIVE_SOURCES.model.url, D.LIVE_SOURCES.model.label)} (${esc(D.LIVE_SOURCES.model.licence)})${c.wbgt ? ` · ${ext(D.LIVE_SOURCES.wbgt.url, D.LIVE_SOURCES.wbgt.label)}` : ""} · <a href="#ch-how">How the estimate is made</a>`;
  const data = { id: c.id, name: c.name, lat: c.lat, lon: c.lon, wbgt: !!c.wbgt, warn: c.warn, levels, credit, words: { name: W.name, noLevel: W.noLevel, not: W.not } };
  return `<h2 id="heat-today">${esc(W.title)}</h2>${CH_CSS}
      <div class="ch" data-city-heat aria-live="polite"><p class="ch-msg">Today’s readings and the three-day outlook load here with JavaScript on. Official warnings: ${ext(c.warn.url, c.warn.label)}.</p></div>
      <details class="ch-how" id="ch-how"><summary>How the estimate is made</summary><p>${esc(W.what)}</p><p>${esc(W.how)}</p><p>${esc(W.not)} ${esc(W.noLevel)}</p><p>${esc(W.fuller)}</p>
        <p class="src">Sources: ${ext(W.method.url, W.method.label)} · ${ext(W.review.url, W.review.label)} · ${ext(D.LIVE_SOURCES.model.url, D.LIVE_SOURCES.model.label)}</p></details>
      <script>window.CITY_HEAT=${JSON.stringify(data).replace(/</g, "\\u003c")};</script><script src="/city-heat/heat-core.js?v=${CHV}" defer></script><script src="/city-heat/city-heat.js?v=${CHV}" defer></script>`;
}

// the city heat briefing (step 3 of research/2026-11/city-heat/BUILD_BRIEF.md): what a checked study says heat costs the
// city (only where the profile names a loop whose reason carries a checked figure, "cost"), and the actions that break the
// city's vicious cycles, grouped by how soon they could act. Words in tools/city-districts/words.js.
const CD = require("./city-districts/words.js");
function cityBrief(cp) {
  const costLoop = cp.cost ? cp.loops.find(x => x.id === cp.cost && x.src) : null;
  if (cp.cost && !costLoop) throw new Error(`CITY_PROFILES ${cp.id}: cost names "${cp.cost}", which is not one of its loops with a source`);
  const ids = new Set(); cp.loops.forEach(x => { const l = D.LOOPS.find(q => q.id === x.id); if (l) loopLevers(l).forEach(v => ids.add(v.id)); });
  const groups = Object.keys(CD.when).map(k => [k, D.LEVERS.filter(v => ids.has(v.id) && v.when === k)]).filter(g => g[1].length);
  const html = `<h2 id="brief">${esc(CD.briefTitle)}</h2><h3>${esc(CD.cost)}</h3><p>${costLoop ? `${esc(costLoop.why)} <span class="src">Source: ${ext(costLoop.src.url, costLoop.src.label)}</span>` : esc(CD.noCost)}</p>
      <h3>${esc(CD.options)}</h3><p class="meta">${esc(CD.optionsLede)} What shade, parks and reflective roofs have been measured to do in Asian cities: <a href="/cooling-options/#measured">what has been measured, and where</a>.</p>${groups.length ? groups.map(([k, vs]) => `<p><strong>${esc(CD.when[k])}:</strong> ${vs.map(v => `<a href="/actions/#${v.id}">${esc(v.title)}</a>${v.watch && v.watch.length ? ` <span class="meta">(${esc(CD.watch.toLowerCase())})</span>` : ""}`).join(" · ")}</p>`).join("") : `<p>Not found yet.</p>`}`;
  const md = [`${CD.cost}: ${costLoop ? `${costLoop.why} (${costLoop.src.label}, ${costLoop.src.url})` : CD.noCost}`, `${CD.options}: ${groups.map(([k, vs]) => `${CD.when[k]}: ${vs.map(v => v.title).join("; ")}`).join(". ") || "Not found yet."}`];
  return { html, md };
}
// heat over time, where a city has data/city-history/<id>.json (written by .github/workflows/city-history.yml): three small
// bar charts drawn here as SVG (no script), each with its trend in words, a table of years, and the caveats beneath
const CHW = require("./city-history/words.js");
function cityHistory(c) {
  const f = path.join(ROOT, "data", "city-history", c.id + ".json");
  if (!fs.existsSync(f)) return { html: "", md: [] };
  const d = JSON.parse(fs.readFileSync(f, "utf8")), title = CHW.title(d.period[0], d.period[1]);
  if (!d.station) return { html: `<h2 id="history">${esc(title)}</h2><p>${esc(CHW.none)}</p>`, md: [`${title}: ${CHW.none}`] };
  const S0 = Object.assign({}, d.station, { name: String(d.station.name || "").replace(/,\s*[A-Z]{2}$/, "").toLowerCase().replace(/\b([a-z])/g, m => m.toUpperCase()) }), Y = S0.years, B = d.background, md = [`${title}: ${CHW.lede} ${CHW.station(S0.name, S0.valid_years, S0.of, S0.km_from_centre, /international|airport/i.test(d.station.name || ""))}`];
  const thr = { warm_nights: S0.thresholds.warm_night_c, hot_days: S0.thresholds.hot_day_c, hottest: null };
  const cg = S0.change || {}, brk = k => cg[k === "warm_nights" ? "tmin" : "tmax"];
  const say = (k, t) => { const M = CHW.measures[k], v = Math.abs(t.per_decade), r = t.range, b = brk(k);
    if (b && b.broken) return CHW.changed(b.year, b.step);
    return t.words === "no clear change" ? `${t.words}.` : `${t.words}: about ${k === "hottest" ? v.toFixed(1) : Math.round(v)} ${t.per_decade >= 0 ? M.per : M.less} (95% range ${k === "hottest" ? (+r[0]).toFixed(1) : Math.round(r[0])} to ${k === "hottest" ? (+r[1]).toFixed(1) : Math.round(r[1])} a decade).`; };
  const y0 = d.period[0], y1 = d.period[1], span = y1 - y0 + 1;
  const chart = k => { const vs = Y.map(y => y[k]), lo = k === "hottest" ? Math.floor(Math.min(...vs)) - 1 : 0, hi = Math.ceil(Math.max(...vs)), W = 320, H = 110, bw = W / span;
    const bars = Y.map(y => { const h = Math.max(1, (y[k] - lo) / (hi - lo || 1) * (H - 20)); return `<rect x="${((y.year - y0) * bw + 0.5).toFixed(1)}" y="${(H - 14 - h).toFixed(1)}" width="${(bw - 1).toFixed(1)}" height="${h.toFixed(1)}" fill="#B8401A"/>`; }).join("");
    const top = Y[vs.indexOf(Math.max(...vs))].year, bk = brk(k), bx = bk && bk.broken ? ((bk.year - y0) * bw).toFixed(1) : null;
    const mark = bx == null ? "" : `<line x1="${bx}" x2="${bx}" y1="12" y2="${H - 14}" stroke="#1F2328" stroke-width="1" stroke-dasharray="3 2"/><text x="${bx}" y="9" font-size="10" fill="#1F2328" text-anchor="${bk.year - y0 > span / 2 ? "end" : "start"}">${esc(CHW.mark(bk.year))}</text>`;
    const label = `${CHW.measures[k].name} at the ${S0.name} station, ${y0} to ${y1}, ${Y.length} complete years: from ${vs[0]} in ${Y[0].year} to ${vs[vs.length - 1]} in ${Y[Y.length - 1].year} ${CHW.measures[k].unit}; highest ${Math.max(...vs)} in ${top}${bk && bk.broken ? `; ${CHW.mark(bk.year)}` : ""}`;
    return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:480px;display:block" role="img" aria-label="${esc(label)}">${bars}<text x="0" y="${H - 2}" font-size="10" fill="#5E6570">${y0}</text><text x="${W}" y="${H - 2}" font-size="10" fill="#5E6570" text-anchor="end">${y1}</text>${bx == null ? `<text x="0" y="9" font-size="10" fill="#5E6570">${hi}${k === "hottest" ? " °C" : ""}</text>` : ""}${mark}</svg>`; };
  let h = `<h2 id="history">${esc(title)}</h2><p>${esc(CHW.lede)}</p><p class="meta">${esc(CHW.station(S0.name, S0.valid_years, S0.of, S0.km_from_centre, /international|airport/i.test(d.station.name || "")))}</p>`;
  for (const k of Object.keys(CHW.measures)) { const M = CHW.measures[k], t = S0.trends[k];
    h += `<h3>${esc(M.name)}</h3><p class="meta">${esc(M.what(thr[k]))}</p>${chart(k)}<p><strong>${esc(say(k, t))}</strong></p><p class="meta">${esc(CHW.background)}: ${esc(B.trends[k].words)}.</p>`;
    md.push(`${M.name} (${M.what(thr[k])}): ${say(k, t)} ${CHW.background}: ${B.trends[k].words}. By year: ${Y.map(y => `${y.year} ${y[k]}`).join(", ")}.`); }
  h += `<details><summary>${esc(CHW.table)}</summary><div style="overflow-x:auto"><table style="border-collapse:collapse;font-size:.875rem"><thead><tr><th scope="col" style="text-align:left;padding:4px 10px 4px 0">Year</th>${Object.values(CHW.measures).map(M => `<th scope="col" style="text-align:right;padding:4px 10px 4px 0">${esc(M.name)}</th>`).join("")}</tr></thead><tbody>${Y.map(y => `<tr><td style="padding:2px 10px 2px 0">${y.year}</td><td style="text-align:right;padding:2px 10px 2px 0">${y.warm_nights}</td><td style="text-align:right;padding:2px 10px 2px 0">${y.hot_days}</td><td style="text-align:right;padding:2px 10px 2px 0">${y.hottest} °C</td></tr>`).join("")}</tbody></table></div></details>
      <p class="meta">${esc(CHW.caveat)} ${esc(CHW.humidity)} ${esc(CHW.enso)}</p><p class="src">${esc(CHW.method)} Sources: ${ext(S0.source.url, S0.source.name + ", station " + S0.id)} (${esc(S0.source.licence)}); ${ext(B.source.url, B.source.name)} (${esc(B.source.licence)}). Generated ${esc(d.generated)}.</p>`;
  md.push(`Caveat: ${CHW.caveat} ${CHW.humidity} ${CHW.enso} ${CHW.method} Sources: ${S0.source.name} station ${S0.id}; ${B.source.name}.`);
  return { html: h, md };
}

// the district picture, where a city has one (data/city-districts/<id>.json, written by the district job): a table that
// loads only when opened (city-heat/districts.js); with no JavaScript, a link to the data file
function cityDistricts(c) {
  const f = path.join(ROOT, "data", "city-districts", c.id + ".json");
  if (!fs.existsSync(f)) return { html: "", md: [] };
  const d = JSON.parse(fs.readFileSync(f, "utf8")), url = `/data/city-districts/${c.id}.json`, n = d.districts.length;
  const src = d.sources.map(s => `${ext(s.url, s.name)} (${esc(String(s.year))}, ${esc(s.licence)})`).join(" · ");
  const limits = CD.limits.map(x => x.replace("{grid}", d.grid_m === 1000 ? "1 km" : "100 m"));
  const data = { id: c.id, url: url + "?v=" + CHV, n, cols: CD.cols, above: CD.above, below: CD.below };
  const html = `<h2 id="districts">${esc(CD.title)}</h2><p>${esc(CD.lede)}</p>
      <details class="cd"><summary>${esc(CD.open(n))}</summary><div class="cd-body" data-city-districts><p>${esc(CD.noJs)} <a href="${url}">${esc(c.name)} districts (JSON)</a>.</p></div></details>
      <ul class="meta">${limits.map(x => `<li>${esc(x)}</li>`).join("")}</ul><p class="src">Sources: ${src}. Generated ${esc(d.generated)}.</p>
      <style>.cd{margin:10px 0}.cd summary{cursor:pointer;font-weight:700;min-height:24px;padding:6px 0}</style>
      <script>window.CITY_DISTRICTS=${JSON.stringify(data).replace(/</g, "\\u003c")};(function(){var d=document.querySelector("details.cd");if(!d)return;var go=function(){if(!d.open||go.done)return;go.done=1;var s=document.createElement("script");s.src="/city-heat/districts.js?v=${CHV}";document.head.appendChild(s);};d.addEventListener("toggle",go);go();})();</script>`;
  const md = [`${CD.title}: ${n} districts, each with estimated residents, the share aged 65 and over, hospitals mapped in OpenStreetMap, built-up share and park area share, side by side and never ranked. Data: ${SITE}${url}. Limits: ${limits.join(" ")}`];
  return { html, md };
}

// cities: an index page and one page per city
const CITY_PAGES = [];
// cities whose country has a snapshot on /countries/ (tools/build-solutions.js) link to it
const SNAP_SLUG = { Bangladesh: "bangladesh", India: "india", Indonesia: "indonesia", Nepal: "nepal", Philippines: "philippines", "Sri Lanka": "sri-lanka", Thailand: "thailand" };
{
  const p = PAGES[8], live = Object.fromEntries(D.LIVE_CITIES.map(c => [c.id, c]));
  const intro = `What extreme heat is doing in ${D.CITY_PROFILES.length} Asian cities: whether each has a heat plan, the vicious cycles the evidence ties to it, who is hit hardest and who is already at work.`;
  let h = "", m = [`## ${p.title}`, intro];
  D.CITY_PROFILES.forEach(cp => {
    const c = live[cp.id], url = `${SITE}/cities/${cp.id}/`;
    const loops = cp.loops.map(x => ({ l: D.LOOPS.find(l => l.id === x.id), why: x.why, src: x.src })).filter(x => x.l);
    const orgs = cp.orgs.map(id => D.ORGANISATIONS.find(o => o.id === id)).filter(Boolean);
    const exs = cp.examples.map(id => D.WORKED_EXAMPLES.find(x => x.id === id)).filter(Boolean);
    const risks = cp.risk.map(id => D.AT_RISK.find(g => g.id === id)).filter(Boolean);
    const status = D.CITY_HAP[cp.hap.status];
    h += `<h2 id="${cp.id}"><a href="/cities/${cp.id}/">${esc(c.name)}, ${esc(c.country)}</a></h2><p>${esc(cp.tagline)}</p><p class="meta">Heat plan: ${esc(status)}. Cycles tied to it: ${esc(loops.map(x => x.l.name).join(", "))}.</p>`;
    const body = `<a class="cs-where" href="/atlas/#city-${cp.id}">${PIN}Where this happens: ${esc(c.name)} on the Atlas <span aria-hidden="true">→</span></a>${cp.heat ? `<p><strong>Heat type:</strong> ${esc(cp.heat)} <a href="/glossary/#dryhumid">Dry heat and humid heat, explained</a>.</p>` : ""}<h2>Heat action plan: ${esc(status)}</h2><p>${esc(cp.hap.text)}</p><p class="src">Sources: ${cp.hap.sources.map(s => ext(s.url, s.label)).join(" · ")}</p>
      ${cityHeat(c)}<p>The week’s forecast is on <a href="/#city-${cp.id}">the interactive map</a>. ${D.LIVE_FINGERPRINT ? `How much climate change shaped today’s heat: ${ext(D.LIVE_FINGERPRINT.map.url, D.LIVE_FINGERPRINT.map.label)}.` : ""}</p>
      ${cityHistory(c).html}${cityBrief(cp).html}${cityDistricts(c).html}
      <h2>Vicious cycles the evidence ties to ${esc(c.name)}</h2>${loops.map(x => `<h3><a href="/loops/#${x.l.id}">${esc(x.l.name)}</a></h3><p>${esc(x.why)}${x.src ? ` <span class="src">Source: ${ext(x.src.url, x.src.label)}</span>` : ""}</p><p class="meta">${esc(x.l.summary)} <a href="/#loop-${x.l.id}">Follow it on the map</a>.</p>`).join("")}
      ${checkFor("city-" + cp.id, c.name)}
      ${recentFor(["city-" + cp.id, "country-" + (SNAP_SLUG[c.country] || c.country.toLowerCase().replace(/\s+/g, "-"))])}
      <h2>Who heat hits hardest here</h2><ul>${risks.map(g => `<li><a href="/who-is-at-risk/#${g.id}">${esc(g.name)}</a></li>`).join("")}</ul>
      ${c.country === "India" ? (n => n ? `<h2>Heat action plans on file</h2><p>${n} ${n === 1 ? "document" : "documents"} for ${esc(c.name)} in the <a href="/resources/heat-action-plans/india/?q=${encodeURIComponent(c.name)}">India heat action plan archive</a>, with a link to each PDF.</p>` : hapState(c))(hapFor(c.name).length) : ""}
      ${exs.length ? `<h2>A worked plan to learn from</h2>${exs.map(x => `<p><a href="/worked-plans/#${x.id}">${esc(x.title)}</a> (${esc(x.place)}, ${esc(x.year)})</p>`).join("")}` : ""}
      <h2 id="orgs">Already at work here</h2>${orgs.length ? `<ul>${orgs.map(o => `<li>${ext(o.url, o.name)}: ${esc(o.does)}</li>`).join("")}</ul>` : `<p>Not found yet: the heat network lists no organisation whose work is in this city. This describes the list, not the city. <a href="/heat-network/">The heat network</a></p>`}<p class="meta">Listing does not imply partnership, affiliation or endorsement.</p>
      ${SNAP_SLUG[c.country] ? `<h2>The national picture</h2><p>Plans and law, warnings, rules for heat at work, cooling, money and other cities in ${esc(c.country)}: <a href="/countries/${SNAP_SLUG[c.country]}/">the ${esc(c.country)} country snapshot</a>.</p>` : ""}`;
    const cpPage = { slug: `cities/${cp.id}`, title: `Extreme heat in ${c.name}: plans, cycles and who is at work`, short: c.name, parent: p };
    const cIntro = `${cp.tagline} Heat plan: ${status.toLowerCase()}.`;
    CITY_PAGES.push(cpPage);
    out[cpPage.slug] = page(cpPage, cIntro, body, [{ "@context": "https://schema.org", "@type": "City", name: c.name, containedInPlace: { "@type": "Country", name: c.country },
      geo: { "@type": "GeoCoordinates", latitude: c.lat, longitude: c.lon }, url }]);
    m.push(`### ${c.name}, ${c.country}`, cp.tagline, `Heat action plan (${status}): ${cp.hap.text} Sources: ${cp.hap.sources.map(s => `${s.label} ${s.url}`).join("; ")}`, ...cityHistory(c).md, ...cityBrief(cp).md, ...cityDistricts(c).md, `${D.LIVE_WBGT.title}: the page shows ${D.LIVE_WBGT.name.toLowerCase()} now and an estimated daily peak for today and the next three days, calculated in the browser from Open-Meteo. Official warnings: ${c.warn.label} ${c.warn.url}`,
      ...loops.map(x => `- ${x.l.name}: ${x.why}`), `Who heat hits hardest: ${risks.map(g => g.name).join("; ")}`, `Already at work: ${orgs.length ? orgs.map(o => o.name).join("; ") : "Not found yet: the heat network lists no organisation whose work is in this city. This describes the list, not the city."}`, `Page: ${url}`);
  });
  out[p.slug] = page(p, intro, h); md.push(m.join("\n\n"));
  // the homepage city view loads this only when a reader nears it (script.js, loadProfiles)
  fs.writeFileSync(path.join(ROOT, "cities", "profiles.json"), JSON.stringify(D.CITY_PROFILES));
}

// heatwaves timeline
{
  const p = PAGES[9], intro = `${D.HEATWAVES.length} major heatwaves across South and Southeast Asia, from Odisha in 1998 to 2026: what happened, what it cost and what changed afterwards. ${D.HEATWAVES_NOTE}`;
  let h = "", m = [`## ${p.title}`, intro];
  D.HEATWAVES.forEach(x => {
    h += `<h2 id="${x.id}">${esc(x.when)}, ${esc(x.place)}: ${esc(x.title)}</h2><p><strong>Peak:</strong> ${esc(x.peak)}. <strong>Toll:</strong> ${esc(x.toll)}.</p><p>${esc(x.what)}</p><p><strong>What changed:</strong> ${esc(x.changed)}</p><p><a class="cs-where" href="/atlas/#${x.id}">${PIN}Where this happens: see it on the Atlas <span aria-hidden="true">→</span></a></p>
      <p class="meta">On the map: ${x.nodes.map(n => `<a href="/#${n}">${esc(name(n))}</a>`).join(" · ")}</p>${srcs(x.sources)}`;
    m.push(`### ${x.when}, ${x.place}: ${x.title}`, `Peak: ${x.peak}. Toll: ${x.toll}.`, x.what, `What changed: ${x.changed}`, ...x.sources.map(s => `Source: ${s.label} ${s.url}`));
  });
  out[p.slug] = page(p, intro, h, [{ "@context": "https://schema.org", "@type": "ItemList", name: p.title, numberOfItems: D.HEATWAVES.length,
    itemListElement: D.HEATWAVES.map((x, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "Event", name: `${x.title} (${x.place}, ${x.when})`, description: x.what,
      startDate: String(x.year), location: { "@type": "Place", name: x.place }, url: `${SITE}/heatwaves/#${x.id}` } })) }]);
  md.push(m.join("\n\n"));
}

// ---- practical actions ----
{
  const p = PAGES[10], n = D.ACTION_SETTINGS.reduce((t, x) => t + x.cards.length, 0);
  const intro = `${n} practical actions against extreme heat in workplaces, homes, schools, health facilities, markets and neighbourhoods, and what municipalities can do before summer. Each answers eight questions: what to do, who it protects, where it suits, who acts, what it takes to run, the evidence, what could stop it, and what it only works with.`;
  const inst = id => (D.INSTITUTIONS.find(i => i.id === id) || {}).name || id;
  const val = (c, k) => k === "who" ? c.who.map(inst).join(", ") : k === "evidence" ? c.evidence.text : k === "worksIf" ? c.worksIf.join("; ") + "." : c[k];
  const EN = require("./el-nino-text.js");
  const RL = SH.RELIABLE;
  let h = `${EN.promo(esc, "en-promo-practical", "p")}<h2 id="reliable">${esc(RL.h)}</h2><p>${esc(RL.intro)}</p><ul>${RL.items.map(x => `<li><strong>${esc(x.t)}:</strong> ${esc(x.d)}</li>`).join("")}</ul><p class="meta">Each card below says what it takes to run. <a href="/${SH.SLUG}/#resources">See who authorises, pays, runs and fixes each part in one worked example</a>.</p><p class="meta">Evidence labels: ${Object.values(D.EVIDENCE_STATUS).map(x => `<strong>${esc(x.name)}</strong>: ${esc(x.text)}`).join(" ")}</p><p><strong>Start from a question:</strong> ${D.ACTION_JOURNEYS.map(j => j.go === "stalls" ? `<a href="/#stalls">${esc(j.q)}</a>` : j.go === "finance" ? `<a href="/paying-for-protection/">${esc(j.q)}</a>` : `<a href="#${j.go}">${esc(j.q)}</a>`).join(" · ")}</p>`, m = [`## ${p.title}`, intro, EN.promoMd(), `### ${SH.RELIABLE.h}`, SH.RELIABLE.intro, ...SH.RELIABLE.items.map(x => `- ${x.t}: ${x.d}`)];
  D.ACTION_SETTINGS.forEach(st => {
    h += `<h2 id="${st.id}">${esc(st.name)}</h2><p>${esc(st.intro)} <a href="/print/actions-${st.id}/">Print these cards</a> · <a href="/practical/#practical-${st.id}">Open them in the interactive version</a>${st.cool ? ` · <a href="/cooling-options/#${st.cool}">Options, costs and traps</a>` : ""}${st.id === "summer" ? ` · <a href="/el-nino-and-cities/">El Niño and India's smaller cities: preparing for summer 2027</a>` : ""}${st.id === "work" ? ` · <a href="/factory-heat/">Heat inside factories: sources, measures and a worksheet</a>` : ""}</p>`;
    m.push(`### ${st.name}`, st.intro);
    if (st.problems) { h += `<p><strong>What workers told researchers:</strong> ${st.problems.map(x => esc(x.q)).join(" · ")}. ${ext(st.problemsSource.url, st.problemsSource.label)}</p>`; m.push(`What workers told researchers: ${st.problems.map(x => x.q).join("; ")} (${st.problemsSource.label}, ${st.problemsSource.url})`); }
    st.cards.forEach(c => {
      const tag = `${(D.EVIDENCE_STATUS[c.status] || {}).name || ""}${c.horizon ? ` · ${(D.ACTION_HORIZONS.find(x => x.id === c.horizon) || {}).name}` : ""}`;
      h += `<h3 id="${st.id}-${c.id}">${esc(c.title)}</h3><p class="meta">Evidence: ${esc(tag)}</p><ul>${D.ACTION_LINES.map(([k, label]) => `<li><strong>${esc(label)}:</strong> ${esc(val(c, k))}${k === "evidence" ? ` ${ext(c.evidence.source.url, c.evidence.source.label)}` : ""}</li>`).join("")}</ul>
        ${c.delivery ? `<p><strong>Delivery details:</strong></p><ul>${c.delivery.map(([k, v]) => `<li><strong>${esc(k)}:</strong> ${esc(v)}</li>`).join("")}</ul>` : ""}
        ${(c.examples || []).map(x => `<p><strong>Where it has been tried</strong> (${esc(D.EVIDENCE_STATUS[x.status].name)}): ${esc(x.text)} ${ext(x.source.url, x.source.label)}</p>`).join("")}`;
      m.push(`#### ${c.title}`, `Evidence: ${tag}`, ...D.ACTION_LINES.map(([k, label]) => `- ${label}: ${val(c, k)}${k === "evidence" ? ` (${c.evidence.source.label}, ${c.evidence.source.url})` : ""}`),
        ...(c.delivery || []).map(([k, v]) => `- Delivery, ${k.toLowerCase()}: ${v}`), ...(c.examples || []).map(x => `Where it has been tried (${D.EVIDENCE_STATUS[x.status].name}): ${x.text} (${x.source.label}, ${x.source.url})`));
    });
  });
  // Explore a market: the same notes as the interactive market on /practical/, for reading without JavaScript
  const MX = D.MARKET_EXPLORER, mxHref = h => h.startsWith("#practical-") ? `/practical/${h}` : h.startsWith("#cool-") ? `/${h}` : h === "#plan" ? "/plan/" : h === "#finance" ? "/finance/" : h;
  h += `<h2 id="market">${esc(MX.title)}</h2><p>${esc(MX.caption)} <a href="/practical/#market">Explore it as a drawing</a></p>` +
    MX.hotspots.map(x => `<h3 id="market-${x.id}">${esc(x.label)}: ${esc(x.title)}</h3><ul><li><strong>What could help:</strong> ${esc(x.help)}</li><li><strong>What makes it work:</strong> ${esc(x.works)}</li><li><strong>People to involve (suggested roles):</strong> ${x.people.map(esc).join("; ")}.</li><li><strong>Look closer:</strong> ${x.look.map(l => `<a href="${mxHref(l.href)}">${esc(l.label)}</a>`).join(" · ")}</li></ul>` +
      x.evidence.map(e => `<p><strong>Evidence</strong> (${esc(D.EVIDENCE_STATUS[e.status].name)}): ${esc(e.text)} ${ext(e.source.url, e.source.label)}</p>`).join("") + `<p class="meta">Limits: ${esc(x.limit)}</p>`).join("");
  m.push(`### ${MX.title}`, MX.caption, ...MX.hotspots.flatMap(x => [`#### ${x.label}: ${x.title}`, `- What could help: ${x.help}`, `- What makes it work: ${x.works}`, `- People to involve (suggested roles): ${x.people.join("; ")}`,
    ...x.evidence.map(e => `- Evidence (${D.EVIDENCE_STATUS[e.status].name}): ${e.text} (${e.source.label}, ${e.source.url})`), `- Limits: ${x.limit}`]));
  const HW = D.HEAT_WEEK;
  h += `<h2 id="heatweek">A week in the heat: an exercise</h2><p>On its own page, follow one worker’s money through a heatwave week, build a package of protection, then test it: money arriving late, insurance that does not trigger, falling ill without being admitted, water or power failing, missing ID, donor money ending. A measure counts only when the person can actually use it. <a href="/a-week-in-the-heat/">Open the exercise</a></p>
    ${HW.countries.map(c => `<h3 id="heatweek-${c.id}">${esc(c.name)}</h3><ul>${HW.people.filter(x => x.country === c.id).map(x => `<li><strong>${esc(x.name)}, ${esc(x.role.toLowerCase())}.</strong> ${esc(x.intro)}</li>`).join("")}</ul>
      <p class="meta">What is known:</p><ul>${c.context.map(x => `<li>${esc(x.text)} ${ext(x.source.url, x.source.label)}</li>`).join("")}</ul>`).join("")}<p class="meta">${esc(HW.note)}</p>
    <ul>${HW.evidence.map(x => `<li>${esc(x.text)} ${ext(x.source.url, x.source.label)}</li>`).join("")}</ul>`;
  m.push("### A week in the heat: an exercise", "Follow one worker’s money through a heatwave week, build protection, then test it. A measure counts only when the person can actually use it.", ...HW.countries.flatMap(c => [`#### ${c.name}`, ...HW.people.filter(x => x.country === c.id).map(x => `- ${x.name}, ${x.role}: ${x.intro}`), ...c.context.map(x => `- ${x.text} (${x.source.label}, ${x.source.url})`)]), HW.note, ...HW.evidence.map(x => `- ${x.text} (${x.source.label}, ${x.source.url})`));
  out[p.slug] = page(p, intro, h, [{ "@context": "https://schema.org", "@type": "ItemList", name: p.title, numberOfItems: n,
    itemListElement: D.ACTION_SETTINGS.flatMap(st => st.cards.map(c => ({ st, c }))).map(({ st, c }, i) => ({ "@type": "ListItem", position: i + 1, name: c.title, description: c.what, url: `${SITE}/practical-actions/#${st.id}-${c.id}` })) }]);
  md.push(m.join("\n\n"));
}

// ---- paying for protection ----
{
  const p = PAGES[11], F = D.FINANCE, intro = F.intro;
  const src = x => ext(x.url, x.label);
  let h = `<h2>What needs paying for, and when is the money needed?</h2><div role="region" aria-label="What needs paying for, the route to look into and the question to answer" tabindex="0" style="overflow-x:auto;max-width:100%"><table><thead><tr><th>Need</th><th>Route to look into</th><th>The question to answer</th></tr></thead><tbody>${F.needs.map(n => `<tr><td>${esc(n.need)}</td><td>${esc(n.route)}</td><td>${esc(n.ask)}</td></tr>`).join("")}</tbody></table></div><p class="meta">${esc(F.needsNote)}</p>
    <h2>Three triggers, not one</h2><ul>${F.triggers.map(t => `<li><strong>${esc(t.name)}:</strong> ${esc(t.does)} ${esc(t.who)}.</li>`).join("")}</ul><p>${esc(F.triggersNote)}</p>
    <h2>${esc(F.basis.q)}</h2><ul>${F.basis.kinds.map(k => `<li><strong>${esc(k.name)}.</strong> ${esc(k.text)}</li>`).join("")}</ul><p><strong>${esc(F.basis.ask)}</strong> ${esc(F.basis.note)} ${src(F.basis.source)}</p>
    <h2>From trigger to protection</h2><ol>${F.pathway.steps.map(x => `<li>${esc(x)}</li>`).join("")}</ol><p>${esc(F.pathway.note)} ${src(F.pathway.source)}</p>
    <h2>Will it survive the next season?</h2><ul>${F.survive.map(q => `<li>${esc(q)}</li>`).join("")}</ul><p class="meta">${src(F.surviveSource)}</p>
    <h2 id="who-keeps-paying">${esc(SH.COSTS.h)}</h2><p>${esc(SH.COSTS.intro)}</p><ul>${SH.COSTS.shifts.map(x => `<li><strong>${esc(x.t)}:</strong> ${esc(x.d)}</li>`).join("")}</ul><p>${esc(SH.COSTS.ask)}</p>
    ${F.lenders ? `<h2 id="lenders">${esc(F.lenders.title)}</h2><p>${esc(F.lenders.intro)} <a href="/media/films/heat-and-lenders.mp4">Watch the ${esc(F.lenders.video.length)} narrated film</a> (transcript: <a href="/media/films/heat-and-lenders.en.vtt">captions</a>).</p><ul>${F.lenders.facts.map(f => `<li>${esc(f)}</li>`).join("")}</ul><p><strong>What could help, in combination:</strong></p><ul>${F.lenders.helps.map(x => `<li><strong>${esc(x.name)}:</strong> ${esc(x.text)}</li>`).join("")}</ul><p>${esc(F.lenders.shift)}</p><p class="meta">${esc(F.lenders.note)} ${src(F.lenders.source)}</p>` : ""}
    <h2>What has been tried</h2>${F.cases.map(c => `<h3 id="${c.id}">${esc(c.name)}</h3><p class="meta">${esc(c.where)} · ${esc(c.hazard)}</p><ul><li><strong>Who paid:</strong> ${esc(c.paid)}</li><li><strong>Who received it:</strong> ${esc(c.received)}</li><li><strong>What it made possible:</strong> ${esc(c.enabled)}</li><li><strong>What it left out:</strong> ${esc(c.uncovered)}</li><li><strong>Did it continue?</strong> ${esc(c.continued)}</li><li><strong>Lesson:</strong> ${esc(c.lesson)}</li></ul><p class="meta">Sources: ${c.sources.map(src).join(" · ")}</p>`).join("")}
    <h2>What this evidence can and can’t tell you</h2><p>${esc(F.boundary)} ${src(F.boundarySource)}</p>
    <p><a href="/print/paying-for-protection/">Print the one-pager</a> · <a href="/plan/#plan-step-3">Add who pays to a plan</a></p>`;
  const m = [`## ${p.title}`, intro, "### What needs paying for, and when is the money needed?", ...F.needs.map(n => `- ${n.need}: ${n.route}. ${n.ask}`), F.needsNote,
    "### Three triggers, not one", ...F.triggers.map(t => `- ${t.name}: ${t.does} ${t.who}.`), F.triggersNote,
    `### ${F.basis.q}`, ...F.basis.kinds.map(k => `- ${k.name}: ${k.text}`), `${F.basis.ask} ${F.basis.note} (${F.basis.source.label}, ${F.basis.source.url})`,
    "### From trigger to protection", F.pathway.steps.join(" → "), `${F.pathway.note} (${F.pathway.source.label}, ${F.pathway.source.url})`,
    "### Will it survive the next season?", ...F.survive.map(q => `- ${q}`), `### ${SH.COSTS.h}`, SH.COSTS.intro, ...SH.COSTS.shifts.map(x => `- ${x.t}: ${x.d}`), SH.COSTS.ask,
    ...(F.lenders ? [`### ${F.lenders.title}`, F.lenders.intro, ...F.lenders.facts.map(f => `- ${f}`), "What could help, in combination:", ...F.lenders.helps.map(x => `- ${x.name}: ${x.text}`), F.lenders.shift, `Source: ${F.lenders.source.label} ${F.lenders.source.url}`] : []),
    "### What has been tried", ...F.cases.flatMap(c => [`#### ${c.name} (${c.where}; ${c.hazard})`, `Who paid: ${c.paid}`, `Who received it: ${c.received}`, `What it made possible: ${c.enabled}`, `What it left out: ${c.uncovered}`, `Did it continue? ${c.continued}`, `Lesson: ${c.lesson}`, ...c.sources.map(x => `Source: ${x.label} ${x.url}`)]),
    "### What this evidence can and can’t tell you", `${F.boundary} (${F.boundarySource.label}, ${F.boundarySource.url})`];
  out[p.slug] = page(p, intro, h); md.push(m.join("\n\n"));
}

// ---- how heat became visible: its page is built by tools/build-visibility.js; the same text, from the same helper, joins llms-full.txt ----
const VT = require("./visibility-text.js");
if (D.HEAT_VISIBILITY) md.push(VT.markdown(D.HEAT_VISIBILITY, SITE));
// ---- El Niño and the city: page by tools/build-el-nino.js, the same words from tools/el-nino-text.js ----
md.push(require("./build-el-nino.js").md(SITE));
md.push(require("./build-el-nino-explainer.js").md(SITE));
md.push(require("./build-factory-heat.js").md(SITE));
md.push(require("./build-cotton-heat.js").md(SITE));
md.push(SH.md(SITE));
// ---- who could help a household through a hot season: page by tools/build-social-protection.js, the same words from tools/social-protection-text.js ----
const SPT = require("./social-protection-text.js");
if ((D.SOCIAL_PROTECTION || []).length) md.push(SPT.md(D.SOCIAL_PROTECTION, SITE));
const GT = require("./growth-text.js"); md.push(GT.md(SITE));
// ---- signals: page by tools/build-signals.js, the same words from tools/signals-text.js ----
md.push(require("./signals-text.js").md(SITE));
// ---- funding landscape, open calls and careers: pages by tools/build-funding.js (via build-economy.js), the same words from tools/funding-text.js ----
md.push(require("./build-funding.js").llms());
// ---- The Heat Assembly: page and game by tools/build-heat-assembly.js, the same words from tools/heat-assembly-text.js ----
md.push(require("./build-heat-assembly.js").md(D, SITE));
// ---- State of the field: the latest published edition and the archive, from tools/sof-text.js ----
md.push(require("./sof-text.js").llms(SITE));
// the learning agenda, as on /evidence-map/: each question with its dated history
{ const LQ = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "site", "learning.json"), "utf8")).questions;
  md.push(["## The learning agenda: questions the evidence has not yet answered", `${SITE}/evidence-map/`, "What we have restates the limits the cited studies give themselves; what could answer it and the scale are our suggestions. Advanced means new evidence narrows a question; it is not an answer.",
    ...LQ.map(q => `- ${q.q} [${q.status}; ${(q.history || []).map(h => `${h.status} ${h.date}${h.status !== "open" ? `: ${h.note}` : ""}`).join("; ")}] What we have: ${q.have}${(q.underway || []).map(u => ` Work under way (not yet an answer): ${u.text} (${u.source[0]}, ${u.source[1]})`).join("")} What could answer it: ${q.could} Scale: ${q.scale}`)].join("\n\n")); }

// ---- write the pages ----
[...PAGES, ...CITY_PAGES].forEach(p => { const dir = path.join(ROOT, p.slug); fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, "index.html"), out[p.slug]); });

// ---- llms.txt: a short guide for AI systems; llms-full.txt: the whole map as text ----
const about = `> An interactive systems map of extreme heat in Asia: how heat ripples through ${D.SYSTEMS.length} systems and ${D.CONSEQUENCES.length} consequences, the ${D.LOOPS.length} vicious cycles that make it worse, the ${D.LEVERS.length} actions that could break them, and the ${D.INSTITUTIONS.length} kinds of institution that hold those levers. Every claim links to its source.`;
fs.writeFileSync(path.join(ROOT, "llms.txt"), `# Common Shade

${about}

It is moving from beattheheat.asia to commonshade.asia, and was first published as BeatTheHeat.Asia. It is independent of the Beat the Heat initiative that UNEP's Cool Coalition runs with the COP30 Presidency.

${DISCLAIMER}

${LICENCE}

The interactive map is at ${SITE}/ and needs JavaScript. The links below lead to each page's Markdown copy (index.md), with the same content as the page; the same address without index.md is the HTML page.

## The map as text

${PAGES.map(p => `- [${p.short}](${SITE}/${p.slug}/): ${p.title}`).join("\n")}

## Cities

${CITY_PAGES.map(p => `- [${p.short}](${SITE}/${p.slug}/): ${p.title}`).join("\n")}

## How heat became visible

- [${VT.TITLE}](${SITE}/${VT.SLUG}/): when science, health, labour, finance and the UN began to notice extreme heat, and who was still missing; a graded timeline, the turning points and how heat appears in IPCC reports (also in llms-full.txt)

- [${GT.TITLE}](${SITE}/${GT.SLUG}/): how the knowledge on Common Shade is changing: each change with why it matters, its sources, what it connects to and what it took to add, the corrections, and the work it draws on dated by year of publication (also in llms-full.txt)

${(D.SOCIAL_PROTECTION || []).length ? `## Social protection and heat

- [${SPT.TITLE}](${SITE}/${SPT.SLUG}/): public schemes that could cushion a household through a hot season in ${SPT.counts(D.SOCIAL_PROTECTION).countries} countries (${D.SOCIAL_PROTECTION.map(f => f.country.name).join(", ")}): who runs each, who is eligible, what it gives, how it is delivered, the steps of access with what is measured, delivery routes and organisations, and where no public system responds (also in llms-full.txt)

` : ""}`);
fs.writeFileSync(path.join(ROOT, "llms-full.txt"), `# Common Shade: the whole map as text\n\n${about}\n\n${DISCLAIMER}\n\n${LICENCE}\n\nInteractive map: ${SITE}/ · Generated ${TODAY}\n\n${md.join("\n\n")}\n`);

// ---- sitemap.xml and robots.txt ----
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE}/</loc><lastmod>${TODAY}</lastmod><priority>1.0</priority></url>
  <url><loc>${SITE}/a-week-in-the-heat/</loc><lastmod>${TODAY}</lastmod><priority>0.9</priority></url>
  <url><loc>${SITE}/plan/</loc><lastmod>${TODAY}</lastmod><priority>0.9</priority></url>
  <url><loc>${SITE}/together/</loc><lastmod>${TODAY}</lastmod><priority>0.9</priority></url>
  <url><loc>${SITE}/guide/</loc><lastmod>${TODAY}</lastmod><priority>0.9</priority></url>
  <url><loc>${SITE}/practical/</loc><lastmod>${TODAY}</lastmod><priority>0.9</priority></url>
  <url><loc>${SITE}/paying-when-heat-strikes/</loc><lastmod>${TODAY}</lastmod><priority>0.8</priority></url>
  <url><loc>${SITE}/finance/</loc><lastmod>${TODAY}</lastmod><priority>0.8</priority></url>
  <url><loc>${SITE}/sources/</loc><lastmod>${TODAY}</lastmod><priority>0.6</priority></url>
  <url><loc>${SITE}/join/</loc><lastmod>${TODAY}</lastmod><priority>0.7</priority></url>
  <url><loc>${SITE}/news/</loc><lastmod>${TODAY}</lastmod><priority>0.7</priority></url>
${[...PAGES, ...CITY_PAGES].map(p => `  <url><loc>${SITE}/${p.slug}/</loc><lastmod>${TODAY}</lastmod><priority>0.8</priority></url>`).join("\n")}
${require("./sof-model.js").published().map(e => `  <url><loc>${SITE}/whats-new/${e.id}/</loc><lastmod>${(require("./sof-model.js").revised(e) || e.published)}</lastmod><priority>0.6</priority></url>`).join("\n")}
</urlset>
`);
const BOTS = ["Googlebot", "Bingbot", "Google-Extended", "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User", "Applebot", "Applebot-Extended", "CCBot", "DuckDuckBot", "Meta-ExternalAgent"];
fs.writeFileSync(path.join(ROOT, "robots.txt"), `# Common Shade welcomes search engines and AI systems, for search, answers and training.
# The pages under /the-web/, /loops/, /actions/ and the others carry the map's content as plain HTML;
# /llms.txt and /llms-full.txt describe the site for AI systems.

User-agent: *
Allow: /
Content-Signal: search=yes, ai-input=yes, ai-train=yes

${BOTS.map(b => `User-agent: ${b}\nAllow: /`).join("\n\n")}

Sitemap: ${SITE}/sitemap.xml
`);
// ---- printable one-pagers ----
require("./build-print")().then(list => {
  const sm = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8").replace("</urlset>", [`  <url><loc>${SITE}/print/</loc><lastmod>${TODAY}</lastmod><priority>0.6</priority></url>`,
    ...list.map(x => `  <url><loc>${SITE}/print/${x.slug}/</loc><lastmod>${TODAY}</lastmod><priority>0.5</priority></url>`)].join("\n") + "\n</urlset>");
  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sm);
  fs.appendFileSync(path.join(ROOT, "llms.txt"), `\n## Printable one-pagers\n\n- [All one-pagers](${SITE}/print/): single A4 briefs for officials, planners and journalists\n${list.map(x => `- [${x.title}](${SITE}/print/${x.slug}/)`).join("\n")}\n`);
  console.log("Wrote", list.length, "printable one-pagers");
  // last of all, once every page exists: one navigation on every page
  require("./build-ticker.js");
  require("./growth-dates.js"); require("./news-status.js"); require("./build-pages.js"); require("./build-everything.js")({ llms: true }); require("./build-nav.js")(); require("./shorts/embed.js"); require("./explainers/embed.js");
  // the sitemap lists every page that exists, so new sections never go missing from search engines
  {
    const urls = [], skip = /^(tools|media|node_modules|research|data|images|feeds|\.git|\.github|\.claude|\.agents)$/;
    const walk = (dir, rel) => fs.readdirSync(dir, { withFileTypes: true }).forEach(e => {
      if (e.isDirectory()) { if (!skip.test(e.name)) walk(path.join(dir, e.name), rel + e.name + "/"); }
      else if (e.name === "index.html") urls.push(rel); });
    walk(ROOT, "");
    const pri = u => u === "" ? "1.0" : /^print\//.test(u) ? "0.5" : u.split("/").length <= 2 ? "0.8" : "0.7";
    fs.writeFileSync(path.join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls.sort().map(u => `  <url><loc>${SITE}/${u}</loc><lastmod>${TODAY}</lastmod><priority>${pri(u)}</priority></url>`).join("\n") + "\n</urlset>\n");
    console.log("sitemap:", urls.length, "pages");
  }
  // after the final sitemap and navigation: the machine-readable doors, Markdown twins and head links
  require("./build-agent-files.js");
  require("./build-use-with-ai.js").packs();   // after the Markdown twins, which the country packs reuse
});
console.log("Wrote", PAGES.length + CITY_PAGES.length, "pages, llms.txt, llms-full.txt, sitemap.xml and robots.txt");

// ---- /solutions/ and /countries/: the research libraries (before /sources/, which reads their links) ----
require("./build-solutions.js");
require("./build-economy.js");
require("./build-lancet.js");
require("./build-media.js");
{
  const extra = ["solutions", "countries", "countries/bangladesh", "countries/nepal", "countries/sri-lanka", "countries/thailand", "countries/indonesia", "countries/india", "countries/philippines", "heat-economy", "heat-economy/businesses", "heat-economy/money", "heat-economy/opportunities", "heat-economy/conditions", "lancet-countdown-2026", "how-heat-is-reported"];
  const sm = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
  if (!sm.includes(`${SITE}/solutions/`)) fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sm.replace("</urlset>", extra.map(x => `  <url><loc>${SITE}/${x}/</loc><lastmod>${TODAY}</lastmod><priority>0.7</priority></url>`).join("\n") + "\n</urlset>"));
  fs.appendFileSync(path.join(ROOT, "llms.txt"), `\n## Solutions library and country snapshots\n\n- [Solutions library](${SITE}/solutions/): passive cooling, active cooling, and the plans, rules and money that make protection last, with evidence labels, costs, dry or humid suitability, and what each depends on\n- [The heat economy](${SITE}/heat-economy/): the businesses selling protection from heat, who invests in them, accelerators and prizes, business ideas for each vicious cycle, and what makes a fair market; with CSV downloads\n- [Funding landscape](${SITE}/heat-economy/money/#landscape): funders and programmes relevant to extreme heat, with their access routes, each checked against its official page (also in llms-full.txt)\n- [Open calls and tenders](${SITE}/heat-economy/money/opportunities/): calls, tenders and procurement notices with application status and verification kept apart; CSV download\n- [Careers](${SITE}/heat-economy/money/careers/): jobs, consultancies, research posts and fellowships on extreme heat, each checked against the employer's own page; CSV download\n- [Country snapshots](${SITE}/countries/): Bangladesh, India, Indonesia, Nepal, the Philippines, Sri Lanka and Thailand\n- [The Lancet Countdown 2026, for extreme heat in Asia](${SITE}/lancet-countdown-2026/): the 2026 report's heat findings in plain language, what they mean for cities, health workers, employers, communities, funders and governments, the gaps in the evidence, and all 397 references\n- [How heat is reported](${SITE}/how-heat-is-reported/): how ${require("./media-model.js").stats().unique} news articles on extreme heat in South and Southeast Asia (2018–2026), in two collections, follow protection: an explorer with each reviewed article's reporting trail, examples, comparisons and a question kit; records as CSV and JSON\n- [Sources and references](${SITE}/sources/): every source the site cites, including every headline from Heat in the news\n`);
}

// ---- /sources/: every source the site cites ----
require("./build-sources.js");

// ---- "Funding and opportunities" on topic pages (tools/build-funding.js), once those pages are written ----
require("./build-funding.js").inject();
