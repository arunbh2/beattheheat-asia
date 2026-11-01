#!/usr/bin/env node
// Living evidence: the weekly harvest. Asks free, open research services for new studies on heat-health, passive
// cooling and heat finance in South and Southeast Asia, screens them, pre-fills fields by rule (extract.js) and
// writes this week's review queue to data/evidence/inbox/<YYYY>-W<ww>.json. Nothing here reaches the website:
// a reviewer signs off each study in the weekly pull request (see data/evidence/README.md).
//   node tools/living-evidence/harvest.js [--days 8] [--week 2026-W45]
// Runs on GitHub (.github/workflows/evidence-weekly.yml), where outside services can be reached. No keys, no cost.
//
// Sources: Europe PMC (includes PubMed/MEDLINE and preprint servers such as medRxiv), Crossref (journals, and the
// DOIs of SSRN, the World Bank and ADB), arXiv, OpenAlex (includes institutional and university repositories),
// the World Bank Documents and Reports API, and WHO IRIS. A source that does not answer is noted in the queue and
// the harvest carries on.
"use strict";
const fs = require("fs"), path = require("path");
const { extract, screen, suggestCycles } = require("./extract.js");
const ROOT = path.join(__dirname, "..", ".."), DIR = path.join(ROOT, "data", "evidence"), INBOX = path.join(DIR, "inbox"), SEEN = path.join(DIR, "seen.json");
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
const DAYS = +arg("--days", 8), MAX = 60;
const UA = { "User-Agent": "CommonShade-LivingEvidence/1.0 (https://beattheheat.asia; mailto:hello@beattheheat.asia)", "Accept": "application/json, application/atom+xml;q=0.9, */*;q=0.5" };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const clean = t => String(t || "").replace(/<[^>]+>/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

function isoWeek(d) {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())), day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day); const y = t.getUTCFullYear(), w = Math.ceil(((t - Date.UTC(y, 0, 1)) / 864e5 + 1) / 7);
  return `${y}-W${String(w).padStart(2, "0")}`;
}
// polite retries: services that are busy (429, 503) are given time, and their Retry-After is honoured
async function get(url, as = "json", tries = 5) {
  for (let i = 1; i <= tries; i++) {
    try {
      const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(60000) });
      if (r.status === 429 || r.status >= 500) { const ra = +r.headers.get("retry-after") || 0, body = (await r.text().catch(() => "")).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160); throw Object.assign(new Error("HTTP " + r.status + (body ? ": " + body : "")), { wait: Math.min(ra * 1000, 60000) }); }
      if (!r.ok) { const body = (await r.text().catch(() => "")).replace(/\s+/g, " ").slice(0, 160); throw Object.assign(new Error("HTTP " + r.status + (body ? ": " + body : "")), { final: true }); }
      return as === "json" ? await r.json() : await r.text();
    } catch (e) { if (i === tries || e.final) throw e; await sleep(e.wait || 8000 * i); }
  }
}
const TERMS = ["heatwave", "heat wave", "extreme heat", "heat stress", "heat-related", "heat exposure", "heat illness", "heatstroke", "cool roof", "passive cooling", "urban heat island", "thermal comfort", "parametric insurance heat"];
const PLACES = ["India", "Bangladesh", "Nepal", "Sri Lanka", "Pakistan", "Myanmar", "Thailand", "Cambodia", "Laos", "Vietnam", "Malaysia", "Singapore", "Indonesia", "Philippines", "South Asia", "Southeast Asia"];
const q = s => s.includes(" ") ? `"${s}"` : s;

const SOURCES = {
  async europepmc(from, to) {
    // the same title search the news feed uses (tools/fetch-research.js), which Europe PMC answers reliably,
    // then a short second search for cooling and finance studies
    const TITLE = '(TITLE:"heatwave" OR TITLE:"heatwaves" OR TITLE:"heat wave" OR TITLE:"heat waves" OR TITLE:"extreme heat" OR TITLE:"heat stress" OR TITLE:"heat-related" OR TITLE:"heat exposure" OR TITLE:"heat illness" OR TITLE:"heatstroke" OR TITLE:"heat stroke" OR TITLE:"ambient temperature")';
    const PLACE = '(India OR Bangladesh OR Nepal OR "Sri Lanka" OR Pakistan OR Cambodia OR Indonesia OR Philippines OR Singapore OR Thailand OR Vietnam OR Malaysia OR Myanmar OR "South Asia" OR "Southeast Asia")';
    const MORE = '(TITLE:"cool roof" OR TITLE:"cool roofs" OR TITLE:"passive cooling" OR TITLE:"thermal comfort" OR TITLE:"urban heat" OR TITLE:"heat insurance" OR TITLE:"parametric insurance" OR TITLE:"heat action plan")';
    const ask = async t => { const r = await get("https://www.ebi.ac.uk/europepmc/webservices/rest/search?format=json&resultType=core&pageSize=100&sort=" + encodeURIComponent("FIRST_PDATE_D desc") + "&query=" + encodeURIComponent(`${t} AND ${PLACE} AND FIRST_PDATE:[${from} TO 3000-01-01]`)); return (r.resultList && r.resultList.result) || []; };
    const res = (await ask(TITLE)).concat(await ask(MORE));
    const j = { resultList: { result: res } };
    return ((j.resultList && j.resultList.result) || []).map(x => ({ title: clean(x.title), abstract: clean(x.abstractText), date: x.firstPublicationDate || "",
      doi: (x.doi || "").toLowerCase(), url: x.doi ? "https://doi.org/" + x.doi : `https://europepmc.org/article/${x.source}/${x.id}`,
      venue: (x.journalInfo && x.journalInfo.journal && x.journalInfo.journal.title) || x.bookOrReportDetails?.publisher || "", kind: x.source === "PPR" ? "preprint" : "article",
      by: (x.authorString || "").split(",")[0].trim(), via: x.source === "MED" ? "PubMed via Europe PMC" : x.source === "PPR" ? "Preprint via Europe PMC" : "Europe PMC" }));
  },
  async crossref(from, to) {
    const out = [];
    // general journals, then the DOI prefixes of SSRN (10.2139), the World Bank (10.1596) and ADB (10.22617)
    for (const [label, extra] of [["Crossref", ""], ["SSRN via Crossref", ",prefix:10.2139"], ["World Bank via Crossref", ",prefix:10.1596"], ["ADB via Crossref", ",prefix:10.22617"]]) {
      const j = await get(`https://api.crossref.org/works?rows=100&query=${encodeURIComponent("heatwave \"heat stress\" \"extreme heat\" \"heat exposure\" \"urban heat\" \"thermal comfort\" \"cool roof\" Asia India Bangladesh")}&filter=${encodeURIComponent(`from-created-date:${from},until-created-date:${to}${extra}`)}&select=DOI,title,abstract,container-title,published,type,author,publisher&mailto=hello@beattheheat.asia`);
      for (const x of (j.message && j.message.items) || []) out.push({ title: clean((x.title || [])[0]), abstract: clean(x.abstract), doi: (x.DOI || "").toLowerCase(), url: "https://doi.org/" + x.DOI,
        date: ((x.published && x.published["date-parts"] && x.published["date-parts"][0]) || []).map(n => String(n).padStart(2, "0")).join("-"),
        venue: (x["container-title"] || [])[0] || x.publisher || "", kind: /posted-content/.test(x.type) || /^10\.2139/.test(x.DOI) ? "preprint" : x.type === "report" ? "report" : "article",
        by: ((x.author || [])[0] && ((x.author[0].family || "") + "")) || "", via: label });
      await sleep(1500);
    }
    return out;
  },
  async arxiv(from) {
    const query = `(${["heatwave", "\"heat wave\"", "\"extreme heat\"", "\"heat stress\"", "\"urban heat\""].map(t => "abs:" + t).join(" OR ")}) AND (${["India", "Bangladesh", "Pakistan", "Thailand", "Indonesia", "Philippines", "Vietnam", "\"South Asia\"", "\"Southeast Asia\""].map(t => "abs:" + t).join(" OR ")})`;
    const xml = await get("https://export.arxiv.org/api/query?sortBy=submittedDate&sortOrder=descending&max_results=100&search_query=" + encodeURIComponent(query), "text");
    return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, e]) => { const t = k => clean((e.match(new RegExp(`<${k}[^>]*>([\\s\\S]*?)</${k}>`)) || [])[1]);
      return { title: t("title"), abstract: t("summary"), date: t("published").slice(0, 10), url: t("id"), doi: (e.match(/<arxiv:doi[^>]*>([^<]+)/) || [])[1] || "", venue: "arXiv", kind: "preprint", by: t("name"), via: "arXiv" }; })
      .filter(x => x.date >= from);
  },
  async openalex(from, to) {
    const abs = inv => { if (!inv) return ""; const w = []; for (const [k, ps] of Object.entries(inv)) ps.forEach(p => { w[p] = k; }); return w.join(" "); };
    const j = await get("https://api.openalex.org/works?per-page=100&sort=publication_date:desc&filter=" + encodeURIComponent(`from_created_date:${from},to_created_date:${to},title_and_abstract.search:${TERMS.slice(0, 9).map(t => t.replace(/[^a-z -]/gi, "")).join("|")}`) + "&select=" + ["title", "abstract_inverted_index", "publication_date", "doi", "primary_location", "type", "authorships"].join(",") +
      "&mailto=hello@beattheheat.asia" + (process.env.OPENALEX_API_KEY ? "&api_key=" + encodeURIComponent(process.env.OPENALEX_API_KEY) : ""));
    return (j.results || []).map(x => ({ title: clean(x.title), abstract: clean(abs(x.abstract_inverted_index)), date: x.publication_date || "", doi: (x.doi || "").replace("https://doi.org/", "").toLowerCase(),
      url: x.doi || (x.primary_location && x.primary_location.landing_page_url) || x.id, venue: (x.primary_location && x.primary_location.source && x.primary_location.source.display_name) || "",
      kind: x.type === "preprint" ? "preprint" : x.type === "report" ? "report" : "article", by: ((x.authorships || [])[0] && x.authorships[0].author.display_name.split(" ").slice(-1)[0]) || "",
      via: (x.primary_location && x.primary_location.source && x.primary_location.source.type === "repository") ? "Repository via OpenAlex" : "OpenAlex" }));
  },
  async worldbank(from) {
    const j = await get(`https://search.worldbank.org/api/v2/wds?format=json&rows=50&os=0&qterm=${encodeURIComponent("heat")}&strdate=${from}&fl=display_title,docdt,url,abstracts,docty,count`);
    return Object.values(j.documents || {}).filter(x => x && x.display_title).map(x => ({ title: clean(x.display_title), abstract: clean(x.abstracts && (x.abstracts.cdata || x.abstracts["cdata!"] || "")),
      date: String(x.docdt || "").slice(0, 10), url: x.url || "", doi: "", venue: "World Bank", kind: "report", by: "World Bank", via: "World Bank Documents" }));
  },
  async who(from) {
    const j = await get("https://iris.who.int/server/api/discover/search/objects?query=" + encodeURIComponent("heat") + "&sort=dc.date.accessioned,DESC&size=50");
    const objs = (((j._embedded || {}).searchResult || {})._embedded || {}).objects || [];
    return objs.map(o => (o._embedded || {}).indexableObject || {}).map(it => { const m = k => ((it.metadata || {})[k] || [])[0]?.value || "";
      return { title: clean(m("dc.title")), abstract: clean(m("dc.description.abstract")), date: (m("dc.date.issued") || m("dc.date.accessioned")).slice(0, 10),
        url: m("dc.identifier.uri") || (it.handle ? "https://iris.who.int/handle/" + it.handle : ""), doi: "", venue: "World Health Organization", kind: "report", by: "WHO", via: "WHO IRIS" }; })
      .filter(x => x.title && (!x.date || x.date >= from.slice(0, 4)));
  }
};

(async () => {
  const now = new Date(), to = now.toISOString().slice(0, 10), from = new Date(now - DAYS * 864e5).toISOString().slice(0, 10), week = arg("--week", isoWeek(now));
  fs.mkdirSync(INBOX, { recursive: true });
  const seen = new Set(fs.existsSync(SEEN) ? JSON.parse(fs.readFileSync(SEEN, "utf8")).keys : []);
  const status = {}, all = [];
  for (const [name, fn] of Object.entries(SOURCES)) {
    try { const got = await fn(from, to); status[name] = { ok: true, found: got.length }; all.push(...got); console.log(`${name}: ${got.length}`); }
    catch (e) { status[name] = { ok: false, error: String(e.message || e).slice(0, 160) }; console.log(`::warning::${name} did not answer: ${status[name].error}`); }
  }
  // one record per study: by DOI, else by normalised title
  const key = x => x.doi ? "doi:" + x.doi : "t:" + x.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().slice(0, 140);
  const byKey = new Map();
  for (const x of all.filter(x => x.title)) { const k = key(x), had = byKey.get(k); if (!had) byKey.set(k, { ...x, found_in: [x.via] }); else { had.found_in = [...new Set(had.found_in.concat(x.via))]; if (!had.abstract && x.abstract) had.abstract = x.abstract; } }
  const fresh = [...byKey.entries()].filter(([k]) => !seen.has(k));
  const screened = fresh.map(([k, x]) => ({ k, x, s: screen(x) }));
  const kept = screened.filter(c => c.s.keep).sort((a, b) => b.s.score - a.s.score).slice(0, MAX);
  const candidates = kept.map(({ k, x, s }) => ({
    key: k, title: x.title, url: x.url, doi: x.doi || "", date: x.date, venue: x.venue, kind: x.kind, first_author: x.by, found_in: x.found_in, streams: s.streams,
    suggested: { ...extract(x), cycles: suggestCycles(x) },
    decision: "pending",            // reviewer: "accept" or "reject"
    review: { cycle: "", finding: "", grade: "", where: "", sample_size: "", effect_size: "", unit_cost: "", agro_climatic_zone: "", failure_modes: "", limit: "", note: "" }
  }));
  const file = path.join(INBOX, `${week}.json`);
  const prev = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : null;
  const merged = prev ? prev.candidates.concat(candidates.filter(c => !prev.candidates.some(p => p.key === c.key))) : candidates;
  fs.writeFileSync(file, JSON.stringify({ week, harvested: now.toISOString(), window: { from, to }, sources: status,
    counts: { found: all.length, distinct: byKey.size, new: fresh.length, kept: candidates.length, set_aside: screened.length - kept.length },
    candidates: merged }, null, 1).replace(/—/g, "-") + "\n");
  fresh.forEach(([k]) => seen.add(k));
  fs.writeFileSync(SEEN, JSON.stringify({ about: "Studies already screened by the weekly harvest, so none is queued twice.", keys: [...seen].sort() }) + "\n");
  console.log(`week ${week}: ${all.length} found, ${fresh.length} new, ${candidates.length} queued for review -> ${path.relative(ROOT, file)}`);
  // abstracts stay in the Actions log for the reviewer; the queue holds only short quotes
  console.log("\n===== ABSTRACTS FOR THE REVIEWER =====");
  kept.forEach(({ x }, i) => console.log(`\n[${i + 1}] ${x.title}\n${x.url}\n${(x.abstract || "").slice(0, 2400)}`));
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `week=${week}\nqueued=${candidates.length}\n`);
})();
