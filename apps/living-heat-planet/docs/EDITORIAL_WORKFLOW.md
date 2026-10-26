# Editorial workflow for non-weather claims

Everything beyond live weather (plans, agencies, thresholds, vulnerable groups, interventions, projects, funding) is a **curated record**. Nothing is generated, scraped or inferred into the public view.

## States
`draft → in_review → (changes_requested ↔ in_review) → approved → published`, with `withdrawn` at any time. Only **published** records with status `verified` reach the API (`buildProfile` filters for this). Each transition is a `ReviewEvent` (who, when, from, to, note), kept as an audit trail.

## A record must have
- A public source URL, with its publication date and the date someone checked it (`verifiedAt`).
- A named reviewer who is not the author. AI may draft a summary; it may not approve or publish one.
- For actions: maturity (idea, proposed, pilot, operational, evaluated) and evidence strength.
- For opportunities: owner, project state, instrument (grant, concessional, guarantee, public budget, earned revenue), funding range only if the owner approved its publication, last check date and next check date.

## Wording rules
- "No verified record in the platform" is never a claim that something does not exist.
- A thematic fit is not a partnership. Write "prospective alignment" unless the parties have confirmed it.
- Keep income secured, capital mobilised and capital influenced separate. Never total them.
- No individual or household locations; aggregate anything sensitive.

## Import
Add rows to `data/templates/*.csv` (columns match the types in `src/lib/contracts.ts`). A reviewer converts approved rows into `src/data/registry.json` with `status: "verified"`. Corrections follow the same path, and the old record is set to `withdrawn`, not deleted.
