# Schema and routes

Types live in `src/lib/contracts.ts` and are shared by the server, the client and the tests. Open-Meteo responses are validated at runtime by Zod (`src/lib/schemas.ts`).

## Routes (`server/routes.ts`)
| Route | Status | Returns |
|---|---|---|
| `GET /api/capitals` | Live | `{ generatedAt, provenance, capitals: Capital[] }` |
| `GET /api/weather/capitals` | Live | `CapitalsWeather`: records with `validAt`, `fetchedAt`, `status` (fresh, stale or unavailable), grid cell, time zone and provenance; plus cache age, mode and a batch summary. 503 only when nothing has ever loaded |
| `GET /api/weather/capital/:id/forecast` | Live | `Forecast`: 72 `HourPoint`s and `DayPoint`s, the time zone, fetchedAt and status; 502 with the error when upstream fails and there is no cached copy |
| `GET /api/cities/:id/profile` | Live (static data) | `CityProfile`: per-feature `DataAvailability`, verified-only claims, actions and opportunities (empty), official warning state |
| `GET /api/cities/:id/history` | Contract | `HistorySeries`, state `not_integrated`, no points |
| `GET /api/cities/:id/exposure` | Contract | `ExposureSummary`, state `not_integrated`, residents `null` |
| `GET /api/cities/:id/response` | Contract | `{ state: "not_integrated", records: [], officialWarning }` |
| `GET /api/cities/:id/opportunities` | Contract | `{ state: "not_integrated", records: [] }` |

## Core types
`EvidenceState`: `verified | provisional | not_integrated | unavailable | withdrawn`.
`TemporalKind`: `current_modelled | forecast | reanalysis | historical_observation | static_estimate | published_document`.
Plus `Provenance`, `Capital`, `CurrentWeather`, `Forecast`, `DataAvailability`, `Claim`, `HeatAction`, `Opportunity`, `Baseline`, `HistorySeries`, `ExposureSummary`, `ReviewState` and `ReviewEvent`, as in the brief's data architecture.

Missing values are `null`, never `0`. Unknown is never rendered as none.

## Adapters (`server/data/adapters.ts`)
`HistoryAdapter`, `ExposureAdapter` and `RegistryAdapter` each have a `not_integrated` implementation today. A real adapter is passed to `createApi({ history, exposure })` without changing routes or UI.
