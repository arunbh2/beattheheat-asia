// Common Shade: the calculation behind /wet-bulb-wall/, kept apart from the page and the weather adapter.
// Psychrometric (thermodynamic) wet-bulb temperature from air temperature, relative humidity and pressure, using the
// equations of the ASHRAE Handbook, Fundamentals, chapter 1 (as implemented in PsychroLib, Meyer and Thevenard 2019):
//   saturation vapour pressure over liquid water, Hyland and Wexler (1983), ASHRAE eq. 6, valid 0 to 200 C
//   humidity ratio W = 0.621945 pw / (p - pw), ASHRAE eq. 20
//   wet-bulb temperature t* solving ASHRAE eq. 33 (above freezing):
//     W = ((2501 - 2.326 t*) Ws* - 1.006 (t - t*)) / (2501 + 1.86 t - 4.186 t*)
// by bisection to 0.001 C. Inputs: t in C, rh in % (0 to 100), p in Pa (default 101325, sea-level standard).
// Supported here: 0 to 60 C and 1 to 100% RH. Outside that, or for anything not a finite number, it returns null.
// Not WBGT, not heat index, not a body limit. tools/check-wet-bulb.js tests it against CoolProp reference values.
(function (root) {
  "use strict";
  var P0 = 101325, TMIN = 0, TMAX = 60, RHMIN = 1, RHMAX = 100;
  function pws(t) {                       // Pa, t in C, over liquid water
    var T = t + 273.15;
    return Math.exp(-5.8002206e3 / T + 1.3914993 - 4.8640239e-2 * T + 4.1764768e-5 * T * T - 1.4452093e-8 * T * T * T + 6.5459673 * Math.log(T));
  }
  function ratio(pw, p) { return 0.621945 * pw / (p - pw); }
  function valid(t, rh, p) {
    return typeof t === "number" && typeof rh === "number" && isFinite(t) && isFinite(rh) && t >= TMIN && t <= TMAX && rh >= RHMIN && rh <= RHMAX && isFinite(p) && p > 50000 && p < 110000;
  }
  function wetBulb(t, rh, p) {
    p = p == null ? P0 : p;
    if (!valid(t, rh, p)) return null;
    var W = ratio(rh / 100 * pws(t), p);
    if (rh >= 100) return t;
    var lo = -20, hi = t, mid = t;
    for (var i = 0; i < 60 && hi - lo > 1e-4; i++) {
      mid = (lo + hi) / 2;
      var ws = ratio(pws(mid), p);
      var w = ((2501 - 2.326 * mid) * ws - 1.006 * (t - mid)) / (2501 + 1.86 * t - 4.186 * mid);
      if (w > W) hi = mid; else lo = mid;    // w rises with t*: too wet means t* is too high
    }
    return Math.min(t, (lo + hi) / 2);
  }
  // relative humidity giving a wet-bulb temperature at air temperature t (for drawing contours); null if unreachable
  function rhFor(t, tw, p) {
    p = p == null ? P0 : p;
    if (tw > t + 1e-9) return null;
    var lo = RHMIN, hi = RHMAX;
    if (wetBulb(t, lo, p) > tw || wetBulb(t, hi, p) < tw) return null;
    for (var i = 0; i < 50; i++) { var m = (lo + hi) / 2; if (wetBulb(t, m, p) < tw) lo = m; else hi = m; }
    return (lo + hi) / 2;
  }
  // relative humidity from air temperature and water vapour pressure (Pa): for studies that report vapour pressure
  function rhFromPa(t, pa) { return 100 * pa / pws(t); }
  var cToF = function (c) { return c * 9 / 5 + 32; }, fToC = function (f) { return (f - 32) * 5 / 9; };
  var api = { wetBulb: wetBulb, rhFor: rhFor, rhFromPa: rhFromPa, pws: pws, cToF: cToF, fToC: fToC, P0: P0, RANGE: { tmin: TMIN, tmax: TMAX, rhmin: RHMIN, rhmax: RHMAX } };
  if (typeof module === "object" && module.exports) module.exports = api; else root.WBCORE = api;
})(this);
