export type Unit = "C" | "F";
export const cToF = (c: number) => c * 9 / 5 + 32;
/** Formats a °C value for display; null shows as an em dash, never as zero. */
export function formatTemp(c: number | null | undefined, unit: Unit, digits = 0): string {
  if (c == null || !Number.isFinite(c)) return "—";
  const v = unit === "F" ? cToF(c) : c;
  const r = Number(v.toFixed(digits));
  return `${Object.is(r, -0) ? 0 : r}°${unit}`;
}
