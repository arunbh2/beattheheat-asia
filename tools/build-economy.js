#!/usr/bin/env node
/* Common Shade: builds "The heat economy" (/heat-economy/ and four sub-pages) from the October 2026 research in
   research/2026-10/economy/: market segments (G1), businesses (G2), investors and deals (G3), support programmes (G4),
   business ideas loop by loop (G5) and market conditions (G6). The words readers see first come from the plain-language
   layer in tools/economy-plain.js; the research's own wording goes to the CSV downloads, for specialists.
   Every outside link is checked first on GitHub (tools/check-links.js); research/2026-10/link-status.json records the
   result, and links that failed are left out. Amounts of different kinds are never added together.
   Run by tools/build-static.js, or alone: node tools/build-economy.js */
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, ".."), R = path.join(ROOT, "research", "2026-10"), E = path.join(R, "economy"), SITE = "https://beattheheat.asia";
const PL = require("./economy-plain.js");
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, "data.js"), "utf8") + ";Object.assign(this,{EVIDENCE_STATUS,INSTITUTIONS,LEVERS,LOOPS,LOOP_GROUPS,ACTION_SETTINGS})", ctx);
const D = ctx, J = f => JSON.parse(fs.readFileSync(path.join(E, f), "utf8"));
const STATUS = fs.existsSync(path.join(R, "link-status.json")) ? JSON.parse(fs.readFileSync(path.join(R, "link-status.json"), "utf8")) : {};
const live = u => !!u && /^https?:/.test(u) && STATUS[u] !== "FAIL" && !/^https?:\/\/(www\.)?beattheheat\.asia/.test(u);
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const ext = (u, l) => live(u) ? `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(l || u)}<span class="visually-hidden"> (opens in a new tab)</span>&nbsp;<span aria-hidden="true">↗</span></a>` : "";
const loopById = Object.fromEntries(D.LOOPS.map(l => [l.id, l]));
const loopLinks = ids => `<span class="he-breaks">${(ids || []).filter(id => loopById[id]).map(id => `<a href="/#loop-${id}">${esc(loopById[id].name)}</a>`).join(" · ")}</span>`;
const inst = id => (D.INSTITUTIONS.find(i => i.id === id) || {}).name || id;
const has = v => v != null && v !== "" && !(Array.isArray(v) && !v.length);
const f = (h, body) => has(body) ? `<div class="sol-f${h === "Can help break" ? " sol-f--break" : ""}"><h4>${esc(h)}</h4>${body}</div>` : "";
const p = t => has(t) ? `<p>${esc(t)}</p>` : "";
const ul = a => (a || []).filter(has).length ? `<ul class="sol-ul">${a.filter(has).map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : "";
const COUNTRY = { AE: "United Arab Emirates", AL: "Albania", AR: "Argentina", AU: "Australia", BD: "Bangladesh", CH: "Switzerland", CN: "China", CR: "Costa Rica", DE: "Germany", DJ: "Djibouti", FR: "France", GB: "United Kingdom", GH: "Ghana", HK: "Hong Kong", ID: "Indonesia", IN: "India", JP: "Japan", KE: "Kenya", KH: "Cambodia", LK: "Sri Lanka", LU: "Luxembourg", MA: "Morocco", MG: "Madagascar", MK: "North Macedonia", MW: "Malawi", MX: "Mexico", MY: "Malaysia", NA: "Namibia", NG: "Nigeria", NP: "Nepal", PA: "Panama", PH: "Philippines", PK: "Pakistan", SC: "Seychelles", SE: "Sweden", SG: "Singapore", SO: "Somalia", ST: "São Tomé and Príncipe", SV: "El Salvador", TH: "Thailand", TN: "Tunisia", TZ: "Tanzania", UG: "Uganda", US: "United States", VN: "Vietnam", ZA: "South Africa", ZM: "Zambia", ZW: "Zimbabwe" };
const ASIA = new Set(["IN", "BD", "PK", "NP", "LK", "TH", "ID", "PH", "VN", "KH", "MY", "SG", "MM", "LA", "BT", "MV", "TL", "BN"]);
const cname = c => COUNTRY[c] || c || "";
const usd = n => { const x = Number(n); if (!isFinite(x) || !n) return ""; return x >= 1e9 ? `US$${(x / 1e9).toFixed(2)} billion` : x >= 1e6 ? `US$${(x / 1e6).toFixed(1)} million` : `US$${Math.round(x).toLocaleString("en-GB")}`; };

// ---- the research ----
const SEG = J("segments.json"), BIZ = J("businesses.json"), INV = J("investors.json"), DEALS = J("deals.json"), PROG = J("programmes.json"),
  OPP = J("opportunities.json"), COND = J("conditions.json"), FLOWS = J("flows.json");
const plainSeg = id => PL.segments[id] || {};
// research text shown to readers: drop the researchers' checking notes after a semicolon, and use everyday words
const NOTE = /verif|inferred|establish|not assumed|background|historical|not audited|not treated|not proof|not a |no fixed amount/i;
const tidy = t => { if (!has(t)) return ""; let x = String(t).split(/;\s+/).filter((c, i) => i === 0 || !NOTE.test(c)).join("; ").replace(/,\s*with verified[^.;]*/i, "");
  PL.words.forEach(([re, w]) => { x = x.replace(re, m => m[0] === m[0].toUpperCase() && w[0] !== w[0].toUpperCase() ? w[0].toUpperCase() + w.slice(1) : w); }); return x.trim(); };
const first = t => has(t) ? tidy(String(t).split(/;\s+/)[0]) : "";
const segName = id => id === "multi-segment-cooling" ? "Several kinds of cooling" : plainSeg(id).name || (SEG.find(s => s.id === id) || {}).name || id || "";
const bizBySeg = id => BIZ.filter(b => b.segment === id).length;
const inAsia = b => (b.countries || []).concat(b.hq_country || []).some(c => ASIA.has(c));
const N = { biz: BIZ.length, bizAsia: BIZ.filter(inAsia).length, inv: INV.length, deals: DEALS.length, prog: PROG.length, opp: OPP.length,
  oppPublic: OPP.filter(o => o.viable_market === "with-public-money").length, oppYes: OPP.filter(o => o.viable_market === "yes").length };
const KIND = { startup: "Start-up", sme: "Small or medium business", "social-enterprise": "Social enterprise", cooperative: "Co-operative", "corporate-line": "Established company" };
const VIABLE = { yes: ["Customers could pay", "yes"], "with-public-money": ["Needs public or shared funding", "public"], no: ["Public action, not a business", "no"] };
const DSTATUS = { announced: "Announced", closed: "Confirmed", disbursed: "Paid out", unclear: "Not clear" };
const INSTR = { "mandate/project contribution": "Project funding", equity: "Shares (equity)", debt: "Loan", grant: "Grant", convertible: "Convertible loan", guarantee: "Guarantee", prize: "Prize", "insurance-capital": "Insurance capital", "results-based": "Payment for results" };
const INVTYPE = { vc: "Venture capital fund", impact: "Impact investor", cvc: "Company investment arm", dfi: "Development finance institution", mdb: "Development bank", "climate-fund": "Climate fund", "adaptation-fund": "Adaptation fund", "blended-facility": "Blended finance fund", philanthropy: "Foundation", "family-office": "Family office", "risk-capital": "Insurance and risk capital", "public-innovation": "Public innovation fund" };
const PROGTYPE = { prize: "Prize", challenge: "Challenge", accelerator: "Accelerator", incubator: "Incubator", "city-programme": "City programme", "corporate-call": "Company open call", university: "University programme", "philanthropic-fund": "Foundation fund" };
const SUITS = { both: "Works in dry and humid heat", "hot-dry": "Best in dry heat", "hot-humid": "Suited to humid heat" };

// ---- page template (as the solutions library) ----
const ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%2316202B'/%3E%3Cpath d='M5 14 Q16 4 27 14' fill='none' stroke='%23F26430' stroke-width='4.5' stroke-linecap='round'/%3E%3Cpath d='M9 13 V27 M23 13 V27' stroke='%23F6E7D7' stroke-width='2.6' stroke-linecap='round'/%3E%3C/svg%3E";
const V = (fs.readFileSync(path.join(ROOT, "index.html"), "utf8").match(/styles\.css\?v=(\d+)/) || [, "1"])[1];
const NAV = `<nav aria-label="Elsewhere on the site"><a href="/#explore">The map</a><a href="/practical/">Practical actions</a><a href="/solutions/">Solutions</a><a href="/plan/">Plan a response</a><a href="/news/">Heat in the news</a><a href="/join/">Help build Common Shade</a></nav>`;
const PAGES = [["", "Start here"], ["businesses", "Businesses"], ["flows", "Follow the money"], ["money", "Funding and support"], ["opportunities", "Ideas"], ["conditions", "Questions to ask"]];
const subnav = cur => `<nav class="he-sub" aria-label="The heat economy">${PAGES.map(([s, n]) => `<a href="/heat-economy/${s ? s + "/" : ""}"${s === cur ? ' aria-current="page"' : ""}>${esc(n)}</a>`).join("")}</nav>`;
const ABOUT = `<p class="sol-caveat he-about"><b>About this section.</b> We gathered this from public websites and reports in October 2026. Being listed does not mean we recommend, partner with or rank anyone, and none of it is financial advice. Companies describe their own products; we have not tested them, so please check details with them directly. If something is missing or out of date, <a href="/join/">tell us</a>.</p>`;
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
  <footer class="wkp-foot"><div class="container">
    <p>Gathered from public sources in October 2026. Being listed does not imply endorsement, partnership or ranking, and nothing here is financial advice. Every source links to its publisher; links that no longer work are left out. Text: <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0<span class="visually-hidden"> (opens in a new tab)</span></a>. <a href="/sources/">All sources</a> · <a href="/heat-economy/#data">Download the data</a></p>
  </div></footer>
${script}</body>
</html>
`;
const shell = (cur, eyebrow, h1, lede, inner) => `
    <section class="sol-page he">
      <div class="container">
        ${subnav(cur)}
        <p class="eyebrow">${esc(eyebrow)}</p>
        <h1 class="h2 tool-h1">${h1}</h1>
        <p class="tool-lede">${lede}</p>
        ${ABOUT}
        ${inner}
      </div>
    </section>`;
// one filter script for every card list: search, selects and checkboxes over data-* attributes; a #id opens its card
const FILTER = (count, noun) => `<script>
(function(){var cards=[].slice.call(document.querySelectorAll(".he-card")),ctl=[].slice.call(document.querySelectorAll("[data-filter]")),out=document.getElementById("${count}"),none=document.getElementById("he-none");
function run(){var n=0;cards.forEach(function(c){var ok=ctl.every(function(x){var k=x.getAttribute("data-filter"),v=x.type==="checkbox"?(x.checked?"1":""):x.value.trim().toLowerCase();if(!v)return true;if(k==="q")return (c.getAttribute("data-q")||"").indexOf(v)>-1;return (" "+(c.getAttribute("data-"+k)||"")+" ").indexOf(" "+v+" ")>-1;});c.hidden=!ok;if(ok)n++;});
document.querySelectorAll(".he-group").forEach(function(g){g.hidden=!g.querySelector(".he-card:not([hidden])");});if(out)out.textContent=n+" of "+cards.length+" ${noun}";if(none)none.hidden=n>0;}
ctl.forEach(function(x){x.addEventListener(x.tagName==="INPUT"&&x.type!=="checkbox"?"input":"change",run);});
var q=new URLSearchParams(location.search);ctl.forEach(function(x){var k=x.getAttribute("data-filter");if(q.get(k)){if(x.type==="checkbox")x.checked=true;else x.value=q.get(k);}});run();
function open(){var id=decodeURIComponent(location.hash.slice(1));var el=id&&document.getElementById(id);if(el&&el.tagName==="DETAILS"){el.open=true;el.scrollIntoView();}}open();window.addEventListener("hashchange",open);})();
</script>`;
const sel = (key, label, opts) => `<label><span>${esc(label)}</span><select data-filter="${key}"><option value="">${esc(opts[0])}</option>${opts.slice(1).map(([v, n]) => `<option value="${esc(v)}">${esc(n)}</option>`).join("")}</select></label>`;
const search = ph => `<label class="sol-search"><span>Search</span><input type="search" data-filter="q" autocomplete="off" placeholder="${esc(ph)}"></label>`;
const qtext = (...a) => esc(a.flat().filter(Boolean).join(" ").toLowerCase());
const go = (href, text) => `<a href="${href}">${esc(text)}&nbsp;<span aria-hidden="true">→</span></a>`;

// ================= 1. START HERE =================
const AUDIENCES = [
  ["For city and local governments", [
    [go("/heat-economy/conditions/", "Questions to ask before you buy anything"), "Does it work here, is it fair, and who keeps it working?"],
    [go("/heat-economy/opportunities/?viable=public", "Services you could commission"), "Cooler schools, shared cool rooms, ready-to-go summer contracts, trees that are kept alive."],
    [go("/heat-economy/businesses/", "Find suppliers by type of protection"), "Cool roofs, fans, shade, water, cold storage and more."],
    [go("/heat-economy/conditions/#rules", "Rules that have helped elsewhere"), "Labels, building rules, heat-at-work rules and bulk buying."]]],
  ["For worker organisations and community groups", [
    [go("/heat-economy/conditions/#q-fair", "Is it fair? Seven questions to ask"), "About cost, rent, paid rest, unpaid work, access and data."],
    [go("/heat-economy/opportunities/#g5-poverty-paidrest", "Ideas that put workers and communities first"), "Paid rest at work, worker-run income support, shared cool rooms, upgrades that let residents stay."],
    [go("/heat-economy/businesses/?segment=heat-insurance", "How heat insurance works"), "And what to ask before joining a scheme."],
    [go("/join/", "Tell us what works where you are"), "Your experience helps others choose well."]]],
  ["For funders and investors", [
    [go("/heat-economy/opportunities/?viable=public", "Ideas that need public or shared funding"), "Where grants, guarantees and patient money can do the most."],
    [go("/heat-economy/money/", "Funding we could trace so far"), "Who has funded what, and how to read funding news."],
    [go("/heat-economy/money/#programmes", "Accelerators, prizes and challenges"), "Programmes already finding and backing ventures."],
    [go("/heat-economy/conditions/#q-risk", "Who pays, and who carries the risk?"), "Four questions to ask before backing a product or service."]]],
  ["For people starting or growing a business", [
    [go("/heat-economy/opportunities/?viable=yes", "Ideas customers could pay for"), "Servicing co-operatives, cooling as a service, paid-rest services for employers, and more."],
    [go("/heat-economy/money/#programmes", "Where to find support"), "Accelerators, prizes and challenges, and what each offers."],
    [go("/heat-economy/businesses/", "Who is already doing it"), "Learn from businesses near you."],
    [go("/heat-economy/conditions/#paying", "Ways customers can pay, and common obstacles"), "Pay as you go, repaying through the bill, paying for cooling rather than the machine."]]]];
const FOUND = [
  [`${N.biz}`, "businesses already offer protection from heat", `${N.bizAsia} of them work in South or Southeast Asia, from cool roofs and efficient fans to cold storage, heat sensors and heat insurance.`, "/heat-economy/businesses/"],
  ["Most", "of the funding we could trace has a clear buyer", "It went to cooling equipment, cold storage, shared cooling networks and heat data, where someone pays for a product or a contract.", "/heat-economy/money/"],
  [`${N.oppPublic} of ${N.opp}`, "ideas need public or shared funding", "To reach the people who need them most: paid rest, cool rooms, care for heat illness, warnings that reach everyone.", "/heat-economy/opportunities/"],
  ["1", "big open question", "Who ends up using these products? Published information rarely says whether they reach families on the lowest incomes. It is the most useful thing to ask any supplier, and to share.", "/heat-economy/conditions/#q-fair"]];
const segCard = s => { const pl = plainSeg(s.id); const n = bizBySeg(s.id);
  return `<article class="he-seg" id="seg-${esc(s.id)}">
      <h3>${esc(pl.name || s.name)}</h3>
      <p>${esc(pl.what || s.definition)}</p>
      <p class="he-k"><b>Usually paid for by:</b> ${esc(pl.pays || s.who_pays)}</p>
      ${(pl.check || []).length ? `<p class="he-k"><b>Three things to check</b></p><ul class="he-checklist">${pl.check.map(c => `<li>${esc(c)}</li>`).join("")}</ul>` : ""}
      ${(s.loops || []).length ? `<p class="he-k he-small he-breakline"><b>Can help break:</b> ${loopLinks(s.loops)}</p>` : ""}
      <p class="he-go">${n ? go(`/heat-economy/businesses/?segment=${esc(s.id)}`, `${n} ${n === 1 ? "business" : "businesses"} offering this`) : "No business found yet. Know one? <a href=\"/join/\">Tell us</a>."}</p>
    </article>`; };
const flow = `<figure class="he-flow" aria-labelledby="he-flow-cap">
      <figcaption id="he-flow-cap" class="he-flow__cap">Who needs protection, who connects, who supplies</figcaption>
      <div class="he-lanes">
        <div class="he-lane he-lane--demand"><p class="he-lane__h">Who needs protection</p>
          <p>Residents, workers, farmers, pupils and patients.</p>
          <p>And those responsible for them: employers, cities, landlords, schools and health services.</p>
          <p class="he-gap">The people who need protection are often not the ones who pay for it.</p></div>
        <div class="he-lane he-lane--platform"><p class="he-lane__h">Who connects them</p>
          <ul><li>Worker and community organisations</li><li>Weather services and researchers</li><li>Rules and inspection</li><li>Buying and project preparation</li><li>Funders and finance</li></ul></div>
        <div class="he-lane he-lane--supply"><p class="he-lane__h">Who supplies protection</p>
          ${PL.shelves.map(([n, ids]) => `<p><b>${esc(n)}:</b> ${ids.map(id => `<a href="#seg-${id}">${esc(segName(id))}</a>`).join(" · ")}</p>`).join("")}</div>
      </div>
      <div class="he-money">
        <p class="he-lane__h">Four kinds of money</p>
        <ul><li><b>Customers’ payments</b> buy products, services and upkeep.</li><li><b>Loans and investment</b> pay for equipment or businesses that can earn the money back.</li><li><b>Public budgets, grants and subsidies</b> pay for public services and help people who can’t pay.</li><li><b>Insurance premiums</b> buy cover that pays out under agreed conditions.</li></ul>
      </div>
      <div class="he-outcome"><p><b>What counts is protection people can actually use:</b> they can reach it, afford it and use it safely, and it keeps working.</p>
        <p class="he-nopayer"><b>Some protection needs public or shared funding.</b> Shade in public places, paid rest for informal workers, care for people who can’t pay, and warnings that reach everyone. These are paid for through public budgets, social protection, grants and buying together.</p></div>
    </figure>`;
const dataFiles = [["businesses", "Businesses"], ["investors", "Funders and investors"], ["deals", "Funding we traced"], ["programmes", "Accelerators, prizes and challenges"], ["opportunities", "Ideas, cycle by cycle"], ["segments", "Kinds of protection"]];
const overview = shell("", "The heat economy", "Businesses, funding and ideas <br>that protect people from heat.",
  `Who already offers protection from heat, who funds it, which new businesses and services could help, and what to ask before you buy, fund or start something.`,
  `<section class="he-start" aria-labelledby="start-h"><h2 id="start-h" class="he-start__h">Start here</h2>
          <div class="he-aud">${AUDIENCES.map(([h, items]) => `<article class="he-aud__card"><h3>${esc(h)}</h3><ul>${items.map(([a, t]) => `<li>${a}<span>${esc(t)}</span></li>`).join("")}</ul></article>`).join("")}</div></section>
        <section class="cty-s" id="found"><h2>What we found</h2>
          <div class="he-stats">${FOUND.map(([n, l, t, href]) => `<a class="he-stat" href="${href}"><span class="he-stat__n">${esc(n)}</span><span class="he-stat__l">${esc(l)}</span><span class="he-stat__t">${esc(t)}</span></a>`).join("")}</div>
          <p class="he-intro">The lesson running through all of it: protection works when someone is clearly responsible for buying it, paying for it and keeping it working, and when the people it is for can actually use it.</p></section>
        <section class="cty-s" id="flow"><h2>How the heat economy works</h2>
          <p class="he-intro">Three questions come before any product: who needs protection, who can approve it, and who can pay? They are often different people. A street vendor needs shade, but the city looks after the pavement. A worker needs rest breaks, but the employer sets the schedule.</p>
          ${flow}</section>
        <section class="cty-s" id="segments"><h2>Nineteen kinds of protection, and what to check</h2>
          <p class="he-intro">For each: what it is, who usually pays, and three questions to ask a supplier.</p>
          ${PL.shelves.map(([n, ids]) => `<h3 class="he-shelf">${esc(n)}</h3><div class="he-segs">${ids.map(id => SEG.find(s => s.id === id)).filter(Boolean).map(segCard).join("")}</div>`).join("")}</section>
        <section class="cty-s" id="data"><h2>Download the data</h2>
          <p class="he-intro">Spreadsheets with one row per record, including the researchers’ fuller notes and every source. Free to reuse with a link to Common Shade (CC BY 4.0).</p>
          <ul class="he-dl">${dataFiles.map(([f, n]) => `<li><a href="/heat-economy/data/${f}.csv" download>${esc(n)} (CSV)</a></li>`).join("")}</ul></section>
        <p class="tool-alt"><a href="/solutions/">Solutions library</a> · <a href="/countries/">Country snapshots</a> · <a href="/finance/">Paying for protection</a> · <a href="/heat-network/">The heat network</a></p>`);

// ================= 2. BUSINESSES =================
const bizCard = b => {
  const c = [...new Set((b.countries || []).concat(b.hq_country || []).filter(Boolean))];
  const srcs = [...new Map((b.evidence || []).filter(e => e.source && live(e.source.url)).map(e => [e.source.url, e.source])).values()].slice(0, 3);
  return `<details class="sol he-card" id="${esc(b.id)}" data-segment="${esc(b.segment)}" data-kind="${esc(b.kind)}" data-asia="${inAsia(b) ? "1" : ""}" data-q="${qtext(b.name, b.product, b.customer, b.user, segName(b.segment), c.map(cname))}">
      <summary><span class="sol-h">${esc(b.name)}</span><span class="sol-tags"><span class="sol-clim">${esc(KIND[b.kind] || "")}</span>${c.length ? `<span class="sol-clim">${esc(c.map(cname).slice(0, 4).join(", "))}${c.length > 4 ? " and more" : ""}</span>` : ""}</span><span class="sol-sum">${esc(tidy(b.product))}</span></summary>
      <div class="sol-body">
        ${f("What it offers", p(tidy(b.product)) + (live(b.url) ? `<p>${ext(b.url, "Website")}</p>` : ""))}
        ${f("Who buys it", p(tidy(b.customer)))}
        ${f("Who uses it", p(tidy(b.user)))}
        ${f("Where", p(c.map(cname).join(", ")))}
        ${SUITS[b.suits] ? f("Climate", p(SUITS[b.suits])) : ""}
        ${(b.loops || []).length ? f("Can help break", `<p>${loopLinks(b.loops)}</p>`) : ""}
        ${f("Sources", srcs.length ? `<p class="sol-src">${srcs.map(s => ext(s.url, s.label)).join(" · ")}</p>` : "")}
        <p class="sol-go">Based on the company’s own information. Before buying, see <a href="#q-${esc(b.segment)}">the questions to ask</a> and check details with the company.</p>
      </div>
    </details>`;
};
const segsWithBiz = PL.shelves.flatMap(x => x[1]).filter(id => bizBySeg(id));
const businesses = shell("businesses", "The heat economy · Businesses", `${N.biz} businesses offering <br>protection from heat.`,
  `Start-ups, small businesses, social enterprises and established companies, from cool roofs and efficient fans to cold storage, heat sensors and insurance. ${N.bizAsia} of them work in South or Southeast Asia.`,
  `<div class="sol-bar" role="search">
          ${search("For example: fan, cold room, roof, insurance, India")}
          ${sel("segment", "Kind of protection", ["Any kind", ...segsWithBiz.map(id => [id, `${segName(id)} (${bizBySeg(id)})`])])}
          ${sel("kind", "Type of business", ["Any type", ...Object.entries(KIND).filter(([k]) => BIZ.some(b => b.kind === k))])}
          <label class="he-check"><input type="checkbox" data-filter="asia" value="1"> <span>Works in South or Southeast Asia</span></label>
          <p class="sol-count" id="he-count" role="status" aria-live="polite"></p>
        </div>
        ${segsWithBiz.map(id => { const pl = plainSeg(id); return `<section class="sol-group he-group" aria-labelledby="g-${id}"><h2 class="sol-gh" id="g-${id}">${esc(segName(id))} <span>${bizBySeg(id)}</span></h2>
          <p class="sol-gp">${esc(pl.what || "")}</p>
          ${(pl.check || []).length ? `<div class="he-askbox" id="q-${id}"><b>Ask before buying:</b><ul>${pl.check.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
          ${BIZ.filter(b => b.segment === id).sort((a, b) => a.name.localeCompare(b.name)).map(bizCard).join("\n")}</section>`; }).join("\n")}
        <p class="sol-none" id="he-none" hidden>No business matches. Try fewer filters.</p>
        <p class="tool-alt">Know a business we have missed? <a href="/join/">Tell us</a>. The <a href="/heat-economy/data/businesses.csv" download>spreadsheet</a> has the researchers’ fuller notes on each one.</p>`);

// ================= 3. FUNDING AND SUPPORT =================
const viewName = { "business-project / exact": "Funding for companies and projects", "business-project / maximum": "Funding for companies and projects (‘up to’ amounts)", "credit-facility-limit / exact": "Credit lines", "guarantee-exposure / exact": "Loan guarantees", "mixed-round / exact": "Mixed funding rounds", "public-approved-envelope / exact": "Public programmes approved", "public-cash-transfer / exact": "Public money transferred", "public-programme-budget / exact": "Public programme budgets", "unclassified-instrument / exact": "Other funding" };
const statusCols = ["announced", "closed", "disbursed"];
const views = Object.entries(FLOWS.rollups || {}).map(([k, v]) => [k, v.by_status || {}]).filter(([, v]) => Object.keys(v).length);
const flowTable = `<div class="he-tablewrap" role="region" aria-label="Funding we traced, by kind and status" tabindex="0"><table class="he-table"><caption>Funding we traced, in US dollars. Each row is a different kind of money, so the rows are not added together.</caption>
      <thead><tr><th scope="col">Kind of money</th>${statusCols.map(s => `<th scope="col">${DSTATUS[s]}</th>`).join("")}</tr></thead>
      <tbody>${views.map(([k, v]) => `<tr><th scope="row">${esc(viewName[k] || k)}</th>${statusCols.map(s => `<td>${v[s] ? usd(v[s]) : "<span class=\"he-dash\">none found</span>"}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
const bp = (FLOWS.rollups || {})["business-project / exact"] || {};
const bySeg = Object.entries(bp.by_segment_status || {}).reduce((m, [k, v]) => { const [a, s] = k.split(" | "); (m[a] = m[a] || {})[s] = v; return m; }, {});
const segTable = Object.keys(bySeg).length ? `<div class="he-tablewrap" role="region" aria-label="Company and project funding by kind of protection" tabindex="0"><table class="he-table he-table--sm"><caption>Funding for companies and projects, by kind of protection</caption><thead><tr><th scope="col">Kind of protection</th><th scope="col">Announced</th><th scope="col">Confirmed</th></tr></thead><tbody>${Object.entries(bySeg).map(([a, v]) => `<tr><th scope="row">${esc(segName(a))}</th><td>${v.announced ? usd(v.announced) : "<span class=\"he-dash\">none found</span>"}</td><td>${v.closed ? usd(v.closed) : "<span class=\"he-dash\">none found</span>"}</td></tr>`).join("")}</tbody></table></div>` : "";
const dealById = Object.fromEntries(DEALS.map(d => [d.id, d]));
const bizNameById = Object.fromEntries(BIZ.map(b => [b.id, b.name]));
const recip = d => bizNameById[d.investee] || PL.recipients[d.investee] || String(d.investee || "");
const invCard = i => { const ds = (i.deals || []).map(id => dealById[id]).filter(Boolean);
  return `<details class="sol he-card" id="inv-${esc(i.id)}" data-type="${esc(i.type || "")}" data-q="${qtext(i.name, INVTYPE[i.type], (i.segments || []).map(segName), ds.map(recip))}">
      <summary><span class="sol-h">${esc(i.name)}</span><span class="sol-tags"><span class="sol-clim">${esc(INVTYPE[i.type] || "Funder")}</span>${(i.segments || []).slice(0, 3).map(s => `<span class="sol-clim">${esc(segName(s))}</span>`).join("")}</span>${ds.length ? `<span class="sol-sum">Has funded: ${esc(ds.map(d => `${recip(d)} (${(d.date || "").slice(0, 4)})`).join(", "))}</span>` : ""}</summary>
      <div class="sol-body">
        ${f("Heat-related funding we found", ds.length ? `<ul class="sol-ul">${ds.map(d => `<li><a href="#deal-${esc(d.id)}">${esc(recip(d))}, ${esc((d.date || "").slice(0, 4))}</a>${d.amount && d.amount.usd ? `: ${usd(d.amount.usd)}` : ""} (${esc(DSTATUS[d.status] || "")})</li>`).join("")}</ul>` : `<p>Listed for its stated interest in heat or cooling.</p>`)}
        ${f("Usually provides", p((i.instruments || []).map(x => INSTR[x] || x).join(", ")))}
        ${f("Kinds of protection", p((i.segments || []).map(segName).join(", ")))}
        ${f("Website", live(i.url) ? `<p>${ext(i.url, i.name)}</p>` : "")}
        <p class="sol-go">Check the funder’s own website for what it funds now and how to apply.</p>
      </div>
    </details>`; };
const dealRow = d => `<tr id="deal-${esc(d.id)}"><td>${esc(d.date || "")}</td><th scope="row">${esc(recip(d))}</th><td>${esc((d.investors || []).join("; "))}</td>
      <td>${d.amount && d.amount.usd ? usd(d.amount.usd) : "<span class=\"he-dash\">not published</span>"}${d.amount && d.amount.currency && d.amount.currency !== "USD" && d.amount.local ? `<br><small>${esc(Number(d.amount.local).toLocaleString("en-GB"))} ${esc(d.amount.currency)}</small>` : ""}</td>
      <td>${esc(INSTR[d.instrument] || "Not stated")}</td><td>${esc(DSTATUS[d.status] || "")}</td><td>${esc(segName(d.segment))}</td><td>${esc((d.countries || []).map(cname).join(", "))}</td><td>${d.source && live(d.source.url) ? ext(d.source.url, "Source") : ""}</td></tr>`;
const BUYERS = { yes: "Helps you meet buyers", partly: "Partly helps you meet buyers", no: "Does not focus on buyers", unclear: "" };
const progCard = a => `<details class="sol he-card" id="prog-${esc(a.id)}" data-type="${esc(a.type || "")}" data-q="${qtext(a.name, a.run_by, a.focus, a.geography)}">
      <summary><span class="sol-h">${esc(a.name)}</span><span class="sol-tags"><span class="sol-clim">${esc(PROGTYPE[a.type] || "")}</span>${BUYERS[a.connects_to_buyers] ? `<span class="sol-clim">${esc(BUYERS[a.connects_to_buyers])}</span>` : ""}</span><span class="sol-sum">${esc(tidy(a.focus))}</span></summary>
      <div class="sol-body">
        ${f("Run by", p(tidy(a.run_by)))}
        ${f("What it offers", ul((a.offers || []).map(tidy)))}
        ${f("Heat-related ventures it has supported", (a.heat_ventures || []).length ? `<ul class="sol-ul">${a.heat_ventures.map(h => `<li>${live(h.url) ? ext(h.url, h.name) : esc(h.name)}${/^\d{4}$/.test(String(h.year || "").trim()) ? ` (${esc(String(h.year).trim())})` : ""}</li>`).join("")}</ul>` : "")}
        ${f("Programme page", live(a.url) ? `<p>${ext(a.url, a.name)}</p>` : "")}
        <p class="sol-go">Check the programme’s own page for current rules and deadlines.</p>
      </div>
    </details>`;
const money = shell("money", "The heat economy · Funding and support", "Who funds protection from heat, <br>and who helps new ventures grow.",
  `${N.inv} funders and investors, ${N.deals} pieces of funding we could trace, and ${N.prog} accelerators, prizes and challenges.`,
  `<nav class="sol-jump" aria-label="On this page"><a href="#where">Funding we traced</a> · <a href="#investors">Funders and investors</a> · <a href="#programmes">Accelerators, prizes and challenges</a> · <a href="#deals">Every piece of funding</a></nav>
        <section class="cty-s" id="where"><h2>Funding we traced</h2>
          <div class="he-askbox he-askbox--wide"><b>How to read funding news</b><ul><li><b>Announced</b> is not the same as <b>paid</b>. Money often arrives in stages, or later.</li><li>A company’s funding may pay for more than its heat work.</li><li>Shares, loans, grants and guarantees are different things, so we never add them together.</li></ul></div>
          ${flowTable}
          ${segTable}
          <p class="he-note">Most of the funding we could trace went to cooling equipment, cold storage, shared cooling networks and heat data, where there is a clear buyer for a product or a contract. Services such as paid rest, shared cool rooms and warnings for everyone are usually paid for from public budgets, which this list does not cover. It is a sample of public announcements, not the whole picture.</p></section>
        <section class="cty-s" id="investors"><h2>Funders and investors <span class="he-n">${N.inv}</span></h2>
          <div class="sol-bar" role="search">${search("For example: cold storage, foundation, development bank")}${sel("type", "Kind of funder", ["Any kind", ...Object.entries(INVTYPE).filter(([k]) => INV.some(i => i.type === k))])}<p class="sol-count" id="he-count" role="status" aria-live="polite"></p></div>
          <div class="he-group">${INV.slice().sort((a, b) => a.name.localeCompare(b.name)).map(invCard).join("\n")}</div>
          <p class="sol-none" id="he-none" hidden>No funder matches. Try fewer filters.</p></section>
        <section class="cty-s" id="programmes"><h2>Accelerators, prizes and challenges <span class="he-n">${N.prog}</span></h2>
          <p class="he-intro">Each helps at a different stage: finding new ideas, testing them, a place to try them, meeting buyers, or money to grow. Look for the ones that help you meet buyers: winning a prize does not by itself bring customers.</p>
          <div class="he-group">${PROG.map(progCard).join("\n")}</div></section>
        <section class="cty-s" id="deals"><h2>Every piece of funding we traced <span class="he-n">${N.deals}</span></h2>
          <p class="he-intro">Newest first. Amounts are converted to US dollars; the original currency is shown where different. “Not published” means the amount was not made public.</p>
          <div class="he-tablewrap" role="region" aria-label="Every piece of funding we traced" tabindex="0"><table class="he-table he-table--deals"><caption class="visually-hidden">Funding for heat and cooling</caption><thead><tr><th scope="col">Date</th><th scope="col">Who received it</th><th scope="col">From</th><th scope="col">Amount</th><th scope="col">Type</th><th scope="col">Status</th><th scope="col">Kind of protection</th><th scope="col">Where</th><th scope="col">Source</th></tr></thead>
          <tbody>${DEALS.map(dealRow).join("")}</tbody></table></div></section>`);

// ================= 4. IDEAS =================
// "G3:gef / G4:nature-for-cooling — text": link the funders (G3) and programmes (G4) it names
const fitNames = x => { const m = /^((?:G\d:[\w.-]+\s*(?:\/\s*)?)+)/.exec(x); if (!m) return [];
  return m[1].split("/").map(t => t.trim()).filter(Boolean).map(t => { const [g, id] = t.split(":"); const i = g === "G3" && INV.find(v => v.id === id), a = g === "G4" && PROG.find(v => v.id === id);
    return i ? `<a href="/heat-economy/money/#inv-${esc(id)}">${esc(i.name)}</a>` : a ? `<a href="/heat-economy/money/#prog-${esc(id)}">${esc(a.name)}</a>` : ""; }).filter(Boolean); };
const ideaCard = o => {
  const [vn, vk] = VIABLE[o.viable_market] || ["", ""], pl = PL.ideas[o.id] || [o.name, "", o.who_pays];
  const fits = [...new Set((o.fit_investors || []).flatMap(fitNames))];
  const sims = (o.analogues || []).filter(a => a.source && live(a.source.url)).map(a => ext(a.source.url, a.source.label));
  return `<details class="sol he-card" id="${esc(o.id)}" data-viable="${vk}" data-q="${qtext(pl[0], pl[1], pl[2], (loopById[o.loop] || {}).name)}">
      <summary><span class="sol-h">${esc(pl[0])}</span><span class="sol-tags"><span class="he-viable he-viable--${vk}">${esc(vn)}</span></span><span class="sol-sum">${esc(pl[1])}</span></summary>
      <div class="sol-body">
        ${f("Who could pay", p(pl[2]))}
        ${f("Who it helps", p(first(o.who_benefits)))}
        ${f("Who would need to be on board", ul((o.anchor_demand || []).map(tidy)))}
        ${f("Similar work so far", sims.length ? `<p class="sol-src">${sims.join(" · ")}</p>` : "")}
        ${f("Funders and programmes that could fit", fits.length ? `<p>${fits.join(" · ")}</p>` : "")}
        <details class="he-more"><summary>More detail from the research: what needs to be in place, and risks</summary>
          <p class="sol-note">In the researchers’ own words, which are more technical.</p>
          ${f("What needs to be in place", ul((o.must_be_true || []).map(tidy)))}
          ${f("Risks to watch", p(tidy(o.risks)))}
          <p class="sol-note">Before starting, see the <a href="/heat-economy/conditions/">questions to ask</a>.</p></details>
        <p class="sol-go">An idea to explore and test locally, not a proven model. <a href="/#loop-${esc(o.loop)}">See the cycle it helps break</a>.</p>
      </div>
    </details>`;
};
const opportunities = shell("opportunities", "The heat economy · Ideas", "Ideas for businesses and services, <br>cycle by cycle.",
  `${N.opp} ideas for new businesses and services, one or more for each of the 21 vicious cycles on the map. Each says who could pay, who it helps and what needs to be in place. They are ideas to explore and test, not proven models.`,
  `<p class="he-note"><b>What they have in common.</b> The strongest ideas sell protection that is <b>looked after over time</b>, not just a product. ${N.oppYes} could be paid for by customers. ${N.oppPublic} need public or shared funding to reach the people who need them most, and many of those could still be run by local businesses, co-operatives or community groups on contract.</p>
        <div class="sol-bar" role="search">${search("For example: trees, clinic, paid rest, school")}${sel("viable", "Who could pay", ["Any", ["yes", "Customers could pay"], ["public", "Needs public or shared funding"], ["no", "Public action, not a business"]])}<p class="sol-count" id="he-count" role="status" aria-live="polite"></p></div>
        ${D.LOOP_GROUPS.map(g => { const ls = D.LOOPS.filter(l => l.group === g.id && OPP.some(o => o.loop === l.id)); return ls.length ? `<h2 class="he-shelf he-shelf--big">${esc(g.name)}</h2>${ls.map(l => `<section class="sol-group he-group" id="loop-${l.id}" aria-labelledby="h-${l.id}"><h3 class="sol-gh" id="h-${l.id}"><a href="/#loop-${l.id}">${esc(l.name)}</a></h3><p class="sol-gp">${esc(l.summary)}</p>
          ${OPP.filter(o => o.loop === l.id).map(ideaCard).join("\n")}</section>`).join("\n")}` : ""; }).join("\n")}
        <p class="sol-none" id="he-none" hidden>No idea matches. Try fewer filters.</p>
        <p class="tool-alt">Have an idea, or already doing one of these? <a href="/join/">Tell us</a>.</p>`);

// ================= 5. QUESTIONS TO ASK =================
const C = COND, srcOf = (list, id) => ((list.find(x => x.id === id) || {}).sources || []).filter(s => live(s.url)).slice(0, 2).map(s => ext(s.url, s.label)).join(" · ");
const QIDS = ["q-work", "q-fair", "q-upkeep", "q-risk"];
const conditions = shell("conditions", "The heat economy · Questions to ask", "Questions to ask <br>before you buy, fund or start.",
  `For city officers, employers, worker and community organisations, funders, investors and founders: twenty-four questions, the rules and ways of paying that have helped elsewhere, the common obstacles, and what each kind of organisation could do.`,
  `<nav class="sol-jump" aria-label="On this page">${PL.questions.map(([h], i) => `<a href="#${QIDS[i]}">${esc(h)}</a>`).join(" · ")} · <a href="#rules">Rules that help</a> · <a href="#paying">Ways to pay</a> · <a href="#obstacles">Common obstacles</a> · <a href="#roles">Who could do what</a></nav>
        ${PL.questions.map(([h, qs], i) => `<section class="cty-s" id="${QIDS[i]}"><h2>${esc(h)}</h2><ol class="he-checks" start="${PL.questions.slice(0, i).reduce((n, g) => n + g[1].length, 1)}">${qs.map(([, q, a]) => `<li><b>${esc(q)}</b><span>${esc(a)}</span></li>`).join("")}</ol></section>`).join("")}
        <section class="cty-s" id="rules"><h2>Rules that have helped create demand</h2><p class="he-intro">Examples from Asia. A rule on paper helps most when it is checked and followed.</p>
          <ul class="he-list">${(C.policies || []).map(x => `<li>${esc(PL.policies[x.id] || x.name)} <span class="sol-src">${srcOf(C.policies, x.id)}</span></li>`).join("")}</ul></section>
        <section class="cty-s" id="paying"><h2>Ways customers can pay</h2><p class="he-intro">Each can lower the cost of getting started. Check the total cost, and what happens in a bad month, before choosing one.</p>
          <ul class="he-list">${(C.finance_structures || []).map(x => { const pl = PL.finance[x.id] || [x.name, ""]; return `<li><b>${esc(pl[0])}.</b> ${esc(pl[1])} <span class="sol-src">${srcOf(C.finance_structures, x.id)}</span></li>`; }).join("")}</ul></section>
        <section class="cty-s" id="obstacles"><h2>Common obstacles</h2>
          <ul class="he-list">${(C.barriers || []).map(x => `<li>${esc(PL.barriers[x.id] || x.name)} <span class="sol-src">${srcOf(C.barriers, x.id)}</span></li>`).join("")}</ul></section>
        <section class="cty-s" id="roles"><h2>What each kind of organisation could do</h2><p class="he-intro">Suggestions to discuss, not commitments.</p>
          <div class="he-roles">${(C.actor_roles || []).map(x => `<article class="he-role"><h3>${esc(inst(x.institution_type))}</h3>${ul(PL.roles[x.institution_type] || x.suggestions)}</article>`).join("")}</div></section>
        <p class="tool-alt">Print this page and take it to your next meeting, or <a href="/heat-economy/">go back to the start</a>.</p>`);

// ---- Follow the money: every piece of traced funding, from who gives it to the cycles it could help break ----
// Four stages: who funds (kind) → how (instrument) → what it builds (kind of protection) → cycles. A piece of funding
// linked to several cycles is shared equally between them. Counts by default: the amounts are of different kinds
// (rounds, approved envelopes, credit limits, guarantees) and cannot fairly be added into one total.
const FKIND = { phil: "Philanthropy", public: "Public and climate funds", dev: "Development finance", inv: "Investors and insurers" };
const T2K = { philanthropy: "phil", "family-office": "phil", "adaptation-fund": "public", "climate-fund": "public", "public-innovation": "public", dfi: "dev", mdb: "dev", "blended-facility": "dev", vc: "inv", cvc: "inv", impact: "inv", "risk-capital": "inv" };
const kindByDeal = {}; INV.forEach(i => (i.deals || []).forEach(id => { if (!kindByDeal[id] && T2K[i.type]) kindByDeal[id] = T2K[i.type]; }));
const KIND_BY_NAME = [[/Swiss Agency for Development|Government of|Ministry|Municipal/i, "public"], [/Foundation|Philanthrop|Earthshot|Collaborative/i, "phil"],
  [/Green Climate Fund|Global Environment Facility|Adaptation Fund|Efficiency for Access|CLASP/i, "public"], [/ADB|IFC|DFC|FMO|PIDG|SEACEF|CEI Africa|Impact Fund Denmark|Development/i, "dev"]];
const fkind = d => { const n = d.investors.join(" "), hit = KIND_BY_NAME.find(([re]) => re.test(n)); return hit ? hit[1] : kindByDeal[d.id] || "inv"; };
const fins = d => ({ grant: "Grants", prize: "Prizes", equity: "Shares", convertible: "Loans", debt: "Loans", guarantee: "Guarantees and insurance", "insurance-capital": "Guarantees and insurance" })[d.instrument]
  || (/Accredited|programme|Public/i.test(d.stage) ? "Programme funding" : "Mixed or not stated");
const ROLES = {
  catalytic: ["Catalytic", "Money that takes on risk so that other money can follow: guarantees, insurance capital, flexible or early loans."],
  evidence: ["Evidence", "Prizes, challenges, research and pilots that show what works, and for whom."],
  field: ["Field-building", "Programmes that connect people, share data and build the wider field."],
  delivery: ["Delivery", "Money that pays directly for protection people receive: public cooling, programmes and facilities."],
  commercial: ["Commercial growth", "Investment in businesses with paying customers: shares and loans for growth."] };
const frole = d => /guarantee|insurance-capital|convertible/.test(d.instrument || "") || /Catalytic|transition|Guarantee|reinsurance|Portfolio/i.test(d.stage) ? "catalytic"
  : /prize/.test(d.instrument || "") || /Prize|Research|Challenge|pilot/i.test(d.stage) ? "evidence"
  : /Philanthropic programme/i.test(d.stage) ? "field"
  : /Public cooling facility|thermal-comfort|Accredited-entity|programme phase/i.test(d.stage) ? "delivery" : "commercial";
const SAS = new Set(["IN", "BD", "PK", "NP", "LK", "BT", "MV", "AF"]), SEAS = new Set(["ID", "TH", "VN", "PH", "MY", "SG", "KH", "LA", "MM", "BN", "TL"]);
const FDATA = DEALS.map(d => { const a = d.amount || {}, u = Number(a.usd); return { id: d.id, r: recip(d), f: d.investors.join(", "), k: fkind(d), i: fins(d), s: segName(d.segment),
  c: (d.loops || []).filter(id => loopById[id]), u: isFinite(u) && u > 0 ? u : null, ul: usd(a.usd), st: d.status, role: frole(d), date: d.date,
  sa: (d.countries || []).some(c => SAS.has(c)), sea: (d.countries || []).some(c => SEAS.has(c)), src: live((d.source || {}).url) ? d.source.url : "", sl: (d.source || {}).label || "Source" }; });
// funding published each month to the knowledge base (data/kb/funding.json) joins the traced funding
const KBF = fs.existsSync(path.join(ROOT, "data", "kb", "funding.json")) ? JSON.parse(fs.readFileSync(path.join(ROOT, "data", "kb", "funding.json"), "utf8")).filter(r => r.status === "current") : [];
const KBS = Object.fromEntries((fs.existsSync(path.join(ROOT, "data", "kb", "source.json")) ? JSON.parse(fs.readFileSync(path.join(ROOT, "data", "kb", "source.json"), "utf8")) : []).map(r => [r.id, r]));
const KINSTR = { grant: "Grants", equity: "Shares", loan: "Loans", bond: "Loans", "contingent-credit": "Loans", guarantee: "Guarantees and insurance", insurance: "Guarantees and insurance", "risk-pool": "Guarantees and insurance", "forecast-finance": "Programme funding", "cash-transfer": "Programme funding", programme: "Programme funding" };
const KROLE = { catalytic: "catalytic", evidence: "evidence", "field-building": "field", delivery: "delivery" };
const KSTAGE = { announced: "announced", committed: "closed", paid: "disbursed", "up-to": "announced" };
KBF.forEach(r => { const a = r.amount || {}, u = Number(a.usd), src = KBS[(r.sources || [])[0]] || {};
  FDATA.push({ id: r.id, r: r.recipient, f: r.funder, k: FKIND[r.funder_kind] ? r.funder_kind : "inv", i: KINSTR[r.instrument] || "Mixed or not stated", s: r.segment ? segName(r.segment) : "Not yet classified",
    c: (r.cycles || []).filter(id => loopById[id]), u: isFinite(u) && u > 0 ? u : null, ul: a.disclosed === false ? "" : usd(a.usd), st: KSTAGE[r.stage] || "unclear", role: KROLE[r.philanthropy_role] || "commercial",
    date: r.as_of, sa: (r.countries || []).some(c => SAS.has(c)) || (r.places || []).includes("region-south-asia"), sea: (r.countries || []).some(c => SEAS.has(c)) || (r.places || []).includes("region-southeast-asia"),
    src: src.url || "", sl: src.publisher || src.title || "Source" }); });
const touched = new Set(FDATA.flatMap(d => d.c)), untraced = D.LOOPS.filter(l => !touched.has(l.id));
const roleN = Object.fromEntries(Object.keys(ROLES).map(k => [k, FDATA.filter(d => d.role === k).length]));
const FMETA = { kinds: FKIND, roles: Object.fromEntries(Object.entries(ROLES).map(([k, v]) => [k, v[0]])), status: DSTATUS,
  loops: Object.fromEntries(D.LOOPS.map(l => [l.id, l.name])) };
const flows = shell("flows", "The heat economy · Follow the money", "Where funding for heat protection comes from, <br>and where it reaches.",
  `A first, partial trace: ${FDATA.length} pieces of funding from public announcements, followed from who gave them to the cycles they could help break. It is a sample, not the whole picture, and it will grow.`,
  `<nav class="sol-jump" aria-label="On this page"><a href="#flow">The flow</a> · <a href="#roles">The role money plays</a> · <a href="#untraced">Cycles we have not yet traced</a> · <a href="#health">Health</a> · <a href="#risk">Risk finance</a></nav>
        <section class="cty-s fl" id="flow" aria-labelledby="fl-h"><h2 id="fl-h">The flow</h2>
          <div class="fl-bar" role="group" aria-label="What to show">
            <div class="fl-seg" role="radiogroup" aria-label="Look through"><span class="fl-lbl">Look through</span>
              ${[["phil", "Philanthropy and grants"], ["public", "Public and climate funds"], ["dev", "Development finance"], ["inv", "Investors and insurers"], ["all", "Everything"]].map(([v, t], i) => `<button type="button" role="radio" aria-checked="${i ? "false" : "true"}" data-lens="${v}">${t}</button>`).join("")}</div>
            <label class="fl-sel"><span class="fl-lbl">Measure</span><select data-fl="measure"><option value="n">Pieces of funding</option><option value="u">US$ amounts (where published)</option></select></label>
            <label class="fl-sel"><span class="fl-lbl">Status</span><select data-fl="status"><option value="">Any</option><option value="paid">Paid out or confirmed</option><option value="announced">Announced</option><option value="unclear">Not clear</option></select></label>
            <label class="fl-sel"><span class="fl-lbl">Where</span><select data-fl="where"><option value="">Anywhere</option><option value="sa">South Asia</option><option value="sea">Southeast Asia</option></select></label>
          </div>
          <p class="fl-caution" data-fl-caution hidden>Amounts are of different kinds (investment rounds, approved envelopes, credit limits, guarantees) and are not a total. Funding without a published amount drops out of this view.</p>
          <div class="fl-stages" aria-hidden="true"><span>Who funds</span><span>How</span><span>What it builds</span><span>Cycles it could help break</span></div>
          <div class="fl-chart" data-fl-chart role="img" aria-label="Flow of traced funding from kinds of funder, through kinds of funding and kinds of protection, to the cycles of heat they could help break. A full list follows the chart."></div>
          <p class="fl-hint">Select any band or label to follow it from end to end. A piece of funding linked to several cycles is shared equally between them.</p>
          <div class="fl-panel" data-fl-panel aria-live="polite"></div>
          <noscript><p class="he-note">The interactive flow needs JavaScript. <a href="/heat-economy/money/#deals">Every piece of funding is listed here</a>.</p></noscript>
        </section>
        <section class="cty-s" id="roles"><h2>The role money plays</h2>
          <p class="he-intro">Our reading of each piece of funding, from its type and stage. This is inferred, not stated by the funders.</p>
          <div class="fl-roles">${Object.entries(ROLES).map(([k, [h, p]]) => `<button type="button" class="fl-role fl-role--${k}" data-role="${k}" aria-pressed="false"><b>${esc(h)}</b><span class="fl-role-n">${roleN[k]}</span><span>${esc(p)}</span></button>`).join("")}</div>
          <p class="he-note">Most of the funding we could trace is commercial growth for products with a paying customer. Fewer pieces take on risk, build evidence or build the field, and services such as paid rest or shared cool rooms rarely appear, because they are usually paid for from public budgets this trace does not cover.</p></section>
        <section class="cty-s" id="untraced"><h2>Cycles we have not yet traced funding to <span class="he-n">${untraced.length}</span></h2>
          <p class="he-intro">This may mean the money exists and we have not found it yet. If you know of funding for any of these, <a href="/corrections/">please tell us</a>.</p>
          <ul class="fl-untraced">${untraced.map(l => `<li><a class="fl-u-h" href="/#loop-${l.id}">${esc(l.name)}</a><span>${esc(l.summary)}</span><a class="fl-u-go" href="/heat-economy/opportunities/#loop-${l.id}">Ideas for this cycle <span aria-hidden="true">→</span></a></li>`).join("")}</ul></section>
        <section class="cty-s" id="health"><h2>The health thread</h2>
          <div class="fl-callout"><p class="fl-big">US$3.3 bn <span>declared</span> · US$1.1 bn <span>committed</span></p><p>Forty-eight countries have put a price on what they need each year to protect health from climate change; international funding committed in 2024 covered about a third (Lancet Countdown 2026). Clinics, heat-illness surveillance and health warnings sit inside that gap.</p><p><a href="/lancet-countdown-2026/#for-money">What the Lancet Countdown means for funders <span aria-hidden="true">→</span></a></p></div></section>
        <section class="cty-s" id="risk"><h2>Risk finance</h2>
          <div class="fl-callout fl-callout--soft"><p class="eyebrow">Now a section of its own</p><p>Money arranged before a heatwave arrives (insurance, regional pools, credit lines, funds released on a forecast and social protection that pays more in the heat) now has its own section. Every scheme answers one question: did it pay, and when? Amounts there are never added to the funding traced on this page, because they are different kinds of money.</p><p><a href="/paying-when-heat-strikes/">Paying when heat strikes <span aria-hidden="true">→</span></a> · <a href="/paying-when-heat-strikes/#countries">Country by country</a> · <a href="/paying-when-heat-strikes/#data">The data</a></p></div></section>
        <p class="tool-alt">Every piece of funding is also listed in a table on <a href="/heat-economy/money/#deals">Funders and funding</a>, and can be <a href="/heat-economy/data/deals.csv">downloaded as a spreadsheet</a>.</p>`);
const FLOW_JS = `<script>window.FL=${JSON.stringify({ d: FDATA, m: FMETA }).replace(/</g, "\\u003c")};</script><script src="/heat-economy/flows.js?v=${V}" defer></script>`;

// ---- write the pages ----
const write = (slug, title, desc, body, script = "") => { const dir = path.join(ROOT, slug); fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, "index.html"), page({ slug, title, desc, body, script })); };
write("heat-economy", "The heat economy", "Businesses, funding and ideas that protect people from heat in Asia, and what to ask before you buy, fund or start something.", overview);
write("heat-economy/businesses", "Businesses offering protection from heat", `${N.biz} businesses offering protection from extreme heat, ${N.bizAsia} working in South or Southeast Asia, with what to ask before buying.`, businesses, FILTER("he-count", "businesses"));
write("heat-economy/flows", "Follow the money", `Where funding for heat protection comes from and where it reaches: ${FDATA.length} pieces of traced funding, followed from who gave them to the cycles they could help break.`, flows, FLOW_JS);
write("heat-economy/money", "Funding and support for protection from heat", `${N.inv} funders and investors, ${N.deals} pieces of funding and ${N.prog} accelerators, prizes and challenges in protection from extreme heat.`, money, FILTER("he-count", "funders and programmes"));
write("heat-economy/opportunities", "Ideas for businesses and services that protect people from heat", `${N.opp} ideas for businesses and services, one or more for each vicious cycle of extreme heat: who could pay, who it helps, what needs to be in place.`, opportunities, FILTER("he-count", "ideas"));
write("heat-economy/conditions", "Questions to ask before you buy, fund or start", "Twenty-four questions to ask about heat protection, with rules that help, ways to pay, common obstacles and what each organisation could do.", conditions);

// ---- CSV downloads (the researchers' fuller notes, for specialists) ----
const cell = v => { let s = Array.isArray(v) ? v.join("; ") : v == null ? "" : String(v); if (/^https?:\/\/\S+$/.test(s) && !live(s)) s = ""; // links that failed the check are left out, as on the pages
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const csv = (file, head, rows) => { fs.mkdirSync(path.join(ROOT, "heat-economy", "data"), { recursive: true }); fs.writeFileSync(path.join(ROOT, "heat-economy", "data", file + ".csv"), "﻿" + [head, ...rows].map(r => r.map(cell).join(",")).join("\r\n") + "\r\n"); };
const loopNames = ids => (ids || []).map(id => (loopById[id] || {}).name).filter(Boolean);
csv("businesses", ["Business", "Kind of protection", "Type of business", "Headquarters", "Countries", "Works in South or Southeast Asia", "What it offers", "Business model", "Who buys it", "Who uses it", "Price (local)", "Currency", "Climate", "Reach to lowest-income households (researchers' note)", "Cycles it can help break", "How it could help (researchers' note)", "Risks and limits (researchers' note)", "Website", "Source", "Checked"],
  BIZ.map(b => [b.name, segName(b.segment), KIND[b.kind] || b.kind, cname(b.hq_country), (b.countries || []).map(cname), inAsia(b) ? "yes" : "no", b.product, b.business_model, b.customer, b.user, (b.price || {}).local, (b.price || {}).currency, SUITS[b.suits] || "", b.reaches_poorest_why, loopNames(b.loops), b.link_it_cuts, b.risks, b.url, ((b.evidence || [])[0] || {}).source ? b.evidence[0].source.url : "", (b.reach || {}).date || ""]));
csv("investors", ["Funder or investor", "Kind", "Heat-related funding (researchers' note)", "Usually provides", "Stages", "Typical amount", "Kinds of protection", "Cycles", "Website", "Source", "Checked"],
  INV.map(i => [i.name, INVTYPE[i.type] || i.type, (i.heat_thesis || {}).text, (i.instruments || []).map(x => INSTR[x] || x), i.stages, (i.ticket_size || {}).text, (i.segments || []).map(segName), loopNames(i.loops), i.url, ((i.heat_thesis || {}).source || {}).url, i.last_checked]));
csv("deals", ["Date", "Who received it", "From", "Amount (original)", "Currency", "Amount (US$)", "Exchange rate note", "Type", "Stage", "Status", "Heat-related use (researchers' note)", "Kind of protection", "Countries", "Cycles", "Source"],
  DEALS.map(d => [d.date, recip(d), d.investors, (d.amount || {}).local, (d.amount || {}).currency, (d.amount || {}).usd, (d.amount || {}).fx, INSTR[d.instrument] || d.instrument, d.stage, DSTATUS[d.status] || d.status, d.heat_specific_use, segName(d.segment), (d.countries || []).map(cname), loopNames(d.loops), (d.source || {}).url]));
csv("programmes", ["Programme", "Run by", "Type", "Where", "Focus", "What it offers", "Cohort", "Heat-related ventures", "Helps meet buyers", "Evaluation (researchers' note)", "Website", "Checked"],
  PROG.map(a => [a.name, a.run_by, PROGTYPE[a.type] || a.type, a.geography, a.focus, a.offers, a.cohort_size, (a.heat_ventures || []).map(h => h.name), a.connects_to_buyers, (a.evaluation || {}).text, a.url, a.last_checked]));
csv("opportunities", ["Idea", "The idea in brief", "Cycle", "Link it cuts", "Who could pay", "Funding", "Who it helps", "How it would earn", "Price it would need (researchers' note)", "What needs to be in place", "Who would need to be on board", "Watch out for", "If customers cannot pay (researchers' note)"],
  OPP.map(o => { const pl = PL.ideas[o.id] || [o.name, "", o.who_pays]; return [pl[0], pl[1], (loopById[o.loop] || {}).name || o.loop, o.link_it_cuts, pl[2], (VIABLE[o.viable_market] || [""])[0], o.who_benefits, o.revenue_model, o.price_needed, o.must_be_true, o.anchor_demand, o.risks, o.if_not_viable]; }));
csv("segments", ["Kind of protection", "What it is", "Usually paid for by", "Things to check", "Cycles it can help break", "Businesses found", "Research definition", "Research note on reaching lowest-income households"],
  SEG.map(s => { const pl = plainSeg(s.id); return [pl.name || s.name, pl.what, pl.pays, pl.check, loopNames(s.loops), bizBySeg(s.id), s.definition, s.reaches_poorest_how]; }));

// every plain-language entry must match the research ids, so nothing silently falls back to research wording
const miss = [...SEG.filter(s => !PL.segments[s.id]).map(s => "segment " + s.id), ...OPP.filter(o => !PL.ideas[o.id]).map(o => "idea " + o.id),
  ...(C.policies || []).filter(x => !PL.policies[x.id]).map(x => "rule " + x.id), ...(C.finance_structures || []).filter(x => !PL.finance[x.id]).map(x => "way to pay " + x.id),
  ...(C.barriers || []).filter(x => !PL.barriers[x.id]).map(x => "obstacle " + x.id), ...(C.actor_roles || []).filter(x => !PL.roles[x.institution_type]).map(x => "role " + x.institution_type),
  ...(C.fairness_checks || []).filter(x => !PL.questions.some(g => g[1].some(q => q[0] === x.id))).map(x => "question " + x.id)];
const ids = DEALS.map(d => d.investee).filter(x => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(x || "") && !bizNameById[x] && !PL.recipients[x]);
miss.push(...ids.map(x => "funding recipient " + x));
if (miss.length) throw new Error("tools/economy-plain.js has no plain wording for: " + miss.join(", "));
module.exports = { loopsWithIdeas: [...new Set(OPP.map(o => o.loop))] };
console.log(`heat economy: ${N.biz} businesses, ${N.inv} funders, ${N.deals} pieces of funding, ${N.prog} programmes, ${N.opp} ideas, ${SEG.length} kinds of protection`);
