# Common Shade: Singapore - heat and social protection

Research catalogue and Claude Code design handoff. Sources checked on 6 November 2026.

This file contains research, publication limits and a map proposal. It is not a completed geospatial dataset, an eligibility checker or a guarantee of benefit receipt.

For Claude Code: parse the seven JSON arrays under sections B, C, D, E, F, I and J independently. Retain sections A-K, stable source keys, historical years, benefit periods and uncertainty text.

Build an aggregate place explorer with a map, accessible table, scheme drawer, access ladder and source drawer. Reuse Common Shade's existing design system if available; the repository was not inspected in this run.

The proposed place level is planning area, with national figures kept at city-state level. The schema uses state to mean province and district to mean a Singapore planning area; country is an explicit extension for national-only data. Gridded and station indicators name their native units in the limit field.

Show rules, enrolment, active coverage, receipt, adequacy and outcomes as different concepts. Missing data remain unknown, with a separate visual treatment from zero; use no composite protection score or ranking.

A countrywide scheme availability panel stays separate from subnational benefit coverage. Display future changes with their effective dates, and keep private or humanitarian pilots outside the public-scheme catalogue.

KNOWN means an official rule or measured finding; INFERRED means modelling, projections or second-hand interpretation; UNCERTAIN means a single, unreplicated or contested claim. A published descriptive result can be KNOWN while its causal or wider interpretation remains UNCERTAIN.

Publication gates include unresolved current rules, unclear licences, unparsed data payloads and untested geographic joins. No live data pipeline, map calculation or application test was completed; no personal data are needed for the proposed product.

## A. SUMMARY

- KNOWN: citizen cash, pensions, vouchers, utility support and healthcare financing coexist with distinct migrant-worker care and work-injury routes. Eligibility categories cannot be pooled into one population coverage percentage. [S1, S5, S8, S10, S16]
- KNOWN heat-specific rule: qualifying work-related heat illness can support WICA claims, and specified heat-rest breaks are considered paid work. Actual heat-claim acceptance, payment time and compensation outcomes were not verified. [S13, S14, S15]
- KNOWN receipt data include annual national ComCare household counts; PCP survey responses describe perceived access. Neither supplies a linked local eligible-to-received ladder for people exposed to heat. [S29, S17]
- INFERRED research estimate: HeatSafe values productivity loss, without establishing observed wage deductions or the effect of benefits. No causal heat social-protection outcome or heat-specific null evaluation was opened. [S20]
- KNOWN open data: station WBGT, census age structure on Master Plan 2019 geography and national ComCare receipt are publicly downloadable under the Singapore Open Data Licence. Their different geographies remain visible. [S26, S27, S28, S29]
- Some 2026 announcements take effect later: enhanced heat requirements start December 2026 and enhanced PCP begins April 2027. Farm grants and business credit are adaptation and cashflow routes, rather than household heat-loss insurance. [S19, S17, S24, S25]
## B. SCHEMES

```json
[
  {
    "id": "smta",
    "country": "Singapore",
    "level": "national",
    "name": "ComCare Short-to-Medium-Term Assistance",
    "type": "cash",
    "run_by": "Ministry of Social and Family Development / Social Service Offices",
    "who": "Assessed households with temporary inability to work, job search, care duties or low earnings; full residency tests need checking.",
    "gives": "Assessed income shortfall against basic living expenses; no fixed universal amount.",
    "delivery": "SupportGoWhere online or Social Service Office.",
    "documents": "Household identity/birth records, recent bank balances and relevant work, medical or bill records.",
    "portable": "unknown",
    "speed": "Typically 3-6 months of initial assistance; actual processing and bank-payment delay not verified.",
    "shock_responsive": "partly",
    "heat_relevance": "INFERRED: assessed temporary need could include heat-related income or health pressures; actual acceptance unmeasured.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "S1",
      "S2",
      "S4"
    ]
  },
  {
    "id": "lta",
    "country": "Singapore",
    "level": "national",
    "name": "ComCare Long-Term Assistance",
    "type": "cash",
    "run_by": "Ministry of Social and Family Development / Social Service Offices",
    "who": "People permanently unable to work with little means or family support.",
    "gives": "Monthly S$760 for one-person household; S$1,250 for two people under published rates.",
    "delivery": "ComCare assessment and payment system.",
    "documents": "Current LTA-specific checklist not verified.",
    "portable": "unknown",
    "speed": "Monthly entitlement; measured payment delay unknown.",
    "shock_responsive": "no",
    "heat_relevance": "INFERRED: resources could help meet hot-season household costs; heat outcomes were not evaluated.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "S3",
      "S4"
    ]
  },
  {
    "id": "ia",
    "country": "Singapore",
    "level": "national",
    "name": "ComCare Interim Assistance: 2026 enhancement",
    "type": "relief",
    "run_by": "Ministry of Social and Family Development",
    "who": "Qualifying lower-income households under enhanced interim criteria.",
    "gives": "At least S$250 monthly, up to three months, during the August-December 2026 enhancement.",
    "delivery": "Interim assistance route; detailed application process not fully verified.",
    "documents": "Current application checklist not verified.",
    "portable": "unknown",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "partly",
    "heat_relevance": "General temporary relief, without a verified heat trigger.",
    "status": "changed (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "S5"
    ]
  },
  {
    "id": "wis",
    "country": "Singapore",
    "level": "national",
    "name": "Workfare Income Supplement",
    "type": "cash",
    "run_by": "Central Provident Fund Board",
    "who": "Eligible citizens aged 30+ or qualifying people with disabilities; income, property and other tests apply.",
    "gives": "Earnings/age-dependent cash and CPF support. Employee allocation is 40% cash and 60% CPF; 2026 maximum not verified.",
    "delivery": "Automatic employee assessment from contribution/income records; PayNow, bank or GovCash.",
    "documents": "Employee administrative records; self-employed reporting and contributions differ.",
    "portable": "unknown",
    "speed": "2026 employee calculator: payment two months after month worked; actual delay not measured.",
    "shock_responsive": "partly",
    "heat_relevance": "INFERRED: supplements earnings, with possible gaps when heat reduces qualifying work; not a paid hot-day entitlement.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "S6",
      "S7"
    ]
  },
  {
    "id": "silver",
    "country": "Singapore",
    "level": "national",
    "name": "Silver Support Scheme",
    "type": "pension",
    "run_by": "Government of Singapore / CPF administration",
    "who": "Eligible citizens aged 65+ meeting work-history, household-income and housing tests.",
    "gives": "S$215-S$1,080 quarterly across published bands.",
    "delivery": "Automatic assessment; PayNow, bank or GovCash.",
    "documents": "No application; administrative records support annual assessment.",
    "portable": "unknown",
    "speed": "Published quarterly advance schedule; observed payment delay not verified.",
    "shock_responsive": "no",
    "heat_relevance": "INFERRED: resources could help meet hot-season household costs; heat outcomes were not evaluated.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "S8"
    ]
  },
  {
    "id": "cdc",
    "country": "Singapore",
    "level": "national",
    "name": "CDC Vouchers Scheme: June 2026 tranche",
    "type": "food",
    "run_by": "Government of Singapore / Community Development Councils",
    "who": "Qualifying Singaporean households; complete claiming rules not opened.",
    "gives": "S$500 June 2026 tranche; total-year and expiry terms not verified.",
    "delivery": "Voucher scheme; current detailed claim process not verified.",
    "documents": "Current application checklist not verified.",
    "portable": "unknown",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "partly",
    "heat_relevance": "INFERRED: spending support can ease food costs; it is not heat-loss compensation.",
    "status": "changed (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "S5"
    ]
  },
  {
    "id": "usave",
    "country": "Singapore",
    "level": "national",
    "name": "GST Voucher / additional U-Save utility rebates",
    "type": "cash",
    "run_by": "Government of Singapore",
    "who": "Eligible HDB households under scheme conditions.",
    "gives": "Government page lists up to S$190 additional rebates in October 2026 and January 2027; tranche details unverified.",
    "delivery": "Utility-bill rebate; not freely withdrawable household cash.",
    "documents": "Current application checklist not verified.",
    "portable": "unknown",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "partly",
    "heat_relevance": "INFERRED: bill relief can help with cooling costs, without verifying cooling equipment or sufficient electricity access.",
    "status": "changed (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "S5"
    ]
  },
  {
    "id": "medishield",
    "country": "Singapore",
    "level": "national",
    "name": "MediShield Life",
    "type": "health",
    "run_by": "Ministry of Health / Central Provident Fund Board",
    "who": "Singapore citizens and permanent residents under the lifelong scheme.",
    "gives": "Current policy-year claim maximum S$200,000; treatment limits and patient cost sharing apply.",
    "delivery": "Insurance payment for covered care through health-service institutions.",
    "documents": "Current treatment claim and financial-support checklist not fully verified.",
    "portable": "partly",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "partly",
    "heat_relevance": "INFERRED: qualifying hospital treatment could cushion a heat health shock; no paid heat-claims series was read.",
    "status": "changed (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "S9",
      "S10"
    ]
  },
  {
    "id": "medisave",
    "country": "Singapore",
    "level": "national",
    "name": "MediSave",
    "type": "health",
    "run_by": "Central Provident Fund Board / Ministry of Health",
    "who": "Citizens and permanent residents with applicable account and withdrawal eligibility.",
    "gives": "Own medical savings under withdrawal limits; not a new public cash grant.",
    "delivery": "Approved medical payments and insurance premiums.",
    "documents": "Current application checklist not verified.",
    "portable": "unknown",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "unknown",
    "heat_relevance": "INFERRED: balances may help pay eligible care, while reducing savings available for later needs.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "S10"
    ]
  },
  {
    "id": "medifund",
    "country": "Singapore",
    "level": "national",
    "name": "MediFund",
    "type": "health",
    "run_by": "Ministry of Health / approved institutions and MediFund Committees",
    "who": "Subsidised citizens with difficulty paying remaining bills after other support.",
    "gives": "Case-specific medical-bill assistance; no fixed grant.",
    "delivery": "Medical social workers and institutional committee assessment.",
    "documents": "Financial, health and household assessment records; full checklist varies and was not extracted.",
    "portable": "unknown",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "partly",
    "heat_relevance": "INFERRED: residual heat-related bills may qualify under assessment; actual heat approvals were not measured.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "S11"
    ]
  },
  {
    "id": "chas",
    "country": "Singapore",
    "level": "national",
    "name": "Community Health Assist Scheme",
    "type": "health",
    "run_by": "Ministry of Health",
    "who": "Singapore citizens; subsidy card and service categories determine support.",
    "gives": "CHAS Blue common-illness subsidy up to S$18.50/visit; other categories differ.",
    "delivery": "Participating GP and dental clinics.",
    "documents": "Applicable eligibility/card and identity records; current checklist not fully verified.",
    "portable": "partly",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "partly",
    "heat_relevance": "No specific heat-diagnosis subsidy decision was verified; subsidised visits are not necessarily free.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "S12"
    ]
  },
  {
    "id": "wica",
    "country": "Singapore",
    "level": "national",
    "name": "Work Injury Compensation Act benefits",
    "type": "insurance",
    "run_by": "Ministry of Manpower / employers, platform operators and insurers as applicable",
    "who": "Covered workers with qualifying work-related injury or occupational disease.",
    "gives": "Medical leave wages, medical expenses up to S$53,000 or one year, and applicable incapacity/death compensation.",
    "delivery": "Work-injury reporting, medical assessment and compensation process.",
    "documents": "Work-relatedness, medical and employment evidence; full checklist not extracted.",
    "portable": "unknown",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "yes",
    "heat_relevance": "KNOWN rule: heat-related work illness can support a claim; actual receipt and processing by heat diagnosis were not verified.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "S13",
      "S14",
      "S15"
    ]
  },
  {
    "id": "pcp",
    "country": "Singapore",
    "level": "national",
    "name": "Primary Care Plan for eligible migrant workers",
    "type": "health",
    "run_by": "Ministry of Manpower / contracted Anchor Operators and employers",
    "who": "Specified Work Permit/S Pass holders in covered dormitories or CMP sectors; domestic workers excluded from this requirement.",
    "gives": "Primary care; current co-pay S$5 for physical consultation and S$2 telemedicine.",
    "delivery": "Employer purchase, designated clinics, telemedicine and listed transport.",
    "documents": "Work-pass/employer enrolment and service registration; full checklist not extracted.",
    "portable": "partly",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "partly",
    "heat_relevance": "INFERRED: acute care may help; emergency specialist/hospital bills and heat-related wage loss need separate routes.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "S16",
      "S17",
      "S18"
    ]
  },
  {
    "id": "efswcl",
    "country": "Singapore",
    "level": "national",
    "name": "Enterprise Financing Scheme - SME Working Capital Loan",
    "type": "credit",
    "run_by": "Enterprise Singapore / participating financial institutions",
    "who": "Eligible Singapore-registered enterprises with local equity and SME criteria.",
    "gives": "Up to S$500,000 per borrower over up to five years; lender sets interest. Borrower repays 100%.",
    "delivery": "Participating lender assessment; enterprise application system.",
    "documents": "Business, ownership and financial records; lender-specific checklist not extracted.",
    "portable": "unknown",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "partly",
    "heat_relevance": "Business cashflow support rather than household heat insurance; government risk share is not borrower debt relief.",
    "status": "changed (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "S24"
    ]
  },
  {
    "id": "actfund",
    "country": "Singapore",
    "level": "national",
    "name": "Agri-food Cluster Transformation Fund",
    "type": "livelihood",
    "run_by": "Singapore Food Agency",
    "who": "Eligible local farms with a valid SFA farm licence and approved project.",
    "gives": "Technology and capability grants; component-specific rates. ACT Fund 2 is available from 2026.",
    "delivery": "Business Grants Portal with CorpPass and project assessment.",
    "documents": "Farm licence, proposal and component-specific records.",
    "portable": "unknown",
    "speed": "Around 12-20 weeks to process a complete application; disbursement time not verified.",
    "shock_responsive": "unknown",
    "heat_relevance": "Adaptation-related farm investment support, without a verified heat crop-loss or household-income payout.",
    "status": "changed (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "S25"
    ]
  }
]
```
## C. ACCESS LADDER

```json
[
  {
    "scheme": "smta",
    "group": "Assisted households, national",
    "step": "received",
    "finding": "2024: 20825 households received ComCare SMTA.",
    "grade": "KNOWN",
    "limit": "Household receipt, not the share of eligible households reached, persons protected or a heat subgroup.",
    "sources": [
      "S29"
    ]
  },
  {
    "scheme": "lta",
    "group": "Assisted households, national",
    "step": "received",
    "finding": "2024: 3240 households received ComCare LTA.",
    "grade": "KNOWN",
    "limit": "Historical national series; other household members are not necessarily benefit recipients.",
    "sources": [
      "S29"
    ]
  },
  {
    "scheme": "allcomcare",
    "group": "Households across included schemes",
    "step": "received",
    "finding": "2024: overall ComCare household count is 29291.",
    "grade": "KNOWN",
    "limit": "Scheme rows can overlap; counts are not additive and no current heat denominator is available.",
    "sources": [
      "S29"
    ]
  },
  {
    "scheme": "wis",
    "group": "Lower-income workers, cumulative",
    "step": "received",
    "finding": "As at February 2026, up to work year 2025: 1.13 million workers received WIS cumulatively.",
    "grade": "KNOWN",
    "limit": "Not annual reach, all eligible workers or people exposed to heat.",
    "sources": [
      "S6"
    ]
  }
]
```

No linked current aware, eligible, documented, applied, enrolled, adequate or on-time ladder was verified for the heat-exposed groups. PCP perceptions are retained in section D rather than assigned to receipt or adequacy stages; allcomcare denotes a multi-scheme statistical concept.
## D. HEAT AND SOCIAL PROTECTION EVIDENCE

```json
[
  {
    "by": "National University of Singapore Medicine, 2024",
    "title": "Heat stress causes lower fertility, productivity and reduced cognitive capacity: Project HeatSafe",
    "url": "https://medicine.nus.edu.sg/news/heat-stress-causes-lower-fertility-productivity-and-reduced-cognitive-capacity-project-heatsafe/",
    "type": "Agency report",
    "where": "Singapore",
    "scale": "Research summary: 355 workers and 214 employers; workplace monitoring in 24 sites",
    "finding": "INFERRED monetary valuation: productivity loss corresponded to a median S$21 per worker per hot day. This is not observed wage loss; workplace and station WBGT agreement declined as heat increased.",
    "effect": "unclear",
    "limit": "University research summary rather than the full underlying papers; no social-protection treatment comparison or heat-benefit effect.",
    "sources": [
      "S20"
    ]
  },
  {
    "by": "Ministry of Manpower, 2026",
    "title": "Enhanced Primary Care Plan brings healthcare closer to migrant workers while lowering or maintaining costs for almost all employers",
    "url": "https://www.mom.gov.sg/newsroom/press-releases/2026/0806-enhanced-primary-care-plan-appointment-of-new-aos",
    "type": "Agency report",
    "where": "Singapore",
    "scale": "MOM patient survey, May 2025; sample not stated in release",
    "finding": "KNOWN agency-reported perceptions: 92% reported accessible/convenient care and over 96% satisfaction. This describes a migrant care route, without a heat-specific outcome or causal comparator.",
    "effect": "unclear",
    "limit": "Release gives no survey sample or full methods; new PCP provisions start April 2027 and are not evaluated 2026 effects.",
    "sources": [
      "S17"
    ]
  },
  {
    "by": "Ministry of Manpower, current guidance",
    "title": "FAQs on Heat stress measures for outdoor work",
    "url": "https://www.mom.gov.sg/heat-stress-measures-for-outdoor-work/faqs-on-heat-stress-measures-for-outdoor-work",
    "type": "Agency report",
    "where": "Singapore",
    "scale": "Official heat-work and compensation guidance",
    "finding": "KNOWN policy finding: work-related heat illness can lead to compensation claims; specified hourly heat-rest breaks are considered paid working hours. No measured paid-claim or mortality effect is stated.",
    "effect": "unclear",
    "limit": "Policy evidence, not an impact study or actual receipt measure; entitlement depends on covered work and claim conditions.",
    "sources": [
      "S14",
      "S15"
    ]
  }
]
```
## E. DELIVERY ROUTES AND ORGANISATIONS

```json
[
  {
    "id": "ssos",
    "name": "Social Service Offices",
    "kind": "government",
    "does": "Assess ComCare applications in person and link households to other support.",
    "where": "Singapore",
    "reach_reported": "No comparable completed-to-paid heat-specific count read.",
    "reach_independent": "",
    "evaluations": "",
    "url": "https://ask.gov.sg/msf/questions/cls1lenhf00lsjzsgm0r5ahon?from=quicklinks",
    "sources": [
      "S1"
    ]
  },
  {
    "id": "supportgowhere",
    "name": "SupportGoWhere",
    "kind": "digital platform",
    "does": "Official FAQs route applicants to online ComCare applications.",
    "where": "Singapore",
    "reach_reported": "No independent application-success estimate verified.",
    "reach_independent": "",
    "evaluations": "",
    "url": "https://ask.gov.sg/msf/questions/cls1lenhf00lsjzsgm0r5ahon?from=quicklinks",
    "sources": [
      "S1"
    ]
  },
  {
    "id": "cpfb",
    "name": "Central Provident Fund Board",
    "kind": "government",
    "does": "Uses administrative records and payment channels for worker income support.",
    "where": "Singapore",
    "reach_reported": "Cumulative WIS reach is reported separately in section C; not local assistance-provider impact.",
    "reach_independent": "",
    "evaluations": "",
    "url": "https://www.cpf.gov.sg/member/growing-your-savings/government-support/workfare-income-supplement",
    "sources": [
      "S6"
    ]
  },
  {
    "id": "medicalsocialworkers",
    "name": "Medical social workers at MediFund-approved institutions",
    "kind": "government",
    "does": "Help assess residual medical-bill needs and financing options.",
    "where": "Singapore",
    "reach_reported": "No heat-specific assisted-claim or timely receipt count read.",
    "reach_independent": "",
    "evaluations": "",
    "url": "https://www.moh.gov.sg/managing-expenses/schemes-and-subsidies/medifund/",
    "sources": [
      "S11"
    ]
  },
  {
    "id": "aos",
    "name": "Primary Care Plan Anchor Operators",
    "kind": "government",
    "does": "Deliver contracted primary care, clinic access, telemedicine and service links.",
    "where": "Singapore",
    "reach_reported": "MOM reports May 2025 patient-survey perceptions; future 2027 projected reach is not included.",
    "reach_independent": "",
    "evaluations": "",
    "url": "https://www.mom.gov.sg/primary-care-plan/getting-primary-care-services",
    "sources": [
      "S17",
      "S18"
    ]
  },
  {
    "id": "healthserve",
    "name": "HealthServe",
    "kind": "civil society",
    "does": "Own service pages describe free WICA and medical casework, with administrative and hospital support.",
    "where": "Singapore migrant-worker community",
    "reach_reported": "No independently verified heat-specific reach figure extracted.",
    "reach_independent": "",
    "evaluations": "",
    "url": "https://help.healthserve.org.sg/need-help-or-advice/",
    "sources": [
      "S21",
      "S22"
    ]
  },
  {
    "id": "twc2",
    "name": "Transient Workers Count Too",
    "kind": "civil society",
    "does": "Reports casework, social support and multilingual contact routes for migrant workers.",
    "where": "Singapore",
    "reach_reported": "Own 2026 page: over 20,000 digital contacts yearly and about 1,500 service-station contacts.",
    "reach_independent": "",
    "evaluations": "",
    "url": "https://twc2.org.sg/helping-workers-in-need/",
    "sources": [
      "S23"
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
      "S30"
    ]
  }
]
```
## F. MAP INDICATOR CATALOGUE

```json
[
  {
    "id": "wbgt",
    "layer": "exposure",
    "indicator": "Station WBGT observations",
    "definition": "Published rolling 15-minute average composite measure, updated at 15-minute intervals; retain station and observation timestamp.",
    "unit": "degrees C WBGT",
    "unit_of_place": "city",
    "year": 2026,
    "publisher": "National Environment Agency",
    "url": "https://data.gov.sg/datasets/d_87884af1f85d702d4f74c6af13b4853d/view",
    "licence": "Singapore Open Data Licence",
    "access": "open download",
    "format": "API",
    "update": "15 minutes",
    "place_code": "Station identifiers and coordinates; spatial point overlay, not area code",
    "limit": "KNOWN station observations, native point level. Not individual or workplace exposure; missing values and later corrections occur. [S28]"
  },
  {
    "id": "wbgtshare",
    "layer": "exposure",
    "indicator": "Share of valid observations classified high heat stress",
    "definition": "Proposed station-level fraction of observations carrying the published high heat-stress category over an explicit period, with missing-data completeness shown.",
    "unit": "percent of valid observations",
    "unit_of_place": "city",
    "year": 2026,
    "publisher": "National Environment Agency; project derivation",
    "url": "https://data.gov.sg/datasets/d_87884af1f85d702d4f74c6af13b4853d/view",
    "licence": "Singapore Open Data Licence",
    "access": "open download",
    "format": "API",
    "update": "Derived daily or monthly",
    "place_code": "Same station keys as wbgt",
    "limit": "INFERRED analytical summary; not a planning-area estimate or percentage of people harmed. No values calculated. [S28]"
  },
  {
    "id": "hotnightcontext",
    "layer": "exposure",
    "indicator": "Hot-night city context from ERA5",
    "definition": "Proposed count of local days with minimum 2 m temperature above 28 degrees C; analytical threshold.",
    "unit": "days/year",
    "unit_of_place": "city",
    "year": 2025,
    "publisher": "Copernicus Climate Change Service / ECMWF",
    "url": "https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels?tab=overview",
    "licence": "CC-BY licence displayed",
    "access": "registration",
    "format": "other",
    "update": "Source daily; map annual",
    "place_code": "Grid coordinates; city boundary overlay",
    "limit": "INFERRED; native 0.25 degree grid is too coarse for planning-area comparisons. Do not paint neighbourhood differences from it. [S31]"
  },
  {
    "id": "olderresidents",
    "layer": "vulnerability",
    "indicator": "Resident population aged 65 and over",
    "definition": "Sum published census five-year bands aged 65+ and divide by the same row resident total.",
    "unit": "percent of resident population",
    "unit_of_place": "district",
    "year": 2020,
    "publisher": "Singapore Department of Statistics",
    "url": "https://data.gov.sg/datasets/d_d95ae740c0f8961a0b10435836660ce0/view",
    "licence": "Singapore Open Data Licence",
    "access": "open download",
    "format": "CSV",
    "update": "Census; catalogue says every ten years",
    "place_code": "Planning-area/subzone names in table; compatible Master Plan 2019 vintage, but numeric shared code not verified",
    "limit": "KNOWN census base with proposed calculation. Smallest published unit is subzone; district here means aggregated planning area. Non-resident workers are absent. [S26]"
  },
  {
    "id": "youngresidents",
    "layer": "vulnerability",
    "indicator": "Resident children under five",
    "definition": "Use the published 0-4 census group divided by the same resident total, aggregated to planning area.",
    "unit": "percent of resident population",
    "unit_of_place": "district",
    "year": 2020,
    "publisher": "Singapore Department of Statistics",
    "url": "https://data.gov.sg/datasets/d_d95ae740c0f8961a0b10435836660ce0/view",
    "licence": "Singapore Open Data Licence",
    "access": "open download",
    "format": "CSV",
    "update": "Census cycle",
    "place_code": "Same names and vintage as olderresidents",
    "limit": "No personal records; not a child-benefit eligibility count. Never add subzones and planning-area totals together. [S26]"
  },
  {
    "id": "comcare",
    "layer": "coverage",
    "indicator": "Households receiving ComCare, national",
    "definition": "Use the annual scheme-specific and overall counts with their defined household denominator and overlap warning.",
    "unit": "households/year",
    "unit_of_place": "city",
    "year": 2024,
    "publisher": "MSF / Singapore Department of Statistics",
    "url": "https://data.gov.sg/datasets/d_5521441aca9643a2021417e096ea65d0/view",
    "licence": "Singapore Open Data Licence",
    "access": "open download",
    "format": "CSV",
    "update": "Annual",
    "place_code": "Country code SGP only; no planning-area field in this table",
    "limit": "KNOWN receipt counts; national dashboard context, not a neighbourhood choropleth or eligible coverage rate. [S29]"
  },
  {
    "id": "wisreach",
    "layer": "coverage",
    "indicator": "Cumulative WIS recipients",
    "definition": "Reported cumulative lower-income worker reach up to the stated work-year cutoff; no denominator is supplied.",
    "unit": "workers, cumulative",
    "unit_of_place": "city",
    "year": 2026,
    "publisher": "Central Provident Fund Board",
    "url": "https://www.cpf.gov.sg/member/growing-your-savings/government-support/workfare-income-supplement",
    "licence": "Source reuse terms not verified",
    "access": "open download",
    "format": "other",
    "update": "Dated webpage update",
    "place_code": "SGP only",
    "limit": "National cumulative measure; cannot be spatially allocated, annualised or treated as heat-specific receipt. [S6]"
  },
  {
    "id": "heatclaimavailable",
    "layer": "system",
    "indicator": "Heat-related WICA claim route",
    "definition": "Official recognition of work-related heat illness and qualifying compensation, with actual claims unknown.",
    "unit": "availability and benefit conditions",
    "unit_of_place": "city",
    "year": 2026,
    "publisher": "Ministry of Manpower",
    "url": "https://www.mom.gov.sg/heat-stress-measures-for-outdoor-work/faqs-on-heat-stress-measures-for-outdoor-work",
    "licence": "Project may publish independently written factual records; source rights remain separate",
    "access": "open download",
    "format": "other",
    "update": "Rule or guidance revision",
    "place_code": "SGP; national legal framework",
    "limit": "KNOWN rule, not automatic case approval, paid receipt or full population coverage. [S13, S14, S15]"
  },
  {
    "id": "pcpavailable",
    "layer": "system",
    "indicator": "PCP scope and current service terms",
    "definition": "Covered migrant-worker groups, clinic zones and current S$5 physical/S$2 telemedicine co-pay, with announced 2027 change separate.",
    "unit": "service availability and SGD/visit",
    "unit_of_place": "city",
    "year": 2026,
    "publisher": "Ministry of Manpower",
    "url": "https://www.mom.gov.sg/newsroom/press-releases/2026/0806-enhanced-primary-care-plan-appointment-of-new-aos",
    "licence": "New factual table with attribution; source rights separate",
    "access": "open download",
    "format": "other",
    "update": "Service or policy revision",
    "place_code": "Service zones and postal prefixes differ from planning areas; no shared code",
    "limit": "Coverage rules do not identify all migrants, healthcare need or effective heat treatment. [S16, S17, S18]"
  }
]
```
## G. A MINIMUM VIABLE MAP

A minimum viable map can use two substantive layers at planning-area level: census 2020 resident share aged 65+ and observed station WBGT as points. Use the opened Master Plan 2019 Planning Area Boundary (No Sea) GeoJSON, which lists PLN_AREA_N and PLN_AREA_C. The census explicitly uses Master Plan 2019, so its place names can be checked against PLN_AREA_N; the census numeric code domain was not verified. [S26, S27, S28]

The join is a documented name crosswalk for census planning-area rows and a spatial point-in-polygon operation for station coordinates. A station marker can identify the area containing it, but its temperature is not assigned as the mean of that area. Areas without stations retain no local observed heat value. The table distinguishes measured points from residential age context. [S26, S27, S28]

A third layer can be a national system-availability panel for WICA's heat-related claim route, which opens from every place. It is a factual legal-context layer, not a claim that every resident or worker qualifies. National ComCare receipt is a separate context chart rather than an allocated local count. [S13, S14, S15, S29]

These observed-data and census layers are available under the Singapore Open Data Licence. The project can openly license its own independently authored scheme facts; source pages retain their own terms. No data pipeline or completed spatial join was run. [S26, S27, S28, S29]

This map cannot show migrant-worker residence or worksite exposure from the resident census, individual eligibility, local benefit receipt, heat-claim success, actual wage loss, indoor conditions or sufficient cooling. Census data and live observations also refer to different periods. A larger older-resident share does not imply a larger protected population. [S26, S20]

The open WBGT series starts in February 2025, so no earlier observations are invented. Retain station completeness and timestamps; research summarised by NUS found that workplace and station WBGT agreement declined with heat, which limits what a nearby station can represent. [S28, S20]
## H. WHERE NO SYSTEM RESPONDS

- Self-employed workers' lost hot-day earnings: WIS depends on qualifying work and income; a universal paid heat work-stoppage entitlement was not verified. WICA coverage of employees and covered platform work does not establish coverage of every self-employed person. [S6, S7, S15]
- Work-related heat illness: a claim route exists, but eligibility, medical evidence and claim acceptance stand between illness and compensation. Actual heat-specific receipt was not measured in the sources read. [S13, S14]
- Migrant-worker healthcare: PCP eligibility excludes migrant domestic workers from this requirement, and other migrant groups have different routes. Citizen or permanent-resident health cover is not a proxy for all migrant cover. [S16, S10]
- Cooling costs: U-Save reaches eligible households under housing and scheme rules; it is not a guarantee of cooling equipment, tolerable indoor temperatures or support for every tenancy. [S5]
- Agricultural loss: ACT supports farm investment and EFS-WCL supports business cashflow. Neither opened rule is crop-loss insurance or household heat-income compensation. [S24, S25]
- Heat-triggered public anticipatory cash, general asset-loss cover and debt relief: no standing heat-specific entitlement was verified in the public sources read. This is a bounded evidence gap, not a claim that no assistance is available. [S5, S13, S24]
## I. OPEN QUESTIONS

```json
[
  {
    "id": "claims",
    "q": "How often do work-related heat illnesses move from report to accepted and paid WICA claim?",
    "have": "Heat is recognised and benefit types are published; heat-specific process counts were not verified. [S13, S14, S15]",
    "could": "Secure aggregate reporting of notified, filed, accepted and paid claims with time intervals and broad worker categories.",
    "scale": "Illustrative: all available cases across several hot seasons; no individual case details published."
  },
  {
    "id": "pcpcost",
    "q": "Does PCP access reduce total costs and delayed care during hot periods for covered migrant workers?",
    "have": "A patient-experience survey exists, without a heat-specific causal comparison. [S17]",
    "could": "Prospective hot-season facility and worker survey with pre-specified comparison periods, full care costs and aggregate results.",
    "scale": "Illustrative: 10-15 clinics; final size based on expected heat case volume."
  },
  {
    "id": "restpay",
    "q": "How consistently do workers receive and use paid heat-rest breaks?",
    "have": "Official guidance recognises specified breaks as paid work; implementation outcomes were not verified. [S14]",
    "could": "Confidential worker and employer survey plus aggregate work-schedule observations across heat levels, without individual tracking.",
    "scale": "Illustrative: 40-60 worksites across several exposed sectors."
  },
  {
    "id": "ladder",
    "q": "Which access steps explain non-receipt of temporary support during heat-related household income loss?",
    "have": "National ComCare receipt counts and assisted-application routes exist. [S1, S29]",
    "could": "Representative repeated household survey measuring awareness through on-time receipt, including explicit residency eligibility checks.",
    "scale": "Illustrative: 1,500-2,000 households over two hot seasons."
  }
]
```
## J. SOURCES

```json
[
  {
    "key": "S1",
    "url": "https://ask.gov.sg/msf/questions/cls1lenhf00lsjzsgm0r5ahon?from=quicklinks",
    "title": "How do I apply for the ComCare Short-to-Medium-Term Assistance (SMTA)?",
    "by": "Ministry of Social and Family Development",
    "year": null,
    "type": "Government page",
    "where": "Singapore",
    "finding": "Official FAQ describes SupportGoWhere and in-person SSO applications, household identity and bank documents, and relevant supporting records.",
    "limit": "Application requirements are not measured application success or payment speed.",
    "expect": [
      "SupportGoWhere",
      "bank balance",
      "Singpass"
    ]
  },
  {
    "key": "S2",
    "url": "https://ask.gov.sg/msf/questions/cm7iuhxgq015iyb4u6ij6meyp?from=topics",
    "title": "How much more ComCare Short-to-Medium-Term Assistance (SMTA) cash assistance can I expect to receive under the new rates announced in Budget 2025?",
    "by": "Ministry of Social and Family Development",
    "year": null,
    "type": "Government page",
    "where": "Singapore",
    "finding": "SMTA covers assessed income shortfall against basic expenses; amount depends on composition, needs and income.",
    "limit": "No single fixed household rate or measured heat adequacy is provided.",
    "expect": [
      "Household composition",
      "Specific needs",
      "Income level"
    ]
  },
  {
    "key": "S3",
    "url": "https://ask.gov.sg/msf/questions/cm7itoel70155yb4uyejmqsbn",
    "title": "How much more ComCare Long-Term Assistance (LTA) will I receive under the new rates announced in Budget 2025?",
    "by": "Ministry of Social and Family Development",
    "year": null,
    "type": "Government page",
    "where": "Singapore",
    "finding": "Rates effective April 2025 include S$760 monthly for a one-person household and S$1,250 for two people.",
    "limit": "Published rate depends on household size; it does not measure actual receipt or heat-related sufficiency.",
    "expect": [
      "$760",
      "$1,250",
      "April 2025"
    ]
  },
  {
    "key": "S4",
    "url": "https://ask.gov.sg/msf/questions/cls1lenha00j3jzsg08fudd5y?from=topics",
    "title": "How long is the ComCare assistance given for?",
    "by": "Ministry of Social and Family Development",
    "year": null,
    "type": "Government page",
    "where": "Singapore",
    "finding": "SMTA is typically granted for 3-6 months initially; LTA concerns people permanently unable to work with little means or support.",
    "limit": "Benefit duration is distinct from application processing or payment delay.",
    "expect": [
      "3 to 6 months",
      "permanently unable to work",
      "Social Service Office"
    ]
  },
  {
    "key": "S5",
    "url": "https://www.gov.sg/features/cost-of-living/",
    "title": "Managing Cost of Living in Singapore",
    "by": "Government of Singapore",
    "year": 2026,
    "type": "Government page",
    "where": "Singapore",
    "finding": "Updated 4 November 2026: lists June 2026 S$500 CDC vouchers, enhanced Interim Assistance and additional U-Save rebates.",
    "limit": "Tranches have different dates; announced 2027 support is not a 2026 receipt count.",
    "expect": [
      "4 November 2026",
      "$500",
      "$250"
    ]
  },
  {
    "key": "S6",
    "url": "https://www.cpf.gov.sg/member/growing-your-savings/government-support/workfare-income-supplement",
    "title": "Workfare Income Supplement",
    "by": "Central Provident Fund Board",
    "year": 2026,
    "type": "Government page",
    "where": "Singapore",
    "finding": "Current page lists citizen and earnings tests, payment channels and cumulative disbursement to 1.13 million workers as of February 2026, up to work year 2025.",
    "limit": "Cumulative reach is not annual eligible coverage. Opened maximum-payment table labels work year 2025, not 2026.",
    "expect": [
      "1.13 million",
      "February 2026",
      "40%"
    ]
  },
  {
    "key": "S7",
    "url": "https://www.cpf.gov.sg/member/tools-and-services/calculators/workfare-income-supplement-employee-work-year-2026-calculator",
    "title": "Workfare Income Supplement Employee Work Year 2026 Calculator",
    "by": "Central Provident Fund Board",
    "year": 2026,
    "type": "Government page",
    "where": "Singapore",
    "finding": "Current work-year calculator describes an earnings-dependent amount and payment two months after the month worked.",
    "limit": "Calculator output is an estimate; no individual calculation was submitted.",
    "expect": [
      "Work Year 2026",
      "$3,000",
      "two months"
    ]
  },
  {
    "key": "S8",
    "url": "https://www.mom.gov.sg/employment-practices/silver-support-scheme",
    "title": "Silver Support Scheme",
    "by": "Ministry of Manpower",
    "year": null,
    "type": "Government page",
    "where": "Singapore",
    "finding": "Eligible citizens aged 65+ are assessed automatically; quarterly amounts range from S$215 to S$1,080 across listed bands.",
    "limit": "Income, property and work-history tests apply; quarterly entitlement is not measured receipt or adequacy.",
    "expect": [
      "$1,080",
      "$215",
      "No application is needed"
    ]
  },
  {
    "key": "S9",
    "url": "https://www.moh.gov.sg/managing-expenses/schemes-and-subsidies/medishield-life/medishield-life-benefits/",
    "title": "MediShield Life Benefits",
    "by": "Ministry of Health",
    "year": 2026,
    "type": "Government page",
    "where": "Singapore",
    "finding": "Benefits applicable from 1 June 2026 include a S$200,000 policy-year maximum and specified treatment limits.",
    "limit": "Claim limits do not imply full bill payment; heat-specific paid claims were not provided.",
    "expect": [
      "1 June 2026",
      "$200,000",
      "No Limit"
    ]
  },
  {
    "key": "S10",
    "url": "https://www.moh.gov.sg/managing-expenses/keeping-healthcare-affordable/managing-medical-bills/",
    "title": "Managing medical bills",
    "by": "Ministry of Health",
    "year": 2024,
    "type": "Government page",
    "where": "Singapore",
    "finding": "Explains subsidies, MediSave, MediShield Life and MediFund; MediShield Life covers citizens and permanent residents, while MediSave is medical saving.",
    "limit": "Illustrative bill amounts in the older page are not treated as current 2026 claim rates.",
    "expect": [
      "MediSave",
      "Permanent Residents",
      "MediFund"
    ]
  },
  {
    "key": "S11",
    "url": "https://www.moh.gov.sg/managing-expenses/schemes-and-subsidies/medifund/",
    "title": "MediFund",
    "by": "Ministry of Health",
    "year": 2024,
    "type": "Government page",
    "where": "Singapore",
    "finding": "Eligible subsidised citizens can seek help with remaining medical bills through medical social workers and institutional committees.",
    "limit": "Case-specific assessment, not a fixed grant or automatic full-bill waiver.",
    "expect": [
      "Medical Social Workers",
      "Singapore citizen",
      "MediFund Committee"
    ]
  },
  {
    "key": "S12",
    "url": "https://www.moh.gov.sg/managing-expenses/schemes-and-subsidies/chas/",
    "title": "Community Health Assist Scheme (CHAS)",
    "by": "Ministry of Health",
    "year": 2025,
    "type": "Government page",
    "where": "Singapore",
    "finding": "Citizens can receive listed subsidies at participating clinics; CHAS Blue common-illness subsidy is up to S$18.50/visit.",
    "limit": "Patient pays charges after subsidy; an explicit heat-diagnosis payment record was not verified.",
    "expect": [
      "$18.50",
      "Common illness",
      "Singapore Citizens"
    ]
  },
  {
    "key": "S13",
    "url": "https://www.mom.gov.sg/workplace-safety-and-health/work-injury-compensation/types-of-compensation",
    "title": "Types of compensation under WICA",
    "by": "Ministry of Manpower",
    "year": null,
    "type": "Government page",
    "where": "Singapore",
    "finding": "Lists medical leave wages, medical expenses and incapacity/death compensation; medical expenses up to S$53,000 or one year, whichever first.",
    "limit": "Qualification and causation conditions apply; limits are not automatic household payments.",
    "expect": [
      "$53,000",
      "Medical leave wages",
      "one year"
    ]
  },
  {
    "key": "S14",
    "url": "https://www.mom.gov.sg/heat-stress-measures-for-outdoor-work/faqs-on-heat-stress-measures-for-outdoor-work",
    "title": "FAQs on Heat stress measures for outdoor work",
    "by": "Ministry of Manpower",
    "year": null,
    "type": "Government page",
    "where": "Singapore",
    "finding": "Clarifies work-related heat illness and injury can lead to WICA claims; specified heat-rest breaks are considered paid working hours.",
    "limit": "Guidance is not a paid-claim dataset or an evaluation of worker access or outcomes.",
    "expect": [
      "paid working hours",
      "WICA",
      "heat-related illness"
    ]
  },
  {
    "key": "S15",
    "url": "https://www.mom.gov.sg/workplace-safety-and-health/od-under-wsha-and-wica",
    "title": "Updated coverage of reportable and compensable occupational diseases (ODs) under WSHA and WICA",
    "by": "Ministry of Manpower",
    "year": 2025,
    "type": "Government page",
    "where": "Singapore",
    "finding": "Current harmonised list includes diseases caused by excessive heat and discusses employees and platform workers.",
    "limit": "List membership does not establish acceptance or payment for an individual case; no new heat-listing date is inferred.",
    "expect": [
      "Diseases caused by excessive heat",
      "1 December 2025",
      "platform workers"
    ]
  },
  {
    "key": "S16",
    "url": "https://www.mom.gov.sg/primary-care-plan/what-is-pcp",
    "title": "What is the Primary Care Plan (PCP)",
    "by": "Ministry of Manpower",
    "year": null,
    "type": "Government page",
    "where": "Singapore",
    "finding": "PCP is required for specified Work Permit/S Pass holders in covered dormitories or construction, marine shipyard and process sectors.",
    "limit": "Migrant domestic workers are excluded from this PCP requirement; other migrant-worker rules differ.",
    "expect": [
      "7 or more",
      "Construction",
      "MDWs"
    ]
  },
  {
    "key": "S17",
    "url": "https://www.mom.gov.sg/newsroom/press-releases/2026/0806-enhanced-primary-care-plan-appointment-of-new-aos",
    "title": "Enhanced Primary Care Plan brings healthcare closer to migrant workers while lowering or maintaining costs for almost all employers",
    "by": "Ministry of Manpower",
    "year": 2026,
    "type": "Government page",
    "where": "Singapore",
    "finding": "August 2026 release reports May 2025 patient-survey results: over 96% satisfaction and 92% accessible/convenient care. New PCP arrangements begin 1 April 2027.",
    "limit": "Release does not provide the survey sample or full methods; self-reported access is not heat treatment or health impact.",
    "expect": [
      "96%",
      "92%",
      "May 2025"
    ]
  },
  {
    "key": "S18",
    "url": "https://www.mom.gov.sg/primary-care-plan/getting-primary-care-services",
    "title": "Getting primary care services under the Primary Care Plan (PCP)",
    "by": "Ministry of Manpower",
    "year": null,
    "type": "Government page",
    "where": "Singapore",
    "finding": "Lists acute/chronic consultations, telemedicine, transport and designated clinic zones.",
    "limit": "Clinic directory and service scope do not measure actual timely use or universal cross-zone portability.",
    "expect": [
      "Telemedicine",
      "Zone A",
      "acute conditions"
    ]
  },
  {
    "key": "S19",
    "url": "https://www.mom.gov.sg/newsroom/press-releases/2026/0828-enhancements-to-heat-stress-framework",
    "title": "MOM Enhances Heat Stress Protection for Workers Amid Rising Heat Risks",
    "by": "Ministry of Manpower",
    "year": 2026,
    "type": "Government page",
    "where": "Singapore",
    "finding": "August announcement states enhanced requirements take effect on 1 December 2026.",
    "limit": "Future effective date relative to this research; no post-implementation health effect is claimed.",
    "expect": [
      "1 December 2026",
      "28 August 2026",
      "training"
    ]
  },
  {
    "key": "S20",
    "url": "https://medicine.nus.edu.sg/news/heat-stress-causes-lower-fertility-productivity-and-reduced-cognitive-capacity-project-heatsafe/",
    "title": "Heat stress causes lower fertility, productivity and reduced cognitive capacity: Project HeatSafe",
    "by": "National University of Singapore Medicine",
    "year": 2024,
    "type": "Agency report",
    "where": "Singapore",
    "finding": "Research summary reports surveys of 355 workers and 214 employers, with modelled median productivity-equivalent income loss of S$21 per hot day.",
    "limit": "University summary, not an independent benefit evaluation; productivity valuation is not measured wage loss.",
    "expect": [
      "355",
      "214",
      "S$21"
    ]
  },
  {
    "key": "S21",
    "url": "https://help.healthserve.org.sg/need-help-or-advice/",
    "title": "Need help or advice EN",
    "by": "HealthServe",
    "year": null,
    "type": "Agency report",
    "where": "Singapore",
    "finding": "Own service page describes free casework and assistance with WICA and medical issues for migrant workers.",
    "limit": "No independent scheme-navigation effect or heat-specific receipt rate was read.",
    "expect": [
      "WICA",
      "FREE",
      "special pass"
    ]
  },
  {
    "key": "S22",
    "url": "https://healthserve.org.sg/casework-social-services/",
    "title": "Casework & Social Services",
    "by": "HealthServe",
    "year": null,
    "type": "Agency report",
    "where": "Singapore",
    "finding": "Own materials describe assistance with administrative processes, hospital accompaniment and emergency aid.",
    "limit": "Service description is not an independent impact evaluation.",
    "expect": [
      "Casework",
      "Social Services",
      "emergency financial aid"
    ]
  },
  {
    "key": "S23",
    "url": "https://twc2.org.sg/helping-workers-in-need/",
    "title": "Helping workers in need",
    "by": "Transient Workers Count Too",
    "year": 2026,
    "type": "Agency report",
    "where": "Singapore",
    "finding": "Own service page reports over 20,000 digital contacts each year and about 1,500 personal contacts at service stations.",
    "limit": "Contacts are not unique successful benefit claims; no independent heat outcome was verified.",
    "expect": [
      "20,000",
      "1,500",
      "DIRECT SERVICES"
    ]
  },
  {
    "key": "S24",
    "url": "https://www.enterprisesg.gov.sg/financial-support/enterprise-financing-scheme---sme-working-capital",
    "title": "Enterprise Financing Scheme – SME Working Capital Loan",
    "by": "Enterprise Singapore",
    "year": 2026,
    "type": "Government page",
    "where": "Singapore",
    "finding": "Maximum S$500,000 per borrower, up to five years; temporary 70% government risk share from September 2026 to March 2027.",
    "limit": "Lender assessment applies; borrower repays 100%. Enterprise finance is not a household grant or heat insurance.",
    "expect": [
      "S$500,000",
      "70%",
      "100%"
    ]
  },
  {
    "key": "S25",
    "url": "https://www.sfa.gov.sg/recognition-programmes-grants/grants/agri-food-cluster-transformation-act-fund",
    "title": "Agri-food Cluster Transformation (ACT) Fund",
    "by": "Singapore Food Agency",
    "year": 2026,
    "type": "Government page",
    "where": "Singapore",
    "finding": "Current page describes licensed-farm technology support and ACT Fund 2 funding from 2026. Application processing is around 12-20 weeks for complete applications.",
    "limit": "Project grant conditions apply; processing time is not disbursement time, and no crop-loss entitlement is stated.",
    "expect": [
      "2026",
      "12 - 20 weeks",
      "valid farm licence"
    ]
  },
  {
    "key": "S26",
    "url": "https://data.gov.sg/datasets/d_d95ae740c0f8961a0b10435836660ce0/view",
    "title": "Resident Population by Planning Area/Subzone of Residence, Age Group and Sex (Census of Population 2020)",
    "by": "Singapore Department of Statistics",
    "year": 2021,
    "type": "Government page",
    "where": "Singapore",
    "finding": "Open CSV uses Master Plan 2019 geography and five-year age groups, including 65-69 through 90 and over.",
    "limit": "Residents are not all people present or migrant workers; geographic labels and mixed area/subzone rows need parsing.",
    "expect": [
      "Census of Population 2020",
      "Master Plan 2019",
      "0 - 4"
    ]
  },
  {
    "key": "S27",
    "url": "https://data.gov.sg/datasets/d_4765db0e87b9c86336792efe8a1f7a66/view",
    "title": "Master Plan 2019 Planning Area Boundary (No Sea)",
    "by": "Urban Redevelopment Authority",
    "year": 2025,
    "type": "Government page",
    "where": "Singapore",
    "finding": "Open GeoJSON catalogue lists PLN_AREA_N, PLN_AREA_C, REGION_N and REGION_C.",
    "limit": "Planning boundaries are indicative and may not match existing development; no completed join was executed.",
    "expect": [
      "PLN_AREA_N",
      "PLN_AREA_C",
      "GEOJSON"
    ]
  },
  {
    "key": "S28",
    "url": "https://data.gov.sg/datasets/d_87884af1f85d702d4f74c6af13b4853d/view",
    "title": "Wet Bulb Globe Temperature (WBGT) Observations",
    "by": "National Environment Agency",
    "year": 2025,
    "type": "Government page",
    "where": "Singapore",
    "finding": "API observations average the preceding 15 minutes and update every 15 minutes, with data starting February 2025.",
    "limit": "Automatically published data can have gaps and later corrections; station heat is not workplace heat.",
    "expect": [
      "15 minutes",
      "Feb 2025",
      "Open Data Licence"
    ]
  },
  {
    "key": "S29",
    "url": "https://data.gov.sg/datasets/d_5521441aca9643a2021417e096ea65d0/view",
    "title": "Households Assisted Through Comcare Schemes, Annual",
    "by": "Ministry of Social and Family Development / Singapore Department of Statistics",
    "year": 2026,
    "type": "Government page",
    "where": "Singapore",
    "finding": "2024 data show 29291 households overall, 20825 under SMTA and 3240 under LTA. CSV and API access carry the Open Data Licence.",
    "limit": "National households, not all household members or separate unique persons; scheme counts can overlap.",
    "expect": [
      "29291",
      "20825",
      "3240"
    ]
  },
  {
    "key": "S30",
    "url": "https://www.haqdarshak.com/",
    "title": "Haqdarshak",
    "by": "Haqdarshak",
    "year": null,
    "type": "Agency report",
    "where": "India; Singapore operation not verified",
    "finding": "Own description combines trained local agents with digital scheme discovery and application support.",
    "limit": "Independent assessment link failed, and no local operation or evaluated local effect was verified.",
    "expect": [
      "trained field staff",
      "Haqdarshak agents",
      "Application"
    ]
  },
  {
    "key": "S31",
    "url": "https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels?tab=overview",
    "title": "ERA5 hourly data on single levels from 1940 to present",
    "by": "Copernicus Climate Change Service / ECMWF",
    "year": 2026,
    "type": "Agency report",
    "where": "Global",
    "finding": "Hourly reanalysis, displayed CC-BY licence and daily updates.",
    "limit": "Resolution is too coarse for a neighbourhood-level Singapore heat comparison without validation.",
    "expect": [
      "0.25",
      "GRIB",
      "CC-BY"
    ]
  }
]
```
## K. WHAT I COULD NOT VERIFY

- MSF's main ComCare page, several parliamentary answers and the application infographic presented a JavaScript verification screen. They are not used as opened evidence for approval percentages or processing-time claims; readable official AskGov FAQs supply the rules retained here. [S1, S2, S3, S4]
- SupportGoWhere's application page returned no readable body. Its role is supported by official MSF FAQs, but the live application process was not tested and no personal information was submitted. [S1]
- The opened WIS page labels its maximum-payment table as work year 2025. The separate 2026 calculator confirms current status and timing, but an untested 2026 maximum is not inferred from that older table. [S6, S7]
- MediShield Life's June 2026 package was opened. Actual heat-diagnosis claims, amounts paid, remaining household costs and migrant eligibility beyond each scheme's rules remain unverified. An older illustrative bill is not used as a current rate. [S9, S10]
- Work-related heat illness is explicitly recognised in current MOM guidance. The statute page itself returned 403, so the report relies on the opened official administrative guidance; it does not assert that heat was first added in December 2025. [S14, S15]
- Urban heat exposure and outdoor occupational heat-related illnesses in Singapore was found, but the publisher page returned 403. Its case counts and odds ratios are omitted rather than copied from search snippets.
- The university HeatSafe summary was opened, but the underlying full papers were not independently reviewed. Productivity-equivalent monetary loss is not described as measured wage loss; broader national projections are omitted. [S20]
- The May 2025 PCP survey is summarised in an official 2026 release without sample size or full methods. April 2027 clinic and co-pay changes are not treated as already effective in 2026. [S17]
- A nationwide employment guarantee, construction-specific public welfare fund and a standing public heat anticipatory payment were not verified. WICA and PCP are described under their actual worker and benefit conditions. [S13, S16]
- ACT's component grant percentages and all contractual deadlines were not verified in its linked guidelines. Published processing time is distinct from reimbursement, and government loan risk-sharing is not debt relief for the borrower. [S24, S25]
- Haqdarshak's own digital-and-agent description was read. The JSW assessment PDF returned 404, and local operation or independent Singapore effects were not verified. The other organisations' service accounts also remain separate from independent evaluation. [S21, S22, S23, S30]
- Common service centres, self-help groups, unions, post offices, microfinance and formal legal/paralegal benefit-navigation effects were not independently verified for this country in the sources read. Verified social-work and migrant casework routes are retained without rankings.
- The census contains residents and mixed planning-area/subzone rows. It cannot identify non-resident workers, and no shared census numeric code or completed geography join was verified. National receipt figures are not allocated across planning areas. [S26, S27, S29]
- Three evidence items include a university research summary, an agency-reported patient survey and official policy guidance. No completed causal heat social-protection outcome study or verified heat-specific null effect was opened in this search.
