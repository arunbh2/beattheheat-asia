#!/usr/bin/env node
// Common Shade: applies the confirmed Singapore brief claims to the site's records. Every edit names the claim it
// carries and is refused unless gate.js confirmed that claim (confirmed.json); each new sentence takes the source the
// check confirmed. Edits are exact string replacements, so the files keep their formatting, and an edit whose target
// is missing or already applied stops the run with a message. Run gate.js first, then:
//   node research/2026-11/singapore-brief/apply.js && node tools/build-static.js
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", "..", ".."), HERE = __dirname;
const OK = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(HERE, "confirmed.json"), "utf8")).map(c => [c.id, c]));
const src = (id, i = 0) => { const s = OK[id].sources[i]; return { label: s.label, url: s.url }; };
// a source object as the files write it, at a given indent
const srcText = (s, pad) => `${pad}{\n${pad}  "label": ${JSON.stringify(s.label)},\n${pad}  "url": ${JSON.stringify(s.url)}\n${pad}}`;
const files = {}, read = f => files[f] = files[f] || fs.readFileSync(path.join(ROOT, f), "utf8");
const problems = [];
function edit(claims, f, from, to) {
  const miss = [].concat(claims).filter(c => !OK[c]); if (miss.length) return problems.push(`${f}: claim ${miss.join(", ")} not confirmed, edit refused`);
  const t = read(f);
  // follow the file's own spacing before °C (a no-break space keeps a figure and its unit on one line on phones)
  if ((t.match(/ °C/g) || []).length > (t.match(/ °C/g) || []).length) { from = from.replace(/ °C/g, " °C"); to = to.replace(/ °C/g, " °C"); }
  const n = t.split(from).length - 1;
  if (n !== 1) return problems.push(`${f}: expected the target once, found it ${n} times: ${from.slice(0, 70)}...`);
  files[f] = t.replace(from, to);
}

// 1. Worked example: who made the advisory, and the 2024 revision of the workplace rules
edit("c-advisory-joint", "data/core/WORKED_EXAMPLES.json",
  "In 2023 the National Environment Agency launched a national heat stress advisory based on",
  "In 2023 Singapore launched a national heat stress advisory, developed by the environment ministry and the National Environment Agency with the Ministry of Health and its expert panel on heat stress, based on");
edit("c-rules-2024", "data/core/WORKED_EXAMPLES.json",
  "The rules have since been revised and strengthened.",
  "In September 2024 the rules were revised to follow the advisory’s three levels: at a WBGT of 33 °C or above, at least 15 minutes’ rest an hour is recommended for heavy work, new workers acclimatise over at least 7 days, and construction sites with contracts of S$5 million or more and shipyards are required to keep their own WBGT meters.");
edit("c-rules-2024", "data/core/WORKED_EXAMPLES.json",
  `      {\n        "label": "NUS Project HeatSafe, 2024",`,
  `${srcText({ label: "Ministry of Manpower: revised heat stress framework, 2024", url: src("c-rules-2024", 0).url }, "      ")},\n${srcText({ label: "Ministry of Manpower: heat stress measures for outdoor work", url: src("c-rules-2024", 1).url }, "      ")},\n      {\n        "label": "NUS Project HeatSafe, 2024",`);

// 2. The workplace-rules lever: the 2024 revision
edit("c-rules-2024", "data/core/LEVERS.json",
  "in 2024 it inspected 250 workplaces and acted against 78.",
  "in 2024 it inspected 250 workplaces and acted against 78, and that September revised the rules to follow its three-level heat stress advisory, recommending at least 15 minutes’ rest an hour for heavy work at 33 °C or above.");
edit("c-rules-2024", "data/core/LEVERS.json",
  `      {\n        "label": "HRD Asia: 78 worksites found non-compliant",`,
  `${srcText({ label: "Ministry of Manpower: revised heat stress framework, 2024", url: src("c-rules-2024", 0).url }, "      ")},\n      {\n        "label": "HRD Asia: 78 worksites found non-compliant",`);

// 3. Singapore's city page: the heatwave definition, the taskforce and the 2026 policy office
edit(["c-heatwave-def", "c-taskforce-37", "c-coordination"], "data/core/CITY_PROFILES.json",
  "and tells people what to do at each level.\",\n      \"sources\": [\n        {\n          \"label\": \"Ministry of Sustainability and the Environment, 2023\",\n          \"url\": \"https://mse.gov.sg/latest-news/press-release-heat-stress-advisory\"\n        }\n      ]",
  "and tells people what to do at each level. Since March 2025 a heatwave is declared when the daily maximum reaches at least 35 °C and the daily mean at least 29 °C for three days in a row; a taskforce of 37 public agencies then opens air-conditioned cooling spaces in community centres. In March 2026 a Heat Resilience Policy Office was set up to coordinate action across agencies, oversee research and draft a heat resilience action plan.\",\n      \"sources\": [\n        {\n          \"label\": \"Ministry of Sustainability and the Environment, 2023\",\n          \"url\": \"https://mse.gov.sg/latest-news/press-release-heat-stress-advisory\"\n        },\n" +
  srcText({ label: "Malay Mail: Singapore’s heatwave response plan, 2025", url: src("c-heatwave-def").url }, "        ") + ",\n" +
  srcText({ label: "Ministry of Sustainability and the Environment: Committee of Supply speech, 2026", url: src("c-coordination").url }, "        ") + "\n      ]");
edit("c-hub", "data/core/CITY_PROFILES.json", `"orgs": ["nea","mom","smu","nrfsg","mas","c40"],`, `"orgs": ["nea","mom","ministryofsustainability","ghhinsea","smu","nrfsg","mas","c40"],`);

// 4. The planning workbook's trigger examples
edit("c-heatwave-def", "data/core/PLAN_TRIGGER_BASES.json",
  "The Bangladesh Red Crescent acts on forecasts above 38 °C in Dhaka.\",",
  "The Bangladesh Red Crescent acts on forecasts above 38 °C in Dhaka. Singapore declares a heatwave when the daily maximum reaches at least 35 °C and the daily mean at least 29 °C for three days in a row.\",");
edit("c-heatwave-def", "data/core/PLAN_TRIGGER_BASES.json",
  `        "url": "https://www.climatecentre.org/13733/red-crescent-activates-early-action-protocol-for-heatwaves-in-dhaka/"\n      }`,
  `        "url": "https://www.climatecentre.org/13733/red-crescent-activates-early-action-protocol-for-heatwaves-in-dhaka/"\n      },\n${srcText({ label: "Malay Mail: Singapore’s heatwave response plan, 2025", url: src("c-heatwave-def").url }, "      ")}`);
edit("c-rules-2024", "data/core/PLAN_TRIGGER_BASES.json",
  "employers must give shaded rest every hour for heavy outdoor work from 32 °C.\",",
  "employers must give shaded rest every hour for heavy outdoor work from 32 °C. Since 2024, at least 15 minutes’ rest an hour is recommended at 33 °C or above.\",");
edit("c-rules-2024", "data/core/PLAN_TRIGGER_BASES.json",
  `        "url": "https://www.mom.gov.sg/newsroom/press-releases/2023/1024-enhanced-measures-to-reduce-heat-stress-for-outdoor-workers"\n      }`,
  `        "url": "https://www.mom.gov.sg/newsroom/press-releases/2023/1024-enhanced-measures-to-reduce-heat-stress-for-outdoor-workers"\n      },\n${srcText({ label: "Ministry of Manpower: heat stress measures for outdoor work", url: src("c-rules-2024", 1).url }, "      ")}`);

// 5. Organisations: the ministry's 2026 office and research money; the Southeast Asia hub as its own record
edit(["c-coordination", "c-fund-40m", "c-rie2030"], "data/core/ORGANISATIONS.json",
  `    "url": "https://www.mse.gov.sg",\n    "does": "Coordinates heat resilience and sustainable cooling policy.",`,
  `    "url": ${JSON.stringify(src("c-coordination").url)},\n    "does": "Coordinates heat resilience and sustainable cooling policy. In March 2026 it set up a Heat Resilience Policy Office to coordinate action across agencies, oversee research and draft a heat resilience action plan, and announced a S$40 million ‘Adapting to Heat Impacts’ funding initiative for research on heat impacts and community heat resilience, within its RIE2030 Heat Resilience R&D Programme.",`);
edit("c-hub", "data/core/ORGANISATIONS.json",
  `  {\n    "id": "ministryofsustainability",`,
  `  {\n    "id": "ghhinsea",\n    "role": "asia",\n    "name": "Global Heat Health Information Network, Southeast Asia Hub",\n    "url": ${JSON.stringify(src("c-hub", 0).url)},\n    "does": ${JSON.stringify(OK["c-hub"] ? OK["c-hub"].text.replace(/^The Global Heat Health Information Network's hub for Southeast Asia, based in Singapore, shares/, "Based in Singapore, shares") : "")},\n    "levers": ["hap"]\n  },\n  {\n    "id": "ministryofsustainability",`);

// 6. Who is at risk: delivery riders
edit("c-gig", "data/core/AT_RISK.json",
  `          "label": "NUS Project HeatSafe, 2024",\n          "url": "https://medicine.nus.edu.sg/wp-content/uploads/2024/03/PRESS-RELEASE_Project-HeatSafe-18MAR2024-FOR-IMMEDIATE-RELEASE.pdf"\n        }\n      },`,
  `          "label": "NUS Project HeatSafe, 2024",\n          "url": "https://medicine.nus.edu.sg/wp-content/uploads/2024/03/PRESS-RELEASE_Project-HeatSafe-18MAR2024-FOR-IMMEDIATE-RELEASE.pdf"\n        }\n      },\n      {\n        "fact": ${JSON.stringify(OK["c-gig"] ? OK["c-gig"].text : "")},\n        "source": {\n          "label": ${JSON.stringify(src("c-gig").label)},\n          "url": ${JSON.stringify(src("c-gig").url)}\n        }\n      },`);

// 7. The learning agenda: work under way that could help answer a question (not an answer, so the status stays open)
edit("c-heatmap", "data/site/learning.json",
  `  { "id": "q-clinic-load", "loop": "clinic", "status": "open",\n    "history": [{ "date": "2026-10-31", "status": "open", "note": "Opened on the learning agenda" }],`,
  `  { "id": "q-clinic-load", "loop": "clinic", "status": "open",\n    "history": [{ "date": "2026-10-31", "status": "open", "note": "Opened on the learning agenda" }],\n    "underway": [{ "since": "2026-11-07", "text": ${JSON.stringify(OK["c-heatmap"] ? OK["c-heatmap"].text : "")}, "source": [${JSON.stringify(src("c-heatmap").label)}, ${JSON.stringify(src("c-heatmap").url)}] }],`);

if (problems.length) { console.error("Nothing written:\n  " + problems.join("\n  ")); process.exit(1); }
for (const [f, t] of Object.entries(files)) { JSON.parse(t); fs.writeFileSync(path.join(ROOT, f), t); }
console.log(`applied ${Object.keys(OK).length} confirmed claims across ${Object.keys(files).length} files: ${Object.keys(files).join(", ")}`);
