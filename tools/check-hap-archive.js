#!/usr/bin/env node
// Checks the India heat action plan archive: that the catalogue imports cleanly, matches the totals in
// research/india-hap-archive/expected.json, keeps unresolved records apart, and that the built page
// (/resources/heat-action-plans/india/) shows exactly the imported records with their PDF links.
//   node tools/check-hap-archive.js           (after node tools/build-static.js)
"use strict";
const fs = require("fs"), path = require("path");
const HAP = require("./hap-archive.js");
const ROOT = path.join(__dirname, ".."), PAGE = path.join(ROOT, "resources", "heat-action-plans", "india", "index.html");
const A = HAP.load(), C = A.counts, E = A.expected || {};
const fail = [], ok = [];
const expect = (cond, msg) => (cond ? ok : fail).push(msg);

// the parser and the type rules, on a small sample with the awkward cases: a BOM, CRLF, quoted commas, doubled
// quotes, a line break inside quotes, Unicode, blank fields, a semicolon language label and an unknown prefix
{
  const head = HAP.COLUMNS.join(",");
  const csv = "\uFEFF" + head + "\r\n" +
    'T-1,"Plan, with ""quotes""",city,Gujarat,Ahmedabad,2022-27,English; Telugu,"NRDC; partners",https://x.org/a.pdf,,,,PDF,,verified,"HAP; Line one\nline two; checked 2026-11-01."\r\n' +
    "T-2,हीट एक्शन प्लान,district,Uttar Pradesh,Banda,undated,Hindi,District authority,https://x.org/b.pdf,,,,PDF,61,verified,SOMETHING_NEW; checked 2026-11-01.\r\n";
  const dir = fs.mkdtempSync(path.join(require("os").tmpdir(), "hap-"));
  fs.writeFileSync(path.join(dir, HAP.FILES.verified), csv);
  fs.writeFileSync(path.join(dir, HAP.FILES.unresolved), head + "\n");
  const t = HAP.load(dir), [a, b] = t.docs;
  expect(t.docs.length === 2 && !t.problems.length, "sample: two rows parsed with no problems");
  expect(a.title === 'Plan, with "quotes"' && a.publisher_agency === "NRDC; partners", "sample: quoted commas and doubled quotes kept");
  expect(a.note === "Line one\nline two." || a.note === "Line one line two.", "sample: a line break inside a quoted note stays in one field");
  expect(a.year === "2022-27" && b.year === "undated", "sample: printed periods and undated kept exactly");
  expect(a.language === "English; Telugu" && a.languages.join("|") === "English|Telugu", "sample: language label kept, parts split for filtering");
  expect(b.title === "हीट एक्शन प्लान" && b.pages === 61 && a.pages === null && a.alternate_url === "", "sample: Unicode, page counts and blank fields");
  expect(a.type === "HAP" && b.type === "REVIEW" && t.review.length === 1, "sample: unknown prefix flagged for review, not guessed");
  fs.rmSync(dir, { recursive: true, force: true });
}
A.problems.forEach(p => fail.push("import: " + p));
A.warnings.forEach(w => console.warn("warning: " + w));
expect(new Set(A.docs.map(d => d.id)).size === A.docs.length, `${A.docs.length} verified records, every ID unique`);
if (E.verified != null) expect(C.total === E.verified, `verified records: ${C.total} (expected ${E.verified})`);
if (E.unresolved != null) expect(C.unresolved === E.unresolved, `unresolved records: ${C.unresolved} (expected ${E.unresolved})`);
for (const [t, k] of Object.entries(E.type || {})) expect((C.type[t] || 0) === k, `${t}: ${C.type[t] || 0} (expected ${k})`);
for (const [l, k] of Object.entries(E.level || {})) expect((C.level[l] || 0) === k, `level ${l}: ${C.level[l] || 0} (expected ${k})`);
expect(Object.values(C.type).reduce((a, b) => a + b, 0) === C.total, "document types add up to the total");
expect(!A.review.length, A.review.length ? `${A.review.length} records have an unknown notes prefix and need review: ${A.review.map(r => r.id).join(", ")}` : "every record has a known document type");
expect(A.docs.every(d => d.status === "verified") && A.unresolved.every(d => d.status !== "verified"), "verified and unresolved files hold only their own status");
expect(!A.unresolved.some(u => A.docs.some(d => d.id === u.id)), "no unresolved record is counted as verified");
if (E.verified_on) expect(C.checked.length === 1 && C.checked[0] === E.verified_on, `verification date in notes: ${C.checked.join(", ")} (expected ${E.verified_on})`);
// years and periods kept exactly as printed: nothing reformatted on import
const raw = HAP.parseCSV(fs.readFileSync(path.join(A.dir, A.files.verified), "utf8")).rows;
expect(raw.every((r, i) => r.year === A.docs[i].year && r.language === A.docs[i].language && r.id === A.docs[i].id), "IDs, years and language labels unchanged from the CSV");

if (!fs.existsSync(PAGE)) fail.push("the archive page has not been built: run node tools/build-static.js");
else {
  const html = fs.readFileSync(PAGE, "utf8");
  const list = (html.match(/<ol class="hap-list"[\s\S]*?<\/ol>/) || [""])[0], gaps = (html.match(/<ul class="hap-gaps">[\s\S]*?<\/ul>/) || [""])[0];
  const shown = [...list.matchAll(/<li class="hap-doc" id="([^"]+)"[^>]*data-type="([^"]+)"/g)];
  expect(shown.length === C.total, `page lists ${shown.length} documents (catalogue: ${C.total})`);
  expect(new Set(shown.map(m => m[1])).size === shown.length && shown.every(m => A.docs.some(d => d.id === m[1])), "every listed document is a verified record, once");
  const byType = shown.reduce((o, m) => (o[m[2]] = (o[m[2]] || 0) + 1, o), {});
  expect(Object.keys(C.type).every(t => byType[t] === C.type[t]), `page types match the catalogue: ${JSON.stringify(byType)}`);
  expect((list.match(/class="hap-pdf"/g) || []).length === C.total, "one Open PDF link per verified document");
  expect(A.docs.every(d => list.includes(`href="${d.pdf_url.replace(/&/g, "&amp;")}"`)), "each Open PDF link uses the recorded pdf_url");
  expect(!A.unresolved.some(u => list.includes(`id="${u.id}"`)), "no unresolved record appears in the verified list");
  expect((gaps.match(/class="hap-gap"/g) || []).length === C.unresolved, `research gaps list ${C.unresolved} unresolved records`);
  expect(!/hap-pdf|hap-type|Open PDF/.test(gaps), "research gaps carry no PDF button and no verified type badge");
  for (const f of [A.files.verified, A.files.report, A.files.unresolved]) {
    const a = path.join(A.dir, f), b = path.join(path.dirname(PAGE), f);
    expect(fs.existsSync(b) && fs.readFileSync(a).equals(fs.readFileSync(b)), `download ${f} matches the research file`);
  }
  expect(!fs.existsSync(path.join(path.dirname(PAGE), "download_heat_action_plans.py")), "the Python downloader is not published with the page");
  expect(!new RegExp(`(?<!not )${C.total} standalone`, "i").test(html.replace(/<[^>]+>/g, "")), `the page never calls the archive ${C.total} standalone plans`);
}
ok.forEach(m => console.log("  ok   " + m));
if (fail.length) { console.error(fail.map(m => "  FAIL " + m).join("\n")); console.error(`India HAP archive check: ${fail.length} problem(s)`); process.exit(1); }
console.log(`India HAP archive check: ${ok.length} checks passed`);
