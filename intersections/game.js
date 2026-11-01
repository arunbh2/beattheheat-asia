/* Who does protection reach? Eight composite people on one street; choose three protections, see who each reaches and
   why, then redesign two of them. A thinking exercise: the rules simplify the barriers described on Who heat hits hardest.
   Data: window.IX (tools/build-intersections.js). Nothing here is sent anywhere. */
(function () {
  "use strict";
  var X = window.IX, root = document.querySelector("[data-ix]"); if (!X || !root) return;
  var $ = function (s) { return root.querySelector(s); }, $$ = function (s) { return [].slice.call(root.querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var PR = {}; X.protect.forEach(function (p) { PR[p.id] = p; });
  var S = { round: 1, chosen: [], fixed: [], first: null };

  // does protection p reach person h, and if not, which of her or his barriers stop it?
  function test(p, h) {
    var needs = (h.needs || []).concat(h.tags);
    if (p.only && !p.only.some(function (t) { return needs.indexOf(t) >= 0; })) return { na: true };
    var removed = S.fixed.indexOf(p.id) >= 0 ? p.fix.removes : [];
    var stop = p.blocks.filter(function (t) { return h.tags.indexOf(t) >= 0 && removed.indexOf(t) < 0; });
    return { ok: !stop.length, stop: stop };
  }
  function run() {
    return X.people.map(function (h) {
      var r = S.chosen.map(function (id) { return { p: PR[id], t: test(PR[id], h) }; });
      return { h: h, r: r, reached: r.filter(function (x) { return !x.t.na && x.t.ok; }).length, relevant: r.filter(function (x) { return !x.t.na; }).length };
    });
  }
  var because = function (stop) { return stop.map(function (t) { return X.tags[t]; }).join(", and "); };

  function step(n) {
    S.round = n;
    $$("[data-ix-step]").forEach(function (s) { s.classList.toggle("is-on", +s.dataset.ixStep <= n); });
  }
  function count() {
    var n = S.chosen.length;
    $("[data-ix-count]").textContent = S.round === 3 ? S.fixed.length + " of 2 redesigns chosen" : n + " of 3 chosen";
    $("[data-ix-go]").disabled = S.round === 3 ? !S.fixed.length : n !== 3;
  }
  function people(res) {
    res.forEach(function (x) {
      var el = root.querySelector('[data-res="' + x.h.id + '"]'), li = el.closest(".ix-p");
      var full = x.relevant > 0 && x.reached === x.relevant;
      li.classList.toggle("is-missed", x.reached === 0); li.classList.toggle("is-reached", full); li.classList.toggle("is-partly", x.reached > 0 && !full);
      el.textContent = x.reached === 0 ? "Missed by everything" : full ? "Reached by all " + x.relevant + " meant for them" : "Partly reached: " + x.reached + " of " + x.relevant;
    });
  }
  function table(res) {
    return '<div class="ix-tablewrap"><table class="ix-tab"><caption class="visually-hidden">Who each protection reached</caption><thead><tr><th scope="col">Person</th>' +
      S.chosen.map(function (id) { return '<th scope="col">' + esc(PR[id].name) + (S.fixed.indexOf(id) >= 0 ? " <small>(redesigned)</small>" : "") + "</th>"; }).join("") + "</tr></thead><tbody>" +
      res.map(function (x) { return '<tr class="' + (x.reached ? "" : "ix-row-miss") + '"><th scope="row">' + esc(x.h.who) + "</th>" + x.r.map(function (c) {
        return c.t.na ? '<td class="ix-na">Not for this person</td>' : c.t.ok ? '<td class="ix-yes"><span aria-hidden="true">●</span> Reached</td>' : '<td class="ix-no"><span aria-hidden="true">○</span> Missed: ' + esc(because(c.t.stop)) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>";
  }
  var tally = function (res) { return { full: res.filter(function (x) { return x.relevant && x.reached === x.relevant; }).length, part: res.filter(function (x) { return x.reached && x.reached < x.relevant; }).length, none: res.filter(function (x) { return !x.reached; }).length }; };
  var headline = function (t) { return '<ul class="lv-sum ix-sum"><li><b>' + t.full + '</b><span>reached by every protection meant for them</span></li><li><b>' + t.part + '</b><span>partly reached</span></li><li><b>' + t.none + '</b><span>missed by everything</span></li></ul>'; };
  function crossings(res) {
    var missed = res.filter(function (x) { return x.reached === 0; });
    if (!missed.length) missed = res.filter(function (x) { var w = {}; x.r.forEach(function (c) { if (!c.t.na) c.t.stop.forEach(function (t) { w[t] = 1; }); }); return Object.keys(w).length > 1; });
    if (!missed.length) return '<p class="lv-out lv-out--green">Every protection reached everyone it was meant for. On a real street, the only way to know is to ask the people at the crossings.</p>';
    return '<div class="ix-cross"><h4>Where the barriers meet</h4>' + missed.map(function (x) {
      var why = {}; x.r.forEach(function (c) { if (!c.t.na) c.t.stop.forEach(function (t) { why[t] = 1; }); });
      var tags = Object.keys(why);
      return "<p><b>" + esc(x.h.who) + ".</b> " + (tags.length > 1 ? "Each protection stopped at a different place: this person " + esc(tags.map(function (t) { return X.tags[t]; }).join(", and ")) + ". No single barrier explains it; it is where they meet." :
        tags.length ? "One barrier stopped everything you chose: this person " + esc(X.tags[tags[0]]) + "." : "None of your choices was meant for this person.") + ' <span class="ix-str">' + esc(x.h.strength) + "</span></p>"; }).join("") + "</div>";
  }

  function go() {
    var res = run();
    if (S.round === 1) {
      S.first = res; step(2); people(res);
      $("[data-ix-out]").innerHTML = '<h3 class="ix-h3">The heatwave arrives</h3>' + headline(tally(res)) + table(res) + crossings(res) +
        '<p class="lv-ctrl"><button type="button" class="lv-next" data-ix-redesign>Redesign two of them <span aria-hidden="true">→</span></button></p>';
      $("[data-ix-redesign]").addEventListener("click", redesign);
      lock(true); $("[data-ix-go]").hidden = true;
    } else {
      people(res);
      var b0 = tally(S.first), b1 = tally(res), still = res.filter(function (x) { return x.reached < x.relevant || !x.relevant; }).filter(function (x) { return x.relevant; });
      $("[data-ix-out]").innerHTML = '<h3 class="ix-h3">The same heatwave, redesigned</h3><p class="ix-big">Reached by every protection meant for them: <b>' + b0.full + "</b> before, <b>" + b1.full + " of 8</b> after.</p>" + headline(b1) + table(res) + crossings(res) +
        '<div class="ix-reflect"><h4>What this shows</h4><ul>' +
        "<li>Most protections work for most people. The people they miss are usually missed by several protections at once, for different reasons.</li>" +
        "<li>Redesigns that worked came from the barrier’s side: languages, transport, childcare, safety, papers, distance.</li>" +
        (still.length ? "<li>Still not fully reached: " + esc(still.map(function (x) { return x.h.who.charAt(0).toLowerCase() + x.h.who.slice(1); }).join("; ")) + ". The people closest to them, such as neighbours, groups and health workers, are often the way in.</li>" : "<li>No one was left out this time. On a real street, the only way to know is to ask the people at the crossings.</li>") +
        '</ul><p class="lv-ctrl"><button type="button" class="lv-next" data-ix-again>Play again with different choices</button> <a class="lv-back" href="/who-is-at-risk/">Who heat hits hardest</a></p></div>';
      $("[data-ix-again]").addEventListener("click", reset);
      $("[data-ix-go]").hidden = true;
    }
    $("[data-ix-out]").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }
  function lock(on) { $$("[data-pr]").forEach(function (c) { c.disabled = on; }); }
  function redesign() {
    step(3); $("[data-ix-title]").textContent = "Redesign two of your protections";
    S.chosen.forEach(function (id) { var b = root.querySelector('[data-adapt="' + id + '"]'); b.hidden = false; });
    $("[data-ix-go]").hidden = false; $("[data-ix-go]").innerHTML = 'Run the heatwave again <span aria-hidden="true">→</span>'; count();
    $("[data-ix-cards]").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function reset() {
    S = { round: 1, chosen: [], fixed: [], first: null }; step(1);
    $$("[data-pr]").forEach(function (c) { c.checked = false; c.disabled = false; });
    $$("[data-adapt]").forEach(function (b) { b.hidden = true; b.setAttribute("aria-pressed", "false"); b.textContent = "Redesign it"; });
    $$("[data-fix]").forEach(function (f) { f.hidden = true; });
    $$(".ix-p").forEach(function (li) { li.classList.remove("is-missed", "is-reached"); });
    $$("[data-res]").forEach(function (r) { r.textContent = ""; });
    $("[data-ix-title]").textContent = "Choose three protections"; $("[data-ix-out]").innerHTML = "";
    $("[data-ix-go]").hidden = false; $("[data-ix-go]").innerHTML = 'The heatwave arrives <span aria-hidden="true">→</span>'; count();
    root.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  $$("[data-pr]").forEach(function (c) {
    c.addEventListener("change", function () {
      if (c.checked && S.chosen.length >= 3) { c.checked = false; return; }
      S.chosen = $$("[data-pr]").filter(function (x) { return x.checked; }).map(function (x) { return x.dataset.pr; }); count();
    });
  });
  $$("[data-adapt]").forEach(function (b) {
    b.addEventListener("click", function () {
      var id = b.dataset.adapt, on = S.fixed.indexOf(id) >= 0;
      if (!on && S.fixed.length >= 2) return;
      S.fixed = on ? S.fixed.filter(function (x) { return x !== id; }) : S.fixed.concat(id);
      b.setAttribute("aria-pressed", String(!on)); b.textContent = on ? "Redesign it" : "Redesigned";
      root.querySelector('[data-fix="' + id + '"]').hidden = on; count();
    });
  });
  $("[data-ix-go]").addEventListener("click", go);
  $("[data-ix-reset]").addEventListener("click", reset);
  count();
})();
