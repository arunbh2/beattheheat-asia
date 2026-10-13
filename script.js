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

  const state = { selected: null, story: null, step: 0, filter: "all", inst: null };

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
  const markerColors = { hub: COLORS.ink, knock: "#4A5560", cross: "#2E6F95", vicious: COLORS.red };
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
      el("path", { class: "slice", "data-sys": s.id, style: `--c:${s.color}`,
        d: `M${p(r0, a0)} L${p(r1, a0)} A${r1},${r1} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${p(r1, a1)} L${p(r0, a1)} A${r0},${r0} 0 ${a1 - a0 > Math.PI ? 1 : 0} 0 ${p(r0, a0)} Z` }, gBg);
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
      e.marker = `url(#arr-${key})`;
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
    state.selected = null; state.story = null; state.inst = null;
    clearMarks();
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
    const steps = [{ edges: [], loopAll: true, title: "The loop", text: l.summary }];
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
      <p class="panel__desc">${esc(step.text)}</p>
      ${step.loopAll && !step.levers && story.loop ? chainHTML(story.loop) : ""}
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
    return `<li><button class="lever-btn" data-lever="${v.id}">
      <span class="lever-icon" aria-hidden="true"></span>
      <span><strong>${esc(v.title)}</strong>
      <small>Cuts ${esc(plain(byId[v.edge[0]]))} → ${esc(plain(byId[v.edge[1]]))}${v.loops.length > 1 ? ` · breaks ${v.loops.length} loops` : ""}</small></span>
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
      ${e.why ? `<p class="conn__why">${esc(e.why)}</p>` : ""}
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
      <p class="panel__desc">${esc(n.desc)}</p>
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
      <p class="panel__desc">${esc(v.text)}</p>
      ${v.example ? `<p class="example">${esc(v.example)}</p>` : ""}
      <h3 class="panel__h">Who can pull this lever</h3>
      <div class="who-chips">${whoChips(v)}</div>
      <h3 class="panel__h">Cuts the link</h3>
      <p class="cut"><button class="link" data-go="${a.id}">${esc(plain(a))}</button> <span aria-hidden="true">→</span> <button class="link" data-go="${b.id}">${esc(plain(b))}</button></p>
      <h3 class="panel__h">Breaks ${plural(v.loops.length, "vicious cycle")}</h3>
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
      <p class="panel__desc">${mobile ? "Drag and pinch the map, then tap" : "Drag the map, zoom in, and click"} any dot to see what it sets in motion and what drives it. Or walk through one of the <strong>${LOOPS.length} vicious cycles</strong> and see where each one breaks:</p>
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
    const act = t.dataset.act;
    if (act === "clear" || act === "done" || act === "close") { clearSelection(); fitAll(); }
    else if (act === "ripple") showRipple(t.dataset.id);
    else if (act === "next") { state.step++; renderStep(); }
    else if (act === "prev") { state.step--; renderStep(); }
  }
  document.addEventListener("click", ev => {
    if (ev.target.closest("#panel, #guide, #loops, #web-list, #who-holds")) handleAction(ev);
  });
  document.addEventListener("keydown", ev => {
    if (ev.key === "Escape" && (state.selected || state.story || state.inst)) { clearSelection(); fitAll(); }
  });

  document.getElementById("filters").addEventListener("click", ev => {
    const b = ev.target.closest("[data-filter]"); if (!b) return;
    state.filter = b.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach(x => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    applyFilter();
  });
  document.getElementById("toggle-all").addEventListener("change", ev => svg.classList.toggle("show-all", ev.target.checked));
  document.getElementById("toggle-levers").addEventListener("change", ev => svg.classList.toggle("show-levers", ev.target.checked));
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

  /* ======================= PAGE SECTIONS ======================= */
  function renderControls() {
    document.getElementById("filters").innerHTML = `<button class="chip" data-filter="all" aria-pressed="true">Whole web</button>` +
      SYSTEMS.map(s => `<button class="chip" data-filter="${s.id}" aria-pressed="false" style="--c:${s.color}"><span class="dot"></span>${esc(plain(s))}</button>`).join("");
    document.getElementById("who").innerHTML = `<option value="">Who holds the levers?</option>` +
      INSTITUTIONS.map(i => `<option value="${i.id}">${esc(i.name)}</option>`).join("");
  }

  function renderLoopsSection() {
    document.getElementById("loop-groups").innerHTML = LOOP_GROUPS.map(g => {
      const ls = LOOPS.filter(l => l.group === g.id);
      return `<div class="lgroup">
        <h3 class="lgroup__h">${esc(g.name)} <span>${ls.length}</span></h3>
        ${ls.map(l => `
          <article class="lrow">
            <div class="lrow__head">
              <h4><button class="lrow__name" data-story="${l.id}">${esc(l.name)}</button></h4>
              <span class="ev ev--${l.evidence}">${evidenceLabel(l.evidence)}</span>
            </div>
            <p class="lrow__sum">${esc(l.summary)}</p>
            ${chainHTML(l)}
            ${l.levers.length ? `<p class="lrow__breaks"><span>Break it:</span> ${l.levers.map(lid => `<button class="lever-chip" data-lever="${lid}">${esc(leverById[lid].title)}</button>`).join("")}</p>` : ""}
          </article>`).join("")}
      </div>`;
    }).join("");

    const ranked = nodes.filter(n => n.loops.length > 1).sort((a, b) => b.loops.length - a.loops.length).slice(0, 6);
    document.getElementById("pressure-points").innerHTML = ranked.map(n => `<li><button class="pp" data-go="${n.id}"><span class="pp__n">${n.loops.length}</span><span class="pp__name">${esc(plain(n))}</span><span class="pp__meta">loops run through it</span></button></li>`).join("");
    const multi = LEVERS.filter(v => v.loops.length > 1).sort((a, b) => b.loops.length - a.loops.length);
    document.getElementById("multi-levers").innerHTML = multi.map(v => `<li><button class="pp pp--lever" data-lever="${v.id}"><span class="pp__n">${v.loops.length}</span><span class="pp__name">${esc(v.title)}</span><span class="pp__meta">loops broken at once</span></button></li>`).join("");
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
    renderList();
    renderStats();
    fitAll(true, true);
    svg.classList.add("is-ready");
    const hash = decodeURIComponent(location.hash.slice(1));
    if (byId[hash]) select(hash);
    else if (hash.startsWith("loop-") && loopById[hash.slice(5)]) startStory(hash.slice(5));
    else if (hash.startsWith("break-") && leverById[hash.slice(6)]) selectLever(hash.slice(6));
    else if (hash.startsWith("who-") && instById[hash.slice(4)]) selectInstitution(hash.slice(4));
  }

  const fontsReady = document.fonts && document.fonts.load
    ? Promise.all([document.fonts.load("600 13px Inter"), document.fonts.load("700 14px Inter")]).catch(() => {})
    : Promise.resolve();
  Promise.race([fontsReady, new Promise(r => setTimeout(r, 1800))]).then(boot);
})();

/* ---------- "Cite this map" ---------- */
(function () {
  const btn = document.getElementById("cite-btn");
  const text = document.getElementById("cite-text");
  const status = document.getElementById("cite-status");
  if (!btn || !text) return;
  btn.addEventListener("click", async () => {
    const citation = text.textContent.replace(/\s+/g, " ").trim();
    let ok = false;
    try { await navigator.clipboard.writeText(citation); ok = true; } catch (e) {
      const range = document.createRange(); range.selectNodeContents(text);
      const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
      try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
    }
    status.textContent = ok ? "Citation copied." : "Select the citation above and copy it.";
    btn.textContent = ok ? "Copied ✓" : "Cite this map";
    setTimeout(() => { btn.textContent = "Cite this map"; status.textContent = ""; }, 2600);
  });
})();
