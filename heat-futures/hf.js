// Common Shade: /heat-futures/ page script (tools/build-heat-futures.js). Redraws the climate panel from the projected
// values and the protection panel from its assumptions; neither ever reads the other's settings.
(function () {
  "use strict";
  var F = window.HFCORE, C = window.HF; if (!F || !C) return;
  var D = { cities: C };
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var q = F.fromQuery(new URLSearchParams(location.search));
  var sel = q.sel, P = q.prot, later = q.later || 2035;
  var esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); };
  var geo = function (c) { var r = C[c]; return "the 0.25° grid cell centred at " + Math.abs(r.cell.lat) + "°" + (r.cell.lat < 0 ? "S" : "N") + ", " + r.cell.lon + "°E, " + r.cell.km_from_centre + " km from the city centre point"; };

  function climate() {
    $("[data-hf-chart]").innerHTML = F.climateSvg(D, sel.city, sel.ind, sel.sc, sel.per, { w: $("[data-hf-chart]").clientWidth });
    $("[data-hf-def]").textContent = F.IND[sel.ind].def + ". " + F.IND[sel.ind].kind + ".";
    $("[data-hf-geo]").textContent = geo(sel.city);
    $("[data-hf-say]").innerHTML = F.interpret(D, sel.city, sel.ind, sel.sc, sel.per).map(function (s) { return "<p>" + esc(s) + "</p>"; }).join("");
  }
  function protection() {
    $("[data-hf-pchart]").innerHTML = F.protectionSvg(P, later !== P.start ? later : null, { w: $("[data-hf-pchart]").clientWidth });
    $$("[data-p]").forEach(function (i) { var k = i.getAttribute("data-p"); i.value = P[k]; $('[data-o="' + k + '"]').textContent = P[k] + ({ lead: " years", pace: " points a year", ceil: "%", rel: "%", use: "%" }[k] || ""); });
    $('[data-n="u35"]').textContent = Math.round(F.usable(P, 2035)) + "%";
    $('[data-n="u50"]').textContent = Math.round(F.usable(P, 2050)) + "%";
    $('[data-n="gap"]').textContent = F.gapYears(P).toFixed(1) + " of 25";
    $("#hf-later").value = later; $('[data-o="later"]').textContent = later;
    var d = F.delay(P, later), txt;
    if (later === P.start) txt = "Choose a different start year to compare.";
    else if (later < P.start) txt = "Starting in " + later + " instead of " + P.start + ", with the same lead time, pace, ceiling, reliability and usability, the defined group would spend about " + Math.abs(d.extraGapYears).toFixed(1) + " fewer years each, on average, without usable protection by 2050. Nominal reach by 2050: " + Math.round(d.reach2050.later) + "% with the earlier start, " + Math.round(d.reach2050.earlier) + "% with " + P.start + ".";
    else txt = "Starting in " + later + " instead of " + P.start + ", with the same lead time, pace, ceiling, reliability and usability, the defined group would spend about " + d.extraGapYears.toFixed(1) + " more years each, on average, without usable protection by 2050 (a coverage gap, not a measure of exposure, illness or deaths). Nominal reach by 2050: " + Math.round(d.reach2050.earlier) + "% with the earlier start, " + Math.round(d.reach2050.later) + "% with the later one." +
      (d.paceNeeded ? (d.paceNeeded > F.LIM.pace[1] ? " Reaching " + Math.round(d.reach2050.earlier) + "% by 2050 from that start would need more than " + F.LIM.pace[1] + " points a year." : " To reach " + Math.round(d.reach2050.earlier) + "% by 2050 anyway, the later programme would need to add about " + d.paceNeeded.toFixed(1) + " points a year instead of " + P.pace + ": more delivery capacity, not a catch-up that happens by itself.") : " Starting then, with this lead time, nobody would be reached by 2050.");
    $("[data-hf-delay]").innerHTML = "<p>" + esc(txt) + "</p>";
    var rows = F.series(P).map(function (r) { var l = F.usable(Object.assign({}, P, { start: later }), r.y); return "<tr><th scope=\"row\">" + r.y + "</th><td>" + r.nominal.toFixed(0) + "%</td><td>" + r.usable.toFixed(1) + "%</td><td>" + l.toFixed(1) + "%</td></tr>"; }).join("");
    $("[data-hf-ptable]").innerHTML = "<table class=\"hf-table\"><caption>Illustrative: share of the defined group</caption><thead><tr><th scope=\"col\">Year</th><th scope=\"col\">Nominal reach</th><th scope=\"col\">Usable protection</th><th scope=\"col\">Usable, starting " + later + "</th></tr></thead><tbody>" + rows + "</tbody></table>";
  }
  function printsel() {
    $("[data-hf-printsel]").textContent = C[sel.city].name + " (" + geo(sel.city) + ") · " + F.IND[sel.ind].name + " (" + F.IND[sel.ind].unit + ") · " + F.SCN[sel.sc].name + " " + F.SCN[sel.sc].tech + " · " + F.PER[sel.per] + " · Protection: " + F.PATHWAYS[sel.path].name + ", start " + P.start + ", lead " + P.lead + " years, pace " + P.pace + " points a year, ceiling " + P.ceil + "%, reliability " + P.rel + "%, ability to use " + P.use + "%.";
  }
  function setRadio(name, v) { var r = $('input[name="' + name + '"][value="' + v + '"]'); if (r) r.checked = true; }
  ["city", "ind", "sc", "per", "path"].forEach(function (k) { setRadio(k, sel[k]); });
  $("[data-hf-climate]").addEventListener("change", function (e) { if (!e.target.name) return; sel[e.target.name] = e.target.value; climate(); printsel(); });
  $("[data-hf-prot]").addEventListener("change", function (e) {
    if (e.target.name === "path") { sel.path = e.target.value; var p = F.PATHWAYS[sel.path]; ["start", "lead", "pace", "ceil", "rel", "use"].forEach(function (k) { P[k] = p[k]; }); protection(); printsel(); }
  });
  $$("[data-p]").forEach(function (i) { i.addEventListener("input", function () { P[i.getAttribute("data-p")] = +i.value; protection(); printsel(); }); });
  $("#hf-later").addEventListener("input", function () { later = +this.value; protection(); });

  if (q.restored) { var n = $("[data-hf-restored]"); n.hidden = false; n.textContent = "Restored from a shared link: the climate view and the illustrative protection assumptions below." + (q.bad.length ? " Some values in the link were not valid and were replaced with defaults (" + q.bad.join(", ") + ")." : ""); }
  climate(); protection(); printsel();
  var lastW = innerWidth; addEventListener("resize", function () { if ((lastW < 560) !== (innerWidth < 560)) { lastW = innerWidth; climate(); protection(); } });
  $("[data-hf-tools]").hidden = false;

  var say = document.createElement("p"); say.className = "visually-hidden"; say.setAttribute("role", "status"); document.body.appendChild(say);
  var lb = $("[data-hf-link]"), lbt = lb.textContent;
  lb.addEventListener("click", function () {
    var u = location.origin + location.pathname + "?" + F.toQuery(sel, P, later !== P.start ? later : null);
    var ok = function () { lb.textContent = "Link copied"; say.textContent = "Link to this view copied."; setTimeout(function () { lb.textContent = lbt; }, 2400); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(u).then(ok, function () { prompt("Copy this link:", u); }); else prompt("Copy this link:", u);
  });
  $("[data-hf-print]").addEventListener("click", function () { window.print(); });
  // the comparison image keeps both evidence labels, the selections, the source and a limits note
  $("[data-hf-png]").addEventListener("click", function () {
    var a = F.climateSvg(D, sel.city, sel.ind, sel.sc, sel.per), b = F.protectionSvg(P, later !== P.start ? later : null), W = 1320, H = 600;
    var css = ".hf-lab{font:700 13px sans-serif;fill:#16202B}.hf-tick,.hf-gl,.hf-foot,.hf-val,.hf-key text{font:12px sans-serif;fill:#39424D}.hf-gl{font-weight:700}.hf-grid{stroke:#E6DFD4}.hf-sep{stroke:#C9C2B6}.hf-per{fill:#F7F0E6}.hf-wh{stroke:#16202B;stroke-width:2}.hf-mk{fill:#F26430;stroke:#16202B;stroke-width:1.5}.hf-off{opacity:.35}.hf-band{fill:#F26430;fill-opacity:.15}.hf-nom{fill:none;stroke:#5E6570;stroke-width:2;stroke-dasharray:6 4}.hf-use{fill:none;stroke:#16202B;stroke-width:3}.hf-late{fill:none;stroke:#B8401A;stroke-width:3;stroke-dasharray:2 5}";
    var t = function (x, y, s, w) { return '<text x="' + x + '" y="' + y + '" style="font:' + (w || "13px") + ' sans-serif;fill:#16202B">' + esc(s) + "</text>"; };
    var lines = $("[data-hf-printsel]").textContent.match(/.{1,170}(\s|$)/g) || [];
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '"><style>' + css + '</style><rect width="100%" height="100%" fill="#FAF7F2"/>' +
      t(30, 36, "Common Shade · Heat futures: 2035–2050 · beattheheat.asia/heat-futures/", "700 18px") + lines.map(function (l, i) { return t(30, 62 + i * 18, l.trim()); }).join("") +
      '<g transform="translate(20 120)">' + a.replace("<svg", '<svg width="640" height="340"') + "</g>" + '<g transform="translate(670 120)">' + b.replace("<svg", '<svg width="640" height="300"') + "</g>" +
      t(30, 500, "Left: PROJECTED. World Bank CCKP, CMIP6 0.25° multi-model ensemble, one grid cell near the city; median and 10th to 90th percentile of models.", "700 13px") +
      t(30, 522, "Right: ILLUSTRATIVE. Editorial protection assumptions, not a prediction of any government's performance. Coverage only, not illness, deaths or costs.", "700 13px") +
      t(30, 544, "The two panels are independent: protection settings do not change the climate projection, and the climate scenario does not change protection.") +
      t(30, 566, "Limits: outdoor air over a 28 km cell, not indoor heat or a neighbourhood; 20-year averages, not forecasts for any year.") + "</svg>";
    var img = new Image(), url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    img.onload = function () {
      var c = document.createElement("canvas"); c.width = W; c.height = H; var x = c.getContext("2d"); x.drawImage(img, 0, 0); URL.revokeObjectURL(url);
      c.toBlob(function (bl) { var l = document.createElement("a"); l.href = URL.createObjectURL(bl); l.download = "common-shade-heat-futures-" + sel.city + "-" + sel.ind + "-" + sel.sc + "-" + sel.per + ".png"; document.body.appendChild(l); l.click(); l.parentNode.removeChild(l); say.textContent = "Comparison image downloaded."; });
    };
    img.onerror = function () { URL.revokeObjectURL(url); say.textContent = "The image could not be made in this browser; use Print instead."; };
    img.src = url;
  });
})();
