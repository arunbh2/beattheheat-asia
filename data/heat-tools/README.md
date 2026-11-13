# Heat Tool Finder: the catalogue and how it is kept

`catalogue.json` is the data behind `/heat-tools/` ("Heat Tool Finder") and its profile pages at `/heat-tools/<id>/`.
`catalogue.schema.json` describes its shape. The page is built by `tools/build-heat-tools.js`; its filters, words and
exports live in `heat-tools/finder-core.js`, shared by the build, the page script (`heat-tools/finder.js`) and the check
(`tools/check-heat-tools.js`). The address is `/heat-tools/` because `/tools/` is the folder of build scripts.

It is a researched starter catalogue: not a weather feed, a validated risk model, a complete inventory, or a set of
tested products. Nothing in it is ranked or scored.

## Where it comes from

- `research/2026-11/heat-tools/common_shade_heat_tools.json` is the researched seed, kept unchanged as provenance.
- `research/2026-11/heat-tools/edits.json` holds the only changes made to it: wording brought into the site's voice
  (no em dashes, no "must"). No id, date, status, source or fact changes.
- `research/2026-11/heat-tools/apply.js` writes `catalogue.json` from the two. Never edit `catalogue.json` by hand:
  change the seed or add an edit, then run `apply.js`.
- `research/2026-11/heat-tools/url-check.json` is the last link check (`verify-urls.yml`, list `urls.txt`).

## Updating it

1. **Monthly source review; a broader search each quarter.** The research backlog in the catalogue lists the next
   questions, starting with official warning services in Thailand, Indonesia, the Philippines and Viet Nam. Add one
   only after its official product and definitions are checked.
2. **A review date changes only after an actual editorial review.** `evidence.reviewed_on` and
   `publication.next_review_due` record what a person read, never what a script reached.
3. **Link checks show reachability, not accuracy.** Run `verify-urls.yml` with `research/2026-11/heat-tools/urls.txt`.
   A 403 or 500 is reported by the check and left as it is. A blocked page is an access problem, not proof that a
   service has stopped.
4. **Older than 90 days means recheck, not delete.** The profile shows "Needs recheck" and the check names the record.
   Nothing is removed silently. A record that should go is marked `archived`, and that decision is recorded.
5. **Live warnings stay with the official agencies**, with their own issue and validity times. The catalogue never
   copies a warning value.
6. **"Open tool" needs a checked entry address.** `links.primary_url` often points to documentation, so its button reads
   "View source / access information". A direct tool address may be added only as a separate field with the date it
   was checked.
7. **Suggestions are checked before they appear.** They arrive through `/join/` and are published only after review.
8. **Unknowns stay unknown.** A missing licence, price or registration detail is `null` and shows as "not verified".
   Free to read is not an open-data licence, and a listed API is not a connection anyone has tried.

After any change: run `node research/2026-11/heat-tools/apply.js`, `node tools/build-static.js`, then
`node tools/check-heat-tools.js` and the site's other checks.

## A later automated review (not enabled)

A monthly workflow could run the link check on `urls.txt` and open an issue listing records past 90 days. It would
only report, never change dates or text. This brief does not authorise it, and none is set up.

## Analytics

Through the site's existing cookieless GoatCounter only, as event names: `tool_profile_open`, `comparison_open`,
`shortlist_export`, `pathway_open`, `source_click`, `plan_click`. No search text, place or shortlist content is sent.
They are engagement proxies, not measured adoption or protection.
