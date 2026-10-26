/**
 * Open-Meteo Forecast API client, shared by the server proxy and the browser fallback.
 * Batches capitals, maps each response entry back to its capital by position AND checks the
 * returned grid cell is near the requested point, retries 429 and 5xx with backoff, and never
 * invents a value: anything that fails comes back as status "unavailable" with nulls.
 */
import type { Capital, CurrentWeather, Forecast, Provenance, HourPoint, DayPoint } from "../lib/contracts.ts";
import { OMCurrentBatch, OMForecast } from "../lib/schemas.ts";
import { haversineKm } from "../lib/geo.ts";

export const OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast";
export const CURRENT_VARS = "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,is_day";
export const MAX_GRID_OFFSET_KM = 60; // a returned grid cell further than this from the request is treated as a mismatch

export type FetchLike = (url: string, init?: { signal?: AbortSignal }) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;
export type ClientOptions = { fetchImpl?: FetchLike; batchSize?: number; concurrency?: number; timeoutMs?: number; retries?: number; baseUrl?: string; sleep?: (ms: number) => Promise<void>; now?: () => Date };

export const currentProvenance = (fetchedAt?: string, validAt?: string): Provenance => ({
  sourceName: "Open-Meteo Forecast API", sourceUrl: "https://open-meteo.com/en/docs",
  datasetVersion: "best_match (Open-Meteo seamless model selection)", licensedUse: "CC BY 4.0 data; free API for non-commercial use (https://open-meteo.com/en/pricing)",
  spatialResolution: "Nearest model grid cell to the capital's point (1–25 km depending on model)",
  temporalKind: "current_modelled", fetchedAt, validAt,
  caveat: "Modelled current conditions at a grid cell, not a ground-station observation and not an official warning.",
});
export const forecastProvenance = (fetchedAt?: string): Provenance => ({ ...currentProvenance(fetchedAt), temporalKind: "forecast",
  caveat: "Hourly model forecast for the grid cell. Not an official heat warning and not a probability of impact." });

export const unavailable = (capitalId: string, fetchedAt: string | null = null): CurrentWeather => ({
  capitalId, temperatureC: null, apparentTemperatureC: null, humidityPct: null, weatherCode: null, isDay: null,
  validAt: null, fetchedAt, timezone: null, gridLat: null, gridLon: null, elevationM: null, status: "unavailable", provenance: currentProvenance(fetchedAt ?? undefined),
});

export class UpstreamError extends Error { constructor(msg: string, public status?: number) { super(msg); } }

const defaultSleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
const r4 = (n: number) => n.toFixed(4);

export function currentUrl(batch: Pick<Capital, "lat" | "lon">[], base = OPEN_METEO_BASE): string {
  return `${base}?latitude=${batch.map(c => r4(c.lat)).join(",")}&longitude=${batch.map(c => r4(c.lon)).join(",")}` +
    `&current=${CURRENT_VARS}&temperature_unit=celsius&wind_speed_unit=kmh&timezone=auto&timeformat=unixtime`;
}
export function forecastUrl(c: Pick<Capital, "lat" | "lon">, base = OPEN_METEO_BASE): string {
  return `${base}?latitude=${r4(c.lat)}&longitude=${r4(c.lon)}&hourly=temperature_2m,apparent_temperature,relative_humidity_2m,is_day,weather_code` +
    `&daily=temperature_2m_max,temperature_2m_min&forecast_hours=72&forecast_days=4&temperature_unit=celsius&timezone=auto&timeformat=unixtime`;
}

/** GET with timeout and backoff on 429 / 5xx / network errors. */
export async function getJson(url: string, o: ClientOptions = {}): Promise<unknown> {
  const fetchImpl = o.fetchImpl ?? (globalThis.fetch as unknown as FetchLike), sleep = o.sleep ?? defaultSleep;
  const retries = o.retries ?? 2, timeoutMs = o.timeoutMs ?? 9000;
  let last: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctl = typeof AbortController !== "undefined" ? new AbortController() : undefined;
    const timer = ctl ? setTimeout(() => ctl.abort(), timeoutMs) : undefined;
    try {
      const res = await fetchImpl(url, { signal: ctl?.signal });
      if (res.ok) return await res.json();
      last = new UpstreamError(`Open-Meteo responded ${res.status}`, res.status);
      if (res.status !== 429 && res.status < 500) throw last;           // 4xx other than 429: do not retry
    } catch (e) {
      last = e; if (e instanceof UpstreamError && e.status && e.status !== 429 && e.status < 500) throw e;
    } finally { if (timer) clearTimeout(timer); }
    if (attempt < retries) await sleep(Math.min(8000, 600 * 2 ** attempt * (1 + Math.random() * 0.3)));
  }
  throw last instanceof Error ? last : new UpstreamError(String(last));
}

async function pool<T, R>(items: T[], limit: number, fn: (t: T, i: number) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length); let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => { while (next < items.length) { const i = next++; out[i] = await fn(items[i], i); } }));
  return out;
}

/** Maps one batch response back to capitals by position, rejecting entries whose grid cell is far from the request. */
export function mapBatch(batch: Capital[], raw: unknown, fetchedAt: string): CurrentWeather[] {
  const parsed = OMCurrentBatch.safeParse(raw);
  if (!parsed.success) throw new UpstreamError("Unexpected response shape from Open-Meteo");
  const rows = parsed.data;
  if (rows.length !== batch.length) throw new UpstreamError(`Open-Meteo returned ${rows.length} locations for ${batch.length} requested`);
  return batch.map((cap, i) => {
    const r = rows[i];
    if (haversineKm(cap.lat, cap.lon, r.latitude, r.longitude) > MAX_GRID_OFFSET_KM) return unavailable(cap.id, fetchedAt);
    const c = r.current, n = (v: number | null | undefined) => (v == null || !Number.isFinite(v) ? null : v);
    const validAt = new Date(c.time * 1000).toISOString();
    return {
      capitalId: cap.id, temperatureC: n(c.temperature_2m), apparentTemperatureC: n(c.apparent_temperature), humidityPct: n(c.relative_humidity_2m),
      weatherCode: n(c.weather_code), isDay: c.is_day == null ? null : c.is_day === 1, validAt, fetchedAt,
      timezone: r.timezone ?? null, gridLat: r.latitude, gridLon: r.longitude, elevationM: r.elevation ?? null,
      status: n(c.temperature_2m) == null ? "unavailable" : "fresh", provenance: currentProvenance(fetchedAt, validAt),
    };
  });
}

export async function fetchCurrentForCapitals(capitals: Capital[], o: ClientOptions = {}): Promise<{ records: CurrentWeather[]; failedBatches: number; totalBatches: number; fetchedAt: string }> {
  const size = o.batchSize ?? 25, batches: Capital[][] = [];
  for (let i = 0; i < capitals.length; i += size) batches.push(capitals.slice(i, i + size));
  const fetchedAt = (o.now ?? (() => new Date()))().toISOString();
  let failed = 0;
  const results = await pool(batches, o.concurrency ?? 3, async b => {
    try { return mapBatch(b, await getJson(currentUrl(b, o.baseUrl), o), fetchedAt); }
    catch { failed++; return b.map(c => unavailable(c.id, null)); }
  });
  return { records: results.flat(), failedBatches: failed, totalBatches: batches.length, fetchedAt };
}

export function mapForecast(cap: Capital, raw: unknown, fetchedAt: string): Forecast {
  const p = OMForecast.safeParse(raw);
  if (!p.success) throw new UpstreamError("Unexpected forecast shape from Open-Meteo");
  const f = p.data, h = f.hourly;
  if (haversineKm(cap.lat, cap.lon, f.latitude, f.longitude) > MAX_GRID_OFFSET_KM) throw new UpstreamError("Forecast grid cell does not match the requested location");
  const hours: HourPoint[] = h.time.slice(0, 72).map((t, i) => ({ t, tempC: h.temperature_2m[i] ?? null, apparentC: h.apparent_temperature[i] ?? null,
    humidityPct: h.relative_humidity_2m[i] ?? null, isDay: h.is_day ? (h.is_day[i] == null ? null : h.is_day[i] === 1) : null, weatherCode: h.weather_code ? h.weather_code[i] ?? null : null }));
  const offset = f.utc_offset_seconds ?? 0;
  const days: DayPoint[] = f.daily ? f.daily.time.map((t, i) => ({ date: new Date((t + offset) * 1000).toISOString().slice(0, 10), maxC: f.daily!.temperature_2m_max[i] ?? null, minC: f.daily!.temperature_2m_min[i] ?? null })) : [];
  return { capitalId: cap.id, timezone: f.timezone ?? null, utcOffsetSec: f.utc_offset_seconds ?? null, hours, days, fetchedAt, status: "fresh", provenance: forecastProvenance(fetchedAt) };
}

export async function fetchForecast(cap: Capital, o: ClientOptions = {}): Promise<Forecast> {
  const fetchedAt = (o.now ?? (() => new Date()))().toISOString();
  return mapForecast(cap, await getJson(forecastUrl(cap, o.baseUrl), o), fetchedAt);
}
