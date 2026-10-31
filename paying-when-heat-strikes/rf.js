/* Paying when heat strikes: the layered canopy, the "Did it pay, and when?" filters and the country tabs.
   Data comes from window.RF (tools/build-pages.js). The drawing is a picture of how layered protection is meant to
   work, from the schemes we documented: it is not a measurement. Nothing here is sent anywhere. */
(function () {
  "use strict";
  var RF = window.RF; if (!RF) return;
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NS = "http://www.w3.org/2000/svg";
  var COL = { transfer: "#2E6F95", contingent: "#C98A12", anticipatory: "#F26430", retain: "#B8401A", social: "#1F7A70" };
  var OPENS = { every: 1, hard: 2, extreme: 3 };
  var WHEN = { every: "Carries heat in most years", hard: "Opens in a hard year", extreme: "Opens in a rare, extreme year" };
  var CAP = ["", "In most years, heat is carried, where it is carried at all, by money kept ready, funds released on a forecast and the systems that already reach people.",
    "In a hard year, credit and budgets arranged in advance can open as well.",
    "In a rare, extreme year, insurance, pools and bonds may pay too. Even then, heat finds the gaps between them."];

  // ---- the canopy ----
  var svg = $("[data-rf-svg]"), side = $("[data-rf-side]"), cap = $("[data-rf-cap]");
  var order = ["transfer", "contingent", "anticipatory", "retain", "social"];
  var L = order.map(function (id) { return RF.L.filter(function (l) { return l.id === id; })[0]; }).filter(Boolean);
  var SUN = { x: 400, y: 40 }, GROUND = 468, X0 = 150, X1 = 650;
  var S = { sev: 1, sel: null };
  var el = function (n, a, p) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  var yOf = function (i) { return 128 + i * 64; };
  var arch = function (x, i) { var hw = (X1 - X0) / 2, cx = (X0 + X1) / 2, t = (x - cx) / hw; return -14 * (1 - t * t) + i * 0; };
  var gRays, gLayers = [], figs = [];

  function build() {
    if (!svg) return;
    var defs = el("defs", {}, svg);
    var g1 = el("radialGradient", { id: "rf-sun" }, defs); el("stop", { offset: "0", "stop-color": "#FFD27A" }, g1); el("stop", { offset: ".55", "stop-color": "#F5A623" }, g1); el("stop", { offset: "1", "stop-color": "#F5A623", "stop-opacity": "0" }, g1);
    var g2 = el("radialGradient", { id: "rf-warm" }, defs); el("stop", { offset: "0", "stop-color": "#F26430", "stop-opacity": ".55" }, g2); el("stop", { offset: "1", "stop-color": "#F26430", "stop-opacity": "0" }, g2);
    el("circle", { cx: SUN.x, cy: SUN.y, r: 70, fill: "url(#rf-sun)", "class": "rf-sunglow" }, svg);
    el("circle", { cx: SUN.x, cy: SUN.y, r: 22, fill: "#F5A623" }, svg);
    gRays = el("g", { "class": "rf-rays" }, svg);
    L.forEach(function (l, i) {
      var g = el("g", { "class": "rf-layer", "data-layer": l.id, tabindex: "0", role: "button", "aria-label": l.name + ": " + l.n + " schemes documented, " + l.heat + " with heat in their cover. Select to read more." }, svg);
      var y = yOf(i), n = Math.max(1, l.seg.length), w = (X1 - X0) / n;
      el("rect", { x: X0 - 20, y: y - 46, width: (X1 - X0) + 40, height: 62, fill: "transparent", "class": "rf-hit" }, g);
      var strips = el("g", { "class": "rf-strips", style: "transform-origin:400px " + y + "px" }, g);
      l.seg.forEach(function (s, j) {
        var x = X0 + j * w, cx = x + w / 2, yy = y + arch(cx, i), c = COL[l.id];
        var r = el("rect", { x: (x + 1).toFixed(1), y: (yy - 8).toFixed(1), width: Math.max(2, w - 2).toFixed(1), height: 16, rx: Math.min(4, w / 3).toFixed(1), "data-sid": s.id, "class": "rf-strip rf-strip--" + s.h }, strips);
        if (s.h === "yes") { r.setAttribute("fill", c); }
        else if (s.h === "partly") { r.setAttribute("fill", c); r.setAttribute("fill-opacity", ".42"); r.setAttribute("stroke", c); r.setAttribute("stroke-width", "1.2"); }
        else { r.setAttribute("fill", "#FAF7F2"); r.setAttribute("stroke", c); r.setAttribute("stroke-width", "1.4"); r.setAttribute("stroke-dasharray", "3 2.5"); }
        if (s.p === "paid") el("circle", { cx: cx.toFixed(1), cy: (yy - 13).toFixed(1), r: 2.6, fill: "#16202B", "class": "rf-paiddot" }, strips);
        var t = el("title", {}, r); t.textContent = s.n;
      });
      var lab = el("text", { x: X0, y: y - 30, "class": "rf-lab" }, g); lab.textContent = l.short;
      var cnt = el("text", { x: X1, y: y - 30, "text-anchor": "end", "class": "rf-cnt" }, g); cnt.textContent = l.heat + " of " + l.n + " name heat" + (l.part ? ", " + l.part + " partly" : "");
      gLayers.push({ l: l, g: g, y: y, n: n, w: w, i: i });
      g.addEventListener("click", function (ev) { var sid = ev.target.getAttribute && ev.target.getAttribute("data-sid"); select(l.id, sid); });
      g.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); select(l.id); } });
    });
    // the ground and the people under the canopy: drawn, faceless figures
    el("path", { d: "M40 " + (GROUND + 34) + " H760", stroke: "#16202B", "stroke-width": 2, opacity: ".35", "stroke-linecap": "round" }, svg);
    [48, 122, 214, 307, 400, 493, 586, 678, 752].forEach(function (x, k) {
      var g = el("g", { "class": "rf-fig" }, svg), s = k % 3 === 1 ? .82 : 1, b = GROUND + 34;
      el("ellipse", { cx: x, cy: b - 18, rx: 34, ry: 26, fill: "url(#rf-warm)", "class": "rf-halo" }, g);
      var p = el("g", { fill: "none", stroke: "#16202B", "stroke-width": 2.6, "stroke-linecap": "round", "stroke-linejoin": "round", transform: "translate(" + x + " " + b + ") scale(" + s + ")" }, g);
      el("circle", { cx: 0, cy: -52, r: 7 }, p); el("path", { d: "M0 -45 V-20 M0 -20 L-8 0 M0 -20 L8 0 M0 -39 L" + (k % 2 ? "-11 -27" : "11 -27") + (k === 3 ? " M0 -39 L12 -30" : "") }, p);
      figs.push({ x: x, g: g });
    });
  }
  function stopAt(gx, k) {
    for (var a = 0; a < gLayers.length; a++) {
      var G = gLayers[a]; if (OPENS[G.l.when] > S.sev) continue;
      var y = G.y, x = rx0(gx) + (gx - rx0(gx)) * (y - RY0) / (GROUND - RY0);
      var j = Math.floor((x - X0) / G.w); if (j < 0 || j >= G.l.seg.length) continue;
      var h = G.l.seg[j].h; if (h === "yes" || (h === "partly" && k % 2 === 0)) return { x: x, y: y + arch(x, G.i) - 8 };
    }
    return null;
  }
  var RY0 = 70, rx0 = function (gx) { return SUN.x + (gx - SUN.x) * 0.55; };
  function rays() {
    if (!gRays) return;
    while (gRays.firstChild) gRays.removeChild(gRays.firstChild);
    var n = [0, 11, 16, 23][S.sev], hit = {};
    for (var k = 0; k < n; k++) {
      var gx = 40 + (720 * (k + .5) / n) + (k % 3 - 1) * 7, st = stopAt(gx, k), ex = st ? st.x : gx, ey = st ? st.y : GROUND + 10;
      var r = el("line", { x1: rx0(gx).toFixed(1), y1: RY0, x2: ex.toFixed(1), y2: ey.toFixed(1), "class": "rf-ray" + (st ? "" : " rf-ray--through") }, gRays);
      if (!reduce) { var len = Math.hypot(ex - rx0(gx), ey - RY0); r.style.strokeDasharray = len; r.style.strokeDashoffset = len; r.style.animationDelay = (k * 45) + "ms"; r.classList.add("is-draw"); }
      if (!st) figs.forEach(function (f, i) { if (Math.abs(f.x - gx) < 44) hit[i] = 1; });
    }
    figs.forEach(function (f, i) { f.g.classList.toggle("is-hot", !!hit[i]); });
  }
  function layers() {
    gLayers.forEach(function (G) { var open = OPENS[G.l.when] <= S.sev; G.g.classList.toggle("is-open", open); G.g.classList.toggle("is-sel", S.sel === G.l.id); });
    svg.classList.toggle("is-sev3", S.sev === 3); svg.classList.toggle("is-sev2", S.sev === 2);
  }
  function panel() {
    if (!side) return;
    var l = S.sel && L.filter(function (x) { return x.id === S.sel; })[0];
    if (!l) {
      side.innerHTML = '<p class="rf-k2">Reading the canopy</p><h3>Select a layer</h3><p>Each strip is one scheme or arrangement we documented. Select a layer, or a strip, to read what it holds.</p>' +
        '<ul class="rf-legend"><li><i class="f"></i>Heat in its cover</li><li><i class="p"></i>Heat partly covered</li><li><i class="o"></i>Heat not covered, or unclear</li><li><i class="d"></i>A payment we could trace</li></ul>' +
        '<p class="rf-muted">Figures beyond the canopy’s edge stand for people that no arrangement we found reaches. The drawing does not say how many.</p>' +
        '<p class="rf-muted">Lower layers sit closest to people. Whether a layer could carry more of heat is a choice for those who hold it, and the evidence for each is below.</p>';
      return;
    }
    var open = OPENS[l.when] <= S.sev;
    side.innerHTML = '<p class="rf-k2"><i class="rf-sw" style="background:' + COL[l.id] + '"></i>' + esc(WHEN[l.when]) + '</p><h3>' + esc(l.name) + '</h3><p>' + esc(l.text) + '</p>' +
      '<dl class="rf-stats"><div><dt>Documented</dt><dd>' + l.n + '</dd></div><div><dt>Heat in cover</dt><dd>' + l.heat + '</dd></div><div><dt>Partly</dt><dd>' + l.part + '</dd></div><div><dt>Paid, traced</dt><dd>' + l.paid + '</dd></div><div><dt>Never triggered</dt><dd>' + l.never + '</dd></div></dl>' +
      (open ? "" : '<p class="rf-muted">Folded for this kind of season. Choose a harder season to see it open.</p>') +
      (l.inst.length ? '<p class="rf-k2">The instruments in this layer</p><ul class="rf-inst">' + l.inst.map(function (i) { return '<li><details><summary>' + esc(i.n) + '</summary><p>' + esc(i.d) + '</p>' + (i.sp ? '<p class="rf-muted"><b>Speed.</b> ' + esc(i.sp) + '</p>' : "") + (i.lim ? '<p class="rf-muted"><b>Limits.</b> ' + esc(i.lim) + '</p>' : "") + '</details></li>'; }).join("") + '</ul>' : "") +
      '<p><button type="button" class="rf-go" data-show="' + l.id + '">Show these ' + l.n + ' schemes <span aria-hidden="true">↓</span></button></p><button type="button" class="fl-clear" data-back>Back to the whole canopy</button>';
    $("[data-show]", side).addEventListener("click", function () { setFilter("layer", l.id); setFilter("paid", "all"); setFilter("region", "all"); heatBox.checked = false; F.heat = false; apply(); $("#did-it-pay").scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); });
    $("[data-back]", side).addEventListener("click", function () { select(null); });
  }
  function select(id, sid) {
    S.sel = id; layers(); panel();
    if (sid) openCard(sid);
  }
  function sev(n) {
    S.sev = n; $$("[data-sev]").forEach(function (b) { b.setAttribute("aria-checked", String(+b.dataset.sev === n)); });
    if (cap) cap.textContent = CAP[n]; layers(); rays(); if (S.sel) panel();
  }
  build();
  $$("[data-sev]").forEach(function (b) {
    b.addEventListener("click", function () { sev(+b.dataset.sev); });
    b.addEventListener("keydown", function (ev) { var d = ev.key === "ArrowRight" || ev.key === "ArrowDown" ? 1 : ev.key === "ArrowLeft" || ev.key === "ArrowUp" ? -1 : 0; if (!d) return; ev.preventDefault(); var n = Math.min(3, Math.max(1, S.sev + d)); sev(n); $('[data-sev="' + n + '"]').focus(); });
  });
  if (svg) { sev(1); panel(); }

  // ---- did it pay, and when? ----
  var cards = $$("[data-rf-cards] > li"), count = $("[data-rf-count]"), empty = $("[data-rf-empty]"), heatBox = $("[data-rf-heat]");
  var F = { layer: "all", paid: "all", region: "all", heat: false };
  function setFilter(k, v) { F[k] = v; $$('[data-f="' + k + '"]').forEach(function (b) { var on = b.dataset.v === v; b.classList.toggle("is-on", on); b.setAttribute("aria-pressed", String(on)); }); }
  function apply() {
    var n = 0;
    cards.forEach(function (c) {
      var d = c.dataset, ok = (F.layer === "all" || d.layer === F.layer) && (F.paid === "all" || d.paid === F.paid) && (F.region === "all" || d.region === F.region) && (!F.heat || d.heat === "yes");
      c.hidden = !ok; if (ok) n++;
    });
    if (count) count.textContent = n === cards.length ? n + " schemes" : n + " of " + cards.length + " schemes";
    if (empty) empty.hidden = n > 0;
  }
  $$("[data-f]").forEach(function (b) { b.addEventListener("click", function () { setFilter(b.dataset.f, b.dataset.v); apply(); }); });
  if (heatBox) heatBox.addEventListener("change", function () { F.heat = heatBox.checked; apply(); });
  function openCard(id) {
    var c = document.getElementById("s-" + id); if (!c) return;
    if (c.hidden) { ["layer", "paid", "region"].forEach(function (k) { setFilter(k, "all"); }); if (heatBox) heatBox.checked = false; F.heat = false; apply(); }
    var d = $("details", c); if (d) d.open = true;
    c.classList.add("is-flash"); setTimeout(function () { c.classList.remove("is-flash"); }, 1600);
    c.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  }

  // ---- country by country ----
  var tabs = $$("[data-co-t]"), panels = $$("[data-co]");
  function showCo(slug, focus) {
    if (!panels.some(function (p) { return p.dataset.co === slug; })) return false;
    tabs.forEach(function (t) { var on = t.dataset.coT === slug; t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1; if (on && focus) t.focus(); });
    panels.forEach(function (p) { p.hidden = p.dataset.co !== slug; p.setAttribute("role", "tabpanel"); });
    return true;
  }
  if (tabs.length) {
    document.documentElement.classList.add("rf-js");
    showCo(tabs[0].dataset.coT);
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { showCo(t.dataset.coT); });
      t.addEventListener("keydown", function (ev) { var d = ev.key === "ArrowRight" ? 1 : ev.key === "ArrowLeft" ? -1 : 0; if (!d) return; ev.preventDefault(); var n = tabs[(i + d + tabs.length) % tabs.length]; showCo(n.dataset.coT, true); });
    });
  }

  // arriving from another page: #country-<name>, #s-<scheme id>, or #layer-<id>
  function fromHash() {
    var h = decodeURIComponent(location.hash.slice(1)); if (!h) return;
    var m = h.match(/^country-(.+)$/); if (m && showCo(m[1])) { var p = document.getElementById(h); if (p) p.scrollIntoView(); return; }
    m = h.match(/^s-(.+)$/); if (m) { openCard(m[1]); return; }
    m = h.match(/^layer-(.+)$/); if (m && svg) { select(m[1]); $("#layers").scrollIntoView(); }
  }
  fromHash(); addEventListener("hashchange", fromHash);
})();
