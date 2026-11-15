# City heat briefing, ten more cities and a deeper Atlas: build brief

Written 15 November 2026 for the agent who builds this. The site owner has approved the direction, the city list and
the build-time data sources named below. Read `CLAUDE.md` first: its hard rules apply to every line of this work and
win wherever this brief is unclear.

## 1. What the owner asked for

1. Make `/atlas/` far more useful: a place a reader can question, not only a timeline to watch.
2. Take `/cities/` from twelve cities to twenty-two, five of the new ones in India.
3. Give every city a heat tool of the site's own: a daily heat-stress estimate with a three-day outlook, a picture of
   who is exposed in each district, a short briefing on why it matters and what could be done, and later a what-if
   view for trees and reflective roofs.

The tool is Common Shade's own work, grown from what the site already does (Heat right now, the city pages, the
Atlas). Describe it that way. Credit no outside prototype, company or person for it, and quote nothing from the
unpublished session transcript.

## 2. Decisions already made (do not reopen)

- **Ten new cities.** India: Kolkata, Chennai, Hyderabad, Bengaluru, Bhubaneswar. Elsewhere: Ho Chi Minh City,
  Surabaya, Chattogram, Chiang Mai, Quezon City. All are in countries the site already covers.
- **Build-time data.** WorldPop, NASA, Copernicus and OpenStreetMap may be read by a GitHub job that writes small
  static files into the repository. Visitors' browsers never contact them.
- **Live heat** stays on Open-Meteo (and data.gov.sg for Singapore), fetched in the visitor's browser as today.
- **No AI service.** The briefing is assembled by fixed rules from the site's own checked records. The site runs no
  AI and has no budget for one.
- **Order of work**: the five steps in section 5, one after another, each as its own pull request or small set.
- **Indian cities with no plan of their own on file point to their state's plans** (decided 15 November 2026): give each Indian city a `state` in `LIVE_CITIES` matching the archive's state name; `hapState()` in `tools/build-static.js` then links to the state-level plans in the archive. Already live for Mumbai.
- **Step 3 software** (owner's approval, 15 November 2026): the Node route. One package, `geotiff`, pinned and installed in `.github/workflows/city-districts.yml` for the job only; nothing added to `package.json` or to pages. `proj4` was approved too but is not needed, because built-up land comes from ESA WorldCover (built from Copernicus Sentinel data, in latitude and longitude). If the district sums or geometry tests show too much error, ask before switching to the Python route (rasterio, rasterstats, shapely, pyproj).
- **Step 3 cautions from the advisor review**: WorldPop figures are modelled, not counted (say so; round age shares, which come from larger census areas); park area share, not park counts; each city's outline source and licence recorded separately; land-surface temperature optional, and "Not found yet" if the account-free route fails; OpenStreetMap counts show what volunteers have mapped.
- **Step 5 outcome** (15 November 2026): the evidence review found too few sound field estimates from tropical and subtropical Asian cities to show a what-if range for trees or reflective roofs, and an independent review agreed. No simulator is built. Instead `/cooling-options/#measured` lists what has been measured, and where, from sources that passed the check (`tools/city-districts/measured.js`), and says no estimate exists for what single-site measurements add up to across a city.
- **No heat-stress level beside the WBGT estimate** (owner's decision after step 1, 15 November 2026). The estimate reads high in cloudy or windy weather and at night, so published WBGT levels appear only beside measured values (Singapore). New cities follow the same rule; the country's existing heat-index or daily-high estimate (`LIVE_LEVELS`) still shows where it applies.

## 3. Stop and ask the owner before doing any of these

- Adding any library to pages or to `tools/`, or installing anything in a GitHub job (for example a Python raster
  library). The owner approved the data sources, not yet the software to read them. Ask once, at the start of step 3,
  naming the exact packages and saying they run only in the job.
- Any data source that needs an account, key or login (NASA Earthdata downloads usually do). Hard rule 1 allows no
  accounts. Look first for an account-free route to the same data; if there is none, ask.
- Any new call from a visitor's browser to a host other than Open-Meteo and data.gov.sg.
- Re-rendering or removing a film. The "Twelve cities" film (`tools/explainers/site.js`, `cities.narration.json`)
  says "twelve" aloud and will be out of date. Ask whether to re-render it, retitle its label or leave it.
- Raising a page's weight budget with `check-weight.js --update` (see 4.3).
- Publishing a composite risk score, a "worst district" label or any ordering of places from worst to best.
- Anything that would delete or rewrite existing content, change a pop-up, or change a stable id.

## 4. What exists today (read these, not the whole repository)

### 4.1 Cities
- `data/core/LIVE_CITIES.json`: twelve records, `{id, name, country, lat, lon, warn:{label,url}, wbgt?}`.
- `data/core/CITY_PROFILES.json`: one profile per city, `{id, tagline, heat, hap:{status,text,sources}, loops:[{id,
  why, src}], orgs, examples, risk}`. `hap.status` is `plan`, `building` or `none` (words in `CITY_HAP.json`).
- `tools/build-static.js` (about lines 330 to 360) writes `/cities/` and each `/cities/<id>/`. `SNAP_SLUG` links a
  city to its country snapshot.
- Other readers of the two blocks: `script.js` (Heat right now from about line 2819, the city view from about 2944,
  the ticker near 3059), `heatweek.js`, `journey.js`, `tools/build-pages.js` (the Atlas), `build-print.js`,
  `build-ticker.js`, `build-heat-network.js`, `build-heat-tools.js`, `build-everything.js`, `for-ai-text.js`,
  `growth-dates.js`, `check-data.js`. Run each after adding a city and read its output.
- `data/core/LIVE_LEVELS.json`: each country's published warning bands and the basis used (`hi` heat index, `tmax`,
  `wbgt`). India's bands apply only to Delhi and Ahmedabad (`only`). The page says these are the site's estimate,
  never an official warning (`LIVE_LEVELS_NOTE`, `LIVE_NOTE`).

### 4.2 Atlas
- Built inside `tools/build-pages.js` (the "Atlas" block, about line 293) into `window.ATL`; drawn by
  `atlas/atlas.js` on `images/asia-map.svg` (equirectangular, longitude 64 to 129, latitude -12 to 34, no borders).
- Layers today: heatwaves, milestones (`data/site/milestones.json` and knowledge-base records), city heat plans,
  heat right now. A year slider with play.

### 4.3 Constraints that will bite
- **Homepage weight.** `LIVE_CITIES` and `CITY_PROFILES` ship in `data.js`, which the homepage loads. Profiles are
  about 1.7 KB each; ten more adds about 17 KB. The homepage is at 422 KB of a 434 KB budget. Measure with
  `node tools/check-weight.js --list` before and after. Preferred fix: keep in the browser only what the homepage
  uses, and move the rest of each profile to a build-only block (`"browser": false` in `data/core/manifest.json`).
  If that is not enough, ask before `--update`.
- **Typed counts.** "Twelve" and "ten heatwaves" are typed in places the rules say are calculated. Replace each
  with a count filled by the build before adding a city: `tools/build-static.js` line 63 (page title),
  `data/site/nav.json` (two lines; use the `{key}` form, see `tools/nav-counts.js`), `data/site/paths.json` (lines 19
  and 124), `data/core/GUIDE.json` (two lines), `script.js` (about lines 964, 1597 and the comment near 2944), and the
  Atlas description in `tools/build-pages.js`. Leave films and unrelated uses of the word alone.
- **City films.** Some cities have a short film. A new city has none; its page and the index must read well without.
- **No open internet in the session.** Check every link on GitHub with `verify-sources.yml`. `WebFetch` cannot reach
  outside hosts.

## 5. The work, in order

Each step ends with: build, every check in `CLAUDE.md` "Every change", a growth entry in `data/site/growth.json`,
the page and `llms-full.txt` saying the same thing, a section in `CLAUDE.md` if a new builder or data block was added,
a cache bump if `styles.css` or a script changed, then a pull request, merge and fast-forward. Never force-push.

### Step 1. Daily heat-stress level and three-day outlook, twelve existing cities

**Reader's question:** how dangerous is the heat here today and over the next three days, and what is that based on?

1. Choose the measure. The aim is wet-bulb globe temperature (WBGT), which counts heat, humidity, sun and wind.
   First check, through a GitHub job or the documentation staged as a source, whether Open-Meteo offers it or the
   inputs for it (wet-bulb temperature, radiation, wind). If WBGT has to be calculated, use one published method,
   stage its source in a new inbox batch (`data/inbox/2026-11-city-heat/`) and cite it on the page. Do not write a
   formula from memory.
2. Say plainly what it is: an estimate from model data for the city as a whole, not a measurement and not a warning.
   Singapore's measured WBGT (already fetched) stays the measured value there; show the estimate beside it nowhere
   that could confuse the two. Use the comparison in a test: the check script reports how far the estimate sits from
   Singapore's measured value on the day it runs, as information, never as a claim of accuracy on the page.
3. Levels. Use only published bands whose source passed a check. Sources already checked in
   `data/inbox/2026-11-csd9-heat/` cover Singapore, Japan, Hong Kong and Thailand; do not reuse a band for a country
   it was not written for. Where a country has no published WBGT band, show the number and the outlook without a
   level, and say so.
4. Where it shows: a "Heat today and the next three days" block on each `/cities/<id>/` page, replacing the current
   one-line "Heat today" pointer, and the same figures in the homepage city view. Reuse the existing fetch in
   `script.js` (one Open-Meteo request for all cities; add variables to it, do not add a second request per city).
   City pages need their own small script: an IIFE with "use strict", loaded only on city pages.
5. States: loading, no network, error and empty, each in plain words. With no JavaScript the block shows the link to
   the official warning service, as now.
6. Write `tools/check-city-heat.js`: the calculation against a few worked values from the published method, the
   bands against their sources, and every city having a warning link. Add it to the check list in `CLAUDE.md` and to
   `check-data.yml`.
7. Update `/privacy/` only if what the browser sends changes (more variables to the same host is not a new call, but
   say so in the pull request).

**Done when:** every existing city page shows the estimate, its basis and a three-day outlook at 390px, works with
the network off (message, not a blank), and the new check passes.

### Step 2. Ten new cities, in two checked batches

Batch A: Kolkata, Chennai, Hyderabad, Bengaluru, Bhubaneswar. Batch B: Ho Chi Minh City, Surabaya, Chattogram,
Chiang Mai, Quezon City.

1. Fix the typed counts first (4.3), as its own small pull request.
2. For each city, research and stage sources (`research/2026-11/city-heat/stage.js` writing to
   `data/inbox/2026-11-city-heat/`, following `research/2026-11/csd9-heat/stage.js`): the heat plan and its status,
   the national or city warning service, and one checked fact for each vicious cycle tied to the city. Run
   `verify-sources.yml` and cite only sources that opened with every term found. Keep a `ledger.md` of claims and a
   list of what was dropped.
3. Heat plan status is what a checked document shows, nothing more: `plan` only with the plan itself or an official
   page naming it; otherwise `building` or `none`, worded as "found", never as a judgement of the city. For the Indian
   cities look first in `research/india-hap-archive/India_HAP_Combined_Verified.json` (Bhubaneswar has a record) and
   follow the archive's rules: leads and unresolved rows never count as verified.
4. Each profile needs: tagline, heat type, plan text with sources, two to four cycles each with a reason (a sourced
   one where a claim is made), organisations already in `ORGANISATIONS.json` whose listed work is in that city (a
   place is where the work is, never an office), worked examples and at-risk groups by id. Add no organisation
   without the heat-network process in `CLAUDE.md`.
5. Coordinates are the city centre. Check each falls inside the Atlas map's range.
6. Handle weight as in 4.3 before the second batch lands.
7. Check every reader of the blocks listed in 4.1: the ticker and Heat right now with twenty-two cities at 390px (no
   sideways scroll, tap targets), the Atlas, print pages, heat-network and heat-tools lines, packs in `/packs/`, the
   sitemap, Markdown twins and `llms-full.txt`.
8. India's warning bands apply only to Delhi and Ahmedabad today. Extend `only` to a new city only if a checked source
   shows the band is used there.

**Done when:** each new city has a page with only checked claims, appears everywhere the first twelve do, and all
counts on the site read from the build.

### Step 3. District risk picture, starting with Bangkok

**Reader's question:** inside this city, where do many people, and many older people, live with little green space
and few health facilities nearby?

1. Ask the owner about software first (section 3). Then write one GitHub workflow, run by hand or monthly, that
   downloads the inputs, calculates per-district figures and commits one small file per city
   (`data/city-districts/<city>.json`), with a `README.md` giving each input's name, version, date, licence and the
   required credit. Follow `date-sources.yml` for a job that commits back.
2. Figures per district, each with its unit and source year: residents; share aged 65 and over (WorldPop);
   hospitals and clinics, and parks (OpenStreetMap, with its credit line and licence terms followed; read the licence
   page through a staged source before publishing figures derived from it); built-up share (Copernicus); a seasonal
   land-surface temperature pattern if an account-free route exists. District outlines come from OpenStreetMap or
   another open source the owner agrees to; store simplified outlines only, small enough for a phone.
3. Be exact about limits. The weather model's grid is far wider than a district, so the daily heat estimate is the
   same across a city: say this on the page, and never present district-level daily heat. Counts of facilities from
   OpenStreetMap depend on what volunteers have mapped: say this too.
4. Present measures side by side, each with "above" or "below the city's middle value". No composite score, no
   ranking, no colour that reads as blame; a place is never a government. Sorting by the reader is fine.
5. The briefing, by fixed rules, on each city page:
   - **Why today's estimate is what it is**: the inputs and the band, from step 1.
   - **What a checked study says heat costs here**: only where the city's profile already holds a checked figure
     (Bangkok has one). Otherwise "No checked estimate found yet for this city." Never model a cost.
   - **What could be done**: during the heat, before the season, over years, drawn from `LEVERS.json` by
     `ACTION_HORIZONS.json`, with each lever's "Watch for" notes and evidence strength shown. Options, not
     instructions: no "should" or "must".
6. The district view loads only when opened, as its own small file. A table is the default on phones; a drawn
   outline map is an addition, with the table as its text version.
7. Add `tools/check-city-districts.js` (shares add up, units present, every figure has a source and year, file under
   a size limit). After Bangkok is live and the owner has looked at it, repeat for the other cities where open
   outlines and data exist; list the cities where they do not as "Not found yet".

**Done when:** Bangkok's page shows its districts with sourced figures, the limits stated, the three-part briefing,
and the check passes on GitHub.

### Step 4. Atlas place panel and layers

**Reader's question:** for this place, what is the heat doing, what is in place, and who is at work?

1. **Place panel.** Selecting a city (or arriving at `/atlas/#city-<id>`) opens one panel: heat today and the outlook
   (step 1), plan status with its source, the cycles tied to it, who is working there, signals that name it, what a
   household could draw on (link to `/social-protection/` for its country), and a link to its full page. Reuse the
   builders' own text so the panel and the city page never differ.
2. **Layers**, each lazy-loaded as its own small JSON when ticked, each with a count from the build:
   - India's heat action plans from the archive, placed by district or state centre, labelled "plans found so far".
   - Signals with a place, shown with their rung.
   - Organisations by where their listed work is (`ORG_FACETS`).
   - Social protection schemes by country.
   - "Not found yet": cities on the site with no published plan found. It describes the record, not the place.
3. **This hot season**: only if step 1's data can supply it honestly without a new service; otherwise leave it out
   and say why in the pull request.
4. **Compare two places** side by side, state kept in the page address so it can be shared.
5. **Text and data.** Every layer has a text list under the map (the map points stay exempt from the tap-target
   rule only because of it), and a download in the format the site already uses for spreadsheets.
6. Keep the drawn, borderless map. No tile service, no map library.
7. Check the Atlas's own weight budget, keyboard access to every marker's text twin, and reduced motion.

**Done when:** a reader on a phone can pick any of the cities and read its panel, switch each layer on and off, share
a comparison link, and reach all of it without the map.

### Step 5. Simulator, only if the evidence supports it

1. Start with an evidence review, not code. Stage and check published effect sizes for street trees and for
   reflective roofs on air or surface temperature in tropical and subtropical Asian cities, with their conditions.
2. Report to the owner what passed. If fewer than a handful of sound, checked estimates exist for a measure, stop
   there and publish nothing for it.
3. If it goes ahead: ranges, never single numbers; the label "illustrative" on every output; each range traced to
   its source and the conditions it was measured in; the "Watch for" notes of the levers involved (for example
   greening that raises rents) beside the result. It never estimates deaths, money saved or a district's future
   temperature.
4. An `audit.js` checks every number against its checked source, as in `research/2026-11/gap-lenses/`.

## 6. Voice and care (applies to all five steps)

- Estimates are estimates; official warnings belong to the national service, linked on every city.
- Households and places in aggregate. Never rank governments, cities, districts or organisations.
- No individuals named. No em dashes. No "should" or "must" in the site's own voice. `check-voice.js` enforces it.
- "Not found yet" describes the site's record, never a place's effort.
- Nothing is called tested, validated or accurate unless a checked source says so.
- Every new data widget handles loading, no network, error and empty.

## 7. Report back after each step

List the files changed, the checks run with their results, what was dropped after the source check and why, any
weight change, and any question from section 3 that came up. If a step cannot be finished honestly, say so and stop;
a smaller true feature is the right outcome.
