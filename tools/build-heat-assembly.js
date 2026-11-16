// The Heat Assembly (/heat-assembly/): a game for one person or a group about who can use heat protection. Writes the
// page (with everything the game says, readable without JavaScript), /heat-assembly/data.js (the scenario and words the
// game loads), and the panel on /live-through-a-heatwave/ that loads the game only when a reader presses play.
// Rules: heat-assembly/engine.js. Numbers: data/heat-assembly/scenario.json. Words: tools/heat-assembly-text.js.
// Sources are resolved here from records already on the site; the build stops, naming the record, if one is missing.
"use strict";
const fs = require("fs"), path = require("path");
const T = require("./heat-assembly-text.js");
const SC = () => JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "heat-assembly", "scenario.json"), "utf8"));

// each source ref points into a record: a practical action's field and its evidence source, or an evidence list entry
function sources(D0) {
  // a block the caller did not pass is read from its own file in data/core
  const D = new Proxy(D0 || {}, { get: (o, k) => k in o ? o[k] : (typeof k === "string" && fs.existsSync(path.join(__dirname, "..", "data", "core", k + ".json")) ? JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "core", k + ".json"), "utf8")) : undefined) });
  return SC().sources.map(ref => {
    let text = "", src = null;
    if (ref.record === "ACTION_SETTINGS") {
      const [set, id] = ref.card.split(":"), s = (D.ACTION_SETTINGS || []).find(x => x.id === set), c = s && s.cards.find(x => x.id === id);
      if (!c) throw new Error(`heat assembly: source ${ref.id} names ACTION_SETTINGS ${ref.card}, which does not exist`);
      text = String(c[ref.field] || ""); src = c.evidence && c.evidence.source;
    } else if (ref.record === "LEVERS") {
      const l = (D.LEVERS || []).find(x => x.id === ref.lever), e = l && (l[ref.list] || [])[ref.index];
      if (!e) throw new Error(`heat assembly: source ${ref.id} names LEVERS ${ref.lever}.${ref.list}[${ref.index}], which does not exist`);
      text = e.text; src = (e.sources || [])[0];
    } else {
      const e = ((D[ref.record] || {})[ref.list] || [])[ref.index];
      if (!e) throw new Error(`heat assembly: source ${ref.id} names ${ref.record}.${ref.list}[${ref.index}], which does not exist`);
      text = e.text; src = e.source;
    }
    if (!text || !src || !src.url || !src.label) throw new Error(`heat assembly: source ${ref.id} has no text, label or url`);
    if (!T.grounds[ref.id]) throw new Error(`heat assembly: source ${ref.id} has no line in tools/heat-assembly-text.js grounds`);
    return { id: ref.id, text, label: src.label, url: src.url };
  });
}

function build({ page, write, hero, esc, V, D, ROOT }) {
  const sc = SC(), SRC = sources(D);
  const ext = (url, text) => `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(text)}<span class="visually-hidden"> (opens in a new tab)</span></a>`;
  // the data file the game loads: the scenario, the words (functions are left out by JSON) and the sources
  fs.writeFileSync(path.join(ROOT, "heat-assembly", "data.js"), `/* The Heat Assembly: scenario and words, written by tools/build-heat-assembly.js. Do not edit by hand. */\nwindow.HA=${JSON.stringify({ sc, text: T, sources: SRC, v: V }).replace(/</g, "\\u003c")};\n`);

  const P = T.people, R = T.roles;
  const body = `${hero(T.kicker, esc(T.title), esc(T.lede))}
  <section class="container hub ha-page">
    <p class="cs-note cs-note--example"><span class="cs-note__label">${esc(T.fictional)}</span>${esc(T.fictionalNote)}</p>
    <div class="ha" data-ha data-v="${V}">
      <div class="ha-scene cs-card">
        <p class="ha-clock">${esc(T.opening.clock)} · ${esc(T.opening.place)} <span class="ha-tag">${esc(T.fictional)}</span></p>
        ${T.opening.lines.map(l => `<p>${esc(l)}</p>`).join("")}
        <p class="ha-loading" data-ha-loading>${esc(T.ui.loading)}</p>
      </div>
      <noscript><p class="hub-p">The game needs JavaScript. Everything it uses is below: the people, the seats at the table, the rounds, the assumptions and the sources.</p></noscript>
    </div>
    <p class="hub-p">${esc(T.objective)} ${esc(T.time)}</p>

    <h2 class="hub-h" id="people">The people</h2>
    <ul class="ha-list">${Object.keys(P).map(k => `<li class="cs-card"><h3 class="ha-h3">${esc(P[k].name)}, ${esc(P[k].tag.charAt(0).toLowerCase() + P[k].tag.slice(1))}</h3><p>${esc(P[k].pay)} ${esc(P[k].care)}</p><p><b>Needs:</b> ${esc(P[k].needs)}</p></li>`).join("")}</ul>

    <h2 class="hub-h" id="seats">The seats at the table</h2>
    <ul class="ha-list">${sc.roles.map(k => `<li class="cs-card"><h3 class="ha-h3">${esc(R[k].name)}</h3><p><b>Resource:</b> ${esc(R[k].resource)}</p><p><b>Constraint:</b> ${esc(R[k].constraint)}</p><p><b>What the others need to hear:</b> ${esc(R[k].fact)}</p></li>`).join("")}</ul>

    <h2 class="hub-h" id="rounds">Four rounds</h2>
    <ol class="ha-rounds">${Object.keys(T.rounds).map(k => `<li><b>${esc(T.rounds[k].name)}</b> <span>${esc(T.rounds[k].time)}</span></li>`).join("")}</ol>
    <p class="hub-p">Funded, open and usable are different things here. The hall can be paid for and staffed, and still be out of reach for someone who would lose a paid turn by leaving the queue.</p>

    <p class="ha-question">${esc(T.end.question)}</p>

    <h2 class="hub-h" id="assumptions">Assumptions</h2>
    <ul class="ha-plain">${T.assumptions.map(a => `<li>${esc(a.text)}</li>`).join("")}</ul>

    <h2 class="hub-h" id="sources">Sources</h2>
    <p class="hub-p">${esc(T.sourcesIntro)}</p>
    <ul class="ha-plain">${SRC.map(s => `<li><b>${esc(T.grounds[s.id])}</b> ${esc(s.text)} ${ext(s.url, s.label)}</li>`).join("")}</ul>

    <h2 class="hub-h" id="explore">${esc(T.end.explore)}</h2>
    <p class="hub-p">${T.links.map(([u, t]) => `<a href="${u}">${esc(t)}</a>`).join(" · ")} · <a href="/plan/?cards=${T.plan.join(",")}#plan-step-3">${esc(T.end.plan)}</a></p>
  </section>
  <script src="/heat-assembly/data.js?v=${V}" defer></script><script src="/heat-assembly/engine.js?v=${V}" defer></script><script src="/heat-assembly/game.js?v=${V}" defer></script>`;
  write("heat-assembly", page("heat-assembly", T.title, `${T.lede} ${T.time}`, body, `\n  <link rel="stylesheet" href="/heat-assembly/game.css?v=${V}">`));
}

// the panel on /live-through-a-heatwave/: plain HTML until a reader presses play, then the game loads in place
function embed({ esc, V }) {
  return `<section class="container hub" aria-labelledby="ha-embed-h">
      <h2 class="hub-h" id="ha-embed-h">${esc(T.title)}: ${esc(T.kicker.toLowerCase())}</h2>
      <div class="ha-embed cs-card" data-ha-embed data-v="${V}">
        <p class="cs-note__label">${esc(T.opening.clock)} · ${esc(T.fictional)}</p>
        <p>${esc(T.opening.lines[0])} ${esc(T.opening.lines[1])}</p>
        <p><button type="button" class="btn" data-ha-play>${esc(T.ui.playHere)}</button> <a href="/heat-assembly/">${esc(T.ui.open)}</a></p>
        <p class="ha-small">${esc(T.time)}</p>
      </div>
    </section>
    <script>(function(){var b=document.querySelector("[data-ha-play]"),box=document.querySelector("[data-ha-embed]"),p=null;if(!b||!box)return;
      function add(t,u){return new Promise(function(ok,no){var e=document.createElement(t);if(t==="link"){e.rel="stylesheet";e.href=u;e.onload=ok;e.onerror=no;}else{e.src=u;e.onload=ok;e.onerror=no;}document.head.appendChild(e);});}
      b.addEventListener("click",function(){var v=box.getAttribute("data-v");b.disabled=true;b.textContent=${JSON.stringify(T.ui.loading)};
        p=p||add("link","/heat-assembly/game.css?v="+v).then(function(){return add("script","/heat-assembly/data.js?v="+v);}).then(function(){return add("script","/heat-assembly/engine.js?v="+v);}).then(function(){return add("script","/heat-assembly/game.js?v="+v);});
        p.catch(function(){b.disabled=false;b.textContent=${JSON.stringify(T.ui.playHere)};var m=document.createElement("p");m.setAttribute("role","status");m.textContent=${JSON.stringify(T.ui.loadFailed)};box.appendChild(m);});});})();</script>`;
}

function md(D, SITE) { return [`## ${T.title}`, `${SITE}/heat-assembly/`, T.plainLines(sources(D)).join("\n")].join("\n\n"); }

module.exports = build; module.exports.sources = sources; module.exports.embed = embed; module.exports.md = md;
