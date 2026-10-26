/** Runtime validation of Open-Meteo responses (https://open-meteo.com/en/docs). Unknown fields are allowed. */
import { z } from "zod";

const num = z.number().nullable().optional();
export const OMCurrent = z.object({
  latitude: z.number(), longitude: z.number(), elevation: z.number().optional(),
  timezone: z.string().optional(), utc_offset_seconds: z.number().optional(),
  current: z.object({
    time: z.number(), interval: z.number().optional(),
    temperature_2m: num, apparent_temperature: num, relative_humidity_2m: num, weather_code: num, is_day: num,
  }),
});
export type OMCurrent = z.infer<typeof OMCurrent>;
/** A single location returns an object; several return an array in request order. */
export const OMCurrentBatch = z.union([z.array(OMCurrent), OMCurrent]).transform(v => (Array.isArray(v) ? v : [v]));

const series = z.array(z.number().nullable());
export const OMForecast = z.object({
  latitude: z.number(), longitude: z.number(), timezone: z.string().optional(), utc_offset_seconds: z.number().optional(),
  hourly: z.object({ time: z.array(z.number()), temperature_2m: series, apparent_temperature: series, relative_humidity_2m: series, is_day: series.optional(), weather_code: series.optional() }),
  daily: z.object({ time: z.array(z.number()), temperature_2m_max: series, temperature_2m_min: series }).optional(),
});
export type OMForecast = z.infer<typeof OMForecast>;
