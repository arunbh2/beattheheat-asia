// Heat from field to factory (/cotton-and-heat/): cotton in Asia as the first worked example of heat across an
// agricultural value chain. Words come from tools/cotton-heat-text.js (shared with llms-full.txt). Claims come from two
// checked batches: research/2026-11/cotton-heat and research/2026-11/factory-heat (occupational guidance reused).
// Only claims in their confirmed.json files reach the page; a passage resting on an unconfirmed claim is left out and
// named in the build log, and an intervention with no checked evidence shows as a proposal requiring validation.
// The page reads in full without JavaScript; cotton.js adds the stage stepper, the three views, the explorer and printing
// of selected interventions. Called by tools/build-pages.js; md() by tools/build-static.js.
"use strict";
const fs = require("fs"), path = require("path");
const T = require("./cotton-heat-text.js");
const BATCHES = ["cotton-heat", "factory-heat"].map(b => path.join(__dirname, "..", "research", "2026-11", b));
const PUBLIC = { trial: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7618560/" };

function load() {
  const OK = new Set(), SRC = {}, CL = {};
  for (const B of BATCHES) {
    const C = JSON.parse(fs.readFileSync(path.join(B, "claims.json"), "utf8"));
    C.sources.forEach(s => { SRC[s.key] = Object.assign({}, s, { url: PUBLIC[s.key] || s.url }); });
    C.claims.forEach(c => { CL[c.id] = c; });
    const f = path.join(B, "confirmed.json");
    if (fs.existsSync(f)) JSON.parse(fs.readFileSync(f, "utf8")).forEach(c => OK.add(c.id));
  }
  return { OK, SRC, CL };
}

module.exports = function cottonHeat({ page, write, esc, hero, V }) {
  const { OK, SRC, CL } = load();
  const left = new Set();
  const all = ids => { const miss = (ids || []).filter(id => !OK.has(id)); miss.forEach(m => left.add(m)); return !miss.length; };
  const shown = x => !x.claims || all(x.claims);
  const ext = (url, text) => `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(text)}<span class="visually-hidden"> (opens in a new tab)</span></a>`;
  const keysOf = ids => [...new Set((ids || []).filter(id => OK.has(id)).flatMap(id => CL[id].rests_on.map(([k]) => k)))];
  const srcLinks = ids => keysOf(ids).map(k => ext(SRC[k].url, `${SRC[k].publisher}, ${SRC[k].year}`)).join("; ");
  const srcFold = (ids, what = "Sources for this section") => { const ks = keysOf(ids); return ks.length ? `<details class="ct-src"><summary>${esc(what)} (${ks.length})</summary><ul>${ks.map(k => `<li>${ext(SRC[k].url, `${SRC[k].publisher}: ${SRC[k].title} (${SRC[k].year})`)} <span class="ct-src__k">${esc(SRC[k].kind)} · ${esc(SRC[k].where)}</span></li>`).join("")}</ul></details>` : ""; };
  const tag = (label, kind) => `<span class="ct-tag ct-tag--${kind}">${esc(label)}</span>`;
  const kicker = (n, label) => `<p class="ct-kicker" aria-hidden="true"><span>${n}</span>${esc(label)}</p>`;
  // a passage keeps only the sentences its confirmed claims support: when any claim is missing, the passage is dropped
  const para = (text, claims) => all(claims) ? esc(text) : "";
  const evOf = r => { const ev = r.ev.map(e => Object.assign({}, e, { claims: e.claims.filter(id => OK.has(id)) })).filter(e => e.claims.length);
    return ev.length ? ev : [{ k: "proposal", claims: [], note: r.ev.length ? "Its sources have not yet passed Common Shade's automated check." : "No checked source on this page yet." }]; };
  const REC = Object.fromEntries(T.RECORDS.map(r => [r.id, r]));
  const STAGE = Object.fromEntries(T.STAGES.map(s => [s.id, s]));
  const VIEWS = [["work", "Work and exposure"], ["pay", "Pay and protection"], ["act", "Who can act"]];

  // 1. opening
  const opening = `
  <section class="container ct-sec ct-open" aria-labelledby="ct-open-h">
    <h2 class="visually-hidden" id="ct-open-h">Why this page</h2>
    <p class="ct-lede">${esc(T.OPEN.p1)}</p>
    <p class="ct-lede">${esc(T.OPEN.p2)}</p>
    <div class="ct-q"><p class="ct-q__label">The question this page keeps asking</p><p class="ct-q__text">${esc(T.QUESTION)}</p></div>
    <p class="ct-actions"><a class="btn" href="#journey">Follow the cotton</a> <a class="btn btn--ghost ct-btn2" href="#protections">Find protections</a> <a class="ct-ctx" href="/factory-heat/">Explore heat inside factories <span aria-hidden="true">→</span></a></p>
    <p class="ct-note">${tag("Illustrative map", "illus")} ${esc(T.OPEN.note)}</p>
  </section>`;

  // 2. the journey: a stepper of stages, each with three views
  const viewBody = (s, v) => {
    if (v === "work") return `<dl class="ct-dl"><div><dt>What work happens</dt><dd>${esc(s.work)}</dd></div>
      <div><dt>Who may do it</dt><dd>${shown({ claims: s.whoClaims }) ? esc(s.who) : esc(s.who.split(". In a")[0] + ".")}</dd></div>
      <div><dt>How heat exposure occurs</dt><dd>${shown({ claims: s.exposureClaims }) ? esc(s.exposure) : esc(s.exposure.split(". ")[0] + ".")}</dd></div></dl>`;
    if (v === "pay") return `<dl class="ct-dl"><div><dt>What can make protection difficult</dt><dd>${shown({ claims: s.barrierClaims }) ? esc(s.barriers) : esc(s.barriers.split(";")[0] + ".")}</dd></div>
      <div><dt>What could change</dt><dd>${esc(s.change)}</dd></div></dl>`;
    return `<dl class="ct-dl"><div><dt>Who controls that change</dt><dd>${esc(s.control)}</dd></div>
      <div><dt>Evidence and uncertainties</dt><dd>${esc(s.uncertain)}${keysOf([...(s.whoClaims || []), ...(s.exposureClaims || []), ...(s.barrierClaims || []), ...(s.evidence || [])]).length ? ` Sources: ${srcLinks([...(s.whoClaims || []), ...(s.exposureClaims || []), ...(s.barrierClaims || []), ...(s.evidence || [])])}.` : ""}</dd></div></dl>`;
  };
  const journey = `
  <section class="container ct-sec" id="journey" aria-labelledby="ct-journey-h">
    ${kicker("01", "The cotton journey")}
    <h2 class="hub-h" id="ct-journey-h">Follow the cotton</h2>
    <p>Seven stages, from field to garment. The first four, where informal work is most common and evidence is thinnest, get the most depth; spinning, fabric and garments link to Heat inside factories for indoor controls.</p>
    <details class="ct-chain"><summary>How the chain works, in five lines</summary><ul>${T.CHAIN_NOTES.items.map(i => `<li>${esc(i)}</li>`).join("")}</ul>${srcFold(T.CHAIN_NOTES.claims, "Sources")}</details>
    <div class="ct-views" role="group" aria-label="Choose a view" hidden>${VIEWS.map(([id, l], i) => `<button type="button" class="ct-view" data-view="${id}" aria-pressed="${i ? "false" : "true"}">${esc(l)}</button>`).join("")}</div>
    <div class="ct-journey">
      <ol class="ct-steps" aria-label="Stages">${T.STAGES.map(s => `<li><a class="ct-step ct-step--${s.depth}" href="#stage-${esc(s.id)}" data-stage="${esc(s.id)}"><span class="ct-step__l" aria-hidden="true">${esc(s.letter)}</span><span>${esc(s.short)}</span></a></li>`).join("")}</ol>
      <div class="ct-stages">${T.STAGES.map(s => `
        <article class="ct-stage" id="stage-${esc(s.id)}" tabindex="-1" aria-labelledby="stage-${esc(s.id)}-h">
          <h3 id="stage-${esc(s.id)}-h"><span aria-hidden="true">${esc(s.letter)}</span> ${esc(s.t)}</h3>
          ${VIEWS.map(([v, l]) => `<section class="ct-vbox" data-view="${v}" aria-label="${esc(l)}"><h4 class="ct-vbox__h">${esc(l)}</h4>${viewBody(s, v)}</section>`).join("")}
          ${s.factory ? `<p class="ct-tofactory"><a href="${esc(s.factory[0])}">${esc(s.factory[1])} <span aria-hidden="true">→</span></a></p>` : ""}
        </article>`).join("")}
      </div>
    </div>
    <aside class="cs-card ct-factory" aria-labelledby="ct-fact-h"><h3 id="ct-fact-h">${esc(T.FACTORY_CARD.h)}</h3><p>${esc(T.FACTORY_CARD.p)}</p><p><a class="btn" href="${esc(T.FACTORY_CARD.href)}">${esc(T.FACTORY_CARD.go)}</a> <a class="ct-ctx" href="/factory-heat/#other-factories">Spinning, weaving and dyeing <span aria-hidden="true">→</span></a></p></aside>
  </section>`;

  // 3. three pathways
  const pathways = `
  <section class="container ct-sec" id="pathways" aria-labelledby="ct-path-h">
    ${kicker("02", "Three pathways")}
    <h2 class="hub-h" id="ct-path-h">People, the crop and livelihoods are affected in different ways</h2>
    <div class="ct-paths">${T.PATHWAYS.map(p => `<div class="cs-card" id="path-${esc(p.id)}"><h3>${esc(p.t)}</h3><p>${esc(p.d)}</p>
      ${all(p.documented.claims) ? `<p>${tag("Documented", "research")} ${esc(p.documented.text)}</p>` : ""}
      <p>${tag("Plausible pathway, to investigate", "illus")} ${esc(p.plausible)}</p>
      ${p.link ? `<p><a href="${esc(p.link[0])}">${esc(p.link[1])}</a></p>` : ""}</div>`).join("")}</div>
    <div class="cs-note cs-note--watch ct-notclaimed"><p class="cs-note__label">What this page does not claim</p><ul>${T.NOT_CLAIMED.map(n => `<li>${esc(n)}</li>`).join("")}</ul></div>
    ${srcFold(T.PATHWAYS.flatMap(p => p.documented.claims))}
  </section>`;

  // 4. informal work and who can stop
  const work = `
  <section class="container ct-sec" id="informal" aria-labelledby="ct-inf-h">
    ${kicker("03", "Informal work")}
    <h2 class="hub-h" id="ct-inf-h">Nine working arrangements, not one</h2>
    <p>${para(T.INFORMAL_NOTE, T.INFORMAL_CLAIMS) || esc(T.INFORMAL_NOTE.split(" The farmers")[0])}</p>
    <ul class="ct-arr">${T.ARRANGEMENTS.map(a => `<li id="work-${esc(a.id)}"><h3>${esc(a.t)}</h3><p>${esc(a.d)}</p></li>`).join("")}</ul>
    <h3 class="ct-h3" id="who-can-stop">${esc(T.STOP.h)}</h3>
    <p>${tag(T.STOP.label, "illus")} For each: the exposure, what stops the person resting, the arrangement that would make protection usable, and who is responsible for it.</p>
    <div class="ct-stops">${T.STOP.rows.map(r => `<article class="cs-card ct-stopcard" id="stop-${esc(r.id)}"><h4>${esc(r.t)}</h4>
      <ol class="ct-flow"><li><b>Exposure</b><span>${esc(r.exposure)}</span></li><li><b>Constraint</b><span>${esc(r.constraint)}</span></li><li><b>Necessary arrangement</b><span>${esc(r.arrangement)}</span></li><li><b>Responsible actor</b><span>${esc(r.actor)}</span></li></ol></article>`).join("")}</div>
    ${srcFold(T.INFORMAL_CLAIMS)}
  </section>`;

  // 5. women and intersecting inequalities
  const equity = `
  <section class="container ct-sec" id="equity" aria-labelledby="ct-eq-h">
    ${kicker("04", "Women and intersecting inequalities")}
    <h2 class="hub-h" id="ct-eq-h">Who carries the extra load</h2>
    <p>${esc(T.EQUITY.intro)}</p>
    <div class="ct-q ct-q--design"><p class="ct-q__label">A question to ask of every protection</p><p class="ct-q__text">${esc(T.EQUITY.question)}</p></div>
    <ul class="ct-eq">${T.EQUITY.items.filter(shown).map(i => `<li><h3>${esc(i.t)}</h3><p>${esc(i.d)}</p>${i.link ? `<p><a href="${esc(i.link[0])}">${esc(i.link[1])}</a></p>` : ""}</li>`).join("")}</ul>
    ${srcFold(T.EQUITY.items.flatMap(i => i.claims || []))}
  </section>`;

  // 6. Asian context
  const asia = `
  <section class="container ct-sec" id="asia" aria-labelledby="ct-asia-h">
    ${kicker("05", "Asian context")}
    <h2 class="hub-h" id="ct-asia-h">Not one cotton belt</h2>
    <p>${esc(T.ASIA.intro)}</p>
    <ul class="ct-asia">${T.ASIA.rows.filter(shown).map(r => `<li><h3>${esc(r.t)}</h3><p>${esc(r.d)}</p></li>`).join("")}</ul>
    <p class="ct-small">${esc(T.ASIA.caution)}</p>
    ${srcFold(T.ASIA.rows.flatMap(r => r.claims || []))}
  </section>`;

  // 7. intervention library
  const recCard = r => { const ev = evOf(r), prop = ev[0].k === "proposal";
    return `<article class="ct-rec${prop ? " ct-rec--prop" : ""}" id="rec-${esc(r.id)}" data-rec="${esc(r.id)}" data-stages="${esc(r.stages.join(" "))}">
      <h4>${esc(r.t)}</h4>
      <p class="ct-rec__ev">${ev.map(e => tag(T.KIND[e.k], e.k)).join(" ")}</p>
      <p class="ct-rec__how">${esc(r.how)}</p>
      <details><summary>Who acts, who pays, and what to watch</summary><dl class="ct-dl ct-dl--rec">
        <div><dt>Stage</dt><dd>${r.stages.map(s => esc(STAGE[s].short)).join(", ")}</dd></div>
        <div><dt>Intended beneficiaries</dt><dd>${esc(r.who)}</dd></div>
        <div><dt>Implementing actor</dt><dd>${esc(r.actor)}</dd></div>
        <div><dt>Funding responsibility</dt><dd>${esc(r.pays)}</dd></div>
        <div><dt>Recurring needs</dt><dd>${esc(r.recurring)}</dd></div>
        <div><dt>Prerequisites</dt><dd>${esc(r.needs)}</dd></div>
        <div><dt>Possible harms or exclusions</dt><dd>${esc(r.harms)}</dd></div>
        <div><dt>Evidence</dt><dd><ul>${ev.map(e => `<li><b>${esc(T.KIND[e.k])}.</b> ${e.note ? esc(e.note) + " " : ""}${e.claims.length ? srcLinks(e.claims) : ""}</li>`).join("")}</ul>${r.link ? `<p><a href="${esc(r.link[0])}">${esc(r.link[1])}</a></p>` : ""}</dd></div>
      </dl></details>
    </article>`; };
  const protections = `
  <section class="container ct-sec" id="protections" aria-labelledby="ct-prot-h">
    ${kicker("06", "Find protections")}
    <h2 class="hub-h" id="ct-prot-h">An intervention library, by who acts and who pays</h2>
    <p>${T.RECORDS.length} measures in six families, organised around prevention, protection people can actually use, and continuity of income and services. Costs are described, not priced; no cooling effect, health benefit or return is claimed without a checked source.</p>
    <details class="ct-key"><summary>What the evidence labels mean</summary><dl>${Object.keys(T.KIND).map(k => `<div><dt>${tag(T.KIND[k], k)}</dt><dd>${esc(T.KIND_NOTE[k])}</dd></div>`).join("")}</dl></details>
    <nav class="ct-fams" aria-label="Families of measures"><ul>${T.FAMILIES.map(f => `<li><a href="#fam-${esc(f.id)}">${esc(f.t)}</a></li>`).join("")}</ul></nav>
    <div class="ct-printbar" hidden><span class="ct-printcount" aria-live="polite"></span> <button type="button" class="btn ct-print">Print selected measures</button> <button type="button" class="ct-btn ct-clear">Clear</button></div>
    ${T.FAMILIES.map(f => `<section class="ct-fam" id="fam-${esc(f.id)}" aria-labelledby="fam-${esc(f.id)}-h"><h3 class="ct-famh" id="fam-${esc(f.id)}-h">${esc(f.t)}</h3><p class="ct-famd">${esc(f.d)}</p>
      <div class="ct-recs">${T.RECORDS.filter(r => r.fam === f.id).map(recCard).join("")}</div></section>`).join("")}
  </section>`;

  // 8. explorer
  const E = T.EXPLORER;
  const explorer = `
  <section class="container ct-sec" id="explorer" aria-labelledby="ct-exp-h">
    ${kicker("07", "What makes protection usable?")}
    <h2 class="hub-h" id="ct-exp-h">What makes protection usable?</h2>
    <p>${esc(E.intro)}</p>
    <form class="ct-form" hidden>
      <label>Stage or task <select name="stage"><option value="">I'm not sure</option>${T.STAGES.map(s => `<option value="${esc(s.id)}">${esc(s.letter)}. ${esc(s.t)}</option>`).join("")}</select></label>
      <label>Working arrangement <select name="arr"><option value="">I'm not sure</option>${T.ARRANGEMENTS.map(a => `<option value="${esc(a.id)}">${esc(a.t)}</option>`).join("")}</select></label>
      <label>Main barrier <select name="bar"><option value="">Choose a barrier</option>${T.BARRIERS.map(b => `<option value="${esc(b.id)}">${esc(b.t)}</option>`).join("")}<option value="unsure">I'm not sure</option></select></label>
      <button type="reset" class="ct-btn">Start again</button>
    </form>
    <div class="ct-out" aria-live="polite" hidden></div>
    <details class="ct-exptable" open><summary>Every barrier, as a table</summary>
      <div class="ct-tablewrap" role="region" aria-label="Barriers and arrangements" tabindex="0"><table class="ct-table"><caption>Main barrier, arrangements that address it, and what to assess locally</caption>
        <thead><tr><th scope="col">Barrier</th><th scope="col">Arrangements</th><th scope="col">Assess locally</th></tr></thead>
        <tbody>${T.BARRIERS.map(b => `<tr><th scope="row">${esc(b.t)}</th><td data-label="Arrangements">${b.recs.map(id => `<a href="#rec-${esc(id)}">${esc(REC[id].t)}</a>`).join("; ")}</td><td data-label="Assess locally">${esc(b.local)}</td></tr>`).join("")}</tbody></table></div></details>
    <div class="cs-note ct-limits"><p class="cs-note__label">About temperature and heat indices</p><p>${para(E.limits, E.limitsClaims) || esc(E.limits)}</p>${srcFold(E.limitsClaims, "Sources")}</div>
  </section>`;

  // 9. risk along the chain
  const C = T.CHAINS;
  const chains = `
  <section class="container ct-sec" id="risk-chain" aria-labelledby="ct-chain-h">
    ${kicker("08", "How risk can travel")}
    <h2 class="hub-h" id="ct-chain-h">How risk can be passed along the chain</h2>
    <p>${esc(C.intro)}</p>
    <ol class="ct-chains">${C.rows.map(r => `<li class="cs-card"><h3>${esc(r.t)}</h3><p>${esc(r.d)}</p><p><b>Interruption point:</b> ${esc(r.cut)}</p><p><b>Actor with authority:</b> ${esc(r.actor)}</p><p>${tag("Mechanism to investigate", "illus")}</p></li>`).join("")}</ol>
    <p class="ct-small">${esc(C.fate)} <a href="${esc(C.fateLink[0])}">${esc(C.fateLink[1])}</a>.</p>
  </section>`;

  // 10. evidence
  const used = new Set(T.claimsUsed().filter(id => OK.has(id)));
  const rows = Object.values(SRC).map(s => ({ s, n: [...used].filter(id => CL[id].rests_on.some(([k]) => k === s.key)).length })).filter(x => x.n);
  const evidence = `
  <section class="container ct-sec" id="evidence" aria-labelledby="ct-ev-h">
    ${kicker("09", "The evidence")}
    <h2 class="hub-h" id="ct-ev-h">The evidence, its limits, and what was left out</h2>
    <h3 class="ct-h3">Gaps</h3><ul class="ct-list">${T.GAPS.map(g => `<li>${esc(g)}</li>`).join("")}</ul>
    <h3 class="ct-h3">Withheld</h3><ul class="ct-list">${T.WITHHELD.map(g => `<li>${esc(g)}</li>`).join("")}</ul>
    <h3 class="ct-h3">Sources behind this page</h3>
    <p>Each passed Common Shade's automated check: the page or its archived copy held every term the claims rest on. Passing means the source says what is cited, not that it is right or representative.</p>
    <div class="ct-tablewrap" role="region" aria-label="Evidence table" tabindex="0"><table class="ct-table"><caption>Source, kind of evidence, place, date and how many statements rest on it</caption>
      <thead><tr><th scope="col">Source</th><th scope="col">Kind</th><th scope="col">Place</th><th scope="col">Year</th><th scope="col">Statements</th></tr></thead>
      <tbody>${rows.map(({ s, n }) => `<tr><th scope="row">${ext(s.url, `${s.publisher}: ${s.title}`)}</th><td data-label="Kind">${esc(s.kind)}</td><td data-label="Place">${esc(s.where)}</td><td data-label="Year">${esc(String(s.year))}</td><td data-label="Statements">${n}</td></tr>`).join("")}</tbody></table></div>
    <p class="ct-small">Ideas from history and development thinking shaped how this page looks at power, agency and local knowledge; none is used as evidence of present-day conditions. Cotton is the first value chain here; the same structure can hold others once their evidence is checked. Know a source we missed? <a href="/join/">Tell us through the join form</a>.</p>
  </section>
  <section class="container ct-sec" aria-labelledby="ct-rel-h"><h2 class="hub-h" id="ct-rel-h">Related on Common Shade</h2>
    <ul class="ct-related">
      <li><a href="/factory-heat/"><b>Heat inside factories</b><span>indoor heat, garment factories and an intervention library</span></a></li>
      <li><a href="/who-is-at-risk/#farmers"><b>Who is at risk: farming households</b><span>smallholder and rainfed farming</span></a></li>
      <li><a href="/practical-actions/#work"><b>Practical actions at work</b><span>water, breaks, warnings and income</span></a></li>
      <li><a href="/social-protection/"><b>Who could help a household through a hot season</b><span>social protection, country by country</span></a></li>
      <li><a href="/shared-heat/"><b>Who shares the heat</b><span>shared dependence, unequal power</span></a></li>
    </ul></section>`;

  const body = `${hero("Value chains", esc(T.TITLE), esc(T.SUB))}
  ${opening}${journey}${pathways}${work}${equity}${asia}${protections}${explorer}${chains}${evidence}
  <script>window.CT_BARRIERS=${JSON.stringify(T.BARRIERS.map(b => ({ id: b.id, t: b.t, recs: b.recs, local: b.local })))};window.CT_ARR=${JSON.stringify(T.ARRANGEMENTS.map(a => ({ id: a.id, t: a.t, actors: a.actors })))};</script>
  <script src="/${T.SLUG}/cotton.js?v=${V}" defer></script>`;
  write(T.SLUG, page(T.SLUG, T.TITLE, T.DESC, body, `\n  <link rel="stylesheet" href="/${T.SLUG}/cotton.css?v=${V}">`));
  if (left.size) console.warn(`cotton heat: left out passages resting on unconfirmed claims: ${[...left].join(", ")}`);
};

module.exports.md = function md(SITE) { const { OK } = load(); return T.md(SITE, OK); };
