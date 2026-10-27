/* Common Shade: "Explore a market" on /practical/.
   An illustrative market with six features to explore. Words come from MARKET_EXPLORER in data.js; the drawing is
   media/market/market.svg (tools/build-market-scene.py); this file only wires them together.
   It opens on request, never moves on its own, and writes nothing to storage. See docs/market-explorer.md. */
(function () {
  "use strict";
  const M = typeof MARKET_EXPLORER !== "undefined" ? MARKET_EXPLORER : null;
  const root = document.getElementById("market");
  if (!M || !root) return;
  const SCENE_URL = "/media/market/market.svg?v=2";
  const EV = typeof EVIDENCE_STATUS !== "undefined" ? EVIDENCE_STATUS : {};
  const H = M.hotspots, N = H.length, VB = [1000, 640];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const ext = (url, label) => `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}<span class="visually-hidden"> (opens in a new tab)</span>&nbsp;<span aria-hidden="true">↗</span></a>`;
  const tag = st => EV[st] ? `<span class="ev-tag ev-tag--${st}" title="${esc(EV[st].text)}">${esc(EV[st].name)}<span class="visually-hidden">: ${esc(EV[st].text)}</span></span>` : "";
  const link = l => `<a href="${esc(l.href)}">${esc(l.label)}&nbsp;<span aria-hidden="true">→</span></a>`;

  const openBtn = root.querySelector(".mx-open"), app = document.getElementById("mx-app");
  let built = false, sel = "", tour = -1, el = {};

  function build() {
    app.innerHTML = `
      <div class="mx-bar">
        <p class="mx-bar__intro">${esc(M.intro)}</p>
        <div class="mx-bar__acts">
          <button type="button" class="btn btn--sm mx-tour-start">Show me around</button>
          <button type="button" class="mx-close">Close the market</button>
        </div>
      </div>
      <div class="mx-grid">
        <nav class="mx-index" aria-label="Features in this market">
          <ol>${H.map((h, i) => `<li><button type="button" class="mx-pick" data-mx="${h.id}" aria-controls="mx-panel" aria-pressed="false"><span class="mx-n" aria-hidden="true">${i + 1}</span>${esc(h.label)}</button></li>`).join("")}</ol>
        </nav>
        <figure class="mx-stage">
          <div class="mx-scene" id="mx-scene"><p class="mx-loading">Drawing the market…</p></div>
          <div class="mx-pins" aria-hidden="true">${H.map((h, i) => `<button type="button" class="mx-pin" data-mx="${h.id}" tabindex="-1" style="left:${h.pin[0] / VB[0] * 100}%;top:${h.pin[1] / VB[1] * 100}%"><span>${i + 1}</span></button>`).join("")}</div>
          <figcaption class="mx-caption">${esc(M.caption)}</figcaption>
        </figure>
        <section class="mx-panel" id="mx-panel" aria-labelledby="mx-p-title" tabindex="-1">
          <div class="mx-tournav" hidden>
            <button type="button" class="mx-prev">← Previous</button>
            <span class="mx-step" aria-live="polite"></span>
            <button type="button" class="mx-next">Next →</button>
            <button type="button" class="mx-tour-stop">Stop the tour</button>
          </div>
          <div class="mx-body"></div>
          <div class="mx-exit">
            <p class="mx-exit__k">Where next</p>
            <p>${M.next.map(link).join(" · ")}</p>
            <p class="mx-exit__sec">${link(M.plan)} · ${link(M.join)}</p>
          </div>
        </section>
      </div>`;
    el = { scene: app.querySelector("#mx-scene"), body: app.querySelector(".mx-body"), tn: app.querySelector(".mx-tournav"),
           step: app.querySelector(".mx-step"), prev: app.querySelector(".mx-prev"), next: app.querySelector(".mx-next"),
           start: app.querySelector(".mx-tour-start"), panel: app.querySelector("#mx-panel") };
    renderBody();
    // the drawing is fetched and placed inline, so each feature can be outlined when it is chosen
    fetch(SCENE_URL).then(r => { if (!r.ok) throw new Error(r.status); return r.text(); }).then(txt => {
      el.scene.innerHTML = txt;
      const svg = el.scene.querySelector("svg"); if (!svg) throw new Error("no svg");
      svg.setAttribute("class", "mx-svg"); svg.querySelectorAll(".mx-feat").forEach(g => g.addEventListener("click", () => choose(g.id.slice(3))));
      mark();
    }).catch(() => {
      el.scene.innerHTML = `<p class="mx-fail">The drawing could not load. The six features are listed beside it, and each one still opens its notes.</p>`;
      app.querySelector(".mx-pins").hidden = true;
    });
    app.addEventListener("click", ev => {
      const p = ev.target.closest("[data-mx]"); if (p) { if (tour >= 0) endTour(false); choose(p.dataset.mx); return; }
      if (ev.target.closest(".mx-tour-start")) { startTour(); return; }
      if (ev.target.closest(".mx-tour-stop")) { endTour(true); return; }
      if (ev.target.closest(".mx-prev")) { go(tour - 1); return; }
      if (ev.target.closest(".mx-next")) { if (tour === N - 1) endTour(true); else go(tour + 1); return; }
      if (ev.target.closest(".mx-close")) close();
    });
    built = true;
  }

  function renderBody() {
    const h = H.find(x => x.id === sel);
    if (!h) {
      el.body.innerHTML = `<h3 class="mx-p-title" id="mx-p-title">Six things to look at</h3>
        <p>Each feature shows one possibility for protection from heat, and what it depends on. Choose one from the list or the drawing, or take the tour.</p>`;
      return;
    }
    el.body.innerHTML = `
      <p class="mx-p-k">${esc(h.label)}</p>
      <h3 class="mx-p-title" id="mx-p-title">${esc(h.title)}</h3>
      <h4 class="mx-p-h">What could help</h4><p>${esc(h.help)}</p>
      <h4 class="mx-p-h">What makes it work</h4><p>${esc(h.works)}</p>
      <h4 class="mx-p-h">People to involve <span class="mx-p-note">suggested roles, not commitments</span></h4>
      <ul class="mx-people">${h.people.map(p => `<li>${esc(p)}</li>`).join("")}</ul>
      <h4 class="mx-p-h">Look closer</h4>
      <ul class="mx-look">${h.look.map(l => `<li>${link(l)}</li>`).join("")}</ul>
      <details class="mx-ev"><summary>Evidence</summary>
        ${h.evidence.map(e => `<p>${tag(e.status)} ${esc(e.text)} <span class="mx-src">${ext(e.source.url, e.source.label)}</span></p>`).join("")}
        <p class="mx-limit"><b>Limits:</b> ${esc(h.limit)}</p>
        <p class="mx-limit">The label describes the kind of evidence, not how good the idea is.</p>
      </details>`;
  }

  function mark() {
    app.querySelectorAll(".mx-pick, .mx-pin").forEach(b => { const on = b.dataset.mx === sel; b.classList.toggle("is-on", on); if (b.classList.contains("mx-pick")) b.setAttribute("aria-pressed", String(on)); });
    const svg = el.scene.querySelector("svg"); if (!svg) return;
    svg.classList.toggle("has-sel", !!sel);
    svg.querySelectorAll(".mx-feat").forEach(g => g.classList.toggle("is-on", g.id === "mx-" + sel));
  }

  function choose(id) {
    if (!H.some(h => h.id === id)) return;
    sel = id; renderBody(); mark();
    try { history.replaceState(null, "", location.pathname + location.search + "#market-" + id); } catch (e) {}
    // on narrow screens the notes sit below the drawing: bring them into view without moving focus
    if (window.matchMedia("(max-width: 1099px)").matches && tour < 0) el.panel.scrollIntoView({ block: "nearest", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  function go(i) {
    tour = Math.max(0, Math.min(N - 1, i));
    el.step.textContent = `${tour + 1} of ${N}`;
    el.prev.disabled = tour === 0; el.next.textContent = tour === N - 1 ? "Finish" : "Next →";
    choose(H[tour].id);
  }
  function startTour() { el.tn.hidden = false; go(0); el.next.focus(); }
  function endTour(focusStart) { tour = -1; el.tn.hidden = true; el.step.textContent = ""; if (focusStart) el.start.focus(); }

  function open(id) {
    if (!built) build();
    app.hidden = false; root.classList.add("is-open"); if (openBtn) openBtn.setAttribute("aria-expanded", "true");
    if (id) choose(id); else { try { history.replaceState(null, "", location.pathname + location.search + "#market"); } catch (e) {} }
  }
  function close() {
    if (tour >= 0) endTour(false);
    app.hidden = true; root.classList.remove("is-open"); if (openBtn) { openBtn.setAttribute("aria-expanded", "false"); openBtn.focus(); }
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
  }

  if (openBtn) {
    openBtn.hidden = false; openBtn.setAttribute("aria-expanded", "false"); openBtn.setAttribute("aria-controls", "mx-app");
    openBtn.addEventListener("click", () => { if (app.hidden) { open(""); app.querySelector(".mx-pick").focus(); } else close(); });
  }
  // a link such as /practical/#market-water opens the market on that feature
  function fromHash() {
    const m = /^#market(?:-([a-z]+))?$/.exec(location.hash); if (!m) return;
    open(m[1] || ""); root.scrollIntoView({ block: "start" });
  }
  fromHash();
  window.addEventListener("hashchange", fromHash);
})();
