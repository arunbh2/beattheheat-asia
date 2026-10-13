/* ==========================================================
   Extreme heat is a wicked problem — interactive systems map
   Plain JavaScript. No libraries, no build step.

   To change any wording on the map, edit the DATA section
   just below. Everything else draws itself from it.
   ========================================================== */

/* ---------------- DATA ---------------- */

const SYSTEMS = {
  hub:    { name: "Extreme heat",         color: "#111111", tint: "#FDBC11" },
  nature: { name: "Nature and land",      color: "#2E5E34", tint: "#D5E8C4" },
  health: { name: "Health and wellbeing", color: "#8C1D2E", tint: "#F5C2CA" },
  cities: { name: "Cities and systems",   color: "#0F5068", tint: "#BFE2EE" },
  work:   { name: "Work and economy",     color: "#5F1C6E", tint: "#DCC6E4" }
};

// kind: "hub" (centre), "domain" (the four systems) or "leaf" (a consequence)
// label: use \n to break the line inside the bubble
const NODES = [
  { id: "heat", sys: "hub", kind: "hub", label: "Extreme\nheat", x: 750, y: 560,
    desc: "Long stretches of dangerous heat, by day and by night. It doesn’t strike one sector. It presses on every system at once." },

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
  { id: "hsys", sys: "health", label: "Health systems\noverwhelmed", x: 150, y: 352,
    desc: "Heatwaves bring surges of patients just as staff, power and supplies are under strain." },
  { id: "kidney", sys: "health", label: "Kidney and\nheart strain", x: 420, y: 398,
    desc: "Sweating and dehydration make the heart work harder and can damage the kidneys, especially with repeated exposure." },
  { id: "pregnancy", sys: "health", label: "Risks in\npregnancy", x: 128, y: 478,
    desc: "Extreme heat is linked to higher risks of preterm birth and other pregnancy complications." },
  { id: "sleepless", sys: "health", label: "Sleepless\nhot nights", x: 128, y: 680,
    desc: "When nights stay hot, the body never recovers from the day, so the next day starts already depleted." },
  { id: "mental", sys: "health", label: "Mental health\nand violence", x: 420, y: 708,
    desc: "Heat is linked to more irritability, anxiety, conflict and violence, and to worse outcomes for people living with mental illness." },
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
  { id: "lost", sys: "work", label: "Lost work hours\nand wages", x: 195, y: 955,
    desc: "The International Labour Organization projects that heat stress could cut 2.2% of all working hours worldwide by 2030, the equivalent of 80 million full-time jobs." },
  { id: "informal", sys: "work", label: "Informal workers\ncan’t stop work", x: 455, y: 968,
    desc: "Without paid leave, contracts or savings, stopping work means losing the day’s income. So people keep working through dangerous heat." },
  { id: "food", sys: "work", label: "Food insecurity\nand price spikes", x: 750, y: 970,
    desc: "Smaller harvests and disrupted supply push up prices, and the poorest households spend the largest share of their income on food." },
  { id: "children", sys: "work", label: "Children miss\nschool", x: 1040, y: 965,
    desc: "Classrooms become too hot to learn in, schools close during heatwaves, and some children are pulled into work." },
  { id: "supply", sys: "work", label: "Supply chains\ndisrupted", x: 1325, y: 945,
    desc: "Heat slows factories, ports, roads and warehouses. The delays ripple through prices and jobs far away." },
  { id: "care", sys: "work", label: "Care burden falls\non women", x: 330, y: 1078,
    desc: "When people fall ill or water runs short, the extra caring, fetching and nursing usually falls on women and girls." },
  { id: "inequality", sys: "work", label: "Deepening\ninequality", x: 750, y: 1085,
    desc: "Every impact lands hardest on those with the least protection, widening gaps in health, income and opportunity." },
  { id: "migration", sys: "work", label: "Forced\nmigration", x: 1150, y: 1078,
    desc: "When land, work and water fail, families may be forced to move, often into cities that are hotter still." }
];

// [from, to, type, why, bend]
// type: hub | direct | knock (knock-on effect) | vicious (vicious cycle) | cross (hidden cross-system link)
const EDGES = [
  ["heat", "nature", "hub"], ["heat", "health", "hub"], ["heat", "cities", "hub"], ["heat", "work", "hub"],

  ["nature", "crop", "direct"], ["nature", "droughts", "direct"], ["nature", "wildfires", "direct"],
  ["nature", "glacier", "direct"], ["nature", "biodiversity", "direct"], ["nature", "marine", "direct"],
  ["nature", "drying", "direct"],
  ["droughts", "crop", "knock", "Less water for fields and animals."],
  ["droughts", "wildfires", "knock", "Parched land and vegetation burn more easily.", -0.12],
  ["wildfires", "glacier", "knock", "Soot settling on ice darkens it, so it absorbs more sunlight and melts faster.", -0.12],
  ["drying", "biodiversity", "knock", "Dry, degraded soils support less life above and below ground."],

  ["health", "hsys", "direct"], ["health", "kidney", "direct"], ["health", "pregnancy", "direct"],
  ["health", "sleepless", "direct"], ["health", "mental", "direct"], ["health", "heatstroke", "direct"],
  ["pregnancy", "kidney", "knock", "Pregnancy already puts extra load on the heart and kidneys. Heat adds to it."],
  ["sleepless", "mental", "knock", "Poor sleep wears down mood, patience and the ability to cope.", 0.1],
  ["sleepless", "heatstroke", "knock", "Without cool nights, the body starts each day already overheated."],

  ["cities", "demand", "direct"], ["cities", "uhi", "direct"], ["cities", "power", "direct"],
  ["cities", "smog", "direct"], ["cities", "water", "direct"], ["cities", "homes", "direct"],
  ["water", "homes", "knock", "When water and transport fail, people are stuck at home, and many homes trap heat."],

  ["demand", "uhi", "vicious", "Air conditioners pump heat outdoors, warming the streets around them.", -0.3],
  ["uhi", "power", "vicious", "A hotter city pushes peak electricity demand even higher, stressing the grid.", -0.45],
  ["power", "demand", "vicious", "After outages, those who can afford it add generators and more cooling, adding still more load and heat.", -0.3],

  ["work", "lost", "direct"], ["work", "informal", "direct"], ["work", "food", "direct"],
  ["work", "children", "direct"], ["work", "supply", "direct"],
  ["informal", "care", "direct", "When workers fall ill, someone has to care for them, and it is usually women."],
  ["food", "inequality", "direct", "The poorest spend most of their income on food."],
  ["children", "migration", "direct", "Families with few prospects at home may move in search of work and school."],
  ["lost", "inequality", "knock", "Lost earnings hurt most where there are no savings to fall back on.", 0.12],
  ["care", "inequality", "knock", "Unpaid care pulls women and girls out of paid work and school."],
  ["children", "inequality", "knock", "Lost schooling today becomes lower earnings tomorrow."],
  ["inequality", "migration", "knock", "When the gap becomes unbearable, people move."],
  ["supply", "food", "knock", "Delays and losses push up prices.", -0.24],
  ["food", "informal", "knock", "Higher prices make it even harder to stop working."],

  ["informal", "heatstroke", "vicious", "Working through the hottest hours without shade, water or rest raises the risk of heat illness.", 0.3],
  ["heatstroke", "lost", "vicious", "Illness means days off work, and for daily earners no work means no pay.", 0.35],
  ["lost", "informal", "vicious", "Lost income leaves even less margin, so the next heatwave has to be worked through too.", 0.3],

  /* Hidden cross-system links: off until the reader switches them on */
  ["drying", "food", "cross", "Failing harvests reach every plate through prices.", 0.18],
  ["crop", "food", "cross", "Fewer crops and animals mean less food and higher prices.", -0.2],
  ["droughts", "migration", "cross", "When water fails, staying put may no longer be possible.", 0.32],
  ["glacier", "water", "cross", "Shrinking glaciers mean less water flowing to cities downstream.", -0.16],
  ["power", "hsys", "cross", "Hospitals and clinics lose cooling, refrigeration and equipment when the power fails.", 0.22],
  ["uhi", "sleepless", "cross", "Cities that hold their heat overnight rob people of cool nights.", -0.22],
  ["homes", "heatstroke", "cross", "With no cool place to recover, heat builds up in the body day after day.", 0.2],
  ["smog", "kidney", "cross", "Polluted air adds strain to the heart and lungs during heat.", -0.18]
];

const TRAPS = {
  poverty: { label: "POVERTY–HEAT TRAP", x: 52, y: 1032, anchor: "start", nodes: ["informal", "heatstroke", "lost"] },
  cooling: { label: "COOLING TRAP", x: 1085, y: 340, anchor: "middle", nodes: ["demand", "uhi", "power"] }
};

// Guided paths. Each step lights up the links listed in "edges".
const STORIES = {
  poverty: {
    title: "The poverty–heat trap",
    kicker: "Vicious cycle",
    steps: [
      { edges: [["heat", "work"]], title: "It starts with a hot day",
        text: "Extreme heat presses on work and income everywhere, but not equally." },
      { edges: [["work", "informal"]], title: "No contract, no cover",
        text: "A street vendor, a brick carrier, a delivery rider. No paid leave, no savings. Stopping work means losing the day’s income." },
      { edges: [["informal", "heatstroke"]], title: "So they keep working",
        text: "Through the hottest hours, often without shade, water or rest. The body overheats." },
      { edges: [["heatstroke", "lost"]], title: "Illness costs income",
        text: "Heat illness means days off work, and for daily earners no work means no pay." },
      { edges: [["lost", "informal"]], title: "The loop closes",
        text: "With even less margin, the next heatwave has to be worked through too. Each turn of the loop leaves people more exposed." },
      { edges: [["informal", "care"], ["care", "inequality"], ["lost", "inequality"]], title: "And the costs spread",
        text: "Caring for the sick falls mostly on women. Lost income and lost time widen the gap between those who can stop and those who can’t." }
    ]
  },
  cooling: {
    title: "The cooling trap",
    kicker: "Vicious cycle",
    steps: [
      { edges: [["heat", "cities"]], title: "Cities amplify heat",
        text: "Concrete and crowding soak up the day’s heat and release it slowly." },
      { edges: [["cities", "demand"]], title: "Everyone reaches for cooling",
        text: "Those who can afford it switch on fans and air conditioners." },
      { edges: [["demand", "uhi"]], title: "Cooling heats the street",
        text: "Air conditioners pump heat outdoors. The city gets hotter for everyone, most of all for people who have no cooling at all." },
      { edges: [["uhi", "power"]], title: "The grid hits its limit",
        text: "A hotter city means a higher peak load. Heat-stressed lines and transformers fail." },
      { edges: [["power", "demand"]], title: "The loop closes",
        text: "After outages, those who can afford it add generators and more cooling. Demand climbs again." },
      { edges: [["power", "hsys"]], title: "And it reaches into health",
        text: "When the power fails, hospitals and clinics lose cooling too, just as heat illness peaks." }
    ]
  },
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

  const svg = document.getElementById("web");
  const viewport = document.getElementById("map-viewport");
  const panel = document.getElementById("panel");
  const panelBody = document.getElementById("panel-body");
  const guide = document.getElementById("guide");
  const crossToggle = document.getElementById("toggle-cross");
  if (!svg) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const byId = Object.fromEntries(NODES.map(n => [n.id, n]));
  const edges = EDGES.map(([from, to, type, why, bend]) => ({ id: from + ">" + to, from, to, type, why, bend }));
  const edgeById = Object.fromEntries(edges.map(e => [e.id, e]));
  NODES.forEach(n => { n.kind = n.kind || "leaf"; n.out = []; n.in = []; });
  edges.forEach(e => { byId[e.from].out.push(e); byId[e.to].in.push(e); });

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

  /* ---- draw ---- */
  svg.setAttribute("viewBox", `0 0 ${VIEW.w} ${VIEW.h}`);
  const defs = el("defs", {}, svg);
  const arrowColors = { hub: "#111111", knock: "#333333", vicious: "#F04E23", cross: "#B07D00",
    nature: SYSTEMS.nature.color, health: SYSTEMS.health.color, cities: SYSTEMS.cities.color, work: SYSTEMS.work.color };
  for (const key in arrowColors) {
    const m = el("marker", { id: "arr-" + key, viewBox: "0 0 10 10", refX: "8.5", refY: "5",
      markerWidth: "9", markerHeight: "9", markerUnits: "userSpaceOnUse", orient: "auto-start-reverse" }, defs);
    el("path", { d: "M0,0 L10,5 L0,10 z", fill: arrowColors[key] }, m);
  }
  // scale arrowheads with stroke by using userSpace size above; slightly larger for thick edges
  defs.querySelectorAll("marker").forEach(m => {
    if (/vicious|hub/.test(m.id)) { m.setAttribute("markerWidth", "13"); m.setAttribute("markerHeight", "13"); }
  });

  const gEdges = el("g", { class: "edges" }, svg);
  const gLabels = el("g", { class: "trap-labels" }, svg);
  const gNodes = el("g", { class: "nodes" }, svg);

  // nodes first (so we can measure them), edges after
  NODES.forEach(n => {
    const sys = SYSTEMS[n.sys];
    const g = el("g", { class: `node node--${n.kind}`, "data-id": n.id, tabindex: "0", role: "button",
      transform: `translate(${n.x} ${n.y})`, style: `--c:${sys.color};--t:${sys.tint}` }, gNodes);
    n.g = g;
    const visible = n.in.length + n.out.length;
    g.setAttribute("aria-label", `${plain(n)}. ${n.kind === "leaf" ? sys.name + ". " : ""}Connected to ${visible} other parts of the web.`);

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
      const lh = fs * 1.2;
      n.w = Math.round(w + padX * 2);
      n.h = Math.round(lines.length * lh + (n.kind === "domain" ? 34 : 24));
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
      const c = { x: (a.x + b.x) / 2 - dy / len * len * bend, y: (a.y + b.y) / 2 + dx / len * len * bend };
      const s = clip(a, bend ? c : b, 3);
      const t = clip(b, bend ? c : a, 6);
      const d = bend ? `M${s.x.toFixed(1)},${s.y.toFixed(1)} Q${c.x.toFixed(1)},${c.y.toFixed(1)} ${t.x.toFixed(1)},${t.y.toFixed(1)}`
                     : `M${s.x.toFixed(1)},${s.y.toFixed(1)} L${t.x.toFixed(1)},${t.y.toFixed(1)}`;
      const colorKey = e.type === "direct" ? a.sys : e.type;
      const p = el("path", { d, class: `edge edge--${e.type}`, "data-id": e.id,
        "marker-end": `url(#arr-${colorKey})`, style: `--c:${SYSTEMS[a.sys].color}` }, gEdges);
      if (e.why) {
        const title = el("title", {}, p);
        title.textContent = `${plain(a)} → ${plain(b)}: ${e.why}`;
      }
      e.path = p;
    });
  }

  // trap labels
  Object.entries(TRAPS).forEach(([key, t]) => {
    const g = el("g", { class: "trap-label", "data-story": key, tabindex: "0", role: "button",
      "aria-label": `Walk through the ${t.label.toLowerCase()}` }, gLabels);
    const tx = el("text", { x: t.x, y: t.y, "text-anchor": t.anchor }, g);
    tx.textContent = t.label;
  });

  /* ---- highlight engine ---- */
  function clearMarks() {
    svg.querySelectorAll(".on, .flow, .current, .force").forEach(x => {
      x.classList.remove("on", "flow", "current", "force");
      x.style.removeProperty("--d");
    });
    svg.classList.remove("has-focus");
  }

  function mark(nodeIds, edgeIds, flowIds = new Set(), depth = null) {
    clearMarks();
    svg.classList.add("has-focus");
    nodeIds.forEach(id => {
      const g = byId[id].g; g.classList.add("on");
      if (depth) g.style.setProperty("--d", depth.get(id) || 0);
    });
    edgeIds.forEach(id => {
      const e = edgeById[id]; if (!e) return;
      e.path.classList.add("on");
      if (e.type === "cross") e.path.classList.add("force");
      if (depth) e.path.style.setProperty("--d", (depth.get(e.to) || 1) - 0.5);
    });
    if (!reduceMotion) flowIds.forEach(id => edgeById[id] && edgeById[id].path.classList.add("flow"));
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
    NODES.forEach(n => {
      const inSet = state.filter === "all" || n.sys === state.filter || n.kind === "hub";
      n.g.classList.toggle("out", !inSet);
    });
    edges.forEach(e => {
      const inSet = state.filter === "all" || (byId[e.from].sys === state.filter || e.from === "heat") && byId[e.to].sys === state.filter;
      e.path.classList.toggle("out", !inSet);
    });
  }

  /* ---- selection ---- */
  function select(id, opts = {}) {
    if (!byId[id]) return;
    state.story = null;
    state.selected = id;
    const { nodes, es, flow } = neighbourhood(id);
    mark(nodes, es, flow);
    byId[id].g.classList.add("current");
    renderNode(id);
    openPanel();
    if (!isDesktop()) {
      const top = viewport.getBoundingClientRect().top - 68;
      if (Math.abs(top) > 4) window.scrollBy({ top, behavior: reduceMotion ? "auto" : "smooth" });
    }
    if (opts.scroll !== false) bringIntoView(id);
    try { history.replaceState(null, "", "#" + id); } catch (e) {}
  }

  function clearSelection() {
    state.selected = null; state.story = null;
    clearMarks();
    renderIntro();
    closePanel();
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
  }

  function showRipple(id) {
    const { depth, es } = ripple(id);
    mark(new Set(depth.keys()), es, es, depth);
    byId[id].g.classList.add("current");
    const reached = [...depth.keys()].filter(k => k !== id && byId[k].kind === "leaf");
    const systems = new Set(reached.map(k => byId[k].sys));
    const maxDepth = Math.max(0, ...depth.values());
    const out = panelBody.querySelector("[data-ripple-result]");
    if (out) {
      out.innerHTML = reached.length
        ? `<strong>${reached.length}</strong> further consequence${reached.length === 1 ? "" : "s"} across <strong>${systems.size}</strong> system${systems.size === 1 ? "" : "s"}, up to <strong>${maxDepth}</strong> step${maxDepth === 1 ? "" : "s"} away.${state.showCross ? "" : " <span>Switch on the hidden cross-system links and try again.</span>"}`
        : "Nothing further downstream on this map. Try switching on the hidden cross-system links.";
      out.hidden = false;
    }
  }

  /* ---- stories ---- */
  function startStory(key) {
    state.story = key; state.step = 0; state.selected = null;
    renderStep();
    openPanel();
  }

  function renderStep() {
    const story = STORIES[state.story];
    const step = story.steps[state.step];
    const nodes = new Set(), es = new Set(), flow = new Set();
    story.steps.slice(0, state.step + 1).forEach((s, i) => {
      s.edges.forEach(([a, b]) => {
        nodes.add(a); nodes.add(b); es.add(a + ">" + b);
        if (i === state.step) flow.add(a + ">" + b);
      });
    });
    mark(nodes, es, flow);
    step.edges.forEach(([, b]) => byId[b].g.classList.add("current"));
    const last = state.step === story.steps.length - 1;
    panelBody.innerHTML = `
      <p class="panel__kicker">${esc(story.kicker)}</p>
      <h2 class="panel__title">${esc(story.title)}</h2>
      <div class="progress" aria-hidden="true">${story.steps.map((_, i) => `<span class="${i <= state.step ? "is-done" : ""}"></span>`).join("")}</div>
      <p class="panel__step" aria-live="polite"><span>${state.step + 1} / ${story.steps.length}</span> ${esc(step.title)}</p>
      <p class="panel__desc">${esc(step.text)}</p>
      <div class="panel__nav">
        <button class="btn btn--ghost" data-act="prev" ${state.step === 0 ? "disabled" : ""}>← Back</button>
        <button class="btn" data-act="${last ? "done" : "next"}">${last ? "Explore freely" : "Next →"}</button>
      </div>
      <button class="link" data-act="clear">Leave the guided path</button>`;
    const focusNode = step.edges[step.edges.length - 1][1];
    bringIntoView(focusNode);
  }

  /* ---- panel rendering ---- */
  function connectionItem(e, dir) {
    const other = byId[dir === "out" ? e.to : e.from];
    const typeName = { hub: "Direct impact", direct: "Direct impact", knock: "Knock-on effect", vicious: "Vicious cycle", cross: "Cross-system link" }[e.type];
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
    const trap = Object.entries(TRAPS).find(([, t]) => t.nodes.includes(id));
    const hiddenCount = n.out.concat(n.in).filter(e => !edgeVisible(e)).length;
    panelBody.innerHTML = `
      <p class="panel__kicker" style="--c:${sys.color}"><span class="dot"></span>${n.kind === "hub" ? "The centre of the web" : esc(sys.name)}</p>
      <h2 class="panel__title">${esc(plain(n))}</h2>
      <p class="panel__desc">${esc(n.desc)}</p>
      ${trap ? `<button class="trap-btn" data-story="${trap[0]}">Part of the ${esc(STORIES[trap[0]].title.replace(/^The /, ""))}: walk through it →</button>` : ""}
      ${outs.length ? `<button class="btn btn--full" data-act="ripple" data-id="${id}">Follow the ripple</button>
      <p class="ripple-result" data-ripple-result hidden></p>` : ""}
      ${outs.length ? `<h3 class="panel__h">Sets in motion</h3><ul class="conns">${outs.map(e => connectionItem(e, "out")).join("")}</ul>` : ""}
      ${ins.length ? `<h3 class="panel__h">Driven by</h3><ul class="conns">${ins.map(e => connectionItem(e, "in")).join("")}</ul>` : ""}
      ${hiddenCount ? `<p class="panel__note">+${hiddenCount} hidden cross-system link${hiddenCount === 1 ? "" : "s"}. <button class="link" data-act="reveal">Reveal</button></p>` : ""}
      <button class="link" data-act="clear">← Back to the whole web</button>`;
  }

  function introHTML() {
    return `
      <p class="panel__kicker">Start anywhere</p>
      <h2 class="panel__title">Pull a thread</h2>
      <p class="panel__desc">Tap any bubble to see what it sets in motion and what drives it. Or take a guided path through the web:</p>
      <div class="paths">
        ${Object.entries(STORIES).map(([k, s]) => `
          <button class="path" data-story="${k}">
            <span class="path__kicker">${esc(s.kicker)}</span>
            <span class="path__title">${esc(s.title)}</span>
            <span class="path__meta">${s.steps.length} steps →</span>
          </button>`).join("")}
      </div>`;
  }

  function renderIntro() {
    panelBody.innerHTML = introHTML();
  }

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
    if (focus) bringIntoView(focus, true);
    else {
      viewport.scrollLeft = cx * ratio - viewport.clientWidth / 2;
      viewport.scrollTop = cy * ratio - viewport.clientHeight / 2;
    }
    document.getElementById("zoom-out").disabled = zoomIndex === 0;
    document.getElementById("zoom-in").disabled = zoomIndex === ZOOMS.length - 1;
  }

  function bringIntoView(id, instant) {
    if (zoomIndex === 0) return;
    const n = byId[id];
    const scale = svg.getBoundingClientRect().width / VIEW.w;
    viewport.scrollTo({
      left: n.x * scale - viewport.clientWidth / 2,
      top: n.y * scale - viewport.clientHeight * (isDesktop() ? 0.5 : 0.24),
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

  gNodes.addEventListener("click", ev => {
    const g = ev.target.closest(".node"); if (g) onNodeActivate(g.dataset.id);
  });
  gNodes.addEventListener("keydown", ev => {
    const g = ev.target.closest(".node");
    if (g && (ev.key === "Enter" || ev.key === " ")) { ev.preventDefault(); onNodeActivate(g.dataset.id); }
  });
  gLabels.addEventListener("click", ev => {
    const g = ev.target.closest(".trap-label"); if (g) startStory(g.dataset.story);
  });
  gLabels.addEventListener("keydown", ev => {
    const g = ev.target.closest(".trap-label");
    if (g && (ev.key === "Enter" || ev.key === " ")) { ev.preventDefault(); startStory(g.dataset.story); }
  });

  // hover preview (mouse only)
  gNodes.addEventListener("pointerover", ev => {
    if (ev.pointerType !== "mouse" || state.selected || state.story) return;
    const g = ev.target.closest(".node"); if (!g) return;
    const { nodes, es, flow } = neighbourhood(g.dataset.id);
    mark(nodes, es, flow);
  });
  gNodes.addEventListener("pointerout", ev => {
    if (ev.pointerType !== "mouse" || state.selected || state.story) return;
    if (!ev.relatedTarget || !ev.relatedTarget.closest || !ev.relatedTarget.closest(".node")) clearMarks();
  });

  function handleAction(ev) {
    const t = ev.target.closest("button, [data-story]");
    if (!t) return;
    if (t.dataset.go) { select(t.dataset.go); return; }
    if (t.dataset.story) { startStory(t.dataset.story); scrollToMapIfNeeded(); return; }
    const act = t.dataset.act;
    if (act === "clear") clearSelection();
    else if (act === "ripple") showRipple(t.dataset.id);
    else if (act === "reveal") { crossToggle.checked = true; setCross(true); }
    else if (act === "next") { state.step++; renderStep(); }
    else if (act === "prev") { state.step--; renderStep(); }
    else if (act === "done") clearSelection();
    else if (act === "close") clearSelection();
  }
  panel.addEventListener("click", handleAction);
  guide.addEventListener("click", handleAction);

  document.addEventListener("keydown", ev => {
    if (ev.key === "Escape" && (state.selected || state.story)) clearSelection();
  });

  function scrollToMapIfNeeded() {
    const r = viewport.getBoundingClientRect();
    if (r.top < 0 || r.top > window.innerHeight * 0.6) {
      document.getElementById("explore").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    }
  }

  // system filter chips
  document.getElementById("filters").addEventListener("click", ev => {
    const b = ev.target.closest("[data-filter]"); if (!b) return;
    state.filter = b.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach(x => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    applyFilter();
  });

  // edge-type toggles
  function setCross(on) {
    state.showCross = on;
    svg.classList.toggle("hide-cross", !on);
    if (state.selected) select(state.selected, { scroll: false });
  }
  crossToggle.addEventListener("change", () => setCross(crossToggle.checked));
  document.querySelectorAll("[data-type-toggle]").forEach(cb => {
    cb.addEventListener("change", () => svg.classList.toggle("hide-" + cb.dataset.typeToggle, !cb.checked));
  });

  // "start anywhere" buttons
  document.querySelectorAll("[data-random]").forEach(b => b.addEventListener("click", () => {
    const leaves = NODES.filter(n => n.kind === "leaf");
    const pick = leaves[Math.floor(Math.random() * leaves.length)];
    document.getElementById("explore").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    setTimeout(() => select(pick.id), reduceMotion ? 0 : 450);
  }));

  /* ---- text version of the web (accessibility + mobile reading) ---- */
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
    host.addEventListener("click", ev => {
      const b = ev.target.closest("[data-go]"); if (!b) return;
      document.getElementById("explore").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      setTimeout(() => select(b.dataset.go), reduceMotion ? 0 : 450);
    });
  }

  /* ---- stats ---- */
  function renderStats() {
    const set = (k, v) => { const x = document.querySelector(`[data-stat="${k}"]`); if (x) x.textContent = v; };
    set("consequences", NODES.filter(n => n.kind === "leaf").length);
    set("links", edges.filter(e => e.type !== "hub" && e.type !== "cross").length);
    set("hidden", edges.filter(e => e.type === "cross").length);
    document.querySelectorAll('[data-stat="hidden"]').forEach(x => x.textContent = edges.filter(e => e.type === "cross").length);
  }

  /* ---- boot ---- */
  function boot() {
    sizeNodes();
    drawEdges();
    svg.classList.add("hide-cross");
    renderIntro();
    guide.innerHTML = introHTML().replace("Tap any bubble", "Drag the map to explore and tap any bubble");
    renderList();
    renderStats();
    if (isDesktop()) setZoom(0);
    else { setZoom(window.innerWidth < 600 ? 2 : 1); bringIntoView("heat", true); }
    svg.classList.add("is-ready");
    const hash = decodeURIComponent(location.hash.slice(1));
    if (byId[hash]) select(hash, { scroll: false });
  }

  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise(r => setTimeout(r, 1500))]).then(boot);
})();
