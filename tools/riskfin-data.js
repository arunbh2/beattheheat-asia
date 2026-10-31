// Heat risk finance (research/2026-10/riskfin/R1-R7.json): one clean, display-ready dataset for /paying-when-heat-strikes/.
// Keeps the research's own safeguards: three triggers apart, money in its kind (never added up), "did it pay, and when?"
// for every scheme, and known / inferred / uncertain kept distinct. Links that failed the link check are left off.
"use strict";
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "research", "2026-10", "riskfin");
const R = n => JSON.parse(fs.readFileSync(path.join(DIR, `R${n}.json`), "utf8"));
const LS = fs.existsSync(path.join(DIR, "link-status.json")) ? JSON.parse(fs.readFileSync(path.join(DIR, "link-status.json"), "utf8")) : {};
const clean = u => String(u || "").replace(/[?&]utm_source=chatgpt\.com/, "");
const live = u => { const s = LS[u] || LS[clean(u)]; return !s || s.status !== "FAIL"; };
const arch = u => { const s = LS[u] || LS[clean(u)]; return s && s.archive ? s.archive : ""; };

// the site's humble voice: the research's recommendations become possibilities, never instructions
const HUMBLE = [[/\b(should|must) not be read as\b/gi, "is not the same as"], [/\b(should|must) not\b/gi, "would ideally not"], [/\b(should|must)\b/gi, "would ideally"],
  [/\bought to\b/gi, "could"], [/\bit is (essential|vital|crucial|imperative)\b/gi, "it matters"]];
// research fields are sometimes text, sometimes {text, source} objects or lists of them: read the words either way
const tx = v => v == null ? "" : Array.isArray(v) ? v.map(tx).filter(Boolean).join("; ") : typeof v === "object" ? tx(v.text ?? v.scheme ?? v.value ?? v.name ?? "") : /^not verified$/i.test(String(v).trim()) ? "" : String(v);
const MON = "January|February|March|April|May|June|July|August|September|October|November|December";
const tidy = s => s.replace(/([a-z\)]),(\d{4})/g, "$1, $2").replace(new RegExp("([a-z])(" + MON + ")", "g"), "$1 $2").replace(new RegExp("(" + MON + ")(\\d{4})", "g"), "$1 $2").replace(/([a-z])(\d{4})\b/g, "$1 $2");
// sentences that raise wrongdoing, even to deny it ("no mis-selling alleged"), are left out: the site describes what
// it could and could not see, never what someone did not do
const SUSPECT = new RegExp("\\b(" + require("../data/schema/tone.json").voice.suspicion.hold.join("|") + ")\\b|not (presented|described) as an? [^.;]*failure", "i");
const gentle = s => s.split(/(?<=[.;])\s+/).filter(x => !SUSPECT.test(x)).join(" ").replace(/;\s*$/, ".").trim();
const humble = t => { let s = gentle(tidy(tx(t))); if (!s) return ""; HUMBLE.forEach(([re, r]) => { s = s.replace(re, m => m[0] === m[0].toUpperCase() ? r[0].toUpperCase() + r.slice(1) : r); }); return s; };
const NV = v => v == null || v === "" || /^not verified$/i.test(String(v)) ? "" : v;
const src = s => s && s.url && live(s.url) ? { label: humble(s.label || s.title || "Source"), url: clean(s.url), archive: arch(s.url) } : null;

const MOD = [1, 2, 3, 4, 5, 6, 7].map(n => ({ n, d: R(n) }));
const SA = new Set(["India", "Bangladesh", "Pakistan", "Nepal", "Sri Lanka", "Bhutan", "Maldives"]);
const SEA = new Set(["Lao PDR", "Philippines", "Thailand", "Indonesia", "Viet Nam", "Cambodia", "Myanmar", "Singapore", "Malaysia", "Timor-Leste", "ASEAN+3 participating countries"]);
const region = cs => (cs || []).some(c => SA.has(c)) ? "sa" : (cs || []).some(c => SEA.has(c)) ? "sea" : "elsewhere";

// the five layers, from the money closest to people to the risk shared furthest away
const LAYERS = [
  { id: "social", name: "Through systems that already reach people", short: "Social protection", when: "every", text: "Cash transfers, employment guarantees, health cover and bill relief that pay more, or earlier, in a heatwave." },
  { id: "retain", name: "Money kept ready", short: "Budgets and reserves", when: "every", text: "Budgets, reserves and disaster funds that a government, city or organisation keeps for the heat it expects most years." },
  { id: "anticipatory", name: "Money released on a forecast", short: "Anticipatory action", when: "every", text: "Funds agreed in advance and released when a forecast crosses a threshold, so help arrives before the worst heat." },
  { id: "contingent", name: "Credit and budgets arranged in advance", short: "Contingent finance", when: "hard", text: "Credit lines and budget reallocations that can be drawn quickly when a declared or measured event exceeds what was kept." },
  { id: "transfer", name: "Risk shared with insurers and markets", short: "Insurance, pools and bonds", when: "extreme", text: "Insurance, regional pools and catastrophe bonds that pay when a contracted trigger is met, usually for rarer, more severe years." }];

// instruments: one entry per id, the first module's wording kept, later modules adding examples
const instruments = {};
MOD.forEach(({ n, d }) => (d.instruments || []).forEach(i => { if (instruments[i.id]) return; instruments[i.id] = { id: i.id, n: humble(i.name), def: humble(i.plain_definition), layer: i.layer, level: i.level,
  pays: humble(NV(i.who_pays)), gets: humble(NV(i.who_receives)), speed: humble(NV(i.speed)), good: humble(NV(i.strengths)), limits: humble(NV(i.limits)), basis: humble(NV(i.basis_risk)),
  poorest: i.reaches_poorest || "", poorestWhy: humble(NV(i.reaches_poorest_why)), loops: Array.isArray(i.loops) ? i.loops : [], module: n }; }));

// schemes: each record once; "did it pay, and when?" read from its payouts and its own never-triggered field
// what people covered can see and ask: phrased as what was visible to us, never as a judgement of the scheme
const OPEN_DEFAULT = "We could not yet see its full wording, or how people can ask a question or raise a concern. This reflects what was published, not how it works in practice.";
const OPEN_ROUTE = "Its documents describe a way for people to ask a question or raise a concern. We could not yet see how that works in practice.";
const openness = t => /feedback (mechanism|channel)|community feedback|feedback mechanisms|grievance route documented|dispute routes|complaint committees|green line/i.test(tx(t)) ? OPEN_ROUTE : OPEN_DEFAULT;
const PAYS = { paid: "Paid, amount and date traced", activated: "Activated, payment not traced here", never: "Never triggered", unknown: "Not known" };
const schemes = [], seen = new Set();
MOD.forEach(({ n, d }) => (d.schemes || []).forEach(s => {
  if (seen.has(s.id)) return; seen.add(s.id);
  const payouts = (s.payouts || []).map(p => ({ date: NV(p.date) || NV(p.year), amount: NV(p.amount), currency: NV(p.currency), usd: NV(p.usd), kind: p.kind, recipients: humble(NV(p.recipients)),
    days: humble(NV(p.days_to_payment)), channel: humble(NV(p.channel)), status: p.status, src: src(p.source) }));
  const paid = payouts.some(p => /paid|disbursed|reported/.test(p.status || "")) ? "paid" : String(s.never_triggered) === "true" ? "never" : String(s.never_triggered) === "false" ? "activated" : "unknown";
  const t = s.trigger || {};
  const sources = new Map(); JSON.stringify(s, (k, v) => { if (v && typeof v === "object" && v.url && /^https?:/.test(v.url)) { const x = src(v); if (x && !sources.has(x.url)) sources.set(x.url, x); } return v; });
  const size = s.size && NV(s.size.amount) ? { amount: s.size.amount, currency: s.size.currency, usd: NV(s.size.usd), kind: s.size.kind, scope: humble(NV(s.size.scope)), year: NV(s.size.year) } : null;
  const enrol = (s.enrolment || []).filter(e => NV(e.number)).map(e => ({ year: e.year, number: e.number, unit: e.unit }));
  schemes.push({ id: s.id, n: humble(s.name), inst: s.instrument, layer: s.layer, level: s.level, countries: s.countries || [], region: region(s.countries), status: s.status || "unclear",
    heat: s.heat_covered || "unclear", heatWhy: humble(NV(s.heat_basis)), covered: humble(NV(s.insured_or_covered)),
    trigger: { metric: humble(NV(t.metric) || (t.details && t.details.metric)), threshold: humble(NV(t.threshold)), kind: t.kind || "", data: humble(NV(t.data_source)), window: humble(NV(t.window)) },
    paid, payouts, size, enrol, premiumBy: humble(NV(s.premium && s.premium.paid_by)), basis: humble(NV(s.basis_risk)), fallback: humble(NV(s.fallback)),
    inclusion: s.inclusion || {}, protection: openness(s.consumer_protection), evidence: (s.evidence || []).map(e => ({ status: e.status, text: humble(e.text) })),
    providers: (s.providers || []).map(p => ({ n: p.name, role: p.role })), sources: [...sources.values()].slice(0, 8), module: n });
}));

const triggers = []; const tseen = new Set();
MOD.forEach(({ n, d }) => (d.triggers || []).forEach(t => { t = Object.assign({}, t.details || {}, t); const k = tx(t.metric).toLowerCase(); if (!k) return; if (tseen.has(k)) return; tseen.add(k);
  triggers.push({ metric: humble(t.metric), good: humble(NV(t.strengths)), weak: humble(NV(t.weaknesses)), humid: humble(NV(t.humid_heat)), asia: humble(NV(t.asia_data)), used: humble(t.used_in), module: n }); }));

const data = (R(6).data_infrastructure || []).map(x => ({ n: humble(x.name), owner: humble(NV(x.owner)), latency: humble(NV(x.latency)), res: humble(NV(x.resolution)), relevance: humble(NV(x.finance_relevance)), caveat: humble(NV(x.caveat)) }));

const layersByCountry = {};
MOD.forEach(({ d }) => (d.country_layers || []).forEach(c => { if (!(SA.has(c.country) || SEA.has(c.country))) return;
  (layersByCountry[c.country] = layersByCountry[c.country] || []).push({ layer: c.layer, holder: humble(NV(c.holder)), inst: humble(NV(c.instrument)), heat: c.heat_eligible || "unclear",
    trigger: humble(c.trigger && typeof c.trigger === "object" && !Array.isArray(c.trigger) ? [c.trigger.metric, c.trigger.threshold].filter(Boolean).map(tx).join(": ") || tx(c.trigger) : c.trigger), speed: humble(NV(c.speed)), lastMile: humble(NV(c.last_mile)), gap: humble(NV(c.gap)), idea: humble(NV(c.proposed_improvement)), src: src(c.source) }); }));

const actors = []; const aseen = new Set();
MOD.forEach(({ d }) => (d.actors || []).forEach(a => { const k = String(a.name).toLowerCase(); if (aseen.has(k)) return; aseen.add(k);
  actors.push({ n: a.name, side: a.side, type: a.type, role: humble(a.heat_role), geo: Array.isArray(a.geography) ? a.geography.join(", ") : humble(NV(a.geography)), url: a.url && live(a.url) ? clean(a.url) : "" }); }));

const rules = (R(7).country_regulation || []).filter(r => r.admitted_to_verified_rules_table !== false).map(r => ({ country: r.country, authority: r.authority, parametric: humble(NV(r.parametric_permission)),
  micro: humble(NV(r.microinsurance)), distribution: humble(NV(r.worker_and_mobile_distribution)), protection: humble(NV(r.consumer_protection)), src: src(r.source) }));

const effects = []; MOD.forEach(({ n, d }) => (d.evidence_of_effect || []).forEach(e => effects.push({ n: humble(e.intervention), place: humble(e.place), date: humble(e.date), design: humble(NV(e.design)),
  result: humble(NV(e.result)), status: e.status, limits: humble(NV(e.limits)), src: src(typeof e.source === "object" ? e.source : { url: e.source, label: "Source" }) })));

const unverified = []; MOD.forEach(({ n, d }) => (d.unverified_and_excluded || d.not_verified_or_excluded || d.unverified_or_excluded || []).forEach(u => unverified.push({ item: humble(u.item || u.finding), why: humble(u.reason || u.detail || u.finding || ""), module: n })));

const sources = []; const sseen = new Set();
MOD.forEach(({ n, d }) => (d.source_register || d.sources || []).forEach(s => { const u = clean(s.url); if (!u || sseen.has(u)) return; sseen.add(u);
  const st = LS[u] || LS[s.url] || {}; sources.push({ label: s.label || s.title || "", url: u, status: st.status || "not checked", archive: st.archive || "", module: n }); }));

const narrative = (R(1).narrative || []).map(x => ({ id: x.id, title: humble(x.title), text: humble(x.text), known: humble(x.known), inferred: humble(x.inferred), uncertain: humble(x.uncertain) }));
const challenges = (R(1).heat_design_challenges || []).map(c => ({ c: humble(c.challenge), design: humble(c.design_used), gap: humble(c.remaining_gap) }));

module.exports = { LAYERS, PAYS, instruments: Object.values(instruments), schemes, triggers, data, layersByCountry, actors, rules, effects, unverified, sources, narrative, challenges,
  checked: "2026-10-31", disclaimer: "Listing is not endorsement and is not financial, insurance or investment advice." };
