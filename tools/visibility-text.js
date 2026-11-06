// How heat became visible: what the page (tools/build-visibility.js) and llms-full.txt (tools/build-static.js) share,
// so the page and its plain text can never say different things. Data: HEAT_VISIBILITY (data/core).
"use strict";
const SLUG = "how-heat-became-visible";
const TITLE = "How heat became visible";
const THREADS = {
  ipcc: "IPCC", unfccc: "UN climate talks", "who-wmo": "WHO and WMO", labour: "Work and labour", science: "Science",
  heatwave: "Heatwaves", plans: "Plans and rules", finance: "Finance", media: "Attention and media"
};
const SCOPES = { global: "Global", regional: "Regional", national: "National", city: "City" };
const GRADES = { known: "Known", inferred: "Inferred", uncertain: "Uncertain" };
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
// a date at the precision the source gives: "1995", "August 1990", "13 July 1995"
function when(e) {
  const [y, m, d] = e.date.split("-");
  if (e.precision === "day" && d) return `${+d} ${MONTHS[+m - 1]} ${y}`;
  if ((e.precision === "month" || e.precision === "day") && m) return `${MONTHS[+m - 1]} ${y}`;
  return y;
}
const byKey = V => Object.fromEntries(V.sources.map(s => [s.key, s]));
const cite = s => `${s.label}${s.by ? `, ${s.by}` : ""}${s.year ? `, ${s.year}` : ""}`;

// the page as plain text for llms-full.txt
function markdown(V, SITE) {
  const S = byKey(V), src = keys => keys.map(k => S[k]).filter(Boolean).map(s => `${cite(s)} (${s.url})`).join("; ");
  const lines = [`## ${TITLE}`, `${SITE}/${SLUG}/`,
    `When science, health, labour, finance and the UN began to notice extreme heat, and who was still missing. ${V.events.length} events, research cut-off ${V.cutoff}. Each event is graded: known (original documents, peer-reviewed papers, or institutions reporting their own actions), inferred (reached through secondary accounts) or uncertain (its sources could not confirm the detail).`,
    ...V.caveats, "### The story in eras",
    ...V.story.map(s => `- ${s.span ? s.span + ": " : ""}${s.title}. ${s.text}${s.sources.length ? ` Sources: ${src(s.sources)}` : ""}`),
    "### Turning points",
    ...V.turning.flatMap(t => [`#### ${t.span}: ${t.title}`, t.text, `Who was still missing: ${t.missing}`, `Sources: ${src(t.sources)}`]),
    V.turningClose, "### Timeline",
    ...V.events.map(e => [`- ${when(e)}: ${e.title}${e.place ? ` (${e.place})` : ""}. ${e.what} Why it mattered: ${e.why}`,
      `Threads: ${e.threads.map(t => THREADS[t] || t).join(", ")}. Scope: ${SCOPES[e.scope] || e.scope}.${e.asia ? " South and Southeast Asia." : ""} Grade: ${e.grade}.${e.first === "claimed" ? " Claimed first, according to its source." : ""}`,
      e.quote ? `Quote: "${e.quote}" (${e.quote_loc})` : "", `Sources: ${src(e.sources)}`].filter(Boolean).join(" ")),
    "### How heat appears in IPCC reports", ...V.ipccNotes,
    ...V.ipcc.filter(r => r.audited).map(r => `- ${r.report} (${r.when}). How heat appears: ${r.how} Headline: ${r.headline} Change: ${r.change} Sources: ${src(r.sources)}`),
    `Identified, heat content not yet read: ${V.ipcc.filter(r => !r.audited).map(r => `${r.report} (${r.when})`).join("; ")}.`,
    "### What this page could not verify", ...V.unverified.map(u => `- ${u.topic}: ${u.text}`)];
  return lines.filter(Boolean).join("\n\n");
}
module.exports = { SLUG, TITLE, THREADS, SCOPES, GRADES, when, byKey, cite, markdown };
