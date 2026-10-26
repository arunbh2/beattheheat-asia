import { describe, expect, it } from "vitest";
import { bandIndex, BANDS, SCALE_TITLE, temperatureColor, UNAVAILABLE_COLOR } from "../../src/lib/temperatureScale";
import { cToF, formatTemp } from "../../src/lib/units";

describe("temperature colour key", () => {
  it("is titled as air temperature and never as risk", () => { expect(SCALE_TITLE).toBe("Air temperature (°C)"); expect(SCALE_TITLE.toLowerCase()).not.toMatch(/risk|danger|warning/); });
  it.each([[-12, 0], [-0.1, 0], [0, 1], [14.9, 1], [15, 2], [24.9, 2], [25, 3], [31.9, 3], [32, 4], [37.9, 4], [38, 5], [47, 5]])("puts %s°C in band %s", (t, i) => expect(bandIndex(t)).toBe(i));
  it("uses the specified colours away from band edges", () => {
    expect(temperatureColor(-10)).toBe("#83C9FF"); expect(temperatureColor(8)).toBe("#4ED9E8"); expect(temperatureColor(20)).toBe("#E9EAF0");
    expect(temperatureColor(28.5)).toBe("#F7C765"); expect(temperatureColor(35)).toBe("#FF853E"); expect(temperatureColor(43)).toBe("#FF5267");
  });
  it("blends smoothly across an edge", () => { const a = temperatureColor(24.6), b = temperatureColor(25.4); expect(a).not.toBe(b); expect(a).not.toBe(BANDS[2].color); expect(b).not.toBe(BANDS[3].color); expect(temperatureColor(24.2)).toBe(BANDS[2].color); });
  it("shows missing values as grey, never as 0°C", () => { expect(temperatureColor(null)).toBe(UNAVAILABLE_COLOR); expect(temperatureColor(NaN)).toBe(UNAVAILABLE_COLOR); expect(temperatureColor(0)).not.toBe(UNAVAILABLE_COLOR); });
  it("keeps the category in °C whatever unit is displayed", () => { const c = 33; expect(bandIndex(c)).toBe(4); expect(formatTemp(c, "F")).toBe(`${Math.round(cToF(c))}°F`); expect(bandIndex(c)).toBe(4); });
});
describe("formatTemp", () => {
  it("formats negatives, zero and nulls honestly", () => { expect(formatTemp(-4.6, "C")).toBe("-5°C"); expect(formatTemp(-0.2, "C")).toBe("0°C"); expect(formatTemp(null, "C")).toBe("—"); expect(formatTemp(0, "F")).toBe("32°F"); });
});
