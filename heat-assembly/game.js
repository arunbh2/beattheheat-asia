/* The Heat Assembly: the game in the browser. Data: window.HA (heat-assembly/data.js, written by the build). Rules:
   window.HA_ENGINE (heat-assembly/engine.js). The game is a log of decisions kept in the address (#g=...), so a link,
   the back button and a reload all restore it; local storage only remembers the last game as a convenience. Nothing is
   sent anywhere. Runs on /heat-assembly/ and, after a reader presses play, inside the panel on /live-through-a-heatwave/. */
(function () {
  "use strict";
  const H = window.HA, E = window.HA_ENGINE;
  const root = document.querySelector("[data-ha]") || document.querySelector("[data-ha-embed]");
  if (!H || !E || !root || root.dataset.haMounted) return;
  root.dataset.haMounted = "1";
  const EMBED = root.hasAttribute("data-ha-embed");
  const sc = H.sc, T = H.text, KEY = "cs-heat-assembly-v" + sc.v, PIVOT = E.pivotIndex(sc);
  const ROLES = sc.roles, PEOPLE = sc.people.map(p => p.id);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const name = id => T.people[id].name, role = id => T.roles[id].name;
  const days = n => n === 0 ? T.money.zero : n === 1 ? T.money.one : T.money.many.replace("{n}", n);
  const list = a => a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1];
  const track = n => { try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: n, title: n, event: true }); } catch (e) {} };

  // the game: mode, seat, the decision log, the first ending (for the comparison) and the reader's suggestion
  let G = { mode: "", seat: "", log: [], first: null, card: 0, shown: false, cardsDone: false, idea: "", screen: "open", view: -1 };
  let S = E.init(sc), draft = null, notice = "";

  // ---------- saving and restoring: the address first, local storage as a fallback ----------
  function encodeG() {
    const q = new URLSearchParams(); if (G.mode) q.set("m", G.mode); if (G.seat) q.set("s", G.seat);
    if (G.log.length) q.set("g", E.encode(sc, G.log)); if (G.first) q.set("f", E.encode(sc, G.first));
    return q.toString();
  }
  function save(push) {
    if (EMBED) return;
    const h = encodeG(), url = location.pathname + location.search + (h ? "#" + h : "");
    try { if (push) history.pushState({ ha: h, screen: G.screen, view: G.view }, "", url); else history.replaceState({ ha: h, screen: G.screen, view: G.view }, "", url); } catch (e) {}
    try { localStorage.setItem(KEY, h); } catch (e) {}
  }
  function restore(h) {
    const q = new URLSearchParams(h || ""); let ok = true;
    G.mode = q.get("m") === "group" ? "group" : q.get("m") === "solo" ? "solo" : "";
    G.seat = ROLES.indexOf(q.get("s")) > -1 ? q.get("s") : "";
    const lg = q.has("g") ? E.decode(sc, q.get("g")) : [], fs = q.has("f") ? E.decode(sc, q.get("f")) : null;
    if (lg === null || (q.has("f") && fs === null)) ok = false;
    const r = E.run(sc, lg || []); if (r.error) ok = false;
    if (!ok) { G = { mode: "", seat: "", log: [], first: null, card: 0, shown: false, cardsDone: false, idea: "", screen: "open", view: -1 }; S = E.init(sc); notice = T.ui.stale; return false; }
    G.log = lg || []; G.first = fs && !E.run(sc, fs).error ? fs : null; S = r.state;
    G.cardsDone = G.mode === "group" && G.log.length > 0;
    G.screen = !G.mode ? "open" : G.mode === "solo" && !G.seat ? "seat" : G.mode === "group" && !G.cardsDone ? "cards" : E.done(sc, S) ? "end" : "step";
    return true;
  }

  // ---------- small pieces ----------
  const strip = () => `<dl class="ha-strip"><div><dt>${esc(T.ui.budget)}</dt><dd>${S.budget} of ${sc.budget}</dd></div><div><dt>${esc(T.ui.rota)}</dt><dd>${S.rota} of ${sc.rota}</dd></div></dl>`;
  const roundHead = r => `<p class="ha-kicker">${esc(T.ui.round.replace("{n}", r))} · ${esc(T.rounds[r].name)} · ${esc(T.rounds[r].time)}</p>`;
  const says = ids => ids && ids.length ? `<div class="ha-says">${ids.map(id => `<p class="cs-note cs-note--watch"><span class="cs-note__label">${esc(role(id))}${id === G.seat ? " (" + esc(T.ui.you) + ")" : ""}</span>${esc(T.roles[id].fact)}</p>`).join("")}</div>` : "";
  const btn = (attr, label, cls) => `<button type="button" class="btn ${cls || ""}" ${attr}>${esc(label)}</button>`;

  // where each person ended the round, as four places in real text, each with drawn, faceless figures; the words carry the meaning
  function sceneArt(r) {
    const res = S.results[r] || {}, spot = { hall: [], water: [], out: [], home: [] };
    PEOPLE.forEach(id => { const x = res[id]; const k = !x ? (id === "noor" ? "home" : "out") : x.place === "hall" ? "hall" : x.place === "water" ? "water" : x.res === "home" || id === "noor" ? "home" : "out"; spot[k].push(id); });
    const fig = `<svg viewBox="0 0 24 40" width="18" height="30" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="7" r="5"/><path d="M12 12 V26 M12 26 L6 38 M12 26 L18 38 M12 17 L4 23 M12 17 L20 23"/></g></svg>`;
    const place = (k, label) => `<li class="ha-place"><p class="ha-k">${esc(label)}</p>${spot[k].length ? `<ul class="ha-figs">${spot[k].map(id => `<li>${fig}<span>${esc(name(id))}</span></li>`).join("")}</ul>` : `<p class="ha-small">No one</p>`}</li>`;
    return `<ul class="ha-places" aria-label="${r ? "Where everyone ended the round" : "Where everyone is at 11:40"}">${place("hall", T.services.hall)}${place("water", T.services.water)}${place("out", r === 3 ? "At work or in a hot room" : "In the queue and at the stalls")}${place("home", "At home")}</ul>`;
  }

  // ---------- screens ----------
  function viewOpen() {
    return `<section class="ha-screen" aria-labelledby="ha-h"><p class="ha-kicker">${esc(T.opening.clock)} · ${esc(T.opening.place)} <span class="ha-tag">${esc(T.fictional)}</span></p>
      <h2 class="ha-h2" id="ha-h" tabindex="-1">${esc(T.title)}</h2>${sceneArt(0)}
      ${T.opening.lines.map(l => `<p>${esc(l)}</p>`).join("")}
      <div class="ha-modes">${["solo", "group"].map(m => `<div class="ha-mode">${btn(`data-mode="${m}"`, T.modes[m].label, m === "solo" ? "" : "btn--ghost")}<p class="ha-small">${esc(T.modes[m].text)}</p></div>`).join("")}</div></section>`;
  }
  function viewSeat() {
    return `<section class="ha-screen" aria-labelledby="ha-h"><h2 class="ha-h2" id="ha-h" tabindex="-1">${esc(T.ui.pickRole)}</h2>
      <ul class="ha-seats">${ROLES.map(id => `<li class="cs-card"><h3 class="ha-h3">${esc(role(id))}</h3><p>${esc(T.roles[id].can)}</p>${btn(`data-seat="${id}"`, "Take this seat")}</li>`).join("")}</ul></section>`;
  }
  // pass-and-play: the card's words exist in the page only while it is shown
  function viewCards() {
    const id = ROLES[G.card], R = T.roles[id];
    const card = G.shown ? `<div class="cs-card ha-card"><h3 class="ha-h3">${esc(R.name)}</h3><p><b>You can:</b> ${esc(R.can)}</p><p><b>Resource:</b> ${esc(R.resource)}</p><p><b>Constraint:</b> ${esc(R.constraint)}</p><p><b>Something the others need to hear from you:</b> ${esc(R.fact)}</p></div>${btn("data-hide", T.ui.hide)}` : btn("data-show", T.ui.show);
    return `<section class="ha-screen" aria-labelledby="ha-h"><p class="ha-kicker">${G.card + 1} of ${ROLES.length}</p><h2 class="ha-h2" id="ha-h" tabindex="-1">${esc(T.ui.passTo.replace("{role}", R.name))}</h2>${card}</section>`;
  }

  // the decision in front of the table now
  function options(st) {
    const t = st.t, X = T.steps[t];
    const radio = (key, val, o, checked) => `<label class="ha-opt"><input type="radio" name="ha-${key}" value="${val}"${checked ? " checked" : ""}><span><b>${esc(o.label)}</b> <span class="ha-small">${esc(o.cost)}</span></span></label>`;
    const check = (key, o, on) => `<label class="ha-opt"><input type="checkbox" name="ha-${key}"${on ? " checked" : ""}><span><b>${esc(o.label)}</b> <span class="ha-small">${esc(o.cost)}</span></span></label>`;
    if (t === "queue") return `<fieldset class="ha-fs"><legend>${esc(X.h)}</legend>${["rota", "paid", "none", "wait"].map((k, i) => radio("q", k, X.options[k], (draft && draft.via ? draft.via === k : i === 3))).join("")}</fieldset>`;
    if (t === "money") return `<fieldset class="ha-fs"><legend>${esc(X.h)}</legend>${check("relief", X.options.relief, draft && draft.relief)}${check("water", X.options.water, draft && draft.water)}</fieldset>`;
    if (t === "predict") return `<fieldset class="ha-fs"><legend>${esc(X.h)}</legend>${PEOPLE.map(id => `<label class="ha-opt"><input type="checkbox" name="ha-p" value="${id}"${draft && (draft.who || []).indexOf(id) > -1 ? " checked" : ""}><span><b>${esc(name(id))}</b> <span class="ha-small">${esc(T.people[id].tag)}</span></span></label>`).join("")}<label class="ha-opt"><input type="checkbox" name="ha-p" value=""><span><b>${esc(X.notSure)}</b></span></label></fieldset>`;
    if (t === "prep") return `<fieldset class="ha-fs"><legend>${esc(X.h)}</legend>${S.queueFrom ? "" : check("pq", X.queue, draft && draft.queue)}${check("pr", X.relief, draft && draft.relief)}</fieldset>`;
    if (t === "evening" || t === "hire") return `<fieldset class="ha-fs"><legend>${esc(X.h)}</legend>${radio("on", "1", X.on, draft && draft.on)}${radio("on", "0", X.off, !(draft && draft.on))}</fieldset>`;
    if (t === "cover") { const ok = !!S.queueFrom && S.queueFrom <= 4; return `<fieldset class="ha-fs"><legend>${esc(X.h)}</legend>${ok ? ["rota", "paid", "none"].map((k, i) => radio("c", k, X.options[k], draft && draft.via ? draft.via === k : i === 2)).join("") : `<p>${esc(T.errors["no-queue-rule"])}</p>` + radio("c", "none", X.options.none, true)}</fieldset>`; }
    if (t === "roster") return rosterForm(st.round);
    return "";
  }
  // the timetable: one select per person and block, stacked on narrow screens
  function rosterForm(r) {
    const staff = E.staffFor(sc, S, r), blocks = E.blocksFor(r), cur = (draft && draft.r) || defaultRoster(r, staff);
    const opts = (st, b) => [""].concat(sc.blockServices[b].filter(v => st.services.indexOf(v) > -1 && (v !== "water" || (S.waterFrom && S.waterFrom <= r)) && (v !== "hall" || b !== "evening" || S.evening)));
    const reach = { "hall@midday": ["tara", "jeevan"], "hall@afternoon": ["kiran", "jeevan"], "hall@evening": ["tara", "jeevan", "noor"], "child@midday": ["noor"], "child@afternoon": ["noor"], "child@morning": ["noor"], "water@midday": ["hira"], "water@afternoon": ["hira"], "water@morning": ["hira"] };
    const open = E.openSet(cur);
    return `<fieldset class="ha-fs"><legend class="visually-hidden">${esc(T.steps.roster.h)}</legend>
      <div class="ha-roster" role="region" aria-label="${esc(T.steps.roster.h)}" tabindex="0"><table><thead><tr><th scope="col">Staff</th>${blocks.map(b => `<th scope="col">${esc(T.blocks[b])}</th>`).join("")}</tr></thead><tbody>
      ${staff.map(st => `<tr><th scope="row">${esc(T.staff[st.id])} <span class="ha-small">(${st.cap} ${st.cap === 1 ? "block" : "blocks"})</span></th>${blocks.map(b => `<td><label><span class="ha-cell">${esc(T.staff[st.id])}, ${esc(T.blocks[b])}</span><select data-ro="${st.id}|${b}">${opts(st, b).map(v => `<option value="${v}"${((cur[st.id] || {})[b] || "") === v ? " selected" : ""}>${esc(v ? T.services[v] : T.steps.roster.closed)}</option>`).join("")}</select></label></td>`).join("")}</tr>`).join("")}
      </tbody></table></div>
      <p class="ha-k">${esc(T.steps.roster.who)}</p><ul class="ha-plain ha-reach">${blocks.map(b => ["hall", "child", "water"].filter(v => sc.blockServices[b].indexOf(v) > -1).map(v => { const on = open[v + "@" + b], who = (reach[v + "@" + b] || []).map(name);
        return `<li>${esc(T.services[v])}, ${esc(T.blocks[b])}: ${on ? "open, for " + esc(list(who)) : "closed" + (who.length ? ", so not for " + esc(list(who)) : "")}</li>`; }).join("")).join("")}</ul></fieldset>`;
  }
  function defaultRoster(r, staff) {
    const d = {}; const has = id => staff.some(s => s.id === id);
    if (r === 3) { d.caretaker = S.evening ? { evening: "hall" } : { morning: "child" }; d.attendant = { morning: S.evening ? "child" : (S.waterFrom ? "water" : "child") }; if (d.attendant.morning === d.caretaker.morning) d.attendant = {}; }
    else { d.caretaker = { midday: "hall", afternoon: "child" }; d.attendant = { midday: "child" }; }
    if (has("relief")) d.relief = r === 3 ? {} : {};
    Object.keys(d).forEach(k => { if (!Object.keys(d[k]).length) delete d[k]; });
    return d;
  }
  // read the form into an action
  function readForm(st) {
    const f = root.querySelector("[data-ha-form]"), t = st.t, a = { t: t };
    const val = n => { const x = f.querySelector(`input[name="ha-${n}"]:checked`); return x ? x.value : ""; };
    const on = n => { const x = f.querySelector(`input[name="ha-${n}"]`); return !!(x && x.checked); };
    if (t === "queue") a.via = val("q") || "wait";
    if (t === "money") { a.relief = on("relief") ? 1 : 0; a.water = on("water") ? 1 : 0; }
    if (t === "predict") a.who = [].slice.call(f.querySelectorAll('input[name="ha-p"]:checked')).map(x => x.value).filter(Boolean);
    if (t === "prep") { a.queue = on("pq") ? 1 : 0; a.relief = on("pr") ? 1 : 0; }
    if (t === "evening" || t === "hire") a.on = val("on") === "1";
    if (t === "cover") a.via = val("c") || "none";
    if (t === "roster") { a.r = {}; [].slice.call(f.querySelectorAll("select[data-ro]")).forEach(s => { if (!s.value) return; const [who, b] = s.dataset.ro.split("|"); (a.r[who] = a.r[who] || {})[b] = s.value; }); }
    return a;
  }
  // the agreements panel: whose consent and resources the proposal needs, and the answers
  function consentPanel(a) {
    const need = E.needs(sc, a), c = E.cost(sc, a);
    if (!need.length) return "";
    const head = `<p class="ha-k">${esc(T.ui.needsAgreement)}: ${esc(list(need.map(role)))}${c ? ` · ${c} ${c === 1 ? "unit" : "units"} of budget` : ""}</p>`;
    if (G.mode === "group") return head + `<div class="ha-votes">${need.map(id => `<fieldset class="ha-vote"><legend>${esc(role(id))}</legend><label><input type="radio" name="ha-v-${id}" value="1"${a.consent && a.consent[id] === true ? " checked" : ""}> ${esc(T.ui.agree)}</label> <label><input type="radio" name="ha-v-${id}" value="0"${a.consent && a.consent[id] === false ? " checked" : ""}> ${esc(T.ui.decline)}</label></fieldset>`).join("")}</div>`;
    return head + `<ul class="ha-plain ha-replies">${need.map(id => { if (id === G.seat) return `<li><b>${esc(role(id))} (${esc(T.ui.you)}):</b> ${esc(T.ui.agreed)}.</li>`;
      const r = E.respond(sc, S, a, id); let txt = T.replies[r.id] || T.replies.ok; if (r.v) Object.keys(r.v).forEach(k => { txt = txt.replace("{" + k + "}", r.v[k]); });
      return `<li class="${r.ok ? "" : "is-no"}"><b>${esc(role(id))}:</b> ${r.ok ? "" : `<span class="ha-flag">${esc(T.ui.notAgreed)}.</span> `}${esc(txt)}</li>`; }).join("")}</ul>`;
  }
  function consentFor(a) {
    const out = {}, need = E.needs(sc, a);
    if (G.mode === "group") { need.forEach(id => { const x = root.querySelector(`input[name="ha-v-${id}"]:checked`); if (x) out[id] = x.value === "1"; }); return out; }
    need.forEach(id => { out[id] = id === G.seat ? true : E.respond(sc, S, a, id).ok; });
    return out;
  }

  function viewStep() {
    const st = E.stepOf(sc, S), X = T.steps[st.t], r = st.round;
    const ro = G.view > -1 && G.view < G.log.length;   // looking back at a decision already made
    if (!draft || draft.t !== st.t) draft = { t: st.t };
    const proposal = draft.proposed ? consentPanel(draft) : "";
    const err = draft.error ? `<p class="ha-err" role="alert">${esc(draft.error)}</p>` : "";
    return `<section class="ha-screen" aria-labelledby="ha-h">${roundHead(r)}${strip()}
      <h2 class="ha-h2" id="ha-h" tabindex="-1">${esc(X.h)}</h2>${r === 1 && st.t === "queue" ? sceneArt(0) : ""}
      <p>${esc(X.intro)}</p>${says(X.reveal)}
      <form data-ha-form novalidate>${options(st)}${err}${proposal}
        <div class="ha-actions">${draft.proposed ? btn("data-confirm", T.ui.confirm) + btn("data-revise", T.ui.revise, "btn--ghost") : btn("data-propose", E.needs(sc, readSafe(st)).length ? T.ui.propose : T.ui.continue)}</div></form>
      ${ro ? "" : ""}</section>`;
  }
  const readSafe = st => { try { return root.querySelector("[data-ha-form]") ? readForm(st) : Object.assign({ t: st.t }, draft); } catch (e) { return { t: st.t }; } };

  // after a round: one short scene, the ledger and a "why" for each person, all generated from the state
  function sceneLines(r) {
    const L = E.ledger(sc, S, r), br = L.people.filter(p => p.res === "break").map(p => name(p.id)), own = L.people.filter(p => p.res === "own").map(p => name(p.id));
    const lost = L.people.filter(p => p.delta < 0).map(p => name(p.id)), short = L.people.filter(p => p.short).map(p => name(p.id));
    const out = [];
    out.push(br.length ? `${list(br)} took a break in a cool place.` : "Nobody took a break in a cool place.");
    if (own.length) out.push(`${list(own)} went anyway, paying from the household's reserve.`);
    if (lost.length) out.push(`${list(lost)} ended the ${r === 3 ? "night" : "day"} with less money.`);
    if (short.length) out.push(`${list(short)} had no reserve left to cover it.`);
    const hall = L.services.filter(s => s.id === "hall")[0];
    if (hall && hall.funded && !hall.open.length) out.push("The hall was paid for, and nobody was on to open it.");
    else if (hall && hall.open.length && !hall.usable.length) out.push("The hall was open, and nobody could use it.");
    return out;
  }
  function ledgerTable(r) {
    const L = E.ledger(sc, S, r), Lg = T.ledger;
    const earn = p => p.delta === 0 ? "No change" : p.delta < 0 ? "Lost " + days(-p.delta) : "Recovered " + days(p.delta);
    const what = p => (T.results[p.res] || p.res) + (p.place && p.place !== "home" ? ` (${T.services[p.place].toLowerCase()}, ${T.blocks[p.block] || ""})` : "");
    const svc = L.services.map(s => `<tr><th scope="row">${esc(T.services[s.id])}</th><td>${s.funded ? Lg.yes : Lg.no}</td><td>${s.open.length ? esc(s.open.map(b => T.blocks[b]).join(", ")) : Lg.no}</td><td>${s.usable.length ? esc(list(s.usable.map(name))) : Lg.none}</td></tr>`).join("");
    return `<div class="ha-table" role="region" aria-label="Ledger, round ${r}" tabindex="0"><table><caption class="visually-hidden">Ledger, round ${r}</caption><thead><tr><th scope="col">${Lg.person}</th><th scope="col">${Lg.what}</th><th scope="col">${Lg.earn}</th><th scope="col">${Lg.reserve}</th></tr></thead><tbody>
      ${L.people.map(p => `<tr><th scope="row">${esc(name(p.id))}</th><td>${esc(what(p))}</td><td>${esc(earn(p))}${p.short ? ", with nothing left to draw on" : ""}</td><td>${p.after} of ${sc.reserve.max}</td></tr>`).join("")}</tbody></table></div>
      <div class="ha-table" role="region" aria-label="Services, round ${r}" tabindex="0"><table><thead><tr><th scope="col">${Lg.service}</th><th scope="col">${Lg.funded}</th><th scope="col">${Lg.open}</th><th scope="col">${Lg.usable}</th></tr></thead><tbody>${svc}</tbody></table></div>
      <p class="ha-small">${esc(Lg.left)}: ${esc(T.ui.budget).toLowerCase()} ${L.budget} of ${sc.budget}, ${esc(T.ui.rota).toLowerCase()} ${L.rota} of ${sc.rota}.</p>`;
  }
  function whyList(r, s) {
    s = s || S;
    return `<div class="ha-whys">${PEOPLE.map(id => { const tr = E.trace(sc, s, id, r); if (!tr.length) return "";
      return `<details class="ha-why"><summary>${esc(T.why)} ${esc(name(id))}</summary><ol>${tr.map(x => x.kind === "decision" ? `<li><b>Decision:</b> ${esc(T.decisions[x.why] || x.why)}${describe(s.log[x.log])}</li>`
        : x.kind === "constraint" ? `<li><b>Constraint:</b> ${esc(T.constraints[x.id] || x.id)}</li>`
        : `<li><b>Result:</b> ${esc(T.results[x.id] || x.id)}; ${x.delta === 0 ? "earnings unchanged" : x.delta < 0 ? "lost " + esc(days(-x.delta)) : "recovered " + esc(days(x.delta))}; reserve ${x.before} to ${x.after}${x.short ? ", with a day that could not be covered" : ""}.</li>`).join("")}</ol></details>`; }).join("")}</div>`;
  }
  // a decision, in words, for the trace and the summary
  function describe(a) {
    if (!a) return "";
    if (a.t === "queue") return ": " + (a.via === "wait" ? T.steps.queue.options.wait.label : T.steps.queue.options[a.via].label).toLowerCase() + ".";
    if (a.t === "cover") return ": " + T.steps.cover.options[a.via].label.toLowerCase() + ".";
    if (a.t === "evening") return ": " + (a.on ? T.steps.evening.on.label : T.steps.evening.off.label).toLowerCase() + ".";
    if (a.t === "money") return a.water ? ": a water point at the bay." : ".";
    if (a.t === "roster") { const o = E.openSet(a.r); const k = Object.keys(o); return ": " + (k.length ? k.map(x => { const [v, b] = x.split("@"); return T.services[v].toLowerCase() + " " + T.blocks[b]; }).join(", ") : "nothing open") + "."; }
    return ".";
  }
  function viewResult(r) {
    return `<section class="ha-screen" aria-labelledby="ha-h">${roundHead(r)}<h2 class="ha-h2" id="ha-h" tabindex="-1">How ${r === 3 ? "the night" : "the day"} went</h2>
      ${sceneArt(r)}<p class="ha-scene-text">${esc(sceneLines(r).join(" "))}</p>${ledgerTable(r)}${whyList(r)}
      ${r === 2 ? `<p class="cs-note cs-note--example"><span class="cs-note__label">Simplifying assumption</span>${esc(T.assumptions[1].text)}</p>` : ""}
      <div class="ha-actions">${btn("data-next", T.ui.continue)}</div></section>`;
  }

  // the end: each person's game in words, the expectation beside what happened, the replay and the comparison
  function personLine(s, id) {
    const o = E.outcome(sc, s, id), b = o.breaks.length;
    return `${b ? `A break in a cool place in ${b} of 3 rounds` : "No break in a cool place in any round"}; ${o.lost ? "lost " + days(o.lost) : "no earnings lost"}; reserve ${o.reserve} of ${sc.reserve.max}${o.short ? `; ${o.short === 1 ? "one day" : o.short + " days"} the household could not cover` : ""}.`;
  }
  function viewEnd() {
    const pred = S.predict, r2 = S.results[2] || {}, cmp = G.first && JSON.stringify(G.first) !== JSON.stringify(G.log);
    const expect = pred ? `<h3 class="ha-h3">${esc(T.end.expect)}</h3><ul class="ha-plain">${PEOPLE.map(id => { const e = pred.indexOf(id) > -1, got = r2[id] && r2[id].res === "break";
      return `<li><b>${esc(name(id))}:</b> ${esc(e ? T.end.expectedYes : T.end.expectedNo)} ${esc(e === got ? T.end.matched : T.end.differed)}</li>`; }).join("")}</ul>` : "";
    let compare = "";
    if (cmp) {
      const A = E.run(sc, G.first).state, D = E.diff(sc, A, S), ch = D.filter(d => !d.same);
      compare = `<h3 class="ha-h3">${esc(T.end.compareH)}</h3><div class="ha-table" role="region" aria-label="${esc(T.end.compareH)}" tabindex="0"><table><thead><tr><th scope="col">${T.ledger.person}</th><th scope="col">${esc(T.end.compareA)}</th><th scope="col">${esc(T.end.compareB)}</th></tr></thead><tbody>
        ${PEOPLE.map(id => { const d = D.filter(x => x.id === id)[0]; return `<tr><th scope="row">${esc(name(id))}${d.same ? "" : " <span class=\"ha-flag\">changed</span>"}</th><td>${esc(personLine(A, id))}</td><td>${esc(personLine(S, id))}</td></tr>`; }).join("")}</tbody></table></div>
        <p>${esc(ch.length ? T.end.changed.replace("{names}", list(ch.map(d => name(d.id)))) : T.end.unchanged)}</p>
        ${ch.length ? `<p class="ha-k">The first hot day, in each ending</p><div class="ha-cmp"><div><p class="ha-k">${esc(T.end.compareA)}</p>${whyList(2, A)}</div><div><p class="ha-k">${esc(T.end.compareB)}</p>${whyList(2, S)}</div></div>` : ""}`;
    }
    const plan = `/plan/?cards=${T.plan.join(",")}#plan-step-3`;
    return `<section class="ha-screen" aria-labelledby="ha-h"><h2 class="ha-h2" id="ha-h" tabindex="-1">${esc(T.end.h)}</h2><p>${esc(T.end.intro)}</p>
      <ul class="ha-out">${PEOPLE.map(id => `<li class="cs-card"><h3 class="ha-h3">${esc(name(id))}, ${esc(T.people[id].tag.charAt(0).toLowerCase() + T.people[id].tag.slice(1))}</h3><p>${esc(personLine(S, id))}</p></li>`).join("")}</ul>
      <p class="cs-note cs-note--limit"><span class="cs-note__label">Blind spot</span>${esc(T.end.blindSpot)}</p>
      ${expect}${compare}
      ${G.first ? "" : `<h3 class="ha-h3">${esc(T.end.replayH)}</h3><p>${esc(T.end.replayText)}</p><div class="ha-actions">${btn("data-replay", T.end.replay)}</div>`}
      <h3 class="ha-h3">${esc(T.end.suggestH)}</h3><label class="ha-idea"><span>${esc(T.end.suggestText)}</span><textarea data-idea rows="3">${esc(G.idea)}</textarea></label>
      <p class="ha-question">${esc(T.end.question)}</p>
      <div class="ha-actions">${btn("data-copy", T.end.copy)}${btn("data-restart", T.end.restart, "btn--ghost")}</div>
      <h3 class="ha-h3">${esc(T.end.explore)}</h3><p>${T.links.map(([u, t]) => `<a href="${u}">${esc(t)}</a>`).join(" · ")} · <a href="${plan}">${esc(T.end.plan)}</a></p></section>`;
  }
  function summary() {
    const L = [`${T.title} (${T.fictional.toLowerCase()} market town): a summary of one game`, `Played ${G.mode === "group" ? "together" : "alone, as the " + role(G.seat).toLowerCase()}.`, ""];
    L.push("Decisions:"); S.log.forEach(a => { if (a.t !== "predict") L.push(`- ${T.decisions[a.t] || T.steps[a.t].h}${describe(a)}`); });
    L.push("", "Outcomes:"); PEOPLE.forEach(id => L.push(`- ${name(id)}, ${T.people[id].tag.toLowerCase()}: ${personLine(S, id)}`));
    if (G.first && JSON.stringify(G.first) !== JSON.stringify(G.log)) { const A = E.run(sc, G.first).state, ch = E.diff(sc, A, S).filter(d => !d.same); L.push("", "Replayed from the first hot day's timetable. " + (ch.length ? T.end.changed.replace("{names}", list(ch.map(d => name(d.id)))) : T.end.unchanged)); }
    L.push("", T.end.blindSpot);
    if (G.idea.trim()) L.push("", "A change suggested at the table (not played out): " + G.idea.trim());
    L.push("", "For discussion: " + T.end.question, "", "Every number in the game is a game mechanic. " + location.origin + "/heat-assembly/");
    return L.join("\n");
  }

  // ---------- render and focus ----------
  let say = null;
  function render(focus) {
    let html = "";
    if (notice) html += `<p class="cs-note cs-note--watch" role="status">${esc(notice)}</p>`;
    if (G.screen === "open") html += viewOpen();
    else if (G.screen === "seat") html += viewSeat();
    else if (G.screen === "cards") html += viewCards();
    else if (G.screen === "result") html += viewResult(G.resultRound);
    else if (G.screen === "end") html += viewEnd();
    else if (G.screen === "embed-done") html += `<section class="ha-screen" aria-labelledby="ha-h"><h2 class="ha-h2" id="ha-h" tabindex="-1">${esc(T.rounds[1].name)}: decided</h2><p>${esc(sceneLinesForQueue())}</p><p><a class="btn" href="/heat-assembly/#${encodeG()}">${esc(T.ui.fullscreen)}</a></p></section>`;
    else html += viewStep();
    root.innerHTML = html + `<p class="visually-hidden" role="status" aria-live="polite" data-say></p>`;
    say = root.querySelector("[data-say]");
    // an instant jump to the new heading: a smooth scroll upward reads as leaving the page to the site's exit card
    if (focus !== false) { const h = root.querySelector("#ha-h"), sec = root.querySelector(".ha-screen") || h; if (h) { h.focus({ preventScroll: true }); try { sec.scrollIntoView({ block: "start", behavior: "auto" }); } catch (e) { sec.scrollIntoView(); } } }
  }
  const sceneLinesForQueue = () => { const a = G.log[0]; return a ? T.decisions.queue + describe(a) : ""; };
  const announce = t => { if (say) { say.textContent = ""; setTimeout(() => { say.textContent = t; }, 30); } };
  const go = (screen, push) => { G.screen = screen; draft = null; save(push !== false); render(); };

  // commit an action through the engine: never more than it allows
  function commit(a) {
    const o = E.apply(sc, S, a);
    if (o.error) { draft = Object.assign({}, a, { proposed: !!E.needs(sc, a).length, error: (o.error === "consent" ? T.ui.notAgreedBy + " " + list((o.unmet || []).map(role)) + "." : T.errors[o.error] || o.error) }); render(false); announce(draft.error); return false; }
    S = o.state; G.log = S.log.slice(); draft = null; notice = "";
    track("heat-assembly-" + a.t);
    const st = a.t, r = E.roundOf(sc, { step: S.step - 1 });
    if (EMBED && st === "queue") { G.screen = "embed-done"; render(); return true; }
    const settled = (st === "roster" && (S.results[2] && !G.seen2 || false)) ;
    if (st === "roster" && S.step - 1 === stepIndex(2, "roster")) { G.resultRound = 2; go("result"); }
    else if (st === "roster" && S.step - 1 === stepIndex(3, "roster")) { G.resultRound = 3; go("result"); }
    else if (st === "cover") { G.resultRound = 4; go("result"); }
    else go("step");
    announce(`${T.ui.agreed}. ${T.ui.budget}: ${S.budget} of ${sc.budget}. ${T.ui.rota}: ${S.rota} of ${sc.rota}.`);
    return settled || true;
  }
  const stepIndex = (r, t) => { for (let i = 0; i < sc.steps.length; i++) if (sc.steps[i].round === r && sc.steps[i].t === t) return i; return -1; };

  // ---------- events ----------
  root.addEventListener("click", ev => {
    const b = ev.target.closest("button"); if (!b || !root.contains(b)) return;
    if (b.dataset.mode) { G.mode = b.dataset.mode; track("heat-assembly-" + G.mode); go(G.mode === "solo" ? "seat" : "cards"); return; }
    if (b.dataset.seat) { G.seat = b.dataset.seat; go("step"); return; }
    if (b.hasAttribute("data-show")) { G.shown = true; render(); return; }
    if (b.hasAttribute("data-hide")) { G.shown = false; G.card++; if (G.card >= ROLES.length) { G.cardsDone = true; go("step"); } else render(); return; }
    const st = E.stepOf(sc, S);
    if (b.hasAttribute("data-propose")) { ev.preventDefault(); const a = readForm(st); a.consent = {}; const need = E.needs(sc, a);
      if (!need.length) { commit(Object.assign(a, { consent: {} })); return; }
      draft = Object.assign(a, { proposed: true }); render(false); const p = root.querySelector(".ha-replies, .ha-votes"); if (p) { p.setAttribute("tabindex", "-1"); p.focus(); }
      announce(G.mode === "group" ? T.ui.needsAgreement + ": " + list(need.map(role)) : [].slice.call(root.querySelectorAll(".ha-replies li")).map(li => li.textContent).join(" ")); return; }
    if (b.hasAttribute("data-revise")) { ev.preventDefault(); draft = Object.assign(readForm(st), { proposed: false }); render(false); const f = root.querySelector("[data-ha-form] input, [data-ha-form] select"); if (f) f.focus(); return; }
    if (b.hasAttribute("data-confirm")) { ev.preventDefault(); b.disabled = true; const a = Object.assign({}, draft); delete a.proposed; delete a.error; a.consent = consentFor(a);
      const no = E.needs(sc, a).filter(id => a.consent[id] !== true);
      if (no.length) { b.disabled = false; draft.consent = a.consent; draft.error = T.ui.notAgreedBy + " " + list(no.map(role)) + "."; render(false); announce(draft.error); return; }
      commit(a); return; }
    if (b.hasAttribute("data-next")) { go(E.done(sc, S) ? "end" : "step"); return; }
    if (b.hasAttribute("data-replay")) { G.first = G.log.slice(); const r = E.run(sc, G.log.slice(0, PIVOT)); S = r.state; G.log = S.log.slice(); track("heat-assembly-replay"); go("step"); return; }
    if (b.hasAttribute("data-copy")) { const t = summary(); const done = () => { b.textContent = T.end.copied; announce(T.end.copied); };
      (navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(t) : Promise.reject()).then(done, () => { const ta = document.createElement("textarea"); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); done(); } catch (e) {} ta.remove(); }); return; }
    if (b.hasAttribute("data-restart")) { G = { mode: "", seat: "", log: [], first: null, card: 0, shown: false, cardsDone: false, idea: "", screen: "open", view: -1 }; S = E.init(sc); notice = "";
      try { localStorage.removeItem(KEY); } catch (e) {} try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {} render(); return; }
  });
  root.addEventListener("change", ev => {
    if (ev.target.matches("select[data-ro]")) { const st = E.stepOf(sc, S); const a = readForm(st); draft = Object.assign(draft || {}, { t: st.t, r: a.r, proposed: false, error: "" });
      const e = E.checkRoster(sc, S, st.round, a.r); if (e) draft.error = T.errors[e] || e; const id = ev.target.dataset.ro; render(false); const s = root.querySelector(`select[data-ro="${id}"]`); if (s) s.focus(); return; }
    if (ev.target.matches('[data-ha-form] input') && !/^ha-v-/.test(ev.target.name) && draft && draft.proposed) { draft.proposed = false; const pos = ev.target.name + "|" + ev.target.value; const st = E.stepOf(sc, S); draft = Object.assign(readForm(st), { proposed: false }); render(false);
      const back = root.querySelector(`input[name="${ev.target.name}"][value="${ev.target.value}"]`) || root.querySelector(`input[name="${ev.target.name}"]`); if (back) back.focus(); void pos; }
  });
  root.addEventListener("input", ev => { if (ev.target.matches("[data-idea]")) G.idea = ev.target.value.slice(0, 600); });
  root.addEventListener("submit", ev => ev.preventDefault());
  // the back button: each screen is a history entry carrying the whole game, so going back restores that moment
  if (!EMBED) window.addEventListener("popstate", ev => {
    const h = ev.state && typeof ev.state.ha === "string" ? ev.state.ha : location.hash.slice(1);
    const keepFirst = G.first, idea = G.idea; restore(h); if (!G.first && keepFirst && h.indexOf("f=") > -1) G.first = keepFirst; G.idea = idea;
    if (ev.state && ev.state.screen && ev.state.screen !== "result") G.screen = ev.state.screen === "end" && !E.done(sc, S) ? "step" : ev.state.screen;
    if (ev.state && ev.state.screen === "result") { G.screen = "result"; G.resultRound = [4, 3, 2].filter(r => S.results[r])[0] || 2; }
    draft = null; render();
  });

  // ---------- start ----------
  if (!EMBED) {
    const h = location.hash.slice(1); let from = h;
    if (!from) { try { from = localStorage.getItem(KEY) || ""; } catch (e) { from = ""; } }
    if (from) restore(from);
    save(false);
  }
  render(EMBED);
})();
