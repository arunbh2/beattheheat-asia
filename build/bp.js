// Build protection: a package for one place, or a portfolio across places, from window.BP (tools/build-pages.js).
// Cycles turn green when an action works on one of their links: "could help interrupt", never "will fix".
// State lives in the address (#place=… or #folio=…), so a package can be bookmarked or shared; nothing is sent anywhere.
(function () {
  "use strict";
  var B = window.BP, app = document.querySelector("[data-bp-app]");
  if (!B || !app) return;
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var C = {}; B.cards.forEach(function (c) { C[c.id] = c; });
  var SET = {}; B.sets.forEach(function (s) { SET[s.id] = s; });
  var HZ = {}; B.hz.forEach(function (h) { HZ[h[0]] = h[1]; });
  var ROLES = [["delivery", "Delivery"], ["evidence", "Evidence"], ["field", "Field-building"], ["catalytic", "Catalytic"]];
  var RN = {}; ROLES.forEach(function (r) { RN[r[0]] = r[1]; });
  var S = { mode: "place", set: "work", picks: [], folio: {} };

  // ---- address ----
  function read() {
    var h = decodeURIComponent(location.hash.slice(1)), m;
    if ((m = h.match(/^place=([a-z]+):?(.*)$/)) && SET[m[1]]) { S.mode = "place"; S.set = m[1]; S.picks = m[2].split(",").map(function (x) { return m[1] + ":" + x; }).filter(function (id) { return C[id]; }); }
    else if ((m = h.match(/^folio=(.*)$/))) { S.mode = "folio"; S.folio = {}; m[1].split(",").forEach(function (x) { var p = x.split("~"); if (C[p[0]]) S.folio[p[0]] = RN[p[1]] ? p[1] : defRole(C[p[0]]); }); }
  }
  function save() {
    var h = S.mode === "place" ? "place=" + S.set + ":" + S.picks.map(function (id) { return id.split(":")[1]; }).join(",")
      : "folio=" + Object.keys(S.folio).map(function (id) { return id + "~" + S.folio[id]; }).join(",");
    history.replaceState(null, "", "#" + h);
  }
  function defRole(c) { return /concept|test|reported/.test(c.ev) ? "evidence" : "delivery"; }

  // ---- shared pieces ----
  function loopsOf(ids) { var o = {}; ids.forEach(function (id) { C[id].loops.forEach(function (l) { o[l] = 1; }); }); return o; }
  function ring(hit) {
    return '<div class="bp-ring">' + B.groups.map(function (g) {
      return '<div class="bp-rg"><p>' + esc(g[1]) + '</p><ul>' + B.loops.filter(function (l) { return l.g === g[0]; }).map(function (l) {
        return '<li class="' + (hit[l.id] ? "is-on" : "") + '"><a href="/#loop-' + l.id + '" title="' + esc(l.n) + '"><i></i><span>' + esc(l.n) + "</span></a></li>"; }).join("") + "</ul></div>";
    }).join("") + "</div>";
  }
  var evChip = function (c) { var e = B.ev[c.ev] || [c.ev, ""]; return '<span class="ev-tag ev-tag--' + esc(c.ev) + '" title="' + esc(e[1]) + '">' + esc(e[0]) + "</span>"; };
  var hzChip = function (c) { return '<span class="bp-hz">' + esc(HZ[c.h] || c.h) + "</span>"; };
  var instList = function (ids, link) {
    var n = {}; ids.forEach(function (id) { C[id].who.forEach(function (w) { n[w] = (n[w] || 0) + 1; }); });
    return Object.keys(n).sort(function (a, b) { return n[b] - n[a]; }).map(function (w) { return [w, n[w]]; });
  };

  // ---- one place ----
  function place() {
    var s = SET[S.set], shelf = B.cards.filter(function (c) { return c.s === S.set; }), picks = S.picks, hit = loopsOf(picks), nHit = Object.keys(hit).length;
    var tiles = '<div class="bp-sets" role="radiogroup" aria-label="Choose a place">' + B.sets.map(function (x) {
      return '<button type="button" role="radio" aria-checked="' + (x.id === S.set) + '" data-set="' + x.id + '"><b>' + esc(x.sh) + "</b>" + (x.n !== x.sh ? "<span>" + esc(x.n.replace(/^Before summer: /, "")) + "</span>" : "") + "</button>"; }).join("") + "</div>";
    var cards = B.hz.map(function (h) {
      var cs = shelf.filter(function (c) { return c.h === h[0]; }); if (!cs.length) return "";
      return '<p class="bp-sh">' + esc(h[1]) + "</p>" + cs.map(function (c) {
        var on = picks.indexOf(c.id) > -1;
        return '<article class="bp-card' + (on ? " is-on" : "") + '"><div class="bp-ct"><h3>' + esc(c.t) + "</h3>" + evChip(c) + "</div><p>" + esc(c.w) + "</p>" +
          '<details><summary>Evidence and who it protects</summary><p><b>Protects:</b> ' + esc(c.p) + "</p><p>" + esc(c.et) + (c.src ? ' <a href="' + esc(c.src[1]) + '" target="_blank" rel="noopener">' + esc(c.src[0]) + "</a>" : "") + "</p></details>" +
          '<button type="button" class="bp-add" data-pick="' + c.id + '" aria-pressed="' + on + '">' + (on ? "Added · remove" : "Add to the package") + "</button></article>";
      }).join("");
    }).join("");
    var hzCover = B.hz.map(function (h) { var on = picks.some(function (id) { return C[id].h === h[0]; }); return '<li class="' + (on ? "is-on" : "") + '">' + esc(h[1]) + (on ? "" : ": not yet covered") + "</li>"; }).join("");
    var who = instList(picks);
    var miss = B.loops.filter(function (l) { return !hit[l.id]; });
    var sheet = picks.length ? '<h3 class="bp-h">Cycles it could help interrupt <span>' + nHit + " of " + B.loops.length + "</span></h3>" + ring(hit) +
      '<h3 class="bp-h">When it works</h3><ul class="bp-hzs">' + hzCover + "</ul>" +
      '<h3 class="bp-h">What it depends on</h3><ul class="bp-ul">' + picks.map(function (id) { return "<li><b>" + esc(C[id].t) + ":</b> " + esc([].concat(C[id].need).join("; ")) + "</li>"; }).join("") + "</ul>" +
      '<h3 class="bp-h">Who acts</h3><ul class="bp-who">' + who.map(function (w) { return "<li>" + esc(B.inst[w[0]] || w[0]) + " <span>" + w[1] + " of " + picks.length + "</span></li>"; }).join("") + '</ul><p class="bp-note">See who could hold each part on <a href="/who-holds-it/#' + C[picks[0]].lv + '">Who holds it up</a>.</p>' +
      '<h3 class="bp-h">What it takes to keep running</h3><ul class="bp-ul">' + picks.map(function (id) { return "<li><b>" + esc(C[id].t) + ":</b> " + esc(C[id].run) + "</li>"; }).join("") + "</ul>" +
      '<h3 class="bp-h">What could stop it</h3><ul class="bp-ul">' + picks.map(function (id) { return "<li><b>" + esc(C[id].t) + ":</b> " + esc(C[id].stop) + "</li>"; }).join("") + "</ul>" +
      '<h3 class="bp-h">What it cannot fix</h3><p class="bp-note">This package does not reach ' + miss.length + " of the " + B.loops.length + " cycles. Some sit far from this place, such as the heat itself or the rules and budgets set elsewhere; others may need partners beyond it.</p>" +
      '<details class="bp-miss"><summary>See the cycles it does not reach</summary><ul>' + miss.map(function (l) { return '<li><a href="/#loop-' + l.id + '">' + esc(l.n) + "</a></li>"; }).join("") + "</ul></details>" +
      '<div class="bp-acts"><button type="button" data-copy>Copy a link to this package</button><button type="button" data-print>Print a summary</button><button type="button" data-clear>Start again</button></div>'
      : '<p class="bp-empty">Add actions from the shelf to see which cycles they could help interrupt, what they depend on and who acts.</p><button type="button" class="bp-start" data-start>Start with one action for each problem people here report</button>' + ring({});
    app.innerHTML = '<h2 class="bp-step"><span>1</span> Choose a place</h2>' + tiles + '<p class="bp-intro">' + esc(s.i) + "</p>" +
      '<div class="bp-grid"><div class="bp-shelf"><h2 class="bp-step"><span>2</span> Add actions</h2>' + cards + '</div><aside class="bp-sheet" aria-label="Your package"><h2 class="bp-step"><span>3</span> Your package <em>' + picks.length + "</em></h2>" + sheet + "</aside></div>" +
      '<div class="bp-bar" aria-hidden="true">' + picks.length + " actions · could help interrupt " + nHit + " of " + B.loops.length + " cycles</div>";
    app.querySelectorAll("[data-set]").forEach(function (b) { b.addEventListener("click", function () { if (S.set !== b.dataset.set) { S.set = b.dataset.set; S.picks = []; } render(); }); });
    app.querySelectorAll("[data-pick]").forEach(function (b) { b.addEventListener("click", function () { var id = b.dataset.pick, i = S.picks.indexOf(id); if (i > -1) S.picks.splice(i, 1); else S.picks.push(id); render(); }); });
    var st = app.querySelector("[data-start]"); if (st) st.addEventListener("click", function () { S.picks = s.start.map(function (x) { return S.set + ":" + x; }).filter(function (id, i, a) { return C[id] && a.indexOf(id) === i; }); render(); });
    tools();
  }

  // ---- portfolio ----
  function folio() {
    var ids = Object.keys(S.folio), hit = loopsOf(ids), nHit = Object.keys(hit).length;
    var rows = B.sets.map(function (s) {
      return '<fieldset class="bp-fs"><legend>' + esc(s.n) + "</legend>" + B.cards.filter(function (c) { return c.s === s.id; }).map(function (c) {
        var on = !!S.folio[c.id];
        return '<div class="bp-fr' + (on ? " is-on" : "") + '"><label><input type="checkbox" data-f="' + c.id + '"' + (on ? " checked" : "") + "> <span>" + esc(c.t) + "</span></label>" + evChip(c) +
          (on ? '<select data-r="' + c.id + '" aria-label="Role of the grant for ' + esc(c.t) + '">' + ROLES.map(function (r) { return '<option value="' + r[0] + '"' + (S.folio[c.id] === r[0] ? " selected" : "") + ">" + r[1] + "</option>"; }).join("") + "</select>" : "") + "</div>";
      }).join("") + "</fieldset>";
    }).join("");
    var out;
    if (!ids.length) out = '<p class="bp-empty">Tick a few actions across places, and choose the role a grant would play in each. The view shows what the portfolio reaches, its balance, and what it leans on.</p>' + ring({});
    else {
      var rc = {}; ids.forEach(function (id) { rc[S.folio[id]] = (rc[S.folio[id]] || 0) + 1; });
      var sets = {}; ids.forEach(function (id) { sets[C[id].s] = 1; });
      var who = instList(ids), lean = who.filter(function (w) { return ids.length >= 3 && w[1] / ids.length >= 0.6; });
      var unev = ids.filter(function (id) { return !/evaluated|measured/.test(C[id].ev); });
      var miss = B.loops.filter(function (l) { return !hit[l.id]; });
      out = '<h3 class="bp-h">Cycles it could help interrupt <span>' + nHit + " of " + B.loops.length + "</span></h3>" + ring(hit) +
        '<details class="bp-miss"><summary>' + miss.length + " cycles it does not reach</summary><ul>" + miss.map(function (l) { return '<li><a href="/#loop-' + l.id + '">' + esc(l.n) + "</a></li>"; }).join("") + "</ul></details>" +
        '<h3 class="bp-h">Balance of roles</h3><div class="bp-bal">' + ROLES.map(function (r) { var n = rc[r[0]] || 0; return n ? '<span class="bp-b bp-b--' + r[0] + '" style="flex:' + n + '">' + r[1] + " · " + n + "</span>" : ""; }).join("") + "</div>" +
        '<p class="bp-note">' + ROLES.filter(function (r) { return !rc[r[0]]; }).map(function (r) { return r[1]; }).join(", ").replace(/^(.+)$/, "No pieces yet for: $1.") + "</p>" +
        '<h3 class="bp-h">Places</h3><ul class="bp-hzs">' + B.sets.map(function (s) { return '<li class="' + (sets[s.id] ? "is-on" : "") + '">' + esc(s.sh) + "</li>"; }).join("") + "</ul>" +
        '<h3 class="bp-h">When it works</h3><ul class="bp-hzs">' + B.hz.map(function (h) { var on = ids.some(function (id) { return C[id].h === h[0]; }); return '<li class="' + (on ? "is-on" : "") + '">' + esc(h[1]) + "</li>"; }).join("") + "</ul>" +
        '<h3 class="bp-h">What it leans on</h3><ul class="bp-who">' + who.map(function (w) { return "<li>" + esc(B.inst[w[0]] || w[0]) + " <span>" + w[1] + " of " + ids.length + "</span></li>"; }).join("") + "</ul>" +
        (lean.length ? '<p class="bp-flag">Most pieces depend on ' + lean.map(function (w) { return esc((B.inst[w[0]] || w[0]).toLowerCase()); }).join(" and ") + ". If they cannot act, much of the portfolio waits: a relationship worth investing in early.</p>" : "") +
        '<h3 class="bp-h">What it would learn</h3><p class="bp-note">' + unev.length + " of " + ids.length + " pieces have not yet been measured in a study or independently evaluated. Building evaluation into them would add to what the field knows. <a href=\"/evidence-map/#questions\">Questions nobody has answered yet</a></p>" +
        '<h3 class="bp-h">What would need to be true for it to last</h3><ul class="bp-ul">' + ids.map(function (id) { return "<li><b>" + esc(C[id].t) + ":</b> someone keeps paying for " + esc(C[id].run.charAt(0).toLowerCase() + C[id].run.slice(1)) + "</li>"; }).join("") + "</ul>" +
        '<div class="bp-acts"><button type="button" data-copy>Copy a link to this portfolio</button><button type="button" data-print>Print a summary</button><button type="button" data-clear>Start again</button></div>';
    }
    app.innerHTML = '<p class="bp-intro">For funders and programme teams: a sketch of a few grants across places and roles, to see what the whole reaches and what it leans on. It does not recommend any organisation.</p>' +
      '<div class="bp-grid"><div class="bp-shelf"><h2 class="bp-step"><span>1</span> Choose actions and roles</h2>' + rows + '</div><aside class="bp-sheet" aria-label="Your portfolio"><h2 class="bp-step"><span>2</span> The portfolio <em>' + ids.length + "</em></h2>" + out + "</aside></div>";
    app.querySelectorAll("[data-f]").forEach(function (x) { x.addEventListener("change", function () { if (x.checked) S.folio[x.dataset.f] = defRole(C[x.dataset.f]); else delete S.folio[x.dataset.f]; render(); }); });
    app.querySelectorAll("[data-r]").forEach(function (x) { x.addEventListener("change", function () { S.folio[x.dataset.r] = x.value; render(); }); });
    tools();
  }

  function tools() {
    var c = app.querySelector("[data-copy]"); if (c) c.addEventListener("click", function () { (navigator.clipboard ? navigator.clipboard.writeText(location.href) : Promise.reject()).then(function () { c.textContent = "Link copied"; }, function () { c.textContent = "Copy the page address to share"; }); });
    var p = app.querySelector("[data-print]"); if (p) p.addEventListener("click", function () { window.print(); });
    var x = app.querySelector("[data-clear]"); if (x) x.addEventListener("click", function () { if (S.mode === "place") S.picks = []; else S.folio = {}; render(); });
  }
  function render() {
    document.querySelectorAll("[data-mode]").forEach(function (b) { b.setAttribute("aria-selected", String(b.dataset.mode === S.mode)); });
    (S.mode === "place" ? place : folio)(); save();
  }
  document.querySelectorAll("[data-mode]").forEach(function (b) { b.addEventListener("click", function () { S.mode = b.dataset.mode; render(); }); });
  window.addEventListener("hashchange", function () { read(); render(); });
  read(); render();
})();
