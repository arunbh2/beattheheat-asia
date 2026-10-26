/**
 * Framework-agnostic API: (method, path) → { status, body }. Used by the Vite dev/preview middleware
 * and by server/node.ts. Keeps Open-Meteo calls on the server, batched and cached.
 */
import capitalsFile from "../src/data/capitals.json" with { type: "json" };
import type { Capital, CapitalsWeather } from "../src/lib/contracts.ts";
import { fetchCurrentForCapitals, fetchForecast, type ClientOptions } from "../src/weather/openMeteo.ts";
import { createWeatherCache, memoryStore, type Store } from "../src/weather/cache.ts";
import { buildProfile } from "../src/data/profile.ts";
import { historyNotIntegrated, exposureNotIntegrated, DEFAULT_BASELINE, type HistoryAdapter, type ExposureAdapter } from "./data/adapters.ts";

export const CAPITALS = (capitalsFile as { capitals: Capital[] }).capitals;
const byId = new Map(CAPITALS.map(c => [c.id, c]));
export type Reply = { status: number; body: unknown; headers?: Record<string, string> };

export function createApi(opts: { store?: Store; client?: ClientOptions; now?: () => number; history?: HistoryAdapter; exposure?: ExposureAdapter } = {}) {
  const history = opts.history ?? historyNotIntegrated, exposure = opts.exposure ?? exposureNotIntegrated;
  const cache = createWeatherCache(opts.store ?? memoryStore());
  const forecasts = new Map<string, { at: number; body: unknown }>();
  const now = opts.now ?? (() => Date.now());
  const json = (status: number, body: unknown, maxAge = 0): Reply => ({ status, body, headers: { "content-type": "application/json; charset=utf-8", "cache-control": maxAge ? `public, max-age=${maxAge}` : "no-store" } });

  return async function handle(method: string, path: string): Promise<Reply> {
    if (method !== "GET") return json(405, { error: "Method not allowed" });
    const p = path.split("?")[0].replace(/\/+$/, "");
    if (p === "/api/capitals") return json(200, capitalsFile, 3600);
    if (p === "/api/weather/capitals") {
      try {
        const { snap, cacheAgeSec } = await cache.get(() => fetchCurrentForCapitals(CAPITALS, opts.client), now());
        const s = { fresh: 0, stale: 0, unavailable: 0 }; snap.records.forEach(r => s[r.status]++);
        const body: CapitalsWeather = { records: snap.records, fetchedAt: snap.fetchedAt, servedAt: new Date(now()).toISOString(), cacheAgeSec, mode: "server",
          summary: { ...s, failedBatches: snap.failedBatches, totalBatches: snap.totalBatches } };
        return json(200, body, 60);
      } catch {
        return json(503, { error: "Current data unavailable", records: [], mode: "server" });
      }
    }
    let m = p.match(/^\/api\/weather\/capital\/([a-z0-9-]+)\/forecast$/);
    if (m) {
      const cap = byId.get(m[1]); if (!cap) return json(404, { error: "Unknown capital" });
      const hit = forecasts.get(cap.id); if (hit && now() - hit.at < 30 * 60 * 1000) return json(200, hit.body, 300);
      try { const body = await fetchForecast(cap, opts.client); forecasts.set(cap.id, { at: now(), body }); return json(200, body, 300); }
      catch (e) { if (hit) return json(200, { ...(hit.body as object), status: "stale" }, 60); return json(502, { capitalId: cap.id, status: "unavailable", error: (e as Error).message }); }
    }
    m = p.match(/^\/api\/cities\/([a-z0-9-]+)\/(profile|history|exposure|response|opportunities)$/);
    if (m) {
      const cap = byId.get(m[1]); if (!cap) return json(404, { error: "Unknown capital" });
      const prof = buildProfile(cap);
      if (m[2] === "profile") return json(200, prof, 600);
      if (m[2] === "history") return json(200, await history.series(cap.id, { baseline: DEFAULT_BASELINE, from: "", to: "" }), 600);
      if (m[2] === "exposure") return json(200, await exposure.summary(cap.id), 600);
      if (m[2] === "response") return json(200, { capitalId: cap.id, state: "not_integrated", records: prof.claims, officialWarning: prof.officialWarning }, 600);
      return json(200, { capitalId: cap.id, state: "not_integrated", records: prof.opportunities }, 600);
    }
    return json(404, { error: "Not found" });
  };
}
