// El Niño and heat in Asia (/el-nino/): an explainer for municipal staff, community organisations, employers, researchers and
// funders. Words come from tools/el-nino-explainer-text.js; the current outlook comes from the shared record (tools/enso-outlook.js),
// the same one the El Niño watch on /signals/ shows. The build stops, naming the claim, unless every claim the page uses passed the
// GitHub source check. The page reads in full without JavaScript: the schematic shows all three states, every region and every
// role are listed; el-nino/el-nino.js turns them into toggles. Called by tools/build-pages.js.
"use strict";
const SH = require("./shared-heat-text.js");
const fs = require("fs"), path = require("path");
const T = require("./el-nino-explainer-text.js"), EO = require("./enso-outlook.js");
const ROOT = path.join(__dirname, "..");
const PUBLIC = { "rohini-xml": "https://pmc.ncbi.nlm.nih.gov/articles/PMC4872222/" };

function load() {
  const { C, OK, SRC } = EO.load();
  const used = T.claimsUsed();
  const miss = used.enso.filter(id => !OK[id]);
  if (miss.length) throw new Error(`el-nino: claim ${miss.join(", ")} has not passed the source check (research/2026-11/enso-asia/confirmed.json)`);
  const CB = path.join(ROOT, "research", "2026-11", "el-nino-cities");
  const OKc = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(CB, "confirmed.json"), "utf8")).map(c => [c.id, c]));
  const Cc = JSON.parse(fs.readFileSync(path.join(CB, "claims.json"), "utf8"));
  const missC = used.cities.filter(id => !OKc[id]);
  if (missC.length) throw new Error(`el-nino: claim ${missC.join(", ")} has not passed the source check (research/2026-11/el-nino-cities/confirmed.json)`);
  const SRCc = Object.fromEntries(Cc.sources.map(s => [s.key, Object.assign({}, s, { url: PUBLIC[s.key] || s.url })]));
  return { C, OK, SRC, OKc, SRCc, Cc };
}

// the schematic: one SVG per state, drawn from a few numbers so all three stay consistent (illustrative, not to scale)
function schematic(state, esc) {
  const S = { neutral: { tw: 0.6, west: 268, east: 196, up: 2, rain: 150, sink: 0, cloud: 1, nw: 3 },
    elnino: { tw: 0.2, west: 230, east: 240, up: 0, rain: 470, sink: 90, cloud: 1, nw: 2, rainLeft: true },
    lanina: { tw: 1, west: 290, east: 184, up: 3, rain: 120, sink: 0, cloud: 1.3, nw: 3 } }[state];
  const label = T.SCHEMATIC.states[state].label, id = `enx-sv-${state}`;
  // trade-wind arrows sit at one height and keep clear of the rising and sinking air
  const xs = [560, 440, 320, 210].filter(x => Math.abs(x - S.rain) > 110 && (!S.sink || Math.abs(x - S.sink) > 110)).slice(0, S.nw);
  const len = 40 + 70 * S.tw;
  const winds = xs.map(x => `<g class="enx-wind"><line x1="${x + len / 2}" y1="140" x2="${x - len / 2 + 8}" y2="140" /><path d="M${x - len / 2} 140 l12 -7 v14 z" /></g>`).join("");
  const ups = [580, 610, 550].slice(0, S.up).map(x => `<g class="enx-up"><line x1="${x}" y1="304" x2="${x}" y2="${S.east + 16}" /><path d="M${x} ${S.east + 6} l-7 12 h14 z" /></g>`).join("");
  const cloud = (cx, k) => `<g class="enx-cloud" transform="translate(${cx} 58) scale(${k})"><ellipse cx="0" cy="0" rx="34" ry="16" /><ellipse cx="-20" cy="6" rx="20" ry="12" /><ellipse cx="22" cy="6" rx="22" ry="12" />
    <g class="enx-rain"><line x1="-16" y1="22" x2="-20" y2="36" /><line x1="0" y1="22" x2="-4" y2="36" /><line x1="16" y1="22" x2="12" y2="36" /></g></g>`;
  const windLabel = state === "elnino" ? "Trade winds weaken" : state === "lanina" ? "Trade winds strengthen" : "Trade winds";
  const wl = xs.length ? Math.max(...xs) : 440;
  return `<svg class="enx-svg" viewBox="0 0 640 340" role="img" aria-labelledby="${id}-t ${id}-d" focusable="false">
    <title id="${id}-t">${esc(label)}: illustrative cross-section of the tropical Pacific</title><desc id="${id}-d">${esc(T.SCHEMATIC.states[state].text)}</desc>
    <rect class="enx-sky" x="0" y="0" width="640" height="170" /><rect class="enx-sea" x="0" y="170" width="640" height="170" />
    <polygon class="enx-warm" points="0,170 640,170 640,${S.east} 0,${S.west}" />
    <line class="enx-thermo" x1="0" y1="${S.west}" x2="640" y2="${S.east}" />
    <text class="enx-t" x="14" y="198">Warm water</text>
    <text class="enx-t enx-t--s" x="300" y="${(S.west + S.east) / 2 + 28}" text-anchor="middle">Thermocline</text>
    ${winds}${S.rainLeft ? `<text class="enx-t" x="${Math.min(...xs) - len / 2}" y="122">${windLabel}</text>` : `<text class="enx-t" x="${wl + len / 2}" y="122" text-anchor="end">${windLabel}</text>`}
    ${ups}<text class="enx-t enx-t--s" x="626" y="332" text-anchor="end">${S.up ? "Cold water upwells" : "Upwelling weakens"}</text>
    ${cloud(S.rain, S.cloud)}<g class="enx-rise"><line x1="${S.rain}" y1="164" x2="${S.rain}" y2="104" /><path d="M${S.rain} 98 l-6 11 h12 z" /></g>
    <text class="enx-t enx-t--s" x="${S.rainLeft ? S.rain - 46 * S.cloud - 10 : S.rain + 46 * S.cloud + 10}" y="64"${S.rainLeft ? ' text-anchor="end"' : ""}>Rising air, rain</text>
    ${S.sink ? `<g class="enx-sink"><line x1="${S.sink}" y1="50" x2="${S.sink}" y2="156" /><path d="M${S.sink} 164 l-6 -11 h12 z" /></g><text class="enx-t enx-t--s" x="${S.sink + 14}" y="80">Sinking,</text><text class="enx-t enx-t--s" x="${S.sink + 14}" y="102">drier air</text>` : ""}
    <text class="enx-t enx-t--b" x="10" y="24">West: Indonesia</text><text class="enx-t enx-t--b" x="630" y="24" text-anchor="end">East: S. America</text>
  </svg>`;
}

module.exports = function elNinoExplainer({ page, write, esc, hero, V }) {
  const { SRC, SRCc } = load();
  const today = new Date().toISOString().slice(0, 10);
  const e = s => esc(s);
  const ext = (u, l) => `<a href="${e(u)}" target="_blank" rel="noopener">${e(l)}<span class="visually-hidden"> (opens in a new tab)</span></a>`;
  const C = JSON.parse(fs.readFileSync(path.join(ROOT, "research", "2026-11", "enso-asia", "claims.json"), "utf8"));
  const claimSrc = id => { const c = C.claims.find(x => x.id === id); if (c) return [...new Set(c.rests_on.map(r => r[0]))].map(k => SRC[k]);
    const cc = require(path.join(ROOT, "research", "2026-11", "el-nino-cities", "claims.json")).claims.find(x => x.id === id); return cc ? [...new Set(cc.rests_on.map(r => r[0]))].map(k => SRCc[k]) : []; };
  const cite = ids => { const seen = new Set(), list = ids.flatMap(claimSrc).filter(s => s && !seen.has(s.url) && seen.add(s.url));
    return list.length ? `<p class="enx-cite">Sources: ${list.map(s => ext(s.url, `${s.publisher}${s.issued ? `, ${EO.date(s.issued)}` : s.year ? `, ${s.year}` : ""}`)).join(" · ")}</p>` : ""; };
  const kicker = (n, l) => `<p class="enx-kicker" aria-hidden="true"><span>${n}</span>${e(l)}</p>`;
  const O = EO.load().O;

  const body = `${hero("Understand heat", e(T.TITLE), e(T.SUB))}
  <section class="container enx-sec enx-first" aria-labelledby="enx-two-h">
    <div class="enx-two"><h2 class="enx-two__h" id="enx-two-h">In two minutes</h2>
      <ul>${T.SUMMARY.map(x => `<li>${e(x)}</li>`).join("")}</ul>
      <p class="enx-two__now"><b>Current bulletin:</b> ${e(O.status.issuer)}, issued ${e(EO.date(O.status.issued))}: ${e(O.status.label)}. ${e(O.status.forecast)} <a href="#outlook">How to read it</a></p>
      ${cite(T.SUMMARY_CLAIMS)}</div>
    <nav class="enx-toc" aria-label="On this page"><ol>${T.TOC.map(([id, t], i) => `<li><a href="#${id}"><span aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>${e(t)}</a></li>`).join("")}</ol></nav>
    <p class="enx-print"><a class="btn btn--sm" href="/print/el-nino-briefing/">Printable briefing (A4)</a></p>
  </section>

  <section class="container enx-sec" id="start" aria-labelledby="enx-start-h">${kicker("01", "An ordinary decision")}
    <h2 class="hub-h" id="enx-start-h">What to prepare before the warnings arrive</h2>
    <div class="enx-illu"><span class="enx-tag">${e(T.OPENING.label)}</span><p>${e(T.OPENING.story)}</p></div>
    <div class="enx-pair"><div><h3>What the outlook gives</h3><p>${e(T.OPENING.gives)}</p></div><div><h3>What the team still needs</h3><p>${e(T.OPENING.needs)}</p></div></div>
    ${cite(T.OPENING.claims)}
  </section>

  <section class="container enx-sec" id="what" aria-labelledby="enx-what-h">${kicker("02", "The science")}
    <h2 class="hub-h" id="enx-what-h">What El Niño is</h2>
    ${T.WHAT.slice(0, 3).map(w => `<h3 class="enx-h3">${e(w.h)}</h3>${w.p.map(p => `<p>${e(p)}</p>`).join("")}${cite(w.claims)}`).join("")}
    <figure class="enx-fig" id="schematic" aria-labelledby="enx-fig-cap">
      <div class="enx-switch" role="radiogroup" aria-label="Pacific conditions" hidden>${Object.entries(T.SCHEMATIC.states).map(([k, s], i) => `<label><input type="radio" name="enx-state" value="${k}"${i === 0 ? " checked" : ""}> ${e(s.label)}</label>`).join("")}</div>
      <div class="enx-states">${Object.keys(T.SCHEMATIC.states).map(k => `<div class="enx-state" data-state="${k}"><p class="enx-state__h">${e(T.SCHEMATIC.states[k].label)}</p>${schematic(k, e)}<p class="enx-state__t" id="enx-st-${k}">${e(T.SCHEMATIC.states[k].text)}</p></div>`).join("")}</div>
      <figcaption id="enx-fig-cap"><span class="enx-tag">Illustrative</span> ${e(T.SCHEMATIC.note)}</figcaption>
    </figure>
    ${cite(T.SCHEMATIC.claims)}
    ${T.WHAT.slice(3).map(w => `<h3 class="enx-h3">${e(w.h)}</h3>${w.p.map(p => `<p>${e(p)}</p>`).join("")}${cite(w.claims)}`).join("")}
    <p class="enx-small">Indices: ${ext(SRC["noaa-roni"].url, "NOAA's RONI and its definition")} · ${ext("https://cpc.ncep.noaa.gov/products/analysis_monitoring/enso/oni/v6/", "the older Oceanic Niño Index (ONI)")}</p>
  </section>

  <section class="container enx-sec" id="asia" aria-labelledby="enx-asia-h">${kicker("03", "Across the region")}
    <h2 class="hub-h" id="enx-asia-h">How a change in the Pacific reaches Asia</h2>
    ${T.ASIA.map(w => `<h3 class="enx-h3">${e(w.h)}</h3>${w.p.map(p => `<p>${e(p)}</p>`).join("")}${cite(w.claims)}`).join("")}
  </section>

  <section class="container enx-sec" id="regions" aria-labelledby="enx-reg-h">${kicker("04", "Five regions")}
    <h2 class="hub-h" id="enx-reg-h">South and Southeast Asia, region by region</h2>
    <p>Each region keeps to what its own sources show. Historical patterns are kept apart from this season's outlook, and nothing here is extended from one region to another.</p>
    <div class="enx-tabs" role="tablist" aria-label="Choose a region" hidden>${T.REGIONS.map((r, i) => `<button type="button" role="tab" id="enx-tab-${r.id}" aria-controls="region-${r.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${e(r.name)}</button>`).join("")}</div>
    ${T.REGIONS.map(r => `<section class="enx-region" id="region-${r.id}" aria-labelledby="enx-reg-${r.id}-h">
      <h3 class="enx-region__h" id="enx-reg-${r.id}-h">${e(r.name)}</h3>
      <dl class="enx-dl">
        <div><dt><span class="enx-tag enx-tag--hist">Historical pattern</span></dt><dd>${e(r.typical)}${cite(r.typicalClaims)}</dd></div>
        <div><dt><span class="enx-tag enx-tag--fc">This season</span></dt><dd>${e(r.now)}${cite(r.nowClaims)}</dd></div>
        <div><dt><span class="enx-tag enx-tag--limit">Cannot be inferred</span></dt><dd>${e(r.cannot)}</dd></div>
        <div><dt>National or regional service</dt><dd>${ext(r.service[1], r.service[0])}${r.service2 ? ` · ${ext(r.service2[1], r.service2[0])}` : ""}</dd></div>
        <div><dt>A question to prepare</dt><dd><b>${e(r.question)}</b></dd></div>
      </dl></section>`).join("")}
  </section>

  <section class="container enx-sec" id="daily" aria-labelledby="enx-daily-h">${kicker("05", "Daily life")}
    <h2 class="hub-h" id="enx-daily-h">How it can travel through daily life</h2>
    <p>Each chain below may happen; whether it does depends on local conditions, which are what preparation can change.</p>
    <ol class="enx-paths">${T.PATHWAYS.map(p => `<li><p class="enx-chain">${p.chain.map((c, i) => `<span>${e(c)}</span>${i < p.chain.length - 1 ? '<i aria-hidden="true">→</i><span class="visually-hidden">, which can lead to </span>' : ""}`).join("")}</p><p>${e(p.when)}</p><p class="enx-small">On Common Shade: ${p.links.map(([u, t]) => `<a href="${e(u)}">${e(t)}</a>`).join(" · ")}</p>${p.claims ? cite(p.claims) : ""}</li>`).join("")}</ol>
    <h3 class="enx-h3">Where the pathways meet</h3><p>${e(SH.ELNINO)} <a href="/${SH.SLUG}/">${e(SH.INTRO.go[1])}</a>.</p>
    <h3 class="enx-h3">Who has fewer choices</h3><p>${e(T.WHO)}</p>
    <div class="enx-illu"><span class="enx-tag">${e(T.HOUSEHOLD.label)}</span><p>${e(T.HOUSEHOLD.text)}</p></div>
  </section>

  <section class="container enx-sec" id="outlook" aria-labelledby="enso-watch-explainer-h">${kicker("06", "The current outlook")}
    ${EO.panel(e, { today, headingId: "enso-watch-explainer-h", links: false })}
    <h3 class="enx-h3">Four probabilities that are easy to confuse</h3>
    <div class="enx-read">${T.READ.map(r => `<div><h4>${e(r.h)}</h4><p>${e(r.d)}</p><p class="enx-small">${e(r.ex)}</p></div>`).join("")}</div>
    ${cite(T.READ_CLAIMS)}
    <h3 class="enx-h3">Uncertainty, and long-term warming</h3>${T.UNCERTAINTY.p.map(p => `<p>${e(p)}</p>`).join("")}${cite(T.UNCERTAINTY.claims)}
    <h3 class="enx-h3">When bulletins seem to disagree</h3><p>${e(T.DISAGREE)}</p>
    ${EO.table(e)}
    <p class="enx-small">The El Niño watch on <a href="/signals/#el-nino-watch">Signals</a> shows the same bulletin.</p>
  </section>

  <section class="container enx-sec" id="prepare" aria-labelledby="enx-prep-h">${kicker("07", "Preparation")}
    <h2 class="hub-h" id="enx-prep-h">From outlook to preparation</h2>
    <div class="enx-tablewrap" role="region" aria-label="Preparation by timescale" tabindex="0"><table class="enx-table"><caption>What to prepare, by how far ahead (roles are illustrative; confirm local mandates)</caption>
      <thead><tr><th scope="col">When</th><th scope="col">What to do</th><th scope="col">Who might lead</th><th scope="col">Confirm locally</th></tr></thead>
      <tbody>${T.STEPS.map(s => `<tr><th scope="row">${e(s.when)}</th><td data-label="What to do">${e(s.do)}</td><td data-label="Who might lead">${e(s.who)}</td><td data-label="Confirm locally">${e(s.confirm)}</td></tr>`).join("")}</tbody></table></div>
    <p>${e(T.STEPS_NOTE)}</p>
    <h3 class="enx-h3" id="enx-role-h">What decision are you making?</h3>
    <div class="enx-roleswitch" role="radiogroup" aria-labelledby="enx-role-h" hidden>${T.ROLES.map((r, i) => `<label><input type="radio" name="enx-role" value="${r.id}"${i === 0 ? " checked" : ""}> ${e(r.label)}</label>`).join("")}</div>
    ${T.ROLES.map(r => `<section class="enx-role" data-role="${r.id}" aria-labelledby="enx-role-${r.id}"><h4 id="enx-role-${r.id}">${e(r.label)}</h4><ul class="enx-check">${r.items.map(x => `<li>${e(x)}</li>`).join("")}</ul>
      <p class="enx-small">On Common Shade: ${r.links.map(([u, t]) => `<a href="${e(u)}">${e(t)}</a>`).join(" · ")}</p></section>`).join("")}
    <p class="enx-small">Check your own service: ${T.ROLE_SERVICES.map(([n, u]) => ext(u, n)).join(" · ")}. The list organises guidance; it does not calculate any local risk.</p>
  </section>

  <section class="container enx-sec" id="faq" aria-labelledby="enx-faq-h">${kicker("08", "Questions")}
    <h2 class="hub-h" id="enx-faq-h">Questions that improve decisions</h2>
    ${T.FAQ.map(f => `<details class="enx-faq"><summary>${e(f.q)}</summary><p>${e(f.a)}</p>${cite(f.claims)}</details>`).join("")}
  </section>

  <section class="container enx-sec" id="sources" aria-labelledby="enx-src-h">
    <h2 class="hub-h" id="enx-src-h">Sources and how they were checked</h2>
    <p class="enx-small">Each source below was opened by the GitHub source check, and a claim reaches this page only when every term it rests on was found. A page that only opened is not evidence. Sources were last checked on ${e(EO.date(O.checked))}.</p>
    <ul class="enx-srcs">${C.sources.map(s => `<li>${ext(s.url, `${s.publisher}: ${s.title}`)}<span>${[s.issued ? `issued ${EO.date(s.issued)}` : s.year, s.geography, s.variable, s.index].filter(Boolean).map(e).join(" · ")}</span></li>`).join("")}</ul>
    <p class="enx-small">The claim ledger is <a href="/research/2026-11/enso-asia/claims.json">claims.json</a>; what passed is in <a href="/research/2026-11/enso-asia/confirmed.json">confirmed.json</a>. See something to correct? <a href="/join/#join-form">Tell us</a>; corrections are listed on <a href="/corrections/">Corrections</a>.</p>
  </section>`;
  const head = `\n  <link rel="stylesheet" href="/el-nino/watch.css?v=${V}"><link rel="stylesheet" href="/el-nino/el-nino.css?v=${V}"><script src="/el-nino/el-nino.js?v=${V}" defer></script>`;
  write(T.SLUG, page(T.SLUG, T.TITLE, T.DESC, body, head));
};

module.exports.md = SITE => {
  const { SRC } = load();
  const ps = a => a.map(w => [`### ${w.h}`, ...w.p]).flat();
  return [`## ${T.TITLE}`, `${SITE}/${T.SLUG}/`, T.SUB, T.DESC, "### In two minutes", ...T.SUMMARY.map(x => `- ${x}`),
    "### An ordinary decision (illustrative)", T.OPENING.story, `What the outlook gives: ${T.OPENING.gives}`, `What the team still needs: ${T.OPENING.needs}`,
    "### What El Niño is", ...ps(T.WHAT), `Schematic (illustrative): ${Object.values(T.SCHEMATIC.states).map(s => `${s.label}: ${s.text}`).join(" ")}`,
    "### How a change in the Pacific reaches Asia", ...ps(T.ASIA),
    "### South and Southeast Asia, region by region", ...T.REGIONS.map(r => `- ${r.name}. Historical pattern: ${r.typical} This season: ${r.now} Cannot be inferred: ${r.cannot} Service: ${r.service[0]} (${r.service[1]})${r.service2 ? `; ${r.service2[0]} (${r.service2[1]})` : ""}. Question: ${r.question}`),
    "### How it can travel through daily life", ...T.PATHWAYS.map(p => `- ${p.chain.join(" -> ")}. ${p.when}`), `Where the pathways meet: ${SH.ELNINO}`, T.WHO, `Illustrative: ${T.HOUSEHOLD.text}`,
    "### The current outlook", EO.md(SITE), ...T.READ.map(r => `- ${r.h}: ${r.d} Example: ${r.ex}`), ...T.UNCERTAINTY.p, T.DISAGREE,
    "### From outlook to preparation", ...T.STEPS.map(s => `- ${s.when}: ${s.do} Who might lead: ${s.who}. Confirm locally: ${s.confirm}.`), T.STEPS_NOTE,
    ...T.ROLES.map(r => `- ${r.label}: ${r.items.join(" ")}`),
    "### Questions", ...T.FAQ.map(f => `- ${f.q} ${f.a}`),
    `Sources: ${Object.values(SRC).map(s => `${s.publisher}, ${s.title}${s.issued ? ` (issued ${EO.date(s.issued)})` : ""}: ${s.url}`).join("; ")}`].join("\n\n");
};
