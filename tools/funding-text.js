// Common Shade: the words the funding landscape, the open calls page, the careers page and llms-full.txt share, so they
// never differ. Counts are never typed here: they come from the records (tools/funding-model.js).
"use strict";
module.exports = {
  LAND: {
    h: "The funding landscape",
    lede: "Who funds work relevant to extreme heat in South and Southeast Asia, through which programmes, and how each can be reached. A funder is not an open call: most of these programmes are not accepting applications today, and several are reached only through an accredited entity, a government nomination, a consortium or an invitation.",
    how: "Each programme shows its access route, who can receive money, what kind of money it is, and how its remit connects to heat. The connection is labelled by how direct it is."
  },
  NEEDS: {
    h: "What needs funding?",
    lede: "The kinds of work heat protection needs, and how many records in this curated dataset explicitly support each. A low number is a gap in the dataset, not proof that no funding exists: the absence of a published call is not the absence of funding.",
    gapNote: "Little verified coverage so far"
  },
  OPP: {
    title: "Open calls and tenders",
    h: "Open calls and tenders for work on extreme heat",
    lede: "Grants, calls, prizes, technical assistance, readiness windows and procurement notices with their own application arrangements. Each shows who can apply, where the work can happen, the amount as published, the deadline in the source's own words, and when the source was last checked.",
    default: "Showing verified open calls that relevant applicants or work in Asia can reach. Broaden the view to see upcoming, unconfirmed and closed records.",
    none: "No record matches these filters. Try fewer filters, or include upcoming and closed records: a call that has closed often returns in a later round.",
    distinctions: [
      "A procurement contract is not a grant: a tender buys a service, and the buyer sets the terms.",
      "An individual consultancy is not an organisational tender.",
      "Equity and loans are not grants.",
      "A programme budget is not the amount one applicant can receive.",
      "A deadline without a published time is treated as uncertain: no countdown is shown."
    ]
  },
  CAR: {
    title: "Careers in heat resilience",
    h: "Careers in heat resilience",
    lede: "Heat resilience needs people working across health, engineering, labour rights, community organising, finance, research and public policy.",
    sub: "Jobs, individual consultancies, research posts, funded PhDs, fellowships and internships, each linked to the employer's own listing. Some roles do not mention heat in their title; each says how it connects.",
    none: "No listing matches these filters. Try fewer filters, or include closed listings.",
    rules: ["Remote does not mean available worldwide: where a listing limits remote work to certain countries, it says so.", "Pay, visa sponsorship and flexibility are shown only where the employer publishes them; nothing is inferred.", "A university job, a funded PhD, a fellowship, an internship, an individual consultancy and a fee-charging course are different things and are labelled as such."]
  },
  TRUST: "Being listed does not mean that an organisation endorses Common Shade, or that Common Shade recommends or ranks it. Summaries are short and link to the original listing; read the official documents before applying. Something wrong or missing? Tell us through the corrections page.",
  SAVE: "Your shortlist is saved only in this browser, on this device. It is not synchronised anywhere and no account is needed.",
  CHECKED: "Source checked",
  LIMITS: [
    "Coverage is curated, not complete. Calls in national languages, national government schemes and private foundations without public calls are under-represented.",
    "Few verified records fund recurring delivery and maintenance, worker organisations or locally led delivery. This is a gap in the dataset, not a finding about the whole funding landscape.",
    "Automated discovery only creates candidates. A person checks each against its primary page before it is published."
  ]
};
