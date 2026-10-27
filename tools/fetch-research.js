#!/usr/bin/env node
/* Common Shade: refresh feeds/research.json, a snapshot of new research on heat in South and Southeast Asia.
   Same search as the research column on /news/ (Europe PMC: heat in the title, an Asian setting, last 120 days).
   The page asks Europe PMC directly and falls back to this file when the service does not answer.
   Only titles, journals, dates and links are saved. The abstracts are printed to the Actions log for the
   site's editors to read when adding findings to the map; they are not published here.
   Run by .github/workflows/heat-news.yml, or by hand with `node tools/fetch-research.js`. */
const fs = require("fs"), path = require("path");
const OUT = path.join(__dirname, "..", "feeds", "research.json"), DAYS = 120;
const TITLE = '(TITLE:"heatwave" OR TITLE:"heatwaves" OR TITLE:"heat wave" OR TITLE:"heat waves" OR TITLE:"extreme heat" OR TITLE:"heat stress" OR TITLE:"heat-related" OR TITLE:"heat exposure" OR TITLE:"heat illness" OR TITLE:"heatstroke" OR TITLE:"heat stroke" OR TITLE:"ambient temperature")';
const PLACE = '(India OR Bangladesh OR Nepal OR "Sri Lanka" OR Pakistan OR Cambodia OR Indonesia OR Philippines OR Singapore OR Thailand OR Vietnam OR Malaysia OR Myanmar OR "South Asia" OR "Southeast Asia")';
(async () => {
  const from = new Date(Date.now() - DAYS * 864e5).toISOString().slice(0, 10);
  const q = `${TITLE} AND ${PLACE} AND FIRST_PDATE:[${from} TO 3000-01-01]`;
  const url = "https://www.ebi.ac.uk/europepmc/webservices/rest/search?format=json&resultType=core&pageSize=60&sort=" + encodeURIComponent("FIRST_PDATE_D desc") + "&query=" + encodeURIComponent(q);
  let j; try { const r = await fetch(url, { headers: { "User-Agent": "CommonShade/1.0 (https://beattheheat.asia)" } }); if (!r.ok) throw new Error(r.status); j = await r.json(); }
  catch (e) { console.log("::warning::Europe PMC did not answer (" + e.message + "); feeds/research.json left as it was"); return; }
  const res = (j.resultList && j.resultList.result) || [];
  const items = res.map(x => ({
    title: (x.title || "").replace(/<[^>]+>/g, "").trim(),
    journal: (x.journalInfo && x.journalInfo.journal && x.journalInfo.journal.title) || (x.bookOrReportDetails && x.bookOrReportDetails.publisher) || (x.source === "PPR" ? "Preprint" : ""),
    date: x.firstPublicationDate || "", doi: x.doi || "", pmid: x.pmid || "",
    url: x.doi ? "https://doi.org/" + x.doi : `https://europepmc.org/article/${x.source}/${x.id}`,
    firstAuthor: (x.authorString || "").split(",")[0].trim(), preprint: x.source === "PPR"
  })).filter(x => x.title);
  fs.writeFileSync(OUT, JSON.stringify({ updated: new Date().toISOString(), days: DAYS, source: "Europe PMC", hitCount: j.hitCount || items.length, items }, null, 1) + "\n");
  console.log(`research: ${items.length} of ${j.hitCount} items written`);
  // the digest for editors: abstracts stay in this log, not in the repository
  console.log("\n===== RESEARCH DIGEST =====");
  res.forEach((x, i) => console.log(`\n[${i + 1}] ${x.firstPublicationDate} | ${(x.journalInfo && x.journalInfo.journal && x.journalInfo.journal.title) || x.source} | ${x.doi ? "https://doi.org/" + x.doi : x.id}\nTITLE: ${(x.title || "").replace(/<[^>]+>/g, "")}\nABSTRACT: ${(x.abstractText || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 1800)}`));
})();
