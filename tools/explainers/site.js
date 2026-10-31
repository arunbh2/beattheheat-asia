// Explainers for pages across the site, in the glossary style (see specs.js for the scene types).
// Every number is one the page it sits on already cites, with its source. Country films describe what is in place
// and what is being built, in the snapshots' own careful terms; no person is named. *word* is highlighted in orange.
"use strict";
const END = (line, url) => ({ type: "end", say: [line], line, url });
const C = "Country snapshot", HE = "The heat economy";

module.exports = [
  // ---- the seven country snapshots ----
  { id: "country-bangladesh", term: "Bangladesh and heat", page: "countries/bangladesh/index.html", label: C, url: "beattheheat.asia/countries/bangladesh", scenes: [
    { type: "hook", q: "How is Bangladesh *getting ready* for heat?", say: ["How is Bangladesh getting ready for heat?"] },
    { type: "show", k: "The heat", title: "Hot days, *warm nights*", sub: "Daytime hotspots in the west and south-west; humid heat and warm nights in the cities.", say: ["Bangladesh has daytime hotspots in the west and south-west,", "and humid heat and warm nights in its crowded cities."], src: "PLOS ONE; PLOS Climate; World Bank, 2025", d: { kind: "art", name: "moon", at: 0, top: 330, size: 600 } },
    { type: "show", dark: true, k: "Bangladesh, 2024", title: "250 million", sub: "workdays lost to heat-related illness, worth up to US$1.78 billion", say: ["In 2024, heat-related illness cost two hundred and fifty million workdays."], src: "World Bank, 2025" },
    { type: "show", title: "What is in place", sub: "From national strategy to a city plan", say: ["What is in place:", "a National Adaptation Plan to 2050,", "a health adaptation plan adopted in 2026,", "national guidance on heat illness, and a city heat plan in Narayanganj."],
      src: "UNDP; UNFPA; Ministry of Health guideline, 2024; ICLEI South Asia, 2025",
      d: { kind: "flow", steps: [{ k: "2023–2050", text: "National Adaptation Plan", at: 1 }, { k: "2026–2031", text: "Health adaptation plan", at: 2 }, { k: "2024", text: "Guideline on heat illness", at: 3 }, { k: "2025", text: "Narayanganj city heat plan", at: 3, good: true }] } },
    END("From plans on paper to protection people can use.") ] },

  { id: "country-india", term: "India and heat", page: "countries/india/index.html", label: C, url: "beattheheat.asia/countries/india", scenes: [
    { type: "hook", q: "One country. *Three kinds of heat.*", say: ["One country. Three kinds of heat."] },
    { type: "show", title: "Hot-dry, composite, hot-humid", sub: "Different heat needs different warnings and different cooling.", say: ["India spans hot and dry places,", "places that swing between the two,", "and hot, humid coasts. Each needs different warnings and cooling."], src: "CEEW; India Meteorological Department",
      d: { kind: "panels", items: [{ label: "Hot-dry", v: "Fierce days", color: "var(--orange)", at: 0 }, { label: "Composite", v: "Both, by season", color: "var(--ink)", at: 1 }, { label: "Hot-humid", v: "Sweat can’t cool", color: "#2a7fb8", at: 2 }] } },
    { type: "show", title: "Plans at every level", say: ["Protection is planned at every level:", "national health advisories,", "state plans such as Tamil Nadu’s,", "city plans such as Delhi’s and Chennai’s, and workplace rules notified in 2026."],
      src: "NCDC, 2026; Tamil Nadu State Heat Action Plan, 2026; Delhi Heat Action Plan, 2025; Central OSH Rules, 2026",
      d: { kind: "flow", steps: [{ k: "National", text: "Health advisories", at: 1 }, { k: "State", text: "Tamil Nadu, 2026", at: 2 }, { k: "City", text: "Delhi, Chennai", at: 3 }, { k: "Work", text: "Safety rules, 2026", at: 3, good: true }] } },
    { type: "statement", line: "It began in *Ahmedabad,* in 2013.", sub: "South Asia’s first city heat plan. The model has spread to many cities and states.", say: ["It began in Ahmedabad, in 2013:", "South Asia’s first city heat plan, a model since taken up across the country."] },
    END("Many plans; the next step is making every one reach people.") ] },

  { id: "country-indonesia", term: "Indonesia and heat", page: "countries/indonesia/index.html", label: C, url: "beattheheat.asia/countries/indonesia", scenes: [
    { type: "hook", q: "Humid heat, *all year round.*", say: ["Across Indonesia’s islands, the heat is humid, all year round."] },
    { type: "show", k: "Indonesia, 2024", title: "*+0.8 °C*", sub: "national temperature anomaly, against 1991–2020, from 117 weather stations", say: ["In 2024, Indonesia’s weather stations ran point eight of a degree above the 1991 to 2020 average."], src: "BMKG, annual temperature anomaly, 2024",
      d: { kind: "stats", items: [{ count: 0.8, dec: 1, pre: "+", suf: " °C", label: "above the 1991–2020 average", at: 0 }, { count: 117, label: "weather stations in the national summary", color: "var(--ink)", at: 0 }] } },
    { type: "show", title: "What is being built", say: ["A health climate action plan, adopted by ministerial decree in 2025,", "and a national cooling plan that combines passive design, efficiency and cleaner refrigerants."], src: "Ministry of Health decree, 2025; Indonesia National Cooling Action Plan, 2024",
      d: { kind: "flow", steps: [{ k: "2025–2030", text: "Health climate action plan", at: 0 }, { k: "Cooling plan", text: "Passive design", at: 1, good: true }, { k: "With", text: "Efficient machines", at: 1 }, { k: "And", text: "Cleaner refrigerants", at: 1 }] } },
    { type: "statement", line: "Half of Southeast Asia’s air conditioners, *by 2040.*", sub: "That’s how many could be in Indonesia, so cooler buildings matter.", say: ["By 2040, half of Southeast Asia’s air conditioners could be in Indonesia,", "which is why cooler buildings matter so much."] },
    END("Cool by design, and by efficient machines.") ] },

  { id: "country-nepal", term: "Nepal and heat", page: "countries/nepal/index.html", label: C, url: "beattheheat.asia/countries/nepal", scenes: [
    { type: "hook", q: "Heat in the *plains below the mountains.*", say: ["Nepal’s heat is felt most in the plains below the mountains: the Terai."] },
    { type: "show", title: "Dry, then humid", sub: "Fierce dry heat before the monsoon, then humid heat and nights that don’t cool.", say: ["Before the monsoon, the heat is dry and fierce.", "Then it turns humid, and nights stop cooling down."], src: "Department of Hydrology and Meteorology; Dhangadhi Heat Action Plan, 2025",
      d: { kind: "panels", items: [{ label: "Before the monsoon", v: "Dry heat", at: 0 }, { label: "During the monsoon", v: "Humid nights", color: "#2a7fb8", at: 1 }] } },
    { type: "show", k: "National heatwave plan, 2024", title: "Every agency, *a role*", say: ["Nepal’s 2024 national heatwave plan gives agencies their roles", "for warnings, water, health, schools, electricity and workplaces."], src: "NDRRMA, national heatwave action plan, 2024",
      d: { kind: "grid", step: .3, items: ["Warnings", "Water", "Health", "Schools", "Electricity", "Workplaces"].map(t => ({ text: t, at: 1 })) } },
    { type: "statement", line: "Local plans lead the way.", sub: "Nepalgunj wrote the country’s first in 2023; Dhangadhi followed in 2025.", say: ["And local plans lead the way:", "Nepalgunj wrote the country’s first in 2023, and Dhangadhi followed."] },
    END("National roles, local plans, one season at a time.") ] },

  { id: "country-philippines", term: "The Philippines and heat", page: "countries/philippines/index.html", label: C, url: "beattheheat.asia/countries/philippines", scenes: [
    { type: "hook", q: "A humid country, with a *hot dry season.*", say: ["A humid country, with a hot dry season."] },
    { type: "show", title: "March to May", sub: "The hot dry season. And night-time lows are rising faster than daytime highs.", say: ["The weather service marks March to May as the hot dry season.", "And the national adaptation plan finds night-time lows rising faster than daytime highs."], src: "PAGASA; Philippine National Adaptation Plan 2023–2050", d: { kind: "art", name: "moon", at: 1, top: 330, size: 600 } },
    { type: "show", k: "Heat index bands", title: "Four official levels", say: ["Warnings use four heat index bands.", "From forty-two degrees, it’s a danger level."], src: "PAGASA heat index categories, as reported by GMA News",
      d: { kind: "scale", min: 24, max: 56, unit: "°", ticks: [27, 33, 42, 52], colors: ["#F2C14E", "#F26430", "#D7263D", "#7a1020"], zones: [{ from: 42, to: 52, label: "Danger", color: "#D7263D", at: 1 }],
        marks: [{ v: 27, label: "27°", sub: "Caution", at: 0 }, { v: 33, label: "33°", sub: "Extreme caution", at: 0, up: true }, { v: 42, label: "42°", sub: "Danger", color: "#D7263D", at: 1 }, { v: 52, label: "52°", sub: "Extreme danger", at: 1, up: true }] } },
    { type: "show", title: "Who acts", say: ["Local disaster offices plan the response,", "labour guidance protects workers such as delivery riders,", "and cities like Quezon City have heat action teams."], src: "Republic Act 10121; Philippine Daily Inquirer, October 2026; Quezon City Government",
      d: { kind: "flow", steps: [{ k: "Local", text: "Disaster risk offices", at: 0 }, { k: "Work", text: "Labour guidance for riders", at: 1 }, { k: "City", text: "Quezon City heat team", at: 2, good: true }] } },
    END("Warnings that switch on protection, from city hall to the street.") ] },

  { id: "country-srilanka", term: "Sri Lanka and heat", page: "countries/sri-lanka/index.html", label: C, url: "beattheheat.asia/countries/sri-lanka", scenes: [
    { type: "hook", q: "Humid heat, and *warmer nights.*", say: ["In Sri Lanka, heat means humid air, and warmer nights."] },
    { type: "show", k: "2026", title: "Warm weather advisories", sub: "Issued by the Disaster Management Centre in April, August and October 2026.", say: ["The Disaster Management Centre issues warm weather advisories:", "in 2026, in April, August and October."], src: "Disaster Management Centre, Sri Lanka, 2026", d: { kind: "art", name: "bell", at: 0, top: 330, size: 600 } },
    { type: "show", title: "What is being built", say: ["A heat-health action plan is listed in Sri Lanka’s climate commitments to 2035.", "A national roadmap for acting before disasters was launched in June 2026.", "And Colombo has guidelines for a heat plan that sees women’s work."],
      src: "Sri Lanka NDC 3.0, 2026–2035; National Anticipatory Action Roadmap, 2026; Asia-Pacific Network for Global Change Research",
      d: { kind: "flow", steps: [{ k: "To 2035", text: "Heat-health plan proposed", at: 0 }, { k: "June 2026", text: "Roadmap for early action", at: 1 }, { k: "Colombo", text: "Gender-sensitive heat plan guidelines", at: 2, good: true }] } },
    END("Acting before the heat, not after it.") ] },

  { id: "country-thailand", term: "Thailand and heat", page: "countries/thailand/index.html", label: C, url: "beattheheat.asia/countries/thailand", scenes: [
    { type: "hook", q: "How much *hotter* is Thailand getting?", say: ["How much hotter is Thailand getting?"] },
    { type: "show", k: "Thailand, 2024", title: "28.5 °C", sub: "national mean temperature, against 27.4 °C in 1991–2020", say: ["In 2024, the national mean was twenty-eight point five degrees,", "more than a degree above the 1991 to 2020 average."], src: "Thai Meteorological Department, annual climate summary, 2024",
      d: { kind: "bars", max: 28.5, rows: [{ label: "1991–2020 average", n: 27.4, count: 27.4, dec: 1, suf: "°", color: "var(--ink)", at: 0 }, { label: "2024", n: 28.5, count: 28.5, dec: 1, suf: "°", at: 0 }] } },
    { type: "show", dark: true, k: "Tak, April 2023", title: "45.4 °C", sub: "Thailand’s highest temperature on record, at the time", say: ["In April 2023, Tak reached forty-five point four: a national record."], src: "Heatwaves that shaped South and Southeast Asia, on Common Shade" },
    { type: "show", k: "Bangkok, 2026", title: "*304* cooling centres", sub: "in schools, health centres and district offices, with a city strategy to finance heat action", say: ["In 2026, Bangkok opened three hundred and four cooling centres,", "with a strategy for financing its response to heat."], src: "Government of Thailand, 2026; UNDP, Bangkok financing strategy",
      d: { kind: "art", name: "clinic", at: 0, top: 360, size: 560 } },
    END("Cool rooms close to home, open when they’re needed.") ] },

  // ---- other pages with no film ----
  { id: "cities", term: "Twelve cities", page: "cities/index.html", label: "Twelve cities", url: "beattheheat.asia/cities", scenes: [
    { type: "hook", q: "Twelve cities. *Twelve different summers.*", say: ["Twelve Asian cities. Twelve different summers."] },
    { type: "show", title: "Where the heat plans stand", sub: "From our October 2026 research. A plan not found is a gap in what we found.", say: ["In four, a heat plan is in force.", "In five, parts are in place.", "In three, we found no published city plan yet."],
      d: { kind: "bars", max: 5, rows: [{ label: "Heat plan in force", n: 4, count: 4, color: "var(--green)", at: 0 }, { label: "Parts in place", n: 5, count: 5, at: 1 }, { label: "No published plan found", n: 3, count: 3, color: "var(--ink)", at: 2 }] } },
    { type: "show", title: "Ideas worth borrowing", say: ["Each city has something to share:", "Ahmedabad’s plan, the region’s first;", "Dhaka’s chief heat officer;", "Bangkok’s cooling centres; Singapore’s heat stress advisory."],
      d: { kind: "flow", steps: [{ k: "Ahmedabad", text: "First city heat plan", at: 1 }, { k: "Dhaka", text: "A chief heat officer", at: 2 }, { k: "Bangkok", text: "304 cooling centres", at: 3 }, { k: "Singapore", text: "Heat stress advisory", at: 3 }] } },
    END("Learn city to city.") ] },

  { id: "he-businesses", term: "Businesses that protect from heat", page: "heat-economy/businesses/index.html", label: HE, url: "beattheheat.asia/heat-economy/businesses", scenes: [
    { type: "hook", q: "Who *sells* protection from heat?", say: ["Who sells protection from heat?"] },
    { type: "show", title: "91 businesses", sub: "57 of them work in South or Southeast Asia", say: ["We found ninety-one businesses,", "fifty-seven of them working in South or Southeast Asia."],
      d: { kind: "stats", items: [{ count: 91, label: "businesses offering protection", at: 0 }, { count: 57, label: "working in South or Southeast Asia", color: "var(--ink)", at: 1 }] } },
    { type: "show", title: "What they offer", say: ["Most work in cold storage for food and medicine, and efficient cooling,", "then fans, cool roofs and evaporative coolers."],
      d: { kind: "bars", max: 21, rows: [{ label: "Cold storage", n: 21, count: 21, at: 0 }, { label: "Efficient air conditioning", n: 16, count: 16, at: 0 }, { label: "Efficient fans", n: 9, count: 9, color: "var(--ink)", at: 1 }, { label: "Cool roofs", n: 7, count: 7, color: "var(--ink)", at: 1 }, { label: "Evaporative coolers", n: 6, count: 6, color: "var(--ink)", at: 1 }] } },
    { type: "statement", line: "Listed, *not endorsed.*", sub: "Companies describe their own products. Ask before you buy.", say: ["Being listed is not an endorsement.", "Companies describe their own products, so ask before you buy."] },
    END("Find who makes it, then ask the hard questions.") ] },

  { id: "he-conditions", term: "Four questions before you buy", page: "heat-economy/conditions/index.html", label: HE, url: "beattheheat.asia/heat-economy/conditions", scenes: [
    { type: "hook", q: "Before you buy, fund or start: *ask four questions.*", say: ["Before you buy, fund or start something: ask four questions."] },
    { type: "show", title: "Four questions", say: ["Does it really protect people here?", "Is it fair?", "Who keeps it working?", "And who pays, and who carries the risk?"],
      d: { kind: "grid", step: 0, items: [{ text: "Does it really protect people here?", at: 0 }, { text: "Is it fair?", at: 1 }, { text: "Who keeps it working?", at: 2 }, { text: "Who pays, and who carries the risk?", at: 3 }] } },
    { type: "statement", line: "*24 questions* in all.", sub: "With the rules and ways of paying that have helped elsewhere.", say: ["There are twenty-four in all,", "with the rules and ways of paying that have helped elsewhere."] },
    END("Protection that works, lasts and reaches everyone.") ] },

  { id: "he-money", term: "Money for heat protection", page: "heat-economy/money/index.html", label: HE, url: "beattheheat.asia/heat-economy/money", scenes: [
    { type: "hook", q: "Where does the money for heat protection *come from?*", say: ["Where does the money for heat protection come from?"] },
    { type: "show", title: "What we traced", sub: "From public websites and reports, October 2026", say: ["We traced forty-eight funders and investors,", "fifty pieces of funding,", "and twenty-four accelerators, prizes and challenges."],
      d: { kind: "stats", items: [{ count: 48, label: "funders and investors", at: 0 }, { count: 50, label: "pieces of funding", color: "var(--ink)", at: 1 }, { count: 24, label: "accelerators, prizes and challenges", color: "var(--green)", at: 2 }] } },
    { type: "statement", line: "Announced is *not the same as paid.*", sub: "Money often arrives in stages, or later.", say: ["One rule for reading funding news: announced is not the same as paid.", "Money often arrives in stages, or later."] },
    END("Follow the money to where it lands.") ] },

  { id: "he-opportunities", term: "Business ideas for heat", page: "heat-economy/opportunities/index.html", label: HE, url: "beattheheat.asia/heat-economy/opportunities", scenes: [
    { type: "hook", q: "Can protecting people from heat *be a business?*", say: ["Can protecting people from heat be a business?"] },
    { type: "show", title: "32 ideas, 21 cycles", sub: "At least one idea for every vicious cycle on the map", say: ["Here are thirty-two ideas,", "at least one for every one of the twenty-one vicious cycles."],
      d: { kind: "stats", items: [{ count: 32, label: "ideas for businesses and services", at: 0 }, { count: 21, label: "vicious cycles, each with an idea", color: "var(--ink)", at: 1 }] } },
    { type: "statement", line: "Sell protection that’s *looked after.*", sub: "Not just a product: a service kept working over time.", say: ["The strongest ideas sell protection that is looked after over time,", "not just a product."] },
    { type: "statement", line: "Ideas to *test,* not proven models.", say: ["They are ideas to explore and test, not proven models."] },
    END("Who could pay, who it helps, what needs to be in place.") ] },

  { id: "heat-network", term: "The heat network", page: "heat-network/index.html", label: "The heat network", url: "beattheheat.asia/heat-network", scenes: [
    { type: "hook", q: "Who is *already working* on heat?", say: ["Who is already working on heat?"] },
    { type: "show", dark: true, k: "Across Asia and the world", title: "330", sub: "organisations working on parts of the web of extreme heat", say: ["We found three hundred and thirty organisations, working on parts of the web of heat."] },
    { type: "show", title: "Three sides of an alliance", say: ["Some hold the need, or the duty to protect people.", "Some supply what protection needs.", "And some connect the two."],
      d: { kind: "panels", items: [{ label: "Demand", v: "Need or duty", note: "Governments, employers, workers’ and community groups", at: 0 }, { label: "Supply", v: "What it takes", color: "var(--ink)", note: "Technology, services, insurance, finance, research", at: 1 }, { label: "Platform", v: "Connectors", color: "var(--green)", note: "Networks, alliances and rule-setters", at: 2 }] } },
    { type: "statement", line: "Listed for their work, *not as partners.*", say: ["Inclusion describes published work. It doesn’t imply partnership or endorsement."] },
    END("See who could hold up the shade with you.") ] },

  { id: "guide", term: "How to use Common Shade", page: "guide/index.html", label: "How to use this site", url: "beattheheat.asia/guide", scenes: [
    { type: "hook", q: "A big site. *A short path.*", say: ["Common Shade is large on purpose.", "You don’t need all of it."] },
    { type: "show", title: "Four parts", say: ["Understand: the web of heat, the cycles, cities and past heatwaves.", "Act: practical actions, cooling and paying for protection.", "Tools: exercises to plan and test protection.", "And reference: sources and the glossary."],
      d: { kind: "flow", steps: [{ k: "Understand", text: "The web, cycles, cities", at: 0 }, { k: "Act", text: "Actions, cooling, money", at: 1 }, { k: "Tools", text: "Plan and test", at: 2 }, { k: "Reference", text: "Sources, glossary", at: 3 }] } },
    { type: "statement", line: "Answer *two questions.*", sub: "Who you are, and what you need. Then follow a short path.", say: ["Answer two questions, and follow a short path.", "There’s even a running order for a ninety-minute workshop."] },
    END("Start where you are.") ] },

  { id: "join", term: "Help build Common Shade", page: "join/index.html", label: "Help build Common Shade", url: "beattheheat.asia/join", scenes: [
    { type: "hook", q: "Shade is something we *hold up together.*", say: ["Shade is something we hold up together."] },
    { type: "show", title: "Why it takes many hands", say: ["A shaded workplace needs permission, maintenance and water.", "A heat warning needs someone able to act on it.", "And a break needs to be possible without losing the day’s income."],
      d: { kind: "flow", steps: [{ k: "Shade", text: "Permission, upkeep, water", at: 0 }, { k: "Warning", text: "Someone able to act", at: 1 }, { k: "Rest", text: "Without losing income", at: 2, good: true }] } },
    { type: "statement", line: "Different entry points. *One commitment.*", sub: "Tell us what you work on, and what you could bring.", say: ["Different entry points, one shared commitment.", "Tell us what you work on, and what you could bring."] },
    END("Join the collaborative.") ] },

  { id: "news", term: "Reading a heat headline", page: "news/index.html", label: "Heat in the news", url: "beattheheat.asia/news", scenes: [
    { type: "hook", q: "How to read *a heat headline.*", say: ["How to read a heat headline."] },
    { type: "show", title: "Four things to check", say: ["Which measure? Air temperature, heat index and WBGT are different numbers.", "Confirmed, or suspected? The counts can be far apart.", "Who said it, and how do they know?", "And what happened next?"],
      d: { kind: "grid", step: 0, items: [{ text: "Which measure?", at: 0 }, { text: "Confirmed or suspected?", at: 1 }, { text: "Who said it?", at: 2 }, { text: "What happened next?", at: 3 }] } },
    { type: "statement", line: "Every headline we show is *kept.*", sub: "With its link, in Sources and references.", say: ["The news here refreshes automatically,", "and every headline is kept, with its link, in our sources."] },
    END("Read the heat, not just the headline.") ] },

  { id: "practical", term: "A heat-resilient market", page: "practical/index.html", label: "Practical actions", url: "beattheheat.asia/practical", scenes: [
    { type: "hook", q: "What could a *heat-resilient market* look like?", say: ["What could a heat-resilient market look like?"] },
    { type: "show", title: "Five things to look for", say: ["Shade over the stalls.", "A water point.", "A place to rest.", "A cooler roof, and a tree."],
      d: { kind: "flow", steps: [{ k: "Shade", text: "Over the stalls", at: 0, good: true }, { k: "Water", text: "A water point", at: 1, good: true }, { k: "Rest", text: "A place to rest", at: 2, good: true }, { k: "Roof", text: "A cooler roof", at: 3, good: true }, { k: "Tree", text: "Shade that grows", at: 3, good: true }] } },
    { type: "show", title: "Each one depends on something", sub: "Who acts, what it takes to run, and what could stop it.", say: ["And each one depends on something:", "who acts, what it takes to run, and what could stop it."], d: { kind: "art", name: "shade", at: 0, top: 340, size: 580 } },
    END("Pick a setting. Find what works there.") ] },

  { id: "sources", term: "Every claim, linked", page: "sources/index.html", label: "Sources and references", url: "beattheheat.asia/sources", scenes: [
    { type: "hook", q: "Where does *every claim* come from?", say: ["Where does every claim on this site come from?"] },
    { type: "show", title: "More than 2,000 sources", sub: "Each with where it is used on the site. October 2026.", say: ["From more than two thousand sources.", "Research and guidance, the Lancet Countdown, organisations, the news, and live data."],
      d: { kind: "bars", max: 1163, rows: [{ label: "Research, reports, guidance", n: 1163, count: 1163, at: 1 }, { label: "Lancet Countdown 2026", n: 392, count: 392, color: "var(--ink)", at: 1 }, { label: "Organisations", n: 260, count: 260, color: "var(--ink)", at: 1 }, { label: "Heat in the news", n: 125, count: 125, color: "var(--ink)", at: 1 }, { label: "Live data", n: 20, count: 20, color: "var(--ink)", at: 1 }] } },
    { type: "statement", line: "Every claim *links to its source.*", sub: "Search them all, in one list.", say: ["Every claim links to its source,", "and you can search them all, in one list."] },
    END("Check it for yourself.") ] },

  { id: "together", term: "Make it work together", page: "together/index.html", label: "Make it work together", url: "beattheheat.asia/together", scenes: [
    { type: "hook", q: "What does a *rest point* need?", say: ["What does a simple rest point need?"] },
    { type: "show", title: "Four things, four owners", say: ["A site.", "Clean water.", "Someone to open it.", "And money to keep it going. Each belongs to a different body."],
      d: { kind: "flow", steps: [{ k: "Site", text: "Land or a building", at: 0 }, { k: "Water", text: "Clean and steady", at: 1 }, { k: "People", text: "Someone to open it", at: 2 }, { k: "Money", text: "To keep it going", at: 3 }] } },
    { type: "statement", line: "It reaches a worker only when *every one holds.*", sub: "A tool for cooperation, not for blame.", say: ["Protection reaches a worker only when every one of them holds.", "This is a tool for cooperation, not for blame."] },
    END("Agree who does what, before the hot week.") ] },

  // ---- second, deeper films for pages that already have a short one ----
  { id: "lancet-numbers", term: "Eight numbers on heat", page: "lancet-countdown-2026/index.html", place: "h2", label: "The Lancet Countdown 2026", url: "beattheheat.asia/lancet-countdown-2026", scenes: [
    { type: "hook", q: "Ten years of evidence, *in eight numbers.*", say: ["Ten years of evidence on health and heat, in eight numbers."] },
    { type: "show", k: "Lives and days", title: "Deaths and heatwave days", say: ["Seven hundred and ten thousand deaths linked to heat in 2023, a record.", "Thirteen and a half heatwave days per person in 2025, eleven of them added by climate change."], src: "The 2026 Lancet Countdown, indicators 1.1.5 and 1.1.1",
      d: { kind: "stats", items: [{ count: 710000, label: "deaths linked to heat, 2023", at: 0 }, { count: 13.5, dec: 1, label: "heatwave days per person, 2025", color: "var(--ink)", at: 1 }] } },
    { type: "show", k: "Work and rest", title: "Hours, money and sleep", say: ["Five hundred and seventy-three billion work hours lost,", "a trillion dollars of income,", "and forty-eight hours of sleep a year, per person."], src: "The 2026 Lancet Countdown, indicators 1.1.3, 4.1.3 and 1.1.4",
      d: { kind: "stats", items: [{ v: "573 bn", label: "potential work hours lost, 2025", at: 0 }, { v: "$1.07 tn", label: "potential income lost, 2025", color: "var(--ink)", at: 1 }, { count: 48, suf: " h", label: "sleep lost per person a year", color: "#2a7fb8", at: 2 }] } },
    { type: "show", k: "Protection", title: "Cooling, warnings and money", say: ["Air conditioning may have prevented three hundred and sixty thousand deaths a year.", "Forty-six countries warn for heat-related illness.", "And health needs of three point three billion dollars a year met about a third."], src: "The 2026 Lancet Countdown, indicators 2.2.2, 2.2.1 and 4.3.3",
      d: { kind: "stats", items: [{ count: 360000, label: "deaths a year cooling may have prevented", color: "var(--green)", at: 0 }, { count: 46, label: "countries warn for heat illness", color: "var(--ink)", at: 1 }, { v: "1 in 3", label: "of declared health needs met by international funding", at: 2 }] } },
    END("What they mean for South and Southeast Asia, and for you.", "beattheheat.asia/lancet-countdown-2026") ] },

  { id: "heatwaves-timeline", term: "Ten heatwaves, 1998 to 2026", page: "heatwaves/index.html", place: "h2", label: "Heatwaves that shaped the region", url: "beattheheat.asia/heatwaves", scenes: [
    { type: "hook", q: "Ten heatwaves that *changed what came next.*", say: ["Ten heatwaves that changed what came next."] },
    { type: "show", title: "1998 to 2026", say: ["From Odisha in 1998, which taught a state to plan,", "to Ahmedabad in 2010, behind South Asia’s first city heat plan,", "to 2015, the region’s deadliest recent heatwave,", "and Asia’s hottest April, in 2024, when schools shut from Dhaka to Manila."],
      d: { kind: "timeline", min: 1997, max: 2027, items: [{ y: 1998, label: "1998", sub: "Odisha", at: 0, big: true, step: 0 }, { y: 2003, label: "2003", sub: "Andhra Pradesh", at: 0, step: .5 }, { y: 2010, label: "2010", sub: "Ahmedabad", at: 1, big: true, step: 0 },
        { y: 2015, label: "2015", sub: "India, Pakistan", at: 2, big: true, step: 0 }, { y: 2016, m: 6, label: "2016", sub: "Mainland SE Asia", at: 2, step: .5 }, { y: 2022, label: "2022", sub: "India, Pakistan", at: 3, step: 0 }, { y: 2023, label: "2023", sub: "Humid heat", at: 3, step: .3 },
        { y: 2024, m: 3, label: "2024", sub: "Dhaka to Manila", at: 3, big: true, step: .6, hi: true }, { y: 2024, m: 5, label: "2024", sub: "Northern India", at: 3, step: .9, hi: true }, { y: 2026, label: "2026", sub: "India, Pakistan", at: 3, step: 1.2 }] } },
    { type: "statement", line: "Recorded deaths are *a floor,* not a total.", sub: "Many heat deaths are never counted as heat deaths.", say: ["Recorded deaths are a floor, not a total:", "many heat deaths are never counted as heat deaths."] },
    { type: "statement", line: "After each one, *something changed.*", sub: "New plans, new warnings, new rules.", say: ["And after each one, something changed: new plans, new warnings, new rules."] },
    END("Learn from the last heatwave before the next.") ] },

  { id: "ahmedabad-story", term: "How Ahmedabad planned for heat", page: "worked-plans/index.html", place: "h2", label: "Worked plans", url: "beattheheat.asia/worked-plans", scenes: [
    { type: "hook", q: "What did a city learn from *one deadly week?*", say: ["What did a city learn from one deadly heatwave?"] },
    { type: "show", k: "Ahmedabad, May 2010", title: "46.8 °C", sub: "and an estimated 1,344 excess deaths, 43% more than usual for those weeks", say: ["In May 2010, Ahmedabad reached forty-six point eight degrees.", "An estimated thirteen hundred and forty-four extra deaths followed."], src: "Azhar et al., PLoS ONE, 2014",
      d: { kind: "stats", items: [{ count: 46.8, dec: 1, suf: " °C", label: "peak temperature", color: "var(--ink)", at: 0 }, { count: 1344, label: "estimated excess deaths", at: 1 }] } },
    { type: "show", k: "2013", title: "South Asia’s first heat plan", say: ["In 2013, the city launched South Asia’s first heat action plan.", "Forecasts feed colour-coded alerts,", "departments act together, the public is warned and health staff are trained.", "From 2017, it added cool roofs."], src: "NRDC: the plan’s components and cool roofs",
      d: { kind: "flow", steps: [{ k: "Forecast", text: "From the weather service", at: 1 }, { k: "Alert", text: "Colour-coded levels", at: 1 }, { k: "Act", text: "Departments together", at: 2 }, { k: "Prepare", text: "Public warned, staff trained", at: 2 }, { k: "2017", text: "Cool roofs", at: 3, good: true }] } },
    { type: "show", dark: true, k: "What changed", title: "1,190", sub: "deaths a year estimated avoided after the plan began", say: ["An evaluation estimated about eleven hundred and ninety deaths a year were avoided.", "The model has since spread across India."], src: "Hess et al., 2018" },
    END("Plan before the heat. Measure what changes.") ] },

  { id: "web-systems", term: "Ten systems, 87 consequences", page: "the-web/index.html", place: "h2", label: "The web of extreme heat", url: "beattheheat.asia/the-web", scenes: [
    { type: "hook", q: "How far does *one heatwave* reach?", say: ["How far does one heatwave reach?"] },
    { type: "show", title: "Through ten systems", say: ["Through nature, food, water and energy;", "through cities, health, work and schools;", "through society, and through how we govern and pay."],
      d: { kind: "grid", step: .25, items: [{ text: "Nature", at: 0 }, { text: "Food and farming", at: 0 }, { text: "Water", at: 0 }, { text: "Energy", at: 0 }, { text: "Cities", at: 1 }, { text: "Health", at: 1 }, { text: "Work", at: 1 }, { text: "Education", at: 1 }, { text: "Society", at: 2 }, { text: "Governance and finance", at: 2 }] } },
    { type: "show", dark: true, k: "The web", title: "87", sub: "consequences of heat, and the links between them, each with its evidence", say: ["Eighty-seven consequences, and every link between them carries its evidence."] },
    { type: "statement", line: "Pull one thread, and *the whole web moves.*", say: ["Pull one thread, and the whole web moves."] },
    END("Find the thread you can pull.") ] },

  { id: "solutions-mix", term: "131 ways to protect people", page: "solutions/index.html", place: "h2", label: "Solutions library", url: "beattheheat.asia/solutions", scenes: [
    { type: "hook", q: "Is there *one fix* for heat?", say: ["Is there one fix for heat?"] },
    { type: "show", title: "131 solutions, three families", say: ["No. There are a hundred and thirty-one in the library.", "Fifty-two cool places without machines,", "thirty-seven are active or system cooling, and forty-two are the plans, rules and money that make protection last."],
      d: { kind: "bars", max: 52, rows: [{ label: "Passive cooling", n: 52, count: 52, color: "var(--green)", at: 1 }, { label: "Active and system cooling", n: 37, count: 37, color: "var(--ink)", at: 2 }, { label: "Plans, work, money, health, communities", n: 42, count: 42, at: 2 }] } },
    { type: "statement", line: "They work best *together.*", sub: "A cool roof, a warning and paid rest protect more than any one alone.", say: ["They work best together.", "A cool roof, a warning and paid rest protect more than any one alone."] },
    END("Each with its evidence, cost and limits.") ] },

  { id: "eight-questions", term: "Eight questions every action answers", page: "practical-actions/index.html", place: "h2", label: "Practical actions", url: "beattheheat.asia/practical-actions", scenes: [
    { type: "hook", q: "Will it *actually work* here?", say: ["Will an action against heat actually work here?"] },
    { type: "show", title: "Eight questions", say: ["Every action on this page answers eight questions:", "what to do, who it protects, where it suits, and who acts;", "what it takes to run, the evidence, what could stop it, and what it only works with."],
      d: { kind: "grid", step: .25, items: ["What to do", "Who it protects", "Where it suits", "Who acts", "What it takes to run", "The evidence", "What could stop it", "What it only works with"].map((t, i) => ({ text: t, at: i < 4 ? 1 : 2 })) } },
    { type: "statement", line: "The last one *matters most.*", sub: "Water points need water. Rest breaks need pay.", say: ["The last one matters most.", "Water points need water. Rest breaks need pay."] },
    END("34 actions, by setting.") ] },
];
