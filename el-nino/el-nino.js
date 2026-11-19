/* El Niño and heat in Asia (/el-nino/): the schematic toggle, the region tabs and the role selector.
   Without JavaScript every state, region and role stays visible; this script only turns them into toggles.
   It computes nothing: it shows and hides text written and sourced in tools/el-nino-explainer-text.js. */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.add("js-enx");

  // the Pacific schematic: native radio buttons, so arrow keys and screen readers work as expected
  function radios(name, items, attr) {
    var group = document.querySelector("[name=" + name + "]");
    if (!group) return;
    var wrap = group.closest("[role=radiogroup]");
    wrap.hidden = false;
    function show(v) { items.forEach(function (el) { el.classList.toggle("is-on", el.getAttribute(attr) === v); }); }
    wrap.addEventListener("change", function (e) { if (e.target.name === name) show(e.target.value); });
    show(wrap.querySelector("input:checked").value);
  }
  radios("enx-state", [].slice.call(document.querySelectorAll(".enx-state")), "data-state");
  radios("enx-role", [].slice.call(document.querySelectorAll(".enx-role")), "data-role");

  // region tabs: one panel at a time, arrow keys move between tabs (WAI-ARIA tabs pattern)
  var list = document.querySelector(".enx-tabs");
  if (list) {
    var tabs = [].slice.call(list.querySelectorAll("[role=tab]"));
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute("aria-controls")); });
    list.hidden = false;
    function select(i, focus) {
      tabs.forEach(function (t, j) { var on = i === j; t.setAttribute("aria-selected", on ? "true" : "false"); t.tabIndex = on ? 0 : -1; panels[j].hidden = !on; panels[j].setAttribute("role", "tabpanel"); panels[j].setAttribute("aria-labelledby", t.id); });
      if (focus) tabs[i].focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(i, false); });
      t.addEventListener("keydown", function (e) {
        var k = e.key, n = tabs.length, j = k === "ArrowRight" ? (i + 1) % n : k === "ArrowLeft" ? (i - 1 + n) % n : k === "Home" ? 0 : k === "End" ? n - 1 : -1;
        if (j > -1) { e.preventDefault(); select(j, true); }
      });
    });
    // a link to #region-<id> opens that region
    var h = location.hash.replace("#", ""), at = panels.findIndex(function (p) { return p && p.id === h; });
    select(at > -1 ? at : 0, false);
  }
})();
