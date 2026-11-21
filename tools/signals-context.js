// Common Shade: "What is moving here", Signals records shown where a reader already is. One model, three places:
// - country and city pages: a block before </main> (between <!--sg-ctx--> markers, so a rebuild replaces it), with the
//   records tagged to that country, newest first, and the step each has evidence for; a city shows its country's records;
// - /actions/: one line under each action (lever) with its newest records.
// Nothing here is new evidence: each line restates the record's own furthest step and evidence state from
// tools/signals-model.js. An empty list reads "not tracked here yet" and describes the records, not the place.
// Called from tools/build-pages.js (pages) and tools/build-static.js (actions).
"use strict";
const fs = require("fs"), path = require("path"), SM = require("./signals-model.js"), T = require("./signals-text.js");
const ROOT = path.join(__dirname, "..");
const NAME = { lao: "Lao PDR", bangladesh: "Bangladesh", india: "India", indonesia: "Indonesia", nepal: "Nepal", philippines: "the Philippines", "sri-lanka": "Sri Lanka", thailand: "Thailand", singapore: "Singapore", cambodia: "Cambodia", "viet-nam": "Viet Nam", malaysia: "Malaysia", pakistan: "Pakistan", myanmar: "Myanmar" };
const slugOf = country => ({ vietnam: "viet-nam" }[String(country).toLowerCase().replace(/\s+/g, "-")] || String(country).toLowerCase().replace(/\s+/g, "-"));
const MAX = 4;

let _c;
function ctx() {
  if (_c) return _c;
  const D = T.load(), CHECKS = JSON.parse(fs.readFileSync(path.join(ROOT, "data/site/signals-checks.json"), "utf8")), today = new Date().toISOString().slice(0, 10);
  const rows = D.signals.map(s => ({ s, latest: SM.latest(s, today) })).sort((a, b) => SM.key(b.latest).localeCompare(SM.key(a.latest)) || a.s.id.localeCompare(b.s.id));
  return (_c = { D, CHECKS, today, rows });
}
// a record's standing in a few words: for a commitment, its furthest step with evidence and how that step is evidenced
function standing(s) {
  const { CHECKS, today } = ctx();
  if (s.kind !== "commitment") return T.kindOf(s).label;
  let best = null;
  for (const d of s.deliverables || []) { const f = SM.furthest(d, s, CHECKS, today); if (f.rung && (!best || SM.RUNGS.indexOf(f.rung) > SM.RUNGS.indexOf(best.rung))) best = f; }
  return best ? `${SM.RUNG_LABEL[best.rung]}, ${SM.STATE[best.state].short}` : "No step with evidence yet";
}
const item = (esc, r) => `<li><a href="/signals/#${esc(r.s.id)}">${esc(r.s.title)}</a> <span class="sg-ctx__m">${esc(standing(r.s))} · latest development ${esc(SM.date(r.latest))}</span></li>`;

function placeBlock(esc, slug, viaCity) {
  const { rows } = ctx(), mine = rows.filter(r => (r.s.places || []).includes(slug)), region = rows.filter(r => (r.s.places || []).includes("region")).length;
  const name = NAME[slug] || slug, q = `/signals/?place=${encodeURIComponent(slug)}`;
  const intro = mine.length ? `Developments in ${name} tracked on Signals, newest first, with the furthest step each has evidence for.${viaCity ? ` They concern the country, not only this city.` : ""}`
    : `No development in ${name} is tracked on Signals yet. This describes the records kept here, not what is happening in ${name}.`;
  return `\n  <!--sg-ctx--><section class="container hub sg-ctx" aria-labelledby="sg-ctx-h"><h2 class="hub-h" id="sg-ctx-h">What is moving here</h2><p class="hub-p">${esc(intro)}</p>
    ${mine.length ? `<ul class="sg-ctx__l">${mine.slice(0, MAX).map(r => item(esc, r)).join("")}</ul>` : ""}
    <p class="hub-p sg-ctx__more">${mine.length > MAX ? `<a href="${q}">All ${mine.length} for ${esc(name)} on Signals</a> · ` : mine.length ? `<a href="${q}">On Signals, with the evidence</a> · ` : ""}<a href="/signals/?place=region">${region} region-wide developments</a> · <a href="/signals/#moved">What moved recently</a></p></section><!--/sg-ctx-->`;
}

// country and city pages: replace the block between markers, or add it before </main>
function inject({ D, esc }) {
  const pages = fs.readdirSync(path.join(ROOT, "countries"), { withFileTypes: true }).filter(e => e.isDirectory()).map(e => [`countries/${e.name}`, e.name, false])
    .concat((D.LIVE_CITIES || []).map(c => [`cities/${c.id}`, slugOf(c.country), true]));
  let n = 0;
  for (const [slug, place, viaCity] of pages) {
    const f = path.join(ROOT, slug, "index.html"); if (!fs.existsSync(f)) continue;
    let s = fs.readFileSync(f, "utf8").replace(/\n?\s*<!--sg-ctx-->[\s\S]*?<!--\/sg-ctx-->/, "");
    const at = s.lastIndexOf("</main>"); if (at < 0) continue;
    fs.writeFileSync(f, s.slice(0, at).replace(/\s*$/, "") + placeBlock(esc, place, viaCity) + "\n  " + s.slice(at)); n++;
  }
  return n;
}

// one line for an action on /actions/
function leverLine(esc, lever) {
  const mine = ctx().rows.filter(r => (r.s.levers || []).includes(lever));
  if (!mine.length) return "";
  return `<p class="meta sg-ctx__lever"><span class="sg-ctx__k">Moving now</span> ${mine.slice(0, 2).map(r => `<a href="/signals/#${esc(r.s.id)}">${esc(r.s.title)}</a> <span>(${esc(standing(r.s))}, ${esc(SM.date(r.latest))})</span>`).join("; ")}${mine.length > 2 ? ` · <a href="/signals/?lever=${esc(lever)}">All ${mine.length} on Signals</a>` : ""}</p>`;
}

module.exports = { inject, leverLine, placeBlock, standing, NAME };
