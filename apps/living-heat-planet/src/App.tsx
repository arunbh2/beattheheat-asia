import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CAPITALS } from "./client/api";
import { useCapitalsWeather } from "./client/hooks";
import { GlobeController, webglAvailable, type Metric, type Tier } from "./globe/controller";
import Dossier, { TABS, type TabId } from "./components/Dossier";
import { HoverTip, Legend, SearchBox, StatusChip } from "./components/Controls";
import { CityTable, Compare, Explainer, Methods } from "./components/Panels";
import type { Unit } from "./lib/units";

const Globe = lazy(() => import("./globe/Globe"));
const BASE = import.meta.env.BASE_URL;
const HOME = { lat: 20, lon: 86 }; // opens on Asia
type Panel = null | "explainer" | "methods" | "compare" | "table";

const params = () => new URLSearchParams(location.search);
const useMedia = (q: string) => {
  const [m, setM] = useState(() => typeof matchMedia !== "undefined" && matchMedia(q).matches);
  useEffect(() => { const mq = matchMedia(q), f = () => setM(mq.matches); mq.addEventListener("change", f); return () => mq.removeEventListener("change", f); }, [q]);
  return m;
};

export default function App() {
  const embed = params().get("embed"), isEmbed = !!embed;
  const prefersReduced = useMedia("(prefers-reduced-motion: reduce)");
  const wide = useMedia("(min-width: 900px)");
  const [webgl, setWebgl] = useState(() => params().get("render") !== "2d" && webglAvailable());
  const tier: Tier = useMemo(() => {
    const forced = params().get("quality"); if (forced === "low" || forced === "high") return forced;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    return Math.min(innerWidth, innerHeight) < 700 || (mem != null && mem <= 4) ? "low" : "high";
  }, []);
  const ctl = useRef<GlobeController>(null as unknown as GlobeController);
  if (!ctl.current) ctl.current = new GlobeController(HOME);

  // a small inspection hook for automated tests and debugging; exposes no data beyond what is on screen
  useEffect(() => { (window as unknown as { __lhp: unknown }).__lhp = { ctl: ctl.current }; }, []);
  const weather = useCapitalsWeather();
  const capById = useMemo(() => new Map(CAPITALS.map(c => [c.id, c])), []);
  const [selectedId, setSelectedId] = useState<string | null>(() => { const c = params().get("city"); return c && capById.has(c) ? c : null; });
  const [tab, setTab] = useState<TabId>(() => { const t = params().get("tab"); return TABS.some(x => x.id === t) ? (t as TabId) : "now"; });
  const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(null);
  const [metric, setMetric] = useState<Metric>("air");
  const [unit, setUnit] = useState<Unit>(() => { try { return (localStorage.getItem("lhp-unit") as Unit) || "C"; } catch { return "C"; } });
  const [paused, setPaused] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [panel, setPanel] = useState<Panel>(null);

  const reduced = prefersReduced || paused;
  useEffect(() => { ctl.current.reducedMotion = prefersReduced; ctl.current.spinEnabled = !paused && !prefersReduced; }, [prefersReduced, paused]);
  useEffect(() => { ctl.current.holdSpin = !!selectedId; }, [selectedId]);
  useEffect(() => { try { localStorage.setItem("lhp-unit", unit); } catch { /* ignore */ } }, [unit]);
  useEffect(() => { const fit = () => ctl.current.fit(innerWidth / Math.max(1, innerHeight)); fit(); addEventListener("resize", fit); return () => removeEventListener("resize", fit); }, []);

  // keep the place in the URL, so links and the back button work
  useEffect(() => {
    const p = params(); if (selectedId) { p.set("city", selectedId); p.set("tab", tab); } else { p.delete("city"); p.delete("tab"); }
    const next = `${location.pathname}${p.toString() ? "?" + p : ""}${location.hash}`; if (next !== location.pathname + location.search + location.hash) history.replaceState(null, "", next);
  }, [selectedId, tab]);

  const select = useCallback((id: string) => {
    const c = capById.get(id); if (!c) return;
    setSelectedId(id); setHover(null); ctl.current.focus(c.lat, c.lon);
  }, [capById]);
  useEffect(() => { if (selectedId) { const c = capById.get(selectedId)!; ctl.current.focus(c.lat, c.lon); } }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const close = useCallback(() => { setSelectedId(null); setTab("now"); }, []);
  const onHover = useCallback((id: string | null, x: number, y: number) => setHover(id ? { id, x, y } : null), []);
  const onUserMove = useCallback(() => {}, []);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "Escape" && !panel && selectedId) close(); }; addEventListener("keydown", k); return () => removeEventListener("keydown", k); }, [panel, selectedId, close]);

  const toggleCompare = (id: string) => setCompareIds(l => l.includes(id) ? l.filter(x => x !== id) : l.length >= 4 ? l : [...l, id]);
  const selected = selectedId ? capById.get(selectedId)! : null;
  const drawer = !wide;
  const offset: [number, number] = selected ? (wide ? [-0.62 * (ctl.current.baseDist / 4.2), 0] : [0, 0.62 * (ctl.current.baseDist / 6)]) : [0, drawer ? 0.12 : 0];

  return (
    <div className={`app${isEmbed ? " app--embed" : ""}${selected ? " has-dossier" : ""}`} data-motion={reduced ? "reduced" : "full"}>
      <a className="skip" href="#controls">Skip to search and controls</a>
      <div className="stage">
        {webgl ? (
          <Suspense fallback={<p className="loading">Loading the globe…</p>}>
            <Globe ctl={ctl.current} capitals={CAPITALS} weather={weather.byId} metric={metric} tier={tier} reducedMotion={reduced} base={BASE}
              hoverId={hover?.id ?? null} selectedId={selectedId} compareIds={compareIds} offset={offset}
              onHover={onHover} onSelect={select} onUserMove={onUserMove} onContextLost={() => setWebgl(false)} />
          </Suspense>
        ) : <CityTable capitals={CAPITALS} weather={weather.byId} unit={unit} onOpen={select} fallback base={BASE} />}
        <p className="visually-hidden" role="note">A rotating globe of {CAPITALS.length} capital cities, each lit by its modelled current air temperature. Use the search box or the list of all capitals to open a city.</p>
      </div>

      <header className="top">
        {!isEmbed && <div className="brand"><h1>The Living Heat Planet</h1><p>What the temperature tells us — and what it doesn't.</p></div>}
        <div className="top__tools" id="controls">
          <SearchBox capitals={CAPITALS} onPick={select} compact={isEmbed} />
          <div className="toolrow" role="group" aria-label="Display options">
            <div className="seg" role="radiogroup" aria-label="Variable">
              <button type="button" role="radio" aria-checked={metric === "air"} onClick={() => setMetric("air")}>Air</button>
              <button type="button" role="radio" aria-checked={metric === "apparent"} onClick={() => setMetric("apparent")} title="Modelled apparent ('feels like') temperature">Feels like</button>
            </div>
            <div className="seg" role="radiogroup" aria-label="Units">
              <button type="button" role="radio" aria-checked={unit === "C"} onClick={() => setUnit("C")}>°C</button>
              <button type="button" role="radio" aria-checked={unit === "F"} onClick={() => setUnit("F")}>°F</button>
            </div>
            {webgl && <button type="button" className="btn btn--ghost btn--tool" aria-pressed={paused} onClick={() => setPaused(p => !p)} disabled={prefersReduced} aria-label={paused || prefersReduced ? "Motion paused" : "Pause motion"} title={prefersReduced ? "Motion is reduced by your system setting" : undefined}><span aria-hidden="true" className="ico">{paused || prefersReduced ? "▶" : "❚❚"}</span><span className="lbl">{paused || prefersReduced ? "Motion paused" : "Pause motion"}</span></button>}
            {webgl && <button type="button" className="btn btn--ghost btn--tool" onClick={() => { close(); ctl.current.reset(); }} aria-label="Reset view"><span aria-hidden="true" className="ico">⟲</span><span className="lbl">Reset view</span></button>}
            <button type="button" className="btn btn--ghost btn--tool" onClick={() => setPanel("table")} aria-label="All capitals, as a list"><span aria-hidden="true" className="ico">☰</span><span className="lbl">All capitals</span></button>
          </div>
        </div>
      </header>

      <footer className="bottom">
        <div className="bottom__left">
          <Legend unit={unit} metric={metric} />
          <StatusChip data={weather.data} isLoading={weather.isLoading} isError={weather.isError} onClick={() => setPanel("methods")} />
        </div>
        <nav className="bottom__links" aria-label="About this data">
          <button type="button" className="link" onClick={() => setPanel("explainer")}>Why temperature is not risk</button>
          <button type="button" className="link" onClick={() => setPanel("methods")}>Methods &amp; data</button>
          {compareIds.length > 0 && <button type="button" className="btn btn--sm" onClick={() => setPanel("compare")}>Compare {compareIds.length}</button>}
          {isEmbed && <a className="link" href={`${BASE}${selectedId ? `?city=${selectedId}` : ""}`} target="_top">Open the full planet ↗</a>}
        </nav>
        <p className="attrib">Weather: <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo.com</a> (CC BY 4.0) · Geography: <a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener">Natural Earth</a></p>
      </footer>

      {hover && !selected && capById.get(hover.id) && <HoverTip capital={capById.get(hover.id)!} weather={weather.byId.get(hover.id)} unit={unit} metric={metric} x={hover.x} y={hover.y} />}
      {selected && <Dossier capital={selected} weather={weather.byId.get(selected.id)} unit={unit} tab={tab} onTab={setTab} onClose={close} drawer={drawer}
        onCompare={() => toggleCompare(selected.id)} compared={compareIds.includes(selected.id)} canCompare={compareIds.length < 4} />}

      {panel === "explainer" && <Explainer onClose={() => setPanel(null)} />}
      {panel === "methods" && <Methods onClose={() => setPanel(null)} data={weather.data} count={CAPITALS.length} />}
      {panel === "compare" && <Compare ids={compareIds} capitals={capById} weather={weather.byId} unit={unit} onRemove={id => setCompareIds(l => l.filter(x => x !== id))} onClose={() => setPanel(null)} onOpen={id => { setPanel(null); select(id); }} />}
      {panel === "table" && <CityTable capitals={CAPITALS} weather={weather.byId} unit={unit} onOpen={id => { setPanel(null); select(id); }} onClose={() => setPanel(null)} base={BASE} />}
    </div>
  );
}
