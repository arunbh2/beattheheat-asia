# Heat network: research and build files

The plan is in `BUILD_BRIEF.md`. This is where it stands on 14 November 2026.

## Done
- **Step 1, facets.** `facets-draft.js` reads each record's own words and link; `facets-edits.json` holds reviewed
  corrections with reasons; `urls.txt` and `url-check.json` are the link check run on GitHub; `apply.js` writes
  `data/core/ORG_FACETS.json`. Links that did not answer are in `link-failures.json`.
- **Step 2, the finder.** `tools/build-heat-network.js`, `heat-network/network-core.js`, `network.js`, `network.css`,
  `tools/check-heat-network.js`. Browser tests: `browser-test.js`.
- **Step 3, first two depth batches.** `depth-1/` and `depth-2/` hold the leads; `depth-stage.js` stages them into
  `data/inbox/2026-11-heat-network/`; `verify-sources.yml` (`month: 2026-11-heat-network`) checks them;
  `depth-apply.js` applies the confirmed ones. Applied: `depth-applied.json` (old and new link, old and new words).
  Not used, with the reason: `depth-dropped.json`.

## Still open in step 3
- Records whose link opens only a homepage: see the count `apply.js` prints. Each needs a page on the organisation's
  own site that shows the heat work, staged as a new `depth-<n>/leads.json`.
- Leads that did not pass and are worth another route (an archived copy, or a different page on the same site): the
  national disaster authority and weather service of India, the weather services of Pakistan and Sri Lanka, the FAO
  report page, ISO, HDB and Sentosa.
- Descriptions under 90 characters were rewritten only where a lead gave new words that the checked page supports.
  Most short descriptions are unchanged.

## To add a depth batch
1. Write `depth-<n>/leads.json`: `id`, `url`, `expect` (words the page has to hold), and `does` only if the page
   supports new words. Add `"link": "third"` when the page is published by someone else.
2. `node research/2026-11/heat-network/depth-stage.js`, commit, push, run `verify-sources.yml` with
   `2026-11-heat-network`.
3. `node research/2026-11/heat-network/depth-apply.js && node research/2026-11/heat-network/apply.js`, then build and
   run the checks.
