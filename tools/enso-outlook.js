// Common Shade: the current El Niño outlook, one record for every page that shows it (the El Niño watch on /signals/,
// /el-nino/ and /el-nino-and-cities/). The data is data/site/enso-outlook.json; every entry names claims in
// research/2026-11/enso-asia/claims.json, and load() stops the build, naming the claim, unless the GitHub source check
// confirmed it (confirmed.json). An ENSO outlook is a finding, never a commitment: nothing here touches the Signals ladder.
// Bulletin issue dates are always shown, because they decide how a forecast is read; "checked" (the editorial check) goes
// to source details and metadata only. The panel never takes a date from the build.
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), BATCH = path.join(ROOT, "research", "2026-11", "enso-asia");
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const date = d => { const [y, m, day] = String(d).split("-"); return day ? `${+day} ${MONTHS[+m - 1]} ${y}` : m ? `${MONTHS[+m - 1]} ${y}` : y; };

function load() {
  const O = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "site", "enso-outlook.json"), "utf8"));
  const C = JSON.parse(fs.readFileSync(path.join(BATCH, "claims.json"), "utf8"));
  const confirmed = fs.existsSync(path.join(BATCH, "confirmed.json")) ? JSON.parse(fs.readFileSync(path.join(BATCH, "confirmed.json"), "utf8")) : [];
  const OK = Object.fromEntries(confirmed.map(c => [c.id, c]));
  const used = [...O.status.claims, ...O.phase.claims, ...O.others.flatMap(x => x.claims)];
  const missing = used.filter(id => !OK[id]);
  if (missing.length) throw new Error(`enso-outlook: claim ${missing.join(", ")} has not passed the source check (research/2026-11/enso-asia/confirmed.json)`);
  const SRC = Object.fromEntries(C.sources.map(s => [s.key, s]));
  return { O, C, OK, SRC };
}

// the watch panel: shared by /signals/ and /el-nino/ (classes are page-agnostic, styled in each page's CSS)
function panel(esc, { today, headingId = "enso-watch-h", h = "h2", links = true } = {}) {
  const { O } = load(), S = O.status, P = O.phase;
  const t = d => `<time datetime="${esc(d)}">${esc(date(d))}</time>`;
  const ext = (u, l) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(l)}<span class="visually-hidden"> (opens in a new tab)</span></a>`;
  const overdue = today && S.next && today >= S.next;
  const mam = P.rows.find(r => r.season === P.strength.season) || {};
  return `<div class="ew">
    <p class="ew-kicker">El Niño watch</p>
    <${h} class="ew-h" id="${esc(headingId)}">Implications for Asia's next hot season</${h}>
    <dl class="ew-status">
      <div><dt>Official status</dt><dd><b>${esc(S.label)}</b> <span>${esc(S.means)}</span></dd></div>
      <div><dt>Bulletin</dt><dd>${esc(S.issuer)}, ${esc(S.bulletin)}, issued ${t(S.issued)}</dd></div>
      <div><dt>Forecast period</dt><dd>January to March 2027 for strength; ENSO phase odds to April to June 2027</dd></div>
    </dl>
    <div class="ew-grid">
      <section class="ew-box"><h3><span class="ew-tag ew-tag--obs">Observed</span> What changed</h3><p>${esc(S.observed)}</p></section>
      <section class="ew-box"><h3><span class="ew-tag ew-tag--fc">Forecast</span> What the bulletin expects</h3><p>${esc(S.forecast)}</p>
        <p>For ${esc(P.strength.season)}, NOAA puts the chance of El Niño at ${mam.elnino}%, most likely weak (${P.strength.weak}%) or moderate (${P.strength.moderate}%); for April to June 2027, ENSO-neutral becomes more likely (${P.rows[3].neutral}%) than El Niño (${P.rows[3].elnino}%).</p></section>
      <section class="ew-box"><h3><span class="ew-tag ew-tag--read">Our reading</span> What it means for preparation</h3><p>The odds favour El Niño persisting into the start of the hot season in much of South and Southeast Asia, and ASMC expects above-normal temperature over the ASEAN region through January 2027. That is a reason to get ordinary heat protection ready early. It is not a forecast of a heatwave anywhere.</p></section>
      <section class="ew-box"><h3><span class="ew-tag ew-tag--limit">Uncertain</span> What remains uncertain locally</h3><p>A Pacific probability does not give any town's chance of a heatwave, a water shortage or a flood. NOAA's strength odds describe the Pacific, not the strength of local impacts. Local outcomes depend on the season, geography, other ocean drivers and local warnings.</p></section>
    </div>
    <p class="ew-note">${overdue ? `This panel reflects NOAA's discussion of ${t(S.issued)}. NOAA's next discussion was scheduled for ${t(S.next)} and has not yet been checked here.` : `This panel reflects NOAA's discussion of ${t(S.issued)}. NOAA's next discussion is scheduled for ${t(S.next)}.`}</p>
    ${links ? `<p class="ew-links">${ext(S.url, "NOAA's discussion")} · ${ext(P.url, "NOAA's ENSO probabilities")} · ${ext(O.others[2].url, "ASMC's regional outlook")} · ${ext(O.others[0].url, "WMO's seasonal update")} · <a href="/el-nino/">El Niño and heat in Asia, explained</a></p>` : ""}
  </div>`;
}

// the bulletins side by side, each with its own date, period, geography and index (never combined)
function table(esc) {
  const { O } = load(), S = O.status;
  const rows = [{ issuer: S.issuer, title: S.bulletin, issued: S.issued, kind: "Observed and forecast", period: "through January to March 2027", geography: "Tropical Pacific", index: O.phase.index, says: S.forecast, url: S.url }, ...O.others];
  const ext = (u, l) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(l)}<span class="visually-hidden"> (opens in a new tab)</span></a>`;
  return `<div class="ew-tablewrap" role="region" aria-label="Current bulletins" tabindex="0"><table class="ew-table"><caption>Current bulletins, each with its own date, period and index</caption>
    <thead><tr><th scope="col">Issuer and bulletin</th><th scope="col">Issued</th><th scope="col">Covers</th><th scope="col">Index or variable</th><th scope="col">What it says</th></tr></thead>
    <tbody>${rows.map(r => `<tr><th scope="row">${ext(r.url, r.issuer)}<br><span>${esc(r.title)}</span></th><td data-label="Issued">${esc(date(r.issued))}</td><td data-label="Covers">${esc(r.period)} · ${esc(r.geography)}</td><td data-label="Index or variable">${esc(r.index)}</td><td data-label="What it says"><span class="ew-tag ew-tag--${r.kind === "Observed" ? "obs" : "fc"}">${esc(r.kind)}</span> ${esc(r.says)}</td></tr>`).join("")}</tbody></table></div>`;
}

function md(SITE) {
  const { O } = load(), S = O.status, P = O.phase;
  return [`El Niño watch (bulletin: ${S.issuer}, ${S.bulletin}, issued ${date(S.issued)}; next scheduled ${date(S.next)})`,
    `- Official status: ${S.label}. ${S.means}`, `- Observed: ${S.observed}`, `- Forecast: ${S.forecast}`,
    `- ENSO phase probabilities (${P.issuer}, issued ${date(P.issued)}; ${P.index}): ${P.rows.map(r => `${r.season}: El Niño ${r.elnino}%, neutral ${r.neutral}%, La Niña ${r.lanina}%`).join("; ")}.`,
    `- Strength, ${P.strength.season}: weak ${P.strength.weak}%, moderate ${P.strength.moderate}%, strong ${P.strength.strong}%, very strong ${P.strength.verystrong}%.`,
    ...O.others.map(x => `- ${x.kind}, ${x.issuer}, ${x.title}, issued ${date(x.issued)}, covers ${x.period}, ${x.geography} (${x.index}): ${x.says} ${x.url}`),
    "- A Pacific probability does not give any town's chance of a heatwave, water shortage or flood; follow national services and local warnings."].join("\n");
}

module.exports = { load, panel, table, md, date };
