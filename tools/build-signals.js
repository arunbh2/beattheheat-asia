// Common Shade: /signals/, "Signals". Announcements, commitments, gatherings and findings that show which way heat
// policy is moving, each on the ladder from announced to evaluated, with its dated history, what would move it next and
// its checked sources. COP31 watch first, then the year's signals. The whole page is plain HTML (no script needed).
// Words shared with llms-full.txt are in tools/signals-text.js; data in data/site/signals.json. Called by build-pages.js.
"use strict";
const T = require("./signals-text.js");
module.exports = function signals({ page, write, esc, hero, V }) {
  const D = T.load();
  const leverName = Object.fromEntries((V.LEVERS || []).map(l => [l.id, l.title]));
  const ext = (u, l) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(l)}<span class="visually-hidden"> (opens in a new tab)</span></a>`;
  const ladder = s => {
    const at = D.rung[s.stage];
    return `<ol class="sg-ladder" aria-label="Rung ${at + 1} of ${D.ladder.length}: ${esc(D.ladder[at].label)}">${D.ladder.map((l, i) =>
      `<li class="sg-rung${i < at ? " is-past" : ""}${i === at ? " is-now" : ""}"${i === at ? ' aria-current="step"' : ""}><span>${esc(l.label)}</span></li>`).join("")}</ol>`;
  };
  const card = s => {
    const k = D.kind[s.kind];
    return `<article class="sg-card sg-card--${s.kind}" id="${esc(s.id)}">
      <p class="sg-meta"><span class="sg-kind">${esc(k.label)}</span> · <time datetime="${esc(s.date)}">${esc(T.date(s.date))}</time> · ${esc(s.who)}</p>
      <h3 class="sg-h">${esc(s.title)}</h3>
      ${s.kind === "commitment" ? ladder(s) : ""}
      <p class="sg-sum">${esc(s.summary)}</p>
      <p class="sg-next"><b>${s.kind === "commitment" ? "What would move it up" : "What to watch"}:</b> ${esc(s.next)}</p>
      ${s.history ? `<details class="sg-hist"><summary>How it has moved</summary><ol>${s.history.map(h => `<li><time datetime="${esc(h.date)}">${esc(T.date(h.date))}</time>: <b>${esc(D.ladder[D.rung[h.stage]].label)}</b>. ${esc(h.note)}</li>`).join("")}</ol></details>` : ""}
      ${(s.levers || []).length ? `<p class="sg-lev">Actions it touches: ${s.levers.map(l => `<a href="/actions/#${esc(l)}">${esc(leverName[l] || l)}</a>`).join(" · ")}</p>` : ""}
      <p class="sg-src">Source${s.sources.length > 1 ? "s" : ""}: ${s.sources.map(x => ext(x.url, x.label)).join(" · ")}</p>
    </article>`;
  };
  const group = g => `<section class="sg-group" id="${esc(g.id)}" aria-labelledby="${esc(g.id)}-h">
      <h2 class="sg-gh" id="${esc(g.id)}-h">${esc(g.label)}</h2>
      <p class="hub-p">${esc(g.intro)}</p>
      ${g.watching ? `<p class="sg-watch"><span>Watching for heat:</span> ${g.watching.map(w => `<span class="sg-chip">${esc(w)}</span>`).join(" ")}</p>` : ""}
      ${D.byGroup[g.id].length ? `<div class="sg-list">${D.byGroup[g.id].map(card).join("")}</div>` : `<p class="sg-empty">No item has passed the check yet. Each one is added on the rung it has truly reached, once its source is confirmed.</p>`}
    </section>`;
  const body = `${hero("News and evidence", T.TITLE, esc(T.LEDE))}
  <div class="container sg-wrap">
    <section class="sg-how" aria-labelledby="sg-how-h">
      <h2 class="sg-gh" id="sg-how-h">How to read a signal</h2>
      <p class="hub-p">${esc(T.NOTE)}</p>
      <ol class="sg-key">${D.ladder.map((l, i) => `<li><b>${i + 1}. ${esc(l.label)}</b> ${esc(l.means)}</li>`).join("")}</ol>
      <p class="sg-kinds">${D.kinds.map(k => `<span class="sg-kind">${esc(k.label)}</span> ${esc(k.means)}`).join(" ")}</p>
    </section>
    ${D.groups.map(group).join("")}
    <p class="hub-p sg-more">Know of a signal we have missed, or one that has moved? <a href="/join/?about=Signals#way-share">Tell us, with its source</a>. See also <a href="/whats-new/">State of the field</a>, <a href="/news/">Heat in the news</a> and <a href="/growing/">Watch Common Shade grow</a>.</p>
  </div>`;
  write("signals", page("signals", "Signals: which way heat policy is moving", T.LEDE, body));
  return D.signals.length;
};
