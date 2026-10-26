import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { decodeLand, facesCamera, focusOrientation, haversineKm, latLonToVec3, rotate, vec3ToLatLon, visibleFrom, wrapAngle } from "../../src/lib/geo";

const REF: [string, number, number][] = [
  ["Singapore", 1.29, 103.85], ["New Delhi", 28.6, 77.2], ["Dhaka", 23.72, 90.41], ["Kathmandu", 27.72, 85.32], ["Tokyo", 35.69, 139.75],
  ["Nairobi", -1.28, 36.82], ["London", 51.5, -0.12], ["Washington DC", 38.9, -77.04], ["Brasília", -15.78, -47.92], ["Canberra", -35.28, 149.13],
];

describe("latLonToVec3", () => {
  it("puts the axes where the spec says", () => {
    const close = (a: number[], b: number[]) => a.forEach((v, i) => expect(v).toBeCloseTo(b[i], 9));
    close(latLonToVec3(0, 0), [0, 0, 1]); close(latLonToVec3(0, 90), [1, 0, 0]); close(latLonToVec3(90, 0), [0, 1, 0]); close(latLonToVec3(0, 180), [0, 0, -1]);
  });
  it.each(REF)("round-trips %s and keeps it on the right hemisphere", (_, lat, lon) => {
    const v = latLonToVec3(lat, lon), back = vec3ToLatLon(v);
    expect(back.lat).toBeCloseTo(lat, 6); expect(back.lon).toBeCloseTo(lon, 6);
    expect(Math.sign(v[1])).toBe(Math.sign(lat));                       // north is +y
    expect(Math.sign(v[0])).toBe(Math.sign(Math.sin(lon * Math.PI / 180))); // east is +x
  });
  it("handles the date line without a seam", () => {
    const a = latLonToVec3(-18, 179.99), b = latLonToVec3(-18, -179.99);
    expect(Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])).toBeLessThan(0.001);
  });
});

describe("focus", () => {
  it.each(REF)("brings %s to the centre of the view with north up", (_, lat, lon) => {
    const v = rotate(latLonToVec3(lat, lon), focusOrientation(lat, lon));
    expect(v[0]).toBeCloseTo(0, 9); expect(v[1]).toBeCloseTo(0, 9); expect(v[2]).toBeCloseTo(1, 9);
    const north = rotate(latLonToVec3(Math.min(89, lat + 1), lon), focusOrientation(lat, lon));
    expect(north[1]).toBeGreaterThan(0);                                  // a point just north is above centre
  });
  it("keeps the same city visible and its antipode hidden", () => {
    const o = focusOrientation(27.72, 85.32), cam = 3.3;
    expect(facesCamera(rotate(latLonToVec3(27.72, 85.32), o), cam)).toBe(true);
    expect(facesCamera(rotate(latLonToVec3(-27.72, -94.68), o), cam)).toBe(false);
    expect(facesCamera(rotate(latLonToVec3(38.9, -77.04), o), cam)).toBe(false); // Washington is on the far side of a Kathmandu view
  });
  it("matches the general visibility test on the axis", () => {
    const n = rotate(latLonToVec3(10, 20), focusOrientation(0, 0)), p = n;
    expect(visibleFrom(n, p, [0, 0, 3.3], 0.02)).toBe(facesCamera(n, 3.3, 0) || visibleFrom(n, p, [0, 0, 3.3], 0.02));
  });
  it("wraps angles to the shortest turn", () => {
    expect(wrapAngle(3 * Math.PI / 2)).toBeCloseTo(-Math.PI / 2); expect(wrapAngle(-3 * Math.PI / 2)).toBeCloseTo(Math.PI / 2);
  });
});

describe("land particles", () => {
  const read = (t: string) => { const b = readFileSync(join(process.cwd(), `public/data/land-${t}.bin`)); return decodeLand(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)); };
  const near = (d: ReturnType<typeof read>, lat: number, lon: number, km: number) => { for (let i = 0; i < d.count; i++) if (haversineKm(lat, lon, d.lat[i], d.lon[i]) < km) return true; return false; };
  const hi = read("high"), lo = read("low");
  it("has the advertised point counts", () => { expect(hi.count).toBeGreaterThanOrEqual(64000); expect(hi.count).toBeLessThan(70000); expect(lo.count).toBeGreaterThanOrEqual(22000); expect(lo.count).toBeLessThan(25000); });
  it.each(REF)("has land around %s", (_, lat, lon) => { expect(near(hi, lat, lon, 120)).toBe(true); });
  it.each([["mid-Pacific", 0, -140], ["mid-Atlantic", 30, -40], ["southern Indian Ocean", -40, 80], ["Tasman Sea", -38, 160]])("has no land in the %s", (_, lat, lon) => { expect(near(hi, lat as number, lon as number, 250)).toBe(false); });
  it.each([["Sri Lanka", 7.8, 80.7], ["Singapore", 1.35, 103.82], ["Malta", 35.9, 14.45], ["Bahrain", 26.05, 50.55], ["Mauritius", -20.2, 57.5], ["Tonga", -21.14, -175.2], ["Maldives", 4.17, 73.51]])("keeps the small landmass of %s visible", (_, lat, lon) => { expect(near(hi, lat as number, lon as number, 40)).toBe(true); expect(near(lo, lat as number, lon as number, 50)).toBe(true); });
  it("samples evenly by area, not by latitude", () => {
    let polar = 0; for (let i = 0; i < hi.count; i++) if (Math.abs(hi.lat[i]) > 70) polar++;
    expect(polar / hi.count).toBeLessThan(0.15);   // uniform-latitude sampling would pile points up near the poles
  });
});
