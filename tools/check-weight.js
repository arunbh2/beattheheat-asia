// Speed budget: many readers open these pages on low-end phones over slow networks. For every page, adds up the
// compressed size of what the browser fetches before anyone scrolls (the page, its stylesheets and scripts, eager
// images and video posters) and fails when a page goes over its budget. Also fails on the two things that once made
// the homepage slow: a video poster that loads before its film is near, and the serif font's optical-size axis.
// Fonts from Google are not counted (they are not in the repo); the font rule keeps them small instead.
// Budgets are a ratchet, kept in data/schema/weight-budget.json: each page may grow a little (5%, at least 8 KB)
// over its recorded weight, so a page can get lighter freely but never heavier without someone deciding it.
//   node tools/check-weight.js            check every page
//   node tools/check-weight.js --list     print each page's weight and budget, heaviest first
//   node tools/check-weight.js --update   record today's weights as the budgets (after a deliberate change)
"use strict";
const fs = require("fs"), path = require("path"), zlib = require("zlib");
const ROOT = path.join(__dirname, "..");

const BUDGET_FILE = path.join(ROOT, "data", "schema", "weight-budget.json");
let BUDGET = {}; try { BUDGET = JSON.parse(fs.readFileSync(BUDGET_FILE, "utf8")).pages || {}; } catch (e) {}
const allowed = kb => Math.max(Math.round(kb * 1.05), kb + 8);
const NEW_PAGE = 160; // KB, for a page with no recorded weight yet

const pages = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".") || e.name === "node_modules" || e.name === "research" || e.name === "tools") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p); else if (e.name === "index.html") pages.push(p);
  }
})(ROOT);

const sizeCache = new Map();
function gz(file) {
  if (!sizeCache.has(file)) {
    let n = null;
    try { const b = fs.readFileSync(file); n = /\.(html|js|css|json|svg|txt)$/.test(file) ? zlib.gzipSync(b, { level: 6 }).length : b.length; } catch (e) {}
    sizeCache.set(file, n);
  }
  return sizeCache.get(file);
}
// a local URL as a file on disk, or null for other sites and data: URLs
function local(url, page) {
  if (!url || /^(https?:)?\/\/|^data:|^#|^mailto:/.test(url)) return null;
  const clean = decodeURIComponent(url.split(/[?#]/)[0]);
  return clean.startsWith("/") ? path.join(ROOT, clean) : path.join(path.dirname(page), clean);
}

const problems = [], rows = [];
for (const page of pages) {
  const rel = path.relative(ROOT, page), html = fs.readFileSync(page, "utf8");
  // what loads up front: stylesheets, scripts, images not marked lazy, and video posters
  const urls = new Set();
  for (const m of html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)) { const h = m[0].match(/href="([^"]+)"/); if (h) urls.add(h[1]); }
  for (const m of html.matchAll(/<script\b[^>]*\ssrc="([^"]+)"/g)) urls.add(m[1]);
  for (const m of html.matchAll(/<img\b[^>]*>/g)) { if (/loading="lazy"/.test(m[0])) continue; const s = m[0].match(/\ssrc="([^"]+)"/); if (s) urls.add(s[1]); }
  for (const m of html.matchAll(/<video\b[^>]*\sposter="([^"]+)"[^>]*>/g)) {
    urls.add(m[1]);
    if (rel === "index.html") problems.push(`${rel}: a video poster loads with the page (${m[1]}). Use data-poster so it loads when the film is near.`);
  }
  if (/Newsreader:[^"&]*opsz/.test(html)) problems.push(`${rel}: the Newsreader font asks for the optical-size axis, which more than doubles its download.`);
  let kb = (gz(page) || 0) / 1024;
  for (const u of urls) { const f = local(u, page); if (f) { const n = gz(f); if (n != null) kb += n / 1024; } }
  kb = Math.round(kb);
  const budget = BUDGET[rel] != null ? allowed(BUDGET[rel]) : NEW_PAGE;
  rows.push([rel, kb, budget]);
  if (kb > budget) problems.push(`${rel}: ${kb} KB before scrolling, over its ${budget} KB budget.`);
}

if (process.argv.includes("--update")) {
  const out = { note: "Compressed KB each page fetches before scrolling, recorded by tools/check-weight.js --update. A page may grow 5% (at least 8 KB) over this.", pages: Object.fromEntries(rows.map(r => [r[0], r[1]]).sort((a, b) => a[0].localeCompare(b[0]))) };
  fs.writeFileSync(BUDGET_FILE, JSON.stringify(out, null, 2) + "\n");
  console.log(`check-weight: recorded ${rows.length} page weights in ${path.relative(ROOT, BUDGET_FILE)}.`);
  process.exit(0);
}
if (process.argv.includes("--list")) rows.sort((a, b) => b[1] - a[1]).forEach(([r, kb, b]) => console.log(`${String(kb).padStart(5)} KB  (budget ${b})  ${r}`));
if (problems.length) { console.error(problems.join("\n")); console.error(`check-weight: ${problems.length} problem(s).`); process.exit(1); }
const home = rows.find(r => r[0] === "index.html");
console.log(`check-weight: ${rows.length} pages within budget${home ? `; homepage ${home[1]} KB of ${home[2]} KB` : ""}.`);
