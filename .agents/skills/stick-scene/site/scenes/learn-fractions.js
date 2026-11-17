// learn: fractions — slice a pizza into halves then quarters, eat one, 4/4 becomes 3/4
(function () {
  const SC = (window.SCENES = window.SCENES || {});
  const R = window.RIG;
  const { C, E, P, FS, mix, fig, inkFill, rr, ln, text, seg, breathe, pulse, lp, sparks, bubble, floatText, circle, strokePath, lerp, clamp, partial } = R;

  const FIGX = -46;
  const PZ = { x: FIGX + 12, y: -41, rx: 25, ry: 10.5 };
  const SLAB = { x0: FIGX - 40, x1: FIGX + 62, y: -32, h: 5 };
  const CARD = { x: FIGX + 112, y: -128, w: 44, h: 50 };
  const CRUST = '#e9bd7a', CRUST_DK = '#cf9a52', CHEESE = '#fcd34d', PEP = '#d9604a', PEP_INK = '#a8432f';
  const PEPS = [[-0.5, -0.35], [0.45, -0.4], [0.5, 0.35], [-0.42, 0.45], [-0.12, 0.62], [0.15, -0.1]];
  const SLICE_A0 = Math.PI / 2, SLICE_A1 = Math.PI;
  const WHEEL = 13, WHEEL_R = 5;

  const REST = P({ hF: [16, -74], hB: [-4, -62] });
  const CHIN = P({ hF: [10, -96], head: [7, -116], hB: [-4, -62] });

  function pizza(g, rx, ry, band) {
    if (band > 0) {
      g.beginPath();
      g.ellipse(0, band, rx, ry, 0, 0, Math.PI * 2);
      inkFill(g, CRUST_DK, 1.4);
      g.fillStyle = CRUST_DK;
      g.fillRect(-rx + 0.7, 0, rx * 2 - 1.4, band);
      ln(g, -rx, 0, -rx, band, 1.4);
      ln(g, rx, 0, rx, band, 1.4);
    }
    g.beginPath();
    g.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    inkFill(g, CRUST, 1.4);
    g.beginPath();
    g.ellipse(0, 0, rx - 3.6, ry - 2.6 * (ry / 10), 0, 0, Math.PI * 2);
    g.fillStyle = CHEESE;
    g.fill();
    for (const [u, v] of PEPS) {
      g.beginPath();
      g.ellipse(u * (rx - 5), v * (ry - 3), 2.8, 2.8 * Math.max(0.45, ry / rx), 0, 0, Math.PI * 2);
      inkFill(g, PEP, 0.9, PEP_INK);
    }
  }

  function wedgePath(g, rx, ry, a0, a1, bite) {
    g.beginPath();
    const n = 14;
    for (let i = 0; i <= n; i++) {
      const a = lerp(a0, a1, i / n);
      const px = Math.cos(a) * (rx + 2), py = Math.sin(a) * (ry + 2);
      if (i === 0) {
        g.moveTo(px, py);
      } else {
        g.lineTo(px, py);
      }
    }
    if (bite <= 0) {
      g.lineTo(0, 0);
      g.closePath();
      return;
    }
    const m = 3;
    for (let i = m; i >= 0; i--) {
      const a = lerp(a0, a1, i / m);
      const px = Math.cos(a) * rx * bite, py = Math.sin(a) * ry * bite;
      if (i === m) {
        g.lineTo(px, py);
        continue;
      }
      const am = lerp(a0, a1, (i + 0.5) / m);
      const d = bite - 0.16;
      g.quadraticCurveTo(Math.cos(am) * rx * d, Math.sin(am) * ry * d, px, py);
    }
    g.closePath();
  }

  function table(g) {
    ln(g, SLAB.x0 + 10, SLAB.y + SLAB.h, SLAB.x0 + 4, 0, 2.2);
    ln(g, SLAB.x1 - 10, SLAB.y + SLAB.h, SLAB.x1 - 4, 0, 2.2);
    rr(g, SLAB.x0, SLAB.y, SLAB.x1 - SLAB.x0, SLAB.h, 2);
    inkFill(g, C.wood, 1.5);
  }

  function plate(g) {
    g.beginPath();
    g.ellipse(PZ.x, PZ.y + 2, PZ.rx + 7, PZ.ry + 3.5, 0, 0, Math.PI * 2);
    inkFill(g, C.paper, 1.4);
  }

  function pizzaOnPlate(g, cut1, cut2, gone, back) {
    g.save();
    g.translate(PZ.x, PZ.y);
    if (gone <= 0 || back >= 1) {
      pizza(g, PZ.rx, PZ.ry, 3);
    } else {
      g.save();
      wedgePath(g, PZ.rx, PZ.ry + 3, SLICE_A1, SLICE_A0 + Math.PI * 2, 0);
      g.clip();
      pizza(g, PZ.rx, PZ.ry, 3);
      g.restore();
      if (back > 0) {
        g.save();
        g.globalAlpha *= back;
        wedgePath(g, PZ.rx, PZ.ry + 3, SLICE_A0, SLICE_A1, 0);
        g.clip();
        pizza(g, PZ.rx, PZ.ry, 3);
        g.restore();
      }
    }
    const lineA = 1 - back;
    if (lineA > 0) {
      g.save();
      g.globalAlpha *= lineA;
      g.beginPath();
      g.ellipse(0, 0, PZ.rx, PZ.ry, 0, 0, Math.PI * 2);
      g.clip();
      if (cut1 > 0) {
        strokePath(g, partial([[-PZ.rx, 0], [PZ.rx, 0]], cut1), 1.3, C.ink);
      }
      if (cut2 > 0) {
        strokePath(g, partial([[0, -PZ.ry], [0, PZ.ry]], cut2), 1.3, C.ink);
      }
      g.restore();
    }
    g.restore();
  }

  function heldSlice(g, tip, rot, morph, bite) {
    const ry = lerp(PZ.ry, PZ.rx * 0.92, morph);
    g.save();
    g.translate(tip[0], tip[1]);
    g.rotate(rot);
    wedgePath(g, PZ.rx, ry, SLICE_A0, SLICE_A1, bite);
    g.save();
    g.clip();
    pizza(g, PZ.rx, ry, 3 * (1 - morph));
    g.restore();
    g.lineWidth = 1.3;
    g.strokeStyle = C.ink;
    g.lineJoin = 'round';
    g.stroke();
    g.restore();
  }

  function cutter(g, hand, ang) {
    const ux = Math.cos(ang), uy = Math.sin(ang);
    ln(g, hand[0] - ux * 5, hand[1] - uy * 5, hand[0] + ux * (WHEEL - 3), hand[1] + uy * (WHEEL - 3), 3.6, C.ink);
    ln(g, hand[0] - ux * 4, hand[1] - uy * 4, hand[0] + ux * 4, hand[1] + uy * 4, 1.6, C.butterHi);
    circle(g, hand[0] + ux * WHEEL, hand[1] + uy * WHEEL, WHEEL_R);
    inkFill(g, C.steel, 1.4);
    circle(g, hand[0] + ux * WHEEL, hand[1] + uy * WHEEL, 1.1);
    g.fillStyle = C.ink;
    g.fill();
  }

  function card(g, val, pop) {
    ln(g, CARD.x - 12, CARD.y + CARD.h - 4, CARD.x - 18, 0, 2.2);
    ln(g, CARD.x + 12, CARD.y + CARD.h - 4, CARD.x + 18, 0, 2.2);
    ln(g, CARD.x - 15, -22, CARD.x + 15, -22, 1.4, '#bdbdbd');
    rr(g, CARD.x - CARD.w / 2, CARD.y, CARD.w, CARD.h, 5);
    inkFill(g, C.paper, 1.6);
    const z = 1 + Math.sin(Math.PI * pop) * 0.28;
    g.save();
    g.translate(CARD.x, CARD.y + CARD.h / 2);
    g.scale(z, z);
    const [cur, a] = val;
    g.globalAlpha *= a;
    if (cur === '1') {
      text(g, '1', 0, 6, 18, C.ink);
    } else {
      const [n, d] = cur.split('/');
      text(g, n, 0, -5, 15, n === d ? C.ink : C.amber);
      ln(g, -10, 0, 10, 0, 1.8, C.ink);
      text(g, d, 0, 17, 15, C.ink);
    }
    g.restore();
  }

  SC['learn-fractions'] = {
    dur: 8,
    width: 380,
    label: 'A stick figure cuts a pizza into halves, then quarters, and a card shows 4/4; it eats one slice, the card changes to 3/4, and it pats its belly.',
    draw(g, S) {
      const T = S.on ? S.u * this.dur : -1;
      const t = S.t;
      let pose = breathe(REST, t);
      let cut1 = 0, cut2 = 0, gone = 0, back = 0, val = ['1', 1], pop = 0, slice = null, inBack = false;
      let wheelAim = null, spin = 0, nomK = [0, 0, 0], crumbs = 0, yum = 0;
      let cutterAng = -Math.PI / 2 + 0.25;

      if (T < 0) {
        const tw = pulse(t, 6.2, 2.4, 1.1, 0.3);
        spin = E.soft(clamp((((t % 6.2) + 6.2) % 6.2 - 2.4) / 1.1, 0, 1)) * Math.PI * 2;
        pose = mix(pose, P({ hF: [18, -84], hB: [-4, -62], head: [4, -117] }), tw);
      } else {
        const c1 = seg(T, 0.5, 1.35), c2 = seg(T, 1.75, 2.35);
        const aimIn = E.soft(seg(T, 0.05, 0.5));
        const between = E.soft(seg(T, 1.35, 1.75));
        const aimOut = E.soft(seg(T, 2.35, 2.7));
        if (T < 1.35) {
          wheelAim = [lerp(PZ.x - PZ.rx - 2, PZ.x + PZ.rx + 1, E.sm(c1)), PZ.y - WHEEL_R + 1];
        } else if (T < 1.75) {
          wheelAim = R.arcPt([PZ.x + PZ.rx + 1, PZ.y - WHEEL_R + 1], [PZ.x + 1, PZ.y - PZ.ry - WHEEL_R + 1], 12, between);
        } else {
          wheelAim = [PZ.x + 1, lerp(PZ.y - PZ.ry, PZ.y + PZ.ry, E.sm(c2)) - WHEEL_R + 1];
        }
        const ang = T < 1.35 ? 1.15 : lerp(1.15, 1.45, between);
        const off = [Math.cos(ang) * WHEEL, Math.sin(ang) * WHEEL];
        const handAim = [wheelAim[0] - off[0], wheelAim[1] - off[1]];
        const cutW = aimIn * (1 - aimOut);
        const aimL = lp(handAim, FIGX, 0, 1);
        const lean = P({ hF: aimL, hB: [-4, -60], head: [10, -112], chest: [4, -88], ef: lerp(0.15, 1, E.sm(clamp((aimL[0] - 4) / 18, 0, 1))) });
        pose = mix(pose, lean, cutW);
        cutterAng = lerp(cutterAng, ang, cutW);
        cut1 = c1;
        cut2 = c2;
        if (T >= 1.4) {
          val = ['2/2', 1];
          pop = seg(T, 1.4, 1.75);
        }
        if (T >= 2.4) {
          val = ['4/4', 1];
          pop = seg(T, 2.4, 2.75);
        }

        const swap1 = E.soft(seg(T, 2.6, 2.9)) * (1 - E.soft(seg(T, 2.95, 3.2)));
        const swap2 = E.soft(seg(T, 6.35, 6.65)) * (1 - E.soft(seg(T, 6.7, 7.05)));
        const together = P({ hF: [16, -76], hB: [12, -76], head: [4, -116] });
        pose = mix(pose, together, Math.max(swap1, swap2));
        inBack = T >= 2.92 && T < 6.68;
        const holdB = E.soft(seg(T, 2.95, 3.25)) * (1 - E.soft(seg(T, 6.2, 6.45)));
        pose = mix(pose, P({ hB: [-6, -64] }, pose), holdB);

        const grab = E.soft(seg(T, 3.15, 3.5)) * (1 - E.soft(seg(T, 3.6, 3.95)));
        const sliceC = [PZ.x - 0.4 * PZ.rx, PZ.y + 0.35 * PZ.ry];
        pose = mix(pose, P({ hF: lp([sliceC[0] + 2, sliceC[1] - 3], FIGX, 0, 1), hB: pose.hB, head: [9, -111], chest: [3, -87] }), grab);
        const mouth = E.soft(seg(T, 3.6, 3.95)) * (1 - E.soft(seg(T, 5.0, 5.3)));
        const bob = Math.max(0, Math.sin(seg(T, 4.05, 5.0) * Math.PI * 3)) * 4;
        pose = mix(pose, P({ hF: [30, -92 + bob], hB: pose.hB, head: [6, -115] }), mouth);

        const pat = E.soft(seg(T, 5.25, 5.55)) * (1 - E.soft(seg(T, 6.1, 6.35)));
        const tap = Math.sin(T * 17) * 3 * seg(T, 5.45, 5.6) * (1 - seg(T, 5.9, 6.05));
        pose = mix(pose, P({ hF: [11 + tap, -68], hB: pose.hB, head: [1, -117], chest: [-2, -90] }), pat);
        yum = seg(T, 5.4, 5.6) * (1 - seg(T, 6.2, 6.4));

        gone = T >= 3.45 ? 1 : 0;
        back = seg(T, 7.45, 7.95);
        if (T >= 3.45 && T < 5.05) {
          const lift = E.soft(seg(T, 3.45, 3.95));
          const bites = [4.15, 4.5, 4.85].filter((b) => T >= b).length;
          slice = { lift, bite: bites === 0 ? 0 : 0.18 + bites * 0.26 };
          nomK = [4.15, 4.5, 4.85].map((b) => seg(T, b, b + 0.5));
          crumbs = seg(T, 4.15, 5.3);
        }
        if (T >= 5.05) {
          val = ['3/4', 1];
          pop = seg(T, 5.05, 5.4);
        }
        if (T >= 7.45) {
          const k = seg(T, 7.45, 7.95);
          val = k < 0.5 ? ['3/4', 1 - k * 2] : ['1', k * 2 - 1];
        }
        if (T >= 6.68) {
          cutterAng = -Math.PI / 2 + 0.25;
        }
        if (T >= 2.92 && T < 6.68) {
          cutterAng = -Math.PI / 2 - 0.15;
        }
      }

      const J = fig(g, pose, FIGX, 0, { wave: S.wave, wt: S.wt });
      table(g);
      plate(g);
      pizzaOnPlate(g, cut1, cut2, gone, back);
      const sh = J.w.sh, hand = J.w.handF, handB = J.w.handB;
      if (inBack) {
        strokePath(g, [sh, J.W(J.eB), handB], R.FS * 4.2, C.far);
        cutter(g, handB, cutterAng);
      }
      strokePath(g, [sh, J.w.eF, hand], FS * 4.2, C.ink);
      if (!inBack) {
        cutter(g, hand, cutterAng + spin);
      }
      sparks(g, CARD.x, CARD.y - 4, seg(T, 2.4, 2.95), 14, 5);
      if (slice) {
        const restTip = [PZ.x, PZ.y];
        const rot = -Math.PI / 2 * slice.lift;
        const r = PZ.rx * 0.95;
        const head = J.w.head;
        const heldTip = [head[0] + 9, head[1] + 3 + (hand[1] + 81) * 0.6];
        const tip = [lerp(restTip[0], heldTip[0], slice.lift), lerp(restTip[1], heldTip[1], slice.lift)];
        heldSlice(g, tip, rot, slice.lift, slice.bite);
      }
      for (let i = 0; i < 6; i++) {
        const k = clamp(crumbs * 1.6 - i * 0.12, 0, 1);
        if (k <= 0 || k >= 1) {
          continue;
        }
        const head = J.w.head;
        circle(g, head[0] + 5 + (i % 3) * 3, head[1] + 6 + k * (30 + i * 4), 1.1);
        g.fillStyle = CRUST_DK;
        g.fill();
      }
      nomK.forEach((k, i) => {
        floatText(g, 'nom', J.w.head[0] + 16 + i * 24, J.w.head[1] - 12 - (i % 2) * 10, k, C.umber, 9.5);
      });
      card(g, val, pop);
      sparks(g, CARD.x, CARD.y - 4, seg(T, 5.05, 5.6), 14, 5, C.amber);
      bubble(g, FIGX + 34, -122, 'yum!', yum, { tail: -24 });
    },
  };
})();
