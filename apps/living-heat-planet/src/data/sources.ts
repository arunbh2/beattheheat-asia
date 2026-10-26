/** The source register shown in Methods & data and mirrored in docs/DATA_SOURCES.md. */
export type Source = { id: string; name: string; url: string; layer: string; status: "integrated" | "planned"; licence: string; note: string };
export const SOURCES: Source[] = [
  { id: "open-meteo-forecast", name: "Open-Meteo Forecast API", url: "https://open-meteo.com/en/docs", layer: "Current modelled conditions and 72-hour forecast", status: "integrated",
    licence: "Data CC BY 4.0. The free API is for non-commercial use; commercial or high-volume deployments need a plan (https://open-meteo.com/en/pricing).",
    note: "Modelled values at the nearest grid cell, refreshed on a 25-minute cache. Not station observations or official warnings." },
  { id: "natural-earth", name: "Natural Earth (1:50m land; 1:10m populated places and Admin-0 countries)", url: "https://www.naturalearthdata.com/", layer: "Land particles and capital points", status: "integrated",
    licence: "Public domain.", note: "Version recorded in src/data/capitals.json. Capital inclusions and exclusions are listed in CAPITALS_COVERAGE.md." },
  { id: "open-meteo-historical", name: "Open-Meteo Historical Weather API (ERA5 / ERA5-Land)", url: "https://open-meteo.com/en/docs/historical-weather-api", layer: "Past and patterns (Release 2)", status: "planned",
    licence: "Check terms and entitlements before integration.", note: "One reanalysis product and a documented seasonal baseline; not mixed with forecast models." },
  { id: "ghsl", name: "European Commission GHSL (GHS-POP, GHS-BUILT)", url: "https://human-settlement.emergency.copernicus.eu/datasets.php", layer: "People and place (Release 2)", status: "planned",
    licence: "Check dataset licence and attribution at integration.", note: "Residential population and built-up estimates for a stated epoch. Residents are not the number of people exposed." },
  { id: "worldpop", name: "WorldPop", url: "https://hub.worldpop.org/project/categories?id=3", layer: "People and place (Release 2, alternative)", status: "planned",
    licence: "Check dataset licence at integration.", note: "Gridded population estimates for a stated year." },
  { id: "who-hhap", name: "WHO Heat–health action plans: guidance (second edition, 2026)", url: "https://www.who.int/kazakhstan/publications/i/item/9789289062930", layer: "Preparedness framing (Release 3)", status: "planned",
    licence: "WHO publication terms.", note: "Framework for describing plans; not a record of any city's plan." },
];
