/**
 * TEST FIXTURE ONLY. Never imported by the app. Builds Open-Meteo-shaped responses for whatever
 * coordinates a test requests, so automated tests can run where api.open-meteo.com is unreachable.
 * Values are deterministic functions of position, deliberately unlike real weather (FIXTURE_TAG marks them).
 */
export const FIXTURE_TAG = "fixture";
export const fixtureTemp = (lat, lon) => Math.round((31 - Math.abs(lat) * 0.62 + Math.sin(lon / 30) * 3) * 10) / 10;
const NOW = 1761451200; // 2025-10-26T04:00:00Z, fixed so tests are repeatable
export function currentResponse(url) {
  const u = new URL(url), lats = u.searchParams.get("latitude").split(",").map(Number), lons = u.searchParams.get("longitude").split(",").map(Number);
  const rows = lats.map((lat, i) => ({ latitude: lat + 0.02, longitude: lons[i] - 0.03, elevation: 100, generationtime_ms: 0.1, utc_offset_seconds: Math.round(lons[i] / 15) * 3600,
    timezone: "Etc/GMT" + (Math.round(lons[i] / 15) <= 0 ? "+" : "-") + Math.abs(Math.round(lons[i] / 15)),
    current: { time: NOW, interval: 900, temperature_2m: fixtureTemp(lat, lons[i]), apparent_temperature: fixtureTemp(lat, lons[i]) + 2.5, relative_humidity_2m: 60, weather_code: 2, is_day: 1 } }));
  return rows.length === 1 ? rows[0] : rows;
}
export function forecastResponse(url) {
  const u = new URL(url), lat = Number(u.searchParams.get("latitude")), lon = Number(u.searchParams.get("longitude"));
  const t = Array.from({ length: 72 }, (_, i) => NOW + i * 3600), base = fixtureTemp(lat, lon);
  return { latitude: lat + 0.02, longitude: lon - 0.03, timezone: "Asia/Kathmandu", utc_offset_seconds: 20700,
    hourly: { time: t, temperature_2m: t.map((x, i) => Math.round((base + 5 * Math.sin((i - 4) / 24 * 2 * Math.PI)) * 10) / 10),
      apparent_temperature: t.map((x, i) => Math.round((base + 2 + 5 * Math.sin((i - 4) / 24 * 2 * Math.PI)) * 10) / 10),
      relative_humidity_2m: t.map(() => 55), is_day: t.map((x, i) => ((i + 10) % 24) < 12 ? 1 : 0), weather_code: t.map(() => 1) },
    daily: { time: [0, 1, 2, 3].map(d => NOW - 4 * 3600 + d * 86400), temperature_2m_max: [base + 5, base + 5, base + 5, base + 5], temperature_2m_min: [base - 5, base - 5, base - 5, base - 5] } };
}
