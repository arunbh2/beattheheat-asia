import { describe, expect, it, vi } from "vitest";
import { currentUrl, fetchCurrentForCapitals, fetchForecast, getJson, mapBatch, type FetchLike } from "../../src/weather/openMeteo";
import { createWeatherCache, memoryStore, merge, MAX_STALE_MS, TTL_MS } from "../../src/weather/cache";
import type { Capital } from "../../src/lib/contracts";
// @ts-expect-error untyped test fixture module
import { currentResponse, forecastResponse, fixtureTemp } from "../fixtures/openMeteoFixture.mjs";
import capitals from "../../src/data/capitals.json";

const CAPS = (capitals as { capitals: Capital[] }).capitals;
const cap = (id: string) => CAPS.find(c => c.id === id)!;
const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body });
const fixtureFetch: FetchLike = async url => ok(url.includes("hourly=") ? forecastResponse(url) : currentResponse(url));
const noSleep = async () => {};

describe("Open-Meteo request", () => {
  it("batches coordinates in the order given, with the documented variables", () => {
    const u = new URL(currentUrl([cap("ind-new-delhi"), cap("bgd-dhaka")]));
    expect(u.searchParams.get("latitude")).toBe(`${cap("ind-new-delhi").lat.toFixed(4)},${cap("bgd-dhaka").lat.toFixed(4)}`);
    expect(u.searchParams.get("current")).toBe("temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,is_day");
    expect(u.searchParams.get("timeformat")).toBe("unixtime"); expect(u.searchParams.get("timezone")).toBe("auto");
  });
});

describe("mapping responses to capitals", () => {
  const batch = [cap("npl-kathmandu"), cap("bgd-dhaka"), cap("tha-bangkok")];
  it("maps an array by position and keeps exact values", () => {
    const rows = mapBatch(batch, currentResponse(currentUrl(batch)), "2026-01-01T00:00:00Z");
    rows.forEach((r, i) => { expect(r.capitalId).toBe(batch[i].id); expect(r.temperatureC).toBe(fixtureTemp(batch[i].lat, batch[i].lon)); expect(r.status).toBe("fresh"); });
    expect(rows[0].validAt).toBe(new Date(1761451200 * 1000).toISOString());
  });
  it("accepts the single-object response for one location", () => {
    const one = [cap("npl-kathmandu")]; expect(mapBatch(one, currentResponse(currentUrl(one)), "x")[0].temperatureC).toBe(fixtureTemp(one[0].lat, one[0].lon));
  });
  it("rejects a response with the wrong number of locations", () => { expect(() => mapBatch(batch, currentResponse(currentUrl(batch.slice(0, 2))), "x")).toThrow(/2 locations for 3/); });
  it("marks a capital unavailable when the grid cell is far from the request", () => {
    const raw = currentResponse(currentUrl(batch)) as { latitude: number }[]; raw[1].latitude += 5;
    const rows = mapBatch(batch, raw, "x"); expect(rows[1].status).toBe("unavailable"); expect(rows[1].temperatureC).toBeNull(); expect(rows[0].status).toBe("fresh");
  });
  it("keeps negative and zero temperatures, and nulls as unavailable", () => {
    const raw = currentResponse(currentUrl(batch)) as { current: { temperature_2m: number | null } }[];
    raw[0].current.temperature_2m = -7.3; raw[1].current.temperature_2m = 0; raw[2].current.temperature_2m = null;
    const rows = mapBatch(batch, raw, "x");
    expect(rows[0].temperatureC).toBe(-7.3); expect(rows[1].temperatureC).toBe(0); expect(rows[1].status).toBe("fresh"); expect(rows[2].status).toBe("unavailable");
  });
  it("rejects an unexpected shape", () => { expect(() => mapBatch(batch, { nope: true }, "x")).toThrow(/shape/); });
});

describe("batching, partial failure and backoff", () => {
  it("fetches all capitals in batches of 25 and keeps going when one batch fails", async () => {
    let n = 0; const f: FetchLike = async url => { n++; if (n === 2) return { ok: false, status: 500, json: async () => ({}) }; return ok(currentResponse(url)); };
    const r = await fetchCurrentForCapitals(CAPS, { fetchImpl: f, sleep: noSleep, retries: 0, concurrency: 1 });
    expect(r.totalBatches).toBe(Math.ceil(CAPS.length / 25)); expect(r.failedBatches).toBe(1);
    expect(r.records.filter(x => x.status === "unavailable").length).toBe(25); expect(r.records.length).toBe(CAPS.length);
  });
  it("retries a 429 and then succeeds", async () => {
    let n = 0; const f: FetchLike = async url => (++n === 1 ? { ok: false, status: 429, json: async () => ({}) } : ok(currentResponse(url)));
    const sleep = vi.fn(noSleep);
    await expect(getJson(currentUrl([cap("npl-kathmandu")]), { fetchImpl: f, sleep, retries: 2 })).resolves.toBeTruthy(); expect(sleep).toHaveBeenCalledTimes(1);
  });
  it("does not retry a 400", async () => {
    const f = vi.fn(async () => ({ ok: false, status: 400, json: async () => ({}) }));
    await expect(getJson("https://x/", { fetchImpl: f, sleep: noSleep, retries: 3 })).rejects.toThrow(/400/); expect(f).toHaveBeenCalledTimes(1);
  });
  it("returns every capital as unavailable when Open-Meteo is unreachable", async () => {
    const f: FetchLike = async () => { throw new Error("network down"); };
    const r = await fetchCurrentForCapitals(CAPS, { fetchImpl: f, sleep: noSleep, retries: 1 });
    expect(r.records.every(x => x.status === "unavailable" && x.temperatureC === null)).toBe(true);
  });
});

describe("forecast", () => {
  it("returns 72 hourly points and daily extremes", async () => {
    const f = await fetchForecast(cap("npl-kathmandu"), { fetchImpl: fixtureFetch });
    expect(f.hours).toHaveLength(72); expect(f.days.length).toBeGreaterThanOrEqual(3); expect(f.timezone).toBe("Asia/Kathmandu");
    expect(f.hours[1].t - f.hours[0].t).toBe(3600); expect(f.provenance.temporalKind).toBe("forecast");
  });
});

describe("cache and stale fallback", () => {
  const snap = (status: "fresh" | "unavailable", t: number | null, at: string) => ({ fetchedAt: at, failedBatches: 0, totalBatches: 1,
    records: [{ capitalId: "a", temperatureC: t, apparentTemperatureC: null, humidityPct: null, weatherCode: null, isDay: null, validAt: at, fetchedAt: status === "fresh" ? at : null, timezone: null, gridLat: null, gridLon: null, elevationM: null, status, provenance: {} as never }] });
  it("keeps the last good value, marked stale, when a refresh fails", () => {
    const t0 = Date.parse("2026-01-01T00:00:00Z");
    const m = merge(snap("fresh", 21, "2026-01-01T00:00:00Z"), snap("unavailable", null, "2026-01-01T00:30:00Z"), t0 + 30 * 60000);
    expect(m.records[0].status).toBe("stale"); expect(m.records[0].temperatureC).toBe(21); expect(m.records[0].fetchedAt).toBe("2026-01-01T00:00:00Z");
  });
  it("drops a last good value older than the stale limit", () => {
    const t0 = Date.parse("2026-01-01T00:00:00Z");
    expect(merge(snap("fresh", 21, "2026-01-01T00:00:00Z"), snap("unavailable", null, "x"), t0 + MAX_STALE_MS + 1).records[0].status).toBe("unavailable");
  });
  it("serves from cache inside the TTL and refreshes after it", async () => {
    const c = createWeatherCache(memoryStore()), refresh = vi.fn(async () => snap("fresh", 20, new Date(Date.parse("2026-01-01T00:00:00Z")).toISOString()));
    const t0 = Date.parse("2026-01-01T00:00:00Z");
    await c.get(refresh, t0); await c.get(refresh, t0 + 60000); expect(refresh).toHaveBeenCalledTimes(1);
    await c.get(refresh, t0 + TTL_MS + 1000); expect(refresh).toHaveBeenCalledTimes(2);
  });
  it("shares one refresh between concurrent callers", async () => {
    const c = createWeatherCache(memoryStore()); let calls = 0; const refresh = async () => { calls++; await new Promise(r => setTimeout(r, 10)); return snap("fresh", 20, new Date().toISOString()); };
    await Promise.all([c.get(refresh), c.get(refresh), c.get(refresh)]); expect(calls).toBe(1);
  });
});
