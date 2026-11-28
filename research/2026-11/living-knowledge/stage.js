#!/usr/bin/env node
// Common Shade, Living Knowledge: stages every source for the source check. Writes data/inbox/2026-11-living-knowledge/sources.json;
// keeps results already in the inbox (verify-inbox.js keys them by url).   node research/2026-11/living-knowledge/stage.js
// then run verify-sources.yml with month 2026-11-living-knowledge
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", "..", ".."), INBOX = path.join(ROOT, "data", "inbox", "2026-11-living-knowledge");
const S = require("./sources.js");
const out = S.map(s => ({ id: `src-lk-${s.id}`, type: "source", title: s.title, publisher: s.publisher, year: 2026, url: s.check_url || s.url, kind: s.kind, where: "Living Knowledge",
 expect: s.expect, note: "Staged for Living Knowledge: a claim is published only when every term it rests on is found here. Not published from the inbox." }));
fs.mkdirSync(INBOX, { recursive: true });
fs.writeFileSync(path.join(INBOX, "sources.json"), JSON.stringify(out, null, 1) + "\n");
if (!fs.existsSync(path.join(INBOX, "README.md"))) fs.writeFileSync(path.join(INBOX, "README.md"), "# Living Knowledge sources (November 2026)\n\nStaged by `research/2026-11/living-knowledge/stage.js` for `verify-sources.yml` (month `2026-11-living-knowledge`). The checker writes `link-check.json` and `_excerpts.json` here; `tools/living-knowledge.js` reads them. Nothing here is published directly.\n");
console.log(`staged ${out.length} sources in data/inbox/2026-11-living-knowledge/sources.json`);
