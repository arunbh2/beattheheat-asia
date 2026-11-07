# Common Shade: Nepal - heat and social protection

Research and Claude Code design handoff. Evidence checked on 6 November 2026.

This is a source-backed research catalogue and a design brief. It is not a completed geospatial dataset, an eligibility checker, or a guarantee of benefits.

For Claude Code: preserve sections A-K and parse the seven fenced JSON arrays independently. Use the existing Common Shade design system if the repository contains one; the repository was not inspected for this research.

Build an aggregate place explorer with a map, accessible table, scheme drawer, access-ladder view, and source drawer. Show the year, population denominator, benefit period, evidence grade, and source beside each value.

Use separate labels for published entitlement, budget target, enrolment, reported receipt, and evaluated outcome. Keep unknown values empty with an explanation; use a separate pattern for missing data rather than the colour for zero.

Treat countrywide schemes as an availability overlay, not a coverage score. Keep historical evaluations and pilots visibly separate from current public entitlements; no household-level information enters the product.

Publication gate: unresolved 2026 rules, unclear licences, unparsed downloads, and untested joins remain visible in a research panel until checked. No live data download, boundary join, or application test was completed in this run.

The evidence grades apply to claims: KNOWN is official, measured, or peer-reviewed; INFERRED covers models, projections, and second-hand estimates; UNCERTAIN covers single, unreplicated, or contested findings. A measured single study can carry a KNOWN descriptive finding while its wider interpretation remains UNCERTAIN.

The requested schema uses state for the first administrative level. Here it means province; it is not a claim that the country uses states.

## A. SUMMARY

- KNOWN: Nepal has categorical allowances, public health insurance, a free basic-care framework, contributory social security and an updated employment programme. Allowance categories are strands of one system, not separate independent institutions. [N1, N4, N6, N9, N10]
- KNOWN: survey evidence measures pre-launch awareness and reported insurance enrolment, but it does not link current eligibility to timely receipt for heat-exposed groups. The largest access-ladder gap is the missing connected process measure. [N5, N8]
- UNCERTAIN current rule: official allowance pages and an agency budget brief differ on the general old-age threshold. The child allowance also has a budget-announced change whose receipt was not verified. [N1, N2, N3]
- KNOWN plan: a November 2025 urban heatwave protocol identifies cash and delivery routes. No completed causal heat-transfer outcome evaluation was verified in this search. [N12]
- INFERRED map design: ERA5 plus openly licensed province geometry supports exposure context, with a newly authored public-system availability layer. Census and insurance layers have additional access, licence and join checks. [N14, N15, N16, N5]
- Evidence is thin on heat-related paid claims, informal-worker wage replacement, migrant access and household debt or asset recovery. Flood cash evidence offers a study design, rather than a demonstrated heat effect. [N6, N12, N13]
## B. SCHEMES

```json
[
  {
    "id": "oldage",
    "country": "Nepal",
    "level": "national",
    "name": "Social Security Allowance: general older citizens",
    "type": "pension",
    "run_by": "Government of Nepal / local governments",
    "who": "Age threshold unresolved: official page 70; UNICEF FY2024/25 table 68.",
    "gives": "NPR 4,000 monthly.",
    "delivery": "Ward registration and bank payment.",
    "documents": "Citizenship and application; current age and identity requirements need reconciliation.",
    "portable": "partly",
    "speed": "FAQ: eligibility starts the month after verification and system entry; observed bank-payment delay unknown.",
    "shock_responsive": "no",
    "heat_relevance": "INFERRED: regular cash can support hot-season consumption; no automatic heat top-up was verified.",
    "status": "unclear (as of 2026)",
    "grade": "UNCERTAIN",
    "sources": [
      "N1",
      "N2"
    ]
  },
  {
    "id": "specifiedoldage",
    "country": "Nepal",
    "level": "national",
    "name": "Social Security Allowance: Dalit and specified-area older citizens",
    "type": "pension",
    "run_by": "Government of Nepal / local governments",
    "who": "Specified Dalit and former Karnali-district categories aged 60+.",
    "gives": "NPR 2,660 monthly.",
    "delivery": "Ward registration and bank payment.",
    "documents": "Citizenship and application; category verification applies.",
    "portable": "partly",
    "speed": "FAQ: eligibility starts the month after verification and system entry; observed bank-payment delay unknown.",
    "shock_responsive": "no",
    "heat_relevance": "INFERRED: regular cash can support hot-season consumption; no automatic heat top-up was verified.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "N1",
      "N2"
    ]
  },
  {
    "id": "singlewomen",
    "country": "Nepal",
    "level": "national",
    "name": "Social Security Allowance: single women",
    "type": "cash",
    "run_by": "Government of Nepal / local governments",
    "who": "Specified single-women categories aged 60+.",
    "gives": "NPR 2,660 monthly.",
    "delivery": "Ward registration and bank payment.",
    "documents": "Citizenship and relevant marital-status evidence.",
    "portable": "partly",
    "speed": "FAQ: eligibility starts the month after verification and system entry; observed bank-payment delay unknown.",
    "shock_responsive": "no",
    "heat_relevance": "INFERRED: regular cash can support hot-season consumption; no automatic heat top-up was verified.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "N1",
      "N2"
    ]
  },
  {
    "id": "widows",
    "country": "Nepal",
    "level": "national",
    "name": "Social Security Allowance: widows",
    "type": "cash",
    "run_by": "Government of Nepal / local governments",
    "who": "Widowed women; FAQ has no age minimum for this category.",
    "gives": "NPR 2,660 monthly.",
    "delivery": "Ward registration and bank payment.",
    "documents": "Citizenship and spouse death registration.",
    "portable": "partly",
    "speed": "FAQ: eligibility starts the month after verification and system entry; observed bank-payment delay unknown.",
    "shock_responsive": "no",
    "heat_relevance": "INFERRED: regular cash can support hot-season consumption; no automatic heat top-up was verified.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "N1",
      "N2"
    ]
  },
  {
    "id": "disabilitya",
    "country": "Nepal",
    "level": "national",
    "name": "Social Security Allowance: complete disability",
    "type": "cash",
    "run_by": "Government of Nepal / local governments",
    "who": "Class A red-card category.",
    "gives": "NPR 3,990 monthly.",
    "delivery": "Ward registration and bank payment.",
    "documents": "Disability card; citizenship or birth registration as applicable.",
    "portable": "partly",
    "speed": "FAQ: eligibility starts the month after verification and system entry; observed bank-payment delay unknown.",
    "shock_responsive": "no",
    "heat_relevance": "INFERRED: regular cash can support hot-season consumption; no automatic heat top-up was verified.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "N1",
      "N2"
    ]
  },
  {
    "id": "disabilityb",
    "country": "Nepal",
    "level": "national",
    "name": "Social Security Allowance: severe disability",
    "type": "cash",
    "run_by": "Government of Nepal / local governments",
    "who": "Class B blue-card category.",
    "gives": "NPR 2,128 monthly.",
    "delivery": "Ward registration and bank payment.",
    "documents": "Disability card; citizenship or birth registration as applicable.",
    "portable": "partly",
    "speed": "FAQ: eligibility starts the month after verification and system entry; observed bank-payment delay unknown.",
    "shock_responsive": "no",
    "heat_relevance": "INFERRED: regular cash can support hot-season consumption; no automatic heat top-up was verified.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "N1",
      "N2"
    ]
  },
  {
    "id": "specifiedcommunities",
    "country": "Nepal",
    "level": "national",
    "name": "Social Security Allowance: endangered Indigenous nationalities",
    "type": "cash",
    "run_by": "Government of Nepal / local governments",
    "who": "Listed communities in the statutory schedule.",
    "gives": "NPR 3,990 monthly.",
    "delivery": "Ward registration and bank payment.",
    "documents": "Citizenship and category evidence; full current checklist unverified.",
    "portable": "partly",
    "speed": "FAQ: eligibility starts the month after verification and system entry; observed bank-payment delay unknown.",
    "shock_responsive": "no",
    "heat_relevance": "INFERRED: regular cash can support hot-season consumption; no automatic heat top-up was verified.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "N1",
      "N2"
    ]
  },
  {
    "id": "childgrant",
    "country": "Nepal",
    "level": "national",
    "name": "Child Nutrition Allowance",
    "type": "cash",
    "run_by": "Government of Nepal / local governments",
    "who": "Under-five children in designated areas and Dalit households; category limits apply.",
    "gives": "Official table: NPR 532 monthly; 2026/27 brief announces NPR 1,000 for Dalit children. Receipt at the revised rate not verified.",
    "delivery": "Ward registration and bank payment.",
    "documents": "Birth registration and parent or guardian citizenship.",
    "portable": "partly",
    "speed": "FAQ: eligibility starts the month after verification and system entry; observed bank-payment delay unknown.",
    "shock_responsive": "no",
    "heat_relevance": "INFERRED: regular cash can support hot-season consumption; no automatic heat top-up was verified.",
    "status": "changed (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "N1",
      "N2",
      "N3"
    ]
  },
  {
    "id": "hip",
    "country": "Nepal",
    "level": "national",
    "name": "Health Insurance Programme",
    "type": "health",
    "run_by": "Health Insurance Board",
    "who": "Enrolled households; targeted groups have premium support.",
    "gives": "2026 study describes NPR 3,500 annual premium for up to five members and NPR 100,000 service cover.",
    "delivery": "Registration assistants, contracted providers and renewal channels.",
    "documents": "Household registration and current identity checks; complete 2026 checklist not verified.",
    "portable": "partly",
    "speed": "Activation follows a registration cycle; it is not verified as immediate.",
    "shock_responsive": "partly",
    "heat_relevance": "INFERRED: covered treatment could reduce costs; current heat codes, copay exemptions and paid claims need checking.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "N4",
      "N5",
      "N22"
    ]
  },
  {
    "id": "informalssf",
    "country": "Nepal",
    "level": "national",
    "name": "Social Security Fund: informal-sector scheme",
    "type": "insurance",
    "run_by": "Social Security Fund",
    "who": "Eligible contributing informal workers under scheme rules.",
    "gives": "Published medical ceiling NPR 100,000 yearly, with contribution conditions and cost sharing; current individual offer needs confirmation.",
    "delivery": "SSF registration and contribution process.",
    "documents": "Current category-specific application checklist not verified.",
    "portable": "unknown",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "partly",
    "heat_relevance": "Heat-specific claims and wage replacement were not verified; registration does not establish benefit qualification.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "N6",
      "N7"
    ]
  },
  {
    "id": "basiccare",
    "country": "Nepal",
    "level": "national",
    "name": "Free basic health services under the Public Health Service Act",
    "type": "health",
    "run_by": "Ministry of Health and Population / public providers",
    "who": "Citizens under the statutory basic-service framework.",
    "gives": "Free basic services; emergency access does not make all emergency costs free.",
    "delivery": "Public-service facilities and emergency pathways.",
    "documents": "Current application checklist not verified.",
    "portable": "partly",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "partly",
    "heat_relevance": "Basic care may meet some heat-related needs; service-list and facility-level coverage were not checked.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "N9"
    ]
  },
  {
    "id": "employment",
    "country": "Nepal",
    "level": "national",
    "name": "National Employment Promotion Programme",
    "type": "public-works",
    "run_by": "Government of Nepal employment programme / local governments",
    "who": "Current programme criteria; individual eligibility not fully verified.",
    "gives": "Employment and skills support; current wage and workday entitlement unverified.",
    "delivery": "Programme and local implementation arrangements.",
    "documents": "Current application checklist not verified.",
    "portable": "unknown",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "unknown",
    "heat_relevance": "INFERRED: work can support income; safe scheduling and heat-related lost-day replacement were not verified.",
    "status": "changed (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "N10"
    ]
  },
  {
    "id": "agriinsurance",
    "country": "Nepal",
    "level": "national",
    "name": "Government premium support for agricultural insurance",
    "type": "insurance",
    "run_by": "Government of Nepal / agricultural insurance institutions",
    "who": "Eligible insured crop or livestock activity; current category rules not verified.",
    "gives": "2026 financing strategy describes up to 80 percent premium support; current implementation terms unverified.",
    "delivery": "Insurance policy channel; exact current application route not verified.",
    "documents": "Current application checklist not verified.",
    "portable": "unknown",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "unknown",
    "heat_relevance": "A premium subsidy does not establish that a heat loss is insured or that a payout will arrive.",
    "status": "unclear (as of 2026)",
    "grade": "UNCERTAIN",
    "sources": [
      "N20",
      "N21"
    ]
  }
]
```
## C. ACCESS LADDER

```json
[
  {
    "scheme": "informalssf",
    "group": "Informal workers in the urban parental-benefits survey",
    "step": "aware",
    "finding": "2023, before informal-sector launch: 9 percent knew of SSF.",
    "grade": "KNOWN",
    "limit": "Urban sample with a parental-benefits focus; pre-launch awareness is not current national awareness.",
    "sources": [
      "N8"
    ]
  },
  {
    "scheme": "informalssf",
    "group": "Women informal workers in the same survey",
    "step": "aware",
    "finding": "2023: 7 percent of women knew of SSF.",
    "grade": "KNOWN",
    "limit": "Same pre-launch and urban-sample limits.",
    "sources": [
      "N8"
    ]
  },
  {
    "scheme": "informalssf",
    "group": "Men informal workers in the same survey",
    "step": "aware",
    "finding": "2023: 15 percent of men knew of SSF.",
    "grade": "KNOWN",
    "limit": "Same pre-launch and urban-sample limits.",
    "sources": [
      "N8"
    ]
  },
  {
    "scheme": "parentalbenefits",
    "group": "Informal parents in the same survey",
    "step": "received",
    "finding": "2023 survey: only 6 percent of informal parents received cash benefits at the last birth.",
    "grade": "KNOWN",
    "limit": "Not heat support or current SSF receipt; childbirth may predate the survey.",
    "sources": [
      "N8"
    ]
  },
  {
    "scheme": "anyhealthinsurance",
    "group": "Men aged 15-49",
    "step": "enrolled",
    "finding": "NDHS 2022 secondary analysis: 13.3% reported health insurance.",
    "grade": "KNOWN",
    "limit": "Any reported health insurance, not HIP alone; older people and children are outside this age denominator.",
    "sources": [
      "N5"
    ]
  },
  {
    "scheme": "anyhealthinsurance",
    "group": "Women aged 15-49",
    "step": "enrolled",
    "finding": "NDHS 2022 secondary analysis: 12.0% reported health insurance.",
    "grade": "KNOWN",
    "limit": "Cross-sectional survey; not verified use, claim payment, adequacy or current enrolment.",
    "sources": [
      "N5"
    ]
  },
  {
    "scheme": "informalssf",
    "group": "Informal and self-employed workers",
    "step": "enrolled",
    "finding": "ILO report dated 24 December 2025: about 1500 informal and self-employed registrants.",
    "grade": "INFERRED",
    "limit": "Mixed informal and self-employed categories; no eligible population or benefit-receipt denominator.",
    "sources": [
      "N7"
    ]
  }
]
```

No linked current eligible, documented, applied, received, adequate or on-time series was verified for the heat-exposed groups. The parental-benefit receipt row is contextual and not a current SSF effect; anyhealthinsurance is a survey concept rather than a scheme id. Other missing steps remain unknown rather than zero.
## D. HEAT AND SOCIAL PROTECTION EVIDENCE

```json
[
  {
    "by": "Sharma et al., 2025",
    "title": "Exploring outdoor workers’ knowledge, attitudes, practices, and perceived risks of heatwaves in Nepal",
    "url": "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0329557",
    "type": "Peer-reviewed study",
    "where": "Eight districts in five provinces",
    "scale": "356 outdoor workers and 11 focus groups",
    "finding": "KNOWN descriptive result: 43% had heard of heatwaves. This maps a communication gap among exposed workers; it does not estimate a social-protection effect.",
    "effect": "unclear",
    "limit": "Selected locations, cross-sectional design and self-reported experiences limit generalisation and causality.",
    "sources": [
      "N11"
    ]
  },
  {
    "by": "IFRC / Nepal Red Cross Society, 2025",
    "title": "Simplified Early Action Protocol: Nepal | Urban Heatwave",
    "url": "https://go-api.ifrc.org/api/downloadfile/93851/sEAP2025NP02_MDRNP020",
    "type": "Agency report",
    "where": "Biratnagar, Nepalgunj, Dhangadi and Siddharthanagar",
    "scale": "Plan for 1,200 households and a three-day forecast lead time",
    "finding": "KNOWN approved plan: an urban heatwave protocol sets out cash and support activities. It supplies a possible route, with no completed impact result in the document read.",
    "effect": "unclear",
    "limit": "Protocol approval is not activation, receipt, a standing public entitlement or an evaluation.",
    "sources": [
      "N12"
    ]
  },
  {
    "by": "Christian et al., 2025",
    "title": "Fast Action for Floods: RCT Evidence on Forecast-based Cash Transfers from Bangladesh and Nepal",
    "url": "https://bfi.uchicago.edu/wp-content/uploads/2025/11/BFI_WP_2025-140.pdf",
    "type": "Evaluation",
    "where": "Nepal and Bangladesh",
    "scale": "Randomised flood-related cash timing; country and survey-round samples differ",
    "finding": "KNOWN trial findings, with heat applicability INFERRED: some early food-security and psychosocial outcomes improved. Later borrowing, savings and asset effects were not statistically significant.",
    "effect": "mixed",
    "limit": "Working paper and flood evidence; no statistically significant estimate does not establish zero effect, and it does not establish a heat effect.",
    "sources": [
      "N13"
    ]
  }
]
```
## E. DELIVERY ROUTES AND ORGANISATIONS

```json
[
  {
    "id": "wards",
    "name": "Ward offices and local governments",
    "kind": "government",
    "does": "Receive allowance applications, check documents and maintain registration and transfer processes.",
    "where": "Nepal",
    "reach_reported": "No comparable 2026 application-to-receipt count extracted.",
    "reach_independent": "",
    "evaluations": "",
    "url": "https://www.donidcr.gov.np/pages/mostly-asked-questions--social-security-4/",
    "sources": [
      "N1"
    ]
  },
  {
    "id": "banks",
    "name": "Banks participating in social allowance payment",
    "kind": "financial",
    "does": "Provide allowance accounts and collection; FAQ describes arrangements for people needing assistance.",
    "where": "Nepal",
    "reach_reported": "No measured heat-season collection or delay total extracted.",
    "reach_independent": "",
    "evaluations": "",
    "url": "https://www.donidcr.gov.np/pages/mostly-asked-questions--social-security-4/",
    "sources": [
      "N1"
    ]
  },
  {
    "id": "hibassistants",
    "name": "Health Insurance Board registration assistants",
    "kind": "government",
    "does": "Help households enrol through ward-level and household contact routes.",
    "where": "Nepal",
    "reach_reported": "No verified assisted-enrolment or heat-claim outcome count extracted.",
    "reach_independent": "",
    "evaluations": "",
    "url": "https://hib.gov.np/faq/",
    "sources": [
      "N4"
    ]
  },
  {
    "id": "nrcs",
    "name": "Nepal Red Cross Society",
    "kind": "civil society",
    "does": "The heatwave protocol assigns volunteer support and cash-delivery tasks.",
    "where": "Four protocol municipalities",
    "reach_reported": "Plan: 1,200 households; not a confirmed receipt count.",
    "reach_independent": "",
    "evaluations": "",
    "url": "https://go-api.ifrc.org/api/downloadfile/93851/sEAP2025NP02_MDRNP020",
    "sources": [
      "N12"
    ]
  },
  {
    "id": "fchv",
    "name": "Female Community Health Volunteers",
    "kind": "government",
    "does": "The heat protocol includes household contact through frontline volunteers.",
    "where": "Protocol locations",
    "reach_reported": "Planned activity only; delivered reach not verified.",
    "reach_independent": "",
    "evaluations": "",
    "url": "https://go-api.ifrc.org/api/downloadfile/93851/sEAP2025NP02_MDRNP020",
    "sources": [
      "N12"
    ]
  },
  {
    "id": "savethechildren",
    "name": "Save the Children",
    "kind": "civil society",
    "does": "Publishes a local-government allowance-access guidance catalogue.",
    "where": "Nepal",
    "reach_reported": "No independently verified navigation outcome count extracted.",
    "reach_independent": "",
    "evaluations": "",
    "url": "https://resourcecentre.savethechildren.net/document/ensuring-access-to-social-security-allowances-in-nepal-guidance-for-local-governments-on-developing-and-implementing-a-standard-operating-procedure",
    "sources": [
      "N18"
    ]
  },
  {
    "id": "ssf",
    "name": "Social Security Fund",
    "kind": "government",
    "does": "Operates the contributory route and participates in informal-worker outreach.",
    "where": "Nepal",
    "reach_reported": "ILO report, 24 December 2025: about 1500 informal and self-employed registrations.",
    "reach_independent": "",
    "evaluations": "",
    "url": "https://www.ssf.gov.np/list/operating-schemes/informal-sector-scheme",
    "sources": [
      "N6",
      "N7"
    ]
  },
  {
    "id": "haqdarshak",
    "name": "Haqdarshak",
    "kind": "social enterprise",
    "does": "Own materials describe agent-based and digital help to discover and claim schemes.",
    "where": "India in verified materials; Nepal operation not verified.",
    "reach_reported": "No Nepal reach verified.",
    "reach_independent": "",
    "evaluations": "",
    "url": "https://www.haqdarshak.com/",
    "sources": [
      "N19"
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
    "place_code": "Grid coordinates; spatial overlay with versioned province geometry",
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
    "id": "olderpeople",
    "layer": "vulnerability",
    "indicator": "Population aged 65 and over",
    "definition": "Proposed sum of five-year age groups from census Individual Table 04, divided by total population. This is a demographic measure, not an allowance eligibility threshold.",
    "unit": "percent of population",
    "unit_of_place": "state",
    "year": 2021,
    "publisher": "National Statistics Office",
    "url": "https://censusresults.nsonepal.gov.np/downloads/census-dataset",
    "licence": "Open reuse licence not verified",
    "access": "open download",
    "format": "CSV",
    "update": "Census cycle",
    "place_code": "CSV code field not inspected; no shared code verified",
    "limit": "Catalogue is open, but CSV payload and smallest published unit were not parsed. Province aggregation is proposed, not a verified output. [N14]"
  },
  {
    "id": "disability",
    "layer": "vulnerability",
    "indicator": "Population by type of disability",
    "definition": "Census Individual Table 16 uses age group and disability type; preserve the census classification and denominator.",
    "unit": "persons and percent",
    "unit_of_place": "state",
    "year": 2021,
    "publisher": "National Statistics Office",
    "url": "https://censusresults.nsonepal.gov.np/downloads/census-dataset",
    "licence": "Not verified",
    "access": "open download",
    "format": "CSV",
    "update": "Census cycle",
    "place_code": "Code field not inspected",
    "limit": "Catalogue confirms the table, not the header, geographic grain or benefit eligibility. [N14]"
  },
  {
    "id": "rooftype",
    "layer": "vulnerability",
    "indicator": "Households by roof material",
    "definition": "Census Household Table 04 groups households by roof type; show categories rather than assign a universal heat-risk weight.",
    "unit": "percent of households",
    "unit_of_place": "state",
    "year": 2021,
    "publisher": "National Statistics Office",
    "url": "https://censusresults.nsonepal.gov.np/downloads/census-dataset",
    "licence": "Not verified",
    "access": "open download",
    "format": "CSV",
    "update": "Census cycle",
    "place_code": "Same catalogue; shared headers not verified",
    "limit": "Material alone does not measure indoor temperature, shading, ventilation or tenure; smallest CSV unit unverified. [N14]"
  },
  {
    "id": "insurance",
    "layer": "coverage",
    "indicator": "Health insurance reported by adults aged 15-49",
    "definition": "NDHS 2022 secondary analysis, disaggregated by sex and province where reported; any insurance, not only public HIP.",
    "unit": "percent of surveyed adults",
    "unit_of_place": "state",
    "year": 2022,
    "publisher": "Discover Public Health analysis of NDHS",
    "url": "https://link.springer.com/article/10.1186/s12982-026-01734-3",
    "licence": "Article open access; underlying survey microdata have separate access terms",
    "access": "open download",
    "format": "other",
    "update": "Survey or research update",
    "place_code": "Province names in study; no official code crosswalk validated",
    "limit": "Province structure and associations were read; province percentage table is not a prepared map extract. No paid-claim or effective-care measure. [N5]"
  },
  {
    "id": "hipavailable",
    "layer": "system",
    "indicator": "Health Insurance Programme terms",
    "definition": "Published household contribution and service-limit facts; national availability can be repeated on province geometries with clear caveats.",
    "unit": "NPR/year",
    "unit_of_place": "state",
    "year": 2026,
    "publisher": "Health Insurance Board; 2026 study",
    "url": "https://link.springer.com/article/10.1186/s12982-026-01734-3",
    "licence": "Create a newly authored factual table with attribution; source reuse terms are separate",
    "access": "open download",
    "format": "other",
    "update": "Policy revision",
    "place_code": "Curated province crosswalk; not a beneficiary registry code",
    "limit": "Current benefit-package amendment exists; heat-specific codes and practical service access remain unverified. [N4, N5, N22]"
  },
  {
    "id": "childrate",
    "layer": "system",
    "indicator": "Child Nutrition Allowance published terms",
    "definition": "Show legacy official rate and the announced Dalit-child revision in separate fields; do not apply the revised rate to all children.",
    "unit": "NPR/child/month",
    "unit_of_place": "state",
    "year": 2026,
    "publisher": "UNICEF and Government of Nepal",
    "url": "https://www.unicef.org/nepal/media/31216/file/Federal%20Budget%20Brief-2026_UNICEF_Web%20Version.pdf.pdf",
    "licence": "Report licence not verified; record factual terms with attribution",
    "access": "open download",
    "format": "PDF",
    "update": "Budget or rule revision",
    "place_code": "Province crosswalk is insufficient for district-specific eligibility; hold finer availability",
    "limit": "Programme categories differ geographically; revised-rate receipt is unverified. [N1, N3]"
  }
]
```
## G. A MINIMUM VIABLE MAP

A strict open-data first version can use two substantive layers at province level: derived 2025 ERA5 hot-day counts and a newly authored national Health Insurance Programme availability-and-terms table. The map labels the first as modelled exposure and the second as public-system availability, with current heat-package details held for checking. [N16, N4, N5, N22]

The geometry scaffold is the opened geoBoundaries NPL ADM1 metadata for seven provinces, boundary year 2020. It reports a Creative Commons Attribution 3.0 IGO source licence; retain that attribution and the release metadata with downloaded geometry. Spatial aggregation of grid values supplies the exposure join. [N15, N16]

No shared official code was verified among the geometry, census CSV files and insurance study. A documented country-and-province crosswalk, with province-name history and one-to-one checks, is preferable to an invisible fuzzy match. The CSV catalogue was found, but its payload and code fields were not parsed. [N14, N15, N5]

An optional third layer can show older-population share after census CSV geography, denominator and reuse terms are checked. A coverage extension can use published provincial insurance estimates only after transcribing the actual table and preserving sex and age denominators; it is not a ready-to-import extraction in this file. [N14, N5]

This proposal uses actual located sources, but no map data were downloaded or joined. The project can release its own factual availability table under an open licence; the underlying reports retain their own rights.

It cannot show who is eligible today for a disputed rule, who has completed qualifying contributions, whether heat treatment was paid, or whether households received help before lost work. Mountains, valleys and urban surfaces differ within provinces, and province averages do not represent a worker's exposure. [N1, N6, N16]

Low enrolment can reflect several access steps, population composition and insurance definitions; high enrolment does not establish effective treatment or adequate support. No composite protection score, household dots or ranking is proposed. [N5]
## H. WHERE NO SYSTEM RESPONDS

- Heat-related lost work among informal and outdoor workers: no automatic nationwide public wage-replacement pathway was verified; contributory schemes have their own conditions. [N6, N10]
- Heat-related medical bills: free basic services and health insurance may meet some needs, but universal free emergency treatment or a paid heat-claims pathway was not established. [N4, N9, N22]
- Migrant continuity: the allowance FAQ provides an administrative transfer route after a documented move; that is different from seamless access for seasonal workers away from permanent residence. [N1]
- Agricultural heat loss: premium support was described, but current heat-loss definitions, claims timelines and tenant-farmer access were not verified. [N21]
- Heat anticipatory cash: the urban protocol concerns selected places and planned households; it does not establish a standing nationwide public payment. [N12]
- Debt and asset recovery after heat: no completed heat social-protection impact evaluation was read. Statistically non-significant later flood outcomes are not a heat null result. [N13]
## I. OPEN QUESTIONS

```json
[
  {
    "id": "heatcash",
    "q": "Does pre-heat cash reduce lost earnings and medical spending for outdoor-worker households?",
    "have": "An urban heat protocol exists without a completed impact evaluation in the sources read. [N12]",
    "could": "Randomised or pre-specified phased delivery across comparable neighbourhoods, recording timing, income, care and coping costs in aggregate.",
    "scale": "Illustrative design: 40-60 clusters over two hot seasons; power calculation before final sampling."
  },
  {
    "id": "ssfaccess",
    "q": "Which step limits qualifying SSF access among informal workers?",
    "have": "Pre-launch awareness data and later registration reports describe different periods. [N7, N8]",
    "could": "Follow a representative cohort from information through contribution qualification and benefit receipt, with anonymised aggregate reporting.",
    "scale": "Illustrative design: 1,500-2,000 workers across several municipalities."
  },
  {
    "id": "heatclaims",
    "q": "How often does public insurance meet the full cost of heat-related care?",
    "have": "Enrolment is measured; current heat-specific claims and complete costs are not. [N4, N5, N22]",
    "could": "Prospective facility and household cost study with diagnosed heat cases, matched service records under consent, and published aggregate results only.",
    "scale": "Illustrative design: 10-15 facilities across a hot season; case-volume check before sizing."
  },
  {
    "id": "seasonalmigration",
    "q": "Does a supported transfer process reduce allowance interruption after migration?",
    "have": "A documented allowance transfer route exists; actual seasonal continuity was not measured. [N1]",
    "could": "Phased assistance through wards, comparing aggregate transfer completion, payment interruption and travel cost.",
    "scale": "Illustrative design: 20-30 ward pairs over one renewal and payment cycle."
  }
]
```
## J. SOURCES

```json
[
  {
    "key": "N1",
    "url": "https://www.donidcr.gov.np/pages/mostly-asked-questions--social-security-4/",
    "title": "प्राय सोधिने प्रश्नहरु : सामाजिक सुरक्षा",
    "by": "Department of National ID and Civil Registration",
    "year": null,
    "type": "Government page",
    "where": "Nepal",
    "finding": "FAQ gives allowance categories, ward applications, documents, bank collection and migration-transfer procedures.",
    "limit": "The general old-age age of 70 differs from the UNICEF budget brief table reporting 68; current eligibility is held for reconciliation.",
    "expect": [
      "सामाजिक सुरक्षा",
      "४०००",
      "बसाइँ"
    ]
  },
  {
    "key": "N2",
    "url": "https://donidcr.gov.np/pages/social-security-allowance-rate/",
    "title": "Social Security Allowance Rate",
    "by": "Department of National ID and Civil Registration",
    "year": null,
    "type": "Government page",
    "where": "Nepal",
    "finding": "Published rate table distinguishes age, disability, women, child and specified community categories.",
    "limit": "Undated webpage; current old-age threshold and child-rate changes need operational confirmation.",
    "expect": [
      "Social Security Allowance Rate",
      "४०००",
      "५३२"
    ]
  },
  {
    "key": "N3",
    "url": "https://www.unicef.org/nepal/media/31216/file/Federal%20Budget%20Brief-2026_UNICEF_Web%20Version.pdf.pdf",
    "title": "Nepal Federal Budget Brief: Fiscal Year 2026/27 (2083/84 B.S.)",
    "by": "UNICEF Nepal",
    "year": 2026,
    "type": "Agency report",
    "where": "Nepal",
    "finding": "Table 3 reports 3,806,634 beneficiaries for FY2024/25; the brief discusses a 2026/27 Dalit child allowance increase to NPR 1,000.",
    "limit": "Administrative counts are reported from another institution; budget changes do not prove current household receipt.",
    "expect": [
      "3,806,634",
      "1,000",
      "Table 3"
    ]
  },
  {
    "key": "N4",
    "url": "https://hib.gov.np/faq/",
    "title": "बारम्बार सोधिने प्रश्नहरू",
    "by": "Health Insurance Board",
    "year": null,
    "type": "Government page",
    "where": "Nepal",
    "finding": "FAQ describes registration assistance, renewal, referral and emergency arrangements and copayment exceptions.",
    "limit": "No heat-specific paid-claims series or measured service timeliness is provided in the page read.",
    "expect": [
      "बीमा",
      "नवीकरण",
      "१०"
    ]
  },
  {
    "key": "N5",
    "url": "https://link.springer.com/article/10.1186/s12982-026-01734-3",
    "title": "Status of health insurance enrolment in Nepal and way forward for policy reform",
    "by": "Discover Public Health",
    "year": 2026,
    "type": "Peer-reviewed study",
    "where": "Nepal",
    "finding": "NDHS 2022 secondary analysis reports health insurance among 13.3% of men and 12.0% of women aged 15-49.",
    "limit": "Cross-sectional secondary analysis; causes of non-enrolment and dropout were not directly measured.",
    "expect": [
      "13.3%",
      "12.0%",
      "NDHS 2022"
    ]
  },
  {
    "key": "N6",
    "url": "https://www.ssf.gov.np/list/operating-schemes/informal-sector-scheme",
    "title": "अनौपचारिक क्षेत्र सामाजिक सुरक्षा योजना",
    "by": "Social Security Fund",
    "year": null,
    "type": "Government page",
    "where": "Nepal",
    "finding": "The official page links the informal-sector social-security scheme document. Its medical benefit requires qualifying prior contributions.",
    "limit": "Rules and contribution requirements do not establish effective receipt; no heat-specific claim pathway was verified.",
    "expect": [
      "अनौपचारिक",
      "सामाजिक सुरक्षा",
      "योजना"
    ]
  },
  {
    "key": "N7",
    "url": "https://www.ilo.org/resource/news/nepal-launches-national-campaign-bring-informal-workers-social-security",
    "title": "Nepal launches national campaign to bring informal workers into social security",
    "by": "International Labour Organization",
    "year": 2025,
    "type": "Agency report",
    "where": "Nepal",
    "finding": "ILO reports approximately 1,500 informal and self-employed registrants within a much larger SSF registration total.",
    "limit": "Published 24 December 2025; the registration count has no qualifying-benefit or receipt denominator.",
    "expect": [
      "informal",
      "1500",
      "social security"
    ]
  },
  {
    "key": "N8",
    "url": "https://documents1.worldbank.org/curated/en/099021925113581657/pdf/P1766171d407e20f21adde1ba735b9a8b83.pdf",
    "title": "De Jure and De Facto Coverage of Parental Benefits in Nepal",
    "by": "World Bank",
    "year": 2025,
    "type": "Working paper",
    "where": "Urban Nepal",
    "finding": "Before the August 2023 informal-sector launch, 9 percent of informal workers knew of SSF; 7 percent of women and 15 percent of men did.",
    "limit": "Urban parental-benefit survey conducted before launch; not current nationwide awareness or a heat study.",
    "expect": [
      "9 percent",
      "7 percent",
      "2023"
    ]
  },
  {
    "key": "N9",
    "url": "https://hmis.gov.np/media/20/02_The-Public-Health-Service-Act-2075-2018.pdf",
    "title": "The Public Health Service Act, 2075 (2018)",
    "by": "Nepal Law Commission",
    "year": 2018,
    "type": "Government page",
    "where": "Nepal",
    "finding": "Provides a legal framework for free basic care and emergency access; emergency costs are not universally waived.",
    "limit": "The law establishes rights and financing rules, not measured availability, quality or paid heat claims.",
    "expect": [
      "basic health",
      "emergency",
      "2018"
    ]
  },
  {
    "key": "N10",
    "url": "https://nepp.gov.np/nepp-introduction",
    "title": "कार्यक्रम परिचय",
    "by": "National Employment Promotion Programme, Government of Nepal",
    "year": null,
    "type": "Government page",
    "where": "Nepal",
    "finding": "Current programme introduction describes employment and skills support under a newer programme framework.",
    "limit": "Current wage, guaranteed days, application checklist and payment performance were not verified.",
    "expect": [
      "रोजगार",
      "२०८२",
      "कार्यक्रम"
    ]
  },
  {
    "key": "N11",
    "url": "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0329557",
    "title": "Exploring outdoor workers’ knowledge, attitudes, practices, and perceived risks of heatwaves in Nepal",
    "by": "Sharma et al.",
    "year": 2025,
    "type": "Peer-reviewed study",
    "where": "Selected districts in Nepal",
    "finding": "Survey of 356 outdoor workers and 11 focus groups; 43% had heard of heatwaves.",
    "limit": "Selected sites, self-report and cross-sectional design limit wider and causal interpretation.",
    "expect": [
      "356",
      "43%",
      "heatwaves"
    ]
  },
  {
    "key": "N12",
    "url": "https://go-api.ifrc.org/api/downloadfile/93851/sEAP2025NP02_MDRNP020",
    "title": "Simplified Early Action Protocol: Nepal | Urban Heatwave",
    "by": "International Federation of Red Cross and Red Crescent Societies / Nepal Red Cross Society",
    "year": 2025,
    "type": "Agency report",
    "where": "Four Nepal municipalities",
    "finding": "Protocol approved 28 November 2025 plans cash for 1,200 households with a three-day lead time.",
    "limit": "An approved protocol and target are not proof of activation, receipt or improved outcomes.",
    "expect": [
      "1,200",
      "2025",
      "Heatwave"
    ]
  },
  {
    "key": "N13",
    "url": "https://bfi.uchicago.edu/wp-content/uploads/2025/11/BFI_WP_2025-140.pdf",
    "title": "Fast Action for Floods: RCT Evidence on Forecast-based Cash Transfers from Bangladesh and Nepal",
    "by": "Christian et al.",
    "year": 2025,
    "type": "Working paper",
    "where": "Bangladesh and Nepal",
    "finding": "Randomised flood-cash timing evidence reports some early benefits and later statistically non-significant economic outcomes.",
    "limit": "Working paper, different hazard; sample and outcome availability differ across rounds.",
    "expect": [
      "Nepal",
      "Bangladesh",
      "borrowing"
    ]
  },
  {
    "key": "N14",
    "url": "https://censusresults.nsonepal.gov.np/downloads/census-dataset",
    "title": "Census Dataset",
    "by": "National Statistics Office",
    "year": null,
    "type": "Government page",
    "where": "Nepal",
    "finding": "Catalogue lists downloadable 2021 census CSV tables for age, disability and roof type.",
    "limit": "Catalogue read; CSV headers and place-code domains could not be parsed in this run.",
    "expect": [
      "Census Dataset",
      "type of roof",
      "type of disability"
    ]
  },
  {
    "key": "N15",
    "url": "https://www.geoboundaries.org/api/current/gbOpen/NPL/ADM1/",
    "title": "geoBoundaries gbOpen NPL ADM1 API metadata",
    "by": "geoBoundaries",
    "year": 2023,
    "type": "Agency report",
    "where": "Nepal",
    "finding": "Metadata lists seven province geometries with boundary year 2020 and source licence Creative Commons Attribution 3.0 IGO.",
    "limit": "Geometry-to-census joins were not executed; geometry identifiers are not official census codes.",
    "expect": [
      "NPL",
      "ADM1",
      "2020"
    ]
  },
  {
    "key": "N16",
    "url": "https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels?tab=overview",
    "title": "ERA5 hourly data on single levels from 1940 to present",
    "by": "Copernicus Climate Change Service / ECMWF",
    "year": 2026,
    "type": "Agency report",
    "where": "Global",
    "finding": "Provides hourly gridded reanalysis, daily updates and a displayed CC-BY licence.",
    "limit": "Model and observation synthesis; local topography and urban microclimates are not resolved at household scale.",
    "expect": [
      "0.25",
      "GRIB",
      "CC-BY"
    ]
  },
  {
    "key": "N17",
    "url": "https://thedocs.worldbank.org/en/doc/46a4c8089e04edb210173fc3192b8526-0060072025/original/Social-Protection-Response-Annual-Report-September-2025.pdf",
    "title": "Social Protection Response (SPR) Annual Report 2024-2025",
    "by": "World Bank",
    "year": 2025,
    "type": "Agency report",
    "where": "Nepal and other programme countries",
    "finding": "Reports Nepal approval of Shock Responsive Social Protection and Relief Distribution Standards on 1 January 2025.",
    "limit": "Approval and technical support do not establish an operational 2026 heat entitlement.",
    "expect": [
      "Nepal",
      "2025",
      "Standards"
    ]
  },
  {
    "key": "N18",
    "url": "https://resourcecentre.savethechildren.net/document/ensuring-access-to-social-security-allowances-in-nepal-guidance-for-local-governments-on-developing-and-implementing-a-standard-operating-procedure",
    "title": "Ensuring access to social security allowances in Nepal: Guidance for local governments on developing and implementing a standard operating procedure",
    "by": "Save the Children",
    "year": 2026,
    "type": "Agency report",
    "where": "Nepal",
    "finding": "Catalogue describes guidance for local government access processes, including documentation and outreach.",
    "limit": "Only the catalogue description was readable; the full guidance and independent effects were not verified.",
    "expect": [
      "Nepal",
      "2026",
      "local governments"
    ]
  },
  {
    "key": "N19",
    "url": "https://www.haqdarshak.com/",
    "title": "Haqdarshak",
    "by": "Haqdarshak",
    "year": null,
    "type": "Agency report",
    "where": "India; Nepal operation not verified",
    "finding": "Own website describes trained local agents, in-person applications and a digital benefit-discovery platform.",
    "limit": "No independently evaluated Nepal operation was verified.",
    "expect": [
      "trained field staff",
      "Haqdarshak agents",
      "Application"
    ]
  },
  {
    "key": "N20",
    "url": "https://www.undp.org/nepal/publications/inff-integrated-national-financing-strategy-2026",
    "title": "INFF Integrated National Financing Strategy 2026",
    "by": "United Nations Development Programme / Ministry of Finance",
    "year": 2026,
    "type": "Agency report",
    "where": "Nepal",
    "finding": "Landing page describes a nationally led financing strategy with climate and risk finance.",
    "limit": "A strategy is not an individual loan, benefit or heat-insurance entitlement.",
    "expect": [
      "February 13, 2026",
      "Ministry of Finance",
      "climate"
    ]
  },
  {
    "key": "N21",
    "url": "https://www.undp.org/sites/g/files/zskgke326/files/2026-02/final_web_version_infs_9_feb_2026_0.pdf",
    "title": "Integrated National Financing Framework Financing Strategy for Pro-Employment Economic Growth of Nepal with Action Plan",
    "by": "Ministry of Finance / United Nations Development Programme",
    "year": 2026,
    "type": "Agency report",
    "where": "Nepal",
    "finding": "The opened strategy text describes agricultural premium support of up to 80 percent.",
    "limit": "Later retrieval failed because of file size; a newer agriculture implementation procedure was not readable, so current household terms remain unclear.",
    "expect": [
      "insurance",
      "80",
      "agriculture"
    ]
  },
  {
    "key": "N22",
    "url": "https://hib.gov.np/content/317/latest-updated-benefit-package-may-2026/",
    "title": "स्वास्थ्य बीमा बोर्डको सुबिधा थैली (तेस्रो संशोधन), 2083",
    "by": "Health Insurance Board",
    "year": 2026,
    "type": "Government page",
    "where": "Nepal",
    "finding": "Current official page lists a third revision of the benefit package.",
    "limit": "Attachment contents and heat-specific treatment codes were not verified.",
    "expect": [
      "2083",
      "स्वास्थ्य",
      "बीमा"
    ]
  }
]
```
## K. WHAT I COULD NOT VERIFY

- The general old-age threshold is unresolved: the official FAQ and rate page show 70, while UNICEF Table 3 reports a FY2024/25 category of 68 and above. Neither is silently substituted for a reconciled current rule. [N1, N2, N3]
- The 2026/27 Dalit child-rate announcement is separate from the older official table and actual payment. A current operational circular and verified receipt series were not read. [N2, N3]
- An official 2082 allowance-disbursement procedure landing page opened, but its full procedure was not readable. The national dashboard did not open; no 2026 district or province receipt totals are claimed.
- A current health benefit-package revision page opened, but the actual revised package and heat-diagnosis claim codes were not read. The scheme is current, while practical heat coverage remains unknown. [N4, N22]
- The 2026 insurance paper mixes survey, registration and active-membership concepts. Only the clear NDHS sex-specific rates are extracted; administrative totals with differing dates and denominators are not treated as one coverage rate. [N5]
- The former employment programme's workday guarantee was not carried over as a verified current entitlement. The current programme introduction was opened; wage, annual workdays, food support and a construction-specific welfare entitlement remain unverified. [N10]
- The 2026 financing-strategy PDF was readable on the first retrieval; a later call failed because of file size. A newer agriculture procedure did not open, so the strategy's premium-support description is held as unclear current household terms. No individual subsidised credit entitlement is asserted. [N20, N21]
- Census age and disability CSV links returned an unsupported payload to the reader. The National Report PDF also timed out. The catalogue confirms table existence, but headers, smallest unit, place codes and open reuse licence remain unverified. [N14]
- The Save the Children guidance catalogue opened, but its full attachment was not readable. Independent effects of that guidance, unions, self-help groups, post offices, microfinance and legal or paralegal scheme navigation were not verified. [N18]
- Haqdarshak's own digital-and-agent description was read, but local operation and an independent Nepal evaluation were not verified. An India assessment link failed in this run, and no India effect is transferred to Nepal. [N19]
- The heatwave protocol is a plan. Targets are not receipt, and no activated heat-transfer impact estimate is manufactured from it. The shock-responsive standards reported in 2025 are a framework, not a confirmed 2026 heat benefit. [N12, N17]
- Thirteen records include eight targeting strands of one allowance system and one agricultural-insurance item held as unclear. The three evidence items consist of one heat-risk survey, one heat protocol and one flood evaluation; none establishes a completed Nepal public heat-transfer effect.
