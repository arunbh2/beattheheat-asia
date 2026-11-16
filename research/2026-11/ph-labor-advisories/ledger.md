# Ledger: the Philippines' October 2026 labour advisories on heat

Each claim below reaches the site only when its source passed the check with every term it rests on found. Terms marked *probe* settle open points from their excerpts; they are not claims. Batch: `data/inbox/2026-11-ph-labor-advisories/` (staged by `stage.js`).

## Claims and the terms they rest on
| Claim | Source that decides | Terms |
|---|---|---|
| The Department issued Labor Advisory No. 20, s. 2026, on heat stress | `phla-dole-news` (original: the issuing agency's release), `phla-bwc-list` | "Labor Advisory No. 20", "heat stress" |
| Labor Advisory No. 19 covers compensability under the Employees' Compensation Program | `phla-bwc-list` | "Labor Advisory No. 19", "Compensability" |
| Employers assess heat risk (HIRAC) and follow PAGASA heat index forecasts | `phla-dole-news` now; `phla-la20` in pass 2 | "HIRAC", "PAGASA", "heat index" |
| Duties step up with the heat index, with flexible work at higher levels | `phla-la20` (pass 2); the release only for "the Department says" | "heat index", "flexible work" |
| Which further conditions are compensable | `phla-la19` only (pass 2) | "rhabdomyolysis", "syncope"; *probe* "Compensation Commission", "increased risk" |
| Whether Labor Advisory No. 20 replaces the 2023 advisory | `phla-la20` only (pass 2) | *probe* "Series of 2023", "repeal", "supersede" |

## The open conflict on Labor Advisory No. 19
News reports differ. Some say five further conditions (heat syncope, heat rash, rhabdomyolysis, dehydration-related kidney injury and heat-related neurological disorders) are now compensable; one says they were referred for review and depend on a later policy. **Only the advisory's own text decides.** Until it is read, the site says nothing on the five conditions beyond: "Whether further conditions are compensable or under review: reports differ; the advisory text was not read."

## Not staged, and why
- A workplace-safety vendor's guide that prompted this work: not a source; not named or cited.
- Two explainer sites found by search: leads only; their claims conflict with each other.
- PAGASA's heat index page: staged only once its exact URL is in hand.

## Results of pass 1 (16 November 2026)
- **Blocked:** the Department's issuances list, its press release, the government news agency's report and one newspaper returned 403 to GitHub's checker, as to this session (a bot check), and their archived copies held none of the terms.
- **Opened, all terms found:** NewsWatch Plus on Labor Advisory No. 20 ("heat index", "flexible work", "52") and SunStar Cebu on Labor Advisory No. 19 ("rhabdomyolysis", "syncope", "Employees' Compensation"). The HR association's circular opened, but its text holds only the advisory's title ("Series of 2023" and "repeal" not found).
- **What they settle:**
  - The four heat index bands reported for the advisory (27-32, 33-41, 42-51, 52 and above) match the levels already on the site (`PLAN_TRIGGER_BASES` `index`). No correction is needed.
  - On Labor Advisory No. 19, the checked report says heat stroke, heat cramps and heat exhaustion remain compensable, and other heat-related illnesses "may also qualify" where the link to work is shown. The site uses that wording, as reported, and keeps "reports differ" as an unknown until the advisory text is read.
- **Applied:**
  - the two checked reports as secondary evidence on the Signals record's existing milestones (states derived: reported by secondary sources)
  - updated unknowns on the record
  - one sentence in `PLAN_TRIGGER_BASES` `index` tying employers' duties to the same levels, as reported

## Pass 2 (16 November 2026): the texts, read from copies the owner downloaded in a browser
Both copies came from the Bureau of Working Conditions' issuances page. Labor Advisory No. 19 was read with pdftotext (the scanner's text layer). Labor Advisory No. 20 is an image scan with no text layer, and was read by eye; its signature block is blacked out in the copy. Neither copy can be checked automatically, so the site's evidence states stay "reported by secondary sources", and the record names the read as such.

**Labor Advisory No. 19, s. 2026** (stamped 23 October 2026)
- **Section 1:** it covers workers in the Employees' Compensation Program (SSS and GSIS members) exposed to excessive heat, outdoor and indoor.
- **Section 2:** heat stroke, heat cramps and heat exhaustion "may be compensable". Other heat-related illnesses "may likewise be compensable, provided that the worker's working conditions increased his or her risk".
- **Section 2, the five conditions:** heat syncope, heat rash, rhabdomyolysis, dehydration resulting in kidney injury, and neurological disorders "are recognized as illnesses associated with extreme heat conditions", under ECC Board Resolution No. 26-10-40 (22 October 2026).
- **The attached resolution:** it recognises them "subject to technical review for possible inclusion under the Employees' Compensation Program", and creates a Technical Review Panel to recommend a policy.
- **Section 4:** PAGASA heat index classifications "may be considered as supporting evidence".
- **Section 5:** employers keep records and help workers file claims; the supporting records include the HIRAC.
- **Section 6:** the worker "must prove by substantial evidence" that work "materially contributed".
- **What this settles:** both camps of news reports were partly right. The five conditions are recognised as associated with extreme heat, and their formal inclusion is under technical review. Meanwhile any heat illness may be compensable where work raised the risk. The vendor guide's "also recognised" was incomplete.

**Labor Advisory No. 20, s. 2026** (stamped 27 October 2026)
- **Section 1:** all private-sector employers and workers. The public sector follows a separate joint circular and administrative order.
- **Section 2:** a documented HIRAC, made in consultation with workers. Forecasts are checked against workplace measurements, and the HIRAC is updated on PAGASA advisories and changed conditions.
- **Section 3:** the same four bands as published.
  - Caution (27-32 °C): water, shaded rest areas, uniforms, reminders, training.
  - Extreme caution (33-41 °C): structured rest-shift-hydration cycles, cool-down areas with active cooling, a buddy system, PPE, high-exertion tasks moved to cooler hours, first-aiders.
  - Danger (42-51 °C): flexible work arrangements, made "with the concurrence of affected workers", for example avoiding outdoor work from 12:00 to 3:00 p.m. Total working hours are kept, and the arrangements "shall not substitute for necessary workplace controls".
  - Extreme danger (52 °C and above): the work is reassessed, and suspended, relocated, rescheduled or substantially modified where the risk cannot be adequately controlled. "Continuity of service shall not justify exposing workers to imminent danger."
- **Section 6:** SSS enrolment "regardless of the nature of engagement".
- **Section 8:** heat illnesses are recorded in medical logs and the Annual Medical Report, and a Work Accident/Illness Report goes in within 24 hours for serious incidents.
- **Section 9:** employers and workers are "enjoined to observe" the guidelines. Violations of mandatory OSH standards fall under RA 11058.
- **Not in the text:** no effective-date clause, no repeal or supersede clause, and no mention of the 2023 advisory.

**Outcomes**
- **Question 3 is decided: no edit.** The 2023 line on the paid rest breaks card stays, because Labor Advisory No. 20 does not mention it.
- **Question 2:** the condition on Labor Advisory No. 19 is met. What remains is official pages for eight schemes.
- **Applied:**
  - the Signals summary reworded to the documents' own force (an advisory "setting out steps")
  - unknowns that state what was read and what remains open, including the technical review
  - the 23 October stamp noted, with the date left at the checked 24 October
  - "reassessment of the work" in the trigger basis, which the checked report also supports
- **Held back:** the El Niño forecast footnote, officials' names, any effective date, "now compensable", "replaces the 2023 advisory", and the danger-level details that rest only on the unchecked scan.

**Open for the owner:** whether to host an unaltered copy of Labor Advisory No. 19 on the site, so the check can read it. Its evidence would then read "checked against an original", although the checker would be reading a copy the site supplied.

## Decisions (16 November 2026, recommended by the advisory review and taken by Claude for the owner's approval)
1. **Official texts.** Pass 1 showed that DOLE's sites turn away every automated reader, on GitHub as well as in this session. A link alone therefore cannot get the originals checked. The owner downloads the two advisories in a browser from the Bureau of Working Conditions' issuances page. Claude then reads them with pdftotext and records each claim against the text in this ledger. No PDF link is guessed, and the site's bot check is not bypassed.
2. **Philippines social protection.** Do it, as its own pull request in the existing `2026-11-social-protection` batch, once Labor Advisory No. 19 has been read (the Employees' Compensation record depends on it) and at least eight public schemes each have an official page. Until then it is held, with the candidate scheme list in this folder's notes.
3. **The 2023 line on the paid rest breaks card.** In scope, on one condition: it changes only if the read text of Labor Advisory No. 20 names the 2023 advisory as replaced. Then the sentence is edited in place with the document's own verb, its source is kept, and the 2026 advisory is added as a new example. If the text is silent, the line stays: it is true as dated.

## Candidate schemes for a Philippines file (to verify; none is a claim yet)
SSS sickness benefit; Employees' Compensation (SSS and GSIS); SSS unemployment benefit; PhilHealth; Pantawid Pamilyang Pilipino Program (4Ps); TUPAD emergency employment; DSWD Assistance to Individuals in Crisis Situations (AICS); Social Pension for Indigent Senior Citizens; PCIC crop insurance; a food programme; local calamity or quick response funds, including El Nino aid.
