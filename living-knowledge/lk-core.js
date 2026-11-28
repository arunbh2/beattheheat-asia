/* Common Shade: Living Knowledge, the shared rules. Read by the builder (tools/build-living-knowledge.js), the model
   (tools/living-knowledge.js), the page script (living-knowledge/lk.js) and the check, so the pages, filters, fit questions,
   comparison and tests never disagree.
   - Labels say what kind of statement each piece of evidence is; there is no score and no "best practice" badge.
   - Fit questions use plain rules from each record's own fields and always say why a record is or is not shown. They never
     predict cooling or say anything is safe.
   - Stakeholder guidance per domain is Common Shade's suggestion and is labelled so; guidance a source gives is labelled with
     the source. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.LKCore = factory();
}(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  const DOMAIN = { clothing: "Clothing and textiles", buildings: "Homes and buildings", neighbourhood: "Neighbourhoods and shared spaces", water: "Water and evaporative practices",
    food: "Food and diet", work: "Work and rest", care: "Care and recovery", agriculture: "Agriculture and livestock" };
  const CATEGORY = { indigenous: "Indigenous knowledge", traditional: "Traditional or inherited practice", vernacular: "Vernacular design", local: "Local adaptation" };
  const CATEGORY_NOTE = {
    indigenous: "Associated with identifiable Indigenous peoples, where a source identifies them.",
    traditional: "Passed on over generations; not automatically Indigenous.",
    vernacular: "Locally developed buildings, materials and settlement forms.",
    local: "A contemporary community response, including hybrids of old and new."
  };
  const CLIMATE = { "hot-dry": "Hot and dry", "hot-humid": "Hot and humid", tropical: "Tropical (humidity varies)", composite: "Composite (seasonally changing)" };
  const COUNTRY = { IN: "India", PK: "Pakistan", BD: "Bangladesh", NP: "Nepal", BT: "Bhutan", LK: "Sri Lanka", MV: "Maldives", AF: "Afghanistan", ID: "Indonesia", PH: "Philippines", VN: "Viet Nam", TH: "Thailand",
    KH: "Cambodia", LA: "Lao PDR", MM: "Myanmar", MY: "Malaysia", SG: "Singapore", BN: "Brunei", TL: "Timor-Leste", ASIA: "Several countries" };
  const STATUS = { reported: "Community-reported practice", observed: "Observed in the field", measured: "Measured in a specified setting", modelled: "Modelled performance",
    policy: "Policy or plan statement", guidance: "Official health guidance or review", interpretation: "An author's interpretation, not evidence" };
  const STATUS_NOTE = {
    reported: "People describe doing it. Strong evidence of use and experience; not proof of a temperature or health effect.",
    observed: "Researchers saw it in the field.",
    measured: "Something was measured, in one setting, for a stated period. Read the comparator and limits.",
    modelled: "A simulation, not a measurement.",
    policy: "A plan or policy names it. Inclusion is not implementation, funding or a result.",
    guidance: "WHO, UNICEF, UNFPA or a systematic review says this in its own words.",
    interpretation: "What the authors conclude or believe; shown so the reader can weigh it, never as a finding."
  };
  const SETTING = { home: "Homes", work: "Work", public: "Public places and travel", neighbourhood: "Streets and neighbourhoods", care: "Care", livestock: "Livestock" };
  const FIT = { humidity: { dry: "Relies on dry air or dry heat", humid: "Studied in humid heat", both: "Not tied to humidity in these sources" },
    water: { none: "Needs no water", low: "Needs little water", some: "Needs some water", high: "Needs a lot of water" },
    control: { none: "Anyone can do it", household: "A household decides", owner: "Needs the owner of the building or land", employer: "Needs the employer", authority: "Needs a council, city or authority" } };
  // the nine stakeholder groups and Common Shade's per-domain suggestions (editorial, labelled as such on every page)
  const STAKE = [["state", "State governments"], ["local", "Municipalities, districts and local governments"], ["community", "Communities and knowledge holders"], ["builders", "Artisans, builders and designers"],
    ["employers", "Employers and worker organisations"], ["health", "Health and care services"], ["schools", "Schools and educators"], ["research", "Researchers"], ["funders", "Funders"]];
  const G = {
    _all: { community: "Decide whether and how this practice is described; ask for corrections through Common Shade's corrections page. New contributions stay under contributors' control.",
      research: "Measure the outcomes that matter here (indoor and skin temperature, sleep, illness, earnings) with the people who use it, and report comparators and limits.",
      funders: "Fund the enabling costs (materials, labour, maintenance, water) and an evaluation, not only a pilot." },
    buildings: { state: "Fit traditional materials and forms into housing scheme guidance with climate-specific technical checks, not blanket prescriptions.", local: "Ask in procurement for measured indoor temperatures and maintenance plans; involve residents in design.",
      builders: "Keep and pass on local skills; get qualified structural, fire and moisture checks before retrofits.", employers: "Not usually the decision-maker.", health: "Ask about home heat at visits, especially for older and ill people.", schools: "Use local building forms to teach how buildings shape heat, without implying they replace safe classrooms." },
    clothing: { state: "Allow lighter work clothing and uniforms in the hot season where safety permits.", local: "Supply suitable clothing to outdoor municipal workers, as the Churu plan proposes.", builders: "Not usually relevant.",
      employers: "Let workers choose lighter clothing; supply breathable uniforms; never as a substitute for rest, shade and water.", health: "Repeat WHO's clothing advice in a way that respects local dress.", schools: "Relax uniform rules in hot months." },
    water: { state: "Fund safe public drinking water in the hot season.", local: "Site, fill and clean public water points; check water quality.", builders: "Design shaded, cleanable water points.",
      employers: "Provide cool, safe drinking water at work.", health: "Advise on safe storage; cool water is not treatment for heat illness.", schools: "Keep safe drinking water within reach of every classroom." },
    food: { state: "Make hot-season foods affordable through food schemes where people want them.", local: "Support markets and shade for food vendors.", builders: "Not usually relevant.",
      employers: "Give meal and water breaks.", health: "Document food beliefs respectfully; give official advice on hydration and ORS; do not present foods as treatment.", schools: "Serve hot-season meals that are safe to store." },
    work: { state: "Back changed hours with rules that protect earnings and paid rest.", local: "Shift public works hours on heat alerts, as some villages already do; keep transport running early and late.", builders: "Plan sites with shaded rest areas.",
      employers: "Change hours only with pay protected; give paid breaks, shade and water; let workers report heat safely.", health: "Use alerts to reach outdoor workers.", schools: "Move outdoor activities out of the hottest hours." },
    neighbourhood: { state: "Back urban greening and shade with long-term maintenance budgets.", local: "Map shade and water where people work and wait; plant and maintain trees with residents.", builders: "Design streets for shade and breeze.",
      employers: "Provide shaded rest places for outdoor workers.", health: "Point people to cool public places in heatwaves.", schools: "Shade playgrounds and routes to school." },
    care: { state: "Make sure heat plans name pregnant women, infants and carers, with services, not only advice.", local: "Keep clinics and Anganwadi centres cool and staffed in heat.", builders: "Design kitchens and care spaces that stay cooler.",
      employers: "Give carers flexibility in heat.", health: "Follow official guidance (for example exclusive breastfeeding for infants under six months); take reported remedies seriously as a reason to talk, not as treatment.", schools: "Teach families heat warning signs with health services." },
    agriculture: { state: "Support shelter and water for livestock in heat without shifting work onto women and children.", local: "Provide water points for animals and people in rural areas.", builders: "Build ventilated sheds with fire safety.",
      employers: "Protect farm workers' hours and pay in heat.", health: "Reach farm workers with heat advice.", schools: "Not usually relevant." }
  };
  function guidance(p) { const d = G[p.domain] || {}; return STAKE.map(([k, l]) => [k, l, d[k] || G._all[k] || "Not specific to this practice."]); }

  // evidence labels a practice carries, from its claims' statuses (order of strength of the kind of statement, not a score)
  const ORDER = ["measured", "modelled", "observed", "reported", "guidance", "policy", "interpretation"];
  const evidenceOf = cs => ORDER.filter(s => cs.some(c => c.status === s));

  // filters (state in the address): q, domain, country, climate, setting, evidence, category, water
  const KEYS = ["q", "domain", "country", "climate", "setting", "evidence", "category", "water"];
  function matches(p, s) {
    if (s.domain && p.domain !== s.domain) return false;
    if (s.country && !p.places.some(pl => pl.country === s.country)) return false;
    if (s.climate && !p.climates.includes(s.climate)) return false;
    if (s.setting && !p.settings.includes(s.setting)) return false;
    if (s.evidence && !p.evidence.includes(s.evidence)) return false;
    if (s.category && p.category !== s.category) return false;
    if (s.water && p.fit.water !== s.water) return false;
    if (s.q) { const hay = [p.title, p.summary, (p.local_names || []).map(n => n.name).join(" "), p.places.map(pl => pl.place).join(" "), DOMAIN[p.domain]].join(" ").toLowerCase();
      if (!String(s.q).toLowerCase().split(/\s+/).filter(Boolean).every(w => hay.includes(w))) return false; }
    return true;
  }
  function readState(search) { const q = new URLSearchParams(search || ""), s = {}; KEYS.forEach(k => { const v = q.get(k); if (v) s[k] = v; }); return s; }
  function writeState(s) { const q = new URLSearchParams(); KEYS.forEach(k => { if (s[k]) q.set(k, s[k]); }); const t = q.toString(); return t ? "?" + t : ""; }

  // fit questions: answers { setting, humidity: dry|humid|unsure, water: reliable|limited|unsure, control: none|household|owner|employer|authority }
  // returns each practice with shown: true|false and the reasons, in plain words. No prediction, no safety verdict.
  const CONTROL_RANK = { none: 0, household: 1, owner: 2, employer: 2, authority: 3 };
  function fit(p, a) {
    const why = [], limits = [];
    if (a.setting && !p.settings.includes(a.setting)) return { shown: false, why: [`Documented for ${p.settings.map(s => SETTING[s]).join(", ").toLowerCase()}, not ${(SETTING[a.setting] || a.setting).toLowerCase()}.`] };
    if (a.setting) why.push(`Documented for ${(SETTING[a.setting] || "").toLowerCase()}.`);
    if (a.humidity === "humid" && p.fit.humidity === "dry") limits.push("It relies on dry air or dry heat; in humid heat it may help little or not at all.");
    else if (a.humidity === "dry" && p.fit.humidity === "humid") limits.push("It was studied in humid heat; dry heat may change how it performs.");
    else if (a.humidity && a.humidity !== "unsure") why.push(FIT.humidity[p.fit.humidity] + ".");
    if (a.water === "limited" && (p.fit.water === "high" || p.fit.water === "some")) limits.push(`${FIT.water[p.fit.water]}, which may be hard where water is limited.`);
    if (a.control && p.fit.control !== "none" && p.fit.control !== a.control && (CONTROL_RANK[p.fit.control] || 0) > (CONTROL_RANK[a.control] || 0)) limits.push(`${FIT.control[p.fit.control]}; you may need their agreement or support.`);
    return { shown: true, why, limits };
  }
  // comparison rows: the same fields for up to four practices; missing values read "Not reported"
  const ROWS = [["Domain", p => DOMAIN[p.domain]], ["Where documented", p => p.places.map(pl => pl.place).join("; ")], ["Climate", p => p.climates.map(c => CLIMATE[c]).join(", ")],
    ["Kinds of evidence", p => p.evidence.map(e => STATUS[e]).join("; ")], ["What it needs", p => Object.entries(p.requires || {}).filter(([, v]) => v && v !== "None").map(([k, v]) => `${k}: ${v}`).join("; ") || "Nothing beyond what most households have"],
    ["Labour", p => p.labour], ["Water", p => p.water], ["Costs", p => p.cost ? `${p.cost.text}` : "Not reported in the sources"], ["Upkeep and limits", p => p.fails_when], ["What is uncertain", p => p.uncertain]];
  const compareRows = list => ROWS.map(([label, f]) => [label, list.map(p => { const v = f(p); return v == null || v === "" ? "Not reported" : v; })]);
  const MAX_COMPARE = 4;

  return { DOMAIN, CATEGORY, CATEGORY_NOTE, CLIMATE, COUNTRY, STATUS, STATUS_NOTE, SETTING, FIT, STAKE, guidance, evidenceOf, KEYS, matches, readState, writeState, fit, compareRows, MAX_COMPARE };
}));
