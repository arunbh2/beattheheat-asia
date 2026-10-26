/**
 * One typed contract shared by the server routes, the browser client and the tests.
 * Mirrors docs/SCHEMA.md. Weather is the only live layer in Release 1; every other layer
 * carries an explicit evidence state and starts empty, never with placeholder values.
 */
export type EvidenceState = "verified" | "provisional" | "not_integrated" | "unavailable" | "withdrawn";
export type TemporalKind = "current_modelled" | "forecast" | "reanalysis" | "historical_observation" | "static_estimate" | "published_document";

export type Provenance = {
  sourceName: string; sourceUrl: string; datasetVersion?: string; licensedUse?: string; spatialResolution?: string;
  temporalKind: TemporalKind; validAt?: string; fetchedAt?: string; publishedAt?: string; verifiedAt?: string;
  methodologyUrl?: string; caveat?: string;
};

export type Capital = {
  id: string; name: string; country: string; isoA3: string | null; neA3: string;
  lat: number; lon: number; capitalRole: string; entityType: string; notes: string[];
};

export type WeatherStatus = "fresh" | "stale" | "unavailable";
export type CurrentWeather = {
  capitalId: string;
  temperatureC: number | null; apparentTemperatureC: number | null; humidityPct: number | null;
  weatherCode: number | null; isDay: boolean | null;
  validAt: string | null;           // model valid time (ISO, UTC)
  fetchedAt: string | null;         // when the value was retrieved from Open-Meteo
  timezone: string | null;          // IANA zone returned by Open-Meteo for the grid cell
  gridLat: number | null; gridLon: number | null; elevationM: number | null;
  status: WeatherStatus;
  provenance: Provenance;
};

export type CapitalsWeather = {
  records: CurrentWeather[];
  fetchedAt: string | null; servedAt: string; cacheAgeSec: number | null;
  mode: "server" | "browser";
  summary: { fresh: number; stale: number; unavailable: number; failedBatches: number; totalBatches: number };
};

export type HourPoint = { t: number; tempC: number | null; apparentC: number | null; humidityPct: number | null; isDay: boolean | null; weatherCode: number | null };
export type DayPoint = { date: string; maxC: number | null; minC: number | null };
export type Forecast = {
  capitalId: string; timezone: string | null; utcOffsetSec: number | null;
  hours: HourPoint[]; days: DayPoint[];
  fetchedAt: string; status: "fresh" | "stale" | "unavailable"; provenance: Provenance; error?: string;
};

export type Feature = "weather" | "forecast" | "history" | "population" | "urban_form" | "warnings" | "institutions" | "interventions" | "finance";
export type DataAvailability = { feature: Feature; state: EvidenceState; reason: string; plannedSources?: { name: string; url: string }[]; lastReviewedAt?: string };

export type Claim = { id: string; cityId: string; claimType: string; statement: string; status: EvidenceState; sourceRefs: Provenance[]; reviewedBy?: string; reviewedAt?: string };
export type HeatAction = {
  id: string; cityId: string; title: string; interventionCategory: string; implementingOrganisation?: string;
  maturity: "idea" | "proposed" | "pilot" | "operational" | "evaluated";
  evidenceStrength: "not_assessed" | "emerging" | "moderate" | "strong"; whoBenefits?: string;
  financingType?: "grant" | "concessional_debt" | "equity" | "guarantee" | "public_budget" | "unknown";
  status: EvidenceState; sources: Provenance[];
};
export type Opportunity = {
  id: string; cityId: string; title: string; owner: string; projectState: "proposed" | "confirmed" | "operational" | "evaluated";
  instrument: "grant" | "concessional_debt" | "equity" | "guarantee" | "public_budget" | "earned_revenue" | "unknown";
  fundingRange?: string; status: EvidenceState; sources: Provenance[]; lastCheckedAt: string; nextCheckAt?: string;
};

export type CityProfile = {
  capital: Capital; availability: DataAvailability[];
  claims: Claim[]; actions: HeatAction[]; opportunities: Opportunity[];
  officialWarning: { state: EvidenceState; message: string };
};

// ---------- Release 2 and later: contracts in place, data not yet integrated ----------

/** A climatological baseline: one reanalysis product, one period, one aggregation, stated explicitly. */
export type Baseline = {
  product: "ERA5" | "ERA5-Land"; periodStart: number; periodEnd: number;   // years, inclusive
  aggregation: "daily_mean" | "daily_max" | "daily_min"; seasonWindowDays: number; // ± days around the date of year
  sampleCount: number;
};
export type HistoryPoint = { date: string; valueC: number | null; baselineC: number | null; anomalyC: number | null };
export type HistorySeries = {
  capitalId: string; state: EvidenceState; reason: string;
  variable?: "temperature_2m_max" | "temperature_2m_min" | "temperature_2m_mean"; baseline?: Baseline;
  thresholdC?: number; thresholdSource?: "user_defined" | "published_local"; // never presented as an official heatwave definition
  points: HistoryPoint[]; provenance?: Provenance;
};

/** Gridded residential population and built-up summaries for a stated area and epoch. Residents ≠ people exposed. */
export type ExposureSummary = {
  capitalId: string; state: EvidenceState; reason: string;
  dataset?: "GHS-POP" | "GHS-BUILT-S" | "WorldPop"; epoch?: number; resolutionM?: number;
  area?: { kind: "buffer_km" | "admin_boundary" | "urban_centre"; value: string; source: Provenance };
  residents?: { estimate: number; uncertainty?: string } | null; builtUpFraction?: number | null;
  provenance?: Provenance;
};

/** Editorial states for curated records (claims, actions, opportunities). Only "published" is shown. */
export type ReviewState = "draft" | "in_review" | "changes_requested" | "approved" | "published" | "withdrawn";
export type ReviewEvent = { at: string; by: string; from: ReviewState; to: ReviewState; note?: string };
