#!/usr/bin/env node
/* BeatTheHeat.Asia: refresh feeds/news.json with recent heat headlines from Asia.
   Source: the GDELT Project's DOC 2.0 API (open data). Run by .github/workflows/heat-news.yml every six hours;
   run by hand with `node tools/fetch-news.js`. Keeps only headlines about heat, leaves out ones framed around
   politics or conflict, and merges with the last run so the feed holds about a week. If GDELT cannot be reached,
   the file is left as it was. */
const fs = require("fs"), path = require("path");
const OUT = path.join(__dirname, "..", "feeds", "news.json");
const PLACES = ["India", "Bangladesh", "Nepal", "Sri Lanka", "Pakistan", "Cambodia", "Indonesia", "Philippines", "Singapore", "Thailand", "Vietnam", "Malaysia", "Myanmar", "Laos"];
// a city in a headline names its country
const CITIES = { Delhi: "India", Mumbai: "India", Ahmedabad: "India", Kolkata: "India", Chennai: "India", Hyderabad: "India", Dhaka: "Bangladesh", Kathmandu: "Nepal",
  Colombo: "Sri Lanka", Karachi: "Pakistan", Lahore: "Pakistan", "Phnom Penh": "Cambodia", Jakarta: "Indonesia", Manila: "Philippines", Bangkok: "Thailand",
  Hanoi: "Vietnam", "Ho Chi Minh City": "Vietnam", "Kuala Lumpur": "Malaysia", Yangon: "Myanmar" };
const placeOf = t => PLACES.find(p => new RegExp(`\\b${p}\\b`, "i").test(t)) || CITIES[Object.keys(CITIES).find(c => new RegExp(`\\b${c}\\b`, "i").test(t))] || "";
const QUERY = `(heatwave OR "heat wave" OR "extreme heat" OR "heat stress" OR heatstroke OR "heat index") (${PLACES.map(p => p.includes(" ") ? `"${p}"` : p).join(" OR ")}) sourcelang:english`;
const HEAT = /heat ?waves?|extreme heat|heat ?stroke|heat stress|heat index|heat illness|heat-related|scorching|sweltering|searing heat|hot weather|high temperatures?|record temperatures?/i;
// the site builds awareness and solutions; headlines framed around politics or conflict are left out
const AVOID = /\b(election|elections|campaign|slams?|slammed|blames?|blamed|opposition|protests?|riots?|war|terror\w*|scandal|corrupt\w*|attacks?)\b/i;
const KEEP_DAYS = 7, MAX = 40;

const iso = s => { const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(s || ""); return m ? `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z` : null; };
const key = t => t.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().slice(0, 70);

function build(articles, prev, now = Date.now()) {
  const fresh = (articles || []).map(a => ({
    title: String(a.title || "").replace(/\s+/g, " ").trim(),
    url: a.url, domain: a.domain || "", date: iso(a.seendate),
    place: placeOf(a.title || "")
  })).filter(x => x.title && /^https?:\/\//.test(x.url || "") && x.date && HEAT.test(x.title) && !AVOID.test(x.title));
  const seen = new Set(), out = [];
  [...fresh, ...((prev && prev.items) || [])].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).forEach(x => {
    const k = key(x.title);
    if (seen.has(k) || seen.has(x.url) || now - Date.parse(x.date) > KEEP_DAYS * 86400000) return;
    seen.add(k); seen.add(x.url); out.push(x);
  });
  return { updated: new Date(now).toISOString(), source: "GDELT Project DOC 2.0 API", query: QUERY, items: out.slice(0, MAX) };
}

async function main() {
  const url = "https://api.gdeltproject.org/api/v2/doc/doc?" + new URLSearchParams({ query: QUERY, mode: "ArtList", maxrecords: "150", timespan: "4d", format: "json", sort: "DateDesc" });
  let prev = null; try { prev = JSON.parse(fs.readFileSync(OUT, "utf8")); } catch (e) {}
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const r = await fetch(url, { headers: { "user-agent": "BeatTheHeat.Asia news feed (+https://beattheheat.asia/)" } });
      const text = await r.text(); if (!r.ok) throw new Error(`HTTP ${r.status}: ${text.slice(0, 120)}`);
      const j = JSON.parse(text), next = build(j.articles, prev);
      fs.mkdirSync(path.dirname(OUT), { recursive: true }); fs.writeFileSync(OUT, JSON.stringify(next, null, 1) + "\n");
      console.log(`Wrote ${next.items.length} headlines (${(j.articles || []).length} found)`); return;
    } catch (e) { console.error(`Attempt ${attempt}: ${e.message}`); await new Promise(res => setTimeout(res, 6000 * attempt)); }
  }
  console.error("GDELT could not be reached; feeds/news.json left as it was.");
}

if (require.main === module) main();
module.exports = { build, QUERY };
