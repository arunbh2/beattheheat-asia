# India heat action plan archive: research files

These files are the source of the archive at `/resources/heat-action-plans/india/`. The website reads them every time it is built. No record is typed into a page by hand.

| File | What it is | On the website |
|---|---|---|
| `India_Heat_Action_Plans_Verified.csv` | The canonical catalogue: one row per verified document or edition, 16 columns | Every row is listed and searchable, and the file is offered as a download |
| `India_Heat_Action_Plans_Unresolved.csv` | Documents found but not verified, with the reason for each | Listed under Research gaps, with no PDF link and no verified badge, and offered as a download |
| `India_HAP_Coverage_Report.md` | How the documents were found, checked and counted | Offered as a download |
| `verification_audit.json` | The evidence record for each verified row | Kept here for audit; not published on the page |
| `download_heat_action_plans.py` | Downloads every PDF in the catalogue, with retries and PDF checks | Not part of the website; run it on your own computer |
| `expected.json` | The totals the check expects, taken from the coverage report | Used by `tools/check-hap-archive.js` |

## Updating the archive

1. Replace the CSV files (and the report) with the new release. Keep the same 16 column names. Keep the file names, or update `FILES` in `tools/hap-archive.js`.
2. Update `expected.json` with the new release's totals from its coverage report (verified, unresolved, the four document types, the four levels, and the verification date).
3. Rebuild: `node tools/build-static.js`
4. Check: `node tools/check-hap-archive.js`. It confirms the following:
   - every ID is unique and the totals match `expected.json`
   - unresolved rows are kept out of the verified counts
   - the page lists exactly the catalogue, with one Open PDF link per document
   - the downloads match these files
5. Run the site's other checks (`node tools/check-voice.js`, `node tools/check-site.js`), then commit.

## Rules the import keeps

- **Document type** comes only from the prefix at the start of `notes`: `HAP`, `EMBEDDED_HEAT_HEALTH_PLAN`, `NATIONAL_PLAN` or `GUIDANCE`. A row with any other prefix is shown as "needs review", is reported by the build, and fails the check. It is never guessed from the title.
- **Years and periods** are shown exactly as printed (`2022-27`, `2024-2025`, `undated`). Nothing is inferred from file names.
- **Language labels** are shown exactly as written (`English; Telugu`). The parts are split only for the language filter, and the page notes that a second language may cover part of a document only.
- **Separate editions** stay separate records. The `id` column is kept unchanged and appears on the page as the catalogue ID, so a link such as `#IN-KL-STATE-KL-2020` opens that record.
- **Counts** on the page (totals, types, states, filter options and gaps) are all calculated from the rows.

To download the PDFs locally, run the following (needs Python 3):

```
python -m pip install requests
python download_heat_action_plans.py India_Heat_Action_Plans_Verified.csv
```
