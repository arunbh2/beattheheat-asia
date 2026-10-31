// "Live through a heatwave": three simulations with equal weight, so the site follows a carer, a patient and a city
// as closely as it follows a worker. Writes /live-through-a-heatwave/ (the three side by side), /a-night-in-the-heat/
// (care and health at home, through a hot night and a clinic visit) and /a-city-under-strain/ (power, water, clinics
// and trees through a five-day heatwave). Called by tools/build-pages.js, which passes its page() and write().
// Every real-world figure is one the site already cites, with its source. The simulations themselves are teaching
// models: their strain levels and units are illustrative, and each page says so.
"use strict";
const fs = require("fs"), path = require("path");

module.exports = function live({ page, write, hero, esc, V, D, ROOT }) {
  const LOOP = id => D.LOOPS.find(l => l.id === id) || { name: id };
  const LEVER = id => D.LEVERS.find(l => l.id === id) || { title: id };
  const films = ids => ids.filter(id => fs.existsSync(path.join(ROOT, "media", "glossary", id + ".mp4"))).map(id => {
    const g = (D.GLOSSARY || []).find(x => x.id === id) || {}; return { id, term: g.term || id, length: g.length || "" }; });
  const filmRow = (ids, h) => { const F = films(ids); if (!F.length) return "";
    return `<h2 class="hub-h">${esc(h)}</h2><ul class="lv-films">${F.map(f => `<li><figure><video controls playsinline preload="none" width="1920" height="1080" poster="/media/glossary/${f.id}.jpg" aria-label="${esc(f.term)}: a short film with captions in the picture"><source src="/media/glossary/${f.id}.mp4" type="video/mp4"></video><figcaption><b>${esc(f.term)}</b>${f.length ? ` · ${esc(f.length)}` : ""}</figcaption></figure></li>`).join("")}</ul>`; };
  const src = s => s ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}<span class="visually-hidden"> (opens in a new tab)</span></a>` : "";
  const PEOPLE = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "site", "people.json"), "utf8"));

  // ---------- the three, side by side ----------
  const THREE = [
    { url: "/a-week-in-the-heat/", k: "Work and income", h: "A week in the heat", p: "Follow one worker’s money through a heatwave week, build protection, then try to break it.", art: "work" },
    { url: "/a-night-in-the-heat/", k: "Care and health", h: "A night in the heat", p: "Stay with an older woman living alone, a pregnant woman or a family with a baby through a hot night and a clinic visit.", art: "night" },
    { url: "/a-city-under-strain/", k: "City systems", h: "A city under strain", p: "Stress-test a city’s power, water, clinics and trees through a five-day heatwave, and see what holds.", art: "city" }];
  const ART = {
    work: `<path d="M20 120 H220" opacity=".35"/><circle cx="190" cy="34" r="14" fill="#F5A623" stroke="#F5A623"/><circle cx="90" cy="58" r="8"/><path d="M90 66 V94 M90 94 L82 120 M90 94 L98 120 M90 74 L112 84 M90 74 L72 90"/><rect x="118" y="80" width="40" height="40" rx="3" fill="#F26430" stroke="#F26430"/>`,
    night: `<path d="M20 120 H220" opacity=".35"/><path d="M196 22 a16 16 0 1 0 12 26 a13 13 0 0 1 -12 -26 Z" fill="#2E6F95" stroke="#2E6F95"/><path d="M50 120 V66 L110 34 L170 66 V120" /><path d="M42 70 L110 30 L178 70" stroke="#F26430"/><path d="M70 104 H150"/><circle cx="84" cy="96" r="6"/><path d="M90 98 H140"/><path d="M150 84 v-8 M144 80 h12" opacity=".7"/>`,
    city: `<path d="M20 120 H220" opacity=".35"/><rect x="30" y="58" width="34" height="62"/><rect x="74" y="40" width="30" height="80"/><path d="M130 120 V60 L150 40 L170 60 V120 M130 74 H170 M136 60 L164 88 M164 60 L136 88" stroke="#2E6F95"/><circle cx="198" cy="88" r="16" fill="#1F7A70" stroke="#1F7A70"/><path d="M198 104 V120"/><path d="M110 30 l-6 14 h8 l-6 14" stroke="#F5A623"/>` };
  const card3 = t => `<li><a class="lv-card lv-card--${t.art}" href="${t.url}"><svg viewBox="0 0 240 130" aria-hidden="true"><g fill="none" stroke="#16202B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${ART[t.art]}</g></svg><p class="lv-k">${esc(t.k)}</p><h3>${esc(t.h)}</h3><p>${esc(t.p)}</p><span class="lv-go">Begin <span aria-hidden="true">→</span></span></a></li>`;
  write("live-through-a-heatwave", page("live-through-a-heatwave", "Live through a heatwave", "Three ways to live through a heatwave on Common Shade: a worker’s week, a hot night at home and a clinic visit, and a city’s power, water and clinics under strain.",
    `${hero("Understand heat", "Live through a heatwave", "Heat reaches people through their work, their homes and bodies, and the systems everyone depends on. Choose whose heatwave to follow: each takes about five minutes, and each ends with what could protect people at scale.")}
    <section class="container hub"><ul class="lv-three">${THREE.map(card3).join("")}</ul>
      <p class="hub-p">Each is a teaching exercise built from the evidence on this site, with composite, drawn people. None predicts what will happen to a real person or place.</p>
      <p class="hub-p"><a href="/who-is-at-risk/">Who heat hits hardest</a> · <a href="/practical/">Practical actions by setting</a> · <a href="/#loops">The vicious cycles</a></p></section>`));

  // ---------- A night in the heat ----------
  const AR = id => (D.AT_RISK || []).find(x => x.id === id) || {};
  const C = id => (D.CONSEQUENCES || []).find(x => x.id === id) || {};
  const ev = (text, s) => ({ text, src: s });
  const NIGHT = {
    who: [
      { id: "older", name: "An older woman living alone", short: "Older, alone", base: 3, note: "Thirst fades with age and the body sweats less, so it cools more slowly; living alone, no one may notice.",
        fact: ev(AR("older").fact, AR("older").source), film: "olderheat" },
      { id: "pregnant", name: "A woman seven months pregnant", short: "Pregnant", base: 2, note: "A pregnant body runs warm and works harder; heat raises the risk of an early birth.",
        fact: ev(AR("mothers").fact, AR("mothers").source), film: "pregnancyheat" },
      { id: "baby", name: "A family with a six-month-old baby", short: "With a baby", base: 2, note: "Babies overheat and lose water faster than adults, and can’t say when they are struggling.",
        fact: ev(((AR("mothers").more || [])[0] || {}).fact, ((AR("mothers").more || [])[0] || {}).source), film: "babyheat" }],
    // what could be in place tonight; each eases the night in a different way, and each links to its evidence
    help: [
      { id: "roof", name: "A cooler roof", text: "Reflective paint or shade over a thin metal roof, so the room cools after dark.", eases: "home", lever: "coolhousing", src: C("homes").sources && C("homes").sources[0] },
      { id: "fan", name: "A fan she can afford to run", text: "Bills or a subsidy that let the fan stay on all night.", eases: "home", lever: "affordablecool", src: (C("energypoverty").sources || [])[0] },
      { id: "power", name: "The power stays on", text: "No cut tonight, so the fan keeps turning.", eases: "power", lever: "pumpbackup", src: (C("power").sources || [])[0] },
      { id: "check", name: "Someone checks in", text: "A neighbour or community health worker who calls or knocks.", eases: "notice", lever: "coolingcentres", src: (C("isolation").sources || [])[0] },
      { id: "centre", name: "A cool place, open at night", text: "A cooling centre or cool community room within reach after dark.", eases: "escape", lever: "coolingcentres", src: null },
      { id: "clinic", name: "A clinic warned and ready", text: "The clinic heard the heat warning, with cool beds, fluids and staff ready, and open in the evening.", eases: "care", lever: "readyclinics", src: (D.LOOP_STAKES.clinic || {}).url ? { label: D.LOOP_STAKES.clinic.by, url: D.LOOP_STAKES.clinic.url } : null }],
    hours: [
      { t: "7 pm", indoor: 2, scene: "dusk", say: { base: "The sun is down, but the walls and the roof are still giving off the day’s heat.", roof: "The cooler roof has kept the worst of the day out; the room is already easing." } },
      { t: "10 pm", indoor: 3, scene: "night", say: { base: "Indoors is now hotter than outside. Sleep won’t come.", fan: "The fan moves the air enough to rest.", nofan: "The fan stays off to save on the bill." } },
      { t: "1 am", indoor: 3, scene: "deep", say: { base: "The hottest hours indoors. The body has had no chance to cool since morning.", cut: "The power cuts out. The fan stops.", centre: "A cooler room, a short walk away, is open." } },
      { t: "4 am", indoor: 2, scene: "deep", say: { base: "Dizziness, a headache, a racing heart. These are early warning signs.", check: "A call: someone noticed the lights on and checked in.", alone: "No one calls. No one knows." } },
      { t: "7 am", indoor: 2, scene: "dawn", say: { base: "Morning, already warm. A night without real rest means a harder day ahead." } },
      { t: "11 am", indoor: 3, scene: "clinic", say: { base: "At the clinic.", ready: "Staff were warned yesterday: cool beds, fluids and quick care are waiting.", unready: "The waiting room is full and hot. Help comes, but slowly." } }],
    loops: ["sleep", "energypoverty", "clinic", "invisible"].map(id => ({ id, name: LOOP(id).name })),
    levers: ["coolingcentres", "coolhousing", "affordablecool", "readyclinics", "coolnights", "countdeaths"].map(id => ({ id, title: LEVER(id).title })),
    note: "A composite, drawn from the evidence; not a real person, and not a medical prediction." };
  write("a-night-in-the-heat", page("a-night-in-the-heat", "A night in the heat", "Stay with an older woman living alone, a pregnant woman or a family with a baby through a hot night and a clinic visit, and see what protects them: a cooler roof, a fan that stays on, someone who checks in, a clinic that is ready.",
    `<header class="lv-hero lv-hero--night"><div class="container"><p class="eyebrow">Care and health</p><h1 class="pg-h1">A night in the heat</h1>
      <p class="pg-lede">For many people, heat is not about a day’s pay. It is a room that will not cool, a body that cannot shed the heat, and no one who notices. Choose whose night to follow, decide what is in place, then live through it, hour by hour.</p>
      <p class="rf-note">${esc(NIGHT.note)}</p></div></header>
    <section class="container lv" data-nt>
      <ol class="lv-steps" aria-label="Three steps"><li class="is-on" data-nt-step="1">Whose night</li><li data-nt-step="2">What is in place</li><li data-nt-step="3">Through the night</li></ol>
      <div class="lv-panel" data-nt-panel="1"><h2 class="lv-h">Whose night will you follow?</h2><div class="lv-who" role="radiogroup" aria-label="Whose night">${NIGHT.who.map((w, i) => `<button type="button" role="radio" aria-checked="${i ? "false" : "true"}" class="lv-whob${i ? "" : " is-on"}" data-who="${w.id}"><b>${esc(w.name)}</b><span>${esc(w.note)}</span></button>`).join("")}</div>
        <p class="lv-fact" data-nt-fact></p><p><button type="button" class="lv-next" data-nt-go="2">Next: what is in place <span aria-hidden="true">→</span></button></p></div>
      <div class="lv-panel" data-nt-panel="2" hidden><h2 class="lv-h">What is in place tonight?</h2><p class="hub-p">Choose any, or none. Most homes in a heatwave have only some of these.</p>
        <ul class="lv-help">${NIGHT.help.map(h => `<li><label><input type="checkbox" data-help="${h.id}"><span><b>${esc(h.name)}</b><small>${esc(h.text)}</small></span></label></li>`).join("")}</ul>
        <p><button type="button" class="lv-next" data-nt-go="3">Begin the night <span aria-hidden="true">→</span></button> <button type="button" class="lv-back" data-nt-go="1">Back</button></p></div>
      <div class="lv-panel" data-nt-panel="3" hidden>
        <div class="lv-stage"><svg class="lv-room" viewBox="0 0 640 360" role="img" aria-labelledby="nt-room-t" data-nt-room><title id="nt-room-t">A drawn room at night</title></svg>
          <div class="lv-side"><p class="lv-clock" data-nt-clock aria-live="polite"></p><div class="lv-meter" data-nt-meter role="meter" aria-valuemin="0" aria-valuemax="4" aria-label="How hard the night is on the body"><i></i><i></i><i></i><i></i></div><p class="lv-mlab" data-nt-mlab></p><div class="lv-say" data-nt-say aria-live="polite"></div>
            <p class="lv-ctrl"><button type="button" class="lv-next" data-nt-hour>Next hour <span aria-hidden="true">→</span></button> <button type="button" class="lv-back" data-nt-go="2">Change what is in place</button></p></div></div>
        <div class="lv-end" data-nt-end hidden></div></div>
      <noscript><p class="hub-p">This exercise needs JavaScript. The same evidence is on <a href="/who-is-at-risk/">Who heat hits hardest</a> and <a href="/practical/">Practical actions</a>.</p></noscript>
      <h2 class="hub-h">The evidence behind the night</h2>
      <ul class="hub-grid hub-grid--plain">${[NIGHT.who[0].fact, NIGHT.who[1].fact, NIGHT.who[2].fact, ev(C("homes").desc, (C("homes").sources || [])[0]), ev(C("isolation").desc, (C("isolation").sources || [])[0]), ev(C("sleepless").desc, (C("sleepless").sources || [])[0])].filter(x => x && x.text).map(x => `<li class="std"><span>${esc(x.text)}</span>${x.src ? `<span class="lv-src">Source: ${src(x.src)}</span>` : ""}</li>`).join("")}</ul>
      ${filmRow(["olderheat", "pregnancyheat", "babyheat", "sleepheat", "homeheat", "checkins", "firstaid", "clinicheat"], "Watch: care and the body in the heat")}
      <p class="hub-p"><a href="/live-through-a-heatwave/">The other two simulations</a> · <a href="/who-is-at-risk/#older">Older people</a> · <a href="/who-is-at-risk/#mothers">Pregnant women and babies</a> · <a href="/practical/#practical-homes">Practical actions at home</a> · <a href="/practical/#practical-clinics">In clinics</a></p>
    </section>
    <script>window.NT=${JSON.stringify(NIGHT).replace(/</g, "\\u003c")};</script><script src="/a-night-in-the-heat/nt.js?v=${V}" defer></script>`));

  // ---------- A city under strain ----------
  const S = (label, id, i = 0) => (C(id).sources || [])[i] || null;
  const CITY = {
    days: [{ d: "Day 1", day: 39, night: 28 }, { d: "Day 2", day: 42, night: 30 }, { d: "Day 3", day: 44, night: 31 }, { d: "Day 4", day: 45, night: 32 }, { d: "Day 5", day: 43, night: 31 }],
    protect: [
      { id: "roofs", name: "Cool roofs and shade on homes", text: "Rooms stay cooler, so fewer air conditioners run flat out.", group: "demand", lever: "coolbydesign" },
      { id: "efficient", name: "Efficient fans and air conditioners", text: "The same cooling for less power at the peak.", group: "demand", lever: "cleancool" },
      { id: "trees", name: "Street trees, watered through the heat", text: "Shade by day, and nights that cool a little more.", group: "nights", lever: "keepgreen" },
      { id: "backup", name: "Back-up power at clinics and pumps", text: "Solar and batteries keep clinics cool and water flowing in a cut.", group: "backup", lever: "pumpbackup" },
      { id: "storage", name: "Water stored before the heat", text: "Tanks filled ahead, so taps keep running for a while without pumps.", group: "water", lever: "drypower" },
      { id: "warn", name: "Hospitals warned two days ahead", text: "Extra staff, fluids and cool beds before the peak.", group: "care", lever: "readyclinics" }],
    systems: [{ id: "power", name: "Power" }, { id: "water", name: "Water" }, { id: "clinic", name: "Clinics" }, { id: "nights", name: "Nights" }, { id: "trees", name: "Trees" }],
    loops: ["energywater", "cooling", "clinic", "deadgreen", "sleep"].map(id => ({ id, name: LOOP(id).name })),
    facts: [ev(D.LOOP_STAKES.energywater && D.LOOP_STAKES.energywater.sea && D.LOOP_STAKES.energywater.sea.n + " was the World Bank’s early estimate of what northern Viet Nam’s power cuts cost in May and June 2023, after heatwaves pushed up demand and dried hydropower reservoirs.", S("", "power")),
      ev("In 2016, India lost 14 TWh of electricity because thermal power plants ran short of water.", S("", "thermal")),
      ev(C("telecom").desc, S("", "telecom")), ev(C("generators").desc, S("", "generators")), ev(C("treeloss").desc, S("", "treeloss")),
      ev("After Ahmedabad’s heat plan prepared hospitals and warned the public, an evaluation estimated about 1,190 deaths a year were avoided.", D.LOOP_STAKES.clinic ? { label: D.LOOP_STAKES.clinic.by, url: D.LOOP_STAKES.clinic.url } : null)].filter(x => x.text),
    note: "A teaching model. Its strain levels are illustrative, not measurements, and it is not a forecast for any real city." };
  write("a-city-under-strain", page("a-city-under-strain", "A city under strain", "Stress-test a city’s power, water, clinics and trees through a five-day heatwave. Choose what is in place, then watch where the strain spreads, and what holds.",
    `<header class="lv-hero lv-hero--city"><div class="container"><p class="eyebrow">City systems</p><h1 class="pg-h1">A city under strain</h1>
      <p class="pg-lede">You don’t have to work outdoors to be caught by heat. When transformers trip on a hot night, water pumps stop, clinics lose their cooling and no one sleeps. Choose what your city has in place, then run five days of a heatwave.</p>
      <p class="rf-note">${esc(CITY.note)}</p></div></header>
    <section class="container lv" data-cy>
      <div class="lv-cyg">
        <div><h2 class="lv-h">What does your city have in place?</h2><ul class="lv-help lv-help--city">${CITY.protect.map(h => `<li><label><input type="checkbox" data-pr="${h.id}"><span><b>${esc(h.name)}</b><small>${esc(h.text)}</small></span></label></li>`).join("")}</ul>
          <p class="lv-ctrl"><button type="button" class="lv-next" data-cy-run>Run the heatwave <span aria-hidden="true">→</span></button> <button type="button" class="lv-back" data-cy-reset>Start again</button></p></div>
        <div class="lv-stage lv-stage--city"><svg class="lv-city" viewBox="0 0 720 380" role="img" aria-labelledby="cy-t" data-cy-svg><title id="cy-t">A drawn city: a power station, a substation, a water pump, a clinic, homes and trees</title></svg>
          <p class="lv-clock" data-cy-day aria-live="polite">Before the heatwave</p></div>
      </div>
      <div class="lv-board" data-cy-board aria-live="polite"></div>
      <div class="lv-end" data-cy-end hidden></div>
      <noscript><p class="hub-p">This stress test needs JavaScript. The same evidence is on <a href="/loops/#energywater">the energy–water loop</a> and <a href="/practical/">Practical actions</a>.</p></noscript>
      <h2 class="hub-h">The evidence behind the city</h2>
      <ul class="hub-grid hub-grid--plain">${CITY.facts.map(x => `<li class="std"><span>${esc(x.text)}</span>${x.src ? `<span class="lv-src">Source: ${src(x.src)}</span>` : ""}</li>`).join("")}</ul>
      ${filmRow(["gridheat", "waterpower", "dieselheat", "clinicheat", "coldchainheat", "telecomheat", "urbantrees", "shadegap", "coolschools", "railsheat"], "Watch: city systems in the heat")}
      <p class="hub-p"><a href="/live-through-a-heatwave/">The other two simulations</a> · <a href="/loops/#energywater">The energy–water loop</a> · <a href="/cooling-options/">Cooling options</a> · <a href="/who-holds-it/">Who holds it up</a> · <a href="/cities/">Cities</a></p>
    </section>
    <script>window.CY=${JSON.stringify(CITY).replace(/</g, "\\u003c")};</script><script src="/a-city-under-strain/cy.js?v=${V}" defer></script>`));
  return 3;
};
