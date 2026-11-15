// Common Shade: city heat core. Pure functions shared by the city pages (city-heat/city-heat.js), the homepage
// (script.js keeps a one-line copy of wbgt(), which tools/check-city-heat.js compares with this file) and the check.
// The heat-stress estimate is the Australian Bureau of Meteorology's approximation to the wet-bulb globe temperature
// (WBGT) from air temperature and humidity: an estimate for the city as a whole, not a measurement or a warning.
(function (root, make) { if (typeof module === "object" && module.exports) module.exports = make(); else root.CSHeat = make(); })(this, function () {
  "use strict";
  // water vapour pressure in hPa, from air temperature (°C) and relative humidity (%)
  function vapour(t, rh) { return rh / 100 * 6.105 * Math.exp(17.27 * t / (237.7 + t)); }
  // estimated WBGT in °C
  function wbgt(t, rh) { return 0.567 * t + 0.393 * vapour(t, rh) + 3.94; }
  // heat index from temperature and humidity: the US National Weather Service formula, in °C (as script.js)
  function heatIndex(tc, rh) {
    var T = tc * 9 / 5 + 32, hi = 0.5 * (T + 61 + (T - 68) * 1.2 + rh * 0.094);
    if ((hi + T) / 2 >= 80) {
      hi = -42.379 + 2.04901523 * T + 10.14333127 * rh - .22475541 * T * rh - .00683783 * T * T - .05481717 * rh * rh + .00122874 * T * T * rh + .00085282 * T * rh * rh - .00000199 * T * T * rh * rh;
      if (rh < 13 && T >= 80 && T <= 112) hi -= ((13 - rh) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
      else if (rh > 85 && T >= 80 && T <= 87) hi += ((rh - 85) / 10) * ((87 - T) / 5);
    }
    return (hi - 32) * 5 / 9;
  }
  // the highest estimated WBGT in each local day, from Open-Meteo's hourly arrays (times are local "YYYY-MM-DDTHH:MM"
  // when timezone=auto). Days before `from` (a "YYYY-MM-DD" date) are skipped; at most n days are returned.
  function peaks(hourly, from, n) {
    var out = [], by = {}, t = hourly && hourly.time || [];
    for (var i = 0; i < t.length; i++) {
      var T = hourly.temperature_2m[i], H = hourly.relative_humidity_2m[i], d = String(t[i]).slice(0, 10);
      if (T == null || H == null || !isFinite(T) || !isFinite(H) || (from && d < from)) continue;
      var w = wbgt(T, H);
      if (!by[d]) { by[d] = { date: d, wbgt: w, t: T, rh: H, hour: String(t[i]).slice(11, 16), tmax: T }; out.push(by[d]); }
      else { if (w > by[d].wbgt) { by[d].wbgt = w; by[d].t = T; by[d].rh = H; by[d].hour = String(t[i]).slice(11, 16); } if (T > by[d].tmax) by[d].tmax = T; }
    }
    return out.slice(0, n || out.length);
  }
  // which of a set of published bands ([[from, name], ...], lowest first) a value falls in; -1 below the first
  function band(levels, v) { var i = -1; (levels || []).forEach(function (l, k) { if (v >= l[0]) i = k; }); return i; }
  return { vapour: vapour, wbgt: wbgt, heatIndex: heatIndex, peaks: peaks, band: band };
});
