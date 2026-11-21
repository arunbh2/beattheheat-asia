#!/usr/bin/env node
// Common Shade: the weekly funding, procurement and careers harvest. Reads the public feeds and APIs listed in
// data/funding/registry.json, keeps items that touch extreme heat directly (or a related remit, in Asia), drops anything
// already published or already queued, and writes the week's candidates to data/funding/candidates/<YYYY-MM-DD>.json for
// review. Nothing here publishes: a person reviews each candidate, its facts are staged and checked against the primary
// page (verify-sources.yml, batch 2026-11-funding-opps), and only then does it become a record in data/funding/.
// It also recalculates the status of every published record from its dates (heat-economy/funding-core.js), so the
// weekly pull request shows which records expired, opened or fell due for review.
//   node tools/funding-harvest.js [--dry-run] [--only id,id] [--days 21]
// --dry-run prints added / changed / expired / rejected counts and writes nothing.
// Runs on GitHub (.github/workflows/funding-weekly.yml), where the sources can be reached. No paid keys. Respects each
// source's limits: one request per source per run (two for paged APIs), a plain user agent, no logins.
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), DIR = path.join(ROOT, "data", "funding"), OUT = path.join(DIR, "candidates");
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
const DRY = process.argv.includes("--dry-run"), ONLY = (arg("--only", "") || "").split(",").filter(Boolean), DAYS = Math.min(90, Math.max(1, +arg("--days", 21) || 21));
const UA = { "User-Agent": "Mozilla/5.0 (compatible; Common Shade funding; +https://beattheheat.asia/heat-economy/money/)", "Accept": "application/json, application/rss+xml, application/xml;q=0.9, */*;q=0.5" };
// heat relevance, a hint for the reviewer: direct words, or a related remit that may have a heat application
const DIRECT = /\b(extreme heat|heat ?waves?|heat[- ]health|heat stress|heat illness|heatstroke|heat action plan|urban heat|heat resilien\w*|heat risk|(?:sustainable|passive|clean|space|urban|efficient|affordable) cooling|cooling (?:cent(?:re|er)s?|action plans?|shelters?|stations?)|cold[- ]chains?|thermal comfort|wet[- ]bulb|wbgt|passive cooling|cool roofs?)\b/i;
const ADJ = /\b(climate (and|&) health|climate[- ]health|occupational (safety|health)|worker (health|safety)|early warning|anticipatory action|urban resilience|climate adaptation|adaptation|social protection|informal (workers?|sector|economy)|nature[- ]based solutions?|urban greening|disaster risk|resilien(ce|t) cities|public health)\b/i;
const ASIA = /\b(asia|asian|asean|south[- ]east asia|southeast asia|south asia|india|bangladesh|pakistan|nepal|sri lanka|bhutan|maldives|indonesia|philippines|viet ?nam|thailand|cambodia|lao|laos|myanmar|malaysia|singapore|timor[- ]leste|delhi|dhaka|jakarta|manila|bangkok|hanoi|karachi|kathmandu|colombo|mumbai|ahmedabad|chennai|kolkata)\b/i;
const clean = t => String(t || "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#(\d+);/g, (m, n) => String.fromCharCode(+n)).replace(/\s+/g, " ").trim();
const tag = (x, t) => { const m = x.match(new RegExp(`<${t}(?:\\s[^>]*)?>([\\s\\S]*?)</${t}>`, "i")); return m ? clean(m[1]) : ""; };
const linkOf = x => { const a = x.match(/<link[^>]*href="([^"]+)"/i); return a ? a[1] : tag(x, "link"); };
const iso = d => { const t = Date.parse(d); return isNaN(t) ? "" : new Date(t).toISOString().slice(0, 10); };
const normUrl = u => String(u || "").trim().replace(/#.*$/, "").replace(/\/+$/, "").toLowerCase();

async function get(url, opt = {}) {
  for (let i = 0; i < 2; i++) {
    try { const r = await fetch(url, Object.assign({ headers: UA, signal: AbortSignal.timeout(30000) }, opt));
      if (r.ok) return { ok: true, text: await r.text() };
      if (![429, 502, 503, 504].includes(r.status)) return { ok: false, why: `HTTP ${r.status}` }; } catch (e) { if (i === 1) return { ok: false, why: e.name === "TimeoutError" ? "timed out" : e.message }; }
    await new Promise(r => setTimeout(r, 5000));
  }
  return { ok: false, why: "no answer after two tries" };
}
const J = r => { try { return JSON.parse(r.text); } catch (e) { return null; } };
const item = (o) => Object.assign({ title: "", org: "", url: "", published: "", deadline_text: "", location: "", text: "" }, o);

// importers: each returns { ok, items: [item] } or { ok: false, why }
const IMPORT = {
  async worldbank(s) {
    const out = [];
    for (const q of s.terms || ["heat"]) {
      const r = await get(`${s.url}?format=json&rows=50&os=0&srt=submission_date&order=desc&qterm=${encodeURIComponent(q)}`); if (!r.ok) return r;
      const j = J(r) || {}; Object.values(j.procnotices || {}).forEach(n => n && n.id && out.push(item({ title: clean(n.project_name ? `${n.bid_description || n.notice_type}: ${n.project_name}` : n.bid_description), org: clean(n.contact_organization || n.borrower_bid_reference || "World Bank-financed project"),
        url: `https://projects.worldbank.org/en/projects-operations/procurement-detail/${n.id}`, published: iso(n.noticedate || n.submission_date), deadline_text: clean(n.submission_deadline_date || n.submission_date || ""), location: clean(n.project_ctry_name),
        text: clean([n.bid_description, n.notice_type, n.procurement_method_name, n.project_name, n.project_ctry_name, n.notice_text].join(". ")).slice(0, 2000), extra: { notice_type: n.notice_type, method: n.procurement_method_name, project: n.project_id } })));
    }
    return { ok: true, items: out };
  },
  async rss(s) {
    const r = await get(s.url); if (!r.ok) return r;
    const items = (r.text.match(/<item[\s>][\s\S]*?<\/item>|<entry[\s>][\s\S]*?<\/entry>/gi) || []).map(it => item({ title: tag(it, "title"), url: linkOf(it), published: iso(tag(it, "pubDate") || tag(it, "published") || tag(it, "updated") || tag(it, "dc:date")),
      text: `${tag(it, "title")}. ${tag(it, "description") || tag(it, "summary") || tag(it, "content")}`.slice(0, 2000) }));
    return { ok: true, items };
  },
  async sedia(s) {
    const out = [];
    for (const q of s.terms || ["heat"]) {
      const body = JSON.stringify({ bool: { must: [{ terms: { type: ["1", "2", "8"] } }, { terms: { status: ["31094501", "31094502"] } }] } });
      const r = await get(`${s.url}?apiKey=SEDIA&text=${encodeURIComponent(q)}&pageSize=50&pageNumber=1`, { method: "POST", headers: Object.assign({}, UA, { "Content-Type": "application/json" }), body: (() => { const f = new FormData(); f.append("query", new Blob([body], { type: "application/json" })); return f; })() });
      if (!r.ok) return r;
      // keep calls and tenders only: the search also returns FAQs, partner searches and project results
      ((J(r) || {}).results || []).filter(x => /topic-details|tender-details|competitive-calls/.test(x.url || "") || ((x.metadata || {}).identifier || []).length).forEach(x => { const m = x.metadata || {}, one = k => (m[k] || [])[0] || "";
        out.push(item({ title: clean(one("title") || x.summary || x.content), org: "European Commission", url: x.url || `https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/topic-details/${one("identifier")}`, published: iso(one("startDate")),
          deadline_text: clean(one("deadlineDate")), text: clean(`${one("title")}. ${x.summary || ""} ${one("descriptionByte") || ""}`).slice(0, 2000), extra: { identifier: one("identifier"), call: one("callIdentifier") } })); });
    }
    return { ok: true, items: out };
  },
  async "reliefweb-jobs"(s) {
    const app = String(process.env.RELIEFWEB_APPNAME || "").trim();
    if (!app) return { ok: false, why: "waiting for an approved app name (RELIEFWEB_APPNAME secret not set)" };
    const body = { query: { value: '"heat stress" OR heatwave OR "heat wave" OR "extreme heat" OR cooling OR "climate and health" OR "early warning" OR "anticipatory action"', fields: ["title", "body"] },
      filter: { field: "status", value: "published" }, fields: { include: ["title", "url_alias", "date.created", "date.closing", "source.name", "country.name", "body", "type.name", "career_categories.name"] }, sort: ["date.created:desc"], limit: 200 };
    const r = await get(`${s.url}?appname=${encodeURIComponent(app)}`, { method: "POST", headers: Object.assign({}, UA, { "Content-Type": "application/json" }), body: JSON.stringify(body) }); if (!r.ok) return r;
    return { ok: true, items: ((J(r) || {}).data || []).map(d => { const f = d.fields || {}; return item({ title: clean(f.title), org: (f.source || []).map(x => x.name).join(", "), url: f.url_alias, published: iso(f.date && f.date.created),
      deadline_text: (f.date && f.date.closing) || "", location: (f.country || []).map(x => x.name).join(", "), text: `${clean(f.title)}. ${(f.country || []).map(x => x.name).join(", ")}. ${clean(f.body).slice(0, 1500)}` }); }) };
  },
  async greenhouse(s) {
    const r = await get(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(s.board)}/jobs?content=true`); if (!r.ok) return r;
    return { ok: true, items: ((J(r) || {}).jobs || []).map(x => item({ title: clean(x.title), org: s.name.replace(/ jobs.*$/, ""), url: x.absolute_url, published: iso(x.updated_at), location: clean((x.location || {}).name),
      text: `${clean(x.title)}. ${clean((x.location || {}).name)}. ${clean(String(x.content || "").replace(/&lt;/g, "<").replace(/&gt;/g, ">")).slice(0, 1500)}`, extra: { ref: String(x.id || ""), requisition: x.requisition_id || "" } })) };
  },
  async lever(s) {
    const r = await get(`https://api.lever.co/v0/postings/${encodeURIComponent(s.board)}?mode=json`); if (!r.ok) return r;
    return { ok: true, items: (J(r) || []).map(x => item({ title: clean(x.text), org: s.name.replace(/ jobs.*$/, ""), url: x.hostedUrl, published: x.createdAt ? new Date(x.createdAt).toISOString().slice(0, 10) : "",
      location: clean((x.categories || {}).location), text: `${clean(x.text)}. ${clean((x.categories || {}).location)}. ${clean(x.descriptionPlain || x.description).slice(0, 1500)}`, extra: { commitment: (x.categories || {}).commitment || "", workplace: x.workplaceType || "" } })) };
  },
  async workable(s) {
    const r = await get(`https://apply.workable.com/api/v1/widget/accounts/${encodeURIComponent(s.board)}`); if (!r.ok) return r;
    return { ok: true, items: ((J(r) || {}).jobs || []).map(x => item({ title: clean(x.title), org: s.name.replace(/ jobs.*$/, ""), url: x.url || x.shortlink, published: iso(x.published_on || x.created_at),
      location: clean([x.city, x.country].filter(Boolean).join(", ")), text: `${clean(x.title)}. ${clean([x.city, x.country].join(", "))}. ${clean(x.description || "").slice(0, 1500)}`, extra: { remote: !!x.telecommuting, employment: x.employment_type || "" } })) };
  },
  async personio(s) {
    const r = await get(`https://${encodeURIComponent(s.board)}.jobs.personio.de/xml`); if (!r.ok) return r;
    return { ok: true, items: (r.text.match(/<position>[\s\S]*?<\/position>/gi) || []).map(x => { const id = tag(x, "id"); return item({ title: tag(x, "name"), org: s.name.replace(/ jobs.*$/, ""), url: `https://${s.board}.jobs.personio.de/job/${id}`,
      published: iso(tag(x, "createdAt")), location: tag(x, "office"), text: `${tag(x, "name")}. ${tag(x, "office")}. ${tag(x, "jobDescriptions").slice(0, 1500)}` }); }) };
  },
  async smartrecruiters(s) {
    const r = await get(`https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(s.board)}/postings?limit=100`); if (!r.ok) return r;
    return { ok: true, items: ((J(r) || {}).content || []).map(x => item({ title: clean(x.name), org: s.name.replace(/ jobs.*$/, ""), url: `https://jobs.smartrecruiters.com/${s.board}/${x.id}`, published: iso(x.releasedDate),
      location: clean([((x.location || {}).city), ((x.location || {}).country)].filter(Boolean).join(", ")), text: `${clean(x.name)}. ${clean(JSON.stringify(x.location || {}))}. ${clean((x.department || {}).label || "")}`, extra: { remote: !!(x.location || {}).remote } })) };
  },
  // UN Careers: the portal's public job-opening data (careers.un.org/api/public), one search per term
  async uncareers(s) {
    const out = [];
    for (const q of s.terms || ["heat"]) {
      const r = await get(`${s.url}`, { method: "POST", headers: Object.assign({}, UA, { "Content-Type": "application/json" }), body: JSON.stringify({ filterConfig: { keyword: q }, pagination: { page: 0, itemPerPage: 50, sortBy: "startDate", sortDirection: -1 } }) });
      if (!r.ok) return r;
      const j = J(r) || {}, list = (j.data && (j.data.list || j.data)) || j.list || [];
      (Array.isArray(list) ? list : []).forEach(x => out.push(item({ title: clean(x.postingTitle || x.jobTitle), org: clean(x.departmentDescr || x.dept || ""), url: `https://careers.un.org/jobSearchDescription/${x.jobId}?language=en`,
        published: iso(x.startDate), deadline_text: x.endDate || "", location: clean(((x.dutyStation || [])[0] || {}).description || ""), text: `${clean(x.postingTitle || x.jobTitle)}. ${clean(x.departmentDescr || "")}. ${clean(x.jobDescription || "").slice(0, 1500)}`,
        extra: { job_id: String(x.jobId || ""), data_url: `https://careers.un.org/api/public/opening/jo/${x.jobId}/en`, level: x.jobLevel || "" } })));
    }
    return { ok: true, items: out };
  },
  async ashby(s) {
    const r = await get(`https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(s.board)}?includeCompensation=true`); if (!r.ok) return r;
    return { ok: true, items: ((J(r) || {}).jobs || []).map(x => item({ title: clean(x.title), org: s.name, url: x.jobUrl, published: iso(x.publishedAt), location: clean(x.location),
      text: `${clean(x.title)}. ${clean(x.location)}. ${clean(x.descriptionPlain || x.descriptionHtml).slice(0, 1500)}`, extra: { remote: !!x.isRemote, employment: x.employmentType || "" } })) };
  }
};

function published() {
  const read = f => fs.existsSync(path.join(DIR, f)) ? JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")) : { records: [] };
  return [...read("opportunities.json").records, ...read("careers.json").records];
}
function queued() {
  if (!fs.existsSync(OUT)) return new Set();
  return new Set(fs.readdirSync(OUT).filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).flatMap(f => JSON.parse(fs.readFileSync(path.join(OUT, f), "utf8")).candidates.map(c => normUrl(c.url))));
}
function relevance(text) {
  const d = text.match(new RegExp(DIRECT.source, "gi")), a = text.match(new RegExp(ADJ.source, "gi")), asia = ASIA.test(text);
  if (d) return { strength: "direct", terms: [...new Set(d.map(t => t.toLowerCase()))], asia };
  if (a && asia) return { strength: "adjacent", terms: [...new Set(a.map(t => t.toLowerCase()))], asia };
  return null;
}
// status changes of published records, from their dates alone (the reviewer confirms against the source)
function recalc(today) {
  // the dates now say something different from the source's own word (stated_status): an expiry, an opening, a deadline day.
  // Verification needs the source check's date, which the model attaches; records past their review date are listed too.
  const C = require(path.join(ROOT, "heat-economy", "funding-core.js")), out = [];
  const M = require(path.join(ROOT, "tools", "funding-model.js")).load();
  for (const r of [...M.all.OPP, ...M.all.CAR]) { const before = r.stated_status, s = C.applicationStatus(r, today), v = C.verificationStatus(r, today, r.kind);
    if (before && s.status !== before) out.push({ id: r.id, title: r.title, was: before, now: s.status, why: s.why });
    if (v.status !== "verified") out.push({ id: r.id, title: r.title, verification: v.status, why: v.why }); }
  return out;
}

// --probe: try each candidate job board in registry.probe and report which exist, how many jobs each lists and how many
// touch heat directly or a related remit in Asia. Writes nothing; used to grow registry.sources with boards that exist.
async function probe() {
  const R = JSON.parse(fs.readFileSync(path.join(DIR, "registry.json"), "utf8")), out = [];
  for (const [kind, boards] of Object.entries(R.probe || {})) for (const board of boards) {
    const s = { id: `${kind}-${board}`, kind, board, name: board, feeds: "careers" }; let r;
    try { r = await IMPORT[kind](s); } catch (e) { r = { ok: false, why: e.message }; }
    if (!r.ok) { out.push(`${kind}/${board}: ${r.why}`); continue; }
    const rel = r.items.map(it => ({ it, rel: relevance(`${it.title}. ${it.location}. ${it.text}`) })).filter(x => x.rel);
    out.push(`${kind}/${board}: OK, ${r.items.length} jobs, ${rel.length} relevant${rel.length ? ": " + rel.slice(0, 6).map(x => `${x.it.title} [${x.rel.strength}; ${x.it.location || "location not stated"}] ${x.it.url}`).join(" | ") : ""}`);
  }
  console.log(out.join("\n"));
}
async function main() {
  const today = new Date().toISOString().slice(0, 10), since = new Date(Date.now() - DAYS * 864e5).toISOString().slice(0, 10);
  const REG = JSON.parse(fs.readFileSync(path.join(DIR, "registry.json"), "utf8")).sources.filter(s => !ONLY.length || ONLY.includes(s.id));
  const have = new Set(published().flatMap(r => [r.url, r.official_url, r.application_url].filter(Boolean).map(normUrl))), q = queued();
  const sources = [], candidates = [], rejected = { off_topic: 0, old: 0, known: 0 };
  for (const s of REG) {
    const imp = IMPORT[s.kind]; if (!imp) { sources.push({ id: s.id, status: `no importer for kind ${s.kind}`, items: 0 }); continue; }
    let r; try { r = await imp(s); } catch (e) { r = { ok: false, why: e.message }; }
    if (!r.ok) { sources.push({ id: s.id, name: s.name, status: r.why, items: 0 }); continue; }
    let kept = 0;
    for (const it of r.items) {
      const u = normUrl(it.url); if (!u) continue;
      if (it.published && it.published < since && s.feeds !== "careers") { rejected.old++; continue; }
      const rel = relevance(`${it.title}. ${it.location}. ${it.text}`); if (!rel) { rejected.off_topic++; continue; }
      if (have.has(u) || q.has(u)) { rejected.known++; continue; }
      q.add(u); kept++;
      candidates.push({ feed: s.feeds, source: s.id, discovery_only: !!s.discovery_only, title: it.title, org: it.org, url: it.url, published: it.published || "not stated", deadline_text: it.deadline_text || "not stated in the feed",
        location: it.location || "not stated", relevance: rel, summary: it.text.slice(0, 300), extra: it.extra || {}, decision: "pending" });
    }
    sources.push({ id: s.id, name: s.name, status: "OK", items: r.items.length, kept });
  }
  const changes = fs.existsSync(path.join(ROOT, "heat-economy", "funding-core.js")) ? recalc(today) : [];
  const summary = { added: candidates.length, changed: changes.filter(c => c.now).length, expired: changes.filter(c => c.now === "closed").length, review_due: changes.filter(c => c.verification).length, rejected: rejected.off_topic + rejected.old + rejected.known, rejected_detail: rejected };
  console.log(`funding harvest${DRY ? " (dry run)" : ""}: added ${summary.added}, changed ${summary.changed}, expired ${summary.expired}, review due ${summary.review_due}, rejected ${summary.rejected} (off topic ${rejected.off_topic}, older than ${since} ${rejected.old}, already known ${rejected.known})`);
  sources.forEach(s => console.log(`  ${s.id}: ${s.status}${s.status === "OK" ? ` (${s.kept}/${s.items})` : ""}`));
  if (DRY) return;
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, `${today}.json`), JSON.stringify({
    about: "Candidates from the weekly funding and careers harvest (tools/funding-harvest.js). Not published and not evidence. For each: open the link, find the primary page (an aggregator is discovery only), and set decision to 'propose' (stage its facts for the source check), or 'reject' with a reason in 'note'. 'relevance' is a hint from words in the feed. 'status_changes' lists published records whose status the dates now change, for review.",
    run: { date: today, since, days: DAYS }, summary, sources, status_changes: changes, candidates }, null, 1) + "\n");
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `date=${today}\nqueued=${candidates.length}\nchanged=${summary.changed}\n`);
}
module.exports = { relevance, IMPORT };
if (require.main === module) (process.argv.includes("--probe") ? probe() : main()).catch(e => { console.error(e); process.exit(1); });
