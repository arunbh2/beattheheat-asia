/* ==========================================================
   Builds the printable one-pagers in /print/ from data.js.
   Run by tools/build-static.js (or on its own: node tools/build-print.js).

   Each sheet is a single A4 page with the BeatTheHeat.Asia brand,
   the beta disclaimer, the CC BY 4.0 licence and a QR code back to
   the live page. QR codes need the "qrcode" package (npm install);
   without it the sheet prints the web address instead.
   ========================================================== */
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, ".."), SITE = "https://beattheheat.asia";
let QR = null; try { QR = require("qrcode"); } catch (e) { /* optional */ }
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, "data.js"), "utf8") + `
;Object.assign(this, { HOME_HEATS, GLOSSARY, LIVE_CITIES, CITY_PROFILES, CITY_HAP, LOOPS, LEVERS, ORGANISATIONS, WORKED_EXAMPLES, AT_RISK,
  HEATWAVES, HEATWAVES_NOTE, COOL_PLACES, COOL_TRAPS, COOL_COST_NOTE, COOL_FX, STALLS, LIVE_FINGERPRINT, LOOP_STAKES, STRAIN, COOL_ASK, ACTION_SETTINGS, ACTION_LINES, INSTITUTIONS });`, ctx);
const D = ctx, TODAY = new Date().toISOString().slice(0, 10);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const short = u => String(u).replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
const srcList = list => `<ol class="srcs">${list.map(s => `<li>${esc(s.label)}. <a href="${esc(s.url)}">${esc(short(s.url))}</a></li>`).join("")}</ol>`;
const loop = id => D.LOOPS.find(l => l.id === id), lever = id => D.LEVERS.find(v => v.id === id);
// the actions that cut a link in a cycle, as the live map computes them
const loopLevers = l => { const e = l.path.map((id, i) => id + ">" + l.path[(i + 1) % l.path.length]); return D.LEVERS.filter(v => e.includes(v.edge.join(">"))); };
const FX = D.COOL_FX.inrPerUsd;
const usd = n => { const v = n / FX, e = 10 ** (Math.floor(Math.log10(v)) - 1); return "US$" + (v >= 10 ? (Math.round(v / e) * e).toLocaleString("en-US") : String(Math.round(v * 10) / 10)); };
const inr = n => n >= 10000000 ? `₹${+(n / 10000000).toFixed(2)} crore` : n >= 100000 ? `₹${+(n / 100000).toFixed(1)} lakh` : `₹${n.toLocaleString("en-IN")}`;
const stall = id => (D.STALLS || []).find(s => s.id === id);

const CSS = `
@page { size: A4; margin: 11mm 12mm 12mm; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Inter, "Segoe UI", Roboto, Arial, sans-serif; color: #16202B; background: #E9E4DC; font-size: 9.6pt; line-height: 1.42; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.sheet { width: 210mm; min-height: 297mm; margin: 14px auto; background: #FAF7F2; padding: 11mm 12mm 10mm; box-shadow: 0 2px 18px rgba(0,0,0,.15); }
.fit { display: flex; flex-direction: column; min-height: 273mm; }
.bar { display: flex; justify-content: space-between; align-items: center; border-bottom: 2.5px solid #16202B; padding-bottom: 6px; }
.brand { display: flex; align-items: center; gap: 7px; font-family: Anton, Impact, sans-serif; font-size: 15pt; letter-spacing: .02em; }
.brand i { width: 13px; height: 13px; border-radius: 50%; background: #F26430; border: 2.5px solid #16202B; }
.kind { font-size: 8pt; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #9A3A12; text-align: right; }
h1 { font-family: Anton, Impact, sans-serif; font-weight: 400; font-size: 25pt; line-height: 1.02; text-transform: uppercase; margin: 9px 0 4px; }
.lede { font-size: 10.5pt; color: #39424D; max-width: 165mm; }
h2 { font-size: 10.5pt; text-transform: uppercase; letter-spacing: .06em; margin: 9px 0 4px; color: #16202B; border-top: 1.5px solid #16202B; padding-top: 5px; }
.cols { display: grid; grid-template-columns: 1fr 1fr; gap: 0 7mm; }
.cols3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; }
.box { padding: 6px 8px; border-radius: 6px; background: #fff; border: 1px solid #E2DACE; }
.box b.big { display: block; font-family: Anton, Impact, sans-serif; font-weight: 400; font-size: 17pt; line-height: 1.05; color: #D7263D; }
.hot { border-left: 4px solid #D7263D; } .cool { border-left: 4px solid #2C6E9E; } .good { border-left: 4px solid #2A9D8F; background: #EAF6F4; }
ul.tight, ol.tight { padding-left: 15px; } ul.tight li, ol.tight li { margin: 2px 0; }
.check li { list-style: none; position: relative; padding-left: 17px; margin: 3px 0; }
.check li::before { content: ""; position: absolute; left: 0; top: 2px; width: 10px; height: 10px; border: 1.5px solid #16202B; border-radius: 2px; background: #fff; }
.tag { display: inline-block; padding: 1px 6px; border-radius: 9px; font-size: 7.5pt; font-weight: 800; color: #fff; }
.t-plan { background: #1D6E64; } .t-building { background: #9A5B00; } .t-none { background: #D7263D; }
table { width: 100%; border-collapse: collapse; font-size: 8.4pt; }
th { text-align: left; font-size: 7.5pt; text-transform: uppercase; letter-spacing: .05em; border-bottom: 1.5px solid #16202B; padding: 3px 4px; }
td { border-bottom: 1px solid #E2DACE; padding: 3px 4px; vertical-align: top; }
.srcs { padding-left: 14px; font-size: 7.2pt; color: #5E6570; } .srcs li { margin: 1px 0; } .srcs a { color: #5E6570; text-decoration: none; }
.grow { flex: 1; }
footer { margin-top: 7px; border-top: 2.5px solid #16202B; padding-top: 6px; display: grid; grid-template-columns: 1fr 22mm; gap: 6mm; font-size: 7pt; color: #39424D; }
footer p + p { margin-top: 2px; } footer b { color: #16202B; }
.qr { width: 22mm; text-align: center; font-size: 6.5pt; } .qr svg { width: 22mm; height: 22mm; display: block; }
.tools { width: 210mm; margin: 14px auto 0; display: flex; gap: 10px; align-items: center; font-size: 10pt; }
.tools button, .tools a { padding: 8px 16px; border-radius: 999px; border: 2px solid #16202B; background: #F26430; color: #16202B; font: inherit; font-weight: 800; cursor: pointer; text-decoration: none; }
.tools a { background: #fff; }
@media print { body { background: none; } .sheet { margin: 0; box-shadow: none; width: auto; min-height: 0; height: 273mm; padding: 0; overflow: hidden; } .tools { display: none; } a { color: inherit; } }
@media screen and (max-width: 820px) { .sheet { width: auto; margin: 8px; min-height: 0; } .fit { zoom: 1 !important; min-height: 0 !important; } .tools { width: auto; margin: 8px; flex-wrap: wrap; } .cols, .cols3 { grid-template-columns: 1fr; } }
`;

async function qr(url) {
  if (!QR) return `<p>${esc(short(url))}</p>`;
  const svg = await QR.toString(url, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#16202B", light: "#FAF7F2" } });
  return `${svg}<p>Scan for the live page</p>`;
}
async function sheet({ slug, kind, title, lede, body, live, sources }) {
  const url = `${SITE}/print/${slug}/`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} | BeatTheHeat.Asia one-pager</title>
<meta name="description" content="${esc(lede)}">
<link rel="canonical" href="${url}"><link rel="license" href="https://creativecommons.org/licenses/by/4.0/">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&display=swap">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='15' fill='%23F26430'/%3E%3C/svg%3E">
<style>${CSS}</style>
</head>
<body>
<nav class="tools" aria-label="Page tools"><button type="button" onclick="window.print()">Print or save as PDF</button><a href="${esc(live)}">Open the live page</a><a href="/print/">All one-pagers</a></nav>
<main class="sheet"><div class="fit">
  <div class="bar"><div class="brand"><i></i>BEAT THE HEAT</div><div class="kind">${esc(kind)}</div></div>
  <h1>${esc(title)}</h1>
  <p class="lede">${esc(lede)}</p>
  ${body}
  <div class="grow"></div>
  ${sources && sources.length ? `<h2>Sources</h2>${srcList(sources)}` : ""}
  <footer>
    <div>
      <p><b>BeatTheHeat.Asia</b> · A living map of extreme heat in South and Southeast Asia, updated as the evidence grows. Live page: ${esc(short(live.startsWith("http") ? live : SITE + live))}</p>
      <p>This is a beta version. BeatTheHeat.Asia is being built by a group of organisations working on extreme heat. It is an independent, work-in-progress project, not an official publication of any one organisation. Listing an organisation does not imply its partnership, affiliation or endorsement.</p>
      <p><b>Licence:</b> © BeatTheHeat.Asia contributors. Shared under Creative Commons Attribution 4.0 (CC BY 4.0, creativecommons.org/licenses/by/4.0): you may copy, adapt, translate and share this sheet, with credit to BeatTheHeat.Asia and a link to beattheheat.asia. Sources cited remain their owners’. Printed from the map’s data on ${TODAY}; check the live page for updates.</p>
    </div>
    <div class="qr">${await qr(live.startsWith("http") ? live : SITE + live)}</div>
  </footer>
</div></main>
<script>
// fit the sheet to one A4 page: shrink the content just enough, then keep the footer at the bottom
(function () { var f = document.querySelector(".fit"), max = 273 * 96 / 25.4;
  function fit() { f.style.zoom = 1; f.style.minHeight = "0"; var h = f.scrollHeight, z = h > max ? max / h : 1;
    f.style.zoom = z.toFixed(3); f.style.minHeight = (max / z) + "px"; document.documentElement.dataset.fit = z.toFixed(3); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit); fit(); window.addEventListener("beforeprint", fit); })();
</script>
</body>
</html>
`;
}

// a static drawing of a tin-roofed home with the four heats numbered
const houseSVG = () => { const zig = [...Array(15)].map((_, i) => `${230 + i * 30},${i % 2 ? 132 : 118}`).join(" ");
  const num = (n, x, y, hot) => `<circle cx="${x}" cy="${y}" r="15" fill="${hot ? "#F26430" : "#16202B"}" stroke="#fff" stroke-width="3"/><text x="${x}" y="${y + 5}" fill="#fff" font-size="15" font-weight="800" text-anchor="middle" font-family="Inter,Arial">${n}</text>`;
  const arrows = [0, 1, 2, 3, 4].map(i => `<path d="M${270 + i * 80} 160 q 7 9 0 18 q -7 9 0 18" fill="none" stroke="#D7263D" stroke-width="4" stroke-linecap="round"/><path d="M${263 + i * 80} 192 L${270 + i * 80} 203 L${277 + i * 80} 192" fill="none" stroke="#D7263D" stroke-width="4" stroke-linecap="round"/>`).join("");
  return `<svg viewBox="0 0 720 320" role="img" aria-label="A tin-roofed home with four heats: outdoor air, the roof, radiant heat and indoor air" style="width:100%;height:auto;display:block;border-radius:6px">
    <rect width="720" height="320" fill="#F8D9B8"/><circle cx="650" cy="55" r="26" fill="#F26430"/><rect y="290" width="720" height="30" fill="#D8B585"/>
    <rect x="76" y="210" width="6" height="80" fill="#6B5444"/><rect x="52" y="176" width="54" height="38" rx="4" fill="#F4F2EE" stroke="#16202B" stroke-width="3"/>
    <rect x="245" y="132" width="420" height="158" fill="#F6C5B0" stroke="#16202B" stroke-width="5"/><rect x="610" y="185" width="30" height="40" fill="#BFD4E6" stroke="#16202B" stroke-width="3"/>
    <g fill="none" stroke="#16202B" stroke-width="5" stroke-linecap="round"><circle cx="360" cy="206" r="11"/><path d="M360 217 V252 M342 234 L360 226 L378 234 M360 252 L348 280 M360 252 L372 280"/><circle cx="470" cy="206" r="11"/><path d="M470 217 V252 M452 234 L470 226 L488 234 M470 252 L458 280 M470 252 L482 280"/></g>
    ${arrows}<polygon points="230,140 ${zig} 680,140" fill="#E0442B" stroke="#16202B" stroke-width="4" stroke-linejoin="round"/>
    ${num(1, 79, 160)}${num(2, 455, 96, true)}${num(3, 300, 185)}${num(4, 590, 265)}</svg>`; };

async function build() {
  const out = {}, list = [];
  const add = (slug, meta, html) => { out[slug] = html; list.push(Object.assign({ slug }, meta)); };
  const H = D.HOME_HEATS, cpr = stall("money") && stall("money").source, nights = H.night.source;

  // 1. Four heats in a home
  {
    const body = `<div class="cols" style="margin-top:8px"><div>${houseSVG()}
        <ol class="tight" style="margin-top:6px">${H.heats.map(h => `<li><b>${esc(h.name)}.</b> ${esc(h.text)}</li>`).join("")}</ol></div>
      <div><div class="box cool"><b>At night.</b> ${esc(H.night.text)}</div>
        <div class="cols3" style="grid-template-columns:1fr;gap:5px;margin-top:6px">${H.facts.map(f => `<div class="box"><b class="big">${esc(f.n)}</b>${esc(f.text)}</div>`).join("")}</div>
        <p style="margin-top:6px;font-size:8.6pt;color:#5E6570">${esc(H.nuance.text)}</p></div></div>
      <h2>Eight questions for your heat action plan</h2>
      <ul class="check cols">
        <li>Does your heat warning count hot nights, not only daytime highs?</li>
        <li>Do you know which neighbourhoods live under metal, asbestos or plastic roofs?</li>
        <li>Have you measured indoor and night-time temperatures in a sample of those homes? Low-cost loggers can do it.</li>
        <li>Is there a cool-roof programme for informal settlements, and does it reach renters?</li>
        <li>Are cooling spaces open in the evening and at night, near where people sleep?</li>
        <li>Do outreach teams check on people who are alone, older or ill, including after dark?</li>
        <li>Do housing upgrades protect tenants from rent rises and eviction?</li>
        <li>Is the plan funded, with a named owner? In a review of 37 Indian heat action plans, 11 discussed funding.</li>
      </ul>
      <div class="box good" style="margin-top:6px"><b>For heat plans.</b> ${esc(H.plans)}</div>`;
    add("four-heats", { kind: "One-pager · For municipal heat officers and housing departments", title: "Four heats in a home", for: "Municipal heat officers and housing departments" },
      await sheet({ slug: "four-heats", kind: "One-pager · For municipal heat officers and housing departments", title: "Four heats in a home",
        lede: "A heat warning gives one number. A family under a tin roof lives with four, and the worst of it often comes after dark.", body, live: "/#four-heats",
        sources: [...H.heats.filter(h => h.source).map(h => h.source), nights, ...H.facts.map(f => f.source), H.nuance.source, cpr].filter(Boolean) }));
  }

  // 1b. Weather, work and the person
  {
    const S = D.STRAIN, col = { weather: "#F6A27C", work: "#F2C14E", person: "#8CC5BC" }, pos = { weather: [150, 92], work: [230, 92], person: [190, 158] };
    const venn = `<svg viewBox="0 0 380 250" role="img" aria-label="Three overlapping circles: weather, work and the person. Heat strain is where they meet." style="width:100%;height:auto;display:block">
      ${S.parts.map(x => `<circle cx="${pos[x.id][0]}" cy="${pos[x.id][1]}" r="74" fill="${col[x.id]}" fill-opacity=".7" stroke="#16202B" stroke-width="2.5"/>`).join("")}
      <text x="122" y="70" font-size="14" font-weight="800" text-anchor="middle">WEATHER</text><text x="258" y="70" font-size="14" font-weight="800" text-anchor="middle">WORK</text><text x="190" y="200" font-size="14" font-weight="800" text-anchor="middle">PERSON</text>
      <circle cx="190" cy="115" r="24" fill="#D7263D" stroke="#fff" stroke-width="2.5"/><text x="190" y="112" font-size="9.5" font-weight="800" fill="#fff" text-anchor="middle">Heat</text><text x="190" y="124" font-size="9.5" font-weight="800" fill="#fff" text-anchor="middle">strain</text></svg>`;
    const body = `<div class="cols" style="margin-top:6px;grid-template-columns:2fr 3fr"><div>${venn}<p style="font-size:8.6pt;color:#39424D">${esc(S.close)}</p></div>
        <div>${S.parts.map(x => `<div class="box" style="margin-bottom:4px;border-left:4px solid ${col[x.id]}"><b>${x.n}. ${esc(x.name)}.</b> ${esc(x.text)}<p style="margin-top:3px;font-size:8.2pt;color:#5E6570">Evidence: ${esc(x.facts[0].text)}</p></div>`).join("")}</div></div>
      <h2>Three groups heat plans often miss</h2>
      <div class="cols3">${S.groups.map(g => `<div class="box good" style="font-size:8.6pt"><b>${esc(g.name)}.</b> ${esc(g.brief)}</div>`).join("")}</div>
      <h2>Six questions for your heat action plan</h2>
      <ul class="check cols">
        <li>Which groups work indoors in hot sheds, kitchens or factories, and does the plan measure heat where they work?</li>
        <li>Who does heavy work, or works in sun or near hot surfaces, through the hottest hours?</li>
        <li>Who wears protective clothing that holds heat in, including health workers?</li>
        <li>Can people rest, drink and reach shade without losing pay?</li>
        <li>Who is older, ill, pregnant or on long-term medicines, and who checks on them?</li>
        <li>Do people get a cool night to recover, and does the warning count hot nights?</li>
      </ul>`;
    const meta = { kind: "One-pager · For heat officers, employers and health departments", title: "Weather, work and the person", for: "Heat officers, employers and health departments" };
    add("weather-work-person", meta,
      await sheet({ slug: "weather-work-person", kind: meta.kind, title: meta.title,
        lede: "The same thermometer reading can be safe for one person and dangerous for another. Heat strain is where the weather, the work and the person meet.", body, live: "/#strain",
        sources: [...S.parts.flatMap(x => [x.facts[0].source, x.facts[0].also]), ...S.groups.map(g => g.source)].filter(Boolean).filter((v, i, a) => a.findIndex(w => w.url === v.url) === i) }));
  }

  // 2. Dry heat and humid heat
  {
    const g = D.GLOSSARY.find(x => x.id === "dryhumid"), wb = D.GLOSSARY.find(x => x.id === "wetbulb"), wbgt = D.GLOSSARY.find(x => x.id === "wbgt"), hi = D.GLOSSARY.find(x => x.id === "heatindex");
    const body = `<div class="cols" style="margin-top:8px">
        <div class="box hot"><h2 style="border:0;margin-top:0;padding-top:0;color:#B4441B">Dry heat</h2>
          <p>Very hot air with little moisture. Sweat still evaporates, but when the air is hotter than the skin it pours heat in and the body loses water fast.</p>
          <p style="margin-top:4px"><b>When:</b> South Asia’s pre-monsoon months, roughly April to June.</p>
          <p style="margin-top:4px"><b>What helps:</b> water and salts; shade and rest in the hottest hours; evaporative coolers work well in dry air.</p></div>
        <div class="box cool"><h2 style="border:0;margin-top:0;padding-top:0;color:#2C6E9E">Humid heat</h2>
          <p>Warm, wet air in which sweat can’t evaporate, so the body can’t cool itself even at lower temperatures.</p>
          <p style="margin-top:4px"><b>When:</b> much of the year in Southeast Asia; South Asia’s monsoon and coasts. In South Asia it is rising faster than dry heat.</p>
          <p style="margin-top:4px"><b>What helps:</b> cool rooms and moving air; rest breaks set by the heat people feel. Misting and evaporative cooling lose much of their power.</p></div></div>
      <h2>Measure what the body feels</h2>
      <table><tr><th>Measure</th><th>What it adds</th><th>Who uses it</th></tr>
        <tr><td><b>Air temperature</b></td><td>Heat in the shade only</td><td>Most heatwave definitions</td></tr>
        <tr><td><b>Heat index</b></td><td>${esc(hi ? hi.text : "")}</td><td>PAGASA, the Philippines</td></tr>
        <tr><td><b>WBGT</b></td><td>${esc(wbgt ? wbgt.text : "")}</td><td>Singapore’s Heat Stress Advisory</td></tr>
        <tr><td><b>Wet-bulb temperature</b></td><td>${esc(wb ? wb.text : "")}</td><td>Research and physiology</td></tr></table>
      <h2>Six questions for heat warnings and work rules</h2>
      <ul class="check cols">
        <li>Does your warning use a measure that counts humidity, such as the heat index or WBGT?</li>
        <li>Do thresholds differ for humid coastal areas and dry inland ones?</li>
        <li>Do warnings cover humid heat in the monsoon, not only the pre-monsoon peak?</li>
        <li>Are misting and evaporative coolers used only where the air is dry enough for them to work?</li>
        <li>Are work–rest rules set by WBGT or the heat index, not air temperature alone?</li>
        <li>Do warnings include hot nights, when bodies should recover?</li></ul>
      <p style="margin-top:6px"><b>Watch the 2-minute explainer:</b> beattheheat.asia/#watch-dryhumid</p>`;
    add("dry-and-humid-heat", { kind: "One-pager · For health, labour and disaster management officials", title: "Dry heat and humid heat", for: "Health, labour and disaster management officials" },
      await sheet({ slug: "dry-and-humid-heat", kind: "One-pager · For health, labour and disaster management officials", title: "Dry heat and humid heat",
        lede: g ? g.text : "", body, live: "/#watch-dryhumid",
        sources: [g && g.source, wb && wb.source, hi && hi.source, wbgt && wbgt.source,
          { label: "Coffel et al., Earth’s Future, 2025: more distinct dry and humid heat", url: "https://agupubs.onlinelibrary.wiley.com/doi/10.1029/2024EF005770" },
          { label: "Ministry of Sustainability and the Environment, Singapore, 2023: Heat Stress Advisory", url: "https://mse.gov.sg/latest-news/press-release-heat-stress-advisory" }].filter(Boolean) }));
  }

  // 3. A brief for each city
  for (const cp of D.CITY_PROFILES) {
    const c = D.LIVE_CITIES.find(x => x.id === cp.id), loops = cp.loops.map(x => ({ l: loop(x.id), why: x.why })).filter(x => x.l);
    const orgs = cp.orgs.map(id => D.ORGANISATIONS.find(o => o.id === id)).filter(Boolean), risks = cp.risk.map(id => D.AT_RISK.find(g => g.id === id)).filter(Boolean);
    const exs = cp.examples.map(id => D.WORKED_EXAMPLES.find(x => x.id === id)).filter(Boolean);
    const body = `<div class="cols" style="margin-top:8px">
        <div class="box"><b>Heat type.</b> ${esc(cp.heat || "")}</div>
        <div class="box"><b>Heat action plan</b> <span class="tag t-${cp.hap.status}">${esc(D.CITY_HAP[cp.hap.status])}</span><p style="margin-top:3px">${esc(cp.hap.text)}</p></div></div>
      <h2>Vicious cycles the evidence ties to ${esc(c.name)}</h2>
      <table><tr><th style="width:30%">Cycle</th><th>Why here</th><th style="width:28%">One action that breaks it</th></tr>
        ${loops.map(x => `<tr><td><b>${esc(x.l.name)}</b></td><td>${esc(x.why)}</td><td>${loopLevers(x.l).length ? esc(loopLevers(x.l)[0].title) : ""}</td></tr>`).join("")}</table>
      <div class="cols" style="margin-top:2px"><div><h2>Who heat hits hardest here</h2><ul class="tight">${risks.map(r => `<li>${esc(r.name)}</li>`).join("")}</ul>
          ${exs.length ? `<h2>A worked plan to learn from</h2><p>${exs.map(x => `<b>${esc(x.title)}</b> (${esc(x.place)}, ${esc(x.year)})`).join("; ")}</p>` : ""}</div>
        <div><h2>Already at work here</h2><ul class="tight">${orgs.map(o => `<li>${esc(o.name)}</li>`).join("")}</ul><p style="font-size:7.5pt;color:#5E6570">Listing does not imply partnership, affiliation or endorsement.</p></div></div>
      <h2>Four questions for ${esc(c.name)}’s heat plan</h2>
      <ul class="check cols"><li>Is it funded, with a named owner?</li><li>Does it assess who is most vulnerable, and where they live?</li><li>Does it have legal backing, so departments must act?</li><li>Does it count indoor and night-time heat, not only daytime highs?</li></ul>
      <p style="margin-top:6px"><b>Official warnings:</b> ${esc(c.warn.label)} · <b>Today’s heat and the week ahead:</b> beattheheat.asia/#city-${cp.id}</p>`;
    const srcs = [...cp.hap.sources, ...loops.flatMap(x => { const ev = (D.LOOP_STAKES && D.LOOP_STAKES[x.l.id]) || null; return ev ? [{ label: ev.by, url: ev.url }] : []; }), cpr].filter(Boolean)
      .filter((s, i, a) => a.findIndex(z => z.url === s.url) === i).slice(0, 8);
    add(`city-${cp.id}`, { kind: `City brief · ${c.name}`, title: `Extreme heat in ${c.name}`, for: "City officials, partners and funders", group: "city" },
      await sheet({ slug: `city-${cp.id}`, kind: "City brief · For city officials, partners and funders", title: `Extreme heat in ${c.name}`, lede: cp.tagline, body, live: `/#city-${cp.id}`, sources: srcs }));
  }

  // 4. Lessons from Asia's heatwaves
  {
    const by = id => D.HEATWAVES.find(h => h.id === id);
    const body = `<table style="margin-top:8px"><tr><th style="width:16%">When</th><th style="width:24%">Where</th><th style="width:22%">Peak</th><th>Recorded toll</th></tr>
        ${D.HEATWAVES.map(h => `<tr><td><b>${esc(h.when)}</b></td><td>${esc(h.place)}</td><td>${esc(h.peak)}</td><td>${esc(h.toll)}</td></tr>`).join("")}</table>
      <h2>Four lessons</h2>
      <div class="cols">
        <div class="box good"><b>Plans save lives.</b> After 2,042 recorded heatstroke deaths in 1998, Odisha wrote a heat plan, and recorded deaths fell to 91 the next year. Ahmedabad’s plan was later estimated to avoid 1,190 deaths a year.</div>
        <div class="box hot"><b>Counts are a floor.</b> In 2024 India recorded 110 heat deaths against more than 40,000 suspected heatstroke cases by mid-June. Ahmedabad’s 2010 toll was only found by counting excess deaths.</div>
        <div class="box"><b>Heat arrives earlier, and wetter.</b> In 2022 it came in March, before the wheat was ready. Humid heat that once came less than once a century in Bangladesh and India can now be expected about every five years.</div>
        <div class="box"><b>Climate change raises the odds.</b> Scientists found the 2022 heatwave about 30 times more likely because of climate change, a 30-day South Asian heatwave like April 2024’s about 45 times more likely, and April 2026’s heat about three times more likely.</div></div>
      <p style="margin-top:6px;font-size:8.4pt;color:#5E6570">${esc(D.HEATWAVES_NOTE)}</p>`;
    add("heatwaves", { kind: "One-pager · For journalists, officials and funders", title: "Lessons from Asia’s heatwaves, 1998–2026", for: "Journalists, officials and funders" },
      await sheet({ slug: "heatwaves", kind: "One-pager · For journalists, officials and funders", title: "Lessons from Asia’s heatwaves, 1998–2026",
        lede: "Ten heatwaves across South and Southeast Asia: what they cost, what changed afterwards, and what they teach.", body, live: "/#heatwaves",
        sources: D.HEATWAVES.flatMap(h => h.sources.slice(0, 1)) }));
  }

  // 4b. Practical action cards, one sheet per setting
  for (const st of D.ACTION_SETTINGS) {
    const inst = id => (D.INSTITUTIONS.find(i => i.id === id) || {}).name || id;
    const costOf = ref => { const pl = ref && D.COOL_PLACES.find(x => x.id === ref[0]), o = pl && pl.options.find(x => x.name === ref[1]);
      return o && o.cost && o.cost.conf !== "low" && o.cost.high ? ` Rough cost: about ${usd(o.cost.low)}–${usd(o.cost.high)} per ${esc(o.cost.unit)} (${inr(o.cost.low)}–${inr(o.cost.high)} at Indian prices).` : ""; };
    const line = (c, k) => k === "who" ? esc(c.who.map(inst).join(", ")) : k === "running" ? esc(c.running) + costOf(c.cost)
      : k === "evidence" ? esc(c.evidence.text) : k === "worksIf" ? esc(c.worksIf.join("; ")) + "." : esc(c[k]);
    const srcs = st.cards.map(c => c.evidence.source).filter((v, i, a) => a.findIndex(w => w.url === v.url) === i);
    const keep = ["what", "protects", "who", "running", "stops", "worksIf"];
    const body = `<p style="margin-top:3px;font-size:9.5pt;color:#39424D">${esc(st.intro)} The full cards, with where each suits and its evidence, are on the live page.</p>
      <div class="cols" style="margin-top:6px;gap:3.5mm 5mm">${st.cards.map(c => `<div class="box" style="font-size:8.6pt;border-top:3px solid #2A9D8F;break-inside:avoid">
        <b style="font-size:10.2pt">${esc(c.title)}</b>
        ${D.ACTION_LINES.filter(([k]) => keep.includes(k)).map(([k, label]) => `<p style="margin-top:2px${k === "worksIf" ? ";background:#FFF6E5;padding:2px 4px;border-radius:3px" : k === "stops" ? ";color:#8A1C2B" : ""}"><b style="font-size:7.2pt;letter-spacing:.06em;text-transform:uppercase;color:#5E6570">${esc(label)}:</b> ${line(c, k)}</p>`).join("")}
        <p style="margin-top:2px;font-size:7.6pt;color:#5E6570">Evidence: source ${srcs.findIndex(v => v.url === c.evidence.source.url) + 1} below.</p></div>`).join("")}</div>
      <p style="margin-top:5px;font-size:7.6pt;color:#5E6570">Costs, where shown, are rough Indian planning ranges from the site’s cooling options, not quotes. Every action also needs a named owner and a running budget.</p>`;
    const meta = { kind: `Practical actions · ${st.name}`, title: `Practical actions: ${st.name}`, for: "Anyone who has to act", group: "actions" };
    add(`actions-${st.id}`, meta,
      await sheet({ slug: `actions-${st.id}`, kind: "Practical actions · Eight questions for every action", title: `Practical actions: ${st.name}`,
        lede: "What to do, who must act, what it takes to run, what could stop it, and what it only works with.", body, live: `/#practical-${st.id}`,
        sources: srcs }));
  }

  // 5. Cooling options, one sheet per place
  for (const pl of D.COOL_PLACES) {
    const cost = c => !c || c.conf === "low" || !c.high ? "No solid range: get local quotes" : `About ${usd(c.low)}–${usd(c.high)} per ${esc(c.unit)} (${inr(c.low)}–${inr(c.high)} at Indian prices)`;
    const body = `<div class="cols" style="margin-top:8px"><div class="box"><b>Protects.</b> ${esc(pl.protects)}</div><div class="box hot"><b>Key caution.</b> ${esc(pl.caution)}</div></div>
      <h2>Options, and what keeps each working</h2>
      <table><tr><th style="width:17%">Option</th><th>What it does</th><th>Keeps working with</th><th>Avoid</th><th style="width:20%">Rough cost</th></tr>
        ${pl.options.map(o => `<tr><td><b>${esc(o.name)}</b></td><td>${esc(o.does)}</td><td>${esc(o.keeps)}</td><td>${esc(o.avoid)}</td><td>${cost(o.cost)}</td></tr>`).join("")}</table>
      ${(pl.facts || []).length ? `<h2>What the evidence says</h2><ul class="tight">${pl.facts.map(f => `<li>${esc(f.fact)}</li>`).join("")}</ul>` : ""}
      <div class="cols" style="margin-top:4px"><div class="box good"><b>How you will know it works.</b> ${esc(pl.measure)}</div>
        <div class="box"><b>Five traps that waste cooling money:</b> ${D.COOL_TRAPS.map(t => esc(t.name)).join(" · ")}.</div></div>
      ${pl.kitchen ? `<div class="box hot" style="margin-top:5px"><b>${esc(pl.kitchen.title)}.</b> ${esc(pl.kitchen.brief)}<p style="margin-top:3px;font-size:8.2pt"><b>Ask:</b> ${pl.kitchen.questions.map(esc).join(" · ")}</p></div>` : ""}
      ${pl.id !== "system" ? `<div class="box good" style="margin-top:5px;font-size:8.4pt"><b>Before you choose, ask:</b> ${D.COOL_ASK.questions.map(esc).join(" · ")} <b>Keep the outcomes apart:</b> ${esc(D.COOL_ASK.outcomesShort)}</div>` : ""}
      <p style="margin-top:5px;font-size:7.6pt;color:#5E6570">${esc(D.COOL_COST_NOTE)}</p>`;
    add(`cooling-${pl.id}`, { kind: `Cooling options · ${pl.name}`, title: `Cooling options: ${pl.name}`, for: "City engineers, planners and programme teams", group: "cooling" },
      await sheet({ slug: `cooling-${pl.id}`, kind: "Cooling options · For city engineers, planners and programme teams", title: `Cooling options: ${pl.name}`,
        lede: "What to build or change, what keeps it working, the traps to avoid and rough costs.", body, live: `/#cool-${pl.id}`,
        sources: [...(pl.facts || []).map(f => f.source), pl.kitchen && pl.kitchen.source, ...pl.options.filter(o => o.cost && o.cost.src).map(o => o.cost.src), D.COOL_FX.source].filter(Boolean).filter((s, i, a) => a.findIndex(z => z.url === s.url) === i) }));
  }

  // write the sheets and an index
  for (const [slug, html] of Object.entries(out)) { const dir = path.join(ROOT, "print", slug); fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, "index.html"), html); }
  const group = (g, t) => `<h2>${t}</h2><ul class="pl">${list.filter(x => (x.group || "") === g).map(x => `<li><a href="/print/${x.slug}/"><b>${esc(x.title)}</b></a><span>${esc(x.for)}</span></li>`).join("")}</ul>`;
  fs.writeFileSync(path.join(ROOT, "print", "index.html"), `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Printable one-pagers | BeatTheHeat.Asia</title><meta name="description" content="Printable, one-page briefs from BeatTheHeat.Asia for officials, planners, partners and journalists. Free to share under CC BY 4.0.">
<link rel="canonical" href="${SITE}/print/"><link rel="license" href="https://creativecommons.org/licenses/by/4.0/">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;600;800&display=swap">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='15' fill='%23F26430'/%3E%3C/svg%3E">
<style>body{margin:0;font-family:Inter,Arial,sans-serif;color:#16202B;background:#FAF7F2;line-height:1.5}main{max-width:900px;margin:0 auto;padding:24px 20px 48px}
.brand{display:flex;align-items:center;gap:8px;font-family:Anton,Impact,sans-serif;font-size:1.3rem;text-decoration:none;color:#16202B}.brand i{width:16px;height:16px;border-radius:50%;background:#F26430;border:3px solid #16202B}
h1{font-family:Anton,Impact,sans-serif;font-weight:400;text-transform:uppercase;font-size:clamp(2rem,1.5rem + 3vw,3rem);line-height:1.02;margin:22px 0 8px}h2{font-size:1.1rem;margin:28px 0 6px;border-top:2px solid #16202B;padding-top:12px}
.pl{list-style:none;padding:0;display:grid;gap:8px;grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr))}.pl li{background:#fff;border:1px solid #E6DFD4;border-radius:10px;padding:12px 14px;display:flex;flex-direction:column;gap:2px}.pl a{color:#16202B;text-decoration-color:#F26430;text-underline-offset:3px}.pl span{font-size:.85rem;color:#5E6570}
footer{margin-top:40px;font-size:.85rem;color:#5E6570;border-top:1px solid #E6DFD4;padding-top:12px}</style></head>
<body><main><a class="brand" href="/"><i></i>BEAT THE HEAT</a>
<h1>Printable one-pagers</h1><p>Single A4 pages from the map, for meetings, briefings and noticeboards. Each one is generated from the same sourced data as the site, lists its sources, and links back to the live page with a QR code. Open one and choose <b>Print or save as PDF</b>.</p>
${group("actions", "Practical actions, by setting")}${group("", "Briefs")}${group("city", "City briefs")}${group("cooling", "Cooling options, by place")}
<footer><p>This is a beta version. BeatTheHeat.Asia is being built by a group of organisations working on extreme heat. It is an independent, work-in-progress project, not an official publication of any one organisation. Listing an organisation does not imply its partnership, affiliation or endorsement.</p>
<p>© BeatTheHeat.Asia contributors. Shared under <a rel="license" href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>: copy, adapt, translate and share, with credit and a link to beattheheat.asia. Sources cited remain their owners’. Generated ${TODAY}.</p></footer></main></body></html>
`);
  return list;
}
module.exports = build;
if (require.main === module) build().then(l => console.log("Wrote", l.length, "one-pagers to /print/" + (QR ? "" : " (no QR: run npm install for QR codes)")));
