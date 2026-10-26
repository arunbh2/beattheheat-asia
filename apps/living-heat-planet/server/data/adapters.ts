/**
 * Data adapters for the layers after Release 1. Each has a typed interface and, today, an honest
 * implementation that reports "not_integrated" with an empty payload. A real adapter replaces one
 * of these without changing routes, client or UI.
 *
 * History (Release 2): Open-Meteo Historical Weather API, one reanalysis product (ERA5 or ERA5-Land),
 *   a documented seasonal baseline, precomputed and cached on the server. Never mixed with forecast models.
 * Exposure (Release 2): GHSL GHS-POP / GHS-BUILT-S or WorldPop summaries, precomputed per city for a
 *   stated area (buffer, admin boundary or urban centre) and epoch. No raster ever ships to the browser.
 * Registry (Release 3–4): curated, human-reviewed claims, actions and opportunities, imported from
 *   data/templates/*.csv. Only "published" records with sources reach the public API.
 */
import type { ExposureSummary, HistorySeries, Baseline, ReviewState } from "../../src/lib/contracts.ts";

export interface HistoryAdapter { series(capitalId: string, opts: { baseline: Baseline; from: string; to: string }): Promise<HistorySeries> }
export interface ExposureAdapter { summary(capitalId: string): Promise<ExposureSummary> }
export interface RegistryAdapter<T extends { status: string }> { list(cityId: string): Promise<T[]>; reviewState(id: string): Promise<ReviewState | null> }

export const historyNotIntegrated: HistoryAdapter = {
  async series(capitalId) { return { capitalId, state: "not_integrated", reason: "Historical patterns are planned for Release 2 with one reanalysis product and a documented baseline.", points: [] }; },
};
export const exposureNotIntegrated: ExposureAdapter = {
  async summary(capitalId) { return { capitalId, state: "not_integrated", reason: "Population and built-up layers are planned for Release 2, with their epoch, resolution and area stated.", residents: null, builtUpFraction: null }; },
};
/** The default baseline a Release 2 history adapter will use unless a city case documents another. */
export const DEFAULT_BASELINE: Baseline = { product: "ERA5", periodStart: 1991, periodEnd: 2020, aggregation: "daily_max", seasonWindowDays: 7, sampleCount: 0 };
