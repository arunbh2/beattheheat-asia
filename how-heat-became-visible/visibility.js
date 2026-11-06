/* How heat became visible: filters for the timeline (built by tools/build-visibility.js). Every event is already in the
   page, so without this script the full list shows. Filters live in the address (?thread=labour&asia=1), so a filtered
   view can be shared; nothing is stored. */
(function () {
  "use strict";
  const box = document.querySelector("[data-hv-filters]"), list = document.querySelector("[data-hv-list]");
  if (!box || !list) return;
  const items = [...list.children], events = items.filter(li => !li.dataset.hw);
  const scope = box.querySelector("[data-hv-scope]"), grade = box.querySelector("[data-hv-grade]");
  const asia = box.querySelector("[data-hv-asia]"), hw = box.querySelector("[data-hv-hw]");
  const count = box.querySelector("[data-hv-count]"), empty = document.querySelector("[data-hv-empty]");
  const chips = [...box.querySelectorAll("[data-hv-thread]")];
  let thread = "all";

  function read() {
    const q = new URLSearchParams(location.search);
    thread = chips.some(c => c.dataset.hvThread === q.get("thread")) ? q.get("thread") : "all";
    if ([...scope.options].some(o => o.value === q.get("scope"))) scope.value = q.get("scope");
    if ([...grade.options].some(o => o.value === q.get("grade"))) grade.value = q.get("grade");
    asia.checked = q.get("asia") === "1"; hw.checked = q.get("heatwaves") !== "0";
  }
  function write() {
    const q = new URLSearchParams(location.search);
    const set = (k, v, off) => { if (v === off) q.delete(k); else q.set(k, v); };
    set("thread", thread, "all"); set("scope", scope.value, "all"); set("grade", grade.value, "all");
    set("asia", asia.checked ? "1" : "0", "0"); set("heatwaves", hw.checked ? "1" : "0", "1");
    const s = q.toString();
    try { history.replaceState(null, "", location.pathname + (s ? "?" + s : "") + location.hash); } catch (e) {}
  }
  function apply() {
    chips.forEach(c => c.setAttribute("aria-pressed", String(c.dataset.hvThread === thread)));
    let shown = 0;
    items.forEach(li => {
      const isHw = !!li.dataset.hw;
      const ok = isHw
        ? hw.checked && (thread === "all" || thread === "heatwave") && scope.value === "all" && grade.value === "all"
        : (thread === "all" || li.dataset.threads.split(" ").includes(thread)) && (scope.value === "all" || li.dataset.scope === scope.value)
          && (grade.value === "all" || li.dataset.grade === grade.value) && (!asia.checked || li.dataset.asia === "1");
      li.hidden = !ok; if (ok && !isHw) shown++;
    });
    const filtered = thread !== "all" || scope.value !== "all" || grade.value !== "all" || asia.checked;
    count.textContent = filtered ? `Showing ${shown} of ${events.length} events` : `All ${events.length} events`;
    empty.hidden = items.some(li => !li.hidden);
  }
  const change = () => { apply(); write(); };
  chips.forEach(c => c.addEventListener("click", () => { thread = c.dataset.hvThread; change(); }));
  [scope, grade, asia, hw].forEach(el => el.addEventListener("change", change));
  document.querySelector("[data-hv-reset]").addEventListener("click", () => { thread = "all"; scope.value = grade.value = "all"; asia.checked = false; hw.checked = true; change(); });
  // a link to one event shows it, whatever the filters say
  function showTarget() { const t = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1))); if (t && t.hidden) { thread = "all"; scope.value = grade.value = "all"; asia.checked = false; change(); } }
  read(); box.hidden = false; apply(); showTarget();
  window.addEventListener("hashchange", showTarget);
})();
