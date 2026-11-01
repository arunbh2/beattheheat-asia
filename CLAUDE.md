# CLAUDE.md: Common Shade (beattheheat.asia)

## What this is
A free, open, non-commercial evidence platform on extreme heat in South and Southeast Asia. Common Shade was first published as BeatTheHeat.Asia and is moving to commonshade.asia. It covers:
- an interactive map of consequences, vicious cycles and levers
- a solutions library, funders and funding, and city and country pages
- simulations, a planning workbook (/plan/) and an India heat action plan archive
- /llms-full.txt for AI systems

Counts are calculated from data at build time. Never type a count into a page; read the current numbers from the build output. Readers are city officials, health workers, unions, NGOs, funders and researchers, many of them on low-end Android phones and slow networks.

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
- `data/core/*.json`: source of truth for the map. `node tools/build-data.js` turns it into `data.js`. Keep the JSON formatting by editing strings in place or using `ser()` from build-data.js.
- `data/site/*.json`: site words (nav.json for the menu, crumbs and names; tone.json is in `data/schema/`). `data/kb/` holds monthly knowledge-base records.
- `index.html`, `script.js`, `styles.css`: the homepage map. Shared styles for all pages are in `styles.css`.
- `tools/build-static.js`: builds everything (it calls build-pages.js, build-nav.js and the others). Each section has its own builder, such as `build-intersections.js` or `build-hap-archive.js`.
- Page folders such as `/plan/`, `/atlas/`, `/intersections/` and `/resources/heat-action-plans/india/` each hold a generated `index.html` and, where there is one, the page's own script.
- `research/YYYY-MM/`: verified research sets and link checks. They are published as files but never linked as pages.
- `research/india-hap-archive/`: the HAP catalogue CSVs, report and downloader (see its README).
- `media/`: films and covers. `tools/explainers/`, `tools/films/` and `tools/shorts/` build them (Piper voice, Playwright render).
- `.github/workflows/`: data checks, link checks, news feed, source and URL verification.

## Every change
1. Edit the source (data, builder or page script), never only the generated HTML.
2. Build with `node tools/build-static.js`.
3. Run the checks: `node tools/check-voice.js`, `node tools/check-data.js`, `node tools/build-data.js --check`, `npm run check:hap`, then `git add -A` and `node tools/check-site.js` (Playwright, tracked pages only).
4. When styles.css or a script changes, bump the cache version `?v=N` across all HTML and JS.
5. Commit with a clear message, push to the session branch, open a PR, merge, then fast-forward the branch. Never force-push. Never run git stash or pull while a film render is writing files.

## Code and data conventions
- Page scripts are IIFEs with "use strict". Builders pass their data in as `window.X` JSON. With no JavaScript, the page still shows its content.
- Reuse the existing classes (`pg-hero`, `hub-*`, `sol-bar`, `lv-*`) and colour tokens (`--ink`, `--orange`, `--ember`, `--line`). Match the visual style.
- IDs are stable and never renumbered. Each source has a label or title and a url.
- Every data widget handles loading, no network, error and empty states. Add a check for any calculation or import.
- Keep each change to what was asked. Prefer targeted edits to rewrites.

## Heat action plan research (observatory)
- The India archive is built from `research/india-hap-archive/`. Replace the CSV, update `expected.json`, rebuild and run `npm run check:hap`. Document types come only from the notes prefix. Years are shown as printed. Unresolved rows never count as verified.
- Planned plan scoring:
  - Put extracted text (not PDFs) in `research/hap-text/<id>.txt`.
  - Score against `research/hap-rubric.md` into `research/hap-scores/<id>.json`.
  - Every score above 0 cites a page and a quote of 30 words or fewer.
  - When unsure, score lower with "confidence": "low".

## Saving usage
Read only the files the task needs, using the map above. Write one script to process many files instead of handling them one by one. End by listing the files changed and the checks run.
