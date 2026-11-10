#!/usr/bin/env node
/* Common Shade: "Everything Common Shade covers", the card that opens when a visitor starts to leave a page.
   It is a visual map of the whole evidence base, with an image of the map in the corner and a link to it. Every number
   comes from the build: the map's own data (data.js) and the counts the other builders record (tools/site-counts.js,
   data/site/counts.json). The same list joins llms.txt, so readers and AI systems see the same figures.
   Writes /everything.js (loaded deferred on every page by build-nav.js). The image loads only when the card opens.
   Run by tools/build-static.js, or alone: node tools/build-everything.js */
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, ".."), SITE = "https://beattheheat.asia";
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, "data.js"), "utf8") +
  ";Object.assign(this,{CONSEQUENCES,LOOPS,LEVERS,ORGANISATIONS,CITY_PROFILES,HEATWAVES,GUIDE})", ctx);
const D = ctx, C = require("./site-counts.js").all();
const NEED = ["sources", "studies", "learningQuestions", "lancetReferences", "newsSources", "mediaArticles", "solutions", "hapVerified",
  "schemes", "instruments", "businesses", "funders", "countries"];
const missing = NEED.filter(k => !Number.isInteger(C[k]));
if (missing.length) throw new Error(`build-everything: data/site/counts.json has no ${missing.join(", ")}. Run node tools/build-static.js, which records them.`);
const n = x => x.toLocaleString("en-GB");

// the map of everything: four groups, each a set of doors. [number, what it counts, the rest of the line, page]
const GROUPS = [
  { id: "understand", name: "Understand heat", items: [
    [D.CONSEQUENCES.length, "consequences mapped", `with ${D.LOOPS.length} vicious cycles and ${D.LEVERS.length} ways to break them`, "/"],
    [D.CITY_PROFILES.length, "city profiles", `and ${C.countries} country snapshots`, "/cities/"],
    [D.HEATWAVES.length, "heatwaves", "that shaped South and Southeast Asia", "/heatwaves/"]] },
  { id: "evidence", name: "The evidence", items: [
    [C.sources, "sources", "cited, every one listed", "/sources/"],
    [C.studies, "studies graded", "cycle by cycle, on the evidence map", "/evidence-map/"],
    [C.learningQuestions, "learning questions", "nobody has answered yet", "/evidence-map/#questions"],
    [C.lancetReferences, "report references", "the Lancet Countdown 2026, in plain language", "/lancet-countdown-2026/"],
    [C.newsSources, "news headlines", `and ${C.mediaArticles} articles studied for how heat is reported`, "/news/"]] },
  { id: "act", name: "What helps", items: [
    [C.solutions, "solutions", "each with an evidence label", "/solutions/"],
    [C.hapVerified, "heat action plans", "verified, from India", "/resources/heat-action-plans/india/"],
    [D.GUIDE.toolkit.length, "planning tools", "from a week in the heat to a plan of your own", "/guide/"]] },
  { id: "fund", name: "Money and people", items: [
    [C.schemes, "schemes", `and ${C.instruments} financial instruments, and whether they paid`, "/paying-when-heat-strikes/"],
    [C.businesses, "businesses", `and ${C.funders} funders in the heat economy`, "/heat-economy/"],
    [D.ORGANISATIONS.length, "organisations", "mapped, each with a profile", "/heat-network/"]] }];

const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
// the card: a close button, then two panels. The dark side panel carries the drawing of the common shade, the headline,
// one main way on (the map, with its picture) and three quieter ones. The light panel is the index: four groups of doors,
// each a number and what it counts (the rest of each line stays for screen readers and llms.txt). A slim foot keeps
// "Keep reading" in reach; on a phone it also carries the map button. The whole card fits a laptop screen without scrolling.
const TOP = `<form method="dialog" class="csx__x-form"><button class="csx__x" aria-label="Close and keep reading">×</button></form>`;
const HTML = `<div class="csx__side">
<div class="csx__art"><img data-src="/images/common-shade-banner.svg" alt="" width="1200" height="300"></div>
<div class="csx__side-in"><p class="csx__k">Before you go</p><h2 class="csx__h" id="csx-h">Everything Common Shade covers</h2>
<p class="csx__p">One free, open evidence base on extreme heat in South and Southeast Asia. All of it, in one place.</p>
<a class="csx__map" href="/" data-csx-map><picture><source type="image/webp" data-srcset="/images/map-preview.webp"><img data-src="/images/map-preview.jpg" alt="" width="520" height="500"></picture><span><b>Open the map <span aria-hidden="true">→</span></b><small>${n(D.CONSEQUENCES.length)} consequences of heat, and how one leads to the next</small></span></a>
<div class="csx__ways"><a class="csx__sig" href="/signals/?from=exit">Signals: which way heat policy is moving</a><a class="csx__grow" href="/growing/?from=exit#canopy" data-csx-grow><svg class="csx__grow-i" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M3 12c2-6 16-6 18 0" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 12v8M12 16l-4 4M12 16l4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span data-csx-grow-l>Watch Common Shade grow</span></a><a class="csx__join" href="/join/">Help build Common Shade</a></div></div></div>
<div class="csx__groups">${GROUPS.map(g => `<section class="csx__g csx__g--${g.id}" aria-labelledby="csx-${g.id}"><h3 class="csx__gh" id="csx-${g.id}">${esc(g.name)}</h3><ul>${g.items.map(([num, what, rest, href]) =>
  `<li><a href="${href}"><b>${n(num)}</b><span><em>${esc(what)}</em><i> ${esc(rest)}</i></span></a></li>`).join("")}</ul></section>`).join("")}</div>`;
const FOOT = `<div class="csx__foot"><a class="csx__go" href="/" data-csx-map>Open the map</a><form method="dialog"><button class="csx__stay">Keep reading</button></form></div>`;

const CSS = `.csx{width:min(1060px,calc(100vw - 24px));max-height:calc(100dvh - 24px);margin:auto;padding:0;border:0;border-radius:22px;background:#FAF7F2;color:#16202B;box-shadow:0 40px 90px -30px rgba(0,0,0,.6);font-family:"Hanken Grotesk","Segoe UI",Roboto,Arial,sans-serif;line-height:1.45;overflow:hidden}
.csx[open]{display:flex;flex-direction:column}
.csx::backdrop{background:rgba(14,22,31,.66)}
.csx__in{flex:1 1 auto;min-height:0;overflow:auto;overscroll-behavior:contain;display:grid;grid-template-columns:minmax(0,35fr) minmax(0,65fr)}
.csx__x-form{position:absolute;top:12px;right:12px;margin:0;z-index:3}
.csx__x{width:44px;height:44px;border:0;border-radius:50%;background:#fff;color:#16202B;font-size:26px;line-height:1;cursor:pointer;box-shadow:0 2px 10px rgba(22,32,43,.25)}
.csx__side{display:flex;flex-direction:column;background:#101820;color:#FAF7F2}
.csx__art{height:150px;overflow:hidden;background:#0B1119;flex:none}
.csx__art img{display:block;width:100%;height:100%;object-fit:cover;object-position:22% 100%}
.csx__side-in{display:flex;flex-direction:column;gap:12px;padding:20px 24px 24px;flex:1}
.csx__k{margin:0;font-weight:800;font-size:.75rem;letter-spacing:.14em;text-transform:uppercase;color:#FF8A5C}
.csx__h{margin:0;font-family:Anton,Impact,"Arial Narrow",sans-serif;font-weight:400;font-size:clamp(1.9rem,1.1rem + 2vw,2.5rem);line-height:1.02;text-transform:uppercase;letter-spacing:.01em}
.csx--sys .csx__h{font-family:inherit;font-weight:800;letter-spacing:-.01em;font-size:1.7rem;line-height:1.08}
.csx__p{margin:0;color:#C9C3B8;font-size:.95rem}
.csx__map{display:grid;grid-template-columns:84px minmax(0,1fr);gap:14px;align-items:center;margin-top:4px;padding:10px;border-radius:16px;background:#F26430;color:#16202B;text-decoration:none;box-shadow:0 14px 30px -14px rgba(242,100,48,.8);transition:transform .2s,background-color .2s}
.csx__map img{display:block;width:84px;height:84px;object-fit:cover;border-radius:10px;background:#F2E7D9}
.csx__map b{display:block;font-size:1.15rem;font-weight:800}.csx__map small{display:block;font-size:.82rem;line-height:1.3;margin-top:2px}
.csx__map:hover{background:#FF7A45;transform:translateY(-2px)}
.csx__ways{display:grid;gap:8px;margin-top:auto;padding-top:6px}
.csx__ways a{display:flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:6px 10px;border-radius:999px;font-weight:800;font-size:.86rem;line-height:1.2;text-align:center;text-decoration:none}
.csx__sig{background:#3DBE78;color:#0C1B12}.csx__sig:hover{background:#55CF8C}
.csx__grow{border:2px solid #6FCB97;color:#CFF3DF;transition:background-color .35s ease,color .35s ease}
.csx__grow-i{display:none}
.csx__grow--on{background:#1F8A50;border-color:#1F8A50;color:#fff}.csx__grow--on .csx__grow-i{display:block}
.csx__grow:hover,.csx__grow:focus-visible{background:#1F8A50;border-color:#1F8A50;color:#fff}
.csx__join{border:2px solid rgba(250,247,242,.45);color:#FAF7F2}.csx__join:hover{background:#FAF7F2;color:#16202B}
.csx__groups{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;align-content:start;padding:56px 22px 20px}
.csx__g{margin:0;padding:12px 14px 6px;border-radius:14px;background:#fff;border:1px solid #E6DFD4;border-top:4px solid var(--g,#F26430)}
.csx__g--understand{--g:#B8401A}.csx__g--evidence{--g:#3E5C76}.csx__g--act{--g:#17703A}.csx__g--fund{--g:#8A5A00}
.csx__gh{margin:0 0 4px;font-size:.75rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--g,#39424D)}
.csx__g ul{margin:0;padding:0;list-style:none}
.csx__g a{display:grid;grid-template-columns:3.3em minmax(0,1fr);gap:10px;align-items:baseline;min-height:38px;padding:6px 4px;border-top:1px solid #F0EAE1;border-radius:6px;color:#16202B;text-decoration:none}
.csx__g li:first-child a{border-top:0}
.csx__g b{font-family:Anton,Impact,"Arial Narrow",sans-serif;font-weight:400;font-size:1.3rem;line-height:1;color:var(--g,#16202B);text-align:right;font-variant-numeric:tabular-nums}
.csx--sys .csx__g b{font-family:inherit;font-weight:800;font-size:1.15rem}
.csx__g em{font-style:normal;font-weight:700;font-size:.95rem}
.csx__g i{display:block;font-style:normal;font-size:.8rem;line-height:1.3;color:#5E6570}
.csx__g a:hover,.csx__g a:focus-visible{background:#FBF3EA}.csx__g a:hover em{text-decoration:underline;text-decoration-color:#F26430;text-underline-offset:3px}
.csx__foot{flex:none;display:flex;justify-content:flex-end;align-items:center;gap:10px;padding:10px 22px;background:#FAF7F2;border-top:1px solid #E6DFD4}
.csx__foot form{margin:0}
.csx__go{display:none;align-items:center;justify-content:center;min-height:46px;padding:0 22px;border-radius:999px;background:#F26430;color:#16202B;font-weight:800;text-decoration:none}
.csx__stay{min-height:44px;padding:0 22px;border:1.5px solid #16202B;border-radius:999px;background:none;color:#16202B;font:inherit;font-weight:700;cursor:pointer}
.csx__stay:hover{background:#16202B;color:#FAF7F2}
.csx a:focus-visible,.csx button:focus-visible{outline:3px solid #F26430;outline-offset:3px}
.csx__side a:focus-visible{outline-color:#fff}
@media (max-width:760px){.csx{border-radius:18px}.csx__in{grid-template-columns:minmax(0,1fr)}.csx__art{height:84px}.csx__side-in{padding:14px 16px 18px;gap:10px}.csx__h{font-size:1.75rem}.csx--sys .csx__h{font-size:1.45rem}.csx__p{font-size:.9rem}.csx__map{grid-template-columns:60px minmax(0,1fr);padding:8px}.csx__map img{width:60px;height:60px}.csx__ways{grid-template-columns:repeat(2,minmax(0,1fr));margin-top:2px}.csx__ways a{font-size:.85rem;padding:6px 10px}.csx__sig{grid-column:1 / -1}.csx__groups{grid-template-columns:minmax(0,1fr);padding:16px 14px}.csx__g i{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}.csx__foot{padding:8px 14px}.csx__go{display:inline-flex;flex:1}.csx__stay{border:0;padding:0 10px;text-decoration:underline;text-underline-offset:3px}}
@media (prefers-reduced-motion:no-preference){.csx[open]{animation:csx-in .3s cubic-bezier(.16,1,.3,1)}@keyframes csx-in{from{opacity:0;transform:translateY(16px) scale(.985)}}}
@media (prefers-reduced-motion:reduce){.csx__grow,.csx__map{transition:none}}
@media print{.csx{display:none!important}}`;

const JS = `/* Common Shade: "Everything Common Shade covers", the card shown when a visitor starts to leave. Generated by
   tools/build-everything.js from the site's data and recorded counts; edit there. Nothing here is sent anywhere. */
(function () {
  "use strict";
  if (!window.HTMLDialogElement || document.body.dataset.page === "join") return;
  var KEY = "cs-exit-rest", root = document.documentElement, start = Date.now() - (window.performance ? performance.now() : 0), shown = false, lastY = scrollY, lastT = Date.now(), deep = scrollY > innerHeight * 1.5;   // already reading deep when this arrives
  try { if (sessionStorage.getItem(KEY)) return; } catch (e) {}
  var TOP = ${JSON.stringify(TOP)}, HTML = ${JSON.stringify(HTML)}, FOOT = ${JSON.stringify(FOOT)}, CSS = ${JSON.stringify(CSS)};
  function show(via) {
    if (shown || root.dataset.csPop || document.querySelector("dialog[open]")) return;
    shown = true; root.dataset.csPop = "exit"; off();
    var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
    var d = document.createElement("dialog"); d.className = "csx"; d.setAttribute("aria-labelledby", "csx-h");
    try { document.fonts.load("16px Anton").then(function (l) { if (!l.length) d.classList.add("csx--sys"); }); } catch (e) {}   // pages without the display face get a sturdy bold instead
    d.innerHTML = TOP + '<div class="csx__in">' + HTML + "</div>" + FOOT;
    [].forEach.call(d.querySelectorAll("[data-srcset]"), function (s) { s.srcset = s.getAttribute("data-srcset"); });
    [].forEach.call(d.querySelectorAll("img[data-src]"), function (i) { i.src = i.getAttribute("data-src"); });
    if (document.getElementById("explore")) [].forEach.call(d.querySelectorAll("[data-csx-map]"), function (a) { a.href = "#explore"; a.addEventListener("click", function () { d.close(); }); });
    d.addEventListener("click", function (e) { if (e.target === d) d.close(); });   // a tap outside the card closes it
    d.addEventListener("close", function () { try { sessionStorage.setItem(KEY, "1"); } catch (e) {} if (root.dataset.csPop === "exit") delete root.dataset.csPop; setTimeout(function () { d.remove(); }, 50); });
    document.body.appendChild(d); d.showModal();
    // the "Watch Common Shade grow" door turns on, once, as the reader moves to close the card: the pointer nearing the
    // close buttons, keyboard focus reaching them, or (on a phone, where the card opened on the way out) after a moment
    var grow = d.querySelector("[data-csx-grow]"), exits = [].slice.call(d.querySelectorAll(".csx__x,.csx__stay"));
    function on() { if (grow.classList.contains("csx__grow--on")) return; grow.classList.add("csx__grow--on"); grow.querySelector("[data-csx-grow-l]").textContent = "See how it grew"; }
    exits.forEach(function (b) { b.addEventListener("focus", on); b.addEventListener("pointerenter", on); });
    d.addEventListener("pointermove", function (e) { exits.forEach(function (b) { var r = b.getBoundingClientRect(); if (Math.abs(e.clientX - (r.left + r.width / 2)) < 140 && Math.abs(e.clientY - (r.top + r.height / 2)) < 110) on(); }); });
    if (via === "scroll") setTimeout(on, 900);
  }
  // leaving, on a computer: the pointer heads up out of the page, towards the tabs and the address bar
  function onOut(e) { if (!e.relatedTarget && e.clientY <= 0 && Date.now() - start > 4000) show("pointer"); }
  // leaving, on a phone: after reading a while, a quick swipe back up towards the top, where the back and address bar are
  function onScroll() {
    var y = scrollY, t = Date.now();
    if (y > innerHeight * 1.5) deep = true;
    if (deep && t - start > 15000 && lastY - y > 140 && t - lastT < 260 && y < innerHeight) show("scroll");
    if (t - lastT > 120) { lastY = y; lastT = t; }
  }
  function off() { document.removeEventListener("mouseout", onOut); removeEventListener("scroll", onScroll); }
  document.addEventListener("mouseout", onOut);
  addEventListener("scroll", onScroll, { passive: true });
  if (/[?&]preview=everything\\b/.test(location.search)) show();   // to check the card: add ?preview=everything to any address
})();
`;

module.exports = function buildEverything({ llms = false } = {}) {
  fs.writeFileSync(path.join(ROOT, "everything.js"), JS);
  if (llms) fs.appendFileSync(path.join(ROOT, "llms.txt"), `\n## Everything the site covers\n\n${GROUPS.map(g => `### ${g.name}\n\n${g.items.map(([num, what, rest, href]) =>
    `- [${n(num)} ${what}](${SITE}${href}) ${rest}`).join("\n")}`).join("\n\n")}\n`);
  console.log(`everything.js: ${GROUPS.reduce((s, g) => s + g.items.length, 0)} doors in ${GROUPS.length} groups (${(Buffer.byteLength(JS) / 1024).toFixed(1)} KB)`);
};
if (require.main === module) module.exports();
