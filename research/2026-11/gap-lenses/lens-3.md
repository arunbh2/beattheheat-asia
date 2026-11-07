## A. SUMMARY

- This run covers lens 3: slow, hidden and under-counted harms. It proposes nine updates to existing nodes, eight links and two worked levers, using the supplied map as the baseline.

- The main blind spot is time: effects can extend into the next night, harvest or school year. Indian evidence connects heat with later food consumption and learning, while worker studies capture reduced output during attendance. [S5-S7]

- Group distinctions remain useful. Household averages can conceal low food intake, while personal monitoring shows that women in the same area can experience different heat exposure. [S7,S12]

- Several additions were tested and rejected: a heat-only explanation of Sri Lankan CKDu, permanent cognitive injury inferred from test scores, and modelled output losses presented as observed wages. [S3-S6,S15]

- Debt repayment, unpaid-care time, persistent mental health effects and infant growth remain thin in the opened evidence. Thirteen of the fifteen sources concern South or Southeast Asian settings; the two global reviews are labelled.

Evidence checked to 4 November 2026. KNOWN describes a measured or replicated finding, not automatic proof of causation. INFERRED marks models or indirect mechanisms; UNCERTAIN marks single-study or contested interpretations.

## B. NEW OR UPDATED HARMS

```json
[
  {
    "id": "kidney",
    "sys": "health",
    "status": "update",
    "label": "Kidney harm over time",
    "desc": "Repeated hot work may contribute to kidney harm. Indian measurements and Thai follow-up reports support concern, but reduced function on one test is not a chronic diagnosis, and Sri Lankan CKDu evidence does not support a heat-only explanation.",
    "grade": "UNCERTAIN",
    "who": "Salt workers, agricultural workers and other workers with repeated heat exposure",
    "sources": [
      "S1",
      "S2",
      "S3",
      "S4"
    ],
    "debated": "The contribution of heat to persistent disease varies by setting and remains unresolved for CKDu."
  },
  {
    "id": "learning",
    "sys": "education",
    "status": "update",
    "label": "Learning across hot seasons",
    "desc": "Studies associate accumulated heat exposure with poorer educational performance. This extends the concern beyond the day of a heat event.",
    "grade": "KNOWN",
    "who": "School-age children, especially in households dependent on agricultural income",
    "sources": [
      "S15"
    ],
    "debated": "Test-score associations do not establish permanent cognitive injury or a single mechanism."
  },
  {
    "id": "productivity",
    "sys": "work",
    "status": "update",
    "label": "Output lost while present",
    "desc": "Indian factory records associate heat with lower output during attendance and with later absence. Counting only missed workdays can overlook reduced output while working.",
    "grade": "UNCERTAIN",
    "who": "Factory workers; implications for informal work need separate testing",
    "sources": [
      "S6"
    ],
    "debated": "Annual warming estimates are modelled scenarios, and output loss is not automatically wage loss."
  },
  {
    "id": "hunger",
    "sys": "food",
    "status": "update",
    "label": "Diets after hot seasons",
    "desc": "Rural Indian evidence links growing-season heat with poorer subsequent food consumption among households with low intake. Stable averages can conceal this distributional effect.",
    "grade": "UNCERTAIN",
    "who": "Rural households near the lower end of food intake",
    "sources": [
      "S7"
    ],
    "debated": "The opened full text is a working paper; household consumption is not an individual clinical nutrition measure."
  },
  {
    "id": "sleepless",
    "sys": "health",
    "status": "update",
    "label": "Recovery lost at night",
    "desc": "Heat is associated with poorer sleep, including among workers returning home after hot work. Evidence on effects accumulated across seasons remains limited.",
    "grade": "KNOWN",
    "who": "Heat-exposed workers and people sleeping in hot homes",
    "sources": [
      "S8"
    ],
    "debated": "Short-term sleep changes do not establish persistent insomnia or later chronic disease."
  },
  {
    "id": "mental",
    "sys": "health",
    "status": "update",
    "label": "Distress between hot days",
    "desc": "Thai survey evidence associates frequent heat interference with poorer well-being. It does not establish that heat caused a lasting mental health condition.",
    "grade": "UNCERTAIN",
    "who": "Adults whose sleep, travel, housework or paid work is affected by heat",
    "sources": [
      "S9"
    ],
    "debated": "Exposure and well-being were reported together, so temporal order remains unresolved."
  },
  {
    "id": "care",
    "sys": "society",
    "status": "update",
    "label": "Housework and care pressure",
    "desc": "Heat can interfere with housework. Regional workers also describe care competing with paid work, without isolating heat's share.",
    "grade": "INFERRED",
    "who": "Caregivers and home-based workers, particularly women",
    "sources": [
      "S9",
      "S11"
    ],
    "debated": "Housework, unpaid care and paid home production are distinct activities; their heat-related time losses remain poorly separated."
  },
  {
    "id": "debt",
    "sys": "work",
    "status": "update",
    "label": "Bills beyond hot days",
    "desc": "Bangladeshi worker accounts describe treatment costs and borrowing during heat. They do not establish how debt develops or is repaid across years.",
    "grade": "UNCERTAIN",
    "who": "Informal workers and households paying treatment costs",
    "sources": [
      "S10"
    ],
    "debated": "Household accounts are not a population borrowing rate or a verified long-term debt trajectory."
  },
  {
    "id": "underreport",
    "sys": "gov",
    "status": "update",
    "label": "Exposure blurred by averages",
    "desc": "Personal monitoring among rural Indian women found substantial differences within the same place and hour. Area averages can misclassify exposure in either direction; they do not supply a simple correction for missed illness.",
    "grade": "KNOWN",
    "who": "Rural women, including those combining agricultural and household work",
    "sources": [
      "S12"
    ],
    "debated": "Exposure measurement error is distinct from disease undercounting; the study did not estimate missed cases."
  }
]
```

## C. LINKS

```json
[
  {
    "from": "sanitation",
    "to": "kidney",
    "why": "Limited toilet access can discourage drinking during hot work; the contribution to persistent kidney harm remains unmeasured.",
    "loop": "clinic",
    "grade": "INFERRED",
    "moderators": "Accessible toilets, drinking opportunities and baseline kidney health; partial pathway only.",
    "lag": "unknown",
    "sources": [
      "S1"
    ]
  },
  {
    "from": "kidney",
    "to": "lost",
    "why": "Sri Lankan CKD patients and caregivers reported income lost through missed work; the study did not attribute their disease to heat.",
    "loop": "clinic",
    "grade": "UNCERTAIN",
    "moderators": "Treatment schedules, travel, paid leave and caregiver support; non-heat-specific downstream evidence.",
    "lag": "weeks",
    "sources": [
      "S14"
    ]
  },
  {
    "from": "harvests",
    "to": "learning",
    "why": "The Indian education study identifies agricultural income as a pathway between growing-season heat and lower test performance.",
    "loop": "school",
    "grade": "UNCERTAIN",
    "moderators": "Workfare access and household reliance on agricultural income; mediation is not established for every child.",
    "lag": "years",
    "sources": [
      "S5"
    ]
  },
  {
    "from": "harvests",
    "to": "hunger",
    "why": "Rural Indian results link growing-season heat, reduced home-produced food and poorer subsequent consumption in low-intake households.",
    "loop": "poverty",
    "grade": "UNCERTAIN",
    "moderators": "Food purchases and starting intake; repeated surveys did not follow individual households.",
    "lag": "years",
    "sources": [
      "S7"
    ]
  },
  {
    "from": "homes",
    "to": "sleepless",
    "why": "Hot sleeping environments can limit recovery from daytime heat.",
    "loop": "sleep",
    "grade": "KNOWN",
    "moderators": "Humidity, night-time temperature and cooling access; global review plus Thai self-reports, with limited cumulative evidence.",
    "lag": "days",
    "sources": [
      "S8"
    ]
  },
  {
    "from": "sleepless",
    "to": "mental",
    "why": "Thai heat-related sleep interference was associated with poorer well-being; this is a candidate direction, not a demonstrated causal sequence.",
    "loop": "sleep",
    "grade": "UNCERTAIN",
    "moderators": "Reverse direction and shared causes remain possible.",
    "lag": "unknown",
    "sources": [
      "S9"
    ]
  },
  {
    "from": "care",
    "to": "productivity",
    "why": "Home-based workers described care demands crowding out paid work; the heat-specific contribution was not isolated.",
    "loop": "squeeze",
    "grade": "UNCERTAIN",
    "moderators": "Care support, water access and household work arrangements; broader climate evidence.",
    "lag": "unknown",
    "sources": [
      "S11"
    ]
  },
  {
    "from": "heatstroke",
    "to": "debt",
    "why": "One South Asian household account linked reported heatstroke, treatment costs and borrowing.",
    "loop": "debt",
    "grade": "UNCERTAIN",
    "moderators": "Reported diagnosis was not independently verified; financial protection may alter the pathway.",
    "lag": "unknown",
    "sources": [
      "S11"
    ]
  }
]
```

## D. LEVERS

```json
[
  {
    "id": "socialprotection",
    "edge": [
      "harvests",
      "learning"
    ],
    "title": "Buffer seasonal income shocks",
    "who": [
      "Public works agencies",
      "Social protection agencies",
      "Education services"
    ],
    "when": "years",
    "measure": "Compare learning and income after hot growing seasons by programme access.",
    "text": "Workfare buffered the Indian heat-learning relationship. Transfer depends on programme access and timing.",
    "example": "India, 2020 publication: the study examined workfare rollout.",
    "unintended": "",
    "sources": [
      "S5"
    ]
  },
  {
    "id": "coolhousing",
    "edge": [
      "homes",
      "sleepless"
    ],
    "title": "Test roofs and night recovery",
    "who": [
      "Housing agencies",
      "Community housing organisations",
      "Public health researchers"
    ],
    "when": "season",
    "measure": "Track indoor day and night temperatures, sleep and maintenance costs separately.",
    "text": "A small Ahmedabad comparison supports testing roof treatments locally. Its daytime temperature results do not demonstrate improved sleep.",
    "example": "Ahmedabad, 4-10 October 2017: temperatures were compared in 16 selected households with different roofs and treatments.",
    "unintended": "The Airlite intervention was hotter than comparison roofs; performance differed by design.",
    "sources": [
      "S13"
    ]
  }
]
```

## E. EVIDENCE FOR CYCLES

```json
[
  {
    "loop": "sleep",
    "by": "Raja et al., 2026",
    "title": "Impacts of heat on sleep quality among heat-exposed workers: a systematic review",
    "url": "https://www.aoemj.org/journal/view.php?doi=10.35371/aoem.2026.38.e3",
    "type": "Systematic review",
    "where": "Global, including Asian settings",
    "scale": "11 studies",
    "finding": "Supports the heat-to-poorer-sleep leg. It does not establish closure of a sleep-vulnerability feedback cycle.",
    "limit": "Mostly cross-sectional studies; little cumulative evidence and no pooled effect estimate."
  }
]
```

## F. AT-RISK FACTS

```json
[
  {
    "group": "workers",
    "fact": "Among 352 Tamil Nadu salt pan workers studied in 2017-2020, 7% had an eGFR below 60 ml/min per 1.73 m². One blood measurement did not establish chronic disease.",
    "grade": "KNOWN",
    "sources": [
      "S1"
    ]
  },
  {
    "group": "workers",
    "fact": "In Thai worker surveys from 2005 and 2009, prolonged reported occupational heat stress in men was associated with reported incident kidney disease: adjusted OR 2.22, 95% CI 1.48-3.35.",
    "grade": "UNCERTAIN",
    "sources": [
      "S2"
    ]
  },
  {
    "group": "women",
    "fact": "Monitoring of 104 rural Tamil Nadu women during 2018-2021 found personal temperatures sometimes differed by more than 5°C within the same hour.",
    "grade": "KNOWN",
    "sources": [
      "S12"
    ]
  },
  {
    "group": "workers",
    "fact": "An Indian manufacturing study published in 2021 estimated a 2.1% annual output decline in a scenario where every day became 1°C warmer. This was not an observed annual wage loss.",
    "grade": "INFERRED",
    "sources": [
      "S6"
    ]
  },
  {
    "group": "caregivers",
    "fact": "Among 272 CKD patients studied in Sri Lanka in May-June 2019, median monthly expenditure for haemodialysis care was LKR 38,540 [USD 215], including indirect costs. Heat causation was not assessed.",
    "grade": "KNOWN",
    "sources": [
      "S14"
    ]
  }
]
```

## G. OPEN QUESTIONS

```json
[
  {
    "id": "kidneypersistence",
    "loop": "clinic",
    "q": "Which repeated heat exposures predict kidney impairment that persists after the hot season?",
    "have": "Regional measurements and follow-up self-reports support concern, but persistent clinical impairment and alternative exposures remain difficult to separate.",
    "could": "Follow workers with personal exposure, hydration and clinical measurements before, during and after the season, including repeat kidney tests after at least three months.",
    "scale": "Illustrative: 300 workers over two hot seasons; a formal power calculation would refine the sample."
  },
  {
    "id": "debtduration",
    "loop": "debt",
    "q": "When do heat-related treatment and income shocks leave debt outstanding after the season?",
    "have": "Household accounts describe borrowing; observed repayment trajectories are scarce in the opened evidence.",
    "could": "Combine monthly household accounts, illness records and local heat measures, with cooler-period comparisons.",
    "scale": "Illustrative: 250 households over two years."
  },
  {
    "id": "nightrecovery",
    "loop": "sleep",
    "q": "Does reducing night-time heat improve recovery and next-day work without increasing household costs?",
    "have": "Sleep associations and small daytime roof comparisons exist, but their joint effect was not tested in the opened regional studies.",
    "could": "Use a randomised crossover cooling trial with exposure sensors, sleep measures, next-day function and expenditure diaries.",
    "scale": "Illustrative: 200 workers across eight sites for six weeks."
  },
  {
    "id": "caretime",
    "loop": "squeeze",
    "q": "How does heat redistribute unpaid care, domestic work and paid home production?",
    "have": "Regional surveys show interference and competing demands, with limited heat-specific time accounting.",
    "could": "Collect repeated time diaries from caregivers and other household members alongside indoor heat and care-recipient needs.",
    "scale": "Illustrative: 200 households during hot and cooler weeks."
  },
  {
    "id": "earlygrowth",
    "loop": "protection",
    "q": "Does repeated household heat exposure predict infant growth after accounting for diet and infection?",
    "have": "A Bangladesh study was located, but its primary full text was not verified in this run; no growth effect was added.",
    "could": "Follow pregnancy-to-infancy exposure, feeding, infection and measured growth, with prespecified confounders.",
    "scale": "Illustrative: 400 parent-infant pairs over two years; feasibility and power remain to be assessed."
  }
]
```

## H. SOURCES

```json
[
  {
    "key": "S1",
    "url": "https://www.kireports.org/article/S2468024923012664/pdf",
    "title": "Occupational Heat Stress and Kidney Health in Salt Pan Workers",
    "by": "Venugopal et al.",
    "year": 2023,
    "type": "Peer-reviewed study",
    "where": "Tamil Nadu, India",
    "scale": "352 salt pan workers; 2017 to 2020",
    "finding": "7% had an eGFR below 60 ml/min per 1.73 m². This was a measurement of reduced kidney function, not confirmation of chronic disease.",
    "limit": "Venous samples were taken once during the workday. Persistent impairment was not established.",
    "expect": [
      "352 workers",
      "2017 to 2020",
      "serum creatinine"
    ]
  },
  {
    "key": "S2",
    "url": "https://www.jstage.jst.go.jp/article/jea/22/3/22_JE20110082/_pdf/-char/en",
    "title": "Association Between Occupational Heat Stress and Kidney Disease Among 37 816 Workers in the Thai Cohort Study (TCS)",
    "by": "Tawatsupa et al.",
    "year": 2012,
    "type": "Peer-reviewed study",
    "where": "Thailand",
    "scale": "37 816 workers; 2005 and 2009 surveys",
    "finding": "Among men, prolonged reported occupational heat stress was associated with incident reported kidney disease: adjusted OR 2.22, 95% CI 1.48-3.35.",
    "limit": "Heat and doctor-diagnosed disease were self-reported. The study did not directly establish causation or clinically verify disease.",
    "expect": [
      "2005",
      "2009",
      "prolonged heat stress"
    ]
  },
  {
    "key": "S3",
    "url": "https://onlinelibrary.wiley.com/doi/10.1111/nep.13989",
    "title": "Two decades of chronic kidney disease of unknown aetiology (CKDu) research: Existing evidence and persistent gaps from epidemiological studies in Sri Lanka",
    "by": "Pett et al.",
    "year": 2022,
    "type": "Peer-reviewed study",
    "where": "Sri Lanka",
    "scale": "86 articles from 2000-2020",
    "finding": "The review found persistent weaknesses in evidence on CKDu causes, including inconsistent findings and exposure measurement for heat.",
    "limit": "Many underlying studies were cross-sectional or case-control studies. Recall bias and differences in disease definitions limited comparisons.",
    "expect": [
      "2.12 Heat stress",
      "recall bias",
      "multifactorial"
    ]
  },
  {
    "key": "S4",
    "url": "https://scholars.duke.edu/publication/1572526",
    "title": "Occupational heat exposure alone does not explain chronic kidney disease of uncertain aetiology (CKDu) in Sri Lanka",
    "by": "De Silva et al.",
    "year": 2022,
    "type": "Peer-reviewed study",
    "where": "Sri Lanka",
    "scale": "225 fisherfolk, 180 paddy farmers and 70 tea plantation workers",
    "finding": "Occupational heat exposure did not explain the differences in kidney impairment across the three groups.",
    "limit": "The opened institutional record contains the abstract. This occupational comparison does not establish an alternative cause of CKDu.",
    "expect": [
      "October 1, 2022",
      "N = 225",
      "p = 0.227"
    ]
  },
  {
    "key": "S5",
    "url": "https://www.journals.uchicago.edu/doi/abs/10.1086/710066",
    "title": "Temperature and Human Capital in India",
    "by": "Garg et al.",
    "year": 2020,
    "type": "Peer-reviewed study",
    "where": "India",
    "scale": "Indian school-age children; abstract only",
    "finding": "Heat was associated with lower test performance. Agricultural income was a proposed pathway; workfare buffered the relationship.",
    "limit": "Full text was inaccessible. Test performance does not establish permanent cognitive injury.",
    "expect": [
      "Agricultural income",
      "workfare program",
      "India"
    ]
  },
  {
    "key": "S6",
    "url": "https://www.journals.uchicago.edu/doi/full/10.1086%2F713733",
    "title": "The Impact of Temperature on Productivity and Labor Supply: Evidence from Indian Manufacturing",
    "by": "Somanathan et al.",
    "year": 2021,
    "type": "Peer-reviewed study",
    "where": "India",
    "scale": "Factory records and a panel of 58,377 plants",
    "finding": "Heat was associated with reduced output while workers were present and with absenteeism. A fitted scenario estimated a 2.1% annual output decline if every day became 1°C warmer.",
    "limit": "The annual change is a modelled scenario. Some factory data could not link individual output and attendance, and cooling comparisons were not randomised.",
    "expect": [
      "58,377 plants",
      "six days preceding",
      "2.1%"
    ]
  },
  {
    "key": "S7",
    "url": "https://www.nber.org/system/files/working_papers/w34047/w34047.pdf",
    "title": "Hot Weather, Undernutrition, and Adaptation in Rural India",
    "by": "Stainier et al.",
    "year": 2025,
    "type": "Working paper",
    "where": "Rural India",
    "scale": "Over 300,000 households; surveys from 2003-2012",
    "finding": "Growing-season heat was associated with poorer food consumption in the subsequent year among households near the lower end of the intake distribution. Aggregate consumption obscured this difference.",
    "limit": "Repeated cross-sections did not follow the same households. Household food consumption does not identify individual intake or clinically measured malnutrition. The opened full text is a working-paper version.",
    "expect": [
      "July 2025",
      "300,000 households",
      "subsequent year"
    ]
  },
  {
    "key": "S8",
    "url": "https://www.aoemj.org/journal/view.php?doi=10.35371/aoem.2026.38.e3",
    "title": "Impacts of heat on sleep quality among heat-exposed workers: a systematic review",
    "by": "Raja et al.",
    "year": 2026,
    "type": "Systematic review",
    "where": "Global evidence, including Asian settings",
    "scale": "11 studies",
    "finding": "Heat exposure was associated with poorer sleep across several measures. Few studies examined cumulative exposure.",
    "limit": "Most studies were cross-sectional. Differences in measurement prevented meta-analysis, and control for humidity, cooling and social conditions varied.",
    "expect": [
      "January 8, 2026",
      "11 studies",
      "cumulative heat effects"
    ]
  },
  {
    "key": "S9",
    "url": "https://bmjopen.bmj.com/content/bmjopen/2/6/e001396.full.pdf",
    "title": "Heat stress, health and well-being: findings from a large national cohort of Thai adults",
    "by": "Tawatsupa et al.",
    "year": 2012,
    "type": "Peer-reviewed study",
    "where": "Thailand",
    "scale": "60 569 adults; 2009 survey",
    "finding": "Heat interference was associated with poorer well-being and affected sleep and housework.",
    "limit": "Cross-sectional self-reports cannot establish temporal order, causation or persistent illness.",
    "expect": [
      "29.9",
      "housework",
      "2009"
    ]
  },
  {
    "key": "S10",
    "url": "https://www.iied.org/sites/default/files/pdfs/2026-08/22755iied.pdf",
    "title": "No escaping the heat: Health and economic impacts of heat stress on informal workers in urban Bangladesh",
    "by": "IIED",
    "year": 2026,
    "type": "Agency report",
    "where": "Dhaka, Bangladesh",
    "scale": "175 informal worker households, including 122 outdoor and 53 indoor worker households",
    "finding": "Surveys and group discussions described illness, treatment costs and financial pressure during heat. The report also constructed annual economic estimates.",
    "limit": "The evidence is local and includes self-reports. Annual estimates use assumptions, including 100 extreme-heat days; they are not annual household account records.",
    "expect": [
      "175 informal worker households",
      "psychological stress index",
      "FGDs"
    ]
  },
  {
    "key": "S11",
    "url": "https://www.homenetinternational.org/wp-content/uploads/2023/02/HNSA-Impact-of-Climate-Change-on-Home-based-workers.pdf",
    "title": "Impact of Climate Change on Urban Home-based Workers in South Asia",
    "by": "HomeNet South Asia",
    "year": 2022,
    "type": "Agency report",
    "where": "Dhaka, Ahmedabad, Surat, Bhaktapur and Lalitpur",
    "scale": "202 women; surveys in April-May 2021 and eight focus group discussions",
    "finding": "Participants described care affecting paid work. One account linked reported heatstroke, treatment costs and borrowing.",
    "limit": "The small sample was not representative. Pandemic conditions affected interviews, and broader climate effects cannot be attributed entirely to heat.",
    "expect": [
      "202 women",
      "unpaid care work",
      "April"
    ]
  },
  {
    "key": "S12",
    "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC10785747/",
    "title": "Heat Exposure among Adult Women in Rural Tamil Nadu, India",
    "by": "Deshpande et al.",
    "year": 2023,
    "type": "Peer-reviewed study",
    "where": "Rural Tamil Nadu, India",
    "scale": "104 women; 614 monitoring sessions between 2018 and 2021",
    "finding": "Personal temperature exposures sometimes differed by more than 5°C between participants at the same hour. Area-level temperature products did not represent all personal exposures.",
    "limit": "The sample included adult women only. Monitoring was opportunistic, and activity-related explanations were not fully verified. Exposure differences do not quantify missed disease.",
    "expect": [
      "104 different participants",
      "614 measurements",
      "13 June 2018"
    ]
  },
  {
    "key": "S13",
    "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC7227734/",
    "title": "Combating Climate Change-induced Heat Stress: Assessing Cool Roofs and Its Impact on the Indoor Ambient Temperature of the Households in the Urban Slums of Ahmedabad",
    "by": "Vellingiri et al.",
    "year": 2020,
    "type": "Peer-reviewed study",
    "where": "Ahmedabad, India",
    "scale": "16 selected households; 4-10 October 2017",
    "finding": "Several roof treatments reduced measured indoor daytime temperature. An Airlite roof intervention was hotter than comparison roofs.",
    "limit": "The comparison was small, brief and non-randomised. Sleep, night-time recovery and long-term health benefits were not measured.",
    "expect": [
      "16 selected slum households",
      "October 4, 2017",
      "Airlite"
    ]
  },
  {
    "key": "S14",
    "url": "https://link.springer.com/article/10.1186/s12913-026-15146-1",
    "title": "Beyond free healthcare: household out-of-pocket expenditure and catastrophic health expenditure among chronic kidney disease patients attending a tertiary care hospital in Sri Lanka",
    "by": "Rathnayake et al.",
    "year": 2026,
    "type": "Peer-reviewed study",
    "where": "Kurunegala, Sri Lanka",
    "scale": "272 patients; May-June 2019",
    "finding": "Median monthly expenditure among haemodialysis patients was LKR 38,540 [USD 215]. Costs included patient and caregiver income losses as well as direct expenses.",
    "limit": "Single-hospital, retrospective self-reports used a 30-day reference period. Data preceded later economic changes. CKD was not attributed to heat.",
    "expect": [
      "15 July 2026",
      "272 participants",
      "May to June 2019"
    ]
  },
  {
    "key": "S15",
    "url": "https://journals.plos.org/climate/article?id=10.1371/journal.pclm.0000618",
    "title": "Cumulative exposure to urban heat can affect the learning capacity of students and penalize the vulnerable and low-income young population: A systematic review",
    "by": "Vasilakopoulou et al.",
    "year": 2025,
    "type": "Systematic review",
    "where": "Global evidence, including India",
    "scale": "Six articles covering seven studies across 61 countries",
    "finding": "Most included studies linked cumulative heat exposure with poorer educational outcomes.",
    "limit": "Studies used different populations, models and exposure proxies. Classroom conditions and other environmental stresses were often missing. Test outcomes do not establish permanent brain injury.",
    "expect": [
      "July 30, 2025",
      "seven studies",
      "indoor classroom climatic conditions"
    ]
  }
]
```

## I. WHAT I COULD NOT VERIFY

- Child growth in Bangladesh: a primary study was located, but the full text could not be verified. Publisher access returned an error, and a repository download was rate-limited. No growth effect, number or new node was added.

- CKDu: the heat-only explanation was rejected as an addition. The Sri Lankan review and occupational comparison do not establish it. A single reduced kidney-function measurement also does not establish chronic disease. [S1,S3,S4]

- Learning and mental health: lower test scores and concurrent distress were retained as bounded findings. Permanent cognitive injury and lasting psychiatric illness were not established by the opened evidence. [S5,S9,S15]

- Debt and care: household accounts were retained as limited evidence. Heat-specific borrowing rates, multi-year repayment effects and quantified losses of unpaid-care productivity were not established. The HomeNet report combines climate pressures and pandemic-era interviews. [S10,S11]

- Modelled losses: the Indian annual-output scenario was labelled INFERRED. The IIED report's annual calculations were not treated as observed annual accounts; they depend on assumptions about heat days and inefficient working hours. [S6,S10]

- Intervention transfer: the Indian education paper was accessible as an abstract, with full text behind an access barrier. No detailed programme design was inferred. The Ahmedabad roof comparison did not measure sleep or long-term health, so that benefit remains a testable proposition. [S5,S13]

- Cycle closure: the supplied map lists cycle names but not their edges. Section C assigns candidate contributions to existing cycles; no link is presented as closing a verified cycle. Section E supports one leg only.

- Coverage: no claim of an evidence absence is made for older people, people with disabilities, migrants, detained people or postpartum women. This run did not establish their longer-term effects across the region. The next agreed run is lens 2, compound and cascading events.

- Access stability: the rural Tamil Nadu exposure paper was read in full, but a later automated check encountered a browser challenge. Its content was retained from the successfully opened version. [S12]

