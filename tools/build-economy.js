#!/usr/bin/env node
/* Common Shade: builds "The heat economy" (/heat-economy/ and four sub-pages) from the October 2026 research in
   research/2026-10/economy/: market segments (G1), businesses (G2), investors and deals (G3), support programmes (G4),
   business opportunities loop by loop (G5) and the conditions for a fair market (G6).
   Every outside link is checked first on GitHub (tools/check-links.js); research/2026-10/link-status.json records the
   result, and links that failed are left out. Amounts of different kinds are never added together.
   Also writes CSV downloads to /heat-economy/data/. Run by tools/build-static.js, or alone: node tools/build-economy.js */
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, ".."), R = path.join(ROOT, "research", "2026-10"), E = path.join(R, "economy"), SITE = "https://beattheheat.asia";
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, "data.js"), "utf8") + ";Object.assign(this,{EVIDENCE_STATUS,INSTITUTIONS,LEVERS,LOOPS,LOOP_GROUPS,ACTION_SETTINGS})", ctx);
const D = ctx, J = f => JSON.parse(fs.readFileSync(path.join(E, f), "utf8"));
const STATUS = fs.existsSync(path.join(R, "link-status.json")) ? JSON.parse(fs.readFileSync(path.join(R, "link-status.json"), "utf8")) : {};
const live = u => !!u && /^https?:/.test(u) && STATUS[u] !== "FAIL" && !/^https?:\/\/(www\.)?beattheheat\.asia/.test(u);
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const ext = (u, l) => live(u) ? `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(l || u)}<span class="visually-hidden"> (opens in a new tab)</span>&nbsp;<span aria-hidden="true">↗</span></a>` : "";
const src = s => s && live(s.url) ? `<span class="sol-src">${ext(s.url, s.label || "Source")}</span>` : "";
const tag = s => D.EVIDENCE_STATUS[s] ? `<span class="ev-tag ev-tag--${s}" title="${esc(D.EVIDENCE_STATUS[s].text)}">${esc(D.EVIDENCE_STATUS[s].name)}</span>` : "";
const loopById = Object.fromEntries(D.LOOPS.map(l => [l.id, l]));
const loopLinks = ids => (ids || []).filter(id => loopById[id]).map(id => `<a href="/#loop-${id}">${esc(loopById[id].name)}</a>`).join(" · ");
const inst = id => (D.INSTITUTIONS.find(i => i.id === id) || {}).name || id;
const has = v => v != null && v !== "" && !(Array.isArray(v) && !v.length);
const f = (h, body) => has(body) ? `<div class="sol-f"><h4>${esc(h)}</h4>${body}</div>` : "";
const p = t => has(t) ? `<p>${esc(t)}</p>` : "";
const ul = a => (a || []).filter(has).length ? `<ul class="sol-ul">${a.filter(has).map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : "";
const COUNTRY = { AE: "United Arab Emirates", AL: "Albania", AR: "Argentina", AU: "Australia", BD: "Bangladesh", CH: "Switzerland", CN: "China", CR: "Costa Rica", DE: "Germany", DJ: "Djibouti", FR: "France", GB: "United Kingdom", GH: "Ghana", HK: "Hong Kong", ID: "Indonesia", IN: "India", JP: "Japan", KE: "Kenya", KH: "Cambodia", LK: "Sri Lanka", LU: "Luxembourg", MA: "Morocco", MG: "Madagascar", MK: "North Macedonia", MW: "Malawi", MX: "Mexico", MY: "Malaysia", NA: "Namibia", NG: "Nigeria", NP: "Nepal", PA: "Panama", PH: "Philippines", PK: "Pakistan", SC: "Seychelles", SE: "Sweden", SG: "Singapore", SO: "Somalia", ST: "São Tomé and Príncipe", SV: "El Salvador", TH: "Thailand", TN: "Tunisia", TZ: "Tanzania", UG: "Uganda", US: "United States", VN: "Vietnam", ZA: "South Africa", ZM: "Zambia", ZW: "Zimbabwe" };
const ASIA = new Set(["IN", "BD", "PK", "NP", "LK", "TH", "ID", "PH", "VN", "KH", "MY", "SG", "MM", "LA", "BT", "MV", "TL", "BN"]);
const cname = c => COUNTRY[c] || c || "";
const usd = n => { const x = Number(n); if (!isFinite(x) || !n) return ""; return x >= 1e9 ? `US$${(x / 1e9).toFixed(2)} billion` : x >= 1e6 ? `US$${(x / 1e6).toFixed(1)} million` : `US$${Math.round(x).toLocaleString("en-GB")}`; };

// ---- the research ----
const SEG = J("segments.json"), BIZ = J("businesses.json"), INV = J("investors.json"), DEALS = J("deals.json"), PROG = J("programmes.json"),
  OPP = J("opportunities.json"), COND = J("conditions.json"), FLOWS = J("flows.json");
const segName = id => (SEG.find(s => s.id === id) || {}).name || id || "";
const bizBySeg = id => BIZ.filter(b => b.segment === id).length;
const inAsia = b => (b.countries || []).concat(b.hq_country || []).some(c => ASIA.has(c));
const N = { biz: BIZ.length, bizAsia: BIZ.filter(inAsia).length, inv: INV.length, deals: DEALS.length, prog: PROG.length, opp: OPP.length,
  oppPublic: OPP.filter(o => o.viable_market === "with-public-money").length, oppYes: OPP.filter(o => o.viable_market === "yes").length,
  oppNo: OPP.filter(o => o.viable_market === "no").length, progBuyers: PROG.filter(x => x.connects_to_buyers === "yes").length,
  poorUnclear: BIZ.filter(b => b.reaches_poorest === "unclear").length };
const MATURITY = { emerging: "Emerging", growing: "Growing", established: "Established" };
const POOREST = { yes: "Reaches the poorest", partly: "Can partly reach the poorest", no: "Does not reach the poorest", unclear: "Reach to the poorest unclear" };
const TYPE = { passive: "Passive cooling", active: "Active cooling", system: "Systems and data", "non-physical": "Plans, work and money" };
const KIND = { startup: "Start-up", sme: "Small or specialist business", "social-enterprise": "Social enterprise", cooperative: "Co-operative", "corporate-line": "Established company: product line" };
const VIABLE = { yes: ["Buyers could fund it", "yes"], "with-public-money": ["Needs public or pooled money", "public"], no: ["No direct market", "no"] };
const DSTATUS = { announced: "Announced", closed: "Closed", disbursed: "Disbursed", unclear: "Status unclear" };

// ---- page template (as the solutions library) ----
const ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%2316202B'/%3E%3Cpath d='M5 14 Q16 4 27 14' fill='none' stroke='%23F26430' stroke-width='4.5' stroke-linecap='round'/%3E%3Cpath d='M9 13 V27 M23 13 V27' stroke='%23F6E7D7' stroke-width='2.6' stroke-linecap='round'/%3E%3C/svg%3E";
const V = (fs.readFileSync(path.join(ROOT, "index.html"), "utf8").match(/styles\.css\?v=(\d+)/) || [, "1"])[1];
const FOOT_CLOSE = (fs.readFileSync(path.join(ROOT, "practical", "index.html"), "utf8").match(/  <aside class="foot-close"[\s\S]*?<\/aside>\n/) || [""])[0];
const NAV = `<nav aria-label="Elsewhere on the site"><a href="/#explore">The map</a><a href="/practical/">Practical actions</a><a href="/solutions/">Solutions</a><a href="/plan/">Plan a response</a><a href="/news/">Heat in the news</a><a href="/join/">Help build Common Shade</a></nav>`;
const PAGES = [["", "Overview"], ["businesses", "Businesses"], ["money", "Money and support"], ["opportunities", "What could come up"], ["conditions", "What makes markets work"]];
const subnav = cur => `<nav class="he-sub" aria-label="The heat economy">${PAGES.map(([s, n]) => `<a href="/heat-economy/${s ? s + "/" : ""}"${s === cur ? ' aria-current="page"' : ""}>${esc(n)}</a>`).join("")}</nav>`;
const CAVEAT = `<p class="sol-caveat"><b>How to read this.</b> A targeted review of published sources, checked in October 2026, not a census of the market. Listing a business, investor or programme is not endorsement, partnership or investment advice, and nothing is ranked. Company descriptions are what the company says unless labelled otherwise. Amounts of different kinds (announced, closed, disbursed; equity, loans, grants, guarantees) are never added together.</p>`;
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
    <p>From a targeted review of published sources compiled in October 2026, not an exhaustive census of the market. Listing a business, investor, programme or organisation does not imply endorsement, partnership or ranking, and nothing here is investment advice. Every source links to its publisher; links that failed our check are left out. Text: <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0<span class="visually-hidden"> (opens in a new tab)</span></a>. <a href="/sources/">All sources</a> · <a href="/heat-economy/#data">Download the data</a></p>
  </div></footer>
${script}</body>
</html>
`;
const shell = (cur, eyebrow, h1, lede, inner) => `
    <section class="sol-page he">
      <div class="container">
        ${subnav(cur)}
        <p class="eyebrow eyebrow--break">${esc(eyebrow)}</p>
        <h1 class="h2 tool-h1">${h1}</h1>
        <p class="tool-lede">${lede}</p>
        ${CAVEAT}
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

// ================= 1. OVERVIEW =================
const segCard = s => {
  const ms = (s.market_size || []).filter(m => m.figure && live(m.source && m.source.url));
  return `<article class="he-seg" id="seg-${esc(s.id)}">
      <p class="sol-tags"><span class="sol-type sol-type--${s.type === "passive" ? "passive" : s.type === "active" ? "active" : "policy"}">${esc(TYPE[s.type] || s.type)}</span><span class="sol-clim">${esc(MATURITY[s.maturity] || s.maturity)}</span></p>
      <h3>${esc(s.name)}</h3>
      <p>${esc(s.definition)}</p>
      <p class="he-k"><b>Who pays:</b> ${esc(s.who_pays)}</p>
      <p class="he-k"><b>Who benefits:</b> ${esc(s.who_benefits)}</p>
      <p class="he-k he-poor he-poor--${esc(s.reaches_poorest)}"><b>${esc(POOREST[s.reaches_poorest] || "")}.</b> ${esc(s.reaches_poorest_how)}</p>
      ${ms.length ? `<p class="he-k"><b>Published size:</b> ${ms.map(m => `${esc(m.figure)} ${esc(m.units)} (${esc(m.year)}, ${esc(m.geography)}) ${src(m.source)}`).join("; ")}</p>` : `<p class="he-k"><b>Published size:</b> no matched estimate found in this review.</p>`}
      ${(s.loops || []).length ? `<p class="he-k"><b>Cycles it can act on:</b> ${loopLinks(s.loops)}</p>` : ""}
      <p class="he-go">${bizBySeg(s.id) ? `<a href="/heat-economy/businesses/?segment=${esc(s.id)}">${bizBySeg(s.id)} ${bizBySeg(s.id) === 1 ? "business" : "businesses"} in this review&nbsp;<span aria-hidden="true">→</span></a>` : "No business in this segment was verified in this review."}</p>
    </article>`;
};
const SHELVES = [["Cooling and safer places", ["cool-roofs", "passive-buildings", "shade-greening", "efficient-fans", "evaporative-cooling", "efficient-ac", "refrigerant-services", "district-cooling", "cold-chains", "personal-cooling"]],
  ["Services, data and care", ["heat-sensing", "heat-data-warnings", "heat-water-services", "workplace-heat-services", "heat-resilient-agriculture", "heat-ready-healthcare", "cooling-power-flexibility"]],
  ["Finance and risk", ["heat-insurance", "cooling-access-finance"]]];
const shelved = new Set(SHELVES.flatMap(x => x[1]));
const extraSeg = SEG.filter(s => !shelved.has(s.id)).map(s => s.id); if (extraSeg.length) SHELVES[1][1].push(...extraSeg);
const flow = `<figure class="he-flow" aria-labelledby="he-flow-cap">
      <figcaption id="he-flow-cap" class="he-flow__cap">From heat exposure to protection: who decides, who pays, who delivers</figcaption>
      <div class="he-lanes">
        <div class="he-lane he-lane--demand"><p class="he-lane__h">Demand</p>
          <p><b>People exposed:</b> residents, workers, growers, pupils, patients.</p>
          <p><b>Those with a duty to protect them:</b> employers, cities, housing owners, schools, health systems.</p>
          <p class="he-gap">The person who needs protection is often not the one who can pay for it.</p></div>
        <div class="he-lane he-lane--platform"><p class="he-lane__h">Platform</p>
          <ul><li>Worker and community voice</li><li>Weather and evidence</li><li>Standards and enforcement</li><li>Procurement and project preparation</li><li>Payment and finance coordination</li></ul></div>
        <div class="he-lane he-lane--supply"><p class="he-lane__h">Supply</p>
          ${SHELVES.map(([n, ids]) => `<p><b>${esc(n)}:</b> ${ids.map(id => `<a href="#seg-${id}">${esc(segName(id).split(/[,(]/)[0].trim())}</a>`).join(" · ")}</p>`).join("")}</div>
      </div>
      <div class="he-money">
        <p class="he-lane__h">Four kinds of money, never interchangeable</p>
        <ul><li><b>Payments by buyers</b> buy products, services and upkeep.</li><li><b>Loans and equity</b> fund assets or businesses with a credible case for repayment or return.</li><li><b>Public budgets, grants and subsidies</b> cover public goods, preparation and the gap between need and ability to pay.</li><li><b>Premiums</b> buy specified insurance; payouts happen only under the contract’s terms.</li></ul>
      </div>
      <div class="he-outcome"><p><b>The outcome that counts is usable protection, not products delivered.</b> Check it at each step: reach, affordability, permission, safe use, uptime, maintenance and income kept.</p>
        <p class="he-nopayer"><b>Needs without a reliable payer.</b> Free public shade, paid rest for informal workers, care for people who cannot pay, warnings that reach everyone. These rely on public duties, social protection, grants and collective purchasing. Entrepreneurship alone will not make them disappear.</p></div>
    </figure>`;
const findings = [
  [N.biz, "businesses already selling protection from heat", `${N.bizAsia} of them with an offer in South or Southeast Asia. None could yet show, in published evidence, that it reaches the poorest households.`, "businesses"],
  [N.inv, "investors and capital routes", `${N.deals} financing events traced. Recorded money gathers where a buyer, an asset or a contract is visible: air conditioning, cold chains, district cooling and risk data.`, "money"],
  [N.prog, "accelerators, prizes and challenges", `Only ${N.progBuyers} clearly connect ventures to paying buyers; most stop at recognition, testing or a pilot site.`, "money#programmes"],
  [N.opp, "business ideas, cycle by cycle", `${N.oppPublic} need public or pooled money to protect the people they are for; ${N.oppYes} could be funded by buyers; ${N.oppNo} has no direct market.`, "opportunities"]];
const dataFiles = [["businesses", "Businesses"], ["investors", "Investors and capital routes"], ["deals", "Financing events"], ["programmes", "Accelerators, prizes and challenges"], ["opportunities", "Business ideas by cycle"], ["segments", "Market segments"]];
const overview = shell("", "The heat economy", "Who is building protection from heat, <br>who pays for it, and what is still missing.",
  `The businesses already selling protection from heat, the investors and programmes backing them, the businesses that could come up, and what it takes for a market to protect the people who need it most. Every part is tied to the vicious cycles it can help break.`,
  `<div class="he-stats">${findings.map(([n, l, t, href]) => `<a class="he-stat" href="/heat-economy/${href.replace("#", "/#")}"><span class="he-stat__n">${n}</span><span class="he-stat__l">${esc(l)}</span><span class="he-stat__t">${esc(t)}</span></a>`).join("")}</div>
        <blockquote class="he-quote"><p>A credible market begins when a need for protection becomes an <b>authorised, funded purchase with accountable delivery and upkeep</b>. Heat exposure, social value and a promising product do not, by themselves, identify a customer.</p><cite>The central finding of the research</cite></blockquote>
        <section class="cty-s" id="flow"><h2>How the heat economy works</h2>
          <p class="he-intro">Three questions come before any product: who needs protection, who can authorise it, and who can pay for it? They are often three different people or institutions. A street vendor needs shade, but the city controls the pavement. A worker needs paid rest, but the employer controls the schedule.</p>
          ${flow}</section>
        <section class="cty-s" id="segments"><h2>Nineteen parts of the heat economy</h2>
          <p class="he-intro">Maturity describes whether the product or service model exists, not how fast it is growing or whether it protects enough people. “Can partly reach the poorest” means a route exists, not that it has been shown to work. The research deliberately gives no single size for the whole heat economy: product sales, loans, premiums and public spending overlap, and adding them would overstate it.</p>
          ${SHELVES.map(([n, ids]) => `<h3 class="he-shelf">${esc(n)}</h3><div class="he-segs">${ids.map(id => SEG.find(s => s.id === id)).filter(Boolean).map(segCard).join("")}</div>`).join("")}</section>
        <section class="cty-s" id="use"><h2>Using this</h2>
          <ul class="he-uses"><li><b>Cities, employers and health systems:</b> start with <a href="/heat-economy/conditions/#fairness">the fairness questions</a> before buying, and with <a href="/heat-economy/opportunities/">what could come up</a> for services to commission.</li>
          <li><b>Funders and investors:</b> see <a href="/heat-economy/money/">where money has gone</a> and which <a href="/heat-economy/opportunities/?viable=public">ideas need public or pooled money</a> to reach the poorest.</li>
          <li><b>Founders:</b> find <a href="/heat-economy/money/#programmes">support programmes</a> and the <a href="/heat-economy/conditions/#barriers">barriers</a> others have met.</li>
          <li><b>Worker and community organisations:</b> use the fairness questions to ask who is protected, who pays and who keeps it working.</li></ul></section>
        <section class="cty-s" id="data"><h2>Download the data</h2>
          <p class="he-intro">Free to reuse under CC BY 4.0, with a link to Common Shade. Each spreadsheet has one row per record and links to its source.</p>
          <ul class="he-dl">${dataFiles.map(([f, n]) => `<li><a href="/heat-economy/data/${f}.csv" download>${esc(n)} (CSV)</a></li>`).join("")}</ul></section>
        <p class="tool-alt"><a href="/solutions/">Solutions library</a> · <a href="/countries/">Country snapshots</a> · <a href="/finance/">Paying for protection</a> · <a href="/heat-network/">The heat network</a></p>`);

// ================= 2. BUSINESSES =================
const bizCard = b => {
  const c = [...new Set((b.countries || []).concat(b.hq_country || []).filter(Boolean))];
  const pr = b.price && b.price.local ? `${esc(b.price.local)} ${esc(b.price.currency || "")}${b.price.usd ? ` (about ${usd(b.price.usd)}${b.price.year ? `, ${esc(b.price.year)}` : ""})` : ""} ${src(b.price.source)}` : "";
  const ev = (b.evidence || []).filter(e => e.source && live(e.source.url)).map(e => `<li>${tag(e.status)} ${esc(e.text)} ${src(e.source)}</li>`).join("");
  const to = b.tradeoffs || {};
  const toList = [["Energy", to.energy], ["Refrigerant", to.refrigerant], ["Water", to.water], ["End of life", to.end_of_life], ["Data and privacy", to.data_privacy], ["Debt", to.debt_risk]].filter(x => has(x[1]));
  const partners = (b.partners || []).map(x => live(x.url) ? ext(x.url, x.name) : esc(x.name)).join(" · ");
  return `<details class="sol he-card" id="${esc(b.id)}" data-segment="${esc(b.segment)}" data-kind="${esc(b.kind)}" data-asia="${inAsia(b) ? "1" : ""}" data-q="${qtext(b.name, b.product, b.problem, b.customer, b.user, segName(b.segment), c.map(cname))}">
      <summary><span class="sol-h">${esc(b.name)}</span><span class="sol-tags"><span class="sol-type sol-type--${/cool|fan|ac|roof|passive|shade|evap|district|refrig|personal|cold/.test(b.segment) ? "active" : "policy"}">${esc(segName(b.segment))}</span><span class="sol-clim">${esc(KIND[b.kind] || b.kind || "")}</span>${c.length ? `<span class="sol-clim">${esc(c.map(cname).join(", "))}</span>` : ""}</span><span class="sol-sum">${esc(b.product)}</span></summary>
      <div class="sol-body">
        ${f("What it does", p(b.product) + (live(b.url) ? `<p>${ext(b.url, "Website")}</p>` : ""))}
        ${f("The heat problem", p(b.problem))}
        ${f("How it could cut a cycle", p(b.link_it_cuts) + ((b.loops || []).length ? `<p class="sol-note">${loopLinks(b.loops)}</p>` : ""))}
        ${f("Business model", p(b.business_model) + (b.customer ? `<p><b>Customer:</b> ${esc(b.customer)}</p>` : "") + (b.user ? `<p><b>User:</b> ${esc(b.user)}</p>` : ""))}
        ${f("Price", pr ? `<p>${pr}</p>` : `<p>No comparable published price was verified.</p>`)}
        ${f("Dry or humid heat", b.suits && b.suits !== "not-applicable" ? `<p><b>${esc({ both: "Dry and humid heat", "hot-dry": "Dry heat", "hot-humid": "Humid heat" }[b.suits] || b.suits)}.</b> ${esc(b.suits_why)}</p>` : "")}
        ${f("Who it reaches", p(b.reaches_poorest_why))}
        ${f("Trade-offs", toList.length ? `<ul class="sol-ul">${toList.map(([k, v]) => `<li><b>${k}:</b> ${esc(v)}</li>`).join("")}</ul>` : "")}
        ${f("Evidence", ev ? `<ul class="sol-ul">${ev}</ul>` : "")}
        ${f("Partners named", partners ? `<p>${partners}</p>` : "")}
        <div class="sol-f sol-kiu"><h4>Risks and what is uncertain</h4>${p(b.risks)}</div>
      </div>
    </details>`;
};
const segsWithBiz = SEG.filter(s => bizBySeg(s.id));
const businesses = shell("businesses", "The heat economy · Businesses", `${N.biz} businesses already selling <br>protection from heat.`,
  `Start-ups, small and specialist firms, social enterprises and established companies with a product line for heat, gathered from published sources. ${N.bizAsia} have an offer or activity in South or Southeast Asia. Cooling food and medicines is included alongside cooling people, and the two are kept distinct.`,
  `<p class="he-note"><b>What this list cannot yet show.</b> For every business here, published evidence that it reaches the poorest fifth of households was not found. That is a gap in the evidence, not a judgement on any company; it is also the question buyers and funders most need answered. All company descriptions are labelled as reported by the company.</p>
        <div class="sol-bar" role="search">
          ${search("For example: fan, cold room, roof, insurance, India")}
          ${sel("segment", "Part of the economy", ["Any part", ...segsWithBiz.map(s => [s.id, `${s.name} (${bizBySeg(s.id)})`])])}
          ${sel("kind", "Kind", ["Any kind", ...Object.entries(KIND).filter(([k]) => BIZ.some(b => b.kind === k))])}
          <label class="he-check"><input type="checkbox" data-filter="asia" value="1"> <span>Offers in South or Southeast Asia</span></label>
          <p class="sol-count" id="he-count" role="status" aria-live="polite"></p>
        </div>
        ${SEG.filter(s => bizBySeg(s.id)).map(s => `<section class="sol-group he-group" aria-labelledby="g-${s.id}"><h2 class="sol-gh" id="g-${s.id}">${esc(s.name)} <span>${bizBySeg(s.id)}</span></h2>
          ${BIZ.filter(b => b.segment === s.id).sort((a, b) => a.name.localeCompare(b.name)).map(bizCard).join("\n")}</section>`).join("\n")}
        <p class="sol-none" id="he-none" hidden>No business matches. Try fewer filters.</p>`);

// ================= 3. MONEY AND SUPPORT =================
const viewName = { "business-project / exact": "Company and project financing (exact amounts)", "business-project / maximum": "Company and project financing (‘up to’ amounts)", "credit-facility-limit / exact": "Credit facility limits", "guarantee-exposure / exact": "Guarantees", "mixed-round / exact": "Mixed rounds (instrument not separable)", "public-approved-envelope / exact": "Public programme approvals", "public-cash-transfer / exact": "Public transfers recorded as disbursed", "public-programme-budget / exact": "Public programme budgets", "unclassified-instrument / exact": "Instrument not established" };
const views = Object.entries(FLOWS.rollups || {}).map(([k, v]) => [k, v.by_status || {}]);
const statusCols = ["announced", "closed", "disbursed"];
const flowTable = `<div class="he-tablewrap" role="region" aria-label="Recorded amounts by kind and status" tabindex="0"><table class="he-table"><caption>Recorded amounts in US dollars, by kind and status. Each row is a separate view: do not add rows or columns together.</caption>
      <thead><tr><th scope="col">Kind of money</th>${statusCols.map(s => `<th scope="col">${DSTATUS[s]}</th>`).join("")}</tr></thead>
      <tbody>${views.map(([k, v]) => `<tr><th scope="row">${esc(viewName[k] || k)}</th>${statusCols.map(s => `<td>${v[s] ? usd(v[s]) : "<span class=\"he-dash\">not recorded</span>"}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
const bp = (FLOWS.rollups || {})["business-project / exact"] || {};
const split = (obj, lab) => { const rows = Object.entries(obj || {}).map(([k, v]) => { const [a, s] = k.split(" | "); return [lab(a), DSTATUS[s] || s, v]; }); return rows.length ? `<div class="he-tablewrap" role="region" aria-label="${esc(lab === segName ? "By part of the economy" : "By place")}" tabindex="0"><table class="he-table he-table--sm"><tbody>${rows.map(r => `<tr><th scope="row">${esc(r[0])}</th><td>${esc(r[1])}</td><td>${usd(r[2])}</td></tr>`).join("")}</tbody></table></div>` : ""; };
const INVTYPE = { vc: "Venture capital", impact: "Impact investor", cvc: "Corporate venture capital", dfi: "Development finance institution", mdb: "Development bank", "climate-fund": "Climate fund", "adaptation-fund": "Adaptation fund", "blended-facility": "Blended-finance facility", philanthropy: "Philanthropy", "family-office": "Family office", "risk-capital": "Risk capital", "public-innovation": "Public innovation fund" };
const dealById = Object.fromEntries(DEALS.map(d => [d.id, d]));
const invCard = i => `<details class="sol he-card" id="inv-${esc(i.id)}" data-type="${esc(i.type || "")}" data-q="${qtext(i.name, INVTYPE[i.type], (i.segments || []).map(segName), i.geography)}">
      <summary><span class="sol-h">${esc(i.name)}</span><span class="sol-tags"><span class="sol-type sol-type--policy">${esc(INVTYPE[i.type] || "Capital route")}</span>${(i.segments || []).slice(0, 3).map(s => `<span class="sol-clim">${esc(segName(s))}</span>`).join("")}</span><span class="sol-sum">${esc((i.heat_thesis || {}).text || "")}</span></summary>
      <div class="sol-body">
        ${f("Its link to heat", p((i.heat_thesis || {}).text) + src((i.heat_thesis || {}).source) + (live(i.url) ? `<p>${ext(i.url, "Website")}</p>` : ""))}
        ${f("Instruments and stages", p([(i.instruments || []).join(", "), (i.stages || []).join(", ")].filter(Boolean).join(" · ")))}
        ${f("Cheque size", p((i.ticket_size || {}).text))}
        ${f("Where", p((i.geography || []).join("; ")))}
        ${f("Dedicated adaptation window", p({ yes: "Yes", no: "No", unclear: "Not established" }[i.adaptation_window] || ""))}
        ${f("Financing events recorded", (i.deals || []).filter(id => dealById[id]).length ? `<ul class="sol-ul">${i.deals.filter(id => dealById[id]).map(id => { const d = dealById[id]; return `<li><a href="#deal-${esc(id)}">${esc(d.investee)}, ${esc((d.date || "").slice(0, 4))}</a>${d.amount && d.amount.usd ? `: ${usd(d.amount.usd)}` : ""} (${esc(DSTATUS[d.status] || d.status || "")})</li>`; }).join("")}</ul>` : "")}
        ${(i.loops || []).length ? f("Cycles its heat investments touch", `<p>${loopLinks(i.loops)}</p>`) : ""}
      </div>
    </details>`;
const dealRow = d => `<tr id="deal-${esc(d.id)}"><td>${esc(d.date || "")}</td><th scope="row">${esc(d.investee)}</th><td>${esc((d.investors || []).join("; "))}</td>
      <td>${d.amount && d.amount.usd ? usd(d.amount.usd) : "<span class=\"he-dash\">not disclosed</span>"}${d.amount && d.amount.currency && d.amount.currency !== "USD" && d.amount.local ? `<br><small>${esc(Number(d.amount.local).toLocaleString("en-GB"))} ${esc(d.amount.currency)}</small>` : ""}</td>
      <td>${esc(d.instrument || "not established")}</td><td>${esc(DSTATUS[d.status] || d.status || "")}</td><td>${esc(segName(d.segment))}</td><td>${esc((d.countries || []).map(cname).join(", "))}</td><td>${src(d.source) || ""}</td></tr>`;
const PROGTYPE = { prize: "Prize", challenge: "Challenge", accelerator: "Accelerator", incubator: "Incubator", "city-programme": "City programme", "corporate-call": "Corporate call", university: "University programme", "philanthropic-fund": "Philanthropic fund" };
const progCard = a => `<details class="sol he-card" id="prog-${esc(a.id)}" data-type="${esc(a.type || "")}" data-buyers="${esc(a.connects_to_buyers || "")}" data-q="${qtext(a.name, a.run_by, a.focus, a.geography)}">
      <summary><span class="sol-h">${esc(a.name)}</span><span class="sol-tags"><span class="sol-type sol-type--policy">${esc(PROGTYPE[a.type] || a.type || "")}</span><span class="sol-clim">${esc({ yes: "Connects to buyers", partly: "Partly connects to buyers", no: "Does not connect to buyers", unclear: "Buyer link unclear" }[a.connects_to_buyers] || "")}</span></span><span class="sol-sum">${esc(a.focus)}</span></summary>
      <div class="sol-body">
        ${f("Run by", p(a.run_by) + (live(a.url) ? `<p>${ext(a.url, "Programme page")}</p>` : ""))}
        ${f("Where", p((a.geography || []).join("; ")))}
        ${f("What it offers", ul(a.offers))}
        ${f("Cohort", p(a.cohort_size))}
        ${f("Heat ventures it has backed, and what happened next", (a.heat_ventures || []).length ? `<ul class="sol-ul">${a.heat_ventures.map(h => `<li><b>${live(h.url) ? ext(h.url, h.name) : esc(h.name)}</b>${h.year ? ` (${esc(h.year)})` : ""}. ${esc(h.afterwards)} ${src(h.source)}</li>`).join("")}</ul>` : `<p>No named heat participant was established in this review.</p>`)}
        <div class="sol-f sol-kiu"><h4>Evaluation</h4>${p((a.evaluation || {}).text)}${src((a.evaluation || {}).source)}</div>
      </div>
    </details>`;
const money = shell("money", "The heat economy · Money and support", "Who is investing in protection from heat, <br>and who helps ventures grow.",
  `${N.inv} investors and capital routes, ${N.deals} financing events and ${N.prog} accelerators, prizes and challenges. The money recorded here gathers where a buyer, an asset or a service fee is visible. Warnings, paid rest and protection for people who cannot pay need other kinds of money.`,
  `<nav class="sol-jump" aria-label="On this page"><a href="#where">Where the recorded money went</a> · <a href="#investors">Investors</a> · <a href="#deals">Financing events</a> · <a href="#programmes">Accelerators, prizes and challenges</a></nav>
        <section class="cty-s" id="where"><h2>Where the recorded money went</h2>
          <p class="he-intro">These are the financing events this review could verify, not the whole market. Company rounds can fund more than heat. An announced amount is not money received, a credit limit is not a loan drawn, and a programme approval is not cash in a country. So each kind is shown on its own.</p>
          ${flowTable}
          ${Object.keys(bp.by_segment_status || {}).length ? `<div class="he-two"><div><h3 class="he-shelf">Company and project financing, by part of the economy</h3>${split(bp.by_segment_status, segName)}</div><div><h3 class="he-shelf">…and by where the company or project is</h3>${split(bp.by_geography_status, c => c.length === 2 ? cname(c) : c)}</div></div>` : ""}
          <p class="he-note"><b>What this suggests.</b> Most recorded company financing went to air-conditioning technology, building controls, risk analytics and cold chains, and much of it to companies based outside South and Southeast Asia. Very little reached services such as paid rest, warnings that reach everyone, or care for people who cannot pay. That reflects what can be verified as much as what exists, but it matches what the business ideas below show: much of the protection people need has no paying buyer.</p></section>
        <section class="cty-s" id="investors"><h2>Investors and capital routes <span class="he-n">${N.inv}</span></h2>
          <p class="he-intro">A capital route can be a fund, a public institution, a hosted grant-making initiative or an underwriting mechanism. A named investment shows interest in cooling or heat, not a dedicated adaptation mandate, unless stated.</p>
          <div class="sol-bar" role="search">${search("For example: equity, cold chain, development bank")}${sel("type", "Kind of investor", ["Any kind", ...Object.entries(INVTYPE).filter(([k]) => INV.some(i => i.type === k))])}<p class="sol-count" id="he-count" role="status" aria-live="polite"></p></div>
          <div class="he-group">${INV.slice().sort((a, b) => a.name.localeCompare(b.name)).map(invCard).join("\n")}</div></section>
        <section class="cty-s" id="deals"><h2>Financing events <span class="he-n">${N.deals}</span></h2>
          <p class="he-intro">Newest first. Amounts in US dollars use dated reference rates; the original currency is shown where different. “Not disclosed” is not zero.</p>
          <div class="he-tablewrap" role="region" aria-label="Financing events" tabindex="0"><table class="he-table he-table--deals"><caption class="visually-hidden">Financing events for heat and cooling</caption><thead><tr><th scope="col">Date</th><th scope="col">Who received it</th><th scope="col">From</th><th scope="col">Amount</th><th scope="col">Instrument</th><th scope="col">Status</th><th scope="col">Part of the economy</th><th scope="col">Where</th><th scope="col">Source</th></tr></thead>
          <tbody>${DEALS.map(dealRow).join("")}</tbody></table></div></section>
        <section class="cty-s" id="programmes"><h2>Accelerators, prizes and challenges <span class="he-n">${N.prog}</span></h2>
          <p class="he-intro">What each makes possible: finding an innovation, testing it in the right climate, a site to try it, a buyer, money to deliver it, or upkeep. Recognition alone does not create a paying customer or a working public service. Check each programme’s current rules before applying.</p>
          <div class="he-group">${PROG.map(progCard).join("\n")}</div></section>
        <p class="sol-none" id="he-none" hidden>No investor matches. Try fewer filters.</p>`);

// ================= 4. WHAT COULD COME UP =================
// "G3:gef / G4:nature-for-cooling — text": name and link the investors (G3) and programmes (G4) it refers to
const fitLine = x => {
  const m = /^((?:G\d:[\w.-]+\s*(?:\/\s*)?)+)\s*[—–-]\s*([\s\S]*)$/.exec(x); if (!m) return `<li>${esc(x)}</li>`;
  const who = m[1].split("/").map(t => t.trim()).filter(Boolean).map(t => { const [g, id] = t.split(":"); const i = g === "G3" && INV.find(v => v.id === id), a = g === "G4" && PROG.find(v => v.id === id);
    return i ? `<a href="/heat-economy/money/#inv-${esc(id)}">${esc(i.name)}</a>` : a ? `<a href="/heat-economy/money/#prog-${esc(id)}">${esc(a.name)}</a>` : ""; }).filter(Boolean);
  return `<li>${who.length ? `<b>${who.join(" · ")}:</b> ` : ""}${esc(m[2])}</li>`;
};
const oppCard = o => {
  const [vn, vk] = VIABLE[o.viable_market] || ["", ""];
  return `<details class="sol he-card" id="${esc(o.id)}" data-viable="${vk}" data-q="${qtext(o.name, o.who_pays, o.who_benefits, o.revenue_model, (loopById[o.loop] || {}).name)}">
      <summary><span class="sol-h">${esc(o.name)}</span><span class="sol-tags">${tag(o.status)}<span class="he-viable he-viable--${vk}">${esc(vn)}</span></span><span class="sol-sum"><b>Cuts:</b> ${esc(o.link_it_cuts)}</span></summary>
      <div class="sol-body">
        ${f("Who pays, and why", `<p>${esc(o.who_pays)}</p>${o.why_they_pay ? `<p class="sol-note">${esc(o.why_they_pay)}</p>` : ""}`)}
        ${f("Who benefits", p(o.who_benefits))}
        ${f("How it would earn", p(o.revenue_model))}
        ${f("Price it would need", p(o.price_needed))}
        ${f("What has to be true", ul(o.must_be_true))}
        ${f("Closest examples so far", (o.analogues || []).length ? `<ul class="sol-ul">${o.analogues.map(a => `<li>${esc(a.text)} ${src(a.source)}</li>`).join("")}</ul>` : "")}
        ${f("Who would need to buy or co-own it", ul(o.anchor_demand))}
        ${f("Money that could fit", (o.fit_investors || []).length ? `<ul class="sol-ul">${o.fit_investors.map(fitLine).join("")}</ul>` : "")}
        ${f("Risks", p(o.risks))}
        ${o.viable_market !== "yes" && o.if_not_viable ? `<div class="sol-f sol-kiu"><h4>If buyers cannot fund it</h4>${p(o.if_not_viable)}</div>` : ""}
      </div>
    </details>`;
};
const opportunities = shell("opportunities", "The heat economy · What could come up", "Businesses and services that could <br>help break each cycle.",
  `${N.opp} ideas across all 21 vicious cycles, each naming the link it would cut, who would pay and what has to be true. All are labelled design concept: they are proposals to test locally, not proven models or investment advice.`,
  `<p class="he-note"><b>The pattern.</b> ${N.oppPublic} of ${N.opp} ideas need public or pooled money to protect the people they are meant for; ${N.oppYes} could be funded by buyers under the right conditions; and for the melting-ice cycle no direct local market exists. The recurring idea is to buy <b>maintained protection</b> with an accountable buyer and operator, rather than assume that selling a product finishes the job. A supplier can earn from a contract while the protection stays free for the people using it.</p>
        <div class="sol-bar" role="search">${search("For example: trees, clinic, paid rest, school")}${sel("viable", "Who could fund it", ["Any", ["yes", "Buyers could fund it"], ["public", "Needs public or pooled money"], ["no", "No direct market"]])}<p class="sol-count" id="he-count" role="status" aria-live="polite"></p></div>
        ${D.LOOP_GROUPS.map(g => { const ls = D.LOOPS.filter(l => l.group === g.id && OPP.some(o => o.loop === l.id)); return ls.length ? `<h2 class="he-shelf he-shelf--big">${esc(g.name)}</h2>${ls.map(l => `<section class="sol-group he-group" id="loop-${l.id}" aria-labelledby="h-${l.id}"><h3 class="sol-gh" id="h-${l.id}"><a href="/#loop-${l.id}">${esc(l.name)}</a></h3><p class="sol-gp">${esc(l.summary)}</p>
          ${OPP.filter(o => o.loop === l.id).map(oppCard).join("\n")}</section>`).join("\n")}` : ""; }).join("\n")}
        <p class="sol-none" id="he-none" hidden>No idea matches. Try fewer filters.</p>`);

// ================= 5. WHAT MAKES MARKETS WORK =================
const srcs = a => (a || []).filter(s => live(s.url)).map(s => ext(s.url, s.label)).join(" · ");
const polCard = x => `<article class="he-row"><h3>${esc(x.name)}</h3><p class="sol-tags">${tag(x.evidence_status)}${(x.countries || []).map(c => `<span class="sol-clim">${esc(cname(c))}</span>`).join("")}</p>
      <p><b>What is published:</b> ${esc(x.published_fact)}</p><p><b>The demand it could create:</b> ${esc(x.demand_pathway_inference)}</p>
      ${x.who_would_purchase ? `<p><b>Who would buy:</b> ${esc(x.who_would_purchase)}</p>` : ""}<p class="sol-note"><b>Check before relying on it:</b> ${esc(x.verification_limit)}</p><p class="sol-src">${srcs(x.sources)}</p></article>`;
const finCard = x => `<article class="he-row"><h3>${esc(x.name)}</h3><p class="sol-tags">${tag(x.evidence_status)}</p>
      <p>${esc(x.mechanism)}</p><p><b>Example:</b> ${esc(x.documented_example)}</p><p><b>Who pays:</b> ${esc(x.who_pays)} <b>Who benefits:</b> ${esc(x.who_benefits)}</p>
      <p><b>Reaching people on low incomes:</b> ${esc(x.low_income_access_evidence)}</p>
      ${(x.conditions_for_fair_use || []).length ? `<p><b>Conditions for fair use:</b></p>${ul(x.conditions_for_fair_use)}` : ""}<p class="sol-note"><b>Risks:</b> ${esc(Array.isArray(x.risks) ? x.risks.join(" ") : x.risks)}</p><p class="sol-src">${srcs(x.sources)}</p></article>`;
const barCard = x => `<article class="he-row"><h3>${esc(x.name)}</h3><p class="sol-tags">${tag(x.evidence_status)}</p>
      <p><b>What the evidence shows:</b> ${esc(x.documented_evidence)}</p><p><b>Effect on the market:</b> ${esc(x.market_effect_inference)}</p><p><b>A suggested response:</b> ${esc(x.suggested_response)}</p><p class="sol-src">${srcs(x.sources)}</p></article>`;
const C = COND;
const conditions = shell("conditions", "The heat economy · What makes markets work", "What turns a need for protection <br>into a fair market.",
  `The rules that create demand, the ways of paying that reach people on low incomes, the barriers, a checklist of fairness questions to ask before buying or backing anything, and what each kind of institution could do.`,
  `<p class="he-note"><b>Three distinctions run through this.</b> A strategy can coordinate action without creating any obligation to buy. A way of financing can lower the upfront cost while still excluding the people in greatest need. And money to install protection is not money to run it. None of this lessens the value of any mechanism; each shows what must also be secured.</p>
        <nav class="sol-jump" aria-label="On this page"><a href="#fairness">Fairness questions</a> · <a href="#policies">Rules that create demand</a> · <a href="#finance">Ways of paying</a> · <a href="#barriers">Barriers</a> · <a href="#roles">What each institution could do</a></nav>
        <section class="cty-s" id="fairness"><h2>${(C.fairness_checks || []).length} questions to ask before buying or backing a heat product or service</h2>
          <p class="he-intro">For cities, employers, funders, investors and worker organisations. These are researcher-designed due-diligence questions, not an official certification or a score.</p>
          <ol class="he-checks">${(C.fairness_checks || []).map(x => `<li><b>${esc(x.question)}</b><span>${esc(x.suggested_follow_up)}</span></li>`).join("")}</ol></section>
        <section class="cty-s" id="policies"><h2>Rules that create demand</h2><p class="he-intro">Each is a verified Asian example. A published rule is not the same as compliance or coverage achieved.</p><div class="he-rows">${(C.policies || []).map(polCard).join("")}</div></section>
        <section class="cty-s" id="finance"><h2>Ways of paying that can reach people on low incomes</h2><div class="he-rows">${(C.finance_structures || []).map(finCard).join("")}</div></section>
        <section class="cty-s" id="barriers"><h2>Barriers</h2><div class="he-rows">${(C.barriers || []).map(barCard).join("")}</div></section>
        <section class="cty-s" id="roles"><h2>What each kind of institution could do</h2><p class="he-intro">Suggestions, not commitments or statements of any institution’s current mandate.</p>
          <div class="he-roles">${(C.actor_roles || []).map(x => `<article class="he-role"><h3>${esc(inst(x.institution_type) || x.name)}</h3>${ul(x.suggestions)}</article>`).join("")}</div></section>
        ${(C.known || []).length ? `<section class="cty-s"><h2>Known, inferred, uncertain</h2><p><b>Known:</b> ${esc((C.known || []).join(" "))}</p><p><b>Inferred:</b> ${esc((C.inferred || []).join(" "))}</p><p><b>Uncertain:</b> ${esc((C.uncertain || []).join(" "))}</p></section>` : ""}`);

// ---- write the pages ----
const write = (slug, title, desc, body, script = "") => { const dir = path.join(ROOT, slug); fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, "index.html"), page({ slug, title, desc, body, script })); };
write("heat-economy", "The heat economy", "The businesses selling protection from extreme heat in Asia, who invests in them, what could come up, and what makes a fair market, tied to the cycles they can help break.", overview);
write("heat-economy/businesses", "Businesses selling protection from heat", `${N.biz} businesses already selling protection from extreme heat, ${N.bizAsia} with offers in South or Southeast Asia, with their models, prices, trade-offs and evidence.`, businesses, FILTER("he-count", "businesses"));
write("heat-economy/money", "Money and support for the heat economy", `${N.inv} investors and capital routes, ${N.deals} financing events and ${N.prog} accelerators, prizes and challenges in protection from extreme heat.`, money, FILTER("he-count", "investors and programmes"));
write("heat-economy/opportunities", "Businesses that could help break heat’s cycles", `${N.opp} business and service ideas across 21 vicious cycles of extreme heat: who would pay, what has to be true, and where public money is needed.`, opportunities, FILTER("he-count", "ideas"));
write("heat-economy/conditions", "What makes a fair heat-resilience market", "Rules that create demand, ways of paying, barriers, fairness questions and roles for every institution in protection from extreme heat.", conditions);

// ---- CSV downloads ----
const cell = v => { let s = Array.isArray(v) ? v.join("; ") : v == null ? "" : String(v); if (/^https?:\/\/\S+$/.test(s) && !live(s)) s = ""; // links that failed the check are left out, as on the pages
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const csv = (file, head, rows) => { fs.mkdirSync(path.join(ROOT, "heat-economy", "data"), { recursive: true }); fs.writeFileSync(path.join(ROOT, "heat-economy", "data", file + ".csv"), "﻿" + [head, ...rows].map(r => r.map(cell).join(",")).join("\r\n") + "\r\n"); };
const loopNames = ids => (ids || []).map(id => (loopById[id] || {}).name).filter(Boolean);
csv("businesses", ["Business", "Part of the economy", "Kind", "Side", "Headquarters", "Countries", "Offers in South or Southeast Asia", "Product", "Business model", "Customer", "User", "Price (local)", "Currency", "Dry or humid heat", "Reaches the poorest", "Cycles it can act on", "How it could cut a cycle", "Risks", "Website", "Source", "Checked"],
  BIZ.map(b => [b.name, segName(b.segment), KIND[b.kind] || b.kind, b.side, cname(b.hq_country), (b.countries || []).map(cname), inAsia(b) ? "yes" : "no", b.product, b.business_model, b.customer, b.user, (b.price || {}).local, (b.price || {}).currency, b.suits, b.reaches_poorest, loopNames(b.loops), b.link_it_cuts, b.risks, b.url, ((b.evidence || [])[0] || {}).source ? b.evidence[0].source.url : "", (b.reach || {}).date || ""]));
csv("investors", ["Investor or capital route", "Kind", "Side", "Where", "Link to heat", "Instruments", "Stages", "Cheque size", "Adaptation window", "Parts of the economy", "Cycles", "Website", "Source", "Checked"],
  INV.map(i => [i.name, INVTYPE[i.type] || i.type, i.side, i.geography, (i.heat_thesis || {}).text, i.instruments, i.stages, (i.ticket_size || {}).text, i.adaptation_window, (i.segments || []).map(segName), loopNames(i.loops), i.url, ((i.heat_thesis || {}).source || {}).url, i.last_checked]));
csv("deals", ["Date", "Recipient", "From", "Amount (original)", "Currency", "Amount (US$)", "Exchange rate note", "Instrument", "Stage", "Status", "Heat-specific use", "Part of the economy", "Countries", "Cycles", "Source"],
  DEALS.map(d => [d.date, d.investee, d.investors, (d.amount || {}).local, (d.amount || {}).currency, (d.amount || {}).usd, (d.amount || {}).fx, d.instrument, d.stage, d.status, d.heat_specific_use, segName(d.segment), (d.countries || []).map(cname), loopNames(d.loops), (d.source || {}).url]));
csv("programmes", ["Programme", "Run by", "Kind", "Where", "Focus", "Offers", "Cohort", "Heat ventures", "Connects to buyers", "Evaluation", "Website", "Checked"],
  PROG.map(a => [a.name, a.run_by, PROGTYPE[a.type] || a.type, a.geography, a.focus, a.offers, a.cohort_size, (a.heat_ventures || []).map(h => h.name), a.connects_to_buyers, (a.evaluation || {}).text, a.url, a.last_checked]));
csv("opportunities", ["Idea", "Cycle", "Link it cuts", "Evidence label", "Who could fund it", "Who pays", "Why they pay", "Who benefits", "Revenue model", "Price needed", "What has to be true", "Who would need to buy or co-own it", "Risks", "If buyers cannot fund it"],
  OPP.map(o => [o.name, (loopById[o.loop] || {}).name || o.loop, o.link_it_cuts, o.status, (VIABLE[o.viable_market] || [""])[0], o.who_pays, o.why_they_pay, o.who_benefits, o.revenue_model, o.price_needed, o.must_be_true, o.anchor_demand, o.risks, o.if_not_viable]));
csv("segments", ["Part of the economy", "Type", "Definition", "Maturity", "Who pays", "Who benefits", "Business models", "Reaches the poorest", "How", "Cycles", "Businesses in this review"],
  SEG.map(s => [s.name, TYPE[s.type] || s.type, s.definition, s.maturity, s.who_pays, s.who_benefits, s.business_models, s.reaches_poorest, s.reaches_poorest_how, loopNames(s.loops), bizBySeg(s.id)]));

// the cycles' "Business ideas" links on the map and /loops/ read this
module.exports = { loopsWithIdeas: [...new Set(OPP.map(o => o.loop))] };
console.log(`heat economy: ${N.biz} businesses, ${N.inv} investors, ${N.deals} financing events, ${N.prog} programmes, ${N.opp} ideas, ${SEG.length} segments`);
