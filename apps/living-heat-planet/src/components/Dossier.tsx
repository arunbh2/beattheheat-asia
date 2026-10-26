/**
 * City heat dossier. NOW and NEXT 72 HOURS carry live modelled data with its source and times.
 * The five later layers show their evidence state honestly: what they will hold, where it will come from,
 * and that "no verified record in the platform" is not a finding that nothing exists.
 */
import { useEffect, useRef } from "react";
import type { Capital, CityProfile, CurrentWeather, DataAvailability, Feature } from "../lib/contracts";
import { useForecast, useProfile } from "../client/hooks";
import { describeWeather } from "../lib/weatherCodes";
import { formatLocal, timeAgo } from "../lib/time";
import { formatTemp, type Unit } from "../lib/units";
import { temperatureColor } from "../lib/temperatureScale";
import ForecastChart from "./ForecastChart";
import { NOT_A_FINDING, NO_RECORD } from "../data/profile";

export const TABS = [
  { id: "now", label: "Now" }, { id: "next", label: "Next 72 h" }, { id: "patterns", label: "Patterns" }, { id: "people", label: "People" },
  { id: "preparedness", label: "Preparedness" }, { id: "solutions", label: "Solutions" }, { id: "investment", label: "Investment" },
] as const;
export type TabId = typeof TABS[number]["id"];

const STATE_LABEL: Record<string, string> = { verified: "Verified", provisional: "Provisional", not_integrated: "Not integrated in this release", unavailable: "Unavailable", withdrawn: "Withdrawn" };
const STATUS_LABEL = { fresh: "Live", stale: "Stale: last good value", unavailable: "Current data unavailable" } as const;

function Layer({ a, title, what, questions }: { a: DataAvailability | undefined; title: string; what: string; questions: string[] }) {
  return (
    <section className="layer" data-evidence-state={a?.state ?? "unavailable"}>
      <p className="layer__state"><span className="dot dot--muted" aria-hidden="true" />{STATE_LABEL[a?.state ?? "unavailable"]}</p>
      <h3>{title}</h3>
      <p>{what}</p>
      <p className="muted">{a?.reason}</p>
      {a?.plannedSources && <p className="muted">Planned source{a.plannedSources.length > 1 ? "s" : ""}: {a.plannedSources.map((s, i) => <span key={s.url}>{i ? ", " : ""}<a href={s.url} target="_blank" rel="noopener">{s.name}</a></span>)}.</p>}
      <div className="layer__q"><p className="eyebrow">Questions this layer will answer, once it holds sourced records</p><ul>{questions.map(q => <li key={q}>{q}</li>)}</ul></div>
    </section>
  );
}

function Registry({ a, title, what, kind }: { a: DataAvailability | undefined; title: string; what: string; kind: string }) {
  return (
    <section className="layer" data-evidence-state={a?.state ?? "unavailable"}>
      <p className="layer__state"><span className="dot dot--muted" aria-hidden="true" />{STATE_LABEL[a?.state ?? "unavailable"]}</p>
      <h3>{title}</h3>
      <p>{what}</p>
      <p className="empty" role="status"><strong>{NO_RECORD}</strong> {NOT_A_FINDING}</p>
      <p className="muted">{kind} are added one at a time, each with a public source, a verification date and a named reviewer (see EDITORIAL_WORKFLOW.md). Nothing is generated or inferred.</p>
    </section>
  );
}

export default function Dossier({ capital, weather, unit, tab, onTab, onClose, onCompare, compared, canCompare, drawer }: {
  capital: Capital; weather: CurrentWeather | undefined; unit: Unit; tab: TabId; onTab: (t: TabId) => void; onClose: () => void;
  onCompare: () => void; compared: boolean; canCompare: boolean; drawer: boolean;
}) {
  const fq = useForecast(capital.id), pq = useProfile(capital.id), profile: CityProfile | undefined = pq.data;
  const av = (f: Feature) => profile?.availability.find(x => x.feature === f);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [capital.id]);
  const w = weather, status = w?.status ?? "unavailable";
  return (
    <aside className={`dossier${drawer ? " dossier--drawer" : ""}`} aria-labelledby="dossier-title" data-city={capital.id}>
      <header className="dossier__head">
        <nav className="crumbs" aria-label="Breadcrumb"><button type="button" className="link" onClick={onClose}>Planet</button><span aria-hidden="true">/</span><span>{capital.country}</span></nav>
        <h2 id="dossier-title" ref={heading} tabIndex={-1}>{capital.name}</h2>
        <p className="muted">{capital.capitalRole} · {capital.country}</p>
        {capital.notes.map(n => <p key={n} className="note">{n}</p>)}
        <p className={`status status--${status}`} role="status"><span className="dot" aria-hidden="true" />{STATUS_LABEL[status]}
          {w?.validAt && <> · model time {formatLocal(Date.parse(w.validAt) / 1000, w.timezone)} local</>}</p>
        <div className="dossier__actions">
          <button type="button" className="btn btn--ghost" onClick={onCompare} disabled={!compared && !canCompare} aria-pressed={compared}>{compared ? "In comparison" : "Add to compare"}</button>
          <button type="button" className="btn btn--icon" onClick={onClose} aria-label="Close dossier">✕</button>
        </div>
      </header>

      <div className="tabs" role="tablist" aria-label="Dossier sections">
        {TABS.map(t => <button key={t.id} id={`tab-${t.id}`} role="tab" type="button" aria-selected={tab === t.id} aria-controls={`panel-${t.id}`} tabIndex={tab === t.id ? 0 : -1} className="tab"
          onClick={() => onTab(t.id)} onKeyDown={e => { const i = TABS.findIndex(x => x.id === tab); if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); const n = TABS[(i + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length]; onTab(n.id); document.getElementById(`tab-${n.id}`)?.focus(); } }}>{t.label}</button>)}
      </div>

      <div className="dossier__body" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "now" && (
          <section>
            <p className="eyebrow">Modelled current conditions · Open-Meteo</p>
            {status === "unavailable" ? <p className="empty" role="status"><strong>Current data unavailable.</strong> No value is shown rather than a guess.</p> : (
              <>
                <div className="now">
                  <div className="now__big"><span className="swatch" style={{ background: temperatureColor(w!.temperatureC) }} aria-hidden="true" /><span className="now__temp" data-testid="now-temp">{formatTemp(w!.temperatureC, unit)}</span><span className="muted">air temperature at 2 m</span></div>
                  <dl className="facts">
                    <div><dt>Apparent temperature</dt><dd data-testid="now-apparent">{formatTemp(w!.apparentTemperatureC, unit)}</dd></div>
                    <div><dt>Relative humidity</dt><dd>{w!.humidityPct == null ? "—" : `${Math.round(w!.humidityPct)}%`}</dd></div>
                    <div><dt>Condition</dt><dd>{describeWeather(w!.weatherCode)}{w!.isDay == null ? "" : w!.isDay ? " · day" : " · night"}</dd></div>
                    <div><dt>Local time now</dt><dd>{formatLocal(Date.now() / 1000, w!.timezone, { weekday: "short", hour: "2-digit", minute: "2-digit" })}</dd></div>
                  </dl>
                </div>
                {status === "stale" && <p className="note">Open-Meteo could not be reached on the last refresh, so this is the last good value from {timeAgo(w!.fetchedAt)}.</p>}
              </>
            )}
            <p className="warning-status" role="note"><strong>Official warning status not integrated.</strong> For warnings and safety advice, follow your national meteorological or health authority.</p>
            <details className="prov"><summary>Source, times and precision</summary>
              <dl className="facts facts--small">
                <div><dt>Source</dt><dd><a href="https://open-meteo.com/en/docs" target="_blank" rel="noopener">Open-Meteo Forecast API</a> (best_match model selection)</dd></div>
                <div><dt>Model valid time</dt><dd>{w?.validAt ? `${new Date(w.validAt).toISOString().replace("T", " ").slice(0, 16)} UTC` : "—"}</dd></div>
                <div><dt>Retrieved</dt><dd>{w?.fetchedAt ? `${new Date(w.fetchedAt).toISOString().replace("T", " ").slice(0, 16)} UTC (${timeAgo(w.fetchedAt)})` : "—"}</dd></div>
                <div><dt>Requested point</dt><dd>{capital.lat.toFixed(3)}, {capital.lon.toFixed(3)} (Natural Earth city point)</dd></div>
                <div><dt>Model grid cell</dt><dd>{w?.gridLat != null ? `${w.gridLat.toFixed(3)}, ${w.gridLon!.toFixed(3)}${w.elevationM != null ? ` · ${Math.round(w.elevationM)} m` : ""}` : "—"}</dd></div>
              </dl>
              <p className="muted">One grid cell near the city's point. It does not show differences between neighbourhoods, homes or workplaces.</p>
            </details>
          </section>
        )}
        {tab === "next" && (
          <section>
            <p className="eyebrow">Forecast · Open-Meteo · not an official warning</p>
            {fq.isLoading && <p className="muted" role="status">Loading the 72-hour forecast…</p>}
            {fq.isError && <p className="empty" role="status"><strong>Forecast unavailable.</strong> Open-Meteo could not be reached; no values are shown rather than guesses.</p>}
            {fq.data && fq.data.hours.length > 0 && (
              <>
                {fq.data.status === "stale" && <p className="note">Showing the last good forecast retrieved {timeAgo(fq.data.fetchedAt)}.</p>}
                <ForecastChart f={fq.data} unit={unit} />
                <table className="days"><caption className="visually-hidden">Daily maximum and minimum</caption><thead><tr><th scope="col">Day</th><th scope="col">Max</th><th scope="col">Min</th></tr></thead>
                  <tbody>{fq.data.days.slice(0, 4).map(d => <tr key={d.date}><td>{new Date(d.date + "T12:00:00Z").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" })}</td><td>{formatTemp(d.maxC, unit)}</td><td>{formatTemp(d.minC, unit)}</td></tr>)}</tbody></table>
                <p className="muted">Hot-night markers are not shown: they need a locally credible threshold, which this release does not yet hold for any city. Retrieved {timeAgo(fq.data.fetchedAt)}.</p>
              </>
            )}
          </section>
        )}
        {tab === "patterns" && <Layer a={av("history")} title="Past and patterns" what="How today compares with the same time of year in the past, using one reanalysis source and a stated baseline period."
          questions={["Is this week warmer than the seasonal baseline, and by how much?", "How many days this season passed a threshold the user chooses?", "Are nights staying warmer than they used to?"]} />}
        {tab === "people" && <Layer a={av("population")} title="People and place" what="Where people live and how built-up the city is, from gridded datasets with their year, resolution and boundary stated."
          questions={["Roughly how many residents live in the city area, and in which year's estimate?", "How built-up is the area around the sampled point?", "What these layers cannot say: who is outdoors, at work or most affected."]} />}
        {tab === "preparedness" && <Registry a={av("institutions")} title="Preparedness" what="Heat action plans, responsible agencies, published activation thresholds, protection programmes and documented gaps." kind="Plans and agency records" />}
        {tab === "solutions" && <Registry a={av("interventions")} title="Solutions" what="Interventions linked to how they reduce exposure or harm, the setting, their maturity (idea, pilot, operational, evaluated) and the strength of evidence." kind="Interventions" />}
        {tab === "investment" && <Registry a={av("finance")} title="Investment" what="Real initiatives seeking or holding finance, with their owner, status, instrument (grant, concessional, guarantee, public budget or revenue) and last check date." kind="Financing records" />}
      </div>
    </aside>
  );
}
