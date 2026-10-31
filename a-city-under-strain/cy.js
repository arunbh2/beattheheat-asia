/* A city under strain: choose what a city has in place, then run five days of a heatwave through its power, water,
   clinics, nights and trees. A teaching model with illustrative units, not a forecast for any real city.
   Data: window.CY (tools/build-live.js). Nothing here is sent anywhere. */
(function () {
  "use strict";
  var Y = window.CY, root = document.querySelector("[data-cy]"); if (!Y || !root) return;
  var $ = function (s) { return root.querySelector(s); }, $$ = function (s) { return [].slice.call(root.querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var P = {}, timer = null;
  var WORD = ["Holding", "Strained", "Failing"], CLS = ["ok", "amber", "red"];

  // ---- the model: demand against capacity, then what a power cut does to water, clinics and nights ----
  function run(p) {
    var store = p.storage ? 10 : 0, out = [];
    Y.days.forEach(function (D, i) {
      var demand = 60 + (D.day - 35) * 5 - (p.roofs ? 8 : 0) - (p.efficient ? 8 : 0) - (p.trees ? 3 : 0);
      var cap = 100 - Math.max(0, D.day - 40) * 3;                       // plants short of cooling water, hot lines carry less
      var cut = Math.max(0, Math.ceil((demand - cap) / 4));             // hours without power
      var dry = 0; if (cut && !p.backup) { var use = Math.min(store, cut); store -= use; dry = cut - use; }
      var clinic = (D.day - 39) / 2 + (cut && !p.backup ? 2 : 0) - (p.warn ? 2 : 0);
      var night = D.night - (p.trees ? 1.5 : 0) - (p.roofs ? 1 : 0) + (cut ? 1 : 0);
      var s = { power: cut === 0 ? 0 : cut <= 4 ? 1 : 2, water: dry === 0 ? 0 : dry <= 6 ? 1 : 2, clinic: clinic <= 1 ? 0 : clinic <= 3 ? 1 : 2,
        nights: night <= 28 ? 0 : night <= 30 ? 1 : 2, trees: p.trees ? 0 : i >= 3 ? 2 : i >= 2 ? 1 : 0 };
      out.push({ D: D, demand: demand, cap: cap, cut: cut, dry: dry, night: night, s: s });
    });
    return out;
  }
  // what matters most is people: a clinic that fails counts double; tree health is shown, but not scored
  var score = function (r) { return r.reduce(function (a, d) { return a + d.s.power + d.s.water + 2 * d.s.clinic + d.s.nights; }, 0); };
  function line(d) {
    var o = [];
    if (d.cut) o.push("Demand outruns supply: about " + d.cut + " hour" + (d.cut > 1 ? "s" : "") + " without power.");
    else o.push("Demand stays below what the grid can carry.");
    if (d.cut && !P.backup) o.push(d.dry ? "Pumps stop and the stored water runs out: taps run dry for " + d.dry + " hour" + (d.dry > 1 ? "s" : "") + "." : "Pumps stop, but stored water keeps the taps running.");
    if (d.cut && P.backup) o.push("Back-up power keeps the clinic cool and the pumps running.");
    if (d.cut > 6) o.push("Phone signals weaken as masts lose power.");
    if (d.s.clinic === 2) o.push("The clinic fills with heat illness, and its own rooms are hot.");
    else if (d.s.clinic === 1) o.push("The clinic is busy" + (P.warn ? ", but staffed and stocked for it." : "."));
    if (d.s.nights === 2) o.push("The night stays above " + Math.round(d.night) + " °C: few people sleep.");
    if (d.s.trees === 2) o.push("Unwatered street trees wilt; some will not recover.");
    return o.join(" ");
  }

  // ---- the drawn city ----
  var svg = $("[data-cy-svg]");
  function draw(d) {
    var s = d ? d.s : { power: 0, water: 0, clinic: 0, nights: 0, trees: 0 }, T = d ? d.D.day : 34, cut = d && d.cut;
    var sun = d ? 22 + (T - 38) * 3 : 20, lit = cut ? "#39424D" : "#F5A623", tree = s.trees === 2 ? "#B08A3E" : s.trees === 1 ? "#7FA06A" : "#1F7A70";
    var C = function (k) { return ["#1F7A70", "#C98A12", "#D7263D"][s[k]]; };
    var homes = "", x;
    for (x = 0; x < 4; x++) homes += '<g transform="translate(' + (300 + x * 62) + ' 250)"><path d="M0 30 L26 8 L52 30" stroke="' + (P.roofs ? "#FFFFFF" : "#B8401A") + '" stroke-width="' + (P.roofs ? 7 : 4) + '" fill="none"/><rect x="4" y="30" width="44" height="50" fill="#FAF7F2" stroke="#16202B" stroke-width="3"/><rect x="16" y="44" width="18" height="16" fill="' + lit + '"/></g>';
    var trees = ""; [70, 560, 640].forEach(function (tx) { trees += '<g><path d="M' + tx + ' 330 V292" stroke="#16202B" stroke-width="4"/><circle cx="' + tx + '" cy="276" r="26" fill="' + tree + '"/></g>'; });
    svg.innerHTML = '<rect width="720" height="380" fill="' + (d ? "#FFF2E3" : "#FAF7F2") + '"/>' +
      '<circle cx="640" cy="60" r="' + sun + '" fill="#F5A623" opacity="' + (d ? .95 : .6) + '"/>' +
      '<path d="M20 330 H700" stroke="#16202B" stroke-width="2" opacity=".35"/>' +
      // power station and the line to the substation
      '<g stroke="#16202B" stroke-width="3" fill="#FAF7F2"><rect x="30" y="200" width="80" height="130"/><path d="M48 200 V150 h18 V200 M78 200 V164 h16 V200"/></g>' +
      '<path d="M110 230 L180 230" stroke="' + C("power") + '" stroke-width="4" stroke-dasharray="' + (cut ? "6 6" : "none") + '"/>' +
      '<g transform="translate(180 230)"><rect x="0" y="0" width="56" height="100" fill="#FAF7F2" stroke="#16202B" stroke-width="3"/><path d="M28 16 l-10 22 h14 l-10 22" stroke="' + C("power") + '" stroke-width="5" fill="none"/>' + (cut ? '<text x="-4" y="-12" fill="#D7263D" font-size="16" font-weight="800">TRIPPED</text>' : "") + '</g>' +
      // water tower and pump
      '<g transform="translate(250 150)"><path d="M10 180 L22 60 M50 180 L38 60" stroke="#16202B" stroke-width="3"/><rect x="0" y="20" width="60" height="44" rx="6" fill="' + (s.water === 2 ? "#F6E7D7" : "#9ec9e8") + '" stroke="#16202B" stroke-width="3"/><text x="30" y="14" text-anchor="middle" font-size="14" font-weight="700" fill="' + C("water") + '">WATER</text></g>' +
      homes +
      // clinic
      '<g transform="translate(560 190)"><rect x="0" y="0" width="120" height="140" fill="#fff" stroke="#16202B" stroke-width="3"/><path d="M60 22 v34 M43 39 h34" stroke="' + C("clinic") + '" stroke-width="9"/><rect x="40" y="90" width="40" height="50" fill="' + (cut && !P.backup ? "#39424D" : "#F6E7D7") + '" stroke="#16202B" stroke-width="3"/>' + (P.backup ? '<rect x="94" y="-14" width="22" height="14" fill="#1F7A70"/>' : "") + "</g>" +
      trees +
      '<g font-size="15" font-weight="700" fill="#16202B"><text x="30" y="352">Power</text><text x="180" y="352">Substation</text><text x="250" y="352">Water</text><text x="370" y="352">Homes</text><text x="580" y="352">Clinic</text></g>';
  }

  function board(res, upto) {
    $("[data-cy-board]").innerHTML = '<table class="lv-tab"><caption class="visually-hidden">How each system held, day by day</caption><thead><tr><th scope="col">Day</th>' + Y.systems.map(function (s) { return '<th scope="col">' + esc(s.name) + "</th>"; }).join("") + '<th scope="col">What happened</th></tr></thead><tbody>' +
      res.slice(0, upto).map(function (d) { return "<tr><th scope=\"row\">" + esc(d.D.d) + "<small>" + d.D.day + " °C by day</small></th>" + Y.systems.map(function (s) { var v = d.s[s.id]; return '<td><span class="lv-chip lv-chip--' + CLS[v] + '">' + WORD[v] + "</span></td>"; }).join("") + "<td>" + esc(line(d)) + "</td></tr>"; }).join("") + "</tbody></table>";
  }
  function end(res) {
    var tot = res.reduce(function (a, d) { return a + d.cut; }, 0), dry = res.reduce(function (a, d) { return a + d.dry; }, 0);
    var base = score(res), best = null;
    Y.protect.forEach(function (x) { if (P[x.id]) return; var q = Object.assign({}, P); q[x.id] = true; var gain = base - score(run(q)); if (!best || gain > best.gain) best = { x: x, gain: gain }; });
    var lit = [];
    if (tot && dry) lit.push("energywater"); if (res.some(function (d) { return d.demand > 95; })) lit.push("cooling");
    if (res.some(function (d) { return d.s.clinic === 2; })) lit.push("clinic"); if (res.some(function (d) { return d.s.trees === 2; })) lit.push("deadgreen"); if (res.some(function (d) { return d.s.nights === 2; })) lit.push("sleep");
    var e = $("[data-cy-end]"); e.hidden = false;
    e.innerHTML = '<h2 class="lv-h">After five days</h2><ul class="lv-sum"><li><b>' + tot + "</b><span>hours without power</span></li><li><b>" + dry + "</b><span>hours of dry taps</span></li><li><b>" + res.filter(function (d) { return d.s.clinic === 2; }).length + "</b><span>days the clinic was overwhelmed</span></li><li><b>" + res.filter(function (d) { return d.s.nights === 2; }).length + "</b><span>nights too hot to sleep</span></li></ul>" +
      (best && best.gain > 0 ? '<p class="lv-out lv-out--green"><b>The one change that would have helped most:</b> ' + esc(best.x.name.toLowerCase()) + ". " + esc(best.x.text) + ' <a href="/actions/#' + best.x.lever + '">How it works</a></p>' : '<p class="lv-out lv-out--green"><b>This city held.</b> Every system bent, but none broke for long.</p>') +
      (lit.length ? '<p class="hub-p">The cycles that switched on: ' + lit.map(function (id) { var l = Y.loops.filter(function (x) { return x.id === id; })[0]; return '<a href="/loops/#' + id + '">' + esc(l ? l.name : id) + "</a>"; }).join(", ") + ".</p>" : "") +
      '<p class="hub-p">None of these is a wage problem. Each is held up by a utility, a city department, a hospital or a regulator, and most can be paid for before the heat arrives: <a href="/who-holds-it/">who holds it up</a> and <a href="/paying-when-heat-strikes/">paying when heat strikes</a>.</p>' +
      '<p class="lv-ctrl"><button type="button" class="lv-next" data-cy-again>Change what is in place, and run it again</button> <a class="lv-back" href="/a-night-in-the-heat/">A night in the heat</a></p>';
    e.querySelector("[data-cy-again]").addEventListener("click", function () { root.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); });
  }
  function play() {
    clearTimeout(timer); $("[data-cy-end]").hidden = true;
    var res = run(P), i = 0;
    var tick = function () {
      i++; draw(res[i - 1]); board(res, i);
      $("[data-cy-day]").textContent = res[i - 1].D.d + ": " + res[i - 1].D.day + " °C by day, " + res[i - 1].D.night + " °C at night";
      if (i < res.length) timer = setTimeout(tick, reduce ? 0 : 1200); else end(res);
    };
    tick();
  }
  $$("[data-pr]").forEach(function (c) { c.addEventListener("change", function () { P[c.dataset.pr] = c.checked; draw(null); }); });
  $("[data-cy-run]").addEventListener("click", play);
  $("[data-cy-reset]").addEventListener("click", function () { clearTimeout(timer); P = {}; $$("[data-pr]").forEach(function (c) { c.checked = false; }); $("[data-cy-board]").innerHTML = ""; $("[data-cy-end]").hidden = true; $("[data-cy-day]").textContent = "Before the heatwave"; draw(null); });
  draw(null);
})();
