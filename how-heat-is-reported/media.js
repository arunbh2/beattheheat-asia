// Common Shade: How heat is reported. The explorer (filters with live counts, kept in the address), a comparison of up to
// three reviewed records, the question kit with a copyable, printable and downloadable brief, and record links.
// tools/build-media.js builds the page; without this script every record, example and comparison is on the page.
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var list = $("#hr-list"); if (!list) return;
  var form = $("#hr-find"), recs = $$(".hr-rec", list), TOTAL = recs.length, KEYS = ["q", "place", "language", "collection", "year", "format", "depth", "loop", "pop", "has"];
  var ATTR = { place: "place", language: "lang", collection: "coll", year: "year", format: "fmt", depth: "depth", loop: "loop", pop: "pop", has: "has" };
  var NAMES = { q: "Search", place: "Place", language: "Language", collection: "Collection", year: "Year", format: "Format", depth: "Depth of review", loop: "Cycle", pop: "Population", has: "Review found" };
  var ctl = {}; KEYS.forEach(function (k) { ctl[k] = form.querySelector('[data-f="' + k + '"]'); });
  var history_ = [], said = $(".hr-said", form);
  var say = function (el, t) { if (!el) return; el.textContent = t; setTimeout(function () { el.textContent = ""; }, 4000); };
  var copy = function (text, el, ok) {
    var done = function () { say(el, ok); }, fail = function () { say(el, "Copying is not available here; select the text and copy it."); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fail);
    else { var t = document.createElement("textarea"); t.value = text; t.style.position = "fixed"; t.style.opacity = "0"; document.body.appendChild(t); t.select(); try { document.execCommand("copy") ? done() : fail(); } catch (e) { fail(); } document.body.removeChild(t); }
  };
  var vals = function (li, k) { return (li.getAttribute("data-" + ATTR[k]) || "").split("|"); };
  var match = function (li, st, skip) {
    for (var i = 0; i < KEYS.length; i++) { var k = KEYS[i], v = st[k]; if (!v || k === skip) continue;
      if (k === "q") { var words = v.toLowerCase().split(/\s+/).filter(Boolean), hay = li._q || (li._q = (li.textContent + " " + li.id.slice(4)).toLowerCase()); for (var j = 0; j < words.length; j++) if (hay.indexOf(words[j]) < 0) return false; }
      else if (vals(li, k).indexOf(v) < 0) return false; }
    return true;
  };
  var read = function () { var st = {}; KEYS.forEach(function (k) { st[k] = ctl[k].value.trim(); }); return st; };
  var fromUrl = function () { var p = new URLSearchParams(location.search), st = {}; KEYS.forEach(function (k) { st[k] = p.get(k) || ""; }); st.cmp = (p.get("cmp") || "").split(",").filter(Boolean); st.kit = p.get("kit") || ""; return st; };
  var write = function (st, push) {
    var p = new URLSearchParams(location.search);
    KEYS.forEach(function (k) { if (st[k]) p.set(k, st[k]); else p.delete(k); });
    var u = location.pathname + (p.toString() ? "?" + p.toString() : "") + location.hash;
    if (u !== location.pathname + location.search + location.hash) history[push ? "pushState" : "replaceState"](null, "", u);
  };
  var label = function (k, v) { if (k === "q") return "“" + v + "”"; var o = ctl[k].querySelector('option[value="' + CSS.escape(v) + '"]'); return o ? o.getAttribute("data-label") : v; };
  // twenty at a time, so the page stays short on a phone; the count always covers every match
  var PAGE = 20, limit = PAGE, pager = $("#hr-pager"), more = $("[data-hr-more]");
  var apply = function (st, keep) {
    var n = 0, pubs = 0; if (!keep) limit = PAGE;
    recs.forEach(function (li) { var ok = match(li, st); if (ok) { n++; pubs += st.collection ? 1 : vals(li, "collection").length; } li.hidden = !ok || n > limit; });
    pager.hidden = n <= limit; more.textContent = "Show " + Math.min(PAGE, n - limit) + " more (" + (n - Math.min(n, limit)) + " not yet shown)";
    // live counts: each option shows how many records it would give with the other filters as they are
    KEYS.forEach(function (k) { if (k === "q") return; $$("option", ctl[k]).forEach(function (o) { if (!o.value) return;
      var c = 0; recs.forEach(function (li) { if (match(li, st, k) && vals(li, k).indexOf(o.value) > -1) c++; });
      o.textContent = o.getAttribute("data-label") + " (" + c + ")"; }); });
    var active = KEYS.filter(function (k) { return st[k]; }), mf = $(".hr-moref", form);
    if (mf && ["year", "format", "depth", "loop", "pop", "has"].some(function (k) { return st[k]; })) mf.open = true;
    $("#hr-count").textContent = active.length ? "Showing " + n + " of " + TOTAL + " unique records (" + pubs + " publication " + (pubs === 1 ? "record" : "records") + ")" : TOTAL + " unique records, newest first";
    var chips = $("#hr-chips"); chips.innerHTML = "";
    active.forEach(function (k) { var b = document.createElement("button"); b.type = "button"; b.className = "hr-chip"; b.setAttribute("aria-label", "Remove filter " + NAMES[k] + ": " + label(k, st[k]));
      b.innerHTML = '<span></span><span aria-hidden="true">×</span>'; b.firstChild.textContent = NAMES[k] + ": " + label(k, st[k]);
      b.addEventListener("click", function () { ctl[k].value = ""; change(true); ctl[k].focus(); }); chips.appendChild(b); });
    $("#hr-empty").hidden = n > 0;
  };
  var change = function (push) { var st = read(); history_.push(st); write(st, push); apply(st); };
  var setForm = function (st) { KEYS.forEach(function (k) { ctl[k].value = st[k] || ""; if (st[k] && ctl[k].value !== st[k]) ctl[k].value = ""; }); };
  form.hidden = false;
  more.addEventListener("click", function () { var first = recs.filter(function (li) { return li.hidden && match(li, read()); })[0]; limit += PAGE; apply(read(), true); if (first) { first.setAttribute("tabindex", "-1"); first.focus(); } });
  KEYS.forEach(function (k) { ctl[k].addEventListener(k === "q" ? "input" : "change", function () { change(k !== "q"); }); });
  form.addEventListener("submit", function (e) { e.preventDefault(); });
  $$("[data-hr-reset]").forEach(function (b) { b.addEventListener("click", function () { setForm({}); change(true); ctl.q.focus(); }); });
  $("[data-hr-undo]").addEventListener("click", function () { var st = read(), last = KEYS.filter(function (k) { return st[k]; }).pop(); if (last) { ctl[last].value = ""; change(true); } });
  $("[data-hr-share]").addEventListener("click", function () { copy(location.href.split("#")[0] + "#explore", said, "Link to this view copied."); });
  // the shown records as CSV, from the published file, so the download and the page never disagree
  $("[data-hr-csv]").addEventListener("click", function () {
    var ids = {}, st = read(); recs.forEach(function (li) { if (match(li, st)) ids[li.getAttribute("data-id")] = 1; });
    fetch("/how-heat-is-reported/records.csv").then(function (r) { if (!r.ok) throw 0; return r.text(); }).then(function (t) {
      var rows = [], row = [], f = "", q = false, raw = "", out = [];
      for (var i = 0; i < t.length; i++) { var c = t[i]; raw += c;
        if (q) { if (c === '"' && t[i + 1] === '"') { f += '"'; raw += t[++i]; } else if (c === '"') q = false; else f += c; }
        else if (c === '"') q = true; else if (c === ",") { row.push(f); f = ""; } else if (c === "\n") { row.push(f); rows.push([row, raw]); row = []; f = ""; raw = ""; } else f += c; }
      rows.forEach(function (x, j) { if (j === 0 || ids[x[0][0]]) out.push(x[1]); });
      var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([out.join("")], { type: "text/csv" })); a.download = "how-heat-is-reported-filtered.csv"; document.body.appendChild(a); a.click(); a.remove();
      say(said, (out.length - 1) + " records downloaded.");
    }).catch(function () { say(said, "The download could not load; the full list is linked below."); });
  });
  window.addEventListener("popstate", function () { var st = fromUrl(); setForm(st); apply(st); drawCmp(st.cmp); if (st.kit) setKit(st.kit); });
  // record links copy a stable address; a link to a hidden record clears the filters so it shows
  $$("[data-hr-link]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); var id = a.getAttribute("href"); history.replaceState(null, "", location.pathname + location.search + id);
    copy(location.origin + location.pathname + id, a.closest(".hr-rec") ? said : said, "Link to this record copied."); a.textContent = "Link copied"; setTimeout(function () { a.textContent = "Link"; }, 2500); }); });
  var reveal = function () { var id = location.hash.slice(1); if (!/^rec-/.test(id)) return; var li = document.getElementById(id); if (!li) return;
    if (li.hidden && !match(li, read())) { setForm({}); change(false); }
    if (li.hidden) { limit = recs.indexOf(li) + PAGE; apply(read(), true); } var d = $("details", li); if (d) d.open = true; li.scrollIntoView(); li.focus && li.setAttribute("tabindex", "-1"); li.focus(); };
  window.addEventListener("hashchange", reveal);

  // ---- comparison of up to three reviewed records, from their own reporting trails ----
  var cmp = [], panel = $("#hr-cmp");
  var drawCmp = function (ids) {
    cmp = (ids || cmp).filter(function (id) { return document.getElementById("rec-" + id) && $("#rec-" + CSS.escape(id) + " .hr-trail"); }).slice(0, 3);
    $$("[data-hr-pick]").forEach(function (b) { var on = cmp.indexOf(b.getAttribute("data-hr-pick")) > -1; b.setAttribute("aria-pressed", on); b.textContent = on ? "In comparison (remove)" : "Add to comparison"; b.hidden = false; });
    var p = new URLSearchParams(location.search); if (cmp.length) p.set("cmp", cmp.join(",")); else p.delete("cmp");
    history.replaceState(null, "", location.pathname + (p.toString() ? "?" + p : "") + location.hash);
    if (!cmp.length) { panel.hidden = true; panel.innerHTML = ""; return; }
    var cols = cmp.map(function (id) { var li = document.getElementById("rec-" + id); return { id: id, li: li, t: $(".hr-rec__t", li).innerHTML, m: $(".hr-meta", li).textContent }; });
    var keys = $$(".hr-trail dl > div", cols[0].li).map(function (d) { return [d.getAttribute("data-k"), $("dt", d).textContent]; });
    var h = '<div class="hr-cmp__head"><h3>Comparing ' + cmp.length + (cmp.length === 1 ? " record" : " records") + '</h3><p class="hr-note">From each record’s reporting trail. A state describes what the review found in the text, never a failure. ' + (cmp.length < 2 ? "Add another record read in full to compare." : "") + '</p><p><button type="button" class="hr-btn" data-hr-cmpcopy>Copy a link to this comparison</button> <button type="button" class="hr-btn" data-hr-cmpclear>Clear the comparison</button> <span class="hr-said" role="status"></span></p></div>';
    h += '<div class="hr-ctable" role="table" aria-label="Comparison of selected records"><div class="hr-crow hr-crow--h" role="row"><span role="columnheader">What the review records</span>' + cols.map(function (c) { return '<span role="columnheader">' + c.t + '<br><small>' + c.m.replace(/</g, "&lt;") + "</small></span>"; }).join("") + "</div>";
    keys.forEach(function (k) { h += '<div class="hr-crow" role="row"><span role="rowheader">' + k[1] + "</span>" + cols.map(function (c) { var d = $('.hr-trail [data-k="' + k[0] + '"] dd', c.li); return '<span role="cell" data-label="' + $(".hr-meta", c.li).textContent.split(" · ")[0].replace(/"/g, "&quot;") + '">' + (d ? d.innerHTML : "") + "</span>"; }).join("") + "</div>"; });
    panel.innerHTML = h + "</div>"; panel.hidden = false;
    $("[data-hr-cmpclear]", panel).addEventListener("click", function () { drawCmp([]); });
    $("[data-hr-cmpcopy]", panel).addEventListener("click", function () { copy(location.href.split("#")[0] + "#hr-cmp", $(".hr-said", panel), "Link to this comparison copied."); });
  };
  $$("[data-hr-pick]").forEach(function (b) { b.addEventListener("click", function () { var id = b.getAttribute("data-hr-pick"), i = cmp.indexOf(id);
    if (i > -1) cmp.splice(i, 1); else { if (cmp.length >= 3) { say(said, "Up to three records at a time; remove one first."); return; } cmp.push(id); }
    drawCmp(cmp); if (i < 0) panel.scrollIntoView({ block: "nearest" }); }); });

  // ---- the question kit ----
  var kitForm = $("#hr-kit"), brief = $("#hr-brief"), KIT = JSON.parse($("#hr-kit-data").textContent);
  var kt = $("#kit-topic"), kp = $("#kit-place"), kpop = $("#kit-pop");
  var escH = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var today = new Date().toISOString().slice(0, 10), mdText = "";
  var drawKit = function (push) {
    var T = KIT.topics.filter(function (t) { return t.id === kt.value; })[0] || KIT.topics[0], P = KIT.populations[kpop.value] || KIT.populations.any, place = kp.value;
    var re = new RegExp(T.angle, "i"), q = T.q.replace("{place}", place || "the place you report on").replace("{pop}", P.text);
    var hits = recs.filter(function (li) {
      var loops = vals(li, "loop"), topic = T.loops.some(function (l) { return loops.indexOf(l) > -1; }) || re.test(li.getAttribute("data-angle") || "");
      var pl = !place || vals(li, "place").indexOf(place) > -1, pop = !P.match || (li.getAttribute("data-depth") === "full" && vals(li, "pop").indexOf(P.match) > -1);
      return topic && pl && pop; });
    var item = function (li) { return { id: li.getAttribute("data-id"), t: $(".hr-rec__t a", li), en: $(".hr-en span", li), m: $(".hr-meta", li).textContent }; };
    var H = hits.map(item), shown = H.slice(0, 8);
    var ul = function (a) { return "<ul>" + a.map(function (x) { return "<li>" + escH(x) + "</li>"; }).join("") + "</ul>"; };
    var html = '<div class="hr-brief__in"><p class="hr-k">Reporting brief · ' + escH(T.label) + (place ? " · " + escH(place) : "") + (P.match ? " · " + escH(P.label) : "") + "</p>" +
      '<h3>A suggested question <span class="hr-tag">A starting point, not a finding</span></h3><p class="hr-q">' + escH(q) + "</p>" +
      "<h4>Reporting already in these collections</h4>" + (H.length ? "<p>" + H.length + (H.length === 1 ? " record matches" : " records match") + " (pilot records by their coded cycles, curated ones by their listed story angle" + (P.match ? "; a population is coded only for pilot records" : "") + ")" + (H.length > 8 ? "; the first eight:" : ":") + "</p><ul>" + shown.map(function (x) { return '<li><a href="#rec-' + escH(x.id) + '">' + x.t.querySelector("span").innerHTML + "</a> <span class=\"hr-meta\">" + escH(x.m) + "</span></li>"; }).join("") + "</ul>" + (H.length > 8 ? '<p><a href="#explore" data-kit-all>See all ' + H.length + " in the explorer</a></p>" : "")
        : "<p>No record in these collections matches this combination. That describes the collections, not reporting in " + escH(place || "the region") + ".</p>") +
      "<h4>On Common Shade</h4><ul>" + T.links.map(function (l) { return '<li><a href="' + escH(l[0]) + '">' + escH(l[1]) + "</a></li>"; }).join("") + "</ul>" +
      "<h4>Kinds of public record to look for</h4>" + ul(T.seek) + "<h4>Perspectives that could inform it</h4>" + ul(T.voices) + "<h4>What to verify</h4>" + ul(T.verify) +
      '<p class="hr-note">These are kinds of record and perspective, not documents known to exist or people to contact. Built ' + today + " from Common Shade’s How heat is reported, " + location.origin + "/how-heat-is-reported/.</p>" +
      '<p class="hr-tools"><button type="button" class="hr-btn" data-kit-copy>Copy the brief</button><button type="button" class="hr-btn" data-kit-md>Download (.md)</button><button type="button" class="hr-btn" data-kit-print>Print the brief</button><button type="button" class="hr-btn" data-kit-link>Copy a link to it</button><span class="hr-said" role="status"></span></p></div>';
    brief.innerHTML = html;
    var li = function (a) { return a.map(function (x) { return "- " + x; }).join("\n"); };
    mdText = "# Reporting brief: " + T.label + (place ? ", " + place : "") + (P.match ? ", " + P.label : "") + "\n\nBuilt " + today + " from Common Shade, How heat is reported: " + location.origin + "/how-heat-is-reported/\n\n" +
      "## A suggested question (a starting point, not a finding)\n\n" + q + "\n\n## Reporting already in these collections\n\n" + (H.length ? H.map(function (x) { return "- " + x.t.textContent.replace(/\s*\(opens in a new tab\)\s*$/, "") + (x.en ? " (" + x.en.textContent + ")" : "") + ". " + x.m + ". " + x.t.getAttribute("href"); }).join("\n") : "None in these collections for this combination; that describes the collections, not reporting.") +
      "\n\n## On Common Shade\n\n" + T.links.map(function (l) { return "- " + l[1] + ": " + location.origin + l[0]; }).join("\n") + "\n\n## Kinds of public record to look for\n\n" + li(T.seek) + "\n\n## Perspectives that could inform it\n\n" + li(T.voices) + "\n\n## What to verify\n\n" + li(T.verify) +
      "\n\nThese are kinds of record and perspective, not documents known to exist or people to contact. The questions and kinds of record were reviewed by the site’s maintainer: suggestions, not findings. Pilot codes are provisional (coded once, without a second coding). CC BY 4.0, Common Shade.\n";
    var b = brief, s = $(".hr-said", b);
    $("[data-kit-copy]", b).addEventListener("click", function () { copy(mdText, s, "Brief copied, with its sources."); });
    $("[data-kit-link]", b).addEventListener("click", function () { copy(location.href.split("#")[0] + "#develop", s, "Link copied."); });
    $("[data-kit-md]", b).addEventListener("click", function () { var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([mdText], { type: "text/markdown" })); a.download = "reporting-brief-" + T.id + ".md"; document.body.appendChild(a); a.click(); a.remove(); });
    $("[data-kit-print]", b).addEventListener("click", function () { document.documentElement.classList.add("hr-print-brief"); window.print(); });
    var all = $("[data-kit-all]", b); if (all) all.addEventListener("click", function () { setForm({}); var loopSel = ctl.loop; if (place) ctl.place.value = place; if (T.loops.length === 1) loopSel.value = T.loops[0]; change(true); });
    var p = new URLSearchParams(location.search);
    if (push || p.get("kit")) { p.set("kit", [kt.value, kp.value, kpop.value].join("~")); history[push ? "pushState" : "replaceState"](null, "", location.pathname + "?" + p + location.hash); }
  };
  window.addEventListener("afterprint", function () { document.documentElement.classList.remove("hr-print-brief"); });
  var setKit = function (s) { var a = s.split("~"); kt.value = a[0] || kt.value; kp.value = a[1] || ""; kpop.value = a[2] || "any"; if (!kt.value) kt.selectedIndex = 0; drawKit(false); };
  if (kitForm) { kitForm.hidden = false; $("#hr-kitlist").hidden = true; [kt, kp, kpop].forEach(function (el) { el.addEventListener("change", function () { drawKit(true); }); }); }

  // ---- start from the address ----
  var st0 = fromUrl(); setForm(st0); apply(st0); if (st0.cmp.length) drawCmp(st0.cmp); else drawCmp([]);
  if (kitForm) { if (st0.kit) setKit(st0.kit); else drawKit(false); }
  if (location.hash) setTimeout(function () { reveal(); var t = document.getElementById(location.hash.slice(1)); if (t && !/^rec-/.test(location.hash.slice(1))) t.scrollIntoView(); }, 0);
})();
