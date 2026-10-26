/**
 * The particle Earth. One THREE.Points for land, one for capital lights, a depth-writing dark core for
 * physically correct far-side occlusion, and a faint atmosphere. Orientation lives in a plain controller
 * object (not React state) so drag, inertia, idle spin and quaternion focus never re-render the UI.
 */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Capital, CurrentWeather } from "../lib/contracts";
import { decodeLand, latLonToVec3, PITCH_LIMIT, visibleFrom, type Vec3 } from "../lib/geo";
import { FOV, TAN_HALF_FOV, GlobeController, type Metric, type Tier } from "./controller";
export { GlobeController, webglAvailable, fitDistance, type Metric, type Tier } from "./controller";
import { temperatureRGB } from "../lib/temperatureScale";
import { MOTION } from "../lib/motion";

const LAND_VERT = /* glsl */ `
  attribute float aSeed;
  uniform float uTime; uniform float uSize; uniform float uPixelRatio; uniform float uTwinkle;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * position);
    float facing = dot(n, normalize(-mv.xyz));
    float limb = smoothstep(-0.02, 0.38, facing);
    float spark = step(0.984, aSeed) * (0.5 + 0.5 * sin(uTime * (0.5 + aSeed * 1.6) + aSeed * 91.0)) * uTwinkle;
    float base = 0.26 + 0.36 * fract(aSeed * 7.13);
    vAlpha = (base + spark * 0.75) * limb;
    gl_PointSize = uSize * uPixelRatio * (0.7 + 0.7 * fract(aSeed * 3.71) + spark) * (3.3 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }`;
const LAND_FRAG = /* glsl */ `
  uniform vec3 uColor; varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(uColor, smoothstep(0.5, 0.08, d) * vAlpha);
  }`;
const CITY_VERT = /* glsl */ `
  attribute vec3 aColor; attribute float aState; attribute float aPhase;
  uniform float uTime; uniform float uPixelRatio; uniform float uPulse;
  varying vec3 vColor; varying float vState; varying float vFacing;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * position);
    vFacing = smoothstep(0.04, 0.2, dot(n, normalize(-mv.xyz)));
    vColor = aColor; vState = aState;
    float pulse = 1.0 + uPulse * 0.1 * sin(uTime * 1.2 + aPhase * 6.2831);
    float s = aState > 1.5 ? 44.0 : (aState > 0.5 ? 36.0 : 25.0);
    gl_PointSize = s * pulse * uPixelRatio * (3.3 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }`;
const CITY_FRAG = /* glsl */ `
  varying vec3 vColor; varying float vState; varying float vFacing;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float core = smoothstep(0.3, 0.12, d);
    float halo = exp(-d * d * 5.0) * 0.75 + exp(-d * d * 22.0) * 0.5;
    float ring = vState > 1.5 ? smoothstep(0.09, 0.0, abs(d - 0.8)) : 0.0;
    vec3 col = mix(vColor, vec3(1.0), core * 0.3) * (core + halo) + vec3(1.0) * ring;
    float a = (core + halo + ring) * vFacing;
    if (a < 0.01) discard;
    gl_FragColor = vec4(col, a);
  }`;
const ATMO_VERT = /* glsl */ `varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const ATMO_FRAG = /* glsl */ `varying vec3 vN; void main(){ float k = pow(clamp(0.66 - dot(vN, vec3(0.0,0.0,1.0)), 0.0, 1.0), 3.2); gl_FragColor = vec4(vec3(0.55,0.66,0.82) * k * 0.55, k * 0.3); }`;

function LandPoints({ tier, reducedMotion, base }: { tier: Tier; reducedMotion: boolean; base: string }) {
  const [geo, setGeo] = useState<THREE.BufferGeometry | null>(null);
  const gl = useThree(s => s.gl);
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: LAND_VERT, fragmentShader: LAND_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uSize: { value: tier === "high" ? 2.1 : 2.8 }, uPixelRatio: { value: 1 }, uTwinkle: { value: 1 }, uColor: { value: new THREE.Color("#E6E8EF") } },
  }), [tier]);
  useEffect(() => {
    let alive = true;
    fetch(`${base}data/land-${tier}.bin`).then(r => { if (!r.ok) throw new Error("land data " + r.status); return r.arrayBuffer(); }).then(buf => {
      if (!alive) return;
      const { lat, lon, count } = decodeLand(buf), pos = new Float32Array(count * 3), seed = new Float32Array(count);
      for (let i = 0; i < count; i++) { const v = latLonToVec3(lat[i], lon[i], 1); pos.set(v, i * 3); const h = Math.sin(i * 12.9898 + 78.233) * 43758.5453; seed[i] = h - Math.floor(h); }
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
      g.computeBoundingSphere(); setGeo(g);
      document.documentElement.dataset.landPoints = String(count);
    }).catch(() => { document.documentElement.dataset.landPoints = "error"; });
    return () => { alive = false; };
  }, [tier, base]);
  useEffect(() => () => { geo?.dispose(); }, [geo]);
  useEffect(() => () => mat.dispose(), [mat]);
  useFrame(({ clock }) => { mat.uniforms.uTime.value = clock.elapsedTime; mat.uniforms.uPixelRatio.value = gl.getPixelRatio(); mat.uniforms.uTwinkle.value = reducedMotion ? 0 : 1; });
  return geo ? <points geometry={geo} material={mat} renderOrder={1} /> : null;
}

function CapitalLights({ capitals, weather, metric, hoverId, selectedId, compareIds, reducedMotion }: {
  capitals: Capital[]; weather: Map<string, CurrentWeather>; metric: Metric; hoverId: string | null; selectedId: string | null; compareIds: string[]; reducedMotion: boolean;
}) {
  const gl = useThree(s => s.gl);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry(), n = capitals.length, pos = new Float32Array(n * 3), phase = new Float32Array(n);
    capitals.forEach((c, i) => { pos.set(latLonToVec3(c.lat, c.lon, 1.012), i * 3); phase[i] = (i * 0.6180339) % 1; });
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aColor", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute("aState", new THREE.BufferAttribute(new Float32Array(n), 1));
    g.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    return g;
  }, [capitals]);
  const mat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: CITY_VERT, fragmentShader: CITY_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 }, uPulse: { value: 1 } } }), []);
  // colour targets update when data or metric change; the frame loop eases towards them
  const target = useMemo(() => {
    const t = new Float32Array(capitals.length * 3);
    capitals.forEach((c, i) => { const w = weather.get(c.id); const v = w ? (metric === "air" ? w.temperatureC : w.apparentTemperatureC) : null; t.set(temperatureRGB(w && w.status !== "unavailable" ? v : null), i * 3); });
    return t;
  }, [capitals, weather, metric]);
  useEffect(() => {
    const st = geo.getAttribute("aState") as THREE.BufferAttribute;
    capitals.forEach((c, i) => st.setX(i, c.id === selectedId ? 2 : c.id === hoverId || compareIds.includes(c.id) ? 1 : 0));
    st.needsUpdate = true;
  }, [geo, capitals, hoverId, selectedId, compareIds]);
  useEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);
  const primed = useRef(false);
  useFrame(({ clock }, dt) => {
    mat.uniforms.uTime.value = clock.elapsedTime; mat.uniforms.uPixelRatio.value = gl.getPixelRatio(); mat.uniforms.uPulse.value = reducedMotion ? 0 : 1;
    const col = geo.getAttribute("aColor") as THREE.BufferAttribute, a = col.array as Float32Array;
    const k = !primed.current || reducedMotion ? 1 : 1 - Math.exp(-dt / 0.35); let moved = false;
    for (let i = 0; i < a.length; i++) { const d = target[i] - a[i]; if (Math.abs(d) > 1e-4) { a[i] += d * k; moved = true; } }
    if (moved) col.needsUpdate = true; primed.current = true;
  });
  return <points geometry={geo} material={mat} renderOrder={3} />;
}

function Stars() {
  const geo = useMemo(() => { let s = 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; const n = 700, p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const v = latLonToVec3(Math.asin(r() * 2 - 1) * 57.2958, r() * 360 - 180, 18 + r() * 12); p.set(v, i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(p, 3)); return g; }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  return <points geometry={geo}><pointsMaterial size={0.035} color="#8C93A3" transparent opacity={0.5} depthWrite={false} sizeAttenuation /></points>;
}

/** Drag, inertia, pinch and wheel zoom, tap-to-pick and hover, on the canvas element only. */
function Interaction({ ctl, capitals, onHover, onSelect, onUserMove }: { ctl: GlobeController; capitals: Capital[]; onHover: (id: string | null, x: number, y: number) => void; onSelect: (id: string) => void; onUserMove: () => void }) {
  const { gl, camera, size } = useThree();
  const base = useMemo(() => capitals.map(c => new THREE.Vector3(...latLonToVec3(c.lat, c.lon, 1.012))), [capitals]);
  useEffect(() => {
    const v = new THREE.Vector3(), n = new THREE.Vector3();
    ctl.pick = (x, y, radius) => {
      const rect = gl.domElement.getBoundingClientRect(); let best: string | null = null, bestD = radius;
      for (let i = 0; i < base.length; i++) {
        n.copy(base[i]).applyQuaternion(ctl.quat); v.copy(n).add(ctl.offset);
        // far side: never pickable, tested against the true camera position
        if (!visibleFrom([n.x, n.y, n.z] as Vec3, [v.x, v.y, v.z] as Vec3, [camera.position.x, camera.position.y, camera.position.z] as Vec3, 0.06)) continue;
        v.project(camera);
        const px = (v.x + 1) / 2 * rect.width, py = (1 - v.y) / 2 * rect.height, d = Math.hypot(px - (x - rect.left), py - (y - rect.top));
        if (d < bestD) { bestD = d; best = capitals[i].id; }
      }
      return best;
    };
    ctl.project = id => {
      const i = capitals.findIndex(c => c.id === id); if (i < 0) return null;
      const rect = gl.domElement.getBoundingClientRect();
      n.copy(base[i]).applyQuaternion(ctl.quat); v.copy(n).add(ctl.offset);
      const visible = visibleFrom([n.x, n.y, n.z] as Vec3, [v.x, v.y, v.z] as Vec3, [camera.position.x, camera.position.y, camera.position.z] as Vec3, 0.06);
      v.project(camera);
      return { x: rect.left + (v.x + 1) / 2 * rect.width, y: rect.top + (1 - v.y) / 2 * rect.height, visible };
    };
    return () => { ctl.pick = null; ctl.project = null; };
  }, [ctl, gl, camera, base, capitals, size]);

  useEffect(() => {
    const el = gl.domElement, pts = new Map<number, { x: number; y: number }>();
    let downX = 0, downY = 0, moved = false, samples: { t: number; dx: number; dy: number }[] = [], pinch0 = 0, dist0 = 0, hoverRaf = 0;
    // one globe diameter of drag turns the globe about half a turn, at any zoom or screen size
    const perPx = () => (Math.PI * ctl.dist * TAN_HALF_FOV) / Math.max(240, el.clientHeight) * 0.9;
    const down = (e: PointerEvent) => {
      el.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); dist0 = ctl.targetDist; }
      downX = e.clientX; downY = e.clientY; moved = false; samples = []; ctl.dragging = true; ctl.velYaw = ctl.velPitch = 0;
    };
    const move = (e: PointerEvent) => {
      const prev = pts.get(e.pointerId);
      if (!prev) { // hover
        if (e.pointerType !== "mouse") return; cancelAnimationFrame(hoverRaf);
        hoverRaf = requestAnimationFrame(() => { const id = ctl.pick?.(e.clientX, e.clientY, 18) ?? null; onHover(id, e.clientX, e.clientY); el.style.cursor = id ? "pointer" : "grab"; });
        return;
      }
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2) { const [a, b] = [...pts.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); if (pinch0 > 0) ctl.targetDist = Math.max(ctl.minDist, Math.min(ctl.maxDist, dist0 * pinch0 / d)); moved = true; return; }
      const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
      if (!moved && Math.hypot(e.clientX - downX, e.clientY - downY) < 6) return;
      if (!moved) { moved = true; ctl.anim = null; onUserMove(); onHover(null, 0, 0); }
      const k = perPx(); ctl.yaw += dx * k; ctl.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, ctl.pitch + dy * k));
      const t = performance.now(); samples.push({ t, dx: dx * k, dy: dy * k }); while (samples.length && t - samples[0].t > 90) samples.shift();
    };
    const up = (e: PointerEvent) => {
      const wasTap = !moved && pts.size === 1;
      pts.delete(e.pointerId); if (pts.size) return;
      ctl.dragging = false;
      if (wasTap) { const id = ctl.pick?.(e.clientX, e.clientY, e.pointerType === "mouse" ? 18 : 30); if (id) onSelect(id); return; }
      const t = performance.now(), recent = samples.filter(s => t - s.t < 90);
      if (recent.length >= 2 && !ctl.reducedMotion) { const span = Math.max(16, t - recent[0].t) / 1000; ctl.velYaw = recent.reduce((a, s) => a + s.dx, 0) / span; ctl.velPitch = recent.reduce((a, s) => a + s.dy, 0) / span; }
      const cap = MOTION.maxFlingRadS; ctl.velYaw = Math.max(-cap, Math.min(cap, ctl.velYaw)); ctl.velPitch = Math.max(-cap, Math.min(cap, ctl.velPitch));
    };
    const wheel = (e: WheelEvent) => { e.preventDefault(); ctl.targetDist = Math.max(ctl.minDist, Math.min(ctl.maxDist, ctl.targetDist * Math.exp(e.deltaY * 0.0012))); };
    const leave = () => { onHover(null, 0, 0); };
    el.addEventListener("pointerdown", down); el.addEventListener("pointermove", move); el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
    el.addEventListener("wheel", wheel, { passive: false }); el.addEventListener("pointerleave", leave);
    el.style.touchAction = "none"; el.style.cursor = "grab";
    return () => { el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up); el.removeEventListener("wheel", wheel); el.removeEventListener("pointerleave", leave); cancelAnimationFrame(hoverRaf); };
  }, [gl, ctl, onHover, onSelect, onUserMove]);
  return null;
}

/** Frame loop: focus animation, inertia, idle spin, zoom, and layout offset. */
function Rig({ ctl, group, offset }: { ctl: GlobeController; group: React.RefObject<THREE.Group | null>; offset: [number, number] }) {
  const camera = useThree(s => s.camera);
  const pos = useRef(new THREE.Vector2(0, 0));
  useFrame((_, rawDt) => {
    // clamp only very long gaps (tab switches); slow devices still move in real time
    const dt = Math.min(0.1, rawDt), g = group.current; if (!g) return;
    if (ctl.anim) {
      const a = ctl.anim; a.t = Math.min(1, a.t + dt / Math.max(0.001, a.dur));
      const e = a.t < 0.5 ? 4 * a.t ** 3 : 1 - (-2 * a.t + 2) ** 3 / 2;
      ctl.quat.slerpQuaternions(a.from, a.to, e);
      if (a.t >= 1) { ctl.yaw = a.yaw; ctl.pitch = a.pitch; ctl.anim = null; }
    } else {
      if (!ctl.dragging) {
        ctl.yaw += ctl.velYaw * dt; ctl.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, ctl.pitch + ctl.velPitch * dt));
        const decay = Math.exp(-MOTION.inertiaLambda * dt); ctl.velYaw *= decay; ctl.velPitch *= decay;
        if (Math.abs(ctl.velYaw) < 0.002) ctl.velYaw = 0; if (Math.abs(ctl.velPitch) < 0.002) ctl.velPitch = 0;
        if (ctl.spinEnabled && !ctl.holdSpin && !ctl.reducedMotion && ctl.velYaw === 0) ctl.yaw += MOTION.idleSpinRadS * dt;
      }
      ctl.currentQuat(ctl.quat);
    }
    g.quaternion.copy(ctl.quat);
    ctl.dist += (ctl.targetDist - ctl.dist) * (1 - Math.exp(-dt / 0.18));
    const k = 1 - Math.exp(-dt / 0.35); pos.current.x += (offset[0] - pos.current.x) * k; pos.current.y += (offset[1] - pos.current.y) * k;
    g.position.set(pos.current.x, pos.current.y, 0); ctl.offset.set(pos.current.x, pos.current.y, 0);
    camera.position.set(0, 0, ctl.dist); camera.lookAt(0, 0, 0);
  });
  return null;
}

export type GlobeProps = {
  ctl: GlobeController; capitals: Capital[]; weather: Map<string, CurrentWeather>; metric: Metric; tier: Tier; reducedMotion: boolean;
  hoverId: string | null; selectedId: string | null; compareIds: string[]; offset: [number, number]; base: string;
  onHover: (id: string | null, x: number, y: number) => void; onSelect: (id: string) => void; onUserMove: () => void; onContextLost: () => void;
};

export default function Globe(p: GlobeProps) {
  const group = useRef<THREE.Group>(null);
  const [hidden, setHidden] = useState(typeof document !== "undefined" && document.hidden);
  useEffect(() => { const f = () => setHidden(document.hidden); document.addEventListener("visibilitychange", f); return () => document.removeEventListener("visibilitychange", f); }, []);
  return (
    <Canvas className="globe-canvas" frameloop={hidden ? "never" : "always"} dpr={[1, p.tier === "low" ? 1.6 : 2]}
      camera={{ position: [0, 0, p.ctl.dist], fov: FOV, near: 0.1, far: 80 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => { gl.setClearColor(0x000000, 0); gl.domElement.addEventListener("webglcontextlost", e => { e.preventDefault(); p.onContextLost(); }); document.documentElement.dataset.webgl = "ready"; }}
      aria-hidden="true">
      <Stars />
      <mesh renderOrder={4}><sphereGeometry args={[1.085, 64, 48]} /><shaderMaterial vertexShader={ATMO_VERT} fragmentShader={ATMO_FRAG} transparent depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.BackSide} /></mesh>
      <group ref={group}>
        <mesh renderOrder={0}><sphereGeometry args={[0.994, 96, 64]} /><meshBasicMaterial color="#04060A" /></mesh>
        <LandPoints tier={p.tier} reducedMotion={p.reducedMotion} base={p.base} />
        <CapitalLights capitals={p.capitals} weather={p.weather} metric={p.metric} hoverId={p.hoverId} selectedId={p.selectedId} compareIds={p.compareIds} reducedMotion={p.reducedMotion} />
      </group>
      <Rig ctl={p.ctl} group={group} offset={p.offset} />
      <Interaction ctl={p.ctl} capitals={p.capitals} onHover={p.onHover} onSelect={p.onSelect} onUserMove={p.onUserMove} />
    </Canvas>
  );
}

