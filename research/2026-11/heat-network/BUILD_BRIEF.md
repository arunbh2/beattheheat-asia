# Build brief: the heat network, from a list to a landscape

14 November 2026. A handover for the session that builds it. Read `CLAUDE.md` first; every rule there applies.
This brief was written from a reading of the live data. Where it says "measured", the figure came from a script run
on that date; re-measure before relying on it.

## 1. The aim

`/heat-network/` asks "Who could we work with?" and answers with one long list. The aim is a page where a reader can
ask **"who works on this action, in this place, playing this part?"**, where the ties between organisations are data,
and where the thin parts of the map are visible as gaps to solve together.

Two readers, both served:

- **Someone seeking a partner in one place** gets a finder (filters, results, a shareable link).
- **Someone reading the shape of the field** gets a coverage grid (country by mandated role).

Done means: a reader on a 390px phone can reach the organisations for one country and one action in three taps or
fewer; every record has a country, a type, a scale and a date checked; no record links only to a homepage unless it
says so; and size grows only through checked batches.

## 2. What exists today (measured)

- **Data.** `data/core/ORGANISATIONS.json`: 334 records with `id, role, name, url, does, levers`. `ORG_ROLES.json`
  (8 groups), `ORG_SIDE.json` (id to demand, supply or platform), `ORG_SIDES.json` (the three definitions). All four
  are in `data.js`, so every homepage visitor downloads them.
- **Page.** Built in `tools/build-static.js` (the block under `// heat network`, about line 318): a bulleted list
  per group, plus `heat-network/heat-network.csv`. No filter. The page is about 43,700px tall at 390px wide.
- **Other users of the data.** Do not break these:
  - `script.js` (homepage `#network` chips and list, `orgsForLever`, `orgsForLoop`, city cards)
  - `tools/build-pages.js` (line 240 `ORGS`, line 638 search index, which links to `/heat-network/#<role>`)
  - `tools/build-print.js`, `tools/build-everything.js`, `tools/build-sources.js`, `tools/for-ai-text.js`
  - `tools/check-data.js` (actor ids `org-<id>`), `tools/build-data.js` (social protection `org_id`)
  - `data/core/CITY_PROFILES.json` (`orgs` lists), `tools/growth-dates.js`
- **Weak points.**
  - 133 records link to a homepage only (URL path of `/` or empty).
  - 129 have a `does` under 90 characters; only 44 carry a year.
  - 36 have no levers.
  - Five near-duplicate pairs: `ghhin` and the Southeast Asia hub (keep both, they differ); Ahmedabad Municipal
    Corporation twice; India Meteorological Department twice; Singapore Management University twice; HT Parekh
    Foundation twice. PAGASA also appears twice.
  - By keyword, India is named in 96 records; Pakistan 12, Vietnam 7, Cambodia 6, Malaysia 3; Myanmar, Laos,
    Maldives and Afghanistan 0.
  - Sides: 220 supply, 63 demand, 51 platform.
- **Homepage weight is tight:** 420 KB of a 434 KB budget (`tools/check-weight.js`). Anything added to `data.js`
  counts against it.

## 3. Rules that shape the design

1. **Nothing new in `data.js` unless the homepage needs it.** New fields and new records live in build-only blocks
   (`"browser": false` in `data/core/manifest.json`), read by builders through `require("./data-blocks.js")()`.
2. **No ranking, scoring or "leading".** Order is alphabetical within a group. No counts presented as performance.
3. **Inclusion wording stays:** "Inclusion describes relevant published work. It does not imply partnership,
   affiliation or endorsement."
4. **A gap is a task to solve together.** An empty cell reads "Not found yet", never as a comment on a country,
   government or organisation.
5. **Never delete without the owner's yes.** Duplicates are merged only after approval (section 7).
6. **Every new claim and every new link is checked on GitHub** (`verify-urls.yml`, `verify-sources.yml`) before it
   reaches a page. Unconfirmed items go to a `dropped` file, listed, never published.
7. **Ids are stable.** Existing `#global`, `#asia` and the other group anchors keep working.
8. **No new dependency.** Reuse the Heat Tool Finder pattern: `heat-tools/finder-core.js` (shared logic, UMD),
   `heat-tools/finder.js`, `tools/build-heat-tools.js`, `tools/check-heat-tools.js`.
9. **Counts are never typed.** Record them with `tools/site-counts.js`.
10. **Site voice:** no "should" or "must", no em dashes, no individuals named.

## 4. Data model

Three new build-only blocks in `data/core/`, each registered in `manifest.json` with notes and `"browser": false`.
Each is written by an `apply.js` in `research/2026-11/heat-network/` from reviewed input files, never by hand.

### 4.1 `ORG_FACETS.json`: one entry per organisation id

```json
{ "sewa": { "countries": ["IN"], "scale": "national", "type": "worker",
            "link": "work", "checked": "2026-11-14", "year": 2024 } }
```

- `countries`: ISO 3166-1 alpha-2 codes where the described work happens. `[]` with `scale: "global"` or
  `"regional"` when the work is not tied to a country. Never guess: a head-office address is not a country of work.
- `scale`: `global`, `regional`, `national`, `subnational`, `city`, `community`.
- `type`, one of:
  `government`, `weather`, `health`, `city`, `multilateral`, `network`, `redcross`, `ngo`, `worker`, `employer`,
  `research`, `finance`, `funder`, `company`, `standards`, `media`.
- `link`: `work` (the URL shows the heat work), `home` (homepage only), `third` (a news or third-party page).
- `checked`: the date the link last answered in a GitHub check.
- `year`: the year of the work the description rests on, where the source gives one; otherwise omitted.

The country list (19): AF, BD, BT, IN, MV, NP, LK, PK, BN, KH, ID, LA, MY, MM, PH, SG, TH, TL, VN. Organisations
working elsewhere keep their real codes and are shown under "Beyond the region".

### 4.2 `ORG_LINKS.json`: stated ties

```json
[{ "a": "hera", "b": "sewa", "kind": "delivers-with",
   "what": "Insurance payouts and cash after the 2024 heatwaves",
   "source": "https://...", "checked": "2026-11-14" }]
```

- `kind`: `funds`, `delivers-with`, `member-of`, `hosts`, `technical-partner`.
- A tie is recorded only when one checked source names both parties. A description on this site is not a source.
- Undirected except `funds` and `member-of` (a to b).

### 4.3 `ORG_GRID.json`: the mandated roles

```json
{ "roles": [{ "id": "weather", "name": "National weather service" }],
  "cells": { "BD": { "weather": ["bmd"], "labour": [] } },
  "searched": { "BD": { "labour": "2026-11-14" } } }
```

Roles, fixed: national weather service; disaster management authority; health ministry or public health agency;
labour ministry or workplace safety body; education ministry; capital or largest city government; Red Cross or
Red Crescent society; main worker organisation.

- A cell lists organisation ids. An empty cell with a `searched` date shows "Not found yet (searched <date>)".
- An empty cell with no `searched` date shows "Not looked for yet". The two are never merged.
- "Not found" means no heat-specific published work was found, and the page says so in those words.

### 4.4 New organisations

New records go in a build-only block `ORGANISATIONS_MORE.json` with the same fields as `ORGANISATIONS.json`, so the
homepage payload does not grow. Add one helper, `tools/orgs.js`, that returns the merged list plus facets, links
and sides, and make every builder that needs "all organisations" call it. Extend `ORG_SIDE.json` only for records
in `ORGANISATIONS.json`; sides for the new block live inside its own records (`side`).

The homepage `#network` section keeps its own set. Its count text reads from its own list, and it links to the
finder for the full landscape. State this in one line on the homepage section so the two counts never look like a
mismatch.

## 5. The work, in pull requests

Each PR builds, passes every check in `CLAUDE.md`, adds one entry to `data/site/growth.json`, and is small enough to
review. Stop and ask the owner where section 7 says so.

### PR 1: facets for the 334 (no new claims)

1. `research/2026-11/heat-network/facets-draft.js`: derive a first draft of `countries`, `scale`, `type` and `link`
   from each record's name, `does`, role and URL. Write `facets-draft.json` and `facets-review.md` (a table of
   every record whose draft is uncertain: no country found, more than three countries, or type guessed from role
   alone).
2. Resolve the uncertain rows by reading each record's own linked page through `verify-sources.yml`, not from
   memory. Save decisions in `facets-edits.json`.
3. Run `verify-urls.yml` over all 334 URLs; `apply.js` writes `checked` from the result and marks failures in
   `link-failures.json` (reported, not rewritten, as `check-heat-tools.js` does).
4. `apply.js` writes `ORG_FACETS.json` and refuses: an unknown id, an unknown country code, type or scale, or a
   record with no facet entry.
5. `tools/check-heat-network.js` (new; add it to the check list in `CLAUDE.md`): every organisation has a facet
   entry; codes and enums are valid; no two records share a normalised name; every `lever` id exists.
6. No page change in this PR except the CSV, which gains the columns Countries, Scale, Type, Link type, Checked.

### PR 2: the finder page

1. Move the page out of `build-static.js` into `tools/build-heat-network.js`; keep the slug, title, crumbs, film,
   the "Open the interactive network" button and the inclusion sentence.
2. `heat-network/network-core.js` (UMD, shared by builder, page and check): filter and URL-state logic. Keys:
   `country`, `part` (demand, supply, platform), `type`, `action` (lever id), `scale`, `q`, `view` (list or grid).
3. Filters, in this order: Place, Action, Part played, Type. Search box last. A "Clear" control. Result count in an
   `aria-live` region. Empty state: "No organisation found yet for this combination" plus the nearest wider
   result (same action, any place) and a link to `/join/`.
4. Each result is a card: name (link), part and type as text labels, countries, `does`, actions as links to
   `/actions/`, the date checked, and "homepage only" where `link` is `home`. Each card has `id="org-<id>"`.
5. With no JavaScript the full grouped list shows, as today. Group anchors (`#global` and the rest) still land.
6. Use `content-visibility: auto` on cards after the third, with `contain-intrinsic-size` set from the measured
   median card height at 390px (see the pattern in `styles.css` for `.rf-card`).
7. Point the search index (`build-pages.js` line 638) at `/heat-network/#org-<id>`.
8. Add entry links: each country and city page gets "Organisations working here" (`?country=XX`); each action on
   `/actions/` gets "Who works on this" (`?action=<lever>`). One list of these in the builder, as `CONTEXT` is in
   `build-heat-tools.js`.
9. Analytics: GoatCounter events with filter names only, never the search text.
10. `tools/network-text.js` holds what the page and `llms-full.txt` share. Update `for-ai-text.js` ENDPOINTS for
    the new data files, and the Markdown twin.
11. Browser tests (Playwright, as the Heat Tool Finder's): each filter, combined filters, URL round trip, back
    button, empty state, keyboard only, 390px with no sideways scroll, no JavaScript, deep link to a card.

### PR 3: depth for the weak records

1. For the 133 `home` links: find the page on the same organisation's site that shows the heat work. Stage them
   with a `stage.js` (pattern: `research/2026-11/social-protection/stage.js`) into
   `data/inbox/2026-11-heat-network/` with the terms the checker has to find (the organisation name and the
   specific work named in `does`). Only confirmed links replace the old URL.
2. Where no such page exists, keep the homepage, keep `link: "home"`, and say "homepage only" on the card.
3. For `does` under 90 characters: rewrite only from the confirmed page, in one or two sentences, saying what was
   done, where and when. Keep the old text in `edits.json` beside the new, with the source URL.
4. `does` text is in `data.js`. Measure the homepage weight before and after. If the budget is at risk, keep the
   homepage `does` as it is and put the longer text in `ORG_FACETS` as `more`, shown only on the finder.

### PR 4: ties

1. `links-draft.js`: list every pair where one record's `does` names another record (54 such mentions were
   measured). This is a list of leads, not data.
2. For each lead, find one source naming both; stage and check it; `apply.js` writes `ORG_LINKS.json` from
   confirmed rows only.
3. On each card: "Works with" as plain links to the other cards, with the kind in words. No graph drawing in this
   PR; a drawn network is a later, separate decision.
4. `check-heat-network.js`: both ids exist, the kind is valid, every tie has a checked source, no self-ties.

### PR 5: the coverage grid

1. Fill `ORG_GRID.json` from records already held (a weather service already listed fills its cell). This needs no
   new research.
2. Add `view=grid` to the page: countries down, roles across, on a phone one country per fold with its roles as a
   list. A filled cell links to its cards. An empty cell shows the wording in 4.3.
3. A short lede above it: what the grid is, that it shows what this site has found so far, and that an empty cell
   is an invitation to tell us (`/join/`).
4. The grid also goes into `llms-full.txt` and the CSV download (a second file, `heat-network-coverage.csv`).

### PR 6 onward: growth, one checked batch per PR

Order: the thinnest places first (Pakistan, Vietnam, Cambodia, Malaysia, Sri Lanka, then Myanmar, Laos, Maldives,
Afghanistan, Bhutan, Brunei, Timor-Leste), then the under-held types (worker organisations, employers, health
services, city governments outside India).

Sources of leads, in this order, because each is a list that can be checked:

1. **The site's own records:** partners named in the India heat action plan archive; administrators and delivery
   organisations in `data/social-protection/`; publishers in `data/heat-tools/catalogue.json`; `INSTITUTIONS`;
   funders in the funder records; actors in `data/site/signals.json`.
2. **The mandated-role grid:** for each empty cell, the national body's own site.
3. **Published member and partner lists:** the Global Heat Health Information Network and its hubs, the C40 Cool
   Cities Accelerator, the Zurich Climate Resilience Alliance, Start Network, the Cool Coalition, and Red Cross
   and Red Crescent societies with a heat early action protocol. Membership alone is not heat work: a record needs
   its own page showing what it does on heat, or it is not added.
4. **Leads already held:** `research/2026-11/preventionweb-heat/catalogue.json`.

For every batch: `research/2026-11/heat-network/batch-<n>/` holds `leads.json`, `stage.js` output, the check
result, `apply.js` and `dropped.json`. A record is added only with a confirmed link that shows heat work, a
`does` of one or two sentences taken from that page, and full facets. Mark each grid cell searched with its date
whether or not something was found.

## 6. Acceptance, for the whole programme

- Every check in `CLAUDE.md` passes, plus `tools/check-heat-network.js`.
- Homepage weight stays inside its budget with no `--update`.
- `/heat-network/` works with no JavaScript, by keyboard, and at 390px.
- Page text and `llms-full.txt` come from one text module.
- The homepage `#network` section, city cards, print pages, the exit card count and the sources page still render
  as before (compare screenshots before and after PR 1 and PR 2).
- No record without facets; no tie without a checked source; no grid cell that hides the difference between "not
  found" and "not looked for".

## 7. Decisions that are the owner's

Ask before acting on any of these.

1. **Merging the duplicate pairs** (Ahmedabad Municipal Corporation, India Meteorological Department, Singapore
   Management University, HT Parekh Foundation, PAGASA). Recommended: keep the id that other data refers to
   (`CITY_PROFILES.orgs`, social protection `org_id`), fold the other's text into it, and keep the dropped id as an
   alias so old links land.
2. **Showing empty grid cells in public.** Recommended: yes, with the wording in 4.3, since the site already says a
   gap is a task to solve together.
3. **The homepage showing its own set** while the finder shows more (4.4). Recommended: yes, to protect the
   homepage weight.
4. **The 8 groups.** They mix place, function and money. Recommended: keep them as anchors and as the no-JavaScript
   order, and let `type` do the sorting work in the finder. Renaming them is a separate choice.
5. **A way for organisations to suggest or correct a listing.** Recommended: a line on the page pointing to
   `/join/` and `/corrections/`; no form that sends data anywhere new.

## 8. Not in this work

- A drawn network graph.
- Profile pages per organisation (cards with anchors serve instead; revisit after PR 5).
- Any score, tier, ranking or "top" list.
- Changes to the pop-ups, the film or the homepage `#network` interaction.
