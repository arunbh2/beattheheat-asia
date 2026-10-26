import { describe, expect, it } from "vitest";
import capitals from "../../src/data/capitals.json";
import type { Capital } from "../../src/lib/contracts";
import { availabilityFor, buildProfile, NO_RECORD } from "../../src/data/profile";
import { searchCapitals } from "../../src/lib/search";
import { createApi } from "../../server/routes";

const CAPS = (capitals as { capitals: Capital[] }).capitals;
describe("capital registry", () => {
  it("has unique stable ids and valid coordinates", () => {
    expect(new Set(CAPS.map(c => c.id)).size).toBe(CAPS.length);
    CAPS.forEach(c => { expect(Math.abs(c.lat)).toBeLessThanOrEqual(90); expect(Math.abs(c.lon)).toBeLessThanOrEqual(180); expect(c.id).toMatch(/^[a-z0-9-]+$/); });
  });
  it.each([["npl-kathmandu", 27.7, 85.3], ["bgd-dhaka", 23.7, 90.4], ["ind-new-delhi", 28.6, 77.2], ["tha-bangkok", 13.75, 100.5], ["sgp-singapore", 1.29, 103.85], ["jpn-tokyo", 35.69, 139.7], ["gbr-london", 51.5, -0.12], ["usa-washington-d-c", 38.9, -77.0]])("includes %s at the right place", (id, lat, lon) => {
    const c = CAPS.find(x => x.id === id); expect(c, id).toBeTruthy(); expect(c!.lat).toBeCloseTo(lat as number, 0); expect(c!.lon).toBeCloseTo(lon as number, 0);
  });
  it("records the source and its version", () => { expect((capitals as { provenance: { datasetVersion: string } }).provenance.datasetVersion).toMatch(/natural-earth-vector/); });
  it("labels multi-capital roles instead of hiding them", () => { const zaf = CAPS.filter(c => c.neA3 === "ZAF").map(c => c.capitalRole); expect(zaf.length).toBe(3); expect(new Set(zaf).size).toBe(3); });
});
describe("search", () => {
  it("ignores accents and case, and matches partial names and countries", () => {
    expect(searchCapitals(CAPS, "kathm")[0].id).toBe("npl-kathmandu");
    expect(searchCapitals(CAPS, "BRASILIA")[0].name).toBe("Brasília");
    expect(searchCapitals(CAPS, "nepal")[0].id).toBe("npl-kathmandu");
    expect(searchCapitals(CAPS, "zzzz")).toEqual([]);
  });
});
describe("evidence states", () => {
  it("integrates only weather and forecast, and marks everything else not integrated", () => {
    const a = availabilityFor();
    expect(a.filter(x => x.state === "verified").map(x => x.feature).sort()).toEqual(["forecast", "weather"]);
    a.filter(x => x.state !== "verified").forEach(x => { expect(x.state).toBe("not_integrated"); expect(x.reason.length).toBeGreaterThan(20); });
  });
  it("never invents a warning, record or zero", () => {
    const p = buildProfile(CAPS.find(c => c.id === "npl-kathmandu")!);
    expect(p.officialWarning.state).toBe("not_integrated"); expect(p.officialWarning.message).toMatch(/not integrated/);
    expect(p.claims).toEqual([]); expect(p.actions).toEqual([]); expect(p.opportunities).toEqual([]);
    expect(JSON.stringify(p)).not.toMatch(/risk score|"score"/i);
    expect(availabilityFor().find(x => x.feature === "institutions")!.reason).toContain(NO_RECORD);
  });
});
describe("API routes", () => {
  it("serves the registry, profiles and not-integrated stubs", async () => {
    const api = createApi({ client: { fetchImpl: async () => { throw new Error("offline in tests"); }, retries: 0 } });
    expect((await api("GET", "/api/capitals")).status).toBe(200);
    const prof = await api("GET", "/api/cities/npl-kathmandu/profile"); expect(prof.status).toBe(200);
    for (const r of ["history", "exposure", "response", "opportunities"]) expect(((await api("GET", `/api/cities/npl-kathmandu/${r}`)).body as { state: string }).state).toBe("not_integrated");
    expect((await api("GET", "/api/cities/nowhere/profile")).status).toBe(404);
    expect((await api("POST", "/api/capitals")).status).toBe(405);
  });
  it("reports unavailable, not guessed, weather when upstream is down", async () => {
    const api = createApi({ client: { fetchImpl: async () => { throw new Error("offline"); }, retries: 0, sleep: async () => {} } });
    const r = await api("GET", "/api/weather/capitals"), b = r.body as { records?: { temperatureC: number | null; status: string }[] };
    if (r.status === 200) expect(b.records!.every(x => x.temperatureC === null && x.status === "unavailable")).toBe(true); else expect(r.status).toBe(503);
    expect((await api("GET", "/api/weather/capital/npl-kathmandu/forecast")).status).toBe(502);
  });
  it("serves live values through the proxy when upstream answers", async () => {
    // @ts-expect-error untyped test fixture module
    const { currentResponse } = await import("../fixtures/openMeteoFixture.mjs");
    let calls = 0;
    const api = createApi({ client: { fetchImpl: async (url: string) => { calls++; return { ok: true, status: 200, json: async () => currentResponse(url) }; } } });
    const b = (await api("GET", "/api/weather/capitals")).body as { summary: { fresh: number }; mode: string };
    expect(b.mode).toBe("server"); expect(b.summary.fresh).toBe(CAPS.length);
    await api("GET", "/api/weather/capitals"); expect(calls).toBe(Math.ceil(CAPS.length / 25)); // second call served from cache
  });
});
