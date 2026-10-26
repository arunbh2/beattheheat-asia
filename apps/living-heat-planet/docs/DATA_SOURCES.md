# Data sources

| Source | Layer | Status | Licence and terms | Notes |
|---|---|---|---|---|
| [Open-Meteo Forecast API](https://open-meteo.com/en/docs) | Current conditions, 72-hour forecast | **Integrated** | Data CC BY 4.0; free API for non-commercial use, about 10,000 calls a day ([pricing](https://open-meteo.com/en/pricing)) | `best_match` model selection. Modelled values at the nearest grid cell, not station observations or warnings |
| [Natural Earth 1:50m land](https://www.naturalearthdata.com/downloads/50m-physical-vectors/) | Land particles | **Integrated** | Public domain | natural-earth-vector 5.2.0-pre, fetched from the project's GitHub |
| [Natural Earth 1:10m populated places and Admin-0 countries](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/) | Capital points | **Integrated** | Public domain | Rules in CAPITALS_COVERAGE.md |
| [Open-Meteo Historical Weather (ERA5 / ERA5-Land)](https://open-meteo.com/en/docs/historical-weather-api) | Patterns (Release 2) | Planned | Check terms and entitlements | One product, documented baseline |
| [GHSL GHS-POP / GHS-BUILT](https://human-settlement.emergency.copernicus.eu/datasets.php) | People and place (Release 2) | Planned | Check at integration | Epoch, resolution and area stated |
| [WorldPop](https://hub.worldpop.org/project/categories?id=3) | People and place (alternative) | Planned | Check at integration | |
| [WHO Heat–health action plans guidance (2026)](https://www.who.int/kazakhstan/publications/i/item/9789289062930) | Preparedness framing (Release 3) | Planned | WHO terms | A framework, not a record of any city's plan |

## Call budget
Current conditions: 207 capitals in 9 batches of up to 25 coordinates, refreshed at most every 25 minutes per cache.
- **Server mode:** one shared cache, so about 9 requests every 25 minutes in total, plus one forecast per city opened (cached 30 minutes).
- **Browser mode (static hosting):** each visitor's browser caches for 20–25 minutes on the device, so about 9 requests per visitor per window.

Open-Meteo counts multi-location requests per location, so a busy public deployment should use the server mode with a plan sized to its traffic.
