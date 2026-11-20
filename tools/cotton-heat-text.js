// Heat from field to factory (/cotton-and-heat/): the words the page and llms-full.txt share.
// Cotton in Asia is the first worked example of heat across an agricultural value chain. Passages that state a finding
// name the claims they rest on: research/2026-11/cotton-heat/claims.json, plus occupational guidance reused from
// research/2026-11/factory-heat/claims.json. The builder keeps only claims the GitHub source check confirmed.
// Illustrative situations carry no names, places or numbers. The structure (STAGES, ARRANGEMENTS, RECORDS) is meant to be
// reused for other value chains; only cotton is published.
"use strict";

const SLUG = "cotton-and-heat";
const TITLE = "Heat from field to factory";
const SUB = "Cotton, informal work and the conditions that make protection possible.";
const DESC = "Where heat meets the people who grow, pick, move and process cotton in Asia, how it affects workers, crops and livelihoods by different routes, why some workers have fewer ways to protect themselves, and which arrangements make protection usable: an interactive cotton journey, an intervention library with who acts and who pays, an explorer, and the evidence with its limits.";
const QUESTION = "What would have to change for the person doing this work to stay safe without losing the income, security or support they depend on?";

const OPEN = {
  p1: "Before cotton becomes fabric, people prepare fields, tend plants, pick cotton, carry loads, move bales and operate machinery. Heat meets them in different places and under different working arrangements.",
  p2: "A worker's exposure depends on the weather and the task. Their ability to protect themselves also depends on pay, water, rest, transport, care responsibilities and who controls the working day.",
  note: "The cotton journey below is an illustrative value-chain map, not a traceability record for any garment, brand or company. Real chains branch, skip stages and cross borders."
};

// evidence kinds, as the page distinguishes them
const KIND = {
  guide: "Occupational guidance",
  research: "Research finding",
  programme: "Programme description",
  testimony: "Worker testimony, as reported",
  news: "News report",
  proposal: "Proposal requiring validation"
};
const KIND_NOTE = {
  guide: "What agencies recommend. Where it sets duties, they apply only in the jurisdiction named.",
  research: "A study with a stated design, population and place. The finding holds for those conditions.",
  programme: "What a programme says it did. Training delivered is not proof that illness fell.",
  testimony: "What a worker said, as reported. It shows an experience, not how common it is.",
  news: "A journalist's report. Useful for timing and context; not a measurement.",
  proposal: "A candidate arrangement with no checked source on this page. Described so it can be appraised."
};

// the chain, stage by stage. views: work (Work and exposure), pay (Pay and protection), act (Who can act)
const STAGES = [
  { id: "field", letter: "A", t: "Field preparation, planting and crop care", short: "Field work", depth: "deep",
    work: "Preparing land, sowing, thinning, weeding, irrigating, applying fertiliser and pesticides, and carrying water, inputs and equipment.",
    who: "Smallholder families including unpaid family members, tenant farmers and sharecroppers, and daily-wage workers hired for weeding and spraying. In a 2025 assessment of women cotton farmers in Sindh, nearly all sowed by hand and most weeded, while few operated irrigation or sprayed.",
    whoClaims: ["c-bcw-tasks"],
    exposure: "Hours in open fields with little shade, bending and lifting, and protective clothing for spraying that holds in heat. In Indian Punjab, sowing falls in April and May; in Sindh, planting can begin in March, so early field work can meet hot weather.",
    exposureClaims: ["c-ilo-haz", "c-icar-window", "c-gain-sindh", "c-cc-ppe"],
    barriers: "No shade or water point at the field; long walks home; household water collection on top of farm work; no labour-law or social-protection coverage for many small farmers.",
    barrierClaims: ["c-ilo-gaps", "c-ilo-women"],
    change: "A shared water point and shade near the field; work moved to cooler hours by agreement; spraying planned for cooler, calm periods with suitable protection; help with water collection at home in the hottest weeks.",
    control: "The farmer or landholder sets the day for family and hired workers; landlords shape tenants' choices; extension services, farmer groups and programmes can supply water points and training; local government shapes water supply.",
    evidence: ["c-ilo-train", "c-ilo-water"],
    uncertain: "No checked study measures heat strain or illness among cotton field workers in Asia on this page, or the effect of shade or water points in cotton fields." },
  { id: "harvest", letter: "B", t: "Harvesting and collection", short: "Picking", depth: "deep",
    work: "Hand-picking open bolls, often over several rounds; carrying picked cotton in cloth bundles; collecting and weighing it at the edge of the field.",
    who: "Mostly women in hand-picked cotton in Pakistan, according to reports; family members; daily-wage and piece-rate pickers; seasonal and migrant pickers recruited through contractors.",
    whoClaims: ["c-reuters-pay", "c-ilo-women"],
    exposure: "Long days bent among plants in sun; carrying growing bundles; pesticide residues on plants. When picking falls depends on the place and the year: where sowing starts early, as in Sindh from March, picking can start while the weather is still hot.",
    exposureClaims: ["c-gain-sindh", "c-bakhsh"],
    barriers: "Pay by weight means a break costs money; weighing points set the rhythm of the day; clinics may be far away; few pickers wear protective gear, and many report health effects during the picking season.",
    barrierClaims: ["c-reuters-pay", "c-yasin", "c-bakhsh"],
    change: "A paid or protected cooling break that does not cut earnings; water and shade at weighing points; shorter carrying distances to collection points; first aid and transport to a clinic.",
    control: "The grower or contractor who sets the rate and the weighing schedule; buyers and programmes whose prices and standards shape what growers can afford; health services for referral.",
    evidence: ["c-yasin", "c-bakhsh"],
    uncertain: "Checked studies here measure pesticide-related health costs, not heat strain; the share of pickers paid by weight and its effect on rest are not measured on this page." },
  { id: "yard", letter: "C", t: "Aggregation, weighing, storage and transport", short: "Yards and transport", depth: "deep",
    work: "Bringing seed cotton to traders, market yards, procurement centres and gins; loading and unloading trucks and trolleys; waiting to be weighed and paid; storing heaps and modules.",
    who: "Farmers waiting with their crop; casual loaders and unloaders; truck and tractor drivers; traders' and yard workers.",
    whoClaims: [],
    exposure: "Waiting in exposed yards and queues, sometimes for long periods, and heavy loading in the sun. In 2018 Pakistan was reported to have 1,200 ginneries, each fed with seed cotton brought from farms by road.",
    exposureClaims: ["c-gain-sector"],
    barriers: "Losing a place in the queue to seek shade; payment that depends on being present; loaders paid per load; no toilets or water in the yard.",
    barrierClaims: [],
    change: "Shaded waiting and loading areas; appointment or token systems that shorten exposed queues; water and toilets in yards; handling aids for loading.",
    control: "Yard and market operators, procurement agencies and gin owners; transport contractors; local authorities that run market yards.",
    evidence: [],
    uncertain: "No checked source on this page describes heat in cotton market yards or tests appointment systems; this stage is described from how the work is organised and needs local assessment." },
  { id: "gin", letter: "D", t: "Ginning and baling", short: "Ginning", depth: "deep",
    work: "Separating cotton fibre (lint) from seed, cleaning out foreign material, and pressing lint into bales. Cottonseed is a coproduct, sold for crushing into oil and other uses, not simply waste.",
    whoClaims: ["c-ers-gin", "c-gain-sector"],
    who: "Gin operators, feeders, press and bale workers, maintenance staff, and seasonal workers hired for the ginning season, many on short or informal terms.",
    exposure: "Heat from machinery, motors and the building, cotton dust, noise and moving machinery, and heavy bale handling. Loose cotton fibre can smoulder if ignited, which shapes what cooling is safe.",
    exposureClaims: ["c-dube", "c-hughs"],
    barriers: "Seasonal workers may fear losing the next shift if they report symptoms; dust and fire risks limit simple fixes such as fans or water sprays around lint.",
    barrierClaims: [],
    change: "Engineered ventilation and dust control designed together; heat-source controls on motors and dryers; roof and building measures; water, toilets and a cool recovery area; machine guarding for handling aids; non-punitive symptom reporting.",
    control: "Gin owners and managers; equipment suppliers and engineers; fire and factory inspectorates where they apply; buyers who set delivery schedules.",
    evidence: ["c-dube", "c-hughs"],
    uncertain: "No checked study here measures heat in Asian cotton gins; the respiratory study and the fire testing describe other hazards that cooling choices have to respect." },
  { id: "spin", letter: "E", t: "Spinning", short: "Spinning", depth: "brief",
    work: "Turning cotton fibre into yarn in large machine halls.",
    who: "Machine operators, often working continuous shifts.",
    exposure: "Heat from running machines and the building; air conditions in some mills are controlled for the yarn as well as for people.",
    barriers: "Shift patterns and production targets; see the indoor controls on the factory page.",
    change: "Indoor heat controls: ventilation, heat-source reduction, water, rest and fair targets.",
    control: "Mill owners and managers, with worker representatives.",
    evidence: [], uncertain: "Covered in more depth on Heat inside factories.",
    factory: ["/factory-heat/#other-factories", "Spinning and weaving on Heat inside factories"] },
  { id: "fabric", letter: "F", t: "Weaving or knitting, and wet processing", short: "Fabric and dyeing", depth: "brief",
    work: "Making fabric from yarn by weaving or knitting; dyeing, printing and finishing, which can happen to fibre, yarn, fabric or finished garments.",
    who: "Loom and knitting operators; dye-house and finishing workers.",
    exposure: "Hot water, steam and wet floors in dyeing and finishing; heat from looms and knitting machines.",
    barriers: "Chemical hazards that need protective equipment, which adds heat.",
    change: "Steam and moisture control at source, protective equipment chosen for heat as well as chemicals.",
    control: "Mill and dye-house owners and managers, with worker representatives.",
    evidence: [], uncertain: "Covered in more depth on Heat inside factories.",
    factory: ["/factory-heat/#other-factories", "Dyeing and wet processing on Heat inside factories"] },
  { id: "garment", letter: "G", t: "Garment manufacturing", short: "Garments", depth: "brief",
    work: "Cutting, sewing, pressing, finishing and packing garments.",
    who: "Sewing operators, most of them women in many producing countries, pressers, finishers and packers.",
    exposure: "Roof heat, pressing steam, crowded lines and heavy packing.",
    barriers: "Line targets, piece rates and attendance bonuses that make breaks costly.",
    change: "See the garment-factory walkthrough and intervention library.",
    control: "Factory managers, worker representatives and buyers.",
    evidence: [], uncertain: "Covered in depth on Heat inside factories.",
    factory: ["/factory-heat/#explore", "Walk through a garment factory"] }
];
const CHAIN_NOTES = {
  items: [
    "Ginning separates cotton lint from seed; the seed is a coproduct with its own markets.",
    "Spinning turns fibre into yarn. Yarn becomes fabric through weaving or knitting.",
    "Dyeing and finishing can happen at several points: to fibre, yarn, fabric or finished garments.",
    "Production can cross borders: fibre, yarn and fabric are traded, so no single country need host every stage.",
    "Actual chains branch and vary. This map shows typical stages, not a route any particular product took."
  ],
  claims: ["c-ers-gin", "c-gain-sector", "c-ers-mech"]
};

// three pathways, kept apart
const PATHWAYS = [
  { id: "people", t: "Heat affecting people", d: "The same seven parts set a cotton worker's heat load as a factory worker's: air temperature, sun and radiant heat, humidity, air movement, the heat bodies make at work, clothing and protective equipment, and how long exposure lasts and whether people recover overnight.",
    link: ["/factory-heat/#understand", "The seven parts, explained on Heat inside factories"],
    documented: { text: "Women cotton pickers in Pakistani Punjab report health effects during the picking season that researchers relate mainly to pesticide exposure, alongside dust and sun.", claims: ["c-bakhsh"] },
    plausible: "Long picking days in hot weather, paid by weight, with little shade or water, add up to heat strain; this page found no checked study measuring it in cotton fields in Asia." },
  { id: "crop", t: "Heat affecting cotton", d: "Heat acts on the plant through its own routes: establishment, flowering, boll development, water demand, yield and fibre quality. Drought, rain and pests act alongside it, and the effects differ by cultivar, growth stage, irrigation and place.",
    documented: { text: "In a controlled-environment study, heat during flowering cut pollen germination by 71% and lint yield by 26% on average, and cultivars differed. Indian agronomists describe 27 to 32 °C as favourable for reproductive development, and rain at harvest damages fibre.", claims: ["c-bista", "c-icar-window", "c-icar-rain"] },
    plausible: "Field effects depend on how heat combines with water stress and timing; a growth-chamber result does not give a field yield loss for any district." },
  { id: "livelihood", t: "Disruption affecting livelihoods and working conditions", d: "Lost working time, medical costs, interrupted production, payment delays and contractual pressure can pass through households and firms, and the routes are not the same for everyone.",
    documented: { text: "Health costs of cotton picking fall on women pickers' households, and distance from hospital adds to them; in Sindh, women's days are split between cotton work and unpaid care.", claims: ["c-yasin", "c-bcw-time"] },
    plausible: "A bad season can mean less paid picking work, more debt for tenant farmers and pressure to work through symptoms; the size and direction of these effects need local evidence." }
];
const NOT_CLAIMED = [
  "That every crop loss causes the same effect on wages or prices.",
  "That every hotter season brings more pests.",
  "That higher cotton prices necessarily reach workers.",
  "That protecting crop yields protects workers.",
  "That a farm weather forecast measures any individual's exposure at work."
];

// informal work, distinguished
const ARRANGEMENTS = [
  { id: "owner", t: "Smallholder owner-operators", d: "Farm their own land with family labour; carry crop risk and their own heat exposure; often outside labour law as self-employed.", actors: ["The household", "Farmer groups and extension services", "Input and credit providers"] },
  { id: "tenant", t: "Tenant farmers and sharecroppers", d: "Farm land they do not own, paying rent or sharing the crop; carry crop risk and often debt; decisions depend partly on the landholder.", actors: ["Landholders", "Lenders", "Local government and tenancy rules"] },
  { id: "family", t: "Unpaid contributing family workers", d: "Work on the family farm without a wage of their own; often women and young people; their hours rarely appear in records.", actors: ["The household", "Programmes reaching women and young people"] },
  { id: "daily", t: "Daily-wage agricultural workers", d: "Hired by the day for weeding, spraying or picking; paid only for days worked.", actors: ["The grower who hires", "Labour departments where farm work is covered"] },
  { id: "piece", t: "Piece-rate harvest workers", d: "Paid by the weight or amount picked; a break or a slower pace costs money directly.", actors: ["The grower or contractor setting the rate", "Buyers whose prices shape rates"] },
  { id: "seasonal", t: "Seasonal and migrant workers", d: "Move for the season; may lack local documents, housing, health access and benefits where they work.", actors: ["Recruiters and employers", "Local health services", "Social-protection agencies at origin and destination"] },
  { id: "contractor", t: "Contractor-recruited workers", d: "Recruited and often paid through a labour contractor; responsibility is split between the contractor and the farm or gin.", actors: ["The contractor", "The farm or gin using the workers", "Buyers further up the chain"] },
  { id: "casual", t: "Casual loaders, drivers and warehouse workers", d: "Paid per load, trip or day in yards, transport and storage.", actors: ["Yard operators and traders", "Transport contractors"] },
  { id: "inside", t: "Informally employed workers inside registered enterprises", d: "Work in a registered gin, mill or factory without a written contract, benefits or job security.", actors: ["The enterprise", "Labour inspectorates", "Buyers' supplier codes"] }
];
const INFORMAL_NOTE = "Informal does not mean unskilled, unimportant or outside formal supply chains. Pickers, loaders and gin workers carry skills and knowledge of the work and the weather, and informal work happens inside chains that end in registered firms and export contracts. The farmers trained in Madhya Pradesh were described as lacking coverage under labour legislation and social protection.";
const INFORMAL_CLAIMS = ["c-ilo-gaps"];

// who can actually stop? four illustrative situations
const STOP = {
  h: "Who can actually stop?",
  label: "Illustrative situations, not cases",
  rows: [
    { id: "picker", t: "A picker paid by weight takes a cooling break", exposure: "Hours bent in the sun, carrying a growing bundle.", constraint: "Every minute resting is cotton not picked and money not earned.", arrangement: "A paid break or a rate that does not penalise necessary rest; water and shade at the weighing point.", actor: "The grower or contractor who sets the rate and the schedule; buyers whose prices make it affordable." },
    { id: "loader", t: "A casual loader waits in an exposed procurement yard", exposure: "Waiting and loading in an open yard in the afternoon.", constraint: "Leaving the queue for shade risks losing the next load.", arrangement: "Shaded waiting areas and a token or appointment system that keeps people's place.", actor: "The yard operator or procurement agency." },
    { id: "tenant", t: "A tenant farmer faces both crop risk and repayment obligations", exposure: "Field work in the heat at sowing and picking.", constraint: "A poor crop still leaves rent or loan payments due, so cutting work hours feels impossible.", arrangement: "Repayment terms that flex in a bad season, crop insurance that pays reliably, and work-hour changes that do not risk the crop.", actor: "Landholders, lenders and insurers; agricultural agencies." },
    { id: "gin", t: "A seasonal gin worker fears losing the next shift after reporting symptoms", exposure: "Heat, dust and heavy lifting inside a gin.", constraint: "Reporting dizziness may mean not being called back.", arrangement: "Non-punitive reporting, paid recovery time and a written commitment that reporting does not affect rehiring.", actor: "The gin owner and manager; buyers and inspectors who check whether reporting is safe." }
  ]
};

// women and intersecting inequalities, with the design question
const EQUITY = {
  intro: "Gender runs through every stage above, along with age, disability, migration, language, caste and ethnicity. These shape tasks, pay, access to toilets and clinics, and whose voice counts. They are not reasons to treat any group as uniformly vulnerable.",
  question: "Does this protection expand someone's choices, or transfer more unpaid work, cost or risk to someone else?",
  items: [
    { t: "Tasks and control over earnings", d: "In the Sindh assessment, women did most of the hand sowing, weeding and picking, and few operated irrigation, sprayed or sold cotton, which shapes who controls the income.", claims: ["c-bcw-tasks"] },
    { t: "Unpaid care and water collection", d: "Women's waking hours were split almost evenly between cotton work and unpaid domestic and care work, and in Madhya Pradesh a participant described fetching water becoming harder in summer as supplies fell.", claims: ["c-bcw-time", "c-ilo-women"] },
    { t: "Water, toilets and menstrual hygiene", d: "Drinking water helps only if a safe, private toilet is within reach; the Madhya Pradesh workshops reported inadequate drinking water, sanitation and washing areas. This page found no checked study of menstrual hygiene in cotton fields.", claims: ["c-ilo-gaps"] },
    { t: "Pregnancy and breastfeeding", d: "Precautionary occupational guidance and accommodation, not exclusion from work, apply in fields as in factories; India's health ministry has published guidance on heat and pregnancy for health workers.", claims: ["c-mohfw", "c-cc-pregnancy"], link: ["/factory-heat/#women-pregnancy", "Pregnancy at work, on Heat inside factories"] },
    { t: "Transport and shift timing", d: "Moving work to cooler hours can mean travel in the dark; safe transport is part of the arrangement, not an afterthought." },
    { t: "Documents, benefits and grievance routes", d: "Seasonal and migrant workers may lack local identity documents, benefits and health access; a grievance route is only useful if it is reachable and safe.", link: ["/social-protection/", "Who could help a household through a hot season"] },
    { t: "Expertise and organisation", d: "Workers and farmers know where heat collects and how the season runs. In Madhya Pradesh, the absence of farmers' associations limited collective dialogue on safety and welfare.", claims: ["c-ilo-org"] }
  ]
};

// Asian context, without false uniformity
const ASIA = {
  intro: "Examples start in India and Pakistan, where the evidence on this page is strongest. Other places appear only where a checked source supports them.",
  rows: [
    { t: "Seasonal calendars differ", d: "In Indian Punjab, sowing falls in April to mid-May; in Sindh, planting can begin in March. Picking times vary by place and year and are not given here from a checked source. Exposure at planting, crop care and harvest has to be read against the local calendar, not assumed.", claims: ["c-icar-window", "c-gain-sindh"] },
    { t: "Rainfed and irrigated", d: "Most of India's cotton is rainfed, which ties yields closely to the monsoon; irrigated systems face other limits, including groundwater.", claims: ["c-icar-window"] },
    { t: "Manual and mechanised harvest", d: "Cotton is picked by hand in the settings described here; in the United States it is machine-harvested. Where machines replace hand-picking, heat exposure shifts to fewer workers and to machine operation and maintenance, and work is lost.", claims: ["c-reuters-pay", "c-ers-mech"] },
    { t: "Smallholders and larger operations", d: "Small and marginal farmers often lack the shade, water and money that larger operations can provide, and are often outside labour-law coverage themselves.", claims: ["c-ilo-gaps"] },
    { t: "Recruitment, payment and protection", d: "Payment by weight, contractor recruitment and limited social protection change who can stop work; they differ by place and need local checking." }
  ],
  caution: "Countries important in garment manufacturing are not treated here as cotton-growing settings. Where this page has no checked source for a place, it says nothing about it."
};

// the intervention library
const FAMILIES = [
  { id: "field", t: "Field and task controls", d: "Shade, water, lighter loads, rest and adjustment, where the work happens." },
  { id: "pay", t: "Pay and working arrangements", d: "So that people can use protection without losing income or standing." },
  { id: "crop", t: "Crop and water management", d: "Measures that protect the crop. Their benefits to workers are not assumed." },
  { id: "yard", t: "Yards, transport and ginning", d: "Waiting, loading and processing, designed with dust, machinery and fire in mind." },
  { id: "health", t: "Health and public systems", d: "Warnings linked to action, first aid, clinics and social protection." },
  { id: "buyers", t: "Buyers, finance and governance", d: "Institutional measures: who schedules, who pays and who checks." }
];
const R = o => o;
const RECORDS = [
  R({ id: "f-shade", fam: "field", t: "Shade and cooler recovery spaces near the work", stages: ["field", "harvest"], how: "Portable or fixed shade close to where people work lets them cool during breaks without a long walk.", who: "Pickers, weeders and family workers.", actor: "Grower or landholder; farmer groups; programmes.", pays: "Grower, often with programme or buyer support.", recurring: "Moving, repairing and replacing shade through the season.", needs: "Shade within a short walk; time to use it.", harms: "A shade far away goes unused; shade without paid time protects only those who can afford to stop.", ev: [{ k: "guide", claims: ["c-cc-rest"] }, { k: "research", claims: ["c-sawmill"], note: "A cooling station lowered heat strain in a pilot field trial in an indoor sawmill, not a cotton field." }] }),
  R({ id: "f-water", fam: "field", t: "Safe drinking water, replenishment and sanitation", stages: ["field", "harvest", "yard", "gin"], how: "Water close by, kept cool and refilled, with a safe private toilet nearby, replaces sweat losses; people drink less when toilets are far or unsafe.", who: "Everyone working in heat, especially women.", actor: "Grower, yard operator or gin owner; local government for supply.", pays: "The employer or site operator; buyers and programmes can share costs.", recurring: "Refilling, cleaning, testing and supplies, every day of the season.", needs: "A water source; someone responsible for refilling.", harms: "Water without toilets shifts the burden to women; one intake schedule does not fit everyone.", ev: [{ k: "programme", claims: ["c-ilo-water", "c-ilo-gaps"] }, { k: "guide", claims: ["c-cc-water"] }] }),
  R({ id: "f-carry", fam: "field", t: "Shorter carrying distances, handling aids and task redesign", stages: ["field", "harvest", "yard"], how: "Collection points closer to pickers, carts and changed loads reduce the heat the body makes from carrying.", who: "Pickers, carriers and loaders.", actor: "Grower, contractor, yard operator.", pays: "Grower or operator.", recurring: "Maintenance of carts; staffing of collection points.", needs: "Paths and equipment suited to the field.", harms: "Mechanisation can remove jobs or bring machine hazards.", ev: [{ k: "programme", claims: ["c-ilo-haz", "c-ilo-train"], note: "The programme trained safe postures for carrying loads." }, { k: "guide", claims: ["c-cc-source"] }] }),
  R({ id: "f-rest", fam: "field", t: "Staffing and work-rest arrangements", stages: ["field", "harvest", "gin"], how: "Enough people to share the work and rest planned around the heat and the workload, with strenuous work moved to cooler times.", who: "All workers, especially in the heaviest tasks.", actor: "Grower, contractor or gin manager.", pays: "Employer, reflected in prices.", recurring: "Wages for extra staff.", needs: "Agreement on how rest is triggered.", harms: "Rest that is unpaid is rarely taken by those paid by weight.", ev: [{ k: "guide", claims: ["c-cc-resched"] }, { k: "programme", claims: ["c-ilo-train"], note: "The programme trained farmers on adapting working hours during extreme heat." }] }),
  R({ id: "f-accl", fam: "field", t: "Gradual acclimatisation for new and returning workers", stages: ["field", "harvest", "gin"], how: "Building up time in heat over several days lets the body adapt; newcomers and returners are at higher risk.", who: "Seasonal and migrant workers, new recruits, people back from illness.", actor: "Grower, contractor or gin manager.", pays: "Employer.", recurring: "Lower output in the first days.", needs: "Knowing who is new.", harms: "Production pressure on new arrivals.", ev: [{ k: "guide", claims: ["c-niosh-accl"] }] }),
  R({ id: "f-transport", fam: "field", t: "Safe transport and worker-informed scheduling", stages: ["field", "harvest", "yard", "gin"], how: "Changing hours with workers' input, and arranging safe transport for early or late shifts, makes cooler-hour working possible.", who: "Women, workers with care duties, migrants.", actor: "Grower, contractor, local transport services.", pays: "Employer or programme.", recurring: "Transport costs.", needs: "Consultation before hours change.", harms: "Earlier starts can mean travel in the dark and conflict with childcare.", ev: [{ k: "programme", claims: ["c-ilo-gaps"], note: "Safe transport was among the gaps the workshops raised." }] }),
  R({ id: "p-paidbreak", fam: "pay", t: "Paid cooling breaks and protection against retaliation", stages: ["harvest", "yard", "gin", "field"], how: "Breaks that are paid, and a promise that resting or reporting symptoms will not cost work, make protection usable.", who: "Daily-wage, piece-rate and seasonal workers.", actor: "Grower, contractor, gin owner; buyers through prices.", pays: "Employer, with buyer pricing.", recurring: "Paid time.", needs: "Written terms, communicated and kept.", harms: "Informal pressure can undo written rules.", ev: [{ k: "research", claims: ["c-yeasmin"], note: "In garment factories, quota pressure restricted drinking water: the same logic applies to pay by output in fields." }, { k: "proposal", claims: ["c-hio-fm"], note: "A right to stop work without loss of income is proposed in apparel research, not evaluated." }] }),
  R({ id: "p-piece", fam: "pay", t: "Piece rates that do not penalise necessary rest", stages: ["harvest"], how: "A guaranteed minimum, a rate adjusted for hot days, or paid rest time stops pay by weight from punishing breaks.", who: "Piece-rate pickers.", actor: "Grower or contractor; buyers and standards that shape rates.", pays: "Grower, supported by buyer prices.", recurring: "Higher labour cost on hot days.", needs: "Records of weights and hours.", harms: "If growers cannot afford it, work may shift to fewer or less protected workers.", ev: [{ k: "news", claims: ["c-reuters-pay"], note: "Shows payment by weight; the alternative arrangements are untested here." }] }),
  R({ id: "p-targets", fam: "pay", t: "Realistic workloads and revised targets in heat", stages: ["harvest", "gin", "yard"], how: "Lower targets or quotas on hot days, agreed in advance, leave time to drink and rest.", who: "Workers on targets or quotas.", actor: "Employer and buyer.", pays: "Shared through prices and schedules.", recurring: "Lower output on hot days.", needs: "Agreed triggers.", harms: "Targets cut without pay protection reduce earnings.", ev: [] }),
  R({ id: "p-roles", fam: "pay", t: "Clear responsibilities across farmers, contractors and buyers", stages: ["field", "harvest", "yard", "gin"], how: "Writing down who provides water, shade, breaks and first aid where a contractor, a farmer and a buyer all play a part closes gaps where everyone assumes someone else is responsible.", who: "Contractor-recruited and seasonal workers.", actor: "Buyers, contractors, growers.", pays: "Agreed among them.", recurring: "Monitoring.", needs: "Contracts that reach beyond the first supplier.", harms: "Costs pushed to the smallest party.", ev: [] }),
  R({ id: "p-income", fam: "pay", t: "Sick leave or income support where it exists", stages: ["field", "harvest", "yard", "gin"], how: "Income support when heat illness or extreme heat stops work removes the reason to work through symptoms.", who: "Workers without paid sick leave.", actor: "Government social-protection agencies; employers where schemes exist.", pays: "Public schemes, employers, insurers.", recurring: "Benefit payments.", needs: "Coverage that reaches informal and migrant workers.", harms: "Schemes that require documents many workers lack.", ev: [{ k: "programme", claims: ["c-ilo-gaps"], note: "Small cotton farmers were described as lacking social-protection coverage." }], link: ["/social-protection/", "Social protection that could help in a hot season"] }),
  R({ id: "p-voice", fam: "pay", t: "Worker representation, reporting and grievance routes", stages: ["field", "harvest", "yard", "gin"], how: "Associations and safe reporting routes let workers raise heat problems and negotiate fixes.", who: "All workers, especially informal ones.", actor: "Workers' and farmers' organisations; employers; buyers.", pays: "Time and facilitation from employers and programmes.", recurring: "Meetings in paid time.", needs: "Freedom to organise without retaliation.", harms: "Token committees.", ev: [{ k: "programme", claims: ["c-ilo-org"] }] }),
  R({ id: "c-varieties", fam: "crop", t: "Locally appropriate varieties and sowing dates", stages: ["field"], how: "Choosing varieties and sowing windows suited to local heat and rainfall can reduce crop losses.", who: "The crop, and the farmers whose income depends on it.", actor: "Farmers, seed agencies, extension services.", pays: "Farmers and public research.", recurring: "Seed costs; advice.", needs: "Local trials and advice.", harms: "A crop benefit; it does not by itself change working conditions, and earlier sowing can move field work into hotter weeks.", ev: [{ k: "research", claims: ["c-bista", "c-icar-window"], note: "Shows cultivars differ under heat and that sowing windows matter; not a field trial of a package." }] }),
  R({ id: "c-water", fam: "crop", t: "Soil-moisture management and efficient irrigation where suitable", stages: ["field"], how: "Keeping water in the soil and irrigating efficiently can help the crop through heat and dry spells.", who: "The crop and farmers.", actor: "Farmers, irrigation agencies.", pays: "Farmers and public schemes.", recurring: "Energy, maintenance, water.", needs: "Water rights and energy.", harms: "Groundwater depletion and energy costs; more irrigation work can add field hours in heat.", ev: [], link: ["/actions/#soilwater", "Keep water in the soil, on the actions page"] }),
  R({ id: "c-advisory", fam: "crop", t: "Weather and agricultural advisories", stages: ["field", "harvest"], how: "Forecasts and advice help plan sowing, spraying and picking around heat and rain.", who: "Farmers and, if shared, workers.", actor: "Meteorological and agricultural agencies; extension services.", pays: "Public services.", recurring: "Running the service.", needs: "Advice that reaches workers as well as farm owners.", harms: "A farm forecast does not measure a worker's exposure.", ev: [] }),
  R({ id: "c-ipm", fam: "crop", t: "Integrated pest management", stages: ["field", "harvest"], how: "Reducing reliance on pesticides lowers residues pickers meet and the time spent spraying in protective gear.", who: "Sprayers and pickers.", actor: "Farmers, extension services, programmes.", pays: "Farmers, programmes.", recurring: "Monitoring and advice.", needs: "Training and support.", harms: "Not a heat measure in itself; it does not assume hotter seasons bring more pests.", ev: [{ k: "research", claims: ["c-bakhsh", "c-yasin"], note: "These studies measure pesticide-related health effects among pickers; they did not test IPM." }] }),
  R({ id: "c-diversify", fam: "crop", t: "Diversification where economically and agronomically feasible", stages: ["field"], how: "Other crops or incomes can spread risk when cotton fails.", who: "Farm households.", actor: "Farmers, agencies, markets.", pays: "Farmers, public support.", recurring: "Market access.", needs: "Markets and advice.", harms: "Can reduce paid picking work for labourers.", ev: [] }),
  R({ id: "g-yardshade", fam: "yard", t: "Shaded waiting and loading areas", stages: ["yard", "gin"], how: "Shade where people queue and load cuts sun exposure during waits and heavy work.", who: "Farmers, loaders, drivers.", actor: "Yard operators, procurement agencies, gin owners.", pays: "Operators, possibly with public support.", recurring: "Maintenance.", needs: "Space and structures.", harms: "Shade without a kept place in the queue goes unused.", ev: [{ k: "guide", claims: ["c-cc-rest"] }] }),
  R({ id: "g-appoint", fam: "yard", t: "Appointment or token systems that shorten exposed queues", stages: ["yard", "gin"], how: "Booked slots or tokens let people wait elsewhere without losing their place.", who: "Farmers, drivers, loaders.", actor: "Yard operators, procurement agencies.", pays: "Operators.", recurring: "Running the system.", needs: "A way to communicate slots, including to people without smartphones.", harms: "Digital-only systems exclude some farmers.", ev: [] }),
  R({ id: "g-mech", fam: "yard", t: "Mechanical handling with machine-safety safeguards", stages: ["yard", "gin"], how: "Conveyors, lifts and carts reduce lifting, if guarded and maintained.", who: "Loaders and gin workers.", actor: "Gin owners, yard operators.", pays: "Owners.", recurring: "Maintenance.", needs: "Guarding and training.", harms: "Machine injuries; fewer jobs.", ev: [{ k: "guide", claims: ["c-cc-source", "c-osha-eng"] }] }),
  R({ id: "g-roof", fam: "yard", t: "Roof and building measures appropriate to the facility", stages: ["gin", "yard"], how: "Reflective or insulated roofs and shading reduce the heat entering gins and warehouses.", who: "Gin and warehouse workers.", actor: "Building owners.", pays: "Owners.", recurring: "Upkeep.", needs: "Sound roofs and permission.", harms: "Roof changes need to respect fire and ventilation design.", ev: [{ k: "research", claims: ["c-bach-roof"], note: "A building simulation for a garment factory; not tested on a gin." }], link: ["/factory-heat/#fam-envelope", "Roof and envelope measures on Heat inside factories"] }),
  R({ id: "g-vent", fam: "yard", t: "Engineered ventilation, dust control and heat-source controls", stages: ["gin"], how: "Ventilation designed with dust extraction, and controls on hot motors and dryers, remove heat without spreading lint or dust.", who: "Gin workers.", actor: "Gin owners, engineers.", pays: "Owners.", recurring: "Energy, filters, maintenance.", needs: "Engineering design for dust, fire and electrical safety.", harms: "Fans, misting or water sprays placed without design can spread lint, wet electrical equipment or stored cotton, and raise fire and machinery risks.", ev: [{ k: "research", claims: ["c-dube", "c-hughs"], note: "These describe dust and fire hazards that cooling has to respect; they do not test cooling." }] }),
  R({ id: "g-welfare", fam: "yard", t: "Water, sanitation and recovery areas at yards and gins", stages: ["yard", "gin"], how: "Drinking water, toilets and a cool place to rest near the work.", who: "Everyone at the site.", actor: "Operators and owners.", pays: "Operators.", recurring: "Cleaning and supplies.", needs: "Space and water supply.", harms: "Facilities that are locked or far away.", ev: [{ k: "guide", claims: ["c-cc-water", "c-cc-rest"] }] }),
  R({ id: "h-alerts", fam: "health", t: "Heat alerts linked to funded action", stages: ["field", "harvest", "yard", "gin"], how: "Warnings that trigger agreed, funded changes (hours, water, breaks) rather than advice alone.", who: "Workers and farmers.", actor: "Meteorological agencies, local government, employers.", pays: "Public budgets and employers.", recurring: "Running the warning and the response.", needs: "A plan that says who does what when a warning comes.", harms: "Advice without means to act.", ev: [], link: ["/resources/heat-action-plans/india/", "India heat action plan archive"] }),
  R({ id: "h-firstaid", fam: "health", t: "Trained first aid and emergency referral", stages: ["field", "harvest", "yard", "gin"], how: "Someone who knows the warning signs, and a way to reach a clinic quickly.", who: "Everyone at work in heat.", actor: "Employers, programmes, health services.", pays: "Employers and public health.", recurring: "Training refreshers; transport.", needs: "A clinic within reach.", harms: "Training without transport to care.", ev: [{ k: "programme", claims: ["c-ilo-train"], note: "Training covered warning signs needing medical attention; it is not evidence that illness fell." }] }),
  R({ id: "h-rural", fam: "health", t: "Rural health-service readiness and accessible transport", stages: ["field", "harvest"], how: "Clinics ready for heat illness, and transport to reach them.", who: "Rural workers and families.", actor: "Health departments.", pays: "Public budgets.", recurring: "Staff, supplies, transport.", needs: "Funding and staff.", harms: "Costs fall on households when clinics are far.", ev: [{ k: "research", claims: ["c-yasin"], note: "Distance from hospital affected pickers' health costs." }] }),
  R({ id: "h-sp", fam: "health", t: "Social-protection access for seasonal and migrant workers", stages: ["harvest", "gin"], how: "Benefits and health coverage that move with workers, or that destination areas extend to them.", who: "Seasonal and migrant workers.", actor: "Social-protection agencies at origin and destination.", pays: "Public schemes.", recurring: "Benefits and administration.", needs: "Portable entitlements and documents.", harms: "Schemes tied to a home address.", ev: [{ k: "programme", claims: ["c-ilo-gaps"] }], link: ["/social-protection/", "Social protection that could help"] }),
  R({ id: "h-housing", fam: "health", t: "Safe housing and overnight recovery", stages: ["harvest", "gin"], how: "Cooler, safer housing for seasonal workers lets the body recover overnight.", who: "Seasonal and migrant workers.", actor: "Employers providing housing; local authorities.", pays: "Employers, public programmes.", recurring: "Upkeep.", needs: "Standards for worker housing.", harms: "Crowded hot housing undoes daytime protection.", ev: [{ k: "research", claims: ["c-cool-home"], note: "From factory case studies: heat at home disrupts sleep and recovery." }] }),
  R({ id: "b-purchase", fam: "buyers", t: "Purchasing terms that allow realistic schedules", stages: ["gin", "spin", "fabric", "garment", "harvest"], how: "Delivery dates and prices that allow for hot-season slowdowns stop pressure being passed down the chain.", who: "Workers at every stage.", actor: "Brands, retailers and traders.", pays: "Buyers, through pricing.", recurring: "Flexibility in schedules.", needs: "Buyers who see beyond their first supplier.", harms: "Institutional: effects are rarely evaluated.", ev: [{ k: "proposal", claims: ["c-hio-fm"], note: "Apparel research proposes allowances in production schedules for climate events; not evaluated." }] }),
  R({ id: "b-fund", fam: "buyers", t: "Shared funding for shade, water, sanitation and running costs", stages: ["field", "harvest", "yard", "gin"], how: "Buyers, industry bodies and programmes share the cost of facilities and, crucially, of keeping them running.", who: "Workers at farms, yards and gins.", actor: "Buyers, industry associations, programmes.", pays: "Shared.", recurring: "Running costs, not only installation.", needs: "Agreed responsibility for upkeep.", harms: "One-off installations that stop when funding ends.", ev: [{ k: "programme", claims: ["c-ilo-water"], note: "An industry body supported a drinking water point." }, { k: "research", claims: ["c-giz-low"], note: "From garment factories: larger investments need buyer support." }] }),
  R({ id: "b-monitor", fam: "buyers", t: "Worker participation in checking whether protection is usable", stages: ["field", "harvest", "yard", "gin"], how: "Workers help check whether water, shade and breaks are actually reachable and used.", who: "All workers.", actor: "Buyers, programmes, worker organisations.", pays: "Buyers and programmes.", recurring: "Paid time for monitors.", needs: "Safety from retaliation.", harms: "Audits on cool days or without workers find little.", ev: [{ k: "research", claims: ["c-giz-voice"], note: "From garment factories: workers know where heat collects." }] }),
  R({ id: "b-insurance", fam: "buyers", t: "Insurance or emergency finance, with its limits explained", stages: ["field"], how: "Crop insurance or emergency credit can cushion a bad season, if it pays reliably.", who: "Farmers, tenant farmers.", actor: "Insurers, lenders, governments.", pays: "Premiums, subsidies.", recurring: "Premiums.", needs: "Clear terms.", harms: "Exclusions and basis risk: a payout triggered by an index can miss a farmer's actual loss; workers are rarely covered.", ev: [], link: ["/paying-when-heat-strikes/", "Paying when heat strikes"] }),
  R({ id: "b-small", fam: "buyers", t: "Support for small producers, not transferred compliance costs", stages: ["field", "harvest"], how: "Programmes that pay for water points, training and shade for small farmers, rather than demanding standards they cannot afford.", who: "Small and marginal farmers and their workers.", actor: "Buyers, industry bodies, governments.", pays: "Buyers and public programmes.", recurring: "Ongoing support.", needs: "Reach to small farmers.", harms: "Standards that exclude small producers from markets.", ev: [{ k: "programme", claims: ["c-ilo-train", "c-ilo-water"] }] })
];

// the explorer: choose stage, arrangement and main barrier
const BARRIERS = [
  { id: "exposure", t: "The heat exposure itself", recs: ["f-shade", "f-rest", "f-carry", "g-yardshade", "g-vent", "g-roof", "f-accl"], local: "Where and when exposure peaks at this stage; a measured heat stress index at the work position, interpreted with workload, clothing and acclimatisation." },
  { id: "income", t: "Losing income by stopping", recs: ["p-paidbreak", "p-piece", "p-targets", "p-income", "b-purchase"], local: "How pay is calculated, and what a break costs in practice." },
  { id: "water", t: "Water and toilets", recs: ["f-water", "g-welfare", "b-fund"], local: "Walking distance to water and toilets, who refills, and whether women can use them safely." },
  { id: "transport", t: "Transport", recs: ["f-transport", "h-rural"], local: "Travel times, safety in the dark, and transport to a clinic." },
  { id: "care", t: "Care responsibilities", recs: ["f-transport", "f-water", "h-housing"], local: "Who collects water and cares for children and older people, and how changed hours affect them." },
  { id: "authority", t: "Authority to stop", recs: ["p-voice", "p-roles", "p-paidbreak", "b-monitor"], local: "Who decides when work pauses, and whether workers can raise heat without retaliation." },
  { id: "services", t: "Access to services", recs: ["h-firstaid", "h-rural", "h-sp", "h-alerts"], local: "Distance to clinics, documents needed for benefits, and whether warnings reach workers." }
];
const EXPLORER = {
  intro: "Choose a stage, a working arrangement and the main barrier. The explorer returns arrangements that could make protection usable, who needs to take part, the evidence behind each, and what to assess locally. It is a learning and planning aid: not a medical diagnosis, a compliance certificate or a safe-work calculator, and it never says work is safe.",
  empty: "Choose at least a main barrier, or pick “I'm not sure” to see every family of measures for a stage.",
  limits: "Temperature or a heat index alone does not describe a worker's heat stress. Occupational guidance uses a heat stress index such as WBGT, which combines humidity, radiant heat and air movement, and interprets it with workload, clothing and acclimatisation. Thresholds come from qualified assessment and the rules that apply where the work happens.",
  limitsClaims: ["c-otm-wbgt", "c-giz-dry", "c-cc-stress"]
};

// how risk can pass along the chain
const CHAINS = {
  intro: "Three mechanisms to investigate. Each is plausible from how work is organised; the full causal path is not established by the evidence on this page.",
  rows: [
    { t: "Lost earnings → pressure to keep working → more exposure", d: "When pay depends on output and a hot spell cuts what people can pick, the pressure to work longer or through symptoms rises.", cut: "Pay that does not penalise rest, and income support in heatwaves.", actor: "Growers and contractors; buyers through prices; social-protection agencies." },
    { t: "Production disruption → compressed schedules → pressure downstream", d: "A late or heat-damaged harvest can squeeze the time for ginning, spinning and garment production when delivery dates stay fixed.", cut: "Delivery schedules with room for climate disruption.", actor: "Brands, retailers and traders who set delivery dates." },
    { t: "Household water and care demands → less recovery → harder to work safely", d: "In hot weeks, collecting water and caring for others take more time, leaving less rest before the next working day.", cut: "Water supply closer to homes, and hours that allow recovery.", actor: "Local government for water; employers for hours." }
  ],
  fate: "People across a chain are connected through production, places and institutions, a community of fate in the sense used on Who shares the heat. But exposure, bargaining power and responsibility are unequal along it: a picker and a brand share a chain, not a burden.",
  fateLink: ["/shared-heat/", "Who shares the heat"]
};

const FACTORY_CARD = { h: "The fibre moves indoors. The heat problem changes.", p: "Follow cotton into spinning, fabric production and garment manufacturing.", href: "/factory-heat/", go: "Explore heat inside factories" };

const GAPS = [
  "No checked study on this page measures heat strain or heat illness among cotton field workers, pickers, yard workers or gin workers in Asia.",
  "No checked evaluation tests shade, water points, paid breaks or appointment systems in cotton production.",
  "The pickers' studies measure pesticide-related health effects and costs, not heat.",
  "The crop study is a controlled-environment experiment; field yield losses from heat for any district are not given here.",
  "No checked source describes heat in cotton market yards or gins in Asia.",
  "No checked study on menstrual hygiene or pregnancy in cotton field work was found.",
  "No checked source supports contrasts with other Asian cotton regions, such as mechanised harvesting in China, so none is made."
];
const WITHHELD = [
  "Better Cotton's account of an individual cotton worker in Pakistan and its Pakistan programme page could not be read from the build session and are not used; the page names no individuals in any case.",
  "Named testimony in the sources (in the ILO release and the 2017 news report) is described without names.",
  "Figures on heat-related cotton yield losses by country, and on the share of pickers paid by weight, were not found in a checked source."
];

function claimsUsed() {
  const s = new Set(), add = a => (a || []).forEach(c => s.add(c));
  STAGES.forEach(x => { add(x.whoClaims); add(x.exposureClaims); add(x.barrierClaims); add(x.evidence); });
  add(CHAIN_NOTES.claims); PATHWAYS.forEach(p => add(p.documented.claims)); add(INFORMAL_CLAIMS);
  EQUITY.items.forEach(i => add(i.claims)); ASIA.rows.forEach(r => add(r.claims)); RECORDS.forEach(r => r.ev.forEach(e => add(e.claims))); add(EXPLORER.limitsClaims);
  return [...s];
}

function md(SITE, ok) {
  const okc = id => !ok || ok.has(id);
  const L = [`## ${TITLE}`, `${SITE}/${SLUG}/`, SUB, DESC, "", QUESTION, OPEN.p1, OPEN.p2, OPEN.note, "",
    "### The cotton journey (illustrative)", ...CHAIN_NOTES.items.map(i => `- ${i}`),
    ...STAGES.map(x => `#### ${x.letter}. ${x.t}\n- Work: ${x.work}\n- Who: ${x.who}\n- Exposure: ${x.exposure}\n- What makes protection difficult: ${x.barriers}\n- What could change: ${x.change}\n- Who controls it: ${x.control}\n- Uncertain: ${x.uncertain}${x.factory ? `\n- More: ${SITE}${x.factory[0]}` : ""}`), "",
    "### Three pathways", ...PATHWAYS.map(p => `#### ${p.t}\n${p.d}\n- Documented: ${p.documented.text}\n- Plausible, to investigate: ${p.plausible}`), "This page does not claim:", ...NOT_CLAIMED.map(n => `- ${n}`), "",
    "### Working arrangements", INFORMAL_NOTE, ...ARRANGEMENTS.map(a => `- ${a.t}: ${a.d}`), `#### ${STOP.h} (${STOP.label})`, ...STOP.rows.map(r => `- ${r.t}. Exposure: ${r.exposure} Constraint: ${r.constraint} Arrangement: ${r.arrangement} Responsible: ${r.actor}`), "",
    "### Women and intersecting inequalities", EQUITY.intro, `Design question: ${EQUITY.question}`, ...EQUITY.items.map(i => `- ${i.t}: ${i.d}`), "",
    "### Asian context", ASIA.intro, ...ASIA.rows.map(r => `- ${r.t}: ${r.d}`), ASIA.caution, "",
    "### Intervention library", `Evidence kinds: ${Object.values(KIND).join("; ")}.`,
    ...FAMILIES.map(f => [`#### ${f.t}`, f.d, ...RECORDS.filter(r => r.fam === f.id).map(r => { const ev = r.ev.map(e => ({ k: e.k, claims: e.claims.filter(okc), note: e.note })).filter(e => e.claims.length);
      return `- ${r.t}. Stages: ${r.stages.join(", ")}. Mechanism: ${r.how} Beneficiaries: ${r.who} Implements: ${r.actor} Pays: ${r.pays} Recurring: ${r.recurring} Prerequisites: ${r.needs} Possible harms or exclusions: ${r.harms} Evidence: ${ev.length ? ev.map(e => KIND[e.k] + (e.note ? ` (${e.note})` : "")).join("; ") : KIND.proposal}.`; })].join("\n")), "",
    "### What makes protection usable?", EXPLORER.intro, EXPLORER.limits, ...BARRIERS.map(b => `- ${b.t}: assess locally ${b.local}`), "",
    "### How risk can pass along the chain", CHAINS.intro, ...CHAINS.rows.map(r => `- ${r.t}. ${r.d} Interruption point: ${r.cut} Actor: ${r.actor}`), CHAINS.fate, "",
    `### ${FACTORY_CARD.h}`, FACTORY_CARD.p, `${SITE}${FACTORY_CARD.href}`, "",
    "### Evidence gaps", ...GAPS.map(g => `- ${g}`), "### Withheld", ...WITHHELD.map(w => `- ${w}`), ""];
  return L.join("\n");
}

module.exports = { SLUG, TITLE, SUB, DESC, QUESTION, OPEN, KIND, KIND_NOTE, STAGES, CHAIN_NOTES, PATHWAYS, NOT_CLAIMED, ARRANGEMENTS, INFORMAL_NOTE, INFORMAL_CLAIMS, STOP, EQUITY, ASIA, FAMILIES, RECORDS, BARRIERS, EXPLORER, CHAINS, FACTORY_CARD, GAPS, WITHHELD, claimsUsed, md };
