# State of the field: rebuild, November 2026

The brief: make /whats-new/ the monthly briefing that helps someone working on heat resilience see what deserves attention, what changed, what the evidence establishes, how Common Shade reads it, which decisions it could affect and what to watch, with dates, sources and corrections a reader can inspect.

## What was there
- **Page:** /whats-new/ rendered one JSON file per month (`data/site/briefs/2026-10.json`: a headline and four sections, each with a label, heading, paragraph and links) as nested cards, then a log of knowledge-base changes.
- **Editions:** one, October 2026, published 31 October 2026. There was no stable link per edition, no reporting period or evidence cut-off, no sources on the page, no revision history and no export.

## What the review found in the October edition
- **The Narayanganj plan's date.** The edition listed Bangladesh's first urban heatwave action plan among October's records. The plan itself records its approval by Narayanganj City Corporation on 22 September 2025 (Signals record `sig-narayanganj-hap`; the date was read from the plan's front matter, while the automated check confirmed other terms in its text). October 2026 is when Bangladesh's heat and health assessment reported it. This is now a correction in the edition and on /corrections/.
- **"Two announcements this year".** One was from 20 February 2026, first reviewed by Common Shade in October. The revised edition says so, and says that two announcements are not evidence of a regional trend.
- **A broken anchor.** The link `/who-holds-it/#heatrules` pointed to an anchor that does not exist. The revised edition links `/actions/#heatrules` and `/who-holds-it/`, and the new check tests every link in an edition.
- **A typed count.** "Six solutions" was a count typed into the text. The revised text describes the solutions without one, and the evidence map shows the current figure.
- **A funder named in an evidence brief.** The first text names a funder that the house rules keep out of evidence briefs. The revised text says "two philanthropic foundations" and points to the funding record, which keeps every funder. The first text is kept unchanged, folded under "The text as first published", for the owner to decide on.

## Measured before and after (local build; fonts could not load in the test browser)
| | Before | After |
|---|---|---|
| Gzip HTML, /whats-new/ | 22.7 KB | 29.8 KB, plus a 1.3 KB deferred script |
| Weight before scrolling (check-weight) | 99 KB | 113 KB (recorded) |
| Page height at 390 px | 5,465 px | 12,872 px (the edition in full; evidence folded) |
| Visible words, whole page | 863 | 2,282 (reading core about 1,280; the rest is sources, revisions and the site menu) |
| Links / controls | 148 / 23 | 206 / 33 |
| Per-edition stable pages | none | /whats-new/2026-10/, with briefing.md |
| Dates shown per edition | month label | reporting period, cut-off, published, revised; for each development, when it happened and when it was reviewed |
| Sources shown | none | each claim: source, date, type, what it establishes and does not, the check state at the edition, and any later change to its record |

## The model
- **Edition files.** `data/site/briefs/<YYYY-MM>.json` (schema 2) holds a published edition; drafts live in `drafts/`, are never written to the tracked site and are not served (`_config.yml`). The ledger, `_ledger.json`, seals each published edition's hash at its latest revision.
- **Code.** `tools/sof-model.js` (rules, dates, snapshots, hashing), `tools/sof-text.js` (words shared by the page, the briefing and llms-full.txt), `tools/build-sof.js` (pages), `whats-new/sof.js` (copy, print, share), `tools/sof-review.js` (new, snapshot, check, publish, seal) and `tools/check-sof.js` (the check).
- **Independent review.** An advisory review of the plan changed the following:
  - the November argument was narrowed to the one rule confirmed against an original source
  - "scheduled to take effect" is used for future dates
  - a reason is required for anything outside the period
  - the search scope is required for any "not found" claim
  - the hash ledger was added
  - previews were moved to a git-ignored folder
  - the roles are kept generic

## November 2026
A draft (`data/site/briefs/drafts/2026-11.json`, cut-off 15 November 2026) awaits the owner's review. It rests on:
- one rule checked against its original source (Singapore, scheduled to take effect on 1 December 2026)
- guidelines known only from news reports (the Philippines; the advisory texts were not located)
- a survey reported by a ministry (Viet Nam)

It revisits October's question honestly: no new evidence by the cut-off.
