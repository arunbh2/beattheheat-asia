/* Common Shade: Heat Opportunities, the page script. Without it every card shows, open first, with its status as of the
   build. With it: views, filters (kept in the address, so a filtered view can be shared), statuses recalculated for the moment
   the reader looks, copy link, saved searches and saved listings in this browser only, and print. Rules: hub-core.js. */
(function () {
  "use strict";
  var D = window.OPPDATA, H = window.HubCore; if (!D || !H) return;
  var now = Date.now(), byId = {}; D.items.forEach(function (it) { byId[it.id] = it; });
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  $$("[data-js]").forEach(function (el) { el.hidden = false; });
  // statuses as of now, on every card (the build's statuses are only as fresh as the build)
  $$("[data-id]").forEach(function (c) { var it = byId[c.getAttribute("data-id")]; if (!it) return;
    var l = H.lifecycle(it, now), v = H.verification(it, now), a = $("[data-life]", c), b = $("[data-ver]", c), dl = $("[data-dl]", c);
    if (a) { a.textContent = l.label; a.title = l.why; } if (b) { b.textContent = v.label; b.title = v.why; } if (dl) dl.textContent = H.deadlineLabel(it, now); });
  var store = { get: function (k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }, set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } } };
  function flash(btn, text) { var t = btn.textContent; btn.textContent = text; setTimeout(function () { btn.textContent = t; }, 1600); }
  function copy(text, btn) { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { flash(btn, "Copied"); }, function () { flash(btn, "Could not copy"); }); else flash(btn, "Could not copy"); }
  $$("[data-copy]").forEach(function (b) { b.addEventListener("click", function () { copy(b.getAttribute("data-copy"), b); }); });
  $$("[data-print]").forEach(function (b) { b.addEventListener("click", function () { window.print(); }); });
  // saved listings (this device only)
  var saved = store.get("cs-opp-saved", []);
  $$("[data-save]").forEach(function (b) { var id = b.getAttribute("data-save"), on = saved.indexOf(id) > -1; b.setAttribute("aria-pressed", on); b.textContent = on ? "Saved" : "Save";
    b.addEventListener("click", function () { var i = saved.indexOf(id); if (i > -1) saved.splice(i, 1); else saved.push(id); var ok = store.set("cs-opp-saved", saved); var on2 = saved.indexOf(id) > -1;
      b.setAttribute("aria-pressed", on2); b.textContent = ok ? (on2 ? "Saved" : "Save") : "Not saved (storage off)"; }); });
  var form = $(".op-filters"); if (!form) return; // a detail page stops here
  var cards = $$(".op-list [data-id]"), count = $("[data-count]"), none = $("[data-none]"), arch = $("#archive");
  var state = H.readState(location.search);
  function fill() { $$("[data-f]", form).forEach(function (el) { var k = el.getAttribute("data-f");
    if (k === "relall") el.checked = state.rel === "all"; else if (el.type === "checkbox") el.checked = state[k] === el.value; else el.value = state[k] || ""; });
    $$("[data-view]").forEach(function (a) { var on = (state.view || "open") === a.getAttribute("data-view"); if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); }); }
  function run(push) {
    var n = 0, nNet = 0;
    cards.forEach(function (c) { var it = byId[c.getAttribute("data-id")], ok = it && H.matches(it, state, now); c.hidden = !ok; if (ok) n++;
      else if (it && it.rel === "network" && state.rel !== "all" && H.matches(it, Object.assign({}, state, { rel: "all" }), now)) nNet++; });
    var inArch = (state.view === "archive"); arch.hidden = !inArch && !cards.some(function (c) { return !c.hidden && arch.contains(c); });
    var v = (H.VIEWS.filter(function (x) { return x[0] === (state.view || "open"); })[0] || [, "Open now"])[1];
    count.textContent = n + (n === 1 ? " opportunity" : " opportunities") + " shown (" + v.toLowerCase() + ")" + (nNet ? "; " + nNet + " more at heat-network organisations if you include them." : ".");
    none.hidden = n > 0;
    if (push) history.replaceState(null, "", location.pathname + H.writeState(state) + location.hash);
  }
  form.addEventListener("input", function (e) { var el = e.target, k = el.getAttribute("data-f"); if (!k) return;
    if (k === "relall") { if (el.checked) state.rel = "all"; else delete state.rel; }
    else if (el.type === "checkbox") { if (el.checked) state[k] = el.value; else delete state[k]; }
    else if (el.value) state[k] = el.value; else delete state[k];
    if (k === "rel" && el.value) { var ra = $("[data-f=relall]", form); if (ra) ra.checked = false; }
    run(true); });
  $$("[data-view]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); state.view = a.getAttribute("data-view"); if (state.view === "open") delete state.view; fill(); run(true); }); });
  $$(".op-paths a").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); state = H.readState(a.getAttribute("href")); fill(); run(true); $("#find").scrollIntoView(); }); });
  $("[data-reset]").addEventListener("click", function () { state = {}; fill(); run(true); });
  $("[data-copyview]").addEventListener("click", function (e) { copy(location.href, e.target); });
  // saved searches (this device only)
  var box = $("[data-saved]"), list = $("[data-saved-list]");
  function drawSaved() { var s = store.get("cs-opp-searches", []); box.hidden = !s.length; list.innerHTML = "";
    s.forEach(function (q, i) { var li = document.createElement("li"), a = document.createElement("a"), x = document.createElement("button");
      a.href = location.pathname + q; a.textContent = q.replace(/^\?/, "").replace(/&/g, " · ").replace(/=/g, ": ") || "All open"; a.addEventListener("click", function (e) { e.preventDefault(); state = H.readState(q); fill(); run(true); });
      x.type = "button"; x.className = "fo-btn"; x.textContent = "Remove"; x.addEventListener("click", function () { s.splice(i, 1); store.set("cs-opp-searches", s); drawSaved(); });
      li.appendChild(a); li.appendChild(document.createTextNode(" ")); li.appendChild(x); list.appendChild(li); }); }
  $("[data-savesearch]").addEventListener("click", function (e) { var s = store.get("cs-opp-searches", []), q = H.writeState(state); if (s.indexOf(q) < 0) s.unshift(q);
    flash(e.target, store.set("cs-opp-searches", s.slice(0, 10)) ? "Saved on this device" : "Not saved (storage off)"); drawSaved(); });
  drawSaved(); fill(); run(false);
}());
