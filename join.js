/* Common Shade: the "Join the collaborative" form on /join/, and a quiet invitation card elsewhere on the site.
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

  var KEY = "bth-invite-v1", DAY = 864e5;
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

  /* ---- elsewhere: one gentle invitation, at most once a month ----
     Browsers do not let a page show its own message as a tab closes, so the card appears either when the
     pointer heads for the tab bar (desktop) or after a visitor has spent time and scrolled (any device). */
  function invite() {
    if (!JOIN.formUrl) return;
    var seen = store(true);
    if (seen && Date.now() - seen.at < (seen.joined ? 180 : 30) * DAY) return;
    try { if (sessionStorage.getItem(KEY)) return; } catch (e) {}
    var start = Date.now(), shown = false, el;

    function show(leaving) {
      if (shown) return;
      var menu = document.getElementById("site-menu"); if (menu && !menu.hidden) return;
      shown = true; cleanup();
      try { sessionStorage.setItem(KEY, "1"); } catch (e) {}
      el = document.createElement("div");
      el.className = "invite"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "false"); el.setAttribute("aria-labelledby", "invite-h");
      el.innerHTML =
        '<button type="button" class="invite__x" aria-label="Not now, close">×</button>' +
        '<p class="invite__eyebrow">Common Shade</p>' +
        '<h2 class="invite__h" id="invite-h">' + (leaving ? "Before you go" : "Working on heat?") + '</h2>' +
        '<p class="invite__p">People and organisations across South and Southeast Asia are shaping a collaborative on protection from extreme heat. Would you like to join, or just hear what changes?</p>' +
        '<div class="invite__acts">' +
          '<a class="invite__btn invite__btn--main" href="/join/" target="_blank" rel="noopener" data-act="join">Join the collaborative<span class="visually-hidden"> (opens in a new tab)</span>&nbsp;<span aria-hidden="true">↗</span></a>' +
          '<a class="invite__btn" href="/join/#updates" target="_blank" rel="noopener" data-act="updates">Keep me updated<span class="visually-hidden"> (opens in a new tab)</span></a>' +
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
      document.removeEventListener("keydown", onKey);
      if (el) { el.classList.remove("is-in"); setTimeout(function () { if (el) el.remove(); }, 300); }
    }
    function onKey(e) { if (e.key === "Escape") close(false); }
    function onLeave(e) { if (!e.relatedTarget && e.clientY <= 0 && Date.now() - start > 15000) show(true); }
    function onScroll() {
      var h = document.documentElement, depth = (h.scrollTop + innerHeight) / h.scrollHeight;
      if (depth > 0.35 && Date.now() - start > 45000) show(false);
    }
    function cleanup() { document.removeEventListener("mouseout", onLeave); removeEventListener("scroll", onScroll); }
    if (matchMedia("(hover: hover) and (pointer: fine)").matches) document.addEventListener("mouseout", onLeave);
    addEventListener("scroll", onScroll, { passive: true });
  }

  function boot() { if (document.body.dataset.page === "join") renderForm(); else invite(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
