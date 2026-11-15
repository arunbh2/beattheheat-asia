// Common Shade: the small geometry the district job needs, with no library: point in polygon, rings joined from
// OpenStreetMap ways, a point inside a polygon, bounding boxes, and an index so a point is tested only against the
// polygons whose box holds it. Coordinates are [longitude, latitude]. tools/check-city-districts.js tests every function
// on fixed shapes; tools/city-districts/run.js (the GitHub job) uses them.
"use strict";
// a polygon is an array of rings (first the outer ring, then holes); a multipolygon an array of polygons
function inRing(x, y, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function inPolygon(x, y, poly) { if (!inRing(x, y, poly[0])) return false; for (let k = 1; k < poly.length; k++) if (inRing(x, y, poly[k])) return false; return true; }
function inMulti(x, y, multi) { return multi.some(p => inPolygon(x, y, p)); }
// GeoJSON geometry (Polygon or MultiPolygon) to a multipolygon
function toMulti(g) { if (!g) return []; if (g.type === "Polygon") return [g.coordinates]; if (g.type === "MultiPolygon") return g.coordinates; return []; }
function bbox(multi) { let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity; for (const p of multi) for (const [x, y] of p[0]) { if (x < a) a = x; if (y < b) b = y; if (x > c) c = x; if (y > d) d = y; } return [a, b, c, d]; }
const inBox = (x, y, b) => x >= b[0] && x <= b[2] && y >= b[1] && y <= b[3];
// a point that lies inside the polygon (the centre of its box if inside, else the middle of the widest inside run on a few scan lines)
function interiorPoint(multi) {
  const b = bbox(multi), cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2;
  if (inMulti(cx, cy, multi)) return [cx, cy];
  for (let k = 1; k < 40; k++) { const y = b[1] + (b[3] - b[1]) * k / 40; let run = null, best = null;
    for (let i = 0; i <= 200; i++) { const x = b[0] + (b[2] - b[0]) * i / 200, ins = inMulti(x, y, multi);
      if (ins && run === null) run = x; if ((!ins || i === 200) && run !== null) { const w = x - run; if (!best || w > best[0]) best = [w, (run + x) / 2]; run = null; } }
    if (best && inMulti(best[1], y, multi)) return [best[1], y]; }
  return null;
}
// join OpenStreetMap way geometries (arrays of [lon, lat]) into closed rings by matching end points; open leftovers are dropped
function joinRings(ways) {
  const left = ways.map(w => w.slice()).filter(w => w.length > 1), rings = [], same = (p, q) => p[0] === q[0] && p[1] === q[1];
  while (left.length) {
    let ring = left.shift();
    for (let grew = true; grew && !same(ring[0], ring[ring.length - 1]);) { grew = false;
      for (let i = 0; i < left.length; i++) { const w = left[i], end = ring[ring.length - 1];
        if (same(w[0], end)) { ring = ring.concat(w.slice(1)); } else if (same(w[w.length - 1], end)) { ring = ring.concat(w.slice(0, -1).reverse()); }
        else if (same(w[w.length - 1], ring[0])) { ring = w.slice(0, -1).concat(ring); } else if (same(w[0], ring[0])) { ring = w.slice(1).reverse().concat(ring); } else continue;
        left.splice(i, 1); grew = true; break; } }
    if (ring.length >= 4 && same(ring[0], ring[ring.length - 1])) rings.push(ring);
  }
  return rings;
}
// an index of features by box: which features could hold a point
function index(features) { const items = features.map((f, i) => ({ i, b: bbox(f.multi) })); return (x, y) => items.filter(t => inBox(x, y, t.b)).map(t => t.i); }
// the area of a ring in square kilometres, on a sphere (good to well under 1% for city-sized shapes)
function ringKm2(ring) { const R = 6371.0088, rad = Math.PI / 180; let s = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) s += (ring[i][0] - ring[j][0]) * rad * (2 + Math.sin(ring[j][1] * rad) + Math.sin(ring[i][1] * rad));
  return Math.abs(s * R * R / 2); }
function multiKm2(multi) { return multi.reduce((a, p) => a + ringKm2(p[0]) - p.slice(1).reduce((h, r) => h + ringKm2(r), 0), 0); }
module.exports = { inRing, inPolygon, inMulti, toMulti, bbox, inBox, interiorPoint, joinRings, index, ringKm2, multiKm2 };
