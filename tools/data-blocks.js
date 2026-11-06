// Build-only blocks: data in data/core that page builders need but browsers never download. A block marked
// "browser": false in data/core/manifest.json stays out of data.js (tools/build-data.js); a builder that reads data.js
// adds these with Object.assign(D, require("./data-blocks.js")()). Used by build-pages, build-static and build-sources.
"use strict";
const fs = require("fs"), path = require("path");
const CORE = path.join(__dirname, "..", "data", "core");
module.exports = function buildOnly() {
  const manifest = JSON.parse(fs.readFileSync(path.join(CORE, "manifest.json"), "utf8"));
  return Object.fromEntries(manifest.filter(m => m.browser === false).map(m => [m.name, JSON.parse(fs.readFileSync(path.join(CORE, m.file), "utf8"))]));
};
