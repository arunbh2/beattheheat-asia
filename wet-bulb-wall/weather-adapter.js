// Common Shade: the city weather behind /wet-bulb-wall/, kept apart from the calculation and the page.
// One request to Open-Meteo's forecast API for all six cities (current temperature_2m, relative_humidity_2m and
// surface_pressure), made when a reader opens the page, never per slider movement, and kept in the browser for 15
// minutes. Open-Meteo's "current" values are modelled (its weather models, updated every 15 minutes), not a station
// observation, and the page says so. Temperature and humidity always come from the same response, place and time.
//   url(cities)                 the request
//   parse(json, cities, now)    one record per city, or a record marked missing; never a zero for a missing value
//   freshness(rec, now)         "fresh" (valid time within an hour), "stale" (older), "missing"
//   merge(fresh, cached)        a failed or missing city keeps its last good record, with its own original time
// tools/check-wet-bulb.js tests these on synthetic records only.
(function (root) {
  "use strict";
  var FRESH_MS = 3600 * 1000;   // the provider updates every 15 minutes; older than an hour means the request did not succeed recently
  var ENDPOINT = "https://api.open-meteo.com/v1/forecast";
  function url(cities) {
    return ENDPOINT + "?latitude=" + cities.map(function (c) { return c.lat; }).join(",") + "&longitude=" + cities.map(function (c) { return c.lon; }).join(",") +
      "&current=temperature_2m,relative_humidity_2m,surface_pressure&timezone=auto";
  }
  function num(x) { return typeof x === "number" && isFinite(x) ? x : null; }
  // Open-Meteo gives local time without an offset ("2026-11-27T22:45") plus utc_offset_seconds; turn it into a real instant
  function instant(local, offset) {
    if (typeof local !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(local) || typeof offset !== "number") return null;
    var t = Date.parse(local + (local.length === 16 ? ":00" : "") + "Z");
    return isNaN(t) ? null : t - offset * 1000;
  }
  function parse(json, cities, now) {
    var list = Array.isArray(json) ? json : json ? [json] : [];
    return cities.map(function (c, i) {
      var j = list[i], cur = j && j.current, u = j && j.current_units;
      var base = { id: c.id, name: c.name, lat: c.lat, lon: c.lon, provider: "Open-Meteo", source: ENDPOINT, kind: "modelled", retrieved: now };
      if (!cur) return Object.assign(base, { status: "missing", reason: "no data for this city in the response" });
      var t = num(cur.temperature_2m), rh = num(cur.relative_humidity_2m), p = num(cur.surface_pressure);
      var at = instant(cur.time, j.utc_offset_seconds);
      var unitsOk = !u || ((u.temperature_2m || "°C") === "°C" && (u.relative_humidity_2m || "%") === "%");
      if (t == null || rh == null || at == null || !unitsOk || rh < 0 || rh > 100) return Object.assign(base, { status: "missing", reason: "temperature, humidity or time missing or not in °C and %" });
      return Object.assign(base, {
        status: "ok", t: t, rh: rh, pressure: p, pressureType: p == null ? null : "surface (station-level) pressure, hPa",
        validAt: at, localTime: cur.time, tz: j.timezone || "", tzAbbr: j.timezone_abbreviation || "", offset: j.utc_offset_seconds,
        gridLat: num(j.latitude), gridLon: num(j.longitude), elevation: num(j.elevation)
      });
    });
  }
  function freshness(rec, now) {
    if (!rec || rec.status !== "ok") return "missing";
    return now - rec.validAt <= FRESH_MS ? "fresh" : "stale";
  }
  function merge(fresh, cached) {
    var byId = {}; (cached || []).forEach(function (r) { if (r && r.status === "ok") byId[r.id] = r; });
    return fresh.map(function (r) { return r.status === "ok" ? r : (byId[r.id] ? Object.assign({}, byId[r.id], { fromCache: true }) : r); });
  }
  var api = { url: url, parse: parse, freshness: freshness, merge: merge, instant: instant, FRESH_MS: FRESH_MS, ENDPOINT: ENDPOINT };
  if (typeof module === "object" && module.exports) module.exports = api; else root.WBWEATHER = api;
})(this);
