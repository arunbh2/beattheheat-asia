/* Heat from field to factory: the stage stepper and its three views, the explorer, and printing selected measures.
   Without this script every stage, view, measure and table stays on the page. */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  root.classList.add("ct-js");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(s, el) { return (el || doc).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || doc).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }

  // ---- stepper and views: the view is kept when the stage changes, and both live in the address ----
  var steps = $$(".ct-step"), stages = $$(".ct-stage"), views = $$(".ct-view"), vg = $(".ct-views");
  var VIEWS = ["work", "pay", "act"];
  var state = { stage: "field", view: "work" };
  function readUrl() {
    var h = location.hash.match(/^#stage-([a-z]+)/), q = location.search.match(/[?&]view=([a-z]+)/);
    if (h && $("#stage-" + h[1])) state.stage = h[1];
    if (q && VIEWS.indexOf(q[1]) >= 0) state.view = q[1];
  }
  function render(move) {
    steps.forEach(function (s) { if (s.getAttribute("data-stage") === state.stage) s.setAttribute("aria-current", "true"); else s.removeAttribute("aria-current"); });
    stages.forEach(function (a) { var on = a.id === "stage-" + state.stage; a.classList.toggle("is-on", on);
      $$(".ct-vbox", a).forEach(function (b) { b.classList.toggle("is-on", b.getAttribute("data-view") === state.view); }); });
    views.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-view") === state.view ? "true" : "false"); });
    if (move) { var a = $("#stage-" + state.stage); if (a) { var r = a.getBoundingClientRect(); if (r.top < 70 || r.top > innerHeight - 120) a.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); a.focus({ preventScroll: true }); } }
  }
  function url() { return location.pathname + (state.view !== "work" ? "?view=" + state.view : "") + "#stage-" + state.stage; }
  if (vg) vg.hidden = false;
  steps.forEach(function (s, i) {
    s.addEventListener("click", function (e) { e.preventDefault(); state.stage = s.getAttribute("data-stage"); history.pushState(state, "", url()); render(true); });
    s.addEventListener("keydown", function (e) {
      var n = null; if (e.key === "ArrowDown" || e.key === "ArrowRight") n = steps[(i + 1) % steps.length]; if (e.key === "ArrowUp" || e.key === "ArrowLeft") n = steps[(i - 1 + steps.length) % steps.length];
      if (n) { e.preventDefault(); n.focus(); }
    });
  });
  views.forEach(function (b) { b.addEventListener("click", function () { state.view = b.getAttribute("data-view"); history.replaceState(state, "", url()); render(false); }); });
  window.addEventListener("popstate", function () { state = { stage: "field", view: "work" }; readUrl(); render(true); });
  readUrl(); render(/^#stage-/.test(location.hash));

  // ---- explorer: stage, arrangement and barrier -> arrangements, actors, evidence, what to assess (never a verdict) ----
  var form = $(".ct-form"), out = $(".ct-out"), BAR = window.CT_BARRIERS || [], ARR = window.CT_ARR || [];
  var recs = $$(".ct-rec"), byId = {}; recs.forEach(function (r) { byId[r.getAttribute("data-rec")] = r; });
  function title(id) { return byId[id] ? $("h4", byId[id]).textContent : id; }
  function kinds(id) { return byId[id] ? $$(".ct-tag", byId[id]).map(function (t) { return t.textContent; }).join(" · ") : ""; }
  function runExplorer() {
    var st = form.stage.value, ar = form.arr.value, ba = form.bar.value;
    if (!ba) { out.innerHTML = '<p class="ct-small">Choose a main barrier, or “I\'m not sure” to see every family of measures for a stage. Nothing here says whether work is safe.</p>'; return; }
    var bars = ba === "unsure" ? BAR : BAR.filter(function (b) { return b.id === ba; });
    var ids = []; bars.forEach(function (b) { b.recs.forEach(function (id) { if (ids.indexOf(id) < 0) ids.push(id); }); });
    if (st) ids = ids.filter(function (id) { return byId[id] && (" " + byId[id].getAttribute("data-stages") + " ").indexOf(" " + st + " ") >= 0; });
    var inst = ids.filter(function (id) { return /^(p-|b-|h-)/.test(id); }), now = ids.filter(function (id) { return inst.indexOf(id) < 0; });
    var arr = ARR.filter(function (a) { return a.id === ar; })[0];
    var li = function (id) { return '<li><a href="#rec-' + id + '">' + esc(title(id)) + '</a> <span class="ct-small">' + esc(kinds(id)) + '</span></li>'; };
    if (!ids.length) { out.innerHTML = '<p>No measure in this library is tagged for that stage and barrier yet. Try “I\'m not sure” for the stage, or look through the <a href="#protections">whole library</a>; this combination may need a local answer.</p>'; return; }
    out.innerHTML =
      (now.length ? '<div class="cs-card"><h3>Immediate protection</h3><ul>' + now.map(li).join("") + '</ul></div>' : "") +
      (inst.length ? '<div class="cs-card"><h3>Institutional or contractual change</h3><ul>' + inst.map(li).join("") + '</ul></div>' : "") +
      '<div class="cs-card"><h3>Who needs to take part</h3><ul>' + (arr ? arr.actors.map(function (a) { return "<li>" + esc(a) + "</li>"; }).join("") + "<li>The workers themselves</li>" : "<li>Depends on the working arrangement: choose one to see who holds the decisions.</li><li>The workers themselves</li>") + '</ul></div>' +
      '<div class="cs-card"><h3>What requires local assessment</h3><ul>' + bars.map(function (b) { return "<li>" + esc(b.local) + "</li>"; }).join("") + '</ul><p class="ct-small">The evidence label beside each measure says what supports it. This is a planning aid, not a diagnosis or a safety verdict.</p></div>';
  }
  if (form && out) {
    form.hidden = false; out.hidden = false; var et = $(".ct-exptable"); if (et) et.open = false;
    form.addEventListener("change", runExplorer); form.addEventListener("reset", function () { setTimeout(runExplorer, 0); });
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    runExplorer();
  }

  // ---- choose measures to print, with their sources ----
  var bar = $(".ct-printbar"), picked = (store("ct-picked") || []).filter(function (id) { return byId[id]; });
  recs.forEach(function (r) {
    var id = r.getAttribute("data-rec"), l = doc.createElement("label"); l.className = "ct-pick";
    l.innerHTML = '<input type="checkbox"' + (picked.indexOf(id) >= 0 ? " checked" : "") + '> Select for printing<span class="visually-hidden">: ' + esc(title(id)) + '</span>';
    r.appendChild(l);
    $("input", l).addEventListener("change", function (e) { var i = picked.indexOf(id); if (e.target.checked && i < 0) picked.push(id); if (!e.target.checked && i >= 0) picked.splice(i, 1); store("ct-picked", picked); paint(); });
  });
  function paint() {
    recs.forEach(function (r) { r.classList.toggle("is-picked", picked.indexOf(r.getAttribute("data-rec")) >= 0); });
    $$(".ct-fam").forEach(function (f) { f.classList.toggle("has-picked", !!$(".ct-rec.is-picked", f)); });
    bar.hidden = !picked.length; $(".ct-printcount", bar).textContent = picked.length + (picked.length === 1 ? " measure selected" : " measures selected");
  }
  if (bar) {
    $(".ct-print", bar).addEventListener("click", function () { root.classList.add("ct-print-sel"); window.print(); });
    $(".ct-clear", bar).addEventListener("click", function () { picked = []; store("ct-picked", picked); $$(".ct-pick input").forEach(function (i) { i.checked = false; }); paint(); });
    paint();
  }
  var opened = [];
  window.addEventListener("beforeprint", function () { opened = $$("details:not([open])"); opened.forEach(function (d) { d.open = true; }); });
  window.addEventListener("afterprint", function () { root.classList.remove("ct-print-sel"); opened.forEach(function (d) { d.open = false; }); opened = []; });
})();
