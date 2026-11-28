// Common Shade: the words /opportunities/ ("Heat Opportunities"), its detail pages, its feed and llms-full.txt share, so
// they never differ. Counts are never typed here: they come from the records and the coverage ledger.
"use strict";
module.exports = {
  title: "Heat Opportunities",
  h: "Heat Opportunities",
  lede: "Find work, research and funding opportunities to help protect people from extreme heat.",
  sub: "Jobs, individual consultancies, fellowships and research posts for people; grants, research calls, tenders and challenges for organisations. Each links to the official listing, says why it matters for heat, and shows when its source was last checked.",
  question: "Where can I contribute to heat resilience, and what is genuinely open to me now?",
  paths: [
    ["jobs", "Jobs and consultancies", "Paid roles and individual consultancies, each linked to the employer's own listing."],
    ["funding", "Funding and RFPs", "Grants, research calls, tenders and challenges for organisations."],
    ["research", "Fellowships and research", "Fellowships, studentships, internships, research posts and research funding calls."]
  ],
  network: "Include other roles at heat-network organisations",
  networkNote: "These organisations work on heat, but the listing itself has no verified heat-specific duties. They are left out of the default view.",
  rules: [
    "A working link does not prove a vacancy is open, and a vanished page does not prove a post was filled: a listing that could not be re-checked shows \"Recheck due\" or \"Source unavailable\", never \"Closed\".",
    "No published deadline does not mean rolling. \"Rolling\" and \"until filled\" appear only where the source says so.",
    "A deadline given as a date only keeps that precision: no closing time or time zone is invented, and no hourly countdown is shown.",
    "Once a deadline passes, a listing moves to the archive unless the source shows an extension; an extension keeps the earlier date in the record.",
    "Pay, funding amounts, visa sponsorship and eligibility appear only as published. An annual salary, a consultancy fee and a grant are never compared, and currencies are not converted.",
    "Remote does not mean open to applicants everywhere: where a listing limits where people can work from, the card says so.",
    "A listing here does not make an organisation a Common Shade partner, and Common Shade does not recommend or rank any opportunity."
  ],
  coverage: {
    h: "How complete is this?",
    note: "Listings are not exhaustive. Common Shade checks the public opportunity pages of every organisation in its heat network, plus a few official feeds; many organisations publish on portals that need a login or JavaScript, which a person reviews by hand.",
    statusNote: "An organisation's coverage status says whether its pages were read in this review cycle. It is separate from how fresh each listing is: every listing carries its own \"Source checked\" date.",
    none: "\"None found\" means none in the pages reviewed, not that the organisation has no opportunities anywhere."
  },
  refresh: "How this list is kept up to date: the sweep that reads every network organisation's pages runs from a GitHub workflow; each run opens a review pull request, and a person adds or updates a listing only after its official page passes the source check. Deadlines are recalculated every time the site is built and in your browser as you read.",
  save: "Saved searches and saved listings stay in this browser, on this device only. Nothing is sent anywhere and no account is needed.",
  none: "No listing matches these filters. Try fewer filters, include other roles at heat-network organisations, or look at the archive.",
  apply: "Read the official listing before applying: the employer or funder's own words decide eligibility, deadlines and how to apply.",
  trust: "Being listed does not mean an organisation endorses Common Shade, or that Common Shade recommends or ranks it. Something wrong or missing? Tell us through the corrections page."
};
