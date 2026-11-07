// Common Shade: one record of the site's headline counts. Each builder records the numbers it already calculates (and
// prints), so every place that shows a count (the exit card, llms.txt) reads the same figure as the page it links to.
// The record is generated: data/site/counts.json. Never type a count into it; rebuild with node tools/build-static.js.
//   const count = require("./site-counts.js"); count({ solutions: 131 });   // merge
//   count.all()                                                             // read
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "data", "site", "counts.json");
function all() { try { return JSON.parse(fs.readFileSync(FILE, "utf8")); } catch (e) { return {}; } }
function record(values) {
  const cur = all(), next = Object.assign({}, cur, values);
  Object.entries(values).forEach(([k, v]) => { if (!Number.isInteger(v) || v < 0) throw new Error(`site-counts: "${k}" must be a whole number, got ${v}`); });
  const out = JSON.stringify(Object.fromEntries(Object.keys(next).sort().map(k => [k, next[k]])), null, 1) + "\n";
  if (out !== JSON.stringify(cur, null, 1) + "\n") fs.writeFileSync(FILE, out);
}
module.exports = record;
module.exports.all = all;
