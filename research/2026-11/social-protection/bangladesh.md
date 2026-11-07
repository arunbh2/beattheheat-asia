# Common Shade: Bangladesh - heat and social protection

Research and Claude Code design handoff. Evidence checked on 6 November 2026.

This is a source-backed research catalogue and a design brief. It is not a completed geospatial dataset, an eligibility checker, or a guarantee of benefits.

For Claude Code: preserve sections A-K and parse the seven fenced JSON arrays independently. Use the existing Common Shade design system if the repository contains one; the repository was not inspected for this research.

Build an aggregate place explorer with a map, accessible table, scheme drawer, access-ladder view, and source drawer. Show the year, population denominator, benefit period, evidence grade, and source beside each value.

Use separate labels for published entitlement, budget target, enrolment, reported receipt, and evaluated outcome. Keep unknown values empty with an explanation; use a separate pattern for missing data rather than the colour for zero.

Treat countrywide schemes as an availability overlay, not a coverage score. Keep historical evaluations and pilots visibly separate from current public entitlements; no household-level information enters the product.

Publication gate: unresolved 2026 rules, unclear licences, unparsed downloads, and untested joins remain visible in a research panel until checked. No live data download, boundary join, or application test was completed in this run.

The evidence grades apply to claims: KNOWN is official, measured, or peer-reviewed; INFERRED covers models, projections, and second-hand estimates; UNCERTAIN covers single, unreplicated, or contested findings. A measured single study can carry a KNOWN descriptive finding while its wider interpretation remains UNCERTAIN.

The requested schema uses state for the first administrative level. Here it means division; it is not a claim that the country uses states.

## A. SUMMARY

- KNOWN: the 2026-27 budget identifies cash, food, employment, credit and disease-specific medical support; several benefit levels changed. Budget entries do not prove receipt. [B1, B2]
- KNOWN: HIES 2022 measures household receipt, but the sources read do not link eligibility, application and receipt for heat-exposed groups. The biggest measurable gap is the missing eligible-household denominator. [B3]
- UNCERTAIN: implementers report heat cash in Dhaka and a Rajshahi allowance top-up simulation. Neither report establishes reduced illness, debt or mortality. [B5, B6]
- KNOWN contextual evidence: a health-protection pilot was associated with lower medical spending, and a flood cash trial found mixed effects across outcomes and timing. Neither establishes a general heat effect. [B7, B9]
- INFERRED map design: ERA5 and openly licensed division boundaries support an exposure layer today; a newly compiled scheme-availability layer can accompany it. Historical HIES receipt can be added after reuse and crosswalk checks. [B14, B15, B3]
- Not verified: universal heat income replacement, a public heat-specific medical claims pathway, portable informal-worker protection, and a complete last-mile evidence base. No result is interpreted as proof that households are unprotected. [B1, B7, B8]
## B. SCHEMES

```json
[
  {
    "id": "familycard",
    "country": "Bangladesh",
    "level": "national",
    "name": "Family Card Programme",
    "type": "cash",
    "run_by": "Department of Social Services",
    "who": "Selected low-income households.",
    "gives": "Tk. 2,500 monthly.",
    "delivery": "Government-to-person payment.",
    "documents": "Current application checklist not verified.",
    "portable": "unknown",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "unknown",
    "heat_relevance": "INFERRED: resources could help meet hot-season household costs; heat outcomes were not evaluated.",
    "status": "changed (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "B1"
    ]
  },
  {
    "id": "oldage",
    "country": "Bangladesh",
    "level": "national",
    "name": "Old Age Allowance",
    "type": "pension",
    "run_by": "Department of Social Services",
    "who": "Men aged 65+ and women aged 62+ under the budget description; current income threshold needs reconciliation.",
    "gives": "Tk. 700 monthly.",
    "delivery": "Government-to-person payment.",
    "documents": "Current application checklist not verified.",
    "portable": "unknown",
    "speed": "Published quarterly cycle; actual timeliness not verified.",
    "shock_responsive": "unknown",
    "heat_relevance": "INFERRED: resources could help meet hot-season household costs; heat outcomes were not evaluated.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "B1",
      "B2"
    ]
  },
  {
    "id": "widow",
    "country": "Bangladesh",
    "level": "national",
    "name": "Allowance for Widowed, Deserted and Destitute Women",
    "type": "cash",
    "run_by": "Department of Social Services",
    "who": "Selected widowed, deserted or destitute women.",
    "gives": "Tk. 700 monthly.",
    "delivery": "Government-to-person payment.",
    "documents": "Current application checklist not verified.",
    "portable": "unknown",
    "speed": "Published quarterly cycle; actual timeliness not verified.",
    "shock_responsive": "unknown",
    "heat_relevance": "INFERRED: resources could help meet hot-season household costs; heat outcomes were not evaluated.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "B1",
      "B2"
    ]
  },
  {
    "id": "disability",
    "country": "Bangladesh",
    "level": "national",
    "name": "Disability Allowance and Education Stipend Programme",
    "type": "cash",
    "run_by": "Department of Social Services",
    "who": "Disability registration; student component has additional conditions.",
    "gives": "Allowance Tk. 1,000 monthly; education rates differ.",
    "delivery": "Government-to-person payment.",
    "documents": "Disability Information System registration; complete checklist not verified.",
    "portable": "unknown",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "unknown",
    "heat_relevance": "INFERRED: resources could help meet hot-season household costs; heat outcomes were not evaluated.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "B1",
      "B2"
    ]
  },
  {
    "id": "motherchild",
    "country": "Bangladesh",
    "level": "national",
    "name": "Mother and Child Benefit Programme",
    "type": "cash",
    "run_by": "Department of Women Affairs",
    "who": "Selected low-income women aged 20-35 in their first or second pregnancy.",
    "gives": "Tk. 850 monthly.",
    "delivery": "Cash transfer.",
    "documents": "Current application checklist not verified.",
    "portable": "unknown",
    "speed": "Published quarterly disbursement; observed delay unknown.",
    "shock_responsive": "unknown",
    "heat_relevance": "INFERRED: resources could help meet hot-season household costs; heat outcomes were not evaluated.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "B1",
      "B2"
    ]
  },
  {
    "id": "vwb",
    "country": "Bangladesh",
    "level": "national",
    "name": "Vulnerable Women Benefit",
    "type": "food",
    "run_by": "Department of Women Affairs",
    "who": "Selected women aged 20-50 in extreme poverty.",
    "gives": "30 kg rice monthly.",
    "delivery": "Food distribution.",
    "documents": "Current application checklist not verified.",
    "portable": "unknown",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "partly",
    "heat_relevance": "INFERRED: resources could help meet hot-season household costs; heat outcomes were not evaluated.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "B1"
    ]
  },
  {
    "id": "egpp",
    "country": "Bangladesh",
    "level": "national",
    "name": "Employment Generation Programme for the Poorest",
    "type": "public-works",
    "run_by": "Department of Disaster Management",
    "who": "Selected unemployed workers in poverty.",
    "gives": "Tk. 500 daily worker rate.",
    "delivery": "Public works; Job Card.",
    "documents": "Job Card is described; current application checklist not verified.",
    "portable": "unknown",
    "speed": "Published weekly payment cycle; actual delay unknown.",
    "shock_responsive": "partly",
    "heat_relevance": "INFERRED: paid work can cushion income, while outdoor work also creates heat exposure.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "B1"
    ]
  },
  {
    "id": "ffp",
    "country": "Bangladesh",
    "level": "national",
    "name": "Food Friendly Programme",
    "type": "food",
    "run_by": "Directorate General of Food",
    "who": "Registered rural households in poverty.",
    "gives": "30 kg rice monthly for six months at Tk. 15/kg.",
    "delivery": "Union-level dealers.",
    "documents": "Current application checklist not verified.",
    "portable": "unknown",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "partly",
    "heat_relevance": "INFERRED: resources could help meet hot-season household costs; heat outcomes were not evaluated.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "B1"
    ]
  },
  {
    "id": "vgf",
    "country": "Bangladesh",
    "level": "national",
    "name": "Vulnerable Group Feeding",
    "type": "food",
    "run_by": "Department of Disaster Management",
    "who": "Selected households facing poverty or shocks.",
    "gives": "Rice assistance; allocation depends on distribution round.",
    "delivery": "Local food distribution.",
    "documents": "Current application checklist not verified.",
    "portable": "unknown",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "partly",
    "heat_relevance": "INFERRED: resources could help meet hot-season household costs; heat outcomes were not evaluated.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "B1"
    ]
  },
  {
    "id": "rss",
    "country": "Bangladesh",
    "level": "national",
    "name": "Rural Social Services Programme",
    "type": "credit",
    "run_by": "Department of Social Services",
    "who": "Low-income rural households, including landless households.",
    "gives": "Published revolving loan range: Tk. 5,000-50,000 per family; local offer not verified.",
    "delivery": "Public rural credit programme.",
    "documents": "Current application checklist not verified.",
    "portable": "unknown",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "unknown",
    "heat_relevance": "INFERRED: credit may support livelihood recovery; repayment also affects household budgets.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "B1"
    ]
  },
  {
    "id": "medicalaid",
    "country": "Bangladesh",
    "level": "national",
    "name": "Financial Assistance for Patients Suffering from Cancer, Kidney Disease, Liver Cirrhosis, Stroke Paralysis, Congenital Heart Disease and Thalassaemia",
    "type": "health",
    "run_by": "Department of Social Services",
    "who": "Specified illnesses and financial conditions.",
    "gives": "Up to Tk. 100,000 one-time assistance.",
    "delivery": "Medical-assistance process.",
    "documents": "Medical certification; full current checklist not verified.",
    "portable": "unknown",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "unknown",
    "heat_relevance": "No general heat-illness entitlement was verified in this disease-specific scheme.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "B1"
    ]
  },
  {
    "id": "eis",
    "country": "Bangladesh",
    "level": "national",
    "name": "Employment Injury Scheme pilot",
    "type": "insurance",
    "run_by": "Ministry of Labour and Employment / Central Fund",
    "who": "Covered ready-made garment workers.",
    "gives": "Employment-injury support; individual formula not verified.",
    "delivery": "Central Fund pilot arrangements.",
    "documents": "Current application checklist not verified.",
    "portable": "unknown",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "partly",
    "heat_relevance": "Heat-related occupational claims were not verified; informal and construction coverage cannot be assumed.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "B8"
    ]
  },
  {
    "id": "ssk",
    "country": "Bangladesh",
    "level": "national",
    "name": "Shasthyo Suroksha Karmasuchi",
    "type": "health",
    "run_by": "Health Economics Unit, Ministry of Health and Family Welfare",
    "who": "Below-poverty-line pilot population in the evaluated locations.",
    "gives": "Historical study: up to BDT 50,000 per family per year; 2026 package not verified.",
    "delivery": "Pilot contracted care in the historical evaluation.",
    "documents": "Current application checklist not verified.",
    "portable": "unknown",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "unknown",
    "heat_relevance": "INFERRED: hospital-cost protection could help; heat-specific claims were not studied.",
    "status": "unclear (as of 2026)",
    "grade": "UNCERTAIN",
    "sources": [
      "B7"
    ]
  }
]
```
## C. ACCESS LADDER

```json
[
  {
    "scheme": "allssn",
    "group": "All households",
    "step": "received",
    "finding": "Bangladesh, 2022: 37.6% of households received social safety net support.",
    "grade": "KNOWN",
    "limit": "Household survey; past-year receipt, not the share of eligible households reached.",
    "sources": [
      "B3"
    ]
  },
  {
    "scheme": "allssn",
    "group": "Rural households",
    "step": "received",
    "finding": "Bangladesh, 2022: 44.0% of rural households received support.",
    "grade": "KNOWN",
    "limit": "No heat-exposure or outdoor-worker subgroup is identified in this table.",
    "sources": [
      "B3"
    ]
  },
  {
    "scheme": "allssn",
    "group": "Urban households",
    "step": "received",
    "finding": "Bangladesh, 2022: 23.9% of urban households received support.",
    "grade": "KNOWN",
    "limit": "Different populations and need; no causal urban-rural comparison follows.",
    "sources": [
      "B3"
    ]
  },
  {
    "scheme": "oldage",
    "group": "Simulation participants in Ward 4, Rajshahi",
    "step": "received",
    "finding": "Implementers report 301 recipients received a BDT 2,400 top-up in August 2025.",
    "grade": "UNCERTAIN",
    "limit": "Selected simulation participants; no population access denominator or independent outcome evaluation.",
    "sources": [
      "B5"
    ]
  },
  {
    "scheme": "heatpilot",
    "group": "Selected Dhaka households",
    "step": "received",
    "finding": "Implementer update: 1,290 households had received multipurpose cash by 27 April 2024.",
    "grade": "UNCERTAIN",
    "limit": "The 4,000-household figure is a target, not the receipt count in this update.",
    "sources": [
      "B6"
    ]
  }
]
```

No measured linked aware, eligible, documented, applied, enrolled, adequate or on-time ladder for the heat-exposed target groups was verified. Monthly entitlements and scheduled cycles are rules, not measured adequacy or punctuality. Scheme code allssn denotes survey receipt across schemes; heatpilot denotes humanitarian delivery, not a standing public scheme.
## D. HEAT AND SOCIAL PROTECTION EVIDENCE

```json
[
  {
    "by": "Red Cross Red Crescent Climate Centre and partners, 2026",
    "title": "When social protection anticipates risk: Lessons from a shock responsive social protection simulation in Rajshahi city, Bangladesh",
    "url": "https://www.anticipation-hub.org/Documents/Reports/0_RCCC_SRSP_simulation_Rajshahi_Advocacy_brief_V3.pdf",
    "type": "Agency report",
    "where": "Ward 4, Rajshahi",
    "scale": "301 selected allowance recipients",
    "finding": "UNCERTAIN, self-reported: the simulation delivered a BDT 2,400 top-up. It demonstrates a tested delivery route, not a measured reduction in heat illness or lost income.",
    "effect": "unclear",
    "limit": "No independent causal heat-outcome assessment; report date and citation year differ.",
    "sources": [
      "B5"
    ]
  },
  {
    "by": "Bangladesh Red Crescent Society, 2024",
    "title": "Nationwide Heatwave Early Actions/Response: Operations Update-01; 27 April, 2024",
    "url": "https://bdrcs.org/wp-content/uploads/2024/04/Heatwave-Early-Actions-2024-_27.4.24-_Operation-Update-01.pdf",
    "type": "Agency report",
    "where": "Dhaka",
    "scale": "Reported receipt among 1,290 households by 27 April 2024",
    "finding": "UNCERTAIN, self-reported: heat cash delivery occurred. The update also reports cooling and first-aid activities, without isolating the effects of cash.",
    "effect": "unclear",
    "limit": "Operational update without a comparison group or measured income, debt or mortality effect.",
    "sources": [
      "B6"
    ]
  },
  {
    "by": "Hasan et al., 2024",
    "title": "The effectiveness of a government-sponsored health protection scheme in reducing financial risks for the below-poverty-line population in Bangladesh",
    "url": "https://bura.brunel.ac.uk/bitstream/2438/30215/1/FullText.pdf",
    "type": "Peer-reviewed study",
    "where": "Tangail",
    "scale": "2315 below-poverty-line households; data collected in 2019-2020",
    "finding": "KNOWN study estimate: adjusted out-of-pocket expenditure was 33% lower in intervention areas. This is contextual health-financing evidence, not a heat-specific effect.",
    "effect": "helped",
    "limit": "Cross-sectional design, recall periods and unmeasured forgone care limit causal interpretation.",
    "sources": [
      "B7"
    ]
  },
  {
    "by": "Christian et al., 2025",
    "title": "Fast Action for Floods: RCT Evidence on Forecast-based Cash Transfers from Bangladesh and Nepal",
    "url": "https://bfi.uchicago.edu/wp-content/uploads/2025/11/BFI_WP_2025-140.pdf",
    "type": "Evaluation",
    "where": "Bangladesh and Nepal",
    "scale": "Randomised timing of flood-related cash; sample varies across countries and survey rounds",
    "finding": "KNOWN trial findings, with wider transfer to heat INFERRED: earlier cash improved some early food-security and psychosocial outcomes. Later borrowing, savings and asset outcomes did not show statistically significant effects.",
    "effect": "mixed",
    "limit": "Working paper, not a peer-reviewed heat study; incomplete outcome timing limits some recovery comparisons.",
    "sources": [
      "B9"
    ]
  }
]
```
## E. DELIVERY ROUTES AND ORGANISATIONS

```json
[
  {
    "id": "dss",
    "name": "Department of Social Services",
    "kind": "government",
    "does": "Runs allowance systems and the delivery channel used in the Rajshahi simulation.",
    "where": "Bangladesh",
    "reach_reported": "No independently verified 2026 receipt total extracted.",
    "reach_independent": "",
    "evaluations": "",
    "url": "https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-mof/2026/5/4d4de077-26a7-4f8f-aad1-7b3f48043897.pdf",
    "sources": [
      "B1",
      "B5"
    ]
  },
  {
    "id": "bdrcs",
    "name": "Bangladesh Red Crescent Society",
    "kind": "civil society",
    "does": "Volunteers help assess eligibility and deliver heat-related cash, warnings and services.",
    "where": "Dhaka; Rajshahi simulation",
    "reach_reported": "Self-report: 1,290 households received heat cash by 27 April 2024.",
    "reach_independent": "",
    "evaluations": "",
    "url": "https://bdrcs.org/wp-content/uploads/2024/04/Heatwave-Early-Actions-2024-_27.4.24-_Operation-Update-01.pdf",
    "sources": [
      "B5",
      "B6"
    ]
  },
  {
    "id": "postoffice",
    "name": "Bangladesh Post Office",
    "kind": "government",
    "does": "Electronic money transfer is described as an anticipatory-action payment route.",
    "where": "Bangladesh",
    "reach_reported": "No comparable reach count extracted.",
    "reach_independent": "",
    "evaluations": "",
    "url": "https://go-api.ifrc.org/api/downloadfile/91752/EAP2024BD07_MDRBD038",
    "sources": [
      "B11"
    ]
  },
  {
    "id": "nagad",
    "name": "Nagad",
    "kind": "financial",
    "does": "Mobile money route reported for the 2024 heatwave cash operation.",
    "where": "Bangladesh",
    "reach_reported": "No independently verified heat-payment reach extracted.",
    "reach_independent": "",
    "evaluations": "",
    "url": "https://go-api.ifrc.org/api/downloadfile/91752/EAP2024BD07_MDRBD038",
    "sources": [
      "B11"
    ]
  },
  {
    "id": "bils",
    "name": "Bangladesh Institute of Labour Studies",
    "kind": "civil society",
    "does": "Reports worker social-protection dialogue and advocacy for informal-worker inclusion.",
    "where": "Bangladesh",
    "reach_reported": "Activity reported on 29 September 2026; no application-success count extracted.",
    "reach_independent": "",
    "evaluations": "",
    "url": "https://bilsbd.org/news/bils-calls-to-include-informal-sector-in-the-employment-injury-scheme/",
    "sources": [
      "B12"
    ]
  },
  {
    "id": "haqdarshak",
    "name": "Haqdarshak",
    "kind": "social enterprise",
    "does": "Own materials describe trained local agents and digital assistance for finding and claiming schemes.",
    "where": "Verified materials refer to India; Bangladesh operation not verified.",
    "reach_reported": "No Bangladesh reach verified.",
    "reach_independent": "",
    "evaluations": "",
    "url": "https://www.haqdarshak.com/",
    "sources": [
      "B13"
    ]
  }
]
```
## F. MAP INDICATOR CATALOGUE

```json
[
  {
    "id": "hotdays",
    "layer": "exposure",
    "indicator": "Days with daily maximum air temperature above 40 degrees C",
    "definition": "Proposed derivation from hourly ERA5 2 m temperature, using local calendar days and area-weighted aggregation. Threshold is an analytical choice, not an official warning threshold.",
    "unit": "days/year",
    "unit_of_place": "state",
    "year": 2025,
    "publisher": "Copernicus Climate Change Service / ECMWF",
    "url": "https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels?tab=overview",
    "licence": "CC-BY licence displayed; retain dataset attribution",
    "access": "registration",
    "format": "other",
    "update": "Source daily; map annual",
    "place_code": "Grid coordinates; spatial overlay with versioned division geometry",
    "limit": "INFERRED reanalysis; not measured personal exposure. No country values were calculated in this research."
  },
  {
    "id": "hotnights",
    "layer": "exposure",
    "indicator": "Nights with daily minimum air temperature above 30 degrees C",
    "definition": "Proposed derivation from the same hourly series, using local-day minimum as a reproducible proxy. An overnight-only definition can be substituted if documented.",
    "unit": "days/year",
    "unit_of_place": "state",
    "year": 2025,
    "publisher": "Copernicus Climate Change Service / ECMWF",
    "url": "https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels?tab=overview",
    "licence": "CC-BY licence displayed",
    "access": "registration",
    "format": "other",
    "update": "Source daily; map annual",
    "place_code": "Same grid and geometry as hotdays",
    "limit": "INFERRED; a local-day minimum is not a direct measurement of sleep conditions."
  },
  {
    "id": "dewpoint",
    "layer": "exposure",
    "indicator": "Hot-season dew-point temperature",
    "definition": "Proposed mean hourly 2 m dew-point temperature for March-June 2025, aggregated by area. This is a humidity context measure, not wet-bulb temperature or WBGT.",
    "unit": "degrees C",
    "unit_of_place": "state",
    "year": 2025,
    "publisher": "Copernicus Climate Change Service / ECMWF",
    "url": "https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels?tab=overview",
    "licence": "CC-BY licence displayed",
    "access": "registration",
    "format": "other",
    "update": "Source daily; map annual",
    "place_code": "Same grid and geometry as hotdays",
    "limit": "INFERRED; a humid-heat health threshold has not been validated here. These variables are published on a grid, not as administrative tables."
  },
  {
    "id": "disability",
    "layer": "vulnerability",
    "indicator": "Population reporting disability",
    "definition": "Published census disability classification; use the report denominator without equating it to eligibility for disability benefits.",
    "unit": "percent of population",
    "unit_of_place": "state",
    "year": 2022,
    "publisher": "Bangladesh Bureau of Statistics",
    "url": "https://nsds.bbs.gov.bd/storage/files/1/Publications/BBS_Preliminary_Census_2022.pdf",
    "licence": "Not verified; public PDF is not proof of an open licence",
    "access": "open download",
    "format": "PDF",
    "update": "Census cycle",
    "place_code": "Division labels; no shared machine code verified",
    "limit": "Preliminary results; disability definitions differ across surveys. [B4]"
  },
  {
    "id": "density",
    "layer": "vulnerability",
    "indicator": "Population density",
    "definition": "Population per square kilometre in the preliminary census division tables.",
    "unit": "persons/km2",
    "unit_of_place": "state",
    "year": 2022,
    "publisher": "Bangladesh Bureau of Statistics",
    "url": "https://nsds.bbs.gov.bd/storage/files/1/Publications/BBS_Preliminary_Census_2022.pdf",
    "licence": "Not verified",
    "access": "open download",
    "format": "PDF",
    "update": "Census cycle",
    "place_code": "Division labels; boundary vintage reconciliation needed",
    "limit": "Area averages do not reveal workplace, housing or neighbourhood heat. [B4]"
  },
  {
    "id": "ssnreceipt",
    "layer": "coverage",
    "indicator": "Households receiving social safety net support",
    "definition": "HIES Table 10.2: households reporting support in the survey reference period divided by all households, by division.",
    "unit": "percent of households",
    "unit_of_place": "state",
    "year": 2022,
    "publisher": "Bangladesh Bureau of Statistics",
    "url": "https://file.portal.gov.bd/uploads/e5e7ab98-01a1-4201-aed7-938bac247de3/659/fea/716/659fea716a8f4036787088.pdf",
    "licence": "Not verified",
    "access": "open download",
    "format": "PDF",
    "update": "Survey round",
    "place_code": "Division names; no verified common place code",
    "limit": "Not eligible-household coverage, current enrolment, benefit adequacy or heat protection. [B3]"
  },
  {
    "id": "ssnvalue",
    "layer": "coverage",
    "indicator": "Mean annual household benefit received",
    "definition": "HIES Table 10.3 reports mean annual benefit by programme and division; preserve the published recipient denominator.",
    "unit": "BDT/year",
    "unit_of_place": "state",
    "year": 2022,
    "publisher": "Bangladesh Bureau of Statistics",
    "url": "https://file.portal.gov.bd/uploads/e5e7ab98-01a1-4201-aed7-938bac247de3/659/fea/716/659fea716a8f4036787088.pdf",
    "licence": "Not verified",
    "access": "open download",
    "format": "PDF",
    "update": "Survey round",
    "place_code": "Same division labels and survey as ssnreceipt",
    "limit": "Table structure was read, but values were not transcribed or joined. Sparse programme cells need survey precision checks. [B3]"
  },
  {
    "id": "oldagerate",
    "layer": "system",
    "indicator": "Published Old Age Allowance rate",
    "definition": "Monthly entitlement shown separately from the quarterly payment cycle; repeat nationally applicable rule across divisions only as availability.",
    "unit": "BDT/person/month",
    "unit_of_place": "state",
    "year": 2026,
    "publisher": "Ministry of Finance; CPD analysis",
    "url": "https://cpd.org.bd/resources/2026/06/CPD-Budget-Analysis-FY2027.pdf",
    "licence": "Underlying report reuse licence not verified; scheme facts can be newly recorded with attribution",
    "access": "open download",
    "format": "PDF",
    "update": "Budget or rule revision",
    "place_code": "New country-and-division crosswalk; not an official registration code",
    "limit": "Not receipt, buying power, heat-triggered support or a verified application entitlement for every older person. [B1, B2]"
  },
  {
    "id": "ffpterms",
    "layer": "system",
    "indicator": "Food Friendly Programme terms",
    "definition": "Published grain quantity, price and seasonal duration; eligibility and delivery location remain separate fields.",
    "unit": "kg, BDT/kg and months",
    "unit_of_place": "state",
    "year": 2026,
    "publisher": "Ministry of Finance",
    "url": "https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-mof/2026/5/4d4de077-26a7-4f8f-aad1-7b3f48043897.pdf",
    "licence": "Report licence not verified; record factual terms with attribution",
    "access": "open download",
    "format": "PDF",
    "update": "Budget or programme revision",
    "place_code": "Same curated division crosswalk",
    "limit": "Availability does not establish nearby distribution, stock, receipt or migrant portability. [B1]"
  }
]
```
## G. A MINIMUM VIABLE MAP

A strict open-data first release can contain two substantive layers at division level: derived 2025 ERA5 hot-day counts and a newly authored table of the 2026 Old Age Allowance amount. The first is modelled exposure; the second describes a public system that is available under eligibility rules. [B14, B1, B2]

The spatial scaffold is the opened geoBoundaries BGD ADM1 metadata for eight divisions, with a 2015 boundary year and CC0 source licence. Derive temperatures on the grid and overlay the selected geometry; retain its version and create an explicit division-name crosswalk. No shared official place code was verified between that geometry, HIES and scheme records. [B15, B3]

The table can show hot-day context beside entitlement, eligibility limits, payment cycle and evidence status. A third layer can use HIES 2022 division-level household receipt after confirming reuse terms and the table transcription; it is a later addition to a strictly open release, not an already cleared dataset. [B3]

This proposal uses datasets and rule sources that were opened, but the data pipeline was not run. The release can publish its own independently written scheme-facts table under an open licence; no licence is assigned here to the underlying government reports.

It cannot show which households qualify, whether a migrant can collect locally, whether payments arrived before a hot week, or the effect of benefits on illness or income. Similar map colours can reflect different years and denominators; a low receipt share can reflect population composition as well as unmet access, while a high share does not establish adequate protection. [B3, B5, B7]

No combined vulnerability score or district ranking is proposed. The accessible comparison table can expose source dates, missing values and untested joins alongside the map.
## H. WHERE NO SYSTEM RESPONDS

- Informal and outdoor workers' heat-related lost earnings: no automatic nationwide public wage-replacement entitlement was verified in the schemes read; targeted allowances and works programmes cover selected groups. [B1, B8]
- General heat illness and outpatient costs: the disease-specific assistance list does not establish general heat coverage; the SSK evaluation does not report heat claims. [B1, B7]
- Crop loss and agricultural debt: public rural credit was identified, but no verified heat-triggered payout or debt pause was found in the sources read. This is an evidence gap, not a claim that no agricultural programme exists. [B1]
- Seasonal migration: nationwide portability of eligibility, applications and collection was not verified; a digital transfer alone does not establish portability. [B1]
- Heat debt, asset sales and mortality: no evaluated public heat transfer effect was found in this bounded search. Flood trial findings do not fill that gap. [B5, B6, B9]
## I. OPEN QUESTIONS

```json
[
  {
    "id": "heattopup",
    "q": "Does an allowance top-up before a heatwave reduce lost work and medical spending?",
    "have": "A Rajshahi delivery simulation was reported. [B5]",
    "could": "Randomised phased invitation or top-up timing across comparable neighbourhood clusters, with aggregate income, medical-spending and timing outcomes.",
    "scale": "Illustrative design: 40-60 clusters; final size from power calculations."
  },
  {
    "id": "accesssteps",
    "q": "At which access step do heat-exposed urban households stop receiving support?",
    "have": "HIES measures past receipt but not a linked eligibility-to-receipt ladder. [B3]",
    "could": "A repeated representative household survey linked only to consented, de-identified process totals; publish aggregate transitions and reasons.",
    "scale": "Illustrative design: 1,500-2,000 households across several cities."
  },
  {
    "id": "claimscare",
    "q": "How often does public support meet the costs of medically diagnosed heat illness?",
    "have": "A historical SSK financial-risk evaluation exists; heat-specific claims were not reported. [B7]",
    "could": "Prospective facility-cost study comparing public benefits, out-of-pocket costs, referral and foregone care across one hot season.",
    "scale": "Illustrative design: 10-15 facilities; power and case-volume check first."
  },
  {
    "id": "lastmile",
    "q": "Does assisted application improve timely receipt among migrants and women outdoor workers?",
    "have": "Delivery organisations describe support, but no comparable independent local effect was read. [B6, B12, B13]",
    "could": "Randomise outreach timing among consenting community clusters and track aggregate application, receipt, cost and delay.",
    "scale": "Illustrative design: 30-50 clusters over one application cycle."
  }
]
```
## J. SOURCES

```json
[
  {
    "key": "B1",
    "url": "https://objectstorage.ap-dcc-gazipur-1.oraclecloud15.com/n/axvjbnqprylg/b/V2Ministry/o/office-mof/2026/5/4d4de077-26a7-4f8f-aad1-7b3f48043897.pdf",
    "title": "Social Security Budget Report FY2026-27",
    "by": "Finance Division, Ministry of Finance",
    "year": 2026,
    "type": "Government page",
    "where": "Bangladesh",
    "finding": "Current budget descriptions identify cash, food, employment, credit and medical assistance systems. Entitlements and payment cycles are distinct from actual receipt.",
    "limit": "The report states that some information is provisional and subject to revision.",
    "expect": [
      "iBAS++",
      "Payment Cycle",
      "Family Card"
    ]
  },
  {
    "key": "B2",
    "url": "https://cpd.org.bd/resources/2026/06/CPD-Budget-Analysis-FY2027.pdf",
    "title": "An Analysis of the National Budget for FY2026-27",
    "by": "Centre for Policy Dialogue",
    "year": 2026,
    "type": "Agency report",
    "where": "Bangladesh",
    "finding": "Budget analysis records monthly old-age and widow allowances of Tk. 700, disability allowance of Tk. 1,000, and Mother and Child Benefit of Tk. 850.",
    "limit": "Budget analysis, not a household payment or heat-outcome evaluation.",
    "expect": [
      "FY2026-27",
      "700",
      "850"
    ]
  },
  {
    "key": "B3",
    "url": "https://file.portal.gov.bd/uploads/e5e7ab98-01a1-4201-aed7-938bac247de3/659/fea/716/659fea716a8f4036787088.pdf",
    "title": "Household Income and Expenditure Survey HIES 2022: Final Report",
    "by": "Bangladesh Bureau of Statistics",
    "year": 2023,
    "type": "Government page",
    "where": "Bangladesh",
    "finding": "Table 10.1 reports household social safety net receipt of 37.6% nationally, 44.0% rural and 23.9% urban in 2022; Table 10.2 gives division estimates.",
    "limit": "The report notes changes in programme coverage across survey rounds; these are not 2026 eligibility or heat-specific rates.",
    "expect": [
      "37.6",
      "Table 10.2",
      "44.0"
    ]
  },
  {
    "key": "B4",
    "url": "https://nsds.bbs.gov.bd/storage/files/1/Publications/BBS_Preliminary_Census_2022.pdf",
    "title": "Population & Housing Census 2022: Preliminary Report",
    "by": "Bangladesh Bureau of Statistics",
    "year": 2022,
    "type": "Government page",
    "where": "Bangladesh",
    "finding": "Publishes population and disability tables, including division summaries.",
    "limit": "Preliminary census results; no verified open reuse licence was visible in the material read.",
    "expect": [
      "2022",
      "Disability",
      "Population"
    ]
  },
  {
    "key": "B5",
    "url": "https://www.anticipation-hub.org/Documents/Reports/0_RCCC_SRSP_simulation_Rajshahi_Advocacy_brief_V3.pdf",
    "title": "When social protection anticipates risk: Lessons from a shock responsive social protection simulation in Rajshahi city, Bangladesh",
    "by": "Red Cross Red Crescent Climate Centre and implementing partners",
    "year": 2026,
    "type": "Agency report",
    "where": "Rajshahi, Bangladesh",
    "finding": "Implementers report an August 2025 simulation with 301 Old Age Allowance recipients and a BDT 2,400 top-up.",
    "limit": "Simulation report, not an independent causal evaluation; the cover says December 2025 while the recommended citation uses 2026.",
    "expect": [
      "301",
      "2,400",
      "simulation"
    ]
  },
  {
    "key": "B6",
    "url": "https://bdrcs.org/wp-content/uploads/2024/04/Heatwave-Early-Actions-2024-_27.4.24-_Operation-Update-01.pdf",
    "title": "Nationwide Heatwave Early Actions/Response: Operations Update-01; 27 April, 2024",
    "by": "Bangladesh Red Crescent Society",
    "year": 2024,
    "type": "Agency report",
    "where": "Dhaka and Bangladesh",
    "finding": "Reports 1,290 households had received multipurpose cash by 27 April 2024; the larger household figure is a target.",
    "limit": "Implementer situation update, not an independent assessment of income, illness or mortality effects.",
    "expect": [
      "1,290",
      "4,000 households",
      "BDT 5000"
    ]
  },
  {
    "key": "B7",
    "url": "https://bura.brunel.ac.uk/bitstream/2438/30215/1/FullText.pdf",
    "title": "The effectiveness of a government-sponsored health protection scheme in reducing financial risks for the below-poverty-line population in Bangladesh",
    "by": "Hasan et al.",
    "year": 2024,
    "type": "Peer-reviewed study",
    "where": "Tangail, Bangladesh",
    "finding": "Among 2315 sampled households, adjusted out-of-pocket expenditure was 33% lower in intervention areas.",
    "limit": "Cross-sectional comparison; recall and unmeasured forgone care limit interpretation. Heat illness was not analysed separately.",
    "expect": [
      "2315",
      "33%",
      "Limitations of the study"
    ]
  },
  {
    "key": "B8",
    "url": "https://www.ilo.org/projects-and-partnerships/projects/implementation-pilot-employment-injury-scheme-eis-bangladesh",
    "title": "Implementation of a pilot Employment Injury Scheme (EIS) in Bangladesh",
    "by": "International Labour Organization",
    "year": null,
    "type": "Agency report",
    "where": "Bangladesh",
    "finding": "The project page lists a pilot project period ending 31 December 2028 and identifies the Central Fund.",
    "limit": "A project period is not proof of individual benefit receipt or nationwide worker coverage.",
    "expect": [
      "Central Fund",
      "2028",
      "pilot"
    ]
  },
  {
    "key": "B9",
    "url": "https://bfi.uchicago.edu/wp-content/uploads/2025/11/BFI_WP_2025-140.pdf",
    "title": "Fast Action for Floods: RCT Evidence on Forecast-based Cash Transfers from Bangladesh and Nepal",
    "by": "Christian et al.",
    "year": 2025,
    "type": "Working paper",
    "where": "Bangladesh and Nepal",
    "finding": "Randomised timing evidence reports early food-security and psychosocial benefits; several later economic outcomes have no statistically significant effect.",
    "limit": "Working paper; flood evidence does not establish heat effects, and some recovery outcomes were not observable in every round.",
    "expect": [
      "Bangladesh",
      "Nepal",
      "borrowing"
    ]
  },
  {
    "key": "B10",
    "url": "https://www.worldbank.org/en/news/press-release/2025/09/16/bangladesh-faces-health-and-economic-risks-from-rising-temperature-world-bank",
    "title": "Bangladesh Faces Health and Economic Risks from Rising Temperature: World Bank",
    "by": "World Bank",
    "year": 2025,
    "type": "Agency report",
    "where": "Bangladesh",
    "finding": "The release describes a two-round 2024 survey of more than 16,000 people and reports health and productivity burdens.",
    "limit": "Only the release was read for this item; the full report methods and national extrapolation were not verified.",
    "expect": [
      "2024",
      "16,000",
      "productivity"
    ]
  },
  {
    "key": "B11",
    "url": "https://go-api.ifrc.org/api/downloadfile/91752/EAP2024BD07_MDRBD038",
    "title": "EARLY ACTION PROTOCOL SUMMARY: Bangladesh | Cold Wave",
    "by": "International Federation of Red Cross and Red Crescent Societies",
    "year": 2025,
    "type": "Agency report",
    "where": "Bangladesh",
    "finding": "The delivery discussion describes post-office electronic money transfer and mobile money, including Nagad payments under the 2024 heatwave protocol.",
    "limit": "This is a cold-wave protocol; its trigger and benefit rules are not heat rules.",
    "expect": [
      "Nagad",
      "EMTS",
      "Heatwave"
    ]
  },
  {
    "key": "B12",
    "url": "https://bilsbd.org/news/bils-calls-to-include-informal-sector-in-the-employment-injury-scheme/",
    "title": "BILS calls to include informal sector in the Employment Injury Scheme",
    "by": "Bangladesh Institute of Labour Studies",
    "year": 2026,
    "type": "Agency report",
    "where": "Bangladesh",
    "finding": "An organisational report describes advocacy for informal-worker inclusion.",
    "limit": "Self-reported activity; no independent entitlement-navigation or heat-outcome evaluation was read.",
    "expect": [
      "informal",
      "Employment Injury Scheme",
      "2026"
    ]
  },
  {
    "key": "B13",
    "url": "https://www.haqdarshak.com/",
    "title": "Haqdarshak",
    "by": "Haqdarshak",
    "year": null,
    "type": "Agency report",
    "where": "India; Bangladesh operation not verified",
    "finding": "The organisation describes trained field staff and agents providing in-person facilitation with a digital platform.",
    "limit": "Own website; no verified Bangladesh service presence or independent Bangladesh evaluation was found.",
    "expect": [
      "trained field staff",
      "Haqdarshak agents",
      "Application"
    ]
  },
  {
    "key": "B14",
    "url": "https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels?tab=overview",
    "title": "ERA5 hourly data on single levels from 1940 to present",
    "by": "Copernicus Climate Change Service / ECMWF",
    "year": 2026,
    "type": "Agency report",
    "where": "Global",
    "finding": "Hourly reanalysis on a 0.25 degree atmospheric grid; daily updates with about five days of latency.",
    "limit": "Reanalysis combines observations and a model; it is not household exposure measurement.",
    "expect": [
      "0.25",
      "GRIB",
      "CC-BY"
    ]
  },
  {
    "key": "B15",
    "url": "https://www.geoboundaries.org/api/current/gbOpen/BGD/ADM1/",
    "title": "geoBoundaries gbOpen BGD ADM1 API metadata",
    "by": "geoBoundaries",
    "year": 2023,
    "type": "Agency report",
    "where": "Bangladesh",
    "finding": "Metadata identifies eight division geometries with boundary year 2015 and source licence CC0 Public Domain.",
    "limit": "Metadata was read; a spatial join and boundary-name crosswalk were not tested.",
    "expect": [
      "BGD",
      "ADM1",
      "CC0"
    ]
  }
]
```
## K. WHAT I COULD NOT VERIFY

- Current DSS and Department of Women Affairs operational pages could not be reliably opened. Current benefit amounts use the 2026-27 budget and CPD analysis; application checklists, observed delays and portability remain unverified. The old-age income threshold was not published here because accessible material and current leads differed. [B1, B2]
- The SSK evaluation was opened through the university full-text mirror. A current government SSK page did not open, so historical benefit terms are not presented as a verified 2026 package. [B7]
- The Save the Children resource titled Post-impact Assessment on the Impact of Early Action for Drought and Heatwave was opened at its catalogue page. Its linked report did not yield readable full text, so no effects or sample figures are used.
- The World Bank heat release was read, but the full heat report was not verified. National lost-work-day and economic-loss headlines are omitted because extrapolation methods were not checked. [B10]
- No independent Bangladesh evaluation of Haqdarshak was opened, and its website does not establish local operation. The India JSW assessment link returned an error in this run; it supplies no evidence here. [B13]
- Common service centre, self-help group, microfinance, legal aid and paralegal routes were tested as search leads, but current scheme-specific assistance and independent outcome evidence were not verified. They are not filled with assumed organisations.
- A construction-worker welfare-fund entitlement, government-linked heat crop insurance, and a standing heat anticipatory cash entitlement could not be confirmed from opened current rules. Humanitarian cash is listed as a delivery route and evidence item, not a public scheme. [B5, B6, B8]
- Census and HIES are freely readable, but their open reuse licences and shared place codes were not verified. No download, current boundary reconciliation or completed join is claimed. [B3, B4, B15]
- The source type vocabulary has no separate operational update or organisational webpage category. Those items use Agency report with self-report limits; this does not convert them into independent evaluations.
- Thirteen scheme records are included, with SSK explicitly held as unclear. The four evidence items include contextual health and flood evidence; this is not a set of four demonstrated heat-protection effects.
