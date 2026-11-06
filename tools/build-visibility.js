// How heat became visible (/how-heat-became-visible/): when science, health, labour, finance and the UN began to notice
// extreme heat, and who was still missing. Every event, turning point and IPCC row is written into the page, so it reads
// in full without JavaScript; the page script (/how-heat-became-visible/visibility.js) only filters the timeline.
// The site's own heatwaves (HEATWAVES) sit on the timeline as markers, next to what the world was noticing at the time.
// Data: HEAT_VISIBILITY (data/core, built by research/2026-11/heat-visibility/convert.js). Called by tools/build-pages.js.
"use strict";
const T = require("./visibility-text.js");
module.exports = function visibility({ page, write, esc, hero, V, D }) {
  const H = D.HEAT_VISIBILITY; if (!H) return;
  const S = T.byKey(H), HW = Object.fromEntries(D.HEATWAVES.map(h => [h.id, h]));
  const ext = (url, text) => `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(text)}<span class="visually-hidden"> (opens in a new tab)</span></a>`;
  // sources fold behind one line (native details, so they open without JavaScript too); the story stays in view
  const srcList = keys => { const ss = keys.map(k => S[k]).filter(Boolean); return ss.length ? `<details class="hv-src"><summary>Sources <span>(${ss.length})</span></summary><ul>${ss.map(s =>
    `<li>${ext(s.url, s.label)}${s.by ? ` <small>${esc(s.by)}${s.year ? `, ${s.year}` : ""}</small>` : ""}${s.archive ? ` <a class="hv-arc" href="${esc(s.archive)}" target="_blank" rel="noopener">archived copy<span class="visually-hidden"> of ${esc(s.label)} (opens in a new tab)</span></a>` : ""}</li>`).join("")}</ul></details>` : ""; };
  const grade = g => `<span class="hv-grade hv-grade--${g}" title="${esc(H.grades[g] || "")}">${esc(T.GRADES[g] || g)}</span>`;

  // the timeline: events, and the site's heatwaves that no event already links to, in date order
  const linked = new Set(H.events.map(e => e.heatwave).filter(Boolean));
  const monthOf = w => { const m = /January|February|March|April|May|June|July|August|September|October|November|December/.exec(w || ""); return m ? String(["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].indexOf(m[0]) + 1).padStart(2, "0") : ""; };
  const items = [...H.events.map(e => ({ kind: "event", sort: e.date, e })),
    ...D.HEATWAVES.filter(h => !linked.has(h.id)).map(h => ({ kind: "heatwave", sort: `${h.year}-${monthOf(h.when) || "06"}`, h }))]
    .sort((a, b) => a.sort.slice(0, 4).localeCompare(b.sort.slice(0, 4)) || (a.sort.length === 4 ? -1 : b.sort.length === 4 ? 1 : a.sort.localeCompare(b.sort)));
  const nextAsia = e => H.events.find(x => x.asia && x.date > e.date && x.id !== e.id && !x.heatwave);
  const li = it => {
    if (it.kind === "heatwave") { const h = it.h; return `<li class="hv-ev hv-ev--hw" data-threads="heatwave" data-scope="regional" data-asia="1" data-grade="known" data-hw="1">
        <p class="hv-when"><time>${esc(h.when)}</time><span class="hv-tag">Heatwave in Asia</span></p>
        <h3 class="hv-t"><a href="/heatwaves/#${esc(h.id)}">${esc(h.title)}</a></h3>
        <p class="hv-what">${esc(h.place)}. From <a href="/heatwaves/">Heatwaves that shaped Asia</a>, where its sources are.</p></li>`; }
    const e = it.e, hw = e.heatwave && HW[e.heatwave], nx = hw && nextAsia(e);
    return `<li class="hv-ev" id="${esc(e.id)}" data-threads="${esc(e.threads.join(" "))}" data-scope="${esc(e.scope)}" data-asia="${e.asia ? 1 : 0}" data-grade="${esc(e.grade)}">
        <p class="hv-when"><time datetime="${esc(e.date)}">${esc(T.when(e))}</time>${e.place ? `<span class="hv-place">${esc(e.place)}</span>` : ""}${grade(e.grade)}${e.first === "claimed" ? `<span class="hv-tag hv-tag--first" title="Its source describes it as the first of its kind; this was not independently checked across every place.">Claimed first</span>` : ""}</p>
        <h3 class="hv-t">${esc(e.title)}</h3>
        <p class="hv-what">${esc(e.what)}</p>
        <p class="hv-why"><b>Why it mattered:</b> ${esc(e.why)}</p>
        ${e.quote ? `<blockquote class="hv-q"><p>“${esc(e.quote)}”</p><footer>${esc(e.quote_loc)}, ${esc((S[e.sources[0]] || {}).by || "")}</footer></blockquote>` : ""}
        ${hw ? `<p class="hv-hw"><a href="/heatwaves/#${esc(hw.id)}">See this heatwave: ${esc(hw.title)} <span aria-hidden="true">→</span></a>${nx ? `<span>Next on this timeline in South and Southeast Asia: <a href="#${esc(nx.id)}">${esc(nx.title)}</a> (${esc(T.when(nx))})</span>` : ""}</p>` : ""}
        <p class="hv-threads">${[...e.threads.map(t => T.THREADS[t] || t), T.SCOPES[e.scope] || e.scope, ...(e.asia ? ["South and Southeast Asia"] : [])].map(esc).join(" · ")}</p>
        ${srcList(e.sources)}</li>`;
  };
  // jump links: the first event of each decade (a link to a hidden event clears the filters, in visibility.js)
  const decades = []; H.events.forEach(e => { const d = e.date.slice(0, 3) + "0s"; if (!decades.some(x => x[0] === d)) decades.push([d, e.id]); });
  const count = k => H.events.filter(e => e.threads.includes(k)).length;
  const asiaN = H.events.filter(e => e.asia).length;
  const audited = H.ipcc.filter(r => r.audited), unread = H.ipcc.filter(r => !r.audited);

  const body = `${hero("Understand heat", T.TITLE, `When science, health, labour, finance and the UN began to notice extreme heat, and who was still missing each time. ${H.events.length} events from the record, each graded by how well its sources support it.`)}
    <section class="container hv-sec hv-intro">
      <ul class="hv-notes">${H.caveats.map(c => `<li>${esc(c)}</li>`).join("")}<li>Research cut-off: ${esc(H.cutoff)}. <a href="#limits">What this page could not verify</a>.</li></ul>
      <p class="hv-jump"><a href="#story">The story</a> · <a href="#turning">Turning points</a> · <a href="#timeline">Timeline</a> · <a href="#ipcc">IPCC reports</a> · <a href="/heatwaves/">Heatwaves that shaped Asia</a></p>
    </section>

    <section class="container hv-sec" id="story" aria-labelledby="hv-story-h">
      <h2 class="hub-h" id="hv-story-h">The story in eras</h2>
      <ol class="hv-eras">${H.story.map(s => `<li class="hv-era" id="era-${esc(s.id)}">${s.span ? `<p class="hv-span">${esc(s.span)}</p>` : ""}<h3>${esc(s.title)}</h3><p>${esc(s.text)}</p>${srcList(s.sources)}</li>`).join("")}</ol>
    </section>

    <section class="container hv-sec" id="turning" aria-labelledby="hv-turn-h">
      <h2 class="hub-h" id="hv-turn-h">Turning points, and who was still missing</h2>
      <ol class="hv-turns">${H.turning.map(t => `<li class="hv-turn" id="turn-${esc(t.id)}"><p class="hv-span">${esc(t.span)}</p><h3>${esc(t.title)}</h3><p>${esc(t.text)}</p>
        <p class="hv-missing"><b>Who was still missing</b>${esc(t.missing)}</p>${srcList(t.sources)}</li>`).join("")}</ol>
      <p class="hv-close">${esc(H.turningClose)}</p>
    </section>

    <section class="container hv-sec" id="timeline" aria-labelledby="hv-tl-h">
      <h2 class="hub-h" id="hv-tl-h">The timeline</h2>
      <p class="hub-p">Heatwaves in Asia sit beside the events, so each can be read next to what the world was noticing at the time.</p>
      <div class="hv-filters" data-hv-filters hidden>
        <div class="hv-chips" role="group" aria-label="Show one thread"><button type="button" class="chip" data-hv-thread="all" aria-pressed="true">All</button>${Object.entries(T.THREADS).filter(([k]) => count(k)).map(([k, n]) => `<button type="button" class="chip" data-hv-thread="${k}" aria-pressed="false">${esc(n)} <span>${count(k)}</span></button>`).join("")}</div>
        <div class="hv-row">
          <label class="hv-sel"><span>Scope</span><select data-hv-scope><option value="all">Every scope</option>${Object.entries(T.SCOPES).map(([k, n]) => `<option value="${k}">${esc(n)}</option>`).join("")}</select></label>
          <label class="hv-sel"><span>Evidence</span><select data-hv-grade><option value="all">Every grade</option>${Object.entries(T.GRADES).filter(([k]) => H.events.some(e => e.grade === k)).map(([k, n]) => `<option value="${k}">${esc(n)}</option>`).join("")}</select></label>
          <label class="key key--switch hv-switch"><input type="checkbox" data-hv-asia><span class="switch" aria-hidden="true"></span>South and Southeast Asia only <span class="hv-n">${asiaN}</span></label>
          <label class="key key--switch hv-switch"><input type="checkbox" data-hv-hw checked><span class="switch" aria-hidden="true"></span>Show Asia’s heatwaves</label>
        </div>
        <p class="hv-count" data-hv-count aria-live="polite"></p>
      </div>
      <p class="hv-decades"><span>Jump to</span> ${decades.map(([d, id]) => `<a href="#${esc(id)}">${esc(d)}</a>`).join("")}</p>
      <ol class="hv-list" data-hv-list>${items.map(li).join("")}</ol>
      <p class="hv-empty" data-hv-empty hidden>No event matches these filters. <button type="button" class="link" data-hv-reset>Show everything</button></p>
    </section>

    <section class="container hv-sec" id="ipcc" aria-labelledby="hv-ipcc-h">
      <h2 class="hub-h" id="hv-ipcc-h">How heat appears in IPCC reports</h2>
      ${H.ipccNotes.map(n => `<p class="hub-p">${esc(n)}</p>`).join("")}
      <ol class="hv-ipcc">${audited.map(r => `<li class="hv-row-ipcc" id="ipcc-${esc(r.id)}"><h3>${esc(r.report)} <span>${esc(r.when)}</span></h3>
        <dl><div><dt>How heat appears</dt><dd>${esc(r.how)}</dd></div><div><dt>Headline statement</dt><dd>${esc(r.headline)}</dd></div><div><dt>The change, and its limits</dt><dd>${esc(r.change)}</dd></div></dl>${srcList(r.sources)}</li>`).join("")}</ol>
      <p class="hv-unread"><b>Identified, heat content not yet read:</b> ${unread.map(r => `${esc(r.report)} (${esc(r.when)})`).join(" · ")}. Not yet read means the passage was not reached in this review, not that heat is absent.</p>
    </section>

    <section class="container hv-sec" id="limits" aria-labelledby="hv-lim-h">
      <h2 class="hub-h" id="hv-lim-h">What this page could not verify</h2>
      <details class="hv-limits"><summary>${H.unverified.length} open questions, from early IPCC wording to media attention</summary>
        <ul>${H.unverified.map(u => `<li><b>${esc(u.topic)}.</b> ${esc(u.text)}</li>`).join("")}</ul></details>
      <p class="hub-p">Know a record that belongs here, or see something to correct? We would be glad to <a href="/join/#join-form">hear about it</a>, and corrections are listed on <a href="/corrections/">Corrections</a>.</p>
      <p class="hv-jump"><a href="/heatwaves/">Heatwaves that shaped Asia</a> · <a href="/atlas/">Atlas of Asia’s heat</a> · <a href="/sources/">Every source on this site</a></p>
    </section>
    <script src="/${T.SLUG}/visibility.js?v=${V}" defer></script>`;
  write(T.SLUG, page(T.SLUG, T.TITLE, `When science, health, labour, finance and the UN began to notice extreme heat, and who was still missing: ${H.events.length} graded events, turning points and how heat appears in IPCC reports.`, body,
    `\n  <link rel="stylesheet" href="/${T.SLUG}/visibility.css?v=${V}">`));   // this page's own styles, so no other page carries them
};
