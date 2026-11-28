// Heat in markets and street vending (/market-heat/): every word the page, its worksheet and llms-full.txt share.
// A sibling of Heat inside factories (tools/factory-heat-text.js), with the same record shape so the shared page script
// (factory-heat/factory.js) runs the plan, finder, comparison and shortlist. Figures name claims in
// research/2026-11/market-heat/claims.json; tools/build-market-heat.js shows a passage only when research/2026-11/
// market-heat/confirmed.json holds every claim it names. Starting point: the owner's Market Heat build pack (November
// 2026), adapted to the site's evidence scale and voice; what it changed is in research/2026-11/market-heat/README.md.
"use strict";

const SLUG = "market-heat";
const TITLE = "Heat in markets and street vending";
const SUB = "Where heat comes from in an open market, who it reaches between dawn and dusk, and what helps vendors and porters drink, rest and keep earning, with the evidence for each measure and its limits.";
const DESC = "Heat in South and Southeast Asia's open markets and street vending: an illustrative market plan by time of day, the seven things that set a vendor's or porter's heat load, health and gender equity, an intervention library with comparison and shortlist, worked examples, evidence gaps and a printable walk-through worksheet.";

// the evidence scale on this page: kinds of evidence, never strength scores
const EV = {
  guide: "Occupational guidance, written for workplaces",
  study: "Study of the harm, not of this measure",
  trial: "Measured temperature, not health or earnings",
  field: "Field report from markets",
  proposal: "Proposal requiring validation"
};
const EV_NOTE = {
  guide: "What occupational agencies recommend from accumulated experience. It was written for employers and workplaces; a market has no single employer, so who could take each step differs.",
  study: "A study that measured the problem this measure addresses. It shows why the measure matters, not that the measure works.",
  trial: "A field or experimental measurement of temperature under shade or on surfaces. It shows a physical effect where it was measured; effects on health, rest or earnings were not measured.",
  field: "An account of what was done in a market or vending setting, by the people who did it or reported on it. None here is an independent evaluation.",
  proposal: "Common Shade's reading of what could help, built from the problems documented on this page. Nobody has yet tested it in a market in the sources checked."
};

const OPEN = {
  q: "Why the same market hits six people differently between dawn and dusk",
  a: "An open market holds many working days at once. A wholesale buyer, a porter, a woman selling vegetables alone, a fish seller, a vendor with a child at the stall and a shopper waiting for a bus all share the same street, and meet its heat at different hours, in different places, with different room to stop.",
  label: "An illustrative market day",
  stops: [
    { place: "06:00 Wholesale buying and loading", text: "The day starts before sunrise with heavy lifting. Porters carry loads paid by the trip, and fish and produce sellers buy ice to keep stock fresh for the day ahead." },
    { place: "11:30 The exposed produce row", text: "The sun is overhead. Heat comes from above and bounces up from paving, and shop air conditioners blow hot air into the aisle. A vendor alone has nobody to mind the stall." },
    { place: "14:00 The locked or distant toilet block", text: "The toilet is far, paid, locked or unsafe, so some vendors drink less to avoid leaving their goods. The body gets less water in the hottest hours." },
    { place: "17:30 The empty aisle and unsold stock", text: "Footfall drops, produce has wilted, and the day's loan repayment or cart rent is still due tomorrow morning." }
  ],
  close: "The same heat lands differently because of where people stand, what they carry, whether they can leave the stall, and what an hour off costs them."
};

const ENTRIES = [
  { href: "#understand", t: "Understand market heat", d: "Seven things set a vendor's or porter's heat load" },
  { href: "#explore", t: "Explore a market", d: "Six zones, at midday and at the edges of the day" },
  { href: "#library", t: "Compare interventions", d: "Measures with their evidence, costs and conditions" },
  { href: "#worksheet", t: "Walk the market together", d: "A one-page worksheet to print" }
];

// zones of an illustrative street market; time.peak is 13:30, time.edge is 07:00 and 17:30
const ZONES = [
  { id: "produce", area: "produce", short: "Produce and fish row", t: "Exposed produce and fish stall row",
    sources: ["Overhead sun on stalls and sellers", "Heat bouncing up from paving and concrete", "Hot air from neighbouring shop air conditioners", "Still air in narrow aisles"],
    time: { peak: "The sun is nearly overhead and nets or umbrellas give the least cover; stock wilts and spoils fastest.", edge: "Low sun reaches under canopies from the side; the row is busiest with buyers, so stepping away costs the most sales." },
    who: "Vegetable, fruit, flower and fish sellers, many of them women trading alone, some with children.",
    ask: ["Which stalls sit in full sun, and at what hours?", "Who can mind your stall if you need water or a toilet?", "What spoils first, and when in the day?"],
    measure: ["Globe or mean radiant temperature under stalls around 13:00", "Share of stock thrown away at closing", "How often sellers leave the stall to drink"],
    fixes: ["vendor-shade", "stall-buddy", "spoilage-ice", "street-trees"], depends: "Who holds the pitch, what the street authority allows overhead, and whether shade keeps aisles and fire access clear." },
  { id: "loading", area: "loading", short: "Loading bay and porter queue", t: "Loading bay and porter and cart queue",
    sources: ["Heavy lifting and carrying", "Sun on open loading ground", "Vehicle exhaust and engine heat"],
    time: { peak: "There are fewer loads but no shade; porters waiting for a turn stand in the open.", edge: "At 06:00 and in the evening the heaviest loads move fast; a porter who stops to drink may lose a paid turn." },
    who: "Porters and loaders paid by the load, cart pullers, drivers' helpers; mostly men, many of them migrants.",
    ask: ["Do you lose your place in the queue if you rest?", "Where is the nearest water and shade from the queue?", "How many loads make a day's pay?"],
    measure: ["Loads per hour at different times of day", "Breaks taken without losing a turn", "Reported heat symptoms over a hot week"],
    fixes: ["stall-buddy", "shaded-rest", "water-point"], depends: "Whether porters' associations or the market committee control the queue, and how loads are paid." },
  { id: "toilets", area: "toilets", short: "Toilet block", t: "Public toilet and menstrual-hygiene block",
    sources: ["A hot, airless block", "Distance from stalls in the sun"],
    time: { peak: "The cost of a walk to a far or paid toilet is highest, and so is the pull to drink less.", edge: "At 06:00 and after 18:00 the block may still be locked, though trading has begun or not yet ended." },
    who: "Every vendor and porter; women vendors, people who menstruate, pregnant women, older and disabled vendors and transgender vendors most affected by fees, distance, lighting and safety.",
    ask: ["Is the toilet open, free, clean and safe for the whole trading day?", "Is there water, soap, a lock and a bin for menstrual waste?", "Do you drink less so you need it less?"],
    measure: ["Days and hours open during trading", "Water, soap and lighting working on a spot check", "How much vendors drink on a hot day"],
    fixes: ["market-toilets", "stall-buddy"], depends: "Who owns and pays for cleaning, and whether opening hours match trading hours." },
  { id: "water", area: "water", short: "Water and ice point", t: "Drinking-water and ice refill point",
    sources: ["Sun on taps and containers that warms the water", "Queues in the open"],
    time: { peak: "Demand peaks; a dry or warm tap is felt most now.", edge: "At 06:00 ice is bought for the day's stock; its price sets how much sellers can keep cool." },
    who: "Vendors, porters, shoppers and passers-by; fish and produce sellers buying ice.",
    ask: ["Is free, safe drinking water within a short walk of every row?", "Who refills and cleans it, and is that paid?", "Has the price of ice changed this season?"],
    measure: ["Minutes walk from the furthest stall", "Days the point was dry", "Ice cost as a share of a day's sales"],
    fixes: ["water-point", "spoilage-ice"], depends: "Water supply, a named person paid to keep it clean and working, and a way to report when it fails." },
  { id: "edge", area: "edge", short: "Waiting edge", t: "Bus, auto-rickshaw and delivery waiting edge",
    sources: ["Exposed kerb with no shelter", "Vehicle exhaust and engine heat", "Hot paving and road"],
    time: { peak: "Few people wait, but those who do have no shade.", edge: "Shoppers, children and vendors heading home crowd the kerb in low sun." },
    who: "Shoppers with children, older people, vendors arriving and leaving, delivery riders.",
    ask: ["Where do people wait, and for how long?", "Is there shade or a seat?", "Who comes on foot from far away?"],
    measure: ["People waiting at peak hours", "Shade over the waiting area through the day"],
    fixes: ["vendor-shade", "street-trees", "market-messengers"], depends: "The road authority and transport operators, as well as the market." },
  { id: "rest", area: "rest", short: "Storage, rest and crèche", t: "Nearby storage room, rest bench and crèche room",
    sources: ["A tin roof over a small room", "Little air movement", "Power cuts that stop fans"],
    time: { peak: "A cool room could serve as rest and child care, if it is open and someone minds the stalls.", edge: "It is a store for goods and carts." },
    who: "Vendors storing goods overnight, parents with young children, older vendors needing to sit.",
    ask: ["Is there anywhere cool to sit for ten minutes?", "Where are children during school closures?", "Who holds the key?"],
    measure: ["Room temperature in the afternoon", "Use by vendors and children on hot days"],
    fixes: ["shaded-rest", "shaded-creche"], depends: "Who owns the room, whether it can be cooled cheaply, and paid staff if children are cared for." }
];

const UNDERSTAND = {
  intro: "A vendor's or porter's heat load is not one number. It builds from the air, the sun, surfaces and machines around them, the work their body does, how long they go without recovering, and how much water they can drink.",
  factors: [
    { id: "air", t: "Air temperature", d: "The shade temperature a forecast gives. It is the starting point, and in a market often not the main part of the load.", ask: "How hot is it in the shade where people stand?" },
    { id: "radiant", t: "Overhead sun and radiant bounce", d: "Direct sun, and heat given back by paving, concrete and metal, can add more to the body than the air does. Light-coloured or reflective paving can make this worse for people standing on it unless there is shade overhead.", ask: "What surfaces around the stall feel hot to the hand in the afternoon?", claims: ["c-mh-sg-shade", "c-mh-la-pavement"] },
    { id: "exhaust", t: "Air-conditioner exhaust and vehicle heat", d: "Shops that cool their rooms push the heat into the street, and engines idling at the kerb add more.", ask: "Where does hot air blow onto stalls?" },
    { id: "humid", t: "Humidity and still, narrow aisles", d: "Sweat cools the body only when it can evaporate. Humid air and aisles closed off by stalls and awnings slow it down.", ask: "Does air move along the aisle, or is it trapped?" },
    { id: "lifting", t: "Heavy lifting and carrying", d: "Porters and loaders make much of their own heat through effort, often at the hottest pace when trucks arrive.", ask: "How heavy are loads, how far are they carried, and how fast?" },
    { id: "standing", t: "Long hours without recovery", d: "Many vendors trade from dawn to dusk, standing or squatting, with nowhere cool to sit and no one to take over.", ask: "When in the day does anyone get a real break?" },
    { id: "water", t: "Drinking less on purpose", d: "Where toilets are far, paid, locked or unsafe, some vendors drink less to avoid needing them. The body then has less water to sweat with in the hottest hours.", ask: "Do people drink less because of the toilets?", claims: ["c-mh-toilets"] }
  ],
  numbers: "This page gives no safe temperature or safe working time. Heat stress depends on all seven factors together; measurement, vendors' own reports and local health advice are the guides."
};

const HEALTH = {
  intro: "Heat harms the body the same way everywhere. Who it harms most in a market depends on how the market is run, who holds space in it, and who looks after whom.",
  split: [
    { t: "Physiology and microclimate", d: "Heat load, dehydration, strain on the heart and kidneys, heat exhaustion and heat stroke, and the sun, surfaces and air that drive them." },
    { t: "Market governance, space and care", d: "Toilets, stall security, queue rules, licences, eviction risk, debt, childcare and who sits on market committees: the arrangements that decide whether people can drink, rest and stop." }
  ],
  dims: [
    { id: "toilets", t: "Toilets as heat-health infrastructure", d: "Where toilets are poor or missing, people drink less, and that can strain the urinary tract and kidneys as well as add to heat strain.", claims: ["c-mh-toilets"], alt: { d: "Where toilets are poor or missing, people drink less, and studies of women workers link poor toilets at work to genitourinary problems alongside heat strain and dehydration.", claims: ["c-mh-toilets-plain"] } },
    { id: "security", t: "Stall security and queue economics", d: "Leaving a stall can cost goods or sales; stepping out of a porter queue can cost a paid load. A break has a price before anyone says no." },
    { id: "credit", t: "Spoilage and the heat credit squeeze", d: "Fewer customers and spoiled stock fall on the same day as a loan repayment or cart rent, so heat can turn a bad day into debt.", claims: ["c-mh-delhi-vendors"] },
    { id: "body", t: "Menstruation, pregnancy and breastfeeding in open public space", d: "Privacy, clean water, a place to change, sit or feed a baby, and a way to rest without losing a pitch decide whether these are manageable in heat." },
    { id: "care", t: "Childcare and school closures", d: "When heat closes schools, children may come to hot stalls, or a parent, often a mother, loses a day's trade.", claims: ["c-mh-schools"] },
    { id: "tenure", t: "Licences, tenure and eviction during upgrades", d: "Street improvements, shade projects and greening can push informal, migrant, women and transgender vendors off their pitches when their space is not protected first." },
    { id: "excluded", t: "Vendors left out of warnings and services", d: "Deaf and disabled vendors, migrants, people who do not read the local language and people without smartphones are easily missed by alerts, signs and services." },
    { id: "voice", t: "Who sits on market committees", d: "Women vendors are often absent from the market boards and municipal meetings where shade, toilets and water are decided." }
  ],
  agency: "Protection without eviction or lost turns. Beautification that clears informal stalls, shade that blocks fire lanes or footfall, or a cooling centre that leaves a vendor to abandon goods or a porter to lose a paid load is not protection."
};

const FAMILIES = [
  { id: "A", slug: "shade", t: "Shade, microclimate and storm-proof canopies", d: "Cut direct sun and radiant bounce where people trade, load and wait." },
  { id: "B", slug: "water", t: "Water, sanitation and menstrual hygiene", d: "Free drinking water and clean, safe toilets treated as heat infrastructure." },
  { id: "C", slug: "rest", t: "Stall-minding, rest and porter-queue arrangements", d: "Make it possible to drink, use a toilet and rest without losing goods or a paid turn." },
  { id: "D", slug: "livelihood", t: "Produce cooling, ice and livelihood protection", d: "Slow spoilage and cushion earnings when heat empties the aisles." },
  { id: "E", slug: "access", t: "Women's safety, childcare and inclusive access", d: "Make cooling spaces, child care and warnings reach women, disabled, migrant and transgender vendors." },
  { id: "F", slug: "governance", t: "Market governance, tenure protection and two-way alerts", d: "A seat for vendors in design, protection for pitches, and alerts with real services behind them." }
];

const R = (o) => o;
const RECORDS = [
  // A. shade
  R({ id: "vendor-shade", fam: "A", t: "Vendor-co-designed, storm-proof shared shade with pitch protection",
    addresses: "Direct sun and radiant heat over stalls and aisles, shade that arrives late or tears in pre-monsoon winds, and eviction during street upgrades.",
    how: "Anchored, wind-rated shade over rows of stalls or single carts, put up before the hot season, with written protection so that vendors keep their pitches after the work.",
    where: "Open street rows, weekly markets and vending zones with no tree cover or building overhang.",
    works: ["Up before the heat begins, not in the middle of it", "Anchored for pre-monsoon gusts, with headroom for air to move and clear fire access", "Designed with licensed and unlicensed vendors, who keep their places"],
    caution: ["Reflective coatings on paving without shade overhead can add radiant heat to people standing on them", "Late, unanchored nets can tear or collapse in strong winds", "Designs that clear hawkers to make room protect no one who traded there"],
    upfront: "From a cart umbrella to engineered canopies over a row; local costing needed.",
    recurrent: "Checks before each season, storm-anchor inspection and fabric replacement every few seasons.",
    owners: "City and local governments, vendor associations and community groups.",
    voice: "Vendors choose where shade goes and how it is anchored, and agree how pitches are kept.",
    equity: "Cuts radiant heat for the people standing longest in the sun, if no one loses a pitch to make room.",
    ev: [{ type: "trial", claims: ["c-mh-canopy", "c-mh-sg-shade"] }, { type: "field", claims: ["c-mh-nagpur"] }],
    gap: "Shade lowers measured temperatures; no evaluation of market shade on vendors' health or earnings was found in the sources checked.",
    measure: "Mean radiant temperature under stalls around 13:00; canopies still standing after pre-monsoon storms; vendors on the same pitches a year later.",
    pair: ["street-trees", "water-point"] }),
  R({ id: "street-trees", fam: "A", t: "Trees for long-term shade at the market's edges",
    addresses: "Shade that lasts for decades over waiting areas, rest points and the market's edges.",
    how: "Trees planted where they have water and room to grow, alongside shade people can use this season while the trees grow.",
    where: "Market edges, bus stops and rest points with space for roots and canopy.",
    works: ["Water and growing space secured before planting", "Someone paid to care for the trees", "Planting planned so that it does not push vendors or residents out"],
    caution: ["A young tree gives little shade for years", "Greening that raises rents or clears stalls displaces the people it was meant to cool"],
    upfront: "Saplings, pits, guards and watering; local costing needed.",
    recurrent: "Watering and care for several years.",
    owners: "City and local governments, with vendor associations and residents.",
    voice: "Vendors and residents help decide where trees go.",
    equity: "Long-term shade for everyone at the edge, if greening does not displace them.",
    ev: [{ type: "trial", claims: ["c-mh-canopy"] }],
    gap: "Measured cooling under tree clusters comes from one small trial, not a working market.",
    measure: "Shade cover over waiting and rest areas through the day; tree survival after three years.",
    pair: ["vendor-shade", "shaded-rest"] }),
  // B. water and sanitation
  R({ id: "market-toilets", fam: "B", t: "Free, clean, women-safe market toilets with water and menstrual hygiene",
    addresses: "Vendors, especially women, drinking less in hot shifts because toilets are far, locked, paid, dirty or unsafe.",
    how: "Free, maintained, well-lit, separate and wheelchair-accessible toilets with running water, soap, locks and menstrual-waste bins, treated as part of the city's heat plan, inside or beside markets.",
    where: "Open street markets, weekly haats, bus-stand vending zones and wholesale mandis.",
    works: ["No fee for vendors, at least during heat alerts", "A named, paid caretaker cleans and stocks water every day", "Open from early-morning to evening trading"],
    caution: ["A locked or dry block can be counted as delivered while vendors still drink less", "Safe access for transgender and disabled vendors needs planning, not assumption"],
    upfront: "Depends on whether an existing block is repaired or a new one built; local costing needed.",
    recurrent: "Caretaker wages, cleaning supplies, water and lighting.",
    owners: "City and local governments, water and sanitation authorities, and market committees with women vendors' oversight.",
    voice: "Women vendors help set opening hours and check that the block works.",
    equity: "Removes the reason many women vendors drink less, which matters most in the hottest hours.",
    ev: [{ type: "study", claims: ["c-mh-toilets"], alt: ["c-mh-toilets-plain"] }],
    gap: "A study links poor toilets at work to genitourinary problems among women workers; no evaluation of a market toilet upgrade on heat illness was found in the sources checked.",
    measure: "Days and hours the block is open, clean and watered during trading; how much vendors drink; reported genitourinary and heat symptoms.",
    pair: ["water-point", "stall-buddy"],
    use: { access: "Every vendor, porter and shopper, whatever their licence status.", cost: "Free to use, at least for vendors; any fee falls hardest on the lowest earners.", work: "Daily cleaning and restocking.", paid: "Paid when a caretaker is employed; unpaid if left to vendors.", excluded: "Transgender and disabled vendors if access is not planned; anyone when it is locked during trading.", info: "None.", shape: "Through vendor associations and women vendors on the market committee.", accountable: "The city or utility that owns the block, and the market committee.", check: "Whether it is open, clean and watered through the whole trading day." } }),
  R({ id: "water-point", fam: "B", t: "Free drinking-water point within a short walk of every row",
    addresses: "Vendors leaving their stalls, or spending their earnings, to drink.",
    how: "A tap stand, refill point or cooler topped up through the day, close to where people trade, in shade so the water stays cool.",
    where: "Every market row, loading bay and waiting edge.",
    works: ["Someone paid to keep it supplied, clean and tested", "Fixed quickly when it breaks, with a way to report it", "Free or very cheap, and reachable by people using wheelchairs"],
    caution: ["Water left in the sun warms up and is drunk less", "A point at one end of a long market helps only the stalls near it"],
    upfront: "Low to moderate, depending on supply; local costing needed.",
    recurrent: "Water, cleaning and testing.",
    owners: "Water utilities, city governments and market committees.",
    voice: "Vendors say where it is needed and report when it fails.",
    equity: "Helps solo vendors and porters most, who cannot leave to find water.",
    ev: [],
    gap: "No evaluation of market water points on vendors' heat illness was found in the sources checked.",
    measure: "Minutes walk from the furthest stall; days the point was dry; how much vendors drink on hot days.",
    pair: ["market-toilets", "stall-buddy"] }),
  // C. rest and queues
  R({ id: "stall-buddy", fam: "C", t: "Stall-minding buddy rosters and protected porter queue turns",
    addresses: "Vendors who cannot leave goods unguarded to drink, cool down or use a toilet, and porters who lose a paid load if they step out of the queue.",
    how: "Neighbouring stallholders agree a short-break rotation, of 10 to 15 minutes, to watch each other's stock in the hottest hours; porters' and loaders' associations hold a worker's place in the queue during agreed water and shade breaks.",
    where: "Dense street rows, solo women-run vegetable and snack stalls, and wholesale loading bays.",
    works: ["Organised through vendor or porter associations people trust", "Water and a safe toilet close enough to reach and return within the break", "Newcomers and migrant hawkers included, not only people with ties on the row"],
    caution: ["Informal arrangements can leave out people without friends on the row", "Minding stalls is work: if it falls on the same people every day, it becomes an unpaid load", "It adds to water, toilets and shade; it does not replace them"],
    upfront: "None.",
    recurrent: "None.",
    owners: "Vendor associations, women's collectives, porters' unions and market committees.",
    voice: "Vendors and porters agree the pairs, the times and the queue rule themselves.",
    equity: "Removes the daily choice between guarding stock or income and drinking or using a toilet, especially for women trading alone.",
    ev: [{ type: "guide", claims: ["c-mh-buddy-guide"] }],
    gap: "Workplace guidance describes workers watching one another in heat; stall-minding rosters and protected queue turns have not been evaluated in markets in the sources checked.",
    measure: "Breaks taken per shift by solo vendors; missed porter turns; self-reported heat symptoms.",
    pair: ["water-point", "market-toilets", "shaded-rest"],
    use: { access: "Every vendor and porter on the row or in the queue, including newcomers and migrants.", cost: "No money; time spent minding a neighbour's stall.", work: "Minding stalls and holding queue places.", paid: "Unpaid unless an association pays row leaders or stewards.", excluded: "Vendors without ties on the row, and porters outside the association that controls the queue.", info: "None.", shape: "Vendors and porters set the rules themselves.", accountable: "The association or market committee that agreed it.", check: "Who gets breaks, who does the minding, and whether anyone lost a turn." } }),
  R({ id: "shaded-rest", fam: "C", t: "A shaded place to sit and recover",
    addresses: "Nowhere cool to pause in the hottest hours.",
    how: "A shaded bench or rest point with water nearby, serving vendors, porters and shoppers, including older people and people with children.",
    where: "Beside loading bays, at the market's edge or in a nearby public room.",
    works: ["Close enough to the stalls and queue to use in a short break", "Paired with stall-minding and protected queue turns, so resting costs nothing"],
    caution: ["A rest place helps only if people can afford to stop: porters paid by the load lose money when they rest"],
    upfront: "Low: shade and seating; local costing needed.",
    recurrent: "Cleaning and upkeep.",
    owners: "Market committees and city governments.",
    voice: "Vendors and porters say where it would be used.",
    equity: "Older, pregnant and disabled vendors and porters gain most from a place to sit.",
    ev: [],
    gap: "No evaluation of market rest points was found in the sources checked.",
    measure: "Use of the rest point on hot afternoons; breaks taken by porters.",
    pair: ["stall-buddy", "water-point"] }),
  // D. livelihoods
  R({ id: "spoilage-ice", fam: "D", t: "Shared produce cooling, fair-price ice and heat-triggered cash for vendors",
    addresses: "Midday spoilage of vegetables, flowers and fish, rising ice costs, and falling footfall that pushes vendors into debt.",
    how: "Shaded evaporative produce chambers in dry heat, or a negotiated fair price for ice in fish and humid markets, together with cash that arrives when heat stops trading, paid by mobile money without needing a formal shop lease.",
    where: "Produce, flower and fish markets where unsold stock at the end of the day is a direct loss.",
    works: ["The cooling method suits the humidity: evaporative chambers work in dry heat, not in monsoon humidity", "Cash arrives within days, not weeks, and reaches vendors without formal papers"],
    caution: ["Shared cold storage can price out the smallest sellers through daily fees", "Who controls communal storage decides who benefits"],
    upfront: "Depends on the measure; a negotiated ice price needs coordination rather than money.",
    recurrent: "Upkeep of chambers, ice supply, or the cost of a cash or insurance scheme.",
    owners: "Market committees, fisheries and agriculture agencies, cooperatives, insurers and city governments.",
    voice: "Vendors help set prices, storage rules and how cash is triggered.",
    equity: "Protects the smallest traders, who borrow each morning to buy stock, from heat turning into debt.",
    ev: [{ type: "field", claims: ["c-mh-delhi-vendors"] }],
    gap: "The survey shows the loss, not a remedy; no evaluation of combined cooling and cash packages on vendors' incomes was found in the sources checked. An ice-price agreement for fish traders in Sri Lanka (2023) is described elsewhere on the site but is not cited here, because its original notice is no longer online to check.",
    measure: "Share of stock spoiled before closing; ice cost as a share of daily sales; missed loan repayments in hot months.",
    pair: ["vendor-shade"] }),
  // E. access
  R({ id: "shaded-creche", fam: "E", t: "A cool, supervised corner for children near the market",
    addresses: "Children brought to hot stalls, or a day's trade lost, when heat closes schools.",
    how: "A cooled, safe, supervised corner for young children in a market cooling room, community hall or anganwadi nearby, open during trading hours and on school heat-closure days.",
    where: "Neighbourhood markets and vending clusters where parents, mostly women, trade with young children.",
    works: ["Paid, trusted local caregivers, not unpaid volunteers", "Open during real market hours", "Free, with no employer or address papers needed"],
    caution: ["Drinking water, oral rehydration salts, clean mats and backup power for fans keep the room from overheating in afternoon power cuts", "Child care with no paid staff becomes one more unpaid job for women"],
    upfront: "Cooling, mats and fans in an existing public room; local costing needed.",
    recurrent: "Caregivers' pay, water and electricity in alert weeks.",
    owners: "City and local governments, women's collectives, NGOs and market associations.",
    voice: "Parents help set hours and choose caregivers.",
    equity: "Keeps young children out of direct heat while parents keep earning, and older siblings in school.",
    ev: [{ type: "study", claims: ["c-mh-schools"] }],
    gap: "School heat closures are documented at scale; market-linked crèches have not been evaluated in the sources checked.",
    measure: "Children attending on alert days; parents' trading hours kept; children's heat-symptom visits.",
    pair: ["shaded-rest"] }),
  // F. governance
  R({ id: "market-messengers", fam: "F", t: "Two-way market heat boards and trusted vendor messengers",
    addresses: "Alerts that are app-only or text-heavy, missing vendors who cannot read them, are deaf, speak another language or have no smartphone, and advice with no service behind it.",
    how: "Colour-coded heat boards at market entrances and on carts, with voice-note alerts in local languages sent to elected vendor leaders, who pass them along the row and report back missing water, broken fans or emergencies.",
    where: "Any open market, labour chowk or multilingual mandi.",
    works: ["Every alert names a water point, toilet or cool space that is open", "A city or clinic contact acts on what vendors report"],
    caution: ["'Stay indoors' advice does not fit people who have to trade to eat", "Boards that rely on reading or hearing miss deaf and non-literate vendors unless they use colour and pictures"],
    upfront: "Low: weatherproof boards and a messaging group.",
    recurrent: "Phone credit or small stipends for messengers on alert days, and the city's follow-through.",
    owners: "Weather services, vendor unions, community groups and municipal heat cells.",
    voice: "Vendors elect the messengers and use the channel to report problems.",
    equity: "Reaches vendors without smartphones, reading or the local language, and gives them a way to be heard.",
    ev: [{ type: "field", claims: ["c-mh-delhi-boards"] }],
    gap: "Described as set up in Delhi; its effect on health or behaviour has not been evaluated in the sources checked.",
    measure: "Share of vendors on the row who know the day's alert level; time to fix a reported broken water point or toilet.",
    pair: ["water-point", "market-toilets"] }),
  R({ id: "pitch-protection", fam: "F", t: "Pitch protection and vendors on the committee before any upgrade",
    addresses: "Shade, greening or street works that push informal, migrant, women and transgender vendors off their pitches, and decisions made without them.",
    how: "Before works begin, licensed and unlicensed vendors are listed, their places guaranteed in writing, and women vendors given seats on the committee that designs the upgrade.",
    where: "Any market or vending street facing an upgrade, cooling project or beautification scheme.",
    works: ["The list includes unlicensed and migrant vendors", "Women vendors have a vote, not only a consultation"],
    caution: ["A consultation after the design is fixed changes little"],
    upfront: "Coordination time.",
    recurrent: "Committee time.",
    owners: "City governments, street-vending committees and vendor associations.",
    voice: "Vendors sit on the committee that decides.",
    equity: "Keeps the people a cooling project was meant for in the place it cools.",
    ev: [],
    gap: "Common Shade's reading of the displacement risk; no evaluation of pitch protection in heat projects was found in the sources checked.",
    measure: "Vendors on the same pitches a year after the works; women vendors on the committee.",
    pair: ["vendor-shade", "street-trees"] })
];

// cycles each record touches, by id on /loops/
const CYCLES = { "vendor-shade": ["squeeze", "greendisplace", "poverty"], "street-trees": ["greendisplace"], "market-toilets": ["poverty", "clinic"], "water-point": ["poverty"], "stall-buddy": ["poverty", "squeeze"], "shaded-rest": ["poverty"], "spoilage-ice": ["squeeze", "poverty"], "shaded-creche": ["school", "poverty"], "market-messengers": ["invisible", "clinic"], "pitch-protection": ["greendisplace"] };

const CONDITIONS = [
  { id: "noshade", t: "No overhead shade on stalls", why: "Direct sun and hot paving add the most heat to people standing still for hours.", fams: ["A"], recs: ["vendor-shade", "street-trees", "pitch-protection"], next: "Note which stalls and queues sit in full sun at 13:00, and what is allowed overhead." },
  { id: "toilets", t: "Toilets locked, paid, far or unsafe", why: "People drink less to avoid them.", fams: ["B", "C"], recs: ["market-toilets", "water-point", "stall-buddy"], next: "Check opening hours, fees, water, locks and lighting against trading hours; ask women vendors privately." },
  { id: "guard", t: "Vendors cannot leave stalls unguarded", why: "A break costs goods or sales.", fams: ["C"], recs: ["stall-buddy", "water-point", "shaded-rest"], next: "Ask who minds stalls now, and who has no one." },
  { id: "spoil", t: "Produce or fish spoiling by midday", why: "Spoiled stock and fewer customers turn heat into debt.", fams: ["D"], recs: ["spoilage-ice", "vendor-shade"], next: "Record what spoils first, the ice price, and daily loan or rent payments." },
  { id: "turns", t: "Porters lose turns if they rest", why: "Rest has a price for people paid by the load.", fams: ["C"], recs: ["stall-buddy", "shaded-rest", "water-point"], next: "Ask porters' associations how the queue works and whether a place can be held." },
  { id: "eviction", t: "Vendors fear eviction during upgrades", why: "Cooling projects can displace the people they were meant for.", fams: ["F", "A"], recs: ["pitch-protection", "vendor-shade", "street-trees"], next: "List every vendor, licensed or not, before any design is agreed." },
  { id: "children", t: "Children at stalls when schools close", why: "Children sit in the heat, or a parent loses a day's trade.", fams: ["E"], recs: ["shaded-creche", "shaded-rest"], next: "Ask parents where children are on closure days and what a cool, supervised space would need." }
];

const FINDER = {
  intro: "Tick what you see. The finder lists measures that address those conditions, with the reason and what to find out next. It does not score a market or declare it safe: only measurement, vendors' and porters' own reports and qualified assessment can do that.",
  none: "Tick at least one condition to see where to look."
};

const EXAMPLES = [
  { id: "ex-veg", t: "A women-majority vegetable market with no safe toilets and a sharp afternoon drop-off", tag: "Illustrative example",
    problem: "Most sellers are women trading alone. The nearest toilet is paid and closes at 18:00; several sellers say they drink little until they get home. Many leave by early afternoon.",
    missing: "Whether sellers leave early because of heat, the toilet, low footfall or care at home; how much they drink; whether the block has water.",
    measures: ["market-toilets", "water-point", "stall-buddy", "vendor-shade"],
    org: "The city waives the fee for vendors and pays a caretaker; women vendors set hours with the market committee; neighbours agree a stall-minding rota for the hottest hours.",
    verify: "Hours the block is open and watered; how much sellers drink on hot days; how late they stay; reported symptoms over a hot month.", claims: ["c-mh-toilets"] },
  { id: "ex-porters", t: "A wholesale loading yard where porters skip water and shade to keep their turn", tag: "Illustrative example",
    problem: "Porters paid by the load queue in the open from 05:00. Anyone who steps away loses their place.",
    missing: "How the queue is run and by whom; loads per hour through the day; where water and shade could go.",
    measures: ["stall-buddy", "shaded-rest", "water-point"],
    org: "The porters' association agrees that a place is held during a water break; the market committee puts shade and water beside the queue.",
    verify: "Breaks taken without losing a turn; loads per day before and after; reported heat symptoms.", claims: [] },
  { id: "ex-fish", t: "A coastal fish and produce market where midday spoilage and ice prices wipe out margins", tag: "Illustrative example",
    problem: "Fish sellers buy ice each morning; in the hottest weeks prices rise and footfall falls. Some miss loan repayments.",
    missing: "Ice cost as a share of sales; how much stock is thrown away; who controls cold storage; whether a cash scheme could reach sellers without papers.",
    measures: ["spoilage-ice", "vendor-shade"],
    org: "The fisheries agency and the market committee bring traders and ice suppliers together on price; a heat-triggered cash scheme is explored with sellers.",
    verify: "Ice cost and spoilage before and after; missed repayments in hot months.", claims: ["c-mh-delhi-vendors"] },
  { id: "ex-coolstreet", t: "A 'cool street' upgrade where unlicensed vendors risk displacement", tag: "Illustrative example",
    problem: "The city plans trees, shade and new paving on a busy vending street. Licensed vendors were consulted; unlicensed vendors were not counted.",
    missing: "Who trades there and when, including unlicensed and migrant vendors; whether the paving is reflective; where vendors go during works.",
    measures: ["pitch-protection", "vendor-shade", "street-trees"],
    org: "Every vendor is listed and their place guaranteed before works; women vendors sit on the design committee; reflective paving is paired with shade.",
    verify: "Vendors on the same pitches a year later; radiant temperature at stalls before and after.", claims: ["c-mh-la-pavement"] }
];

const GAPS = [
  "Few independent evaluations of market shade on vendors' health or earnings: the measurements found are of temperature.",
  "Little measured evidence that sanitation upgrades in Asian markets reduce heat-linked dehydration or urinary problems.",
  "Stall-minding rosters, protected queue turns and market crèches are described or proposed, not evaluated.",
  "Heat alerts for vendors are documented as set up; their effect on what vendors do, or on illness, is not yet measured.",
  "Little is known about heat among deaf, disabled, migrant and transgender vendors in particular."
];

const WORKSHEET = {
  slug: "market-heat/worksheet",
  title: "Walk the market together: a heat check for street vendors, porters and market teams",
  lede: "Walk the market in the hottest trading hours, around 12:00 to 15:00, with women vendors, porters and market staff. Note what people face, what stands in the way of a fix, and three steps to agree before the next hot spell.",
  checks: [
    { t: "Shade and surfaces", q: "Which stalls and queues sit in full sun? Is hot paving or shop air-conditioner exhaust heating the aisle? Will canopies survive pre-monsoon wind?" },
    { t: "Drinking water", q: "Is free, safe, cool drinking water within a two-minute walk of every row? Who refills and cleans it every day?" },
    { t: "Toilets and hygiene", q: "Are clean, safe, lit toilets open and free through all trading hours, with water, locks and menstrual-waste bins? Do vendors drink less to avoid them?" },
    { t: "Stall-minding and queues", q: "Can a vendor alone leave the stall for 15 minutes without losing goods? Can a porter rest without losing a paid load?" },
    { t: "Stock, ice and income", q: "What spoils fastest by midday? Has the price of ice risen? Which vendors lose most when footfall drops?" },
    { t: "Children and access", q: "Are children sitting at hot stalls? Can deaf, disabled, migrant and transgender vendors reach warnings, water and rest safely?" }
  ],
  protect: ["No eviction or pitch loss: licensed and unlicensed vendors have their space guaranteed before any shade, tree planting or street work begins", "No unpaid burden: upkeep (water, toilet cleaning, child care) is paid work, not left to women vendors for free", "Ready before the heat: shade anchors, taps and boards are checked before the season starts", "Two-way alerts: every heat alert names an open water point, rest space and clinic contact, and who fixes them when they break"],
  steps: ["Action we want to try", "Who in the market leads", "Who else needs to agree or help pay", "How we will check it worked"],
  note: "Adapted from Common Shade, Heat in markets and street vending. Free to copy, translate and print with your own association's name, under CC BY 4.0."
};

function claimsUsed() {
  const s = new Set(), add = a => (a || []).forEach(c => s.add(c));
  UNDERSTAND.factors.forEach(f => add(f.claims)); HEALTH.dims.forEach(d => { add(d.claims); if (d.alt) add(d.alt.claims); });
  RECORDS.forEach(r => r.ev.forEach(e => { add(e.claims); add(e.alt); })); EXAMPLES.forEach(e => add(e.claims));
  return [...s];
}

// llms-full.txt: the same words as plain text; ok is the set of confirmed claim ids
function md(SITE, ok) {
  const okc = id => !ok || ok.has(id), all = ids => (ids || []).every(okc);
  const evOf = r => { const ev = r.ev.map(e => ({ type: e.type, claims: all(e.claims) ? e.claims : (e.alt || []).filter(okc) })).filter(e => e.claims.length); return ev.length ? ev : [{ type: "proposal", claims: [] }]; };
  const dim = d => all(d.claims) ? d.d : d.alt && all(d.alt.claims) ? d.alt.d : null;
  const fac = f => all(f.claims) ? f.d : f.d.split(". ")[0] + ".";
  const L = [`## ${TITLE}`, `${SITE}/${SLUG}/`, SUB, "", `### ${OPEN.q}`, OPEN.a, `${OPEN.label}:`, ...OPEN.stops.map(s => `- ${s.place}: ${s.text}`), OPEN.close, "",
    "### Understand market heat", UNDERSTAND.intro, ...UNDERSTAND.factors.map(f => `- ${f.t}: ${fac(f)}`), UNDERSTAND.numbers, "",
    "### Explore a market (an illustrative street market, not a survey)",
    ...ZONES.map(z => `#### ${z.t}\n- Heat sources: ${z.sources.join("; ")}\n- Around 13:30: ${z.time.peak}\n- At the edges of the day: ${z.time.edge}\n- Who works or waits here: ${z.who}\n- Ask: ${z.ask.join(" ")}\n- Measure: ${z.measure.join("; ")}\n- Measures to consider: ${z.fixes.map(id => RECORDS.find(r => r.id === id).t).join("; ")}\n- Depends on: ${z.depends}`), "",
    "### Health and equity", HEALTH.intro, ...HEALTH.split.map(s => `- ${s.t}: ${s.d}`), ...HEALTH.dims.filter(dim).map(d => `- ${d.t}: ${dim(d)}`), HEALTH.agency, "",
    "### Intervention library", `Evidence types: ${Object.values(EV).join("; ")}.`,
    ...FAMILIES.map(f => [`#### ${f.id}. ${f.t}`, f.d, ...RECORDS.filter(r => r.fam === f.id).map(r =>
      `- ${r.t} [rec-${r.id}]. Addresses: ${r.addresses} How: ${r.how} Where: ${r.where} Works if: ${r.works.join("; ")}. Take care: ${r.caution.join("; ") || "not assessed yet"}. Upfront: ${/^none\.?$/i.test(r.upfront) ? "no equipment to buy; time and coordination, local costing needed." : r.upfront} Running: ${/^none\.?$/i.test(r.recurrent) ? "not assessed; local costing needed." : r.recurrent} Who runs it: ${r.owners} Equity and access: ${r.equity} Evidence: ${evOf(r).map(e => EV[e.type]).join("; ")}. ${r.gap} Measure before and after: ${r.measure}`)].join("\n")), "",
    "### Finder: what you observe, and where to look", FINDER.intro, ...CONDITIONS.map(c => `- ${c.t}: ${c.why} Look at: ${c.recs.map(id => RECORDS.find(r => r.id === id).t).join("; ")}. Find out next: ${c.next}`), "",
    "### Worked examples (illustrative)", ...EXAMPLES.map(e => `#### ${e.t}\n- Observed problem: ${e.problem}\n- Missing information: ${e.missing}\n- Candidate measures: ${e.measures.map(id => RECORDS.find(r => r.id === id).t).join("; ")}\n- Arrangements: ${e.org}\n- Verification plan: ${e.verify}`), "",
    "### What is not known", ...GAPS.map(g => `- ${g}`), "",
    `Worksheet to print: ${SITE}/${WORKSHEET.slug}/`, ""];
  return L.join("\n");
}

module.exports = { SLUG, TITLE, SUB, DESC, EV, EV_NOTE, OPEN, ENTRIES, ZONES, UNDERSTAND, HEALTH, FAMILIES, RECORDS, CYCLES, CONDITIONS, FINDER, EXAMPLES, GAPS, WORKSHEET, claimsUsed, md };
