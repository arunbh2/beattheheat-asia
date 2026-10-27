#!/usr/bin/env node
/* Common Shade: refresh feeds/research.json, a snapshot of new research on heat in South and Southeast Asia.
   Same search as the research column on /news/ (Europe PMC: heat in the title, an Asian setting, last 120 days),
   retried, with OpenAlex as a fallback when Europe PMC does not answer.
   The page asks Europe PMC directly and falls back to this file when the service does not answer.
   Only titles, journals, dates and links are saved. The abstracts are printed to the Actions log for the
   site's editors to read when adding findings to the map; they are not published here.
   Run by .github/workflows/heat-news.yml, or by hand with `node tools/fetch-research.js`. */
const fs = require("fs"), path = require("path");
const OUT = path.join(__dirname, "..", "feeds", "research.json"), DAYS = 120;
const TITLE = '(TITLE:"heatwave" OR TITLE:"heatwaves" OR TITLE:"heat wave" OR TITLE:"heat waves" OR TITLE:"extreme heat" OR TITLE:"heat stress" OR TITLE:"heat-related" OR TITLE:"heat exposure" OR TITLE:"heat illness" OR TITLE:"heatstroke" OR TITLE:"heat stroke" OR TITLE:"ambient temperature")';
const PLACE = '(India OR Bangladesh OR Nepal OR "Sri Lanka" OR Pakistan OR Cambodia OR Indonesia OR Philippines OR Singapore OR Thailand OR Vietnam OR Malaysia OR Myanmar OR "South Asia" OR "Southeast Asia")';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const UA = { "User-Agent": "CommonShade/1.0 (https://beattheheat.asia; mailto:hello@beattheheat.asia)" };
async function getJSON(url, tries = 3) {
  for (let i = 1; i <= tries; i++) {
    try { const r = await fetch(url, { headers: UA }); if (!r.ok) throw new Error(r.status); return await r.json(); }
    catch (e) { console.log(`  attempt ${i}: ${e.message}`); if (i < tries) await sleep(4000 * i); else throw e; }
  }
}
const clean = t => String(t || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
// 1. Europe PMC, the same service the page asks
async function europePMC(from) {
  const q = `${TITLE} AND ${PLACE} AND FIRST_PDATE:[${from} TO 3000-01-01]`;
  const j = await getJSON("https://www.ebi.ac.uk/europepmc/webservices/rest/search?format=json&resultType=core&pageSize=60&sort=" + encodeURIComponent("FIRST_PDATE_D desc") + "&query=" + encodeURIComponent(q));
  return ((j.resultList && j.resultList.result) || []).map(x => ({
    title: clean(x.title), journal: (x.journalInfo && x.journalInfo.journal && x.journalInfo.journal.title) || (x.source === "PPR" ? "Preprint" : ""),
    date: x.firstPublicationDate || "", doi: x.doi || "", pmid: x.pmid || "", preprint: x.source === "PPR",
    url: x.doi ? "https://doi.org/" + x.doi : `https://europepmc.org/article/${x.source}/${x.id}`,
    firstAuthor: (x.authorString || "").split(",")[0].trim(), abstract: clean(x.abstractText) }));
}
// 2. OpenAlex, an open index of research, when Europe PMC does not answer
async function openAlex(from) {
  const titles = ["heatwave", "heat wave", "extreme heat", "heat stress", "heat-related", "heat exposure", "heat illness", "heatstroke", "heat stroke"];
  const places = ["India", "Bangladesh", "Nepal", "Sri Lanka", "Pakistan", "Cambodia", "Indonesia", "Philippines", "Singapore", "Thailand", "Vietnam", "Malaysia", "Myanmar", "South Asia", "Southeast Asia"];
  const url = "https://api.openalex.org/works?per-page=60&sort=publication_date:desc&filter=" + encodeURIComponent(`from_publication_date:${from},title.search:${titles.map(t => t.includes(" ") ? `"${t}"` : t).join("|")}`) +
    "&search=" + encodeURIComponent(places.map(p => p.includes(" ") ? `"${p}"` : p).join(" OR ")) + "&mailto=hello@beattheheat.asia";
  const j = await getJSON(url);
  const abs = inv => { if (!inv) return ""; const w = []; for (const [k, ps] of Object.entries(inv)) ps.forEach(p => { w[p] = k; }); return w.join(" "); };
  return (j.results || []).map(x => ({
    title: clean(x.title), journal: (x.primary_location && x.primary_location.source && x.primary_location.source.display_name) || (x.type === "preprint" ? "Preprint" : ""),
    date: x.publication_date || "", doi: (x.doi || "").replace("https://doi.org/", ""), pmid: "", preprint: x.type === "preprint",
    url: x.doi || x.id, firstAuthor: ((x.authorships || [])[0] && x.authorships[0].author.display_name) || "", abstract: clean(abs(x.abstract_inverted_index)) }));
}
(async () => {
  const from = new Date(Date.now() - DAYS * 864e5).toISOString().slice(0, 10);
  let items = [], source = "";
  try { items = await europePMC(from); source = "Europe PMC"; } catch (e) { console.log("Europe PMC did not answer (" + e.message + "); trying OpenAlex"); }
  if (!items.length) { try { items = await openAlex(from); source = "OpenAlex"; } catch (e) { console.log("::warning::OpenAlex did not answer either (" + e.message + "); feeds/research.json left as it was"); return; } }
  items = items.filter(x => x.title);
  if (!items.length) { console.log("::warning::no research found; feeds/research.json left as it was"); return; }
  fs.writeFileSync(OUT, JSON.stringify({ updated: new Date().toISOString(), days: DAYS, source,
    items: items.map(({ abstract, ...x }) => x) }, null, 1) + "\n");
  console.log(`research: ${items.length} items from ${source} written`);
  // the digest for editors: abstracts stay in this log, not in the repository
  console.log("\n===== RESEARCH DIGEST =====");
  items.forEach((x, i) => console.log(`\n[${i + 1}] ${x.date} | ${x.journal} | ${x.url}\nTITLE: ${x.title}\nABSTRACT: ${x.abstract.slice(0, 1800)}`));
})();
