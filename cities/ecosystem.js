// Common Shade: filters for a city heat ecosystem profile (/cities/<city>/who-is-doing-what/). Built by
// tools/build-city-ecosystem.js. Without JavaScript the filters stay hidden and every activity shows. The chosen filters
// live in the address (?theme=workers&stage=completed), so a filtered view can be shared; nothing is stored or sent.
(function () {
  "use strict";
  var form = document.querySelector(".ce-filters");
  if (!form) return;
  var cards = [].slice.call(document.querySelectorAll(".ce-act"));
  var count = document.querySelector(".ce-count"), none = document.querySelector(".ce-none");
  var sels = [].slice.call(form.querySelectorAll("select[data-f]"));
  var total = cards.length;
  function match(card, f, v) {
    if (!v) return true;
    var d = card.getAttribute("data-" + f) || "";
    if (f === "people") return d.split("|").indexOf(v) !== -1;
    if (f === "theme" || f === "type") return (" " + d + " ").indexOf(" " + v + " ") !== -1;
    return d === v;
  }
  function apply(push) {
    var shown = 0, q = [];
    sels.forEach(function (s) { if (s.value) q.push(encodeURIComponent(s.getAttribute("data-f")) + "=" + encodeURIComponent(s.value)); });
    cards.forEach(function (c) {
      var ok = sels.every(function (s) { return match(c, s.getAttribute("data-f"), s.value); });
      c.hidden = !ok; if (ok) shown++;
    });
    if (count) count.textContent = shown === total ? total + " activities" : shown + " of " + total + " activities";
    if (none) none.hidden = shown > 0;
    if (push) { try { history.replaceState(null, "", location.pathname + (q.length ? "?" + q.join("&") : "") + location.hash); } catch (e) {} }
  }
  // read filters from the address; an unknown value is ignored
  try {
    var p = new URLSearchParams(location.search);
    sels.forEach(function (s) { var v = p.get(s.getAttribute("data-f")); if (v && [].some.call(s.options, function (o) { return o.value === v; })) s.value = v; });
  } catch (e) {}
  form.hidden = false;
  form.addEventListener("change", function () { apply(true); });
  form.addEventListener("reset", function () { setTimeout(function () { apply(true); }, 0); });
  form.addEventListener("submit", function (e) { e.preventDefault(); });
  apply(false);
  // printing shows every card and opens every fold, so the evidence qualifications travel with the page
  window.addEventListener("beforeprint", function () { cards.forEach(function (c) { c.hidden = false; }); [].forEach.call(document.querySelectorAll(".ce-more"), function (d) { d.setAttribute("data-was", d.open ? "1" : ""); d.open = true; }); });
  window.addEventListener("afterprint", function () { [].forEach.call(document.querySelectorAll(".ce-more"), function (d) { d.open = d.getAttribute("data-was") === "1"; }); apply(false); });
})();
