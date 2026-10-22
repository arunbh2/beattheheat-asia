/* ==========================================================
   Extreme heat is a wicked problem — map engine
   Plain JavaScript, no libraries. All content lives in data.js.
   ========================================================== */

(function () {
  "use strict";

  const SVGNS = "http://www.w3.org/2000/svg";
  const HUB_R = 150, DOMAIN_RING = 470, DOMAIN_R = 40, RIM = 1330;
  const LABEL_K = 0.9;               // zoom level at which every label is shown
  const COLORS = { hub: "#F26430", red: "#D7263D", ink: "#16202B" };

  const svg = document.getElementById("web");
  const stage = document.getElementById("map-stage");
  const panel = document.getElementById("panel");
  const panelBody = document.getElementById("panel-body");
  const guide = document.getElementById("guide");
  if (!svg || typeof SYSTEMS === "undefined") return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Background loops (title web, heatwave rooftops). Play by default; start paused for reduced motion or data saver,
  // and whenever the browser refuses to autoplay. The play/pause button is always there, and a visitor's choice is remembered.
  function ambientLoop(videoId, btnId, key, noun) {
    const v = document.getElementById(videoId), btn = document.getElementById(btnId);
    if (!v || !btn) return;
    const saveData = navigator.connection && navigator.connection.saveData;
    let stored = null; try { stored = localStorage.getItem(key); } catch (e) {}
    let paused = stored === "1" || (stored !== "0" && (reduceMotion || saveData)), onScreen = false;
    v.muted = true; v.defaultMuted = true;
    const label = () => {
      btn.setAttribute("aria-pressed", String(paused));
      btn.querySelector(".visually-hidden").textContent = (paused ? "Play " : "Pause ") + noun;
    };
    const sync = () => {
      label();
      if (!paused && onScreen) {
        if (v.preload !== "auto") v.preload = "auto";
        const p = v.play();
        if (p && p.catch) p.catch(() => { paused = true; label(); }); // autoplay blocked (e.g. low power mode): offer play
      } else v.pause();
    };
    btn.hidden = false;
    btn.addEventListener("click", () => { paused = !paused; try { localStorage.setItem(key, paused ? "1" : "0"); } catch (e) {} sync(); });
    if ("IntersectionObserver" in window) new IntersectionObserver(es => { onScreen = es[0].isIntersecting; sync(); }, { rootMargin: "200px 0px" }).observe(v);
    else onScreen = true;
    label(); if (onScreen) sync();
  }
  ambientLoop("intro-video", "intro-pause", "bth-hero-paused", "background animation");
  ambientLoop("day-video", "day-pause", "bth-day-paused", "background footage");
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
  const extLink = (url, text) => `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(text)}<span class="visually-hidden"> (opens in a new tab)</span>&nbsp;<span aria-hidden="true">↗</span></a>`;
  // the heat network: organisations already working on each lever
  const ORGS = typeof ORGANISATIONS !== "undefined" ? ORGANISATIONS : [];
  const orgsForLever = id => ORGS.filter(o => o.levers.includes(id));
  const orgsForLoop = l => ORGS.filter(o => o.levers.some(v => l.levers.includes(v)));
  const tellUs = `<a class="missing-link" href="https://www.linkedin.com/in/arunabhabhattacharya" target="_blank" rel="noopener author">Tell us<span class="visually-hidden"> (opens LinkedIn in a new tab)</span> <span aria-hidden="true">→</span></a>`;

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

  function evidenceHTML(l, open) {
    const ev = evidenceOf(l.id); if (!ev.length) return "";
    return `<details class="evid"${open ? " open" : ""}><summary>See the evidence <span>${plural(ev.length, "source")}</span></summary>
      <ul>${ev.map(x => `<li>${extLink(x.url, x.title)}<small>${esc(x.by)}</small><p>${gloss(x.finding)}</p></li>`).join("")}</ul>
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
        const w = Math.max(...lines.map(l => textWidth(l, "600 13px Inter, Arial"))) + 8;
        n.lw = w; n.lh = lines.length * 15.5 + 4;
        n.box = { l: -Math.max(w / 2, n.r), r: Math.max(w / 2, n.r), t: -n.r, b: n.r + 4 + lines.length * 15.5 };
      }
    });

    // each system gets a slice of the wheel sized by how many consequences it holds
    const weights = SYSTEMS.map(s => nodes.filter(n => n.kind === "leaf" && n.sys === s.id).length + 3);
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
      const radii = leaves.length > 8 ? [740, 960, 1180] : leaves.length > 4 ? [780, 1060] : [820, 1080];
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
    gNodes.textContent = "";
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
        const t = el("text", { class: "node__label", "text-anchor": "middle", y: n.r + 3 }, g);
        n.lines.forEach((line, i) => { el("tspan", { x: 0, dy: i === 0 ? "1em" : "1.15em" }, t).textContent = line; });
      }
      el("title", {}, g).textContent = plain(n);
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
  const zoomInBtn = document.getElementById("zoom-in");
  const zoomOutBtn = document.getElementById("zoom-out");

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
        const box = { l: n.x - hw, r: n.x + hw, t: n.y + n.r, b: n.y + n.r + n.lh / k };
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
  document.getElementById("zoom-fit").addEventListener("click", () => fitAll());

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
      ${step.place ? `<p class="place"><span>Where to look</span>${esc(step.place)}</p>` : ""}
      ${story.loop && state.step === 0 ? watchButton("loop:" + story.loop.id, "Watch this loop") : ""}
      ${story.loop && state.step === 0 ? evidenceHTML(story.loop, false) : ""}
      ${story.loop && isBroken(story.loop.id) ? `<p class="broken-note">✓ The actions you’ve switched on could help interrupt this cycle</p>` : ""}
      ${step.levers && story.loop.levers.length ? `<ul class="lever-list">${story.loop.levers.map(lid => leverItem(leverById[lid])).join("")}</ul>` : ""}
      <div class="panel__nav">
        <button class="btn btn--ghost" data-act="prev" ${state.step === 0 ? "disabled" : ""}>← Back</button>
        <button class="btn" data-act="${last ? "done" : "next"}">${last ? "Explore freely" : "Next →"}</button>
      </div>
      <button class="link" data-act="clear">Leave the guided path</button>`;
    flyTo(focus, { maxK: 1.35, minK: 0.95, center: step.edges.length ? step.edges[step.edges.length - 1][1] : null });
  }

  /* ======================= PANEL CONTENT ======================= */
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

  function renderNode(id) {
    const n = byId[id];
    const loops = n.loops.map(lid => loopById[lid]);
    const levers = [...new Set(n.levers)].map(lid => leverById[lid]);
    const kicker = n.kind === "hub" ? "The centre of the web" : n.kind === "domain" ? "System" : plain(sysById[n.sys]);
    panelBody.innerHTML = `
      <p class="panel__kicker" style="--c:${n.color}"><span class="dot"></span>${esc(kicker)}</p>
      <h2 class="panel__title">${esc(plain(n))}</h2>
      <p class="panel__desc">${gloss(n.desc)}</p>
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
      ${v.example ? `<p class="example">${gloss(v.example)}</p>` : ""}
      <h3 class="panel__h">Who can pull this lever</h3>
      <div class="who-chips">${whoChips(v)}</div>
      <h3 class="panel__h">Already working on it</h3>
      ${orgsForLever(v.id).length ? `<ul class="org-mini">${orgsForLever(v.id).slice(0, 5).map(o => `<li>${extLink(o.url, o.name)}<p>${gloss(o.does)}</p></li>`).join("")}</ul>
        ${orgsForLever(v.id).length > 5 ? `<button class="link" data-act="orgs-lever" data-id="${v.id}">See all ${orgsForLever(v.id).length} in the heat network →</button>` : ""}`
        : `<p class="panel__note">No organisation on our list is working on this lever yet. Know one? ${tellUs}</p>`}
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
      <p class="panel__kicker is-break">Who holds the levers</p>
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
      <button class="btn btn--full btn--tour" data-act="tour">New here? Take the 60-second tour</button>
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
    if (ev.target.closest("#panel, #guide, #loops, #web-list, #who-holds, #network, #breakbar, #day, #path-form, .intro")) handleAction(ev);
  });
  document.addEventListener("keydown", ev => {
    if (ev.key === "Escape" && (state.selected || state.story || state.inst || state.pkg)) { clearSelection(); fitAll(); }
  });

  document.getElementById("filters").addEventListener("click", ev => {
    const b = ev.target.closest("[data-filter]"); if (!b) return;
    state.filter = b.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach(x => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    applyFilter();
  });
  document.getElementById("toggle-all").addEventListener("change", ev => svg.classList.toggle("show-all", ev.target.checked));
  document.getElementById("toggle-levers").addEventListener("change", ev => svg.classList.toggle("show-levers", ev.target.checked));
  const pathForm = document.getElementById("path-form");
  if (pathForm) pathForm.addEventListener("submit", ev => {
    ev.preventDefault();
    tracePath(document.getElementById("path-from").value, document.getElementById("path-to").value);
  });
  document.getElementById("who").addEventListener("change", ev => { if (ev.target.value) selectInstitution(ev.target.value); else { clearSelection(); fitAll(); } });

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
    L.push(`BREAKING THE LOOPS OF EXTREME HEAT`, `A brief for: ${d.inst.name}`, `From the BeatTheHeat.Asia systems map: ${d.url}`, "");
    L.push(`Extreme heat is a global health emergency and an urgent and growing threat. On this map, ${d.inst.name.toLowerCase()} hold ${plural(d.levers.length, "lever")} that can help break ${d.loops.length} of the ${LOOPS.length} vicious cycles that make heat worse.`, "");
    L.push("YOUR PROTECTION CHAIN");
    STAGES.forEach(([k, label]) => d.pb[k] && L.push(`${label}: ${d.pb[k]}`));
    L.push("", "YOUR LEVERS");
    d.levers.forEach(v => { L.push(`- ${v.title} [${WHEN[v.when] || ""}]: ${v.text} (Cuts ${plain(byId[v.edge[0]])} → ${plain(byId[v.edge[1]])}; could help interrupt ${v.loops.map(l => loopById[l].name).join(", ") || "no mapped loop"}.)`); if (v.example) L.push(`  Example: ${v.example}`); });
    L.push("", "LOOPS YOU CAN HELP INTERRUPT");
    d.loops.forEach(l => { L.push(`- ${l.name} (${evidenceLabel(l.evidence)}): ${l.summary}`); evidenceOf(l.id).forEach(x => L.push(`  Evidence: ${x.by}, “${x.title}”: ${x.finding} ${x.url}`)); });
    if (d.partners.length) { L.push("", "WHO TO WORK WITH", `These institutions share your levers: ${d.partners.map(p => p.inst.name).join(", ")}.`); }
    L.push("", "This map is large, but the real web is larger. Loops marked “Evidence emerging” have evidence for each link; the full cycle has been studied less.");
    return L.join("\n");
  }

  function openBrief(id) {
    const d = briefData(id);
    const css = `body{font-family:Inter,Segoe UI,Arial,sans-serif;color:#16202B;max-width:760px;margin:40px auto;padding:0 24px;line-height:1.55}
      h1{font-family:Anton,Impact,sans-serif;font-weight:400;text-transform:uppercase;font-size:40px;line-height:1;margin:6px 0 4px}
      .k{color:#D7263D;font-weight:700;letter-spacing:.14em;text-transform:uppercase;font-size:12px}.sub{color:#5E6570}
      h2{font-size:13px;letter-spacing:.12em;text-transform:uppercase;border-top:2px solid #16202B;padding-top:10px;margin-top:28px}
      .chain{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.chain div{border-top:4px solid #1F7A70;padding-top:8px}
      .chain b{display:block;color:#1F7A70}li{margin:8px 0}.when{display:inline-block;padding:1px 8px;border-radius:999px;background:#E8F2F0;color:#1F7A70;font-size:12px;font-weight:700}a{color:#1F7A70}.ex{color:#5E6570;font-size:14px}.ev{font-size:12px;color:#5E6570}
      .bar{height:8px;background:#E3EEEC;border-radius:4px;margin:8px 0}.bar span{display:block;height:100%;background:#1F7A70;border-radius:4px}
      .print{position:fixed;top:16px;right:16px;padding:10px 18px;border-radius:999px;border:0;background:#F26430;font-weight:700;cursor:pointer}
      @media print{.print{display:none}body{margin:0}} @media(max-width:600px){.chain{grid-template-columns:1fr 1fr}}`;
    const h = s => esc(s);
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Heat brief: ${h(d.inst.name)}</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;600;700&display=swap"><style>${css}</style></head><body>
      <button class="print" onclick="window.print()">Print or save as PDF</button>
      <p class="k">A global health emergency</p><h1>Breaking the loops of extreme heat</h1>
      <p class="sub">A brief for <strong>${h(d.inst.name)}</strong> · from the BeatTheHeat.Asia systems map · <a href="${h(d.url)}">${h(d.url)}</a></p>
      <p>Extreme heat is an urgent and growing threat. On this map, ${h(d.inst.name.toLowerCase())} hold <strong>${plural(d.levers.length, "lever")}</strong> that can help break <strong>${d.loops.length} of the ${LOOPS.length}</strong> vicious cycles that make heat worse.</p>
      <div class="bar"><span style="width:${(d.loops.length / LOOPS.length * 100).toFixed(1)}%"></span></div>
      <h2>Your protection chain</h2><div class="chain">${STAGES.map(([k, l]) => `<div><b>${l}</b>${h(d.pb[k] || "")}</div>`).join("")}</div>
      <h2>Your levers</h2><ul>${d.levers.map(v => `<li><strong>${h(v.title)}.</strong> <span class="when">${h(WHEN[v.when] || "")}</span> ${h(v.text)}<br><span class="ex">Cuts ${h(plain(byId[v.edge[0]]))} → ${h(plain(byId[v.edge[1]]))}. Could help interrupt: ${h(v.loops.map(l => loopById[l].name).join(", ") || "no mapped loop")}.${v.example ? " Example: " + h(v.example) : ""}</span></li>`).join("")}</ul>
      <h2>Loops you can help break</h2><ul>${d.loops.map(l => `<li><strong>${h(l.name)}</strong> <span class="ev">(${evidenceLabel(l.evidence)})</span><br>${h(l.summary)}${evidenceOf(l.id).map(x => `<br><span class="ex">Evidence: <a href="${h(x.url)}">${h(x.title)}</a> (${h(x.by)}). ${h(x.finding)}</span>`).join("")}</li>`).join("")}</ul>
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
  const PLAN_KEY = "bth-plan-v1";
  let plan = { place: "", group: "", levers: [], rows: {}, example: null };
  try { const saved = JSON.parse(localStorage.getItem(PLAN_KEY) || "null"); if (saved && Array.isArray(saved.levers)) plan = Object.assign(plan, saved); } catch (e) {}
  const savePlan = () => { try { localStorage.setItem(PLAN_KEY, JSON.stringify(plan)); } catch (e) {} };
  const planRow = id => plan.rows[id] || (plan.rows[id] = { lead: (leverById[id].who || [])[0] || "", payer: PAYERS[0], measure: "" });
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
        <p class="plan-row__title">${esc(v.title)} ${whenTag(v)}</p>
        <label>Who leads <select data-pl-field="lead">${leads.map(i => `<option value="${i}"${r.lead === i ? " selected" : ""}>${esc(instById[i].name)}${(v.who || []).includes(i) ? "" : " (not usual)"}</option>`).join("")}</select></label>
        <label>Who pays <select data-pl-field="payer">${PAYERS.map(p => `<option${r.payer === p ? " selected" : ""}>${esc(p)}</option>`).join("")}</select></label>
        <label class="plan-row__wide">How you will know it is working <input type="text" data-pl-field="measure" value="${esc(r.measure)}" placeholder="e.g. ${esc(v.measure || "")}"></label>
      </div>`;
    }).join("");
  }

  function renderPlanSummary() {
    const box = document.getElementById("plan-summary"); if (!box) return;
    const loops = planLoops(), rows = plan.levers.map(id => planRow(id));
    const leads = new Set(rows.map(r => r.lead).filter(Boolean));
    const payers = {}; rows.forEach(r => { payers[r.payer] = (payers[r.payer] || 0) + 1; });
    const unpaid = payers["Not decided yet"] || 0;
    const timing = Object.keys(WHEN).map(w => [WHEN[w], plan.levers.filter(id => leverById[id].when === w).length]).filter(x => x[1]);
    const group = PG.find(g => g.id === plan.group);
    box.innerHTML = `<p class="plan-summary__k">Your plan</p>
      <h3>${esc(plan.place || "Your place")}${group ? ` · ${esc(group.name.toLowerCase())}` : ""}</h3>
      <div class="plan-summary__stats">
        <p><strong>${plan.levers.length}</strong> action${plan.levers.length === 1 ? "" : "s"}</p>
        <p><strong>${loops.length}</strong> of ${LOOPS.length} cycles they could help interrupt</p>
        <p><strong>${leads.size}</strong> institution${leads.size === 1 ? "" : "s"} leading</p>
      </div>
      ${timing.length ? `<p class="plan-summary__line"><b>When it works:</b> ${timing.map(([l, n]) => `${esc(l)} (${n})`).join(", ")}</p>` : ""}
      ${rows.length ? `<p class="plan-summary__line"><b>Who pays:</b> ${Object.entries(payers).map(([p, n]) => `${esc(p)} (${n})`).join(", ")}</p>` : ""}
      ${unpaid ? `<p class="plan-summary__gap">${plural(unpaid, "action")} with nobody paying yet. That is the conversation to have next.</p>` : ""}
      ${loops.length ? `<p class="plan-summary__line"><b>Cycles in play:</b> ${loops.map(l => esc(l.name.replace(/^The /, ""))).join(", ")}</p>` : ""}
      <p class="plan-summary__note">Illustrative: real effect depends on reach, quality and how long each action lasts.</p>
      <div class="plan-summary__actions">
        <button type="button" class="btn btn--sm" data-pl-act="map"${plan.levers.length ? "" : " disabled"}>Show on the map</button>
        <button type="button" class="btn btn--sm btn--ghost" data-pl-act="print"${plan.levers.length ? "" : " disabled"}>Open a printable plan</button>
        <button type="button" class="btn btn--sm btn--ghost" data-pl-act="copy"${plan.levers.length ? "" : " disabled"}>Copy as text</button>
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
      <h3>${esc(ex.title)}</h3>
      <ol class="plan-story__steps">
        <li><b>What happened</b>${gloss(ex.trigger)}</li>
        <li><b>What they decided</b>${gloss(ex.decision)}</li>
        <li><b>What changed</b>${gloss(ex.result)}</li>
      </ol>
      <p class="plan-story__src">Sources: ${ex.sources.map(x => extLink(x.url, x.label)).join(" · ")}</p>
      <p class="plan-story__note">The plan below is filled in with Ahmedabad’s documented actions. Who paid is not set out in these sources, so it is marked “Not documented”. Change anything to make it your own.</p>`;
  }

  function renderPlan() {
    const place = document.getElementById("plan-place"), grp = document.getElementById("plan-group");
    if (!place || !grp) return;
    grp.innerHTML = `<option value="">Choose a group…</option>` + PG.map(g => `<option value="${g.id}"${plan.group === g.id ? " selected" : ""}>${esc(g.name)}</option>`).join("");
    place.value = plan.place;
    renderPlanStory(); renderPlanActions(); renderPlanRows(); renderPlanSummary();
  }

  function planText() {
    const g = PG.find(x => x.id === plan.group), L = [];
    L.push("HEAT RESPONSE PLAN", `Place: ${plan.place || "(not set)"}`, `People at risk: ${g ? g.name : "(not set)"}`, `Made with the BeatTheHeat.Asia systems map: ${location.origin + location.pathname}`, "");
    plan.levers.forEach((id, i) => { const v = leverById[id], r = planRow(id);
      L.push(`${i + 1}. ${v.title} [${WHEN[v.when] || ""}]`, `   Leads: ${instById[r.lead] ? instById[r.lead].name : "-"}`, `   Pays: ${r.payer}`, `   How we will know: ${r.measure || v.measure || "-"}`); });
    L.push("", `Cycles these actions could help interrupt: ${planLoops().map(l => l.name).join(", ") || "none"}`, "", "Illustrative: real effect depends on reach, quality and how long each action lasts.");
    return L.join("\n");
  }

  function openPlan() {
    const g = PG.find(x => x.id === plan.group), ex = EXAMPLES.find(x => x.id === plan.example), h = esc;
    const css = `body{font-family:Inter,Segoe UI,Arial,sans-serif;color:#16202B;max-width:860px;margin:40px auto;padding:0 24px;line-height:1.5}
      h1{font-family:Anton,Impact,sans-serif;font-weight:400;text-transform:uppercase;font-size:38px;line-height:1;margin:6px 0}
      .k{color:#1F7A70;font-weight:700;letter-spacing:.14em;text-transform:uppercase;font-size:12px}.sub{color:#5E6570}
      table{width:100%;border-collapse:collapse;margin-top:18px;font-size:14px}th,td{text-align:left;vertical-align:top;padding:8px;border-bottom:1px solid #E6DFD4}
      th{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#5E6570}.gap{color:#9E1A2C;font-weight:700}
      h2{font-size:13px;letter-spacing:.12em;text-transform:uppercase;border-top:2px solid #16202B;padding-top:10px;margin-top:26px}
      .note{color:#5E6570;font-size:13px}.print{position:fixed;top:16px;right:16px;padding:10px 18px;border-radius:999px;border:0;background:#F26430;font-weight:700;cursor:pointer}
      @media print{.print{display:none}body{margin:0}}`;
    const rows = plan.levers.map(id => { const v = leverById[id], r = planRow(id);
      return `<tr><td><strong>${h(v.title)}</strong><br><span class="note">${h(WHEN[v.when] || "")}</span></td><td>${h(instById[r.lead] ? instById[r.lead].name : "")}</td><td class="${r.payer === "Not decided yet" ? "gap" : ""}">${h(r.payer)}</td><td>${h(r.measure || v.measure || "")}</td></tr>`; }).join("");
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Heat response plan: ${h(plan.place || "draft")}</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;600;700&display=swap"><style>${css}</style></head><body>
      <button class="print" onclick="window.print()">Print or save as PDF</button>
      <p class="k">Heat response plan · draft</p><h1>${h(plan.place || "Our place")}</h1>
      <p class="sub">Protecting: <strong>${h(g ? g.name : "not set")}</strong> · made with the BeatTheHeat.Asia systems map</p>
      ${ex ? `<p class="note">Based on the worked example: ${h(ex.title)}.</p>` : ""}
      <table><thead><tr><th>Action</th><th>Who leads</th><th>Who pays</th><th>How we will know</th></tr></thead><tbody>${rows}</tbody></table>
      <h2>Cycles these actions could help interrupt</h2><p>${h(planLoops().map(l => l.name).join(", ") || "None yet")}</p>
      <p class="note" style="margin-top:28px">Illustrative systems map: real effect depends on how many people each action reaches, how well it is delivered and how long it lasts. For evidence on what works and what it costs, see What Works Against Heat.</p>
      </body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    const w = window.open(url, "_blank");
    if (!w) { const a = document.createElement("a"); a.href = url; a.download = "heat-response-plan.html"; document.body.appendChild(a); a.click(); a.remove(); }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  function loadExample(id) {
    const ex = EXAMPLES.find(x => x.id === id); if (!ex) return;
    plan = { place: ex.place, group: ex.group, levers: ex.actions.map(a => a.lever), rows: {}, example: ex.id };
    ex.actions.forEach(a => { plan.rows[a.lever] = { lead: a.lead, payer: a.payer, measure: a.measure }; });
    savePlan(); renderPlan();
    document.getElementById("plan-story").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  (function wirePlan() {
    const sec = document.getElementById("plan"); if (!sec) return;
    const changed = (rows = true) => { savePlan(); if (rows) renderPlanRows(); renderPlanSummary(); };
    sec.addEventListener("input", ev => {
      const t = ev.target;
      if (t.id === "plan-place") { plan.place = t.value; changed(false); }
      else if (t.dataset.plField === "measure") { planRow(t.closest("[data-pl-row]").dataset.plRow).measure = t.value; savePlan(); }
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
      } else if (t.dataset.plField === "lead" || t.dataset.plField === "payer") {
        planRow(t.closest("[data-pl-row]").dataset.plRow)[t.dataset.plField] = t.value; changed(false);
      }
    });
    sec.addEventListener("click", ev => {
      const ex = ev.target.closest("[data-plan-example]"); if (ex) { loadExample(ex.dataset.planExample); return; }
      const b = ev.target.closest("[data-pl-act]"); if (!b) return;
      const act = b.dataset.plAct, status = sec.querySelector("[data-pl-status]");
      if (act === "map") goToMap(() => applyLevers(plan.levers, plan.place || "Your plan", "The actions in your plan, switched on together."));
      else if (act === "print") openPlan();
      else if (act === "copy") navigator.clipboard.writeText(planText()).then(() => { if (status) status.textContent = "Plan copied. Paste it into an email or document."; }, () => { if (status) status.textContent = "Couldn’t copy. Use “Open a printable plan” instead."; });
      else if (act === "clear") { plan = { place: "", group: "", levers: [], rows: {}, example: null }; savePlan(); renderPlan(); }
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
    const still = stored === "1" || (stored !== "0" && (reduceMotion || (navigator.connection && navigator.connection.saveData)));
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
    setMode("film");
    filmTitle.innerHTML = filmTitleHTML;
    showDialog(opener);
  }
  // every short film the player can show: glossary terms, vicious cycles and section films
  const VIDEO_LOOPS = LOOPS.filter(l => l.video);
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
    if (kind === "film") {
      const f = filmFor(id); if (!f || !f.video) return null;
      return { key: "film:" + id, title: f.title, label: f.label, video: f.video, length: f.length, note: note(f.title, f.text),
        next: null, hash: "watch-" + id, endK: f.label, back: f.back };
    }
    return null;
  }
  function openExplainer(key, opener, autoplay = true) {
    const c = clipFor(key); if (!film || !c) return;
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
      text: () => "Switch on “Green, cool cities”. Trees, shade and cool roofs cut the link between hot streets and cooling demand. The loop turns teal, and the map cools a little.",
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
    document.getElementById("who").innerHTML = `<option value="">Who holds the levers?</option>` +
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
        <h3 class="lgroup__h">${esc(g.name)} <span>${ls.length}</span></h3>
        ${ls.map(l => `
          <article class="lrow" data-loop="${l.id}">
            <div class="lrow__head">
              <h4><button class="lrow__name" data-story="${l.id}">${esc(l.name)}</button></h4>
              <span class="ev ev--${l.evidence}">${evidenceLabel(l.evidence)}</span>
              <span class="ev ev--broken">✓ Action switched on</span>
            </div>
            <p class="lrow__sum">${gloss(l.summary)}</p>
            ${watchButton("loop:" + l.id, "Watch this loop")}
            ${chainHTML(l)}
            ${typeof LOOP_PLACES !== "undefined" && LOOP_PLACES[l.id] ? `<p class="place"><span>Where to look</span>${esc(LOOP_PLACES[l.id])}</p>` : ""}
            ${evidenceHTML(l, false)}
            ${l.levers.length ? `<p class="lrow__breaks"><span>Break it:</span> ${l.levers.map(lid => `<button class="lever-chip" data-lever="${lid}">${esc(leverById[lid].title)}<span class="lever-chip__when">${esc(WHEN[leverById[lid].when] || "")}</span></button>`).join("")}</p>` : ""}
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
    list.innerHTML = ORGS.map(o => `
      <li class="org" data-role="${o.role}">
        <p class="org__role">${esc((R.find(r => r.id === o.role) || {}).name || "")}</p>
        <h3 class="org__name">${extLink(o.url, o.name)}</h3>
        <p class="org__does">${gloss(o.does)}</p>
        <p class="org__levers">${o.levers.map(v => leverById[v] ? `<button class="lever-chip" data-lever="${v}">${esc(leverById[v].title)}</button>` : "").join("")}</p>
      </li>`).join("");
    // show a dozen at a time so the list never overwhelms
    const FIRST = 12;
    let role = "all", expanded = false, query = "";
    const search = document.getElementById("org-search"), count = document.getElementById("org-count");
    const more = document.createElement("button");
    more.type = "button"; more.className = "btn btn--ghost btn--sm org-more";
    list.after(more);
    function showOrgs() {
      const q = query.trim().toLowerCase();
      const match = [...list.querySelectorAll(".org")].filter(li => (role === "all" || li.dataset.role === role) && (!q || li.textContent.toLowerCase().includes(q)));
      if (count) count.textContent = q ? (match.length ? `${plural(match.length, "organisation")} match “${query.trim()}”` : `No organisation on this list matches “${query.trim()}”.`) : "";
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
    showOrgs();
    const gf = document.getElementById("gaps-film"); if (gf) gf.innerHTML = watchButton("film:gaps", "Watch: where the gaps may be");
    const mf = document.getElementById("method-film"); if (mf) mf.innerHTML = watchButton("film:method", "Watch: how this map works");
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
        <dl>${terms.map(g => `<div id="term-${g.id}"><dt>${esc(g.term)}${g.video ? ` <button type="button" class="gloss-watch" data-watch="${g.id}" aria-label="Watch the ${esc(g.term.toLowerCase())} explainer (${esc(g.length || "0:30")})"><span class="play-icon" aria-hidden="true"></span>${esc(g.length || "0:30")}</button>` : ""}</dt><dd>${esc(g.text)}</dd></div>`).join("")}</dl>
      </details>`;
    }).join("");
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

  /* ======================= BOOT ======================= */
  function boot() {
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
    renderList();
    renderStats();
    applyBreakState();
    fitAll(true, true);
    svg.classList.add("is-ready");
    const hash = decodeURIComponent(location.hash.slice(1));
    if (byId[hash]) select(hash);
    else if (hash.startsWith("loop-") && loopById[hash.slice(5)]) startStory(hash.slice(5));
    else if (hash.startsWith("break-") && leverById[hash.slice(6)]) selectLever(hash.slice(6));
    else if (hash.startsWith("who-") && instById[hash.slice(4)]) selectInstitution(hash.slice(4));
    else if (hash.startsWith("package-") && (pkgById[hash.slice(8)] || hash.slice(8) === "all")) applyPackage(hash.slice(8));
    // a shared glossary link opens the explainer ready to play; it never starts with sound by itself
    else if (hash.startsWith("watch-loop-") && loopById[hash.slice(11)]) openExplainer("loop:" + hash.slice(11), null, false);
    else if (hash.startsWith("watch-day-")) openExplainer("day:" + hash.slice(10), null, false);
    else if (hash.startsWith("watch-") && filmFor(hash.slice(6))) openExplainer("film:" + hash.slice(6), null, false);
    else if (hash.startsWith("watch-") && glossById[hash.slice(6)]) openExplainer(hash.slice(6), null, false);
  }

  const fontsReady = document.fonts && document.fonts.load
    ? Promise.all([document.fonts.load("600 13px Inter"), document.fonts.load("700 14px Inter")]).catch(() => {})
    : Promise.resolve();
  Promise.race([fontsReady, new Promise(r => setTimeout(r, 1800))]).then(boot);
})();

