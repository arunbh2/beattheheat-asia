#!/usr/bin/env node
// Common Shade: applies the confirmed Bangkok financing strategy claims to the site's records. Every edit names the
// claims it carries and is refused unless gate.js confirmed them (confirmed.json). Edits are exact string replacements,
// so the files keep their formatting, and an edit whose target is missing or already applied stops the run with a message.
// Consultation findings are written as what participants said. Run gate.js first, then:
//   node research/2026-11/bangkok-heat-finance/apply.js && node tools/build-static.js
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", "..", ".."), HERE = __dirname;
const OK = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(HERE, "confirmed.json"), "utf8")).map(c => [c.id, c]));
const PDF = "https://www.undp.org/sites/g/files/zskgke326/files/2026-10/en-undp-bma_financial_strategy_on_urban_heat.pdf";
const LABEL = "UNDP and Bangkok Metropolitan Administration: Bangkok's financing strategy for tackling urban heat, 2026";
const srcText = pad => `${pad}{\n${pad}  "label": ${JSON.stringify(LABEL)},\n${pad}  "url": ${JSON.stringify(PDF)}\n${pad}}`;
const files = {}, read = f => files[f] = files[f] || fs.readFileSync(path.join(ROOT, f), "utf8");
const problems = [];
function edit(claims, f, from, to) {
  const miss = [].concat(claims).filter(c => !OK[c]); if (miss.length) return problems.push(`${f}: claim ${miss.join(", ")} not confirmed, edit refused`);
  const t = read(f), n = t.split(from).length - 1;
  if (n !== 1) return problems.push(`${f}: expected the target once, found it ${n} times: ${from.slice(0, 70)}...`);
  files[f] = t.replace(from, to);
}

// 1. Bangkok's city page: the plan is the city's own (the World Bank report stays as background), its targets and cost
edit(["c-plan-owner", "c-plan-targets", "c-cost", "c-opex-gap"], "data/core/CITY_PROFILES.json",
  `"text": "For the 2026 hot season Bangkok opened 304 cooling centres in schools, health centres and district offices, under a heat management plan developed with the World Bank.",`,
  `"text": "For the 2026 hot season Bangkok opened 304 cooling centres in schools, health centres and district offices. The city’s own Urban Heat Management Action Plan for 2026 has 22 indicators and a committee chaired by a deputy governor; its targets include cooling rooms in 80% of schools and public health service centres, at least two cooling points in every district, and home visits to at least 5,000 vulnerable households a year during heat alerts. A 2026 financing strategy with UNDP costs the plan at about THB 146 million to set up and THB 10.8 million a year to run, mostly from existing city budgets, and notes that running costs are not always covered.",`);
edit("c-plan-owner", "data/core/CITY_PROFILES.json",
  `          "url": "https://www.worldbank.org/en/country/thailand/publication/shaping-a-cooler-bangkok-tackling-urban-heat-for-a-more-livable-city"\n        }\n      ]`,
  `          "url": "https://www.worldbank.org/en/country/thailand/publication/shaping-a-cooler-bangkok-tackling-urban-heat-for-a-more-livable-city"\n        },\n${srcText("        ")}\n      ]`);
edit("c-plan-owner", "data/core/CITY_PROFILES.json",
  `"orgs": ["homenet","bot","undp","adb"],`, `"orgs": ["bangkokmetropolitanadmin","homenet","bot","undp","adb"],`);

// 2. The city government's record
edit(["c-plan-owner", "c-cost"], "data/core/ORGANISATIONS.json",
  `"does": "Runs heat warnings and public cooling spaces.",`,
  `"does": "Runs heat warnings and public cooling spaces. Its Urban Heat Management Action Plan for 2026 has 22 indicators and a committee chaired by a deputy governor, and a 2026 financing strategy with UNDP sets out how to pay for it.",`);

// 3. Dedicated heat budgets: a costed plan and climate budgeting
edit(["c-cost", "c-constraint"], "data/core/LEVERS.json",
  "with support from Practical Action and Mercy Corps.\",\n    \"exampleSources\": [",
  "with support from Practical Action and Mercy Corps. In Bangkok, a 2026 financing strategy with UNDP costs the city’s heat plan at about THB 146 million to set up and THB 10.8 million a year to run, and proposes climate budgeting so that adaptation spending can be identified and reported.\",\n    \"exampleSources\": [");
edit(["c-cost", "c-constraint"], "data/core/LEVERS.json",
  `        "url": "https://www.ceew.in/publications/nepal-heat-health-action"\n      }\n    ],`,
  `        "url": "https://www.ceew.in/publications/nepal-heat-health-action"\n      },\n${srcText("      ")}\n    ],`);

// 4. Cooling centres: running costs as a watch-out
edit(["c-opex-gap", "c-electricity", "c-bundle"], "data/core/LEVERS.json",
  `            "url": "https://researchportal.ukhsa.gov.uk/en/publications/public-health-effectiveness-of-cooling-centres-during-periods-of-/"\n          }\n        ]\n      }\n    ]`,
  `            "url": "https://researchportal.ukhsa.gov.uk/en/publications/public-health-effectiveness-of-cooling-centres-during-periods-of-/"\n          }\n        ]\n      },\n      {\n        "text": "Running costs can decide whether a cooling space keeps working. Bangkok reported that money to build is generally available but running costs are not always covered, and consultation participants said some childcare centres held back from air conditioning over electricity costs. The city’s financing strategy suggests offering cooling facilities to sponsors as one citywide programme, with agreements that set out operation and maintenance.",\n        "sources": [\n${srcText("          ")}\n        ]\n      }\n    ]`);

// 5. Who is at risk: what consultation participants said
edit("c-metal-roof", "data/core/AT_RISK.json",
  `          "url": "https://cdn.who.int/media/docs/default-source/searo/wsh-och-searo/bhu-c-h-profile.pdf?sfvrsn=9b974adb_2"\n        }\n      }\n    ]`,
  `          "url": "https://cdn.who.int/media/docs/default-source/searo/wsh-och-searo/bhu-c-h-profile.pdf?sfvrsn=9b974adb_2"\n        }\n      },\n      {\n        "fact": ${JSON.stringify(OK["c-metal-roof"] && OK["c-metal-roof"].text)},\n        "source": ${srcText("        ").trimStart()}\n      }\n    ]`);
edit("c-unregistered", "data/core/AT_RISK.json",
  `          "url": "https://www.nature.com/articles/s41598-026-62477-4"\n        }\n      }\n    ],\n    "nodes": ["homes","uhi","sleepless","energypoverty"],`,
  `          "url": "https://www.nature.com/articles/s41598-026-62477-4"\n        }\n      },\n      {\n        "fact": ${JSON.stringify(OK["c-unregistered"] && OK["c-unregistered"].text)},\n        "source": ${srcText("        ").trimStart()}\n      }\n    ],\n    "nodes": ["homes","uhi","sleepless","energypoverty"],`);

// 6. Thailand snapshot: the two finance routes, made concrete (the snapshot is one line of JSON)
edit(["c-public-goods", "c-opex-gap", "c-bonds", "c-districts", "c-constraint"], "research/2026-10/thailand_snapshot.json",
  `"text":"UNDP/BMA strategy analyses budget and legally possible capital routes. It does not establish`,
  `"text":"UNDP/BMA strategy analyses budget and legally possible capital routes. Most heat projects are public goods suited to public budgets; money to build is generally available, but running costs are not always covered, and there is no pipeline of investment-ready adaptation projects yet. The city may issue bonds with prior Cabinet approval but has not yet done so, and its AA+ credit rating was discontinued in 2022. District offices have no independent fiscal authority; the strategy proposes dedicated district allocations and criteria that steer money towards more vulnerable districts. It does not establish`);
edit("c-envfund", "research/2026-10/thailand_snapshot.json",
  `"text":"Strategy describes a local-government adaptation proposal route under Environmental Fund guidance. Original`,
  `"text":"Strategy describes a local-government adaptation proposal route under Environmental Fund guidance: up to THB 5 million per project for up to three years, with at least 70% of the budget spent on activities. About 74.8% of the fund's disbursements have gone to local governments. Original`);

// 7. Learning agenda: work under way that could help answer whether prevention pays (the question stays open)
edit(["c-cost", "c-constraint"], "data/site/learning.json",
  `  { "id": "q-prevention-pays", "loop": "reactive", "status": "open",\n    "history": [{ "date": "2026-10-31", "status": "open", "note": "Opened on the learning agenda" }],`,
  `  { "id": "q-prevention-pays", "loop": "reactive", "status": "open",\n    "history": [{ "date": "2026-10-31", "status": "open", "note": "Opened on the learning agenda" }],\n    "underway": [{ "since": "2026-11-08", "text": "Bangkok’s 2026 financing strategy costs the city’s heat plan and proposes climate budgeting to identify and report adaptation spending. Spending tagged this way over several seasons could show what a city spends before heatwaves.", "source": [${JSON.stringify(LABEL)}, ${JSON.stringify(PDF)}] }],`);

if (problems.length) { console.error("Nothing written:\n  " + problems.join("\n  ")); process.exit(1); }
for (const [f, t] of Object.entries(files)) { JSON.parse(t); fs.writeFileSync(path.join(ROOT, f), t); }
console.log(`applied ${Object.keys(OK).length} confirmed claims across ${Object.keys(files).length} files: ${Object.keys(files).join(", ")}`);
