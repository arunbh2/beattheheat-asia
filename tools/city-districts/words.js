// Common Shade: the words of the district picture and the city heat briefing, shared by the city pages
// (tools/build-static.js), their Markdown twins and llms-full.txt, and city-heat/districts.js (through window.CITY_DISTRICTS).
"use strict";
module.exports = {
  title: "Inside the city: districts side by side",
  lede: "Where many people, and many older people, live with little green space, much built-up ground and few health facilities nearby. Each measure sits beside the others, marked above or below the city's middle district; nothing is ranked or scored, and the table can be sorted by any column.",
  open: n => `Show the ${n} districts`,
  noJs: "The table needs JavaScript. The figures are in the data file:",
  cols: [["name", "District"], ["residents", "Residents (estimate)"], ["older_pct", "Aged 65 and over"], ["hospitals", "Hospitals"], ["clinics", "Clinics"], ["built_pct", "Built-up ground"], ["park_pct", "Park area"]],
  above: "above the middle district", below: "below the middle district",
  limits: [
    "Residents and ages are modelled estimates from WorldPop, not counts, and will differ from registration figures. Age shares are spread from larger census areas, so neighbouring districts can look alike; they are rounded to whole numbers.",
    "Hospitals, clinics and parks are what OpenStreetMap volunteers have mapped so far, not everything that exists. Parks are shown as a share of each district's area, so one large park and one pocket park are not counted alike.",
    "Built-up ground is the share of land mapped as built-up in ESA WorldCover (2021, 10 m), built from Copernicus Sentinel satellite data.",
    "Figures use the district outlines named below and grids of about 100 m and 50 m, so small districts carry more error.",
    "Today's heat-stress estimate above is for the city as a whole: the weather model's grid is wider than a district, so no district-level daily heat is shown."
  ],
  briefTitle: "What heat costs here, and what could be done",
  cost: "What a checked study says heat costs here",
  noCost: "No checked estimate found yet for this city.",
  options: "What could be done",
  optionsLede: "Actions that break the vicious cycles tied to this city, grouped by how soon they could act. Options, not instructions; each links to its evidence and to any side effects to watch for.",
  when: { season: "This hot season", years: "Over the next few years", decade: "Over a decade" },
  watch: "Watch for side effects"
};
