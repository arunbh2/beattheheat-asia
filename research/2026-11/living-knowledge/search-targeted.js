#!/usr/bin/env node
// Common Shade, Living Knowledge: targeted practice-family searches on Crossref (building science, textiles and architecture
// journals that Europe PMC does not index). Logged to search-log.json beside the main run. Leads for screening only.
"use strict";
const fs = require("fs"), path = require("path"), cp = require("child_process");
const LOG = path.join(__dirname, "search-log.json");
const Q = [
 ["buildings", "Southeast Asia", "Malay traditional house thermal comfort stilt raised floor"], ["buildings", "Southeast Asia", "rumah panggung vernacular thermal performance Indonesia"],
 ["buildings", "Southeast Asia", "bahay kubo nipa hut thermal Philippines"], ["buildings", "Southeast Asia", "Vietnamese vernacular house thermal comfort"],
 ["buildings", "Southeast Asia", "Thai traditional house thermal comfort ventilation"], ["buildings", "South Asia", "Kerala traditional house nalukettu thermal comfort"],
 ["buildings", "South Asia", "bhunga Kutch vernacular thermal"], ["buildings", "South Asia", "Jaisalmer vernacular house thermal performance field measurement"],
 ["buildings", "South Asia", "mud house thermal comfort measured India rural"], ["buildings", "South Asia", "Bangladesh vernacular rural house thermal comfort"],
 ["buildings", "South Asia", "Nepal Terai vernacular house thermal"], ["buildings", "South Asia", "Sri Lanka vernacular architecture thermal comfort"],
 ["buildings", "South Asia", "Pakistan vernacular architecture thermal comfort Sindh"], ["buildings", "South Asia", "jaali screen thermal performance"],
 ["clothing", "South Asia", "sari clothing insulation thermal comfort India"], ["clothing", "South Asia", "traditional clothing thermal insulation clo value India"],
 ["clothing", "Southeast Asia", "traditional clothing clo value tropical Indonesia"], ["clothing", "South Asia", "head covering outdoor workers heat India"],
 ["water", "South Asia", "earthen pot water cooling temperature evaporative clay pot"], ["water", "South Asia", "stepwell microclimate thermal"],
 ["food", "South Asia", "seasonal summer food practices heat India qualitative"], ["work", "South Asia", "outdoor workers coping strategies heat India qualitative"],
 ["care", "South Asia", "pregnant women heat coping strategies India qualitative"], ["care", "South Asia", "older people heat coping Bangladesh"],
 ["neighbourhood", "South Asia", "pols Ahmedabad street microclimate"], ["neighbourhood", "Southeast Asia", "shophouse five foot way thermal"],
 ["agriculture", "South Asia", "farmers heat coping work timing India"], ["coping", "Southeast Asia", "heat coping strategies households Vietnam"],
 ["coping", "Southeast Asia", "heat adaptation practices Philippines community"], ["coping", "South Asia", "heat adaptation practices Nepal community"]
];
const get = url => { try { return JSON.parse(cp.execFileSync("curl", ["-s", "-m", "40", "-A", "CommonShadeResearch/1.0 (mailto not provided; +https://beattheheat.asia/for-ai/)", url], { maxBuffer: 2e7 }).toString()); } catch (e) { return null; } };
const log = JSON.parse(fs.readFileSync(LOG, "utf8")), run = { date: new Date().toISOString().slice(0, 10), note: "targeted Crossref practice-family searches", queries: [] };
for (const [fam, reg, q] of Q) {
 const c = get(`https://api.crossref.org/works?query.bibliographic=${encodeURIComponent(q)}&rows=12&select=DOI,title,issued,type,container-title,publisher`);
 const first = c ? c.message.items.map(r => ({ doi: r.DOI, title: (r.title || [""])[0], year: ((r.issued || {})["date-parts"] || [[null]])[0][0], type: r.type, journal: (r["container-title"] || [""])[0], publisher: r.publisher })) : [];
 run.queries.push({ family: fam, region: reg, platform: "Crossref REST (bibliographic relevance; metadata only)", query: q, filters: "none", hits: null, note: "Crossref totals are not meaningful for relevance search; the first 12 were screened", first });
 console.log(`\n## ${fam} / ${reg}: ${q}`); first.forEach(r => console.log(`  ${r.year} ${r.title.slice(0, 110)} | ${r.journal.slice(0, 40)} | ${r.doi}`));
}
log.runs.push(run); fs.writeFileSync(LOG, JSON.stringify(log, null, 1) + "\n");
