// Common Shade: /signals/, "Signals". Announcements, commitments, gatherings and findings that show which way heat
// policy is moving. The page has one focal point (the staircase: where every tracked commitment stands on the ladder
// from announced to evaluated), then the COP31 watch as its own dark band, then the year's signals: commitments first,
// furthest along first, then findings, gatherings and guidance. Each card carries its rung, what would move it next,
// its dated history and its checked sources. Plain HTML, no script. Words shared with llms-full.txt are in
// tools/signals-text.js; data in data/site/signals.json. Called by build-pages.js.
"use strict";
const T = require("./signals-text.js");
module.exports = function signals({ page, write, esc, hero }) {
  const D = T.load(), ST = T.standing(D), esc0 = esc;
  esc = s => esc0(s).replace(/ °C/g, "\u00a0°C");   // a figure and its unit stay on one line
  const LEV = JSON.parse(require("fs").readFileSync(require("path").join(__dirname, "..", "data", "core", "LEVERS.json"), "utf8"));
  const leverName = Object.fromEntries((Array.isArray(LEV) ? LEV : LEV.levers || []).map(l => [l.id, l.title]));
  const ext = (u, l) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(l)}<span class="visually-hidden"> (opens in a new tab)</span></a>`;
  const track = s => {
    const at = D.rung[s.stage];
    return `<div class="sg-rungs"><ol class="sg-track" aria-hidden="true">${D.ladder.map((l, i) => `<li class="${i < at ? "is-past" : i === at ? "is-now" : ""}"></li>`).join("")}</ol>
        <p class="sg-rungline"><b>${esc(D.ladder[at].label)}</b> <span>rung ${at + 1} of ${D.ladder.length}</span></p></div>`;
  };
  const card = s => {
    const k = D.kind[s.kind], isC = s.kind === "commitment";
    return `<article class="sg-card sg-card--${s.kind}" id="${esc(s.id)}">
      <p class="sg-meta"><span class="sg-kind sg-kind--${s.kind}">${esc(k.label)}</span><time datetime="${esc(s.date)}">${esc(T.date(s.date))}</time></p>
      <h3 class="sg-h">${esc(s.title)}</h3>
      <p class="sg-who">${esc(s.who)}</p>
      ${isC ? track(s) : ""}
      <p class="sg-sum">${esc(s.summary)}</p>
      <p class="sg-next"><span class="sg-lab">${isC ? "What would move it up" : "What to watch"}</span>${esc(s.next)}</p>
      ${s.history ? `<details class="sg-hist"><summary>How it has moved</summary><ol>${s.history.map(h => `<li><time datetime="${esc(h.date)}">${esc(T.date(h.date))}</time> <b>${esc(D.ladder[D.rung[h.stage]].label)}</b> ${esc(h.note)}</li>`).join("")}</ol></details>` : ""}
      <footer class="sg-foot">
        ${(s.levers || []).length ? `<p class="sg-lev"><span class="sg-lab">Actions it touches</span>${s.levers.map(l => `<a href="/actions/#${esc(l)}">${esc(leverName[l] || l)}</a>`).join("")}</p>` : ""}
        <p class="sg-src"><span class="sg-lab">Source${s.sources.length > 1 ? "s" : ""}</span>${s.sources.map(x => ext(x.url, x.label)).join("<br>")}</p>
      </footer>
    </article>`;
  };
  const list = a => `<div class="sg-list">${a.map(card).join("")}</div>`;
  // the staircase: one step per rung, as tall as its place on the ladder, with the count of commitments standing on it
  const stairs = `<ol class="sg-stairs">${D.ladder.map((l, i) => `<li class="sg-step sg-step--${i + 1}${ST.counts[i] ? "" : " is-empty"}">
        <span class="sg-step__top"><span class="sg-step__n">${ST.counts[i]}</span><span class="sg-step__bar" aria-hidden="true"></span></span>
        <b class="sg-step__l">${i + 1}. ${esc(l.label)}</b><span class="sg-step__m">${esc(l.means)}</span></li>`).join("")}</ol>`;
  const cop = D.groups.find(g => g.id === "cop31"), year = D.groups.find(g => g.id === "year");
  const yearC = D.byGroup.year.filter(s => s.kind === "commitment").sort((a, b) => D.rung[b.stage] - D.rung[a.stage] || String(b.date).localeCompare(String(a.date)));
  const yearO = D.byGroup.year.filter(s => s.kind !== "commitment");
  const body = `${hero("News and evidence", T.TITLE, esc(T.LEDE))}
  <section class="sg-glance" aria-labelledby="sg-glance-h"><div class="container">
    <p class="eyebrow eyebrow--break">The ladder</p>
    <h2 class="sg-h2" id="sg-glance-h">From promise to proof</h2>
    <p class="sg-standing">${esc(ST.line)}</p>
    ${stairs}
    <p class="sg-note">${esc(T.NOTE)}</p>
    <p class="sg-kinds">${D.kinds.map(k => `<span><span class="sg-kind sg-kind--${k.id}">${esc(k.label)}</span> ${esc(k.means)}</span>`).join("")}</p>
  </div></section>
  <section class="sg-cop" id="cop31" aria-labelledby="cop31-h"><div class="container">
    <p class="sg-cop__when">${esc(cop.when || "")}</p>
    <h2 class="sg-h2" id="cop31-h">${esc(cop.label)}</h2>
    <p class="sg-cop__p">${esc(cop.intro)}</p>
    ${cop.reading ? `<p class="sg-cop__p"><b>${esc(cop.reading.label)}.</b> ${esc(cop.reading.text)}</p>` : ""}
    <p class="sg-watch"><span>Watching for heat in</span>${cop.watching.map(w => `<span class="sg-chip">${esc(w)}</span>`).join("")}</p>
    ${D.byGroup.cop31.length ? list(D.byGroup.cop31) : `<p class="sg-empty">No item has passed the check yet.</p>`}
  </div></section>
  <section class="sg-year" id="year" aria-labelledby="year-h"><div class="container">
    <p class="eyebrow eyebrow--break">Already on Common Shade</p>
    <h2 class="sg-h2" id="year-h">${esc(year.label)}</h2>
    <p class="hub-p">${esc(year.intro)}</p>
    <h3 class="sg-h3">Commitments, furthest along first</h3>
    ${list(yearC)}
    <h3 class="sg-h3">Findings, gatherings and guidance</h3>
    ${list(yearO)}
    <p class="hub-p sg-more">Know of a signal we have missed, or one that has moved? <a href="/join/?about=Signals#way-share">Tell us, with its source</a>. See also <a href="/whats-new/">State of the field</a>, <a href="/news/">Heat in the news</a> and <a href="/growing/">Watch Common Shade grow</a>.</p>
  </div></section>`;
  write("signals", page("signals", "Signals: which way heat policy is moving", T.LEDE, body));
  return D.signals.length;
};
