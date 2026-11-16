// Common Shade: State of the field. Adds copy, print and share buttons to an edition (tools/build-sof.js builds the page).
// Without this script, the page reads whole, the Markdown briefing downloads from a plain link, and the browser prints.
(function () {
  "use strict";
  var said = function (box, t) { var s = box.querySelector(".sof-said"); if (s) { s.textContent = t; setTimeout(function () { s.textContent = ""; }, 4000); } };
  var copy = function (text, box, ok) {
    var done = function () { said(box, ok); }, fail = function () { said(box, "Copying is not available here. Select the text and copy it."); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fail);
    else { var t = document.createElement("textarea"); t.value = text; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0"; document.body.appendChild(t); t.select();
      try { document.execCommand("copy") ? done() : fail(); } catch (e) { fail(); } document.body.removeChild(t); }
  };
  // print: open every fold so the printout carries the evidence, then put them back
  var opened = [];
  var expand = function () { opened = []; document.querySelectorAll(".sof-ed details:not([open])").forEach(function (d) { d.open = true; opened.push(d); }); };
  var restore = function () { opened.forEach(function (d) { d.open = false; }); opened = []; };
  window.addEventListener("beforeprint", expand); window.addEventListener("afterprint", restore);
  document.querySelectorAll("[data-sof-tools]").forEach(function (box) {
    var ed = box.closest(".sof-ed"), sum = ed && ed.querySelector("[data-sof-summary]");
    box.querySelectorAll("[hidden]").forEach(function (b) { b.hidden = false; });
    var c = box.querySelector("[data-sof-copy]"); if (c && sum) c.addEventListener("click", function () { copy(sum.textContent, box, "Summary copied, with its dates and link."); });
    var p = box.querySelector("[data-sof-print]"); if (p) p.addEventListener("click", function () { expand(); window.print(); });
    var l = box.querySelector("[data-sof-link]"); if (l) l.addEventListener("click", function () { copy(l.getAttribute("data-sof-link"), box, "Link copied."); });
  });
  // section links: copy the stable address of a section, on the edition's own page
  document.querySelectorAll(".sof-anchor").forEach(function (a) {
    a.addEventListener("click", function (ev) {
      var ed = a.closest(".sof-ed"), tools = ed && ed.querySelector("[data-sof-tools]"), stable = tools && tools.querySelector("[data-sof-link]");
      if (!stable) return; ev.preventDefault();
      var u = stable.getAttribute("data-sof-link") + a.getAttribute("href").replace(/^[^#]*/, "");
      history.replaceState(null, "", a.getAttribute("href")); copy(u, tools, "Link to this section copied.");
    });
  });
  // a link to a source or a claim inside a closed fold opens the fold
  var reveal = function () {
    var id = decodeURIComponent(location.hash.slice(1)); if (!id) return; var el = document.getElementById(id); if (!el) return;
    var d = el.closest("details"); if (d && !d.open) { d.open = true; el.scrollIntoView(); }
  };
  window.addEventListener("hashchange", reveal); reveal();
})();
