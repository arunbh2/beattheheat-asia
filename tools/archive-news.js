// Keeps every headline and paper that has ever appeared on /news/, so the sources page can list them
// after they roll off the live feed (which keeps two weeks of news and four months of research).
//     node tools/archive-news.js            merge the current feeds into feeds/archive.json
//     node tools/archive-news.js --history  also recover items from earlier versions of the feeds in git
"use strict";
const fs = require("fs"), path = require("path"), { execSync } = require("child_process");
const ROOT = path.join(__dirname, ".."), OUT = path.join(ROOT, "feeds", "archive.json");
const read = f => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, f), "utf8")); } catch (e) { return null; } };
const arc = read("feeds/archive.json") || { note: "Every item that has appeared on /news/. Built by tools/archive-news.js.", news: [], research: [] };
const key = u => String(u || "").replace(/^http:/, "https:").replace(/[#?].*$/, "").replace(/\/$/, "");
const have = { news: new Set(arc.news.map(x => key(x.url))), research: new Set(arc.research.map(x => key(x.url))) };
let added = 0;
function merge(kind, items) {
  for (const it of items || []) {
    if (!it || !/^https?:\/\//.test(it.url || "") || have[kind].has(key(it.url))) continue;
    have[kind].add(key(it.url));
    arc[kind].push(kind === "news"
      ? { title: it.title, url: it.url, via: it.via || it.domain, date: it.date, place: it.place }
      : { title: it.title, url: it.url, journal: it.journal, date: it.date, firstAuthor: it.firstAuthor, preprint: !!it.preprint });
    added++;
  }
}
if (process.argv.includes("--history")) {
  for (const [f, kind] of [["feeds/news.json", "news"], ["feeds/research.json", "research"]]) {
    const revs = execSync(`git log --format=%H -- ${f}`, { cwd: ROOT }).toString().trim().split("\n").filter(Boolean);
    for (const r of revs) { try { merge(kind, JSON.parse(execSync(`git show ${r}:${f}`, { cwd: ROOT, maxBuffer: 1 << 26 })).items); } catch (e) {} }
  }
}
merge("news", (read("feeds/news.json") || {}).items);
merge("research", (read("feeds/research.json") || {}).items);
const byDate = (a, b) => String(b.date || "").localeCompare(String(a.date || ""));
arc.news.sort(byDate); arc.research.sort(byDate);
if (added) arc.updated = new Date().toISOString();
fs.writeFileSync(OUT, JSON.stringify(arc, null, 1).replace(/\u2014/g, "-") + "\n"); // plain hyphens, never em dashes
console.log(`archive: ${arc.news.length} headlines, ${arc.research.length} papers (${added} new)`);
