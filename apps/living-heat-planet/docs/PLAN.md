# Plan and decisions (Release 1)

**Starting point:** no existing globe in this repository, so Release 1 is built new in `apps/living-heat-planet/`.

| Decision | Choice | Why |
|---|---|---|
| Stack | Vite 8, React 19.3, TypeScript 5.9 strict, Three.js 0.186, React Three Fiber 9.8, TanStack Query 5, Zod 4, Vitest 5, Playwright | R3F 9 is the line that supports React 19 (peer range ≥19 <19.4). TypeScript 7.0 was newly released; 5.9 kept for tool compatibility. Drei was not needed. |
| Land geometry | Natural Earth 1:50m land, sampled at build time to Int16 lat/lon buffers | Real continents, small files (277 KB / 99 KB), decoded through the one shared projection |
| Capitals | Natural Earth 1:10m Populated Places, with written inclusion rules | Public domain, versioned, with role notes for multi-capital countries |
| Rendering | One `THREE.Points` for land, one for capitals, custom shaders | Two draw calls for ~69,000 points and 207 lights; no per-point React nodes |
| Occlusion | Dark depth-writing sphere at r = 0.994 plus a facing fade in the shaders | Physically correct far-side hiding |
| Picking | Screen-space nearest front-facing capital (18 px mouse, 30 px touch) | Far-side capitals are excluded by a tangent-plane test before projection; larger touch targets than tiny meshes |
| Orientation | Yaw then pitch (north stays up), quaternion slerp for focus | Spec requires quaternion focus and north-up |
| Data path | `/api` proxy when present; the same client in the browser when hosted statically | GitHub Pages has no server; behaviour, validation and labels stay identical |
| Later layers | Typed contracts, routes and adapters return `not_integrated`; curated registry starts empty | Honest empty states, no fixtures that look like data |

## Known gaps (see TEST_REPORT.md)
- Live Open-Meteo responses could not be fetched from the build machine (network policy). Verified in automated tests with a labelled fixture; live behaviour must be confirmed in a browser with internet access.
- Performance measured only on a CPU software renderer; real devices not yet profiled.
- Server cache is in-memory; a shared KV store is needed for multi-instance hosting.
