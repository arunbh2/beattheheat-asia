// Common Shade: /wet-bulb-wall/ page script (tools/build-wet-bulb-wall.js). The hypothetical scenario, its controls and
// marker, the six city markers and their details, guided explorations, overlays and the shareable link.
// City records are never edited by the controls: exploring from a city copies its values into the separate scenario.
(function () {
  "use strict";
  var W = window.WBCORE, WX = window.WBWEATHER, C = window.WBW || {};
  var svg = document.querySelector(".wbw-svg"); if (!W || !svg) return;
  var G = JSON.parse(svg.getAttribute("data-g")), NS = "http://www.w3.org/2000/svg";
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var X = function (t) { return G.x0 + (t - G.tmin) / (G.tmax - G.tmin) * (G.x1 - G.x0); }, Y = function (rh) { return G.y1 - (rh - G.rhmin) / (G.rhmax - G.rhmin) * (G.y1 - G.y0); };
  var DEF = { t: 35, rh: 50 }, S = { t: DEF.t, rh: DEF.rh }, F = false, origin = "hypothetical", cities = [], picked = null;
  var tR = $("#wbw-t"), tN = $("#wbw-tn"), hR = $("#wbw-rh"), hN = $("#wbw-rhn");
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var r1 = function (x) { return (Math.round(x * 10) / 10).toFixed(1); };
  var showT = function (c) { return F ? r1(W.cToF(c)) + " °F" : r1(c) + " °C"; };
  function el(n, a) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); return e; }

  // the scenario marker
  var you = $(".wbw-you"), mk = el("g", { class: "wbw-mk", tabindex: "0", role: "slider", "aria-label": "Your scenario: drag, or use the arrow keys", "aria-valuemin": "10", "aria-valuemax": "50" });
  mk.appendChild(el("circle", { r: "14", class: "wbw-mk__halo" })); mk.appendChild(el("circle", { r: "8", class: "wbw-mk__dot" }));
  mk.appendChild(el("path", { d: "M-20 0H-11M11 0H20M0 -20V-11M0 11V20", class: "wbw-mk__x" }));
  var mkL = el("text", { class: "wbw-mk__l", x: "16", y: "-14" }); mkL.textContent = "Your scenario"; mk.appendChild(mkL);
  you.removeAttribute("aria-hidden"); you.appendChild(mk);
  // the marker sits in a clipped group; move it to the top level so focus and dragging work at the edges
  svg.appendChild(you);

  var liveT = 0;
  function render(announce) {
    var tw = W.wetBulb(S.t, S.rh);
    mk.setAttribute("transform", "translate(" + X(S.t).toFixed(1) + " " + Y(S.rh).toFixed(1) + ")");
    mkL.setAttribute("x", X(S.t) > G.x1 - 120 ? "-16" : "16"); mkL.setAttribute("text-anchor", X(S.t) > G.x1 - 120 ? "end" : "start");
    mk.setAttribute("aria-valuenow", String(S.t)); mk.setAttribute("aria-valuetext", showT(S.t) + ", " + Math.round(S.rh) + "% relative humidity, wet-bulb " + showT(tw));
    $("[data-out=t]").textContent = showT(S.t); $("[data-out=rh]").textContent = Math.round(S.rh) + "%"; $("[data-out=tw]").textContent = showT(tw);
    tR.value = S.t; hR.value = Math.round(S.rh);
    if (document.activeElement !== tN) tN.value = F ? r1(W.cToF(S.t)) : r1(S.t);
    if (document.activeElement !== hN) hN.value = Math.round(S.rh);
    var what = origin === "hypothetical" ? "This is a hypothetical scenario." : "Hypothetical scenario, started from " + origin + "; the city’s own record is unchanged.";
    var near = tw >= 30 ? " In chamber studies, young healthy volunteers at very light effort could no longer keep heat balance at around this level in humid air; older adults, people working and people with health conditions can reach that point sooner." : tw >= 26 ? " Heat this humid already strains people doing physical work, especially without shade, rest or acclimatisation." : "";
    $("[data-wbw-say]").textContent = "At " + showT(S.t) + " and " + Math.round(S.rh) + "% relative humidity, the calculated wet-bulb temperature is " + showT(tw) + ". " + what + near;
    if (announce) { clearTimeout(liveT); liveT = setTimeout(function () { $("[data-wbw-live]").textContent = "Wet-bulb " + showT(tw) + " at " + showT(S.t) + " and " + Math.round(S.rh) + "% humidity."; }, 700); }
  }
  function set(t, rh, how) { S.t = clamp(Math.round(t * 10) / 10, 10, 50); S.rh = clamp(Math.round(rh), 1, 100); if (how) origin = how; render(true); }

  $("[data-wbw-controls]").hidden = false;
  $$("[data-wbw-guide]").forEach(function (b) { b.hidden = false; });
  tR.addEventListener("input", function () { set(+tR.value, S.rh); });
  hR.addEventListener("input", function () { set(S.t, +hR.value); });
  tN.addEventListener("change", function () { var v = parseFloat(tN.value); if (!isFinite(v)) { render(); return; } set(F ? W.fToC(v) : v, S.rh); });
  hN.addEventListener("change", function () { var v = parseFloat(hN.value); if (!isFinite(v)) { render(); return; } set(S.t, v); });
  mk.addEventListener("keydown", function (e) {
    var d = { ArrowLeft: [-0.5, 0], ArrowRight: [0.5, 0], ArrowUp: [0, 1], ArrowDown: [0, -1], PageUp: [0, 10], PageDown: [0, -10] }[e.key];
    if (!d) return; e.preventDefault(); set(S.t + d[0], S.rh + d[1]);
  });
  // dragging, by mouse, pen or touch; the page does not scroll while the marker is held
  var drag = false;
  function pt(e) { var r = svg.getBoundingClientRect(), k = G.w / r.width; return { t: G.tmin + ((e.clientX - r.left) * k - G.x0) / (G.x1 - G.x0) * (G.tmax - G.tmin), rh: G.rhmin + (G.y1 - (e.clientY - r.top) * k) / (G.y1 - G.y0) * (G.rhmax - G.rhmin) }; }
  mk.addEventListener("pointerdown", function (e) { drag = true; mk.setPointerCapture(e.pointerId); mk.classList.add("is-drag"); e.preventDefault(); });
  mk.addEventListener("pointermove", function (e) { if (!drag) return; var p = pt(e); set(Math.round(p.t * 2) / 2, p.rh); });
  ["pointerup", "pointercancel"].forEach(function (n) { mk.addEventListener(n, function () { drag = false; mk.classList.remove("is-drag"); }); });
  // a tap on the chart moves the scenario there
  svg.addEventListener("click", function (e) { if (e.target.closest(".wbw-mk") || e.target.closest(".wbw-cm")) return; var p = pt(e); if (p.t < 10 || p.t > 50 || p.rh < 0 || p.rh > 100) return; set(Math.round(p.t * 2) / 2, p.rh); });

  $("[data-wbw-reset]").addEventListener("click", function () { origin = "hypothetical"; $("[data-wbw-plus2-note]").hidden = true; set(DEF.t, DEF.rh, "hypothetical"); });
  $("[data-wbw-plus2]").addEventListener("click", function () { $("[data-wbw-plus2-note]").hidden = false; set(S.t + 2, S.rh); });
  var ub = $("[data-wbw-unit]");
  ub.addEventListener("click", function () {
    F = !F; ub.setAttribute("aria-pressed", String(F)); ub.textContent = F ? "Show °C" : "Show °F";
    $$("[data-unit]").forEach(function (e) { e.textContent = F ? "°F" : "°C"; });
    $("[data-unit-label]").textContent = F ? "Air temperature, °F" : "Air temperature, °C";
    $$(".wbw-tx").forEach(function (e) { var c = +e.getAttribute("data-c"); e.textContent = F ? Math.round(W.cToF(c)) + "°" : c + "°"; });
    tN.min = F ? 50 : 10; tN.max = F ? 122 : 50; render(); drawCities(); if (picked) showCity(picked);
  });
  $$("[data-wbw-guide]").forEach(function (b) { b.addEventListener("click", function () {
    var g = b.getAttribute("data-wbw-guide"); var v = { a: [35, 30], b1: [45, 20], b2: [32, 58] }[g];
    set(v[0], v[1], "hypothetical"); if (g === "a") hR.focus(); else mk.focus();
  }); });
  // overlays
  $$("[data-ov-toggle]").forEach(function (c) { c.addEventListener("change", function () { var g = $('[data-ov="' + c.getAttribute("data-ov-toggle") + '"]'); if (g) { if (c.checked) g.removeAttribute("hidden"); else g.setAttribute("hidden", ""); } }); });

  // shareable link: only the base page address plus validated values
  function link() { var u = location.origin + location.pathname + "?t=" + S.t + "&rh=" + Math.round(S.rh) + (F ? "&u=f" : ""); return u; }
  var lb = $("[data-wbw-link]"), lbt = lb.textContent;
  lb.addEventListener("click", function () {
    var u = link();
    var ok = function () { lb.textContent = "Link copied"; $("[data-wbw-live]").textContent = "Link to this hypothetical scenario copied."; setTimeout(function () { lb.textContent = lbt; }, 2400); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(u).then(ok, function () { prompt("Copy this link:", u); });
    else prompt("Copy this link:", u);
  });
  (function restore() {
    var q = new URLSearchParams(location.search), t = parseFloat(q.get("t")), rh = parseFloat(q.get("rh"));
    if (q.has("t") || q.has("rh")) {
      var good = /^-?\d{1,2}(\.\d)?$/.test(q.get("t") || "") && /^\d{1,3}$/.test(q.get("rh") || "") && t >= 10 && t <= 50 && rh >= 1 && rh <= 100;
      var note = $("[data-wbw-restored]"); note.hidden = false;
      if (good) { S.t = t; S.rh = rh; note.textContent = "Restored from a shared link: a hypothetical scenario of " + r1(t) + " °C and " + Math.round(rh) + "% relative humidity. Not a weather observation."; }
      else note.textContent = "The shared link’s values were not valid (air temperature 10 to 50 °C, humidity 1 to 100%), so the default scenario is shown.";
    }
    if (q.get("u") === "f") ub.click();
  })();
  render();

  // ---- the cities ----
  var list = $("[data-wbw-cities]"), box = $("[data-wbw-city]"), layer = $(".wbw-cities");
  var KEY = "cs-wbw-cities-v1", TTL = 15 * 60 * 1000;
  var fmt = function (r) {
    if (!r.validAt) return "";
    var o = { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false };
    var local = ""; try { local = new Intl.DateTimeFormat("en-GB", Object.assign({ timeZone: r.tz }, o)).format(r.validAt); } catch (e) { local = r.localTime.replace("T", " "); }
    var utc = new Intl.DateTimeFormat("en-GB", Object.assign({ timeZone: "UTC" }, o)).format(r.validAt);
    return local + " " + (r.tzAbbr || "local time") + " (" + utc + " UTC)";
  };
  function state(r) { return WX.freshness(r, Date.now()); }
  function drawCities() {
    while (layer.firstChild) layer.removeChild(layer.firstChild);
    var placed = [];
    cities.filter(function (r) { return r.status === "ok" && r.t >= G.tmin && r.t <= G.tmax; }).sort(function (a, b) { return Y(a.rh) - Y(b.rh); }).forEach(function (r) {
      var x = X(r.t), y = Y(r.rh), g = el("g", { class: "wbw-cm" + (picked && picked.id === r.id ? " is-on" : "") + (state(r) === "stale" ? " is-stale" : ""), "data-city": r.id });
      g.appendChild(el("path", { d: "M" + x + " " + (y - 7) + "L" + (x + 7) + " " + y + "L" + x + " " + (y + 7) + "L" + (x - 7) + " " + y + "Z" }));
      var ly = y + 4, lx = x + 10, anchor = "start";
      if (x > G.x1 - 70) { lx = x - 10; anchor = "end"; }
      var t = el("text", { x: lx, y: ly, "text-anchor": anchor }); t.textContent = r.name + (state(r) === "stale" ? " (stale)" : ""); g.appendChild(t);
      layer.appendChild(g);
      var bb = t.getBBox(), hit = function (b2) { return placed.some(function (p2) { return !(b2.x + b2.width < p2.x || p2.x + p2.width < b2.x || b2.y + b2.height < p2.y || p2.y + p2.height < b2.y); }); };
      for (var n = 0; n < 12 && hit(bb); n++) { ly += bb.height + 1; t.setAttribute("y", ly); bb = t.getBBox(); }
      placed.push({ x: bb.x - 2, y: bb.y - 1, width: bb.width + 4, height: bb.height + 2 });
      if (Math.abs(ly - (y + 4)) > 2) g.insertBefore(el("path", { class: "wbw-cm__lead", d: "M" + x + " " + y + "L" + (lx + (anchor === "end" ? 2 : -2)) + " " + (bb.y + bb.height / 2) }), t);
      g.addEventListener("click", function (e) { e.stopPropagation(); pick(r.id); });
    });
  }
  function listCities() {
    list.innerHTML = "";
    var ul = document.createElement("ul"); ul.className = "wbw-cl";
    cities.forEach(function (r) {
      var li = document.createElement("li"), b = document.createElement("button"); b.type = "button"; b.className = "wbw-cb" + (picked && picked.id === r.id ? " is-on" : "");
      b.setAttribute("aria-pressed", String(!!(picked && picked.id === r.id)));
      var st = state(r), out = r.status === "ok" && (r.t < G.tmin || r.t > G.tmax);
      b.innerHTML = "<b></b><span></span><small></small>";
      b.querySelector("b").textContent = r.name;
      b.querySelector("span").textContent = r.status === "ok" ? showT(r.t) + " · " + Math.round(r.rh) + "% · wet-bulb " + showT(W.wetBulb(r.t, r.rh)) : "Not available";
      b.querySelector("small").textContent = r.status !== "ok" ? "No current values; not plotted" : (st === "stale" ? "Stale: " : "") + fmt(r) + (out ? " · outside the chart’s 10 to 50 °C, not plotted" : "");
      b.addEventListener("click", function () { pick(r.id); });
      li.appendChild(b); ul.appendChild(li);
    });
    list.appendChild(ul);
    var t = document.createElement("table"); t.className = "wbw-table";
    t.innerHTML = "<caption>The same city values as a table</caption><thead><tr><th scope=\"col\">City</th><th scope=\"col\">Air temperature</th><th scope=\"col\">Relative humidity</th><th scope=\"col\">Calculated wet-bulb</th><th scope=\"col\">Model time</th><th scope=\"col\">Status</th></tr></thead><tbody></tbody>";
    cities.forEach(function (r) { var tr = document.createElement("tr"), ok = r.status === "ok"; [r.name, ok ? showT(r.t) : "Not available", ok ? Math.round(r.rh) + "%" : "Not available", ok ? showT(W.wetBulb(r.t, r.rh)) : "Not available", ok ? fmt(r) : "", { fresh: "Latest available", stale: "Stale", missing: "Missing" }[state(r)]].forEach(function (v, i) { var c = document.createElement(i ? "td" : "th"); if (!i) c.scope = "row"; c.textContent = v; tr.appendChild(c); }); t.tBodies[0].appendChild(tr); });
    var d = document.createElement("details"); d.className = "wbw-det"; d.innerHTML = "<summary>City values as a table</summary>"; d.appendChild(t); list.appendChild(d);
  }
  function showCity(r) {
    box.hidden = false; box.innerHTML = "";
    var h = document.createElement("h3"); h.className = "wbw-h3"; h.textContent = r.name + ", " + (r.status === "ok" ? "latest available weather" : "not available"); box.appendChild(h);
    var p = document.createElement("p");
    if (r.status === "ok") {
      p.textContent = "Air temperature " + showT(r.t) + ", relative humidity " + Math.round(r.rh) + "%, calculated wet-bulb " + showT(W.wetBulb(r.t, r.rh)) + " (at 1013.25 hPa). Model time " + fmt(r) + ". " + (state(r) === "stale" ? "Stale: this is the last value received; it is older than an hour. " : "") + "Modelled current conditions from Open-Meteo for the grid point nearest " + r.lat + ", " + r.lon + (r.elevation != null ? " (elevation " + Math.round(r.elevation) + " m)" : "") + (r.pressure != null ? "; surface pressure there " + Math.round(r.pressure) + " hPa" : "") + ". Retrieved " + new Date(r.retrieved).toLocaleString("en-GB") + " your time.";
    } else p.textContent = "No current values for " + r.name + " (" + (r.reason || "the request did not return data") + "). The simulator still works.";
    box.appendChild(p);
    if (r.status === "ok") {
      var b = document.createElement("button"); b.type = "button"; b.className = "wbw-btn"; b.textContent = "Explore from these conditions";
      b.addEventListener("click", function () { set(r.t, r.rh, r.name + "’s " + (state(r) === "stale" ? "last available" : "latest available") + " weather"); $("[data-wbw-restored]").hidden = true; mk.focus(); svg.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); });
      box.appendChild(b);
    }
  }
  function pick(id) { picked = cities.filter(function (r) { return r.id === id; })[0] || null; drawCities(); listCities(); if (picked) showCity(picked); }
  function done(recs) { cities = recs; drawCities(); listCities(); }
  var cached = null; try { cached = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) {}
  if (cached && Date.now() - cached.at < TTL && cached.recs) done(cached.recs);
  else if (WX && C.cities) {
    fetch(WX.url(C.cities)).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }).then(function (j) {
      var recs = WX.merge(WX.parse(j, C.cities, Date.now()), cached && cached.recs);
      try { localStorage.setItem(KEY, JSON.stringify({ at: Date.now(), recs: recs })); } catch (e) {}
      done(recs);
    }).catch(function () {
      var recs = cached && cached.recs ? cached.recs.map(function (r) { return Object.assign({}, r, { fromCache: true }); }) : C.cities.map(function (c) { return { id: c.id, name: c.name, lat: c.lat, lon: c.lon, status: "missing", reason: "the weather service could not be reached" }; });
      done(recs);
      var n = document.createElement("p"); n.className = "wbw-meta"; n.textContent = cached ? "The weather service could not be reached; showing the last values received, with their original times." : "The weather service could not be reached. The simulator works without it."; list.insertBefore(n, list.firstChild);
    });
  }
})();
