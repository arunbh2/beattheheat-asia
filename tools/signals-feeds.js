// Common Shade: what moved on Signals, and two ways to follow it without an account. Used by tools/build-signals.js.
// - moved(): milestones and new records dated in the last WINDOW days, newest first, and dated steps still ahead.
//   A date is when something happened (or is scheduled), never when Common Shade added it; vague dates ("2026") are left out.
// - atom(): /signals/feed.xml, one entry per record, updated at its latest development.
// - ics(): /signals/calendar.ics, scheduled steps (a rule taking effect, a plan's start) and the next El Niño bulletin.
//   Reaching a date shows nothing about compliance; each event says so.
"use strict";
const SM = require("./signals-model.js");
const SITE = "https://beattheheat.asia", WINDOW = 45, AHEAD = 120;

const addDays = (iso, n) => { const d = new Date(iso + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const full = d => /^\d{4}-\d{2}-\d{2}$/.test(d);
const fill = d => d.length === 4 ? `${d}-01-01` : d.length === 7 ? `${d}-01` : d;

function moved(D, today, kindLabel) { return Object.assign(between(D, addDays(today, -WINDOW), today, addDays(today, AHEAD), kindLabel), { window: WINDOW }); }
// steps dated from..until (inclusive), and scheduled steps after until up to aheadTo: used for What moved and for a
// State of the field draft's "month on the ladder" (tools/sof-review.js new)
function between(D, from, today, aheadTo, kindLabel) {
  // a scheduled step still ahead of the real date stays scheduled, whatever the period asked for
  const to = aheadTo, past = [], ahead = [], now = new Date().toISOString().slice(0, 10);
  for (const s of D.signals) {
    if (s.kind === "commitment") {
      for (const d of s.deliverables || []) for (const t of SM.timeline(d)) {
        if (!full(t.date)) continue;
        if (t.kind === "milestone" && t.scheduled && t.date > now) { if (t.date <= to && t.date >= from) ahead.push({ date: t.date, what: SM.STEPS[t.step].label, item: d.what, s, anchor: `${s.id}--${d.id}--${t.id}` }); continue; }
        if (t.date >= from && t.date <= today) past.push({ date: t.date, what: t.kind === "event" ? SM.EVENTS[t.step] : SM.STEPS[t.step].label, item: d.what, s, anchor: `${s.id}--${d.id}${t.id ? "--" + t.id : ""}` });
      }
    } else if (full(s.date || "") && s.date >= from && s.date <= today) past.push({ date: s.date, what: `New ${kindLabel(s).toLowerCase()}`, item: s.title, s, anchor: s.id });
  }
  const order = (a, b) => a.date.localeCompare(b.date) || a.anchor.localeCompare(b.anchor);
  return { from, until: today, past: past.sort(order).reverse(), ahead: ahead.sort(order) };
}

const x = s => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
function atom(D, today, lede) {
  const rows = D.signals.map(s => ({ s, at: fill(SM.latest(s, today) || s.date) })).sort((a, b) => b.at.localeCompare(a.at) || a.s.id.localeCompare(b.s.id));
  const updated = rows.length ? rows[0].at : today;
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Common Shade: Signals</title>
  <subtitle>${x(lede)}</subtitle>
  <link rel="alternate" type="text/html" href="${SITE}/signals/"/>
  <link rel="self" type="application/atom+xml" href="${SITE}/signals/feed.xml"/>
  <id>${SITE}/signals/</id>
  <updated>${updated}T00:00:00Z</updated>
  <author><name>Common Shade</name><uri>${SITE}/</uri></author>
  <rights>CC BY 4.0</rights>
${rows.map(({ s, at }) => `  <entry>
    <title>${x(s.title)}</title>
    <link rel="alternate" type="text/html" href="${SITE}/signals/#${x(s.id)}"/>
    <id>${SITE}/signals/#${x(s.id)}</id>
    <updated>${at}T00:00:00Z</updated>
    <category term="${x(s.kind)}"/>
    <summary>${x(s.summary)} Who: ${x(s.who)}. Where: ${x(s.where)}. Latest development: ${x(SM.date(SM.latest(s, today) || s.date))}. Evidence states, sources and what is not known are on the record.</summary>
  </entry>`).join("\n")}
</feed>
`;
}

// iCalendar: all-day events, lines folded at 73 octets, text escaped (RFC 5545)
const ix = s => String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
function fold(line) {
  const b = Buffer.from(line, "utf8"); if (b.length <= 73) return line;
  const out = []; let cur = "", n = 0;
  for (const ch of line) { const l = Buffer.byteLength(ch); if (n + l > (out.length ? 72 : 73)) { out.push(cur); cur = ""; n = 0; } cur += ch; n += l; }
  out.push(cur); return out.join("\r\n ");
}
function ics(D, today, enso) {
  const stamp = today.replace(/-/g, "") + "T000000Z", ev = [];
  for (const s of D.signals) for (const d of s.deliverables || []) for (const m of d.milestones || []) {
    if (!(m.scheduled && full(m.date) && m.date > today)) continue;
    ev.push({ uid: `${s.id}--${d.id}--${m.id}@beattheheat.asia`, date: m.date, title: `${SM.STEPS[m.step].label}: ${d.what}`,
      desc: `${s.title}. ${m.note ? m.note.replace(/\.?\s*$/, ".") + " " : ""}${/complian|applied/i.test(m.note || "") ? "" : "Reaching this date does not by itself show the rule or plan is being applied. "}Record: ${SITE}/signals/#${s.id}--${d.id}--${m.id}`, url: `${SITE}/signals/#${s.id}--${d.id}--${m.id}` });
  }
  if (enso && enso.status && full(enso.status.next || "") && enso.status.next > today) ev.push({ uid: `enso-next-${enso.status.next}@beattheheat.asia`, date: enso.status.next,
    title: `Next scheduled bulletin: ${enso.status.issuer}, ${enso.status.bulletin}`, desc: `The El Niño watch on Signals is reviewed against each new bulletin. ${SITE}/signals/#el-nino-watch`, url: `${SITE}/signals/#el-nino-watch` });
  ev.sort((a, b) => a.date.localeCompare(b.date) || a.uid.localeCompare(b.uid));
  const L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Common Shade//Signals//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:Common Shade: Signals, scheduled dates",
    "X-WR-CALDESC:" + ix("Dates that commitments tracked on Common Shade's Signals are scheduled to reach, and the next El Niño bulletin. A date reached is not evidence of implementation.")];
  for (const e of ev) L.push("BEGIN:VEVENT", `UID:${e.uid}`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${e.date.replace(/-/g, "")}`, `DTEND;VALUE=DATE:${addDays(e.date, 1).replace(/-/g, "")}`,
    "SUMMARY:" + ix(e.title), "DESCRIPTION:" + ix(e.desc), `URL:${e.url}`, "TRANSP:TRANSPARENT", "END:VEVENT");
  L.push("END:VCALENDAR");
  return { text: L.map(fold).join("\r\n") + "\r\n", n: ev.length };
}

module.exports = { moved, between, atom, ics, WINDOW, AHEAD };
