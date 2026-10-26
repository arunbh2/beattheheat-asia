#!/usr/bin/env node
/* Common Shade: refresh feeds/news.json with recent heat headlines from South and Southeast Asia.
   Sources, merged so no single outage can empty the feed:
     1. RSS feeds published for syndication by regional news outlets and humanitarian services (FEEDS below),
        filtered to headlines about heat. These are built to be read by machines, including from data centres.
     2. The GDELT Project's DOC 2.0 API (open data), asked once, politely (it allows one request every 5 seconds
        and often throttles the shared addresses GitHub's runners use).
   Google News is not used: it refuses requests from data-centre addresses (HTTP 503).
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
// GDELT reads a hyphen as an operator, so hyphenated names stay out of its query (headlines still match them)
const QUERY = `(${HEAT_TERMS.join(" OR ")}) (${orList(PLACES.filter(p => !p.includes("-")))}) sourcelang:english`;
const HEAT = /heat ?waves?|extreme heat|heat ?stroke|heat stress|heat index|heat illness|heat-related|heat action plan|\b(rising|intense|severe|deadly|killer|brutal|oppressive|searing|soaring|record|blistering|relentless) heat\b|\bheat (risk|risks|toll|exposure|deaths?|health|threat|warning|alert|advisory|resilience|hits|grips|spell|season)\b|\bhot (spell|season|days)\b|scorching|sweltering|hot weather|high temperatures?|record temperatures?|temperatures? (soar|soars|rise|rises|climb|climbs|top|tops|hit|hits)\b/i;
// the site builds awareness and solutions; headlines framed around politics or conflict are left out
const AVOID = /\b(election|elections|campaign|slams?|slammed|blames?|blamed|opposition|protests?|riots?|war|terror\w*|scandal|corrupt\w*|attacks?)\b/i;
/* Feeds published for syndication. `country` is used when a headline does not name a place; null means the
   feed is international, so a headline must name a South or Southeast Asian place to be kept. */
const FEEDS = [
  { name: "The Hindu", url: "https://www.thehindu.com/news/national/feeder/default.rss", country: "India" },
  { name: "Hindustan Times", url: "https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml", country: "India" },
  { name: "The Daily Star", url: "https://www.thedailystar.net/frontpage/rss.xml", country: "Bangladesh" },
  { name: "The Kathmandu Post", url: "https://kathmandupost.com/rss", country: "Nepal" },
  { name: "Bangkok Post", url: "https://www.bangkokpost.com/rss/data/topstories.xml", country: "Thailand" },
  { name: "The Straits Times", url: "https://www.straitstimes.com/news/asia/rss.xml", country: null },
  { name: "CNA", url: "https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=6511", country: null },
  { name: "Inquirer", url: "https://newsinfo.inquirer.net/feed", country: "Philippines" },
  { name: "VnExpress International", url: "https://e.vnexpress.net/rss/news.rss", country: "Vietnam" },
  { name: "Mongabay", url: "https://news.mongabay.com/feed/", country: null },
  { name: "Eco-Business", url: "https://www.eco-business.com/feeds/news/", country: null },
  { name: "UN News, Asia Pacific", url: "https://news.un.org/feed/subscribe/en/news/region/asia-pacific/feed/rss.xml", country: null },
  { name: "UN News, climate", url: "https://news.un.org/feed/subscribe/en/news/topic/climate-change/feed/rss.xml", country: null },
  { name: "ReliefWeb", url: "https://reliefweb.int/updates/rss.xml?search=heat%20wave", country: null },
];
const KEEP_DAYS = 14, MAX = 60, UA = "Mozilla/5.0 (compatible; Common Shade news feed; +https://commonshade.org/)";

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
  let j; try { j = JSON.parse(text); } catch (e) { throw new Error(`GDELT replied: ${text.slice(0, 200).replace(/\s+/g, " ")}`); }
  return fromGdelt(j.articles);
}

/* ---- source 2: publishers' RSS and Atom feeds ---- */
function fromFeed(xml, feed) {
  const items = [], text = String(xml);
  const blocks = [...text.matchAll(/<item\b[\s\S]*?<\/item>/g), ...text.matchAll(/<entry\b[\s\S]*?<\/entry>/g)].map(m => m[0]);
  for (const it of blocks) {
    const tag = n => { const x = new RegExp(`<${n}\\b[^>]*>([\\s\\S]*?)</${n}>`).exec(it); return x ? entities(x[1]).replace(/<[^>]+>/g, "").trim() : ""; };
    let link = tag("link"); if (!/^https?:/.test(link)) { const h = /<link\b[^>]*href="([^"]+)"/.exec(it); link = h ? entities(h[1]) : ""; }
    const when = Date.parse(tag("pubDate") || tag("dc:date") || tag("published") || tag("updated"));
    const title = clean(tag("title"));
    let domain = ""; try { domain = new URL(link).hostname.replace(/^www\./, ""); } catch (e) {}
    const place = placeOf(title) || feed.country || "";
    items.push({ title, url: link, domain: domain || feed.name, date: Number.isFinite(when) ? new Date(when).toISOString().replace(/\.\d{3}Z$/, "Z") : null, place, via: feed.name, regional: !!feed.country });
  }
  return items;
}
async function feeds() {
  const results = await Promise.all(FEEDS.map(async f => {
    try {
      let r = await fetch(f.url, { headers: { "user-agent": UA, accept: "application/rss+xml, application/atom+xml, application/xml, text/xml" }, signal: AbortSignal.timeout(20000) });
      if (r.status === 406) r = await fetch(f.url, { headers: { "user-agent": UA, accept: "*/*" }, signal: AbortSignal.timeout(20000) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const items = fromFeed(await r.text(), f); if (!items.length) throw new Error("no items in the feed");
      return { name: f.name, ok: true, items };
    } catch (e) { return { name: f.name, ok: false, error: why(e), items: [] }; }
  }));
  results.forEach(r => console.log(`  ${r.ok ? "ok  " : "FAIL"} ${r.name}${r.ok ? `: ${r.items.length} items` : `: ${r.error}`}`));
  const ok = results.filter(r => r.ok);
  if (!ok.length) throw new Error("no publisher feed could be read");
  const items = ok.flatMap(r => r.items);
  items.feedsRead = ok.length; items.feedsTotal = FEEDS.length;
  return items;
}

/** Merges new headlines with the last file: filtered, de-duplicated, newest first, last two weeks only. */
function build(found, prev, sources, now = Date.now()) {
  // the log names near misses, so a filter that is too strict shows up in the Actions run
  found.filter(x => /heat|hot\b|temperatures?|scorch|swelter/i.test(x.title || "") && !(HEAT.test(x.title) && !AVOID.test(x.title) && x.place))
    .slice(0, 15).forEach(x => console.log(`  not kept (${!HEAT.test(x.title) ? "not about heat" : AVOID.test(x.title) ? "politics or conflict" : "no place in the region"}): ${x.title} [${x.via}]`));
  const fresh = found.filter(x => x.title && /^https?:\/\//.test(x.url || "") && x.date && HEAT.test(x.title) && !AVOID.test(x.title) && x.place)
    .map(({ regional, ...x }) => x);
  const seen = new Set(), out = [];
  [...fresh, ...((prev && prev.items) || [])].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).forEach(x => {
    const k = key(x.title);
    if (seen.has(k) || seen.has(x.url) || now - Date.parse(x.date) > KEEP_DAYS * 86400000 || Date.parse(x.date) > now + 3600000) return;
    seen.add(k); seen.add(x.url); out.push(x);
  });
  return { updated: new Date(now).toISOString(), keepDays: KEEP_DAYS, sources, query: QUERY, items: out.slice(0, MAX) };
}

async function attempt(name, fn, tries, waitMs) {
  let last;
  for (let n = 1; n <= tries; n++) {
    try { const items = await fn(); console.log(`${name}: ${items.length} articles found${items.feedsRead ? ` in ${items.feedsRead} of ${items.feedsTotal} feeds` : ""}`); return { name, ok: true, found: items.length, items }; }
    catch (e) { last = why(e); console.error(`${name}, attempt ${n}: ${last}`); if (n < tries) await new Promise(res => setTimeout(res, waitMs)); }
  }
  return { name, ok: false, found: 0, error: last, items: [] };
}

async function main() {
  let prev = null; try { prev = JSON.parse(fs.readFileSync(OUT, "utf8")); } catch (e) {}
  // publisher feeds once; GDELT twice at most, at least 6 seconds apart, as its terms ask
  const results = await Promise.all([attempt("regional news outlets", feeds, 1, 0), attempt("GDELT Project", gdelt, 2, 6000)]);
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
module.exports = { build, fromGdelt, fromFeed, FEEDS, QUERY };
