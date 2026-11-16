// The Heat Assembly: checks the rules, the lesson they teach, the words and the sources.
//   node tools/check-heat-assembly.js          rule tests, a sampled walk of the decision space, words, sources, page and text twin
//   node tools/check-heat-assembly.js --full   the same with every path (about 940,000; takes a minute or two)
// Rules: spending never passes the budget or rota; one person never covers two services in one block; an agreement needs
// every role whose consent it names; relief approved ahead lands one round later and a queue rule runs from the next
// round; the same log always gives the same game. Lesson (the design guards): no path both reaches every break and
// loses nobody money; the queue rule never changes Noor's day; the first hot day's timetable changes someone's ending.
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), FULL = process.argv.includes("--full");
const HA = require("../heat-assembly/engine.js"), sc = require("../data/heat-assembly/scenario.json"), T = require("./heat-assembly-text.js");
const tone = require("../data/schema/tone.json");
const bad = []; const fail = m => bad.push(m);
const ok = (c, m) => { if (!c) fail(m); };
const ALL = { workers: true, market: true, municipal: true, coordinator: true };
const A = (o, consent) => Object.assign({ consent: consent || ALL }, o);
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const step = (s, a) => { const o = HA.apply(sc, s, a); if (o.error) throw new Error(`unexpected ${o.error} on ${JSON.stringify(a)}`); return o.state; };
const DAYR = { caretaker: { midday: "hall", afternoon: "child" }, attendant: { midday: "child" } };
const NIGHTR = { caretaker: { morning: "child" } };

// ---------- the rules, one at a time ----------
{
  let s = HA.init(sc);
  ok(HA.apply(sc, s, A({ t: "money", relief: 1, water: 0 })).error === "wrong-step", "an action out of turn is accepted");
  const noConsent = HA.apply(sc, s, A({ t: "queue", via: "rota" }, { market: true }));
  ok(noConsent.error === "consent" && noConsent.unmet.includes("workers"), "a queue rule without the workers' agreement is accepted");
  ok(HA.apply(sc, s, A({ t: "queue", via: "none" })).error === "needs-cover", "a queue rule with no cover is accepted");
  s = step(s, A({ t: "queue", via: "paid" }));
  ok(s.budget === sc.budget - sc.prices.cover && s.queueFrom === 2, "paid cover in round 1 does not cost one unit or start the rule in round 2");
  s = step(s, A({ t: "money", relief: 1, water: 1 }));
  ok(s.budget === 0, "the budget is not spent down to zero by cover, relief and water");
  s = step(s, A({ t: "predict", who: ["tara", "nobody"] }));
  ok(eq(s.predict, ["tara"]), "a prediction keeps an unknown person");
  ok(HA.staffFor(sc, s, 2).some(x => x.id === "relief" && x.cap === sc.reliefBlocks["2"]), "relief approved in round 1 is not on the round 2 roster");
  ok(HA.apply(sc, s, A({ t: "roster", r: { attendant: { midday: "hall", afternoon: "child" } } })).error === "over-cap", "the attendant can work two blocks");
  ok(HA.apply(sc, s, A({ t: "roster", r: { caretaker: { midday: "hall" }, attendant: { midday: "hall" } } })).error === "service-twice", "two people can be on one service in one block");
  ok(HA.apply(sc, s, A({ t: "roster", r: { relief: { midday: "child" } } })).error === "wrong-service", "relief staff can run childcare");
  ok(HA.apply(sc, s, A({ t: "roster", r: { caretaker: { evening: "hall" } } })).error === "wrong-block", "a night block is accepted on a hot day");
  ok(HA.apply(sc, s, A({ t: "roster", r: { caretaker: ["hall"] } })).error === "roster-shape" || HA.apply(sc, s, A({ t: "roster", r: { caretaker: ["hall"] } })).error === "wrong-block", "a malformed roster is accepted");
  s = step(s, A({ t: "roster", r: { caretaker: { midday: "hall", afternoon: "child" }, attendant: { midday: "child" }, relief: { midday: "water", afternoon: "hall" } } }));
  const r2 = s.results[2];
  ok(r2.tara.res === "break" && r2.tara.delta === 0, "Tara does not get a kept-place break with the rule, paid cover and the hall open at midday");
  ok(r2.hira.res === "break" && r2.hira.place === "water", "Hira does not reach the staffed water point");
  ok(HA.apply(sc, s, A({ t: "prep", queue: 0, relief: 1 })).error === "funds", "spending passes the budget");
  ok(HA.apply(sc, s, A({ t: "prep", queue: 1, relief: 0 })).error === "already-agreed", "the queue rule can be agreed twice");
}
{ // delayed effects: relief approved in round 2 lands in round 3, not before; a rule agreed in round 2 runs from round 3
  let s = HA.init(sc); s = step(s, A({ t: "queue", via: "wait" })); s = step(s, A({ t: "money", relief: 0, water: 0 })); s = step(s, A({ t: "predict", who: [] }));
  ok(!HA.staffFor(sc, s, 2).some(x => x.id === "relief"), "relief appears without being approved");
  s = step(s, A({ t: "roster", r: DAYR }));
  ok(s.results[2].tara.res !== "break" || s.results[2].tara.delta < 0, "Tara keeps a place with no rule agreed");
  s = step(s, A({ t: "prep", queue: 1, relief: 1 }));
  ok(s.queueFrom === 3 && HA.staffFor(sc, s, 3).some(x => x.id === "relief" && x.cap === sc.reliefBlocks["3"]), "a rule or relief agreed in round 2 does not land in round 3");
  s = step(s, A({ t: "evening", on: false }));
  ok(HA.apply(sc, s, A({ t: "roster", r: { caretaker: { evening: "hall" } } })).error === "no-evening-hours", "the hall opens in the evening without evening hours");
  s = step(s, A({ t: "roster", r: NIGHTR })); s = step(s, A({ t: "prep", queue: 0, relief: 0 }));
  const before = s.budget; s = step(s, A({ t: "hire", on: true }));
  ok(s.budget === before - sc.prices.hire && HA.staffFor(sc, s, 4).some(x => x.id === "hired" && x.cap === sc.hireBlocks), "a same-day hire does not cost twice and give one block");
  s = step(s, A({ t: "roster", r: { caretaker: { afternoon: "child" }, attendant: { midday: "child" }, hired: { afternoon: "hall" } } }));
  ok(HA.apply(sc, s, A({ t: "cover", via: "rota" })).error === "hall-closed-midday", "cover is accepted with the hall closed at midday");
  ok(HA.respond(sc, s, A({ t: "cover", via: "rota" }), "workers").id === "workers-hall-closed", "the workers' representative does not explain why cover with a closed hall is no use");
}
{ // determinism and the saved form
  const log = [A({ t: "queue", via: "rota" }), A({ t: "money", relief: 1, water: 0 }), A({ t: "predict", who: ["tara"] }), A({ t: "roster", r: DAYR })];
  const a = HA.run(sc, log), b = HA.run(sc, log), c = HA.run(sc, HA.decode(sc, HA.encode(sc, log)));
  ok(!a.error && eq(a.state, b.state) && eq(a.state, c.state), "the same log does not give the same game, or does not survive encoding");
  ok(HA.decode(sc, "999." + JSON.stringify({ t: "queue" })) === null && HA.decode(sc, "1.{not json") === null, "a saved game from another version, or a broken one, is accepted");
  ok(HA.run(sc, [A({ t: "money", relief: 1, water: 0 })]).error === "wrong-step", "a broken log runs");
}

// ---------- the decision space: every path (--full) or a deterministic sample ----------
function rosters(s, r) {
  const staff = HA.staffFor(sc, s, r), blocks = HA.blocksFor(r); let out = [{}];
  for (const st of staff) { const opts = [{}], sv = b => sc.blockServices[b].filter(x => st.services.includes(x));
    for (const b of blocks) for (const v of sv(b)) opts.push({ [b]: v });
    if (st.cap > 1) for (const v of sv(blocks[0])) for (const w of sv(blocks[1])) opts.push({ [blocks[0]]: v, [blocks[1]]: w });
    const nx = []; for (const ro of out) for (const o of opts) { const n = Object.assign({}, ro); if (Object.keys(o).length) n[st.id] = o; nx.push(n); } out = nx; }
  const seen = new Map(); for (const ro of out) { if (HA.checkRoster(sc, s, r, ro)) continue; const k = Object.keys(HA.openSet(ro)).sort().join(","); if (!seen.has(k)) seen.set(k, ro); }
  const all = [...seen.values()]; return FULL ? all : all.filter((_, i) => i % 6 === 0 || i === all.length - 1);
}
function options(s) { const st = HA.stepOf(sc, s), r = st.round, X = o => A(Object.assign({ t: st.t }, o));
  switch (st.t) { case "queue": return ["rota", "paid", "wait"].map(via => X({ via }));
    case "money": return [[0, 0], [1, 0], [0, 1], [1, 1]].map(([relief, water]) => X({ relief, water }));
    case "predict": return [X({ who: [] })];
    case "prep": return (s.queueFrom ? [0] : [0, 1]).flatMap(queue => [0, 1].map(relief => X({ queue, relief })));
    case "evening": case "hire": return [false, true].map(on => X({ on }));
    case "roster": return rosters(s, r).map(ro => X({ r: ro }));
    case "cover": return ["none", "rota", "paid"].map(via => X({ via })); } }
const constraintIds = new Set(), resultIds = new Set(), noorBy = new Map(), ends = new Map();
let paths = 0, noLoss = 0, reachAllNoLoss = 0, reachable = 0;
const qKey = log => JSON.stringify(log.map(a => a.t === "queue" ? { t: "queue" } : a.t === "cover" ? { t: "cover" } : a.t === "prep" ? { t: "prep", relief: a.relief } : a.t === "money" ? a : a.t === "roster" ? { t: "roster", r: Object.keys(HA.openSet(a.r)).filter(k => k.startsWith("child") || k === "hall@evening").sort() } : { t: a.t, on: a.on }));
function walk(s) {
  if (HA.done(sc, s)) {
    paths++;
    ok(s.budget >= 0 && s.rota >= 0, "a path ends with negative budget or rota");
    let br = 0, loss = 0;
    for (const r of [2, 3, 4]) for (const p of sc.people) { const x = s.results[r][p.id];
      ok(s.reserve[p.id] >= 0 && s.reserve[p.id] <= sc.reserve.max, "a reserve leaves 0 to 3");
      if (x.res === "break" || x.res === "own" || (x.res === "home" && r === 3)) br++; if (x.delta < 0) loss++;
      (x.c || []).forEach(c => constraintIds.add(c)); resultIds.add(x.res);
      if (HA.trace(sc, s, p.id, r).length < 3) fail(`a result has a trace of fewer than three steps (${p.id}, round ${r})`); }
    if (br > reachable) reachable = br;
    if (loss === 0) { noLoss++; if (br >= 13) reachAllNoLoss++; }
    const key = sc.people.map(p => s.reserve[p.id] + (s.short[p.id] ? "!" : "")).join(""); ends.set(key, (ends.get(key) || 0) + 1);
    const nk = qKey(s.log), nv = JSON.stringify(HA.outcome(sc, s, "noor"));
    if (noorBy.has(nk) && noorBy.get(nk) !== nv) fail("the queue rule changes Noor's results: " + nk.slice(0, 200)); noorBy.set(nk, nv);
    return;
  }
  for (const a of options(s)) { const o = HA.apply(sc, s, a); if (!o.error) walk(o.state); }
}
walk(HA.init(sc));
ok(paths > 1000, `the walk covered only ${paths} paths`);
ok(reachAllNoLoss === 0, `${reachAllNoLoss} paths reach every break and lose nobody money: the lesson has gone soft`);
const E = [...ends.keys()].map(k => k.replace(/!/g, "").split("").map(Number));
const front = [...ends.keys()].filter(k => { const a = k.replace(/!/g, "").split("").map(Number); return !E.some(b => b.every((x, i) => x >= a[i]) && b.some((x, i) => x > a[i])); });
ok(front.length >= 3, `only ${front.length} undominated endings: one path is close to best for everyone`);
{ // the pivot: from the same start, two first-day timetables give someone a different ending
  const pre = [A({ t: "queue", via: "rota" }), A({ t: "money", relief: 1, water: 1 }), A({ t: "predict", who: [] })];
  const tail = [A({ t: "prep", queue: 0, relief: 0 }), A({ t: "evening", on: true }), A({ t: "roster", r: { caretaker: { evening: "hall" }, attendant: { morning: "child" } } }), A({ t: "prep", queue: 0, relief: 0 }), A({ t: "hire", on: false }), A({ t: "roster", r: DAYR }), A({ t: "cover", via: "none" })];
  const one = HA.run(sc, pre.concat([A({ t: "roster", r: DAYR })], tail)), two = HA.run(sc, pre.concat([A({ t: "roster", r: { caretaker: { midday: "child", afternoon: "child" }, attendant: { afternoon: "hall" }, relief: { midday: "water", afternoon: "water" } } })], tail));
  ok(!one.error && !two.error, `the pivot test logs do not run (${one.error || two.error})`);
  if (!one.error && !two.error) ok(HA.diff(sc, one.state, two.state).some(d => !d.same), "changing the first hot day's timetable changes nobody's ending");
  ok(HA.pivotIndex(sc) === pre.length, "the replay point is not the first hot day's timetable");
}

// ---------- words ----------
const missing = (ids, table, what) => [...ids].filter(id => !(id in table)).forEach(id => fail(`${what} "${id}" has no words in tools/heat-assembly-text.js`));
missing(constraintIds, T.constraints, "constraint"); missing(resultIds, T.results, "result");
const engineSrc = fs.readFileSync(path.join(ROOT, "heat-assembly", "engine.js"), "utf8");
{ const body = engineSrc.slice(engineSrc.indexOf("function respond"), engineSrc.indexOf("function hotDay"));
  missing(new Set([...body.matchAll(/"([a-z]+-[a-z-]+|ok)"/g)].map(m => m[1])), T.replies, "reply"); }
missing(new Set([...engineSrc.matchAll(/error: "([a-z-]+)"/g)].map(m => m[1]).concat([...engineSrc.matchAll(/return "([a-z-]+)";/g)].map(m => m[1]))), T.errors, "error");
// every string in the text module and the game script passes the site's voice
const strings = []; (function walkT(o) { if (typeof o === "string") strings.push(o); else if (o && typeof o === "object") Object.values(o).forEach(walkT); })(T);
const gameSrc = fs.readFileSync(path.join(ROOT, "heat-assembly", "game.js"), "utf8");
for (const m of gameSrc.matchAll(/`([^`$]*)`|"([^"\\]{12,})"/g)) strings.push((m[1] || m[2] || "").replace(/<[^>]+>/g, " "));
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const holdRe = new RegExp(`\\b(${tone.voice.hold.map(esc).join("|")})\\b`, "i"), toneRe = new RegExp(`\\b(${tone.hold.map(esc).join("|")})\\b`, "i");
const susRe = tone.voice.suspicion ? new RegExp(`\\b(${tone.voice.suspicion.hold.map(esc).join("|")})\\b`, "i") : null;
for (const s of strings) {
  const m = s.match(holdRe) || s.match(toneRe) || (susRe && s.match(susRe));
  if (m && !tone.voice.allow.some(a => s.includes(a))) fail(`the voice check would stop "${m[1]}" in: ${s.slice(0, 120)}`);
  if (s.includes("\u2014")) fail(`an em dash in: ${s.slice(0, 120)}`);
}
// people are written without pronouns; their names are not used by the site's other games
for (const p of Object.values(T.people)) for (const f of ["pay", "care", "needs", "tag"]) if (/\b(he|she|his|her|hers|him)\b/i.test(p[f])) fail(`a pronoun in ${p.name}'s ${f}: ${p[f]}`);
{ const other = JSON.stringify(require("../data/core/PLACE_SIM.json").scenarios) + JSON.stringify(require("../data/core/HEAT_WEEK.json").people);
  Object.values(T.people).forEach(p => { if (new RegExp(`"name":\\s*"${p.name}"`).test(other)) fail(`${p.name} is already a person in another game on the site`); }); }
ok(sc.people.every(p => T.people[p.id]) && sc.roles.every(r => T.roles[r]), "a person or role in the scenario has no words");

// ---------- sources, page, hub panel and text twin ----------
let SRC = [];
try { SRC = require("./build-heat-assembly.js").sources({}); } catch (e) { fail(e.message); }
ok(SRC.length === sc.sources.length && SRC.every(s => /^https?:\/\//.test(s.url)), "a source does not resolve to a record with a link");
const pageF = path.join(ROOT, "heat-assembly", "index.html"), hubF = path.join(ROOT, "live-through-a-heatwave", "index.html"), llmsF = path.join(ROOT, "llms-full.txt");
if (!fs.existsSync(pageF)) fail("heat-assembly/index.html is missing: run node tools/build-static.js");
else {
  const pg = fs.readFileSync(pageF, "utf8"), hub = fs.readFileSync(hubF, "utf8"), llms = fs.readFileSync(llmsF, "utf8");
  const plain = s => s.replace(/&#39;|&rsquo;/g, "'").replace(/&amp;/g, "&").replace(/&quot;/g, '"');
  [T.lede, T.fictionalNote, T.end.question].concat(T.assumptions.map(a => a.text)).forEach(s => { const e = s.replace(/&/g, "&amp;").replace(/"/g, "&quot;"); ok(pg.includes(e) || plain(pg).includes(s), `the page is missing: ${s.slice(0, 80)}`); });
  T.plainLines(SRC).filter(l => l.length > 30).slice(0, 40).forEach(l => ok(llms.includes(l), `llms-full.txt is missing a line the page uses: ${l.slice(0, 80)}`));
  SRC.forEach(s => ok(pg.includes(s.url.replace(/&/g, "&amp;")) || pg.includes(s.url), `the page does not link source ${s.id}`));
  ok(/heat-assembly\/data\.js\?v=\d+/.test(pg) && /heat-assembly\/engine\.js\?v=\d+/.test(pg) && /heat-assembly\/game\.js\?v=\d+/.test(pg), "the page does not load the game's scripts with the cache version");
  ok(hub.includes("data-ha-embed") && !/<script[^>]+src="[^"]*heat-assembly/.test(hub), "the hub panel is missing, or loads the game before a reader presses play");
  ok(fs.existsSync(path.join(ROOT, "heat-assembly", "data.js")), "heat-assembly/data.js is missing");
}

if (bad.length) { console.error(`heat assembly check: ${bad.length} problem(s)\n- ` + [...new Set(bad)].slice(0, 40).join("\n- ")); process.exit(1); }
console.log(`heat assembly check passed: rules, ${paths.toLocaleString("en")} ${FULL ? "paths (every path)" : "paths (a sample; --full for all)"}, no path reaches every break without a loss, ${front.length} undominated endings, the queue rule never moves Noor, the pivot changes an ending, ${SRC.length} sources resolve, words pass the voice check`);
