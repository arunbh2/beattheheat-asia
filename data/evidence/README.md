# The weekly evidence review

New studies reach the Evidence map (`/evidence-map/`) through a weekly cycle. It is free and needs no keys or paid services. A person signs off every study before it counts.

1. **Harvest (automatic, Mondays).** `.github/workflows/evidence-weekly.yml` runs `tools/living-evidence/harvest.js`. It asks these open services for studies from the past eight days:
   - Europe PMC (with PubMed and preprints)
   - Crossref (with SSRN, World Bank and ADB papers by their DOI prefixes)
   - arXiv
   - OpenAlex (with university repositories)
   - the World Bank document library
   - WHO IRIS
   - every paper listed on /news/ (`feeds/archive.json`), with its abstract fetched from Europe PMC by DOI; a paper whose abstract cannot be found stays unscreened and is tried again the next week

   A service that does not answer is noted in the queue, and the harvest carries on. `tools/news-status.js` then marks each paper on /news/ as on the Evidence map, in review, screened and set aside, or not yet screened (`feeds/status.json`).
2. **Screen and pre-fill (automatic).** `tools/living-evidence/extract.js` keeps studies that meet three tests:
   - they are about heat and health, passive cooling or heat finance
   - they name a South or Southeast Asian setting
   - they show signs of new data

   It then copies the following from the title and abstract, each with the sentence it came from: sample size, places, climate zone, effect size (°C, %, or a risk ratio), unit cost, failure modes and study design. It never infers. A field the abstract does not state stays empty. It also suggests up to three cycles by keyword.
3. **Queue (automatic).** The week's candidates are written to `inbox/<YYYY>-W<ww>.json` (studies reviewed as a named batch in a session use `inbox/<YYYY>-<MM>-<name>.json`, such as `2026-11-gap-lenses.json`) and a pull request is opened. Abstracts stay in that run's log, not in the repository. `seen.json` stops a study from being queued twice.
4. **Review (a person).** For each candidate, open the study and set `decision`:
   - `reject`, with an optional `review.note`
   - `accept`, completing `review`:
     - `cycle`: one or more cycle ids from `data/core/LOOPS.json`, such as `cooling` or `clinic`
     - `finding`: one or two sentences in your own words, in the site's voice (no "should" or "must", no em dashes, no blame)
     - `grade`: `peer`, `preprint`, `official`, `model` or `other`
     - `where`: the place, as the study states it
     - optional: `sample_size`, `effect_size`, `unit_cost`, `agro_climatic_zone`, `failure_modes`, `limit`

     Use a suggested value only after checking it against the study.
   - `pending`, to decide later

   `node tools/living-evidence/check.js` (also run on the pull request) fails if an accepted study is missing anything.
5. **Sign-off.** Merging the pull request is the sign-off, and the history records who approved what. Merge even when some studies are still pending, so they are marked as seen.
6. **Publish (automatic).** The next build (`node tools/build-static.js`) adds each accepted study to its cycle on the Evidence map. The squares and counts update, the extracted fields are shown with the study, and the "weekly evidence review" section lists the latest additions. Reviewer names never appear on the site.

## What it does not do

- It does not decide whether a cycle is "well established" or "emerging". That stays a reviewer's call in `data/core/LOOPS.json`.
- It is not exhaustive:
  - ADB, SSRN and university repositories are reached through Crossref and OpenAlex, not directly.
  - Abstracts in languages other than English, and studies without an abstract, are often missed.
- Deeper reading, of full texts or tables, happens in a Claude Code session during the monthly update. No paid AI service is called. See `.claude/commands/monthly-heat-update.md`.
