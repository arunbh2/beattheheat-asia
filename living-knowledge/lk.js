/* Common Shade: Living Knowledge, the page script. Without it every practice shows and every record page is complete.
   With it: filters (state in the address), a comparison tray of up to four (kept in this browser), the comparison table,
   the fit questions with their reasons, copy link and print. Rules: lk-core.js. Result counts are announced politely;
   nothing animates on keyboard actions. */
(function () {
  "use strict";
  var D = window.LKDATA, C = window.LKCore; if (!D || !C) return;
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var byId = {}; D.practices.forEach(function (p) { byId[p.id] = p; });
  $$("[data-js]").forEach(function (el) { el.hidden = false; });
  var store = { get: function (k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v || d; } catch (e) { return d; } }, set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } } };
  function flash(btn, text) { var t = btn.textContent; btn.textContent = text; setTimeout(function () { btn.textContent = t; }, 1600); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  $$("[data-print]").forEach(function (b) { b.addEventListener("click", function () { window.print(); }); });
  $$("[data-copy]").forEach(function (b) { b.addEventListener("click", function () { var u = b.getAttribute("data-copy");
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(u).then(function () { flash(b, "Copied"); }, function () { flash(b, "Could not copy"); }); else flash(b, "Could not copy"); }); });

  // ---- comparison tray (this browser only; at most four)
  var picks = store.get("cs-lk-compare", []).filter(function (id) { return /^[a-z0-9-]+$/.test(id); }).slice(0, C.MAX_COMPARE);
  var tray = $("[data-tray]");
  function drawTray() {
    $$("[data-compare]").forEach(function (b) { var on = picks.indexOf(b.getAttribute("data-compare")) > -1; b.setAttribute("aria-pressed", on); b.textContent = on ? "In compare" : "Add to compare"; b.disabled = !on && picks.length >= C.MAX_COMPARE; });
    if (!tray) return; tray.hidden = !picks.length;
    var list = $("[data-tray-list]", tray); if (list) list.textContent = picks.length + " of " + C.MAX_COMPARE + " chosen";
    var go = $("[data-tray-go]", tray); if (go) go.href = "/living-knowledge/compare/?ids=" + picks.join(",");
  }
  $$("[data-compare]").forEach(function (b) { b.addEventListener("click", function () { var id = b.getAttribute("data-compare"), i = picks.indexOf(id);
    if (i > -1) picks.splice(i, 1); else if (picks.length < C.MAX_COMPARE) picks.push(id); store.set("cs-lk-compare", picks); drawTray(); }); });
  var clear = $("[data-tray-clear]"); if (clear) clear.addEventListener("click", function () { picks = []; store.set("cs-lk-compare", picks); drawTray(); });
  drawTray();

  // ---- browse filters
  var form = $(".lk-filters");
  if (form) {
    var cards = $$(".lk-grid [data-id]"), count = $("[data-count]"), none = $("[data-none]"), state = C.readState(location.search);
    var fill = function () { $$("[data-f]", form).forEach(function (el) { el.value = state[el.getAttribute("data-f")] || ""; }); };
    var run = function (push) { var n = 0; cards.forEach(function (c) { var ok = C.matches(byId[c.getAttribute("data-id")], state); c.hidden = !ok; if (ok) n++; });
      count.textContent = n + (n === 1 ? " practice shown" : " practices shown") + (Object.keys(state).length ? " (filtered)." : ".");
      none.hidden = n > 0; if (push) history.replaceState(null, "", location.pathname + C.writeState(state) + location.hash); };
    form.addEventListener("input", function (e) { var k = e.target.getAttribute("data-f"); if (!k) return; if (e.target.value) state[k] = e.target.value; else delete state[k]; run(true); });
    $("[data-reset]", form).addEventListener("click", function () { state = {}; fill(); run(true); });
    $("[data-copyview]", form).addEventListener("click", function (e) { var b = e.target; if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(location.href).then(function () { flash(b, "Copied"); }, function () { flash(b, "Could not copy"); }); else flash(b, "Could not copy"); });
    $$("[data-quick]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); state = C.readState("?" + a.getAttribute("data-quick")); fill(); run(true); $("#browse").scrollIntoView(); }); });
    fill(); run(false);
  }

  // ---- comparison page
  var out = $("[data-compare-out]");
  if (out) {
    var ids = (new URLSearchParams(location.search).get("ids") || picks.join(",")).split(",").filter(function (id) { return byId[id]; }).slice(0, C.MAX_COMPARE);
    if (ids.length) {
      var list = ids.map(function (id) { return byId[id]; }), rows = C.compareRows(list);
      out.innerHTML = '<div class="lk-tablewrap" role="region" aria-label="Comparison" tabindex="0"><table class="lk-table lk-compare"><caption>Comparing ' + list.length + (list.length === 1 ? " practice" : " practices") + '. Each is documented in its own setting; side by side is not a ranking.</caption><thead><tr><th scope="col">Field</th>' +
        list.map(function (p) { return '<th scope="col"><a href="/living-knowledge/' + esc(p.id) + '/">' + esc(p.title) + "</a></th>"; }).join("") + "</tr></thead><tbody>" +
        rows.map(function (r) { return '<tr><th scope="row">' + esc(r[0]) + "</th>" + r[1].map(function (v) { return "<td>" + esc(v) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>" +
        '<p><button type="button" class="lk-btn" data-print-c>Print this comparison</button> <a class="lk-btn" href="/living-knowledge/#browse">Choose others</a></p>';
      var pc = $("[data-print-c]", out); if (pc) pc.addEventListener("click", function () { window.print(); });
    }
  }

  // ---- fit questions (answers stay in this browser)
  var fitForm = $("[data-fit]");
  if (fitForm) {
    var fitOut = $("[data-fit-out]"), fitCount = $("[data-fit-count]");
    var answers = store.get("cs-lk-fit", {});
    $$("input[type=radio]", fitForm).forEach(function (r) { if (answers[r.name] === r.value) r.checked = true; });
    var draw = function () {
      if (!Object.keys(answers).length) { fitOut.innerHTML = ""; fitCount.textContent = "Answer any question to see practices that may fit."; return; }
      var res = D.practices.map(function (p) { return { p: p, f: C.fit(p, answers) }; }), shown = res.filter(function (r) { return r.f.shown; });
      shown.sort(function (a, b) { return a.f.limits.length - b.f.limits.length || a.p.title.localeCompare(b.p.title); });
      fitCount.textContent = shown.length + " of " + D.practices.length + " practices may fit; " + (D.practices.length - shown.length) + " are documented for other settings.";
      fitOut.innerHTML = shown.map(function (r) { return '<li class="cs-card lk-fitres"><h2 class="lk-card__h"><a href="/living-knowledge/' + esc(r.p.id) + '/">' + esc(r.p.title) + "</a></h2>" +
        (r.f.why.length ? '<p class="lk-why"><b>Why it is shown:</b> ' + esc(r.f.why.join(" ")) + "</p>" : "") +
        (r.f.limits.length ? '<p class="lk-limit"><b>What could make it unsuitable:</b> ' + esc(r.f.limits.join(" ")) + "</p>" : "") +
        '<p class="lk-sub">Evidence: ' + esc(r.p.evidence.map(function (e) { return C.STATUS[e]; }).join("; ")) + ". Requires local assessment.</p></li>"; }).join("");
    };
    fitForm.addEventListener("change", function (e) { if (e.target.name) { answers[e.target.name] = e.target.value; store.set("cs-lk-fit", answers); draw(); } });
    $("[data-fit-reset]", fitForm).addEventListener("click", function () { answers = {}; store.set("cs-lk-fit", answers); $$("input[type=radio]", fitForm).forEach(function (r) { r.checked = false; }); draw(); });
    draw();
  }
}());
