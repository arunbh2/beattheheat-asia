// The India heat action plan archive: reads the catalogue in research/india-hap-archive/ and turns it into records
// for the archive pages (tools/build-hap-archive.js) and its checks (tools/check-hap-archive.js).
//
// The catalogue is India_HAP_Combined_Verified.json, a complete replacement for earlier releases (its CSV twin is
// offered as the download). To update the archive, replace the catalogue files with the new release, list any
// recovered gaps in resolved.json, update expected.json from the release's report, and rebuild with
// `node tools/build-static.js`. Nothing on the page is typed in by hand; every count is calculated from the rows.
//
// Rules this file keeps (from the research briefs):
// - The document type is the record's document_type (HAP, EMBEDDED_HEAT_HEALTH_PLAN, NATIONAL_PLAN or GUIDANCE),
//   which must agree with the prefix of its notes. Anything else is flagged for review, never guessed from a title.
// - Printed years and planning periods are kept exactly as written ("2022-27", "2026-27", "undated").
// - Language labels are kept as written ("English; Telugu"); a blank label is shown as "Not established".
// - Leads and unresolved records are read separately and never counted with the verified documents.
"use strict";
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "research", "india-hap-archive");
const FILES = {
  catalogue: "India_HAP_Combined_Verified.json", catalogueCsv: "India_HAP_Combined_Verified.csv",
  report: "India_HAP_Batch_2_Coverage_Report.md", reportFirst: "batch-1/India_HAP_Coverage_Report.md",
  leads: [["batch-1", "batch-1/India_Heat_Action_Plans_Unresolved.csv", "First search"], ["batch-2", "India_HAP_Batch_2_Unverified_Leads.csv", "Second search"]],
  resolved: "resolved.json", expected: "expected.json"
};
const COLUMNS = ["id", "title", "level", "state", "district_or_city", "year", "language", "publisher_agency", "pdf_url",
  "alternate_url", "landing_page", "archive_org_url", "file_type", "approx_pages", "status", "notes"];

// the four kinds of document, in the order the page shows them
const TYPES = {
  HAP: { name: "Standalone heat action plan", short: "Heat action plan" },
  EMBEDDED_HEAT_HEALTH_PLAN: { name: "Heat-health plan within a wider climate-and-health plan", short: "Heat-health plan in a wider plan" },
  NATIONAL_PLAN: { name: "National heat-illness action plan", short: "National action plan" },
  GUIDANCE: { name: "Guidance, advisory or manual", short: "Guidance or manual" }
};
const LEVELS = { national: "National", state: "State or UT", district: "District", city: "City" };
const NOT_ESTABLISHED = "Not established";

// RFC 4180 CSV: quoted fields, doubled quotes inside quotes, commas and line breaks inside quotes, CRLF or LF, a BOM
function parseCSV(text) {
  text = text.replace(/^﻿/, "");
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

// the notes start with the document type, then the qualifications, and end with the date it was checked
// ("; checked 2026-11-01." in the first release, ". Checked 2026-11-01." in the second)
function splitNotes(notes) {
  let rest = String(notes || "").trim(), checked = "";
  rest = rest.replace(/(?:[;.]\s*|^)checked (\d{4}-\d{2}-\d{2})\.?\s*$/i, (m, d) => { checked = d; return m.startsWith(".") ? "." : ""; }).trim();
  const parts = rest.split(";").map(s => s.trim()).filter(Boolean);
  const prefix = parts.length && /^[A-Z_]+$/.test(parts[0]) ? parts.shift() : "";
  // keep the researchers' words exactly; only tidy the separators that joined them
  const text = parts.join("; ").replace(/\.;/g, ".").replace(/\s+/g, " ").trim();
  return { prefix, text: text && !/[.!?]$/.test(text) ? text + "." : text, checked };
}
const languagesOf = label => { const l = String(label || "").split(";").map(s => s.trim()).filter(Boolean); return l.length ? l : [NOT_ESTABLISHED]; };

function record(r, kind) {
  const n = splitNotes(r.notes), declared = r.document_type || n.prefix;
  const known = kind === "verified" && TYPES[declared] && (!r.document_type || !n.prefix || r.document_type === n.prefix);
  return {
    ...Object.fromEntries(COLUMNS.map(c => [c, String(r[c] ?? "").trim()])),   // every original field, unchanged
    document_type: r.document_type || "",
    type: kind === "verified" ? (known ? declared : "REVIEW") : "",
    prefix: n.prefix, note: n.text, checked: r.verification_checked || n.checked,
    languages: languagesOf(r.language), languageLabel: String(r.language || "").trim() || NOT_ESTABLISHED,
    place: r.district_or_city || r.state,
    pages: /^\d+$/.test(String(r.approx_pages || "").trim()) ? +r.approx_pages : null
  };
}

function load(dir = DIR) {
  const problems = [], warnings = [];
  const p = f => path.join(dir, f), has = f => fs.existsSync(p(f));
  // the catalogue
  let raw = [];
  if (!has(FILES.catalogue)) problems.push(`missing file: ${FILES.catalogue}`);
  else { try { const j = JSON.parse(fs.readFileSync(p(FILES.catalogue), "utf8")); raw = Array.isArray(j) ? j : (j.records || []); } catch (e) { problems.push(`${FILES.catalogue}: not valid JSON (${e.message})`); } }
  raw.forEach((r, i) => { const miss = COLUMNS.filter(c => !(c in r)); if (miss.length) problems.push(`${FILES.catalogue} record ${i + 1} (${r.id || "no id"}): missing ${miss.join(", ")}`); });
  const verified = raw.map(r => record(r, "verified"));
  verified.filter(r => r.status !== "verified").forEach(r => problems.push(`${r.id}: status "${r.status}", not "verified"; left out of the archive`));
  const docs = verified.filter(r => r.status === "verified");
  const review = docs.filter(r => r.type === "REVIEW");
  review.forEach(r => warnings.push(`${r.id}: document type "${r.document_type || r.prefix || "(none)"}" is unknown or disagrees with its notes prefix "${r.prefix}"; shown as "needs review"`));
  const ids = new Map(); docs.forEach(r => ids.set(r.id, (ids.get(r.id) || 0) + 1));
  [...ids].filter(([, n]) => n > 1).forEach(([id]) => problems.push(`duplicate id: ${id}`));
  docs.filter(r => !r.id).forEach(r => problems.push(`a verified record has no id (title: ${r.title})`));
  docs.filter(r => !/^https?:\/\//.test(r.pdf_url)).forEach(r => problems.push(`${r.id}: no pdf_url`));
  docs.filter(r => !r.year).forEach(r => problems.push(`${r.id}: blank year (the catalogue uses "undated" when no printed year was found)`));
  // leads and unresolved records, by search pass; gaps a later pass resolved are left out
  const resolved = has(FILES.resolved) ? JSON.parse(fs.readFileSync(p(FILES.resolved), "utf8")).resolved || {} : {};
  const docIds = new Set(docs.map(d => d.id));
  Object.entries(resolved).filter(([, to]) => !docIds.has(to)).forEach(([from, to]) => problems.push(`resolved.json: ${from} points to ${to}, which is not in the catalogue`));
  const leads = [];
  for (const [batch, file, label] of FILES.leads) {
    if (!has(file)) { problems.push(`missing file: ${file}`); continue; }
    const csv = parseCSV(fs.readFileSync(p(file), "utf8"));
    const miss = COLUMNS.filter(c => !csv.head.includes(c)); if (miss.length) problems.push(`${file}: missing columns ${miss.join(", ")}`);
    csv.rows.filter(r => r.__width !== csv.head.length).forEach(r => problems.push(`${file} line ${r.__line}: ${r.__width} fields, expected ${csv.head.length}`));
    csv.rows.forEach(r => { if (r.status === "verified") problems.push(`${file}: ${r.id} is marked verified`); if (docIds.has(r.id) && !resolved[r.id]) problems.push(`${r.id} is both a lead and a verified record`); });
    csv.rows.filter(r => !resolved[r.id] && !docIds.has(r.id)).forEach(r => leads.push({ ...record(r, "lead"), batch, batchLabel: label }));
  }
  const count = (rows, key) => rows.reduce((o, r) => { for (const k of [].concat(key(r))) o[k] = (o[k] || 0) + 1; return o; }, {});
  const counts = {
    total: docs.length, leads: leads.length, leadsByBatch: count(leads, r => r.batch), resolved: Object.keys(resolved).length,
    type: count(docs, r => r.type), level: count(docs, r => r.level), state: count(docs.filter(r => r.state !== "India"), r => r.state),
    year: count(docs, r => r.year), languageProfile: count(docs, r => r.languageLabel), language: count(docs, r => r.languages),
    standaloneByState: count(docs.filter(r => r.type === "HAP" && r.state !== "India"), r => r.state),
    checked: [...new Set(docs.map(r => r.checked).filter(Boolean))].sort()
  };
  const expected = has(FILES.expected) ? JSON.parse(fs.readFileSync(p(FILES.expected), "utf8")) : null;
  return { dir, files: FILES, docs, leads, resolved, review, counts, expected, problems, warnings };
}

module.exports = { load, parseCSV, splitNotes, TYPES, LEVELS, COLUMNS, FILES, DIR, NOT_ESTABLISHED };
