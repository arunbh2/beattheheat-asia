# India heat-action-plan archive — coverage and verification report

Checked: 1 November 2026. This is a verified catalogue of located documents, not a claim that every Indian HAP or every edition has been found.

**113 distinct verified documents:** 58 standalone HAPs (including Gorakhpur's HAP/SOP), 36 state/UT volumes containing dedicated heat-health plans, 1 national heat-illness action plan, and 18 guidance/advisory/manual documents. There are 95 plan documents and 18 additional guidance documents.

## Counting and verification rules

- One row per distinct document/edition. Translations in the same PDF are one row. A state plan on a district website remains state-level: the Rewari-hosted 2017 document is Haryana's state plan.
- `verified` means a research fetch resolved to `application/pdf` and returned content establishing that it is a relevant plan or guidance document. It does **not** mean every file has been downloaded locally, signed, or byte-for-byte authenticated against its issuer. Some research fetches use indexed document content. Download-time PDF-byte checks are performed by the supplied script.
- Scanned PDFs with no readable text and no usable visual inspection are excluded from verified counts, even when the hosting page calls them HAPs. No DOC-only item was verified.
- Document cover/imprint years take precedence over repository labels and filenames. Planning periods are retained exactly (for example `2022-27`, `2024-25`, `2024-2025`). These are not necessarily publication dates. `undated` means the inspected material did not establish a printed edition year. The unresolved file leaves the year field blank.
- No guessed download URLs. Unverified download candidates are excluded from `pdf_url`, `alternate_url`, and `archive_org_url`. The unresolved catalogue supplies landing pages and failure reasons.
- Page counts are whole-PDF counts supplied by retrieval. Blanks mean the page count could not be established; embedded heat chapters do not inherit a false chapter-length count.
- Kerala's official 2020 PDF and GHHIN copy have the same retrieved text and 124 pages, so they occupy one row with a fallback URL. Other obvious duplicate discovery results were consolidated. Complete binary-hash deduplication across every possible mirror was not possible without downloading the files.
- No Wayback URL was verified successfully. `archive_org_url` is therefore blank throughout and no row is labelled `dead_link_archived`.

## Coverage by administrative level

| Level | Documents |
|---|---:|
| city | 10 |
| district | 35 |
| national | 18 |
| state | 50 |

## Coverage by state/UT

The national documents are excluded from state/UT totals. Each state/UT has one verified NCDC volume with a dedicated heat-illness action-plan chapter.

| State / UT | All verified documents | Standalone HAPs |
|---|---:|---:|
| Andaman and Nicobar Islands | 1 | 0 |
| Andhra Pradesh | 4 | 3 |
| Arunachal Pradesh | 1 | 0 |
| Assam | 1 | 0 |
| Bihar | 2 | 1 |
| Chandigarh | 1 | 0 |
| Chhattisgarh | 1 | 0 |
| Dadra and Nagar Haveli and Daman and Diu | 1 | 0 |
| Delhi | 2 | 1 |
| Goa | 1 | 0 |
| Gujarat | 8 | 7 |
| Haryana | 3 | 2 |
| Himachal Pradesh | 1 | 0 |
| Jammu and Kashmir | 9 | 8 |
| Jharkhand | 1 | 0 |
| Karnataka | 3 | 2 |
| Kerala | 3 | 1 |
| Ladakh | 1 | 0 |
| Lakshadweep | 1 | 0 |
| Madhya Pradesh | 1 | 0 |
| Maharashtra | 6 | 5 |
| Manipur | 1 | 0 |
| Meghalaya | 1 | 0 |
| Mizoram | 1 | 0 |
| Nagaland | 1 | 0 |
| Odisha | 7 | 6 |
| Puducherry | 1 | 0 |
| Punjab | 4 | 3 |
| Rajasthan | 3 | 2 |
| Sikkim | 1 | 0 |
| Tamil Nadu | 1 | 0 |
| Telangana | 2 | 1 |
| Tripura | 1 | 0 |
| Uttar Pradesh | 16 | 15 |
| Uttarakhand | 1 | 0 |
| West Bengal | 2 | 1 |

## Coverage by printed year or period

| Printed year / planning period | Documents |
|---|---:|
| 2016 | 2 |
| 2017 | 3 |
| 2019 | 4 |
| 2020 | 5 |
| 2021 | 2 |
| 2022 | 2 |
| 2022-27 | 36 |
| 2023 | 8 |
| 2024 | 9 |
| 2024-2025 | 3 |
| 2024-25 | 4 |
| 2025 | 10 |
| 2025-2026 | 2 |
| 2025-26 | 3 |
| 2026 | 5 |
| 2026-2027 | 1 |
| undated | 14 |

## Coverage by language profile

One row belongs to one language profile; these counts sum to the catalogue total. English/Telugu means an English plan with Telugu public-advice material, not a full Telugu translation. English/Hindi likewise includes mixed-language annexures.

| Language profile | Documents |
|---|---:|
| English | 94 |
| English; Telugu | 1 |
| Hindi | 12 |
| Hindi; English | 2 |
| Malayalam | 1 |
| Malayalam; English | 1 |
| Marathi | 2 |

## States/UTs where no plan was found

**None under the broad heat-health-plan definition:** all 36 states/UTs have a verified dedicated heat-action chapter inside the NCDC climate-and-health series. This does not establish that all 36 have adopted standalone disaster-management HAPs.

**No verified standalone HAP was obtained in this pass for these 21 states/UTs:** Andaman and Nicobar Islands, Arunachal Pradesh, Assam, Chandigarh, Chhattisgarh, Dadra and Nagar Haveli and Daman and Diu, Goa, Himachal Pradesh, Jharkhand, Ladakh, Lakshadweep, Madhya Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Puducherry, Sikkim, Tamil Nadu, Tripura, Uttarakhand. These are archive gaps, not findings that plans do not exist.

## Known plans/references not verified online

The companion `India_Heat_Action_Plans_Unresolved.csv` contains 30 unresolved entries using the requested 16-column schema. Reasons include size limits, timeouts, 404/502 responses, unreadable scans, and an image masquerading as a download. Important gaps include Goa 2024; Himachal Pradesh 2024; Karnataka 2023-24; Odisha 2022; Rajasthan 2024; Tamil Nadu 2019 and its 2024 mitigation strategy; Uttar Pradesh 2024/2025; Delhi 2023 draft/2024; Jodhpur 2023; and Ahmedabad 2013/2015. These are not counted as verified documents.

**References with no usable document located:** the Chhattisgarh 2018 standalone HAP and Jharkhand standalone HAP are cited in a published state-HAP review, but its citations point to local Windows `file:///` paths rather than public downloads. These are leads, not usable archive links. CRAVIS/GHHIN also list city plans that may be under preparation; an announced or mapped plan is not counted as downloadable.

## Corrections that matter for reuse

- GHHIN's Andhra Pradesh item labelled 2024 downloads a document whose cover says **2016**.
- The Bhubaneswar IRADe document is labelled 2024 in the repository but has a **2020** copyright/imprint.
- The Ahmedabad file named `ahmedabad-heat-action-plan-2018.pdf` has **2019 UPDATE** on the cover; only one 2019 row is counted.
- Gonda's page labels one plan 2024-25, but the PDF cover says **2024**. The later Gonda and Banda plans are retained with `undated` where their printed cover year was not readable; repository years are disclosed in notes.
- The Rewari-hosted PDF is **Haryana state, 2017**, not a separate Rewari district plan.
- Several NCDC public advisories have a misleading PDF metadata title mentioning 2026. Their **printed 2023/2024/2025 advisory labels** distinguish the editions used here.
- Ananthapuramu's 2025 working draft and the incorporated May 2026 republication are distinct editions and are separately catalogued.

## Search coverage and remaining limits

Sources checked included NDMA/NIDM; the NCDC/NPCCHH national and 36-state/UT collection; SDMA/Revenue/Relief repositories and indexed documents; NIC/S3WaaS district repositories; municipal and partner documents; GHHIN; NRDC; IIPHG; CEEW/CRAVIS; IRADe; Mahila Housing Trust; PreventionWeb; OpenCity; and search results pointing to CPR/SFC/Climate Trends/WRI-related work. Search queries covered English, Hindi, and Marathi terms and included district, municipality, edition, `.gov.in`, `.nic.in`, and PDF filters. Regional-language coverage verified here is Hindi, Marathi, Malayalam, plus Telugu annexures; full Gujarati, Bengali, Tamil, Kannada, and Telugu editions remain important retrieval gaps.

The NDMA heat-wave landing page timed out. OpenCity returned 403. Several official portals timed out or supplied PDFs above research-fetch size limits. CRAVIS rendered 141 catalogue entries, including plans in preparation, but its download interaction used a browser-local protocol blocked in this environment; those entries were not added without independently verified documents. An observed Wayback snapshot for Ahmedabad's original failed retrieval. These failures are documented rather than converted to verified links. A systematic check of every municipal site and every historical edition remains unfinished; the archive should be treated as a reproducible first release.

## Downloader and validation

Run `python -m pip install requests`, then `python download_heat_action_plans.py India_Heat_Action_Plans_Verified.csv`. Output is `./heat_action_plans/<state_with_underscores>/<id>.pdf`.

The downloader uses a browser-like User-Agent, a 60-second timeout, an initial request plus three retries per URL, and a two-second pause after every request attempt. It tries primary, alternate, then archived URLs; verifies the exact `%PDF-` header; writes atomically; skips valid existing PDFs; removes partial failed files; and writes `failed_downloads.csv` plus a downloaded/failed/skipped summary. It does not treat HTML, consent screens, or document landing pages as PDFs.

Validation: all 113 IDs and primary URLs are unique; all rows have the exact 16 requested columns; source evidence maps are provided in `verification_audit.json`. The script passed syntax checking and a simulated-response test covering split PDF header chunks, invalid HTML rejection, all three retries, alternate and archive fallbacks, failure logging, and skip-on-rerun behavior. A live bulk download was not run: the command environment lacks `requests` and direct external network access is restricted. Verification counts come from document-content retrieval, not a bulk-download success claim.
