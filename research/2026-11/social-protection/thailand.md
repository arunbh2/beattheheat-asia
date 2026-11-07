# Common Shade: Thailand - heat and social protection

Research catalogue and Claude Code design handoff. Sources checked on 6 November 2026.

This file contains research, publication limits and a map proposal. It is not a completed geospatial dataset, an eligibility checker or a guarantee of benefit receipt.

For Claude Code: parse the seven JSON arrays under sections B, C, D, E, F, I and J independently. Retain sections A-K, stable source keys, historical years, benefit periods and uncertainty text.

Build an aggregate place explorer with a map, accessible table, scheme drawer, access ladder and source drawer. Reuse Common Shade's existing design system if available; the repository was not inspected in this run.

The proposed place level is province. The schema uses state to mean province and district to mean a Singapore planning area; country is an explicit extension for national-only data. Gridded and station indicators name their native units in the limit field.

Show rules, enrolment, active coverage, receipt, adequacy and outcomes as different concepts. Missing data remain unknown, with a separate visual treatment from zero; use no composite protection score or ranking.

A countrywide scheme availability panel stays separate from subnational benefit coverage. Display future changes with their effective dates, and keep private or humanitarian pilots outside the public-scheme catalogue.

KNOWN means an official rule or measured finding; INFERRED means modelling, projections or second-hand interpretation; UNCERTAIN means a single, unreplicated or contested claim. A published descriptive result can be KNOWN while its causal or wider interpretation remains UNCERTAIN.

Publication gates include unresolved current rules, unclear licences, unparsed data payloads and untested geographic joins. No live data pipeline, map calculation or application test was completed; no personal data are needed for the proposed product.

## A. SUMMARY

- KNOWN: current sources identify allowances, restricted spending support, contributory insurance, crop relief, savings and new welfare-fund arrangements. Several 2026 notices change terms or effective dates. [T1, T3, T5, T6, T7, T8]
- INFERRED historical access evidence points to gaps among agricultural and migrant workers, but a linked current awareness-to-receipt ladder was not found. Coverage estimates and benefit adequacy use different years and denominators. [T13]
- UNCERTAIN heat-specific delivery evidence comes from a small worker-network insurance pilot. It is separate from public entitlements and has no independently verified outcome evaluation in the sources read. [T15]
- KNOWN contextual health evidence shows lower catastrophic spending over time. That does not establish earnings protection when heat prevents work, or a causal effect on heat illness. [T14]
- INFERRED map design: open climate and population grids plus province geometry can show heat and age context. Provincial SSO and NHSO catalogues were found, but their actual values and shared codes are not yet a verified import. [Te, Tw, Tb, T10, T11]
- No universal heat income-replacement benefit or heat anticipatory cash entitlement was verified. Disaster interruption and crop relief depend on declarations, contributions, evidence and claim rules. [T4, T5, T8]
## B. SCHEMES

```json
[
  {
    "id": "statewelfare",
    "country": "Thailand",
    "level": "national",
    "name": "State Welfare Card",
    "type": "cash",
    "run_by": "Ministry of Finance / Comptroller General’s Department",
    "who": "Approved cardholders under registration rules; new-applicant tests not fully verified.",
    "gives": "November 2026: goods allowance THB300/person/month; transport THB750/person/month; other limits apply.",
    "delivery": "Smart national ID or Paotang; restricted spending rather than freely withdrawable cash.",
    "documents": "Approved status and smart ID; utilities require registration and e-KYC.",
    "portable": "unknown",
    "speed": "Notice lists 1 November allocation; no observed household receipt or service delay.",
    "shock_responsive": "partly",
    "heat_relevance": "INFERRED: goods and utility support can ease costs, with amount and utility conditions limiting protection.",
    "status": "changed (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "T1"
    ]
  },
  {
    "id": "oldage",
    "country": "Thailand",
    "level": "national",
    "name": "Old-Age Allowance",
    "type": "pension",
    "run_by": "Local administrative organisations under Ministry of Interior rules",
    "who": "Eligible older Thai residents; full current income and other-pension tests not reverified.",
    "gives": "Monthly THB600 at 60-69; 700 at 70-79; 800 at 80-89; 1,000 at 90+.",
    "delivery": "Not verified.",
    "documents": "Current local application checklist unverified.",
    "portable": "unknown",
    "speed": "Monthly entitlement; actual payment timing unknown.",
    "shock_responsive": "no",
    "heat_relevance": "INFERRED: resources could help meet hot-season household costs; heat outcomes were not evaluated.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "T2"
    ]
  },
  {
    "id": "disability",
    "country": "Thailand",
    "level": "national",
    "name": "Disability Allowance",
    "type": "cash",
    "run_by": "Local administrative organisations; welfare-card top-up administered through government payment systems",
    "who": "Registered qualifying people with disabilities; top-up has welfare-card conditions.",
    "gives": "Notice refers to THB800 base allowance and THB200 extra for qualifying welfare-card holders.",
    "delivery": "Bank or ID-linked PromptPay for top-up.",
    "documents": "Disability card and qualifying welfare status; complete checklist unverified.",
    "portable": "unknown",
    "speed": "November notice schedules top-up for 20 November, after the research date; receipt not claimed.",
    "shock_responsive": "no",
    "heat_relevance": "INFERRED: resources could help meet hot-season household costs; heat outcomes were not evaluated.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "T1"
    ]
  },
  {
    "id": "ucs",
    "country": "Thailand",
    "level": "national",
    "name": "Universal Coverage Scheme",
    "type": "health",
    "run_by": "National Health Security Office",
    "who": "Thai people eligible for UCS rather than another principal public scheme.",
    "gives": "Public health-service cover under benefit rules; current heat-specific service codes not verified.",
    "delivery": "Registered providers and NHSO entitlement system.",
    "documents": "Current identity and registration checklist not fully verified.",
    "portable": "partly",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "partly",
    "heat_relevance": "INFERRED: care coverage can cushion medical costs; no heat-specific paid-claim series was read.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "T10",
      "T13",
      "T14"
    ]
  },
  {
    "id": "s33",
    "country": "Thailand",
    "level": "national",
    "name": "Social Security Act Section 33",
    "type": "insurance",
    "run_by": "Social Security Office",
    "who": "Covered employees and qualifying contributors.",
    "gives": "Employment-linked health and cash benefits; current branch-by-branch amounts not fully verified.",
    "delivery": "Employer registration and SSO claims.",
    "documents": "Current application checklist not verified.",
    "portable": "unknown",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "partly",
    "heat_relevance": "Work-linked protection depends on benefit conditions; actual heat claims were not verified.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "T9",
      "T11",
      "T13"
    ]
  },
  {
    "id": "s39",
    "country": "Thailand",
    "level": "national",
    "name": "Social Security Act Section 39",
    "type": "insurance",
    "run_by": "Social Security Office",
    "who": "Eligible former Section 33 contributors continuing voluntarily.",
    "gives": "Continuation benefits; the 2025 agency annex excludes unemployment from this route.",
    "delivery": "Voluntary continuation and SSO benefit process.",
    "documents": "Current application checklist not verified.",
    "portable": "unknown",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "unknown",
    "heat_relevance": "INFERRED: continued cover can help after leaving employment; current qualifying history and payment times need checking.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "T9",
      "T11",
      "T13"
    ]
  },
  {
    "id": "s40",
    "country": "Thailand",
    "level": "national",
    "name": "Social Security Act Section 40",
    "type": "insurance",
    "run_by": "Social Security Office",
    "who": "Qualifying self-employed or informal workers under contribution conditions.",
    "gives": "2026 contribution options THB70/100/300 monthly; outpatient compensation THB200/visit up to three yearly.",
    "delivery": "SSO contribution and claim channels.",
    "documents": "Current identity, contribution and medical-certificate checklist not fully verified.",
    "portable": "unknown",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "partly",
    "heat_relevance": "Sickness cash may cushion lost earnings; it is separate from UCS treatment cover, with heat-specific receipt unknown.",
    "status": "changed (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "T3"
    ]
  },
  {
    "id": "ssochild",
    "country": "Thailand",
    "level": "national",
    "name": "Child allowance under Sections 33 and 39",
    "type": "cash",
    "run_by": "Social Security Office",
    "who": "Qualifying insured parents; at least 12 contribution months in the preceding 36 months.",
    "gives": "THB1,000/child/month, up to three children aged birth to six.",
    "delivery": "SSO child-benefit process.",
    "documents": "Legal parenthood and child age need verification; full claim checklist not extracted.",
    "portable": "unknown",
    "speed": "Monthly entitlement; observed delay unknown.",
    "shock_responsive": "no",
    "heat_relevance": "INFERRED: resources could help meet hot-season household costs; heat outcomes were not evaluated.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "T9"
    ]
  },
  {
    "id": "force",
    "country": "Thailand",
    "level": "national",
    "name": "Unemployment benefit due to force majeure: Section 33",
    "type": "insurance",
    "run_by": "Social Security Office",
    "who": "Covered employees without wages during qualifying natural-disaster disruption.",
    "gives": "50% of daily wage for up to 90 days per event.",
    "delivery": "Employer certification and SSO e-service or offices.",
    "documents": "Form SSO 2-01/7, employer certificate, and bank details when not linked to PromptPay.",
    "portable": "unknown",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "yes",
    "heat_relevance": "A disaster response route exists; applicability to heat alone was not confirmed.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "T4"
    ]
  },
  {
    "id": "croprelief",
    "country": "Thailand",
    "level": "national",
    "name": "Emergency crop-disaster assistance",
    "type": "relief",
    "run_by": "Department of Agricultural Extension / provincial authorities / BAAC",
    "who": "Previously registered growers with assessed damage in a declared assistance area.",
    "gives": "May 2026 notice: rice THB1,340/rai; field crops/vegetables 1,980; perennial crops 4,048; up to 30 rai/household.",
    "delivery": "District agriculture assessment and BAAC transfer.",
    "documents": "Updated pre-disaster farmer registration and form กษ 01 with local damage certification.",
    "portable": "unknown",
    "speed": "Notice describes roughly 60 days after application; this is guidance, not a measured payment distribution.",
    "shock_responsive": "yes",
    "heat_relevance": "Drought or heat-related crop damage depends on declaration and damage rules; universal direct heat cover is not established.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "T5"
    ]
  },
  {
    "id": "nsf",
    "country": "Thailand",
    "level": "national",
    "name": "National Savings Fund",
    "type": "pension",
    "run_by": "National Savings Fund",
    "who": "Eligible Thai people aged 15-60 outside specified pension arrangements; Section 40 option 1 may qualify.",
    "gives": "Voluntary saving from THB50; public matching up to THB1,800 yearly, subject to age rules.",
    "delivery": "Fund app and membership process.",
    "documents": "Current application checklist not verified.",
    "portable": "unknown",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "unknown",
    "heat_relevance": "Retirement saving offers longer-term security, with no immediate heat-payment trigger verified.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "T6"
    ]
  },
  {
    "id": "employeewelfare",
    "country": "Thailand",
    "level": "national",
    "name": "Employee Welfare Fund: new contribution arrangements",
    "type": "welfare-fund",
    "run_by": "Department of Labour Protection and Welfare",
    "who": "Covered workplaces with at least ten employees and no provident fund.",
    "gives": "Announcement: employer and employee initially contribute 0.25% each; accumulated funds payable on employment ending.",
    "delivery": "Employer e-service registration and fund process.",
    "documents": "Current application checklist not verified.",
    "portable": "unknown",
    "speed": "Notice states lump sum within 25 days on employment ending; actual post-launch payment performance unverified.",
    "shock_responsive": "partly",
    "heat_relevance": "INFERRED: resources could help meet hot-season household costs; heat outcomes were not evaluated.",
    "status": "changed (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "T7"
    ]
  },
  {
    "id": "disasterinsurance",
    "country": "Thailand",
    "level": "national",
    "name": "Nationwide Disaster Insurance Program",
    "type": "insurance",
    "run_by": "Ministry of Interior / disaster-management and insurance arrangements",
    "who": "Eligible residences under announced policy conditions.",
    "gives": "Residential cover up to THB100,000 for listed perils; other limits apply.",
    "delivery": "Official damage assessment and insurance claims.",
    "documents": "Current application checklist not verified.",
    "portable": "unknown",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "yes",
    "heat_relevance": "Floods, windstorms and earthquakes are listed; heat is not listed in the opened announcement.",
    "status": "changed (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "T8"
    ]
  }
]
```
## C. ACCESS LADDER

```json
[
  {
    "scheme": "oldage",
    "group": "Older population",
    "step": "received",
    "finding": "2025 IMF/ILO annex reports historical older-age social-protection coverage of 83 percent.",
    "grade": "INFERRED",
    "limit": "Secondary synthesis citing ILO 2024, not a new 2026 OAA-specific eligibility-to-receipt estimate.",
    "sources": [
      "T13"
    ]
  },
  {
    "scheme": "s33",
    "group": "Agricultural workers",
    "step": "enrolled",
    "finding": "2025 annex reproduces 1.6 percent SSO coverage for agriculture from a 2022 diagnostic.",
    "grade": "INFERRED",
    "limit": "Historical secondary figure; not current insurance, heat exposure or benefit receipt.",
    "sources": [
      "T13"
    ]
  },
  {
    "scheme": "s33",
    "group": "Regular migrant workers",
    "step": "enrolled",
    "finding": "2025 annex reports around 50 percent covered, citing the 2022 diagnostic.",
    "grade": "INFERRED",
    "limit": "Secondary, approximate and historical; no current migrant nationality comparison is made.",
    "sources": [
      "T13"
    ]
  },
  {
    "scheme": "oldage",
    "group": "Allowance recipients",
    "step": "adequate",
    "finding": "2025 annex reports the allowance averages 21.7 percent of the national poverty line.",
    "grade": "INFERRED",
    "limit": "Secondary adequacy comparison citing ILO 2024; not measured heat-season sufficiency or a current price-adjusted estimate.",
    "sources": [
      "T13"
    ]
  }
]
```

No current linked aware, eligible, documented, applied, received or on-time ladder was verified for the heat-exposed groups. Historical social-protection coverage in the access array is a reported diagnostic concept; it is not a count of heat-benefit recipients.
## D. HEAT AND SOCIAL PROTECTION EVIDENCE

```json
[
  {
    "by": "Tangcharoensathien et al., 2020",
    "title": "Financial risk protection of Thailand’s universal health coverage: results from series of national household surveys between 1996 and 2015",
    "url": "https://link.springer.com/article/10.1186/s12939-020-01273-6",
    "type": "Peer-reviewed study",
    "where": "Thailand",
    "scale": "Repeated national household surveys, approximately 52,000 households per round, 1996-2015",
    "finding": "KNOWN descriptive finding: catastrophic spending above 10% of consumption declined from 6.0% to 2%. This is contextual financial-protection evidence, not a heat-specific causal estimate.",
    "effect": "helped",
    "limit": "Household aggregate data, lack of facility detail and recall bias; secular trends cannot isolate the causal effect of UHC.",
    "sources": [
      "T14"
    ]
  },
  {
    "by": "HomeNet International, 2026",
    "title": "HomeNet Thailand Runs a Pilot Extreme Heat Insurance Project for Informal Economy Workers",
    "url": "https://www.homenetinternational.org/homenet-thailand-runs-a-pilot-extreme-heat-insurance-project-for-informal-economy-workers/",
    "type": "Agency report",
    "where": "Ten provinces",
    "scale": "Self-reported pilot for 1,000 informal workers, May-July 2026",
    "finding": "UNCERTAIN self-report: a heat-triggered insurance pilot offered THB300 daily assistance against a THB100 contribution. Payout triggers were reportedly reached in some provinces; no independently measured household effect was read.",
    "effect": "unclear",
    "limit": "The policy contract and final evaluation were not opened; inconsistent payout-cap wording prevents a reliable total payout-day claim.",
    "sources": [
      "T15"
    ]
  },
  {
    "by": "Prudence Foundation / HERA, 2026",
    "title": "How Extreme Heat is Reshaping Women's Lives in Thailand",
    "url": "https://www.prudentialplc.com/en/sustainability-social-impact/prudence-foundation/news-and-publications/How-Extreme-Heat-is-Reshaping-Womens-Lives-in-Thailand/",
    "type": "Agency report",
    "where": "Eight Thai provinces",
    "scale": "Partner summary: workshops with 299 women",
    "finding": "UNCERTAIN self-reported experiences: women described heat-related earnings and health pressures. The summary identifies a shock pathway, without estimating an insurance or public-transfer effect.",
    "effect": "unclear",
    "limit": "Own partner summary only; full report methods and its own stated limits were not verified because the attachment was too large for the reader.",
    "sources": [
      "T16"
    ]
  }
]
```
## E. DELIVERY ROUTES AND ORGANISATIONS

```json
[
  {
    "id": "sso",
    "name": "Social Security Office",
    "kind": "government",
    "does": "Administers contributory benefits and office/e-service claim routes.",
    "where": "Thailand",
    "reach_reported": "No comparable heat-specific submitted-to-paid count read.",
    "reach_independent": "",
    "evaluations": "",
    "url": "https://www.thaigov.go.th/th/news/169363",
    "sources": [
      "T3",
      "T4",
      "T9"
    ]
  },
  {
    "id": "local",
    "name": "Local administrative organisations",
    "kind": "government",
    "does": "Operate the older-person allowance route under Ministry of Interior rules.",
    "where": "Thailand",
    "reach_reported": "No independent heat-season access evaluation read.",
    "reach_independent": "",
    "evaluations": "",
    "url": "https://dop.go.th/th/faq/view=967",
    "sources": [
      "T2"
    ]
  },
  {
    "id": "agriculture",
    "name": "District agricultural offices and BAAC",
    "kind": "government",
    "does": "Support registered growers through damage forms, assessment and crop-relief bank transfers.",
    "where": "Thailand",
    "reach_reported": "No independent heat-specific payment count extracted.",
    "reach_independent": "",
    "evaluations": "",
    "url": "https://doaenews.doae.go.th/archives/31902",
    "sources": [
      "T5"
    ]
  },
  {
    "id": "homenet",
    "name": "HomeNet Thailand",
    "kind": "civil society",
    "does": "Own network report describes enrolling informal workers in a heat insurance pilot and policy dialogue.",
    "where": "Pilot across ten provinces",
    "reach_reported": "Self-reported pilot target: 1,000 workers; no audited receipt denominator.",
    "reach_independent": "",
    "evaluations": "",
    "url": "https://www.homenetinternational.org/homenet-thailand-runs-a-pilot-extreme-heat-insurance-project-for-informal-economy-workers/",
    "sources": [
      "T15"
    ]
  },
  {
    "id": "fiw",
    "name": "Federation of Informal Workers",
    "kind": "union",
    "does": "Reported partner in the same worker heat insurance pilot.",
    "where": "Thailand pilot",
    "reach_reported": "Same pilot population; this is not an additional reach count.",
    "reach_independent": "",
    "evaluations": "",
    "url": "https://www.homenetinternational.org/homenet-thailand-runs-a-pilot-extreme-heat-insurance-project-for-informal-economy-workers/",
    "sources": [
      "T15"
    ]
  },
  {
    "id": "hera",
    "name": "HERA",
    "kind": "civil society",
    "does": "Reports women-worker heat research and support for heat financial protection.",
    "where": "Thailand",
    "reach_reported": "Partner summary reports workshops with 299 women across eight provinces.",
    "reach_independent": "",
    "evaluations": "",
    "url": "https://www.prudentialplc.com/en/sustainability-social-impact/prudence-foundation/news-and-publications/How-Extreme-Heat-is-Reshaping-Womens-Lives-in-Thailand/",
    "sources": [
      "T15",
      "T16"
    ]
  },
  {
    "id": "nsf",
    "name": "National Savings Fund",
    "kind": "government",
    "does": "Provides an app-based entry route for eligible informal workers to supported retirement saving.",
    "where": "Thailand",
    "reach_reported": "No independent application-success estimate read.",
    "reach_independent": "",
    "evaluations": "",
    "url": "https://www.thaigov.go.th/th/news/168977",
    "sources": [
      "T6"
    ]
  },
  {
    "id": "haqdarshak",
    "name": "Haqdarshak",
    "kind": "social enterprise",
    "does": "Own website describes trained-agent and digital help to find schemes and complete applications.",
    "where": "India in the materials read; operation in this country not verified.",
    "reach_reported": "No local reach verified.",
    "reach_independent": "",
    "evaluations": "",
    "url": "https://www.haqdarshak.com/",
    "sources": [
      "Th"
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
    "indicator": "Days with daily maximum air temperature above 35 degrees C",
    "definition": "Proposed annual count from ERA5 hourly 2 m air temperature, using local calendar days. Threshold is an analytical choice, not a national warning or safe-work limit.",
    "unit": "days/year",
    "unit_of_place": "state",
    "year": 2025,
    "publisher": "Copernicus Climate Change Service / ECMWF",
    "url": "https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels?tab=overview",
    "licence": "CC-BY licence displayed",
    "access": "registration",
    "format": "other",
    "update": "Source daily; derived map annual",
    "place_code": "Latitude/longitude grid; spatial overlay",
    "limit": "INFERRED; native 0.25 degree grid. No country values calculated. Use correct local time zones. [Te]"
  },
  {
    "id": "hotnights",
    "layer": "exposure",
    "indicator": "Days with daily minimum air temperature above 28 degrees C",
    "definition": "Proposed annual count from the same temperature series. A whole-day minimum is a reproducible hot-night proxy, not a measured sleeping condition.",
    "unit": "days/year",
    "unit_of_place": "state",
    "year": 2025,
    "publisher": "Copernicus Climate Change Service / ECMWF",
    "url": "https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels?tab=overview",
    "licence": "CC-BY licence displayed",
    "access": "registration",
    "format": "other",
    "update": "Source daily; derived map annual",
    "place_code": "Same grid and selected boundary as hotdays",
    "limit": "INFERRED; indoor heat, wind, work intensity and radiant heat are not measured. [Te]"
  },
  {
    "id": "dewpoint",
    "layer": "exposure",
    "indicator": "Mean dew-point temperature",
    "definition": "Proposed annual mean of hourly 2 m dew-point temperature, aggregated by area. It gives moisture context rather than a validated humid-heat health index.",
    "unit": "degrees C",
    "unit_of_place": "state",
    "year": 2025,
    "publisher": "Copernicus Climate Change Service / ECMWF",
    "url": "https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels?tab=overview",
    "licence": "CC-BY licence displayed",
    "access": "registration",
    "format": "other",
    "update": "Source daily; derived map annual",
    "place_code": "Same grid and boundary as hotdays",
    "limit": "INFERRED; dew point is not wet-bulb temperature, heat index or WBGT. [Te]"
  },
  {
    "id": "older",
    "layer": "vulnerability",
    "indicator": "Population aged 65 and over",
    "definition": "Proposed sum of the published age-sex raster bands aged 65+ divided by the total for the same release.",
    "unit": "percent of population",
    "unit_of_place": "state",
    "year": 2020,
    "publisher": "WorldPop, University of Southampton",
    "url": "https://hub.worldpop.org/geodata/summary?id=50547",
    "licence": "CC BY 4.0 stated; check file provenance for ODbL exception",
    "access": "open download",
    "format": "other",
    "update": "Versioned research release",
    "place_code": "WGS84 grid; spatial overlay",
    "limit": "INFERRED, not census counts; about 100 m native grid. Administrative aggregates not downloaded or calculated. [Tw]"
  },
  {
    "id": "underfive",
    "layer": "vulnerability",
    "indicator": "Children under five",
    "definition": "Proposed sum of age 0-1 and 1-4 raster groups, using both sexes and the same-release population denominator.",
    "unit": "percent of population",
    "unit_of_place": "state",
    "year": 2020,
    "publisher": "WorldPop, University of Southampton",
    "url": "https://hub.worldpop.org/geodata/summary?id=50547",
    "licence": "CC BY 4.0 stated; check provenance",
    "access": "open download",
    "format": "other",
    "update": "Versioned research release",
    "place_code": "Same grid as older",
    "limit": "INFERRED; age-group labels and totals receive a check before calculation. This is not eligibility for a child benefit. [Tw]"
  },
  {
    "id": "density",
    "layer": "vulnerability",
    "indicator": "Residential population density",
    "definition": "Sum the age-sex population estimates within each selected polygon and divide by its land area.",
    "unit": "estimated persons/km2",
    "unit_of_place": "state",
    "year": 2020,
    "publisher": "WorldPop; project derivation",
    "url": "https://hub.worldpop.org/geodata/summary?id=50547",
    "licence": "CC BY 4.0 stated; check provenance",
    "access": "open download",
    "format": "other",
    "update": "Versioned research release",
    "place_code": "Same grid and selected geometry",
    "limit": "INFERRED; residents are not daytime workers. Migrant workplaces and informal settlements may be represented differently. [Tw]"
  },
  {
    "id": "ssoprovince",
    "layer": "coverage",
    "indicator": "SSO registrants by section and province",
    "definition": "Published catalogue definition: Section 33 follows employer registration province; Sections 39/40 follow member registration province.",
    "unit": "persons",
    "unit_of_place": "state",
    "year": 2026,
    "publisher": "Social Security Office",
    "url": "https://data.go.th/th/dataset/sso-total-insured-persons",
    "licence": "Open Data Common stated; exact legal instrument/version not verified",
    "access": "open download",
    "format": "other",
    "update": "Monthly",
    "place_code": "Province in catalogue; XLS code field not parsed",
    "limit": "Metadata read, XLS payload not extracted. Not resident coverage or paid-benefit receipt. [T11]"
  },
  {
    "id": "ucsregistration",
    "layer": "coverage",
    "indicator": "Health-entitlement registration coverage",
    "definition": "NHSO administrative registration coverage as defined by its monthly report; denominator requires inspection before plotting a percentage.",
    "unit": "persons or percent after denominator check",
    "unit_of_place": "state",
    "year": 2026,
    "publisher": "National Health Security Office",
    "url": "https://nhso.gdcatalog.go.th/en/dataset/dataset-rg_13_01",
    "licence": "Creative Commons Attributions stated; version not specified",
    "access": "dashboard only",
    "format": "other",
    "update": "Monthly",
    "place_code": "Province metadata; no shared numeric code verified",
    "limit": "Catalogue opened, linked dashboard timed out; values are not ready for use. [T10]"
  },
  {
    "id": "s40national",
    "layer": "coverage",
    "indicator": "Section 40 national registrants",
    "definition": "National monthly count from the Section 40 catalogue, separate from the province table.",
    "unit": "persons",
    "unit_of_place": "country",
    "year": 2026,
    "publisher": "Social Security Office",
    "url": "https://data.go.th/th/dataset/sso-insured-section-40",
    "licence": "Open Data Common stated; exact version not verified",
    "access": "open download",
    "format": "other",
    "update": "Monthly",
    "place_code": "ISO3 THA; no province breakdown in this record",
    "limit": "Do not distribute national totals among provinces; payload not parsed. [T12]"
  },
  {
    "id": "oaaterms",
    "layer": "system",
    "indicator": "Older-person monthly allowance by age band",
    "definition": "Published 2026 rate bands, displayed with age eligibility and application limits.",
    "unit": "THB/person/month",
    "unit_of_place": "state",
    "year": 2026,
    "publisher": "Government of Thailand",
    "url": "https://dop.go.th/th/faq/view=967",
    "licence": "Newly authored factual table can be open; source-page licence not verified",
    "access": "open download",
    "format": "other",
    "update": "Policy revision",
    "place_code": "Curated province crosswalk",
    "limit": "National rule is not verified local receipt or purchasing power. [T2]"
  }
]
```
## G. A MINIMUM VIABLE MAP

A first version can use two substantive layers: derived 2025 ERA5 hot-day counts and modelled WorldPop 2020 population aged 65+. Spatially aggregate both onto the opened geoBoundaries THA ADM1 release: 77 units, boundary year 2017, with an Open Database License source. Retain source attribution and distribution terms. [Te, Tw, Tb]

A third layer can show the nationally published older-person allowance terms through a newly written factual table. Each province gets an availability flag, not an invented registration or receipt rate. [T2]

The available SSO provincial catalogue is a useful coverage extension after the XLS payload and licence version are checked. Its Section 33 geography can follow employer headquarters or registration rather than where households live; Sections 39/40 follow registration province, so a single residence-based denominator would mislead. [T11]

NHSO provides a provincially scoped, openly licensed registration catalogue, but its dashboard timed out. It remains a located source, not a completed coverage layer. No official shared place code between SSO, NHSO and geometry was verified; a documented province crosswalk and vintage check precede use. [T10, T11, Tb]

The map would show modelled heat, modelled age structure and systems available under rules. It would not show insured heat claims, actual earnings replaced, on-time payments, migrant continuity, sufficient cooling or individual eligibility. Low enrolment is not low need, and high registration is not adequate protection. Neither the raster processing nor the geographic join was run.
## H. WHERE NO SYSTEM RESPONDS

- Informal workers' heat income loss: Section 40 has conditional sickness cash, while the worker heat insurance pilot is limited and private; no universal paid hot-day entitlement was verified. [T3, T15]
- Heat-related work suspension: force-majeure unemployment pay exists for qualifying disaster disruption, but the opened notice does not establish acceptance of heat-only cases. [T4]
- Heat healthcare costs: broad public health coverage exists; a current heat-specific paid-claim and care-forgone series was not verified. [T10, T14]
- Agricultural heat losses: relief needs prior registration, a declared assistance area and assessed damage; crop loss is not automatically full income replacement. [T5]
- Heat damage to housing and assets: the opened disaster-insurance announcement lists floods, windstorms and earthquakes, with no verified heat peril. [T8]
- Migrant seasonal continuity: historical SSO coverage estimates do not establish portable current access or uninterrupted claim receipt after moving. [T13]
## I. OPEN QUESTIONS

```json
[
  {
    "id": "s40heat",
    "q": "Does Section 40 sickness compensation reach informal workers diagnosed with heat illness?",
    "have": "Current benefit changes are published; heat-specific applications and payments were not verified. [T3]",
    "could": "Prospective claims-pathway study tracking aggregate awareness, documentation, accepted claims, value and delay.",
    "scale": "Illustrative: several provinces over two hot seasons; final size based on case flow."
  },
  {
    "id": "pilot",
    "q": "Does heat-triggered insurance preserve earnings and reduce debt without changing essential work hours?",
    "have": "A worker-network pilot and partner reports exist without an independent impact estimate. [T15, T16]",
    "could": "Pre-registered phased rollout with agreed comparison clusters, measuring income, care costs, rest and coping in aggregate.",
    "scale": "Illustrative: 40-60 clusters across two hot seasons."
  },
  {
    "id": "geography",
    "q": "How different are social-insurance coverage maps based on residence and employer registration?",
    "have": "SSO metadata describes different location concepts by section. [T11]",
    "could": "Secure institutional aggregation of both location definitions; publish only province-level differences and uncertainty.",
    "scale": "Illustrative: one year of all available provincial aggregate records."
  },
  {
    "id": "crops",
    "q": "How much heat-related crop loss is met by declared-disaster relief, and how quickly?",
    "have": "Crop-relief rates, documents and procedure are published. [T5]",
    "could": "Crop-season household panel and administrative aggregate audit of declarations, assessed losses, payment dates and recovery.",
    "scale": "Illustrative: 1,000-1,500 households across several agroclimatic areas."
  }
]
```
## J. SOURCES

```json
[
  {
    "key": "T1",
    "url": "https://www.thaigov.go.th/th/news/170664",
    "title": "กรมบัญชีกลางอัปเดตสวัสดิการแห่งรัฐ เดือนพฤศจิกายน 2569 จ่ายอะไรบ้าง",
    "by": "Government of Thailand / Comptroller General’s Department",
    "year": 2026,
    "type": "Government page",
    "where": "Thailand",
    "finding": "29 October notice states November goods allowance of 300 baht monthly, transport 750 baht monthly and disability top-up 200 baht for qualifying cardholders.",
    "limit": "A dated payment notice, not measured receipt, adequacy or a full new-applicant eligibility guide.",
    "expect": [
      "300",
      "750",
      "2569"
    ]
  },
  {
    "key": "T2",
    "url": "https://dop.go.th/th/faq/view=967",
    "title": "การรับเบี้ยผู้สูงอายุ",
    "by": "Department of Older Persons",
    "year": null,
    "type": "Government page",
    "where": "Thailand",
    "finding": "Current FAQ lists monthly older-person rates: 600, 700, 800 and 1,000 baht by age band.",
    "limit": "Undated FAQ checked in 2026; rates were also cross-checked against a current government notice, but the full eligibility process remains unverified.",
    "expect": [
      "600",
      "700",
      "1,000"
    ]
  },
  {
    "key": "T3",
    "url": "https://www.mol.go.th/en/news/over-500000-section-40-insured-persons-rejoice-following-labour-ministers-drive-to-enhance-social-security-benefits-aligned-with-current-economic-conditions-outpatient-medical-compensation-increased-from-50-to-200-baht-visit-maximum-income-compensation-for-disability-cases-raised-from-1000-to-3000-baht",
    "title": "Over 500,000 Section 40 Insured Persons Rejoice Following Labour Minister’s Drive to Enhance Social Security Benefits Aligned with Current Economic Conditions: Outpatient Medical Compensation Increased from 50 to 200 Baht/Visit; Maximum Income Compensation for Disability Cases Raised from 1,000 to 3,000 Baht",
    "by": "Ministry of Labour",
    "year": 2026,
    "type": "Government page",
    "where": "Thailand",
    "finding": "18 January 2026 notice lists contribution options of 70, 100 and 300 baht monthly; outpatient compensation is 200 baht per visit up to three yearly.",
    "limit": "Sickness cash compensation is distinct from health-service insurance. Administrative benefit language does not establish heat-specific receipt.",
    "expect": [
      "18 Jan 2026",
      "200 Baht",
      "70 Baht"
    ]
  },
  {
    "key": "T4",
    "url": "https://www.thaigov.go.th/th/news/169363",
    "title": "รัฐบาลย้ำสิทธิ “ม.33” เจอภัยธรรมชาติจนทำงานไม่ได้ รับเงินว่างงานเหตุสุดวิสัย 50% ไม่เกิน 90 วัน",
    "by": "Government of Thailand / Social Security Office",
    "year": 2026,
    "type": "Government page",
    "where": "Thailand",
    "finding": "27 September notice describes 50% daily-wage compensation up to 90 days for qualifying natural-disaster work interruption.",
    "limit": "Illustrates floods; whether an extreme-heat work stoppage qualifies was not verified.",
    "expect": [
      "50%",
      "90",
      "สปส.2-01/7"
    ]
  },
  {
    "key": "T5",
    "url": "https://doaenews.doae.go.th/archives/31902",
    "title": "เกษตรฯ เผย 3 สิ่ง เกษตรกรควรทำ เพื่อรับการช่วยเหลือ เมื่อประสบภัยพิบัติด้านพืช",
    "by": "Department of Agricultural Extension",
    "year": 2026,
    "type": "Government page",
    "where": "Thailand",
    "finding": "15 May notice gives crop-relief rates of 1,340 baht/rai for rice, 1,980 for field crops/vegetables and 4,048 for perennial crops, up to 30 rai/household.",
    "limit": "Disaster declaration, prior farmer registration and verified damage apply; revised rates were still under consideration in the notice.",
    "expect": [
      "1,340",
      "1,980",
      "4,048"
    ]
  },
  {
    "key": "T6",
    "url": "https://www.thaigov.go.th/th/news/168977",
    "title": "กอช. ชวน “อาชีพอิสระ” ออมเงินรับบำนาญตลอดชีพ พร้อมรับสิทธิ์ลดหย่อนภาษีสูงสุด 30,000 บาท",
    "by": "Government of Thailand / National Savings Fund",
    "year": 2026,
    "type": "Government page",
    "where": "Thailand",
    "finding": "17 September notice describes voluntary saving for eligible Thai people aged 15-60, with government matching up to 1,800 baht yearly.",
    "limit": "Long-term saving, not immediate heat income replacement; tax relief is distinct from a cash grant.",
    "expect": [
      "1,800",
      "15 - 60",
      "50"
    ]
  },
  {
    "key": "T7",
    "url": "https://www.thaigov.go.th/th/news/167291",
    "title": "กสร. แนะนายจ้าง-ลูกจ้าง เตรียมความพร้อมกองทุนสงเคราะห์ลูกจ้างรูปแบบใหม่ สร้างหลักประกันแรงงานไทย เริ่มเก็บเงินสะสม 1 ต.ค. 2569",
    "by": "Government of Thailand / Department of Labour Protection and Welfare",
    "year": 2026,
    "type": "Government page",
    "where": "Thailand",
    "finding": "August notice announces contributions from 1 October 2026, each side 0.25% initially, for covered employers and employees.",
    "limit": "Announcement, not independently confirmed post-launch implementation; it describes a payment rule rather than observed processing time.",
    "expect": [
      "0.25",
      "25",
      "1 ตุลาคม 2569"
    ]
  },
  {
    "key": "T8",
    "url": "https://thailand.prd.go.th/en/content/category/detail/id/48/iid/547200",
    "title": "Launch of Nationwide Disaster Insurance Program Effective 1 October 2026",
    "by": "Government Public Relations Department",
    "year": 2026,
    "type": "Government page",
    "where": "Thailand",
    "finding": "Announces residential coverage up to 100,000 baht for specified floods, windstorms and earthquakes in the October 2026-October 2027 period.",
    "limit": "Policy conditions and assessed damage apply; announcement is not paid-claim evidence and does not list heat as a peril.",
    "expect": [
      "100,000",
      "October 2026",
      "earthquakes"
    ]
  },
  {
    "key": "T9",
    "url": "https://www.sso.go.th/wpr/main/service/%E0%B8%81%E0%B8%AD%E0%B8%87%E0%B8%97%E0%B8%B8%E0%B8%99%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%81%E0%B8%B1%E0%B8%99%E0%B8%AA%E0%B8%B1%E0%B8%87%E0%B8%84%E0%B8%A1_detail_detail_1_125_694/234_234",
    "title": "สิทธิกรณีสงเคราะห์บุตร",
    "by": "Social Security Office",
    "year": 2026,
    "type": "Government page",
    "where": "Thailand",
    "finding": "Page dated 20 August 2569 lists 1,000 baht per child monthly under Sections 33/39, up to three children and qualifying contributions.",
    "limit": "Contributory child benefit, not the separate means-tested Child Support Grant; no receipt estimate provided.",
    "expect": [
      "1,000",
      "มาตรา 33",
      "12 เดือน"
    ]
  },
  {
    "key": "T10",
    "url": "https://nhso.gdcatalog.go.th/en/dataset/dataset-rg_13_01",
    "title": "รายงานแสดงความครอบคลุมการลงทะเบียนผู้มีสิทธิ",
    "by": "National Health Security Office",
    "year": 2026,
    "type": "Government page",
    "where": "Thailand",
    "finding": "Catalogue describes monthly provincial health-entitlement registration data and declares Creative Commons Attributions.",
    "limit": "Linked dashboard timed out; no table values, complete code domain or exact licence version were verified.",
    "expect": [
      "Creative Commons Attributions",
      "HTML",
      "February 23, 2026"
    ]
  },
  {
    "key": "T11",
    "url": "https://data.go.th/th/dataset/sso-total-insured-persons",
    "title": "จำนวนผู้ประกันตนในระบบประกันสังคม",
    "by": "Social Security Office / data.go.th",
    "year": 2026,
    "type": "Government page",
    "where": "Thailand",
    "finding": "Catalogue describes province counts for Sections 33/39/40; Section 33 can follow employer registration location while 39/40 follow registration province.",
    "limit": "XLS files listed but not parsed. Workplace/registration geography is not a household residence denominator.",
    "expect": [
      "มาตรา 33",
      "มาตรา 39",
      "Open Data Common"
    ]
  },
  {
    "key": "T12",
    "url": "https://data.go.th/th/dataset/sso-insured-section-40",
    "title": "จำนวนผู้ประกันตนมาตรา 40",
    "by": "Social Security Office / data.go.th",
    "year": 2026,
    "type": "Government page",
    "where": "Thailand",
    "finding": "Section 40 catalogue is monthly XLS with national geographic coverage and latest statistical year 2569.",
    "limit": "National series, not a verified provincial extract; licence is labelled Open Data Common without a precise version.",
    "expect": [
      "XLS",
      "Open Data Common",
      "2569"
    ]
  },
  {
    "key": "T13",
    "url": "https://www.imf.org/-/media/files/publications/cr/2025/english/1thaea2025001-print-pdf.pdf",
    "title": "Thailand: 2024 Article IV Consultation-Press Release; Staff Report; and Statement by the Executive Director for Thailand",
    "by": "International Monetary Fund; social-protection annex prepared by ILO",
    "year": 2025,
    "type": "Agency report",
    "where": "Thailand",
    "finding": "Social-protection annex distinguishes Sections 33/39/40 and reports historical coverage and adequacy estimates.",
    "limit": "Secondary synthesis with different underlying years; its older contribution figures are not treated as current 2026 rates.",
    "expect": [
      "Section 39",
      "21.7",
      "1.6 percent"
    ]
  },
  {
    "key": "T14",
    "url": "https://link.springer.com/article/10.1186/s12939-020-01273-6",
    "title": "Financial risk protection of Thailand’s universal health coverage: results from series of national household surveys between 1996 and 2015",
    "by": "Tangcharoensathien et al.",
    "year": 2020,
    "type": "Peer-reviewed study",
    "where": "Thailand",
    "finding": "At the 10% spending threshold, catastrophic health expenditure declined from 6.0% in 1996 to 2% in 2015.",
    "limit": "Descriptive repeated surveys; household-level aggregation, no facility breakdown and recall bias are stated limits.",
    "expect": [
      "6.0%",
      "2%",
      "52,000"
    ]
  },
  {
    "key": "T15",
    "url": "https://www.homenetinternational.org/homenet-thailand-runs-a-pilot-extreme-heat-insurance-project-for-informal-economy-workers/",
    "title": "HomeNet Thailand Runs a Pilot Extreme Heat Insurance Project for Informal Economy Workers",
    "by": "HomeNet International",
    "year": 2026,
    "type": "Agency report",
    "where": "Ten provinces in Thailand",
    "finding": "Own 23 June account describes a May-July 2026 pilot for 1,000 workers, 100-baht contribution and 300-baht daily payout under triggers.",
    "limit": "Not public entitlement or independent impact evaluation; the account is unclear about its payout-day cap, so payout-day totals are not repeated.",
    "expect": [
      "1,000",
      "100 baht",
      "300-baht"
    ]
  },
  {
    "key": "T16",
    "url": "https://www.prudentialplc.com/en/sustainability-social-impact/prudence-foundation/news-and-publications/How-Extreme-Heat-is-Reshaping-Womens-Lives-in-Thailand/",
    "title": "How Extreme Heat is Reshaping Women's Lives in Thailand",
    "by": "Prudence Foundation / HERA",
    "year": 2026,
    "type": "Agency report",
    "where": "Thailand",
    "finding": "Funder summary describes workshops with 299 women across eight provinces and reported income and health pressures.",
    "limit": "Own partner summary, not independent evaluation; full report could not be opened because of file size, so its methods and stated limits remain unverified.",
    "expect": [
      "299 women",
      "eight provinces",
      "workshops"
    ]
  },
  {
    "key": "Te",
    "url": "https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels?tab=overview",
    "title": "ERA5 hourly data on single levels from 1940 to present",
    "by": "Copernicus Climate Change Service / ECMWF",
    "year": 2026,
    "type": "Agency report",
    "where": "Global",
    "finding": "Hourly reanalysis on a 0.25 degree atmospheric grid, with daily updates and about five days of latency.",
    "limit": "Reanalysis combines a model and observations; it is not a measurement of personal heat exposure.",
    "expect": [
      "0.25",
      "GRIB",
      "CC-BY"
    ]
  },
  {
    "key": "Tw",
    "url": "https://hub.worldpop.org/geodata/summary?id=50547",
    "title": "Age and sex structures",
    "by": "WorldPop, University of Southampton",
    "year": 2020,
    "type": "Agency report",
    "where": "Thailand",
    "finding": "Open 2020 age-sex population estimates are supplied as approximately 100 m GeoTIFF rasters.",
    "limit": "Modelled population; page notes CC BY 4.0 and an ODbL exception for some inputs. File-level provenance remains a release check.",
    "expect": [
      "2020",
      "Geotiff",
      "WGS84"
    ]
  },
  {
    "key": "Tb",
    "url": "https://www.geoboundaries.org/api/current/gbOpen/THA/ADM1/",
    "title": "geoBoundaries gbOpen THA ADM1 API metadata",
    "by": "geoBoundaries",
    "year": 2023,
    "type": "Agency report",
    "where": "Thailand",
    "finding": "An openly licensed boundary release was located and its vintage checked.",
    "limit": "Metadata and download links were read; no completed join or current official code crosswalk is claimed.",
    "expect": [
      "ADM1",
      "boundaryYearRepresented",
      "Open Database License"
    ]
  },
  {
    "key": "Th",
    "url": "https://www.haqdarshak.com/",
    "title": "Haqdarshak",
    "by": "Haqdarshak",
    "year": null,
    "type": "Agency report",
    "where": "India; local operation not verified",
    "finding": "Own materials describe in-person facilitation through trained field staff and contractual agents alongside digital scheme discovery.",
    "limit": "No independent local evaluation or service presence was verified. A JSW assessment link returned 404.",
    "expect": [
      "trained field staff",
      "Haqdarshak agents",
      "Application"
    ]
  }
]
```
## K. WHAT I COULD NOT VERIFY

- The NHSO 2026 rights handbook was too large for the reader. The entitlement-registration catalogue opened, but its linked dashboard timed out. Current heat treatment codes, exact referral exceptions and paid heat claims remain unverified. [T10]
- SSO XLS resources were listed but not parsed. National Section 40 data are not relabelled as provincial, and the provincial dataset's employer-registration geography is not treated as household residence. [T11, T12]
- The official current child-support portal opened as a personal-ID lookup with document links, without readable current means-tested benefit rules. No lookup was submitted, and the separate means-tested Child Support Grant is not assigned an assumed 2026 rate.
- The long SSO e-service manual could not be opened because of file size. Section 39's current contribution amount, full application checklist and observed delay are not filled from memory. The 2025 agency annex is used only for framework and clearly historical findings. [T13]
- The 2025 agency annex and 2026 ministry notice give different Section 40 contribution figures. The catalogue uses the current 2026 ministry notice rather than silently combining them. [T3, T13]
- The employment-welfare fund and disaster-insurance notices were opened, but actual post-launch enrolment, contributions and claim payment were not independently verified. Their effective dates remain attached to their announced rules. [T7, T8]
- The full HERA report exceeded the reader's file-size limit. The funder summary was read and used only as labelled self-report; it supplies no independent impact effect or verified clinical diagnosis. [T16]
- HomeNet's account is unclear about the maximum number of payout days versus days reported. No payout total or cap-based extrapolation is used, and current continuation beyond the May-July pilot was not verified. [T15]
- Universal health coverage: A (social insurance) job half done? and Universal coverage with supply-side reform were found as relevant studies, but publisher and repository attempts did not open. Their effect estimates and null findings are excluded.
- A current government-supported crop insurance contract, BAAC heat-specific credit relief and nationwide employment guarantee were not verified. Crop-disaster assistance is not relabelled as insurance. [T5]
- A scheme-specific independent last-mile evaluation for unions, self-help groups, common service centres, microfinance, post offices or legal/paralegal help was not opened. Verified worker-network roles are described without rankings or inferred application success.
- Haqdarshak's own platform-and-agent materials were read. The JSW independent-assessment link returned 404, and neither operation nor independently measured results in Thailand were verified. [Th]
- Three evidence items include one historical financial-protection study and two labelled organisational accounts. No completed causal public heat-transfer evaluation or verified heat-specific null evaluation was found in this bounded search.
