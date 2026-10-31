// Who holds it up: draws the four roles for the chosen action from window.WHO (written by tools/build-pages.js).
// Kinds of body come from our reading of who usually plays each part; named organisations from published work.
(function () {
  "use strict";
  var W = window.WHO, main = document.querySelector("[data-who-main]"), side = document.querySelector("[data-who-side]"),
    list = document.querySelector("[data-who-list]"), sel = document.querySelector("[data-who-select]");
  if (!W || !main) return;
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var LV = {}; W.levers.forEach(function (l) { LV[l.id] = l; });
  var ORG = {}; W.orgs.forEach(function (o) { ORG[o.id] = o; });
  var S = { lever: null, org: null, open: {}, single: false, gaps: false };
  var SHOW = 6;

  // the picker: actions grouped as on the map's packages, each action once
  var seen = {}, groups = W.packages.map(function (p) {
    var ls = W.levers.filter(function (l) { return l.pk === p[0] && !seen[l.id] && (seen[l.id] = 1); });
    return [p, ls];
  }).filter(function (g) { return g[1].length; });
  list.innerHTML = groups.map(function (g) {
    return '<p class="who-gh">' + esc(g[0][1]) + "</p><ul>" + g[1].map(function (l) { return '<li><button type="button" data-lever="' + l.id + '">' + esc(l.t) + "</button></li>"; }).join("") + "</ul>";
  }).join("");
  sel.innerHTML = groups.map(function (g) { return '<optgroup label="' + esc(g[0][1]) + '">' + g[1].map(function (l) { return '<option value="' + l.id + '">' + esc(l.t) + "</option>"; }).join("") + "</optgroup>"; }).join("");
  list.addEventListener("click", function (e) { var b = e.target.closest("[data-lever]"); if (b) go(b.dataset.lever, true); });
  sel.addEventListener("change", function () { go(sel.value, true); });

  function orgsFor(id, role) { return W.orgs.filter(function (o) { return o.r === role && o.lv.indexOf(id) > -1; }).sort(function (a, b) { return a.n.localeCompare(b.n); }); }
  function kindsFor(l, role) { return l.who.filter(function (k) { return (W.typical[k] || []).indexOf(role) > -1; }); }

  function drawMain() {
    var l = LV[S.lever];
    var cols = W.roles.map(function (r) {
      var role = r[0], kinds = kindsFor(l, role), os = orgsFor(l.id, role), many = S.open[role] ? os : os.slice(0, SHOW);
      var flag = os.length === 0 ? "gap" : os.length === 1 ? "single" : "";
      var on = (S.gaps && flag === "gap") || (S.single && flag === "single");
      return '<section class="who-col' + (on ? " is-flag" : "") + '" aria-labelledby="who-' + role + '"><h3 id="who-' + role + '">' + esc(r[1]) + "</h3><p class=\"who-cd\">" + esc(r[2]) + "</p>" +
        '<p class="who-k">Kinds of body <span>(our reading)</span></p>' +
        (kinds.length ? '<ul class="who-kinds">' + kinds.map(function (k) { return '<li title="' + esc((W.inst[k] || [])[1]) + '">' + esc((W.inst[k] || [k])[0]) + "</li>"; }).join("") + "</ul>" : '<p class="who-none">Not usually named for this action.</p>') +
        '<p class="who-k">Named in our research</p>' +
        (os.length ? '<ul class="who-orgs">' + many.map(function (o) { return '<li><button type="button" data-org="' + o.id + '"' + (S.org === o.id ? ' aria-pressed="true"' : "") + ">" + esc(o.n) + "</button></li>"; }).join("") + "</ul>" +
          (os.length > SHOW ? '<button type="button" class="who-more" data-more="' + role + '">' + (S.open[role] ? "Show fewer" : "Show all " + os.length) + "</button>" : "") : "") +
        (flag === "gap" ? '<p class="who-flag who-flag--gap">No one found yet in our research: a task to solve together.</p>' : flag === "single" ? '<p class="who-flag">Held by one body in our research.</p>' : "") +
        "</section>";
    }).join("");
    main.innerHTML = '<div class="who-head"><p class="eyebrow">' + esc((W.packages.find(function (p) { return p[0] === l.pk; }) || [])[1] || "") + "</p><h2>" + esc(l.t) + "</h2><p>" + esc(l.x) + '</p><p class="who-links"><a href="/#break-' + l.id + '">See it on the map</a> · <a href="/together/">Agree who does what in one place</a></p></div>' +
      '<div class="who-toggles" role="group" aria-label="Highlight"><label><input type="checkbox" data-t="single"' + (S.single ? " checked" : "") + '> Parts held by one body</label><label><input type="checkbox" data-t="gaps"' + (S.gaps ? " checked" : "") + "> Parts where we found no one yet</label></div>" +
      '<div class="who-cols">' + cols + "</div>";
    main.querySelectorAll("[data-t]").forEach(function (c) { c.addEventListener("change", function () { S[c.dataset.t] = c.checked; drawMain(); }); });
    main.querySelectorAll("[data-more]").forEach(function (b) { b.addEventListener("click", function () { S.open[b.dataset.more] = !S.open[b.dataset.more]; drawMain(); }); });
    main.querySelectorAll("[data-org]").forEach(function (b) {
      b.addEventListener("click", function () { S.org = S.org === b.dataset.org ? null : b.dataset.org; drawMain(); drawSide(); mark(); });
      b.addEventListener("mouseenter", function () { mark(b.dataset.org); }); b.addEventListener("focus", function () { mark(b.dataset.org); });
      b.addEventListener("mouseleave", function () { mark(); }); b.addEventListener("blur", function () { mark(); });
    });
  }
  // everything else an organisation does lights up in the picker
  function mark(id) {
    var o = ORG[id || S.org];
    list.querySelectorAll("[data-lever]").forEach(function (b) {
      b.classList.toggle("is-also", !!o && o.lv.indexOf(b.dataset.lever) > -1 && b.dataset.lever !== S.lever);
      b.setAttribute("aria-current", String(b.dataset.lever === S.lever));
    });
  }
  function drawSide() {
    var o = ORG[S.org];
    if (!o) {
      var l = LV[S.lever];
      side.innerHTML = '<p class="who-k">Kinds of body involved</p><ul class="who-inst">' + l.who.map(function (k) { var i = W.inst[k] || [k, ""]; return "<li><b>" + esc(i[0]) + "</b><span>" + esc(i[1]) + "</span></li>"; }).join("") + '</ul><p class="who-tip">Select an organisation to see its published work and the other actions it works on.</p>';
      return;
    }
    side.innerHTML = '<p class="who-k">' + esc(W.groups[o.g] || "") + "</p><h3>" + esc(o.n) + "</h3><p>" + esc(o.d) + "</p>" + (o.u ? '<p><a href="' + esc(o.u) + '" target="_blank" rel="noopener">Its published work <span class="visually-hidden">(opens in a new tab)</span></a></p>' : "") +
      '<p class="who-k">Also works on</p><ul class="who-also">' + o.lv.filter(function (id) { return id !== S.lever && LV[id]; }).map(function (id) { return '<li><button type="button" data-lever="' + id + '">' + esc(LV[id].t) + "</button></li>"; }).join("") + "</ul>" +
      '<button type="button" class="fl-clear" data-close>Close</button>';
    side.querySelectorAll("[data-lever]").forEach(function (b) { b.addEventListener("click", function () { go(b.dataset.lever, true); }); });
    side.querySelector("[data-close]").addEventListener("click", function () { S.org = null; drawMain(); drawSide(); mark(); });
  }
  function go(id, push) {
    if (!LV[id]) return;
    S.lever = id; S.open = {}; if (S.org && ORG[S.org].lv.indexOf(id) < 0) S.org = null;
    sel.value = id; drawMain(); drawSide(); mark();
    if (push) history.replaceState(null, "", "#" + id);
  }
  var start = location.hash.slice(1);
  go(LV[start] ? start : "hap");
  window.addEventListener("hashchange", function () { var h = location.hash.slice(1); if (LV[h] && h !== S.lever) go(h); });
})();
