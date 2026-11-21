// Common Shade: the words State of the field shares between its page (tools/build-sof.js), the Markdown briefing each
// edition offers for download, and llms-full.txt, so the page, the download and the plain-text file never disagree.
"use strict";
const M = require("./sof-model.js");
const TITLE = "State of the field";
const LEDE = "A monthly briefing on heat resilience in South and Southeast Asia: one argument about what changed, what the evidence establishes, what it could mean for decisions, and what to watch next.";
const DISTINCT = [
  ["/signals/", "Signals", "follows each outside development on its own, with what the evidence confirms"],
  ["/growing/", "Watch Common Shade grow", "records every change to Common Shade"],
  ["/evidence-map/", "The evidence map", "examines the knowledge base: what is studied and what is not"],
];
const ROLE = "State of the field brings a few selected developments together into one argument, with its limits stated.";
const METHOD = [
  "Each edition is written from records that have passed the site's checks: the knowledge base and Signals. Nothing is added to make an edition feel complete; a section with nothing checked to say is left out.",
  "Dates are kept apart: when something happened or was published, when Common Shade reviewed it, the edition's reporting period and evidence cut-off, and when the edition was published or corrected. An older development can belong in a new edition when its significance has become clearer; the edition says why.",
  "Each claim names its source, the source's date, what it establishes and what it does not, and whether the site's source check confirmed it. Common Shade's reading is labelled as interpretation.",
  "An announcement is not money received, a commitment is not implementation, a study is not proof at scale, and a gap in traced funding is not an absence of funding.",
  "An edition keeps what it said at publication. A later change to a record it cites is shown beside the edition, not written into it. A correction is dated, says what was wrong, and is also listed on the corrections page.",
  "Drafts are reviewed before publication, and a month passing does not create an edition. AI helps prepare drafts; a person approves every edition.",
];
const SECTIONS = [["argument", "The argument"], ["developments", "Developments"], ["opportunity", "Opportunity"], ["question", "Open question"], ["watch", "What to watch"], ["readers", "For your work"], ["common-shade", "On Common Shade"], ["sources", "Sources"], ["revisions", "Revisions"]];
const TYPE = { original: "Original source", secondary: "Secondary report", own: "Common Shade's own analysis" };
const H = { developments: "Developments worth understanding", opportunity: "An opportunity the evidence supports", question: "A question that matters for action", watch: "What to watch", readers: "For your work", platform: "On Common Shade this month", sources: "Sources", revisions: "Revisions and corrections" };
const OPP = [["problem", "The problem"], ["mechanism", "What to examine"]];
const OPP2 = [["dependency", "The main unresolved dependency"], ["next_check", "A next question to check locally"]];
const QF = [["why_now", "Why it matters now"], ["known", "What is known"], ["unknown", "What is not known"], ["decision", "Which decision depends on it"], ["would_help", "What could answer it"]];
const ROLEW = { authorise: "Authorise", deliver: "Deliver", finance: "Finance", maintain: "Maintain" };

const abs = (SITE, u) => /^https?:/.test(u) ? u : SITE + u;
const srcNo = e => Object.keys(e.sources || {}).reduce((o, k, i) => (o[k] = i + 1, o), {});
function srcLine(s, SITE) {
  const check = s.check && s.check.kind === "content" ? `content checked ${M.date(s.check.checked)}` : s.check && s.check.kind === "link" ? `link checked only, ${M.date(s.check.checked)}` : s.check && s.check.kind === "site" ? "Common Shade's own page" : "no check record";
  return `${s.title}${s.publisher && !s.title.includes(s.publisher) ? `, ${s.publisher}` : ""}, ${M.date(s.date)}. ${TYPE[s.type]}; ${check}. ${abs(SITE, s.url)}${s.archive ? ` (archived: ${s.archive})` : ""}`;
}
function dates(e) {
  return [["Reporting period", M.range(e.period)], ["Evidence cut-off", M.date(e.cutoff)], ["Published", e.status === "published" ? M.date(e.published) : "Not published (draft)"], ...(M.revised(e) ? [["Revised", M.date(M.revised(e))]] : [])];
}
function summaryText(e, SITE) { return [...M.summary(e), `${abs(SITE, M.url(e))}`].join("\n"); }

// the Markdown briefing: the edition in full, with its dates and sources
function md(e, SITE) {
  const n = srcNo(e), L = [], ref = k => `[${n[k]}]`;
  L.push(`# ${TITLE}: ${M.label(e)}`, "", `**${e.argument.headline}**`, "");
  dates(e).forEach(([k, v]) => L.push(`- ${k}: ${v}`));
  L.push(`- Stable link: ${abs(SITE, M.url(e))}`, "");
  M.corrections(e).forEach(c => L.push(`> Corrected ${M.date(c.date)}: ${c.gist}`, ""));
  L.push("## The argument", "", e.argument.claim, "", `What this rests on: ${e.argument.rests_on}`, "");
  if (e.opening) L.push(e.opening, "");
  L.push("## In brief", "", ...M.summary(e).slice(1), "");
  if ((e.developments || []).length) { L.push(`## ${H.developments}`, "");
    e.developments.forEach(d => { const inP = M.inPeriod(d.occurred.date, e.period);
      L.push(`### ${d.h}`, "", `- Happened: ${M.date(d.occurred.date)} (${d.occurred.what})`, `- Reviewed by Common Shade: ${M.date(d.reviewed)}`, ...(inP ? [] : [`- Outside this edition's period. Why it is here: ${d.why_here}`]), "");
      L.push(`Common Shade's reading: ${d.reading}`, "", "What the sources establish:", "");
      d.claims.forEach(c => L.push(`- ${c.kind === "not-found" ? "Not found: " : ""}${c.says} ${ref(c.source)} Establishes: ${c.establishes}${c.searched ? ` Searched: ${c.searched}` : ""}${c.unverified ? " (Not verified.)" : ""}`));
      L.push("", "Limits:", "", ...d.limits.map(x => `- ${x}`), "", `What would strengthen or change this reading: ${d.would_change}`, ""); }); }
  const O = e.opportunity;
  if (O) { L.push(`## ${H.opportunity}`, "", `### ${O.h}`, "", O.gist, "");
    OPP.forEach(([k, t]) => L.push(`- ${t}: ${O[k]}`));
    L.push("- The evidence:"); O.claims.forEach(c => L.push(`  - ${c.kind === "not-found" ? "Not found: " : ""}${c.says} ${ref(c.source)} Establishes: ${c.establishes}${c.searched ? ` Searched: ${c.searched}` : ""}`));
    L.push(`- Its limits: ${O.limits.join(" ")}`);
    if (O.roles) L.push(`- Who could take part (a proposal): ${O.roles.note} ${M.ROLES.map(r => `${ROLEW[r]}: ${O.roles[r]}.`).join(" ")}`);
    OPP2.forEach(([k, t]) => L.push(`- ${t}: ${O[k]}`)); L.push(""); }
  const Q = e.question;
  if (Q) { L.push(`## ${H.question}`, "", `### ${Q.h}`, "", `> ${Q.q}`, ""); QF.forEach(([k, t]) => L.push(`- ${t}: ${Q[k]}`));
    if (Q.revisits) L.push("", `Revisiting the ${M.date(Q.revisits.edition)} question (${Q.revisits.q}): new evidence: ${Q.revisits.new_evidence} Did the reading change? ${Q.revisits.changed} Still unresolved: ${Q.revisits.unresolved}`);
    L.push(""); }
  if ((e.watch || []).length) { L.push(`## ${H.watch}`, "", ...e.watch.map(w => `- ${w.what}. Evidence that would matter: ${w.evidence}.`), ""); }
  if ((e.audiences || []).length) { L.push(`## ${H.readers}`, "", ...e.audiences.map(a => `- ${M.AUD[a.who]}: ${a.q}`), ""); }
  if (e.platform && e.platform.p) L.push(`## ${H.platform}`, "", e.platform.p, "", `The full record of changes: ${SITE}/growing/`, "");
  L.push(`## ${H.sources}`, "", ...Object.entries(e.sources || {}).map(([k, s]) => `${n[k]}. ${srcLine(s, SITE)}`), "");
  L.push(`## ${H.revisions}`, "", ...(e.revisions || []).map(r => `- ${M.date(r.date)}, ${r.kind}: ${r.note}`), "");
  L.push("---", `Common Shade, CC BY 4.0. Written from checked records; Common Shade's reading is labelled as interpretation. Corrections: ${SITE}/corrections/`);
  return L.join("\n") + "\n";
}
// the section in llms-full.txt: the latest published edition, and the archive
function llms(SITE) {
  const P = M.published(), last = P[0];
  if (!last) return `## ${TITLE}\n\n${LEDE}\n\nNo edition has been published yet.`;
  return `## ${TITLE}\n\n${LEDE}\n\n${ROLE} ${DISTINCT.map(([u, t, d]) => `${t} (${SITE}${u}) ${d}.`).join(" ")}\n\nEditions: ${P.map(e => `${M.label(e)} (${SITE}${M.url(e)}, published ${M.date(e.published)}${M.revised(e) ? `, revised ${M.date(M.revised(e))}` : ""})`).join("; ")}.\n\nThe latest published edition follows.\n\n${md(last, SITE).replace(/^# /m, "### ").replace(/^## /gm, "#### ").replace(/^### (?!State)/gm, "##### ")}`;
}

// reading depths: word counts from the edition itself, at about 200 words a minute
const W = x => String(x || "").split(/\s+/).filter(Boolean).length;
function depths(e) {
  const brief = W(e.argument.claim) + W(e.argument.rests_on) + (e.developments || []).reduce((a, d) => a + W(d.h) + W(d.gist), 0) + (e.opportunity ? W(e.opportunity.h) : 0) + (e.question ? W(e.question.q) : 0);
  const core = brief + W(e.opening) + (e.developments || []).reduce((a, d) => a + W(d.reading) + W(d.why_here), 0)
    + (e.opportunity ? W(e.opportunity.gist) + W(e.opportunity.problem) + W(e.opportunity.mechanism) + W(e.opportunity.dependency) + W(e.opportunity.next_check) : 0)
    + (e.question ? QF.reduce((a, [k]) => a + W(e.question[k]), 0) : 0) + (e.watch || []).reduce((a, w) => a + W(w.what) + W(w.evidence), 0) + (e.audiences || []).reduce((a, x) => a + W(x.q), 0);
  const all = W(md(e, ""));
  const t = n => { const m = Math.round(n / 200); return n < 150 ? "under a minute" : m <= 1 ? "about a minute" : `about ${m} minutes`; };
  return [["argument", `${t(brief)}: the argument and In brief`], ["developments", `${t(core)}: with the developments, the opportunity and the question`], ["sources", `${t(all)}: with every claim's evidence, limits and sources`]];
}
// the version for a chat: WhatsApp reads *bold* and _italic_
function chatText(e, SITE) {
  return [`*${TITLE}: ${M.label(e)}*`, `_${e.argument.headline}_`, "", e.argument.claim, "", ...(e.developments || []).map(d => `• ${d.h}`), ...(e.question ? [`• Open question: ${e.question.q}`] : []), "", `Read it with its sources: ${abs(SITE, M.url(e))}`].join("\n");
}
const NEXT = n => `Next edition planned for ${M.date(n.month)}, covering ${M.range(n.period)}. It appears only once reviewed and published.`;
const FOLLOW = "Follow without an account";
module.exports = { depths, chatText, NEXT, FOLLOW,  TITLE, LEDE, DISTINCT, ROLE, METHOD, SECTIONS, TYPE, H, OPP, OPP2, QF, ROLEW, srcNo, srcLine, dates, summaryText, md, llms };
