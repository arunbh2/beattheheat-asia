# Signals rebuild (November 2026): baseline and result

Measured locally with Playwright on the built page (fonts and live-data calls blocked), before and after this change.

| Measure | Before | After |
|---|---|---|
| What a commitment shows | one rung of five, with earlier rungs filled in | each deliverable separately: the steps it has evidence for, the rest in words |
| Deliverables tracked | 15 commitments, one status each | 22 deliverables in 15 commitments |
| Evidence per milestone | sources listed per record | each source's type, what it establishes, and whether the content check confirmed it |
| Records resting on secondary reports or unchecked pages | not distinguished | marked (overview: 5 deliverables rest on secondary reports only, 1 is not verified by a content check) |
| Future effective date | shown as adopted | scheduled, with "reaching this date will not show compliance" |
| Ways to find a record | scroll 26 cards | search, 7 filters, 4 views, all kept in the URL |
| Take-away | none | print briefing, text download of the filtered view, stable links to records, deliverables and milestones |
| Interactive controls | 0 | 71 |
| Internal and external links | 97 | 200 |
| HTML, gzip | 31.8 KB | 41.9 KB, plus 4.0 KB of deferred script |
| Script errors | 0 | 0 |

| Width | Height before | Height after | DOM content loaded before (ms) | after (ms) |
|---|---|---|---|---|
| 320px | 29,832 | 23,816 | 176 | 137 |
| 390px | 26,040 | 22,650 | 145 | 99 |
| 768px | 19,665 | 20,273 | 167 | 105 |
| 1440px | 12,136 | 12,562 | 145 | 117 |

A filter change takes about 2 ms in the browser test. The heights include every record's folded evidence; with filters most readers see far less.

Edge cases with no real record yet (mixed and negative evaluations, supersession, a correction, weak evidence) are tested on fixtures in `tools/check-signals.js`; none was invented as published data. `migrate.py` re-described the existing records from their own text and the check records; it adds no new claim.
