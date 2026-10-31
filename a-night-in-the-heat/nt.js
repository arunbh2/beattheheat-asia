/* A night in the heat: choose whose night, choose what is in place, then live through it hour by hour.
   The strain levels are a teaching model built from the evidence on the page, not a medical prediction.
   Data: window.NT (tools/build-live.js). Nothing here is sent anywhere. */
(function () {
  "use strict";
  var N = window.NT, root = document.querySelector("[data-nt]"); if (!N || !root) return;
  var $ = function (s) { return root.querySelector(s); }, $$ = function (s) { return [].slice.call(root.querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var S = { who: N.who[0].id, help: {}, h: -1, peak: 0, log: [] };
  var LABEL = ["Resting", "Coping", "Uncomfortable and tired", "Strained: warning signs", "In danger: needs care now"];
  var who = function () { return N.who.filter(function (w) { return w.id === S.who; })[0]; };

  function step(n) {
    $$("[data-nt-panel]").forEach(function (p) { p.hidden = p.dataset.ntPanel !== String(n); });
    $$("[data-nt-step]").forEach(function (s) { s.classList.toggle("is-on", +s.dataset.ntStep <= n); });
    if (n === 3) { S.h = -1; S.peak = 0; S.log = []; $("[data-nt-end]").hidden = true; $("[data-nt-hour]").hidden = false; hour(); }
    var p = $('[data-nt-panel="' + n + '"]'); var h = p && p.querySelector("h2"); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    root.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }
  function fact() { var w = who(); $("[data-nt-fact]").innerHTML = w.fact && w.fact.text ? esc(w.fact.text) + (w.fact.src ? ' <span class="lv-src">Source: <a href="' + esc(w.fact.src.url) + '" target="_blank" rel="noopener">' + esc(w.fact.src.label) + '</a></span>' : "") : ""; }

  // ---- the night, hour by hour ----
  function strainAt(i) {
    var H = N.hours[i], h = S.help, s = H.indoor + (S.who === "older" ? 1 : 0);
    var cut = i === 2 && !h.power, fanOn = h.fan && !(i >= 2 && !h.power);
    if (i <= 2 && h.roof) s -= 1;
    if ((i === 1 || i === 2) && fanOn) s -= 1;
    if ((i === 2 || i === 3) && h.centre) s -= 1;
    if (i === 3 && h.check) s -= 1;
    if (i === 3 && S.peak >= 3 && !h.check && !h.centre) s += 1;               // a night of warning signs, unnoticed
    if (i === 5) s = Math.max(0, S.peak - (h.clinic ? 2 : 0) + (h.clinic ? 0 : (S.peak >= 3 ? 1 : 0)) - 1);
    return { s: Math.max(0, Math.min(4, s)), cut: cut, fanOn: fanOn };
  }
  function say(i, r) {
    var H = N.hours[i], h = S.help, o = [H.say.base];
    if (i === 0 && h.roof) o.push(H.say.roof);
    if (i === 1) o.push(r.fanOn ? H.say.fan : H.say.nofan);
    if (i === 2) { if (r.cut) o.push(h.fan ? H.say.cut : "There is no fan to lose, and no breeze."); if (h.centre) o.push(H.say.centre); }
    if (i === 3) o.push(h.check ? H.say.check : H.say.alone);
    if (i === 5) o.push(h.clinic ? H.say.ready : H.say.unready);
    if (i === 3 && S.who === "pregnant") o.push("For a pregnancy, a night like this is a strain on two bodies.");
    if (i === 3 && S.who === "baby") o.push("The baby is fretful and feeding less; the parents take turns to fan and give fluids.");
    return o;
  }
  function hour() {
    S.h++;
    if (S.h >= N.hours.length) return end();
    var r = strainAt(S.h); S.peak = Math.max(S.peak, r.s); S.log.push(r.s);
    var H = N.hours[S.h];
    $("[data-nt-clock]").textContent = H.t;
    var m = $("[data-nt-meter]"); m.setAttribute("aria-valuenow", r.s); m.setAttribute("aria-valuetext", LABEL[r.s]);
    [].slice.call(m.children).forEach(function (b, k) { b.className = k < r.s ? "on s" + r.s : ""; });
    $("[data-nt-mlab]").textContent = LABEL[r.s];
    $("[data-nt-say]").innerHTML = say(S.h, r).map(function (t) { return "<p>" + esc(t) + "</p>"; }).join("");
    room(H, r);
    $("[data-nt-hour]").innerHTML = S.h === N.hours.length - 1 ? 'See what made the difference <span aria-hidden="true">→</span>' : 'Next hour <span aria-hidden="true">→</span>';
  }
  function end() {
    var h = S.help, used = N.help.filter(function (x) { return h[x.id]; }), missing = N.help.filter(function (x) { return !h[x.id]; });
    var peak = S.peak, w = who();
    $("[data-nt-hour]").hidden = true;
    var e = $("[data-nt-end]"); e.hidden = false;
    e.innerHTML = '<h2 class="lv-h">Morning, after the night</h2>' +
      '<p class="lv-out lv-out--' + (peak >= 4 ? "red" : peak >= 3 ? "amber" : "green") + '"><b>The hardest hour:</b> ' + esc(LABEL[peak]) + ". " +
      (peak >= 4 ? "A night like this is when heat illness turns dangerous, and when deaths go uncounted." : peak >= 3 ? "Warning signs, in the hours when fewest people are awake to notice." : "Hard, but survivable, because enough was in place.") + "</p>" +
      '<div class="lv-cols"><div><h3>What helped</h3>' + (used.length ? "<ul>" + used.map(function (x) { return "<li><b>" + esc(x.name) + ".</b> " + esc(x.text) + "</li>"; }).join("") + "</ul>" : "<p>Nothing was in place tonight.</p>") + "</div>" +
      "<div><h3>What could have eased it</h3>" + (missing.length ? "<ul>" + missing.map(function (x) { return "<li><b>" + esc(x.name) + ".</b> " + esc(x.text) + "</li>"; }).join("") + "</ul>" : "<p>Everything on the list was in place.</p>") + "</div></div>" +
      '<h3>What could protect people like this, at scale</h3><p class="hub-p">None of these is a wage. They are homes, check-ins, cool rooms and clinics, held up by the people and budgets that run them.</p><ul class="lv-links">' +
      N.levers.map(function (l) { return '<li><a href="/actions/#' + l.id + '">' + esc(l.title) + "</a></li>"; }).join("") + "</ul>" +
      '<p class="hub-p">The cycles this night sits inside: ' + N.loops.map(function (l) { return '<a href="/loops/#' + l.id + '">' + esc(l.name) + "</a>"; }).join(", ") + ".</p>" +
      '<p class="lv-ctrl"><button type="button" class="lv-next" data-nt-again>Try a different night</button> <a class="lv-back" href="/a-city-under-strain/">Next: a city under strain</a></p>';
    e.querySelector("[data-nt-again]").addEventListener("click", function () { step(1); });
    e.querySelector("h2").setAttribute("tabindex", "-1"); e.querySelector("h2").focus();
  }

  // ---- the drawn room ----
  var svg = $("[data-nt-room]");
  function room(H, r) {
    var h = S.help, dark = H.scene !== "dawn" && H.scene !== "clinic", hot = ["#F6E7D7", "#F8D9B8", "#F6B98C", "#F2955F", "#E8703A"][r.s];
    var fig = S.who === "baby" ? '<circle cx="300" cy="244" r="9"/><path d="M309 246 H360"/><circle cx="356" cy="236" r="6"/><path d="M362 238 H382"/>' : '<circle cx="300" cy="244" r="9"/><path d="M309 246 H372" />' + (S.who === "pregnant" ? '<path d="M330 246 q12 -16 24 0" />' : "");
    if (H.scene === "clinic") {
      svg.innerHTML = '<rect width="640" height="360" fill="#FAF7F2"/><circle cx="560" cy="62" r="28" fill="#F5A623"/>' +
        '<g fill="none" stroke="#16202B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M40 320 H600" opacity=".4"/><rect x="150" y="120" width="340" height="200" fill="#fff"/><path d="M300 150 h40 M320 130 v40" stroke="#D7263D" stroke-width="8"/>' +
        '<rect x="190" y="230" width="60" height="90"/><rect x="390" y="200" width="70" height="50"/>' + (h.clinic ? '<path d="M402 225 h46" stroke="#1F7A70"/><text x="400" y="272" fill="#1F7A70" stroke="none" font-size="16" font-weight="700">Cool room</text>' : '<circle cx="268" cy="300" r="7"/><circle cx="292" cy="300" r="7"/><circle cx="316" cy="300" r="7"/><circle cx="340" cy="300" r="7"/>') +
        '<circle cx="220" cy="262" r="9"/><path d="M220 271 V300 M220 300 L212 320 M220 300 L228 320"/></g>';
      return;
    }
    var sky = dark ? "#16202B" : "#F6E7D7", moon = dark ? '<path d="M556 46 a26 26 0 1 0 20 42 a21 21 0 0 1 -20 -42 Z" fill="#F6E7D7"/>' : '<circle cx="560" cy="62" r="26" fill="#F5A623"/>';
    var spin = r.fanOn && !reduce ? ' class="lv-spin"' : "";
    svg.innerHTML = '<rect width="640" height="360" fill="' + sky + '"/>' + moon +
      '<path d="M90 140 L320 50 L550 140" fill="none" stroke="' + (h.roof ? "#FFFFFF" : "#B8401A") + '" stroke-width="' + (h.roof ? 12 : 8) + '" stroke-linejoin="round"/>' +
      '<rect x="110" y="140" width="420" height="190" fill="' + hot + '" stroke="#16202B" stroke-width="3"/>' +
      '<g fill="none" stroke="#B8401A" stroke-width="2.5" stroke-linecap="round" opacity="' + (r.s / 5).toFixed(2) + '"><path d="M180 200 q8 -12 0 -24 q-8 -12 0 -24"/><path d="M450 200 q8 -12 0 -24 q-8 -12 0 -24"/><path d="M320 190 q8 -12 0 -24 q-8 -12 0 -24"/></g>' +
      '<rect x="150" y="172" width="60" height="50" fill="' + sky + '" stroke="#16202B" stroke-width="3"/>' +
      '<g fill="none" stroke="#16202B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M270 262 H400 V286 H270 Z" fill="#fff"/>' + fig + "</g>" +
      '<g transform="translate(470 196)"><path d="M0 0 V70" stroke="#16202B" stroke-width="3"/><g' + spin + '><path d="M0 0 l-18 -6 M0 0 l14 -14 M0 0 l6 18" stroke="' + (r.fanOn ? "#1F7A70" : "#8a939b") + '" stroke-width="6" stroke-linecap="round"/></g></g>' +
      (r.cut ? '<text x="420" y="160" fill="#D7263D" font-size="18" font-weight="800">Power cut</text>' : "") +
      (S.h === 3 && h.check ? '<g transform="translate(232 150)"><rect x="-14" y="-24" width="28" height="44" rx="5" fill="#1F7A70"/><path d="M-26 -28 q-8 10 0 20 M26 -28 q8 10 0 20" stroke="#1F7A70" stroke-width="3" fill="none"/></g>' : "");
  }

  // ---- wiring ----
  $$("[data-who]").forEach(function (b) { b.addEventListener("click", function () { S.who = b.dataset.who; $$("[data-who]").forEach(function (x) { var on = x === b; x.classList.toggle("is-on", on); x.setAttribute("aria-checked", String(on)); }); fact(); }); });
  $$("[data-help]").forEach(function (c) { c.addEventListener("change", function () { S.help[c.dataset.help] = c.checked; }); });
  $$("[data-nt-go]").forEach(function (b) { b.addEventListener("click", function () { step(+b.dataset.ntGo); }); });
  $("[data-nt-hour]").addEventListener("click", hour);
  fact();
})();
