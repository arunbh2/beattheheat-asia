/* Common Shade: /social-protection/ scheme finder. The page lists every scheme without JavaScript; this only shows the
   filter and hides what does not match. Choices live in the address bar (?country=in&need=health&shock=1), so a view
   can be shared and nothing is stored. Built by tools/build-social-protection.js. */
(function () {
  "use strict";
  var form = document.getElementById("sp-filter"); if (!form) return;
  var items = [].slice.call(document.querySelectorAll(".sp-scheme")), countries = [].slice.call(document.querySelectorAll('[id$="-schemes"].sp-country'));
  var count = document.getElementById("sp-count"), empty = document.getElementById("sp-empty");
  function read() { var p = new URLSearchParams(location.search);
    form.country.value = p.get("country") || "";
    [].forEach.call(form.querySelectorAll('[name="need"]'), function (b) { b.checked = p.getAll("need").indexOf(b.value) > -1; });
    form.shock.checked = p.get("shock") === "1"; form.moves.checked = p.get("moves") === "1"; }
  function apply(push) {
    var c = form.country.value, needs = [].filter.call(form.querySelectorAll('[name="need"]'), function (b) { return b.checked; }).map(function (b) { return b.value; });
    var shock = form.shock.checked, moves = form.moves.checked, shown = 0;
    items.forEach(function (li) {
      var s = li.getAttribute("data-situations").split(" ");
      var ok = (!c || li.getAttribute("data-country") === c) && needs.every(function (n) { return s.indexOf(n) > -1; }) &&
        (!shock || /^(yes|partly)$/.test(li.getAttribute("data-shock"))) && (!moves || /^(yes|partly)$/.test(li.getAttribute("data-portable")));
      li.hidden = !ok; if (ok) shown++;
    });
    countries.forEach(function (sec) { sec.hidden = !sec.querySelector(".sp-scheme:not([hidden])"); });
    count.textContent = shown + (shown === 1 ? " scheme" : " schemes") + " shown of " + items.length + ".";
    empty.hidden = shown > 0;
    if (push) { var p = new URLSearchParams(); if (c) p.set("country", c); needs.forEach(function (n) { p.append("need", n); }); if (shock) p.set("shock", "1"); if (moves) p.set("moves", "1");
      var q = p.toString(); try { history.replaceState(null, "", location.pathname + (q ? "?" + q : "") + location.hash); } catch (e) {} }
  }
  form.hidden = false; read(); apply(false);
  form.addEventListener("change", function () { apply(true); });
  form.addEventListener("submit", function (e) { e.preventDefault(); });
})();
