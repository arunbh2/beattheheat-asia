#!/usr/bin/env node
// Common Shade, Living Knowledge: the logged searches of the targeted evidence scan (protocol.md). Runs each query family
// against Europe PMC (which also covers PubMed and PMC) and Crossref, and appends every query, platform, date, filter, hit
// count and the first results to search-log.json. Screening decisions are recorded by hand in screening.json.
// Results are leads for screening, never evidence. Rerun for a refresh with --since YYYY-MM-DD.
//   node research/2026-11/living-knowledge/search.js [--since 2026-11-28]
"use strict";
const fs = require("fs"), path = require("path"), cp = require("child_process");
const LOG = path.join(__dirname, "search-log.json"), since = (process.argv.indexOf("--since") > -1 ? process.argv[process.argv.indexOf("--since") + 1] : null);
const get = url => { try { return JSON.parse(cp.execFileSync("curl", ["-s", "-m", "40", "-A", "CommonShadeResearch/1.0 (+https://beattheheat.asia/for-ai/)", url], { maxBuffer: 2e7 }).toString()); } catch (e) { return null; } };
const SA = "(India OR Pakistan OR Bangladesh OR Nepal OR Bhutan OR \"Sri Lanka\" OR Maldives OR Afghanistan)";
const SEA = "(Indonesia OR Philippines OR Vietnam OR \"Viet Nam\" OR Thailand OR Cambodia OR Laos OR Myanmar OR Malaysia OR Singapore OR Brunei OR \"Timor-Leste\")";
const HEAT = "(heat OR \"thermal comfort\" OR overheating OR \"hot weather\" OR heatwave)";
// heat and practice terms must appear in the title or abstract; places may appear anywhere in the record
const ta = x => `(TITLE:${x} OR ABSTRACT:${x})`;
const FAMILIES = {
 buildings: `(vernacular OR traditional OR indigenous OR \"local knowledge\") AND (house OR housing OR dwelling OR roof OR courtyard OR earthen OR mud OR \"lime plaster\" OR thatch OR veranda)`,
 clothing: `(clothing OR textile OR garment OR \"head covering\" OR turban OR scarf OR sari OR fabric)`,
 water: `(\"water storage\" OR \"earthen pot\" OR clay pot OR evaporative OR \"wet cloth\" OR stepwell)`,
 food: `(diet OR food OR beverage OR drink OR \"cooling food\" OR buttermilk OR millet) AND (traditional OR cultural OR local)`,
 work: `(\"work hours\" OR \"work timing\" OR rest OR break OR shade OR siesta) AND (worker OR labour OR labor OR farmer OR outdoor)`,
 care: `(sleep OR night OR pregnancy OR pregnant OR elderly OR \"older people\" OR child OR caregiving) AND (coping OR adaptation OR practice)`,
 neighbourhood: `(street OR neighbourhood OR neighborhood OR \"public space\" OR tree OR shade OR \"water kiosk\") AND (traditional OR community OR local)`,
 agriculture: `(livestock OR cattle OR crop OR farmer OR agriculture) AND (traditional OR indigenous OR local) AND (coping OR adaptation)`,
 coping: `(\"coping strategies\" OR \"adaptation strategies\" OR \"adaptive practices\" OR \"local practices\") AND (community OR household OR rural OR urban)`
};
const log = fs.existsSync(LOG) ? JSON.parse(fs.readFileSync(LOG, "utf8")) : { about: "Every query of the Living Knowledge targeted evidence scan: platform, date, filters, hits and the first results. Leads for screening only.", runs: [] };
const today = new Date().toISOString().slice(0, 10), run = { date: today, since, queries: [] };
for (const [fam, q] of Object.entries(FAMILIES)) for (const [reg, rq] of [["South Asia", SA], ["Southeast Asia", SEA]]) {
 const query = `${ta(HEAT)} AND ${q.split(" AND ").map(ta).join(" AND ")} AND ${rq}${since ? ` AND FIRST_PDATE:[${since} TO ${today}]` : ""}`;
 const e = get(`https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(query)}&format=json&pageSize=25&resultType=lite`);
 run.queries.push({ family: fam, region: reg, platform: "Europe PMC REST (covers PubMed, PMC, preprints)", query, filters: since ? `first publication from ${since}` : "none (all years)", hits: e ? e.hitCount : null, error: e && e.resultList ? null : (e && e.errMsg) || "no response",
  first: e && e.resultList ? (e.resultList.result || []).map(r => ({ id: r.pmid ? `PMID:${r.pmid}` : r.id, doi: r.doi || null, pmcid: r.pmcid || null, title: r.title, year: r.pubYear, journal: r.journalTitle || r.bookOrReportDetails && r.bookOrReportDetails.publisher || null, oa: r.isOpenAccess === "Y" })) : [] });
 const cq = `heat ${fam} traditional ${reg}`;
 const c = get(`https://api.crossref.org/works?query.bibliographic=${encodeURIComponent(cq)}&rows=10&select=DOI,title,issued,type,container-title${since ? `&filter=from-pub-date:${since}` : ""}`);
 run.queries.push({ family: fam, region: reg, platform: "Crossref REST (bibliographic match; metadata only)", query: cq, filters: since ? `from-pub-date ${since}` : "none", hits: c ? c.message["total-results"] : null, error: c ? null : "no response",
  first: c ? c.message.items.map(r => ({ doi: r.DOI, title: (r.title || [""])[0], year: ((r.issued || {})["date-parts"] || [[null]])[0][0], type: r.type, journal: (r["container-title"] || [""])[0] })) : [] });
 process.stdout.write(`${fam}/${reg}: EPMC ${run.queries[run.queries.length - 2].hits}, Crossref ${run.queries[run.queries.length - 1].hits}\n`);
}
log.runs.push(run); fs.writeFileSync(LOG, JSON.stringify(log, null, 1) + "\n");
