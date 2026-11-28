# Living Knowledge data

Build-only records behind `/living-knowledge/` ("Living Knowledge: Local Practices for Heat Resilience"). Do not edit these JSON files by hand: they are written by `research/2026-11/living-knowledge/assemble.js` from the hand-written `records.js` (practices and claims) and `sources.js` (sources and studies).

| File | One record per | Key fields |
|---|---|---|
| `practices.json` | practice | `id` (stable slug), `title`, `summary`, `description`, `mechanism` (kept apart from the description), `domain`, `category` (indigenous, traditional, vernacular, local) with `category_basis`, `local_names` (name, language, note), `places` (country, place, precision; never a household), `climates`, `settings`, `benefits`, `uncertain`, `fails_when`, `contraindications`, `requires` (space, tenure, materials, skills, services), `cost` (null when not reported), `labour`, `water`, `energy`, `equity`, `who` (decides, pays, maintains, benefits), `evaluation`, `links` (solutions library ids, pages), `fit` (humidity, water, control, setting), `claims` (ids), `status`, `review` (substantive date, community and expert review), `rights`, `restricted_advice` (documented remedies, kept out of guidance) |
| `claims.json` | claim | `id`, `practice`, `text`, `status` (reported, observed, measured, modelled, policy, guidance, interpretation), `outcome`, `terms` (source id and the exact words), `locator`, `quant` (value, unit, comparator, period, setting), `restriction`, `sources` |
| `sources.json` | underlying study | citation, DOI, PMID, PMCID, `url` (for readers), `check_url` (what the source check reads), `copies` (other hosted copies, never counted again), dates (published, issue, fieldwork), design, site, climate, sample, outcomes, limits, access, licence, funding, conflicts, corrections, `expect` (terms staged for the check) |

## Rules
- A claim is confirmed only when every term it rests on was found by `verify-sources.yml` (batch `2026-11-living-knowledge`). A practice is public only when it is `published` and every claim is confirmed (`tools/living-knowledge.js`). Anything else is held back and never reaches pages, `practices.json`, search, feeds or `llms-full.txt`.
- Keep what people report, what researchers observed or measured, what a plan says, official guidance and an author's interpretation apart (`status`). Never turn a reported remedy into advice.
- A number needs its unit, comparator, period and setting. A cooler surface is not a cooler room; a cooler room is not fewer illnesses.
- Call a practice Indigenous only where a source identifies the knowledge holders as Indigenous peoples.
- No household or precise location, even if a source gives one.
- Three dates stay apart: when sources were last read by the check (from `_excerpts.json`), when text was edited (git), and the substantive review date (`review.substantive`). A link check never moves the review date.

## Adding or correcting a record
1. Read the source. Add it to `sources.js` (or add a copy to an existing study's `copies`) with the exact terms your claims rest on.
2. Add or edit the practice and its claims in `records.js`.
3. `node research/2026-11/living-knowledge/assemble.js` (refuses broken references), `node research/2026-11/living-knowledge/stage.js`, then run `verify-sources.yml` with month `2026-11-living-knowledge`.
4. `node tools/build-static.js`; `node tools/check-living-knowledge.js`.

Research files: `research/2026-11/living-knowledge/` (protocol, search log, screening, appraisal of seed sources, blocked-source register, rights, progress and handover).
