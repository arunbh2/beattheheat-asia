// Common Shade: /brand/, "Brand & Media" (tools/build-brand.js). Copy buttons, the film finder and the player.
// Without JavaScript every file, film, page and channel is still a plain link; the copy buttons and finder stay hidden.
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // one polite announcement for every copy, shown only after the clipboard confirms
  var say = document.createElement("p"); say.className = "visually-hidden"; say.setAttribute("role", "status"); document.body.appendChild(say);
  function announce(t) { say.textContent = ""; setTimeout(function () { say.textContent = t; }, 30); }
  function fallback(text) { var ta = document.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand("copy"); } catch (e) {} document.body.removeChild(ta); return ok; }
  $$("[data-bm-copy]").forEach(function (b) {
    b.hidden = false;
    var label = b.textContent;
    b.addEventListener("click", function () {
      var text = b.getAttribute("data-bm-copy");
      var done = function () { b.textContent = "Copied"; b.setAttribute("data-done", ""); announce("Copied: " + text); setTimeout(function () { b.textContent = label; b.removeAttribute("data-done"); }, 2400); };
      var fail = function () { if (fallback(text)) done(); else announce("Copying was blocked by the browser. The link is " + text); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fail); else fail();
    });
  });

  // the film finder: a search box and one collection at a time, with a count and a way back to everything
  var form = $(".bm-find"), cards = $$(".bm-vid");
  if (form && cards.length) {
    form.hidden = false;
    var q = $("#bm-q"), count = $("[data-bm-count]"), empty = $("[data-bm-empty]"), reset = $("[data-bm-reset]");
    var apply = function () {
      var term = q.value.trim().toLowerCase(), c = (form.querySelector("input[name=bm-c]:checked") || {}).value || "", n = 0;
      var words = term.split(/\s+/).filter(Boolean);
      cards.forEach(function (el) {
        var show = (!c || el.getAttribute("data-c") === c) && words.every(function (w) { return (el._q || (el._q = el.textContent.toLowerCase())).indexOf(w) >= 0; });
        el.hidden = !show; if (show) n++;
      });
      count.textContent = n === cards.length ? n + " films" : n + " of " + cards.length + " films";
      empty.hidden = n > 0; reset.hidden = !term && !c;
    };
    var clear = function () { q.value = ""; var all = form.querySelector("input[name=bm-c][value='']"); if (all) all.checked = true; apply(); q.focus(); };
    q.addEventListener("input", apply);
    $$("input[name=bm-c]", form).forEach(function (r) { r.addEventListener("change", apply); });
    reset.addEventListener("click", clear); $("[data-bm-reset2]").addEventListener("click", clear);
  }

  // the player: built only when a reader presses Watch, never autoplays, and stops when closed
  var dlg = $(".bm-player"), opener = null;
  if (dlg && typeof dlg.showModal === "function") {
    var frame = $(".bm-player__frame", dlg), links = $(".bm-player__links", dlg), h = $("#bm-player-h");
    $$("[data-bm-watch]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        var card = a.closest(".bm-vid"); if (!card) return;
        var rel = card.querySelector(".bm-row a:not(.bm-watch)"), img = card.querySelector(".bm-poster img");
        var v = { t: card.querySelector(".bm-h").textContent, f: a.getAttribute("href"), p: img ? img.getAttribute("src") : "", c: a.getAttribute("data-vtt") || "", r: rel ? rel.getAttribute("href") : "/", rt: rel ? rel.textContent.replace(/^Read the related page:?\s*/, "") : "" };
        e.preventDefault(); opener = a;
        h.textContent = v.t; frame.textContent = "";
        var vid = document.createElement("video"); vid.controls = true; vid.setAttribute("playsinline", ""); vid.preload = "metadata"; if (v.p) vid.poster = v.p;
        vid.setAttribute("aria-label", v.t);
        var s = document.createElement("source"); s.src = v.f; s.type = "video/mp4"; vid.appendChild(s);
        if (v.c) { var tr = document.createElement("track"); tr.kind = "captions"; tr.srclang = "en"; tr.label = "English"; tr.src = v.c; tr.default = true; vid.appendChild(tr); }
        frame.appendChild(vid);
        links.innerHTML = "";
        var mk = function (href, text, dl) { var l = document.createElement("a"); l.href = href; l.textContent = text; if (dl) l.setAttribute("download", ""); links.appendChild(l); };
        mk(v.r, "Read the related page: " + v.rt); mk(v.f, "Download the MP4", true); if (v.c) mk(v.c, "Captions file");
        dlg.showModal(); vid.focus();
      });
    });
    dlg.addEventListener("close", function () { var vid = $("video", dlg); if (vid) { vid.pause(); vid.removeAttribute("src"); frame.textContent = ""; } if (opener) opener.focus(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
  }
})();
