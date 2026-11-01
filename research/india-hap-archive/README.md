# India heat action plan archive: research files

These files are the source of the archive at `/resources/heat-action-plans/india/`. The website reads them every time it is built. No record is typed into a page by hand.

## The current catalogue (second search, checked 1 November 2026)

| File | What it is | On the website |
|---|---|---|
| `India_HAP_Combined_Verified.json` | **The catalogue.** All 146 verified documents: the first release's 113 records, unchanged, plus 33 verified additions. Each record has `document_type` and `verification_checked` | Every record is listed and searchable, and the file is offered as a download |
| `India_HAP_Combined_Verified.csv` | The same 146 records, with the 16 original columns | Offered as a download; the check confirms it matches the JSON |
| `India_HAP_Batch_2_Coverage_Report.md` | The second search: additions, corrections and combined totals | Offered as a download |
| `India_HAP_Batch_2_Unverified_Leads.csv` | 67 leads that were located but not verified | Listed under Research gaps with no PDF and no verified badge, and offered as a download |
| `India_HAP_Batch_2_Verified.csv` | The 33 additions only | Kept for audit. Never appended again: they are already in the combined catalogue |
| `India_HAP_Batch_2_100_Screened_Records.csv` | The research log: 33 verified additions and 67 leads | Kept for audit. It is not 100 verified documents |
| `Batch_2_Verification_Audit.json`, `SHA256SUMS.json`, `README_Claude_Code.md` | Evidence for each new record, checksums, and the researchers' handoff note | Kept for audit |
| `resolved.json` | Gaps from the first search that the second search verified (3) | Those gaps are no longer shown |
| `expected.json` | The totals the check expects, taken from the coverage report | Used by `tools/check-hap-archive.js` |
| `download_heat_action_plans.py` | Downloads every PDF in a catalogue, with retries and PDF checks | Not part of the website; run it on your own computer |
| `batch-1/` | The first release: its 113-record CSV, its 30 unresolved records, its report and its audit | The report and the unresolved list (less the 3 now resolved) are shown and offered as downloads |

The catalogue holds 85 standalone heat action plans, 37 heat-health plans inside wider climate-and-health plans, 1 national action plan and 23 guidance documents. Never describe all of them as standalone plans.

## Updating the archive with a new release

1. Replace `India_HAP_Combined_Verified.json` and `.csv` with the new combined release. Do not append additions to the old file. If the file names change, update `FILES` in `tools/hap-archive.js`.
2. Add the release's leads file to `FILES.leads`, and its report to the downloads, in `tools/build-hap-archive.js`.
3. List in `resolved.json` any earlier gap that the release verified, mapping the old id to the new one.
4. Update `expected.json` from the release's report: verified, the four document types, the four levels, the leads per search, and the verification date.
5. Rebuild with `node tools/build-static.js`, then run `npm run check:hap`. The check confirms that:
   - every ID is unique and the totals reconcile
   - the CSV matches the JSON
   - earlier records are kept unchanged
   - leads stay out of the verified results
   - the page and downloads match these files
6. Run the site's other checks (`node tools/check-voice.js`, `node tools/check-site.js`), then commit.

## Rules the import keeps

- **Document type** is the record's `document_type`: `HAP`, `EMBEDDED_HEAT_HEALTH_PLAN`, `NATIONAL_PLAN` or `GUIDANCE`. It must agree with the prefix of its `notes`. Anything else is shown as "needs review", is reported by the build, and fails the check. It is never guessed from the title. For example, Latur's plan is embedded, and Tamil Nadu's urban-cooling guidelines are guidance.
- **Editions** (years and periods) are shown exactly as printed: `2026-27`, `2024-2025`, `undated`. Nothing is inferred from file names or hosting pages.
- **Language labels** are shown as written (`Hindi; English`). A blank label is shown as "Not established".
- **Notes** are shown as the researchers wrote them: drafts, proposals, presentation formats, edition corrections and adoption caveats. The verification date comes from the data (`verification_checked`), never from the day the site is built.
- **Separate editions** stay separate records. The `id` is shown as the catalogue ID, so a link such as `#IN-KL-STATE-KL-2020` opens that record.

To download the PDFs locally, run the following (needs Python 3):

```
python -m pip install requests
python download_heat_action_plans.py India_HAP_Combined_Verified.csv
```
