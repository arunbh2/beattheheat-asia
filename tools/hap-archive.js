// The India heat action plan archive: reads the catalogue in research/india-hap-archive/ and turns it into records
// for the archive pages (tools/build-hap-archive.js) and its checks (tools/check-hap-archive.js).
//
// The verified CSV is the canonical catalogue. To update the archive, replace the CSV files in that folder (same
// 16 columns) and rebuild with `node tools/build-static.js`; nothing on the page is typed in by hand, and every
// count is calculated from the rows. If the new catalogue has different totals, update expected.json there too, so
// the check can confirm the import matches the research report.
//
// Rules this file keeps (from the research brief):
// - A row's document type comes only from the prefix at the start of its notes: HAP, EMBEDDED_HEAT_HEALTH_PLAN,
//   NATIONAL_PLAN or GUIDANCE. Any other prefix is flagged for review, never guessed from the title.
// - Printed years and planning periods are kept exactly as written ("2022-27", "2024-2025", "undated").
// - Language labels are kept as written ("English; Telugu"); the parts are only split for filtering.
// - Unresolved rows are read separately and never counted with the verified documents.
"use strict";
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "research", "india-hap-archive");
const FILES = { verified: "India_Heat_Action_Plans_Verified.csv", unresolved: "India_Heat_Action_Plans_Unresolved.csv",
  report: "India_HAP_Coverage_Report.md", expected: "expected.json" };
const COLUMNS = ["id", "title", "level", "state", "district_or_city", "year", "language", "publisher_agency", "pdf_url",
  "alternate_url", "landing_page", "archive_org_url", "file_type", "approx_pages", "status", "notes"];

// the four kinds of document, in the order the page shows them
const TYPES = {
  HAP: { name: "Standalone heat action plan", short: "Heat action plan" },
  EMBEDDED_HEAT_HEALTH_PLAN: { name: "Heat-health plan within a state or UT climate-and-health volume", short: "Heat-health plan in a wider volume" },
  NATIONAL_PLAN: { name: "National heat-illness action plan", short: "National action plan" },
  GUIDANCE: { name: "Guidance, advisory or manual", short: "Guidance or manual" }
};
const LEVELS = { national: "National", state: "State or UT", district: "District", city: "City" };

// RFC 4180 CSV: quoted fields, doubled quotes inside quotes, commas and line breaks inside quotes, CRLF or LF, a BOM
function parseCSV(text) {
  text = text.replace(/^\uFEFF/, "");
  const rows = []; let row = [], f = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; }
      else f += c;
    } else if (c === '"' && f === "") q = true;
    else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(f); rows.push(row); row = []; f = ""; }
    else f += c;
  }
  if (f !== "" || row.length) { row.push(f); rows.push(row); }
  const nonEmpty = rows.filter(r => r.some(x => x.trim() !== ""));
  const head = nonEmpty.shift() || [];
  return { head, rows: nonEmpty.map((r, n) => { const o = {}; head.forEach((h, i) => { o[h] = (r[i] ?? "").trim(); }); o.__line = n + 2; o.__width = r.length; return o; }) };
}

// the notes start with the document type, then the qualifications, then "checked YYYY-MM-DD."
function splitNotes(notes) {
  const parts = String(notes || "").split(";").map(s => s.trim()).filter(Boolean);
  const prefix = parts.length && /^[A-Z_]+$/.test(parts[0]) ? parts.shift() : "";
  let checked = "";
  const rest = parts.filter(p => { const m = p.match(/^checked (\d{4}-\d{2}-\d{2})\.?$/); if (m) { checked = m[1]; return false; } return true; });
  // keep the researchers' words exactly; only tidy the separators that joined them
  const text = rest.join("; ").replace(/\.;/g, ".").replace(/\s+/g, " ").trim();
  return { prefix, text: text && !/[.!?]$/.test(text) ? text + "." : text, checked };
}

const languagesOf = label => String(label || "").split(";").map(s => s.trim()).filter(Boolean);

function record(r, kind) {
  const n = splitNotes(r.notes), t = TYPES[n.prefix];
  return {
    ...Object.fromEntries(COLUMNS.map(c => [c, r[c] ?? ""])),   // every original field, unchanged
    type: t ? n.prefix : (kind === "verified" ? "REVIEW" : ""),
    typeName: t ? t.name : (kind === "verified" ? "Type not recognised: needs review" : ""),
    typeShort: t ? t.short : "Needs review",
    prefix: n.prefix, note: n.text, checked: n.checked,
    languages: languagesOf(r.language),
    place: r.district_or_city || (r.state === "India" ? "India" : r.state),
    stateLabel: r.state === "India" ? "National (India)" : r.state,
    pages: /^\d+$/.test(r.approx_pages) ? +r.approx_pages : null
  };
}

function load(dir = DIR) {
  const problems = [], warnings = [];
  const read = name => { const p = path.join(dir, name); if (!fs.existsSync(p)) { problems.push(`missing file: ${name}`); return { head: [], rows: [] }; } return parseCSV(fs.readFileSync(p, "utf8")); };
  const V = read(FILES.verified), U = read(FILES.unresolved);
  for (const [name, csv] of [[FILES.verified, V], [FILES.unresolved, U]]) {
    const miss = COLUMNS.filter(c => !csv.head.includes(c)), extra = csv.head.filter(c => !COLUMNS.includes(c));
    if (miss.length) problems.push(`${name}: missing columns ${miss.join(", ")}`);
    if (extra.length) warnings.push(`${name}: extra columns kept but not shown: ${extra.join(", ")}`);
    csv.rows.filter(r => r.__width !== csv.head.length).forEach(r => problems.push(`${name} line ${r.__line}: ${r.__width} fields, expected ${csv.head.length}`));
  }
  const verified = V.rows.map(r => record(r, "verified")), unresolved = U.rows.map(r => record(r, "unresolved"));
  // the verified file holds only verified rows; anything else is moved aside and reported
  const stray = verified.filter(r => r.status !== "verified");
  stray.forEach(r => problems.push(`${FILES.verified}: ${r.id} has status "${r.status}", not "verified"; left out of the archive`));
  const docs = verified.filter(r => r.status === "verified");
  const review = docs.filter(r => r.type === "REVIEW");
  review.forEach(r => warnings.push(`${r.id}: notes prefix "${r.prefix || "(none)"}" is not a known document type; shown as "needs review"`));
  const ids = new Map(); docs.forEach(r => ids.set(r.id, (ids.get(r.id) || 0) + 1));
  [...ids].filter(([, n]) => n > 1).forEach(([id]) => problems.push(`duplicate id: ${id}`));
  docs.filter(r => !r.id).forEach(r => problems.push(`a verified row has no id (title: ${r.title})`));
  docs.filter(r => !/^https?:\/\//.test(r.pdf_url)).forEach(r => problems.push(`${r.id}: no pdf_url`));
  docs.filter(r => !r.year).forEach(r => problems.push(`${r.id}: blank year (the catalogue uses "undated" when no printed year was found)`));
  const unresolvedIds = new Set(unresolved.map(r => r.id));
  docs.filter(r => unresolvedIds.has(r.id)).forEach(r => problems.push(`${r.id} appears in both the verified and the unresolved files`));
  unresolved.filter(r => r.status === "verified").forEach(r => problems.push(`${FILES.unresolved}: ${r.id} is marked verified`));
  const count = (rows, key) => rows.reduce((o, r) => { for (const k of [].concat(key(r))) o[k] = (o[k] || 0) + 1; return o; }, {});
  const counts = {
    total: docs.length, unresolved: unresolved.length,
    type: count(docs, r => r.type), level: count(docs, r => r.level), state: count(docs.filter(r => r.state !== "India"), r => r.state),
    year: count(docs, r => r.year), languageProfile: count(docs, r => r.language), language: count(docs, r => r.languages),
    standaloneByState: count(docs.filter(r => r.type === "HAP" && r.state !== "India"), r => r.state),
    checked: [...new Set(docs.map(r => r.checked).filter(Boolean))].sort()
  };
  const expPath = path.join(dir, FILES.expected);
  const expected = fs.existsSync(expPath) ? JSON.parse(fs.readFileSync(expPath, "utf8")) : null;
  return { dir, files: FILES, docs, unresolved, review, counts, expected, problems, warnings };
}

module.exports = { load, parseCSV, splitNotes, TYPES, LEVELS, COLUMNS, FILES, DIR };
