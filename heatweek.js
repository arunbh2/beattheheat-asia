/* Common Shade: A week in the heat (part 32 of data.js).
   Runs the exercise on its own page (#wk), and draws the launcher of workers on the home page (#wk-launch).
   Follow one worker's cash through a heatwave, build protection that only counts when usable, then test it. Adds up cash; never scores. */
(function () {
  "use strict";
  if (typeof HEAT_WEEK === "undefined") return;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const extLink = (url, text) => `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(text)}<span class="visually-hidden"> (opens in a new tab)</span>&nbsp;<span aria-hidden="true">↗</span></a>`;
  const plural = (n, one, many) => `${n} ${n === 1 ? one : (many || one + "s")}`;
  const track = name => { try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: name, title: name, event: true }); } catch (e) {} };
  const W = HEAT_WEEK, M = Object.fromEntries(W.measures.map(m => [m.id, m])), KEY = "bth-heatweek-v1", PAGE = "/a-week-in-the-heat/";
  const LIVE = typeof LIVE_CITIES !== "undefined" ? LIVE_CITIES : [];
  const citiesOf = c => LIVE.filter(x => x.country === c.name);

  // drawings: flat, faceless figures in the site's line style
  const fig = (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})" stroke="#16202B" stroke-width="5" stroke-linecap="round" fill="none"><circle cx="0" cy="-46" r="11"/><path d="M0 -35 V2 M-15 -20 L0 -28 L15 -20 M0 2 L-10 30 M0 2 L10 30"/></g>`;
  const scene = id => `<svg viewBox="0 0 240 140" aria-hidden="true" class="wk-scene"><rect width="240" height="140" fill="#F8D9B8"/><circle cx="205" cy="28" r="16" fill="#F26430"/><rect y="112" width="240" height="28" fill="#D8B585"/>${
      id === "rekha" ? `<path d="M70 50 Q105 22 140 50 Z" fill="#E0442B" stroke="#16202B" stroke-width="4"/><path d="M105 50 V88" stroke="#16202B" stroke-width="4"/><rect x="62" y="80" width="90" height="20" rx="3" fill="#8CC5BC" stroke="#16202B" stroke-width="4"/><circle cx="78" cy="78" r="6" fill="#D7263D"/><circle cx="92" cy="77" r="6" fill="#2A9D8F"/><circle cx="106" cy="78" r="6" fill="#F2C14E"/><circle cx="80" cy="108" r="8" fill="#fff" stroke="#16202B" stroke-width="4"/><circle cx="136" cy="108" r="8" fill="#fff" stroke="#16202B" stroke-width="4"/>${fig(178, 82)}`
      : id === "rahim" ? `<circle cx="70" cy="104" r="16" fill="none" stroke="#16202B" stroke-width="4"/><circle cx="150" cy="104" r="16" fill="none" stroke="#16202B" stroke-width="4"/><path d="M70 104 L100 80 H140 L150 104 M100 80 L96 60" stroke="#16202B" stroke-width="4" fill="none" stroke-linejoin="round"/><path d="M120 80 V56 Q150 40 170 60 V82 Z" fill="#E0442B" stroke="#16202B" stroke-width="4" stroke-linejoin="round"/><rect x="122" y="76" width="44" height="8" fill="#F2C14E" stroke="#16202B" stroke-width="3"/>${fig(86, 74, .85)}`
      : id === "sreymom" ? `<rect x="24" y="52" width="192" height="60" fill="#C9C2B6" stroke="#16202B" stroke-width="4"/><polygon points="16,56 ${[...Array(7)].map((_, i) => `${24 + i * 32},${i % 2 ? 44 : 34}`).join(" ")} 224,56" fill="#9AA3AD" stroke="#16202B" stroke-width="4" stroke-linejoin="round"/><rect x="40" y="70" width="28" height="16" fill="#8CC5BC" stroke="#16202B" stroke-width="3"/><rect x="172" y="70" width="28" height="16" fill="#8CC5BC" stroke="#16202B" stroke-width="3"/><rect x="92" y="88" width="70" height="8" fill="#16202B"/>${fig(112, 104, .7)}${fig(146, 104, .7)}`
      : id === "kumar" ? `<path d="M40 112 V30 M40 34 H200 M150 34 V58" stroke="#F2C14E" stroke-width="6" fill="none"/><path d="M40 34 L70 64 M40 64 L70 34" stroke="#F2C14E" stroke-width="3"/><rect x="136" y="58" width="28" height="12" fill="#9AA3AD" stroke="#16202B" stroke-width="3"/><rect x="88" y="78" width="70" height="34" fill="#C9C2B6" stroke="#16202B" stroke-width="4"/><path d="M88 90 H158 M88 101 H158 M112 78 V112 M135 78 V112" stroke="#16202B" stroke-width="2" opacity=".4"/>${fig(186, 104, .8)}<path d="M175 61 Q186 48 197 61 Z" fill="#F2C14E" stroke="#16202B" stroke-width="3"/>`
      : id === "kamala" ? `<rect x="168" y="20" width="22" height="92" fill="#9AA3AD" stroke="#16202B" stroke-width="4"/><path d="M174 16 Q182 10 178 4 M186 16 Q194 10 190 4" stroke="#9AA3AD" stroke-width="5" fill="none" opacity=".8"/>${[0, 1, 2].map(r => [0, 1, 2].map(c => `<rect x="${24 + c * 26 + (r % 2) * 13}" y="${98 - r * 13}" width="24" height="12" fill="#C8553D" stroke="#16202B" stroke-width="2"/>`).join("")).join("")}<rect x="116" y="102" width="34" height="9" fill="#C8553D" stroke="#16202B" stroke-width="3"/><g transform="translate(140,104) scale(.8)" stroke="#16202B" stroke-width="5" stroke-linecap="round" fill="none"><circle cx="0" cy="-46" r="11"/><path d="M0 -35 V-5 M0 -22 L-14 -2 M0 -22 L14 -2 M0 -5 L-14 8 M0 -5 L14 8"/></g>`
      : id === "budi" ? `<rect x="20" y="96" width="200" height="4" fill="#fff" opacity=".7"/><circle cx="76" cy="100" r="15" fill="none" stroke="#16202B" stroke-width="4"/><circle cx="156" cy="100" r="15" fill="none" stroke="#16202B" stroke-width="4"/><path d="M76 100 L100 78 H138 L156 100 M138 78 L146 62" stroke="#16202B" stroke-width="4" fill="none" stroke-linejoin="round"/><rect x="72" y="62" width="30" height="24" rx="3" fill="#2A9D8F" stroke="#16202B" stroke-width="3"/><g transform="translate(118,78) scale(.7)" stroke="#16202B" stroke-width="5" stroke-linecap="round" fill="none"><circle cx="0" cy="-46" r="12" fill="#F2C14E"/><path d="M0 -34 V0 M0 -24 L36 -22 M0 0 L22 8 L26 30"/></g>`
      : id === "lan" ? `<rect y="84" width="240" height="56" fill="#8CC5BC"/><path d="M0 92 H240 M0 104 H240" stroke="#fff" stroke-width="2" opacity=".6"/>${[...Array(9)].map((_, i) => `<path d="M${18 + i * 24} 100 v-16 m0 6 l-6 -8 m6 8 l6 -8" stroke="#3E8E41" stroke-width="3" fill="none" stroke-linecap="round"/>`).join("")}<rect x="196" y="62" width="30" height="40" rx="6" fill="#9AA3AD" stroke="#16202B" stroke-width="3"/><path d="M116 43 L130 34 L144 43 Z" fill="#F2C14E" stroke="#16202B" stroke-width="3" stroke-linejoin="round"/><g transform="translate(130,84) scale(.75)" stroke="#16202B" stroke-width="5" stroke-linecap="round" fill="none"><circle cx="0" cy="-46" r="11"/><path d="M0 -35 V-2 M0 -24 L-16 -6 M0 -24 L18 -8 M0 -2 L-10 22 M0 -2 L10 22"/></g>`
      : id === "nimal" ? `<rect y="112" width="240" height="28" fill="#8CC5BC"/><circle cx="70" cy="100" r="14" fill="none" stroke="#16202B" stroke-width="4"/><circle cx="150" cy="100" r="14" fill="none" stroke="#16202B" stroke-width="4"/><path d="M70 100 L96 80 H132 L150 100 M96 80 L92 64" stroke="#16202B" stroke-width="4" fill="none" stroke-linejoin="round"/><rect x="118" y="58" width="44" height="22" rx="3" fill="#fff" stroke="#16202B" stroke-width="3"/><path d="M128 69 q8 -7 16 0 q-8 7 -16 0 Z M144 69 l6 -5 v10 Z" fill="#2A9D8F"/>${fig(196, 92, .8)}`
      : id === "joy" ? `<path d="M52 44 Q96 22 140 44 Z" fill="#2A9D8F" stroke="#16202B" stroke-width="4"/><path d="M96 44 V78" stroke="#16202B" stroke-width="4"/><rect x="52" y="76" width="88" height="24" rx="3" fill="#F2C14E" stroke="#16202B" stroke-width="4"/><circle cx="70" cy="106" r="7" fill="#fff" stroke="#16202B" stroke-width="4"/><circle cx="124" cy="106" r="7" fill="#fff" stroke="#16202B" stroke-width="4"/>${fig(166, 84, .9)}${fig(196, 98, .55)}${fig(212, 98, .5)}`
      : id === "malee" ? `<rect x="30" y="52" width="180" height="60" fill="#FCE7D6" stroke="#16202B" stroke-width="4"/><path d="M22 56 L120 30 L218 56 Z" fill="#9AA3AD" stroke="#16202B" stroke-width="4" stroke-linejoin="round"/><rect x="104" y="84" width="56" height="8" fill="#16202B"/><path d="M114 84 V70 H148 V84 M140 70 V78" stroke="#16202B" stroke-width="4" fill="none"/><circle cx="186" cy="74" r="10" fill="none" stroke="#16202B" stroke-width="3"/><path d="M186 84 V104 M178 104 H194" stroke="#16202B" stroke-width="3"/><g transform="translate(86,106) scale(.75)" stroke="#16202B" stroke-width="5" stroke-linecap="round" fill="none"><circle cx="0" cy="-46" r="11"/><path d="M0 -35 V-5 M0 -22 L26 -22 M0 -5 L20 -5 L20 12"/></g>`
      : id === "sunil" ? `<rect x="20" y="40" width="70" height="72" fill="#C9C2B6" stroke="#16202B" stroke-width="4"/><path d="M28 52 H82 M28 66 H82 M28 80 H82" stroke="#16202B" stroke-width="2" opacity=".4"/>${fig(120, 82)}${fig(150, 84, .95)}${fig(180, 82)}<rect x="196" y="58" width="34" height="18" rx="3" fill="#fff" stroke="#16202B" stroke-width="3"/><text x="213" y="71" font-size="9" font-weight="800" text-anchor="middle" fill="#16202B">NAKA</text>`
      : `<rect x="40" y="58" width="150" height="54" fill="#FCE7D6" stroke="#16202B" stroke-width="4"/><polygon points="30,62 ${[...Array(9)].map((_, i) => `${40 + i * 18},${i % 2 ? 50 : 42}`).join(" ")} 200,62" fill="#E0442B" stroke="#16202B" stroke-width="4" stroke-linejoin="round"/><rect x="118" y="88" width="40" height="10" fill="#16202B"/><path d="M126 88 V78 H150 V88" stroke="#16202B" stroke-width="4" fill="none"/><g transform="translate(96,104) scale(.8)" stroke="#16202B" stroke-width="5" stroke-linecap="round" fill="none"><circle cx="0" cy="-46" r="11"/><path d="M0 -35 V-5 M0 -22 L22 -18 M0 -5 L18 -5 L18 12"/></g>`}</svg>`;

  // the home page: one card per worker, each opening the exercise in a new tab
  const launch = document.getElementById("wk-launch");
  if (launch) {
    launch.innerHTML = W.countries.map(c => W.people.filter(x => x.country === c.id).map(x => `<li><a class="wk-card" href="${PAGE}?p=${x.id}" target="_blank" rel="noopener">${scene(x.id)}<b>${esc(x.name)}</b><span>${esc(x.role)}</span><span class="wk-card__c">${esc(c.name)}</span><span class="visually-hidden"> (opens in a new tab)</span></a></li>`).join("")).join("");
    return;
  }

  const box = document.getElementById("wk"); if (!box) return;
  // count visits on this page as the map does, without cookies
  const GC = typeof SITE_ANALYTICS !== "undefined" && /^[a-z0-9-]+$/.test(SITE_ANALYTICS.goatcounter || "") ? SITE_ANALYTICS.goatcounter : "";
  if (GC) { const sc = document.createElement("script"); sc.async = true; sc.src = "https://gc.zgo.at/count.js"; sc.dataset.goatcounter = `https://${GC}.goatcounter.com/count`; document.head.appendChild(sc); }
  let S = { c: "in", p: "rekha", per: {} };
  try { const v = JSON.parse(localStorage.getItem(KEY) || "null"); if (v && v.per) S = v; } catch (e) {}
  // a link can choose the country (?c=bd) or the worker (?p=rahim)
  try { const q = new URLSearchParams(location.search), qp = q.get("p"), qc = q.get("c");
    if (qp && W.people.some(x => x.id === qp)) S.p = qp;
    else if (qc && W.countries.some(c => c.id === qc)) { const cur = W.people.find(x => x.id === S.p); if (!cur || cur.country !== qc) S.p = W.people.find(x => x.country === qc).id; } } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

  // sharing: a link to a worker, optionally carrying the package and tests (base64url JSON in ?k=)
  let shareOpen = false, shareWith = false, sharedIn = "";
  const b64 = { to: o => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""),
    from: t => JSON.parse(decodeURIComponent(escape(atob(t.replace(/-/g, "+").replace(/_/g, "/"))))) };
  const num = v => Math.max(0, +v || 0), str = v => String(v ?? "").slice(0, 120);
  function readShared(raw, P) {
    const o = b64.from(raw), x = { earn: num(o.earn), workCost: num(o.workCost), home: num(o.home), cash: num(o.cash), hours: Math.min(5, num(o.hours)),
      heat: W.days.map((d, i) => (Array.isArray(o.heat) && o.heat[i]) ? 1 : 0), sel: {}, tests: {}, review: str(o.review) };
    Object.entries(o.sel || {}).forEach(([id, v]) => { if (!M[id] || !P.measures.includes(id) || !v) return;
      const m = { conds: {} }; Object.entries(v.conds || {}).forEach(([c, on]) => { if (M[id].conds.some(k => k.id === c)) m.conds[c] = !!on; });
      if (W.payers.includes(v.payer)) m.payer = v.payer; if (W.statuses.includes(v.status)) m.status = v.status; if (v.keeper) m.keeper = str(v.keeper);
      if (v.amount !== undefined) m.amount = num(v.amount); if (v.arrive !== undefined) m.arrive = Math.min(7, num(v.arrive)); x.sel[id] = m; });
    W.tests.forEach(t => { if (o.tests && o.tests[t.id]) x.tests[t.id] = true; });
    return x;
  }
  try { const q = new URLSearchParams(location.search), k = q.get("k"), P0 = W.people.find(x => x.id === S.p);
    if (k && P0) { S.per[P0.id] = readShared(k, P0); sharedIn = P0.id; history.replaceState(null, "", "?p=" + P0.id); } } catch (e) {}
  const person = () => W.people.find(x => x.id === S.p) || W.people[0];
  const country = () => W.countries.find(c => c.id === person().country) || W.countries[0];
  const fresh = P => ({ earn: P.earn, workCost: P.workCost, home: P.home, cash: P.cash, hours: 3, heat: [0, 1, 1, 1, 1, 1, 0], sel: Object.fromEntries((P.defaults || []).map(id => [id, { conds: {}, status: "Confirmed" }])), tests: {}, review: "" });
  // a measure as this worker meets it: local name, description and conditions where the country differs
  const mx = id => { const o = (person().mtext || {})[id]; return o ? { ...M[id], ...o } : M[id]; };
  const has = (s, key) => Object.keys(s.sel).filter(id => M[id] && person().measures.includes(id) && M[id].effect[key]);
  const st = () => { const P = person(); return S.per[P.id] || (S.per[P.id] = fresh(P)); };
  const rs = n => { const c = country().cur, f = 10 ** c.dp, v = Math.round(Math.abs(n) * f) / f;
    return (n < 0 && v ? "−" : "") + c.sym + v.toLocaleString(c.loc, { minimumFractionDigits: v % 1 ? c.dp : 0, maximumFractionDigits: c.dp }); };
  const cap = t => t[0].toUpperCase() + t.slice(1);
  const fill = (t, P, h) => t.replace(/\{pr\}/g, P.pron).replace(/\{Pr\}/g, cap(P.pron)).replace(/\{obj\}/g, P.pron === "he" ? "him" : "her").replace(/\{poss\}/g, P.poss).replace(/\{h\} hours/g, plural(h, "hour")).replace(/\{h\}/g, h)
    .replace(/\{doctor\}/g, rs(P.doctor ?? country().doctor)).replace(/\{hosp\}/g, rs(country().hosp)).replace(/\{power\}/g, rs(country().power))
    .replace(/\{sick\}/g, rs(W.measures.reduce((a, m) => a + (m.effect.sickpay || 0), 0)));

  // a measure counts only when it is chosen, every hard condition holds and no test has knocked it out
  function condMet(s, m, c) {
    if (c.auto) return !!s.sel[c.auto] && usable(s, c.auto).ok;
    const v = (s.sel[m.id].conds || {})[c.id]; return v === undefined ? c.start !== false : v;
  }
  function usable(s, id) {
    const m = mx(id), x = s.sel[id], T = s.tests, why = [], need = [];
    if (!x) return { ok: false, off: true, why, need };
    const P = person();
    m.conds.forEach(c => { if (!c.soft && !condMet(s, m, c)) need.push(fill(c.auto ? `${c.text} (add ${M[c.auto].name.toLowerCase()})` : c.text, P, 0)); });
    if (T.water && ["shade", "station", "fan", "factorycool", "dorm", "riderpoint", "freshwater"].includes(id)) why.push("The water or power failed, and nobody restored it");
    if (T.noid && ["cash", "insurance", "hospital", "nssf", "nhi", "jkn", "hicard", "sec40", "uchealth"].includes(id)) why.push(`${cap(P.pron)} has no ID or account the scheme accepts`);
    if (T.donor && (x.payer || m.payer) === "Donor or philanthropy") why.push("It was paid for by a donor, and the money ended");
    if (T.notrigger && id === "insurance") why.push("The official reading stayed below the threshold");
    return { ok: !why.length && !need.length, why, need, text: [need.length ? `Still to make true: ${need.join("; ")}` : "", ...why].filter(Boolean).join(". ") };
  }
  const arrival = (s, id) => s.tests.late ? 7 : +(s.sel[id].arrive ?? M[id].arrive ?? 0);
  const amountOf = (s, id) => +(s.sel[id].amount ?? (person().amounts || {})[id] ?? M[id].amount ?? 0);

  function week(withPkg) {
    const s = st(), P = person(), C = country(), T = s.tests, ok = id => withPkg && usable(s, id).ok, any = k => has(s, k).some(ok);
    const red = W.measures.filter(m => m.effect.hours && ok(m.id)).reduce((a, m) => a + m.effect.hours, 0);
    const hot = s.heat.map((h, d) => h ? d : -1).filter(d => d >= 0), illDay = T.ill ? (hot[2] ?? hot[hot.length - 1] ?? 3) : -1;
    const tariff = s.sel.fan && condMet(s, M.fan, M.fan.conds.find(c => c.id === "tariff"));
    const restH = has(s, "rest").filter(ok).reduce((a, id) => a + M[id].effect.rest, 0), money = has(s, "money").filter(ok), prot = P.protect || 0;
    let bal = +s.cash, later = 0, firstNeg = -1, min = bal; const rows = [];
    money.forEach(id => { if (arrival(s, id) >= 7) later += amountOf(s, id); });
    for (let d = 0; d < 7; d++) {
      const heat = !!s.heat[d], works = !!P.works[d], ill = d === illDay;
      const lost = heat ? Math.max(0, +s.hours - red) : 0, paidLost = Math.max(0, lost - restH);
      // a monthly wage protects part of the day's pay: heat can only cut the rest (overtime)
      const earn = !works ? 0 : ill ? +s.earn * (P.sickPaid || 0) : +s.earn - Math.min(+s.earn * (1 - prot), +s.earn * paidLost / 8);
      const cost = works && !ill && !(heat && any("rentfree")) ? +s.workCost : 0;
      const water = heat && works && !ill && !any("water") ? P.water : 0, power = heat && ok("fan") && !tariff ? C.power : 0;
      const health = ill ? (any("freecare") ? 0 : P.doctor ?? C.doctor) : 0, bonus = ill && P.bonus && !any("keepbonus") ? P.bonus : 0;
      const sick = ill ? has(s, "sickpay").filter(ok).reduce((a, id) => a + M[id].effect.sickpay, 0) : 0;
      let inflow = sick; money.forEach(id => { if (arrival(s, id) === d) inflow += amountOf(s, id); });
      bal += earn - cost - water - power - +s.home - health - bonus + inflow; min = Math.min(min, bal);
      if (bal < 0 && firstNeg < 0) firstNeg = d;
      rows.push({ d, heat, works, ill, lost, paidLost, earn, cost, water, power, health, bonus, sick, inflow, bal });
    }
    const normal = P.works.reduce((a, w) => a + (w ? +s.earn : 0), 0), earned = rows.reduce((a, r) => a + r.earn, 0);
    return { rows, later, firstNeg, min, end: bal, lost: normal - earned, health: rows.reduce((a, r) => a + r.health + r.bonus, 0), illDay };
  }


  function chart(base, pkg, has) {
    const s = st(), all = [+s.cash, ...base.rows.map(r => r.bal), ...(has ? pkg.rows.map(r => r.bal) : []), 0];
    let lo = Math.min(...all), hi = Math.max(...all); const pad = (hi - lo) * .15 || Math.max(1, +s.home); lo -= pad; hi += pad;
    const X = i => 80 + i * 94, Y = v => 40 + (hi - v) / (hi - lo) * 190, z = Y(0);
    const line = rows => [[-1, +s.cash], ...rows.map(r => [r.d, r.bal])].map(([i, v]) => `${X(i + 1) - 45},${Y(v).toFixed(1)}`).join(" ");
    const dots = (rows, cls) => rows.map(r => `<circle cx="${X(r.d + 1) - 45}" cy="${Y(r.bal).toFixed(1)}" r="5" class="${cls}${r.bal < 0 ? " is-neg" : ""}"/>`).join("");
    const sky = W.days.map((d, i) => `<rect x="${X(i + 1) - 92}" y="0" width="94" height="30" class="wk-sky${s.heat[i] ? " is-hot" : ""}"/><text x="${X(i + 1) - 45}" y="20" class="wk-sky__t">${s.heat[i] ? country().temps[i] + " °C" : "—"}</text>`).join("");
    const cw = (box.querySelector(".wk-chartbox") || {}).clientWidth || 700, f = Math.min(2.1, Math.max(1, 620 / cw).toFixed(2));
    return `<svg viewBox="0 0 740 270" class="wk-chart" style="--f:${f}" role="img" aria-label="Money in hand each day. ${has ? `With the package, the lowest point is ${rs(pkg.min)}. ` : ""}Without help, the lowest point is ${rs(base.min)}.">
      ${sky}<rect x="20" y="${z.toFixed(1)}" width="700" height="${Math.max(0, 230 - z).toFixed(1)}" class="wk-neg"/>
      <line x1="20" x2="720" y1="${z.toFixed(1)}" y2="${z.toFixed(1)}" class="wk-zero"/>
      <text x="716" y="${(z - 8).toFixed(1)}" class="wk-axis wk-axis--zero" text-anchor="end">${rs(0)}</text>
      <polyline points="${line(base.rows)}" class="wk-line wk-line--base"/>${dots(base.rows, "wk-dot wk-dot--base")}
      ${has ? `<polyline points="${line(pkg.rows)}" class="wk-line wk-line--pkg"/>${dots(pkg.rows, "wk-dot wk-dot--pkg")}` : ""}
      ${W.days.map((d, i) => `<text x="${X(i + 1) - 45}" y="262" class="wk-day">${d}</text>`).join("")}<text x="${X(0) - 45 + 20}" y="262" class="wk-day">Start</text>
    </svg>
    <p class="wk-legend"><span><span class="wk-key wk-key--base"></span>Without help</span>${has ? `<span><span class="wk-key wk-key--pkg"></span>With your package</span>` : ""}<span><span class="wk-key wk-key--neg"></span>Below ${rs(0)}: unmet cash need</span></p>`;
  }

  function headline(base, pkg, has) {
    const P = person(), s = st(), D = W.dayNames;
    const runs = r => r.firstNeg >= 0 ? `runs out of money on <b>${D[r.firstNeg]}</b>` : "<b>stays above zero</b> all week";
    const end = r => r.end < 0 ? `By Sunday ${P.pron} is <b class="neg">${rs(-r.end)} short</b>.` : `${cap(P.pron)} ends the week with ${rs(r.end)}.`;
    let h = `<p class="wk-head__base">Without help, ${P.name} ${runs(base)}. ${end(base)}</p>`;
    if (has && !Object.keys(s.sel).some(id => P.measures.includes(id) && usable(s, id).ok)) h += `<p class="wk-head__warn">Nothing in the package reaches ${P.name} yet. Look for “Still to make true” on each measure below.</p>`;
    else if (has) h += `<p class="wk-head__pkg">With your package, ${P.name} ${runs(pkg)}. ${end(pkg)}${pkg.later ? ` <span>${rs(pkg.later)} of help arrives after the week is over.</span>` : ""}</p>`;
    else h += `<p class="wk-head__hint">Build a package below and watch the teal line.</p>`;
    const r = has ? pkg : base, short = Math.max(0, -r.end), dn = short / Math.max(1, +s.home);
    if (short) h += `<p class="wk-days-short">${rs(short)} is about <b>${dn < 1 ? "half a day" : dn < 1.5 ? "a day" : Math.round(dn) + " days"}</b> of food, rent and family needs${has ? ", even with your package" : ""}.</p>`;
    return h + `<p class="wk-stats__k">${has ? "With your package" : "Without help"}</p><dl class="wk-stats"><div><dt>Earnings lost to heat</dt><dd>${rs(r.lost)}</dd></div><div><dt>Cost of falling ill</dt><dd>${rs(r.health)}</dd></div>
      <div><dt>Lowest point</dt><dd class="${r.min < 0 ? "neg" : ""}">${rs(r.min)}</dd></div><div><dt>Days with nothing left</dt><dd class="${r.rows.some(x => x.bal < 0) ? "neg" : ""}">${r.rows.filter(x => x.bal < 0).length} of 7</dd></div></dl>
      <p class="wk-meaning">An unmet cash need is money ${P.pron} does not have. It is paid for with a loan, smaller meals, a child kept home from school, or going back out in the heat.</p>`;
  }

  function days(pkg) {
    const P = person();
    return `<ol class="wk-days">${pkg.rows.map(r => {
      let t = !r.works ? "No work today." : r.ill ? `${P.name} is dizzy and sick. A doctor and medicines: ${r.health ? rs(r.health) : "free"}. ${r.earn ? `No work; ${P.poss} basic pay continues on medical leave.` : "No work, no pay."}${r.bonus ? ` The day off also costs the month’s attendance bonus: ${rs(r.bonus)}.` : ""}${r.sick ? ` Social security pays ${rs(r.sick)} towards the day.` : ""}`
        : r.heat ? (r.lost ? fill(!r.cost && P.heatLineFree ? P.heatLineFree : P.heatLine, P, r.lost) : `Hot, but shade and rest let ${P.pron} work the full day.`) : "An ordinary day.";
      if (r.heat && r.paidLost < r.lost && !r.ill) t += ` Paid rest covers ${r.lost - r.paidLost} of those hours.`;
      if (r.inflow - r.sick) t += ` <b class="pos">${rs(r.inflow - r.sick)} arrives.</b>`;
      if (r.d === pkg.firstNeg) t += ` <b class="neg">Money runs out.</b>`;
      return `<li class="wk-dayc${r.heat ? " is-hot" : ""}${r.bal < 0 ? " is-neg" : ""}"><p class="wk-dayc__h"><b>${W.days[r.d]}</b>${r.heat ? `<span>${country().temps[r.d]} °C</span>` : ""}</p><p class="wk-dayc__t">${t}</p><p class="wk-dayc__bal">${rs(r.bal)}</p></li>`;
    }).join("")}</ol><p class="wk-small">The story is illustrative: it follows the numbers you set, not a real person.</p>`;
  }

  function build() {
    const s = st(), P = person();
    return `<div class="wk-layers">${W.layers.map(L => { const ms = W.measures.filter(m => m.layer === L.id && P.measures.includes(m.id)); if (!ms.length) return "";
      return `<div class="wk-layer"><h3>${esc(L.name)}</h3>${ms.map(m0 => { const m = mx(m0.id), x = s.sel[m.id], u = usable(s, m.id);
        return `<div class="wk-m${x ? " is-on" : ""}${x && !u.ok ? " is-blocked" : ""}">
          <button type="button" class="wk-m__b" data-hw-m="${m.id}" aria-pressed="${!!x}"><b>${esc(m.name)}</b><span>${esc(fill(m.does, P, 0))}</span></button>
          ${x ? `<div class="wk-m__x"><p class="wk-small">${esc(fill(m.assume, P, 0))}</p>
            ${m.effect.money ? `<div class="wk-m__money"><label>Amount <input type="number" min="0" step="${country().cur.dp ? 1 : 100}" data-hw-amt="${m.id}" value="${amountOf(s, m.id)}"></label>
              <label>Arrives <select data-hw-arr="${m.id}">${[...W.dayNames.map((d, i) => [i, d]), [7, m.id === "insurance" ? "Six to eight weeks later" : "After the heat is over"]].map(([v, l]) => `<option value="${v}"${+(x.arrive ?? m.arrive) === v ? " selected" : ""}>${esc(l)}</option>`).join("")}</select></label></div>` : ""}
            <p class="wk-m__k">For ${esc(P.name)} to use it</p>
            ${m.conds.map(c => c.auto ? `<p class="wk-cond wk-cond--auto${condMet(s, m, c) ? " is-met" : ""}">${condMet(s, m, c) ? "✓" : "✗"} ${esc(fill(c.text, P, 0))} <span>(${condMet(s, m, c) ? "the messenger does this" : `needs ${esc(M[c.auto].name.toLowerCase())}`})</span></p>`
              : `<label class="wk-cond"><input type="checkbox" data-hw-c="${m.id}:${c.id}"${condMet(s, m, c) ? " checked" : ""}> ${esc(fill(c.text, P, 0))}${c.soft ? " <span>(changes the cost, not whether it works)</span>" : ""}</label>`).join("")}
            <p class="wk-m__st${u.ok ? " is-ok" : ""}">${u.ok ? `Usable: it reaches ${esc(P.name)}.` : `Not usable yet. ${esc(u.text)}.`}</p></div>` : ""}
        </div>`; }).join("")}</div>`; }).join("")}</div>`;
  }

  function unresolved() {
    const s = st(), P = person(), out = [];
    Object.keys(s.sel).forEach(id => { if (!M[id] || !P.measures.includes(id)) return; const u = usable(s, id);
      if (!u.ok) out.push(`<li><b>${esc(mx(id).name)}</b> is in the package but does not reach ${esc(P.name)}. ${esc(u.text)}.</li>`);
      else if (M[id].effect.money && arrival(s, id) >= 7) out.push(`<li><b>${esc(M[id].name)}</b> pays, but only after the week: it does not cover the gap when it opens.</li>`); });
    if (s.tests.ill && !has(s, "freecare").some(id => usable(s, id).ok)) out.push(`<li><b>A doctor’s visit</b> is paid from ${esc(P.poss)} pocket.${s.sel.hospital ? " Hospital cash pays nothing: " + esc(P.pron) + " was ill, but not admitted." : ""}</li>`);
    if (Object.keys(s.sel).some(id => (s.sel[id].payer || mx(id).payer) === "Not decided")) out.push(`<li><b>Who pays</b> is not decided for every measure.</li>`);
    return out;
  }

  function agree() {
    const s = st(), P = person(), ids = Object.keys(s.sel).filter(id => M[id] && P.measures.includes(id));
    if (!ids.length) return `<p class="wk-small">Choose measures above to agree who pays and who keeps them running.</p>`;
    return `<div class="wk-agree">${ids.map(id => { const x = s.sel[id];
      return `<fieldset class="wk-ag"><legend>${esc(mx(id).name)} <span class="${usable(s, id).ok ? "ok" : "no"}">${usable(s, id).ok ? "usable" : "not usable yet"}</span></legend>
        <label>Who pays <select data-hw-f="${id}:payer">${W.payers.map(p => `<option${(x.payer || mx(id).payer) === p ? " selected" : ""}>${esc(p)}</option>`).join("")}</select></label>
        <label>Who keeps it running <input type="text" data-hw-f="${id}:keeper" value="${esc(x.keeper || "")}" placeholder="e.g. the ward office, the union"></label>
        <label>Status <select data-hw-f="${id}:status">${W.statuses.map(p => `<option${(x.status || "Assumed") === p ? " selected" : ""}>${esc(p)}</option>`).join("")}</select></label></fieldset>`; }).join("")}</div>
      <label class="wk-review">When will you review it with ${esc(P.name)}’s representatives? <input type="text" data-hw-review value="${esc(s.review || "")}" placeholder="e.g. after the first heatwave, with the union"></label>
      <p class="wk-small">A completed screen is not protection. Only “Confirmed” commitments are secured.</p>`;
  }

  function results() {
    const base = week(false), pkg = week(true), has = Object.keys(st().sel).some(id => P().measures.includes(id));
    box.querySelector(".wk-head").innerHTML = headline(base, pkg, has);
    box.querySelector(".wk-chartbox").innerHTML = chart(base, pkg, has);
    box.querySelector(".wk-storybox").innerHTML = days(has ? pkg : base);
    const un = unresolved(); box.querySelector(".wk-unres").innerHTML = un.length ? `<h3>Still unresolved</h3><ul>${un.join("")}</ul>` : has ? `<h3>Nothing unresolved in this test</h3><p class="wk-small">Now try the tests: the real world rarely holds every condition.</p>` : "";
    shareFresh();
  }
  const P = person;

  function shareUrl() {
    const P = person(), base = `${location.origin}${PAGE}?p=${P.id}`;
    if (!shareWith) return base;
    const s = st(); return `${base}&k=${b64.to({ earn: s.earn, workCost: s.workCost, home: s.home, cash: s.cash, hours: s.hours, heat: s.heat, sel: s.sel, tests: s.tests, review: s.review })}`;
  }
  function mailto() {
    const P = person(), c = country(), subject = `Can ${P.name} stay safe and still eat? A week in the heat`;
    const body = `${P.name} is a composite ${P.role.toLowerCase()} in ${c.name}. Follow ${P.poss} money through a heatwave week, build a package of protection, then try to break it.${shareWith ? " The link opens the package I built." : ""}\n\n${shareUrl()}\n\nFrom Common Shade`;
    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
  const shareFresh = () => { const u = box.querySelector("[data-hw-share-url]"), m = box.querySelector("[data-hw-share-mail]"); if (u) u.value = shareUrl(); if (m) m.href = mailto(); };

  function render() {
    const s = st(), p = P(), cn = country(), sym = cn.cur.sym.trim(), sm = cn.cur.dp ? 0.1 : 10;
    box.innerHTML = `
      ${sharedIn === p.id ? `<p class="wk-shared" role="status">You are looking at ${esc(p.name)}’s week as a colleague set it up. It is saved in this browser; change anything to make it yours, or start ${esc(p.name)} again at the bottom of the page.</p>` : ""}
      <p class="wk-start"><b>Start here:</b> choose a country, then a worker.</p>
      <div class="wk-countries" role="group" aria-label="Choose a country">${W.countries.map(c => `<button type="button" data-hw-k="${c.id}" aria-pressed="${c.id === p.country}">${esc(c.name)}</button>`).join("")}</div>
      <div class="wk-people" role="group" aria-label="Choose a worker">${W.people.filter(x => x.country === p.country).map(x => `<button type="button" class="wk-person" data-hw-p="${x.id}" aria-pressed="${x.id === p.id}">${scene(x.id)}<b>${esc(x.name)}</b><span>${esc(x.role)}</span></button>`).join("")}</div>
      <div class="wk-grid">
        <div class="wk-side">
          <p class="wk-intro">${esc(p.intro)}</p>
          ${citiesOf(cn).length ? `<p class="wk-cities">Heat right now in ${citiesOf(cn).map(x => `<a href="/#city-${x.id}" target="_blank" rel="noopener">${esc(x.name)}<span class="visually-hidden"> (opens the city on the map, in a new tab)</span></a>`).join(", ")}</p>` : ""}
          <details class="wk-share"${shareOpen ? " open" : ""}><summary>Send ${esc(p.name)} to a colleague</summary>
            <label class="wk-share__opt"><input type="checkbox" data-hw-share-with${shareWith ? " checked" : ""}> Include my numbers, package and tests</label>
            <label class="wk-share__url">Link <input type="text" readonly data-hw-share-url value="${esc(shareUrl())}"></label>
            <p class="wk-share__go"><button type="button" class="btn btn--sm btn--teal" data-hw-act="copy">Copy the link</button>
              <a class="btn btn--sm btn--ghost" data-hw-share-mail href="${esc(mailto())}">Email it</a>
              ${navigator.share ? `<button type="button" class="btn btn--sm btn--ghost" data-hw-act="share">Share…</button>` : ""}</p>
            <p class="wk-small" data-hw-share-note role="status"></p>
          </details>
          <details class="wk-ctx"><summary>${esc(cn.name)}: what is known</summary><ul>${cn.context.map(x => `<li>${esc(x.text)} <span class="cool-ev__src">${extLink(x.source.url, x.source.label)}</span></li>`).join("")}</ul></details>
          <h2 class="wk-h">${esc(p.name)}’s ordinary day</h2>
          <div class="wk-inputs">
            <label>Earns on a working day <span>${esc(sym)}</span><input type="number" min="0" step="${cn.cur.step}" data-hw-n="earn" value="${s.earn}"></label>
            <label>${esc(p.costLabel)} <span>${esc(sym)}</span><input type="number" min="0" step="${sm}" data-hw-n="workCost" value="${s.workCost}"></label>
            <label>${esc(p.homeLabel || "Food, rent and family needs")} <span>${esc(sym)}</span><input type="number" min="0" step="${sm}" data-hw-n="home" value="${s.home}"></label>
            <label>Cash in hand on Monday <span>${esc(sym)}</span><input type="number" min="0" step="${cn.cur.step}" data-hw-n="cash" value="${s.cash}"></label>
          </div>
          <p class="wk-small">Work costs stay the same when heat cuts the day short. That is why a small fall in earnings becomes a large fall in what is left.</p>
          <h2 class="wk-h">The heatwave</h2>
          <div class="wk-heatdays" role="group" aria-label="Hot days">${W.days.map((d, i) => `<button type="button" data-hw-d="${i}" aria-pressed="${!!s.heat[i]}" aria-label="${W.dayNames[i]}, ${s.heat[i] ? "hot" : "not hot"}">${d}<span>${s.heat[i] ? cn.temps[i] + "°" : ""}</span></button>`).join("")}</div>${cn.tempNote ? `<p class="wk-small">${esc(cn.tempNote)}</p>` : ""}
          <label class="wk-range">Working hours lost on a hot day: <b data-hw-hout>${s.hours}</b> of 8<input type="range" min="0" max="5" step="1" data-hw-n="hours" value="${s.hours}"></label>
          <p class="wk-small">In Singapore, each hot day cost workers a median 24% of a day’s pay. ${extLink(W.evidence[0].source.url, "NUS, 2024")}</p>
        </div>
        <div class="wk-main">
          <div class="wk-head" aria-live="polite"></div>
          <div class="wk-chartbox"></div>
        </div>
      </div>
      <h2 class="wk-h wk-h--wide">${esc(p.name)}’s week, day by day</h2>
      <div class="wk-storybox"></div>
      <h2 class="wk-h wk-h--wide">Build ${esc(p.name)} a package</h2>
      <p class="wk-small">Choose measures across four layers. Each one shows what has to be true for ${esc(p.name)} to actually use it.</p>
      ${build()}
      <h2 class="wk-h wk-h--wide">Now try to break it</h2>
      <div class="wk-tests" role="group" aria-label="Tests">${W.tests.map(t => `<button type="button" data-hw-t="${t.id}" aria-pressed="${!!s.tests[t.id]}"><b>${esc(t.name)}</b><span>${esc(t.text)}</span></button>`).join("")}</div>
      <div class="wk-unres" aria-live="polite"></div>
      <h2 class="wk-h wk-h--wide">Agree who does what</h2>
      ${agree()}
      <p class="wk-go"><button type="button" class="btn btn--sm btn--teal" data-hw-act="print">Open ${esc(p.name)}’s protection plan</button>
        <button type="button" class="btn btn--sm btn--ghost" data-hw-act="plan">Add these actions to my plan</button>
        <button type="button" class="link" data-hw-act="reset">Start ${esc(p.name)} again</button></p>
      <p class="wk-status" role="status"></p>
      <details class="wk-more"><summary>Run it as a group exercise</summary><ol>${W.workshop.map(x => `<li>${esc(x)}</li>`).join("")}</ol></details>
      <details class="wk-more"><summary>What this is built on</summary><ul>${W.evidence.map(x => `<li>${esc(x.text)} <span class="cool-ev__src">${extLink(x.source.url, x.source.label)}</span></li>`).join("")}</ul><p class="wk-small">${esc(W.note)}</p></details>`;
    results();
  }
  const refresh = () => { save(); const y = window.scrollY, f = document.activeElement, sel = f && f.dataset ? Object.entries(f.dataset)[0] : null;
    render(); if (sel) { const el = box.querySelector(`[data-${sel[0].replace(/[A-Z]/g, c => "-" + c.toLowerCase())}="${sel[1]}"]`); if (el) el.focus({ preventScroll: true }); } window.scrollTo(0, y); };

  function openWorkerPlan() {
    const s = st(), p = P(), base = week(false), pkg = week(true), h = esc, ids = Object.keys(s.sel).filter(id => M[id] && p.measures.includes(id));
    const css = `body{font-family:"Hanken Grotesk",Segoe UI,Arial,sans-serif;color:#16202B;max-width:860px;margin:36px auto;padding:0 24px;line-height:1.5}h1{font-family:Anton,Impact,sans-serif;font-weight:400;text-transform:uppercase;font-size:36px;margin:6px 0}
      .k{color:#1F7A70;font-weight:700;letter-spacing:.14em;text-transform:uppercase;font-size:12px}table{width:100%;border-collapse:collapse;margin-top:12px;font-size:14px}th,td{text-align:left;vertical-align:top;padding:7px;border-bottom:1px solid #E6DFD4}
      th{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#5E6570}h2{font-size:13px;letter-spacing:.12em;text-transform:uppercase;border-top:2px solid #16202B;padding-top:10px;margin-top:24px}.gap{color:#9E1A2C;font-weight:700}.note{color:#5E6570;font-size:13px}
      .print{position:fixed;top:16px;right:16px;padding:10px 18px;border-radius:999px;border:0;background:#F26430;font-weight:700;cursor:pointer}@media print{.print{display:none}body{margin:0}}`;
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Heat protection plan: ${h(p.name)}</title><style>${css}</style></head><body>
      <button class="print" onclick="window.print()">Print or save as PDF</button>
      <p class="k">Worker heat protection plan · ${h(country().name)} · draft</p><h1>${h(p.name)}, ${h(p.role.toLowerCase())}</h1><p>${h(p.where)}. ${h(p.intro)}</p>
      <h2>The week we planned for</h2><p>Earns ${rs(s.earn)} a working day; ${h(p.costLabel.toLowerCase())} ${rs(s.workCost)}; food, rent and family ${rs(s.home)}; ${rs(s.cash)} in hand on Monday. Hot days: ${h(W.dayNames.filter((d, i) => s.heat[i]).join(", ") || "none")}, losing ${s.hours} of 8 working hours each.</p>
      <table><tr><th></th><th>Runs out of money</th><th>Lowest point</th><th>End of week</th><th>Arrives after the week</th></tr>
        <tr><td>Without help</td><td>${base.firstNeg >= 0 ? W.dayNames[base.firstNeg] : "No"}</td><td>${rs(base.min)}</td><td>${rs(base.end)}</td><td>–</td></tr>
        <tr><td>With the package</td><td>${pkg.firstNeg >= 0 ? W.dayNames[pkg.firstNeg] : "No"}</td><td>${rs(pkg.min)}</td><td>${rs(pkg.end)}</td><td>${rs(pkg.later)}</td></tr></table>
      <h2>The package</h2><table><tr><th>Measure</th><th>Reaches ${h(p.name)}?</th><th>Who pays</th><th>Who keeps it running</th><th>Status</th></tr>
        ${ids.map(id => { const x = s.sel[id], u = usable(s, id); return `<tr><td><strong>${h(mx(id).name)}</strong></td><td class="${u.ok ? "" : "gap"}">${u.ok ? "Yes" : "Not yet. " + h(u.text)}</td><td class="${(x.payer || mx(id).payer) === "Not decided" ? "gap" : ""}">${h(x.payer || mx(id).payer)}</td><td class="${x.keeper ? "" : "gap"}">${h(x.keeper || "Not named")}</td><td>${h(x.status || "Assumed")}</td></tr>`; }).join("") || `<tr><td colspan="5" class="gap">No measures chosen</td></tr>`}</table>
      <h2>Tests run</h2><p>${h(W.tests.filter(t => s.tests[t.id]).map(t => t.name).join(", ") || "None yet")}</p>
      <h2>Still unresolved</h2><ul>${unresolved().join("") || "<li>Nothing in the tests run. Try the others.</li>"}</ul>
      <h2>Review</h2><p>${h(s.review || "No review date set")}</p>
      <p class="note">${h(W.note)} Only “Confirmed” commitments are secured. Made with Common Shade.</p></body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" })), w = window.open(url, "_blank");
    if (!w) { const a = document.createElement("a"); a.href = url; a.download = `heat-protection-plan-${p.id}.html`; document.body.appendChild(a); a.click(); a.remove(); }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  box.addEventListener("click", ev => {
    const t = ev.target, s = st(), b = k => t.closest(`[data-hw-${k}]`);
    if (b("k")) { const c = b("k").dataset.hwK; S.c = c; try { history.replaceState(null, "", "?c=" + c); } catch (e) {} S.p = (W.people.find(x => x.country === c) || W.people[0]).id; track("heatweek-c-" + c); refresh(); return; }
    if (b("p")) { S.p = b("p").dataset.hwP; try { history.replaceState(null, "", "?p=" + S.p); } catch (e) {} track("heatweek-" + S.p); refresh(); return; }
    if (b("d")) { const i = +b("d").dataset.hwD; s.heat[i] = s.heat[i] ? 0 : 1; refresh(); return; }
    if (b("m")) { const id = b("m").dataset.hwM; if (s.sel[id]) delete s.sel[id]; else { s.sel[id] = { conds: {} }; track("heatweek-add-" + id); } refresh(); return; }
    if (b("t")) { const id = b("t").dataset.hwT; s.tests[id] = !s.tests[id]; if (s.tests[id]) track("heatweek-test-" + id); refresh(); return; }
    const a = b("act"); if (!a) return; const act = a.dataset.hwAct, status = box.querySelector(".wk-status");
    if (act === "print") { track("heatweek-print"); openWorkerPlan(); }
    if (act === "reset") { S.per[S.p] = fresh(P()); sharedIn = ""; refresh(); }
    if (act === "copy" || act === "share") { const url = shareUrl(), note = box.querySelector("[data-hw-share-note]"), say = t => { if (note) note.textContent = t; };
      track("heatweek-share-" + act);
      if (act === "share") { navigator.share({ title: `A week in the heat: ${P().name}`, text: `Can ${P().name} stay safe and still eat?`, url }).catch(() => {}); return; }
      const fallback = () => { const u = box.querySelector("[data-hw-share-url]"); if (u) { u.focus(); u.select(); } say("Select the link above and copy it."); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(() => say("Link copied. Paste it into an email or message."), fallback); else fallback(); }
    if (act === "plan") { const known = new Set(typeof LEVERS !== "undefined" ? LEVERS.map(v => v.id) : []), lv = [...new Set(Object.keys(s.sel).filter(id => M[id] && P().measures.includes(id)).map(id => M[id].lever))].filter(id => known.has(id));
      // the map's plan lives in this browser; add to it, and the map shows the actions next time it opens
      let plan = {}, n = 0; try { plan = JSON.parse(localStorage.getItem("bth-plan-v1") || "null") || {}; } catch (e) {}
      if (!Array.isArray(plan.levers)) plan.levers = [];
      lv.forEach(id => { if (!plan.levers.includes(id)) { plan.levers.push(id); n++; } });
      try { localStorage.setItem("bth-plan-v1", JSON.stringify(plan)); } catch (e) {} track("heatweek-plan");
      if (status) status.innerHTML = lv.length ? `${n ? `Added ${plural(n, "action")} to your plan.` : "Those actions are already in your plan."} <a href="/#plan-step-3">Set who leads and pays</a>` : "Choose some measures first."; }
  });
  box.addEventListener("input", ev => {
    const t = ev.target, s = st();
    if (t.dataset.hwN) { s[t.dataset.hwN] = Math.max(0, +t.value || 0); if (t.dataset.hwN === "hours") box.querySelector("[data-hw-hout]").textContent = s.hours; save(); results(); return; }
    if (t.dataset.hwAmt) { s.sel[t.dataset.hwAmt].amount = Math.max(0, +t.value || 0); save(); results(); return; }
    if (t.dataset.hwF && t.tagName === "INPUT") { const [id, f] = t.dataset.hwF.split(":"); s.sel[id][f] = t.value; save(); shareFresh(); return; }
    if (t.dataset.hwReview !== undefined) { s.review = t.value; save(); shareFresh(); }
  });
  box.addEventListener("toggle", ev => { if (ev.target.classList && ev.target.classList.contains("wk-share")) shareOpen = ev.target.open; }, true);
  box.addEventListener("change", ev => {
    const t = ev.target, s = st();
    if (t.dataset.hwShareWith !== undefined) { shareWith = t.checked; shareFresh(); return; }
    if (t.dataset.hwC) { const [id, c] = t.dataset.hwC.split(":"); s.sel[id].conds[c] = t.checked; refresh(); return; }
    if (t.dataset.hwArr) { s.sel[t.dataset.hwArr].arrive = +t.value; refresh(); return; }
    if (t.dataset.hwF && t.tagName === "SELECT") { const [id, f] = t.dataset.hwF.split(":"); s.sel[id][f] = t.value; refresh(); }
  });
  render();
})();
