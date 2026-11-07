# Common Shade: Indonesia - heat and social protection

Research catalogue and Claude Code design handoff. Sources checked on 6 November 2026.

This file contains research, publication limits and a map proposal. It is not a completed geospatial dataset, an eligibility checker or a guarantee of benefit receipt.

For Claude Code: parse the seven JSON arrays under sections B, C, D, E, F, I and J independently. Retain sections A-K, stable source keys, historical years, benefit periods and uncertainty text.

Build an aggregate place explorer with a map, accessible table, scheme drawer, access ladder and source drawer. Reuse Common Shade's existing design system if available; the repository was not inspected in this run.

The proposed place level is province, with an older 2017 boundary option explicitly identified. The schema uses state to mean province and district to mean a Singapore planning area; country is an explicit extension for national-only data. Gridded and station indicators name their native units in the limit field.

Show rules, enrolment, active coverage, receipt, adequacy and outcomes as different concepts. Missing data remain unknown, with a separate visual treatment from zero; use no composite protection score or ranking.

A countrywide scheme availability panel stays separate from subnational benefit coverage. Display future changes with their effective dates, and keep private or humanitarian pilots outside the public-scheme catalogue.

KNOWN means an official rule or measured finding; INFERRED means modelling, projections or second-hand interpretation; UNCERTAIN means a single, unreplicated or contested claim. A published descriptive result can be KNOWN while its causal or wider interpretation remains UNCERTAIN.

Publication gates include unresolved current rules, unclear licences, unparsed data payloads and untested geographic joins. No live data pipeline, map calculation or application test was completed; no personal data are needed for the proposed product.

## A. SUMMARY

- KNOWN: current public sources identify cash, food, health, employment insurance, agricultural insurance and government-linked credit routes. Construction and non-wage workers have different registration routes within BPJS. [I1, I3, I5, I7, I10, I11, I14]
- KNOWN access finding: assisted insurance registration increased historical enrolment, while additional information alone had no effect. Current coverage and active status also differ in the official JKN report. [I16, I9]
- KNOWN heat evidence: insured primary-care visits increased on hotter days, including diabetes and cardiovascular visits. That study does not estimate how much insurance reduced household heat losses. [I15]
- KNOWN contextual evidence: PKH improved some child outcomes but did not increase several household economic outcomes in its historic evaluation. No heat-specific PKH causal effect was verified. [I17, I18]
- INFERRED map design: open climate and modelled population grids can be aggregated to a documented older province geography. Public source metadata reveals a boundary-vintage issue, so current province coverage tables are not silently joined. [Ie, Iw, Ib]
- Thin evidence remains on heat-claim acceptance, payment timeliness, migrant continuity and losses among workers without active contributions. No nationwide automatic heat cash entitlement was verified. [I5, I7, I9]
## B. SCHEMES

```json
[
  {
    "id": "pkh",
    "country": "Indonesia",
    "level": "national",
    "name": "Program Keluarga Harapan",
    "type": "cash",
    "run_by": "Ministry of Social Affairs",
    "who": "Selected low-income families with qualifying family components, using DTSEN.",
    "gives": "Component-based cash; current component rate schedule not verified.",
    "delivery": "Perlinsos and programme delivery; social facilitators.",
    "documents": "Identity and family/component verification; full current checklist not verified.",
    "portable": "unknown",
    "speed": "Phased transfers; actual application-to-payment time unknown.",
    "shock_responsive": "partly",
    "heat_relevance": "INFERRED: resources could help meet hot-season household costs; heat outcomes were not evaluated.",
    "status": "changed (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "I1",
      "I2",
      "I4"
    ]
  },
  {
    "id": "sembako",
    "country": "Indonesia",
    "level": "national",
    "name": "Program Sembako / Bantuan Pangan Non-Tunai",
    "type": "food",
    "run_by": "Ministry of Social Affairs",
    "who": "Selected DTSEN families meeting programme rules.",
    "gives": "Rp200.000,00 per family per month, subject to fiscal capacity.",
    "delivery": "Programme transfer channel; self-service portal identifies the scheme.",
    "documents": "Current application checklist not verified.",
    "portable": "unknown",
    "speed": "Phased disbursement; no observed household delay series verified.",
    "shock_responsive": "partly",
    "heat_relevance": "INFERRED: resources could help meet hot-season household costs; heat outcomes were not evaluated.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "I1",
      "I3",
      "I4"
    ]
  },
  {
    "id": "jkn",
    "country": "Indonesia",
    "level": "national",
    "name": "Jaminan Kesehatan Nasional, including Penerima Bantuan Iuran",
    "type": "health",
    "run_by": "BPJS Kesehatan; government-financed contribution route for eligible groups",
    "who": "Enrolled population; premium assistance has separate eligibility.",
    "gives": "Health-service cover; current PBI premium amount and full package not reverified.",
    "delivery": "Registered primary-care network and referral route; contribution-saving channels also exist.",
    "documents": "Historical evaluation required family and identity documents; current checklist unverified.",
    "portable": "partly",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "partly",
    "heat_relevance": "KNOWN study: insured primary-care visits rise on hot days. This does not verify every heat bill is paid.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "I9",
      "I15",
      "I16"
    ]
  },
  {
    "id": "bpujkk",
    "country": "Indonesia",
    "level": "national",
    "name": "Jaminan Kecelakaan Kerja: Bukan Penerima Upah",
    "type": "insurance",
    "run_by": "BPJS Ketenagakerjaan",
    "who": "Registered and contributing non-wage workers.",
    "gives": "Medically necessary work-injury care and temporary incapacity compensation.",
    "delivery": "BPJS claim route; registration assistance listed in section E.",
    "documents": "NIK or KTP and email for registration; claim documents need a separate check.",
    "portable": "unknown",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "partly",
    "heat_relevance": "Work attribution and acceptance of heat-related claims were not verified.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "I5"
    ]
  },
  {
    "id": "bpujkm",
    "country": "Indonesia",
    "level": "national",
    "name": "Jaminan Kematian: Bukan Penerima Upah",
    "type": "insurance",
    "run_by": "BPJS Ketenagakerjaan",
    "who": "Active contributors and qualifying survivors under programme conditions.",
    "gives": "Death grant Rp20.000.000, periodic grant Rp12.000.000 and funeral Rp10.000.000.",
    "delivery": "Survivor claim through BPJS.",
    "documents": "Current application checklist not verified.",
    "portable": "unknown",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "unknown",
    "heat_relevance": "INFERRED: survivor support could cushion a death-related shock; work and non-work pathways differ.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "I5"
    ]
  },
  {
    "id": "bpujht",
    "country": "Indonesia",
    "level": "national",
    "name": "Jaminan Hari Tua: Bukan Penerima Upah",
    "type": "pension",
    "run_by": "BPJS Ketenagakerjaan",
    "who": "Contributors meeting withdrawal conditions.",
    "gives": "Accumulated contributions plus investment returns; no fixed universal pension.",
    "delivery": "BPJS withdrawal process.",
    "documents": "Current application checklist not verified.",
    "portable": "unknown",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "unknown",
    "heat_relevance": "Savings are distinct from an immediate heat-triggered grant.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "I5"
    ]
  },
  {
    "id": "construction",
    "country": "Indonesia",
    "level": "national",
    "name": "Jaminan Kecelakaan Kerja and Jaminan Kematian: Jasa Konstruksi",
    "type": "insurance",
    "run_by": "BPJS Ketenagakerjaan",
    "who": "Covered construction-project workers.",
    "gives": "JKK treatment and temporary incapacity pay: 100% for the first and second six-month periods, then 50%.",
    "delivery": "Project and BPJS arrangements.",
    "documents": "Current application checklist not verified.",
    "portable": "unknown",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "unknown",
    "heat_relevance": "A relevant outdoor-worker route, with heat-specific paid-claim evidence unverified.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "I6"
    ]
  },
  {
    "id": "jkp",
    "country": "Indonesia",
    "level": "national",
    "name": "Jaminan Kehilangan Pekerjaan",
    "type": "insurance",
    "run_by": "BPJS Ketenagakerjaan / Ministry of Manpower",
    "who": "Qualifying wage workers with employment termination and contribution history.",
    "gives": "60% of reported wage for up to six months; wage ceiling Rp. 5.000.000,00.",
    "delivery": "Monthly claims and labour-market services.",
    "documents": "Termination evidence and active job-search commitment; other conditions apply.",
    "portable": "unknown",
    "speed": "Monthly benefit; actual processing distribution unknown.",
    "shock_responsive": "partly",
    "heat_relevance": "Termination protection does not automatically replace income for a temporary hot day.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "I7"
    ]
  },
  {
    "id": "bsu",
    "country": "Indonesia",
    "level": "national",
    "name": "Bantuan Subsidi Upah 2026",
    "type": "cash",
    "run_by": "Ministry of Manpower",
    "who": "Qualifying citizens active as wage-earner BPJS members through August 2026; wage and other tests apply.",
    "gives": "Rp300.000 monthly for three months, paid once as Rp900.000.",
    "delivery": "BPJS-sourced selection; current page awaits further recipient-check details.",
    "documents": "NIK and administrative employment/wage records; applicant process not fully announced.",
    "portable": "unknown",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "partly",
    "heat_relevance": "General purchasing-power support; no heat forecast trigger verified.",
    "status": "changed (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "I8"
    ]
  },
  {
    "id": "autp",
    "country": "Indonesia",
    "level": "national",
    "name": "Asuransi Usaha Tani Padi",
    "type": "insurance",
    "run_by": "Ministry of Agriculture / implementing insurers",
    "who": "Registered farmer-group members; land and policy conditions apply.",
    "gives": "Farmer premium Rp36.000/ha/season; insured value Rp6.000.000/ha.",
    "delivery": "Extension workers and farmer groups use SIAP; insurer assesses damage.",
    "documents": "AUTP-1 and KTP; current FAQ describes upload by extension workers.",
    "portable": "unknown",
    "speed": "FAQ allows up to 10 days for registration verification; claim-payment time not stated.",
    "shock_responsive": "yes",
    "heat_relevance": "Drought is listed; direct heat loss is not verified as a separate insured peril.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "I11",
      "I12"
    ]
  },
  {
    "id": "kur",
    "country": "Indonesia",
    "level": "national",
    "name": "Kredit Usaha Rakyat: BRI offer",
    "type": "credit",
    "run_by": "Government credit programme / Bank Rakyat Indonesia",
    "who": "Productive viable enterprises meeting lender tests.",
    "gives": "Super-micro up to Rp10 million at 3%; micro above Rp10 million to Rp100 million, starting at 6% yearly.",
    "delivery": "Participating lender; BRI terms checked.",
    "documents": "BRI 2026 offer lists NIB and NPWP; additional lender documents apply.",
    "portable": "unknown",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "partly",
    "heat_relevance": "INFERRED: working capital can help livelihoods, while the full loan remains repayable.",
    "status": "current (as of 2026)",
    "grade": "KNOWN",
    "sources": [
      "I10"
    ]
  },
  {
    "id": "bltdesa",
    "country": "Indonesia",
    "level": "national",
    "name": "Bantuan Langsung Tunai Dana Desa",
    "type": "cash",
    "run_by": "Village governments under village-fund arrangements",
    "who": "Locally selected households under programme conditions; Lubuk Mandarsah description checked.",
    "gives": "Local 2026 description: maximum Rp300.000 per family per month.",
    "delivery": "Village deliberation and local payment arrangements.",
    "documents": "Current application checklist not verified.",
    "portable": "unknown",
    "speed": "Monthly or grouped quarterly in the local description; actual delay unknown.",
    "shock_responsive": "partly",
    "heat_relevance": "INFERRED: resources could help meet hot-season household costs; heat outcomes were not evaluated.",
    "status": "current (as of 2026)",
    "grade": "UNCERTAIN",
    "sources": [
      "I13"
    ]
  },
  {
    "id": "sumatrarelief",
    "country": "Indonesia",
    "level": "state",
    "name": "Bantuan Sosial bagi Korban Bencana Alam di Aceh, Sumatera Utara, dan Sumatera Barat",
    "type": "relief",
    "run_by": "Ministry of Social Affairs",
    "who": "Disaster-affected households under the named regional decision.",
    "gives": "Living, housing-contents, survivor/injury and socioeconomic support; rates delegated to technical instructions.",
    "delivery": "Banks and/or post offices.",
    "documents": "Current application checklist not verified.",
    "portable": "unknown",
    "speed": "Actual payment time not measured in the sources read.",
    "shock_responsive": "yes",
    "heat_relevance": "This geographically limited disaster decision does not establish heat eligibility.",
    "status": "unclear (as of 2026)",
    "grade": "UNCERTAIN",
    "sources": [
      "I14"
    ]
  }
]
```
## C. ACCESS LADDER

```json
[
  {
    "scheme": "pkh",
    "group": "Programme families",
    "step": "received",
    "finding": "Government report, 7 August 2026: more than 7 million families had been paid in quarter III.",
    "grade": "KNOWN",
    "limit": "Interim national administrative report; no eligible-family denominator or heat subgroup.",
    "sources": [
      "I4"
    ]
  },
  {
    "scheme": "sembako",
    "group": "Programme families",
    "step": "received",
    "finding": "Government report, 7 August 2026: more than 12 million families had been paid in quarter III.",
    "grade": "KNOWN",
    "limit": "Not a completed-quarter count; cannot sum overlapping schemes.",
    "sources": [
      "I4"
    ]
  },
  {
    "scheme": "jkn",
    "group": "Non-poor informal-worker households in Bandung and Medan",
    "step": "enrolled",
    "finding": "Evaluation of 5,996 households: registration assistance increased enrolment by 3.5 percentage points.",
    "grade": "KNOWN",
    "limit": "Historical randomised offer, not current national access; page narrative describes 2015-2018.",
    "sources": [
      "I16"
    ]
  },
  {
    "scheme": "jkn",
    "group": "Same historical evaluation population",
    "step": "enrolled",
    "finding": "Full subsidy increased enrolment by 18.6 percentage points from a comparison mean of 7.8 percent.",
    "grade": "KNOWN",
    "limit": "Subsidy experiment; not a 2026 policy coverage estimate.",
    "sources": [
      "I16"
    ]
  },
  {
    "scheme": "jkn",
    "group": "Same historical evaluation population",
    "step": "enrolled",
    "finding": "Additional information had no measured effect on enrolment.",
    "grade": "KNOWN",
    "limit": "Specific information treatments and historical urban sample; not proof that all awareness work has no effect.",
    "sources": [
      "I16"
    ]
  },
  {
    "scheme": "jkn",
    "group": "National JKN population",
    "step": "enrolled",
    "finding": "DJSN report for 30 June 2026: coverage 98,60 percent; activity 80,25 percent.",
    "grade": "KNOWN",
    "limit": "Preserve these reported concepts separately. The short source is insufficient to calculate an eligibility or paid-care gap.",
    "sources": [
      "I9"
    ]
  }
]
```

Aware, eligible, documented, applied, adequate and on-time steps were not verified as a linked current ladder for heat-exposed groups. Experimental enrolment is not current entitlement; reported active insurance is not a received health service.
## D. HEAT AND SOCIAL PROTECTION EVIDENCE

```json
[
  {
    "by": "Fritz, 2022",
    "title": "Temperature and non-communicable diseases: Evidence from Indonesia's primary health care system",
    "url": "https://onlinelibrary.wiley.com/doi/10.1002/hec.4590",
    "type": "Peer-reviewed study",
    "where": "Indonesia",
    "scale": "2015-2016 insured sample; 1,697,452 individuals",
    "finding": "KNOWN study estimates: visits on days above 30 degrees C mean temperature rose by 8% overall, 25% for diabetes and 14% for cardiovascular disease versus 25.5-27 degrees C. No respiratory-visit increase was found.",
    "effect": "mixed",
    "limit": "Insurance users only; diagnoses cannot distinguish first diagnosis from continued treatment. This estimates heat-related service use, not the effect of insurance on heat harm.",
    "sources": [
      "I15"
    ]
  },
  {
    "by": "J-PAL, undated",
    "title": "Enrolling Informal Sector Workers in National Health Insurance in Indonesia",
    "url": "https://www.povertyactionlab.org/evaluation/enrolling-informal-sector-workers-national-health-insurance-indonesia",
    "type": "Evaluation",
    "where": "Bandung and Medan",
    "scale": "5,996 households; page narrative describes 2015-2018",
    "finding": "KNOWN evaluation findings: assisted registration and subsidies increased enrolment; extra information had no effect. These are access outcomes, with heat applicability INFERRED.",
    "effect": "mixed",
    "limit": "Historic urban non-poor informal-worker sample; no heat-related income, illness or mortality estimate.",
    "sources": [
      "I16"
    ]
  },
  {
    "by": "Cahyadi et al., 2020; J-PAL summary",
    "title": "Cumulative Impacts of Conditional Cash Transfer Programs: Experimental Evidence from Indonesia",
    "url": "https://swlb1.aeaweb.org/articles?id=10.1257/pol.20190245",
    "type": "Peer-reviewed study",
    "where": "Indonesia",
    "scale": "13,619 households across 360 sub-districts in the evaluation summary",
    "finding": "KNOWN study findings: stunting fell by 23 percent after six years; consumption, household-head employment and land/livestock ownership did not increase. Heat outcomes were not tested.",
    "effect": "mixed",
    "limit": "Publisher abstract and evaluation summary were read, not the full paper. Historical rollout is not evidence of 2026 heat responsiveness.",
    "sources": [
      "I17",
      "I18"
    ]
  }
]
```
## E. DELIVERY ROUTES AND ORGANISATIONS

```json
[
  {
    "id": "perlinsos",
    "name": "Ministry of Social Affairs / Portal Perlinsos",
    "kind": "government",
    "does": "Provides public scheme discovery and registration routes, including an agent interface.",
    "where": "Indonesia",
    "reach_reported": "No independently verified portal completion count extracted.",
    "reach_independent": "",
    "evaluations": "",
    "url": "https://perlinsos.kemensos.go.id/",
    "sources": [
      "I1"
    ]
  },
  {
    "id": "facilitators",
    "name": "PKH social facilitators",
    "kind": "government",
    "does": "Current government reporting identifies facilitators supporting programme households.",
    "where": "Indonesia",
    "reach_reported": "No separate measured heat-season application-success count.",
    "reach_independent": "",
    "evaluations": "",
    "url": "https://www.setneg.go.id/baca/index/pastikan_tepat_sasaran_pemerintah_salurkan_bansos_kepada_lebih_dari_18_juta_kpm",
    "sources": [
      "I4"
    ]
  },
  {
    "id": "perisai",
    "name": "PERISAI agents",
    "kind": "government",
    "does": "BPJS lists assisted document checking and enrolment for non-wage workers.",
    "where": "Indonesia",
    "reach_reported": "No comparable independent success rate read.",
    "reach_independent": "",
    "evaluations": "",
    "url": "https://www.bpjsketenagakerjaan.go.id/Bukan-Penerima-Upah.html",
    "sources": [
      "I5"
    ]
  },
  {
    "id": "pos",
    "name": "Post-office registration and payment route",
    "kind": "government",
    "does": "BPJS lists BPU registration through post counters; disaster support can use post disbursement.",
    "where": "Indonesia",
    "reach_reported": "No heat-specific receipt count verified.",
    "reach_independent": "",
    "evaluations": "",
    "url": "https://www.bpjsketenagakerjaan.go.id/Bukan-Penerima-Upah.html",
    "sources": [
      "I5",
      "I14"
    ]
  },
  {
    "id": "bankagents",
    "name": "BRILink and BNI46 agent routes",
    "kind": "financial",
    "does": "BPJS lists these as enrolment and contribution channels.",
    "where": "Indonesia",
    "reach_reported": "No independently evaluated heat outcome verified.",
    "reach_independent": "",
    "evaluations": "",
    "url": "https://www.bpjsketenagakerjaan.go.id/Bukan-Penerima-Upah.html",
    "sources": [
      "I5"
    ]
  },
  {
    "id": "extension",
    "name": "Agricultural extension workers and farmer groups",
    "kind": "government",
    "does": "Help complete AUTP forms, upload registration and report crop damage.",
    "where": "Indonesia",
    "reach_reported": "2026 insured-area allocation is a target, not measured delivery reach.",
    "reach_independent": "",
    "evaluations": "",
    "url": "https://psp.pertanian.go.id/faq/kategori/14",
    "sources": [
      "I11",
      "I12"
    ]
  },
  {
    "id": "nadi",
    "name": "NADI JKN contribution-saving partnerships",
    "kind": "digital platform",
    "does": "DJSN describes collective digital and cooperative routes for paying contributions in stages.",
    "where": "Indonesia",
    "reach_reported": "Programme launch reported August 2026; no evaluated continuity effect read.",
    "reach_independent": "",
    "evaluations": "",
    "url": "https://djsn.go.id/berita/peluncuran-program-nadi-jkn-untuk-menjaga-keaktifan-kepersertaan",
    "sources": [
      "I9"
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
      "Ih"
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
    "limit": "INFERRED; native 0.25 degree grid. No country values calculated. Use correct local time zones. [Ie]"
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
    "limit": "INFERRED; indoor heat, wind, work intensity and radiant heat are not measured. [Ie]"
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
    "limit": "INFERRED; dew point is not wet-bulb temperature, heat index or WBGT. [Ie]"
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
    "url": "https://hub.worldpop.org/geodata/summary?id=81578",
    "licence": "CC BY 4.0 stated; check file provenance for ODbL exception",
    "access": "open download",
    "format": "other",
    "update": "Versioned research release",
    "place_code": "WGS84 grid; spatial overlay",
    "limit": "INFERRED, not census counts; about 100 m native grid. Administrative aggregates not downloaded or calculated. [Iw]"
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
    "url": "https://hub.worldpop.org/geodata/summary?id=81578",
    "licence": "CC BY 4.0 stated; check provenance",
    "access": "open download",
    "format": "other",
    "update": "Versioned research release",
    "place_code": "Same grid as older",
    "limit": "INFERRED; age-group labels and totals receive a check before calculation. This is not eligibility for a child benefit. [Iw]"
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
    "url": "https://hub.worldpop.org/geodata/summary?id=81578",
    "licence": "CC BY 4.0 stated; check provenance",
    "access": "open download",
    "format": "other",
    "update": "Versioned research release",
    "place_code": "Same grid and selected geometry",
    "limit": "INFERRED; residents are not daytime workers. Migrant workplaces and informal settlements may be represented differently. [Iw]"
  },
  {
    "id": "jknnational",
    "layer": "coverage",
    "indicator": "JKN coverage and activity, national context",
    "definition": "Record the two DJSN concepts with their reported date and original denominator language. Do not infer paid heat care.",
    "unit": "percent as reported",
    "unit_of_place": "country",
    "year": 2026,
    "publisher": "National Social Security Council",
    "url": "https://djsn.go.id/berita/peluncuran-program-nadi-jkn-untuk-menjaga-keaktifan-kepersertaan",
    "licence": "Publicly readable; open reuse licence not verified",
    "access": "open download",
    "format": "other",
    "update": "Dated announcement; no regular series verified",
    "place_code": "ISO3 IDN only; no province code in this source",
    "limit": "Not a province layer; national value stays in the country panel. [I9]"
  },
  {
    "id": "pkhreceipt",
    "layer": "coverage",
    "indicator": "PKH quarterly disbursement count",
    "definition": "Number of programme families reported paid to the interim date; not eligible-household coverage.",
    "unit": "families",
    "unit_of_place": "country",
    "year": 2026,
    "publisher": "Ministry of State Secretariat",
    "url": "https://www.setneg.go.id/baca/index/pastikan_tepat_sasaran_pemerintah_salurkan_bansos_kepada_lebih_dari_18_juta_kpm",
    "licence": "Not verified",
    "access": "open download",
    "format": "other",
    "update": "Dated administrative announcement",
    "place_code": "ISO3 IDN; no subnational extract read",
    "limit": "Do not distribute the national count among provinces. [I4]"
  },
  {
    "id": "sembakorate",
    "layer": "system",
    "indicator": "Sembako published monthly amount",
    "definition": "Current decision states Rp200.000,00 per family per month, subject to fiscal capacity; stage payment is a separate field.",
    "unit": "IDR/family/month",
    "unit_of_place": "state",
    "year": 2026,
    "publisher": "Ministry of Social Affairs",
    "url": "https://jdih.kemensos.go.id/detail/keputusan-menteri-sosial-republik-indonesia-nomor-33huk2026-wt8GReCOMq",
    "licence": "Create an independently written fact table with attribution; source licence unverified",
    "access": "open download",
    "format": "PDF",
    "update": "Rule or budget revision",
    "place_code": "Versioned project province table, not a recipient register",
    "limit": "National terms can be repeated as availability; this is not proof of payment locally. [I3]"
  },
  {
    "id": "autpterms",
    "layer": "system",
    "indicator": "AUTP premium and insured value",
    "definition": "Display farmer premium, public share and insured value as different quantities, alongside listed perils.",
    "unit": "IDR/ha/season",
    "unit_of_place": "state",
    "year": 2026,
    "publisher": "Ministry of Agriculture",
    "url": "https://psp.pertanian.go.id/faq/kategori/14",
    "licence": "Report reuse licence not verified; record factual terms with attribution",
    "access": "open download",
    "format": "other",
    "update": "Programme rule revision",
    "place_code": "Curated province availability, with local implementation unverified",
    "limit": "The 2026 allocation does not establish universal local availability. [I11, I12]"
  }
]
```
## G. A MINIMUM VIABLE MAP

A minimum viable version can use two substantive layers: derived 2025 ERA5 hot-day counts and modelled WorldPop 2020 population aged 65+. Aggregate both by spatial overlay onto the opened 2017 province-boundary option in geoBoundaries IDN ALL. Its ADM1 metadata contains 34 units and an ODbL source licence. [Ie, Iw, Ib]

Label this release explicitly as a 2017 province geography. A current-province release depends on a current openly licensed boundary and a verified crosswalk; no current province statistics are mixed into the older geography. The two raster layers share coordinates for spatial overlay, not an official administrative code. [Ib]

A third, manually curated layer can show Sembako's published amount as national availability, with eligibility and local receipt left separate. Newly authored factual records can carry the project's own open licence; that does not assign a licence to source reports. [I3]

This map would show modelled heat context and age structure alongside a relevant system. It would not show eligible households, active JKN by province, heat claims, benefit adequacy, timely receipt, work-site heat or individual access. Residence is not workplace, and older population data are not a benefit register. [I9, I15, Iw]

The source pages and metadata were read, but rasters, geometries and joins were not executed. No shared official place-code field was verified. A low registration value, if later added, can reflect denominator, date and contribution status as well as unmet access; a high value does not establish paid heat care.
## H. WHERE NO SYSTEM RESPONDS

- Informal heat work stoppages: JKK concerns qualifying work injury and JKP concerns qualifying termination; neither opened rule establishes general pay for every lost hot day. [I5, I7]
- Heat care for people without active coverage: recorded insured service use is not evidence about costs or care forgone outside the insured sample. [I9, I15]
- Direct heat crop damage: AUTP explicitly lists drought, flood and pests, with damage conditions; a direct temperature trigger was not verified. [I11]
- Seasonal migrant access: national identity or digital channels do not establish uninterrupted benefit access after moving; current portability rules remain unverified. [I1, I5]
- Heat debt, asset sales and mortality: no evaluated public heat-transfer effect was opened. Non-heat PKH null findings are not heat null findings. [I17, I18]
- Disaster cash: the named Sumatra decision has geographic and event limits, so it cannot be treated as a national heat entitlement. [I14]
## I. OPEN QUESTIONS

```json
[
  {
    "id": "claims",
    "q": "What share of diagnosed work-related heat claims reach benefit payment?",
    "have": "JKK benefits exist; heat-specific acceptance and delay were not verified. [I5, I6]",
    "could": "Prospective multi-site claims pathway study, publishing aggregate submitted, accepted and paid counts and time intervals.",
    "scale": "Illustrative: several provinces over two hot seasons; sample based on case volume."
  },
  {
    "id": "continuity",
    "q": "Does contribution support keep informal workers insured through the hot season?",
    "have": "A registration experiment and a new contribution-saving route exist. [I16, I9]",
    "could": "Cluster randomisation of assisted contribution-saving access, measuring active coverage, care costs and retention in aggregate.",
    "scale": "Illustrative: 40-60 clusters; final size from power calculations."
  },
  {
    "id": "topups",
    "q": "Does a pre-heat top-up reduce income loss, debt and delayed care?",
    "have": "PKH delivery and general economic evaluations exist, without a verified heat effect. [I4, I17]",
    "could": "Pre-specified phased top-up trial using forecasts, with household outcomes reported only in aggregate.",
    "scale": "Illustrative: two hot seasons across 40-60 clusters."
  },
  {
    "id": "cropclaims",
    "q": "Which heat-related crop losses meet AUTP damage rules and receive timely support?",
    "have": "Drought insurance terms and extension routes are published. [I11]",
    "could": "Crop-season panel combining weather, field loss assessment and anonymised aggregate claim outcomes, without publishing farm locations.",
    "scale": "Illustrative: 1,000-1,500 insured and comparable uninsured farm households."
  }
]
```
## J. SOURCES

```json
[
  {
    "key": "I1",
    "url": "https://perlinsos.kemensos.go.id/",
    "title": "Portal Perlinsos - Kesejahteraan Sosial untuk Semua",
    "by": "Ministry of Social Affairs",
    "year": null,
    "type": "Government page",
    "where": "Indonesia",
    "finding": "Describes PKH, Sembako, self-service registration and an agent route.",
    "limit": "Portal description does not establish an individual entitlement, completed registration or benefit receipt.",
    "expect": [
      "PKH",
      "Sembako",
      "Agen"
    ]
  },
  {
    "key": "I2",
    "url": "https://jdih.kemensos.go.id/detail/keputusan-menteri-sosial-republik-indonesia-nomor-106huk2026-ggGnNohlR5",
    "title": "Keputusan Menteri Sosial Republik Indonesia Nomor 106/HUK/2026 tentang Penetapan Jumlah Alokasi Keluarga Penerima Manfaat dan Besaran Nilai Bantuan Program Keluarga Harapan Tahun 2026",
    "by": "Ministry of Social Affairs",
    "year": 2026,
    "type": "Government page",
    "where": "Indonesia",
    "finding": "The linked decision, read in full, targets 10.000.000 families and delegates component amounts rather than listing a full rate table.",
    "limit": "Target, not paid count; linked technical component rates were not verified.",
    "expect": [
      "106",
      "2026",
      "Program Keluarga Harapan"
    ]
  },
  {
    "key": "I3",
    "url": "https://jdih.kemensos.go.id/detail/keputusan-menteri-sosial-republik-indonesia-nomor-33huk2026-wt8GReCOMq",
    "title": "Keputusan Menteri Sosial Republik Indonesia Nomor 33/HUK/2026 Tentang Penetapan Jumlah Alokasi Keluarga Penerima Manfaat Dan Besaran Nilai Bantuan Program Sembako Tahun 2026",
    "by": "Ministry of Social Affairs",
    "year": 2026,
    "type": "Government page",
    "where": "Indonesia",
    "finding": "The linked decision, read in full, states Rp200.000,00 per family per month, subject to fiscal capacity.",
    "limit": "Legal allocation does not measure benefit adequacy or payment time.",
    "expect": [
      "33",
      "2026",
      "Sembako"
    ]
  },
  {
    "key": "I4",
    "url": "https://www.setneg.go.id/baca/index/pastikan_tepat_sasaran_pemerintah_salurkan_bansos_kepada_lebih_dari_18_juta_kpm",
    "title": "Pastikan Tepat Sasaran, Pemerintah Salurkan Bansos kepada Lebih dari 18 Juta KPM",
    "by": "Ministry of State Secretariat",
    "year": 2026,
    "type": "Government page",
    "where": "Indonesia",
    "finding": "On 7 August 2026, government reported disbursement to more than 7 million PKH families and more than 12 million Sembako families for quarter III.",
    "limit": "Interim national report; recipients may overlap, and totals are not eligible-population coverage.",
    "expect": [
      "7 juta",
      "12 juta",
      "07 Agustus 2026"
    ]
  },
  {
    "key": "I5",
    "url": "https://www.bpjsketenagakerjaan.go.id/Bukan-Penerima-Upah.html",
    "title": "Manfaat Bukan Penerima Upah",
    "by": "BPJS Ketenagakerjaan",
    "year": null,
    "type": "Government page",
    "where": "Indonesia",
    "finding": "Lists JKK, JKM and JHT benefits and assisted registration routes including PERISAI, bank agents and post offices.",
    "limit": "Rules are not heat-specific paid-claim evidence.",
    "expect": [
      "PERISAI",
      "Jaminan Kecelakaan Kerja",
      "Jaminan Hari Tua"
    ]
  },
  {
    "key": "I6",
    "url": "https://www.bpjsketenagakerjaan.go.id/jasa-konstruksi.html",
    "title": "Jaminan Keselamatan Kerja untuk Jasa Konstruksi (Jakon)",
    "by": "BPJS Ketenagakerjaan",
    "year": null,
    "type": "Government page",
    "where": "Indonesia",
    "finding": "Construction route includes JKK treatment and temporary incapacity compensation and JKM survivor benefits.",
    "limit": "Employer or project registration does not establish every construction worker is covered.",
    "expect": [
      "Jasa Konstruksi",
      "STMB",
      "100%"
    ]
  },
  {
    "key": "I7",
    "url": "https://www.bpjsketenagakerjaan.go.id/jaminan-kehilangan-pekerjaan.html",
    "title": "Cek Informasi Detail Jaminan Kehilangan Pekerjaan",
    "by": "BPJS Ketenagakerjaan",
    "year": null,
    "type": "Government page",
    "where": "Indonesia",
    "finding": "Current page gives 60% of reported wages for up to six months, using a Rp. 5.000.000,00 wage ceiling.",
    "limit": "Qualifying employment termination and contribution history apply; this is not general heat work-stoppage pay.",
    "expect": [
      "60%",
      "6 (enam) bulan",
      "5.000.000"
    ]
  },
  {
    "key": "I8",
    "url": "https://bsu.kemnaker.go.id/",
    "title": "Bantuan Subsidi Upah 2026",
    "by": "Ministry of Manpower",
    "year": 2026,
    "type": "Government page",
    "where": "Indonesia",
    "finding": "Announces Rp300.000 monthly for three months, paid once as Rp900.000, for qualifying active wage-earner members.",
    "limit": "Page says the recipient-check mechanism will be announced; an announcement is not a verified paid count.",
    "expect": [
      "Rp900.000",
      "Agustus 2026",
      "Nomor Induk Kependudukan"
    ]
  },
  {
    "key": "I9",
    "url": "https://djsn.go.id/berita/peluncuran-program-nadi-jkn-untuk-menjaga-keaktifan-kepersertaan",
    "title": "Peluncuran Program NADI JKN untuk Menjaga Keaktifan Kepersertaan",
    "by": "National Social Security Council",
    "year": 2026,
    "type": "Government page",
    "where": "Indonesia",
    "finding": "Reports JKN coverage of 98,60 percent and activity of 80,25 percent as of 30 June 2026; describes contribution-saving routes.",
    "limit": "The activity denominator is not sufficiently explicit in this short text for a subtraction or an eligible-to-received rate.",
    "expect": [
      "80,25",
      "98,60",
      "30 Juni 2026"
    ]
  },
  {
    "key": "I10",
    "url": "https://bri.co.id/web/guest/promo-detail/900",
    "title": "Kredit Usaha Rakyat (KUR)",
    "by": "Bank Rakyat Indonesia",
    "year": 2026,
    "type": "Government page",
    "where": "Indonesia",
    "finding": "Dated 2026 lender offer lists KUR super-micro at 3% and micro starting at 6% effective yearly, with product limits.",
    "limit": "Lender terms and credit assessment apply; credit is repayable, rather than a household transfer.",
    "expect": [
      "2026",
      "3%",
      "6%"
    ]
  },
  {
    "key": "I11",
    "url": "https://psp.pertanian.go.id/faq/kategori/14",
    "title": "Asuransi Usaha Tani Padi (AUTP)",
    "by": "Ministry of Agriculture",
    "year": null,
    "type": "Government page",
    "where": "Indonesia",
    "finding": "Rice insurance FAQ lists drought, flood and pests, farmer premium 36.000/Ha/MT, government premium 144.000/Ha/MT, and insured value 6.000.000/Ha.",
    "limit": "Damage and policy conditions apply; no heat-only policy wording or measured payment delays were read.",
    "expect": [
      "36.000",
      "144.000",
      "6.000.000"
    ]
  },
  {
    "key": "I12",
    "url": "https://psp.pertanian.go.id/berita/kementan-alokasikan-autp-untuk-100-ribu-hektare-lindungi-petani-hadapi-el-nino",
    "title": "Kementan Alokasikan AUTP untuk 100 Ribu Hektare, Lindungi Petani Hadapi El Nino",
    "by": "Ministry of Agriculture",
    "year": 2026,
    "type": "Government page",
    "where": "Indonesia",
    "finding": "The 11 September 2026 announcement identifies an AUTP allocation for 100 thousand hectares.",
    "limit": "Allocation, not area insured or compensated.",
    "expect": [
      "AUTP",
      "2026",
      "100 ribu"
    ]
  },
  {
    "key": "I13",
    "url": "https://kampungkb.kemendukbangga.go.id/kampung/51368/intervensi/2776097/pemberian-bantuan-blt",
    "title": "Pemberian bantuan BLT",
    "by": "Kemendukbangga / BKKBN community activity portal",
    "year": 2026,
    "type": "Government page",
    "where": "Lubuk Mandarsah, Indonesia",
    "finding": "Local 18 May 2026 description gives maximum Rp300.000 per family per month and village selection.",
    "limit": "Local public-portal entry, not a fully verified national implementation rule.",
    "expect": [
      "300.000",
      "2026",
      "Musyawarah Desa"
    ]
  },
  {
    "key": "I14",
    "url": "https://jdih.kemensos.go.id/detail/keputusan-menteri-sosial-republik-indonesia-nomor-2huk2026-t-MtOzARJBIM",
    "title": "Keputusan Menteri Sosial Republik Indonesia Nomor 2/HUK/2026 tentang Bantuan Sosial bagi Korban Bencana Alam di Aceh, Provinsi Sumatera Utara, dan Provinsi Sumatera Barat",
    "by": "Ministry of Social Affairs",
    "year": 2026,
    "type": "Government page",
    "where": "Aceh, North Sumatra and West Sumatra",
    "finding": "The linked signed decision authorises living, housing-contents, survivor/injury and socioeconomic support through banks or post.",
    "limit": "Separate technical instructions set details. Landing metadata gives a later promulgation date than this research date; the signed decision is dated 22 January 2026.",
    "expect": [
      "2/HUK/2026",
      "Aceh",
      "Sumatera Barat"
    ]
  },
  {
    "key": "I15",
    "url": "https://onlinelibrary.wiley.com/doi/10.1002/hec.4590",
    "title": "Temperature and non-communicable diseases: Evidence from Indonesia's primary health care system",
    "by": "Fritz",
    "year": 2022,
    "type": "Peer-reviewed study",
    "where": "Indonesia",
    "finding": "At daily mean temperature above 30 degrees C, all-cause, diabetes and cardiovascular visits were 8%, 25% and 14% higher than the 25.5-27 degrees C reference.",
    "limit": "Insured 2015-2016 sample; cannot separate first diagnoses from ongoing treatment, and uninsured needs are outside the sample.",
    "expect": [
      "8%",
      "25%",
      "14%"
    ]
  },
  {
    "key": "I16",
    "url": "https://www.povertyactionlab.org/evaluation/enrolling-informal-sector-workers-national-health-insurance-indonesia",
    "title": "Enrolling Informal Sector Workers in National Health Insurance in Indonesia",
    "by": "J-PAL",
    "year": null,
    "type": "Evaluation",
    "where": "Bandung and Medan",
    "finding": "Among 5,996 households, registration assistance increased enrolment by 3.5 percentage points; additional information had no effect.",
    "limit": "Urban non-poor informal households; historical intervention, not a heat study. Page timeline and narrative years differ.",
    "expect": [
      "5,996",
      "3.5 percentage points",
      "additional information"
    ]
  },
  {
    "key": "I17",
    "url": "https://www.povertyactionlab.org/evaluation/medium-term-impact-conditional-cash-transfers-health-and-education-indonesia",
    "title": "The Medium-Term Impact of Conditional Cash Transfers on Health and Education in Indonesia",
    "by": "J-PAL",
    "year": null,
    "type": "Evaluation",
    "where": "Indonesia",
    "finding": "Six-year evaluation reports lower stunting, with no consumption, household-head employment or land/livestock gains.",
    "limit": "Historic rollout and comparison-group expansion; heat outcomes were not assessed.",
    "expect": [
      "13,619",
      "360 sub-districts",
      "Household consumption"
    ]
  },
  {
    "key": "I18",
    "url": "https://swlb1.aeaweb.org/articles?id=10.1257/pol.20190245",
    "title": "Cumulative Impacts of Conditional Cash Transfer Programs: Experimental Evidence from Indonesia",
    "by": "Cahyadi et al.",
    "year": 2020,
    "type": "Peer-reviewed study",
    "where": "Indonesia",
    "finding": "Published abstract reports stunting fell by 23 percent and no transformative household economic change.",
    "limit": "Abstract read; full article not read. The detailed results here rely on the opened evaluation summary.",
    "expect": [
      "23 percent",
      "six years",
      "2020"
    ]
  },
  {
    "key": "Ie",
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
    "key": "Iw",
    "url": "https://hub.worldpop.org/geodata/summary?id=81578",
    "title": "Age and sex structures",
    "by": "WorldPop, University of Southampton",
    "year": 2025,
    "type": "Agency report",
    "where": "Indonesia",
    "finding": "Open 2020 age-sex population estimates are supplied as approximately 100 m GeoTIFF rasters.",
    "limit": "Modelled population; page notes CC BY 4.0 and an ODbL exception for some inputs. File-level provenance remains a release check.",
    "expect": [
      "2020",
      "Geotiff",
      "WGS84"
    ]
  },
  {
    "key": "Ib",
    "url": "https://www.geoboundaries.org/api/current/gbOpen/IDN/ALL/",
    "title": "geoBoundaries gbOpen IDN ALL API metadata",
    "by": "geoBoundaries",
    "year": 2023,
    "type": "Agency report",
    "where": "Indonesia",
    "finding": "An openly licensed boundary release was located and its vintage checked.",
    "limit": "Metadata and download links were read; no completed join or current official code crosswalk is claimed.",
    "expect": [
      "ADM1",
      "boundaryYearRepresented",
      "Open Database License"
    ]
  },
  {
    "key": "Ih",
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

- BPJS Kesehatan's current site returned no readable body, its benefits PDF returned 403, and Cek Bansos timed out. Exact current medical exclusions, PBI premium rules, and practical heat-claim payment remain unverified; search-result counts from those pages are not used.
- The full PKH component-rate schedule was not verified. Decision 106/HUK/2026 delegates amounts; common figures repeated in news are not inserted as verified rates. The newer PKH regulation page linked an abstract with different document metadata, so it is not used to fill current rules. [I2]
- Current economic-coordination ministry KUR announcements returned gateway errors. The dated 2026 BRI offer was opened instead, with lender-specific terms. [I10]
- The public-works disaster-recovery announcement timed out. A nationwide employment guarantee and an evaluated heat-related public-works payment route were not verified; neither is invented here.
- BPS province health-insurance and informal-work tables were found, but the first returned 403 and the second opened without its data body. Their search snippets are not used as measured access findings or downloadable map data.
- The village-fund description is local. It does not verify all national implementation conditions; seasonal migrant portability and local collection arrangements remain unknown. [I13]
- The disaster decision's landing page gives a promulgation date after this research date, while the opened signed text is dated January 2026 and says it takes effect on signing. Current operational terms remain unclear rather than being assumed. [I14]
- The Indonesia ADM1 endpoint did not open directly, but the ALL endpoint exposed its metadata. The 34-unit 2017 geography is kept separate from current provincial statistics; no boundary replacement or completed join is claimed. [Ib]
- Haqdarshak's own agent-and-platform description was read. The JSW assessment PDF returned 404, so no independent effect or operation in Indonesia is asserted. [Ih]
- Unions, self-help groups, microfinance and legal or paralegal application support were considered as delivery leads. No current scheme-specific effect was verified for these routes in this bounded search.
- Three evidence items are included: one heat-and-insured-service study and two contextual social-protection evaluations. They are not three demonstrated heat-protection effects; no study of a public transfer reducing heat mortality was verified.
- The 13 catalogue records include construction and non-wage routes within the same insurance architecture. They are not counted as 13 independent institutions; some current documents, payment speeds and application checklists remain unknown.
