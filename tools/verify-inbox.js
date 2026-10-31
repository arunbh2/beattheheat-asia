#!/usr/bin/env node
// Verifies a month of incoming research against the real web. Runs on GitHub (.github/workflows/verify-sources.yml),
// where outside sites can be reached. For every source record in data/inbox/YYYY-MM/:
//   1. opens the link: OK, REDIRECT, BLOCKED (the site refuses robots but may work in a browser) or FAIL;
//   2. finds an archived copy on the Internet Archive, or asks it to save one, and writes it into the record;
//   3. looks for each of the record's expected terms on the page (or, if the page is blocked, on the archived copy);
//   4. saves short excerpts of the real text around each term to _excerpts.json, so the reviewer writes from what
//      the page says, not from memory.
// Results go to link-check.json ({ url: status, _terms: { url: { term: true|false } } }), which gate 2 reads.
// Usage: node tools/verify-inbox.js 2026-11
"use strict";
const fs = require("fs"), path = require("path");
const month = process.argv[2];
if (!/^\d{4}-\d{2}$/.test(month || "")) { console.error("usage: node tools/verify-inbox.js YYYY-MM"); process.exit(2); }
const DIR = path.join(__dirname, "..", "data", "inbox", month);
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";
const files = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter(f => f.endsWith(".json") && !f.startsWith("_") && f !== "link-check.json") : [];
if (!files.length) { console.error(`no records in data/inbox/${month}`); process.exit(2); }

async function get(u, ms = 30000) {
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), ms);
  try { const r = await fetch(u, { redirect: "follow", signal: ctl.signal, headers: { "User-Agent": UA, "Accept": "text/html,application/pdf,*/*" } });
    const body = r.ok ? await r.text() : ""; return { ok: r.ok, status: r.status, url: r.url, body, headers: r.headers };
  } catch (e) { return { ok: false, status: e.name === "AbortError" ? "timeout" : (e.cause && e.cause.code) || e.message, url: u, body: "" }; } finally { clearTimeout(t); }
}
const text = html => html.replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;|&#160;/g, " ")
  .replace(/&amp;/g, "&").replace(/&#8217;|&rsquo;|&#x2019;/g, "’").replace(/&#8216;|&lsquo;/g, "‘").replace(/&quot;|&#8220;|&#8221;|&ldquo;|&rdquo;/g, '"').replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim();
const norm = s => s.toLowerCase().replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, " ");
async function archiveOf(u) {
  const a = await get("https://archive.org/wayback/available?url=" + encodeURIComponent(u), 30000);
  try { const s = JSON.parse(a.body).archived_snapshots.closest; if (s && s.available && s.url) return s.url.replace(/^http:/, "https:"); } catch (e) {}
  const save = await get("https://web.archive.org/save/" + u, 120000);   // asks the archive to capture the page now
  const loc = save.headers && (save.headers.get("content-location") || "");
  if (loc && loc.startsWith("/web/")) return "https://web.archive.org" + loc;
  if (/^https:\/\/web\.archive\.org\/web\/\d+/.test(save.url || "")) return save.url;
  return "";
}

(async () => {
  const lf = path.join(DIR, "link-check.json"), links = fs.existsSync(lf) ? JSON.parse(fs.readFileSync(lf, "utf8")) : {};
  links._terms = links._terms || {};
  const excerpts = {};
  for (const f of files) {
    const fp = path.join(DIR, f), raw = JSON.parse(fs.readFileSync(fp, "utf8")), list = Array.isArray(raw) ? raw : [raw];
    let changed = false;
    for (const r of list.filter(x => x.type === "source" && x.url)) {
      const page = await get(r.url);
      const status = page.ok ? (new URL(page.url).host !== new URL(r.url).host ? "REDIRECT" : "OK") : [401, 403, 429, 999].includes(page.status) ? "BLOCKED" : "FAIL";
      links[r.url] = status;
      if (!r.archive) { const a = await archiveOf(r.url); if (a) { r.archive = a; changed = true; } }
      let body = page.ok ? text(page.body) : "";
      if (!body && r.archive) { const ar = await get(r.archive, 60000); if (ar.ok) body = text(ar.body); }
      const nb = norm(body), found = {};
      (r.expect || []).forEach(t => { found[t] = nb.includes(norm(t)); });
      links._terms[r.url] = found;
      const title = (page.body.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [, ""])[1].replace(/\s+/g, " ").trim();
      excerpts[r.id] = { url: r.url, status, http: page.status, archive: r.archive || "", title, found,
        around: (r.expect || []).filter(t => found[t]).map(t => { const i = nb.indexOf(norm(t)); return body.slice(Math.max(0, i - 400), i + 500); }),
        opening: body.slice(0, 1500) };
      console.log(`${status.padEnd(8)} ${r.id}  archive: ${r.archive ? "yes" : "NO"}  terms: ${Object.entries(found).map(([t, v]) => (v ? "✓ " : "✗ ") + t).join(" · ")}`);
    }
    if (changed) fs.writeFileSync(fp, JSON.stringify(Array.isArray(raw) ? list : list[0], null, 1) + "\n");
  }
  fs.writeFileSync(lf, JSON.stringify(links, null, 1) + "\n");
  fs.writeFileSync(path.join(DIR, "_excerpts.json"), JSON.stringify(excerpts, null, 1) + "\n");
  console.log(`wrote data/inbox/${month}/link-check.json and _excerpts.json`);
})();
