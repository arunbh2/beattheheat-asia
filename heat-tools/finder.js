/* Heat Tool Finder: filters, comparison and shortlist exports on /heat-tools/. The page already lists every resource
   without this script; this only narrows, compares and exports. State lives in the address (shareable, and back and
   forward restore it), never on a server. Logic and words come from finder-core.js, shared with the build and its check. */
(function () {
  "use strict";
  const H = window.HTCore, DATA = window.HT;
  if (!H || !DATA) return;
  const R = DATA.records, IDS = R.map(r => r.id), BY = Object.fromEntries(R.map(r => [r.id, r])), SRC = Object.fromEntries(DATA.sources.map(s => [s.id, s]));
  const $ = s => document.querySelector(s), form = $("#ht-form"), results = $("#ht-results"), count = $("#ht-count"), chipsEl = $("#ht-chips"), bar = $("#ht-bar"), cmpSec = $("#compare"), cmp = $("#ht-compare");
  const esc = H.esc, track = n => { if (window.HTTrack) window.HTTrack(n); };
  let S = H.parseState(location.search, IDS);
  const E = n => form.elements[n];
  const FACETS = Object.keys(H.FACETS);

  // ---- the form mirrors the state ----
  function toForm() {
    form.querySelectorAll("input[type=checkbox]").forEach(i => { i.checked = FACETS.includes(i.name) ? S[i.name].includes(i.value) : !!S[i.name]; });
    E("country").value = S.country; E("q").value = S.q; E("type").value = S.type[0] || "";
    if (FACETS.some(k => !["decision", "type"].includes(k) && S[k].length) || S.noreg || S.caution) $("#ht-more").open = true;
  }
  function fromForm() {
    const s = H.emptyState();
    FACETS.forEach(k => { if (k !== "type") s[k] = [...form.querySelectorAll(`input[name=${k}]:checked`)].map(i => i.value); });
    s.type = E("type").value ? [E("type").value] : [];
    s.country = E("country").value; s.q = E("q").value.trim().slice(0, 80);
    s.noreg = E("noreg").checked; s.unverified = E("unverified").checked; s.caution = E("caution").checked;
    s.compare = S.compare.slice();
    return H.parseState(H.toQuery(s), IDS);   // one round trip through the URL rules, so the form can never hold a state the URL cannot
  }
  function commit(push) {
    const url = location.pathname + H.toQuery(S) + (location.hash || "");
    if (url !== location.pathname + location.search + location.hash) history[push ? "pushState" : "replaceState"](null, "", url);
  }

  // ---- results ----
  const plural = (n, a, b) => `${n} ${n === 1 ? a : b}`;
  function draw(announce) {
    const res = H.filter(R, S);
    let html = H.groupsHTML(res, { js: true, selected: S.compare });
    const noLocal = S.country && !R.some(r => r.geography.scope === "country_specific" && r.geography.country_codes.includes(S.country));
    if (noLocal && res.count) html = `<p class="ht-gap">This catalogue has no country-specific warning service or assessment for ${esc(H.COUNTRY[S.country])} yet. The national meteorological service remains the source for official warnings. The broader resources below cover the country but are not validated there.</p>` + html;
    if (!res.count) html = empty();
    results.innerHTML = html;
    const words = res.count ? `${plural(res.external, "outside resource", "outside resources")} and ${plural(res.internal, "Common Shade page", "Common Shade pages")} match, in groups by how they apply.` : "Nothing matches every filter you chose.";
    if (announce !== false) count.textContent = words;
    chipsEl.innerHTML = H.chips(S).map(([k, v, w]) => `<li><button type="button" class="ht-chip" data-k="${esc(k)}" data-v="${esc(v)}">${esc(w)} <span aria-hidden="true">×</span><span class="visually-hidden">: remove this filter</span></button></li>`).join("")
      + (H.chips(S).length ? `<li><button type="button" class="ht-chip ht-chip--all" data-k="*">Clear all filters</button></li>` : "");
    drawCompare();
  }
  // an empty result says which filters narrowed it and what removing each would show; nothing is loosened by itself
  function empty() {
    const tries = H.chips(S).map(([k, v, w]) => { const t = without(k, v); return [w, H.filter(R, t).count, k, v]; }).filter(x => x[1] > 0);
    return `<div class="ht-empty"><p><b>No resource matches every filter you chose.</b> The catalogue is a starter list, so a gap here describes the catalogue, not the field.</p>
      ${tries.length ? `<p>Removing one filter would show:</p><ul>${tries.map(([w, n, k, v]) => `<li><button type="button" class="ht-chip" data-k="${esc(k)}" data-v="${esc(v)}">Remove "${esc(w)}"</button> ${plural(n, "resource", "resources")}</li>`).join("")}</ul>` : ""}
      <p><button type="button" class="ht-btn" data-k="*">Clear all filters</button></p></div>`;
  }
  function without(k, v) {
    const t = JSON.parse(JSON.stringify(S));
    if (FACETS.includes(k)) t[k] = t[k].filter(x => x !== v); else if (k === "country" || k === "q") t[k] = ""; else t[k] = false;
    if (k === "noreg") t.unverified = false;
    return t;
  }

  // ---- comparison and shortlist ----
  const msg = t => { const m = $("#ht-cmp-msg"); if (m) { m.textContent = ""; setTimeout(() => { m.textContent = t; }, 30); } };
  function drawBar() {
    const n = S.compare.length;
    bar.innerHTML = n ? `<div class="container ht-bar__in"><p class="ht-bar__t"><b>Shortlist ${n} of 3</b> ${S.compare.map(id => `<button type="button" class="ht-chip" data-rm="${esc(id)}">${esc(BY[id].name)} <span aria-hidden="true">×</span><span class="visually-hidden">: remove from the shortlist</span></button>`).join("")}</p>
      <p class="ht-bar__acts">${n >= 2 ? `<a class="ht-btn" href="#compare" data-go="1">Compare ${n}</a>` : `<span class="ht-small">Choose one more to compare.</span>`} <button type="button" class="ht-btn ht-btn--quiet" data-clear="1">Clear</button></p>
      <p class="visually-hidden" id="ht-cmp-msg" role="status" aria-live="polite"></p></div>` : `<p class="visually-hidden" id="ht-cmp-msg" role="status" aria-live="polite"></p>`;
    bar.hidden = false; bar.classList.toggle("is-empty", !n);
    document.documentElement.style.scrollPaddingBottom = n ? (bar.offsetHeight + 16) + "px" : "";
    document.body.style.paddingBottom = n ? bar.offsetHeight + "px" : "";
  }
  function drawCompare() {
    drawBar();
    const sel = S.compare.map(id => BY[id]);
    cmpSec.hidden = sel.length < 2;
    if (sel.length < 2) { cmp.innerHTML = ""; return; }
    const kinds = new Set(sel.map(r => H.typeGroup(r.resource_type)));
    const rows = sel.map(r => H.rows(r));
    const head = `<p class="ht-p">Side by side, with no overall winner: each resource answers a different part of a decision, and unlike measures are never blended.${kinds.size > 1 ? " These are different kinds of resource. A warning service, an assessment and a planning workbook can work together rather than compete." : ""}</p>`;
    const table = `<div class="ht-table-wrap" tabindex="0" role="region" aria-label="Comparison table"><table class="ht-table"><caption class="visually-hidden">Comparison of ${sel.length} resources</caption>
      <thead><tr><th scope="col">Row</th>${sel.map(r => `<th scope="col"><a href="/heat-tools/${esc(r.id)}/">${esc(r.name)}</a><span class="ht-small">${esc(r.provider)}</span></th>`).join("")}</tr></thead>
      <tbody>${H.ROWS.map((label, i) => `<tr${i === 8 ? ' class="is-limit"' : ""}><th scope="row">${esc(label)}</th>${rows.map(rw => `<td>${esc(rw[i][1])}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    const stack = `<div class="ht-stack"><p class="ht-stack__jump">Jump to: ${sel.map(r => `<a href="#cmp-${esc(r.id)}">${esc(r.name)}</a>`).join(" · ")}</p>
      ${sel.map((r, k) => `<article class="ht-stack__card" id="cmp-${esc(r.id)}"><h3>${esc(r.name)}</h3><p class="ht-small">${esc(r.provider)} · ${k + 1} of ${sel.length}</p><dl class="ht-dl">${rows[k].map(([l, v], i) => `<div${i === 8 ? ' class="is-limit"' : ""}><dt>${esc(l)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
        ${k < sel.length - 1 ? `<p><a href="#cmp-${esc(sel[k + 1].id)}">Next: ${esc(sel[k + 1].name)}</a></p>` : ""}</article>`).join("")}</div>`;
    const print = `<div class="ht-print"><p>Common Shade Heat Tool Finder shortlist, printed ${new Date().toISOString().slice(0, 10)}. Inclusion is not endorsement or certification. Reviewed is not validated, and Common Shade has not run these tools.</p>
      ${sel.map(r => `<section><h3>${esc(r.name)} (${esc(r.id)})</h3><p>${esc(r.provider)}. Source / access information: ${esc(r.links.primary_url)}</p><p>Limits: ${esc(r.limitations.join(" "))}</p><p>${esc(H.REVIEW[r.evidence.review_depth])}, reviewed ${esc(r.evidence.reviewed_on)}.</p>
        <p>Sources: ${r.evidence.source_ids.map(i => SRC[i]).filter(Boolean).map(s => `${esc(s.title)} (${esc(s.publisher)}) ${esc(s.url)}, accessed ${esc(s.accessed_on)}`).join("; ")}</p></section>`).join("")}<p>Shortlist link: ${esc(location.origin + location.pathname + H.toQuery({ ...H.emptyState(), compare: S.compare }))}</p></div>`;
    const acts = `<p class="ht-cmp-acts"><button type="button" class="ht-btn" data-x="link">Copy shortlist link</button><button type="button" class="ht-btn ht-btn--quiet" data-x="print">Print shortlist</button>
      <button type="button" class="ht-btn ht-btn--quiet" data-x="json">Download JSON</button><button type="button" class="ht-btn ht-btn--quiet" data-x="csv">Download CSV</button><span class="ht-small" id="ht-x-msg" role="status" aria-live="polite"></span></p>`;
    cmp.innerHTML = head + table + stack + acts + print;
  }
  function toggleCompare(id, on, box) {
    if (on && !S.compare.includes(id)) {
      if (S.compare.length >= 3) { if (box) box.checked = false; msg("You can compare up to three. Remove one from the shortlist to add another."); return; }
      S.compare.push(id); msg(`${BY[id].name} added to the shortlist (${S.compare.length} of 3).`);
    } else if (!on) { S.compare = S.compare.filter(x => x !== id); msg(`${BY[id].name} removed from the shortlist.`); }
    commit(true);
    results.querySelectorAll("input[data-compare]").forEach(i => { i.checked = S.compare.includes(i.dataset.compare); });
    drawCompare();
  }
  const download = (name, type, text) => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); };
  function exportAs(kind) {
    const sel = S.compare.map(id => BY[id]), xm = $("#ht-x-msg"), say = t => { if (xm) xm.textContent = t; };
    const link = location.origin + location.pathname + H.toQuery({ ...H.emptyState(), compare: S.compare }) + "#compare";
    if (kind === "link") { (navigator.clipboard ? navigator.clipboard.writeText(link) : Promise.reject()).then(() => say("Link copied."), () => { window.prompt("Copy this link:", link); }); }
    if (kind === "print") window.print();
    if (kind === "json") download("heat-tool-shortlist.json", "application/json", JSON.stringify({ exported_on: new Date().toISOString().slice(0, 10), note: "Common Shade Heat Tool Finder shortlist. Inclusion is not endorsement or certification; reviewed is not validated, and Common Shade has not run these tools.", link, records: sel, sources: [...new Set(sel.flatMap(r => r.evidence.source_ids))].map(i => SRC[i]).filter(Boolean) }, null, 2));
    if (kind === "csv") download("heat-tool-shortlist.csv", "text/csv;charset=utf-8", "﻿" + H.csv(sel, SRC));
    if (kind !== "link") say(kind === "print" ? "" : "Download started.");
    track("shortlist_export");
  }

  // ---- events ----
  let typing;
  form.addEventListener("change", e => { if (e.target.name === "q") return; S = fromForm(); commit(true); draw(); });
  form.addEventListener("input", e => { if (e.target.name !== "q") return; clearTimeout(typing); typing = setTimeout(() => { S = fromForm(); commit(false); draw(); }, 350); });
  form.addEventListener("submit", e => { e.preventDefault(); S = fromForm(); commit(true); draw(); });
  $("#ht-more-done").addEventListener("click", () => { const d = $("#ht-more"); d.open = false; d.querySelector("summary").focus(); });
  document.addEventListener("click", e => {
    const t = e.target.closest("button, a"); if (!t) return;
    if (t.dataset.k) { const k = t.dataset.k; S = k === "*" ? Object.assign(H.emptyState(), { compare: S.compare }) : without(k, t.dataset.v); commit(true); toForm(); draw(); (chipsEl.querySelector("button") || E("q")).focus(); }
    else if (t.dataset.rm) toggleCompare(t.dataset.rm, false);
    else if (t.dataset.clear) { S.compare = []; commit(true); results.querySelectorAll("input[data-compare]").forEach(i => { i.checked = false; }); drawCompare(); msg("Shortlist cleared."); }
    else if (t.dataset.go) { e.preventDefault(); cmpSec.scrollIntoView({ block: "start" }); $("#ht-cmp-h").focus({ preventScroll: true }); track("comparison_open"); }
    else if (t.dataset.x) exportAs(t.dataset.x);
    else if (t.dataset.copy) { (navigator.clipboard ? navigator.clipboard.writeText(t.dataset.copy) : Promise.reject()).then(() => { t.textContent = "Link copied"; }, () => window.prompt("Copy this link:", t.dataset.copy)); }
  });
  results.addEventListener("change", e => { const b = e.target.closest("input[data-compare]"); if (b) toggleCompare(b.dataset.compare, b.checked, b); });
  window.addEventListener("popstate", () => { S = H.parseState(location.search, IDS); toForm(); draw(); });

  // ---- start ----
  form.hidden = false;
  document.querySelectorAll(".ht-copy").forEach(b => { b.hidden = false; });
  toForm(); draw();
  if (location.hash === "#compare" && S.compare.length >= 2) { setTimeout(() => { cmpSec.scrollIntoView(); $("#ht-cmp-h").focus({ preventScroll: true }); }, 50); track("comparison_open"); }
  if (/^#path-/.test(location.hash)) track("pathway_open");
})();
