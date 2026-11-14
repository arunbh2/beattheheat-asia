/* The heat network finder on /heat-network/. The page already lists every organisation without this script; this only
   narrows the list by hiding rows. State lives in the address (shareable; back and forward restore it), never on a
   server. Rules and words come from network-core.js, shared with the build and its check. Nothing is ranked. */
(function () {
  "use strict";
  var N = window.HNCore, form = document.getElementById("hn-form"), list = document.getElementById("hn-list");
  if (!N || !form || !list) return;
  var count = document.getElementById("hn-count"), note = document.getElementById("hn-note");
  var cards = [].slice.call(list.querySelectorAll(".hn-card")), groups = [].slice.call(list.querySelectorAll(".hn-group"));
  var split = function (s) { return s ? s.split(" ") : []; };
  // one small record per row, read from the row itself, so the script holds no second copy of the data
  var R = cards.map(function (li) { var d = li.dataset; return { el: li, c: split(d.c), s: d.s, p: d.p, t: d.t, l: split(d.l), h: null }; });
  var actions = [].map.call(form.elements.action.options, function (o) { return o.value; }).filter(Boolean);
  var S = N.parseState(location.search, { actions: actions });
  // with no filter chosen, each group opens on its first few rows and a button for the rest, so the page is a short
  // overview, not a hundred screens. Any filter, search or link to one organisation shows every match.
  var FIRST = 5, open = {};
  groups.forEach(function (g, i) {
    var n = g.querySelectorAll(".hn-card").length; if (n <= FIRST) return;
    var b = document.createElement("button"); b.type = "button"; b.className = "hn-btn hn-all"; b.dataset.g = i;
    b.textContent = "Show all " + n + " in this group"; g.appendChild(b);
    b.addEventListener("click", function () { open[i] = true; draw(); var next = g.querySelectorAll(".hn-card")[FIRST]; if (next) { var a = next.querySelector("a"); if (a) a.focus(); } });
  });
  var word = function (name) { var el = form.elements[name]; return el.options[el.selectedIndex].text; };
  var plural = function (n) { return n + (n === 1 ? " organisation" : " organisations"); };
  var track = function (n) { try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: "heat-network-" + n, title: "Heat network: " + n, event: true }); } catch (e) {} };

  function toForm() { ["country", "action", "part", "type", "q"].forEach(function (k) { form.elements[k].value = S[k]; }); }
  function fromForm() {
    var s = N.emptyState(); ["country", "action", "part", "type"].forEach(function (k) { s[k] = form.elements[k].value; });
    s.q = form.elements.q.value; s.wide = S.wide && s.country === S.country;
    return N.parseState(N.toQuery(s), { actions: actions });   // one trip through the address rules, so the form never holds a state the address cannot
  }
  function commit(push) {
    var url = location.pathname + N.toQuery(S) + location.hash;
    if (url !== location.pathname + location.search + location.hash) history[push ? "pushState" : "replaceState"](null, "", url);
  }
  function draw() {
    if (S.q) R.forEach(function (r) { if (r.h === null) r.h = N.norm(r.el.textContent); });
    var n = 0;
    R.forEach(function (r) { var ok = N.test(r, S); r.el.hidden = !ok; if (ok) n++; });
    var on = N.active(S), html = "";
    groups.forEach(function (g, i) {
      var b = g.querySelector(".hn-all"), fold = !on.length && b && !open[i];
      if (fold) [].forEach.call(g.querySelectorAll(".hn-card"), function (li, k) { li.hidden = k >= FIRST; });
      if (b) b.hidden = !fold;
      g.hidden = !g.querySelector(".hn-card:not([hidden])");
    });
    count.textContent = !on.length ? plural(R.length) + " listed, in " + groups.length + " groups." : n ? plural(n) + " of " + R.length + " match." : "No organisation on this list matches every filter you chose.";
    document.getElementById("hn-clear").hidden = !on.length;
    // a country shows only listings that name it; regional and global bodies are one tap away, never mixed in unasked
    if (N.IN_REGION.has(S.country)) {
      var t = JSON.parse(JSON.stringify(S)); t.wide = true; var more = N.count(R, t) - (S.wide ? 0 : n);
      if (S.wide) html += '<p class="hn-more">Showing organisations whose listed work names ' + N.esc(word("country")) + ', and those working across the region or globally. <button type="button" class="hn-link" data-wide="0">Show only those that name ' + N.esc(word("country")) + "</button></p>";
      else if (more > 0) html += '<p class="hn-more">' + (more === 1 ? "1 more organisation on this list works" : more + " more organisations on this list work") + " across the region or globally" + (on.length > 1 ? (more === 1 ? " and matches your other filters" : " and match your other filters") : "") + '. <button type="button" class="hn-link" data-wide="1">Show them too</button></p>';
    }
    if (!n) {
      // say what removing each filter would show; nothing is loosened by itself
      var tries = on.map(function (k) { var u = JSON.parse(JSON.stringify(S)); u[k] = ""; if (k === "country") u.wide = false; return [k, N.count(R, u)]; }).filter(function (x) { return x[1] > 0; });
      var label = { country: "the place", action: "the action", part: "the part played", type: "the kind of organisation", q: "the search words" };
      html += '<div class="hn-empty"><p><b>Not found yet.</b> This list holds what Common Shade has found so far, so a gap here describes the list, not the place or the field.</p>' +
        (tries.length ? "<p>Without one filter:</p><ul>" + tries.map(function (x) { return '<li><button type="button" class="hn-link" data-drop="' + x[0] + '">Remove ' + label[x[0]] + "</button> " + plural(x[1]) + "</li>"; }).join("") + "</ul>" : "") +
        '<p>Know an organisation doing this work? <a href="/join/">Tell us</a>.</p></div>';
    }
    note.innerHTML = html;
  }
  function change(push, name) { S = fromForm(); commit(push); draw(); if (name) track(name); }
  var typing;
  form.addEventListener("change", function (e) { if (e.target.name !== "q") change(true, "filter-" + e.target.name); });
  form.elements.q.addEventListener("input", function () { clearTimeout(typing); typing = setTimeout(function () { change(false); }, 180); });
  form.addEventListener("submit", function (e) { e.preventDefault(); change(true, "search"); });
  document.getElementById("hn-clear").addEventListener("click", function () { S = N.emptyState(); toForm(); commit(true); draw(); form.elements.country.focus(); });
  note.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    if (b.dataset.wide) S.wide = b.dataset.wide === "1"; else if (b.dataset.drop) { S[b.dataset.drop] = ""; if (b.dataset.drop === "country") S.wide = false; }
    toForm(); commit(true); draw(); count.focus();
  });
  window.addEventListener("popstate", function () { S = N.parseState(location.search, { actions: actions }); toForm(); draw(); });
  // a link to one organisation (#org-id) always shows it, whatever filters the address also carries
  function showTarget() {
    var el = location.hash.indexOf("#org-") === 0 && document.getElementById(location.hash.slice(1));
    if (el && el.hidden) { S = N.emptyState(); var gi = groups.indexOf(el.closest(".hn-group")); if (gi >= 0) open[gi] = true; toForm(); commit(false); draw(); }
    if (el) el.scrollIntoView();
  }
  window.addEventListener("hashchange", showTarget);
  count.tabIndex = -1; form.hidden = false; toForm(); draw(); showTarget();
})();
