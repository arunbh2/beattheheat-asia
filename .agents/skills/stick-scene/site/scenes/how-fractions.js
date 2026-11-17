// how-fractions: three ways to show 3/4 for a kids' maths page (pizza, jug, chocolate bar)
(function () {
  const SC = (window.SCENES = window.SCENES || {});
  const R = window.RIG;
  const { C, E, P, FS, mix, legs, walkSeg, fig, inkFill, rr, ln, text, seg, breathe, pulse, lp, sparks, circle, lerp, clamp, floatText, L2, star } = R;

  const TAU = Math.PI * 2;
  const REST = P({ hF: [12, -60], hB: [-4, -52] });

  // ---------------------------------------------------------------- shared
  const SIGN = { w: 80, h: 86, top: -160 };

  function valAt(T, init, evs) {
    let a = init, b = init, k = 1;
    for (const [at, v] of evs) {
      if (T >= at) {
        a = b;
        b = v;
        k = seg(T, at, at + 0.45);
      }
    }
    return { a, b, k };
  }

  function frac(g, v, size) {
    if (!v.includes('/')) {
      text(g, v, 0, size * 0.45, size * 1.3, C.ink);
      return;
    }
    const [n, d] = v.split('/');
    text(g, n, 0, -size * 0.2, size, C.ink);
    ln(g, -size * 0.5, 0, size * 0.5, 0, 2.4);
    text(g, d, 0, size * 0.92, size, C.ink);
  }

  // A sign on a post whose board flips over (top edge toward you) to show the next value.
  function sign(g, x, v, word, hi) {
    const bot = SIGN.top + SIGN.h;
    rr(g, x - 3.5, bot - 2, 7, -bot + 2, 2);
    inkFill(g, C.wood, 1.4);
    ln(g, x - 14, 0, x + 14, 0, 2.4);
    const cy = SIGN.top + SIGN.h / 2;
    const first = v.k < 0.5;
    const sy = first ? Math.max(0.04, Math.cos(Math.PI * v.k)) : Math.max(0.04, E.back((v.k - 0.5) / 0.5));
    g.save();
    g.translate(x, cy);
    g.scale(1, sy);
    rr(g, -SIGN.w / 2, -SIGN.h / 2, SIGN.w, SIGN.h, 8);
    inkFill(g, C.paper, 1.8);
    if (hi > 0 && !first) {
      g.save();
      g.globalAlpha *= hi;
      rr(g, -SIGN.w / 2 + 6, -SIGN.h / 2 + 6, SIGN.w - 12, SIGN.h - 12, 5);
      g.fillStyle = C.butter;
      g.fill();
      g.restore();
    }
    g.translate(0, -5);
    frac(g, first ? v.a : v.b, 24);
    if (word && hi > 0 && !first) {
      g.globalAlpha *= hi;
      text(g, word, 0, SIGN.h / 2 - 3, 11, C.umber);
    }
    g.restore();
  }

  function shoulderW(p, x) {
    const vx = p.chest[0] - p.hip[0], vy = p.chest[1] - p.hip[1];
    const sl = Math.hypot(vx, vy) || 1;
    return [x + (p.chest[0] - vx / sl) * FS, (p.chest[1] - vy / sl) * FS];
  }
  function mouthW(p, x) {
    const hx = p.head[0] - p.chest[0], hy = p.head[1] - p.chest[1];
    const hl = Math.hypot(hx, hy) || 1;
    return [x + (p.chest[0] + (hx / hl) * 20.5) * FS + 4, (p.chest[1] + (hy / hl) * 20.5) * FS + 2.5];
  }
  function bang(g, x, y, k) {
    if (k <= 0 || k >= 1) {
      return;
    }
    const z = E.back(clamp(k * 3, 0, 1));
    g.save();
    g.globalAlpha *= 1 - seg(k, 0.75, 1);
    g.translate(x, y);
    g.scale(z, z);
    text(g, '!', 0, 0, 17, C.ink);
    g.restore();
  }
  const SHRUG = P({ hF: [22, -82], hB: [6, -80], head: [2, -113], chest: [0, -91] });

  // ---------------------------------------------------------------- pizza
  const PZ = { x: -30, y: -78, r: 40 };
  const PFX = PZ.x - 66;
  const PSIGN = 112;
  const CRUST = '#e9bd7a', CHEESE = '#fcd34d', PEP = '#d9604a', PEP_INK = '#a8432f';
  const CUT_L = 52, WR = 7;
  const D45 = Math.SQRT1_2 * PZ.r;
  const A_S = [PZ.x - D45, PZ.y - D45], A_E = [PZ.x + D45, PZ.y + D45];
  const B_S = [PZ.x - D45, PZ.y + D45], B_E = [PZ.x + D45, PZ.y - D45];
  const WA0 = Math.PI * 0.75, WA1 = Math.PI * 1.25;
  const PEPS = [0, 1, 2, 3].flatMap((q) => [[q * Math.PI / 2, 0.6], [q * Math.PI / 2 + 0.42, 0.28]]);
  const LEAN = P({ hF: [12, -62], chest: [5, -88], head: [9, -112] });
  const FLOUR_DX = 12, FLOUR_Y = -112;
  const FLOUR_TH = -Math.PI / 2 + 0.45;
  const POINT = P({ hF: [40, -100], hB: [-4, -54], head: [9, -119], chest: [2, -91] });

  function pizzaFace(g, r) {
    circle(g, 0, 0, r);
    inkFill(g, CRUST, 1.7);
    circle(g, 0, 0, r - 5.5);
    g.fillStyle = CHEESE;
    g.fill();
    for (const [a, k] of PEPS) {
      circle(g, Math.cos(a) * r * k, Math.sin(a) * r * k, 4.6);
      inkFill(g, PEP, 1, PEP_INK);
    }
  }
  function wedge(g, r, a0, a1, b) {
    g.beginPath();
    g.arc(0, 0, r, a0, a1);
    if (b <= 0) {
      g.lineTo(0, 0);
      g.closePath();
      return;
    }
    const n = 3;
    g.lineTo(Math.cos(a1) * b, Math.sin(a1) * b);
    for (let i = n - 1; i >= 0; i--) {
      const a = lerp(a0, a1, i / n), am = lerp(a0, a1, (i + 0.5) / n);
      g.quadraticCurveTo(Math.cos(am) * (b + 6), Math.sin(am) * (b + 6), Math.cos(a) * b, Math.sin(a) * b);
    }
    g.closePath();
  }
  function cutLine(g, a, b, k, alpha) {
    if (k <= 0 || alpha <= 0) {
      return;
    }
    const e = L2(a, b, k);
    g.save();
    g.globalAlpha *= alpha;
    ln(g, a[0], a[1], e[0], e[1], 1.8, C.ink);
    g.restore();
  }
  function easel(g) {
    ln(g, PZ.x - 12, PZ.y + 20, PZ.x - 20, 0, 2.4);
    ln(g, PZ.x + 12, PZ.y + 20, PZ.x + 20, 0, 2.4);
    ln(g, PZ.x, PZ.y + 10, PZ.x + 4, 0, 2, C.far);
    circle(g, PZ.x, PZ.y, PZ.r + 6);
    inkFill(g, C.wood, 1.6);
    rr(g, PZ.x - 30, PZ.y + PZ.r + 4, 60, 6, 2);
    inkFill(g, C.woodDk, 1.4);
  }
  function pizza(g, cutA, cutB, open, lineA, ghost) {
    g.save();
    g.translate(PZ.x, PZ.y);
    if (open) {
      g.save();
      wedge(g, PZ.r + 2, WA1, WA0 + TAU, 0);
      g.clip();
      pizzaFace(g, PZ.r);
      g.restore();
    } else {
      pizzaFace(g, PZ.r);
    }
    if (ghost > 0) {
      g.save();
      g.globalAlpha *= ghost;
      g.setLineDash([3, 3.5]);
      wedge(g, PZ.r - 1, WA0, WA1, 0);
      g.lineWidth = 1.3;
      g.strokeStyle = C.muted;
      g.stroke();
      g.restore();
    }
    g.restore();
    g.save();
    if (open) {
      g.translate(PZ.x, PZ.y);
      wedge(g, PZ.r + 2, WA1, WA0 + TAU, 0);
      g.translate(-PZ.x, -PZ.y);
      g.clip();
    }
    cutLine(g, A_S, A_E, cutA, lineA);
    cutLine(g, B_S, B_E, cutB, lineA);
    g.restore();
  }
  function slice(g, tip, rot, b, alpha, edgeA) {
    if (alpha <= 0) {
      return;
    }
    g.save();
    g.globalAlpha *= alpha;
    g.translate(tip[0], tip[1]);
    g.rotate(rot);
    g.save();
    wedge(g, PZ.r + 0.5, WA0, WA1, b);
    g.clip();
    pizzaFace(g, PZ.r);
    g.restore();
    g.globalAlpha *= edgeA;
    wedge(g, PZ.r, WA0, WA1, b);
    g.lineWidth = 1.8;
    g.strokeStyle = C.ink;
    g.lineJoin = 'round';
    g.stroke();
    g.restore();
  }
  function cutter(g, hand, w, spin, butt) {
    const dx = w[0] - hand[0], dy = w[1] - hand[1], d = Math.hypot(dx, dy) || 1;
    const b0 = [hand[0] - (dx / d) * (butt || 0), hand[1] - (dy / d) * (butt || 0)];
    ln(g, b0[0], b0[1], w[0], w[1], 4.8, C.ink);
    ln(g, b0[0], b0[1], w[0], w[1], 2.4, C.wood);
    ln(g, hand[0] - (dx / d) * 4, hand[1] - (dy / d) * 4, hand[0] + (dx / d) * 9, hand[1] + (dy / d) * 9, 4.4, C.umber);
    circle(g, w[0], w[1], WR);
    inkFill(g, C.steel, 1.5);
    for (let i = 0; i < 2; i++) {
      const a = spin + i * Math.PI / 2;
      ln(g, w[0] - Math.cos(a) * (WR - 2), w[1] - Math.sin(a) * (WR - 2), w[0] + Math.cos(a) * (WR - 2), w[1] + Math.sin(a) * (WR - 2), 1, C.muted);
    }
    circle(g, w[0], w[1], 1.4);
    g.fillStyle = C.ink;
    g.fill();
  }
  // The back hand holds the end of the handle, in front of the shoulder and a little below the line to the wheel.
  function grip(Sh, W, side) {
    const dx = W[0] - Sh[0], dy = W[1] - Sh[1];
    const d = Math.hypot(dx, dy) || 1;
    const a = clamp(Math.max(36 - (d - 40) * 0.5, 26, d - CUT_L + 1.5), 0, 36.8);
    const x = (a * a - CUT_L * CUT_L + d * d) / (2 * d);
    const h = Math.sqrt(Math.max(0, a * a - x * x));
    const phi = Math.atan2(dy, dx) + Math.atan2(h, x) * side;
    return { H: [Sh[0] + Math.cos(phi) * a, Sh[1] + Math.sin(phi) * a], b: 0 };
  }
  // Same as the runtime's relax(): a low resting hand hangs from a nearly straight arm (local pose space).
  function relaxL(p, t) {
    const vx = p.chest[0] - p.hip[0], vy = p.chest[1] - p.hip[1];
    const sl = Math.hypot(vx, vy) || 1;
    const sh = [p.chest[0] - vx / sl, p.chest[1] - vy / sl];
    const dx = t[0] - sh[0], dy = t[1] - sh[1];
    const d = Math.hypot(dx, dy);
    const want = 42 * 0.96;
    if (dy <= 0 || d < 1 || d >= want) {
      return t;
    }
    const w = E.sm(clamp((dy / d - 0.8) / 0.18, 0, 1));
    return [sh[0] + (dx / d) * lerp(d, want, w), sh[1] + (dy / d) * lerp(d, want, w)];
  }
  function polar(Sh, a, b, k) {
    const ra = Math.hypot(a[0] - Sh[0], a[1] - Sh[1]), rb = Math.hypot(b[0] - Sh[0], b[1] - Sh[1]);
    const ta = Math.atan2(a[1] - Sh[1], a[0] - Sh[0]);
    let tb = Math.atan2(b[1] - Sh[1], b[0] - Sh[0]);
    while (tb - ta > Math.PI) {
      tb -= TAU;
    }
    while (tb - ta < -Math.PI) {
      tb += TAU;
    }
    const r = lerp(ra, rb, k), th = lerp(ta, tb, k);
    return [Sh[0] + Math.cos(th) * r, Sh[1] + Math.sin(th) * r];
  }
  const ang = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]);
  const fromAng = (h, th) => [h[0] + Math.cos(th) * CUT_L, h[1] + Math.sin(th) * CUT_L];
  function caneAt(h) {
    return Math.asin(clamp((-WR - h[1]) / CUT_L, -1, 1));
  }
  function eyes(g, head, k, look) {
    if (k <= 0) {
      return;
    }
    g.save();
    g.globalAlpha *= k;
    for (const dx of [-2.6, 2.6]) {
      circle(g, head[0] + dx + look, head[1] - 0.8, 1.7);
      g.fillStyle = C.paper;
      g.fill();
    }
    g.restore();
  }
  function sweat(g, x, y, k) {
    if (k <= 0) {
      return;
    }
    g.save();
    g.globalAlpha *= Math.min(1, k * 3) * (1 - seg(k, 0.8, 1));
    g.translate(x, y + k * 5);
    g.beginPath();
    g.moveTo(0, -5);
    g.quadraticCurveTo(3.4, 0, 0, 2.6);
    g.quadraticCurveTo(-3.4, 0, 0, -5);
    inkFill(g, C.paper, 1.2);
    g.restore();
  }

  SC['how-fractions-pizza'] = {
    dur: 6.8,
    width: 460,
    label: 'A stick figure slices a pizza into quarters with a giant cutter and a twirl, sneaks one slice with a guilty look, then proudly points as the sign flips to three quarters left.',
    draw(g, S) {
      const T = S.on ? S.u * this.dur : -1;
      const t = S.t;
      let pose = breathe(REST, t);
      let cutA = 0, cutB = 0, lineA = 1, open = false, ghost = 0, back = 0, spin = 0;
      let tool = null, sl = null, val = { a: '1', b: '1', k: 1 }, hi = 0, glance = 0, sweatK = 0, glint = 0;
      const noms = [];
      let x = PFX, gait = { ph: 0, amp: 0 };
      if (T < 0) {
        const rub = Math.sin(t * 9) * 2.5;
        pose = mix(pose, P({ hF: [9 + rub, -70], hB: [-4, -52], head: [3, -117] }), pulse(t, 6.5, 2.5, 1.9));
      } else {
        back = seg(T, 6.3, 6.8);
        lineA = 1 - back;
        cutA = E.sm(seg(T, 0.45, 1.1));
        cutB = E.sm(seg(T, 1.42, 2.05));
        spin = (cutA + cutB) * 11 + seg(T, 1.1, 1.42) * 6 + E.out3(seg(T, 2.3, 2.9)) * 26;
        glint = seg(T, 2.35, 2.95);

        const grab = E.soft(seg(T, 3.05, 3.3));
        const lift = E.soft(seg(T, 3.55, 3.9));
        const hold = grab * (1 - E.soft(seg(T, 4.45, 4.75)));
        const bite = T < 3.95 ? 0 : T < 4.15 ? lerp(0, 12, seg(T, 3.95, 4.03)) : T < 4.35 ? lerp(12, 22, seg(T, 4.15, 4.23)) : lerp(22, 30, seg(T, 4.35, 4.43));
        const M = mouthW(P({ head: [6, -115] }), PFX);
        const dirC = [0.482, 0.876];
        const rot1 = Math.atan2(dirC[1], dirC[0]) - Math.PI;
        const tip0 = [PZ.x, PZ.y], tip1 = [M[0] - dirC[0] * bite, M[1] - dirC[1] * bite];
        const tip = L2(tip0, tip1, lift), rot = lerp(0, rot1, lift);
        const handAt = [tip[0] + Math.cos(Math.PI + rot) * (PZ.r - 4), tip[1] + Math.sin(Math.PI + rot) * (PZ.r - 4)];
        pose = mix(pose, P({ hF: lp(handAt, PFX, 0, 1), head: [6, -115] }, pose), hold);
        glance = E.soft(seg(T, 3.25, 3.45)) * (1 - E.soft(seg(T, 3.75, 3.95)));
        pose = mix(pose, P({ head: [-3, -116] }, pose), glance);
        sweatK = seg(T, 3.35, 4.0);
        const pt = E.back(seg(T, 4.75, 5.05)) * (1 - E.soft(seg(T, 5.9, 6.25)));
        pose = mix(pose, P({ hF: POINT.hF, head: POINT.head, chest: POINT.chest }, pose), pt);

        if (T >= 3.05 && T < 4.6) {
          open = true;
          sl = { tip, rot, b: bite, alpha: 1 - seg(T, 4.45, 4.55), edgeA: 1 };
          ghost = seg(T, 3.6, 3.9);
        } else if (T >= 4.6) {
          open = back < 1;
          ghost = 1 - back;
          sl = { tip: tip0, rot: 0, b: 0, alpha: back, edgeA: 1 - back };
        }
        [3.95, 4.15, 4.35].forEach((b) => noms.push(seg(T, b, b + 0.5)));

        const ws = T < 1.2 ? walkSeg(T, 0.05, 0.4, PFX, PFX + 10) : walkSeg(T, 2.1, 2.5, PFX + 10, PFX);
        x = ws.x;
        gait = T < 1.2 ? ws : { ph: -ws.ph, amp: ws.amp, stride: ws.stride };
        if (T >= 0.05 && T < 3.1) {
          let W = null;
          if (T >= 0.45 && T < 2.05) {
            if (T < 1.1) {
              W = L2(A_S, A_E, cutA);
            } else if (T < 1.42) {
              W = R.arcPt(A_E, B_S, -16, E.soft(seg(T, 1.1, 1.42)));
            } else {
              W = L2(B_S, B_E, cutB);
            }
          }
          const base = shoulderW(pose, x);
          let leanK;
          if (W) {
            leanK = E.sm(clamp((Math.hypot(W[0] - base[0], W[1] - base[1]) - 62) / 24, 0, 1));
          } else if (T < 0.45) {
            leanK = 0;
          } else {
            leanK = 1 - E.soft(seg(T, 2.05, 2.4));
          }
          pose = mix(pose, P({ chest: LEAN.chest, head: LEAN.head, hF: [18, -66] }, pose), leanK);
          const Sh = shoulderW(pose, x);
          const restL = relaxL(pose, pose.hB);
          const restH = [x + restL[0] * FS, restL[1] * FS];
          const FLOUR_H = [x + FLOUR_DX, FLOUR_Y];
          let H, th, b = 0;
          const side = T < 1.1 ? 1 - 2 * E.soft(seg(cutA, 0.2, 0.8)) : T < 1.42 ? -1 : -1 + 2 * E.soft(seg(cutB, 0.2, 0.8));
          if (W) {
            const gp = grip(Sh, W, side);
            H = gp.H;
            b = gp.b;
            th = ang(H, W);
          } else if (T < 0.45) {
            const k = E.soft(seg(T, 0.05, 0.45));
            const gA = grip(Sh, A_S, 1);
            H = polar(Sh, restH, gA.H, k);
            th = lerp(caneAt(restH), ang(gA.H, A_S), k);
          } else if (T < 2.75) {
            const k = E.soft(seg(T, 2.05, 2.4));
            const gB = grip(Sh, B_E, 1);
            H = L2(gB.H, FLOUR_H, k);
            const tw = Math.sin(seg(T, 2.4, 2.75) * Math.PI * 2) * 0.22;
            th = lerp(ang(gB.H, B_E), FLOUR_TH, k) + tw;
          } else {
            const k = E.soft(seg(T, 2.75, 3.1));
            H = polar(Sh, FLOUR_H, restH, k);
            th = lerp(FLOUR_TH, caneAt(restH), k);
          }
          if (!W) {
            W = [H[0] + Math.cos(th) * (CUT_L - b), H[1] + Math.sin(th) * (CUT_L - b)];
          }
          pose = Object.assign({}, pose, { hB: lp(H, x, 0, 1) });
          tool = { W, th, b };
        }
        val = valAt(T, '1', [[2.15, '4/4'], [4.85, '3/4'], [6.3, '1']]);
        hi = E.soft(seg(T, 5.07, 5.3)) * (1 - seg(T, 6.3, 6.52));
      }
      pose = legs(pose, gait.ph, gait.amp, { arms: false, stride: gait.stride });

      sign(g, PSIGN, val, 'left', hi);
      easel(g);
      pizza(g, cutA, cutB, open, lineA, ghost);
      let wheel = null;
      const J = fig(g, pose, x, 0, {
        wave: S.wave,
        wt: S.wt,
        behind: (gg, JJ) =>
          R.held(gg, JJ, (hF, hB) => {
            const th = tool ? tool.th : caneAt(hB);
            const W = tool ? tool.W : fromAng(hB, th);
            wheel = W;
            cutter(gg, hB, W, spin, tool ? tool.b : 0);
            if (sl) {
              slice(gg, sl.tip, sl.rot, sl.b, sl.alpha, sl.edgeA);
            }
          }),
      });
      eyes(g, J.w.head, glance, -0.6);
      sweat(g, J.w.head[0] - 10, J.w.head[1] - 6, sweatK);
      if (glint > 0 && glint < 1 && wheel) {
        g.save();
        g.globalAlpha *= Math.sin(Math.PI * glint);
        g.translate(wheel[0] + 9, wheel[1] - 6);
        g.rotate(glint * 2);
        star(g, 0, 0, 6 * E.back(clamp(glint * 2, 0, 1)), 4, 0.35);
        inkFill(g, C.butter, 1.1);
        g.restore();
      }
      noms.forEach((k, i) => floatText(g, 'nom', J.w.head[0] + 18 + i * 10, J.w.head[1] - 14 - (i % 2) * 8, k, C.umber, 10));
      sparks(g, PSIGN, SIGN.top - 6, seg(T, 5.05, 5.65), 16, 6, C.amber);
    },
  };

  // ---------------------------------------------------------------- jug
  const TOP = -34;
  const CUPS = [-30, 16, 62, 108];
  const CUP = { w: 30, h: 34 };
  const JX = (i) => CUPS[i] - 66;
  const JHOME = -128;
  const LEMON = C.butterHi, LEMON_DK = '#e2b432';
  const POUR = P({ hF: [28.4, -109.8], hB: [-4, -54], head: [8, -114], chest: [2, -90] });
  const PT = [0.4, 1.47, 2.54];
  const TAG = { x: CUPS[1], y: -140, w: 60, h: 50 };

  function table(g) {
    ln(g, CUPS[0] - 22, TOP + 5, CUPS[0] - 28, 0, 2.4);
    ln(g, CUPS[3] + 22, TOP + 5, CUPS[3] + 28, 0, 2.4);
    rr(g, CUPS[0] - 30, TOP, CUPS[3] - CUPS[0] + 60, 6, 2);
    inkFill(g, C.wood, 1.6);
  }
  function cup(g, x, lev) {
    const h = CUP.h, wt = CUP.w / 2, wb = CUP.w / 2 - 3;
    const path = () => R.poly(g, [[x - wt, TOP - h], [x + wt, TOP - h], [x + wb, TOP], [x - wb, TOP]], true);
    path();
    g.fillStyle = C.paper;
    g.fill();
    if (lev > 0) {
      g.save();
      path();
      g.clip();
      const sy = TOP - h * lev;
      g.fillStyle = LEMON;
      g.fillRect(x - wt - 2, sy, CUP.w + 4, h * lev + 2);
      ln(g, x - wt, sy, x + wt, sy, 1.2, LEMON_DK);
      g.restore();
    }
    path();
    inkFill(g, null, 1.8);
    ln(g, x - wt + 5, TOP - h + 6, x - wb + 4, TOP - 6, 1.4, '#e8e8e8');
  }
  function jugBody(g) {
    g.beginPath();
    g.moveTo(7, -16);
    g.lineTo(31, -16);
    g.lineTo(38, -21);
    g.lineTo(34, -11);
    g.lineTo(33, 16);
    g.quadraticCurveTo(33, 19, 30, 19);
    g.lineTo(10, 19);
    g.quadraticCurveTo(7, 19, 7, 16);
    g.closePath();
  }
  const SPOUT = [38, -21];
  const spoutAt = (h, a) => [h[0] + SPOUT[0] * Math.cos(a) - SPOUT[1] * Math.sin(a), h[1] + SPOUT[0] * Math.sin(a) + SPOUT[1] * Math.cos(a)];
  function jug(g, h, a, lev, sx) {
    g.save();
    g.translate(h[0], h[1]);
    g.scale(sx, 1);
    g.rotate(a);
    jugBody(g);
    g.fillStyle = '#fbfbfb';
    g.fill();
    if (lev > 0.002) {
      g.save();
      jugBody(g);
      g.clip();
      const q = [20, 19 - 34 * lev];
      const qy = q[0] * Math.sin(a) + q[1] * Math.cos(a);
      g.rotate(-a);
      g.fillStyle = LEMON;
      g.fillRect(-60, qy, 120, 90);
      ln(g, -60, qy, 60, qy, 1.2, LEMON_DK);
      g.restore();
    }
    jugBody(g);
    inkFill(g, null, 1.8);
    g.beginPath();
    g.arc(8, 0, 8, Math.PI * 0.5, Math.PI * 1.5);
    g.lineWidth = 3.4;
    g.strokeStyle = C.ink;
    g.stroke();
    g.restore();
  }
  function stream(g, a, b, w) {
    if (w <= 0.05) {
      return;
    }
    const pts = [a, [a[0] + 3, a[1] + 5], b];
    R.strokePath(g, pts, 2.6 + 2.2 * w, C.ink);
    R.strokePath(g, pts, 0.4 + 2.2 * w, LEMON);
  }
  function brace(g, k, alpha) {
    if (k <= 0 || alpha <= 0) {
      return;
    }
    const y = TOP - CUP.h - 8, x0 = CUPS[0] - 15, x2 = CUPS[2] + 15;
    const pts = [[x0, y + 4], [x0, y - 3], [TAG.x - 6, y - 3], [TAG.x, y - 9], [TAG.x + 6, y - 3], [x2, y - 3], [x2, y + 4]];
    g.save();
    g.globalAlpha *= alpha;
    R.strokePath(g, R.partial(pts, k), 2, C.ink);
    g.restore();
  }
  function tag(g, k, alpha) {
    if (k <= 0 || alpha <= 0) {
      return;
    }
    const z = E.back(k);
    const y0 = TOP - CUP.h - 17;
    g.save();
    g.globalAlpha *= alpha;
    ln(g, TAG.x, y0, TAG.x, lerp(y0, TAG.y + TAG.h / 2, z), 1.4, C.ink);
    g.translate(TAG.x, lerp(y0, TAG.y, z));
    g.scale(z, z);
    g.rotate(Math.sin(k * 9) * 0.06 * (1 - k));
    rr(g, -TAG.w / 2, -TAG.h / 2, TAG.w, TAG.h, 7);
    inkFill(g, C.butter, 1.8);
    g.translate(0, -6);
    frac(g, '3/4', 17);
    text(g, 'full', 0, TAG.h / 2 + 1, 9.5, C.umber);
    g.restore();
  }

  SC['how-fractions-jug'] = {
    dur: 6.9,
    width: 460,
    label: 'A stick figure pours lemonade into four cups; the jug runs dry over the last one with a sad drip, it shrugs, then realises three of four are full as a 3/4 tag pops up.',
    draw(g, S) {
      const T = S.on ? S.u * this.dur : -1;
      const t = S.t;
      let pose = breathe(REST, t);
      let x = JHOME, gait = { ph: 0, amp: 0 }, sx = 1, tilt = 0, jl = 1;
      const lc = [0, 0, 0, 0];
      let flow = null, drip = 0, braceK = 0, tagK = 0, alphaR = 1, bangK = 0;
      if (T < 0) {
        const sw = pulse(t, 6.2, 2.2, 1.8);
        tilt = Math.sin(t * 6) * 0.08 * sw;
        pose = mix(pose, P({ hF: [14, -66], hB: [-4, -52], head: [7, -114] }), sw);
      } else {
        const fade = 1 - seg(T, 6.4, 6.9);
        alphaR = fade;
        const up = E.soft(seg(T, 0, 0.4)) * (1 - E.soft(seg(T, 4.3, 4.6)));
        pose = mix(pose, P(POUR, pose), up);
        const segs = [
          walkSeg(T, 0, 0.4, JHOME, JX(0)),
          walkSeg(T, 1.05, 1.47, JX(0), JX(1)),
          walkSeg(T, 2.12, 2.54, JX(1), JX(2)),
          walkSeg(T, 3.19, 3.61, JX(2), JX(3)),
          walkSeg(T, 5.4, 6.85, JX(3), JHOME),
        ];
        const ws = T < 0.75 ? segs[0] : T < 2.0 ? segs[1] : T < 3.1 ? segs[2] : T < 5.3 ? segs[3] : segs[4];
        x = ws.x;
        gait = ws;
        sx = T >= 5.4 && T < 6.85 ? -1 : 1;
        let poured = 0;
        PT.forEach((p0, i) => {
          const tk = E.soft(seg(T, p0, p0 + 0.17)) * (1 - E.soft(seg(T, p0 + 0.5, p0 + 0.65)));
          tilt = Math.max(tilt, tk * 1.0);
          const fk = seg(T, p0 + 0.17, p0 + 0.5);
          lc[i] = 0.8 * E.soft(fk) * fade;
          poured += fk;
          if (fk > 0 && fk < 1) {
            flow = { i, w: Math.min(1, fk * 6, (1 - fk) * 6) };
          }
        });
        const t4 = E.soft(seg(T, 3.61, 3.85)) * (1 - E.soft(seg(T, 4.2, 4.4)));
        const shake = Math.sin(T * 38) * 0.09 * seg(T, 3.85, 3.92) * (1 - seg(T, 4.08, 4.15));
        tilt = Math.max(tilt, t4 * 1.4) + shake;
        drip = seg(T, 4.0, 4.35);
        lc[3] = 0.05 * seg(T, 4.33, 4.4) * fade;
        jl = Math.max(1 - poured / 3, 1 - fade);
        pose = mix(pose, P({ head: [12, -111] }, pose), E.soft(seg(T, 3.8, 4.0)) * (1 - E.soft(seg(T, 4.35, 4.55))));
        const shrug = E.soft(seg(T, 4.45, 4.75)) * (1 - E.soft(seg(T, 5.0, 5.3)));
        pose = mix(pose, P({ hF: SHRUG.hF, hB: SHRUG.hB, head: SHRUG.head, chest: SHRUG.chest }, pose), shrug);
        const ah = E.soft(seg(T, 4.95, 5.2)) * (1 - E.soft(seg(T, 5.5, 5.8)));
        pose = mix(pose, P({ head: [3, -119], chest: [-1, -91] }, pose), ah);
        bangK = seg(T, 4.95, 5.6);
        braceK = E.soft(seg(T, 5.05, 5.35));
        tagK = seg(T, 5.2, 5.6);
      }
      pose = legs(pose, gait.ph, gait.amp, { arms: false, stride: gait.stride });

      let hand = null;
      const J = fig(g, pose, x, 0, {
        sx,
        wave: S.wave,
        wt: S.wt,
        held: (gg, JJ) =>
          R.held(gg, JJ, (hF) => {
            hand = hF;
            jug(gg, hF, tilt, jl, sx);
          }),
      });
      table(g);
      CUPS.forEach((cx, i) => cup(g, cx, lc[i]));
      brace(g, braceK, alphaR);
      tag(g, tagK, alphaR);
      if (flow && hand) {
        const sp = spoutAt(hand, tilt);
        stream(g, sp, [CUPS[flow.i], TOP - CUP.h * lc[flow.i]], flow.w);
      }
      if (drip > 0 && drip < 1 && hand) {
        const sp = spoutAt(hand, tilt);
        const k = E.in(drip);
        g.beginPath();
        g.ellipse(lerp(sp[0], CUPS[3] + 2, drip), lerp(sp[1] + 3, TOP - 3, k), 2, 2.8 + k, 0, 0, TAU);
        inkFill(g, LEMON, 1);
      }
      sparks(g, CUPS[3] + 2, TOP - 5, seg(T, 4.33, 4.6), 6, 3, C.muted);
      bang(g, J.w.head[0] + 14, J.w.head[1] - 12, bangK);
      sparks(g, TAG.x, TAG.y - TAG.h / 2 - 4, seg(T, 5.35, 5.95), 14, 6, C.amber);
    },
  };

  // ---------------------------------------------------------------- chocolate bar
  const CT = { x0: -94, x1: 92, y: -32 };
  const PW = 34, PH = 24;
  const BAR_L = -88;
  const BFX = -104;
  const CHOP_P = [BAR_L + 14, CT.y - PH - 2];
  const BSIGN = -172;
  const CHOC = '#7b4a2e', CHOC_HI = '#94603f', CHOC_DK = '#4a2a17';
  const restL = (i) => BAR_L + i * PW;
  const spreadC = (i) => BAR_L + PW / 2 + i * 44;
  const GIVE = 3;
  const BREST = P({ hF: [14, -66], hB: [-2, -62] });
  const RUB = (t) => P({ hF: [17 + Math.sin(t * 14) * 2.2, -77], hB: [12 - Math.sin(t * 14) * 2.2, -76], head: [5, -116] });
  const RAISE = P({ hF: [10, -136], hB: [-6, -60], head: [3, -118], chest: [-2, -90] });
  const STARTLE = P({ hF: [18, -118], hB: [6, -118], head: [-4, -117], chest: [-3, -90] });
  const BIRD_A = [250, -150], BIRD_C1 = [130, -150], BIRD_G = [spreadC(GIVE), -60], BIRD_C2 = [110, -60], BIRD_E = [262, -178];
  const CRUMBS = Array.from({ length: 9 }, (_, i) => ({
    x: restL(1 + (i % 3)) + (R.hash(i) - 0.5) * 8,
    vx: (R.hash(i + 7) - 0.5) * 90,
    vy: -60 - R.hash(i + 3) * 50,
  }));

  const bez = (a, c, b, k) => [lerp(lerp(a[0], c[0], k), lerp(c[0], b[0], k), k), lerp(lerp(a[1], c[1], k), lerp(c[1], b[1], k), k)];

  function counter(g) {
    rr(g, CT.x0, CT.y, CT.x1 - CT.x0, -CT.y + 1, 3);
    inkFill(g, C.wood, 1.7);
    ln(g, CT.x0, CT.y + 6, CT.x1, CT.y + 6, 1.4);
    for (let i = 1; i < 4; i++) {
      const xx = lerp(CT.x0, CT.x1, i / 4);
      ln(g, xx, CT.y + 11, xx, -5, 1.2, C.woodDk);
    }
  }
  function piece(g, cx, cy, rot, alpha) {
    if (alpha <= 0) {
      return;
    }
    g.save();
    g.globalAlpha *= alpha;
    g.translate(cx, cy);
    g.rotate(rot);
    rr(g, -PW / 2, -PH / 2, PW, PH, 3);
    inkFill(g, CHOC, 1.6);
    rr(g, -PW / 2 + 5, -PH / 2 + 5, PW - 10, PH - 10, 2);
    g.fillStyle = CHOC_HI;
    g.fill();
    g.lineWidth = 1.1;
    g.strokeStyle = CHOC_DK;
    g.stroke();
    g.restore();
  }
  function bird(g, x, y, dir, flap, grip) {
    g.save();
    g.translate(x, y);
    g.scale(dir * 1.25, 1.25);
    ln(g, -1, 4, -2, 9 + grip * 2, 1.3, C.ink);
    ln(g, 3, 4, 3, 9 + grip * 2, 1.3, C.ink);
    R.poly(g, [[-7, -1], [-15, -5], [-14, 2]], true);
    inkFill(g, C.ink, 1);
    g.beginPath();
    g.ellipse(0, 0, 9, 6, 0, 0, TAU);
    g.fillStyle = C.ink;
    g.fill();
    circle(g, 8, -5, 4.6);
    g.fill();
    R.poly(g, [[11.5, -6.5], [17, -4.5], [11.5, -3]], true);
    inkFill(g, C.butterHi, 0.9);
    circle(g, 9.3, -6, 1.3);
    g.fillStyle = C.paper;
    g.fill();
    const w = Math.sin(flap);
    R.poly(g, [[-4, -2], [4, -2], [-3 + w * 2, -2 - 13 * w]], true);
    inkFill(g, '#3a3a3a', 1.2);
    g.restore();
  }

  SC['how-fractions-bar'] = {
    dur: 6.0,
    width: 460,
    label: 'A stick figure karate-chops a chocolate bar into four pieces with a crack and crumbs; a bird swoops in and steals one, and the sign flips to three quarters left.',
    draw(g, S) {
      const T = S.on ? S.u * this.dur : -1;
      const t = S.t;
      let pose = breathe(BREST, t);
      let split = 0, hop = 0, val = { a: '1', b: '1', k: 1 }, hi = 0, give = 1, snapK = 0, crackK = 0, crumbA = 0, bangK = 0;
      let bd = null;
      if (T < 0) {
        pose = mix(pose, RUB(t), pulse(t, 6, 2, 1.8));
      } else {
        const back = E.soft(seg(T, 5.45, 5.95));
        const raise = E.soft(seg(T, 0.12, 0.42)) * (1 - E.soft(seg(T, 0.88, 1.18)));
        const slam = E.soft(seg(T, 0.42, 0.7)) * (1 - E.soft(seg(T, 0.88, 1.18)));
        pose = mix(pose, RAISE, raise);
        pose = mix(pose, P({ hF: lp(CHOP_P, BFX, 0, 1), hB: [-8, -60], head: [11, -111], chest: [6, -87] }), slam);
        const hk = seg(T, 0.7, 1.07);
        split = E.out3(hk) * (1 - back);
        hop = Math.sin(Math.PI * hk) * 10;
        snapK = seg(T, 0.7, 1.4);
        crackK = seg(T, 0.7, 1.0);
        crumbA = seg(T, 0.7, 0.72) * (1 - back);
        const rub = E.soft(seg(T, 1.3, 1.55)) * (1 - E.soft(seg(T, 2.35, 2.55)));
        pose = mix(pose, RUB(T), rub);

        const startle = E.soft(seg(T, 2.45, 2.85)) * (1 - E.soft(seg(T, 3.2, 3.5)));
        pose = mix(pose, P(STARTLE, pose), startle);
        const watch = E.soft(seg(T, 2.85, 3.1)) * (1 - E.soft(seg(T, 3.3, 3.5)));
        pose = mix(pose, P({ head: [7, -119] }, pose), watch);
        const shrug = E.soft(seg(T, 3.45, 3.75)) * (1 - E.soft(seg(T, 4.4, 4.7)));
        pose = mix(pose, P({ hF: SHRUG.hF, hB: SHRUG.hB, head: SHRUG.head, chest: SHRUG.chest }, pose), shrug);
        bangK = seg(T, 2.5, 3.1);

        if (T >= 1.9 && T < 3.45) {
          const flap = t * 34;
          if (T < 2.5) {
            const k = E.soft(seg(T, 1.9, 2.5));
            const p = bez(BIRD_A, BIRD_C1, BIRD_G, k);
            bd = { p, dir: -1, flap, grip: 0, carry: false };
          } else if (T < 2.62) {
            bd = { p: [BIRD_G[0], BIRD_G[1] - Math.sin(seg(T, 2.5, 2.62) * Math.PI) * 3], dir: -1, flap: flap * 1.4, grip: 1, carry: true };
          } else {
            const k = E.in(seg(T, 2.62, 3.45));
            const p = bez(BIRD_G, BIRD_C2, BIRD_E, k);
            bd = { p, dir: 1, flap, grip: 1, carry: true };
          }
        }
        give = T < 2.5 ? 1 : seg(T, 5.45, 5.95);
        val = valAt(T, '1', [[1.05, '4/4'], [3.6, '3/4'], [5.45, '1']]);
        hi = E.soft(seg(T, 3.83, 4.05)) * (1 - seg(T, 5.45, 5.67));
      }

      sign(g, BSIGN, val, 'left', hi);
      counter(g);
      const J = fig(g, pose, BFX, 0, { wave: S.wave, wt: S.wt });
      if (T > 0.45 && T < 0.78) {
        const k = seg(T, 0.45, 0.72), a = 1 - seg(T, 0.7, 0.78);
        const h = J.w.handF, up = [BFX + RAISE.hF[0] * FS, RAISE.hF[1] * FS];
        const dx = up[0] - h[0], dy = up[1] - h[1], d = Math.hypot(dx, dy) || 1;
        const L = Math.min(26, d) * Math.sin(Math.PI * Math.min(1, k * 1.2));
        g.save();
        g.globalAlpha *= a * 0.8;
        for (const o of [-5, 0, 5]) {
          const ox = (-dy / d) * o, oy = (dx / d) * o;
          ln(g, h[0] + ox + (dx / d) * 6, h[1] + oy + (dy / d) * 6, h[0] + ox + (dx / d) * (6 + L), h[1] + oy + (dy / d) * (6 + L), 1.3, C.muted);
        }
        g.restore();
      }
      if (crumbA > 0) {
        g.save();
        g.globalAlpha *= crumbA;
        const tau = Math.max(0, T - 0.7);
        for (const c of CRUMBS) {
          const yy = Math.min(CT.y - 1.5, CT.y - PH + c.vy * tau + 0.5 * 420 * tau * tau);
          const landed = yy >= CT.y - 1.5;
          const tl = landed ? (-c.vy + Math.sqrt(c.vy * c.vy + 2 * 420 * (PH - 1.5))) / 420 : tau;
          circle(g, c.x + c.vx * Math.min(tau, tl), yy, 1.5);
          g.fillStyle = CHOC;
          g.fill();
        }
        g.restore();
      }
      for (let i = 0; i < 4; i++) {
        const cx = lerp(restL(i) + PW / 2, spreadC(i), split);
        const cy = CT.y - PH / 2 - (split > 0 && split < 1 ? hop * (0.6 + 0.2 * (i % 3)) : 0);
        if (i !== GIVE) {
          piece(g, cx, cy, 0, 1);
          continue;
        }
        if (bd && bd.carry) {
          piece(g, bd.p[0], bd.p[1] + 10 + PH / 2, Math.sin(t * 9) * 0.12, 1);
          continue;
        }
        piece(g, cx, cy, 0, give);
      }
      if (crackK > 0 && crackK < 1) {
        g.save();
        g.globalAlpha *= 1 - crackK;
        for (let i = 1; i < 4; i++) {
          const gx = restL(i);
          R.strokePath(g, [[gx, CT.y - PH - 6], [gx + 3, CT.y - PH + 4], [gx - 3, CT.y - PH + 12], [gx + 2, CT.y + 2]], 1.6, C.ink);
        }
        g.restore();
      }
      if (bd) {
        bird(g, bd.p[0], bd.p[1], bd.dir, bd.flap, bd.grip);
      }
      sparks(g, CHOP_P[0], CT.y - PH - 6, seg(T, 0.68, 1.12), 16, 7, C.ink);
      floatText(g, 'snap!', CHOP_P[0] + 44, -92, snapK, C.ink, 13);
      bang(g, J.w.head[0] + 13, J.w.head[1] - 12, bangK);
      sparks(g, BSIGN, SIGN.top - 6, seg(T, 3.83, 4.4), 16, 6, C.amber);
    },
  };
})();
