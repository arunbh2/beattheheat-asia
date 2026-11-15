// Common Shade: "What has been measured, and where" (step 5 of research/2026-11/city-heat/BUILD_BRIEF.md). An evidence review
// found too few sound field estimates from tropical and subtropical Asian cities to show a what-if range for trees or
// reflective roofs (an independent review agreed), so the site lists what has been measured, with its conditions, instead of
// adding the figures up. Every record cites a source that passed verify-sources.yml in data/inbox/2026-11-city-heat/;
// rows() throws, naming the source, if one did not. Shown on /cooling-options/ and in llms-full.txt.
"use strict";
const fs = require("fs"), path = require("path");
const INBOX = path.join(__dirname, "..", "..", "data", "inbox", "2026-11-city-heat");
const STUDIES = [
  { id: "ch-m-sg-shade", measure: "Street shade", place: "Singapore", when: "One extremely hot afternoon, 20 pairs of sunlit and shaded sites in a high-density district",
    measured: "Air temperature, mean radiant temperature and felt heat (UTCI), shaded against sunlit",
    found: "On average 0.8 °C lower air temperature, 10.0 °C lower mean radiant temperature and 3.1 °C lower UTCI under shade.", label: "Science of the Total Environment, 2024" },
  { id: "ch-m-sg-park", measure: "A park", place: "Singapore", when: "January to December 2022, sensors in a park and its surrounding urban area",
    measured: "Air temperature in the park against the surrounding area",
    found: "The park was cooler through the day and night: about 2.21 °C by day and 1.69 °C at night on average.", label: "Scientific Reports, 2025" },
  { id: "ch-m-hyd-roofs", measure: "Reflective roofs", place: "Hyderabad", when: "Measured on individual commercial buildings",
    measured: "Air-conditioning energy use before and after whitening the roof",
    found: "Whitening previously black roofs cut air-conditioning energy by 14 to 26%; white coating on bare concrete roofs, by 10 to 19% (an estimate from the same study).", label: "Lawrence Berkeley National Laboratory and IIIT Hyderabad, 2011" },
  { id: "ch-m-amd-roofs", measure: "Cool roofs in low-income homes", place: "Ahmedabad", when: "16 slum households, 4 to 10 October 2017, after the monsoon",
    measured: "Indoor temperature under four roof treatments (including reflective white paint and insulation) against tin, asbestos-cement and concrete roofs",
    found: "The checked text describes the method, not the figures; see the study for its results.", label: "Indian Journal of Occupational and Environmental Medicine, 2020" }
];
const WORDS = {
  title: "What has been measured, and where",
  lede: "Field measurements of shade, parks and reflective roofs in Asian cities, each with the conditions it was measured in. These are measurements from single sites. No checked estimate yet exists for what they would add up to across a city, so none is shown.",
  cols: ["What", "Where", "When and how", "What was measured", "What it found"]
};
function rows() {
  const src = JSON.parse(fs.readFileSync(path.join(INBOX, "sources.json"), "utf8")), links = JSON.parse(fs.readFileSync(path.join(INBOX, "link-check.json"), "utf8"));
  return STUDIES.map(s => { const r = src.find(x => x.id === s.id), t = (links._terms || {})[r && r.url] || {};
    if (!r || !/^(OK|REDIRECT)$/.test(links[r.url]) || r.expect.some(x => !t[x])) throw new Error(`measured.js cites ${s.id}, which has not passed the source check in data/inbox/2026-11-city-heat/`);
    return Object.assign({ url: r.url, title: r.title }, s); });
}
module.exports = { WORDS, rows };
