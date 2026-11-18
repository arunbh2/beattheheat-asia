// Common Shade: the words of /el-nino-and-cities/ ("El Niño and the city: what to prepare before summer 2027"), shared by the
// page (tools/build-el-nino.js), its Markdown in llms-full.txt and the check. Every passage names the claims it rests on (ids in
// research/2026-11/el-nino-cities/claims.json); the build stops, naming the claim, if one is not in that batch's confirmed.json.
// The dated outlook lives in OUTLOOK only, so it can be updated on its own when NOAA, WMO or IMD issue a new bulletin.
// Labels in words (Forecast, Observed, Scenario, Illustrative design) carry the meaning; colour only repeats it.
"use strict";
const SLUG = "el-nino-and-cities";
const TITLE = "El Niño and the city: what to prepare before summer 2027";
const DESC = "A decision guide for smaller Indian cities, starting in Maharashtra: what El Niño's lead time allows before summer 2027, who needs to agree, what changes when an official warning arrives, and how to tell whether people got relief.";
const REVIEWED = "18 November 2026";
const NEXT_REVIEW = "after NOAA's next ENSO discussion (due 10 December 2026), and again when IMD issues its outlook for the 2027 hot season";

// the dated outlook: replace these entries when a newer bulletin is issued, keeping the issue date, period and meaning
const OUTLOOK = {
  asOf: "18 November 2026",
  items: [
    { who: "NOAA Climate Prediction Center", kind: "Forecast", issued: "12 November 2026", period: "through January to March 2027",
      says: "El Niño Advisory in effect. A strong to very strong El Niño is likely through January to March 2027 (a greater than 79% chance), then expected to begin weakening.",
      means: "A forecast for the Pacific Ocean, not for an Indian city. Next issue: 10 December 2026.",
      claims: ["c-noaa"], latest: ["noaa-latest", "NOAA's latest ENSO discussion"] },
    { who: "World Meteorological Organization", kind: "Forecast", issued: "3 September 2026", period: "through February 2027",
      says: "A nearly 100% likelihood that El Niño persists through February 2027. Its strength alone does not decide how severe impacts are in any one country.",
      means: "The latest WMO Update found for this review.",
      claims: ["c-wmo"], latest: ["wmo", "WMO's El Niño Update"] },
    { who: "India Meteorological Department", kind: "Observed", issued: "1 October 2026", period: "June to September 2026",
      says: "Rainfall over India in the 2026 monsoon was 87% of its long period average.",
      means: "A national total; districts differ.",
      claims: ["c-imd-season"], latest: ["imd-dw", "IMD's district warnings"] }
  ],
  none: "No official outlook for summer 2027 exists yet for any Indian city. IMD issues its hot-season outlooks between March and May.",
  noneClaims: ["c-imd-outlooks"]
};

const OPENING = {
  text: "El Niño gives a city months of notice. It cannot say which ward will overheat or which street will flood. It can say this is a season to start ordinary protection early: choose one public service, find its most exposed sites, and have shade, water and a named owner working by March.",
  next: "By the end of January 2027: which service comes first (markets, clinic queues, bus stops or worksites), which sites, and who owns shade and water at each. Working by March, April at the latest.",
  picture: "Picture a vegetable seller at 2 p.m. under a sheet roof. She is a composite illustration, not a real person."
};

const SIGNAL = {
  can: { text: "Shift the odds early enough to prepare. In 1961-2013, most years with above-normal Indian heatwave activity (April to June) followed El Niño events: an India-wide pattern, not a city forecast.", claims: ["c-rohini"] },
  cannot: "Give a heatwave or flood probability for your city. A Pacific probability is never a municipal one.",
  apart: "El Niño gives notice; long-term warming raises the baseline; the local heat island and failing infrastructure (a pump, a feeder, a drain) decide much of the harm, and those are within a city's reach."
};

// the six linked risks: what the evidence supports here, what turns the hazard into harm, one municipal response
const RISKS = [
  { id: "heat", risk: "Extreme heat", label: "India-wide pattern",
    evidence: "Most above-normal Indian heatwave years (1961-2013) followed El Niño events.",
    harm: "Sheet roofs, unshaded stalls, queues and worksites.",
    act: "Shade and drinking water at priority sites by March.", claims: ["c-rohini"] },
  { id: "water", risk: "Water scarcity", label: "Observed, national",
    evidence: "India's 2026 monsoon: 87% of normal. Check district reservoirs and groundwater.",
    harm: "Supply cuts, tanker dependence, water points dry at peak hours.",
    act: "A water point per site, with a refill schedule and tanker back-up.", claims: ["c-imd-season"] },
  { id: "rain", risk: "Intense rainfall", label: "Central India, 1950-2015",
    evidence: "Widespread extreme rain events over central India tripled as total rain declined. Not attributed to El Niño.",
    harm: "Very heavy rain within hours, often with wind.",
    act: "Covers fixed against wind and rain; a named rain fallback per site.", claims: ["c-roxy"] },
  { id: "flood", risk: "Urban flooding", label: "Depends on the city",
    evidence: "Depends on drains, land use and settlement, not rain alone; isolated fixes leave the system exposed (NIUA).",
    harm: "Blocked drains, building over water paths, low-lying homes.",
    act: "Clear drains around priority sites before the monsoon.", claims: ["c-niua-m2"] },
  { id: "health", risk: "Public health", label: "A pathway, not a probability",
    evidence: "Heat with cut water or power raises heat illness. NCDC asked for daily heatstroke reports from 1 March 2026.",
    harm: "Long outdoor waits, unshaded clinics, delayed treatment.",
    act: "Shade and water at clinic queues; watch where reports cluster.", claims: ["c-ncdc"] },
  { id: "work", risk: "Livelihoods", label: "A pathway, not a probability",
    evidence: "Lost hours, fewer customers, spoiled goods. Informal settlements face higher exposure (NIUA).",
    harm: "Leaving a stall means losing sales.",
    act: "Protection at the workplace, not a walk away from it.", claims: ["c-niua-m1"] }
];

const SCENARIOS = [
  { title: "Heat with the taps off", label: "Scenario",
    text: "An afternoon of heat, the ward's supply cut for a repair, the market water point dry by noon. What helps: a refill schedule, a tanker contact, and someone who calls when it runs low.", claims: [] },
  { title: "A downpour in a dry year", label: "Scenario, with an observed precedent",
    text: "Below-normal rain, then one night of very heavy rain. IMD recorded very heavy rainfall over Marathwada on 30 September 2026, after a monsoon below normal for India. A cover that blocks a drain turns one hazard into two.", claims: ["c-marathwada", "c-imd-season"] }
];

// three decision windows: what is already running, what an official warning adds, who decides
const WINDOWS = [
  { id: "before", when: "Before the hot season (December to March)",
    running: "One service and its priority sites; shade, water and an owner at each; refill and repair times; a rain and drainage check; who pays to install and to run.",
    added: "Nothing waits for a warning.",
    who: "Municipal body, market associations or community organisations, and the operator.", claims: [] },
  { id: "warning", when: "When an official local warning is issued",
    running: "Everything above keeps working.",
    added: "Extra refills and longer water hours, a noon check at each site, warnings passed on through associations, clinic queues moved under cover.",
    who: "IMD issues district warnings; departments act under state and district heat plans. This page sets no thresholds.", claims: ["c-warnings", "c-ncdc", "c-sdma"] },
  { id: "after", when: "During and just after an event",
    running: "A daily check: shade intact, water at 2 p.m.; log each failure and fix time.",
    added: "After heavy rain, check covers and drains before reopening; use the fallback site; note what failed.",
    who: "Each site owner and the named repair officer.", claims: [] }
];
const CONTINUITY = "If the power goes, shade and water still work; fans do not. If supply stops, the tanker contact takes over. If a site floods, people go to the fallback site. Clinical care follows official guidance such as NCDC's.";

// the worked example: a municipal market at 2 p.m. (illustrative design)
const MARKET = {
  story: "A vegetable seller would lose sales if she walked to a distant cooling room. So protection goes to her stall.",
  roles: [
    { who: "Municipal body", agrees: "Installs shade over afternoon stalls and one accessible water point, pays for installation, names a repair officer." },
    { who: "Market association or community organisation", agrees: "Lists occupied afternoon stalls, keeps one contact for failures, passes on warnings." },
    { who: "Operator (water supplier or contractor)", agrees: "Refills on schedule; fixes a tap or torn cover within an agreed time." }
  ],
  warningDay: "Refill earlier and twice; the association checks the water at noon and 3 p.m.",
  tradeoff: "A badly sited cover can trap heat, pour rain onto the walkway or block a wheelchair or handcart. The check: stand under it at 2 p.m., pour a bucket on it, walk the aisle with a handcart.",
  alternative: { title: "Or: a shaded clinic queue", text: "A shaded, seated waiting line with water, and a route indoors when it rains.", owner: "The clinic's medical officer", needs: "Someone checks the water and seating every morning, and the indoor route stays open." },
  services: [
    { service: "Shade over occupied stalls", owner: "Municipal body (installs and repairs)", needs: "Fixed against wind, drains clear, aisle passable" },
    { service: "Water point", owner: "Operator (refills)", needs: "Water available at 2 p.m., refill schedule kept" },
    { service: "Failure reports", owner: "Market association or community organisation", needs: "One named contact, a number that answers" }
  ]
};

const SCALE = {
  intro: "No new vulnerability assessment is needed: use the market list, clinic attendance, ward knowledge and the summer plan. NIUA describes city-scale planning as moving beyond isolated projects (Learning Note 2, section 2.6, p. 40).",
  points: [
    "One service across the city, not one showcase site.",
    "Count honestly: priority sites working out of all relevant sites (say 18 of 42 markets, an illustrative figure). Every market is the aim; the share working is this season's claim.",
    "Keep apart regular users, visits per day and catchment population. Footfall is not protection.",
    "Claim no avoided deaths or illness without health data and a fair comparison."
  ],
  pairsIntro: "Pair each output with an observable result (after NIUA's Table 2, p. 54):",
  pairs: [
    ["Shade installed", "Occupied stalls shaded during trading hours"],
    ["Water point installed", "Water available at 2 p.m."],
    ["Cooling space opened", "People using it at peak hours, with staff on duty"]
  ],
  claims: ["c-niua-m2"]
};

const HANDOUT = {
  cols: ["Service and exposed group", "Existing evidence", "Pre-season measure and date", "Local warning and additional response", "Municipal and community roles", "Who pays to install and to run", "Reach and service check", "What we changed"],
  example: ["Daily market; vendors working in the afternoon", "The market list; the ward officer's count of afternoon stalls", "Shade over occupied stalls and one water point, working by 15 March", "IMD district warning, as issued: refill twice, noon check", "Municipal body installs and answers repairs; association reports; operator refills", "Installation: municipal budget. Running: municipal body with the association (to agree)", "Occupied stalls shaded at 2 p.m.; water available at 2 p.m. on each check", "To agree between the municipal body and the local organisation"],
  note: "Illustrative. The municipal body and the local organisation can change any part of it together; the last column records what changed and why."
};

const EXAMPLES = [
  { place: "Nepal", status: "Activities reported by the organisation", text: "Practical Action Nepal used seasonal forecasts to guide early action: awareness with media and local partners, and support for heat action planning (June 2026).", claims: ["c-pa-nepal"], src: "pa" },
  { place: "Peru", status: "A stated aim", text: "With the Swiss Agency for Development and Cooperation, the national civil defence institute (INDECI) and local government, Practical Action set out early action to protect 1,500 families from floods and mudslides.", claims: ["c-pa-peru"], src: "pa" },
  { place: "Maharashtra", status: "A plan", text: "The State Heat Action Plan 2024 names Vidarbha, Marathwada and Khandesh as most vulnerable and 15 districts as high-risk, with cooling centres and reserved hospital beds.", claims: ["c-sdma"], src: "sdma" }
];
const EXAMPLES_NOTE = "A plan, a pilot, a working service and a measured result differ; each example says which it is. Ahmedabad's heat action plan shows delivery over years, though not as an El Niño measure.";

const LOCAL = {
  text: "Akola (Vidarbha), Nanded (Marathwada) and Jalgaon (Khandesh) sit in the three regions the state plan calls most vulnerable. Common Shade's archive has 2026 district plans for Nashik, Palghar and Wardha but none for these three; that gap does not mean no plan exists. The collector's office, district disaster authority and municipal corporation know what is current. Smaller towns often have limited resources and capacities (NIUA, Learning Note 1, p. 35), another reason to start with one service.",
  claims: ["c-sdma", "c-niua-m1"],
  region: "The method travels across South Asia; the warnings do not. Use your own country's weather service and disaster authority."
};

const PRINT = "Print this page, or only the table above, for a meeting with the municipal body.";

module.exports = { SLUG, TITLE, DESC, REVIEWED, NEXT_REVIEW, OUTLOOK, OPENING, SIGNAL, RISKS, SCENARIOS, WINDOWS, CONTINUITY, MARKET, SCALE, HANDOUT, EXAMPLES, EXAMPLES_NOTE, LOCAL, PRINT,
  // every claim the page uses, so the build can refuse an unconfirmed one
  claimsUsed() { return [...new Set([...OUTLOOK.items.flatMap(i => i.claims), ...OUTLOOK.noneClaims, ...SIGNAL.can.claims, ...RISKS.flatMap(r => r.claims), ...SCENARIOS.flatMap(s => s.claims),
    ...WINDOWS.flatMap(w => w.claims), ...SCALE.claims, ...EXAMPLES.flatMap(e => e.claims), ...LOCAL.claims])]; },
  // the same guide as Markdown, for llms-full.txt
  md(SITE, SRC) {
    const s = k => SRC[k] ? ` (${SRC[k].publisher}: ${SRC[k].url})` : "";
    return [`## ${TITLE}`, `${SITE}/${SLUG}/`, DESC, `Reviewed ${REVIEWED}; next review ${NEXT_REVIEW}.`,
      OPENING.text, OPENING.next,
      `### Where the outlook stands (as of ${OUTLOOK.asOf})`, ...OUTLOOK.items.map(i => `- ${i.kind}, ${i.who}, issued ${i.issued}, ${i.period}: ${i.says} ${i.means}`), OUTLOOK.none,
      "### What a seasonal signal can and cannot tell a city", `Can: ${SIGNAL.can.text}`, `Cannot: ${SIGNAL.cannot}`, SIGNAL.apart,
      "### Six linked risks", ...RISKS.map(r => `- ${r.risk} (${r.label}). Evidence: ${r.evidence} What turns it into harm: ${r.harm} One municipal response: ${r.act}`),
      ...SCENARIOS.map(x => `- ${x.label}: ${x.title}. ${x.text}`),
      "### From preparation to response", ...WINDOWS.map(w => `- ${w.when}. Already running: ${w.running} Added: ${w.added} Who decides: ${w.who}`), CONTINUITY,
      "### Worked example: a municipal market at 2 p.m. (illustrative design)", MARKET.story, ...MARKET.roles.map(r => `- ${r.who}: ${r.agrees}`), MARKET.warningDay, MARKET.tradeoff,
      `${MARKET.alternative.title}: ${MARKET.alternative.text} Owner: ${MARKET.alternative.owner}. Needs: ${MARKET.alternative.needs}`,
      "### What city scale means this season", SCALE.intro, ...SCALE.points.map(p => `- ${p}`), SCALE.pairsIntro, ...SCALE.pairs.map(([a, b]) => `- ${a} -> ${b}`),
      "### A municipal handout (illustrative row)", HANDOUT.cols.map((c, i) => `${c}: ${HANDOUT.example[i]}`).join("; "), HANDOUT.note,
      "### Preparedness that has happened", ...EXAMPLES.map(e => `- ${e.place} (${e.status}): ${e.text}${s(e.src)}`), EXAMPLES_NOTE,
      "### Akola, Nanded, Jalgaon and other smaller cities", LOCAL.text, LOCAL.region].join("\n\n");
  }
};
