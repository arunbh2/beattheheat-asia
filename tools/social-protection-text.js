// Common Shade: the words /social-protection/ and llms-full.txt share, so the page and the text for AI systems never
// differ. Data: SOCIAL_PROTECTION (one file per country in data/social-protection/, read by tools/data-blocks.js).
"use strict";
const TITLE = "Who could help a household through a hot season", SLUG = "social-protection";
const SITUATIONS = [["work", "Lost work or earnings"], ["health", "Illness or hospital costs"], ["older", "Older age"], ["disability", "Disability"],
  ["farm", "Crop or livestock loss"], ["moved", "Moved for work"], ["food", "Food"], ["disaster", "After a disaster"], ["income", "Income support"]];
const STEPS = [["aware", "Aware"], ["eligible", "Eligible"], ["documented", "Documented"], ["applied", "Applied"], ["enrolled", "Enrolled"],
  ["received", "Received"], ["adequate", "Adequate"], ["on time", "On time"]];
const STATUS = { current: "Current", changed: "Changed recently", closed: "Closed", unclear: "Status unclear" };
const PORTABLE = { yes: "Follows people who move", partly: "Partly follows people who move", no: "Does not follow people who move", unknown: "Not known whether it follows people who move" };
const SHOCK = { yes: "Can respond to a shock", partly: "Can partly respond to a shock", no: "Not designed to respond to a shock", unknown: "Not known whether it responds to a shock" };
const GRADE = { KNOWN: "Confirmed in the sources", INFERRED: "Inferred from the sources", UNCERTAIN: "Not yet confirmed" };
const TYPE = { cash: "Cash", pension: "Pension", food: "Food", "public-works": "Public works", credit: "Credit", health: "Health care", insurance: "Insurance",
  "welfare-fund": "Workers' welfare fund", relief: "Disaster relief", livelihood: "Livelihood support" };
const NOT_CONFIRMED = "Not confirmed in the source we checked; see the source.";
const date = d => { if (!d) return ""; const [y, m, dd] = d.split("-"); const M = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return dd ? `${+dd} ${M[+m - 1]} ${y}` : m ? `${M[+m - 1]} ${y}` : y; };
const counts = SP => ({ countries: SP.length, schemes: SP.reduce((s, f) => s + f.schemes.length, 0), routes: SP.reduce((s, f) => s + f.routes.length, 0) });
const plainSrc = list => (list || []).map(x => `${x.label} ${x.url}`).join("; ");

// the whole page as plain text, for llms-full.txt
function md(SP, SITE) {
  const n = counts(SP), out = [`## ${TITLE}`, `${SITE}/${SLUG}/`,
    `Public schemes that could cushion a household through a hot season, in ${n.countries} countries: ${n.schemes} schemes, the steps of access and what is measured, delivery routes and organisations, and where no public system responds. This is not an eligibility check. Scheme rules change often; each status has the date it applies to. Households appear only in aggregate.`];
  SP.forEach(f => { const c = f.country;
    out.push(`### ${c.name} (research as of ${date(c.as_of)}${c.checked ? `; sources checked ${date(c.checked)}` : ""})`);
    c.summary.forEach(s => out.push(`- ${s.text}${s.sources.length ? ` (Sources: ${plainSrc(s.sources)})` : ""}`));
    out.push(`#### Schemes in ${c.name}`);
    f.schemes.forEach(s => out.push(`- ${s.name} (${TYPE[s.type] || s.type}, ${s.level}). Run by: ${s.run_by}. Who is eligible: ${s.who || NOT_CONFIRMED} What it gives: ${s.gives || NOT_CONFIRMED} How it is delivered: ${s.delivery || NOT_CONFIRMED} Documents: ${s.documents || NOT_CONFIRMED} ${PORTABLE[s.portable]}. ${SHOCK[s.shock_responsive]}. Payment timing: ${s.speed || NOT_CONFIRMED} Why it matters in heat: ${s.heat_relevance || NOT_CONFIRMED} Status: ${STATUS[s.status]}, as of ${date(s.status_as_of)}. Evidence: ${GRADE[s.grade]}. Sources: ${plainSrc(s.sources)}`));
    out.push(`#### Steps of access in ${c.name} (findings come from different studies of different people; they are not one funnel)`);
    STEPS.forEach(([k, name]) => { const fs = f.ladder.filter(l => l.step === k);
      out.push(fs.length ? fs.map(l => `- ${name}: ${l.finding} (${l.group}; limit: ${l.limit}; sources: ${plainSrc(l.sources)})`).join("\n") : `- ${name}: nobody has measured this here yet, in the sources checked.`); });
    if (f.routes.length) { out.push(`#### Delivery routes and organisations in ${c.name} (unranked)`);
      f.routes.forEach(r => out.push(`- ${r.name} (${r.kind}). ${r.does} Where: ${r.where}. What it says about itself: ${r.self_reported || "nothing stated"}. What independent studies found: ${r.independent || r.evaluations || "none found in the sources checked"}. Sources: ${plainSrc(r.sources)}`)); }
    if (c.gaps.length) { out.push(`#### Where no public system responds in ${c.name} (gaps in the checked scheme set, not proof that nothing exists)`);
      c.gaps.forEach(g => out.push(`- ${g.text}${g.sources.length ? ` (Sources: ${plainSrc(g.sources)})` : ""}`)); }
  });
  return out.join("\n\n");
}
module.exports = { TITLE, SLUG, SITUATIONS, STEPS, STATUS, PORTABLE, SHOCK, GRADE, TYPE, NOT_CONFIRMED, date, counts, md };
