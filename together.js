/* Common Shade: Make it work together (part 33 of data.js), on its own page (/together/).
   A coordinator's simulation for any NGO or volunteer group: choose a hypothetical place, see what heat means for the
   people who work there, find who has to say yes, build the delivery chain for each measure, run a hot week and see
   what reached people. A requirement counts only at the status it needs, and "agreed" or beyond only with evidence.
   It adds up hours and pay; it never scores and never predicts illness. */
(function () {
  "use strict";
  const box = document.getElementById("tg"); if (!box || typeof PLACE_SIM === "undefined") return;
  const T = PLACE_SIM, KEY = "bth-together-v1", ST = T.statuses.map(s => s.id), rank = id => ST.indexOf(id);
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const extLink = (url, text) => `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(text)}<span class="visually-hidden"> (opens in a new tab)</span>&nbsp;<span aria-hidden="true">↗</span></a>`;
  const plural = (n, one, many) => `${n} ${n === 1 ? one : (many || one + "s")}`;
  const track = name => { try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: name, title: name, event: true }); } catch (e) {} };
  const GC = typeof SITE_ANALYTICS !== "undefined" && /^[a-z0-9-]+$/.test(SITE_ANALYTICS.goatcounter || "") ? SITE_ANALYTICS.goatcounter : "";
  if (GC) { const sc = document.createElement("script"); sc.async = true; sc.src = "https://gc.zgo.at/count.js"; sc.dataset.goatcounter = `https://${GC}.goatcounter.com/count`; document.head.appendChild(sc); }
  const days = n => { const r = Math.round(n * 10) / 10; return `${r.toLocaleString()} day${r === 1 ? "" : "s"}’ pay`; };
  const money = n => "US$" + Math.round(n).toLocaleString("en-US");

  let S = { sc: T.scenarios[0].id, step: 1, per: {} };
  try { const v = JSON.parse(localStorage.getItem(KEY) || "null"); if (v && v.per) S = Object.assign(S, v); } catch (e) {}
  try { const q = new URLSearchParams(location.search).get("place"); if (q && T.scenarios.some(s => s.id === q)) S.sc = q; } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  const sc = () => T.scenarios.find(s => s.id === S.sc) || T.scenarios[0];
  const fresh = () => ({ place: "", boundary: "", names: {}, roles: {}, actors: {}, confirmed: {}, notes: {}, missing: [], sel: {}, req: {}, pay: {}, routine: { escalate: "", feedback: "", check: "" }, checks: {}, survive: {} });
  const st = () => S.per[S.sc] || (S.per[S.sc] = fresh());
  const person = p => ({ ...p, name: st().names[p.id] || p.name, role: st().roles[p.id] || p.role });
  const actorName = id => { const a = sc().actors.find(x => x.id === id); return st().actors[id] || (a ? a.name : id); };
  const rq = (m, r) => st().req[`${m.id}:${r.id}`] || { owner: r.owner, status: "proposed", ev: "" };
  // what a requirement counts as: "agreed" or beyond only with evidence of it
  const counts = x => rank(x.status) >= rank("agreed") && !String(x.ev || "").trim() ? "discussed" : x.status;
  const met = (m, r) => rank(counts(rq(m, r))) >= rank(r.need);
  const chosen = () => sc().measures.filter(m => st().sel[m.id]);

  /* ---- the hot week: which measures work on which day, and what that means for each person ---- */
  function week(withPkg) {
    const P = sc().people, ms = withPkg ? chosen() : [];
    const works = (m, d) => m.reqs.every(r => met(m, r) || d < r.from);
    const firstFail = (m, d) => m.reqs.filter(r => !met(m, r) && d >= r.from).sort((a, b) => a.from - b.from)[0];
    const out = P.map(p => ({ p: person(p), days: [], expo: 0, loss: 0, base: { expo: p.expo * 5, loss: p.loss * 5 } }));
    for (let d = 1; d <= 5; d++) out.forEach((o, i) => {
      const p = P[i]; let expo = p.expo, loss = p.loss; const got = [], broke = [];
      ms.forEach(m => { const h = m.helps[p.id]; if (!h) return;
        if (works(m, d)) { if (h.once) { if (d === 1) loss -= h.loss; } else { expo -= h.expo || 0; loss -= h.loss || 0; } got.push(m); }
        else { const f = firstFail(m, d); if (f && d === Math.max(1, f.from)) broke.push({ m, r: f }); } });
      expo = Math.max(1, expo); o.expo += expo; o.loss += loss; o.days.push({ d, expo, loss, got, broke, care: got.some(m => m.care) });
    });
    out.forEach(o => { o.loss = Math.max(0, o.loss); });
    return out;
  }
  const failures = () => { const seen = new Set(), list = [];
    chosen().forEach(m => m.reqs.forEach(r => { if (met(m, r)) return; const k = m.id + r.id; if (seen.has(k)) return; seen.add(k); list.push({ m, r, x: rq(m, r) }); }));
    return list.sort((a, b) => a.r.from - b.r.from); };

  /* ---- drawings: flat, faceless figures in the site's line style ---- */
  const fig = (x, y, s = 1, extra = "") => `<g transform="translate(${x},${y}) scale(${s})" stroke="#16202B" stroke-width="5" stroke-linecap="round" fill="none"><circle cx="0" cy="-46" r="11"/><path d="M0 -35 V2 M-15 -20 L0 -28 L15 -20 M0 2 L-10 30 M0 2 L10 30"/>${extra}</g>`;
  const SCENES = {
    vendor: `<path d="M60 52 Q100 26 140 52 Z" fill="#2A9D8F" stroke="#16202B" stroke-width="4"/><path d="M100 52 V88" stroke="#16202B" stroke-width="4"/><rect x="56" y="84" width="88" height="14" fill="#C8553D" stroke="#16202B" stroke-width="4"/><circle cx="72" cy="80" r="6" fill="#3E8E41"/><circle cx="88" cy="79" r="6" fill="#F2C14E"/><circle cx="104" cy="80" r="6" fill="#D7263D"/>${fig(176, 84)}`,
    loader: `<rect x="20" y="58" width="80" height="44" fill="#9AA3AD" stroke="#16202B" stroke-width="4"/><circle cx="40" cy="106" r="9" fill="#fff" stroke="#16202B" stroke-width="4"/><circle cx="84" cy="106" r="9" fill="#fff" stroke="#16202B" stroke-width="4"/><rect x="138" y="22" width="40" height="22" rx="5" fill="#D8B585" stroke="#16202B" stroke-width="4"/>${fig(158, 92)}`,
    sweeper: `<path d="M150 112 L196 54" stroke="#8C6A3F" stroke-width="5"/><path d="M140 112 L162 104 L156 118 Z" fill="#8C6A3F"/>${fig(120, 86)}<rect x="30" y="92" width="34" height="20" fill="#9AA3AD" stroke="#16202B" stroke-width="4"/>`,
    sewer: `<rect x="30" y="50" width="180" height="62" fill="#FCE7D6" stroke="#16202B" stroke-width="4"/><path d="M22 50 L120 32 L218 50 Z" fill="#9AA3AD" stroke="#16202B" stroke-width="4" stroke-linejoin="round"/><rect x="104" y="86" width="64" height="8" fill="#16202B"/><path d="M114 86 V72 H150 V86 M142 72 V80" stroke="#16202B" stroke-width="4" fill="none"/><g transform="translate(88,108) scale(.75)" stroke="#16202B" stroke-width="5" stroke-linecap="round" fill="none"><circle cx="0" cy="-46" r="11"/><path d="M0 -35 V-5 M0 -22 L26 -22 M0 -5 L20 -5 L20 12"/></g>`,
    ironer: `<rect x="60" y="80" width="110" height="10" fill="#16202B"/><path d="M110 74 Q124 62 140 74 Z" fill="#9AA3AD" stroke="#16202B" stroke-width="3"/><path d="M118 58 q4 -8 0 -14 M130 58 q4 -8 0 -14" stroke="#fff" stroke-width="3" fill="none" opacity=".9"/>${fig(186, 86)}`,
    rider: `<circle cx="76" cy="100" r="15" fill="none" stroke="#16202B" stroke-width="4"/><circle cx="156" cy="100" r="15" fill="none" stroke="#16202B" stroke-width="4"/><path d="M76 100 L100 78 H138 L156 100 M138 78 L146 62" stroke="#16202B" stroke-width="4" fill="none" stroke-linejoin="round"/><rect x="66" y="58" width="34" height="24" rx="3" fill="#F2C14E" stroke="#16202B" stroke-width="3"/><g transform="translate(118,78) scale(.7)" stroke="#16202B" stroke-width="5" stroke-linecap="round" fill="none"><circle cx="0" cy="-46" r="12"/><path d="M0 -34 V0 M0 -24 L36 -22 M0 0 L22 8 L26 30"/></g>`,
    labourer: `<rect y="84" width="240" height="56" fill="#E9C46A"/>${[...Array(10)].map((_, i) => `<path d="M${10 + i * 24} 104 v-18" stroke="#B5892E" stroke-width="3"/>`).join("")}${fig(120, 84, .8, `<path d="M15 -20 L30 -6" />`)}`,
    farmer: `<rect y="84" width="240" height="56" fill="#8CC5BC"/>${[...Array(9)].map((_, i) => `<path d="M${18 + i * 24} 100 v-16 m0 6 l-6 -8 m6 8 l6 -8" stroke="#3E8E41" stroke-width="3" fill="none" stroke-linecap="round"/>`).join("")}<path d="M106 36 L120 28 L134 36 Z" fill="#F2C14E" stroke="#16202B" stroke-width="3" stroke-linejoin="round"/>${fig(120, 84, .75)}`,
    carrier: `<rect x="160" y="70" width="12" height="42" fill="#9AA3AD" stroke="#16202B" stroke-width="3"/><path d="M150 70 H182" stroke="#16202B" stroke-width="4"/>${fig(100, 86, .9)}<ellipse cx="100" cy="30" rx="14" ry="8" fill="#C8553D" stroke="#16202B" stroke-width="3"/>`
  };
  const scene = k => `<svg viewBox="0 0 240 140" aria-hidden="true" class="tg-scene"><rect width="240" height="140" fill="#F8D9B8"/><circle cx="205" cy="26" r="15" fill="#F26430"/><rect y="112" width="240" height="28" fill="#D8B585"/>${SCENES[k] || fig(120, 86)}</svg>`;

  /* ---- the strip that stays on every step: what the hot week means for each person ---- */
  function strip() {
    const base = week(false), pkg = week(true), any = chosen().length;
    return `<div class="tg-strip" aria-live="polite">${base.map((b, i) => { const k = pkg[i], cut = b.expo - k.expo;
      return `<div class="tg-who"><p class="tg-who__n"><b>${esc(b.p.name)}</b> ${esc(b.p.role.toLowerCase())}</p>
        <p class="tg-who__k">Hours in dangerous heat this week</p>
        <div class="tg-bar" role="img" aria-label="${b.expo} hours without help${any ? `, ${k.expo} with the package` : ""}"><span class="tg-bar__b" style="width:${(b.expo / 40 * 100).toFixed(0)}%"></span>${any ? `<span class="tg-bar__p" style="width:${(k.expo / 40 * 100).toFixed(0)}%"></span>` : ""}</div>
        <p class="tg-who__v">${any ? `<b>${k.expo}</b> hours, down from ${b.expo}${cut ? "" : " (nothing has reached them yet)"}` : `<b>${b.expo}</b> hours`}</p>
        <p class="tg-who__v">${b.p.lossNote && !b.base.loss ? esc(b.p.lossNote) : `Pay lost: <b>${days(any ? k.loss : b.loss)}</b>${any && k.loss < b.loss ? `, down from ${days(b.loss)}` : ""}`}</p></div>`; }).join("")}</div>`;
  }

  const STEPS = T.capabilities;
  function stepNav() {
    return `<ol class="tg-steps" role="list">${STEPS.map(c => `<li><button type="button" class="tg-step${S.step === c.step ? " is-on" : ""}" data-tg-step="${c.step}" aria-current="${S.step === c.step ? "step" : "false"}"><span>${c.step}</span><b>${esc(c.name)}</b></button></li>`).join("")}</ol>`;
  }
  const out = (c, html) => `<div class="tg-out"><p class="tg-out__k">What this step gives you: ${esc(c.output)}</p>${html}</div>`;

  /* ---- step 1: the place and its people ---- */
  function step1() {
    const s = sc(), x = st();
    return `<h2 class="tg-h">The place and its people</h2>
      <p class="tg-lead">${esc(STEPS[0].does)} Start with one place, small enough to know well, and the people whose day heat changes most.</p>
      <div class="tg-place">
        <label>Name this place <input type="text" data-tg-f="place" value="${esc(x.place)}" placeholder="${esc(s.where)}"></label>
        <label>Where it begins and ends <textarea rows="2" data-tg-f="boundary" placeholder="${esc(s.boundary)}">${esc(x.boundary)}</textarea></label>
        <p class="tg-task"><b>The task, in one sentence.</b> ${esc(s.task)}</p>
      </div>
      <div class="tg-people">${s.people.map(p0 => { const p = person(p0);
        return `<article class="tg-person">${scene(p0.scene)}
          <p class="tg-person__n"><input type="text" aria-label="Name" data-tg-name="${p0.id}" value="${esc(p.name)}"> <input type="text" aria-label="Role" data-tg-role="${p0.id}" value="${esc(p.role)}"></p>
          <p><b>An ordinary day.</b> ${esc(p0.day)}</p><p><b>On a hot day.</b> ${esc(p0.heat)}</p>
          <p class="tg-small">Each hot day: about ${p0.expo} hours in dangerous heat${p0.loss ? `, and ${Math.round(p0.loss * 100)}% of a day’s pay lost` : `. ${esc(p0.lossNote || "")}`}</p></article>`; }).join("")}</div>
      <div class="tg-outside"><h3>Outside this place, but it depends on them</h3><ul>${s.outside.map(o => `<li>${esc(o)}</li>`).join("")}</ul>
        <p class="tg-small">Connect to these; do not carry them. A local plan names who to ask, and never leaves the people of a place responsible for what they have no authority or money to solve.</p></div>
      ${out(STEPS[0], `<p>${esc(x.place || s.where)}: ${esc(x.boundary || s.boundary)} ${s.people.map(p => esc(person(p).name)).join(", ")} spend ${s.people.reduce((a, p) => a + p.expo, 0)} hours in dangerous heat between them on each hot day.</p>`)}`;
  }

  /* ---- step 2: who decides what ---- */
  function step2() {
    const s = sc(), x = st(), conf = s.actors.filter(a => x.confirmed[a.id]).length;
    return `<h2 class="tg-h">Who decides what</h2>
      <p class="tg-lead">${esc(STEPS[1].does)} A general responsibility is not the same as a local commitment: mark a body as confirmed only once it has said so, in writing or in a meeting.</p>
      <div class="tg-actors">${s.actors.map(a => `<article class="tg-actor${x.confirmed[a.id] ? " is-conf" : ""}">
        <p class="tg-actor__n"><input type="text" aria-label="Name of this body" data-tg-actor="${a.id}" value="${esc(actorName(a.id))}"></p>
        <p class="tg-roles">${a.roles.map(r => `<span>${esc(T.roles[r])}</span>`).join("")}</p>
        <p class="tg-small">${esc(a.general)}</p>
        ${a.id === "ngo" ? "" : `<label class="tg-check"><input type="checkbox" data-tg-conf="${a.id}"${x.confirmed[a.id] ? " checked" : ""}> Its role here is confirmed locally</label>
        <label class="tg-note">How do you know? <input type="text" data-tg-note="${a.id}" value="${esc(x.notes[a.id] || "")}" placeholder="e.g. minutes of the March meeting"></label>`}</article>`).join("")}</div>
      <fieldset class="tg-missing"><legend>Who is not yet at the table?</legend>${T.missing.map((m, i) => `<label class="tg-check"><input type="checkbox" data-tg-miss="${i}"${x.missing.includes(i) ? " checked" : ""}> ${esc(m)}</label>`).join("")}
        <p class="tg-small">Tick who still needs a way to be heard. Their views shape the plan; their personal details stay private.</p></fieldset>
      ${out(STEPS[1], `<p>${conf} of ${s.actors.length - 1} bodies have confirmed their role here. ${x.missing.length ? `Still to hear from: ${x.missing.map(i => esc(T.missing[i].toLowerCase())).join(", ")}.` : ""}</p>`)}`;
  }

  /* ---- step 3: what must happen together ---- */
  function chain(m) {
    return `<div class="tg-chain" role="group" aria-label="${esc(m.name)}: what must happen">${m.reqs.map(r => { const x = rq(m, r), c = counts(x), ok = met(m, r), key = `${m.id}:${r.id}`;
      return `<div class="tg-req${ok ? " is-ok" : ""}">
        <p class="tg-req__t">${ok ? "✓" : "○"} ${esc(r.text)} <span class="tg-small">Needs to be ${esc(T.needNames[r.need])}${r.from > 1 ? `; without it, it fails from ${T.dayNames[r.from - 1]}` : ""}</span></p>
        <div class="tg-req__f"><label>Who <select data-tg-r="${key}:owner">${sc().actors.map(a => `<option value="${a.id}"${x.owner === a.id ? " selected" : ""}>${esc(actorName(a.id))}</option>`).join("")}</select></label>
          <label>Status <select data-tg-r="${key}:status">${T.statuses.map(s => `<option value="${s.id}"${x.status === s.id ? " selected" : ""}>${esc(s.name)}</option>`).join("")}</select></label>
          ${rank(x.status) >= rank("agreed") ? `<label class="tg-ev">What shows this? <input type="text" data-tg-r="${key}:ev" value="${esc(x.ev)}" placeholder="e.g. signed minutes, a budget line, a photo of it working"></label>` : ""}</div>
        ${c !== x.status ? `<p class="tg-warn">Counts as discussed until there is evidence.</p>` : ""}</div>`; }).join("")}</div>`;
  }
  function step3() {
    const s = sc(), ms = chosen(), all = ms.reduce((a, m) => a + m.reqs.length, 0), ok = ms.reduce((a, m) => a + m.reqs.filter(r => met(m, r)).length, 0);
    return `<h2 class="tg-h">What must happen together</h2>
      <p class="tg-lead">${esc(STEPS[2].does)} Choose the measures, then work through what each one needs. Naming an owner is not the same as their agreement: only the status, with evidence, counts.</p>
      <p class="tg-ladder">${T.statuses.map(x => `<span title="${esc(x.hint)}"><b>${esc(x.name)}</b> ${esc(x.hint)}</span>`).join("")}</p>
      <div class="tg-measures">${s.measures.map(m => { const on = !!st().sel[m.id], okN = m.reqs.filter(r => met(m, r)).length;
        return `<section class="tg-m${on ? " is-on" : ""}"><button type="button" class="tg-m__b" data-tg-m="${m.id}" aria-pressed="${on}"><b>${esc(m.name)}</b><span>${esc(m.does)}</span>${on ? `<em>${okN} of ${m.reqs.length} in place</em>` : ""}</button>${on ? chain(m) : ""}</section>`; }).join("")}</div>
      ${out(STEPS[2], ms.length ? `<p>${ok} of ${all} requirements are where they need to be. ${all - ok ? "The rest are the conversations to have next." : "Every requirement is in place: now check it works on the day."}</p>` : "<p>Choose at least one measure.</p>")}`;
  }

  /* ---- step 4: money ---- */
  function step4() {
    const s = sc(), ms = chosen(), pay = st().pay;
    const run = m => (m.cost && m.cost.run ? m.cost.run * 12 : 0);
    const opts = (id, f) => `<select data-tg-pay="${id}:${f}" aria-label="Who pays to ${f === "build" ? "set up" : "run"} ${esc((sc().measures.find(m => m.id === id) || {}).name || "")}"><option value="">Not decided</option>${s.actors.filter(a => a.roles.includes("funds") || a.roles.includes("decides")).map(a => `<option value="${a.id}"${(pay[id] || {})[f] === a.id ? " selected" : ""}>${esc(actorName(a.id))}</option>`).join("")}</select>`;
    const build = ms.reduce((a, m) => a + ((m.cost || {}).build || 0), 0), season = ms.reduce((a, m) => a + run(m), 0);
    const open = ms.filter(m => { const c = m.cost || {}, p = pay[m.id] || {}; return (c.build && !p.build) || ((c.run || c.per) && !p.run); });
    return `<h2 class="tg-h">Pay for it, and keep it running</h2>
      <p class="tg-lead">${esc(STEPS[3].does)} Building something once is the easy part; the running cost through the season is what usually goes unpaid.</p>
      ${ms.length ? `<div class="tg-table-wrap" role="region" aria-label="Table" tabindex="0"><table class="tg-table"><thead><tr><th>Measure</th><th>To set up</th><th>To run for a 12-week season</th><th>Who pays to set up</th><th>Who pays to run</th></tr></thead><tbody>
        ${ms.map(m => `<tr><td>${esc(m.name)}</td><td>${m.cost && m.cost.build ? money(m.cost.build) : "–"}</td><td>${m.cost && m.cost.per ? `${money(m.cost.per)} a person, per payment` : m.cost && m.cost.run ? money(run(m)) : "Staff time"}</td><td>${m.cost && m.cost.build ? opts(m.id, "build") : "–"}</td><td>${opts(m.id, "run")}</td></tr>`).join("")}
      </tbody></table></div><p class="tg-small">Amounts are illustrative, to compare scale, in US dollars. Replace them with local quotes.</p>` : "<p>Choose measures in step 3 first.</p>"}
      ${out(STEPS[3], ms.length ? `<p>About ${money(build)} to set up and ${money(season)} to run for a season${ms.some(m => m.cost && m.cost.per) ? ", plus any cash payments" : ""}. ${open.length ? `Still to decide who pays for: ${open.map(m => esc(m.name.toLowerCase())).join("; ")}.` : "Every cost has someone named to pay it."}</p>` : "")}`;
  }

  /* ---- step 5: run the hot week ---- */
  function step5() {
    const s = sc(), base = week(false), pkg = week(true), fl = failures(), x = st();
    const cell = (o, d) => { const r = o.days[d - 1], b = base.find(z => z.p.id === o.p.id).days[d - 1], cut = b.expo - r.expo;
      return `<td class="tg-cell tg-cell--${cut >= 3 ? 2 : cut >= 1 ? 1 : 0}"><b>${r.expo} h</b>${r.got.length ? `<span>${r.got.map(m => esc(m.line)).join("; ")}</span>` : `<span>No protection reaches ${esc(o.p.name)}.</span>`}${r.broke.map(f => `<em>${esc(f.r.fail)}</em>`).join("")}</td>`; };
    return `<h2 class="tg-h">Run the hot week</h2>
      <p class="tg-lead">${esc(STEPS[4].does)} An alert is issued for five hot days. Each measure works only on the days every requirement it depends on holds.</p>
      ${chosen().length ? `<div class="tg-table-wrap" role="region" aria-label="The hot week, day by day" tabindex="0"><table class="tg-week"><caption class="visually-hidden">Hours in dangerous heat each day, and what reached each person</caption><thead><tr><th>Who</th>${T.days.map(d => `<th>${d}</th>`).join("")}</tr></thead><tbody>
        ${pkg.map(o => `<tr><th scope="row">${esc(o.p.name)}<span>${esc(o.p.role)}</span></th>${[1, 2, 3, 4, 5].map(d => cell(o, d)).join("")}</tr>`).join("")}</tbody></table></div>
        <div class="tg-story">${pkg.map((o, i) => { const b = base[i];
          return `<p><b>${esc(o.p.name)}</b> spends ${o.expo} hours in dangerous heat this week, against ${b.expo} with no help${b.base.loss ? `, and loses ${days(o.loss)} instead of ${days(b.loss)}` : ""}.${o.days.some(d => d.care) ? " If anyone collapses, help is minutes away." : ""}</p>`; }).join("")}</div>`
        : "<p>Choose measures in step 3, then run the week.</p>"}
      ${fl.length ? `<h3 class="tg-h3">What broke, and who can fix it</h3><ol class="tg-fails">${fl.map(f => `<li><b>${esc(f.m.name)}:</b> ${esc(f.r.fail)} <span>Who can resolve it: ${esc(actorName(f.x.owner))}. What is needed: ${esc(f.r.text.charAt(0).toLowerCase() + f.r.text.slice(1))}. Now ${esc(T.statuses[rank(counts(f.x))].name.toLowerCase())}; it needs to be ${esc(T.needNames[f.r.need])}.</span></li>`).join("")}</ol>` : chosen().length ? `<p class="tg-good">Nothing broke this week. Keep checking: the next week brings new problems.</p>` : ""}
      <fieldset class="tg-routine"><legend>A simple coordination routine</legend>
        <label>Before each hot week, who checks that everything is ready? <input type="text" data-tg-rt="check" value="${esc(x.routine.check)}" placeholder="e.g. the market committee secretary, every Sunday"></label>
        <label>If something fails on the day, who is called, and how? <input type="text" data-tg-rt="escalate" value="${esc(x.routine.escalate)}" placeholder="e.g. the ward health officer, by phone"></label>
        <label>How can workers raise a problem? <select data-tg-rt="feedback">${T.feedback.map(([v, l]) => `<option value="${v}"${x.routine.feedback === v ? " selected" : ""}>${esc(l)}</option>`).join("")}</select></label>
      </fieldset>
      ${out(STEPS[4], `<p>${chosen().length ? `Dangerous-heat hours cut by ${Math.round((1 - pkg.reduce((a, o) => a + o.expo, 0) / base.reduce((a, o) => a + o.expo, 0)) * 100)}% across ${plural(pkg.length, "person", "people")}. ` : ""}${fl.length ? `${plural(fl.length, "requirement")} still to resolve.` : ""} ${x.routine.check && x.routine.escalate && x.routine.feedback ? "The routine is set." : "Set the routine above."}</p>`)}`;
  }

  /* ---- step 6: learn and make it last ---- */
  function step6() {
    const x = st();
    return `<h2 class="tg-h">Learn, and make it last</h2>
      <p class="tg-lead">${esc(STEPS[5].does)} Meetings and agreements matter when they change what reaches people. After the season, ask both questions in each row.</p>
      <div class="tg-table-wrap" role="region" aria-label="Table" tabindex="0"><table class="tg-table"><thead><tr><th>What changed between organisations</th><th>What it meant for people</th><th>Answer</th></tr></thead><tbody>
        ${T.checks.map(([a, b], i) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td><td><select data-tg-chk="${i}" aria-label="${esc(b)}">${[["", "Not yet known"], ["yes", "Yes"], ["partly", "Partly"], ["no", "No"]].map(([v, l]) => `<option value="${v}"${x.checks[i] === v ? " selected" : ""}>${l}</option>`).join("")}</select></td></tr>`).join("")}</tbody></table></div>
      <fieldset class="tg-routine"><legend>Will it outlast the project?</legend>${T.survive.map(([id, l]) => `<label class="tg-check"><input type="checkbox" data-tg-sv="${id}"${x.survive[id] ? " checked" : ""}> ${esc(l)}</label>`).join("")}</fieldset>
      <p class="tg-go"><button type="button" class="btn btn--teal" data-tg-act="print">Open the place protection plan</button> <button type="button" class="link" data-tg-act="reset">Start this place again</button></p>
      <p class="tg-small">The plan lists what has been agreed, with evidence, and the decisions partners still need to make together. Contribution, not attribution: what changes is shared work.</p>
      ${out(STEPS[5], `<p>${Object.values(x.survive).filter(Boolean).length} of ${T.survive.length} signs that it will last.</p>`)}`;
  }

  function render() {
    const s = sc();
    box.innerHTML = `<div class="tg-places" role="group" aria-label="Choose a place">${T.scenarios.map(x => `<button type="button" class="tg-placecard" data-tg-sc="${x.id}" aria-pressed="${x.id === s.id}">${scene(x.people[0].scene)}<b>${esc(x.name)}</b><span>${esc(x.where)}</span></button>`).join("")}</div>
      <p class="tg-small tg-note-hyp">${esc(T.note)}</p>
      ${strip()}
      <nav class="tg-nav" aria-label="Steps">${stepNav()}</nav>
      <div class="tg-body">${[step1, step2, step3, step4, step5, step6][S.step - 1]()}</div>
      <p class="tg-pn">${S.step > 1 ? `<button type="button" class="btn btn--sm btn--ghost" data-tg-step="${S.step - 1}">← ${esc(STEPS[S.step - 2].name)}</button>` : "<span></span>"}
        ${S.step < 6 ? `<button type="button" class="btn btn--sm btn--cta" data-tg-step="${S.step + 1}">${esc(STEPS[S.step].name)} →</button>` : ""}</p>`;
  }
  const refresh = (keepFocus = true) => { save(); const y = window.scrollY, f = document.activeElement, ds = f && f.dataset ? Object.entries(f.dataset)[0] : null;
    render(); if (keepFocus && ds) { const el = box.querySelector(`[data-${ds[0].replace(/[A-Z]/g, c => "-" + c.toLowerCase())}="${ds[1]}"]`); if (el) el.focus({ preventScroll: true }); } window.scrollTo(0, y); };
  // typing updates the strip and the step's summary without re-rendering the field being typed in
  const light = () => { save(); const sp = box.querySelector(".tg-strip"); if (sp) sp.outerHTML = strip(); };

  function printPlan() {
    const s = sc(), x = st(), h = esc, fl = failures(), base = week(false), pkg = week(true);
    const byOwner = {}; fl.forEach(f => { (byOwner[f.x.owner] = byOwner[f.x.owner] || []).push(f); });
    const css = `body{font-family:Inter,Segoe UI,Arial,sans-serif;color:#16202B;max-width:880px;margin:36px auto;padding:0 24px;line-height:1.5}h1{font-family:Anton,Impact,sans-serif;font-weight:400;text-transform:uppercase;font-size:34px;margin:6px 0}
      .k{color:#1F7A70;font-weight:700;letter-spacing:.14em;text-transform:uppercase;font-size:12px}h2{font-size:13px;letter-spacing:.12em;text-transform:uppercase;border-top:2px solid #16202B;padding-top:10px;margin-top:24px}
      table{width:100%;border-collapse:collapse;font-size:13px;margin-top:8px}th,td{text-align:left;vertical-align:top;padding:6px;border-bottom:1px solid #E6DFD4}th{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#5E6570}
      .gap{color:#9E1A2C;font-weight:700}.note{color:#5E6570;font-size:12px}.print{position:fixed;top:16px;right:16px;padding:10px 18px;border-radius:999px;border:0;background:#F26430;font-weight:700;cursor:pointer}@media print{.print{display:none}body{margin:0}}`;
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Place protection plan: ${h(x.place || s.name)}</title><style>${css}</style></head><body>
      <button class="print" onclick="window.print()">Print or save as PDF</button>
      <p class="k">Place protection plan · draft for discussion</p><h1>${h(x.place || s.where)}</h1><p>${h(x.boundary || s.boundary)}</p><p><b>The task:</b> ${h(s.task)}</p>
      <h2>How we work</h2><ul>${T.principles.map(p => `<li><b>${h(p.name)}.</b> ${h(p.text)}</li>`).join("")}</ul>
      <h2>The people at the centre</h2><table><tr><th>Who</th><th>Hours in dangerous heat in a hot week</th><th>Pay lost</th></tr>${base.map((b, i) => `<tr><td>${h(b.p.name)}, ${h(b.p.role.toLowerCase())}</td><td>${b.expo} without help · ${pkg[i].expo} with the plan</td><td>${b.base.loss ? `${days(b.loss)} · ${days(pkg[i].loss)}` : h(b.p.lossNote || "–")}</td></tr>`).join("")}</table>
      <h2>Who is involved</h2><table><tr><th>Body</th><th>Role here</th><th>Confirmed?</th></tr>${s.actors.filter(a => a.id !== "ngo").map(a => `<tr><td>${h(actorName(a.id))}</td><td>${a.roles.map(r => h(T.roles[r])).join(", ")}</td><td class="${x.confirmed[a.id] ? "" : "gap"}">${x.confirmed[a.id] ? "Yes" + (x.notes[a.id] ? `: ${h(x.notes[a.id])}` : "") : "Not yet"}</td></tr>`).join("")}</table>
      ${x.missing.length ? `<p>Still to hear from: ${x.missing.map(i => h(T.missing[i].toLowerCase())).join(", ")}.</p>` : ""}
      <h2>What must happen together</h2><table><tr><th>Measure and requirement</th><th>Who</th><th>Status</th><th>Evidence</th></tr>${chosen().map(m => m.reqs.map((r, k) => { const q = rq(m, r);
        return `<tr><td>${k ? "" : `<b>${h(m.name)}</b><br>`}${h(r.text)}</td><td>${h(actorName(q.owner))}</td><td class="${met(m, r) ? "" : "gap"}">${h(T.statuses[rank(counts(q))].name)}${met(m, r) ? "" : ` (needs: ${h(T.needNames[r.need])})`}</td><td>${h(q.ev || "–")}</td></tr>`; }).join("")).join("") || `<tr><td colspan="4" class="gap">No measures chosen</td></tr>`}</table>
      <h2>Decisions to make together</h2>${Object.keys(byOwner).length ? Object.entries(byOwner).map(([o, list]) => `<p><b>With ${h(actorName(o))}:</b> ${list.map(f => h(f.r.text.charAt(0).toLowerCase() + f.r.text.slice(1))).join("; ")}.</p>`).join("") : "<p>None outstanding in this simulation.</p>"}
      <h2>Money</h2><table><tr><th>Measure</th><th>Who pays to set up</th><th>Who pays to run</th></tr>${chosen().map(m => { const p = x.pay[m.id] || {}; return `<tr><td>${h(m.name)}</td><td class="${p.build || !(m.cost && m.cost.build) ? "" : "gap"}">${m.cost && m.cost.build ? h(p.build ? actorName(p.build) : "Not decided") : "–"}</td><td class="${p.run ? "" : "gap"}">${h(p.run ? actorName(p.run) : "Not decided")}</td></tr>`; }).join("")}</table>
      <h2>The routine</h2><p>Readiness check: ${h(x.routine.check || "not set")}. If something fails: ${h(x.routine.escalate || "not set")}. Raising a problem: ${h((T.feedback.find(f => f[0] === x.routine.feedback) || ["", "not set"])[1])}.</p>
      <h2>After the season</h2><table>${T.checks.map(([a, b], i) => `<tr><td>${h(a)}</td><td>${h(b)}</td><td>${h({ yes: "Yes", partly: "Partly", no: "No" }[x.checks[i]] || "Not yet known")}</td></tr>`).join("")}</table>
      <p class="note">${h(T.note)} A plan made with Common Shade, for discussion between the bodies named. It records voluntary commitments and assigns no blame.</p></body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" })), w = window.open(url, "_blank");
    if (!w) { const a = document.createElement("a"); a.href = url; a.download = `place-protection-plan-${s.id}.html`; document.body.appendChild(a); a.click(); a.remove(); }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  box.addEventListener("click", ev => {
    const t = ev.target, b = k => t.closest(`[data-tg-${k}]`);
    if (b("sc")) { S.sc = b("sc").dataset.tgSc; S.step = 1; track("together-" + S.sc); try { history.replaceState(null, "", "?place=" + S.sc); } catch (e) {} refresh(false); return; }
    if (b("step")) { S.step = +b("step").dataset.tgStep; track("together-step-" + S.step); refresh(false); const n = box.querySelector(".tg-nav"); if (n) n.scrollIntoView({ block: "start", behavior: "smooth" }); const h = box.querySelector(".tg-h"); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } return; }
    if (b("m")) { const id = b("m").dataset.tgM, x = st(); if (x.sel[id]) delete x.sel[id]; else { x.sel[id] = true; track("together-add-" + id); } refresh(); return; }
    const a = b("act"); if (!a) return;
    if (a.dataset.tgAct === "print") { track("together-print"); printPlan(); }
    if (a.dataset.tgAct === "reset" && window.confirm("Clear everything you have entered for this place?")) { S.per[S.sc] = fresh(); refresh(false); }
  });
  box.addEventListener("input", ev => {
    const t = ev.target, x = st(), d = t.dataset;
    if (d.tgF) { x[d.tgF] = t.value; save(); return; }
    if (d.tgName) { x.names[d.tgName] = t.value; light(); return; }
    if (d.tgRole) { x.roles[d.tgRole] = t.value; light(); return; }
    if (d.tgActor) { x.actors[d.tgActor] = t.value; save(); return; }
    if (d.tgNote) { x.notes[d.tgNote] = t.value; save(); return; }
    if (d.tgRt && t.tagName === "INPUT") { x.routine[d.tgRt] = t.value; save(); return; }
    if (d.tgR && t.tagName === "INPUT") { const [m, r, f] = d.tgR.split(":"), k = `${m}:${r}`, M = sc().measures.find(z => z.id === m), R = M.reqs.find(z => z.id === r);
      x.req[k] = Object.assign(rq(M, R), { [f]: t.value }); save(); }
  });
  box.addEventListener("change", ev => {
    const t = ev.target, x = st(), d = t.dataset;
    if (d.tgR && t.tagName === "SELECT") { const [m, r, f] = d.tgR.split(":"), k = `${m}:${r}`, M = sc().measures.find(z => z.id === m), R = M.reqs.find(z => z.id === r);
      x.req[k] = Object.assign(rq(M, R), { [f]: t.value }); refresh(); return; }
    if (d.tgR && t.tagName === "INPUT") { refresh(); return; }
    if (d.tgConf) { x.confirmed[d.tgConf] = t.checked; refresh(); return; }
    if (d.tgMiss !== undefined) { const i = +d.tgMiss; x.missing = t.checked ? [...new Set([...x.missing, i])] : x.missing.filter(z => z !== i); refresh(); return; }
    if (d.tgPay) { const [m, f] = d.tgPay.split(":"); x.pay[m] = Object.assign(x.pay[m] || {}, { [f]: t.value }); refresh(); return; }
    if (d.tgRt && t.tagName === "SELECT") { x.routine[d.tgRt] = t.value; refresh(); return; }
    if (d.tgChk !== undefined) { x.checks[d.tgChk] = t.value; save(); return; }
    if (d.tgSv) { x.survive[d.tgSv] = t.checked; refresh(); return; }
    if (d.tgName || d.tgRole || d.tgActor || d.tgF || d.tgNote || d.tgRt) refresh();
  });

  // principles and evidence, drawn once
  const pr = document.getElementById("tg-principles");
  if (pr) pr.innerHTML = T.principles.map(p => `<li><b>${esc(p.name)}.</b> ${esc(p.text)}</li>`).join("");
  const evb = document.getElementById("tg-evidence");
  if (evb) evb.innerHTML = T.evidence.map(e => `<li>${esc(e.text)} <span class="cool-ev__src">${extLink(e.source.url, e.source.label)}</span></li>`).join("");
  render();
})();
