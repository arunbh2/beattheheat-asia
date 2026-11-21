/* Common Shade: open calls and careers, the page script. The pages are complete without it (every record is in the
   table and the cards, with the status as of the build). With it: the status is recalculated for this moment
   (heat-economy/funding-core.js), filters and sorting work and live in the address, matching is explained in plain words,
   up to three calls can be compared, a shortlist is kept in this browser only, the filtered list downloads as CSV, and
   the page prints cleanly. No scores, no hidden eligibility guesses. */
(function () {
  "use strict";
  var C = window.FundCore, D = window.FUNDDATA, root = document.querySelector("[data-fund]");
  if (!C || !D || !root) return;
  var mode = root.getAttribute("data-fund"), now = Date.now(), KEY = "cs-fund-shortlist-" + mode;
  var recs = D.records, byId = {};
  recs.forEach(function (r) { byId[r.id] = r; });
  var ctl = [].slice.call(root.querySelectorAll("[data-f]")), keys = ctl.map(function (c) { return c.getAttribute("data-f"); }).concat(["sort", "saved"]);
  var out = root.querySelector("[data-count]"), none = root.querySelector("[data-none]"), hiddenNote = root.querySelector("[data-hidden-note]");
  var sortSel = root.querySelector("[data-sort]"), savedBtn = root.querySelector("[data-saved-toggle]");
  var store = { get: function () { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; } }, set: function (a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) { /* storage blocked: the shortlist lasts for this visit only */ } } };
  var saved = store.get(), showSaved = false, compare = [];

  // recalculate each record's status for now, and write it into the page
  recs.forEach(function (r) {
    r._app = C.applicationStatus(r, now); r._ver = C.verificationStatus(r, now, mode === "careers" ? "career" : "opportunity");
    r._vopen = ["open", "rolling", "closing"].indexOf(r._app.status) > -1 && r._ver.status === "verified";
    [].slice.call(root.querySelectorAll('[data-id="' + r.id + '"] [data-app]')).forEach(function (el) { el.textContent = r._app.label; el.setAttribute("data-app", r._app.status); el.title = r._app.why; });
    [].slice.call(root.querySelectorAll('[data-id="' + r.id + '"] [data-ver]')).forEach(function (el) { el.textContent = r._ver.label; el.setAttribute("data-ver", r._ver.status); el.title = r._ver.why; });
    var dl = C.entryDeadline(r);
    [].slice.call(root.querySelectorAll('[data-id="' + r.id + '"] [data-dl]')).forEach(function (el) { el.textContent = C.deadlineText(dl, now); });
  });

  function state() { var s = {}; ctl.forEach(function (c) { var v = c.type === "checkbox" ? (c.checked ? "1" : "") : c.value.trim(); if (v) s[c.getAttribute("data-f")] = v; });
    if (sortSel && sortSel.value !== "deadline") s.sort = sortSel.value; if (showSaved) s.saved = "1"; return s; }
  function apply(s) { ctl.forEach(function (c) { var k = c.getAttribute("data-f"); if (c.type === "checkbox") c.checked = !!s[k]; else if (s[k] != null) c.value = s[k]; });
    if (sortSel && s.sort) sortSel.value = s.sort; showSaved = !!s.saved; }
  var dflt = {}; ctl.forEach(function (c) { var k = c.getAttribute("data-f"); dflt[k] = c.type === "checkbox" ? (c.defaultChecked ? "1" : "") : (c.querySelector && c.querySelector("option[selected]") ? c.querySelector("option[selected]").value : c.defaultValue || ""); });

  function inWindow(r, days) { var d = C.entryDeadline(r); if (!d) return false; var t = Date.parse(d.date + "T23:59:59Z"); return t >= now && t - now <= days * 864e5; }
  function has(list, v) { return (list || []).indexOf(v) > -1; }
  // a record passes or fails each filter; for eligibility, unknown never hides a record, it is explained instead
  function test(r, s) {
    var why = [];
    if (s.q) { var hay = (r.search || "").toLowerCase(); if (s.q.toLowerCase().split(/\s+/).some(function (w) { return w && hay.indexOf(w) < 0; })) return { ok: false }; }
    if (s.status === "verified-open" && !r._vopen) return { ok: false };
    if (s.status === "open-any" && ["open", "rolling", "closing", "upcoming"].indexOf(r._app.status) < 0) return { ok: false };
    if (s.status === "closed" && ["closed", "withdrawn"].indexOf(r._app.status) < 0) return { ok: false };
    if (s.asia && !r.asia) return { ok: false };
    ["type", "instrument", "topic", "access", "role", "pay", "contribution", "discipline", "seniority", "relevance"].forEach(function (k) {
      if (!s[k]) return; var v = r[k === "topic" ? "topics" : k]; if (Array.isArray(v) ? !has(v, s[k]) : v !== s[k]) why.push("x"); });
    if (why.length) return { ok: false };
    if (s.window && !inWindow(r, +s.window)) return { ok: false };
    if (s.amount === "known" && !(r.amount && (r.amount.min != null || r.amount.max != null))) return { ok: false };
    if (s.salary === "1" && !r.salary_published) return { ok: false };
    if (s.remote === "1" && !r.remote) return { ok: false };
    if (s.loc && !has(r.countries, s.loc) && !(r.remote_countries && (has(r.remote_countries, s.loc) || has(r.remote_countries, "ANY")))) return { ok: false };
    var m = C.matches(r, { country: s.country, work: s.work, applicant: s.applicant });
    if (m.some(function (x) { return x[0] === "no"; }) && !s.showall) return { ok: false, excluded: true, m: m };
    if (showSaved && saved.indexOf(r.id) < 0) return { ok: false };
    return { ok: true, m: m };
  }
  function sortRecs(list, how) {
    return list.slice().sort(function (a, b) {
      if (how === "title") return String(a.title).localeCompare(String(b.title));
      if (how === "checked") return String((b.check || {}).checked || "").localeCompare(String((a.check || {}).checked || ""));
      return C.compare(a, b, now);
    });
  }
  var lists = [].slice.call(root.querySelectorAll("[data-list]"));
  function run(push) {
    var s = state(), shown = [], excluded = 0;
    sortRecs(recs, s.sort || "deadline").forEach(function (r) {
      var t = test(r, s); if (t.excluded) excluded++;
      [].slice.call(root.querySelectorAll('[data-id="' + r.id + '"]')).forEach(function (el) { el.hidden = !t.ok; });
      var mEls = root.querySelectorAll('[data-id="' + r.id + '"] [data-match]');
      [].slice.call(mEls).forEach(function (el) { el.innerHTML = ""; (t.m || []).forEach(function (x) { var li = document.createElement("li"); li.className = "fo-m fo-m--" + x[0]; li.textContent = x[1]; el.appendChild(li); }); el.hidden = !(t.m && t.m.length); });
      if (t.ok) shown.push(r);
    });
    // keep the visible order in step with the chosen sort
    lists.forEach(function (list) { shown.forEach(function (r) { var el = list.querySelector('[data-id="' + r.id + '"]'); if (el) list.appendChild(el); }); });
    var n = shown.length, noun = mode === "careers" ? (n === 1 ? "listing" : "listings") : (n === 1 ? "record" : "records");
    if (out) out.textContent = n + " " + noun + " shown" + (s.status === "verified-open" ? ", verified open" : "") + ".";
    if (none) none.hidden = n > 0;
    if (hiddenNote) { hiddenNote.hidden = !excluded; hiddenNote.querySelector("span").textContent = excluded === 1 ? "1 record is hidden because its published eligibility excludes your selection." : excluded + " records are hidden because their published eligibility excludes your selection."; }
    if (savedBtn) { savedBtn.setAttribute("aria-pressed", showSaved ? "true" : "false"); savedBtn.textContent = (showSaved ? "Show all" : "Show my shortlist") + " (" + saved.length + ")"; }
    var clean = {}; Object.keys(s).forEach(function (k) { if (s[k] !== dflt[k]) clean[k] = s[k]; }); Object.keys(dflt).forEach(function (k) { if (dflt[k] && !s[k]) clean[k] = "none"; }); var url = C.writeState(clean, keys); if (push !== false && location.search !== url) history.replaceState(null, "", url || location.pathname);
    return shown;
  }
  var fromUrl = C.readState(location.search, keys), start = {}; Object.keys(dflt).forEach(function (k) { start[k] = dflt[k]; }); Object.keys(fromUrl).forEach(function (k) { start[k] = fromUrl[k] === "none" ? "" : fromUrl[k]; }); apply(start);
  ctl.forEach(function (c) { c.addEventListener(c.tagName === "INPUT" && c.type !== "checkbox" ? "input" : "change", function () { run(); }); });
  if (sortSel) sortSel.addEventListener("change", function () { run(); });
  var reset = root.querySelector("[data-reset]");
  if (reset) reset.addEventListener("click", function () { apply(dflt); ctl.forEach(function (c) { if (c.type !== "checkbox" && !dflt[c.getAttribute("data-f")]) c.value = ""; }); if (sortSel) sortSel.value = "deadline"; showSaved = false; run(); });
  var widen = root.querySelector("[data-widen]");
  if (widen) widen.addEventListener("click", function () { var st = root.querySelector('[data-f="status"]'); if (st) st.value = "all"; var a = root.querySelector('[data-f="asia"]'); if (a) a.checked = false; run(); });

  // shortlist: this browser only
  function paintSaved() { [].slice.call(root.querySelectorAll("[data-save]")).forEach(function (b) { var on = saved.indexOf(b.getAttribute("data-save")) > -1; b.setAttribute("aria-pressed", on ? "true" : "false"); b.textContent = on ? "Saved" : "Save"; }); }
  root.addEventListener("click", function (e) {
    var b = e.target.closest("[data-save]"); if (b) { var id = b.getAttribute("data-save"), i = saved.indexOf(id); if (i > -1) saved.splice(i, 1); else saved.push(id); store.set(saved); paintSaved(); run(false); return; }
    var c = e.target.closest("[data-cmp]"); if (c) { var cid = c.getAttribute("data-cmp"), j = compare.indexOf(cid);
      if (j > -1) compare.splice(j, 1); else if (compare.length < 3) compare.push(cid); else { announce("You can compare up to three calls. Remove one first."); return; }
      paintCompare(); return; }
  });
  if (savedBtn) savedBtn.addEventListener("click", function () { showSaved = !showSaved; run(); });
  paintSaved();

  // compare up to three calls, side by side
  var cmpBox = root.querySelector("[data-compare]");
  function announce(t) { if (out) { out.textContent = t; } }
  function paintCompare() {
    [].slice.call(root.querySelectorAll("[data-cmp]")).forEach(function (b) { var on = compare.indexOf(b.getAttribute("data-cmp")) > -1; b.setAttribute("aria-pressed", on ? "true" : "false"); b.textContent = on ? "Comparing" : "Compare"; });
    if (!cmpBox) return;
    if (!compare.length) { cmpBox.hidden = true; return; }
    var rows = [["Funding", function (r) { return r.amount_text; }], ["Who can apply", function (r) { return r.eligibility_text; }], ["Where the work can happen", function (r) { return r.geography_text; }],
      ["Partnership", function (r) { return r.partnership_text || "Not stated"; }], ["Deadline", function (r) { return C.deadlineText(C.entryDeadline(r), now); }],
      ["Status", function (r) { return r._app.label + " · " + r._ver.label; }], ["Access route", function (r) { return r.access_text; }], ["Kind of money", function (r) { return r.instrument_text; }]];
    var sel = compare.map(function (id) { return byId[id]; });
    var h = '<h2 class="fo-cmp__h">Comparing ' + sel.length + ' call' + (sel.length > 1 ? "s" : "") + '</h2><div class="fo-tablewrap" role="region" aria-label="Comparison" tabindex="0"><table class="fo-cmp__t"><thead><tr><th scope="col">Detail</th>' +
      sel.map(function (r) { return '<th scope="col">' + esc(r.title) + "</th>"; }).join("") + "</tr></thead><tbody>" +
      rows.map(function (row) { return '<tr><th scope="row">' + row[0] + "</th>" + sel.map(function (r) { return "<td>" + esc(row[1](r) || "Not published") + "</td>"; }).join("") + "</tr>"; }).join("") +
      '</tbody></table></div><button type="button" class="sol-btn fo-btn" data-cmp-clear>Clear the comparison</button>';
    cmpBox.innerHTML = h; cmpBox.hidden = false;
    cmpBox.querySelector("[data-cmp-clear]").addEventListener("click", function () { compare = []; paintCompare(); });
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  // CSV of what is shown
  var dl = root.querySelector("[data-csv]");
  if (dl) dl.addEventListener("click", function () {
    var shown = run(false), head = C.CSV_HEAD[mode], rows = shown.map(function (r) { return C.csvRow(r, mode, now); });
    var blob = new Blob([C.csv(head, rows)], { type: "text/csv;charset=utf-8" }), a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "common-shade-" + mode + ".csv"; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  });
  var pr = root.querySelector("[data-print]"); if (pr) pr.addEventListener("click", function () { window.print(); });
  [].slice.call(root.querySelectorAll("[data-js]")).forEach(function (el) { el.hidden = false; });
  run(false);
}());
