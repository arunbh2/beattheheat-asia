# Heat network intake: replies from outside research

`PROMPT.md` is the research prompt (paste-ready). Attach `existing-organisations.txt` and `homepage-only.txt`.

Save each reply, unedited, here as `<country-code>.md` (`pk.md`, `vn.md` ...) or `regional.md`. Each reply holds five
fenced `json` blocks in order: A new organisations, B ties, C the coverage grid, D leads and search log, E deeper links.

Nothing in a reply reaches the site until its pages pass the check on GitHub:
1. a stage script reads every reply and writes each cited page and its `expect` phrases to
   `data/inbox/2026-11-heat-network/sources.json` (the same inbox as the depth batches);
2. `verify-sources.yml` with `2026-11-heat-network` opens each page and looks for the phrases;
3. an apply script adds only confirmed items: new organisations to `ORGANISATIONS_MORE` (build-only, so the homepage
   payload does not grow), ties to `ORG_LINKS` (step 4), grid cells to `ORG_GRID` (step 5), deeper links through
   `depth-apply.js`. Everything else is listed with the reason, never published.

A grid cell reads "Not found yet (searched <date>)" only when a reply searched it; a cell nobody searched reads "Not
looked for yet". The two are never merged.

`existing-organisations.txt` and `homepage-only.txt` are written from the data on 14 November 2026. Regenerate them
before a new round so they include what the last round added.
