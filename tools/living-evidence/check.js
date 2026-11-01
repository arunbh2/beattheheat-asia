#!/usr/bin/env node
// Living evidence: checks the review queue in data/evidence/inbox/ and the extraction rules.
// - every decision is accept, reject or pending; every accepted study has a cycle, a finding in the reviewer's own
//   words, a grade, a place and a link (so nothing half-reviewed reaches the Evidence map);
// - the rule-based extraction copies values from the text and never invents one (tested on sample abstracts).
//   node tools/living-evidence/check.js        (also run on every pull request that touches data/evidence)
"use strict";
const { load } = require("./accepted.js"), { extract, screen } = require("./extract.js");
const fail = [], ok = [];
const expect = (c, m) => (c ? ok : fail).push(m);

const A = load();
A.problems.forEach(p => fail.push(p));
expect(!A.problems.length, `review queue: ${A.counts.weeks} weeks, ${A.counts.accept} accepted, ${A.counts.reject} rejected, ${A.counts.pending} pending`);

// extraction, on samples written to look like real abstracts
const s1 = { title: "Cool roofs and indoor heat in informal settlements of Ahmedabad, India: a randomised trial",
  abstract: "We recruited 2,750 households in hot-dry Ahmedabad. Solar-reflective roof coatings reduced indoor air temperature by 1.5 °C at peak hours. The coating cost US$ 2.40 per m2. However, coatings lost reflectivity without maintenance after two years." };
const e1 = extract(s1), k1 = screen(s1);
expect(k1.keep && k1.streams.includes("passive-cooling"), "screen keeps an Asian passive-cooling trial");
expect(e1.sample_size && /2,750 households/.test(e1.sample_size.value), "sample size copied with its unit");
expect(e1.effect_size_c && /1\.5 °C/.test(e1.effect_size_c.value) && e1.effect_size_c.quote.includes("reduced indoor air temperature"), "temperature effect copied with its sentence");
expect(e1.unit_cost && /US\$ 2\.40 per m2/.test(e1.unit_cost.value), "unit cost copied with its unit");
expect(e1.agro_climatic_zone && /hot-dry/i.test(e1.agro_climatic_zone.value), "climate zone copied only because the text names it");
expect(e1.failure_modes && /maintenance/.test(e1.failure_modes[0].quote), "failure mode sentence kept");
expect(e1.geography && /Ahmedabad/.test(e1.geography.value) && /India/.test(e1.geography.value), "places named in the text found");
const s2 = { title: "Heatwaves and all-cause mortality in Dhaka, Bangladesh: a time-series analysis", abstract: "Using 12 years of death records, heatwave days were associated with a 9.2% increase in all-cause mortality (RR 1.09). Older adults were most affected." };
const e2 = extract(s2);
expect(screen(s2).keep && /9\.2% increase in all-cause mortality/.test(e2.effect_size_pct.value), "mortality effect copied as written");
expect(e2.unit_cost === null && e2.agro_climatic_zone === null && e2.effect_size_c === null, "fields the text does not state stay empty");
const s3 = { title: "Heat stress in European dairy cows", abstract: "We measured milk yield on 40 farms in Germany during heatwaves." };
expect(!screen(s3).keep, "screen sets aside studies with no South or Southeast Asian setting");
const s4 = { title: "Ensiled fruit peels as an animal feed in Sri Lanka", abstract: "We measured feed quality of 40 silage samples stored under shade. Reflective covers were used." };
expect(!screen(s4).keep, "screen sets aside studies with no heat context, even when cooling words appear");

ok.forEach(m => console.log("  ok   " + m));
if (fail.length) { console.error(fail.map(m => "  FAIL " + m).join("\n")); console.error(`living evidence check: ${fail.length} problem(s)`); process.exit(1); }
console.log(`living evidence check: ${ok.length} checks passed`);
