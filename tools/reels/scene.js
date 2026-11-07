// Common Shade Reels: the drawing engine, run in the page that render.js films. window.tick(ms) redraws the frame for
// that moment, so the film does not depend on machine speed. Faceless line figures only; money moves, never counted.
// Drawings use a 520 × 520 box (ground at y = 470), placed in the middle of the 1080 × 1920 frame.
(function () {
  "use strict";
  const F = window.FILM, S = F.scenes, T = F.timing;
  const C = { ink: "#16202B", cream: "#F6E7D7", orange: "#F26430", ember: "#B8401A", green: "#5CCB8F", dim: "#5E6570" };
  const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const ease = x => { x = cl(x); return x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; };
  const on = (t, at, d = .45) => ease((t - at) / d);                 // 0 → 1 from time `at`
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const g = (o, body, tf = "") => o <= 0.001 ? "" : `<g opacity="${o.toFixed(3)}"${tf ? ` transform="${tf}"` : ""}>${body}</g>`;
  const L = (d, c = C.cream, w = 7) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const txt = (x, y, s, size = 24, c = C.cream, anchor = "middle", wt = 700) => `<text x="${x}" y="${y}" fill="${c}" font-family="Hanken Grotesk" font-weight="${wt}" font-size="${size}" text-anchor="${anchor}" letter-spacing=".04em">${esc(s)}</text>`;

  // a standing figure, feet at (x, y); faceless
  const fig = (x, y = 470, s = 1, arms = "down", c = C.cream) => {
    const X = n => (x + n * s).toFixed(1), Y = n => (y - n * s).toFixed(1);
    const A = { down: `M${X(0)} ${Y(128)} L${X(-26)} ${Y(84)} M${X(0)} ${Y(128)} L${X(26)} ${Y(84)}`,
      push: `M${X(0)} ${Y(128)} L${X(40)} ${Y(104)} M${X(0)} ${Y(128)} L${X(36)} ${Y(96)}`,
      knock: `M${X(0)} ${Y(128)} L${X(-26)} ${Y(84)} M${X(0)} ${Y(128)} L${X(30)} ${Y(150)}`,
      wave: `M${X(0)} ${Y(128)} L${X(-26)} ${Y(84)} M${X(0)} ${Y(128)} L${X(34)} ${Y(176)}`,
      phone: `M${X(0)} ${Y(128)} L${X(-26)} ${Y(84)} M${X(0)} ${Y(128)} L${X(22)} ${Y(112)} L${X(16)} ${Y(150)}` }[arms];
    return `<circle cx="${X(0)}" cy="${Y(166)}" r="${(20 * s).toFixed(1)}" fill="none" stroke="${c}" stroke-width="7"/>` + L(`M${X(0)} ${Y(146)} V${Y(70)} L${X(-20)} ${Y(0)} M${X(0)} ${Y(70)} L${X(20)} ${Y(0)} ${A}`, c);
  };
  // an older woman: a slight stoop, a walking stick, a bun at the back of the head; faceless
  const elder = (x, y = 470, s = 1, c = C.cream) => {
    const X = n => (x + n * s).toFixed(1), Y = n => (y - n * s).toFixed(1);
    return `<circle cx="${X(10)}" cy="${Y(158)}" r="${(19 * s).toFixed(1)}" fill="none" stroke="${c}" stroke-width="7"/><circle cx="${X(-6)}" cy="${Y(170)}" r="${(7 * s).toFixed(1)}" fill="${c}"/>` +
      L(`M${X(6)} ${Y(139)} Q${X(0)} ${Y(105)} ${X(-2)} ${Y(68)} L${X(-20)} ${Y(0)} M${X(-2)} ${Y(68)} L${X(16)} ${Y(0)} M${X(4)} ${Y(122)} L${X(34)} ${Y(92)} M${X(34)} ${Y(92)} L${X(40)} ${Y(0)} M${X(4)} ${Y(122)} L${X(-16)} ${Y(86)}`, c) +
      L(`M${X(-24)} ${Y(70)} Q${X(-2)} ${Y(60)} ${X(22)} ${Y(70)} L${X(28)} ${Y(4)} L${X(-30)} ${Y(4)} Z`, c, 5);   // a long skirt
  };
  const sun = (cx, cy, r, t, c = C.orange) => { const p = 1 + .04 * Math.sin(t * 3);
    return `<circle cx="${cx}" cy="${cy}" r="${(r * p).toFixed(1)}" fill="${c}"/>` + L([0, 45, 90, 135, 180, 225, 270, 315].map(a => { const q = a * Math.PI / 180, r1 = r * p + 16, r2 = r * p + 34;
      return `M${(cx + r1 * Math.cos(q)).toFixed(0)} ${(cy + r1 * Math.sin(q)).toFixed(0)} L${(cx + r2 * Math.cos(q)).toFixed(0)} ${(cy + r2 * Math.sin(q)).toFixed(0)}`; }).join(" "), c, 6); };
  const moon = (cx, cy) => `<path d="M${cx} ${cy - 50} a52 52 0 1 0 42 88 a42 42 0 1 1 -42 -88 Z" fill="${C.cream}"/>`;
  const haze = (x, y, t, c = C.orange) => { const k = (t * 30) % 28;
    return L(`M${x - k} ${y} q14 -10 28 0 t28 0 t28 0 M${x + 20 - k} ${y + 30} q14 -10 28 0 t28 0`, c, 5); };
  const ground = L("M20 470 H500", C.cream, 5);
  const coin = (x, y, r = 15, c = C.orange) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${x}" cy="${y}" r="${r * .55}" fill="none" stroke="${C.ink}" stroke-width="3"/>`;
  const cart = x => L(`M${x} 400 H${x + 190} V440 H${x} Z`) + `<circle cx="${x + 30}" cy="455" r="15" fill="none" stroke="${C.cream}" stroke-width="7"/><circle cx="${x + 160}" cy="455" r="15" fill="none" stroke="${C.cream}" stroke-width="7"/>` +
    L(`M${x - 10} 330 H${x + 200} L${x + 180} 300 H${x + 10} Z`, C.orange, 7) + L(`M${x + 10} 400 q22 -26 44 0 q22 -26 44 0 q22 -26 44 0 q22 -26 44 0`);
  const tree = (x, c = C.green) => L(`M${x} 470 V330`, C.cream, 8) + `<ellipse cx="${x}" cy="300" rx="70" ry="52" fill="none" stroke="${c}" stroke-width="7"/>` +
    `<ellipse cx="${x}" cy="468" rx="74" ry="8" fill="${c}" opacity=".25"/>`;
  const bench = x => L(`M${x - 30} 440 H${x + 30} M${x - 24} 440 V470 M${x + 24} 440 V470`);
  const thermo = (x, lvl, c) => L(`M${x - 18} 380 V140 a18 18 0 0 1 36 0 V380`, C.cream, 6) + `<circle cx="${x}" cy="410" r="34" fill="${c}"/>` +
    `<rect x="${x - 8}" y="${(380 - 230 * lvl).toFixed(1)}" width="16" height="${(230 * lvl + 10).toFixed(1)}" fill="${c}"/>`;
  const paper = (x, y, w, h, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${C.cream}"/>` +
    [0, 1, 2, 3].map(i => `<rect x="${x + 22}" y="${y + 30 + i * 30}" width="${w - 44 - (i % 2) * 40}" height="8" rx="4" fill="${C.dim}"/>`).join("") + extra;
  const house = (x, glow) => L(`M${x} 470 V360 H${x + 120} V470 M${x - 12} 364 L${x + 60} 312 L${x + 132} 364`) + L(`M${x + 44} 470 V420 H${x + 76} V470`) +
    (glow > 0 ? `<rect x="${x + 6}" y="366" width="108" height="102" fill="${C.orange}" opacity="${(.45 * glow).toFixed(2)}"/>` : "");
  const centre = (x, label, open) => L(`M${x} 470 V250 H${x + 230} V470`) + L(`M${x - 14} 254 H${x + 244}`, C.cream, 8) +
    `<rect x="${x + 20}" y="268" width="190" height="44" rx="8" fill="${C.cream}"/>` + txt(x + 115, 298, "COOLING CENTRE", 21, C.ink) +
    L(`M${x + 86} 470 V370 H${x + 144} V470`) + L(`M${x + 115} 330 v28 M${x + 101} 337 l28 14 M${x + 129} 337 l-28 14`, C.green, 5) +
    `<rect x="${x + 156}" y="390" width="62" height="28" rx="6" fill="${open ? C.green : C.dim}"/>` + txt(x + 187, 410, label, 15, C.ink);
  const arrowArc = (cx, cy, r, a0, a1, c, w = 8) => { const p = a => [cx + r * Math.cos(a), cy + r * Math.sin(a)], [x0, y0] = p(a0), [x1, y1] = p(a1), [hx, hy] = p(a1 - .12);
    const n = a1 + Math.PI / 2, tip = (k, s) => `${(x1 + k * 16 * Math.cos(n + s)).toFixed(1)} ${(y1 + k * 16 * Math.sin(n + s)).toFixed(1)}`;
    return L(`M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`, c, w) + L(`M${tip(1, 2.6)} L${x1.toFixed(1)} ${y1.toFixed(1)} L${tip(1, .55)}`, c, w); };
  const canopy = t => `<path d="M30 250 Q260 160 490 250 L490 268 Q260 182 30 268 Z" fill="${C.orange}"/>` +
    [90, 190, 330, 430].map((x, i) => L(`M${x} 262 V470`, C.cream, 6) + fig(x + (i < 2 ? 28 : -28), 470, .7, "down")).join("") + fig(260, 470, .55, "down");

  // the drawings, one per scene; t is seconds into the scene, b the beat times
  const ART = {
    bill: (t, b) => { const lvl = .92 - .5 * on(t, .2, 1.6), hot = 1 - on(t, .2, 1.6);
      const col = hot > .5 ? C.orange : C.cream;
      return thermo(130, lvl, col) + g(on(t, (b[1] || 1.4) - .2), paper(260, 150, 200, 260, `<circle cx="410" cy="380" r="40" fill="none" stroke="${C.orange}" stroke-width="7"/>` + coin(410, 380, 20)), `rotate(${(-4 + 2 * Math.sin(t)).toFixed(2)} 360 280)`) + ground; },
    why: t => sun(420, 90, 44, t) + g(1, ground + fig(150, 470, 1, "push") + cart(200)) + haze(250, 230, t) +
      g(on(t, .6), txt(150, 250, "?", 110, C.orange, "middle", 800)) + g(on(t, 1.2), tree(470) + bench(470)),
    week: (t, b) => [0, 1, 2, 3, 4, 5, 6].map(i => g(on(t, .15 + i * .18, .3), `<rect x="${32 + i * 66}" y="190" width="58" height="80" rx="8" fill="none" stroke="${C.cream}" stroke-width="5"/>` +
      `<circle cx="${61 + i * 66}" cy="232" r="16" fill="${C.orange}"/>`)).join("") + g(on(t, (b[1] || 2) - .2), coin(200, 380, 22) + coin(260, 380, 22, C.dim) + coin(320, 380, 22, C.dim) +
      txt(260, 450, "PAID BACK WHEN?", 26, C.cream)),
    vendor: (t, b) => { const lose = on(t, (b[1] || 2) - .1, .8);
      return sun(430, 80, 42, t) + ground + tree(70) + bench(70) + g(1, fig(190, 470, 1, "push") + cart(240)) + haze(300, 220, t) +
        [0, 1, 2].map(i => g(1 - lose, coin(300 + i * 44, 380 - 40 * lose - i * 10, 15))).join("") +
        g(on(t, .8), txt(70, 210, "REST?", 22, C.green)); },
    ill: (t, b) => { const drain = on(t, (b[1] || 2), 1.4);
      return sun(440, 70, 34, t) + ground + L("M60 470 H300", C.cream, 5) +
        `<circle cx="96" cy="430" r="20" fill="none" stroke="${C.cream}" stroke-width="7"/>` + L("M118 440 H260 M150 440 L170 470 M220 440 L240 470 M130 438 L150 410") +
        haze(140, 370, t) + g(on(t, (b[1] || 2) - .2), `<rect x="318" y="350" width="44" height="100" rx="8" fill="none" stroke="${C.cream}" stroke-width="6"/>` + L("M340 380 V420 M320 400 H360", C.orange, 6)) +
        L("M400 330 V460 H480 V330", C.cream, 6) + `<rect x="406" y="${(340 + 115 * drain).toFixed(1)}" width="68" height="${(115 * (1 - drain) + 4).toFixed(1)}" fill="${C.orange}"/>`; },
    loan: (t, b) => { const back = on(t, (b[1] || 2), .9), slip = on(t, .3, .8);
      return sun(430, 80, 42 + 12 * back, t) + ground + g(1 - back, fig(150, 470, 1, "down")) + g(back, fig(170, 470, 1, "push") + cart(220)) +
        g(slip * (1 - back), paper(250, 230 - 20 * (1 - slip), 170, 200, L("M276 400 H394", C.orange, 8)), `translate(${(60 * (1 - slip)).toFixed(1)} 0)`) +
        g(back, haze(290, 220, t) + txt(260, 160, "NEXT HOT DAY", 26, C.orange)); },
    cycle: (t, b) => { const help = on(t, (b[1] || 3) - .1, .7), spin = t * .5, cx = 260, cy = 260, r = 150;
      const nodes = [["HEAT", -Math.PI / 2], ["LOST INCOME", 0], ["DEBT", Math.PI / 2], ["NO REST", Math.PI]];
      const arcs = nodes.map((n, i) => g(on(t, .2 + i * .25) * (1 - .55 * help), arrowArc(cx, cy, r, n[1] + .42, n[1] + Math.PI / 2 - .42, C.orange))).join("");
      const pos = [[cx, cy - r - 22, "middle"], [cx + r + 16, cy + 9, "start"], [cx, cy + r + 44, "middle"], [cx - r - 16, cy + 9, "end"]];
      const labels = nodes.map((n, i) => g(on(t, .1 + i * .25), txt(pos[i][0], pos[i][1], n[0], 26, C.cream, pos[i][2]))).join("");
      const helps = [["SHADE", 0], ["PAID REST", 1], ["INCOME", 2], ["SUPPORT", 3]].map(([s, i]) => g(on(t, (b[1] || 3) + .3 + Math.min(i, 2) * .35), txt(cx, cy - 46 + i * 34, s, 26, C.green))).join("");
      const cut = [Math.PI, 0].map((a, i) => g(on(t, (b[1] || 3) + .5 + i * .6), L(`M${(cx + r * Math.cos(a + .78) - 22).toFixed(0)} ${(cy + r * Math.sin(a + .78) - 22).toFixed(0)} l44 44`, C.green, 10))).join("");
      return `<g transform="rotate(${(Math.sin(spin) * 2).toFixed(2)} ${cx} ${cy})">${arcs}</g>${labels}${helps}${cut}`; },
    close: t => g(on(t, .1, .6), canopy(t)),
    centre: (t, b) => sun(450, 70, 34, t) + ground + centre(40, "OPEN", true) + g(on(t, .4), elder(420, 470, 1.05)) +
      g(on(t, (b[1] || 1.5) - .1), txt(430, 250, "?", 110, C.orange, "middle", 800)),
    night: (t, b) => { const n = on(t, (b[1] || 1.6) - .2, .8);
      return g(1 - n, sun(420, 80, 38, t)) + g(n, moon(430, 90)) + ground + centre(20, n > .5 ? "SHUT" : "OPEN", n <= .5) +
        house(330, n) + g(n, haze(360, 330, t)) + g(on(t, .3), elder(395, 470, .8)); },
    walk: (t, b) => { const p = on(t, .3, 2.6), stop = on(t, (b[1] || 1.5), .6), x = 400 - 170 * Math.min(p, .55);
      return sun(440, 70, 36, t) + ground + centre(10, "OPEN", true) + house(380, .25) +
        `<path d="M250 466 H380" stroke="${C.cream}" stroke-width="4" stroke-dasharray="4 14" stroke-linecap="round"/>` +
        elder(x, 470, .85) + g(stop, haze(x - 60, 300, t) + txt(x, 250, "TOO FAR", 24, C.orange)); },
    phone: (t, b) => { const sweep = (t * 120) % 520;
      return ground + [60, 145, 230].map((x, i) => fig(x, 470, .8, "phone") + g(on(t, .3 + i * .2), L(`M${x + 22} 330 q10 -10 0 -20 M${x + 32} 336 q16 -16 0 -32`, C.orange, 4))).join("") +
        house(380, 0) + elder(325, 470, .8) + g(on(t, .2) * (1 - on(t, (b[1] || 1.6) + 1.2)), `<rect x="${(sweep - 60).toFixed(0)}" y="150" width="120" height="50" rx="14" fill="${C.orange}"/>` + txt(sweep, 183, "ALERT", 22, C.ink)) +
        g(on(t, (b[1] || 1.6)), txt(330, 250, "NO PHONE", 22, C.orange)); },
    ride: (t, b) => { const drive = on(t, .2, 1.4), knock = on(t, (b[1] || 1.6) - .1), reach = on(t, (b[2] || 3) - .1, .9), vx = -160 + 340 * drive;
      return sun(450, 60, 30, t) + ground + centre(10, "OPEN", true) + house(330, .2 * (1 - reach)) +
        L(`M250 466 H${(250 + 120 * reach).toFixed(0)}`, C.green, 8) +
        g(knock, fig(460, 470, .75, "knock", C.green) + L("M420 330 q10 -8 0 -16 M432 334 q16 -12 0 -24", C.green, 4)) +
        g(1 - reach, `<g transform="translate(${vx.toFixed(1)} 0)">` + L("M0 470 V400 Q0 370 30 370 H120 Q150 370 150 400 V470", C.green, 7) +
          `<circle cx="34" cy="470" r="16" fill="${C.ink}" stroke="${C.green}" stroke-width="7"/><circle cx="116" cy="470" r="16" fill="${C.ink}" stroke="${C.green}" stroke-width="7"/></g>`) +
        elder(400 - 260 * reach, 470, .8); },
    ask: t => g(on(t, .1), txt(260, 300, "?", 220, C.orange, "middle", 800)) +
      g(on(t, .6), [0, 1, 2, 3].map(i => `<rect x="${110 + i * 80}" y="370" width="64" height="64" rx="12" fill="none" stroke="${i === 3 ? C.green : C.cream}" stroke-width="6"/>`).join("")),
  };

  const root = document.getElementById("art"), head = document.getElementById("head"), cap = document.getElementById("cap"), src = document.getElementById("src"), url = document.getElementById("url");
  let last = "";
  window.tick = ms => {
    const s = ms / 1000; let i = T.scenes.findIndex(x => s < x.start + x.dur); if (i < 0) i = T.scenes.length - 1;
    const sc = S[i], tm = T.scenes[i], t = s - tm.start, beats = tm.beats || [0];
    let k = 0; beats.forEach((bt, j) => { if (t >= bt - .15) k = j; });
    const fadeIn = on(t, 0, .3), fadeOut = i < S.length - 1 ? 1 - on(t, tm.dur - .3, .3) : 1, o = Math.min(fadeIn, fadeOut);
    root.innerHTML = g(o, (ART[sc.art] || (() => ""))(t, beats));
    const h = sc.head[Math.min(k, sc.head.length - 1)] || sc.head.filter(Boolean)[0] || "";
    const key = i + ":" + k;
    if (key !== last) {   // the words change only when the beat changes
      const lines = [...new Set(sc.head.slice(0, k + 1).filter(Boolean))];
      head.innerHTML = lines.map((l, j) => j > 0 && j === lines.length - 1 ? `<span class="hot">${esc(l)}</span>` : esc(l)).join("<br>");
      head.className = "head" + (sc.big ? " head--big" : "");
      url.className = "url" + ((sc.url || "").length > 20 ? " url--long" : "");
      const parts = tm.text ? sc.say.split("|").map(x => x.trim()) : [];
      cap.textContent = parts[k] || ""; src.textContent = sc.src || ""; url.textContent = sc.url || ""; last = key;
    }
    head.style.opacity = cap.style.opacity = src.style.opacity = url.style.opacity = o.toFixed(3);
  };
  window.tick(0);
})();
