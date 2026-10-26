/**
 * Colour key for AIR TEMPERATURE only. These bands are a visual aid, not health-warning categories.
 * Categories are always computed in °C, whatever unit is displayed.
 */
export type Band = { upToC: number; color: string; label: string };
export const SCALE_TITLE = "Air temperature (°C)";
export const BANDS: Band[] = [
  { upToC: 0, color: "#83C9FF", label: "below 0" },
  { upToC: 15, color: "#4ED9E8", label: "0–15" },
  { upToC: 25, color: "#E9EAF0", label: "15–25" },
  { upToC: 32, color: "#F7C765", label: "25–32" },
  { upToC: 38, color: "#FF853E", label: "32–38" },
  { upToC: Infinity, color: "#FF5267", label: "above 38" },
];
export const UNAVAILABLE_COLOR = "#7C8496"; // visible as "missing", never mistaken for a temperature band
/** Width (°C) over which neighbouring bands blend, so colours change smoothly. 0 gives hard steps. */
export const BLEND_C = 1.5;

const hex = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255) as [number, number, number];
const toHex = (c: number[]) => "#" + c.map(v => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, "0")).join("").toUpperCase();

export function bandIndex(tempC: number): number {
  for (let i = 0; i < BANDS.length; i++) if (tempC < BANDS[i].upToC) return i;
  return BANDS.length - 1;
}

/** RGB 0–1 for a temperature in °C; null means no value, shown in a neutral grey, never as 0°C. */
export function temperatureRGB(tempC: number | null | undefined, blend = BLEND_C): [number, number, number] {
  if (tempC == null || !Number.isFinite(tempC)) return hex(UNAVAILABLE_COLOR);
  const i = bandIndex(tempC), c = hex(BANDS[i].color);
  if (blend <= 0) return c;
  // blend towards the neighbouring band near each edge
  const lower = i > 0 ? BANDS[i - 1].upToC : -Infinity, upper = BANDS[i].upToC, half = blend / 2;
  if (upper !== Infinity && tempC > upper - half) { const n = hex(BANDS[i + 1].color), k = (tempC - (upper - half)) / blend; return c.map((v, j) => v + (n[j] - v) * k) as [number, number, number]; }
  if (lower !== -Infinity && tempC < lower + half) { const n = hex(BANDS[i - 1].color), k = ((lower + half) - tempC) / blend; return c.map((v, j) => v + (n[j] - v) * k) as [number, number, number]; }
  return c;
}
export const temperatureColor = (tempC: number | null | undefined, blend = BLEND_C) => toHex(temperatureRGB(tempC, blend));
