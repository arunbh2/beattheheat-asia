#!/usr/bin/env node
// Common Shade: the editorial workflow for State of the field. Nothing here publishes on its own: an edition reaches the
// site only through a reviewed pull request, and the commands refuse what the rules do not allow.
//   node tools/sof-review.js new <YYYY-MM>              start a draft in data/site/briefs/drafts/<YYYY-MM>.json
//   node tools/sof-review.js snapshot <YYYY-MM>         fill each cited source from its record (title, url, date, type)
//                                                       and freeze what the source check holds for it on the cut-off
//                                                       (or on the date it was added, if later)
//   node tools/sof-review.js check <YYYY-MM>            validate a draft or edition (the same rules as tools/check-sof.js)
//   node tools/sof-review.js ladder <YYYY-MM>            refresh a draft's month on the ladder from Signals
//   node tools/sof-review.js publish <YYYY-MM> <date> "<approver role>"
//                                                       move a draft to data/site/briefs/, dated, and seal its hash
//   node tools/sof-review.js seal <YYYY-MM>             after a dated revision or correction to a published edition,
//                                                       record its new hash in data/site/briefs/_ledger.json
// AI may prepare drafts and snapshots; a person reviews every edition before it is published, and corrections are listed
// on /corrections/ (data/site/corrections.json) as well as in the edition.
"use strict";
const fs = require("fs"), path = require("path"), M = require("./sof-model.js");
const [cmd, id, ...rest] = process.argv.slice(2), die = m => { console.error(m); process.exit(1); };
const today = new Date().toISOString().slice(0, 10);
const fileOf = id => [path.join(M.DIR, id + ".json"), path.join(M.DRAFTS, id + ".json")].find(f => fs.existsSync(f));
const save = (f, e) => { const o = Object.assign({}, e); delete o._file; fs.writeFileSync(f, JSON.stringify(o, null, 1) + "\n"); };
const led = () => M.ledger(), saveLed = L => fs.writeFileSync(M.LEDGER, JSON.stringify(L, null, 1) + "\n");
if (cmd && cmd !== "new" && !/^\d{4}-\d{2}$/.test(id || "")) die("give the edition id, YYYY-MM");
// the month on the ladder: every Signals step dated in the edition's month, and steps scheduled in the month after, each
// with its record, for the editor to argue from. A draft aid only: publish removes it, so it never enters an edition.
function ladder(id, last) {
  const F = require("./signals-feeds.js"), ST = require("./signals-text.js"), D = ST.load();
  const [y, m] = id.split("-").map(Number), next = new Date(Date.UTC(y, m + 1, 0)).toISOString().slice(0, 10);
  const r = F.between(D, `${id}-01`, last, next, s => ST.kindOf(s).label);
  const row = (x, sched) => ({ date: x.date, step: x.what + (sched ? " (scheduled)" : ""), item: x.item, record: x.s.title, cite: `signals:${x.s.id}`, link: `/signals/#${x.anchor}` });
  return { note: "Generated from Signals by tools/sof-review.js for the editor; not part of the edition and removed at publication. Dates are when steps happened. Re-run with: node tools/sof-review.js ladder " + id, moved: r.past.map(x => row(x)), scheduled: r.ahead.map(x => row(x, true)) };
}
if (cmd === "new") {
  if (!/^\d{4}-\d{2}$/.test(id || "")) die("give the edition id, YYYY-MM");
  if (fileOf(id)) die(`${id} already exists`);
  const [y, m] = id.split("-").map(Number), last = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
  fs.mkdirSync(M.DRAFTS, { recursive: true });
  save(path.join(M.DRAFTS, id + ".json"), { schema: 2, id, status: "draft", period: { from: `${id}-01`, to: last }, cutoff: last,
    argument: { headline: "", claim: "", rests_on: "" }, opening: "", developments: [], opportunity: null, question: null, watch: [], audiences: [],
    platform: { p: "", links: [] }, sources: {}, revisions: [], from_signals: ladder(id, last) });
  console.log(`wrote data/site/briefs/drafts/${id}.json. Write from checked records only (data/kb, data/site/signals.json); cite each source by origin ("kb:<id>", "signals:<sig-id>/<source-id>" or "site:/path/#anchor"), then: node tools/sof-review.js snapshot ${id}`);
} else if (cmd === "ladder") {
  const f = fileOf(id) || die(`no edition ${id}`), e = JSON.parse(fs.readFileSync(f, "utf8"));
  if (e.status === "published") die("the month on the ladder is a draft aid; a published edition does not carry it");
  e.from_signals = ladder(id, e.period.to); save(f, e);
  console.log(`${id}: ${e.from_signals.moved.length} steps dated in the period, ${e.from_signals.scheduled.length} scheduled after it`);
} else if (cmd === "snapshot") {
  const f = fileOf(id) || die(`no edition ${id}`), e = JSON.parse(fs.readFileSync(f, "utf8"));
  if (e.status === "published") console.log("note: a published edition changes only with a dated revision; run seal afterwards");
  for (const [k, s] of Object.entries(e.sources || {})) {
    const by = [e.cutoff, s.added].filter(Boolean).sort().pop();
    try { const before = JSON.stringify(s.check || null); e.sources[k] = M.snapshot(s, by); console.log(`  ${k}: ${e.sources[k].type}, ${M.CHECK[e.sources[k].check.kind]}${before !== JSON.stringify(e.sources[k].check) ? " (updated)" : ""}`); }
    catch (x) { die(`  ${k}: ${x.message}`); }
  }
  save(f, e); console.log(`snapshot saved for ${id}`);
} else if (cmd === "check") {
  const f = fileOf(id) || die(`no edition ${id}`), bad = M.validate(JSON.parse(fs.readFileSync(f, "utf8")));
  if (bad.length) die("Not ready:\n" + bad.map(b => "  - " + b).join("\n")); console.log(`${id} passes the edition rules`);
} else if (cmd === "publish") {
  const [date, who] = rest, f = path.join(M.DRAFTS, id + ".json");
  if (!fs.existsSync(f)) die(`no draft ${id}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) die("give the publication date, YYYY-MM-DD");
  if (!who) die("give the approver as a role (for example \"Site owner\"): a person approves every edition");
  const e = JSON.parse(fs.readFileSync(f, "utf8"));
  delete e.from_signals;   // a draft aid, never part of what is published
  Object.assign(e, { status: "published", published: date, approved: who }); e.revisions = [{ date, kind: "published", note: "First published." }, ...(e.revisions || []).filter(r => r.kind !== "published")];
  const bad = M.validate(e); if (bad.length) die("Not published:\n" + bad.map(b => "  - " + b).join("\n"));
  save(path.join(M.DIR, id + ".json"), e); fs.unlinkSync(f);
  const L = led(); L[id] = [{ date, revisions: 0, hash: M.hash(e) }]; saveLed(L);
  // the share image for the edition (tools/sof-card.js); the page falls back to the site's default image without it
  try { require("child_process").execFileSync("node", [path.join(__dirname, "sof-card.js"), id], { stdio: "inherit" }); } catch (err) { console.log(`note: no share image yet; run node tools/sof-card.js ${id}`); }
  console.log(`published ${id} (${date}). Rebuild (node tools/build-static.js), run node tools/check-sof.js, and open a pull request: merging is the sign-off`);
} else if (cmd === "seal") {
  const f = path.join(M.DIR, id + ".json"); if (!fs.existsSync(f)) die(`no published edition ${id}`);
  const e = JSON.parse(fs.readFileSync(f, "utf8")), L = led(), rows = L[id] || [], h = M.hash(e), last = rows[rows.length - 1];
  if (last && last.hash === h) { console.log(`${id} is already sealed at ${last.date}`); process.exit(0); }
  const revs = (e.revisions || []).filter(r => r.kind !== "published"), rev = revs.map(r => r.date).sort().pop();
  if (!rev || (last && revs.length <= (last.revisions || 0))) die(`${id} has changed since ${last ? last.date : "publication"} without a new revision: add an entry to "revisions" (kind revision or correction, dated today, saying what changed), and a /corrections/ entry for a correction`);
  rows.push({ date: rev, revisions: revs.length, hash: h }); L[id] = rows; saveLed(L); console.log(`${id} sealed at its ${rev} revision`);
} else {
  console.log(fs.readFileSync(__filename, "utf8").split("\n").slice(1, 15).map(l => l.replace(/^\/\/ ?/, "")).join("\n"));
}
