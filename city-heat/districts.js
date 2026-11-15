// Common Shade: the districts of a city side by side (window.CITY_DISTRICTS, written by tools/build-static.js). The data file
// loads only when the reader opens the list. Each figure is marked above or below the city's middle district (the median);
// nothing is ranked or scored, and the reader can sort by any column. Rounding follows the data's limits: residents to the
// nearest thousand, shares to whole numbers.
(function () {
  "use strict";
  var C = window.CITY_DISTRICTS, box = document.querySelector("[data-city-districts]");
  if (!C || !box) return;
  var det = box.closest("details"), rows = null, key = "name", dir = 1, mid = {};
  // the table's own styles arrive with this script, which loads only when the reader opens the list
  if (!document.getElementById("cd-css")) { var st = document.createElement("style"); st.id = "cd-css"; st.textContent = ".cd-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}.cd table{border-collapse:collapse;font-size:.875rem;min-width:640px}.cd th,.cd td{text-align:right;padding:6px 8px;border-top:1px solid #E6DFD4;white-space:nowrap}.cd th:first-child,.cd td:first-child{text-align:left}.cd th button{font:inherit;font-weight:700;background:none;border:0;padding:6px 0;min-height:24px;cursor:pointer;color:inherit;text-decoration:underline;text-decoration-color:#F26430;text-underline-offset:3px}.cd .up{color:#16202B;font-weight:700}.cd .dn{color:#5E6570}.cd small{display:block;font-size:.75rem;color:#5E6570}"; document.head.appendChild(st); }
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var show = {
    residents: function (v) { return v == null ? "–" : v < 1000 ? "under 1,000" : "about " + (Math.round(v / 1000) * 1000).toLocaleString("en"); },
    older_pct: function (v) { return v == null ? "–" : Math.round(v) + "%"; },
    built_pct: function (v) { return v == null ? "–" : Math.round(v) + "%"; },
    park_pct: function (v) { return v == null ? "–" : v > 0 && v < 1 ? "under 1%" : Math.round(v) + "%"; },
    hospitals: function (v) { return String(v); }
  };
  function median(k) { var a = rows.map(function (r) { return r[k]; }).filter(function (v) { return v != null; }).sort(function (x, y) { return x - y; }); var n = a.length; return n ? (n % 2 ? a[(n - 1) / 2] : (a[n / 2 - 1] + a[n / 2]) / 2) : null; }
  function cell(r, k) {
    if (k === "name") return '<td>' + esc(r.name) + '</td>';
    var v = r[k], m = mid[k], side = v == null || m == null || v === m ? "" : v > m ? "up" : "dn";
    return '<td' + (side ? ' class="' + side + '"' : "") + '>' + esc(show[k](v)) + (side ? '<small>' + esc(side === "up" ? C.above : C.below) + '</small>' : "") + '</td>';
  }
  function draw() {
    var s = rows.slice().sort(function (a, b) { var x = a[key], y = b[key]; if (key === "name") return dir * String(x).localeCompare(String(y)); return dir * ((x == null ? -1 : x) - (y == null ? -1 : y)); });
    box.innerHTML = '<div class="cd-wrap"><table><caption class="visually-hidden">' + esc(C.n) + ' districts, sortable by any column</caption><thead><tr>' +
      C.cols.map(function (c) { var on = c[0] === key; return '<th scope="col"' + (on ? ' aria-sort="' + (dir > 0 ? "ascending" : "descending") + '"' : "") + '><button type="button" data-k="' + c[0] + '">' + esc(c[1]) + (on ? (dir > 0 ? " ↑" : " ↓") : "") + '</button></th>'; }).join("") +
      '</tr></thead><tbody>' + s.map(function (r) { return '<tr>' + C.cols.map(function (c) { return cell(r, c[0]); }).join("") + '</tr>'; }).join("") + '</tbody></table></div>';
  }
  function load() {
    if (rows) return;
    if (navigator.onLine === false) { box.innerHTML = '<p>You appear to be offline, so the district figures cannot load.</p>'; return; }
    box.innerHTML = '<p aria-busy="true">Loading the districts…</p>';
    fetch(C.url).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (d) {
      rows = (d.districts || []).slice();
      if (!rows.length) { box.innerHTML = "<p>No district figures for this city yet.</p>"; return; }
      C.cols.forEach(function (c) { if (c[0] !== "name") mid[c[0]] = median(c[0]); });
      draw();
    }).catch(function () { rows = null; box.innerHTML = '<p>The district figures could not be loaded just now. <a href="' + esc(C.url.split("?")[0]) + '">Open the data file</a>.</p>'; });
  }
  box.addEventListener("click", function (e) { var b = e.target.closest("button[data-k]"); if (!b) return; var k = b.dataset.k; dir = k === key ? -dir : 1; key = k; draw(); var nb = box.querySelector('button[data-k="' + k + '"]'); if (nb) nb.focus(); });
  if (det) { det.addEventListener("toggle", function () { if (det.open) load(); }); if (det.open) load(); } else load();
})();
