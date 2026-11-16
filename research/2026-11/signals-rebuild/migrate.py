#!/usr/bin/env python3
# One-off migration (November 2026): moves data/site/signals.json from one ladder stage per commitment to deliverables,
# milestones and evidence (tools/signals-model.js). It adds no new claim: every deliverable and milestone restates what the
# record already said, and every piece of evidence names the terms the site's source check found on that page
# (data/inbox/*/link-check.json) or, where none was recorded, is left to show as not verified. Source types follow the
# publisher kind in the check batches (official pages, plans and press releases from the actor are "original"; news,
# legal updates and accounts by others are "secondary"). Run once, then: node tools/signals-sync.js
import json, os
ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "..")
F = os.path.join(ROOT, "data", "site", "signals.json")
D = json.load(open(F))
REVIEWED = "2026-11-16"

# source ids and types, in each record's existing source order
SRC = {
 "sig-cop31-2026": [("unfccc", "original")],
 "sig-wmo-state-of-climate-2026": [("wmo-press", "original"), ("wmo-report", "original"), ("afp", "secondary")],
 "sig-el-nino-2026-2027": [("wmo-press", "original"), ("wmo-enso", "original")],
 "sig-emissions-gap-2026": [("pbl", "original")],
 "sig-cop31-air-2026": [("who", "original"), ("hpw", "secondary"), ("un-news", "secondary")],
 "sig-cop31-antalya-compact-2026": [("presidency", "original"), ("lexisnexis", "secondary")],
 "sig-cop31-health-theme-2026": [("who", "original")],
 "sig-ifrc-heat-warnings-2026": [("ifrc", "original")],
 "sig-adaptation-gap-2026": [("unep", "original")],
 "sig-belem-adaptation-indicators-2025": [("unfccc", "original")],
 "sig-india-heatwave-calamity-2026": [("dte", "secondary")],
 "sig-global-heat-forum-2026": [("climateworks", "secondary")],
 "sig-narayanganj-hap": [("plan", "original"), ("prothom-alo", "secondary")],
 "sig-bangladesh-hnap-2026": [("unfpa", "secondary"), ("plan", "original")],
 "sig-bangkok-heat-plan-2026": [("thai-gov", "original"), ("strategy", "original")],
 "sig-singapore-heat-office-2026": [("msse", "original")],
 "sig-south-asia-climate-health-desk-2026": [("wmo", "secondary")],
 "sig-sea-heat-health-hub-2026": [("paa", "original")],
 "sig-south-asia-pre-monsoon-2026": [("wwa", "original"), ("mongabay", "secondary")],
 "sig-niua-heat-resilient-cities-2026": [("niua", "original")],
 "sig-heat-governance-pilots-2026": [("wmo", "original")],
 "sig-singapore-mandatory-heat-measures-2026": [("mom", "original"), ("rajah-tann", "secondary")],
 "sig-philippines-heat-stress-advisories-2026": [("tribune-guidelines", "secondary"), ("tribune-compensation", "secondary")],
 "sig-korea-heat-emergency-warning-2026": [("jakarta-post", "secondary"), ("joongang", "secondary"), ("the-star", "secondary")],
 "sig-viet-nam-outdoor-workers-2026": [("ministry", "secondary")],
 "sig-world-bank-livable-future-2026": [("world-bank", "original")],
}
# display geography; corrected places where a country page exists
WHERE = {
 "sig-cop31-2026": "Global (UN climate process)", "sig-wmo-state-of-climate-2026": "Global", "sig-el-nino-2026-2027": "Global",
 "sig-emissions-gap-2026": "Global", "sig-cop31-air-2026": "Global (UN climate process)", "sig-cop31-antalya-compact-2026": "Global (UN climate process)",
 "sig-cop31-health-theme-2026": "Global (UN climate process)", "sig-ifrc-heat-warnings-2026": "Global", "sig-adaptation-gap-2026": "Developing countries",
 "sig-belem-adaptation-indicators-2025": "Global (UN climate process)", "sig-india-heatwave-calamity-2026": "India",
 "sig-global-heat-forum-2026": "Bangkok, Thailand (a global forum)", "sig-narayanganj-hap": "Narayanganj, Bangladesh", "sig-bangladesh-hnap-2026": "Bangladesh",
 "sig-bangkok-heat-plan-2026": "Bangkok, Thailand", "sig-singapore-heat-office-2026": "Singapore", "sig-south-asia-climate-health-desk-2026": "South Asia",
 "sig-sea-heat-health-hub-2026": "Indonesia and Thailand", "sig-south-asia-pre-monsoon-2026": "India and South Asia", "sig-niua-heat-resilient-cities-2026": "India",
 "sig-heat-governance-pilots-2026": "Barbados, Senegal and Cambodia", "sig-singapore-mandatory-heat-measures-2026": "Singapore",
 "sig-philippines-heat-stress-advisories-2026": "Philippines", "sig-korea-heat-emergency-warning-2026": "South Korea",
 "sig-viet-nam-outdoor-workers-2026": "Hanoi and Ho Chi Minh City, Viet Nam", "sig-world-bank-livable-future-2026": "South Asia",
}
PLACES_FIX = {"sig-philippines-heat-stress-advisories-2026": ["philippines"]}
POPS = {"sig-singapore-mandatory-heat-measures-2026": ["workers"], "sig-philippines-heat-stress-advisories-2026": ["workers"],
        "sig-korea-heat-emergency-warning-2026": ["workers"], "sig-viet-nam-outdoor-workers-2026": ["workers"], "sig-world-bank-livable-future-2026": ["workers"]}
# heat relevance: explicit when the source names heat; otherwise Common Shade's reading, said so
INTERP = {
 "sig-cop31-2026": "The conference covers climate change broadly; following it for heat is Common Shade's choice.",
 "sig-emissions-gap-2026": "A projection of warming; what it means for heat exposure is Common Shade's reading.",
 "sig-cop31-air-2026": "The platform concerns climate risks to health in general; heat is one of those risks in UN News' account, not a stated focus.",
 "sig-cop31-antalya-compact-2026": "The checked text concerns the energy use of buildings; the link to cooling and indoor heat is Common Shade's reading.",
 "sig-cop31-health-theme-2026": "The theme concerns climate shocks to health systems; whether it names heat was not verified.",
 "sig-adaptation-gap-2026": "The figures are for adaptation finance as a whole; no share for heat is given, and none is implied here.",
 "sig-belem-adaptation-indicators-2025": "The indicators measure adaptation in general; which of them bear on heat was not assessed.",
}
# when each record is next due for review
DUE = {g: "2026-11-27" for g in []}
def due(s):
  if s["id"] == "sig-singapore-mandatory-heat-measures-2026": return "2026-12-02"
  if s["group"] == "cop31": return "2026-11-27"
  if s["id"] == "sig-sea-heat-health-hub-2026": return "2027-01-16"
  return "2027-02-16" if s["kind"] in ("commitment", "gathering") else "2027-05-16"

def ev(src, establishes, terms=None):
  e = {"source": src, "establishes": establishes}
  if terms: e["terms"] = terms
  return e
DEL = {
 "sig-cop31-air-2026": [
  {"id": "d-platform", "what": "The Antalya Initiative for Health Resilience, a voluntary platform for countries to share their experience", "type": "platform",
   "milestones": [{"id": "m-launched", "step": "announced", "date": "2026-11-09", "note": "Launched on Health Day, the first day of COP31",
     "evidence": [ev("who", "WHO's COP31 brief describes the Antalya Initiative as a voluntary platform launched at COP31.", ["Antalya Initiative", "voluntary"]),
                  ev("hpw", "Reports that on the launch day no country had yet announced that it would take part.", ["Antalya Initiative", "participation"])]}],
   "unknown": ["Which countries take part: none found in the sources checked as of the last review", "What the platform will produce, and any funding: not disclosed in the sources checked"],
   "next": "A country announcing that it will take part, or the platform's first published output."}],
 "sig-cop31-antalya-compact-2026": [
  {"id": "d-compact", "what": "The Antalya Compact for Energy Efficient Buildings, open for endorsement by Parties", "type": "platform",
   "milestones": [{"id": "m-launched", "step": "announced", "date": "2026-10-29", "note": "Launched by the COP31 Presidency ahead of the conference and opened for endorsement",
     "evidence": [ev("presidency", "The COP31 Presidency's own announcement of the Compact for buildings.", ["Antalya Compact", "buildings"]),
                  ev("lexisnexis", "Reports the Compact and its 2035 aim.", ["Antalya Compact", "2035"])]}],
   "unknown": ["Which Parties have endorsed it: not verified", "Whether it names cooling or indoor heat: not verified"],
   "next": "Endorsements by countries in South and Southeast Asia, and building codes there that name cooling and indoor heat."}],
 "sig-cop31-health-theme-2026": [
  {"id": "d-theme", "what": "A theme on Dynamic and Resilient Health Systems in the COP31 presidency's action agenda", "type": "framework",
   "milestones": [{"id": "m-set-out", "step": "announced", "date": "2026", "note": "Set out in the presidency's action agenda, without a numerical target",
     "evidence": [ev("who", "WHO's COP31 brief names the theme in the presidency's action agenda.", ["Dynamic and Resilient Health Systems"])]}],
   "unknown": ["A target or reporting route: none found in the sources checked", "Whether heat is named within the theme: not verified"],
   "next": "A target or a reporting route for the theme, with heat named in it."}],
 "sig-belem-adaptation-indicators-2025": [
  {"id": "d-indicators", "what": "59 Belém Adaptation Indicators to measure progress on adaptation", "type": "framework",
   "milestones": [{"id": "m-adopted", "step": "adopted", "date": "2025", "note": "Adopted at CMA 7, under the Global Goal on Adaptation",
     "evidence": [ev("unfccc", "UNFCCC's Global Goal on Adaptation page describes the indicators adopted at CMA 7.", ["Global Goal on Adaptation", "indicators"])]}],
   "unknown": ["Which indicators bear on heat: not assessed", "Reporting against them by countries in South and Southeast Asia: not verified"],
   "next": "Countries in South and Southeast Asia reporting on the indicators, including any that touch heat and health."}],
 "sig-india-heatwave-calamity-2026": [
  {"id": "d-calamity", "what": "Heatwaves added to India's notified natural calamities, so disaster response funds can pay for heatwave relief", "type": "rule",
   "milestones": [{"id": "m-added", "step": "adopted", "date": "2026-08", "note": "A rule change, reported from a reply in India's Lok Sabha",
     "evidence": [ev("dte", "Reports the change, citing a reply in the Lok Sabha.")]}],
   "unknown": ["The official notification or order: not located among the sources checked", "Heatwave relief paid from a response fund: not verified"],
   "next": "The official notification or order, and a state reporting heatwave relief paid from its response fund."}],
 "sig-narayanganj-hap": [
  {"id": "d-plan", "what": "Narayanganj City Corporation's heat action plan", "type": "plan",
   "milestones": [{"id": "m-approved", "step": "adopted", "date": "2025-09-22", "note": "Approved by the city corporation; published in 2026",
     "evidence": [ev("plan", "The plan itself, which gives each short-term action a tentative cost and names potential funding sources.", ["Narayanganj", "budget"]),
                  ev("prothom-alo", "Reports it as Bangladesh's first urban heatwave action plan.", ["Narayanganj", "heat"])]}],
   "unknown": ["Budget lines for its actions, from the city or its partners: not verified"],
   "next": "Budget lines for its actions, from the city or its partners."},
  {"id": "d-cooling", "what": "Cooling centres in accessible public buildings, proposed in the plan", "type": "service",
   "milestones": [{"id": "m-proposed", "step": "announced", "date": "2025-09-22", "note": "Proposed in the approved plan",
     "evidence": [ev("plan", "The plan proposes cooling centres in accessible public buildings.", ["Narayanganj"])]}],
   "unknown": ["Whether any cooling centre has opened: not verified"],
   "next": "A cooling centre named in the plan opening, with where and when."}],
 "sig-bangladesh-hnap-2026": [
  {"id": "d-plan", "what": "Bangladesh's Health National Adaptation Plan 2026", "type": "plan",
   "milestones": [{"id": "m-adopted", "step": "adopted", "date": "2026-03-31", "note": "Launched and adopted",
     "evidence": [ev("unfpa", "Reports the plan's adoption."),
                  ev("plan", "The published plan document from the Government of Bangladesh, with its costing and financing strategies.", ["HNAP Financing Strategies", "Costing of HNAP"])]}],
   "unknown": ["Money committed against its five-year costing of about US$1.4 billion: not verified"],
   "next": "Money committed against its five-year costing."}],
 "sig-bangkok-heat-plan-2026": [
  {"id": "d-plan", "what": "Bangkok's Urban Heat Management Action Plan for 2026", "type": "plan",
   "milestones": [{"id": "m-developed", "step": "adopted", "date": "2026", "note": "The city's own plan for 2026, with 22 indicators",
     "evidence": [ev("strategy", "The UNDP and BMA financing strategy states that the city developed the plan, with 22 indicators.", ["BMA developed the Urban Heat Management Action Plan", "22 indicators"])]}],
   "facts": [{"text": "A 2026 financing strategy with UNDP costs the plan at about THB 146 million to set up and THB 10.8 million a year to run.", "evidence": [ev("strategy", "States both figures.", ["146,266,400", "10,816,408"])]},
             {"text": "The city reports that money to build is generally available, but running costs are not always covered.", "evidence": [ev("strategy", "States that running costs are not always covered.", ["OPEX are not always covered"])]}],
   "unknown": ["Whether running costs for the plan are funded for 2027: not verified"],
   "next": "A budget line for the plan's running costs."},
  {"id": "d-cooling", "what": "304 cooling centres for the 2026 hot season", "type": "service",
   "milestones": [{"id": "m-open", "step": "delivered", "date": "2026", "note": "304 cooling centres open in schools, health centres and district offices",
     "evidence": [ev("thai-gov", "The Government of Thailand reports Bangkok opening 304 cooling centres.", ["304"])]}],
   "unknown": ["Who used the cooling centres: not verified", "Any evaluation: none found in the sources checked"],
   "next": "Who used the cooling centres, and with what result."},
  {"id": "d-targets", "what": "The plan's targets, including cooling rooms in 80% of schools and public health service centres", "type": "plan",
   "milestones": [{"id": "m-set", "step": "announced", "date": "2026", "note": "Set as targets in the plan",
     "evidence": [ev("strategy", "Lists the targets, including cooling rooms covering 80% of schools and Cool Community Centers.", ["Covering 80% of schools", "Cool Community Centers"])]}],
   "unknown": ["Progress against the targets: not verified"],
   "next": "A progress report against the plan's 22 indicators."}],
 "sig-singapore-heat-office-2026": [
  {"id": "d-office", "what": "The Heat Resilience Policy Office, to coordinate action across agencies and oversee research", "type": "office",
   "milestones": [{"id": "m-set-up", "step": "adopted", "date": "2026-03", "note": "The office is set up",
     "evidence": [ev("msse", "The Ministry's speech announces the office and its role.", ["Heat Resilience Policy Office", "coordinate action, oversee research"])]}],
   "unknown": ["The office's staffing and budget: not disclosed in the passages checked"],
   "next": "The office's first published work."},
  {"id": "d-funding", "what": "S$40 million 'Adapting to Heat Impacts' research funding initiative", "type": "funding",
   "milestones": [{"id": "m-announced", "step": "funding-announced", "date": "2026-03", "note": "S$40 million research initiative announced",
     "evidence": [ev("msse", "The Ministry's speech announces the initiative and its amount.", ["Adapting to Heat Impacts", "$40 million"])]}],
   "unknown": ["Awards made or money paid out: not verified", "An application route: not verified"],
   "next": "Awards made under the initiative."},
  {"id": "d-plan", "what": "A heat resilience action plan, to be drafted by the office", "type": "plan",
   "milestones": [{"id": "m-promised", "step": "announced", "date": "2026-03", "note": "Named as work for the new office",
     "evidence": [ev("msse", "The speech names the Heat Resilience Action Plan as work for the office.", ["Heat Resilience Action Plan"])]}],
   "unknown": ["A publication date: not verified"],
   "next": "The published action plan."}],
 "sig-south-asia-climate-health-desk-2026": [
  {"id": "d-desk", "what": "A South Asia Climate-Health Desk under the WHO-WMO Climate and Health Joint Programme", "type": "funding",
   "milestones": [{"id": "m-announced", "step": "funding-announced", "date": "2026-02-20", "note": "Funding announced; amounts not disclosed", "amount": {"disclosed": False},
     "evidence": [ev("wmo", "WMO reports the desk among new initiatives on extreme heat in South Asia.", ["South Asia", "heat"])]}],
   "unknown": ["The amount: not disclosed", "Money committed or paid: not verified"],
   "next": "Tailored heat-risk thresholds published for use in warnings."},
  {"id": "d-consortium", "what": "A South Asia Scientific Research Consortium", "type": "funding",
   "milestones": [{"id": "m-announced", "step": "funding-announced", "date": "2026-02-20", "note": "Funding announced; amounts not disclosed", "amount": {"disclosed": False},
     "evidence": [ev("wmo", "WMO reports the consortium among the same initiatives.", ["South Asia", "heat"])]}],
   "unknown": ["The amount: not disclosed", "Money committed or paid: not verified"],
   "next": "The consortium's first published research."}],
 "sig-sea-heat-health-hub-2026": [
  {"id": "d-hub", "what": "The next stage of the Southeast Asia Heat Health Hub, including heat-health work in Indonesia and Thailand in 2027", "type": "funding",
   "milestones": [{"id": "m-announced", "step": "funding-announced", "date": "2026-10-08", "note": "Funding announced; amount not disclosed", "amount": {"disclosed": False},
     "evidence": [ev("paa", "The Philanthropy Asia Alliance announcement names support for the Hub, with work in Indonesia and Thailand.", ["Philanthropy Asia Alliance", "Hub", "Indonesia", "Thailand"])]}],
   "unknown": ["The amount and period: not disclosed", "Money committed or paid: not verified", "An application route: not verified"],
   "next": "Heat-health work under way in Indonesia and Thailand in 2027."}],
 "sig-heat-governance-pilots-2026": [
  {"id": "d-pilots", "what": "Pilots of the Extreme Heat Risk Governance Framework and Toolkit in Barbados, Senegal and Cambodia", "type": "platform",
   "milestones": [{"id": "m-funding", "step": "funding-announced", "date": "2026", "note": "Pilots supported by the CREWS initiative",
                   "evidence": [ev("wmo", "The record states support from the Climate Risk and Early Warning Systems (CREWS) initiative; this was not among the terms the source check looked for.", ["CREWS"])]},
                  {"id": "m-piloting", "step": "delivered-partial", "date": "2026", "note": "Being piloted in 2026 in three countries",
                   "evidence": [ev("wmo", "WMO reports the framework being piloted in 2026 in Barbados, Senegal and Cambodia.", ["Cambodia", "Barbados", "Senegal"])]}],
   "unknown": ["The pilots' results: not published in the sources checked", "The amount of CREWS support: not verified"],
   "next": "The pilots' results published, and what Cambodia's pilot shows for Southeast Asia."}],
 "sig-singapore-mandatory-heat-measures-2026": [
  {"id": "d-rule", "what": "Mandatory heat stress measures for outdoor work, including drinking water", "type": "rule",
   "milestones": [{"id": "m-announced", "step": "adopted", "date": "2026-08-28", "note": "Enhancements to the heat stress framework announced",
                   "evidence": [ev("mom", "The Ministry of Manpower announced the enhancements on 28 August 2026.", ["28 August 2026"]),
                                ev("rajah-tann", "A legal update describing the measures, including drinking water, from 1 December 2026.", ["1 December 2026", "drinking water"])]},
                  {"id": "m-effective", "step": "effective", "date": "2026-12-01", "scheduled": True, "note": "The measures become mandatory; this date alone does not show compliance",
                   "evidence": [ev("mom", "States that the measures take effect on 1 December 2026.", ["1 December 2026"])]}],
   "unknown": ["How compliance will be inspected and reported: not assessed in this record", "Implementation after 1 December 2026: not yet possible to verify"],
   "next": "Inspection or enforcement reports after 1 December 2026."}],
 "sig-philippines-heat-stress-advisories-2026": [
  {"id": "d-guidelines", "what": "Guidelines requiring employers to protect workers from heat stress", "type": "rule",
   "milestones": [{"id": "m-issued", "step": "adopted", "date": "2026-10-27", "note": "Workplace heat stress guidelines issued",
     "evidence": [ev("tribune-guidelines", "Reports the Department of Labor and Employment issuing a labour advisory on heat stress.", ["heat", "Labor Advisory"])]}],
   "unknown": ["The advisory text itself: not located among the sources checked", "Its effective date and coverage: not verified"],
   "next": "The advisory text, and workplaces applying it."},
  {"id": "d-compensation", "what": "Rules on compensation for heat stress and heat-related illness at work", "type": "rule",
   "milestones": [{"id": "m-issued", "step": "adopted", "date": "2026-10-24", "note": "Guidelines on compensation for heat-related illness issued",
     "evidence": [ev("tribune-compensation", "Reports the Department setting compensation rules for heat-related illness.", ["heat", "compensation"])]}],
   "unknown": ["The rules' text: not located among the sources checked", "Claims filed or paid: not verified"],
   "next": "Compensation claims for heat illness being filed and paid."}],
 "sig-korea-heat-emergency-warning-2026": [
  {"id": "d-warning", "what": "An emergency level at the top of a new heatwave warning system", "type": "service",
   "milestones": [{"id": "m-first", "step": "delivered", "date": "2026-07-12", "note": "First emergency heatwave warning issued under the new system",
     "evidence": [ev("jakarta-post", "Reports the first emergency heatwave warning.", ["emergency", "38"])]}],
   "facts": [{"text": "Workplaces added longer lunches and more breaks.", "evidence": [ev("the-star", "Reports longer lunches and more breaks at work.", ["break", "heat"])]}],
   "unknown": ["When the new rating system was adopted: not verified", "Any review of its effect: none found in the sources checked"],
   "next": "A published review of whether the new warning level changed what people, employers and services did."}],
}
READ = {
 "sig-singapore-mandatory-heat-measures-2026": {
  "changed": "Heat stress measures for outdoor work, including drinking water, move from advice to requirements, announced on 28 August 2026 to apply from 1 December 2026.",
  "matters": "A requirement, rather than advice, can give workers, worker organisations and inspectors a common standard to refer to.",
  "decisions": "How employers prepare before 1 December; how worker organisations explain the new duties; what inspections cover.",
  "uncertain": "How compliance will be inspected and reported, and how far the measures reach subcontracted and migrant workers, are not assessed in this record.",
  "examine": "Inspection or enforcement reports after 1 December 2026, and the legal text that sets the duties."},
 "sig-india-heatwave-calamity-2026": {
  "changed": "As reported, heatwaves joined India's notified natural calamities in August 2026, so national and state disaster response funds can pay for heatwave relief.",
  "matters": "Relief for heat could then use the same channels as floods and cyclones, rather than a capped share of state funds for locally declared disasters.",
  "decisions": "State disaster plans and budgets; what counts as heatwave relief; how heat deaths and losses are recorded so that relief can be claimed.",
  "uncertain": "The official notification was not located among the sources checked, and no relief paid for heatwaves has been verified.",
  "examine": "The notification or order itself, and a state reporting heatwave relief paid from its response fund."},
 "sig-bangkok-heat-plan-2026": {
  "changed": "Bangkok has its own heat plan for 2026, costed to set up and to run, and opened 304 cooling centres for the hot season.",
  "matters": "The city reports that running costs are not always covered, so whether protection lasts beyond one season depends on recurring money.",
  "decisions": "How the city and its partners fund running costs; where cooling centres sit and when they open; how use is counted.",
  "uncertain": "Who used the cooling centres, progress against the plan's targets, and funding for running costs are not verified.",
  "examine": "Use figures for the cooling centres, a progress report against the 22 indicators, and a budget line for running costs."},
 "sig-singapore-heat-office-2026": {
  "changed": "Three separate things: a policy office set up in March 2026, a S$40 million research funding initiative, and an action plan the office is to draft.",
  "matters": "A standing office and dedicated research money can make heat an ongoing responsibility across agencies rather than a seasonal one.",
  "decisions": "Agencies whose work the action plan may cover; researchers following heat impacts in Singapore. No application route was verified, and this is not a funding call.",
  "uncertain": "How much of the S$40 million has been awarded or paid, and when the action plan will be published, are not verified.",
  "examine": "The published action plan, and awards made under the funding initiative."},
 "sig-sea-heat-health-hub-2026": {
  "changed": "Philanthropy Asia Alliance announced support for the next stage of the Southeast Asia Heat Health Hub, including heat-health work in Indonesia and Thailand in 2027.",
  "matters": "Regional sharing of heat-health evidence gains support for a further stage, with named country work.",
  "decisions": "Health agencies and cities in Indonesia and Thailand planning heat-health work for 2027.",
  "uncertain": "The amount, the period, and whether money has been committed or paid are not disclosed; no application route was verified, and this is not an open funding opportunity.",
  "examine": "A published amount or grant agreement, and work starting in the named cities in 2027."},
}
for s in D["signals"]:
  sid = s["id"]; pairs = SRC[sid]
  assert len(pairs) == len(s["sources"]), sid
  s["sources"] = [dict({"id": i, "type": t}, **x) for (i, t), x in zip(pairs, s["sources"])]
  s["where"] = WHERE[sid]
  if sid in PLACES_FIX: s["places"] = PLACES_FIX[sid]
  if sid in POPS: s["populations"] = POPS[sid]
  s["relevance"] = {"basis": "interpreted", "note": INTERP[sid]} if sid in INTERP else {"basis": "explicit"}
  if sid in DEL: s["deliverables"] = DEL[sid]
  if sid in READ: s["reading"] = dict(READ[sid], reviewed=REVIEWED)
  s["review"] = {"reviewed": REVIEWED, "due": due(s)}
missing = [s["id"] for s in D["signals"] if s["kind"] == "commitment" and "deliverables" not in s]
assert not missing, missing
cop = next(g for g in D["groups"] if g["id"] == "cop31")
cop["scope"] = "Heat in COP31's announcements and outcomes on adaptation, health, finance, cooling and early warnings, including launches shortly before the conference. Each item enters only after its source passes the site's check."
cop["cutoff"] = "2026-11-15"
cop["checkins"] = [
 {"date": "2026-11-09", "label": "Opening", "added": ["sig-cop31-2026", "sig-wmo-state-of-climate-2026", "sig-el-nino-2026-2027", "sig-emissions-gap-2026", "sig-belem-adaptation-indicators-2025"], "note": "The conference, the year's climate findings and the adaptation indicators it builds on."},
 {"date": "2026-11-13", "label": "Check-in 1", "added": ["sig-cop31-air-2026", "sig-cop31-health-theme-2026", "sig-ifrc-heat-warnings-2026", "sig-adaptation-gap-2026"], "note": "Health and finance: the health platform launched on Health Day, the presidency's health theme, and two calls for money and warnings."},
 {"date": "2026-11-15", "label": "Check-in 2", "added": ["sig-cop31-antalya-compact-2026"], "note": "A buildings compact launched before the conference, added at the announced step."}]
cop["synthesis"] = None
json.dump(D, open(F, "w"), ensure_ascii=False, indent=1)
print("migrated", len(D["signals"]), "signals;", sum(len(s.get("deliverables", [])) for s in D["signals"]), "deliverables")
