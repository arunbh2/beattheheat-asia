// idea: small daily improvements compound, a 1% snowball rolls down a gentle hill and arrives 37x bigger
(function () {
  const SC = (window.SCENES = window.SCENES || {});
  const R = window.RIG;
  const { C, E, P, mix, fig, inkFill, ln, text, seg, breathe, pulse, lp, sparks, circle, wline, pill, lerp } = R;

  const HY = -64;
  const SX0 = -150, SX1 = 110;
  const HOME = -214;
  const X0 = -186, X1 = 186;
  const R0 = 4.5, R1 = 30;
  const MARKS = [[-136, 'day 1'], [-20, 'day 100'], [92, 'day 365']];

  const REST = P({ hF: [12, -60], hB: [-4, -52] });
  const CHIN = P({ hF: [10, -96], head: [7, -116], hB: [-4, -54] });
  const NUDGE = P({ fF: [27, -7], kF: [30, -36], hip: [-3, -59], chest: [-4, -90], head: [-3, -116], hF: [14, -64], hB: [-12, -58] });
  const WATCH = P({ hF: [40, -98], hB: [-4, -54], head: [10, -115], chest: [2, -90] });
  const CHEER = P({ hF: [14, -132], hB: [-10, -130], head: [3, -118] });

  function surf(x) {
    if (x <= SX0) {
      return HY;
    }
    if (x >= SX1) {
      return 0;
    }
    const k = (x - SX0) / (SX1 - SX0);
    return (HY * (1 + Math.cos(Math.PI * k))) / 2;
  }
  function slope(x) {
    if (x <= SX0 || x >= SX1) {
      return 0;
    }
    const k = (x - SX0) / (SX1 - SX0);
    return (-HY * Math.PI * Math.sin(Math.PI * k)) / (2 * (SX1 - SX0));
  }
  function onHill(xc, r) {
    const d = slope(xc);
    const n = Math.hypot(d, 1);
    return [xc + (r * d) / n, surf(xc) - r / n];
  }

  function hill(g) {
    const pts = [];
    for (let x = -420; x <= SX1 + 10; x += 10) {
      pts.push([x, surf(x)]);
    }
    g.beginPath();
    g.moveTo(-420, 1);
    pts.forEach((p) => g.lineTo(p[0], p[1]));
    g.lineTo(SX1 + 10, 1);
    g.closePath();
    g.fillStyle = C.paper;
    g.fill();
    wline(g, pts, 2, C.ink, 0.6, 3);
    for (const [hx, hy] of [[-232, -40], [-170, -26], [-100, -20], [-40, -10]]) {
      if (hy < surf(hx) + 10) {
        ln(g, hx, hy, hx + 10, hy, 1.2, '#dedede');
      }
    }
  }

  function marks(g, passed, a) {
    MARKS.forEach(([mx, s], i) => {
      const y = surf(mx);
      const on = passed[i] * a;
      const col = on > 0.5 ? C.ink : '#a8a8a8';
      ln(g, mx, y - 5, mx, y + 4, 1.4, col);
      text(g, s, mx + 2, y - 9, 7.5, col);
    });
  }

  function ball(g, cx, cy, r, rot, a) {
    if (a <= 0 || r <= 0.2) {
      return;
    }
    g.save();
    g.globalAlpha *= a;
    circle(g, cx, cy, r);
    inkFill(g, C.paper, r < 6 ? 1.3 : 1.7);
    if (r > 7) {
      g.save();
      g.beginPath();
      g.arc(cx, cy, r - 3, 0.2, 1.4);
      g.strokeStyle = '#dbe4ec';
      g.lineWidth = Math.min(4, r * 0.18);
      g.lineCap = 'round';
      g.stroke();
      g.restore();
      for (let i = 0; i < 3; i++) {
        const ang = rot + (i * Math.PI * 2) / 3;
        const px = cx + Math.cos(ang) * r * 0.5, py = cy + Math.sin(ang) * r * 0.5;
        g.beginPath();
        g.arc(px, py, r * 0.16, ang + 1.2, ang + 2.6);
        g.strokeStyle = '#9a9a9a';
        g.lineWidth = 1.1;
        g.stroke();
      }
    }
    g.restore();
  }

  function setStep(g, step) {
    const el = g.canvas.parentElement;
    if (!el) {
      return;
    }
    const v = String(step);
    if (el.dataset.step !== v) {
      el.dataset.step = v;
    }
  }

  SC['idea-compounding'] = {
    dur: 9.2,
    width: 520,
    label: 'A stick figure pats a tiny 1% snowball together at the top of a gentle hill, nudges it, and it rolls down past day 1, day 100 and day 365, arriving 37 times bigger.',
    draw(g, S) {
      const T = S.on ? S.u * this.dur : -1;
      const t = S.t;
      let pose = breathe(REST, t);
      let step = 0, fade = 1, ballA = 0, r = 0, setK = 0, rollK = 0, pctA = 0, pctK = 0, payK = 0, puffK = 0;
      let xc = X0;

      if (T < 0) {
        pose = mix(pose, CHIN, pulse(t, 6, 2, 2.2));
      } else {
        fade = 1 - seg(T, 8.3, 8.95);
        step = T < 2.5 ? 1 : T < 5.6 ? 2 : T < 8.3 ? 3 : 0;

        const pat = E.soft(seg(T, 0.15, 0.4)) * (1 - E.soft(seg(T, 1.45, 1.65)));
        const bob = Math.sin(T * 20) * 3 * seg(T, 0.3, 0.5) * (1 - seg(T, 1.2, 1.4));
        pose = mix(pose, P({ hF: [22, -74 + bob], hB: [18, -68 - bob], head: [8, -113], chest: [2, -90] }), pat);
        r = R0 * E.out3(seg(T, 0.35, 1.3));
        puffK = seg(T, 0.5, 1.3);
        pctK = seg(T, 1.15, 1.45);
        pctA = 1 - seg(T, 3.0, 3.3);

        const crouch = E.soft(seg(T, 1.55, 1.85)) * (1 - E.soft(seg(T, 2.05, 2.35)));
        pose = mix(pose, P({ hip: [-6, -32], chest: [12, -54], head: [21, -77], kF: [22, -30], fF: [22, -2.5], kB: [4, -4], fB: [-22, -3], hF: lp([X0 - 3, HY - 8], HOME, HY, 1), hB: lp([X0 - 6, HY - 6], HOME, HY, 1) }), crouch);
        setK = E.soft(seg(T, 1.55, 1.85));

        pose = mix(pose, NUDGE, E.soft(seg(T, 2.55, 2.85)) * (1 - E.soft(seg(T, 3.0, 3.25))));
        rollK = E.io(seg(T, 2.85, 5.6));
        xc = lerp(X0, X1, rollK);
        const p = (xc - X0) / (X1 - X0);
        if (T >= 2.85) {
          r = R0 + (R1 - R0) * Math.pow(p, 1.6);
        }
        pose = mix(pose, WATCH, E.soft(seg(T, 3.2, 3.5)) * (1 - E.soft(seg(T, 5.4, 5.7))));

        payK = seg(T, 5.75, 6.15);
        const cheer = E.back(seg(T, 6.0, 6.55)) * (1 - E.soft(seg(T, 7.0, 7.3)));
        pose = mix(pose, CHEER, cheer);
        pose = { ...pose, hF: [pose.hF[0], pose.hF[1] + Math.sin((T - 6.05) * 12) * 3 * cheer] };
        ballA = fade;
      }
      setStep(g, step);

      hill(g);
      const passed = MARKS.map(([mx]) => (T >= 0 && xc >= mx ? 1 : 0));
      marks(g, passed, fade);

      const J = fig(g, pose, HOME, HY, { wave: S.wave, wt: S.wt });
      let bx, by;
      const hf = J.w.handF, hb = J.w.handB;
      const hand = [(hf[0] + hb[0]) / 2 + 3, (hf[1] + hb[1]) / 2 - 2];
      const rest = onHill(X0, R0);
      if (rollK > 0) {
        [bx, by] = onHill(xc, r);
      } else {
        bx = lerp(hand[0], rest[0], setK);
        by = lerp(hand[1], rest[1], setK);
      }
      const land = seg(T, 5.6, 5.85);
      const squash = Math.sin(Math.PI * land) * 0.08;
      if (T >= 0) {
        g.save();
        g.translate(bx, by + r);
        g.scale(1 + squash, 1 - squash);
        ball(g, 0, -r, r, (xc - X0) / 9, ballA);
        g.restore();
      }
      if (T >= 0 && puffK > 0 && puffK < 1) {
        for (let i = 0; i < 4; i++) {
          const k = (puffK * 3 + i / 4) % 1;
          const ang = -Math.PI / 2 + (i - 1.5) * 0.9;
          g.save();
          g.globalAlpha *= 1 - k;
          circle(g, bx + Math.cos(ang) * (6 + k * 8), by + Math.sin(ang) * (6 + k * 8), 1.2);
          g.fillStyle = '#b9c6d2';
          g.fill();
          g.restore();
        }
      }
      if (pctK > 0 && pctA > 0) {
        const z = E.back(pctK);
        g.save();
        g.globalAlpha *= pctA;
        g.translate(bx + 14, by - 6);
        g.scale(z, z);
        pill(g, 0, 0, '1%', C.butter, C.ink, 8.5);
        g.restore();
      }
      if (payK > 0) {
        const z = E.back(payK);
        const top = onHill(X1, R1)[1] - R1;
        g.save();
        g.globalAlpha *= fade;
        g.translate(X1, top - 16);
        g.scale(z, z);
        pill(g, 0, 0, '37×', C.butter, C.ink, 13);
        g.restore();
        g.save();
        g.globalAlpha *= fade * seg(T, 6.2, 6.6);
        text(g, '1.01 ^ 365', X1, top - 34, 8, C.muted);
        g.restore();
      }
      sparks(g, X1, onHill(X1, R1)[1] - R1 - 20, seg(T, 5.85, 6.5), 22, 7, C.amber);

      const labels = [[HOME + 10, '1  start small'], [-14, '2  keep going'], [X1, '3  it compounds']];
      labels.forEach(([lx, s], i) => {
        text(g, s, lx, 18, 9.5, step === i + 1 ? C.ink : '#a8a8a8');
      });
    },
  };
})();
