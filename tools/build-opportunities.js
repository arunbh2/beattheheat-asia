#!/usr/bin/env node
// Common Shade: /opportunities/ ("Heat Opportunities"), one hub for jobs, individual consultancies, fellowships, research
// posts, grants, research calls, tenders and challenges. It reads the same records as /heat-economy/money/careers/ and
// /heat-economy/money/opportunities/ (data/funding/careers.json and opportunities.json, through tools/funding-model.js,
// which publishes a record only when its core facts passed the source check), so there is one canonical record per listing.
// It writes:
//   - /opportunities/                 the hub: views, filters (state in the address), cards with every listing, the coverage note
//   - /opportunities/<id>/            one page per listing, with share and print, and JobPosting data only where it fits
//   - /opportunities/feed.xml         Atom feed of open listings
//   - /opportunities/opportunities.json and coverage.json (public summaries; candidate text from the sweep is never published)
//   - md() for llms-full.txt, and context() for city, country, topic and heat network pages (between <!--op-ctx--> markers)
// Shared rules: opportunities/hub-core.js (on top of heat-economy/funding-core.js). Words: tools/opportunities-text.js.
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), SITE = "https://beattheheat.asia";
const M = require("./funding-model.js"), H = require("../opportunities/hub-core.js"), T = require("./opportunities-text.js");
const C = require("../heat-economy/funding-core.js");
const today = () => new Date().toISOString().slice(0, 10);
const escH = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const fmt = d => d ? new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : "";
const read = (f, d) => fs.existsSync(path.join(ROOT, f)) ? JSON.parse(fs.readFileSync(path.join(ROOT, f), "utf8")) : d;
const CITY = () => Object.fromEntries(read("data/core/LIVE_CITIES.json", []).map(c => [c.id, c]));
const COUNTRY_PAGE = { BD: "bangladesh", IN: "india", ID: "indonesia", NP: "nepal", PH: "philippines", LK: "sri-lanka", TH: "thailand" };
const cname = code => (C.COUNTRIES.find(([c]) => c === code) || [, code])[1];
const TOPIC = Object.fromEntries(C.TOPICS);
const TOPIC_PAGES = { work: [["/factory-heat/", "Factory heat"], ["/heat-health-and-equity/", "Heat, health and equity"]], health: [["/heat-health-and-equity/", "Heat, health and equity"], ["/care-through-heat/", "Care through heat"]],
municipal: [["/plan/", "Plan a heat response"]], homes: [["/home-is-also-the-workplace/", "Home is also the workplace"]], inclusion: [["/social-protection/", "Social protection"]] };

// all items: careers and calls, normalised, deduplicated, ordered
function items() {
  const m = M.load(), names = Object.fromEntries([...m.ORG].map(o => [o.id, o.name]));
  const net = Object.fromEntries(read("data/core/ORGANISATIONS.json", []).map(o => [o.id, o.name]));
  const list = [...m.CAR.filter(r => H.ROLE_CAT[r.role]).map(r => H.item(r, "career", names)), ...m.OPP.map(r => {
    const it = H.item(r, "opportunity", names), org = m.byId[r.org] || {}; if (!it.network_id && org.network_id) it.network_id = org.network_id; return it; })];
  list.forEach(it => { it.network_name = it.network_id ? net[it.network_id] || "" : ""; if (!it.org_name && it.network_name) it.org_name = it.network_name; });
  const now = today();
  return H.dedupe(list).sort((a, b) => H.compare(a, b, now));
}
function coverage() {
  const orgs = read("data/core/ORGANISATIONS.json", []), led = read("data/funding/coverage.json", { cycle: null, orgs: {} }), reg = Object.fromEntries(read("data/funding/network-sources.json", { records: [] }).records.map(r => [r.id, r]));
  const sweep = require("./opportunities-sweep.js"), cyc = led.cycle || {}, rows = orgs.map(o => { const e = (led.orgs || {})[o.id]; const inCycle = e && e.cycle === cyc.id;
    // reviewed candidates resolve to found or none; unreviewed stay "candidates awaiting review"
    let s = inCycle ? e.status : "unchecked"; if (s === "candidates" && e.reviewed) s = e.reviewed === "found" ? "found" : "none";
    return { id: o.id, name: o.name, status: s, label: sweep.STATUS[s], attempted: inCycle ? e.attempted : null, last_success: e ? e.last_success : null, domain: (reg[o.id] || {}).domain || null, note: inCycle ? (e.review_note || (e.notes || [])[0] || "") : "" }; });
  const by = {}; rows.forEach(r => { by[r.status] = (by[r.status] || 0) + 1; });
  const dates = rows.map(r => r.attempted).filter(Boolean).sort();
  const checked = rows.filter(r => ["found", "none", "candidates"].includes(r.status)).length;
  return { cycle: cyc.id || null, from: dates[0] || null, to: dates[dates.length - 1] || null, total: rows.length, checked, by, rows };
}

// ---------- pieces ----------
function chips(it, now) {
  const l = H.lifecycle(it, now), v = H.verification(it, now);
  return `<p class="fo-chips"><span class="fo-chip fo-chip--type">${escH(it.cat_label)}</span><span class="fo-chip fo-chip--access">${escH(H.WHO[it.who])}</span><span class="fo-chip fo-chip--rel op-rel op-rel--${it.rel}">${escH(H.REL[it.rel])}</span><span class="fo-chip fo-chip--app" data-life title="${escH(l.why)}">${escH(l.label)}</span><span class="fo-chip fo-chip--ver" data-ver title="${escH(v.why)}">${escH(v.label)}</span></p>`;
}
const orgLink = it => it.network_id ? `<a href="/heat-network/#org-${escH(it.network_id)}">${escH(it.org_name)}</a>` : escH(it.org_name);
const ext = (u, l) => `<a href="${escH(u)}" target="_blank" rel="noopener">${escH(l)}<span class="visually-hidden"> (opens in a new tab)</span></a>`;
const waLink = (it, now) => `https://wa.me/?text=${encodeURIComponent(H.shareText(it, now, `${SITE}/opportunities/${it.id}/`))}`;
function facts(it, now, full) {
  const d = it.deadline, row = (k, v) => v ? `<div><dt>${escH(k)}</dt><dd>${v}</dd></div>` : "";
  return `<dl class="fo-dl op-dl">
    ${row("Location", `${escH(it.location)}${it.mode !== "not-stated" ? ` <span class="fo-sub">${escH(H.MODE[it.mode])}</span>` : ""}`)}
    ${row("Why this is relevant to heat", `${escH(it.rel_why)}`)}
    ${row("Deadline", `<span data-dl>${escH(H.deadlineLabel(it, now))}</span>${d && d.wording ? `<span class="fo-sub">As published: “${escH(d.wording)}”</span>` : ""}${it.deadline_history.length ? `<span class="fo-sub">Extended: earlier deadline ${escH(it.deadline_history.map(h => fmt(h.date)).join(", "))}</span>` : ""}`)}
    ${row(it.comp_kind === "pay" ? "Pay" : "Funding", escH(it.comp_text || "Not disclosed"))}
    ${row("Source checked", escH(it.check.checked ? fmt(it.check.checked) : "Not yet"))}
    ${full ? row("Experience", escH(it.experience)) + row("Qualifications", escH(it.qualifications)) + row("Contract or duration", escH(it.contract)) + row("Who can apply and from where", escH(it.eligibility_geo)) + row("How to apply", escH(it.apply_text || "As described on the official listing.")) : ""}
  </dl>`;
}
function details(it) {
  const row = (k, v) => v ? `<div><dt>${escH(k)}</dt><dd>${v}</dd></div>` : "";
  return `<details class="op-more"><summary>Eligibility and source details</summary><dl class="fo-dl op-dl">
    ${row("Experience", escH(it.experience))}${row("Qualifications", escH(it.qualifications))}${row("Contract or duration", escH(it.contract))}
    ${row("Who can apply and from where", escH(it.eligibility_geo))}${row("How to apply", escH(it.apply_text || "As described on the official listing."))}
    ${it.rel_evidence ? row("From the listing", `“${escH(it.rel_evidence.text)}”${it.rel_evidence.confirmed === false ? " (not confirmed by the source check)" : ""}`) : ""}
    ${it.aliases.length ? row("Also titled", escH(it.aliases.join("; "))) : ""}${it.requisition ? row("Reference", escH(it.requisition)) : ""}
    ${row("Sources", it.sources.map(s => ext(s.url, s.label)).join(" · "))}
  </dl>${it.conflict ? `<p class="cs-note cs-note--watch"><span class="cs-note__label">Conflicting information</span>${escH(it.conflict)}</p>` : ""}</details>`;
}
function card(it, now) {
  const a = H.action(it);
  return `<article class="cs-card op-card" id="${escH(it.id)}" data-id="${escH(it.id)}">
    ${chips(it, now)}
    <h3 class="fo-rec__h"><a href="/opportunities/${escH(it.id)}/">${escH(it.title)}</a></h3>
    <p class="fo-sub">${orgLink(it)}</p>
    ${facts(it, now, false)}
    ${details(it)}
    <p class="fo-actions"><a class="fo-next" href="${escH(a.url)}" target="_blank" rel="noopener">${escH(a.label)}<span class="visually-hidden">: ${escH(it.title)} (opens in a new tab)</span></a>
      <a class="fo-btn" href="${escH(waLink(it, now))}" target="_blank" rel="noopener">Share on WhatsApp<span class="visually-hidden">: ${escH(it.title)} (opens in a new tab)</span></a>
      <button type="button" class="fo-btn" data-copy="${SITE}/opportunities/${escH(it.id)}/" data-js hidden>Copy link</button>
      <button type="button" class="fo-btn" data-save="${escH(it.id)}" aria-pressed="false" data-js hidden>Save</button></p>
  </article>`;
}
const opts = (list, any) => `<option value="">${escH(any)}</option>` + list.map(([v, l]) => `<option value="${escH(v)}">${escH(l)}</option>`).join("");

// ---------- the builder ----------
module.exports = function buildOpportunities({ page, write, V }) {
  const now = today(), all = items(), cov = coverage(), cities = CITY(), net = Object.fromEntries(read("data/core/ORGANISATIONS.json", []).map(o => [o.id, o.name]));
  const open = all.filter(it => !H.isArchived(it, now)), arch = all.filter(it => H.isArchived(it, now));
  const main = open.filter(it => it.rel !== "network");
  const count = view => all.filter(it => H.inView(it, view, now) && it.rel !== "network").length;
  const used = (f) => [...new Set(all.flatMap(f))].filter(Boolean);
  const css = `\n  <link rel="stylesheet" href="/opportunities/opportunities.css?v=${V}">`;
  const data = `<script>window.OPPDATA=${JSON.stringify({ items: all, built: now }).replace(/</g, "\\u003c")};</script><script src="/heat-economy/funding-core.js?v=${V}"></script><script src="/opportunities/hub-core.js?v=${V}"></script><script src="/opportunities/hub.js?v=${V}"></script>`;
  const covLine = `Checked ${cov.checked} of ${cov.total} network organisations in the latest review cycle${cov.from ? ` (${fmt(cov.from)}${cov.to && cov.to !== cov.from ? ` to ${fmt(cov.to)}` : ""})` : ""}. <a href="#coverage">How complete is this?</a>`;
  const SL = Object.keys(H.LIFE).map(k => [k, H.LIFE[k]]);
  const filters = `<form class="fo-filters op-filters" role="search" onsubmit="return false" aria-label="Filter opportunities" data-js hidden>
      <label class="fo-f fo-f--q"><span>Search</span><input type="search" data-f="q" placeholder="Title, organisation, topic or place"></label>
      <label class="fo-f"><span>For</span><select data-f="who">${opts(Object.entries(H.WHO), "Individuals and organisations")}</select></label>
      <label class="fo-f"><span>Type</span><select data-f="cat">${opts(H.CATS.filter(([k]) => all.some(i => i.cat === k)).map(([k, l]) => [k, l]), "Any type")}</select></label>
      <label class="fo-f"><span>Country</span><select data-f="country">${opts(C.COUNTRIES.filter(([c]) => all.some(i => i.countries.includes(c))), "Any country")}</select></label>
      <label class="fo-f"><span>City</span><select data-f="city">${opts(used(i => i.cities).map(c => [c, (cities[c] || {}).name || c]), "Any city")}</select></label>
      <label class="fo-f"><span>Work arrangement</span><select data-f="mode">${opts(Object.entries(H.MODE).filter(([k]) => all.some(i => i.mode === k)), "Any")}</select></label>
      <label class="fo-f"><span>Heat relevance</span><select data-f="rel"><option value="">Direct and related</option><option value="direct">${escH(H.REL.direct)}</option><option value="related">${escH(H.REL.related)}</option></select></label>
      <label class="fo-f"><span>Theme</span><select data-f="theme">${opts(C.TOPICS.filter(([k]) => all.some(i => i.themes.includes(k))), "Any theme")}</select></label>
      <label class="fo-f"><span>Experience</span><select data-f="level">${opts([["early", "Early career"], ["mid", "Mid career"], ["senior", "Senior"]].filter(([k]) => all.some(i => i.level === k)), "Any level")}</select></label>
      <label class="fo-f"><span>Status</span><select data-f="status">${opts(SL.filter(([k]) => all.some(i => H.lifecycle(i, now).status === k)), "Any status in this view")}</select></label>
      <label class="fo-f"><span>Organisation</span><select data-f="org">${opts([...new Map(all.map(i => [i.network_id || i.org, i.org_name])).entries()].filter(([k]) => k).sort((a, b) => a[1].localeCompare(b[1])), "Any organisation")}</select></label>
      <label class="fo-f"><span>Verification</span><select data-f="ver">${opts(Object.entries(C.VER), "Any")}</select></label>
      <label class="fo-f fo-f--check"><input type="checkbox" data-f="paid" value="1"> Pay or funding disclosed</label>
      <label class="fo-f fo-f--check"><input type="checkbox" data-f="relall" value="all"> ${escH(T.network)}</label>
    </form>`;
  const views = `<nav class="op-views" aria-label="Views" data-js hidden>${H.VIEWS.map(([k, l]) => `<a href="?view=${k}" data-view="${k}">${escH(l)}</a>`).join("")}</nav>`;
  const tools = `<div class="fo-tools" data-js hidden><button type="button" class="fo-btn" data-reset>Clear filters</button><button type="button" class="fo-btn" data-copyview>Copy link to this view</button><button type="button" class="fo-btn" data-savesearch>Save this search</button><button type="button" class="fo-btn" data-print>Print</button><a class="fo-btn" href="/opportunities/feed.xml">Feed (Atom)</a><a class="fo-btn" href="/opportunities/opportunities.json">Data (JSON)</a></div>
      <div class="op-saved" data-saved hidden><p class="fo-sub">${escH(T.save)}</p><ul data-saved-list></ul></div>`;
  const covRows = H => cov.rows.slice().sort((a, b) => a.name.localeCompare(b.name));
  const ORDER = ["found", "candidates", "none", "manual", "blocked", "unavailable", "unchecked"];
  const sweep = require("./opportunities-sweep.js");
  const covSection = `<section class="cty-s op-cov" id="coverage" aria-labelledby="cov-h"><h2 id="cov-h">${escH(T.coverage.h)}</h2>
      <p>${escH(T.coverage.note)}</p>
      <ul class="op-covlist">${ORDER.filter(k => cov.by[k]).map(k => `<li><b>${cov.by[k]}</b> ${escH(sweep.STATUS[k])}</li>`).join("")}<li><b>${cov.total}</b> organisations in the heat network in all</li></ul>
      <p class="fo-sub">Review cycle ${escH(cov.cycle || "not started")}${cov.from ? `: pages read from ${escH(fmt(cov.from))} to ${escH(fmt(cov.to))}` : ""}. ${escH(T.coverage.statusNote)} ${escH(T.coverage.none)}</p>
      <details class="op-more"><summary>Every organisation and what was found</summary><div class="fo-tablewrap" role="region" aria-label="Coverage by organisation" tabindex="0"><table class="fo-table op-covtable"><caption class="visually-hidden">Coverage of the heat network in this review cycle</caption><thead><tr><th scope="col">Organisation</th><th scope="col">Status</th><th scope="col">Last attempted</th><th scope="col">Note</th></tr></thead><tbody>
      ${covRows().map(r => `<tr><th scope="row"><a href="/heat-network/#org-${escH(r.id)}">${escH(r.name)}</a></th><td>${escH(r.label)}</td><td>${escH(r.attempted || "")}</td><td>${escH(r.note)}</td></tr>`).join("")}
      </tbody></table></div></details>
      <p class="fo-sub">${escH(T.refresh)}</p></section>`;
  const body = `<header class="pg-hero"><div class="container"><p class="eyebrow">Opportunities</p><h1 class="pg-h1">${escH(T.h)}</h1><p class="pg-lede">${escH(T.lede)}</p></div></header>
  <div class="container op">
    <p class="op-sub">${escH(T.sub)}</p>
    <div class="fo-paths op-paths">${T.paths.map(([k, l, d]) => `<a class="fo-path" href="?view=${k}"><b>${escH(l)}</b><span>${count(k)} open now · ${escH(d)}</span></a>`).join("")}</div>
    <p class="op-covline">${covLine}</p>
    ${views}
    <section id="find" aria-labelledby="find-h"><h2 id="find-h" class="visually-hidden">Find an opportunity</h2>
      ${filters}${tools}
      <p class="sol-count" data-count role="status" aria-live="polite">${main.length} open opportunities with direct or related heat relevance; ${open.length - main.length} more at heat-network organisations; ${arch.length} in the archive.</p>
      <div class="op-list" data-list>${open.map(it => card(it, now)).join("\n")}</div>
      <p class="sol-none" data-none hidden>${escH(T.none)}</p>
    </section>
    <section class="cty-s" id="archive" aria-labelledby="arch-h"><h2 id="arch-h">Archive</h2><p class="fo-sub">Listings whose deadline has passed, or that the provider closed or withdrew. Kept for the record; not open.</p>
      <div class="op-list" data-list data-archive>${arch.map(it => card(it, now)).join("\n") || "<p>Nothing in the archive yet.</p>"}</div></section>
    ${covSection}
    <section class="cty-s" id="read" aria-labelledby="read-h"><h2 id="read-h">How to read these</h2>
      <ul class="he-list"><li><b>${escH(H.REL.direct)}.</b> ${escH(H.REL_NOTE.direct)}</li><li><b>${escH(H.REL.related)}.</b> ${escH(H.REL_NOTE.related)}</li><li><b>${escH(H.REL.network)}.</b> ${escH(H.REL_NOTE.network)} ${escH(T.networkNote)}</li></ul>
      <ul class="he-list">${T.rules.map(r => `<li>${escH(r)}</li>`).join("")}</ul>
      <p class="he-note">${escH(T.apply)} ${escH(T.trust)} <a href="/corrections/">Corrections</a>. Also on Common Shade: <a href="/heat-economy/money/">the funding landscape</a> · <a href="/heat-economy/money/opportunities/">open calls and tenders</a> · <a href="/heat-economy/money/careers/">careers</a> · <a href="/heat-network/">the heat network</a>.</p></section>
  </div>${data}`;
  write("opportunities", page("opportunities", T.title, `${T.lede} ${main.length} open with direct or related heat relevance, each checked against its official listing.`, body, css));
  // detail pages
  const keep = new Set(all.map(i => i.id)), dir = path.join(ROOT, "opportunities");
  fs.readdirSync(dir).filter(d => fs.statSync(path.join(dir, d)).isDirectory() && !keep.has(d)).forEach(d => fs.rmSync(path.join(dir, d), { recursive: true }));
  all.forEach(it => {
    const a = H.action(it), jp = H.jobPosting(it, now, SITE);
    const rel = [];
    it.cities.forEach(c => { if (cities[c] && fs.existsSync(path.join(ROOT, "cities", c, "index.html"))) rel.push([`/cities/${c}/`, cities[c].name]); });
    it.countries.forEach(c => { if (COUNTRY_PAGE[c]) rel.push([`/countries/${COUNTRY_PAGE[c]}/`, cname(c)]); });
    it.themes.forEach(t => (TOPIC_PAGES[t] || []).forEach(p => rel.push(p)));
    if (it.network_id) rel.push([`/heat-network/#org-${it.network_id}`, `${it.network_name || it.org_name} in the heat network`]);
    const relU = [...new Map(rel.map(r => [r[0], r])).values()];
    const head = css + (jp ? `\n  <script type="application/ld+json">${JSON.stringify(jp).replace(/</g, "\\u003c")}</script>` : "");
    const b = `<header class="pg-hero"><div class="container"><p class="eyebrow"><a href="/opportunities/">Heat Opportunities</a> · ${escH(it.cat_label)}</p><h1 class="pg-h1 op-h1">${escH(it.title)}</h1><p class="pg-lede">${orgLink(it)} · ${escH(it.location)}</p></div></header>
  <div class="container op op--one" data-one="${escH(it.id)}">
    <article class="cs-card op-card op-card--one" id="${escH(it.id)}" data-id="${escH(it.id)}">
      ${chips(it, now)}
      ${it.summary ? `<p>${escH(it.summary)}</p>` : ""}
      ${facts(it, now, true)}
      ${it.rel_evidence ? `<p class="fo-sub">From the listing: “${escH(it.rel_evidence.text)}”${it.rel_evidence.confirmed === false ? " (not confirmed by the source check)" : ""}</p>` : ""}
      ${it.aliases.length ? `<p class="fo-sub">Also titled: ${escH(it.aliases.join("; "))}</p>` : ""}
      ${it.conflict ? `<p class="cs-note cs-note--watch"><span class="cs-note__label">Conflicting information</span>${escH(it.conflict)}</p>` : ""}
      ${H.isArchived(it, now) ? `<p class="cs-note cs-note--limit"><span class="cs-note__label">Not open</span>${escH(H.lifecycle(it, now).why)} This listing is kept in the archive for the record.</p>` : ""}
      <p class="fo-actions"><a class="fo-next" href="${escH(a.url)}" target="_blank" rel="noopener">${escH(a.label)}<span class="visually-hidden"> (opens in a new tab)</span></a>
        <a class="fo-btn" href="${escH(waLink(it, now))}" target="_blank" rel="noopener">Share on WhatsApp<span class="visually-hidden"> (opens in a new tab)</span></a>
        <button type="button" class="fo-btn" data-copy="${SITE}/opportunities/${escH(it.id)}/" data-js hidden>Copy link</button>
        <button type="button" class="fo-btn" data-print data-js hidden>Print</button></p>
      <p class="fo-sub">${escH(T.apply)}</p>
      <p class="fo-src"><b>Source checked:</b> ${escH(it.check.checked ? fmt(it.check.checked) : "not yet")} · ${it.sources.map(s => ext(s.url, s.label)).join(" · ")}</p>
    </article>
    ${relU.length ? `<section class="cty-s"><h2>Related on Common Shade</h2><ul class="sol-ul">${relU.map(([u, l]) => `<li><a href="${escH(u)}">${escH(l)}</a></li>`).join("")}</ul></section>` : ""}
    <p class="he-note"><a href="/opportunities/">All heat opportunities</a> · ${escH(T.trust)} <a href="/corrections/">Corrections</a></p>
  </div><script>window.OPPDATA=${JSON.stringify({ items: [it], built: now }).replace(/</g, "\\u003c")};</script><script src="/heat-economy/funding-core.js?v=${V}"></script><script src="/opportunities/hub-core.js?v=${V}"></script><script src="/opportunities/hub.js?v=${V}"></script>`;
    const desc = `${it.cat_label} at ${it.org_name}. ${it.location}. Deadline: ${H.deadlineLabel(it, now)}. ${it.rel_why}`.slice(0, 300);
    write(`opportunities/${it.id}`, page(`opportunities/${it.id}`, `${it.title} (${it.org_name})`, desc, b, head));
  });
  // feed of open listings, newest first by when Common Shade added them
  const xml = s => escH(s).replace(/'/g, "&apos;");
  const feedItems = open.slice().sort((a, b) => String(b.first_seen || b.check.checked).localeCompare(String(a.first_seen || a.check.checked)));
  const upd = (feedItems[0] && (feedItems[0].first_seen || feedItems[0].check.checked)) || now;
  fs.writeFileSync(path.join(dir, "feed.xml"), `<?xml version="1.0" encoding="utf-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom"><title>Heat Opportunities: Common Shade</title><subtitle>${xml(T.lede)}</subtitle><id>${SITE}/opportunities/</id><link rel="alternate" href="${SITE}/opportunities/"/><link rel="self" href="${SITE}/opportunities/feed.xml"/><updated>${upd}T00:00:00Z</updated>\n${feedItems.map(it => `<entry><title>${xml(it.title)} (${xml(it.org_name)})</title><id>${SITE}/opportunities/${it.id}/</id><link href="${SITE}/opportunities/${it.id}/"/><updated>${(it.first_seen || it.check.checked || now)}T00:00:00Z</updated><summary>${xml(`${it.cat_label}. ${H.REL[it.rel]}. ${it.location}. Deadline: ${H.deadlineLabel(it, null)}. ${it.rel_why}`)}</summary></entry>`).join("\n")}\n</feed>\n`);
  fs.writeFileSync(path.join(dir, "opportunities.json"), JSON.stringify({ about: "Heat Opportunities (Common Shade): every published listing, with its status as of the build. Statuses change with the clock; recompute from deadlines with opportunities/hub-core.js. Read the official listing before applying.", built: now,
    items: all.map(it => Object.assign({}, it, { lifecycle: H.lifecycle(it, now).status, verification: H.verification(it, now).status, url: `${SITE}/opportunities/${it.id}/` })) }, null, 1) + "\n");
  fs.writeFileSync(path.join(dir, "coverage.json"), JSON.stringify({ about: "Coverage of the heat network by the opportunities sweep in the latest review cycle. 'none' means none found in the pages reviewed, not that the organisation has no opportunities anywhere.", cycle: cov.cycle, from: cov.from, to: cov.to, total: cov.total, checked: cov.checked, by: cov.by,
    organisations: cov.rows.map(r => ({ id: r.id, name: r.name, status: r.status, attempted: r.attempted, last_success: r.last_success })) }, null, 1) + "\n");
  console.log(`opportunities: ${main.length} open (direct or related), ${open.length - main.length} network-only, ${arch.length} archived, ${all.length} pages; coverage ${cov.checked}/${cov.total} checked`);
  return { open: main.length, all: all.length, coverage: cov };
};

// ---------- llms-full.txt ----------
module.exports.md = function md() {
  const now = today(), all = items(), cov = coverage();
  const line = it => `- ${it.title}, ${it.org_name} (${it.cat_label}; ${H.REL[it.rel]}). ${it.location}. ${H.lifecycle(it, now).label}; deadline: ${H.deadlineLabel(it, null)}. ${SITE}/opportunities/${it.id}/`;
  return [`## Heat Opportunities`, "", T.lede, "", `${SITE}/opportunities/ · feed ${SITE}/opportunities/feed.xml · data ${SITE}/opportunities/opportunities.json · coverage ${SITE}/opportunities/coverage.json`, "",
    `Coverage: checked ${cov.checked} of ${cov.total} heat network organisations in review cycle ${cov.cycle || "not started"}. ${T.coverage.none}`, "",
    "Open (direct or related heat relevance):", ...all.filter(i => !H.isArchived(i, now) && i.rel !== "network").map(line), "",
    "Open at heat-network organisations (no verified heat-specific duties):", ...all.filter(i => !H.isArchived(i, now) && i.rel === "network").map(line), "",
    "Rules:", ...T.rules.map(r => `- ${r}`), ""].join("\n");
};

// ---------- context on other pages ----------
module.exports.context = function context() {
  const now = today(), all = items().filter(it => !H.isArchived(it, now) && it.rel !== "network"), cities = CITY();
  const block = (label, list, more) => `\n  <!--op-ctx--><section class="container hub" aria-label="Heat opportunities"><p class="hub-p"><b>${escH(label)}</b> ${list.slice(0, 4).map(it => `<a href="/opportunities/${escH(it.id)}/">${escH(it.title)}</a> (${escH(it.org_name)}; ${escH(H.deadlineLabel(it, now).replace(/ \(.*\)$/, ""))})`).join("; ")}${list.length > 4 ? `; and ${list.length - 4} more` : ""}. <a href="/opportunities/${more}">Heat Opportunities <span aria-hidden="true">→</span></a></p></section><!--/op-ctx-->`;
  const put = (rel, html) => { const f = path.join(ROOT, rel); if (!fs.existsSync(f)) return; let s = fs.readFileSync(f, "utf8").replace(/\n?\s*<!--op-ctx-->[\s\S]*?<!--\/op-ctx-->/, ""); const at = s.lastIndexOf("</main>"); if (at < 0) return;
    if (html) s = s.slice(0, at).replace(/\s*$/, "") + html + "\n  " + s.slice(at); fs.writeFileSync(f, s); };
  Object.keys(cities).forEach(c => { const l = all.filter(it => it.cities.includes(c)); put(`cities/${c}/index.html`, l.length ? block(`Open heat opportunities connected to ${cities[c].name}:`, l, `?city=${c}`) : ""); });
  Object.entries(COUNTRY_PAGE).forEach(([code, slug]) => { const l = all.filter(it => it.countries.includes(code)); put(`countries/${slug}/index.html`, l.length ? block(`Open heat opportunities in ${cname(code)}:`, l, `?country=${code}`) : ""); });
  const topicFiles = {}; Object.entries(TOPIC_PAGES).forEach(([t, pages]) => pages.forEach(([u]) => { (topicFiles[u] = topicFiles[u] || new Set()).add(t); }));
  Object.entries(topicFiles).forEach(([u, ts]) => { const l = all.filter(it => it.themes.some(t => ts.has(t))); const t = [...ts][0]; put(`${u.replace(/^\/|\/$/g, "")}/index.html`, l.length ? block(`Open heat opportunities on this topic:`, l, `?theme=${t}`) : ""); });
};
module.exports.items = items;
module.exports.coverage = coverage;
