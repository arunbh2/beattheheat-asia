# Test report (Release 1)

Executed on 2026-10-26, on a cloud build machine: 4 CPU cores, **no GPU**, outbound access to `api.open-meteo.com` **blocked by the network policy**. Only checks that were actually run are listed.

## Summary
| Check | Command | Result |
|---|---|---|
| TypeScript strict | `npx tsc --noEmit` | **0 errors** |
| Production build | `npm run build` / `vite build --mode static` | **Built, no warnings.** Renderer chunk 552 KB (148 KB gzip), app chunk 812 KB (232 KB gzip), land data 277 KB / 99 KB |
| Unit and component tests | `npm test` (Vitest 5, jsdom) | **109 / 109 passed** in 5 files |
| Browser smoke tests | `npm run test:e2e` (Playwright, Chromium with SwiftShader) | **41 / 41 passed** |
| Server proxy, upstream really unreachable | `vite preview`, then curl `/api/*` | All 9 batches failed and all 207 capitals `unavailable` with null values; forecast 502 with the real error; profile and stub routes 200 |
| Live Open-Meteo values | — | **Not verified here.** The host is blocked from this machine. See "Live data" below |

## What the unit tests cover
- **Projection (60 checks):** axes; round trip and hemisphere signs for Singapore, New Delhi, Dhaka, Kathmandu, Tokyo, Nairobi, London, Washington DC, Brasília and Canberra; no seam at the date line; focus brings each city to the centre, north up; far-side visibility (Washington hidden when Kathmandu faces the viewer).
- **Land data:** the point counts; land near each reference city; no land in the mid-Pacific, mid-Atlantic, southern Indian Ocean or Tasman Sea; Sri Lanka, Singapore, Malta, Bahrain, Mauritius, Tonga and the Maldives visible; even sampling by area, so the poles are not over-filled.
- **Colour key:** the title is "Air temperature (°C)" and never risk; band edges, including below zero; blending; missing values grey, not 0°C; °F changes labels, not categories.
- **Open-Meteo client:**
  - Request format.
  - Positional mapping for array and single-object responses.
  - Wrong location counts rejected; a grid-cell mismatch makes that capital unavailable.
  - Negatives, zero and null kept honestly; an unexpected response shape rejected.
  - 9 batches of up to 25; one failed batch leaves 25 unavailable and the rest live.
  - A 429 retried, then successful; no retry on a 400; full outage gives every capital unavailable.
  - The 72-hour forecast shape.
- **Cache:** last good value served as stale with its original times; dropped after 6 hours; TTL respected; concurrent callers share one refresh.
- **Registry and evidence states:** unique IDs and valid coordinates; demo cities present at the right places; source version recorded; South Africa's three roles labelled; search ignores accents and handles partial names; only weather and forecast integrated; no invented warning, record, score or zero.
- **API routes:** status codes, stubs that return `not_integrated`, unavailable values when upstream is down, and caching through the proxy.
- **Components:** the legend wording; the dossier shows "Current data unavailable" and no number; live values with source; the honest empty states on Preparedness, Solutions and Investment; Patterns and People not integrated, with their planned sources; arrow-key tabs.

## Browser checks (Chromium, static build in browser mode)
Data in these checks comes from the **labelled test fixture** `tests/fixtures/openMeteoFixture.mjs`, which intercepts `api.open-meteo.com`. Its values are deterministic functions of latitude and longitude, not weather. Failure checks use real aborts and HTTP errors.

| Result | Check |
|---|---|
| Pass | land particles render from Natural Earth data |
| Pass | capitals fetched in batches of at most 25 (9 requests) |
| Pass | status chip reports live capitals (Live · 207/207 capitals · just now) |
| Pass | globe spins slowly when idle |
| Pass | search focuses Kathmandu and opens its dossier |
| Pass | the globe turns Kathmandu to face the viewer (projected 450,450; globe offset -0.58) |
| Pass | spin pauses while a dossier is open |
| Pass | Now shows the exact upstream value and its source (15°C) |
| Pass | no invented official warning |
| Pass | 72-hour forecast plots 72 hourly points |
| Pass | patterns tab shows its evidence state without fake metrics |
| Pass | people tab shows its evidence state without fake metrics |
| Pass | preparedness tab shows its evidence state without fake metrics |
| Pass | solutions tab shows its evidence state without fake metrics |
| Pass | investment tab shows its evidence state without fake metrics |
| Pass | °F changes the numbers shown (58°F) |
| Pass | compare shows four capitals, explicitly not a risk ranking |
| Pass | methods panel lists sources and the licence note |
| Pass | explainer is substantive |
| Pass | Escape closes the dossier |
| Pass | no page errors on the desktop journey |
| Pass | a far-side capital is reported hidden |
| Pass | clicking where a far-side capital projects does not select it |
| Pass | tapping a visible capital selects it |
| Pass | a 3 px jitter counts as a tap, not a drag |
| Pass | a fling keeps spinning, slows, and comes to rest (4.50 → 1.25 → rest: true) |
| Pass | reduced motion: no idle spin |
| Pass | reduced motion: controls say motion is paused |
| Pass | mobile-390: no horizontal overflow and controls do not overlap |
| Pass | mobile: dossier opens as a bottom drawer within the screen ({"top":303.84375,"bottom":844,"h":844}) |
| Pass | tablet-768: no horizontal overflow and controls do not overlap |
| Pass | desktop-1440b: no horizontal overflow and controls do not overlap |
| Pass | upstream down: globe still renders and says Current data unavailable |
| Pass | upstream down: dossier shows no temperature |
| Pass | upstream down: forecast says unavailable, not guessed |
| Pass | no page errors when upstream is down |
| Pass | a 429 is retried with backoff and the data arrives (Live · 207/207 capitals · just now) |
| Pass | one failed batch leaves 25 capitals unavailable and the rest live (Live · 182/207 capitals · just now) |
| Pass | without WebGL: 2D map and full capital table |
| Pass | embed mode hides the page title and links to the full planet |
| Pass | skip link moves keyboard focus to the controls |

Screenshots in `docs/screenshots/` were captured from these runs. **The temperatures and colours in them come from the fixture, not real weather.**

## Performance (measured, software rendering)
Chromium on SwiftShader: WebGL drawn on the CPU, with no GPU available. These are a lower bound, not device measurements.

| Viewport | Quality | Particles | Frames/s | 95th-percentile frame | JS heap |
|---|---|---|---|---|---|
| 1440×900 | high | 69,261 | 11.3 | 250 ms | 12.8 MB |
| 1440×900 | low | 24,829 | 15.0 | 117 ms | 12.1 MB |
| 390×844 | low (phone tier) | 24,829 | 22.3 | 83 ms | 10.1 MB |

The heap stays flat at about 12 MB: there are no per-frame allocations, and land and lights are two draw calls. **Not yet done:** profiling on real phones and laptops with GPUs; a low-power toggle beyond the automatic tier.

## Live data: how to verify
From a machine with internet access, open the app (`npm run dev`, or the deployed `/living-heat-planet/`) and check:
1. The status chip says "Live · N/207".
2. Kathmandu, Dhaka, New Delhi, Bangkok, Singapore, Tokyo, London and Washington DC show values matching `https://api.open-meteo.com/v1/forecast?latitude=<lat>&longitude=<lon>&current=temperature_2m` for the same hour.
3. The model time in each dossier matches `current.time` in that response.

## Defects found and fixed during testing
- **Small island states had no particles.** Singapore, Malta, the Maldives, Bahrain and Tonga were invisible. Added a minimum per landmass and capital anchors.
- **The open dossier covered the desktop toolbar,** so °C/°F, pause and reset couldn't be clicked. The controls now move clear of the panel.
- **Frame-time clamping slowed motion on slow devices.** The clamp was raised from 50 ms to 100 ms.
- **The dossier's tab row could be squashed** in short containers. The header and tabs no longer shrink.
- **Capital lights were too dim** to stand out from land; their size and halo were increased. Unavailable lights were near-invisible; their grey was brightened.
- **The status chip wrapped on phones.**
- **The globe renderer was not code-split.** The controller was moved out of the renderer module.

## Known limitations
- Live Open-Meteo responses were not observed from this machine (network policy).
- The server cache is in-memory, per instance; production hosting should use shared KV.
- Screen-reader testing was by structure and roles only; no assistive-technology session has been run.
- The capital list follows Natural Earth 5.2.0-pre with the documented rules; naming and status labels are the source's.
