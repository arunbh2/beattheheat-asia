---
description: Research, verify and publish this month's update to Common Shade (beattheheat.asia), then write the State of the field brief
argument-hint: "[YYYY-MM, defaults to this month]"
---

You are running the monthly update for Common Shade, a shared map for everyone working to protect people from extreme heat in South and Southeast Asia. The month is `$ARGUMENTS` if given, otherwise this month (YYYY-MM). Work on the session's designated branch. Publish only what passes every check. Never relax a check to get something through.

## The standing rules (they apply to every word)
- **Careful, diplomatic, non-political.** No blame, no ranking of countries, cities or organisations, no political positions. A gap describes what we found, never a fault.
- **No shadow of wrongdoing.** Never write that someone did not do something wrong ("no mis-selling alleged", "misuse not established"): even a denial plants the idea. Describe what we could and could not see instead. The voice check holds these words on every page.
- **Humble.** Describe what helps, what it depends on and who could act. Never instruct ("should", "must" in the site's own voice). Laws, standards and quoted headlines keep their own words.
- **Known, inferred, uncertain.** Measured, official or peer-reviewed findings are known; models, projections and news reports of findings are inferred; unconfirmed reports are uncertain. A projection is never known.
- **Sourced and verifiable.** Every record rests on a source that opens, has an archived copy, and contains the terms we rely on.
- **No individual names** in the site's own text (no journalists, officials or private people). Drawn, faceless figures only.
- **Built together, open to correction.** If something already published turns out to be wrong, publish a corrected record with `replaces`, a `correction` note and, where owed, a short `sorry`.
- Read `data/README.md`, `data/schema/records.json` and `data/schema/tone.json` before writing records.

## 1. Find the gaps
Read `data/kb/_changes.json`, `data/reports/` (last two months), `data/site/learning.json`, `data/site/milestones.json` and `heat-economy/flows/` (cycles with no traced funding). List what to look for this month:
- new or updated heat plans, rules, roles and programmes in South and Southeast Asia (Atlas milestones, with approximate lat/lon);
- funding for heat protection, especially philanthropy (funder, recipient, instrument, stage, amount or `disclosed: false`, `funder_kind`, `philanthropy_role`, `segment`, cycles, countries);
- studies that answer, or sharpen, a learning-agenda question; new open questions;
- anything older than its re-check date, and any correction readers have sent.

## 2. Research
Use web search (extended where needed). Prefer official, peer-reviewed and established sources; use news to find things, then look for the primary source. Keep a note of anything found only on low-reliability sites: it may be drafted, but the reviewer holds it.

## 3. Draft the inbox
Write records to `data/inbox/<month>/` (`sources.json`, `records.json`). Every source has `url`, an empty `archive`, `kind`, and `expect`: two to five key terms its page must contain. Summaries at this stage are provisional.

## 4. Verify on GitHub
Commit and push the inbox, then run the **Verify sources** workflow (`verify-sources.yml`) with the month on the session's branch. Wait for its commit ("Verify sources for <month>"), pull, and read `data/inbox/<month>/_excerpts.json`. If a page could not be read, re-run once; otherwise leave it to be held.

## 5. Review, from the real text
Rewrite every summary from the excerpts, not from memory or search snippets. Then give each record its reviewer's note: `review: { tone: "ok", note }`, plus `addresses` for any flag the checker raises. Hold anything uncorroborated with `review: { tone: "hold", note: "<reason>" }`. Suggestions readers sent through a page's "Does this feel right?" check arrive in the join form: treat each as a lead, verify it like any other source, and when it leads to a change, add `correction` (what was wrong), a short `sorry` where one is owed, and `credit` only if the reader asked for it. The corrections page, the city page's "Recently updated here" and returning readers' "updated since your last visit" note all follow automatically. Run `node tools/check-data.js <month>` until every record either passes or is held for a stated reason.

## 6. Publish
Run `node tools/merge-inbox.js <month>` (with `PW` set to the Playwright path for the site check). It publishes what passes, holds the rest with reasons, rebuilds the site, checks the voice of every page and tests every page at phone and desktop widths. If gate 7 fails, nothing is published: fix the cause and run it again.

If a cycle's evidence changes in a way that touches its composite person (`data/site/people.json`), update the story so it stays true to the evidence: a role, never a name, and no figures of its own.

## 7. Write the State of the field brief
Write `data/site/briefs/<month>.json` (see `2026-10.json`): four short sections (where philanthropic money moved; one opportunity the evidence supports; one question that grew in importance; what changed on Common Shade), each linking to the pages that show it. Calm, citable and humble, with no asks. Rebuild (`node tools/build-static.js`) and run `node tools/check-voice.js`.

## 8. Ship
Run `node tools/check-site.js`, `node tools/check-data.js` and `node tools/build-data.js --check`. Commit with a clear message, open a pull request, merge it once the checks pass, and fast-forward the branch to `main`.

## 9. Report back, and the private notes
Tell the owner, plainly:
- what went live, what was held back and why (`data/reports/<month>.md`);
- which films quote a figure that changed (search `tools/shorts/`, `tools/explainers/` for the old value);
- what to research next month.

Then write, privately (scratchpad only, never on the site): a LinkedIn draft in the owner's voice, built only from this month's verified records, that never names Common Shade (an optional first comment may link to `/whats-new/`). Each quarter (January, April, July, October), also draft a short strategy memo for climate and health philanthropy: "If a foundation had US$10 million for extreme heat in South and Southeast Asia", drawn from Follow the money, the Evidence map and Who holds it up.
