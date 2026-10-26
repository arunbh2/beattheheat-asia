/**
 * Weather cache with a last-good fallback. Fresh for ttlMs; after that a refresh is attempted, and any
 * capital the refresh cannot provide keeps its last good value, marked "stale" with its original times.
 * Storage is pluggable: memory on the server (swap for KV in production), localStorage in the browser.
 */
import type { CurrentWeather } from "../lib/contracts.ts";

export type Store = { get(key: string): string | null | Promise<string | null>; set(key: string, value: string): void | Promise<void> };
export const memoryStore = (): Store => { const m = new Map<string, string>(); return { get: k => m.get(k) ?? null, set: (k, v) => { m.set(k, v); } }; };

export type Snapshot = { fetchedAt: string; records: CurrentWeather[]; failedBatches: number; totalBatches: number };
export const TTL_MS = 25 * 60 * 1000;
/** After this long, a last-good value is no longer shown at all. */
/** A snapshot with failed batches is retried after this long, not on every request. */
export const RETRY_PARTIAL_MS = 5 * 60 * 1000;
export const MAX_STALE_MS = 6 * 60 * 60 * 1000;

export function merge(prev: Snapshot | null, next: Snapshot, now = Date.now()): Snapshot {
  if (!prev) return next;
  const old = new Map(prev.records.map(r => [r.capitalId, r]));
  const records = next.records.map(r => {
    if (r.status !== "unavailable") return r;
    const o = old.get(r.capitalId);
    if (o && o.status !== "unavailable" && o.fetchedAt && now - Date.parse(o.fetchedAt) < MAX_STALE_MS) return { ...o, status: "stale" as const };
    return r;
  });
  return { ...next, records };
}

/** Marks records older than the TTL as stale when they are served from a cache that could not refresh. */
export function ageStatus(s: Snapshot, now = Date.now()): Snapshot {
  return { ...s, records: s.records.map(r => r.status === "fresh" && r.fetchedAt && now - Date.parse(r.fetchedAt) > TTL_MS ? { ...r, status: "stale" as const } : r) };
}

export function createWeatherCache(store: Store, key = "lhp-weather-v1") {
  let inflight: Promise<Snapshot> | null = null;
  const read = async (): Promise<Snapshot | null> => { try { const v = await store.get(key); return v ? JSON.parse(v) : null; } catch { return null; } };
  return {
    read,
    /** Returns cached data if fresh; otherwise refreshes once (shared by concurrent callers) and merges with last good. */
    async get(refresh: () => Promise<Snapshot>, now = Date.now()): Promise<{ snap: Snapshot; cacheAgeSec: number | null }> {
      const prev = await read();
      if (prev && now - Date.parse(prev.fetchedAt) < (prev.failedBatches ? RETRY_PARTIAL_MS : TTL_MS)) return { snap: prev, cacheAgeSec: Math.round((now - Date.parse(prev.fetchedAt)) / 1000) };
      if (!inflight) inflight = (async () => {
        try { const fresh = merge(prev, await refresh(), now); if (fresh.records.some(r => r.status === "fresh")) await store.set(key, JSON.stringify(fresh)); return fresh; }
        catch { if (prev) return ageStatus(prev, now); throw new Error("No weather available"); }
        finally { inflight = null; }
      })();
      const snap = await inflight;
      return { snap, cacheAgeSec: Math.round((now - Date.parse(snap.fetchedAt)) / 1000) };
    },
  };
}
