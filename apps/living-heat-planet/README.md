# The Living Heat Planet: Release 1

A particle Earth of the world's capitals, lit by their **modelled current air temperature** from Open-Meteo, with a dossier for each capital (now and the next 72 hours) and honest evidence states for the layers still to come: patterns, people, preparedness, solutions and investment.

> Air temperature is not heat risk. The lights show weather at one point per city. They are not warnings, scores or rankings.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173: app plus the real /api proxy (server/routes.ts) via Vite middleware
npm run build        # typecheck (tsc --noEmit) and production build into dist/
npm run preview      # serves dist/ with the same /api proxy
npm run serve        # standalone Node server (server/node.ts): /api and dist/, PORT=8787
npm test             # unit and component tests (Vitest, jsdom)
npm run test:e2e     # browser tests (Playwright + Chromium) against a running static build, see below
npm run data         # rebuild land particles and the capital registry from Natural Earth
```

### Static hosting (BeatTheHeat.Asia on GitHub Pages)
```bash
npx vite build --mode static    # base /living-heat-planet/, browser data mode, written to ../../living-heat-planet/
```
GitHub Pages has no server, so the static build runs the **same** batched, validated Open-Meteo client in the visitor's browser, with a 20-minute cache on the device. Every response says which mode served it ("server" or "browser"), and Methods & data shows it.

Browser tests: serve the repository root (`python3 -m http.server 8765`), then
`BASE_URL=http://localhost:8765/living-heat-planet/ PW=$(npm root -g)/playwright npm run test:e2e`.

### Configuration (`.env.example`)
- `VITE_API_MODE`: `auto` (try `/api`, fall back to the browser), `server` or `browser`.
- `OPEN_METEO_BASE`, `OPEN_METEO_APIKEY`: server only, for a commercial Open-Meteo plan. Keys never reach the browser.

### URL parameters
`?city=npl-kathmandu&tab=next` opens a dossier · `?embed=hero` compact embedded mode · `?quality=low|high` · `?render=2d` forces the 2D view.

## What is in the box
| Path | What it is |
|---|---|
| `src/globe/` | Three.js / React Three Fiber globe: one `Points` for land, one for capital lights, a depth-writing core for occlusion, drag inertia, quaternion focus, screen-space picking of front-facing cities only |
| `src/lib/` | The shared projection (`geo.ts`), colour key, units, time zones, search, typed contracts and Zod schemas |
| `src/weather/` | Open-Meteo client (batching, positional mapping with grid-cell checks, timeouts, backoff, concurrency) and the last-good cache |
| `src/data/` | Capital registry (generated), source register, city profiles with evidence states, the empty curated registry |
| `src/components/` | Dossier, forecast chart, compare, explainer, methods, 2D fallback, controls |
| `server/` | Framework-agnostic API routes, standalone Node server, adapters for future layers |
| `scripts/` | Natural Earth preprocessing (land particles, capital registry and coverage report) |
| `data/templates/` | CSV templates for curated claims, actions and opportunities (start empty) |
| `tests/` | Unit and component tests, the labelled Open-Meteo **test fixture**, browser smoke tests |
| `docs/` | Design, product spec, sources, methodology, schema, coverage, editorial workflow, test report, screenshots |

## Attribution and licences
Weather data by [Open-Meteo.com](https://open-meteo.com/) (CC BY 4.0). The free API is for **non-commercial use**; confirm the licence at [open-meteo.com/en/pricing](https://open-meteo.com/en/pricing) before a public or institutional deployment.
Geography from [Natural Earth](https://www.naturalearthdata.com/) (public domain). Fonts: Inter and Fraunces (SIL Open Font License), bundled through Fontsource.
