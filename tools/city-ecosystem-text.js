#!/usr/bin/env node
// Common Shade: the words a city heat ecosystem profile shares with llms-full.txt (tools/build-city-ecosystem.js uses
// the same sentences), so the page and its text twin never differ. Data and gating: tools/city-ecosystem.js.
"use strict";
const E = require("./city-ecosystem.js");

const W = {
 eyebrow: "Cities",
 lede: "Who is working on heat in the city, what exactly they are doing, what anyone can use, and what is still only planned. Built from public sources, each line checked against its source.",
 jump: [["start", "Start here"], ["directory", "Who is doing what"], ["collective", "The Heat Collective"], ["themes", "Work by theme"], ["tools", "Tools and resources"], ["places", "Places and projects"], ["delivery", "Commitments and delivery"], ["orgs", "Organisations"], ["gaps", "What is not known"], ["method", "How this was made"]],
 h: { start: "Start here", directory: "Who is doing what", collective: null, themes: "Work by theme", tools: "Tools and resources", places: "Places and projects", delivery: "Commitments and delivery", money: "Money that has been announced", timeline: "What happened, and when", orgs: "Organisations", authorities: "Who has public authority to act", gaps: "What is not known", contradictions: "Where sources disagree", held: "Held back after the source check", method: "How this was made", contribute: "Correct or add to this profile" },
 directoryIntro: "Each card is one piece of work. The lead is named only where a source names one; collaborators carry the role a source gives them. A joint project appears once, under all its partners.",
 claimsNote: "Distinctions kept on every card: based in the city is not working in it; developing a tool that could serve the city is not using it there; announced money is not money spent; planned is not delivered.",
 themesIntro: "The same activities, grouped by what they work on. An activity can sit under several themes.",
 toolsIntro: "Things someone can open, read or ask for. A report can inform a decision without being a live tool, so each item says what kind of thing it is and whether the public can use it today.",
 placesIntro: "Where each piece of work happens, at the precision the sources give. No office address is used as a sign of where work is done, and no ward is placed on a map without a reliable boundary for it.",
 moneyIntro: "Each figure is attributed to whoever stated it and kept at the stage the source describes. A component is shown inside its parent, never added to it, and climate budgets are not counted as heat budgets. The figures are not summed.",
 timelineIntro: "Dated events, with plans kept apart from delivery. The date a source was checked is not a date the work moved.",
 orgsIntro: "One card per organisation, with its verified names. Membership of the Collective does not on its own establish a role in any piece of work.",
 authoritiesIntro: "Public bodies with responsibilities that touch heat in the city, under their current names. Older names are kept for older records.",
 gapsIntro: "Open questions, stated as gaps in what the sources show, not as failures of any organisation.",
 equity: [["mentioned", "Named or mentioned"], ["consulted", "Consulted"], ["governance", "In decisions or governance"], ["receiving", "Receiving the intervention"], ["benefit", "Evidence of benefit"]],
 contribute: "Know of work that is missing, a stage that has moved, or a name that is wrong? Tell us through the corrections page, with a public source; it is checked before anything changes.",
 notMember: "Common Shade is not a member, partner or representative of the Bengaluru Heat Collective, and this page does not speak for it or its members.",
};
const stage = s => E.STAGES[s] || s;
const rupee = m => m.label || `${m.approx ? "about " : ""}₹${m.amount} ${m.unit}`;
const fmtDate = d => { if (!d) return "Date not stated"; const [y, mo, da] = String(d).split("-"); const M = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]; return [da ? +da : "", mo ? M[+mo - 1] : "", y].filter(Boolean).join(" "); };

// the text twin for llms-full.txt
function md(P, SITE) {
 const url = `${SITE}/cities/${P.id}/${P.slug}/`, name = id => (P.orgById[id] || {}).name || id, L = [];
 L.push(`## ${P.title}`, `${W.lede} Page: ${url}`, P.scope, P.coalition ? W.notMember : "");
 P.orientation.forEach(o => L.push(o.text));
 if (P.collective && P.collective.ok) {
  const C = P.collective;
  L.push(`### ${C.name}`, `Launched ${fmtDate(C.event)}; announcements published ${C.published.map(p => `${fmtDate(p.date)} by ${name(p.by)}`).join(" and ")}.`, P.claimText["c-blr-members"] || "", `Priority areas named for the initial phase (priorities, not delivered work): ${C.priorities.map(p => p.text).join("; ")}.`, ...C.governance.known.filter(c => P.OK.has(c)).map(c => P.claimText[c]), C.governance.not_found);
 }
 L.push(`### ${W.h.directory}`, W.directoryIntro, W.claimsNote);
 P.activities.forEach(a => L.push(`- [${a.id}] ${a.title} (${stage(a.status)}). ${a.desc} Lead: ${a.lead ? name(a.lead) : "not named in the sources"}${a.lead_note ? ` (${a.lead_note})` : ""}. ${a.collaborators.length ? `With: ${a.collaborators.map(([o, r]) => `${name(o)} (${r})`).join("; ")}. ` : ""}Where: ${a.place} (${E.PRECISION[a.precision]}). ${a.people.length ? `People: ${a.people.join(", ")}. ` : ""}Evaluation: ${a.evaluation} Evidence: ${E.EVIDENCE[a.evidence]}. Sources: ${P.sourcesFor(a.claims).map(s => s.open + (s.archive ? ` (archived copy: ${s.archive})` : "")).join(" ")}`));
 if (P.tools.length) L.push(`### ${W.h.tools}`, W.toolsIntro);
 P.tools.forEach(t => L.push(`- ${t.name} (${E.KINDS[t.kind]}; ${E.ACCESS[t.access]}). Owner: ${name(t.owner)}. Supports: ${t.decision}. Coverage: ${t.coverage}. Resolution: ${t.resolution}. Limits: ${t.limits.join(" ")} Use in ${P.name}: ${t.city_use || t.bengaluru_use} ${t.url}`));
 L.push(`### ${W.h.money}`, P.money.length ? W.moneyIntro : `No announced money for heat work in ${P.name} was found in the sources reviewed.`);
 P.money.forEach(m => L.push(`- ${rupee(m)}: ${m.what}. ${stage(m.stage)}: ${m.stage_note}${m.parent ? ` Part of ${rupee(P.money.find(x => x.id === m.parent) || {})}, not in addition to it.` : ""} Heat-specific: ${m.heat}.`));
 L.push(`### ${W.h.timeline}`, ...P.timeline.map(t => `- ${fmtDate(t.date)} (${t.kind}): ${t.text}`));
 L.push(`### ${W.h.orgs}`, W.orgsIntro, ...P.orgs.map(o => `- ${o.name}${o.aliases.length ? ` (also ${o.aliases.join(", ")})` : ""}: ${o.coalition === "founding" ? "founding member of the Collective. " : ""}${o.verified ? o.summary : "Details held back until the source check confirms them."}${o.outside ? ` Outside ${P.name}: ${o.outside}` : ""}${o.unknowns.length ? ` Not known: ${o.unknowns.join(" ")}` : ""}`));
 L.push(`### ${W.h.authorities}`, ...P.authorities.map(a => `- ${a.name}${a.aliases.length ? ` (${a.aliases.join(", ")})` : ""}: ${a.role}`));
 L.push(`### ${W.h.gaps}`, ...P.gaps.map(g => `- ${g}`), `### ${W.h.contradictions}`, ...P.contradictions.map(c => `- ${c.text}`));
 if (P.held.length) L.push(`### ${W.h.held}`, ...P.held.map(h => `- ${h.name}`));
 return L.filter(Boolean).join("\n\n");
}

module.exports = { W, md, stage, rupee, fmtDate };
