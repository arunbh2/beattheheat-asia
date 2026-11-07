// Common Shade: look up publication dates for sources whose records carry none (or only a year), on GitHub.
// Reads research/growth/undated.txt (written by tools/growth-dates.js) and writes research/growth/fetched-dates.json:
// { url: { date, how } }, with how one of
//   crossref  the "issued" date Crossref holds for the link's DOI
//   meta      a publication date in the page's own metadata (citation_publication_date, article:published_time,
//             DC.date.issued, datePublished in JSON-LD)
//   online    the earliest Wayback Machine copy: "online by", never shown as a publication date
// A link with nothing found is recorded as null, so a later run skips it. Resumes from the saved file; stops itself
// before the job's time limit and saves what it has. Run by .github/workflows/date-sources.yml.
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), OUT = path.join(ROOT, "research/growth/fetched-dates.json");
const urls = fs.readFileSync(path.join(ROOT, "research/growth/undated.txt"), "utf8").split("\n").map(s => s.trim()).filter(Boolean);
const done = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
const START = Date.now(), LIMIT = 40 * 60 * 1000, UA = "CommonShadeDateCheck/1.0 (+https://beattheheat.asia/approach/)";
const NOW_Y = new Date().getUTCFullYear();
const clean = d => { const m = String(d || "").match(/((?:19|20)\d{2})(?:-(\d{1,2}))?(?:-(\d{1,2}))?/); if (!m || +m[1] > NOW_Y) return null;
  return [m[1], m[2] && m[2].padStart(2, "0"), m[3] && m[3].padStart(2, "0")].filter(Boolean).join("-"); };

async function get(url, ms = 15000, bytes = 400000) {
  const c = new AbortController(), t = setTimeout(() => c.abort(), ms);
  try { const r = await fetch(url, { headers: { "user-agent": UA, accept: "text/html,application/json;q=0.9,*/*;q=0.5" }, redirect: "follow", signal: c.signal });
    if (!r.ok) return null; const ct = r.headers.get("content-type") || "";
    if (/pdf|octet-stream|zip|image|video/.test(ct)) return { ct, text: "" };
    const reader = r.body.getReader(); let got = 0, chunks = [];
    while (got < bytes) { const { done: d, value } = await reader.read(); if (d) break; chunks.push(value); got += value.length; }
    try { reader.cancel(); } catch (e) {}
    return { ct, text: Buffer.concat(chunks).toString("utf8") };
  } catch (e) { return null; } finally { clearTimeout(t); }
}
async function crossref(url) {
  const doi = (decodeURIComponent(url).match(/\b(10\.\d{4,9}\/[^\s?#"]+)/) || [])[1]; if (!doi) return null;
  const r = await get(`https://api.crossref.org/works/${encodeURIComponent(doi.replace(/[.)]+$/, ""))}`, 20000, 2000000);
  try { const p = JSON.parse(r.text).message; const dp = (p.issued || p["published-print"] || p["published-online"] || {})["date-parts"];
    const d = dp && dp[0] && dp[0][0] ? dp[0].join("-") : null; return clean(d); } catch (e) { return null; }
}
function meta(html) {
  const pats = [/<meta[^>]+(?:name|property)=["'](?:citation_publication_date|citation_date|citation_online_date|article:published_time|og:published_time|DC\.date\.issued|dc\.date|DC\.Date|dcterms\.issued|publish_date|pubdate|date)["'][^>]*content=["']([^"']+)/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]*(?:name|property)=["'](?:citation_publication_date|article:published_time|DC\.date\.issued|dcterms\.issued)["']/i,
    /"datePublished"\s*:\s*"([^"]+)"/i, /<time[^>]+datetime=["']([^"']+)["'][^>]*(?:pubdate|itemprop=["']datePublished)/i];
  for (const re of pats) { const m = html.match(re); const d = m && clean(m[1]); if (d) return d; } return null;
}
async function wayback(url) {
  const r = await get(`https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(url)}&output=json&limit=1&fl=timestamp&filter=statuscode:200`, 20000);
  try { const j = JSON.parse(r.text); const ts = j[1] && j[1][0]; return ts ? `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}` : null; } catch (e) { return null; }
}
async function one(url) {
  let d = await crossref(url); if (d) return { date: d, how: "crossref" };
  const p = await get(url); if (p && p.text) { d = meta(p.text); if (d) return { date: d, how: "meta" }; }
  d = await wayback(url); if (d) return { date: d, how: "online" };
  return null;
}
(async () => {
  const todo = urls.filter(u => !(u in done)); let n = 0;
  console.log(`fetch-dates: ${urls.length} links, ${todo.length} still to look up`);
  const save = () => fs.writeFileSync(OUT, JSON.stringify(done, Object.keys(done).sort(), 1) + "\n");
  const worker = async () => { while (todo.length && Date.now() - START < LIMIT) { const u = todo.shift(); done[u] = await one(u); if (++n % 50 === 0) { save(); console.log(`  ${n} looked up`); } } };
  await Promise.all(Array.from({ length: 8 }, worker)); save();
  const v = Object.values(done), by = {}; v.forEach(x => { const k = x ? x.how : "none"; by[k] = (by[k] || 0) + 1; });
  console.log(`fetch-dates: saved ${v.length}`, by, todo.length ? `(${todo.length} left for the next run)` : "");
})();
