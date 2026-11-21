# Funding, opportunities and careers: implementation map (21 November 2026)

What exists, what it does, what changes, and what depends on it. Written before editing.

| Existing file | Purpose today | Change | Depends on it |
|---|---|---|---|
| `tools/build-economy.js` | Builds /heat-economy/ and four sub-pages from `research/2026-10/economy/*.json`. `/heat-economy/money/` = traced funding table, 77 "funders and investors" (48 researched + 29 added from deals, `data/kb/funding.json` and risk-finance actors), 24 accelerators/prizes, every traced deal. | Keep every section and anchor (`#where`, `#investors`, `#inv-*`, `#programmes`, `#prog-*`, `#deals`). Add a new first section, "The funding landscape" (`#landscape`), rendered by the new `tools/build-funding.js`, plus "What needs funding?" (`#needs`). Relabel the investor list to separate venture investors (equity) from grant funders, without removing anyone. Call `build-funding.js` to write the two new pages with the same shell. | nav counts (`funders`, `fundingTraced`, `programmes` in counts.json), /fund/ hub, /heat-economy/flows/, Ideas page links `#inv-*`/`#prog-*`. |
| `research/2026-10/economy/investors.json`, `programmes.json` | October research: 48 investors (mostly equity and blended), 24 programmes (accelerators, prizes, some completed). | Left as is (historical record). The legacy audit (link and status) is recorded in `research/2026-11/funding-opportunities/legacy-audit.json`; programme cards whose competition has ended gain a "Completed competition" label from that audit. | Ideas page `fit_investors`. |
| `data/kb/funding.json`, `deals.json` | Historical awards and commitments. | Not duplicated. Programme profiles link to them as "past support" by id. Never summed with programme budgets. | Follow the money. |
| `data/core/ORGANISATIONS.json` (67 with role `funders`) + `ORG_FACETS` | Heat network directory. | Not edited. Funding organisations carry `network_id` where the same organisation is in the directory, so they are one entity with two views. `tools/check-funding.js` flags duplicates by name and domain. | /heat-network/. |
| `data/site/signals.json` | Outside developments (funds announced, adopted, disbursed). | Programmes carry `signals` ids; the programme profile shows "On Signals" with the record's own furthest step, keeping announcement, call, award and disbursement apart. | Signals page. |
| `data/site/nav.json` | Menu. | No new top-level item. In the Fund group: the money item's description changes to name open calls and careers; one tier-2 item each for the two new pages. | site-nav, hub pages. |
| `tools/build-static.js` / `build-pages.js` | Pages, contextual blocks. | Contextual "Funding and opportunities" lines on lever-matched pages (actions, factory heat, cotton, social protection, cities hub) from one list in `tools/funding-text.js`, showing at most three records each. | check-site, weight. |
| `.github/workflows/verify-sources.yml` | Content check of staged sources. | Used as is with batch `2026-11-funding-opps`. | — |
| `.github/workflows/signals-weekly.yml` pattern | Weekly harvest to a review PR. | Copied as `funding-weekly.yml`: re-checks every open record's sources, recalculates status, imports candidates from permitted public APIs (World Bank procurement notices; ReliefWeb jobs when the approved app name exists), opens a review PR with a change summary. | — |

## New

- `data/funding/` (build-only data, never in `data.js`): `organisations.json`, `programmes.json`, `opportunities.json`, `careers.json`, `registry.json` (sources the workflow may read), `rejected.json` (candidates examined and not published, with the reason), `candidates/` (review queue), `README.md` (schema, rules, procedure).
- `heat-economy/funding-core.js`: one copy of the status, freshness, matching, sorting and CSV rules, used by the build, the page script and the check (as `heat-tools/finder-core.js`).
- `tools/build-funding.js`: landscape section, `/heat-economy/money/opportunities/`, `/heat-economy/money/careers/`, CSV downloads, llms text.
- `tools/funding-text.js`: words shared by pages and llms-full.txt.
- `heat-economy/money/funding.js`: filters, URL state, compare (up to three), local shortlist, CSV export, print.
- `tools/funding-harvest.js`: importers, dry run, change summary, status recalculation.
- `tools/check-funding.js`: schema, provenance, dedupe, status fixtures (every edge case in the brief), CSV escaping, page checks.

## Counts and duplication found

- "77 funders" on the menu counts investors, named deal parties and risk-finance actors together, including equity investors; the new landscape counts grant-making organisations separately and the old list is relabelled "Funders and investors (October 2026 research)".
- Hardcoded words: none found with typed counts; all counts come from `N.*` in build-economy.
- Weak citations: some programme records cite press releases about past rounds as if current (e.g. a 2021 prize page). The legacy audit marks them historical.
- The Ideas page is at `/heat-economy/opportunities/`; the new calls page is `/heat-economy/money/opportunities/` and is titled "Open calls and tenders" to avoid confusion.
