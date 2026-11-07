## A. SUMMARY

- This is lens 2: compound and cascading events. It proposes nine updates, fifteen links and four worked levers. Fourteen of fifteen sources concern South or Southeast Asia; one is global guidance.

- The biggest blind spot is recovery time and service dependence. Northern Viet Nam's 2023 power constraints and India's cyclone-heat research connect hazards with the availability of protection. [S1,S2]

- Cases cover hot-dry conditions, polluted air, storm recovery, outbreak response and successive crop shocks. The Mekong Delta example adds a documented water-service component, without attributing its impacts to heat. [S4,S6-S11]

- Tested and rejected assumptions include heat causing Pakistan's later monsoon floods, universal heat-pollution co-peaks, and drought being essential for Indonesian fire risk. [S5,S11,S14]

- Same-household joint losses, regional compound-health multipliers and conflict-related interactions remain thin here. Programme activation, household accounts and improved comfort are kept separate from evaluated protection outcomes.

Evidence checked to 4 November 2026. This uses the supplied map, rather than a live-site audit. KNOWN marks a measured or official finding; INFERRED marks modelled or indirect pathways; UNCERTAIN marks single-study or unresolved interpretations.

## B. NEW OR UPDATED HARMS

```json
[
  {
    "id": "power",
    "sys": "energy",
    "status": "update",
    "label": "Demand meets constrained supply",
    "desc": "Heat-driven demand can coincide with water-constrained electricity supply. Northern Viet Nam recorded this combination in June 2023, with plant and transmission constraints also contributing.",
    "grade": "KNOWN",
    "who": "Households, workers and services dependent on reliable electricity",
    "sources": [
      "S2"
    ],
    "debated": "This operational account does not isolate heat's contribution from other constraints."
  },
  {
    "id": "homes",
    "sys": "cities",
    "status": "update",
    "label": "Heat during storm recovery",
    "desc": "Following some Indian cyclones, moist heat peaked during the recovery period. Damaged power systems can leave homes without cooling, although the study did not measure household temperatures or health.",
    "grade": "INFERRED",
    "who": "Storm-affected households, older people, people with disabilities and recovery workers",
    "sources": [
      "S1"
    ],
    "debated": "Hazard estimates do not establish observed household health effects."
  },
  {
    "id": "deaths",
    "sys": "health",
    "status": "update",
    "label": "Heat with polluted air",
    "desc": "A Thai study found stronger pollution-mortality associations on very hot days. This supports testing joint alerts, without assuming the same interaction everywhere.",
    "grade": "UNCERTAIN",
    "who": "People exposed to polluted air during hot conditions",
    "sources": [
      "S4"
    ],
    "debated": "Abstract-only review of one study; results varied by pollutant and temperature definition."
  },
  {
    "id": "scarcity",
    "sys": "water",
    "status": "update",
    "label": "Water unavailable or unusable",
    "desc": "Drought and salinity can restrict water needed for heat protection. UNICEF documented Mekong Delta water pressure in April 2024 without estimating heat's separate contribution.",
    "grade": "INFERRED",
    "who": "Households without reliable freshwater; women and girls collecting water",
    "sources": [
      "S7"
    ],
    "debated": "Water-service evidence does not establish joint heat-health effects."
  },
  {
    "id": "hsys",
    "sys": "health",
    "status": "update",
    "label": "Heat during outbreak response",
    "desc": "Heat protection in healthcare can become harder during an outbreak. Indian and Singaporean workers reported thermal symptoms while using PPE; effects on patient care were not measured.",
    "grade": "UNCERTAIN",
    "who": "Healthcare workers and other staff using protective clothing",
    "sources": [
      "S9"
    ],
    "debated": "The survey did not isolate the effect of PPE from workload and environmental conditions."
  },
  {
    "id": "schoolclose",
    "sys": "education",
    "status": "update",
    "label": "Disruption before recovery",
    "desc": "Cox's Bazar records for 2024 include disaster damage to learning facilities and separate heat closures. The combined learning loss for individual children was not measured.",
    "grade": "KNOWN",
    "who": "Displaced children using temporary learning facilities",
    "sources": [
      "S10"
    ],
    "debated": "Recorded disruptions are not an estimate of an interaction effect or permanent dropout."
  },
  {
    "id": "harvests",
    "sys": "food",
    "status": "update",
    "label": "Successive seasonal crop shocks",
    "desc": "The Pakistan 2022 assessment describes flood crop losses adding to food pressures after regional summer heat. This is a sequence of pressures, not proof that the heat caused the monsoon floods.",
    "grade": "INFERRED",
    "who": "Crop-dependent households and people facing food shortages",
    "sources": [
      "S11"
    ],
    "debated": "The assessment did not measure joint losses for the same households."
  },
  {
    "id": "glof",
    "sys": "nature",
    "status": "update",
    "label": "Melt within unstable lakes",
    "desc": "Shisper's May 2022 outburst involved an ice-dammed lake associated with a glacier surge. Melting can contribute, but heat alone does not explain the lake's formation and drainage.",
    "grade": "INFERRED",
    "who": "Downstream communities, travellers and infrastructure operators",
    "sources": [
      "S12",
      "S13"
    ],
    "debated": "Heat's separate contribution to this event was not established; drainage mechanisms remain partly inferred."
  },
  {
    "id": "wildfires",
    "sys": "nature",
    "status": "update",
    "label": "Fire beyond drought years",
    "desc": "Indonesian research indicates that warmth can increase fire probability outside drought years. The heat-fire relationship depends on rainfall conditions.",
    "grade": "INFERRED",
    "who": "Fire-prone communities and people exposed to regional smoke",
    "sources": [
      "S14"
    ],
    "debated": "The institutional abstract was read; detailed methods were inaccessible and no fixed multiplier was imported."
  }
]
```

## C. LINKS

```json
[
  {
    "from": "scarcity",
    "to": "hydro",
    "why": "Low reservoir water restricted hydropower availability during northern Viet Nam's June 2023 heat.",
    "loop": "energywater",
    "grade": "KNOWN",
    "moderators": "Reservoir storage and inflows; event-specific operational evidence.",
    "lag": "unknown",
    "sources": [
      "S2"
    ]
  },
  {
    "from": "hydro",
    "to": "power",
    "why": "Reduced hydropower availability contributed to constrained electricity supply during the hot period.",
    "loop": "energywater",
    "grade": "KNOWN",
    "moderators": "Other generation and transmission capacity also mattered.",
    "lag": "days",
    "sources": [
      "S2"
    ]
  },
  {
    "from": "power",
    "to": "homes",
    "why": "Storm-related outages can remove electric cooling when humid heat follows a cyclone.",
    "loop": "",
    "grade": "INFERRED",
    "moderators": "Restoration time and cooling dependence; household impacts were not measured.",
    "lag": "unknown",
    "sources": [
      "S1"
    ]
  },
  {
    "from": "glacier",
    "to": "glof",
    "why": "Glacier advance can dam drainage; subsequent melt and drainage changes can contribute to an outburst.",
    "loop": "",
    "grade": "INFERRED",
    "moderators": "Ice-dam geometry and subglacial conduits; not a universal heat-to-flood pathway.",
    "lag": "unknown",
    "sources": [
      "S12",
      "S13"
    ]
  },
  {
    "from": "glof",
    "to": "infrastructure",
    "why": "The 7 May 2022 Shisper outburst removed the Hassanabad bridge.",
    "loop": "",
    "grade": "KNOWN",
    "moderators": "Location and exposure of roads and bridges.",
    "lag": "days",
    "sources": [
      "S13"
    ]
  },
  {
    "from": "smog",
    "to": "deaths",
    "why": "Thai pollution-mortality associations were stronger on very hot days.",
    "loop": "",
    "grade": "UNCERTAIN",
    "moderators": "Pollutant, temperature threshold and green density; observational evidence.",
    "lag": "days",
    "sources": [
      "S4"
    ]
  },
  {
    "from": "infectious",
    "to": "hsys",
    "why": "Outbreak response can combine PPE, workload and hot conditions, adding strain for staff.",
    "loop": "clinic",
    "grade": "INFERRED",
    "moderators": "Cooling and recovery access; patient outcomes were not measured.",
    "lag": "days",
    "sources": [
      "S9"
    ]
  },
  {
    "from": "infectious",
    "to": "isolation",
    "why": "Pandemic infection-control measures can restrict access to shared cool spaces and in-person support.",
    "loop": "",
    "grade": "INFERRED",
    "moderators": "Global 2020 guidance; local measures and safe alternatives vary.",
    "lag": "days",
    "sources": [
      "S8"
    ]
  },
  {
    "from": "isolation",
    "to": "homes",
    "why": "Remaining in a hot dwelling can prolong exposure when cooler alternatives are inaccessible.",
    "loop": "",
    "grade": "INFERRED",
    "moderators": "Global guidance pathway; cooling access and remote support alter the risk.",
    "lag": "days",
    "sources": [
      "S8"
    ]
  },
  {
    "from": "infrastructure",
    "to": "schoolclose",
    "why": "Disaster damage can interrupt learning in facilities also exposed to heat closures.",
    "loop": "school",
    "grade": "KNOWN",
    "moderators": "Temporary construction and repair time; joint losses were not measured.",
    "lag": "weeks",
    "sources": [
      "S10"
    ]
  },
  {
    "from": "quality",
    "to": "scarcity",
    "why": "Saltwater intrusion can make existing water sources unsuitable for domestic supply.",
    "loop": "",
    "grade": "KNOWN",
    "moderators": "Freshwater connections and storage; Mekong Delta water-component evidence.",
    "lag": "unknown",
    "sources": [
      "S7"
    ]
  },
  {
    "from": "scarcity",
    "to": "fetching",
    "why": "Water shortages increase collection burdens, which UNICEF reports falling disproportionately on women and girls.",
    "loop": "squeeze",
    "grade": "KNOWN",
    "moderators": "Distance and connections; no collection-time effect size was reported.",
    "lag": "days",
    "sources": [
      "S7"
    ]
  },
  {
    "from": "harvests",
    "to": "hunger",
    "why": "Flood crop losses can add to food-supply pressures left by a hot season.",
    "loop": "poverty",
    "grade": "INFERRED",
    "moderators": "Food stocks and market access; the Pakistan assessment did not isolate a household interaction effect.",
    "lag": "unknown",
    "sources": [
      "S11"
    ]
  },
  {
    "from": "droughts",
    "to": "wildfires",
    "why": "Drought can favour fires, but Indonesian evidence also identifies temperature-sensitive fire risk outside drought years.",
    "loop": "fire",
    "grade": "INFERRED",
    "moderators": "Rainfall conditions and temperature; abstract-only appraisal.",
    "lag": "unknown",
    "sources": [
      "S14"
    ]
  },
  {
    "from": "wildfires",
    "to": "smog",
    "why": "Indonesian fires in 1997 and 2015 produced prolonged regional air pollution.",
    "loop": "",
    "grade": "KNOWN",
    "moderators": "Smoke transport and fire extent; no joint heat-health death count is inferred.",
    "lag": "days",
    "sources": [
      "S14"
    ]
  }
]
```

## D. LEVERS

```json
[
  {
    "id": "anticipatory",
    "edge": [
      "harvests",
      "hunger"
    ],
    "title": "Act before dry-season losses",
    "who": [
      "Disaster management agencies",
      "Agriculture agencies",
      "Humanitarian organisations"
    ],
    "when": "season",
    "measure": "Track support arrival, food access and farm losses against comparison areas.",
    "text": "The Philippines activated anticipatory action during the 2024 hot, dry episode. The account documents activation, not evaluated loss reduction.",
    "example": "Philippines, 2024: FAO and partners activated programmes in Isabela and Bangsamoro.",
    "unintended": "",
    "sources": [
      "S6"
    ]
  },
  {
    "id": "readyclinics",
    "edge": [
      "infectious",
      "hsys"
    ],
    "title": "Pair protection with staff cooling",
    "who": [
      "Health facilities",
      "Occupational health teams"
    ],
    "when": "season",
    "measure": "Measure thermal strain, comfort and safe work separately.",
    "text": "A small Singapore test found improved comfort after ice slurry. Illness prevention was not assessed.",
    "example": "Singapore, May-June 2020: 37 before-and-after observations among workers responding to COVID-19.",
    "unintended": "",
    "sources": [
      "S9"
    ]
  },
  {
    "id": "keepinschool",
    "edge": [
      "infrastructure",
      "schoolclose"
    ],
    "title": "Rebuild for several hazards",
    "who": [
      "Education agencies",
      "Humanitarian organisations",
      "Camp management bodies"
    ],
    "when": "years",
    "measure": "Track indoor heat, service downtime and attendance through successive hazards.",
    "text": "The replacement centre combined durable construction, fans and solar backup. Comparative learning benefits remain untested.",
    "example": "Cox's Bazar, February 2025: construction completed on the Phoenix Learning Centre.",
    "unintended": "",
    "sources": [
      "S10"
    ]
  },
  {
    "id": "soilwater",
    "edge": [
      "scarcity",
      "livestock"
    ],
    "title": "Store water for hot seasons",
    "who": [
      "Water agencies",
      "Agriculture agencies",
      "Community organisations"
    ],
    "when": "years",
    "measure": "Track usable stored water, livestock access and pumping costs through dry periods.",
    "text": "A UNDP-supported pond supplied livestock and crops in a hot, drought-prone setting. Evidence comes from one household account.",
    "example": "Ninh Thuan, Viet Nam, July 2023: pond construction supported a smallholder family.",
    "unintended": "",
    "sources": [
      "S15"
    ]
  }
]
```

## E. EVIDENCE FOR CYCLES

```json
[
  {
    "loop": "energywater",
    "by": "Vietnam Electricity, 2023",
    "title": "Ministry of Industry and Trade informs about power supply situation in hot season",
    "url": "https://en.evn.com.vn/d6/news/Ministry-of-Industry-and-Trade-informs-about-power-supply-situation-in-hot-season-66-163-3527.aspx",
    "type": "Agency report",
    "where": "Northern Viet Nam",
    "scale": "June 2023 operational account",
    "finding": "Supports the low-water to hydropower to electricity-shortage pathway during heat, not a complete feedback cycle.",
    "limit": "Operational account; no estimate of a return effect on water services."
  }
]
```

## F. AT-RISK FACTS

```json
[
  {
    "group": "coastal",
    "fact": "An Indian cyclone analysis covering 1980-2021 identified 19 of 96 cyclones followed by moist-heat extremes. The mean gap to the heat peak was about 5 days; heat was estimated from reanalysis.",
    "grade": "INFERRED",
    "sources": [
      "S1"
    ]
  },
  {
    "group": "people in polluted areas",
    "fact": "A Thai study published in 2025 covered 34 provinces and found stronger pollution-mortality associations above the province-specific 99th temperature percentile.",
    "grade": "UNCERTAIN",
    "sources": [
      "S4"
    ]
  },
  {
    "group": "women",
    "fact": "UNICEF's 27 April 2024 Mekong Delta report estimated 73,900 households affected by water shortage and identified women and girls as carrying disproportionate collection burdens. It did not measure a heat-specific effect.",
    "grade": "KNOWN",
    "sources": [
      "S7"
    ]
  },
  {
    "group": "farmers",
    "fact": "On 25 April 2024, the UN reported drought in 41 Philippine provinces during an episode of high temperatures and dry conditions. Its harvest-loss statement was a forecast, not a measured final loss.",
    "grade": "KNOWN",
    "sources": [
      "S6"
    ]
  },
  {
    "group": "Indigenous and remote communities",
    "fact": "In an October 2024 UNDP account, a Raglai household in Ninh Thuan reported improved livestock water access after a pond was built in July 2023. Pump affordability still limited other crop plans.",
    "grade": "UNCERTAIN",
    "sources": [
      "S15"
    ]
  }
]
```

## G. OPEN QUESTIONS

```json
[
  {
    "id": "outagerecovery",
    "loop": "energywater",
    "q": "How much extra heat exposure follows a power cut during a hot, low-water period?",
    "have": "Utility records document supply constraints, while cyclone research identifies a short recovery window before humid heat.",
    "could": "Link outage logs with indoor sensors and daily household symptoms, comparing similar areas with different restoration times.",
    "scale": "Illustrative: 300 households across 12 neighbourhoods for one hot season."
  },
  {
    "id": "jointalerts",
    "loop": "",
    "q": "Does a joint heat-air-quality alert reduce exposure more than separate alerts?",
    "have": "Thai mortality associations support concern, while regional correlations show that hazards do not always peak together.",
    "could": "Randomise alert formats across communities and measure comprehension, behaviour and personal exposure.",
    "scale": "Illustrative: 24 communities and 600 participants over one hot season."
  },
  {
    "id": "shelterrecovery",
    "loop": "school",
    "q": "Do facilities designed for several hazards reduce combined heat and storm disruption?",
    "have": "Cox's Bazar has a documented replacement centre, without a comparative thermal or learning evaluation.",
    "could": "Compare indoor heat, downtime and attendance in upgraded and matched facilities through a hot season and a storm season.",
    "scale": "Illustrative: 20 learning centres over one year."
  },
  {
    "id": "outbreakcooling",
    "loop": "clinic",
    "q": "Can staff cooling reduce physiological heat strain while maintaining infection protection?",
    "have": "Regional workers reported thermal symptoms, and a small uncontrolled test improved comfort.",
    "could": "Run a crossover trial under approved infection-control procedures, measuring physiological strain, symptoms and task performance.",
    "scale": "Illustrative: 80 healthcare workers across four facilities."
  },
  {
    "id": "successiveshocks",
    "loop": "poverty",
    "q": "Do heat and later flood losses leave the same households less able to recover than either event alone?",
    "have": "Pakistan's 2022 assessment records successive food-system pressures, without identifying a household interaction effect.",
    "could": "Follow exposed households and matched single-event households, recording harvests, food access and recovery spending.",
    "scale": "Illustrative: 400 households across two agricultural seasons."
  }
]
```

## H. SOURCES

```json
[
  {
    "key": "S1",
    "url": "https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2022EF002992",
    "title": "Observational Evidence of Increasing Compound Tropical Cyclone-Moist Heat Extremes in India",
    "by": "Rajeev et al.",
    "year": 2022,
    "type": "Peer-reviewed study",
    "where": "India and the North Indian Ocean",
    "scale": "96 cyclones; 1980-2021",
    "finding": "Identified 19 cyclones followed by moist-heat extremes; the mean gap to peak heat was about 5 days.",
    "limit": "Heat was estimated from ERA5 using an environmental stress index, spatial averaging and a 30-day event window. This was not an observed health or outage study.",
    "expect": [
      "Observational Evidence",
      "ERA5",
      "environmental stress index"
    ]
  },
  {
    "key": "S2",
    "url": "https://en.evn.com.vn/d6/news/Ministry-of-Industry-and-Trade-informs-about-power-supply-situation-in-hot-season-66-163-3527.aspx",
    "title": "Ministry of Industry and Trade informs about power supply situation in hot season",
    "by": "Vietnam Electricity",
    "year": 2023,
    "type": "Agency report",
    "where": "Northern Viet Nam",
    "scale": "Operational account dated 7 June 2023",
    "finding": "Heat raised electricity demand while low reservoir levels constrained hydropower. On 6 June, available hydropower capacity was 3,110MW, or 23.7% of installed capacity.",
    "limit": "First-party operational account, not an independent attribution study. Thermal-plant problems and transmission constraints also contributed.",
    "expect": [
      "3,110MW",
      "23.7%",
      "June 6, 2023"
    ]
  },
  {
    "key": "S3",
    "url": "https://en.evn.com.vn/d6/news/Operational-situation-in-April-2024-andobjectives-and-tasks-inMay-2024-66-142-4106.aspx",
    "title": "Operational situation in April 2024 and objectives and tasks in May 2024",
    "by": "Vietnam Electricity",
    "year": 2024,
    "type": "Agency report",
    "where": "Viet Nam",
    "scale": "April 2024 national operational update; published 8 May 2024",
    "finding": "Reported continuous electricity supply despite widespread intense heat and record demand. Operations combined thermal generation, transmission and hydropower scheduling.",
    "limit": "Utility self-report without a counterfactual evaluation. It does not identify the contribution of each measure or household-level reliability.",
    "expect": [
      "27 April 2024",
      "993 million kWh",
      "continuous power supply"
    ]
  },
  {
    "key": "S4",
    "url": "https://link.springer.com/article/10.1007/s00484-025-02913-8",
    "title": "Combined effects of ambient air pollution and temperature on mortality in Thailand",
    "by": "Phosri et al.",
    "year": 2025,
    "type": "Peer-reviewed study",
    "where": "Thailand",
    "scale": "34 provinces",
    "finding": "Pollution-mortality associations were greater on days above the province-specific 99th temperature percentile than on moderate-temperature days.",
    "limit": "Abstract read; full text was paywalled. Sensitivity results varied for NO2. Green-density findings were observational, not an intervention trial.",
    "expect": [
      "34 provinces",
      "green density",
      "99th"
    ]
  },
  {
    "key": "S5",
    "url": "https://www.adb.org/sites/default/files/publication/1116426/ewp-835-heat-stress-air-pollution-risk.pdf",
    "title": "Heat Stress, Air Pollution Risk and Population Exposure: Evidence from Selected Asian Countries",
    "by": "Mahmud et al.",
    "year": 2026,
    "type": "Working paper",
    "where": "Bangladesh, Indonesia, Pakistan, Thailand and Viet Nam",
    "scale": "Heat and pollution comparisons for 2000 and 2020; demographic analysis uses available census years",
    "finding": "The direction of heat-pollution correlation differed across countries and temperature measures. Some relationships were negative.",
    "limit": "The paper does not undertake causal decomposition. Census years differ, some population information is old, and spatial aggregation introduces measurement error.",
    "expect": [
      "negative correlation",
      "2000 and 2020",
      "causal decomposition"
    ]
  },
  {
    "key": "S6",
    "url": "https://philippines.un.org/en/267032-un-calls-increased-support-climate-resilience-philippines-drought-wreaks-havoc",
    "title": "The UN calls for increased support for climate resilience in the Philippines as drought wreaks havoc",
    "by": "United Nations in the Philippines",
    "year": 2024,
    "type": "Agency report",
    "where": "Philippines",
    "scale": "National situation and programme update; 25 April 2024",
    "finding": "Reported high temperatures and dry conditions, with 41 provinces experiencing drought. FAO and partners had activated anticipatory action in Isabela and Bangsamoro.",
    "limit": "First-party programme account, not an impact evaluation. Forecast harvest effects were not measured final losses.",
    "expect": [
      "25 April 2024",
      "41 provinces",
      "Anticipatory Action"
    ]
  },
  {
    "key": "S7",
    "url": "https://www.unicef.org/media/156076/file/Viet_Nam_Humanitarian_Situation_Report_No._01_%28drought%29_reporting_period__-27_April_2024.pdf",
    "title": "UNICEF Viet Nam Humanitarian Situation Report No. 1",
    "by": "UNICEF",
    "year": 2024,
    "type": "Agency report",
    "where": "Mekong Delta, Viet Nam",
    "scale": "Situation report dated 27 April 2024",
    "finding": "Drought, depleted sources and saltwater intrusion constrained usable water supplies.",
    "limit": "Evolving agency estimates, without household follow-up or measurement of heat exposure and attributable illness.",
    "expect": [
      "73,900 households",
      "saltwater intrusion",
      "27 April, 2024"
    ]
  },
  {
    "key": "S8",
    "url": "https://www.ghhin.org/assets/technical-brief-COVID-and-Heat-finalv2.pdf",
    "title": "Protecting Health from Hot Weather during the COVID-19 Pandemic",
    "by": "Global Heat Health Information Network",
    "year": 2020,
    "type": "Agency report",
    "where": "Global guidance",
    "scale": "Technical brief updated 27 May 2020",
    "finding": "Explained how infection-control measures, hot homes and PPE can complicate heat protection.",
    "limit": "Historical guidance, not a regional outcome evaluation or a substitute for current infection-control protocols.",
    "expect": [
      "Updated 27 May 2020",
      "cooling centers",
      "personal protective"
    ]
  },
  {
    "key": "S9",
    "url": "https://heathealth.info/wp-content/uploads/Lee-et-al.-2020-Heat-Stress-and-Thermal-Perception-amongst-Healthcare-Workers-during-the-COVID-19-Pandemic-in-India-and-Singapore.pdf",
    "title": "Heat Stress and Thermal Perception amongst Healthcare Workers during the COVID-19 Pandemic in India and Singapore",
    "by": "Lee et al.",
    "year": 2020,
    "type": "Peer-reviewed study",
    "where": "Southern India and Singapore",
    "scale": "165 healthcare workers surveyed in May-June 2020; 37 before-and-after cooling observations in Singapore",
    "finding": "Workers reported thermal symptoms while using PPE. Ice slurry improved reported comfort in the small Singapore test.",
    "limit": "Non-random sampling, self-reported symptoms and no comparison group without PPE. Comfort changes did not establish prevention of illness or improved patient outcomes.",
    "expect": [
      "3 November 2020",
      "May and June 2020",
      "ice slurry"
    ]
  },
  {
    "key": "S10",
    "url": "https://www.unicef.org/bangladesh/en/stories/rebuilding-education-climate-and-disaster-resilience-coxs-bazar",
    "title": "Rebuilding Education for Climate and Disaster Resilience in Cox’s Bazar",
    "by": "UNICEF Bangladesh",
    "year": 2025,
    "type": "Agency report",
    "where": "Cox's Bazar, Bangladesh",
    "scale": "Programme account published 3 April 2025",
    "finding": "Reported disaster damage to 434 learning facilities in 2024 and separate heat closures. A replacement centre completed in February 2025 included fans and solar backup.",
    "limit": "First-party account without comparative thermal, attendance or learning evaluation. Repeated disruption was not tracked for each child.",
    "expect": [
      "03 April 2025",
      "434 UNICEF learning facilities",
      "February 2025"
    ]
  },
  {
    "key": "S11",
    "url": "https://www.worldweatherattribution.org/climate-change-likely-increased-extreme-monsoon-rainfall-flooding-highly-vulnerable-communities-in-pakistan/",
    "title": "Climate change likely increased extreme monsoon rainfall, flooding highly vulnerable communities in Pakistan",
    "by": "World Weather Attribution",
    "year": 2022,
    "type": "Agency report",
    "where": "Pakistan",
    "scale": "2022 Indus basin rainfall attribution; 60-day and 5-day event definitions",
    "finding": "Identified extreme monsoon rainfall as the direct cause of flooding. Its impact assessment described flood crop losses adding to food pressures after regional summer heat.",
    "limit": "High rainfall variability and disagreement between modelled and observed changes prevented a precise overall attribution. Household joint losses were not estimated.",
    "expect": [
      "14 September, 2022",
      "60-day",
      "5-day"
    ]
  },
  {
    "key": "S12",
    "url": "https://digitalcommons.chapman.edu/sees_articles/608/",
    "title": "Causes and Effects of Shisper Glacial Lake Outburst Flood Event in Karakoram in 2022",
    "by": "Mondal et al.",
    "year": 2023,
    "type": "Peer-reviewed study",
    "where": "Shisper Glacier, Pakistan",
    "scale": "Satellite analysis of the 7 May 2022 lake breach",
    "finding": "Linked increased surface temperature and changing snow and glacier conditions with possible enhanced melting before the breach.",
    "limit": "Institutional abstract read; full text was inaccessible. Satellite land-surface temperature is not air temperature, and the abstract uses conditional causal language.",
    "expect": [
      "7 May 2022",
      "land surface temperature",
      "satellite remote sensing"
    ]
  },
  {
    "key": "S13",
    "url": "https://www.cambridge.org/core/journals/journal-of-glaciology/article/multiple-phases-of-icedammed-lake-formation-and-drainage-associated-with-a-surge-of-shisper-glacier-western-karakoram/EC032F0636796DB506AD584FA7E3961A",
    "title": "Multiple phases of ice-dammed lake formation and drainage associated with a surge of Shisper Glacier, western Karakoram",
    "by": "Lovell et al.",
    "year": 2024,
    "type": "Peer-reviewed study",
    "where": "Shisper Glacier, Pakistan",
    "scale": "Satellite analysis from November 2018 to September 2024",
    "finding": "Documented repeated lake formation and drainage after a glacier surge, including the 7 May 2022 flood that removed the Hassanabad bridge.",
    "limit": "Drainage mechanisms were partly inferred. The paper reports substantial differences between lake-volume estimation methods; satellite drainage dates are not always exact flood times.",
    "expect": [
      "25 October 2024",
      "subglacial conduit",
      "7 May 2022"
    ]
  },
  {
    "key": "S14",
    "url": "https://alliancebioversityciat.org/publications-data/heightened-fire-probability-indonesia-non-drought-conditions-effect-increasing-0",
    "title": "Heightened fire probability in Indonesia in non-drought conditions: the effect of increasing temperatures",
    "by": "Fernandes et al.",
    "year": 2017,
    "type": "Peer-reviewed study",
    "where": "Indonesia",
    "scale": "July-October temperature, drought and fire analysis; abstract reviewed",
    "finding": "Reported temperature-sensitive fire probability even in normal-to-wet conditions. It also described pollution from the 1997 and 2015 drought-associated fires.",
    "limit": "Full text was inaccessible, so detailed methods and author limitations were not checked. Future fire statements are projections.",
    "expect": [
      "published in 2017",
      "normal-to-wet conditions",
      "1997 and 2015"
    ]
  },
  {
    "key": "S15",
    "url": "https://www.undp.org/vietnam/stories/when-water-returned-hope-grew-family-viet-nam",
    "title": "When Water Returned, Hope Grew for a Family in Viet Nam",
    "by": "UNDP",
    "year": 2024,
    "type": "Agency report",
    "where": "Ninh Thuan, Viet Nam",
    "scale": "One household case; pond constructed in July 2023",
    "finding": "A family reported improved water access for livestock and crops after pond construction in a hot, drought-prone setting. Pump affordability remained a constraint.",
    "limit": "Implementer-reported household account without a comparison group, measured yield effect or demonstrated heat-health benefit.",
    "expect": [
      "October 8, 2024",
      "July last year (2023)",
      "lack of money to buy pumps"
    ]
  }
]
```

## I. WHAT I COULD NOT VERIFY

- Interaction versus overlap: simultaneous or successive hazards do not automatically produce effects greater than their separate effects. No regional mortality multiplier was calculated.

- Pakistan's 2022 sequence: the rainfall assessment identifies monsoon rainfall as the direct flood cause. It does not establish a spring-heat-to-monsoon-flood link. [S11]

- Heat and pollution: a universal co-peak rule was rejected. ADB's country and metric differences support local analysis; exposure correlation is not a health interaction estimate. [S5]

- Power outages: heat does not invariably produce outages. EVN reported continuous supply during April 2024 heat; this is a utility account, not an independent evaluation of individual measures. [S3]

- Mekong Delta: the UNICEF report documents drought and salinity, without heat measurements. Its counts were retained as water-component evidence, not heat-attributable cases. [S7]

- Partial access: the Thai mortality paper, Indonesian fire paper and 2023 Shisper study were reviewed through accessible abstracts. Their unavailable detailed methods were not inferred. [S4,S12,S14]

- Additional leads: the 2025 eastern India humid-heat/cyclone paper encountered a publisher access barrier. The World Bank's August 2023 Viet Nam report exceeded the reading tool's file-size limit, and its repository was inaccessible. No outage-cost estimate was imported.

- Outbreak guidance: the 2020 GHHIN brief was used for historical interaction pathways. Its detailed infection-control advice was not carried forward as current operational guidance. [S8]

- Protection outcomes: the cooling test measured comfort. The learning-centre and pond accounts were not controlled impact evaluations, and no harmful side effects were established. Empty unintended fields mean none documented in these sources, not proof of none. [S9,S10,S15]

- Conflict and coverage: no sufficiently verified regional heat-conflict interaction was established in this run. This is not an assertion that such evidence or risks are absent.

- Cycle closure: the supplied map lists cycle names but not their edge sequences. Links assigned to cycles are partial contributions; none is presented as closing a verified vicious cycle.

