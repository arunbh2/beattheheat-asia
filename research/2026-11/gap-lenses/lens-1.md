## A. SUMMARY

- **The main addition is control over protection.** A group label can hide whether someone can reach water, change location, rest or obtain help. The proposed changes extend existing harms and add a separate detention setting. [S1, S6, S12]
- **The biggest blind spot is assisted protection.** Some disabled people, older people and children rely on another person to receive advice or act on it. Caregiver availability belongs alongside exposure and health status. [S1, S6, S16]
- **Regional evidence supports sharper distinctions.** Separate pregnant workers, internal and international migrants, displaced residents, and young adults from broad categories such as women, workers and settlements. Migration and employment formality are separate characteristics; the opened global migrant review also finds limited intervention evaluations. [S2, S5, S7-S9, S15]
- **Several candidates did not pass the test.** The Indonesian youth study does not establish findings for under-19s. Refugee-camp gastroenteritis results do not support one uniform heat-disease link. Traditional knowledge does not establish an inherent difference in heat tolerance. [S5, S13, S14]
- **Important areas remain thin.** Postpartum health, younger adolescents, caregiver heat strain, homelessness and Indigenous-specific heat outcomes need more direct evidence. The package contains eight harm entries, nine links, four levers and five study questions; no complete feedback cycle is established.

Scope: lens 1 only, checked to 4 November 2026. The supplied map is the baseline; these are proposed additions or refinements, not a claim about the live website. Keep existing content when merging updates.

Fourteen of the seventeen sources concern regional settings. Global sources S3, S15 and S16 fill gaps in opened regional syntheses or accessible clinical detail; they provide no regional effect estimate. KNOWN describes a documented measurement, action or association supported across studies. Single-study risk pathways remain UNCERTAIN; INFERRED marks interpretation or mapped risk. Guidance examples document activity, not proven protection.


## B. NEW OR UPDATED HARMS

```json
[
  {
    "id": "childdiarrhoea",
    "sys": "health",
    "status": "update",
    "label": "Child diarrhoea during heat",
    "desc": "Dhaka hospital records link heatwave days with increased diarrhoea admissions among under-5 children. The association varies by heat definition and setting.",
    "grade": "UNCERTAIN",
    "who": "Infants and children under 5; caregivers",
    "sources": [
      "S4",
      "S13"
    ],
    "debated": "A single historical hospital series does not establish a universal heat-infection pathway."
  },
  {
    "id": "youth",
    "sys": "education",
    "status": "update",
    "label": "Young people's heat protection",
    "desc": "Young adults in Yogyakarta reported heat symptoms and limited protective practices despite good knowledge. Keep this pathway separate from evidence about school-age adolescents.",
    "grade": "UNCERTAIN",
    "who": "Young adults aged 19-24 in the study; younger adolescents remain a separate evidence need",
    "sources": [
      "S5"
    ],
    "debated": "Cross-sectional self-reports; symptoms can have other causes."
  },
  {
    "id": "pregnancy",
    "sys": "health",
    "status": "update",
    "label": "Heat during working pregnancies",
    "desc": "Occupational heat exposure is associated with adverse pregnancy and birth outcomes in a Tamil Nadu cohort. Pregnancy can overlap with heavy work; postpartum outcomes need separate evidence.",
    "grade": "KNOWN",
    "who": "Pregnant workers, including those doing moderate or heavy physical work",
    "sources": [
      "S2",
      "S3"
    ],
    "debated": "Association is supported across studies; local effect sizes and safe exposure limits remain uncertain."
  },
  {
    "id": "hsys",
    "sys": "health",
    "status": "update",
    "label": "Barriers to reaching care",
    "desc": "Disabled participants in Bangladesh described barriers to travel, communication and care during heat. Older people may also need assistance.",
    "grade": "UNCERTAIN",
    "who": "People with mobility, intellectual or communication-related disabilities; older people with declining health",
    "sources": [
      "S1",
      "S6"
    ],
    "debated": "Small qualitative studies identify barriers, not their population prevalence."
  },
  {
    "id": "care",
    "sys": "society",
    "status": "update",
    "label": "Care and assisted protection",
    "desc": "Some older people rely on family help to maintain daily routines during hot weather. Caregiver availability is part of protection, alongside the needs of the person receiving care.",
    "grade": "UNCERTAIN",
    "who": "Older people needing assistance; family caregivers",
    "sources": [
      "S6"
    ],
    "debated": "Care time, caregiver heat strain and respite effectiveness were not quantified."
  },
  {
    "id": "sleepless",
    "sys": "health",
    "status": "update",
    "label": "Hot nights after migrant work",
    "desc": "Migrant workers in Singapore associated hot dormitories with poor sleep and fatigue. Night-time recovery belongs alongside workplace exposure.",
    "grade": "UNCERTAIN",
    "who": "Migrant workers in shared accommodation",
    "sources": [
      "S7"
    ],
    "debated": "Qualitative accounts do not isolate heat from crowding and other stressors."
  },
  {
    "id": "homes",
    "sys": "cities",
    "status": "update",
    "label": "Overheated or absent shelter",
    "desc": "Measurements in Bangladesh refugee shelters found sustained daytime overheating. Homeless residents face a different problem: dwelling-based cooling cannot reach someone without a dwelling.",
    "grade": "KNOWN",
    "who": "Refugees and displaced people in temporary shelters; people without secure housing",
    "sources": [
      "S9",
      "S17"
    ],
    "debated": "The camp study measured comfort conditions, not illness; the Nagpur evidence was accessible only as an abstract."
  },
  {
    "id": "detentionheat",
    "sys": "health",
    "status": "new",
    "label": "Heat in detention",
    "desc": "Detention facilities mediate access to ventilation, water and heat response. Regional institutional work recognises risk without establishing heat-specific illness rates.",
    "grade": "INFERRED",
    "who": "People in prisons or detention; facility staff",
    "sources": [
      "S12"
    ],
    "debated": "Risk mapping and facility changes are not evidence of a measured health effect."
  }
]
```

## C. LINKS

The loop field names a possible home for the evidence. It does not establish that a link closes a cycle. The supplied map gives cycle names without their full edge sequences, so whether a link completes an existing cycle was not verified. No new cycle is proposed; this run adds evidence for parts of existing cycles.

```json
[
  {
    "from": "homes",
    "to": "sleepless",
    "why": "Hot, poorly ventilated dormitories were reported to disrupt migrant workers' sleep.",
    "loop": "sleep",
    "grade": "UNCERTAIN",
    "moderators": "Ventilation, occupancy and recovery conditions",
    "lag": "days",
    "sources": [
      "S7"
    ]
  },
  {
    "from": "youth",
    "to": "sleepless",
    "why": "Young adults reported sleep disturbance among heat-associated symptoms.",
    "loop": "sleep",
    "grade": "UNCERTAIN",
    "moderators": "Other causes of disturbed sleep were not excluded.",
    "lag": "unknown",
    "sources": [
      "S5"
    ]
  },
  {
    "from": "power",
    "to": "homes",
    "why": "Participants described fans stopping during outages and worsening indoor heat.",
    "loop": "",
    "grade": "UNCERTAIN",
    "moderators": "Reliable electricity and suitable backup",
    "lag": "days",
    "sources": [
      "S1"
    ]
  },
  {
    "from": "energypoverty",
    "to": "homes",
    "why": "Unaffordable cooling and backup power limited household coping options.",
    "loop": "energypoverty",
    "grade": "UNCERTAIN",
    "moderators": "Cooling affordability and housing ventilation",
    "lag": "unknown",
    "sources": [
      "S1"
    ]
  },
  {
    "from": "care",
    "to": "hsys",
    "why": "Without family assistance, reaching medicines or services became harder during heat.",
    "loop": "protection",
    "grade": "UNCERTAIN",
    "moderators": "Accessible transport and replacement assistance",
    "lag": "days",
    "sources": [
      "S1"
    ]
  },
  {
    "from": "childdiarrhoea",
    "to": "hsys",
    "why": "The Dhaka study recorded heat-associated increases in hospital admissions.",
    "loop": "",
    "grade": "UNCERTAIN",
    "moderators": "Pathogens, sanitation and care-seeking affect the association.",
    "lag": "days",
    "sources": [
      "S4"
    ]
  },
  {
    "from": "pregnancy",
    "to": "newborns",
    "why": "Heat exposure in pregnancy is associated with adverse birth outcomes.",
    "loop": "",
    "grade": "KNOWN",
    "moderators": "Workload, exposure timing and access to care",
    "lag": "unknown",
    "sources": [
      "S2",
      "S3"
    ]
  },
  {
    "from": "camps",
    "to": "homes",
    "why": "Dense temporary shelter arrangements can constrain ventilation and heat relief.",
    "loop": "displacement",
    "grade": "INFERRED",
    "moderators": "Space, materials, ventilation and residents' design choices",
    "lag": "unknown",
    "sources": [
      "S9"
    ]
  },
  {
    "from": "homes",
    "to": "detentionheat",
    "why": "Indoor heat becomes harder to avoid when cooling depends on facility systems.",
    "loop": "",
    "grade": "INFERRED",
    "moderators": "Maintained ventilation, water and facility heat-response arrangements",
    "lag": "days",
    "sources": [
      "S12"
    ]
  }
]
```

## D. LEVERS

These are worked examples of practices or institutional activity. Their effectiveness is not established by publication or launch alone. Measurements below are proposed evaluation measures.

```json
[
  {
    "id": "maternalheat",
    "edge": [
      "pregnancy",
      "newborns"
    ],
    "title": "Connect heat protection with maternity care",
    "who": [
      "Health ministries",
      "Maternity services",
      "Community health workers"
    ],
    "when": "season",
    "measure": "Completed risk assessments, timely referrals and birth outcomes, compared across similar exposure periods",
    "text": "Build heat assessment and referral into routine maternity contacts. Guidance publication is a delivery example; its health effect remains unevaluated here.",
    "example": "India, 2026: MoHFW and UNFPA published clinical and community-worker guidance.",
    "unintended": "",
    "sources": [
      "S11"
    ]
  },
  {
    "id": "childwater",
    "edge": [
      "care",
      "hsys"
    ],
    "title": "Make child heat advice age-specific",
    "who": [
      "Primary-care services",
      "Childcare services",
      "Community health workers"
    ],
    "when": "season",
    "measure": "Caregiver recognition, age-appropriate hydration advice and time to clinical referral",
    "text": "Pair caregiver advice with access to care. Infant feeding advice differs from hydration advice for older children.",
    "example": "Bangladesh, 2024: DGHS launched national guidance incorporating UNICEF's B.E.A.T framework.",
    "unintended": "",
    "sources": [
      "S10",
      "S16"
    ]
  },
  {
    "id": "coolhousing",
    "edge": [
      "camps",
      "homes"
    ],
    "title": "Test shelter cooling with residents",
    "who": [
      "Shelter agencies",
      "Camp services",
      "Residents' groups"
    ],
    "when": "season",
    "measure": "Indoor exposure and residents' comfort before and after",
    "text": "Test shading and ventilation with residents, accounting for structural integrity and privacy.",
    "example": "Cox's Bazar, 2020 publication: researchers recorded residents' false ceilings and roof shading.",
    "unintended": "",
    "sources": [
      "S9"
    ]
  },
  {
    "id": "safeathome",
    "edge": [
      "homes",
      "detentionheat"
    ],
    "title": "Extend indoor heat planning to detention",
    "who": [
      "Detention authorities",
      "Facility engineers",
      "Health services"
    ],
    "when": "years",
    "measure": "Indoor heat exposure, maintained water and ventilation, and heat-illness surveillance",
    "text": "Include detention facilities in heat preparedness; health effects were not evaluated here.",
    "example": "Philippines, 2024: the ICRC-BJMP case study records risk mapping, staff development and ventilation upgrades.",
    "unintended": "",
    "sources": [
      "S12"
    ]
  }
]
```

## E. EVIDENCE FOR CYCLES

This evidence supports a part of an existing cycle, rather than the complete feedback mechanism.

```json
[
  {
    "loop": "sleep",
    "by": "Farwin et al., 2023",
    "title": "“My young life, finished already?”: a qualitative study of embedded social stressors and their effects on mental health of low-wage male migrant workers in Singapore",
    "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC10329802/",
    "type": "Peer-reviewed study",
    "where": "Singapore",
    "scale": "21 individual and 2 group interviews",
    "finding": "Workers associated hot dormitories with poor sleep and fatigue; this supports one part of the cycle.",
    "limit": "NGO-based recruitment; mainly Indian and Bangladeshi workers."
  }
]
```

## F. AT-RISK FACTS

Proposed group additions: children, school-age adolescents, young adults, caregivers, migrant workers, displaced people, people in detention, and people without secure housing. Existing mothers and disability tags can retain finer distinctions by life stage and support need. Postpartum women remain a separate evidence question.

TAV95 is the Dhaka study's definition: daily mean temperature above the 95th percentile for at least one day. This is not a regional warning threshold. Sample descriptions in the facts below are not population risk estimates.

```json
[
  {
    "group": "children",
    "fact": "In Dhaka, March-October 1981-2010, under-5 diarrhoea admissions increased 13.9% (95% CI: 8.3-19.9) on a TAV95 heat wave day, relative to non-heatwave days.",
    "grade": "UNCERTAIN",
    "sources": [
      "S4"
    ]
  },
  {
    "group": "youngadults",
    "fact": "The Yogyakarta survey interviewed 439 people aged 19-24 in October-November 2024; their mean heat-adaptation score was 3.9 out of 11.",
    "grade": "KNOWN",
    "sources": [
      "S5"
    ]
  },
  {
    "group": "mothers",
    "fact": "Among 800 pregnant workers in Tamil Nadu in 2017-2019 and 2021-2022, 47.3% had high occupational heat exposure.",
    "grade": "KNOWN",
    "sources": [
      "S2"
    ]
  },
  {
    "group": "disability",
    "fact": "In eight interviews across three Bangladesh locations in July-September 2025, participants described mobility barriers and reliance on family assistance during heat.",
    "grade": "KNOWN",
    "sources": [
      "S1"
    ]
  },
  {
    "group": "older",
    "fact": "In the Chiang Rai study published in 2023, 15 older persons and 15 family members described adaptive routines and challenges maintaining daily activities in extreme weather.",
    "grade": "KNOWN",
    "sources": [
      "S6"
    ]
  },
  {
    "group": "caregivers",
    "fact": "The 2023 Chiang Rai study describes family assistance, without quantifying caregiver heat illness.",
    "grade": "KNOWN",
    "sources": [
      "S6"
    ]
  },
  {
    "group": "migrantworkers",
    "fact": "In the southern India study recorded as 2016, 68 percent of 142 migrant construction workers reported productivity losses and lost wages due to heat.",
    "grade": "UNCERTAIN",
    "sources": [
      "S8"
    ]
  },
  {
    "group": "displaced",
    "fact": "In Cox's Bazar, air temperature was monitored in nine shelters for eleven days from 28 September 2018; most exceeded the comfort limit for most daylight hours.",
    "grade": "KNOWN",
    "sources": [
      "S9"
    ]
  },
  {
    "group": "detention",
    "fact": "The 2024 Philippines case study records a detention adaptation programme that includes heatwaves; it supplies no heat-specific illness rate.",
    "grade": "KNOWN",
    "sources": [
      "S12"
    ]
  }
]
```

## G. OPEN QUESTIONS

Study sizes below are illustrative proposals, not power calculations or existing samples.

```json
[
  {
    "id": "assistedaccess",
    "loop": "protection",
    "q": "Does accessible heat communication plus assisted transport improve timely care for disabled and homebound older residents?",
    "have": "Small regional studies describe access barriers and reliance on family help.",
    "could": "A phased district pilot comparing successful contacts, travel barriers and referral times before and after introduction.",
    "scale": "Proposed: about 300 households across several service areas; formal sample-size work remains open."
  },
  {
    "id": "migrantnights",
    "loop": "sleep",
    "q": "Does a feasible dormitory cooling package improve workers' sleep after hot shifts?",
    "have": "Singapore interviews connect hot accommodation with poor recovery, without isolating heat.",
    "could": "A crossover trial with indoor sensors, sleep diaries and agreed sleep measures; record workload and shift timing.",
    "scale": "Proposed: about 240 workers across several dormitories; adjust after pilot variance estimates."
  },
  {
    "id": "youngeradolescents",
    "loop": "school",
    "q": "Do reliable water access and planned breaks improve protective behaviour among school-age adolescents?",
    "have": "The opened Indonesian study enrolled 19-24-year-olds, leaving younger pupils untested by that evidence.",
    "could": "A school-level pilot comparing behaviour, symptoms and attendance, with heat exposure measured in each school.",
    "scale": "Proposed: about 12 schools; sample size set after feasibility and clustering checks."
  },
  {
    "id": "postpartum",
    "loop": "protection",
    "q": "How does indoor heat affect symptoms and care-seeking during the first weeks after birth?",
    "have": "Pregnancy evidence is stronger; the opened global threshold review excluded postnatal health.",
    "could": "A prospective cohort using household sensors, symptom diaries and clinical follow-up, with feeding and recovery support recorded.",
    "scale": "Proposed: about 250 postpartum women across contrasting housing settings; refine after feasibility work."
  },
  {
    "id": "coolrefugeaccess",
    "loop": "protection",
    "q": "Which practical barriers prevent homeless residents from using a nearby cool refuge during hot periods?",
    "have": "Regional interviews document heat challenges; comparative evidence on refuge access was not verified.",
    "could": "Observe opening hours and routes, interview users and non-users, and test a service change chosen with residents.",
    "scale": "Proposed: about 150 participants around several refuge sites; no population prevalence estimate implied."
  }
]
```

## H. SOURCES

The title and expect fields retain source spelling. A publication date is not assumed to be a fieldwork date. Access limits and review depth are stated in each record.

```json
[
  {
    "key": "S1",
    "url": "https://link.springer.com/article/10.1007/s13753-026-00778-y",
    "title": "Heatwaves as Invisible Disasters: Disability, Climate Justice, and Urban and Peri-Urban Risk Reduction in Bangladesh",
    "by": "Kibria et al.",
    "year": 2026,
    "type": "Peer-reviewed study",
    "where": "Dhaka, Rajshahi and Pabna, Bangladesh",
    "scale": "Eight interviews, July-September 2025",
    "finding": "Participants described mobility and service-access barriers during heat, and reliance on family assistance.",
    "limit": "Small qualitative sample; no statistical generalisation. Caregiver-supported communication may influence interpretation.",
    "expect": [
      "03 November 2026",
      "eight semistructured interviews",
      "caregiver-supported communication"
    ]
  },
  {
    "key": "S2",
    "url": "https://pubmed.ncbi.nlm.nih.gov/37814395/",
    "title": "Heat stress and adverse pregnancy outcome: Prospective cohort study",
    "by": "Rekha et al.",
    "year": 2024,
    "type": "Peer-reviewed study",
    "where": "Tamil Nadu, India",
    "scale": "800 pregnant workers; 2017-2019 and 2021-2022",
    "finding": "High occupational heat exposure was associated with any adverse pregnancy and foetal outcome: aOR 2.3; 95% CI 1.4-3.8.",
    "limit": "Abstract read; detailed author limitations unavailable. Outcomes include a composite, not one diagnosis. Online 2023; issue 2024.",
    "expect": [
      "800 pregnant women",
      "2017-2019 and 2021-2022",
      "aOR 2.3"
    ]
  },
  {
    "key": "S3",
    "url": "https://www.nature.com/articles/s41467-026-76822-8",
    "title": "A systematic review and meta-analysis on heat thresholds for maternal health and birth outcomes",
    "by": "Heil et al.",
    "year": 2026,
    "type": "Systematic review",
    "where": "Global, not a regional effect estimate",
    "scale": "103 studies in narrative synthesis",
    "finding": "Heat-pregnancy associations varied across exposure metrics and outcomes; postnatal health was excluded.",
    "limit": "Heterogeneity, methodological variation, no independent dual extraction and single-person quality assessment. Estimated thresholds are not universal safety limits.",
    "expect": [
      "21 August 2026",
      "103 studies",
      "postnatal health",
      "single person performing quality assessment"
    ]
  },
  {
    "key": "S4",
    "url": "https://journals.plos.org/globalpublichealth/article?id=10.1371/journal.pgph.0003629",
    "title": "Is heat wave a predictor of diarrhoea in Dhaka, Bangladesh? A time-series analysis in a South Asian tropical monsoon climate",
    "by": "Haque et al.",
    "year": 2024,
    "type": "Peer-reviewed study",
    "where": "Dhaka, Bangladesh",
    "scale": "One hospital's surveillance; March-October 1981-2010",
    "finding": "Under-5 diarrhoea hospitalisations increased 13.9% (95% CI: 8.3-19.9) on a TAV95 heat wave day.",
    "limit": "Estimated hospital counts, fewer mild cases, possible residual confounding and uncertain transfer to other settings or pathogens.",
    "expect": [
      "September 3, 2024",
      "TAV95",
      "children aged under 5",
      "residual confounding"
    ]
  },
  {
    "key": "S5",
    "url": "https://www.nature.com/articles/s41598-025-34800-y",
    "title": "Urban heat stress and adolescent health: impacts and adaptation strategies in Indonesia",
    "by": "Daniel et al.",
    "year": 2026,
    "type": "Peer-reviewed study",
    "where": "Yogyakarta, Indonesia",
    "scale": "439 participants aged 19-24; October-November 2024",
    "finding": "Mean adaptation score was 3.9 out of 11; heat knowledge was not significantly associated with adaptation practices.",
    "limit": "Cross-sectional, single location; symptoms may have other causes. Participants were 19-24, so this is not evidence about younger adolescents.",
    "expect": [
      "05 February 2026",
      "439 adolescents",
      "19 and 24 years",
      "3.9 out of 11"
    ]
  },
  {
    "key": "S6",
    "url": "https://pubmed.ncbi.nlm.nih.gov/37372754/",
    "title": "A Descriptive Qualitative Study of Older Persons and Family Experiences with Extreme Weather Conditions in Northern Thailand",
    "by": "Junlapeeya et al.",
    "year": 2023,
    "type": "Peer-reviewed study",
    "where": "Chiang Rai, Thailand",
    "scale": "15 older persons and 15 family members; three focus groups",
    "finding": "Families described strategies for maintaining routines during heat, cold and air pollution.",
    "limit": "Abstract only; detailed author limitations unavailable; multiple weather exposures.",
    "expect": [
      "15 older persons",
      "15 family members",
      "Seasonal adaptability"
    ]
  },
  {
    "key": "S7",
    "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC10329802/",
    "title": "“My young life, finished already?”: a qualitative study of embedded social stressors and their effects on mental health of low-wage male migrant workers in Singapore",
    "by": "Farwin et al.",
    "year": 2023,
    "type": "Peer-reviewed study",
    "where": "Singapore",
    "scale": "21 individual and 2 group interviews",
    "finding": "Workers associated hot, poorly ventilated dormitories with disturbed sleep and fatigue.",
    "limit": "Recruitment mainly through NGO clinics and community contacts; mainly Indian and Bangladeshi participants.",
    "expect": [
      "21 individual and 2 group interviews",
      "insomnia and chronic fatigue",
      "NGO clinics"
    ]
  },
  {
    "key": "S8",
    "url": "https://www.climatechip.org/node/203",
    "title": "The social implications of occupational heat stress on migrant workers engaged in public construction: a case study from southern India",
    "by": "Venugopal et al.",
    "year": 2016,
    "type": "Peer-reviewed study",
    "where": "Southern India",
    "scale": "142 migrant construction workers",
    "finding": "68 percent reported productivity losses and lost wages due to heat; women also described effects on family care.",
    "limit": "Author-network abstract read; detailed author limitations unavailable. Losses and illnesses are self-reported, not verified wages or diagnoses.",
    "expect": [
      "2016",
      "One hundred and forty-two",
      "68 percent",
      "inability to care"
    ]
  },
  {
    "key": "S9",
    "url": "https://link.springer.com/article/10.1007/s10901-020-09783-z",
    "title": "Analysing experiences and issues in self-built shelters in Bangladesh using transdisciplinary approach",
    "by": "Klansek et al.",
    "year": 2021,
    "type": "Peer-reviewed study",
    "where": "Cox's Bazar, Bangladesh",
    "scale": "1594 households; nine shelters monitored for eleven days, 2018",
    "finding": "Most monitored shelters exceeded daytime comfort limits; roof radiation and ventilation mattered.",
    "limit": "Air temperature omits part of radiant exposure; different methods revealed different priorities. Online 2020; issue 2021.",
    "expect": [
      "1594 households",
      "nine shelters",
      "eleven days",
      "Thermal conditions"
    ]
  },
  {
    "key": "S10",
    "url": "https://www.unicef.org/press-releases/new-guidelines-launched-protect-children-and-pregnant-women-heat-stress-bangladesh",
    "title": "New guidelines launched to protect children and pregnant women from heat stress in Bangladesh",
    "by": "UNICEF",
    "year": 2024,
    "type": "Agency report",
    "where": "Bangladesh",
    "scale": "National guidance launch, 5 May 2024",
    "finding": "DGHS launched heat-illness guidance incorporating UNICEF's B.E.A.T the Heat framework and a primary-care approach.",
    "limit": "Launch account, not an evaluation of implementation or health effects.",
    "expect": [
      "05 May 2024",
      "National Guidelines",
      "B.E.A.T"
    ]
  },
  {
    "key": "S11",
    "url": "https://india.unfpa.org/en/publications/heat-and-pregnancy-guidance-healthcare-providers-and-community-health-workers",
    "title": "Heat and Pregnancy: Guidance for Healthcare Providers and Community Health Workers",
    "by": "MoHFW and UNFPA India",
    "year": 2026,
    "type": "Agency report",
    "where": "India",
    "scale": "National guidance resource, 6 May 2026",
    "finding": "Guidance includes heat-risk assessment, referral, facility preparedness, breastfeeding and infant-care counselling.",
    "limit": "Publication summary read; guidance availability does not establish uptake or effectiveness.",
    "expect": [
      "06 May 2026",
      "heat-risk checklist",
      "breastfeeding",
      "functional referral systems"
    ]
  },
  {
    "key": "S12",
    "url": "https://www.preventionweb.net/resource/case-study/philippines-prisoners-climate-change",
    "title": "Philippines: Prisoners of climate change",
    "by": "International Committee of the Red Cross",
    "year": 2024,
    "type": "Agency report",
    "where": "Philippines",
    "scale": "ICRC-BJMP detention programme case study",
    "finding": "The programme combines climate-risk mapping, staff capacity development and facility changes including ventilation upgrades.",
    "limit": "Institutional case study; projected benefits are not measured heat-health reductions.",
    "expect": [
      "17 December 2024",
      "Bureau of Jail Management",
      "upgrading ventilation"
    ]
  },
  {
    "key": "S13",
    "url": "https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2832975",
    "title": "Air Temperature and Gastroenteritis Among Rohingya Populations in Bangladesh Refugee Camps",
    "by": "Takata et al.",
    "year": 2025,
    "type": "Peer-reviewed study",
    "where": "Kutupalong and Nayapara, Bangladesh",
    "scale": "64 445 gastrointestinal cases; two clinics, 2019-2021",
    "finding": "At high-temperature percentiles, associations differed between camps; cold-related risk was more consistent.",
    "limit": "Two clinics, no pathogen-specific data and potential selection bias, including incomplete capture of young children.",
    "expect": [
      "April 18, 2025",
      "26 °C",
      "28.3 °C",
      "selection bias"
    ]
  },
  {
    "key": "S14",
    "url": "https://journals.sagepub.com/doi/10.1177/25166026261472713",
    "title": "Managing Extreme Heat Through Indigenous Knowledge and Practices at Four Villages in Wardha, India",
    "by": "Tasgaonkar et al.",
    "year": 2026,
    "type": "Peer-reviewed study",
    "where": "Wardha, India",
    "scale": "Six focus groups; 86 participants",
    "finding": "Participants described practices involving housing, work routines and responses to heat symptoms.",
    "limit": "Restricted full text; abstract read. Data unavailable publicly for privacy. The abstract does not establish participant Indigenous identity or health effectiveness.",
    "expect": [
      "August 17, 2026",
      "86 participants",
      "six structured focus group"
    ]
  },
  {
    "key": "S15",
    "url": "https://link.springer.com/article/10.1186/s44263-025-00224-z",
    "title": "International migrant workers, heat exposure, and climate change: a systematic review of health risks and protective interventions",
    "by": "Van der Horst et al.",
    "year": 2025,
    "type": "Systematic review",
    "where": "Global; much evidence from high-income settings",
    "scale": "19 studies; 2293 migrant workers across six countries",
    "finding": "Heat-related health problems and barriers to water, rest and shade recur; intervention evaluations remain limited.",
    "limit": "English-only search, inconsistent heat definitions and many low-quality studies; associations do not confirm causation.",
    "expect": [
      "01 December 2025",
      "19 studies",
      "2293 migrant workers",
      "piece-rate payment"
    ]
  },
  {
    "key": "S16",
    "url": "https://www.unicef.org/media/139926/file/Protecting-children-from-heat-stress-A-technical-note-2023.pdf",
    "title": "Protecting Children from Heat Stress",
    "by": "UNICEF",
    "year": 2023,
    "type": "Agency report",
    "where": "Global guidance, not a regional effectiveness estimate",
    "scale": "Community, clinical and school guidance",
    "finding": "Caregiver-assisted recognition, age-specific hydration and referral are part of heat protection; breastfeeding guidance differs from advice for older children.",
    "limit": "A collation of evidence and practice intended to evolve into formal guidance; not a controlled intervention evaluation.",
    "expect": [
      "May 2023",
      "B.E.A.T.",
      "Breastfeed infants under 6 months",
      "Monitoring and assessment"
    ]
  },
  {
    "key": "S17",
    "url": "https://www.research.ed.ac.uk/en/publications/too-hot-to-handle-how-residents-in-nagpur-india-are-adapting-to-h/",
    "title": "TOO HOT TO HANDLE? How residents in Nagpur, India are adapting to high summer temperatures",
    "by": "Meshram et al.",
    "year": 2024,
    "type": "Peer-reviewed study",
    "where": "Nagpur, India",
    "scale": "Qualitative interviews; sample size not stated in accessible abstract",
    "finding": "The research examines heat-related health and livelihood challenges for homeless residents and cycle-rickshaw pullers.",
    "limit": "Peer-reviewed conference paper; abstract only. Detailed author limitations and intervention results were not accessible.",
    "expect": [
      "peer-review",
      "homeless people",
      "in-depth interviews"
    ]
  }
]
```

## I. WHAT I COULD NOT VERIFY

- **Full cycle closure.** The map's complete edge sequences were not supplied. The evidence supports selected relationships, including the housing-sleep part of sleep, rather than a demonstrated self-reinforcing cycle. No cycle rating is upgraded.
- **Younger adolescents from the Indonesian study: rejected.** Its methods specify ages 19-24. The title alone could invite a wider age interpretation. Its cross-sectional design also leaves the direction between symptoms and protective behaviour unresolved. [S5]
- **A universal refugee heat-gastroenteritis link: rejected.** The two Bangladesh camps had different high-temperature associations. Their clinic records also incompletely represented young children. The paper does not justify transferring the Dhaka under-5 estimate to all displaced populations. [S13]
- **One maternal heat threshold for everyone: rejected.** The global review describes heterogeneous metrics and methods. Its estimated thresholds are not adopted as local safety limits. Postnatal health was excluded, so its results do not establish postpartum outcomes. [S3]
- **A general Indigenous heat-tolerance claim: rejected.** The Wardha abstract documents local practices, not comparative physiological protection or participant Indigenous identity. Full text is restricted. A separate physiology review uses tropical residency terminology; that is not evidence about Indigenous identity or immunity to heat. [S14]
- **People without secure housing: retained as a distinct group, with thin outcome evidence.** The Nagpur conference record confirms relevant research, but its abstract supplies limited detail. The Delhi report Surviving Heat on the Streets was located through its publishers; its PDF exceeded the reading service's size limit, so its numerical findings were excluded. [S17]
- **Employment formality: not inferred from migration.** The southern India abstract does not establish participants' formal employment status. Two candidate links from informal work were removed on that basis. [S8]
- **Caregiver exhaustion and unpaid-work losses: not added as quantified harms.** The opened regional evidence describes family assistance and disruptions in care. It does not establish caregiver-specific heat illness rates, time losses or the effectiveness of respite. [S6, S8]
- **Detention mortality and programme effectiveness: unverified.** The ICRC case study supports inclusion of the setting and documents an initiative. It does not verify heat-specific deaths or a measured reduction in harm. The original regional programme blog returned a gone response; a preserved ICRC account on PreventionWeb remained readable. [S12]
- **Regional postpartum effects: unresolved.** India guidance includes breastfeeding and infant-care counselling, but that is different from a measured postpartum heat-outcome study. No postpartum effect size is supplied. [S11]
- **Detailed author limitations behind abstracts: unavailable.** S2, S6, S8 and S17 were read through abstracts or repository summaries. Their records identify this review depth; no unseen methods or limitations were reconstructed. The older-person study also combines heat with cold and air pollution.
- **Other inaccessible leads.** A Nepal study of household cooking heat returned a publisher access error. Some child-health review pages returned reading challenges. They contributed no claims or numbers.
- **Group coverage remains uneven.** No Indigenous-specific or remote-community heat effect size was verified for this run. Disability findings do not represent every impairment or support need. Neither gap is evidence that relevant knowledge or protective practice is absent.

The next agreed lens is 3, slow and hidden harms, followed by 2, 5, 4 and 6. It can retain these group distinctions while testing longer-term outcomes.

