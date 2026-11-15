// Common Shade: heat today and the next three days on a city page. Reads window.CITY_HEAT (written by
// tools/build-static.js) and window.CSHeat (city-heat/heat-core.js). One Open-Meteo request for this city, and for
// Singapore NEA's measured WBGT from data.gov.sg; both cached in the browser for 30 minutes. With no JavaScript, the
// block keeps its link to the national weather service.
(function () {
  "use strict";
  var C = window.CITY_HEAT, H = window.CSHeat, box = document.querySelector("[data-city-heat]");
  if (!C || !H || !box) return;
  var W = C.words, KEY = "cs-cityheat-" + C.id, TTL = 30 * 60 * 1000, STALE = 3 * 3600 * 1000;
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var deg = function (v, d) { return (d ? v.toFixed(d) : Math.round(v)) + " °C"; };
  var ext = function (u, l) { return '<a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(l) + '<span class="visually-hidden"> (opens in a new tab)</span></a>'; };
  var say = function (msg) { box.innerHTML = '<p class="ch-msg">' + msg + ' Official warnings: ' + ext(C.warn.url, C.warn.label) + '.</p>'; };
  var dayName = function (iso, i) { return i === 0 ? "Today" : new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", { weekday: "long", timeZone: "UTC" }); };

  // NEA's measured WBGT: the highest station, dropped if missing or more than two hours old
  function measured(j) {
    var rs = [], at = NaN;
    (function walk(o) { if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === "object") {
      if ("wbgt" in o && isFinite(parseFloat(o.wbgt))) rs.push({ v: parseFloat(o.wbgt), level: String(o.heatStress || "") });
      if (typeof o.datetime === "string") { var t = Date.parse(o.datetime); if (isFinite(t) && !(t <= at)) at = t; }
      Object.keys(o).forEach(function (k) { if (k !== "wbgt") walk(o[k]); }); } })(j);
    if (!rs.length || !isFinite(at) || Date.now() - at > 2 * 3600 * 1000) return null;
    var top = rs.reduce(function (a, b) { return b.v > a.v ? b : a; });
    return { v: top.v, level: top.level, n: rs.length };
  }
  function load() {
    try { var c = JSON.parse(localStorage.getItem(KEY) || "null"); if (c && Date.now() - c.at < TTL) return Promise.resolve(c); } catch (e) {}
    var q = "https://api.open-meteo.com/v1/forecast?latitude=" + C.lat + "&longitude=" + C.lon +
      "&current=temperature_2m,apparent_temperature,relative_humidity_2m&hourly=temperature_2m,relative_humidity_2m&daily=temperature_2m_max&timezone=auto&forecast_days=4";
    var model = fetch(q).then(function (r) { if (!r.ok) throw new Error("model " + r.status); return r.json(); });
    var sg = C.wbgt ? fetch("https://api-open.data.gov.sg/v2/real-time/api/weather?api=wbgt").then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { return j && measured(j); }).catch(function () { return null; }) : Promise.resolve(null);
    return Promise.all([model, sg]).then(function (x) {
      var d = x[0]; if (!d || !d.current || !d.hourly) throw new Error("empty");
      var today = String(d.current.time).slice(0, 10), hi = {};
      (d.daily && d.daily.time || []).forEach(function (t, k) { hi[t] = d.daily.temperature_2m_max[k]; });
      var out = { at: Date.now(), time: d.current.time, offset: d.utc_offset_seconds || 0, t: d.current.temperature_2m, rh: d.current.relative_humidity_2m, feels: d.current.apparent_temperature,
        days: H.peaks(d.hourly, today, 4).map(function (p) { return { date: p.date, wbgt: p.wbgt, hour: p.hour, max: hi[p.date] != null ? hi[p.date] : p.tmax }; }), sg: x[1] };
      try { localStorage.setItem(KEY, JSON.stringify(out)); } catch (e) {}
      return out;
    });
  }
  // the country's own warning bands for heat index or the day's high, as on the homepage: our estimate, never a warning
  function national(d) {
    var L = C.levels; if (!L || L.basis === "wbgt") return "";
    var v = L.basis === "hi" ? H.heatIndex(d.t, d.rh) : L.basis === "tmax" && d.days[0] ? d.days[0].max : null;
    if (v == null) return "";
    var i = H.band(L.levels, v); if (i < L.flag) return "";
    var what = L.basis === "hi" ? "estimated heat index " + deg(v) : "today’s forecast high " + deg(v);
    return '<p class="ch-lv"><b>' + esc(L.short || L.agency) + ": " + esc(L.levels[i][1]) + "</b> Our estimate from the " + esc(what) + ", using " + (/^[A-Z]+$/.test(L.agency) ? "" : "the ") + esc(L.agency) + "’s bands. Not an official warning. " + ext(L.source.url, "The bands") + "</p>";
  }
  function render(d) {
    var age = Date.now() - (Date.parse(d.time + ":00Z") - d.offset * 1000);
    if (!isFinite(age) || age > STALE || d.t == null || d.rh == null) { say("No current reading for " + esc(C.name) + " just now."); return; }
    var now = H.wbgt(d.t, d.rh);
    box.innerHTML = '<div class="ch-now"><p class="ch-k">Now, ' + esc(String(d.time).slice(11, 16)) + ' local time</p>' +
      '<p class="ch-v">' + now.toFixed(1) + '<span> °C</span></p><p class="ch-n">' + esc(W.name) + '</p>' +
      '<p class="ch-air">Air ' + deg(d.t) + ' · humidity ' + Math.round(d.rh) + '%' + (d.feels != null ? ' · feels like ' + deg(d.feels) : "") + '</p></div>' +
      (d.sg ? '<p class="ch-meas"><b>Measured WBGT ' + deg(d.sg.v, 1) + '</b>' + (d.sg.level ? ', ' + esc(d.sg.level.toLowerCase()) + ' heat stress' : "") + ', at the highest of ' + d.sg.n + ' stations (National Environment Agency). This is a measurement; the figure above is our estimate.</p>' : "") +
      national(d) +
      (d.days.length ? '<table class="ch-days"><caption>' + esc(W.name) + ': estimated daily peak</caption><thead><tr><th scope="col">Day</th><th scope="col">Forecast high</th><th scope="col">Estimated peak WBGT</th></tr></thead><tbody>' +
        d.days.map(function (x, i) { return '<tr><th scope="row">' + esc(dayName(x.date, i)) + '</th><td>' + (x.max != null ? deg(x.max) : "–") + '</td><td>' + deg(x.wbgt, 1) + ' <span class="ch-h">around ' + esc(x.hour) + '</span></td></tr>'; }).join("") + '</tbody></table>' : "") +
      '<p class="ch-note">' + esc(W.noLevel) + ' ' + esc(W.not) + ' Official warnings: ' + ext(C.warn.url, C.warn.label) + '.</p>' +
      '<p class="ch-src">Updated ' + new Date(d.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + ' your time. ' + C.credit + '</p>';
  }
  if (navigator.onLine === false) { say("You appear to be offline, so today’s readings cannot load."); return; }
  box.innerHTML = '<p class="ch-msg" aria-busy="true">Loading today’s readings…</p>';
  load().then(render, function () { say("Live data could not be loaded just now."); });
})();
