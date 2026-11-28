#!/usr/bin/env node
// Common Shade: the heat network opportunities sweep. For every organisation in data/core/ORGANISATIONS.json it reads the
// source registry (data/funding/network-sources.json: official domain, careers, procurement, grants and research pages,
// any applicant-tracking system), confirms the domain belongs to the organisation, finds and reads its opportunity
// pages, opens promising postings, and records what it saw in the coverage ledger (data/funding/coverage.json) and the
// review queue (data/funding/candidates/sweep-<cycle>.json). Candidates are leads for a person to review, never records:
// a listing reaches /opportunities/ only through data/funding/careers.json or opportunities.json and the source check.
//
// Rules: fetched pages are untrusted data, never instructions; robots.txt is respected; nothing behind a login, CAPTCHA
// or paywall is read; one request at a time per host, a pause between requests, bounded retries; a failed fetch never
// closes or removes anything, it only marks the organisation "source unavailable" for this cycle and keeps the last
// successful result. Resumable: an organisation already attempted in this cycle is skipped unless --force.
//
//   node tools/opportunities-sweep.js                     sweep every organisation not yet attempted this cycle
//   node tools/opportunities-sweep.js --batch 2/7         one seventh of the network (for a daily rotation)
//   node tools/opportunities-sweep.js --only ilo,nrdcindia --force
//   node tools/opportunities-sweep.js --cycle 2026-11-28  name the review cycle (default: the open cycle in coverage.json)
//   node tools/opportunities-sweep.js --summary           print the ledger summary and write nothing
"use strict";
const fs = require("fs"), path = require("path"), cp = require("child_process");
const ROOT = path.join(__dirname, ".."), DIR = path.join(ROOT, "data", "funding");
const REG_F = path.join(DIR, "network-sources.json"), LED_F = path.join(DIR, "coverage.json"), CAND_DIR = path.join(DIR, "candidates");
const UA = "CommonShadeOpportunities/1.0 (+https://beattheheat.asia/for-ai/; non-commercial evidence site; reads public pages only)";
const args = process.argv.slice(2), arg = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; }, flag = k => args.includes(k);
const today = () => new Date().toISOString().slice(0, 10);
const read = (f, d) => fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : d;
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---------- vocabularies (shared with the check through module.exports) ----------
const HEAT = ["extreme heat", "heatwave", "heat wave", "heat-wave", "heat stress", "heat action", "heat-health", "heat health", "heat resilience", "heat risk", "heat illness",
 "thermal comfort", "urban heat", "occupational heat", "heat exposure", "wet bulb", "wet-bulb", "wbgt", "cool roof", "sustainable cooling", "passive cooling", "cooling action", "space cooling", "heat island", "heat mitigation", "heat adaptation", "rising temperatures", "high temperatures"];
const RELATED = ["climate and health", "climate-health", "climate & health", "climate change and health", "health and climate", "climate adaptation", "urban resilience", "climate resilience",
 "social protection", "early warning", "anticipatory action", "occupational safety", "occupational health", "worker protection", "energy efficiency", "green buildings", "built environment",
 "disaster risk", "air quality", "climate risk", "nature-based solutions", "urban greening", "informal workers", "vulnerability assessment"];
const OPP_LINK = /\b(careers?|jobs?|job openings|vacanc(y|ies)|work with us|join us|join our team|current openings|opportunities|tenders?|procurement|rfps?|requests? for proposals?|calls? for (proposals|applications)|grants?|funding|fellowships?|internships?|recruit(ment)?|consultanc(y|ies)|expressions? of interest)\b/i;
const POSTING = /\b(consultant|consultancy|officer|associate|analyst|manager|specialist|director|fellow(ship)?|intern(ship)?|assistant|coordinator|researcher|research (?:associate|assistant|fellow|officer|scientist)|post-?doc|scientist|engineer|lead|adviser|advisor|head of|tender|rfp|rfq|eoi|expression of interest|call for|request for|terms of reference|vacancy|position|grant call|call for proposals)\b/i;
const APPLY = /\b(apply|application|applications|applicants?|deadline|closing date|last date|terms of reference|eligib|submit (?:your|a|proposals?)|send your (?:cv|application)|how to apply|candidates?|qualifications|bids?|proposals? (?:are|must|should) be)\b/i;
const NAV_JUNK = /^(home|about( us)?|contact( us)?|login|log in|sign in|register|privacy|terms|cookies?|search|menu|news|blog|events?|media|donate|subscribe|careers?|jobs|opportunities|read more|learn more|more|apply|view all|see all|back)$/i;
const ATS = /(greenhouse\.io|lever\.co|myworkdayjobs\.com|workday\.com|smartrecruiters\.com|bamboohr\.com|recruitee\.com|zohorecruit\.|keka\.com|darwinbox\.|taleo\.net|successfactors\.|oraclecloud\.com|ashbyhq\.com|workable\.com|breezy\.hr|jobvite\.com|icims\.com|teamtailor\.com|freshteam\.com|personio\.|jobs\.ashbyhq|applytojob\.com|hire\.withgoogle\.com|impactpool\.org|unjobs|devnetjobs|ungm\.org|careers\.un\.org|jobs\.undp\.org|unicef\.org\/careers|who\.int\/careers|ilo\.org\/careers|adb\.org\/work-with-us)/i;
const CHALLENGE = /(cf-chl|just a moment\.\.\.|attention required|captcha|access denied|request blocked|are you a robot|enable javascript and cookies to continue)/i;
const DEADLINE_RX = /(deadline|closing date|last date|apply by|applications? (?:by|before|due|close)|send your application by|submission (?:date|deadline)|closes on|due date)[^.]{0,80}?((?:\d{1,2}(?:st|nd|rd|th)?\s+)?(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*(?:\d{1,2}(?:st|nd|rd|th)?,?\s*)?\d{4}|\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}|\d{4}-\d{2}-\d{2})/i;

// ---------- fetching ----------
// curl through the agent proxy where one is configured (the cloud session), Node's fetch elsewhere (GitHub runners)
function curlGet(url, timeout) {
 const parse = out => { const i = out.lastIndexOf("\n__CS__"); if (i < 0) return null; const meta = out.slice(i + 7).split(" "); return { status: +meta[0] || 0, url: meta[1] || url, type: meta.slice(2).join(" "), body: out.slice(0, i) }; };
 return new Promise(res => cp.execFile("curl", ["-sL", "--compressed", "-m", String(timeout), "--max-filesize", "4000000", "--max-redirs", "5", "-A", UA, "-H", "Accept: text/html,application/xhtml+xml,text/plain;q=0.8,*/*;q=0.5",
  "-w", "\n__CS__%{http_code} %{url_effective} %{content_type}", url], { maxBuffer: 8e6, encoding: "utf8" }, (err, stdout) => res(parse(String(stdout || "")) || { status: 0, url, type: "", body: "", error: err ? "no response" : "unreadable" })));
}
async function fetchGet(url, timeout) {
 const ac = new AbortController(), t = setTimeout(() => ac.abort(), timeout * 1000);
 try { const r = await fetch(url, { redirect: "follow", signal: ac.signal, headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml,text/plain;q=0.8,*/*;q=0.5" } });
  const type = r.headers.get("content-type") || ""; const body = /html|text|xml|json/.test(type) ? (await r.text()).slice(0, 4e6) : "";
  return { status: r.status, url: r.url, type, body }; } catch (e) { return { status: 0, url, type: "", body: "", error: String(e.name || e) }; } finally { clearTimeout(t); }
}
const useCurl = !!(process.env.HTTPS_PROXY || process.env.https_proxy) || flag("--curl");
const lastHit = {}, cache = new Map();
async function get(url, opt = {}) {
 if (cache.has(url)) return cache.get(url);
 let host = ""; try { host = new URL(url).host; } catch (e) { return { status: 0, url, body: "", error: "bad url" }; }
 const wait = (lastHit[host] || 0) + 1200 - Date.now(); if (wait > 0) await sleep(wait); lastHit[host] = Date.now();
 let r;
 for (let tries = 0; tries < 2; tries++) { // bounded: one retry on a network error or a 5xx, never on 4xx
  r = useCurl ? await curlGet(url, opt.timeout || 20) : await fetchGet(url, opt.timeout || 20);
  if (r.status && r.status < 500) break; await sleep(2000);
 }
 cache.set(url, r); return r;
}

// ---------- robots.txt (the "*" group and any group naming us) ----------
const robotsCache = {};
async function allowed(url) {
 let u; try { u = new URL(url); } catch (e) { return false; }
 const key = u.origin;
 if (!(key in robotsCache)) {
  const r = await get(key + "/robots.txt", { timeout: 12 }); const rules = [];
  if (r.status === 200 && /text\/plain|^$/.test(r.type || "") && !/<html/i.test(r.body.slice(0, 300))) {
   let applies = false, inGroup = false;
   r.body.split(/\r?\n/).forEach(line => { const l = line.replace(/#.*/, "").trim(); const m = l.match(/^([a-z-]+)\s*:\s*(.*)$/i); if (!m) return; const k = m[1].toLowerCase(), v = m[2].trim();
    if (k === "user-agent") { if (!inGroup) applies = false; inGroup = true; if (v === "*" || /commonshade/i.test(v)) applies = true; }
    else { inGroup = false; if (applies && (k === "disallow" || k === "allow") && v) rules.push([k, v]); } });
  }
  robotsCache[key] = rules;
 }
 const p = u.pathname + u.search; let best = null;
 robotsCache[key].forEach(([k, v]) => { const rx = new RegExp("^" + v.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\\\$$/, "$")); if (rx.test(p) && (!best || v.length > best[1].length || (v.length === best[1].length && k === "allow"))) best = [k, v]; });
 return !best || best[0] === "allow";
}

// ---------- page reading ----------
const ent = s => s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;|&rsquo;|&lsquo;/g, "'").replace(/&ndash;|&mdash;/g, "-").replace(/&#(\d+);/g, (m, n) => String.fromCharCode(+n));
function page(html, base) {
 const h = String(html || "").replace(/<!--[\s\S]*?-->/g, " ").replace(/<(script|style|noscript|svg|template)[\s\S]*?<\/\1>/gi, " ");
 const title = ent(((h.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "").replace(/\s+/g, " ").trim());
 const h1 = ent(((h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
 const links = [];
 h.replace(/<a\b[^>]*?href\s*=\s*["']([^"'#]+)[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi, (m, href, inner) => { let abs; try { abs = new URL(ent(href.trim()), base).href; } catch (e) { return; }
  if (!/^https?:/.test(abs)) return; links.push({ href: abs, text: ent(inner.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim().slice(0, 200) }); });
 const text = ent(h.replace(/<br\s*\/?>|<\/(p|li|h\d|div|tr)>/gi, " \n ").replace(/<[^>]+>/g, " ")).replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, "\n").trim();
 return { title, h1, links, text };
}
const hits = (text, list) => { const t = " " + text.toLowerCase() + " "; return list.filter(w => t.includes(w)); };
const around = (text, word, n = 160) => { const i = text.toLowerCase().indexOf(word); if (i < 0) return ""; return text.slice(Math.max(0, i - n), i + word.length + n).replace(/\s+/g, " ").trim(); };
const sameSite = (a, b) => { try { const x = new URL(a).hostname.replace(/^www\./, ""), y = new URL(b).hostname.replace(/^www\./, ""); return x === y || x.endsWith("." + y) || y.endsWith("." + x); } catch (e) { return false; } };
const STOP = new Set(["the", "and", "for", "of", "in", "on", "india", "national", "international", "institute", "foundation", "centre", "center", "council", "global", "network", "organisation", "organization", "department", "ministry", "government", "corporation", "city", "authority", "programme", "program", "association", "society", "trust", "limited", "private", "public", "development", "research", "university", "with", "who", "and", "bank"]);
// a domain belongs to the organisation when its homepage names it: the acronym in brackets, the record id, or most of its distinctive words
function identity(org, pg) {
 const hay = (pg.title + " " + pg.h1 + " " + pg.text.slice(0, 6000)).toLowerCase();
 const acr = (org.name.match(/\(([A-Z][A-Za-z&.\- ]{1,12})\)/) || [])[1];
 if (acr && new RegExp("\\b" + acr.toLowerCase().replace(/[.&]/g, m => "\\" + m) + "\\b").test(hay)) return { ok: true, by: `names "${acr}"` };
 const words = org.name.replace(/\(.*?\)/g, " ").toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 2 && !STOP.has(w));
 const found = words.filter(w => hay.includes(w));
 if (words.length && found.length / words.length >= 0.6) return { ok: true, by: `names ${found.slice(0, 4).join(", ")}` };
 const full = org.name.replace(/\(.*?\)/g, "").trim().toLowerCase(); if (full.length > 3 && hay.includes(full)) return { ok: true, by: "names the organisation" };
 return { ok: false, by: words.length ? `homepage did not name ${words.join(", ")}` : "no distinctive words to match" };
}

// ---------- one organisation ----------
async function sweepOrg(org, reg) {
 const res = { id: org.id, attempted: today(), pages: [], candidates: [], notes: [] };
 const domain = reg.domain; if (!domain) { res.status = "manual"; res.notes.push("No official domain recorded: the network record points to a third-party page."); return res; }
 const home = "https://" + domain + "/";
 if (!(await allowed(home))) { res.status = "blocked"; res.notes.push("robots.txt disallows the homepage."); return res; }
 const hr = await get(home);
 if (!hr.status) { res.status = "unavailable"; res.notes.push(`Homepage did not respond (${hr.error || "no response"}).`); return res; }
 if (hr.status === 401 || hr.status === 403 || hr.status === 429 || CHALLENGE.test(hr.body.slice(0, 4000))) { res.status = "blocked"; res.notes.push(`Homepage refused automated reading (HTTP ${hr.status}).`); return res; }
 if (hr.status >= 400) { res.status = "unavailable"; res.notes.push(`Homepage returned HTTP ${hr.status}.`); return res; }
 const hp = page(hr.body, hr.url), id = identity(org, hp);
 res.identity = id; res.final_home = hr.url;
 // the opportunity pages: those in the registry, then links found on the homepage, then a few common paths
 const known = ["careers", "procurement", "grants", "research"].map(k => reg[k]).filter(Boolean);
 let found = hp.links.filter(l => (OPP_LINK.test(l.text) || /\/(careers?|jobs?|vacanc|work-with-us|join-us|opportunit|tenders?|procurement|grants?|funding|fellowship|internship|recruit)/i.test(l.href)) && (sameSite(l.href, hr.url) || ATS.test(l.href)))
  .map(l => l.href.replace(/[?#].*$/, m => /[?&](page|id|job)=/i.test(m) ? m : ""));
 found = [...new Set([...known, ...found])].filter(u => !/\.(pdf|docx?|xlsx?|zip|jpg|png)$/i.test(u)).slice(0, 6);
 if (!found.length) for (const p of ["careers", "jobs", "work-with-us", "opportunities"]) { const u = new URL(p, hr.url).href; if (!(await allowed(u))) continue; const r = await get(u, { timeout: 15 }); if (r.status === 200 && OPP_LINK.test(page(r.body, r.url).text.slice(0, 5000))) { found.push(r.url); break; } }
 if (!found.length) { res.status = id.ok ? "manual" : "manual"; res.notes.push("No careers, procurement or grants page found from the homepage; needs a person to look."); if (!id.ok) res.notes.push("Identity not confirmed: " + id.by + "."); return res; }
 const postings = new Map();
 for (const u of found) {
  if (!(await allowed(u))) { res.pages.push({ url: u, status: "robots" }); continue; }
  const r = await get(u); const p = page(r.body, r.url);
  const rec = { url: r.url || u, http: r.status, chars: p.text.length, ats: (p.links.find(l => ATS.test(l.href) && !sameSite(l.href, hr.url)) || {}).href || (ATS.test(r.url || "") ? r.url : null) };
  if (r.status === 401 || r.status === 403 || r.status === 429 || CHALLENGE.test(r.body.slice(0, 4000))) rec.status = "blocked";
  else if (!r.status || r.status >= 400) rec.status = "unavailable";
  else if (p.text.length < 600) rec.status = "thin"; // likely drawn by JavaScript
  else rec.status = "read";
  rec.heat = hits(p.text, HEAT); rec.related = hits(p.text, RELATED);
  res.pages.push(rec);
  if (rec.status !== "read") continue;
  p.links.filter(l => l.text.length >= 8 && l.text.length <= 180 && !NAV_JUNK.test(l.text) && POSTING.test(l.text + " " + l.href) && (sameSite(l.href, r.url) || ATS.test(l.href)) && l.href !== r.url && !found.includes(l.href))
   .forEach(l => { if (!postings.has(l.href)) postings.set(l.href, { href: l.href, text: l.text, from: r.url }); });
 }
 // open the promising postings (bounded), keep the ones that mention heat or a related area
 const list = [...postings.values()].sort((a, b) => (hits(b.text, HEAT).length * 3 + hits(b.text, RELATED).length) - (hits(a.text, HEAT).length * 3 + hits(a.text, RELATED).length)).slice(0, 14);
 for (const l of list) {
  if (/\.(pdf|docx?)$/i.test(l.href)) { const h = hits(l.text, HEAT), rel = hits(l.text, RELATED); if (h.length || rel.length) res.candidates.push({ url: l.href, title: l.text, from: l.from, heat: h, related: rel, doc: true, note: "A document link; read by a person." }); continue; }
  if (!(await allowed(l.href))) continue;
  const r = await get(l.href, { timeout: 15 }); if (r.status !== 200) continue;
  const p = page(r.body, r.url), h = hits(p.title + " " + p.text, HEAT), rel = hits(p.title + " " + p.text, RELATED);
  if (!h.length && !rel.length) continue;
  if (!APPLY.test(p.text)) continue; // a page about a theme, not an opportunity
  const dl = (p.text.replace(/\s+/g, " ").match(DEADLINE_RX) || []);
  res.candidates.push({ url: r.url, title: p.h1 || l.text || p.title, link_text: l.text, from: l.from, heat: h, related: rel, deadline_text: dl[0] ? dl[0].slice(0, 160) : null, evidence: h.length ? around(p.text, h[0]) : around(p.text, rel[0]) });
 }
 const read = res.pages.filter(p => p.status === "read");
 if (!id.ok) { res.status = "manual"; res.notes.push("Identity not confirmed: " + id.by + "."); }
 else if (res.candidates.length) res.status = "candidates";
 else if (read.length) res.status = "none";
 else if (res.pages.some(p => p.status === "blocked")) res.status = "blocked";
 else if (res.pages.some(p => p.status === "thin")) { res.status = "manual"; res.notes.push("The opportunity page is drawn by JavaScript or an applicant-tracking system; a person or a feed adapter needs to read it."); }
 else res.status = "unavailable";
 return res;
}

// ---------- ledger ----------
const STATUS = { found: "Checked; relevant opportunities found", candidates: "Checked; candidates awaiting review", none: "Checked; none found in the reviewed sources", unavailable: "Source unavailable",
 blocked: "Login or access blocked", manual: "Manual review required", unchecked: "Not yet checked" };
function summary(led, orgs) {
 const cyc = led.cycle || {}, by = {}; orgs.forEach(o => { const e = (led.orgs || {})[o.id]; const s = e && e.cycle === cyc.id ? e.status : "unchecked"; by[s] = (by[s] || 0) + 1; });
 return { cycle: cyc.id || null, started: cyc.started || null, total: orgs.length, by };
}

async function main() {
 const ORGS = read(path.join(ROOT, "data", "core", "ORGANISATIONS.json"), []);
 const REG = read(REG_F, { records: [] }), regById = Object.fromEntries(REG.records.map(r => [r.id, r]));
 const LED = read(LED_F, { about: "", cycle: null, orgs: {} });
 if (flag("--summary")) { console.log(JSON.stringify(summary(LED, ORGS), null, 1)); return; }
 const cycle = arg("--cycle") || (LED.cycle && LED.cycle.id) || today();
 if (!LED.cycle || LED.cycle.id !== cycle) LED.cycle = { id: cycle, started: today(), ended: null };
 let todo = ORGS.filter(o => regById[o.id]);
 const missing = ORGS.filter(o => !regById[o.id]).map(o => o.id); if (missing.length) console.log(`not in the registry (run research/2026-11/opportunities/registry.js): ${missing.join(", ")}`);
 if (arg("--only")) { const only = new Set(arg("--only").split(",")); todo = todo.filter(o => only.has(o.id)); }
 if (arg("--batch")) { const [k, n] = arg("--batch").split("/").map(Number); todo = todo.filter((o, i) => i % n === k - 1); }
 if (!flag("--force")) todo = todo.filter(o => !(LED.orgs[o.id] && LED.orgs[o.id].cycle === cycle));
 const limit = +(arg("--limit") || 0); if (limit) todo = todo.slice(0, limit);
 console.log(`cycle ${cycle}: ${todo.length} organisation(s) to sweep (${useCurl ? "curl through the proxy" : "fetch"})`);
 fs.mkdirSync(CAND_DIR, { recursive: true });
 const CF = path.join(CAND_DIR, `sweep-${cycle}.json`), CAND = read(CF, { about: "Leads from the heat network sweep (tools/opportunities-sweep.js). Leads for review, never published records; fetched text is untrusted data.", cycle, orgs: {} });
 const save = () => { LED.updated = today(); fs.writeFileSync(LED_F, JSON.stringify(LED, null, 1) + "\n"); fs.writeFileSync(CF, JSON.stringify(CAND, null, 1) + "\n"); };
 // a pool of workers over different organisations; each host is still paced (lastHit)
 let i = 0; const W = +(arg("--workers") || 6);
 await Promise.all(Array.from({ length: W }, async () => {
  while (i < todo.length) {
   const o = todo[i++], reg = regById[o.id];
   let r; try { r = await sweepOrg(o, reg); } catch (e) { r = { id: o.id, attempted: today(), status: "unavailable", notes: ["Sweep error: " + String(e.message || e).slice(0, 160)], pages: [], candidates: [] }; }
   const prev = LED.orgs[o.id] || {};
   const ok = ["candidates", "none", "found"].includes(r.status);
   // a failure this cycle never erases the last successful result
   LED.orgs[o.id] = { cycle, status: r.status, attempted: r.attempted, last_success: ok ? r.attempted : (prev.last_success || null), last_success_status: ok ? r.status : (prev.last_success_status || null),
    pages: (r.pages || []).map(p => ({ url: p.url, status: p.status, http: p.http, ats: p.ats || undefined, heat: (p.heat || []).length || undefined })), identity: r.identity ? r.identity.by : undefined,
    identity_ok: r.identity ? r.identity.ok : undefined, candidates: (r.candidates || []).length, notes: r.notes, reviewed: prev.cycle === cycle ? prev.reviewed : undefined };
   if ((r.candidates || []).length) CAND.orgs[o.id] = r.candidates; else delete CAND.orgs[o.id];
   console.log(`${String(i).padStart(3)} ${o.id.padEnd(24)} ${r.status}${r.candidates && r.candidates.length ? ` (${r.candidates.length})` : ""}`);
   if (i % 5 === 0) save();
  }
 }));
 save();
 const s = summary(LED, ORGS); console.log(`ledger: ${Object.entries(s.by).map(([k, v]) => `${k} ${v}`).join(", ")} of ${s.total}`);
 if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `summary=${Object.entries(s.by).map(([k, v]) => `${k}:${v}`).join(",")}\n`);
}
if (require.main === module) main().catch(e => { console.error(e); process.exit(1); });
module.exports = { HEAT, RELATED, STATUS, identity, page, hits, summary, allowedFor: allowed, DEADLINE_RX };
