/* Common Shade: funding, opportunities and careers, the shared rules. One file, read by the builder
   (tools/build-funding.js), the page script (heat-economy/money/funding.js), the weekly harvest (tools/funding-harvest.js)
   and the check (tools/check-funding.js), so the pages, the filters, the exports and the tests never disagree.

   Two statuses are kept apart (data/funding/README.md, "Status and freshness rules"):
   A. Application status, from dates and the source's own words: upcoming, open, rolling, closed, withdrawn, unknown.
   B. Verification status, from the source check: verified, review due, source unavailable, conflicting information.
   Rules that guard against misleading a reader:
   - a future deadline does not prove a call has opened (an opening date passed, or the source saying it is open, does);
   - no deadline does not mean rolling (only a source saying so does);
   - an annual programme never reopens by itself: each round is its own record with its own id;
   - a deadline extension keeps the earlier deadline in deadline_history;
   - each application stage has its own deadline; the first stage decides whether a new applicant can still apply;
   - a date without a time or time zone keeps that uncertainty: no countdown, and on the deadline day the status reads
     "deadline day" (closing), never a plain "open"; it closes once that day has ended everywhere;
   - a page that opened is not proof that a call is open; a vanished page is not proof that a post was filled;
   - stale or uncertain records never count as "verified open". No scores, no rankings, no fit percentages. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.FundCore = factory();
}(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  const DAY = 864e5;
  // how long a check stays fresh, by kind of record (days)
  const FRESH = { opportunity: 14, career: 14, programme: 120, organisation: 180 };
  const APP = { upcoming: "Upcoming", open: "Open", closing: "Deadline day", rolling: "Rolling", closed: "Closed", withdrawn: "Withdrawn", unknown: "Status unknown" };
  const VER = { verified: "Verified", "review-due": "Review due", unavailable: "Source unavailable", conflicting: "Conflicting information", unconfirmed: "Not confirmed by the source check" };
  // offsets in minutes for the time zones sources use; anything else is treated as unknown
  const TZ = { UTC: 0, GMT: 0, "GMT+1": 60, CET: 60, CEST: 120, ET: -300, EST: -300, EDT: -240, PT: -480, PST: -480, PDT: -420, JST: 540, IST: 330, SGT: 480, ICT: 420, WIB: 420, PHT: 480, BST: 60, AEST: 600 };
  const pad = n => String(n).padStart(2, "0");
  const isDate = s => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ""));
  const toMs = now => typeof now === "number" ? now : isDate(now) ? Date.parse(now + "T12:00:00Z") : Date.parse(now);

  // summer time for the zones written without it ("ET", "PT", "CET"): US from the second Sunday of March to the first Sunday
  // of November, Europe from the last Sunday of March to the last Sunday of October (both at the date level)
  function dst(tz, date) {
    const y = +date.slice(0, 4), sun = (m, n) => { const f = new Date(Date.UTC(y, m, 1)), first = 1 + (7 - f.getUTCDay()) % 7; return Date.UTC(y, m, first + 7 * (n - 1)); };
    const last = m => { const e = new Date(Date.UTC(y, m + 1, 0)); return Date.UTC(y, m, e.getUTCDate() - e.getUTCDay()); }, t = Date.parse(date + "T12:00:00Z");
    if (tz === "ET" || tz === "PT") return t >= sun(2, 2) && t < sun(10, 1) ? 60 : 0;
    if (tz === "CET") return t >= last(2) && t < last(9) ? 60 : 0;
    return 0;
  }
  // the exact moment a deadline passes, or the window of its day when the time or zone is not published
  function cutoff(d) {
    if (!d || !isDate(d.date)) return null;
    const off = d.tz && Object.prototype.hasOwnProperty.call(TZ, d.tz) ? TZ[d.tz] + dst(d.tz, d.date) : null;
    if (d.time && /^\d{2}:\d{2}$/.test(d.time) && off !== null) {
      const at = Date.parse(`${d.date}T${d.time}:00Z`) - off * 60000;
      return { exact: true, at };
    }
    // the deadline day starts first at UTC+14 and ends last at UTC-12
    const mid = Date.parse(`${d.date}T00:00:00Z`);
    return { exact: false, dayStart: mid - 14 * 3600e3, dayEnd: mid + DAY + 12 * 3600e3 };
  }
  const entryDeadline = r => (r.deadlines || []).filter(d => isDate(d.date))[0] || null;

  // A. application status at a moment (an ISO date, a timestamp, or a date-time string)
  function applicationStatus(r, now) {
    const t = toMs(now), said = r.stated_status || "", why = [];
    if (r.withdrawn || said === "withdrawn") return { status: "withdrawn", label: APP.withdrawn, why: "The source says it was withdrawn." };
    const dl = entryDeadline(r), c = cutoff(dl);
    if (c && c.exact && t >= c.at) return { status: "closed", label: APP.closed, why: "The published deadline has passed." };
    if (c && !c.exact && t >= c.dayEnd) return { status: "closed", label: APP.closed, why: "The deadline day has ended everywhere." };
    if (said === "closed") return { status: "closed", label: APP.closed, why: "The source says applications are closed." };
    const opens = r.opens && isDate(r.opens.date) ? Date.parse(r.opens.date + "T00:00:00Z") - 14 * 3600e3 : null;
    if (opens !== null && t < opens) return { status: "upcoming", label: APP.upcoming, why: `Opens ${r.opens.date}, as the source states.` };
    const opened = said === "open" || said === "rolling" || (opens !== null && t >= opens);
    if (!opened) { why.push(dl ? "A deadline is published, but the source does not say applications have opened." : "The source does not say applications are open.");
      return { status: said === "upcoming" ? "upcoming" : "unknown", label: said === "upcoming" ? APP.upcoming : APP.unknown, why: why.join(" ") }; }
    if (c && !c.exact && t >= c.dayStart) return { status: "closing", label: APP.closing, why: "Today is the deadline day somewhere; the cut-off time is not published, so check the source." };
    if (r.rolling === true || said === "rolling") return { status: "rolling", label: APP.rolling, why: "The source says applications are accepted on a rolling basis." };
    return { status: "open", label: APP.open, why: dl ? "Opened, and the deadline has not passed." : "The source says it is open; no deadline is published." };
  }

  // B. verification status at a moment. check: { checked: ISO date, ok: true|false, confirmed: true|false }
  function verificationStatus(r, now, kind) {
    const t = toMs(now), k = kind || r.kind || "opportunity", ch = r.check || {};
    if (r.conflict) return { status: "conflicting", label: VER.conflicting, why: r.conflict };
    if (ch.ok === false) return { status: "unavailable", label: VER.unavailable, why: "The official page did not open at the last check; the last-known details are kept." };
    if (ch.confirmed === false) return { status: "unconfirmed", label: VER.unconfirmed, why: "Some key facts were not found on the official page." };
    if (!isDate(ch.checked)) return { status: "review-due", label: VER["review-due"], why: "No check date." };
    const age = Math.floor((t - Date.parse(ch.checked + "T00:00:00Z")) / DAY), limit = FRESH[k] || 30;
    if (age > limit) return { status: "review-due", label: VER["review-due"], why: `Last checked ${age} days ago; records like this are re-checked every ${limit} days.` };
    return { status: "verified", label: VER.verified, why: `Checked against the official page on ${ch.checked}.` };
  }
  const isVerifiedOpen = (r, now, kind) => ["open", "rolling", "closing"].includes(applicationStatus(r, now).status) && verificationStatus(r, now, kind).status === "verified";

  // a deadline as a reader sees it: original wording, and a countdown only when the cut-off is exact
  function deadlineText(d, now) {
    if (!d || !isDate(d.date)) return "No deadline published";
    const c = cutoff(d), when = new Date(d.date + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
    let s = `${when}${d.time ? `, ${d.time}` : ""}${d.tz ? ` ${d.tz}` : d.time ? " (time zone not stated)" : ""}`;
    if (c.exact && now != null) { const left = c.at - toMs(now); if (left > 0 && left < 30 * DAY) { const days = Math.floor(left / DAY), hrs = Math.floor((left % DAY) / 3600e3); s += ` · ${days ? `${days} day${days === 1 ? "" : "s"}` : `${hrs} hour${hrs === 1 ? "" : "s"}`} left`; } }
    else if (!d.time) s += " (cut-off time not published)";
    return s;
  }
  // funding amounts: per award and programme budget are kept apart; unpublished is unknown, never zero
  function amountText(a) {
    if (!a || (a.min == null && a.max == null)) return a && a.basis === "not-published" ? "Not published" : "Not published";
    const cur = a.currency || "", f = n => `${cur} ${Number(n).toLocaleString("en-GB")}`.trim();
    const range = a.min != null && a.max != null && a.min !== a.max ? `${f(a.min)} to ${f(a.max)}` : a.max != null ? `Up to ${f(a.max)}` : `From ${f(a.min)}`;
    return `${range}${a.basis === "programme-total" ? " (total budget, not per award)" : a.basis === "per-year" ? " per year" : a.basis === "per-award" ? " per award" : ""}`;
  }

  // explainable matching: plain statements, never a score. P = profile { applicant, country, work, kind }
  function matches(r, P) {
    const out = [], E = r.eligibility || {}, G = r.geography || {};
    if (P.work) { const g = G.countries || [];
      out.push(g.includes(P.work) || g.includes("ASIA") || g.includes("GLOBAL") ? ["yes", "Matches selected work country"] : g.length ? ["no", "Work country not in the published list"] : ["unknown", "Implementation countries not established"]); }
    if (P.country) { const l = E.lead_countries || [];
      out.push(l.includes(P.country) || l.includes("ANY") ? ["yes", "Lead applicant may be based in the selected country"] : l.length ? ["no", `Only for lead applicants based in ${l.join(", ")}`] : ["unknown", "Lead applicant location not established"]); }
    if (P.applicant) { const a = E.applicants || [];
      out.push(a.includes(P.applicant) ? ["yes", "Applicant type is listed as eligible"] : a.length ? ["no", "Applicant type is not listed as eligible"] : ["unknown", "Applicant eligibility not established"]); }
    (E.requires || []).forEach(req => out.push(["note", REQUIRES[req] || req]));
    return out;
  }
  const REQUIRES = { "university-lead": "Requires a university or research institution lead", consortium: "Requires a consortium", "local-partner": "Requires a local partner in the implementation country", "accredited-entity": "Only accredited entities can submit", "government-endorsement": "Needs government nomination or endorsement", membership: "Open to members only", "germany-based-lead": "Only for lead applicants based in Germany", "national-society": "National Red Cross or Red Crescent Societies only", "un-agency": "UN agencies only", "harvard-mentor": "Needs a Harvard faculty mentor; based in Boston", "registered-org": "Applicant must be a registered organisation", invitation: "By invitation only" };

  // access routes and the one next step each allows (never "Apply now" on a funder profile)
  const ACCESS = [
    ["open-call", "Direct open applications"], ["periodic-call", "Periodic competitive calls"], ["rolling", "Rolling submissions"], ["invitation", "Invitation only"],
    ["accredited", "Through accredited entities"], ["consortium", "Consortium or institutional lead"], ["government", "Government nomination or endorsement"],
    ["intermediary", "Through an intermediary or regranting partner"], ["procurement", "Procurement or vendor registration"], ["none-found", "No public application route found"]];
  const ACCESS_LABEL = Object.fromEntries(ACCESS);
  const NEXT = { open: "View open call", eligibility: "Check institutional eligibility", intermediary: "Explore intermediary route", monitor: "Monitor future calls", procurement: "View procurement notice", listing: "View listing" };
  function nextStep(rec, now) {
    if (rec.kind === "career") return NEXT.listing;
    if (rec.kind === "opportunity") { const s = applicationStatus(rec, now).status;
      if (rec.type === "rfp" || rec.type === "tender" || rec.type === "eoi" || rec.type === "consultancy-firm" || rec.type === "rfq") return NEXT.procurement;
      return ["open", "rolling", "closing", "upcoming"].includes(s) ? NEXT.open : NEXT.monitor; }
    const a = rec.access || [];
    if (a.includes("accredited") || a.includes("government") || a.includes("consortium")) return NEXT.eligibility;
    if (a.includes("intermediary")) return NEXT.intermediary;
    if (a.includes("procurement")) return NEXT.procurement;
    return NEXT.monitor;
  }

  const RELEVANCE = { explicit: "Explicit heat focus", related: "Related remit with a clear heat application", potential: "Potential connection requiring confirmation" };
  const TYPE = { "grant-call": "Grant call", prize: "Prize or challenge", accelerator: "Accelerator or support programme", "ta-call": "Technical assistance call", "readiness-window": "Readiness support window", rfp: "Request for proposals (firms)", rfq: "Request for quotation", tender: "Tender", eoi: "Expression of interest", "consultancy-individual": "Individual consultancy", "consultancy-firm": "Consultancy (firms)", fellowship: "Fellowship" };
  const INSTRUMENT = { grant: "Grant", contract: "Contract (procurement, not a grant)", equity: "Equity (not a grant)", debt: "Loan or debt (not a grant)", "technical-assistance": "Technical assistance (in kind)", prize: "Prize", mixed: "Grant, debt or equity", "equity-free": "Equity-free funding" };
  const ROLE = { job: "Job", "consultancy-individual": "Individual consultancy", "research-position": "Research position", "funded-phd": "Funded PhD", fellowship: "Fellowship", internship: "Internship", "training-paid": "Training (fee-charging)" };
  const PAY = { paid: "Paid", unpaid: "Unpaid", "fee-charging": "Fee-charging", "not-stated": "Pay not stated" };
  const COUNTRIES = [["BD", "Bangladesh"], ["BT", "Bhutan"], ["KH", "Cambodia"], ["IN", "India"], ["ID", "Indonesia"], ["LA", "Lao PDR"], ["MY", "Malaysia"], ["MV", "Maldives"], ["MM", "Myanmar"], ["NP", "Nepal"], ["PK", "Pakistan"], ["PH", "Philippines"], ["SG", "Singapore"], ["LK", "Sri Lanka"], ["TH", "Thailand"], ["TL", "Timor-Leste"], ["VN", "Viet Nam"]];
  const APPLICANTS = [["community", "Community organisation"], ["worker-org", "Worker organisation or union"], ["ngo", "NGO"], ["research", "University or research institute"], ["municipality", "City or local government"], ["national-gov", "National government agency"], ["company", "Company or social enterprise"], ["consultancy", "Consultancy firm"], ["individual", "Individual"], ["un-agency", "UN agency"], ["accredited", "Accredited entity"]];
  const ACTIVITIES = [["research", "Research and evidence"], ["organising", "Community organising and participation"], ["pilots", "Pilots and demonstrations"], ["infrastructure", "Infrastructure and equipment"], ["recurring", "Recurring delivery and maintenance"], ["policy", "Policy and institutional capacity"], ["scaling", "Scaling and replication"]];
  const TOPICS = [["work", "Occupational heat and informal workers"], ["value-chain", "Factory and agricultural value chains"], ["homes", "Homes and night-time recovery"], ["schools-care", "Schools and care"], ["health", "Health systems"], ["warning", "Early warning and anticipatory action"], ["municipal", "Municipal governance"], ["nature", "Water, nature and public space"], ["cooling", "Cooling and energy"], ["inclusion", "Gender, disability and social protection"]];
  const CONTRIBUTION = [["risk", "Understand risk and health"], ["design", "Design safer places and workplaces"], ["organise", "Organise and support communities and workers"], ["finance", "Finance and manage programmes"], ["evidence", "Build evidence, policy and accountability"]];

  // CSV: every cell quoted; a cell that a spreadsheet could read as a formula is prefixed so it stays text
  function csvCell(v) {
    let s = v == null ? "" : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
  }
  const csv = (head, rows) => "﻿" + [head, ...rows].map(r => r.map(csvCell).join(",")).join("\r\n") + "\r\n";

  // the CSV columns, one list for the build's downloads and the page's filtered export
  const CSV_HEAD = {
    opportunities: ["Title", "Issuing organisation", "Programme", "Round or reference", "Type", "Kind of money", "Purpose", "Heat relevance", "Why (Common Shade's reading)", "Who can apply", "Lead applicant location", "Where the work can happen", "Partnership", "Amount", "Duration", "Opens", "Deadline (as published)", "Deadline wording", "Application status", "Verification", "Source checked", "Official page", "Application page"],
    careers: ["Role", "Organisation", "Reference", "Role type", "Discipline", "Seniority", "Location", "Remote work", "Contract", "Pay", "Salary (as published)", "Deadline (as published)", "Heat relevance", "Why (Common Shade's reading)", "Application status", "Verification", "Source checked", "Listing"]
  };
  function csvRow(r, kind, now) {
    const a = applicationStatus(r, now), v = verificationStatus(r, now, kind === "careers" ? "career" : "opportunity"), d = entryDeadline(r) || {};
    if (kind === "careers") return [r.title, r.employer_name, r.reference, ROLE[r.role] || r.role, r.discipline, r.seniority, r.location_text, r.remote_text, r.contract_text, PAY[r.pay] || r.pay, r.salary_text, deadlineText(d.date ? d : null), r.relevance, r.relevance_why, a.label, v.label, (r.check || {}).checked, r.official_url];
    return [r.title, r.org_name, r.programme_name, [r.round, r.reference].filter(Boolean).join(" · "), TYPE[r.type] || r.type, INSTRUMENT[r.instrument] || r.instrument, r.purpose_text, RELEVANCE[r.relevance] || r.relevance, r.relevance_why, r.eligibility_text, r.lead_text, r.geography_text, r.partnership_text, r.amount_text, r.duration_text, (r.opens || {}).date || "", deadlineText(d.date ? d : null), d.wording || "", a.label, v.label, (r.check || {}).checked, r.official_url, r.application_url];
  }
  // sorting: open first by nearest deadline, then upcoming, rolling, unknown, closed (most recent first)
  const ORDER = { closing: 0, open: 1, upcoming: 2, rolling: 3, unknown: 4, closed: 5, withdrawn: 6 };
  function compare(a, b, now) {
    const sa = applicationStatus(a, now).status, sb = applicationStatus(b, now).status;
    if (ORDER[sa] !== ORDER[sb]) return ORDER[sa] - ORDER[sb];
    const da = (entryDeadline(a) || {}).date || (sa === "closed" ? "0000" : "9999"), db = (entryDeadline(b) || {}).date || (sb === "closed" ? "0000" : "9999");
    return sa === "closed" ? db.localeCompare(da) : da.localeCompare(db) || String(a.title).localeCompare(String(b.title));
  }
  // filter state lives in the address so a filtered view can be shared
  function readState(search, keys) { const q = new URLSearchParams(search || ""), s = {}; keys.forEach(k => { const v = q.get(k); if (v) s[k] = v; }); return s; }
  function writeState(s, keys) { const q = new URLSearchParams(); keys.forEach(k => { if (s[k]) q.set(k, s[k]); }); const t = q.toString(); return t ? "?" + t : ""; }

  return { FRESH, APP, VER, TZ, cutoff, entryDeadline, applicationStatus, verificationStatus, isVerifiedOpen, deadlineText, amountText, matches, REQUIRES, ACCESS, ACCESS_LABEL, NEXT, nextStep,
    RELEVANCE, TYPE, INSTRUMENT, ROLE, PAY, COUNTRIES, APPLICANTS, ACTIVITIES, TOPICS, CONTRIBUTION, csvCell, csv, CSV_HEAD, csvRow, compare, readState, writeState, isDate, pad };
}));
