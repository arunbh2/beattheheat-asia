/**
 * Browser data access. Prefers the site's own API (/api/*: batched, cached, keys server-side).
 * Where the app is hosted statically (no /api), the same Open-Meteo client runs in the browser with a
 * 20-minute localStorage cache, and every response says which mode served it.
 * VITE_API_MODE: "auto" (default), "server" or "browser".
 */
import capitalsFile from "../data/capitals.json" with { type: "json" };
import type { Capital, CapitalsWeather, CityProfile, Forecast } from "../lib/contracts";
import { fetchCurrentForCapitals, fetchForecast } from "../weather/openMeteo";
import { createWeatherCache, type Store } from "../weather/cache";
import { buildProfile } from "../data/profile";

export const CAPITALS: Capital[] = (capitalsFile as { capitals: Capital[] }).capitals;
export const CAPITALS_META = capitalsFile as { generatedAt: string; provenance: Record<string, string> };
const byId = new Map(CAPITALS.map(c => [c.id, c]));
export const capitalById = (id: string) => byId.get(id);

const MODE = (import.meta.env.VITE_API_MODE as string | undefined) ?? "auto";
const API = (import.meta.env.VITE_API_BASE as string | undefined) ?? "";
let serverOk: boolean | null = MODE === "browser" ? false : MODE === "server" ? true : null;

const localStore: Store = {
  get: k => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* storage full or blocked: run uncached */ } },
};
const browserCache = createWeatherCache(localStore, "lhp-weather-v1");
const browserForecasts = new Map<string, { at: number; f: Forecast }>();

async function tryServer<T>(path: string, accept: (b: unknown) => b is T): Promise<T | null> {
  if (serverOk === false) return null;
  try {
    const r = await fetch(API + path, { headers: { accept: "application/json" } });
    const type = r.headers.get("content-type") || "";
    if (!type.includes("json")) { if (serverOk === null) serverOk = false; return null; }
    const body = await r.json();
    if (accept(body)) { serverOk = true; return body; }
    return null;
  } catch { if (serverOk === null) serverOk = false; return null; }
}
const isWeather = (b: unknown): b is CapitalsWeather => !!b && Array.isArray((b as CapitalsWeather).records) && (b as CapitalsWeather).mode === "server";

export async function getCapitalsWeather(): Promise<CapitalsWeather> {
  const s = await tryServer("/api/weather/capitals", isWeather);
  if (s) return s;
  const now = Date.now();
  const { snap, cacheAgeSec } = await browserCache.get(() => fetchCurrentForCapitals(CAPITALS, { batchSize: 25, concurrency: 3 }), now);
  const summary = { fresh: 0, stale: 0, unavailable: 0 }; snap.records.forEach(r => summary[r.status]++);
  return { records: snap.records, fetchedAt: snap.fetchedAt, servedAt: new Date(now).toISOString(), cacheAgeSec, mode: "browser",
    summary: { ...summary, failedBatches: snap.failedBatches, totalBatches: snap.totalBatches } };
}

export async function getForecast(id: string): Promise<Forecast> {
  const cap = byId.get(id); if (!cap) throw new Error("Unknown capital");
  const s = await tryServer(`/api/weather/capital/${id}/forecast`, (b): b is Forecast => !!b && Array.isArray((b as Forecast).hours));
  if (s) return s;
  const hit = browserForecasts.get(id); if (hit && Date.now() - hit.at < 30 * 60 * 1000) return hit.f;
  try { const f = await fetchForecast(cap); browserForecasts.set(id, { at: Date.now(), f }); return f; }
  catch (e) { if (hit) return { ...hit.f, status: "stale" }; throw e; }
}

export async function getProfile(id: string): Promise<CityProfile> {
  const cap = byId.get(id); if (!cap) throw new Error("Unknown capital");
  const s = await tryServer(`/api/cities/${id}/profile`, (b): b is CityProfile => !!b && Array.isArray((b as CityProfile).availability));
  return s ?? buildProfile(cap);
}
