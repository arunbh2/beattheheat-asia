#!/usr/bin/env node
/* BeatTheHeat.Asia: refresh feeds/news.json with recent heat headlines from South and Southeast Asia.
   Two independent, keyless sources are merged, so one outage cannot empty the feed:
     1. the GDELT Project's DOC 2.0 API (open data), and
     2. Google News RSS search (one query for South Asia, one for Southeast Asia).
   Run by .github/workflows/heat-news.yml every six hours, or by hand with `node tools/fetch-news.js`.
   Keeps only headlines about heat, leaves out ones framed around politics or conflict, and merges with the
   last run so the feed holds about two weeks. Each source's outcome is written into the file. If every
   source fails, the file is left as it was and a warning is raised in the Actions log. */
const fs = require("fs"), path = require("path");
const OUT = path.join(__dirname, "..", "feeds", "news.json");
const SOUTH = ["India", "Bangladesh", "Nepal", "Sri Lanka", "Pakistan", "Bhutan", "Maldives"];
const SOUTHEAST = ["Cambodia", "Indonesia", "Philippines", "Singapore", "Thailand", "Vietnam", "Malaysia", "Myanmar", "Laos", "Timor-Leste"];
const PLACES = [...SOUTH, ...SOUTHEAST];
// a city in a headline names its country
const CITIES = { Delhi: "India", Mumbai: "India", Ahmedabad: "India", Kolkata: "India", Chennai: "India", Hyderabad: "India", Dhaka: "Bangladesh", Kathmandu: "Nepal",
  Colombo: "Sri Lanka", Karachi: "Pakistan", Lahore: "Pakistan", "Phnom Penh": "Cambodia", Jakarta: "Indonesia", Manila: "Philippines", Bangkok: "Thailand",
  Hanoi: "Vietnam", "Ho Chi Minh City": "Vietnam", "Kuala Lumpur": "Malaysia", Yangon: "Myanmar" };
const placeOf = t => PLACES.find(p => new RegExp(`\\b${p}\\b`, "i").test(t)) || CITIES[Object.keys(CITIES).find(c => new RegExp(`\\b${c}\\b`, "i").test(t))] || "";
const HEAT_TERMS = ['heatwave', '"heat wave"', '"extreme heat"', '"heat stress"', 'heatstroke', '"heat index"'];
const orList = list => list.map(p => (p.includes(" ") || p.includes("-") ? `"${p}"` : p)).join(" OR ");
const QUERY = `(${HEAT_TERMS.join(" OR ")}) (${orList(PLACES)}) sourcelang:english`;
const HEAT = /heat ?waves?|extreme heat|heat ?stroke|heat stress|heat index|heat illness|heat-related|scorching|sweltering|searing heat|hot weather|high temperatures?|record temperatures?/i;
// the site builds awareness and solutions; headlines framed around politics or conflict are left out
const AVOID = /\b(election|elections|campaign|slams?|slammed|blames?|blamed|opposition|protests?|riots?|war|terror\w*|scandal|corrupt\w*|attacks?)\b/i;
const KEEP_DAYS = 14, MAX = 60, UA = "Mozilla/5.0 (compatible; BeatTheHeat.Asia news feed; +https://beattheheat.asia/)";

const key = t => t.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().slice(0, 70);
const clean = t => String(t || "").replace(/\s+/g, " ").trim();
const gdeltDate = s => { const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(s || ""); return m ? `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z` : null; };
const entities = s => String(s || "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
/** Explains a failed fetch: Node's "fetch failed" hides the real reason (DNS, TLS, refused, timeout) in e.cause. */
const why = e => [e && e.message, e && e.cause && (e.cause.code || e.cause.message)].filter(Boolean).join(": ");

/* ---- source 1: GDELT DOC 2.0 ---- */
function fromGdelt(articles) {
  return (articles || []).map(a => ({ title: clean(a.title), url: a.url, domain: a.domain || "", date: gdeltDate(a.seendate), place: placeOf(a.title || ""), via: "GDELT" }));
}
async function gdelt() {
  const url = "https://api.gdeltproject.org/api/v2/doc/doc?" + new URLSearchParams({ query: QUERY, mode: "ArtList", maxrecords: "150", timespan: "7d", format: "json", sort: "DateDesc" });
  const r = await fetch(url, { headers: { "user-agent": UA }, signal: AbortSignal.timeout(25000) });
  const text = await r.text(); if (!r.ok) throw new Error(`HTTP ${r.status}: ${text.slice(0, 120)}`);
  return fromGdelt(JSON.parse(text).articles);
}

/* ---- source 2: Google News RSS search ---- */
function fromRss(xml) {
  const items = [];
  for (const m of String(xml).matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const it = m[1], tag = n => { const x = new RegExp(`<${n}[^>]*>([\\s\\S]*?)</${n}>`).exec(it); return x ? entities(x[1]).trim() : ""; };
    const src = /<source url="([^"]*)"[^>]*>([\s\S]*?)<\/source>/.exec(it), outlet = src ? entities(src[2]).trim() : "";
    let title = clean(tag("title")); if (outlet && title.endsWith(` - ${outlet}`)) title = title.slice(0, -(outlet.length + 3)).trim();
    const when = Date.parse(tag("pubDate"));
    let domain = ""; try { domain = src ? new URL(src[1]).hostname.replace(/^www\./, "") : ""; } catch (e) {}
    items.push({ title, url: tag("link"), domain: domain || outlet, date: Number.isFinite(when) ? new Date(when).toISOString().replace(/\.\d{3}Z$/, "Z") : null, place: placeOf(title), via: "Google News" });
  }
  return items;
}
async function googleNews() {
  const run = async (places, region) => {
    const q = `(${HEAT_TERMS.join(" OR ")}) (${orList(places)}) when:7d`;
    const url = "https://news.google.com/rss/search?" + new URLSearchParams({ q, hl: `en-${region}`, gl: region, ceid: `${region}:en` });
    const r = await fetch(url, { headers: { "user-agent": UA, accept: "application/rss+xml, application/xml" }, signal: AbortSignal.timeout(25000) });
    const text = await r.text(); if (!r.ok) throw new Error(`HTTP ${r.status}: ${text.slice(0, 120)}`);
    return fromRss(text);
  };
  const [a, b] = await Promise.all([run(SOUTH, "IN"), run(SOUTHEAST, "SG")]);
  return [...a, ...b];
}

/** Merges new headlines with the last file: filtered, de-duplicated, newest first, last two weeks only. */
function build(found, prev, sources, now = Date.now()) {
  const fresh = found.filter(x => x.title && /^https?:\/\//.test(x.url || "") && x.date && HEAT.test(x.title) && !AVOID.test(x.title));
  const seen = new Set(), out = [];
  [...fresh, ...((prev && prev.items) || [])].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).forEach(x => {
    const k = key(x.title);
    if (seen.has(k) || seen.has(x.url) || now - Date.parse(x.date) > KEEP_DAYS * 86400000 || Date.parse(x.date) > now + 3600000) return;
    seen.add(k); seen.add(x.url); out.push(x);
  });
  return { updated: new Date(now).toISOString(), keepDays: KEEP_DAYS, sources, query: QUERY, items: out.slice(0, MAX) };
}

async function attempt(name, fn) {
  let last;
  for (let n = 1; n <= 3; n++) {
    try { const items = await fn(); console.log(`${name}: ${items.length} articles found`); return { name, ok: true, found: items.length, items }; }
    catch (e) { last = why(e); console.error(`${name}, attempt ${n}: ${last}`); if (n < 3) await new Promise(res => setTimeout(res, 5000 * n)); }
  }
  return { name, ok: false, found: 0, error: last, items: [] };
}

async function main() {
  let prev = null; try { prev = JSON.parse(fs.readFileSync(OUT, "utf8")); } catch (e) {}
  const results = await Promise.all([attempt("GDELT Project", gdelt), attempt("Google News", googleNews)]);
  const sources = results.map(({ name, ok, found, error }) => ({ name, ok, found, ...(error ? { error } : {}) }));
  if (!results.some(r => r.ok)) {
    console.log(`::warning title=Heat news feed::No news source could be reached (${sources.map(s => `${s.name}: ${s.error}`).join("; ")}). feeds/news.json left as it was.`);
    return;
  }
  for (const s of sources.filter(s => !s.ok)) console.log(`::warning title=Heat news feed::${s.name} could not be reached (${s.error}); the other source was used.`);
  const next = build(results.flatMap(r => r.items), prev, sources);
  fs.mkdirSync(path.dirname(OUT), { recursive: true }); fs.writeFileSync(OUT, JSON.stringify(next, null, 1) + "\n");
  console.log(`Wrote ${next.items.length} headlines from the last ${KEEP_DAYS} days.`);
}

if (require.main === module) main();
module.exports = { build, fromGdelt, fromRss, QUERY };
