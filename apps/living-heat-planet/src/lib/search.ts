/** Accent- and case-insensitive search over capitals, by city or country, prefix matches first. */
export const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[’']/g, "").trim();
export function searchCapitals<T extends { name: string; country: string }>(list: T[], query: string, limit = 8): T[] {
  const q = fold(query); if (!q) return [];
  const scored: [number, T][] = [];
  for (const c of list) {
    const n = fold(c.name), k = fold(c.country);
    const s = n === q ? 0 : n.startsWith(q) ? 1 : k.startsWith(q) ? 2 : n.includes(q) ? 3 : k.includes(q) ? 4 : -1;
    if (s >= 0) scored.push([s, c]);
  }
  return scored.sort((a, b) => a[0] - b[0] || a[1].name.localeCompare(b[1].name)).slice(0, limit).map(x => x[1]);
}
