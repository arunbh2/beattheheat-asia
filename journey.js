/* Common Shade: the homepage as a journey in five acts. Marks where you are on the journey line, remembers how far you
   came (in this browser only) so you can continue, opens with heat right now from the readings the live ticker keeps,
   and carries the city you choose into later acts. Nothing here is sent anywhere. */
(function () {
  "use strict";
  var load = function (k, d) { try { var v = JSON.parse(localStorage.getItem(k) || "null"); return v == null ? d : v; } catch (e) { return d; } };
  var save = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  var NAMES = ["Prologue", "Feel it", "See how it connects", "Where it lands", "What helps", "Together"];
  var acts = [].slice.call(document.querySelectorAll("[data-act-n]")), links = [].slice.call(document.querySelectorAll("[data-j]"));
  var bar = document.querySelector("[data-journey-bar]"), nav = document.querySelector("[data-journey]");
  if (!acts.length) return;
  var mem = load("cs-journey", { act: 0 }), current = 0;

  // where you are: the last act whose opening has scrolled past the middle of the screen
  function update() {
    var mid = innerHeight * 0.45, n = 0;
    acts.forEach(function (a) { if (a.getBoundingClientRect().top < mid) n = +a.dataset.actN; });
    var ep = document.getElementById("epilogue"); if (ep && ep.getBoundingClientRect().top < mid) n = 6;
    if (n !== current) {
      current = n;
      links.forEach(function (l) { var j = +l.dataset.j, on = j === Math.min(n, 5); l.classList.toggle("is-on", on); l.classList.toggle("is-past", j < n); if (on) l.setAttribute("aria-current", "step"); else l.removeAttribute("aria-current"); });
      if (nav) nav.classList.toggle("is-shown", n >= 1 && n <= 5);
      if (n > (mem.act || 0) && n <= 6) { mem = { act: n, at: Date.now() }; save("cs-journey", mem); }
    }
    if (bar) { var h = document.documentElement, f = h.scrollTop / Math.max(1, h.scrollHeight - innerHeight); bar.style.transform = "scaleX(" + Math.min(1, Math.max(0, f)).toFixed(3) + ")"; }
  }
  var ticking = false;
  addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; update(); }); } }, { passive: true });
  addEventListener("resize", update);
  update();

  // welcome back: continue where you left off (only when you arrive at the top, not from a link into the map)
  var resume = document.querySelector("[data-resume]");
  if (resume && !location.hash && mem.act >= 1 && mem.act <= 5 && Date.now() - (mem.at || 0) < 120 * 864e5) {
    resume.innerHTML = 'Welcome back. <a href="#act-' + mem.act + '">Continue from Act ' + mem.act + ': ' + NAMES[mem.act] + ' <span aria-hidden="true">↓</span></a>';
    resume.hidden = false;
  }

  // the opening line: heat right now, from the model readings the site's live ticker keeps
  var live = document.querySelector("[data-live]"), tries = 0;
  function cities() { try { return LIVE_CITIES; } catch (e) { return []; } }
  function nameOf(id) { var c = cities().filter(function (x) { return x.id === id; })[0]; return c ? c.name : ""; }
  function opening() {
    var d = load("bth-live-v1", null);
    if (d && d.cities && Date.now() - d.at < 3 * 3600 * 1000) {
      var best = null; Object.keys(d.cities).forEach(function (id) { var c = d.cities[id]; if (c && isFinite(c.feels) && (!best || c.feels > d.cities[best].feels)) best = id; });
      if (best && nameOf(best)) {
        var c = d.cities[best];
        live.innerHTML = "Right now in " + nameOf(best) + " it is " + Math.round(c.t) + "°C, and it feels like " + Math.round(c.feels) + "°C. <span>Model estimate, not an official warning.</span>";
        live.hidden = false; return;
      }
    }
    if (++tries < 15) setTimeout(opening, 1500);
  }
  if (live) opening();

  // the city you choose in Act 3 travels with you into Act 4
  function myCity() {
    var m = location.hash.match(/^#city-([a-z]+)$/); if (m && nameOf(m[1])) save("cs-my-city", m[1]);
    var id = load("cs-my-city", ""), n = nameOf(id); if (!n) return;
    document.querySelectorAll("[data-my-city-line]").forEach(function (e) { e.textContent = "(you chose " + n + ")"; });
    document.querySelectorAll("[data-my-city-in]").forEach(function (e) { e.textContent = ", including in " + n; });
  }
  myCity(); addEventListener("hashchange", myCity);
  var lastHash = location.hash; setInterval(function () { if (location.hash !== lastHash) { lastHash = location.hash; myCity(); } }, 1000);
})();
