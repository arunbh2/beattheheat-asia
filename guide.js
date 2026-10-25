/* BeatTheHeat.Asia: Find your way in (part 35 of data.js).
   Draws the guide on the home page (#start) and on /guide/: two questions (why you came, how long you have) give a
   short path of stops, ticked off as you go; the toolkit shows how the hands-on tools follow one another; a small
   welcome, on a first visit to the home page only, points to the guide. Everything stays in this browser. */
(function () {
  "use strict";
  if (typeof GUIDE === "undefined") return;
  const G = GUIDE, KEY = "bth-guide-v1", HOME = !!document.getElementById("explore");
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const track = name => { try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: name, title: name, event: true }); } catch (e) {} };
  let S = { reason: "", time: "", done: {}, seen: false };
  try { S = Object.assign(S, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  const mins = t => { const m = /(\d+)(?:–(\d+))?\s*min/.exec(t); return m ? +(m[2] || m[1]) : 0; };
  const NEW_TAB = '<span class="visually-hidden"> (opens in a new tab)</span>';

  // a stop opens a section of the map, a page in a new tab, or runs one of the map's actions
  function stopAction(id, s) {
    const label = s.go === "film" ? "Watch" : s.go === "tour" || s.go === "five" ? "Start" : s.go === "story" ? "Follow it" : s.tab ? "Open" : "Go there";
    if (s.go) {
      if (!HOME) return `<a class="btn btn--sm btn--cta" href="${s.go === "story" ? `/#loop-${s.story}` : `/?go=${s.go}`}" target="bth-map" data-way-stop="${id}">${label} <span aria-hidden="true">→</span></a>`;
      const attr = s.go === "five" ? 'data-five="start"' : s.go === "story" ? `data-story="${s.story}"` : `data-act="${s.go}"`;
      return `<button type="button" class="btn btn--sm btn--cta" ${attr} data-way-stop="${id}">${label} <span aria-hidden="true">→</span></button>`;
    }
    const href = !HOME && s.href.startsWith("#") ? "/" + s.href : s.href;
    const target = s.tab ? ' target="_blank" rel="noopener"' : !HOME ? ' target="bth-map"' : "";
    return `<a class="btn btn--sm btn--cta" href="${esc(href)}"${target} data-way-stop="${id}">${label}${s.tab ? `${NEW_TAB} <span aria-hidden="true">↗</span>` : ' <span aria-hidden="true">→</span>'}</a>`;
  }

  function renderWay() {
    const box = document.getElementById("wayin"); if (!box) return;
    const ids = S.reason && S.time ? G.paths[`${S.reason}:${S.time}`] || [] : [];
    const total = ids.reduce((a, id) => a + mins(G.stops[id].time), 0), done = ids.filter(id => S.done[id]).length;
    box.innerHTML = `<div class="wayin__q"><p class="wayin__k" id="way-q1"><span>1</span> What brings you here?</p>
        <div class="wayin__opts wayin__opts--reason" role="group" aria-labelledby="way-q1">${G.reasons.map(r => `<button type="button" class="wayin__opt" data-way-reason="${r.id}" aria-pressed="${S.reason === r.id}"><b>${esc(r.name)}</b><span>${esc(r.hint)}</span></button>`).join("")}</div></div>
      <div class="wayin__q"><p class="wayin__k" id="way-q2"><span>2</span> How much time do you have?</p>
        <div class="wayin__opts wayin__opts--time" role="group" aria-labelledby="way-q2">${G.times.map(t => `<button type="button" class="wayin__opt wayin__opt--t" data-way-time="${t.id}" aria-pressed="${S.time === t.id}"><b>${esc(t.name)}</b>${t.hint ? `<span>${esc(t.hint)}</span>` : ""}</button>`).join("")}</div></div>
      <div class="wayin__path" aria-live="polite">${ids.length ? `<p class="wayin__k"><span>3</span> Your path · ${S.time === "workshop" ? "fits a 90-minute session" : `about ${total} minutes`}${done ? ` · ${done} of ${ids.length} done` : ""}</p>
        <ol class="wayin__stops">${ids.map((id, i) => { const s = G.stops[id];
          return `<li class="wayin__stop${S.done[id] ? " is-done" : ""}"><span class="wayin__n" aria-hidden="true">${S.done[id] ? "✓" : i + 1}</span>
            <div class="wayin__body"><p class="wayin__t"><b>${esc(s.title)}</b><span class="wayin__time">${esc(s.time)}</span>${s.tool ? `<span class="wayin__tool">Tool ${s.tool}</span>` : ""}</p>
              <p class="wayin__d">${esc(s.does)}</p><p class="wayin__take">You leave with: ${esc(s.take)}</p></div>
            <div class="wayin__go">${stopAction(id, s)}${S.done[id] ? '<span class="visually-hidden">Done.</span>' : ""}</div></li>`; }).join("")}</ol>
        <p class="wayin__reset"><button type="button" class="link" data-way-reset>Choose again</button></p>`
        : `<p class="wayin__hint">${S.reason || S.time ? "Now the other question, and your path appears here." : "Your path appears here."}</p>`}</div>`;
  }

  // the toolkit: five hands-on tools, in the order they build on one another
  const ICONS = {
    feel: `<circle cx="34" cy="14" r="7" fill="#F26430"/><circle cx="20" cy="18" r="5" fill="none" stroke="currentColor" stroke-width="3"/><path d="M20 23v13M12 29h16M20 36l-6 10M20 36l6 10" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none"/>`,
    find: `<circle cx="22" cy="22" r="11" fill="none" stroke="currentColor" stroke-width="3.5"/><path d="M30 30l11 11" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M17 22h10M22 17v10" stroke="#F26430" stroke-width="3" stroke-linecap="round"/>`,
    plan: `<rect x="11" y="9" width="26" height="33" rx="3" fill="none" stroke="currentColor" stroke-width="3"/><path d="M17 18h14M17 25h14M17 32h9" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M28 35l3 3 7-8" stroke="#F26430" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    together: `<circle cx="13" cy="18" r="5" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="35" cy="18" r="5" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="24" cy="13" r="5" fill="none" stroke="#F26430" stroke-width="3"/><path d="M5 38c1-8 15-8 16 0M27 38c1-8 15-8 16 0M16 32c1-8 15-8 16 0" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    learn: `<circle cx="24" cy="24" r="15" fill="none" stroke="currentColor" stroke-width="3"/><path d="M9 24h30M24 9c-6 7-6 23 0 30M24 9c6 7 6 23 0 30" stroke="currentColor" stroke-width="2.5" fill="none"/><circle cx="31" cy="17" r="3" fill="#F26430"/>`
  };
  function renderToolkit() {
    const box = document.getElementById("toolkit"); if (!box) return;
    box.innerHTML = `<h3 class="toolkit__h">Your toolkit: five tools, in the order they build on each other</h3>
      <ol class="toolkit__list">${G.toolkit.map(t => { const href = !HOME && t.href.startsWith("/#") ? t.href : t.href;
        return `<li class="toolkit__step"><a class="toolkit__card" href="${esc(href)}"${t.tab ? ' target="_blank" rel="noopener"' : !HOME ? ' target="bth-map"' : ""} data-way-tool="${t.n}">
          <span class="toolkit__icon" aria-hidden="true"><svg viewBox="0 0 48 48" width="44" height="44">${ICONS[t.icon]}</svg></span>
          <span class="toolkit__n">${t.n} · ${esc(t.verb)}</span><b>${esc(t.name)}</b>
          <span class="toolkit__take">${esc(t.take)}</span>
          <span class="toolkit__meta">${esc(t.time)} · ${esc(t.who)}${t.tab ? ` · opens in a new tab <span aria-hidden="true">↗</span>` : ""}</span></a></li>`; }).join("")}</ol>`;
  }

  // a small welcome on a first visit to the home page; never on a shared deep link, never blocking the page
  function welcome() {
    if (!HOME || S.seen || location.hash || /[?&]go=/.test(location.search)) return;
    const w = document.createElement("div"); w.className = "welcome"; w.setAttribute("role", "region"); w.setAttribute("aria-label", "Welcome");
    w.innerHTML = `<p>${esc(G.welcome)}</p><p class="welcome__b"><a class="btn btn--sm btn--cta" href="#start" data-welcome="go">Find your way in <span aria-hidden="true">→</span></a><button type="button" class="welcome__x" data-welcome="close" aria-label="Close">×</button></p>`;
    document.body.appendChild(w);
    w.addEventListener("click", ev => { const b = ev.target.closest("[data-welcome]"); if (!b) return; S.seen = true; save(); w.remove(); track("welcome-" + b.dataset.welcome); });
    // it has done its job once the visitor reaches the guide itself
    const st = document.getElementById("start");
    if (st && "IntersectionObserver" in window) new IntersectionObserver((es, o) => { if (es.some(e => e.isIntersecting)) { S.seen = true; save(); w.remove(); o.disconnect(); } }).observe(st);
  }

  document.addEventListener("click", ev => {
    const t = ev.target, b = k => t.closest && t.closest(`[data-way-${k}]`);
    if (b("reason")) { S.reason = b("reason").dataset.wayReason; S.seen = true; save(); dropWelcome(); renderWay(); track("way-" + S.reason); focusPath(); return; }
    if (b("time")) { S.time = b("time").dataset.wayTime; S.seen = true; save(); renderWay(); track("way-time-" + S.time); focusPath(); return; }
    if (b("reset")) { S.reason = ""; S.time = ""; S.done = {}; save(); renderWay(); const f = document.querySelector("[data-way-reason]"); if (f) f.focus(); return; }
    if (b("stop")) { const id = b("stop").dataset.wayStop; S.done[id] = true; save(); track("way-stop-" + id); setTimeout(renderWay, 400); return; }
    if (b("tool")) { track("way-tool-" + b("tool").dataset.wayTool); }
  });
  function dropWelcome() { const w = document.querySelector(".welcome"); if (w) w.remove(); }
  // once both answers are in, bring the path into view
  function focusPath() { if (!(S.reason && S.time)) return; const p = document.querySelector(".wayin__stops"); if (p) p.scrollIntoView({ block: "nearest", behavior: "smooth" }); }

  // on each tool's page: where it sits in the toolkit, and what it is for
  function renderSignpost() {
    const el = document.getElementById("signpost");
    if (el) { const n = +el.dataset.step, t = G.toolkit.find(x => x.n === n), next = G.toolkit.find(x => x.n === n + 1);
      if (t) el.innerHTML = `<div class="container signpost__in"><a href="/guide/">Your toolkit</a><span class="signpost__steps" aria-hidden="true">${G.toolkit.map(x => `<i class="${x.n <= n ? "on" : ""}"></i>`).join("")}</span>
        <span>Step ${n} of ${G.toolkit.length}: <b>${esc(t.verb)}</b></span>${next ? `<span>Next: <a href="${esc(next.href)}"${next.tab ? ' target="_blank" rel="noopener"' : ""}>${esc(next.verb)}: ${esc(next.name)}${next.tab ? NEW_TAB : ""} <span aria-hidden="true">→</span></a></span>` : ""}</div>`; }
    const bx = document.getElementById("signpost-box");
    if (bx) { const t = G.toolkit.find(x => x.n === +bx.dataset.step);
      if (t) bx.innerHTML = `<div><b>Who it is for</b>${esc(t.who)}</div><div><b>How long</b>${esc(t.time)}</div><div><b>You leave with</b>${esc(t.take)}</div>`; }
  }
  function renderWorkshop() {
    const el = document.getElementById("guide-workshop"); if (!el) return;
    el.innerHTML = `<ol class="gw">${G.workshop.map(w => `<li><span class="gw__t">${esc(w.time)} min</span><div><b>${esc(w.what)}</b><span>${esc(w.why)}</span></div></li>`).join("")}</ol>
      <ul class="gw__tips">${G.workshopTips.map(t => `<li>${esc(t)}</li>`).join("")}</ul>`;
  }

  renderWay(); renderToolkit(); renderSignpost(); renderWorkshop(); welcome();
})();
