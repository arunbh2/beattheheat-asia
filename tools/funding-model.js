// Common Shade: the funding, opportunities and careers model. Loads the records in data/funding/ (organisations,
// programmes, opportunities, careers), attaches to each the result of the source check for its sources
// (data/inbox/2026-11-funding-opps/link-check.json, dated by the commit that recorded it, never by the build), and works
// out, field by field, which published facts the check confirmed. A fact whose term was not found on its source is shown
// as "not confirmed"; a record whose core facts were not confirmed is held back and listed in the build output. Read by
// tools/build-funding.js, tools/check-funding.js and tools/funding-harvest.js. No network.
"use strict";
const fs = require("fs"), path = require("path"), cp = require("child_process");
const ROOT = path.join(__dirname, ".."), DIR = path.join(ROOT, "data", "funding"), BATCH = "2026-11-funding-opps";
const INBOX = path.join(ROOT, "data", "inbox", BATCH), C = require(path.join(ROOT, "heat-economy", "funding-core.js"));
const read = (f, d) => fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : d;
const gitDate = f => { try { return cp.execSync(`git log -1 --format=%cs -- "${f}"`, { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch (e) { return ""; } };
const norm = s => String(s || "").toLowerCase().replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, " ");

let _m;
function load() {
  if (_m) return _m;
  const SRC = Object.fromEntries(require(path.join(ROOT, "research", "2026-11", "funding-opportunities", "sources.js")).map(s => [s.key, s]));
  const LC = read(path.join(INBOX, "link-check.json"), {}), T = LC._terms || {}, X = read(path.join(INBOX, "_excerpts.json"), {});
  const checked = gitDate(path.relative(ROOT, path.join(INBOX, "link-check.json"))) || "";
  const said = key => { const x = X[`src-fo-${key}`] || {}; return norm([x.title || "", ...(x.around || [])].join(" ")); };
  const opened = key => { const s = SRC[key]; return !!s && /^(OK|REDIRECT|BLOCKED)/.test(String(typeof LC[s.url] === "object" ? (LC[s.url] || {}).status : LC[s.url] || "")); };
  const has = (key, term) => { const s = SRC[key]; if (!s) return false; const f = typeof LC[s.url] === "object" ? ((LC[s.url] || {}).found || {}) : (T[s.url] || {});
    return !!f[term] || said(key).includes(norm(term)); };
  const ran = key => { const s = SRC[key]; return !!s && LC[s.url] !== undefined; };
  // a fact { ..., src, term }: confirmed when its term was found on its source
  const fact = f => !f ? null : Object.assign({}, f, { confirmed: !f.src || !f.term ? null : has(f.src, f.term) });
  const FIELDS = ["purpose", "amount", "budget", "duration", "opens", "eligibility", "geography", "partnership", "cofinancing", "costs", "stages", "documents", "salary", "location", "contract", "access_note", "remit", "recipients", "instruments_note", "limits_note"];
  function attach(r, kind) {
    const out = Object.assign({ kind }, r);
    FIELDS.forEach(k => { if (r[k] && typeof r[k] === "object" && !Array.isArray(r[k])) out[k] = fact(r[k]); });
    out.deadlines = (r.deadlines || []).map(fact);
    out.deadline_history = r.deadline_history || [];
    const core = r.core || [], keys = [...new Set(core.map(([k]) => k))];
    const missing = core.filter(([k, t]) => !has(k, t)).map(([k, t]) => `${k}: "${t}"`);
    // the deadline that decides the status must be confirmed too, or the record cannot show as open
    const dl = out.deadlines[0]; if (dl && dl.confirmed === false) missing.push(`${dl.src}: deadline "${dl.term}"`);
    const notRun = keys.filter(k => !ran(k));
    out.check = { checked: notRun.length ? "" : checked, ok: keys.length ? keys.every(opened) : null, confirmed: notRun.length ? null : !missing.length, missing, batch: BATCH, not_run: notRun };
    out.sources = (r.sources || keys).map(k => SRC[k] ? { key: k, url: SRC[k].url, label: `${SRC[k].publisher}: ${SRC[k].title}`, opened: opened(k) } : { key: k, url: "", label: k, opened: false });
    return out;
  }
  const ORG = read(path.join(DIR, "organisations.json"), { records: [] }).records.map(r => attach(r, "organisation"));
  const PROG = read(path.join(DIR, "programmes.json"), { records: [] }).records.map(r => attach(r, "programme"));
  const OPP = read(path.join(DIR, "opportunities.json"), { records: [] }).records.map(r => attach(r, "opportunity"));
  const CAR = read(path.join(DIR, "careers.json"), { records: [] }).records.map(r => attach(r, "career"));
  const REJ = read(path.join(DIR, "rejected.json"), { records: [] }).records;
  // published: the record's core facts were confirmed by the check (a source that did not open keeps last-known facts,
  // shown as "source unavailable", once it has been confirmed before: confirmed_before)
  const pub = r => r.check.confirmed === true || (r.check.ok === false && r.confirmed_before);
  const held = [...ORG, ...PROG, ...OPP, ...CAR].filter(r => !pub(r));
  _m = { C, SRC, checked, ORG: ORG.filter(pub), PROG: PROG.filter(pub), OPP: OPP.filter(pub), CAR: CAR.filter(pub), REJ, held, has, opened, all: { ORG, PROG, OPP, CAR } };
  const byId = {}; [..._m.ORG, ..._m.PROG, ..._m.OPP, ..._m.CAR].forEach(r => { byId[r.id] = r; }); _m.byId = byId;
  return _m;
}
module.exports = { load, DIR, BATCH, ROOT };
