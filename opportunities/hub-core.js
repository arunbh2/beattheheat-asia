/* Common Shade: Heat Opportunities, the shared rules. Read by the builder (tools/build-opportunities.js), the page script
   (opportunities/hub.js) and the check (tools/check-opportunities.js), so the page, its filters, its feed and its tests never
   disagree. It sits on top of heat-economy/funding-core.js (FundCore), which decides application and verification status:
   one set of deadline rules for the hub, the careers page and the open calls page.

   What it adds:
   - one normalised item per listing, from a careers record (data/funding/careers.json) or a call record (opportunities.json);
   - who can take it up: an individual (job, individual consultancy, fellowship, internship, studentship, research post) or an
     organisation (consulting RFP or tender, grant, research funding call, innovation challenge, partnership or support call).
     An individual consultancy is never an organisational tender;
   - heat relevance in three plain categories, never a score: direct, related, and "heat-network organisation" (the employer or
     funder works on heat, but this listing has no verified heat-specific duties). The default view shows the first two;
   - views (open, closing soon, recently added, jobs and consultancies, funding and RFPs, fellowships and research, archive),
     filters kept in the address, and the words each card uses. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("../heat-economy/funding-core.js"));
  else root.HubCore = factory(root.FundCore);
}(typeof self !== "undefined" ? self : this, function (C) {
  "use strict";
  const DAY = 864e5;
  // categories: [key, label, who]
  const CATS = [
    ["employment", "Job", "individual"], ["consultancy", "Individual consultancy", "individual"], ["fellowship", "Fellowship", "individual"], ["internship", "Internship", "individual"],
    ["studentship", "Studentship or funded PhD", "individual"], ["research-post", "Research position", "individual"],
    ["rfp", "Consulting RFP or tender", "organisation"], ["grant", "Grant or funding call", "organisation"], ["research-call", "Research funding call", "organisation"],
    ["challenge", "Innovation challenge or prize", "organisation"], ["partnership", "Partnership or support call", "organisation"]];
  const CAT = Object.fromEntries(CATS.map(([k, l, w]) => [k, { label: l, who: w }]));
  const ROLE_CAT = { job: "employment", "consultancy-individual": "consultancy", fellowship: "fellowship", internship: "internship", "funded-phd": "studentship", "research-position": "research-post" };
  const TYPE_CAT = { rfp: "rfp", rfq: "rfp", tender: "rfp", eoi: "rfp", "consultancy-firm": "rfp", "grant-call": "grant", prize: "challenge", accelerator: "challenge", "ta-call": "partnership", "readiness-window": "partnership", "contribution-call": "partnership" };
  const WHO = { individual: "For individuals", organisation: "For organisations" };
  const REL = { direct: "Direct heat relevance", related: "Related to heat resilience", network: "Heat-network organisation" };
  const REL_NOTE = {
    direct: "The listing itself is about extreme heat, heat and health, heat action planning, occupational heat, thermal comfort or sustainable cooling.",
    related: "The listing concerns a documented enabling area for heat resilience, such as climate and health, buildings, urban adaptation, worker protection or social protection.",
    network: "The organisation works on heat, but this listing has no verified heat-specific duties or focus."
  };
  const MODE = { onsite: "On site", hybrid: "Hybrid", remote: "Remote", "not-stated": "Not stated" };
  const VIEWS = [["open", "Open now"], ["closing", "Closing soon"], ["recent", "Recently added to Common Shade"], ["jobs", "Jobs and consultancies"], ["funding", "Funding and RFPs"], ["research", "Fellowships and research"], ["archive", "Archive"]];
  const OPENISH = ["open", "rolling", "closing", "upcoming", "unknown"];
  const CLOSING_DAYS = 14, RECENT_DAYS = 30;
  const toMs = now => typeof now === "number" ? now : C.isDate(now) ? Date.parse(now + "T12:00:00Z") : Date.parse(now);

  // relevance from the record's own words: careers say direct, related (formerly "adjacent") or network; calls say explicit,
  // related or potential (heat not named in this call: shown only when a reader includes other listings)
  function relevance(r, kind) {
    if (kind === "career") { const s = r.relevance_strength || "direct"; return s === "adjacent" ? "related" : REL[s] ? s : "related"; }
    const l = (r.relevance || {}).label; return l === "explicit" ? "direct" : l === "related" ? "related" : "network";
  }
  const catOf = (r, kind) => r.hub_category && CAT[r.hub_category] ? r.hub_category : kind === "career" ? ROLE_CAT[r.role] || "employment" : TYPE_CAT[r.type] || "grant";

  // one item the page, the feed and the check read. r is a record from tools/funding-model.js (facts carry .confirmed)
  function item(r, kind, names) {
    const cat = catOf(r, kind), t = (f) => f && typeof f === "object" ? f.text || "" : f || "";
    const d = C.entryDeadline(r);
    const comp = r.compensation || (r.salary ? { disclosed: true, text: t(r.salary) } : null);
    return {
      id: r.id, kind, cat, cat_label: CAT[cat].label, who: CAT[cat].who, title: r.title, aliases: r.aliases || [],
      org: r.org || null, org_name: (names && names[r.org]) || r.employer || "", network_id: r.network_id || null,
      rel: relevance(r, kind), rel_why: kind === "career" ? r.relevance_why || "" : (r.relevance || {}).why || "", rel_evidence: r.relevance_evidence ? { text: r.relevance_evidence.text || r.relevance_evidence.term, confirmed: r.relevance_evidence.confirmed } : null,
      summary: t(r.summary) || t(r.purpose) || "", themes: r.themes || r.topics || [],
      countries: r.countries || ((r.geography || {}).countries || []).filter(c => /^[A-Z]{2}$/.test(c)), cities: r.cities || [], location: t(r.location) || t(r.geography) || "Not stated",
      mode: r.work_mode || (r.remote ? "remote" : "not-stated"), remote_text: r.remote_text || "", eligibility_geo: t(r.eligibility_geo) || t(r.work_authorisation) || (kind === "opportunity" ? t(r.eligibility) : "") || "Not stated",
      experience: t(r.experience) || r.seniority || "Not stated", level: r.level || null, qualifications: t(r.qualifications) || "",
      contract: t(r.contract) || t(r.duration) || "Not stated",
      comp_disclosed: kind === "career" ? !!(comp && comp.disclosed) : !!(r.amount && (r.amount.min != null || r.amount.max != null)),
      comp_text: kind === "career" ? (comp && comp.disclosed ? comp.text : (comp && comp.text) || "Not disclosed") : r.instrument === "none" ? "No payment or funding: an unpaid contribution" : C.amountText(r.amount),
      comp_kind: kind === "career" ? "pay" : "funding",
      deadline: d ? { date: d.date, time: d.time || null, tz: d.tz || null, wording: d.wording || "", confirmed: d.confirmed } : null,
      deadlines: (r.deadlines || []).map(x => ({ stage: x.stage, date: x.date, time: x.time || null, tz: x.tz || null, wording: x.wording || "" })), deadline_history: r.deadline_history || [],
      stated_status: r.stated_status || "", rolling: !!r.rolling, until_filled: !!r.until_filled, withdrawn: !!r.withdrawn, opens: r.opens ? { date: r.opens.date } : null,
      published: r.published || null, first_seen: r.first_seen || null, requisition: r.reference || r.requisition || "",
      official_url: r.official_url || "", application_url: r.application_url || "", apply_text: t(r.apply) || "",
      repost_of: r.repost_of || null, duplicates: r.duplicates || [], conflict: r.conflict || "",
      check: { checked: (r.check || {}).checked || "", ok: (r.check || {}).ok, confirmed: (r.check || {}).confirmed },
      sources: (r.sources || []).filter(s => s.url).map(s => ({ url: s.url, label: s.label })),
      jobposting: r.jobposting || null
    };
  }

  // lifecycle: FundCore's application status, plus "until filled" where the source says so (never inferred)
  const LIFE = { upcoming: "Upcoming", open: "Open", closing: "Deadline day", rolling: "Rolling (as stated)", "until-filled": "Until filled (as stated)", closed: "Deadline passed", "closed-provider": "Closed by provider", withdrawn: "Withdrawn", unknown: "Status unclear" };
  function lifecycle(it, now) {
    const a = C.applicationStatus(it, now);
    if (a.status === "closed") return { status: a.why.indexOf("source says") > -1 ? "closed-provider" : "closed", label: a.why.indexOf("source says") > -1 ? LIFE["closed-provider"] : LIFE.closed, why: a.why };
    if (a.status === "open" && it.until_filled && !it.deadline) return { status: "until-filled", label: LIFE["until-filled"], why: "The source says applications are reviewed until the post is filled." };
    if (a.status === "rolling") return { status: "rolling", label: LIFE.rolling, why: a.why };
    return { status: a.status, label: LIFE[a.status] || a.label, why: a.why };
  }
  const verification = (it, now) => C.verificationStatus(it, now, it.kind);
  const isOpen = (it, now) => ["open", "rolling", "closing", "until-filled"].includes(lifecycle(it, now).status);
  const isArchived = (it, now) => ["closed", "closed-provider", "withdrawn"].includes(lifecycle(it, now).status);
  function daysLeft(it, now) { if (!it.deadline || !C.isDate(it.deadline.date)) return null; const c = C.cutoff(it.deadline); const end = c.exact ? c.at : c.dayEnd; return Math.floor((end - toMs(now)) / DAY); }
  const closingSoon = (it, now) => isOpen(it, now) && daysLeft(it, now) !== null && daysLeft(it, now) <= CLOSING_DAYS;
  const recentlyAdded = (it, now) => !!it.first_seen && (toMs(now) - Date.parse(it.first_seen + "T00:00:00Z")) / DAY <= RECENT_DAYS;

  // a missing deadline is described, never turned into "rolling"
  function deadlineLabel(it, now) {
    if (it.deadline) return C.deadlineText(it.deadline, now);
    if (it.rolling) return "Rolling, as the source states";
    if (it.until_filled) return "Until filled, as the source states";
    return "No deadline published (not the same as rolling)";
  }
  // the button: "Apply" only where the source gives a direct application address for this listing
  function action(it) {
    if (it.application_url && it.application_url !== it.official_url) return { label: "Apply on the official site", url: it.application_url };
    return { label: "View official listing", url: it.official_url };
  }

  // views and filters. state: { view, q, who, cat, country, city, mode, rel ("all" includes network), theme, level, status, org, paid, ver }
  const KEYS = ["view", "q", "who", "cat", "country", "city", "mode", "rel", "theme", "level", "status", "org", "paid", "ver"];
  function inView(it, view, now) {
    switch (view || "open") {
      case "open": return !isArchived(it, now);
      case "closing": return closingSoon(it, now);
      case "recent": return recentlyAdded(it, now) && !isArchived(it, now);
      case "jobs": return (it.cat === "employment" || it.cat === "consultancy") && !isArchived(it, now);
      case "funding": return it.who === "organisation" && !isArchived(it, now);
      case "research": return ["fellowship", "internship", "studentship", "research-post", "research-call"].includes(it.cat) && !isArchived(it, now);
      case "archive": return isArchived(it, now);
      case "all": return true;
      default: return !isArchived(it, now);
    }
  }
  function matches(it, s, now) {
    if (!inView(it, s.view, now)) return false;
    if (s.rel !== "all" && it.rel === "network") return false;
    if (s.rel && s.rel !== "all" && it.rel !== s.rel) return false;
    if (s.who && it.who !== s.who) return false;
    if (s.cat && it.cat !== s.cat) return false;
    if (s.country && !it.countries.includes(s.country)) return false;
    if (s.city && !it.cities.includes(s.city)) return false;
    if (s.mode && it.mode !== s.mode) return false;
    if (s.theme && !it.themes.includes(s.theme)) return false;
    if (s.level && it.level !== s.level) return false;
    if (s.status && lifecycle(it, now).status !== s.status) return false;
    if (s.org && it.org !== s.org && it.network_id !== s.org) return false;
    if (s.paid === "1" && !it.comp_disclosed) return false;
    if (s.ver && verification(it, now).status !== s.ver) return false;
    if (s.q) { const hay = [it.title, it.aliases.join(" "), it.org_name, it.location, it.summary, it.rel_why, it.cat_label, it.themes.join(" "), it.cities.join(" ")].join(" ").toLowerCase();
      if (!String(s.q).toLowerCase().split(/\s+/).filter(Boolean).every(w => hay.includes(w))) return false; }
    return true;
  }
  // order: open first by nearest deadline (no deadline after dated ones), then the rest; archive newest first
  function compare(a, b, now) {
    const ao = isArchived(a, now), bo = isArchived(b, now); if (ao !== bo) return ao ? 1 : -1;
    const da = a.deadline ? a.deadline.date : ao ? "0000" : "9999", db = b.deadline ? b.deadline.date : bo ? "0000" : "9999";
    return (ao ? db.localeCompare(da) : da.localeCompare(db)) || String(a.title).localeCompare(String(b.title));
  }
  function readState(search) { const s = C.readState(search, KEYS); return s; }
  const writeState = s => C.writeState(s, KEYS);

  // share text: title, organisation, location, deadline and a link; nothing else, nothing invented
  function shareText(it, now, url) {
    return [`${it.title}, ${it.org_name}`, `Location: ${it.location}`, `Deadline: ${deadlineLabel(it, now)}`, `Details: ${url}`].join("\n");
  }
  // structured data only for an individual job or consultancy that is open, verified, and has every field Google requires:
  // title, description, datePosted, hiringOrganization, a location (or remote with applicant location requirements). Never for
  // grants, RFPs, prizes or a list page. A closed listing loses its markup.
  function jobPosting(it, now, site) {
    const j = it.jobposting; if (!j || it.who !== "individual" || !["employment", "consultancy", "research-post"].includes(it.cat)) return null;
    if (!isOpen(it, now) || verification(it, now).status !== "verified" || !it.published || !j.description || !j.locality || !j.country) return null;
    const o = { "@context": "https://schema.org/", "@type": "JobPosting", title: it.title, description: j.description, datePosted: it.published,
      hiringOrganization: { "@type": "Organization", name: it.org_name, sameAs: j.org_url || undefined },
      jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: j.locality, addressRegion: j.region || undefined, addressCountry: j.country } },
      employmentType: j.employment_type || undefined, directApply: false, url: `${site}/opportunities/${it.id}/` };
    if (it.deadline && C.isDate(it.deadline.date)) o.validThrough = it.deadline.date + "T23:59:59";
    if (it.requisition) o.identifier = { "@type": "PropertyValue", name: it.org_name, value: it.requisition };
    return o;
  }
  // deduplication: the same posting seen twice (a repost, a second link) is one item; a record that names repost_of is folded in
  function dedupe(items) { const ids = new Set(items.map(i => i.id)); return items.filter(i => !(i.repost_of && ids.has(i.repost_of))); }

  return { CATS, CAT, ROLE_CAT, TYPE_CAT, WHO, REL, REL_NOTE, MODE, VIEWS, LIFE, KEYS, CLOSING_DAYS, RECENT_DAYS, relevance, catOf, item, lifecycle, verification, isOpen, isArchived, daysLeft, closingSoon, recentlyAdded,
    deadlineLabel, action, inView, matches, compare, readState, writeState, shareText, jobPosting, dedupe };
}));
