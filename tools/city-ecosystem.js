#!/usr/bin/env node
// Common Shade: city heat ecosystem profiles ("who is doing what about heat?"), one file per city in
// data/city-ecosystems/<city>.json (build-only; schema in data/city-ecosystems/README.md). This module loads a profile,
// gates it against its research batch (research/2026-11/<batch>/confirmed.json, written by gate.js after
// verify-sources.yml) and validates it. Anything whose claims did not all pass is held back and listed, never shown.
// Shared by the builder (tools/build-city-ecosystem.js), the text twin, the cities pages and the check.
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const DIR = path.join(ROOT, "data", "city-ecosystems");

// what a stage means; money and activities keep them apart and never promote one to the next
const STAGES = {
 proposed: "Proposed", announced: "Announced", planned: "Planned", allocated: "Allocated", approved: "Approved", underway: "Underway",
 completed: "Completed", disbursed: "Disbursed", spent: "Spent", delivered: "Delivered", evaluated: "Evaluated", not_stated: "Stage not stated"
};
const ACTIVITY_STAGES = ["proposed", "announced", "planned", "underway", "completed", "evaluated", "not_stated"];
const MONEY_STAGES = ["proposed", "announced", "allocated", "approved", "disbursed", "spent", "delivered", "evaluated"];
// tool access, as the reader can act on it
const ACCESS = {
 public: "Publicly usable", registration: "Registration required", institutional: "Institutional access", request: "Available on request",
 announced: "Announced, not yet public", in_development: "In development", not_verified: "Public access not verified", unavailable: "Unavailable when checked"
};
const KINDS = { dashboard: "Interactive dashboard", forecast: "Forecast or warning service", dataset: "Dataset", planning: "Planning or assessment method",
 charter: "Checklist or charter", training: "Training resource", report: "Research report" };
const BUTTONS = ["Open tool", "Read guidance", "View project", "Access details"];
const ORG_TYPES = { research: "Research or think tank", health: "Health institution", community: "Worker or community organisation", network: "Network or forum",
 authority: "Public authority", funder: "Funder", ngo: "NGO or civil society", humanitarian: "Humanitarian organisation", multilateral: "International or UN agency", business: "Business or consultancy" };
const EVIDENCE = { own: "The organisation's own account", independent: "Independent reporting", both: "Own account and independent reporting" };
const PRECISION = { sites: "Named sites", ward: "One ward", wards: "Wards", neighbourhoods: "Neighbourhoods", corporation: "One city corporation", city: "City-wide",
 district: "District", state: "State" };

const cities = () => fs.existsSync(DIR) ? fs.readdirSync(DIR).filter(f => /^[a-z-]+\.json$/.test(f)).map(f => f.replace(/\.json$/, "")) : [];
const raw = id => JSON.parse(fs.readFileSync(path.join(DIR, id + ".json"), "utf8"));

function confirmed(batch) {
 const f = path.join(ROOT, "research", "2026-11", batch, "confirmed.json");
 return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : [];
}
function claimsOf(batch) {
 const f = path.join(ROOT, "research", "2026-11", batch, "claims.json");
 return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : { sources: [], claims: [] };
}
// the date the source check last read the batch: shown as "Sources checked", never as a date the work progressed
// (the date of the commit that wrote the checker's results; the file itself carries no date)
function checkedOn(batch) {
 const rel = path.join("data", "inbox", "2026-11-" + batch, "link-check.json");
 if (!fs.existsSync(path.join(ROOT, rel))) return null;
 try { return require("child_process").execFileSync("git", ["log", "-1", "--format=%cs", "--", rel], { cwd: ROOT, encoding: "utf8" }).trim() || null; } catch (e) { return null; }
}

function load(id) {
 // a batch shared by several cities: each profile counts and cites only its own claims (claims.json "where" equals claim_scope)
 const P = raw(id), mine = c => !P.claim_scope || c.where === P.claim_scope, C = confirmed(P.batch).filter(mine), OK = new Set(C.map(c => c.id)), CL0 = claimsOf(P.batch), CL = Object.assign({}, CL0, { claims: CL0.claims.filter(mine) });
 const byClaim = Object.fromEntries(C.map(c => [c.id, c]));
 const pass = ids => (ids || []).every(c => OK.has(c));
 const held = [];
 const keep = (list, kind, name) => (list || []).filter(x => { const ok = pass(x.claims || x.summary_claims); if (!ok) held.push({ kind, id: x.id, name: name(x), missing: (x.claims || x.summary_claims || []).filter(c => !OK.has(c)) }); return ok; });
 const orgs = (P.orgs || []).map(o => Object.assign({}, o, { verified: pass(o.summary_claims) }));
 const out = Object.assign({}, P, {
  orgs,
  authorities: keep(P.authorities, "authority", x => x.name),
  activities: keep(P.activities, "activity", x => x.title),
  tools: keep(P.tools, "tool", x => x.name),
  money: keep(P.money, "money", x => `${x.label || `₹${x.amount} ${x.unit}`}: ${x.what}`),
  timeline: keep(P.timeline, "timeline", x => x.text),
  contradictions: keep(P.contradictions, "contradiction", x => x.text),
  orientation: keep(P.orientation, "orientation", x => x.text),
  held, OK, byClaim, claimText: Object.fromEntries(CL.claims.map(c => [c.id, c.text])), checked: checkedOn(P.batch), nConfirmed: C.length, nClaims: CL.claims.length
 });
 // an activity a held collaborator or lead points to still shows; an org whose summary failed shows its name and membership only
 out.orgById = Object.fromEntries([...orgs, ...(P.authorities || []), ...(P.extra_orgs || [])].map(o => [o.id, o]));
 // what the reader opens: a forum post's normal page, not the plain-text address the checker read; and, where the original
 // blocked automated readers and the check used an archived copy, that copy as well
 const inbox = (() => { try { const dir = path.join(ROOT, "data", "inbox", "2026-11-" + P.batch); const S = JSON.parse(fs.readFileSync(path.join(dir, "sources.json"), "utf8")), L = JSON.parse(fs.readFileSync(path.join(dir, "link-check.json"), "utf8")); return Object.fromEntries(S.map(r => [r.url, { archive: r.archive, status: String(L[r.url] || "") }])); } catch (e) { return {}; } })();
 const readable = u => u.replace(/^(https:\/\/[^/]+)\/raw\/(\d+)\/(\d+)$/, (m, h, t, n) => `${h}/t/${t}/${n}`);
 out.sourcesFor = ids => { const seen = new Map(); (ids || []).forEach(c => ((byClaim[c] || {}).sources || []).forEach(s => { const i = inbox[s.url] || {}; seen.set(s.url, Object.assign({}, s, { open: readable(s.url), archive: /^BLOCKED/.test(i.status) && i.archive ? i.archive : null })); })); return [...seen.values()]; };
 out.collective = P.coalition ? Object.assign({}, P.coalition, { ok: pass(P.coalition.purpose_claims) && pass(P.coalition.members_claims) }) : null;
 return out;
}

// refuses what would mislead: unknown labels, references to nothing, a component added to its parent, a lead not named
function validate(P) {
 const bad = [], ids = new Set(), seenId = x => { if (ids.has(x)) bad.push(`duplicate id ${x}`); ids.add(x); };
 const known = new Set([...(P.orgs || []), ...(P.authorities || []), ...(P.extra_orgs || [])].map(o => o.id));
 (P.orgs || []).forEach(o => { seenId(o.id); if (!ORG_TYPES[o.type]) bad.push(`${o.id}: type "${o.type}"`); if (!o.summary_claims || !o.summary_claims.length) bad.push(`${o.id}: no claims behind its summary`); (o.activities || []).forEach(a => { if (!(P.activities || []).some(x => x.id === a)) bad.push(`${o.id}: activity ${a} not found`); }); });
 (P.authorities || []).forEach(a => seenId(a.id));
 const themes = new Set((P.themes || []).map(t => t[0]));
 (P.activities || []).forEach(a => {
  seenId(a.id);
  if (!ACTIVITY_STAGES.includes(a.status)) bad.push(`${a.id}: status "${a.status}"`);
  if (a.lead && !known.has(a.lead)) bad.push(`${a.id}: lead ${a.lead} unknown`);
  (a.collaborators || []).forEach(([o, role]) => { if (!known.has(o)) bad.push(`${a.id}: collaborator ${o} unknown`); if (!role) bad.push(`${a.id}: collaborator ${o} has no role`); if (o === a.lead) bad.push(`${a.id}: ${o} is both lead and collaborator`); });
  (a.themes || []).forEach(t => { if (!themes.has(t)) bad.push(`${a.id}: theme ${t}`); });
  if (!PRECISION[a.precision]) bad.push(`${a.id}: precision "${a.precision}"`);
  if (!EVIDENCE[a.evidence]) bad.push(`${a.id}: evidence "${a.evidence}"`);
  if (!a.claims || !a.claims.length) bad.push(`${a.id}: no claims`);
 });
 (P.tools || []).forEach(t => {
  seenId(t.id);
  if (!ACCESS[t.access]) bad.push(`${t.id}: access "${t.access}"`);
  if (!KINDS[t.kind]) bad.push(`${t.id}: kind "${t.kind}"`);
  if (!BUTTONS.includes(t.button)) bad.push(`${t.id}: button "${t.button}"`);
  if (t.button === "Open tool" && t.access !== "public") bad.push(`${t.id}: "Open tool" needs a publicly usable tool`);
  if (!known.has(t.owner)) bad.push(`${t.id}: owner ${t.owner} unknown`);
 });
 const money = P.money || [];
 money.forEach(m => {
  seenId(m.id);
  if (!MONEY_STAGES.includes(m.stage)) bad.push(`${m.id}: stage "${m.stage}"`);
  if (m.parent) { const p = money.find(x => x.id === m.parent); if (!p) bad.push(`${m.id}: parent ${m.parent} not found`); else if (m.amount > p.amount) bad.push(`${m.id}: larger than its parent`); }
 });
 return bad;
}
// money never summed across records; a component is shown inside its parent, so a total of independent records only
const independentMoney = P => (P.money || []).filter(m => !m.parent);

module.exports = { cities, raw, load, validate, independentMoney, STAGES, ACTIVITY_STAGES, MONEY_STAGES, ACCESS, KINDS, BUTTONS, ORG_TYPES, EVIDENCE, PRECISION };
