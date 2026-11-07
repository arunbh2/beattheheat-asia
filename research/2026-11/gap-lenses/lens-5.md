# A. SUMMARY

**Run 4 - Lens 5: Return links and cycles. Evidence checked to 5 November 2026.**

- Run 4 follows lens 5, return links and cycles. The strongest regional additions concern soil, groundwater and cooling feedbacks. These are mainly diagnostics and models, not measured complete social cycles. [S1, S2, S6, S7]
- The current registry labels soil established and energy poverty emerging. This run strengthens conditional regional evidence without proposing a change to either label.
- The largest gap is the household return: heat-related losses or health costs, followed by debt and reduced cooling access. The reviewed cooling study does not track that sequence. [S5]
- Two broad claims did not pass: that irrigation always reduces worker heat exposure, and that sleep loss always increases next-day physiological heat strain. Metric and experimental conditions matter. [S3, S10, S11]
- Forest cooling loss merits a conditional return link, with a clear distinction between clearing and heat-driven dieback. Evidence remains concentrated in India, with one Indonesian experiment; other countries and untested map nodes remain open. [S8]

Baseline: [current loop registry](https://github.com/arunbh2/beattheheat-asia/blob/2426367458a858372a5aa23625e96c8169869f50/data/core/LOOPS.json). The registry is used only to identify existing map content, not as scientific evidence. No map changes have been applied.

# B. NEW OR UPDATED HARMS

Grades describe each proposed wording. INFERRED includes model results and conditional mechanisms. UNCERTAIN marks single-setting findings or an unverified return.

```json
[
  {
    "id": "localheat",
    "sys": "nature",
    "status": "new",
    "label": "Local heat amplification",
    "desc": "Local conditions can amplify exposure. This graph node distinguishes air warming from humid-heat indices.",
    "grade": "INFERRED",
    "who": "People exposed to locally amplified heat",
    "sources": [
      "S6"
    ],
    "debated": "Graph clarification; the heat metrics differ."
  },
  {
    "id": "drysoil",
    "sys": "nature",
    "status": "update",
    "label": "Dry soils reinforce heat",
    "desc": "Dry soil can increase sensible heating. In India's 2015 heatwave, this contribution differed between the two peaks.",
    "grade": "INFERRED",
    "who": "People in dry agricultural landscapes",
    "sources": [
      "S1"
    ],
    "debated": "The size of the return depends on moisture, circulation and the phase of the event."
  },
  {
    "id": "forest",
    "sys": "nature",
    "status": "update",
    "label": "Forest cooling loss",
    "desc": "Forest loss can increase worker heat exposure. The Indonesian experiment used clearing, so it does not establish a return from heat-driven forest dieback.",
    "grade": "UNCERTAIN",
    "who": "Rural workers near changing forest cover",
    "sources": [
      "S8"
    ],
    "debated": "A candidate return from the existing dieback harm, conditional on comparable canopy loss."
  },
  {
    "id": "groundwater",
    "sys": "water",
    "status": "update",
    "label": "Groundwater buffers weaken",
    "desc": "Warming can increase irrigation withdrawals and accelerate depletion. This can reduce the water buffer available for later hot periods.",
    "grade": "INFERRED",
    "who": "Farmers dependent on groundwater",
    "sources": [
      "S7"
    ],
    "debated": "The future loss of protection is an inference from depletion, not a measured complete household cycle."
  },
  {
    "id": "irrigation",
    "sys": "water",
    "status": "update",
    "label": "Irrigation changes humid heat",
    "desc": "Meeting irrigation demand can cool dry air while increasing humidity and moist heat stress. Lower air temperature alone does not establish lower worker exposure.",
    "grade": "INFERRED",
    "who": "Farmworkers in irrigated landscapes",
    "sources": [
      "S3"
    ],
    "debated": "The direction depends on the heat metric, irrigation method and local weather."
  },
  {
    "id": "energypoverty",
    "sys": "energy",
    "status": "update",
    "label": "Cooling remains constrained",
    "desc": "Limited electricity response during heat can reflect limited cooling options. Income and humidity also shape which cooling technologies offer protection.",
    "grade": "INFERRED",
    "who": "Low-income households without effective cooling",
    "sources": [
      "S4",
      "S5"
    ],
    "debated": "These studies do not follow heat illness, debt and later cooling access through a complete cycle."
  },
  {
    "id": "demand",
    "sys": "energy",
    "status": "update",
    "label": "Cooling adds local heat",
    "desc": "Air-conditioning waste heat can reinforce local warming and cooling demand in simulations.",
    "grade": "INFERRED",
    "who": "Residents and people working near condensers",
    "sources": [
      "S6"
    ],
    "debated": "Placement matters; this is not a claim about all electricity demand."
  },
  {
    "id": "sleepless",
    "sys": "health",
    "status": "update",
    "label": "Heat disrupts sleep",
    "desc": "Heat-related sleep disruption is documented. A universal return from sleep loss to higher physiological heat strain is not established by the small laboratory studies reviewed here.",
    "grade": "UNCERTAIN",
    "who": "Heat-exposed workers and people without cool nights",
    "sources": [
      "S9",
      "S10",
      "S11"
    ],
    "debated": "The uncertain grade concerns the proposed physiological return, not the existence of heat-related sleep disruption."
  }
]
```

# C. LINKS

A loop name identifies the related cycle, not proof of the complete cycle. The soil closure makes an existing physical return explicit; the cooling closure is modelled. No new complete cycle is declared. Lags are proposed process timescales, not study-estimated effects.

```json
[
  {
    "from": "localheat",
    "to": "drysoil",
    "why": "Soil-loop representation: hotter conditions can increase evaporative demand and drying where water remains available.",
    "loop": "soil",
    "grade": "INFERRED",
    "moderators": "Rainfall, vegetation, water availability and irrigation; this is a process inference from the modelled land-water system.",
    "lag": "days",
    "sources": [
      "S2"
    ]
  },
  {
    "from": "drysoil",
    "to": "localheat",
    "why": "Closes the explicit representation of the existing soil loop: reduced evaporation can redirect surface energy into sensible heating.",
    "loop": "soil",
    "grade": "INFERRED",
    "moderators": "Event phase, soil moisture and atmospheric circulation; do not add this as a second soil cycle.",
    "lag": "days",
    "sources": [
      "S1"
    ]
  },
  {
    "from": "forest",
    "to": "localheat",
    "why": "Candidate return: comparable canopy loss could remove cooling; the regional experiment tested clearing, not heat-driven dieback.",
    "loop": "",
    "grade": "UNCERTAIN",
    "moderators": "Canopy loss, shade, landscape structure and the difference between clearing and dieback.",
    "lag": "years",
    "sources": [
      "S8"
    ]
  },
  {
    "from": "localheat",
    "to": "productivity",
    "why": "Workers assigned to the hotter deforested setting produced less during the experimental work session.",
    "loop": "",
    "grade": "UNCERTAIN",
    "moderators": "Task, shade and work setting; the experiment changed the landscape setting rather than temperature alone.",
    "lag": "days",
    "sources": [
      "S8"
    ]
  },
  {
    "from": "lost",
    "to": "energypoverty",
    "why": "Candidate return: if heat-related earnings losses reduce disposable income, cooling purchases may become harder; this sequence was not directly measured.",
    "loop": "energypoverty",
    "grade": "INFERRED",
    "moderators": "Savings, transfers, tariffs and existing appliances; no complete cycle closure is claimed.",
    "lag": "seasons",
    "sources": [
      "S5"
    ]
  },
  {
    "from": "demand",
    "to": "uhi",
    "why": "Existing-edge update: operating condensers heat nearby outdoor air in the model.",
    "loop": "cooling",
    "grade": "INFERRED",
    "moderators": "Condenser placement and street geometry.",
    "lag": "days",
    "sources": [
      "S6"
    ]
  },
  {
    "from": "uhi",
    "to": "demand",
    "why": "Closes the modelled existing cooling loop: warmer outdoor air increases building cooling demand.",
    "loop": "cooling",
    "grade": "INFERRED",
    "moderators": "Modelled blocks, not measured citywide closure.",
    "lag": "days",
    "sources": [
      "S6"
    ]
  },
  {
    "from": "localheat",
    "to": "irrigation",
    "why": "Additional warming can increase crop water stress and irrigation withdrawals.",
    "loop": "pumping",
    "grade": "INFERRED",
    "moderators": "Rainfall, crops, access to water and farmers' responses; this is partial pumping-cycle evidence.",
    "lag": "seasons",
    "sources": [
      "S7"
    ]
  },
  {
    "from": "irrigation",
    "to": "groundwater",
    "why": "Existing-edge evidence update: meeting additional irrigation demand through groundwater withdrawals can accelerate depletion.",
    "loop": "pumping",
    "grade": "INFERRED",
    "moderators": "Water source, recharge and withdrawal behaviour.",
    "lag": "years",
    "sources": [
      "S7"
    ]
  },
  {
    "from": "groundwater",
    "to": "scarcity",
    "why": "Existing-edge refinement: depletion can weaken the groundwater buffer available for later water demand.",
    "loop": "pumping",
    "grade": "INFERRED",
    "moderators": "Recharge, storage, alternative supplies and accessible well depths; no complete cycle is demonstrated.",
    "lag": "years",
    "sources": [
      "S7"
    ]
  },
  {
    "from": "irrigation",
    "to": "farmwork",
    "why": "Meeting demand through irrigation can increase moist heat exposure even when the modelled dry air cools.",
    "loop": "",
    "grade": "INFERRED",
    "moderators": "Humidity, boundary-layer conditions and irrigation practice; worker illness was not measured.",
    "lag": "days",
    "sources": [
      "S3"
    ]
  }
]
```

# D. LEVERS

The irrigation example is a simulation. The lighting example is an observed rollout analysed in a working paper.

```json
[
  {
    "id": "irrigate",
    "edge": [
      "irrigation",
      "groundwater"
    ],
    "title": "Test irrigation with both heat metrics",
    "who": [
      "Agricultural research institutes",
      "Water agencies",
      "Farmer organisations"
    ],
    "when": "years",
    "measure": "Compare withdrawals, yields, dry-bulb temperature and moist heat across matched fields.",
    "text": "A regional model suggests drip irrigation can save water and reduce moist heat. Field checks can test whether those benefits persist under actual irrigation decisions.",
    "example": "Indo-Gangetic Plain, 2022 study: channel and drip irrigation were compared in simulations, not an implemented field programme.",
    "unintended": "The drip simulation produced approximately 0.2°C dry-bulb warming. Constant water demand limits conclusions about real withdrawal behaviour.",
    "sources": [
      "S2"
    ]
  },
  {
    "id": "cleancool",
    "edge": [
      "localheat",
      "productivity"
    ],
    "title": "Remove avoidable workplace heat",
    "who": [
      "Factory operators",
      "Worker organisations",
      "Energy-service providers"
    ],
    "when": "years",
    "measure": "Track indoor heat, lighting quality, electricity use, output and worker pay separately.",
    "text": "Efficient lighting can reduce internal heat loads while saving electricity. The factory evidence supports testing production benefits alongside worker outcomes.",
    "example": "Bangalore area, October 2009-February 2013: a garment firm introduced LEDs in 26 factories; the 2017 working paper analysed the rollout.",
    "unintended": "No adverse outcome was established in the reviewed analysis. Bulb performance was setting-specific, and indoor cooling during rollout was estimated rather than directly monitored.",
    "sources": [
      "S12"
    ]
  }
]
```

# E. EVIDENCE FOR CYCLES

The cooling-access working paper is classified here as a modelling study because this section has no working-paper category. Its status remains explicit in H.

```json
[
  {
    "loop": "soil",
    "by": "Ghatak et al., 2017",
    "title": "The Role of Local Heating in the 2015 Indian Heat Wave",
    "url": "https://ntrs.nasa.gov/citations/20180003614",
    "type": "Peer-reviewed study",
    "where": "North and central India",
    "scale": "Two peaks of the 2015 Indian heatwave",
    "finding": "Local soil-moisture depletion and sensible heating contributed to the second peak, with a different contribution during the first.",
    "limit": "Institutional abstract only. Supports a conditional regional mechanism, not a newly discovered cycle or a uniform event contribution."
  },
  {
    "loop": "energypoverty",
    "by": "Pavanello et al., 2025",
    "title": "Adaptation Technology Choice and Implications for Heat-Related Health Risk",
    "url": "https://www.ifo.de/DocDL/cesifo1_wp12365.pdf",
    "type": "Modelling study",
    "where": "India",
    "scale": "India household ownership and district mortality, 2014-2019",
    "finding": "Income and humidity shaped estimated cooling access and protection.",
    "limit": "Working-paper estimates; ownership differs from use. Household debt and complete cycle closure were not tested."
  }
]
```

# F. AT-RISK FACTS

```json
[
  {
    "group": "informal and outdoor workers",
    "fact": "In the 2021 Indonesian study, 361 workers undertook 90-minute sessions. WBGT averaged 2.84°C higher in deforested settings; WBGT is not air temperature.",
    "grade": "UNCERTAIN",
    "sources": [
      "S8"
    ]
  },
  {
    "group": "low-income households",
    "fact": "The 2020 Delhi study found limited incremental electricity response among low-income consumers, especially in informal settlements. The authors interpreted limited cooling options as a likely explanation.",
    "grade": "INFERRED",
    "sources": [
      "S4"
    ]
  },
  {
    "group": "people near air-conditioner condensers",
    "fact": "In the 2026 Rajkot model of 16 hypothetical buildings, facade-mounted condensers could increase pedestrian-level air temperature by more than 1°C.",
    "grade": "INFERRED",
    "sources": [
      "S6"
    ]
  },
  {
    "group": "heat-exposed workers",
    "fact": "The 2026 systematic review included 11 studies of heat and sleep. Its mixed settings and measures do not support one pooled regional prevalence estimate.",
    "grade": "KNOWN",
    "sources": [
      "S9"
    ]
  }
]
```

# G. OPEN QUESTIONS

All sample sizes below are illustrative design scopes, not power calculations.

```json
[
  {
    "id": "soilreturn",
    "loop": "soil",
    "q": "Does retaining soil moisture reduce afternoon air heat without increasing worker humid-heat exposure?",
    "have": "Indian heatwave diagnostics support local amplification; irrigation modelling shows heat-metric trade-offs.",
    "could": "Compare matched soil-moisture treatments with air temperature, WBGT, soil water and weather measurements.",
    "scale": "Illustrative design: 20-30 paired fields across two hot seasons; power assessment follows pilot variance."
  },
  {
    "id": "coolingdebt",
    "loop": "energypoverty",
    "q": "Do heat-related earnings or health costs reduce cooling access in the following season?",
    "have": "Income, appliance ownership and estimated protection are linked; the intervening household sequence is unmeasured here.",
    "could": "Follow households monthly, recording heat, earnings, illness costs, debt, electricity spending and actual cooling use.",
    "scale": "Illustrative design: 400-600 households over two hot seasons, with oversampling of households without effective cooling."
  },
  {
    "id": "wasteheat",
    "loop": "cooling",
    "q": "Does changing condenser placement reduce outdoor heat and subsequent electricity use in occupied neighbourhoods?",
    "have": "A Rajkot block model supports the feedback; field closure remains untested in this review.",
    "could": "Use paired buildings before and after condenser relocation, with outdoor sensors, indoor sensors and electricity meters.",
    "scale": "Illustrative design: 12-20 buildings across one hot season, with occupancy and weather adjustment."
  },
  {
    "id": "sleepreturn",
    "loop": "sleep",
    "q": "Does a hotter, shorter night increase next-day heat strain during ordinary work, beyond daytime heat and hydration?",
    "have": "The existing sleep cycle concerns mental health. This tests a separate heat-strain extension, for which small laboratory tests report null overall effects.",
    "could": "Use repeated worker measurements of bedroom heat, sleep, next-day exposure and physiological strain without inducing deprivation.",
    "scale": "Illustrative design: 100-150 workers monitored over four to six weeks; illness detection may need a larger cohort."
  },
  {
    "id": "forestreturn",
    "loop": "",
    "q": "Does heat-driven canopy loss produce a worker-heat penalty comparable to clearing?",
    "have": "The Indonesian experiment compared forested and cleared settings, not heat-driven dieback.",
    "could": "Compare matched work sites with documented canopy decline, stable canopy and similar tasks, using repeated exposure and output measurements.",
    "scale": "Illustrative design: 20-30 sites over two hot seasons; analyse landscape and task differences."
  }
]
```

# H. SOURCES

Nine of twelve sources concern South or Southeast Asian settings. Institutional abstracts support only the claims stated here; access depth is recorded in each limit. Titles and author fields identify the cited version. Where a full limitations section was unavailable, access limits and design constraints are reported without attributing them to the authors.

```json
[
  {
    "key": "S1",
    "url": "https://ntrs.nasa.gov/citations/20180003614",
    "title": "The Role of Local Heating in the 2015 Indian Heat Wave",
    "by": "Ghatak et al.",
    "year": 2017,
    "type": "Peer-reviewed study",
    "where": "North and central India",
    "scale": "Diagnostics of the late-May and early-June 2015 heatwave peaks",
    "finding": "Depleted soil moisture and enhanced sensible heating contributed to the second peak; the first peak lacked a significant sensible-heat anomaly.",
    "limit": "Institutional abstract only; full text unavailable. One event cannot establish every heatwave's contribution.",
    "expect": [
      "soil moisture",
      "early June",
      "2015"
    ]
  },
  {
    "key": "S2",
    "url": "https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2021EF002642",
    "title": "Improved Water Savings and Reduction in Moist Heat Stress Caused by Efficient Irrigation",
    "by": "Ambika et al.",
    "year": 2022,
    "type": "Modelling study",
    "where": "Indo-Gangetic Plain, India",
    "scale": "WRF irrigation simulations for 2000-2018",
    "finding": "Replacing channel irrigation with drip irrigation in the model saved water and reduced moist heat stress, alongside approximately 0.2°C dry-bulb warming.",
    "limit": "Constant irrigation water demand and model-specific evaporation assumptions. This was not a field trial of withdrawals, yields or farmer behaviour.",
    "expect": [
      "WRF",
      "drip",
      "constant irrigation water demand"
    ]
  },
  {
    "key": "S3",
    "url": "https://impact.ornl.gov/en/publications/moist-heat-stress-extremes-in-india-enhanced-by-irrigation/",
    "title": "Moist heat stress extremes in India enhanced by irrigation",
    "by": "Mishra et al.",
    "year": 2020,
    "type": "Modelling study",
    "where": "India",
    "scale": "In situ observations, satellite observations and meteorological modelling",
    "finding": "Irrigation cooled the land surface and air while increasing humidity and moist heat stress.",
    "limit": "Institutional abstract read; full paper unavailable. Modelled moist heat is not a measured change in worker illness.",
    "expect": [
      "planetary boundary layer",
      "moist heat stress",
      "irrigation"
    ]
  },
  {
    "key": "S4",
    "url": "https://cprindia.org/journalarticles/impact-of-temperature-on-electricity-demand-evidence-from-delhi-and-indian-states/",
    "title": "Impact of temperature on electricity demand: Evidence from Delhi and Indian states",
    "by": "Harish et al.",
    "year": 2020,
    "type": "Peer-reviewed study",
    "where": "Delhi and Indian states",
    "scale": "Delhi household electricity micro-data and aggregate Indian electricity demand",
    "finding": "Delhi aggregate demand increased by 30% or more above 30 °C, relative to 21–24 °C. Low-income households showed limited incremental response, interpreted tentatively as limited cooling options.",
    "limit": "Institutional abstract read; publisher text unavailable. The abstract does not report household sample size; demand does not measure comfort or illness.",
    "expect": [
      "May 1, 2020",
      "micro-data",
      "low-income consumers"
    ]
  },
  {
    "key": "S5",
    "url": "https://www.ifo.de/DocDL/cesifo1_wp12365.pdf",
    "title": "Adaptation Technology Choice and Implications for Heat-Related Health Risk",
    "by": "Pavanello et al.",
    "year": 2025,
    "type": "Working paper",
    "where": "India",
    "scale": "2014-2019 household appliance ownership, district mortality and weather data",
    "finding": "Income influenced cooling technology choice. Estimated mortality protection from evaporative coolers depended on humidity.",
    "limit": "December 2025 working-paper version. Ownership is not use; appliance-specific electricity use and fan ownership are unavailable. Annual district mortality cannot establish a household cooling-debt cycle.",
    "expect": [
      "December 2025",
      "ownership of fans",
      "appliance-specific electricity use"
    ]
  },
  {
    "key": "S6",
    "url": "https://www.nature.com/articles/s41598-026-62477-4",
    "title": "Quantifying the impact of air conditioner waste heat on neighbourhood scale microclimate and building energy demand in hypothetical urban blocks",
    "by": "Verma et al.",
    "year": 2026,
    "type": "Modelling study",
    "where": "Hypothetical blocks in Rajkot, India",
    "scale": "16 buildings; six air-conditioner placement scenarios",
    "finding": "Facade-mounted condensers could raise pedestrian-level street-canyon air temperature by more than 1°C, with additional building cooling demand.",
    "limit": "Abstract read; later access failed. Hypothetical blocks and uncoupled models do not establish field closure.",
    "expect": [
      "20 July 2026",
      "16 buildings",
      "hypothetical"
    ]
  },
  {
    "key": "S7",
    "url": "https://www.ars.usda.gov/research/publications/publication/?seqNo115=387051",
    "title": "Warming temperatures exacerbate groundwater depletion rates in India",
    "by": "Bhattarai et al.",
    "year": 2023,
    "type": "Peer-reviewed study",
    "where": "India",
    "scale": "Historical groundwater, climate and crop-water-stress data",
    "finding": "The technical abstract links warming, increased groundwater withdrawals and accelerated depletion.",
    "limit": "Institutional technical abstract read; final journal text unavailable. Its projection multiplier differs from the indexed journal abstract, so no projection multiplier is used here.",
    "expect": [
      "Technical Abstract",
      "groundwater withdrawals",
      "9/1/2023"
    ]
  },
  {
    "key": "S8",
    "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC7952402/",
    "title": "Warming from tropical deforestation reduces worker productivity in rural communities",
    "by": "Masuda et al.",
    "year": 2021,
    "type": "Peer-reviewed study",
    "where": "Berau, East Kalimantan, Indonesia",
    "scale": "361 workers randomly assigned to 90-minute forested or deforested work sessions",
    "finding": "WBGT averaged 2.84°C higher in deforested settings; measured output was lower.",
    "limit": "A short experiment in one area. Clearing differs from heat-driven dieback, and session output does not establish annual earnings or a complete forest-heat cycle.",
    "expect": [
      "361 workers",
      "90-min",
      "2.84"
    ]
  },
  {
    "key": "S9",
    "url": "https://www.aoemj.org/journal/view.php?doi=10.35371/aoem.2026.38.e3",
    "title": "Impacts of heat on sleep quality among heat-exposed workers: a systematic review",
    "by": "Raja et al.",
    "year": 2026,
    "type": "Systematic review",
    "where": "Global, including Indonesia and other Asian settings",
    "scale": "11 included studies",
    "finding": "Heat exposure was associated with poorer sleep quality and duration across the reviewed settings.",
    "limit": "Mostly cross-sectional evidence, varied exposure and sleep measures, and synthesis without meta-analysis. It does not establish the full sleep-mental-health cycle.",
    "expect": [
      "January 8, 2026",
      "11 studies",
      "Synthesis without Meta-Analysis"
    ]
  },
  {
    "key": "S10",
    "url": "https://link.springer.com/article/10.1007/s00421-013-2671-2",
    "title": "Three nights of sleep deprivation does not alter thermal strain during exercise in the heat",
    "by": "Moore et al.",
    "year": 2013,
    "type": "Peer-reviewed study",
    "where": "United Kingdom laboratory; evidence outside the target region",
    "scale": "Ten healthy individuals; controlled exercise after three nights of restricted or normal sleep",
    "finding": "No overall increase in physiological thermal strain was detected during the tested exercise protocol after sleep restriction.",
    "limit": "Publisher abstract read; full text access limited. Small, short laboratory study with controlled hydration and energy intake; not a test of prolonged humid outdoor work.",
    "expect": [
      "13 June 2013",
      "Ten healthy individuals",
      "hydration state"
    ]
  },
  {
    "key": "S11",
    "url": "https://cris.tau.ac.il/en/publications/heat-tolerance-after-total-and-partial-acute-sleep-deprivation/",
    "title": "Heat tolerance after total and partial acute sleep deprivation",
    "by": "Muginshtein-Simkovitch et al.",
    "year": 2015,
    "type": "Peer-reviewed study",
    "where": "Israel laboratory; evidence outside the target region",
    "scale": "Eleven participants under acute sleep-deprivation conditions",
    "finding": "No overall significant physiological difference was detected; subjective discomfort increased after total sleep deprivation.",
    "limit": "Institutional abstract read; full text unavailable. Small acute experiment with subgroup differences, not population heat-illness evidence.",
    "expect": [
      "Eleven participants",
      "subjective discomfort",
      "chronotype"
    ]
  },
  {
    "key": "S12",
    "url": "https://ceepr.mit.edu/wp-content/uploads/2021/09/2017-019.pdf",
    "title": "The Light and the Heat: Productivity Co-benefits of Energy-saving Technology",
    "by": "Adhvaryu et al.",
    "year": 2017,
    "type": "Working paper",
    "where": "Garment factories around Bangalore, India",
    "scale": "30 factories in one firm; 26 received LEDs; production data April 2010-June 2013",
    "finding": "Staggered LED adoption reduced the estimated adverse relationship between heat and production-line efficiency.",
    "limit": "Non-random adoption within one firm. Indoor temperature was not measured during rollout; cooling was estimated through engineering calculations and later temperature observations. Bulb comparisons are setting-specific.",
    "expect": [
      "October 9, 2017",
      "26 garment factories",
      "October 2009"
    ]
  }
]
```

# I. WHAT I COULD NOT VERIFY

- Scope of the audit: selected candidate returns were tested, rather than every harm outside a cycle. The supplied count of 54 unconnected harms is not treated as a refreshed count.
- Forest return: the Indonesian experiment tested cleared land. It does not verify that heat-driven forest dieback produces the same exposure change. No new forest cycle is declared.
- Household return: the reviewed evidence did not establish illness or earnings loss followed by debt and later loss of cooling. Energy poverty remains emerging.
- Sleep return: the small laboratory null results narrow the existing sleepless-to-heatstroke claim. They do not show that sleep is irrelevant, and do not test both directions of the separate sleepless-mental-health cycle.
- Groundwater projections: the USDA technical abstract and indexed journal abstract give different future depletion multipliers. Neither multiplier is reproduced; the qualitative mechanism is retained.
- Access limits: the soil study's full text and several publisher texts could not be read. Institutional abstracts are identified in H. The Rajkot abstract was read successfully once; later access failed.
- Irrigation: a modelled water saving is not a measured reduction in total withdrawals after farmers change practice. No universal net-saving claim or field health benefit is added.
- Other nodes: this run did not verify return links for marine harms, tourism or elections. This is a limit of the reviewed evidence, not evidence that such links do not exist.

