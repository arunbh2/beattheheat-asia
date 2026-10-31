// The second set of glossary explainers. Each "say" line is one caption and one beat of narration;
// a diagram's "at" is the line it appears on. Every number is one the site already cites, with its source.
// Drawn, faceless figures only; no person is named. *word* is highlighted in orange.
"use strict";
const END = (line, url) => ({ type: "end", say: [line], line, url });
const THERMO = (h, c = "var(--orange)") => `<rect x="130" y="10" width="40" height="120" rx="20" class="w"/><rect x="138" y="${130 - h}" width="24" height="${h}" rx="10" style="fill:${c};stroke:${c}"/><circle cx="150" cy="140" r="26" style="fill:${c};stroke:${c}"/>`;
const DROP = `<path d="M150 20 q-56 70 -56 100 a56 56 0 0 0 112 0 q0 -30 -56 -100 Z" style="fill:#9ec9e8"/>`;
const SUN = `<circle cx="150" cy="85" r="46" class="of"/><path class="o" d="M150 14 v-10 M150 156 v10 M80 85 h-10 M220 85 h10 M100 35 l-8 -8 M200 35 l8 -8 M100 135 l-8 8 M200 135 l8 8"/>`;
const FIG = (x = 150, y = 165, s = .55) => `<circle cx="${x}" cy="${y - 166 * s}" r="${20 * s}"/><path d="M${x} ${y - 146 * s} V${y - 70 * s} L${x - 20 * s} ${y} M${x} ${y - 70 * s} L${x + 20 * s} ${y} M${x} ${y - 128 * s} L${x - 26 * s} ${y - 84 * s} M${x} ${y - 128 * s} L${x + 26 * s} ${y - 84 * s}"/>`;

module.exports = [
  // ---- the seven glossary terms that had no film ----
  { id: "heatindex", term: "Heat index", group: "measure", scenes: [
    { type: "hook", q: "The thermometer says 34 °C. *Why does it feel like 42?*", say: ["The thermometer says thirty-four degrees.", "So why does it feel like forty-two?"] },
    { type: "term", title: "Heat index", sub: "The “feels-like” temperature in the shade", say: ["The heat index is the feels-like temperature in the shade.", "It adds humidity to the air temperature,", "because damp air slows the sweat that cools you."],
      d: { kind: "panels", ops: ["+", "="], items: [{ label: "Air temperature", count: 34, suf: "°", color: "var(--ink)", art: THERMO(70, "#16202B"), at: 0 }, { label: "Humidity", count: 60, suf: "%", color: "#2a7fb8", art: DROP, at: 1 }, { label: "Feels like", count: 42, suf: "°", art: THERMO(118), at: 2 }] } },
    { type: "show", k: "In the Philippines", title: "Four official bands", say: ["In the Philippines, the weather service sorts it into four bands.", "From forty-two degrees, the heat index is officially a danger level."],
      src: "PAGASA heat index categories, as reported by GMA News",
      d: { kind: "scale", min: 24, max: 56, unit: "°", ticks: [27, 33, 42, 52], colors: ["#F2C14E", "#F26430", "#D7263D", "#7a1020"],
        zones: [{ from: 42, to: 52, label: "Danger", color: "#D7263D", at: 1 }], marks: [{ v: 27, label: "27°", sub: "Caution", at: 0 }, { v: 33, label: "33°", sub: "Extreme caution", at: 0, up: true }, { v: 42, label: "42°", sub: "Danger", color: "#D7263D", at: 1 }, { v: 52, label: "52°", sub: "Extreme danger", at: 1, up: true }] } },
    { type: "statement", line: "It’s measured *in the shade.*", sub: "Sun, wind and hard work aren’t in it. For those, see WBGT.", say: ["It’s measured in the shade.", "Sun, wind and hard work aren’t in it. For those, there’s WBGT."] },
    END("Check the feels-like, not just the forecast.") ] },

  { id: "adaptlimits", term: "Limits to adaptation", group: "act", scenes: [
    { type: "hook", q: "Can we just *get used to it?*", say: ["Can we just get used to the heat?"] },
    { type: "term", title: "Limits to adaptation", sub: "The point beyond which adjusting no longer prevents harm", say: ["Up to a point, yes.", "Places used to heat cope better with days of thirty to thirty-five degrees.", "But beyond forty, a study of two point seven million firms found no adaptation at all."],
      src: "OECD Economics Department, Working Paper No. 1828, 2024",
      d: { kind: "scale", min: 25, max: 46, unit: " °C", ticks: [25, 30, 35, 40, 45], colors: ["#F2C14E", "#F26430", "#D7263D", "#7a1020"],
        zones: [{ from: 30, to: 35, label: "Adapting helps", color: "#17703A", at: 1 }, { from: 40, to: 46, label: "No adaptation found", color: "#D7263D", at: 2 }] } },
    { type: "statement", line: "Some heat *can’t* be adapted to.", sub: "Cutting emissions keeps more places below that limit.", say: ["Some heat can’t be adapted to.", "Cutting emissions keeps more places below the limit."] },
    END("Adapt where we can. Cut emissions so we still can.") ] },

  { id: "refrigerant", term: "Refrigerant", group: "cooling", scenes: [
    { type: "hook", q: "What actually *carries the heat* out of your room?", say: ["What actually carries the heat out of your room?"] },
    { type: "term", title: "Refrigerant", sub: "The fluid inside air conditioners and fridges", say: ["A refrigerant.", "Inside, it boils and soaks up the room’s heat.", "A compressor squeezes it,", "and outside, it gives the heat away. Then round it goes again."],
      d: { kind: "cycle", nodes: ["Indoors: it boils and soaks up heat", "Compressor squeezes it", "Outdoors: it gives heat away", "Back inside, cold again"], center: "The cooling loop", at: 1 } },
    { type: "show", k: "The catch", title: "Many are *powerful greenhouse gases*", sub: "If they leak, they warm the planet the machine is cooling.", say: ["The catch: many common refrigerants are powerful greenhouse gases if they leak.", "The Kigali Amendment, in force since 2019, phases down the worst of them."],
      src: "IISD SDG Knowledge Hub: Kigali Amendment enters into force",
      d: { kind: "art", name: "ac", at: 0, top: 300, size: 640 } },
    END("Better cooling means better refrigerants, and no leaks.") ] },

  { id: "blackcarbon", term: "Black carbon", group: "cooling", scenes: [
    { type: "hook", q: "How can a brick kiln *melt a glacier?*", say: ["How can a brick kiln melt a glacier?"] },
    { type: "term", title: "Black carbon", sub: "Soot from diesel, wood, coal and brick kilns", say: ["Through black carbon: soot.", "It warms the air as it drifts.", "Then it settles on snow and ice,", "darkening them, so they soak up sunlight and melt faster."],
      d: { kind: "flow", steps: [{ k: "Burn", text: "Diesel, wood, coal, kilns", at: 0 }, { k: "Drift", text: "Soot warms the air", at: 1 }, { k: "Settle", text: "Falls on snow and ice", at: 2 }, { k: "Melt", text: "Darker ice melts faster", at: 3, hot: true }] } },
    { type: "show", k: "The Hindu Kush Himalaya", title: "Ice loss, *65% faster*", sub: "in the 2010s than in the decade before", say: ["In the Hindu Kush Himalaya, glaciers lost ice sixty-five per cent faster in the 2010s."],
      src: "ICIMOD, Water, ice, society and ecosystems in the Hindu Kush Himalaya, 2023", d: { kind: "art", name: "glacier", at: 0, top: 300, size: 640 } },
    { type: "statement", line: "Cleaner stoves, engines and kilns *cut it.*", sub: "And they clean the air people breathe.", say: ["Cleaner stoves, engines and kilns cut it,", "and clean the air people breathe."] },
    END("Less soot, slower melt, cleaner air.") ] },

  { id: "maladaptation", term: "Maladaptation", group: "cooling", scenes: [
    { type: "hook", q: "Can a fix for heat make *heat worse?*", say: ["Can a fix for heat make heat worse?"] },
    { type: "term", title: "Maladaptation", sub: "A response that makes things worse elsewhere, or later", say: ["Yes. That’s maladaptation.", "An air conditioner cools a room,", "but it pumps that heat into the street, and studies link it to warmer nights outside."],
      src: "Arizona State University: excess heat from air conditioners causes higher night-time temperatures", d: { kind: "art", name: "ac", at: 1, top: 300, size: 640 } },
    { type: "show", k: "Ask three questions", title: "Before any fix", say: ["So before any fix, ask:", "who else does this affect?", "What happens later?", "And who is left out?"],
      d: { kind: "flow", steps: [{ k: "Who else", text: "Does it push heat onto neighbours?", at: 1 }, { k: "Later", text: "Does it lock in more heat or emissions?", at: 2 }, { k: "Left out", text: "Who can’t afford it, or reach it?", at: 3 }] } },
    END("Cool one place without heating another.") ] },

  { id: "aquifer", term: "Aquifer", group: "cooling", scenes: [
    { type: "hook", q: "Where does *well water* come from?", say: ["Where does well water come from?"] },
    { type: "term", title: "Aquifer", sub: "Underground rock or sand that holds groundwater", say: ["From an aquifer:", "layers of rock and sand that hold water underground.", "When pumps take more than rain puts back, the water table falls."],
      d: { kind: "svg", top: 360, h: 560, draw: (at, T) => `<rect x="0" y="80" width="1680" height="440" class="sf" style="stroke:none"/><path d="M0 80 H1680"/>` +
        `<rect x="0" y="300" width="1680" height="220" class="bf" style="stroke:none;opacity:.8"/><path class="slide" style="--from:0px;${T(at(2))};animation-name:sink;animation-duration:3s" d="M0 300 H1680" stroke="#2a7fb8" stroke-width="8"/>` +
        `<style>@keyframes sink{to{transform:translateY(110px)}}</style><rect x="760" y="20" width="60" height="420" class="w"/><path d="M790 20 V0 M740 20 H840"/><text x="860" y="60">Well</text><text x="40" y="360">Groundwater</text><text x="40" y="130">Soil and rock</text>` +
        `<path class="o fade" style="${T(at(2))}" d="M1300 60 l-30 -40 M1330 60 l0 -50 M1360 60 l30 -40"/><text class="fade" style="${T(at(2))}" x="1240" y="240">Water table falls</text>` },
      },
    { type: "show", k: "North-west India", title: "*109 km³* of groundwater lost", sub: "in Rajasthan, Punjab and Haryana in six years, mainly to irrigation", say: ["In north-west India, about a hundred and nine cubic kilometres of groundwater were lost in six years,", "mainly to irrigation. Heat makes crops thirstier, and pumps run harder."],
      src: "Rodell et al., Nature, 2009", d: { kind: "stats", items: [{ count: 109, suf: " km³", label: "groundwater lost, 2002 to 2008", at: 0 }, { v: "6 yrs", label: "of satellite measurements", color: "var(--ink)", at: 1 }] } },
    END("Put water back in the ground, and wells keep flowing.") ] },

  { id: "agroforestry", term: "Agroforestry", group: "nature", scenes: [
    { type: "hook", q: "Can trees *cool a farm?*", say: ["Can trees cool a farm?"] },
    { type: "term", title: "Agroforestry", sub: "Growing trees alongside crops or livestock", say: ["That’s the idea of agroforestry:", "growing trees alongside crops or livestock."], d: { kind: "art", name: "tree", at: 0, top: 300, size: 620 } },
    { type: "show", title: "Three things the trees do", say: ["The trees shade the soil,", "help it hold moisture,", "and give farmers another source of income."],
      d: { kind: "panels", items: [{ label: "Shade", v: "Cooler soil", color: "var(--green)", art: `<circle cx="150" cy="60" r="50"/><path d="M150 110 V160 M60 160 H240"/><path class="o" d="M70 160 Q150 136 230 160"/>`, at: 0 },
        { label: "Moisture", v: "Wetter ground", color: "#2a7fb8", art: DROP, at: 1 }, { label: "Income", v: "Another harvest", color: "var(--orange)", art: `<ellipse cx="150" cy="140" rx="60" ry="16"/><ellipse cx="150" cy="116" rx="60" ry="16"/><ellipse cx="150" cy="92" rx="60" ry="16" class="of"/>`, at: 2 }] } },
    END("Shade that pays.") ] },

  // ---- new terms ----
  { id: "chiefheatofficer", term: "Chief heat officer", group: "act", text: "A city official whose job is heat: joining up health, water, power, schools and work so that protection is planned before the hot season. Dhaka North City Corporation appointed Asia’s first in 2023.",
    source: { label: "One Billion Resilient, 2023", url: "https://onebillionresilient.org/2023/05/03/bushra-afreen-dhaka-chief-heat-officer/" }, scenes: [
    { type: "hook", q: "Who in a city is *in charge of heat?*", say: ["Who in a city is in charge of heat?"] },
    { type: "term", title: "Chief heat officer", sub: "One role that joins up every department heat touches", say: ["Often, nobody, because heat touches every department:", "health, water, power, schools and work.", "A chief heat officer joins them up, before the hot season."],
      d: { kind: "flow", steps: [{ k: "Health", text: "Clinics ready", at: 1 }, { k: "Water", text: "Water points open", at: 1 }, { k: "Power", text: "Supply protected", at: 1 }, { k: "Schools", text: "Timetables change", at: 1 }, { k: "One lead", text: "Joined up, in time", at: 2, good: true }] } },
    { type: "statement", line: "Dhaka North appointed *Asia’s first* in 2023.", say: ["In 2023, Dhaka North City Corporation appointed Asia’s first."] },
    END("Heat crosses every department. Someone has to join them up.") ] },

  { id: "heatalert", term: "Heat alert levels", group: "act", text: "Graded warnings, such as caution, danger and extreme danger, set at levels of heat that harm health locally. A good plan ties each level to named actions, so a warning switches protection on.",
    source: { label: "WHO/Europe: Heat–health action plans, guidance, second edition, 2026", url: "https://www.who.int/europe/publications/i/item/9789289062930" }, scenes: [
    { type: "hook", q: "A heat warning goes out. *Then what?*", say: ["A heat warning goes out.", "Then what?"] },
    { type: "term", title: "Heat alert levels", sub: "Graded warnings, set where heat harms health locally. An example:", say: ["Good alerts come in levels,", "and each level switches on named actions, like these."],
      d: { kind: "flow", steps: [{ k: "Caution", text: "Water and shade at work sites", at: 0 }, { k: "Danger", text: "Cooling centres open, outdoor work moves", at: 1, hot: true }, { k: "Extreme", text: "Clinics on alert, checks on people alone", at: 1, hot: true }] } },
    { type: "show", k: "Delhi, 2025", title: "What a plan switched on", say: ["Delhi’s 2025 plan tied its graded alerts to cooling shelters,", "three thousand water points, and heatstroke units in hospitals."], src: "Business Today, 2025; Citizen Matters",
      d: { kind: "stats", items: [{ v: "Alerts", label: "graded heat warnings", color: "var(--ink)", at: 0 }, { count: 3000, label: "water points", at: 1 }, { v: "Shelters", label: "for cooling, across the city", color: "var(--ink)", at: 1 }] } },
    END("A warning is only as good as what it switches on.") ] },

  { id: "workrest", term: "Work–rest cycle", group: "act", text: "Building shaded rest into each hour of hot, heavy work. In Singapore, employers must give at least 10 minutes’ shaded rest each hour for heavy outdoor work at a wet-bulb globe temperature of 32 °C or more.",
    source: { label: "Ministry of Manpower, Singapore: enhanced measures to reduce heat stress, 2023", url: "https://www.mom.gov.sg/newsroom/press-releases/2023/1024-enhanced-measures-to-reduce-heat-stress-for-outdoor-workers" }, scenes: [
    { type: "hook", q: "How do you keep working when it’s *too hot to work?*", say: ["How do you keep working when it’s too hot to work?"] },
    { type: "term", title: "Work–rest cycle", sub: "Shaded rest, built into every hot hour", say: ["You build rest into every hour.", "In Singapore, heavy outdoor work at a WBGT of thirty-two or more needs at least ten minutes of shaded rest an hour."],
      src: "Ministry of Manpower, Singapore, 2023", d: { kind: "clock", work: 50, workLabel: "heavy work", restLabel: "shaded rest", at: 0, restAt: 1 } },
    { type: "show", k: "Checked, not just written", title: "*250* workplaces inspected", sub: "In 2024, action was taken against 78, mostly for missing rest breaks.", say: ["Rules work when they’re checked.", "In 2024, inspectors visited two hundred and fifty sites, and acted against seventy-eight."],
      src: "HRD Asia, 2024, reporting Ministry of Manpower inspections", d: { kind: "stats", items: [{ count: 250, label: "workplaces inspected", color: "var(--ink)", at: 1 }, { count: 78, label: "faced action, mostly for missing shaded rest", at: 1 }] } },
    END("Rest protects when it’s shaded, built in, and actually taken.") ] },

  { id: "wardplan", term: "Ward-level heat plan", group: "act", text: "A heat action plan that maps risk neighbourhood by neighbourhood, using felt heat, warm nights and who lives there, so help goes first where risk is highest. Thane, next to Mumbai, built its 2024 plan this way.",
    source: { label: "CEEW: How can Thane city tackle heatwave risks with a heat action plan", url: "https://www.ceew.in/publications/how-can-thane-city-tackle-heatwaves-risks-with-heat-action-plan" }, scenes: [
    { type: "hook", q: "Is heat *the same* across a whole city?", say: ["Is heat the same across a whole city?"] },
    { type: "term", title: "Ward-level heat plan", sub: "Risk mapped neighbourhood by neighbourhood", say: ["No. It can differ sharply from one ward to the next.", "So some cities map risk ward by ward."],
      d: { kind: "svg", top: 360, h: 520, draw: (at, T) => { const R = [3, 1, 2, 3, 2, 1, 0, 2, 3, 1, 1, 2, 0, 3, 2, 1, 2, 0, 1, 3], c = ["#F2E7D9", "#F2C14E", "#F26430", "#D7263D"];
        return R.map((r, i) => `<rect class="pop" style="fill:${c[r]};${T(at(1) + i * .08)}" x="${780 + (i % 5) * 170}" y="${10 + Math.floor(i / 5) * 125}" width="160" height="115" rx="10"/>`).join("") +
          `<text x="0" y="60" class="fade" style="${T(at(1))}">Each ward scored on:</text>` + ["Felt heat", "Warm nights", "Who lives there"].map((x, i) => `<text class="fade" x="0" y="${140 + i * 70}" style="font:700 40px Hanken;${T(at(1) + .5 + i * .4)}">${x}</text>`).join(""); } } },
    { type: "show", k: "Thane, India, 2024", title: "Risk index → *task force*", sub: "Felt heat, warm nights and social vulnerability, run by a task force across departments.", say: ["Thane, next to Mumbai, scored each ward on felt heat, warm nights and social vulnerability,", "and a heatwave task force across departments runs the plan."],
      src: "CEEW; Heat Action Plan for Thane City, 2024", d: { kind: "flow", steps: [{ k: "Map", text: "Ward-level risk index", at: 0 }, { k: "Lead", text: "Task force across departments", at: 1 }, { k: "Act", text: "Help where risk is highest", at: 1, good: true }] } },
    END("Send help where the heat hits hardest.") ] },

  { id: "whoelements", term: "Core elements of a heat plan", group: "act", text: "WHO/Europe’s checklist for a complete heat–health action plan: governance, a warning system, people at risk, communication, a resilient health system, reducing exposure, surveillance, and monitoring and learning.",
    source: { label: "WHO/Europe: Heat–health action plans, guidance, second edition, 2026", url: "https://www.who.int/europe/publications/i/item/9789289062930" }, scenes: [
    { type: "hook", q: "What makes a heat plan *complete?*", say: ["What makes a heat plan complete?"] },
    { type: "show", title: "Eight core elements", sub: "From the World Health Organization’s guidance", say: ["The World Health Organization lists eight core elements.", "From who leads, and the warnings, to the people most at risk and how messages reach them;", "from clinics, and cutting exposure, to tracking illness, and learning after every season."],
      src: "WHO/Europe, Heat–health action plans, 2026",
      d: { kind: "grid", step: .3, items: ["Governance", "Warning system", "People at risk", "Communication", "Health system", "Reducing exposure", "Surveillance", "Monitoring and learning"].map((t, i) => ({ text: t, at: i < 4 ? 1 : 2 })) } },
    { type: "statement", line: "The one most often missed: *learning.*", sub: "A review after each season, so next year’s plan is better.", say: ["The one most often missed is learning:", "a review after each season, so next year’s plan is better."] },
    END("A checklist to run before the heat, not during it.", "beattheheat.asia/plan") ] },

  { id: "attribution", term: "Climate attribution", group: "measure", text: "Working out how much climate change has added to an event or its harm. The 2026 Lancet Countdown attributes 71.5% of 2023’s heat deaths to climate change, and 11.3 of 13.5 heatwave days per person in 2025.",
    source: { label: "The 2026 report of the Lancet Countdown on health and climate change", url: "https://doi.org/10.1016/S0140-6736(26)01779-4" }, scenes: [
    { type: "hook", q: "Would this heatwave have *happened anyway?*", say: ["Would this heatwave have happened anyway?"] },
    { type: "term", title: "Climate attribution", sub: "How much climate change added to an event", say: ["Climate attribution answers that.", "In 2025, each person lived through thirteen and a half heatwave days on average.", "About eleven of them would not have been expected without climate change."],
      src: "The 2026 Lancet Countdown, indicator 1.1.1", d: { kind: "squares", n: 13.5, hot: 11, hotAt: 2, hotLabel: "Added by climate change", restLabel: "Expected anyway" } },
    { type: "show", dark: true, k: "Heat deaths, 2023", title: "*71.5%*", sub: "of heat-linked deaths attributed to climate change", say: ["And of the heat deaths in 2023,", "the report attributes seventy-one and a half per cent to climate change."], src: "The 2026 Lancet Countdown, indicator 1.1.5" },
    END("Not bad luck: a cause we can act on.") ] },

  { id: "undercount", term: "Undercounted heat deaths", group: "measure", text: "Heat deaths that are never recorded as heat deaths, because certificates name the immediate cause, such as a heart attack. In India in 2024, 185 heatstroke deaths were confirmed against 48,385 suspected heatstroke cases, up to 28 July.",
    source: { label: "Ministry of Health and Family Welfare, reply in India’s Rajya Sabha, 6 August 2024", url: "https://rsdebate.nic.in/bitstream/123456789/750681/1/PQ_265_06082024_U1693_p358_p362.pdf" }, scenes: [
    { type: "hook", q: "How many people did *the heat kill?*", say: ["How many people did the heat kill?"] },
    { type: "term", title: "Undercounted heat deaths", sub: "Deaths that are never written down as heat deaths", say: ["The honest answer is: we often don’t know.", "Death certificates record the immediate cause, like a heart attack,", "not the heat that triggered it."], d: { kind: "art", name: "clinic", at: 1, top: 330, size: 600 } },
    { type: "show", k: "India, 2024, to 28 July", title: "Confirmed, against suspected", say: ["In India in 2024, a hundred and eighty-five heatstroke deaths were confirmed,", "against more than forty-eight thousand suspected heatstroke cases."], src: "Ministry of Health and Family Welfare, Rajya Sabha reply, 6 August 2024",
      d: { kind: "bars", max: 48385, rows: [{ label: "Confirmed heatstroke deaths", n: 185, count: 185, color: "var(--ink)", at: 0 }, { label: "Suspected heatstroke cases", n: 48385, count: 48385, at: 1 }] } },
    { type: "statement", line: "*Excess deaths* show the fuller toll.", sub: "Counting deaths above normal for the time of year.", say: ["Counting excess deaths, above the normal for that time of year, shows the fuller toll."] },
    END("What isn’t counted is hard to plan for.") ] },

  { id: "labourloss", term: "Lost work hours", group: "money", text: "Work that heat makes unsafe or impossible. The 2026 Lancet Countdown estimates 573 billion potential work hours were lost to heat in 2025, with farm workers losing twice as many hours as any other sector.",
    source: { label: "The 2026 report of the Lancet Countdown on health and climate change", url: "https://doi.org/10.1016/S0140-6736(26)01779-4" }, scenes: [
    { type: "hook", q: "What does heat cost *a working day?*", say: ["What does heat cost a working day?"] },
    { type: "show", dark: true, k: "Worldwide, 2025", title: "*573 billion*", sub: "potential work hours lost to heat: the second-highest on record", say: ["Worldwide in 2025, five hundred and seventy-three billion potential work hours were lost to heat.", "That’s thirty-five per cent above the 2006 to 2015 average."], src: "The 2026 Lancet Countdown, indicator 1.1.3" },
    { type: "show", title: "Who loses most", sub: "Farm workers lose twice as many hours as any other sector", say: ["Farm workers lose twice as many hours as any other sector.", "In countries like Bangladesh, India and Nepal, lost income equals three point seven per cent of the economy,", "against half a per cent in the richest."],
      src: "The 2026 Lancet Countdown, indicators 1.1.3 and 4.1.3", d: { kind: "bars", max: 3.7, rows: [{ label: "Bangladesh, India, Nepal and peers", n: 3.7, count: 3.7, dec: 1, suf: "%", at: 1 }, { label: "Richest countries", n: .5, count: .5, dec: 1, suf: "%", color: "var(--ink)", at: 2 }] } },
    END("Shade, rest and cooler hours keep work, and wages, going.") ] },

  { id: "informalwork", term: "Informal work", group: "money", text: "Work without a formal contract, sick pay or social insurance, often outdoors: street vending, construction, farm and home-based work. An OECD report estimates heat costs informal workers about 2.4% of working hours, against 1.4% for formal workers.",
    source: { label: "The Policy Edge, summarising the OECD Development Centre, 2026", url: "https://www.policyedge.in/p/oecd-finds-informal-workers-face-unequal-risks-from-heat-automation-and-ageing" }, scenes: [
    { type: "hook", q: "No contract. No sick pay. *No shade.*", say: ["No contract. No sick pay. No shade."] },
    { type: "term", title: "Informal work", sub: "Work without a formal contract or social insurance", say: ["That’s informal work:", "street vending, building sites, farms, and work at home.", "Heat takes more of their hours: about two point four per cent, against one point four for formal workers."],
      src: "The Policy Edge, summarising the OECD Development Centre", d: { kind: "bars", max: 2.4, rows: [{ label: "Informal workers", n: 2.4, count: 2.4, dec: 1, suf: "%", at: 2 }, { label: "Formal workers", n: 1.4, count: 1.4, dec: 1, suf: "%", color: "var(--ink)", at: 2 }] } },
    { type: "show", k: "Bangkok", title: "Nearly *8 in 10*", sub: "informal workers surveyed cut their hours in the heat", say: ["In Bangkok, nearly eight in ten informal workers surveyed cut their hours in the heat.", "Less work means less pay, the same day."], src: "WIEGO, Too hot to work: Bangkok", d: { kind: "art", name: "vendor", at: 0, top: 330, size: 600 } },
    END("Protection has to reach people without an employer.") ] },

  { id: "learningloss", term: "Heat and learning", group: "act", text: "Lost schooling when heat closes schools or makes classrooms too hot to learn in. In April 2024, Bangladesh closed schools for about 33 million children, and 5,288 schools in the Philippines moved to remote learning.",
    source: { label: "NBC News, 2024; Malay Mail (AFP), 2024", url: "https://www.nbcnews.com/news/world/schools-close-extreme-heat-philippines-bangladesh-asia-rcna149485" }, scenes: [
    { type: "hook", q: "What happens to school *in a heatwave?*", say: ["What happens to school in a heatwave?"] },
    { type: "show", k: "April 2024", title: "Classrooms *closed*", say: ["In April 2024, Bangladesh closed schools for about thirty-three million children.", "In the Philippines, more than five thousand schools moved to remote learning."], src: "NBC News, 2024; Malay Mail (AFP), 2024",
      d: { kind: "stats", items: [{ count: 33, suf: " million", label: "children out of school in Bangladesh", at: 0 }, { count: 5288, label: "Philippine schools moved to remote learning", color: "var(--ink)", at: 1 }] } },
    { type: "show", title: "Keeping learning going", say: ["What helps:", "cooler classrooms,", "timetables that dodge the hottest hours,", "and water and shade at every school."],
      d: { kind: "flow", steps: [{ k: "Cooler", text: "Classrooms that stay cool", at: 1, good: true }, { k: "Earlier", text: "Timetables that dodge the peak", at: 2, good: true }, { k: "Basics", text: "Water and shade at school", at: 3, good: true }] } },
    END("Every closed day is learning lost. Plan to stay open.", "beattheheat.asia/practical-actions") ] },

  { id: "coolinggap", term: "The cooling gap", group: "cooling", text: "The difference between people who can stay cool and those who can’t. Air conditioning may have prevented about 360,000 deaths a year in 2022 and 2023, but only about 3% of households in the poorest countries have it.",
    source: { label: "The 2026 report of the Lancet Countdown on health and climate change", url: "https://doi.org/10.1016/S0140-6736(26)01779-4" }, scenes: [
    { type: "hook", q: "Who gets *to be cool?*", say: ["Who gets to be cool?"] },
    { type: "show", dark: true, k: "2022 and 2023", title: "*360,000*", sub: "deaths a year that air conditioning may have prevented", say: ["Air conditioning may have prevented three hundred and sixty thousand deaths a year."], src: "The 2026 Lancet Countdown, indicator 2.2.2" },
    { type: "term", title: "The cooling gap", sub: "Between those who can stay cool, and those who can’t", say: ["But in the poorest countries, only about three in every hundred households have it.", "That’s the cooling gap."],
      d: { kind: "squares", n: 100, hot: 3, hotAt: 0, hotLabel: "Households with air conditioning", restLabel: "Without" } },
    { type: "statement", line: "Close it with *shade, cool roofs and fans* first.", sub: "Cooling now drives a growing share of energy emissions.", say: ["Close it with shade, cool roofs and efficient fans first,", "because cooling now drives a growing share of energy emissions."] },
    END("Cool for everyone, without heating the planet.") ] },

  { id: "coolingdemand", term: "Cooling demand", group: "cooling", text: "How much cooling people need, and the energy it takes. Southeast Asia’s air conditioners could rise from about 40 million to 300 million by 2040, half of them in Indonesia.",
    source: { label: "International Energy Agency: The Future of Cooling in Southeast Asia", url: "https://www.iea.org/reports/the-future-of-cooling-in-southeast-asia" }, scenes: [
    { type: "hook", q: "How many air conditioners will *Southeast Asia* need?", say: ["How many air conditioners will Southeast Asia need?"] },
    { type: "show", k: "Southeast Asia, by 2040", title: "From 40 million to *300 million*", say: ["About forty million today could become three hundred million by 2040.", "Half of them could be in Indonesia."], src: "International Energy Agency, The Future of Cooling in Southeast Asia",
      d: { kind: "bars", max: 300, rows: [{ label: "Air conditioners today", n: 40, count: 40, suf: "m", color: "var(--ink)", at: 0 }, { label: "Projected by 2040", n: 300, count: 300, suf: "m", at: 0 }] } },
    { type: "term", title: "Cooling demand", sub: "The cooling people need, and the power it takes", say: ["Every one adds to peak power demand,", "and pushes waste heat into the street."], d: { kind: "art", name: "ac", at: 0, top: 330, size: 600 } },
    { type: "statement", line: "*Cooler buildings* shrink the need.", sub: "Shade, reflective roofs and efficient machines keep demand down.", say: ["Cooler buildings shrink the need:", "shade, reflective roofs, and efficient machines."] },
    END("The coolest kilowatt is the one you never need.") ] },

  { id: "peakdemand", term: "Peak power demand", group: "cooling", text: "The highest electricity load of the day or year, which in hot countries comes with heat and air conditioning. In May and June 2023, heat drove demand up in northern Viet Nam as hydropower reservoirs ran low; blackouts cost about US$1.4 billion.",
    source: { label: "The Manila Times, reporting the World Bank, 2023", url: "https://manilatimes.net/2023/08/12/business/foreign-business/power-crisis-cost-vietnam-14b-wb/1904920/amp" }, scenes: [
    { type: "hook", q: "Why do the lights go out *in a heatwave?*", say: ["Why do the lights go out in a heatwave?"] },
    { type: "term", title: "Peak power demand", sub: "The highest load of the day, often driven by cooling", say: ["Heat pushes demand up, as everyone switches on cooling.", "If supply falls at the same time, the lines cross,", "and the power goes out."],
      d: { kind: "svg", top: 360, h: 520, draw: (at, T) => `<path d="M60 460 H1640 M60 460 V20"/><text x="70" y="510">Morning</text><text x="1480" y="510">Evening</text>` +
        `<path class="draw" style="--len:1900;${T(at(0))}" d="M60 400 C400 380 600 260 900 160 S1400 60 1640 90" stroke="#F26430" stroke-width="10"/><text class="fade" x="1300" y="60" style="fill:#F26430;${T(at(0) + 1)}">Demand</text>` +
        `<path class="draw" style="--len:1700;${T(at(1))}" d="M60 170 C600 170 900 200 1640 260" stroke="#16202B" stroke-width="10" stroke-dasharray="20 14"/><text class="fade" x="1300" y="320" style="${T(at(1) + 1)}">Supply</text>` +
        `<circle class="pop" cx="985" cy="182" r="34" style="fill:#D7263D;stroke:#D7263D;${T(at(2))}"/><text class="fade" x="1030" y="250" style="font:400 48px Anton;fill:#D7263D;${T(at(2))}">BLACKOUT</text>` } },
    { type: "show", dark: true, k: "Northern Viet Nam, May–June 2023", title: "*US$1.4 billion*", sub: "the estimated cost of blackouts, as heat met low reservoirs", say: ["In northern Viet Nam in 2023, heat met low hydropower reservoirs.", "Blackouts cost about one point four billion dollars."], src: "The Manila Times, reporting the World Bank, 2023" },
    END("Shave the peak: cooler buildings, smarter demand.") ] },

  { id: "glacierloss", term: "Glacier loss", group: "cooling", text: "Mountain ice shrinking faster than snow can replace it. In the Hindu Kush Himalaya, glaciers lost ice 65% faster in the 2010s than in the decade before, and could lose 30–50% of their volume by 2100.",
    source: { label: "ICIMOD: Water, ice, society and ecosystems in the Hindu Kush Himalaya, 2023", url: "https://lib.icimod.org/record/36322" }, scenes: [
    { type: "hook", q: "What happens when Asia’s *water towers* melt?", say: ["What happens when Asia’s water towers melt?"] },
    { type: "term", title: "Glacier loss", sub: "Mountain ice shrinking faster than snow replaces it", say: ["In the Hindu Kush Himalaya, glaciers lost ice sixty-five per cent faster in the 2010s.", "By 2100 they could lose thirty to fifty per cent of their volume."],
      src: "ICIMOD, 2023", d: { kind: "stats", items: [{ count: 65, suf: "%", label: "faster ice loss in the 2010s", at: 0 }, { v: "30–50%", label: "of glacier volume could be lost by 2100", color: "var(--ink)", at: 1 }] } },
    { type: "show", title: "Too much, then too little", say: ["First, more meltwater, and the risk of floods.", "Later, less water in the dry season, for the rivers people farm and drink from."],
      d: { kind: "flow", steps: [{ k: "Now", text: "More meltwater, flood risk", at: 0, hot: true }, { k: "Later", text: "Less water in the dry season", at: 1, hot: true }] } },
    END("Heat in the mountains reaches every river below.") ] },

  { id: "peatfire", term: "Peat fires", group: "cooling", text: "Fires that smoulder in drained peatland, the thick, wet soil of tropical swamps. Once dry, peat burns underground for weeks and fills the air with haze. Indonesia’s 2015 forest and peat fires cost an estimated US$16.1 billion.",
    source: { label: "World Bank: The cost of fire, Indonesia, 2016", url: "https://documents1.worldbank.org/curated/pt/776101467990969768/pdf/103668-BRI-Cost-of-Fires-Knowledge-Note-PUBLIC-ADD-NEW-SERIES-Indonesia-Sustainable-Landscapes-Knowledge-Note.pdf" }, scenes: [
    { type: "hook", q: "Can the ground *itself* burn?", say: ["Can the ground itself burn?"] },
    { type: "term", title: "Peat fires", sub: "Fires that smoulder in drained swamp soil", say: ["Peat can. It’s thick, wet soil, made of plants that never fully rotted.", "Drain it, and in a hot, dry season it catches,", "and smoulders underground, filling the sky with haze."],
      d: { kind: "flow", steps: [{ k: "Wet", text: "Peat holds water and carbon", at: 0, good: true }, { k: "Drained", text: "Dries out in the heat", at: 1 }, { k: "Burning", text: "Smoulders for weeks, haze spreads", at: 2, hot: true }] } },
    { type: "show", dark: true, k: "Indonesia, 2015", title: "*US$16.1 billion*", sub: "the estimated cost of that year’s forest and peat fires", say: ["Indonesia’s 2015 fires cost an estimated sixteen point one billion dollars."], src: "World Bank, The cost of fire, 2016" },
    END("Keep peat wet, and it stays in the ground.") ] },

  { id: "nightcrops", term: "Hot nights and crops", group: "nature", text: "Crops need cool nights too. At the International Rice Research Institute in the Philippines, rice yields fell about 10% for each 1 °C rise in growing-season night temperature.",
    source: { label: "Peng et al., PNAS, 2004", url: "https://doi.org/10.1073/pnas.0403720101" }, scenes: [
    { type: "hook", q: "Do crops need *cool nights* too?", say: ["Do crops need cool nights too?"] },
    { type: "term", title: "Hot nights and crops", sub: "Warm nights make plants burn through their own energy", say: ["They do. On warm nights, plants keep using up the energy they made by day.", "In field trials in the Philippines, rice yields fell about ten per cent for every degree of warmer nights."],
      src: "Peng et al., PNAS, 2004", d: { kind: "bars", max: 100, rows: [{ label: "Nights as usual", n: 100, count: 100, suf: "%", color: "var(--green)", at: 1 }, { label: "1 °C warmer nights", n: 90, count: 90, suf: "%", at: 1 }] } },
    { type: "statement", line: "In many places, nights warm *faster* than days.", sub: "Heat-tolerant varieties and better timing buy farmers time.", say: ["And in many places, nights are warming faster than days.", "Heat-tolerant varieties and better timing buy farmers time."] },
    END("Protect the night, protect the harvest.") ] },

  { id: "adaptfinance", term: "Adaptation finance gap", group: "money", text: "The difference between what countries say they need to adapt to climate change and the money that arrives. Forty-eight countries put their health adaptation needs at about US$3.3 billion a year; international funding committed in 2024 covered about a third.",
    source: { label: "The 2026 report of the Lancet Countdown on health and climate change", url: "https://doi.org/10.1016/S0140-6736(26)01779-4" }, scenes: [
    { type: "hook", q: "Who pays to *protect health* from heat?", say: ["Who pays to protect health from heat?"] },
    { type: "term", title: "Adaptation finance gap", sub: "What’s needed, against what arrives", say: ["Forty-eight countries put a price on protecting health: about three point three billion dollars a year.", "In 2024, international funding committed covered about a third."],
      src: "The 2026 Lancet Countdown, indicator 4.3.3", d: { kind: "bars", max: 3.3, rows: [{ label: "Health adaptation needs, a year", n: 3.3, count: 3.3, dec: 1, pre: "$", suf: "bn", color: "var(--ink)", at: 0 }, { label: "International funding committed, 2024", n: 1.1, count: 1.1, dec: 1, pre: "$", suf: "bn", at: 1 }] } },
    { type: "statement", line: "*Two-thirds* still unfunded.", sub: "Clinics, warnings and cooler wards wait on that money.", say: ["That leaves about two-thirds unfunded.", "Clinics, warnings and cooler wards wait on that money."] },
    END("Close the gap before the next heatwave.", "beattheheat.asia/finance") ] },

  { id: "heatcredit", term: "Heat and credit", group: "money", text: "How heat travels from wages to lenders: lost working hours mean missed repayments, and lenders face a cash crunch. About 60% of India’s ₹3.81 trillion microfinance portfolio is in farming and allied work.",
    source: { label: "Mongabay India commentary, June 2026", url: "https://india.mongabay.com/2026/06/indias-banks-are-sitting-on-a-heat-risk-they-have-barely-begun-to-price-commentary/" }, scenes: [
    { type: "hook", q: "How does a heatwave *reach a bank?*", say: ["How does a heatwave reach a bank?"] },
    { type: "term", title: "Heat and credit", sub: "From a day’s wages to a lender’s books", say: ["A hotter day means a smaller wage.", "The next instalment waits.", "Repayments slow, and the strain moves up to the lender."],
      d: { kind: "flow", steps: [{ k: "Heat", text: "Fewer hours, smaller wage", at: 0 }, { k: "Household", text: "Instalment missed", at: 1 }, { k: "Lender", text: "Collections fall", at: 2, hot: true }, { k: "System", text: "Costlier credit for all", at: 2, hot: true }] } },
    { type: "show", k: "India", title: "About *60%*", sub: "of the ₹3.81 trillion microfinance portfolio is in farming and allied work", say: ["In India, about sixty per cent of a three point eight trillion rupee microfinance portfolio is in farming and allied work,", "the work heat hits first."], src: "Mongabay India commentary, June 2026",
      d: { kind: "squares", n: 10, hot: 6, hotAt: 0, hotLabel: "Farming and allied work", restLabel: "Other lending" } },
    END("Insurance, patient capital and shared data turn risk into resilience.", "beattheheat.asia/paying-for-protection") ] },
];
