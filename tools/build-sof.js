// Common Shade: State of the field, the monthly briefing. /whats-new/ shows the latest published edition in full, with the
// archive; /whats-new/<YYYY-MM>/ is each edition's stable page, with a Markdown briefing beside it (briefing.md). Each
// edition is built around one argument: up to three developments, one opportunity, one open question, a forward look,
// questions for different readers and a short note on Common Shade. Every claim names its source, the source's date,
// what it establishes and what it does not; dates of occurrence, review, reporting period, cut-off, publication and
// correction are kept apart. Evidence and method are folded, but the article reads whole without opening anything.
// Drafts (data/site/briefs/drafts/) are never written to the tracked site: they go to research/sof-preview/ (git-ignored) for review.
// Model: tools/sof-model.js. Words shared with the briefing and llms-full.txt: tools/sof-text.js. Called by build-pages.js.
// whats-new/sof.js adds the copy, print and share buttons; without it, the download link and the browser's print work.
"use strict";
const fs = require("fs"), path = require("path"), M = require("./sof-model.js"), T = require("./sof-text.js");
const ROOT = M.ROOT, SITE = "https://beattheheat.asia";

function render(esc, ctx) {
  const d8 = M.date, links = ls => (ls || []).length ? `<p class="sof-links">${ls.map(([u, t]) => `<a href="${esc(u)}">${esc(t)}</a>`).join("")}</p>` : "";
  const CHK = s => {
    const c = s.check || {};
    return c.kind === "content" ? `Content checked ${d8(c.checked)}` : c.kind === "link" ? `Link checked only, ${d8(c.checked)}: content not checked` : c.kind === "site" ? "Common Shade's own page" : "No check record";
  };
  return function edition(e, opt = {}) {
    const n = T.srcNo(e), S = e.sources || {}, base = opt.base || "", isLatest = opt.latest;
    const ref = k => `<a class="sof-ref" href="${base}#src-${esc(k)}" aria-label="Source ${n[k]}">[${n[k]}]</a>`;
    const claim = c => `<li class="sof-claim"><p>${c.kind === "not-found" ? `<span class="sof-flag">Not found</span> ` : ""}${esc(c.says)} ${ref(c.source)}</p>
        <p class="sof-est"><b>What this establishes.</b> ${esc(c.establishes)}${c.searched ? ` <b>What was searched.</b> ${esc(c.searched)}` : ""}${c.unverified ? ` <b>Not verified.</b>` : ""}</p>
        <p class="sof-src">${esc(T.TYPE[S[c.source].type])}, ${esc(d8(S[c.source].date))} · ${esc(CHK(S[c.source]))}</p></li>`;
    const sec = (id, h, body, cls = "") => `<section class="sof-s ${cls}" id="${id}" aria-labelledby="${id}-h"><h3 class="sof-sh" id="${id}-h">${esc(h)} <a class="sof-anchor" href="${base}#${id}" aria-label="Link to this section: ${esc(h)}">#</a></h3>${body}</section>`;
    const corr = M.corrections(e);
    const dates = T.dates(e).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${k === "Revised" ? `<a href="${base}#revisions">${esc(v)}</a>` : esc(v)}</dd></div>`).join("");
    const head = `<header class="sof-head">
      <p class="sof-ed-k">${isLatest ? `<span class="sof-badge">Latest published edition</span>` : e.status === "draft" ? `<span class="sof-badge sof-badge--draft">Draft, not published</span>` : `<span class="sof-badge sof-badge--old">Earlier edition</span>`}<span>${esc(M.label(e))}</span></p>
      <h2 class="sof-h">${esc(e.argument.headline)}</h2>
      <dl class="sof-dates">${dates}</dl>
      ${corr.map(c => `<p class="cs-note cs-note--watch sof-corr"><span class="cs-note__label">Corrected ${esc(d8(c.date))}</span>${esc(c.gist)} <a href="${base}#revisions">What changed</a></p>`).join("")}
      ${opt.stale ? `<p class="cs-note sof-stale"><span class="cs-note__label">Not this month's news</span>${esc(opt.stale)}</p>` : ""}
    </header>`;
    const arg = `<section class="sof-arg" id="argument" aria-labelledby="argument-h"><h3 class="sof-k" id="argument-h">The argument</h3><p class="sof-claim-lede">${esc(e.argument.claim)}</p><p class="sof-rests"><b>What this rests on.</b> ${esc(e.argument.rests_on)}</p></section>`;
    const brief = `<section class="sof-brief" aria-labelledby="brief-${e.id}"><h3 class="sof-k" id="brief-${e.id}">In brief</h3><ul>${(e.developments || []).map(d => `<li><a href="${base}#dev-${esc(d.id)}">${esc(d.h)}</a>: ${esc(d.gist)}</li>`).join("")}${e.opportunity ? `<li><a href="${base}#opportunity">Opportunity</a>: ${esc(e.opportunity.h)}.</li>` : ""}${e.question ? `<li><a href="${base}#question">Open question</a>: ${esc(e.question.q)}</li>` : ""}</ul>
      <div class="sof-tools" data-sof-tools><a class="sof-btn" href="${M.url(e)}briefing.md" download="common-shade-state-of-the-field-${e.id}.md">Download the briefing (.md)</a><button type="button" class="sof-btn" data-sof-copy hidden>Copy the summary</button><button type="button" class="sof-btn" data-sof-print hidden>Print</button><button type="button" class="sof-btn" data-sof-link="${SITE}${M.url(e)}" hidden>Copy link to this edition</button><button type="button" class="sof-btn" data-sof-chat hidden>Copy for WhatsApp</button><a class="sof-btn" href="https://wa.me/?text=${encodeURIComponent(T.chatText(e, SITE))}" target="_blank" rel="noopener">Open in WhatsApp<span class="visually-hidden"> (opens in a new tab)</span></a><span class="sof-said" role="status" aria-live="polite"></span></div>
      <script type="text/plain" data-sof-summary>${esc(T.summaryText(e, SITE))}</script><script type="text/plain" data-sof-chattext>${esc(T.chatText(e, SITE))}</script></section>
    <nav class="sof-depth" aria-label="Ways to read this edition"><span class="sof-k">Read it in</span>${T.depths(e).filter(([id]) => id !== "developments" || (e.developments || []).length).map(([id, t]) => `<a href="${base}#${id}">${esc(t)}</a>`).join("")}</nav>`;
    const toc = `<nav class="sof-toc" aria-label="In this edition"><span class="sof-k">In this edition</span>${T.SECTIONS.filter(([id]) => id === "argument" || id === "sources" || id === "revisions" || (id === "developments" ? (e.developments || []).length : id === "opportunity" ? e.opportunity : id === "question" ? e.question : id === "watch" ? (e.watch || []).length : id === "readers" ? (e.audiences || []).length : id === "common-shade" ? e.platform && e.platform.p : true)).map(([id, t]) => `<a href="${base}#${id}">${esc(t)}</a>`).join("")}</nav>`;
    const devs = (e.developments || []).length ? sec("developments", T.H.developments, e.developments.map(d => { const inP = M.inPeriod(d.occurred.date, e.period);
      return `<article class="sof-dev" id="dev-${esc(d.id)}" aria-labelledby="dev-${esc(d.id)}-h"><h4 id="dev-${esc(d.id)}-h">${esc(d.h)}</h4>
        <p class="sof-when"><span><b>Happened</b> ${esc(d8(d.occurred.date))} · ${esc(d.occurred.what)}</span><span><b>Reviewed by Common Shade</b> ${esc(d8(d.reviewed))}</span>${inP ? "" : `<span class="sof-tag">Outside this edition's period</span>`}</p>
        ${inP ? "" : `<p class="sof-why"><b>Why it is in this edition.</b> ${esc(d.why_here)}</p>`}
        <p class="sof-reading"><span class="sof-rl">Common Shade's reading</span> ${esc(d.reading)}</p>
        <details class="sof-ev"><summary>What the sources establish, the limits, and what would change this</summary>
          <ol class="sof-claims">${d.claims.map(claim).join("")}</ol>
          <p class="sof-lh">Limits</p><ul class="sof-limits">${d.limits.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
          <p class="sof-lh">What would strengthen or change this reading</p><p>${esc(d.would_change)}</p></details>
        ${links(d.links)}</article>`; }).join("")) : "";
    const O = e.opportunity;
    const opp = O ? sec("opportunity", T.H.opportunity, `<h4>${esc(O.h)}</h4><p>${esc(O.gist)}</p>
      <dl class="sof-dl">${T.OPP.map(([k, t]) => `<div><dt>${esc(t)}</dt><dd>${esc(O[k])}</dd></div>`).join("")}</dl>
      <details class="sof-ev"><summary>The evidence and its limits</summary><ol class="sof-claims">${O.claims.map(claim).join("")}</ol><p class="sof-lh">Limits</p><ul class="sof-limits">${O.limits.map(x => `<li>${esc(x)}</li>`).join("")}</ul></details>
      ${O.roles ? `<div class="sof-roles"><p class="sof-lh">Who could take part <span class="sof-tag">A proposal</span></p><p class="sof-note">${esc(O.roles.note)}</p><dl class="sof-dl sof-dl--roles">${M.ROLES.map(r => `<div><dt>${T.ROLEW[r]}</dt><dd>${esc(O.roles[r])}</dd></div>`).join("")}</dl></div>` : ""}
      <dl class="sof-dl">${T.OPP2.map(([k, t]) => `<div><dt>${esc(t)}</dt><dd>${esc(O[k])}</dd></div>`).join("")}</dl>${links(O.links)}`) : "";
    const Q = e.question;
    const q = Q ? sec("question", T.H.question, `<h4>${esc(Q.h)}</h4><p class="sof-q">${esc(Q.q)}</p>
      <dl class="sof-dl">${T.QF.map(([k, t]) => `<div><dt>${esc(t)}</dt><dd>${esc(Q[k])}</dd></div>`).join("")}</dl>
      ${(Q.claims || []).length ? `<details class="sof-ev"><summary>The source behind what is known</summary><ol class="sof-claims">${Q.claims.map(claim).join("")}</ol></details>` : ""}
      ${Q.revisits ? `<div class="cs-note sof-revisit"><span class="cs-note__label">Revisiting the ${esc(d8(Q.revisits.edition))} question</span><p><a href="${M.url({ id: Q.revisits.edition })}#question">${esc(Q.revisits.q)}</a></p><dl class="sof-dl"><div><dt>New evidence</dt><dd>${esc(Q.revisits.new_evidence)}</dd></div><div><dt>Did the reading change?</dt><dd>${esc(Q.revisits.changed)}</dd></div><div><dt>Still unresolved</dt><dd>${esc(Q.revisits.unresolved)}</dd></div></dl></div>` : ""}
      ${links(Q.links)}`) : "";
    const watch = (e.watch || []).length ? sec("watch", T.H.watch, `<ul class="sof-watch">${e.watch.map(w => `<li><b>${esc(w.what)}</b><span>Evidence that would matter: ${esc(w.evidence)}${w.link ? `. <a href="${esc(w.link[0])}">${esc(w.link[1])}</a>` : ""}</span></li>`).join("")}</ul>`) : "";
    const aud = (e.audiences || []).length ? sec("readers", T.H.readers, `<p class="sof-note">One question each, drawn from this edition's evidence.</p><dl class="sof-dl sof-dl--aud">${e.audiences.map(a => `<div><dt>${esc(M.AUD[a.who])}</dt><dd>${esc(a.q)}</dd></div>`).join("")}</dl>`) : "";
    const plat = e.platform && e.platform.p ? sec("common-shade", T.H.platform, `<p>${esc(e.platform.p)}</p>${links([...(e.platform.links || []), ["/growing/", "The full record of changes, on Growing"]])}`, "sof-s--quiet") : "";
    const srcs = sec("sources", T.H.sources, `<ol class="sof-srcs">${Object.entries(S).map(([k, s]) => { const now = M.current(s);
      const moved = now.changed ? `<p class="sof-moved">The record this came from has changed since this edition${now.link ? `: <a href="${now.link}">see the current record</a>` : ""}.</p>` : now.gone ? `<p class="sof-moved">The record this came from is no longer in the knowledge base.</p>` : "";
      const newer = s.check && now.check && s.check.kind !== "site" && now.check.checked && now.check.checked !== s.check.checked ? ` · Checked again ${esc(d8(now.check.checked))}` : "";
      return `<li id="src-${esc(k)}"><p><a href="${esc(s.url)}"${/^https?:/.test(s.url) ? ` rel="noopener"` : ""}>${esc(s.title)}</a>${s.publisher && !s.title.includes(s.publisher) ? `, ${esc(s.publisher)}` : ""}</p>
        <p class="sof-src">${esc(d8(s.date))} · ${esc(T.TYPE[s.type])} · At this edition: ${esc(CHK(s))}${newer}${s.archive ? ` · <a href="${esc(s.archive)}" rel="noopener">Archived copy</a>` : ""}</p>${moved}</li>`; }).join("")}</ol>`);
    const revs = sec("revisions", T.H.revisions, `<ol class="sof-revs">${(e.revisions || []).map(r => `<li${r.id ? ` id="${esc(r.id)}"` : ""}><p class="sof-src">${esc(d8(r.date))} · ${r.kind === "correction" ? "Correction" : r.kind === "published" ? "Published" : "Revision"}</p><p>${esc(r.note)}${r.kind === "correction" ? ` <a href="/corrections/#log">Corrections page</a>` : ""}</p></li>`).join("") || "<li>Not yet published.</li>"}</ol>
      ${e.as_published ? `<details class="sof-ev sof-asp"><summary>The text as first published</summary><p class="sof-note">${esc(e.as_published.note)}</p><p><b>${esc(e.as_published.headline)}</b></p>${e.as_published.sections.map(s => `<p><b>${esc(s.k)}: ${esc(s.h)}.</b> ${esc(s.p)}</p>`).join("")}<p class="sof-note">${esc(e.as_published.closing)}</p></details>` : ""}`);
    return `<article class="sof-ed" data-edition="${e.id}" aria-labelledby="sof-h-${e.id}">${head.replace('<h2 class="sof-h">', `<h2 class="sof-h" id="sof-h-${e.id}">`)}${arg}${e.opening ? `<p class="sof-open">${esc(e.opening)}</p>` : ""}${brief}${toc}${devs}${opp}${q}${watch}${aud}${plat}${srcs}${revs}</article>`;
  };
}

// a published edition is old news once the month after its period has ended and nothing newer is out
function staleNote(e, today) {
  const [y, m] = e.period.to.split("-").map(Number), next = new Date(Date.UTC(y, m + 1, 0)).toISOString().slice(0, 10);
  return today > next ? `This edition covers ${M.range(e.period)}, and no newer edition has been published since. For developments after its cut-off, see Signals.` : "";
}

// the edition's share image (tools/sof-card.js) in place of the site's default, when it exists
function withCard(html, e) {
  if (!e || !fs.existsSync(path.join(ROOT, "whats-new", e.id, "card.png"))) return html;
  return html.replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${SITE}${M.url(e)}card.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="State of the field, ${M.label(e)}: ${e.argument.headline.replace(/"/g, "&quot;")}">`);
}
// the editions feed: one entry per published edition, updated at its latest revision
function feed(P) {
  const x = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const up = e => M.revised(e) || e.published;
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Common Shade: State of the field</title>
  <subtitle>${x(T.LEDE)}</subtitle>
  <link rel="alternate" type="text/html" href="${SITE}/whats-new/"/>
  <link rel="self" type="application/atom+xml" href="${SITE}/whats-new/feed.xml"/>
  <id>${SITE}/whats-new/</id>
  <updated>${P.length ? P.map(up).sort().pop() : "2026-10-31"}T00:00:00Z</updated>
  <author><name>Common Shade</name><uri>${SITE}/</uri></author>
  <rights>CC BY 4.0</rights>
${P.map(e => `  <entry>
    <title>${x(`${T.TITLE}, ${M.label(e)}: ${e.argument.headline}`)}</title>
    <link rel="alternate" type="text/html" href="${SITE}${M.url(e)}"/>
    <id>${SITE}${M.url(e)}</id>
    <published>${e.published}T00:00:00Z</published>
    <updated>${up(e)}T00:00:00Z</updated>
    <summary>${x(e.argument.claim)} Reporting period ${x(M.range(e.period))}; evidence cut-off ${x(M.date(e.cutoff))}.${M.corrections(e).length ? " This edition has been corrected; see its revisions." : ""}</summary>
  </entry>`).join("\n")}
</feed>
`;
}

module.exports = function sof({ page, write, esc, hero, V }) {
  const today = new Date().toISOString().slice(0, 10), ed = render(esc), P = M.published(), last = P[0];
  const head = `<script src="/whats-new/sof.js?v=${V}" defer></script>\n  <link rel="alternate" type="application/atom+xml" title="Common Shade: State of the field" href="/whats-new/feed.xml">`;
  fs.writeFileSync(path.join(ROOT, "whats-new", "feed.xml"), feed(P));
  const nextF = path.join(M.DIR, "_next.json"), N = fs.existsSync(nextF) ? JSON.parse(fs.readFileSync(nextF, "utf8")) : null;
  const next = N && (!last || N.month > last.id) ? `<p class="sof-next">${esc(T.NEXT(N))} <span class="sof-follow"><span class="sof-k">${esc(T.FOLLOW)}</span><a href="/whats-new/feed.xml" type="application/atom+xml">Editions feed (Atom)</a><a href="/signals/calendar.ics" type="text/calendar">Calendar of scheduled dates</a><a href="/signals/feed.xml" type="application/atom+xml">Signals feed</a></span></p>` : "";
  const distinct = `<p class="sof-role">${esc(T.ROLE)} ${T.DISTINCT.map(([u, t, d]) => `<a href="${u}">${esc(t)}</a> ${esc(d)}.`).join(" ")}</p>`;
  const archive = `<section class="sof-archive" id="editions" aria-labelledby="editions-h"><h2 class="hub-h" id="editions-h">All editions</h2>
    ${P.length ? `<ol class="sof-arch">${P.map(e => `<li><a href="${M.url(e)}"><b>${esc(M.label(e))}</b><span>${esc(e.argument.headline)}</span></a><p class="sof-src">Reporting period ${esc(M.range(e.period))} · Evidence cut-off ${esc(M.date(e.cutoff))} · Published ${esc(M.date(e.published))}${M.revised(e) ? ` · Revised ${esc(M.date(M.revised(e)))}` : ""}${M.corrections(e).length ? ` · <span class="sof-flag">Corrected</span>` : ""}</p></li>`).join("")}</ol>` : `<p class="hub-p">No edition has been published yet.</p>`}
    <p class="hub-p">Editions appear here only once reviewed and published; a month passing does not create one.</p></section>`;
  const method = `<details class="sof-ev sof-method" id="method"><summary>How an edition is made</summary><ul>${T.METHOD.map(x => `<li>${esc(x)}</li>`).join("")}</ul></details>`;
  const changesF = path.join(ROOT, "data", "kb", "_changes.json"), changes = fs.existsSync(changesF) ? JSON.parse(fs.readFileSync(changesF, "utf8")) : [];
  const log = `<h2 class="hub-h" id="kb-log">What changed in the knowledge base</h2>${changes.length ? `<p class="hub-p">Monthly updates to the records behind the site, newest first. The latest covers ${esc(M.date(changes[0].month))}; each month's update follows its review.</p><ul class="sof-log">${changes.map(c => `<li><b>${esc(M.date(c.month))}</b>: ${c.published.length} new or updated ${c.published.length === 1 ? "record" : "records"}${c.held ? `, ${c.held} held back for checking` : ""}. ${c.published.slice(0, 6).map(r => esc(r.title)).join("; ")}${c.published.length > 6 ? "…" : ""}</li>`).join("")}</ul>` : `<p class="hub-p">No monthly updates yet.</p>`}`;
  write("whats-new", withCard(page("whats-new", T.TITLE, last ? `${T.TITLE}, ${M.label(last)}: ${last.argument.headline}. A monthly briefing on extreme heat in South and Southeast Asia, with its sources and dates.` : T.LEDE,
    `${hero("News and evidence", T.TITLE, esc(T.LEDE))}
    <div class="container sof-wrap">
      ${next}${last ? ed(last, { latest: true, base: "", stale: staleNote(last, today) }) : `<div class="cs-card"><p>No edition has been published yet.</p></div>`}
      ${archive}${distinct}${method}${log}</div>`, head), last));
  for (const e of P) {
    const isLast = e === last;
    write(`whats-new/${e.id}`, withCard(page(`whats-new/${e.id}`, `${T.TITLE}: ${M.label(e)}`, `${e.argument.headline}. ${T.TITLE}, ${M.label(e)}: reporting period ${M.range(e.period)}, evidence cut-off ${M.date(e.cutoff)}.`,
      `${hero("State of the field", `${esc(T.TITLE)}: ${esc(M.label(e))}`, isLast ? "The latest published edition. Its stable link stays the same when newer editions appear." : `An earlier edition, kept as published. <a href="/whats-new/">The latest edition</a>`)}
      <div class="container sof-wrap">${ed(e, { latest: isLast, base: "", stale: isLast ? staleNote(e, today) : "" })}
        <nav class="sof-pager" aria-label="Other editions">${P.map(x => x === e ? `<span aria-current="page">${esc(M.label(x))}</span>` : `<a href="${M.url(x)}">${esc(M.label(x))}</a>`).join("")}<a href="/whats-new/#editions">All editions</a></nav>${method}</div>`, head), e));
    fs.writeFileSync(path.join(ROOT, "whats-new", e.id, "briefing.md"), T.md(e, SITE));
  }
  // drafts: a preview for review only, never in the tracked site (research/sof-preview/ is git-ignored)
  const drafts = M.load({ drafts: true }).filter(e => e.status === "draft"), PV = path.join(ROOT, "research", "sof-preview");
  for (const e of drafts) {
    const html = page(`research/sof-preview/whats-new/${e.id}`, `DRAFT ${T.TITLE}: ${M.label(e)}`, "Draft for editorial review. Not published.",
      `${hero("Draft for review: not published", `${esc(T.TITLE)}: ${esc(M.label(e))}`, esc(e.review_note || "Draft for editorial review."))}<div class="container sof-wrap">${ed(e, { base: "" })}</div>`, head + `<meta name="robots" content="noindex,nofollow">`);
    fs.mkdirSync(path.join(PV, "whats-new", e.id), { recursive: true });
    fs.writeFileSync(path.join(PV, "whats-new", e.id, "index.html"), html);
    fs.writeFileSync(path.join(PV, "whats-new", e.id, "briefing.md"), T.md(e, SITE));
  }
  return { published: P.map(e => e.id), drafts: drafts.map(e => e.id) };
};
module.exports.render = render;
module.exports.staleNote = staleNote;
