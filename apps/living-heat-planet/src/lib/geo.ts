/**
 * The one projection used everywhere: land particles, capital lights, picking and focus.
 * Right-handed, y up. Longitude 0 faces +z, longitude +90 faces +x, the north pole is +y.
 */
export type Vec3 = [number, number, number];
const D2R = Math.PI / 180;

export function latLonToVec3(latDeg: number, lonDeg: number, radius = 1): Vec3 {
  const phi = latDeg * D2R, lambda = lonDeg * D2R;
  return [radius * Math.cos(phi) * Math.sin(lambda), radius * Math.sin(phi), radius * Math.cos(phi) * Math.cos(lambda)];
}

export function vec3ToLatLon([x, y, z]: Vec3): { lat: number; lon: number } {
  const r = Math.hypot(x, y, z);
  return { lat: Math.asin(y / r) / D2R, lon: Math.atan2(x, z) / D2R };
}

/** Globe orientation as yaw (about y) then pitch (about x): keeps north up while dragging. */
export type Orientation = { yaw: number; pitch: number };
export const PITCH_LIMIT = 75 * D2R;

/** Orientation that brings a place to the centre of the view (+z), north up. */
export function focusOrientation(latDeg: number, lonDeg: number): Orientation {
  return { yaw: -lonDeg * D2R, pitch: Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, latDeg * D2R)) };
}

/** Applies the orientation (Ry(yaw) first, then Rx(pitch)) to a vector. Mirrors three.js Euler order XYZ. */
export function rotate([x, y, z]: Vec3, { yaw, pitch }: Orientation): Vec3 {
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;           // about y
  return [x1, y * cp - z1 * sp, y * sp + z1 * cp];               // about x
}

/**
 * True when a point on the unit sphere faces a camera on the +z axis at distance d.
 * A tangent ray from the camera touches the sphere where n·z = 1/d, so anything below that is hidden.
 */
export function facesCamera(worldNormal: Vec3, cameraDistance: number, margin = 0.02): boolean {
  return worldNormal[2] > 1 / cameraDistance + margin;
}

/**
 * General form: is the surface point p (outward normal n) visible from camera position cam?
 * True when the camera lies in front of the tangent plane at p.
 */
export function visibleFrom(n: Vec3, p: Vec3, cam: Vec3, margin = 0.02): boolean {
  const t: Vec3 = [cam[0] - p[0], cam[1] - p[1], cam[2] - p[2]], len = Math.hypot(...t);
  return (n[0] * t[0] + n[1] * t[1] + n[2] * t[2]) / (Math.hypot(...n) * len) > margin;
}

/** Shortest signed angular difference, wrapped to (-π, π]. */
export function wrapAngle(a: number): number {
  const t = ((a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
  return t === -Math.PI ? Math.PI : t;
}

/** Decodes the land particle file: Int16 pairs [lat*100, lon*100]. */
export function decodeLand(buf: ArrayBuffer): { lat: Float32Array; lon: Float32Array; count: number } {
  const a = new Int16Array(buf), n = a.length / 2, lat = new Float32Array(n), lon = new Float32Array(n);
  for (let i = 0; i < n; i++) { lat[i] = a[i * 2] / 100; lon[i] = a[i * 2 + 1] / 100; }
  return { lat, lon, count: n };
}

/** Great-circle distance in km, for tests and for checking returned grid cells. */
export function haversineKm(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const dLat = (bLat - aLat) * D2R, dLon = (bLon - aLon) * D2R;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * D2R) * Math.cos(bLat * D2R) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
}
