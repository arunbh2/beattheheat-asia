// Common Shade: the heat network finder on /heat-network/ ("Organisations working on extreme heat").
//   body()     the page's list, its filter form, the Markdown for llms-full.txt and the spreadsheet rows. Called by
//              tools/build-static.js, which owns the page shell, so the address, title and crumbs do not move.
//   context()  one "Organisations working here" line on each country and city page, and nothing else. Called by
//              tools/build-pages.js once those pages exist. Lines sit between <!--hn-ctx--> markers, safe to run again.
// Data: data/core/ORGANISATIONS.json (who, what, link, actions), ORG_SIDE (part played) and the build-only ORG_FACETS
// (place, kind, link check), which research/2026-11/heat-network/apply.js writes. Words and filter rules come from
// heat-network/network-core.js, shared with the page script and tools/check-heat-network.js.
// The page lists every organisation with no JavaScript; the script only narrows the list. Nothing is ranked or scored.
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), N = require("../heat-network/network-core.js");
const TEXT = {
  inclusion: "Inclusion describes relevant published work. It does not imply partnership, affiliation or endorsement.",
  how: "Choose a place, an action, a part played or a kind of organisation to narrow the list. A place is where the listed work is, as each listing describes it; it is not where an organisation has its office. The list shows what this site has found so far, so a short list for a place describes this list, not that place.",
  linkNote: d => `Every link was opened by an automated check on ${d}. A listing says so where its link did not answer, where the site turned the check away, or where the link opens only a homepage.`
};
const DATE = d => { const [y, m, dd] = d.split("-").map(Number); return `${dd} ${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][m - 1]} ${y}`; };

function load(D) {
  const F = Object.assign({}, require("./data-blocks.js")()).ORG_FACETS;
  if (!F) throw new Error("heat network: data/core/ORG_FACETS.json is missing. Run node research/2026-11/heat-network/apply.js");
  const none = D.ORGANISATIONS.filter(o => !F[o.id]).map(o => o.id);
  if (none.length) throw new Error("heat network: no facets for " + none.join(", ") + ". Run node research/2026-11/heat-network/apply.js");
  return F;
}
const linkTag = f => f.linkStatus === "blocked" ? "Link not confirmed: the site turned the check away" : f.linkStatus === "fail" ? "Link did not answer the last check" : f.link === "home" ? "Link opens the homepage only" : f.link === "third" ? "Link opens a page by someone else" : "";
const lastCheck = F => DATE(Object.values(F).map(f => f.checked || "").sort().pop());

function body({ D, esc, ext, V }) {
  const F = load(D), sideOf = id => D.ORG_SIDES.find(x => x.id === D.ORG_SIDE[id]) || {};
  const lever = Object.fromEntries(D.LEVERS.map(v => [v.id, v.title]));
  const sidesIntro = `Each organisation is marked with its main side in a heat alliance. ${D.ORG_SIDES.map(x => `${x.name}: ${x.text}`).join(" ")} Many play more than one part; this is the main one.`;
  const usedLevers = D.LEVERS.filter(v => D.ORGANISATIONS.some(o => (o.levers || []).includes(v.id))).sort((a, b) => a.title.localeCompare(b.title));
  const usedTypes = N.TYPES.filter(([k]) => Object.values(F).some(f => f.type === k));
  const opt = (v, w) => `<option value="${esc(v)}">${esc(w)}</option>`;
  const form = `<form id="hn-form" class="hn-form" role="search" aria-label="Narrow the list of organisations" hidden>
    <label class="hn-field">Place <select name="country"><option value="">Any place</option><optgroup label="South and Southeast Asia">${N.REGION.map(c => opt(c[0], c[1])).join("")}</optgroup><optgroup label="Wider">${N.PLACE_EXTRA.map(c => opt(c[0], c[1])).join("")}</optgroup></select></label>
    <label class="hn-field">Action <select name="action"><option value="">Any action</option>${usedLevers.map(v => opt(v.id, v.title)).join("")}</select></label>
    <label class="hn-field">Part played <select name="part"><option value="">Any part</option>${D.ORG_SIDES.map(x => opt(x.id, x.name)).join("")}</select></label>
    <label class="hn-field">Kind of organisation <select name="type"><option value="">Any kind</option>${usedTypes.map(t => opt(t[0], t[1])).join("")}</select></label>
    <label class="hn-field hn-field--q">Search names and descriptions <input type="search" name="q" maxlength="80" autocomplete="off" enterkeyhint="search"></label>
    <button type="button" class="hn-btn" id="hn-clear">Clear filters</button>
  </form>
  <p id="hn-count" class="hn-count" role="status" aria-live="polite"></p>
  <div id="hn-note"></div>`;
  let h = `<link rel="stylesheet" href="/heat-network/network.css?v=${V}">
  <p>${esc(TEXT.how)}</p>
  ${form}
  <details class="hn-read"><summary>How to read a listing</summary>
    <p>${esc(sidesIntro)}</p>
    <p>${esc(TEXT.linkNote(lastCheck(F)))}</p></details>
  <p class="meta"><a href="/heat-network/heat-network.csv" download>Download the whole list as a spreadsheet (CSV)</a>. Something missing or out of date? <a href="/join/">Tell us</a> or see <a href="/corrections/">corrections</a>.</p>
  <div id="hn-list">`;
  const m = [sidesIntro, TEXT.how, TEXT.linkNote(lastCheck(F))];
  D.ORG_ROLES.forEach(r => {
    const os = D.ORGANISATIONS.filter(o => o.role === r.id); if (!os.length) return;
    h += `<section class="hn-group"><h2 id="${r.id}">${esc(r.name)}</h2><ul class="hn-cards">${os.map(o => {
      const f = F[o.id], side = sideOf(o.id), acts = (o.levers || []).filter(l => lever[l]);
      const tag = linkTag(f);
      return `<li class="hn-card" id="org-${esc(o.id)}" data-c="${f.countries.join(" ")}" data-s="${f.scale}" data-p="${esc(side.id || "")}" data-t="${f.type}" data-l="${acts.join(" ")}">${ext(o.url, o.name)} <span class="meta">(${esc(side.name || "")})</span>: ${esc(o.does)}
        <span class="hn-tags"><span>${esc(N.TYPE[f.type])}</span><span>${esc(N.placeWords(f))}</span>${tag ? `<span class="hn-tag--link">${esc(tag)}</span>` : ""}</span>${acts.length ? `
        <span class="hn-acts">Works on: ${acts.map(l => `<a href="/actions/#${esc(l)}">${esc(lever[l])}</a>`).join(", ")}</span>` : ""}</li>`; }).join("")}</ul></section>`;
    m.push(`### ${r.name}`, ...os.map(o => { const f = F[o.id]; return `- ${o.name} (${sideOf(o.id).name}; ${N.TYPE[f.type]}; ${N.placeWords(f)}): ${o.does} (${o.url})`; }));
  });
  h += `</div>
  <script src="/heat-network/network-core.js?v=${V}" defer></script>
  <script src="/heat-network/network.js?v=${V}" defer></script>`;
  const roleName = id => (D.ORG_ROLES.find(r => r.id === id) || {}).name || "";
  const rows = [["Organisation", "Side", "Group on the site", "Kind of organisation", "Countries of the listed work", "Scale of the listed work", "What it does", "Levers it works on", "Link", "What the link shows", "Link last answered a check"],
    ...D.ORGANISATIONS.map(o => { const f = F[o.id]; return [o.name, sideOf(o.id).name || "", roleName(o.role), N.TYPE[f.type], f.countries.map(c => N.COUNTRY[c]).join("; "), N.SCALE[f.scale], o.does, (o.levers || []).map(l => lever[l]).filter(Boolean).join("; "), o.url,
      { work: "A page about the work", home: "The organisation's homepage", third: "A page by someone else" }[f.link], f.checked || (f.linkStatus === "blocked" ? "site turned the check away" : "did not answer")]; })];
  const csv = "﻿" + rows.map(r => r.map(N.csvCell).join(",")).join("\r\n") + "\r\n";
  return { h, m, csv };
}

// "Organisations working here": country and city pages point into the finder with their place already chosen
function context({ D, esc }) {
  const F = load(D), has = c => Object.values(F).some(f => f.countries.includes(c));
  const CODE = { Singapore: "SG", Thailand: "TH", Vietnam: "VN", "Viet Nam": "VN", Philippines: "PH", Indonesia: "ID", India: "IN", Bangladesh: "BD", Nepal: "NP", "Sri Lanka": "LK", Cambodia: "KH" };
  const COUNTRY_PAGES = { bangladesh: "BD", india: "IN", indonesia: "ID", nepal: "NP", philippines: "PH", "sri-lanka": "LK", thailand: "TH" };
  const list = [...Object.entries(COUNTRY_PAGES).map(([s, c]) => [`countries/${s}`, c]), ...D.LIVE_CITIES.filter(c => CODE[c.country]).map(c => [`cities/${c.id}`, CODE[c.country]])];
  const missing = [];
  for (const [slug, code] of list) {
    const f = path.join(ROOT, slug, "index.html"); if (!fs.existsSync(f)) { missing.push(slug); continue; }
    let s = fs.readFileSync(f, "utf8").replace(/\n?\s*<!--hn-ctx-->[\s\S]*?<!--\/hn-ctx-->/, "");
    const at = s.lastIndexOf("</main>"); if (at < 0 || !has(code)) { if (at < 0) missing.push(slug); fs.writeFileSync(f, s); continue; }
    const block = `\n  <!--hn-ctx--><section class="container hub" aria-label="Organisations working here"><p class="hub-p"><b>Who is already working here.</b> Organisations whose listed heat work is in ${esc(N.COUNTRY[code])}, by the part each plays. <a href="/heat-network/${N.toQuery(Object.assign(N.emptyState(), { country: code }))}">The heat network <span aria-hidden="true">→</span></a></p></section><!--/hn-ctx-->`;
    fs.writeFileSync(f, s.slice(0, at).replace(/\s*$/, "") + block + "\n  " + s.slice(at));
  }
  if (missing.length) console.warn(`heat network: no page to link from at ${missing.join(", ")}`);
}
module.exports = { body, context, TEXT };
