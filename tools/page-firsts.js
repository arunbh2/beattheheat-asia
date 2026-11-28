// Common Shade: when each menu page first appeared, and which are new since the latest State of the field edition.
// The menu marks those pages "New", so the markers change with each edition and never with the clock alone.
// First dates live in data/site/page-firsts.json: a page already listed keeps its date; a page new to the menu takes the
// date its index.html was first committed (git), or today when it is not yet committed. Nothing is typed by hand.
//   require("./page-firsts.js") -> { firsts, fresh, since, edition, isNew }
"use strict";
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "data", "site", "page-firsts.json");
const NAV = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "site", "nav.json"), "utf8"));
const SOF = require("./sof-model.js");
const TODAY = new Date().toISOString().slice(0, 10);

const urls = () => { const s = new Set(); for (const g of NAV.groups) { s.add(g.lead[0]); for (const i of g.items) s.add(i[0]); } return [...s].filter(u => u.endsWith("/") && !u.includes("#")); };
function gitFirst(u) {
  const file = path.join(ROOT, u, "index.html");
  try { const out = execFileSync("git", ["log", "--diff-filter=A", "--format=%as", "--", path.relative(ROOT, file)], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim().split("\n").filter(Boolean); return out.pop() || null; }
  catch (e) { return null; }
}
function load(write) {
  const rec = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, "utf8")) : { about: "", first: {} };
  let changed = false;
  for (const u of urls()) if (!rec.first[u]) { rec.first[u] = gitFirst(u) || TODAY; changed = true; }
  rec.about = "When each page in the menu first appeared: the date its page was first committed, recorded once and kept. Written by tools/page-firsts.js; do not edit by hand.";
  if (changed && write) { rec.first = Object.fromEntries(Object.entries(rec.first).sort(([a], [b]) => a.localeCompare(b))); fs.writeFileSync(FILE, JSON.stringify(rec, null, 1) + "\n"); }
  return rec.first;
}
const firsts = load(!process.env.CS_NO_WRITE);
const edition = SOF.latest();
const since = edition ? edition.cutoff : null;   // after the evidence cut-off: pages the latest edition could not have covered
const fresh = new Set(since ? urls().filter(u => firsts[u] && firsts[u] > since) : []);
const isNew = u => fresh.has(u);
const editionName = edition ? `the ${SOF.label(edition)} edition` : "";
module.exports = { firsts, fresh, since, edition, editionName, isNew, urls };
