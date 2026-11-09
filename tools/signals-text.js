// Common Shade: what /signals/ and llms-full.txt share about Signals (data/site/signals.json): the record, its ladder and
// kinds, the date wording, and the plain-text version for AI systems. tools/build-signals.js draws the page from the same
// helpers, so the page and llms-full.txt never say different things. Checked by build-data.js --check (checkSignals).
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "data", "site", "signals.json");
const M = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const date = d => { const [y, m, dd] = String(d || "").split("-"); return dd ? `${+dd} ${M[+m - 1]} ${y}` : m ? `${M[+m - 1]} ${y}` : y || ""; };
const TITLE = "Signals";
const LEDE = "Which way heat policy and practice are moving in South and Southeast Asia: announcements, commitments, gatherings and findings, and how far each has climbed from promise to proof.";
const NOTE = "A signal is a step, not a score. The ladder records how far each signal has got, never how well an institution performs, and it says nothing about places not shown. An announcement is a weak signal on its own; each rung is stronger evidence that change is real.";
function load() {
  const D = JSON.parse(fs.readFileSync(FILE, "utf8"));
  const rung = Object.fromEntries(D.ladder.map((l, i) => [l.id, i]));
  const kind = Object.fromEntries(D.kinds.map(k => [k.id, k]));
  const byGroup = Object.fromEntries(D.groups.map(g => [g.id, D.signals.filter(s => s.group === g.id).sort((a, b) => String(b.date).localeCompare(String(a.date)))]));
  return Object.assign(D, { rung, kind, byGroup });
}
function md(SITE) {
  const D = load(), L = [`## ${TITLE}`, `${SITE}/signals/`, LEDE, NOTE,
    "The ladder: " + D.ladder.map(l => `${l.label} (${l.means})`).join("; ")];
  for (const g of D.groups) {
    L.push(`### ${g.label}`, g.intro);
    if (g.watching) L.push("Watching: " + g.watching.join(", ") + ".");
    const list = D.byGroup[g.id];
    if (!list.length) L.push("No item has passed the check yet.");
    for (const s of list) L.push([`- ${s.title} (${D.kind[s.kind].label}, ${date(s.date)}${s.stage ? `; rung: ${D.ladder[D.rung[s.stage]].label}` : ""}). ${s.summary}`,
      s.history ? ` History: ${s.history.map(h => `${D.ladder[D.rung[h.stage]].label} ${date(h.date)} (${h.note})`).join("; ")}.` : "",
      ` ${s.kind === "commitment" ? "What would move it up" : "What to watch"}: ${s.next}`,
      ` Sources: ${s.sources.map(x => `${x.label} ${x.url}`).join("; ")}`].join(""));
  }
  return L.join("\n\n");
}
module.exports = { TITLE, LEDE, NOTE, date, load, md };
