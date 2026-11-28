/* Heat inside factories: the floor plan, the finder, comparison and the printable shortlist.
   Without this script every zone, record and table is still on the page; this only adds selection and filtering. */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  root.classList.add("fh-js");
  var CONDS = window.FH_CONDITIONS || [], FAMS = window.FH_FAMILIES || [];
  // a page reusing this script (Heat in markets) names its own shortlist key, its "where" row and its first zone
  var OPT = window.FH_OPTS || {}, SLKEY = OPT.key || "fh-shortlist", WHERE = OPT.where || "Factory types and tasks";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(s, el) { return (el || doc).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || doc).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }

  // ---- floor plan: one zone card at a time, chosen from the plan; arrow keys move between zones ----
  var zones = $$(".fh-zone"), cards = $$(".fh-zonecard");
  function inView(el) { var r = el.getBoundingClientRect(); return r.top >= 0 && r.top < window.innerHeight - 80; }
  function selectZone(id, move) {
    zones.forEach(function (z) { if (z.getAttribute("data-zone") === id) z.setAttribute("aria-current", "true"); else z.removeAttribute("aria-current"); });
    cards.forEach(function (c) { c.classList.toggle("is-on", c.id === "zone-" + id); });
    var card = $("#zone-" + id);
    if (move && card) { if (!inView(card)) card.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); card.focus({ preventScroll: true }); }
  }
  zones.forEach(function (z, i) {
    z.addEventListener("click", function (e) { e.preventDefault(); selectZone(z.getAttribute("data-zone"), true); history.replaceState(null, "", "#zone-" + z.getAttribute("data-zone")); });
    z.addEventListener("keydown", function (e) {
      var k = e.key, n = null;
      if (k === "ArrowRight" || k === "ArrowDown") n = zones[(i + 1) % zones.length];
      if (k === "ArrowLeft" || k === "ArrowUp") n = zones[(i - 1 + zones.length) % zones.length];
      if (k === " ") { e.preventDefault(); z.click(); }
      if (n) { e.preventDefault(); n.focus(); }
    });
  });
  var h = location.hash.match(/^#zone-([a-z]+)/);
  selectZone(h ? h[1] : (OPT.start || "sewing"), !!h);

  // ---- time of day (Heat in markets): show what each zone is like at the chosen time; without JS both are shown ----
  var tbtn = $$("[data-time-set]");
  function setTime(v) { tbtn.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-time-set") === v ? "true" : "false"); }); $$("[data-time]").forEach(function (el) { el.hidden = el.getAttribute("data-time") !== v; }); }
  if (tbtn.length) { var tbar = $(".fh-timebar"); if (tbar) tbar.hidden = false; tbtn.forEach(function (b) { b.addEventListener("click", function () { setTime(b.getAttribute("data-time-set")); }); }); setTime(tbtn[0].getAttribute("data-time-set")); }

  // ---- records: compare (up to three) and shortlist buttons ----
  var recs = $$(".fh-rec"), cmp = [], sl = store(SLKEY) || [];
  var byId = {}; recs.forEach(function (r) { byId[r.getAttribute("data-rec")] = r; });
  sl = sl.filter(function (id) { return byId[id]; });
  var tray = $(".fh-tray"), cmpBox = $("#compare"), slBox = $("#shortlist");
  recs.forEach(function (r) {
    var id = r.getAttribute("data-rec"), t = $("[data-f=t]", r).textContent;
    var p = doc.createElement("p"); p.className = "fh-recbtns";
    p.innerHTML = '<button type="button" class="fh-btn" data-act="cmp" aria-pressed="false">Compare<span class="visually-hidden"> ' + esc(t) + '</span></button>' +
      '<button type="button" class="fh-btn" data-act="sl" aria-pressed="false">Shortlist<span class="visually-hidden"> ' + esc(t) + '</span></button>';
    r.appendChild(p);
    p.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      if (b.getAttribute("data-act") === "cmp") toggleCmp(id); else toggleSl(id);
    });
  });
  function evText(r) { return $$(".fh-tag", r).map(function (t) { return t.textContent; }).join(" · "); }
  function field(r, f) { var el = $("[data-f=" + f + "]", r); return el ? el.innerHTML.replace(/^<b>[^<]*<\/b>\s*/, "") : ""; }
  var ROWS = [["addresses", "Addresses"], ["how", "How it works"], ["where", WHERE], ["works", "Works if"], ["caution", "Take care"], ["upfront", "Upfront"], ["recurrent", "Running"], ["owners", "Who runs it"], ["equity", "Equity and access"], ["ev", "Evidence"], ["measure", "Measure before and after"]];
  function toggleCmp(id) {
    var i = cmp.indexOf(id);
    if (i >= 0) cmp.splice(i, 1); else if (cmp.length < 3) cmp.push(id);
    renderCmp();
  }
  function renderCmp() {
    recs.forEach(function (r) { var b = $("[data-act=cmp]", r), on = cmp.indexOf(r.getAttribute("data-rec")) >= 0; b.setAttribute("aria-pressed", on ? "true" : "false"); b.disabled = !on && cmp.length >= 3; });
    tray.hidden = !cmp.length;
    tray.innerHTML = cmp.length ? '<span>' + cmp.length + ' of 3 chosen to compare</span> <a href="#compare">View the comparison</a> <button type="button" class="fh-btn" data-act="clear">Clear</button>' : "";
    cmpBox.hidden = cmp.length < 2;
    if (cmp.length >= 2) {
      var cols = cmp.map(function (id) { return byId[id]; });
      $(".fh-cmpbody", cmpBox).innerHTML = '<div class="fh-tablewrap" role="region" aria-label="Comparison" tabindex="0"><table class="fh-table"><caption>' + cols.length + ' measures side by side</caption><thead><tr><th scope="col">Measure</th>' +
        cols.map(function (r) { return '<th scope="col">' + esc($("[data-f=t]", r).textContent) + '</th>'; }).join("") + '</tr></thead><tbody>' +
        ROWS.map(function (row) { return '<tr><th scope="row">' + row[1] + '</th>' + cols.map(function (r) { return '<td data-label="' + esc($("[data-f=t]", r).textContent) + '">' + (field(r, row[0]) || "-") + '</td>'; }).join("") + '</tr>'; }).join("") + '</tbody></table></div>';
    }
  }
  tray.addEventListener("click", function (e) { var b = e.target.closest("[data-act=clear]"); if (b) { cmp = []; renderCmp(); } });
  function toggleSl(id) { var i = sl.indexOf(id); if (i >= 0) sl.splice(i, 1); else sl.push(id); store(SLKEY, sl); renderSl(); }
  function renderSl() {
    recs.forEach(function (r) { $("[data-act=sl]", r).setAttribute("aria-pressed", sl.indexOf(r.getAttribute("data-rec")) >= 0 ? "true" : "false"); });
    slBox.hidden = !sl.length;
    $(".fh-slist", slBox).innerHTML = sl.map(function (id) { var r = byId[id];
      return '<li><b>' + esc($("[data-f=t]", r).textContent) + '</b> <span class="fh-small">' + esc(evText(r)) + '</span><br>' + field(r, "addresses") +
        '<br><span class="fh-small">Measure before and after: ' + field(r, "measure") + '</span> <button type="button" class="fh-btn" data-rm="' + esc(id) + '">Remove</button></li>'; }).join("");
  }
  slBox.addEventListener("click", function (e) {
    var rm = e.target.closest("[data-rm]"); if (rm) toggleSl(rm.getAttribute("data-rm"));
    if (e.target.closest(".fh-print-sl")) { root.classList.add("fh-print-sl"); window.print(); }
  });
  window.addEventListener("afterprint", function () { root.classList.remove("fh-print-sl"); });
  renderCmp(); renderSl();

  // ---- finder: observed conditions -> families, measures and what to find out next (no score) ----
  var fs = $(".fh-conds"), out = $(".fh-results");
  if (fs && out) {
    fs.hidden = false; out.hidden = false;
    var ft = $(".fh-findertable"); if (ft) ft.open = false;
    var famName = {}; FAMS.forEach(function (f) { famName[f.id] = f; });
    var filterOn = false;
    function chosen() { return $$("input:checked", fs).map(function (i) { return i.value; }); }
    function render() {
      var ids = chosen();
      if (!ids.length) { out.innerHTML = '<p class="fh-small">Tick at least one condition to see where to look.</p>'; applyFilter(null); return; }
      var cs = CONDS.filter(function (c) { return ids.indexOf(c.id) >= 0; });
      var fams = [], rset = [];
      cs.forEach(function (c) { c.fams.forEach(function (f) { if (fams.indexOf(f) < 0) fams.push(f); }); c.recs.forEach(function (r) { if (rset.indexOf(r) < 0) rset.push(r); }); });
      out.innerHTML = '<h4>Why these matter</h4><ul>' + cs.map(function (c) { return '<li><b>' + esc(c.t) + ':</b> ' + esc(c.why) + '</li>'; }).join("") + '</ul>' +
        '<h4>Families to look at</h4><ul>' + fams.map(function (f) { return '<li><a href="#fam-' + famName[f].slug + '">' + esc(famName[f].t) + '</a></li>'; }).join("") + '</ul>' +
        '<h4>Measures that address these conditions (' + rset.length + ')</h4><ul>' + rset.filter(function (r) { return byId[r]; }).map(function (r) { return '<li><a href="#rec-' + r + '">' + esc($("[data-f=t]", byId[r]).textContent) + '</a> <span class="fh-small">' + esc(evText(byId[r])) + '</span></li>'; }).join("") + '</ul>' +
        '<div class="fh-next"><h4>What to find out next</h4><ul>' + cs.map(function (c) { return '<li>' + esc(c.next) + '</li>'; }).join("") + '</ul><p class="fh-small">None of this says whether work is safe. Measurement, worker feedback and qualified assessment decide that.</p></div>' +
        '<p><button type="button" class="fh-btn" data-act="filter" aria-pressed="' + (filterOn ? "true" : "false") + '">Show only these measures in the library</button></p>';
      applyFilter(filterOn ? rset : null);
    }
    function applyFilter(rset) {
      recs.forEach(function (r) { r.hidden = !!rset && rset.indexOf(r.getAttribute("data-rec")) < 0; });
      $$(".fh-fam").forEach(function (f) { f.hidden = !!rset && !$$(".fh-rec", f).some(function (r) { return !r.hidden; }); });
    }
    fs.addEventListener("change", render);
    out.addEventListener("click", function (e) { var b = e.target.closest("[data-act=filter]"); if (b) { filterOn = !filterOn; render(); } });
    render();
  }

  // ---- print: open every fold so the paper copy is complete ----
  var opened = [];
  window.addEventListener("beforeprint", function () { opened = $$("details:not([open])"); opened.forEach(function (d) { d.open = true; }); });
  window.addEventListener("afterprint", function () { opened.forEach(function (d) { d.open = false; }); opened = []; });
})();
