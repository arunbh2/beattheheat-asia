/**
 * Builds the particle Earth: points sampled uniformly on the sphere (longitude uniform, sin(latitude) uniform)
 * and kept only where they fall on land in Natural Earth 1:50m land polygons (public domain).
 * Output: public/data/land-<tier>.bin, Int16 pairs [lat*100, lon*100], little-endian. Decoded at runtime
 * through the same latLonToVec3 used by the city lights, so geography and markers cannot drift apart.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, ".."), CACHE = join(ROOT, "scripts/.cache");
const FILE = join(CACHE, "ne_50m_land.geojson");
mkdirSync(CACHE, { recursive: true });
if (!existsSync(FILE)) execFileSync("curl", ["-sSfL", "-o", FILE, "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_land.geojson"]);

type Ring = number[][];
type Poly = { rings: Ring[]; minX: number; maxX: number; minY: number; maxY: number };
const polys: Poly[] = [];
for (const f of JSON.parse(readFileSync(FILE, "utf8")).features) {
  const g = f.geometry, list: Ring[][] = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
  for (const rings of list) { let minX = 180, maxX = -180, minY = 90, maxY = -90;
    for (const [x, y] of rings[0]) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
    polys.push({ rings, minX, maxX, minY, maxY }); }
}
// even-odd ray casting across all rings, so lakes and holes are respected
const inRing = (x: number, y: number, r: Ring) => { let ins = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
  const [xi, yi] = r[i], [xj, yj] = r[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) ins = !ins; } return ins; };
const inPoly = (p: Poly, lon: number, lat: number) => { let ins = false; for (const r of p.rings) if (inRing(lon, lat, r)) ins = !ins; return ins; };
/** Index of the land polygon containing the point, or -1 over sea. */
export const landIndex = (lon: number, lat: number) => { for (let i = 0; i < polys.length; i++) { const p = polys[i]; if (lon < p.minX || lon > p.maxX || lat < p.minY || lat > p.maxY) continue; if (inPoly(p, lon, lat)) return i; } return -1; };
const capitals: { lat: number; lon: number }[] = JSON.parse(readFileSync(join(ROOT, "src/data/capitals.json"), "utf8")).capitals;

let s = 20260426; const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
/**
 * 1. Uniform area sampling until `target` points are on land.
 * 2. Small-landmass top-up: every land polygon gets at least `minPerPoly` points, sampled inside it,
 *    so island states (Singapore, Malta, Bahrain, Tonga…) stay visible even though uniform sampling
 *    would give them less than one point.
 * 3. Capital anchors: a capital whose point has no particle nearby (its island is below 1:50m detail)
 *    gets a small cluster at the city point itself, which is land by definition.
 */
function tier(name: string, target: number, minPerPoly: number, anchorKm: number) {
  const pts: number[] = [], per = new Int32Array(polys.length); let n = 0, tries = 0;
  while (n < target) { tries++; const lon = rnd() * 360 - 180, lat = Math.asin(rnd() * 2 - 1) * 180 / Math.PI;
    const i = landIndex(lon, lat); if (i >= 0) { pts.push(lat, lon); per[i]++; n++; } }
  let topped = 0, polysTopped = 0;
  for (let i = 0; i < polys.length; i++) {
    const p = polys[i]; let need = minPerPoly - per[i]; if (need <= 0) continue; polysTopped++;
    for (let k = 0; k < 4000 && need > 0; k++) { const lon = p.minX + rnd() * (p.maxX - p.minX), lat = p.minY + rnd() * (p.maxY - p.minY);
      if (inPoly(p, lon, lat)) { pts.push(lat, lon); need--; topped++; } }
    for (let k = 0; need > 0 && k < p.rings[0].length; k += Math.max(1, Math.floor(p.rings[0].length / minPerPoly))) { const [lon, lat] = p.rings[0][k]; pts.push(lat, lon); need--; topped++; }
  }
  const near = (lat: number, lon: number) => { const cl = Math.cos(lat * Math.PI / 180); for (let j = 0; j < pts.length; j += 2) { const dy = (pts[j] - lat) * 111, dx = (pts[j + 1] - lon) * 111 * cl; if (dx * dx + dy * dy < anchorKm * anchorKm) return true; } return false; };
  let anchored = 0;
  for (const c of capitals) if (!near(c.lat, c.lon)) { anchored++; for (let k = 0; k < 3; k++) pts.push(c.lat + (rnd() - .5) * 0.06, c.lon + (rnd() - .5) * 0.06); }
  const out = new Int16Array(pts.length); for (let j = 0; j < pts.length; j++) out[j] = Math.round(pts[j] * 100);
  writeFileSync(join(ROOT, `public/data/land-${name}.bin`), Buffer.from(out.buffer));
  console.log(`land-${name}: ${n} area-sampled points (${(n / tries * 100).toFixed(1)}% of candidates on land) + ${topped} small-landmass points in ${polysTopped} polygons + ${anchored} capital anchors = ${pts.length / 2}`);
}
mkdirSync(join(ROOT, "public/data"), { recursive: true });
tier("high", 64000, 4, 25); tier("low", 22000, 2, 40);
