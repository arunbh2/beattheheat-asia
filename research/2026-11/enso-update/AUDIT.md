# El Niño pages: claim audit (26 November 2026)

Written before the pages were edited. Sources are in `claims.json` here and in `../enso-asia/claims.json`; what passed the
GitHub source check is in each folder's `confirmed.json`.

**Assessment key:**
- **Accurate:** still accurate.
- **Superseded:** superseded by newer evidence.
- **Needs qualification:** accurate but missing a qualification.
- **Overstated:** unsupported or overstated.
- **Inconsistent:** internally inconsistent.
- **Not verified:** unable to verify.

| Page / location | Existing claim | Supporting source | Assessment | Change |
|---|---|---|---|---|
| Watch, explainer, cities, print: status | NOAA El Niño Advisory; strong-to-very strong likely through January–March 2027 (>79%); weakening early 2027; next 10 December 2026 | NOAA discussion, 12 Nov 2026 (`e-noaa-status`), archived copy (`u-noaa-archive`) | Accurate | Kept. The record now also carries the archive URL, so the bulletin stays citable after 10 December. |
| Watch: "Forecast period" line | "January to March 2027 for strength; ENSO phase odds to April to June 2027" (typed in the panel) | Same | Inconsistent | Now generated from the record (`forecast_period`, phase table). The strength forecast (January–March 2027, NOAA's discussion) and the strength *table* (March–May 2027) are now named separately. |
| Watch: observed box | "weekly Niño-3.4 index reached +2.5 °C" | NOAA discussion (`e-noaa-change`) | Needs qualification | A line was added: a weekly value is not the three-month RONI used to classify events. |
| Watch, print: phase and strength odds | MAM 2027 El Niño 80%; weak 53, moderate 25, strong 2, very strong 0; AMJ neutral 61 vs El Niño 38 | NOAA probabilities (`e-noaa-prob`, `e-noaa-strength`) | Accurate | Kept. The pages now say the strength bands share out the 80% chance and are not added to it, and a check enforces the arithmetic. |
| Explainer: summary, "Reading the outlook", uncertainty, two FAQs | Same probabilities and the "historic, about 60%" figure, typed into the text | `e-noaa-prob`, `e-noaa-strength`, `e-noaa-historic` | Accurate, but duplicated | The repeated sentences now come from one function (`facts()` in tools/enso-outlook.js), and a check compares them across pages. |
| Explainer, FAQ: historic | "about a 60% chance for October to December and November to January" | `e-noaa-historic` | Needs qualification (ambiguous period) | Now "October to December 2026 and November 2026 to January 2027". |
| Signals: El Niño finding (`sig-el-nino-2026-2027`) | "expected to be the strongest on record by December" (attributed to WMO) | WMO State of the Climate release (`u-wmo-soc-quote`) | Needs qualification | WMO's wording is quoted as a forecast. NOAA's own estimate of a historic event (about 60%) is placed beside it. Correction trail added. |
| Signals: El Niño finding | "WHO has, for the first time, classified the anticipated health impacts as a health emergency" (attributed to WMO) | WMO release (`u-wmo-soc-quote`); WHO's plan (`u-who-grade`) | Overstated if read as a WHO declaration | Now: WMO's words, attributed; WHO's own plan describes a Grade 3 response (its internal grading of its operational response); no declaration under the International Health Regulations was found. Correction trail added, and a /corrections/ entry. |
| Growth entry `g-wmo-soc-heat` | "WHO's first classification of El Niño's anticipated health impacts as a health emergency" | Same | Overstated | Reworded to attribute the phrase to WMO and name the Grade 3 response; a correction growth entry records the change. |
| Signals: WHO record | Grade 3 response under a plan for October 2026 to September 2027; a plan, not delivery | WHO plan (`u-who-grade`) | Accurate | Kept; checked again. |
| Explainer, cities: WMO quarterly update | Nearly 100% likelihood El Niño persists through February 2027 (3 September 2026) | `e-wmo-persist` | Accurate, but old | Kept, labelled as WMO's latest quarterly update; no newer one was found by 26 November 2026. |
| Watch table: MSS status (16 October 2026) | Relative Niño3.4 2.1 °C (September), 1.7 °C (July–September) | `e-mss` | Superseded | Moved to the record's history. ASMC's newer status (October values: 2.3 °C; August–October 2.0 °C) is now in the table. |
| Watch table: IOD | WMO: positive IOD declining to +0.3 °C | `e-wmo-gscu` | Accurate, but incomplete | An Indian Ocean note was added. BoM and ASMC read a positive IOD returning to neutral; IMD reads neutral on its own threshold. The readings are not averaged. |
| Cities: outlook table | NOAA period typed as "through January to March 2027" | `c-noaa`, record | Accurate, but duplicated | Now taken from the shared record. |
| Cities: title "preparing for summer 2027" | Planning frame | — | Needs qualification | Kept as the title, with a line saying it is a planning horizon, not a forecast for summer 2027. NOAA's odds favour neutral by April to June 2027. |
| Cities: reviewed date "18 November 2026" (typed) | — | — | Superseded | Now the record's editorial check date. |
| Explainer, Mainland and Maritime regions | ASMC seasonal forecast of 5 November 2026 | `e-asmc-outlook` | Accurate | Kept, with its date. |
| Explainer, India region | INCOIS (via MoES, August 2026): El Niño likely to persist June 2026 to February 2027, 70–90% | `e-india` | Accurate, but older | Kept, dated. IMD's October 2026 bulletin was added beside it. |
| Heat Tool Finder | No ENSO monitoring or seasonal tools | — | Gap | An El Niño route by decision horizon was added. Records are listed only where their source passed the check. |
| Cities: four protections (work, homes, care, schools) | Settings: schools, markets, clinics, waiting spaces | Various | Gap | A new section answers the nine questions per protection. National guidance is cited only where confirmed (NCDC 2026 advisory, NDMA cooling-centre guidelines, NCDC heat and pregnancy guidance, MHT cool-roof study, All India Radio's report of the April 2026 advisory, the MoE guidelines' title). |

**Unable to verify:** these sources did not open for the checker, so no claim rests on them:
- NDMA heat wave guidelines 2019, PDF;
- two Labour Ministry PIB releases;
- NCDC's National Action Plan on Heat Related Illnesses, PDF;
- the detailed MoE school measures (the republished page held only its title).

**Not found:**
- a NOAA discussion newer than 12 November 2026;
- a WMO El Niño/La Niña Update newer than 3 September 2026;
- a WMO Global Seasonal Climate Update for December 2026 to February 2027;
- an IMD ENSO and IOD bulletin for November 2026;
- an ASMC seasonal outlook for December 2026 to February 2027.
