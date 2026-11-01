#!/usr/bin/env node
// Checks a list of source links against the real web and finds (or asks for) an archived copy of each.
// Runs on GitHub (.github/workflows/verify-urls.yml), where outside sites can be reached.
//   node tools/verify-urls.js research/2026-10/riskfin/urls.txt research/2026-10/riskfin/link-status.json
// Writes { url: { status: OK|REDIRECT|BLOCKED|FAIL, code, archive } }. Pages that refuse robots (BLOCKED) may still
// work in a browser; the archived copy lets a reader check them. Links that FAIL are left off the site.
"use strict";
const fs = require("fs");
const [list, out] = process.argv.slice(2);
if (!list || !out) { console.error("usage: node tools/verify-urls.js <urls.txt> <out.json>"); process.exit(2); }
const urls = [...new Set(fs.readFileSync(list, "utf8").split(/\r?\n/).map(s => s.trim()).filter(s => /^https?:\/\//.test(s)))];
const NO_ARCHIVE = process.env.NO_ARCHIVE === "1";   // a quick status-only pass, e.g. before going live
const prev = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, "utf8")) : {};
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";
async function get(u, ms, method = "GET") {
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), ms);
  try { const r = await fetch(u, { method, redirect: "follow", signal: ctl.signal, headers: { "User-Agent": UA, "Accept": "text/html,application/pdf,*/*" } });
    let body = ""; if (method === "GET" && /json/.test(r.headers.get("content-type") || "")) body = await r.text(); else { try { await r.body?.cancel(); } catch (e) {} }
    return { ok: r.ok, status: r.status, url: r.url, body, headers: r.headers };
  } catch (e) { return { ok: false, status: e.name === "AbortError" ? "timeout" : (e.cause && e.cause.code) || e.message, url: u, body: "" }; } finally { clearTimeout(t); }
}
async function archiveOf(u) {
  const a = await get("https://archive.org/wayback/available?url=" + encodeURIComponent(u), 30000);
  try { const s = JSON.parse(a.body).archived_snapshots.closest; if (s && s.available && s.url) return s.url.replace(/^http:/, "https:"); } catch (e) {}
  const save = await get("https://web.archive.org/save/" + u, 90000);
  const loc = save.headers && (save.headers.get("content-location") || "");
  if (loc && loc.startsWith("/web/")) return "https://web.archive.org" + loc;
  if (/^https:\/\/web\.archive\.org\/web\/\d+/.test(save.url || "")) return save.url;
  return "";
}
async function check(u) {
  let r = await get(u, 25000, "HEAD");
  if (!r.ok) r = await get(u, 30000, "GET");
  const status = r.ok ? (new URL(r.url).host !== new URL(u).host ? "REDIRECT" : "OK") : [401, 403, 429, 999].includes(r.status) ? "BLOCKED" : "FAIL";
  const archive = (prev[u] && prev[u].archive) || (NO_ARCHIVE ? "" : await archiveOf(u));
  return { status, code: r.status, archive };
}
(async () => {
  const res = { ...prev }, q = urls.slice(); let n = 0;
  await Promise.all(Array.from({ length: 6 }, async () => { while (q.length) { const u = q.shift(); res[u] = await check(u); if (++n % 25 === 0) console.log(`  …${n}/${urls.length}`); } }));
  fs.writeFileSync(out, JSON.stringify(Object.fromEntries(Object.entries(res).sort()), null, 1) + "\n");
  const c = {}; Object.values(res).forEach(r => { c[r.status] = (c[r.status] || 0) + 1; c.archived = (c.archived || 0) + (r.archive ? 1 : 0); });
  console.log("SUMMARY " + JSON.stringify(c));
})();
