// Common Shade: the words of /el-nino/ ("El Niño and heat in Asia"), shared by the page (tools/build-el-nino-explainer.js),
// its print briefing (/print/el-nino-briefing/), its Markdown twin and llms-full.txt. Every passage names the claims it rests on
// (ids in research/2026-11/enso-asia/claims.json, or the cities batch for the two India studies); the build stops, naming
// the claim, unless it passed the source check. The current outlook is not written here: it comes from the shared record
// (tools/enso-outlook.js), so this page and the El Niño watch on /signals/ always show the same bulletin.
// Voice: no "should" or "must", no em dashes, no individuals named; probabilities always carry their outcome and period.
"use strict";
// the sentences that repeat across the El Niño pages come from the shared record, in one wording (tools/enso-outlook.js)
const EO = require("./enso-outlook.js"), F = EO.facts();
const SLUG = "el-nino";
const TITLE = "El Niño and heat in Asia";
const SUB = "How a change in the Pacific affects rainfall, heat and the choices available to people.";
const DESC = "How El Niño in the Pacific can shift heat and rainfall across South and Southeast Asia, what the current outlook establishes and what it cannot, and which preparations deserve attention locally.";

const TOC = [["start", "An ordinary decision"], ["what", "What El Niño is"], ["asia", "How it reaches Asia"], ["regions", "Five regions"], ["daily", "Through daily life"],
  ["outlook", "Reading the outlook"], ["prepare", "From outlook to preparation"], ["faq", "Questions"]];

const OPENING = {
  label: "Illustrative",
  story: "A municipal team hears on the news that El Niño may last into the coming hot season. Nobody has issued a heat warning for the town, and none will come for months. The team has to decide now what to repair, staff and budget before the first warning arrives.",
  gives: "A seasonal outlook tells the team that the odds in the Pacific favour El Niño for the next few months, and how confident forecasters are. It is a reason to start ordinary preparation early.",
  needs: "It cannot tell the team which week will be hottest, which ward will suffer, or whether the water supply will hold. For that the team needs its national weather service's seasonal outlook for its region, its own records of past summers, and, closer to the time, the official local warning.",
  claims: ["e-wmo-use", "e-wmo-limits"]
};
const SUMMARY = [
  "El Niño is a warming of the central and eastern tropical Pacific, coupled with a shift in winds and rainfall. It is one phase of ENSO, which swings every three to seven years on average.",
  "It can tilt the odds towards drier or hotter conditions in parts of Asia. It does not decide whether a heatwave, drought or flood happens in any one place.",
  "The current bulletin expects El Niño to persist into early 2027 and then weaken. " + F.phase,
  "Effects differ by region and season. India, Bangladesh, Nepal, mainland Southeast Asia, Indonesia and the Philippines each have their own pattern and their own national service.",
  "The useful response is early, ordinary preparation, tied to the official local warning when it comes."
];
const SUMMARY_CLAIMS = ["e-mech-cycle", "e-wmo-limits", "e-noaa-status", "e-noaa-strength"];

const WHAT = [
  { h: "A pattern of ocean and air together", p: ["ENSO, short for El Niño-Southern Oscillation, is a natural pattern in the tropical Pacific that involves both the ocean and the atmosphere. It has three states: El Niño, La Niña and neutral, when conditions are near their long-term average. Its phases swing back and forth every three to seven years on average."], claims: ["e-mech-cycle"] },
  { h: "The usual pattern", p: ["In most years the trade winds blow from east to west across the tropical Pacific. They push warm surface water towards the western Pacific, near Indonesia and the Philippines, where a deep pool of warm water builds up. In the east, off South America, colder water rises from below to replace it, a process called upwelling. Warm water in the west heats the air above it, which rises, forms clouds and brings rain; drier air sinks over the cooler east. This loop of rising and sinking air is called the Walker circulation."], claims: ["e-mech-trades", "e-walker"] },
  { h: "What changes in El Niño", p: ["In El Niño the trade winds weaken. Warm surface water spreads farther east, and the central and eastern Pacific become warmer than average. Upwelling in the east weakens and the boundary between warm surface water and cold deep water, the thermocline, deepens there. The area of rising air and heavy rain shifts towards the central or eastern Pacific, while sinking air, and dryness, increase over Indonesia.", "Ocean and atmosphere reinforce each other: warmer water weakens the winds, and weaker winds let the water warm further. La Niña is roughly the reverse: cooler water strengthens the trade winds and increases upwelling, reinforcing the cooling."], claims: ["e-mech-nino", "e-wmo-coupling", "e-noaa-change", "e-thermo"] },
  { h: "Anomalies and indices", p: ["An anomaly is a departure from a stated reference average. NOAA measures ENSO from sea surface temperature departures in the Niño-3.4 region of the east-central equatorial Pacific (5°N to 5°S, 120°W to 170°W), against a 1991 to 2020 base period. A Pacific sea surface temperature anomaly of +2.5 °C is not a forecast that air temperatures anywhere in Asia will rise by 2.5 °C.", "NOAA now verifies its outlooks with the Relative Oceanic Niño Index (RONI): a three-month running mean of Niño-3.4 anomalies with the average tropical anomaly subtracted, so that warming of the whole tropics does not count as El Niño. El Niño is declared at +0.5 °C or more. The latest RONI values are estimates that can change for up to two months. Other agencies, and many news reports, use the older Oceanic Niño Index or the plain Niño 3.4 anomaly, which can differ; always check which index a figure uses."], claims: ["e-noaa-def", "e-roni-def"] }
];

const SCHEMATIC = {
  note: "Illustrative schematic, not to scale. It shows the broad direction of winds, warm water, upwelling and rainfall, not a forecast.",
  states: {
    neutral: { label: "Neutral", text: "Trade winds blow east to west. Warm water pools in the western Pacific, where air rises and rain falls. Cold water upwells in the east, where drier air sinks." },
    elnino: { label: "El Niño", text: "Trade winds weaken. Warm water spreads east and the thermocline deepens there; upwelling weakens. Rising air and heavy rain shift to the central and eastern Pacific, and sinking, drier air settles over Indonesia." },
    lanina: { label: "La Niña", text: "Trade winds strengthen. Warm water is pushed farther west and deeper; upwelling in the east increases. Rising air and rain strengthen over the western Pacific and Indonesia." }
  },
  claims: ["e-mech-trades", "e-mech-nino", "e-wmo-coupling"]
};

const ASIA = [
  { h: "Connections over distance", p: ["When the area of rising air over the Pacific shifts, the large circulation that links it to the rest of the tropics shifts too. Scientists call these long-distance links teleconnections. In everyday terms, a change in where the Pacific rains can change where air sinks and skies stay clear thousands of kilometres away, including over parts of Asia."], claims: ["e-mech-nino", "e-wmo-coupling", "e-telecon"] },
  { h: "From rain and cloud to heat", p: ["Rainfall and temperature move together in much of the region: Southeast Asia's regional centre describes opposite rainfall, and consequently temperature, conditions in La Niña years to those in El Niño years. Where rain is scarcer than usual, the same season can also run hotter."], claims: ["e-asmc-temp", "e-asmc-typical"] },
  { h: "Season, place and other drivers", p: ["The same El Niño can matter a great deal in one season and little in another. Over Southeast Asia, its drying effect is typically stronger over the southern and eastern parts of the region from June to October, and over most of the Maritime Continent from September to November. India's Ministry of Earth Sciences notes that the Indian Ocean Dipole, the Madden-Julian Oscillation and regional ocean-atmosphere interactions also shape the monsoon. No two El Niño events produce identical impacts, and outcomes depend on the pattern of Pacific warming, the timing and other climate drivers."], claims: ["e-asmc-typical", "e-india", "e-wmo-limits"] },
  { h: "Peak and effects at different times", p: ["An event's peak in the Pacific and its effects in a region need not coincide. This year's El Niño is forecast to peak around the end of 2026, while India's heatwave season runs mainly from April to June. Effects arrive through each region's own seasonal cycle, so there is no single delay that applies everywhere."], claims: ["e-wmo-gscu", "e-wmo-limits", "c-rohini"] }
];

// five regions, each kept to what its own sources show; historical patterns are kept apart from this season's outlook
const REGIONS = [
  { id: "india", name: "India and the South Asian monsoon",
    typical: "El Niño has historically been associated with weaker summer monsoon rainfall over parts of India, but it is not the only influence: the Indian Ocean Dipole and the Madden-Julian Oscillation matter too. In India's records for 1961 to 2013, most years with above-normal heatwave activity in April to June followed El Niño events.",
    typicalClaims: ["e-india", "c-rohini"],
    now: "India's Ministry of Earth Sciences reported in August 2026 that INCOIS assessed El Niño as likely to persist from June 2026 to February 2027, with probabilities of 70 to 90 per cent. IMD's ENSO and IOD bulletin for October 2026 indicates a high likelihood of strong-to-very strong El Niño conditions persisting through January to March 2027, with neutral Indian Ocean Dipole conditions. IMD releases its seasonal outlooks for the hot season between March and May.",
    nowClaims: ["e-india", "u-imd-oct", "c-imd-outlooks"],
    cannot: "An India-wide pattern does not give the outlook for one district or city, and the monsoon relationship does not carry over to all of South Asia.",
    service: ["India Meteorological Department", "https://mausam.imd.gov.in/"],
    question: "Which wards and services had the most heat-related problems in the last hot season, and are their repairs funded before March?" },
  { id: "bdnp", name: "Bangladesh and Nepal",
    typical: "These neighbours do not simply follow India's pattern. Nepal's Department of Hydrology and Meteorology data, as reported, show eight of nine El Niño years with reduced monsoon rainfall, and one with above-average rain. For Bangladesh, this page found no national statement of a typical El Niño relationship; its weather department's monsoon outlook for July to September 2026 expected near-normal rainfall overall, with above-normal temperature across the country.",
    typicalClaims: ["e-np", "e-bd"],
    now: "No current outlook for the 2027 hot season from either service was verified here.",
    nowClaims: [],
    cannot: "A pattern for one country, or one season, does not transfer to its neighbour or to a single district.",
    service: ["Bangladesh Meteorological Department", "https://www.bmd.gov.bd/"], service2: ["Nepal Department of Hydrology and Meteorology", "https://www.dhm.gov.np/"],
    question: "Who receives the national service's heat and rainfall bulletins in our area, and who passes them on to the people most exposed?" },
  { id: "mainland", name: "Mainland Southeast Asia",
    typical: "El Niño typically brings drier-than-average conditions to Southeast Asia, with the effect usually stronger over the southern and eastern parts of the region from June to October, and more pronounced in moderate or strong events.",
    typicalClaims: ["e-asmc-typical"],
    now: "ASMC's seasonal forecast of 5 November 2026 predicts below-normal rainfall over southeastern mainland Southeast Asia for November 2026 to January 2027, and above-normal temperature over the ASEAN region. Towards the end of the year the northern ASEAN region enters its dry season, with a possible rise in hotspots and haze.",
    nowClaims: ["e-asmc-outlook", "e-asmc-haze"],
    cannot: "A regional tercile forecast does not give any one province's rainfall, and the northern and southern parts of the mainland have different seasons.",
    service: ["ASEAN Specialised Meteorological Centre", "https://asmc.asean.org/asmc-seasonal-outlook/"],
    question: "If the dry season runs hotter, which water points, schools and worksites lose water or shade first, and who can fix them?" },
  { id: "maritime", name: "Indonesia and the maritime region",
    typical: "El Niño typically brings drier-than-average rainfall to most of the Maritime Continent from September to November, raising the risk of forest fires and smoke haze. In El Niño, sinking air over Indonesia brings higher pressure and dryness.",
    typicalClaims: ["e-asmc-typical", "e-mech-nino"],
    now: "NOAA's November discussion, and its weekly update of 23 November, note suppressed rainfall persisting over Indonesia. ASMC's forecast predicts below-normal rainfall over parts of the southeastern and northeastern Maritime Continent through January 2027; hotspots with local smoke plumes may still occur where rain stays below normal.",
    nowClaims: ["e-noaa-change", "u-noaa-indonesia", "e-asmc-outlook", "e-asmc-haze"],
    cannot: "Rainfall varies sharply between islands; a regional forecast does not show one island's water supply or fire risk.",
    service: ["BMKG, Indonesia", "https://www.bmkg.go.id/"], service2: ["Meteorological Service Singapore", "https://www.weather.gov.sg/climate-el-la/"],
    question: "Where do smoke and heat arrive together, and do clinics and schools there have a plan for both?" },
  { id: "philippines", name: "The Philippines",
    typical: "PAGASA advises that El Niño increases the likelihood of below-normal rainfall, which may bring dry spells and droughts in some areas, while above-normal rainfall may still occur over the western part of the country during the southwest monsoon (Habagat).",
    typicalClaims: ["e-ph"],
    now: "PAGASA's current monthly outlook was not verified here; check PAGASA's latest El Niño advisory and climate outlook.",
    nowClaims: [],
    cannot: "Rainfall differs between Luzon, the Visayas and Mindanao, and between the archipelago's eastern and western sides.",
    service: ["PAGASA", "https://www.pagasa.dost.gov.ph/"],
    question: "Which barangays relied on water deliveries in past dry spells, and is that arrangement funded for the coming months?" }
];

// consequences through daily life: conditional pathways, each linked to the site's own sourced cycles and actions
const PATHWAYS = [
  { chain: ["Drier conditions", "pressure on water supply", "less reliable water and cooling"], when: "Whether this happens depends on how a town's water is stored and pumped, whether supply depends on electricity or tankers, and who has storage at home.", links: [["/loops/#energywater", "The energy–water loop"], ["/practical-actions/#market-water", "A water point at the market"]] },
  { chain: ["Hotter days", "more demand for cooling", "possible pressure on electricity"], when: "It depends on how much spare capacity the grid has, how much cooling is electric, and whether outages fall on the hottest hours.", links: [["/loops/#energywater", "The energy–water loop"], ["/cooling-options/", "Cooling options"]] },
  { chain: ["Work disrupted by heat", "less income", "less money for protection"], when: "It depends on whether workers can take breaks without losing pay, whether wage support exists, and whether employers adjust hours.", links: [["/actions/#heatrules", "Heat rules at work"], ["/paying-when-heat-strikes/", "Paying when heat strikes"]] },
  { chain: ["Schools or care services close", "care moves into homes", "more unpaid care, and lost earnings for whoever provides it"], when: "It depends on whether closures come with alternatives, and who is expected to stay home.", links: [["/who-is-at-risk/", "Who heat hits hardest"], ["/social-protection/", "Who could help a household"]] },
  { chain: ["Dry vegetation and fires lit by people", "more fire and smoke haze", "heat and smoke together"], when: "Most relevant where land is cleared by burning and where El Niño brings drier months, as in parts of the Maritime Continent.", links: [["/intersections/", "Intersections"]], claims: ["e-asmc-typical", "e-asmc-haze"] }
];
const WHO = "The same dry, hot season lands differently. A street vendor who cannot leave a stall, a construction worker paid by the day, an older person living alone under a tin roof, a person with a disability who cannot reach a cooling space, and a mother who stays home when the school shuts all face the heat with fewer choices than a salaried office worker with a fan and a refrigerator.";
const HOUSEHOLD = { label: "Illustrative", text: "Picture a household in a dense ward: the father does day-labour, the mother sells vegetables, the grandmother has diabetes. If water is cut in the afternoon and the school closes for heat, someone loses a day's earnings to collect water and look after the children, and the grandmother waits longer in the clinic queue. None of this is a forecast; it shows where preparation helps." };

// reading the outlook: four kinds of probability that are easily confused
const READ = [
  { h: "Phase", d: "The chance that ENSO is in El Niño, neutral or La Niña in a given three-month season.", ex: `NOAA (${EO.date(EO.load().O.phase.issued)}): ` + F.phase },
  { h: "Strength", d: "The chance that the Pacific index falls in a strength band. A stronger Pacific event does not necessarily mean stronger local impacts.", ex: `NOAA (${EO.date(EO.load().O.phase.issued)}), ` + F.strength },
  { h: "Seasonal climate", d: "The chance of above- or below-normal rainfall or temperature in a region over a season, from a regional or national service.", ex: "ASMC (5 November 2026): above-normal temperature over the ASEAN region, November 2026 to January 2027." },
  { h: "Local warning", d: "An official warning of heat, rain or storms for a district over the coming days. This is what sets local action moving.", ex: "Issued by the national weather service for your district, as the event approaches." }
];
const READ_CLAIMS = ["e-noaa-prob", "e-noaa-strength", "e-asmc-outlook", "u-asmc-thresh", "u-imd-thresh"];
const UNCERTAINTY = { p: ["Forecasts made in the northern spring are less reliable than at other times of year. Forecasters call this the spring predictability barrier, though it is more a dip in accuracy than a wall. It matters here because the odds for April to June 2027 rest partly on that season: " + F.transition,
  "El Niño sits on top of long-term warming rather than replacing it. Scientists have low confidence in predicting exactly how a warmer world will change ENSO itself. Attributing any single heatwave or flood solely to El Niño needs a study of that event."], claims: ["e-spb", "e-noaa-prob", "e-mech-cycle", "e-noaa-impacts"] };
const DISAGREE = "Bulletins can seem to disagree because they measure different things. NOAA's strength odds use RONI over three-month seasons; WMO's seasonal update forecasts the plain Niño 3.4 anomaly from many models; a weekly value is not a three-month index. Thresholds differ too: NOAA and IMD use ±0.5 °C for El Niño and La Niña, ASMC classifies events at ±0.65 °C and calls those above 1.5 °C strong, and IMD reads the Indian Ocean Dipole on a ±0.4 °C threshold. Read each with its own date, index and period, and never average them.";

// from outlook to preparation, by decision timescale; roles are illustrative unless a local mandate says otherwise
const STEPS = [
  { when: "Months ahead", do: "Review the places people are most exposed; repair existing water points and shade; agree who is responsible for what; prepare staffing and recurrent budgets; agree how an official local warning will set actions moving.", who: "Municipal body with the departments that run water, health and markets; employers; community organisations", confirm: "Who holds the budget and the authority to act, locally" },
  { when: "Weeks ahead", do: "Read the national and regional seasonal outlooks; check supplies and that services are ready; confirm arrangements reach the people most affected, in their languages and formats.", who: "Service operators; health departments; community organisations", confirm: "That messages reach people who cannot read, cannot hear or have no phone" },
  { when: "Days ahead", do: "Follow the official local warning and the agreed procedures for each sector: longer water hours, rest breaks at work, queues moved under cover.", who: "Whoever the local plan names", confirm: "The warning source and who receives it" },
  { when: "During and after", do: "Monitor who could not get water, shade or care; log failures and how fast they were fixed; revise the arrangements using what happened.", who: "Operators, with community organisations reporting what users see", confirm: "Who records failures, and who changes the plan" }
];
const STEPS_NOTE = "Throughout: workers' ability to take breaks, household access to water and cooling, communication people can understand, and continuity of care for those who depend on it.";

// "What decision are you making?": sourced guidance organised by role; it generates no local risk number
const ROLES = [
  { id: "municipality", label: "Municipality", items: ["Pick one public service to protect first, and the sites where people wait or work in the heat.", "Name who authorises, pays for, runs and repairs each measure; they can be different bodies.", "Agree what an official local warning changes: water hours, opening times, staff on duty.", "Check that warnings reach people who cannot read, hear or get online."],
    links: [["/el-nino-and-cities/", "El Niño and India's smaller cities"], ["/print/el-nino-worksheet/", "The one-page worksheet"], ["/plan/", "Plan a response"]] },
  { id: "employer", label: "Employer", items: ["Plan rest breaks, shade and water at work before the hot season, without loss of pay.", "Move the heaviest work away from the hottest hours when a warning is issued.", "Know the signs of heat illness, and who to call.", "Check national rules on heat at work."],
    links: [["/actions/#heatrules", "Heat rules at work"], ["/practical-actions/#work", "Practical actions: workplaces"], ["/heat-tools/", "Find a heat tool"]] },
  { id: "community", label: "Community organisation", items: ["Map who is most exposed: people living alone, outdoor workers, people with disabilities, households without water storage.", "Agree with the municipality how you will report failures and pass on warnings.", "Keep a list of cool, accessible places and their opening hours.", "Plan for care when schools or clinics change hours."],
    links: [["/who-is-at-risk/", "Who heat hits hardest"], ["/practical-actions/#neighbourhoods", "Practical actions: neighbourhoods"], ["/together/", "Make it work together"]] },
  { id: "funder", label: "Funder", items: ["Fund recurrent costs, such as water, staff and repairs, not only installation.", "Release money on agreed triggers, so it arrives before the heat, not after.", "Ask how reach will be counted: sites working out of sites needed, and who was left out.", "Support national services' outlooks reaching local decision-makers."],
    links: [["/paying-for-protection/", "Paying for protection"], ["/practical-actions/#summer-forecast", "Release money on the forecast"], ["/actions/#heatbudget", "Dedicated heat budgets"]] }
];
const ROLE_SERVICES = [["India Meteorological Department", "https://mausam.imd.gov.in/"], ["Bangladesh Meteorological Department", "https://www.bmd.gov.bd/"], ["Nepal DHM", "https://www.dhm.gov.np/"], ["PAGASA", "https://www.pagasa.dost.gov.ph/"], ["BMKG", "https://www.bmkg.go.id/"], ["ASEAN Specialised Meteorological Centre", "https://asmc.asean.org/asmc-seasonal-outlook/"], ["Meteorological Service Singapore", "https://www.weather.gov.sg/climate-el-la/"]];

const FAQ = [
  { q: "Does El Niño mean every place will have a heatwave?", a: "No. El Niño raises or lowers the likelihood of hotter, drier, wetter or cooler conditions in different regions. It does not predict that a particular heatwave will happen anywhere.", claims: ["e-wmo-limits"] },
  { q: "Does a strong El Niño mean severe local impact?", a: "Not necessarily. NOAA states that the strength of El Niño does not necessarily correspond with the strength of its influence or expected impact. Even a very strong event makes typical impacts more likely, not certain.", claims: ["e-noaa-strength", "e-noaa-impacts"] },
  { q: "Does El Niño guarantee drought or a failed monsoon?", a: "No. In India, El Niño has historically been associated with weaker monsoon rain over parts of the country, but other drivers also shape the monsoon. In Nepal, one of nine El Niño years in its national records brought above-average rain.", claims: ["e-india", "e-np"] },
  { q: "Can floods happen during an El Niño?", a: "Yes. An ENSO forecast shifts the odds; it does not rule out heavy rain. In the Philippines, PAGASA notes that above-normal rainfall may still occur over the western part of the country during the southwest monsoon in an El Niño year.", claims: ["e-wmo-limits", "e-ph"] },
  { q: "Does an ENSO-neutral period remove heat risk?", a: "No. Heat depends on the local climate, the season, long-term warming and other drivers such as the Indian Ocean Dipole. NOAA's odds favour neutral conditions by " + EO.load().O.phase.rows.slice(-1)[0].season + ", which is much of India's heatwave season.", claims: ["e-india", "e-noaa-prob", "e-wmo-limits", "c-rohini"] },
  { q: "What does \"super El Niño\" mean?", a: "It is not an official category. NOAA's strength table uses bands in 0.5 °C steps of the RONI index, the highest being 2.0 °C or more (very strong). " + F.historic + " A forecast chance of a historic event is not an observed record. Use the issuing agency's own terms, with their index and period.", claims: ["e-noaa-strength", "e-noaa-historic"] },
  { q: "What local information is worth checking next?", a: "Your national weather service's seasonal outlook for your region, its heat and rainfall warnings for your district, and your own records of what failed in the last hot season. Regional centres such as ASMC add the regional picture.", claims: ["e-asmc-outlook", "e-wmo-use"] }
];

const PRINT_QUESTIONS = ["Which public service will we protect first, and where do people wait or work in the heat?", "Who receives the official local warning, and what does it change?", "Who authorises, pays for, runs and repairs each measure?", "How will we know who could not get water, shade or care?"];

const PROMO = { label: "Explainer", title: TITLE, text: "How a change in the Pacific can shift heat and rainfall across Asia, and how to read the current outlook without mistaking it for a local forecast." };
// a prominent card on country snapshots: opens the explainer at the country's own region tab (one line of words per country)
const COUNTRY_PROMO = {
  india: { region: "india", text: "What El Niño has tended to mean for India's hot season, what the current outlook says, what it cannot tell any district, and where IMD's own outlooks come in." },
  bangladesh: { region: "bdnp", text: "What the current outlook says, why this guide gives no typical El Niño pattern for Bangladesh yet, what the outlook cannot tell any district, and where the Bangladesh Meteorological Department's own outlooks come in." },
  nepal: { region: "bdnp", text: "What El Niño has tended to mean for Nepal's monsoon, as reported from the Department of Hydrology and Meteorology's data, what the current outlook says, what it cannot tell any district, and where the Department's own outlooks come in." },
  indonesia: { region: "maritime", text: "What El Niño has tended to mean for rainfall, fire and haze in Indonesia, what the current outlook says, what it cannot tell any province, and where BMKG's own outlooks come in." },
  thailand: { region: "mainland", text: "What El Niño has tended to mean for mainland Southeast Asia, what the current outlook says, what it cannot tell any province, and where the regional outlook from ASMC and the national weather service come in." },
  philippines: { region: "philippines", text: "What El Niño has tended to mean for the Philippines, what the current outlook says, what it cannot tell any province, and where PAGASA's own advisories come in." }
};
const countryPromo = (esc, slug) => { const c = COUNTRY_PROMO[slug]; if (!c) return "";
  return `<aside class="cs-card en-promo" aria-labelledby="enx-promo-${slug}"><span class="cs-note__label">${esc(PROMO.label)}</span>
  <h2 class="en-promo__h" id="enx-promo-${slug}">${esc(TITLE)}</h2><p>${esc(c.text)}</p>
  <p><a class="btn btn--cta" href="/${SLUG}/#region-${c.region}">Open the guide <span aria-hidden="true">→</span></a></p></aside>`; };

module.exports = { SLUG, TITLE, SUB, DESC, TOC, OPENING, SUMMARY, SUMMARY_CLAIMS, WHAT, SCHEMATIC, ASIA, REGIONS, PATHWAYS, WHO, HOUSEHOLD, READ, READ_CLAIMS, UNCERTAINTY, DISAGREE, STEPS, STEPS_NOTE, ROLES, ROLE_SERVICES, FAQ, PRINT_QUESTIONS, PROMO, COUNTRY_PROMO, countryPromo,
  // every claim the page uses, by batch, so the build can refuse an unconfirmed one
  claimsUsed() {
    const all = [...OPENING.claims, ...SUMMARY_CLAIMS, ...WHAT.flatMap(x => x.claims), ...SCHEMATIC.claims, ...ASIA.flatMap(x => x.claims), ...REGIONS.flatMap(r => [...r.typicalClaims, ...r.nowClaims]),
      ...PATHWAYS.flatMap(p => p.claims || []), ...READ_CLAIMS, ...UNCERTAINTY.claims, ...FAQ.flatMap(f => f.claims)];
    return { enso: [...new Set(all.filter(c => /^[eu]-/.test(c)))], cities: [...new Set(all.filter(c => c.startsWith("c-")))] };
  }
};
