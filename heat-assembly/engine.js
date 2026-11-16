/* The Heat Assembly: the rules of play. Pure and deterministic: no clock, no randomness, integers only, people walked in
   the scenario's own order. A game is a log of actions; HA.run(sc, log) rebuilds any state from it, so replay, the back
   button, shared links and the tests all use one mechanism. Numbers come from data/heat-assembly/scenario.json (every
   magnitude is a game mechanic); words come from tools/heat-assembly-text.js. Used in the browser (window.HA_ENGINE) and
   by tools/check-heat-assembly.js (module.exports). */
(function (root) {
  "use strict";
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  var has = function (a, x) { return a.indexOf(x) > -1; };
  var DAY = ["midday", "afternoon"], NIGHT = ["evening", "morning"];

  function init(sc) {
    var s = { v: sc.v, step: 0, budget: sc.budget, rota: sc.rota, queueFrom: 0, waterFrom: 0, evening: false,
      pending: [], hire: false, cover: {}, roster: {}, reserve: {}, short: {}, results: {}, predict: null, at: { roster: {}, cover: {} }, log: [] };
    sc.people.forEach(function (p) { s.reserve[p.id] = p.start; s.short[p.id] = 0; });
    return s;
  }
  var stepOf = function (sc, s) { return sc.steps[s.step] || null; };
  var roundOf = function (sc, s) { var st = stepOf(sc, s); return st ? st.round : 5; };
  var done = function (sc, s) { return s.step >= sc.steps.length; };

  // the staff who can work in a round: the two regulars, relief that has landed, and a same-day hire in round 4
  function staffFor(sc, s, r) {
    var night = r === 3, out = sc.staff.map(function (x) { return { id: x.id, cap: night ? x.cap.night : x.cap.day, services: x.services }; });
    var landed = 0; s.pending.forEach(function (p) { if (p.lands === r) landed += p.blocks; });
    if (landed) out.push({ id: "relief", cap: landed, services: sc.extraServices });
    if (r === 4 && s.hire) out.push({ id: "hired", cap: sc.hireBlocks, services: sc.extraServices });
    return out;
  }
  function blocksFor(r) { return r === 3 ? NIGHT : r === 2 || r === 4 ? DAY : []; }
  // which service is open in which block, from a roster: { "hall@midday": "caretaker", ... }
  function openSet(roster) {
    var o = {}; Object.keys(roster || {}).sort().forEach(function (who) { var m = roster[who];
      Object.keys(m).sort().forEach(function (b) { o[m[b] + "@" + b] = who; }); });
    return o;
  }
  function checkRoster(sc, s, r, roster) {
    if (!roster || typeof roster !== "object") return "roster-shape";
    var staff = staffFor(sc, s, r), blocks = blocksFor(r), seen = {};
    var ids = Object.keys(roster);
    for (var i = 0; i < ids.length; i++) {
      var who = ids[i], st = staff.filter(function (x) { return x.id === who; })[0];
      if (!st) return "no-such-staff";
      var m = roster[who]; if (!m || typeof m !== "object") return "roster-shape";
      var bs = Object.keys(m); if (bs.length > st.cap) return "over-cap";
      for (var j = 0; j < bs.length; j++) {
        var b = bs[j], sv = m[b];
        if (!has(blocks, b)) return "wrong-block";
        if (!has(sc.blockServices[b], sv) || !has(st.services, sv)) return "wrong-service";
        if (sv === "water" && !(s.waterFrom && s.waterFrom <= r)) return "no-water-point";
        if (sv === "hall" && b === "evening" && !s.evening) return "no-evening-hours";
        if (seen[sv + "@" + b]) return "service-twice";
        seen[sv + "@" + b] = 1;
      }
    }
    return "";
  }

  // who has to agree to an action, given its options
  function needs(sc, a) {
    var C = sc.consents, out = [];
    var add = function (k) { (C[k] || []).forEach(function (x) { if (!has(out, x)) out.push(x); }); };
    if (a.t === "queue" && a.via !== "wait") { add("queue"); if (a.via === "rota") add("coverRota"); if (a.via === "paid") add("coverPaid"); }
    if (a.t === "money") { if (a.relief) add("relief"); if (a.water) add("water"); }
    if (a.t === "prep") { if (a.queue) add("queue"); if (a.relief) add("relief"); }
    if (a.t === "evening" && a.on) add("evening");
    if (a.t === "hire" && a.on) add("hire");
    if (a.t === "roster") add("roster");
    if (a.t === "cover") { if (a.via === "rota") add("coverRota"); if (a.via === "paid") add("coverPaid"); }
    return out;
  }
  function cost(sc, a) {
    var P = sc.prices;
    if (a.t === "queue") return a.via === "paid" ? P.cover : 0;
    if (a.t === "money") return (a.relief ? P.relief : 0) + (a.water ? P.water : 0);
    if (a.t === "prep") return a.relief ? P.relief : 0;
    if (a.t === "evening") return a.on ? P.evening : 0;
    if (a.t === "hire") return a.on ? P.hire : 0;
    if (a.t === "cover") return a.via === "paid" ? P.cover : 0;
    return 0;
  }
  var rotaCost = function (a) { return (a.t === "queue" || a.t === "cover") && a.via === "rota" ? 1 : 0; };

  // the rule-played roles in solo: each answer names what would change it
  function respond(sc, s, a, role) {
    var r = roundOf(sc, s), c = cost(sc, a), open = openSet(s.roster[r]);
    if (role === "market") {
      if (a.t === "queue" && a.via === "none") return { ok: false, id: "market-needs-cover" };
      if (a.t === "cover" && !s.queueFrom) return { ok: false, id: "market-no-rule" };
      return { ok: true, id: a.t === "queue" || a.t === "prep" ? "market-queue-ok" : "market-ok" };
    }
    if (role === "workers") {
      if (rotaCost(a) && s.rota < 1) return { ok: false, id: "workers-no-rota" };
      if (a.t === "cover" && a.via !== "none" && !open["hall@midday"]) return { ok: false, id: "workers-hall-closed" };
      return { ok: true, id: "workers-ok" };
    }
    if (role === "municipal") {
      if (c > s.budget) return { ok: false, id: "municipal-funds", v: { need: c, left: s.budget } };
      return { ok: true, id: a.t === "evening" ? "municipal-evening" : "municipal-ok" };
    }
    if (role === "coordinator") return { ok: true, id: a.t === "evening" ? "coordinator-evening" : a.t === "roster" ? "coordinator-roster" : "coordinator-ok" };
    return { ok: true, id: "ok" };
  }

  // what each person could do on a hot day (rounds 2 and 4)
  function hotDay(sc, s, r) {
    var o = openSet(s.roster[r]), rule = s.queueFrom && s.queueFrom <= r, cov = s.cover[r] || "", out = {};
    var hallAny = o["hall@midday"] || o["hall@afternoon"], waterAny = o["water@midday"] || o["water@afternoon"];
    sc.people.forEach(function (p) {
      var res, keep = sc.reserve.keep, R = s.reserve[p.id], c = [];
      if (p.kind === "queue") {
        if (o["hall@midday"] && rule && cov) { res = { res: "break", place: "hall", block: "midday", delta: 0 }; c = ["hall-midday-open", "place-kept", "cover-" + cov]; }
        else if (o["hall@midday"] && R - p.own >= keep) { res = { res: "own", place: "hall", block: "midday", delta: -p.own }; c = ["hall-midday-open", rule ? "no-cover" : "no-rule", "paid-own-way"]; }
        else { res = { res: "none", place: "", block: "", delta: -1 }; c = o["hall@midday"] ? [rule ? "no-cover" : "no-rule", "reserve-too-low"] : ["hall-midday-closed"]; }
      } else if (p.kind === "dayrate") {
        var covering = rule && cov === "rota", ok = covering ? o["hall@afternoon"] : (o["hall@midday"] || o["hall@afternoon"]);
        res = ok ? { res: "break", place: "hall", block: covering || !o["hall@midday"] ? "afternoon" : "midday", delta: 0 } : { res: "none", place: "", block: "", delta: 0 };
        c = covering ? ["covering-midday", ok ? "hall-afternoon-open" : "hall-afternoon-closed"] : [ok ? "hall-open" : "hall-closed", "day-rate"];
      } else if (p.kind === "home") {
        var lost = (o["child@midday"] ? 0 : 1) + (o["child@afternoon"] ? 0 : 1);
        res = { res: "home", place: "", block: "", delta: -lost }; c = ["no-daytime-reach", o["child@midday"] ? "child-midday-open" : "child-midday-closed", o["child@afternoon"] ? "child-afternoon-open" : "child-afternoon-closed"];
      } else if (p.kind === "stall") {
        if (o["hall@afternoon"]) { res = { res: "break", place: "hall", block: "afternoon", delta: 0 }; c = ["hall-afternoon-open", "neighbour-covers"]; }
        else if (o["hall@midday"] && R - p.own >= keep) { res = { res: "own", place: "hall", block: "midday", delta: -p.own }; c = ["hall-afternoon-closed", "shut-at-peak", "paid-own-way"]; }
        else { res = { res: "none", place: "", block: "", delta: -1 }; c = [o["hall@midday"] ? "reserve-too-low" : "hall-closed", "shut-at-peak"]; }
      } else if (p.kind === "mobility") {
        if (waterAny) { res = { res: "break", place: "water", block: o["water@midday"] ? "midday" : "afternoon", delta: 0 }; c = ["water-open", "at-the-bay"]; }
        else if (hallAny && R - p.own >= keep) { res = { res: "own", place: "hall", block: o["hall@midday"] ? "midday" : "afternoon", delta: -p.own }; c = [s.waterFrom ? "water-unstaffed" : "no-water-point", "rickshaw", "paid-own-way"]; }
        else { res = { res: "none", place: "", block: "", delta: -1 }; c = [s.waterFrom ? "water-unstaffed" : "no-water-point", hallAny ? "reserve-too-low" : "hall-closed"]; }
      }
      res.c = c; out[p.id] = res;
    });
    return out;
  }
  // the hot night and the morning after (round 3)
  function hotNight(sc, s) {
    var o = openSet(s.roster[3]), eve = s.evening && o["hall@evening"], out = {};
    sc.people.forEach(function (p) {
      var res;
      if (p.kind === "queue") res = eve ? { res: "break", place: "hall", block: "evening", delta: 1, c: ["evening-open", "cool-evening"] } : { res: "none", place: "", block: "", delta: 0, c: [s.evening ? "evening-unstaffed" : "no-evening", "hot-room"] };
      else if (p.kind === "dayrate") res = eve ? { res: "break", place: "hall", block: "evening", delta: 0, c: ["evening-open", "day-rate"] } : { res: "none", place: "", block: "", delta: 0, c: [s.evening ? "evening-unstaffed" : "no-evening", "day-rate"] };
      else if (p.kind === "home") { var d = (eve ? 1 : 0) - (o["child@morning"] ? 0 : 1);
        res = { res: eve ? "break" : "none", place: eve ? "hall" : "", block: eve ? "evening" : "", delta: d, c: [eve ? "evening-open" : (s.evening ? "evening-unstaffed" : "no-evening"), o["child@morning"] ? "child-morning-open" : "child-morning-closed"] }; }
      else if (p.kind === "stall") res = { res: "home", place: "home", block: "", delta: 1, c: ["cooler-house"] };
      else if (p.kind === "mobility") res = o["water@morning"] ? { res: "break", place: "water", block: "morning", delta: 1, c: ["water-morning-open"] } : { res: "none", place: "", block: "", delta: 0, c: [s.waterFrom ? "water-unstaffed" : "no-water-point"] };
      out[p.id] = res;
    });
    return out;
  }
  // the feedback loop (a simplifying assumption, shown on the page): a loss lowers the reserve; a lower reserve means a
  // person cannot pay their own way next time; a loss at zero is counted as a day they could not cover
  function settle(sc, s, r, res) {
    s.results[r] = res;
    sc.people.forEach(function (p) { var x = res[p.id], v = s.reserve[p.id] + x.delta;
      x.before = s.reserve[p.id];
      if (v < 0) { s.short[p.id] += -v; v = 0; x.short = true; }
      s.reserve[p.id] = Math.min(sc.reserve.max, v); x.after = s.reserve[p.id]; });
  }

  // apply one action; never mutates the state passed in; returns { state, error, unmet }
  function apply(sc, s0, a) {
    if (done(sc, s0)) return { state: s0, error: "finished" };
    var st = stepOf(sc, s0); if (!a || a.t !== st.t) return { state: s0, error: "wrong-step" };
    var r = st.round, s = clone(s0), c = cost(sc, a), rc = rotaCost(a);
    var unmet = needs(sc, a).filter(function (x) { return !(a.consent && a.consent[x] === true); });
    if (unmet.length) return { state: s0, error: "consent", unmet: unmet };
    if (c > s.budget) return { state: s0, error: "funds" };
    if (rc > s.rota) return { state: s0, error: "rota" };
    var idx = s.log.length;
    if (a.t === "queue") {
      if (a.via === "none") return { state: s0, error: "needs-cover" };
      if (a.via === "rota" || a.via === "paid") { s.queueFrom = 2; s.cover[2] = a.via; s.at.queue = idx; s.at.cover[2] = idx; }
      else if (a.via !== "wait") return { state: s0, error: "bad-option" };
    } else if (a.t === "money") {
      if (a.relief) s.pending.push({ lands: 2, blocks: sc.reliefBlocks["2"], at: idx });
      if (a.water) { s.waterFrom = 2; s.at.water = idx; }
    } else if (a.t === "predict") {
      s.predict = (a.who || []).filter(function (id) { return sc.people.some(function (p) { return p.id === id; }); });
    } else if (a.t === "prep") {
      if (a.queue) { if (s.queueFrom) return { state: s0, error: "already-agreed" }; s.queueFrom = r + 1; s.at.queue = idx; }
      if (a.relief) s.pending.push({ lands: r + 1, blocks: sc.reliefBlocks[String(r + 1)], at: idx });
    } else if (a.t === "evening") { s.evening = !!a.on; if (a.on) s.at.evening = idx; }
    else if (a.t === "hire") { s.hire = !!a.on; if (a.on) s.at.hire = idx; }
    else if (a.t === "roster") {
      var e = checkRoster(sc, s, r, a.r); if (e) return { state: s0, error: e };
      s.roster[r] = clone(a.r); s.at.roster[r] = idx;
    } else if (a.t === "cover") {
      if (a.via !== "none") {
        if (!(s.queueFrom && s.queueFrom <= r)) return { state: s0, error: "no-queue-rule" };
        if (!openSet(s.roster[r])["hall@midday"]) return { state: s0, error: "hall-closed-midday" };
        s.cover[r] = a.via; s.at.cover[r] = idx;
      }
    }
    s.budget -= c; s.rota -= rc;
    s.log.push(clone(a)); s.step++;
    // a hot day is lived once its last decision is made; the night once its timetable is set
    if (a.t === "roster" && r === 2) settle(sc, s, 2, hotDay(sc, s, 2));
    if (a.t === "roster" && r === 3) settle(sc, s, 3, hotNight(sc, s));
    if (a.t === "cover" && r === 4) settle(sc, s, 4, hotDay(sc, s, 4));
    return { state: s, error: "" };
  }
  function run(sc, log) {
    var s = init(sc);
    for (var i = 0; i < (log || []).length; i++) { var o = apply(sc, s, log[i]); if (o.error) return { state: s, error: o.error, at: i }; s = o.state; }
    return { state: s, error: "" };
  }

  // how a service stood in a round: funded (paid for), open (staffed in a block), and for whom it was usable
  function services(sc, s, r) {
    var o = openSet(s.roster[r]), blocks = blocksFor(r), res = s.results[r] || {};
    var list = r === 3 ? ["hall", "child", "water"] : ["hall", "child", "water"], out = [];
    list.forEach(function (sv) {
      var funded = sv === "hall" ? (r === 3 ? s.evening : true) : sv === "water" ? !!(s.waterFrom && s.waterFrom <= r) : true;
      var openIn = blocks.filter(function (b) { return o[sv + "@" + b]; });
      var users = sc.people.filter(function (p) { var x = res[p.id]; return x && (x.res === "break" || x.res === "own") && x.place === sv; }).map(function (p) { return p.id; });
      out.push({ id: sv, funded: funded, open: openIn, by: openIn.map(function (b) { return o[sv + "@" + b]; }), usable: users });
    });
    return out;
  }
  function ledger(sc, s, r) {
    return { round: r, people: sc.people.map(function (p) { var x = (s.results[r] || {})[p.id]; return x ? { id: p.id, res: x.res, place: x.place, block: x.block, delta: x.delta, before: x.before, after: x.after, short: !!x.short } : null; }).filter(Boolean),
      services: services(sc, s, r), budget: s.budget, rota: s.rota };
  }
  // why a result happened: the decisions that set it up, the constraints that applied, and the result
  function trace(sc, s, id, r) {
    var x = (s.results[r] || {})[id]; if (!x) return [];
    var out = [], dec = function (i, why) { if (typeof i === "number") out.push({ kind: "decision", log: i, t: s.log[i].t, why: why }); };
    var c = x.c || [];
    if (has(c, "place-kept") || has(c, "no-cover") || has(c, "covering-midday")) dec(s.at.queue, "queue");
    if (s.at.cover[r] !== undefined && (has(c, "place-kept") || has(c, "covering-midday"))) dec(s.at.cover[r], "cover");
    if (r === 3 && s.at.evening !== undefined) dec(s.at.evening, "evening");
    if ((has(c, "water-open") || has(c, "water-morning-open") || has(c, "water-unstaffed")) && s.at.water !== undefined) dec(s.at.water, "water");
    dec(s.at.roster[r], "roster");
    c.forEach(function (k) { out.push({ kind: "constraint", id: k }); });
    out.push({ kind: "result", id: x.res, delta: x.delta, before: x.before, after: x.after, short: !!x.short });
    return out;
  }
  // a person's whole game, for the outcomes and the comparison
  function outcome(sc, s, id) {
    var o = { id: id, breaks: [], lost: 0, short: s.short[id], reserve: s.reserve[id], rounds: {} };
    [2, 3, 4].forEach(function (r) { var x = (s.results[r] || {})[id]; if (!x) return;
      o.rounds[r] = x.res + (x.place ? "@" + x.place : "") + ":" + x.delta;
      if (x.res === "break" || x.res === "own") o.breaks.push(r);
      if (x.delta < 0) o.lost += -x.delta; });
    return o;
  }
  function diff(sc, a, b) {
    return sc.people.map(function (p) { var x = outcome(sc, a, p.id), y = outcome(sc, b, p.id);
      return { id: p.id, a: x, b: y, same: JSON.stringify(x) === JSON.stringify(y) }; });
  }
  var pivotIndex = function (sc) { for (var i = 0; i < sc.steps.length; i++) if (sc.steps[i].round === 2 && sc.steps[i].t === "roster") return i; return -1; };
  function encode(sc, log) { return sc.v + "." + log.map(function (a) { return JSON.stringify(a); }).join("~"); }
  function decode(sc, str) {
    try { str = String(str || ""); var dot = str.indexOf("."); if (dot < 0 || str.slice(0, dot) !== String(sc.v)) return null;
      var body = str.slice(dot + 1); if (!body) return [];
      return body.split("~").map(function (x) { var a = JSON.parse(x); if (!a || typeof a !== "object" || typeof a.t !== "string") throw 0; return a; });
    } catch (e) { return null; }
  }

  var API = { init: init, apply: apply, run: run, respond: respond, needs: needs, cost: cost, staffFor: staffFor, blocksFor: blocksFor,
    openSet: openSet, checkRoster: checkRoster, services: services, ledger: ledger, trace: trace, outcome: outcome, diff: diff,
    pivotIndex: pivotIndex, encode: encode, decode: decode, stepOf: stepOf, roundOf: roundOf, done: done };
  if (typeof module === "object" && module.exports) module.exports = API; else root.HA_ENGINE = API;
})(typeof window !== "undefined" ? window : this);
