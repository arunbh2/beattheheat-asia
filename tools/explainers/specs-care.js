// The third set of glossary explainers: care, the body, health services, city systems and nature, so the films
// give the same weight to people who are not earning a wage, and to the systems everyone depends on.
// Same rules as specs.js: each "say" line is one caption and one beat; every number is one the site already cites,
// with its source; drawn, faceless figures only; no person is named; *word* is highlighted in orange.
"use strict";
const END = (line, url) => ({ type: "end", say: [line], line, url });

module.exports = [
  // ---- care and the body ----
  { id: "olderheat", term: "Older people and heat", group: "body", scenes: [
    { type: "hook", q: "Why is heat *harder on older bodies?*", say: ["Why is heat harder on older bodies?"] },
    { type: "term", title: "Older people and heat", sub: "Less thirst, less sweat, more strain on the heart", say: ["With age, thirst fades and the body sweats less,", "so it cools more slowly,", "and the heart works harder to shed heat."],
      d: { kind: "flow", steps: [{ k: "Thirst", text: "Fades with age", at: 0 }, { k: "Sweat", text: "Cools more slowly", at: 1 }, { k: "Heart", text: "Works harder", at: 2, hot: true }] } },
    { type: "show", k: "Kolkata, India", title: "*4.3 times* more likely", sub: "to face dangerous heat: older people in an informal settlement, against a nearby village", say: ["In Kolkata, older people in an informal settlement were four point three times more likely to face dangerous heat", "than older people in a nearby village, because their homes stayed hot at night."],
      src: "Weitz, Mukhopadhyay and Das, International Journal of Biometeorology, 2022", d: { kind: "art", name: "house", at: 1, top: 300, size: 640 } },
    { type: "statement", line: "Heat is most dangerous *at home, at night.*", sub: "Where the walls hold the day’s heat, and no one is there to notice.", say: ["Heat is most dangerous at home, at night,", "where the walls hold the day’s heat and no one is there to notice."] },
    END("A cooler room, and someone who checks in.") ] },

  { id: "pregnancyheat", term: "Heat in pregnancy", group: "body", scenes: [
    { type: "hook", q: "What does a heatwave mean *for a pregnancy?*", say: ["What does a heatwave mean for a pregnancy?"] },
    { type: "term", title: "Heat in pregnancy", sub: "Two bodies to cool, and less room to do it", say: ["A pregnant body already runs warm and works harder.", "In heat, it has less room to cool down."] },
    { type: "show", k: "A review of studies", title: "Preterm birth rises", say: ["Across many studies, each one degree rise raised the odds of a preterm birth by about five per cent.", "During a heatwave, by about sixteen per cent."], src: "Chersich et al., BMJ, 2020",
      d: { kind: "stats", items: [{ count: 5, pre: "+", suf: "%", label: "odds of preterm birth, for each 1 °C rise", at: 0 }, { count: 16, pre: "+", suf: "%", label: "odds of preterm birth, in a heatwave", color: "var(--orange)", at: 1 }] } },
    { type: "statement", line: "Rest, water and shade are *care,* not comfort.", sub: "Especially for women who keep working or fetching water while pregnant.", say: ["Rest, water and shade are care, not comfort,", "especially for women who keep working or fetching water while pregnant."] },
    END("Cooler days for two.") ] },

  { id: "babyheat", term: "Babies and young children in heat", group: "body", scenes: [
    { type: "hook", q: "A baby *can’t tell you* it’s too hot.", say: ["A baby can’t tell you it’s too hot."] },
    { type: "term", title: "Babies and young children", sub: "They overheat and dry out faster than adults", say: ["Small bodies heat up and lose water faster than adults’,", "and they depend on someone else to notice."] },
    { type: "show", k: "India, 2014 to 2023", title: "*7.7* heatwave days a year", sub: "for each infant, on average: 47% more than in the 1990s", say: ["In India, each infant faced an average of seven point seven heatwave days a year,", "forty-seven per cent more than in the 1990s."],
      src: "Lancet Countdown, India data sheet, 2024", d: { kind: "stats", items: [{ count: 7.7, dec: 1, label: "heatwave days a year, per infant", at: 0 }, { count: 47, pre: "+", suf: "%", label: "against the 1990s", color: "var(--orange)", at: 1 }] } },
    { type: "statement", line: "Shade, fluids, and *a cool place to sleep.*", sub: "And a clinic that knows heat is on its way.", say: ["Shade, fluids, and a cool place to sleep,", "and a clinic that knows heat is on its way."] },
    END("The smallest people need the closest watch.") ] },

  { id: "kidneyheat", term: "Heat, kidneys and the heart", group: "body", scenes: [
    { type: "hook", q: "Where does heat do its *quiet damage?*", say: ["Where does heat do its quiet damage?"] },
    { type: "term", title: "Kidneys and the heart", sub: "Sweat, thirst and a heart pumping hard to cool", say: ["When you sweat, you lose water and salt.", "The heart pumps harder to carry heat to the skin,", "and the kidneys strain, especially when it happens day after day."],
      d: { kind: "flow", steps: [{ k: "Sweat", text: "Water and salt lost", at: 0 }, { k: "Heart", text: "Pumps harder", at: 1 }, { k: "Kidneys", text: "Strain, day after day", at: 2, hot: true }] } },
    { type: "show", k: "Who is most at risk", title: "People living with *long-term illness*", sub: "Heart, kidney and lung conditions leave less room to cope with heat.", say: ["People already living with heart, kidney or lung conditions", "have less room to cope."], src: "Kidney International Reports, 2023" },
    { type: "statement", line: "Many heat deaths are *recorded as something else.*", sub: "A failing heart or kidneys, on a hot day.", say: ["That is why many heat deaths are recorded as something else:", "a failing heart or kidneys, on a hot day."] },
    END("Heat care is care for long-term illness too.") ] },

  { id: "sleepheat", term: "Sleep in the heat", group: "body", scenes: [
    { type: "hook", q: "What happens when *the night doesn’t cool?*", say: ["What happens when the night doesn’t cool?"] },
    { type: "term", title: "Sleep in the heat", sub: "The body needs to cool to fall and stay asleep", say: ["To fall asleep, the body needs to cool down.", "On hot nights, sleep comes later and ends sooner."], d: { kind: "art", name: "moon", at: 0, top: 300, size: 640 } },
    { type: "show", k: "68 countries", title: "Sleep lost on hot nights", sub: "measured with the sleep wristbands of 47,628 people", say: ["A study of forty-seven thousand people’s sleep wristbands, in sixty-eight countries,", "found that hot nights cut sleep."], src: "Minor et al., One Earth, 2022",
      d: { kind: "stats", items: [{ count: 47628, label: "people’s sleep, measured", at: 0 }, { count: 68, label: "countries", color: "var(--orange)", at: 0 }] } },
    { type: "statement", line: "A bad night means *a harder next day.*", sub: "The body starts the day already tired, with no reserve for the heat.", say: ["A bad night means a harder next day:", "the body starts already tired, with no reserve for the heat."] },
    END("Cool nights are part of protection.") ] },

  { id: "mindheat", term: "Heat and the mind", group: "body", scenes: [
    { type: "hook", q: "Can heat *weigh on the mind?*", say: ["Can heat weigh on the mind?"] },
    { type: "term", title: "Heat and mental health", sub: "More distress on hotter days", say: ["Yes. On hotter days, studies find more anxiety and distress,", "more visits for mental health care,", "and harder days for people living with mental illness."],
      src: "Thompson et al., The Lancet Planetary Health, 2023", d: { kind: "flow", steps: [{ k: "Sleep", text: "Lost on hot nights", at: 0 }, { k: "Stress", text: "Builds through the day", at: 1 }, { k: "Care", text: "More people need it", at: 2, hot: true }] } },
    { type: "statement", line: "Heat plans can *include the mind.*", sub: "People in mental health care, and those who support them, need cool places and calm support too.", say: ["So heat plans can include the mind:", "people in mental health care, and those who support them, need cool places too."] },
    END("A cooler mind needs a cooler place.") ] },

  { id: "homeheat", term: "When home is hotter than outside", group: "body", scenes: [
    { type: "hook", q: "Can a home be *hotter inside* than out?", say: ["Can a home be hotter inside than out?"] },
    { type: "term", title: "Homes that trap heat", sub: "Tin roofs, few windows, crowded rooms", say: ["Yes. Thin metal roofs heat fast,", "small windows let little air through,", "and the heat stays long after sunset."], d: { kind: "art", name: "house", at: 0, top: 300, size: 640 } },
    { type: "show", k: "Ahmedabad, India", title: "Up to *7.6 °C* hotter", sub: "in informal settlements than in formal housing", say: ["In a survey of eight hundred and sixty households in Ahmedabad,", "people in informal settlements faced temperatures up to seven point six degrees higher."],
      src: "Mahadevia et al., 2020, reported in Frontiers in Built Environment, 2022", d: { kind: "stats", items: [{ count: 7.6, dec: 1, pre: "+", suf: " °C", label: "informal settlements, against formal housing", at: 1 }, { count: 860, label: "households surveyed", color: "var(--ink)", at: 0 }] } },
    { type: "statement", line: "A *cool roof* can change the whole night.", sub: "Reflective paint, shade and cross-breezes, before any machine.", say: ["A cool roof can change the whole night:", "reflective paint, shade and a cross-breeze, before any machine."] },
    END("Safe from heat starts with the roof.") ] },

  { id: "kitchenheat", term: "Kitchen heat", group: "body", scenes: [
    { type: "hook", q: "Who works in the *hottest room* of the house?", say: ["Who works in the hottest room of the house?"] },
    { type: "term", title: "Kitchen heat", sub: "Cooking over a fire, in a heatwave", say: ["Very often, women and girls,", "cooking over a fire in a small, smoky kitchen,", "in the middle of a heatwave."], d: { kind: "art", name: "house", at: 1, top: 300, size: 640 } },
    { type: "show", k: "Madhesh Province, Nepal", title: "A daily *thermal labour*", sub: "heaviest for women in the poorest single-room homes, with little access to clean energy", say: ["A study in Nepal calls it a daily thermal labour,", "heaviest for women in the poorest single-room homes."], src: "Ghimire and others, Frontiers in Public Health, 2025" },
    { type: "statement", line: "When heat makes people ill, *the caring falls on women.*", sub: "Fetching water, nursing the sick, minding children home from school.", say: ["And when heat makes people ill, the extra caring usually falls on women and girls:", "fetching water, nursing the sick, minding children home from school."], subAt: 0 },
    END("Cleaner stoves, cooler kitchens, shared care.") ] },

  { id: "firstaid", term: "Heat illness first aid", group: "body", scenes: [
    { type: "hook", q: "Someone collapses in the heat. *What helps first?*", say: ["Someone collapses in the heat.", "What helps first?"] },
    { type: "term", title: "Cool first", sub: "Heatstroke is an emergency: cooling buys time", say: ["Cooling them, as fast as possible.", "Heatstroke is an emergency, and every minute of cooling counts."] },
    { type: "show", title: "Four steps", say: ["Move them to shade.", "Cool the body with water and fanning.", "Call for help.", "And if they are awake and can swallow, small sips of water."], src: "National Centre for Disease Control, India",
      d: { kind: "flow", steps: [{ k: "Shade", text: "Move to a cool place", at: 0 }, { k: "Cool", text: "Water and fanning", at: 1, hot: true }, { k: "Call", text: "Get medical help", at: 2 }, { k: "Sip", text: "Only if awake", at: 3, good: true }] } },
    { type: "statement", line: "Confusion is *a warning sign.*", sub: "Hot skin and confusion together can mean heatstroke.", say: ["Confusion is a warning sign:", "hot skin and confusion together can mean heatstroke."] },
    END("Cool first, then get help.") ] },

  { id: "checkins", term: "Heat check-ins", group: "act", scenes: [
    { type: "hook", q: "Who *checks on you* in a heatwave?", say: ["Who checks on you in a heatwave?"] },
    { type: "term", title: "Heat check-ins", sub: "A call or a knock for people who live alone", say: ["A heat check-in is a call or a knock", "for people who live alone or can’t easily leave home."], d: { kind: "art", name: "people", at: 0, top: 300, size: 640 } },
    { type: "show", k: "Chicago, 1995", title: "Many died *alone at home*", sub: "Living alone and not leaving home were among the strongest risks.", say: ["In Chicago’s 1995 heatwave, many of those who died were alone at home.", "Living alone, and not leaving home, were among the strongest risks."], src: "Semenza et al., New England Journal of Medicine, 1996" },
    { type: "statement", line: "Neighbours, health workers, *a phone call.*", sub: "Cheap, simple, and often what makes the difference.", say: ["Neighbours, community health workers, a phone call:", "cheap, simple, and often what makes the difference."] },
    END("No one alone in the heat.") ] },

  { id: "closedplaces", term: "Heat in closed places", group: "act", scenes: [
    { type: "hook", q: "What if you *can’t leave* when it’s too hot?", say: ["What if you can’t leave when it’s too hot?"] },
    { type: "term", title: "Heat in closed places", sub: "Prisons, hostels, care homes, crowded shelters", say: ["Some people can’t go to shade, or a cooling centre:", "people in prisons, hostels, care homes and crowded shelters."] },
    { type: "show", k: "Tamil Nadu, India", title: "Named in a *heat plan*", sub: "Its strategy lists prisoners among the groups it is meant to reach, with cool roofs and trees for jails.", say: ["Tamil Nadu’s heat strategy names prisoners among the groups it is meant to reach,", "and proposes cool roofs and trees for its jails."], src: "Tamil Nadu Heat Mitigation Strategy, 2024" },
    { type: "statement", line: "Whoever holds the key *holds the duty of care.*", say: ["Whoever holds the key holds the duty of care."] },
    END("Heat plans that reach every building.") ] },

  // ---- health services ----
  { id: "clinicheat", term: "Clinics in a heatwave", group: "act", scenes: [
    { type: "hook", q: "What happens to a hospital *in a heatwave?*", say: ["What happens to a hospital in a heatwave?"] },
    { type: "term", title: "Clinics in a heatwave", sub: "More patients, just as power, staff and supplies are stretched", say: ["More patients arrive,", "just as power, staff and supplies are stretched."], d: { kind: "art", name: "clinic", at: 0, top: 300, size: 640 } },
    { type: "show", k: "India, 2024", title: "Ready before the heat", sub: "Hospitals set aside heatstroke rooms, ice baths and cooled beds.", say: ["In 2024, Indian hospitals prepared heatstroke rooms,", "ice baths and cooled beds before the peak."], src: "Context (Thomson Reuters Foundation), 2024",
      d: { kind: "flow", steps: [{ k: "Before", text: "Heat rooms and ice", at: 0, good: true }, { k: "During", text: "Fast cooling, triage", at: 1 }, { k: "After", text: "Count and learn", at: 1 }] } },
    { type: "statement", line: "A clinic that *loses power* loses its cooling too.", sub: "Back-up power and a cool room keep care going.", say: ["And a clinic that loses power loses its cooling too.", "Back-up power and a cool room keep care going."] },
    END("Clinics that stay cool, so they can keep others cool.") ] },

  { id: "healthalert", term: "Warning the hospitals first", group: "act", scenes: [
    { type: "hook", q: "Who needs a heat warning *before the public?*", say: ["Who needs a heat warning before the public?"] },
    { type: "term", title: "Warning the hospitals first", sub: "A warning that reaches clinics a day or two early", say: ["The hospitals.", "A warning that reaches clinics early lets them add staff,", "stock fluids and clear beds before the heat arrives."],
      d: { kind: "flow", steps: [{ k: "Forecast", text: "Heat is coming", at: 0 }, { k: "Clinics", text: "Staff, fluids, beds", at: 1, good: true }, { k: "Public", text: "Warnings and water", at: 2 }] } },
    { type: "show", k: "Ahmedabad, India", title: "*1,190* deaths a year", sub: "estimated to have been avoided after the city’s heat plan prepared hospitals and warned the public", say: ["After Ahmedabad’s heat plan prepared hospitals and warned the public,", "an evaluation estimated about one thousand one hundred and ninety deaths a year were avoided."],
      src: "Hess et al., Journal of Environmental and Public Health, 2018", d: { kind: "stats", items: [{ count: 1190, label: "deaths a year, estimated avoided", color: "var(--green)", at: 1 }] } },
    END("Warn the clinics, then the streets.") ] },

  { id: "coldchainheat", term: "Cold chains in the heat", group: "cooling", scenes: [
    { type: "hook", q: "What keeps *medicines and food* safe in a heatwave?", say: ["What keeps medicines and food safe in a heatwave?"] },
    { type: "term", title: "The cold chain", sub: "Every fridge from the factory to the patient or the plate", say: ["The cold chain: every fridge and cool box", "from the factory to the patient, or the plate."],
      d: { kind: "flow", steps: [{ k: "Store", text: "Cold room", at: 1 }, { k: "Move", text: "Cool box, van", at: 1 }, { k: "Clinic", text: "Vaccine fridge", at: 1, good: true }] } },
    { type: "show", k: "Worldwide", title: "*526 million* tonnes", sub: "of food lost each year for lack of refrigeration", say: ["Each year, five hundred and twenty-six million tonnes of food are lost for lack of refrigeration."], src: "UNEP and FAO, Sustainable Food Cold Chains, 2022",
      d: { kind: "stats", items: [{ count: 526, suf: " million", label: "tonnes of food lost, for lack of cooling", at: 0 }] } },
    { type: "statement", line: "When the power fails, *the chain breaks.*", sub: "Solar fridges and back-up power keep vaccines safe.", say: ["When the power fails in a heatwave, the chain breaks.", "Solar fridges and back-up power keep vaccines safe."] },
    END("Keep the chain cold, end to end.") ] },

  { id: "telecomheat", term: "When phones go quiet", group: "cooling", scenes: [
    { type: "hook", q: "What if the warning *can’t get through?*", say: ["What if the heat warning can’t get through?"] },
    { type: "term", title: "When phones go quiet", sub: "Masts need power and cooling too", say: ["Phone masts and networks need power, and cooling.", "In a long heatwave with power cuts, signals weaken."], d: { kind: "art", name: "network", at: 0, top: 300, size: 640 } },
    { type: "show", k: "Bangladesh, 2026", title: "Signals weakened", sub: "as blackouts spread during the heat", say: ["In Bangladesh in 2026, mobile signals weakened as blackouts spread."], src: "Asia News Network, 2026" },
    { type: "statement", line: "Warnings, payments and calls for help *all ride on it.*", sub: "So back-up power for networks is heat protection too.", say: ["Warnings, mobile payments and calls for help all ride on it.", "So back-up power for networks is heat protection too."] },
    END("Keep the line open in the heat.") ] },

  // ---- city systems ----
  { id: "gridheat", term: "Power grids in a heatwave", group: "cooling", scenes: [
    { type: "hook", q: "Why do the lights go out *when it’s hottest?*", say: ["Why do the lights go out when it’s hottest?"] },
    { type: "term", title: "Grids in a heatwave", sub: "Demand peaks just as equipment struggles", say: ["Everyone switches on fans and air conditioners at once.", "Lines and transformers run hot,", "and some give way."], d: { kind: "art", name: "power", at: 0, top: 300, size: 640 } },
    { type: "show", k: "Northern Viet Nam, 2023", title: "*US$1.4 billion*", sub: "an early World Bank estimate of what power cuts cost in May and June, about 0.3% of GDP", say: ["In northern Viet Nam in 2023, heat pushed up demand and dried hydropower reservoirs.", "An early World Bank estimate put the cost of the power cuts at one point four billion dollars."],
      src: "World Bank estimate, reported by AFP via The Manila Times, 2023", d: { kind: "stats", items: [{ count: 1.4, dec: 1, pre: "US$", suf: " bn", label: "estimated cost of two months of cuts", at: 1 }] } },
    { type: "statement", line: "A blackout *switches off cooling* when it matters most.", sub: "Cooler buildings and efficient machines lower the peak.", say: ["A blackout switches off cooling when it matters most.", "Cooler buildings and efficient machines lower the peak."] },
    END("Lower the peak, keep the power on.") ] },

  { id: "waterpower", term: "Water for power, power for water", group: "cooling", scenes: [
    { type: "hook", q: "Why do *power and water* fail together?", say: ["Why do power and water fail together?"] },
    { type: "term", title: "Water for power, power for water", sub: "Each needs the other, and heat strains both", say: ["Many power plants need water to cool.", "Water pumps need power to run.", "In a heatwave, each strains the other."],
      d: { kind: "cycle", nodes: ["Heat raises demand", "Plants short of cooling water", "Power cuts", "Pumps stop, taps run dry"], center: "Both strain", at: 0 } },
    { type: "show", k: "India, 2016", title: "*14 TWh* lost", sub: "of electricity, because thermal power plants ran short of water", say: ["In India in 2016, fourteen terawatt-hours of electricity were lost", "because thermal power plants ran short of water."], src: "World Resources Institute, 2018",
      d: { kind: "stats", items: [{ count: 14, suf: " TWh", label: "of electricity lost to water shortages", at: 0 }] } },
    END("Plan power and water together.") ] },

  { id: "dieselheat", term: "The diesel fallback", group: "cooling", scenes: [
    { type: "hook", q: "When the grid fails, *what keeps running?*", say: ["When the grid fails, what keeps running?"] },
    { type: "term", title: "The diesel fallback", sub: "Generators for those who can afford them", say: ["For homes, shops and hospitals that can afford them,", "diesel generators."], d: { kind: "art", name: "power", at: 0, top: 300, size: 640 } },
    { type: "show", k: "In low- and middle-income countries", title: "*20 to 30 million*", sub: "back-up generator sites", say: ["There are twenty to thirty million back-up generator sites in poorer countries,", "noisy, polluting, and costly to run."], src: "IFC, The Dirty Footprint of the Broken Grid, 2019" },
    { type: "statement", line: "It keeps the lights on, *and adds to the heat.*", sub: "Steadier grids and clean back-up power break the loop.", say: ["It keeps the lights on, and adds to the heat.", "Steadier grids and clean back-up power break the loop."] },
    END("Back-up power that doesn’t warm the city.") ] },

  { id: "urbantrees", term: "City trees under heat", group: "nature", scenes: [
    { type: "hook", q: "What happens when *the shade itself* is in danger?", say: ["What happens when the shade itself is in danger?"] },
    { type: "term", title: "City trees under heat", sub: "Heat, drought and missing care kill street trees", say: ["Street trees cool a city.", "But heat, drought and missing care can kill them,", "just when their shade is needed."], d: { kind: "art", name: "tree", at: 0, top: 300, size: 640 } },
    { type: "show", k: "164 cities", title: "*56%* now, *76%* by 2050", sub: "of urban tree and shrub species facing temperatures beyond their natural range", say: ["Across one hundred and sixty-four cities, fifty-six per cent of urban tree and shrub species already face temperatures beyond their natural range,", "and seventy-six per cent could by 2050."],
      src: "Esperon-Rodriguez et al., Nature Climate Change, 2022", d: { kind: "bars", max: 100, rows: [{ label: "Today", count: 56, suf: "%", n: 56, at: 0 }, { label: "By 2050", count: 76, suf: "%", n: 76, color: "#D7263D", at: 1 }] } },
    { type: "statement", line: "Plant trees that *suit the heat to come,*", sub: "and budget for the watering that keeps them alive.", say: ["Plant trees that suit the heat to come,", "and budget for the watering that keeps them alive."] },
    END("Shade that lasts.") ] },

  { id: "shadegap", term: "Shade follows wealth", group: "nature", scenes: [
    { type: "hook", q: "Why are *some streets* so much hotter?", say: ["Why are some streets so much hotter than others?"] },
    { type: "term", title: "Shade follows wealth", sub: "Trees and parks cluster where people can pay for them", say: ["Trees and parks cluster in better-off neighbourhoods,", "which can pay for them, and for the upkeep that keeps them alive."], src: "Wolch, Byrne and Newell, Landscape and Urban Planning, 2014" },
    { type: "show", k: "Jakarta, Indonesia", title: "Dense, low-income, *hotter*", sub: "Green space is concentrated in wealthier areas; workers cool off on terraces and in parks.", say: ["In Jakarta, dense low-income neighbourhoods act as heat islands,", "while green space is concentrated in wealthier areas."], src: "Ufaira and others, Frontiers in Human Dynamics, 2023", d: { kind: "art", name: "city", at: 0, top: 300, size: 640 } },
    { type: "statement", line: "Start the shade *where the heat is worst.*", sub: "And plant it in a way that doesn’t push people out.", say: ["Start the shade where the heat is worst,", "and plant it in a way that doesn’t push people out."] },
    END("Shade for every street.") ] },

  { id: "coolschools", term: "Cool classrooms", group: "act", scenes: [
    { type: "hook", q: "What happens to school *in a heatwave?*", say: ["What happens to school in a heatwave?"] },
    { type: "term", title: "Cool classrooms", sub: "A hot room is hard to learn in, and sometimes unsafe", say: ["A hot classroom is hard to learn in,", "and when it becomes unsafe, schools close."], d: { kind: "art", name: "school", at: 0, top: 300, size: 640 } },
    { type: "show", k: "2024", title: "*171 million* students", sub: "had their schooling disrupted by heatwaves; South Asia was the most affected region", say: ["In 2024, heatwaves disrupted the schooling of one hundred and seventy-one million students.", "South Asia was the most affected region."], src: "UNICEF, Learning interrupted, 2025",
      d: { kind: "stats", items: [{ count: 171, suf: " million", label: "students’ schooling disrupted by heat", at: 0 }] } },
    { type: "show", k: "The Philippines, April 2024", title: "*5,288* schools", sub: "switched to remote learning as the heat index reached danger levels", say: ["In the Philippines, five thousand two hundred and eighty-eight schools switched to remote learning in one week of April 2024."], src: "AFP via Malay Mail, 2024" },
    END("Cool roofs, shade and water, so school can stay open.") ] },

  { id: "railsheat", term: "Roads and rails in the heat", group: "cooling", scenes: [
    { type: "hook", q: "Can heat *bend a railway?*", say: ["Can heat bend a railway?"] },
    { type: "term", title: "Roads and rails in the heat", sub: "Steel expands; asphalt softens", say: ["Yes. Steel rails expand in the heat and can buckle,", "so trains slow down.", "Roads soften, and hot, thin air means planes need longer runways."], src: "Network Rail; Coffel, Thompson and Horton, Climatic Change, 2017",
      d: { kind: "flow", steps: [{ k: "Rails", text: "Expand and buckle", at: 0, hot: true }, { k: "Trains", text: "Slow down", at: 1 }, { k: "Roads", text: "Soften", at: 2 }] } },
    { type: "statement", line: "Slower journeys, *missed shifts, late supplies.*", sub: "Including medicines and food on their way to the people who need them.", say: ["That means slower journeys, missed shifts and late supplies,", "including medicines and food on their way to the people who need them."] },
    END("Infrastructure built for the heat to come.") ] },

  // ---- nature ----
  { id: "drysoilloop", term: "When dry soil heats the air", group: "nature", scenes: [
    { type: "hook", q: "Can dry ground *make a heatwave worse?*", say: ["Can dry ground make a heatwave worse?"] },
    { type: "term", title: "The dry-soil loop", sub: "Less moisture to evaporate, so more heat stays in the air", say: ["Moist soil cools the air as its water evaporates.", "When the soil dries out, that cooling stops,", "so the air heats faster, and dries the soil further."], src: "Seneviratne et al., Earth-Science Reviews, 2010",
      d: { kind: "cycle", nodes: ["Heat dries the soil", "Less water to evaporate", "Air heats faster", "Soil dries further"], center: "A loop", brk: 3, brkAt: 2, brkLabel: "Mulch, trees and water in the soil break it", at: 0 } },
    { type: "statement", line: "Keep water *in the ground.*", sub: "Ponds, mulch, trees and wetlands hold the cooling in.", say: ["Keeping water in the ground keeps the cooling in:", "ponds, mulch, trees and wetlands."] },
    END("Wet ground, cooler air.") ] },

  { id: "tropicalice", term: "Asia’s last tropical ice", group: "nature", scenes: [
    { type: "hook", q: "There is ice *on the equator.* For now.", say: ["There is ice on the equator. For now."] },
    { type: "term", title: "Puncak Jaya, Indonesia", sub: "Southeast Asia’s last tropical glacier", say: ["High on Puncak Jaya, in Papua, Indonesia,", "sits Southeast Asia’s last tropical ice."], d: { kind: "art", name: "glacier", at: 0, top: 300, size: 640 } },
    { type: "show", k: "Since 1850", title: "*99%* gone", sub: "About 0.17 km² was left in 2024; it will very likely disappear around 2030.", say: ["Ninety-nine per cent of its glacier area has gone since 1850.", "What remains will very likely disappear around 2030."], src: "Ibel, Mölg and Sommer, The Cryosphere, 2025",
      d: { kind: "stats", items: [{ count: 99, suf: "%", label: "of the glacier area, gone since 1850", at: 0 }, { count: 2030, label: "around when the last ice is likely to go", color: "var(--orange)", at: 1 }] } },
    END("What we lose, we can still slow elsewhere.") ] },

  { id: "saltwater", term: "Heat, drought and salt water", group: "nature", scenes: [
    { type: "hook", q: "How does a heatwave *put salt in the fields?*", say: ["How does a heatwave put salt in the fields?"] },
    { type: "term", title: "Heat, drought and salt water", sub: "Low rivers let the sea push inland", say: ["Heat and drought lower rivers and canals.", "With less fresh water pushing out, the sea pushes in."],
      d: { kind: "flow", steps: [{ k: "Heat", text: "Rivers and canals fall", at: 0 }, { k: "Sea", text: "Salt water pushes inland", at: 1, hot: true }, { k: "Fields", text: "Salty water harms the crop", at: 1 }] } },
    { type: "show", k: "Mekong Delta, February 2024", title: "Up to *half* a crop lost", sub: "by farmers who pumped salty canal water onto their rice", say: ["In Viet Nam’s Mekong Delta in February 2024, a long heatwave let sea water push inland.", "Farmers who pumped the salty water onto their rice lost up to half their crop."], src: "Viet Nam News, 2024" },
    END("Store fresh water before the dry heat comes.") ] },
];
