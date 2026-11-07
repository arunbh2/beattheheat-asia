/* Common Shade: the "Help build Common Shade" form on /join/, and a quiet invitation card elsewhere on the site.
   Both stay off until JOIN.formUrl holds a Microsoft Form link, so nobody is invited to a form that does not exist. */
(function () {
  "use strict";

  var JOIN = {
    // Microsoft Forms: Collect responses, then the </> Embed button; paste the src link (or the plain share link) here.
    formUrl: "https://forms.cloud.microsoft/e/SNfMp0esFh",
    // Who reads and manages the answers, and where people can ask to see or delete them. Shown in the privacy note.
    steward: "",
    contact: ""
  };

  var KEY = "bth-invite-v1";
  function store(get, val) {
    try { if (get) return JSON.parse(localStorage.getItem(KEY) || "null"); localStorage.setItem(KEY, JSON.stringify(val)); } catch (e) { return null; }
  }
  function embedUrl(u) { return /[?&]embed=true/.test(u) ? u : u + (u.indexOf("?") < 0 ? "?" : "&") + "embed=true"; }

  /* ---- /join/: the form ---- */
  function renderForm() {
    var box = document.getElementById("join-form"); if (!box) return;
    if (JOIN.steward) document.querySelectorAll('[data-join="steward"]').forEach(function (el) { el.textContent = JOIN.steward; });
    if (JOIN.contact) document.querySelectorAll('[data-join="contact"]').forEach(function (el) {
      el.textContent = "To see, correct or delete what you sent, write to ";
      var a = document.createElement("a"); a.href = "mailto:" + JOIN.contact; a.textContent = JOIN.contact; el.appendChild(a); el.appendChild(document.createTextNode("."));
    });
    if (!JOIN.formUrl) {
      box.innerHTML = '<p class="join-form__wait"><b>The registration form opens shortly.</b> Please come back in a few days; this page will carry it.</p>';
      return;
    }
    box.innerHTML = "";
    var f = document.createElement("iframe");
    f.src = embedUrl(JOIN.formUrl); f.title = "Register my interest: the collaborative’s form, on Microsoft Forms";
    f.loading = "lazy"; f.setAttribute("allowfullscreen", ""); f.className = "join-form__frame";
    var p = document.createElement("p"); p.className = "join-form__alt";
    p.innerHTML = 'Form not showing, or easier on a full screen? <a href="' + JOIN.formUrl.replace(/[?&]embed=true/, "").replace(/"/g, "&quot;") + '" target="_blank" rel="noopener">Open the form in a new tab<span class="visually-hidden"> (opens in a new tab)</span>&nbsp;<span aria-hidden="true">↗</span></a>';
    box.appendChild(f); box.appendChild(p);
  }

  /* ---- /join/: ways in, where you are coming from, and a form that remembers both ---- */
  var GUIDE = {
    listen: "<b>You chose to listen.</b> In the form, choose “Staying informed” as your contribution. That is all.",
    share: "<b>You chose to share.</b> In the last question, tell us what you would like to share. A link or a few lines is plenty.",
    build: "<b>You chose to build.</b> In the last question, describe what you would like to explore. A rough idea is a good start."
  };
  function journey() {
    var ways = [].slice.call(document.querySelectorAll("[data-way]")); if (!ways.length) return;
    var panels = document.querySelectorAll("[data-panel]"), hint = document.querySelector("[data-panel-hint]"), guide = document.querySelector("[data-guide]");
    var roots = [].slice.call(document.querySelectorAll("[data-root]")), fits = document.querySelectorAll("[data-fit]");
    var base = guide ? guide.innerHTML : "", S = { way: "", roots: [] };
    // arriving from a change on /growing/ (?about=...): name it, so it can be mentioned in the form
    var about = ""; try { about = (new URLSearchParams(location.search).get("about") || "").slice(0, 160); } catch (e) {}
    var aboutEsc = about.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
    document.documentElement.classList.add("jn-js");
    function names() { return roots.filter(function (r) { return S.roots.indexOf(r.dataset.root) > -1; }).map(function (r) { return r.querySelector("b").textContent; }); }
    function sync() {
      ways.forEach(function (w) { var on = w.dataset.way === S.way; w.setAttribute("aria-checked", String(on)); w.tabIndex = on || (!S.way && w === ways[0]) ? 0 : -1; });
      panels.forEach(function (p) { p.hidden = p.dataset.panel !== S.way; });
      if (hint) hint.hidden = !!S.way;
      roots.forEach(function (r) { r.setAttribute("aria-pressed", String(S.roots.indexOf(r.dataset.root) > -1)); });
      fits.forEach(function (f) { f.hidden = S.roots.indexOf(f.dataset.fit) < 0; });
      if (guide) { var n = names();
        guide.innerHTML = (S.way ? GUIDE[S.way] : base) + (n.length ? " <span class=\"jn-guide__roots\">You told us you work on " + n.join(", ").toLowerCase() + ": mentioning it in the form helps the right person read it.</span>" : "") +
          (about ? " <span class=\"jn-guide__roots\">You are writing about “" + aboutEsc + "”: naming it in the form helps the right person read it.</span>" : ""); }
    }
    function pick(w, focus) { S.way = w; sync(); if (focus) { var b = document.getElementById("way-" + w); if (b) b.focus(); } }
    ways.forEach(function (w, i) {
      w.addEventListener("click", function () { pick(w.dataset.way); });
      w.addEventListener("keydown", function (e) {   // a radio group: arrows move between the three ways
        var k = e.key, j = k === "ArrowRight" || k === "ArrowDown" ? i + 1 : k === "ArrowLeft" || k === "ArrowUp" ? i - 1 : null;
        if (j === null) return; e.preventDefault(); pick(ways[(j + ways.length) % ways.length].dataset.way, true);
      });
    });
    roots.forEach(function (r) { r.addEventListener("click", function () { var k = r.dataset.root, i = S.roots.indexOf(k); if (i > -1) S.roots.splice(i, 1); else S.roots.push(k); sync(); }); });
    document.querySelectorAll("[data-pick]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); pick(a.dataset.pick); var sec = document.getElementById("ways"); if (sec) sec.scrollIntoView({ behavior: "smooth", block: "start" }); setTimeout(function () { var b = document.getElementById("way-" + a.dataset.pick); if (b) b.focus({ preventScroll: true }); }, 450); }); });
    document.querySelectorAll("[data-go]").forEach(function (a) { a.addEventListener("click", function () { S.way = a.dataset.go; sync(); }); });
    var h = location.hash.match(/^#(?:way-)?(listen|share|build|updates)$/); if (h) pick(h[1] === "updates" ? "listen" : h[1]);
    sync();
  }

  /* ---- elsewhere: the invitation, on every page of every visit (the site owner's choice, November 2026) ----
     It appears once someone has read for 20 seconds and scrolled a little (or straight away on a short page). Once they
     answer it (a link, Not now, x or Escape), it rests for the rest of that visit, so it never returns on every click.
     Only one card shows at a time: <html data-cs-pop> marks one that is open (see everything.js). */
  function invite() {
    if (!JOIN.formUrl) return;
    var preview = /[?&]preview=invite\b/.test(location.search);   // to check the card: add ?preview=invite to any address
    try { if (sessionStorage.getItem(KEY) && !preview) return; } catch (e) {}
    var start = preview ? 0 : Date.now() - (window.performance ? performance.now() : 0), shown = false, el;   // timed from arrival, though this script may load late

    function show() {
      if (shown || document.documentElement.dataset.csPop) return;
      shown = true; cleanup(); clearInterval(timer);
      document.documentElement.dataset.csPop = "invite";
      el = document.createElement("div");
      el.className = "invite"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "false"); el.setAttribute("aria-labelledby", "invite-h");
      el.innerHTML =
        '<button type="button" class="invite__x" aria-label="Not now, close">×</button>' +
        '<p class="invite__eyebrow">Common Shade</p>' +
        '<h2 class="invite__h" id="invite-h">Working on heat?</h2>' +
        '<p class="invite__p">Common Shade is being built by people across South and Southeast Asia who work on heat in many different ways. If you would like to take part, at whatever pace suits you, there is room for you.</p>' +
        '<div class="invite__acts">' +
          '<a class="invite__btn invite__btn--main" href="/join/" target="_blank" rel="noopener" data-act="join">See the ways in<span class="visually-hidden"> (opens in a new tab)</span>&nbsp;<span aria-hidden="true">↗</span></a>' +
          '<a class="invite__btn" href="/join/#way-listen" target="_blank" rel="noopener" data-act="updates">Just keep me updated<span class="visually-hidden"> (opens in a new tab)</span></a>' +
        '</div>' +
        '<button type="button" class="invite__later">Not now</button>';
      document.body.appendChild(el);
      requestAnimationFrame(function () { el.classList.add("is-in"); });
      el.addEventListener("click", function (e) {
        var t = e.target.closest("[data-act], .invite__x, .invite__later"); if (!t) return;
        close(!!t.dataset.act);
      });
      document.addEventListener("keydown", onKey);
    }
    function close(joined) {
      store(false, { at: Date.now(), joined: !!joined });
      try { sessionStorage.setItem(KEY, "1"); } catch (e) {}
      if (document.documentElement.dataset.csPop === "invite") delete document.documentElement.dataset.csPop;
      document.removeEventListener("keydown", onKey);
      if (el) { el.classList.remove("is-in"); setTimeout(function () { if (el) el.remove(); }, 300); }
    }
    function onKey(e) { if (e.key === "Escape") close(false); }
    function ready() {
      var h = document.documentElement, short = h.scrollHeight < innerHeight * 1.6, depth = (h.scrollTop + innerHeight) / h.scrollHeight;
      if (Date.now() - start > 20000 && (short || depth > 0.25)) show();
    }
    function cleanup() { removeEventListener("scroll", ready); }
    addEventListener("scroll", ready, { passive: true });
    var timer = setInterval(ready, 2500);   // a short page has nothing to scroll
  }

  function boot() { if (document.body.dataset.page === "join") { renderForm(); journey(); } else invite(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
