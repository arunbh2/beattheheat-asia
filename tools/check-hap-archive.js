#!/usr/bin/env node
// Checks the India heat action plan archive: that the catalogue imports cleanly, matches the totals in
// research/india-hap-archive/expected.json, agrees with its CSV twin, keeps leads and unresolved records out of the
// verified results, and that the built page (/resources/heat-action-plans/india/) shows exactly the catalogue.
//   node tools/check-hap-archive.js           (after node tools/build-static.js)
"use strict";
const fs = require("fs"), path = require("path"), os = require("os");
const HAP = require("./hap-archive.js");
const ROOT = path.join(__dirname, ".."), PAGE = path.join(ROOT, "resources", "heat-action-plans", "india", "index.html");
const A = HAP.load(), C = A.counts, E = A.expected || {};
const fail = [], ok = [];
const expect = (cond, msg) => (cond ? ok : fail).push(msg);

// the parser and the type rules, on a small sample with the awkward cases
{
  const head = HAP.COLUMNS.join(",");
  const csv = "﻿" + head + "\r\n" +
    'T-1,"Plan, with ""quotes""",city,Gujarat,Ahmedabad,2022-27,English; Telugu,"NRDC; partners",https://x.org/a.pdf,,,,PDF,,unverified,"HAP_LEAD; Line one\nline two. Checked 2026-11-01."\r\n';
  const p = HAP.parseCSV(csv).rows[0], n = HAP.splitNotes(p.notes);
  expect(p.title === 'Plan, with "quotes"' && p.publisher_agency === "NRDC; partners" && p.year === "2022-27" && p.alternate_url === "", "sample: quoted commas, doubled quotes, periods and blanks kept");
  expect(n.prefix === "HAP_LEAD" && n.checked === "2026-11-01" && /line two\.$/.test(n.text), "sample: notes prefix, text and check date separated (second-release style)");
  expect(HAP.splitNotes("GUIDANCE; No printed year established.; checked 2026-11-01.").checked === "2026-11-01", "sample: first-release date style read");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hap-"));
  const rec = (id, t, prefix, lang) => ({ ...Object.fromEntries(HAP.COLUMNS.map(c => [c, ""])), id, title: "हीट एक्शन प्लान " + id, level: "district", state: "Uttar Pradesh", year: "undated", language: lang,
    pdf_url: "https://x.org/" + id + ".pdf", status: "verified", notes: `${prefix}; Note. Checked 2026-11-01.`, document_type: t, verification_checked: "2026-11-01" });
  fs.writeFileSync(path.join(dir, HAP.FILES.catalogue), JSON.stringify([rec("A", "HAP", "HAP", ""), rec("B", "SOMETHING_NEW", "SOMETHING_NEW", "Hindi"), rec("C", "GUIDANCE", "HAP", "Hindi")]));
  for (const [, f] of HAP.FILES.leads) { fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true }); fs.writeFileSync(path.join(dir, f), head + "\n"); }
  const t = HAP.load(dir);
  expect(t.docs.length === 3 && t.docs[0].title.startsWith("हीट") && t.docs[0].languageLabel === HAP.NOT_ESTABLISHED, "sample: Unicode titles, and a blank language shown as not established");
  expect(t.docs[0].type === "HAP" && t.docs[1].type === "REVIEW" && t.docs[2].type === "REVIEW" && t.review.length === 2, "sample: an unknown type, or a type that disagrees with its notes, is flagged for review");
  fs.rmSync(dir, { recursive: true, force: true });
}

A.problems.forEach(p => fail.push("import: " + p));
A.warnings.forEach(w => console.warn("warning: " + w));
expect(new Set(A.docs.map(d => d.id)).size === A.docs.length, `${A.docs.length} verified records, every ID unique`);
if (E.verified != null) expect(C.total === E.verified, `verified records: ${C.total} (expected ${E.verified})`);
for (const [t, k] of Object.entries(E.type || {})) expect((C.type[t] || 0) === k, `${t}: ${C.type[t] || 0} (expected ${k})`);
for (const [l, k] of Object.entries(E.level || {})) expect((C.level[l] || 0) === k, `level ${l}: ${C.level[l] || 0} (expected ${k})`);
for (const [b, k] of Object.entries(E.leads || {})) expect((C.leadsByBatch[b] || 0) === k, `leads not yet verified, ${b}: ${C.leadsByBatch[b] || 0} (expected ${k})`);
expect(Object.values(C.type).reduce((a, b) => a + b, 0) === C.total, "document types add up to the total");
expect(!A.review.length, A.review.length ? `${A.review.length} records need review: ${A.review.map(r => r.id).join(", ")}` : "every record has a known type that agrees with its notes");
expect(A.docs.every(d => d.status === "verified"), "every catalogue record is verified");
const docIds = new Set(A.docs.map(d => d.id));
expect(!A.leads.some(l => docIds.has(l.id)) && A.leads.every(l => l.status !== "verified"), "no lead or unresolved record is counted as verified");
expect(A.leads.every(l => !l.pdf_url), "no lead carries a PDF link");
if (E.verified_on) expect(C.checked.length === 1 && C.checked[0] === E.verified_on, `verification date: ${C.checked.join(", ")} (expected ${E.verified_on})`);
// the CSV download is the same catalogue
{
  const rows = HAP.parseCSV(fs.readFileSync(path.join(A.dir, A.files.catalogueCsv), "utf8")).rows;
  expect(rows.length === A.docs.length && rows.every((r, i) => HAP.COLUMNS.every(c => r[c] === A.docs[i][c])), `the CSV matches the JSON catalogue, record for record (${rows.length})`);
}
// the first release's verified records are all still here, unchanged
{
  const first = path.join(A.dir, "batch-1", "India_Heat_Action_Plans_Verified.csv");
  if (fs.existsSync(first)) { const rows = HAP.parseCSV(fs.readFileSync(first, "utf8")).rows, byId = new Map(A.docs.map(d => [d.id, d]));
    expect(rows.every(r => byId.has(r.id) && HAP.COLUMNS.every(c => r[c] === byId.get(r.id)[c])), `all ${rows.length} records of the first release kept, unchanged`); }
}

if (!fs.existsSync(PAGE)) fail.push("the archive page has not been built: run node tools/build-static.js");
else {
  const html = fs.readFileSync(PAGE, "utf8");
  const list = (html.match(/<ol class="hap-list"[\s\S]*?<\/ol>/) || [""])[0], gaps = (html.match(/<section[^>]*id="gaps"[\s\S]*?<\/section>/) || [""])[0];
  const shown = [...list.matchAll(/<li class="hap-doc" id="([^"]+)"[^>]*data-type="([^"]+)"/g)];
  expect(shown.length === C.total, `page lists ${shown.length} documents (catalogue: ${C.total})`);
  expect(new Set(shown.map(m => m[1])).size === shown.length && shown.every(m => docIds.has(m[1])), "every listed document is a verified record, once");
  const byType = shown.reduce((o, m) => (o[m[2]] = (o[m[2]] || 0) + 1, o), {});
  expect(Object.keys(C.type).every(t => byType[t] === C.type[t]), `page types match the catalogue: ${JSON.stringify(byType)}`);
  expect((list.match(/class="hap-pdf"/g) || []).length === C.total, "one Open PDF link per verified document");
  expect(A.docs.every(d => list.includes(`href="${d.pdf_url.replace(/&/g, "&amp;")}"`)), "each Open PDF link uses the recorded pdf_url");
  expect(!A.leads.some(l => list.includes(`id="${l.id}"`)), "no lead appears in the verified list");
  expect((gaps.match(/class="hap-gap"/g) || []).length === C.leads, `research gaps list ${C.leads} leads`);
  expect(!/hap-pdf|hap-type|Open PDF/.test(gaps), "research gaps carry no PDF button and no verified type badge");
  expect(!Object.keys(A.resolved).some(id => gaps.includes(`lead-${id}"`)), `the ${C.resolved} gaps a later search resolved are not shown as gaps`);
  for (const f of [A.files.catalogueCsv, A.files.catalogue, A.files.report, A.files.reportFirst, ...A.files.leads.map(l => l[1])]) {
    const a = path.join(A.dir, f), b = path.join(path.dirname(PAGE), path.basename(f));
    expect(fs.existsSync(b) && fs.readFileSync(a).equals(fs.readFileSync(b)), `download ${path.basename(f)} matches the research file`);
  }
  expect(!fs.existsSync(path.join(path.dirname(PAGE), "India_Heat_Action_Plans_Verified.csv")), "the earlier 113-record catalogue is no longer offered as current");
  expect(!fs.existsSync(path.join(path.dirname(PAGE), "download_heat_action_plans.py")), "the Python downloader is not published with the page");
  const text = html.replace(/<[^>]+>/g, " ");
  expect(!new RegExp(`(?<!not )${C.total} standalone`, "i").test(text), `the page never calls the archive ${C.total} standalone plans`);
  expect(!/screened records|100 verified/i.test(text), "the screened-records log is not presented as documents");
}
ok.forEach(m => console.log("  ok   " + m));
if (fail.length) { console.error(fail.map(m => "  FAIL " + m).join("\n")); console.error(`India HAP archive check: ${fail.length} problem(s)`); process.exit(1); }
console.log(`India HAP archive check: ${ok.length} checks passed`);
