// Follow the money: draws the flow of traced funding (window.FL, written by tools/build-economy.js).
// Four stages: who funds → how → what it builds → cycles. Wide screens get a flow diagram; narrow screens get
// stacked bars by stage. Selecting any label, band or bar follows that money from end to end.
(function () {
  "use strict";
  var FL = window.FL, chart = document.querySelector("[data-fl-chart]"), panel = document.querySelector("[data-fl-panel]");
  if (!FL || !chart) return;
  var D = FL.d, M = FL.m, NS = "http://www.w3.org/2000/svg";
  var ST = ["k", "i", "s", "c"], STN = ["Who funds", "How", "What it builds", "Cycles it could help break"];
  var S = { lens: "phil", measure: "n", status: "", where: "", sel: null, role: "" };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var label = function (st, key) { return st === "k" ? M.kinds[key] : st === "c" ? (M.loops[key] || key) : key; };
  var cyc = function (d) { return d.c.length ? d.c : ["none"]; };
  M.loops.none = "No cycle named";

  function base() {
    return D.filter(function (d) {
      if (S.measure === "u" && !d.u) return false;
      if (S.status === "paid" && !(d.st === "disbursed" || d.st === "closed")) return false;
      if (S.status && S.status !== "paid" && d.st !== S.status) return false;
      if (S.where === "sa" && !d.sa) return false;
      if (S.where === "sea" && !d.sea) return false;
      return true;
    });
  }
  function inLens(d) { return S.lens === "all" ? true : S.lens === "phil" ? (d.k === "phil" || d.i === "Grants" || d.i === "Prizes") : d.k === S.lens; }
  function passes(d) {
    if (S.role && d.role !== S.role) return false;
    var s = S.sel; if (!s) return true;
    var at = function (st, key) { return st === "c" ? cyc(d).indexOf(key) > -1 : d[st] === key; };
    return s.pair ? at(s.pair[0], s.pair[1]) && at(ST[ST.indexOf(s.pair[0]) + 1], s.pair[2]) : at(s.st, s.key);
  }
  function hiSet(b) { var any = S.sel || S.role; return b.filter(function (d) { return (any || inLens(d)) && passes(d); }); }
  var w = function (d) { return S.measure === "u" ? d.u : 1; };

  // node and link values for one set of funding
  function tally(set) {
    var nodes = {}, links = {}, touch = {};
    var add = function (o, k, v) { o[k] = (o[k] || 0) + v; };
    set.forEach(function (d) {
      var v = w(d), cs = cyc(d), vc = v / cs.length;
      add(nodes, "k|" + d.k, v); add(nodes, "i|" + d.i, v); add(nodes, "s|" + d.s, v);
      add(links, "k|" + d.k + ">i|" + d.i, v); add(links, "i|" + d.i + ">s|" + d.s, v);
      cs.forEach(function (c) { add(nodes, "c|" + c, vc); add(links, "s|" + d.s + ">c|" + c, vc); add(touch, "c|" + c, 1); });
    });
    return { nodes: nodes, links: links, touch: touch };
  }
  var fmt = function (v) { return S.measure === "u" ? (v >= 1e9 ? "US$" + (v / 1e9).toFixed(1) + " bn" : v >= 1e6 ? "US$" + (v / 1e6).toFixed(1) + " m" : "US$" + Math.round(v / 1e3) + " k") : (Math.round(v * 10) / 10).toString().replace(/\.0$/, ""); };

  // what a label says: for cycles, how many pieces of funding touch it (whole numbers), otherwise the stage value
  var show = function (T, key) { return key[0] === "c" && S.measure === "n" ? (T.touch[key] || 0) : (T.nodes[key] || 0); };
  var val = function (H, T, key) { return fmt(show(H, key)) + " of " + fmt(show(T, key)); };
  function el(n, a, p) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function selectable(e, sel, name) {
    e.setAttribute("tabindex", "0"); e.setAttribute("role", "button"); e.setAttribute("aria-label", name);
    var go = function () { S.role = ""; S.sel = same(S.sel, sel) ? null : sel; render(); };
    e.addEventListener("click", go);
    e.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); go(); } });
  }
  var same = function (a, b) { return a && b && JSON.stringify(a) === JSON.stringify(b); };

  function drawFlow(b, hi) {
    var T = tally(b), H = tally(hi), W = chart.clientWidth, LW = Math.min(290, W * 0.27), NW = 12, GAP = 8;
    var cols = ST.map(function (st) { return Object.keys(T.nodes).filter(function (k) { return k.indexOf(st + "|") === 0; }).sort(function (a, z) { return T.nodes[z] - T.nodes[a]; }); });
    var maxN = Math.max.apply(null, cols.map(function (c) { return c.length; }));
    var Hpx = Math.max(440, maxN * 22 + 40), total = Math.max.apply(null, cols.map(function (c) { return c.reduce(function (s, k) { return s + T.nodes[k]; }, 0); }));
    var k = (Hpx - 20 - (maxN - 1) * GAP) / total, usable = W - LW - NW;
    var X = ST.map(function (_, i) { return 4 + i * (usable / 3); });
    var pos = {}, bottom = 0;
    cols.forEach(function (c, ci) {
      var h = c.reduce(function (s, key) { return s + Math.max(Math.max(2, T.nodes[key] * k) + GAP, 19); }, 0) - GAP, y = Math.max(10, 10 + (Hpx - 20 - h) / 2);
      c.forEach(function (key) { var hh = Math.max(2, T.nodes[key] * k); pos[key] = { x: X[ci], y: y, h: hh, out: 0, inn: 0 }; y += Math.max(hh + GAP, 19); bottom = Math.max(bottom, y); });
    });
    Hpx = Math.max(Hpx, bottom + 6);
    var svg = el("svg", { viewBox: "0 0 " + W + " " + Hpx, width: W, height: Hpx, class: "fl-svg" });
    var gl = el("g", {}, svg), gn = el("g", {}, svg);
    Object.keys(T.links).sort().forEach(function (lk) {
      var p = lk.split(">"), a = pos[p[0]], z = pos[p[1]], v = T.links[lk] * k, hv = (H.links[lk] || 0) * k;
      var y0 = a.y + a.out, y1 = z.y + z.inn; a.out += v; z.inn += v;
      var x0 = a.x + NW, x1 = z.x, mx = (x0 + x1) / 2;
      var band = function (h, cls) { return el("path", { d: "M" + x0 + "," + y0 + "C" + mx + "," + y0 + " " + mx + "," + y1 + " " + x1 + "," + y1 + "L" + x1 + "," + (y1 + h) + "C" + mx + "," + (y1 + h) + " " + mx + "," + (y0 + h) + " " + x0 + "," + (y0 + h) + "Z", class: cls }, gl); };
      var g = band(Math.max(v, 0.6), "fl-link");
      if (hv > 0.2) band(hv, "fl-link fl-link--hi");
      var st = p[0].split("|")[0], ka = p[0].slice(2), kb = p[1].slice(2);
      selectable(g, { pair: [st, ka, kb] }, "Follow funding from " + label(st, ka) + " to " + label(ST[ST.indexOf(st) + 1], kb));
    });
    Object.keys(pos).forEach(function (key) {
      var p = pos[key], st = key[0], name = label(st, key.slice(2)), hv = (H.nodes[key] || 0) * k;
      var g = el("g", { class: "fl-node" + (S.sel && S.sel.st === st && S.sel.key === key.slice(2) ? " is-sel" : "") }, gn);
      el("rect", { x: p.x, y: p.y, width: NW, height: p.h, rx: 2, class: "fl-n" }, g);
      if (hv > 0.2) el("rect", { x: p.x, y: p.y, width: NW, height: hv, rx: 2, class: "fl-n fl-n--hi" }, g);
      var t = el("text", { x: p.x + NW + 6, y: p.y + p.h / 2, dy: "0.35em", class: "fl-t" }, g);
      t.textContent = name + " ";
      var tv = el("tspan", { class: "fl-tv" }, t); tv.textContent = val(H, T, key);
      selectable(g, { st: st, key: key.slice(2) }, "Follow " + name + ": " + val(H, T, key));
    });
    chart.innerHTML = ""; chart.appendChild(svg);
  }

  function drawBars(b, hi) {
    var T = tally(b), H = tally(hi), html = "";
    ST.forEach(function (st, i) {
      var keys = Object.keys(T.nodes).filter(function (k) { return k.indexOf(st + "|") === 0; }).sort(function (a, z) { return T.nodes[z] - T.nodes[a]; });
      var max = Math.max.apply(null, keys.map(function (k) { return T.nodes[k]; }));
      html += '<h3 class="fl-bh">' + STN[i] + "</h3><ul class=\"fl-bars\">" + keys.map(function (k) {
        var key = k.slice(2), on = S.sel && S.sel.st === st && S.sel.key === key;
        return '<li><button type="button" class="fl-b' + (on ? " is-sel" : "") + '" aria-pressed="' + !!on + '" data-st="' + st + '" data-key="' + esc(key) + '"><span class="fl-bl">' + esc(label(st, key)) + '</span><span class="fl-bt"><i style="width:' + (T.nodes[k] / max * 100) + '%"></i><i class="hi" style="width:' + ((H.nodes[k] || 0) / max * 100) + '%"></i></span><span class="fl-bv">' + val(H, T, k) + "</span></button></li>";
      }).join("") + "</ul>";
    });
    chart.innerHTML = html;
    chart.querySelectorAll(".fl-b").forEach(function (bt) { bt.addEventListener("click", function () { var s = { st: bt.dataset.st, key: bt.dataset.key }; S.role = ""; S.sel = same(S.sel, s) ? null : s; render(); }); });
  }

  var LENS = { phil: "philanthropy and grants", public: "public and climate funds", dev: "development finance", inv: "investors and insurers", all: "everything" };
  function drawPanel(b, hi) {
    var what = S.sel ? (S.sel.pair ? label(S.sel.pair[0], S.sel.pair[1]) + " → " + label(ST[ST.indexOf(S.sel.pair[0]) + 1], S.sel.pair[2]) : label(S.sel.st, S.sel.key)) : S.role ? M.roles[S.role] + " (our reading)" : "Looking through " + LENS[S.lens];
    var rows = hi.slice().sort(function (a, z) { return String(z.date).localeCompare(String(a.date)); }).map(function (d) {
      return "<tr><td>" + esc(d.r) + "</td><td>" + esc(d.f) + "</td><td>" + (d.ul ? esc(d.ul) : "Not published") + "</td><td>" + esc(M.status[d.st] || d.st) + "</td><td>" + esc(M.roles[d.role]) + "</td><td>" + esc(d.s) + "</td><td>" + (d.src ? '<a href="' + esc(d.src) + '" target="_blank" rel="noopener">' + esc(d.sl) + ' <span class="visually-hidden">(opens in a new tab)</span></a>' : "") + "</td></tr>";
    }).join("");
    panel.innerHTML = '<div class="fl-ph"><p><b>' + esc(what) + "</b>: " + hi.length + " of " + b.length + " pieces of funding" + (S.measure === "u" ? " with a published amount" : "") + ".</p>" +
      ((S.sel || S.role) ? '<button type="button" class="fl-clear" data-fl-clear>Clear the selection</button>' : "") + "</div>" +
      (hi.length ? '<details class="fl-list"' + (S.sel || S.role ? " open" : "") + "><summary>See each piece of funding</summary><div class=\"he-tablewrap\" tabindex=\"0\" role=\"region\" aria-label=\"The funding selected\"><table class=\"he-table\"><thead><tr><th scope=\"col\">Who received it</th><th scope=\"col\">From</th><th scope=\"col\">Amount</th><th scope=\"col\">Status</th><th scope=\"col\">Role (our reading)</th><th scope=\"col\">Kind of protection</th><th scope=\"col\">Source</th></tr></thead><tbody>" + rows + "</tbody></table></div></details>" : '<p class="he-note">None traced yet with these choices. This may mean we have not found it, not that it does not exist.</p>');
    var c = panel.querySelector("[data-fl-clear]"); if (c) c.addEventListener("click", function () { S.sel = null; S.role = ""; render(); });
  }

  function render() {
    var b = base(), hi = hiSet(b);
    if (!b.length) { chart.innerHTML = '<p class="he-note">Nothing matches these choices.</p>'; panel.innerHTML = ""; return; }
    (chart.clientWidth < 720 ? drawBars : drawFlow)(b, hi);
    drawPanel(b, hi);
    document.querySelector("[data-fl-caution]").hidden = S.measure !== "u";
    document.querySelectorAll("[data-lens]").forEach(function (x) { x.setAttribute("aria-checked", String(x.dataset.lens === S.lens && !S.sel && !S.role)); });
    document.querySelectorAll("[data-role]").forEach(function (x) { x.setAttribute("aria-pressed", String(x.dataset.role === S.role)); });
  }
  document.querySelectorAll("[data-lens]").forEach(function (x) { x.addEventListener("click", function () { S.lens = x.dataset.lens; S.sel = null; S.role = ""; render(); }); });
  document.querySelectorAll("[data-fl]").forEach(function (x) { x.addEventListener("change", function () { S[x.dataset.fl] = x.value; S.sel = null; render(); }); });
  document.querySelectorAll("[data-role]").forEach(function (x) { x.addEventListener("click", function () { S.role = S.role === x.dataset.role ? "" : x.dataset.role; S.sel = null; render(); document.getElementById("flow").scrollIntoView({ behavior: "smooth" }); }); });
  var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(render, 150); });
  render();
})();
