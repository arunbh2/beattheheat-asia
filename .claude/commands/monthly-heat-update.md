---
description: Research, verify and publish this month's update to the whole of Common Shade (beattheheat.asia) - knowledge base, weekly evidence review, heat action plan archive, links, counts and films - then write the State of the field brief
argument-hint: "[YYYY-MM, defaults to this month]"
---

You are running the monthly update for Common Shade, a shared map for everyone working to protect people from extreme heat in South and Southeast Asia. The month is `$ARGUMENTS` if given, otherwise this month (YYYY-MM). Work on the session's designated branch. Publish only what passes every check. Never relax a check to get something through. Read `CLAUDE.md` first; its rules apply throughout.

## The standing rules (they apply to every word)
- **Careful, diplomatic, non-political.** No blame, no ranking of countries, cities or organisations, and no political positions. A gap describes what we found, never a fault.
- **Plain hyphens.** Use "-", never an em dash. The voice check holds it on every page.
- **No shadow of wrongdoing.** Never write that someone did not do something wrong ("no mis-selling alleged", "misuse not established"): even a denial plants the idea. Describe what we could and could not see instead.
- **Humble.** Describe what helps, what it depends on and who could act. Never instruct ("should" or "must" in the site's own voice). Laws, standards and quoted headlines keep their own words.
- **Known, inferred, uncertain.**
  - Known: measured, official or peer-reviewed findings.
  - Inferred: models, projections and news reports of findings. A projection is never known.
  - Uncertain: unconfirmed reports.
- **Sourced and verifiable.** Every record rests on a source that opens, has an archived copy, and contains the terms we rely on. Never invent a figure, study, URL or quote.
- **No individual names** in the site's own text (no journalists, officials or private people). Drawn, faceless figures only. Funder records keep every funder, Wellcome included.
- **Built together, open to correction.** If something already published turns out to be wrong, publish a corrected record with `replaces`, a `correction` note and, where owed, a short `sorry`.
- **Zero budget.** No paid services. Outside links are checked on GitHub (`verify-urls.yml`, `verify-sources.yml`), because this session cannot reach most sites.
- Read `data/README.md`, `data/schema/records.json` and `data/schema/tone.json` before writing records.

## 1. Find the gaps
Read the following:
- `data/kb/_changes.json`
- `data/reports/` (last two months)
- `data/site/learning.json`
- `data/site/milestones.json`
- `heat-economy/flows/` (cycles with no traced funding)
- the open **weekly evidence review** pull requests (`data/evidence/inbox/`)
- `research/india-hap-archive/India_Heat_Action_Plans_Unresolved.csv`

List what to look for this month:
- new or updated heat plans, rules, roles and programmes in South and Southeast Asia (Atlas milestones, with approximate lat/lon);
- funding for heat protection, especially philanthropy (funder, recipient, instrument, stage, amount or `disclosed: false`, `funder_kind`, `philanthropy_role`, `segment`, cycles, countries);
- studies that answer, or sharpen, a learning-agenda question; new open questions;
- new Indian heat action plans or editions, and documents on the unresolved list that may now be retrievable;
- anything older than its re-check date, and any correction readers have sent.

## 2. Research
Use web search (extended where needed). Prefer official, peer-reviewed and established sources. Use news to find things, then look for the primary source. Keep a note of anything found only on low-reliability sites: it may be drafted, but the reviewer holds it.

## 3. Draft the inbox
Write records to `data/inbox/<month>/` (`sources.json`, `records.json`). Every source has `url`, an empty `archive`, `kind`, and `expect` (two to five key terms its page must contain). Summaries at this stage are provisional.

## 4. Verify on GitHub
Commit and push the inbox, then run the **Verify sources** workflow (`verify-sources.yml`) with the month on the session's branch. Wait for its commit ("Verify sources for <month>"), pull, and read `data/inbox/<month>/_excerpts.json`.
- If a publisher blocks the checker, confirm the abstract through Europe PMC instead.
- If a page could not be read, re-run once; otherwise leave it to be held.

## 5. Review, from the real text
Rewrite every summary from the excerpts, not from memory or search snippets. Then give each record its reviewer's note: `review: { tone: "ok", note }`, plus `addresses` for any flag the checker raises. Hold anything uncorroborated with `review: { tone: "hold", note: "<reason>" }`.

Suggestions readers sent through a page's "Does this feel right?" check arrive in the join form. Treat each as a lead and verify it like any other source. When one leads to a change, add `correction` (what was wrong), a short `sorry` where one is owed, and `credit` only if the reader asked for it.

Run `node tools/check-data.js <month>` until every record either passes or is held for a stated reason.

## 6. The weekly evidence review
For each open "Evidence review" pull request:
- Read every pending study (link and abstract).
- For promising ones, read the full text where it is open, and confirm or correct the rule-suggested fields (sample size, place, climate zone, effect size, unit cost, failure modes). Never copy a value you cannot confirm.
- Draft the decisions and review fields, following `data/evidence/README.md`.
- Run `node tools/living-evidence/check.js`.

The owner signs off by merging, so list for the owner what you propose to accept and why. Do not merge evidence pull requests yourself unless the owner has said to.

If accumulated studies suggest a cycle's status (`emerging` or `established`) or a learning-agenda question has changed, propose it in the report rather than changing it.

## 7. The heat action plan archive
- For each new Indian plan or edition found:
  - add a row to `research/india-hap-archive/India_Heat_Action_Plans_Verified.csv`, using the same 16 columns, a stable new `id`, the printed year or period exactly, and a notes prefix (`HAP`, `EMBEDDED_HEAT_HEALTH_PLAN`, `NATIONAL_PLAN` or `GUIDANCE`) followed by `checked YYYY-MM-DD`;
  - only after its PDF is confirmed, through `verify-urls.yml` and the content.
- Move resolved rows out of the unresolved file.
- Update `expected.json` and the coverage report's totals.
- Run `npm run check:hap`.
- Keep separate editions as separate rows, and never infer a year from a filename.

## 8. Site health
- **Links.** List every outside link on the site and run `verify-urls.yml` with `archive: no`.
  - For each page that no longer exists: link a verified new address, or keep the label and say plainly that the original is no longer online.
  - Treat a blocked or timed-out government site as unconfirmed, not dead.
- **Numbers typed by hand.** Compare the figures in `data/site/nav.json`, film specs (`tools/explainers/`, `tools/shorts/`) and page text with the build output (funders, solutions, cycles, levers, consequences, documents). Fix labels. For films, update the spec and re-render with the existing pipeline, or list them in the report.
- **Text.** Scan the built pages for "undefined", "NaN", "null" and template leftovers.

## 9. Publish
Run `node tools/merge-inbox.js <month>` (with `PW` set to the Playwright path for the site check). It does the following:
- publishes what passes and holds the rest with reasons;
- rebuilds the site;
- checks the voice of every page;
- tests every page at phone and desktop widths.

If gate 7 fails, nothing is published: fix the cause and run it again. If a cycle's evidence changes in a way that touches its composite person (`data/site/people.json`), update the story so it stays true to the evidence: a role, never a name, and no figures of its own.

## 10. Write the State of the field brief
Write `data/site/briefs/<month>.json` (see `2026-10.json`). It has four short sections, each linking to the pages that show it:
1. where philanthropic money moved;
2. one opportunity the evidence supports;
3. one question that grew in importance;
4. what changed on Common Shade, including studies added through the weekly review and documents added to the archive.

Keep it calm, citable and humble, with no asks. Rebuild (`node tools/build-static.js`).

## 11. Ship
Bump the cache version (`?v=N`) if styles or scripts changed. Then run:
- `node tools/check-voice.js`
- `node tools/check-data.js`
- `node tools/build-data.js --check`
- `npm run check:hap`
- `node tools/living-evidence/check.js`
- `git add -A`, then `node tools/check-site.js`

Commit with a clear message, open a pull request, merge it once the checks pass, and fast-forward the branch to `main`. Never force-push.

## 12. Report back, and the private notes
Tell the owner, plainly:
- what went live, what was held back and why (`data/reports/<month>.md`);
- the weekly evidence review: studies proposed for acceptance, and any cycle or question whose evidence has shifted;
- the archive: documents added, and gaps closed or still open;
- site health: dead links fixed, labels corrected, films that still quote an old figure;
- what to research next month.

Then write, privately (scratchpad only, never on the site), a LinkedIn draft in the owner's voice:
- built only from this month's verified records;
- never naming Common Shade (an optional first comment may link to `/whats-new/`).

Each quarter (January, April, July, October), also draft a short strategy memo for climate and health philanthropy: "If a foundation had US$10 million for extreme heat in South and Southeast Asia", drawn from Follow the money, the Evidence map and Who holds it up.
