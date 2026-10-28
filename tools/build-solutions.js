#!/usr/bin/env node
/* Common Shade: builds the solutions library (/solutions/) and the country snapshots (/countries/…) from the research
   in research/2026-10/ (passive, active and policy-and-finance libraries, the synthesis, and four country snapshots).
   Every outside link is checked first on GitHub (tools/check-links.js); research/2026-10/link-status.json records the
   result, and anything whose only source failed is left out. Evidence keeps the site's six labels.
   Run by tools/build-static.js, or alone: node tools/build-solutions.js */
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, ".."), R = path.join(ROOT, "research", "2026-10"), SITE = "https://beattheheat.asia";
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, "data.js"), "utf8") + ";Object.assign(this,{EVIDENCE_STATUS,INSTITUTIONS,LEVERS,ACTION_SETTINGS,LOOPS})", ctx);
const D = ctx, J = f => JSON.parse(fs.readFileSync(path.join(R, f), "utf8"));
const STATUS = fs.existsSync(path.join(R, "link-status.json")) ? J("link-status.json") : {};
const live = u => !!u && STATUS[u] !== "FAIL";
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const T = x => x == null ? "" : typeof x === "string" ? x : x.text || x.result || x.risk || x.logic || "";
const ext = (u, l) => live(u) ? `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(l || u)}<span class="visually-hidden"> (opens in a new tab)</span>&nbsp;<span aria-hidden="true">↗</span></a>` : "";
const RANK = ["evaluated", "measured", "guidance", "reported", "test", "concept"];
const tag = s => D.EVIDENCE_STATUS[s] ? `<span class="ev-tag ev-tag--${s}" title="${esc(D.EVIDENCE_STATUS[s].text)}">${esc(D.EVIDENCE_STATUS[s].name)}</span>` : "";
const inst = id => (D.INSTITUTIONS.find(i => i.id === id) || {}).name || id;
const setting = id => (D.ACTION_SETTINGS.find(s => s.id === id) || {}).name || id;
const lever = id => { const l = D.LEVERS.find(x => x.id === id); return l ? (l.name || l.title || id) : id; };
const ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%2316202B'/%3E%3Cpath d='M5 14 Q16 4 27 14' fill='none' stroke='%23F26430' stroke-width='4.5' stroke-linecap='round'/%3E%3Cpath d='M9 13 V27 M23 13 V27' stroke='%23F6E7D7' stroke-width='2.6' stroke-linecap='round'/%3E%3C/svg%3E";
const V = (fs.readFileSync(path.join(ROOT, "index.html"), "utf8").match(/styles\.css\?v=(\d+)/) || [, "1"])[1];
const FOOT_CLOSE = (fs.readFileSync(path.join(ROOT, "practical", "index.html"), "utf8").match(/  <aside class="foot-close"[\s\S]*?<\/aside>\n/) || [""])[0];
const NAV = `<nav aria-label="Elsewhere on the site"><a href="/#explore">The map</a><a href="/practical/">Practical actions</a><a href="/plan/">Plan a response</a><a href="/news/">Heat in the news</a><a href="/join/">Help build Common Shade</a></nav>`;
const page = ({ slug, title, desc, body, script = "" }) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)} · Common Shade</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="theme-color" content="#16202B">
  <link rel="canonical" href="${SITE}/${slug}/">
  <link rel="license" href="https://creativecommons.org/licenses/by/4.0/">
  <meta property="og:type" content="website"><meta property="og:site_name" content="Common Shade">
  <meta property="og:url" content="${SITE}/${slug}/"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
  <meta property="og:image" content="${SITE}/images/social-share-cs.jpg"><meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${ICON}">
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap">
  <link rel="stylesheet" href="/styles.css?v=${V}">
</head>
<body data-page="${slug.replace(/\//g, "-")}">
  <a class="skip-link" href="#main">Skip to the content</a>
  <header class="wkp-top"><div class="container wkp-top__in">
    <a class="wkp-home" href="/"><span class="wordmark__mark" aria-hidden="true"></span>COMMON SHADE<span class="visually-hidden">: back to the map</span></a>
    ${NAV}
  </div></header>
  <main id="main" tabindex="-1">${body}</main>
${FOOT_CLOSE}  <footer class="wkp-foot"><div class="container">
    <p>From a structured rapid evidence map compiled in October 2026, not an exhaustive systematic review. Listing a solution, programme or organisation does not imply endorsement, partnership or ranking. Every source links to its publisher; links that failed our check are left out. Text: <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0<span class="visually-hidden"> (opens in a new tab)</span></a>. <a href="/sources/">All sources</a> · <a href="/">Back to the map</a></p>
  </div></footer>
${script}</body>
</html>
`;

const SNAPS = [["bangladesh", "Bangladesh"], ["nepal", "Nepal"], ["sri_lanka", "Sri Lanka"], ["thailand", "Thailand"], ["indonesia", "Indonesia"]].map(([file, name]) => ({ slug: file.replace(/_/g, "-"), name, d: J(`${file}_snapshot.json`) }));
/* ---------------- the solutions library ---------------- */
const LIBS = [
  { type: "passive", label: "Passive cooling", file: "passive_solutions.json", key: "passive_solutions", h: "Passive cooling", p: "Ways to keep heat out or let it escape with little or no energy: roofs, shade, walls, air flow, trees, water and design." },
  { type: "active", label: "Active cooling", file: "active_solutions.json", key: "active_solutions", h: "Active and system cooling", p: "Fans, coolers, air conditioning, cooling at scale, power during heat, and the rules that shape them. Each notes its energy, refrigerant and what happens in a power cut." },
  { type: "policy", label: "Plans, work and money", file: "policy_and_finance_solutions.json", key: "policy_and_finance_solutions", h: "Plans, work, money, health and communities", p: "The non-physical measures that make protection happen and last: plans and warnings, work rules, money that arrives in time, health services, schools and community action." }
];
const famName = f => String(f || "").replace(/_/g, " ").replace(/\b(\w)/, c => c.toUpperCase());
const climates = s => { const c = (s && s.climates) || (typeof s === "string" ? (/both/i.test(s) ? ["hot-dry", "hot-humid"] : /humid/i.test(s) ? ["hot-humid"] : /dry/i.test(s) ? ["hot-dry"] : []) : []); return c; };
const climLabel = c => c.length === 2 ? "Dry and humid heat" : c[0] === "hot-humid" ? "Humid heat" : c[0] === "hot-dry" ? "Dry heat" : "";
const srcMap = rec => { const m = {}; (Array.isArray(rec.sources) ? rec.sources : []).forEach(s => { if (s && s.url) { m[s.url] = s.label || s.url; if (s.id) m["#" + s.id] = s; } }); return m; };
const srcList = (rec, urls) => { const m = srcMap(rec); return (urls || []).map(u => typeof u === "string" ? ext(u, m[u] || u.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]) : u && u.url ? ext(u.url, u.label || m[u.url]) : "").filter(Boolean).join(" · "); };
const money = (o, unit) => o == null ? "" : typeof o === "object" ? (o.min === o.max || o.max == null ? `${o.min}` : `${o.min}–${o.max}`) + (o.unit || unit ? ` ${o.unit || unit}` : "") : String(o);
function costHTML(c) {
  if (!c) return "";
  const parts = ["upfront", "running", "upkeep"].filter(k => c[k]).map(k => {
    const usd = c.usd && c.usd[k] ? ` (about US$${money(c.usd[k])}${c.usd.unit ? `, ${String(c.usd.unit).split(";")[0].replace(/^USD\s*/, "")}` : ""})` : "";
    return `<li><b>${k[0].toUpperCase() + k.slice(1)}:</b> ${esc(money(c[k]))}${esc(usd)}${c[k].basis ? `. <span class="sol-note">${esc(c[k].basis)}</span>` : ""}</li>`;
  });
  const note = c.note || "";
  if (!parts.length) return note ? `<p class="sol-note">${esc(note)}</p>` : "";
  const src = c.source && c.source.url ? ext(c.source.url, c.source.label) : "";
  return `<ul class="sol-cost">${parts.join("")}</ul><p class="sol-note">${c.year ? `Prices from ${esc(c.year)}. ` : ""}${esc(note)} ${src}</p>`;
}
const field = (label, html) => html && String(html).trim() ? `<div class="sol-f"><h4>${esc(label)}</h4>${html}</div>` : "";
// paragraphs carry no links of their own; each card lists its sources once, at the end
const para = (rec, x) => { const t = T(x); return t ? `<p>${esc(t)}</p>` : ""; };
function cardSources(rec, shown) {
  const seen = new Map(), already = new Set((shown.match(/href="([^"]+)"/g) || []).map(x => x.slice(6, -1).replace(/&amp;/g, "&")));
  (Array.isArray(rec.sources) ? rec.sources : []).forEach(x => { if (x && x.url && live(x.url) && !seen.has(x.url) && !already.has(x.url)) seen.set(x.url, x.label || x.url); });
  return [...seen].map(([u, l]) => `<li>${ext(u, l)}</li>`).join("");
}
function effects(rec) {
  return (rec.effect || []).filter(e => e && T(e) && (!e.source || live(e.source.url))).slice(0, 3).map(e =>
    `<li><span class="sol-basis">${esc(String(e.basis || "").replace(/_/g, " "))}</span> ${esc(T(e))}${e.place ? ` <span class="sol-note">${esc(e.place)}${e.date ? `, ${esc(e.date)}` : ""}${e.sample ? `. ${esc(e.sample)}` : ""}.</span>` : ""}${e.limitations ? ` <span class="sol-note">Limits: ${esc(e.limitations)}</span>` : ""} ${e.source ? `<span class="sol-src">${ext(e.source.url, e.source.label)}</span>` : ""}</li>`).join("");
}
function evidence(rec) {
  return (rec.evidence || []).filter(e => e && e.source && live(e.source.url)).map(e => `<li>${tag(e.status)} ${esc(e.text)} <span class="sol-src">${ext(e.source.url, e.source.label)}</span></li>`).join("");
}
function examples(rec) {
  const m = srcMap(rec);
  return (rec.examples || []).map(x => { const s = x.source || (x.source_id && m["#" + x.source_id]); if (!s || !live(s.url)) return "";
    return `<li>${tag(x.status)} <b>${esc(x.place || "")}${x.date ? `, ${esc(x.date)}` : ""}.</b> ${esc(x.description || T(x))}${x.scale && !/^See source/i.test(x.scale) ? ` <span class="sol-note">${esc(x.scale)}</span>` : ""} <span class="sol-src">${ext(s.url, s.label)}</span></li>`; }).filter(Boolean).slice(0, 3).join("");
}
const listOrText = (rec, x) => Array.isArray(x) ? `<ul>${x.map(i => `<li>${esc(T(i) || i.place && `${i.place}: ${i.basis || i.source || i.owner || ""}` || "")}</li>`).join("")}</ul>` : para(rec, x);
function policyBits(rec) {
  const own = rec.institutional_owner && rec.institutional_owner.example_owners ? `<ul>${rec.institutional_owner.example_owners.map(o => `<li><b>${esc(o.place)}:</b> ${esc(o.owner)}</li>`).join("")}</ul>` : listOrText(rec, rec.institutional_owner);
  const reach = rec.reach ? `<p>${esc(rec.reach.intended_or_documented || T(rec.reach))}</p>${(rec.reach.who_may_be_missed || []).length ? `<p class="sol-note">Who may be missed: ${esc(rec.reach.who_may_be_missed.join("; "))}.</p>` : ""}` : "";
  return field("Who owns it", own) + field("Legal basis", listOrText(rec, rec.legal_basis)) + field("Where the money comes from", listOrText(rec, rec.money_source)) +
    field("What sets it off", rec.trigger ? `<p>${esc(T(rec.trigger))}</p>` : "") + field("Who it reaches", reach);
}
function activeBits(rec) {
  return field("Energy", para(rec, rec.energy)) + field("Refrigerant and emissions", para(rec, rec.emissions_and_refrigerant)) +
    field("In a power cut", para(rec, rec.grid_dependence)) + field("The cooling-trap risk", rec.cooling_trap ? `<p>${esc(rec.cooling_trap.risk || T(rec.cooling_trap))}${rec.cooling_trap.mitigation ? ` <span class="sol-note">What helps: ${esc(rec.cooling_trap.mitigation)}</span>` : ""}</p>` : "") +
    field("For the poorest", para(rec, rec.affordability_for_poorest));
}
function card(rec, lib) {
  const ev = evidence(rec), ex = examples(rec), ef = effects(rec);
  const statuses = [...(rec.evidence || []).filter(e => e.source && live(e.source.url)).map(e => e.status), ...(rec.examples || []).map(e => e.status)];
  if (!ev && !ex && !ef) return null;                         // nothing verifiable left: leave it out
  const best = RANK.find(s => statuses.includes(s)) || "";
  const cl = climates(rec.suits), mech = T(rec.mechanism);
  const settings = (rec.settings || []).filter(s => D.ACTION_SETTINGS.some(x => x.id === s));
  const q = [rec.name, famName(rec.family), mech, ...settings.map(setting), ...(rec.levers || []).map(lever)].join(" ").toLowerCase();
  const u = rec.uncertainty || {};
  return { best, html: `<details class="sol" id="${esc(rec.id)}" data-type="${lib.type}" data-settings="${esc(settings.join(" "))}" data-clim="${esc(cl.join(" "))}" data-best="${best}" data-q="${esc(q)}">
      <summary><span class="sol-h">${esc(rec.name)}</span><span class="sol-tags"><span class="sol-type sol-type--${lib.type}">${esc(lib.label)}</span>${climLabel(cl) ? `<span class="sol-clim">${esc(climLabel(cl))}</span>` : ""}${tag(best)}</span><span class="sol-sum">${esc(mech.split(/(?<=\.)\s/)[0])}</span></summary>
      <div class="sol-body">
        ${field("How it works", para(rec, rec.mechanism))}
        ${field("Dry or humid heat", rec.suits ? `<p><b>${esc(climLabel(cl) || "")}</b>${climLabel(cl) ? ". " : ""}${esc(rec.suits.reason || (typeof rec.suits === "string" ? rec.suits : ""))}</p>` : "")}
        ${field("What it has done", ef ? `<ul class="sol-ul">${ef}</ul>` : "")}
        ${lib.type === "active" ? activeBits(rec) : ""}${lib.type === "policy" ? policyBits(rec) : ""}
        ${field("What makes it work", para(rec, rec.works_if))}
        ${field("What could stop it", para(rec, rec.stops_it))}
        ${field("Rough cost", costHTML(rec.cost))}
        ${field("Upkeep", para(rec, rec.lifespan_and_upkeep))}
        ${field("Who acts", (rec.who_acts || []).length ? `<p>${esc(rec.who_acts.map(inst).join(", "))}. <span class="sol-note">Suggested, not commitments.</span></p>` : "")}
        ${field("Who pays", para(rec, rec.who_pays))}
        ${field("Fairness and risks", para(rec, rec.equity_and_risks))}
        ${field("Where it has been tried", ex ? `<ul class="sol-ul">${ex}</ul>` : "")}
        ${field("Evidence", ev ? `<ul class="sol-ul">${ev}</ul>` : "")}
        ${field("Moving it elsewhere", para(rec, rec.transferability))}
        ${(src => src ? `<div class="sol-f"><h4>Other sources</h4><ul class="sol-srcs">${src}</ul></div>` : "")(cardSources(rec, ev + ex + ef))}
        ${u.known || u.uncertain ? `<div class="sol-f sol-kiu"><h4>Known, inferred, uncertain</h4><p><b>Known:</b> ${esc(u.known || "")}</p>${u.inferred ? `<p><b>Inferred:</b> ${esc(u.inferred)}</p>` : ""}<p><b>Uncertain:</b> ${esc(u.uncertain || "")}</p></div>` : ""}
        ${settings.length ? `<p class="sol-go">Related practical actions: ${settings.map(s => `<a href="/practical/#practical-${s}">${esc(setting(s))}</a>`).join(" · ")}</p>` : ""}
      </div>
    </details>` };
}
const E = J("common_shade_module_e.json");
const libs = LIBS.map(l => ({ ...l, recs: J(l.file)[l.key].map(r => card(r, l)).filter(Boolean) }));
const counts = Object.fromEntries(libs.map(l => [l.type, l.recs.length])), total = libs.reduce((t, l) => t + l.recs.length, 0);
const nameById = Object.fromEntries(LIBS.flatMap(l => J(l.file)[l.key].map(r => [r.id, r.name])));
const pkgs = (E.packages || []).map(p => `<article class="sol-pkg"><p class="sol-tags">${tag(p.package_status)}${(p.settings || []).map(s => `<span class="sol-clim">${esc(setting(s))}</span>`).join("")}</p>
      <h3>${esc(p.name)}</h3>
      <ol>${(p.sequence || []).map(s => `<li>${esc(s.action)}</li>`).join("")}</ol>
      <p class="sol-note">Made of: ${(p.module_component_ids || []).filter(id => nameById[id]).map(id => `<a href="#${esc(id)}" data-open>${esc(nameById[id])}</a>`).join(" · ")}</p>
      <p class="sol-note">${esc(p.package_status_explanation || "")}</p></article>`).join("");
const spots = (E.blind_spots || []).map(b => `<li><b>${esc(b.name)}.</b> ${esc(b.what_to_measure || b.inferred || "")} ${(b.evidence || []).filter(e => live(e.source && e.source.url)).map(e => `<span class="sol-src">${tag(e.status)} ${ext(e.source.url, e.source.label)}</span>`).join(" ")}</li>`).join("");
const inno = (E.innovations || []).map(i => `<li>${tag(i.status)} <b>${esc(i.name)}</b>${i.date ? ` (${esc(i.date)})` : ""}. ${esc(i.stage_verified || "")} <span class="sol-note">Watch for: ${esc(i.watch_for || "")}</span> ${(i.evidence || []).filter(e => live(e.source && e.source.url)).map(e => `<span class="sol-src">${ext(e.source.url, e.source.label)}</span>`).join(" ")}</li>`).join("");
const settingOpts = D.ACTION_SETTINGS.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join("");
const body = `
    <section class="sol-page">
      <div class="container has-spot">
        <svg class="spot spot--practical" viewBox="0 0 260 160" aria-hidden="true" focusable="false"><g fill="none" stroke="#16202B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M10 150 H250" opacity=".4"/><path d="M40 150 V40 M220 150 V40"/><path d="M40 44 L220 64 L120 90 Z" fill="#F26430" stroke="#F26430" opacity=".9"/><circle cx="80" cy="82" r="8"/><path d="M80 90 V120 L71 150 M80 120 L89 150 M80 98 L58 74 M80 98 L93 114"/><circle cx="170" cy="82" r="8"/><path d="M170 90 V120 L161 150 M170 120 L179 150 M170 98 L183 112 M170 98 L160 116"/></g></svg>
        <p class="eyebrow eyebrow--break">Solutions library</p>
        <h1 class="h2 tool-h1">${total} ways to protect people <br>from heat, and what each needs.</h1>
        <p class="tool-lede">Passive cooling, active cooling, and the plans, rules and money that make protection last, gathered from around the world with a focus on South and Southeast Asia. Each one says how it works, whether it suits dry or humid heat, what it has done, what it costs, who acts and what could stop it.</p>
        <p class="sol-caveat"><b>How to read this.</b> It is a rapid evidence map, not a ranking. The label on each solution is the strongest kind of evidence we found for it, not a score. A label describes the evidence, not how good the solution is. Most solutions have not been independently evaluated for health or income effects; each one says what is known, what is inferred and what is uncertain.</p>
        <div class="sol-bar" role="search">
          <label class="sol-search"><span>Search</span><input id="sol-q" type="search" autocomplete="off" placeholder="For example: roof, fan, insurance, school"></label>
          <div class="sol-types" role="group" aria-label="Kind of solution"><button type="button" data-type="" aria-pressed="true">All <span>${total}</span></button>${libs.map(l => `<button type="button" data-type="${l.type}" aria-pressed="false">${esc(l.label)} <span>${counts[l.type]}</span></button>`).join("")}</div>
          <label><span>Setting</span><select id="sol-set"><option value="">Any setting</option>${settingOpts}</select></label>
          <label><span>Heat</span><select id="sol-clim"><option value="">Dry or humid</option><option value="hot-dry">Suits dry heat</option><option value="hot-humid">Suits humid heat</option></select></label>
          <label><span>Evidence</span><select id="sol-ev"><option value="">Any evidence</option><option value="strong">Measured or independently evaluated</option></select></label>
          <p class="sol-count" id="sol-count" role="status" aria-live="polite">${total} solutions</p>
        </div>
${libs.map(l => `        <section class="sol-group" id="${l.type}" aria-labelledby="${l.type}-h">
          <h2 id="${l.type}-h" class="sol-gh">${esc(l.h)} <span>${counts[l.type]}</span></h2>
          <p class="sol-gp">${esc(l.p)}</p>
          ${l.recs.map(r => r.html).join("\n          ")}
        </section>`).join("\n")}
        <p class="sol-none" id="sol-none" hidden>No solution matches. Try fewer filters.</p>
        <section class="sol-group" id="packages" aria-labelledby="packages-h">
          <h2 id="packages-h" class="sol-gh">Combinations that work together</h2>
          <p class="sol-gp">No single measure protects people on its own. These are proposed combinations, by setting, in the order they are usually put in place. They are designs to test, not proven packages.</p>
          <div class="sol-pkgs">${pkgs}</div>
        </section>
        <section class="sol-group" id="blind-spots" aria-labelledby="blind-h">
          <h2 id="blind-h" class="sol-gh">Blind spots</h2>
          <p class="sol-gp">Harms that are rarely counted, and what to measure so they are not missed.</p>
          <ul class="sol-list">${spots}</ul>
        </section>
        <section class="sol-group" id="watch" aria-labelledby="watch-h">
          <h2 id="watch-h" class="sol-gh">Worth watching</h2>
          <p class="sol-gp">New ideas, labelled honestly by how far they have got.</p>
          <ul class="sol-list">${inno}</ul>
        </section>
        <p class="tool-alt">Country snapshots: ${COUNTRIES_LINKS()} · <a href="/sources/">All sources</a> · <a href="/practical/">Practical actions</a></p>
      </div>
    </section>`;
function COUNTRIES_LINKS() { return SNAPS.map(s => `<a href="/countries/${s.slug}/">${esc(s.name)}</a>`).join(" · "); }
const script = `  <script>
  (function () {
    var q = document.getElementById("sol-q"), set = document.getElementById("sol-set"), clim = document.getElementById("sol-clim"), ev = document.getElementById("sol-ev");
    var cards = [].slice.call(document.querySelectorAll(".sol")), groups = [].slice.call(document.querySelectorAll(".sol-group[id='passive'],.sol-group[id='active'],.sol-group[id='policy']"));
    var types = [].slice.call(document.querySelectorAll(".sol-types button")), type = "", count = document.getElementById("sol-count"), none = document.getElementById("sol-none"), total = cards.length;
    function run() {
      var words = q.value.toLowerCase().split(/\\s+/).filter(Boolean), shown = 0;
      cards.forEach(function (c) { var d = c.dataset;
        var ok = (!type || d.type === type) && (!set.value || (" " + d.settings + " ").indexOf(" " + set.value + " ") >= 0) && (!clim.value || d.clim.indexOf(clim.value) >= 0) &&
          (!ev.value || d.best === "measured" || d.best === "evaluated") && words.every(function (w) { return d.q.indexOf(w) >= 0; });
        c.hidden = !ok; if (ok) shown++; });
      groups.forEach(function (g) { g.hidden = !g.querySelector(".sol:not([hidden])"); });
      count.textContent = shown === total ? total + " solutions" : shown + " of " + total + " solutions"; none.hidden = shown > 0;
    }
    types.forEach(function (b) { b.addEventListener("click", function () { type = b.dataset.type; types.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); run(); }); });
    [q, set, clim, ev].forEach(function (el) { el.addEventListener("input", run); el.addEventListener("change", run); });
    function openHash() { var id = decodeURIComponent(location.hash.slice(1)), el = id && document.getElementById(id); if (el && el.tagName === "DETAILS") { el.open = true; el.scrollIntoView({ block: "start" }); } }
    document.addEventListener("click", function (e) { var a = e.target.closest && e.target.closest("a[data-open]"); if (a) setTimeout(openHash, 0); });
    window.addEventListener("hashchange", openHash); openHash();
  })();
  </script>
`;

/* ---------------- country snapshots ---------------- */
// The snapshots come from separate research runs and name their sections differently, so they are drawn by a general
// renderer: every section is shown with a readable heading, sources are resolved to their titles, and empty or
// technical fields (ids, codes, dates of checking, taxonomy tags) are left out.
const SKIP = /^(id|iso2|iso3|iso|country|aliases|research_date|last_checked|systems|levers|loops|settings|mapping_status|mapping_note|city_selection|national_exposure_rank|publisher_actor_id|actor_ids|programme_ids|source_ids|national_framework_source_ids|institution_types|cooling_option_places|related_source_ids|url_kind|contribution_is|commitment_status|result_basis)$/;
const LABEL = { heat_context: "Heat context", plans_and_law: "Plans and law", plans_and_legal_basis: "Plans and legal basis", plans: "Plans", official_heat_plans: "Official heat plans", official_heat_plan: "Official heat plan", heat_plan_status: "Heat plan",
  legal_basis: "Legal basis", legal_status: "Legal status", legal_character: "Legal standing", responsibilities: "Who is responsible", agencies_responsible: "Agencies responsible", agencies_documented: "Agencies documented", agencies_to_engage_proposed: "Agencies to engage (proposed)",
  warnings: "Warnings", warning_systems: "Warnings", occupational_rules: "Rules for heat at work", occupational_heat_rules: "Rules for heat at work", cooling: "Cooling and buildings", cooling_building_policy: "Cooling and buildings", cooling_and_building_policy: "Cooling and buildings",
  cooling_design_proposals: "Cooling design ideas (proposed)", finance_mechanisms: "Money for protection", finance: "Money for protection", local_finance_status: "Local finance", cost: "Costs", costs: "Costs", costing_next_step: "Costing: next step",
  equity_and_maladaptation: "Fairness and maladaptation risks", gaps: "Gaps in what we found", key_gaps: "Gaps in what we found", gaps_in_evidence_collected: "Gaps in what we found",
  entry_points: "Ways to help (proposed)", collaboration_entry_points_proposed: "Ways to help (proposed)", entry_point: "A place to start (proposed)", entry_point_proposed: "A place to start (proposed)",
  uncertainty: "Known, inferred, uncertain", known: "Known", inferred: "Inferred", uncertain: "Uncertain", scope: "Scope", evidence: "Evidence", sources: "Sources", basis: "Basis", note: "Note", design_tradeoffs_to_assess_proposed: "Trade-offs to assess (proposed)" };
const ORDER = ["heat_context", "plans_and_law", "plans_and_legal_basis", "plans", "official_heat_plans", "official_heat_plan", "heat_plan_status", "legal_basis", "responsibilities", "agencies_responsible", "agencies_documented", "warnings", "warning_systems",
  "occupational_rules", "occupational_heat_rules", "cooling", "cooling_building_policy", "cooling_and_building_policy", "cooling_design_proposals", "finance_mechanisms", "finance", "local_finance_status", "cost", "costs", "costing_next_step",
  "equity_and_maladaptation", "gaps", "key_gaps", "gaps_in_evidence_collected", "entry_points", "collaboration_entry_points_proposed", "entry_point", "entry_point_proposed", "uncertainty", "known", "inferred", "uncertain"];
const pretty = k => LABEL[k] || (k.charAt(0).toUpperCase() + k.slice(1)).replace(/_/g, " ").replace(/\bbdt\b/i, "BDT").replace(/\busd\b/i, "USD").replace(/\bwbgt\b/i, "WBGT");
const orderKeys = o => Object.keys(o).filter(k => !SKIP.test(k)).sort((x, y) => (ORDER.indexOf(x) + 1 || 999) - (ORDER.indexOf(y) + 1 || 999));
function countryPage(s) {
  const d = s.d, c = d.country, srcIdx = {}; (d.sources || []).forEach(x => { srcIdx[x.id] = x; });
  const isRef = o => o && typeof o === "object" && !Array.isArray(o) && (o.url || (o.id && srcIdx[o.id])) && Object.keys(o).length <= 6 && !o.text && !o.name && !o.proposal;
  const refLink = o => { const x = srcIdx[o.id] || o; return live(x.url) ? ext(x.url, x.title || x.label || o.label || o.id || "source") : ""; };
  const refsOf = arr => arr.map(x => typeof x === "string" ? (srcIdx[x] ? refLink({ id: x }) : /^https?:/.test(x) ? ext(x, x.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]) : "") : isRef(x) ? refLink(x) : "").filter(Boolean);
  const empty = v => v == null || v === "" || (Array.isArray(v) && !v.length) || (typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length);
  function val(v, depth) {
    if (empty(v)) return "";
    if (typeof v === "boolean" || typeof v === "number") return depth ? `<span>${esc(v)}</span>` : "";
    if (typeof v === "string") return `<span>${esc(v)}</span>`;
    if (Array.isArray(v)) {
      if (v.every(x => typeof x === "string" && !srcIdx[x] && !/^https?:/.test(x))) return `<ul>${v.map(x => `<li>${esc(x)}</li>`).join("")}</ul>`;
      const refs = refsOf(v); if (refs.length && refs.length === v.length) return `<span class="sol-src">${refs.join(" · ")}</span>`;
      return `<ul class="sol-list">${v.map(x => isRef(x) ? `<li class="sol-src">${refLink(x)}</li>` : typeof x === "object" ? `<li>${obj(x, depth + 1)}</li>` : `<li>${esc(x)}</li>`).join("")}</ul>`;
    }
    if (isRef(v)) return `<span class="sol-src">${refLink(v)}</span>`;
    return obj(v, depth + 1);
  }
  function obj(o, depth) {
    const head = o.name || o.instrument || o.proposal || o.title || "";
    const st = o.status && D.EVIDENCE_STATUS[o.status] ? tag(o.status) + " " : "";
    const parts = orderKeys(o).filter(k => !["name", "instrument", "proposal", "title", "status", "url"].includes(k)).map(k => {
      const h = val(o[k], depth); if (!h) return "";
      if (/^(sources|evidence|basis)$/.test(k) && /sol-src/.test(h) && !/<ul/.test(h)) return h;
      if (k === "text") return `<span>${h}</span>`;
      return `<span class="cty-kv"><b>${esc(pretty(k))}:</b> ${h}</span>`;
    }).filter(Boolean);
    const url = o.url && live(o.url) && head ? ext(o.url, head) : "";
    return `${st}${head ? `<b>${url || esc(head)}</b>${parts.length ? " " : ""}` : ""}${parts.join(" ")}`;
  }
  const section = (k, v) => { const h = val(v, 0); return h ? `<section class="cty-s" id="${k}"><h2>${esc(pretty(k))}</h2><div class="cty-v">${h}</div></section>` : ""; };
  const blocks = orderKeys(c).filter(k => !/^(name|known|inferred|uncertain|scope)$/.test(k)).map(k => section(k, c[k])).filter(Boolean);
  const kiu = (c.known || c.uncertain) ? `<section class="cty-s"><h2>Overall</h2><p><b>Known:</b> ${esc(c.known || "")}</p>${c.inferred ? `<p><b>Inferred:</b> ${esc(c.inferred)}</p>` : ""}<p><b>Uncertain:</b> ${esc(c.uncertain || "")}</p></section>` : "";
  const cityKeys = ci => orderKeys(ci).filter(k => k !== "name");
  const cities = (d.cities || []).length ? `<section class="cty-s" id="cities"><h2>Cities</h2><div class="cty-cities">${d.cities.map(ci => `<article class="cty-city"><h3>${esc(ci.name)}</h3>${cityKeys(ci).map(k => { const h = val(ci[k], 1); return h ? `<p><b>${esc(pretty(k))}:</b> ${h}</p>` : ""; }).join("")}</article>`).join("")}</div></section>` : "";
  const progs = (d.programmes || []).map(p => `<li>${obj(p, 1)}</li>`).filter(x => x !== "<li></li>").join("");
  const actors = (d.actors || []).filter(a => live(a.url)).map(a => `<li><b>${ext(a.url, a.name)}</b> <span>${esc(a.does || "")}</span></li>`).join("");
  const all = [...blocks, cities, progs ? `<section class="cty-s" id="programmes"><h2>Programmes</h2><ul class="sol-list">${progs}</ul></section>` : "",
    actors ? `<section class="cty-s" id="actors"><h2>Who is working on it</h2><p class="sol-note">Listing does not imply partnership, endorsement or ranking.</p><ul class="cty-actors">${actors}</ul></section>` : "", kiu].filter(Boolean);
  const jump = all.map(b => { const m = b.match(/id="([^"]+)"><h2>(.*?)<\/h2>/); return m ? `<a href="#${m[1]}">${m[2]}</a>` : ""; }).filter(Boolean).join(" · ");
  const body = `
    <section class="sol-page cty">
      <div class="container">
        <p class="eyebrow eyebrow--break">Country snapshot</p>
        <h1 class="h2 tool-h1">${esc(s.name)}</h1>
        <p class="tool-lede">Heat, the plans and rules that shape protection, the organisations at work, and where a shared effort could help. Researched in October 2026.</p>
        <p class="sol-caveat"><b>How to read this.</b> Facts link to their sources; anything marked proposed or inferred is the researchers’ suggestion, not a commitment by anyone named. Gaps are gaps in what we found, not faults.</p>
        <nav class="sol-jump" aria-label="On this page">${jump}</nav>
        ${all.join("\n        ")}
        <p class="tool-alt">Other snapshots: ${SNAPS.filter(x => x !== s).map(x => `<a href="/countries/${x.slug}/">${esc(x.name)}</a>`).join(" · ")} · <a href="/solutions/">Solutions library</a></p>
      </div>
    </section>`;
  return page({ slug: `countries/${s.slug}`, title: `${s.name}: heat country snapshot`, desc: `Extreme heat in ${s.name}: plans, warnings, rules at work, cooling, money for protection, cities, programmes and who is working on it.`, body });
}

fs.mkdirSync(path.join(ROOT, "solutions"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "solutions", "index.html"), page({ slug: "solutions", title: "Solutions library", desc: `${total} ways to protect people from extreme heat: passive cooling, active cooling, and the plans, rules and money that make it last, with evidence, costs and what each depends on.`, body, script }));
SNAPS.forEach(s => { fs.mkdirSync(path.join(ROOT, "countries", s.slug), { recursive: true }); fs.writeFileSync(path.join(ROOT, "countries", s.slug, "index.html"), countryPage(s)); });
fs.mkdirSync(path.join(ROOT, "countries"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "countries", "index.html"), page({ slug: "countries", title: "Country snapshots", desc: "Heat country snapshots for Bangladesh, Nepal, Sri Lanka, Thailand and Indonesia.", body: `
    <section class="sol-page"><div class="container"><p class="eyebrow eyebrow--break">Country snapshots</p><h1 class="h2 tool-h1">Heat, country by country.</h1>
      <p class="tool-lede">Plans and law, warnings, rules at work, cooling, money, cities, programmes and who is working on it. Researched in October 2026.</p>
      <ul class="cty-index">${SNAPS.map(s => `<li><a href="/countries/${s.slug}/"><b>${esc(s.name)}</b><span>${(s.d.cities || []).map(c => c.name).join(", ")}</span></a></li>`).join("")}</ul>
      <p class="tool-alt"><a href="/solutions/">Solutions library</a> · <a href="/sources/">All sources</a></p></div></section>` }));
console.log(`solutions: ${total} (${Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(", ")}), ${SNAPS.length} country snapshots${Object.keys(STATUS).length ? "" : " (no link-status.json yet: all links kept)"}`);
