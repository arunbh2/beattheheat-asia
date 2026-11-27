// Common Shade: /wet-bulb-wall/, "The wet-bulb wall". How heat and humidity together limit the body's ability to cool,
// on a temperature-humidity chart shaded by calculated wet-bulb temperature, with a draggable hypothetical scenario,
// six cities' latest available (modelled) weather, guided explorations, and what changes exposure and protection.
// The chart, contours, method and evidence are rendered here, so they read without JavaScript; wet-bulb-wall/wbw.js
// adds the markers and controls. Calculation: wet-bulb-wall/wetbulb-core.js. Weather: wet-bulb-wall/weather-adapter.js.
// Evidence: data/inbox/2026-11-heat-interactives (a study reaches the page only when its source check passed);
// research/2026-11/wet-bulb-wall/NOTE.md. Called by build-pages.js; tools/check-wet-bulb.js checks it.
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), SLUG = "wet-bulb-wall";
const W = require("../wet-bulb-wall/wetbulb-core.js"), HS = require("./heat-interactives-sources.js");

// the chart: air temperature 10 to 50 C across, relative humidity 0 to 100% up; one pressure, 1013.25 hPa
const G = { w: 640, h: 430, x0: 52, x1: 624, y0: 14, y1: 378, tmin: 10, tmax: 50, rhmin: 0, rhmax: 100 };
const X = t => G.x0 + (t - G.tmin) / (G.tmax - G.tmin) * (G.x1 - G.x0), Y = rh => G.y1 - (rh - G.rhmin) / (G.rhmax - G.rhmin) * (G.y1 - G.y0);
const LEVELS = [12, 16, 20, 24, 26, 28, 30, 32, 34];
const FILL = ["#F7F0E6", "#F2E2CC", "#EED0AE", "#E9BC8E", "#E3A271", "#DA8656", "#C9693F", "#B04F2E", "#8E3A22", "#6A2A19"];
const f1 = x => (Math.round(x * 10) / 10).toFixed(1);
function contour(tw) {   // points (T, RH) where the wet-bulb temperature equals tw, from saturation down to the right edge
  const pts = [];
  for (let t = Math.max(tw, G.tmin); t <= G.tmax + 1e-9; t += 0.25) {
    const rh = W.rhFor(t, tw); if (rh == null) { if (W.wetBulb(t, 1) > tw) { pts.push([t, 1]); break; } continue; }
    pts.push([t, rh]);
  }
  return pts;
}
function bandPath(tw) {   // the region at or above tw: contour, then up the right edge and back along the top
  const c = contour(tw); if (!c.length) return "";
  const last = c[c.length - 1];
  const pts = c.map(([t, rh]) => [X(t), Y(rh)]);
  if (last[1] <= 1.0001 && last[0] < G.tmax) pts.push([X(G.tmax), Y(1)]);
  pts.push([X(G.tmax), Y(100)], [X(Math.max(tw, G.tmin)), Y(100)]);
  return "M" + pts.map(p => p[0].toFixed(1) + " " + p[1].toFixed(1)).join("L") + "Z";
}
const linePath = pts => "M" + pts.map(([t, rh]) => X(t).toFixed(1) + " " + Y(rh).toFixed(1)).join("L");

// Wolf et al. 2023, Table 3 (CC BY 4.0): critical environmental limits, mean dry-bulb temperature and relative humidity
// above which heat balance could not be maintained, in an environmental chamber. Transcribed from the published table.
const WOLF = [
  { id: "young-minact", label: "Young adults (23 ± 4 years), minimal activity", short: "Young, minimal activity", ly: 20, n: 51, dash: "", mark: "circle",
    pts: [[34, 79.7], [36, 66.5], [38, 59.5], [40, 51.0], [46.4, 20.7], [49.3, 13.8]] },
  { id: "older-minact", label: "Older adults (71 ± 6 years), minimal activity", short: "Older, minimal activity", ly: 4, n: 49, dash: "7 5", mark: "square",
    pts: [[33.9, 62.1], [36.2, 53.5], [38.0, 46.1], [40.2, 34.0], [40.3, 28.6], [42.9, 18.8]] },
  { id: "older-rest", label: "Older adults (71 ± 6 years), seated rest", short: "Older, at rest", ly: -16, n: 49, dash: "2 4", mark: "triangle",
    pts: [[34, 66.5], [36, 59.1], [38, 53.4], [40, 38.8], [44.1, 24.0], [46.1, 15.6]] }
];

module.exports = function wetBulbWall({ page, write, esc, hero, V }) {
  const ok = k => HS.passed(k), S = k => HS.src(k);
  const ext = (u, t) => `<a href="${esc(u)}" target="_blank" rel="noopener">${t}<span class="visually-hidden"> (opens in a new tab)</span></a>`;
  const cite = k => { const s = S(k); return s ? ext(s.url, `${esc(s.publisher.split(";")[0])}, ${s.year}`) : ""; };
  const wolfOk = ok("wolf2023"), sherOk = ok("sherwood2010");
  const cities = ["mumbai", "delhi", "dhaka", "jakarta", "bangkok", "manila"].map(id => HS.data().LIVE_CITIES.find(c => c.id === id)).filter(Boolean).map(c => ({ id: c.id, name: c.name, country: c.country, lat: c.lat, lon: c.lon }));

  // the static chart (markers and the scenario are added by wbw.js)
  const bands = LEVELS.map((tw, i) => `<path d="${bandPath(tw)}" fill="${FILL[i + 1]}"/>`).join("");
  const lines = LEVELS.map((tw, i) => `<path class="wbw-c" d="${linePath(contour(tw))}"/><text class="wbw-cl" x="${X(tw).toFixed(1)}" y="${(G.y0 + (i % 2 ? 36 : 16)).toFixed(1)}" text-anchor="middle">${tw}°</text>`).join("");
  const c35 = `<g class="wbw-ov" data-ov="sherwood" hidden><path class="wbw-ov35" d="${linePath(contour(35))}"/><text class="wbw-ovl" x="${(X(47)).toFixed(1)}" y="${(Y(W.rhFor(47, 35)) + 22).toFixed(1)}" text-anchor="middle">35° (theory)</text></g>`;
  const markShape = (m, x, y) => m === "square" ? `<rect x="${(x - 4).toFixed(1)}" y="${(y - 4).toFixed(1)}" width="8" height="8"/>` : m === "triangle" ? `<path d="M${x.toFixed(1)} ${(y - 5).toFixed(1)}L${(x + 5).toFixed(1)} ${(y + 4).toFixed(1)}L${(x - 5).toFixed(1)} ${(y + 4).toFixed(1)}Z"/>` : `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5"/>`;
  const wolfSvg = wolfOk ? WOLF.map(s => `<g class="wbw-ov wbw-ov--wolf" data-ov="${s.id}" hidden><path d="${linePath(s.pts)}"${s.dash ? ` stroke-dasharray="${s.dash}"` : ""}/>${s.pts.map(([t, rh]) => markShape(s.mark, X(t), Y(rh))).join("")}<text class="wbw-ovl" x="${(X(s.pts[s.pts.length - 1][0]) - 8).toFixed(1)}" y="${(Y(s.pts[s.pts.length - 1][1]) + s.ly).toFixed(1)}" text-anchor="end">${esc(s.short)}</text></g>`).join("") : "";
  const ticksX = [10, 15, 20, 25, 30, 35, 40, 45, 50].map(t => `<line x1="${X(t)}" x2="${X(t)}" y1="${G.y1}" y2="${G.y1 + 5}"/><text x="${X(t)}" y="${G.y1 + 18}" text-anchor="middle" class="wbw-tx" data-c="${t}">${t}°</text>`).join("");
  const ticksY = [0, 20, 40, 60, 80, 100].map(r => `<line x1="${G.x0 - 5}" x2="${G.x0}" y1="${Y(r)}" y2="${Y(r)}"/><text x="${G.x0 - 8}" y="${Y(r) + 4}" text-anchor="end">${r}%</text>`).join("");
  const svg = `<svg class="wbw-svg" viewBox="0 0 ${G.w} ${G.h}" role="img" aria-labelledby="wbw-svg-t wbw-svg-d" data-g='${JSON.stringify(G)}'>
    <title id="wbw-svg-t">Air temperature and relative humidity, shaded by calculated wet-bulb temperature</title>
    <desc id="wbw-svg-d">Air temperature from 10 to 50 °C runs across, relative humidity from 0 to 100% runs up. Bands mark wet-bulb temperatures of ${LEVELS.join(", ")} °C; each band runs from the top edge, where air is saturated and wet-bulb equals air temperature, down to the right, so the same wet-bulb temperature is reached at a lower humidity as the air gets hotter. A table below gives the same contours as numbers.</desc>
    <defs><clipPath id="wbw-clip"><rect x="${G.x0}" y="${G.y0}" width="${G.x1 - G.x0}" height="${G.y1 - G.y0}"/></clipPath><pattern id="wbw-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#16202B" stroke-width="1" stroke-opacity=".18"/></pattern></defs>
    <g clip-path="url(#wbw-clip)"><rect x="${G.x0}" y="${G.y0}" width="${G.x1 - G.x0}" height="${G.y1 - G.y0}" fill="${FILL[0]}"/>${bands}<path d="${bandPath(30)}" fill="url(#wbw-hatch)"/>${lines}${c35}${wolfSvg}<g class="wbw-cities" aria-hidden="true"></g><g class="wbw-you" aria-hidden="true"></g></g>
    <rect class="wbw-frame" x="${G.x0}" y="${G.y0}" width="${G.x1 - G.x0}" height="${G.y1 - G.y0}"/>
    <g class="wbw-ax">${ticksX}${ticksY}</g>
    <text class="wbw-axl" x="${(G.x0 + G.x1) / 2}" y="${G.h - 6}" text-anchor="middle"><tspan data-unit-label>Air temperature, °C</tspan></text>
    <text class="wbw-axl" transform="translate(13 ${(G.y0 + G.y1) / 2}) rotate(-90)" text-anchor="middle">Relative humidity, %</text>
  </svg>`;
  const legend = `<div class="wbw-legend" aria-hidden="true"><span class="wbw-legend__k">Calculated wet-bulb temperature</span><span class="wbw-legend__bar">${FILL.map((c, i) => `<i style="background:${c}"><b>${i === 0 ? `&lt;${LEVELS[0]}` : i === FILL.length - 1 ? `${LEVELS[i - 1]}+` : LEVELS[i - 1]}</b></i>`).join("")}</span><span class="wbw-legend__n">°C. Hatching marks 30 °C and above. Colour shows a calculated quantity, not a level of danger.</span></div>`;

  // contour table: relative humidity at which each wet-bulb temperature is reached
  const TT = [25, 30, 35, 40, 45, 50];
  const ctable = `<table class="wbw-table"><caption>Relative humidity at which the air reaches each wet-bulb temperature (at 1013.25 hPa)</caption><thead><tr><th scope="col">Wet-bulb</th>${TT.map(t => `<th scope="col">${t} °C air</th>`).join("")}</tr></thead><tbody>${[20, 24, 26, 28, 30, 32, 34, 35].map(tw => `<tr><th scope="row">${tw} °C</th>${TT.map(t => { const r = W.rhFor(t, tw); return `<td>${r == null ? (tw > t ? "not possible" : "below 1%") : Math.round(r) + "%"}</td>`; }).join("")}</tr>`).join("")}</tbody></table>`;
  const wolfTable = wolfOk ? `<table class="wbw-table"><caption>Critical environmental limits measured by Wolf and colleagues (2023), mean values from their Table 3, with the wet-bulb temperature calculated here</caption><thead><tr><th scope="col">Group and activity</th><th scope="col">Air temperature</th><th scope="col">Relative humidity</th><th scope="col">Calculated wet-bulb</th></tr></thead><tbody>${WOLF.flatMap(s => s.pts.map(([t, rh], i) => `<tr>${i === 0 ? `<th scope="row" rowspan="${s.pts.length}">${esc(s.label)}</th>` : ""}<td>${t} °C</td><td>${rh}%</td><td>${f1(W.wetBulb(t, rh))} °C</td></tr>`)).join("")}</tbody></table>` : "";

  // evidence cards, each shown only when its source passed the check
  const study = (k, h, rows) => ok(k) ? `<article class="wbw-study"><h4>${h}</h4><dl>${rows.map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join("")}</dl><p class="wbw-meta">${ext(S(k).url, esc(S(k).title))} · ${esc(S(k).publisher)}, ${S(k).year}</p></article>` : `<article class="wbw-study"><h4>${h}</h4><p class="wbw-meta">This study’s details are held back until its source check passes.</p></article>`;
  const studies = [
    study("sherwood2010", "Sherwood and Huber, 2010: a theoretical limit", [["What it is", "A modelling and theory paper. It argues that wet-bulb temperatures above 35 °C sustained for extended periods would make it impossible for the body to shed metabolic heat."], ["Measured or modelled", "Modelled and reasoned from physics; not tested on people."], ["What it supports here", "Why 35 °C wet-bulb became a widely cited upper reference. Not a threshold that conditions below it are safe."]]),
    study("vecellio2022", "Vecellio and colleagues, 2022: testing the 35 °C idea", [["Who and what", ok("vecellio2022-full") ? "24 young, healthy adults (11 men, 13 women) in an environmental chamber, light clothing, very low effort (about 10 watts of pedalling), with core temperature tracked as humidity or temperature was raised step by step." : "Young, healthy adults at modest metabolic rates in an environmental chamber, with core temperature tracked as conditions were raised step by step."], ["Endpoint", "The point at which core temperature began to rise steadily: heat balance could no longer be maintained. Not illness, and not survival."], ["Finding", "In humid conditions the critical wet-bulb temperature averaged 30.55 ± 0.98 °C; in hotter, drier conditions it was lower still. No one reached 35 °C."], ["What it supports here", "That a single wet-bulb number cannot describe the limit across climates. Its participants were young and healthy, so the values do not describe older people or people working hard."]]),
    study("wolf2023", "Wolf and colleagues, 2023: older adults", [["Who and what", "51 young (23 ± 4 years) and 49 older (71 ± 6 years) adults in an environmental chamber, at seated rest or minimal activity, with the same rising-heat protocol."], ["Endpoint", "The combination of temperature and humidity above which heat balance could not be maintained."], ["Finding", "Limits were lower for older than for young adults during minimal activity, and lower during minimal activity than at rest."], ["Conditions", wolfOk && ok("wolf2023-full") ? "An indoor chamber with no source of radiant heat and little air movement; participants from central Pennsylvania. Outdoors, sun and wind change the picture." : "An indoor chamber with controlled conditions."], ["What it supports here", "The optional overlays on the chart: the measured mean limits, drawn only across the conditions tested."]]),
    study("wang2026", "Wang and colleagues, 2026: longer exposure", [["Who and what", "36 unacclimatised healthy young adults, seated light office work, unrestricted drinking water, held at wet-bulb temperatures of 32, 33, 34 and 35 °C for up to 8 hours."], ["Finding", "32 to 33 °C was compensable for these participants; 34 to 35 °C was not. At the same wet-bulb temperature, different temperature and humidity mixes gave similar core temperature responses in shade."], ["Why protocols matter", "Stepwise rising heat (Vecellio, Wolf) and long steady exposure (Wang) answer different questions. The newer study does not cancel the earlier ones; together they show how much the limit depends on who, how long and how hard."], ["What it does not support here", "Its projected tolerance times are for its participants and conditions; this page does not turn temperature and humidity into survival times."]])
  ].join("");

  // what changes exposure and protection: the site's own checked actions
  const groups = [
    ["Environment", "Shade, less radiant heat and cooler indoor space change the conditions themselves.", ["coolbydesign", "greencity", "coolhousing"]],
    ["Work arrangements", "Paid rest, changed hours and lighter loads change how much heat the body makes and for how long.", ["heatrules"]],
    ["Services", "Cooling spaces, water and reliable power only help when people can reach and use them.", ["coolingcentres", "affordablecool", "readyclinics"]],
    ["Institutions", "Income protection, employer duties and local heat plans decide whether stopping is possible.", ["heatcash", "socialprotection", "hap"]]
  ];
  const leverCard = l => `<li><a href="/actions/#${esc(l.id)}"><b>${esc(l.title)}</b></a><span>${esc(l.text)}</span>${(l.watch || [])[0] ? `<span class="wbw-watch"><b>Watch for:</b> ${esc((l.watch[0].text || l.watch[0].risk || "").replace(/\s+$/, ""))}</span>` : ""}</li>`;
  const actions = groups.map(([h, p, ids]) => `<div class="cs-card wbw-act"><h3 class="wbw-h3">${h}</h3><p>${p}</p><ul>${HS.levers(ids).map(leverCard).join("")}</ul></div>`).join("");
  const pathways = HS.loops(["poverty", "sleep", "protection"]).map(l => `<li><a href="/loops/#${esc(l.id)}"><b>${esc(l.name)}</b></a> <span class="wbw-ev">${esc(l.evidence)} evidence</span><span>${esc(l.summary)}</span></li>`).join("");

  const people = [
    ["A street vendor whose earnings depend on staying outside", "The air around the stall.", "Sun on the street, heat off the road, the effort of moving stock, and how many hours there are no customers in shade.", "Whether a day off or a shaded pitch costs a day’s income, and whether water and a toilet are nearby.", "Municipal markets and street-vending rules, social protection and heat-linked income support, local heat plans.", "/live-through-a-heatwave/", "Live through a heatwave"],
    ["A garment worker facing indoor heat and production targets", "Neither, directly: a weather reading describes outdoor air, not the factory floor.", "Machine and roof heat, airflow, the pace set by targets, clothing and the length of the shift.", "Whether breaks are paid, whether targets change on hot days, and whether raising a concern is safe.", "Employers and buyers, labour inspectors, worker organisations, building standards.", "/factory-heat/", "Heat inside factories"],
    ["An older person in a home that stays hot overnight", "The outdoor air, not the room.", "Roof material, ventilation, indoor heat that builds through the day, medicines and health conditions, and whether nights give any relief.", "Whether cooling is affordable and the power stays on, and whether someone checks in.", "Housing and building rules, electricity providers, health and social services, neighbourhood check-in schemes.", "/who-is-at-risk/", "Who heat hits hardest"],
    ["A caregiver balancing paid work, care and travel", "The weather on the way, not the load carried.", "Time spent travelling in heat, waiting, carrying, caring for someone else at night, and little time to rest.", "Whether work hours flex, whether care services stay open in heat, and whether transport is shaded and reliable.", "Employers, care and health services, transport agencies, social protection.", "/social-protection/", "Who could help a household through a hot season"]
  ].map(([h, cap, miss, use, who, u, ut]) => `<article class="cs-card wbw-person"><h3 class="wbw-h3">${h}</h3><dl><div><dt>What temperature and humidity capture</dt><dd>${cap}</dd></div><div><dt>What they miss</dt><dd>${miss}</dd></div><div><dt>What decides whether protection is usable</dt><dd>${use}</dd></div><div><dt>Who can change it</dt><dd>${who}</dd></div></dl><p><a href="${u}">${ut} <span aria-hidden="true">→</span></a></p></article>`).join("");

  const cfg = { cities, wolf: wolfOk ? WOLF.map(s => ({ id: s.id, label: s.label })) : [], sherwood: sherOk, levels: LEVELS };
  const body = `${hero("Heat and the body", "The wet-bulb wall", "Move the controls to explore how hot air and moisture combine. As humidity rises, evaporation becomes less effective at cooling the body.")}
  <div class="container wbw">
    <p class="cs-note cs-note--limit wbw-limit"><span class="cs-note__label">What this is</span>This explores environmental conditions. It does not predict an individual’s survival or establish safe working conditions.</p>
    <p class="wbw-restored" data-wbw-restored hidden role="status"></p>
    <section class="wbw-tool" aria-labelledby="wbw-tool-h">
      <h2 class="visually-hidden" id="wbw-tool-h">Explore temperature and humidity</h2>
      <div class="wbw-readout" aria-live="off">
        <div><span>Air temperature</span><b data-out="t">35.0 °C</b></div>
        <div><span>Relative humidity</span><b data-out="rh">50%</b></div>
        <div class="wbw-readout__tw"><span>Calculated wet-bulb temperature</span><b data-out="tw">${f1(W.wetBulb(35, 50))} °C</b></div>
      </div>
      <p class="wbw-say" data-wbw-say>At 35.0 °C and 50% relative humidity, the calculated wet-bulb temperature is ${f1(W.wetBulb(35, 50))} °C. This is a hypothetical scenario.</p>
      <p class="visually-hidden" role="status" aria-live="polite" data-wbw-live></p>
      <div class="wbw-chart">${svg}${legend}</div>
      <div class="wbw-controls" data-wbw-controls hidden>
        <div class="wbw-ctl"><label for="wbw-t">Air temperature <span data-unit>°C</span></label><input type="range" id="wbw-t" min="10" max="50" step="0.5" value="35"><input type="number" id="wbw-tn" min="10" max="50" step="0.1" value="35" aria-label="Air temperature, exact value"></div>
        <div class="wbw-ctl"><label for="wbw-rh">Relative humidity %</label><input type="range" id="wbw-rh" min="1" max="100" step="1" value="50"><input type="number" id="wbw-rhn" min="1" max="100" step="1" value="50" aria-label="Relative humidity, exact value"></div>
        <div class="wbw-row"><button type="button" class="wbw-btn" data-wbw-reset>Reset</button><button type="button" class="wbw-btn" data-wbw-plus2>Add 2 °C (holding humidity)</button><button type="button" class="wbw-btn" data-wbw-unit aria-pressed="false">Show °F</button><button type="button" class="wbw-btn" data-wbw-link>Copy link to this scenario</button></div>
        <p class="wbw-meta" data-wbw-plus2-note hidden>Hypothetical sensitivity experiment: 2 °C added to the air with relative humidity held where it was. Not a local climate projection; in real warming, humidity does not necessarily stay the same.</p>
        <fieldset class="wbw-ovs"${wolfOk || sherOk ? "" : " hidden"}><legend>Research reference overlays (off by default)</legend>
          ${wolfOk ? WOLF.map(s => `<label><input type="checkbox" data-ov-toggle="${s.id}"><svg class="wbw-sw" viewBox="0 0 34 12" aria-hidden="true"><path d="M2 6H32"${s.dash ? ` stroke-dasharray="${s.dash}"` : ""}/>${markShape(s.mark, 17, 6)}</svg> ${esc(s.label)}: measured limit, Wolf et al. 2023</label>`).join("") : ""}
          ${sherOk ? `<label><input type="checkbox" data-ov-toggle="sherwood"><svg class="wbw-sw" viewBox="0 0 34 12" aria-hidden="true"><path d="M2 6H32" stroke-dasharray="10 6" stroke-width="3"/></svg> 35 °C wet-bulb: theoretical upper limit for extended periods, Sherwood and Huber 2010 (modelled)</label>` : ""}
          <p class="wbw-meta">Overlays are research references drawn only across the conditions each study tested, in a chamber with no radiant heat. They are not safety lines: conditions below them are not safe for everyone.</p>
        </fieldset>
        <p class="wbw-meta">You can also drag the “Your scenario” marker, or focus it and use the arrow keys (left and right change temperature by 0.5 °C, up and down change humidity by 1%).</p>
      </div>
      <noscript><p class="wbw-meta">The controls need JavaScript. The chart, the tables below and the method all read without it.</p></noscript>
    </section>

    <section class="wbw-sec" id="cities" aria-labelledby="wbw-cities-h">
      <h2 class="hub-h" id="wbw-cities-h">Six cities: latest available weather</h2>
      <p class="hub-p">Current modelled weather from Open-Meteo for one point in each city, requested when you open this page. Each city keeps its own local time. A model grid point does not describe every neighbourhood, home or workplace, and the weather outside is not the heat inside.</p>
      <div class="wbw-citylist" data-wbw-cities><p class="wbw-meta">Loading the latest available weather… (needs JavaScript; the simulator works without it)</p></div>
      <div class="wbw-city" data-wbw-city hidden></div>
    </section>

    <section class="wbw-sec" id="explore" aria-labelledby="wbw-ex-h">
      <h2 class="hub-h" id="wbw-ex-h">Three guided explorations</h2>
      <div class="wbw-guides">
        <article class="cs-card"><h3 class="wbw-h3">A. What changes when the air becomes more humid?</h3><p>Hold the air at 35 °C and raise the humidity. At 30% relative humidity the calculated wet-bulb temperature is ${f1(W.wetBulb(35, 30))} °C; at 50% it is ${f1(W.wetBulb(35, 50))} °C; at 70%, ${f1(W.wetBulb(35, 70))} °C; at 90%, ${f1(W.wetBulb(35, 90))} °C. The air is no hotter, but sweat evaporates less readily, so the body loses its main way of shedding heat.</p><button type="button" class="wbw-btn" data-wbw-guide="a" hidden>Start at 35 °C, 30%</button></article>
        <article class="cs-card"><h3 class="wbw-h3">B. Different combinations, similar wet-bulb temperature</h3><p>Hypothetical: 45 °C at 20% gives ${f1(W.wetBulb(45, 20))} °C wet-bulb; 32 °C at 58% gives ${f1(W.wetBulb(32, 58))} °C. Similar numbers, different strain: in the hot, dry air the body also gains heat directly from the air and skin is hotter, which is why chamber studies found lower limits in hot, dry conditions than in humid ones.</p><div class="wbw-row"><button type="button" class="wbw-btn" data-wbw-guide="b1" hidden>Hot and dry (hypothetical)</button><button type="button" class="wbw-btn" data-wbw-guide="b2" hidden>Warm and humid (hypothetical)</button></div></article>
        <article class="cs-card"><h3 class="wbw-h3">C. Explore from a city</h3><p>Choose a city above, then “Explore from these conditions”. Its values are copied into a separate hypothetical scenario; the city’s own marker stays where the data put it.</p></article>
      </div>
    </section>

    <section class="wbw-sec" id="people" aria-labelledby="wbw-people-h">
      <h2 class="hub-h" id="wbw-people-h">Same weather. Different ability to escape it.</h2>
      <p class="hub-p">Illustrative situations, not real people. Temperature and humidity describe the air; whether someone can rest, cool down or stop work depends on much more. No group shares one biological limit, and nothing here assigns one.</p>
      <div class="wbw-people">${people}</div>
      <h3 class="wbw-h3">Explanatory pathways from the systems map</h3>
      <p class="hub-p">How heat can carry into income and recovery. These come from the map’s cycles and their evidence, not from this simulator.</p>
      <ul class="wbw-paths">${pathways}</ul>
    </section>

    <section class="wbw-sec" id="protection" aria-labelledby="wbw-prot-h">
      <h2 class="hub-h" id="wbw-prot-h">What changes exposure and protection?</h2>
      <p class="hub-p">Some changes alter the conditions; others decide whether people can use them. None is a switch that subtracts wet-bulb degrees, drinking water does not cancel dangerous heat, and fans do not help in every condition. Each action below links to its evidence and what to watch for.</p>
      <div class="wbw-acts">${actions}</div>
    </section>

    <section class="wbw-sec" id="evidence" aria-labelledby="wbw-ev-h">
      <h2 class="hub-h" id="wbw-ev-h">Evidence and method</h2>
      <details class="wbw-det" open><summary>Words that are not interchangeable</summary><dl class="wbw-terms">
        <div><dt>Air temperature</dt><dd>What a shaded thermometer reads (the “dry-bulb” temperature).</dd></div>
        <div><dt>Relative humidity</dt><dd>How much water vapour the air holds, as a share of the most it could hold at that temperature.</dd></div>
        <div><dt>Wet-bulb temperature</dt><dd>The temperature air would cool to by evaporating water into it. It combines temperature and humidity, and equals air temperature when the air is saturated. This page calculates it; it ignores sun and wind.</dd></div>
        <div><dt>Wet-bulb globe temperature (WBGT)</dt><dd>A workplace heat index that adds sun (radiant heat) and wind. It cannot be calculated from temperature and humidity alone, so this page does not show it. <a href="/glossary/#wbgt">Glossary: WBGT</a>.</dd></div>
        <div><dt>Heat index</dt><dd>An estimate of how hot it feels from temperature and humidity, used by some weather services; a different scale again.</dd></div>
        <div><dt>Loss of heat balance</dt><dd>When the body gains heat faster than it can lose it and core temperature keeps rising. What the chamber studies measured.</dd></div>
        <div><dt>Heat illness and survival</dt><dd>Outcomes that depend on the person, their health, effort, clothing, exposure time and care. Not calculated here.</dd></div>
      </dl></details>
      <h3 class="wbw-h3">What the studies measured</h3>
      <div class="wbw-studies">${studies}</div>
      ${wolfTable}
      <details class="wbw-det"><summary>How the wet-bulb temperature is calculated</summary>
        <p>Psychrometric (thermodynamic) wet-bulb temperature, from the equations in the ASHRAE Handbook, Fundamentals, chapter 1, ${ok("psychrolib") ? `as implemented in PsychroLib (${cite("psychrolib")})` : "the same equations PsychroLib implements"}: saturation vapour pressure over water from Hyland and Wexler, then the wet-bulb temperature that balances the psychrometric equation, solved to a thousandth of a degree. The code is <a href="/wet-bulb-wall/wetbulb-core.js">wetbulb-core.js</a>.</p>
        <p><b>Inputs:</b> air temperature (°C), relative humidity (%), pressure. <b>Pressure:</b> one value, the standard sea-level 1013.25 hPa, for the chart, the contours, your scenario and the cities alike, so every point is on the same chart. At Delhi’s height (about 200 m) the real surface pressure is about 2% lower, which lowers the calculated wet-bulb temperature by less than a tenth of a degree. <b>Range:</b> 10 to 50 °C and 1 to 100% on the chart; the method holds well beyond it. <b>Accuracy:</b> within 0.03 °C of an independent reference (CoolProp’s humid-air model) at 264 test points from 20 to 50 °C and 5 to 100%. Shown to one decimal place, which is more than any weather input supports.</p>
        <p><b>Fahrenheit</b> is a display choice; every calculation stays in °C.</p>
      </details>
      <details class="wbw-det"><summary>Contours as numbers</summary>${ctable}</details>
      <details class="wbw-det"><summary>City weather: source, timing and limits</summary>
        <p><b>Source:</b> Open-Meteo’s forecast API (${cite("openmeteo")}), current conditions for the coordinates the site uses for each city: air temperature at 2 m, relative humidity at 2 m and surface pressure, from one response, so temperature and humidity always share a place and a time. Open-Meteo builds these from weather models and updates them every 15 minutes: they are modelled, not a measurement at a station.</p>
        <p><b>When:</b> one request for all six cities when you open the page, kept in your browser for 15 minutes; nothing is sent when you move the controls. <b>Fresh</b> means the model time is within the last hour. If a request fails, the last good values stay with their original time and a “stale” label; a city with no values stays in the list without a marker. Nothing missing becomes a zero.</p>
        <p><b>Privacy:</b> your browser asks Open-Meteo directly, as the city pages do; see <a href="/privacy/">Privacy and terms</a>.</p>
      </details>
      <details class="wbw-det"><summary>Limits of this page</summary><ul>
        <li>Wet-bulb temperature leaves out sun, wind, clothing, effort, acclimatisation, health, medicines and time.</li>
        <li>The reference overlays come from small groups of healthy volunteers in a chamber at rest or very light effort. They are not limits for people working, for people with health conditions, or for children, and they are not safety lines.</li>
        <li>Indoor conditions can differ widely from the weather outside.</li>
        <li>This page gives no survival times, risk percentages or personal predictions.</li>
      </ul></details>
      <p class="wbw-meta">Sources checked ${esc(HS.checkedOn() || "on GitHub")} with the site’s source checker. More on heat stress measures: <a href="/glossary/#wetbulb">Glossary: wet-bulb temperature</a> · <a href="/heat-tools/">Heat Tool Finder</a> · <a href="/heat-futures/">Heat futures: 2035–2050</a>.</p>
    </section>
  </div>
  <script>window.WBW=${JSON.stringify(cfg).replace(/</g, "\\u003c")};</script>`;
  write(SLUG, page(SLUG, "The wet-bulb wall", "Explore how heat and humidity together limit the body’s ability to cool: drag temperature and humidity across a wet-bulb chart and compare six Asian cities’ latest available weather.", body,
    `\n  <link rel="stylesheet" href="/wet-bulb-wall/wbw.css?v=${V}"><script src="/wet-bulb-wall/wetbulb-core.js?v=${V}" defer></script><script src="/wet-bulb-wall/weather-adapter.js?v=${V}" defer></script><script src="/wet-bulb-wall/wbw.js?v=${V}" defer></script>`));
  console.log(`wet-bulb wall: ${cities.length} cities, ${LEVELS.length} contours, overlays: ${wolfOk ? "Wolf 2023" : "Wolf 2023 held (source check)"}${sherOk ? ", Sherwood 2010" : ", Sherwood held"}`);
};
module.exports.G = G; module.exports.WOLF = WOLF; module.exports.LEVELS = LEVELS; module.exports.contour = contour;
