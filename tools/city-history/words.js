// Common Shade: the words of "Heat over time" on city pages, shared by the page (tools/build-static.js), its Markdown twin
// and llms-full.txt. The caveat lines follow an independent review of the method (see tools/city-history/run.js).
"use strict";
module.exports = {
  title: (a, b) => `Heat over time, ${a} to ${b}`,
  lede: "How this city's heat has changed against its own past, year by year: nights and days hotter than this place's hottest tenth since the record began, and the hottest day of each year.",
  measures: {
    warm_nights: { name: "Warm nights", what: t => `nights warmer than ${t} °C, the warmest tenth of nights here`, unit: "nights a year", per: "more nights a decade", less: "fewer nights a decade" },
    hot_days: { name: "Hot days", what: t => `days hotter than ${t} °C, the hottest tenth of days here`, unit: "days a year", per: "more days a decade", less: "fewer days a decade" },
    hottest: { name: "Hottest day of the year", what: () => "the highest daily maximum in each year, smoothed by the model", unit: "°C", per: "°C warmer a decade", less: "°C cooler a decade" }
  },
  caveat: "A modelled estimate for one grid square about 9 km across, not a station measurement. It shows how this place has changed against its own past; it is not a comparison between cities, and streets, especially at night, can be hotter than shown, because the model does not see buildings or paved ground.",
  enso: "Strong El Niño years, such as 2016 and 2023 to 2024, bring hotter years in much of the region, and warm years near the end of a record tilt a trend upward.",
  method: "Trend: Sen's slope with its 95% range, and a Mann-Kendall test: \"a clear rise\" where the test is under 5%, \"leaning upward, not clear\" between 5% and 20%, otherwise \"no clear change\". Index definitions follow the ETCCDI (TN90p, TX90p, TXx), counted against this city's whole record.",
  table: "The figures year by year"
};
