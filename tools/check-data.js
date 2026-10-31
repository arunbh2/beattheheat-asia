// Checks knowledge-base records against data/schema (gates 1 to 6 of the publishing rules).
//   node tools/check-data.js                 check everything already in data/kb
//   node tools/check-data.js 2026-11         check that month's inbox against data/kb (no changes made)
// Exit code 1 if anything in data/kb fails, so a broken knowledge base never builds.
// Gates: 1 structure · 2 sourcing · 3 evidence · 4 tone · 5 review note (inbox only) · 6 consistency.
// Gate 7 (the site builds and its pages pass) runs in tools/merge-inbox.js.
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, ".."), KB = path.join(ROOT, "data", "kb"), INBOX = path.join(ROOT, "data", "inbox");
const SCHEMA = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "schema", "records.json"), "utf8"));
const TONE = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "schema", "tone.json"), "utf8"));

// ids the records may point at: the map's cycles, levers, cities, organisations and institutions
function mapIds() {
  const c = {}; vm.createContext(c);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "data.js"), "utf8") + ";this.D={LOOPS,LEVERS,LIVE_CITIES,ORGANISATIONS,INSTITUTIONS}", c);
  const D = c.D;
  return { cycles: new Set(D.LOOPS.map(x => x.id)), levers: new Set(D.LEVERS.map(x => x.id)),
    actors: new Set([...D.ORGANISATIONS.map(x => "org-" + x.id), ...D.INSTITUTIONS.map(x => "inst-" + x.id)]),
    cities: new Set(D.LIVE_CITIES.map(x => "city-" + x.id)) };
}
const COUNTRIES = ["bangladesh", "bhutan", "cambodia", "india", "indonesia", "lao-pdr", "malaysia", "maldives", "myanmar", "nepal", "pakistan", "philippines", "singapore", "sri-lanka", "thailand", "timor-leste", "viet-nam"];
const placeOk = p => /^city-/.test(p) ? null : /^country-/.test(p) ? COUNTRIES.includes(p.slice(8)) : /^region-(south-asia|southeast-asia|asia|global)$/.test(p);

const readDir = d => fs.existsSync(d) ? fs.readdirSync(d).filter(f => f.endsWith(".json") && !f.startsWith("_") && f !== "link-check.json")
  .flatMap(f => { const v = JSON.parse(fs.readFileSync(path.join(d, f), "utf8")); return (Array.isArray(v) ? v : [v]).map(r => ({ ...r, _file: f })); }) : [];
const words = r => TONE.people.fields_checked.map(k => r[k]).filter(Boolean).join(" ");
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const hit = (text, list) => list.filter(w => new RegExp(`(^|[^\\p{L}])${esc(w)}([^\\p{L}]|$)`, "iu").test(text));

function check(records, kb, opts = {}) {
  const ids = mapIds(), all = new Map(kb.map(r => [r.id, r]));
  const batchIds = new Map(); records.forEach(r => batchIds.set(r.id, (batchIds.get(r.id) || 0) + 1));
  records.forEach(r => all.set(r.id, r));
  const links = opts.links || null;
  return records.map(r => {
    const hold = [], review = [], T = SCHEMA.types[r.type];
    // 1 structure
    for (const k of SCHEMA.common.required) if (r[k] === undefined || r[k] === "" || r[k] === null) hold.push(`missing ${k}`);
    if (!T) hold.push(`unknown type ${r.type}`);
    else for (const k of T.required) if (r[k] === undefined || r[k] === "" || r[k] === null) hold.push(`missing ${k} (needed for ${r.type})`);
    if (r.id && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(r.id)) hold.push("id must be lower-case words joined by hyphens");
    if (batchIds.get(r.id) > 1) hold.push("id used twice in this batch");
    if (opts.inbox && kb.some(k => k.id === r.id)) hold.push("id already in the knowledge base: give the new version a new id and set replaces");
    if (r.status && !["current", "superseded", "retired"].includes(r.status)) hold.push("status must be current, superseded or retired");
    if (r.as_of && !/^\d{4}(-\d{2}(-\d{2})?)?$/.test(r.as_of)) hold.push("as_of must be YYYY, YYYY-MM or YYYY-MM-DD");
    if (r.checked && !/^\d{4}-\d{2}-\d{2}$/.test(r.checked)) hold.push("checked must be YYYY-MM-DD");
    (r.cycles || []).forEach(x => ids.cycles.has(x) || hold.push(`unknown cycle ${x}`));
    (r.levers || []).forEach(x => ids.levers.has(x) || hold.push(`unknown lever ${x}`));
    (r.places || []).forEach(x => { const ok = placeOk(x); if (ok === null ? !ids.cities.has(x) : !ok) hold.push(`unknown place ${x}`); });
    if (r.type === "role") { if (!ids.actors.has(r.actor) && !all.has(r.actor)) hold.push(`unknown actor ${r.actor}`); if (!ids.levers.has(r.lever)) hold.push(`unknown lever ${r.lever}`);
      if (T && !T.roles.includes(r.role)) hold.push(`role must be one of ${T.roles.join(", ")}`); }
    if (r.type === "funding" && T) { if (!T.instruments.includes(r.instrument)) hold.push(`instrument must be one of ${T.instruments.join(", ")}`);
      if (!T.stages.includes(r.stage)) hold.push(`stage must be one of ${T.stages.join(", ")}`);
      if (r.philanthropy_role && !T.roles.includes(r.philanthropy_role)) hold.push(`philanthropy_role must be one of ${T.roles.join(", ")}`);
      const a = r.amount || {}; if (a.disclosed === false) { if (a.value != null) hold.push("an undisclosed amount cannot carry a value"); } else if (a.value == null || !a.currency) hold.push("amount needs value and currency, or disclosed: false"); if (a.usd != null && !a.fx_date) hold.push("a US$ amount needs fx_date"); }
    if (r.replaces && !all.has(r.replaces)) hold.push(`replaces an unknown id ${r.replaces}`);
    // 2 sourcing
    if (r.type === "source") {
      if (!/^https:\/\//.test(r.url || "")) hold.push("source url must start with https://");
      if (!/^https:\/\/(web\.archive\.org\/web\/|archive\.(today|ph|is|org)\/)/.test(r.archive || "")) hold.push("source needs an archived copy (web.archive.org or archive.today)");
      if (links) { const s = links[r.url]; if (!s) hold.push("link not checked yet"); else if (s === "FAIL") hold.push("link does not open (FAIL)"); else if (s === "BLOCKED") review.push("site blocks automatic checks: confirm through the archived copy"); }
      // the page must really say what we rely on it for: tools/verify-inbox.js looks for each expected term on the page or its archived copy
      if (opts.inbox) { if (!Array.isArray(r.expect) || !r.expect.length) hold.push("source needs expect: the key terms its page must contain");
        else if (links) { const q = (links._terms || {})[r.url]; if (!q) hold.push("terms not checked yet (run the Verify sources workflow)"); else { const miss = r.expect.filter(t => !q[t]); if (miss.length) hold.push(`not found on the page: ${miss.map(t => `"${t}"`).join(", ")}`); } } }
    } else {
      if (!Array.isArray(r.sources) || !r.sources.length) hold.push("needs at least one source");
      else r.sources.forEach(s => { const x = all.get(s); if (!x) hold.push(`unknown source ${s}`); else if (x.type !== "source") hold.push(`${s} is not a source`); });
    }
    // 3 evidence
    if (r.evidence && !["known", "inferred", "uncertain"].includes(r.evidence)) hold.push("evidence must be known, inferred or uncertain");
    const text = [r.title, r.summary, r.method, r.question, r.why_it_matters].filter(Boolean).join(" ");
    if (r.evidence === "known" && hit(text, TONE.evidence.projection_words).length) hold.push(`a projection or estimate cannot be marked known (${hit(text, TONE.evidence.projection_words).join(", ")})`);
    if (r.type === "source" && r.kind === "news" && r.evidence === "known") review.push("news is usually 'uncertain' or 'inferred' unless it reports an official figure");
    // 4 tone
    const h = hit(text, TONE.hold); if (h.length) hold.push(`tone: reword ${h.map(x => `"${x}"`).join(", ")}`);
    const rv = hit(text, TONE.review); if (rv.length) review.push(`tone: check ${rv.map(x => `"${x}"`).join(", ")}`);
    const named = TONE.people.honorifics.filter(t => new RegExp(`(^|\\s)${esc(t)}\\s+\\p{Lu}`, "u").test(words(r)));
    if (named.length) hold.push("names a person: describe the institution or role instead");
    if (r.byline || r.author) hold.push("no author or byline fields: authors belong only in a source's citation");
    // 5 review note, written by the monthly reviewer for every inbox record
    if (opts.inbox) { const v = r.review || {}; if (v.tone === "hold") hold.push(`the reviewer held it back: ${v.note || "no reason given"}`); else if (v.tone !== "ok" || !v.note) hold.push("needs the reviewer's note: review { tone: \"ok\", note }"); else if (review.length && !v.addresses) hold.push(`flags need an answer in review.addresses: ${review.join("; ")}`); }
    // 6 consistency: a new figure for the same thing, place and period as a current one
    if (r.type === "claim" && r.key) {
      const twin = kb.find(k => k.type === "claim" && k.status === "current" && k.key === r.key && k.id !== r.id && k.id !== r.replaces && String(k.period) === String(r.period));
      if (twin && twin.value !== r.value) hold.push(`differs from ${twin.id} (${twin.value} ${twin.unit}): set replaces, or explain the difference in method`);
    }
    return { id: r.id || "(no id)", file: r._file, hold, review };
  });
}

module.exports = { check, readDir, KB, INBOX };

if (require.main === module) {
  const month = process.argv[2], kb = readDir(KB);
  if (month) {
    const dir = path.join(INBOX, month), recs = readDir(dir);
    const lf = path.join(dir, "link-check.json"), links = fs.existsSync(lf) ? JSON.parse(fs.readFileSync(lf, "utf8")) : {};
    const res = check(recs, kb, { inbox: true, links });
    res.forEach(x => console.log(`${x.hold.length ? "HOLD" : "PASS"}  ${x.id}${x.hold.length ? "\n      " + x.hold.join("\n      ") : ""}${x.review.length ? "\n      review: " + x.review.join("; ") : ""}`));
    console.log(`\n${res.filter(x => !x.hold.length).length} pass, ${res.filter(x => x.hold.length).length} held, of ${res.length}`);
  } else {
    const res = check(kb, [], {}), bad = res.filter(x => x.hold.length);
    bad.forEach(x => console.log(`FAIL  ${x.id} (${x.file}): ${x.hold.join("; ")}`));
    console.log(`knowledge base: ${kb.length} records, ${bad.length} failing`);
    if (bad.length) process.exit(1);
  }
}
