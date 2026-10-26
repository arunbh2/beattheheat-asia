# Methodology

## Projection
One transform everywhere (`src/lib/geo.ts`): `x = r·cos φ·sin λ`, `y = r·sin φ`, `z = r·cos φ·cos λ`. Land particles, capital lights, picking and focus all use it. Tested on ten reference cities across hemispheres and across the date line.

## Land particles
Candidates are uniform on the sphere (longitude uniform, sin latitude uniform) and kept when inside Natural Earth 1:50m land (even–odd ray casting over every ring, so lakes are respected). That gives 64,000 points (desktop) or 22,000 (phones). 28.6% of candidates landed on land, matching Earth's land fraction of about 29%. Two documented additions keep small places visible:
1. **Small-landmass top-up:** every land polygon gets at least 4 points (desktop) or 2 (phones), sampled inside it: 4,976 and 2,574 points across about 1,330 polygons.
2. **Capital anchors:** a capital with no particle within 25 km (desktop) or 40 km (phones) gets three points at its own position: 95 and 85 capitals. This covers islands below 1:50m detail, such as atolls.

## Current conditions
Open-Meteo `/v1/forecast` with `current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,is_day`, `timezone=auto` and `timeformat=unixtime`, batched 25 coordinates per request, at most 3 concurrent, with a 9-second timeout.

Each response entry is mapped back by **position**, and only accepted if its grid cell is within 60 km of the request. Otherwise that capital is `unavailable`.

Retries happen only on 429, 5xx and network errors, with exponential backoff (0.6 s, 1.2 s) and jitter.

The cache keeps values fresh for 25 minutes. A failed refresh keeps each capital's last good value for up to 6 hours, labelled **stale** with its original times. Snapshots with failed batches are retried after 5 minutes, not on every request.

## Forecast
Hourly `temperature_2m`, `apparent_temperature`, `relative_humidity_2m`, `is_day` and `weather_code`, with `forecast_hours=72`, plus daily max and min. It is drawn in the city's IANA time zone using `Intl`, so daylight saving follows the zone. No hot-night or heatwave marker is drawn: no locally credible threshold is integrated.

## Colour
Air temperature bands (see DESIGN.md). They are computed in °C, so °F changes labels only. Missing values are grey, never zero. The legend is titled "Air temperature (°C)".

## What is deliberately not computed
No anomaly (there is no baseline yet), no heat-stress index, no exposure count, no risk score, no warning. See "Why temperature is not risk" in the app.
