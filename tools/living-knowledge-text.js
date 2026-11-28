// Common Shade: the words /living-knowledge/ and its pages share with llms-full.txt, so they never differ. Counts are never
// typed here: they come from the records (tools/living-knowledge.js).
"use strict";
module.exports = {
  title: "Living Knowledge: Local Practices for Heat Resilience",
  short: "Living Knowledge",
  lede: "How people have learned to live with heat, and what enables those practices to protect people today.",
  question: "What would allow a valuable local practice to remain usable as heat intensifies, and who needs to support that?",
  intro: "A searchable repository of documented local, traditional and vernacular practices for living with heat in South and Southeast Asia. Each record says what people do, where it is documented, what kind of evidence exists, where it stops working, and what it takes to keep it usable: authority, money, labour, water, materials and maintenance.",
  limits: [
    "This is a targeted evidence scan, not a systematic review, and it is not exhaustive. A practice missing here is not a practice that does not exist.",
    "Local coping does not replace safe housing, worker protection, cooling and health care in dangerous heat.",
    "What people describe, what was measured, what a plan says and what Common Shade suggests are labelled separately on every record.",
    "Reported home remedies are documented with respect and kept out of advice. For heat illness, follow official health guidance and seek care urgently for severe symptoms.",
    "No community, organisation or expert has reviewed these records yet; each record says so."
  ],
  editorial: "Common Shade's suggestion, not a source's recommendation.",
  emergency: "In dangerous heat or if someone shows signs of heat illness, follow official health guidance and seek medical care. Everyday practices are not emergency treatment.",
  method: {
    what: "Searches of Europe PMC (which covers PubMed and PMC) and Crossref by domain and region, official pages from WHO, UNICEF, UNFPA and the World Bank, and the seed sources supplied with the brief. Every query, date and hit count is in the search log; every screening decision is recorded.",
    gate: "A claim is published only when every word it rests on was found on its source by an automated check on GitHub. A practice is shown only when all its claims passed. A page that merely opened is not evidence.",
    dates: "Each record keeps three dates apart: when its sources were last read by the check, when its text was last edited, and when its evidence was last reviewed by a person. A link check never refreshes the evidence review date.",
    updates: "A monthly workflow repeats the logged searches from the last search date and opens a review pull request with new leads. Nothing is published automatically; health guidance is never published without review."
  },
  churu: {
    h: "Worked example: how Churu's heat action plan connects local practice to public action",
    lede: "Churu, a desert city in Rajasthan, wrote traditional clothing, food and architecture into its heat action plan, and turned some of it into measures with named responsibilities. Inclusion in a plan is a first step, not delivery.",
    ladder: [["documented", "Documented in the plan"], ["assigned", "Responsibility assigned"], ["budgeted", "Budgeted"], ["implemented", "Implemented"], ["evaluated", "Monitored or evaluated"]],
    note: "This is one example from a hot, dry city, not a template for humid Asian cities. Roles beyond those the plan assigns are labelled as proposed applications."
  },
  rights: "Records are written in Common Shade's own words with citations; no text, images or designs are reproduced from sources. Each source keeps its own licence, shown on every record, in exports and in print. Common Shade's summaries are CC BY 4.0. No household or precise location is published.",
  contribute: "Suggest a correction, a missing practice or a better source through the corrections page or the join form. A person reviews every suggestion. This edition takes no community contributions; a future route would let contributors choose attribution and reuse limits and ask for withdrawal."
};
