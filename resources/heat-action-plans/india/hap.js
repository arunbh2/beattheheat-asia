/* India heat action plan archive: search and filters over the documents already on the page (built by
   tools/build-hap-archive.js). Every filter combines with the others; the choice is kept in the address, so a
   filtered view can be bookmarked or shared. Without JavaScript the whole list is shown. Nothing is sent anywhere. */
(function () {
  "use strict";
  var bar = document.querySelector("[data-hap-bar]"), list = document.querySelector("[data-hap-list]");
  if (!bar || !list) return;
  var docs = [].slice.call(list.querySelectorAll(".hap-doc")), total = docs.length;
  var q = bar.querySelector("[data-hap-q]"), count = bar.querySelector("[data-hap-count]"), none = document.querySelector("[data-hap-none]");
  var sels = [].slice.call(bar.querySelectorAll("[data-hap-f]"));
  var norm = function (s) { return String(s || "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim(); };
  docs.forEach(function (d) { d._q = norm(d.dataset.q); d._lang = (d.dataset.lang || "").split("|"); });
  var fmt = function (n) { return n.toLocaleString("en-GB"); };
  var timer = null;

  function apply(fromUser, now) {
    var words = norm(q.value).split(" ").filter(Boolean), f = {};
    sels.forEach(function (s) { if (s.value) f[s.dataset.hapF] = s.value; });
    var shown = 0;
    docs.forEach(function (d) {
      var ok = words.every(function (w) { return d._q.indexOf(w) > -1; }) &&
        (!f.state || d.dataset.state === f.state) && (!f.level || d.dataset.level === f.level) && (!f.year || d.dataset.year === f.year) &&
        (!f.type || d.dataset.type === f.type) && (!f.lang || d._lang.indexOf(f.lang) > -1);
      d.hidden = !ok; if (ok) shown++;
    });
    var active = words.length || Object.keys(f).length;
    // say the count once the visitor pauses typing, so a screen reader is not interrupted on every key
    clearTimeout(timer);
    timer = setTimeout(function () {
      count.textContent = active ? "Showing " + fmt(shown) + " of " + fmt(total) + " documents" : "Showing all " + fmt(total) + " documents";
    }, fromUser && !now ? 250 : 0);
    none.hidden = shown > 0; list.hidden = shown === 0;
    [].slice.call(document.querySelectorAll("[data-hap-reset]")).forEach(function (b) { b.disabled = !active; });
    if (fromUser) save(f);
  }
  function save(f) {
    var p = new URLSearchParams();
    if (q.value.trim()) p.set("q", q.value.trim());
    Object.keys(f).forEach(function (k) { p.set(k, f[k]); });
    var s = p.toString();
    try { history.replaceState(null, "", location.pathname + (s ? "?" + s : "") + location.hash); } catch (e) {}
  }
  function load() {
    var p = new URLSearchParams(location.search);
    q.value = p.get("q") || "";
    sels.forEach(function (s) {
      var v = p.get(s.dataset.hapF) || "";
      s.value = [].some.call(s.options, function (o) { return o.value === v; }) ? v : "";
    });
  }
  function reset() {
    q.value = ""; sels.forEach(function (s) { s.value = ""; }); apply(true, true); q.focus();
  }

  q.addEventListener("input", function () { apply(true); });
  sels.forEach(function (s) { s.addEventListener("change", function () { apply(true, true); }); });
  [].slice.call(document.querySelectorAll("[data-hap-reset]")).forEach(function (b) { b.addEventListener("click", reset); });
  bar.hidden = false;
  load(); apply(false);
  // a link to one document (#ID) still lands on it, even when filters are set
  if (location.hash.length > 1) { var t = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (t && t.hidden) { reset(); t.scrollIntoView(); } }
})();
