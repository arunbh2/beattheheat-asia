# Running costs in the region's heat plans, November 2026

Bangkok's financing strategy found that the city generally has money to build, but running costs are not always covered. This batch asks whether other heat plans in the region show the same gap. It reads six documents the site already cites.

## How it was done

The plan PDFs could not be opened from the session, so the batch ran in two reading passes on GitHub:
1. **First pass:** `probe.js` staged each document with probe words (budget, maintenance, recurring and the like). `verify-sources.yml` saved the passages around those words to `_excerpts.json`.
2. **Second pass:** `data/inbox/2026-11-heat-plan-running-costs-2` went back to two Bangladesh plans, whose first passages had stopped at their contents pages.

Claims were written only from those passages (`claims.json`) and checked by `gate.js` against the same results. `apply.js` makes exact edits and refuses any claim that is not confirmed.

Two rules held throughout:
- Where a table's text came out jumbled (Narayanganj's cost tables), no figure is tied to a row.
- No document is said to lack something, because only passages were read.

## What was found

All four claims were confirmed.

| Claim | Where it went |
|---|---|
| A 2023 review of 37 Indian heat action plans found them underfunded: only two cited specific sources of finance | The "Heat protection underfunded" node on the map |
| Narayanganj's plan (2025) costs each short-term action and names potential funders, often development partners and NGOs | Bangladesh snapshot, public budgets |
| Narayanganj counts daily users of its cooling centres as an indicator | An example on the cooling centres lever |
| Bangladesh's Health National Adaptation Plan 2026 needs about US$1.4 billion over five years and looks to a climate fiscal framework and international climate funds | Bangladesh snapshot, public budgets |

## What it says about the pattern

Bangkok is the only city whose own documents say plainly that running costs are not always covered. Elsewhere the passages show something nearby:
- Plans name costs and potential funders, but not budgets that recur each season.
- In India, few plans name any source of finance at all.

The evidence supports "plans are costed or hoped for, rather than budgeted". It does not yet support "running costs are the gap everywhere".

## Left out

| Document | Why it was left out |
|---|---|
| Ahmedabad's plan (2019) | It lists "provision of funds for heat wave management" as a task. The passages show no amounts, and nothing was claimed. |
| Practical Action's Khulna brief | The page is a summary, and its passages hold nothing on money. |
