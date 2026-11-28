# Heat in markets and street vending, November 2026

The page `/market-heat/` and its worksheet `/market-heat/worksheet/` started from the owner's Market Heat build pack
(28 November 2026: a master prompt, six starter `#rec-*` records and a one-page worksheet). This folder holds the
evidence batch behind the page and the record of what changed from the pack.

## Files
- `claims.json`: every figure the page uses, tied to the exact words its source has to hold
- `stage.js`: stages the sources in `data/inbox/2026-11-market-heat/` for `verify-sources.yml`
- `gate.js`: writes `confirmed.json` (claims every term of which was found) and `dropped-after-check.json`

Words live in `tools/market-heat-text.js`; the builder is `tools/build-market-heat.js`; the check is
`tools/check-market-heat.js`. The page reuses `factory-heat/factory.css` and `factory-heat/factory.js` (the plan,
finder, comparison and shortlist), with `market-heat/market.css` and its own shortlist key, `mh-shortlist`.

## What changed from the pack, and why
- **Key names.** The pack's records used long key names (`title`, `how_it_works`, `works_if` as text). The shared
  script reads `data-rec` and `data-f` fields that the builder writes from the factory record shape (`t`, `how`,
  `works` as a list, and so on), so the records use that shape. Ids drop the `rec-` prefix, which the build adds to the
  anchor (otherwise `#rec-rec-stall-buddy`).
- **Evidence labels.** The pack's tiers ("Measured in a study", "Reported, not evaluated") were replaced by the
  page's own kinds of evidence, which say what was measured: a study of the harm is not a study of the measure, and a
  shade trial measured air temperature in a car park, not vendors' health.
- **Figures held back after the check.** The Bangkok hours figure (the PDF's text could not be read), the Rewa grant
  (PreventionWeb blocked the checker), and the Peliyagoda ice price (the original notice is no longer online). The
  Delhi survey is cited for what the press release holds (over 700 vendors); the exact 721, 80% and 49% are in the
  full report, which was not checked.
- **Attribution.** The Delhi heat boards are cited to Greenpeace India's own account, the source the check read,
  not to a news report.
- **Voice.** Instructions ("Do not apply", "Ensure") were rewritten as descriptions of what helps; no em dashes.
- **Additions.** Four records built from the site's existing market sketch (`data/core/MARKET_EXPLORER.json`): a
  water point, a shaded rest place, trees, and pitch protection before upgrades.

## The check
Two runs of `verify-sources.yml` (`month: 2026-11-market-heat`). The second made no commit: the checker resumes and
does not re-read pages it has checked, so the two claims revised after the first run (Delhi survey, Nagpur nets) pass
on the checker's stored excerpts of those pages, which `gate.js` accepts.
