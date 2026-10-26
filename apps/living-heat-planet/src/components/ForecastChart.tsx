/**
 * 72-hour chart in SVG, in the city's own time zone, with night shading from the model's is_day flag.
 * Accessible: a summary in the figure caption and a full hourly table behind a disclosure.
 */
import type { Forecast } from "../lib/contracts";
import { formatLocal, localHour } from "../lib/time";
import { formatTemp, cToF, type Unit } from "../lib/units";

export default function ForecastChart({ f, unit, showApparent = true }: { f: Forecast; unit: Unit; showApparent?: boolean }) {
  const hours = f.hours, W = 640, H = 220, L = 40, R = 12, T = 14, B = 34;
  const conv = (c: number) => (unit === "F" ? cToF(c) : c);
  const vals = hours.flatMap(h => [h.tempC, showApparent ? h.apparentC : null]).filter((v): v is number => v != null).map(conv);
  if (!hours.length || !vals.length) return <p className="muted">No forecast values were returned for this location.</p>;
  const lo = Math.floor(Math.min(...vals) - 1), hi = Math.ceil(Math.max(...vals) + 1);
  const x = (i: number) => L + (i / Math.max(1, hours.length - 1)) * (W - L - R);
  const y = (v: number) => T + (1 - (conv(v) - lo) / Math.max(1, hi - lo)) * (H - T - B);
  const path = (key: "tempC" | "apparentC") => {
    let d = "", pen = false;
    hours.forEach((h, i) => { const v = h[key]; if (v == null) { pen = false; return; } d += `${pen ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`; pen = true; });
    return d;
  };
  const nights: [number, number][] = []; let s = -1;
  hours.forEach((h, i) => { if (h.isDay === false && s < 0) s = i; if (h.isDay !== false && s >= 0) { nights.push([s, i]); s = -1; } }); if (s >= 0) nights.push([s, hours.length - 1]);
  const ticks = hours.map((h, i) => ({ i, hr: localHour(h.t, f.timezone) })).filter(t => t.hr % 6 === 0);
  const step = Math.max(1, Math.round((hi - lo) / 4));
  const temps = hours.map(h => h.tempC).filter((v): v is number => v != null);
  const maxI = hours.findIndex(h => h.tempC === Math.max(...temps)), minI = hours.findIndex(h => h.tempC === Math.min(...temps));
  const summary = `Next ${hours.length} hours, modelled air temperature from ${formatTemp(Math.min(...temps), unit)} (${formatLocal(hours[minI].t, f.timezone)}) to ${formatTemp(Math.max(...temps), unit)} (${formatLocal(hours[maxI].t, f.timezone)}), local time.`;
  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary} data-points={hours.length}>
        {nights.map(([a, b], k) => <rect key={k} x={x(a)} y={T} width={Math.max(1, x(b) - x(a))} height={H - T - B} className="chart__night" />)}
        {Array.from({ length: Math.floor((hi - lo) / step) + 1 }, (_, k) => lo + k * step).map(v => (
          <g key={v}><line x1={L} x2={W - R} y1={T + (1 - (v - lo) / Math.max(1, hi - lo)) * (H - T - B)} y2={T + (1 - (v - lo) / Math.max(1, hi - lo)) * (H - T - B)} className="chart__grid" />
            <text x={L - 6} y={T + (1 - (v - lo) / Math.max(1, hi - lo)) * (H - T - B) + 4} className="chart__axis" textAnchor="end">{v}°</text></g>))}
        {ticks.map(t => <text key={t.i} x={x(t.i)} y={H - 12} className="chart__axis" textAnchor="middle">{t.hr === 0 ? formatLocal(hours[t.i].t, f.timezone, { weekday: "short" }) : String(t.hr).padStart(2, "0")}</text>)}
        {showApparent && <path d={path("apparentC")} className="chart__line chart__line--apparent" />}
        <path d={path("tempC")} className="chart__line" />
      </svg>
      <figcaption>
        <span className="key"><i className="key__line" /> Air temperature</span>
        {showApparent && <span className="key"><i className="key__line key__line--dash" /> Apparent temperature (modelled)</span>}
        <span className="key"><i className="key__night" /> Night</span>
        <span className="muted">Hours in local time ({f.timezone ?? "time zone unknown"}).</span>
      </figcaption>
      <details className="chart__table">
        <summary>Hourly values as a table</summary>
        <table><thead><tr><th scope="col">Local time</th><th scope="col">Air</th><th scope="col">Apparent</th><th scope="col">Humidity</th></tr></thead>
          <tbody>{hours.map(h => <tr key={h.t}><td>{formatLocal(h.t, f.timezone)}</td><td>{formatTemp(h.tempC, unit)}</td><td>{formatTemp(h.apparentC, unit)}</td><td>{h.humidityPct == null ? "—" : `${Math.round(h.humidityPct)}%`}</td></tr>)}</tbody></table>
      </details>
    </figure>
  );
}
