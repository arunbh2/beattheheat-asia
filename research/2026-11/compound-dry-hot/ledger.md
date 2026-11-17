# Ledger: compound dry-hot extremes (Earth System Science Data, 2026)

Source: Aftab, Hagan et al., "The Standardized Soil Moisture-Temperature Compound Index (SSTCI): daily scale global data set and event catalogue for compound dry-hot extremes (1961-2023)", Earth System Science Data 18, 7981-8002, published 3 November 2026, CC BY 4.0, doi 10.5194/essd-18-7981-2026. The owner supplied the PDF; the check reads the publisher's open PDF. Batch: `data/inbox/2026-11-compound-dry-hot/`.

## What it is
A daily, global (0.1 degree) estimate of soil moisture and temperature extremes occurring together, 1961-2023, built from reanalysis (ERA5-Land soil moisture, ERA5 maximum temperature), with an event catalogue. Open data on Zenodo (doi 10.5281/zenodo.18280747 and 10.5281/zenodo.20826759). Estimates, not measurements.

## Used (claims.json, applied to the map's "Drying soils" consequence only)
- `c-together`: compound dry-hot events more frequent in 2000-2023 than 1961-1999 in hotspot regions; joint occurrence rises faster than the two drivers alone would imply (a statistical dependence, not a cause).
- `c-yangtze`: Yangtze River Basin (China, outside the site's region, labelled as China): median event count per grid cell 10 in 1961-1999, 21 in 2000-2023. The paper's own numbers, printed with their periods; no rate computed here.
- `c-limit`: reanalysis, and no explicit irrigation scheme.

## Held back, and why
- **Maritime Southeast Asia's long soil-moisture memory** (dry-down timescale near 20 days): accurate but of little use to readers, and easy to misread as higher risk.
- **No result for South or Southeast Asia.** Searched: the full text for country and region names in South and Southeast Asia. The six hotspot regions are the authors' chosen examples (Southern Great Plains, Southwestern Europe, Yangtze River Basin, Amazon Basin, South Africa, Northeast Australia); absence from the list is not evidence of lower risk.
- **Longer events since 2000:** strongest in northern Eurasia and high-latitude North America, outside the region; not used.
- **Irrigated plains:** the paper does not name South Asia, so the site says only that the data set leaves out irrigation.
- **Heat Tool Finder:** a large global data set for analysts; adding it is the owner's decision, through `research/2026-11/heat-tools/apply.js`.
- Not placed on "Droughts" or "Failing harvests": the paper studies neither evaporation nor crops.
