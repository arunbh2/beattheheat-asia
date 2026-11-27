// Common Shade: health and equity pages (tools/build-health-equity.js). Tabs for "A day in one home" and "When a
// service closes", and the "Can this worker use the protection?" comparison. Without JavaScript every panel and option
// is shown. Choices stay in the page: nothing is stored or sent.
(function () {
  "use strict";
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  $$(".he-int").forEach(function (sec) {
    var tabs = $$('[role="tab"]', sec), list = sec.querySelector('[role="tablist"]'); if (!tabs.length) return;
    list.hidden = false;
    function show(t, focus) { tabs.forEach(function (x) { var on = x === t; x.setAttribute("aria-selected", String(on)); x.tabIndex = on ? 0 : -1; document.getElementById(x.getAttribute("aria-controls")).hidden = !on; }); if (focus) t.focus(); }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { show(t); });
      t.addEventListener("keydown", function (e) { var k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (e.key === "Home") { e.preventDefault(); show(tabs[0], true); } else if (e.key === "End") { e.preventDefault(); show(tabs[tabs.length - 1], true); } else if (k) { e.preventDefault(); show(tabs[(i + k + tabs.length) % tabs.length], true); } });
    });
    show(tabs[0]);
  });
  var f = document.querySelector("[data-he-use]"), out = document.querySelector("[data-he-useout]");
  if (f && out) {
    function run() { $$("li[data-f]", out).forEach(function (li) { var v = (f.querySelector('input[name="use-' + li.getAttribute("data-f") + '"]:checked') || {}).value; $$("[data-o]", li).forEach(function (s) { s.hidden = s.getAttribute("data-o") !== v; }); });
      var blocked = $$("li[data-f]", out).filter(function (li) { var s = li.querySelector("[data-o]:not([hidden]) em"); return !!s; }).length;
      var sum = out.querySelector(".he-usesum"); if (!sum) { sum = document.createElement("p"); sum.className = "he-usesum"; out.insertBefore(sum, out.firstChild); }
      sum.textContent = blocked ? "With these arrangements, the shade and water are there, but " + (blocked === 1 ? "one of the five arrangements stands" : blocked + " of the five arrangements stand") + " in the way of using them. What would change " + (blocked === 1 ? "it" : "each") + " is shown below." : "With these arrangements, this worker can use the shade and water when they need to."; }
    f.addEventListener("change", run); run();
  }
})();
