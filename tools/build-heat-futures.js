// Common Shade: /heat-futures/, "2035–2050: Futures we can still shape". Two panels kept apart:
//   climate (projected): the World Bank CCKP CMIP6 0.25-degree climatologies for the grid cell nearest each of six
//     cities, read from data/site/heat-futures.json (research/2026-11/heat-futures/extract.py), never edited by hand
//   protection (illustrative): a transparent coverage model (heat-futures/futures-core.js) with editable assumptions
// Rendered here with the default view, the full data table, the register of sources and assumptions and the method, so
// it reads without JavaScript; heat-futures/hf.js redraws on each choice. Called by build-pages.js; checked by
// tools/check-heat-futures.js.
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), SLUG = "heat-futures";
const F = require("../heat-futures/futures-core.js"), HS = require("./heat-interactives-sources.js");
const D = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "site", "heat-futures.json"), "utf8"));

module.exports = function heatFutures({ page, write, esc, hero, V }) {
  const ok = k => HS.passed(k), S = k => HS.src(k);
  const ext = (u, t) => `<a href="${esc(u)}" target="_blank" rel="noopener">${t}<span class="visually-hidden"> (opens in a new tab)</span></a>`;
  const CITIES = F.ENUM.city, sel = F.DEF, P0 = F.PATHWAYS[sel.path];
  const radios = (name, items, cur, label) => `<fieldset class="hf-pick"><legend>${label}</legend><div>${items.map(([v, t, sub]) => `<label class="hf-opt"><input type="radio" name="${name}" value="${v}"${v === cur ? " checked" : ""}><span><b>${esc(t)}</b>${sub ? `<small>${esc(sub)}</small>` : ""}</span></label>`).join("")}</div></fieldset>`;
  const geo = c => { const r = D.cities[c]; return `the 0.25° grid cell centred at ${Math.abs(r.cell.lat)}°${r.cell.lat < 0 ? "S" : "N"}, ${r.cell.lon}°E, ${r.cell.km_from_centre} km from the city centre point`; };
  const f = (ind, v) => F.IND[ind].dp ? v.toFixed(1) : String(Math.round(v));
  const cell = (ind, v) => `${f(ind, v.median)} <small>(${f(ind, v.p10)}–${f(ind, v.p90)})</small>`;
  const table = `<table class="hf-table"><caption>Projected values, grid cell nearest each city: models' median, with the 10th to 90th percentile in brackets</caption><thead><tr><th scope="col">City and indicator</th><th scope="col">1995–2014 model reference</th>${["2020-2039", "2040-2059"].flatMap(p => ["ssp126", "ssp245", "ssp370"].map(s => `<th scope="col">${F.SCN[s].tech}, ${p.replace("-", "–")}</th>`)).join("")}</tr></thead><tbody>${CITIES.flatMap(c => F.ENUM.ind.map(i => { const v = D.cities[c].values[i]; return `<tr><th scope="row">${esc(D.cities[c].name)}: ${esc(F.IND[i].name)} (${esc(F.IND[i].unit)})</th><td>${cell(i, v.historical["1995-2014"])}</td>${["2020-2039", "2040-2059"].flatMap(p => ["ssp126", "ssp245", "ssp370"].map(s => `<td>${cell(i, v[s][p])}</td>`)).join("")}</tr>`; })).join("")}</tbody></table>`;

  const slider = (k, label, unit, help) => `<div class="hf-ctl"><label for="hf-${k}">${label} <output data-o="${k}">${P0[k]}${unit}</output></label><input type="range" id="hf-${k}" data-p="${k}" min="${F.LIM[k][0]}" max="${F.LIM[k][1]}" step="1" value="${P0[k]}"><small>${help}</small></div>`;
  const d0 = F.delay(Object.assign({}, P0), 2035);
  const pathways = Object.entries(F.PATHWAYS).map(([k, p]) => [k, p.name, p.about]);
  const levers = HS.levers;
  const who = { nat: "national government", city: "city government", employers: "employers", workers: "workers", health: "health services", comm: "communities", community: "communities", funders: "funders", agri: "agriculture departments", water: "water utilities", insurers: "insurers", met: "weather services", intl: "international partners", ngo: "NGOs", finance: "lenders and insurers", utilities: "utilities", schools: "schools" };
  const actGroups = [
    ["Emissions reduction", ["emissions"], "Changes how much heat comes; local action does not replace it."],
    ["Reduced local exposure", ["greencity", "coolbydesign"], "Shade and cooler surfaces lower the heat people meet."],
    ["Better buildings and public spaces", ["coolhousing"], "Cooler homes help nights give recovery."],
    ["Work and income protection", ["heatrules", "heatcash"], "Makes stopping or slowing work possible without losing pay."],
    ["Care and health-service continuity", ["readyclinics", "coolingcentres"], "Keeps help open and reachable during heat."],
    ["Reliable utilities", ["affordablecool", "pumpbackup"], "Cooling and water only help when power holds."],
    ["Institutional capacity and operating finance", ["hap", "heatbudget"], "Plans and budgets that last beyond one season."]
  ];
  const act = actGroups.map(([h, ids, gist]) => `<article class="cs-card hf-act"><h3 class="hf-h3">${h}</h3><p class="hf-meta">${gist}</p>${levers(ids).map(l => `<dl><div><dt>Action</dt><dd><a href="/actions/#${esc(l.id)}">${esc(l.title)}</a></dd></div><div><dt>Intended benefit</dt><dd>${esc(l.text)}</dd></div><div><dt>Who acts</dt><dd>${esc((l.who || []).map(w => who[w] || w).join(", "))}</dd></div>${(l.watch || []).slice(0, 2).map(w => `<div><dt>Watch for</dt><dd>${esc(w.text || w.risk || "")}</dd></div>`).join("")}<div><dt>Evidence</dt><dd><a href="/actions/#${esc(l.id)}">Examples and sources on Actions</a></dd></div></dl>`).join("")}</article>`).join("");
  const loops = HS.loops(["sleep", "poverty", "energypoverty", "clinic"]).map(l => `<li><a href="/loops/#${esc(l.id)}"><b>${esc(l.name)}</b></a> <span class="hf-ev">${esc(l.evidence)} evidence</span><span>${esc(l.summary)}</span></li>`).join("");
  const people = [
    ["A street vendor balancing heat exposure and daily earnings", "More hot days mean more days when midday trade means midday heat.", "Sun on the pitch, heat from the road, hours without shade.", "Shaded pitches, water, and income support so a day off is possible.", "City governments (vending rules, markets), social protection agencies.", "Usually the city, for shade and water; income support from national schemes.", "Vendors without a licence or a fixed pitch."],
    ["A garment worker facing indoor heat and production demands", "Outdoor heat raises the starting point for indoor heat; it does not measure the factory.", "Roof and machine heat, ventilation, targets, shift length.", "Cooling and ventilation, paid rest, targets that change on hot days.", "Employers, buyers, labour inspectors, worker organisations.", "Employers, sometimes with buyers; inspections by the state.", "Piece-rate, temporary and home-based workers."],
    ["A caregiver in a rented home that holds heat overnight", "More hot nights mean fewer nights of recovery.", "Roof material, ventilation, crowding, the cost of running a fan or cooler.", "Cooler roofs and homes, affordable power, care services that stay open.", "Housing authorities and landlords, utilities, care services.", "Landlords or tenants, with housing programmes; utilities for supply.", "Tenants who cannot change the building, and households behind on bills."],
    ["An older person dependent on services and reliable electricity", "Hotter days and nights raise strain, which this indicator cannot measure.", "Health conditions, medicines, mobility, being alone.", "Check-ins, cooling spaces within reach, power that stays on, clinics ready for heat.", "Health and social services, utilities, neighbourhood groups.", "Public health budgets and local services.", "People living alone, with limited mobility, or without a phone."],
    ["An agricultural worker whose hours are limited by heat", "More hot days shrink the cooler hours in which field work is possible.", "Sun, humidity, effort, distance to shade and water.", "Changed hours, shade and water in fields, pay that does not punish rest.", "Employers and landowners, agricultural and labour departments.", "Employers, with public extension services.", "Seasonal and migrant workers, and unpaid family labour."]
  ].map(([h, ind, miss, need, auth, pays, excl]) => `<article class="cs-card hf-person"><h3 class="hf-h3">${h}</h3><dl><div><dt>What the climate indicator tells us</dt><dd>${ind}</dd></div><div><dt>What it misses</dt><dd>${miss}</dd></div><div><dt>What protection would need</dt><dd>${need}</dd></div><div><dt>Who can enable it</dt><dd>${auth}</dd></div><div><dt>Who pays and maintains it</dt><dd>${pays}</dd></div><div><dt>Who could still be left out</dt><dd>${excl}</dd></div></dl></article>`).join("");

  const cck = S("cckp"), ip = S("ipcc-spm");
  const register = `<table class="hf-table"><caption>Register of the projected series</caption><tbody>
    <tr><th scope="row">Indicators</th><td>${F.ENUM.ind.map(i => `<b>${esc(F.IND[i].name)}</b> (${esc(F.IND[i].unit)}): ${esc(F.IND[i].def)}. ${esc(F.IND[i].kind)}.`).join("<br>")}</td></tr>
    <tr><th scope="row">Geography</th><td>One 0.25° grid cell per city (about 28 km across), the cell nearest the city centre point the site uses; not the city boundary, the metropolitan area or a neighbourhood. ${CITIES.map(c => `${esc(D.cities[c].name)}: ${geo(c)}`).join("; ")}.</td></tr>
    <tr><th scope="row">Reference period</th><td>1995–2014, from the models’ historical runs (modelled, not observed).</td></tr>
    <tr><th scope="row">Future periods</th><td>20-year averages: 2020–2039 and 2040–2059. The dataset has no 2035 window; the mid-2030s sit inside 2020–2039. No values are interpolated between periods.</td></tr>
    <tr><th scope="row">Scenarios</th><td>SSP1-2.6 (lower emissions), SSP2-4.5 (intermediate), SSP3-7.0 (higher), as named in the IPCC Sixth Assessment Report${ok("ipcc-spm") ? ` (${ext(ip.url, "Summary for Policymakers")})` : ""}. No probability is attached to any of them, and none is called “business as usual”.</td></tr>
    <tr><th scope="row">Models and processing</th><td>The multi-model ensemble of the World Bank Climate Change Knowledge Portal’s CMIP6 collection, downscaled and bias-adjusted at 0.25°${ok("cckp") ? ` (${ext(cck.url, "collection documentation")})` : ""}. Values are the files’ own annual climatologies, read at one grid cell by ${`<a href="https://github.com/arunbh2/beattheheat-asia/blob/main/research/2026-11/heat-futures/extract.py">extract.py</a>`}.</td></tr>
    <tr><th scope="row">Uncertainty shown</th><td>The 10th, 50th and 90th percentiles across the models; not a probability range, and not natural year-to-year variability.</td></tr>
    <tr><th scope="row">Source and retrieval</th><td>World Bank CCKP public bulk files, ${ext(D.source.bulk, "wbg-cckp")}, retrieved ${esc(D.source.retrieved)}.</td></tr>
    <tr><th scope="row">Limitations</th><td>Outdoor air at about 2 m over a 28 km cell; city heat islands, indoor heat and humidity are not in these indicators. Hot-day counts use a fixed 35 °C, which means little in a city where it is rarely reached (Jakarta, Mumbai) and is not a health threshold anywhere.</td></tr>
  </tbody></table>`;

  const body = `${hero("Heat futures", "2035–2050: Futures we can still shape", "Explore how heat could change, and how today’s decisions could change who is protected.")}
  <div class="container hf">
    <div class="hf-labels" aria-label="How to read the evidence labels"><p><span class="hf-tag hf-tag--obs">Observed</span> measured records. Not on this page: each city page’s “Heat over time” has station records.</p><p><span class="hf-tag hf-tag--proj">Projected</span> outputs of named climate models under named scenarios.</p><p><span class="hf-tag hf-tag--ill">Illustrative</span> conditional examples from assumptions you can see and change.</p></div>
    <p class="hf-restored" data-hf-restored hidden role="status"></p>

    <section class="hf-panel" id="climate" aria-labelledby="hf-cl-h">
      <h2 class="hub-h" id="hf-cl-h">What could a hot season feel like here by mid-century?</h2>
      <p class="hub-p"><span class="hf-tag hf-tag--proj">Projected</span> Choose a city, a measure, an emissions path and a period. These settings change only the climate panel.</p>
      <form class="hf-form" data-hf-climate onsubmit="return false">
        ${radios("city", CITIES.map(c => [c, D.cities[c].name]), sel.city, "City (one grid cell near the centre)")}
        ${radios("ind", F.ENUM.ind.map(i => [i, F.IND[i].name, F.IND[i].unit]), sel.ind, "Measure")}
        ${radios("sc", F.ENUM.sc.map(s => [s, F.SCN[s].name, F.SCN[s].tech]), sel.sc, "Emissions path")}
        ${radios("per", F.ENUM.per.map(p => [p, F.PER[p].split(":")[0], F.PER[p].split(": ")[1]]), sel.per, "Period")}
      </form>
      <figure class="hf-fig"><div data-hf-chart>${F.climateSvg(D, sel.city, sel.ind, sel.sc, sel.per)}</div>
        <figcaption><span class="hf-tag hf-tag--proj">Projected</span> <span data-hf-def>${esc(F.IND[sel.ind].def)}. ${esc(F.IND[sel.ind].kind)}.</span> Geography: <span data-hf-geo>${geo(sel.city)}</span>. Source: World Bank CCKP, CMIP6 0.25° multi-model ensemble.</figcaption></figure>
      <h3 class="hf-h3">What changes in this view?</h3>
      <div class="hf-say" data-hf-say>${F.interpret(D, sel.city, sel.ind, sel.sc, sel.per).map(s => `<p>${esc(s)}</p>`).join("")}</div>
      <details class="hf-det"><summary>All projected values as a table</summary>${table}</details>
    </section>

    <section class="hf-panel hf-panel--ill" id="protection" aria-labelledby="hf-pr-h">
      <h2 class="hub-h" id="hf-pr-h">Who is protected? A separate, illustrative panel</h2>
      <p class="hub-p"><span class="hf-tag hf-tag--ill">Illustrative</span> Three editorial pathways for one protection programme, such as cooling spaces with check-ins or paid heat breaks, reaching one group you have in mind, such as outdoor workers in a city. They are not predictions of any government’s performance, and changing them does not change the climate panel.</p>
      <form class="hf-form" data-hf-prot onsubmit="return false">
        ${radios("path", pathways, sel.path, "Pathway")}
        <div class="hf-ctls">
          ${slider("start", "Year the programme starts", "", "When funding and a decision are in place.")}
          ${slider("lead", "Lead time before anyone is reached", " years", "Hiring, building, procurement.")}
          ${slider("pace", "Pace of expansion", " points a year", "Percentage points of the group newly reached each year.")}
          ${slider("ceil", "Most of the group it can reach", "%", "Design limits: places it covers, who is eligible.")}
          ${slider("rel", "Reliability in hot periods", "%", "Share of hot periods when it actually works: power, staff, supplies.")}
          ${slider("use", "Ability to use it", "%", "Share of those reached who can use it: cost, distance, pay lost, access.")}
        </div>
      </form>
      <figure class="hf-fig"><div data-hf-pchart>${F.protectionSvg(P0, null)}</div><figcaption><span class="hf-tag hf-tag--ill">Illustrative</span> Coverage of the defined group (100% = everyone in it, each person counted once). The band is an assumption range (reliability and ability to use 15 points lower or higher), not a probability.</figcaption></figure>
      <div class="hf-nums" data-hf-nums>
        <div><span>Usable protection by 2035</span><b data-n="u35">${Math.round(F.usable(P0, 2035))}%</b></div>
        <div><span>Usable protection by 2050</span><b data-n="u50">${Math.round(F.usable(P0, 2050))}%</b></div>
        <div><span>Years without usable protection, 2026–2050</span><b data-n="gap">${F.gapYears(P0).toFixed(1)} of 25</b></div>
      </div>
      <p class="hf-meta"><b>The formula:</b> nominal reach in year <i>y</i> = the smaller of the ceiling and pace × (<i>y</i> − start − lead + 1), and zero before start + lead. Usable protection = nominal reach × reliability × ability to use. Years without usable protection = the sum, over 2026 to 2050, of (1 − usable share): the average, per person in the group, of years without it. One programme and one group, so nobody is counted twice. Coverage only: not illness, deaths or costs.</p>
      <h3 class="hf-h3">What changes if implementation starts later?</h3>
      <div class="hf-ctl hf-ctl--later"><label for="hf-later">Compare with a later start <output data-o="later">2035</output></label><input type="range" id="hf-later" min="2026" max="2045" step="1" value="2035"></div>
      <div class="hf-say" data-hf-delay><p>Starting in 2035 instead of ${P0.start}, with the same lead time, pace, ceiling, reliability and usability, the defined group would spend about ${d0.extraGapYears.toFixed(1)} more years each, on average, without usable protection by 2050 (a coverage gap, not a measure of exposure, illness or deaths). Nominal reach by 2050: ${Math.round(d0.reach2050.earlier)}% with the earlier start, ${Math.round(d0.reach2050.later)}% with the later one.${d0.paceNeeded ? ` To reach ${Math.round(d0.reach2050.earlier)}% by 2050 anyway, the later programme would need to add about ${d0.paceNeeded.toFixed(1)} points a year instead of ${P0.pace}: more delivery capacity, not a catch-up that happens by itself.` : ""}</p></div>
      <details class="hf-det"><summary>The protection values year by year</summary><div data-hf-ptable></div></details>
    </section>

    <div class="hf-tools" data-hf-tools hidden><button type="button" class="hf-btn" data-hf-link>Copy link to this view</button><button type="button" class="hf-btn" data-hf-png>Download comparison image</button><button type="button" class="hf-btn" data-hf-print>Print this view</button></div>
    <div class="hf-printhead" aria-hidden="true"><p><b>Common Shade · Heat futures</b> · beattheheat.asia/heat-futures/</p><p data-hf-printsel></p><p>Climate panel: PROJECTED (World Bank CCKP, CMIP6 0.25° ensemble, grid cell near the city). Protection panel: ILLUSTRATIVE (editorial assumptions, not predictions). Neither panel changes the other.</p></div>

    <section class="hf-sec" id="daily-life" aria-labelledby="hf-dl-h">
      <h2 class="hub-h" id="hf-dl-h">What could these conditions mean for daily life?</h2>
      <p class="hub-p"><span class="hf-tag hf-tag--ill">Illustrative</span> Situations, not interviews. Gender, age, disability, migration status, tenure and informal work interact; no group shares one level of risk.</p>
      <div class="hf-people">${people}</div>
    </section>

    <section class="hf-sec" id="connected" aria-labelledby="hf-cn-h">
      <h2 class="hub-h" id="hf-cn-h">Connected consequences</h2>
      <p class="hub-p">Explanatory pathways from the systems map, each with its evidence. They are not calculated by this dashboard.</p>
      <ul class="hf-loops">${loops}</ul>
    </section>

    <section class="hf-sec" id="action" aria-labelledby="hf-ac-h">
      <h2 class="hub-h" id="hf-ac-h">What can change this trajectory?</h2>
      <p class="hub-p">Adaptation can reduce consequences but does not remove every risk, and local protection does not replace cutting emissions. Each action links to its examples, sources and side effects.</p>
      <div class="hf-acts">${act}</div>
    </section>

    <section class="hf-sec" id="uncertainty" aria-labelledby="hf-un-h">
      <h2 class="hub-h" id="hf-un-h">What remains uncertain</h2>
      <div class="hf-unc">
        <article class="cs-card"><h3 class="hf-h3">Climate uncertainty</h3><p>Models differ, natural variability can make a decade hotter or cooler than its trend, and the emissions path matters more the further ahead you look. The whiskers show the spread across models; a 20-year average is not a forecast for any single year.</p></article>
        <article class="cs-card"><h3 class="hf-h3">Impact uncertainty</h3><p>Outdoor air over a 28 km cell is not the heat inside a home, a factory or a market, and it is not a person’s exposure, health or income. This page estimates none of those.</p></article>
        <article class="cs-card"><h3 class="hf-h3">Implementation uncertainty</h3><p>Whether a programme is funded, built, staffed, maintained and usable is decided by people and institutions. The protection panel makes those assumptions visible; its band is an assumption range, not a probability.</p></article>
      </div>
    </section>

    <section class="hf-sec" id="method" aria-labelledby="hf-me-h">
      <h2 class="hub-h" id="hf-me-h">Sources and method</h2>
      ${register}
      <details class="hf-det"><summary>Why there is no humid-heat projection here</summary><p>A humid-heat measure needs temperature and humidity from the same day. Combining separately averaged or separately maximised values would invent extremes, so this dashboard uses only measures computed by the data provider from daily values. For how heat and humidity combine, see <a href="/wet-bulb-wall/">The wet-bulb wall</a>.</p></details>
      <details class="hf-det"><summary>Maintenance</summary><p>To refresh the climate values, run <code>research/2026-11/heat-futures/extract.py</code> (needs the netCDF4 Python package, a one-off step), rebuild, and run <code>node tools/check-heat-futures.js</code>. The protection pathways are editorial and live in <code>heat-futures/futures-core.js</code>.</p></details>
      <p class="hf-meta">See also: <a href="/heat-tools/cckp/">The World Bank Climate Change Knowledge Portal in the Heat Tool Finder</a> · <a href="/cities/">City pages, with station records in “Heat over time”</a> · <a href="/wet-bulb-wall/">The wet-bulb wall</a>.</p>
    </section>
  </div>
  <script>window.HF=${JSON.stringify(D.cities).replace(/</g, "\\u003c")};</script>`;
  write(SLUG, page(SLUG, "Heat futures: 2035–2050", "Projected hot days, hot nights and hottest days around 2030 and 2050 near six Asian cities under three emissions paths, beside an illustrative panel on how the timing and reach of protection change who is covered.", body,
    `\n  <link rel="stylesheet" href="/heat-futures/hf.css?v=${V}"><script src="/heat-futures/futures-core.js?v=${V}" defer></script><script src="/heat-futures/hf.js?v=${V}" defer></script>`));
  console.log(`heat futures: ${CITIES.length} cities, ${F.ENUM.ind.length} indicators, ${F.ENUM.sc.length} scenarios, 2 periods; sources ${["cckp", "ipcc-spm"].map(k => k + (ok(k) ? " ok" : " pending")).join(", ")}`);
};
