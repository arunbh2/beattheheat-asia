# Signals candidates

The weekly harvest (`tools/signals-harvest.js`, run by `.github/workflows/signals-weekly.yml` every Monday) writes one
file per run here: `<YYYY-MM-DD>.json`. Each file lists leads from free public feeds (ReliefWeb, PreventionWeb, UN News,
WHO) that mention heat and a place Signals covers, and are not already tracked or proposed. It also records which places
were searched and when, so the coverage grid on /signals/ can say "searched, nothing tracked yet" with a date.

ReliefWeb is read through its free API (`api.reliefweb.int/v2/reports`), because its site turns away automated reads
of the RSS feed from GitHub. The API needs an app name that ReliefWeb has approved, kept as the repository secret
`RELIEFWEB_APPNAME`; until it is set, each run lists ReliefWeb as "waiting for an approved app name" and reads the
other feeds as usual. The name is never written into these files.

Leads are not evidence and are never published from here.

- Review each lead in the weekly pull request: set `decision` to `propose`, `context` or `skip`.
- `context` keeps a lead as context on the heat season (alerts, closures, people affected, situation reports), which is
  most of what ReliefWeb reports. It never becomes a Signals record. `node tools/sof-review.js new` or `ladder` lists the
  context leads published in a briefing's month in the draft, for the editor only (removed at publication); a source
  cited in an edition still passes the source check first. `use_hint` (`season context` or `signal lead`) is a guess
  from words in the feed.
- A proposed lead becomes a record only through a research batch, like the COP31 check-ins in `research/2026-11/signals-cop31-*`:
  stage its sources (`stage.js`), run `verify-sources.yml`, gate the claims (`gate.js`), then add the record to
  `data/site/signals.json` and run `node tools/signals-sync.js`. Its step on the ladder comes from the evidence, never
  from the feed; `kind_hint` is a guess from words in the feed.
- Merging the weekly pull request records the review. Nothing on the site changes until a record is added.
