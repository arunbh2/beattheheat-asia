// Common Shade: the model behind How heat is reported (/how-heat-is-reported/), shared by the page (tools/build-media.js),
// the page script's data, the downloads and the check (tools/check-media.js).
// Two canonical sources, never copied into components:
//   research/2026-10/media/extreme-heat-journalism-2018-2026.csv   the curated collection (listing depth; ID column b00...)
//   research/2026-10/media/pilot/articles.json + exemplars.json    the multilingual pilot (full text, provisional coding)
// plus research/2026-10/media/editorial.json for definitions, examples, comparisons and the question kit.
// One record per unique URL. A story in both collections is one record with both memberships; publication records
// (memberships) and unique records are counted apart. Nothing missing is filled in: a field the source does not record
// stays null, and the page says "not recorded" or "not assessed".
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const DIR = path.join(ROOT, "research", "2026-10", "media");
const CSV = path.join(DIR, "extreme-heat-journalism-2018-2026.csv");
const J = f => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
const ED = J("editorial.json");

function parseCSV(t) {
  const rows = []; let row = [], f = "", q = false; t = t.replace(/^﻿/, "");
  for (let i = 0; i < t.length; i++) { const c = t[i];
    if (q) { if (c === '"' && t[i + 1] === '"') { f += '"'; i++; } else if (c === '"') q = false; else f += c; }
    else if (c === '"') q = true; else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && t[i + 1] === "\n") i++; row.push(f); rows.push(row); row = []; f = ""; }
    else f += c; }
  if (f || row.length) { row.push(f); rows.push(row); }
  const [h, ...b] = rows; return b.filter(r => r.length > 1).map(r => Object.fromEntries(h.map((k, i) => [k.trim(), (r[i] || "").trim()])));
}
const normUrl = u => String(u).trim().replace(/^https?:\/\/(www\.)?/i, "").split(/[?#]/)[0].replace(/\/+$/, "").toLowerCase();
const LANG = { en: "English", ne: "Nepali", vi: "Vietnamese", si: "Sinhala", id: "Indonesian", ur: "Urdu", bn: "Bengali", tl: "Filipino", ms: "Malay", th: "Thai" };
const RTL = new Set(["ur", "ar", "fa", "he", "dv", "ps", "sd", "ug", "yi"]);
const CTRY = c => c === "Lao People's Democratic Republic" ? "Lao PDR" : c;
const CAUTIONS = ["number_caution", "legal_caution", "metric_caution", "health_caution", "funding_disclosure", "author_interest", "scope"];
const CAUTION_LABEL = { number_caution: "On figures", legal_caution: "On the law", metric_caution: "On heat measures", health_caution: "On health advice", funding_disclosure: "Funding of the article", author_interest: "The author's role", scope: "Scope" };

// ---- the collection: listing depth ----
function collection() {
  return parseCSV(fs.readFileSync(CSV, "utf8")).filter(a => /^https?:\/\//.test(a["Full URL"])).map(a => {
    const lt = a["Link type"] || "", fmt = /podcast/i.test(lt) ? "podcast" : /opinion|commentary/i.test(lt) ? "opinion" : null;
    return { id: a.ID, url: a["Full URL"], title: a["Article title / headline"], outlet: a.Publication, year: +a.Year, date: a.Year, precision: "year",
      places: a.Geography.split(";").map(s => s.trim()).filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)), angle: a["Story angle"], link_type: lt,
      format: fmt, format_basis: fmt ? "the collection's link type" : null, language: "en", language_basis: "the listed headline" };
  });
}
// ---- the pilot: full text, provisional coding ----
function pilot() {
  const EX = Object.fromEntries(J("pilot/exemplars.json").map(e => [e.article_id, e]));
  return J("pilot/articles.json").map(a => Object.assign({}, a, { exemplar: EX[a.id] || null }));
}

// a reporting trail from the reviewed fields only: each row says what the review found, in one of four states
function trail(a) {
  const S = ED.trail_states, E = a.exemplar, n = a.notes || {}, row = (k, label, state, text, basis) => ({ k, label, state, stateLabel: S[state], text, basis });
  const fr = ED.frames[a.frame_primary] || a.frame_primary, data = (a.data_used || []).filter(d => d !== "none");
  const R = [];
  R.push(row("harm", "Harm or exposure reported", "described", `Framed mainly as ${fr}${(a.frames_secondary || []).length ? `, also ${a.frames_secondary.map(f => ED.frames[f] || f).join(" and ")}` : ""}. ${data.length ? `Cites ${data.join(", ")}.` : "Cites no figures."}`, "pilot coding"));
  R.push((a.actors_quoted || []).length
    ? row("voices", "Whose experience is included", "described", `Quoted: ${a.actors_quoted.join(", ")}. ${a.voice_of_affected === "yes" ? "Affected people speak in their own words." : "No directly affected person quoted under the codebook's definition."}`, "pilot coding")
    : row("voices", "Whose experience is included", "not_found", "No quoted speakers identified in the reviewed text.", "pilot coding"));
  R.push(E ? row("responsible", "Who is described as responsible", "described", E.who_decides, "reviewer's note")
           : row("responsible", "Who is described as responsible", "not_assessed", "Not coded separately for this record; the protection note below covers it where present.", null));
  const unk = /\b(unpublished|undisclosed|not disclosed)\b/i;
  R.push(E ? row("resources", "Funding or resources mentioned", unk.test(a.mm_evidence) ? "unknown" : "described", E.who_pays, "reviewer's note")
           : data.includes("budget figures") ? row("resources", "Funding or resources mentioned", "described", "Cites budget figures.", "pilot coding")
           : row("resources", "Funding or resources mentioned", "not_assessed", "Not coded separately for this record.", null));
  R.push(row("delivery", "How protection is organised or delivered", a.missing_middle >= 2 ? "described" : "not_found", a.mm_evidence, "reviewer's note on the passage"));
  R.push(E ? row("checks", "Who checks, and how", "described", E.who_checks, "reviewer's note")
           : row("checks", "Who checks, and how", "not_assessed", "Not coded separately for this record.", null));
  R.push(a.followup === "yes" ? row("followup", "Follow-up or outcomes reported", "described", `Revisits an earlier action or incident.${n.followup_basis ? " " + n.followup_basis : ""}`, "pilot coding")
                              : row("followup", "Follow-up or outcomes reported", "not_found", "No specific earlier promise or intervention revisited in the reviewed text.", "pilot coding"));
  const cs = CAUTIONS.filter(k => n[k]);
  R.push(cs.length ? row("open", "What it leaves open, or a caution on reuse", "described", cs.map(k => `${CAUTION_LABEL[k]}: ${n[k]}`).join(" "), "reviewer's caution")
                   : row("open", "What it leaves open, or a caution on reuse", "not_assessed", "No caution recorded.", null));
  return R;
}

let _cache = null;
function records() {
  if (_cache) return _cache;
  const C = collection(), P = pilot(), byUrl = new Map(), out = [];
  for (const a of P) {
    const r = { id: a.id, aliases: a.notes && a.notes.legacy_id ? [a.notes.legacy_id] : [], url: a.url, collections: ["pilot"], depth: "full",
      title: a.title, title_en: a.language !== "en" ? (a.title_en || null) : null,
      translation: a.language === "en" ? "not-needed" : a.title_en ? "researcher" : "not-recorded",
      language: a.language, language_basis: "the article", outlet: a.outlet, original_outlet: a.original_outlet !== a.outlet ? a.original_outlet : null,
      date: a.date, precision: "day", year: +a.date.slice(0, 4), places: a.country_focus.map(CTRY), format: a.format, format_basis: "pilot coding",
      angle: null, link_type: null, summary: a.summary_plain,
      loops: a.loop_ids || [], organised: a.missing_middle >= 2, followup: a.followup === "yes", voice: a.voice_of_affected === "yes", budget: (a.data_used || []).includes("budget figures"),
      pops: { workers: a.informal_work === "yes" || (a.actors_quoted || []).includes("worker"), women: a.gender_or_care === "yes", children: (a.loop_ids || []).includes("school") },
      outlet_type: a.notes.outlet_type || null, syndication: a.notes.syndication || (a.notes.syndicated_url ? `Also published at ${a.notes.syndicated_url}` : null),
      checked: a.notes.last_checked || null, exemplar: !!a.exemplar, trail: trail(a) };
    byUrl.set(normUrl(a.url), r); out.push(r);
  }
  for (const c of C) {
    const hit = byUrl.get(normUrl(c.url));
    if (hit) { hit.collections.unshift("collection"); if (!hit.aliases.includes(c.id)) hit.aliases.push(c.id); hit.angle = c.angle; hit.link_type = c.link_type; c.places.forEach(p => { if (!hit.places.includes(p)) hit.places.push(p); }); continue; }
    const r = Object.assign({}, c, { aliases: [], collections: ["collection"], depth: "listing", title_en: null, translation: "not-needed", original_outlet: null, summary: null,
      loops: [], organised: null, followup: null, voice: null, budget: null, pops: { workers: null, women: null, children: null }, outlet_type: null, syndication: null, checked: null, exemplar: false, trail: null });
    byUrl.set(normUrl(c.url), r); out.push(r);
  }
  out.sort((a, b) => String(b.date).localeCompare(String(a.date)) || a.outlet.localeCompare(b.outlet));
  _cache = { records: out, collection: C, pilot: P };
  return _cache;
}

// counts, always from the records, each with its denominator
function stats() {
  const { records: R, collection: C, pilot: P } = records();
  const inC = R.filter(r => r.collections.includes("collection")), inP = R.filter(r => r.collections.includes("pilot"));
  const both = R.filter(r => r.collections.length > 1);
  // the collection's own statistics come from its rows, so a record shared with the pilot keeps the collection's places
  const byYear = {}; C.forEach(r => byYear[r.year] = (byYear[r.year] || 0) + 1);
  const cGeo = k => C.filter(r => r.places.some(p => p.toLowerCase().includes(k.toLowerCase()))).length;
  return {
    unique: R.length, memberships: C.length + P.length, collection: C.length, pilot: P.length, both: both.length, bothIds: both.map(r => r.id),
    byYear, years: Object.keys(byYear).map(Number).sort(), outlets: new Set(C.map(r => r.outlet)).size, cGeo, inC: inC.length, inP: inP.length,
    cNone: ["Nepal", "Viet Nam", "Indonesia", "Sri Lanka", "Pakistan"].filter(k => !cGeo(k === "Viet Nam" ? "Viet" : k)),
    pNonEn: inP.filter(r => r.language !== "en").length, pLangs: new Set(inP.map(r => r.language)).size,
    pCountries: new Set(inP.filter(r => r.places.length === 1).map(r => r.places[0])).size,
    pOrganised: inP.filter(r => r.organised).length, pFollowup: inP.filter(r => r.followup).length, pVoice: inP.filter(r => r.voice).length, pBudget: inP.filter(r => r.budget).length,
    pTranslated: inP.filter(r => r.translation === "researcher").length, pTitleNoEn: inP.filter(r => r.translation === "not-recorded").length,
    pYears: [Math.min(...inP.map(r => r.year)), Math.max(...inP.map(r => r.year))]
  };
}

// the facets the explorer offers, each from recorded values only; "not recorded" and "not assessed" are their own options
function facets() {
  const R = records().records, count = (f) => { const m = new Map(); R.forEach(r => [].concat(f(r)).forEach(v => m.set(v, (m.get(v) || 0) + 1))); return [...m.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]))); };
  return {
    place: count(r => r.places), language: count(r => r.language), year: count(r => String(r.year)).sort((a, b) => b[0].localeCompare(a[0])),
    format: count(r => r.format || "not-recorded"), collection: count(r => r.collections), depth: count(r => r.depth),
    loop: count(r => r.loops.length ? r.loops : ["not-assessed"]),
    pop: count(r => r.depth !== "full" ? ["not-assessed"] : Object.entries(r.pops).filter(([, v]) => v).map(([k]) => k).concat(Object.values(r.pops).some(Boolean) ? [] : ["none-coded"]))
  };
}

// the question kit: a suggested question and what to look at, from a topic, a place and a population
function kit(topicId, place, popId) {
  const K = ED.kit, T = K.topics.find(t => t.id === topicId) || K.topics[0], P = K.populations[popId] || K.populations.any;
  const R = records().records, re = new RegExp(T.angle, "i");
  const placeOk = r => !place || r.places.some(p => p === place);
  const popOk = r => !P.match || (r.depth === "full" && r.pops[P.match]);
  const topicOk = r => r.loops.some(l => T.loops.includes(l)) || (r.angle && re.test(r.angle));
  const recs = R.filter(r => topicOk(r) && placeOk(r) && popOk(r));
  return { topic: T, pop: P, place: place || "", q: T.q.replace("{place}", place || "the place you report on").replace("{pop}", P.text), records: recs };
}

module.exports = { ROOT, DIR, ED, LANG, RTL, CTRY, normUrl, parseCSV, collection, pilot, records, stats, facets, trail, kit };
