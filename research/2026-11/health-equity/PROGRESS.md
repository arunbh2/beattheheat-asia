# Health and gender equity work: progress file

Two owner briefs (27 November 2026), kept here so work continues across sessions without repeating itself.
Originals: `/root/.claude/uploads/.../fd8e1b93-Untitled_document_1.pdf` (brief A, 14 pages) and
`d58b3fd9-Untitled_document_3.pdf` (brief B, 14 pages). Deployment is authorised by the owner ("merge and publish").

## Brief A: Extreme heat, health and gender equity
Central question: "What must change around a person before the protection we recommend becomes a real option?"
Start from /factory-heat/ (and #rec-buddy). Frame risk as exposure, workload, physiology, housing, income and
employment, care, services, decision-making power, recovery. Separate physiology from gendered social conditions. No
homogeneous "women", no helplessness, no pregnancy-only, no fixed caregiver roles, include gender-diverse people, no
vulnerability scores, no solidarity-replaces-institutions. Illustrative situations labelled as such.
Evidence per claim: source, year, country, setting, population, design, exposure, outcome, finding, limits, and
whether it supports association, causation, guidance or mechanism. Distinguish harm / exposure change / health
improvement / access / income-care effects. Never invent effect sizes, costs, cases, quotes or commitments.
- Wave 1 flagships: (1) "When home is also the workplace" with an accessible "A day in one home" (morning, paid work,
  cooking and care, evening, night; per period: exposure sources, activities and constraints, protection, who enables,
  what to measure; composite, no fabricated temperatures); (2) "Care that continues through heat" with a "When a
  service closes" interaction (childcare closure, interrupted home support, inaccessible clinic: who needs care, who
  provides, extra work, public or employer arrangements, tradeoffs; no invented money or time); (3) "Rest without
  losing income" with a "Can this worker use the protection?" comparison (hold the physical measure constant; vary pay,
  break permission, targets, care, travel; qualitative; never a safe work duration).
- Wave 2 connected settings (sections in existing pages where clearer): pregnancy, postpartum, newborns and care
  access (no calculator, no disclosure); water, toilets and dignity (setting audit: provision, hours, access,
  maintenance, feedback; menstrual needs respectfully); schools and childcare (tradeoffs, not closure rules); journeys
  to work and care (illustrative routes, never "safe"); agriculture and cotton (link /cotton-and-heat/ and factory;
  participation versus control of income); ageing, disability and service dependence (as participants).
- Wave 3: shared intervention-card module "Can people actually use this?" (who controls access; cost in money, time
  or earnings; who does the extra work and whether paid; who is excluded; personal data needed; can users shape
  decisions; who pays install and operation; who is accountable; evidence of benefit; what to check locally; honest
  unknowns: "Not assessed", "Local costing needed", "Evidence on equitable access is limited", never "None");
  factory buddy-card fix (paid time, acceptable pairing, language, privacy, non-punitive escalation, response
  responsibility, caring-work burden, supervisor accountability, limits; supplements controls; review "no cost" and
  "none noted"; check adjacent reporting, emergency and occupational-health cards); curated journey "Heat, health and
  the ability to act" (entry questions; pathways for community and worker organisations, authorities, researchers,
  funders); systems-map connections (verify each; established / context-dependent / plausible); evidence gaps per
  flagship (what we know, tested, uncertain, next study); navigation, search, sharing, print.

## Brief B: Four targeted upgrades
Discipline from /factory-heat/: what protection does, who can use it, what prevents access, who bears cost, who has
authority, what evidence supports it. Labels: documented provision, intended benefit, reported delivery, independently
evaluated outcome, unknown. No certification labels ("pregnancy safe" and the like); descriptive labels with a recorded
basis; AI suggestions are not evidence.
- Shared equity taxonomy: A people and settings; B provisions and conditions; C evidence or delivery status; each entry
  with id, label, definition, inclusion and exclusion rules, examples, evidence requirement.
- (1) /plan/: "Equity and accommodation check" beside the WHO check in step 6 (verify the step); labelled a Common Shade
  supplementary check; four questions (income and accommodation; access to services; coverage of work arrangements;
  reporting and response) with Yes / Partly / No / Not assessed / Not applicable with reason; optional fields (support,
  change, who, by when, resources); local storage; completion summary; included in print and export; no score.
- (2) /solutions/: "Equity and access" filter group; Includes / Requires / Not assessed kept apart; reasons and source
  passage per match; counts, reset, AND/OR stated; a visible "Not yet assessed" route; per-card expandable "Can people
  actually use this?"; review every card or mark review incomplete.
- (3) India HAP archive: "Documented health and equity provisions" review layer; 14 dimensions; mention, concrete action,
  named institution, resources, monitoring; statuses explicit / partial / not found in reviewed material / not
  assessed / inaccessible; every assessment keeps title, jurisdiction, version date, URL, file, page, excerpt, method,
  date, reviewer status, limits; no copying across versions; defined initial set, the rest "Not assessed"; filters,
  comparison of a few plans, method, corrections route, coverage summary; no ranking.
- (4) Money and Signals: "Health and equity reach" panel; funding stages and implementation stages kept apart;
  protection categories; total versus allocated versus unspecified amounts; comparison rules ("Within the records
  tracked by Common Shade"); missing versus negative.
- Connect all four through taxonomy ids; editor documentation; tests listed in brief B section 14.

## Status
- [x] Audit (both briefs): AUDIT.md
- [x] Shared taxonomy: data/site/equity-taxonomy.json, tools/equity-taxonomy.js (sources batch 2026-11-health-equity staged, verify run triggered)
- [x] Brief A wave 1 (three flagships with interactions) · [x] wave 2 (connected settings as sections in the flagships) · [x] wave 3 (factory card module and buddy fix, route page, map pathways, gaps, nav, share, print)
- [x] Brief B (1) plan (script.js EQC + cleanEquity; plan/index.html #plan-equity-check; text and printable brief; check-plan-file extended) · [x] (2) solutions (build-solutions.js: filter, reason line, "Can people actually use this?"; styles.css appended, cache bump to ?v=255 still to do) · [x] (3) HAP review (research/2026-11/health-equity/hap-review.js, hap-set.json, research/hap-text/, data/site/hap-equity-review.json, tools/hap-review-section.js; 7 of 147, Maharashtra Marathi -> not assessed) · [x] (4) money and Signals (tools/equity-reach.js in build-funding and build-signals; summary #equity-reach on money page)
- Still to do for brief B: tests (check-equity.js), browser check, editor docs in CLAUDE.md, cache bump ?v=255
- [x] Checks, browser review, PR 363 merged (e3a05550)
