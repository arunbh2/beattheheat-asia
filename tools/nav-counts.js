// Common Shade: fills the counts in the menu's words. data/site/nav.json writes a count as {key} (for example
// "{funders} funders"), and this reads the figure from data/site/counts.json, which each builder records from its own
// data with site-counts.js. So the menu always shows the same number as the page it links to, and nobody types one.
// build-data.js --check refuses a number typed into nav.json.
"use strict";
const all = require("./site-counts.js").all;
module.exports = function fill(text) {
  const C = all();   // read at draw time, after the builders have recorded this build's counts
  return String(text == null ? "" : text).replace(/\{([a-zA-Z]+)\}/g, (m, k) => {
    if (!Number.isInteger(C[k])) throw new Error(`data/site/nav.json uses {${k}}, but data/site/counts.json has no "${k}": record it in its builder with require("./site-counts.js")({ ${k}: n })`);
    return C[k].toLocaleString("en");
  });
};
