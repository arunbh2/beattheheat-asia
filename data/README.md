# The knowledge base

Everything the site says lives here, separate from how it looks. Pages, the map and the films read it; nothing is typed into a page twice.

- **`core/`**: the content the map and the existing pages are built from, one JSON file per block, with its notes in `core/manifest.json`. `tools/build-data.js` turns it into `data.js`. Edit these files, never `data.js`.
- **`kb/`**: records added month by month (sources, figures, funding, roles, milestones, triggers, open questions). Every record follows `schema/records.json`: an id, a type, a plain summary, an evidence status (known, inferred or uncertain), its sources, when it applies and when it was checked. Records are never deleted: a newer one sets `replaces`, and the old one is marked `superseded`. `kb/_changes.json` logs each month for the "What's new" page.
- **`schema/`**: the rules. `records.json` for structure; `tone.json` for the site's careful, diplomatic, non-political and humble voice, as checkable rules: its `voice` section keeps the site describing what helps rather than telling anyone what to do.
- **`inbox/YYYY-MM/`**: a month's research before it is checked, with `link-check.json` from the link checker. Held-back records wait in `inbox/held/` with their reasons.
- **`reports/`**: what each month published, held back and why.

## Publishing a month

    node tools/check-data.js 2026-11            # what would pass, and why the rest would not
    node tools/merge-inbox.js 2026-11           # publish what passes, rebuild, check every page

Seven gates, all automatic: (1) structure, (2) sourcing: a working link and an archived copy, (3) evidence: projections are never "known", (4) tone rules, (5) the reviewer's note on every record, (6) consistency with figures already published, (7) the site builds, no page speaks in an instructing voice (`tools/check-voice.js`), and every page works. If gate 7 fails, nothing is published.
