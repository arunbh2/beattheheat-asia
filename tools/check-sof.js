#!/usr/bin/env node
// Common Shade: checks State of the field (tools/sof-model.js, tools/build-sof.js, tools/sof-text.js).
//   node tools/check-sof.js
// Real editions: every published edition and draft follows the edition rules (dates kept apart, a reason for anything
// outside the reporting period, each claim with its source and what it establishes, "not found" with what was searched,
// sources not content-checked marked as such, no step further than Signals shows); a published edition matches the hash
// sealed in data/site/briefs/_ledger.json at its latest revision; each correction is on /corrections/; drafts are absent
// from every tracked page and file and excluded from the served site; the built pages carry the dates, the correction
// and every section; the downloadable briefing is the same text as tools/sof-text.js gives; internal links and anchors
// resolve; the archive, the sitemap and the returning-reader notice name only published editions.
// Fixtures (never published): the same rules refuse an out-of-period item with no reason, a "not found" claim without its
// search, a link-only source not marked unverified, a step further than the Signals record, a silent edit, and a side-by-side row that breaks its rules.
"use strict";
const fs = require("fs"), path = require("path"), M = require("./sof-model.js"), T = require("./sof-text.js");
const ROOT = M.ROOT, SITE = "https://beattheheat.asia", fails = [], ok = (c, m) => { if (!c) fails.push(m); };
const read = f => fs.existsSync(path.join(ROOT, f)) ? fs.readFileSync(path.join(ROOT, f), "utf8") : "";
const all = M.load({ drafts: true }), pub = all.filter(e => e.status === "published"), drafts = all.filter(e => e.status === "draft");
ok(pub.length, "at least one published edition in data/site/briefs/");

// ---- the rules, on every edition ----
for (const e of all) M.validate(e).forEach(b => fails.push(b));
for (const e of drafts) ok(e._file.startsWith(M.DRAFTS), `${e.id}: a draft lives in data/site/briefs/drafts/`);
for (const e of pub) ok(!e._file.startsWith(M.DRAFTS), `${e.id}: a published edition lives in data/site/briefs/, not drafts/`);

// ---- preserved at publication: the ledger ----
const L = M.ledger();
for (const e of pub) {
  const rows = L[e.id] || [], last = rows[rows.length - 1], rev = M.revised(e) || e.published;
  ok(last, `${e.id}: no entry in data/site/briefs/_ledger.json (node tools/sof-review.js seal ${e.id})`);
  if (last) { ok(last.hash === M.hash(e), `${e.id}: the edition has changed since it was sealed on ${last.date}. Add a dated entry to "revisions" saying what changed (a correction also goes on /corrections/), then node tools/sof-review.js seal ${e.id}`);
    ok(last.date === rev, `${e.id}: the latest revision (${rev}) is not the one sealed (${last.date}); run node tools/sof-review.js seal ${e.id}`);
    const nrev = (e.revisions || []).filter(r => r.kind !== "published").length;
    ok(last.revisions === undefined || last.revisions === nrev, `${e.id}: ${nrev} revisions, but the ledger sealed ${last.revisions}; run node tools/sof-review.js seal ${e.id}`); }
}
// ---- corrections are also on the corrections page ----
const CORR = JSON.parse(read("data/site/corrections.json")).entries, corrPage = read("corrections/index.html");
for (const e of pub) for (const c of M.corrections(e)) {
  ok(CORR.some(x => x.date === c.date && (x.where || []).some(w => w.includes(M.label(e)))), `${e.id}: correction ${c.id} has no entry in data/site/corrections.json naming "State of the field, ${M.label(e)}"`);
  ok(corrPage.includes(`State of the field, ${M.label(e)}`), `${e.id}: correction ${c.id} is not on the built /corrections/ page (rebuild)`);
}

// ---- drafts never reach the tracked site ----
let tracked = [];
try { tracked = require("child_process").execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 }).toString("utf8").split("\0").filter(Boolean); } catch (x) { fails.push("git ls-files did not run"); }
const served = tracked.filter(f => /\.(html|md|txt|xml|json)$/.test(f) && !f.startsWith("data/site/briefs/") && !f.startsWith("research/") && !f.startsWith("tools/") && !f.startsWith(".claude/") && f !== "CLAUDE.md");
for (const e of drafts) {
  const needles = [e.argument.headline, `/whats-new/${e.id}/`, ...(e.developments || []).map(d => d.h)].filter(x => x && x.length > 12);
  for (const f of served) { const s = fs.readFileSync(path.join(ROOT, f), "utf8"); for (const n of needles) if (s.includes(n)) fails.push(`draft ${e.id} appears in ${f}: "${n.slice(0, 60)}"`); }
  ok(!fs.existsSync(path.join(ROOT, "whats-new", e.id)), `draft ${e.id}: whats-new/${e.id}/ exists in the site; drafts preview in research/sof-preview/ only`);
}
ok(/exclude:\s*\n\s*-\s*data\/site\/briefs\/drafts/.test(read("_config.yml")), "_config.yml excludes data/site/briefs/drafts from the served site");
ok(/research\/sof-preview\//.test(read(".gitignore")), ".gitignore keeps research/sof-preview/ (draft previews) out of the repository");

// ---- built pages ----
const strip = s => s.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ");
const latest = pub[0], hub = read("whats-new/index.html");
ok(hub.includes(`data-edition="${latest.id}"`) && hub.includes("Latest published edition"), "/whats-new/ shows the latest published edition, labelled as such");
const ids = new Set();
for (const e of pub) {
  const f = `whats-new/${e.id}/index.html`, html = read(f), text = strip(html); ok(html, `${f} is built (node tools/build-static.js)`); if (!html) continue;
  for (const [k, v] of T.dates(e)) ok(text.includes(`${k} ${v}`), `${f}: shows "${k}: ${v}"`);
  ok(text.includes(e.argument.headline) && text.includes(e.argument.claim) && text.includes(e.argument.rests_on), `${f}: shows the argument and what it rests on`);
  for (const c of M.corrections(e)) ok(text.includes(`Corrected ${M.date(c.date)}`) && text.includes(c.gist), `${f}: shows correction ${c.id} at the top`);
  for (const d of e.developments || []) { ok(html.includes(`id="dev-${d.id}"`), `${f}: development ${d.id} has an anchor`);
    ok(text.includes(`Happened ${M.date(d.occurred.date)}`) && text.includes(`Reviewed by Common Shade ${M.date(d.reviewed)}`), `${f}: development ${d.id} shows when it happened and when it was reviewed`);
    if (!M.inPeriod(d.occurred.date, e.period)) ok(text.includes("Outside this edition's period") && text.includes(d.why_here), `${f}: development ${d.id} says it is outside the period, and why it is here`); }
  for (const k of Object.keys(e.sources)) ok(html.includes(`id="src-${k}"`), `${f}: source ${k} has an anchor`);
  if (e.opportunity && e.opportunity.roles) ok(text.includes("A proposal") && text.includes(e.opportunity.roles.note), `${f}: the opportunity's roles are labelled a proposal`);
  for (const id of ["argument", "sources", "revisions"]) ok(html.includes(`id="${id}"`), `${f}: section #${id}`);
  const md = read(`whats-new/${e.id}/briefing.md`); ok(md === T.md(e, SITE), `whats-new/${e.id}/briefing.md differs from tools/sof-text.js (rebuild)`);
  for (const [k, v] of T.dates(e)) ok(md.includes(`- ${k}: ${v}`), `briefing ${e.id}: carries "${k}: ${v}"`);
  for (const s of Object.values(e.sources)) ok(md.includes(s.url), `briefing ${e.id}: carries the source ${s.url}`);
  const sum = T.summaryText(e, SITE); ok(html.includes(sum.split("\n")[0].replace(/&/g, "&amp;")), `${f}: the copyable summary starts with the edition's dates`);
  ok(read("whats-new/index.html").includes(`href="/whats-new/${e.id}/"`), `/whats-new/ archive links ${e.id}`);
  ok(read("sitemap.xml").includes(`${SITE}/whats-new/${e.id}/`), `sitemap.xml lists /whats-new/${e.id}/`);
  // internal links and anchors in the edition
  const main = (html.match(/<main[\s\S]*<\/main>/) || [""])[0];
  for (const [, u] of main.matchAll(/href="(\/[^"]*)"/g)) {
    const [p, a] = u.split("#"), file = p.endsWith("/") ? path.join(ROOT, p, "index.html") : path.join(ROOT, p);
    if (!fs.existsSync(file)) { fails.push(`${f}: link ${u} has no page`); continue; }
    if (a) { const key = `${file}#${a}`; if (ids.has(key)) continue; const target = p === `/whats-new/${e.id}/` ? html : fs.readFileSync(file, "utf8"); ok(target.includes(`id="${a}"`), `${f}: link ${u} points to an anchor that does not exist`); ids.add(key); }
  }
}
ok(read("llms-full.txt").includes(`## ${T.TITLE}`) && read("llms-full.txt").includes(latest.argument.headline), "llms-full.txt carries the latest published edition");
const nav = read("tools/site-nav.js"); ok(/status !== "draft"/.test(nav), "the returning-reader notice reads published editions only");

// ---- fixtures: the rules refuse what they are for ----
const base = JSON.parse(JSON.stringify(pub.find(e => e.id === "2026-10") || pub[0])); delete base._file;
const refuse = (mut, re, what) => { const x = JSON.parse(JSON.stringify(base)); mut(x); ok(M.validate(x).some(b => re.test(b)), `fixture: the rules refuse ${what}`); };
// promised and lived, side by side: a valid row passes; the rules refuse a lived report outside the period, a promise
// resting on a non-record source, both sides on one source, a place Signals does not cover, and missing limits
const pairFix = x => { x.side_by_side = { rows: [{ place: "bangladesh", promised: { says: "s", source: "ncc-plan", establishes: "e" }, lived: { says: "s", source: "prothomalo", establishes: "e", date: "2026-10-10" } }], limits: ["l"] }; return x; };
ok(!M.validate(pairFix(JSON.parse(JSON.stringify(base)))).some(b => /side_by_side/.test(b)), "fixture: a valid side-by-side row passes the rules");
refuse(x => { pairFix(x).side_by_side.rows[0].lived.date = "2026-09-30"; }, /lived: dated .* within the edition's period/, "a lived report outside the period");
refuse(x => { pairFix(x).side_by_side.rows[0].promised.source = "evidence-map"; }, /promised: its source is a Signals or knowledge-base record/, "a promise not resting on a record");
refuse(x => { pairFix(x).side_by_side.rows[0].lived.source = "ncc-plan"; }, /different sources/, "both sides on one source");
refuse(x => { pairFix(x).side_by_side.rows[0].place = "atlantis"; }, /place is one Signals covers/, "a place Signals does not cover");
refuse(x => { pairFix(x).side_by_side.limits = []; }, /side_by_side: limits/, "a side-by-side table without limits");
{ const x = pairFix(JSON.parse(JSON.stringify(base))), md = T.md(x, SITE); ok(md.includes(T.PAIR.h) && md.includes(T.PAIR.note) && md.includes("### Bangladesh"), "fixture: the briefing carries the side-by-side section with its fixed note"); }
refuse(x => { delete x.developments[1].why_here; }, /outside the reporting period/, "an item outside the period with no reason");
refuse(x => { delete x.opportunity.claims[1].searched; }, /what was searched/, "a \"not found\" claim without its search");
refuse(x => { x.sources.paa.check = { kind: "link", checked: "2026-11-07", batch: "research/2026-11/go-live", status: "OK" }; }, /not content-checked|matches a record/, "a source that only opened, presented as checked");
refuse(x => { x.developments[0].claimed_step = "delivered"; }, /further than the Signals record/, "a step further than Signals shows");
refuse(x => { x.cutoff = "2026-11-30"; }, /cut-off is on or before publication/, "a cut-off after publication");
refuse(x => { x.opportunity.roles.proposal = false; }, /proposal: true/, "roles not marked as a proposal");
refuse(x => { x.developments.push(x.developments[0], x.developments[0]); }, /at most three/, "more than three developments");
{ const x = JSON.parse(JSON.stringify(base)); x.argument.claim += " Edited."; ok(M.hash(x) !== M.hash(base), "fixture: a silent edit changes the edition's hash"); }
{ const x = JSON.parse(JSON.stringify(base)); x.revisions.push({ date: "2027-01-01", kind: "revision", note: "n" }); ok(M.hash(x) === M.hash(base), "fixture: the revision log alone does not change the hash"); }
ok(require("./build-sof.js").staleNote({ period: { from: "2026-10-01", to: "2026-10-31" } }, "2027-01-02") !== "" && require("./build-sof.js").staleNote({ period: { from: "2026-10-01", to: "2026-10-31" } }, "2026-11-20") === "", "fixture: an edition reads as not this month's news once the following month has ended");

// reach and continuity: the question ledger lists every question asked; the role lens carries valid data; no published
// edition carries the editor's month on the ladder
{ const W = fs.readFileSync(path.join(ROOT, "whats-new/index.html"), "utf8"), PUB = require("./sof-model.js").published();
  PUB.filter(e => e.question).forEach(e => ok(W.includes(e.question.q.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").slice(0, 40)), `questions so far: lists the ${e.id} question`));
  const m = W.match(/<script type="application\/json" data-sof-lensdata>([\s\S]*?)<\/script>/); ok(m && (() => { try { return Object.values(JSON.parse(m[1])).every(r => r.q && r.go.length); } catch (x) { return false; } })(), "read it as: lens data parses, each role has a question and links");
  PUB.forEach(e => ok(!e.from_signals, `${e.id}: a published edition does not carry the editor's month on the ladder`)); }
if (fails.length) { console.log(fails.map(f => "  FAIL " + f).join("\n")); process.exit(1); }
console.log(`State of the field check passed: ${pub.length} published, ${drafts.length} draft; ledger, corrections, dates, sources, briefing, links and draft separation; fixtures refuse what the rules forbid`);
