// Living evidence: screening and rule-based extraction for candidate studies (no AI service, no cost).
// Every extracted value is copied from the title or abstract together with the sentence it came from, so a reviewer
// can check it at a glance. Nothing is inferred: a field the text does not state stays empty. These are suggestions
// for the human reviewer, never published until signed off (see data/evidence/README.md).
"use strict";

const STREAMS = {
  "heat-health": { label: "Heat and health", re: /\b(heat[- ]?(wave|waves|stress|stroke|illness|exposure|related|health)|extreme heat|high temperatures?|wet[- ]bulb|thermal stress|hot weather)\b[\s\S]{0,400}\b(mortality|deaths?|morbidity|hospital|admissions?|emergency|illness|health|kidney|pregnan\w*|birth|sleep|mental|workers?|productivity|labou?r)\b|\b(mortality|deaths?|morbidity|admissions?|health|productivity)\b[\s\S]{0,400}\b(heat[- ]?(wave|waves|stress|exposure)|extreme heat|high temperatures?)\b/i },
  "passive-cooling": { label: "Passive cooling", re: /\b(cool roofs?|roof (coating|paint|insulation)|reflective|albedo|green roofs?|shading|shade|natural ventilation|passive (cooling|design)|street trees?|urban (greening|green space|forest)|tree canopy|thermal comfort|indoor (temperature|overheating)|evaporative cooling|nature-based)\b/i },
  "heat-finance": { label: "Heat finance", re: /\b(parametric|insurance|index[- ]based|microinsurance|cash transfers?|social protection|credit|loans?|finance|financing|budget|public spending|cost[- ]benefit|willingness to pay|anticipatory (action|cash))\b[\s\S]{0,300}\b(heat|temperature|heatwave)\b|\b(heat|heatwave)\b[\s\S]{0,300}\b(parametric|insurance|cash transfers?|financing|cost[- ]benefit|willingness to pay)\b/i }
};
const COUNTRIES = ["India", "Bangladesh", "Nepal", "Sri Lanka", "Pakistan", "Bhutan", "Maldives", "Afghanistan", "Myanmar", "Thailand", "Cambodia", "Lao PDR", "Laos", "Viet Nam", "Vietnam",
  "Malaysia", "Singapore", "Indonesia", "Philippines", "Timor-Leste", "Brunei", "South Asia", "Southeast Asia", "South-East Asia"];
const CITIES = ["Ahmedabad", "Delhi", "New Delhi", "Mumbai", "Kolkata", "Chennai", "Hyderabad", "Bengaluru", "Bangalore", "Pune", "Nagpur", "Bhubaneswar", "Surat", "Lucknow", "Jaipur",
  "Dhaka", "Chattogram", "Chittagong", "Khulna", "Kathmandu", "Colombo", "Karachi", "Lahore", "Islamabad", "Bangkok", "Chiang Mai", "Phnom Penh", "Hanoi", "Ho Chi Minh City",
  "Jakarta", "Surabaya", "Manila", "Quezon City", "Cebu", "Kuala Lumpur", "Yangon", "Mandalay", "Vientiane", "Singapore"];
const PLACE_RE = new RegExp(`\\b(${COUNTRIES.concat(CITIES).map(s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "g");
const DESIGNS = [["meta-analysis", /meta-analys[ie]s/i], ["systematic review", /systematic review/i], ["randomised trial", /randomi[sz]ed (controlled )?trial|\bRCT\b/i],
  ["quasi-experimental", /quasi-experiment|difference-in-differences|regression discontinuity|natural experiment/i], ["case-crossover", /case-crossover/i],
  ["time-series", /time[- ]series|distributed lag/i], ["cohort", /\bcohort\b/i], ["cross-sectional survey", /cross-sectional|\bsurvey(ed)?\b/i],
  ["field measurement", /field (measurement|experiment|study|monitoring)|measured|monitoring|sensors?|data loggers?/i], ["qualitative", /qualitative|interviews|focus group/i],
  ["modelling", /simulat\w+|model(l)?ing|projection|scenario/i], ["review", /\breview\b/i]];
// signs of new data, as against a commentary
const EMPIRICAL = /\b(we (measured|surveyed|recruited|analy[sz]ed|estimated|collected|interviewed|found)|participants|respondents|households|data from|records|registry|observ(ed|ational)|cohort|trial|survey|measured|n\s*=\s*\d|\d[\d,]*\s+(deaths|cases|workers|people|households))/i;

const sentences = t => String(t || "").replace(/\s+/g, " ").split(/(?<=[.!?])\s+(?=[A-Z(])/).filter(Boolean);
const clip = s => s.length > 300 ? s.slice(0, 297) + "..." : s;
// the first match of re anywhere in the text, with the sentence it sits in
function find(text, re, value = m => m[0]) {
  for (const s of sentences(text)) { const m = s.match(re); if (m) return { value: value(m).trim(), quote: clip(s.trim()) }; }
  return null;
}
function findAll(text, re, value = m => m[0], max = 3) {
  const out = [];
  for (const s of sentences(text)) { const m = s.match(re); if (m) out.push({ value: value(m).trim(), quote: clip(s.trim()) }); if (out.length >= max) break; }
  return out;
}

function extract(rec) {
  const text = [rec.title, rec.abstract].filter(Boolean).join(". ");
  const places = [...new Set((text.match(PLACE_RE) || []).map(p => ({ "Vietnam": "Viet Nam", "New Delhi": "Delhi", "Bangalore": "Bengaluru", "Chittagong": "Chattogram", "Laos": "Lao PDR", "South-East Asia": "Southeast Asia" }[p] || p)))];
  const unitWords = "participants|households|workers|respondents|patients|deaths|children|women|men|individuals|people|students|homes|houses|buildings|dwellings|cases|admissions|districts|cities|villages|farmers|mothers|births|pregnancies";
  const sample = find(text, new RegExp(`\\b(n\\s*=\\s*[\\d,]+|[\\d,]{2,}\\s+(${unitWords}))\\b`, "i"));
  const deltaC = find(text, /(-|−|by |of |up to |about |approximately |~)?\d+(\.\d+)?\s*(°\s?C|℃|degrees? (Celsius|C)\b|K\b)/i);
  // "9.2% increase in mortality" is read before "mortality rose by 9.2%", so the clearer wording wins
  const OUTCOME = "mortality|deaths?|admissions|hospitali[sz]ations?|morbidity|productivity|output|risk|income|earnings|visits";
  const pct = find(text, new RegExp(`\\b\\d+(\\.\\d+)?\\s?%[^.;]{0,60}\\b(${OUTCOME})\\b`, "i")) ||
    find(text, new RegExp(`\\b(${OUTCOME})\\b(?![^.;]{0,12}records)[^.;]{0,60}\\b\\d+(\\.\\d+)?\\s?%`, "i"));
  const ratio = find(text, /\b(RR|OR|HR|IRR|relative risk|odds ratio|hazard ratio|rate ratio)\b\s*[:=]?\s*\(?\s*\d+\.\d+(\s*[,;(]\s*95\s?%\s?CI[^)]*\)?)?/i);
  const cost = find(text, /(US\$|USD|\$|INR|Rs\.?|₹|BDT|Tk\.?|PHP|₱|IDR|Rp\.?|THB|฿|VND|₫|LKR|NPR|PKR|MYR|SGD)\s?\d[\d,.]*\s?(k|million|billion|crore|lakh)?[^.;]{0,50}?\b(per|\/|each|a)\s?(m2|m²|square metre|sq\.? ?m|household|home|house|unit|person|capita|worker|year|month|day|roof|tree|building|policy|beneficiary)\b/i);
  const zone = find(text, /\b(hot[- ]humid|warm[- ]humid|hot[- ]dry|composite climate|semi-arid|arid|tropical (monsoon|savanna|wet|rainforest)|subtropical|humid subtropical|coastal|highland|Köppen\s*[A-Z][a-z]?[a-z]?|agro-?climatic zone[^.;,]{0,40})\b/i);
  const failures = findAll(text, /\b(however|limitation|limited|failed|did not|no significant|not significant|barriers?|maintenance|low uptake|uptake was|constraints?|challenges?|unintended|maladapt\w*|trade-?offs?|unaffordable|inequit\w+)\b/i, m => m[0], 2);
  const design = DESIGNS.filter(([, re]) => re.test(text)).map(([d]) => d);
  return {
    sample_size: sample, geography: places.length ? { value: places.join("; "), quote: "" } : null, agro_climatic_zone: zone,
    effect_size_c: deltaC, effect_size_pct: pct || ratio, unit_cost: cost, failure_modes: failures.length ? failures : null, design: design.length ? design : null
  };
}

// screening: in scope, set in South or Southeast Asia, and reporting new data
function screen(rec) {
  const text = [rec.title, rec.abstract].filter(Boolean).join(". ");
  // every stream is about heat: a word like "shade" or "finance" alone is not enough
  const heat = /\b(heat\w*|hot|temperatures?|thermal|cooling|warming|wet[- ]bulb|WBGT)\b/i.test(text);
  const streams = heat ? Object.entries(STREAMS).filter(([, s]) => s.re.test(text)).map(([k]) => k) : [];
  const asia = PLACE_RE.test(text); PLACE_RE.lastIndex = 0;
  const empirical = EMPIRICAL.test(text);
  const reviewOnly = /\b(systematic review|scoping review|narrative review|meta-analysis|commentary|editorial|perspective)\b/i.test(rec.title || "");
  const reasons = [];
  if (!streams.length) reasons.push("not about heat-health, passive cooling or heat finance");
  if (!asia) reasons.push("no South or Southeast Asian setting named");
  if (!empirical && !reviewOnly) reasons.push("no sign of new data in the title or abstract");
  if (!rec.abstract) reasons.push("no abstract to read");
  const score = streams.length * 2 + (asia ? 3 : 0) + (empirical ? 2 : 0) + (reviewOnly ? 1 : 0) + (rec.abstract ? 1 : 0);
  return { keep: streams.length > 0 && asia && (empirical || reviewOnly), streams, reasons, score };
}

// a first guess at the cycle a study speaks to, from its words; the reviewer decides
const CYCLE_HINTS = [["invisible", /under-?report|death (certificat|record)|excess mortality|unrecorded|attribut\w+ deaths/i], ["clinic", /hospital|emergency|admissions|health (system|facilit)|clinic/i],
  ["sleep", /\bsleep|night-?time/i], ["school", /school|students|learning|exam/i], ["poverty", /informal workers|wages?|earnings|income|productivity|labou?r/i],
  ["energypoverty", /electricity (bill|cost)|energy poverty|fans?\b|air[- ]condition/i], ["cooling", /air[- ]condition|cooling demand|refrigerant|cool roof|passive cooling|shading/i],
  ["deadgreen", /tree|green space|urban green|canopy|park/i], ["greendisplace", /green gentrification|displacement/i], ["protection", /insurance|parametric|protection gap/i],
  ["squeeze", /credit|loan|lending/i], ["farmdebt", /farmer|crop|agricultur/i], ["reactive", /budget|spending|anticipatory|early action/i], ["debt", /out-of-pocket|medical (debt|expense)/i]];
const suggestCycles = rec => { const t = [rec.title, rec.abstract].join(" "); return CYCLE_HINTS.filter(([, re]) => re.test(t)).map(([id]) => id).slice(0, 3); };

module.exports = { extract, screen, suggestCycles, STREAMS, COUNTRIES, sentences };
