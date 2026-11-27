# Content audit: health and gender equity (27 November 2026)

Scope: the parts of the site the two owner briefs name. Read in source and in the built pages.

## What exists and the conventions to extend
| Area | Where | What is there now | Extend, not duplicate |
|---|---|---|---|
| Factory heat | `tools/factory-heat-text.js`, `/factory-heat/` | Intervention cards with `addresses, how, where, works, caution, upfront, recurrent, owners, voice, equity, ev, gap, measure, pair` | Add a usability module to the card schema; fix `buddy` and adjacent cards |
| Plan a response | `/plan/` (hand-built page, `script.js` "PLAN A RESPONSE", plan in localStorage `bth-plan-v1`, printable brief) | Step 6 "Check it against WHO's eight core elements" (WHO/Europe 2026 guidance), then "Before the plan is finished: four questions" | Add the equity check after the WHO check, in the same plan object, normaliser and printable brief |
| Solutions library | `research/2026-10/*_solutions.json`, `tools/build-solutions.js` | 131 records (52 passive, 37 active, 42 policy). Every record has `equity_and_risks` (text plus sources), `works_if`, `stops_it`, `who_acts`, `who_pays`, `lifespan_and_upkeep`, `uncertainty`; 37 active records carry `equity_screening` (due-diligence checks, "not findings of harm") | Equity and access filters and a per-card usability panel derived from these fields, with "Not assessed" where they are silent |
| India HAP archive | `research/india-hap-archive/India_HAP_Combined_Verified.json` (147 verified records), `tools/build-hap-archive.js` | Catalogue only; `scoring-plan.md` says scoring is planned, not started; no PDFs or extracted text in the repository | A separate, transparent provision-review layer on a defined initial set; everything else "Not assessed"; no scores or ranking |
| Funding | `data/funding/` (32 programmes, 11 calls, 10 careers), `tools/funding-model.js` | Source-checked facts per record; access, recipients, geography, instruments | A "Health and equity reach" panel from checked fields; unknowns stated |
| Signals | `data/site/signals.json` (32 records), `tools/signals-model.js` | Commitments tracked deliverable by deliverable with derived evidence states | Reach panel kept apart from funding; policy is not funded action |
| Who is at risk | `/who-is-at-risk/`, `/intersections/`, `/social-protection/`, `/cotton-and-heat/` | Barriers, intersections note and game, social protection by country, cotton value chain | Link from the new flagships rather than restate |
| Systems map | `data.js` LOOPS (21) and LEVERS (33, with `watch` side effects and sources) | Cycles `poverty`, `sleep`, `energypoverty`, `clinic`, `protection`; levers `heatrules`, `heatcash`, `coolhousing`, `coolingcentres`, `maternalheat`, `childwater`, `readyclinics` | Reuse; the new pages link to them, nothing re-coded |

## Material to improve
1. Factory card `buddy`: "upfront: None", "recurrent: None", no cautions, no source. CCOHS recommends a buddy system as practice; no evaluation in factories is on the page. Training time, pairing, language, privacy, escalation, response duty and who carries the caring work are missing.
2. Factory card `first-response`: no checked first-aid source on the page (it says so). `acclimatise` gives "upfront: None".
3. Solutions: the 94 passive and policy records have no `equity_screening`; fairness text is free prose, so filters must say which field matched.

## To consolidate
- Pregnancy content sits in the factory page, the gap-lenses research and `maternalheat`; a connected-settings section links them rather than repeating them.

## Genuine gaps
- Home-based work as a setting where earning, cooking, care and sleep share one hot room.
- Care continuity when a service closes, and who takes on the work.
- Rest without losing income across vendors, day-wage, home-based and agricultural work.
- A plan-level equity check; a provision review of heat action plans; reach fields for money and commitments.

## Claims needing stronger sourcing
- `buddy`, `first-response` and `acclimatise` costs ("None"); first-aid procedure (do not write one from general knowledge).

## Routes and anchors to keep
`/factory-heat/` and `#rec-buddy` (all `#rec-*`), `/plan/#plan-step-6`, `/solutions/` card anchors, `/resources/heat-action-plans/india/`, `/heat-economy/money/` anchors (`#landscape`, `#needs`, `#where`, `#investors`, `#programmes`, `#deals`), `/signals/` record anchors.
