# City heat ecosystem profiles

One file per city (`<city>.json`, the city's id from `data/core/CITY_PROFILES.json`). Each builds
`/cities/<city>/<slug>/` ("Bengaluru: who is doing what about heat?") with `tools/build-city-ecosystem.js`; the words
it shares with `llms-full.txt` are in `tools/city-ecosystem-text.js`; loading, gating and validation are in
`tools/city-ecosystem.js`; `tools/check-city-ecosystem.js` checks the result. These files are build-only: visitors never
download them.

## The rule
Every record names the claims it rests on (`claims`, or `summary_claims` for an organisation). A claim is a sentence
in `research/2026-11/<batch>/claims.json` tied to the exact words its source has to hold. Only claims in that batch's
`confirmed.json` (written by `gate.js` after `verify-sources.yml`) let a record show; the rest are held back and listed
on the page. A page that only opened is not evidence, and a link check is not a sign that a project moved.

## Shape
- `orgs`: `id`, `network` (its id in `data/core/ORGANISATIONS.json`, if any), `name` (the organisation's own name, even
  where it says Bangalore), `aliases` (every variant the sources use), `type` (`research`, `health`, `community`,
  `network`, `authority`, `funder`), `based`, `coalition` (`founding` or null), `summary`, `summary_claims`, `site`,
  `activities`, `outside` (work elsewhere, kept apart), `unknowns`.
- `authorities`: public bodies, under current names, with `since`/`until` and the older name kept for older records.
- `coalition`: `event` (when it happened) and `published` (when each announcement appeared) are separate fields;
  `priorities` are priorities, never shown as delivered; `governance.not_found` says what was looked for and not found.
- `activities`: `id` (stable, never reused), `title`, `desc`, `lead` (only where a source names one), `collaborators`
  (`[org, role]`, each with the role a source gives), `place` and `precision` (`sites`, `ward`, `wards`,
  `neighbourhoods`, `corporation`, `city`, `district`, `state`), `people`, `start`, `end`, `status` (`proposed`,
  `announced`, `planned`, `underway`, `completed`, `evaluated`, `not_stated`), `outputs`, `outcomes`, `evaluation`,
  `themes`, `evidence` (`own`, `independent`, `both`), `last` (the latest dated evidence), `equity` (`mentioned`,
  `consulted`, `governance`, `receiving`, `benefit`: blank means the sources do not say), `related` (Common Shade
  pages). A joint project is one record, listed under every partner.
- `tools`: `kind` (`dashboard`, `forecast`, `dataset`, `planning`, `charter`, `training`, `report`), `access`
  (`public`, `registration`, `institutional`, `request`, `announced`, `in_development`, `not_verified`, `unavailable`),
  `button` ("Open tool" only for a publicly usable tool; otherwise "Read guidance", "View project" or "Access
  details"), coverage, resolution, licence (null shows as not stated: free to read is not permission to reuse),
  `bengaluru_use` (only if independently documented), `catalogue` (its Heat Tool Finder id, if listed there).
- `money`: one record per figure, attributed to who stated it, at the stage the source describes (`proposed`,
  `announced`, `allocated`, `approved`, `disbursed`, `spent`, `delivered`, `evaluated`); a component carries `parent`
  and is never added to it; `heat` says whether it is heat-specific. Figures are never summed.
- `timeline`, `gaps`, `contradictions` (conflicting sources, kept side by side), `start_here`.

## Adding a city
1. Create `research/2026-11/<city>-ecosystem/` with `claims.json`, and copy `stage.js` and `gate.js` from
   `bengaluru-ecosystem/` (change the batch name and id prefix).
2. `node research/2026-11/<city>-ecosystem/stage.js`, commit, push, run `verify-sources.yml` with
   `month: 2026-11-<city>-ecosystem`. Wait for its commit before pushing again.
3. `node research/2026-11/<city>-ecosystem/gate.js`; restage anything that failed on a page the checker can read.
4. Write `data/city-ecosystems/<city>.json`, rebuild, run `node tools/check-city-ecosystem.js` and the other checks.
   The cities index and the city's own page link to it automatically.
Do not create a profile without researched activities: an empty profile is not added.

## Correcting a record
- **Membership:** change `coalition` and the claims behind it; keep the old name in `aliases`; add a timeline entry
  with its date and source when membership changes. Never infer membership from a shared panel or event.
- **Activity stage:** change `status` only with a new claim whose source shows the new stage (for example a sanction
  order for `approved`, a delivery report for `completed`, an evaluation for `evaluated`), and update `last`.
- **Tool access:** visit the tool itself; record `access` from what a member of the public can do today; "Open tool"
  needs a publicly usable address checked on a stated date.
- **Conflicting sources:** keep both in `contradictions`, each with its claim; do not pick the convenient one.
- **Corrections from readers** arrive through `/corrections/` and are checked before anything changes. No automated
  harvest publishes claims here; any future one writes to a review queue only.

## Profiles without a coalition, tools or money (November 2026)
Delhi, Mumbai, Ahmedabad, Kolkata, Chennai, Hyderabad, Bhubaneswar, Dhaka and Kathmandu share one research batch,
`research/2026-11/city-ecosystems/` (`claims.json`, `stage.js`, `gate.js`, `matrix.md`), checked with
`verify-sources.yml` (`month: 2026-11-city-ecosystems`). Each sets `"coalition": null`; the page then leaves out the
coalition section and the membership tags. An empty `tools` list leaves out the tools section; an empty `money` list
says no announced money was found, describing the sources, not the city. A money record may carry `label` for an
amount in another currency or written as the source gives it (`"CHF 499,930"`, `"₹700,000"`). `method_note` adds a
line to "How this was made"; `city_use` on a tool replaces `bengaluru_use`. The India heat action plan archive link
shows only when `country` is India.
