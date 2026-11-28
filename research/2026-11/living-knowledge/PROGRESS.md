# Living Knowledge: implementation progress and handover

Read this first in a later session. Brief: the consolidated prompt the owner supplied on 28 November 2026 (Common Shade Living Knowledge).

## Architecture note
- **Route:** `/living-knowledge/` (no existing section covers local practices; the solutions library covers engineered and passive solutions, and Living Knowledge links to its records rather than repeating their performance claims).
- **Data (build-only):** `data/living-knowledge/practices.json`, `claims.json`, `sources.json`, written by `research/2026-11/living-knowledge/assemble.js` from hand-written `records.js` and `sources.js`. Three linked record types: practices, claims, sources.
- **Evidence gate:** a claim is confirmed when every term it rests on was found by `verify-sources.yml` (batch `2026-11-living-knowledge`); a practice is public only when all its claims are confirmed. Draft or unconfirmed records never reach public JSON, search, feeds or llms text.
- **Code:** `tools/living-knowledge.js` (load, gate, validate, coverage), `living-knowledge/lk-core.js` (filters, fit rules, comparison; shared by build, page and check), `tools/living-knowledge-text.js` (words shared with llms-full.txt), `tools/build-living-knowledge.js` (pages), `living-knowledge/lk.js` (page script), `living-knowledge/lk.css`, `tools/check-living-knowledge.js` and `tools/check-living-knowledge-ui.js`.
- **Reused:** page template, shared header and footer, share panel and systems-map preview, cs-card / cs-note shapes, the source-check pipeline, the solutions library ids.

## Decisions
- Called a targeted evidence scan, never a systematic review.
- No practice classed as Indigenous in this edition: no source identified knowledge holders as Indigenous peoples (see rights.md).
- Stakeholder guidance: per-domain editorial guidance labelled "Common Shade's suggestion", plus guidance that a source itself gives, labelled with the source.
- Health: remedies documented and kept out of guidance; infant feeding follows UNICEF and a systematic review; no emergency advice beyond pointing to official guidance.
- The speaker attribution in the brief was not verified and is omitted (appraisal.md).

## Done
- Seed sources retrieved and appraised (appraisal.md); attribution checked (unresolved).
- Logged searches (search-log.json), screening (screening.json), blocked register (blocked.json), protocol and rights.
- 28 sources, 25 practices, 53 claims staged; verify-sources.yml run on 28 November 2026.

## Pending (update as you go)
- Gate results from the source check; build pages, integrations, checks, docs; pull request (no merge without the owner).

## Refresh
`node research/2026-11/living-knowledge/search.js --since <date>` adds a dated run to search-log.json; screen it into screening.json; add sources and records by hand; `assemble.js`, `stage.js`, `verify-sources.yml`. `.github/workflows/living-knowledge-refresh.yml` runs the search monthly and opens a review pull request; nothing is published from it.
