# The Philippines' October 2026 labour advisories on heat: plan

Status: proposed, not started. Nothing below is published until the advisory texts pass the source check. A secondary summary of the advisories was the prompt for this plan; it is not a source and is not cited anywhere.

## What the site already holds
- **Signals.** `sig-philippines-heat-stress-advisories-2026` has two deliverables (`d-guidelines`, `d-compensation`), each with an `adopted` milestone sourced only to Daily Tribune reports. Both name "the advisory text itself: not located" as unknown.
- **State of the field.** The November 2026 edition (sealed) carries the development `philippines-guidelines`, headed "as reported", and says the texts, coverage and effective dates were not located.
- **The policy brief.** `/briefs/heat-ready-social-security/` cites `ph-dole-guide` and `ph-dole-comp`, both from its own inbox.
- **The four heat index levels.** Caution 27-32 °C, extreme caution 33-41 °C, danger 42-51 °C and extreme danger 52 °C or more are in `PLAN_TRIGGER_BASES.json` (id `index`, sourced to GMA News) and in `LIVE_LEVELS.json`.
- **The glossary.** It has "Heat index".

## The gap, in order of value
1. **An evidence upgrade.** The records move from "reported by secondary sources" to "checked against an original", which closes the unknowns the site itself names.
2. **A worked example of duties that step up at public warning levels.** This is useful in `/plan/`. Nothing on the site yet ties a warning level to a workplace duty in a heat index country.
3. **Compensation for heat illness as social protection.** The site has no Philippines social-protection file yet.
4. **A caveat to carry with points 2 and 3.** The heat index and WBGT are different measures, so the numbers are not comparable with Singapore's.

## Steps (each a small pull request, the owner approving each)
0. **Stage the sources.**
   - Use `data/inbox/2026-11-ph-labor-advisories/`, staged by `stage.js` here with a claims ledger, then run `verify-sources.yml` (`month: 2026-11-ph-labor-advisories`).
   - Sources:
     - Labor Advisory No. 20, s. 2026
     - Labor Advisory No. 19, s. 2026
     - PAGASA's heat index page
     - only if used: PAGASA's El Niño advisory, the Employees' Compensation Commission's material, and RA 11058
   - A person locates the official URLs; none are guessed. If a PDF is a scanned image, fall back to DOLE, Official Gazette or PNA/PIA text, labelled secondary, and keep the detailed claims out.
1. **Signals.**
   - Add the advisories as original sources and keep the news sources.
   - Correct dates only as printed (signed, issued and effective are different things); add an `effective` milestone only if the text gives one.
   - Refine the deliverables: risk assessment (HIRAC), duties by heat index level, 24-hour reporting of serious incidents, and the list of compensable conditions.
   - Use `signals-review.js propose` and `apply`, then `signals-sync.js`. Delivery and claims stay "not verified".
2. **Trigger basis and levers.**
   - `PLAN_TRIGGER_BASES` `index`: add one sentence tying the levels to workplace duties, plus the WBGT caveat and the PAGASA source beside GMA.
   - `heatrules`: add one worked example. A "watch" is added only if the advisory's own words support it.
   - `heatcash` is not changed: employment-injury compensation is a different mechanism from a payout.
   - `work:breaks` names a 2023 advisory: update it only if Labor Advisory 20 supersedes it, and only if the owner asks.
3. **Social protection.**
   - A Philippines country file, only through the documented route (`research/2026-11/social-protection/`, `convert.js`). This is a research task for the owner to commission, or to hold.
   - The policy brief changes only by staging the advisories in its own inbox.
4. **State of the field, December 2026.**
   - A draft development, "the advisory texts, read": happened in October, reviewed in December, with `why_here`.
   - The sealed November edition is never edited.

## Pre-mortem
- **Legal force.** Use the document's own verbs. An advisory may guide rather than bind, and "employers must" appears only when describing the text, never in the site's own voice.
- **Dates and compliance.** No compliance, enforcement or claims-paid language, and an effective date passing proves nothing.
- **No ranking.** No "stricter than" or "first in the region" framing.
- **Conflicting numbers.** If the advisory's bands differ from the GMA-sourced levels already published, stop and ask; a `/corrections/` entry may be needed.
- **Forecasts.** The El Niño outlook is a forecast: date it and attribute it.
- **No names.** No individuals, and no vendor.
- **No hand edits.** Derived Signals fields and counts are never typed by hand.

## Decisions for the owner
1. Commission the whole-country social-protection research for the Philippines, or hold step 3?
2. Is the 2023 line in `work:breaks` in scope?
3. Who locates the official URLs for the advisories?
