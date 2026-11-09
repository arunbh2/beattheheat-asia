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
// Media budget (GitHub Pages publishes every tracked file, up to 1 GB, and git keeps every version of a file for good,
// so a heavy film costs twice: in the published site and in the history no one can trim without a force-push):
// any tracked file in media/ over MEDIA.maxFileMB fails unless it is listed in MEDIA.known (and then it may not grow);
// any tracked file over 50 MB fails (GitHub warns there and refuses 100 MB); the published total warns at
// MEDIA.warnTotalMB and fails at MEDIA.failTotalMB. The limits live in data/schema/weight-budget.json under "media".
"use strict";
const fs = require("fs"), path = require("path"), zlib = require("zlib");
const ROOT = path.join(__dirname, "..");

const BUDGET_FILE = path.join(ROOT, "data", "schema", "weight-budget.json");
let BUDGET = {}, MEDIA = {}; try { const b = JSON.parse(fs.readFileSync(BUDGET_FILE, "utf8")); BUDGET = b.pages || {}; MEDIA = b.media || {}; } catch (e) {}
MEDIA = Object.assign({ maxFileMB: 8, warnTotalMB: 700, failTotalMB: 900, known: {} }, MEDIA);
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

// ---- media budget: the files GitHub Pages publishes (tracked files only; untracked renders never count)
const notes = [];
let tracked = [];
try { tracked = require("child_process").execFileSync("git", ["ls-files", "-z"], { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 }).toString("utf8").split("\0").filter(Boolean); } catch (e) { notes.push("media budget skipped: git ls-files did not run"); }
const MB = n => n / 1e6;
let totalMB = 0;
for (const rel of tracked) {
  let n = 0; try { n = fs.statSync(path.join(ROOT, rel)).size; } catch (e) { continue; }
  totalMB += MB(n);
  const mb = Math.round(MB(n) * 10) / 10;
  if (mb > 50) problems.push(`${rel}: ${mb} MB. GitHub warns over 50 MB and refuses files over 100 MB; host it elsewhere or split it.`);
  else if (rel.startsWith("media/") && mb > MEDIA.maxFileMB) {
    const known = MEDIA.known[rel];
    if (known == null) problems.push(`${rel}: ${mb} MB, over the ${MEDIA.maxFileMB} MB media budget. Re-encode it for the web (e.g. ffmpeg -c:v libx264 -crf 27 -maxrate 1.6M -bufsize 3.2M -movflags +faststart -c:a aac -b:a 128k), or, if it truly needs the size, list it under media.known in data/schema/weight-budget.json.`);
    else if (mb > known + 0.5) problems.push(`${rel}: ${mb} MB, heavier than its recorded ${known} MB (media.known). Re-encode it, or record the new size on purpose.`);
  }
}
totalMB = Math.round(totalMB);
if (tracked.length && totalMB > MEDIA.failTotalMB) problems.push(`published site: ${totalMB} MB of tracked files, over the ${MEDIA.failTotalMB} MB limit set below GitHub Pages' 1 GB. Re-encode or remove the heaviest media (node tools/check-weight.js --list shows them).`);
else if (tracked.length && totalMB > MEDIA.warnTotalMB) notes.push(`published site: ${totalMB} MB of tracked files, past the ${MEDIA.warnTotalMB} MB warning (GitHub Pages allows 1 GB). Plan the next films lighter.`);
if (process.argv.includes("--list") && tracked.length) {
  const heavy = tracked.filter(r => r.startsWith("media/")).map(r => { try { return [r, fs.statSync(path.join(ROOT, r)).size]; } catch (e) { return [r, 0]; } }).sort((a, b) => b[1] - a[1]).slice(0, 10);
  console.log(`\nPublished site: ${totalMB} MB of tracked files (warn ${MEDIA.warnTotalMB}, fail ${MEDIA.failTotalMB}). Heaviest media:`);
  heavy.forEach(([r, n]) => console.log(`${MB(n).toFixed(1).padStart(6)} MB  ${r}`));
}

if (process.argv.includes("--update")) {
  const out = { note: "Compressed KB each page fetches before scrolling, recorded by tools/check-weight.js --update. A page may grow 5% (at least 8 KB) over this.", media: MEDIA, pages: Object.fromEntries(rows.map(r => [r[0], r[1]]).sort((a, b) => a[0].localeCompare(b[0]))) };
  fs.writeFileSync(BUDGET_FILE, JSON.stringify(out, null, 2) + "\n");
  console.log(`check-weight: recorded ${rows.length} page weights in ${path.relative(ROOT, BUDGET_FILE)}.`);
  process.exit(0);
}
if (process.argv.includes("--list")) rows.sort((a, b) => b[1] - a[1]).forEach(([r, kb, b]) => console.log(`${String(kb).padStart(5)} KB  (budget ${b})  ${r}`));
if (problems.length) { console.error(problems.join("\n")); console.error(`check-weight: ${problems.length} problem(s).`); process.exit(1); }
const home = rows.find(r => r[0] === "index.html");
notes.forEach(n => console.log(`check-weight: ${n}`));
console.log(`check-weight: ${rows.length} pages within budget${home ? `; homepage ${home[1]} KB of ${home[2]} KB` : ""}; published site ${totalMB} MB of ${MEDIA.failTotalMB} MB.`);
