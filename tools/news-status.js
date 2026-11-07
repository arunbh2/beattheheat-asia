// Common Shade: what became of each item on /news/. Writes feeds/status.json, which news.js reads to tag each paper
// and headline, so readers can tell news coverage from checked evidence:
//   papers     evidence   accepted by a reviewer in the weekly evidence review: on the Evidence map
//              review     queued in the weekly review, waiting for a reviewer
//              screened   screened by the weekly review and set aside (outside its focus: heat, a South or Southeast
//                         Asian setting, signs of new data); not a judgement of the paper
//              waiting    not yet screened (the next Monday harvest reads every paper on the page)
//   headlines  cited      the link is cited somewhere on Common Shade
//              lead       news is a lead: the monthly update traces it to its primary source before anything is added
// Run by .github/workflows/heat-news.yml after each refresh, and by tools/build-static.js.
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), read = f => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, f), "utf8")); } catch (e) { return null; } };
const norm = u => String(u || "").trim().toLowerCase().replace(/^https?:\/\/(dx\.)?doi\.org\//, "doi:").replace(/^https?:\/\/(www\.)?/, "").replace(/[#?].*$/, "").replace(/\/$/, "");
const tkey = t => "t:" + String(t || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().slice(0, 140);

// the weekly review: every queue and named batch in data/evidence/inbox, and the list of studies already screened
const INBOX = path.join(ROOT, "data/evidence/inbox"), decided = new Map();
if (fs.existsSync(INBOX)) for (const f of fs.readdirSync(INBOX).filter(f => f.endsWith(".json"))) for (const c of (read(`data/evidence/inbox/${f}`) || {}).candidates || []) {
  const st = c.decision === "accept" ? "evidence" : c.decision === "reject" ? "screened" : "review";
  [norm(c.url), c.doi && "doi:" + String(c.doi).toLowerCase(), tkey(c.title), c.key].filter(Boolean).forEach(k => decided.set(k, st)); }
const seen = new Set(((read("data/evidence/seen.json") || {}).keys) || []);

// every link the site cites, for the headlines
const cited = new Set();
const walk = x => { if (Array.isArray(x)) return x.forEach(walk); if (x && typeof x === "object") { if (x.url) cited.add(norm(x.url)); Object.values(x).forEach(walk); } };
for (const d of ["data/core", "data/kb", "data/site", "data/social-protection"]) if (fs.existsSync(path.join(ROOT, d)))
  fs.readdirSync(path.join(ROOT, d)).filter(f => f.endsWith(".json") && f !== "growth-dates.json").forEach(f => walk(read(`${d}/${f}`)));

const A = read("feeds/archive.json") || { news: [], research: [] }, R = (read("feeds/research.json") || {}).items || [];
const papers = {}, heads = {};
for (const x of [...A.research, ...R]) { const k = norm(x.url), d = (String(x.url).match(/doi\.org\/(.+)$/) || [])[1];
  const keys = [k, d && "doi:" + d.toLowerCase(), tkey(x.title)].filter(Boolean);
  const st = keys.map(q => decided.get(q)).find(Boolean) || (keys.some(q => seen.has(q)) ? "screened" : "waiting");
  papers[k] = st; }
for (const x of A.news) { const k = norm(x.url); heads[k] = cited.has(k) ? "cited" : "lead"; }
const tally = o => Object.values(o).reduce((a, s) => (a[s] = (a[s] || 0) + 1, a), {});
const out = { about: "What became of each paper and headline listed on /news/ (written by tools/news-status.js). Keys are normalised links (doi:… for DOIs).",
  updated: new Date().toISOString(), counts: { papers: tally(papers), headlines: tally(heads) }, papers, headlines: heads };
// write only when something changed, so the six-hourly feed refresh does not commit an identical file
const prev = read("feeds/status.json"), same = prev && JSON.stringify([prev.papers, prev.headlines]) === JSON.stringify([papers, heads]);
if (!same) fs.writeFileSync(path.join(ROOT, "feeds/status.json"), JSON.stringify(out) + "\n");
if (require.main === module) console.log("news status:", JSON.stringify(out.counts));
module.exports = { norm };
