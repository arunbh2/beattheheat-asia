// Common Shade: the "Documented health and equity provisions" section of the India heat action plan archive.
// Reads data/site/hap-equity-review.json (written by research/2026-11/health-equity/hap-review.js). Shows what a
// defined set of plans documents, never how a city performs; no score, no ranking. Called by build-hap-archive.js.
"use strict";
const fs = require("fs"), path = require("path");
const R = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "site", "hap-equity-review.json"), "utf8"));
const ST = { explicit: "Explicit provision found", partial: "Partial provision or general mention", notfound: "Not found in reviewed material", notassessed: "Not assessed", unreadable: "Document unreadable" };
const SHORT = { explicit: "Explicit", partial: "Partial or mention", notfound: "Not found", notassessed: "Not assessed", unreadable: "Unreadable" };
module.exports = function section(esc) {
  const P = R.plans, D = R.dims;
  const ext = (u, t) => `<a href="${esc(u)}" target="_blank" rel="noopener">${t}<span class="visually-hidden"> (opens in a new tab)</span></a>`;
  const head = `<tr><th scope="col">Dimension</th>${P.map(p => `<th scope="col" data-plan="${esc(p.id)}">${esc(p.city)}<small>${esc(p.level === "city" ? "city plan" : "state plan")}, ${esc(p.year)}</small></th>`).join("")}</tr>`;
  const rows = D.map(d => `<tr data-dim="${d.id}"><th scope="row">${esc(d.label)}</th>${P.map(p => { const x = p.dims[d.id]; return `<td data-plan="${esc(p.id)}" data-st="${x.status}" class="hr-st hr-st--${x.status}">${SHORT[x.status]}${x.excerptPage ? `<small>p. ${x.excerptPage}</small>` : ""}</td>`; }).join("")}</tr>`).join("");
  const flags = x => x.mention ? `<span class="hr-flags">${[["mention", "Mention"], ["action", "Concrete action"], ["body", "Named responsible body"], ["resource", "Resources"], ["monitoring", "Monitoring"]].map(([k, l]) => `<span class="hr-flag${x[k] ? " is-on" : ""}">${x[k] ? "✓" : "–"} ${l}</span>`).join("")}</span>` : "";
  const plans = P.map(p => `<details class="hr-plan" id="review-${esc(p.id)}"><summary><b>${esc(p.city)}: ${esc(p.title)}</b> <span>${esc(p.year)} · ${esc(p.jurisdiction)}</span></summary>
      <p class="hr-meta">${p.url ? ext(p.url, "The document as published") : ""} · ${p.pages} pages · file fingerprint (SHA-256) ${esc((p.sha256 || "").slice(0, 16))}… · <a href="/${esc(p.file)}">text reviewed</a> · reviewed ${esc(R.reviewed)} · automated first pass, not yet checked by a person</p>
      <p class="hr-meta"><b>Limits:</b> ${esc(p.limits)}</p>
      <ul class="hr-dims">${D.map(d => { const x = p.dims[d.id]; return `<li><b>${esc(d.label)}:</b> <span class="hr-st hr-st--${x.status}">${ST[x.status]}</span>${x.why ? ` <span class="hr-meta">${esc(x.why)}</span>` : ""}${flags(x)}${x.excerpt ? `<q>${esc(x.excerpt)}</q> <span class="hr-meta">page ${x.excerptPage}${x.pages && x.pages.length > 1 ? `; also mentioned on pages ${x.pages.filter(n => n !== x.excerptPage).slice(0, 6).join(", ")}` : ""}</span>` : ""}</li>`; }).join("")}</ul></details>`).join("");
  return `<section class="hap-band" id="provisions" aria-labelledby="prov-h"><div class="container hap-sec">
      <h2 id="prov-h" class="hap-h2">Documented health and equity provisions</h2>
      <p class="hap-p">What a defined set of plans <em>says</em> about pregnancy and newborns, children and older people, disability, informal and home-based workers, water and toilets, earnings and rest, care, reporting, surveillance, participation, responsibility, money and monitoring. It describes the documents, not what any city or state does, and it is not a legal compliance finding. There is no score and no ranking.</p>
      <p class="hap-p"><b>Coverage:</b> ${P.length} of ${R.archive.total} documents in the archive, chosen by one rule: ${esc(R.selection.charAt(0).toLowerCase() + R.selection.slice(1))} ${R.none.map(n => `${esc(n.city)}: ${esc(n.why.toLowerCase())}.`).join(" ")} Every other document is <b>Not assessed</b>.</p>
      <div class="cs-note cs-note--watch"><p class="cs-note__label">A first pass, by script</p><p>Each finding comes from a keyword search of the document’s extracted text, with the passage and page shown so you can judge it. <b>Explicit</b> means one paragraph names the issue, a concrete action and a responsible body; <b>Partial or mention</b> means the issue is named without all three; <b>Not found</b> means the reviewed text did not contain it, which says nothing about practice or other documents. A plan that cites national guidance is not credited with that guidance’s provisions. Nobody has checked these by hand yet. <a href="/corrections/">Tell us if a finding is wrong</a>.</p></div>
      <form class="hr-filter" data-hr hidden onsubmit="return false">
        <label><span>Dimension</span><select data-hr-dim><option value="">All dimensions</option>${D.map(d => `<option value="${d.id}">${esc(d.label)}</option>`).join("")}</select></label>
        <label><span>Status</span><select data-hr-st><option value="">Any status</option>${Object.entries(SHORT).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select></label>
        <fieldset><legend>Compare up to three plans</legend>${P.map(p => `<label><input type="checkbox" data-hr-plan="${esc(p.id)}"> ${esc(p.city)}</label>`).join("")}</fieldset>
        <button type="button" data-hr-reset>Show everything</button>
        <p class="hr-count" role="status" aria-live="polite" data-hr-count></p>
      </form>
      <div class="hr-wrap" role="region" aria-label="Provisions by plan, scrollable" tabindex="0"><table class="hr-table"><caption>Documented provisions by plan (first pass, by script). Page numbers point to the passage shown in each plan’s details below.</caption><thead>${head}</thead><tbody>${rows}</tbody></table></div>
      <h3 class="hap-h3">Each plan, with its passages</h3>
      ${plans}
      <p class="hap-p">The same records as data: <a href="/data/site/hap-equity-review.json">hap-equity-review.json</a>. Method and code: <code>research/2026-11/health-equity/hap-review.js</code>. To correct a finding, an editor checks the page, edits the reviewed status in that file with a note, and records it on <a href="/corrections/">Corrections</a>; a new edition of a plan gets its own review, never a copy of the old one.</p>
    </div></section>
    <script>(function(){var f=document.querySelector("[data-hr]");if(!f)return;f.hidden=false;var dim=f.querySelector("[data-hr-dim]"),st=f.querySelector("[data-hr-st]"),cnt=f.querySelector("[data-hr-count]"),boxes=[].slice.call(f.querySelectorAll("[data-hr-plan]"));
    function run(){var picked=boxes.filter(function(b){return b.checked}).map(function(b){return b.getAttribute("data-hr-plan")});if(picked.length>3){boxes.forEach(function(b){if(b.checked&&picked.indexOf(b.getAttribute("data-hr-plan"))>2)b.checked=false});picked=picked.slice(0,3)}
    [].forEach.call(document.querySelectorAll(".hr-table [data-plan]"),function(c){c.hidden=picked.length>0&&picked.indexOf(c.getAttribute("data-plan"))<0});var n=0;
    [].forEach.call(document.querySelectorAll(".hr-table tbody tr"),function(r){var ok=!dim.value||r.getAttribute("data-dim")===dim.value;if(ok&&st.value){ok=[].some.call(r.querySelectorAll("td"),function(c){return !c.hidden&&c.getAttribute("data-st")===st.value})}r.hidden=!ok;if(ok)n++});
    [].forEach.call(document.querySelectorAll(".hr-table td"),function(c){c.classList.toggle("is-match",!!st.value&&c.getAttribute("data-st")===st.value)});
    cnt.textContent=n+" of ${D.length} dimensions shown"+(picked.length?", comparing "+picked.length+" plan"+(picked.length>1?"s":""):"")}
    [dim,st].forEach(function(e){e.addEventListener("change",run)});boxes.forEach(function(b){b.addEventListener("change",run)});f.querySelector("[data-hr-reset]").addEventListener("click",function(){dim.value="";st.value="";boxes.forEach(function(b){b.checked=false});run()});run()})();</script>`;
};
