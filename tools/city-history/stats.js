// Common Shade: the statistics behind "Heat over time" on city pages, with no library. Daily records in, yearly measures and
// a trend out: percentiles, yearly counts above a percentile (ETCCDI TX90p and TN90p style, as counts), the hottest day of
// each year (TXx), the longest dry spell (CDD) and very wet days (R95p style), Sen's slope and the Mann-Kendall test.
// tools/check-city-history.js tests every function on fixed numbers.
"use strict";
// linear-interpolated percentile of a list (p from 0 to 100)
function percentile(xs, p) { const a = xs.filter(v => v != null && isFinite(v)).sort((x, y) => x - y); if (!a.length) return null;
  const h = (a.length - 1) * p / 100, lo = Math.floor(h), hi = Math.ceil(h); return a[lo] + (a[hi] - a[lo]) * (h - lo); }
// daily records [{date: "YYYY-MM-DD", tmax, tmin, rain}] grouped by year
function byYear(days) { const m = {}; for (const d of days) { const y = +d.date.slice(0, 4); (m[y] = m[y] || []).push(d); } return m; }
// yearly measures, with thresholds from a base period [y0, y1] (Common Shade uses the whole record, so no year sits outside it)
function measures(days, base) {
  const inBase = days.filter(d => { const y = +d.date.slice(0, 4); return y >= base[0] && y <= base[1]; });
  const t = { tn90: percentile(inBase.map(d => d.tmin), 90), tx90: percentile(inBase.map(d => d.tmax), 90), r95: percentile(inBase.map(d => d.rain).filter(v => v >= 1), 95) };
  const Y = byYear(days), out = [];
  for (const y of Object.keys(Y).map(Number).sort((a, b) => a - b)) {
    const ds = Y[y]; let run = 0, cdd = 0;
    for (const d of ds) { if (d.rain != null && d.rain < 1) { run++; if (run > cdd) cdd = run; } else run = 0; }
    out.push({ year: y, days: ds.length,
      warm_nights: ds.filter(d => d.tmin > t.tn90).length, hot_days: ds.filter(d => d.tmax > t.tx90).length,
      hottest: Math.max(...ds.map(d => d.tmax).filter(v => v != null)), dry_spell: cdd, very_wet: t.r95 == null ? null : ds.filter(d => d.rain > t.r95).length });
  }
  return { thresholds: t, years: out };
}
// Sen's slope: the median of all pairwise slopes
function pairs(ys, xs) { const s = []; for (let i = 0; i < ys.length; i++) for (let j = i + 1; j < ys.length; j++) if (ys[i] != null && ys[j] != null) s.push((ys[j] - ys[i]) / ((xs ? xs[j] - xs[i] : j - i) || 1)); return s; }
function senSlope(ys, xs) { return percentile(pairs(ys, xs), 50); }
// Mann-Kendall test with the tie correction; two-sided p from the normal approximation
function mannKendall(ys) {
  const x = ys.filter(v => v != null), n = x.length; let S = 0;
  for (let i = 0; i < n - 1; i++) for (let j = i + 1; j < n; j++) S += Math.sign(x[j] - x[i]);
  const ties = {}; x.forEach(v => { ties[v] = (ties[v] || 0) + 1; });
  const tc = Object.values(ties).reduce((a, t) => a + t * (t - 1) * (2 * t + 5), 0), V = (n * (n - 1) * (2 * n + 5) - tc) / 18;
  const Z = S > 0 ? (S - 1) / Math.sqrt(V) : S < 0 ? (S + 1) / Math.sqrt(V) : 0;
  return { S, Z, p: 2 * (1 - phi(Math.abs(Z))) };
}
// the standard normal cumulative distribution (Abramowitz and Stegun 26.2.17)
function phi(z) { const t = 1 / (1 + 0.2316419 * Math.abs(z)), d = 0.3989422804014327 * Math.exp(-z * z / 2);
  const p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429)))); return z >= 0 ? 1 - p : p; }
// the 95% range of Sen's slope (Gilbert 1987): ranks of the sorted pairwise slopes either side of the median
function senRange(ys, xs) { const s = pairs(ys, xs);
  s.sort((a, b) => a - b); const N = s.length, n = ys.filter(v => v != null).length; if (!N) return null;
  const ties = {}; ys.filter(v => v != null).forEach(v => { ties[v] = (ties[v] || 0) + 1; });
  const V = (n * (n - 1) * (2 * n + 5) - Object.values(ties).reduce((a, t) => a + t * (t - 1) * (2 * t + 5), 0)) / 18, C = 1.96 * Math.sqrt(V);
  const lo = Math.max(0, Math.round((N - C) / 2) - 1), hi = Math.min(N - 1, Math.round((N + C) / 2));
  return [s[lo], s[hi]]; }
// a trend in plain words: the slope per decade, its 95% range and how sure the test is (three tiers, so weak signals are not oversold)
function trend(ys, xs) { const sl = senSlope(ys, xs), mk = mannKendall(ys), r = senRange(ys, xs), dec = sl == null ? null : sl * 10;
  const words = mk.p < 0.05 ? (dec > 0 ? "a clear rise" : "a clear fall") : mk.p < 0.2 ? (dec > 0 ? "leaning upward, not clear" : "leaning downward, not clear") : "no clear change";
  return { per_decade: dec == null ? null : +dec.toFixed(2), range: r ? [+(r[0] * 10).toFixed(2), +(r[1] * 10).toFixed(2)] : null, p: +mk.p.toFixed(3), words }; }
// a station year counts when at most 15 days and no more than 3 days in any month are missing, for both TMAX and TMIN
function validYear(days, year) { const dim = m => new Date(Date.UTC(year, m, 0)).getUTCDate(), ok = new Set(days.filter(d => d.tmax != null && d.tmin != null).map(d => d.date));
  let miss = 0; for (let m = 1; m <= 12; m++) { let mm = 0; for (let dd = 1; dd <= dim(m); dd++) { const k = `${year}-${String(m).padStart(2, "0")}-${String(dd).padStart(2, "0")}`; if (!ok.has(k)) mm++; } if (mm > 3) return false; miss += mm; }
  return miss <= 15; }
// Pettitt's test for one step change in a series (Pettitt 1979): the year after which the level shifts, and an approximate p
function pettitt(ys) { const x = ys.filter(v => v != null), n = x.length; let K = 0, at = -1;
  for (let t = 0; t < n - 1; t++) { let U = 0; for (let i = 0; i <= t; i++) for (let j = t + 1; j < n; j++) U += Math.sign(x[j] - x[i]); if (Math.abs(U) > K) { K = Math.abs(U); at = t; } }
  return { at, K, p: Math.min(1, 2 * Math.exp(-6 * K * K / (n * n * n + n * n))) }; }
// a change at the station: run on the yearly station-minus-model difference, which cancels the weather both share. A break counts
// only when Pettitt's test is under 5%, the step is at least 0.5 °C and one step fits the difference clearly better than a steady
// drift (so a gradual urban warming is not mistaken for a move); an independent review set these limits
function stationBreak(diff, xs) { const n = diff.length; if (n < 10) return { broken: false };
  const P = pettitt(diff), mean = a => a.reduce((s, v) => s + v, 0) / a.length;
  const a = diff.slice(0, P.at + 1), b = diff.slice(P.at + 1); if (!a.length || !b.length) return { broken: false, p: +P.p.toFixed(3) };
  const step = mean(b) - mean(a), sse = (arr, f) => arr.reduce((s, v, i) => s + (v - f(i)) ** 2, 0);
  const ma = mean(a), mb = mean(b), sseStep = sse(a, () => ma) + sse(b, () => mb);
  const mx = mean(xs), my = mean(diff), sxx = xs.reduce((s, v) => s + (v - mx) ** 2, 0), slope = xs.reduce((s, v, i) => s + (v - mx) * (diff[i] - my), 0) / (sxx || 1);
  const sseLine = diff.reduce((s, v, i) => s + (v - (my + slope * (xs[i] - mx))) ** 2, 0);
  const broken = P.p < 0.05 && Math.abs(step) >= 0.5 && sseStep < 0.8 * sseLine;
  return { broken, year: xs[P.at + 1], step: +step.toFixed(2), p: +P.p.toFixed(3) }; }
module.exports = { pettitt, stationBreak, validYear, pairs,  percentile, byYear, measures, senSlope, senRange, mannKendall, phi, trend };
