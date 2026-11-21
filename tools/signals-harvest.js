#!/usr/bin/env node
// Common Shade: the weekly Signals harvest. Reads free public feeds for developments on extreme heat in South and
// Southeast Asia (plans, rules, funding, findings and guidance), keeps items that mention heat and a place the site
// covers, drops anything already tracked or already proposed, and writes the week's candidates to
// data/signals-candidates/<YYYY-MM-DD>.json. Nothing here reaches the website: a person reviews each candidate, and a
// candidate becomes a record only through a research batch (stage.js, verify-sources.yml, gate.js), with its step
// set by the evidence, never by the feed. The file also records which places were searched and when, so the Signals
// coverage grid can say "searched, nothing tracked yet" with a date.
//   node tools/signals-harvest.js [--days 8]
// Runs on GitHub (.github/workflows/signals-weekly.yml), where the feeds can be reached. No keys, no cost.
// Sources (each read only by this job, never from a reader's browser): ReliefWeb (heat wave search), PreventionWeb
// news, UN News (climate change, and Asia Pacific), WHO news. A feed that does not answer is noted and the run carries on.
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), OUT = path.join(ROOT, "data", "signals-candidates");
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
const DAYS = Math.min(60, Math.max(1, +arg("--days", 8) || 8));
const FEEDS = [
  ["ReliefWeb: heat wave", "https://reliefweb.int/updates/rss.xml?search=heat%20wave"],
  ["PreventionWeb: news", "https://www.preventionweb.net/rss.xml"],
  ["UN News: climate change", "https://news.un.org/feed/subscribe/en/news/topic/climate-change/feed/rss.xml"],
  ["UN News: Asia Pacific", "https://news.un.org/feed/subscribe/en/news/region/asia-pacific/feed/rss.xml"],
  ["WHO: news", "https://www.who.int/rss-feeds/news-english.xml"]
];
// the places the Signals coverage grid shows, with the names a feed may use
const PLACES = {
  bangladesh: ["Bangladesh", "Dhaka"], cambodia: ["Cambodia", "Phnom Penh"], india: ["India", "Delhi", "Mumbai", "Ahmedabad", "Kolkata", "Chennai", "Odisha", "Gujarat", "Maharashtra", "Rajasthan", "Telangana", "Tamil Nadu"],
  indonesia: ["Indonesia", "Jakarta"], lao: ["Lao PDR", "Laos", "Vientiane"], malaysia: ["Malaysia", "Kuala Lumpur"], myanmar: ["Myanmar", "Yangon"],
  nepal: ["Nepal", "Kathmandu"], pakistan: ["Pakistan", "Karachi", "Lahore", "Sindh", "Punjab"], philippines: ["Philippines", "Manila"],
  singapore: ["Singapore"], "sri-lanka": ["Sri Lanka", "Colombo"], thailand: ["Thailand", "Bangkok"], "viet-nam": ["Viet Nam", "Vietnam", "Hanoi", "Ho Chi Minh City"],
  region: ["South Asia", "Southeast Asia", "South-East Asia", "ASEAN", "Asia-Pacific", "Asia Pacific"]
};
const HEAT = /\b(heat ?waves?|extreme heat|heat stress|heat-health|heat health|heat action plan|heat illness|heatstroke|heat stroke|cooling cent(?:re|er)s?|sustainable cooling|wet[- ]bulb|high temperatures?)\b/i;
const KIND = [["commitment", /\b(plan|policy|law|rule|regulation|guideline|advisory|fund(?:ing)?|grant|budget|launch(?:es|ed)?|adopt(?:s|ed)?|pledge|commit(?:s|ted|ment)?|programme|program|office|centre of excellence)\b/i],
  ["finding", /\b(study|report|research|survey|analysis|found|finds|record|attribution)\b/i], ["guidance", /\b(guidance|toolkit|framework|manual|protocol)\b/i]];
const UA = { "User-Agent": "Mozilla/5.0 (compatible; Common Shade signals; +https://beattheheat.asia/signals/)", "Accept": "application/rss+xml, application/atom+xml, application/xml;q=0.9, */*;q=0.5" };
const clean = t => String(t || "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&amp;/g, "&").replace(/&#(\d+);/g, (m, n) => String.fromCharCode(+n)).replace(/\s+/g, " ").trim();
const tag = (x, t) => { const m = x.match(new RegExp(`<${t}(?:\\s[^>]*)?>([\\s\\S]*?)</${t}>`, "i")); return m ? clean(m[1]) : ""; };
const linkOf = x => { const a = x.match(/<link[^>]*href="([^"]+)"/i); return a ? a[1] : tag(x, "link"); };
const iso = d => { const t = Date.parse(d); return isNaN(t) ? "" : new Date(t).toISOString().slice(0, 10); };
const normUrl = u => String(u || "").trim().replace(/[?#].*$/, "").replace(/\/+$/, "").toLowerCase();

async function get(url) {
  for (let i = 0; i < 3; i++) {
    try { let r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(30000) });
      // ReliefWeb answers a feed Accept header with 406; it serves the same feed to a plain one (as tools/fetch-news.js does)
      if (r.status === 406) r = await fetch(url, { headers: Object.assign({}, UA, { Accept: "*/*" }), signal: AbortSignal.timeout(30000) });
      if (r.ok) return { ok: true, text: await r.text() };
      if (![429, 502, 503, 504].includes(r.status)) return { ok: false, why: `HTTP ${r.status}` }; } catch (e) { if (i === 2) return { ok: false, why: e.name === "TimeoutError" ? "timed out" : e.message }; }
    await new Promise(r => setTimeout(r, 4000 * (i + 1)));
  }
  return { ok: false, why: "no answer after three tries" };
}

async function main() {
  const today = new Date().toISOString().slice(0, 10), since = new Date(Date.now() - DAYS * 864e5).toISOString().slice(0, 10);
  const S = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "site", "signals.json"), "utf8"));
  const tracked = new Set(S.signals.flatMap(s => (s.sources || []).map(x => normUrl(x.url))));
  fs.mkdirSync(OUT, { recursive: true });
  const proposed = new Set(fs.readdirSync(OUT).filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).flatMap(f => JSON.parse(fs.readFileSync(path.join(OUT, f), "utf8")).candidates.map(c => normUrl(c.url))));
  const feeds = [], seen = new Set(), candidates = [];
  for (const [name, url] of FEEDS) {
    const r = await get(url);
    if (!r.ok) { feeds.push({ name, url, status: r.why, items: 0 }); continue; }
    const items = r.text.match(/<item[\s>][\s\S]*?<\/item>|<entry[\s>][\s\S]*?<\/entry>/gi) || [];
    let kept = 0;
    for (const it of items) {
      const title = tag(it, "title"), link = linkOf(it), date = iso(tag(it, "pubDate") || tag(it, "published") || tag(it, "updated") || tag(it, "dc:date"));
      const text = `${title}. ${tag(it, "description") || tag(it, "summary") || tag(it, "content")}`, u = normUrl(link);
      if (!link || !u || seen.has(u) || (date && date < since) || !HEAT.test(text)) continue;
      const places = Object.entries(PLACES).filter(([, names]) => names.some(n => new RegExp(`\\b${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text))).map(([k]) => k);
      if (!places.length) continue;
      seen.add(u);
      if (tracked.has(u) || proposed.has(u)) continue;
      kept++;
      candidates.push({ title, url: link, feed: name, published: date || "not stated in the feed", places, kind_hint: (KIND.find(([, rx]) => rx.test(text)) || ["unclear"])[0],
        heat_terms: [...new Set((text.match(new RegExp(HEAT.source, "gi")) || []).map(t => t.toLowerCase()))], summary: text.slice(title.length + 2, title.length + 2 + 320), decision: "pending" });
    }
    feeds.push({ name, url, status: "OK", items: items.length, kept });
  }
  candidates.sort((a, b) => String(b.published).localeCompare(String(a.published)));
  const file = path.join(OUT, `${today}.json`);
  fs.writeFileSync(file, JSON.stringify({
    about: "Candidates for Signals from the weekly harvest (tools/signals-harvest.js). Not published and not evidence: each is a lead for a person to review. Set decision to 'propose' to take one into a research batch (its sources are then staged and checked like any other), or 'skip'. The kind is a hint from words in the feed, not a step on the ladder.",
    run: { date: today, since, days: DAYS }, searched_places: Object.keys(PLACES), feeds, candidates
  }, null, 1) + "\n");
  console.log(`signals harvest: ${candidates.length} candidates since ${since}; feeds: ${feeds.map(f => `${f.name} ${f.status}${f.status === "OK" ? ` (${f.kept}/${f.items})` : ""}`).join("; ")}`);
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `date=${today}\nqueued=${candidates.length}\n`);
}
// the latest run's date for each place searched, for the coverage grid (read at build time, no network)
function lastSearched() {
  if (!fs.existsSync(OUT)) return {};
  const runs = fs.readdirSync(OUT).filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort(), out = {};
  for (const f of runs) { const j = JSON.parse(fs.readFileSync(path.join(OUT, f), "utf8")); if (!(j.feeds || []).some(x => x.status === "OK")) continue; (j.searched_places || []).forEach(p => { out[p] = j.run.date; }); }
  return out;
}
module.exports = { PLACES, FEEDS, lastSearched };
if (require.main === module) main();
