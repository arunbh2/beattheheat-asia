## A. SUMMARY

**Run 5 - Lens 4: Places and countries. Evidence checked to 5 November 2026.**

- The clearest map gap is uneven place-specific evidence, not evidence of safety. Eight countries have no explicitly country-tagged source in the audited loop register; other site sections can still contain relevant material.
- Country averages hide setting differences. Tarai workplaces, Cambodian factory interiors and Maldivian workload scenarios describe different exposures and outcomes. [S1, S3, S5]
- Mountain and island settings need their own evidence fields. Bhutan has older national health projections; the Maldives has a new sector study. Neither provides a local clinical count for every setting. [S2, S3]
- The assumption that a blank heat-health field means zero harm was rejected. Timor-Leste's profile distinguishes unspecified heat indicators from an approved health adaptation plan. [S4]
- Evidence remains thin for highland health, small towns, outer islands and direct humid-versus-dry comparisons. The regional review supports broader coverage, but not one common threshold. [S8, S9]

Baseline: Common Shade repository snapshot at commit 2426367458a858372a5aa23625e96c8169869f50 (link to the repository removed in November 2026; the commit is named so the baseline can still be found). This is a content baseline, not scientific evidence. No website or repository changes have been applied.

The coverage check uses the country directories and unique source URLs in the loop register's `where` field. It is reproducible at the pinned snapshot, but excludes other site evidence and untagged global studies. Zero in this table is a content-tagging result, not a literature count.

| Country | Dedicated country page found | Explicitly tagged loop-source URLs | Evidence position in this run |
|---|---|---:|---|
| India | Yes | 17 | Existing loop evidence; no additional item proposed here. |
| Bangladesh | Yes | 3 | Existing loop evidence; not re-reviewed countrywide. |
| Nepal | Yes | 1 | Tarai workplaces and elevation contrasts reviewed. [S1, S9] |
| Sri Lanka | Yes | 0 | No new country-specific primary study reviewed here. |
| Pakistan | No | 0 | No new country-specific primary study reviewed here. |
| Bhutan | No | 0 | National health projections, not local death counts. [S2] |
| Maldives | No | 0 | New sector modelling, with local-data limits. [S3] |
| Myanmar | No | 0 | No new country-specific primary study reviewed here. |
| Thailand | Yes | 3 | Existing loop evidence; not re-reviewed countrywide. |
| Cambodia | No | 3 | Seasonal factory symptoms and perceived productivity. [S5] |
| Lao PDR | No | 0 | Draft workplace-standard consultation, not verified enactment. [S7] |
| Viet Nam | No | 2 | Mortality relationships and provincial modifiers. [S6] |
| Malaysia | No | 0 | No new country-specific primary study reviewed here. |
| Singapore | No | 3 | Existing loop evidence; not re-reviewed countrywide. |
| Indonesia | Yes | 3 | Existing loop evidence; not re-reviewed countrywide. |
| Philippines | Yes | 2 | Existing loop evidence; not re-reviewed countrywide. |
| Timor-Leste | No | 0 | Unspecified heat indicators alongside adaptation activity. [S4] |

Counts include country-name variants and the Jakarta location alias for Indonesia. They are not comparisons of national capability or risk.

## B. NEW OR UPDATED HARMS

Updates replace or qualify wording; they do not create duplicate harms. INFERRED includes models and conditional mechanisms. UNCERTAIN includes single-setting findings. KNOWN does not establish causality or transfer to other settings.

```json
[
  {
    "id": "localheat",
    "sys": "nature",
    "status": "new",
    "label": "Local exposure differs",
    "desc": "Heat exposure differs between workplaces, landscapes and settlements. This reuses the localheat node proposed in lens 5; it is not a second node to add.",
    "grade": "UNCERTAIN",
    "who": "Workers in locally hot settings",
    "sources": [
      "S1"
    ],
    "debated": "Local measurements do not represent all lowlands or highlands."
  },
  {
    "id": "heatsymptoms",
    "sys": "health",
    "status": "new",
    "label": "Reported heat symptoms",
    "desc": "Workers can report thirst, sweating and discomfort without a clinical heatstroke diagnosis. Cambodian seasonal surveys document this distinction.",
    "grade": "UNCERTAIN",
    "who": "Female sewing-department workers",
    "sources": [
      "S5"
    ],
    "debated": "Reported symptoms and perceived productivity are not clinical diagnoses or measured output."
  },
  {
    "id": "productivity",
    "sys": "work",
    "status": "update",
    "label": "Work capacity varies locally",
    "desc": "Modelled work losses in the Maldives depend on sector and workload. They are estimates, including for the historical period, rather than observed wage losses.",
    "grade": "INFERRED",
    "who": "Workers in heat-exposed island sectors",
    "sources": [
      "S3"
    ],
    "debated": "National grids and general response functions can miss local working conditions."
  },
  {
    "id": "deaths",
    "sys": "health",
    "status": "update",
    "label": "Mortality evidence differs",
    "desc": "Bhutan's profile gives projected older-person mortality, while Vietnamese research estimates relationships using mortality records. These evidence types remain separate.",
    "grade": "INFERRED",
    "who": "Older people and people in hotter local climates",
    "sources": [
      "S2",
      "S6"
    ],
    "debated": "No country comparison or transferred threshold is proposed."
  },
  {
    "id": "underreport",
    "sys": "gov",
    "status": "update",
    "label": "Missing heat indicators",
    "desc": "Timor-Leste's profile leaves heat-health indicators unspecified. An empty field is not a zero and does not establish the completeness of national records.",
    "grade": "KNOWN",
    "who": "People whose heat-related illness is not visible in this profile",
    "sources": [
      "S4"
    ],
    "debated": "Publication-level missingness is narrower than a claim about the whole health information system."
  },
  {
    "id": "respiratory",
    "sys": "health",
    "status": "update",
    "label": "Heat and pollution interact",
    "desc": "Regional studies report varied air-pollution modification of heat-health relationships. The direction and strength are not uniform across settings.",
    "grade": "KNOWN",
    "who": "People with respiratory disease in polluted settings",
    "sources": [
      "S8"
    ],
    "debated": "The review includes mixed outcomes and some findings that differ in direction."
  }
]
```

## C. LINKS

A loop field identifies a relevant existing cycle, not proof of closure. No new cycle is declared. Lags are proposed process timescales, not study-estimated parameters.

```json
[
  {
    "from": "localheat",
    "to": "farmwork",
    "why": "Tarai heat measurements and worker accounts show that hot conditions can constrain continuous work.",
    "loop": "",
    "grade": "UNCERTAIN",
    "moderators": "Workload, shade, timing and access to recovery.",
    "lag": "days",
    "sources": [
      "S1"
    ]
  },
  {
    "from": "localheat",
    "to": "heatsymptoms",
    "why": "Hotter seasonal conditions co-occurred with more reported symptoms in the Cambodian factory surveys.",
    "loop": "",
    "grade": "UNCERTAIN",
    "moderators": "Indoor humidity, clothing and task; exposure logging and surveys covered different periods.",
    "lag": "seasons",
    "sources": [
      "S5"
    ]
  },
  {
    "from": "heatsymptoms",
    "to": "productivity",
    "why": "Reported fatigue and discomfort may impair perceived work performance; causal mediation was not tested.",
    "loop": "",
    "grade": "INFERRED",
    "moderators": "Task, pay arrangements and reporting; not a measured-output estimate.",
    "lag": "days",
    "sources": [
      "S5"
    ]
  },
  {
    "from": "localheat",
    "to": "productivity",
    "why": "The Maldivian model links WBGT with work performance under different workload assumptions.",
    "loop": "",
    "grade": "INFERRED",
    "moderators": "Work intensity and local adaptation; general functions may transfer imperfectly.",
    "lag": "days",
    "sources": [
      "S3"
    ]
  },
  {
    "from": "localheat",
    "to": "lost",
    "why": "The Maldivian model estimates fractions of shifts lost under heat exposure.",
    "loop": "poverty",
    "grade": "INFERRED",
    "moderators": "Capacity estimates are not payroll observations or proof of the full poverty cycle.",
    "lag": "days",
    "sources": [
      "S3"
    ]
  },
  {
    "from": "localheat",
    "to": "deaths",
    "why": "Bhutan's national model projects heat-related mortality among older people under warming scenarios.",
    "loop": "",
    "grade": "INFERRED",
    "moderators": "Climate scenario and socioeconomic assumptions; not an occupational mortality estimate.",
    "lag": "years",
    "sources": [
      "S2"
    ]
  },
  {
    "from": "hsys",
    "to": "deaths",
    "why": "Candidate modifier: stronger health provision may reduce heat mortality; Vietnamese provincial spending associations support testing this pathway.",
    "loop": "clinic",
    "grade": "INFERRED",
    "moderators": "Spending is a proxy, not a direct measure of service capacity or a tested intervention.",
    "lag": "unknown",
    "sources": [
      "S6"
    ]
  },
  {
    "from": "smog",
    "to": "respiratory",
    "why": "Pollution can modify heat-health risk, with heterogeneous results across regional studies.",
    "loop": "",
    "grade": "INFERRED",
    "moderators": "Pollutant, health outcome, local exposure and pre-existing respiratory disease.",
    "lag": "days",
    "sources": [
      "S8"
    ]
  }
]
```

## D. LEVERS

Measures are proposed evaluation measures. Consultations, project descriptions and experiments retain their stated limits; publication alone is not an effectiveness result.

```json
[
  {
    "id": "heatrules",
    "edge": [
      "localheat",
      "farmwork"
    ],
    "title": "Develop locally usable workplace standards",
    "who": [
      "Labour ministries",
      "Worker organisations",
      "Employer organisations"
    ],
    "when": "years",
    "measure": "Verify legal adoption, workplace coverage, exposure checks and compliance separately.",
    "text": "A national consultation is a delivery step. It does not establish that protections were adopted or reduced harm.",
    "example": "Lao PDR, March 2025: the ministry and ILO reviewed draft heat, lighting and noise standards.",
    "unintended": "",
    "sources": [
      "S7"
    ]
  },
  {
    "id": "countdeaths",
    "edge": [
      "heatsymptoms",
      "underreport"
    ],
    "title": "Keep missing values visible",
    "who": [
      "Health ministries",
      "Statistical agencies",
      "Meteorological agencies"
    ],
    "when": "season",
    "measure": "Track completed heat indicators, definitions and linkage to clinical and mortality records.",
    "text": "Publishing missingness helps distinguish zero events from unspecified data. It does not itself measure the health burden.",
    "example": "Timor-Leste, 2026: the WHO country profile displays heat-health indicators separately from wider adaptation activity.",
    "unintended": "",
    "sources": [
      "S4"
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
    "group": "older",
    "fact": "Bhutan's 2015 profile projects about 49 heat-related deaths per 100,000 people aged 65 or over by 2080 under a high-emissions scenario.",
    "grade": "INFERRED",
    "sources": [
      "S2"
    ]
  },
  {
    "group": "women workers",
    "fact": "Across 753 female survey responses in three Cambodian factories, reported symptoms were 68% in cool months and 88% in hot months. The study was published in 2025.",
    "grade": "UNCERTAIN",
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
    "id": "outerislands",
    "loop": "poverty",
    "q": "How well do national heat-work estimates represent workers on outer Maldivian islands?",
    "have": "A sector model with explicit limits on local data and worker assumptions.",
    "could": "Compare personal exposure, work-rest time and output across matched island workplaces.",
    "scale": "Illustrative: 100 workers across six islands during one hot season."
  },
  {
    "id": "elevationhealth",
    "loop": "",
    "q": "Do heat-related symptoms and care use differ between matched lowland, hill and highland settlements?",
    "have": "Nepal has workplace observations and elevation-dependent warming studies, without a linked comparison here.",
    "could": "Use common exposure sensors and symptom definitions with linked clinic data.",
    "scale": "Illustrative: 12 settlements across three elevation bands over two hot seasons."
  },
  {
    "id": "missingindicator",
    "loop": "invisible",
    "q": "How many heat-related clinical presentations can a linked reporting pilot identify where profile fields are unspecified?",
    "have": "Timor-Leste's profile records missing heat indicators alongside wider health institutions.",
    "could": "Pilot agreed case definitions, daily weather linkage and record-completeness checks.",
    "scale": "Illustrative: four health facilities for six months; sample size follows a feasibility phase."
  }
]
```

## H. SOURCES

Only opened material supports the retained claims. Access depth and design constraints are stated in each limit. Where an authors' limitations section was unavailable, this is explicit rather than inferred. Source keys are local to this report.

```json
[
  {
    "key": "S1",
    "url": "https://www.jstage.jst.go.jp/article/indhealth/51/1/51_2012-0166/_article",
    "title": "Assessing Climate Change and Heat Stress Responses in the Tarai Region of Nepal",
    "by": "Pradhan et al.",
    "year": 2013,
    "type": "Peer-reviewed study",
    "where": "Tarai, Nepal",
    "scale": "Household surveys, workplace observations and heat-index measurements",
    "finding": "Selected indoor and outdoor workplaces had substantial heat exposure; reported changes in work timing and clothing offered incomplete protection.",
    "limit": "Journal abstract read. It explicitly calls for more quantitative measurement of health effects and productivity loss; household sample size was not verified.",
    "expect": [
      "HOTHAPS",
      "Adaptive strategies",
      "2013 Volume 51"
    ]
  },
  {
    "key": "S2",
    "url": "https://cdn.who.int/media/docs/default-source/searo/wsh-och-searo/bhu-c-h-profile.pdf?sfvrsn=9b974adb_2",
    "title": "Climate and Health Country Profile – 2015: Bhutan",
    "by": "World Health Organization",
    "year": 2015,
    "type": "Agency report",
    "where": "Bhutan",
    "scale": "National climate and health projections, including people aged 65 years or over",
    "finding": "Under a high-emissions scenario, heat-related mortality among older people was projected to reach about 49 deaths per 100,000 by 2080.",
    "limit": "Page 4 reports country-level modelling using three climate models and continued socioeconomic trends. The estimated historical baseline is not a recorded zero-death count.",
    "expect": [
      "BHUTAN",
      "HEAT-RELATED MORTALITY",
      "1961–1990"
    ]
  },
  {
    "key": "S3",
    "url": "https://www.ilo.org/sites/default/files/2026-10/MALDIVES_Study_Oct27.pdf",
    "title": "Impacts of heat stress on jobs and productivity in the Maldives: Quantitative and qualitative employment estimates for evidence-based decision-making",
    "by": "International Labour Organization",
    "year": 2026,
    "type": "Agency report",
    "where": "Maldives",
    "scale": "Sector models using the 1985-2014 reference period and scenarios to 2100",
    "finding": "Estimated work-capacity and productivity losses vary with workload and sector.",
    "limit": "Research limitations, pages 56-57: a general acclimatised-worker function, one climate model, coarse spatial data and incomplete informal-work coverage limit local transfer.",
    "expect": [
      "Research limitations",
      "1985-2014",
      "work capacity"
    ]
  },
  {
    "key": "S4",
    "url": "https://cdn.who.int/media/docs/default-source/searo/hsd/country-profiles/tls-climate-change-cf-2026.pdf?download=true&sfvrsn=131a4a74_3",
    "title": "Climate change country profile: Timor-Leste, 2026",
    "by": "World Health Organization",
    "year": 2026,
    "type": "Agency report",
    "where": "Timor-Leste",
    "scale": "National climate-health indicators for 2020-2025",
    "finding": "Heat-related mortality and illness indicators are shown as not specified. The profile records an approved Health National Adaptation Plan.",
    "limit": "Country-response indicator profile, not an epidemiological study. Missing entries do not establish zero events or absence of records outside this publication.",
    "expect": [
      "TIMOR-LESTE",
      "Heat-related mortality",
      "Health National Adaptation Plan"
    ]
  },
  {
    "key": "S5",
    "url": "https://link.springer.com/article/10.1186/s12889-025-22787-0",
    "title": "Perceived impact of heat stress on health and productivity of tropical female garment workers– a comparison between cool and hot months",
    "by": "Chea et al.",
    "year": 2025,
    "type": "Peer-reviewed study",
    "where": "Phnom Penh, Cambodia",
    "scale": "753 female survey responses across three garment factories; cool and hot periods",
    "finding": "Reported symptoms rose from 68% in cool months to 88% in hot months; productivity outcomes were perceived rather than measured output.",
    "limit": "Authors identify recall, self-report and selection biases. Only female sewing-department workers were sampled; environmental logging followed the survey period.",
    "expect": [
      "753 female responses",
      "25 April 2025",
      "Limitations"
    ]
  },
  {
    "key": "S6",
    "url": "https://www.tse-fr.eu/publications/journal-article/impact-cold-waves-and-heat-waves-mortality-evidence-lower-middle",
    "title": "The Impact of Cold Waves and Heat Waves on Mortality: Evidence from a Lower Middle-Income Country",
    "by": "Nguyen et al.",
    "year": 2023,
    "type": "Peer-reviewed study",
    "where": "Viet Nam",
    "scale": "Daily temperatures and monthly mortality, 2000-2018",
    "finding": "Estimated mortality effects were larger among older people and in southern hot regions, and smaller in provinces with more health spending or air conditioning.",
    "limit": "Institutional abstract read; full limitations section unavailable. Province-level associations do not establish the effect of a specific spending or cooling intervention.",
    "expect": [
      "2000-2018",
      "Southern Vietnam",
      "public spending on health"
    ]
  },
  {
    "key": "S7",
    "url": "https://www.ilo.org/resource/news/lao-people%E2%80%99s-democratic-republic-advances-occupational-safety-and-health",
    "title": "Lao People’s Democratic Republic advances occupational safety and health standards",
    "by": "International Labour Organization",
    "year": 2025,
    "type": "Agency report",
    "where": "Lao PDR",
    "scale": "National consultation on draft workplace heat, lighting and noise standards",
    "finding": "A ministry-ILO workshop reviewed the draft on 7 March 2025; the announcement anticipated later promulgation.",
    "limit": "Primary institutional activity report, not an outcome evaluation or the enacted legal text. Final adoption and implementation were not verified.",
    "expect": [
      "19 March 2025",
      "Draft Ministerial Decision",
      "7 March 2025"
    ]
  },
  {
    "key": "S8",
    "url": "https://researchprofiles.canberra.edu.au/en/publications/heat-related-health-impacts-in-asean-countries-a-scoping-review/",
    "title": "Heat-related health impacts in ASEAN countries: A scoping review",
    "by": "Aung et al.",
    "year": 2026,
    "type": "Systematic review",
    "where": "Southeast Asia",
    "scale": "76 included studies",
    "finding": "The review documents mortality, morbidity and air-pollution effect modification, with heterogeneous findings and incomplete geographical coverage.",
    "limit": "Institutional abstract read. Scoping evidence cannot supply one transferable heat threshold; the abstract does not give country-by-country study counts.",
    "expect": [
      "76 studies",
      "Jun 2026",
      "Effect modification"
    ]
  },
  {
    "key": "S9",
    "url": "https://mausamjournal.imd.gov.in/index.php/MAUSAM/article/view/649",
    "title": "Spatial and temporal variation of surface air temperature at different altitude zone in recent 30 years over Nepal",
    "by": "Nayava et al.",
    "year": 2017,
    "type": "Peer-reviewed study",
    "where": "Nepal",
    "scale": "Thirty-year temperature analysis using 22 stations",
    "finding": "The station analysis found elevation-dependent warming patterns that differed from earlier accounts of maximum warming at high elevations.",
    "limit": "Journal abstract read; full limitations section unavailable. Mean warming trends are not measures of heat illness or a comparison of personal exposure.",
    "expect": [
      "22 stations",
      "2017-07-01",
      "1000 to 2000"
    ]
  }
]
```

## I. WHAT I COULD NOT VERIFY

- This is a targeted place screen, not a systematic review of every country or an exhaustive audit of every site file.
- The coverage table counts unique URLs in EVIDENCE.json whose where field explicitly names a country or the documented Jakarta alias. It excludes global studies without country tags and all other site sections.
- The mountain-is-safe and island-is-only-sea-level-risk framings were not retained. Country projections and local observations are kept distinct, rather than converted into unverified local mortality counts.
- No complete cycle is added in E. The proposed links concern exposure, modifiers and selected pathways; their lags are analytical suggestions.
- Direct humid-versus-dry field comparisons, small-town studies and outer-island clinical studies remain unverified in this run.
- For Pakistan, Myanmar and Malaysia, this run did not open a new country-specific primary study. Existing and regional evidence is not treated as absent.
- The South Asia systematic-mapping record and the Southeast Asia attribution review could not be read beyond access barriers. Their search-result counts were excluded.
- The final Lao workplace standard and its implementation were not verified. The March 2025 draft announcement is not described as current law.
- Where only an institutional abstract was accessible, the authors' full limitations section remains unverified.

