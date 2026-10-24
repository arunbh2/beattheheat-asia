/* ==========================================================
   Builds the crawlable, plain-HTML pages and AI-readable files
   from data.js. Run after editing data.js:

       node tools/build-static.js

   The interactive site renders its content with JavaScript, which
   most AI crawlers and some search engines do not run. These pages
   carry the same content as plain HTML, so it can be found, read
   and cited. They are generated: edit data.js, not the pages.
   ========================================================== */
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, ".."), SITE = "https://beattheheat.asia";
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, "data.js"), "utf8") + `
;Object.assign(this, { SYSTEMS, CONSEQUENCES, LINKS, LOOP_GROUPS, LOOPS, INSTITUTIONS, LEVERS, LOOP_PLACES, EVIDENCE, ORG_ROLES,
  ORGANISATIONS, GLOSSARY_GROUPS, GLOSSARY, WORKED_EXAMPLES, AT_RISK, AT_RISK_BARRIERS, STALLS, COOL_PLACES, COOL_TRAPS,
  COOL_EVIDENCE, COOL_VALUE, COOL_READING, COOL_COST_NOTE, COOL_FX, COOL_REGION, HOME_HEATS, STRAIN, COOL_ASK, PLAN_GROUPS, LIVE_FINGERPRINT, LOOP_STAKES, STAKES_LABEL, LIVE_CITIES, CITY_PROFILES, CITY_HAP, HEATWAVES, HEATWAVES_NOTE, ACTION_SETTINGS, ACTION_LINES, ACTION_JOURNEYS, FINANCE, EVIDENCE_STATUS, ACTION_HORIZONS, HEAT_WEEK });`, ctx);
const D = ctx, TODAY = new Date().toISOString().slice(0, 10);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
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
  { slug: "cities", title: "Extreme heat in twelve Asian cities", short: "Cities" },
  { slug: "heatwaves", title: "Heatwaves that shaped South and Southeast Asia, 1998 to 2026", short: "Heatwaves" },
  { slug: "practical-actions", title: "Practical actions against extreme heat, by setting", short: "Practical actions" },
  { slug: "paying-for-protection", title: "Paying for heat protection: who pays, how money arrives, and whether it lasts", short: "Paying for protection" }
];
const LICENCE = "Text, data, films and illustrations © BeatTheHeat.Asia contributors, shared under Creative Commons Attribution 4.0 (CC BY 4.0, https://creativecommons.org/licenses/by/4.0/): you may copy, adapt and translate them, with credit and a link to beattheheat.asia. Code is under the MIT licence. Linked sources, quotations, and organisations’ names and logos remain their owners’ and are not covered.";
const DISCLAIMER = "This is a beta version. BeatTheHeat.Asia is being built by a group of organisations working on extreme heat. It is an independent, work-in-progress project, not an official publication of any one organisation. Listing an organisation does not imply its partnership, affiliation or endorsement. Every claim links to its source; where the evidence is still emerging, the map says so.";

function page(p, intro, body, extraLd) {
  const url = `${SITE}/${p.slug}/`;
  const ld = [{ "@context": "https://schema.org", "@type": "WebPage", name: p.title, url, inLanguage: "en", isPartOf: { "@type": "WebSite", name: "BeatTheHeat.Asia", url: SITE + "/" }, dateModified: TODAY, description: intro, license: "https://creativecommons.org/licenses/by/4.0/", copyrightNotice: "© BeatTheHeat.Asia contributors" },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "BeatTheHeat.Asia", item: SITE + "/" }, ...(p.parent ? [{ "@type": "ListItem", position: 2, name: p.parent.short, item: `${SITE}/${p.parent.slug}/` }] : []),
      { "@type": "ListItem", position: p.parent ? 3 : 2, name: p.short, item: url }] }]
    .concat(extraLd || []);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(p.title)} | BeatTheHeat.Asia</title>
  <meta name="description" content="${esc(intro)}">
  <link rel="canonical" href="${url}">
  <link rel="license" href="https://creativecommons.org/licenses/by/4.0/">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="BeatTheHeat.Asia">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${esc(p.title)}">
  <meta property="og:description" content="${esc(intro)}">
  <meta property="og:image" content="${SITE}/images/social-share-2.jpg">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='15' fill='%23F26430'/%3E%3C/svg%3E">
  <link rel="alternate" type="text/plain" href="${SITE}/llms-full.txt" title="The whole map as plain text">
  <style>
    body{margin:0;font-family:Inter,"Segoe UI",Roboto,Arial,sans-serif;color:#16202B;background:#FAF7F2;line-height:1.55}
    a{color:#16202B;text-decoration-color:#F26430;text-underline-offset:3px}
    header,main,footer{max-width:900px;margin:0 auto;padding:0 20px}
    header{padding-top:22px;display:flex;flex-wrap:wrap;gap:8px 18px;align-items:center;font-size:.9rem}
    header .home{font-weight:800;letter-spacing:.04em;text-decoration:none}
    nav a{margin-right:12px}
    h1{font-family:Anton,Impact,"Arial Narrow",sans-serif;font-weight:400;text-transform:uppercase;font-size:clamp(2rem,1.5rem + 3vw,3.2rem);line-height:1.02;margin:28px 0 10px}
    h2{font-size:1.35rem;margin:34px 0 6px;border-top:2px solid #16202B;padding-top:14px}
    h3{font-size:1.05rem;margin:22px 0 4px}
    .lede{font-size:1.1rem;color:#39424D}
    .src,.meta{font-size:.85rem;color:#5E6570}
    .cta{display:inline-block;margin:14px 0;padding:10px 18px;border-radius:999px;background:#F26430;color:#16202B;font-weight:800;text-decoration:none}
    footer{margin-top:48px;padding-bottom:40px;font-size:.85rem;color:#5E6570;border-top:1px solid #E6DFD4}
    ul{padding-left:20px} li{margin:4px 0}
  </style>
${ld.map(x => `  <script type="application/ld+json">${JSON.stringify(x)}</script>`).join("\n")}
</head>
<body>
  <header><a class="home" href="/">BEAT THE HEAT</a>
    <nav aria-label="Map as text">${PAGES.map(q => `<a href="/${q.slug}/"${q.slug === p.slug ? ' aria-current="page"' : ""}>${esc(q.short)}</a>`).join("")}</nav></header>
  <main>
    <h1>${esc(p.title)}</h1>
    <p class="lede">${esc(intro)}</p>
    <a class="cta" href="/">Open the interactive map</a>
${body}
  </main>
  <footer><p>${esc(DISCLAIMER)}</p><p>Text, data, films and illustrations © BeatTheHeat.Asia contributors, shared under <a rel="license" href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>: copy, adapt and translate them, with credit and a link to beattheheat.asia. Code is under the MIT licence. Linked sources, quotations, and organisations’ names and logos remain their owners’.</p><p>Generated from the map’s data on ${TODAY}. The whole map as plain text: <a href="/llms-full.txt">llms-full.txt</a>.</p></footer>
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
// loops
{
  const p = PAGES[1], intro = `${D.LOOPS.length} vicious cycles in which extreme heat feeds itself, traps people or overwhelms institutions, with where each one plays out in Asia, the evidence, and the actions that could break it.`;
  let h = "", m = [`## ${p.title}`, intro];
  D.LOOP_GROUPS.forEach(g => {
    h += `<h2>${esc(g.name)}</h2>`; m.push(`### ${g.name}`);
    D.LOOPS.filter(l => l.group === g.id).forEach(l => {
      const lv = loopLevers(l), ev = (D.EVIDENCE[l.id] || []);
      h += `<h3 id="${l.id}">${esc(l.name)}</h3><p>${esc(l.summary)}</p>
        <p class="meta">The cycle: ${esc(l.path.map(name).join(" → "))} → back to the start. Evidence: ${l.evidence === "established" ? "well established" : "emerging (each link is evidenced; the full cycle less so)"}.</p>
        ${(x => x ? `<p><strong>${esc(D.STAKES_LABEL[x.kind])} (${esc(x.where)}):</strong> ${esc(x.n)}. ${esc(x.text)} ${ext(x.url, x.by)}</p>${x.sea ? `<p><strong>In Southeast Asia (${esc(x.sea.where)}):</strong> ${esc(x.sea.n)}. ${esc(x.sea.text)} ${ext(x.sea.url, x.sea.by)}</p>` : ""}` : `<p class="meta">${esc(D.STAKES_LABEL.none)}.</p>`)(D.LOOP_STAKES[l.id])}
        ${D.LOOP_PLACES[l.id] ? `<p><strong>Where it plays out:</strong> ${esc(D.LOOP_PLACES[l.id])}</p>` : ""}
        ${lv.length ? `<p><strong>Where it breaks:</strong> ${lv.map(v => `<a href="/actions/#${v.id}">${esc(v.title)}</a>`).join(", ")}</p>` : ""}
        ${ev.length ? `<ul>${ev.map(e => `<li>${esc(e.finding)} ${ext(e.url, e.by)}${e.type ? `<br><span class="meta">${esc(e.type)} · ${esc(e.where)} · ${esc(e.scale)}. Limit: ${esc(e.limit)}</span>${e.reading ? `<br><span class="meta"><strong>Our reading:</strong> ${esc(e.reading)}</span>` : ""}` : ""}</li>`).join("")}</ul>` : ""}
        <p class="meta"><a href="/#loop-${l.id}">Follow it on the map</a>${l.video ? ` · <a href="/${l.video}">Watch the film (${esc(l.length)})</a>` : ""}</p>`;
      m.push(`#### ${l.name}`, l.summary, `The cycle: ${l.path.map(name).join(" → ")} → back to the start.`,
        D.LOOP_STAKES[l.id] ? `${D.STAKES_LABEL[D.LOOP_STAKES[l.id].kind]} (${D.LOOP_STAKES[l.id].where}): ${D.LOOP_STAKES[l.id].n}. ${D.LOOP_STAKES[l.id].text} (${D.LOOP_STAKES[l.id].by}, ${D.LOOP_STAKES[l.id].url})` : `${D.STAKES_LABEL.none}.`,
        D.LOOP_STAKES[l.id] && D.LOOP_STAKES[l.id].sea ? `In Southeast Asia (${D.LOOP_STAKES[l.id].sea.where}): ${D.LOOP_STAKES[l.id].sea.n}. ${D.LOOP_STAKES[l.id].sea.text} (${D.LOOP_STAKES[l.id].sea.by}, ${D.LOOP_STAKES[l.id].sea.url})` : "", D.LOOP_PLACES[l.id] ? `Where it plays out: ${D.LOOP_PLACES[l.id]}` : "",
        lv.length ? `Where it breaks: ${lv.map(v => v.title).join(", ")}` : "", ...ev.map(e => `- ${e.finding} (${e.by}, ${e.url})${e.type ? ` Type: ${e.type}. Where: ${e.where}. Scale: ${e.scale}. Limit: ${e.limit}${e.reading ? ` Our reading: ${e.reading}` : ""}` : ""}`));
    });
  });
  out[p.slug] = page(p, intro, h, [{ "@context": "https://schema.org", "@type": "ItemList", name: "Vicious cycles of extreme heat", numberOfItems: D.LOOPS.length,
    itemListElement: D.LOOPS.map((l, i) => ({ "@type": "ListItem", position: i + 1, name: l.name, description: l.summary, url: `${SITE}/loops/#${l.id}` })) }]);
  md.push(m.filter(Boolean).join("\n\n"));
}
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
      ${(v.guides || []).length ? `<h3>Practical guides</h3><ul>${v.guides.map(g => `<li>${ext(g.url, g.title)} <span class="meta">${esc(g.by)}</span></li>`).join("")}</ul>` : ""}
      <p class="meta"><a href="/#break-${v.id}">See it on the map</a></p>`;
    m.push(`### ${v.title}`, v.text, `Cuts the link: ${name(v.edge[0])} → ${name(v.edge[1])}. Who can act: ${who.join(", ")}.`, ls.length ? `Could help interrupt: ${ls.map(l => l.name).join(", ")}` : "",
      v.example ? `In practice: ${v.example}` : "", ...(v.guides || []).map(g => `- Guide: ${g.title} (${g.by}) ${g.url}`));
  });
  out[p.slug] = page(p, intro, h, [{ "@context": "https://schema.org", "@type": "ItemList", name: "Actions against extreme heat", numberOfItems: D.LEVERS.length,
    itemListElement: D.LEVERS.map((v, i) => ({ "@type": "ListItem", position: i + 1, name: v.title, description: v.text, url: `${SITE}/actions/#${v.id}` })) }]);
  md.push(m.filter(Boolean).join("\n\n"));
}
// who is at risk
{
  const p = PAGES[3], intro = "The same heatwave lands differently. Who is harmed depends on how exposed people are and what stands between them and safety.";
  let h = `<h2>Five questions behind every barrier</h2><ul>${D.AT_RISK_BARRIERS.map(b => `<li><strong>${esc(b.q)}</strong> ${esc(b.a)}</li>`).join("")}</ul>`, m = [`## ${p.title}`, intro, ...D.AT_RISK_BARRIERS.map(b => `- ${b.q} ${b.a}`)];
  D.AT_RISK.forEach(g => {
    const facts = [g.fact ? g : null, ...(g.more || [])].filter(Boolean);
    h += `<h2 id="${g.id}">${esc(g.name)}</h2><p><strong>Exposed to:</strong> ${esc(g.exposure)}</p><p><strong>Held back by:</strong> ${esc(g.barriers)}</p>
      ${facts.map(f => `<p>${esc(f.fact)} ${ext(f.source.url, f.source.label)}</p>`).join("")}
      <p><strong>What helps:</strong> ${g.levers.map(id => lever[id] ? `<a href="/actions/#${id}">${esc(lever[id].title)}</a>` : "").filter(Boolean).join(", ")}</p>`;
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
  out[p.slug] = page(p, intro, h); md.push(m.join("\n\n"));
}
// worked plans
{
  const p = PAGES[5], intro = "How places in Asia have turned heat risk into a plan: what happened, what they decided, what changed, and who leads each action.";
  let h = "", m = [`## ${p.title}`, intro];
  D.WORKED_EXAMPLES.forEach(x => {
    h += `<h2 id="${x.id}">${esc(x.title)}</h2><p class="meta">${esc(x.place)} · ${esc(x.year)}</p>
      <p><strong>What happened:</strong> ${esc(x.trigger)}</p><p><strong>What they decided:</strong> ${esc(x.decision)}</p><p><strong>What changed:</strong> ${esc(x.result)}</p>
      <ul>${x.actions.map(a => `<li><a href="/actions/#${a.lever}">${esc((lever[a.lever] || {}).title || a.lever)}</a>: led by ${esc((inst[a.lead] || {}).name || a.lead)}; paid by ${esc(a.payer)}; ${esc(a.measure)}</li>`).join("")}</ul>${srcs(x.sources)}`;
    m.push(`### ${x.title} (${x.place}, ${x.year})`, `What happened: ${x.trigger}`, `What they decided: ${x.decision}`, `What changed: ${x.result}`, ...x.actions.map(a => `- ${(lever[a.lever] || {}).title}: led by ${(inst[a.lead] || {}).name}; paid by ${a.payer}; ${a.measure}`), ...x.sources.map(s => `Source: ${s.label} ${s.url}`));
  });
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
  const p = PAGES[7], intro = `${D.ORGANISATIONS.length} organisations across Asia and the world already working on parts of the web of extreme heat. Inclusion describes relevant published work. It does not imply partnership, affiliation or endorsement.`;
  let h = "", m = [`## ${p.title}`, intro];
  D.ORG_ROLES.forEach(r => { const os = D.ORGANISATIONS.filter(o => o.role === r.id); if (!os.length) return;
    h += `<h2 id="${r.id}">${esc(r.name)}</h2><ul>${os.map(o => `<li>${ext(o.url, o.name)}: ${esc(o.does)}</li>`).join("")}</ul>`;
    m.push(`### ${r.name}`, ...os.map(o => `- ${o.name}: ${o.does} (${o.url})`)); });
  out[p.slug] = page(p, intro, h); md.push(m.join("\n\n"));
}

// cities: an index page and one page per city
const CITY_PAGES = [];
{
  const p = PAGES[8], live = Object.fromEntries(D.LIVE_CITIES.map(c => [c.id, c]));
  const intro = `What extreme heat is doing in ${D.CITY_PROFILES.length} Asian cities: whether each has a heat plan, the vicious cycles the evidence ties to it, who is hit hardest and who is already at work.`;
  let h = "", m = [`## ${p.title}`, intro];
  D.CITY_PROFILES.forEach(cp => {
    const c = live[cp.id], url = `${SITE}/cities/${cp.id}/`;
    const loops = cp.loops.map(x => ({ l: D.LOOPS.find(l => l.id === x.id), why: x.why })).filter(x => x.l);
    const orgs = cp.orgs.map(id => D.ORGANISATIONS.find(o => o.id === id)).filter(Boolean);
    const exs = cp.examples.map(id => D.WORKED_EXAMPLES.find(x => x.id === id)).filter(Boolean);
    const risks = cp.risk.map(id => D.AT_RISK.find(g => g.id === id)).filter(Boolean);
    const status = D.CITY_HAP[cp.hap.status];
    h += `<h2 id="${cp.id}"><a href="/cities/${cp.id}/">${esc(c.name)}, ${esc(c.country)}</a></h2><p>${esc(cp.tagline)}</p><p class="meta">Heat plan: ${esc(status)}. Cycles tied to it: ${esc(loops.map(x => x.l.name).join(", "))}.</p>`;
    const body = `${cp.heat ? `<p><strong>Heat type:</strong> ${esc(cp.heat)} <a href="/glossary/#dryhumid">Dry heat and humid heat, explained</a>.</p>` : ""}<h2>Heat action plan: ${esc(status)}</h2><p>${esc(cp.hap.text)}</p><p class="src">Sources: ${cp.hap.sources.map(s => ext(s.url, s.label)).join(" · ")}</p>
      <h2>Heat today</h2><p>Live readings and the week’s forecast are on <a href="/#city-${cp.id}">the interactive map</a>. Official warnings: ${ext(c.warn.url, c.warn.label)}. ${D.LIVE_FINGERPRINT ? `How much climate change shaped today’s heat: ${ext(D.LIVE_FINGERPRINT.map.url, D.LIVE_FINGERPRINT.map.label)}.` : ""}</p>
      <h2>Vicious cycles the evidence ties to ${esc(c.name)}</h2>${loops.map(x => `<h3><a href="/loops/#${x.l.id}">${esc(x.l.name)}</a></h3><p>${esc(x.why)}</p><p class="meta">${esc(x.l.summary)} <a href="/#loop-${x.l.id}">Follow it on the map</a>.</p>`).join("")}
      <h2>Who heat hits hardest here</h2><ul>${risks.map(g => `<li><a href="/who-is-at-risk/#${g.id}">${esc(g.name)}</a></li>`).join("")}</ul>
      ${exs.length ? `<h2>A worked plan to learn from</h2>${exs.map(x => `<p><a href="/worked-plans/#${x.id}">${esc(x.title)}</a> (${esc(x.place)}, ${esc(x.year)})</p>`).join("")}` : ""}
      <h2>Already at work here</h2><ul>${orgs.map(o => `<li>${ext(o.url, o.name)}: ${esc(o.does)}</li>`).join("")}</ul><p class="meta">Listing does not imply partnership, affiliation or endorsement.</p>`;
    const cpPage = { slug: `cities/${cp.id}`, title: `Extreme heat in ${c.name}: plans, cycles and who is at work`, short: c.name, parent: p };
    const cIntro = `${cp.tagline} Heat plan: ${status.toLowerCase()}.`;
    CITY_PAGES.push(cpPage);
    out[cpPage.slug] = page(cpPage, cIntro, body, [{ "@context": "https://schema.org", "@type": "City", name: c.name, containedInPlace: { "@type": "Country", name: c.country },
      geo: { "@type": "GeoCoordinates", latitude: c.lat, longitude: c.lon }, url }]);
    m.push(`### ${c.name}, ${c.country}`, cp.tagline, `Heat action plan (${status}): ${cp.hap.text} Sources: ${cp.hap.sources.map(s => `${s.label} ${s.url}`).join("; ")}`,
      ...loops.map(x => `- ${x.l.name}: ${x.why}`), `Who heat hits hardest: ${risks.map(g => g.name).join("; ")}`, `Already at work: ${orgs.map(o => o.name).join("; ")}`, `Page: ${url}`);
  });
  out[p.slug] = page(p, intro, h); md.push(m.join("\n\n"));
}

// heatwaves timeline
{
  const p = PAGES[9], intro = `${D.HEATWAVES.length} major heatwaves across South and Southeast Asia, from Odisha in 1998 to 2026: what happened, what it cost and what changed afterwards. ${D.HEATWAVES_NOTE}`;
  let h = "", m = [`## ${p.title}`, intro];
  D.HEATWAVES.forEach(x => {
    h += `<h2 id="${x.id}">${esc(x.when)}, ${esc(x.place)}: ${esc(x.title)}</h2><p><strong>Peak:</strong> ${esc(x.peak)}. <strong>Toll:</strong> ${esc(x.toll)}.</p><p>${esc(x.what)}</p><p><strong>What changed:</strong> ${esc(x.changed)}</p>
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
  const intro = `${n} practical actions against extreme heat in workplaces, homes, schools, health facilities, markets and neighbourhoods, and what municipalities can do before summer. Each answers eight questions: what to do, who it protects, where it suits, who must act, what it takes to run, the evidence, what could stop it, and what it only works with.`;
  const inst = id => (D.INSTITUTIONS.find(i => i.id === id) || {}).name || id;
  const val = (c, k) => k === "who" ? c.who.map(inst).join(", ") : k === "evidence" ? c.evidence.text : k === "worksIf" ? c.worksIf.join("; ") + "." : c[k];
  let h = `<p class="meta">Evidence labels: ${Object.values(D.EVIDENCE_STATUS).map(x => `<strong>${esc(x.name)}</strong>: ${esc(x.text)}`).join(" ")}</p><p><strong>Start from a question:</strong> ${D.ACTION_JOURNEYS.map(j => j.go === "stalls" ? `<a href="/#stalls">${esc(j.q)}</a>` : j.go === "finance" ? `<a href="/paying-for-protection/">${esc(j.q)}</a>` : `<a href="#${j.go}">${esc(j.q)}</a>`).join(" · ")}</p>`, m = [`## ${p.title}`, intro];
  D.ACTION_SETTINGS.forEach(st => {
    h += `<h2 id="${st.id}">${esc(st.name)}</h2><p>${esc(st.intro)} <a href="/print/actions-${st.id}/">Print these cards</a> · <a href="/#practical-${st.id}">Open them on the map</a>${st.cool ? ` · <a href="/cooling-options/#${st.cool}">Options, costs and traps</a>` : ""}</p>`;
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
  let h = `<h2>What needs paying for, and when must the money arrive?</h2><table><thead><tr><th>Need</th><th>Route to look into</th><th>The question to answer</th></tr></thead><tbody>${F.needs.map(n => `<tr><td>${esc(n.need)}</td><td>${esc(n.route)}</td><td>${esc(n.ask)}</td></tr>`).join("")}</tbody></table><p class="meta">${esc(F.needsNote)}</p>
    <h2>Three triggers, not one</h2><ul>${F.triggers.map(t => `<li><strong>${esc(t.name)}:</strong> ${esc(t.does)} ${esc(t.who)}.</li>`).join("")}</ul><p>${esc(F.triggersNote)}</p>
    <h2>${esc(F.basis.q)}</h2><ul>${F.basis.kinds.map(k => `<li><strong>${esc(k.name)}.</strong> ${esc(k.text)}</li>`).join("")}</ul><p><strong>${esc(F.basis.ask)}</strong> ${esc(F.basis.note)} ${src(F.basis.source)}</p>
    <h2>From trigger to protection</h2><ol>${F.pathway.steps.map(x => `<li>${esc(x)}</li>`).join("")}</ol><p>${esc(F.pathway.note)} ${src(F.pathway.source)}</p>
    <h2>Will it survive the next season?</h2><ul>${F.survive.map(q => `<li>${esc(q)}</li>`).join("")}</ul><p class="meta">${src(F.surviveSource)}</p>
    <h2>What has been tried</h2>${F.cases.map(c => `<h3 id="${c.id}">${esc(c.name)}</h3><p class="meta">${esc(c.where)} · ${esc(c.hazard)}</p><ul><li><strong>Who paid:</strong> ${esc(c.paid)}</li><li><strong>Who received it:</strong> ${esc(c.received)}</li><li><strong>What it made possible:</strong> ${esc(c.enabled)}</li><li><strong>What it left out:</strong> ${esc(c.uncovered)}</li><li><strong>Did it continue?</strong> ${esc(c.continued)}</li><li><strong>Lesson:</strong> ${esc(c.lesson)}</li></ul><p class="meta">Sources: ${c.sources.map(src).join(" · ")}</p>`).join("")}
    <h2>What this evidence can and can’t tell you</h2><p>${esc(F.boundary)} ${src(F.boundarySource)}</p>
    <p><a href="/print/paying-for-protection/">Print the one-pager</a> · <a href="/plan/#plan-step-3">Add who pays to a plan</a></p>`;
  const m = [`## ${p.title}`, intro, "### What needs paying for, and when must the money arrive?", ...F.needs.map(n => `- ${n.need}: ${n.route}. ${n.ask}`), F.needsNote,
    "### Three triggers, not one", ...F.triggers.map(t => `- ${t.name}: ${t.does} ${t.who}.`), F.triggersNote,
    `### ${F.basis.q}`, ...F.basis.kinds.map(k => `- ${k.name}: ${k.text}`), `${F.basis.ask} ${F.basis.note} (${F.basis.source.label}, ${F.basis.source.url})`,
    "### From trigger to protection", F.pathway.steps.join(" → "), `${F.pathway.note} (${F.pathway.source.label}, ${F.pathway.source.url})`,
    "### Will it survive the next season?", ...F.survive.map(q => `- ${q}`),
    "### What has been tried", ...F.cases.flatMap(c => [`#### ${c.name} (${c.where}; ${c.hazard})`, `Who paid: ${c.paid}`, `Who received it: ${c.received}`, `What it made possible: ${c.enabled}`, `What it left out: ${c.uncovered}`, `Did it continue? ${c.continued}`, `Lesson: ${c.lesson}`, ...c.sources.map(x => `Source: ${x.label} ${x.url}`)]),
    "### What this evidence can and can’t tell you", `${F.boundary} (${F.boundarySource.label}, ${F.boundarySource.url})`];
  out[p.slug] = page(p, intro, h); md.push(m.join("\n\n"));
}

// ---- write the pages ----
[...PAGES, ...CITY_PAGES].forEach(p => { const dir = path.join(ROOT, p.slug); fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, "index.html"), out[p.slug]); });

// ---- llms.txt: a short guide for AI systems; llms-full.txt: the whole map as text ----
const about = `> An interactive systems map of extreme heat in Asia: how heat ripples through ${D.SYSTEMS.length} systems and ${D.CONSEQUENCES.length} consequences, the ${D.LOOPS.length} vicious cycles that make it worse, the ${D.LEVERS.length} actions that could break them, and the ${D.INSTITUTIONS.length} kinds of institution that hold those levers. Every claim links to its source.`;
fs.writeFileSync(path.join(ROOT, "llms.txt"), `# BeatTheHeat.Asia

${about}

${DISCLAIMER}

${LICENCE}

The interactive map is at ${SITE}/ and needs JavaScript. The pages below carry the same content as plain HTML.

## The map as text

${PAGES.map(p => `- [${p.short}](${SITE}/${p.slug}/): ${p.title}`).join("\n")}

## Cities

${CITY_PAGES.map(p => `- [${p.short}](${SITE}/${p.slug}/): ${p.title}`).join("\n")}

## Optional

- [The whole map in one file](${SITE}/llms-full.txt): every page above as plain text, for reading in one go
`);
fs.writeFileSync(path.join(ROOT, "llms-full.txt"), `# BeatTheHeat.Asia: the whole map as text\n\n${about}\n\n${DISCLAIMER}\n\n${LICENCE}\n\nInteractive map: ${SITE}/ · Generated ${TODAY}\n\n${md.join("\n\n")}\n`);

// ---- sitemap.xml and robots.txt ----
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE}/</loc><lastmod>${TODAY}</lastmod><priority>1.0</priority></url>
  <url><loc>${SITE}/a-week-in-the-heat/</loc><lastmod>${TODAY}</lastmod><priority>0.9</priority></url>
  <url><loc>${SITE}/plan/</loc><lastmod>${TODAY}</lastmod><priority>0.9</priority></url>
  <url><loc>${SITE}/together/</loc><lastmod>${TODAY}</lastmod><priority>0.9</priority></url>
${[...PAGES, ...CITY_PAGES].map(p => `  <url><loc>${SITE}/${p.slug}/</loc><lastmod>${TODAY}</lastmod><priority>0.8</priority></url>`).join("\n")}
</urlset>
`);
const BOTS = ["Googlebot", "Bingbot", "Google-Extended", "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User", "Applebot", "Applebot-Extended", "CCBot", "DuckDuckBot", "Meta-ExternalAgent"];
fs.writeFileSync(path.join(ROOT, "robots.txt"), `# BeatTheHeat.Asia welcomes search engines and AI systems, for search, answers and training.
# The pages under /the-web/, /loops/, /actions/ and the others carry the map's content as plain HTML;
# /llms.txt and /llms-full.txt describe the site for AI systems.

User-agent: *
Allow: /

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
});
console.log("Wrote", PAGES.length + CITY_PAGES.length, "pages, llms.txt, llms-full.txt, sitemap.xml and robots.txt");
