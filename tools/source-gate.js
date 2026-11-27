// Common Shade: one question for any page that cites staged sources: did this source pass its content check?
//   passed(id)  true when the staged source with that id (in any data/inbox/<batch>/sources.json) had every expected
//               term found by verify-sources.yml (that batch's link-check.json)
//   get(id)     the staged record { id, title, publisher, year, url, kind, expect, batch }
// Used by tools/build-health-equity.js and its check.
"use strict";
const fs = require("fs"), path = require("path");
const IN = path.join(__dirname, "..", "data", "inbox");
const BY = {};
for (const b of fs.readdirSync(IN)) {
  const sf = path.join(IN, b, "sources.json"); if (!fs.existsSync(sf)) continue;
  const lf = path.join(IN, b, "link-check.json"), T = fs.existsSync(lf) ? (JSON.parse(fs.readFileSync(lf, "utf8"))._terms || {}) : {};
  let S; try { S = JSON.parse(fs.readFileSync(sf, "utf8")); } catch (e) { continue; }
  if (!Array.isArray(S)) continue;
  for (const s of S) if (s && s.id && !BY[s.id]) BY[s.id] = Object.assign({ batch: b, ok: (s.expect || []).length > 0 && (s.expect || []).every(e => (T[s.url] || {})[e] === true) }, s);
}
const passed = id => !!(BY[id] && BY[id].ok), get = id => BY[id] || null;
module.exports = { passed, get };
