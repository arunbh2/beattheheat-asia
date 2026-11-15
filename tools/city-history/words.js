// Common Shade: the words of "Heat over time" on city pages, shared by the page (tools/build-static.js), its Markdown twin
// and llms-full.txt. The caveat lines follow an independent review of the method (see tools/city-history/run.js).
"use strict";
module.exports = {
  title: (a, b) => `Heat over time, ${a} to ${b}`,
  lede: "How this city's heat has changed against its own past, year by year: nights and days hotter than this place's hottest tenth since the record began, and the hottest day of each year.",
  measures: {
    warm_nights: { name: "Warm nights", what: t => `nights warmer than ${t} °C, the warmest tenth of nights here`, unit: "nights a year", per: "more nights a decade", less: "fewer nights a decade" },
    hot_days: { name: "Hot days", what: t => `days hotter than ${t} °C, the hottest tenth of days here`, unit: "days a year", per: "more days a decade", less: "fewer days a decade" },
    hottest: { name: "Hottest day of the year", what: () => "the highest daily maximum recorded in each year", unit: "°C", per: "°C warmer a decade", less: "°C cooler a decade" }
  },
  station: (n, v, of, km, airport) => `From the daily record of the ${n} weather station${km != null ? `, ${airport ? "an airport " : ""}about ${km} km from the city centre` : ""}, as summarised by NOAA from the station's own reports (${v} of ${of} years complete enough to count; the rest are left out as gaps).`,
  changed: (y, step) => `no trend shown: the station's record shifts by about ${Math.abs(step).toFixed(1)} °C against the regional model from ${y}, which points to a change at the station (a move, new instruments or a change in reporting) rather than in the weather.`,
  humidity: "Humidity is not included, so these figures show temperature alone; in humid cities the heat felt in the body can rise even where temperature changes little.",
  caveat: "A single station shows how one site has changed against its own past. Each count is measured against this station's own record, so it is not a comparison between cities, and the station may sit at an airport or in open ground, so streets nearby can be hotter.",
  background: "The model reconstruction for the surrounding region (ERA5-Land, which has no buildings or paved ground and so leaves out the city's own heat)",
  none: "No checked station record found yet for this city. The model reconstruction alone leaves out the built-up city, so no trend is shown.",
  enso: "Strong El Niño years, such as 2016 and 2023 to 2024, bring hotter years in much of the region, and warm years near the end of a record tilt a trend upward.",
  method: "Trend: Sen's slope with its 95% range, and a Mann-Kendall test: \"a clear rise\" where the test is under 5%, \"leaning upward, not clear\" between 5% and 20%, otherwise \"no clear change\". Index definitions follow the ETCCDI (TN90p, TX90p, TXx), counted against this city's whole record. A change at the station is checked by comparing its yearly mean maximum and minimum with the regional model: where one step (Pettitt's test under 5%, at least 0.5 °C) fits the difference clearly better than a steady drift, the trend for that measure is not shown.",
  table: "The figures year by year"
};
