#!/usr/bin/env node
// Common Shade: checks How heat is reported (tools/media-model.js, tools/build-media.js, how-heat-is-reported/media.js).
//   node tools/check-media.js
// The model: stable ids, one record per unique URL, publication records and unique records counted apart, legacy ids that
// point to the same story, nothing coded for a record read only at listing depth. The editorial layer: every comparison
// cell quotes its record's reviewed field exactly, examples are reviewed records, the question kit's links resolve. The
// built page: the figures in the text match the records, every record has an anchor and its collection and review depth,
// every national-language title carries its translation status, no score is shown, internal links resolve, and the
// downloads hold every unique record once.
"use strict";
const fs = require("fs"), path = require("path"), M = require("./media-model.js");
const ROOT = M.ROOT, fails = [], ok = (c, m) => { if (!c) fails.push(m); };
const { records: R, collection: C, pilot: P } = M.records(), S = M.stats(), ED = M.ED;
const read = f => fs.existsSync(path.join(ROOT, f)) ? fs.readFileSync(path.join(ROOT, f), "utf8") : "";

// ---- the model ----
ok(C.every(c => /^b\d{2}$/.test(c.id || "")), "every collection row has an ID like b07 (research/2026-10/media/extreme-heat-journalism-2018-2026.csv)");
ok(new Set(C.map(c => c.id)).size === C.length, "collection IDs are unique");
ok(new Set(R.map(r => r.id)).size === R.length, "record ids are unique");
ok(new Set(R.map(r => M.normUrl(r.url))).size === R.length, "one record per unique URL");
ok(S.unique === S.memberships - S.both, `unique records (${S.unique}) = publication records (${S.memberships}) - stories in both (${S.both})`);
for (const p of P) if (p.notes && p.notes.legacy_id && /^b\d{2}$/.test(p.notes.legacy_id)) {
  const c = C.find(x => x.id === p.notes.legacy_id); ok(c && M.normUrl(c.url) === M.normUrl(p.url), `pilot ${p.id}: legacy id ${p.notes.legacy_id} is the same story in the collection (same URL)`); }
for (const r of R) {
  if (r.depth !== "full") { ok(r.trail === null && r.organised === null && r.followup === null && r.voice === null && Object.values(r.pops).every(v => v === null) && !r.loops.length, `${r.id}: read at listing depth, so nothing is coded for it`);
    ok(r.format === null || r.format_basis === "the collection's link type", `${r.id}: a format is recorded only from the collection's link type`); }
  else ok(r.trail && r.trail.every(t => ED.trail_states[t.state] && t.text), `${r.id}: its reporting trail uses the four states and says what it found`);
  if (r.language !== "en") ok(["researcher", "not-recorded"].includes(r.translation), `${r.id}: a national-language title has a translation status`);
  ok(r.precision === "day" ? /^\d{4}-\d{2}-\d{2}$/.test(r.date) : /^\d{4}$/.test(String(r.date)), `${r.id}: the date matches its precision`);
}
// ---- the editorial layer ----
const BY = Object.fromEntries(R.map(r => [r.id, r])), PJ = Object.fromEntries(P.map(p => [p.id, p]));
const field = (id, f) => { const p = PJ[id]; if (!p) return ""; if (f.startsWith("notes.")) return (p.notes || {})[f.slice(6)] || ""; if (f.startsWith("exemplar.")) return (p.exemplar || {})[f.slice(9)] || ""; return p[f] || ""; };
for (const c of ED.comparisons) { ok(c.records.every(id => BY[id] && BY[id].depth === "full"), `comparison ${c.id}: compares records read in full`);
  for (const row of c.rows) for (const id of c.records) { const cell = row.cells[id];
    ok(cell && ED.trail_states[cell.state], `comparison ${c.id}, "${row.label}", ${id}: a cell with a state`);
    if (cell) ok(field(id, cell.field).includes(cell.quote), `comparison ${c.id}, "${row.label}", ${id}: "${cell.quote}" is not in its record's ${cell.field}`); } }
for (const e of ED.examples) ok(BY[e.id] && BY[e.id].depth === "full" && e.followup && e.h, `example ${e.id}: a reviewed record with a heading and a suggested follow-up`);
const exists = u => { const [p, a] = u.split("#"), f = path.join(ROOT, p.replace(/^\//, ""), p.endsWith("/") ? "index.html" : ""); if (!fs.existsSync(f)) return false; return !a || fs.readFileSync(f, "utf8").includes(`id="${a}"`); };
for (const t of ED.kit.topics) { ok(t.q.includes("{place}") && t.q.includes("{pop}") && t.seek.length && t.voices.length && t.verify.length && t.loops.length, `kit topic ${t.id}: question template with {place} and {pop}, records, perspectives, checks and cycles`);
  t.links.forEach(([u]) => ok(exists(u), `kit topic ${t.id}: link ${u} resolves`)); new RegExp(t.angle, "i"); }
ok(M.kit("income", "India", "women").records.length >= 1, "kit: income, India, women and carers finds the two insurance stories");
// ---- the built page ----
const html = read("how-heat-is-reported/index.html"), text = html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ");
ok(html, "how-heat-is-reported/index.html is built (node tools/build-static.js)");
for (const r of R) { ok(html.includes(`id="rec-${r.id}"`), `page: record ${r.id} has an anchor`); }
ok((html.match(/class="hr-rec"/g) || []).length === S.unique, "page: every unique record is listed once");
for (const [n, t] of [[`${S.unique} unique records from ${S.memberships} publication records`, "the explorer's denominator"], [`${S.pOrganised} of ${S.pilot}`, "pilot organisation count"], [`${S.byYear[2024]} of ${S.collection}`, "2024 share"], [`${S.pNonEn} of ${S.pilot}`, "non-English count"]])
  ok(text.includes(n), `page: states ${t} as "${n}", from the records`);
ok(!/missing_middle|solutions_depth|\bscore\b/i.test(text), "page: shows no score");
ok((html.match(/class="hr-tr"/g) || []).length >= S.pNonEn, "page: every national-language title shows its translation status");
ok((html.match(/dir="auto"/g) || []).length >= S.unique, "page: titles carry dir=\"auto\" for right-to-left scripts");
ok(/<script src="\/how-heat-is-reported\/media\.js\?v=\d+" defer><\/script>/.test(html), "page: loads its script, deferred");
ok(/class="hr-limit"/.test(html) && (html.match(/class="hr-fig"/g) || []).length === (html.match(/hr-fig[\s\S]*?hr-limit/g) || []).length, "page: every chart carries its limits beside it");
const main = (html.match(/<main[\s\S]*<\/main>/) || [""])[0];
for (const [, u] of main.matchAll(/href="(\/[^"?]*)(?:\?[^"]*)?"/g)) { if (u.startsWith("/how-heat-is-reported/") && /\.(csv|json)$/.test(u)) { ok(fs.existsSync(path.join(ROOT, u)), `page: download ${u} exists`); continue; } ok(exists(u), `page: link ${u} resolves`); }
const FKEYS = ["q", "place", "language", "collection", "year", "format", "depth", "loop", "pop", "has", "cmp", "kit"];
for (const [, q] of main.matchAll(/href="\?([^"#]*)/g)) q.replace(/&amp;/g, "&").split("&").forEach(kv => ok(FKEYS.includes(kv.split("=")[0]), `page: a link uses the unknown filter key "${kv.split("=")[0]}" (keys: ${FKEYS.join(", ")})`));
for (const [, a] of main.matchAll(/href="#([^"]+)"/g)) ok(html.includes(`id="${a}"`), `page: in-page link #${a} resolves`);
// ---- downloads ----
const csv = read("how-heat-is-reported/records.csv").trim().split("\n"); ok(csv.length - 1 === S.unique, `records.csv holds ${S.unique} records (${csv.length - 1} found)`);
const J = JSON.parse(read("how-heat-is-reported/records.json") || "{}"); ok(J.records && J.records.length === S.unique, "records.json holds every unique record");
ok(read("how-heat-is-reported/extreme-heat-journalism-2018-2026.csv") === read("research/2026-10/media/extreme-heat-journalism-2018-2026.csv"), "the collection CSV download matches its source");
ok(read("llms.txt").includes(`how ${S.unique} news articles`), "llms.txt states the record count from the records");
// ---- old anchors: links made to the page before the November 2026 rebuild still land ----
const OLD_ANCHORS = ["dots", "bibliography", "languages", "collection", "patterns", "middle", "systems", "pilot-list", "questions", "layers"];
for (const a of OLD_ANCHORS) ok(html.includes(`id="${a}"`), `page: the old anchor #${a} still lands (links made before the rebuild use it)`);
// ---- the gaps, made visible ----
const WD = read("research/2026-10/media/pilot/working-definitions-as-applied.md");
ok(/^# Working definitions, as applied in the pilot records/.test(WD) && /original codebook was not available/.test(WD), "working-definitions-as-applied.md is built and says it is not the original codebook");
for (const f of ["missing_middle", "followup", "voice_of_affected", "informal_work", "gender_or_care", "loop_ids", "format"]) ok(WD.includes("(`" + f + "`)"), `working definitions: a section for ${f}, a code shown on the page`);
for (const p of P) for (const e of (p.notes.evidence || [])) if (/[A-Z][a-z]+, [A-Z][a-z]+/.test(e.location || "")) ok(!WD.includes(e.location), `working definitions: passage location of ${p.id} left out (it can name people)`);
ok(/proposed, not scheduled/i.test(read("research/2026-10/media/pilot/second-coding-protocol.md")), "second-coding-protocol.md exists and says it is proposed, not scheduled");
const TR = read("research/2026-11/media-rebuild/translation-review.csv").trim().split("\n"); ok(TR.length - 1 === S.pTranslated, `translation-review.csv lists the ${S.pTranslated} translated headlines`);
ok(!/native-language review pending/.test(html) && (html.match(/Working translation, not yet reviewed by a speaker of /g) || []).length >= S.pTranslated, "page: translated titles say they are not yet reviewed by a speaker of the language");
const LS = read("research/2026-11/media-rebuild/link-status.json");
if (LS) { const L = JSON.parse(LS); ok(R.every(r => L[r.url]), "link check: every record's URL has a result"); ok(/id="links-checked">Links last checked automatically on /.test(html) && !/\bverified\b/i.test((html.match(/id="links-checked">[^<]*/) || [""])[0]), "page: states when links were last checked, as opened, never verified"); }
ok(csv.slice(1).filter(l => /Not assessed/.test(l)).length >= S.unique - S.pilot, "records.csv says \"Not assessed\" for records read at listing depth, rather than leaving blanks");
ok(/drafted with AI assistance and reviewed by the site’s maintainer: suggestions, not findings/.test(html), "page: the question kit says it was drafted with AI and reviewed, as suggestions");
ok(/Helps code news articles/.test(read("tools/ai-use-text.js")), "How AI is used covers the AI-assisted coding of the pilot");
if (fails.length) { console.log(fails.map(f => "  FAIL " + f).join("\n")); process.exit(1); }
console.log(`how heat is reported check passed: ${S.unique} unique records (${S.collection} + ${S.pilot}, ${S.both} in both), comparisons quote their records, kit links resolve, page figures match, downloads complete`);
