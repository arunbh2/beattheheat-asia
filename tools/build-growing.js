// Common Shade: /growing/, "Watch Common Shade grow". How the knowledge commons is developing: what changed, why it
// matters, what it connects to, what was corrected or left open, and what it took to add. One record
// (data/site/growth.json) feeds two equivalent views: readable update cards (the default, and the whole page without
// JavaScript) and the canopy, a drawn overview in which selecting a change lights only its own reviewed connections.
// Beneath the surface, the roots grow with the work Common Shade draws on, dated by when that work was published
// (data/site/growth-dates.json): a three-year view that never claims the site existed before it did. The canopy is a
// metaphor for the commons, never a measure of protection achieved. Words shared with llms-full.txt are in
// tools/growth-text.js; /growing/growing.js filters, remembers the last visit and drives the canopy. Called by build-pages.js.
"use strict";
const T = require("./growth-text.js");
module.exports = function growing({ page, write, esc, hero, V }) {
  const L = T.load(), S = T.summary(L), F = T.frames(), VOC = L.V;
  const ext = (u, l) => /^https?:/.test(u) ? `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(l)}<span class="visually-hidden"> (opens in a new tab)</span>&nbsp;<span aria-hidden="true">↗</span></a>` : `<a href="${esc(u)}">${esc(l)}</a>`;
  const n = x => Number(x).toLocaleString("en-GB");
  const kindIco = k => `<span class="gw-ico gw-ico--${k}" aria-hidden="true"></span>`;
  const rootName = Object.fromEntries(F.roots.map(r => [r.id, r.name]));

  // ---- one card per change ----
  const card = e => {
    const x = T.effort(e), c = T.counted(e);
    const chips = [...e.places.map(p => [`place`, T.PLACE[p]]), ...e.people.map(p => ["people", VOC.people[p]]), ...e.topics.map(t => ["topic", VOC.topic(t)])];
    const links = e.links.map(l => { const t = T.target(l.to, VOC); return t ? `<li><a href="${esc(t.href)}">${esc(t.name)}</a> <span class="gw-meta">${esc(t.type)} · ${l.basis === "record" ? "from the site's records" : "our reading"}</span><br>${esc(l.why)}</li>` : ""; }).join("");
    return `<article class="gw-card" id="${esc(e.id)}" data-kind="${e.kind}" data-root="${e.root}" data-added="${e.added}" data-places="${e.places.join(" ")}" data-people="${e.people.join(" ")}" data-topics="${e.topics.join(" ")}" tabindex="-1">
      <p class="gw-kind">${kindIco(e.kind)}${esc(T.KIND[e.kind])}<span class="gw-root"> · ${esc(rootName[e.root])}</span></p>
      <h3 class="gw-card__h">${esc(e.title)}${c != null ? ` <span class="gw-count">(${n(c)} questions)</span>` : ""}</h3>
      <p class="gw-dates"><time datetime="${e.added}">Added ${esc(T.date(e.added))}</time> · ${esc(T.eventText(e))}</p>
      <p class="gw-why"><span class="gw-lab">Why it matters <span class="gw-lab__q">our reading</span></span>${esc(e.why)}</p>
      ${e.finding ? `<blockquote class="gw-finding"><span class="gw-lab">What the source says <span class="gw-lab__q">quoted</span></span><p>“${esc(e.finding.text)}”</p><cite>${ext(e.finding.source[1], e.finding.source[0])}</cite></blockquote>` : ""}
      <ul class="gw-chips" aria-label="Places, people and topics">${chips.map(([t, l]) => `<li class="gw-chip gw-chip--${t}">${esc(l)}</li>`).join("")}</ul>
      <p class="gw-review"><span class="gw-lab">Review</span>${esc(e.review)}.${x && x.counts ? ` <span class="gw-effort-line">${esc(T.effortLine(x))}.</span>` : ""}</p>
      ${x ? `<details class="gw-took"><summary>What it took to add this</summary><ol class="gw-steps">
        ${x.asked ? `<li><b>The question.</b> ${esc(x.asked)}</li>` : ""}${x.search ? `<li><b>The search.</b> ${esc(x.search)}</li>` : ""}
        ${x.check ? `<li><b>The checking.</b> ${esc(x.check)}</li>` : ""}${x.aside ? `<li><b>What we set aside.</b> ${esc(x.aside)}</li>` : ""}
        ${x.open ? `<li><b>What is still open.</b> ${esc(x.open)}</li>` : ""}</ol>
        <p class="gw-files">See for yourself: ${x.files.map(([h, l]) => `<a href="${esc(h)}">${esc(l)}</a>`).join(" · ")}</p></details>` : ""}
      ${links ? `<details class="gw-conn"><summary>How it connects</summary><ul>${links}</ul></details>` : ""}
      <div class="gw-acts"><a class="gw-btn" href="${esc(e.action[1])}">${esc(e.action[0])}<span aria-hidden="true"> →</span></a>
        ${e.pages.filter(p => p[0] !== e.action[1]).map(p => `<a class="gw-alt" href="${esc(p[0])}">${esc(p[1])}</a>`).join("")}
        <button type="button" class="gw-alt gw-show" data-show="${esc(e.id)}" hidden>Show in the canopy</button></div>
      <p class="gw-improve">Know something that would improve this? <a href="/join/?about=${encodeURIComponent(e.title)}&amp;ref=${esc(e.id)}#way-share">Share evidence, experience or a correction</a></p>
    </article>`;
  };

  // ---- the canopy: drawn at build time, so it is there before any script ----
  const W = 960, H = 640, GY = 330, TX = 480;
  const hash = s => { let h = 2166136261; for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967295; };
  const order = ["evidence", "experience", "practical", "institutions", "financing"];
  const ang = i => Math.PI * (0.88 - i * 0.19);   // branches fan out above, left to right
  const crown = (i, t) => { const a = ang(i) + (t - 0.5) * 0.15, r = 150 + t * 120; return [TX + Math.cos(a) * r * 1.35, GY - 30 - Math.sin(a) * r]; };
  const rootEnd = i => [80 + i * 200, H - 40];
  const fx = v => v.toFixed(1);
  // leaves: one per change, along its root's branch, oldest nearest the trunk
  const byRoot = Object.fromEntries(order.map(r => [r, L.entries.filter(e => e.root === r).sort((a, b) => a.added < b.added ? -1 : 1)]));
  const leafPos = {};
  order.forEach((r, i) => byRoot[r].forEach((e, j, a) => { const t = a.length === 1 ? 0.6 : 0.15 + 0.85 * j / (a.length - 1); const [x, y] = crown(i, t); leafPos[e.id] = [x + (hash(e.id) - 0.5) * 26, y + (hash(e.id + "y") - 0.5) * 22]; }));
  // link targets: junctions beneath the surface, near the root their kind belongs to
  const tRoot = { lever: 2, loop: 0, people: 1, page: 3 };
  const targets = [...new Set(L.entries.flatMap(e => e.links.map(l => l.to)))];
  const tPos = {}; targets.forEach(to => { const i = tRoot[to.split(":")[0]] ?? 4, [ex, ey] = rootEnd(i), t = 0.25 + hash(to) * 0.5; tPos[to] = [TX + (ex - TX) * t + (hash(to + "x") - 0.5) * 50, GY + (ey - GY) * t + (hash(to + "z") - 0.5) * 30]; });
  // roots: strands that appear frame by frame, in proportion to the dated work in each root
  const last = F.frames[F.frames.length - 1].total, maxT = Math.max(...Object.values(last));
  const strands = order.map((r, i) => { const [ex, ey] = rootEnd(i), out = [];
    const k = f => Math.max(1, Math.round(Math.sqrt(F.frames[f].total[r] / maxT) * 18));
    let made = 0; F.frames.forEach((fr, f) => { const want = k(f); for (; made < want; made++) {
      const t = 0.2 + hash(r + made) * 0.7, sx = TX + (ex - TX) * t, sy = GY + (ey - GY) * t, len = 30 + hash(r + made + "l") * 70, a = Math.PI / 2 + (hash(r + made + "a") - 0.5) * 2.2;
      out.push(`<path class="gw-strand" data-f="${f}" d="M${fx(sx)} ${fx(sy)} q ${fx(Math.cos(a) * len * 0.5)} ${fx(Math.sin(a) * len * 0.2)} ${fx(Math.cos(a) * len)} ${fx(Math.sin(a) * len)}"/>`); } });
    return out.join(""); }).join("");
  const svg = `<svg class="gw-svg" viewBox="0 0 ${W} ${H}" role="group" aria-labelledby="gw-svg-t gw-svg-d">
    <title id="gw-svg-t">The canopy: changes to Common Shade above the surface, the work it draws on beneath</title>
    <desc id="gw-svg-d">Each mark in the canopy is one change, on the branch of its root. Beneath the surface, five roots carry the dated work the commons draws on: ${order.map(r => `${rootName[r]}, ${n(last[r])} works`).join("; ")}. Selecting a change draws only its own connections. A metaphor for the knowledge commons, not a measure of protection.</desc>
    <path class="gw-dome" d="M110 ${GY - 34} C 150 40, 810 40, 850 ${GY - 34}"/>
    <text class="gw-svg-cap" x="${TX}" y="58" text-anchor="middle">The shared aim: protection from extreme heat</text>
    ${order.map((r, i) => { const [x, y] = crown(i, 1); return `<path class="gw-branch" d="M${TX} ${GY} Q ${fx((TX + x) / 2)} ${fx(GY - 60)} ${fx(x)} ${fx(y)}"/>`; }).join("")}
    <line class="gw-ground" x1="20" y1="${GY}" x2="${W - 20}" y2="${GY}"/><text class="gw-svg-cap gw-svg-cap--l" x="24" y="${GY - 8}">Above: what Common Shade added, from October 2026</text><text class="gw-svg-cap gw-svg-cap--l" x="24" y="${GY + 20}">Below: the work it draws on, by year of publication</text>
    ${order.map((r, i) => { const [x, y] = rootEnd(i); return `<path class="gw-root-main" d="M${TX} ${GY} C ${TX} ${GY + 90}, ${fx(x)} ${fx(y - 160)}, ${fx(x)} ${fx(y)}"/><text class="gw-root-lab" x="${fx(x)}" y="${fx(y + 26)}" text-anchor="middle">${esc(rootName[r])} <tspan class="gw-root-n" data-root="${r}">${n(last[r])}</tspan></text>`; }).join("")}
    <g class="gw-strands">${strands}</g>
    <g class="gw-wires" aria-hidden="true">${L.entries.flatMap(e => e.links.map(l => { const [x1, y1] = leafPos[e.id], [x2, y2] = tPos[l.to]; return `<path class="gw-wire gw-wire--${l.basis}" data-from="${e.id}" data-to="${esc(l.to)}" d="M${fx(x1)} ${fx(y1)} C ${fx(x1)} ${fx(GY + 10)}, ${fx(x2)} ${fx(GY - 10)}, ${fx(x2)} ${fx(y2)}"/>`; })).join("")}</g>
    <g class="gw-targets">${targets.map(to => { const t = T.target(to, VOC), [x, y] = tPos[to]; return `<g class="gw-target" data-to="${esc(to)}"><circle cx="${fx(x)}" cy="${fx(y)}" r="6"/><text x="${fx(x)}" y="${fx(y - 11)}" text-anchor="middle">${esc(t ? t.name : to)}</text></g>`; }).join("")}</g>
    <g class="gw-leaves">${L.entries.map(e => { const [x, y] = leafPos[e.id]; return `<g class="gw-leaf gw-leaf--${e.kind}" data-id="${esc(e.id)}" role="button" tabindex="0" aria-label="${esc(T.KIND[e.kind])}: ${esc(e.title)}"><circle class="gw-hit" cx="${fx(x)}" cy="${fx(y)}" r="15"/><use href="#gw-m-${markOf(e.kind)}" x="${fx(x - 9)}" y="${fx(y - 9)}" width="18" height="18"/></g>`; }).join("")}</g>
    <defs>
      <symbol id="gw-m-dot" viewBox="0 0 18 18"><circle cx="9" cy="9" r="7"/></symbol>
      <symbol id="gw-m-square" viewBox="0 0 18 18"><rect x="2.5" y="2.5" width="13" height="13" rx="2"/></symbol>
      <symbol id="gw-m-diamond" viewBox="0 0 18 18"><path d="M9 1.5 16.5 9 9 16.5 1.5 9z"/></symbol>
      <symbol id="gw-m-tri" viewBox="0 0 18 18"><path d="M9 2 16.5 15.5h-15z"/></symbol>
      <symbol id="gw-m-ring" viewBox="0 0 18 18"><circle cx="9" cy="9" r="6" fill="none" stroke-width="3"/></symbol>
    </defs>
  </svg>`;
  function markOf(k) { return k === "tool" ? "square" : k === "connection" ? "diamond" : T.REVISED.includes(k) ? "tri" : k.startsWith("question") ? "ring" : "dot"; }
  const legend = [["dot", "Evidence, experience, plan or guidance"], ["square", "Tool improved"], ["diamond", "Connection documented"], ["tri", "Correction or revised interpretation"], ["ring", "Question opened or advanced"]];

  // ---- the three-year view, readable ----
  const frameRows = F.frames.map((f, i) => `<li class="gw-frame" data-f="${i}"><h3 class="gw-frame__h">${esc(f.label)}</h3>
      <p>${f.key === "before" ? `${n(f.n)} works published before ${F.years[0]} form the roots the commons stands on.` : `${n(f.n)} works published${f.month ? `, ${n(f.month)} of them with a known month` : ""}; ${n(f.cum)} in all by the end of the year.`}${f.plans ? ` ${n(f.plans)} of the verified Indian heat action plans carry this year.` : ""}</p>
      ${f.steps && f.steps.length ? `<p class="gw-meta">Steps toward protection this year: ${f.steps.map(s => `<a href="${s.href}">${esc(s.title)}</a>`).join("; ")}.</p>` : ""}
      <ul class="gw-bars">${order.map(r => `<li><span class="gw-bars__l">${esc(rootName[r])}</span><span class="gw-bars__b" style="--w:${(f.total[r] / maxT * 100).toFixed(1)}%"></span><span class="gw-bars__n">${n(f.total[r])}</span></li>`).join("")}</ul>
      <button type="button" class="gw-alt gw-goframe" data-goframe="${i}" hidden>Show in the canopy</button></li>`).join("");

  const revised = L.entries.filter(e => T.REVISED.includes(e.kind));
  const opts = (list, name, all) => `<label class="gw-field"><span>${name}</span><select data-f="${name.toLowerCase()}"><option value="">${all}</option>${list.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join("")}</select></label>`;
  const usedPlaces = T.PLACES.filter(([p]) => L.entries.some(e => e.places.includes(p)));
  const usedPeople = Object.entries(VOC.people).filter(([p]) => L.entries.some(e => e.people.includes(p)));
  const usedTopics = [...new Set(L.entries.flatMap(e => e.topics))].map(t => [t, VOC.topic(t)]).sort((a, b) => a[1] < b[1] ? -1 : 1);
  const usedKinds = T.KINDS.filter(([k]) => L.entries.some(e => e.kind === k));

  const body = `${hero("News and evidence", esc(T.TITLE), esc(T.LEDE))}
  <div class="container gw">
    <p class="gw-sum" id="gw-sum">${n(S.changes)} changes recorded since ${esc(T.date(S.first))}: ${n(S.revised)} corrections or revised interpretations, ${n(S.connections)} connections documented and ${n(S.questions)} questions opened. Beneath them, ${n(F.dated)} works the commons draws on carry a publication date${F.undated ? `, and ${n(F.undated)} are still being dated` : ""}.</p>
    <nav class="gw-doors" aria-label="Three ways in">
      <a class="gw-door" href="#updates" data-door="new"><b>What's new</b><span>The latest changes, newest first</span></a>
      <a class="gw-door" href="#canopy" data-door="connections"><b>Explore connections</b><span>Select a change to see what it connects to</span></a>
      <a class="gw-door" href="#revised" data-door="revised"><b>What we've revised</b><span>Corrections and changed readings</span></a>
    </nav>
    <p class="gw-note">This is a record of how the knowledge on Common Shade changes. Growth here means more is known and connected; it never means people protected, partnerships formed or impact delivered.</p>

    <div class="gw-last" id="gw-last" hidden></div>
    <form class="gw-find" id="gw-find" role="search" hidden onsubmit="return false">
      <label class="gw-q"><span>What are you looking for?</span><input type="search" name="q" autocomplete="off" placeholder="A place, a group of people or a topic"></label>
      <details class="gw-more" id="gw-more"><summary>Filter by place, people, topic, kind or time</summary><div class="gw-fields">
        ${opts(usedPlaces, "Place", "Any place")}${opts(usedPeople, "People", "Anyone")}${opts(usedTopics, "Topic", "Any topic")}${opts(usedKinds, "Kind", "Any kind of change")}
        <label class="gw-field"><span>Added from</span><input type="date" data-f="from" min="${S.first}"></label><label class="gw-field"><span>Added to</span><input type="date" data-f="to" min="${S.first}"></label>
        <button type="button" class="gw-alt" id="gw-clear">Clear filters</button></div></details>
      <div class="gw-views" role="group" aria-label="View"><button type="button" class="gw-view" data-view="cards" aria-pressed="true">Updates</button><button type="button" class="gw-view" data-view="canopy" aria-pressed="false">Canopy</button></div>
      <p class="gw-status" id="gw-status" role="status" aria-live="polite"></p>
    </form>

    <section id="updates" class="gw-sec" aria-labelledby="updates-h"><h2 id="updates-h" class="gw-h2">Updates, newest first</h2>
      <div class="gw-cards" id="gw-cards">${L.entries.map(card).join("")}</div>
      <p class="gw-empty" id="gw-empty" hidden>No change matches all of these. Try fewer filters or a wider date range; <button type="button" class="gw-alt" data-clear>clear every filter</button>.</p></section>

    <section id="canopy" class="gw-sec gw-canopy" aria-labelledby="canopy-h"><h2 id="canopy-h" class="gw-h2">The canopy</h2>
      <p>Each mark above the surface is one change, on the branch of its root. Select one to light its own connections beneath the surface; everything else stays quiet. Only connections in the site's records, or reviewed by us, are drawn, and each is labelled which. Use the timeline to watch the roots grow with the work published in the last three years.</p>
      <button type="button" class="gw-alt gw-reveal" id="gw-reveal" hidden aria-expanded="false" aria-controls="gw-fig">Show the overview</button>
      <figure class="gw-fig" id="gw-fig">${svg}
        <figcaption><ul class="gw-legend">${legend.map(([m, l]) => `<li><svg width="18" height="18" aria-hidden="true"><use href="#gw-m-${m}"/></svg>${esc(l)}</li>`).join("")}<li><span class="gw-key gw-key--record" aria-hidden="true"></span>Connection from the site's records</li><li><span class="gw-key gw-key--editorial" aria-hidden="true"></span>Connection that is our reading</li></ul></figcaption></figure>
      <div class="gw-replay" id="gw-replay" hidden><label for="gw-range">Roots by year of publication</label><input type="range" id="gw-range" min="0" max="${F.frames.length - 1}" value="${F.frames.length - 1}" step="1" aria-valuetext="${esc(F.frames[F.frames.length - 1].label)}"><output id="gw-range-out" for="gw-range">${esc(F.frames[F.frames.length - 1].label)}</output><button type="button" class="gw-alt" id="gw-play">Play the three years</button></div>
      <div class="gw-panel" id="gw-panel" aria-live="polite"><p class="gw-meta">Select a change in the canopy, or choose "Show in the canopy" on any update.</p></div></section>

    <section id="timeline" class="gw-sec" aria-labelledby="timeline-h"><h2 id="timeline-h" class="gw-h2">How the work grew, year by year</h2>
      <p>Common Shade began gathering in October 2026. The work it draws on is much older, so this timeline dates each piece by when it was published, not when it was added. A date is shown only as precisely as its evidence allows: a record's own date, a date in its link, or the year in its label.</p>
      <ol class="gw-frames">${frameRows}</ol>
      <p class="gw-meta">Not yet dated: ${n(F.undated)} works whose records carry no date${F.onlineOnly ? `, and ${n(F.onlineOnly)} known only to have been online by a certain date` : ""}. ${n(F.orgs)} links to organisations are counted apart and never dated. History before October 2026 is reconstructed only from these publication dates; Common Shade's own record of changes begins on ${esc(T.date(S.first))}.</p></section>

    <section id="revised" class="gw-sec" aria-labelledby="revised-h"><h2 id="revised-h" class="gw-h2">What we've revised</h2>
      <p>Corrections and changed readings are part of how the commons learns. Each one says what changed and why.</p>
      <ul class="gw-revised">${revised.map(e => `<li>${kindIco(e.kind)}<a href="#${esc(e.id)}">${esc(e.title)}</a> <span class="gw-meta">${esc(T.KIND[e.kind])} · ${esc(T.date(e.added))}</span></li>`).join("")}</ul>
      <p>Every correction, with an apology, is on <a href="/corrections/">Corrections</a>.</p></section>

    <section class="gw-sec gw-invite" aria-labelledby="invite-h"><h2 id="invite-h" class="gw-h2">Know something that would improve this?</h2>
      <p>Evidence, practical experience, a correction or a question nobody has answered: each one helps the commons grow. Contributing does not make anyone a formal partner, and everything shared is checked before it appears.</p>
      <p><a class="gw-btn" href="/join/#way-share">Share what you know<span aria-hidden="true"> →</span></a> <a class="gw-alt" href="/corrections/">Share a correction</a></p></section>

    <section class="gw-sec gw-how" aria-labelledby="how-h"><h2 id="how-h" class="gw-h2">How this record works</h2>
      <ul><li>One record, <a href="/data/site/growth.json">growth.json</a>, holds every change; both views and the text for AI systems are built from it. Each change traces to the pull request that made it.</li>
        <li>"Why it matters" is our reading. "What the source says" is quoted from the source, and the build checks that the quotation appears in the site's own records.</li>
        <li>A changed file is not progress by itself. Changes are reviewed by a person before they are recorded; nothing is counted twice because it appears on several pages.</li>
        <li>Publication dates come from <a href="/data/site/growth-dates.json">growth-dates.json</a>, with how each date is known. Dates looked up online are from Crossref or the page's own metadata; an "online by" date is never shown as a publication date.</li></ul>
      <p class="gw-credit">Inspired by <a href="https://wystem.ai/" rel="noopener">Wystem.ai</a>'s approach to a living knowledge commons. Designed and implemented independently for Common Shade.</p></section>
  </div>
  <script>window.GW = ${JSON.stringify({ frames: F.frames.map(f => ({ label: f.label, total: f.total })), first: S.first, entries: L.entries.map(e => ({ id: e.id, kind: e.kind, title: e.title, why: e.why, added: e.added, root: e.root, action: e.action, links: e.links.map(l => { const t = T.target(l.to, VOC); return { to: l.to, name: t ? t.name : l.to, href: t ? t.href : "", type: t ? t.type : "", basis: l.basis, why: l.why }; }) })), kinds: T.KIND, revised: T.REVISED }).replace(/</g, "\\u003c")};</script>
  <script src="/${T.SLUG}/growing.js?v=${V}" defer></script>`;
  write(T.SLUG, page(T.SLUG, T.TITLE, `${T.LEDE} ${S.changes} changes recorded since ${T.date(S.first)}, with what it took to add each one.`, body, `\n  <link rel="stylesheet" href="/${T.SLUG}/growing.css?v=${V}">`));
  require("./site-counts.js")({ growthChanges: S.changes, growthRevised: S.revised, growthDated: F.dated });
};
