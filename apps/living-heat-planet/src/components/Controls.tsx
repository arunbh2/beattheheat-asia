/** Search, legend, status chip and hover tip. */
import { useId, useMemo, useState } from "react";
import type { Capital, CapitalsWeather, CurrentWeather } from "../lib/contracts";
import { searchCapitals } from "../lib/search";
import { BANDS, SCALE_TITLE, UNAVAILABLE_COLOR } from "../lib/temperatureScale";
import { formatTemp, cToF, type Unit } from "../lib/units";
import { timeAgo } from "../lib/time";
import type { Metric } from "../globe/controller";

export function SearchBox({ capitals, onPick, compact }: { capitals: Capital[]; onPick: (id: string) => void; compact?: boolean }) {
  const [q, setQ] = useState(""), [open, setOpen] = useState(false), [active, setActive] = useState(0), id = useId();
  const results = useMemo(() => searchCapitals(capitals, q, 8), [capitals, q]);
  const pick = (c: Capital) => { onPick(c.id); setQ(""); setOpen(false); };
  return (
    <div className={`search${compact ? " search--compact" : ""}`}>
      <label htmlFor={`${id}-input`} className="visually-hidden">Search capitals by city or country</label>
      <input id={`${id}-input`} type="search" role="combobox" aria-expanded={open && results.length > 0} aria-controls={`${id}-list`} aria-autocomplete="list"
        aria-activedescendant={open && results[active] ? `${id}-opt-${active}` : undefined} placeholder="Search a capital or country" autoComplete="off" value={q}
        onChange={e => { setQ(e.target.value); setOpen(true); setActive(0); }} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={e => {
          if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(results.length - 1, a + 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setActive(a => Math.max(0, a - 1)); }
          else if (e.key === "Enter" && results[active]) { e.preventDefault(); pick(results[active]); }
          else if (e.key === "Escape") { setQ(""); setOpen(false); }
        }} />
      {open && results.length > 0 && (
        <ul id={`${id}-list`} role="listbox" className="search__list">
          {results.map((c, i) => <li key={c.id} id={`${id}-opt-${i}`} role="option" aria-selected={i === active} className={i === active ? "is-active" : ""} onMouseDown={e => { e.preventDefault(); pick(c); }} onMouseEnter={() => setActive(i)}>
            <span>{c.name}</span><span className="muted">{c.country}{c.capitalRole !== "National capital" ? ` · ${c.capitalRole.toLowerCase()}` : ""}</span></li>)}
        </ul>)}
      {open && q && !results.length && <p className="search__none" role="status">No capital matches “{q}”.</p>}
    </div>
  );
}

export function Legend({ unit, metric }: { unit: Unit; metric: Metric }) {
  const edge = (c: number) => unit === "F" ? `${Math.round(cToF(c))}°F` : `${c}°C`;
  return (
    <div className="legend" role="group" aria-label={SCALE_TITLE}>
      <p className="legend__title">{metric === "air" ? SCALE_TITLE : "Apparent temperature (°C), modelled"}</p>
      <div className="legend__bar">{BANDS.map(b => <span key={b.label} style={{ background: b.color }} title={b.label} />)}</div>
      <div className="legend__ticks" aria-hidden="true"><span>{edge(0)}</span><span>{edge(15)}</span><span>{edge(25)}</span><span>{edge(32)}</span><span>{edge(38)}</span></div>
      <p className="legend__na"><span className="dot" style={{ background: UNAVAILABLE_COLOR }} aria-hidden="true" />No current value</p>
      <p className="visually-hidden">Bands: {BANDS.map(b => `${b.label} °C`).join(", ")}. Colours show air temperature only, not health risk.</p>
    </div>
  );
}

export function StatusChip({ data, isLoading, isError, onClick }: { data: CapitalsWeather | undefined; isLoading: boolean; isError: boolean; onClick: () => void }) {
  let text = isLoading ? "Loading current conditions…" : "Waiting for current conditions…", cls = "loading";
  if (isError || (data && data.summary.fresh + data.summary.stale === 0)) { text = "Current data unavailable"; cls = "unavailable"; }
  else if (data) { const s = data.summary; text = `${s.stale ? "Partly stale" : "Live"} · ${s.fresh + s.stale}/${data.records.length} capitals · ${timeAgo(data.fetchedAt)}`; cls = s.stale ? "stale" : "fresh"; }
  return <button type="button" className={`chip chip--${cls}`} onClick={onClick} aria-live="polite" data-testid="status-chip"><span className="dot" aria-hidden="true" />{text}<span className="chip__src">Open-Meteo</span></button>;
}

export function HoverTip({ capital, weather, unit, metric, x, y }: { capital: Capital; weather: CurrentWeather | undefined; unit: Unit; metric: Metric; x: number; y: number }) {
  const v = weather && weather.status !== "unavailable" ? (metric === "air" ? weather.temperatureC : weather.apparentTemperatureC) : null;
  return (
    <div className="tip" style={{ left: x + 14, top: y + 14 }} role="tooltip">
      <strong>{capital.name}</strong> <span>{v == null ? "unavailable" : formatTemp(v, unit)}</span>
      <span className="muted">{capital.country}{metric === "apparent" ? " · apparent" : ""}{weather?.status === "stale" ? " · stale" : ""}</span>
    </div>
  );
}
