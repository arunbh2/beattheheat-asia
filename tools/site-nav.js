// One navigation for every page: the same header, menu, breadcrumb and site map, wherever a reader lands.
// Groups follow what a reader needs to do, not how the site was built. Used by tools/build-nav.js.
"use strict";

const GROUPS = [
  { h: "Understand heat", id: "understand", items: [
    ["/#explore", "The map", "Every consequence of heat, and how each leads to the next"],
    ["/#loops", "Breaking the cycles", "The vicious cycles, and where they can be cut"],
    ["/#day", "A day in a heatwave", "Eight hours, seven places across Asia"],
    ["/who-is-at-risk/", "Who heat hits hardest", "Same heatwave, different barriers"],
    ["/heatwaves/", "Heatwaves that shaped Asia", "Ten heatwaves, 1998 to 2026"],
    ["/cities/", "Cities", "Heat, plans and cycles in twelve cities"],
    ["/countries/", "Countries", "Seven national snapshots"],
  ] },
  { h: "Act", id: "act", items: [
    ["/practical/", "Practical actions", "What to do, by setting, and what keeps it working"],
    ["/solutions/", "Solutions library", "131 solutions, with their evidence"],
    ["/cooling-options/", "Cooling options", "What to build where people are"],
    ["/plan/", "Plan a response", "Turn the map into a one-page plan"],
    ["/worked-plans/", "Worked plans", "Plans already written for real places"],
    ["/together/", "Make it work together", "A coordinator’s simulation for one place"],
    ["/a-week-in-the-heat/", "A week in the heat", "Follow one worker’s money and protection"],
  ] },
  { h: "Fund and build", id: "fund", items: [
    ["/finance/", "Paying for protection", "Who pays, how money arrives, whether it lasts"],
    ["/heat-economy/", "The heat economy", "Businesses, funding and ideas, and what to ask"],
    ["/heat-network/", "The heat network", "Organisations already at work"],
    ["/join/", "Help build Common Shade", "Add evidence, correct us, partner"],
  ] },
  { h: "News and evidence", id: "evidence", items: [
    ["/news/", "Heat in the news", "Headlines and new research, refreshed automatically"],
    ["/lancet-countdown-2026/", "Lancet Countdown 2026", "The decade’s health evidence, by what you need to do"],
    ["/sources/", "Sources and references", "Every source the site cites"],
    ["/glossary/", "Glossary", "Heat terms in plain language"],
    ["/print/", "Printable one-pagers", "Briefs for officials, partners and funders"],
    ["/guide/", "How to use this site", "Paths, the toolkit and a workshop guide"],
  ] },
];

// The headline links: the few places most readers go next.
const PRIMARY = [
  ["/#explore", "The map"], ["/#loops", "Breaking the cycles"], ["/practical/", "Practical actions"],
  ["/solutions/", "Solutions"], ["/heat-economy/", "Heat economy"], ["/news/", "News"], ["/lancet-countdown-2026/", "Evidence"],
];

// Text versions of the interactive map: plain HTML for slow connections, screen readers and search.
const TEXT = [
  ["/the-web/", "The web"], ["/loops/", "Vicious cycles"], ["/actions/", "Actions"], ["/practical-actions/", "Practical actions"],
  ["/paying-for-protection/", "Paying for protection"],
];

// Names for path segments that are not group items.
const NAMES = {
  "/loops/": "Vicious cycles (text)", "/actions/": "Actions (text)", "/the-web/": "The web (text)",
  "/practical-actions/": "Practical actions (text)", "/paying-for-protection/": "Paying for protection (text)",
  "/heat-economy/businesses/": "Businesses", "/heat-economy/money/": "Funding and support",
  "/heat-economy/opportunities/": "Ideas", "/heat-economy/conditions/": "Questions to ask",
};
GROUPS.forEach(g => g.items.forEach(([u, t]) => { if (u.endsWith("/") && !NAMES[u]) NAMES[u] = t; }));

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// The link that best matches this page: exact match first, then the deepest section that contains it.
function currentOf(pathname, links) {
  let best = null;
  for (const u of links) {
    if (u.includes("#")) continue;
    if (pathname === u || (u !== "/" && pathname.startsWith(u))) if (!best || u.length > best.length) best = u;
  }
  return best;
}

function crumbs(pathname, title) {
  const parts = pathname.split("/").filter(Boolean);
  const out = [["/", "Home"]];
  let acc = "/";
  parts.forEach((p, i) => {
    acc += p + "/";
    const last = i === parts.length - 1;
    out.push([acc, last ? (NAMES[acc] || title) : (NAMES[acc] || p.replace(/-/g, " ").replace(/^./, c => c.toUpperCase()))]);
  });
  return out;
}

function header(pathname, title) {
  const all = GROUPS.flatMap(g => g.items.map(i => i[0]));
  const cur = currentOf(pathname, all);
  const curP = currentOf(pathname, PRIMARY.map(p => p[0]));
  const ac = u => (u === cur ? ' aria-current="page"' : "");
  const c = crumbs(pathname, title);
  return `<header class="csn" id="top">
  <div class="csn__in">
    <a class="csn__home" href="/"><span class="csn__mark" aria-hidden="true"></span>COMMON SHADE<span class="csn-vh">: home, the map of extreme heat</span></a>
    <nav class="csn__primary" aria-label="Main sections">${PRIMARY.map(([u, t]) => `<a href="${u}"${u === curP ? ' aria-current="page"' : ""}>${esc(t)}</a>`).join("")}</nav>
    <details class="csn__menu">
      <summary><span class="csn__burger" aria-hidden="true"><i></i><i></i><i></i></span>All sections</summary>
      <nav class="csn__panel" aria-label="All sections">
        ${GROUPS.map(g => `<div class="csn__group"><h2 id="csn-${g.id}">${esc(g.h)}</h2><ul aria-labelledby="csn-${g.id}">${g.items.map(([u, t, d]) => `<li><a href="${u}"${ac(u)}><b>${esc(t)}</b><small>${esc(d)}</small></a></li>`).join("")}</ul></div>`).join("\n        ")}
        <p class="csn__text">Text versions, for slow connections and screen readers: ${TEXT.map(([u, t]) => `<a href="${u}">${esc(t)}</a>`).join(" · ")}</p>
      </nav>
    </details>
  </div>
  ${c.length > 1 ? `<nav class="csn__crumbs" aria-label="You are here"><ol>${c.map(([u, t], i) => i === c.length - 1 ? `<li aria-current="page">${esc(t)}</li>` : `<li><a href="${u}">${esc(t)}</a></li>`).join("")}</ol></nav>` : ""}
</header>`;
}

function footer(pathname) {
  const all = GROUPS.flatMap(g => g.items.map(i => i[0]));
  const cur = currentOf(pathname, all);
  return `<nav class="csf" aria-label="Site map">
  <div class="csf__in">
    <div class="csf__top"><a class="csf__home" href="/">COMMON SHADE</a><span>Seeing extreme heat as a whole, so the right people can act. Plain language, sources linked.</span><a class="csf__up" href="#top">Back to top <span aria-hidden="true">↑</span></a></div>
    <div class="csf__grid">
      ${GROUPS.map(g => `<div><h2>${esc(g.h)}</h2><ul>${g.items.map(([u, t]) => `<li><a href="${u}"${u === cur ? ' aria-current="page"' : ""}>${esc(t)}</a></li>`).join("")}</ul></div>`).join("\n      ")}
    </div>
    <p class="csf__text">Text versions: ${TEXT.map(([u, t]) => `<a href="${u}">${esc(t)}</a>`).join(" · ")} · <a href="/llms-full.txt">Everything as one text file</a></p>
  </div>
</nav>`;
}

// Self-contained, so it looks the same on pages with the full stylesheet and on the light text pages.
const CSS = `html:has(.csn){scroll-padding-top:104px}
.csn,.csf{--csn-ink:#16202B;--csn-canvas:#FAF7F2;--csn-line:#E6DFD4;--csn-orange:#F26430;--csn-grey:#39424D;font-family:"Hanken Grotesk","Segoe UI",Roboto,Arial,sans-serif;color:var(--csn-ink);line-height:1.4}
.csn{position:sticky;top:0;z-index:50;max-width:none!important;margin:0!important;padding:0!important;display:block!important;background:rgba(250,247,242,.97);border-bottom:1px solid var(--csn-line);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
.csn a,.csf a{color:var(--csn-ink);text-decoration:none;margin:0}
.csn__in{max-width:1240px;margin:0 auto;padding:0 clamp(16px,3vw,32px);min-height:58px;display:flex;align-items:center;gap:8px 22px}
.csn__home{display:inline-flex;align-items:center;gap:9px;font-family:Anton,Impact,"Arial Narrow",sans-serif;font-size:1.12rem;letter-spacing:.05em;white-space:nowrap;margin:0!important}
.csn__mark{width:22px;height:22px;border-radius:6px;background:var(--csn-ink);position:relative;flex:none}
.csn__mark::before{content:"";position:absolute;left:4px;right:4px;top:5px;height:7px;border:3px solid var(--csn-orange);border-bottom:0;border-radius:10px 10px 0 0}
.csn__primary{display:flex;gap:2px 16px;flex-wrap:wrap;font-size:.9rem;font-weight:700;flex:1;min-width:0}
.csn__primary a{padding:6px 0;margin:0!important;border-bottom:2px solid transparent}
.csn__primary a:hover{border-bottom-color:var(--csn-orange)}
.csn__primary a[aria-current]{border-bottom-color:var(--csn-ink)}
.csn__menu{margin-left:auto;position:static}
.csn__menu>summary{list-style:none;cursor:pointer;display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:6px 14px;border:1.5px solid var(--csn-ink);border-radius:999px;font-weight:700;font-size:.88rem;white-space:nowrap;background:#fff}
.csn__menu>summary::-webkit-details-marker{display:none}
.csn__menu[open]>summary{background:var(--csn-ink);color:var(--csn-canvas)}
.csn__burger{display:inline-grid;gap:3px}.csn__burger i{display:block;width:14px;height:2px;background:currentColor;border-radius:2px}
.csn__panel{position:absolute;left:0;right:0;top:100%;max-height:calc(100vh - 70px);overflow:auto;background:var(--csn-canvas);border-bottom:1px solid var(--csn-line);box-shadow:0 18px 40px -18px rgba(22,32,43,.35);padding:22px clamp(16px,3vw,32px) 26px;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px 28px}
.csn__group h2,.csf h2{margin:0 0 8px!important;padding:0!important;border:0!important;font-family:inherit!important;font-size:.72rem!important;font-weight:800!important;letter-spacing:.14em;text-transform:uppercase;color:var(--csn-grey)}
.csn__group ul,.csf ul{list-style:none;margin:0;padding:0;display:grid;gap:2px}
.csn__group a{display:grid;gap:1px;padding:7px 10px;border-radius:8px;border-left:3px solid transparent}
.csn__group a:hover{background:#fff;border-left-color:var(--csn-orange)}
.csn__group a[aria-current]{background:#fff;border-left-color:var(--csn-ink)}
.csn__group a[aria-current] b::after{content:" · you are here";font-weight:600;font-size:.78rem;color:var(--csn-grey)}
.csn__group b{font-size:.95rem}.csn__group small{font-size:.8rem;color:var(--csn-grey)}
.csn__text{grid-column:1/-1;margin:4px 0 0;font-size:.82rem;color:var(--csn-grey)}
.csn__text a,.csf__text a{text-decoration:underline;text-decoration-color:var(--csn-orange);text-underline-offset:3px}
.csn__crumbs{max-width:1240px;margin:0 auto;padding:0 clamp(16px,3vw,32px) 8px;font-size:.8rem;color:var(--csn-grey)}
.csn__crumbs ol{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:2px 0}
.csn__crumbs li{display:inline}.csn__crumbs li+li::before{content:"›";margin:0 8px;color:var(--csn-orange)}
.csn__crumbs a{text-decoration:underline;text-decoration-color:var(--csn-line);text-underline-offset:3px;color:var(--csn-grey)}
.csn__crumbs [aria-current]{color:var(--csn-ink);font-weight:700}
.csn a:focus-visible,.csn summary:focus-visible,.csf a:focus-visible{outline:3px solid var(--csn-orange);outline-offset:3px;border-radius:4px}
.csn-vh{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.csn-skip{position:absolute;left:12px;top:-60px;z-index:60;padding:10px 16px;background:#16202B;color:#FAF7F2!important;font-weight:700;border-radius:0 0 8px 8px}.csn-skip:focus{top:0}
.csf{margin-top:56px;background:#16202B;color:#FAF7F2;max-width:none!important;padding:0!important}
.csf a{color:#FAF7F2}.csf a:hover{text-decoration:underline;text-decoration-color:var(--csn-orange);text-underline-offset:3px}
.csf h2{color:#C9C2B6!important}
.csf__in{max-width:1240px;margin:0 auto;padding:34px clamp(16px,3vw,32px) 30px}
.csf__top{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 18px;padding-bottom:20px;margin-bottom:22px;border-bottom:1px solid rgba(250,247,242,.18);font-size:.9rem;color:#C9C2B6}
.csf__home{font-family:Anton,Impact,"Arial Narrow",sans-serif;font-size:1.2rem;letter-spacing:.05em}
.csf__up{margin-left:auto;font-weight:700}
.csf__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:22px 28px}
.csf li{font-size:.9rem}.csf a[aria-current]{font-weight:800;text-decoration:underline;text-decoration-color:var(--csn-orange)}
.csf__text{margin:24px 0 0;font-size:.82rem;color:#C9C2B6}
@media (max-width:1100px){.csn__primary a:nth-child(n+5){display:none}}
@media (max-width:760px){.csn__primary{display:none}.csn__in{min-height:54px}.csn__menu>summary{padding:6px 12px}.csn__panel{grid-template-columns:1fr;max-height:calc(100vh - 60px)}}
@media print{.csn,.csf,.csn-skip{display:none!important}}`;

// Closes the menu with Escape, an outside tap, or after choosing a link on the same page.
const JS = `(function(){var d=document.querySelector(".csn__menu");if(!d)return;var s=d.querySelector("summary");document.addEventListener("keydown",function(e){if(e.key==="Escape"&&d.open){d.open=false;s.focus();}});document.addEventListener("click",function(e){if(d.open&&!d.contains(e.target))d.open=false;});d.addEventListener("click",function(e){if(e.target.closest("a"))d.open=false;});})();`;

module.exports = { GROUPS, PRIMARY, TEXT, header, footer, CSS, JS, esc };
