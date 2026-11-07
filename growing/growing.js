/* Common Shade: /growing/, "Watch Common Shade grow". The page is complete without this script: every update is a
   card, the canopy is drawn, the timeline is readable. This adds the filters and the question field, the last visit
   (kept only in this browser), the switch between the Updates and Canopy views (filters and the selected change carry
   across, and live in the URL so a view can be shared), selecting a change to light only its own connections, and the
   replay of the roots by year of publication. Nothing loops: the replay plays once when asked, stops when it leaves
   the screen, and steps without motion when reduced motion is preferred. Data: window.GW, from tools/build-growing.js. */
(function () {
  "use strict";
  var G = window.GW; if (!G) return;
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var form = $("#gw-find"), cards = $$(".gw-card"), status = $("#gw-status"), empty = $("#gw-empty");
  var svg = $(".gw-svg"), panel = $("#gw-panel"), fig = $("#gw-fig"), reveal = $("#gw-reveal");
  var range = $("#gw-range"), out = $("#gw-range-out"), play = $("#gw-play");
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var small = function () { return window.matchMedia && matchMedia("(max-width: 720px)").matches; };
  var store = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }, del: function (k) { try { localStorage.removeItem(k); } catch (e) {} } };
  var M = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var human = function (d) { var p = d.split("-"); return +p[2] + " " + M[+p[1] - 1] + " " + p[0]; };
  var today = new Date().toISOString().slice(0, 10);

  /* ---- state, read from and written to the URL ---- */
  var KEYS = ["q", "place", "people", "topic", "kind", "from", "to", "view", "sel", "frame"];
  var S = {}; var qs = new URLSearchParams(location.search); KEYS.forEach(function (k) { S[k] = qs.get(k) || ""; });
  if (!S.view) S.view = "cards";
  function writeURL() { var p = new URLSearchParams(); KEYS.forEach(function (k) { if (S[k] && !(k === "view" && S[k] === "cards")) p.set(k, S[k]); });
    var s = p.toString(); history.replaceState(null, "", location.pathname + (s ? "?" + s : "") + location.hash); }

  /* ---- filters ---- */
  form.hidden = false;
  var q = form.elements.q, fields = $$("[data-f]", form);
  function readForm() { S.q = q.value.trim(); fields.forEach(function (f) { var k = f.getAttribute("data-f"); S[k] = f.value; }); }
  function fillForm() { q.value = S.q; fields.forEach(function (f) { var k = f.getAttribute("data-f"); f.value = k === "kind" && S.kind === "revised" ? "" : S[k] || ""; });
    if (S.place || S.people || S.topic || (S.kind && S.kind !== "revised") || S.from || S.to) $("#gw-more").open = true; }
  function matches(c) {
    var d = c.dataset, words = S.q.toLowerCase().split(/\s+/).filter(Boolean), text = c.textContent.toLowerCase();
    if (S.place && d.places.split(" ").indexOf(S.place) < 0) return false;
    if (S.people && d.people.split(" ").indexOf(S.people) < 0) return false;
    if (S.topic && d.topics.split(" ").indexOf(S.topic) < 0) return false;
    if (S.kind === "revised" ? G.revised.indexOf(d.kind) < 0 : S.kind && d.kind !== S.kind) return false;
    if (S.from && d.added < S.from) return false;
    if (S.to && d.added > S.to) return false;
    return words.every(function (w) { return text.indexOf(w) > -1; });
  }
  function apply() {
    var shown = 0; cards.forEach(function (c) { var ok = matches(c); c.hidden = !ok; if (ok) shown++;
      var leaf = svg && svg.querySelector('.gw-leaf[data-id="' + c.id + '"]'); if (leaf) leaf.classList.toggle("is-out", !ok); });
    empty.hidden = shown > 0;
    var bits = []; if (S.kind === "revised") bits.push("corrections and revised readings");
    status.textContent = shown + " of " + cards.length + " changes shown" + (bits.length ? ": " + bits.join(", ") : "") + (shown < cards.length ? "." : ".");
    writeURL();
  }
  form.addEventListener("input", function () { readForm(); apply(); });
  function clearAll() { KEYS.forEach(function (k) { if (k !== "view" && k !== "sel" && k !== "frame") S[k] = ""; }); fillForm(); apply(); }
  $("#gw-clear").addEventListener("click", clearAll);
  $$("[data-clear]").forEach(function (b) { b.addEventListener("click", clearAll); });

  /* ---- the last visit, kept only in this browser ---- */
  var last = store.get("cs-growing-last"), off = store.get("cs-growing-off") === "1", lastBox = $("#gw-last");
  function lastUI() {
    lastBox.hidden = false;
    if (off) { lastBox.innerHTML = '<p>This page is not remembering your visits. <button type="button" class="gw-alt" data-l="on">Remember my visits in this browser</button></p>'; }
    else if (last && last < today) { var since = cards.filter(function (c) { return c.dataset.added > last; }).length;
      lastBox.innerHTML = "<p><b>Your last visit here was on " + human(last) + ".</b> " + (since ? since + (since === 1 ? " change has" : " changes have") + " been added since then. " : "Nothing has been added since then. ") +
        (since ? '<button type="button" class="gw-alt" data-l="since">Show only those</button> ' : "") + '<button type="button" class="gw-alt" data-l="forget">Forget my last visit</button></p><p class="gw-meta">Remembered only in this browser, never sent anywhere. The date range in the filters works on any device.</p>'; }
    else { lastBox.innerHTML = '<p class="gw-meta">This browser will remember the date of your visit, so next time you can see what changed since. Nothing is sent anywhere. <button type="button" class="gw-alt" data-l="forget">Don\'t remember</button></p>'; }
  }
  lastBox.addEventListener("click", function (e) { var b = e.target.closest("[data-l]"); if (!b) return; var a = b.getAttribute("data-l");
    if (a === "since") { S.from = last; S.to = ""; fillForm(); $("#gw-more").open = true; setView("cards"); apply(); }
    if (a === "forget") { store.del("cs-growing-last"); store.set("cs-growing-off", "1"); off = true; last = null; }
    if (a === "on") { store.del("cs-growing-off"); off = false; }
    lastUI(); });
  function remember() { if (!off) store.set("cs-growing-last", today); }
  window.addEventListener("pagehide", remember); document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") remember(); });
  lastUI();

  /* ---- two views ---- */
  var viewBtns = $$(".gw-view");
  function setView(v) { S.view = v === "canopy" ? "canopy" : "cards"; document.body.classList.toggle("gw--canopy", S.view === "canopy"); document.body.classList.toggle("gw--cards", S.view === "cards");
    viewBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-view") === S.view)); });
    if (S.view === "canopy" && small() && fig.hidden === false && !fig.dataset.shown) { fig.hidden = true; reveal.hidden = false; }
    writeURL(); }
  viewBtns.forEach(function (b) { b.addEventListener("click", function () { setView(b.getAttribute("data-view")); }); });
  if (small()) { fig.hidden = true; reveal.hidden = false; }
  reveal.addEventListener("click", function () { var on = fig.hidden; fig.hidden = !on; fig.dataset.shown = on ? "1" : ""; reveal.setAttribute("aria-expanded", String(on)); reveal.textContent = on ? "Hide the overview" : "Show the overview"; });

  /* ---- selecting a change: only its own connections light up ---- */
  var byId = {}; G.entries.forEach(function (e) { byId[e.id] = e; });
  function select(id, focusPanel) {
    S.sel = byId[id] ? id : ""; writeURL();
    if (!svg) return;
    svg.classList.toggle("has-sel", !!S.sel);
    $$(".gw-leaf", svg).forEach(function (l) { var on = l.getAttribute("data-id") === S.sel; l.classList.toggle("is-sel", on); l.setAttribute("aria-pressed", String(on)); });
    var e = byId[S.sel], tos = e ? e.links.map(function (l) { return l.to; }) : [];
    $$(".gw-wire", svg).forEach(function (w) { w.classList.toggle("is-on", w.getAttribute("data-from") === S.sel); });
    $$(".gw-target", svg).forEach(function (t) { t.classList.toggle("is-on", tos.indexOf(t.getAttribute("data-to")) > -1); });
    if (!e) { panel.innerHTML = '<p class="gw-meta">Select a change in the canopy, or choose "Show in the canopy" on any update.</p>'; return; }
    var card = document.getElementById(e.id), copy = card.cloneNode(true);
    copy.removeAttribute("id"); copy.hidden = false; copy.classList.add("gw-card--panel"); copy.setAttribute("tabindex", "-1");
    $$("[id]", copy).forEach(function (n) { n.removeAttribute("id"); });
    var conn = copy.querySelector(".gw-conn"); if (conn) conn.open = true;
    var sh = copy.querySelector(".gw-show"); if (sh) sh.remove();
    var back = document.createElement("button"); back.type = "button"; back.className = "gw-alt"; back.textContent = "Clear the selection"; back.addEventListener("click", function () { select(""); });
    copy.querySelector(".gw-acts").appendChild(back);
    panel.innerHTML = ""; panel.appendChild(copy); if (focusPanel) copy.focus();
  }
  if (svg) {
    svg.addEventListener("click", function (ev) { var l = ev.target.closest(".gw-leaf"); if (l) select(l.getAttribute("data-id") === S.sel ? "" : l.getAttribute("data-id"), false); });
    svg.addEventListener("keydown", function (ev) { var l = ev.target.closest(".gw-leaf"); if (!l) return;
      if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); select(l.getAttribute("data-id"), false); }
      if (ev.key === "Escape") select(""); });
  }
  $$(".gw-show").forEach(function (b) { b.hidden = false; b.addEventListener("click", function () { setView("canopy"); if (fig.hidden) reveal.click(); select(b.getAttribute("data-show"), true); $("#canopy").scrollIntoView({ block: "start" }); }); });

  /* ---- the roots by year of publication ---- */
  var strands = svg ? $$(".gw-strand", svg) : [], nums = svg ? $$(".gw-root-n", svg) : [], timer = null, visible = true;
  function frame(i) { i = Math.max(0, Math.min(G.frames.length - 1, +i)); S.frame = i === G.frames.length - 1 ? "" : String(i);
    strands.forEach(function (s) { s.classList.toggle("is-later", +s.getAttribute("data-f") > i); });
    nums.forEach(function (n) { n.textContent = G.frames[i].total[n.getAttribute("data-root")].toLocaleString("en-GB"); });
    range.value = i; out.textContent = G.frames[i].label; range.setAttribute("aria-valuetext", G.frames[i].label);
    $$(".gw-frame").forEach(function (f) { f.classList.toggle("is-now", +f.getAttribute("data-f") === i); });
    writeURL(); }
  function stop() { if (timer) { clearInterval(timer); timer = null; play.textContent = "Play the three years"; } }
  if (range) { $("#gw-replay").hidden = false;
    range.addEventListener("input", function () { stop(); frame(range.value); });
    play.addEventListener("click", function () { if (timer) return stop(); var i = 0; frame(0); play.textContent = "Pause";
      timer = setInterval(function () { if (!visible) return; i++; if (i >= G.frames.length) return stop(); frame(i); }, reduce ? 1600 : 1300); });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (!visible) stop(); }).observe(fig);
    $$(".gw-goframe").forEach(function (b) { b.hidden = false; b.addEventListener("click", function () { stop(); setView("canopy"); if (fig.hidden) reveal.click(); frame(b.getAttribute("data-goframe")); $("#canopy").scrollIntoView({ block: "start" }); }); });
  }

  /* ---- three ways in ---- */
  $$("[data-door]").forEach(function (a) { a.addEventListener("click", function (ev) { var d = a.getAttribute("data-door"); ev.preventDefault();
    if (d === "new") { S.kind = ""; setView("cards"); fillForm(); apply(); $("#updates").scrollIntoView({ block: "start" }); var first = cards.filter(function (c) { return !c.hidden; })[0]; if (first) first.focus({ preventScroll: true }); }
    if (d === "revised") { clearAll(); S.kind = "revised"; setView("cards"); apply(); $("#updates").scrollIntoView({ block: "start" }); var r = cards.filter(function (c) { return !c.hidden; })[0]; if (r) r.focus({ preventScroll: true }); }
    if (d === "connections") { setView("canopy"); if (fig.hidden) reveal.click(); var c = G.entries.filter(function (e) { return e.kind === "connection" && e.links.length; })[0] || G.entries[0]; select(c.id, false); $("#canopy").scrollIntoView({ block: "start" }); }
  }); });

  // arriving from the exit card: open on the canopy and its timeline (nothing plays until asked)
  var fromExit = qs.get("from") === "exit"; if (fromExit) { S.view = "canopy"; if (fig.hidden) reveal.click(); }
  fillForm(); setView(S.view); apply();
  if (S.frame !== "" && range) frame(S.frame); else if (range) frame(G.frames.length - 1);
  if (S.sel) select(S.sel, false);
})();
