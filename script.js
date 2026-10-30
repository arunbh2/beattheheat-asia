/* ==========================================================
   Extreme heat is a wicked problem — map engine
   Plain JavaScript, no libraries. All content lives in data.js.
   ========================================================== */

(function () {
  "use strict";

  // visit counting (part 22 of data.js): GoatCounter, no cookies; nothing loads until a code is set
  const GC = typeof SITE_ANALYTICS !== "undefined" && /^[a-z0-9-]+$/.test(SITE_ANALYTICS.goatcounter || "") ? SITE_ANALYTICS.goatcounter : "";
  if (GC) { const sc = document.createElement("script"); sc.async = true; sc.src = "https://gc.zgo.at/count.js"; sc.dataset.goatcounter = `https://${GC}.goatcounter.com/count`; document.head.appendChild(sc); }
  // a few anonymous events show which tools get used: films watched, plans printed, cities checked
  // progressive disclosure on phones: whatever scrolls to, or links into, a collapsed section or list opens it first
  function reveal(el) {
    for (let n = el; n && n.classList; n = n.parentElement) {
      if (n.classList.contains("pd-more")) { const l = n.closest(".pd-list"); if (l) showAll(l); }
      if (n.classList.contains("pd-body")) openSection(n.closest("section"));
    }
  }
  const nativeScroll = Element.prototype.scrollIntoView;
  Element.prototype.scrollIntoView = function (...args) { reveal(this); return nativeScroll.apply(this, args); };
  document.addEventListener("click", ev => { const a = ev.target.closest && ev.target.closest('a[href^="#"]'); if (!a) return;
    const t = document.getElementById(decodeURIComponent(a.hash.slice(1))); if (t) reveal(t); }, true);
  function openSection(sec) {
    if (!sec || sec.classList.contains("pd-is-open")) return;
    sec.classList.add("pd-is-open");
    const b = sec.querySelector(".pd-open"); if (b) { b.setAttribute("aria-expanded", "true"); b.textContent = "Hide this section"; }
  }
  function showAll(list) {
    list.classList.add("is-all");
    const b = list.nextElementSibling; if (b && b.classList.contains("pd-all")) b.hidden = true;
  }
  const track = name => { try { if (GC && window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: name, title: name, event: true }); } catch (e) {} };

  const SVGNS = "http://www.w3.org/2000/svg";
  const HUB_R = 150, DOMAIN_RING = 470, DOMAIN_R = 40, RIM = 1330;
  const LABEL_K = 0.9;               // zoom level at which every label is shown
  const COLORS = { hub: "#F26430", red: "#B8401A", ink: "#16202B" };

  // the plan has a page of its own (/plan/); there the map's parts are absent, so stand-ins keep the shared code running
  const PLAN_PAGE = document.body.dataset.page === "plan";
  // practical actions and paying for protection also have pages of their own (/practical/, /finance/), built the same way
  const SUB_PAGE = ["plan", "practical", "finance"].includes(document.body.dataset.page);
  const need = (id, tag) => document.getElementById(id) || (SUB_PAGE ? (tag === "svg" ? document.createElementNS("http://www.w3.org/2000/svg", "svg") : document.createElement(tag || "div")) : null);
  const svg = need("web", "svg");
  const stage = need("map-stage");
  const panel = need("panel");
  const panelBody = need("panel-body");
  const guide = need("guide");
  if (!svg || typeof SYSTEMS === "undefined") return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Site menu: "All sections" opens every section in three chapters; Escape, a click outside or choosing a section closes it.
  // Links in the bar and the menu mark the section on screen with aria-current.
  (function siteMenu() {
    const btn = document.getElementById("menu-btn"), panel = document.getElementById("site-menu");
    if (!btn || !panel) return;
    const setOpen = (open, refocus) => {
      panel.hidden = !open; btn.setAttribute("aria-expanded", String(open));
      if (open) { const cur = panel.querySelector("a[aria-current]") || panel.querySelector("a"); if (cur) cur.focus({ preventScroll: true }); }
      else if (refocus) btn.focus({ preventScroll: true });
    };
    btn.addEventListener("click", () => setOpen(panel.hidden, false));
    panel.addEventListener("click", ev => { if (ev.target.closest("a")) setOpen(false, false); });
    document.addEventListener("keydown", ev => { if (ev.key === "Escape" && !panel.hidden) { ev.stopImmediatePropagation(); setOpen(false, true); } }, true);
    document.addEventListener("click", ev => { if (!panel.hidden && !panel.contains(ev.target) && !btn.contains(ev.target)) setOpen(false, false); });
    panel.addEventListener("focusout", ev => { if (!panel.hidden && ev.relatedTarget && !panel.contains(ev.relatedTarget) && ev.relatedTarget !== btn) setOpen(false, false); });
    // the section whose top has passed 40% of the screen is "here"; above the first one, nothing is
    const links = [...document.querySelectorAll('.header-nav a[href^="#"], .site-menu a[href^="#"]')];
    const secs = [...new Set(links.map(a => a.getAttribute("href").slice(1)))].map(id => document.getElementById(id)).filter(Boolean);
    let current = null, queued = false;
    const update = () => {
      queued = false; const line = innerHeight * 0.4; let id = "";
      secs.forEach(el => { if (el.getBoundingClientRect().top <= line) id = el.id; });
      if (id === current) return; current = id;
      links.forEach(a => { if (id && a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current"); });
    };
    addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener("resize", update); update();
  })();

  // Background loops (title web, heatwave rooftops, cool roofs). They always play and loop; only the visitor's own
  // pause stops them, and that choice is remembered. Off screen or in a hidden tab they rest and resume by themselves.
  // If a browser refuses to autoplay (e.g. phone low power mode), they start at the visitor's first tap or key press.
  const ambient = [];
  function ambientLoop(videoId, btnId, key, noun) {
    const v = document.getElementById(videoId), btn = document.getElementById(btnId);
    if (!v || !btn) return;
    let stored = null; try { stored = localStorage.getItem(key); } catch (e) {}
    let paused = stored === "1", blocked = false, onScreen = false;
    v.muted = true; v.defaultMuted = true;
    const label = () => {
      const still = paused || blocked;
      btn.setAttribute("aria-pressed", String(still));
      btn.querySelector(".visually-hidden").textContent = (still ? "Play " : "Pause ") + noun;
    };
    const sync = () => {
      if (!paused && onScreen && !document.hidden) {
        if (v.preload !== "auto") v.preload = "auto";
        const p = v.play();
        if (p && p.then) p.then(() => { blocked = false; label(); }, () => { blocked = true; label(); });
      } else v.pause();
      label();
    };
    btn.hidden = false;
    btn.addEventListener("click", () => {
      if (blocked) { blocked = false; paused = false; } else paused = !paused;
      try { localStorage.setItem(key, paused ? "1" : "0"); } catch (e) {}
      sync();
    });
    v.addEventListener("playing", () => { blocked = false; label(); }); // the button always reflects what is really happening
    // if something other than the visitor pauses it, start it again
    v.addEventListener("pause", () => setTimeout(() => { if (v.paused && !paused && onScreen && !document.hidden) sync(); }, 400));
    // covers further down the page load only as the visitor approaches
    const cover = () => { if (v.dataset.poster && !v.poster) v.poster = v.dataset.poster; };
    if ("IntersectionObserver" in window) new IntersectionObserver(es => { onScreen = es[0].isIntersecting; if (onScreen) cover(); sync(); }, { rootMargin: "200px 0px" }).observe(v);
    else { onScreen = true; cover(); sync(); }
    label();
    ambient.push(() => { if (!paused && onScreen && v.paused) sync(); });
  }
  ["pointerdown", "keydown", "touchend"].forEach(t => document.addEventListener(t, () => ambient.forEach(f => f()), { passive: true }));
  document.addEventListener("visibilitychange", () => { if (!document.hidden) ambient.forEach(f => f()); });
  ambientLoop("intro-video", "intro-pause", "bth-hero-paused", "background animation");
  ambientLoop("day-video", "day-pause", "bth-day-paused", "background footage");
  ambientLoop("roofs-video", "roofs-pause", "bth-roofs-paused", "background footage");
  ambientLoop("dusk-video", "dusk-pause", "bth-dusk-paused", "background footage");
  ambientLoop("field-video", "field-pause", "bth-field-paused", "background footage");
  ambientLoop("water-video", "water-pause", "bth-water-paused", "background footage");
  ambientLoop("office-video", "office-pause", "bth-office-paused", "background footage");
  ambientLoop("closing-video", "closing-pause", "bth-closing-paused", "background footage");
  const isDesktop = () => window.matchMedia("(min-width: 1100px)").matches;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const plain = n => n.label.replace(/\n/g, " ");
  const plural = (n, one, many) => `${n} ${n === 1 ? one : (many || one + "s")}`;
  const evidenceLabel = ev => ev === "established" ? "Well established" : "Evidence emerging";
  const el = (name, attrs = {}, parent) => {
    const node = document.createElementNS(SVGNS, name);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  };

  /* ======================= GRAPH ======================= */
  const sysById = Object.fromEntries(SYSTEMS.map(s => [s.id, s]));
  const nodes = [];
  nodes.push({ id: "heat", kind: "hub", sys: "hub", label: "Extreme\nheat",
    desc: "Long stretches of dangerous heat, by day and by night. It doesn’t strike one sector: it presses on every system at once, and several of its consequences feed it back." });
  SYSTEMS.forEach(s => nodes.push({ id: s.id, kind: "domain", sys: s.id, label: s.label, desc: s.desc }));
  CONSEQUENCES.forEach(c => {
    if (!sysById[c.sys]) { console.warn("Unknown system", c.sys, "for", c.id); return; }
    nodes.push(Object.assign({ kind: "leaf" }, c));
  });
  const byId = Object.fromEntries(nodes.map(n => [n.id, n]));
  nodes.forEach(n => { n.out = []; n.in = []; n.loops = []; n.levers = []; n.color = n.kind === "hub" ? COLORS.ink : sysById[n.sys].color; });

  const edges = [];
  const edgeById = {};
  function addEdge(from, to, type, why) {
    if (!byId[from] || !byId[to]) { console.warn("Link needs both ends:", from, "→", to); return; }
    const id = from + ">" + to;
    if (edgeById[id]) return;
    const e = { id, from, to, type, why, loops: [], levers: [] };
    edges.push(e); edgeById[id] = e;
    byId[from].out.push(e); byId[to].in.push(e);
  }
  SYSTEMS.forEach(s => addEdge("heat", s.id, "hub"));
  CONSEQUENCES.forEach(c => addEdge(c.sys, c.id, "direct"));
  LINKS.forEach(([from, to, why, flag]) => {
    if (!byId[from] || !byId[to]) { addEdge(from, to); return; }
    const type = flag === "loop" ? "vicious" : (byId[from].sys === byId[to].sys ? "knock" : "cross");
    addEdge(from, to, type, why);
  });

  const loopById = Object.fromEntries(LOOPS.map(l => [l.id, l]));
  LOOPS.forEach(l => {
    l.edges = l.path.map((id, i) => id + ">" + l.path[(i + 1) % l.path.length]);
    l.edges.forEach(eid => edgeById[eid] ? edgeById[eid].loops.push(l.id) : console.warn("Loop", l.id, "needs a link", eid));
    l.path.forEach(id => byId[id] && byId[id].loops.push(l.id));
    l.levers = [];
  });
  const instById = Object.fromEntries(INSTITUTIONS.map(i => [i.id, i]));
  INSTITUTIONS.forEach(i => { i.levers = []; i.loops = new Set(); });
  const leverById = Object.fromEntries(LEVERS.map(v => [v.id, v]));
  LEVERS.forEach(v => {
    v.edgeId = v.edge.join(">");
    const e = edgeById[v.edgeId];
    v.loops = e ? e.loops.slice() : [];
    if (!e) console.warn("Lever", v.id, "needs a link", v.edgeId);
    else { e.levers.push(v.id); byId[e.from].levers.push(v.id); byId[e.to].levers.push(v.id); }
    v.loops.forEach(lid => loopById[lid].levers.push(v.id));
    (v.who || []).forEach(w => {
      const inst = instById[w]; if (!inst) { console.warn("Unknown institution", w); return; }
      inst.levers.push(v.id); v.loops.forEach(lid => inst.loops.add(lid));
    });
  });

  const state = { selected: null, story: null, step: 0, filter: "all", inst: null, on: new Set(), pkg: null };
  const pkgById = Object.fromEntries((typeof PACKAGES !== "undefined" ? PACKAGES : []).map(p => [p.id, p]));
  // an automatic package: every lever that can start working this season
  pkgById.now = { id: "now", title: "Before this summer", text: "Every lever that can start working this season, before the next heatwave.",
    levers: LEVERS.filter(v => v.when === "season").map(v => v.id) };
  const WHEN = { season: "Works this season", years: "1–3 years", decade: "A decade or more" };
  const whenTag = v => v.when && WHEN[v.when] ? `<span class="when when--${v.when}">${WHEN[v.when]}</span>` : "";
  const evidenceOf = id => (typeof EVIDENCE !== "undefined" && EVIDENCE[id]) || [];
  // a link to a printable one-pager in /print/ (opens in a new tab)
  const printLink = (slug, text) => `<a class="print-link" href="/print/${slug}/" target="_blank" rel="noopener"><span class="print-ico" aria-hidden="true"></span>${esc(text)}<span class="visually-hidden"> (printable page, opens in a new tab)</span></a>`;
  const extLink = (url, text) => `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(text)}<span class="visually-hidden"> (opens in a new tab)</span>&nbsp;<span aria-hidden="true">↗</span></a>`;
  // the heat network: organisations already working on each lever
  const ORGS = typeof ORGANISATIONS !== "undefined" ? ORGANISATIONS : [];
  const orgsForLever = id => ORGS.filter(o => o.levers.includes(id));
  const orgsForLoop = l => ORGS.filter(o => o.levers.some(v => l.levers.includes(v)));

  // plain-language glossary: explain technical terms where they appear
  const GLOSS = (typeof GLOSSARY !== "undefined" ? GLOSSARY : []).map(g => Object.assign({ re: new RegExp("\\b(" + g.match.replace(/[-]/g, "\\$&") + ")(s|es)?\\b", "i") }, g));
  const glossById = Object.fromEntries(GLOSS.map(g => [g.id, g]));
  // longer phrases first, so "wet-bulb globe temperature" wins over "wet-bulb temperature"
  const GLOSS_AUTO = GLOSS.filter(g => g.auto !== false).sort((a, b) => b.match.length - a.match.length);
  function gloss(text) {
    const found = [];
    // swap matches for placeholders first, so one term is never wrapped inside another
    let out = esc(text);
    GLOSS_AUTO.forEach(g => { out = out.replace(g.re, m => { found.push([g.id, m]); return `\u0000${found.length - 1}\u0001`; }); });
    return out.replace(/\u0000(\d+)\u0001/g, (_, k) => `<button type="button" class="term" data-term="${found[k][0]}" aria-expanded="false">${found[k][1]}</button>`);
  }

  // what kind of source it is, where, how big, and what it cannot tell us; "our reading" is interpretation, kept apart
  function evidenceCard(x) {
    if (!x.type) return "";
    return `<p class="evid__card"><span class="visually-hidden">Type: </span><b>${esc(x.type)}</b> · <span class="visually-hidden">Where: </span>${esc(x.where)} · <span class="visually-hidden">Scale: </span>${esc(x.scale)}</p><p class="evid__limit"><strong>Limit:</strong> ${esc(x.limit)}</p>${x.reading ? `<p class="evid__reading"><strong>Our reading:</strong> ${esc(x.reading)}</p>` : ""}`;
  }

  function evidenceHTML(l, open) {
    const ev = evidenceOf(l.id); if (!ev.length) return "";
    return `<details class="evid"${open ? " open" : ""}><summary>See the evidence <span>${plural(ev.length, "source")}</span></summary>
      <ul>${ev.map(x => `<li>${extLink(x.url, x.title)}<small>${esc(x.by)}</small><p>${gloss(x.finding)}</p>${evidenceCard(x)}</li>`).join("")}</ul>
      <p class="evid__how"><a href="#method">How we judge evidence</a></p></details>`;
  }

  /* ======================= LAYOUT ======================= */
  const measureCtx = document.createElement("canvas").getContext("2d");
  function textWidth(text, font) { measureCtx.font = font; return measureCtx.measureText(text).width; }
  let world = { l: -1200, r: 1200, t: -1200, b: 1200 };

  function layout() {
        nodes.forEach(n => {
      const lines = n.label.split("\n");
      n.lines = lines;
      if (n.kind === "hub") { n.r = HUB_R; n.x = 0; n.y = 0; n.box = { l: -HUB_R - 14, r: HUB_R + 14, t: -HUB_R - 14, b: HUB_R + 14 }; return; }
      if (n.kind === "domain") {
        n.r = DOMAIN_R;
        n.box = { l: -n.r - 30, r: n.r + 30, t: -n.r - 30, b: n.r + 30 };
      } else {
        n.r = 11 + 3.2 * Math.min(n.loops.length, 5);
        const w = Math.max(...lines.map(l => textWidth(l, "600 13px 'Hanken Grotesk', Arial"))) + 8;
        n.lw = w; n.lh = lines.length * 15.5 + 4;
        n.box = n.labelAt === "above"
          ? { l: -Math.max(w / 2, n.r), r: Math.max(w / 2, n.r), t: -(n.r + 6 + lines.length * 15.5), b: n.r }
          : { l: -Math.max(w / 2, n.r), r: Math.max(w / 2, n.r), t: -n.r, b: n.r + 4 + lines.length * 15.5 };
      }
    });

    // each system gets a slice of the wheel sized by how many consequences it holds
    // (space: optional extra slice for a system with long labels; rings: 3 spreads its dots over three rings)
    const weights = SYSTEMS.map(s => nodes.filter(n => n.kind === "leaf" && n.sys === s.id).length + 3 + (s.space || 0));
    const total = weights.reduce((a, b) => a + b, 0);
    let acc = -Math.PI / 2 - Math.PI * weights[0] / total;
    SYSTEMS.forEach((s, i) => {
      const span = 2 * Math.PI * weights[i] / total;
      s.a0 = acc; s.a1 = acc + span; acc += span;
      const theta = (s.a0 + s.a1) / 2;
      const d = byId[s.id];
      d.theta = theta;
      d.x = d.ax = Math.cos(theta) * DOMAIN_RING;
      d.y = d.ay = Math.sin(theta) * DOMAIN_RING;
      const leaves = nodes.filter(n => n.kind === "leaf" && n.sys === s.id);
      const radii = leaves.length > 8 || s.rings === 3 ? [740, 960, 1180] : leaves.length > 4 ? [780, 1060] : [820, 1080];
      const spread = span * 0.84;
      const rings = radii.map(() => []);
      leaves.forEach((n, j) => rings[j % radii.length].push(n));
      rings.forEach((ring, ri) => ring.forEach((n, j) => {
        const a = theta + spread * ((j + 0.5) / ring.length - 0.5);
        n.theta0 = theta; n.hw = spread / 2;
        n.x = n.ax = Math.cos(a) * radii[ri];
        n.y = n.ay = Math.sin(a) * radii[ri];
      }));
    });

    // relax: push overlapping label boxes apart, gently pull each back towards its place
    const movers = nodes.filter(n => n.kind !== "hub");
    const pad = 12;
    for (let it = 0; it < 600; it++) {
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const ox = Math.min(a.x + a.box.r, b.x + b.box.r) - Math.max(a.x + a.box.l, b.x + b.box.l) + pad;
          const oy = Math.min(a.y + a.box.b, b.y + b.box.b) - Math.max(a.y + a.box.t, b.y + b.box.t) + pad;
          if (ox <= 0 || oy <= 0) continue;
          const wa = a.kind === "hub" ? 0 : a.kind === "domain" ? 0.25 : 1;
          const wb = b.kind === "hub" ? 0 : b.kind === "domain" ? 0.25 : 1;
          const tot = wa + wb || 1;
          if (ox < oy) {
            const dir = (a.x + (a.box.l + a.box.r) / 2) < (b.x + (b.box.l + b.box.r) / 2) ? -1 : 1;
            a.x += dir * ox * wa / tot * 0.5; b.x -= dir * ox * wb / tot * 0.5;
          } else {
            const dir = (a.y + (a.box.t + a.box.b) / 2) < (b.y + (b.box.t + b.box.b) / 2) ? -1 : 1;
            a.y += dir * oy * wa / tot * 0.5; b.y -= dir * oy * wb / tot * 0.5;
          }
        }
      }
      movers.forEach(n => {
        n.x += (n.ax - n.x) * 0.012; n.y += (n.ay - n.y) * 0.012;
        if (n.kind !== "leaf") return;
        // keep every consequence inside its own system's slice of the wheel
        let a = Math.atan2(n.y, n.x), d = a - n.theta0;
        d = Math.atan2(Math.sin(d), Math.cos(d));
        if (Math.abs(d) > n.hw) a = n.theta0 + Math.sign(d) * n.hw;
        const R = Math.max(690, Math.min(RIM - 70, Math.hypot(n.x, n.y)));
        n.x = Math.cos(a) * R; n.y = Math.sin(a) * R;
      });
    }

    let l = Infinity, r = -Infinity, t = Infinity, b = -Infinity;
    nodes.forEach(n => { l = Math.min(l, n.x + n.box.l); r = Math.max(r, n.x + n.box.r); t = Math.min(t, n.y + n.box.t); b = Math.max(b, n.y + n.box.b); });
    const R = RIM + 120;
    world = { l: Math.min(l, -R), r: Math.max(r, R), t: Math.min(t, -R), b: Math.max(b, R) };
  }

  /* ======================= DRAW ======================= */
  const defs = el("defs", {}, svg);
  const markerColors = { hub: COLORS.ink, knock: "#4A5560", cross: "#2E6F95", vicious: COLORS.red, healed: "#1F7A70" };
  SYSTEMS.forEach(s => { markerColors[s.id] = s.color; });
  for (const key in markerColors) {
    const m = el("marker", { id: "arr-" + key, viewBox: "0 0 10 10", refX: "9", refY: "5", markerWidth: "4.2", markerHeight: "4.2", orient: "auto-start-reverse" }, defs);
    el("path", { d: "M0,0 L10,5 L0,10 z", fill: markerColors[key] }, m);
  }
  const gBg = el("g", { class: "bg" }, svg);
  const gEdges = el("g", { class: "edges" }, svg);
  const gNodes = el("g", { class: "nodes" }, svg);
  // consequence labels live in their own layer above every dot, so no neighbouring dot can cut through a label
  const gLabels = el("g", { class: "labels", "aria-hidden": "true" }, svg);
  const gLevers = el("g", { class: "levers" }, svg);

  function drawBackground() {
    gBg.textContent = "";
    const r0 = HUB_R + 60, r1 = RIM;
    SYSTEMS.forEach(s => {
      const a0 = s.a0, a1 = s.a1, mid = (a0 + a1) / 2;
      const p = (r, a) => `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`;
      const sliceD = `M${p(r0, a0)} L${p(r1, a0)} A${r1},${r1} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${p(r1, a1)} L${p(r0, a1)} A${r0},${r0} 0 ${a1 - a0 > Math.PI ? 1 : 0} 0 ${p(r0, a0)} Z`;
      el("path", { class: "slice", "data-sys": s.id, style: `--c:${s.color}`, d: sliceD }, gBg);
      // earned cooling: each slice starts warm and cools only as its own loops are broken
      s.warm = el("path", { class: "wash wash--warm", d: sliceD }, gBg);
      s.cool = el("path", { class: "wash wash--cool", d: sliceD }, gBg);
      const lx = Math.cos(mid) * (r1 + 34), ly = Math.sin(mid) * (r1 + 34);
      const anchor = Math.cos(mid) > 0.25 ? "start" : Math.cos(mid) < -0.25 ? "end" : "middle";
      const lines = s.label.split("\n");
      const t = el("text", { class: "rim-label", x: lx, y: ly, "text-anchor": anchor, style: `--c:${s.color}`, "data-sys": s.id }, gBg);
      const up = Math.sin(mid) < -0.3, down = Math.sin(mid) > 0.3;
      lines.forEach((line, j) => {
        const dy = j === 0 ? (up ? `${-(lines.length - 1) * 1.1}em` : down ? "0.9em" : `${0.35 - (lines.length - 1) * 0.55}em`) : "1.1em";
        el("tspan", { x: lx, dy }, t).textContent = line.toUpperCase();
      });
    });
    [DOMAIN_RING, 900, 1200].forEach(r => el("circle", { class: "ring", r, cx: 0, cy: 0 }, gBg));
  }

  function drawNodes() {
    gNodes.textContent = ""; gLabels.textContent = "";
    nodes.forEach(n => {
      const g = el("g", { class: `node node--${n.kind}`, "data-id": n.id, tabindex: "0", role: "button",
        transform: `translate(${n.x.toFixed(1)} ${n.y.toFixed(1)})`, style: `--c:${n.color}` }, gNodes);
      n.g = g;
      const loopsText = n.loops.length ? ` Caught in ${plural(n.loops.length, "vicious cycle")}.` : "";
      g.setAttribute("aria-label", `${plain(n)}.${n.kind === "leaf" ? " " + plain(sysById[n.sys]) + "." : ""}${loopsText}`);
      if (n.kind === "hub") {
        el("circle", { class: "hub__halo", r: HUB_R + 20 }, g);
        el("circle", { class: "hub__ring", r: HUB_R + 14 }, g);
        el("circle", { class: "hub__disc", r: HUB_R }, g);
        const t = el("text", { class: "hub__text", "text-anchor": "middle" }, g);
        n.lines.forEach((line, i) => { el("tspan", { x: 0, y: (i - (n.lines.length - 1) / 2) * 76 + 26 }, t).textContent = line.toUpperCase(); });
        return;
      }
      el("circle", { class: "node__halo", r: n.r + 9 }, g);
      if (n.loops.length && n.kind === "leaf") el("circle", { class: "node__loop", r: n.r + 4 }, g);
      el("circle", { class: "node__dot", r: n.r }, g);
      if (n.kind === "domain") {
        const c = Math.cos(n.theta), sn = Math.sin(n.theta);
        const lx = c * (n.r + 10), ly = sn * (n.r + 10);
        const anchor = c > 0.25 ? "start" : c < -0.25 ? "end" : "middle";
        const up = sn < -0.3, down = sn > 0.3, L = n.lines.length;
        const t = el("text", { class: "node__label", "text-anchor": anchor, x: lx, y: ly }, g);
        n.lines.forEach((line, i) => {
          const dy = i === 0 ? (up ? `${-(L - 1) * 1.15}em` : down ? "0.95em" : `${0.35 - (L - 1) * 0.575}em`) : "1.15em";
          el("tspan", { x: lx, dy }, t).textContent = line.toUpperCase();
        });
      } else {
        // labels sit under the dot, or above it where a neighbouring dot would cut through them (labelAt: "above")
        const above = n.labelAt === "above", L = n.lines.length;
        const t = el("text", { class: "node__label", "text-anchor": "middle", y: above ? -(n.r + 6) : n.r + 3 }, g);
        n.lines.forEach((line, i) => { el("tspan", { x: 0, dy: i === 0 ? (above ? `${-(L - 1) * 1.15}em` : "1em") : "1.15em" }, t).textContent = line; });
      }
      el("title", {}, g).textContent = plain(n);
    });
    // move each consequence label into the label layer, in a group that mirrors its node's classes and style,
    // so every existing rule (hidden at a distance, dimmed outside a focus, shown on hover or keyboard focus) still applies
    nodes.forEach(n => {
      if (n.kind !== "leaf") return;
      const t = n.g.querySelector(".node__label"); if (!t) return;
      const lg = el("g", {}, gLabels);
      const sync = () => { lg.setAttribute("class", n.g.getAttribute("class") + " node--label-only");
        lg.setAttribute("transform", n.g.getAttribute("transform")); lg.setAttribute("style", n.g.getAttribute("style") || ""); };
      sync(); lg.appendChild(t);
      new MutationObserver(sync).observe(n.g, { attributes: true, attributeFilter: ["class", "transform", "style"] });
      n.g.addEventListener("pointerenter", () => lg.setAttribute("data-hover", ""));
      n.g.addEventListener("pointerleave", () => lg.removeAttribute("data-hover"));
      n.g.addEventListener("focus", () => { if (n.g.matches(":focus-visible")) lg.setAttribute("data-kbd", ""); });
      n.g.addEventListener("blur", () => lg.removeAttribute("data-kbd"));
      n.lg = lg;
    });
  }

  function clipPoint(n, toward, extra) {
    const dx = toward.x - n.x, dy = toward.y - n.y, len = Math.hypot(dx, dy) || 1;
    const r = n.r + extra;
    return { x: n.x + dx / len * r, y: n.y + dy / len * r };
  }

  function drawEdges() {
    gEdges.textContent = "";
    edges.forEach(e => {
      const a = byId[e.from], b = byId[e.to];
      const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
      let c = null;
      if (e.type !== "hub" && e.type !== "direct") {
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        const pull = 1 - 0.55 * Math.min(1, len / 1700);       // long links bow towards the centre
        c = { x: mx * pull, y: my * pull };
        if (edgeById[e.to + ">" + e.from]) {                      // two-way pairs separate
          const s = 0.2 * len;
          c.x += -dy / len * s; c.y += dx / len * s;
        }
      }
      const s = clipPoint(a, c || b, 3), t = clipPoint(b, c || a, 5);
      const d = c ? `M${s.x.toFixed(1)},${s.y.toFixed(1)} Q${c.x.toFixed(1)},${c.y.toFixed(1)} ${t.x.toFixed(1)},${t.y.toFixed(1)}`
                  : `M${s.x.toFixed(1)},${s.y.toFixed(1)} L${t.x.toFixed(1)},${t.y.toFixed(1)}`;
      e.mid = c ? { x: 0.25 * s.x + 0.5 * c.x + 0.25 * t.x, y: 0.25 * s.y + 0.5 * c.y + 0.25 * t.y } : { x: (s.x + t.x) / 2, y: (s.y + t.y) / 2 };
      const key = e.type === "direct" ? a.sys : e.type;
      e.marker = e.marker0 = `url(#arr-${key})`;
      const p = el("path", { d, class: `edge edge--${e.type}`, "data-id": e.id, "marker-end": e.marker,
        style: `--c:${e.type === "direct" ? a.color : "#4A5560"}` }, gEdges);
      if (e.why) el("title", {}, p).textContent = `${plain(a)} → ${plain(b)}: ${e.why}`;
      e.path = p;
    });
  }

  function drawLevers() {
    gLevers.textContent = "";
    LEVERS.forEach(v => {
      const e = edgeById[v.edgeId]; if (!e) return;
      const g = el("g", { class: "lever", "data-lever": v.id, tabindex: "0", role: "button", "aria-label": `Where it breaks: ${v.title}`,
        style: `--x:${e.mid.x.toFixed(1)}px;--y:${e.mid.y.toFixed(1)}px` }, gLevers);
      el("circle", { class: "lever__ring", r: 15 }, g);
      el("circle", { class: "lever__dot", r: 10 }, g);
      el("path", { class: "lever__cut", d: "M-3.6,-5 L-0.8,5 M0.8,-5 L3.6,5" }, g);
      el("title", {}, g).textContent = `Where it breaks: ${v.title}`;
      v.g = g;
    });
  }

  /* ======================= CAMERA ======================= */
  const cam = { x: 0, y: 0, k: 0.4 };
  let kMin = 0.2, anim = null;
  const kMax = 3.2;
  const zoomInBtn = need("zoom-in");
  const zoomOutBtn = need("zoom-out");

  const size = () => ({ W: svg.clientWidth || 800, H: svg.clientHeight || 600 });

  function applyCam() {
    const { W, H } = size();
    const w = W / cam.k, h = H / cam.k;
    svg.setAttribute("viewBox", `${(cam.x - w / 2).toFixed(2)} ${(cam.y - h / 2).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)}`);
    svg.style.setProperty("--px", (1 / cam.k).toFixed(4));
    svg.classList.toggle("far", cam.k < LABEL_K);
    zoomOutBtn.disabled = cam.k <= kMin * 1.02;
    zoomInBtn.disabled = cam.k >= kMax * 0.98;
    declutter();
  }

  // show as many labels as fit without overlapping: the selected one first, then highlighted ones, then the busiest
  const leafNodes = () => nodes.filter(n => n.kind === "leaf");
  let leafCache = null;
  function declutter() {
    if (!leafCache) leafCache = leafNodes().slice().sort((a, b) => b.loops.length - a.loops.length || b.out.length - a.out.length);
    const k = cam.k, far = k < LABEL_K, focus = svg.classList.contains("has-focus");
    const placed = [];
    const cands = [];
    leafCache.forEach(n => {
      if (!n.g) return;
      const cur = n.g.classList.contains("current"), on = n.g.classList.contains("on");
      let pr = cur ? 3 : on && focus ? 2 : !focus ? (far ? 0.5 : 1) : -1;
      if (focus && !on && !cur) pr = far ? -1 : 0.2;
      cands.push({ n, pr });
    });
    cands.sort((a, b) => b.pr - a.pr);
    cands.forEach(({ n, pr }) => {
      let show = pr > 0;
      if (show) {
        const hw = n.lw / 2 / k;
        const box = n.labelAt === "above" ? { l: n.x - hw, r: n.x + hw, t: n.y - n.r - n.lh / k, b: n.y - n.r }
          : { l: n.x - hw, r: n.x + hw, t: n.y + n.r, b: n.y + n.r + n.lh / k };
        const pad = 2 / k;
        if (pr < 3 && placed.some(p => box.l < p.r + pad && box.r > p.l - pad && box.t < p.b + pad && box.b > p.t - pad)) show = false;
        if (show) placed.push(box);
      }
      if (n.lblOff !== !show) { n.lblOff = !show; n.g.classList.toggle("lbl-off", !show); }
    });
  }

  // the part of the map not hidden behind the bottom sheet (phones)
  function viewArea() {
    const { W, H } = size();
    const pad = 24;
    if (isDesktop() || !panel.classList.contains("is-open")) return { x0: pad, y0: pad, x1: W - pad, y1: H - pad };
    const rect = svg.getBoundingClientRect();
    const sheetTop = window.innerHeight * 0.48;
    const visibleBottom = Math.max(140, Math.min(H, sheetTop - rect.top));
    return { x0: pad, y0: pad, x1: W - pad, y1: visibleBottom - 12 };
  }

  function targetFor(b, opts = {}) {
    const { W, H } = size();
    const a = opts.area || viewArea();
    let k = Math.min((a.x1 - a.x0) / (b.r - b.l), (a.y1 - a.y0) / (b.b - b.t));
    k = Math.max(kMin, Math.min(opts.maxK || 1.5, k));
    let cx = (b.l + b.r) / 2, cy = (b.t + b.b) / 2;
    // never zoom out so far that highlighted labels collide; centre on the focus instead
    if (opts.minK && k < opts.minK) {
      k = opts.minK;
      if (opts.center && byId[opts.center]) { cx = byId[opts.center].x; cy = byId[opts.center].y + 20; }
    }
    return { x: cx - ((a.x0 + a.x1) / 2 - W / 2) / k, y: cy - ((a.y0 + a.y1) / 2 - H / 2) / k, k };
  }

  function animateTo(t, dur = 700) {
    if (anim) cancelAnimationFrame(anim);
    if (reduceMotion) { Object.assign(cam, t); applyCam(); return; }
    const from = Object.assign({}, cam), start = performance.now();
    const ease = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    const step = now => {
      const p = Math.min(1, (now - start) / dur), q = ease(p);
      cam.x = from.x + (t.x - from.x) * q;
      cam.y = from.y + (t.y - from.y) * q;
      cam.k = Math.exp(Math.log(from.k) + (Math.log(t.k) - Math.log(from.k)) * q);
      applyCam();
      anim = p < 1 ? requestAnimationFrame(step) : null;
    };
    anim = requestAnimationFrame(step);
  }

  function boundsOf(ids) {
    let l = Infinity, r = -Infinity, t = Infinity, b = -Infinity;
    ids.forEach(id => { const n = byId[id]; if (!n) return; l = Math.min(l, n.x + n.box.l); r = Math.max(r, n.x + n.box.r); t = Math.min(t, n.y + n.box.t); b = Math.max(b, n.y + n.box.b); });
    return { l: l - 20, r: r + 20, t: t - 20, b: b + 20 };
  }
  const flyTo = (ids, opts) => animateTo(targetFor(boundsOf(ids), opts));

  function fitAll(instant, opening) {
    kMin = 0.02;
    const t = targetFor(world, { maxK: 3, area: (() => { const { W, H } = size(); return { x0: 12, y0: 12, x1: W - 12, y1: H - 12 }; })() });
    kMin = Math.min(t.k * 0.85, 0.5);
    // on narrow screens open a little closer than the whole wheel, so the dots are tappable
    if (opening && !isDesktop() && t.k < 0.2) { t.k = 0.2; t.x = 0; t.y = 0; }
    if (instant) { Object.assign(cam, t); applyCam(); } else animateTo(t);
  }

  function zoomAt(factor, sx, sy) {
    const { W, H } = size();
    if (sx === undefined) { sx = W / 2; sy = H / 2; }
    const k2 = Math.max(kMin, Math.min(kMax, cam.k * factor));
    const wx = cam.x + (sx - W / 2) / cam.k, wy = cam.y + (sy - H / 2) / cam.k;
    return { x: wx - (sx - W / 2) / k2, y: wy - (sy - H / 2) / k2, k: k2 };
  }

  zoomInBtn.addEventListener("click", () => animateTo(zoomAt(1.6), 350));
  zoomOutBtn.addEventListener("click", () => animateTo(zoomAt(1 / 1.6), 350));
  need("zoom-fit").addEventListener("click", () => fitAll());

  // drag to pan, pinch to zoom, tap to select
  const pointers = new Map();
  let gesture = null;
  svg.addEventListener("pointerdown", ev => {
    if (ev.pointerType === "mouse" && ev.button !== 0) return;
    pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    try { svg.setPointerCapture(ev.pointerId); } catch (e) {}
    if (anim) { cancelAnimationFrame(anim); anim = null; }
    if (pointers.size === 1) gesture = { type: "pan", sx: ev.clientX, sy: ev.clientY, cx: cam.x, cy: cam.y, moved: false, target: ev.target };
    else if (pointers.size === 2) {
      const [p1, p2] = [...pointers.values()];
      gesture = { type: "pinch", d: Math.hypot(p1.x - p2.x, p1.y - p2.y) || 1, k: cam.k, moved: true,
        mx: (p1.x + p2.x) / 2, my: (p1.y + p2.y) / 2, cx: cam.x, cy: cam.y };
    }
  });
  svg.addEventListener("pointermove", ev => {
    if (!pointers.has(ev.pointerId) || !gesture) return;
    pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (gesture.type === "pan" && pointers.size === 1) {
      const dx = ev.clientX - gesture.sx, dy = ev.clientY - gesture.sy;
      if (!gesture.moved && Math.hypot(dx, dy) < 6) return;
      gesture.moved = true; svg.classList.add("is-dragging");
      cam.x = gesture.cx - dx / cam.k; cam.y = gesture.cy - dy / cam.k; applyCam();
    } else if (gesture.type === "pinch" && pointers.size === 2) {
      const [p1, p2] = [...pointers.values()];
      const rect = svg.getBoundingClientRect();
      const { W, H } = size();
      const k2 = Math.max(kMin, Math.min(kMax, gesture.k * Math.hypot(p1.x - p2.x, p1.y - p2.y) / gesture.d));
      const sx = gesture.mx - rect.left, sy = gesture.my - rect.top;
      const wx = gesture.cx + (sx - W / 2) / gesture.k, wy = gesture.cy + (sy - H / 2) / gesture.k;
      const nx = (p1.x + p2.x) / 2 - rect.left, ny = (p1.y + p2.y) / 2 - rect.top;
      cam.k = k2; cam.x = wx - (nx - W / 2) / k2; cam.y = wy - (ny - H / 2) / k2; applyCam();
    }
  });
  function endPointer(ev) {
    if (!pointers.has(ev.pointerId)) return;
    pointers.delete(ev.pointerId);
    if (gesture && gesture.type === "pan" && !gesture.moved && ev.type === "pointerup") tap(gesture.target);
    if (pointers.size === 0) { gesture = null; svg.classList.remove("is-dragging"); }
    else if (pointers.size === 1) {
      const [p] = [...pointers.values()];
      gesture = { type: "pan", sx: p.x, sy: p.y, cx: cam.x, cy: cam.y, moved: true };
    }
  }
  svg.addEventListener("pointerup", endPointer);
  svg.addEventListener("pointercancel", endPointer);
  svg.addEventListener("wheel", ev => {
    if (!(ev.ctrlKey || ev.metaKey)) { showWheelHint(); return; }
    ev.preventDefault();
    const rect = svg.getBoundingClientRect();
    Object.assign(cam, zoomAt(Math.exp(-ev.deltaY * 0.0022), ev.clientX - rect.left, ev.clientY - rect.top));
    applyCam();
  }, { passive: false });
  svg.addEventListener("dblclick", ev => {
    const rect = svg.getBoundingClientRect();
    animateTo(zoomAt(1.8, ev.clientX - rect.left, ev.clientY - rect.top), 350);
  });
  let hintTimer;
  function showWheelHint() {
    const h = document.getElementById("wheel-hint"); if (!h) return;
    h.classList.add("is-on"); clearTimeout(hintTimer); hintTimer = setTimeout(() => h.classList.remove("is-on"), 1400);
  }

  function tap(target) {
    if (!target || !target.closest) return;
    const lever = target.closest(".lever");
    if (lever) { selectLever(lever.dataset.lever); return; }
    const node = target.closest(".node");
    if (node) { onNodeActivate(node.dataset.id); return; }
    if (state.selected || state.story || state.inst) clearSelection();
  }

  /* ======================= HIGHLIGHTING ======================= */
  function clearMarks() {
    svg.querySelectorAll(".on, .flow, .current, .in-loop").forEach(x => {
      x.classList.remove("on", "flow", "current", "in-loop");
      x.style.removeProperty("--d");
    });
    edges.forEach(e => e.path && e.path.setAttribute("marker-end", e.marker));
    svg.classList.remove("has-focus");
    declutter();
  }

  function mark({ nodes: ns = [], edges: es = [], flow = [], depth = null, loopEdges = [], levers = [] }) {
    clearMarks();
    svg.classList.add("has-focus");
    ns.forEach(id => { const n = byId[id]; if (!n) return; n.g.classList.add("on"); if (depth) n.g.style.setProperty("--d", Math.min(depth.get(id) || 0, 8)); });
    es.forEach(id => { const e = edgeById[id]; if (!e) return; e.path.classList.add("on"); if (depth) e.path.style.setProperty("--d", Math.min((depth.get(e.to) || 1) - 0.5, 8)); });
    loopEdges.forEach(id => { const e = edgeById[id]; if (!e) return; e.path.classList.add("on", "in-loop"); e.path.setAttribute("marker-end", "url(#arr-vicious)"); });
    levers.forEach(id => leverById[id] && leverById[id].g && leverById[id].g.classList.add("on"));
    if (!reduceMotion) flow.forEach(id => edgeById[id] && edgeById[id].path.classList.add("flow"));
    declutter();
  }

  function neighbourhood(id) {
    const n = byId[id];
    const ns = new Set([id]), es = new Set(), flow = new Set();
    n.out.forEach(e => { ns.add(e.to); es.add(e.id); flow.add(e.id); });
    n.in.forEach(e => { ns.add(e.from); es.add(e.id); });
    return { ns, es, flow };
  }

  function ripple(id) {
    const depth = new Map([[id, 0]]), es = new Set(), queue = [id];
    while (queue.length) {
      const cur = queue.shift();
      byId[cur].out.forEach(e => {
        if (e.type === "hub" && id !== "heat") return;     // don't count heat’s own spread twice
        es.add(e.id);
        if (!depth.has(e.to)) { depth.set(e.to, depth.get(cur) + 1); queue.push(e.to); }
      });
    }
    return { depth, es };
  }

  function applyFilter() {
    const f = state.filter;
    svg.classList.toggle("is-filtered", f !== "all");
    gBg.querySelectorAll("[data-sys]").forEach(x => x.classList.toggle("out", f !== "all" && x.dataset.sys !== f));
    nodes.forEach(n => n.g.classList.toggle("out", !(f === "all" || n.sys === f || n.kind === "hub")));
    edges.forEach(e => {
      const ok = f === "all" || ((byId[e.from].sys === f || e.from === "heat") && (byId[e.to].sys === f || e.to === "heat"));
      e.path.classList.toggle("out", !ok);
    });
    if (f === "all") fitAll(); else flyTo(nodes.filter(n => n.sys === f).map(n => n.id), { maxK: 1.3 });
  }

  /* ======================= SELECTION ======================= */
  function beforeFocus() {
    openPanel();
    const r = stage.getBoundingClientRect();
    if (!isDesktop()) {
      const top = r.top - 66;
      if (Math.abs(top) > 4) window.scrollBy(0, top);
    } else if (r.bottom > window.innerHeight + 4 || r.top < 60) {
      const delta = r.top < 60 ? r.top - 76 : Math.min(r.bottom - window.innerHeight + 16, r.top - 76);
      window.scrollBy({ top: delta, behavior: reduceMotion ? "auto" : "smooth" });
    }
  }

  function select(id, opts = {}) {
    if (!byId[id]) return;
    state.story = null; state.inst = null; state.selected = id;
    const { ns, es, flow } = neighbourhood(id);
    mark({ nodes: ns, edges: es, flow });
    byId[id].g.classList.add("current");
    declutter();
    renderNode(id);
    beforeFocus();
    if (opts.fly !== false) flyTo([...ns], { maxK: 1.35, minK: 0.95, center: id });
    setHash(id);
  }

  // how far this kind of action has spread in Indian cities (data.js, part 6, "spread")

  function selectLever(id) {
    const v = leverById[id]; if (!v) return;
    state.story = null; state.inst = null; state.selected = "lever:" + id;
    const loopEdges = new Set(), ns = new Set();
    v.loops.forEach(lid => loopById[lid].edges.forEach(eid => { loopEdges.add(eid); const e = edgeById[eid]; ns.add(e.from); ns.add(e.to); }));
    const e = edgeById[v.edgeId]; ns.add(e.from); ns.add(e.to);
    mark({ nodes: ns, edges: [v.edgeId], loopEdges, levers: [id] });
    renderLever(id);
    beforeFocus();
    flyTo([...ns], { maxK: 1.35, minK: 0.95, center: e.to });
    setHash("break-" + id);
  }

  function selectInstitution(id) {
    const inst = instById[id]; if (!inst) return;
    state.story = null; state.selected = null; state.inst = id;
    const loopEdges = new Set(), ns = new Set(), es = new Set();
    inst.loops.forEach(lid => loopById[lid].edges.forEach(eid => { loopEdges.add(eid); const e = edgeById[eid]; ns.add(e.from); ns.add(e.to); }));
    inst.levers.forEach(lid => { const e = edgeById[leverById[lid].edgeId]; if (e) { es.add(e.id); ns.add(e.from); ns.add(e.to); } });
    mark({ nodes: ns, edges: es, loopEdges, levers: inst.levers });
    renderInstitution(id);
    beforeFocus();
    flyTo([...ns], { maxK: 1.2 });
    document.getElementById("who").value = id;
    setHash("who-" + id);
  }

  function clearSelection() {
    if (state.selected === "tour" && state.on.size) state.on.clear();
    state.selected = null; state.story = null; state.inst = null; state.pkg = null; state.tour = null;
    clearMarks();
    applyBreakState();
    renderIntro();
    closePanel();
    document.getElementById("who").value = "";
    setHash("");
  }

  function setHash(h) {
    try { history.replaceState(null, "", h ? "#" + h : location.pathname + location.search); } catch (e) {}
  }

  function showRipple(id) {
    const { depth, es } = ripple(id);
    mark({ nodes: depth.keys(), edges: es, flow: es, depth });
    byId[id].g.classList.add("current");
    const reached = [...depth.keys()].filter(k => k !== id && byId[k].kind === "leaf");
    const systems = new Set(reached.map(k => byId[k].sys));
    const maxDepth = Math.max(0, ...depth.values());
    const back = depth.has("heat") && id !== "heat";
    const out = panelBody.querySelector("[data-ripple-result]");
    if (out) {
      out.innerHTML = reached.length
        ? `Reaches <strong>${reached.length}</strong> of ${CONSEQUENCES.length} consequences across <strong>${systems.size}</strong> of ${SYSTEMS.length} systems, up to <strong>${maxDepth}</strong> steps away.${back ? " <em>And it feeds back into the heat itself.</em>" : ""}`
        : "Nothing further downstream on this map.";
      out.hidden = false;
    }
    flyTo([...depth.keys()], { maxK: 1.2 });
  }

  /* ---- guided paths ---- */
  function loopStory(l) {
    const steps = [{ edges: [], loopAll: true, title: "The loop", text: l.summary, place: (typeof LOOP_PLACES !== "undefined" && LOOP_PLACES[l.id]) || "" }];
    l.edges.forEach(eid => {
      const e = edgeById[eid]; if (!e) return;
      steps.push({ edges: [[e.from, e.to]], title: `${plain(byId[e.from])} → ${plain(byId[e.to])}`, text: e.why || byId[e.to].desc });
    });
    steps.push({ edges: [], loopAll: true, levers: true, title: "Where it breaks",
      text: l.levers.length ? "Cut any one link and the loop stops feeding itself:" : "No lever is mapped for this loop yet." });
    return { title: l.name, kicker: `Vicious cycle · ${evidenceLabel(l.evidence)}`, steps, loop: l };
  }
  const getStory = key => loopById[key] ? loopStory(loopById[key]) : STORIES[key];

  function startStory(key) {
    if (!getStory(key)) return;
    state.story = key; state.step = 0; state.selected = null; state.inst = null;
    beforeFocus();
    renderStep();
    setHash(loopById[key] ? "loop-" + key : "");
  }

  function renderStep() {
    const story = getStory(state.story);
    const step = story.steps[state.step];
    const ns = new Set(), es = new Set(), flow = new Set(), loopEdges = new Set();
    let levers = [], focus = [];
    if (story.loop) {
      const l = story.loop;
      l.path.forEach(id => ns.add(id));
      if (step.loopAll) l.edges.forEach(eid => { loopEdges.add(eid); flow.add(eid); });
      else {
        story.steps.slice(1, state.step + 1).forEach(s => s.edges.forEach(([a, b]) => loopEdges.add(a + ">" + b)));
        step.edges.forEach(([a, b]) => flow.add(a + ">" + b));
        l.edges.forEach(eid => es.add(eid));
      }
      if (step.levers) levers = l.levers;
      focus = step.loopAll ? l.path : step.edges.flat();
    } else {
      story.steps.slice(0, state.step + 1).forEach((s, i) => s.edges.forEach(([a, b]) => {
        ns.add(a); ns.add(b); es.add(a + ">" + b);
        if (i === state.step) flow.add(a + ">" + b);
      }));
      focus = [...ns];
    }
    mark({ nodes: ns, edges: es, flow, loopEdges, levers });
    step.edges.forEach(([, b]) => byId[b] && byId[b].g.classList.add("current"));
    declutter();
    const last = state.step === story.steps.length - 1;
    panelBody.innerHTML = `
      <p class="panel__kicker ${story.loop ? "is-loop" : ""}">${esc(story.kicker)}</p>
      <h2 class="panel__title">${esc(story.title)}</h2>
      <div class="progress" aria-hidden="true">${story.steps.map((_, i) => `<span class="${i <= state.step ? "is-done" : ""}"></span>`).join("")}</div>
      <p class="panel__step ${step.levers ? "is-break" : ""}" aria-live="polite"><span>${state.step + 1} / ${story.steps.length}</span> ${esc(step.title)}</p>
      <p class="panel__desc">${gloss(step.text)}</p>
      ${step.loopAll && !step.levers && story.loop ? chainHTML(story.loop) : ""}
      ${story.loop && state.step === 0 ? stakesHTML(story.loop) : ""}
      ${step.place ? `<p class="place"><span>Where to look</span>${esc(step.place)}</p>` : ""}
      ${story.loop && state.step === 0 ? watchButton("loop:" + story.loop.id, "Watch this loop") : ""}
      ${story.loop && state.step === 0 ? evidenceHTML(story.loop, false) : ""}
      ${story.loop && isBroken(story.loop.id) ? `<p class="broken-note">✓ The actions you’ve switched on could help interrupt this cycle</p>` : ""}
      ${step.levers && story.loop.levers.length ? `<ul class="lever-list">${story.loop.levers.map(lid => leverItem(leverById[lid])).join("")}</ul>` : ""}
      ${step.levers && story.loop ? solsHTML(story.loop) : ""}
      <div class="panel__nav">
        <button class="btn btn--ghost" data-act="prev" ${state.step === 0 ? "disabled" : ""}>← Back</button>
        <button class="btn" data-act="${last ? "done" : "next"}">${last ? "Explore freely" : "Next →"}</button>
      </div>
      <button class="link" data-act="clear">Leave the guided path</button>`;
    // a loop's overview may span the wheel, so it may zoom out further to keep every step in view
    flyTo(focus, { maxK: 1.35, minK: step.loopAll ? 0.5 : 0.95, center: step.edges.length ? step.edges[step.edges.length - 1][1] : null });
  }

  /* ======================= PANEL CONTENT ======================= */
  // what each cycle costs while it keeps turning (or what breaking it saves), from LOOP_STAKES
  const stakesHTML = l => {
    if (typeof LOOP_STAKES === "undefined") return "";
    const x = LOOP_STAKES[l.id];
    if (!x) return `<p class="stakes stakes--none">${esc(STAKES_LABEL.none)}</p>`;
    const fig = (f, cls) => `<p class="stakes__n${cls}">${esc(f.n)}${f.where ? `<span class="stakes__where">${esc(f.where)}</span>` : ""}</p>
      <p class="stakes__t">${esc(f.text)} <span class="stakes__src">${extLink(f.url, f.by)}</span></p>`;
    return `<div class="stakes stakes--${x.kind}"><p class="stakes__h">${esc(STAKES_LABEL[x.kind])}</p>${fig(x, "")}
      ${x.sea ? `<div class="stakes__sea"><p class="stakes__h stakes__h--sea">In Southeast Asia</p>${fig(x.sea, " stakes__n--sea")}</div>` : ""}</div>`;
  };
  // three or four solutions from the solutions library that act on a link in the cycle (LOOP_SOLUTIONS); each opens its card
  const SOL_TYPE = { passive: "Passive cooling", active: "Active cooling", policy: "Plans, work and money" };
  const solsHTML = l => {
    const x = typeof LOOP_SOLUTIONS !== "undefined" && LOOP_SOLUTIONS[l.id]; if (!x) return "";
    const st = typeof EVIDENCE_STATUS !== "undefined" ? EVIDENCE_STATUS : {};
    const tag = e => st[e] ? `<span class="ev-tag ev-tag--${e}" title="${esc(st[e].text)}">${esc(st[e].name)}<span class="visually-hidden">: ${esc(st[e].text)}</span></span>` : "";
    return `<div class="lsols"><p class="lsols__h">Solutions to try</p>${x.note ? `<p class="lsols__note">${esc(x.note)}</p>` : ""}
      <ul>${x.items.map(i => `<li><a href="/solutions/#${esc(i.id)}" target="_blank" rel="noopener">${esc(i.name)}<span class="visually-hidden"> (opens in a new tab)</span>&nbsp;<span aria-hidden="true">↗</span></a>
        <span class="lsols__tags"><span class="sol-type sol-type--${esc(i.type)}">${esc(SOL_TYPE[i.type] || "")}</span>${tag(i.ev)}</span><small>${esc(i.why)}</small></li>`).join("")}</ul>
      <p class="lsols__foot">A suggested match, not a measured effect on the cycle. <a href="/solutions/" target="_blank" rel="noopener">All 131 solutions<span class="visually-hidden"> (opens in a new tab)</span>&nbsp;<span aria-hidden="true">↗</span></a> · <a href="/heat-economy/opportunities/#loop-${esc(l.id)}" target="_blank" rel="noopener">Business ideas for this cycle<span class="visually-hidden"> (opens in a new tab)</span>&nbsp;<span aria-hidden="true">↗</span></a></p></div>`;
  };
  const chainHTML = l => `<p class="chain">${l.path.map(id => `<span>${esc(plain(byId[id]))}</span>`).join('<i aria-hidden="true">→</i>')}<i aria-hidden="true">↺</i></p>`;

  const whoChips = v => (v.who || []).map(w => instById[w] ? `<button class="who-chip" data-inst="${w}">${esc(instById[w].name)}</button>` : "").join("");

  function leverItem(v) {
    return `<li><button class="lever-btn${state.on.has(v.id) ? " is-on" : ""}" data-lever="${v.id}">
      <span class="lever-icon" aria-hidden="true"></span>
      <span><strong>${esc(v.title)}</strong>
      <small>Cuts ${esc(plain(byId[v.edge[0]]))} → ${esc(plain(byId[v.edge[1]]))}${v.loops.length > 1 ? ` · acts on ${v.loops.length} loops` : ""}${state.on.has(v.id) ? " · <b>switched on</b>" : ""}</small>${whenTag(v)}</span>
    </button></li>`;
  }

  const loopItem = l => `<li><button class="loop-btn" data-story="${l.id}"><span class="loop-btn__name">${esc(l.name)}</span><span class="ev ev--${l.evidence}">${evidenceLabel(l.evidence)}</span></button></li>`;

  function connectionItem(e, dir) {
    const other = byId[dir === "out" ? e.to : e.from];
    const typeName = { hub: "Direct impact", direct: "Direct impact", knock: "Knock-on effect", cross: "Cross-system link", vicious: "Closes a vicious cycle" }[e.type];
    return `<li>
      <button class="conn" data-go="${other.id}" style="--c:${other.color}">
        <span class="conn__type conn__type--${e.type}" title="${typeName}" aria-hidden="true"></span>
        <span class="conn__name">${esc(plain(other))}</span>
        <span class="conn__sys">${other.kind === "leaf" && other.sys !== byId[dir === "out" ? e.from : e.to].sys ? esc(plain(sysById[other.sys])) : ""}</span>
        <span class="visually-hidden">(${typeName})</span>
      </button>
      ${e.why ? `<p class="conn__why">${gloss(e.why)}</p>` : ""}
    </li>`;
  }

  // the centre of the web carries the evidence that climate change is already adding heat
  function fingerprintBox() {
    const F = typeof LIVE_FINGERPRINT !== "undefined" ? LIVE_FINGERPRINT : null; if (!F) return "";
    return `<div class="fp-box"><p class="fp-box__h">${esc(F.mapTitle)}</p>
      <p>${esc(F.mapText)}</p>
      <p class="fp-box__season">${esc(F.season)}</p>
      <ul class="fp-box__facts">${F.facts.map(f => `<li><b>${esc(f.n)}</b> ${esc(f.text)}</li>`).join("")}</ul>
      <p class="panel__src">${esc(F.defn)} Source: ${extLink(F.source.url, F.source.label)}</p>
      <p class="fp-box__go"><a href="#heat-now">See today’s heat in twelve cities</a> · ${extLink(F.map.url, "Today’s Climate Shift Index")}</p></div>`;
  }

  function renderNode(id) {
    const n = byId[id];
    const loops = n.loops.map(lid => loopById[lid]);
    const levers = [...new Set(n.levers)].map(lid => leverById[lid]);
    const kicker = n.kind === "hub" ? "The centre of the web" : n.kind === "domain" ? "System" : plain(sysById[n.sys]);
    panelBody.innerHTML = `
      <p class="panel__kicker" style="--c:${n.color}"><span class="dot"></span>${esc(kicker)}</p>
      <h2 class="panel__title">${esc(plain(n))}</h2>
      <p class="panel__desc">${gloss(n.desc)}</p>
      ${n.kind === "hub" ? fingerprintBox() : ""}
      ${n.sources ? `<p class="panel__src">Evidence: ${n.sources.map(x => extLink(x.url, x.label)).join(" · ")}</p>` : ""}
      ${loops.length ? `<div class="loop-box"><p class="loop-box__h">Caught in ${plural(loops.length, "vicious cycle")}</p><ul class="loop-list">${loops.map(loopItem).join("")}</ul></div>` : ""}
      ${n.out.length ? `<button class="btn btn--full" data-act="ripple" data-id="${id}">Follow the ripple</button><p class="ripple-result" data-ripple-result hidden></p>` : ""}
      ${levers.length ? `<h3 class="panel__h panel__h--break">Breaking points here</h3><ul class="lever-list">${levers.map(leverItem).join("")}</ul>` : ""}
      ${n.out.length ? `<h3 class="panel__h">Sets in motion <span>${n.out.length}</span></h3><ul class="conns">${n.out.map(e => connectionItem(e, "out")).join("")}</ul>` : ""}
      ${n.in.length ? `<h3 class="panel__h">Driven by <span>${n.in.length}</span></h3><ul class="conns">${n.in.map(e => connectionItem(e, "in")).join("")}</ul>` : ""}
      <button class="link" data-act="clear">← Back to the whole web</button>`;
  }

  function renderLever(id) {
    const v = leverById[id];
    const a = byId[v.edge[0]], b = byId[v.edge[1]];
    panelBody.innerHTML = `
      <p class="panel__kicker is-break"><span class="lever-icon lever-icon--sm" aria-hidden="true"></span>Where it breaks</p>
      <h2 class="panel__title">${esc(v.title)}</h2>
      ${whenTag(v)}
      <p class="panel__desc">${gloss(v.text)}</p>
      <button class="lever-switch${state.on.has(v.id) ? " is-on" : ""}" data-act="toggle-lever" data-id="${v.id}" aria-pressed="${state.on.has(v.id)}">
        <span class="lever-switch__track" aria-hidden="true"></span>
        <span>${state.on.has(v.id) ? "Switched on: acting on " + plural(v.loops.length, "loop") : "Switch on this lever"}</span>
      </button>
      ${v.example ? `<p class="example">${gloss(v.example)}${v.exampleSources ? `<span class="example__src">Sources: ${v.exampleSources.map(x => extLink(x.url, x.label)).join(" · ")}</span>` : ""}</p>` : ""}
      <h3 class="panel__h">Who can pull this lever</h3>
      <div class="who-chips">${whoChips(v)}</div>
      <h3 class="panel__h">Already working on it</h3>
      ${orgsForLever(v.id).length ? `<ul class="org-mini">${orgsForLever(v.id).slice(0, 5).map(o => `<li>${extLink(o.url, o.name)}<p>${gloss(o.does)}</p></li>`).join("")}</ul>
        ${orgsForLever(v.id).length > 5 ? `<button class="link" data-act="orgs-lever" data-id="${v.id}">See all ${orgsForLever(v.id).length} in the heat network →</button>` : ""}`
        : `<p class="panel__note">No organisation on our list is working on this lever yet.</p>`}
      ${v.guides ? `<h3 class="panel__h">Practical guides</h3><ul class="org-mini">${v.guides.map(g => `<li>${extLink(g.url, g.title)}<p>${esc(g.by)}</p></li>`).join("")}</ul>` : ""}
      <p class="panel__note">How well does this kind of action work, and at what cost? See ${extLink("https://wmo.int/node/39067", "What Works Against Heat")}.</p>
      <h3 class="panel__h">Cuts the link</h3>
      <p class="cut"><button class="link" data-go="${a.id}">${esc(plain(a))}</button> <span aria-hidden="true">→</span> <button class="link" data-go="${b.id}">${esc(plain(b))}</button></p>
      <h3 class="panel__h">Could help interrupt ${plural(v.loops.length, "vicious cycle")}</h3>
      <ul class="loop-list">${v.loops.map(lid => loopItem(loopById[lid])).join("")}</ul>
      <button class="link" data-act="clear">← Back to the whole web</button>`;
  }

  function renderInstitution(id) {
    const inst = instById[id];
    panelBody.innerHTML = `
      <p class="panel__kicker is-break">Who can act</p>
      <h2 class="panel__title">${esc(inst.name)}</h2>
      <p class="panel__desc">${esc(inst.desc)}</p>
      <p class="inst-score"><strong>${inst.levers.length}</strong> lever${inst.levers.length === 1 ? "" : "s"} that can help break <strong>${inst.loops.size}</strong> of ${LOOPS.length} vicious cycles.</p>
      ${playbookHTML(id)}
      <div class="inst-actions">
        <button class="btn btn--full" data-act="inst-levers" data-id="${id}">Switch on all their levers</button>
        <button class="btn btn--ghost" data-act="brief" data-id="${id}">Open a printable brief</button>
        <button class="btn btn--ghost" data-act="brief-copy" data-id="${id}">Copy the brief</button>
      </div>
      <p class="cite-status" data-brief-status role="status" aria-live="polite"></p>
      <h3 class="panel__h panel__h--break">Their levers</h3>
      <ul class="lever-list">${inst.levers.map(lid => leverItem(leverById[lid])).join("")}</ul>
      <h3 class="panel__h">Loops they can help break</h3>
      <ul class="loop-list">${[...inst.loops].map(lid => loopItem(loopById[lid])).join("")}</ul>
      <button class="link" data-act="clear">← Back to the whole web</button>`;
  }

  function introHTML(mobile) {
    const groups = LOOP_GROUPS.map(g => `
      <h3 class="panel__h">${esc(g.name)}</h3>
      <ul class="loop-list">${LOOPS.filter(l => l.group === g.id).map(loopItem).join("")}</ul>`).join("");
    return `
      <p class="panel__kicker">Start anywhere</p>
      <h2 class="panel__title">Pull a thread</h2>
      <button type="button" class="btn btn--full btn--tour" data-act="tour">New here? 60-second tour <span aria-hidden="true">→</span></button>
      <p class="panel__desc">${mobile ? "Drag and pinch the map, then tap" : "Drag the map, zoom in, and click"} any dot to see what it sets in motion and what drives it. Or walk through one of the <strong>${LOOPS.length} vicious cycles</strong> and see where each one breaks:</p>
      <h3 class="panel__h panel__h--break">Break the loops</h3>
      <p class="panel__note">Switch on a policy package and watch which loops break, and who has to act.</p>
      <div class="pkg-list">${[pkgById.now, ...PACKAGES].map(p => `<button class="pkg-btn" data-pkg="${p.id}"><strong>${esc(p.title)}</strong><small>${esc(p.text)}</small></button>`).join("")}<button class="pkg-btn pkg-btn--all" data-pkg="all"><strong>Everything at once</strong><small>All ${LEVERS.length} levers</small></button></div>
      ${groups}
      <h3 class="panel__h">Across systems</h3>
      <ul class="loop-list">${Object.entries(STORIES).map(([k, s]) => `<li><button class="loop-btn loop-btn--story" data-story="${k}"><span class="loop-btn__name">${esc(s.title)}</span><span class="ev">${s.steps.length} steps</span></button></li>`).join("")}</ul>`;
  }

  const renderIntro = () => { panelBody.innerHTML = introHTML(false); };
  function openPanel() { panel.classList.add("is-open"); if (!isDesktop()) document.body.classList.add("sheet-open"); }
  function closePanel() { panel.classList.remove("is-open"); document.body.classList.remove("sheet-open"); }

  /* ======================= EVENTS ======================= */
  function onNodeActivate(id) {
    if (state.selected === id && !state.story) { clearSelection(); return; }
    select(id);
  }

  gNodes.addEventListener("keydown", ev => {
    const g = ev.target.closest(".node");
    if (g && (ev.key === "Enter" || ev.key === " ")) { ev.preventDefault(); onNodeActivate(g.dataset.id); }
  });
  gLevers.addEventListener("keydown", ev => {
    const g = ev.target.closest(".lever");
    if (g && (ev.key === "Enter" || ev.key === " ")) { ev.preventDefault(); selectLever(g.dataset.lever); }
  });
  gNodes.addEventListener("focusin", ev => {
    const g = ev.target.closest(".node");
    if (!g || state.selected || state.story || state.inst || !g.matches(":focus-visible")) return;
    const n = byId[g.dataset.id];
    animateTo(targetFor({ l: n.x - 320, r: n.x + 320, t: n.y - 240, b: n.y + 240 }, { maxK: 1.1 }), 300);
  });

  gNodes.addEventListener("pointerover", ev => {
    if (ev.pointerType !== "mouse" || state.selected || state.story || state.inst || (gesture && gesture.moved)) return;
    const g = ev.target.closest(".node"); if (!g) return;
    const { ns, es, flow } = neighbourhood(g.dataset.id);
    mark({ nodes: ns, edges: es, flow });
    g.classList.add("current");
    declutter();
  });
  gNodes.addEventListener("pointerout", ev => {
    if (ev.pointerType !== "mouse" || state.selected || state.story || state.inst) return;
    if (!ev.relatedTarget || !ev.relatedTarget.closest || !ev.relatedTarget.closest(".node")) clearMarks();
  });

  function goToMap(then) {
    const r = stage.getBoundingClientRect();
    const far = r.top < -r.height * 0.5 || r.top > window.innerHeight * 0.6;
    if (far) document.getElementById("explore").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    setTimeout(then, far && !reduceMotion ? 550 : 0);
  }

  function handleAction(ev) {
    const t = ev.target.closest("button, [data-story], [data-lever], [data-inst]");
    if (!t) return;
    // on a page of its own there is no map: open the map in its tab, at that item
    if (SUB_PAGE && !PLAN_PAGE) { const d = t.dataset, h = d.go ? d.go : d.story ? "loop-" + d.story : d.lever ? "break-" + d.lever : d.inst ? "who-" + d.inst : d.pkg ? "package-" + d.pkg : "";
      if (h) { ev.preventDefault(); const w = window.open("/#" + h, "bth-map"); if (w) try { w.focus(); } catch (e) {} return; } }
    const run = fn => panel.contains(t) ? fn() : goToMap(fn);
    if (t.dataset.go) return run(() => select(t.dataset.go));
    if (t.dataset.story) return run(() => startStory(t.dataset.story));
    if (t.dataset.lever) return run(() => selectLever(t.dataset.lever));
    if (t.dataset.inst) return run(() => selectInstitution(t.dataset.inst));
    if (t.dataset.pkg) return run(() => applyPackage(t.dataset.pkg));
    if (t.dataset.hour !== undefined) return run(() => showHour(+t.dataset.hour, t.dataset.mode));
    const act = t.dataset.act;
    if (act === "toggle-lever") { toggleLever(t.dataset.id); return; }
    if (act === "untoggle") { toggleLever(t.dataset.id, false); return; }
    if (act === "reset-levers") { state.on.clear(); state.pkg = null; applyBreakState(); clearSelection(); fitAll(); return; }
    if (act === "inst-levers") { applyLevers(instById[t.dataset.id].levers, instById[t.dataset.id].name); return; }
    if (act === "brief") { openBrief(t.dataset.id); return; }
    if (act === "orgs-lever") {
      const q = document.getElementById("org-search"), all = document.querySelector('#org-roles [data-role="all"]');
      if (all) all.click();
      if (q) { q.value = leverById[t.dataset.id].title; q.dispatchEvent(new Event("input")); }
      reveal(document.getElementById("org-list"));
      document.getElementById("network").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      return;
    }
    if (act === "film") { openFilm(t); return; }
    if (act === "tour") { goToMap(() => tourStep(0)); return; }
    if (act === "tour-next") { tourStep(state.tour + 1); return; }
    if (act === "tour-prev") { tourStep(state.tour - 1); return; }
    if (act === "tour-end") { clearSelection(); fitAll(); return; }
    if (act === "brief-copy") { copyBrief(t.dataset.id, t); return; }
    if (act === "swap-path") { const a = document.getElementById("path-from"), b = document.getElementById("path-to"); [a.value, b.value] = [b.value, a.value]; return; }
    if (act === "clear" || act === "done" || act === "close") { clearSelection(); fitAll(); }
    else if (act === "ripple") showRipple(t.dataset.id);
    else if (act === "next") { state.step++; renderStep(); }
    else if (act === "prev") { state.step--; renderStep(); }
  }
  document.addEventListener("click", ev => {
    if (ev.target.closest("#panel, #guide, #loops, #web-list, #practical, #finance, #start, #who-holds, #at-risk, #stalls, #cooling, #city, #heatwaves, #network, #breakbar, #day, #path-form, .intro")) handleAction(ev);
  });
  document.addEventListener("keydown", ev => {
    if (ev.key === "Escape" && (state.selected || state.story || state.inst || state.pkg)) { clearSelection(); fitAll(); }
  });

  need("filters").addEventListener("click", ev => {
    const b = ev.target.closest("[data-filter]"); if (!b) return;
    state.filter = b.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach(x => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    applyFilter();
  });
  need("toggle-all").addEventListener("change", ev => svg.classList.toggle("show-all", ev.target.checked));
  need("toggle-levers").addEventListener("change", ev => svg.classList.toggle("show-levers", ev.target.checked));
  const pathForm = need("path-form", "form");
  if (pathForm) pathForm.addEventListener("submit", ev => {
    ev.preventDefault();
    tracePath(document.getElementById("path-from").value, document.getElementById("path-to").value);
  });
  need("who", "select").addEventListener("change", ev => { if (ev.target.value) selectInstitution(ev.target.value); else { clearSelection(); fitAll(); } });

  document.querySelectorAll("[data-random]").forEach(b => b.addEventListener("click", () => {
    const leaves = nodes.filter(n => n.kind === "leaf");
    const pick = leaves[Math.floor(Math.random() * leaves.length)];
    goToMap(() => select(pick.id));
  }));

  let resizeTimer, lastW = window.innerWidth;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      applyCam();
      if (window.innerWidth !== lastW && !state.selected && !state.story && !state.inst) fitAll(true);
      lastW = window.innerWidth;
    }, 150);
  });

  /* ======================= BREAK THE LOOPS ======================= */
  // which vicious cycles run through each system
  SYSTEMS.forEach(s => { s.loopIds = LOOPS.filter(l => l.path.some(id => byId[id] && byId[id].sys === s.id)).map(l => l.id); });

  // earned cooling: warmth fades in proportion to the loops actually broken, never on its own
  function applyCooling(broken) {
    const overall = broken.size / LOOPS.length;
    SYSTEMS.forEach(s => {
      const share = s.loopIds.length ? s.loopIds.filter(l => broken.has(l)).length / s.loopIds.length : overall;
      if (s.warm) s.warm.style.setProperty("--heat", (1 - share).toFixed(3));
      if (s.cool) s.cool.style.setProperty("--cool", share.toFixed(3));
    });
    stage.style.setProperty("--cool", overall.toFixed(3));
  }

  const isBroken = lid => loopById[lid] && loopById[lid].levers.some(v => state.on.has(v));
  const brokenLoops = () => LOOPS.filter(l => isBroken(l.id));

  // paint the whole map to show which levers are on and which loops are broken
  function applyBreakState() {
    const broken = new Set(brokenLoops().map(l => l.id));
    LEVERS.forEach(v => v.g && v.g.classList.toggle("is-on", state.on.has(v.id)));
    edges.forEach(e => {
      if (!e.path) return;
      const cut = e.levers.some(v => state.on.has(v));
      const healed = e.loops.length > 0 && e.loops.every(l => broken.has(l));
      e.path.classList.toggle("is-cut", cut);
      e.path.classList.toggle("is-healed", healed && !cut);
      e.marker = healed || cut ? "url(#arr-healed)" : e.marker0;
      if (!e.path.classList.contains("in-loop")) e.path.setAttribute("marker-end", e.marker);
    });
    nodes.forEach(n => n.g && n.loops.length && n.g.classList.toggle("loops-broken", n.loops.every(l => broken.has(l))));
    svg.classList.toggle("break-mode", state.on.size > 0);
    applyCooling(broken);
    document.querySelectorAll("[data-break-count]").forEach(x => { x.textContent = broken.size; });
    document.querySelectorAll("[data-lever-count]").forEach(x => { x.textContent = state.on.size; });
    const meter = document.getElementById("break-meter");
    if (meter) meter.style.width = (broken.size / LOOPS.length * 100).toFixed(1) + "%";
    const reset = document.getElementById("break-reset");
    if (reset) reset.hidden = state.on.size === 0;
    document.querySelectorAll("[data-pkg]").forEach(b => {
      const ids = b.dataset.pkg === "all" ? LEVERS.map(v => v.id) : (pkgById[b.dataset.pkg] || { levers: [] }).levers;
      b.setAttribute("aria-pressed", state.pkg === b.dataset.pkg && ids.every(v => state.on.has(v)) ? "true" : "false");
    });
    document.querySelectorAll(".lrow[data-loop]").forEach(r => r.classList.toggle("is-broken", broken.has(r.dataset.loop)));
  }

  function toggleLever(id, force) {
    const on = force === undefined ? !state.on.has(id) : force;
    if (on) state.on.add(id); else state.on.delete(id);
    state.pkg = null;
    applyBreakState();
    if (state.selected === "lever:" + id) renderLever(id);
    else if (state.selected === "break") showBreak(state.breakTitle, state.breakText, true);
  }

  function applyLevers(ids, title, text) {
    state.on = new Set(ids);
    applyBreakState();
    showBreak(title, text);
  }

  function applyPackage(pid) {
    const ids = pid === "all" ? LEVERS.map(v => v.id) : (pkgById[pid] || {}).levers;
    if (!ids) return;
    const p = pkgById[pid];
    applyLevers(ids, p ? p.title : "Everything at once", p ? p.text : "Every lever on the map, switched on together.");
    state.pkg = pid;
    applyBreakState();
    setHash("package-" + pid);
  }

  function showBreak(title, text, stay) {
    state.story = null; state.inst = null; state.selected = "break";
    state.breakTitle = title; state.breakText = text;
    const loops = brokenLoops(), ns = new Set(), es = new Set();
    loops.forEach(l => l.edges.forEach(eid => { es.add(eid); const e = edgeById[eid]; ns.add(e.from); ns.add(e.to); }));
    state.on.forEach(v => { const e = edgeById[leverById[v].edgeId]; if (e) { es.add(e.id); ns.add(e.from); ns.add(e.to); } });
    mark({ nodes: ns, edges: es, levers: [...state.on] });
    renderBreakSummary(title, text);
    if (stay) return;
    beforeFocus();
    if (ns.size) flyTo([...ns], { maxK: 1.1 }); else fitAll();
  }

  function renderBreakSummary(title, text) {
    const broken = brokenLoops(), running = LOOPS.filter(l => !isBroken(l.id));
    const who = new Map();
    state.on.forEach(v => (leverById[v].who || []).forEach(w => who.set(w, (who.get(w) || 0) + 1)));
    const whoSorted = [...who.entries()].sort((a, b) => b[1] - a[1]);
    panelBody.innerHTML = `
      <p class="panel__kicker is-break">Break the loops</p>
      <h2 class="panel__title">${esc(title || "Your levers")}</h2>
      ${text ? `<p class="panel__desc">${esc(text)}</p>` : ""}
      <div class="break-score">
        <p><strong>${broken.length}</strong> of ${LOOPS.length} vicious cycles these actions could help interrupt</p>
        <div class="break-score__bar"><span style="width:${(broken.length / LOOPS.length * 100).toFixed(1)}%"></span></div>
        <small>${plural(state.on.size, "lever")} switched on · illustrative: real effect depends on reach, quality and duration</small>
      </div>
      ${whoSorted.length ? `<h3 class="panel__h panel__h--break">Who has to act</h3>
        <p class="panel__note">No single institution can deliver this. It needs <strong>${whoSorted.length} of ${INSTITUTIONS.length}</strong> institutions acting together.</p>
        <div class="who-chips">${whoSorted.map(([w, n]) => `<button class="who-chip" data-inst="${w}">${esc(instById[w].name)} <b>${n}</b></button>`).join("")}</div>` : ""}
      ${broken.length ? `<h3 class="panel__h panel__h--break">Could help interrupt</h3><ul class="loop-list loop-list--broken">${broken.map(loopItem).join("")}</ul>` : ""}
      ${running.length ? `<h3 class="panel__h">Not yet addressed</h3><ul class="loop-list">${running.map(loopItem).join("")}</ul>` : `<p class="broken-note">Every cycle on the map now has at least one action against it. This is illustrative: real effect depends on how many people an action reaches, how well it is delivered and how long it lasts.</p>`}
      ${state.on.size ? `<h3 class="panel__h">Levers switched on</h3><ul class="on-list">${[...state.on].map(v => `<li><button class="link" data-lever="${v}">${esc(leverById[v].title)}</button><button class="on-list__x" data-act="untoggle" data-id="${v}" aria-label="Switch off ${esc(leverById[v].title)}">×</button></li>`).join("")}</ul>` : ""}
      <button class="link" data-act="reset-levers">Switch everything off</button>`;
  }

  /* ======================= HOW DOES X LEAD TO Y? ======================= */
  function findPath(from, to) {
    const prev = new Map([[from, null]]), queue = [from];
    while (queue.length) {
      const cur = queue.shift();
      if (cur === to) break;
      // follow consequence-to-consequence links only, so paths don't shortcut through "extreme heat" or a system hub
      byId[cur].out.forEach(e => { if (byId[e.to].kind === "leaf" && !prev.has(e.to)) { prev.set(e.to, e); queue.push(e.to); } });
    }
    if (!prev.has(to)) return null;
    const path = [];
    for (let e = prev.get(to); e; e = prev.get(e.from)) path.unshift(e);
    return path;
  }

  function tracePath(from, to) {
    if (!byId[from] || !byId[to]) return;
    if (from === to) { select(from); return; }
    const path = findPath(from, to);
    state.story = null; state.inst = null; state.selected = "path";
    const a = byId[from], b = byId[to];
    if (!path) {
      mark({ nodes: [from, to] });
      panelBody.innerHTML = `<p class="panel__kicker">How does one thing lead to another?</p>
        <h2 class="panel__title">No path on this map</h2>
        <p class="panel__desc">Nothing on the map leads from <strong>${esc(plain(a))}</strong> to <strong>${esc(plain(b))}</strong>. Try it the other way round, or tell us the link that’s missing.</p>
        <button class="link" data-act="clear">← Back to the whole web</button>`;
    } else {
      const ns = new Set([from]), es = new Set();
      path.forEach(e => { ns.add(e.to); es.add(e.id); });
      mark({ nodes: ns, edges: es, flow: es });
      byId[to].g.classList.add("current"); byId[from].g.classList.add("current");
      declutter();
      const systems = new Set([...ns].filter(id => byId[id].kind === "leaf").map(id => byId[id].sys));
      panelBody.innerHTML = `<p class="panel__kicker">How does one thing lead to another?</p>
        <h2 class="panel__title">${esc(plain(a))} → ${esc(plain(b))}</h2>
        <p class="panel__desc">The shortest chain on the map: <strong>${plural(path.length, "step")}</strong> across <strong>${plural(systems.size, "system")}</strong>.</p>
        <ol class="path-steps">${path.map(e => `<li><button class="link" data-go="${e.to}">${esc(plain(byId[e.to]))}</button>${e.why ? `<p>${esc(e.why)}</p>` : `<p>${esc(plain(byId[e.from]))} affects ${esc(plain(byId[e.to]).toLowerCase())}.</p>`}</li>`).join("")}</ol>
        <button class="link" data-act="clear">← Back to the whole web</button>`;
    }
    beforeFocus();
    flyTo(path ? [from, ...path.map(e => e.to)] : [from, to], { maxK: 1.2 });
  }

  /* ======================= PLAYBOOKS AND BRIEFS ======================= */
  const STAGES = [["sense", "Sense"], ["decide", "Decide"], ["act", "Act"], ["sustain", "Sustain"]];
  function playbookHTML(id) {
    const pb = typeof PLAYBOOKS !== "undefined" && PLAYBOOKS[id]; if (!pb) return "";
    return `<h3 class="panel__h">Their protection chain</h3>
      <ol class="chain4">${STAGES.map(([k, label], i) => `<li><span class="chain4__n">${i + 1}</span><div><strong>${label}</strong><p>${esc(pb[k])}</p></div></li>`).join("")}</ol>`;
  }

  function partnersOf(id) {
    const m = new Map();
    instById[id].levers.forEach(v => (leverById[v].who || []).forEach(w => { if (w !== id) m.set(w, (m.get(w) || 0) + 1); }));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([w, n]) => ({ inst: instById[w], n }));
  }

  function briefData(id) {
    const inst = instById[id], pb = (typeof PLAYBOOKS !== "undefined" && PLAYBOOKS[id]) || {};
    return { inst, pb, levers: inst.levers.map(v => leverById[v]), loops: [...inst.loops].map(l => loopById[l]), partners: partnersOf(id),
      url: location.origin + location.pathname + "#who-" + id };
  }

  function briefText(id) {
    const d = briefData(id);
    const L = [];
    L.push(`BREAKING THE LOOPS OF EXTREME HEAT`, `A brief for: ${d.inst.name}`, `From the Common Shade systems map: ${d.url}`, "");
    L.push(`The UN has called for urgent action on extreme heat. On this map, ${d.inst.name.toLowerCase()} hold ${plural(d.levers.length, "lever")} that can help break ${d.loops.length} of the ${LOOPS.length} vicious cycles that make heat worse.`, "");
    L.push("YOUR PROTECTION CHAIN");
    STAGES.forEach(([k, label]) => d.pb[k] && L.push(`${label}: ${d.pb[k]}`));
    L.push("", "YOUR LEVERS");
    d.levers.forEach(v => { L.push(`- ${v.title} [${WHEN[v.when] || ""}]: ${v.text} (Cuts ${plain(byId[v.edge[0]])} → ${plain(byId[v.edge[1]])}; could help interrupt ${v.loops.map(l => loopById[l].name).join(", ") || "no mapped loop"}.)`); if (v.example) L.push(`  Example: ${v.example}`); (v.exampleSources || []).forEach(x => L.push(`  Source: ${x.label}: ${x.url}`)); (v.guides || []).forEach(g => L.push(`  Guide: ${g.title} (${g.by}): ${g.url}`)); });
    L.push("", "LOOPS YOU CAN HELP INTERRUPT");
    d.loops.forEach(l => { L.push(`- ${l.name} (${evidenceLabel(l.evidence)}): ${l.summary}`); evidenceOf(l.id).forEach(x => L.push(`  Evidence: ${x.by}, “${x.title}”: ${x.finding} ${x.url}${x.limit ? ` (${x.type}; ${x.where}. Limit: ${x.limit})` : ""}`)); });
    if (d.partners.length) { L.push("", "WHO TO WORK WITH", `These institutions share your levers: ${d.partners.map(p => p.inst.name).join(", ")}.`); }
    L.push("", "This map is large, but the real web is larger. Loops marked “Evidence emerging” have evidence for each link; the full cycle has been studied less.");
    return L.join("\n");
  }

  function openBrief(id) {
    track("brief-" + id);
    const d = briefData(id);
    const css = `body{font-family:"Hanken Grotesk",Segoe UI,Arial,sans-serif;color:#16202B;max-width:760px;margin:40px auto;padding:0 24px;line-height:1.55}
      h1{font-family:Anton,Impact,sans-serif;font-weight:400;text-transform:uppercase;font-size:40px;line-height:1;margin:6px 0 4px}
      .k{color:#B8401A;font-weight:700;letter-spacing:.14em;text-transform:uppercase;font-size:12px}.sub{color:#5E6570}
      h2{font-size:13px;letter-spacing:.12em;text-transform:uppercase;border-top:2px solid #16202B;padding-top:10px;margin-top:28px}
      .chain{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.chain div{border-top:4px solid #1F7A70;padding-top:8px}
      .chain b{display:block;color:#1F7A70}li{margin:8px 0}.when{display:inline-block;padding:1px 8px;border-radius:999px;background:#E8F2F0;color:#1F7A70;font-size:12px;font-weight:700}a{color:#1F7A70}.ex{color:#5E6570;font-size:14px}.ev{font-size:12px;color:#5E6570}
      .bar{height:8px;background:#E3EEEC;border-radius:4px;margin:8px 0}.bar span{display:block;height:100%;background:#1F7A70;border-radius:4px}
      .print{position:fixed;top:16px;right:16px;padding:10px 18px;border-radius:999px;border:0;background:#F26430;font-weight:700;cursor:pointer}
      @media print{.print{display:none}body{margin:0}} @media(max-width:600px){.chain{grid-template-columns:1fr 1fr}}`;
    const h = s => esc(s);
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Heat brief: ${h(d.inst.name)}</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap"><style>${css}</style></head><body>
      <button class="print" onclick="window.print()">Print or save as PDF</button>
      <p class="k">The UN calls for urgent action on extreme heat</p><h1>Breaking the loops of extreme heat</h1>
      <p class="sub">A brief for <strong>${h(d.inst.name)}</strong> · from the Common Shade systems map · <a href="${h(d.url)}">${h(d.url)}</a></p>
      <p>Extreme heat is an urgent and growing threat. On this map, ${h(d.inst.name.toLowerCase())} hold <strong>${plural(d.levers.length, "lever")}</strong> that can help break <strong>${d.loops.length} of the ${LOOPS.length}</strong> vicious cycles that make heat worse.</p>
      <div class="bar"><span style="width:${(d.loops.length / LOOPS.length * 100).toFixed(1)}%"></span></div>
      <h2>Your protection chain</h2><div class="chain">${STAGES.map(([k, l]) => `<div><b>${l}</b>${h(d.pb[k] || "")}</div>`).join("")}</div>
      <h2>Your levers</h2><ul>${d.levers.map(v => `<li><strong>${h(v.title)}.</strong> <span class="when">${h(WHEN[v.when] || "")}</span> ${h(v.text)}<br><span class="ex">Cuts ${h(plain(byId[v.edge[0]]))} → ${h(plain(byId[v.edge[1]]))}. Could help interrupt: ${h(v.loops.map(l => loopById[l].name).join(", ") || "no mapped loop")}.${v.example ? " Example: " + h(v.example) : ""}${(v.exampleSources || []).map(x => `<br>Source: ${h(x.label)}, ${h(x.url)}`).join("")}${(v.guides || []).map(g => `<br>Guide: ${h(g.title)} (${h(g.by)}), ${h(g.url)}`).join("")}</span></li>`).join("")}</ul>
      <h2>Loops you can help break</h2><ul>${d.loops.map(l => `<li><strong>${h(l.name)}</strong> <span class="ev">(${evidenceLabel(l.evidence)})</span><br>${h(l.summary)}${evidenceOf(l.id).map(x => `<br><span class="ex">Evidence: <a href="${h(x.url)}">${h(x.title)}</a> (${h(x.by)}). ${h(x.finding)}${x.limit ? ` <em>${h(x.type)}, ${h(x.where)}. Limit: ${h(x.limit)}</em>` : ""}</span>`).join("")}</li>`).join("")}</ul>
      ${d.partners.length ? `<h2>Who to work with</h2><p>These institutions share your levers: ${d.partners.map(p => h(p.inst.name)).join(", ")}. No single institution can break these loops alone.</p>` : ""}
      <p class="ev" style="margin-top:32px">This map is large, but the real web is larger. Loops marked “Evidence emerging” have evidence for each link; the full cycle has been studied less.</p>
      </body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    const w = window.open(url, "_blank");
    if (!w) { const a = document.createElement("a"); a.href = url; a.download = `heat-brief-${id}.html`; document.body.appendChild(a); a.click(); a.remove(); }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  async function copyBrief(id, btn) {
    const status = panelBody.querySelector("[data-brief-status]");
    let ok = false;
    try { await navigator.clipboard.writeText(briefText(id)); ok = true; } catch (e) { ok = false; }
    if (status) status.textContent = ok ? "Brief copied. Paste it into an email or document." : "Couldn’t copy. Use “Open a printable brief” instead.";
  }

  /* ======================= PLAN A RESPONSE ======================= */
  const PG = typeof PLAN_GROUPS !== "undefined" ? PLAN_GROUPS : [];
  const PAYERS = typeof PLAN_PAYERS !== "undefined" ? PLAN_PAYERS : ["Not decided yet"];
  const EXAMPLES = typeof WORKED_EXAMPLES !== "undefined" ? WORKED_EXAMPLES : [];
  const STALL_LIST = typeof STALLS !== "undefined" ? STALLS : [];
  const PLAN_KEY = "bth-plan-v1";
  let plan = { place: "", group: "", levers: [], rows: {}, example: null, stalls: [], triggers: {}, review: "", exposure: [], finance: {}, reviewLog: {} };
  try { const saved = JSON.parse(localStorage.getItem(PLAN_KEY) || "null"); if (saved && Array.isArray(saved.levers)) plan = Object.assign(plan, saved); if (!Array.isArray(plan.stalls)) plan.stalls = []; if (!plan.triggers || typeof plan.triggers !== "object") plan.triggers = {}; if (!Array.isArray(plan.exposure)) plan.exposure = []; if (!plan.finance || typeof plan.finance !== "object") plan.finance = {}; } catch (e) {}
  const savePlan = () => { try { localStorage.setItem(PLAN_KEY, JSON.stringify(plan)); } catch (e) {} if (!PLAN_PAGE) renderPlanLaunch(); };
  const PHASES = typeof PLAN_PHASES !== "undefined" ? PLAN_PHASES : [], PHASE_DEF = typeof PLAN_PHASE_DEFAULT !== "undefined" ? PLAN_PHASE_DEFAULT : {};
  const phaseById = Object.fromEntries(PHASES.map(x => [x.id, x]));
  const BASES = typeof PLAN_TRIGGER_BASES !== "undefined" ? PLAN_TRIGGER_BASES : [], LEVELS = typeof PLAN_LEVELS !== "undefined" ? PLAN_LEVELS : [];
  const CHANNELS = typeof PLAN_CHANNELS !== "undefined" ? PLAN_CHANNELS : [], WHOEL = typeof WHO_ELEMENTS !== "undefined" ? WHO_ELEMENTS : [];
  const planRow = id => { const r = plan.rows[id] || (plan.rows[id] = { lead: (leverById[id].who || [])[0] || "", payer: PAYERS[0], measure: "" });
    if (!r.phase) r.phase = PHASE_DEF[id] || "year"; return r; };
  const trig = () => plan.triggers || (plan.triggers = {});
  const EXPO = typeof PLAN_EXPOSURE !== "undefined" ? PLAN_EXPOSURE : [], W2A = typeof PLAN_W2A !== "undefined" ? PLAN_W2A : [];
  const w2a = lv => { const t = trig(), w = t.w2a || (t.w2a = {}); return w[lv] || (w[lv] = {}); };
  const instName = id => instById[id] ? instById[id].name : "";
  // a level counts as covered once someone is named to act on it
  const w2aDone = () => LEVELS.filter(l => ((trig().w2a || {})[l.id] || {}).act).length;
  const expoOn = () => EXPO.filter(x => plan.exposure.includes(x.id));
  const DELIVER = typeof PLAN_DELIVER !== "undefined" ? PLAN_DELIVER : [], TWOWAY = typeof PLAN_TWOWAY !== "undefined" ? PLAN_TWOWAY : [], RLOG = typeof PLAN_REVIEWLOG !== "undefined" ? PLAN_REVIEWLOG : [];
  const deliverOf = id => { const r = planRow(id); return r.deliver || (r.deliver = {}); };
  const deliverDone = id => DELIVER.filter(f => (planRow(id).deliver || {})[f.id]).length;
  const twoway = () => trig().twoway || (trig().twoway = {});
  const rlog = () => plan.reviewLog || (plan.reviewLog = {});
  function renderPlanReviewLog() {
    const box = document.getElementById("plan-reviewlog"); if (!box || !RLOG.length) return;
    box.innerHTML = `<details class="plan-w2a plan-rlog"${RLOG.some(f => rlog()[f.id]) ? " open" : ""}><summary>After the season: what changed <span>record it, then change the plan</span></summary>
      <fieldset class="plan-w2a__lv plan-fin__path"><legend>Review</legend>${RLOG.map(f => `<label>${esc(f.name)} <input type="text" data-pl-rlog="${f.id}" value="${esc(rlog()[f.id] || "")}" placeholder="${esc(f.placeholder)}"></label>`).join("")}</fieldset></details>`;
  }
  // paying for protection (part 30): a route and an arrival date for each need, and the path money takes to people
  const FIN = typeof FINANCE !== "undefined" ? FINANCE : null;
  const fin = () => plan.finance || (plan.finance = {});
  const finNeed = id => { const n = fin().needs || (fin().needs = {}); return n[id] || (n[id] = {}); };
  const finPath = () => fin().path || (fin().path = {});
  const finDone = () => FIN ? FIN.needs.filter(n => ((fin().needs || {})[n.id] || {}).route).length : 0;
  function finHTML() {
    if (!FIN) return "";
    return `<details class="plan-w2a plan-fin"${finDone() ? " open" : ""}><summary>Paying for protection <span>${finDone()} of ${FIN.needs.length} needs with a route</span></summary>
      <p class="plan-step__hint">${esc(FIN.intro)} <a href="/finance/" target="_blank" rel="noopener">How the routes compare<span class="visually-hidden"> (opens in a new tab)</span></a></p>
      ${FIN.needs.map(n => { const v = finNeed(n.id); return `<fieldset class="plan-w2a__lv plan-fin__need"><legend>${esc(n.need)}</legend>
        <label>Route, and who holds the money <input type="text" data-pl-fin="need:${n.id}:route" value="${esc(v.route || "")}" placeholder="e.g. ${esc(n.route.toLowerCase())}"></label>
        <label>Money must arrive by <input type="text" data-pl-fin="need:${n.id}:by" value="${esc(v.by || "")}" placeholder="${esc(n.ask)}"></label></fieldset>`; }).join("")}
      <fieldset class="plan-w2a__lv plan-fin__path"><legend>If money passes through someone else first</legend>
        ${FIN.fields.map(f => `<label>${esc(f.name)} <input type="text" data-pl-fin="path:${f.id}" value="${esc(finPath()[f.id] || "")}" placeholder="${esc(f.placeholder)}"></label>`).join("")}
      </fieldset>
      <p class="plan-ladder__k">Will it survive the next season?</p><ul class="plan-exposure__prompts">${FIN.survive.map(q => `<li>${esc(q)}</li>`).join("")}</ul></details>`;
  }
  function renderPlanFin() { const box = document.getElementById("plan-fin"); if (box) box.innerHTML = finHTML(); }

  // step 1: exposure questions; each one ticked adds something to discuss, never a score
  function renderPlanExposure() {
    const box = document.getElementById("plan-exposure-list"); if (!box || !EXPO.length) return;
    const on = expoOn();
    box.innerHTML = `<p class="plan-step__hint">Tick what applies to the people you are protecting. Each one adds something to discuss to your plan.</p>
      <div class="plan-exposure__qs">${EXPO.map(x => `<label class="plan-check"><input type="checkbox" data-pl-expo="${x.id}"${plan.exposure.includes(x.id) ? " checked" : ""}><span>${esc(x.q)}</span></label>`).join("")}</div>
      ${on.length ? `<p class="plan-ladder__k">To discuss</p><ul class="plan-exposure__prompts">${on.map(x => `<li>${esc(x.prompt)}</li>`).join("")}</ul>` : ""}
      <p class="plan-exposure__note">Heat strain depends on the weather, the work and the person together. <a href="#strain">See weather, work and the person</a>.</p>`;
  }
  // cooling assets (part 20) need someone to keep them working after year one
  const ASSETS = typeof COOL_ASSET_LEVERS !== "undefined" ? COOL_ASSET_LEVERS : [];
  const isAsset = id => ASSETS.includes(id);
  const noUpkeep = () => plan.levers.filter(id => isAsset(id) && !(planRow(id).upkeep || "").trim());
  const planLoops = () => LOOPS.filter(l => l.levers.some(v => plan.levers.includes(v)));
  const suggested = () => ((PG.find(g => g.id === plan.group) || {}).levers || []);

  function renderPlanActions() {
    const box = document.getElementById("plan-actions"); if (!box) return;
    const sugg = suggested();
    box.innerHTML = Object.entries(WHEN).map(([w, label]) => {
      const vs = LEVERS.filter(v => v.when === w).sort((a, b) => sugg.includes(b.id) - sugg.includes(a.id));
      return `<div class="plan-actions__group"><p class="plan-actions__h">${esc(label)}</p>
        ${vs.map(v => `<label class="plan-check${sugg.includes(v.id) ? " is-suggested" : ""}"><input type="checkbox" data-pl-lever="${v.id}"${plan.levers.includes(v.id) ? " checked" : ""}>
          <span>${esc(v.title)}${sugg.includes(v.id) ? ' <em>Suggested</em>' : ""}</span></label>`).join("")}</div>`;
    }).join("");
  }

  function renderPlanRows() {
    const box = document.getElementById("plan-rows"); if (!box) return;
    if (!plan.levers.length) { box.innerHTML = `<p class="plan-step__hint">Choose at least one action above.</p>`; return; }
    box.innerHTML = plan.levers.map(id => {
      const v = leverById[id], r = planRow(id);
      const leads = [...new Set([...(v.who || []), ...INSTITUTIONS.map(i => i.id)])];
      return `<div class="plan-row" data-pl-row="${id}">
        <p class="plan-row__title">${esc(v.title)} ${whenTag(v)}${LADDER.length ? ladderDots(rowCounts(r)) : ""}</p>
        <label>Who leads <select data-pl-field="lead">${leads.map(i => `<option value="${i}"${r.lead === i ? " selected" : ""}>${esc(instById[i].name)}${(v.who || []).includes(i) ? "" : " (not usual)"}</option>`).join("")}</select></label>
        <label>Who pays <select data-pl-field="payer">${PAYERS.map(p => `<option${r.payer === p ? " selected" : ""}>${esc(p)}</option>`).join("")}</select></label>
        ${PHASES.length ? `<label>When it happens <select data-pl-field="phase">${PHASES.map(x => `<option value="${x.id}"${r.phase === x.id ? " selected" : ""}>${esc(x.name)}</option>`).join("")}</select></label>` : ""}
        ${LADDER.length ? (() => { const c = rowCounts(r); return `<label>Where it stands <select data-pl-field="status">${LADDER.map(x => `<option value="${x.id}"${(r.status || "proposed") === x.id ? " selected" : ""}>${esc(x.name)}</option>`).join("")}</select></label>
        ${lRank(r.status) >= lRank("agreed") ? `<label class="plan-row__wide">What shows this? <input type="text" data-pl-field="ev" value="${esc(r.ev || "")}" placeholder="e.g. signed minutes of 3 March; a budget line; a photo of it working"></label>` : ""}
        ${c !== (r.status || "proposed") ? `<p class="plan-row__warn plan-row__wide">Counts as discussed until there is evidence.</p>` : ""}`; })() : ""}
        <label class="plan-row__wide">How you will know it is working <input type="text" data-pl-field="measure" value="${esc(r.measure)}" placeholder="e.g. ${esc(v.measure || "")}"></label>
        ${isAsset(id) ? `<label class="plan-row__wide">Who keeps it working after year one, and from which budget? <input type="text" data-pl-field="upkeep" value="${esc(r.upkeep || "")}" placeholder="e.g. the ward office, from the parks maintenance budget"></label>` : ""}
        ${DELIVER.length ? `<details class="plan-row__deliver plan-row__wide"${deliverDone(id) ? " open" : ""}><summary>Can we deliver this? <span>${deliverDone(id)} of ${DELIVER.length} answered</span></summary>
          <div class="plan-row__deliver-f">${DELIVER.map(f => `<label>${esc(f.name)} <input type="text" data-pl-del="${f.id}" value="${esc(deliverOf(id)[f.id] || "")}" placeholder="${esc(f.placeholder)}"></label>`).join("")}</div></details>` : ""}
      </div>`;
    }).join("");
  }

  const planStalls = () => STALL_LIST.filter(x => plan.stalls.includes(x.id));
  function renderPlanStalls() {
    const box = document.getElementById("plan-stalls"); if (!box) return;
    box.innerHTML = STALL_LIST.map(x => `<label class="plan-check"><input type="checkbox" data-pl-stall="${x.id}"${plan.stalls.includes(x.id) ? " checked" : ""}><span>${esc(x.name)}</span></label>`).join("");
  }

  // step 4: what alerts are based on, the three levels and the actions each switches on, who issues them and how they reach people
  function renderPlanTriggers() {
    const box = document.getElementById("plan-triggers"); if (!box || !BASES.length) return;
    const t = trig(), base = BASES.find(b => b.id === t.basis), ch = t.channels || [];
    const leads = INSTITUTIONS.map(i => `<option value="${i.id}"${(t.issuer || "met") === i.id ? " selected" : ""}>${esc(i.name)}</option>`).join("");
    box.innerHTML = `<div class="plan-step__row">
        <label>Alerts are based on <select data-pl-trig="basis"><option value="">Choose…</option>${BASES.map(b => `<option value="${b.id}"${t.basis === b.id ? " selected" : ""}>${esc(b.name)}</option>`).join("")}</select></label>
        <label>Who issues the alert <select data-pl-trig="issuer">${leads}</select></label>
      </div>
      ${base ? `<p class="plan-eg">${gloss(base.eg)} <span class="plan-eg__src">${base.sources.map(x => extLink(x.url, x.label)).join(" · ")}</span></p>` : `<p class="plan-step__hint">Pick one to see how places in Asia set theirs.</p>`}
      <div class="plan-ladder">${LEVELS.map(l => { const acts = plan.levers.filter(id => planRow(id).phase === l.id);
        return `<div class="plan-ladder__lv plan-ladder__lv--${l.id}">
          <label><span class="plan-ladder__name">${esc(l.name)} · ${esc(l.meaning)}</span><input type="text" data-pl-trig="${l.id}" value="${esc(t[l.id] || "")}" placeholder="${esc(l.placeholder)}"></label>
          <p class="plan-ladder__acts">${acts.length ? "Switches on: " + acts.map(id => esc(leverById[id].title)).join(", ") : "No actions start at this level yet. Set “When it happens” in step 3."}</p>
        </div>`; }).join("")}</div>
      ${W2A.length ? `<details class="plan-w2a"${w2aDone() ? " open" : ""}><summary>Warning-to-action table <span>${w2aDone()} of ${LEVELS.length} levels with someone named to act</span></summary>
        <p class="plan-step__hint">A warning works when everyone knows who moves, who pays, by when, and what happens if the first plan fails.</p>
        ${LEVELS.map(l => { const w = w2a(l.id); return `<fieldset class="plan-w2a__lv plan-ladder__lv--${l.id}"><legend>${esc(l.name)} · ${esc(l.meaning)}</legend>
          ${W2A.map(f => f.id === "decide" ? `<label>${esc(f.name)} <select data-pl-w2a="${l.id}:decide"><option value="">Choose…</option>${INSTITUTIONS.map(i => `<option value="${i.id}"${w.decide === i.id ? " selected" : ""}>${esc(i.name)}</option>`).join("")}</select></label>`
            : f.id === "pay" ? `<label>${esc(f.name)} <select data-pl-w2a="${l.id}:pay">${PAYERS.map(p => `<option${(w.pay || PAYERS[0]) === p ? " selected" : ""}>${esc(p)}</option>`).join("")}</select></label>`
            : `<label>${esc(f.name)} <input type="text" data-pl-w2a="${l.id}:${f.id}" value="${esc(w[f.id] || "")}" placeholder="${esc(f.placeholder || "")}"></label>`).join("")}
        </fieldset>`; }).join("")}</details>` : ""}
      ${TWOWAY.length ? `<div class="plan-paytrig"><p class="plan-ladder__k">Warnings that work both ways <span>A warning is the start of a conversation: people need an action with it and a way to say what is missing.</span></p>
        ${TWOWAY.map(f => `<label>${esc(f.name)} <input type="text" data-pl-two="${f.id}" value="${esc(twoway()[f.id] || "")}" placeholder="${esc(f.placeholder)}"></label>`).join("")}</div>` : ""}
      ${FIN ? `<div class="plan-paytrig"><p class="plan-ladder__k">Insurance or cash triggers, if any <span>${esc(FIN.triggersNote)}</span></p>
        <label>Payout trigger and its data source <input type="text" data-pl-fin="payout" value="${esc(fin().payout || "")}" placeholder="e.g. district maximum above a set threshold, from the weather service"></label>
        <label>${esc(FIN.basis.ask)} <input type="text" data-pl-fin="nopay" value="${esc(fin().nopay || "")}" placeholder="e.g. the city’s heat relief fund for workers outside the trigger area"></label></div>` : ""}
      <p class="plan-ladder__k">How warnings reach people <span>The ones marked ✱ reach people without a phone or signal.</span></p>
      <div class="plan-channels">${CHANNELS.map(c => `<label class="plan-check"><input type="checkbox" data-pl-chan="${c.id}"${ch.includes(c.id) ? " checked" : ""}><span>${esc(c.name)}${c.offline ? " ✱" : ""}</span></label>`).join("")}</div>
      ${LIVE.length ? `<div class="plan-live"><p class="plan-ladder__k">Test your alert levels against this week’s forecast</p>
        <label>City <select data-pl-live><option value="">Choose a city…</option>${LIVE.map(c => `<option value="${c.id}"${plan.liveCity === c.id ? " selected" : ""}>${esc(c.name)}, ${esc(c.country)}</option>`).join("")}</select></label>
        <div id="plan-live-out" aria-live="polite"></div></div>` : ""}`;
    renderPlanLive();
  }

  // the next seven days for one city, against the plan's alert levels, and what each day would switch on
  function renderPlanLive() {
    const box = document.getElementById("plan-live-out"); if (!box) return;
    const city = LIVE.find(c => c.id === plan.liveCity);
    if (!city) { box.innerHTML = `<p class="plan-step__hint">Pick one of the twelve cities in “Heat right now” to see which days this week would reach your alert levels.</p>`; return; }
    const t = trig(), num = v => { const m = String(v || "").replace(",", ".").match(/-?\d+(\.\d+)?/); return m ? parseFloat(m[0]) : NaN; };
    const lv = LEVELS.map(l => ({ l, thr: num(t[l.id]) })).filter(x => isFinite(x.thr)).sort((a, b) => a.thr - b.thr);
    const feels = t.basis === "index" || t.basis === "wbgt";
    const metric = feels ? "feels-like maximum" : "forecast daily maximum";
    const wb = t.basis === "wbgt";
    const note = wb ? "Your levels are in WBGT, which runs well below feels-like temperatures, and this feed has no WBGT forecast, so the days are shown without alerts. Ask your weather service for a WBGT forecast to test them."
      : t.basis === "index" ? "Feels-like (apparent temperature) is close to, but not the same as, a heat index." : !t.basis ? "Choose what your alerts are based on above. Until then, the check uses the forecast daily maximum." : "";
    box.innerHTML = `<p class="plan-step__hint">Loading the forecast for ${esc(city.name)}…</p>`;
    liveFetch().then(data => {
      const d = data.cities[city.id];
      if (!d || !d.days.length) throw new Error("none");
      if (!lv.length && !wb) { box.innerHTML = `<p class="plan-step__hint">Type a temperature in at least one alert level above, for example “40 °C”, to test it against ${esc(city.name)}’s forecast.</p>`; return; }
      const rows = d.days.map(x => { const v = feels ? x.feelsMax : x.max, hit = wb ? null : lv.filter(y => v >= y.thr).pop();
        const acts = hit ? plan.levers.filter(id => planRow(id).phase === hit.l.id).map(id => leverById[id].title) : [];
        return { x, v, hit, acts }; });
      const reached = rows.filter(r => r.hit).length;
      box.innerHTML = `<p class="plan-live__sum">${wb ? `This week’s feels-like maximum in ${esc(city.name)}. <b>WBGT alert levels can’t be tested against this feed.</b>` : `<b>${reached ? `${plural(reached, "day")} of ${rows.length}` : "No day"}</b> this week ${reached === 1 ? "reaches" : "reach"} one of your alert levels in ${esc(city.name)}, on the ${metric}.`}</p>
        <table class="plan-live__t"><thead><tr><th>Day</th><th>${feels ? "Feels like" : "Max"}</th><th>Alert</th><th>Switches on</th></tr></thead><tbody>
        ${rows.map(r => `<tr><td>${esc(new Date(r.x.date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }))}</td><td>${deg(r.v)}</td>
          <td>${r.hit ? `<span class="lv lv--${r.hit.l.id}"></span>${esc(r.hit.l.name)}` : `<span class="plan-live__no">${wb ? "Not tested" : "Below"}</span>`}</td>
          <td>${r.hit ? (r.acts.length ? esc(r.acts.join(", ")) : "Nothing yet: set “When it happens” in step 3") : ""}</td></tr>`).join("")}</tbody></table>
        <p class="plan-checklist__src">${note ? esc(note) + " " : ""}Model forecast, not an official warning: follow ${extLink(city.warn.url, city.warn.label)}. ${liveCredit()}.</p>`;
    }).catch(() => { box.innerHTML = `<p class="plan-step__hint">The forecast could not be loaded just now. Try again later, or check ${extLink(city.warn.url, city.warn.label)}.</p>`; });
  }

  // step 6: WHO/Europe's eight core elements, checked against what the plan contains
  const pick = ids => ids.filter(id => plan.levers.includes(id));
  function whoCheck() {
    const rows = plan.levers.map(id => planRow(id)), t = trig(), ch = t.channels || [];
    const unpaid = rows.filter(r => r.payer === "Not decided yet").length, undoc = rows.filter(r => r.payer === "Not documented").length, allLead = rows.length && rows.every(r => r.lead);
    const levels = LEVELS.filter(l => (t[l.id] || "").trim()).length, onAlert = plan.levers.filter(id => ["yellow", "orange", "red"].includes(planRow(id).phase)).length;
    const typed = rows.filter(r => (r.measure || "").trim()).length, review = (plan.review || "").trim();
    const offline = CHANNELS.some(c => c.offline && ch.includes(c.id));
    const R = {
      governance: () => { const hap = plan.levers.includes("hap"), miss = [];
        if (!hap) miss.push("no coordinating heat action plan"); if (!allLead) miss.push("not every action has a lead"); if (unpaid) miss.push(plural(unpaid, "action") + " with nobody paying yet"); if (undoc) miss.push(plural(undoc, "action") + " where who pays is not documented");
        return [!rows.length ? "no" : miss.length ? (hap || allLead ? "part" : "no") : "yes", miss.length ? "Missing: " + miss.join("; ") + "." : "A coordinating plan, an owner for every action, and money agreed."]; },
      warning: () => { const miss = [];
        if (!t.basis) miss.push("what alerts are based on"); if (!levels) miss.push("the alert levels"); if (!onAlert) miss.push("actions that start at an alert");
        return [miss.length === 3 ? "no" : miss.length ? "part" : "yes", miss.length ? "Missing: " + miss.join("; ") + "." : `${plural(levels, "alert level")} set, switching on ${plural(onAlert, "action")}.`]; },
      risk: () => { const g = PG.find(x => x.id === plan.group), r = pick(["coolingcentres", "socialprotection", "heatcash", "freecare", "keepinschool", "coolnights", "heatrules", "coolhousing", "affordablecool", "anticipatory"]);
        return [g && r.length ? "yes" : g || r.length ? "part" : "no", g && r.length ? `Protecting ${g.name.toLowerCase()}, with ${plural(r.length, "targeted action")}.` : g ? "Add an action that reaches them directly." : "Choose who you are protecting in step 1."]; },
      comms: () => [ch.length >= 2 && offline ? "yes" : ch.length ? "part" : "no", ch.length >= 2 && offline ? `${plural(ch.length, "channel")}, including at least one that needs no phone.` : ch.length ? "Add a channel that reaches people without a phone or signal." : "Choose how warnings reach people in step 4."],
      health: () => plan.levers.includes("readyclinics") ? ["yes", "Health services prepared for heat."] : plan.levers.includes("freecare") ? ["part", "Free care is in; clinics also need staff, cooling and surge plans."] : ["no", "No action prepares clinics and hospitals."],
      exposure: () => { const now = pick(["heatrules", "coolingcentres", "coolnights", "affordablecool"]), later = pick(["coolhousing", "coolbydesign", "greencity", "keepgreen"]);
        return [now.length && later.length ? "yes" : now.length || later.length ? "part" : "no", now.length && later.length ? "Relief this season and cooler places for the long term." : now.length ? "Add a long-term action: cooler housing, buildings or streets." : later.length ? "Add relief for this season: work rules, cooling spaces or cool nights." : "No action reduces how much heat people are exposed to."]; },
      surveillance: () => plan.levers.includes("countdeaths") ? ["yes", "Heat illness and excess deaths will be counted."] : ["no", "Nothing tracks heat illness and excess deaths during the season."],
      mel: () => [rows.length && typed === rows.length && review ? "yes" : typed || review ? "part" : "no", rows.length && typed === rows.length && review ? `A measure for every action, and a review set for ${review}.` : `${typed} of ${rows.length} actions have a measure you typed${review ? "" : "; no review date set"}.`]
    };
    return WHOEL.map(e => { const [st, note] = (R[e.id] || (() => ["no", ""]))(); return { e, st, note }; });
  }
  const ST = { yes: "In place", part: "Partly", no: "Missing" };
  function renderPlanCheck() {
    const box = document.getElementById("plan-check"); if (!box || !WHOEL.length) return;
    const res = whoCheck();
    box.innerHTML = `<ol class="who-check">${res.map(({ e, st, note }) => { const adds = (e.add || []).filter(id => !plan.levers.includes(id) && leverById[id]);
      return `<li class="who-check__i who-check__i--${st}">
        <p class="who-check__top"><span class="who-check__st">${ST[st]}</span><strong>${esc(e.name)}</strong></p>
        <p class="who-check__why">${esc(e.why)}</p>
        <p class="who-check__note">${esc(note)}</p>
        ${st !== "yes" ? `<p class="who-check__fix">${adds.map(id => `<button type="button" class="btn btn--sm btn--ghost" data-pl-add="${id}">Add: ${esc(leverById[id].title)}</button>`).join("")}${e.step ? `<button type="button" class="link" data-pl-step="${e.step}">Go to step ${e.step}</button>` : ""}</p>` : ""}
      </li>`; }).join("")}</ol>
      ${plan.example ? `<p class="plan-step__hint">For the worked example, this check shows only what its sources document, not everything the place may do.</p>` : ""}
      <p class="plan-checklist__src">Sources: ${WHO_ELEMENTS_SOURCES.map(x => extLink(x.url, x.label)).join(" · ")}</p>`;
  }

  function renderPlanWorkshop() {
    const box = document.getElementById("plan-workshop-body"); if (!box || typeof PLAN_WORKSHOP === "undefined") return;
    box.innerHTML = `<p class="plan-workshop__invite"><b>Who to invite.</b> ${esc(PLAN_WORKSHOP.invite)}</p>
      <ol class="plan-workshop__agenda">${PLAN_WORKSHOP.steps.map(x => `<li><span>${esc(x.time)}</span><div><strong>${esc(x.what)}</strong>${esc(x.how)}</div></li>`).join("")}</ol>`;
  }

  function renderPlanSummary() {
    const box = document.getElementById("plan-summary"); if (!box) return;
    const loops = planLoops(), rows = plan.levers.map(id => planRow(id));
    const leads = new Set(rows.map(r => r.lead).filter(Boolean));
    const payers = {}; rows.forEach(r => { payers[r.payer] = (payers[r.payer] || 0) + 1; });
    const unpaid = payers["Not decided yet"] || 0;
    const timing = Object.keys(WHEN).map(w => [WHEN[w], plan.levers.filter(id => leverById[id].when === w).length]).filter(x => x[1]);
    const check = whoCheck(), ready = check.filter(x => x.st === "yes").length, part = check.filter(x => x.st === "part").length;
    const phases = PHASES.map(x => [x, plan.levers.filter(id => planRow(id).phase === x.id).length]).filter(x => x[1]);
    const group = PG.find(g => g.id === plan.group);
    box.innerHTML = `<p class="plan-summary__k">Your plan</p>
      <h2 class="plan-h">${esc(plan.place || "Your place")}${group ? ` · ${esc(group.name.toLowerCase())}` : ""}</h2>
      <div class="plan-summary__stats">
        <p><strong>${plan.levers.length}</strong> action${plan.levers.length === 1 ? "" : "s"}</p>
        <p><strong>${loops.length}</strong> of ${LOOPS.length} cycles they could help interrupt</p>
        <p><strong>${leads.size}</strong> institution${leads.size === 1 ? "" : "s"} leading</p>
      </div>
      ${WHOEL.length ? `<p class="plan-summary__ready"><b>${ready} of ${WHOEL.length}</b> WHO core elements in place${part ? `, ${part} partly` : ""}. <button type="button" class="link" data-pl-step="6">See the check</button></p>` : ""}
      ${phases.length ? `<p class="plan-summary__line"><b>When it happens:</b> ${phases.map(([x, n]) => `${esc(x.name.toLowerCase())} (${n})`).join(", ")}</p>` : ""}
      ${timing.length ? `<p class="plan-summary__line"><b>When it works:</b> ${timing.map(([l, n]) => `${esc(l)} (${n})`).join(", ")}</p>` : ""}
      ${rows.length ? `<p class="plan-summary__line"><b>Who pays:</b> ${Object.entries(payers).map(([p, n]) => `${esc(p)} (${n})`).join(", ")}</p>` : ""}
      ${W2A.length && plan.levers.length && w2aDone() < LEVELS.length ? `<p class="plan-summary__gap">${plural(LEVELS.length - w2aDone(), "alert level")} with nobody named to act. <button type="button" class="link" data-pl-step="4">Fill the warning-to-action table</button></p>` : ""}
      ${expoOn().length ? `<p class="plan-summary__line"><b>Exposure to discuss:</b> ${plural(expoOn().length, "prompt")}</p>` : ""}
      ${unpaid ? `<p class="plan-summary__gap">${plural(unpaid, "action")} with nobody paying yet. That is the conversation to have next.</p>` : ""}
      ${noUpkeep().length ? `<p class="plan-summary__gap">${plural(noUpkeep().length, "cooling action")} with nobody named to keep it working after year one. <button type="button" class="link" data-pl-step="3">Add it in step 3</button></p>` : ""}
      ${loops.length ? `<p class="plan-summary__line"><b>Cycles in play:</b> ${loops.map(l => esc(l.name.replace(/^The /, ""))).join(", ")}</p>` : ""}
      ${planStalls().length ? `<p class="plan-summary__line"><b>Watch for:</b> ${planStalls().map(x => esc(x.name.toLowerCase())).join(", ")}</p>` : ""}
      <p class="plan-summary__note">Illustrative: real effect depends on reach, quality and how long each action lasts.</p>
      <div class="plan-summary__actions">
        <button type="button" class="btn btn--sm" data-pl-act="map"${plan.levers.length ? "" : " disabled"}>Show on the map</button>
        <button type="button" class="btn btn--sm btn--ghost" data-pl-act="print"${plan.levers.length ? "" : " disabled"}>Open a printable plan</button>
        <button type="button" class="btn btn--sm btn--ghost" data-pl-act="copy"${plan.levers.length ? "" : " disabled"}>Copy as text</button>
        <button type="button" class="btn btn--sm btn--ghost" data-pl-act="link"${plan.levers.length || plan.place ? "" : " disabled"}>Copy a link to start this plan</button>
        <button type="button" class="link" data-pl-act="clear">Start again</button>
      </div>
      <p class="plan-summary__status" data-pl-status role="status"></p>`;
  }

  function renderPlanStory() {
    const box = document.getElementById("plan-story"); if (!box) return;
    const ex = EXAMPLES.find(x => x.id === plan.example);
    box.hidden = !ex;
    if (!ex) { box.innerHTML = ""; return; }
    box.innerHTML = `<p class="plan-story__k">Worked example · ${esc(ex.place)} · ${esc(ex.year)}</p>
      <h2 class="plan-h">${esc(ex.title)}</h2>
      <ol class="plan-story__steps">
        <li><b>What happened</b>${gloss(ex.trigger)}</li>
        <li><b>What they decided</b>${gloss(ex.decision)}</li>
        <li><b>What changed</b>${gloss(ex.result)}</li>
      </ol>
      <p class="plan-story__src">Sources: ${ex.sources.map(x => extLink(x.url, x.label)).join(" · ")}</p>
      <p class="plan-story__note">${esc(ex.note || "")} Change anything to make it your own.</p>`;
  }

  function renderPlanChecklist() {
    const list = document.getElementById("plan-checklist-list"), src = document.getElementById("plan-checklist-src");
    if (!list || typeof PLAN_CHECKLIST === "undefined") return;
    list.innerHTML = PLAN_CHECKLIST.map(c => `<li><strong>${esc(c.item)}</strong><span>${esc(c.eg)}</span></li>`).join("");
    const cnt = document.getElementById("plan-checklist-count"); if (cnt) cnt.textContent = `${PLAN_CHECKLIST.length} things, with real examples`;
    if (src) src.innerHTML = "Sources: " + PLAN_CHECKLIST_SOURCES.map(x => extLink(x.url, x.label)).join(" · ");
  }

  /* ---- plan additions: where each action stands, capacity, where people can go, advice and provision, continuity, mechanisms ---- */
  const LADDER = typeof PLACE_SIM !== "undefined" ? PLACE_SIM.statuses : [];
  const openUI = {}; // which panels are open, kept across re-renders
  const lRank = id => LADDER.findIndex(x => x.id === (id || "proposed"));
  // a status at "agreed" or beyond counts only with evidence of it
  const rowCounts = r => lRank(r.status) >= lRank("agreed") && !String(r.ev || "").trim() ? "discussed" : (r.status || "proposed");
  const ladderDots = st => { const k = lRank(st); return `<span class="pl-dots" role="img" aria-label="Where it stands: ${esc(LADDER[k].name)}">${LADDER.map((x, i) => `<i class="${i <= k ? "on" : ""}"></i>`).join("")}<b>${esc(LADDER[k].name)}</b></span>`; };
  function renderPlanStanding() {
    const box = document.getElementById("plan-standing"); if (!box || !LADDER.length) return;
    const ids = plan.levers.filter(id => leverById[id]); if (!ids.length) { box.innerHTML = ""; return; }
    const n = LADDER.map(x => ids.filter(id => rowCounts(planRow(id)) === x.id).length);
    box.innerHTML = `<div class="pl-standing"><p class="pl-standing__k">Where the plan stands</p>
      <div class="pl-standing__bar" role="img" aria-label="${LADDER.map((x, i) => `${n[i]} ${x.name.toLowerCase()}`).join(", ")}">${LADDER.map((x, i) => n[i] ? `<span class="pl-st--${x.id}" style="flex:${n[i]}"><b>${n[i]}</b> ${esc(x.name)}</span>` : "").join("")}</div>
      <p class="plan-step__hint">Naming who leads is not their agreement. Move each action up the ladder as it happens; from Agreed on, note what shows it.</p></div>`;
  }
  function renderPlanCapacity() {
    const box = document.getElementById("plan-capacity"); if (!box || typeof PLAN_CAPACITY === "undefined") return;
    const c = plan.capacity || {};
    box.innerHTML = `<div class="pl-cap">${PLAN_CAPACITY.map(f => `<label>${esc(f.name)} <textarea rows="2" data-pl-cap="${f.id}" placeholder="${esc(f.placeholder)}">${esc(c[f.id] || "")}</textarea>${f.note ? `<span class="plan-step__hint">${esc(f.note)}</span>` : ""}</label>`).join("")}</div>`;
  }
  // step 1: places people can go
  const points = () => (plan.points = Array.isArray(plan.points) ? plan.points : []);
  function renderPlanPoints() {
    const box = document.getElementById("plan-points"); if (!box || typeof PLAN_POINTS === "undefined") return;
    const P = PLAN_POINTS, ps = points(), n = k => ps.filter(x => (x.status || "listed") === k).length, reach = plan.reach || [];
    box.innerHTML = `<details class="pl-points" data-pl-open="points"${openUI.points ?? ps.length ? " open" : ""}><summary>Where can people go when it is hot? <span>${ps.length ? `${n("confirmed")} confirmed · ${n("listed")} listed · ${n("unknown")} unknown` : "places, and whether they are really open"}</span></summary>
      <p class="plan-step__hint">${esc(P.note)}</p>
      <div class="pl-points__list">${ps.map((x, i) => `<div class="pl-point pl-point--${x.status || "listed"}" data-pl-pt="${i}">
        <div class="pl-point__h"><input type="text" aria-label="Name of the place" data-pl-ptf="name" value="${esc(x.name || "")}" placeholder="Name of the place">
          <select aria-label="Kind of place" data-pl-ptf="kind">${P.kinds.map(k => `<option${x.kind === k ? " selected" : ""}>${esc(k)}</option>`).join("")}</select>
          <button type="button" class="link" data-pl-ptdel="${i}" aria-label="Remove ${esc(x.name || "this place")}">Remove</button></div>
        <div class="pl-point__f">${P.fields.map(f => `<label>${esc(f.name)} <input type="text" data-pl-ptf="${f.id}" value="${esc(x[f.id] || "")}" placeholder="${esc(f.placeholder)}"></label>`).join("")}</div>
        <div class="pl-point__st" role="radiogroup" aria-label="Is it really open?">${P.statuses.map(([k, l]) => `<label><input type="radio" name="pl-pt-${i}" data-pl-ptst="${k}"${(x.status || "listed") === k ? " checked" : ""}> ${esc(l)}</label>`).join("")}</div></div>`).join("")}</div>
      <p><button type="button" class="btn btn--sm btn--ghost" data-pl-ptadd>+ Add a place</button></p>
      <fieldset class="pl-reach"><legend>Who may not be able to reach them?</legend>${P.reach.map((r, i) => `<label class="plan-check"><input type="checkbox" data-pl-reach="${i}"${reach.includes(i) ? " checked" : ""}><span>${esc(r)}</span></label>`).join("")}</fieldset>
      <p class="plan-step__src">${extLink(P.source.url, P.source.label)}</p></details>`;
  }
  // step 4: advice paired with what makes it possible, and the message that results
  function renderPlanCoupling() {
    const box = document.getElementById("plan-coupling"); if (!box || typeof PLAN_COUPLING === "undefined") return;
    const C = PLAN_COUPLING, cp = plan.coupling || {}, ok = C.rows.filter(r => (cp[r.id] || {}).ok && (cp[r.id] || {}).text);
    const conf = points().filter(x => x.status === "confirmed" && x.name);
    box.innerHTML = `<details class="pl-cp" data-pl-open="cp"${openUI.cp ?? ok.length ? " open" : ""}><summary>Pair every piece of advice with what makes it possible <span>${ok.length} of ${C.rows.length} confirmed</span></summary>
      <p class="plan-step__hint">${esc(C.note)}</p>
      <div class="pl-cp__grid"><div class="pl-cp__rows">${C.rows.map(r => { const v = cp[r.id] || {};
        return `<div class="pl-cp__row${v.ok && v.text ? " is-ok" : ""}"><p class="pl-cp__adv">“${esc(r.advice)}”</p><p class="pl-cp__ask">${esc(r.ask)}</p>
          <input type="text" aria-label="${esc(r.ask)}" data-pl-cp="${r.id}" value="${esc(v.text || (r.id === "cool" && conf.length ? "" : ""))}" placeholder="${esc(r.id === "cool" && conf.length ? `e.g. ${conf.map(x => x.name).join(", ")}` : r.placeholder)}">
          <label class="pl-cp__ok"><input type="checkbox" data-pl-cpok="${r.id}"${v.ok ? " checked" : ""}> Confirmed by the body that runs it</label></div>`; }).join("")}</div>
      <div class="pl-sms" aria-live="polite"><p class="pl-sms__k">The alert message, as it stands</p><div class="pl-sms__phone"><p class="pl-sms__b">${esc(smsText())}</p></div>
        <p class="plan-step__hint">${C.rows.length - ok.length ? `${C.rows.length - ok.length} piece${C.rows.length - ok.length === 1 ? " of advice has" : "s of advice have"} no confirmed provision yet, so the message gives the advice alone.` : "Every piece of advice is paired with a confirmed provision."}</p></div></div>
      <p class="plan-step__src">${extLink(C.source.url, C.source.label)}</p></details>`;
  }
  function smsText() {
    const C = PLAN_COUPLING, cp = plan.coupling || {};
    return `Heat alert${plan.place ? " for " + plan.place : ""}. ` + C.rows.map(r => { const v = cp[r.id] || {}; return v.ok && v.text ? `${r.advice}: ${v.text}.` : `${r.advice}.`; }).join(" ");
  }
  // step 5: will essential services continue?
  const cont = () => (plan.cont = plan.cont && typeof plan.cont === "object" ? plan.cont : { on: [], fb: {} });
  const covered = (fid, dep) => { const f = cont().fb[`${fid}:${dep}`] || {}; return !!(f.st && (f.fallback || "").trim()); };
  function contGaps() { const c = cont(); if (typeof PLAN_CONTINUITY === "undefined") return [];
    return PLAN_CONTINUITY.functions.flatMap(f => f.deps.filter(d => c.on.includes(d) && !covered(f.id, d)).map(d => ({ f, d: PLAN_CONTINUITY.disruptions.find(x => x.id === d) }))); }
  function renderPlanContinuity() {
    const box = document.getElementById("plan-continuity"); if (!box || typeof PLAN_CONTINUITY === "undefined") return;
    const K = PLAN_CONTINUITY, c = cont(), gaps = contGaps();
    box.innerHTML = `<section class="pl-ct" aria-labelledby="pl-ct-h"><p class="pl-ct__k">Stress test</p><h3 id="pl-ct-h">When the power goes</h3>
      <p class="plan-step__hint">${esc(K.note)}</p>
      <div class="pl-ct__hits" role="group" aria-label="What goes wrong during the heatwave">${K.disruptions.map(d => `<button type="button" class="pl-ct__hit" data-pl-ct="${d.id}" aria-pressed="${c.on.includes(d.id)}"><span aria-hidden="true">${d.icon}</span> ${esc(d.name)}</button>`).join("")}</div>
      <div class="pl-ct__fns">${K.functions.map(f => { const hit = f.deps.filter(d => c.on.includes(d)), open = hit.filter(d => !covered(f.id, d)), dark = open.length > 0;
        return `<div class="pl-fn${dark ? " is-dark" : hit.length ? " is-held" : ""}"><p class="pl-fn__n"><span class="pl-fn__lamp" aria-hidden="true"></span>${esc(f.name)}<em>${!hit.length ? "Running" : dark ? `At risk: ${plural(open.length, "dependency", "dependencies")} not covered` : "Kept going by the fallbacks below"}</em></p>
          <p class="pl-fn__deps">Depends on: ${f.deps.map(d => { const x = K.disruptions.find(z => z.id === d); return `<span class="${c.on.includes(d) ? (covered(f.id, d) ? "ok" : "hit") : ""}"><span aria-hidden="true">${x.icon}</span> ${esc(x.dep)}</span>`; }).join("")}</p>
          ${hit.map(d => { const x = K.disruptions.find(z => z.id === d), fb = c.fb[`${f.id}:${d}`] || {};
            return `<div class="pl-fb"><p><b>${x.icon} ${esc(x.name)}:</b> what keeps ${esc(f.name.toLowerCase())} going?</p>
              <input type="text" aria-label="Fallback for ${esc(f.name)} during ${esc(x.name.toLowerCase())}" data-pl-fb="${f.id}:${d}:fallback" value="${esc(fb.fallback || "")}" placeholder="${esc(f.prompt)}">
              <div class="pl-fb__r"><input type="text" aria-label="Who arranges it" data-pl-fb="${f.id}:${d}:who" value="${esc(fb.who || "")}" placeholder="Who arranges it">
              <select aria-label="Is it arranged?" data-pl-fb="${f.id}:${d}:st">${K.states.map(([v, l]) => `<option value="${v}"${(fb.st || "") === v ? " selected" : ""}>${esc(l)}</option>`).join("")}</select></div></div>`; }).join("")}</div>`; }).join("")}</div>
      ${c.on.length ? `<div class="pl-ct__out"><p class="pl-ct__k">${gaps.length ? `${plural(gaps.length, "dependency", "dependencies")} still to resolve` : "Every dependency hit in this scenario has a fallback"}</p>${gaps.length ? `<ul>${gaps.map(g => `<li><b>${esc(g.f.name)}</b> without a plan for: ${esc(g.d.name.toLowerCase())}</li>`).join("")}</ul>` : ""}</div>` : `<p class="plan-step__hint">Choose what goes wrong above to start.</p>`}
      <p class="plan-step__src">${extLink(K.source.url, K.source.label)}</p></section>`;
  }
  // "See it done": adapt the mechanism, not the city
  let mechOn = 0;
  function renderPlanMech() {
    const box = document.getElementById("plan-mech"); if (!box || typeof PLAN_MECHANISMS === "undefined") return;
    const M = PLAN_MECHANISMS, m = M[mechOn], F = [["problem", "The problem"], ["mechanism", "How they work together"], ["resources", "Authority and money"], ["delivery", "What reaches people"], ["unresolved", "Still unresolved"], ["check", "Before adapting it, check"]];
    box.innerHTML = `<p class="pm__k">Adapt the mechanism, not the city</p><h2 class="pm__h" id="pm-title">How five cities organise for heat</h2>
      <div class="pm__tabs" role="tablist" aria-label="Cities">${M.map((x, i) => `<button type="button" role="tab" id="pm-tab-${x.id}" aria-controls="pm-panel" aria-selected="${i === mechOn}" tabindex="${i === mechOn ? 0 : -1}" data-pm="${i}">${esc(x.city.split(",")[0])}</button>`).join("")}</div>
      <div class="pm__card" id="pm-panel" role="tabpanel" aria-labelledby="pm-tab-${m.id}"><p class="pm__city"><b>${esc(m.city)}</b> ${esc(m.size)}</p>
        <dl class="pm__grid">${F.map(([k, l]) => `<div class="pm__f pm__f--${k}"><dt>${esc(l)}</dt><dd>${esc(m[k])}</dd></div>`).join("")}</dl>
        <p class="pm__src">${esc(PLAN_MECH_NOTE)} ${extLink(MCR2030.url, `${MCR2030.label}, ${m.pages}`)}</p></div>`;
  }

  function renderPlan() {
    const place = document.getElementById("plan-place"), grp = document.getElementById("plan-group");
    if (!place || !grp) return;
    grp.innerHTML = `<option value="">Choose a group…</option>` + PG.map(g => `<option value="${g.id}"${plan.group === g.id ? " selected" : ""}>${esc(g.name)}</option>`).join("");
    place.value = plan.place;
    const rv = document.getElementById("plan-review"); if (rv) rv.value = plan.review || "";
    renderPlanMech(); renderPlanPoints(); renderPlanStanding(); renderPlanCapacity(); renderPlanCoupling(); renderPlanContinuity();
    renderPlanStory(); renderPlanChecklist(); renderPlanWorkshop(); renderPlanExposure(); renderPlanFin(); renderPlanReviewLog(); renderPlanActions(); renderPlanRows(); renderPlanTriggers(); renderPlanStalls(); renderPlanCheck(); renderPlanSummary();
  }

  // the practical guides for the chosen actions, each listed once, under the first action that needs it
  function planReading() {
    const seen = new Set();
    return plan.levers.map(id => { const v = leverById[id];
      return { v, guides: (v.guides || []).filter(g => !seen.has(g.url) && seen.add(g.url)) }; }).filter(x => x.guides.length);
  }

  function planText() {
    const g = PG.find(x => x.id === plan.group), L = [];
    L.push("HEAT RESPONSE PLAN", `Place: ${plan.place || "(not set)"}`, `People at risk: ${g ? g.name : "(not set)"}`, `Made with the Common Shade systems map: ${location.origin + location.pathname}`, "");
    plan.levers.forEach((id, i) => { const v = leverById[id], r = planRow(id);
      L.push(`${i + 1}. ${v.title} [${WHEN[v.when] || ""}]`, `   Leads: ${instById[r.lead] ? instById[r.lead].name : "-"}`, `   Pays: ${r.payer}`, `   When: ${phaseById[r.phase] ? phaseById[r.phase].name : "-"}`, `   How we will know: ${r.measure || v.measure || "-"}`);
      if (LADDER.length) L.push(`   Where it stands: ${LADDER[lRank(rowCounts(r))].name}${r.ev ? ` (shown by: ${r.ev})` : ""}`);
      if (isAsset(id)) L.push(`   Kept working by: ${r.upkeep || "(not set)"}`);
      DELIVER.forEach(f => L.push(`   ${f.name}: ${(r.deliver || {})[f.id] || "(not set)"}`)); });
    if (typeof PLAN_CAPACITY !== "undefined" && plan.capacity) PLAN_CAPACITY.forEach(f => { if ((plan.capacity[f.id] || "").trim()) L.push("", f.name, `   ${plan.capacity[f.id]}`); });
    if (points().length) { L.push("", "WHERE PEOPLE CAN GO"); points().forEach(x => L.push(`- ${x.name || "(unnamed)"} (${x.kind || ""}): ${(PLAN_POINTS.statuses.find(z => z[0] === (x.status || "listed")) || [])[1]}`, ...PLAN_POINTS.fields.filter(f => x[f.id]).map(f => `   ${f.name}: ${x[f.id]}`)));
      if ((plan.reach || []).length) L.push(`May not be able to reach them: ${plan.reach.map(i => PLAN_POINTS.reach[i]).join(", ")}`); }
    const t = trig(), base = BASES.find(b => b.id === t.basis);
    L.push("", "TRIGGERS AND WARNINGS", `Alerts based on: ${base ? base.name : "(not set)"}`, `Issued by: ${instById[t.issuer || "met"] ? instById[t.issuer || "met"].name : "-"}`);
    LEVELS.forEach(l => L.push(`${l.name} (${l.meaning}): ${t[l.id] || "(not set)"}. Switches on: ${plan.levers.filter(id => planRow(id).phase === l.id).map(id => leverById[id].title).join(", ") || "nothing yet"}`));
    L.push(`Warnings reach people by: ${(t.channels || []).map(c => (CHANNELS.find(x => x.id === c) || {}).name).filter(Boolean).join(", ") || "(not set)"}`);
    if (W2A.length) { L.push("", "WARNING-TO-ACTION TABLE");
      LEVELS.forEach(l => { const w = (t.w2a || {})[l.id] || {}; L.push(`${l.name} (${l.meaning}):`);
        W2A.forEach(f => L.push(`   ${f.name}: ${(f.id === "decide" ? instName(w.decide) : f.id === "pay" ? (w.pay || PAYERS[0]) : w[f.id]) || "(not set)"}`)); }); }
    if (typeof PLAN_COUPLING !== "undefined") L.push("", "THE ALERT MESSAGE (advice with confirmed provision only)", smsText());
    if (typeof PLAN_CONTINUITY !== "undefined" && cont().on.length) { L.push("", `STRESS TEST: ${cont().on.map(id => PLAN_CONTINUITY.disruptions.find(x => x.id === id).name).join(", ")}`);
      PLAN_CONTINUITY.functions.forEach(f => f.deps.filter(d => cont().on.includes(d)).forEach(d => { const fb = cont().fb[`${f.id}:${d}`] || {}; L.push(`   ${f.name} / ${PLAN_CONTINUITY.disruptions.find(x => x.id === d).name}: ${fb.fallback || "(no fallback)"}${fb.who ? `, by ${fb.who}` : ""} [${(PLAN_CONTINUITY.states.find(z => z[0] === (fb.st || "")) || [])[1]}]`); })); }
    if (TWOWAY.length) { L.push("", "WARNINGS THAT WORK BOTH WAYS"); TWOWAY.forEach(f => L.push(`   ${f.name}: ${(t.twoway || {})[f.id] || "(not set)"}`)); }
    if (FIN) { const f = fin(); L.push("", "PAYING FOR PROTECTION");
      FIN.needs.forEach(n => { const v = (f.needs || {})[n.id] || {}; L.push(`${n.need}: ${v.route || "(no route yet)"}${v.by ? `. Must arrive by: ${v.by}` : ""}`); });
      FIN.fields.forEach(x => L.push(`   ${x.name}: ${(f.path || {})[x.id] || "(not set)"}`));
      L.push(`Payout trigger: ${f.payout || "(none)"}`, `If it does not pay: ${f.nopay || "(not set)"}`, "Will it survive the next season?", ...FIN.survive.map(q => `   - ${q}`)); }
    if (expoOn().length) { L.push("", "EXPOSURE: TO DISCUSS (prompts, not a risk score)"); expoOn().forEach(x => L.push(`   - ${x.q} ${x.prompt}`)); }
    L.push("", "WHO CORE ELEMENTS CHECK"); whoCheck().forEach(({ e, st, note }) => L.push(`[${ST[st]}] ${e.name}: ${note}`));
    if (typeof PLAN_REVIEW !== "undefined") { L.push("", `AFTER-SEASON REVIEW${plan.review ? ": " + plan.review : ""}`); PLAN_REVIEW.forEach(q => L.push(`   - ${q}`)); }
    if (RLOG.some(f => rlog()[f.id])) { L.push("", "WHAT CHANGED AFTER THE SEASON"); RLOG.forEach(f => L.push(`   ${f.name}: ${rlog()[f.id] || "(not set)"}`)); }
    L.push("", `Cycles these actions could help interrupt: ${planLoops().map(l => l.name).join(", ") || "none"}`);
    if (planStalls().length) { L.push("", "WHAT COULD STOP THIS PLAN, AND WHAT HAS MOVED IT ELSEWHERE");
      planStalls().forEach(x => { L.push(`${x.name}:`); x.moves.forEach(m => L.push(`   - ${m}`)); }); }
    const reading = planReading();
    if (reading.length) { L.push("", "READING LIST FOR THIS PLAN");
      reading.forEach(({ v, guides }) => { L.push(`${v.title}:`); guides.forEach(g => L.push(`   - ${g.title} (${g.by}): ${g.url}`)); }); }
    L.push("", "Illustrative: real effect depends on reach, quality and how long each action lasts.");
    return L.join("\n");
  }

  function openPlan() {
    const g = PG.find(x => x.id === plan.group), ex = EXAMPLES.find(x => x.id === plan.example), h = esc;
    const css = `body{font-family:"Hanken Grotesk",Segoe UI,Arial,sans-serif;color:#16202B;max-width:860px;margin:40px auto;padding:0 24px;line-height:1.5}
      h1{font-family:Anton,Impact,sans-serif;font-weight:400;text-transform:uppercase;font-size:38px;line-height:1;margin:6px 0}
      .k{color:#1F7A70;font-weight:700;letter-spacing:.14em;text-transform:uppercase;font-size:12px}.sub{color:#5E6570}
      table{width:100%;border-collapse:collapse;margin-top:18px;font-size:14px}th,td{text-align:left;vertical-align:top;padding:8px;border-bottom:1px solid #E6DFD4}
      th{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#5E6570}.gap{color:#9E1A2C;font-weight:700}
      h2{font-size:13px;letter-spacing:.12em;text-transform:uppercase;border-top:2px solid #16202B;padding-top:10px;margin-top:26px}
      .note{color:#5E6570;font-size:13px}.lv{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:6px}.lv--yellow{background:#F5C518}.lv--orange{background:#F26430}.lv--red{background:#C8102E}.read h3{font-size:15px;margin:16px 0 4px}.read ul{margin:0;padding-left:18px}.read li{margin:4px 0;font-size:14px}
      .read a{color:#16202B;text-decoration-color:#F26430;text-underline-offset:3px}.read .by{color:#5E6570;font-size:12.5px}.read .u{display:none}
      .print{position:fixed;top:16px;right:16px;padding:10px 18px;border-radius:999px;border:0;background:#F26430;font-weight:700;cursor:pointer}
      @media print{.print{display:none}body{margin:0}.read .u{display:block;color:#5E6570;font-size:11px;word-break:break-all}h2{break-after:avoid}.read h3{break-after:avoid}}`;
    const rows = plan.levers.map(id => { const v = leverById[id], r = planRow(id);
      return `<tr><td><strong>${h(v.title)}</strong><br><span class="note">${h(WHEN[v.when] || "")}</span>${isAsset(id) ? `<br><span class="${(r.upkeep || "").trim() ? "note" : "gap"}">Kept working by: ${h(r.upkeep || "not set")}</span>` : ""}${DELIVER.filter(f => (r.deliver || {})[f.id]).map(f => `<br><span class="note">${h(f.name)}: ${h(r.deliver[f.id])}</span>`).join("")}${LADDER.length ? `<br><span class="${lRank(rowCounts(r)) >= lRank("agreed") ? "note" : "gap"}">Where it stands: ${h(LADDER[lRank(rowCounts(r))].name)}${r.ev ? ` (${h(r.ev)})` : ""}</span>` : ""}</td><td>${h(phaseById[r.phase] ? phaseById[r.phase].name : "")}</td><td>${h(instById[r.lead] ? instById[r.lead].name : "")}</td><td class="${r.payer === "Not decided yet" ? "gap" : ""}">${h(r.payer)}</td><td>${h(r.measure || v.measure || "")}</td></tr>`; }).join("");
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Heat response plan: ${h(plan.place || "draft")}</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap"><style>${css}</style></head><body>
      <button class="print" onclick="window.print()">Print or save as PDF</button>
      <p class="k">Heat response plan · draft</p><h1>${h(plan.place || "Our place")}</h1>
      <p class="sub">Protecting: <strong>${h(g ? g.name : "not set")}</strong> · made with the Common Shade systems map</p>
      ${ex ? `<p class="note">Based on the worked example: ${h(ex.title)}.</p>` : ""}
      <table><thead><tr><th>Action</th><th>When</th><th>Who leads</th><th>Who pays</th><th>How we will know</th></tr></thead><tbody>${rows}</tbody></table>
      ${(() => { const t = trig(), base = BASES.find(b => b.id === t.basis), chs = (t.channels || []).map(c => (CHANNELS.find(x => x.id === c) || {}).name).filter(Boolean);
        return `<h2>Triggers and warnings</h2><p>Alerts based on <strong>${h(base ? base.name : "not set yet")}</strong>, issued by <strong>${h(instById[t.issuer || "met"] ? instById[t.issuer || "met"].name : "")}</strong>.</p>
        <table><thead><tr><th>Level</th><th>Trigger</th><th>Switches on</th></tr></thead><tbody>${LEVELS.map(l => `<tr><td><span class="lv lv--${l.id}"></span><strong>${h(l.name)}</strong><br><span class="note">${h(l.meaning)}</span></td><td class="${t[l.id] ? "" : "gap"}">${h(t[l.id] || "Not set")}</td><td>${h(plan.levers.filter(id => planRow(id).phase === l.id).map(id => leverById[id].title).join(", ") || "-")}</td></tr>`).join("")}</tbody></table>
        <p><strong>Warnings reach people by:</strong> ${h(chs.join(", ") || "not set yet")}</p>
        ${TWOWAY.length ? `<h2>Warnings that work both ways</h2><table><tbody>${TWOWAY.map(f => `<tr><td><strong>${h(f.name)}</strong></td><td class="${(t.twoway || {})[f.id] ? "" : "gap"}">${h((t.twoway || {})[f.id] || "Not set")}</td></tr>`).join("")}</tbody></table>` : ""}
        ${W2A.length ? `<h2>Warning-to-action table</h2><table><thead><tr><th>Level</th>${W2A.map(f => `<th>${h(f.name)}</th>`).join("")}</tr></thead><tbody>${LEVELS.map(l => { const w = (t.w2a || {})[l.id] || {};
          return `<tr><td><span class="lv lv--${l.id}"></span><strong>${h(l.name)}</strong></td>${W2A.map(f => { const v = f.id === "decide" ? instName(w.decide) : f.id === "pay" ? (w.pay || PAYERS[0]) : w[f.id];
            return `<td class="${v && v !== "Not decided yet" ? "" : "gap"}">${h(v || "Not set")}</td>`; }).join("")}</tr>`; }).join("")}</tbody></table>` : ""}`; })()}
      ${FIN ? (f => `<h2>Paying for protection</h2><table><thead><tr><th>Need</th><th>Route, and who holds the money</th><th>Must arrive by</th></tr></thead><tbody>${FIN.needs.map(n => { const v = (f.needs || {})[n.id] || {};
        return `<tr><td><strong>${h(n.need)}</strong></td><td class="${v.route ? "" : "gap"}">${h(v.route || "No route yet")}</td><td>${h(v.by || "")}</td></tr>`; }).join("")}</tbody></table>
        <table><tbody>${FIN.fields.map(x => `<tr><td><strong>${h(x.name)}</strong></td><td class="${(f.path || {})[x.id] ? "" : "gap"}">${h((f.path || {})[x.id] || "Not set")}</td></tr>`).join("")}
        <tr><td><strong>Payout trigger</strong></td><td>${h(f.payout || "None")}</td></tr><tr><td><strong>If it does not pay</strong></td><td class="${f.nopay || !f.payout ? "" : "gap"}">${h(f.nopay || "Not set")}</td></tr></tbody></table>
        <p class="note">Will it survive the next season? ${h(FIN.survive.join(" "))}</p>`)(fin()) : ""}
      ${points().length ? `<h2>Where people can go</h2><table><thead><tr><th>Place</th><th>Status</th><th>Details</th></tr></thead><tbody>${points().map(x => `<tr><td><strong>${h(x.name || "Unnamed")}</strong><br><span class="note">${h(x.kind || "")}</span></td><td class="${x.status === "confirmed" ? "" : "gap"}">${h((PLAN_POINTS.statuses.find(z => z[0] === (x.status || "listed")) || [])[1])}</td><td>${PLAN_POINTS.fields.filter(f => x[f.id]).map(f => `${h(f.name)}: ${h(x[f.id])}`).join("<br>")}</td></tr>`).join("")}</tbody></table>${(plan.reach || []).length ? `<p class="note">May not be able to reach them: ${h(plan.reach.map(i => PLAN_POINTS.reach[i]).join(", "))}.</p>` : ""}` : ""}
      ${typeof PLAN_COUPLING !== "undefined" ? `<h2>The alert message</h2><p>${h(smsText())}</p><p class="note">Advice is paired only with provisions confirmed by the body that runs them.</p>` : ""}
      ${typeof PLAN_CONTINUITY !== "undefined" && cont().on.length ? `<h2>Stress test: ${h(cont().on.map(id => PLAN_CONTINUITY.disruptions.find(x => x.id === id).name.toLowerCase()).join(", "))}</h2><table><thead><tr><th>Service</th><th>If this fails</th><th>Fallback</th><th>Who</th><th>Status</th></tr></thead><tbody>${PLAN_CONTINUITY.functions.flatMap(f => f.deps.filter(d => cont().on.includes(d)).map(d => { const fb = cont().fb[`${f.id}:${d}`] || {}; return `<tr><td>${h(f.name)}</td><td>${h(PLAN_CONTINUITY.disruptions.find(x => x.id === d).name)}</td><td class="${(fb.fallback || "").trim() ? "" : "gap"}">${h(fb.fallback || "None yet")}</td><td>${h(fb.who || "")}</td><td class="${fb.st ? "" : "gap"}">${h((PLAN_CONTINUITY.states.find(z => z[0] === (fb.st || "")) || [])[1])}</td></tr>`; })).join("")}</tbody></table>` : ""}
      ${plan.capacity && PLAN_CAPACITY.some(f => (plan.capacity[f.id] || "").trim()) ? `<h2>Capability and support</h2>${PLAN_CAPACITY.map(f => `<p><strong>${h(f.name)}</strong><br>${h(plan.capacity[f.id] || "Not set")}</p>`).join("")}` : ""}
      ${expoOn().length ? `<h2>Exposure: to discuss</h2><p class="note">Prompts from the exposure questions, not a risk score.</p><ul>${expoOn().map(x => `<li><strong>${h(x.q)}</strong> ${h(x.prompt)}</li>`).join("")}</ul>` : ""}
      ${(() => { const c = whoCheck(); return c.length ? `<h2>Check against WHO’s eight core elements</h2><p class="note">${c.filter(x => x.st === "yes").length} of ${c.length} in place. From WHO/Europe, Heat–health action plans: guidance, second edition (2026).</p>
        <table><tbody>${c.map(({ e, st, note }) => `<tr><td><strong>${h(e.name)}</strong></td><td class="${st === "yes" ? "" : "gap"}">${h(ST[st])}</td><td>${h(note)}</td></tr>`).join("")}</tbody></table>` : ""; })()}
      ${typeof PLAN_REVIEW !== "undefined" ? `<h2>After the season: review${plan.review ? " · " + h(plan.review) : ""}</h2><ul>${PLAN_REVIEW.map(q => `<li>${h(q)}</li>`).join("")}</ul>` : ""}
      ${RLOG.some(f => rlog()[f.id]) ? `<h2>What changed after the season</h2><table><tbody>${RLOG.map(f => `<tr><td><strong>${h(f.name)}</strong></td><td>${h(rlog()[f.id] || "")}</td></tr>`).join("")}</tbody></table>` : ""}
      <h2>Cycles these actions could help interrupt</h2><p>${h(planLoops().map(l => l.name).join(", ") || "None yet")}</p>
      ${planStalls().length ? `<h2>What could stop this plan</h2><p class="note">And what has moved each one elsewhere.</p><div class="read">${planStalls().map(x => `<h3>${h(x.name)}</h3><ul>${x.moves.map(m => `<li>${h(m)}</li>`).join("")}</ul>`).join("")}</div>` : ""}
      ${(() => { const r = planReading(); return r.length ? `<h2>Reading list for this plan</h2><p class="note">Practical guides for each action, from the Common Shade map.</p><div class="read">${r.map(({ v, guides }) => `<h3>${h(v.title)}</h3><ul>${guides.map(g => `<li><a href="${h(g.url)}" target="_blank" rel="noopener">${h(g.title)}</a> <span class="by">· ${h(g.by)}</span><span class="u">${h(g.url)}</span></li>`).join("")}</ul>`).join("")}</div>` : ""; })()}
      <p class="note" style="margin-top:28px">Illustrative systems map: real effect depends on how many people each action reaches, how well it is delivered and how long it lasts. For evidence on what works and what it costs, see What Works Against Heat.</p>
      </body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    const w = window.open(url, "_blank");
    if (!w) { const a = document.createElement("a"); a.href = url; a.download = "heat-response-plan.html"; document.body.appendChild(a); a.click(); a.remove(); }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  function loadExample(id) {
    const ex = EXAMPLES.find(x => x.id === id); if (!ex) return;
    if (!PLAN_PAGE) { goToPlan("plan-story", "?example=" + id); return; }
    track("plan-example-" + id);
    plan = { place: ex.place, group: ex.group, levers: ex.actions.map(a => a.lever), rows: {}, example: ex.id, stalls: [], triggers: Object.assign({}, ex.triggers || {}), review: "", exposure: [], finance: {}, reviewLog: {} };
    ex.actions.forEach(a => { plan.rows[a.lever] = { lead: a.lead, payer: a.payer, measure: a.measure, phase: a.phase || PHASE_DEF[a.lever] || "year" }; });
    savePlan(); renderPlan();
    document.getElementById("plan-story").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  // the plan additions: their own listeners, on the plan page only
  (function wirePlanExtras() {
    const sec = document.getElementById("plan"); if (!sec || !PLAN_PAGE) return;
    const after = (...fns) => { savePlan(); fns.forEach(f => f()); renderPlanCheck(); renderPlanSummary(); };
    // a text field's change fires as it loses focus, sometimes while another render is replacing it: re-render a tick later
    const later = fn => setTimeout(() => keep(fn), 0);
    const keep = (fn, sel) => { const f = document.activeElement, ds = f && f.dataset ? Object.entries(f.dataset)[0] : null; fn();
      if (ds) { const el = sec.querySelector(`[data-${ds[0].replace(/[A-Z]/g, c => "-" + c.toLowerCase())}="${ds[1]}"]`); if (el) el.focus({ preventScroll: true }); } };
    sec.addEventListener("input", ev => {
      const t = ev.target, d = t.dataset;
      if (d.plField === "ev") { planRow(t.closest("[data-pl-row]").dataset.plRow).ev = t.value; savePlan(); return; }
      if (d.plCap) { (plan.capacity = plan.capacity || {})[d.plCap] = t.value; savePlan(); return; }
      if (d.plPtf && t.tagName === "INPUT") { points()[+t.closest("[data-pl-pt]").dataset.plPt][d.plPtf] = t.value; savePlan(); return; }
      if (d.plCp) { const cp = plan.coupling = plan.coupling || {}; (cp[d.plCp] = cp[d.plCp] || {}).text = t.value; savePlan(); const b = sec.querySelector(".pl-sms__b"); if (b) b.textContent = smsText(); return; }
      if (d.plFb && t.tagName === "INPUT") { const [f, dep, k] = d.plFb.split(":"), fb = cont().fb; (fb[`${f}:${dep}`] = fb[`${f}:${dep}`] || {})[k] = t.value; savePlan(); return; }
    });
    sec.addEventListener("change", ev => {
      const t = ev.target, d = t.dataset;
      if (d.plField === "status") { planRow(t.closest("[data-pl-row]").dataset.plRow).status = t.value; keep(() => after(renderPlanRows, renderPlanStanding)); return; }
      if (d.plField === "ev") { later(() => after(renderPlanRows, renderPlanStanding)); return; }
      if (d.plPtf && t.tagName === "SELECT") { points()[+t.closest("[data-pl-pt]").dataset.plPt].kind = t.value; savePlan(); return; }
      if (d.plPtf) { later(() => after(renderPlanPoints, renderPlanCoupling)); return; }
      if (d.plPtst) { points()[+t.closest("[data-pl-pt]").dataset.plPt].status = d.plPtst; keep(() => after(renderPlanPoints, renderPlanCoupling)); return; }
      if (d.plReach !== undefined) { const i = +d.plReach, r = plan.reach = Array.isArray(plan.reach) ? plan.reach : []; plan.reach = t.checked ? [...new Set([...r, i])] : r.filter(x => x !== i); after(); return; }
      if (d.plCpok) { const cp = plan.coupling = plan.coupling || {}; (cp[d.plCpok] = cp[d.plCpok] || {}).ok = t.checked; keep(() => after(renderPlanCoupling)); return; }
      if (d.plCp) { later(() => after(renderPlanCoupling)); return; }
      if (d.plFb) { const [f, dep, k] = d.plFb.split(":"), fb = cont().fb; (fb[`${f}:${dep}`] = fb[`${f}:${dep}`] || {})[k] = t.value; (t.tagName === "SELECT" ? keep : later)(() => after(renderPlanContinuity)); return; }
    });
    sec.addEventListener("click", ev => {
      const t = ev.target, b = k => t.closest(`[data-${k}]`);
      if (b("pl-ptadd")) { points().push({ name: "", kind: PLAN_POINTS.kinds[0], status: "listed" }); after(renderPlanPoints); const ins = sec.querySelectorAll('.pl-point [data-pl-ptf="name"]'); if (ins.length) ins[ins.length - 1].focus(); track("plan-point-add"); return; }
      if (b("pl-ptdel")) { points().splice(+b("pl-ptdel").dataset.plPtdel, 1); after(renderPlanPoints, renderPlanCoupling); return; }
      if (b("pl-ct")) { const id = b("pl-ct").dataset.plCt, c = cont(); c.on = c.on.includes(id) ? c.on.filter(x => x !== id) : [...c.on, id]; track("plan-continuity-" + id); keep(() => after(renderPlanContinuity)); return; }
      if (b("pm")) { mechOn = +b("pm").dataset.pm; renderPlanMech(); const tb = sec.querySelector(`[data-pm="${mechOn}"]`); if (tb) tb.focus(); track("plan-mech-" + PLAN_MECHANISMS[mechOn].id); return; }
    });
    sec.addEventListener("toggle", ev => { const k = ev.target.dataset && ev.target.dataset.plOpen; if (k) openUI[k] = ev.target.open; }, true);
    sec.addEventListener("keydown", ev => {
      const tb = ev.target.closest && ev.target.closest("[data-pm]"); if (!tb || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(ev.key)) return;
      ev.preventDefault(); const n = PLAN_MECHANISMS.length;
      mechOn = ev.key === "Home" ? 0 : ev.key === "End" ? n - 1 : (mechOn + (ev.key === "ArrowRight" ? 1 : n - 1)) % n;
      renderPlanMech(); sec.querySelector(`[data-pm="${mechOn}"]`).focus();
    });
  })();

  (function wirePlan() {
    const sec = document.getElementById("plan"); if (!sec) return;
    const changed = (rows = true) => { savePlan(); if (rows) renderPlanRows(); renderPlanTriggers(); renderPlanCheck(); renderPlanSummary(); };
    const light = () => { savePlan(); renderPlanCheck(); renderPlanSummary(); renderPlanLive(); };
    // keep the table's count current without re-rendering the field being typed in
    const updW2a = () => { const s = sec.querySelector("#plan-triggers .plan-w2a summary span"); if (s) s.textContent = `${w2aDone()} of ${LEVELS.length} levels with someone named to act`; };
    sec.addEventListener("input", ev => {
      const t = ev.target;
      if (t.id === "plan-place") { plan.place = t.value; changed(false); }
      else if (t.dataset.plField === "measure" || t.dataset.plField === "upkeep") { planRow(t.closest("[data-pl-row]").dataset.plRow)[t.dataset.plField] = t.value; light(); }
      else if (t.id === "plan-review") { plan.review = t.value; light(); }
      else if (t.dataset.plTrig && t.tagName === "INPUT") { trig()[t.dataset.plTrig] = t.value; light(); }
      else if (t.dataset.plDel) { const id = t.closest("[data-pl-row]").dataset.plRow; deliverOf(id)[t.dataset.plDel] = t.value; light();
        const sm = t.closest(".plan-row__deliver").querySelector("summary span"); if (sm) sm.textContent = `${deliverDone(id)} of ${DELIVER.length} answered`; }
      else if (t.dataset.plTwo) { twoway()[t.dataset.plTwo] = t.value; light(); }
      else if (t.dataset.plRlog) { rlog()[t.dataset.plRlog] = t.value; light(); }
      else if (t.dataset.plFin) { const k = t.dataset.plFin.split(":");
        if (k[0] === "need") finNeed(k[1])[k[2]] = t.value; else if (k[0] === "path") finPath()[k[1]] = t.value; else fin()[k[0]] = t.value;
        light(); const sm = sec.querySelector(".plan-fin summary span"); if (sm) sm.textContent = `${finDone()} of ${FIN.needs.length} needs with a route`; }
      else if (t.dataset.plW2a && t.tagName === "INPUT") { const [lv, f] = t.dataset.plW2a.split(":"); w2a(lv)[f] = t.value; light(); updW2a(); }
    });
    sec.addEventListener("change", ev => {
      const t = ev.target;
      if (t.id === "plan-group") {
        plan.group = t.value;
        if (!plan.levers.length) plan.levers = suggested().slice();
        renderPlanActions(); changed();
      } else if (t.dataset.plLever) {
        const id = t.dataset.plLever;
        plan.levers = t.checked ? [...plan.levers.filter(x => x !== id), id] : plan.levers.filter(x => x !== id);
        changed();
      } else if (t.dataset.plStall) {
        const id = t.dataset.plStall;
        plan.stalls = t.checked ? [...plan.stalls.filter(x => x !== id), id] : plan.stalls.filter(x => x !== id);
        changed(false);
      } else if (t.dataset.plField === "lead" || t.dataset.plField === "payer" || t.dataset.plField === "phase") {
        planRow(t.closest("[data-pl-row]").dataset.plRow)[t.dataset.plField] = t.value; changed(false);
      } else if (t.dataset.plTrig && t.tagName === "SELECT") {
        trig()[t.dataset.plTrig] = t.value; changed(false);
      } else if (t.dataset.plLive !== undefined) {
        plan.liveCity = t.value; savePlan(); renderPlanLive(); if (t.value) track("plan-forecast-" + t.value);
      } else if (t.dataset.plW2a && t.tagName === "SELECT") {
        const [lv, f] = t.dataset.plW2a.split(":"); w2a(lv)[f] = t.value; light();
      } else if (t.dataset.plExpo) {
        const id = t.dataset.plExpo;
        plan.exposure = t.checked ? [...plan.exposure.filter(x => x !== id), id] : plan.exposure.filter(x => x !== id);
        savePlan(); renderPlanExposure(); renderPlanSummary();
        const el = document.querySelector(`[data-pl-expo="${id}"]`); if (el) el.focus();
      } else if (t.dataset.plChan) {
        const id = t.dataset.plChan, c = trig().channels || [];
        trig().channels = t.checked ? [...c.filter(x => x !== id), id] : c.filter(x => x !== id); light();
      }
    });
    sec.addEventListener("click", ev => {
      const ex = ev.target.closest("[data-plan-example]"); if (ex) { loadExample(ex.dataset.planExample); return; }
      const add = ev.target.closest("[data-pl-add]");
      if (add) { const id = add.dataset.plAdd; if (!plan.levers.includes(id)) plan.levers.push(id); renderPlanActions(); changed();
        const st = sec.querySelector("[data-pl-status]"); if (st) st.textContent = `Added “${leverById[id].title}”. Set who leads and pays in step 3.`; return; }
      const jump = ev.target.closest("[data-pl-step]");
      if (jump) { const el = document.getElementById("plan-step-" + jump.dataset.plStep); if (el) { el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }); const f = el.querySelector("input, select"); if (f) f.focus({ preventScroll: true }); } return; }
      const b = ev.target.closest("[data-pl-act]"); if (!b) return;
      const act = b.dataset.plAct, status = sec.querySelector("[data-pl-status]");
      track("plan-" + act);
      if (act === "map") goToMap(() => applyLevers(plan.levers, plan.place || "Your plan", "The actions in your plan, switched on together."));
      else if (act === "print") openPlan();
      else if (act === "link") { const u = planStartLink(); track("plan-link");
        navigator.clipboard.writeText(u).then(() => { if (status) status.textContent = "Link copied. Whoever opens it starts a plan with this place, group and actions (not your notes, owners or money)."; }, () => { if (status) status.textContent = u; }); }
      else if (act === "copy") navigator.clipboard.writeText(planText()).then(() => { if (status) status.textContent = "Plan copied. Paste it into an email or document."; }, () => { if (status) status.textContent = "Couldn’t copy. Use “Open a printable plan” instead."; });
      else if (act === "clear") { plan = { place: "", group: "", levers: [], rows: {}, example: null, stalls: [], triggers: {}, review: "", exposure: [], finance: {}, reviewLog: {} }; savePlan(); renderPlan(); }
    });
  })();

  /* ======================= THE FILM ======================= */
  // Opens on request only: it has sound, so it never autoplays and never loads until asked for.
  const film = document.getElementById("film"), filmVideo = document.getElementById("film-video"), filmEnd = document.getElementById("film-end");
  const termVideo = document.getElementById("term-video"), termEnd = document.getElementById("term-end");
  const filmTitle = document.getElementById("film-title"), filmTitleHTML = filmTitle ? filmTitle.innerHTML : "";
  // glossary explainers, in glossary order, for "Next term"
  const VIDEO_TERMS = GLOSS.filter(g => g.video && (typeof GLOSSARY_GROUPS === "undefined" || GLOSSARY_GROUPS.some(x => x.id === g.group)));
  let filmOpener = null, filmMode = "film", termNow = null;
  const activeVideo = () => filmMode === "term" ? termVideo : filmVideo;
  // the web behind the film's end card moves only when motion is welcome, and not if the visitor paused the title's loop
  const endWeb = document.getElementById("film-end-web");
  function endWebOn(on) {
    if (!endWeb) return;
    let stored = null; try { stored = localStorage.getItem("bth-hero-paused"); } catch (e) {}
    const still = stored === "1"; // like the title's loop, it moves unless the visitor paused it
    if (on && !still) { endWeb.muted = true; endWeb.preload = "auto"; const p = endWeb.play(); if (p && p.catch) p.catch(() => {}); } else endWeb.pause();
  }

  function showDialog(opener) {
    filmOpener = opener || document.activeElement;
    if (!film.open) { if (typeof film.showModal === "function") film.showModal(); else film.setAttribute("open", ""); }
    document.body.classList.add("film-open");
    const play = activeVideo().play(); if (play && play.catch) play.catch(() => {});
  }
  function setMode(mode) {
    filmMode = mode;
    const film_ = mode === "film";
    filmVideo.hidden = !film_; termVideo.hidden = film_;
    document.getElementById("film-note").hidden = !film_; document.getElementById("term-note").hidden = film_;
    filmEnd.hidden = true; termEnd.hidden = true; endWebOn(false);
    (film_ ? termVideo : filmVideo).pause();
  }
  function openFilm(opener) {
    if (!film || !filmVideo) return;
    track("watch-main-film");
    setMode("film");
    filmTitle.innerHTML = filmTitleHTML;
    showDialog(opener);
  }
  // every short film the player can show: glossary terms, vicious cycles and section films
  const VIDEO_LOOPS = LOOPS.filter(l => l.video);
  const VIDEO_STALLS = STALL_LIST.filter(x => x.video);
  const VIDEO_HOURS = HEATWAVE_DAY.map((h, i) => Object.assign({ i, id: h.time.replace(":", "") }, h)).filter(h => h.video);
  const SFILMS = typeof SECTION_FILMS !== "undefined" ? SECTION_FILMS : [];
  const filmFor = id => SFILMS.find(f => f.id === id);
  function clipFor(key) {
    const [kind, id] = key.includes(":") ? key.split(":") : ["term", key];
    const note = (title, text) => `<strong>${esc(title)}.</strong> ${esc(text)} <span class="film__note-meta">Captions are part of the picture.</span>`;
    if (kind === "term") {
      const g = glossById[id]; if (!g || !g.video) return null;
      const next = VIDEO_TERMS[VIDEO_TERMS.indexOf(g) + 1];
      return { key: "term:" + id, title: g.term, label: "plain-language glossary", video: g.video, length: g.length, note: note(g.term, g.text),
        next: next && { key: "term:" + next.id, title: next.term }, hash: "watch-" + id, endK: "Plain-language glossary", back: { label: "See all the terms", act: "glossary" } };
    }
    if (kind === "loop") {
      const l = loopById[id]; if (!l || !l.video) return null;
      const next = VIDEO_LOOPS[VIDEO_LOOPS.indexOf(l) + 1];
      return { key: "loop:" + id, title: l.name, label: "vicious cycle", video: l.video, length: l.length, note: note(l.name, l.summary),
        next: next && { key: "loop:" + next.id, title: next.name }, hash: "watch-loop-" + id, endK: "Vicious cycles", back: { label: "Walk through it on the map", act: "loop", id } };
    }
    if (kind === "day") {
      const h = VIDEO_HOURS.find(x => x.id === id); if (!h) return null;
      const next = VIDEO_HOURS[VIDEO_HOURS.indexOf(h) + 1];
      return { key: "day:" + id, title: `${h.time} · ${h.title}`, label: "a day in a heatwave", video: h.video, length: h.length,
        note: `<strong>${esc(h.time)} · ${esc(h.title)}.</strong> ${esc(h.text)} <span class="film__note-meta">${esc(h.who)}: an illustrative composite, not a real person. Captions are part of the picture.</span>`,
        next: next && { key: "day:" + next.id, title: `${next.time} · ${next.title}` }, hash: "watch-day-" + id, endK: "A day in a heatwave",
        back: { label: "See it on the map", act: "hour", id: String(h.i) } };
    }
    if (kind === "stall") {
      const x = VIDEO_STALLS.find(v => v.id === id); if (!x) return null;
      const next = VIDEO_STALLS[VIDEO_STALLS.indexOf(x) + 1], n = String(STALL_LIST.indexOf(x) + 1).padStart(2, "0");
      return { key: "stall:" + id, title: x.name, label: "why action stalls", video: x.video, length: x.length,
        note: `<strong>${n} · ${esc(x.name)}.</strong> ${esc(x.sign)} <span class="film__note-meta">Illustrative. Captions are part of the picture.</span>`,
        next: next && { key: "stall:" + next.id, title: next.name }, hash: "watch-stall-" + id, endK: "Why action stalls",
        back: { label: "Back to this card", act: "stall-" + id } };
    }
    if (kind === "film") {
      const f = filmFor(id); if (!f || !f.video) return null;
      return { key: "film:" + id, title: f.title, label: f.label, video: f.video, length: f.length, note: note(f.title, f.text),
        next: null, hash: "watch-" + id, endK: f.label, back: f.back };
    }
    return null;
  }
  function openExplainer(key, opener, autoplay = true) {
    const c = clipFor(key); if (!film || !c) return;
    track("watch-" + key.replace(":", "-"));
    setMode("term"); termNow = c;
    filmTitle.innerHTML = `${esc(c.title)} <span>· ${esc(c.label)}, ${esc(c.length || "0:30")}</span>`;
    termVideo.poster = c.video.replace(/\.mp4$/, ".jpg");
    termVideo.src = c.video;
    termVideo.setAttribute("aria-label", `${c.title}: a short film`);
    document.getElementById("term-note").innerHTML = c.note;
    const nextBtn = document.getElementById("term-next");
    nextBtn.hidden = !c.next;
    if (c.next) { nextBtn.dataset.id = c.next.key; nextBtn.innerHTML = `Next: ${esc(c.next.title)} <span aria-hidden="true">→</span>`; }
    const backBtn = document.getElementById("term-back");
    backBtn.hidden = !c.back;
    if (c.back) { backBtn.textContent = c.back.label; backBtn.dataset.back = c.back.act; backBtn.dataset.id = c.back.id || ""; }
    document.getElementById("term-end-k").textContent = c.endK;
    document.getElementById("term-end-h").textContent = c.next ? "Keep going?" : "That’s all for now";
    setHash(c.hash);
    if (autoplay) showDialog(opener);
    else { filmOpener = opener || null; if (typeof film.showModal === "function") film.showModal(); else film.setAttribute("open", ""); document.body.classList.add("film-open"); }
  }
  const watchButton = (key, label, cls = "watch-btn") => { const c = clipFor(key); return c ? `<button type="button" class="${cls}" data-watch="${key}"><span class="play-icon" aria-hidden="true"></span>${esc(label)} <span class="watch-btn__len">${esc(c.length || "")}</span></button>` : ""; };
  function closeFilm() {
    if (!film) return;
    filmVideo.pause(); termVideo.pause();
    if (film.open && typeof film.close === "function") film.close(); else film.removeAttribute("open");
  }
  if (film) {
    film.addEventListener("close", () => {
      filmVideo.pause(); termVideo.pause(); endWebOn(false); document.body.classList.remove("film-open");
      if (filmMode === "term" && location.hash.startsWith("#watch-")) setHash("");
      if (filmOpener && filmOpener.focus && document.contains(filmOpener)) filmOpener.focus();
    });
    // a click on the dark backdrop (outside the inner box) closes it
    film.addEventListener("click", ev => {
      if (ev.target === film) { closeFilm(); return; }
      const b = ev.target.closest("[data-film]"); if (!b) return;
      const what = b.dataset.film;
      if (what === "close") closeFilm();
      else if (what === "replay") { filmEnd.hidden = true; termEnd.hidden = true; endWebOn(false); const v = activeVideo(); v.currentTime = 0; v.play(); }
      else if (what === "next") openExplainer(b.dataset.id, filmOpener);
      else if (what === "back") {
        filmOpener = null; closeFilm();
        const act = b.dataset.back;
        if (act === "loop") goToMap(() => startStory(b.dataset.id));
        else if (act === "hour") goToMap(() => showHour(+b.dataset.id));
        else { const el = document.getElementById(act); if (el) el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }); }
      }
      else if (what === "tour") { filmOpener = null; closeFilm(); goToMap(() => tourStep(0)); }
      else if (what === "explore") { filmOpener = null; closeFilm(); document.getElementById("explore").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }); }
    });
    filmVideo.addEventListener("ended", () => { filmEnd.hidden = false; endWebOn(true); const first = filmEnd.querySelector("button"); if (first) first.focus(); });
    filmVideo.addEventListener("play", () => { filmEnd.hidden = true; endWebOn(false); });
    termVideo.addEventListener("ended", () => { termEnd.hidden = false; const first = termEnd.querySelector("button:not([hidden])"); if (first) first.focus(); });
    termVideo.addEventListener("play", () => { termEnd.hidden = true; });
    // play buttons anywhere on the page: the glossary list and the tap-to-define notes
    document.addEventListener("click", ev => {
      const b = ev.target.closest && ev.target.closest("[data-watch]"); if (!b) return;
      ev.preventDefault();
      const opener = b.closest("#term-pop") ? termBtn : b;
      closeTerm();
      openExplainer(b.dataset.watch, opener);
    });
    // tell search engines about the explainers
    if (VIDEO_TERMS.length || VIDEO_LOOPS.length || VIDEO_HOURS.length) {
      const ld = document.createElement("script"); ld.type = "application/ld+json";
      const allClips = [...VIDEO_TERMS.map(g => ({ term: `${g.term}: plain-language glossary`, text: g.text, video: g.video, length: g.length })),
        ...VIDEO_LOOPS.map(l => ({ term: `${l.name}: a vicious cycle of extreme heat`, text: l.summary, video: l.video, length: l.length })),
        ...VIDEO_HOURS.map(h => ({ term: `A day in a heatwave, ${h.time}: ${h.title}`, text: h.text, video: h.video, length: h.length })),
        ...SFILMS.filter(f => f.video).map(f => ({ term: f.title, text: f.text, video: f.video, length: f.length }))];
      ld.textContent = JSON.stringify(allClips.map(g => ({ "@context": "https://schema.org", "@type": "VideoObject", name: g.term, description: g.text,
        thumbnailUrl: location.origin + location.pathname.replace(/[^/]*$/, "") + g.video.replace(/\.mp4$/, ".jpg"), contentUrl: location.origin + location.pathname.replace(/[^/]*$/, "") + g.video,
        uploadDate: "2026-10-22", duration: "PT" + (g.length || "0:30").split(":").reduce((m, x, i) => i === 0 ? +x : `${m}M${+x}S`, 0), inLanguage: "en" })));
      document.head.appendChild(ld);
    }
  }

  /* ======================= THE 60-SECOND TOUR ======================= */
  const TOUR = [
    { title: "The web of extreme heat",
      text: () => `Extreme heat strains ${SYSTEMS.length} systems at once. Each dot is one of ${CONSEQUENCES.length} consequences, and each arrow shows how one thing leads to another.`,
      go: () => { clearMarks(); fitAll(); } },
    { title: "It starts with the heat",
      text: () => "Heat hits health, work, water, food and energy directly. From there, the harm spreads from one system to the next.",
      go: () => select("heat") },
    { title: "Some links loop back",
      text: () => "This is the cooling trap. Air conditioners pump hot air into the street, the city gets hotter, and people need even more cooling. A loop like this feeds itself, year after year.",
      go: () => { const l = loopById.cooling; mark({ nodes: l.path, loopEdges: new Set(l.edges), flow: new Set(l.edges) }); declutter(); flyTo(l.path, { maxK: 1.2 }); } },
    { title: "Every loop has a weak link", lever: true,
      text: () => "Switch on “Green, cool cities”. Trees, shade and cool roofs cut the link between hot streets and cooling demand. The loop is broken, and the map cools a little.",
      go: () => { const l = loopById.cooling; state.on = new Set(["greencity"]); applyBreakState(); mark({ nodes: l.path, edges: new Set(l.edges), levers: ["greencity"] }); declutter(); flyTo(l.path, { maxK: 1.2 }); } },
    { title: "Now it’s your turn",
      text: () => `There are ${LOOPS.length} vicious cycles on this map and ${LEVERS.length} places to break them. Tap any dot, switch on a package to see which loops break and who has to act, or ask how one thing leads to another.`,
      go: () => { state.on.clear(); state.pkg = null; applyBreakState(); clearMarks(); fitAll(); } }
  ];

  function tourStep(i) {
    const t = TOUR[i]; if (!t) return;
    state.story = null; state.inst = null;
    // only the "weak link" step switches a lever on; going back or forward switches it off again
    if (!t.lever && state.on.size) { state.on.clear(); state.pkg = null; applyBreakState(); }
    beforeFocus();
    t.go();
    state.selected = "tour"; state.tour = i;
    setHash("");
    const last = i === TOUR.length - 1;
    panelBody.innerHTML = `<p class="panel__kicker">The 60-second tour</p>
      <h2 class="panel__title">${esc(t.title)}</h2>
      <div class="progress" aria-hidden="true">${TOUR.map((_, k) => `<span class="${k <= i ? "is-done" : ""}"></span>`).join("")}</div>
      <p class="panel__step" aria-live="polite"><span>${i + 1} / ${TOUR.length}</span></p>
      <p class="panel__desc">${esc(t.text())}</p>
      <div class="panel__nav">
        <button class="btn btn--ghost" data-act="tour-prev" ${i === 0 ? "disabled" : ""}>← Back</button>
        <button class="btn" data-act="${last ? "tour-end" : "tour-next"}">${last ? "Start exploring" : "Next →"}</button>
      </div>
      ${last ? "" : `<button class="link" data-act="tour-end">Skip the tour</button>`}`;
  }

  /* ======================= A DAY IN A HEATWAVE ======================= */
  const andList = xs => xs.length > 1 ? xs.slice(0, -1).join(", ") + " and " + xs[xs.length - 1] : xs.join("");
  function showHour(i, mode) {
    const h = HEATWAVE_DAY[i]; if (!h) return;
    if (mode === "fix") { applyLevers(h.levers, `${h.time} · ${h.title}`, `What would have helped: ${h.who.toLowerCase()}.`); return; }
    state.story = null; state.inst = null; state.selected = "hour";
    const ns = new Set(), loopEdges = new Set();
    h.loops.forEach(lid => loopById[lid].edges.forEach(eid => { loopEdges.add(eid); const e = edgeById[eid]; ns.add(e.from); ns.add(e.to); }));
    mark({ nodes: ns, loopEdges, flow: loopEdges, levers: h.levers });
    const extra = LOOPS.filter(l => !h.loops.includes(l.id) && l.levers.some(v => h.levers.includes(v)));
    panelBody.innerHTML = `<p class="panel__kicker is-loop">A day in a heatwave · ${esc(h.time)}</p>
      <h2 class="panel__title">${esc(h.title)}</h2>
      <p class="illustrative">${esc(h.who)} · illustrative</p>
      <p class="panel__desc">${gloss(h.text)}</p>
      ${h.video ? watchButton("day:" + h.time.replace(":", ""), "Watch this moment") : ""}
      ${h.fact ? `<p class="fact">${gloss(h.fact)}${h.source ? ` <span class="fact__src">Source: ${extLink(h.source.url, h.source.label)}</span>` : ""}</p>` : ""}
      <h3 class="panel__h">Loops in play</h3><ul class="loop-list">${h.loops.map(l => loopItem(loopById[l])).join("")}</ul>
      <h3 class="panel__h panel__h--break">What would help</h3><ul class="lever-list">${h.levers.map(v => leverItem(leverById[v])).join("")}</ul>
      ${extra.length ? `<p class="panel__note">These levers also act on ${andList(extra.map(l => `<button class="link" data-story="${l.id}">${esc(l.name.replace(/^The /, "the "))}</button>`))}.</p>` : ""}
      <button class="btn btn--full" data-hour="${i}" data-mode="fix">Switch these levers on</button>
      <button class="link" data-act="clear">← Back to the whole web</button>`;
    beforeFocus();
    flyTo([...ns], { maxK: 1.2 });
  }

  /* ======================= PAGE SECTIONS ======================= */
  function renderControls() {
    document.getElementById("filters").innerHTML = `<button class="chip" data-filter="all" aria-pressed="true">Whole web</button>` +
      SYSTEMS.map(s => `<button class="chip" data-filter="${s.id}" aria-pressed="false" style="--c:${s.color}"><span class="dot"></span>${esc(plain(s))}</button>`).join("");
    document.getElementById("who").innerHTML = `<option value="">Who can act?</option>` +
      INSTITUTIONS.map(i => `<option value="${i.id}">${esc(i.name)}</option>`).join("");

    const pk = document.getElementById("pkg-chips");
    if (pk) pk.innerHTML = `<button class="pkg-chip pkg-chip--now" data-pkg="now" aria-pressed="false">${esc(pkgById.now.title)}</button>` +
      PACKAGES.map(p => `<button class="pkg-chip" data-pkg="${p.id}" aria-pressed="false">${esc(p.title)}</button>`).join("") +
      `<button class="pkg-chip pkg-chip--all" data-pkg="all" aria-pressed="false">Everything</button>`;

    const opts = SYSTEMS.map(s => `<optgroup label="${esc(plain(s))}">${nodes.filter(n => n.sys === s.id && n.kind === "leaf").map(n => `<option value="${n.id}">${esc(plain(n))}</option>`).join("")}</optgroup>`).join("");
    const from = document.getElementById("path-from"), to = document.getElementById("path-to");
    if (from && to) {
      from.innerHTML = opts; to.innerHTML = opts;
      from.value = "drysoil"; to.value = "dropout";
    }

    const day = document.getElementById("day-list");
    if (day) day.innerHTML = HEATWAVE_DAY.map((h, i) => `
      <li class="hour">
        <p class="hour__time">${esc(h.time)}</p>
        <h3 class="hour__title">${esc(h.title)}</h3>
        <p class="illustrative">${esc(h.who)}</p>
        <p class="hour__text">${esc(h.text)}</p>
        ${h.fact ? `<p class="hour__fact">${gloss(h.fact)}${h.source ? ` <span>Source: ${extLink(h.source.url, h.source.label)}</span>` : ""}</p>` : ""}
        <p class="hour__loops">${h.loops.map(l => `<button class="loop-chip" data-story="${l}">↺ ${esc(loopById[l].name.replace(/^The /, ""))}</button>`).join("")}</p>
        ${h.video ? watchButton("day:" + h.time.replace(":", ""), "Watch this moment", "watch-btn watch-btn--dark") : ""}
        <div class="hour__actions">
          <button class="btn btn--ghost btn--sm" data-hour="${i}">See it on the map</button>
          <button class="btn btn--sm btn--teal" data-hour="${i}" data-mode="fix">What would help?</button>
        </div>
      </li>`).join("");
  }

  function renderLoopsSection() {
    document.getElementById("loop-groups").innerHTML = LOOP_GROUPS.map(g => {
      const ls = LOOPS.filter(l => l.group === g.id);
      return `<div class="lgroup">
        <h3 class="lgroup__h">${esc(g.name)} <span>${plural(ls.length, "loop")}</span></h3>
        ${ls.map(l => `
          <article class="lrow" data-loop="${l.id}">
            <div class="lrow__head">
              <h4><button class="lrow__name" data-story="${l.id}">${esc(l.name)}</button></h4>
              <span class="ev ev--${l.evidence}">${evidenceLabel(l.evidence)}</span>
              <span class="ev ev--broken">✓ Action switched on</span>
            </div>
            <p class="lrow__sum">${gloss(l.summary)}</p>
            ${stakesHTML(l)}
            ${watchButton("loop:" + l.id, "Watch this loop")}
            ${chainHTML(l)}
            ${typeof LOOP_PLACES !== "undefined" && LOOP_PLACES[l.id] ? `<p class="place"><span>Where to look</span>${esc(LOOP_PLACES[l.id])}</p>` : ""}
            ${evidenceHTML(l, false)}
            ${l.levers.length ? `<p class="lrow__breaks"><span>Break it:</span> ${l.levers.map(lid => `<button class="lever-chip" data-lever="${lid}">${esc(leverById[lid].title)}<span class="lever-chip__when">${esc(WHEN[leverById[lid].when] || "")}</span></button>`).join("")}</p>` : ""}
            ${solsHTML(l)}
          </article>`).join("")}
      </div>`;
    }).join("");

    const ranked = nodes.filter(n => n.kind !== "domain" && n.loops.length > 1).sort((a, b) => b.loops.length - a.loops.length).slice(0, 6);
    document.getElementById("pressure-points").innerHTML = ranked.map(n => `<li><button class="pp" data-go="${n.id}"><span class="pp__n">${n.loops.length}</span><span class="pp__name">${esc(plain(n))}</span><span class="pp__meta">loops run through it</span></button></li>`).join("");
    const multi = LEVERS.filter(v => v.loops.length > 1).sort((a, b) => b.loops.length - a.loops.length);
    document.getElementById("multi-levers").innerHTML = multi.map(v => `<li><button class="pp pp--lever" data-lever="${v.id}"><span class="pp__n">${v.loops.length}</span><span class="pp__name">${esc(v.title)}</span><span class="pp__meta">loops it acts on</span></button></li>`).join("");
  }

  function renderInstitutions() {
    const ranked = INSTITUTIONS.slice().sort((a, b) => b.loops.size - a.loops.size || b.levers.length - a.levers.length);
    const max = Math.max(...ranked.map(i => i.loops.size), 1);
    document.getElementById("inst-list").innerHTML = ranked.map(i => `
      <li><button class="inst" data-inst="${i.id}">
        <span class="inst__name">${esc(i.name)}</span>
        <span class="inst__bar" aria-hidden="true"><span style="width:${(i.loops.size / max * 100).toFixed(1)}%"></span></span>
        <span class="inst__meta"><strong>${i.loops.size}</strong> loop${i.loops.size === 1 ? "" : "s"} · ${i.levers.length} lever${i.levers.length === 1 ? "" : "s"}</span>
      </button></li>`).join("");
  }

  function renderNetwork() {
    const roles = document.getElementById("org-roles"), list = document.getElementById("org-list"), gaps = document.getElementById("gap-list");
    if (!list || !ORGS.length) return;
    const R = typeof ORG_ROLES !== "undefined" ? ORG_ROLES : [];
    roles.innerHTML = `<button class="chip" data-role="all" aria-pressed="true">All <span>${ORGS.length}</span></button>` +
      R.map(r => `<button class="chip" data-role="${r.id}" aria-pressed="false">${esc(r.name)} <span>${ORGS.filter(o => o.role === r.id).length}</span></button>`).join("");
    // demand, supply or platform: each organisation's main side in a heat alliance (ORG_SIDES, ORG_SIDE)
    const SD = typeof ORG_SIDES !== "undefined" ? ORG_SIDES : [], SIDE = typeof ORG_SIDE !== "undefined" ? ORG_SIDE : {};
    const sides = document.getElementById("org-sides");
    if (sides && SD.length) sides.innerHTML = `<span class="org-sides__k" id="org-sides-k">Side</span><button class="chip" data-side="all" aria-pressed="true">All</button>` +
      SD.map(x => `<button class="chip" data-side="${x.id}" aria-pressed="false" title="${esc(x.text)}">${esc(x.name)} <span>${ORGS.filter(o => SIDE[o.id] === x.id).length}</span></button>`).join("");
    const sideDef = document.getElementById("org-side-def");
    list.innerHTML = ORGS.map(o => `
      <li class="org" data-role="${o.role}" data-side="${SIDE[o.id] || ""}">
        <p class="org__role">${esc((R.find(r => r.id === o.role) || {}).name || "")}${SIDE[o.id] ? `<span class="org__side org__side--${SIDE[o.id]}">${esc((SD.find(x => x.id === SIDE[o.id]) || {}).name || "")}</span>` : ""}</p>
        <h3 class="org__name">${extLink(o.url, o.name)}</h3>
        <p class="org__does">${gloss(o.does)}</p>
        <p class="org__levers">${o.levers.map(v => leverById[v] ? `<button class="lever-chip" data-lever="${v}">${esc(leverById[v].title)}</button>` : "").join("")}</p>
      </li>`).join("");
    // show a dozen at a time so the list never overwhelms
    const FIRST = 12;
    let role = "all", side = "all", expanded = false, query = "";
    const search = document.getElementById("org-search"), count = document.getElementById("org-count");
    const more = document.createElement("button");
    more.type = "button"; more.className = "btn btn--ghost btn--sm org-more";
    list.after(more);
    function showOrgs() {
      const q = query.trim().toLowerCase();
      const match = [...list.querySelectorAll(".org")].filter(li => (role === "all" || li.dataset.role === role) && (side === "all" || li.dataset.side === side) && (!q || li.textContent.toLowerCase().includes(q)));
      if (count) count.textContent = q ? (match.length ? `${plural(match.length, "organisation")} match “${query.trim()}”` : `No organisation on this list matches “${query.trim()}”.`) : (side !== "all" || role !== "all" ? `${plural(match.length, "organisation")} shown` : "");
      list.querySelectorAll(".org").forEach(li => { li.hidden = true; });
      match.forEach((li, i) => { li.hidden = !expanded && i >= FIRST; });
      more.hidden = match.length <= FIRST;
      more.textContent = expanded ? "Show fewer" : `Show all ${match.length} organisations`;
      more.setAttribute("aria-expanded", expanded ? "true" : "false");
    }
    more.addEventListener("click", () => { expanded = !expanded; showOrgs(); if (!expanded) roles.scrollIntoView({ block: "nearest" }); });
    if (search) search.addEventListener("input", () => { query = search.value; expanded = false; showOrgs(); });
    roles.addEventListener("click", ev => {
      const b = ev.target.closest("[data-role]"); if (!b) return;
      roles.querySelectorAll("[data-role]").forEach(x => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
      role = b.dataset.role; expanded = false; showOrgs();
    });
    if (sides) sides.addEventListener("click", ev => {
      const b = ev.target.closest("[data-side]"); if (!b) return;
      sides.querySelectorAll("[data-side]").forEach(x => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
      side = b.dataset.side; expanded = false;
      const def = SD.find(x => x.id === side); if (sideDef) { sideDef.textContent = def ? `${def.name}: ${def.text}` : ""; sideDef.hidden = !def; }
      showOrgs();
    });
    showOrgs();
    const gf = document.getElementById("gaps-film"); if (gf) gf.innerHTML = watchButton("film:gaps", "Watch: where the gaps may be");
    const mf = document.getElementById("method-film"); if (mf) mf.innerHTML = watchButton("film:method", "Watch: how this map works");
    const bf = document.getElementById("barriers-film"); if (bf) bf.innerHTML = watchButton("film:barriers", "Watch: same heatwave, different barriers");
    const ranked = LOOPS.map(l => ({ l, n: orgsForLoop(l).length })).sort((a, b) => a.n - b.n);
    const max = Math.max(...ranked.map(x => x.n), 1);
    gaps.innerHTML = ranked.map(({ l, n }) => `
      <li><button class="gap${n === 0 ? " gap--none" : ""}" data-story="${l.id}">
        <span class="gap__name">${esc(l.name)}</span>
        <span class="gap__n">${n === 0 ? "No one on this list" : plural(n, "organisation")}</span>
        <span class="gap__bar" aria-hidden="true"><span style="width:${(n / max * 100).toFixed(1)}%"></span></span>
      </button></li>`).join("");
  }

  /* ---- glossary popover ---- */
  const termPop = document.createElement("div");
  termPop.className = "term-pop"; termPop.id = "term-pop"; termPop.setAttribute("role", "dialog"); termPop.hidden = true;
  document.body.appendChild(termPop);
  let termBtn = null;
  function closeTerm() { if (termBtn) { termBtn.setAttribute("aria-expanded", "false"); termBtn.removeAttribute("aria-describedby"); } termBtn = null; termPop.hidden = true; }
  function openTerm(btn) {
    const g = glossById[btn.dataset.term]; if (!g) return;
    closeTerm(); termBtn = btn;
    termPop.innerHTML = `<strong>${esc(g.term)}</strong> ${esc(g.text)}${g.video ? `<button type="button" class="term-pop__watch" data-watch="${g.id}"><span class="play-icon" aria-hidden="true"></span>Watch the explainer <span>(${esc(g.length || "0:30")})</span></button>` : ""}`;
    termPop.hidden = false;
    termPop.setAttribute("aria-label", g.term);
    btn.setAttribute("aria-expanded", "true"); btn.setAttribute("aria-describedby", "term-pop");
    const r = btn.getBoundingClientRect(), w = termPop.offsetWidth, h = termPop.offsetHeight;
    const left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8));
    const top = r.bottom + 8 + h > window.innerHeight ? r.top - h - 8 : r.bottom + 8;
    termPop.style.left = left + "px"; termPop.style.top = Math.max(8, top) + "px";
  }
  window.addEventListener("click", ev => {
    const b = ev.target.closest && ev.target.closest(".term");
    if (b) { ev.preventDefault(); if (termBtn === b) closeTerm(); else openTerm(b); return; }
    if (!termPop.hidden && !termPop.contains(ev.target)) closeTerm();
  }, true);
  window.addEventListener("keydown", ev => { if (ev.key === "Escape" && !termPop.hidden) { ev.stopImmediatePropagation(); const b = termBtn; closeTerm(); if (b) b.focus(); } }, true);
  window.addEventListener("scroll", () => { if (!termPop.hidden) closeTerm(); }, { passive: true, capture: true });

  function renderGlossary() {
    const box = document.getElementById("glossary-list"); if (!box || !GLOSS.length) return;
    const groups = typeof GLOSSARY_GROUPS !== "undefined" ? GLOSSARY_GROUPS : [];
    const listed = GLOSS.filter(g => groups.some(x => x.id === g.group));
    document.querySelectorAll("[data-glossary-count]").forEach(x => { x.textContent = listed.length; });
    box.innerHTML = groups.map((grp, i) => {
      const terms = listed.filter(g => g.group === grp.id);
      return `<details class="gloss-group"${i === 1 ? " open" : ""}>
        <summary>${esc(grp.name)} <span>${terms.length}</span></summary>
        <dl>${terms.map(g => `<div id="term-${g.id}"><dt>${esc(g.term)}${g.video ? ` <button type="button" class="gloss-watch" data-watch="${g.id}" aria-label="Watch the ${esc(g.term.toLowerCase())} explainer (${esc(g.length || "0:30")})"><span class="play-icon" aria-hidden="true"></span>${esc(g.length || "0:30")}</button>` : ""}</dt><dd>${esc(g.text)}${g.source ? `<span class="gloss-src">Source: ${extLink(g.source.url, g.source.label)}</span>` : ""}</dd></div>`).join("")}</dl>
      </details>`;
    }).join("");
  }

  // Who heat hits hardest: exposure plus barriers, each group linked to its consequences and levers.
  function renderAtRisk() {
    const box = document.getElementById("atrisk-list"), bar = document.getElementById("atrisk-barriers");
    if (!box || typeof AT_RISK === "undefined") return;
    if (bar) bar.innerHTML = AT_RISK_BARRIERS.map(b => `<li><h3>${esc(b.q)}</h3><p>${esc(b.a)}</p></li>`).join("");
    box.innerHTML = AT_RISK.map(g => `<article class="risk" id="risk-${g.id}">
        <h3 class="risk__name">${esc(g.name)}</h3>
        <dl class="risk__dl"><dt>Exposed to</dt><dd>${esc(g.exposure)}</dd><dt>Held back by</dt><dd>${esc(g.barriers)}</dd></dl>
        ${[g.fact ? g : null, ...(g.more || [])].filter(Boolean).map(f => `<p class="risk__fact">${esc(f.fact)} <a href="${esc(f.source.url)}" target="_blank" rel="noopener">${esc(f.source.label)}<span class="visually-hidden"> (opens in a new tab)</span></a></p>`).join("")}
        <p class="risk__row"><span>On the map:</span> ${g.nodes.filter(id => byId[id]).map(id => `<button type="button" class="node-chip" data-go="${id}" style="--c:${byId[id].color}">${esc(plain(byId[id]))}</button>`).join("")}</p>
        <p class="risk__row risk__row--break"><span>What helps:</span> ${g.levers.filter(id => leverById[id]).map(id => `<button type="button" class="lever-chip" data-lever="${id}">${esc(leverById[id].title)}</button>`).join("")}</p>
      </article>`).join("");
  }

  // Weather, work and the person: three overlapping circles; heat strain is where they meet. Never a score.
  function renderStrain() {
    const box = document.getElementById("strain-box"); if (!box || typeof STRAIN === "undefined") return;
    const S = STRAIN; let sel = "weather";
    const pos = { weather: [190, 128], work: [290, 128], person: [240, 214] };
    const src = f => `${extLink(f.source.url, f.source.label)}${f.also ? `; ${extLink(f.also.url, f.also.label)}` : ""}`;
    const art = () => `<svg viewBox="0 0 480 330" class="strain-svg" aria-hidden="true">
        ${S.parts.map(p => `<circle cx="${pos[p.id][0]}" cy="${pos[p.id][1]}" r="96" class="strain-c strain-c--${p.id}${sel === p.id ? " is-on" : ""}"/>`).join("")}
        ${S.parts.map(p => { const [x, y] = pos[p.id], dx = { weather: -36, work: 36, person: 0 }[p.id], dy = p.id === "person" ? 52 : -36;
          return `<text x="${x + dx}" y="${y + dy}" class="strain-t">${esc(p.name.replace(/^The /, ""))}</text>`; }).join("")}
        <circle cx="240" cy="158" r="30" class="strain-core"/><text x="240" y="154" class="strain-ct">Heat</text><text x="240" y="170" class="strain-ct">strain</text>
      </svg>`;
    const detail = () => { const p = S.parts.find(x => x.id === sel);
      return `<p class="hh-k">${p.n} · ${esc(p.name)}</p><p>${gloss(p.text)}</p><ul class="strain-facts">${p.facts.map(f => `<li>${esc(f.text)} <span class="cool-ev__src">${src(f)}</span></li>`).join("")}</ul>`; };
    const paint = () => {
      box.querySelector(".strain-art").innerHTML = art();
      box.querySelector(".strain-detail").innerHTML = detail();
      box.querySelectorAll("[data-strain]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.strain === sel)));
    };
    const chips = (ids, map, attr, cls) => ids.filter(id => map[id]).map(id => `<button type="button" class="${cls}" ${attr}="${id}"${cls === "node-chip" ? ` style="--c:${map[id].color}"` : ""}>${esc(cls === "node-chip" ? plain(map[id]) : map[id].title)}</button>`).join("");
    box.innerHTML = `<p class="hh-intro">${esc(S.intro)}</p>
      <div class="hh-grid">
        <div class="hh-stage strain-stage">
          <div class="strain-art"></div>
          <div class="hh-picks strain-picks" role="group" aria-label="Choose one of the three">${S.parts.map(p => `<button type="button" data-strain="${p.id}"><b>${p.n}</b><span>${esc(p.name)}<small>${esc(p.short)}</small></span></button>`).join("")}</div>
        </div>
        <div class="hh-side">
          <div class="hh-detail strain-detail" aria-live="polite"></div>
          ${watchButton("film:strain", "Watch: weather, work and the person")}
          <p>${printLink("weather-work-person", "Print the one-pager, with questions for heat plans")}</p>
        </div>
      </div>
      <p class="hh-nuance">${esc(S.close)}</p>
      <h4 class="strain-gh">Three groups heat plans often miss</h4>
      <div class="strain-groups">${S.groups.map(g => `<article class="strain-g" id="strain-${g.id}"><h5>${esc(g.name)}</h5><p>${esc(g.text)}</p><p class="strain-g__do">${esc(g.caution)}</p><p class="cool-ev__src">${extLink(g.source.url, g.source.label)}</p>
          <p class="risk__row"><span>On the map:</span> ${chips(g.nodes, byId, "data-go", "node-chip")}</p><p class="risk__row risk__row--break"><span>What helps:</span> ${chips(g.levers, leverById, "data-lever", "lever-chip")}</p></article>`).join("")}</div>
      <p class="hh-plans"><b>For heat plans</b> ${esc(S.plans)}</p>`;
    box.addEventListener("click", ev => { const b = ev.target.closest("[data-strain]"); if (b) { sel = b.dataset.strain; paint(); track("strain-" + sel); } });
    paint();
  }

  // Find practical actions: settings as tabs, eight-line action cards, and questions people arrive with
  const PA = typeof ACTION_SETTINGS !== "undefined" ? ACTION_SETTINGS : [], PA_LINES = typeof ACTION_LINES !== "undefined" ? ACTION_LINES : [];
  const PA_Q = typeof ACTION_JOURNEYS !== "undefined" ? ACTION_JOURNEYS : [];
  const EV_ST = typeof EVIDENCE_STATUS !== "undefined" ? EVIDENCE_STATUS : {}, HZ = typeof ACTION_HORIZONS !== "undefined" ? ACTION_HORIZONS : [];
  // a small label for the kind of evidence, with its meaning on hover and for screen readers
  const evTag = st => EV_ST[st] ? `<span class="ev-tag ev-tag--${st}" title="${esc(EV_ST[st].text)}">${esc(EV_ST[st].name)}<span class="visually-hidden">: ${esc(EV_ST[st].text)}</span></span>` : "";
  // Drawn line icons for each setting, in the same stroke as the figures. Decorative: the name beside each carries the meaning.
  const SETTING_ICON = {
    work: '<path d="M5 18 a9 9 0 0 1 18 0 Z M3 18 H25 M14 9 V6"/><path d="M9 22 H19" class="ic-a"/>',
    homes: '<path d="M4 14 L14 5 L24 14 M7 12 V24 H21 V12"/><path d="M12 24 V18 H16 V24" class="ic-a"/>',
    schools: '<path d="M14 8 C10 5 6 5 3 6 V22 C6 21 10 21 14 24 C18 21 22 21 25 22 V6 C22 5 18 5 14 8 Z M14 8 V24"/>',
    clinics: '<rect x="4" y="5" width="20" height="19" rx="3"/><path d="M14 10 V19 M9.5 14.5 H18.5" class="ic-a"/>',
    neighbourhoods: '<path d="M3 11 L6 5 H22 L25 11 Q22 14 19.5 11 Q17 14 14 11 Q11 14 8.5 11 Q6 14 3 11 Z" class="ic-a"/><path d="M5 12 V24 H23 V12 M5 18 H23"/>',
    summer: '<rect x="4" y="7" width="20" height="17" rx="2"/><path d="M4 12 H24 M9 4 V9 M19 4 V9"/><circle cx="14" cy="18" r="2.6" class="ic-a"/>'
  };
  const settingIcon = id => SETTING_ICON[id] ? `<svg class="set-ic" viewBox="0 0 28 28" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${SETTING_ICON[id]}</g></svg>` : "";
  let paSel = "", paHz = "";
  function paCost(ref) {
    const pl = ref && COOL.find(x => x.id === ref[0]), o = pl && pl.options.find(x => x.name === ref[1]);
    return o ? `<span class="pa-cost">Rough cost: ${coolCost(o.cost)} <a href="#cool-${pl.id}">See cooling options</a></span>` : "";
  }
  function paLine(c, key) {
    if (key === "who") return esc(c.who.map(id => instById[id] ? instById[id].name : id).join(", "));
    if (key === "running") return `${esc(c.running)}${paCost(c.cost)}`;
    if (key === "evidence") return `${esc(c.evidence.text)} <span class="cool-ev__src">${extLink(c.evidence.source.url, c.evidence.source.label)}</span>`;
    if (key === "worksIf") return `<ul>${c.worksIf.map(x => `<li>${esc(x)}</li>`).join("")}</ul>`;
    return esc(c[key]);
  }
  const paCard = c => `<article class="pa-card" id="pa-${c.id}" data-hz="${c.horizon || ""}">
      <p class="pa-card__tags">${evTag(c.status)}${(h => h ? `<span class="hz-tag">${esc(h.name)}</span>` : "")(HZ.find(x => x.id === c.horizon))}</p>
      <h3 class="pa-card__t">${esc(c.title)}</h3>
      <dl class="pa-card__dl">${PA_LINES.map(([k, label]) => `<div class="pa-l pa-l--${k}"><dt>${esc(label)}</dt><dd>${paLine(c, k)}</dd></div>`).join("")}</dl>
      ${c.delivery ? `<details class="pa-deliver"><summary>Delivery details</summary><dl>${c.delivery.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl></details>` : ""}
      ${(c.examples || []).length ? `<div class="pa-ex"><p class="pa-ex__k">Where it has been tried</p>${c.examples.map(x => `<p>${evTag(x.status)} ${esc(x.text)} <span class="cool-ev__src">${extLink(x.source.url, x.source.label)}</span></p>`).join("")}</div>` : ""}
      <p class="pa-card__go"><button type="button" class="btn btn--sm btn--teal" data-pa-add="${c.lever}">Add to my plan</button>
        ${leverById[c.lever] ? `<button type="button" class="lever-chip" data-lever="${c.lever}">Why it matters: see it on the map</button>` : ""}
        ${c.plan ? `<a href="#plan-step-${c.plan}">Step ${c.plan} of the plan</a>` : ""}</p>
    </article>`;
  function paStalls() {
    return `<p class="pa-intro">Most heat interventions that fail do so for a handful of reasons that have nothing to do with the technology. Find yours, then what has moved it elsewhere.</p>
      <ul class="pa-stalls">${STALL_LIST.map(x => `<li><h3>${esc(x.name)}</h3><p><b>You can tell when</b> ${esc(x.sign)}</p><p><b>What moves it</b> ${esc(x.moves[0])}</p><a href="#stall-${x.id}">More on this</a></li>`).join("")}</ul>
      <p class="pa-more"><a href="#stalls">All seven, with evidence</a> · <a href="#cool-traps">Five traps that waste cooling money</a> · <a href="#plan-step-5">Add them to a plan</a></p>`;
  }
  function showPractical(id, focus) {
    const panelEl = document.getElementById("pa-panel"); if (!panelEl) return;
    paSel = id;
    document.querySelectorAll("#pa-tabs [role=tab]").forEach(b => { const on = b.dataset.pa === id;
      b.setAttribute("aria-selected", on ? "true" : "false"); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); });
    document.querySelectorAll("#pa-journeys [data-pa-go]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.paGo === id)));
    if (id === "stalls") { panelEl.removeAttribute("aria-labelledby"); panelEl.setAttribute("aria-label", "Why interventions fail"); panelEl.innerHTML = paStalls(); return; }
    const st = PA.find(x => x.id === id) || PA[0];
    panelEl.removeAttribute("aria-label"); panelEl.setAttribute("aria-labelledby", "pa-tab-" + st.id);
    const q = PA_Q.find(x => x.go === st.id && x.also), also = q && PA.find(x => x.id === q.also);
    panelEl.innerHTML = `<div class="pa-head"><p class="pa-intro">${esc(st.intro)}</p>
        <p class="pa-head__go">${(cp => cp ? `<a class="pa-join" href="#cool-${cp.id}">Options, costs and traps for ${esc(cp.name.toLowerCase())} <span aria-hidden="true">→</span></a> · ` : "")(st.cool && COOL.find(x => x.id === st.cool))}${printLink("actions-" + st.id, `Print the ${st.short.toLowerCase()} cards`)}${also ? ` · <button type="button" class="link" data-pa-tab="${also.id}">Also: ${esc(also.name.toLowerCase())}</button>` : ""}</p></div>
      ${st.problems ? `<div class="pa-problems"><p class="pa-problems__k">What workers told researchers</p><div class="pa-problems__list">${st.problems.map(x => x.setting ? `<button type="button" class="pa-prob" data-pa-tab="${x.setting}">${esc(x.q)} <span aria-hidden="true">→</span></button>` : `<a class="pa-prob" href="#pa-${x.cards[0]}">${esc(x.q)} <span aria-hidden="true">↓</span></a>`).join("")}</div>
        <p class="cool-ev__src">${extLink(st.problemsSource.url, st.problemsSource.label)}</p></div>` : ""}
      <div class="pa-hz" role="group" aria-label="Show actions by when they protect people"><button type="button" data-pa-hz="" aria-pressed="${!paHz}">All</button>${HZ.map(h => `<button type="button" data-pa-hz="${h.id}" aria-pressed="${paHz === h.id}">${esc(h.name)}</button>`).join("")}</div>
      <div class="pa-cards">${st.cards.filter(c => !paHz || c.horizon === paHz).map(paCard).join("") || `<p class="pa-intro">No ${esc(st.short.toLowerCase())} actions for this time frame. <button type="button" class="link" data-pa-hz="">Show all</button></p>`}</div>
      <p class="pa-key">Evidence labels say what kind of evidence a card cites, not how good the action is. <a href="#evidence-labels">What each label means</a></p>`;
  }
  function renderEvKey() { const k = document.getElementById("ev-key"); if (k) k.innerHTML = Object.entries(EV_ST).map(([id, x]) => `<div><dt>${evTag(id)}</dt><dd>${esc(x.text)}</dd></div>`).join(""); }
  function renderPractical() {
    renderEvKey();
    const tabs = document.getElementById("pa-tabs"), jr = document.getElementById("pa-journeys"); if (!tabs || !PA.length) return;
    jr.innerHTML = `<p class="pa-journeys__k">Start from a question</p>` + PA_Q.map(x => `<button type="button" class="pa-q" data-pa-go="${x.go}" aria-pressed="false">${esc(x.q)}</button>`).join("");
    tabs.innerHTML = PA.map(x => `<button type="button" role="tab" class="cool-tab" id="pa-tab-${x.id}" data-pa="${x.id}" aria-controls="pa-panel" aria-selected="false" tabindex="-1">${settingIcon(x.id)}${esc(x.name)}</button>`).join("");
    const hash = decodeURIComponent(location.hash.slice(1));
    showPractical(hash.startsWith("practical-") && (PA.some(x => x.id === hash.slice(10)) || hash.slice(10) === "stalls") ? hash.slice(10) : PA[0].id);
    const sec = document.getElementById("practical");
    // links such as #practical-clinics open that setting
    window.addEventListener("hashchange", () => { const h = decodeURIComponent(location.hash.slice(1)); if (!h.startsWith("practical-")) return;
      const id = h.slice(10); if (PA.some(x => x.id === id) || id === "stalls") { showPractical(id); sec.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }); } });
    sec.addEventListener("click", ev => {
      const t = ev.target.closest("[data-pa]") || ev.target.closest("[data-pa-tab]"); if (t) { showPractical(t.dataset.pa || t.dataset.paTab); track("practical-" + (t.dataset.pa || t.dataset.paTab)); return; }
      const g = ev.target.closest("[data-pa-go]");
      if (g && g.dataset.paGo === "heatweek") { track("practical-q-heatweek"); window.open("/a-week-in-the-heat/", "_blank", "noopener"); return; }
      if (g && g.dataset.paGo === "finance") { track("practical-q-finance"); window.open(FINANCE_URL, "_blank", "noopener"); return; }
      if (g) { showPractical(g.dataset.paGo); track("practical-q-" + g.dataset.paGo); document.getElementById("pa-panel").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }); return; }
      const hz = ev.target.closest("[data-pa-hz]");
      if (hz) { paHz = hz.dataset.paHz; showPractical(paSel); track("practical-hz-" + (paHz || "all")); const f = document.querySelector(`#pa-panel [data-pa-hz="${paHz}"]`); if (f) f.focus(); return; }
      const a = ev.target.closest("[data-pa-add]");
      if (a) { const id = a.dataset.paAdd, st = document.getElementById("pa-status"), had = plan.levers.includes(id);
        if (!had) { plan.levers.push(id); savePlan(); renderPlan(); }
        if (st) st.innerHTML = had ? `“${esc(leverById[id].title)}” is already in your plan. <a href="#plan-step-3">Open the plan</a>` : `Added “${esc(leverById[id].title)}” to your plan. <a href="#plan-step-3">Set who leads and pays</a>`;
        track("practical-add-" + id); }
    });
    tabs.addEventListener("keydown", ev => {
      const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }, all = [...tabs.querySelectorAll("[role=tab]")];
      const i = all.indexOf(document.activeElement); if (i < 0) return;
      let j = null;
      if (ev.key in keys) j = (i + keys[ev.key] + all.length) % all.length; else if (ev.key === "Home") j = 0; else if (ev.key === "End") j = all.length - 1;
      if (j === null) return;
      ev.preventDefault(); showPractical(all[j].dataset.pa, true);
    });
  }

  // Paying for protection: what needs paying for, three kinds of trigger, basis risk, the payment path, lasting, and cases
  // "From trigger to protection", drawn: a heat trigger, a fund holder, a person receiving support, and a family resting in shade,
  // with the support handed along beneath one canopy. Decorative; the numbered list under it carries the meaning.
  const finFlowArt = `<svg class="fin-flow__art" viewBox="0 0 800 210" aria-hidden="true" focusable="false">
    <path class="ff-canopy" d="M30 64 Q400 0 770 64 L770 76 Q400 14 30 76 Z" fill="#F26430"/>
    <g fill="none" stroke="#16202B" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M30 76 V200 M770 76 V200" opacity=".5"/>
      <path d="M58 200 V112 M58 112 a8 8 0 0 1 16 0 V178"/><circle cx="66" cy="186" r="11" fill="#F26430" stroke="#F26430"/><path d="M66 176 V140" stroke="#F26430"/>
      <circle cx="112" cy="112" r="11"/><path d="M112 123 V164 L101 200 M112 164 L123 200 M112 133 L88 112 M112 133 L144 146"/>
      <path d="M256 200 V158 H344 V200 M250 158 H350"/><circle cx="300" cy="104" r="11"/><path d="M300 115 V150 M300 126 L268 140 M300 126 L334 140"/>
      <circle cx="500" cy="112" r="11"/><path d="M500 123 V164 L489 200 M500 164 L511 200 M500 133 L466 146 M500 133 L522 156"/>
      <path d="M640 166 H730 M648 166 V200 M722 166 V200"/><circle cx="666" cy="126" r="11"/><path d="M666 137 V164 H690 V200 M666 146 L684 156"/>
      <circle cx="712" cy="148" r="8"/><path d="M712 156 V178 L706 200 M712 178 L718 200 M712 164 L696 168"/>
      <path d="M10 200 H790" opacity=".3"/>
    </g>
    <g class="ff-parcels" fill="#F26430"><rect class="ff-p ff-p1" x="148" y="136" width="20" height="16" rx="3"/><rect class="ff-p ff-p2" x="338" y="134" width="20" height="16" rx="3"/><rect class="ff-p ff-p3" x="526" y="150" width="20" height="16" rx="3"/></g>
  </svg>`;
  function renderFinance() {
    const box = document.getElementById("finance-body"); if (!box || typeof FINANCE === "undefined") return;
    const F = FINANCE, src = x => `<span class="cool-ev__src">${extLink(x.url, x.label)}</span>`;
    box.innerHTML = `<p class="loops__intro">${esc(F.intro)}</p>
      <h3 class="fin-h">What needs paying for, and when must the money arrive?</h3>
      <div class="fin-table" role="table" aria-label="Needs and funding routes">
        <div class="fin-row fin-row--h" role="row"><span role="columnheader">Need</span><span role="columnheader">Route to look into</span><span role="columnheader">The question to answer</span></div>
        ${F.needs.map(n => `<div class="fin-row" role="row"><span role="cell"><b>${esc(n.need)}</b></span><span role="cell">${esc(n.route)}</span><span role="cell">${esc(n.ask)}</span></div>`).join("")}
      </div>
      <p class="fin-note">${esc(F.needsNote)}</p>
      <div class="fin-grid">
        <div class="fin-card"><h3 class="fin-h">Three triggers, not one</h3>
          <dl class="fin-trig">${F.triggers.map(t => `<div><dt>${esc(t.name)}</dt><dd>${esc(t.does)} <span>${esc(t.who)}.</span></dd></div>`).join("")}</dl>
          <p class="fin-warn">${esc(F.triggersNote)}</p></div>
        <div class="fin-card"><h3 class="fin-h">${esc(F.basis.q)}</h3>
          <ul class="fin-basis">${F.basis.kinds.map(k => `<li><b>${esc(k.name)}.</b> ${esc(k.text)}</li>`).join("")}</ul>
          <p class="fin-ask">${esc(F.basis.ask)}</p><p class="fin-note">${gloss(F.basis.note)} ${src(F.basis.source)}</p></div>
      </div>
      <h3 class="fin-h">From trigger to protection</h3>
      <figure class="fin-flow">${finFlowArt}<ol class="fin-path fin-path--drawn">${F.pathway.steps.map(x => `<li>${esc(x)}</li>`).join("")}</ol></figure>
      <p class="fin-note">${esc(F.pathway.note)} ${src(F.pathway.source)}</p>
      <h3 class="fin-h">Will it survive the next season?</h3>
      <ul class="fin-survive">${F.survive.map(q => `<li>${esc(q)}</li>`).join("")}</ul>
      <p class="fin-note">Many index-insurance pilots in Asia work technically but stall at renewal. ${src(F.surviveSource)}</p>
      ${F.lenders ? `<section class="fin-lend" id="fin-lenders" aria-labelledby="fin-lenders-h">
        <h3 class="fin-h" id="fin-lenders-h">${esc(F.lenders.title)}</h3>
        <p class="fin-lend__intro">${esc(F.lenders.intro)}</p>
        <div class="fin-lend__grid">
          <figure class="fin-lend__film"><video controls playsinline preload="none" poster="/${esc(F.lenders.video.poster)}" aria-label="${esc(F.lenders.title)}: a ${esc(F.lenders.video.length)} drawn film">
            <source src="/${esc(F.lenders.video.src)}" type="video/mp4"><track kind="captions" srclang="en" label="English" src="/${esc(F.lenders.video.captions)}" default></video>
            <figcaption>A drawn film, ${esc(F.lenders.video.length)}, narrated by a synthetic voice (Piper, trained on LibriTTS, CC BY 4.0), with captions. Based on ${extLink(F.lenders.source.url, F.lenders.source.label)}</figcaption></figure>
          <div><p class="fin-lend__k">What the commentary sets out</p><ul class="fin-lend__facts">${F.lenders.facts.map(f => `<li>${esc(f)}</li>`).join("")}</ul></div>
        </div>
        <p class="fin-lend__k">What could help, in combination</p>
        <ul class="fin-lend__helps">${F.lenders.helps.map(h => `<li><b>${esc(h.name)}</b>${esc(h.text)}</li>`).join("")}</ul>
        <p class="fin-lend__shift">${esc(F.lenders.shift)}</p>
        <p class="fin-note">${esc(F.lenders.note)} ${extLink(F.lenders.source.url, F.lenders.source.label)}</p>
      </section>` : ""}
      <h3 class="fin-h">What has been tried</h3>
      <div class="fin-cases">${F.cases.map(c => `<article class="fin-case" id="fin-${c.id}"><p class="pa-card__tags">${evTag(c.status)}</p><h4>${esc(c.name)}</h4><p class="fin-case__where">${esc(c.where)} · <span>${esc(c.hazard)}</span></p>
        <dl>${[["Who paid", c.paid], ["Who received it", c.received], ["What it made possible", c.enabled], ["What it left out", c.uncovered], ["Did it continue?", c.continued]].map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
        <p class="fin-case__lesson"><b>Lesson</b>${esc(c.lesson)}</p><p class="fin-case__src">${c.sources.map(x => extLink(x.url, x.label)).join(" · ")}</p></article>`).join("")}</div>
      <p class="fin-boundary"><b>What this evidence can and can’t tell you.</b> ${esc(F.boundary)} ${src(F.boundarySource)}</p>
      <p class="fin-go"><a class="btn btn--sm btn--teal" href="#plan-step-3">Add who pays to your plan</a> ${printLink("paying-for-protection", "Print the one-pager")}</p>
      <p class="risk__row risk__row--break"><span>Related actions:</span> ${["heatcash", "anticipatory", "heatbudget", "socialprotection", "riskpools"].filter(id => leverById[id]).map(id => `<button type="button" class="lever-chip" data-lever="${id}">${esc(leverById[id].title)}</button>`).join("")}</p>`;
  }

  // Why action stalls: how to tell, what moves it, and where it shows on the map
  function renderStalls() {
    const box = document.getElementById("stall-list"); if (!box || !STALL_LIST.length) return;
    box.innerHTML = STALL_LIST.map(x => `<li class="stall" id="stall-${x.id}">
        <h3 class="stall__name">${esc(x.name)}</h3>
        ${x.video ? watchButton("stall:" + x.id, "Watch") : ""}
        <p class="stall__k">You can tell when</p><p class="stall__sign">${esc(x.sign)}</p>
        <p class="stall__k">What moves it</p><ul class="stall__moves">${x.moves.map(m => `<li>${esc(m)}</li>`).join("")}</ul>
        ${[x.fact ? x : null, ...(x.more || [])].filter(Boolean).map(f => `<p class="stall__fact">${esc(f.fact)} ${extLink(f.source.url, f.source.label)}</p>`).join("")}
        <p class="risk__row risk__row--break"><span>On the map:</span> ${x.levers.filter(id => leverById[id]).map(id => `<button type="button" class="lever-chip" data-lever="${id}">${esc(leverById[id].title)}</button>`).join("")}${x.loops.filter(id => loopById[id]).map(id => `<button type="button" class="loop-chip" data-story="${id}">↺ ${esc(loopById[id].name.replace(/^The /, ""))}</button>`).join("")}</p>
      </li>`).join("");
  }

  // Cooling options by place: tabs for each place, the traps, what changes the result, and the value of cooling
  const COOL = typeof COOL_PLACES !== "undefined" ? COOL_PLACES : [];
  const rupees = n => n >= 10000000 ? `₹${+(n / 10000000).toFixed(2)} crore` : n >= 100000 ? `₹${+(n / 100000).toFixed(1)} lakh` : `₹${n.toLocaleString("en-IN")}`;
  // Indian rupee ranges shown in US dollars first, rounded to two significant figures
  const FX = typeof COOL_FX !== "undefined" ? COOL_FX.inrPerUsd : 0;
  const usd = n => { const v = n / FX, r = v >= 10 ? Math.round(v / 10 ** (Math.floor(Math.log10(v)) - 1)) * 10 ** (Math.floor(Math.log10(v)) - 1) : Math.round(v * 10) / 10;
    return "US$" + r.toLocaleString("en-US", { maximumFractionDigits: v >= 10 ? 0 : 2, minimumFractionDigits: v >= 10 || r % 1 === 0 ? 0 : 2 }); };
  function coolCost(c) {
    if (!c || c.conf === "low" || !c.high) return `<span class="cool-opt__noquote">No range solid enough to share. Get local quotes.</span>`;
    return `${FX ? `<b class="cool-opt__usd">About ${usd(c.low)}–${usd(c.high)}</b> per ${esc(c.unit)} <span class="cool-opt__inr">(${rupees(c.low)}–${rupees(c.high)} at Indian prices)</span>` : `${rupees(c.low)}–${rupees(c.high)} per ${esc(c.unit)}`} <span class="cool-opt__conf">${c.conf === "medium" ? "medium confidence" : "low to medium confidence"}</span>${c.src ? `<span class="cool-opt__src">${extLink(c.src.url, c.src.label)}</span>` : ""}`;
  }
  function showCoolPlace(id, focus) {
    const p = COOL.find(x => x.id === id) || COOL[0], panelEl = document.getElementById("cool-panel");
    if (!p || !panelEl) return;
    document.querySelectorAll("#cool-tabs [role=tab]").forEach(b => { const on = b.dataset.cool === p.id;
      b.setAttribute("aria-selected", on ? "true" : "false"); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); });
    panelEl.setAttribute("aria-labelledby", "cool-tab-" + p.id);
    panelEl.innerHTML = `<div class="cool-panel__head">
        <p class="cool-panel__protects"><b>Protects</b>${esc(p.protects)}</p>
        <p class="cool-panel__caution"><b>Key caution</b>${gloss(p.caution)}</p>
      </div>
      <ul class="cool-opts">${p.options.map(o => `<li class="cool-opt">
        <h3 class="cool-opt__name">${esc(o.name)}</h3>
        <p class="cool-opt__does">${gloss(o.does)}</p>
        <dl class="cool-opt__dl"><dt>Keeps working with</dt><dd>${esc(o.keeps)}</dd><dt>Avoid</dt><dd>${esc(o.avoid)}</dd><dt>Rough cost</dt><dd>${coolCost(o.cost)}</dd></dl>
      </li>`).join("")}</ul>
      ${(p.facts || []).length ? `<div class="cool-panel__facts">${p.facts.map(f => `<p class="stall__fact">${gloss(f.fact)} ${extLink(f.source.url, f.source.label)}</p>`).join("")}</div>` : ""}
      ${p.kitchen ? `<div class="cool-kitchen" id="kitchen-heat"><h3>${esc(p.kitchen.title)}</h3><p>${gloss(p.kitchen.text)} <span class="cool-ev__src">${extLink(p.kitchen.source.url, p.kitchen.source.label)}</span></p>
        <p class="cool-ask__k">Ask about the kitchen</p><ul class="cool-ask__qs">${p.kitchen.questions.map(q => `<li>${esc(q)}</li>`).join("")}</ul></div>` : ""}
      ${typeof COOL_ASK !== "undefined" && p.id !== "system" ? `<details class="cool-ask"><summary>Questions before you choose <span>power, water, upkeep and who pays</span></summary>
        <ol class="cool-ask__frame">${COOL_ASK.frame.map(f => `<li><b>${esc(f.name)}</b>${esc(f.text)}</li>`).join("")}</ol>
        <p class="cool-ev__src">${extLink(COOL_ASK.frameSource.url, COOL_ASK.frameSource.label)}</p>
        <p class="cool-ask__k">For each option, ask</p><ul class="cool-ask__qs">${COOL_ASK.questions.map(q => `<li>${esc(q)}</li>`).join("")}</ul>
        <p class="cool-ask__out"><b>Keep the outcomes apart</b>${esc(COOL_ASK.outcomes)}</p></details>` : ""}
      <p class="cool-panel__measure"><b>How you will know</b>${esc(p.measure)}</p>
      <p class="risk__row risk__row--break"><span>On the map:</span> ${p.levers.filter(id => leverById[id]).map(id => `<button type="button" class="lever-chip" data-lever="${id}">${esc(leverById[id].title)}</button>`).join("")}</p>
      <p class="cool-panel__add"><button type="button" class="btn btn--sm btn--teal" data-cool-add="${p.id}">Add these actions to my plan</button>${p.id === "markets" ? ` <a class="cool-mx" href="/practical/#market-canopy" target="_blank" rel="noopener">See it in a market<span class="visually-hidden"> (opens in a new tab)</span>&nbsp;<span aria-hidden="true">↗</span></a>` : ""} ${printLink(`cooling-${p.id}`, `Print the ${p.name.toLowerCase()} sheet`)}</p>`;
  }
  function renderCooling() {
    const tabs = document.getElementById("cool-tabs"); if (!tabs || !COOL.length) return;
    tabs.innerHTML = COOL.map((p, i) => `<button type="button" role="tab" class="cool-tab" id="cool-tab-${p.id}" data-cool="${p.id}" aria-controls="cool-panel" aria-selected="${i ? "false" : "true"}" tabindex="${i ? -1 : 0}">${esc(p.name)}</button>`).join("");
    const hash = decodeURIComponent(location.hash.slice(1));
    showCoolPlace(hash.startsWith("cool-") ? hash.slice(5) : COOL[0].id);
    // links such as #cool-homes, from the action cards, open that place
    window.addEventListener("hashchange", () => { const h = decodeURIComponent(location.hash.slice(1));
      if (h.startsWith("cool-") && COOL.some(x => x.id === h.slice(5))) { showCoolPlace(h.slice(5)); document.getElementById("cool-tabs").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }); } });
    tabs.addEventListener("click", ev => { const b = ev.target.closest("[data-cool]"); if (b) showCoolPlace(b.dataset.cool); });
    tabs.addEventListener("keydown", ev => {
      const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }, all = [...tabs.querySelectorAll("[role=tab]")];
      const i = all.indexOf(document.activeElement); if (i < 0) return;
      let j = null;
      if (ev.key in keys) j = (i + keys[ev.key] + all.length) % all.length; else if (ev.key === "Home") j = 0; else if (ev.key === "End") j = all.length - 1;
      if (j === null) return;
      ev.preventDefault(); showCoolPlace(all[j].dataset.cool, true);
    });
    const note = document.getElementById("cool-costnote"); if (note && typeof COOL_COST_NOTE !== "undefined") note.textContent = COOL_COST_NOTE;
    const traps = document.getElementById("cool-traps");
    if (traps && typeof COOL_TRAPS !== "undefined") traps.innerHTML = COOL_TRAPS.map(x => `<li class="cool-trap">
        <h4>${esc(x.name)}</h4><p>${gloss(x.what)}</p>
        <p class="cool-trap__fix"><b>Instead</b>${esc(x.fix)}${x.step ? ` <a href="#plan-step-${x.step}">Step ${x.step} of the plan</a>` : ""}</p>
        ${x.fact ? `<p class="stall__fact">${esc(x.fact)} ${extLink(x.source.url, x.source.label)}</p>` : ""}
      </li>`).join("");
    const evb = document.getElementById("cool-evidence");
    if (evb && typeof COOL_EVIDENCE !== "undefined") evb.innerHTML = COOL_EVIDENCE.map(x => `<article class="cool-ev"><h4>${esc(x.name)}</h4><p>${gloss(x.text)}</p><p class="cool-ev__src">${extLink(x.source.url, x.source.label)}</p></article>`).join("");
    const reg = document.getElementById("cool-region");
    if (reg && typeof COOL_REGION !== "undefined") reg.innerHTML = `<p class="cool-region__why">${esc(COOL_REGION.why.text)} <span class="cool-ev__src">${extLink(COOL_REGION.why.source.url, COOL_REGION.why.source.label)}</span></p>
      <ul class="cool-region__list">${COOL_REGION.prices.map(x => `<li><p class="cool-region__place">${esc(x.place)}</p><p class="cool-region__what">${esc(x.what)}</p>
        <p class="cool-region__fig">${esc(x.figure)}</p>${x.result ? `<p class="cool-region__res">${esc(x.result)}</p>` : ""}
        <p class="cool-ev__src">${x.sources.map(z => extLink(z.url, z.label)).join(" · ")}</p></li>`).join("")}</ul>
      <p class="cool-region__fx">Dollar figures use about ₹${FX} to US$1 (${esc(COOL_FX.asOf)}): ${extLink(COOL_FX.source.url, COOL_FX.source.label)}. Other conversions are rough and for comparison only.</p>`;
    const val = document.getElementById("cool-value");
    if (val && typeof COOL_VALUE !== "undefined") val.innerHTML = `<p class="cool-value__k">Putting a value on cooling</p>
      <h3 class="cool-value__h">Make the case in lives, work and bills</h3>
      <p>${gloss(COOL_VALUE.text)}</p>
      <p class="cool-value__lesson">${esc(COOL_VALUE.lesson)}</p>
      <p class="cool-value__k2">Count the value of cooling in</p>
      <ul class="cool-value__how">${COOL_VALUE.how.map(h => `<li>${esc(h)}</li>`).join("")}</ul>
      <p class="cool-ev__src">Sources: ${COOL_VALUE.sources.map(x => extLink(x.url, x.label)).join(" · ")}</p>
      ${typeof COOL_REGION !== "undefined" ? `<p class="cool-value__ret"><b>What it returns in India</b> ${esc(COOL_REGION.returns.text)} <span class="cool-ev__src">${extLink(COOL_REGION.returns.source.url, COOL_REGION.returns.source.label)}</span></p>` : ""}`;
    const rd = document.getElementById("cool-reading");
    if (rd && typeof COOL_READING !== "undefined") rd.innerHTML = COOL_READING.map(x => `<li><p class="cool-read__t">${extLink(x.url, x.title)}</p><p class="cool-read__by">${esc(x.by)}</p><p>${gloss(x.adds)}</p></li>`).join("");
    document.getElementById("cooling").addEventListener("click", ev => {
      const b = ev.target.closest("[data-cool-add]"); if (!b) return;
      track("cooling-add-" + b.dataset.coolAdd);
      const p = COOL.find(x => x.id === b.dataset.coolAdd), status = document.getElementById("cool-status");
      const added = p.levers.filter(id => leverById[id] && !plan.levers.includes(id));
      p.levers.filter(id => leverById[id]).forEach(id => { if (!plan.levers.includes(id)) plan.levers.push(id); const r = planRow(id); if (!(r.measure || "").trim()) r.measure = p.measure; });
      savePlan(); renderPlan();
      if (status) status.innerHTML = added.length ? `Added ${plural(added.length, "action")} for ${esc(p.name.toLowerCase())} to your plan. <a href="#plan-step-3">Set who leads, pays and keeps them working</a>.`
        : `Those actions are already in your plan. <a href="#plan-step-3">Go to step 3</a>.`;
    });
  }

  /* ---- live heat data (part 21): one cached fetch, shared by "Heat right now" and the plan's forecast check ---- */
  const LIVE = typeof LIVE_CITIES !== "undefined" ? LIVE_CITIES : [];
  const LIVE_KEY = "bth-live-v1", LIVE_TTL = 30 * 60 * 1000, LIVE_STALE = 3 * 3600 * 1000;
  let livePromise = null;
  const deg = v => `${Math.round(v)} °C`;
  // a reading's time is local to the city; turn it into a moment in time to judge how old it is
  const liveAge = c => Date.now() - (Date.parse(c.time + ":00Z") - (c.offset || 0) * 1000);
  function findAll(o, test, out = []) {
    if (Array.isArray(o)) o.forEach(x => findAll(x, test, out));
    else if (o && typeof o === "object") { if (test(o)) out.push(o); else Object.values(o).forEach(v => findAll(v, test, out)); }
    return out;
  }
  // NEA's measured wet-bulb globe temperature: read defensively, and drop it if it is missing or old
  function parseWbgt(j) {
    const rs = findAll(j, o => "wbgt" in o).map(o => ({ v: parseFloat(o.wbgt), level: String(o.heatStress || o.heat_stress || "") })).filter(r => isFinite(r.v));
    if (!rs.length) return null;
    const ts = findAll(j, o => typeof o.datetime === "string" || typeof o.timestamp === "string").map(o => Date.parse(o.datetime || o.timestamp)).filter(isFinite);
    const at = ts.length ? Math.max(...ts) : NaN;
    if (!isFinite(at) || Date.now() - at > 2 * 3600 * 1000) return null;
    const rank = l => ({ low: 1, moderate: 2, high: 3 }[l.toLowerCase()] || 0);
    const top = rs.reduce((a, b) => (rank(b.level) > rank(a.level) || (rank(b.level) === rank(a.level) && b.v > a.v)) ? b : a);
    return { max: Math.max(...rs.map(r => r.v)), level: rank(top.level) ? top.level : "", n: rs.length, at };
  }
  function liveFetch() {
    if (livePromise) return livePromise;
    try { const c = JSON.parse(localStorage.getItem(LIVE_KEY) || "null"); if (c && Date.now() - c.at < LIVE_TTL && c.cities) return (livePromise = Promise.resolve(c)); } catch (e) {}
    const q = "https://api.open-meteo.com/v1/forecast?latitude=" + LIVE.map(c => c.lat).join(",") + "&longitude=" + LIVE.map(c => c.lon).join(",") +
      "&current=temperature_2m,apparent_temperature,relative_humidity_2m&daily=temperature_2m_max,apparent_temperature_max&timezone=auto&forecast_days=7";
    const model = fetch(q).then(r => { if (!r.ok) throw new Error("model " + r.status); return r.json(); }).then(j => Array.isArray(j) ? j : [j]);
    const wbgt = LIVE.some(c => c.wbgt) ? fetch("https://api-open.data.gov.sg/v2/real-time/api/weather?api=wbgt").then(r => r.ok ? r.json() : null).then(j => j && parseWbgt(j)).catch(() => null) : Promise.resolve(null);
    livePromise = Promise.all([model, wbgt]).then(([m, w]) => {
      const out = { at: Date.now(), cities: {}, wbgt: w };
      LIVE.forEach((c, i) => { const d = m[i]; if (!d || !d.current || !d.daily) return;
        out.cities[c.id] = { time: d.current.time, offset: d.utc_offset_seconds, t: d.current.temperature_2m, feels: d.current.apparent_temperature, rh: d.current.relative_humidity_2m,
          days: (d.daily.time || []).map((dt, k) => ({ date: dt, max: d.daily.temperature_2m_max[k], feelsMax: d.daily.apparent_temperature_max[k] })) }; });
      if (!Object.keys(out.cities).length) throw new Error("no data");
      try { localStorage.setItem(LIVE_KEY, JSON.stringify(out)); } catch (e) {}
      return out;
    }).catch(e => { setTimeout(() => { livePromise = null; }, 120000); throw e; }); // wait two minutes before trying again
    return livePromise;
  }
  const liveCredit = () => typeof LIVE_SOURCES === "undefined" ? "" : `${extLink(LIVE_SOURCES.model.url, LIVE_SOURCES.model.label)} (${esc(LIVE_SOURCES.model.licence)})`;

  const FP = typeof LIVE_FINGERPRINT !== "undefined" ? LIVE_FINGERPRINT : null;
  // heat index from temperature and humidity: the US National Weather Service formula, in °C
  function heatIndex(tc, rh) {
    const T = tc * 9 / 5 + 32; let hi = 0.5 * (T + 61 + (T - 68) * 1.2 + rh * 0.094);
    if ((hi + T) / 2 >= 80) {
      hi = -42.379 + 2.04901523 * T + 10.14333127 * rh - .22475541 * T * rh - .00683783 * T * T - .05481717 * rh * rh + .00122874 * T * T * rh + .00085282 * T * rh * rh - .00000199 * T * T * rh * rh;
      if (rh < 13 && T >= 80 && T <= 112) hi -= ((13 - rh) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
      else if (rh > 85 && T >= 80 && T <= 87) hi += ((rh - 85) / 10) * ((87 - T) / 5);
    }
    return (hi - 32) * 5 / 9;
  }
  // which national warning band today's heat falls in, if any: our estimate, never an official warning
  function warnLevel(c, d, w) {
    const L = typeof LIVE_LEVELS !== "undefined" ? LIVE_LEVELS[c.country] : null; if (!L || !d || (L.only && !L.only.includes(c.id))) return null;
    let v = null, what = "";
    if (L.basis === "hi") { v = heatIndex(d.t, d.rh); what = `estimated heat index ${deg(v)}`; }
    else if (L.basis === "tmax" && d.days && d.days[0]) { v = d.days[0].max; what = `today’s forecast high ${deg(v)}`; }
    else if (L.basis === "wbgt" && c.wbgt && w) { v = w.max; what = `measured WBGT ${w.max.toFixed(1)} °C`; }
    if (v === null) return null;
    let i = -1; L.levels.forEach(([min], k) => { if (v >= min) i = k; });
    if (i < L.flag) return null;
    return { name: L.levels[i][1], agency: L.short || L.agency, full: L.agency, what, rank: i - L.flag, top: i === L.levels.length - 1, source: L.source, note: L.note };
  }
  // each city links to the "A week in the heat" workers of its country, which open on their own page
  const weekLink = c => {
    if (typeof HEAT_WEEK === "undefined") return "";
    const k = HEAT_WEEK.countries.find(x => x.name === c.country); if (!k) return "";
    const ps = HEAT_WEEK.people.filter(x => x.country === k.id); if (!ps.length) return "";
    const href = ps.length === 1 ? `/a-week-in-the-heat/?p=${ps[0].id}` : `/a-week-in-the-heat/?c=${k.id}`;
    const text = ps.length === 1 ? `A week in the heat with ${ps[0].name}, ${ps[0].role.toLowerCase()}` : `A week in the heat with ${ps.length} workers in ${k.name}`;
    return `<a href="${href}" target="_blank" rel="noopener">${esc(text)}<span class="visually-hidden"> (opens in a new tab)</span>&nbsp;<span aria-hidden="true">↗</span></a>`;
  };
  function renderNow() {
    const list = document.getElementById("now-list"); if (!list || !LIVE.length) return;
    const intro = document.getElementById("now-intro"); if (intro && typeof LIVE_NOTE !== "undefined") intro.textContent = LIVE_NOTE;
    const foot = document.getElementById("now-foot");
    if (foot) foot.innerHTML = `Sources: ${liveCredit()}${typeof LIVE_SOURCES !== "undefined" ? " · " + extLink(LIVE_SOURCES.wbgt.url, LIVE_SOURCES.wbgt.label) : ""}. Feels-like is the apparent temperature, from heat, humidity and wind.${typeof LIVE_LEVELS_NOTE !== "undefined" ? " " + esc(LIVE_LEVELS_NOTE) : ""}`;
    const card = (c, d, w, hottest) => {
      const ok = d && liveAge(d) < LIVE_STALE, pct = ok ? clamp01((d.feels - 20) / 35) * 100 : 0, today = ok && d.days[0];
      return `<li class="now-c${hottest ? " is-hottest" : ""}">
        <h3 class="now-c__city">${esc(c.name)}<span>${esc(c.country)}</span></h3>
        ${hottest ? `<p class="now-c__flag">Feels hottest right now</p>` : ""}
        ${ok ? `<p class="now-c__t">${Math.round(d.t)}<span> °C</span></p>
          <p class="now-c__f">Feels like <b>${deg(d.feels)}</b></p>
          <div class="now-c__bar" aria-hidden="true"><span style="width:${(100 - pct).toFixed(0)}%"></span></div>
          ${today ? `<p class="now-c__d">Today’s high ${deg(today.max)}, feeling like ${deg(today.feelsMax)}</p>` : ""}
          <p class="now-c__h">Humidity ${Math.round(d.rh)}% · ${esc(d.time.slice(11, 16))} local time</p>`
          : `<p class="now-c__none">${d ? "Reading out of date" : "Live data unavailable"}</p>`}
        ${c.wbgt && w ? `<p class="now-c__wbgt"><b>Measured WBGT ${w.max.toFixed(1)} °C</b>${w.level ? ` · ${esc(w.level)} heat stress at the highest of ${w.n} stations` : ` across ${w.n} stations`}</p>` : ""}
        ${FP ? `<p class="now-c__csi"><a href="${esc(FP.map.url)}" target="_blank" rel="noopener">${esc(FP.cardLink)}<span class="visually-hidden"> in ${esc(c.name)}, on Climate Central’s Climate Shift Index map (opens in a new tab)</span>&nbsp;<span aria-hidden="true">↗</span></a></p>` : ""}
        ${ok && warnLevel(c, d, w) ? (lv => `<p class="now-c__lv now-c__lv--${Math.min(lv.rank, 2)}"><b>${esc(lv.agency)}: ${esc(lv.name)}</b> <span>Our estimate from the ${esc(lv.what)}, using ${/^[A-Z]+$/.test(lv.full) ? "" : "the "}${esc(lv.full)}’s bands. Not an official warning. ${extLink(lv.source.url, "The bands")}</span></p>`)(warnLevel(c, d, w)) : ""}
        <p class="now-c__warn">Official warnings: ${extLink(c.warn.url, c.warn.label)}</p>
        ${weekLink(c) ? `<p class="now-c__wk">${weekLink(c)}</p>` : ""}
      </li>`; };
    const fpBox = document.getElementById("now-fp");
    if (fpBox && FP) fpBox.innerHTML = `<h3 class="now-fp__title" id="now-fp-title">${esc(FP.title)}</h3>
      <p class="now-fp__text">${esc(FP.text)} ${extLink(FP.map.url, "See today’s scores")}</p>
      <p class="now-fp__season">${esc(FP.season)}</p>
      <ul class="now-fp__facts">${FP.facts.map(f => `<li><b>${esc(f.n)}</b> ${esc(f.text)}</li>`).join("")}</ul>
      <p class="now-fp__src">${esc(FP.defn)} Source: ${extLink(FP.source.url, FP.source.label)}.</p>`;
    const status = document.getElementById("now-status");
    list.innerHTML = LIVE.map(c => card(c, null, null, false).replace("Live data unavailable", "Loading…")).join("");
    const load = () => liveFetch().then(data => {
      const ok = LIVE.filter(c => data.cities[c.id] && liveAge(data.cities[c.id]) < LIVE_STALE);
      const hot = ok.length ? ok.reduce((a, b) => data.cities[b.id].feels > data.cities[a.id].feels ? b : a).id : null;
      const phone = window.matchMedia("(max-width: 760px)").matches;
      const order = phone ? LIVE.slice().sort((a, b) => ((data.cities[b.id] || {}).feels ?? -99) - ((data.cities[a.id] || {}).feels ?? -99)) : LIVE;
      list.innerHTML = order.map(c => card(c, data.cities[c.id], data.wbgt, c.id === hot)).join("");
      limitList(list, 3, "cities");
      if (status) status.textContent = `Updated ${new Date(data.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} your time.`;
    }, () => { list.innerHTML = LIVE.map(c => card(c, null, null, false)).join(""); if (status) status.textContent = "Live data could not be loaded just now. The official warning links still work."; });
    // fetch only when the section comes near the screen
    const sec = document.getElementById("heat-now");
    if ("IntersectionObserver" in window) { const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); load(); } }, { rootMargin: "800px 0px" }); io.observe(sec); }
    else load();
  }
  const clamp01 = x => Math.max(0, Math.min(1, x));

  /* ======================= YOUR CITY ======================= */
  // a map of the twelve live cities and, for the one picked, its heat now, its plan, the cycles turning there and who is at work
  const CITIES = typeof CITY_PROFILES !== "undefined" ? CITY_PROFILES : [];
  const cityById = Object.fromEntries(CITIES.map(p => [p.id, p]));
  const MAPBOX = { lon0: 64, lon1: 129, lat0: -12, lat1: 34 };   // matches images/asia-map.svg (1000 × 721)
  const LABEL_LEFT = new Set(["manila", "delhi", "bangkok"]), LABEL_BELOW = new Set(["phnompenh"]);
  const HEAT_STOPS = [[0, [61, 191, 174]], [0.45, [245, 166, 35]], [0.7, [242, 100, 48]], [1, [215, 38, 61]]];
  function heatColor(v) {
    const t = clamp01((v - 20) / 35);
    for (let i = 1; i < HEAT_STOPS.length; i++) if (t <= HEAT_STOPS[i][0]) {
      const [a, ca] = HEAT_STOPS[i - 1], [b, cb] = HEAT_STOPS[i], k = (t - a) / (b - a);
      return `rgb(${ca.map((c, j) => Math.round(c + (cb[j] - c) * k)).join(",")})`;
    }
    return "rgb(215,38,61)";
  }
  let cityLive = null, cityNow = null;

  function cityForecast(d) {
    if (!d || !d.days || !d.days.length) return "";
    const days = d.days.slice(0, 7), max = Math.max(...days.map(x => x.feelsMax)), min = Math.min(...days.map(x => x.feelsMax));
    const lo = Math.min(25, Math.floor(min - 2)), hi = Math.max(lo + 10, Math.ceil(max + 1));
    const W = 320, H = 120, bw = W / days.length;
    const bars = days.map((x, i) => {
      const h = Math.max(4, (x.feelsMax - lo) / (hi - lo) * (H - 34)), y = H - 18 - h, day = new Date(x.date + "T12:00:00Z").toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" });
      return `<rect x="${(i * bw + 6).toFixed(1)}" y="${y.toFixed(1)}" width="${(bw - 12).toFixed(1)}" height="${h.toFixed(1)}" rx="3" fill="${heatColor(x.feelsMax)}"/>
        <text x="${(i * bw + bw / 2).toFixed(1)}" y="${(y - 4).toFixed(1)}" class="cf__v">${Math.round(x.feelsMax)}°</text>
        <text x="${(i * bw + bw / 2).toFixed(1)}" y="${H - 4}" class="cf__d">${esc(day)}</text>`;
    }).join("");
    const label = "Feels-like maximum for the next 7 days: " + days.map(x => `${x.date.slice(5)} ${Math.round(x.feelsMax)} °C`).join(", ");
    return `<figure class="cf"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">${bars}</svg>
      <figcaption>Feels-like maximum, next 7 days (°C)</figcaption></figure>`;
  }

  function renderCityPanel(id) {
    const p = cityById[id], c = LIVE.find(x => x.id === id), box = document.getElementById("city-panel");
    if (!p || !c || !box) return;
    const d = cityLive && cityLive.cities[id], ok = d && liveAge(d) < LIVE_STALE;
    const orgs = p.orgs.map(o => ORGS.find(x => x.id === o)).filter(Boolean);
    const exs = p.examples.map(e => EXAMPLES.find(x => x.id === e)).filter(Boolean);
    const risks = p.risk.map(r => AT_RISK.find(x => x.id === r)).filter(Boolean);
    const stake = l => typeof LOOP_STAKES !== "undefined" && LOOP_STAKES[l] ? LOOP_STAKES[l] : null;
    box.innerHTML = `
      <div class="cp__head">
        <h3 class="cp__name">${esc(c.name)}<span>${esc(c.country)}</span></h3>
        <p class="cp__tag">${esc(p.tagline)}</p>
      </div>
      <div class="cp__grid">
        <div class="cp__card cp__now">
          <p class="cp__k">Right now</p>
          ${ok ? `<p class="cp__t" style="--heat:${heatColor(d.feels)}">${Math.round(d.t)}<span> °C</span></p>
            <p class="cp__f">Feels like <b>${deg(d.feels)}</b> · humidity ${Math.round(d.rh)}%</p>${cityForecast(d)}`
            : `<p class="cp__none">${cityLive ? "Live reading unavailable just now." : "Loading live readings…"}</p>`}
          ${p.heat ? `<p class="cp__heat"><b>Heat type</b> ${gloss(p.heat)}</p>${watchButton("dryhumid", "Dry heat and humid heat, explained", "watch-btn cp__watch")}` : ""}
          <p class="cp__links">Official warnings: ${extLink(c.warn.url, c.warn.label)}${FP ? ` · ${extLink(FP.map.url, FP.cardLink)}` : ""}</p>
          ${weekLink(c) ? `<p class="cp__links">${weekLink(c)}</p>` : ""}
        </div>
        <div class="cp__card cp__hap cp__hap--${p.hap.status}">
          <p class="cp__k">Heat action plan</p>
          <p class="cp__status"><span class="cp__dot" aria-hidden="true"></span>${esc(CITY_HAP[p.hap.status])}</p>
          <p class="cp__text">${esc(p.hap.text)}</p>
          <p class="cp__src">Sources: ${p.hap.sources.map(s => extLink(s.url, s.label)).join(" · ")}</p>
          <p class="cp__links"><a href="#plan" data-plan-place="${esc(c.name)}, ${esc(c.country)}">Draft a plan for ${esc(c.name)}</a></p>
        </div>
      </div>
      <h4 class="cp__h">Vicious cycles the evidence ties to ${esc(c.name)} <span>${p.loops.length}</span></h4>
      <ul class="cp__loops">${p.loops.map(x => { const l = loopById[x.id], s = stake(x.id); if (!l) return "";
        return `<li><button class="cp__loop" data-story="${l.id}">
          <span class="cp__ring" aria-hidden="true"></span>
          <span class="cp__ln">${esc(l.name)}</span>
          <span class="cp__why">${esc(x.why)}</span>
          ${l.levers.length ? `<span class="cp__break">Break it: ${esc(leverById[l.levers[0]].title)}${l.levers.length > 1 ? ` and ${l.levers.length - 1} more` : ""}</span>` : ""}
          <span class="cp__go">Follow it on the map →</span></button></li>`; }).join("")}</ul>
      <div class="cp__grid">
        <div class="cp__card">
          <p class="cp__k">Who heat hits hardest here</p>
          <ul class="cp__chips">${risks.map(r => `<li><a href="#risk-${r.id}">${esc(r.name)}</a></li>`).join("")}</ul>
          ${exs.length ? `<p class="cp__k cp__k--gap">A worked plan to learn from</p>
            ${exs.map(x => `<button class="cp__ex" data-city-example="${x.id}"><b>${esc(x.title)}</b><span>${esc(x.place)} · ${esc(x.year)} · open it in Plan a response</span></button>`).join("")}`
            : `<p class="cp__note">No worked plan from ${esc(c.name)} on the map yet. If you know one, tell us.</p>`}
        </div>
        <div class="cp__card">
          <p class="cp__k">Already at work here <span>${orgs.length}</span></p>
          <ul class="cp__orgs">${orgs.map(o => `<li>${extLink(o.url, o.name)}<p>${esc(o.does)}</p></li>`).join("")}</ul>
          <p class="cp__note">Listing does not imply partnership, affiliation or endorsement.</p>
        </div>
      </div>
      <p class="cp__foot">Share this city: <a href="#city-${p.id}">beattheheat.asia/#city-${p.id}</a> · <a href="/cities/${p.id}/">Read it as a page</a> · ${printLink(`city-${p.id}`, `Print a one-page brief for ${c.name}`)} · ${printLink("dry-and-humid-heat", "Print: dry and humid heat")}</p>`;
  }

  function cityDots() {
    const map = document.getElementById("city-map"); if (!map) return;
    map.querySelectorAll(".cm__dot").forEach(b => {
      const id = b.dataset.city, d = cityLive && cityLive.cities[id], ok = d && liveAge(d) < LIVE_STALE;
      b.style.setProperty("--heat", ok ? heatColor(d.feels) : "#A9B0BA");
      b.querySelector(".cm__v").textContent = ok ? Math.round(d.feels) + "°" : "";
      b.classList.toggle("is-on", id === cityNow);
    });
    document.querySelectorAll("#city-picks [data-city]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.city === cityNow)));
  }

  function showCity(id, focus) {
    if (!cityById[id]) return;
    cityNow = id; renderCityPanel(id); cityDots(); track("city-" + id);
    if (focus) { const h = document.querySelector("#city-panel .cp__name"); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true });
      // on narrow screens the dashboard sits under the map, so bring it into view
      if (window.matchMedia("(max-width: 900px)").matches) document.getElementById("city-panel").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }); } }
  }

  /* ---- live temperature ticker: one line above the header, from the shared live reading ---- */
  function renderTicker() {
    const bar = document.getElementById("ticker"), rail = document.getElementById("ticker-track"), pause = document.getElementById("ticker-pause");
    if (!bar || !rail || !LIVE.length) return;
    const draw = () => liveFetch().then(data => {
      const ok = LIVE.filter(c => data.cities[c.id] && liveAge(data.cities[c.id]) < LIVE_STALE); if (!ok.length) { bar.hidden = true; return; }
      const hot = ok.reduce((a, b) => data.cities[b.id].feels > data.cities[a.id].feels ? b : a).id;
      const set = copy => `<ul class="ticker__set"${copy ? ' aria-hidden="true"' : ""}>${ok.map(c => { const d = data.cities[c.id];
        return `<li${c.id === hot ? ' class="is-hot"' : ""}><a href="#city-${c.id}" data-ticker-city="${c.id}"${copy ? ' tabindex="-1"' : ""}><span class="ticker__pin" style="background:${heatColor(d.feels)}" aria-hidden="true"></span><b>${esc(c.name)}</b><span>${deg(d.t)}<span class="ticker__f">, feels like ${deg(d.feels)}</span></span>${c.id === hot ? '<span class="ticker__hot">Hottest now</span>' : ""}${(lv => lv ? `<span class="ticker__lv ticker__lv--${Math.min(lv.rank, 2)}">${esc(lv.agency)}: ${esc(lv.name)}<span class="visually-hidden"> (our estimate from ${esc(lv.what)}, not an official warning)</span></span>` : "")(warnLevel(c, d, data.wbgt))}</a></li>`; }).join("")}
        <li class="ticker__more"><a href="#heat-now"${copy ? ' tabindex="-1"' : ""}>All ${ok.length} cities and the week ahead</a></li></ul>`;
      // two identical sets make the loop seamless; the second is hidden from screen readers and the keyboard
      rail.innerHTML = set(false) + set(true);
      bar.hidden = false;
      // about 45 pixels a second; half that for people who prefer reduced motion, who can also pause it
      rail.style.setProperty("--ticker-dur", `${Math.max(30, Math.round(rail.scrollWidth / 2 / (reduceMotion ? 22 : 45)))}s`);
    }, () => {});
    draw();
    // a page left open keeps its readings fresh: fetch again once the 30-minute cache has run out
    setInterval(() => { if (document.hidden) return; livePromise = null; draw(); }, LIVE_TTL + 60000);
    bar.addEventListener("click", ev => {
      const a = ev.target.closest("[data-ticker-city]"); if (!a) return;
      ev.preventDefault(); showCity(a.dataset.tickerCity); setHash("city-" + a.dataset.tickerCity); track("ticker-" + a.dataset.tickerCity);
      document.getElementById("city").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    });
    pause.addEventListener("click", () => { const on = pause.getAttribute("aria-pressed") !== "true";
      pause.setAttribute("aria-pressed", String(on)); pause.textContent = on ? "Play" : "Pause"; bar.classList.toggle("is-paused", on); });
  }

  function renderCity() {
    const sec = document.getElementById("city"), map = document.getElementById("city-map"), picks = document.getElementById("city-picks");
    if (!sec || !map || !CITIES.length) return;
    const pos = c => ({ x: (c.lon - MAPBOX.lon0) / (MAPBOX.lon1 - MAPBOX.lon0) * 100, y: (MAPBOX.lat1 - c.lat) / (MAPBOX.lat1 - MAPBOX.lat0) * 100 });
    map.innerHTML = `<img src="images/asia-map.svg" alt="" class="cm__base" width="1000" height="721">` + CITIES.map(p => {
      const c = LIVE.find(x => x.id === p.id); if (!c) return ""; const q = pos(c);
      return `<button type="button" class="cm__dot${LABEL_LEFT.has(p.id) ? " cm__dot--left" : LABEL_BELOW.has(p.id) ? " cm__dot--below" : ""}" data-city="${p.id}" tabindex="-1" aria-hidden="true" style="left:${q.x.toFixed(2)}%;top:${q.y.toFixed(2)}%">
        <span class="cm__pin"></span><span class="cm__lab">${esc(c.name)}<span class="cm__v"></span></span></button>`;
    }).join("");
    picks.innerHTML = CITIES.map(p => { const c = LIVE.find(x => x.id === p.id); return c ? `<li><button type="button" data-city="${p.id}" aria-pressed="false">${esc(c.name)}<span class="cp__pill cp__pill--${p.hap.status}" title="${esc(CITY_HAP[p.hap.status])}"></span></button></li>` : ""; }).join("");
    const legend = document.getElementById("city-legend");
    if (legend) legend.innerHTML = Object.entries(CITY_HAP).map(([k, v]) => `<li><span class="cp__pill cp__pill--${k}" aria-hidden="true"></span>${esc(v)}</li>`).join("");
    sec.addEventListener("click", ev => {
      const b = ev.target.closest("[data-city]"); if (b) { showCity(b.dataset.city, b.closest("#city-picks") !== null); setHash("city-" + b.dataset.city); return; }
      const ex = ev.target.closest("[data-city-example]");
      if (ex) { loadExample(ex.dataset.cityExample); }
    });
    const hash = decodeURIComponent(location.hash.slice(1));
    showCity(hash.startsWith("city-") && cityById[hash.slice(5)] ? hash.slice(5) : CITIES[0].id);
    if (hash.startsWith("city-") && cityById[hash.slice(5)]) setTimeout(() => sec.scrollIntoView({ block: "start" }), 50);
    const load = () => liveFetch().then(data => { cityLive = data; renderCityPanel(cityNow); cityDots(); }, () => { cityLive = { cities: {} }; renderCityPanel(cityNow); cityDots(); });
    if ("IntersectionObserver" in window) { const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); load(); } }, { rootMargin: "800px 0px" }); io.observe(sec); }
    else load();
  }

  /* ======================= HEATWAVES THAT SHAPED ASIA ======================= */
  // a timeline of major heatwaves: dots sized by recorded deaths (a floor, not a total), hollow where no solid count exists
  function renderHeatwaves() {
    const chart = document.getElementById("hw-chart"), list = document.getElementById("hw-list");
    if (!chart || !list || typeof HEATWAVES === "undefined") return;
    const note = document.getElementById("hw-note"); if (note) note.textContent = HEATWAVES_NOTE;
    // events are evenly spaced (not to scale in time) so every one stays readable
    const n = HEATWAVES.length, W = 1000, H = 220, base = 150, step = (W - 130) / Math.max(1, n - 1), maxD = Math.max(...HEATWAVES.map(h => h.deaths || 0));
    const r = d => d ? 8 + Math.sqrt(d / maxD) * (step / 2 - 10) : 9;
    const dots = HEATWAVES.map((h, i) => {
      const cx = 65 + i * step, rr = r(h.deaths);
      return `<a href="#hw-${h.id}" class="hw-dot${h.deaths ? "" : " hw-dot--none"}" aria-label="${esc(h.when)}, ${esc(h.place)}: ${esc(h.toll)}">
        <line x1="${cx}" y1="${base}" x2="${cx}" y2="${base - rr}" class="hw-stem"/>
        <circle cx="${cx}" cy="${base - rr}" r="${rr}"/>
        ${h.deaths ? `<text x="${cx}" y="${base - rr + 4}" class="hw-n">${h.deaths.toLocaleString("en-US")}${h.atLeast ? "+" : ""}</text>` : ""}
        <text x="${cx}" y="${base + 22}" class="hw-y">${h.year}</text></a>`; }).join("");
    const ticks = HEATWAVES.map((h, i) => `<line x1="${65 + i * step}" y1="${base}" x2="${65 + i * step}" y2="${base + 6}" class="hw-tick"/>`).join("");
    chart.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="group" aria-label="Timeline of major heatwaves in South and Southeast Asia, 1998 to 2026">
      <line x1="20" y1="${base}" x2="${W - 20}" y2="${base}" class="hw-axis"/>${ticks}${dots}</svg>
      <p class="hw-legend"><span class="hw-key"></span> Recorded deaths (bigger circle, more deaths) <span class="hw-key hw-key--none"></span> No solid death count <span class="hw-scale">Events are evenly spaced, not to scale in time.</span></p>`;
    list.innerHTML = HEATWAVES.map(h => `<li class="hw-card" id="hw-${h.id}">
      <p class="hw-card__when">${esc(h.when)} · ${esc(h.place)}</p>
      <h3 class="hw-card__t">${esc(h.title)}</h3>
      <dl class="hw-card__facts"><div><dt>Peak</dt><dd>${esc(h.peak)}</dd></div><div><dt>Toll</dt><dd>${esc(h.toll)}</dd></div></dl>
      <p>${gloss(h.what)}</p>
      <p class="hw-card__changed"><b>What changed</b> ${esc(h.changed)}</p>
      <p class="hw-card__nodes">On the map: ${h.nodes.map(n => byId[n] ? `<button class="link" data-go="${n}">${esc(plain(byId[n]))}</button>` : "").join(" · ")}</p>
      <p class="hw-card__src">Sources: ${h.sources.map(s => extLink(s.url, s.label)).join(" · ")}</p></li>`).join("");
    chart.addEventListener("click", ev => { const a = ev.target.closest("a.hw-dot"); if (!a) return;
      const el = document.getElementById(a.getAttribute("href").slice(1)); if (!el) return; ev.preventDefault();
      el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" }); el.classList.remove("is-flash"); void el.offsetWidth; el.classList.add("is-flash"); });
  }

  /* ======================= FOUR HEATS IN A HOME ======================= */
  // a cross-section of a tin-roofed home: pick a heat to light it up, or switch to night to see the room stay hot
  function renderHomeHeats() {
    const box = document.getElementById("home-heats"); if (!box || typeof HOME_HEATS === "undefined") return;
    const H = HOME_HEATS; let sel = "roof", night = false;
    const zig = [...Array(15)].map((_, i) => `${230 + i * 30},${i % 2 ? 132 : 118}`).join(" ");
    const draw = () => {
      const n = night, hot = !n && (sel === "roof"), rad = sel === "radiant", ind = sel === "indoor" || n;
      const arrows = [0, 1, 2, 3, 4].map(i => `<g class="hh-arrow" style="animation-delay:${i * .35}s"><path d="M${270 + i * 80} 165 q 8 10 0 20 q -8 10 0 20" /><path d="M${262 + i * 80} 200 L${270 + i * 80} 212 L${278 + i * 80} 200" /></g>`).join("");
      const mark = (id, x, y) => { const h = H.heats.find(z => z.id === id); return `<g class="hh-mark${sel === id && !n ? " is-on" : ""}"><circle cx="${x}" cy="${y}" r="17"/><text x="${x}" y="${y + 6}">${h.n}</text></g>`; };
      return `<svg viewBox="0 0 720 360" class="hh-svg${n ? " is-night" : ""}" aria-hidden="true">
        <rect width="720" height="360" class="hh-sky"/>
        ${n ? `<circle cx="640" cy="60" r="24" fill="#F3EBD2"/><circle cx="652" cy="52" r="22" class="hh-skyfill"/>` : `<circle cx="640" cy="60" r="28" fill="#F26430"/>`}
        <rect y="290" width="720" height="70" class="hh-ground"/>
        <g class="hh-station${sel === "air" && !n ? " is-on" : ""}"><rect x="76" y="210" width="6" height="80"/><rect x="52" y="176" width="54" height="38" rx="4"/></g>
        <rect x="245" y="132" width="420" height="158" class="hh-room${ind ? " is-hot" : ""}"/>
        <rect x="610" y="185" width="30" height="40" class="hh-win"/>
        <g class="hh-people">${n ? `<g transform="translate(340,262)"><circle cx="-34" cy="0" r="10"/><path d="M-24 0 H34"/></g><g transform="translate(470,262)"><circle cx="-34" cy="0" r="10"/><path d="M-24 0 H34"/></g>`
          : `<g transform="translate(360,240)"><circle cx="0" cy="-34" r="11"/><path d="M0 -23 V12 M-18 -6 L0 -14 L18 -6 M0 12 L-12 40 M0 12 L12 40"/></g><g transform="translate(470,240)"><circle cx="0" cy="-34" r="11"/><path d="M0 -23 V12 M-18 -6 L0 -14 L18 -6 M0 12 L-12 40 M0 12 L12 40"/></g>`}</g>
        ${rad && !n ? `<g class="hh-arrows">${arrows}</g>` : ""}
        <polygon points="230,140 ${zig} 680,140" class="hh-roof${hot ? " is-hot" : ""}"/>
        ${n ? "" : mark("air", 79, 160) + mark("roof", 455, 96) + mark("radiant", 300, 185) + mark("indoor", 590, 265)}
        ${n ? `<g class="hh-tag"><rect x="22" y="128" width="120" height="30" rx="6" class="cool"/><text x="82" y="148">Street: cooling</text></g><g class="hh-tag"><rect x="390" y="150" width="140" height="30" rx="6" class="hot"/><text x="460" y="170">Room: still hot</text></g>` : ""}
      </svg>`;
    };
    const detail = () => {
      if (night) return `<p class="hh-k">At night</p><p>${esc(H.night.text)}</p><p class="cool-ev__src">${extLink(H.night.source.url, H.night.source.label)}</p>`;
      const h = H.heats.find(z => z.id === sel);
      return `<p class="hh-k">${h.n} · ${esc(h.name)}</p><p>${gloss(h.text)}</p>${h.source ? `<p class="cool-ev__src">${extLink(h.source.url, h.source.label)}</p>` : ""}`;
    };
    const paint = () => {
      box.querySelector(".hh-art").innerHTML = draw();
      box.querySelector(".hh-detail").innerHTML = detail();
      box.querySelectorAll("[data-hh]").forEach(b => b.setAttribute("aria-pressed", String(!night && b.dataset.hh === sel)));
      box.querySelectorAll("[data-hh-time]").forEach(b => b.setAttribute("aria-pressed", String((b.dataset.hhTime === "night") === night)));
    };
    box.innerHTML = `<p class="hh-intro">${esc(H.intro)}</p>
      <div class="hh-grid">
        <div class="hh-stage">
          <div class="hh-time" role="group" aria-label="Time of day"><button type="button" data-hh-time="day">Day</button><button type="button" data-hh-time="night">Night</button></div>
          <div class="hh-art"></div>
          <div class="hh-picks" role="group" aria-label="Choose a heat">${H.heats.map(h => `<button type="button" data-hh="${h.id}"><b>${h.n}</b>${esc(h.name)}</button>`).join("")}</div>
        </div>
        <div class="hh-side">
          <div class="hh-detail" aria-live="polite"></div>
          ${watchButton("film:fourheats", "Watch: four heats in a home")}
          <p>${printLink("four-heats", "Print the one-pager, with a checklist for heat plans")}</p>
        </div>
      </div>
      <ul class="hh-facts">${H.facts.map(f => `<li><b>${esc(f.n)}</b> ${esc(f.text)} <span class="cool-ev__src">${extLink(f.source.url, f.source.label)}</span></li>`).join("")}</ul>
      <p class="hh-nuance">${esc(H.nuance.text)} <span class="cool-ev__src">${extLink(H.nuance.source.url, H.nuance.source.label)}</span></p>
      <p class="hh-plans"><b>For heat plans</b> ${esc(H.plans)}</p>`;
    box.addEventListener("click", ev => {
      const b = ev.target.closest("[data-hh]"); if (b) { sel = b.dataset.hh; night = false; paint(); track("homeheat-" + sel); return; }
      const t = ev.target.closest("[data-hh-time]"); if (t) { night = t.dataset.hhTime === "night"; paint(); track("homeheat-" + t.dataset.hhTime); }
    });
    paint();
    const room = document.getElementById("now-room");
    if (room) room.innerHTML = `<b>Warnings track the street, not the room.</b> These readings are outdoor air in the shade. Under a tin roof it can be hotter, and it stays hot at night. <a href="#four-heats">See the four heats in a home</a> ${watchButton("film:fourheats", "Watch the film")}`;
  }

  /* ======================= START HERE ======================= */
  // "Find your way in" (part 35, drawn by guide.js) replaced the intents and roles that were here. The map's own
  // actions it offers (the film, the tour, a loop) are handled by handleAction; the first five minutes here.
  document.addEventListener("click", ev => { if (ev.target.closest && ev.target.closest('#start [data-five="start"]')) fiveGo(0); });
  // a link from /guide/ can run one of the map's actions when the page opens: /?go=film | tour | five
  function goFromQuery() {
    let go = ""; try { go = new URLSearchParams(location.search).get("go") || ""; } catch (e) {}
    if (!["film", "tour", "five"].includes(go)) return;
    try { history.replaceState(null, "", location.pathname + location.hash); } catch (e) {}
    if (go === "five") { fiveGo(0); return; }
    const b = document.createElement("button"); b.dataset.act = go; handleAction({ target: b });
  }

  /* ---- the first five minutes: a slim guide bar that walks through four stops ---- */
  const FIVE = typeof FIRST_FIVE !== "undefined" ? FIRST_FIVE : [];
  let five = -1;
  function fiveBar() {
    let bar = document.getElementById("fivemin");
    if (!bar) { bar = document.createElement("div"); bar.id = "fivemin"; bar.className = "fivemin"; bar.setAttribute("role", "region"); bar.setAttribute("aria-label", "The first five minutes"); bar.hidden = true; document.body.appendChild(bar);
      bar.addEventListener("click", ev => { const b = ev.target.closest("[data-five]"); if (!b) return; const k = b.dataset.five;
        if (k === "next") fiveGo(five + 1); else if (k === "back") fiveGo(five - 1); else if (k === "close") fiveClose(); }); }
    return bar;
  }
  function fiveClose() { const bar = fiveBar(); bar.hidden = true; five = -1; document.body.classList.remove("five-on"); const s = document.querySelector('[data-five="start"]'); if (s) s.focus(); }
  function fiveGo(i) {
    const st = FIVE[i]; if (!st) { fiveClose(); return; }
    five = i; track("five-" + (i + 1));
    const bar = fiveBar(), last = i === FIVE.length - 1;
    bar.innerHTML = `<div class="fivemin__in"><p class="fivemin__k">The first five minutes · ${i + 1} of ${FIVE.length}</p>
      <p class="fivemin__t"><b>${esc(st.title)}.</b> ${esc(st.text)}</p>
      <div class="fivemin__b">${i ? `<button type="button" class="btn btn--sm btn--ghost" data-five="back">← Back</button>` : ""}
        <button type="button" class="btn btn--sm btn--cta" data-five="${last ? "close" : "next"}">${last ? "Done" : "Next →"}</button>
        <button type="button" class="fivemin__x" data-five="close" aria-label="Close the guide">×</button></div></div>`;
    bar.hidden = false; document.body.classList.add("five-on");
    const g = st.go, smooth = { behavior: reduceMotion ? "auto" : "smooth", block: "start" };
    if (g.loop) goToMap(() => startStory(g.loop));
    else if (g.lever) goToMap(() => selectLever(g.lever));
    if ((g.risk || g.plan) && (state.selected || state.story)) clearSelection(); // close the map's panel before leaving the map
    if (g.risk) { const el = document.getElementById("risk-" + g.risk); if (el) { el.scrollIntoView(smooth); el.classList.remove("is-flash"); void el.offsetWidth; el.classList.add("is-flash"); } }
    else if (g.plan) { if (!plan.levers.length) { plan.group = g.plan; plan.levers = suggested().slice(); savePlan(); renderPlan(); } document.getElementById("plan").scrollIntoView(smooth); }
    const nb = bar.querySelector(`[data-five="${last ? "close" : "next"}"]`); if (nb && i === 0) nb.focus();
  }

  /* ---- phones: sections open as a summary with one button; long lists show the first few ---- */
  function initDisclosure() {
    const S = typeof SECTION_SUMMARIES !== "undefined" ? SECTION_SUMMARIES : {};
    Object.entries(S).forEach(([id, label]) => {
      const sec = document.getElementById(id), c = sec && sec.querySelector(":scope > .container"); if (!c || c.querySelector(".pd-body")) return;
      const kids = [...c.children], h = kids.findIndex(k => /^H2$/.test(k.tagName)); if (h < 0) return;
      const intro = kids[h + 1] && kids[h + 1].tagName === "P" ? h + 1 : h;
      const rest = kids.slice(intro + 1); if (!rest.length) return;
      const body = document.createElement("div"); body.className = "pd-body"; body.id = "pd-" + id;
      rest.forEach(k => body.appendChild(k));
      const btn = document.createElement("button"); btn.type = "button"; btn.className = "btn btn--sm btn--cta pd-open"; btn.textContent = label;
      btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-controls", body.id);
      btn.addEventListener("click", () => { if (sec.classList.contains("pd-is-open")) { sec.classList.remove("pd-is-open"); btn.setAttribute("aria-expanded", "false"); btn.textContent = label; sec.scrollIntoView({ block: "start" }); } else { openSection(sec); track("open-" + id); } });
      c.appendChild(btn); c.appendChild(body);
    });
    [["atrisk-list", 3, "groups"], ["stall-list", 3, "conditions"], ["inst-list", 5, "institutions"], ["cool-traps", 3, "traps"], ["cool-reading", 3, "books and guides"], ["day-list", 3, "hours"]]
      .forEach(([id, n, noun]) => { const l = document.getElementById(id); if (l) limitList(l, n, noun); });
    const h = decodeURIComponent(location.hash.slice(1)), t = h && document.getElementById(h); if (t) reveal(t);
  }
  function limitList(list, n, noun) {
    const items = [...list.children]; list.classList.add("pd-list");
    items.forEach((el, k) => el.classList.toggle("pd-more", k >= n));
    let b = list.nextElementSibling;
    if (!b || !b.classList.contains("pd-all")) { b = document.createElement("button"); b.type = "button"; b.className = "btn btn--sm btn--ghost pd-all"; list.after(b); b.addEventListener("click", () => showAll(list)); }
    b.textContent = `Show all ${items.length} ${noun}`; b.hidden = items.length <= n || list.classList.contains("is-all");
  }

  function renderList() {
    document.getElementById("web-list").innerHTML = SYSTEMS.map(s => {
      const items = nodes.filter(n => n.sys === s.id && n.kind === "leaf");
      return `<details class="sys" style="--c:${s.color}">
        <summary><span class="dot"></span>${esc(plain(s))} <span class="sys__count">${items.length}</span></summary>
        <ul>${items.map(n => {
          const outs = n.out.filter(e => e.type !== "hub");
          return `<li>
            <button class="list-node" data-go="${n.id}">${esc(plain(n))}</button>
            <p>${esc(n.desc)}</p>
            ${n.sources ? `<p class="list-src">Evidence: ${n.sources.map(x => extLink(x.url, x.label)).join(" · ")}</p>` : ""}
            ${outs.length ? `<p class="list-leads">Leads to: ${outs.map(e => esc(plain(byId[e.to]))).join(" · ")}</p>` : ""}
          </li>`;
        }).join("")}</ul>
      </details>`;
    }).join("");
  }

  function renderStats() {
    const values = {
      systems: SYSTEMS.length, consequences: CONSEQUENCES.length, links: edges.length,
      loops: LOOPS.length, levers: LEVERS.length, institutions: INSTITUTIONS.length,
      cross: edges.filter(e => e.type === "cross").length
    };
    document.querySelectorAll("[data-stat]").forEach(x => { if (values[x.dataset.stat] !== undefined) x.textContent = values[x.dataset.stat]; });
  }

  /* ======================= THE PLAN, ON ITS OWN PAGE ======================= */
  // The plan lives at /plan/, opened in one named tab ("bth-plan") so repeated clicks reuse it. Both pages keep the
  // plan in this browser; a "storage" event tells each page when the other has changed it.
  const PLAN_URL = "/plan/", PLAN_TAB = "bth-plan", PRACTICAL_URL = "/practical/", FINANCE_URL = "/finance/";
  const goToPlan = (hash, query) => { track("plan-open"); const w = window.open(PLAN_URL + (query || "") + (hash ? "#" + hash : ""), PLAN_TAB); if (w) try { w.focus(); } catch (e) {} };
  function readPlan(raw) {
    try { const saved = JSON.parse(raw || "null"); if (!saved || !Array.isArray(saved.levers)) return false;
      plan = Object.assign({ place: "", group: "", levers: [], rows: {}, example: null, stalls: [], triggers: {}, review: "", exposure: [], finance: {}, reviewLog: {} }, saved);
      if (!Array.isArray(plan.stalls)) plan.stalls = []; if (!plan.triggers || typeof plan.triggers !== "object") plan.triggers = {}; return true; } catch (e) { return false; }
  }
  // a link that starts a plan with this place, group and actions; never carries notes, owners or money
  function planStartLink(place = plan.place, group = plan.group, levers = plan.levers) {
    const q = new URLSearchParams(); if (place) q.set("place", place); if (group) q.set("group", group);
    const acts = levers.filter(id => leverById[id]); if (acts.length) q.set("actions", acts.join(","));
    return `${location.origin}${PLAN_URL}?${q.toString()}`;
  }
  const suggestedFor = g => ((PG.find(x => x.id === g) || {}).levers || []).slice();
  // the launcher on the map: one line saying what the plan holds so far
  function renderPlanLaunch() {
    const box = document.getElementById("plan-launch-sum"); if (!box) return;
    const g = PG.find(x => x.id === plan.group), n = plan.levers.filter(id => leverById[id]).length;
    const noLead = plan.levers.filter(id => leverById[id] && !(plan.rows[id] && plan.rows[id].lead)).length;
    box.innerHTML = n || plan.place || g
      ? `<b>Your plan so far:</b> ${[plan.place && esc(plan.place), g && esc(g.name.toLowerCase()), n ? plural(n, "action") : "no actions yet", n && noLead ? `${noLead} without a lead` : ""].filter(Boolean).join(" · ")}`
      : "Your plan is empty. Add actions anywhere on the map, then open your plan to set who leads and pays.";
  }
  // the map's tab is named, so links from the plan page back to the map reuse it rather than opening another
  if (!SUB_PAGE && !window.name) window.name = "bth-map";
  if (SUB_PAGE) document.addEventListener("click", ev => {
    const a = ev.target.closest && ev.target.closest('a[href^="#"]'); if (!a) return;
    const id = decodeURIComponent(a.getAttribute("href").slice(1)); if (!id || document.getElementById(id)) return;
    if (!PLAN_PAGE && /^plan(-|$)/.test(id)) return;   // links into the plan open the plan page (below)
    if (/^practical(-|$)/.test(id) || /^(fin-|finance$)/.test(id)) { ev.preventDefault();
      const url = /^(fin-|finance$)/.test(id) ? FINANCE_URL : PRACTICAL_URL, here = location.pathname === url;
      if (here) location.hash = id; else window.open(url + (/-/.test(id) ? "#" + id : ""), "_blank", "noopener"); return; }
    ev.preventDefault(); const w = window.open("/#" + id, "bth-map"); if (w) try { w.focus(); } catch (e) {}
  }, true);
  window.addEventListener("storage", ev => {
    if (ev.key !== PLAN_KEY || !readPlan(ev.newValue)) return;
    if (PLAN_PAGE) renderPlan(); else renderPlanLaunch();
  });
  if (!PLAN_PAGE) document.addEventListener("click", ev => {
    // on the map, links into the plan open its page in the plan tab; the menu and the launcher's heading link stay on the map
    const a = ev.target.closest && ev.target.closest('a[href^="#plan"], a[data-open-plan]'); if (!a || ev.defaultPrevented) return;
    const h = a.getAttribute("href");
    if (h === "#plan" && a.closest(".site-header, .site-menu, .plan--launch, .intro")) return;
    if (a.hasAttribute("data-open-plan") && !h.startsWith("#")) return;
    ev.preventDefault();
    if (a.dataset.planPlace) goToPlan("plan-step-1", "?place=" + encodeURIComponent(a.dataset.planPlace));
    else goToPlan(h.length > 5 ? h.slice(1) : "");
  }, true);
  // on the map, links into a practical-action setting or a payment case open that page in a new tab
  if (!SUB_PAGE) document.addEventListener("click", ev => {
    const a = ev.target.closest && ev.target.closest('a[href^="#practical-"], a[href^="#fin-"]'); if (!a || ev.defaultPrevented) return;
    const h = a.getAttribute("href"); ev.preventDefault();
    window.open((h.startsWith("#fin-") ? FINANCE_URL : PRACTICAL_URL) + h, "_blank", "noopener");
  }, true);

  /* ======================= BOOT ======================= */
  function bootPlanPage() {
    renderPlan();
    const q = new URLSearchParams(location.search), ex = q.get("example");
    // a prefilled link starts a plan: ?place=Dhaka, Bangladesh&group=workers&actions=heatrules,coolingcentres
    const qPlace = (q.get("place") || "").slice(0, 80).trim(), qGroup = PG.some(g => g.id === q.get("group")) ? q.get("group") : "";
    const qActs = (q.get("actions") || "").split(",").filter(id => leverById[id]).slice(0, 20);
    if (qPlace || qGroup || qActs.length) {
      const same = plan.place === qPlace && plan.group === qGroup && qActs.every(id => plan.levers.includes(id));
      const has = plan.levers.length || plan.place;
      if (!same && (!has || window.confirm(`Start a new plan${qPlace ? " for " + qPlace : ""}? The plan you have started will be replaced.`))) {
        plan = { place: qPlace, group: qGroup, levers: qActs.length ? qActs : (qGroup ? suggestedFor(qGroup) : []), rows: {}, example: null, stalls: [], triggers: {}, review: "", exposure: [], finance: {}, reviewLog: {} };
        savePlan(); renderPlan(); track("plan-prefill");
      }
      try { history.replaceState(null, "", location.pathname + location.hash); } catch (e) {}
    }
    if (ex && EXAMPLES.some(x => x.id === ex)) {
      const has = plan.levers.length || plan.place;
      if (!has || plan.example === ex || window.confirm("Replace the plan you have started with this worked example?")) loadExample(ex);
      try { history.replaceState(null, "", location.pathname + location.hash); } catch (e) {}
    }
    const h = decodeURIComponent(location.hash.slice(1)), t = h && document.getElementById(h); if (t) t.scrollIntoView({ block: "start" });
  }
  // the pages of their own for practical actions and for paying for protection
  function bootSectionPage() {
    renderEvKey();
    if (document.body.dataset.page === "practical") renderPractical(); else renderFinance();
    initDisclosure();
    const h = decodeURIComponent(location.hash.slice(1)), t = h && document.getElementById(h); if (t && !h.startsWith("practical-")) t.scrollIntoView({ block: "start" });
  }
  function boot() {
    if (PLAN_PAGE) { bootPlanPage(); return; }
    if (SUB_PAGE) { bootSectionPage(); return; }
    // links shared before the plan, practical actions and paying for protection had their own pages
    const old = decodeURIComponent(location.hash.slice(1)); if (/^plan-(step-\d|story)/.test(old)) { location.replace(PLAN_URL + "#" + old); return; }
    if (/^practical-/.test(old)) { location.replace(PRACTICAL_URL + "#" + old); return; }
    if (/^fin-/.test(old)) { location.replace(FINANCE_URL + "#" + old); return; }
    renderPlanLaunch();
    layout();
    drawBackground();
    drawNodes();
    drawEdges();
    drawLevers();
    renderControls();
    renderIntro();
    guide.innerHTML = introHTML(true);
    renderLoopsSection();
    renderInstitutions();
    renderNetwork();
    renderPlan();
    renderGlossary();
    renderAtRisk();
    renderStrain();
    renderStalls();
    renderPractical();
    renderFinance();
    renderCooling();
    renderHomeHeats();
    renderNow();
    renderCity();
    renderTicker();
    renderHeatwaves();
    renderList();
    renderStats();
    initDisclosure();
    applyBreakState();
    fitAll(true, true);
    svg.classList.add("is-ready");
    routeHash();
    goFromQuery();
    // the plan page opens map links in this tab; follow them when only the hash changes. Links clicked here are
    // handled where they are clicked, so only a change arriving while the tab is in the background is routed.
    window.addEventListener("hashchange", () => { if (document.hidden || !document.hasFocus()) routeHash(); });
  }
  function routeHash() {
    const hash = decodeURIComponent(location.hash.slice(1));
    if (byId[hash]) select(hash);
    else if (hash.startsWith("loop-") && loopById[hash.slice(5)]) startStory(hash.slice(5));
    else if (hash.startsWith("break-") && leverById[hash.slice(6)]) selectLever(hash.slice(6));
    else if (hash.startsWith("who-") && instById[hash.slice(4)]) selectInstitution(hash.slice(4));
    else if (hash.startsWith("package-") && (pkgById[hash.slice(8)] || hash.slice(8) === "all")) applyPackage(hash.slice(8));
    // a shared glossary link opens the explainer ready to play; it never starts with sound by itself
    else if (hash.startsWith("watch-loop-") && loopById[hash.slice(11)]) openExplainer("loop:" + hash.slice(11), null, false);
    else if (hash.startsWith("watch-day-")) openExplainer("day:" + hash.slice(10), null, false);
    else if (hash.startsWith("watch-stall-")) openExplainer("stall:" + hash.slice(12), null, false);
    else if (hash.startsWith("watch-") && filmFor(hash.slice(6))) openExplainer("film:" + hash.slice(6), null, false);
    else if (hash.startsWith("watch-") && glossById[hash.slice(6)]) openExplainer(hash.slice(6), null, false);
  }

  const fontsReady = document.fonts && document.fonts.load
    ? Promise.all([document.fonts.load("600 13px Hanken Grotesk"), document.fonts.load("700 14px Hanken Grotesk")]).catch(() => {})
    : Promise.resolve();
  Promise.race([fontsReady, new Promise(r => setTimeout(r, 1800))]).then(boot);
})();

