// Common Shade: the shared health and equity taxonomy (data/site/equity-taxonomy.json) and the one matcher that reads a
// record's own wording against it. Used by the Solutions library, the plan workbook, the heat action plan review,
// funding and Signals panels, and their checks.
//   T            the taxonomy: people, provisions, status, claims
//   validate()   problems with the file (ids unique and prefixed, every entry complete, every match a valid pattern)
//   matchSolution(rec)   for each provision: "includes" (the arrangement's own description names it), "requires" (its
//                fairness, conditions or barriers name it as needed), or "notassessed" (silent), with the field and the
//                passage that matched. Script-matched from published wording; not reviewed by a person.
"use strict";
const fs = require("fs"), path = require("path");
const T = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "site", "equity-taxonomy.json"), "utf8"));
const RX = Object.fromEntries(T.provisions.map(v => [v.id, new RegExp("\\b(" + v.match.join("|") + ")", "i")]));
function validate() {
  const bad = [], ids = new Set();
  for (const [dim, pre] of [["people", "p-"], ["provisions", "v-"], ["status", "s-"]]) for (const e of T[dim]) {
    if (ids.has(e.id)) bad.push("duplicate id " + e.id); ids.add(e.id);
    if (!e.id.startsWith(pre)) bad.push(`${e.id}: ${dim} ids start with ${pre}`);
    for (const k of dim === "status" ? ["label", "definition"] : ["label", "definition", "include", "exclude", "examples", "evidence"]) if (!e[k] || (Array.isArray(e[k]) && !e[k].length)) bad.push(`${e.id}: missing ${k}`);
    if (/\bsafe\b|equitable\b|approved|certif/i.test(e.label)) bad.push(`${e.id}: a label must describe, not certify`);
  }
  for (const v of T.provisions) { if (!Array.isArray(v.match) || !v.match.length) bad.push(`${v.id}: no match patterns`); try { new RegExp(v.match.join("|")); } catch (e) { bad.push(`${v.id}: bad pattern`); } }
  return bad;
}
const txt = x => x == null ? "" : typeof x === "string" ? x : Array.isArray(x) ? x.map(txt).join(" ") : (x.text || x.result || x.risk || x.logic || x.reason || "");
function sentence(text, re) {
  const parts = String(text).split(/(?<=[.;!?])\s+/);
  const s = parts.find(p => re.test(p)) || ""; return s.length > 240 ? s.slice(0, 237).replace(/\s+\S*$/, "") + "…" : s;
}
const ARR = [["name", "Name"], ["mechanism", "How it works"]], COND = [["equity_and_risks", "Fairness and risks"], ["works_if", "What makes it work"], ["stops_it", "What could stop it"]];
function matchSolution(rec) {
  const out = {};
  for (const v of T.provisions) {
    const re = RX[v.id]; let hit = null;
    for (const [f, label] of ARR) { const t = txt(rec[f]); if (re.test(t)) { hit = { status: "includes", field: label, passage: sentence(t, re) }; break; } }
    if (!hit) for (const [f, label] of COND) { const t = txt(rec[f]); if (re.test(t)) { hit = { status: "requires", field: label, passage: sentence(t, re) }; break; } }
    out[v.id] = hit || { status: "notassessed" };
  }
  return out;
}
module.exports = { T, validate, matchSolution, RX };
