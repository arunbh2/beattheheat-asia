// Atlas of Asia's heat: heatwaves and the steps that followed, year by year, on the drawn map (window.ATL, from tools/build-pages.js).
// The map matches images/asia-map.svg: equirectangular, longitude 64–129, latitude -12–34.
(function () {
  "use strict";
  var A = window.ATL, map = document.querySelector("[data-atl-map]"), side = document.querySelector("[data-atl-side]");
  if (!A || !map) return;
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var X = function (lon) { return (lon - 64) / 65 * 100; }, Y = function (lat) { return (34 - lat) / 46 * 100; };
  var range = document.querySelector("[data-atl-range]"), yearEl = document.querySelector("[data-atl-year]"), lineEl = document.querySelector("[data-atl-line]");
  var layer = { hw: true, ms: true, city: false, live: false };
  var S = { y: A.y1, sel: null, live: null, timer: null };
  var KIND = { plan: "Plan", rule: "Rule", role: "Role", programme: "Programme" };
  var ext = function (s) { return s ? '<a href="' + esc(s[1]) + '" target="_blank" rel="noopener">' + esc(s[0]) + ' <span class="visually-hidden">(opens in a new tab)</span></a>' : ""; };

  // the timeline ticks: one per year, marked where something happened
  var ticks = document.querySelector("[data-atl-ticks]"), years = [];
  for (var y = A.y0; y <= A.y1; y++) years.push(y);
  ticks.innerHTML = years.map(function (y) {
    var h = A.hw.some(function (e) { return e.y === y; }), m = A.ms.some(function (e) { return e.year === y; });
    return '<span style="left:' + ((y - A.y0) / (A.y1 - A.y0) * 100) + '%">' + (h ? '<i class="h"></i>' : "") + (m ? '<i class="m"></i>' : "") + ((y % 4 === 2 || y === A.y1) ? "<b>" + y + "</b>" : "") + "</span>";
  }).join("");

  function events(y) {
    return A.hw.filter(function (e) { return e.y === y; }).map(function (e) { return { k: "hw", e: e, t: e.t }; })
      .concat(A.ms.filter(function (e) { return e.year === y; }).map(function (e) { return { k: "ms", e: e, t: e.title }; }));
  }
  function draw() {
    var y = S.y, html = "";
    if (layer.hw) A.hw.filter(function (e) { return e.y <= y; }).forEach(function (e) {
      var w = e.r / 65 * 100, now = e.y === y;
      html += '<button type="button" class="atl-hw' + (now ? " is-now" : "") + (S.sel === e.id ? " is-sel" : "") + '" style="left:' + X(e.lon) + "%;top:" + Y(e.lat) + "%;width:" + w + '%" data-id="' + e.id + '" aria-label="Heatwave, ' + esc(e.when + ", " + e.place) + '"></button>';
    });
    if (layer.ms) A.ms.filter(function (e) { return e.year <= y; }).forEach(function (e) {
      html += '<button type="button" class="atl-ms' + (e.year === y ? " is-now" : "") + (S.sel === e.id ? " is-sel" : "") + '" style="left:' + X(e.lon) + "%;top:" + Y(e.lat) + '%" data-id="' + e.id + '" aria-label="' + esc(e.year + ": " + e.title) + '"></button>';
    });
    if (layer.city || layer.live) A.cities.forEach(function (c) {
      var t = S.live && S.live[c.id];
      html += '<button type="button" class="atl-city atl-city--' + esc(layer.city ? c.st : "live") + (S.sel === c.id ? " is-sel" : "") + '" style="left:' + X(c.lon) + "%;top:" + Y(c.lat) + '%" data-id="' + c.id + '" aria-label="' + esc(c.n) + '"><span>' + esc(c.n) + (layer.live && t ? " · " + Math.round(t.t) + "°" : "") + "</span></button>";
    });
    map.querySelectorAll(".atl-hw,.atl-ms,.atl-city").forEach(function (n) { n.remove(); });
    map.insertAdjacentHTML("beforeend", html);
    map.querySelectorAll("[data-id]").forEach(function (b) { b.addEventListener("click", function () { S.sel = b.dataset.id; draw(); panel(); }); });
    var ev = events(y);
    yearEl.textContent = y;
    lineEl.textContent = ev.length ? ev.map(function (x) { return x.t; }).join(" · ") : "No heatwave or milestone in our research for this year.";
    range.value = y;
    range.setAttribute("aria-valuetext", y + (ev.length ? ": " + ev.map(function (x) { return x.t; }).join("; ") : ""));
  }
  function find(id) {
    var h = A.hw.find(function (e) { return e.id === id; }); if (h) return { k: "hw", e: h };
    var m = A.ms.find(function (e) { return e.id === id; }); if (m) return { k: "ms", e: m };
    var c = A.cities.find(function (e) { return e.id === id; }); if (c) return { k: "city", e: c };
  }
  function panel() {
    var f = S.sel && find(S.sel);
    if (!f) {
      var ev = events(S.y);
      side.innerHTML = '<p class="atl-k2">' + S.y + "</p>" + (ev.length ? '<ul class="atl-evs">' + ev.map(function (x) {
        return '<li><button type="button" data-open="' + x.e.id + '"><i class="atl-k atl-k--' + x.k + '"></i>' + esc(x.t) + "</button></li>"; }).join("") + "</ul>"
        : '<p class="atl-muted">Nothing recorded in our research for this year. Drag the timeline, or press play.</p>') +
        '<p class="atl-muted">Select any mark on the map to read its story and its source.</p>';
    } else if (f.k === "hw") {
      var e = f.e;
      side.innerHTML = '<p class="atl-k2"><i class="atl-k atl-k--hw"></i>Heatwave · ' + esc(e.when) + "</p><h3>" + esc(e.t) + '</h3><p class="atl-muted">' + esc(e.place) + "</p><p>" + esc(e.what) + "</p>" + (e.toll ? '<p class="atl-toll">' + esc(e.toll) + "</p>" : "") +
        '<p><b>What came after.</b> ' + esc(e.changed) + '</p><p class="atl-src">Source: ' + ext(e.src) + '</p><p><a href="/heatwaves/#' + e.id + '">Read it on Heatwaves that shaped Asia <span aria-hidden="true">→</span></a></p>';
    } else if (f.k === "ms") {
      var m = f.e;
      side.innerHTML = '<p class="atl-k2"><i class="atl-k atl-k--ms"></i>' + esc(KIND[m.kind] || "Milestone") + " · " + m.year + "</p><h3>" + esc(m.title) + '</h3><p class="atl-muted">' + esc(m.place) + "</p><p>" + esc(m.text) + '</p><p class="atl-src">Source: ' + ext(m.source) + "</p>" +
        (m.link ? '<p><a href="' + esc(m.link[0]) + '">' + esc(m.link[1]) + ' <span aria-hidden="true">→</span></a></p>' : "");
    } else {
      var c = f.e, t = S.live && S.live[c.id];
      side.innerHTML = '<p class="atl-k2"><i class="atl-k atl-k--city"></i>' + esc(c.c) + "</p><h3>" + esc(c.n) + "</h3>" +
        '<p class="atl-st atl-st--' + esc(c.st) + '">' + esc(A.hap[c.st] || "") + "</p><p>" + esc(c.tx) + "</p>" +
        (t ? '<p class="atl-live"><b>' + Math.round(t.t) + "°C</b> now, feels like " + Math.round(t.a) + '°C. <span class="atl-muted">' + esc(A.note) + "</span></p>" : "") +
        (c.warn ? '<p class="atl-src">Official warnings: ' + ext(c.warn) + "</p>" : "") + '<p><a href="/cities/#' + c.id + '">Read the city profile <span aria-hidden="true">→</span></a></p>';
    }
    if (S.sel) side.insertAdjacentHTML("beforeend", '<button type="button" class="fl-clear" data-back>Back to ' + S.y + "</button>");
    side.querySelectorAll("[data-open]").forEach(function (b) { b.addEventListener("click", function () { S.sel = b.dataset.open; draw(); panel(); }); });
    var bk = side.querySelector("[data-back]"); if (bk) bk.addEventListener("click", function () { S.sel = null; draw(); panel(); });
  }
  function setYear(y) { S.y = Math.max(A.y0, Math.min(A.y1, y)); S.sel = null; draw(); panel(); }
  range.addEventListener("input", function () { stop(); setYear(+range.value); });
  ticks.addEventListener("click", function (ev) { var r = ticks.getBoundingClientRect(); stop(); setYear(Math.round(A.y0 + (ev.clientX - r.left) / r.width * (A.y1 - A.y0))); });
  var play = document.querySelector("[data-atl-play]");
  function stop() { if (S.timer) { clearInterval(S.timer); S.timer = null; play.textContent = "Play"; play.setAttribute("aria-label", "Play the years"); } }
  play.addEventListener("click", function () {
    if (S.timer) return stop();
    if (S.y >= A.y1) setYear(A.y0);
    play.textContent = "Pause"; play.setAttribute("aria-label", "Pause");
    S.timer = setInterval(function () { if (S.y >= A.y1) return stop(); setYear(S.y + 1); }, 1100);
  });
  // heat right now: the same model readings as the site's ticker; an estimate, not an official warning
  function loadLive() {
    if (S.live) return;
    var q = "https://api.open-meteo.com/v1/forecast?latitude=" + A.cities.map(function (c) { return c.lat; }).join(",") + "&longitude=" + A.cities.map(function (c) { return c.lon; }).join(",") + "&current=temperature_2m,apparent_temperature&timezone=auto";
    fetch(q).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (j) {
      j = Array.isArray(j) ? j : [j]; S.live = {};
      A.cities.forEach(function (c, i) { var cur = j[i] && j[i].current; if (cur) S.live[c.id] = { t: cur.temperature_2m, a: cur.apparent_temperature }; });
      draw(); panel();
    }).catch(function () { lineEl.textContent = "Live readings could not be loaded just now."; });
  }
  document.querySelectorAll("[data-layer]").forEach(function (x) {
    x.addEventListener("change", function () { layer[x.dataset.layer] = x.checked; if (x.dataset.layer === "live" && x.checked) { loadLive(); setYear(A.y1); } draw(); });
  });
  draw(); panel();
})();
