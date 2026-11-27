// Common Shade: the logic behind /heat-futures/, shared by the build (tools/build-heat-futures.js), the page
// (heat-futures/hf.js) and the check (tools/check-heat-futures.js). Two things kept strictly apart:
//   CLIMATE (projected): values read from data/site/heat-futures.json, never changed by protection settings
//   PROTECTION (illustrative): a transparent coverage model, never changed by the climate scenario
// The protection model, for ONE programme and ONE defined group (100% = everyone in the group; one person counts once):
//   reach starts after the start year plus the lead time, grows by `pace` percentage points a year, up to `ceil`
//   nominal(y)  = min(ceil, pace x (y - start - lead + 1)), and 0 before start + lead
//   usable(y)   = nominal(y) x reliability x usability   (reliability: share of hot periods it works; usability: share
//                 of those reached who can actually use it)
//   gap years   = sum over 2026-2050 of (1 - usable(y)): average years, per person in the group, without usable protection
// Coverage only: it says nothing about illness, deaths or costs.
(function (root) {
  "use strict";
  var Y0 = 2026, Y1 = 2050;
  var LIM = { start: [2026, 2045], lead: [0, 6], pace: [1, 25], ceil: [10, 100], rel: [0, 100], use: [0, 100] };
  var PATHWAYS = {
    reactive: { name: "Reactive response", start: 2032, lead: 3, pace: 3, ceil: 45, rel: 60, use: 50, about: "Protection expands slowly; action concentrates on emergencies; access stays uneven." },
    uneven: { name: "Expanding but uneven protection", start: 2028, lead: 2, pace: 5, ceil: 70, rel: 75, use: 65, about: "Some services, buildings and workplaces improve, but coverage and reliability differ." },
    early: { name: "Earlier, broader protection", start: 2026, lead: 1, pace: 8, ceil: 90, rel: 90, use: 85, about: "Preparedness, worker protection, housing and service continuity expand earlier, with attention to people usually left out." }
  };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  function nominal(p, y) { var s = p.start + p.lead; return y < s ? 0 : Math.min(p.ceil, p.pace * (y - s + 1)); }
  function usable(p, y) { return nominal(p, y) * (p.rel / 100) * (p.use / 100); }
  function series(p) { var out = []; for (var y = Y0; y <= Y1; y++) out.push({ y: y, nominal: nominal(p, y), usable: usable(p, y) }); return out; }
  function gapYears(p) { var g = 0; for (var y = Y0; y <= Y1; y++) g += 1 - usable(p, y) / 100; return g; }
  function delay(p, start2) {
    var q = Object.assign({}, p, { start: start2 }), target = nominal(p, Y1), years = Y1 - (start2 + p.lead) + 1;
    return { later: q, extraGapYears: gapYears(q) - gapYears(p), reach2050: { earlier: nominal(p, Y1), later: nominal(q, Y1) },
      paceNeeded: years > 0 ? target / years : null, paceNow: p.pace };
  }
  function range(p, d) { d = d == null ? 15 : d; return { low: Object.assign({}, p, { rel: clamp(p.rel - d, 0, 100), use: clamp(p.use - d, 0, 100) }), high: Object.assign({}, p, { rel: clamp(p.rel + d, 0, 100), use: clamp(p.use + d, 0, 100) }) }; }
  function valid(p) { for (var k in LIM) { var v = p[k]; if (typeof v !== "number" || !isFinite(v) || v !== Math.round(v) || v < LIM[k][0] || v > LIM[k][1]) return false; } return true; }

  // the address: only known names and whole numbers inside their ranges survive; anything else falls back to defaults
  var ENUM = { city: ["mumbai", "delhi", "dhaka", "jakarta", "bangkok", "manila"], ind: ["hd35", "tr26", "txx"], sc: ["ssp126", "ssp245", "ssp370"], per: ["2020-2039", "2040-2059"], path: ["reactive", "uneven", "early"] };
  var DEF = { city: "delhi", ind: "hd35", sc: "ssp245", per: "2040-2059", path: "uneven" };
  function fromQuery(q) {
    var s = Object.assign({}, DEF), bad = [];
    for (var k in ENUM) if (q.has(k)) { if (ENUM[k].indexOf(q.get(k)) >= 0) s[k] = q.get(k); else bad.push(k); }
    var p = Object.assign({}, PATHWAYS[s.path]); delete p.name; delete p.about;
    for (var k2 in LIM) if (q.has(k2)) { var v = q.get(k2); if (/^\d{1,4}$/.test(v) && +v >= LIM[k2][0] && +v <= LIM[k2][1]) p[k2] = +v; else bad.push(k2); }
    var s2 = q.get("later"); var later = s2 && /^\d{4}$/.test(s2) && +s2 >= LIM.start[0] && +s2 <= LIM.start[1] ? +s2 : null; if (s2 && later == null) bad.push("later");
    return { sel: s, prot: p, later: later, bad: bad, restored: Array.from ? Array.from(q.keys()).length > 0 : false };
  }
  function toQuery(sel, p, later) {
    var a = []; for (var k in DEF) a.push(k + "=" + encodeURIComponent(sel[k]));
    for (var k2 in LIM) a.push(k2 + "=" + p[k2]); if (later) a.push("later=" + later); return a.join("&");
  }

  // ---- charts, as SVG strings (the build draws the default; the page redraws) ----
  var esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); };
  var IND = {
    hd35: { name: "Hot days", unit: "days a year", def: "Days a year with a daily maximum temperature of 35 °C or more (the dataset's file says “35 degC and higher”)", kind: "A fixed meteorological threshold, not a health limit", lo: 0, hi: 200, step: 50, dp: 0 },
    tr26: { name: "Hot nights", unit: "nights a year", def: "Nights a year with a daily minimum temperature above 26 °C", kind: "A fixed meteorological threshold, not a health limit", lo: 0, hi: 360, step: 60, dp: 0 },
    txx: { name: "Hottest day of the year", unit: "°C", def: "The highest daily maximum temperature in a year, averaged over the 20-year period", kind: "A statistic of the hottest day, not a forecast for any year", lo: 30, hi: 50, step: 5, dp: 1 }
  };
  var SCN = { ssp126: { name: "Lower emissions", tech: "SSP1-2.6", mark: "circle" }, ssp245: { name: "Intermediate emissions", tech: "SSP2-4.5", mark: "square" }, ssp370: { name: "Higher emissions", tech: "SSP3-7.0", mark: "triangle" } };
  var PER = { "2020-2039": "Around 2030: average for 2020–2039", "2040-2059": "Around 2050: average for 2040–2059" };
  function shape(m, x, y, cls) {
    if (m === "square") return '<rect class="' + cls + '" x="' + (x - 5) + '" y="' + (y - 5) + '" width="10" height="10"/>';
    if (m === "triangle") return '<path class="' + cls + '" d="M' + x + " " + (y - 6.5) + "L" + (x + 6) + " " + (y + 4.5) + "L" + (x - 6) + " " + (y + 4.5) + 'Z"/>';
    return '<circle class="' + cls + '" cx="' + x + '" cy="' + y + '" r="5.5"/>';
  }
  function climateSvg(D, city, ind, sc, per, opts) {
    opts = opts || {};
    var I = IND[ind], V = D.cities[city].values[ind], nar = opts.w && opts.w < 520, W = nar ? 360 : 640, H = nar ? 300 : 340, x0 = nar ? 40 : 60, x1 = W - (nar ? 8 : 16), y0 = 34, y1 = nar ? 246 : 280;
    var y = function (v) { return y1 - (Math.max(I.lo, Math.min(I.hi, v)) - I.lo) / (I.hi - I.lo) * (y1 - y0); };
    var groups = [["Model reference", "1995–2014", [["historical", "1995-2014"]]], ["Around 2030", "2020–2039", ["ssp126", "ssp245", "ssp370"].map(function (s) { return [s, "2020-2039"]; })], ["Around 2050", "2040–2059", ["ssp126", "ssp245", "ssp370"].map(function (s) { return [s, "2040-2059"]; })]];
    var gw = (x1 - x0) / 3, o = [];
    o.push('<svg xmlns="http://www.w3.org/2000/svg" class="hf-svg" viewBox="0 0 ' + W + " " + H + '" role="img" aria-labelledby="hf-c-t hf-c-d">');
    o.push('<title id="hf-c-t">' + esc(I.name + ", " + D.cities[city].name + " grid cell: projected") + "</title>");
    var r = V.historical["1995-2014"], s = V[sc][per];
    o.push('<desc id="hf-c-d">' + esc("Model reference 1995–2014 median " + r.median + " " + I.unit + ". " + PER[per] + ", " + SCN[sc].name + " (" + SCN[sc].tech + "): median " + s.median + ", models' 10th to 90th percentile " + s.p10 + " to " + s.p90 + ". A table below gives every value.") + "</desc>");
    o.push('<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="#fff"/>');
    o.push('<text x="' + x0 + '" y="18" class="hf-lab">PROJECTED · ' + esc(I.name) + " (" + esc(I.unit) + ")</text>");
    for (var t = I.lo; t <= I.hi + 1e-9; t += I.step) o.push('<line class="hf-grid" x1="' + x0 + '" x2="' + x1 + '" y1="' + y(t) + '" y2="' + y(t) + '"/><text class="hf-tick" x="' + (x0 - 8) + '" y="' + (y(t) + 4) + '" text-anchor="end">' + t + "</text>");
    groups.forEach(function (g, gi) {
      var gx = x0 + gw * gi, n = g[2].length;
      if (gi) o.push('<line class="hf-sep" x1="' + gx + '" x2="' + gx + '" y1="' + y0 + '" y2="' + y1 + '"/>');
      o.push('<text class="hf-gl" x="' + (gx + gw / 2) + '" y="' + (y1 + 20) + '" text-anchor="middle">' + esc(nar && gi === 0 ? "Reference" : g[0]) + '</text><text class="hf-tick" x="' + (gx + gw / 2) + '" y="' + (y1 + 36) + '" text-anchor="middle">' + esc(g[1]) + "</text>");
      if (gi && g[2][0][1] === per) o.push('<rect class="hf-per" x="' + (gx + 4) + '" y="' + (y0 - 4) + '" width="' + (gw - 8) + '" height="' + (y1 - y0 + 8) + '"/>');
      g[2].forEach(function (k, ki) {
        var v = V[k[0]][k[1]], cx = Math.round(gx + gw * (ki + 1) / (n + 1)), on = k[0] === "historical" || (k[0] === sc), m = k[0] === "historical" ? "diamond" : SCN[k[0]].mark;
        var cls = on ? "hf-on" : "hf-off";
        o.push('<g class="' + cls + '"><line class="hf-wh" x1="' + cx + '" x2="' + cx + '" y1="' + y(v.p10) + '" y2="' + y(v.p90) + '"/><line class="hf-wh" x1="' + (cx - 6) + '" x2="' + (cx + 6) + '" y1="' + y(v.p10) + '" y2="' + y(v.p10) + '"/><line class="hf-wh" x1="' + (cx - 6) + '" x2="' + (cx + 6) + '" y1="' + y(v.p90) + '" y2="' + y(v.p90) + '"/>');
        o.push(m === "diamond" ? '<path class="hf-mk" d="M' + cx + " " + (y(v.median) - 7) + "L" + (cx + 7) + " " + y(v.median) + "L" + cx + " " + (y(v.median) + 7) + "L" + (cx - 7) + " " + y(v.median) + 'Z"/>' : shape(m, cx, y(v.median), "hf-mk"));
        if (on) o.push('<text class="hf-val" x="' + (cx + (nar ? 8 : 10)) + '" y="' + (y(v.median) + 4) + '">' + (I.dp ? v.median.toFixed(1) : Math.round(v.median)) + "</text>");
        o.push("</g>");
      });
    });
    if (!nar) o.push('<text class="hf-foot" x="' + x0 + '" y="' + (H - 6) + '">' + esc("Marker: models' median. Whiskers: 10th to 90th percentile of the models. Grid cell nearest " + D.cities[city].name + " (0.25°). " + (I.lo ? "Axis starts at " + I.lo + " °C." : "")) + "</text>");
    o.push("</svg>");
    return o.join("");
  }
  function protectionSvg(p, later, opts) {
    opts = opts || {}; var nar = opts.w && opts.w < 520;
    var W = nar ? 360 : 640, H = nar ? 330 : 300, x0 = nar ? 40 : 52, x1 = W - (nar ? 10 : 16), y0 = 34, y1 = nar ? 240 : 250, X = function (yr) { return x0 + (yr - Y0) / (Y1 - Y0) * (x1 - x0); }, Yv = function (v) { return y1 - v / 100 * (y1 - y0); };
    var line = function (q, k) { return series(q).map(function (d, i) { return (i ? "L" : "M") + X(d.y).toFixed(1) + " " + Yv(d[k]).toFixed(1); }).join(""); };
    var R = range(p), band = series(R.high).map(function (d) { return X(d.y).toFixed(1) + " " + Yv(d.usable).toFixed(1); }).concat(series(R.low).reverse().map(function (d) { return X(d.y).toFixed(1) + " " + Yv(d.usable).toFixed(1); }));
    var o = ['<svg xmlns="http://www.w3.org/2000/svg" class="hf-svg" viewBox="0 0 ' + W + " " + H + '" role="img" aria-labelledby="hf-p-t hf-p-d"><title id="hf-p-t">Illustrative protection coverage, 2026 to 2050</title>'];
    var u50 = usable(p, Y1);
    o.push('<desc id="hf-p-d">' + esc("Illustrative: usable protection reaches " + Math.round(u50) + "% of the defined group by 2050 under these assumptions (nominal reach " + Math.round(nominal(p, Y1)) + "%)." + (later ? " Starting in " + later + " instead, usable protection reaches " + Math.round(usable(Object.assign({}, p, { start: later }), Y1)) + "% by 2050." : "") + " A table below gives the values year by year.") + "</desc>");
    o.push('<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="#fff"/><text x="' + x0 + '" y="18" class="hf-lab">ILLUSTRATIVE · share of the defined group (%)</text>');
    [0, 25, 50, 75, 100].forEach(function (v) { o.push('<line class="hf-grid" x1="' + x0 + '" x2="' + x1 + '" y1="' + Yv(v) + '" y2="' + Yv(v) + '"/><text class="hf-tick" x="' + (x0 - 8) + '" y="' + (Yv(v) + 4) + '" text-anchor="end">' + v + "%</text>"); });
    (nar ? [2026, 2035, 2050] : [2026, 2030, 2035, 2040, 2045, 2050]).forEach(function (yr) { o.push('<text class="hf-tick" x="' + X(yr) + '" y="' + (y1 + 18) + '" text-anchor="middle">' + yr + "</text>"); });
    o.push('<path class="hf-band" d="M' + band.join("L") + 'Z"/>');
    o.push('<path class="hf-nom" d="' + line(p, "nominal") + '"/><path class="hf-use" d="' + line(p, "usable") + '"/>');
    if (later) o.push('<path class="hf-late" d="' + line(Object.assign({}, p, { start: later }), "usable") + '"/>');
    var ly = H - 10;
    if (nar) { o.push('<g class="hf-key"><path class="hf-nom" d="M' + x0 + " " + (ly - 40) + 'h22"/><text x="' + (x0 + 28) + '" y="' + (ly - 36) + '">Nominal reach</text><path class="hf-use" d="M' + (x0 + 160) + " " + (ly - 40) + 'h22"/><text x="' + (x0 + 188) + '" y="' + (ly - 36) + '">Usable protection</text><rect class="hf-band" x="' + x0 + '" y="' + (ly - 14) + '" width="22" height="10"/><text x="' + (x0 + 28) + '" y="' + (ly - 4) + '">Assumption range</text>' + (later ? '<path class="hf-late" d="M' + (x0 + 160) + " " + (ly - 8) + 'h22"/><text x="' + (x0 + 188) + '" y="' + (ly - 4) + '">Starts ' + later + "</text>" : "") + "</g></svg>"); return o.join(""); }
    o.push('<g class="hf-key"><path class="hf-nom" d="M' + x0 + " " + (ly - 4) + "h22" + '"/><text x="' + (x0 + 28) + '" y="' + ly + '">Nominal reach</text><path class="hf-use" d="M' + (x0 + 140) + " " + (ly - 4) + "h22" + '"/><text x="' + (x0 + 168) + '" y="' + ly + '">Usable protection</text><rect class="hf-band" x="' + (x0 + 300) + '" y="' + (ly - 10) + '" width="22" height="10"/><text x="' + (x0 + 328) + '" y="' + ly + '">Assumption range</text>' + (later ? '<path class="hf-late" d="M' + (x0 + 450) + " " + (ly - 4) + 'h22"/><text x="' + (x0 + 478) + '" y="' + ly + '">Starts ' + later + "</text>" : "") + "</g></svg>");
    return o.join("");
  }
  function interpret(D, city, ind, sc, per) {
    var I = IND[ind], V = D.cities[city].values[ind], r = V.historical["1995-2014"], s = V[sc][per], f = function (v) { return I.dp ? v.toFixed(1) : String(Math.round(v)); };
    var u = I.unit === "°C" ? " °C" : " " + I.unit;
    var lines = ["In the 0.25° grid cell nearest " + D.cities[city].name + ", the models' median for " + I.name.toLowerCase() + " is " + f(r.median) + u + " in the 1995–2014 model reference and " + f(s.median) + u + " " + PER[per].replace(/^Around/, "around").replace(":", ",") + ", under " + SCN[sc].name.toLowerCase() + " (" + SCN[sc].tech + "). The middle 80% of models fall between " + f(s.p10) + " and " + f(s.p90) + u + "."];
    var all = ["ssp126", "ssp245", "ssp370"].map(function (k) { return V[k][per]; });
    var overlap = all.every(function (a) { return all.every(function (b) { return a.p10 <= b.p90 && b.p10 <= a.p90; }); });
    lines.push(overlap ? "In this period the three scenarios' model ranges overlap: differences between models and natural variability matter as much here as the emissions path." : "In this period the scenarios' model ranges begin to separate: the emissions path shows more clearly.");
    if (ind !== "txx" && s.median - r.median >= 30) lines.push("That is roughly " + Math.round((s.median - r.median) / 30) + " more month" + (Math.round((s.median - r.median) / 30) > 1 ? "s" : "") + " a year of such " + (ind === "hd35" ? "days" : "nights") + " than in the reference, as a 20-year average, not a forecast for any one year.");
    return lines;
  }
  var api = { Y0: Y0, Y1: Y1, LIM: LIM, PATHWAYS: PATHWAYS, DEF: DEF, ENUM: ENUM, IND: IND, SCN: SCN, PER: PER, nominal: nominal, usable: usable, series: series, gapYears: gapYears, delay: delay, range: range, valid: valid, fromQuery: fromQuery, toQuery: toQuery, climateSvg: climateSvg, protectionSvg: protectionSvg, interpret: interpret };
  if (typeof module === "object" && module.exports) module.exports = api; else root.HFCORE = api;
})(this);
