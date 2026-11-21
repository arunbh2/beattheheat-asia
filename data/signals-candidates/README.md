# Signals candidates

The weekly harvest (`tools/signals-harvest.js`, run by `.github/workflows/signals-weekly.yml` every Monday) writes one
file per run here: `<YYYY-MM-DD>.json`. Each file lists leads from free public feeds (ReliefWeb, PreventionWeb, UN News,
WHO) that mention heat and a place Signals covers, and are not already tracked or proposed. It also records which places
were searched and when, so the coverage grid on /signals/ can say "searched, nothing tracked yet" with a date.

Leads are not evidence and are never published from here.

- Review each lead in the weekly pull request: set `decision` to `propose` or `skip`.
- A proposed lead becomes a record only through a research batch, like the COP31 check-ins in `research/2026-11/signals-cop31-*`:
  stage its sources (`stage.js`), run `verify-sources.yml`, gate the claims (`gate.js`), then add the record to
  `data/site/signals.json` and run `node tools/signals-sync.js`. Its step on the ladder comes from the evidence, never
  from the feed; `kind_hint` is a guess from words in the feed.
- Merging the weekly pull request records the review. Nothing on the site changes until a record is added.
