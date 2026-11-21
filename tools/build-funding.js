// Common Shade: funding, opportunities and careers. Called by tools/build-economy.js with its page template:
//   - landscape(): the "Funding landscape" and "What needs funding?" sections at the top of /heat-economy/money/
//   - pages(): /heat-economy/money/opportunities/ ("Open calls and tenders") and /heat-economy/money/careers/
//   - the CSV downloads in /heat-economy/data/, and llms() for llms-full.txt
//   - forTopic(): short "Funding and opportunities" lines for other pages (at most three records each)
// Records come from data/funding/ through tools/funding-model.js; only records whose core facts passed the source check
// are shown. Every page is complete without JavaScript: the table and the cards carry every record, with the status as
// of the build; heat-economy/money/funding.js recalculates it for the moment a reader looks.
"use strict";
const fs = require("fs"), path = require("path");
const M = require("./funding-model.js"), T = require("./funding-text.js");
const ROOT = M.ROOT, SITE = "https://beattheheat.asia";
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const ext = (u, l) => u ? `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(l || u)}<span class="visually-hidden"> (opens in a new tab)</span></a>` : "";
const today = () => new Date().toISOString().slice(0, 10);
const cname = code => (M.load().C.COUNTRIES.find(([c]) => c === code) || [, code === "ASIA" ? "Asia" : code === "GLOBAL" ? "Global" : code === "ANY" ? "Any country" : code])[1];
const factText = f => f ? (f.confirmed === false ? `${f.text || ""} (not confirmed by the source check)` : f.text || "") : "";
const CATEGORY = { philanthropy: "Foundations and philanthropy", research: "Climate and health research funders", bilateral: "Bilateral programmes", multilateral: "Multilateral funds and development banks", adaptation: "Adaptation and resilience funds", lla: "Locally led and community grants", humanitarian: "Humanitarian and anticipatory finance", urban: "Urban resilience and municipal support", civil: "Civil society, rights and inclusion", cooling: "Sustainable cooling and energy", nature: "Nature, water and greening", innovation: "Innovation challenges and accelerators" };

// fields the pages and the export read, worked out once
function prep(r, kind) {
  const m = M.load(), C = m.C, org = m.byId[r.org] || {}, prog = m.byId[r.programme] || {};
  const amount = r.amount ? C.amountText(r.amount) + (r.amount.confirmed === false ? " (not confirmed)" : "") : "Not published";
  const E = r.eligibility || {}, G = r.geography || {};
  const base = { id: r.id, title: r.title, kind, type: r.type, instrument: r.instrument, topics: r.topics || [], activities: r.activities || [], access: r.access || [],
    relevance: (r.relevance || {}).label || "", relevance_why: (r.relevance || {}).why || "", stated_status: r.stated_status, rolling: !!r.rolling, withdrawn: !!r.withdrawn,
    opens: r.opens ? { date: r.opens.date } : null, deadlines: (r.deadlines || []).map(d => ({ stage: d.stage, date: d.date, time: d.time, tz: d.tz, wording: d.wording, confirmed: d.confirmed })),
    deadline_history: r.deadline_history || [], conflict: r.conflict || "", check: { checked: r.check.checked, ok: r.check.ok, confirmed: r.check.confirmed },
    official_url: r.official_url || "", application_url: r.application_url || "", asia: !!r.asia };
  if (kind === "careers") return Object.assign(base, { employer_name: org.name || r.employer || "", reference: r.reference || "", role: r.role, discipline: r.discipline || "", seniority: r.seniority || "", contribution: r.contribution || "",
    location_text: factText(r.location), countries: r.countries || [], remote: !!r.remote, remote_countries: r.remote_countries || [], remote_text: r.remote_text || "Not stated", contract_text: factText(r.contract) || "Not stated",
    pay: r.pay || "not-stated", salary_published: !!(r.salary && r.salary.text), salary_text: factText(r.salary) || "Not published", relevance: r.relevance_strength || "direct",
    search: [r.title, org.name, r.discipline, factText(r.location), r.relevance_why].join(" ") });
  return Object.assign(base, { org_name: org.name || "", programme_name: prog.name || "", round: r.round || "", reference: r.reference || "", purpose_text: factText(r.purpose),
    eligibility: { applicants: E.applicants || [], lead_countries: E.lead_countries || [], requires: E.requires || [] }, geography: { countries: G.countries || [] },
    eligibility_text: factText(E) || "Not published", lead_text: E.lead_text || "", geography_text: factText(G) || "Not published", partnership_text: factText(r.partnership),
    amount: r.amount ? { min: r.amount.min, max: r.amount.max, currency: r.amount.currency, basis: r.amount.basis } : null, amount_text: amount, duration_text: factText(r.duration),
    access_text: (r.access || []).map(a => C.ACCESS_LABEL[a] || a).join("; ") || "Not stated", instrument_text: C.INSTRUMENT[r.instrument] || r.instrument || "",
    search: [r.title, org.name, prog.name, factText(r.purpose), factText(E), factText(G), r.relevance && r.relevance.why].join(" ") });
}

// ---- shared pieces ----
const chip = (cls, text, attr = "") => `<span class="fo-chip fo-chip--${cls}"${attr}>${esc(text)}</span>`;
const statusChips = (r, kind) => { const C = M.load().C, a = C.applicationStatus(r, today()), v = C.verificationStatus(r, today(), kind === "careers" ? "career" : "opportunity");
  return `${chip("app", a.label, ` data-app="${a.status}" title="${esc(a.why)}"`)}${chip("ver", v.label, ` data-ver="${v.status}" title="${esc(v.why)}"`)}`; };
const sourcesBlock = r => `<p class="fo-src"><b>${esc(T.CHECKED)}:</b> ${r.check.checked ? esc(M.load().C.deadlineText ? new Date(r.check.checked + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : r.check.checked) : "not yet"} · ${r.sources.filter(s => s.url).map(s => ext(s.url, s.label)).join(" · ")}</p>`;

// ---- the landscape, at the top of /heat-economy/money/ ----
function landscape() {
  const m = M.load(), C = m.C, P = m.PROG.slice().sort((a, b) => (CATEGORY[a.category] || "").localeCompare(CATEGORY[b.category] || "") || a.name.localeCompare(b.name));
  const oppsOf = id => m.OPP.filter(o => o.programme === id);
  const card = p => {
    const org = m.byId[p.org] || {}, opps = oppsOf(p.id), next = C.nextStep(p, today()), rel = (p.relevance || {});
    const past = (p.past_support || []).map(x => `<li>${esc(x.text)}${x.link ? ` <a href="${esc(x.link)}">${esc(x.link_label || "Record")}</a>` : ""}</li>`).join("");
    return `<details class="sol he-card fo-prog" id="fund-${esc(p.id)}" data-q="${esc([p.name, org.name, factText(p.remit), rel.why].join(" ").toLowerCase())}" data-access="${esc((p.access || []).join(" "))}" data-rel="${esc(rel.label || "")}" data-cat="${esc(p.category || "")}" data-inst="${esc((p.instruments || []).join(" "))}">
      <summary><span class="sol-h">${esc(p.name)}</span><span class="sol-tags">${chip("rel", C.RELEVANCE[rel.label] || "")}${(p.access || []).slice(0, 2).map(a => chip("access", C.ACCESS_LABEL[a] || a)).join("")}${p.operational && p.operational !== "operational" ? chip("op", p.operational === "announced" ? "Announced, not yet operational" : "Closed") : ""}</span><span class="sol-sum">${esc(org.name || "")}${p.donors && p.donors.length ? `, with ${esc(p.donors.map(d => (m.byId[d] || {}).name || d).join(", "))}` : ""}</span></summary>
      <div class="sol-body">
        <div class="sol-f"><h4>What it funds</h4><p>${esc(factText(p.remit))}</p></div>
        <div class="sol-f"><h4>How it connects to heat</h4><p><span class="fo-reading">Common Shade's reading.</span> ${esc(rel.why || "")}</p></div>
        <div class="sol-f"><h4>How to reach it</h4><p>${esc((p.access || []).map(a => C.ACCESS_LABEL[a] || a).join("; "))}. ${esc(factText(p.access_note))}</p></div>
        <div class="sol-f"><h4>Who can receive money</h4><p>${esc(factText(p.recipients) || "Not published")}</p></div>
        <div class="sol-f"><h4>Kind of money</h4><p>${esc((p.instruments || []).map(i => C.INSTRUMENT[i] || i).join(", ") || "Not stated")}</p></div>
        ${p.geography ? `<div class="sol-f"><h4>Where</h4><p>${esc(factText(p.geography))}</p></div>` : ""}
        ${(p.activities || []).length ? `<div class="sol-f"><h4>What it could support</h4><p>${esc(p.activities.map(a => (C.ACTIVITIES.find(([k]) => k === a) || [, a])[1]).join(", "))}</p></div>` : ""}
        <div class="sol-f"><h4>Calls and rounds</h4>${opps.length ? `<ul class="sol-ul">${opps.map(o => `<li><a href="/heat-economy/money/opportunities/#${esc(o.id)}">${esc(o.title)}</a> · ${esc(C.applicationStatus(o, today()).label)}</li>`).join("")}</ul>` : `<p>No current call recorded here. ${p.access && p.access.includes("periodic-call") ? "Calls have been periodic; the next one is not announced." : ""}</p>`}</div>
        ${past ? `<div class="sol-f"><h4>Past support (not money available now)</h4><ul class="sol-ul">${past}</ul></div>` : ""}
        ${p.limits_note ? `<div class="sol-f"><h4>Limits of what we know</h4><p>${esc(factText(p.limits_note))}</p></div>` : ""}
        <p class="sol-go"><a class="fo-next" href="${esc(p.url)}" target="_blank" rel="noopener">${esc(next)}<span class="visually-hidden">: ${esc(p.name)} (opens in a new tab)</span></a></p>
        ${sourcesBlock(p)}
      </div></details>`;
  };
  const opts = (list, any) => `<option value="">${esc(any)}</option>` + list.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join("");
  const usedAccess = C.ACCESS.filter(([k]) => P.some(p => (p.access || []).includes(k))), usedCat = Object.entries(CATEGORY).filter(([k]) => P.some(p => p.category === k));
  const vopen = m.OPP.filter(o => C.isVerifiedOpen(o, today(), "opportunity")).length, cars = m.CAR.filter(c => C.isVerifiedOpen(c, today(), "career")).length;
  const html = `
        <section class="cty-s fo-land" id="landscape" aria-labelledby="landscape-h"><h2 id="landscape-h">${esc(T.LAND.h)} <span class="he-n">${P.length}</span></h2>
          <p class="he-intro">${esc(T.LAND.lede)}</p>
          <div class="fo-paths">
            <a class="fo-path" href="/heat-economy/money/opportunities/"><b>Open calls and tenders</b><span>${vopen} verified open now, with the archive of earlier rounds</span></a>
            <a class="fo-path" href="/heat-economy/money/careers/"><b>Careers</b><span>${m.CAR.length} listings, ${cars} verified open</span></a>
            <a class="fo-path" href="#needs"><b>What needs funding?</b><span>Where this dataset has verified support, and where it has little</span></a>
          </div>
          <p class="he-note">${esc(T.LAND.how)}</p>
          <div class="sol-bar" role="search"><label class="sol-search"><span class="visually-hidden">Search the funding landscape</span><input type="search" data-lf="q" placeholder="For example: cooling, community, research, Bangladesh"></label>
            <label><span class="visually-hidden">Access route</span><select data-lf="access">${opts(usedAccess, "Any access route")}</select></label>
            <label><span class="visually-hidden">Heat relevance</span><select data-lf="rel">${opts(Object.entries(C.RELEVANCE), "Any heat relevance")}</select></label>
            <label><span class="visually-hidden">Kind of funder</span><select data-lf="cat">${opts(usedCat, "Any kind of programme")}</select></label>
            <p class="sol-count" id="fo-land-count" role="status" aria-live="polite"></p></div>
          <div class="he-group" data-landlist>${P.map(card).join("\n")}</div>
          <p class="sol-none" id="fo-land-none" hidden>No programme matches. Try fewer filters.</p>
          <p class="he-note"><b>The three relevance labels.</b> ${Object.values(C.RELEVANCE).map(esc).join("; ")}. The third is never presented as confirmed eligibility.</p>
        </section>
        ${needs()}`;
  return html;
}
function needs() {
  const m = M.load(), C = m.C, recs = [...m.PROG, ...m.OPP];
  const row = ([k, l]) => { const n = recs.filter(r => (r.activities || []).includes(k)), low = n.length < 3;
    return `<li class="fo-need${low ? " fo-need--gap" : ""}"><b>${esc(l)}</b><span class="fo-need__n">${n.length} record${n.length === 1 ? "" : "s"}${low ? ` · ${esc(T.NEEDS.gapNote)}` : ""}</span>${n.length ? `<span class="fo-need__l">${n.slice(0, 6).map(r => `<a href="${r.kind === "programme" ? `#fund-${esc(r.id)}` : `/heat-economy/money/opportunities/#${esc(r.id)}`}">${esc(r.name || r.title)}</a>`).join(" · ")}${n.length > 6 ? ` and ${n.length - 6} more` : ""}</span>` : ""}</li>`; };
  const topic = ([k, l]) => { const n = recs.filter(r => (r.topics || []).includes(k)).length; return `<li><b>${esc(l)}</b> <span class="fo-need__n">${n}${n < 3 ? ` · ${esc(T.NEEDS.gapNote)}` : ""}</span></li>`; };
  return `<section class="cty-s fo-needs" id="needs" aria-labelledby="needs-h"><h2 id="needs-h">${esc(T.NEEDS.h)}</h2><p class="he-intro">${esc(T.NEEDS.lede)}</p>
          <ul class="fo-needlist">${C.ACTIVITIES.map(row).join("")}</ul>
          <h3 class="he-shelf">By the heat problem it touches</h3><ul class="fo-topiclist">${C.TOPICS.map(topic).join("")}</ul>
          <ul class="he-list">${T.LIMITS.map(x => `<li>${esc(x)}</li>`).join("")}</ul></section>`;
}
const LAND_JS = `<script>
(function(){var cards=[].slice.call(document.querySelectorAll(".fo-prog")),ctl=[].slice.call(document.querySelectorAll("[data-lf]")),out=document.getElementById("fo-land-count"),none=document.getElementById("fo-land-none");if(!cards.length)return;
function run(){var n=0;cards.forEach(function(c){var ok=ctl.every(function(x){var k=x.getAttribute("data-lf"),v=x.value.trim().toLowerCase();if(!v)return true;if(k==="q")return v.split(/\\s+/).every(function(w){return c.getAttribute("data-q").indexOf(w)>-1});if(k==="access")return (" "+c.getAttribute("data-access")+" ").indexOf(" "+v+" ")>-1;if(k==="rel")return c.getAttribute("data-rel")===v;if(k==="cat")return c.getAttribute("data-cat")===v;return true});c.hidden=!ok;if(ok)n++});out.textContent=n+(n===1?" programme":" programmes")+" shown.";none.hidden=n>0}
ctl.forEach(function(x){x.addEventListener(x.tagName==="INPUT"?"input":"change",run)});run();
function open(){var id=decodeURIComponent(location.hash.slice(1));var el=id&&document.getElementById(id);if(el&&el.tagName==="DETAILS"){el.open=true;el.scrollIntoView();}}open();window.addEventListener("hashchange",open);}());
</script>`;

// ---- the two pages ----
function filters(kind) {
  const C = M.load().C, o = (list, any, sel) => `<option value=""${sel === "" ? " selected" : ""}>${esc(any)}</option>` + list.map(([v, l]) => `<option value="${esc(v)}"${sel === v ? " selected" : ""}>${esc(l)}</option>`).join("");
  const sel = (f, label, list, any, sel2) => `<label class="fo-f"><span>${esc(label)}</span><select data-f="${f}">${o(list, any, sel2)}</select></label>`;
  const status = `<label class="fo-f"><span>Status</span><select data-f="status"><option value="verified-open" selected>Verified open</option><option value="open-any">Open or upcoming, any verification</option><option value="closed">Closed (archive)</option><option value="all">Everything</option></select></label>`;
  const common = `<label class="fo-f fo-f--q"><span>Search</span><input type="search" data-f="q" placeholder="${kind === "careers" ? "For example: health, engineer, Dhaka" : "For example: cooling, research, Bangladesh"}"></label>${status}`;
  if (kind === "careers") return common + sel("loc", "Location", C.COUNTRIES, "Anywhere") + `<label class="fo-f fo-f--check"><input type="checkbox" data-f="remote"> Remote allowed</label>` + sel("contribution", "Contribution", C.CONTRIBUTION, "Any contribution") +
    sel("role", "Role type", Object.entries(C.ROLE), "Any role type") + sel("pay", "Pay", Object.entries(C.PAY), "Any pay status") + `<label class="fo-f fo-f--check"><input type="checkbox" data-f="salary"> Salary published</label>` +
    sel("window", "Deadline", [["7", "Within 7 days"], ["30", "Within 30 days"], ["90", "Within 90 days"]], "Any deadline") + sel("relevance", "Heat relevance", [["direct", "Direct"], ["adjacent", "Adjacent, with the connection explained"]], "Direct or adjacent");
  return common + `<label class="fo-f fo-f--check"><input type="checkbox" data-f="asia" checked> Open to applicants or work in Asia</label>` + sel("country", "Applicant based in", C.COUNTRIES, "Any country") + sel("work", "Work in", C.COUNTRIES, "Any country") +
    sel("applicant", "Applicant type", C.APPLICANTS, "Any applicant type") + sel("topic", "Topic", C.TOPICS, "Any topic") + sel("instrument", "Kind of money", Object.entries(C.INSTRUMENT), "Any kind of money") +
    sel("type", "Opportunity type", Object.entries(C.TYPE), "Any type") + sel("access", "Access route", C.ACCESS, "Any access route") + sel("window", "Deadline", [["7", "Within 7 days"], ["30", "Within 30 days"], ["90", "Within 90 days"]], "Any deadline") +
    `<label class="fo-f fo-f--check"><input type="checkbox" data-f="amount" value="known"> Amount published</label>`;
}
function oppRow(r) {
  const C = M.load().C, d = C.entryDeadline(r);
  return `<tr data-id="${esc(r.id)}"><th scope="row"><a href="#${esc(r.id)}">${esc(r.title)}</a><span class="fo-sub">${esc(r.org_name)} · ${esc(C.TYPE[r.type] || r.type)}</span></th><td>${esc(r.amount_text)}<span class="fo-sub">${esc(r.instrument_text)}</span></td><td>${esc(r.eligibility_text)}</td><td>${esc(r.geography_text)}</td><td><span data-dl>${esc(C.deadlineText(d, today()))}</span></td><td>${statusChips(r, "opportunities")}</td></tr>`;
}
function oppCard(r, raw) {
  const C = M.load().C, d = C.entryDeadline(r), hist = (r.deadline_history || []).map(h => `${h.date} (${h.note || "earlier deadline"})`).join("; ");
  return `<article class="fo-rec" id="${esc(r.id)}" data-id="${esc(r.id)}">
      <header><h3 class="fo-rec__h">${esc(r.title)}</h3><p class="fo-sub">${esc(r.org_name)}${r.programme_name ? ` · ${esc(r.programme_name)}` : ""}${r.round ? ` · ${esc(r.round)}` : ""}${r.reference ? ` · Ref. ${esc(r.reference)}` : ""}</p>
        <p class="fo-chips">${statusChips(r, "opportunities")}${chip("type", C.TYPE[r.type] || r.type)}${chip("rel", C.RELEVANCE[r.relevance] || "")}</p></header>
      <dl class="fo-dl">
        <div><dt>Purpose</dt><dd>${esc(r.purpose_text)}</dd></div>
        <div><dt>Funding</dt><dd>${esc(r.amount_text)} · ${esc(r.instrument_text)}</dd></div>
        <div><dt>Who can apply</dt><dd>${esc(r.eligibility_text)}</dd></div>
        <div><dt>Where the work can happen</dt><dd>${esc(r.geography_text)}</dd></div>
        ${r.partnership_text ? `<div><dt>Partnership</dt><dd>${esc(r.partnership_text)}</dd></div>` : ""}
        <div><dt>Deadline</dt><dd><span data-dl>${esc(C.deadlineText(d, today()))}</span>${d && d.wording ? `<span class="fo-sub">As published: “${esc(d.wording)}”</span>` : ""}${hist ? `<span class="fo-sub">Extended; earlier deadline ${esc(hist)}</span>` : ""}${(r.deadlines || []).length > 1 ? `<span class="fo-sub">Later stages: ${esc(r.deadlines.slice(1).map(x => `${x.stage} ${x.date}`).join("; "))}</span>` : ""}</dd></div>
        <div><dt>How it connects to heat</dt><dd><span class="fo-reading">Common Shade's reading.</span> ${esc(r.relevance_why)}</dd></div>
        <div><dt>Access route</dt><dd>${esc(r.access_text)}</dd></div>
      </dl>
      <ul class="fo-match" data-match hidden></ul>
      ${r.conflict ? `<p class="cs-note cs-note--watch"><span class="cs-note__label">Conflicting information</span>${esc(r.conflict)}</p>` : ""}
      <p class="fo-actions"><a class="fo-next" href="${esc(r.official_url)}" target="_blank" rel="noopener">${esc(C.nextStep(raw, today()))}<span class="visually-hidden">: ${esc(r.title)} (opens in a new tab)</span></a>
        <button type="button" class="fo-btn" data-save="${esc(r.id)}" aria-pressed="false" data-js hidden>Save</button><button type="button" class="fo-btn" data-cmp="${esc(r.id)}" aria-pressed="false" data-js hidden>Compare</button></p>
      ${sourcesBlock(raw)}
    </article>`;
}
function carRow(r) {
  const C = M.load().C, d = C.entryDeadline(r);
  return `<tr data-id="${esc(r.id)}"><th scope="row"><a href="#${esc(r.id)}">${esc(r.title)}</a><span class="fo-sub">${esc(C.ROLE[r.role] || r.role)}</span></th><td>${esc(r.employer_name)}</td><td>${esc(r.location_text)}<span class="fo-sub">${esc(r.remote_text)}</span></td><td>${esc(r.contract_text)}</td><td>${esc(C.PAY[r.pay] || r.pay)}<span class="fo-sub">${esc(r.salary_text)}</span></td><td><span data-dl>${esc(C.deadlineText(d, today()))}</span></td></tr>`;
}
function carCard(r, raw) {
  const C = M.load().C, d = C.entryDeadline(r);
  return `<article class="fo-rec" id="${esc(r.id)}" data-id="${esc(r.id)}">
      <header><h3 class="fo-rec__h">${esc(r.title)}</h3><p class="fo-sub">${esc(r.employer_name)}${r.reference ? ` · Ref. ${esc(r.reference)}` : ""}</p>
        <p class="fo-chips">${statusChips(r, "careers")}${chip("type", C.ROLE[r.role] || r.role)}${chip("pay", C.PAY[r.pay] || r.pay)}${chip("rel", r.relevance === "adjacent" ? "Adjacent to heat" : "Direct heat role")}</p></header>
      <dl class="fo-dl">
        <div><dt>Location</dt><dd>${esc(r.location_text)} · Remote: ${esc(r.remote_text)}</dd></div>
        <div><dt>Contract</dt><dd>${esc(r.contract_text)}</dd></div>
        <div><dt>Pay</dt><dd>${esc(C.PAY[r.pay] || r.pay)}. ${esc(r.salary_text)}</dd></div>
        <div><dt>Deadline</dt><dd><span data-dl>${esc(C.deadlineText(d, today()))}</span>${d && d.wording ? `<span class="fo-sub">As published: “${esc(d.wording)}”</span>` : ""}</dd></div>
        <div><dt>How it connects to heat</dt><dd><span class="fo-reading">Common Shade's reading.</span> ${esc(r.relevance_why)}</dd></div>
        ${raw.work_authorisation ? `<div><dt>Work authorisation</dt><dd>${esc(factText(raw.work_authorisation))}</dd></div>` : ""}
      </dl>
      ${r.conflict ? `<p class="cs-note cs-note--watch"><span class="cs-note__label">Conflicting information</span>${esc(r.conflict)}</p>` : ""}
      <p class="fo-actions"><a class="fo-next" href="${esc(r.official_url)}" target="_blank" rel="noopener">View listing<span class="visually-hidden">: ${esc(r.title)} (opens in a new tab)</span></a>
        <button type="button" class="fo-btn" data-save="${esc(r.id)}" aria-pressed="false" data-js hidden>Save</button></p>
      ${sourcesBlock(raw)}
    </article>`;
}
function pages({ page, shell, write }) {
  const m = M.load(), C = m.C, now = today();
  const opps = m.OPP.slice().sort((a, b) => C.compare(a, b, now)), cars = m.CAR.slice().sort((a, b) => C.compare(a, b, now));
  const PO = opps.map(r => prep(r, "opportunities")), PC = cars.map(r => prep(r, "careers"));
  const vopen = opps.filter(o => C.isVerifiedOpen(o, now, "opportunity")).length, vcar = cars.filter(c => C.isVerifiedOpen(c, now, "career")).length;
  const tools = kind => `<div class="fo-tools"><button type="button" class="fo-btn" data-reset data-js hidden>Clear filters</button><button type="button" class="fo-btn" data-widen data-js hidden>Show everything</button>
      <label class="fo-f fo-f--sort" data-js hidden><span>Sort by</span><select data-sort><option value="deadline">Status and deadline</option><option value="title">Title</option><option value="checked">Most recently checked</option></select></label>
      <button type="button" class="fo-btn" data-saved-toggle aria-pressed="false" data-js hidden>Show my shortlist (0)</button><button type="button" class="fo-btn" data-csv data-js hidden>Download these as CSV</button><button type="button" class="fo-btn" data-print data-js hidden>Print</button>
      <a class="fo-btn" href="/heat-economy/data/${kind === "careers" ? "careers" : "funding-opportunities"}.csv" download>Download all (CSV)</a></div>
      <p class="fo-savenote" data-js hidden>${esc(T.SAVE)}</p>`;
  const data = (kind, list) => `<script>window.FUNDDATA=${JSON.stringify({ records: list }).replace(/</g, "\\u003c")};</script><script src="/heat-economy/funding-core.js?v=${V()}"></script><script src="/heat-economy/money/funding.js?v=${V()}"></script>`;
  const ABOUT2 = `<p class="sol-caveat he-about"><b>About this page.</b> Researched in November 2026 from official funder, employer and buyer pages; each record shows when its source was last checked. ${esc(T.TRUST)}</p>`;
  const oppBody = shell("money/opportunities", "The heat economy · Open calls and tenders", esc(T.OPP.h), `${esc(T.OPP.lede)} ${vopen} verified open as of the source checks; ${opps.length} records in all, closed rounds included.`,
    `<div class="fo" data-fund="opportunities">
      <nav class="sol-jump" aria-label="On this page"><a href="#find">Find a call</a> · <a href="#read">How to read these</a> · <a href="/heat-economy/money/#landscape">The funding landscape</a> · <a href="/heat-economy/money/careers/">Careers</a></nav>
      <section id="find" aria-labelledby="find-h"><h2 id="find-h" class="visually-hidden">Find a call</h2>
      <p class="he-note" data-js hidden>${esc(T.OPP.default)}</p>
      <form class="fo-filters" role="search" onsubmit="return false" aria-label="Filter calls and tenders">${filters("opportunities")}</form>
      ${tools("opportunities")}
      <p class="sol-count" data-count role="status" aria-live="polite"></p>
      <p class="fo-hidden" data-hidden-note hidden><span></span> <label><input type="checkbox" data-f="showall"> Show them anyway</label></p>
      <div class="fo-compare" data-compare hidden aria-live="polite"></div>
      <div class="fo-tablewrap fo-desk" role="region" aria-label="Calls and tenders" tabindex="0"><table class="fo-table"><caption class="visually-hidden">Calls and tenders, open first, then upcoming, unconfirmed and closed</caption>
        <thead><tr><th scope="col">Opportunity</th><th scope="col">Funding</th><th scope="col">Eligibility</th><th scope="col">Geography</th><th scope="col">Deadline</th><th scope="col">Status</th></tr></thead>
        <tbody data-list>${PO.map(oppRow).join("")}</tbody></table></div>
      <div class="fo-cards" data-list>${PO.map((r, i) => oppCard(r, opps[i])).join("\n")}</div>
      <p class="sol-none" data-none hidden>${esc(T.OPP.none)}</p></section>
      <section class="cty-s" id="read" aria-labelledby="read-h"><h2 id="read-h">How to read these</h2><ul class="he-list">${T.OPP.distinctions.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
        <p class="he-note">Application status and verification are separate. "Verified open" needs both: open, rolling or deadline day, and checked against the official page within the last fortnight. A record we could not re-check shows "Review due" and is not counted as verified open. Rules: <a href="https://github.com/arunbh2/beattheheat-asia/blob/main/data/funding/README.md">status and freshness rules</a>.</p>
        <p class="he-note">${esc(T.TRUST)} <a href="/corrections/">Corrections</a>.</p></section>
    </div>`, ABOUT2);
  write("heat-economy/money/opportunities", T.OPP.title, `${T.OPP.lede.slice(0, 150)} ${vopen} verified open.`, oppBody, data("opportunities", PO));
  const groups = C.CONTRIBUTION.map(([k, l]) => [l, PC.filter(r => r.contribution === k)]).filter(([, l]) => l.length);
  const carBody = shell("money/careers", "The heat economy · Careers", esc(T.CAR.h), `${esc(T.CAR.lede)} ${esc(T.CAR.sub)}`,
    `<div class="fo" data-fund="careers">
      <nav class="sol-jump" aria-label="On this page"><a href="#find">Find a role</a> · <a href="#by-contribution">By contribution</a> · <a href="#read">How to read these</a> · <a href="/heat-economy/money/opportunities/">Open calls</a></nav>
      <section id="find" aria-labelledby="find-h"><h2 id="find-h" class="visually-hidden">Find a role</h2>
      <p class="he-note">${vcar} verified open now; ${cars.length} listings in all, closed ones included. This list is small and curated: each is checked against the employer's own page.</p>
      <form class="fo-filters" role="search" onsubmit="return false" aria-label="Filter roles">${filters("careers")}</form>
      ${tools("careers")}
      <p class="sol-count" data-count role="status" aria-live="polite"></p>
      <div class="fo-tablewrap fo-desk" role="region" aria-label="Roles" tabindex="0"><table class="fo-table"><caption class="visually-hidden">Roles, open first</caption>
        <thead><tr><th scope="col">Role</th><th scope="col">Organisation</th><th scope="col">Location</th><th scope="col">Contract</th><th scope="col">Pay</th><th scope="col">Deadline</th></tr></thead>
        <tbody data-list>${PC.map(carRow).join("")}</tbody></table></div>
      <div class="fo-cards" data-list>${PC.map((r, i) => carCard(r, cars[i])).join("\n")}</div>
      <p class="sol-none" data-none hidden>${esc(T.CAR.none)}</p></section>
      <section class="cty-s" id="by-contribution" aria-labelledby="bc-h"><h2 id="bc-h">By contribution</h2>${groups.map(([l, list]) => `<h3 class="he-shelf">${esc(l)}</h3><ul class="sol-ul">${list.map(r => `<li><a href="#${esc(r.id)}">${esc(r.title)}</a>, ${esc(r.employer_name)}</li>`).join("")}</ul>`).join("") || "<p>No listings yet.</p>"}</section>
      <section class="cty-s" id="read" aria-labelledby="read-h"><h2 id="read-h">How to read these</h2><ul class="he-list">${T.CAR.rules.map(x => `<li>${esc(x)}</li>`).join("")}</ul><p class="he-note">${esc(T.TRUST)} <a href="/corrections/">Corrections</a>.</p></section>
    </div>`, ABOUT2);
  write("heat-economy/money/careers", T.CAR.title, `${T.CAR.lede} ${cars.length} listings, ${vcar} verified open.`, carBody, data("careers", PC));
  // downloads
  const dir = path.join(ROOT, "heat-economy", "data"); fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "funding-opportunities.csv"), C.csv(C.CSV_HEAD.opportunities, PO.map(r => C.csvRow(r, "opportunities", now))));
  fs.writeFileSync(path.join(dir, "careers.csv"), C.csv(C.CSV_HEAD.careers, PC.map(r => C.csvRow(r, "careers", now))));
  fs.writeFileSync(path.join(dir, "funding-programmes.csv"), C.csv(["Programme", "Run by", "Kind", "Heat relevance", "Why (Common Shade's reading)", "Access routes", "Who can receive money", "Kind of money", "What it funds", "Source checked", "Official page"],
    m.PROG.map(p => [p.name, (m.byId[p.org] || {}).name, CATEGORY[p.category] || p.category, C.RELEVANCE[(p.relevance || {}).label] || "", (p.relevance || {}).why, (p.access || []).map(a => C.ACCESS_LABEL[a]).join("; "), factText(p.recipients), (p.instruments || []).map(i => C.INSTRUMENT[i] || i).join("; "), factText(p.remit), p.check.checked, p.url])));
  return { programmes: m.PROG.length, opportunities: opps.length, vopen, careers: cars.length, vcar, held: m.held.map(r => `${r.id} (${r.check.missing.join("; ") || (r.check.not_run.length ? "not checked yet" : "")})`) };
}
let _v; const V = () => _v || (_v = (fs.readFileSync(path.join(ROOT, "index.html"), "utf8").match(/styles\.css\?v=(\d+)/) || [, "1"])[1]);

// ---- llms-full.txt ----
function llms() {
  const m = M.load(), C = m.C, now = today();
  const lines = [`## Funding, open calls and careers`, "", T.LAND.lede, "", `Open calls and tenders: ${SITE}/heat-economy/money/opportunities/ · Careers: ${SITE}/heat-economy/money/careers/ · Programmes: ${SITE}/heat-economy/money/#landscape`, "",
    "Status rules: application status (upcoming, open, deadline day, rolling, closed, withdrawn, unknown) and verification (verified, review due, source unavailable, conflicting information) are separate; 'verified open' needs both. A future deadline does not prove a call is open; no deadline does not mean rolling.", ""];
  lines.push("### Open calls and tenders (as of the build; check each official page)");
  m.OPP.slice().sort((a, b) => C.compare(a, b, now)).forEach(o => { const p = prep(o, "opportunities"), d = C.entryDeadline(o);
    lines.push(`- ${o.title} (${p.org_name}; ${C.TYPE[o.type] || o.type}; ${p.instrument_text}). Status: ${C.applicationStatus(o, now).label}; ${C.verificationStatus(o, now, "opportunity").label}. Deadline: ${C.deadlineText(d)}. Funding: ${p.amount_text}. Who can apply: ${p.eligibility_text}. ${o.official_url}`); });
  lines.push("", "### Programmes");
  m.PROG.forEach(p => lines.push(`- ${p.name} (${(m.byId[p.org] || {}).name || ""}): ${C.RELEVANCE[(p.relevance || {}).label] || ""}. Access: ${(p.access || []).map(a => C.ACCESS_LABEL[a]).join("; ")}. ${p.url}`));
  lines.push("", "### Careers");
  m.CAR.forEach(c => { const p = prep(c, "careers"); lines.push(`- ${c.title}, ${p.employer_name} (${C.ROLE[c.role] || c.role}; ${C.PAY[c.pay] || c.pay}). ${C.applicationStatus(c, now).label}. ${c.official_url}`); });
  lines.push("", T.TRUST);
  return lines.join("\n");
}
// ---- contextual lines on other pages: at most three records for a topic ----
function forTopic(topic, esc2 = esc) {
  const m = M.load(), C = m.C, now = today();
  const opps = m.OPP.filter(o => (o.topics || []).includes(topic) && ["open", "rolling", "closing", "upcoming"].includes(C.applicationStatus(o, now).status)).slice(0, 2);
  const progs = m.PROG.filter(p => (p.topics || []).includes(topic) && (p.relevance || {}).label !== "potential").slice(0, 3 - opps.length);
  if (!opps.length && !progs.length) return "";
  return `<p class="meta fo-ctx"><span class="fo-ctx__k">Funding and opportunities</span> ${[...opps.map(o => `<a href="/heat-economy/money/opportunities/#${esc2(o.id)}">${esc2(o.title)}</a> (${esc2(C.applicationStatus(o, now).label.toLowerCase())})`), ...progs.map(p => `<a href="/heat-economy/money/#fund-${esc2(p.id)}">${esc2(p.name)}</a>`)].join("; ")} · <a href="/heat-economy/money/opportunities/?topic=${esc2(topic)}&amp;status=all">More</a></p>`;
}
// the pages that carry a "Funding and opportunities" block, and the heat problems each is about; a rebuild replaces the
// block between its markers. Called at the end of tools/build-static.js, after those pages are written.
const CONTEXT = [["factory-heat/index.html", ["work", "value-chain"]], ["cotton-and-heat/index.html", ["value-chain", "work"]], ["social-protection/index.html", ["inclusion"]],
  ["paying-when-heat-strikes/index.html", ["warning"]], ["cities/index.html", ["municipal", "nature"]], ["cooling-options/index.html", ["cooling", "homes"]], ["who-is-at-risk/index.html", ["inclusion", "health"]]];
function contextBlock(topics) {
  const m = M.load(), C = m.C, now = today(), seen = new Set();
  const opps = m.OPP.filter(o => topics.some(t => (o.topics || []).includes(t)) && ["open", "rolling", "closing", "upcoming"].includes(C.applicationStatus(o, now).status));
  const progs = m.PROG.filter(p => topics.some(t => (p.topics || []).includes(t)) && (p.relevance || {}).label !== "potential");
  const items = [...opps.map(o => [o.id, `<a href="/heat-economy/money/opportunities/#${esc(o.id)}">${esc(o.title)}</a> <span class="sg-ctx__m">${esc(C.applicationStatus(o, now).label)} · ${esc(C.TYPE[o.type] || o.type)}</span>`]),
    ...progs.map(p => [p.id, `<a href="/heat-economy/money/#fund-${esc(p.id)}">${esc(p.name)}</a> <span class="sg-ctx__m">${esc(C.RELEVANCE[(p.relevance || {}).label] || "")} · ${esc((p.access || []).map(a => C.ACCESS_LABEL[a]).slice(0, 1).join(""))}</span>`])]
    .filter(([id]) => !seen.has(id) && seen.add(id)).slice(0, 3);
  if (!items.length) return "";
  return `\n  <!--fo-ctx--><section class="container hub sg-ctx" aria-labelledby="fo-ctx-h"><h2 class="hub-h" id="fo-ctx-h">Funding and opportunities</h2><p class="hub-p">Programmes and calls in the funding dataset whose published remit touches this topic. A programme is not an open call; each record says how it can be reached.</p><ul class="sg-ctx__l">${items.map(([, h]) => `<li>${h}</li>`).join("")}</ul><p class="hub-p sg-ctx__more"><a href="/heat-economy/money/opportunities/?topic=${esc(topics[0])}&amp;status=all">All calls on this topic</a> · <a href="/heat-economy/money/#landscape">The funding landscape</a> · <a href="/heat-economy/money/careers/">Careers</a></p></section><!--/fo-ctx-->`;
}
function inject() {
  let n = 0;
  for (const [file, topics] of CONTEXT) {
    const f = path.join(ROOT, file); if (!fs.existsSync(f)) continue;
    let s = fs.readFileSync(f, "utf8").replace(/\n?\s*<!--fo-ctx-->[\s\S]*?<!--\/fo-ctx-->/, "");
    const blk = contextBlock(topics), at = s.lastIndexOf("</main>"); if (at < 0) continue;
    fs.writeFileSync(f, blk ? s.slice(0, at).replace(/\s*$/, "") + blk + "\n  " + s.slice(at) : s); if (blk) n++;
  }
  console.log(`funding: "Funding and opportunities" on ${n} topic pages`);
  return n;
}
module.exports = { landscape, LAND_JS, pages, llms, forTopic, prep, CATEGORY, inject, CONTEXT };
