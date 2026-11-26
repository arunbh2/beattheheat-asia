/* Common Shade: the finder on /signals/. The newest records are on the page (built by tools/build-signals.js) and the rest
   load from cards.json the first time a reader filters, searches, opens a view, follows a link to an older record, prints,
   downloads or asks for them all; /signals/all/ lists every record without a script. This adds
   search, filters and views kept in the URL (so a view survives refresh, sharing and Back/Forward), records saved in this
   browser only, a printable briefing and a plain-text download of what is shown. With no script the page reads in full. */
(function () {
  "use strict";
  var form = document.getElementById("sg-find"), list = document.getElementById("sg-list"), empty = document.getElementById("sg-empty");
  if (!form || !list || !window.URLSearchParams) return;
  var cards = [].slice.call(list.querySelectorAll(".sg-card")), status = form.querySelector(".sg-status");
  var total = +list.getAttribute("data-total") || cards.length, moreUrl = list.getAttribute("data-more") || "", waiting = null, moreLink = document.getElementById("sg-morelink");
  var KEY = "cs-signals-saved", FIELDS = ["q", "place", "kind", "lever", "pop", "rung", "state", "recent", "due"];
  var today = new Date(), iso = function (d) { return d.toISOString().slice(0, 10); };
  var dayKey = function (s) { return String(s || "").padEnd(10, "-"); };
  var shift = function (n) { var d = new Date(today); d.setDate(d.getDate() + n); return iso(d); };
  var saved = function () { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; } };
  var setSaved = function (a) { try { if (a.length) localStorage.setItem(KEY, JSON.stringify(a)); else localStorage.removeItem(KEY); return true; } catch (e) { return false; } };
  // search text: the title, who and where, summary and deliverables, read once from the card itself
  function prep(cs) { cs.forEach(function (c) { c._text = [].map.call(c.querySelectorAll(".sg-h, .sg-who, .sg-sum, .sg-del__what"), function (el) { return el.textContent; }).join(" ").toLowerCase().replace(/\s+/g, " "); var t = c.querySelector(".sg-tools"); if (t) t.hidden = false; }); }
  prep(cards);
  form.hidden = false;
  // the other records, fetched once; every caller waits for the same request
  function loadAll(done) {
    if (!moreUrl) { done(); return; }
    if (waiting) { waiting.push(done); return; }
    waiting = [done]; if (status) status.textContent = "Loading the other records…";
    fetch(moreUrl).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (j) {
      var older = document.getElementById("sg-older"); if (older) older.parentNode.removeChild(older);   // its anchors move to the full cards
      var have = {}; cards.forEach(function (c) { have[c.id] = 1; });
      var box = document.createElement("div"); box.innerHTML = j.cards.filter(function (c) { return !have[c.id]; }).map(function (c) { return c.html; }).join("");
      var added = [].slice.call(box.querySelectorAll(".sg-card")); added.forEach(function (c) { list.appendChild(c); });
      prep(added); cards = cards.concat(added); moreUrl = ""; if (moreLink) moreLink.hidden = true;
      var w = waiting; waiting = null; w.forEach(function (f) { f(); });
    }).catch(function () {
      var w = waiting; waiting = null; w.forEach(function (f) { f(); });   // filter what is here, then say what is missing
      if (status) status.textContent += " The other records could not be loaded: check the connection and try again, or open every record on one page.";
      if (moreLink) moreLink.hidden = false;
    });
  }
  var olderList = document.getElementById("sg-older");
  if (olderList) olderList.addEventListener("click", function (ev) { var a = ev.target.closest("a"); if (!a) return; ev.preventDefault();
    var id = a.getAttribute("href").split("#")[1]; history.pushState(null, "", location.pathname + location.search + "#" + id); reveal(); });
  if (moreLink) { var mb = document.createElement("button"); mb.type = "button"; mb.className = "sg-link"; mb.textContent = "Show all " + total + " records";
    mb.addEventListener("click", function () { loadAll(function () { apply(read()); }); }); moreLink.appendChild(document.createTextNode(" or ")); moreLink.appendChild(mb); }

  function read() {
    var p = new URLSearchParams(location.search), s = { view: p.get("view") || "recent" };
    FIELDS.forEach(function (f) { s[f] = p.get(f) || ""; });
    if (!/^(recent|commitments|upcoming|saved)$/.test(s.view)) s.view = "recent";
    return s;
  }
  function write(s, push) {
    var p = new URLSearchParams();
    if (s.view !== "recent") p.set("view", s.view);
    FIELDS.forEach(function (f) { if (s[f]) p.set(f, s[f]); });
    var qs = p.toString(), url = location.pathname + (qs ? "?" + qs : "") + location.hash;
    if (url !== location.pathname + location.search + location.hash) history[push ? "pushState" : "replaceState"](null, "", url);
  }
  function toForm(s) {
    FIELDS.forEach(function (f) { var el = form.elements[f]; if (!el) return; if (el.type === "checkbox") el.checked = !!s[f]; else if ([].some.call(el.options || [], function (o) { return o.value === s[f]; }) || el.type === "search") el.value = s[f]; else el.value = ""; });
    [].forEach.call(form.querySelectorAll("[data-view]"), function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-view") === s.view)); });
  }
  function fromForm(view) {
    var s = { view: view || read().view };
    FIELDS.forEach(function (f) { var el = form.elements[f]; s[f] = !el ? "" : el.type === "checkbox" ? (el.checked ? "1" : "") : el.value.trim(); });
    return s;
  }
  var has = function (c, attr, v) { return (" " + (c.getAttribute(attr) || "") + " ").indexOf(" " + v + " ") > -1; };
  function match(c, s, sv) {
    if (s.view === "commitments" && c.getAttribute("data-kind") !== "commitment") return false;
    if (s.view === "upcoming" && !(dayKey(c.getAttribute("data-up")) > dayKey(iso(today)) || (c.getAttribute("data-due") && dayKey(c.getAttribute("data-due")) <= dayKey(shift(60))))) return false;
    if (s.view === "saved" && sv.indexOf(c.id) < 0) return false;
    if (s.q) { var words = s.q.toLowerCase().split(/\s+/).filter(Boolean), t = c._text || ""; if (!words.every(function (w) { return t.indexOf(w) > -1; })) return false; }
    if (s.place && !has(c, "data-places", s.place)) return false;
    if (s.kind && c.getAttribute("data-kind") !== s.kind) return false;
    if (s.lever && !has(c, "data-levers", s.lever)) return false;
    if (s.pop && !has(c, "data-pops", s.pop)) return false;
    if (s.rung && !has(c, "data-rungs", s.rung)) return false;
    if (s.state && !has(c, "data-states", s.state)) return false;
    if (s.recent && !(dayKey(c.getAttribute("data-latest")) >= dayKey(shift(-90)))) return false;
    if (s.due && !(c.getAttribute("data-due") && dayKey(c.getAttribute("data-due")) <= dayKey(shift(30)))) return false;
    return true;
  }
  var ORDER = {
    recent: function (a, b) { return dayKey(b.getAttribute("data-latest")).localeCompare(dayKey(a.getAttribute("data-latest"))); },
    commitments: function (a, b) { return b.querySelectorAll(".sg-check .is-confirmed, .sg-check .is-reported").length - a.querySelectorAll(".sg-check .is-confirmed, .sg-check .is-reported").length || ORDER.recent(a, b); },
    upcoming: function (a, b) { var x = function (c) { var u = c.getAttribute("data-up"), d = c.getAttribute("data-due"); return dayKey(u && dayKey(u) > dayKey(iso(today)) ? u : d); }; return x(a).localeCompare(x(b)); }
  };
  ORDER.saved = ORDER.recent;
  function apply(s) {
    var sv = saved(), shown = cards.filter(function (c) { var ok = match(c, s, sv); c.hidden = !ok; return ok; });
    shown.sort(ORDER[s.view]).forEach(function (c) { list.appendChild(c); });
    cards.filter(function (c) { return c.hidden; }).forEach(function (c) { list.appendChild(c); });
    empty.hidden = shown.length > 0;
    var active = FIELDS.filter(function (f) { return s[f]; }).length, more = FIELDS.filter(function (f) { return f !== "q" && s[f]; }).length;
    var nf = form.querySelector(".sg-nf"), det = form.querySelector(".sg-more-f");
    if (nf) nf.textContent = more ? "(" + more + " on)" : ""; if (det && more && !det.open) det.open = true;
    status.textContent = (moreUrl && !needsAll(s) ? "The " + shown.length + " newest of " + total + " records shown" : shown.length + " of " + total + " records shown") + (s.view !== "recent" ? ", " + form.querySelector('[data-view="' + s.view + '"]').textContent.toLowerCase() : "") + (active ? ", with " + active + " filter" + (active > 1 ? "s" : "") : "") + ".";
    cards.forEach(function (c) { var b = c.querySelector(".sg-save"); if (b) { var on = sv.indexOf(c.id) > -1; b.setAttribute("aria-pressed", String(on)); b.textContent = on ? "Saved" : "Save"; } });
    return shown;
  }
  var needsAll = function (s) { return s.view !== "recent" || FIELDS.some(function (f) { return s[f]; }); };
  function go(push, view) { var s = fromForm(view); write(s, push); toForm(s); if (needsAll(s)) loadAll(function () { apply(s); }); else apply(s); }
  var t;
  form.addEventListener("input", function (ev) { clearTimeout(t); t = setTimeout(function () { go(false); }, ev.target.type === "search" ? 200 : 0); });
  form.addEventListener("change", function () { go(false); });
  form.addEventListener("click", function (ev) {
    var v = ev.target.closest("[data-view]"), a = ev.target.closest("[data-act]");
    if (v) { go(true, v.getAttribute("data-view")); return; }
    if (!a) return;
    var act = a.getAttribute("data-act");
    if (act === "reset") { form.reset(); go(true, "recent"); }
    if (act === "share") copy(location.href, a);
    if (act === "print") loadAll(function () { apply(read()); briefing(); });
    if (act === "download") loadAll(function () { apply(read()); download(); });
    if (act === "clear-saved") { setSaved([]); apply(read()); status.textContent = "Saved records forgotten in this browser."; }
  });
  empty.addEventListener("click", function (ev) { if (ev.target.closest("[data-act=reset]")) { form.reset(); go(true, "recent"); } });
  window.addEventListener("popstate", function () { var s = read(); toForm(s); if (needsAll(s)) loadAll(function () { apply(s); }); else apply(s); });
  list.addEventListener("click", function (ev) {
    var b = ev.target.closest(".sg-save"), c = ev.target.closest(".sg-copy");
    if (b) { var id = b.getAttribute("data-save"), a = saved(), i = a.indexOf(id); if (i > -1) a.splice(i, 1); else a.push(id);
      if (!setSaved(a)) { status.textContent = "This browser is not letting the page save anything."; return; } apply(read()); }
    if (c) copy(location.origin + location.pathname + "#" + c.getAttribute("data-copy"), c);
  });
  function copy(text, btn) {
    var done = function () { var old = btn.textContent; btn.textContent = "Link copied"; setTimeout(function () { btn.textContent = old; }, 1600); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () { window.prompt("Copy this link:", text); });
    else window.prompt("Copy this link:", text);
  }
  function visible() { return cards.filter(function (c) { return !c.hidden; }); }
  // printing (from the button or the browser's own menu) opens the evidence of every record shown, then folds it back
  var opened = [];
  function expand() { visible().forEach(function (c) { [].forEach.call(c.querySelectorAll("details"), function (d) { if (!d.open) { d.open = true; opened.push(d); } }); }); document.documentElement.classList.add("sg-printing"); }
  function fold() { opened.forEach(function (d) { d.open = false; }); opened = []; document.documentElement.classList.remove("sg-printing"); }
  window.addEventListener("beforeprint", expand); window.addEventListener("afterprint", fold);
  function briefing() { expand(); window.print(); setTimeout(fold, 1000); }
  var txt = function (el) { return el ? el.textContent.replace(/\s+/g, " ").trim() : ""; };
  function download() {
    var s = read(), L = ["# Signals briefing, Common Shade", "", "Prepared " + iso(today) + " from " + location.href, "",
      "What this is: records from beattheheat.asia/signals/ matching the view below. A selection of developments the site has checked, not a census. Evidence states: checked against an original source; reported by secondary sources (original not checked); not verified. Missing evidence means not verified, not failed.", "",
      "View: " + s.view + (FIELDS.filter(function (f) { return s[f]; }).length ? "; filters: " + FIELDS.filter(function (f) { return s[f]; }).map(function (f) { return f + "=" + s[f]; }).join(", ") : "") , ""];
    visible().forEach(function (c) {
      L.push("## " + txt(c.querySelector(".sg-h")), "", [].map.call(c.querySelector(".sg-meta").children, txt).join(" · ") + ". " + txt(c.querySelector(".sg-who")), "", txt(c.querySelector(".sg-sum")), "");
      var r = c.querySelector(".sg-rlv"); if (r) L.push(txt(r), "");
      var u = c.querySelector(".sg-up"); if (u) L.push(txt(u), "");
      [].forEach.call(c.querySelectorAll(".sg-del"), function (d) { L.push("### " + txt(d.querySelector(".sg-del__what"))); [].forEach.call(d.querySelectorAll(".sg-check li"), function (li) { L.push("- " + txt(li.querySelector(".sg-check__l")).replace(/^\S+\s/, "") + ": " + txt(li.querySelector(".sg-check__t"))); }); var g = d.querySelector(".sg-gaps"); if (g) L.push("- " + txt(g)); L.push(""); });
      [].forEach.call(c.querySelectorAll(".sg-unk li"), function (li) { L.push("- Not known yet: " + txt(li)); });
      [].forEach.call(c.querySelectorAll(".sg-next"), function (n) { L.push(txt(n).replace(/^What would change this record/, "What would change this record: ").replace(/^What to watch/, "What to watch: ")); });
      L.push("", txt(c.querySelector(".sg-review")).replace(/What a review covers$/, "").replace(/^Review/, "Review: "), "", "Sources:");
      var seen = {}; [].forEach.call(c.querySelectorAll(".sg-ev__src a"), function (a) { if (!seen[a.href]) { seen[a.href] = 1; L.push("- " + txt(a).replace(/ \(opens in a new tab\)$/, "") + ": " + a.href); } });
      L.push("", "Record: " + location.origin + location.pathname + "#" + c.id, "");
    });
    var blob = new Blob([L.join("\n")], { type: "text/markdown;charset=utf-8" }), a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "common-shade-signals-" + iso(today) + ".md"; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    status.textContent = "Downloaded " + visible().length + " records as text.";
  }
  var start = read(); toForm(start); if (needsAll(start)) loadAll(function () { apply(start); }); else apply(start);
  // a link to a record or milestone opens its record, even if filters would hide it
  function reveal() {
    var id = decodeURIComponent(location.hash.slice(1)); if (!id) return;
    var el = document.getElementById(id);
    if (!el || (moreUrl && el.closest("#sg-older"))) { if (moreUrl) loadAll(function () { apply(read()); var t = document.getElementById(id); if (t && !t.closest("#sg-older")) reveal(); }); return; }
    var card = el.closest(".sg-card"); if (card && card.hidden) { form.reset(); go(false, "recent"); }
    var det = el.closest("details"); if (det) det.open = true;
    // the closed COP31 watch is folded: a link to it (the cards' "COP31 watch" tag, older links) opens the fold
    if (id === "cop31") { var fold = document.getElementById("cop31-fold"); if (fold) fold.open = true; }
    if (el !== card) { var r = card && card.querySelector(".sg-rec"); if (r) r.open = true; }
    el.scrollIntoView();
    // cards above render lazily (content-visibility) and can change height: settle on the target once they have
    setTimeout(function () { el.scrollIntoView(); }, 350);
  }
  window.addEventListener("hashchange", reveal); reveal();
})();
