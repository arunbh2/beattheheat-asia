// Common Shade: the current El Niño outlook, one record for every page that shows it: the El Niño watch on /signals/,
// /el-nino/, /el-nino-and-cities/ and the printable briefing (/print/el-nino-briefing/). The data is data/site/enso-outlook.json.
// Every entry names claims in research/2026-11/enso-asia/claims.json or research/2026-11/enso-update/claims.json, and load()
// stops the build, naming the claim, unless the GitHub source check confirmed it. An ENSO outlook is a finding, never a
// commitment: nothing here touches the Signals ladder.
// Four kinds of statement are kept apart on every page: what was OBSERVED (and over which period), what the issuer FORECASTS
// (for which period), Common Shade's INTERPRETATION for preparation, and the LOCAL UNCERTAINTY no outlook can remove.
// facts() returns the sentences that repeat across pages, so each page says them in exactly the same words; tools/check-enso.js
// checks that, and validate() checks the record itself (dates, cross-year periods, probability bounds and totals).
// Bulletin issue dates are always shown, because they decide how a forecast is read. "checked" (the editorial check) goes to
// source details and metadata only, and the build date is never used as a verification date.
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), BATCHES = ["enso-asia", "enso-update"].map(b => path.join(ROOT, "research", "2026-11", b));
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const date = d => { const [y, m, day] = String(d).split("-"); return day ? `${+day} ${MONTHS[+m - 1]} ${y}` : m ? `${MONTHS[+m - 1]} ${y}` : y; };
const read = f => JSON.parse(fs.readFileSync(f, "utf8"));

function claimsOf(O) {
  return [...O.status.claims, ...(O.status.archive ? O.status.archive.claims : []), ...(O.status.historic ? O.status.historic.claims : []), ...O.phase.claims,
    ...O.others.flatMap(x => x.claims), ...(O.iod ? O.iod.claims : []), ...(O.history || []).flatMap(x => x.claims), ...(O.unchanged ? O.unchanged.claims : [])];
}
function load() {
  const O = read(path.join(ROOT, "data", "site", "enso-outlook.json"));
  const C = { sources: [], claims: [] }, OK = {};
  for (const b of BATCHES) {
    if (!fs.existsSync(path.join(b, "claims.json"))) continue;
    const c = read(path.join(b, "claims.json")); C.sources.push(...c.sources.map(s => Object.assign({ batch: path.basename(b) }, s))); C.claims.push(...c.claims);
    if (fs.existsSync(path.join(b, "confirmed.json"))) for (const x of read(path.join(b, "confirmed.json"))) OK[x.id] = x;
  }
  const missing = claimsOf(O).filter(id => !OK[id]);
  if (missing.length) throw new Error(`enso-outlook: claim ${missing.join(", ")} has not passed the source check (research/2026-11/enso-asia or enso-update, confirmed.json)`);
  const problems = validate(O);
  if (problems.length) throw new Error(`enso-outlook: ${problems.join("; ")} (data/site/enso-outlook.json)`);
  const SRC = Object.fromEntries(C.sources.map(s => [s.key, s]));
  return { O, C, OK, SRC };
}

// ---- the record's own rules; returns a list of problems (empty when sound) ----
const SEASON = /^(January|February|March|April|May|June|July|August|September|October|November|December) to (January|February|March|April|May|June|July|August|September|October|November|December) (\d{4})$/;
function crossYear(p) {
  // a period whose months run over the turn of the year names both years: "November 2026 to January 2027", never "NDJ 2026"
  const m = String(p).match(/^(?:through )?(\w+)(?: (\d{4}))? to (\w+) (\d{4})$/); if (!m) return true;
  const a = MONTHS.indexOf(m[1]), b = MONTHS.indexOf(m[3]); if (a < 0 || b < 0) return true;
  return a <= b || !!m[2];
}
function validate(O) {
  const P = [], S = O.status, PH = O.phase, iso = d => /^\d{4}-\d{2}(-\d{2})?$/.test(String(d));
  if (!iso(S.issued) || !iso(S.next)) P.push("status: issued and next need ISO dates");
  if (S.issued >= S.next) P.push("status: the next bulletin date comes before the issue date");
  if (O.checked && O.checked < S.issued) P.push("checked: the editorial check is dated before the bulletin it checked");
  if (!S.observed || !S.forecast || !S.forecast_period || !S.observed_basis) P.push("status: observed, observed_basis, forecast and forecast_period are all needed");
  for (const r of PH.rows) {
    if (!SEASON.test(r.season) || !crossYear(r.season)) P.push(`phase: season "${r.season}" needs the form "Month to Month YYYY", with both years when it crosses the year`);
    for (const k of ["elnino", "neutral", "lanina"]) if (!(r[k] >= 0 && r[k] <= 100)) P.push(`phase ${r.season}: ${k} out of 0-100`);
    if (r.elnino + r.neutral + r.lanina !== 100) P.push(`phase ${r.season}: categories add to ${r.elnino + r.neutral + r.lanina}, not 100`);
  }
  const st = PH.strength, row = PH.rows.find(r => r.season === st.season);
  if (!row) P.push(`strength: season ${st.season} is not in the phase table`);
  else {
    // strength bands are nested inside El Niño: weak + moderate + strong + very strong is the El Niño total, never added to it
    const nino = st.weak + st.moderate + st.strong + st.verystrong;
    if (Math.abs(nino - row.elnino) > 1) P.push(`strength ${st.season}: bands add to ${nino}, but the phase table gives El Niño ${row.elnino}`);
    if (st.neutral !== undefined && Math.abs(nino + st.neutral - 100) > 1) P.push(`strength ${st.season}: El Niño bands and neutral add to ${nino + st.neutral}, not 100`);
  }
  for (const x of [...O.others, ...(O.history || [])]) {
    if (!iso(x.issued)) P.push(`${x.issuer}: issued needs an ISO date`);
    if (!crossYear(x.period)) P.push(`${x.issuer}: period "${x.period}" crosses the year without naming both years`);
    if (!x.kind || !/^(Observed|Forecast|Observed and forecast)$/.test(x.kind)) P.push(`${x.issuer}: kind must be Observed, Forecast or Observed and forecast`);
    if (!x.url || !/^https:\/\//.test(x.url)) P.push(`${x.issuer}: needs an https source URL`);
  }
  // a bulletin older than the current NOAA discussion's predecessor belongs in history, not among current bulletins
  for (const x of O.others) if (x.issued < "2026-09-01" && !x.latest) P.push(`${x.issuer} (${x.issued}): older than three months; move it to history or mark it the issuer's latest`);
  if (S.historic && !(S.historic.chance >= 0 && S.historic.chance <= 100)) P.push("historic: chance out of 0-100");
  for (const s of [S.forecast_period, ...(S.historic ? S.historic.seasons : [])]) if (!crossYear(s)) P.push(`period "${s}" crosses the year without naming both years`);
  return P;
}

// ---- the sentences that repeat across pages: one wording, shared ----
function facts() {
  const { O } = load(), S = O.status, P = O.phase, st = P.strength;
  const row = s => P.rows.find(r => r.season === s), mam = row(st.season), last = P.rows[P.rows.length - 1];
  const H = S.historic;
  return {
    status: `${S.label}: ${S.forecast}`,
    bulletin: `${S.issuer}, ${S.bulletin}, issued ${date(S.issued)}; next scheduled ${date(S.next)}`,
    phase: `For ${st.season}, ${P.issuer} puts the chance of El Niño at ${mam.elnino}%, most likely weak (${st.weak}%) or moderate (${st.moderate}%); for ${last.season}, ENSO-neutral becomes more likely (${last.neutral}%) than El Niño (${last.elnino}%).`,
    strength: `${st.season}: weak ${st.weak}%, moderate ${st.moderate}%, strong ${st.strong}%, very strong ${st.verystrong}% (these share out the ${mam.elnino}% chance of El Niño; they are not added to it).`,
    transition: `${P.issuer}'s chance of El Niño falls from ${mam.elnino}% for ${st.season} to ${last.elnino}% for ${last.season}, when neutral becomes more likely.`,
    historic: H ? `${P.issuer} calls an event historic if its ${H.threshold}, and gave that about a ${H.chance}% chance for ${H.seasons.join(" and for ")}.` : "",
    limit: "A Pacific probability is not any town's chance of a heatwave, water shortage or flood.",
    unchanged: O.unchanged ? O.unchanged.text : "",
    reading: O.interpretation,
    uncertain: O.local_uncertainty
  };
}

// the watch panel: shared by /signals/ and /el-nino/ (classes are page-agnostic, styled in each page's CSS)
function panel(esc, { today, headingId = "enso-watch-h", h = "h2", links = true } = {}) {
  const { O } = load(), S = O.status, P = O.phase, F = facts();
  const t = d => `<time datetime="${esc(d)}">${esc(date(d))}</time>`;
  const ext = (u, l) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(l)}<span class="visually-hidden"> (opens in a new tab)</span></a>`;
  const overdue = today && S.next && today >= S.next;
  const last = P.rows[P.rows.length - 1];
  return `<div class="ew">
    <p class="ew-kicker">El Niño watch</p>
    <${h} class="ew-h" id="${esc(headingId)}">Implications for Asia's next hot season</${h}>
    <dl class="ew-status">
      <div><dt>Official status</dt><dd><b>${esc(S.label)}</b> <span>${esc(S.means)}</span></dd></div>
      <div><dt>Issuing agency and bulletin</dt><dd>${esc(S.issuer)}, ${esc(S.bulletin)}, issued ${t(S.issued)}</dd></div>
      <div><dt>Forecast period</dt><dd>Strength: ${esc(S.forecast_period)}. Phase odds: ${esc(P.rows[0].season)} to ${esc(last.season)}.</dd></div>
      <div><dt>Next scheduled bulletin</dt><dd>${t(S.next)}${overdue ? " (due; not yet checked here)" : ""}</dd></div>
    </dl>
    ${F.unchanged ? `<p class="ew-change"><b>What changed?</b> ${esc(F.unchanged)}</p>` : ""}
    <div class="ew-grid">
      <section class="ew-box"><h3><span class="ew-tag ew-tag--obs">Observed</span> What the measurements show</h3><p>${esc(S.observed)}</p><p class="ew-basis">${esc(S.observed_basis)}</p></section>
      <section class="ew-box"><h3><span class="ew-tag ew-tag--fc">Forecast</span> What the bulletin expects</h3><p>${esc(S.forecast)}</p><p>${esc(F.phase)}</p></section>
      <section class="ew-box"><h3><span class="ew-tag ew-tag--read">Our reading</span> What it means for preparation</h3><p>${esc(F.reading)}</p></section>
      <section class="ew-box"><h3><span class="ew-tag ew-tag--limit">Uncertain</span> What remains uncertain locally</h3><p>${esc(F.uncertain)}</p></section>
    </div>
    <p class="ew-note">${overdue ? `This panel reflects ${esc(S.issuer)}'s discussion of ${t(S.issued)}. The next discussion was scheduled for ${t(S.next)} and has not yet been checked here; until it is, the bulletin above stays the latest one verified.` : `This panel reflects ${esc(S.issuer)}'s discussion of ${t(S.issued)}. The next discussion is scheduled for ${t(S.next)}.`}</p>
    ${links ? `<p class="ew-links">${ext(S.url, "NOAA's discussion")} · ${ext(P.url, "NOAA's ENSO probabilities")} · ${O.others.filter(x => x.link).map(x => ext(x.url, x.link)).join(" · ")} · <a href="/el-nino/">El Niño and heat in Asia, explained</a> · <a href="/print/el-nino-briefing/">Printable briefing (A4)</a></p>` : ""}
  </div>`;
}

// the bulletins side by side, each with its own date, period, geography and index (never combined)
function rows() {
  const { O } = load(), S = O.status;
  return [{ issuer: S.issuer, title: S.bulletin, issued: S.issued, kind: "Observed and forecast", period: `through ${S.forecast_period}`, geography: "Tropical Pacific", index: O.phase.index, says: S.forecast, url: S.url }, ...O.others];
}
function table(esc) {
  const ext = (u, l) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(l)}<span class="visually-hidden"> (opens in a new tab)</span></a>`;
  const tag = k => k === "Observed" ? "obs" : k === "Forecast" ? "fc" : "both";
  const { O } = load();
  return `<div class="ew-tablewrap" role="region" aria-label="Current bulletins" tabindex="0"><table class="ew-table"><caption>Current bulletins, each with its own date, period and index</caption>
    <thead><tr><th scope="col">Issuer and bulletin</th><th scope="col">Issued</th><th scope="col">Covers</th><th scope="col">Index or variable</th><th scope="col">What it says</th></tr></thead>
    <tbody>${rows().map(r => `<tr><th scope="row">${ext(r.url, r.issuer)}<br><span>${esc(r.title)}</span></th><td data-label="Issued">${esc(date(r.issued))}</td><td data-label="Covers">${esc(r.period)} · ${esc(r.geography)}</td><td data-label="Index or variable">${esc(r.index)}</td><td data-label="What it says"><span class="ew-tag ew-tag--${tag(r.kind)}">${esc(r.kind)}</span> ${esc(r.says)}</td></tr>`).join("")}</tbody></table></div>
    ${O.iod ? `<p class="ew-iod"><b>The Indian Ocean.</b> ${esc(O.iod.text)}</p>` : ""}`;
}

function md(SITE) {
  const { O } = load(), S = O.status, P = O.phase, F = facts();
  return [`El Niño watch (bulletin: ${F.bulletin})`,
    `- Official status: ${S.label}. ${S.means}`, ...(F.unchanged ? [`- What changed: ${F.unchanged}`] : []),
    `- Observed: ${S.observed} ${S.observed_basis}`, `- Forecast (${S.forecast_period}): ${S.forecast}`, `- ${F.phase}`,
    `- ENSO phase probabilities (${P.issuer}, issued ${date(P.issued)}; ${P.index}): ${P.rows.map(r => `${r.season}: El Niño ${r.elnino}%, neutral ${r.neutral}%, La Niña ${r.lanina}%`).join("; ")}.`,
    `- Strength, ${F.strength}`, ...(F.historic ? [`- ${F.historic}`] : []),
    ...O.others.map(x => `- ${x.kind}, ${x.issuer}, ${x.title}, issued ${date(x.issued)}, covers ${x.period}, ${x.geography} (${x.index}): ${x.says} ${x.url}`),
    ...(O.iod ? [`- The Indian Ocean: ${O.iod.text}`] : []),
    `- Our reading (Common Shade's interpretation): ${F.reading}`, `- Uncertain locally: ${F.uncertain}`,
    ...((O.history || []).length ? [`- Earlier bulletins, kept as history: ${O.history.map(x => `${x.issuer}, ${x.title}, issued ${date(x.issued)} (${x.says})`).join("; ")}.`] : [])].join("\n");
}

module.exports = { load, validate, crossYear, facts, panel, rows, table, md, date, claimsOf };
