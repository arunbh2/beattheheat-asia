// One navigation for every page, the home page included: header, menu panels, phone menu, search, guided paths,
// breadcrumb and footer. Its words live in data/site/nav.json and data/site/paths.json; this file only draws them.
// Used by tools/build-nav.js. Self-contained styles, so it looks the same on the full pages and on the light text pages.
"use strict";
const fs = require("fs"), path = require("path");
const SITE_DIR = path.join(__dirname, "..", "data", "site");
const NAV = JSON.parse(fs.readFileSync(path.join(SITE_DIR, "nav.json"), "utf8"));
const PATHS = JSON.parse(fs.readFileSync(path.join(SITE_DIR, "paths.json"), "utf8"));
const GROUPS = NAV.groups;

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const items = g => g.items.map(([u, t, d, tier]) => ({ u, t, d, tier }));
const NAMES = { ...NAV.names };
GROUPS.forEach(g => { NAMES[g.hub] = NAMES[g.hub] || g.h; [g.lead, ...g.items].forEach(([u, t]) => { if (u.endsWith("/") && !NAMES[u]) NAMES[u] = t; }); });
const TEXT = GROUPS.flatMap(g => items(g).filter(i => i.tier === 2 && /\btext\b/i.test(i.d + i.t)).map(i => [i.u, i.t.replace(/, as text$/, "")]));

// which group a page belongs to: its hub, its lead, any of its items, or a section inside one
function groupOf(pathname) {
  let best = null, len = 0;
  for (const g of GROUPS) for (const u of [g.hub, g.lead[0], ...g.items.map(i => i[0])]) {
    if (u.includes("#")) continue;
    if ((pathname === u || (u !== "/" && pathname.startsWith(u))) && u.length > len) { best = g; len = u.length; }
  }
  return best;
}
function currentOf(pathname) {
  let best = null;
  for (const g of GROUPS) for (const u of [g.lead[0], ...g.items.map(i => i[0])]) {
    if (u.includes("#")) continue;
    if (pathname === u || (u !== "/" && pathname.startsWith(u))) if (!best || u.length > best.length) best = u;
  }
  return best;
}
function crumbs(pathname, title) {
  const parts = pathname.split("/").filter(Boolean), out = [["/", "Home"]], g = groupOf(pathname);
  if (g && pathname !== g.hub) out.push([g.hub, g.h]);
  let acc = "/";
  parts.forEach((p, i) => { acc += p + "/"; const last = i === parts.length - 1;
    if (g && acc === g.hub) return;
    out.push([acc, last ? (NAMES[acc] || title) : (NAMES[acc] || p.replace(/-/g, " ").replace(/^./, c => c.toUpperCase()))]); });
  return out;
}

const MARK = `<svg class="csn__mark" viewBox="0 0 26 20" aria-hidden="true"><path d="M2.5 8 Q13 -1 23.5 8" fill="none" stroke="#F26430" stroke-width="4" stroke-linecap="round"/><path d="M6.5 7 V18.5 M19.5 7 V18.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>`;
const CHEV = `<svg class="csn__chev" viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5 L6 6.5 L11 1.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const LENS = `<svg class="csn__ico" viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M13 13 L18 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`;

function panel(g, cur) {
  const ac = u => (u === cur ? ' aria-current="page"' : "");
  return `<div class="csn__panel" id="csn-p-${g.id}" role="region" aria-label="${esc(g.h)}" hidden><div class="csn__pin">
      <a class="csn__lead" href="${g.lead[0]}"${ac(g.lead[0])}><span class="csn__k">Start with</span><b>${esc(g.lead[1])}</b><span>${esc(g.lead[2])}</span><span class="csn__go">Open <span aria-hidden="true">→</span></span></a>
      <ul class="csn__links">${items(g).filter(i => i.tier === 1).map(i => `<li><a href="${i.u}"${ac(i.u)}><b>${esc(i.t)}</b><small>${esc(i.d)}</small></a></li>`).join("")}</ul>
      <div class="csn__side"><p class="csn__k">For you</p><div class="csn__foryou" data-csn-foryou="${g.id}"><p>Choose a path by role, and your next stops appear here.</p><button type="button" class="csn__btn" data-csn-paths>Choose a path</button></div>
        <a class="csn__hub" href="${g.hub}">Everything in ${esc(g.h)} <span aria-hidden="true">→</span></a></div>
    </div></div>`;
}

function header(pathname, title) {
  const cur = currentOf(pathname), g0 = groupOf(pathname), c = crumbs(pathname, title);
  return `<header class="csn" id="top">
  <div class="csn__in">
    <a class="csn__home" href="/">${MARK}<span>COMMON SHADE</span><span class="csn-vh">: home, the map of extreme heat</span></a>
    <nav class="csn__main" aria-label="Main">
      <ul class="csn__groups">${GROUPS.map(g => `<li><button type="button" class="csn__gb${g === g0 ? " is-here" : ""}" aria-expanded="false" aria-controls="csn-p-${g.id}" data-g="${g.id}">${esc(g.label)}${CHEV}</button><a class="csn__gl" href="${g.hub}">${esc(g.label)}</a>
        ${panel(g, cur)}</li>`).join("")}</ul>
    </nav>
    <div class="csn__tools">
      <button type="button" class="csn__search" data-csn-search aria-label="Search the site">${LENS}<span>Search</span><kbd aria-hidden="true">/</kbd></button>
      <button type="button" class="csn__start" data-csn-paths><span class="csn__dot" aria-hidden="true"></span><span data-csn-pathlabel>Start here</span></button>
      <button type="button" class="csn__burger" aria-expanded="false" aria-controls="csn-sheet"><span class="csn__bars" aria-hidden="true"><i></i><i></i><i></i></span>Menu</button>
    </div>
  </div>
  ${c.length > 1 ? `<nav class="csn__crumbs" aria-label="You are here"><ol>${c.map(([u, t], i) => i === c.length - 1 ? `<li aria-current="page">${esc(t)}</li>` : `<li><a href="${u}">${esc(t)}</a></li>`).join("")}</ol></nav>` : ""}
  <div class="csn__pathbar" data-csn-pathbar hidden></div>
  <div class="csn__sheet" id="csn-sheet" hidden>
    <div class="csn__sheet-tools"><button type="button" class="csn__btn csn__btn--wide" data-csn-search>${LENS} Search the site</button><button type="button" class="csn__btn csn__btn--wide csn__btn--warm" data-csn-paths>Start here: choose a path by role</button></div>
    ${GROUPS.map(g => `<details class="csn__acc"${g === g0 ? " open" : ""}><summary>${esc(g.h)}${CHEV}</summary><ul>
      <li><a class="csn__acc-lead" href="${g.lead[0]}"><b>${esc(g.lead[1])}</b><small>${esc(g.lead[2])}</small></a></li>
      ${items(g).filter(i => i.tier === 1).map(i => `<li><a href="${i.u}"${i.u === cur ? ' aria-current="page"' : ""}><b>${esc(i.t)}</b><small>${esc(i.d)}</small></a></li>`).join("")}
      <li><a class="csn__hub" href="${g.hub}">Everything in ${esc(g.h)} <span aria-hidden="true">→</span></a></li></ul></details>`).join("\n    ")}
  </div>
  <dialog class="csn-d" id="csn-search-d" aria-label="Search the site"><form method="dialog" class="csn-d__bar"><label class="csn-vh" for="csn-q">Search the site</label>${LENS}<input id="csn-q" type="search" placeholder="Search: a city, a term, a solution, a funder…" autocomplete="off"><button class="csn-d__x" aria-label="Close search">Esc</button></form><p class="csn-d__hint" id="csn-hint">Pages, places, cycles and the glossary. Use ↑ ↓ and Enter.</p><ul class="csn-d__res" id="csn-res" role="listbox" aria-label="Results"></ul></dialog>
  <dialog class="csn-d csn-d--paths" id="csn-paths-d" aria-labelledby="csn-paths-h"><form method="dialog"><button class="csn-d__x csn-d__x--top" aria-label="Close">Close</button></form><div id="csn-paths-body"></div></dialog>
</header>`;
}

// the full card on a page that is a stop on a path, shown only to readers on that path
function pathCards(pathname) {
  const out = [];
  for (const p of PATHS.paths) p.stops.forEach((s, i) => {
    if (s.url !== pathname) return;
    const next = p.stops[i + 1], n = p.stops.length;
    out.push(`<aside class="csp" data-csp="${p.id}" aria-label="Your path: ${esc(p.label)}" hidden>
  <p class="csp__k">${esc(p.short)} path · Stop ${i + 1} of ${n}</p>
  <p class="csp__q">${esc(s.q)}</p>
  <p class="csp__why">${esc(s.why)}</p>
  ${s.read.length ? `<p class="csp__read"><b>Read first:</b> ${s.read.map(([a, t]) => `<a href="${a}">${esc(t)}</a>`).join(" · ")}</p>` : ""}
  ${s.do ? `<p class="csp__do"><b>Then:</b> <a href="${s.do[0]}">${esc(s.do[1])}</a></p>` : ""}
  <p class="csp__next">${next ? `<a class="csp__go" href="${next.url}">Next stop: ${esc(next.q)} <span aria-hidden="true">→</span></a>` : `<a class="csp__go" href="${PATHS.end.url}">Last stop: ${esc(PATHS.end.q)} <span aria-hidden="true">→</span></a>`}<button type="button" class="csp__leave" data-csn-leave>Leave the path</button></p>
</aside>`);
  });
  return out.join("\n");
}

function footer(pathname, title, updated) {
  const cur = currentOf(pathname), url = "beattheheat.asia" + pathname;
  return `<nav class="csf" aria-label="Site map">
  <div class="csf__in">
    <div class="csf__top"><a class="csf__home" href="/">COMMON SHADE</a><span>A shared map for everyone working to protect people from extreme heat in South and Southeast Asia. Plain language, every claim sourced.</span><a class="csf__up" href="#top">Back to top <span aria-hidden="true">↑</span></a></div>
    <div class="csf__grid">
      ${GROUPS.map(g => `<div><h2><a href="${g.hub}">${esc(g.h)}</a></h2><ul>${[g.lead, ...g.items].filter(i => (i[3] || 1) === 1).map(([u, t]) => `<li><a href="${u}"${u === cur ? ' aria-current="page"' : ""}>${esc(t)}</a></li>`).join("")}</ul></div>`).join("\n      ")}
    </div>
    <p class="csf__extra">${NAV.footer_extra.map(([u, t]) => `<a href="${u}">${esc(t)}</a>`).join("")}</p>
    <p class="csf__cite"><b>Cite this page:</b> <span data-csn-cite>Common Shade. “${esc(title)}.” ${esc(url)}. Updated ${esc(updated)}. CC BY 4.0.</span> <button type="button" class="csf__copy" data-csn-copy>Copy</button></p>
    <p class="csf__text">Text versions, for slow connections and screen readers: ${TEXT.map(([u, t]) => `<a href="${u}">${esc(t)}</a>`).join(" · ")}</p>
  </div>
</nav>`;
}

const CSS = `html:has(.csn){scroll-padding-top:120px}
.csn,.csf,.csn-d,.csp{--ink:#16202B;--ink2:#39424D;--grey:#5E6570;--canvas:#FAF7F2;--sand:#F2E7D9;--line:#E6DFD4;--orange:#F26430;--ember:#B8401A;--green:#17703A;font-family:"Hanken Grotesk","Segoe UI",Roboto,Arial,sans-serif;color:var(--ink);line-height:1.4}
.csn{position:sticky;top:0;z-index:60;margin:0!important;padding:0!important;max-width:none!important;display:block!important;background:rgba(250,247,242,.96);border-bottom:1px solid var(--line);-webkit-backdrop-filter:saturate(1.2) blur(10px);backdrop-filter:saturate(1.2) blur(10px)}
.csn a,.csf a,.csn-d a,.csp a{color:var(--ink);margin:0}
:where(.csn,.csn-d,.csf,.csp) button{font:inherit;color:inherit;cursor:pointer}
.csn__in{max-width:1280px;margin:0 auto;padding:0 clamp(16px,3vw,32px);height:64px;display:flex;align-items:center;gap:12px;transition:height .2s ease}
.csn--slim .csn__in{height:56px}
.csn__home{display:inline-flex;align-items:center;gap:10px;font-family:Anton,Impact,"Arial Narrow",sans-serif;font-size:1.18rem;letter-spacing:.06em;text-decoration:none;white-space:nowrap;margin-right:clamp(8px,2vw,28px)!important}
.csn__mark{width:30px;height:23px;color:var(--ink);flex:none}
.csn__main{flex:1;min-width:0;height:100%}
.csn__groups{list-style:none;margin:0;padding:0;display:flex;align-items:center;gap:2px;height:100%}
.csn__groups>li{height:100%;display:flex;align-items:center}
.csn__gb{position:relative;display:inline-flex;align-items:center;gap:7px;height:40px;padding:0 14px;border:0;border-radius:999px;background:none;font-weight:700!important;font-size:.95rem!important}
.csn__gb:hover{background:#fff}
.csn__gb[aria-expanded="true"]{background:var(--ink);color:var(--canvas)}
.csn__gb.is-here::after{content:"";position:absolute;left:14px;right:28px;bottom:3px;height:3px;border-radius:3px;background:var(--orange)}
.csn__gb[aria-expanded="true"]::after{display:none}
.csn__chev{width:11px;height:8px;transition:transform .2s ease}
.csn__gb[aria-expanded="true"] .csn__chev{transform:rotate(180deg)}
.csn__gl{display:none}
.csn__tools{display:flex;align-items:center;gap:8px;margin-left:auto}
.csn__search,.csn__start,.csn__burger{display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 14px;border-radius:999px;font-weight:700;font-size:.9rem;white-space:nowrap}
.csn__search{border:1px solid var(--line);background:#fff;color:var(--ink2)}
.csn__search:hover{border-color:var(--ink)}
.csn__search kbd{font:600 .72rem/1 inherit;padding:3px 6px;border:1px solid var(--line);border-radius:6px;color:var(--grey);background:var(--canvas)}
.csn__ico{width:16px;height:16px;flex:none}
.csn__start{border:1.5px solid var(--ink);background:var(--ink);color:var(--canvas)}
.csn__start:hover{background:#000}
.csn__dot{display:none;width:8px;height:8px;border-radius:50%;background:var(--orange)}
.csn--onpath .csn__start{background:#fff;color:var(--ink)}
.csn--onpath .csn__dot{display:inline-block}
.csn__burger{display:none;border:1.5px solid var(--ink);background:#fff}
.csn__bars{display:inline-grid;gap:3px}.csn__bars i{display:block;width:15px;height:2px;border-radius:2px;background:currentColor}
.csn__panel{position:absolute;left:0;right:0;top:100%;background:var(--canvas);border-top:1px solid var(--line);border-bottom:1px solid var(--line);box-shadow:0 30px 60px -30px rgba(22,32,43,.45)}
.csn__panel:not([hidden]){animation:csn-in .2s ease-out}
@keyframes csn-in{from{opacity:0;transform:translateY(-6px)}}
.csn__pin{max-width:1280px;margin:0 auto;padding:28px clamp(16px,3vw,32px) 32px;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1.8fr) minmax(0,.95fr);gap:28px;align-items:stretch}
.csn__k{margin:0 0 10px!important;font-size:.7rem!important;font-weight:800!important;letter-spacing:.16em;text-transform:uppercase;color:var(--ember)}
.csn__lead{display:flex;flex-direction:column;gap:10px;padding:24px;border-radius:18px;background:var(--ink);color:var(--canvas)!important;text-decoration:none;min-height:200px;position:relative;overflow:hidden}
.csn__lead::before{content:"";position:absolute;right:-40px;top:-60px;width:220px;height:220px;border-radius:50%;background:radial-gradient(circle,rgba(242,100,48,.35),transparent 70%)}
.csn__lead .csn__k{color:#F6A27C}
.csn__lead b{font-family:Anton,Impact,"Arial Narrow",sans-serif;font-weight:400;font-size:1.7rem;letter-spacing:.02em;line-height:1.05;text-transform:uppercase}
.csn__lead span{color:rgba(250,247,242,.85);font-size:.95rem}
.csn__go{margin-top:auto;color:#F6A27C!important;font-weight:700}
.csn__lead:hover .csn__go{text-decoration:underline}
.csn__links{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:4px 12px;align-content:start}
.csn__links a{display:flex;flex-direction:column;gap:3px;padding:12px 14px;border-radius:12px;border-left:3px solid transparent;text-decoration:none}
.csn__links a:hover{background:#fff;border-left-color:var(--orange)}
.csn__links a[aria-current]{background:#fff;border-left-color:var(--ink)}
.csn__links b{font-size:.98rem}.csn__links small{font-size:.82rem;color:var(--grey);line-height:1.35}
.csn__side{display:flex;flex-direction:column;gap:10px;padding:20px 22px;border-radius:18px;background:#fff;border:1px solid var(--line)}
.csn__foryou{font-size:.9rem;color:var(--ink2)}.csn__foryou p{margin:0 0 10px}
.csn__foryou ol{margin:0 0 6px;padding-left:1.2em;display:grid;gap:6px}
.csn__btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:40px;padding:0 16px;border:1.5px solid var(--ink);border-radius:999px;background:#fff;font-weight:700;font-size:.88rem}
.csn__btn:hover{background:var(--ink);color:var(--canvas)}
.csn__btn--wide{width:100%;min-height:48px}
.csn__btn--warm{background:var(--ink);color:var(--canvas)}
.csn__hub{margin-top:auto!important;font-weight:700;font-size:.9rem;text-decoration:underline;text-decoration-color:var(--orange);text-underline-offset:4px}
.csn__crumbs{max-width:1280px;margin:0 auto;padding:0 clamp(16px,3vw,32px) 8px;font-size:.8rem;color:var(--grey)}
.csn__crumbs ol{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:2px 0}
.csn__crumbs li{display:inline}.csn__crumbs li+li::before{content:"›";margin:0 8px;color:var(--orange)}
.csn__crumbs a{color:var(--grey);text-decoration:underline;text-decoration-color:var(--line);text-underline-offset:3px}
.csn__crumbs [aria-current]{color:var(--ink);font-weight:700}
.csn__pathbar{max-width:1280px;margin:0 auto;padding:0 clamp(16px,3vw,32px) 10px;display:flex;flex-wrap:wrap;align-items:center;gap:6px 14px;font-size:.84rem;color:var(--ink2)}
.csn__pathbar b{color:var(--ink)}.csn__pathbar a{font-weight:700;text-decoration:underline;text-decoration-color:var(--orange);text-underline-offset:3px}
.csn__pathbar button{border:0;background:none;padding:0;color:var(--grey);text-decoration:underline;font-size:.84rem}
.csn__sheet{position:absolute;left:0;right:0;top:100%;height:calc(100vh - var(--csn-h,64px));height:calc(100dvh - var(--csn-h,64px));overflow-y:auto;overscroll-behavior:contain;background:var(--canvas);padding:16px clamp(16px,4vw,32px) 40px;border-top:1px solid var(--line)}
.csn__sheet:not([hidden]){animation:csn-in .2s ease-out}
.csn__sheet-tools{display:grid;gap:10px;margin-bottom:14px}
.csn__acc{border-bottom:1px solid var(--line)}
.csn__acc summary{list-style:none;display:flex;align-items:center;justify-content:space-between;min-height:58px;font-family:Anton,Impact,"Arial Narrow",sans-serif;font-size:1.35rem;letter-spacing:.03em;text-transform:uppercase;cursor:pointer}
.csn__acc summary::-webkit-details-marker{display:none}
.csn__acc[open] summary .csn__chev{transform:rotate(180deg)}
.csn__acc ul{list-style:none;margin:0 0 14px;padding:0;display:grid;gap:2px}
.csn__acc a{display:flex;flex-direction:column;gap:2px;padding:12px;border-radius:12px;text-decoration:none}
.csn__acc a:hover,.csn__acc a[aria-current]{background:#fff}
.csn__acc b{font-size:1rem}.csn__acc small{font-size:.84rem;color:var(--grey)}
.csn__acc-lead{background:var(--ink)!important;color:var(--canvas)!important}.csn__acc-lead small{color:rgba(250,247,242,.8)}
.csn a:focus-visible,.csn button:focus-visible,.csn summary:focus-visible,.csf a:focus-visible,.csf button:focus-visible,.csn-d :focus-visible,.csp a:focus-visible,.csp button:focus-visible{outline:3px solid var(--orange);outline-offset:3px}
.csn-vh{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.csn-skip{position:absolute;left:12px;top:-60px;z-index:70;padding:10px 16px;background:#16202B;color:#FAF7F2!important;font-weight:700;border-radius:0 0 8px 8px}.csn-skip:focus{top:0}
.csn-d{width:min(760px,calc(100vw - 32px));max-height:min(80vh,720px);margin:10vh auto auto;padding:0;border:0;border-radius:20px;background:var(--canvas);box-shadow:0 40px 90px -30px rgba(0,0,0,.6);overflow:hidden}
.csn-d::backdrop{background:rgba(22,32,43,.55);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}
.csn-d[open]{animation:csn-in .2s ease-out;display:flex;flex-direction:column}
.csn-d__bar{display:flex;align-items:center;gap:12px;padding:16px 18px;border-bottom:1px solid var(--line);background:#fff;margin:0}
.csn-d__bar .csn__ico{width:20px;height:20px;color:var(--grey)}
.csn-d__bar input{flex:1;min-width:0;border:0;outline:0!important;background:none;font:500 1.15rem/1.3 inherit;color:var(--ink);-webkit-appearance:none;appearance:none}
.csn-d__bar:focus-within{box-shadow:inset 0 -2px 0 var(--orange)}
.csn-d__x{border:1px solid var(--line);background:var(--canvas);border-radius:8px;padding:5px 9px;font-size:.78rem!important;font-weight:700;color:var(--grey)}
.csn-d__hint{margin:0;padding:10px 20px;font-size:.82rem;color:var(--grey)}
.csn-d__res{list-style:none;margin:0;padding:0 10px 14px;overflow-y:auto}
.csn-d__res li[role=presentation]{padding:12px 10px 4px;font-size:.68rem;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--ember)}
.csn-d__res a{display:flex;flex-direction:column;gap:2px;padding:10px 12px;border-radius:10px;text-decoration:none}
.csn-d__res a b{font-size:.98rem}.csn-d__res a small{font-size:.82rem;color:var(--grey)}
.csn-d__res a[aria-selected=true],.csn-d__res a:hover{background:#fff;box-shadow:inset 3px 0 0 var(--orange)}
.csn-d--paths{width:min(880px,calc(100vw - 32px))}
.csn-d--paths form{position:absolute;right:16px;top:16px;margin:0}
#csn-paths-body{padding:28px clamp(18px,4vw,36px) 30px;overflow-y:auto}
.csn-d__h{margin:0 0 6px;font-family:Anton,Impact,"Arial Narrow",sans-serif;font-weight:400;font-size:2rem;letter-spacing:.02em;text-transform:uppercase;line-height:1.05}
.csn-d__p{margin:0 0 20px;color:var(--ink2);max-width:60ch}
.csn-d__cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}
.csn-d__card{display:flex;flex-direction:column;gap:6px;text-align:left;padding:16px 18px;border:1.5px solid var(--line);border-radius:16px;background:#fff}
.csn-d__card:hover{border-color:var(--ink)}.csn-d__card b{font-size:1rem}.csn-d__card span{font-size:.85rem;color:var(--grey)}
.csn-d__stops{margin:0 0 20px;padding:0;list-style:none;display:grid;gap:8px;counter-reset:s}
.csn-d__stops li{counter-increment:s;display:grid;grid-template-columns:34px 1fr;gap:12px;align-items:baseline}
.csn-d__stops li::before{content:counter(s);display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:var(--sand);font-weight:800;font-size:.85rem}
.csn-d__stops a{font-weight:700;text-decoration:underline;text-decoration-color:var(--orange);text-underline-offset:3px}
.csn-d__stops small{display:block;color:var(--grey);font-size:.84rem}
.csn-d__row{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
.csn-d__link{border:0;background:none;padding:0;text-decoration:underline;color:var(--grey);font-size:.9rem}
.csp{margin:18px auto 22px;max-width:1240px;padding:20px 24px;border-radius:18px;background:#fff;border:1px solid var(--line);border-left:5px solid var(--orange);box-shadow:0 18px 40px -30px rgba(22,32,43,.4)}
.csp p{margin:0 0 8px!important}
.csp__k{font-size:.72rem!important;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--ember)}
.csp__q{font-family:Anton,Impact,"Arial Narrow",sans-serif;font-size:1.6rem!important;line-height:1.1;text-transform:uppercase;letter-spacing:.02em}
.csp__why{color:var(--ink2);max-width:70ch}
.csp__read a,.csp__do a{font-weight:700;text-decoration:underline;text-decoration-color:var(--orange);text-underline-offset:3px}
.csp__next{display:flex;flex-wrap:wrap;gap:8px 18px;align-items:center;margin:12px 0 0!important;padding-top:12px;border-top:1px solid var(--line)}
.csp__go{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 18px;border-radius:999px;background:var(--ink);color:var(--canvas)!important;font-weight:700;text-decoration:none}
.csp__leave{border:0;background:none;padding:0;color:var(--grey);text-decoration:underline;font-size:.88rem}
.csf{margin-top:56px;background:#16202B;color:#FAF7F2;max-width:none!important;padding:0!important}
.csf a{color:#FAF7F2;text-decoration:none}.csf a:hover{text-decoration:underline;text-decoration-color:var(--orange);text-underline-offset:3px}
.csf h2{margin:0 0 10px!important;padding:0!important;border:0!important;font-family:inherit!important;font-size:.72rem!important;font-weight:800!important;letter-spacing:.14em;text-transform:uppercase;color:#C9C2B6!important}
.csf h2 a{color:#C9C2B6}
.csf ul{list-style:none;margin:0;padding:0;display:grid;gap:6px}
.csf__in{max-width:1280px;margin:0 auto;padding:36px clamp(16px,3vw,32px) 32px}
.csf__top{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 18px;padding-bottom:20px;margin-bottom:22px;border-bottom:1px solid rgba(250,247,242,.18);font-size:.9rem;color:#C9C2B6}
.csf__home{font-family:Anton,Impact,"Arial Narrow",sans-serif;font-size:1.25rem;letter-spacing:.06em}
.csf__up{margin-left:auto;font-weight:700}
.csf__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:24px 32px}
.csf li{font-size:.9rem}.csf a[aria-current]{font-weight:800;text-decoration:underline;text-decoration-color:var(--orange)}
.csf__extra{display:flex;flex-wrap:wrap;gap:8px 22px;margin:26px 0 0;padding-top:18px;border-top:1px solid rgba(250,247,242,.18);font-size:.88rem;font-weight:700}
.csf__cite{margin:16px 0 0;font-size:.82rem;color:#C9C2B6;line-height:1.5}.csf__cite b{color:#FAF7F2}
.csf__copy{margin-left:6px;border:1px solid rgba(250,247,242,.35);background:none;color:#FAF7F2!important;border-radius:6px;padding:2px 8px;font-size:.78rem!important}
.csf__text{margin:12px 0 0;font-size:.8rem;color:#C9C2B6}.csf__text a{text-decoration:underline;text-decoration-color:var(--orange);text-underline-offset:3px}
@media (max-width:1180px){.csn__search span,.csn__search kbd{display:none}.csn__search{width:40px;padding:0;justify-content:center}.csn__links{grid-template-columns:1fr}.csn__pin{grid-template-columns:minmax(0,1fr) minmax(0,1.4fr) minmax(0,.9fr)}}
@media (max-width:960px){.csn__main{display:none}.csn__burger{display:inline-flex}.csn__in{height:58px}.csn--slim .csn__in{height:54px}}
@media (max-width:560px){.csn__start{display:none}.csn__home{font-size:1.05rem}.csn__mark{width:26px}.csn-d{margin-top:4vh;max-height:88vh}.csn-d__h{font-size:1.6rem}.csp{margin:14px 12px 18px;padding:16px 18px}}
@media (prefers-reduced-motion:reduce){.csn__panel,.csn__sheet,.csn-d[open]{animation:none}.csn__in,.csn__chev{transition:none}}
@media print{.csn,.csf,.csn-skip,.ticker,.csp,.csn-d{display:none!important}}`;

// The behaviour: menu panels, phone menu, search, paths and the citation copy. Plain ES5, no libraries.
function js() {
  const P = { end: PATHS.end, paths: PATHS.paths.map(p => ({ id: p.id, label: p.label, short: p.short, card: p.card, join: p.join, stops: p.stops.map(s => ({ url: s.url, q: s.q })) })) };
  const G = GROUPS.map(g => ({ id: g.id, urls: [g.hub, g.lead[0], ...g.items.map(i => i[0])].filter(u => !u.includes("#")) }));
  return `(function(){var P=${JSON.stringify(P)},G=${JSON.stringify(G)},KEY="cs-path",H=document.querySelector(".csn");if(!H)return;
var $=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
var get=function(){try{return localStorage.getItem(KEY)}catch(e){return null}},set=function(v){try{v?localStorage.setItem(KEY,v):localStorage.removeItem(KEY)}catch(e){}};
document.documentElement.style.setProperty("--csn-h",H.getBoundingClientRect().height+"px");
/* slimmer header once the reader scrolls */
var slim=function(){H.classList.toggle("csn--slim",scrollY>40)};addEventListener("scroll",slim,{passive:true});slim();
/* menu panels: one open at a time; Escape, a click outside or leaving the panel closes it */
var btns=$$(".csn__gb"),open=null;
function close(refocus){if(!open)return;var b=open;b.setAttribute("aria-expanded","false");$("#"+b.getAttribute("aria-controls")).hidden=true;open=null;if(refocus)b.focus()}
function show(b){if(open===b)return close();close();b.setAttribute("aria-expanded","true");$("#"+b.getAttribute("aria-controls")).hidden=false;open=b}
btns.forEach(function(b,i){b.addEventListener("click",function(){show(b)});
 b.addEventListener("mouseenter",function(){if(open&&open!==b)show(b)});
 b.addEventListener("keydown",function(e){var k=e.key;if(k==="ArrowRight"||k==="ArrowLeft"){e.preventDefault();var n=btns[(i+(k==="ArrowRight"?1:btns.length-1))%btns.length];n.focus();if(open)show(n)}
  else if(k==="ArrowDown"){e.preventDefault();if(open!==b)show(b);var a=$("#"+b.getAttribute("aria-controls")+" a");if(a)a.focus()}})});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&open){close(true)}});
document.addEventListener("click",function(e){if(open&&!e.target.closest(".csn__groups"))close()});
$$(".csn__panel").forEach(function(p){p.addEventListener("focusout",function(e){if(open&&e.relatedTarget&&!e.relatedTarget.closest(".csn__groups"))close()})});
/* phone menu */
var bur=$(".csn__burger"),sheet=$("#csn-sheet");
function sheetSet(v){sheet.hidden=!v;bur.setAttribute("aria-expanded",String(v));document.documentElement.style.overflow=v?"hidden":"";document.documentElement.style.setProperty("--csn-h",H.getBoundingClientRect().height+"px")}
if(bur)bur.addEventListener("click",function(){sheetSet(sheet.hidden)});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&sheet&&!sheet.hidden){sheetSet(false);bur.focus()}});
if(sheet)sheet.addEventListener("click",function(e){if(e.target.closest("a"))sheetSet(false)});
/* search: the index loads the first time it is opened */
var sd=$("#csn-search-d"),q=$("#csn-q"),res=$("#csn-res"),idx=null,sel=-1;
function openSearch(){if(!sd||!sd.showModal)return location.href="/sources/";sheetSet(false);close();sd.showModal();q.value="";q.focus();res.innerHTML="";sel=-1;
 if(!idx)fetch("/search-index.json").then(function(r){return r.json()}).then(function(j){idx=j;run()}).catch(function(){$("#csn-hint").textContent="Search could not load. Try the menu."})}
$$("[data-csn-search]").forEach(function(b){b.addEventListener("click",openSearch)});
document.addEventListener("keydown",function(e){var t=e.target;if(e.key==="/"&&!e.metaKey&&!e.ctrlKey&&!(t.isContentEditable||/INPUT|TEXTAREA|SELECT/.test(t.tagName))){e.preventDefault();openSearch()}});
var norm=function(s){return s.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g,"")};
function run(){if(!idx)return;var w=norm(q.value).split(/\\s+/).filter(Boolean);sel=-1;if(!w.length){res.innerHTML="";return}
 var hits=idx.filter(function(x){var h=norm(x.t+" "+x.d+" "+(x.k||""));return w.every(function(v){return h.indexOf(v)>-1})})
  .map(function(x){var s=0,t=norm(x.t);w.forEach(function(v){if(t.indexOf(v)===0)s+=3;else if(t.indexOf(v)>-1)s+=2});return[s+(x.w||0),x]}).sort(function(a,b){return b[0]-a[0]}).slice(0,24);
 var groups={},order=[];hits.forEach(function(h){var x=h[1];if(!groups[x.g]){groups[x.g]=[];order.push(x.g)}if(groups[x.g].length<8)groups[x.g].push(x)});
 res.innerHTML=hits.length?order.map(function(g){return'<li role="presentation">'+esc(g)+'</li>'+groups[g].map(function(x){return'<li><a role="option" aria-selected="false" href="'+esc(x.u)+'"><b>'+esc(x.t)+'</b><small>'+esc(x.d)+'</small></a></li>'}).join("")}).join(""):'<li role="presentation">Nothing found. Try fewer words, or a place name.</li>'}
if(q){q.addEventListener("input",run);q.addEventListener("keydown",function(e){if(e.key==="Escape"){e.preventDefault();sd.close();return}var a=$$("a",res);if(!a.length)return;
 if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();sel=(sel+(e.key==="ArrowDown"?1:a.length-1))%a.length;a.forEach(function(x,i){x.setAttribute("aria-selected",String(i===sel))});a[sel].scrollIntoView({block:"nearest"})}
 else if(e.key==="Enter"){e.preventDefault();location.href=(a[sel]||a[0]).href}})}
/* paths by role */
var pd=$("#csn-paths-d"),body=$("#csn-paths-body"),here=location.pathname;
var byId=function(id){return P.paths.filter(function(p){return p.id===id})[0]};
function chooser(){body.innerHTML='<h2 class="csn-d__h" id="csn-paths-h">Start here</h2><p class="csn-d__p">What best describes your work? Choose a path for a short, guided route through the site. You can leave it at any time, and nothing is shared: your choice stays in this browser.</p><div class="csn-d__cards">'+P.paths.map(function(p){return'<button type="button" class="csn-d__card" data-pick="'+p.id+'"><b>'+esc(p.label)+'</b><span>'+esc(p.card)+'</span></button>'}).join("")+'</div><p class="csn-d__p" style="margin:18px 0 0"><a href="/paths/">See every path as a page</a></p>'}
function view(p){var at=-1;p.stops.forEach(function(s,i){if(s.url===here)at=i});
 body.innerHTML='<h2 class="csn-d__h" id="csn-paths-h">'+esc(p.label)+'</h2><p class="csn-d__p">'+esc(p.card)+'</p><ol class="csn-d__stops">'+p.stops.map(function(s,i){return'<li><span><a href="'+s.url+'">'+esc(s.q)+'</a>'+(i===at?'<small>You are here</small>':'')+'</span></li>'}).join("")+'<li><span><a href="'+P.end.url+'">'+esc(P.end.q)+'</a><small>'+esc(p.join)+'</small></span></li></ol><div class="csn-d__row"><a class="csp__go" href="'+p.stops[Math.max(0,at+1<p.stops.length?at+1:0)].url+'">'+(at<0?"Start at stop 1":at+1<p.stops.length?"Go to the next stop":"Start again")+' <span aria-hidden="true">→</span></a><button type="button" class="csn__btn" data-change>Change path</button><button type="button" class="csn-d__link" data-csn-leave>Leave the path: show everything</button></div>'}
function openPaths(){if(!pd||!pd.showModal)return location.href="/paths/";sheetSet(false);close();var p=byId(get());p?view(p):chooser();pd.showModal()}
$$("[data-csn-paths]").forEach(function(b){b.addEventListener("click",openPaths)});
if(body)body.addEventListener("click",function(e){var k=e.target.closest("[data-pick]");if(k){set(k.getAttribute("data-pick"));apply();view(byId(get()));return}if(e.target.closest("[data-change]"))chooser()});
document.addEventListener("click",function(e){if(e.target.closest("[data-csn-leave]")){set(null);apply();if(pd&&pd.open)pd.close()}});
document.addEventListener("click",function(e){var k=e.target.closest("[data-csn-setpath]");if(k)set(k.getAttribute("data-csn-setpath"))});
function groupOf(u){for(var i=0;i<G.length;i++)if(G[i].urls.indexOf(u)>-1)return G[i].id;return null}
function apply(){var p=byId(get());H.classList.toggle("csn--onpath",!!p);$$("[data-csn-pathlabel]").forEach(function(x){x.textContent=p?p.short+" path":"Start here"});
 $$(".csp").forEach(function(c){c.hidden=!p||c.getAttribute("data-csp")!==p.id});
 var bar=$("[data-csn-pathbar]");if(bar){if(!p){bar.hidden=true}else{var at=-1;p.stops.forEach(function(s,i){if(s.url===here)at=i});var nx=at>-1?p.stops[at+1]:p.stops[0];
  bar.innerHTML='<span>On the <b>'+esc(p.short)+'</b> path'+(at>-1?' · stop '+(at+1)+' of '+p.stops.length:'')+'</span>'+(nx?'<a href="'+nx.url+'">'+(at>-1?"Next":"Start")+': '+esc(nx.q)+' →</a>':'<a href="'+P.end.url+'">Last stop: '+esc(P.end.q)+' →</a>')+'<button type="button" data-csn-leave>Leave</button>';bar.hidden=false}}
 $$("[data-csn-foryou]").forEach(function(f){var g=f.getAttribute("data-csn-foryou");if(!p){f.innerHTML='<p>Choose a path by role, and your next stops appear here.</p><button type="button" class="csn__btn" data-csn-paths>Choose a path</button>';f.querySelector("[data-csn-paths]").addEventListener("click",openPaths);return}
  var mine=p.stops.filter(function(s){return groupOf(s.url)===g});f.innerHTML='<p><b>'+esc(p.short)+' path</b></p>'+(mine.length?'<ol>'+mine.map(function(s){return'<li><a href="'+s.url+'">'+esc(s.q)+'</a></li>'}).join("")+'</ol>':'<p>No stops in this group. Your path continues elsewhere.</p>')})}
apply();
/* copy the citation */
$$("[data-csn-copy]").forEach(function(b){b.addEventListener("click",function(){var t=$("[data-csn-cite]").textContent;(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){b.textContent="Copied"},function(){b.textContent="Select and copy"})})});
})();`;
}

module.exports = { GROUPS, PATHS, NAMES, TEXT, header, footer, pathCards, CSS, JS: js(), esc, groupOf };
