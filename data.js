/* ==========================================================
   THE MAP'S CONTENT
   Every system, consequence, link, vicious cycle, breaking point
   and institution on the site comes from this file.

   Editing tips (see README.md for a full guide):
   - Change only the text inside the quote marks.
   - Keep every comma and quote mark where it is.
   - \n inside a label starts a new line.
   - Use curly quotes (’ “ ”) inside sentences, never straight ".
   ========================================================== */

/* ---------- 1. SYSTEMS (drawn clockwise from the top) ---------- */
const SYSTEMS = [
  { id: "nature",    label: "Nature and\necosystems",     color: "#4E7A57",
    desc: "Heat dries land, burns forests, melts ice and warms the sea, wearing down the ecosystems that feed, water and shelter us." },
  { id: "food",      label: "Food and\nagriculture",      color: "#7D8A34",
    desc: "Crops, animals, fisheries and the people who work them all have heat limits. Cross them and food gets scarcer and dearer." },
  { id: "water",     label: "Water",                      color: "#5679A8",
    desc: "Heat raises the demand for water just as it shrinks the supply, and lowers its quality." },
  { id: "energy",    label: "Energy",                     color: "#B07A26",
    desc: "Heat drives up demand for cooling while cutting the ability of power plants and grids to supply it." },
  { id: "cities",    label: "Cities and\ninfrastructure", color: "#5B6573",
    desc: "Concrete, crowding and ageing infrastructure turn cities into amplifiers of heat." },
  { id: "health",    label: "Health",                     color: "#9A3B4A",
    desc: "The human body has limits. Heat strains the heart, kidneys, lungs and mind, and the services built to care for them." },
  { id: "work",      label: "Work and\neconomy",          color: "#7A5238",
    desc: "Heat slows hands, closes businesses and squeezes the incomes of those with the least margin." },
  { id: "education", label: "Education",                  color: "#76609E",
    desc: "Hot classrooms and closed schools cost children learning that shows up years later as lower skills and earnings." },
  { id: "society",   label: "Society and\nsecurity",      color: "#A0587A",
    desc: "Heat frays the social fabric: it isolates, displaces, divides and widens every existing gap." },
  { id: "gov",       label: "Governance\nand finance",    color: "#33465C",
    desc: "The institutions that decide who is protected, and who pays, are themselves strained by heat." }
];

/* ---------- 2. CONSEQUENCES ---------- */
// sys: which system it belongs to. Each one is linked to its system automatically.
const CONSEQUENCES = [
  /* Nature and ecosystems */
  { id: "droughts", sys: "nature", label: "Droughts",
    desc: "Higher temperatures speed up evaporation, so the same rain goes less far and dry spells turn into droughts." },
  { id: "wildfires", sys: "nature", label: "Wildfires",
    desc: "Hot, dry vegetation ignites more easily and burns longer, sending smoke far beyond the fire itself." },
  { id: "forest", sys: "nature", label: "Forest\ndieback",
    desc: "Heat and drought stress trees until they stop growing, then die, turning forests from shade and carbon stores into fuel." },
  { id: "drysoil", sys: "nature", label: "Drying\nsoils",
    desc: "Heat pulls moisture from the ground when crops and plants need it most." },
  { id: "glacier", sys: "nature", label: "Glacier and\nsnow melt",
    desc: "Mountain glaciers and snowpacks that feed rivers through the dry season are shrinking." },
  { id: "marine", sys: "nature", label: "Marine heatwaves\nand coral bleaching",
    desc: "Ocean heatwaves bleach coral and drive fish away from the waters people depend on." },
  { id: "biodiversity", sys: "nature", label: "Biodiversity\nloss",
    desc: "Species that can’t move or adapt fast enough decline, weakening pollination, soils and fisheries." },

  /* Food and agriculture */
  { id: "harvests", sys: "food", label: "Failing\nharvests",
    desc: "Heat during flowering and grain-filling cuts yields of staple crops, even when there is enough rain." },
  { id: "livestock", sys: "food", label: "Livestock\nlosses",
    desc: "Heat-stressed animals eat less, produce less milk and eggs, fall ill and die." },
  { id: "farmwork", sys: "food", label: "Farmwork\nhours lost",
    desc: "Farm labourers work in the open sun. In the hottest hours, work becomes dangerous or impossible." },
  { id: "pests", sys: "food", label: "Pests and crop\ndiseases spread",
    desc: "Warmer conditions let many pests and plant diseases breed faster and spread to new areas." },
  { id: "fisheries", sys: "food", label: "Fisheries\ndecline",
    desc: "As waters warm and reefs die, fish move away or decline, and catches fall." },
  { id: "spoilage", sys: "food", label: "Food spoils\nfaster",
    desc: "Without cool storage, more of every harvest rots between field and plate." },
  { id: "prices", sys: "food", label: "Food price\nspikes",
    desc: "Smaller harvests and losses push up prices, felt hardest by families who spend most of their income on food." },
  { id: "hunger", sys: "food", label: "Hunger and\nmalnutrition",
    desc: "When food costs more and incomes fall, families eat less and less well, and children suffer most." },
  { id: "farmdebt", sys: "food", label: "Farmers fall\ninto debt",
    desc: "After a failed season, farmers borrow at high interest or sell livestock, land and seed to get by." },

  /* Water */
  { id: "scarcity", sys: "water", label: "Water\nshortages",
    desc: "Taps run dry and wells fall just as people, crops and animals need more water to cope with the heat." },
  { id: "quality", sys: "water", label: "Water quality\nfalls",
    desc: "Warm, low water breeds algae and bacteria and concentrates pollution." },
  { id: "irrigation", sys: "water", label: "Irrigation\ndemand soars",
    desc: "Hot, dry fields need far more water to keep crops alive." },
  { id: "groundwater", sys: "water", label: "Groundwater\nover-pumped",
    desc: "Farmers and cities pump deeper and harder, draining aquifers faster than rain can refill them." },
  { id: "competition", sys: "water", label: "Competition\nfor water",
    desc: "Farms, cities, industry and power plants all compete for a shrinking supply." },
  { id: "fetching", sys: "water", label: "Longer trips\nto fetch water",
    desc: "Where taps fail, someone has to walk further, for longer, in the heat, to bring water home." },
  { id: "sanitation", sys: "water", label: "Sanitation and\nhygiene fail",
    desc: "Without enough water, toilets, handwashing and cleaning suffer." },

  /* Energy */
  { id: "demand", sys: "energy", label: "Cooling demand\npeaks",
    desc: "As temperatures climb, so does the demand for fans and air conditioning, pushing electricity use to new peaks." },
  { id: "power", sys: "energy", label: "Power cuts and\ngrid stress",
    desc: "Peak demand and heat-stressed lines and transformers push grids to the edge. Outages switch off cooling when it matters most." },
  { id: "thermal", sys: "energy", label: "Power plants\ncut output",
    desc: "Coal, gas and nuclear plants need cool water. When rivers run low or warm, they have to produce less." },
  { id: "hydro", sys: "energy", label: "Hydropower\nfalls",
    desc: "Low rivers and reservoirs mean less electricity from dams." },
  { id: "generators", sys: "energy", label: "Diesel generators\nrun longer",
    desc: "When the grid fails, homes, shops and hospitals that can afford it switch to diesel." },
  { id: "emissions", sys: "energy", label: "Emissions from\ncooling rise",
    desc: "Most cooling still runs on fossil-fuelled power and refrigerants that warm the planet." },
  { id: "energypoverty", sys: "energy", label: "Can’t afford\nto keep cool",
    desc: "For the poorest households, fans, cooling and electricity bills are out of reach." },
  { id: "coldchain", sys: "energy", label: "Cold chains\nbreak",
    desc: "Without reliable power, fridges for food, medicines and vaccines fail." },

  /* Cities and infrastructure */
  { id: "uhi", sys: "cities", label: "Urban heat\nislands",
    desc: "Dense surfaces, little shade and waste heat keep city cores several degrees hotter than their surroundings, especially at night." },
  { id: "homes", sys: "cities", label: "Homes that\ntrap heat",
    desc: "Tin roofs, poor ventilation and crowded rooms can make homes hotter inside than out, leaving nowhere safe to rest." },
  { id: "infrastructure", sys: "cities", label: "Roads, rails and\nrunways strained",
    desc: "Rails buckle, roads soften and hot, thin air means planes need longer runways or must carry less." },
  { id: "transport", sys: "cities", label: "Transport\ndisrupted",
    desc: "Speed limits, cancellations and breakdowns slow the movement of people and goods." },
  { id: "smog", sys: "cities", label: "Smoke, smog\nand ozone",
    desc: "Heat speeds up the chemistry that forms ground-level ozone, and still, hot air traps pollution and smoke." },
  { id: "publicspace", sys: "cities", label: "Streets and parks\nunusable",
    desc: "Markets, streets and parks become too hot to use in the middle of the day." },
  { id: "telecom", sys: "cities", label: "Phone and data\nnetworks fail",
    desc: "Overheating equipment and power cuts take down phone masts, networks and data centres." },

  /* Health */
  { id: "deaths", sys: "health", label: "Heat deaths",
    desc: "Extreme heat kills, often quietly, through failing hearts, kidneys and lungs. Europe’s 2003 heatwave alone is estimated to have caused more than 70,000 deaths." },
  { id: "heatstroke", sys: "health", label: "Heatstroke and\nheat exhaustion",
    desc: "When the body can no longer cool itself, heat exhaustion can tip into heatstroke: a medical emergency that can kill." },
  { id: "kidney", sys: "health", label: "Kidney and\nheart strain",
    desc: "Sweating and dehydration make the heart work harder and can damage the kidneys, especially with repeated exposure." },
  { id: "respiratory", sys: "health", label: "Breathing\nproblems worsen",
    desc: "Ozone, smoke and hot air inflame airways and worsen asthma and lung disease." },
  { id: "pregnancy", sys: "health", label: "Risks in\npregnancy",
    desc: "Extreme heat is linked to higher risks of preterm birth and other pregnancy complications." },
  { id: "mental", sys: "health", label: "Mental health\nsuffers",
    desc: "Heat is linked to more anxiety, distress and suicide, and to worse outcomes for people living with mental illness." },
  { id: "sleepless", sys: "health", label: "Sleepless\nhot nights",
    desc: "When nights stay hot, the body never recovers from the day, so the next day starts already depleted." },
  { id: "infectious", sys: "health", label: "Infectious\ndiseases spread",
    desc: "Warmth helps mosquitoes that carry dengue thrive, and dirty water and spoiled food spread illness." },
  { id: "injuries", sys: "health", label: "Injuries and\naccidents rise",
    desc: "Heat dulls concentration and coordination, so accidents at work, on the road and at home increase." },
  { id: "hsys", sys: "health", label: "Health systems\noverwhelmed",
    desc: "Heatwaves bring surges of patients just as staff, power and supplies are under strain." },

  /* Work and economy */
  { id: "lost", sys: "work", label: "Lost work hours\nand wages",
    desc: "The International Labour Organization projects that heat stress could cut 2.2% of all working hours worldwide by 2030, the equivalent of 80 million full-time jobs." },
  { id: "informal", sys: "work", label: "Informal workers\ncan’t stop work",
    desc: "Without paid leave, contracts or savings, stopping work means losing the day’s income. So people keep working through dangerous heat." },
  { id: "productivity", sys: "work", label: "Productivity\nfalls",
    desc: "Above a certain temperature, people work more slowly and make more mistakes, indoors and out." },
  { id: "debt", sys: "work", label: "Medical costs\nand debt",
    desc: "Treatment, medicines and lost days are often paid for out of pocket, pushing households into debt." },
  { id: "business", sys: "work", label: "Small businesses\nclose",
    desc: "Street vendors, workshops and shops lose customers, stock and power, and many shut for good." },
  { id: "supply", sys: "work", label: "Supply chains\ndisrupted",
    desc: "Heat slows factories, ports, roads and warehouses. The delays ripple through prices and jobs far away." },
  { id: "tourism", sys: "work", label: "Tourism\nshifts away",
    desc: "Visitors avoid places and seasons that become too hot, taking jobs and income with them." },

  /* Education */
  { id: "schoolclose", sys: "education", label: "Schools close\nin heatwaves",
    desc: "When classrooms become dangerous, schools shut, sometimes for weeks." },
  { id: "learning", sys: "education", label: "Learning suffers\nin hot classrooms",
    desc: "Studies link hotter school days to measurably lower learning and exam results." },
  { id: "dropout", sys: "education", label: "Children pulled\nout of school",
    desc: "When families are squeezed, children, often girls, leave school to work, care or fetch water." },
  { id: "youth", sys: "education", label: "Lower skills\nand earnings",
    desc: "Learning lost today becomes lower skills and lower earnings for a lifetime." },

  /* Society and security */
  { id: "inequality", sys: "society", label: "Deepening\ninequality",
    desc: "Every impact lands hardest on those with the least protection, widening gaps in health, income and opportunity." },
  { id: "care", sys: "society", label: "Care burden falls\non women and girls",
    desc: "When people fall ill, schools close or water runs short, the extra caring and fetching usually falls on women and girls." },
  { id: "isolation", sys: "society", label: "Older people\nisolated at home",
    desc: "Older people living alone are among the most likely to die in a heatwave. Many victims of Chicago’s 1995 heatwave died alone at home." },
  { id: "violence", sys: "society", label: "Violence and\ncrime rise",
    desc: "Hot days are linked to more aggression, domestic violence and violent crime." },
  { id: "conflict", sys: "society", label: "Conflict over\nwater and land",
    desc: "Where water and pasture shrink, disputes between communities can turn violent." },
  { id: "migration", sys: "society", label: "Forced\nmigration",
    desc: "When land, work and water fail, families may be forced to move, often into cities that are hotter still." },
  { id: "gatherings", sys: "society", label: "Mass gatherings\nturn deadly",
    desc: "Crowds in open sun with little shade or water are deadly. During the 2024 Hajj, more than 1,300 pilgrims died in extreme heat." },
  { id: "cohesion", sys: "society", label: "Social trust\nfrays",
    desc: "Violence, unequal suffering and failing services erode trust between neighbours and in institutions." },

  /* Governance and finance */
  { id: "emergency", sys: "gov", label: "Emergency services\nstretched",
    desc: "Ambulances, fire crews and emergency rooms are swamped all at once." },
  { id: "budgets", sys: "gov", label: "Public budgets\nstrained",
    desc: "Repairs, emergency response, lost tax revenue and relief payments all drain public money." },
  { id: "insurance", sys: "gov", label: "Insurance losses\nand retreat",
    desc: "Rising losses push premiums up and insurers out, leaving more people and businesses unprotected." },
  { id: "underreport", sys: "gov", label: "Heat deaths\nunder-recorded",
    desc: "Heat is rarely written on death certificates. Most heat deaths are recorded as heart, kidney or lung failure." },
  { id: "underfund", sys: "gov", label: "Heat protection\nunderfunded",
    desc: "Warnings, cooling centres, outreach and heat-ready services get a small share of budgets compared with floods or storms." },
  { id: "credit", sys: "gov", label: "Borrowing\ncosts rise",
    desc: "Lenders and rating agencies increasingly price climate risk into the cost of public and private borrowing." },
  { id: "elections", sys: "gov", label: "Elections and public\nservices disrupted",
    desc: "Heat disrupts voting, courts and public offices. Polling staff died in heatwaves during India’s 2024 general election." }
];

/* ---------- 3. LINKS BETWEEN CONSEQUENCES ---------- */
// [from, to, why]  — add "loop" as a 4th item for a link that closes a vicious cycle (drawn red).
// Links from each system to its own consequences, and from extreme heat to each system, are drawn automatically.
const LINKS = [
  /* nature */
  ["droughts", "wildfires", "Parched land and vegetation burn more easily."],
  ["droughts", "scarcity", "Rivers, wells and reservoirs fall."],
  ["droughts", "harvests", "Crops fail without water."],
  ["droughts", "livestock", "Less water and fodder for animals."],
  ["drysoil", "harvests", "Moisture vanishes just when crops need it most."],
  ["forest", "wildfires", "Stressed and dying trees become fuel."],
  ["forest", "biodiversity", "Habitats disappear with the trees."],
  ["wildfires", "smog", "Smoke travels hundreds of kilometres from the fire."],
  ["wildfires", "glacier", "Soot settling on snow and ice darkens it, so it absorbs more sunlight and melts faster."],
  ["glacier", "scarcity", "Rivers fed by snow and ice run lower in the dry season."],
  ["glacier", "hydro", "Less meltwater reaches the dams."],
  ["marine", "fisheries", "Fish move away from warming water, and dying reefs support fewer of them."],
  ["biodiversity", "harvests", "Fewer pollinators and natural pest-eaters mean lower yields."],
  ["drysoil", "heat", "Dry soil can’t cool itself by evaporation, so more of the sun’s energy becomes heat.", "loop"],
  ["glacier", "heat", "Melting snow and ice expose darker ground and water, which absorb more sunlight.", "loop"],
  ["wildfires", "heat", "Fires release carbon and strip away tree cover that shades and cools the land.", "loop"],

  /* food */
  ["harvests", "prices", "Smaller harvests push up prices."],
  ["harvests", "farmdebt", "A failed season leaves farmers borrowing to eat and to replant."],
  ["farmdebt", "harvests", "Indebted farmers cut back on seed, water and fertiliser, so the next harvest fails more easily.", "loop"],
  ["farmdebt", "migration", "When debts can’t be repaid, families leave the land to look for work."],
  ["livestock", "hunger", "Less milk, eggs and meat for families who rely on them."],
  ["farmwork", "harvests", "Fields go untended in the hottest hours."],
  ["farmwork", "lost", "Farm labourers lose daily wages."],
  ["pests", "harvests", "More pests and plant diseases mean more crops lost."],
  ["fisheries", "hunger", "Coastal families lose a vital source of protein and income."],
  ["spoilage", "prices", "Losses after harvest push up prices."],
  ["prices", "hunger", "The poorest spend most of their income on food."],
  ["prices", "informal", "Higher prices make it even harder to stop working."],
  ["hunger", "learning", "Hungry children struggle to learn."],

  /* water */
  ["scarcity", "fetching", "Taps run dry, so someone has to fetch water."],
  ["scarcity", "sanitation", "Without water, sanitation and hygiene fail."],
  ["scarcity", "competition", "Farms, cities and power plants compete for what is left."],
  ["scarcity", "irrigation", "Dry fields need more irrigation."],
  ["irrigation", "groundwater", "Farmers pump harder and deeper to keep crops alive."],
  ["groundwater", "scarcity", "Aquifers fall and wells run dry.", "loop"],
  ["scarcity", "thermal", "Power plants need cool water. When rivers run low or warm, they cut output."],
  ["quality", "infectious", "Contaminated water spreads disease."],
  ["sanitation", "infectious", "Poor hygiene spreads diarrhoea and other infections."],
  ["fetching", "care", "Fetching water falls mostly on women and girls."],
  ["fetching", "dropout", "Girls miss school to fetch water."],
  ["competition", "conflict", "Scarce water becomes a source of conflict."],

  /* energy */
  ["demand", "power", "Peak demand pushes grids to the limit."],
  ["demand", "emissions", "Most cooling still runs on fossil-fuelled power."],
  ["emissions", "heat", "Emissions add to the warming that drives demand for cooling.", "loop"],
  ["demand", "uhi", "Air conditioners pump heat outdoors, warming the streets around them.", "loop"],
  ["demand", "energypoverty", "Higher bills push poor households into energy poverty."],
  ["power", "generators", "Outages drive those who can afford it to diesel."],
  ["generators", "emissions", "Diesel adds still more emissions."],
  ["generators", "smog", "Generators fill streets with fumes."],
  ["power", "coldchain", "Without power, fridges for food and vaccines fail."],
  ["power", "hsys", "Hospitals and clinics lose cooling and equipment when the power fails."],
  ["power", "scarcity", "Without power, pumps and treatment plants stop.", "loop"],
  ["thermal", "power", "Plants cut output just when demand peaks.", "loop"],
  ["hydro", "power", "Low reservoirs mean less electricity."],
  ["power", "telecom", "Phone masts and networks fail when the power does."],
  ["power", "business", "Shops and workshops lose power and stock."],
  ["energypoverty", "heatstroke", "With no way to cool down at home, heat builds up in the body.", "loop"],
  ["coldchain", "spoilage", "Food rots without refrigeration."],
  ["coldchain", "infectious", "Spoiled vaccines leave people unprotected."],

  /* cities */
  ["uhi", "demand", "A hotter city needs even more cooling.", "loop"],
  ["uhi", "sleepless", "Cities hold their heat overnight."],
  ["homes", "heatstroke", "With no cool place to recover, heat builds up day after day."],
  ["homes", "sleepless", "Rooms stay hot all night."],
  ["infrastructure", "transport", "Buckled rails and softened roads slow everything down."],
  ["infrastructure", "budgets", "Repairs drain public budgets."],
  ["transport", "supply", "Goods stop moving."],
  ["smog", "respiratory", "Ozone and smoke inflame the lungs."],
  ["publicspace", "business", "Street trade and markets empty out."],
  ["publicspace", "isolation", "People stay indoors and alone."],
  ["telecom", "emergency", "Warnings and calls for help don’t get through."],

  /* health */
  ["heatstroke", "deaths", "Heatstroke kills if it is not treated quickly."],
  ["kidney", "deaths", "Many heat deaths are heart and kidney failures."],
  ["respiratory", "deaths", "Breathing problems turn fatal in the heat."],
  ["pregnancy", "hsys", "Complications add to the load on maternity care."],
  ["sleepless", "mental", "Poor sleep wears down mood and the ability to cope."],
  ["mental", "sleepless", "Stress and anxiety make sleep even harder.", "loop"],
  ["sleepless", "heatstroke", "Without cool nights, the body starts each day already overheated."],
  ["mental", "violence", "Frayed tempers spill over into violence."],
  ["infectious", "hsys", "Outbreaks add to the caseload."],
  ["injuries", "hsys", "More casualties to treat."],
  ["injuries", "lost", "Injured workers lose income."],
  ["heatstroke", "hsys", "Heat illness brings sudden surges of patients.", "loop"],
  ["hsys", "heatstroke", "Overstretched services treat people later, and heat illness turns severe fast.", "loop"],
  ["heatstroke", "lost", "Illness means days off work, and for daily earners no work means no pay.", "loop"],
  ["heatstroke", "debt", "Treatment and lost days are paid for out of pocket.", "loop"],
  ["deaths", "underreport", "Most heat deaths are recorded as heart, kidney or lung failure.", "loop"],
  ["deaths", "inequality", "Families lose breadwinners and carers."],

  /* work */
  ["productivity", "lost", "Slower work means lower output and pay."],
  ["productivity", "budgets", "Lower output means lower tax revenue."],
  ["informal", "heatstroke", "Working through the hottest hours without shade, water or rest raises the risk of heat illness.", "loop"],
  ["informal", "injuries", "Fatigue and heat cause accidents."],
  ["informal", "care", "When workers fall ill, someone has to care for them, usually women."],
  ["lost", "informal", "Lost income leaves even less margin, so the next heatwave has to be worked through too.", "loop"],
  ["lost", "inequality", "Lost earnings hurt most where there are no savings to fall back on."],
  ["lost", "hunger", "Less income means less food."],
  ["debt", "informal", "Debt repayments remove any option to stop work in the heat.", "loop"],
  ["debt", "energypoverty", "Debt leaves nothing for electricity or cooling.", "loop"],
  ["business", "lost", "Closed businesses mean lost jobs."],
  ["supply", "prices", "Delays and losses push up prices."],
  ["tourism", "lost", "Fewer visitors, fewer jobs."],

  /* education */
  ["schoolclose", "learning", "Lost school days mean lost learning."],
  ["schoolclose", "care", "Children at home need someone to look after them."],
  ["learning", "youth", "Lost learning becomes lower earnings later."],
  ["dropout", "youth", "Leaving school early limits a whole life’s options."],
  ["youth", "inequality", "Gaps in learning become gaps in income."],
  ["inequality", "dropout", "Poorer households pull children out of school to work, care or fetch water.", "loop"],

  /* society */
  ["inequality", "migration", "When the gap becomes unbearable, people move."],
  ["migration", "homes", "People forced to move often end up in crowded, poorly built housing that traps heat.", "loop"],
  ["care", "inequality", "Unpaid care pulls women and girls out of paid work and school."],
  ["isolation", "deaths", "Older people alone at home are among the most likely to die."],
  ["violence", "cohesion", "Violence erodes trust."],
  ["conflict", "migration", "Conflict forces people from their homes."],
  ["gatherings", "deaths", "Crowds in the open sun turn deadly."],
  ["gatherings", "emergency", "Mass casualties overwhelm responders."],
  ["cohesion", "isolation", "Weaker community ties leave more people alone."],

  /* governance and finance */
  ["emergency", "deaths", "When responders are stretched, help arrives too late."],
  ["emergency", "budgets", "Reacting after the fact costs far more than preparing.", "loop"],
  ["budgets", "underfund", "Stretched budgets leave little for heat protection."],
  ["underreport", "underfund", "What isn’t counted isn’t funded."],
  ["underfund", "deaths", "Without warnings, cooling centres and outreach, more people die.", "loop"],
  ["underfund", "emergency", "Without prevention, emergencies multiply."],
  ["underfund", "hsys", "Clinics aren’t prepared for heat."],
  ["underfund", "insurance", "Unmanaged risk drives insurers away.", "loop"],
  ["insurance", "budgets", "When insurers retreat, governments carry the losses."],
  ["insurance", "business", "Uninsured losses close small businesses."],
  ["credit", "budgets", "Higher borrowing costs leave less to spend."],
  ["elections", "cohesion", "Disrupted elections and services test public trust."]
];

/* ---------- 4. VICIOUS CYCLES ---------- */
// path: the steps in order; the last step leads back to the first.
// evidence: "established" (well established) or "emerging" (each link is evidenced; the full cycle less so).
const LOOP_GROUPS = [
  { id: "heat",    name: "Loops that feed the heat itself" },
  { id: "systems", name: "Loops that break the systems we rely on" },
  { id: "people",  name: "Loops that trap people" },
  { id: "inst",    name: "Loops inside institutions" }
];

const LOOPS = [
  { id: "global", group: "heat", name: "The global cooling loop", evidence: "established",
    path: ["heat", "energy", "demand", "emissions"],
    summary: "Cooling powered by fossil fuels adds to the warming that makes us need more cooling." },
  { id: "soil", group: "heat", name: "The dry-soil loop", evidence: "established",
    path: ["heat", "nature", "drysoil"],
    summary: "Heat dries the soil. Dry soil can’t cool itself, so the land heats up faster." },
  { id: "ice", group: "heat", name: "The melting-ice loop", evidence: "established",
    path: ["heat", "nature", "glacier"],
    summary: "Heat melts ice. Darker ground and water absorb more sunlight, and the melting speeds up." },
  { id: "fire", group: "heat", name: "The wildfire loop", evidence: "established",
    path: ["heat", "nature", "wildfires"],
    summary: "Heat dries forests into fuel. Fires release carbon and strip away the trees that cool the land." },

  { id: "cooling", group: "systems", name: "The cooling trap", evidence: "established",
    path: ["demand", "uhi"],
    summary: "Air conditioning heats the street, and a hotter city needs even more air conditioning." },
  { id: "energywater", group: "systems", name: "The energy–water loop", evidence: "established",
    path: ["power", "scarcity", "thermal"],
    summary: "Water systems need power and power plants need water. In a heatwave, each failure deepens the other." },
  { id: "pumping", group: "systems", name: "The groundwater loop", evidence: "established",
    path: ["scarcity", "irrigation", "groundwater"],
    summary: "Dry fields need more water, so farmers pump harder, aquifers fall and the shortage deepens." },
  { id: "clinic", group: "systems", name: "The overwhelmed-clinic loop", evidence: "emerging",
    path: ["heatstroke", "hsys"],
    summary: "Heat illness floods clinics. Overwhelmed clinics treat people later, and more cases become severe." },

  { id: "poverty", group: "people", name: "The poverty–heat trap", evidence: "established",
    path: ["informal", "heatstroke", "lost"],
    summary: "People who can’t afford to stop working fall ill. Illness costs income, and lost income makes stopping even less affordable." },
  { id: "debt", group: "people", name: "The medical-debt trap", evidence: "emerging",
    path: ["heatstroke", "debt", "informal"],
    summary: "Treatment costs push families into debt. Debt removes any option to rest, and working through the heat brings more illness." },
  { id: "energypoverty", group: "people", name: "The energy-poverty trap", evidence: "emerging",
    path: ["energypoverty", "heatstroke", "debt"],
    summary: "People who can’t afford to cool fall ill. Illness brings debt, and debt puts cooling even further out of reach." },
  { id: "displacement", group: "people", name: "The displacement loop", evidence: "emerging",
    path: ["migration", "homes", "heatstroke", "lost", "inequality"],
    summary: "People forced to move often land in heat-trapping housing, fall ill, lose income, fall further behind, and are forced to move again." },
  { id: "school", group: "people", name: "The lost-schooling loop", evidence: "emerging",
    path: ["dropout", "youth", "inequality"],
    summary: "Children pulled out of school earn less as adults, and poorer families pull more children out of school." },
  { id: "sleep", group: "people", name: "The sleepless-nights loop", evidence: "established",
    path: ["sleepless", "mental"],
    summary: "Hot nights wreck sleep. Poor sleep frays mental health, and stress makes sleep harder still." },
  { id: "farmdebt", group: "people", name: "The farm-debt loop", evidence: "emerging",
    path: ["harvests", "farmdebt"],
    summary: "A failed harvest pushes farmers into debt. Debt leaves less for seed, water and fertiliser, so the next harvest fails more easily." },

  { id: "invisible", group: "inst", name: "The invisible-deaths loop", evidence: "emerging",
    path: ["deaths", "underreport", "underfund"],
    summary: "Heat deaths go uncounted, so heat protection goes unfunded, so more people die uncounted." },
  { id: "reactive", group: "inst", name: "The reactive-spending loop", evidence: "emerging",
    path: ["budgets", "underfund", "emergency"],
    summary: "Stretched budgets skimp on prevention. Emergencies multiply, and costly emergency response stretches budgets further." },
  { id: "protection", group: "inst", name: "The protection-gap loop", evidence: "emerging",
    path: ["insurance", "budgets", "underfund"],
    summary: "As insurers retreat, public budgets absorb the losses, protection is cut, and the risk drives insurers further away." }
];

/* ---------- 5. INSTITUTIONS: who holds the levers ---------- */
const INSTITUTIONS = [
  { id: "nat",       name: "National governments",                 desc: "Set laws, budgets, labour rules, building codes and social protection." },
  { id: "city",      name: "City and local governments",           desc: "Run heat action plans, urban design, housing and local services." },
  { id: "health",    name: "Health authorities",                   desc: "Prepare clinics, track heat illness and deaths, and lead public health warnings." },
  { id: "met",       name: "Weather and climate services",         desc: "Forecast dangerous heat and trigger warnings and early action." },
  { id: "employers", name: "Employers and businesses",             desc: "Decide on rest breaks, shade, water, working hours and sick pay." },
  { id: "workers",   name: "Worker organisations and unions",      desc: "Organise informal and formal workers to win protection and income security." },
  { id: "utilities", name: "Utilities and energy regulators",      desc: "Keep power flowing, price electricity and shape how cooling is supplied." },
  { id: "water",     name: "Water authorities",                    desc: "Manage supply, pumping, treatment and how scarce water is shared." },
  { id: "agri",      name: "Farmers’ organisations and agriculture agencies", desc: "Shape what is grown, how water is used and how soils are managed." },
  { id: "schools",   name: "Schools and education authorities",    desc: "Decide on classrooms, timetables and support that keeps children learning." },
  { id: "insurers",  name: "Insurers and financiers",              desc: "Price risk, design insurance and decide where capital flows." },
  { id: "funders",   name: "Development banks, donors and climate funds", desc: "Finance prevention, protection and the institutions that deliver them." },
  { id: "community", name: "Community and civil society groups",   desc: "Reach the people institutions miss: checking on neighbours, running cooling spaces, holding power to account." },
  { id: "intl",      name: "International bodies",                 desc: "Set global standards and agreements on emissions, refrigerants and work." }
];

/* ---------- 6. BREAKING POINTS ---------- */
// edge: the link it cuts [from, to]. who: the institutions that can pull this lever.
// A lever breaks every vicious cycle that runs through its link.
// when: how soon it can start working. "season" = this season, "years" = 1–3 years, "decade" = a decade or more.
const LEVERS = [
  { id: "emissions", edge: ["heat", "nature"], title: "Deep emission cuts", who: ["nat", "intl", "funders"], when: "decade",
    text: "Every fraction of a degree avoided weakens every loop that runs through land, ice and forests at once." },
  { id: "cleancool", edge: ["demand", "emissions"], title: "Clean, efficient cooling", who: ["nat", "utilities", "intl"], when: "years",
    text: "Efficient appliances, clean power and low-warming refrigerants break the link between keeping cool and heating the planet.",
    example: "The Kigali Amendment to the Montreal Protocol (2016) commits countries to phase down the most climate-warming refrigerants." },
  { id: "soilwater", edge: ["drysoil", "heat"], title: "Keep water in the soil", who: ["agri", "community", "funders"], when: "years",
    text: "Mulching, agroforestry, water harvesting and restoring degraded land help soils hold moisture and stay cooler." },
  { id: "blackcarbon", edge: ["glacier", "heat"], title: "Cut black carbon", who: ["nat", "city"], when: "years",
    text: "Cleaner stoves and engines and an end to open burning reduce the soot that darkens snow and ice." },
  { id: "firesmart", edge: ["wildfires", "heat"], title: "Fire-smart landscapes", who: ["nat", "community"], when: "years",
    text: "Early detection, community fire crews and land management that reduces fuel keep fires small and forests standing." },

  { id: "coolbydesign", edge: ["demand", "uhi"], title: "Cool by design", who: ["city", "nat"], when: "decade",
    text: "Shading, ventilation, reflective roofs and efficient cooling cut the need for air conditioning, and the waste heat it dumps outside." },
  { id: "greencity", edge: ["uhi", "demand"], title: "Green, cool cities", who: ["city", "community"], when: "years",
    text: "Trees, water, cool roofs and cool pavements lower city temperatures and flatten peak demand.",
    example: "Indian cities and states such as Ahmedabad and Telangana have run programmes that paint roofs to reflect sunlight." },
  { id: "drypower", edge: ["scarcity", "thermal"], title: "Power that doesn’t need water", who: ["utilities", "nat"], when: "decade",
    text: "Solar and wind use very little water, and dry cooling protects thermal plants when rivers run low or warm." },
  { id: "pumpbackup", edge: ["power", "scarcity"], title: "Backup power for water", who: ["water", "utilities"], when: "years",
    text: "Solar pumps and backup supply keep water flowing when the grid fails." },
  { id: "irrigate", edge: ["irrigation", "groundwater"], title: "Smart irrigation and groundwater rules", who: ["agri", "water"], when: "years",
    text: "Drip irrigation, metering, aquifer recharge and fair pumping rules keep wells from running dry." },
  { id: "farmcredit", edge: ["harvests", "farmdebt"], title: "Crop insurance and fair credit", who: ["insurers", "agri", "funders"], when: "years",
    text: "Crop insurance that pays out after a heat-hit season, affordable credit and heat-tolerant seed stop one bad harvest becoming a debt trap." },
  { id: "hap", edge: ["heatstroke", "hsys"], title: "Heat action plans", who: ["city", "health", "met"], when: "season",
    text: "Early warnings, public cooling spaces and outreach to the people most at risk prevent illness before it reaches hospital.",
    example: "Ahmedabad launched South Asia’s first city heat action plan in 2013." },
  { id: "readyclinics", edge: ["hsys", "heatstroke"], title: "Heat-ready health services", who: ["health", "funders"], when: "season",
    text: "Cooling, backup power, surge plans and trained frontline workers keep clinics working through heatwaves." },

  { id: "heatrules", edge: ["informal", "heatstroke"], title: "Heat-safe work", who: ["nat", "employers", "workers"], when: "season",
    text: "Rest, shade and water during dangerous heat, with paid breaks so that stopping work doesn’t mean losing pay.",
    example: "Several Gulf states ban outdoor work during the hottest midday hours in summer." },
  { id: "heatcash", edge: ["heatstroke", "lost"], title: "Income protection in heatwaves", who: ["insurers", "nat", "workers"], when: "years",
    text: "Cash that pays out automatically when temperatures cross a danger threshold, so people can afford to stop.",
    example: "Parametric heat insurance has been piloted with women informal workers in India." },
  { id: "socialprotection", edge: ["lost", "informal"], title: "Social protection floors", who: ["nat", "funders"], when: "years",
    text: "Basic income security that keeps households above the line between one hot season and the next." },
  { id: "freecare", edge: ["heatstroke", "debt"], title: "Free care for heat illness", who: ["health", "nat"], when: "season",
    text: "Covering emergency treatment for heat illness stops one bad day from becoming years of debt." },
  { id: "affordablecool", edge: ["energypoverty", "heatstroke"], title: "Affordable cooling for the poorest", who: ["utilities", "city", "nat"], when: "years",
    text: "Lifeline electricity tariffs, efficient fans and cool roofs put safe cooling within reach of every household." },
  { id: "coolhousing", edge: ["migration", "homes"], title: "Cool, affordable housing", who: ["city", "funders", "community"], when: "decade",
    text: "Upgrading informal settlements with ventilation, shade and cool roofs, and planning homes for people who arrive." },
  { id: "keepinschool", edge: ["inequality", "dropout"], title: "Keep children in school", who: ["schools", "nat"], when: "season",
    text: "Cash transfers, school meals and heat-ready classrooms and timetables keep children learning through hot seasons." },
  { id: "coolnights", edge: ["sleepless", "mental"], title: "Cool nights and support", who: ["city", "health", "community"], when: "season",
    text: "Cooling centres open at night, shaded and ventilated homes, and mental-health support during the hot season." },

  { id: "countdeaths", edge: ["deaths", "underreport"], title: "Count every heat death", who: ["health", "met", "nat"], when: "years",
    text: "Real-time tracking of excess deaths during heatwaves, and death certificates that record heat, make the toll visible." },
  { id: "coolingcentres", edge: ["underfund", "deaths"], title: "Cooling centres and check-ins", who: ["city", "community", "health"], when: "season",
    text: "Public cooling spaces, water points and check-ins on older people living alone save lives in every heatwave." },
  { id: "heatbudget", edge: ["budgets", "underfund"], title: "Dedicated heat budgets", who: ["nat", "city", "funders"], when: "years",
    text: "Ring-fenced funding for heat action, set aside before the season, so protection doesn’t compete with the emergency." },
  { id: "anticipatory", edge: ["underfund", "emergency"], title: "Anticipatory action", who: ["met", "funders", "nat"], when: "years",
    text: "Release money and act on the forecast, before the heatwave peaks, instead of paying for the emergency afterwards.",
    example: "Forecast-based financing, pioneered within the Red Cross Red Crescent Movement, releases funds before a disaster strikes." },
  { id: "riskpools", edge: ["insurance", "budgets"], title: "Shared risk pools", who: ["insurers", "nat", "funders"], when: "years",
    text: "Public–private insurance and regional risk pools keep cover available and spread losses beyond any one budget.",
    example: "Regional risk pools such as the African Risk Capacity and the Caribbean’s CCRIF share disaster risk across countries." }
];

/* ---------- 7. A GUIDED PATH ACROSS SYSTEMS ---------- */
const STORIES = {
  field: {
    title: "From field to family",
    kicker: "Across systems",
    steps: [
      { edges: [["heat", "nature"]], title: "Heat reaches the land",
        text: "A hot spell arrives at the worst moment of the growing season." },
      { edges: [["nature", "drysoil"], ["drysoil", "harvests"]], title: "Soils dry, harvests fail",
        text: "Moisture is pulled from the ground just when crops need it most." },
      { edges: [["harvests", "prices"]], title: "The shock travels to the market",
        text: "Smaller harvests mean higher prices, felt by families far from the field." },
      { edges: [["prices", "hunger"], ["hunger", "learning"]], title: "Children eat less, and learn less",
        text: "Hungry children struggle in class, and the loss follows them for life." },
      { edges: [["prices", "informal"]], title: "Stopping work becomes impossible",
        text: "With food costing more, there is even less room to rest during the heat." },
      { edges: [["informal", "heatstroke"], ["heatstroke", "deaths"]], title: "And some don’t survive",
        text: "Working through the hottest hours, without rest, water or shade, can kill. From a dry field to a death that may never be counted as heat." }
    ]
  }
};

/* ---------- 8. WHERE TO LOOK: places in Asia where each loop plays out ---------- */
// Shown with each vicious cycle. These are places to look, not measurements.
const LOOP_PLACES = {
  global:        "Fast-growing cities across South and Southeast Asia, where air-conditioner ownership is rising quickly.",
  soil:          "Rain-fed farmland on the Indian subcontinent and in mainland Southeast Asia during the hot, dry pre-monsoon months.",
  ice:           "The Hindu Kush Himalaya, whose snow and ice feed rivers such as the Indus, Ganges and Brahmaputra.",
  fire:          "The dry-season burning belt of northern Thailand, Myanmar and Laos, and Indonesia’s peatlands.",
  cooling:       "Dense, high-rise city cores such as Hong Kong, Bangkok and Metro Manila.",
  energywater:   "Coal-fired power plants along water-stressed rivers in India.",
  pumping:       "Punjab and Haryana in northwest India, where groundwater tables have been falling for decades.",
  clinic:        "District and city hospitals during South Asia’s pre-monsoon heatwaves.",
  poverty:       "Construction sites, brick kilns, farms and street markets across South and Southeast Asia.",
  debt:          "Households without health insurance, where most medical costs are paid out of pocket.",
  energypoverty: "Tin-roofed informal settlements in cities such as Dhaka, Karachi and Mumbai.",
  displacement:  "Migrant settlements on the edges of fast-growing cities such as Dhaka.",
  school:        "School systems that closed classrooms during the 2024 heatwaves, including in the Philippines and Bangladesh.",
  sleep:         "Tropical cities whose nights stay hot, such as Bangkok, Chennai and Ho Chi Minh City.",
  invisible:     "Much of Asia, where death certificates rarely record heat as a cause.",
  reactive:      "Disaster budgets designed for floods and cyclones rather than heat.",
  protection:    "Fast-growing Asian economies where few households or small businesses carry insurance.",
  farmdebt:      "Rain-fed farming districts of India, Pakistan and Bangladesh, where a failed season often means borrowing from moneylenders."
};

/* ---------- 9. POLICY PACKAGES ---------- */
// Each package switches on a set of levers (ids from part 6) to show which loops break together.
const PACKAGES = [
  { id: "workers", title: "Protect workers",
    text: "Make it safe and affordable to stop working in dangerous heat.",
    levers: ["heatrules", "heatcash", "socialprotection", "freecare"] },
  { id: "cities", title: "Cool cities and homes",
    text: "Take heat out of streets, homes and nights.",
    levers: ["coolbydesign", "greencity", "affordablecool", "coolhousing", "coolnights"] },
  { id: "health", title: "Health first",
    text: "Warn early, prepare clinics and count every death.",
    levers: ["hap", "readyclinics", "freecare", "coolingcentres", "countdeaths"] },
  { id: "money", title: "Fix the money",
    text: "Fund prevention before the season, not the emergency after it.",
    levers: ["heatbudget", "anticipatory", "riskpools", "countdeaths", "farmcredit"] },
  { id: "families", title: "Protect children and families",
    text: "Keep children learning, households afloat and nights bearable.",
    levers: ["keepinschool", "socialprotection", "affordablecool", "coolnights"] },
  { id: "land", title: "Land, water and energy",
    text: "Stop nature and infrastructure from feeding the heat.",
    levers: ["emissions", "cleancool", "soilwater", "blackcarbon", "firesmart", "irrigate", "drypower", "pumpbackup"] }
];

/* ---------- 10. INSTITUTION PLAYBOOKS: Sense → Decide → Act → Sustain ---------- */
const PLAYBOOKS = {
  nat:       { sense: "Set national heat thresholds and link weather alerts to health and death data.",
               decide: "Recognise extreme heat as a disaster, with a budget set aside before each season.",
               act: "Enforce heat-safe work rules, cooling standards and free care for heat illness.",
               sustain: "Cut emissions, build social protection and keep heat in every national plan." },
  city:      { sense: "Map the hottest streets, homes and people, and who is most at risk.",
               decide: "Adopt and fund a city heat action plan with clear owners.",
               act: "Open cooling centres, shade streets, cool roofs and check on people living alone.",
               sustain: "Build heat into planning, building codes and housing upgrades." },
  health:    { sense: "Track heat illness and excess deaths in real time during heatwaves.",
               decide: "Trigger surge plans and outreach when forecasts cross danger levels.",
               act: "Prepare clinics with cooling, backup power and trained staff.",
               sustain: "Record heat on death certificates and train every frontline worker." },
  met:       { sense: "Forecast dangerous heat, including hot nights and humid heat.",
               decide: "Agree danger thresholds with health, labour and disaster agencies.",
               act: "Issue early, local warnings that trigger action, not just information.",
               sustain: "Keep improving forecasts and share data openly." },
  employers: { sense: "Measure heat at the workplace, not just the city forecast.",
               decide: "Set heat rules for rest, water, shade and hours before summer begins.",
               act: "Give paid breaks and move heavy work to cooler hours.",
               sustain: "Build heat into contracts, supply chains and workplace design." },
  workers:   { sense: "Collect members’ experiences of heat at work and at home.",
               decide: "Put heat protection on the bargaining table.",
               act: "Win paid rest, water, shade and income protection.",
               sustain: "Make heat rights part of every agreement and law." },
  utilities: { sense: "Forecast peak cooling demand and the points where the grid will fail.",
               decide: "Protect supply to clinics, water pumps and cooling centres first.",
               act: "Offer lifeline tariffs and demand response, and support efficient cooling.",
               sustain: "Shift to clean power that doesn’t depend on scarce water." },
  water:     { sense: "Monitor reservoirs, aquifers and pumping during hot spells.",
               decide: "Agree fair sharing of scarce water between homes, farms and power.",
               act: "Keep water flowing with backup power and emergency supply.",
               sustain: "Recharge aquifers and set fair pumping rules." },
  agri:      { sense: "Watch soil moisture and crop heat stress through the season.",
               decide: "Advise farmers when to plant, irrigate and protect animals.",
               act: "Spread mulching, agroforestry, efficient irrigation and heat-tolerant varieties.",
               sustain: "Restore soils and watersheds so land stays cooler." },
  schools:   { sense: "Monitor classroom temperatures and attendance in hot months.",
               decide: "Adjust timetables and calendars before heat closes schools.",
               act: "Cool classrooms and keep school meals going.",
               sustain: "Build cooler schools and support that keeps children enrolled." },
  insurers:  { sense: "Price heat risk with local data.",
               decide: "Design cover that pays out quickly when heat crosses a threshold.",
               act: "Offer parametric heat insurance to workers and small businesses.",
               sustain: "Share risk through public–private pools so cover stays available." },
  funders:   { sense: "Fund heat data and the tracking of deaths.",
               decide: "Prioritise prevention over emergency response.",
               act: "Finance cooling centres, clinics, cool housing and income protection.",
               sustain: "Back the institutions that deliver protection year after year." },
  community: { sense: "Know who lives alone, who works outside and who has no cooling.",
               decide: "Agree a neighbourhood plan for heatwaves.",
               act: "Check on neighbours, run cooling spaces and share warnings.",
               sustain: "Hold institutions to account and keep local knowledge alive." },
  intl:      { sense: "Track global warming and heat impacts across countries.",
               decide: "Agree standards on emissions, refrigerants and work in heat.",
               act: "Support countries to adopt and enforce those standards.",
               sustain: "Keep finance and technology flowing to the places most at risk." }
};

/* ---------- 11. A DAY IN A HEATWAVE (illustrative) ---------- */
// The people here are illustrative composites, not real individuals.
// loops: the vicious cycles in play (ids from part 4). levers: what would help (ids from part 6).
const HEATWAVE_DAY = [
  { time: "02:00", title: "The night that never cools",
    who: "A garment worker in Dhaka",
    text: "It is two in the morning and her tin-roofed room is still holding the day’s heat. She has barely slept, her body hasn’t recovered from yesterday, and the shift starts at seven.",
    fact: "Hot nights are dangerous because the body never gets the chance to recover from the day. Sleep-tracker data from 68 countries shows people sleep about 14 minutes less on nights above 30 °C, with bigger losses for older people and in lower-income countries.",
    source: { label: "Minor et al., One Earth, 2022", url: "https://orbit.dtu.dk/en/publications/rising-temperatures-erode-human-sleep-globally/" },
    loops: ["sleep", "energypoverty"], levers: ["coolnights", "affordablecool", "coolhousing"] },
  { time: "09:00", title: "Stop, or get paid",
    who: "A construction worker in Delhi",
    text: "By mid-morning the site is dangerously hot. Resting in the shade means losing part of the day’s wage, so he keeps carrying.",
    loops: ["poverty"], levers: ["heatrules", "heatcash"] },
  { time: "12:00", title: "School closes",
    who: "A girl in rural Bangladesh",
    text: "Her school shuts for the heat again. At home she fetches water and looks after her younger brothers, and after weeks like this her family starts to wonder whether she should go back at all.",
    loops: ["school"], levers: ["keepinschool"] },
  { time: "15:00", title: "The grid gives way",
    who: "A city at its peak",
    text: "Every air conditioner is running. The grid fails, water pumps stop and the district clinic loses its cooling just as heat cases arrive.",
    loops: ["cooling", "energywater", "clinic"], levers: ["coolbydesign", "greencity", "pumpbackup", "readyclinics", "hap"] },
  { time: "18:00", title: "The bill arrives",
    who: "A street food vendor in Bangkok",
    text: "Her stock spoiled in the heat, and her husband’s treatment for heat exhaustion last week was paid with a loan. Tomorrow she has to work longer.",
    loops: ["debt", "poverty"], levers: ["freecare", "socialprotection", "heatcash"] },
  { time: "22:00", title: "A death no one counts",
    who: "An older man living alone in Chennai",
    text: "He dies at home in a room that stayed hot all day. His death certificate will say heart failure, so it never shows up as a heat death.",
    loops: ["invisible"], levers: ["coolingcentres", "countdeaths"] }
];

/* ---------- 12. EVIDENCE BEHIND EACH VICIOUS CYCLE ---------- */
// For each loop: sources that support it. by: who published it and when. title: the source. url: the link. finding: what it shows.
// Only add sources you have opened and checked.
const EVIDENCE = {
  global: [
    { by: "International Energy Agency, 2018", title: "The Future of Cooling", url: "https://www.iea.org/reports/the-future-of-cooling",
      finding: "The world’s stock of air conditioners is set to grow from 1.6 billion to 5.6 billion by 2050, and the energy they use to triple, unless efficiency improves." }
  ],
  soil: [
    { by: "Seneviratne et al., Earth-Science Reviews, 2010", title: "Investigating soil moisture–climate interactions in a changing climate: a review", url: "https://doi.org/10.1016/j.earscirev.2010.02.004",
      finding: "Reviews the evidence that dry soils amplify hot temperatures: with less water to evaporate, more of the sun’s energy goes into heating the air." }
  ],
  ice: [
    { by: "ICIMOD, 2023", title: "Water, ice, society, and ecosystems in the Hindu Kush Himalaya: an outlook", url: "https://lib.icimod.org/record/36322",
      finding: "Glaciers lost ice 65% faster in the 2010s than in the decade before. At 1.5–2 °C of warming, glaciers across the region lose 30–50% of their volume by 2100." }
  ],
  fire: [
    { by: "UNEP and GRID-Arendal, 2022", title: "Spreading like Wildfire: The Rising Threat of Extraordinary Landscape Fires", url: "https://www.unep.org/resources/report/spreading-wildfire-rising-threat-extraordinary-landscape-fires",
      finding: "Climate change and land-use change are making wildfires worse. Extreme fires are projected to rise by up to 14% by 2030 and 50% by the end of the century." }
  ],
  cooling: [
    { by: "Salamanca et al., Journal of Geophysical Research, 2014 (summary by Arizona State University)", title: "Excess heat from air conditioners causes higher nighttime temperatures", url: "https://news.asu.edu/content/excess-heat-air-conditioners-causes-higher-nighttime-temperatures",
      finding: "In a Phoenix heatwave, waste heat from air conditioners raised night-time air temperatures by more than 1 °C in parts of the city." },
    { by: "International Energy Agency, 2018", title: "The Future of Cooling", url: "https://www.iea.org/reports/the-future-of-cooling",
      finding: "China, India and Indonesia are expected to account for half of the world’s air conditioners by 2050." }
  ],
  energywater: [
    { by: "World Resources Institute, 2018", title: "40% of India’s thermal power plants are in water-scarce areas, threatening shutdowns", url: "https://www.wri.org/insights/40-indias-thermal-power-plants-are-water-scarce-areas-threatening-shutdowns",
      finding: "14 of India’s 20 largest thermal utilities shut down at least once for lack of water between 2013 and 2016. Water shortages cost 14 TWh of power in 2016." }
  ],
  pumping: [
    { by: "Rodell, Velicogna and Famiglietti, Nature, 2009", title: "Satellite-based estimates of groundwater depletion in India", url: "https://www.nature.com/articles/nature08238",
      finding: "Satellites show Rajasthan, Punjab and Haryana lost 109 km³ of groundwater between 2002 and 2008, mainly to irrigation, while rainfall stayed close to normal." }
  ],
  clinic: [
    { by: "Lancet Countdown, The Lancet, 2024", title: "The 2024 report of the Lancet Countdown on health and climate change", url: "https://doi.org/10.1016/S0140-6736(24)01822-1",
      finding: "Heat-related deaths among people over 65 reached a record 167% above the 1990s level in 2023." },
    { by: "Hess et al., Journal of Environmental and Public Health, 2018", title: "Pilot evaluation of the impact of India’s first heat action plan on all-cause mortality", url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6236972/",
      finding: "After Ahmedabad’s heat action plan prepared hospitals and warned the public, an estimated 1,190 deaths a year were avoided." }
  ],
  poverty: [
    { by: "International Labour Organization, 2019", title: "Working on a warmer planet", url: "https://www.ilo.org/resource/news/increase-heat-stress-predicted-bring-productivity-loss-equivalent-80",
      finding: "Heat stress is projected to cost 2.2% of all working hours by 2030, equal to 80 million full-time jobs. South Asia is among the worst hit, losing about 5% of working hours." },
    { by: "Lancet Countdown, The Lancet, 2024", title: "The 2024 report of the Lancet Countdown on health and climate change", url: "https://doi.org/10.1016/S0140-6736(24)01822-1",
      finding: "Heat exposure put a record 512 billion potential labour hours at risk in 2023, with potential income losses of US$835 billion." }
  ],
  debt: [
    { by: "Selvaraj, Farooqui and Karan, BMJ Open, 2018", title: "Quantifying the financial burden of households’ out-of-pocket payments on medicines in India", url: "https://bmjopen.bmj.com/content/8/5/e018020",
      finding: "Medicine costs alone were catastrophic for 11.2% of Indian households in 2011–12, about 29 million households." }
  ],
  energypoverty: [
    { by: "Sustainable Energy for All, 2023", title: "Chilling Prospects: Global Access to Cooling Gaps 2023", url: "https://www.seforall.org/our-work/research-analysis/chilling-prospects-series/chilling-prospects-global-access-to-cooling-gaps-2023",
      finding: "1.12 billion of the rural and urban poor are at high risk because they lack access to cooling." }
  ],
  displacement: [
    { by: "World Bank, 2021", title: "Groundswell Part 2: Acting on Internal Climate Migration", url: "https://openknowledge.worldbank.org/handle/10986/36248",
      finding: "Without action, climate change could force up to 216 million people to move within their own countries by 2050, including about 40 million in South Asia." }
  ],
  school: [
    { by: "Park, Goodman, Hurwitz and Smith, American Economic Journal: Economic Policy, 2020", title: "Heat and Learning", url: "https://www.aeaweb.org/doi/10.1257/pol.20180612",
      finding: "Without air conditioning, each 1 °F hotter school year cuts that year’s learning by about 1%, and the losses fall hardest on disadvantaged students." },
    { by: "UNICEF, 2025", title: "Learning interrupted: global snapshot of climate-related school disruptions in 2024", url: "https://www.unicef.org/reports/learning-interrupted-global-snapshot-2024",
      finding: "Heatwaves disrupted schooling for an estimated 171 million students in 2024. South Asia was the most affected region." }
  ],
  sleep: [
    { by: "Minor et al., One Earth, 2022", title: "Rising temperatures erode human sleep globally", url: "https://orbit.dtu.dk/en/publications/rising-temperatures-erode-human-sleep-globally/",
      finding: "Data from 47,628 people in 68 countries shows hot nights shorten sleep, with bigger losses for older people and in lower-income countries." },
    { by: "Thompson et al., The Lancet Planetary Health, 2023 (summary by Imperial College London)", title: "Ambient temperature and mental health: a systematic review and meta-analysis", url: "https://www.imperial.ac.uk/news/246058/rising-temperatures-associated-with-poorer-mental/",
      finding: "A review of 114 studies links higher temperatures with poorer mental health, including higher suicide rates." }
  ],
  farmdebt: [
    { by: "Carleton, PNAS, 2017", title: "Crop-damaging temperatures increase suicide rates in India", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5565417/",
      finding: "Heat raises suicide rates in India only during the growing season, when it also cuts crop yields, pointing to farm income losses. The findings have been debated." },
    { by: "Lobell, Sibley and Ortiz-Monasterio, Nature Climate Change, 2012", title: "Extreme heat effects on wheat senescence in India", url: "https://fsi.stanford.edu/node/26622",
      finding: "Days above 34 °C make wheat in northern India age early, and crop models may underestimate yield losses at +2 °C by as much as 50%." }
  ],
  invisible: [
    { by: "Associated Press via PBS NewsHour, 2024", title: "India likely undercounts heat-related deaths, tempering its response, officials say", url: "https://www.pbs.org/newshour/world/india-likely-undercounts-heat-related-deaths-tempering-its-response-officials-say",
      finding: "In 2020, India’s crime records bureau recorded 530 heatstroke deaths while the disaster agency recorded four. Experts say the low counts weaken preparation." },
    { by: "Down To Earth, 2024", title: "Lost in the heat: the critical miscalculation in India’s heatwave mortality data", url: "https://www.downtoearth.org.in/climate-change/lost-in-the-heat-the-critical-miscalculation-in-indias-heatwave-mortality-data",
      finding: "Death certificates usually record only the immediate cause, such as heart failure, so heat as the trigger goes unrecorded." }
  ],
  reactive: [
    { by: "Global Commission on Adaptation, 2019", title: "Adapt Now: A Global Call for Leadership on Climate Resilience", url: "https://openknowledge.worldbank.org/entities/publication/7713887e-5c0c-5fce-9dd0-c18a8875736c",
      finding: "US$800 million spent on early warning systems in developing countries could avoid US$3–16 billion in losses every year." },
    { by: "UNEP and GRID-Arendal, 2022", title: "Spreading like Wildfire", url: "https://www.unep.org/resources/report/spreading-wildfire-rising-threat-extraordinary-landscape-fires",
      finding: "Direct response typically gets over half of wildfire spending, while planning and prevention get less than 1%." }
  ],
  protection: [
    { by: "Swiss Re Institute sigma, reported by Global Reinsurance", title: "Protection gap laid bare as Asian cat losses hit $65bn", url: "https://www.globalreinsurance.com/home/swiss-re-sigma-protection-gap-laid-bare-as-asian-cat-losses-hit-65bn/1458440.article",
      finding: "Only about 8% of Asia’s US$65 billion in natural catastrophe losses in 2025 was insured. The rest fell on households, businesses and governments." }
  ]
};

/* ---------- 13. THE HEAT NETWORK: organisations already acting ---------- */
// role: one of the ORG_ROLES ids. levers: the breaking points (part 6) their work pulls on.
// url: a page that shows their heat work. levers can be empty ([]) for funders who back others' work.
// Only add organisations whose heat work you have checked.
const ORG_ROLES = [
  { id: "global",   name: "Global networks and organisations" },
  { id: "asia",     name: "Governments and regional bodies in Asia" },
  { id: "research", name: "Research and evidence" },
  { id: "ground",   name: "Working on the ground" },
  { id: "finance",  name: "Insurance and finance" },
  { id: "funders",  name: "Philanthropy and funders" }
];

const ORGANISATIONS = [
  { id: "ghhin", role: "global", name: "Global Heat Health Information Network (WHO, WMO and NOAA)", url: "https://ghhin.org",
    does: "A member-driven forum of scientists, practitioners and policymakers that shares guidance and heat-health action plans.", levers: ["hap", "readyclinics"] },
  { id: "ilo", role: "global", name: "International Labour Organization", url: "https://www.ilo.org/resource/news/increase-heat-stress-predicted-bring-productivity-loss-equivalent-80",
    does: "Sets out the evidence and standards for protecting workers from heat stress.", levers: ["heatrules"] },
  { id: "unicef", role: "global", name: "UNICEF", url: "https://www.unicef.org/reports/learning-interrupted-global-snapshot-2024",
    does: "Tracks how heatwaves and other climate hazards disrupt children’s schooling.", levers: ["keepinschool"] },
  { id: "zcra", role: "global", name: "Zurich Climate Resilience Alliance", url: "https://practicalaction.org/news-stories/zurich-climate-resilience-alliance-to-expand-focus-on-destructive-extreme-heat/",
    does: "An alliance of humanitarian, development and research partners with Zurich Insurance Group. In 2024 it expanded from floods to extreme heat, with work in countries including Bangladesh and Nepal.", levers: ["hap", "anticipatory", "heatbudget"] },
  { id: "hera", role: "global", name: "Heat Resilience Action (HERA), formerly Climate Resilience for All", url: "https://heranow.org/resources/as-extreme-heat-threats-grow-can-heat-insurance-offer-protection/",
    does: "Works on extreme heat with a focus on women and low-income communities. With SEWA and Swiss Re, it combined insurance payouts and cash for lost income after India’s 2024 heatwaves.", levers: ["heatcash", "hap"] },
  { id: "coolcoalition", role: "global", name: "UNEP Cool Coalition", url: "https://coolcoalition.org",
    does: "A global network for clean, efficient cooling and cooler cities. It runs its own city initiative, also called Beat the Heat, which is separate from this site.", levers: ["cleancool", "coolbydesign", "greencity"] },
  { id: "climatecentre", role: "global", name: "Red Cross Red Crescent Climate Centre", url: "https://preparecenter.org/resource/heatwave-guide-for-cities",
    does: "Wrote the Heatwave Guide for Cities with more than 25 partners, covering how cities prepare for, respond to and learn from heatwaves.", levers: ["hap", "coolingcentres"] },
  { id: "seforall", role: "global", name: "Sustainable Energy for All", url: "https://www.seforall.org/our-work/research-analysis/chilling-prospects-series/chilling-prospects-global-access-to-cooling-gaps-2023",
    does: "Measures who lacks access to cooling through its Chilling Prospects series.", levers: ["affordablecool"] },
  { id: "iea", role: "global", name: "International Energy Agency", url: "https://www.iea.org/reports/the-future-of-cooling",
    does: "Analyses cooling demand and how efficiency standards can cut it.", levers: ["cleancool"] },

  { id: "ndma", role: "asia", name: "National Disaster Management Authority, India", url: "https://ndma.gov.in",
    does: "Issues national guidance for state and city heat action plans.", levers: ["hap"] },
  { id: "ndrrma", role: "asia", name: "National Disaster Risk Reduction and Management Authority, Nepal", url: "https://english.onlinekhabar.com/reassessing-nepals-heat-wave-response-lessons-from-2024-and-the-way-forward.html",
    does: "Issued Nepal’s first federal heat plan in 2024.", levers: ["hap"] },
  { id: "ahmedabad", role: "asia", name: "Ahmedabad Municipal Corporation, with IIPH Gandhinagar and NRDC", url: "https://www.nrdc.org/press-releases/new-evidence-shows-pioneering-heat-action-plan-helps-millions-avoid-killer-heat",
    does: "Launched South Asia’s first heat action plan in 2013: early warnings, public outreach and training for medical staff.", levers: ["hap", "readyclinics"] },
  { id: "dncc", role: "asia", name: "Dhaka North City Corporation", url: "https://www.dhakatribune.com/bangladesh/310693/arsht-rock-bangladesh%E2%80%99s-first-chief-heat-officer",
    does: "Appointed Asia’s first Chief Heat Officer in 2023, focused on cooling the poorest neighbourhoods.", levers: ["greencity"] },
  { id: "bdrcs", role: "asia", name: "Bangladesh Red Crescent Society", url: "https://www.atachcommunity.com/our-impact/case-studies/bangladesh-early-action-protocol-for-heat-events/",
    does: "Runs an early action protocol for heat, first activated in April 2024 during Dhaka’s longest recorded heatwave.", levers: ["anticipatory", "coolingcentres"] },
  { id: "icimod", role: "asia", name: "ICIMOD", url: "https://www.downtoearth.org.in/climate-change/existing-solutions-could-slash-soot-emissions-by-80-by-2030-icimod",
    does: "Monitors the Himalaya’s snow and ice, and helps brick kilns switch to cleaner technology that cuts the soot darkening the glaciers.", levers: ["blackcarbon"] },
  { id: "adb", role: "asia", name: "Asian Development Bank", url: "https://www.preventionweb.net/publication/beating-heat-investing-pro-poor-solutions-urban-resilience",
    does: "Supports heat resilience in Asian cities, including technical assistance on heat stress among women and girls in Bangladesh, Cambodia, Pakistan, Sri Lanka and Tajikistan.", levers: ["greencity", "heatbudget"] },
  { id: "escap", role: "asia", name: "UN ESCAP", url: "https://unescap.org/our-work/environment-development/cities-for-a-sustainable-future/addressing-urban-extreme-heat",
    does: "Helps fast-growing cities in South and Southeast Asia plan for extreme urban heat, working with Iloilo City and Cox’s Bazar.", levers: ["hap"] },
  { id: "imd", role: "asia", name: "India Meteorological Department and IITM Pune", url: "https://wmo.int/node/38332",
    does: "Issue India’s heatwave forecasts and work with WHO and WMO on the South Asia Climate–Health Desk.", levers: ["hap", "anticipatory"] },
  { id: "pagasa", role: "asia", name: "PAGASA, Philippines", url: "https://www.gmanetwork.com/regionaltv/news/115185/pagasa-urges-public-to-brace-for-more-intense-heat/story/",
    does: "Issues heat index warnings with danger levels that local governments use to decide when to suspend classes.", levers: ["hap"] },
  { id: "mom", role: "asia", name: "Ministry of Manpower, Singapore", url: "https://www.mom.gov.sg/newsroom/press-releases/2023/1024-enhanced-measures-to-reduce-heat-stress-for-outdoor-workers",
    does: "Requires hourly heat checks on outdoor worksites, shaded rest breaks when heat stress is high, and time for new workers to acclimatise, and enforces the rules.", levers: ["heatrules"] },

  { id: "ceew", role: "research", name: "Council on Energy, Environment and Water (CEEW)", url: "https://www.ceew.in/press-release/mapping-climate-risks-and-impacts-of-extreme-heatwave-disaster-in-indian-districts",
    does: "Assessed heat risk in all 734 districts of India in 2025, and has studied heat-health action in Nepal, to help plans target the places at most risk.", levers: ["hap"] },
  { id: "lancet", role: "research", name: "Lancet Countdown", url: "https://doi.org/10.1016/S0140-6736(24)01822-1",
    does: "Tracks heat deaths, lost working hours and other health impacts of climate change every year.", levers: ["countdeaths"] },
  { id: "nushrpc", role: "research", name: "NUS Heat Resilience & Performance Centre", url: "https://medicine.nus.edu.sg/newsletters/issue54/dossier/nus-centre-designated-southeast-asia-hub-for-global-heat-health-info-exchange",
    does: "Hosts the Southeast Asia Hub of the Global Heat Health Information Network, bringing governments and partners together on heat and health.", levers: ["hap", "heatrules"] },
  { id: "icddrb", role: "research", name: "icddr,b", url: "https://www.rockefellerfoundation.org/perspective/who-owns-the-response-to-heat-in-bangladesh-everyone-does/",
    does: "Works with Bangladesh’s Department of Agricultural Extension and others on HeatShield, which helps farmers cope with extreme heat.", levers: ["heatrules"] },
  { id: "brac", role: "research", name: "BRAC James P Grant School of Public Health", url: "https://www.ceew.in/sites/default/files/ceew-sfc-nrdc-unescap-brac-jpgsph-ghhin-countries-synthesis-press-release.pdf",
    does: "Part of a South Asian partnership with CEEW, NRDC, UN ESCAP and the Global Heat Health Information Network assessing heat-health action across countries.", levers: ["hap"] },
  { id: "iiser", role: "research", name: "IISER Pune", url: "https://wmo.int/node/38332",
    does: "Leads the South Asia Scientific Research Consortium on how heat affects different populations, with Rockefeller Foundation support.", levers: [] },
  { id: "iied", role: "research", name: "International Institute for Environment and Development (IIED)", url: "https://www.iied.org/node/83215",
    does: "Has researched the health and economic toll of heat stress on informal workers in urban Bangladesh.", levers: ["heatrules"] },
  { id: "usyd", role: "research", name: "Heat and Health Research Centre, University of Sydney", url: "https://www.sydney.edu.au/news-opinion/news/2025/10/21/garment-factories-are-sweltering--these-simple-fixes-could-keep-.html",
    does: "Tested low-cost cooling for Bangladeshi garment workers: fans, drinking water and reflective roofs recovered much of the 12–15% output lost to heat.", levers: ["heatrules", "coolbydesign"] },
  { id: "salata", role: "research", name: "Salata Institute, Harvard University", url: "https://salatainstitute.harvard.edu/wp-content/uploads/2026/04/April-2026-Critical-Perspectives-on-Extreme-Heat-in-India_web.pdf",
    does: "Published Critical Perspectives on Extreme Heat in India in 2026, covering heat action plans, insurance and informal work.", levers: [] },
  { id: "wriindia", role: "research", name: "WRI India", url: "https://india.mongabay.com/2025/04/safeguarding-indian-cities-from-heat-in-conversation-with-sudeshna-chatterjee-interview/",
    does: "Works on heat mitigation planning with Indian cities, including greening and cooling pilots in Kochi and Mumbai and the Bengaluru Heat Collective.", levers: ["greencity", "hap"] },
  { id: "gbl", role: "research", name: "Good Business Lab", url: "https://lirneasia.net/futureworksasia/projects/heat-health-and-gender/",
    does: "Researching heat, health and gender in India’s and Bangladesh’s garment sector, 2025–2027.", levers: ["heatrules"] },

  { id: "practicalaction", role: "global", name: "Practical Action", url: "https://practicalaction.org/news-stories/zurich-climate-resilience-alliance-to-expand-focus-on-destructive-extreme-heat/",
    does: "Connects heat risk intelligence, local action, practical technology, institutions and finance, following a Sense → Decide → Act → Sustain logic. In Nepal, Dhangadhi’s heat action plan links temperature, humidity and health data, hotspot mapping and community views to thresholds and set municipal responses. In Bangladesh, heat is being built into early warning and livelihood work. A partner in the Zurich Climate Resilience Alliance.", levers: ["hap", "heatbudget", "coolbydesign", "greencity"] },
  { id: "pci", role: "global", name: "People’s Courage International", url: "https://www.weforum.org/organizations/peoples-courage-international/",
    does: "Works on safe migration and labour protection for migrant workers in South and Southeast Asia. Its Migrants Resilience Collaborative supports more than seven million households.", levers: ["socialprotection"] },
  { id: "worldbank", role: "global", name: "World Bank", url: "https://www.worldbank.org/en/region/sar/publication/a-livable-future-protecting-jobs-and-growth-from-extreme-heat-in-south-asia-s-cities",
    does: "Its 2026 report A Livable Future finds extreme heat already costs South Asia the equivalent of about 31 million full-time jobs a year, and sets out how cities can protect jobs and growth.", levers: ["greencity", "heatbudget"] },
  { id: "wmo", role: "global", name: "World Meteorological Organization", url: "https://wmo.int/node/38332",
    does: "With WHO, runs the South Asia Climate–Health Desk with India’s meteorological agencies, turning weather and climate information into health protection.", levers: ["hap"] },
  { id: "c40", role: "global", name: "C40 Cities", url: "https://www.deccanherald.com/india/karnataka/bengaluru/bengaluru-joins-global-coalition-to-beat-extreme-heat-3786724",
    does: "Its Cool Cities Accelerator brings together cities including Ahmedabad, Bengaluru, Mumbai and Singapore on early warnings, building standards and tree cover.", levers: ["greencity", "coolbydesign", "hap"] },
  { id: "vital", role: "global", name: "Vital Strategies", url: "https://www.nationthailand.com/pr-news/40071201",
    does: "Through the Partnership for Healthy Cities, supports Bangkok to pilot heat-health action in high-risk districts: outdoor worker protection, cooling spaces and drinking water.", levers: ["heatrules", "coolingcentres"] },
  { id: "gbpn", role: "global", name: "Global Buildings Performance Network", url: "https://gbpn.org/news-gbpn-sharpens-its-focus-decarbonising-housing-india-and-south-east-asia",
    does: "Works on residential building codes in India and Southeast Asia, where demand for cooling homes is rising fastest.", levers: ["coolbydesign"] },
  { id: "startnetwork", role: "global", name: "Start Network", url: "https://startnetwork.org/news-and-blogs/getting-ahead-deadly-heat",
    does: "Its members run heatwave anticipatory action in Pakistan, releasing funds automatically when forecasts cross agreed triggers.", levers: ["anticipatory"] },
  { id: "mercycorps", role: "global", name: "Mercy Corps", url: "https://europe.mercycorps.org/sites/default/files/2025-09/too-hot-to-ignore.pdf",
    does: "A Zurich Climate Resilience Alliance partner leading work on extreme heat in Nepal, where the southern plains passed 40 °C on 50 days in 2024.", levers: ["hap", "anticipatory"] },
  { id: "sewa", role: "ground", name: "Self Employed Women’s Association (SEWA)", url: "https://www.swissre.com/our-business/public-sector-solutions/insights/parametric-structure-for-sewa-in-south-east-asia.html",
    does: "Protects women informal workers’ income in heatwaves. After the May 2024 heatwaves, more than 46,000 members received insurance payouts.", levers: ["heatcash"] },
  { id: "mht", role: "ground", name: "Mahila Housing Trust", url: "https://citizenmatters.in/new-cool-roof-solutions-heat-in-informal-settlements/",
    does: "Cools homes in informal settlements with reflective and modular roofs, and runs heat income insurance for women workers.", levers: ["coolhousing", "heatcash"] },
  { id: "adra", role: "ground", name: "ADRA India", url: "https://adraindia.org/anticipatory-heatwave-response-in-2025/",
    does: "Ran an anticipatory heatwave response in 2025 with national and district authorities.", levers: ["anticipatory"] },
  { id: "homenet", role: "ground", name: "HomeNet Thailand", url: "https://www.wiego.org/research-library-publications/climate-change-and-heat-stress-impacts-bangkok-thailand/",
    does: "With WIEGO, surveyed more than 1,000 informal workers in Bangkok on heat: nearly 80% had cut their hours. A trusted link between workers and authorities.", levers: ["heatrules", "socialprotection"] },
  { id: "aidmi", role: "ground", name: "All India Disaster Mitigation Institute (AIDMI)", url: "https://microinsurancenetwork.org/events/all-india-disaster-mitigation-institute-and-microinsurance-network-virtual-roundtable-on-small-heat-resilience-measures-big-impact-in-small-towns-and-on-small-businesses-in-india",
    does: "Works on heat resilience for small towns and small businesses in India, with the Microinsurance Network.", levers: [] },

  { id: "crc", role: "finance", name: "Atlantic Council Climate Resilience Center (formerly Arsht-Rock)", url: "https://onebillionresilient.org/project/extreme-heat-protection-initiative/",
    does: "Places Chief Heat Officers in cities, and with SEWA tested the world’s first parametric insurance for extreme heat in 2023.", levers: ["heatcash", "hap"] },
  { id: "swissre", role: "finance", name: "Swiss Re", url: "https://www.swissre.com/our-business/public-sector-solutions/insights/parametric-structure-for-sewa-in-south-east-asia.html",
    does: "Designed heat insurance for SEWA members with payout triggers set for each of 23 locations’ own climate.", levers: ["heatcash"] },
  { id: "ibisa", role: "finance", name: "IBISA", url: "https://www.icmif.org/news_story/ibisa-launches-a-new-parametric-heat-index-product-in-india-to-protect-women-workers-from-heat-induced-wage-losses/",
    does: "Launched a parametric heat-index product in Ahmedabad in 2024 that pays women workers when heat cuts their working hours.", levers: ["heatcash"] },
  { id: "icicilombard", role: "finance", name: "ICICI Lombard", url: "https://www.icmif.org/news_story/ibisa-launches-a-new-parametric-heat-index-product-in-india-to-protect-women-workers-from-heat-induced-wage-losses/",
    does: "Carries the risk on heat insurance for women workers in India, including IBISA’s heat-index product.", levers: ["heatcash"] },
  { id: "howden", role: "finance", name: "Howden", url: "https://www.howdengroup.com/uk-en/news-insights/article-name/parametric-insurance-for-extreme-heat-protecting-people-in-a-warming-world",
    does: "Insurance broker working on parametric heat insurance and catastrophe bonds that give local governments and relief organisations money to act during heatwaves.", levers: ["riskpools", "anticipatory"] },
  { id: "cpi", role: "finance", name: "Climate Policy Initiative", url: "https://www.climatepolicyinitiative.org/financing-indias-heat-resilience/",
    does: "Analyses how heat resilience in India is financed, and where money is missing.", levers: ["heatbudget"] },

  { id: "prudence", role: "funders", name: "Prudence Foundation", url: "https://www.prudentialplc.com/en/newsroom/company-news/2024/prudential-advances-climate-resilience-efforts-in-asia-and-africa-with-us-million-investment-to-address-impacts-of-climate-change-on-health/",
    does: "Funds heat-health early warnings for women informal workers in India, sent mainly over WhatsApp and reaching 50,000 women, and research with the Red Cross Red Crescent on heat, humidity and health.", levers: ["hap", "heatcash"] },
  { id: "paa", role: "funders", name: "Philanthropy Asia Alliance", url: "https://www.eco-business.com/press-releases/philanthropy-asia-alliance-supports-southeast-asia-heat-health-hub-to-scale-coordinated-action-on-extreme-heat/",
    does: "Backs the Southeast Asia Heat Health Hub, the first regional hub of the Global Heat Health Information Network, and convenes funders on heat resilience.", levers: ["hap"] },
  { id: "temasektrust", role: "funders", name: "Temasek Trust (through Temasek Foundation)", url: "https://www.temasektrust.org.sg/what-we-do/impact-hub/article-details/the-liveability-challenge-2025-passive-cooling-hydrogen-storage-innovations",
    does: "Its Liveability Challenge funds cooling innovations for extreme heat, such as passive cooling paints.", levers: ["coolbydesign", "cleancool"] },
  { id: "rnp", role: "funders", name: "Rohini Nilekani Philanthropies", url: "https://rohininilekaniphilanthropies.org/resources/alliance-magazine-a-heat-justice-compass-for-philanthropic-action/",
    does: "Funds heat work in India, including Prayas Energy and Health Group’s work with street vendors and construction workers, and CEEW’s district heat risk assessment.", levers: ["heatrules", "hap"] },
  { id: "htparekh", role: "funders", name: "HT Parekh Foundation", url: "https://indiaclimatecollaborative.org/blog/climate-funder-ht-parekh-foundation-on-heat",
    does: "Its flagship ReVIVE programme tackles urban heat in India’s smaller cities through research, cooling solutions, demonstration projects and policy advocacy.", levers: ["greencity", "coolbydesign", "hap"] },
  { id: "rainmatter", role: "funders", name: "Rainmatter Foundation", url: "https://rainmatter.org/blog/tag/heat/",
    does: "Funds climate and environment work in India. Its partners’ heat work includes heatwave workshops that help journalists and health experts report on extreme heat.", levers: [] },
  { id: "chfc", role: "funders", name: "Climate & Health Funders Coalition", url: "https://wellcome.org/engagement-and-advocacy/advocacy-and-partnerships/climate-health-funders-coalition",
    does: "Launched at COP30 with US$300 million in initial funding. Extreme heat is a core priority. Members include CIFF, the Gates Foundation, Philanthropy Asia Alliance, the Rockefeller Foundation and Wellcome.", levers: [] },
  { id: "ciff", role: "funders", name: "Children’s Investment Fund Foundation", url: "https://climateworks.org/press-release/statement-on-the-united-nations-secretary-generals-call-to-action-for-extreme-heat/",
    does: "A member of the Climate & Health Funders Coalition, focused on the growing danger extreme heat poses to pregnant mothers, infants and children.", levers: [] },
  { id: "climateworks", role: "funders", name: "ClimateWorks Foundation", url: "https://www.climateworks.org/blog/meet-the-grantees-from-our-global-call-for-extreme-heat-solutions/",
    does: "Its Adaptation & Resilience Fund made extreme heat its first focus, awarding US$9.3 million for parametric insurance, adaptive social protection, heat action plans and early warnings.", levers: ["heatcash", "socialprotection", "hap"] },
  { id: "rockefeller", role: "funders", name: "The Rockefeller Foundation", url: "https://wmo.int/node/38332",
    does: "Funds the South Asia Climate–Health Desk with Wellcome and a heat research consortium at IISER Pune, and supported C40’s Cool Cities Accelerator.", levers: ["hap"] },
  { id: "wellcome", role: "funders", name: "Wellcome", url: "https://wellcome.org/insights/articles/ps17m-global-research-climate-change-and-maternal-and-child-health",
    does: "Funds research on heat and health, including £17 million across nine projects on how extreme heat affects pregnant women and children.", levers: [] },
  { id: "laudes", role: "funders", name: "Laudes Foundation", url: "https://icccad.net/programmes/just-transition/capacitating-garment-workers/",
    does: "Funds a three-year project with ICCCAD that builds Bangladeshi garment workers’ capacity on climate change, including heat stress, and on labour rights.", levers: ["heatrules"] }
];

/* ---------- 14. PLAIN-LANGUAGE GLOSSARY ---------- */
// Terms are explained wherever they appear in the map's text. match: the words to look for.
const GLOSSARY = [
  { match: "heatstroke", text: "A medical emergency. The body’s core temperature rises above about 40 °C and its cooling system fails. Without fast cooling it can kill or cause lasting organ damage." },
  { match: "heat exhaustion", text: "The stage before heatstroke: heavy sweating, weakness, dizziness and nausea. Rest, water and cooling usually bring recovery." },
  { match: "heat stress", text: "When the body takes in or makes more heat than it can shed, from hot air, humidity, sun and physical work." },
  { match: "heat action plan", text: "A city’s or country’s plan for the heat season: who issues warnings, at what temperature, and what hospitals, employers and services do next." },
  { match: "cooling centre", text: "A public place, such as a library, school or community hall, kept cool during heatwaves for people with no cool space at home." },
  { match: "anticipatory", text: "Anticipatory action means acting on a forecast, before a disaster peaks, by releasing pre-agreed money and help when a trigger is reached." },
  { match: "parametric", text: "Parametric insurance pays out automatically when a measured trigger, such as a temperature threshold, is crossed. There is no claim form and no damage assessment." },
  { match: "risk pool", text: "A group of countries, cities or insurers that share the cost of disasters, so no single member carries a catastrophe alone." },
  { match: "social protection", text: "Public support such as pensions, cash transfers and unemployment benefits that keeps households out of poverty when income stops." },
  { match: "black carbon", text: "Soot from diesel, wood, coal and brick kilns. It warms the air, and when it settles on snow and ice it darkens them so they melt faster." },
  { match: "aquifer", text: "Underground layers of rock or sand that hold groundwater, the water that wells and pumps draw from." },
  { match: "refrigerant", text: "The fluid inside air conditioners and fridges that carries heat away. Many common ones are powerful greenhouse gases if they leak." },
  { match: "agroforestry", text: "Growing trees alongside crops or livestock. The trees shade the soil, help it hold moisture and give farmers another source of income." }
];
