/** Modal panels: why temperature is not risk, methods and data, compare, and the 2D city view. */
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Capital, CapitalsWeather, CurrentWeather } from "../lib/contracts";
import { SOURCES } from "../data/sources";
import { CAPITALS_META } from "../client/api";
import { useForecast } from "../client/hooks";
import { formatTemp, cToF, type Unit } from "../lib/units";
import { formatLocal, timeAgo } from "../lib/time";
import { describeWeather } from "../lib/weatherCodes";
import { temperatureColor } from "../lib/temperatureScale";
import { fold } from "../lib/search";
import { decodeLand } from "../lib/geo";

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null), back = useRef<Element | null>(null);
  useEffect(() => {
    back.current = document.activeElement; ref.current?.querySelector<HTMLElement>("h2")?.focus();
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && ref.current) { const f = [...ref.current.querySelectorAll<HTMLElement>("a,button,input,select,summary,[tabindex='0']")].filter(x => !x.hasAttribute("disabled"));
        if (!f.length) return; if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); } }
    };
    document.addEventListener("keydown", k);
    return () => { document.removeEventListener("keydown", k); (back.current as HTMLElement | null)?.focus?.(); };
  }, [onClose]);
  return (
    <div className="modal" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`modal__box${wide ? " modal__box--wide" : ""}`} role="dialog" aria-modal="true" aria-labelledby="modal-title" ref={ref}>
        <div className="modal__head"><h2 id="modal-title" tabIndex={-1}>{title}</h2><button type="button" className="btn btn--icon" onClick={onClose} aria-label="Close">✕</button></div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}

export function Explainer({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Why temperature is not the same as risk" onClose={onClose}>
      <p className="lede">The lights on this globe show one thing: modelled air temperature at a single point in each capital. That is useful, and it is a long way from knowing who is in danger.</p>
      <h3>Five different things that are easy to confuse</h3>
      <dl className="terms">
        <div><dt>Weather hazard</dt><dd>How hot it is, for how long, and how little it cools at night. The globe shows only the first part, at one moment.</dd></div>
        <div><dt>Heat stress</dt><dd>The load on a body, which also depends on humidity, sun, wind, clothing and effort. Apparent temperature is a model estimate of how the air feels; it is not a workplace heat-stress measure such as WBGT.</dd></div>
        <div><dt>Exposure</dt><dd>Who is actually in that heat: working outdoors, in a hot kitchen or factory, in a home under a tin roof, or on a long commute.</dd></div>
        <div><dt>Vulnerability</dt><dd>Why the same heat harms some people more: age, illness, medicines, pregnancy, poverty, housing, and whether they can stop, rest, drink or cool down.</dd></div>
        <div><dt>Capacity to respond</dt><dd>Warnings that reach people, plans with owners, cooling spaces, protected pay and health services ready for the hot weeks.</dd></div>
      </dl>
      <h3>Why a single colour cannot be a danger level</h3>
      <ul>
        <li>People adapt to their local climate, so the same temperature carries different risk in different places. Heat-health thresholds are set locally.</li>
        <li>Humid heat and warm nights can matter as much as the daytime peak.</li>
        <li>A capital's point does not show the differences inside a city, between a shaded street and an informal settlement.</li>
        <li>Risk comes from hazard, exposure and vulnerability together, shaped by the ability to respond. Multiplying uncalibrated numbers into a score would look precise and mislead.</li>
      </ul>
      <h3>What this platform will and will not do</h3>
      <p>It will add sourced layers one at a time (past patterns, people and place, preparedness, solutions and investment), each with its year, scale and limits. It will not invent a global heat-risk score, issue warnings, or treat a missing record as proof that nothing exists.</p>
      <p className="muted">For guidance on planning, see WHO's <a href="https://www.who.int/kazakhstan/publications/i/item/9789289062930" target="_blank" rel="noopener">Heat–health action plans guidance (2026)</a>. For warnings, follow your national meteorological or health authority.</p>
    </Modal>
  );
}

export function Methods({ onClose, data, count }: { onClose: () => void; data: CapitalsWeather | undefined; count: number }) {
  const meta = CAPITALS_META.provenance;
  return (
    <Modal title="Methods and data" onClose={onClose} wide>
      <h3>This snapshot</h3>
      {data ? (
        <dl className="facts facts--small">
          <div><dt>Retrieved from Open-Meteo</dt><dd>{data.fetchedAt ? `${new Date(data.fetchedAt).toISOString().replace("T", " ").slice(0, 16)} UTC (${timeAgo(data.fetchedAt)})` : "not retrieved"}</dd></div>
          <div><dt>Served</dt><dd>{data.mode === "server" ? "Through this site's server proxy (shared 25-minute cache)" : "Directly by your browser from Open-Meteo (20-minute cache on this device)"}</dd></div>
          <div><dt>Capitals with live values</dt><dd>{data.summary.fresh} live · {data.summary.stale} stale · {data.summary.unavailable} unavailable, of {count}</dd></div>
          <div><dt>Requests</dt><dd>{data.summary.totalBatches} batched requests{data.summary.failedBatches ? `, ${data.summary.failedBatches} failed` : ""}</dd></div>
        </dl>
      ) : <p className="muted">No weather snapshot has loaded.</p>}
      <h3>How the lights are made</h3>
      <ul>
        <li>Each light is a Natural Earth capital point. Its colour comes from Open-Meteo's modelled 2-metre air temperature at the nearest grid cell, at the model valid time shown in each dossier.</li>
        <li>Colour bands (°C): below 0, 0–15, 15–25, 25–32, 32–38, above 38, blended over 1.5°C at each edge. They describe air temperature only. Switching to °F changes the numbers shown, not the colour.</li>
        <li>A capital whose value fails or is missing is grey and says "unavailable". It is never shown as 0°.</li>
        <li>Values are cached for 25 minutes and requested in batches of 25 capitals. If a refresh fails, the last good value is shown for up to 6 hours, labelled stale.</li>
        <li>The particles are {(document.documentElement.dataset.landPoints && document.documentElement.dataset.landPoints !== "error") ? Number(document.documentElement.dataset.landPoints).toLocaleString() : "tens of thousands of"} points sampled evenly over the sphere and kept where they fall on Natural Earth 1:50m land.</li>
      </ul>
      <h3>Sources</h3>
      <table className="sources"><thead><tr><th scope="col">Source</th><th scope="col">Layer</th><th scope="col">Status</th><th scope="col">Licence and terms</th></tr></thead>
        <tbody>{SOURCES.map(s => <tr key={s.id}><td><a href={s.url} target="_blank" rel="noopener">{s.name}</a><br /><span className="muted">{s.note}</span></td><td>{s.layer}</td><td>{s.status === "integrated" ? "Integrated" : "Planned"}</td><td>{s.licence}</td></tr>)}</tbody></table>
      <p className="muted">Capital registry: {meta.datasetVersion}, generated {CAPITALS_META.generatedAt}. Inclusions, exclusions and naming decisions are listed in CAPITALS_COVERAGE.md.
        Weather data by <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo.com</a> (CC BY 4.0). The free API is for non-commercial use; a public or institutional deployment should confirm its licence at <a href="https://open-meteo.com/en/pricing" target="_blank" rel="noopener">open-meteo.com/en/pricing</a>.</p>
      <h3>Terms</h3>
      <dl className="terms terms--small">
        <div><dt>Modelled current conditions</dt><dd>Model estimates for the current hour at a grid cell, not a thermometer reading at a station.</dd></div>
        <div><dt>Apparent temperature</dt><dd>Open-Meteo's perceived "feels like" estimate, combining air temperature with humidity, wind and sun. Not a clinical or workplace measure.</dd></div>
        <div><dt>Stale</dt><dd>The last good value, kept because a refresh failed. Its original times are shown.</dd></div>
        <div><dt>Not integrated</dt><dd>A layer this release does not yet hold. Not a finding about the city.</dd></div>
      </dl>
    </Modal>
  );
}

const LINE_STYLES = [{ dash: "", w: 2.4, o: 1 }, { dash: "6 4", w: 2, o: 0.9 }, { dash: "2 3", w: 2, o: 0.85 }, { dash: "10 3 2 3", w: 1.8, o: 0.8 }];

function CompareChart({ ids, capitals, unit }: { ids: string[]; capitals: Map<string, Capital>; unit: Unit }) {
  const fs = [useForecast(ids[0] ?? null), useForecast(ids[1] ?? null), useForecast(ids[2] ?? null), useForecast(ids[3] ?? null)].slice(0, ids.length);
  const ready = fs.filter(f => f.data && f.data.hours.length);
  if (fs.some(f => f.isLoading)) return <p className="muted" role="status">Loading forecasts…</p>;
  if (!ready.length) return <p className="empty">Forecasts unavailable. Open-Meteo could not be reached.</p>;
  const conv = (c: number) => (unit === "F" ? cToF(c) : c);
  const t0 = Math.min(...ready.map(f => f.data!.hours[0].t)), t1 = Math.max(...ready.map(f => f.data!.hours[f.data!.hours.length - 1].t));
  const vals = ready.flatMap(f => f.data!.hours.map(h => h.tempC).filter((v): v is number => v != null).map(conv));
  const lo = Math.floor(Math.min(...vals) - 1), hi = Math.ceil(Math.max(...vals) + 1), W = 680, H = 240, L = 40, R = 12, T = 12, B = 30;
  const x = (t: number) => L + (t - t0) / Math.max(1, t1 - t0) * (W - L - R), y = (v: number) => T + (1 - (conv(v) - lo) / Math.max(1, hi - lo)) * (H - T - B);
  const dayTicks: number[] = []; for (let t = Math.ceil(t0 / 86400) * 86400; t <= t1; t += 43200) dayTicks.push(t);
  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Modelled air temperature for the next 72 hours in the selected capitals, on one UTC time axis.">
        {[lo, Math.round((lo + hi) / 2), hi].map(v => <g key={v}><line x1={L} x2={W - R} y1={y(unit === "F" ? (v - 32) * 5 / 9 : v)} y2={y(unit === "F" ? (v - 32) * 5 / 9 : v)} className="chart__grid" /><text x={L - 6} y={y(unit === "F" ? (v - 32) * 5 / 9 : v) + 4} className="chart__axis" textAnchor="end">{v}°</text></g>)}
        {dayTicks.map(t => <text key={t} x={x(t)} y={H - 10} className="chart__axis" textAnchor="middle">{formatLocal(t, "UTC", { weekday: "short", hour: "2-digit" })}</text>)}
        {fs.map((f, i) => f.data && <path key={ids[i]} d={f.data.hours.map((h, k) => h.tempC == null ? "" : `${k && f.data!.hours[k - 1].tempC != null ? "L" : "M"}${x(h.t).toFixed(1)},${y(h.tempC).toFixed(1)}`).join("")}
          className="chart__line" strokeDasharray={LINE_STYLES[i].dash} strokeWidth={LINE_STYLES[i].w} opacity={LINE_STYLES[i].o} />)}
      </svg>
      <figcaption>{ids.map((id, i) => <span key={id} className="key"><svg width="28" height="8" aria-hidden="true"><line x1="0" x2="28" y1="4" y2="4" stroke="currentColor" strokeWidth={LINE_STYLES[i].w} strokeDasharray={LINE_STYLES[i].dash} /></svg> {capitals.get(id)?.name}</span>)}
        <span className="muted">Times in UTC so every city shares one axis.</span></figcaption>
    </figure>
  );
}

export function Compare({ ids, capitals, weather, unit, onRemove, onClose, onOpen }: { ids: string[]; capitals: Map<string, Capital>; weather: Map<string, CurrentWeather>; unit: Unit; onRemove: (id: string) => void; onClose: () => void; onOpen: (id: string) => void }) {
  return (
    <Modal title="Compare capitals" onClose={onClose} wide>
      <p className="lede">Modelled air temperature, side by side. This is a comparison of weather, not a ranking of heat risk: it says nothing about who is exposed, who is vulnerable or how well each city is prepared.</p>
      {ids.length < 2 && <p className="muted">Add at least two capitals from their dossiers (up to four).</p>}
      <table className="compare"><thead><tr><th scope="col">Capital</th><th scope="col">Air now</th><th scope="col">Apparent</th><th scope="col">Humidity</th><th scope="col">Condition</th><th scope="col">Model time (UTC)</th><th scope="col"><span className="visually-hidden">Actions</span></th></tr></thead>
        <tbody>{ids.map(id => { const c = capitals.get(id)!, w = weather.get(id); return (
          <tr key={id}><th scope="row"><button type="button" className="link" onClick={() => onOpen(id)}>{c.name}</button><br /><span className="muted">{c.country}</span></th>
            <td>{w?.status === "unavailable" || !w ? "unavailable" : formatTemp(w.temperatureC, unit)}</td><td>{w ? formatTemp(w.apparentTemperatureC, unit) : "—"}</td>
            <td>{w?.humidityPct == null ? "—" : `${Math.round(w.humidityPct)}%`}</td><td>{w ? describeWeather(w.weatherCode) : "—"}</td>
            <td>{w?.validAt ? new Date(w.validAt).toISOString().slice(11, 16) : "—"}{w?.status === "stale" ? " (stale)" : ""}</td>
            <td><button type="button" className="btn btn--ghost btn--sm" onClick={() => onRemove(id)}>Remove</button></td></tr>); })}</tbody></table>
      {ids.length >= 1 && <><h3>Next 72 hours</h3><CompareChart ids={ids} capitals={capitals} unit={unit} /></>}
    </Modal>
  );
}

/** 2D view: a flat map on a 2D canvas and a searchable, sortable table. Used without WebGL, and as a list view. */
export function CityTable({ capitals, weather, unit, onOpen, onClose, fallback, base }: { capitals: Capital[]; weather: Map<string, CurrentWeather>; unit: Unit; onOpen: (id: string) => void; onClose?: () => void; fallback?: boolean; base: string }) {
  const [q, setQ] = useState(""), [sort, setSort] = useState<"name" | "temp">("name");
  const rows = useMemo(() => { const f = fold(q); const list = capitals.filter(c => !f || fold(c.name).includes(f) || fold(c.country).includes(f));
    return sort === "name" ? list.sort((a, b) => a.name.localeCompare(b.name)) : list.sort((a, b) => (weather.get(b.id)?.temperatureC ?? -999) - (weather.get(a.id)?.temperatureC ?? -999)); }, [capitals, q, sort, weather]);
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let alive = true; const cv = canvas.current; if (!cv) return;
    fetch(`${base}data/land-low.bin`).then(r => r.arrayBuffer()).then(buf => { if (!alive) return; const { lat, lon, count } = decodeLand(buf), ctx = cv.getContext("2d"); if (!ctx) return;
      const W = cv.width, H = cv.height; ctx.clearRect(0, 0, W, H); ctx.fillStyle = "rgba(230,232,239,0.45)";
      for (let i = 0; i < count; i++) ctx.fillRect((lon[i] + 180) / 360 * W, (90 - lat[i]) / 180 * H, 1.2, 1.2);
      for (const c of capitals) { const w = weather.get(c.id); ctx.fillStyle = temperatureColor(w && w.status !== "unavailable" ? w.temperatureC : null); ctx.beginPath(); ctx.arc((c.lon + 180) / 360 * W, (90 - c.lat) / 180 * H, 3, 0, Math.PI * 2); ctx.fill(); } }).catch(() => {});
    return () => { alive = false; };
  }, [capitals, weather, base]);
  const body = (
    <>
      {fallback && <p className="note" role="status">3D view is not available in this browser, so the capitals are shown on a flat map and in a table.</p>}
      <canvas ref={canvas} width={1200} height={600} className="map2d" aria-label="Flat map of capitals coloured by modelled air temperature" role="img" />
      <div className="table-tools"><label className="field"><span>Filter</span><input value={q} onChange={e => setQ(e.target.value)} placeholder="City or country" /></label>
        <label className="field"><span>Sort</span><select value={sort} onChange={e => setSort(e.target.value as "name" | "temp")}><option value="name">Name</option><option value="temp">Air temperature, high to low</option></select></label></div>
      <p className="muted">Sorting by temperature orders the weather, not heat risk.</p>
      <table className="citytable"><thead><tr><th scope="col">Capital</th><th scope="col">Country</th><th scope="col">Air</th><th scope="col">Apparent</th><th scope="col">Humidity</th><th scope="col">Status</th></tr></thead>
        <tbody>{rows.map(c => { const w = weather.get(c.id); return (
          <tr key={c.id}><th scope="row"><button type="button" className="link" onClick={() => onOpen(c.id)}>{c.name}</button></th><td>{c.country}</td>
            <td><span className="swatch swatch--sm" style={{ background: temperatureColor(w && w.status !== "unavailable" ? w.temperatureC : null) }} aria-hidden="true" />{w && w.status !== "unavailable" ? formatTemp(w.temperatureC, unit) : "unavailable"}</td>
            <td>{w ? formatTemp(w.apparentTemperatureC, unit) : "—"}</td><td>{w?.humidityPct == null ? "—" : `${Math.round(w.humidityPct)}%`}</td><td>{w?.status ?? "loading"}</td></tr>); })}</tbody></table>
    </>
  );
  return fallback || !onClose ? <section className="fallback" aria-label="Capitals, 2D view">{body}</section> : <Modal title="All capitals" onClose={onClose} wide>{body}</Modal>;
}
