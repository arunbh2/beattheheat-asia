// Common Shade: /signals/, "Signals". External developments in heat policy, finance, research and practice, each with an
// inspectable record. Commitments are tracked deliverable by deliverable: a five-step checklist per deliverable (never a
// filled bar: evidence at one step does not stand in for the steps before it), then, folded, every milestone with the
// sources it rests on, what each source establishes and whether the site's source check confirmed it, what is unknown,
// the next evidence that would change the record, and when it was reviewed. Findings, gatherings and guidance keep their
// own shape and never climb the ladder. The COP31 watch keeps its scope, cut-off and dated check-ins, and links to records
// rather than repeating them. Every record and milestone has a stable anchor.
// With no script, everything is on the page in order of latest development. signals/signals.js adds the finder (search,
// filters and views kept in the URL), saved records (this browser only), a print briefing and a text download.
// Model: tools/signals-model.js. Words shared with llms-full.txt: tools/signals-text.js. Data: data/site/signals.json and
// the derived data/site/signals-checks.json (node tools/signals-sync.js). Called by build-pages.js.
"use strict";
const SH = require("./shared-heat-text.js");
const fs = require("fs"), path = require("path"), T = require("./signals-text.js"), SM = require("./signals-model.js");
const ROOT = path.join(__dirname, "..");
const J = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), "utf8")), arr = x => Array.isArray(x) ? x : Object.values(x || {});

// the context every card needs: names for actions, people and places, the check records and today's date
function context(today) {
  const levers = Object.fromEntries(arr(J("data/core/LEVERS.json").levers || J("data/core/LEVERS.json")).map(l => [l.id, l.title]));
  const people = Object.fromEntries(arr(J("data/core/AT_RISK.json")).map(r => [r.id, r.name || r.title]));
  const countries = new Set(fs.readdirSync(path.join(ROOT, "countries"), { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name));
  return { levers, people, countries, CHECKS: J("data/site/signals-checks.json"), today };
}
const PLACE = { region: "South and Southeast Asia", bangladesh: "Bangladesh", india: "India", indonesia: "Indonesia", nepal: "Nepal", philippines: "Philippines",
  singapore: "Singapore", "sri-lanka": "Sri Lanka", thailand: "Thailand", cambodia: "Cambodia" };
const STATE_MARK = { confirmed: "✓", reported: "◐", unverified: "○", scheduled: "◷", none: "–", na: "·" };

function render(esc, ctx) {
  const ENSO_FINDING = JSON.parse(require("fs").readFileSync(require("path").join(__dirname, "..", "data", "site", "enso-outlook.json"), "utf8")).finding;
  const e = s => esc(s).replace(/ °C/g, " °C");   // a figure and its unit stay on one line
  const ext = (u, l) => `<a href="${e(u)}" target="_blank" rel="noopener">${e(l)}<span class="visually-hidden"> (opens in a new tab)</span></a>`;
  const time = d => `<time datetime="${e(d)}">${e(SM.date(d))}</time>`;
  const srcOf = (s, id) => (s.sources || []).find(x => x.id === id);
  // one piece of evidence: the source, its type, what it establishes, and what the check found
  const evidence = (s, ev) => {
    const r = SM.evidenceState(ev, s, ctx.CHECKS), x = r.src || {};
    const chk = r.check ? `checked ${e(SM.date(r.check.checked))}${ev.terms ? ` for “${ev.terms.map(e).join("”, “")}”` : ""}` : e(r.why || "");
    // the checked page's own sentence holding the longest term this evidence rests on (tools/signals-sync.js keeps only prose)
    const recs = x.url ? SM.sourceCheck(x.url, ctx.CHECKS).content.filter(c => c.passages) : [];
    const q = (ev.terms || []).slice().sort((a, b) => b.length - a.length).map(t => recs.map(c => c.passages[t]).find(Boolean)).find(Boolean);
    return `<li class="sg-ev sg-ev--${r.state}"><span class="sg-ev__src">${x.url ? ext(x.url, x.label) : e(ev.source)} <span class="sg-tag">${x.type === "original" ? "Original" : "Secondary"}</span></span>
          <span class="sg-ev__est">${e(ev.establishes)}</span><span class="sg-ev__chk"><span aria-hidden="true">${STATE_MARK[r.state]}</span> ${e(SM.STATE[r.state].short)}: ${chk}</span>${q ? `<span class="sg-ev__q"><span class="sg-lab">${e(T.PROOF)}</span><q>${e(q)}</q></span>` : ""}</li>`;
  };
  // the steps with evidence (or a scheduled date) as rows; every other step in one plain sentence, so nothing is implied
  const checklist = (s, d) => {
    const C = SM.checklist(d, s, ctx.CHECKS, ctx.today), shown = C.filter(c => /confirmed|reported|unverified|scheduled/.test(c.status));
    const top = Math.max(-1, ...shown.map(c => SM.RUNGS.indexOf(c.rung)));
    const earlier = C.filter(c => c.status === "none" && SM.RUNGS.indexOf(c.rung) < top).map(c => c.label);
    const later = C.filter(c => c.status === "none" && SM.RUNGS.indexOf(c.rung) > top && c.rung !== "evaluated").map(c => c.label);
    const evalNone = C.some(c => c.rung === "evaluated" && c.status === "none"), na = C.filter(c => c.status === "na").map(c => c.label);
    const list = a => a.length > 1 ? a.slice(0, -1).join(", ") + " and " + a[a.length - 1] : a[0];
    const gaps = [earlier.length ? `${list(earlier)}: no separate evidence recorded.` : "",
      later.length ? `${list(later)}: not verified in the sources checked.` : "", evalNone ? "No evaluation found." : "",
      na.length ? `${list(na)}: not tracked for this kind of deliverable.` : ""].filter(Boolean).join(" ");
    return `<ol class="sg-check" aria-label="Steps with evidence for: ${e(d.what)}">${shown.map(c =>
      `<li class="is-${c.status}"><span class="sg-check__l"><span aria-hidden="true">${STATE_MARK[c.status]}</span> ${e(c.label)}</span><span class="sg-check__t">${e(c.text)}</span></li>`).join("")}</ol>${gaps ? `<p class="sg-gaps">${e(gaps)}</p>` : ""}`;
  };
  // the next step, on the card itself: what the record says would show it, and who made the commitment, both from the
  // record's own sourced fields. No one is named as late or responsible for a gap (a step not reached is "not verified").
  const evaluated = (s, d) => SM.checklist(d, s, ctx.CHECKS, ctx.today).some(c => c.rung === "evaluated" && /confirmed|reported/.test(c.status));
  const deliverable = (s, d) => `<section class="sg-del" id="${e(s.id)}--${e(d.id)}" data-del="${e(d.id)}">
        <h4 class="sg-del__what">${e(d.what)} <span class="sg-tag">${e(SM.TYPES[d.type].label)}</span></h4>
        ${checklist(s, d)}${d.next && !evaluated(s, d) ? `<p class="sg-nextstep"><span class="sg-lab">${e(T.NEXT_STEP)}</span>${e(d.next)} <span class="sg-small">${e(T.MADE_BY(d.holder || s.who))}</span></p>` : ""}</section>`;
  // the folded record: milestones with evidence, world events, sourced facts, conflicts, unknowns, next evidence
  const record = (s, d) => {
    const tl = SM.timeline(d).map(t => {
      const head = t.kind === "event" ? `<b>${e(SM.EVENTS[t.step])}</b>` : `<b>${e(SM.STEPS[t.step].label)}</b>${t.step === "evaluated" ? ` <span class="sg-tag">${e(SM.FINDINGS[t.findings])}</span>` : ""}${t.scheduled && SM.key(t.date) > SM.key(ctx.today) ? ` <span class="sg-tag">Scheduled, not yet reached</span>` : ""}`;
      const amt = t.amount ? ` <span class="sg-tag">${t.amount.disclosed === false ? "Amount not disclosed" : e(`${t.amount.currency || ""} ${t.amount.value || ""}`.trim())}</span>` : "";
      return `<li id="${e(s.id)}--${e(d.id)}--${e(t.id || t.step + "-" + t.date)}"><p class="sg-ms">${time(t.date)} ${head}${amt}. ${e(t.note)}</p><ul class="sg-evs">${(t.evidence || []).map(x => evidence(s, x)).join("")}</ul></li>`;
    }).join("");
    const path = SM.timeline(d).filter(t => t.kind === "milestone" && /^\d{4}/.test(t.date || "")).map(t => `${e(SM.STEPS[t.step].label)} ${time(t.date)}${t.scheduled && SM.key(t.date) > SM.key(ctx.today) ? " (scheduled)" : ""}`);
    return `<div class="sg-rec__d"><h4>${e(d.what)}</h4>${path.length > 1 ? `<p class="sg-path"><span class="sg-lab">${e(T.PATH)}</span>${path.join(' <span aria-hidden="true">→</span> ')}</p>` : ""}<ol class="sg-tl">${tl}</ol>
        ${(d.facts || []).length ? `<p class="sg-lab">Also in the sources</p><ul class="sg-facts">${d.facts.map(f => `<li>${e(f.text)}<ul class="sg-evs">${f.evidence.map(x => evidence(s, x)).join("")}</ul></li>`).join("")}</ul>` : ""}
        ${(d.conflicts || []).length ? `<p class="sg-lab">Sources differ</p><ul>${d.conflicts.map(c => `<li>${e(c.note)} (${c.sources.map(id => e((srcOf(s, id) || {}).label || id)).join("; ")})</li>`).join("")}</ul>` : ""}
        ${d.unknown.length ? `<p class="sg-lab">Not known yet</p><ul class="sg-unk">${d.unknown.map(u => `<li>${e(u)}</li>`).join("")}</ul>` : ""}
        <p class="sg-next"><span class="sg-lab">What would change this record</span>${e(d.next)}</p></div>`;
  };
  const srcList = s => `<ul class="sg-evs">${(s.sources || []).map(x => {
    const c = SM.termsFound(x.url, null, ctx.CHECKS), sc = SM.sourceCheck(x.url, ctx.CHECKS);
    const st = c ? `checked ${e(SM.date(c.checked))}` : sc.content.length ? `opened ${e(SM.date(sc.content[0].checked))}; not every expected term was found` : sc.link.length ? `opened in a link check ${e(SM.date(sc.link[0].checked))}; content not checked` : "no check record in this repository";
    return `<li class="sg-ev"><span class="sg-ev__src">${ext(x.url, x.label)} <span class="sg-tag">${x.type === "original" ? "Original" : "Secondary"}</span></span><span class="sg-ev__chk">${st}</span></li>`; }).join("")}</ul>`;
  const lastChecked = s => (s.sources || []).map(x => { const c = SM.sourceCheck(x.url, ctx.CHECKS); return (c.content[0] || c.link[0] || {}).checked; }).filter(Boolean).sort().pop();
  const related = s => {
    const L = [];
    for (const p of s.places || []) if (ctx.countries.has(p)) L.push(`<a href="/countries/${e(p)}/">${e(PLACE[p] || p)}</a>`);
    for (const l of s.levers || []) L.push(`<a href="/actions/#${e(l)}">${e(ctx.levers[l] || l)}</a>`);
    if ((s.deliverables || []).some(d => d.type === "funding")) L.push(`<a href="/paying-for-protection/">Paying for protection</a>`);
    if ((s.populations || []).length) L.push(`<a href="/who-is-at-risk/">Who heat hits hardest</a>`);
    return L.length ? `<p class="sg-rel"><span class="sg-lab">Explore on Common Shade</span>${L.join("")}</p>` : "";
  };
  const reading = s => s.reading ? `<details class="sg-read"><summary>Common Shade's reading <span class="sg-tag">Interpretation</span></summary>
        <dl>${[["What has changed", "changed"], ["Why it may matter for heat protection", "matters"], ["Decisions it could affect", "decisions"], ["What remains uncertain", "uncertain"], ["What to examine next", "examine"]].map(([h, k]) => `<dt>${h}</dt><dd>${e(s.reading[k])}</dd>`).join("")}</dl>
        <p class="sg-small">Interpretation by Common Shade, reviewed ${e(SM.date(s.reading.reviewed))}, drawn only from the record above. It does not describe anyone's circumstances and is not an invitation to apply or partner.</p></details>` : "";
  return function card(s) {
    const k = T.kindOf(s), isC = s.kind === "commitment", latest = SM.latest(s, ctx.today), up = SM.upcoming(s, ctx.today);
    const ds = s.deliverables || [], rungs = new Set(), states = new Set();
    for (const d of ds) for (const c of SM.checklist(d, s, ctx.CHECKS, ctx.today)) if (/confirmed|reported|unverified/.test(c.status)) { rungs.add(c.rung); states.add(c.status); }
    const nextMs = up.find(u => u.kind === "milestone"), checked = lastChecked(s);
    return `<article class="sg-card sg-card--${s.kind}" id="${e(s.id)}" data-kind="${e(s.kind)}" data-group="${e(s.group)}" data-places="${e((s.places || []).join(" "))}" data-levers="${e((s.levers || []).join(" "))}" data-pops="${e((s.populations || []).join(" "))}" data-latest="${e(latest)}" data-due="${e((s.review || {}).due || "")}" data-up="${e(nextMs ? nextMs.date : "")}" data-rungs="${[...rungs].join(" ")}" data-states="${[...states].join(" ")}">
      <p class="sg-meta"><span class="sg-kind sg-kind--${s.kind}">${e(k.label)}</span>${s.group === "cop31" ? `<a class="sg-tag sg-tag--watch" href="#cop31">COP31 watch</a>` : ""}<span class="sg-meta__d">Latest development ${time(latest)}</span></p>
      <h3 class="sg-h"><a href="#${e(s.id)}">${e(s.title)}</a></h3>
      <p class="sg-who">${e(s.who)} <span aria-hidden="true">·</span> ${e(s.where)}</p>
      <p class="sg-sum">${e(s.summary)}</p>
      ${s.relevance && s.relevance.basis === "interpreted" ? `<p class="sg-rlv"><span class="sg-tag">Heat link: Common Shade's reading</span> ${e(s.relevance.note)}</p>` : ""}
      ${nextMs ? `<p class="sg-up"><span aria-hidden="true">◷</span> ${e(nextMs.what)}: ${time(nextMs.date)}. Reaching this date will not, by itself, show the rule is being followed.</p>` : ""}
      ${isC ? `<div class="sg-dels"><p class="sg-lab">What is tracked (${ds.length} deliverable${ds.length > 1 ? "s" : ""})</p>${ds.map(d => deliverable(s, d)).join("")}</div>` : `<p class="sg-next"><span class="sg-lab">What to watch</span>${e(s.next)}</p>`}
      <details class="sg-rec"><summary>${isC ? "Evidence, history and what is not known" : "Sources and review"}</summary>
        ${isC ? ds.map(d => record(s, d)).join("") : srcList(s)}
        ${(s.corrections || []).length ? `<p class="sg-lab">Corrected by Common Shade</p><ul>${s.corrections.map(c => `<li>${time(c.date)} ${e(c.note)} <a href="/corrections/">Corrections</a></li>`).join("")}</ul>` : ""}
        <p class="sg-review"><span class="sg-lab">Review</span>Record last reviewed ${time(s.review.reviewed)}. Sources last checked ${checked ? time(checked) : "never"}. Next review due ${time(s.review.due)}. <a href="#sg-method">What a review covers</a></p>
      </details>
      ${reading(s)}
      ${s.id === ENSO_FINDING ? `<p class="sg-small">Read with the <a href="#el-nino-watch">El Niño watch</a> above, which shows the latest official bulletin, and the explainer <a href="/el-nino/">El Niño and heat in Asia</a>.</p>` : ""}
      ${related(s)}
      <p class="sg-tools" hidden><button type="button" class="sg-save" data-save="${e(s.id)}" aria-pressed="false">Save</button><button type="button" class="sg-copy" data-copy="${e(s.id)}">Copy link</button></p>
    </article>`;
  };
}

module.exports = function signals({ page, write, esc, hero }) {
  const EO = require("./enso-outlook.js"), EOD = EO.load().O;
  const V = (require("fs").readFileSync(require("path").join(__dirname, "..", "index.html"), "utf8").match(/styles\.css\?v=(\d+)/) || [, "1"])[1];
  const D = T.load(), today = new Date().toISOString().slice(0, 10), ctx = context(today), card = render(esc, ctx), e = s => esc(s);
  const O = SM.overview(D, ctx.CHECKS, today), B = O.buckets;
  const sorted = D.signals.slice().sort((a, b) => SM.key(SM.latest(b, today)).localeCompare(SM.key(SM.latest(a, today))) || a.id.localeCompare(b.id));
  const cop = D.groups.find(g => g.id === "cop31");
  // what moved, and the feed and calendar for following it (tools/signals-feeds.js)
  const F = require("./signals-feeds.js"), MV = F.moved(D, today, s => T.kindOf(s).label), ENSO = J("data/site/enso-outlook.json");
  fs.writeFileSync(path.join(ROOT, "signals", "feed.xml"), F.atom(D, today, T.LEDE));
  const CAL = F.ics(D, today, ENSO); fs.writeFileSync(path.join(ROOT, "signals", "calendar.ics"), CAL.text);
  // the newest records render on the page; the rest load from cards.json when a reader asks for them (signals.js), and
  // /signals/all/ lists every record for readers without JavaScript, so the page stays light however many records there are
  const FIRST = 8, html = sorted.map(s => ({ id: s.id, html: card(s) })), shownFirst = html.slice(0, FIRST), rest = html.slice(FIRST);
  fs.writeFileSync(path.join(ROOT, "signals", "cards.json"), JSON.stringify({ about: "Record cards for /signals/ beyond the newest " + FIRST + ", loaded on request by signals/signals.js. Built by tools/build-signals.js from data/site/signals.json; do not edit.", cards: rest }) + "\n");
  const mvItem = m => `<li><time datetime="${e(m.date)}">${e(SM.date(m.date))}</time><span class="sg-mv__what">${e(m.what)}</span><a href="#${e(m.anchor)}">${e(m.item)}</a>${m.item !== m.s.title ? `<span class="sg-mv__in">${e(m.s.title)}</span>` : ""}</li>`;
  const MAXMV = 6, enNext = ENSO.status && ENSO.status.next > today ? ENSO.status : null;
  const movedHtml = `<section class="sg-moved" id="moved" aria-labelledby="moved-h"><div class="container">
    <h2 class="sg-h2" id="moved-h">What moved</h2>
    <p class="sg-small">${e(T.MOVED_NOTE(F.WINDOW))}</p>
    ${MV.past.length ? `<ol class="sg-mv">${MV.past.slice(0, MAXMV).map(mvItem).join("")}</ol>${MV.past.length > MAXMV ? `<p class="sg-small">${MV.past.length - MAXMV} more dated in the same ${F.WINDOW} days are in the records below.</p>` : ""}` : `<p>${e(T.MOVED_NONE(F.WINDOW))}</p>`}
    ${MV.ahead.length || enNext ? `<h3 class="sg-h3">Coming up</h3><ol class="sg-mv sg-mv--ahead">${MV.ahead.map(m => mvItem(Object.assign({}, m, { what: m.what + " (scheduled)" }))).join("")}${enNext ? `<li><time datetime="${e(enNext.next)}">${e(SM.date(enNext.next))}</time><span class="sg-mv__what">Next bulletin</span><a href="#el-nino-watch">${e(enNext.issuer)}, ${e(enNext.bulletin)}</a></li>` : ""}</ol><p class="sg-small">${e(T.AHEAD_NOTE)}</p>` : ""}
    <p class="sg-follow"><span class="sg-lab">Follow without an account</span><a href="/signals/feed.xml" type="application/atom+xml">Feed of records (Atom)</a><a href="/signals/calendar.ics" type="text/calendar">Calendar of scheduled dates (${CAL.n})</a><a href="/whats-new/">The monthly briefing</a></p>
    <nav class="sg-jump" aria-label="On this page"><a href="#records">Every record</a><a href="#where">Where commitments stand</a><a href="#el-nino-watch">El Niño watch</a><a href="#cop31">COP31 watch</a><a href="#sg-method">How records are kept</a></nav>
  </div></section>`;
  const opt = (v, l) => `<option value="${e(v)}">${e(l)}</option>`;
  const placesUsed = [...new Set([...D.signals.flatMap(s => s.places || []), ...Object.keys(require("./signals-harvest.js").PLACES)])].sort((a, b) => a === "region" ? -1 : b === "region" ? 1 : (PLACE[a] || a).localeCompare(PLACE[b] || b)).filter((p, i, a) => a.indexOf(p) === i);
  const leversUsed = [...new Set(D.signals.flatMap(s => s.levers || []))].sort((a, b) => (ctx.levers[a] || a).localeCompare(ctx.levers[b] || b));
  const popsUsed = [...new Set(D.signals.flatMap(s => s.populations || []))];
  // where records are: every place the weekly harvest searches, alphabetical (never ranked), with its records here and
  // when the harvest last searched it; a zero describes the records kept here, not the place (tools/signals-harvest.js)
  const H = require("./signals-harvest.js"), LS = H.lastSearched(), CN = require("./signals-context.js").NAME;
  const covRows = Object.keys(H.PLACES).filter(p => p !== "region").map(p => ({ p, name: (CN[p] || p).replace(/^the /, ""), n: D.signals.filter(s => (s.places || []).includes(p)).length }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const coverage = `<div class="sg-cov" id="coverage"><h3 class="sg-h3">${e(T.COV_H)}</h3><p class="sg-small">${e(T.COV_NOTE)}</p>
      <ul class="sg-cov__l">${covRows.map(r => `<li class="${r.n ? "" : "is-zero"}"><a href="/signals/?place=${e(r.p)}"><b>${r.n}</b> ${e(r.name)}</a><span>${LS[r.p] ? `${e(T.COV_SEARCHED)} ${e(SM.date(LS[r.p]))}` : e(T.COV_NOT_YET)}</span></li>`).join("")}
      <li><a href="/signals/?place=region"><b>${D.signals.filter(s => (s.places || []).includes("region")).length}</b> ${e(T.COV_REGION)}</a><span>${LS.region ? `${e(T.COV_SEARCHED)} ${e(SM.date(LS.region))}` : e(T.COV_NOT_YET)}</span></li></ul></div>`;
  const overview = `<ol class="sg-ov">${[...SM.RUNGS, "none"].filter(r => r !== "none" || B.none.n).map(r => `<li${B[r].n ? "" : ' class="is-empty"'}><span class="sg-ov__n">${B[r].n}</span>
        <span class="sg-ov__l"><b>${r === "none" ? "No step with evidence yet" : e(SM.RUNG_LABEL[r])}</b>${r === "none" ? "" : ` <span>${e(D.ladder.find(l => l.id === r).means)}</span>`}${B[r].reportedOnly ? ` <span class="sg-ov__f">${B[r].reportedOnly} of these rest${B[r].reportedOnly === 1 ? "s" : ""} on secondary reports only.</span>` : ""}${B[r].unverified ? ` <span class="sg-ov__f">${B[r].unverified} not verified by a content check.</span>` : ""}</span></li>`).join("")}</ol>`;
  const checkins = (cop.checkins || []).map(c => `<li><p><b>${time2(c.date)} · ${e(c.label)}</b> ${e(c.note)}</p><ul>${c.added.map(id => { const s = D.signals.find(x => x.id === id); return `<li><a href="#${e(id)}">${e(s.title)}</a> <span class="sg-tag">${e(T.kindOf(s).label)}</span></li>`; }).join("")}</ul></li>`).join("");
  function time2(d) { return `<time datetime="${e(d)}">${e(SM.date(d))}</time>`; }
  const body = `${hero("News and evidence", T.TITLE, e(T.LEDE))}
  ${movedHtml}
  <section class="sg-year" id="records" aria-labelledby="records-h"><div class="container">
    <p class="eyebrow eyebrow--break">Every record</p>
    <h2 class="sg-h2" id="records-h">Developments, newest first</h2>
    <form class="sg-find" id="sg-find" hidden role="search" aria-label="Find signals" onsubmit="return false">
      <div class="sg-views" role="group" aria-label="View"><button type="button" data-view="recent" aria-pressed="true">Recent developments</button><button type="button" data-view="commitments" aria-pressed="false">Commitments and evidence</button><button type="button" data-view="upcoming" aria-pressed="false">Coming up</button><button type="button" data-view="saved" aria-pressed="false">Saved</button></div>
      <label class="sg-f sg-f--q"><span>Search</span><input type="search" name="q" autocomplete="off" placeholder="A place, an institution, a word"></label>
      <details class="sg-more-f"><summary>More filters <span class="sg-nf"></span></summary><div class="sg-fields">
        <label class="sg-f"><span>Place</span><select name="place">${opt("", "Any place")}${placesUsed.map(p => opt(p, PLACE[p] || (require("./signals-context.js").NAME[p] || p).replace(/^the /, ""))).join("")}</select></label>
        <label class="sg-f"><span>Kind</span><select name="kind">${opt("", "Any kind")}${D.kinds.map(k => opt(k.id, k.label)).join("")}</select></label>
        <label class="sg-f"><span>Action it touches</span><select name="lever">${opt("", "Any action")}${leversUsed.map(l => opt(l, ctx.levers[l] || l)).join("")}</select></label>
        ${popsUsed.length ? `<label class="sg-f"><span>People</span><select name="pop">${opt("", "Anyone")}${popsUsed.map(p => opt(p, ctx.people[p] || p)).join("")}</select></label>` : ""}
        <label class="sg-f"><span>Step with evidence</span><select name="rung">${opt("", "Any step")}${SM.RUNGS.map(r => opt(r, SM.RUNG_LABEL[r])).join("")}</select></label>
        <label class="sg-f"><span>Evidence</span><select name="state">${opt("", "Any")}${["confirmed", "reported", "unverified"].map(s => opt(s, SM.STATE[s].label)).join("")}</select></label>
        <label class="sg-f sg-f--c"><input type="checkbox" name="recent" value="1"> <span>A development in the last 90 days</span></label>
        <label class="sg-f sg-f--c"><input type="checkbox" name="due" value="1"> <span>Due for review within 30 days</span></label>
      </div></details>
      <p class="sg-status" role="status" aria-live="polite"></p>
      <div class="sg-actions"><button type="button" data-act="share">Copy link to this view</button><button type="button" data-act="print">Print a briefing</button><button type="button" data-act="download">Download as text</button><button type="button" data-act="reset">Clear filters</button></div>
      <p class="sg-small sg-saved-note">${e(T.SAVED_NOTE)} <button type="button" data-act="clear-saved" class="sg-link">Forget saved records</button></p>
    </form>
    <div class="sg-list" id="sg-list" data-total="${sorted.length}" data-more="${rest.length ? "/signals/cards.json?v=" + T.V : ""}">${shownFirst.map(c => c.html).join("")}</div>
    ${rest.length ? `<p class="sg-morelink" id="sg-morelink">${e(T.SHOWING(shownFirst.length, sorted.length))} <a href="/signals/all/">${e(T.SEE_ALL(sorted.length))}</a></p>
    <div class="sg-older" id="sg-older"><p class="sg-lab">${e(T.OLDER)}</p><ol>${sorted.slice(FIRST).map(s => `<li id="${e(s.id)}"><a href="/signals/all/#${e(s.id)}">${e(s.title)}</a> <span class="sg-small">${e(T.kindOf(s).label)} · latest development ${e(SM.date(SM.latest(s, today)))}</span></li>`).join("")}</ol></div>` : ""}
    <p class="sg-empty" id="sg-empty" hidden>${e(T.EMPTY)} <button type="button" data-act="reset" class="sg-link">Clear filters</button></p>
  </div></section>
  <section class="sg-glance" id="where" aria-labelledby="sg-glance-h"><div class="container">
    <p class="eyebrow eyebrow--break">Where the commitments stand</p>
    <h2 class="sg-h2" id="sg-glance-h">From promise to proof, deliverable by deliverable</h2>
    <p class="sg-denom">${e(T.denominator(O))}</p>
    ${overview}
    <p class="sg-note">${e(T.NOTE)}</p>
    <p class="sg-keys"><span><span aria-hidden="true">✓</span> ${e(SM.STATE.confirmed.label)}</span><span><span aria-hidden="true">◐</span> ${e(SM.STATE.reported.label)}</span><span><span aria-hidden="true">○</span> ${e(SM.STATE.unverified.label)}</span><span><span aria-hidden="true">◷</span> Scheduled: a future date, not yet reached</span><span><span aria-hidden="true">–</span> Not verified in the sources checked</span></p>
    <p class="sg-kinds">${D.kinds.map(k => `<span><span class="sg-kind sg-kind--${k.id}">${e(k.label)}</span> ${e(k.means)}</span>`).join("")}</p>
    ${coverage}
    <div class="cs-note sg-cq" id="commitment-questions"><span class="cs-note__label">${e(SH.COMMITMENT.h)}</span><p>${e(SH.COMMITMENT.intro)}</p><ol>${SH.COMMITMENT.questions.map(q => `<li>${e(q)}</li>`).join("")}</ol></div>
  </div></section>
  <section class="sg-watch" id="el-nino-watch" aria-labelledby="enso-watch-h"><div class="container">
    ${EO.panel(e, { today })}
    <p class="sg-small">A hot, dry season can strain water, power, work, schools and care at once, in the same households. <a href="/el-nino/#daily">How these pathways connect</a>, and why the outlook alone cannot say which matters where.</p>
    <p class="sg-small">An outlook is a finding, not a commitment, so it stays outside the commitments above. The finding is tracked as <a href="#${e(EOD.finding)}">${e((D.signals.find(x => x.id === EOD.finding) || {}).title || "the El Niño record")}</a>; preparedness commitments made in response are tracked as their own records: ${EOD.commitments.map(id => { const x = D.signals.find(r => r.id === id); return x ? `<a href="#${e(id)}">${e(x.title)}</a>` : ""; }).filter(Boolean).join(" · ")}.</p>
  </div></section>
  <section class="sg-cop" id="cop31" aria-labelledby="cop31-h"><div class="container">
    <p class="sg-cop__when">${e(cop.when || "")}</p>
    <h2 class="sg-h2" id="cop31-h">${e(cop.label)}</h2>
    <p class="sg-cop__p">${e(cop.intro)}</p>
    <dl class="sg-cop__dl"><dt>Scope</dt><dd>${e(cop.scope)}</dd><dt>Review cut-off</dt><dd>${time2(cop.cutoff)}. Developments after this date are not yet reflected.</dd>
      <dt>Following</dt><dd>${cop.watching.map(w => `<span class="sg-chip">${e(w)}</span>`).join(" ")}</dd></dl>
    ${cop.reading ? `<p class="sg-cop__p"><b>${e(cop.reading.label)}.</b> ${e(cop.reading.text)}</p>` : ""}
    <details class="sg-cop__ci"><summary>Dated check-ins (${(cop.checkins || []).length}), latest ${time2((cop.checkins || []).slice(-1)[0].date)}</summary><ol class="sg-checkins">${checkins}</ol></details>
    <p class="sg-cop__p"><b>Closing synthesis.</b> ${cop.synthesis ? `${e(cop.synthesis.text)} (reviewed ${time2(cop.synthesis.reviewed)})` : e(T.NO_SYNTHESIS)}</p>
    <p class="sg-cop__p sg-small">${e(T.WATCH_NOTE)}</p>
  </div></section>
  <section class="sg-method" id="sg-method" aria-labelledby="sg-method-h"><div class="container">
    <h2 class="sg-h2" id="sg-method-h">How records are kept</h2>
    <h3 class="sg-h3">What this page is for</h3>
    <ul class="sg-uses">${T.USES.map(u => `<li>${e(u)}</li>`).join("")}</ul>
    <p class="sg-small">${e(T.DISTINCT)} <a href="/growing/">Watch Common Shade grow</a> · <a href="/evidence-map/">Evidence map</a> · <a href="/paying-for-protection/">Paying for protection</a> · <a href="/heat-economy/flows/">Funding traced</a></p>
    <h3 class="sg-h3">Method</h3>
    <ul class="sg-uses">${T.METHOD.map(m => `<li>${e(m)}</li>`).join("")}</ul>
    <p class="sg-small">${e(SM.REVIEW_SCOPE)}</p>
    <p class="hub-p sg-more">Know of a development we have missed, or one that has moved? <a href="/join/?about=Signals#way-share">Tell us, with its source</a>. The whole record is open: <a href="/data/site/signals.json">signals.json</a>, with its <a href="/data/site/signals-checks.json">source-check records</a>, and a <a href="/signals/index.md">plain-text version</a>. See also <a href="/whats-new/">State of the field</a> and <a href="/news/">Heat in the news</a>.</p>
  </div></section>
  <script src="/signals/signals.js?v=${T.V}" defer></script>`;
  const feedLink = `\n  <link rel="alternate" type="application/atom+xml" title="Common Shade: Signals" href="/signals/feed.xml">`;
  write("signals", page("signals", "Signals: which way heat policy is moving", T.LEDE, body, `\n  <link rel="stylesheet" href="/el-nino/watch.css?v=${V}">${feedLink}`));
  // every record on one page, for readers without JavaScript and for printing the lot
  write("signals/all", page("signals/all", "Signals: every record", `All ${sorted.length} records on Signals, newest first, on one page.`, `${hero("Signals", "Every record", e(T.ALL_LEDE))}
  <section class="sg-year" aria-label="Every record"><div class="container"><div class="sg-list">${html.map(c => c.html.replace(/href="#/g, 'href="/signals/#')).join("")}</div>
    <p class="hub-p"><a href="/signals/">Back to Signals</a>, with what moved, the filters and the watches.</p></div></section>`, feedLink));
  return D.signals.length;
};
module.exports.render = render;
module.exports.context = context;
