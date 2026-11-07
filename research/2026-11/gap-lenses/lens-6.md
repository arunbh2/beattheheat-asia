## A. SUMMARY

**Run 6 - Lens 6: What helps and what backfires. Evidence checked to 5 November 2026.**

- The central addition is a condition on each lever: what was measured, in which setting, and what remained untested. A physical cooling effect is not automatically a health, learning or income benefit.
- An Indian pilot documents pay-per-use food cooling; independently evaluated income benefits remain unverified. [S3]
- Nature and workplace evidence support protecting cooling services at source. The Indonesian forest experiment and Indian lighting rollout test different mechanisms and outcomes. [S4, S6]
- Two blanket claims were rejected: universal benefit from fans and established mortality reduction from cooling centres. The evidence supports narrower wording. [S1, S2]
- Education results, several thin levers and effects on tenants remain unresolved in this run. The Kerala roof-result paper could not be opened, so its reported learning gains are excluded.

Baseline: Common Shade repository snapshot at commit 2426367458a858372a5aa23625e96c8169869f50 (link to the repository removed in November 2026; the commit is named so the baseline can still be found). This is a content baseline, not scientific evidence. No website or repository changes have been applied.

## B. NEW OR UPDATED HARMS

Updates replace or qualify wording; they do not create duplicate harms. INFERRED includes models and conditional mechanisms. UNCERTAIN includes single-setting findings. KNOWN does not establish causality or transfer to other settings.

```json
[
  {
    "id": "homes",
    "sys": "cities",
    "status": "update",
    "label": "Indoor cooling needs conditions",
    "desc": "Cooling suitability depends on climate and users. Short fan trials do not establish overnight protection.",
    "grade": "UNCERTAIN",
    "who": "Older people relying on fans",
    "sources": [
      "S1"
    ],
    "debated": "Chamber evidence, not a home trial."
  },
  {
    "id": "adaptationstrain",
    "sys": "health",
    "status": "new",
    "label": "Cooling can add strain",
    "desc": "Fans increased body temperature under tested very hot-dry conditions; heatstroke was not measured.",
    "grade": "UNCERTAIN",
    "who": "Older adults under the tested conditions",
    "sources": [
      "S1"
    ],
    "debated": "No universal threshold."
  },
  {
    "id": "spoilage",
    "sys": "food",
    "status": "update",
    "label": "Cooling needs continuous service",
    "desc": "Food protection depends on temperature control across the chain. Equipment alone does not establish a reduction in losses.",
    "grade": "KNOWN",
    "who": "Small producers, traders and food consumers",
    "sources": [
      "S3"
    ],
    "debated": "Service and income claims from project cases need separate evaluation."
  },
  {
    "id": "emissions",
    "sys": "energy",
    "status": "update",
    "label": "Refrigeration has climate costs",
    "desc": "Refrigeration can add emissions through energy use and refrigerant releases. These costs sit alongside avoided food losses.",
    "grade": "KNOWN",
    "who": "Cold-chain operators and communities",
    "sources": [
      "S3"
    ],
    "debated": "Net effects depend on the system and the avoided losses."
  },
  {
    "id": "forest",
    "sys": "nature",
    "status": "update",
    "label": "Canopy loss removes cooling",
    "desc": "The Indonesian comparison supports retaining cooling in working landscapes. It does not evaluate a forest-conservation programme.",
    "grade": "UNCERTAIN",
    "who": "Rural workers",
    "sources": [
      "S6"
    ],
    "debated": "This refines the earlier forest proposal; it is not another harm to add."
  },
  {
    "id": "productivity",
    "sys": "work",
    "status": "update",
    "label": "Lower heat supports output",
    "desc": "An Indian lighting rollout supports testing reduced internal heat as a work intervention. Output benefits do not establish higher wages.",
    "grade": "INFERRED",
    "who": "Factory workers and operators",
    "sources": [
      "S4"
    ],
    "debated": "One firm's non-random rollout, with indoor cooling estimated during the study period."
  }
]
```

## C. LINKS

A loop field identifies a relevant existing cycle, not proof of closure. No new cycle is declared. Lags are proposed process timescales, not study-estimated parameters.

```json
[
  {
    "from": "homes",
    "to": "adaptationstrain",
    "why": "Conditional risk: using a fan as indoor protection can add physiological strain in the tested very hot-dry conditions.",
    "loop": "",
    "grade": "UNCERTAIN",
    "moderators": "Heat, humidity, age and health; chamber evidence is not a home trial.",
    "lag": "days",
    "sources": [
      "S1"
    ]
  },
  {
    "from": "coldchain",
    "to": "spoilage",
    "why": "Failed temperature control can increase food losses.",
    "loop": "",
    "grade": "KNOWN",
    "moderators": "Continuity and handling.",
    "lag": "days",
    "sources": [
      "S3"
    ]
  },
  {
    "from": "power",
    "to": "coldchain",
    "why": "Power interruptions can disrupt refrigeration.",
    "loop": "",
    "grade": "KNOWN",
    "moderators": "Backup and thermal storage.",
    "lag": "days",
    "sources": [
      "S3"
    ]
  },
  {
    "from": "spoilage",
    "to": "emissions",
    "why": "Food losses carry an emissions cost.",
    "loop": "",
    "grade": "KNOWN",
    "moderators": "Product and disposal pathway.",
    "lag": "unknown",
    "sources": [
      "S3"
    ]
  },
  {
    "from": "demand",
    "to": "emissions",
    "why": "Existing-edge refinement: cooling demand has an electricity and emissions consequence that efficiency can reduce.",
    "loop": "global",
    "grade": "INFERRED",
    "moderators": "Grid mix, building design, efficiency and use; regional scenarios are not measured outcomes.",
    "lag": "years",
    "sources": [
      "S7"
    ]
  },
  {
    "from": "forest",
    "to": "productivity",
    "why": "Canopy loss increased the thermal burden and reduced measured output in a short rural work experiment.",
    "loop": "",
    "grade": "UNCERTAIN",
    "moderators": "Clearing, task and exposure duration; annual earnings were not measured.",
    "lag": "days",
    "sources": [
      "S6"
    ]
  },
  {
    "from": "irrigation",
    "to": "groundwater",
    "why": "Existing-edge refinement: irrigation design changes modelled water requirements.",
    "loop": "pumping",
    "grade": "INFERRED",
    "moderators": "Constant-demand modelling does not capture all real withdrawal decisions.",
    "lag": "seasons",
    "sources": [
      "S5"
    ]
  },
  {
    "from": "irrigation",
    "to": "farmwork",
    "why": "A water-management change can alter moist heat exposure even when dry-air temperature moves the other way.",
    "loop": "",
    "grade": "INFERRED",
    "moderators": "Humidity and irrigation design; worker health was not measured.",
    "lag": "days",
    "sources": [
      "S5"
    ]
  }
]
```

## D. LEVERS

Measures are proposed evaluation measures. Consultations, project descriptions and experiments retain their stated limits; publication alone is not an effectiveness result.

```json
[
  {
    "id": "affordablecool",
    "edge": [
      "homes",
      "adaptationstrain"
    ],
    "title": "Match low-energy cooling to conditions",
    "who": [
      "Public health agencies",
      "Housing services",
      "Occupational health researchers"
    ],
    "when": "season",
    "measure": "Compare strain and comfort under locally relevant conditions.",
    "text": "Use context-specific guidance.",
    "example": "Australia and Canada, 2025: short controlled trials among older adults.",
    "unintended": "Fan use increased body temperature in the tested very hot-dry setting.",
    "sources": [
      "S1"
    ]
  },
  {
    "id": "foodcool",
    "edge": [
      "coldchain",
      "spoilage"
    ],
    "title": "Test cooling as a service",
    "who": [
      "Producer organisations",
      "Cold-chain providers",
      "Agriculture agencies"
    ],
    "when": "years",
    "measure": "Food losses, fees, access and net returns.",
    "text": "Pay-per-use access avoids equipment purchase; outcomes need evaluation.",
    "example": "Muzaffarpur, India: the report documents a 2021 Oonnayan pilot.",
    "unintended": "Energy and refrigerant costs remain; net effects were unverified.",
    "sources": [
      "S3"
    ]
  },
  {
    "id": "keepgreen",
    "edge": [
      "forest",
      "productivity"
    ],
    "title": "Retain cooling in working landscapes",
    "who": [
      "Land managers",
      "Producer organisations",
      "Worker organisations"
    ],
    "when": "years",
    "measure": "Compare WBGT, output, breaks and earnings with similar unshaded work.",
    "text": "The Indonesian experiment provides a reason to test retained shade alongside work outcomes.",
    "example": "East Kalimantan, 2021 publication: forested and cleared work settings were compared experimentally.",
    "unintended": "",
    "sources": [
      "S6"
    ]
  },
  {
    "id": "coolingcentres",
    "edge": [
      "homes",
      "deaths"
    ],
    "title": "Evaluate reach and sustained protection",
    "who": [
      "Municipalities",
      "Health agencies",
      "Community organisations"
    ],
    "when": "season",
    "measure": "Measure access, duration of use, subsequent exposure and health outcomes separately.",
    "text": "Cooling spaces can offer relief. A claim about lives saved needs evidence beyond comfort or attendance.",
    "example": "OECD studies reviewed in 2025 included two simulated heatwave studies with temporary physiological benefits.",
    "unintended": "Benefits in those experiments were transient; real-world user health outcomes were not reported.",
    "sources": [
      "S2"
    ]
  }
]
```

## E. EVIDENCE FOR CYCLES

No additional evidence for a complete cycle is proposed in this lens. The studies above support selected edges or modifiers.

```json
[]
```

## F. AT-RISK FACTS

```json
[
  {
    "group": "farmworkers",
    "fact": "India's 2022 irrigation simulations produced approximately 0.2°C dry-bulb warming after switching from channel to drip irrigation, while moist heat decreased. Worker health was not tested.",
    "grade": "INFERRED",
    "sources": [
      "S5"
    ]
  }
]
```

## G. OPEN QUESTIONS

Sample sizes are illustrative starting scopes, not power calculations.

```json
[
  {
    "id": "coolingaccess",
    "loop": "energypoverty",
    "q": "Does a locally suitable cooling package reduce physiological strain without raising unaffordable recurring costs?",
    "have": "Short fan experiments identify conditional effects, without household implementation evidence.",
    "could": "Compare supported cooling packages in occupied homes with consent, clinical oversight and cost monitoring.",
    "scale": "Illustrative: 120 households across contrasting local climates for one hot season."
  },
  {
    "id": "foodservice",
    "loop": "farmdebt",
    "q": "Does pay-per-use cold storage reduce losses and improve net returns after service fees?",
    "have": "An Indian pilot is documented through a project case; independent causal outcomes were not verified.",
    "could": "Use phased access with comparison producers, product-temperature logs and net-revenue accounting.",
    "scale": "Illustrative: 200 producers across four market sites over two harvest seasons."
  },
  {
    "id": "coolspacereturn",
    "loop": "",
    "q": "How long does protection persist after people leave a cooling space?",
    "have": "A review finds transient experimental benefits and no real-world user health outcomes in included studies.",
    "could": "Follow consenting users and matched non-users through the remainder of hot days, with exposure and health measures.",
    "scale": "Illustrative: 150 participants over six hot weeks; clinical endpoints may require a larger study."
  }
]
```

## H. SOURCES

Only opened material supports the retained claims. Access depth and design constraints are stated in each limit. Where an authors' limitations section was unavailable, this is explicit rather than inferred. Source keys are local to this report.

```json
[
  {
    "key": "S1",
    "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC12308431/",
    "title": "Thermal and Perceptual Responses of Older Adults With Fan Use in Heat Extremes: A Secondary Analysis of a Randomized Clinical Trial",
    "by": "Chaseling et al.",
    "year": 2025,
    "type": "Peer-reviewed study",
    "where": "Laboratories in Australia and Canada; outside the target region",
    "scale": "58 participants and 320 exposures; three-hour trials",
    "finding": "Fan use marginally reduced body temperature in hot-humid conditions but increased it in very hot-dry conditions.",
    "limit": "Short laboratory exposures; coronary-disease participants did not undergo very-hot-dry fan conditions. No universal threshold follows.",
    "expect": [
      "Fifty-eight participants",
      "320 exposures",
      "short, laboratory-based exposures"
    ]
  },
  {
    "key": "S2",
    "url": "https://researchportal.ukhsa.gov.uk/en/publications/public-health-effectiveness-of-cooling-centres-during-periods-of-/",
    "title": "Public health effectiveness of cooling centres during periods of adverse hot weather: A systematic literature review",
    "by": "Dearman et al.",
    "year": 2025,
    "type": "Systematic review",
    "where": "OECD countries; evidence outside the target region",
    "scale": "Five included studies; search to April 2024",
    "finding": "No included study reported real-world health outcomes for cooling-centre users. Simulated heatwave studies found transient physiological benefits.",
    "limit": "Institutional abstract read. Direct clinical evidence was limited, and modelling findings differed; absence of such evidence does not establish no benefit.",
    "expect": [
      "five studies",
      "transient physiological benefits",
      "No studies reported real-world health outcomes"
    ]
  },
  {
    "key": "S3",
    "url": "https://wedocs.unep.org/bitstreams/e3f8b701-b044-46b9-9deb-8afad6967607/download",
    "title": "Sustainable Food Cold Chains: Opportunities, Challenges and the Way Forward",
    "by": "United Nations Environment Programme and Food and Agriculture Organization of the United Nations",
    "year": 2022,
    "type": "Agency report",
    "where": "Global, with Indian project examples",
    "scale": "Global synthesis and project cases",
    "finding": "Cold chains have energy and refrigerant costs. An Indian pilot offered pay-per-use access.",
    "limit": "Provider-reported cases include expected benefits, not causal evaluations.",
    "expect": [
      "Oonnayan",
      "refrigerant leakage",
      "GreenCHILL"
    ]
  },
  {
    "key": "S4",
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
  },
  {
    "key": "S5",
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
    "key": "S6",
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
    "key": "S7",
    "url": "https://www.iea.org/reports/the-future-of-cooling-in-southeast-asia",
    "title": "The Future of cooling in Southeast Asia",
    "by": "International Energy Agency",
    "year": 2019,
    "type": "Agency report",
    "where": "Southeast Asia",
    "scale": "Regional energy scenarios to 2040",
    "finding": "Efficiency and building improvements reduce projected cooling electricity demand and associated emissions relative to the stated-policy scenario.",
    "limit": "Scenario results published in 2019 are not measured 2026 outcomes. The report page does not establish household access or actual appliance use.",
    "expect": [
      "25 November 2019",
      "Stated Policies Scenario",
      "Seasonal Energy Efficiency Ratio"
    ]
  }
]
```

## I. WHAT I COULD NOT VERIFY

- Cooling centres: the map's statement that they save lives in every heatwave is broader than the reviewed evidence. Proposed wording: public cooling spaces can offer relief; sustained health benefits depend on use and local conditions. [S2]
- Education: the Kerala cool-roof working paper was located but its PDF and institutional result pages could not be opened. Search-result effect sizes and attendance findings were excluded. The J-PAL page describes a pilot, not its outcomes.
- Singapore coatings: a university announcement was read, but the primary paper and preprint could not be opened. Its temperature and comfort numbers were excluded.
- Forest shade: the regional experiment is not an evaluated conservation programme and does not establish year-round wage benefits.
- Cold storage: provider-reported benefits are not independently evaluated producer-income effects. [S3]
- Tenant displacement, rent changes and unequal access were not measured by the retained intervention studies. No claim of no side effects is made.
- No full cycle is added in E. Several response mechanisms touch existing cycles, but the retained studies do not evaluate complete feedback closure.
- Additional worked examples remain unverified here for blackcarbon, firesmart, drypower, pumpbackup, farmcredit, freecare, coolnights, heat-specific mindheat and regional cooling-centre health outcomes.
- Soilwater, irrigate, socialprotection, safeathome and childwater have bounded examples in earlier runs. They are not counted again as new results.
- Four of seven sources concern regional settings, plus a global report with an Indian pilot. This is a targeted appraisal, not a comprehensive adaptation review.

