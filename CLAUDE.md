# CLAUDE.md: Common Shade (beattheheat.asia)

## What this is
A free, open, non-commercial evidence platform on extreme heat in South and Southeast Asia. Common Shade was first published as BeatTheHeat.Asia and is moving to commonshade.asia. It covers:
- an interactive map of consequences, vicious cycles and levers
- a solutions library, funders and funding, and city and country pages
- simulations, a planning workbook (/plan/) and an India heat action plan archive
- /llms-full.txt for AI systems

Counts are calculated from data at build time. Never type a count into a page; read the current numbers from the build output. Readers are city officials, health workers, unions, NGOs, funders and researchers, many of them on low-end Android phones and slow networks.

## The first rule
Every decision elevates the reader's experience (UX), the maintainer's experience (DX) and the AI agent's experience (AX) at once, without breaking anything. A change that helps one at the cost of another is not finished: for example, a feature that adds weight to the homepage for a page most readers never open, a check whose failure does not say what to fix, or page text that differs from what llms-full.txt says. Test what already works before shipping.

## Hard rules
1. **Zero budget.** GitHub Pages only: no paid APIs, servers, databases or accounts.
2. **No new dependencies without asking.** Pages are plain HTML, CSS and vanilla JS. The Node scripts in `tools/` generate the pages, and the output is committed. Ask before adding any library to pages or tools.
3. **Privacy first.** Visitor input stays in the browser (localStorage or the URL). Already in use, and nothing else without asking:
   - Google Fonts
   - GoatCounter, cookieless analytics (`SITE_ANALYTICS` in data.js)
   - Open-Meteo and data.gov.sg (live heat)
4. **Every claim needs a checked source.** Never invent statistics, studies, URLs or quotes. Label illustrative numbers "illustrative". The session has no open internet, so verify links on GitHub with `verify-urls.yml` or `verify-sources.yml` (Europe PMC for publisher pages that block bots).
5. **Humble, diplomatic voice.** The aim is awareness, blind spots and solutions, never blame.
   - In the site's own voice: no "should" or "must", no em dashes (use "-"), and no words that suggest wrongdoing, even when denied. `tools/check-voice.js` enforces this.
   - Name no individuals or journalists. Use drawn, faceless figures only.
   - Be ready to say sorry and correct (/corrections/).
6. **Keep data counts and existing content as they are** unless asked. Never delete content without asking.
7. **Accessibility and speed.** Semantic HTML, keyboard access, AA contrast, tap targets of at least 24px, no sideways scroll at 390px, and fast on 3G.
8. **Funders.** Wellcome and every other funder stays in the funder records. Do not mention Wellcome in evidence briefs.

## Where things live
- `data/core/*.json`: source of truth for the map. `node tools/build-data.js` turns it into `data.js`. A block marked `"browser": false` in the manifest is build-only: it stays out of `data.js` (so visitors never download it) and builders add it with `require("./data-blocks.js")()`. Keep the JSON formatting by editing strings in place or using `ser()` from build-data.js.
- `data/site/*.json`: site words (nav.json for the menu, crumbs and names; tone.json is in `data/schema/`). `data/kb/` holds monthly knowledge-base records.
- `index.html`, `script.js`, `styles.css`: the homepage map. Shared styles for all pages are in `styles.css`.
- `tools/build-static.js`: builds everything (it calls build-pages.js, build-nav.js and the others). Each section has its own builder, such as `build-intersections.js` or `build-hap-archive.js`.
- Page folders such as `/plan/`, `/atlas/`, `/intersections/` and `/resources/heat-action-plans/india/` each hold a generated `index.html` and, where there is one, the page's own script.
- `research/YYYY-MM/`: verified research sets and link checks. They are published as files but never linked as pages.
- `research/india-hap-archive/`: the HAP catalogue CSVs, report and downloader (see its README).
- `tools/launch/`: the 20-second launch film (scene, shots, music, renderer); files in `media/launch/`. Its homepage card was removed in November 2026 (the site owner's decision); the film files stay.
- `tools/mapguide/`: the map guide film, in which a drawn, faceless guide walks through real captures of the map. It plays from "Watch: how to read the map" under the legend. Files are in `media/mapguide/` (9:16 and 16:9); see its README.
- `media/`: films and covers. `tools/explainers/`, `tools/films/` and `tools/shorts/` build them (Piper voice, Playwright render).
- `data/evidence/` and `tools/living-evidence/`: the weekly evidence review. A Monday job harvests studies and opens a review pull request; merging is the sign-off; accepted studies join their cycles on the Evidence map. See `data/evidence/README.md`.
- `.github/workflows/`: data checks, link checks, news feed, source and URL verification, and the weekly evidence review.
- `tools/site-counts.js` → `data/site/counts.json` (generated): each builder records the headline counts it prints (solutions, sources, schemes and so on), so anything showing a count reads the page's own figure. The menu (`data/site/nav.json`) writes a count as `{key}`, filled by `tools/nav-counts.js`; `build-data.js --check` refuses a typed count there, and any publication date after today in the news feeds.
- Pop-ups, on every page of every visit (the site owner's choice, November 2026). Each rests for the rest of a visit once the reader answers it, and only one shows at a time (`<html data-cs-pop>`):
  - the invitation (`join.js`)
  - the State of the field notice (`tools/site-nav.js`)
  - the exit card "Everything Common Shade covers" (`tools/build-everything.js` → `everything.js`, also listed in llms.txt)
  The two scripts load 2.5 s after the page loads. Check a card with `?preview=invite` or `?preview=everything`.

## Every change
1. Edit the source (data, builder or page script), never only the generated HTML.
2. Build with `node tools/build-static.js`.
3. Run the checks: `node tools/check-voice.js`, `node tools/check-data.js`, `node tools/build-data.js --check`, `npm run check:hap`, `node tools/living-evidence/check.js`, `node tools/check-agent-files.js` (the machine-readable files), `node tools/check-weight.js` (speed budget, and a media budget: a new file in `media/` over 8 MB fails, and the published site warns at 700 MB of GitHub Pages' 1 GB; after a deliberate change in weight, record it with `--update`), then `git add -A` and `node tools/check-site.js` (Playwright, tracked pages only).
4. When styles.css or a script changes, bump the cache version `?v=N` across all HTML and JS.
5. Commit with a clear message, push to the session branch, open a PR, merge, then fast-forward the branch. Never force-push. Never run git stash or pull while a film render is writing files.

## Code and data conventions
- Page scripts are IIFEs with "use strict". Builders pass their data in as `window.X` JSON. With no JavaScript, the page still shows its content.
- Reuse the existing classes (`pg-hero`, `hub-*`, `sol-bar`, `lv-*`) and colour tokens (`--ink`, `--orange`, `--ember`, `--line`). Match the visual style.
- IDs are stable and never renumbered. Each source has a label or title and a url.
- Every data widget handles loading, no network, error and empty states. Add a check for any calculation or import.
- A lever can carry `watch`: documented side effects, each with sources. They show as "Watch for" on the map, on /actions/ and in llms-full.txt, and `build-data.js --check` checks their format. Research batches that deepen the map use the pattern in `research/2026-11/gap-lenses/`: a patch file per batch, `audit.js` to check every number against its checked source, and `apply.js`, which refuses unconfirmed sources, missing ids and duplicates.
- Homepage story: each open section (`HOME_OPEN`) uses the `.story` anatomy (eyebrow, `h2.story__h`, lede, one focal point, one action, a `.story__more` fold) and its act tone. Homepage numbers sit in `data-stat` spans that the build fills from data. Only the ticker and click-driven animations loop. `build-data.js --check` enforces all three.
- Keep each change to what was asked. Prefer targeted edits to rewrites.

## Heat action plan research (observatory)
- The India archive is built from `research/india-hap-archive/India_HAP_Combined_Verified.json`, a complete replacement catalogue. Do not append additions. To update it, replace the combined files, record recovered gaps in `resolved.json`, update `expected.json`, rebuild and run `npm run check:hap`. The type comes from `document_type`, which must match the notes prefix. Editions are shown as printed. Leads and unresolved rows never count as verified. See the README in that folder.
- Planned plan scoring:
  - Put extracted text (not PDFs) in `research/hap-text/<id>.txt`.
  - Score against `research/hap-rubric.md` into `research/hap-scores/<id>.json`.
  - Every score above 0 cites a page and a quote of 30 words or fewer.
  - When unsure, score lower with "confidence": "low".

## How heat became visible
`/how-heat-became-visible/` is built by `tools/build-visibility.js` from the build-only block `HEAT_VISIBILITY`, which `research/2026-11/heat-visibility/convert.js` writes from the checked research and its reviewed `edits.json` (never edit the block by hand). `tools/visibility-text.js` holds what the page and `llms-full.txt` share. Its sources were checked as a separate batch, `data/inbox/2026-11-heat-visibility/`, with `verify-sources.yml` (`month: 2026-11-heat-visibility`); the checker reads PDFs and resumes where it stopped. What was left out is in `research/2026-11/heat-visibility/dropped.md`.

## Social protection
`/social-protection/` ("Who could help a household through a hot season") is built by `tools/build-social-protection.js` from the build-only block `SOCIAL_PROTECTION`: one file per country in `data/social-protection/` (schema in its README). `tools/social-protection-text.js` holds what the page and `llms-full.txt` share. To add a country, save its research reply in `research/2026-11/social-protection/`, add its code to `CODES` in `convert.js`, then run `stage.js`, `verify-sources.yml` (`month: 2026-11-social-protection`) and `convert.js`; only confirmed records reach the data, and the rest is listed in `dropped-after-check.json`. Never rank governments or organisations; households in aggregate only.

## Watch Common Shade grow
`/growing/` is built by `tools/build-growing.js` from one record of changes, `data/site/growth.json` (one reviewed entry per change, traced to its pull request; `build-data.js --check` checks it). `tools/growth-text.js` holds what the page, `llms-full.txt` and "What it took to add this" share; effort is counted from each batch's own check files, never typed. Beneath the canopy, the work the site draws on is dated by publication (`tools/growth-dates.js` → `data/site/growth-dates.json`; `date-sources.yml` runs `tools/fetch-dates.js` for Crossref, page metadata and "online by" dates). Add a change after each merged update; a changed file hash alone is not a change. Never present growth as protection achieved.

## For AI agents
`/for-ai/` ("For AI agents") is built by `tools/build-for-ai.js` from `tools/for-ai-text.js`, which also writes `/for-ai.json` and `/for-ai.txt` and adds a section to `llms.txt` and `llms-full.txt` and an entry to `sitemap.xml`. Counts come from the build, never typed; the build fails, naming the path, if an endpoint it lists does not exist. Its do and please-avoid lines restate standards already on `/approach/`, `/cite/` and in the disclaimer; add to them only from those. The shared footer carries a "Not a human?" strip that links to it. It never asks an agent to override its user or its own guidelines, and nothing on it is hidden from people.

## Machine-readable files
`tools/build-agent-files.js` runs last in build-static.js and writes `/.well-known/` (ard.json, api-catalog, security.txt, tdmrep.json), `/openapi.json`, `/sitemap.json`, `/agents.txt`, `/auth.md`, `/terms-of-use.md`, `/feed.xml` (from growth.json) and an `index.md` twin beside every page, and adds a small head block between `<!--agent-->` markers. The open files it describes come from ENDPOINTS in `tools/for-ai-text.js`. `_config.yml` keeps GitHub Pages from hiding `/.well-known/`. GitHub Pages cannot set headers or negotiate `Accept: text/markdown`, so none is claimed. `/privacy/` (`tools/build-privacy.js`) restates what the code does: change it in the same pull request as any new third-party call.

## Heat shorts
`.claude/skills/heat-shorts/` makes short explainer films with faceless figures, a humble voice, checked sources and no em dashes. It builds on the repo's own renderer by default; the Remotion route needs the user's agreement. It is adapted from an MIT-licensed skill, with the reference frames left out.

## Monthly update
`/monthly-heat-update [YYYY-MM]` (`.claude/commands/monthly-heat-update.md`) researches, verifies and publishes the month across the whole site.

## Saving usage
Read only the files the task needs, using the map above. Write one script to process many files instead of handling them one by one. End by listing the files changed and the checks run.
