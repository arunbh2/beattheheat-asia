// Common Shade: State of the field. Adds copy (summary, chat version, link), print and share buttons to an edition (tools/build-sof.js builds the page).
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
    var ch = box.querySelector("[data-sof-chat]"), chT = ed && ed.querySelector("[data-sof-chattext]");
    if (ch && chT) ch.addEventListener("click", function () { copy(chT.textContent, box, "Copied, ready to paste into WhatsApp or any chat."); });
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
  // read it as: a role's question from this edition and where to start; kept in the address (?role=) and this browser
  document.querySelectorAll("[data-sof-lens]").forEach(function (box) {
    var data; try { data = JSON.parse(box.querySelector("[data-sof-lensdata]").textContent); } catch (e) { return; }
    var out = box.querySelector(".sof-lens__out"), tpl = box.querySelector("[data-sof-lenst]"), btns = box.querySelectorAll("[data-role]");
    var show = function (role, write) {
      if (!data[role]) return;
      btns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-role") === role)); });
      var f = tpl.content.cloneNode(true); f.querySelector("[data-q]").textContent = data[role].q;
      var go = f.querySelector("[data-go]"); data[role].go.forEach(function (l) { var a = document.createElement("a"); a.href = l[0]; a.textContent = l[1]; go.appendChild(a); });
      out.textContent = ""; out.appendChild(f);
      if (write) { try { localStorage.setItem("cs-sof-role", role); } catch (e) {} var u = new URL(location.href); u.searchParams.set("role", role); history.replaceState(null, "", u.pathname + u.search + u.hash); }
    };
    btns.forEach(function (b) { b.addEventListener("click", function () { show(b.getAttribute("data-role"), true); }); });
    box.hidden = false;
    var start = new URLSearchParams(location.search).get("role"); if (!start) { try { start = localStorage.getItem("cs-sof-role"); } catch (e) {} }
    if (start) show(start, false);
  });
  // a link to a source or a claim inside a closed fold opens the fold
  var reveal = function () {
    var id = decodeURIComponent(location.hash.slice(1)); if (!id) return; var el = document.getElementById(id); if (!el) return;
    var d = el.closest("details"); if (d && !d.open) { d.open = true; el.scrollIntoView(); }
  };
  window.addEventListener("hashchange", reveal); reveal();
})();
