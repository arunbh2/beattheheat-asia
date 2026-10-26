/**
 * Builds a city profile: what this platform holds about a capital, layer by layer.
 * Release 1 integrates weather only. Every other layer is explicitly "not_integrated", and the
 * curated registries start empty. "No verified record in the platform" never means "none exists".
 */
import type { Capital, CityProfile, DataAvailability } from "../lib/contracts.ts";
import registry from "./registry.json" with { type: "json" };

export const NO_RECORD = "No verified record in the platform.";
export const NOT_A_FINDING = "This means the platform holds no reviewed record yet. It is not a finding that none exists.";

export function availabilityFor(): DataAvailability[] {
  return [
    { feature: "weather", state: "verified", reason: "Live modelled current conditions from Open-Meteo, cached for 25 minutes." },
    { feature: "forecast", state: "verified", reason: "Live 72-hour hourly model forecast from Open-Meteo." },
    { feature: "history", state: "not_integrated", reason: "Historical patterns need one consistent reanalysis source and a documented seasonal baseline. Planned for Release 2.",
      plannedSources: [{ name: "Open-Meteo Historical Weather (ERA5 / ERA5-Land)", url: "https://open-meteo.com/en/docs/historical-weather-api" }] },
    { feature: "population", state: "not_integrated", reason: "Residential population layers are planned for Release 2, with their year, resolution and city boundary stated. Residents are not the same as people exposed.",
      plannedSources: [{ name: "GHSL GHS-POP", url: "https://human-settlement.emergency.copernicus.eu/datasets.php" }, { name: "WorldPop", url: "https://hub.worldpop.org/project/categories?id=3" }] },
    { feature: "urban_form", state: "not_integrated", reason: "Built-up surface layers are planned for Release 2.",
      plannedSources: [{ name: "GHSL GHS-BUILT", url: "https://human-settlement.emergency.copernicus.eu/datasets.php" }] },
    { feature: "warnings", state: "not_integrated", reason: "Official warning status not integrated. Warnings come only from the competent national or local authority." },
    { feature: "institutions", state: "not_integrated", reason: NO_RECORD + " Heat action plans, responsible agencies and thresholds are added only after editorial review (Release 3)." },
    { feature: "interventions", state: "not_integrated", reason: NO_RECORD + " Interventions will be recorded with their mechanism, maturity and evidence grade (Release 3)." },
    { feature: "finance", state: "not_integrated", reason: NO_RECORD + " Financing records will carry an owner, status and last check date, and start empty (Release 4)." },
  ];
}

export function buildProfile(capital: Capital): CityProfile {
  const r = registry as { claims: CityProfile["claims"]; actions: CityProfile["actions"]; opportunities: CityProfile["opportunities"] };
  const verifiedOnly = <T extends { cityId: string; status: string }>(list: T[]) => list.filter(x => x.cityId === capital.id && x.status === "verified");
  return {
    capital, availability: availabilityFor(),
    claims: verifiedOnly(r.claims), actions: verifiedOnly(r.actions), opportunities: verifiedOnly(r.opportunities),
    officialWarning: { state: "not_integrated", message: "Official warning status not integrated. For warnings and safety advice, follow your national meteorological or health authority." },
  };
}
