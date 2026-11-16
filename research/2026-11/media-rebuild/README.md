# How heat is reported: rebuild, November 2026

The brief: make /how-heat-is-reported/ help journalists, researchers, practitioners and funders find reporting across countries and languages. They should be able to see what each article contains, follow how protection is authorised, financed, delivered and examined, and develop their own reporting question, with methods beside the claims they qualify.

## What was there
- **One long page** of nine sections: two stat rows, a year chart, a patterns table, the missing middle, the pilot's examples, six "connects the dots" cards, three research patterns, questions, and two separate bibliographies with a search box over the first only.
- **No filters, no shared views, no reporting trails, no comparison and no question kit.**
- **"All 103 articles" counted two stories twice.** They appear in both collections (`b06` = `in-deaths-commentary-2023`, `b52` = `region-attribution-2024`), so there are 101 unique records.

## What changed
- **The argument** is now three steps: the first reading, what the wider look found, and the sharper question. Each claim links to the records behind it, and each chart sits next to its limits.
- **One explorer** covers all 101 unique records, with filters on:
  - place, language, collection, year, format, review depth
  - cycle, population and what the review found (pilot coding)
- **Explorer behaviour:**
  - live counts that say whether they count unique or publication records
  - removable chips, reset, and an empty state that offers to remove the last filter
  - the view kept in the address, with Back and Forward
  - a filtered CSV, and 20 records at a time once the script loads (every record without it)
- **Each pilot record has a reporting trail** in four states, built only from reviewed fields. Records read at listing depth say so and carry no trail.
- **Original-language titles come first,** with `lang` and `dir="auto"`. The English translation sits beside each, with its review status.
- **Examples:**
  - ten example cards, with a suggested follow-up question labelled as Common Shade's
  - two comparisons (heat insurance, and Cambodia's factories), where every cell quotes a reviewed field
  - a comparison of any two or three reviewed records, kept in the link
- **"Develop a reporting question":** six topics, any recorded place and four populations. It gives a suggested question labelled as a starting point, matching records, Common Shade pages, kinds of public record, perspectives and what to verify. The brief can be copied, printed or downloaded as Markdown, and shared by link.
- **Data:**
  - a stable `ID` column in the collection CSV (`b00`..., matching the pilot's legacy ids)
  - `tools/media-model.js` as the single model
  - `editorial.json` for definitions, examples, comparisons and the kit
  - `records.csv` and `records.json` downloads
- **Old anchors still land** (`#dots`, `#bibliography` and the rest), and the "Journalists and researchers" path points to the new examples section.
- **Weight:** the page's styles moved to their own stylesheet, so other pages carry none of it.

## Measured before and after (local build at 390 px unless stated; fonts could not load in the test browser)
| | Before | After |
|---|---|---|
| Page height at 390 / 1440 px | 34,419 / 26,123 px | 29,574 / 18,815 px |
| Visible words, whole page | 2,880 | 4,533 (20 records shown; evidence folded) |
| Links / controls | 310 / 26 | 466 / 127 |
| Gzip HTML | 46.2 KB | 66.0 KB, plus 6.3 KB script and 2.8 KB stylesheet, both page-only |
| Weight before scrolling (check-weight) | under 158 KB budget | 191 KB (recorded for this page only) |
| Records listed | 103 listings, 2 duplicated | 101 unique records, counted with their 103 publication records |
| Filters | 1 search box over 71 | search plus 9 filters over 101, with live counts |

## Tests completed (automated; no user research was done)
- **The browser test passes 36 of 36.** It covers:
  - the nine visitor journeys in the brief
  - pagination, the filtered CSV, a deep link to a record hidden by filters
  - keyboard use and visible focus
  - the page without JavaScript
  - 320 px with text at 200%
  - the header at 320, 390, 768 and 1440 px
  - no script errors
- **`tools/check-media.js` checks** the model, the comparison quotes, the kit links, the page figures against the records, the filter keys in links, and the downloads.
- **All repository checks pass,** including contrast, touch targets and the site check.

## Gaps that remain
- **Translations:** 18 pilot headlines carry the reviewer's English translation, which the publishers have not authorised and native speakers have not yet reviewed.
- **The pilot's codes are provisional:** one coder, with AI assistance, and no second coder. The full codebook is not in the repository; definitions on the page come from the codes and the evidence notes.
- **The collection is read at listing depth only.** Its articles have no trail, cycle, population or format beyond the link type.
- **Links:** source links were not re-opened in this session; the last check was on 30 October 2026.
- **Kit and suggestions:** the question kit's templates and the examples' follow-up questions were drafted for this rebuild and are reviewed by merging its pull request.
