/* ==========================================================
   Extreme heat is a wicked problem — interactive systems map
   Plain JavaScript. No libraries, no build step.

   To change any wording on the map, edit the DATA section
   just below. Everything else draws itself from it.
   ========================================================== */

/* ---------------- DATA ---------------- */

// Colours come from the heat-risk palette (see styles.css).
// The four systems use quiet, muted tones so that the meaningful colours
// (red = vicious cycle, teal = where it breaks, blue = hidden links) stand out.
const SYSTEMS = {
  hub:    { name: "Extreme heat",         color: "#16202B", tint: "#F26430" },
  nature: { name: "Nature and land",      color: "#3E6B4F", tint: "#DCE8DF" },
  health: { name: "Health and wellbeing", color: "#8A3340", tint: "#F3D9DC" },
  cities: { name: "Cities and systems",   color: "#4B5866", tint: "#DFE3E8" },
  work:   { name: "Work and economy",     color: "#7A4E1E", tint: "#F6E7D7" }
};

// kind: "hub" (centre), "domain" (the four systems) or "leaf" (a consequence)
// label: use \n to break the line inside the bubble
const NODES = [
  { id: "heat", sys: "hub", kind: "hub", label: "Extreme\nheat", x: 750, y: 560,
    desc: "Long stretches of dangerous heat, by day and by night. It doesn’t strike one sector. It presses on every system at once, and several of its consequences feed it back." },

  /* Nature and land */
  { id: "nature", sys: "nature", kind: "domain", label: "Nature and land", x: 750, y: 315,
    desc: "Heat dries land, warms seas and stresses the ecosystems that feed, water and shelter us." },
  { id: "crop", sys: "nature", label: "Crop and livestock\nlosses", x: 175, y: 88,
    desc: "Heat stress cuts yields, kills livestock and lowers milk and egg output: direct hits to rural incomes and food supply." },
  { id: "droughts", sys: "nature", label: "Droughts and\nwater scarcity", x: 430, y: 88,
    desc: "Higher temperatures speed up evaporation, so the same rain goes less far. Wells, rivers and reservoirs fall." },
  { id: "wildfires", sys: "nature", label: "Wildfires", x: 750, y: 72,
    desc: "Hot, dry vegetation ignites more easily and burns longer, sending smoke far beyond the fire itself." },
  { id: "glacier", sys: "nature", label: "Glacier melt and\nwater stress", x: 1075, y: 88,
    desc: "Mountain glaciers that feed rivers through the dry season are shrinking, threatening water supplies downstream." },
  { id: "biodiversity", sys: "nature", label: "Biodiversity\nloss", x: 1340, y: 88,
    desc: "Species that can’t move or adapt fast enough decline, weakening the pollination, soils and fisheries people depend on." },
  { id: "marine", sys: "nature", label: "Marine heatwaves\nand coral bleaching", x: 330, y: 218,
    desc: "Ocean heatwaves bleach coral and drive fish away, hitting coastal livelihoods and a vital source of protein." },
  { id: "drying", sys: "nature", label: "Drying soils and\nfailing harvests", x: 1170, y: 218,
    desc: "Heat pulls moisture from the soil when crops need it most, so harvests shrink even before a drought is declared." },

  /* Health and wellbeing */
  { id: "health", sys: "health", kind: "domain", label: "Health and wellbeing", x: 385, y: 560,
    desc: "The human body has limits. Heat strains the heart, the kidneys and the mind, and the services built to care for them." },
  { id: "kidney", sys: "health", label: "Kidney and\nheart strain", x: 150, y: 352,
    desc: "Sweating and dehydration make the heart work harder and can damage the kidneys, especially with repeated exposure." },
  { id: "pregnancy", sys: "health", label: "Risks in\npregnancy", x: 420, y: 400,
    desc: "Extreme heat is linked to higher risks of preterm birth and other pregnancy complications." },
  { id: "mental", sys: "health", label: "Mental health\nand violence", x: 135, y: 482,
    desc: "Heat is linked to more irritability, anxiety, conflict and violence, and to worse outcomes for people living with mental illness." },
  { id: "sleepless", sys: "health", label: "Sleepless\nhot nights", x: 128, y: 645,
    desc: "When nights stay hot, the body never recovers from the day, so the next day starts already depleted." },
  { id: "hsys", sys: "health", label: "Health systems\noverwhelmed", x: 430, y: 712,
    desc: "Heatwaves bring surges of patients just as staff, power and supplies are under strain." },
  { id: "heatstroke", sys: "health", label: "Heatstroke and\nheat exhaustion", x: 150, y: 818,
    desc: "When the body can no longer cool itself, heat exhaustion can tip into heatstroke: a medical emergency that can kill." },

  /* Cities and systems */
  { id: "cities", sys: "cities", kind: "domain", label: "Cities and systems", x: 1115, y: 560,
    desc: "Concrete, crowding and overstretched infrastructure turn cities into amplifiers of heat." },
  { id: "demand", sys: "cities", label: "Rising demand\nfor cooling", x: 1085, y: 398,
    desc: "As temperatures climb, so does the demand for fans and air conditioning, pushing electricity use to new peaks." },
  { id: "uhi", sys: "cities", label: "Urban heat\nislands", x: 1372, y: 312,
    desc: "Dense surfaces, little shade and waste heat keep city cores several degrees hotter than their surroundings, especially at night." },
  { id: "power", sys: "cities", label: "Power cuts and\ngrid stress", x: 1370, y: 448,
    desc: "Peak demand and heat-stressed equipment push grids to the edge. Outages switch off cooling exactly when it matters most." },
  { id: "smog", sys: "cities", label: "Smoke, smog and\nair pollution", x: 1078, y: 718,
    desc: "Heat speeds up the chemistry that forms ground-level ozone, and still, hot air traps pollution and wildfire smoke." },
  { id: "water", sys: "cities", label: "Water and transport\nsystems strained", x: 1352, y: 690,
    desc: "Pipes, pumps, roads and rails fail or slow down in extreme heat, just as the demand for water soars." },
  { id: "homes", sys: "cities", label: "Homes that\ntrap heat", x: 1372, y: 818,
    desc: "Tin roofs, poor ventilation and crowded rooms can make homes hotter inside than out, leaving nowhere safe to rest." },

  /* Work and economy */
  { id: "work", sys: "work", kind: "domain", label: "Work and economy", x: 750, y: 812,
    desc: "Heat slows hands, closes worksites and squeezes the incomes of those with the least margin." },
  { id: "debt", sys: "work", label: "Medical costs\nand debt", x: 432, y: 860,
    desc: "Treatment, medicines and lost days are often paid for out of pocket, pushing households into debt." },
  { id: "lost", sys: "work", label: "Lost work hours\nand wages", x: 195, y: 960,
    desc: "The International Labour Organization projects that heat stress could cut 2.2% of all working hours worldwide by 2030, the equivalent of 80 million full-time jobs." },
  { id: "informal", sys: "work", label: "Informal workers\ncan’t stop work", x: 470, y: 975,
    desc: "Without paid leave, contracts or savings, stopping work means losing the day’s income. So people keep working through dangerous heat." },
  { id: "food", sys: "work", label: "Food insecurity\nand price spikes", x: 760, y: 972,
    desc: "Smaller harvests and disrupted supply push up prices, and the poorest households spend the largest share of their income on food." },
  { id: "children", sys: "work", label: "Children miss\nschool", x: 1040, y: 965,
    desc: "Classrooms become too hot to learn in, schools close during heatwaves, and some children are pulled into work." },
  { id: "supply", sys: "work", label: "Supply chains\ndisrupted", x: 1325, y: 945,
    desc: "Heat slows factories, ports, roads and warehouses. The delays ripple through prices and jobs far away." },
  { id: "care", sys: "work", label: "Care burden falls\non women", x: 330, y: 1082,
    desc: "When people fall ill or water runs short, the extra caring, fetching and nursing usually falls on women and girls." },
  { id: "inequality", sys: "work", label: "Deepening\ninequality", x: 760, y: 1085,
    desc: "Every impact lands hardest on those with the least protection, widening gaps in health, income and opportunity." },
  { id: "migration", sys: "work", label: "Forced\nmigration", x: 1150, y: 1080,
    desc: "When land, work and water fail, families may be forced to move, often into cities that are hotter still." }
];

// [from, to, type, why, bend]
// type: hub | direct | knock (knock-on effect) | vicious (a link that closes a vicious cycle) | cross (hidden cross-system link)
const EDGES = [
  ["heat", "nature", "hub"], ["heat", "health", "hub"], ["heat", "cities", "hub"], ["heat", "work", "hub"],

  ["nature", "crop", "direct"], ["nature", "droughts", "direct"], ["nature", "wildfires", "direct"],
  ["nature", "glacier", "direct"], ["nature", "biodiversity", "direct"], ["nature", "marine", "direct"],
  ["nature", "drying", "direct"],
  ["droughts", "crop", "knock", "Less water for fields and animals."],
  ["droughts", "wildfires", "knock", "Parched land and vegetation burn more easily.", -0.12],
  ["wildfires", "glacier", "knock", "Soot settling on ice darkens it, so it absorbs more sunlight and melts faster.", -0.12],
  ["drying", "biodiversity", "knock", "Dry, degraded soils support less life above and below ground."],

  ["health", "kidney", "direct"], ["health", "pregnancy", "direct"], ["health", "mental", "direct"],
  ["health", "sleepless", "direct"], ["health", "hsys", "direct"], ["health", "heatstroke", "direct"],
  ["pregnancy", "kidney", "knock", "Pregnancy already puts extra load on the heart and kidneys. Heat adds to it."],
  ["sleepless", "mental", "knock", "Poor sleep wears down mood, patience and the ability to cope.", 0.3],
  ["sleepless", "heatstroke", "knock", "Without cool nights, the body starts each day already overheated."],

  ["cities", "demand", "direct"], ["cities", "uhi", "direct"], ["cities", "power", "direct"],
  ["cities", "smog", "direct"], ["cities", "water", "direct"], ["cities", "homes", "direct"],
  ["water", "homes", "knock", "When water and transport fail, people are stuck at home, and many homes trap heat."],

  ["work", "lost", "direct", undefined, -0.1], ["work", "informal", "direct"], ["work", "food", "direct"],
  ["work", "children", "direct"], ["work", "supply", "direct"],
  ["informal", "care", "direct", "When workers fall ill, someone has to care for them, and it is usually women."],
  ["food", "inequality", "direct", "The poorest spend most of their income on food."],
  ["children", "migration", "direct", "Families with few prospects at home may move in search of work and school."],
  ["lost", "inequality", "knock", "Lost earnings hurt most where there are no savings to fall back on.", 0.1],
  ["care", "inequality", "knock", "Unpaid care pulls women and girls out of paid work and school."],
  ["children", "inequality", "knock", "Lost schooling today becomes lower earnings tomorrow.", 0.18],
  ["inequality", "migration", "knock", "When the gap becomes unbearable, people move.", 0.12],
  ["supply", "food", "knock", "Delays and losses push up prices.", -0.24],
  ["food", "informal", "knock", "Higher prices make it even harder to stop working."],
  ["homes", "heatstroke", "knock", "With no cool place to recover, heat builds up in the body day after day.", 0.12],

  /* Links that close vicious cycles */
  ["informal", "heatstroke", "vicious", "Working through the hottest hours without shade, water or rest raises the risk of heat illness.", 0.22],
  ["heatstroke", "lost", "vicious", "Illness means days off work, and for daily earners no work means no pay.", 0.35],
  ["lost", "informal", "vicious", "Lost income leaves even less margin, so the next heatwave has to be worked through too.", 0.3],
  ["demand", "uhi", "vicious", "Air conditioners pump heat outdoors, warming the streets around them.", -0.3],
  ["uhi", "power", "vicious", "A hotter city pushes peak electricity demand even higher, stressing the grid.", -0.45],
  ["power", "demand", "vicious", "After outages, those who can afford it add generators and more cooling, adding still more load and heat.", -0.3],
  ["demand", "heat", "vicious", "Most cooling still runs on fossil power and refrigerants that warm the planet, adding to the heat that drives demand.", 0.05],
  ["drying", "heat", "vicious", "Dry soil can’t cool itself by evaporation, so more of the sun’s energy becomes heat.", 0.14],
  ["glacier", "heat", "vicious", "Melting snow and ice expose darker ground and water, which absorb more sunlight.", -0.1],
  ["wildfires", "heat", "vicious", "Fires release carbon and strip away tree cover that shades and cools the land.", 0.62],
  ["power", "water", "vicious", "Without power, pumps and treatment plants stop, just as demand for water peaks.", 0.2],
  ["water", "power", "vicious", "Thermal power plants need cool water. When rivers run low or warm, they have to cut output.", 0.2],
  ["heatstroke", "hsys", "vicious", "Heat illness brings sudden surges of patients.", 0.16],
  ["hsys", "heatstroke", "vicious", "Overstretched services treat people later, and heat illness turns severe fast.", 0.16],
  ["mental", "sleepless", "vicious", "Stress and anxiety make sleep even harder.", 0.3],
  ["heatstroke", "debt", "vicious", "Treatment and lost days are paid for out of pocket.", -0.1],
  ["debt", "informal", "vicious", "Debt repayments remove any option to stop work in the heat.", -0.1],
  ["migration", "homes", "vicious", "People forced to move often end up in crowded, poorly built housing that traps heat.", -0.4],
  ["inequality", "children", "vicious", "Poorer households pull children out of school to work, care or fetch water.", 0.18],

  /* Hidden cross-system links: off until the reader switches them on */
  ["drying", "food", "cross", "Failing harvests reach every plate through prices.", 0.18],
  ["crop", "food", "cross", "Fewer crops and animals mean less food and higher prices.", -0.2],
  ["droughts", "migration", "cross", "When water fails, staying put may no longer be possible.", 0.32],
  ["glacier", "water", "cross", "Shrinking glaciers mean less water flowing to cities downstream.", -0.16],
  ["power", "hsys", "cross", "Hospitals and clinics lose cooling, refrigeration and equipment when the power fails.", 0.22],
  ["uhi", "sleepless", "cross", "Cities that hold their heat overnight rob people of cool nights.", -0.22],
  ["smog", "kidney", "cross", "Polluted air adds strain to the heart and lungs during heat.", -0.18]
];

// The vicious cycles. "path" lists the steps in order; the last step leads back to the first.
// evidence: "established" (well established) or "emerging" (each link is evidenced, the full loop less so)
const LOOP_GROUPS = {
  heat:    "Loops that feed the heat itself",
  people:  "Loops that trap people",
  systems: "Loops that break the systems we rely on"
};

const LOOPS = [
  { id: "global", group: "heat", name: "The global cooling loop", evidence: "established",
    path: ["heat", "cities", "demand"],
    summary: "Cooling powered by fossil fuels adds to the warming that makes us need more cooling." },
  { id: "soil", group: "heat", name: "The dry-soil loop", evidence: "established",
    path: ["heat", "nature", "drying"],
    summary: "Heat dries the soil. Dry soil can’t cool itself, so the land heats up faster." },
  { id: "ice", group: "heat", name: "The melting-ice loop", evidence: "established",
    path: ["heat", "nature", "glacier"],
    summary: "Heat melts ice. Darker ground and water absorb more sunlight, and the melting speeds up." },
  { id: "fire", group: "heat", name: "The wildfire loop", evidence: "established",
    path: ["heat", "nature", "wildfires"],
    summary: "Heat dries forests into fuel. Fires release carbon and strip away the trees that cool the land." },

  { id: "poverty", group: "people", name: "The poverty–heat trap", evidence: "established", poster: true,
    path: ["informal", "heatstroke", "lost"],
    summary: "People who can’t afford to stop working fall ill. Illness costs income, and lost income makes stopping even less affordable." },
  { id: "debt", group: "people", name: "The medical-debt trap", evidence: "emerging",
    path: ["heatstroke", "debt", "informal"],
    summary: "Treatment costs push families into debt. Debt removes any option to rest, and working through the heat brings more illness." },
  { id: "sleep", group: "people", name: "The sleepless-nights loop", evidence: "established",
    path: ["sleepless", "mental"],
    summary: "Hot nights wreck sleep. Poor sleep frays mental health, and stress makes sleep harder still." },
  { id: "displacement", group: "people", name: "The displacement loop", evidence: "emerging",
    path: ["migration", "homes", "heatstroke", "lost", "inequality"],
    summary: "People forced to move often land in heat-trapping housing, fall ill, lose income, fall further behind, and are forced to move again." },
  { id: "school", group: "people", name: "The lost-schooling loop", evidence: "emerging",
    path: ["children", "inequality"],
    summary: "Heat keeps children out of school. Lost schooling deepens poverty, and poorer families pull more children out of school." },

  { id: "cooling", group: "systems", name: "The cooling trap", evidence: "established", poster: true,
    path: ["demand", "uhi", "power"],
    summary: "Air conditioning heats the street, a hotter city strains the grid, and outages drive even more demand for cooling." },
  { id: "energywater", group: "systems", name: "The energy–water loop", evidence: "established",
    path: ["power", "water"],
    summary: "Power plants need water, and water systems need power. In a heatwave, each failure deepens the other." },
  { id: "clinic", group: "systems", name: "The overwhelmed-clinic loop", evidence: "emerging",
    path: ["heatstroke", "hsys"],
    summary: "Heat illness floods clinics. Overwhelmed clinics treat people later, and more cases become severe." }
];

// Where the loops can be broken. Each lever sits on one link ("edge").
// A lever breaks every vicious cycle that runs through its link.
const LEVERS = [
  { id: "emissions", edge: ["heat", "nature"], title: "Deep emission cuts",
    text: "Every fraction of a degree avoided weakens every loop that runs through land, ice and forests at once.",
    example: "This is the one lever that touches every loop: the less the world warms, the weaker each cycle becomes." },
  { id: "cleancool", edge: ["demand", "heat"], title: "Clean, efficient cooling",
    text: "Efficient appliances, clean power and low-warming refrigerants break the link between keeping cool and heating the planet.",
    example: "The Kigali Amendment to the Montreal Protocol (2016) commits countries to phase down the most climate-warming refrigerants." },
  { id: "soilwater", edge: ["drying", "heat"], title: "Keep water in the soil",
    text: "Mulching, agroforestry, water harvesting and restoring degraded land help soils hold moisture and stay cooler." },
  { id: "blackcarbon", edge: ["glacier", "heat"], title: "Cut black carbon",
    text: "Cleaner stoves and engines and an end to open burning reduce the soot that darkens snow and ice." },
  { id: "firesmart", edge: ["wildfires", "heat"], title: "Fire-smart landscapes",
    text: "Early detection, community fire crews and land management that reduces fuel keep fires small and forests standing." },

  { id: "heatrules", edge: ["informal", "heatstroke"], title: "Heat-safe work",
    text: "Rest, shade and water during dangerous heat, with paid breaks so that stopping work doesn’t mean losing pay.",
    example: "Several Gulf states ban outdoor work during the hottest midday hours in summer." },
  { id: "heatcash", edge: ["heatstroke", "lost"], title: "Income protection in heatwaves",
    text: "Cash that pays out automatically when temperatures cross a danger threshold, so people can afford to stop.",
    example: "Parametric heat insurance has been piloted with women informal workers in India." },
  { id: "socialprotection", edge: ["lost", "informal"], title: "Social protection floors",
    text: "Basic income security that keeps households above the line between one hot season and the next." },
  { id: "freecare", edge: ["heatstroke", "debt"], title: "Free care for heat illness",
    text: "Covering emergency treatment for heat illness stops one bad day from becoming years of debt." },
  { id: "coolnights", edge: ["sleepless", "mental"], title: "Cool nights and support",
    text: "Cooling centres open at night, shaded and ventilated homes, and mental-health support during the hot season." },
  { id: "coolhousing", edge: ["migration", "homes"], title: "Cool, affordable housing",
    text: "Upgrading informal settlements with ventilation, shade and cool roofs, and planning homes for people who arrive." },
  { id: "coolschools", edge: ["children", "inequality"], title: "Heat-ready schools",
    text: "Cooler classrooms, heat-adjusted timetables and support that keeps children enrolled through hot seasons." },

  { id: "coolbydesign", edge: ["demand", "uhi"], title: "Cool by design",
    text: "Shading, ventilation, reflective roofs and efficient cooling cut the need for air conditioning, and the waste heat it dumps outside." },
  { id: "greencity", edge: ["uhi", "power"], title: "Green, cool cities",
    text: "Trees, water, cool roofs and cool pavements lower city temperatures and flatten peak demand.",
    example: "Indian cities and states such as Ahmedabad and Telangana have run programmes that paint roofs to reflect sunlight." },
  { id: "smartgrid", edge: ["power", "demand"], title: "Resilient grids",
    text: "Demand response, storage and protected supply for clinics and water pumps keep the lights on at peak." },
  { id: "drypower", edge: ["water", "power"], title: "Power that doesn’t need water",
    text: "Solar and wind use very little water, and dry cooling protects thermal plants when rivers run low or warm." },
  { id: "pumpbackup", edge: ["power", "water"], title: "Backup power for water",
    text: "Solar pumps and backup supply keep water flowing when the grid fails." },
  { id: "hap", edge: ["heatstroke", "hsys"], title: "Heat action plans",
    text: "Early warnings, public cooling spaces and outreach to the people most at risk prevent illness before it reaches hospital.",
    example: "Ahmedabad launched South Asia’s first city heat action plan in 2013." },
  { id: "readyclinics", edge: ["hsys", "heatstroke"], title: "Heat-ready health services",
    text: "Cooling, backup power, surge plans and trained frontline workers keep clinics working through heatwaves." }
];

// A guided path that crosses systems (not a loop)
const STORIES = {
  field: {
    title: "From field to family",
    kicker: "Across systems",
    steps: [
      { edges: [["heat", "nature"]], title: "Heat reaches the land",
        text: "A hot spell arrives at the worst moment of the growing season." },
      { edges: [["nature", "drying"]], title: "Soils dry, harvests fail",
        text: "Moisture is pulled from the ground just when crops need it most." },
      { edges: [["drying", "food"]], title: "The shock travels to the market",
        text: "Smaller harvests mean higher prices, felt by families far from the field." },
      { edges: [["food", "informal"]], title: "Stopping work becomes impossible",
        text: "With food costing more, there is even less room to rest during the heat." },
      { edges: [["food", "inequality"]], title: "The gap widens",
        text: "The poorest spend most of their income on food. Every price spike pushes them further behind." },
      { edges: [["inequality", "migration"]], title: "Some are forced to move",
        text: "Often into cities, which are hotter still. The web begins again." }
    ]
  }
};

/* ---------------- ENGINE ---------------- */

(function () {
  const SVGNS = "http://www.w3.org/2000/svg";
  const VIEW = { w: 1500, h: 1135 };
  const COLORS = { red: "#D7263D", teal: "#1F7A70", blue: "#2E6F95", ink: "#16202B" };

  const svg = document.getElementById("web");
  const viewport = document.getElementById("map-viewport");
  const panel = document.getElementById("panel");
  const panelBody = document.getElementById("panel-body");
  const guide = document.getElementById("guide");
  const crossToggle = document.getElementById("toggle-cross");
  const leverToggle = document.getElementById("toggle-levers");
  if (!svg) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const byId = Object.fromEntries(NODES.map(n => [n.id, n]));
  const edges = EDGES.map(([from, to, type, why, bend]) => ({ id: from + ">" + to, from, to, type, why, bend, loops: [], levers: [] }));
  const edgeById = Object.fromEntries(edges.map(e => [e.id, e]));
  NODES.forEach(n => { n.kind = n.kind || "leaf"; n.out = []; n.in = []; n.loops = []; });
  edges.forEach(e => { byId[e.from].out.push(e); byId[e.to].in.push(e); });

  // wire loops and levers to the links they run through
  const loopById = Object.fromEntries(LOOPS.map(l => [l.id, l]));
  LOOPS.forEach(l => {
    l.edges = l.path.map((id, i) => id + ">" + l.path[(i + 1) % l.path.length]);
    l.edges.forEach(eid => {
      if (!edgeById[eid]) { console.warn("Loop", l.id, "needs a link", eid); return; }
      edgeById[eid].loops.push(l.id);
    });
    l.path.forEach(id => byId[id].loops.push(l.id));
    l.levers = [];
  });
  const leverById = Object.fromEntries(LEVERS.map(v => [v.id, v]));
  LEVERS.forEach(v => {
    v.edgeId = v.edge.join(">");
    const e = edgeById[v.edgeId];
    if (!e) { console.warn("Lever", v.id, "needs a link", v.edgeId); v.loops = []; return; }
    e.levers.push(v.id);
    v.loops = e.loops.slice();
    v.loops.forEach(lid => loopById[lid].levers.push(v.id));
  });

  const state = { selected: null, story: null, step: 0, filter: "all", showCross: false };

  /* ---- helpers ---- */
  const el = (name, attrs = {}, parent) => {
    const node = document.createElementNS(SVGNS, name);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const plain = n => n.label.replace(/\n/g, " ");
  const edgeVisible = e => e.type !== "cross" || state.showCross;
  const isDesktop = () => window.matchMedia("(min-width: 1100px)").matches;
  const evidenceLabel = ev => ev === "established" ? "Well established" : "Evidence emerging";
  const plural = (n, one, many) => `${n} ${n === 1 ? one : (many || one + "s")}`;

  /* ---- draw ---- */
  svg.setAttribute("viewBox", `0 0 ${VIEW.w} ${VIEW.h}`);
  const defs = el("defs", {}, svg);
  const arrowColors = { hub: COLORS.ink, knock: COLORS.ink, vicious: COLORS.red, cross: COLORS.blue,
    nature: SYSTEMS.nature.color, health: SYSTEMS.health.color, cities: SYSTEMS.cities.color, work: SYSTEMS.work.color };
  for (const key in arrowColors) {
    const big = key === "vicious" || key === "hub";
    const m = el("marker", { id: "arr-" + key, viewBox: "0 0 10 10", refX: "8.5", refY: "5",
      markerWidth: big ? 13 : 9, markerHeight: big ? 13 : 9, markerUnits: "userSpaceOnUse", orient: "auto-start-reverse" }, defs);
    el("path", { d: "M0,0 L10,5 L0,10 z", fill: arrowColors[key] }, m);
  }

  const gEdges = el("g", { class: "edges" }, svg);
  const gNodes = el("g", { class: "nodes" }, svg);
  const gLevers = el("g", { class: "levers" }, svg);

  NODES.forEach(n => {
    const sys = SYSTEMS[n.sys];
    const g = el("g", { class: `node node--${n.kind}`, "data-id": n.id, tabindex: "0", role: "button",
      transform: `translate(${n.x} ${n.y})`, style: `--c:${sys.color};--t:${sys.tint}` }, gNodes);
    n.g = g;
    const loopsText = n.loops.length ? ` Part of ${plural(n.loops.length, "vicious cycle")}.` : "";
    g.setAttribute("aria-label", `${plain(n)}. ${n.kind === "leaf" ? sys.name + ". " : ""}Connected to ${n.in.length + n.out.length} other parts of the web.${loopsText}`);

    if (n.kind === "hub") {
      el("circle", { class: "hub__halo", r: 150 }, g);
      el("circle", { class: "hub__ring", r: 136 }, g);
      el("circle", { class: "hub__disc", r: 116 }, g);
      const t = el("text", { class: "hub__text", "text-anchor": "middle" }, g);
      const lines = n.label.split("\n");
      lines.forEach((line, i) => {
        const ts = el("tspan", { x: 0, y: (i - (lines.length - 1) / 2) * 62 + 22 }, t);
        ts.textContent = line.toUpperCase();
      });
      n.r = 140;
      return;
    }

    const fs = n.kind === "domain" ? 27 : 20;
    const lh = fs * 1.2;
    const shadow = el("rect", { class: "node__shadow" }, g);
    const box = el("rect", { class: "node__box" }, g);
    const text = el("text", { class: "node__text", "text-anchor": "middle", "font-size": fs }, g);
    const lines = n.label.split("\n");
    lines.forEach((line, i) => {
      const ts = el("tspan", { x: 0, y: (i - (lines.length - 1) / 2) * lh + fs * 0.36 }, text);
      ts.textContent = line;
    });
    n.parts = { shadow, box, text, fs, lines };
  });

  function sizeNodes() {
    NODES.forEach(n => {
      if (!n.parts) return;
      const { shadow, box, text, fs, lines } = n.parts;
      let w;
      try { w = text.getBBox().width; } catch (e) { w = 0; }
      if (!w) w = Math.max(...lines.map(l => l.length)) * fs * 0.56;
      const padX = n.kind === "domain" ? 34 : 24;
      n.w = Math.round(w + padX * 2);
      n.h = Math.round(lines.length * fs * 1.2 + (n.kind === "domain" ? 34 : 24));
      [box, shadow].forEach(r => {
        r.setAttribute("x", -n.w / 2); r.setAttribute("y", -n.h / 2);
        r.setAttribute("width", n.w); r.setAttribute("height", n.h);
        r.setAttribute("rx", n.h / 2);
      });
      shadow.setAttribute("transform", "translate(5 6)");
    });
  }

  function clip(n, toward, gap) {
    const dx = toward.x - n.x, dy = toward.y - n.y;
    const len = Math.hypot(dx, dy) || 1;
    if (n.kind === "hub") return { x: n.x + dx / len * (n.r + gap), y: n.y + dy / len * (n.r + gap) };
    const hw = n.w / 2 + gap, hh = n.h / 2 + gap;
    const t = Math.min(dx ? hw / Math.abs(dx) : Infinity, dy ? hh / Math.abs(dy) : Infinity);
    return { x: n.x + dx * t, y: n.y + dy * t };
  }

  function drawEdges() {
    gEdges.textContent = "";
    edges.forEach(e => {
      const a = byId[e.from], b = byId[e.to];
      const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
      const bend = e.bend !== undefined ? e.bend : (e.type === "hub" ? 0 : 0.08);
      const c = { x: (a.x + b.x) / 2 - dy * bend, y: (a.y + b.y) / 2 + dx * bend };
      const s = clip(a, bend ? c : b, 3);
      const t = clip(b, bend ? c : a, 6);
      const d = bend ? `M${s.x.toFixed(1)},${s.y.toFixed(1)} Q${c.x.toFixed(1)},${c.y.toFixed(1)} ${t.x.toFixed(1)},${t.y.toFixed(1)}`
                     : `M${s.x.toFixed(1)},${s.y.toFixed(1)} L${t.x.toFixed(1)},${t.y.toFixed(1)}`;
      e.mid = bend ? { x: 0.25 * s.x + 0.5 * c.x + 0.25 * t.x, y: 0.25 * s.y + 0.5 * c.y + 0.25 * t.y }
                   : { x: (s.x + t.x) / 2, y: (s.y + t.y) / 2 };
      const colorKey = e.type === "direct" ? a.sys : e.type;
      e.marker = `url(#arr-${colorKey})`;
      const p = el("path", { d, class: `edge edge--${e.type}`, "data-id": e.id,
        "marker-end": e.marker, style: `--c:${SYSTEMS[a.sys].color}` }, gEdges);
      if (e.why) el("title", {}, p).textContent = `${plain(a)} → ${plain(b)}: ${e.why}`;
      e.path = p;
      void len;
    });
  }

  function drawLevers() {
    gLevers.textContent = "";
    LEVERS.forEach(v => {
      const e = edgeById[v.edgeId]; if (!e) return;
      const g = el("g", { class: "lever", "data-lever": v.id, tabindex: "0", role: "button",
        transform: `translate(${e.mid.x.toFixed(1)} ${e.mid.y.toFixed(1)})`,
        "aria-label": `Where it breaks: ${v.title}` }, gLevers);
      el("circle", { class: "lever__ring", r: 20 }, g);
      el("circle", { class: "lever__dot", r: 14 }, g);
      el("path", { class: "lever__cut", d: "M-5,-7 L-1,7 M1,-7 L5,7" }, g);
      el("title", {}, g).textContent = `Where it breaks: ${v.title}`;
      v.g = g;
    });
  }

  /* ---- highlight engine ---- */
  function clearMarks() {
    svg.querySelectorAll(".on, .flow, .current, .force, .in-loop").forEach(x => {
      x.classList.remove("on", "flow", "current", "force", "in-loop");
      x.style.removeProperty("--d");
    });
    edges.forEach(e => e.path && e.path.setAttribute("marker-end", e.marker));
    svg.classList.remove("has-focus");
  }

  function mark({ nodes = [], edges: es = [], flow = [], depth = null, loopEdges = [], levers = [] }) {
    clearMarks();
    svg.classList.add("has-focus");
    nodes.forEach(id => {
      const g = byId[id].g; g.classList.add("on");
      if (depth) g.style.setProperty("--d", depth.get(id) || 0);
    });
    es.forEach(id => {
      const e = edgeById[id]; if (!e) return;
      e.path.classList.add("on");
      if (e.type === "cross") e.path.classList.add("force");
      if (depth) e.path.style.setProperty("--d", (depth.get(e.to) || 1) - 0.5);
    });
    loopEdges.forEach(id => {
      const e = edgeById[id]; if (!e) return;
      e.path.classList.add("on", "in-loop");
      e.path.setAttribute("marker-end", "url(#arr-vicious)");
    });
    levers.forEach(id => leverById[id] && leverById[id].g && leverById[id].g.classList.add("on"));
    if (!reduceMotion) flow.forEach(id => edgeById[id] && edgeById[id].path.classList.add("flow"));
  }

  function neighbourhood(id) {
    const n = byId[id];
    const nodes = new Set([id]), es = new Set(), flow = new Set();
    n.out.filter(edgeVisible).forEach(e => { nodes.add(e.to); es.add(e.id); flow.add(e.id); });
    n.in.filter(edgeVisible).forEach(e => { nodes.add(e.from); es.add(e.id); });
    return { nodes, es, flow };
  }

  function ripple(id) {
    const depth = new Map([[id, 0]]);
    const es = new Set();
    const queue = [id];
    while (queue.length) {
      const cur = queue.shift();
      byId[cur].out.filter(edgeVisible).forEach(e => {
        es.add(e.id);
        if (!depth.has(e.to)) { depth.set(e.to, depth.get(cur) + 1); queue.push(e.to); }
      });
    }
    return { depth, es };
  }

  function applyFilter() {
    svg.classList.toggle("is-filtered", state.filter !== "all");
    NODES.forEach(n => n.g.classList.toggle("out", !(state.filter === "all" || n.sys === state.filter || n.kind === "hub")));
    edges.forEach(e => {
      const inSet = state.filter === "all" || (byId[e.from].sys === state.filter || e.from === "heat") && (byId[e.to].sys === state.filter || e.to === "heat");
      e.path.classList.toggle("out", !inSet);
    });
  }

  /* ---- selection ---- */
  function afterSelect(focusId, opts = {}) {
    openPanel();
    if (!isDesktop() && opts.pageScroll !== false) {
      const top = viewport.getBoundingClientRect().top - 68;
      if (Math.abs(top) > 4) window.scrollBy({ top, behavior: reduceMotion ? "auto" : "smooth" });
    }
    if (focusId && opts.scroll !== false) bringIntoView(focusId);
  }

  function select(id, opts = {}) {
    if (!byId[id]) return;
    state.story = null;
    state.selected = id;
    const { nodes, es, flow } = neighbourhood(id);
    mark({ nodes, edges: es, flow });
    byId[id].g.classList.add("current");
    renderNode(id);
    afterSelect(id, opts);
    setHash(id);
  }

  function selectLever(id) {
    const v = leverById[id]; if (!v) return;
    state.story = null; state.selected = "lever:" + id;
    const loopEdges = new Set(), nodes = new Set();
    v.loops.forEach(lid => loopById[lid].edges.forEach(eid => {
      loopEdges.add(eid); const e = edgeById[eid]; nodes.add(e.from); nodes.add(e.to);
    }));
    const e = edgeById[v.edgeId];
    nodes.add(e.from); nodes.add(e.to);
    mark({ nodes, edges: [v.edgeId], loopEdges, levers: [id] });
    renderLever(id);
    afterSelect(e.to);
    setHash("break-" + id);
  }

  function clearSelection() {
    state.selected = null; state.story = null;
    clearMarks();
    renderIntro();
    closePanel();
    setHash("");
  }

  function setHash(h) {
    try { history.replaceState(null, "", h ? "#" + h : location.pathname + location.search); } catch (e) {}
  }

  function showRipple(id) {
    const { depth, es } = ripple(id);
    mark({ nodes: depth.keys(), edges: es, flow: es, depth });
    byId[id].g.classList.add("current");
    const reached = [...depth.keys()].filter(k => k !== id && byId[k].kind === "leaf");
    const systems = new Set(reached.map(k => byId[k].sys));
    const maxDepth = Math.max(0, ...depth.values());
    const back = depth.has("heat") && id !== "heat";
    const out = panelBody.querySelector("[data-ripple-result]");
    if (out) {
      out.innerHTML = reached.length
        ? `<strong>${reached.length}</strong> further consequence${reached.length === 1 ? "" : "s"} across <strong>${systems.size}</strong> system${systems.size === 1 ? "" : "s"}, up to <strong>${maxDepth}</strong> step${maxDepth === 1 ? "" : "s"} away.${back ? " <em>And it feeds back into the heat itself.</em>" : ""}${state.showCross ? "" : " <span>Reveal the hidden cross-system links and try again.</span>"}`
        : "Nothing further downstream on this map.";
      out.hidden = false;
    }
  }

  /* ---- guided paths: loops and stories ---- */
  function loopStory(l) {
    const steps = [{ edges: [], loopAll: true, title: "The loop", text: l.summary }];
    l.edges.forEach(eid => {
      const e = edgeById[eid];
      steps.push({ edges: [[e.from, e.to]], title: `${plain(byId[e.from])} → ${plain(byId[e.to])}`,
        text: e.why || byId[e.to].desc });
    });
    steps.push({ edges: [], loopAll: true, levers: true, title: "Where it breaks",
      text: l.levers.length ? "Cut any one link and the loop stops feeding itself:" : "No lever is mapped for this loop yet." });
    return { title: l.name, kicker: `Vicious cycle · ${evidenceLabel(l.evidence)}`, steps, loop: l };
  }

  function getStory(key) {
    if (loopById[key]) return loopStory(loopById[key]);
    return STORIES[key];
  }

  function startStory(key) {
    if (!getStory(key)) return;
    state.story = key; state.step = 0; state.selected = null;
    renderStep();
    afterSelect(null);
    setHash(loopById[key] ? "loop-" + key : "");
  }

  function renderStep() {
    const story = getStory(state.story);
    const step = story.steps[state.step];
    const nodes = new Set(), es = new Set(), flow = new Set(), loopEdges = new Set();
    let levers = [];
    if (story.loop) {
      const l = story.loop;
      l.path.forEach(id => nodes.add(id));
      if (step.loopAll) l.edges.forEach(eid => { loopEdges.add(eid); flow.add(eid); });
      else {
        // edges walked so far are red; the current one flows
        story.steps.slice(1, state.step + 1).forEach(s => s.edges.forEach(([a, b]) => loopEdges.add(a + ">" + b)));
        step.edges.forEach(([a, b]) => flow.add(a + ">" + b));
        l.edges.forEach(eid => es.add(eid));
      }
      if (step.levers) levers = l.levers;
    } else {
      story.steps.slice(0, state.step + 1).forEach((s, i) => s.edges.forEach(([a, b]) => {
        nodes.add(a); nodes.add(b); es.add(a + ">" + b);
        if (i === state.step) flow.add(a + ">" + b);
      }));
    }
    mark({ nodes, edges: es, flow, loopEdges, levers });
    step.edges.forEach(([, b]) => byId[b].g.classList.add("current"));
    const last = state.step === story.steps.length - 1;
    const leverList = step.levers && story.loop.levers.length
      ? `<ul class="lever-list">${story.loop.levers.map(lid => leverItem(leverById[lid])).join("")}</ul>` : "";
    panelBody.innerHTML = `
      <p class="panel__kicker ${story.loop ? "is-loop" : ""}">${esc(story.kicker)}</p>
      <h2 class="panel__title">${esc(story.title)}</h2>
      <div class="progress" aria-hidden="true">${story.steps.map((_, i) => `<span class="${i <= state.step ? "is-done" : ""}"></span>`).join("")}</div>
      <p class="panel__step ${step.levers ? "is-break" : ""}" aria-live="polite"><span>${state.step + 1} / ${story.steps.length}</span> ${esc(step.title)}</p>
      <p class="panel__desc">${esc(step.text)}</p>
      ${step.loopAll && !step.levers && story.loop ? chainHTML(story.loop) : ""}
      ${leverList}
      <div class="panel__nav">
        <button class="btn btn--ghost" data-act="prev" ${state.step === 0 ? "disabled" : ""}>← Back</button>
        <button class="btn" data-act="${last ? "done" : "next"}">${last ? "Explore freely" : "Next →"}</button>
      </div>
      <button class="link" data-act="clear">Leave the guided path</button>`;
    const focus = step.edges.length ? step.edges[step.edges.length - 1][1] : (story.loop ? story.loop.path[0] : null);
    if (focus) bringIntoView(focus);
  }

  function chainHTML(l) {
    return `<p class="chain">${l.path.map(id => `<span>${esc(plain(byId[id]))}</span>`).join('<i aria-hidden="true">→</i>')}<i aria-hidden="true">↺</i></p>`;
  }

  /* ---- panel rendering ---- */
  function leverItem(v) {
    return `<li><button class="lever-btn" data-lever="${v.id}">
      <span class="lever-btn__icon" aria-hidden="true"></span>
      <span><strong>${esc(v.title)}</strong>
      <small>Cuts ${esc(plain(byId[v.edge[0]]))} → ${esc(plain(byId[v.edge[1]]))}${v.loops.length > 1 ? ` · breaks ${v.loops.length} loops` : ""}</small></span>
    </button></li>`;
  }

  function loopItem(l) {
    return `<li><button class="loop-btn" data-story="${l.id}">
      <span class="loop-btn__name">${esc(l.name)}</span>
      <span class="ev ev--${l.evidence}">${evidenceLabel(l.evidence)}</span>
    </button></li>`;
  }

  function connectionItem(e, dir) {
    const other = byId[dir === "out" ? e.to : e.from];
    const typeName = { hub: "Direct impact", direct: "Direct impact", knock: "Knock-on effect", vicious: "Closes a vicious cycle", cross: "Cross-system link" }[e.type];
    return `<li>
      <button class="conn" data-go="${other.id}" style="--c:${SYSTEMS[other.sys].color}">
        <span class="conn__type conn__type--${e.type}" title="${typeName}" aria-hidden="true"></span>
        <span class="conn__name">${esc(plain(other))}</span>
        <span class="visually-hidden">(${typeName})</span>
      </button>
      ${e.why ? `<p class="conn__why">${esc(e.why)}</p>` : ""}
    </li>`;
  }

  function renderNode(id) {
    const n = byId[id];
    const sys = SYSTEMS[n.sys];
    const outs = n.out.filter(edgeVisible), ins = n.in.filter(edgeVisible);
    const hiddenCount = n.out.concat(n.in).filter(e => !edgeVisible(e)).length;
    const loops = n.loops.map(lid => loopById[lid]);
    panelBody.innerHTML = `
      <p class="panel__kicker" style="--c:${sys.color}"><span class="dot"></span>${n.kind === "hub" ? "The centre of the web" : esc(sys.name)}</p>
      <h2 class="panel__title">${esc(plain(n))}</h2>
      <p class="panel__desc">${esc(n.desc)}</p>
      ${loops.length ? `<div class="loop-box"><p class="loop-box__h">Caught in ${plural(loops.length, "vicious cycle")}</p><ul class="loop-list">${loops.map(loopItem).join("")}</ul></div>` : ""}
      ${outs.length ? `<button class="btn btn--full" data-act="ripple" data-id="${id}">Follow the ripple</button>
      <p class="ripple-result" data-ripple-result hidden></p>` : ""}
      ${outs.length ? `<h3 class="panel__h">Sets in motion</h3><ul class="conns">${outs.map(e => connectionItem(e, "out")).join("")}</ul>` : ""}
      ${ins.length ? `<h3 class="panel__h">Driven by</h3><ul class="conns">${ins.map(e => connectionItem(e, "in")).join("")}</ul>` : ""}
      ${hiddenCount ? `<p class="panel__note">+${hiddenCount} hidden cross-system link${hiddenCount === 1 ? "" : "s"}. <button class="link" data-act="reveal">Reveal</button></p>` : ""}
      <button class="link" data-act="clear">← Back to the whole web</button>`;
  }

  function renderLever(id) {
    const v = leverById[id];
    const a = byId[v.edge[0]], b = byId[v.edge[1]];
    panelBody.innerHTML = `
      <p class="panel__kicker is-break"><span class="lever-btn__icon" aria-hidden="true"></span>Where it breaks</p>
      <h2 class="panel__title">${esc(v.title)}</h2>
      <p class="panel__desc">${esc(v.text)}</p>
      ${v.example ? `<p class="example">${esc(v.example)}</p>` : ""}
      <h3 class="panel__h">Cuts the link</h3>
      <p class="cut"><button class="link" data-go="${a.id}">${esc(plain(a))}</button> <span aria-hidden="true">→</span> <button class="link" data-go="${b.id}">${esc(plain(b))}</button></p>
      <h3 class="panel__h">Breaks ${plural(v.loops.length, "vicious cycle")}</h3>
      <ul class="loop-list">${v.loops.map(lid => loopItem(loopById[lid])).join("")}</ul>
      <button class="link" data-act="clear">← Back to the whole web</button>`;
  }

  function introHTML() {
    const groups = Object.entries(LOOP_GROUPS).map(([g, name]) => `
      <h3 class="panel__h">${esc(name)}</h3>
      <ul class="loop-list">${LOOPS.filter(l => l.group === g).map(loopItem).join("")}</ul>`).join("");
    return `
      <p class="panel__kicker">Start anywhere</p>
      <h2 class="panel__title">Pull a thread</h2>
      <p class="panel__desc">Tap any bubble to see what it sets in motion and what drives it. Or walk through one of the <strong>${LOOPS.length} vicious cycles</strong> and see where each one can be broken:</p>
      ${groups}
      <h3 class="panel__h">Across systems</h3>
      <ul class="loop-list">${Object.entries(STORIES).map(([k, s]) => `<li><button class="loop-btn loop-btn--story" data-story="${k}"><span class="loop-btn__name">${esc(s.title)}</span><span class="ev">${s.steps.length} steps</span></button></li>`).join("")}</ul>`;
  }

  function renderIntro() { panelBody.innerHTML = introHTML(); }

  function openPanel() {
    panel.classList.add("is-open");
    if (!isDesktop()) document.body.classList.add("sheet-open");
  }
  function closePanel() {
    panel.classList.remove("is-open");
    document.body.classList.remove("sheet-open");
  }

  /* ---- zoom & scrolling ---- */
  const ZOOMS = [1, 1.5, 2.2, 3];
  let zoomIndex = 0;
  function setZoom(i, focus) {
    const prevW = svg.getBoundingClientRect().width;
    const cx = viewport.scrollLeft + viewport.clientWidth / 2;
    const cy = viewport.scrollTop + viewport.clientHeight / 2;
    zoomIndex = Math.max(0, Math.min(ZOOMS.length - 1, i));
    viewport.style.setProperty("--zoom", ZOOMS[zoomIndex]);
    viewport.classList.toggle("is-zoomed", zoomIndex > 0);
    const ratio = svg.getBoundingClientRect().width / (prevW || 1);
    if (focus && byId[focus]) bringIntoView(focus, true);
    else {
      viewport.scrollLeft = cx * ratio - viewport.clientWidth / 2;
      viewport.scrollTop = cy * ratio - viewport.clientHeight / 2;
    }
    document.getElementById("zoom-out").disabled = zoomIndex === 0;
    document.getElementById("zoom-in").disabled = zoomIndex === ZOOMS.length - 1;
  }

  function bringIntoView(id, instant, centre) {
    if (zoomIndex === 0 || !byId[id]) return;
    const n = byId[id];
    const scale = svg.getBoundingClientRect().width / VIEW.w;
    viewport.scrollTo({
      left: n.x * scale - viewport.clientWidth / 2,
      top: n.y * scale - viewport.clientHeight * (isDesktop() || centre ? 0.5 : 0.24),
      behavior: instant || reduceMotion ? "auto" : "smooth"
    });
  }

  document.getElementById("zoom-in").addEventListener("click", () => setZoom(zoomIndex + 1, state.selected));
  document.getElementById("zoom-out").addEventListener("click", () => setZoom(zoomIndex - 1, state.selected));

  /* ---- events ---- */
  function onNodeActivate(id) {
    if (state.selected === id && !state.story) { clearSelection(); return; }
    select(id);
  }

  function onKeyActivate(ev, fn) {
    if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); fn(); }
  }

  gNodes.addEventListener("click", ev => { const g = ev.target.closest(".node"); if (g) onNodeActivate(g.dataset.id); });
  gNodes.addEventListener("keydown", ev => { const g = ev.target.closest(".node"); if (g) onKeyActivate(ev, () => onNodeActivate(g.dataset.id)); });
  gLevers.addEventListener("click", ev => { const g = ev.target.closest(".lever"); if (g) selectLever(g.dataset.lever); });
  gLevers.addEventListener("keydown", ev => { const g = ev.target.closest(".lever"); if (g) onKeyActivate(ev, () => selectLever(g.dataset.lever)); });

  // hover preview (mouse only)
  gNodes.addEventListener("pointerover", ev => {
    if (ev.pointerType !== "mouse" || state.selected || state.story) return;
    const g = ev.target.closest(".node"); if (!g) return;
    const { nodes, es, flow } = neighbourhood(g.dataset.id);
    mark({ nodes, edges: es, flow });
  });
  gNodes.addEventListener("pointerout", ev => {
    if (ev.pointerType !== "mouse" || state.selected || state.story) return;
    if (!ev.relatedTarget || !ev.relatedTarget.closest || !ev.relatedTarget.closest(".node")) clearMarks();
  });

  function scrollToMap(then) {
    const r = viewport.getBoundingClientRect();
    const far = r.top < -r.height * 0.5 || r.top > window.innerHeight * 0.6;
    if (far) document.getElementById("explore").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    setTimeout(then, far && !reduceMotion ? 450 : 0);
  }

  function handleAction(ev) {
    const t = ev.target.closest("button, [data-story], [data-lever]");
    if (!t) return;
    const inMapUi = panel.contains(t);
    if (t.dataset.go) { inMapUi ? select(t.dataset.go) : scrollToMap(() => select(t.dataset.go)); return; }
    if (t.dataset.story) { inMapUi ? startStory(t.dataset.story) : scrollToMap(() => startStory(t.dataset.story)); return; }
    if (t.dataset.lever) { inMapUi ? selectLever(t.dataset.lever) : scrollToMap(() => selectLever(t.dataset.lever)); return; }
    const act = t.dataset.act;
    if (act === "clear" || act === "done" || act === "close") clearSelection();
    else if (act === "ripple") showRipple(t.dataset.id);
    else if (act === "reveal") { crossToggle.checked = true; setCross(true); }
    else if (act === "next") { state.step++; renderStep(); }
    else if (act === "prev") { state.step--; renderStep(); }
  }
  document.addEventListener("click", ev => {
    if (ev.target.closest("#panel, #guide, #loops, #web-list")) handleAction(ev);
  });

  document.addEventListener("keydown", ev => {
    if (ev.key === "Escape" && (state.selected || state.story)) clearSelection();
  });

  document.getElementById("filters").addEventListener("click", ev => {
    const b = ev.target.closest("[data-filter]"); if (!b) return;
    state.filter = b.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach(x => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    applyFilter();
  });

  function setCross(on) {
    state.showCross = on;
    svg.classList.toggle("hide-cross", !on);
    if (state.selected && byId[state.selected]) select(state.selected, { scroll: false, pageScroll: false });
  }
  crossToggle.addEventListener("change", () => setCross(crossToggle.checked));
  leverToggle.addEventListener("change", () => svg.classList.toggle("show-levers", leverToggle.checked));
  document.querySelectorAll("[data-type-toggle]").forEach(cb => {
    cb.addEventListener("change", () => svg.classList.toggle("hide-" + cb.dataset.typeToggle, !cb.checked));
  });

  document.querySelectorAll("[data-random]").forEach(b => b.addEventListener("click", () => {
    const leaves = NODES.filter(n => n.kind === "leaf");
    const pick = leaves[Math.floor(Math.random() * leaves.length)];
    document.getElementById("explore").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    setTimeout(() => select(pick.id), reduceMotion ? 0 : 450);
  }));

  /* ---- "Where the loops break" section ---- */
  function renderLoopsSection() {
    const host = document.getElementById("loop-groups");
    if (host) {
      host.innerHTML = Object.entries(LOOP_GROUPS).map(([g, name]) => `
        <div class="lgroup">
          <h3 class="lgroup__h">${esc(name)}</h3>
          ${LOOPS.filter(l => l.group === g).map(l => `
            <article class="lrow">
              <div class="lrow__head">
                <h4><button class="lrow__name" data-story="${l.id}">${esc(l.name)}</button></h4>
                <span class="ev ev--${l.evidence}">${evidenceLabel(l.evidence)}</span>
              </div>
              <p class="lrow__sum">${esc(l.summary)}</p>
              ${chainHTML(l)}
              ${l.levers.length ? `<p class="lrow__breaks">Break it: ${l.levers.map(lid => `<button class="lever-chip" data-lever="${lid}">${esc(leverById[lid].title)}</button>`).join("")}</p>` : ""}
            </article>`).join("")}
        </div>`).join("");
    }

    // pressure points: consequences caught in the most loops
    const pp = document.getElementById("pressure-points");
    if (pp) {
      const ranked = NODES.filter(n => n.loops.length > 1).sort((a, b) => b.loops.length - a.loops.length).slice(0, 5);
      pp.innerHTML = ranked.map(n => `<li><button class="pp" data-go="${n.id}"><span class="pp__n">${n.loops.length}</span><span class="pp__name">${esc(plain(n))}</span><span class="pp__meta">loops run through it</span></button></li>`).join("");
    }
    const ml = document.getElementById("multi-levers");
    if (ml) {
      const ranked = LEVERS.filter(v => v.loops.length > 1).sort((a, b) => b.loops.length - a.loops.length);
      ml.innerHTML = ranked.map(v => `<li><button class="pp pp--lever" data-lever="${v.id}"><span class="pp__n">${v.loops.length}</span><span class="pp__name">${esc(v.title)}</span><span class="pp__meta">loops broken at once</span></button></li>`).join("");
    }
  }

  /* ---- text version of the web ---- */
  function renderList() {
    const host = document.getElementById("web-list");
    host.innerHTML = ["nature", "health", "cities", "work"].map(sysKey => {
      const sys = SYSTEMS[sysKey];
      const items = NODES.filter(n => n.sys === sysKey && n.kind === "leaf");
      return `<details class="sys" style="--c:${sys.color};--t:${sys.tint}">
        <summary><span class="dot"></span>${esc(sys.name)} <span class="sys__count">${items.length}</span></summary>
        <ul>${items.map(n => {
          const outs = n.out.filter(e => e.type !== "hub");
          return `<li>
            <button class="list-node" data-go="${n.id}">${esc(plain(n))}</button>
            <p>${esc(n.desc)}</p>
            ${outs.length ? `<p class="list-leads">Leads to: ${outs.map(e => esc(plain(byId[e.to]))).join(" · ")}</p>` : ""}
          </li>`;
        }).join("")}</ul>
      </details>`;
    }).join("");
  }

  /* ---- stats ---- */
  function renderStats() {
    const values = {
      consequences: NODES.filter(n => n.kind === "leaf").length,
      links: edges.filter(e => e.type !== "cross").length,
      hidden: edges.filter(e => e.type === "cross").length,
      loops: LOOPS.length,
      levers: LEVERS.length,
      feedback: edges.filter(e => e.to === "heat").length
    };
    document.querySelectorAll("[data-stat]").forEach(x => { if (values[x.dataset.stat] !== undefined) x.textContent = values[x.dataset.stat]; });
  }

  /* ---- boot ---- */
  function boot() {
    sizeNodes();
    drawEdges();
    drawLevers();
    svg.classList.add("hide-cross");
    renderIntro();
    guide.innerHTML = introHTML().replace("Tap any bubble", "Drag the map to explore and tap any bubble");
    renderLoopsSection();
    renderList();
    renderStats();
    if (isDesktop()) setZoom(0);
    else { setZoom(window.innerWidth < 600 ? 2 : 1); requestAnimationFrame(() => bringIntoView("heat", true, true)); }
    svg.classList.add("is-ready");
    const hash = decodeURIComponent(location.hash.slice(1));
    if (byId[hash]) select(hash, { scroll: false, pageScroll: false });
    else if (hash.startsWith("loop-") && loopById[hash.slice(5)]) startStory(hash.slice(5));
    else if (hash.startsWith("break-") && leverById[hash.slice(6)]) selectLever(hash.slice(6));
  }

  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise(r => setTimeout(r, 1500))]).then(boot);
})();
