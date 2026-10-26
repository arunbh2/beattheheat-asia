/** Globe state and helpers that the app shell needs without loading the 3D renderer. */
import * as THREE from "three";
import { focusOrientation } from "../lib/geo";
import { MOTION } from "../lib/motion";

export type Metric = "air" | "apparent";
export const FOV = 34;
export const TAN_HALF_FOV = Math.tan((FOV / 2) * Math.PI / 180);
/** Camera distance that fits the globe to the viewport: ~78% of the height, or just wider than a narrow screen. */
export const fitDistance = (aspect: number) => Math.max(1 / (0.78 * TAN_HALF_FOV), 0.95 / (TAN_HALF_FOV * aspect));
export type Tier = "high" | "low";

/** Shared, mutable globe state. React components read it; the frame loop writes it. */
export class GlobeController {
  yaw = 0; pitch = 0; velYaw = 0; velPitch = 0;
  dist = 3.3; targetDist = 3.3; minDist = 2.15; maxDist = 4.6;
  dragging = false; spinEnabled = true; holdSpin = false; reducedMotion = false;
  anim: { from: THREE.Quaternion; to: THREE.Quaternion; t: number; dur: number; yaw: number; pitch: number } | null = null;
  quat = new THREE.Quaternion();
  offset = new THREE.Vector3();
  pick: ((x: number, y: number, radiusPx: number) => string | null) | null = null;
  /** Screen position of a capital and whether it faces the viewer; used by tests and keyboard focus. */
  project: ((id: string) => { x: number; y: number; visible: boolean } | null) | null = null;
  constructor(home: { lat: number; lon: number }) { const o = focusOrientation(home.lat, home.lon); this.yaw = o.yaw; this.pitch = o.pitch; this.home = home; }
  home: { lat: number; lon: number };
  private euler = new THREE.Euler();
  currentQuat(target = new THREE.Quaternion()) { return target.setFromEuler(this.euler.set(this.pitch, this.yaw, 0, "XYZ")); }
  /** Smoothly turn the globe so a place faces the viewer, north up. */
  focus(lat: number, lon: number, zoomTo?: number) {
    const o = focusOrientation(lat, lon), to = new THREE.Quaternion().setFromEuler(new THREE.Euler(o.pitch, o.yaw, 0, "XYZ"));
    const from = this.anim ? this.quat.clone() : this.currentQuat();
    const angle = from.angleTo(to);
    const dur = this.reducedMotion ? MOTION.focusReducedS : Math.max(MOTION.focusMinS, Math.min(MOTION.focusMaxS, angle * 0.75));
    this.velYaw = this.velPitch = 0;
    this.anim = { from, to, t: 0, dur, yaw: o.yaw, pitch: o.pitch };
    if (zoomTo) this.targetDist = zoomTo;
  }
  reset() { this.focus(this.home.lat, this.home.lon); this.targetDist = this.baseDist; }
  baseDist = 3.3;
  /** Called on resize: keeps zoom proportional to the fitted size. */
  fit(aspect: number) { const d = fitDistance(aspect), k = d / this.baseDist; this.baseDist = d; this.minDist = d * 0.6; this.maxDist = d * 1.35; this.targetDist = Math.min(this.maxDist, Math.max(this.minDist, this.targetDist * k)); if (!this.anim) this.dist *= k; }
}


/** True when the browser can create a WebGL context; otherwise the 2D view is used. */
export function webglAvailable(): boolean {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; }
}
