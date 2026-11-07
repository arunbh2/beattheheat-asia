// Build-only blocks: data in data/core (and data/social-protection/) that page builders need but browsers never download. A block marked
// "browser": false in data/core/manifest.json stays out of data.js (tools/build-data.js); a builder that reads data.js
// adds these with Object.assign(D, require("./data-blocks.js")()). Used by build-pages, build-static and build-sources.
"use strict";
const fs = require("fs"), path = require("path");
const CORE = path.join(__dirname, "..", "data", "core");
module.exports = function buildOnly() {
  const manifest = JSON.parse(fs.readFileSync(path.join(CORE, "manifest.json"), "utf8"));
  const blocks = Object.fromEntries(manifest.filter(m => m.browser === false).map(m => [m.name, JSON.parse(fs.readFileSync(path.join(CORE, m.file), "utf8"))]));
  // social protection: one file per country in data/social-protection/ (schema in its README), read as one build-only block,
  // so a new country is a new file and flows to the page, /sources/, llms-full.txt and the checks with no code change
  const SP = path.join(__dirname, "..", "data", "social-protection");
  if (fs.existsSync(SP)) blocks.SOCIAL_PROTECTION = fs.readdirSync(SP).filter(f => f.endsWith(".json")).sort().map(f => JSON.parse(fs.readFileSync(path.join(SP, f), "utf8")));
  return blocks;
};
