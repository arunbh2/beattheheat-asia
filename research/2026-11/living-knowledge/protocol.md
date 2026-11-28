# Living Knowledge: search protocol (first edition, November 2026)

**What this is.** A targeted evidence scan, not a systematic review. It looks for documented local, traditional, vernacular and Indigenous practices that help people live with heat in South and Southeast Asia, and for evidence about how, where and for whom they work. It is not exhaustive and does not estimate how common any practice is.

## Questions asked of every candidate practice
1. What exactly do people do, and why do they say they do it?
2. Where, when and by whom is it practised?
3. What evidence documents its origin and use?
4. What mechanism might explain an effect, and how well supported is it?
5. What outcomes were actually measured?
6. Under what climatic and social conditions does it operate?
7. Limits, trade-offs, costs, upkeep?
8. Who can and cannot use it, and whose labour sustains it?
9. What may change with hotter nights, water scarcity or urbanisation?
10. What could each stakeholder do now, and what needs evaluation first?

## Where we searched
| Platform | Role | How |
|---|---|---|
| Europe PMC REST (covers PubMed and PMC, plus preprints) | Discovery; open full text | `search.js`: heat terms and practice terms in title or abstract, region terms anywhere; one query per domain per region (South Asia, Southeast Asia), all years |
| Crossref REST | Metadata checks; discovery in building-science, textile and architecture journals | `search.js` and `search-targeted.js`: bibliographic relevance search; totals are not meaningful, so the first 10 to 12 results were screened |
| WHO, UNICEF, UNFPA, World Bank | Checking health-facing statements and policy framing | Official pages read directly (see `sources.js`) |
| Seed sources supplied with the brief | Starting points | Retrieved and appraised one by one (`appraisal.md`) |

Every query, platform, date, filter, hit count and first results are in `search-log.json`. Screening decisions are in `screening.json`.

## Domains and query families
Buildings, clothing and textiles, water and evaporative practices, food and diet, work and rest, care and recovery, neighbourhoods and shared spaces, agriculture and livestock, plus a general coping family. Example (Europe PMC): `(TITLE:(heat OR "thermal comfort" OR overheating OR "hot weather" OR heatwave) OR ABSTRACT:(...)) AND (TITLE:(clothing OR textile OR ...) OR ABSTRACT:(...)) AND (India OR Pakistan OR Bangladesh OR ...)`.

## Inclusion
- Describes a practice people use, or a documented local design, in a covered country, with a heat purpose or heat-relevant outcome; or measures such a practice; or is official guidance or policy that names it.
- Global or out-of-region studies are used only as transferability context, labelled as such.

## Exclusion
- Engineering products and new materials with no link to a local practice; crop genetics; studies of heat effects with no practice.
- Leads that could not be read beyond a title.

## Deduplication
By DOI, PMID, PMCID and title. Several hosted copies of one study are one source (`copies` in `sources.js`).

## Known biases
- Open-access and English-language bias; local-language searches were not run systematically in this edition.
- Biomedical indexes under-represent architecture, textiles and craft knowledge; Crossref relevance search partly compensates.
- Several publisher pages refused automated reading (see `blocked.json`).

## Time period
All years; the edition's search date is 28 November 2026. Refresh: `node research/2026-11/living-knowledge/search.js --since <last search date>`.
