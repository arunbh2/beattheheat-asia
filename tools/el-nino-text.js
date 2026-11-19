// Common Shade: the words of /el-nino-and-cities/ ("El Niño and India's smaller cities: preparing for summer 2027"), shared by the
// page (tools/build-el-nino.js), its Markdown in llms-full.txt and the check. Every passage names the claims it rests on (ids in
// research/2026-11/el-nino-cities/claims.json); the build stops, naming the claim, if one is not in that batch's confirmed.json.
// The page shows no date of addition, review or update (the owner's decision, November 2026); each bulletin keeps its own issue date.
// The dated outlook lives in OUTLOOK only, so it can be updated on its own when NOAA, WMO or IMD issue a new bulletin.
// Labels in words (Forecast, Observed, Scenario, Illustrative) carry the meaning; colour only repeats it.
// The guide is national: readers adapt it through the conditions their city recognises (ADAPT), not through a list of states.
"use strict";
const SLUG = "el-nino-and-cities";
const TITLE = "El Niño and India's smaller cities: preparing for summer 2027";
const SHORT = "El Niño and India's smaller cities";
const DESC = "A practical guide for municipal teams and community organisations in India's Tier 2 and Tier 3 cities. Choose where protection is needed, agree who will keep it working, and decide what changes when a local warning arrives.";
const REVIEWED = "18 November 2026";
const NEXT_REVIEW = "after NOAA's next ENSO discussion (due 10 December 2026), and again when IMD issues its outlook for the March to May hot season";

// the opening: what a seasonal outlook is for, then the one decision, then a short illustration
const OPENING = {
  text: "A seasonal El Niño outlook gives cities a reason to review preparations early. The local heat season, water supply and places where people spend the hottest hours decide what a city puts in place. District forecasts and official warnings decide when to step up the response.",
  decision: "Which public service will we protect first, who relies on it during the hottest hours, and who has the authority to keep it running?",
  decisionNote: "One service, chosen with the people who use it, is enough to start. The rest of this guide helps a municipal team and a local organisation answer the question in one meeting, with information they already hold.",
  picture: [
    "A vegetable seller loses sales if she leaves her stall to find shade.",
    "So the shade needs to reach her occupied stall in the afternoon, not a room across town.",
    "Drinking water needs to be there when she needs it, at 2 p.m., not only when the market opens."
  ]
};

// the dated outlook: replace these entries when a newer bulletin is issued, keeping the issue date, period, geography and meaning
const EO = require("./enso-outlook.js");
const OUTLOOK = (() => {
  const { O } = EO.load(), S = O.status, G = O.others.find(x => /Seasonal Climate Update/.test(x.title)), W = O.others.find(x => /El Niño\/La Niña Update/.test(x.title));
  return {
    asOf: EO.date(O.checked),
    items: [
      { who: S.issuer, kind: "Forecast", issued: EO.date(S.issued), period: "through January to March 2027", where: "Tropical Pacific Ocean",
        says: `${S.label} in effect. ${S.forecast}`, means: `A forecast for the Pacific Ocean, not for an Indian city. Next issue: ${EO.date(S.next)}.`,
        claims: [], latest: ["noaa-latest", "NOAA's latest ENSO discussion"] },
      { who: G.issuer, kind: "Forecast", issued: EO.date(G.issued), period: G.period, where: "Tropical Pacific Ocean",
        says: `${G.says} WMO's quarterly El Niño Update of ${EO.date(W.issued)} gave a nearly 100% likelihood that El Niño persists through February 2027.`,
        means: "Strength in the Pacific does not decide how severe impacts are in any one country.",
        claims: ["c-wmo"], latest: ["wmo-oct", "WMO's latest seasonal update"] },
      { who: "India Meteorological Department", kind: "Observed", issued: "1 October 2026", period: "June to September 2026", where: "India as a whole",
        says: "Rainfall over India in the 2026 monsoon was 87% of its long period average.",
        means: "A national total. It does not show how much water your city's own supply holds.",
        claims: ["c-imd-season"], latest: ["imd-dw", "IMD's district warnings"] }
    ],
    none: "IMD releases its seasonal outlook for the hot season between March and May. Until it is out, use your district's warnings, and read the outlook for your own region when it is issued.",
    noneClaims: ["c-imd-outlooks"]
  };
})();

const SIGNAL = {
  can: { text: "Give a reason to start ordinary protection early. In India's records for 1961-2013, most years with above-normal heatwave activity (April to June) followed El Niño events: an India-wide pattern, not a city forecast.", claims: ["c-rohini"] },
  cannot: "Give your city's chance of a heatwave, a water shortage or a flood. An ENSO probability describes the Pacific, never a municipality.",
  apart: "Long-term warming raises the baseline; the local heat island and failing infrastructure (a pump, a feeder, a drain) decide much of the harm, and those are within a city's reach."
};

// adapt this to your city: conditions a city recognises, the decision each raises, and information partners already hold
const ADAPT = {
  intro: "Cities differ in when heat arrives, how humid it is, where water comes from, which public spaces people rely on and which authority manages them. Find the rows that describe your city; most cities fit more than one. They are illustrative situations, not categories, and a city's size says nothing on its own about its climate risk or its powers.",
  rows: [
    { id: "afternoons", short: "Busy outdoor places through hot afternoons", if: "Outdoor markets, transport stands or worksites stay busy through hot afternoons",
      decide: "Where can shade, drinking water and rest be provided without asking people to give up earnings or lose their place in a queue?",
      know: "Market registers and association lists, last summer's municipal orders on working hours, the ward office's count of afternoon stalls." },
    { id: "nights", short: "Hot nights or humid heat", if: "Homes or public buildings stay hot at night, or humidity limits relief",
      decide: "Which existing accessible spaces can offer meaningful respite, at what hours, and who can operate them? Check any technical cooling advice against NDMA's guidance on cooling centres.",
      know: "Clinic attendance in past hot spells, community organisations' knowledge of crowded homes, the list of public buildings open in the evening." },
    { id: "water", short: "Summer water that stops or depends on power or tankers", if: "Summer water supply is intermittent, or depends on electricity and tankers",
      decide: "Which priority sites have usable storage or another supply? Who can authorise a refill, pay for it and confirm it arrived?",
      know: "The water department's supply schedule, last summer's tanker orders, ward complaints about dry taps, the reservoir or groundwater figures for your own source." },
    { id: "downpours", short: "Short, intense rain that floods routes or sites", if: "Short, intense rain can flood routes or public sites during an otherwise dry period",
      decide: "Which sites or access routes may fail, which alternative location is usable, and who decides when to switch?",
      know: "Last monsoon's waterlogging complaints, the drain-cleaning schedule, the district disaster plan, residents' knowledge of which lanes flood." }
  ],
  close: "None of these rows needs a new vulnerability assessment before the first meeting. Start with what the municipal body, the clinic and the local organisation already know, and write down what is missing."
};

// the six linked risks: what the evidence shows and its limit, how it becomes harm, what to check locally
const RISKS = [
  { id: "heat", risk: "Extreme heat", label: "India-wide pattern",
    evidence: "Most above-normal Indian heatwave years (1961-2013) followed El Niño events. An ENSO probability does not give your city's chance of a heatwave.",
    harm: "Hours outdoors without shade: a long queue, an unshaded stall, a worksite with no rest.",
    check: "Last summer's municipal orders, clinic attendance in hot spells, the IMD district warnings issued for your district.", claims: ["c-rohini"] },
  { id: "water", risk: "Water scarcity", label: "Observed, national",
    evidence: "India's 2026 monsoon was 87% of normal. A national total does not establish water in your system.",
    harm: "A supply cut, a pump without power or a late tanker leaves a water point dry at peak hours.",
    check: "Your utility's supply schedule and the reservoir or groundwater information for your own source.", claims: ["c-imd-season"] },
  { id: "rain", risk: "Intense rainfall", label: "Central India, 1950-2015",
    evidence: "Widespread extreme rain events over central India tripled as total rain declined. A regional trend, not an El Niño prediction for India.",
    harm: "Very heavy rain within hours, often with wind, tearing covers and closing routes.",
    check: "Which sites lost access in past downpours; how covers are fixed.", claims: ["c-roxy"] },
  { id: "flood", risk: "Urban flooding", label: "Depends on the city",
    evidence: "Rain becomes flooding through drains, terrain, land use and building over water paths; isolated fixes leave the system exposed (NIUA).",
    harm: "A blocked drain, a low-lying site or a single access lane under water.",
    check: "Waterlogging complaints and the drain-cleaning schedule around each priority site.", claims: ["c-niua-m2"] },
  { id: "health", risk: "Public health", label: "A pathway, not a probability",
    evidence: "A long outdoor wait or interrupted water raises the risk of heat illness. NCDC's advisory for summer 2026 asked states for public cooling and drinking water facilities.",
    harm: "Unshaded clinic queues, delayed treatment, no water at the wait.",
    check: "Where heat illness reports clustered last summer; which clinics have outdoor queues.", claims: ["c-ncdc"] },
  { id: "work", risk: "Livelihoods", label: "A pathway, not a probability",
    evidence: "Lost trading hours, fewer customers, spoiled goods. Informal settlements face disproportionately higher exposure to heat, flooding and water scarcity (NIUA).",
    harm: "Leaving a stall to cool down means losing sales or a place in the queue.",
    check: "Vendors' and workers' own account of which hours they lose, through their association or a local organisation.", claims: ["c-niua-m1-eq"] }
];

const SCENARIOS = [
  { title: "Heat with the taps off", label: "Scenario",
    text: "An afternoon of heat, the ward's supply cut for a repair, the market water point running low by noon. What helps: storage sized to a hot day's demand, a refill arranged with enough lead time for the tanker to arrive, and someone who calls when it runs low.", claims: [] },
  { title: "A downpour in a dry year", label: "Scenario",
    text: "A below-normal monsoon, then one night of very heavy rain before the season turns. Covers tear, a lane floods, and a cover that blocks a drain turns one hazard into two. What helps: covers fixed against wind, drains cleared around each site, and an agreed alternative site.", claims: [] }
];

// the warning route: a national entry point, then the state and local steps
const ROUTE = {
  intro: "This guide sets no warning thresholds of its own. Find who issues your warning and who acts on it:",
  steps: [
    { t: "IMD district warnings", d: "The official warning for your district, issued by the India Meteorological Department.", link: "imd-dw" },
    { t: "Your regional or state meteorological centre", d: "IMD works through Regional Meteorological Centres, assisted by Meteorological Centres at the state level that disseminate advisories and warnings for their region.", link: "imd-evo" },
    { t: "Your state or district disaster authority", d: "The state and district heat action plans say which department acts at each alert level. Find yours in the India heat action plan archive.", href: "/resources/heat-action-plans/india/" },
    { t: "The municipal officer or service operator named locally", d: "The person who extends water hours or moves a queue indoors. If no one is named for your chosen service, name them before the season." }
  ],
  claims: ["c-imd-centres"],
  health: "For health departments, NCDC's advisory for summer 2026 asked states to start daily heat illness reporting from 1 March 2026 and to set local early warning thresholds.",
  healthClaims: ["c-ncdc"]
};

// three decision windows, read against the city's own season
const WINDOWS = [
  { id: "before", when: "Before the locally expected heat season",
    what: "Select the service and sites, confirm permissions and operators, agree costs, put the measures in place and test them. Work backwards from when heat usually arrives in your city, how long procurement takes, and official guidance.",
    who: "The body that manages each site (municipal body, market committee, health department or transport authority), the operator and the local organisation.", claims: [] },
  { id: "warning", when: "When an official local warning is issued",
    what: "The core protection is already working. Agree in advance who receives the warning and what is added under the applicable plan: an operator extends water hours, brings a refill forward, or moves a clinic queue indoors.",
    who: "IMD issues district warnings; departments act under the state and district heat plans.", claims: ["c-imd-centres"] },
  { id: "after", when: "During and just after the event",
    what: "Check that each site works at the hours people rely on it, fix failures, and record who was left without access. After heavy rain, check covers and drains before reopening.",
    who: "Each site's operator and the named repair officer, with the local organisation reporting what users see.", claims: [] }
];
const CONTINUITY = "Before opening a site, check how people will get drinking water during a power cut. If the supply depends on a pump, agree who can release stored water or order a refill, how long it will take, and where people can go in the meantime. If a site floods, the agreed alternative site takes over. Clinical care follows official guidance such as NCDC's.";

// the worked example: a market at 2 p.m. (illustrative design), with a clinic queue as a short alternative
const MARKET = {
  story: "A vegetable seller would lose sales if she walked to a distant cooling room. So protection goes to her stall, in the hours she trades.",
  community: { who: "Vendors, through their association or a local organisation", role: "walk the market at 2 p.m. and mark which occupied stalls lose shade in the afternoon.",
    changes: "Their map can move the shade: from the entrance, where it looks visible, to the aisle where sellers actually sit after lunch." },
  roles: [
    { who: "Authorises the site", agrees: "Whoever manages the market: a municipal body, a market committee or another authority. Gives permission for shade and a water point." },
    { who: "Pays for installation", agrees: "May be the municipal budget, a state scheme or a district allocation; agreed before procurement starts." },
    { who: "Covers summer operations", agrees: "Water, cleaning and small repairs through the season; may be a different body from the one that paid to install." },
    { who: "Authorises a repair or emergency refill", agrees: "One named person who can order a tanker or fix a torn cover the same day." }
  ],
  warningDay: "Water hours extend and the refill comes forward, timed to the storage on site and the tanker's delivery time; the association checks the water point at noon and mid-afternoon.",
  tradeoff: "A badly sited cover can trap heat, pour rain onto the walkway or block a wheelchair or handcart. The check: stand under it at 2 p.m., pour a bucket on it, walk the aisle with a handcart.",
  alternative: { title: "Or: a shaded clinic queue", text: "A shaded, seated waiting line with water, and a route indoors when it rains.",
    owner: "Whoever manages the clinic, often the health department rather than the municipality.",
    community: "Patients and disability groups walk the route from the gate and say whether the shaded line is reachable with a wheelchair or a walking stick; their answer can move the queue indoors or change where the seating goes." },
  services: [
    { service: "Shade over occupied stalls", owner: "The site manager authorises; the installer repairs within an agreed time", needs: "Fixed against wind, drains clear, aisle passable" },
    { service: "Drinking water point", owner: "The operator refills; one named person can authorise an emergency refill", needs: "Water available during peak trading hours; storage sized to a hot day" },
    { service: "Failure reports", owner: "The association or local organisation", needs: "One number that answers; the operator records when each failure was fixed" }
  ]
};

// reach: coverage, people and protection kept apart, with outputs paired to observable results
const REACH = {
  intro: "Start with one public service and show how much of it can be protected this season. NIUA's learning notes for city officials describe city-scale planning as moving beyond isolated projects (Learning Note 2, section 2.6, p. 40) and point to entry points within municipal functions (Learning Note 1).",
  measures: [
    { t: "Service coverage", d: "Functioning sites out of relevant sites, with the count of relevant sites stated: say 18 of 42 markets (an illustrative figure)." },
    { t: "People reached", d: "Regular users and visits, reported separately where people come back every day. Footfall is not protection." },
    { t: "Protection delivered", d: "What was available at the hour that matters, and to whom. Claim no avoided deaths or illness without health data and a fair comparison." }
  ],
  pairsIntro: "Pair each output with an observable result (after NIUA's Table 2, Learning Note 2, p. 54):",
  pairs: [
    ["Shade installed", "Occupied vendor stalls shaded at 2 p.m."],
    ["Water point installed", "Drinking water available during peak trading hours"],
    ["Cooling space opened", "People using it at peak hours, with staff on duty"]
  ],
  fail: "Give users a simple way to report a failure (a number on the post, the association's contact) and ask the operator to record when it was fixed. The log shows whether protection held, not only whether it was built.",
  equity: "Exposure is uneven: NIUA's Learning Note 1 notes that informal settlements face disproportionately higher exposure to heat, flooding and water scarcity, and that smaller cities often work with constrained resources (pp. 33, 35). Count who the service reaches in those places.",
  claims: ["c-niua-m2", "c-niua-m1", "c-niua-m1-eq"]
};

// the worksheet: one A4 sheet per service, filled in by hand at one meeting. Its order follows the guide: choose the service,
// agree who keeps it working, then three pause points (before opening, when a warning is issued, during and after), then
// agree. Hints are short and marked "e.g." so they prompt without supplying the answer. Printed at /print/el-nino-worksheet/.
const WORKSHEET = {
  slug: "el-nino-worksheet",
  title: "One service, protected before the heat",
  kind: "Worksheet · For a municipal team and a local organisation, filled in together",
  lede: "One sheet for each service, filled in together at one meeting with what you already know. In part 3, tick each item on the day and fix anything left unticked.",
  parts: [
    { h: "Choose the service", sum: "What the service is, who relies on it in the hottest hours, which conditions fit your city, and what you already know.", fields: [
      { l: "Service and sites", hint: "e.g. the daily market, two lanes", lines: 1 },
      { l: "Who relies on it in the hottest hours, and what they lose if they leave", hint: "e.g. sellers lose sales", lines: 1 },
      { l: "Conditions that describe our city (tick all that apply)", boxes: "adapt" },
      { l: "What we already know, and from where", hint: "e.g. market register, last summer's tanker orders", lines: 1 }] },
    { h: "Agree who keeps it working", sum: "Who authorises the site, pays to install, pays to run it and can order a same-day repair or refill, and the date it works by, with the reason.", note: "These can be different bodies.",
      roles: ["Authorises the site", "Pays to install", "Pays to run it through the summer", "Can order a repair or a refill the same day"],
      cols: ["Organisation", "Name and phone"],
      fields: [{ l: "Working by (date), because", hint: "when heat usually arrives here, less the time to buy and install", lines: 1 }] },
    { h: "Three pause points", sum: "Ticks before opening, when an official warning is issued, and during and after: shade, water, power cuts, access and failures fixed.", note: "Tick on the day.", pauses: [
      { h: "Before opening", items: ["Shade over occupied places at 2 p.m.", "Drinking water at peak hours; storage checked", "Power cut: who refills, and how fast, agreed", "Step-free way in, passable with a handcart", "Failure number posted on site"] },
      { h: "When an official warning is issued", fields: [{ l: "The warning comes from", hint: "e.g. IMD district warning, as issued", lines: 1 }, { l: "Who receives it here", lines: 1 }],
        items: ["Refill brought forward", "Water hours extended", "Queues moved under cover"] },
      { h: "During and after", counts: ["Sites working at 2 p.m.: ____ of ____", "Failures reported ____ · fixed ____ · slowest fix ____ hours"],
        fields: [{ l: "Who could not use it, and why", lines: 1 }] }] },
    { h: "Agree", sum: "What the local organisation changed, who agreed, and when you check again.", fields: [
      { l: "What the local organisation changed in this plan", hint: "e.g. moved the shade to the inner lane", lines: 1 },
      { l: "Agreed by", sign: 2, also: "Next check, on (date)" }] }
  ],
  note: "Hints are illustrative; write your own answers. Bring this sheet to the next check.",
  invite: "Used this sheet? Tell us what you changed, and what you would add, through the form at beattheheat.asia/join. No names needed."
};
// the worksheet as plain lines, for the page's summary, its Markdown and llms-full.txt
const worksheetLines = () => WORKSHEET.parts.map((p, i) => `${i + 1}. ${p.h}: ${p.sum}`);

// documented Indian examples, each showing one decision; a large-city precedent labelled by its scale
const EXAMPLES = [
  { place: "Jodhpur, Rajasthan", setting: "Hot, dry", status: "Installed, reported by a partner in the plan", decision: "Where to put protection",
    text: "In April 2024 the city corporation and its partners opened a net-zero cooling station in a heat-vulnerable ward of Jodhpur North, chosen through the vulnerability assessment in the city's heat action plan. The 2023 plan also sets out passing heat warnings by SMS and WhatsApp.", claims: ["c-jod-orig", "c-jod-plan"], src: ["nrdc-jod", "jod-hap"] },
  { place: "Kerala", setting: "Humid, coastal", status: "An allocation, reported in the news", decision: "Who can pay at short notice",
    text: "In March 2026 the state decided to give each district collector ₹1 crore for summer measures, and asked officials to set up drinking water kiosks where people gather: markets, junctions and bus stands. The government order itself was not found online.", claims: ["c-kerala-orig"], src: ["bs-kerala"] },
  { place: "Uttar Pradesh", setting: "Northern plains", status: "A state method, with district thresholds reported", decision: "What triggers a step-up",
    text: "The state disaster management authority set yellow, orange and red alert temperatures for each of its 75 districts, from percentiles of each district's own temperature record, so an alert reflects local conditions. Its 2024 heat plan sets out the method, first drafted for Agra.", claims: ["c-up-orig"], src: ["dte-up", "up-hap"] }
];
const LARGE = { place: "Ahmedabad", label: "A large city, with outcome evidence",
  text: "A 2018 evaluation estimated about 1,190 deaths a year avoided after Ahmedabad's heat action plan was fully implemented (95% confidence interval 162 to 2,218): an association, not proof of cause. The scale differs; the practice a smaller city can adapt is a named plan in which a warning sets agreed actions moving across departments.", claims: ["c-ahd-orig"], src: ["hess"] };
const EXAMPLES_NOTE = "A published plan shows a planning decision, an installed facility shows installation, and measured benefit needs outcome evidence; each example says which it is, and cites its own source.";

const CLOSE = "The method travels; the warnings do not. Outside India, use your own country's weather service and disaster authority.";
// three facts a reader sees first, all true of the page itself
const GLANCE = ["For smaller Indian cities", "Every claim sourced", "Printable worksheet"];
const PRINT = "The worksheet prints on one A4 sheet. The whole guide also prints, for reading before the meeting.";

// The feature card that points readers here from other pages (practical actions, the India HAP archive).
// One set of words, so every entry point says the same thing.
const PROMO = {
  label: "Before summer 2027",
  title: SHORT,
  text: "A practical guide for municipal teams and community organisations in Tier 2 and Tier 3 cities: choose where protection is needed, agree who keeps it working, and decide what changes when a local warning arrives.",
  button: "Open the guide",
};
// tag: "h2" where the card sits beside the page's headings; "p" on the text pages, whose films are placed before the first h2.
const promo = (esc, id, tag = "h2") => `<aside class="cs-card en-promo" aria-labelledby="${id}"><span class="cs-note__label">${esc(PROMO.label)}</span>
  <${tag} class="en-promo__h" id="${id}">${esc(PROMO.title)}</${tag}><p>${esc(PROMO.text)}</p>
  <p><a class="btn btn--cta" href="/${SLUG}/">${esc(PROMO.button)} <span aria-hidden="true">→</span></a></p></aside>`;
const promoMd = () => `**${PROMO.label}: ${PROMO.title}.** ${PROMO.text} ${PROMO.button}: /${SLUG}/`;

module.exports = { PROMO, promo, promoMd, SLUG, TITLE, SHORT, DESC, REVIEWED, NEXT_REVIEW, OPENING, OUTLOOK, SIGNAL, ADAPT, RISKS, SCENARIOS, ROUTE, WINDOWS, CONTINUITY,
  MARKET, REACH, WORKSHEET, worksheetLines, EXAMPLES, LARGE, EXAMPLES_NOTE, CLOSE, PRINT, GLANCE,
  // every claim the page uses, so the build can refuse an unconfirmed one
  claimsUsed() { return [...new Set([...OUTLOOK.items.flatMap(i => i.claims), ...OUTLOOK.noneClaims, ...SIGNAL.can.claims, ...ADAPT.rows.flatMap(r => r.claims || []),
    ...RISKS.flatMap(r => r.claims), ...SCENARIOS.flatMap(s => s.claims), ...ROUTE.claims, ...ROUTE.healthClaims, ...WINDOWS.flatMap(w => w.claims),
    ...REACH.claims, ...EXAMPLES.flatMap(e => e.claims), ...LARGE.claims])]; },
  // the same guide as Markdown, for llms-full.txt
  md(SITE, SRC) {
    const s = k => SRC[k] ? ` (${SRC[k].publisher}: ${SRC[k].url})` : "";
    return [`## ${TITLE}`, `${SITE}/${SLUG}/`, DESC,
      OPENING.text, `The first decision: ${OPENING.decision} ${OPENING.decisionNote}`, `Illustrative: ${OPENING.picture.join(" ")}`,
      "### Where the outlook stands", ...OUTLOOK.items.map(i => `- ${i.kind}, ${i.who}, issued ${i.issued}, ${i.period}, ${i.where}: ${i.says} ${i.means}`), OUTLOOK.none,
      "### What a seasonal signal can and cannot tell a city", `Can: ${SIGNAL.can.text}`, `Cannot: ${SIGNAL.cannot}`, SIGNAL.apart,
      "### Adapt this to your city", ADAPT.intro, ...ADAPT.rows.map(r => `- If ${r.if.charAt(0).toLowerCase() + r.if.slice(1)}: ${r.decide} Information you may already hold: ${r.know}`), ADAPT.close,
      "### Six linked risks", ...RISKS.map(r => `- ${r.risk} (${r.label}). Evidence and its limit: ${r.evidence} How it becomes harm: ${r.harm} What to check locally: ${r.check}`),
      ...SCENARIOS.map(x => `- ${x.label}: ${x.title}. ${x.text}`),
      "### Your warning route", ROUTE.intro, ...ROUTE.steps.map((x, i) => `${i + 1}. ${x.t}: ${x.d}${x.link ? s(x.link) : x.href ? ` (${SITE}${x.href})` : ""}`), ROUTE.health,
      "### Before, during and after", ...WINDOWS.map(w => `- ${w.when}: ${w.what} Who decides: ${w.who}`), CONTINUITY,
      "### Worked example: a market at 2 p.m. (illustrative design)", MARKET.story, `${MARKET.community.who} ${MARKET.community.role} ${MARKET.community.changes}`,
      ...MARKET.roles.map(r => `- ${r.who}: ${r.agrees}`), `On a warning day: ${MARKET.warningDay}`, MARKET.tradeoff,
      `${MARKET.alternative.title}: ${MARKET.alternative.text} Managed by: ${MARKET.alternative.owner} ${MARKET.alternative.community}`,
      "### Reach: how much protection people got", REACH.intro, ...REACH.measures.map(m => `- ${m.t}: ${m.d}`), REACH.pairsIntro, ...REACH.pairs.map(([a, b]) => `- ${a} -> ${b}`), REACH.fail, REACH.equity,
      `### Worksheet: ${WORKSHEET.title}`, WORKSHEET.lede, ...worksheetLines(), `Printable A4 sheet: ${SITE}/print/${WORKSHEET.slug}/`, WORKSHEET.note,
      "### Preparedness that has happened in India", EXAMPLES_NOTE, ...EXAMPLES.map(e => `- ${e.place} (${e.setting}; ${e.status}; the decision: ${e.decision}): ${e.text}${e.src.map(s).join("")}`),
      `- ${LARGE.place} (${LARGE.label}): ${LARGE.text}${LARGE.src.map(s).join("")}`,
      CLOSE].join("\n\n");
  }
};
