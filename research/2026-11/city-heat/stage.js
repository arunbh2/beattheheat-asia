#!/usr/bin/env node
// Stages the sources for the city heat briefing (research/2026-11/city-heat/BUILD_BRIEF.md) for checking.
// Each record carries the terms its page has to hold; .github/workflows/verify-sources.yml with month
// 2026-11-city-heat opens every link on GitHub and fills link-check.json and _excerpts.json. Only sources that pass
// with every term found are cited on the site.
"use strict";
const fs = require("fs"), path = require("path");
const OUT = path.join(__dirname, "..", "..", "..", "data", "inbox", "2026-11-city-heat");
const S = (id, step, title, publisher, year, url, expect, kind = "Method") => ({ id: "ch-" + id, type: "source", step, title, publisher, year, url, kind, expect,
  note: "Staged for the city heat briefing to check the page opens and holds these terms before the site uses it. Not published from the inbox." });
const R = [
  // step 1: the heat-stress estimate (WBGT) and the data it is calculated from
  S("bom-wbgt", 1, "Thermal comfort observations: about the approximation to the WBGT", "Australian Bureau of Meteorology", 2010, "http://www.bom.gov.au/info/thermal_stress/", ["0.567", "0.393", "3.94", "6.105", "17.27", "237.7"]),
  S("bom-wbgt-light-wind", 1, "Thermal comfort observations: the approximation's assumptions", "Australian Bureau of Meteorology", 2010, "http://www.bom.gov.au/info/thermal_stress/#approximation", ["light wind", "radiation"]),
  S("lemke-2012", 1, "Calculating workplace WBGT from meteorological data: a tool for climate change assessment", "Industrial Health (Lemke and Kjellstrom)", 2012, "https://www.jstage.jst.go.jp/article/indhealth/50/4/50_MS1352/_pdf", ["Bureau of Meteorology", "WBGT"], "Study"),
  S("lemke-2012-pubmed", 1, "Calculating workplace WBGT from meteorological data: a tool for climate change assessment (PubMed record)", "Industrial Health (Lemke and Kjellstrom)", 2012, "https://pubmed.ncbi.nlm.nih.gov/22673363/", ["WBGT", "meteorological"], "Study"),
  S("om-docs", 1, "Weather forecast API documentation", "Open-Meteo", 2026, "https://open-meteo.com/en/docs", ["relative_humidity_2m", "temperature_2m", "hourly"], "Data documentation"),
  S("om-sample", 1, "Weather forecast API: hourly temperature and humidity for Singapore and Bangkok", "Open-Meteo", 2026, "https://api.open-meteo.com/v1/forecast?latitude=1.35,13.75&longitude=103.82,100.5&current=temperature_2m,relative_humidity_2m&hourly=temperature_2m,relative_humidity_2m&timezone=auto&forecast_days=4", ["relative_humidity_2m", "utc_offset_seconds"], "Data sample"),
  S("sg-wbgt-sample", 1, "Real-time wet-bulb globe temperature, Singapore", "National Environment Agency via data.gov.sg", 2026, "https://api-open.data.gov.sg/v2/real-time/api/weather?api=wbgt", ["wbgt", "heatStress"], "Data sample"),
  // step 2, batch A (Kolkata leads): heat plan status, warning service and one checked fact per cycle, for each city
  S("kol-wb-hap", 2, "Action plan on heat wave, West Bengal, 2023", "Department of Disaster Management and Civil Defence, West Bengal", 2023, "https://heathealth.info/wp-content/uploads/Action-plan-heat-Wave-West-Bengal-.pdf", ["Heat Wave", "Municipal"], "Plan"),
  S("kol-kcap", 2, "Kolkata Climate Action Plan (KCAP) released for stakeholder consultation", "Climate Action Network South Asia", 2025, "https://cansouthasia.net/kolkata-climate-action-plan-kcap-released-for-stakeholder-consultation/", ["Heat Action Plan", "Kolkata Climate Action Plan"], "News report"),
  S("kol-cse-2022", 2, "Urban heat stress: Kolkata", "Centre for Science and Environment", 2022, "https://www.cseindia.org/urban-heat-stress-Kolkata.pdf", ["Kolkata", "humidity", "heat index"], "Report or study"),
  S("kol-cse-tracker", 2, "Urban heat stress tracker: Kolkata", "Centre for Science and Environment", 2024, "https://cseindia.org/content/downloadreports/12195", ["Kolkata", "night"], "Report or study"),
  S("kol-mongabay", 2, "Health effects of heat stress will intensify disproportionately without ambitious efforts", "Mongabay India", 2022, "https://india.mongabay.com/2022/09/health-effects-of-heat-stress-will-intensify-disproportionately-without-ambitious-efforts/", ["Kolkata", "Chennai", "discomfort"], "News report"),
  S("kol-aidmi", 2, "Informal workers and rising heat in Kolkata", "All India Disaster Mitigation Institute", 2026, "https://aidmi.org/?p=5718", ["Kolkata", "informal"], "Report or study"),
  S("che-tn-hap", 2, "As summer approaches, Tamil Nadu readies heatwave action plan to prevent deaths", "DT Next", 2026, "https://www.dtnext.in/news/tamilnadu/as-summer-approaches-tamil-nadu-readies-heatwave-action-plan-to-prevent-deaths-823240", ["heat", "Chennai"], "News report"),
  S("che-ceew", 2, "GCC partners with CEEW to boost city's extreme heat resilience", "DT Next", 2025, "https://www.dtnext.in/amp/story/news/chennai/gcc-partners-with-ceew-to-boost-citys-extreme-heat-resilience", ["CEEW", "ward"], "News report"),
  S("che-humid", 2, "Rising humidity is dangerous, and it's making India's hot summers worse", "Scroll", 2025, "https://scroll.in/article/1082029/rising-humidity-is-dangerous-and-its-making-indias-hot-summers-worse", ["Chennai", "6.3"], "News report"),
  S("che-night", 2, "New study sheds light on indoor night-time heat retention in Indian homes", "Down To Earth", 2026, "https://www.downtoearth.org.in/climate-change/new-study-sheds-light-on-indoor-nighttime-heat-retention-in-indian-homes", ["Chennai", "34"], "News report"),
  S("che-wards", 2, "How Chennai is racing to build heatstroke wards as temperature soars", "The South First", 2026, "https://thesouthfirst.com/health/how-chennai-is-racing-to-build-heatstroke-wards-as-temperature-soars/", ["heatstroke", "Chennai"], "News report"),
  S("che-workers", 2, "Work slows but survival cannot: extreme heat drives Tamil Nadu's outdoor labourers to the brink", "The South First", 2026, "https://thesouthfirst.com/tamilnadu/work-slows-but-survival-cannot-extreme-heat-drives-tamil-nadus-outdoor-labourers-to-brink/", ["90.3", "wage"], "News report"),
  S("hyd-coolroof", 2, "Telangana adopts cool roof policy to reduce heat stress in buildings", "Deccan Herald", 2023, "https://www.deccanherald.com/india/telangana-adopts-cool-roof-policy-to-reduce-heat-stress-in-buildings-1206440.html", ["Cool Roof", "Hyderabad"], "News report"),
  S("hyd-nrdc", 2, "Hyderabad promotes cool roofs to protect citizens from extreme heat", "Natural Resources Defense Council", 2017, "https://www.nrdc.org/press-releases/hyderabad-promotes-cool-roofs-protect-citizens-extreme-heat", ["Hyderabad", "cool roof"], "Press release"),
  S("hyd-ts-hap", 2, "Telangana rolls out Heatwave Action Plan 2025", "The Hans India", 2025, "https://www.thehansindia.com/telangana/telangana-rolls-out-heatwave-action-plan-2025-967782", ["Heatwave Action Plan", "2025"], "News report"),
  S("hyd-ghmc", 2, "GHMC rolls out summer heatwave plan", "Deccan Chronicle", 2025, "https://www.deccanchronicle.com/southern-states/telangana/ghmc-rolls-out-summer-heatwave-plan-1952197", ["GHMC", "40"], "News report"),
  S("hyd-2026", 2, "Telangana rolls out heatwave action plan: schools to implement water bells, cooling centres set up", "Telangana Today", 2026, "https://telanganatoday.com/telangana-rolls-out-heatwave-action-plan-schools-to-implement-water-bells-cooling-centres-set-up", ["cooling centres", "Hyderabad"], "News report"),
  S("blr-cm", 2, "Bengaluru failed to beat the heat: why ward-level action plans are urgent", "Citizen Matters", 2025, "https://citizenmatters.in/bengaluru-failed-to-beat-the-heat-how-localised-approach-could-help-in-the-future/", ["heat action plan", "ward"], "News report"),
  S("blr-dh", 2, "Plans sans action: heatwaves bake unprepared India", "Deccan Herald", 2025, "https://www.deccanherald.com/india/karnataka/plans-sans-action-heatwaves-bake-unprepared-india-3448166", ["Karnataka", "2013"], "News report"),
  S("blr-dte", 2, "Beyond the thermometer: Bengaluru's race to modernise ignored climate", "Down To Earth", 2025, "https://www.downtoearth.org.in/climate-change/beyond-the-thermometer-bengalurus-race-to-modernise-ignored-climate-now-its-residents-are-paying-the-price", ["Bengaluru", "lakes"], "News report"),
  S("blr-cse", 2, "Urban heat stress tracker: Bengaluru", "Centre for Science and Environment", 2024, "https://www.cseindia.org/urban-heat-stress-tracker-bengaluru-12197", ["Bengaluru", "heat"], "Report or study"),
  S("bbs-week", 2, "First integrated heat and cooling action plan for Bhubaneswar released", "The Week (PTI)", 2025, "https://www.theweek.in/wire-updates/national/2025/09/02/ces10-od-heat-action-plan.html", ["Integrated Heat and Cooling Action Plan", "Bhubaneswar"], "News report"),
  S("bbs-otv", 2, "Bhubaneswar to face extreme heat, sevenfold rise in AC demand by 2050: BMC unveils action plan", "OdishaTV", 2025, "https://odishatv.in/news/odisha/bhubaneswar-to-face-extreme-heat-sevenfold-rise-in-ac-demand-by-2050-bmc-unveils-action-plan-271303", ["sevenfold", "2050"], "News report"),
  S("bbs-post", 2, "First integrated heat and cooling action plan for Bhubaneswar released", "Orissa Post", 2025, "https://www.orissapost.com/first-integrated-heat-and-cooling-action-plan-for-bhubaneswar-released/", ["iFOREST", "Bhubaneswar"], "News report"),
  S("bbs-2020", 2, "Heat wave action plan, Bhubaneswar city", "Bhubaneswar Municipal Corporation", 2020, "https://heathealth.info/wp-content/uploads/Bhubaneswar-Heat-Action-Plan.pdf", ["Bhubaneswar", "Heat"], "Plan"),
  S("bbs-sambad", 2, "Odisha: BMC readying action plan to tackle heatwave", "Sambad English", 2025, "https://sambadenglish.com/odisha-bmc-readying-action-plan-to-tackle-heatwave", ["BMC", "heat"], "News report"),
  S("imd-heat", 2, "Heat wave warnings", "India Meteorological Department", 2026, "https://mausam.imd.gov.in/", ["India Meteorological Department"], "Government page"),
];
const ids = new Set(); for (const r of R) { if (ids.has(r.id)) throw new Error("duplicate id " + r.id); ids.add(r.id); }
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "sources.json"), JSON.stringify(R, null, 1) + "\n");
fs.writeFileSync(path.join(OUT, "README.md"), "# City heat briefing, November 2026: sources to check\n\nStaged by research/2026-11/city-heat/stage.js. Run .github/workflows/verify-sources.yml with `2026-11-city-heat`; it fills link-check.json and _excerpts.json. Only sources that open with every expected term found are cited. Not merged into the monthly knowledge base.\n");
console.log(`staged ${R.length} sources`);
