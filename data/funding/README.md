# Funding, opportunities and careers: data and maintenance

The records behind three connected views:

- **The funding landscape**, at `/heat-economy/money/#landscape`: who funds work relevant to extreme heat, through which programmes, and how they can be reached.
- **Open calls and tenders**, at `/heat-economy/money/opportunities/`: calls, requests for proposals, tenders, prizes, technical assistance and readiness windows, each with its own application arrangements.
- **Careers**, at `/heat-economy/money/careers/`: jobs, individual consultancies, research posts, funded PhDs, fellowships and internships.

`tools/build-funding.js` builds all three. `tools/funding-model.js` loads the data and attaches the source check. `heat-economy/funding-core.js` holds the rules shared by the build, the page script, the weekly harvest and `tools/check-funding.js`. `tools/funding-text.js` holds the words the pages and `llms-full.txt` share.

## Distinctions the data keeps

- A funder is not an open call, and a programme is not necessarily accepting applications. Organisations, programmes and opportunities are separate records, linked by id.
- A past award is not money available now. Past support is linked from a programme, never listed as an opportunity. It points to the existing award records (`research/2026-10/economy/deals.json`, `data/kb/funding.json`) or to Signals records.
- An announced fund is not necessarily operational (`operational`: `operational`, `announced`, `closed`).
- A procurement contract is not a grant. Equity and debt are not grants. `instrument` is always set.
- An individual consultancy (`consultancy-individual`) is not an organisational tender (`rfp`, `rfq`, `tender`, `eoi`, `consultancy-firm`).
- A fee-charging training course is not a funded fellowship (`pay`: `paid`, `unpaid`, `fee-charging`, `not-stated`).
- A programme budget is not a per-award amount (`amount.basis`: `per-award`, `per-year`, `programme-total`, `not-published`). Amounts keep their own currency; nothing is converted, and nothing is summed across kinds.

## Files

| File | What it holds |
|---|---|
| `organisations.json` | Funders, administrators, intermediaries and buyers. Fields: `id`, `name`, `aliases`, `type`, `website`, `remit` (geography and themes, as a fact with its source), `instruments`, `recipients`, `access` (routes), `programmes` (derived), `network_id` (the same organisation in the heat network), `investor_id` (the same organisation in the October 2026 investor research), `limits_note`, `core`, `sources`. |
| `programmes.json` | Programmes and funds. Fields: `org` (administrator), `donors`, `name`, `url`, `type`, `remit`, `instruments`, `recipients`, `geography`, `access` (routes), `access_note`, `relevance` (`explicit`, `related` or `potential`, with `why`), `topics`, `activities`, `operational`, `past_support`, `links` (`deals`, `kb`, `signals`), `limits_note`, `core`, `sources`. |
| `opportunities.json` | One record per round. The fields are in the table below. |
| `careers.json` | Fields: `title`, `employer`, `reference`, `role` (job, individual consultancy, research post, funded PhD, fellowship, internship, fee-charging training), `discipline`, `contribution` (one of five), `seniority`, `location`, `remote` (where remote work is allowed, as published), `work_authorisation` (only if published), `contract`, `salary` (only if published), `pay`, `deadlines`, `official_url`, `application_url`, `relevance` (direct or adjacent, with `why`), `stated_status`, `core`, `sources`. |
| `rejected.json` | Candidates examined and not published, each with the reason. |
| `registry.json` | Feeds and APIs the weekly harvest may read. |
| `candidates/` | The weekly review queue (`<date>.json`). |

Opportunity fields:

- **The record:** `id` (stable, one per round), `title`, `org`, `co_orgs`, `programme`, `round`, `reference`, `type`, `instrument`.
- **The call:** `purpose`, `relevance` (`label`, `why`), `eligibility` (`applicants`, `lead_countries`, `requires`, `text`), `geography` (`countries`, `text`), `partnership`.
- **Money and terms:** `amount` (`min`, `max`, `currency`, `basis`), `budget`, `duration`, `cofinancing`, `costs`.
- **Dates and stages:** `opens`, `deadlines` (one per stage: `stage`, `date`, `time`, `tz`, `wording`), `deadline_history`, `stages`.
- **Links and documents:** `official_url`, `application_url`, `documents`.
- **Status and checking:** `stated_status`, `rolling`, `withdrawn`, `conflict`.
- **Connections:** `topics`, `activities`, `core`, `sources`.

### Provenance

Every key fact is an object with `src` (a source key in `research/2026-11/funding-opportunities/sources.js`) and `term` (words that must appear on that page). `core` lists the `[source, term]` pairs a record needs before it is published.

The source check (`verify-sources.yml`, batch `2026-11-funding-opps`) confirms each term on the page or in its stored excerpts. A record whose core terms were not found is held back and named in the build output. A fact whose term was not found shows as "not confirmed".

Editorial readings (`relevance.why`, `note`) are kept apart from published facts and labelled as Common Shade's reading on the page.

## Status and freshness rules

Two statuses are computed, never typed: application status, and verification status. Both are computed at build time, and again in the reader's browser for the moment they read.

**Application status** (`applicationStatus` in `heat-economy/funding-core.js`):

1. Withdrawn, if the source says so.
2. Closed, once the first stage's deadline has passed:
   - With a time and a known time zone, at that exact moment. ET, PT and CET follow summer time.
   - With a date only, or a time without a zone, once that day has ended everywhere (after 23:59 at UTC−12).
3. Closed, if the source says applications are closed.
4. Upcoming, before a published opening date.
5. Unknown, if the source does not say applications have opened. A future deadline alone does not prove a call has opened.
6. Deadline day, on a deadline date with no published cut-off time, from the moment the day starts anywhere (00:00 at UTC+14). It never reads as a plain "open" through that day.
7. Rolling, only where the source says rolling. No deadline does not mean rolling.
8. Open, otherwise. "Open; no deadline published" is shown as such.

**Verification status** (`verificationStatus`):

- **Conflicting information:** sources disagree; the record carries `conflict`, saying what disagrees.
- **Source unavailable:** the official page did not open at the last check. Last-known facts are kept and the record is marked, never erased.
- **Not confirmed:** core facts were not found on the page.
- **Review due:** the last check is older than 14 days (opportunities and careers), 120 days (programmes) or 180 days (organisations).
- **Verified:** otherwise.

**Verified open** means an application status of open, rolling or deadline day, together with a verification status of verified. Nothing else counts in the "verified open" figures or the default view.

More edge cases:

- An annual programme never reopens by itself. A new round is a new record with its own id, and the old round stays in the archive.
- A deadline extension moves the earlier deadline into `deadline_history` with the date of the change, and the page says the deadline was extended.
- Each application stage has its own deadline. The first stage decides whether a new applicant can still apply.
- A countdown is shown only where the cut-off is exact. The source-check date is shown as "Source checked" in a record's details; the build date is never shown as a verification date.
- A page that opened is not proof that a call is open. A page that disappeared is not proof that a post was filled: the record becomes "source unavailable" until a person reviews it.

## Maintenance procedure

1. **Every Wednesday** (`.github/workflows/funding-weekly.yml`), the harvest reads `registry.json` and opens a review pull request listing:
   - candidates;
   - published records whose dates now change their status;
   - records due for review.

   Merge it once reviewed. Nothing reaches the site from it.
2. **For each candidate,** find the primary page; an aggregator, newsletter or social post is discovery only.
   - If it is relevant and primary: add the source to `sources.js` with the terms its facts rest on, write the record, then run `node research/2026-11/funding-opportunities/stage.js` and `verify-sources.yml` (month `2026-11-funding-opps`).
   - Otherwise: set `decision` to `reject` with a reason, and add it to `rejected.json` if it was a serious candidate.
3. **Weekly for open records:** re-run `verify-sources.yml` on the batch, so every open, upcoming or rolling record gets a fresh check date.
   - Change a deadline or amount only from the official page.
   - Move the old deadline into `deadline_history`.
4. **Quarterly** for programme and organisation profiles. A profile past its review date shows "review due".
5. **Historical awards** keep their provenance. Correct them through `/corrections/`.

Dry run: `node tools/funding-harvest.js --dry-run` prints added, changed, expired, review-due and rejected counts and writes nothing.

`node tools/check-funding.js` tests the rules, the data and the pages. It is part of `node tools/check-all.js`.

The October 2026 programme list (24 accelerators, prizes and challenges) was audited with this batch. `research/2026-11/funding-opportunities/legacy-audit.json` says whether each page still opened and what words it showed, and it labels the Global Cooling Prize as a completed competition. The legacy records themselves are unchanged.

Feeds that failed are listed under `removed` in `registry.json`, and `probe_result` records the November 2026 test of 145 guessed job boards. `node tools/funding-harvest.js --probe` (or the workflow's `probe` input) tests the boards in `registry.probe`. The NUS career-site RSS and the World Bank procurement API return relevant items. The UN Careers importer reads the portal's public job data, but its search returned only a few items in its first runs, and its request format may need adjusting. UN Careers job pages are JavaScript-only, so a UN posting is checked against its public data URL (`careers.un.org/api/public/opening/jo/<id>/en`), not the page. ReliefWeb jobs need the approved app name, stored as the `RELIEFWEB_APPNAME` secret.

The site takes no submissions through these pages. Suggestions go through `/corrections/` and the join form, and a person reviews them.
