/* Heat Tool Finder: engagement counts through the site's existing cookieless GoatCounter, and nothing else.
   Events are names only (tool_profile_open, comparison_open, shortlist_export, pathway_open, source_click,
   plan_click): never a search, a place or the contents of a shortlist. They are engagement proxies, not measured
   adoption or protection. Without the counter, everything still works. */
(function () {
  "use strict";
  const me = document.currentScript, GC = me && /^[a-z0-9-]+$/.test(me.dataset.gc || "") ? me.dataset.gc : "";
  if (GC && !document.querySelector("script[data-goatcounter]")) {
    const sc = document.createElement("script"); sc.async = true; sc.src = "https://gc.zgo.at/count.js";
    sc.dataset.goatcounter = `https://${GC}.goatcounter.com/count`; document.head.appendChild(sc);
  }
  const OK = ["tool_profile_open", "comparison_open", "shortlist_export", "pathway_open", "source_click", "plan_click"];
  const queue = [];
  const send = name => { try { if (window.goatcounter && window.goatcounter.count) { window.goatcounter.count({ path: "heat-tools-" + name, title: name, event: true }); return true; } } catch (e) {} return false; };
  window.HTTrack = name => { if (!GC || !OK.includes(name)) return; if (!send(name)) queue.push(name); };
  let tries = 0;   // a blocked counter gives up after a few tries instead of polling forever
  const flush = () => { while (queue.length && send(queue[0])) queue.shift(); if (queue.length && ++tries < 6) setTimeout(flush, 1500); };
  window.addEventListener("load", () => setTimeout(flush, 800));
  if (me && me.dataset.open === "1") window.HTTrack("tool_profile_open");
  document.addEventListener("click", e => { const a = e.target.closest && e.target.closest("[data-ev]"); if (a) window.HTTrack(a.dataset.ev); });
})();
