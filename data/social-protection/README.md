# Social protection and heat: one file per country

These files feed /social-protection/ ("Who could help a household through a hot season"), its section of
llms-full.txt and /sources/. `tools/data-blocks.js` reads every `<country>.json` here as the build-only block
`SOCIAL_PROTECTION`, so visitors never download it with data.js; the page carries only what it shows.
`node tools/build-data.js --check` checks every file and names the record and the fix.

**Add a country** without touching code: save its research reply (sections A to K) as
`research/2026-11/social-protection/<country>.md`, add its ISO code to `CODES` in `convert.js`, then run
`stage.js`, `verify-sources.yml` (batch `2026-11-social-protection`) and `convert.js`. Only what the source check
confirmed reaches these files; the rest is listed in `research/2026-11/social-protection/dropped-after-check.json`.

Households appear in aggregate only. Nothing here identifies a person or a household.

## Fields

`country`
- `id` ISO 3166 alpha-2, lower case (`in`); `slug` (`india`); `name`
- `as_of` the research reference date (YYYY-MM-DD); `checked` the date the sources were checked
- `unit_note` how the country's first administrative level is named, where it is not "state"
- `summary`, `gaps` lists of `{ text, sources }`; `gaps` are what no public system in the checked set covers
- `map` `{ rows: [[element, text]], misreadings: [text] }`: a minimum first map, and how a map could mislead
- `questions` `{ id, q, have, could, scale }`: open questions (sizes are illustrative, not power calculations)

`schemes` one public scheme each
- `id` `<country>-<name>` (stable, never renumbered); `level` national or state; `name`; `type` one of cash, pension,
  food, public-works, credit, health, insurance, welfare-fund, relief, livelihood
- `run_by`, `who` (who is eligible), `gives` (quoted as the source states it, with the year), `delivery`, `documents`,
  `speed`, `heat_relevance`: plain text, or `null` when the check did not confirm it (the page says so)
- `portable` and `shock_responsive`: yes, partly, no or unknown (unknown is not no)
- `status` current, changed, closed or unclear; `status_as_of` the date it applies to
- `grade` KNOWN, INFERRED or UNCERTAIN (the claim's grade, shown as wording); `situations` the finder's tags (below)
- `sources` `[{ label, url }]`

`ladder` measured steps of access: `scheme` (an id, or empty when the finding covers several, with `scheme_note`),
`group`, `step` (aware, eligible, documented, applied, enrolled, received, adequate, on time), `finding` with its own
unit and denominator, `grade`, `limit`, `sources`. Findings come from different studies; they are not one funnel.

`evidence` heat and social protection studies: `by`, `title`, `url`, `type`, `where`, `scale`, `finding`, `effect`,
`limit`, `sources`.

`routes` delivery routes and organisations, unranked: `id`, `name`, `kind`, `does`, `where`, `self_reported` (what it
says about itself), `independent` and `evaluations` (what others found), `url`, `org_id` (its heat network record in
data/core/ORGANISATIONS.json, if any), `sources`.

`indicators` what a map could use: `id`, `layer`, `indicator`, `definition`, `unit`, `unit_of_place`, `year`,
`publisher`, `url`, `licence`, `open` (an open reuse licence is stated), `joinable` (it carries a shared place code),
`access`, `format`, `update`, `place_code`, `limit`.

## Situations (the finder's tags)

Derived in `convert.js` from a scheme's type and words, as a reader's situation, never an eligibility rule:
`work` lost work or earnings · `health` illness or hospital costs · `older` older age · `disability` · `farm` farming or
fishing · `moved` moved for work · `food` · `disaster` after a disaster · `income` income support.
