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
// the card, top to bottom: a close button over a full-bleed drawing of the common shade, the map of everything, and the
// ways on, kept in reach at the foot of the card however far it scrolls
const TOP = `<form method="dialog" class="csx__x-form"><button class="csx__x" aria-label="Close and keep reading">×</button></form>
<div class="csx__art"><img data-src="/images/common-shade-banner.svg" alt="" width="1200" height="300"></div>`;
const HTML = `<div class="csx__head"><p class="csx__k">Before you go</p><h2 class="csx__h" id="csx-h">Everything Common Shade covers</h2>
<p class="csx__p">One free, open evidence base on extreme heat in South and Southeast Asia. Here is all of it, in one place.</p></div>
<a class="csx__map" href="/" data-csx-map><picture><source type="image/webp" data-srcset="/images/map-preview.webp"><img data-src="/images/map-preview.jpg" alt="The Common Shade map: extreme heat at the centre, its consequences across ten systems around it" width="520" height="500"></picture><span>Open the map <span aria-hidden="true">→</span></span></a>
<div class="csx__groups">${GROUPS.map(g => `<section class="csx__g csx__g--${g.id}" aria-labelledby="csx-${g.id}"><h3 class="csx__gh" id="csx-${g.id}">${esc(g.name)}</h3><ul>${g.items.map(([num, what, rest, href]) =>
  `<li><a href="${href}"><b>${n(num)}</b><span><em>${esc(what)}</em> ${esc(rest)}</span></a></li>`).join("")}</ul></section>`).join("")}</div>`;
const FOOT = `<div class="csx__foot"><a class="csx__go" href="/" data-csx-map>Open the map</a><a class="csx__sig" href="/signals/?from=exit">Signals: which way heat policy is moving</a><a class="csx__join" href="/join/">Help build Common Shade</a><a class="csx__grow" href="/growing/?from=exit#canopy" data-csx-grow><svg class="csx__grow-i" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M3 12c2-6 16-6 18 0" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 12v8M12 16l-4 4M12 16l4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span data-csx-grow-l>Watch Common Shade grow</span></a><form method="dialog"><button class="csx__stay">Keep reading</button></form></div>`;

const CSS = `.csx{width:min(1040px,calc(100vw - 24px));max-height:calc(100dvh - 24px);margin:auto;padding:0;border:0;border-radius:20px;background:#FAF7F2;color:#16202B;box-shadow:0 40px 90px -30px rgba(0,0,0,.6);font-family:"Hanken Grotesk","Segoe UI",Roboto,Arial,sans-serif;line-height:1.45;overflow:auto;overscroll-behavior:contain}
.csx::backdrop{background:rgba(14,22,31,.62)}
.csx__in{position:relative;display:grid;grid-template-columns:minmax(0,1fr) 190px;gap:18px 28px;padding:clamp(20px,3vw,32px)}
.csx__x-form{position:absolute;top:12px;right:12px;margin:0;z-index:2}
.csx__art{height:clamp(120px,21vw,230px);overflow:hidden;background:#0B1119}
.csx__art img{display:block;width:100%;height:100%;object-fit:cover;object-position:30% 100%}
.csx__x{width:44px;height:44px;border:0;border-radius:50%;background:#fff;color:#16202B;font-size:26px;line-height:1;cursor:pointer;box-shadow:0 2px 8px rgba(22,32,43,.15)}
.csx__head{grid-column:1;align-self:start}
.csx__k{margin:0;font-weight:800;font-size:.75rem;letter-spacing:.14em;text-transform:uppercase;color:#B8401A}
.csx__h{margin:6px 0 0;font-family:Anton,Impact,"Arial Narrow",sans-serif;font-weight:400;font-size:clamp(1.9rem,1.2rem + 2.6vw,3.2rem);line-height:1;text-transform:uppercase}
.csx__p{margin:10px 0 0;max-width:40rem;color:#39424D;font-size:1.05rem}
.csx__map{grid-column:2;grid-row:1;align-self:start;position:relative;z-index:1;margin-top:-96px;box-shadow:0 18px 40px -18px rgba(14,22,31,.55);display:block;border-radius:14px;overflow:hidden;background:#fff;border:1px solid #E6DFD4;color:#16202B;font-weight:700;text-decoration:none}
.csx__map img{display:block;width:100%;height:auto;aspect-ratio:520/500;background:#F2E7D9}
.csx__map>span{display:block;padding:10px 12px;font-size:.9rem}
.csx__map:hover,.csx__map:focus-visible{border-color:#F26430}
.csx__groups{grid-column:1 / -1;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
@media (min-width:1000px){.csx__groups{grid-template-columns:repeat(4,minmax(0,1fr))}}
.csx__g{margin:0;padding:12px 14px 8px;border-radius:14px;background:#fff;border:1px solid #E6DFD4;border-top:4px solid var(--g,#F26430)}
.csx__g--understand{--g:#B8401A}.csx__g--evidence{--g:#3E5C76}.csx__g--act{--g:#17703A}.csx__g--fund{--g:#8A5A00}
.csx__gh{margin:0 0 6px;font-size:.75rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#39424D}
.csx__g ul{margin:0;padding:0;list-style:none}
.csx__g a{display:grid;grid-template-columns:3.4em minmax(0,1fr);gap:8px;align-items:baseline;min-height:44px;padding:6px 0;border-top:1px solid #F0EAE1;color:#16202B;text-decoration:none}
.csx__g li:first-child a{border-top:0}
.csx__g b{font-family:Anton,Impact,"Arial Narrow",sans-serif;font-weight:400;font-size:1.3rem;line-height:1;color:var(--g,#16202B);text-align:right;font-variant-numeric:tabular-nums}
.csx__g span{font-size:.85rem;line-height:1.35;color:#39424D}.csx__g em{font-style:normal;font-weight:700;color:#16202B}
.csx__g a:hover em,.csx__g a:focus-visible em{text-decoration:underline;text-decoration-color:#F26430;text-underline-offset:3px}
.csx__foot{position:sticky;bottom:0;z-index:1;display:flex;flex-wrap:wrap;gap:10px 12px;align-items:center;padding:14px clamp(20px,3vw,32px);background:rgba(250,247,242,.97);border-top:1px solid #E6DFD4}
.csx__foot form{margin:0}
.csx__go{display:inline-flex;align-items:center;min-height:48px;padding:0 24px;border-radius:999px;background:#F26430;color:#16202B;font-weight:800;text-decoration:none}
.csx__join{display:inline-flex;align-items:center;min-height:48px;padding:0 24px;border-radius:999px;background:#16202B;color:#FAF7F2;font-weight:800;text-decoration:none}
.csx__join:hover{background:#B8401A}
.csx__sig{display:inline-flex;align-items:center;min-height:48px;padding:0 22px;border-radius:999px;background:#3DBE78;color:#0C1B12;font-weight:800;text-decoration:none}
.csx__sig:hover{background:#16202B;color:#FAF7F2}
.csx__grow{display:inline-flex;align-items:center;gap:8px;min-height:48px;padding:0 20px;border-radius:999px;border:2px solid #1F6B43;color:#1F6B43;font-weight:800;text-decoration:none;background:transparent;transition:background-color .35s ease,color .35s ease}
.csx__grow-i{display:none}
.csx__grow--on{background:#1F6B43;color:#fff}.csx__grow--on .csx__grow-i{display:block}
.csx__grow:hover,.csx__grow:focus-visible{background:#16202B;border-color:#16202B;color:#FAF7F2}
@media (prefers-reduced-motion:reduce){.csx__grow{transition:none}}.csx__go:hover{background:#16202B;color:#FAF7F2}
.csx__stay{min-height:48px;padding:0 20px;border:1.5px solid #16202B;border-radius:999px;background:none;color:#16202B;font:inherit;font-weight:700;cursor:pointer}
.csx a:focus-visible,.csx button:focus-visible{outline:3px solid #F26430;outline-offset:3px}
@media (max-width:760px){.csx__in{grid-template-columns:minmax(0,1fr) 96px;gap:14px}.csx__head{grid-column:1}.csx__map{grid-column:2;grid-row:1;margin-top:-48px}.csx__map>span{padding:6px 8px;font-size:.75rem}.csx__groups{grid-column:1 / -1;grid-template-columns:minmax(0,1fr)}.csx__h{font-size:1.7rem}.csx__p{font-size:.95rem}.csx__foot{padding:10px 14px;gap:8px}.csx__go,.csx__join,.csx__sig{flex:1 1 0;justify-content:center;min-height:44px;padding:6px 10px;font-size:.88rem;line-height:1.15;text-align:center}.csx__foot form{flex-basis:100%}.csx__stay{width:100%;min-height:32px;padding:0;border:0;font-size:.88rem;text-decoration:underline;text-underline-offset:3px}}
@media (prefers-reduced-motion:no-preference){.csx[open]{animation:csx-in .28s cubic-bezier(.16,1,.3,1)}@keyframes csx-in{from{opacity:0;transform:translateY(14px)}}}
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
    function on() { if (grow.classList.contains("csx__grow--on")) return; grow.classList.add("csx__grow--on"); grow.querySelector("[data-csx-grow-l]").textContent = "Before you go: see how it grew"; }
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
