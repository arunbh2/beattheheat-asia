# Ledger: the Philippines' October 2026 labour advisories on heat

Each claim below reaches the site only when its source passed the check with every term it rests on found. Terms marked *probe* settle open points from their excerpts; they are not claims. Batch: `data/inbox/2026-11-ph-labor-advisories/` (staged by `stage.js`).

## Claims and the terms they rest on
| Claim | Source that decides | Terms |
|---|---|---|
| The Department issued Labor Advisory No. 20, s. 2026, on heat stress | `phla-dole-news` (original: the issuing agency's release), `phla-bwc-list` | "Labor Advisory No. 20", "heat stress" |
| Labor Advisory No. 19 covers compensability under the Employees' Compensation Program | `phla-bwc-list` | "Labor Advisory No. 19", "Compensability" |
| Employers assess heat risk (HIRAC) and follow PAGASA heat index forecasts | `phla-dole-news` now; `phla-la20` in pass 2 | "HIRAC", "PAGASA", "heat index" |
| Duties step up with the heat index, with flexible work at higher levels | `phla-la20` (pass 2); the release only for "the Department says" | "heat index", "flexible work" |
| Which further conditions are compensable | `phla-la19` only (pass 2) | "rhabdomyolysis", "syncope"; *probe* "Compensation Commission", "increased risk" |
| Whether Labor Advisory No. 20 replaces the 2023 advisory | `phla-la20` only (pass 2) | *probe* "Series of 2023", "repeal", "supersede" |

## The open conflict on Labor Advisory No. 19
News reports differ. Some say five further conditions (heat syncope, heat rash, rhabdomyolysis, dehydration-related kidney injury and heat-related neurological disorders) are now compensable; one says they were referred for review and depend on a later policy. **Only the advisory's own text decides.** Until it is read, the site says nothing on the five conditions beyond: "Whether further conditions are compensable or under review: reports differ; the advisory text was not read."

## Not staged, and why
- A workplace-safety vendor's guide that prompted this work: not a source; not named or cited.
- Two explainer sites found by search: leads only; their claims conflict with each other.
- PAGASA's heat index page: staged only once its exact URL is in hand.

## Decisions (16 November 2026, recommended by the advisory review and taken by Claude for the owner's approval)
1. **Official links.** Claude names the pages and GitHub's source check reads them. DOLE's sites turn away automated requests (a bot check), so the two advisory PDF links come from the owner, copied from the Bureau of Working Conditions' issuances page in a browser, for pass 2. No PDF link is guessed. The check falls back to an archived copy where a page is blocked.
2. **Philippines social protection.** Do it, as its own pull request in the existing `2026-11-social-protection` batch, once Labor Advisory No. 19 has been read (the Employees' Compensation record depends on it) and at least eight public schemes each have an official page. Until then it is held, with the candidate scheme list in this folder's notes.
3. **The 2023 line on the paid rest breaks card.** In scope, on one condition: it changes only if the read text of Labor Advisory No. 20 names the 2023 advisory as replaced. Then the sentence is edited in place with the document's own verb, its source is kept, and the 2026 advisory is added as a new example. If the text is silent, the line stays: it is true as dated.

## Candidate schemes for a Philippines file (to verify; none is a claim yet)
SSS sickness benefit; Employees' Compensation (SSS and GSIS); SSS unemployment benefit; PhilHealth; Pantawid Pamilyang Pilipino Program (4Ps); TUPAD emergency employment; DSWD Assistance to Individuals in Crisis Situations (AICS); Social Pension for Indigent Senior Citizens; PCIC crop insurance; a food programme; local calamity or quick response funds, including El Nino aid.
