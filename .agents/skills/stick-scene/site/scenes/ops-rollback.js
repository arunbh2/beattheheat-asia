// Rollback: a bad release rides in and the board goes red, the figure calmly pulls the rollback lever
// Load after stick.js. Use as <stick-scene scene="ops-rollback" play="view"></stick-scene>.
(function () {
  const SC = (window.SCENES = window.SCENES || {});
  const R = window.RIG;
  const { C, E, P, mix, legs, walkSeg, fig, inkFill, rr, ln, text, seg, breathe, pulse, lp, sparks, tickBadge, bubble, circle, lerp, wline, clamp } = R;

  const B = { x: -104, y: -172, w: 144, h: 92 };
  const LIGHT = [B.x + B.w - 14, B.y + 11];
  const BELT = { x0: 6, x1: 214, y: -16 };
  const CRATE = { w: 40, h: 30, park: 58, out: 200 };
  const PIVOT = [-120, -22];
  const ARM = 52;
  const UP = 0.2, DOWN = -0.48;
  const HOME = -186, AT = -154;

  const tipAt = (a) => [PIVOT[0] + Math.sin(a) * ARM, PIVOT[1] - Math.cos(a) * ARM];

  function board(g, ver, squish, bad, err, okK) {
    ln(g, B.x + 22, B.y + B.h, B.x + 12, 0, 2.2);
    ln(g, B.x + B.w - 22, B.y + B.h, B.x + B.w - 12, 0, 2.2);
    rr(g, B.x, B.y, B.w, B.h, 6);
    inkFill(g, C.paper, 1.7);
    ln(g, B.x, B.y + 21, B.x + B.w, B.y + 21, 1.3);
    text(g, 'production', B.x + 10, B.y + 15, 8.5, C.muted, 'left');
    circle(g, LIGHT[0], LIGHT[1], 6);
    const blink = bad > 0.5 ? 0.55 + 0.45 * Math.abs(Math.sin(bad * 40)) : 1;
    g.save();
    g.globalAlpha *= blink;
    inkFill(g, bad > 0.5 ? '#f28b82' : '#8fd19e', 1.3, bad > 0.5 ? C.redInk : C.greenInk);
    g.restore();
    g.save();
    g.translate(B.x + B.w / 2, B.y + 44);
    g.scale(1, Math.max(0.04, squish));
    text(g, ver, 0, 0, 19, bad > 0.5 ? C.redInk : C.ink);
    g.restore();
    const cx0 = B.x + 48, cx1 = B.x + B.w - 12, cy = B.y + B.h - 12;
    text(g, err > 0.3 ? 'errors ↑' : 'errors', B.x + 10, cy + 2, 8.5, err > 0.3 ? C.redInk : C.muted, 'left');
    const pts = [];
    for (let i = 0; i <= 10; i++) {
      const k = i / 10;
      const base = Math.sin(i * 1.7) * 1.2;
      pts.push([lerp(cx0, cx1, k), cy + base - err * 26 * Math.pow(k, 2.4)]);
    }
    wline(g, pts, 1.6, err > 0.3 ? C.redInk : C.greenInk, 0.3, 3);
    tickBadge(g, B.x + B.w - 4, B.y + 36, okK, 7);
  }
  function conveyor(g, spin) {
    ln(g, BELT.x0 + 14, BELT.y + 10, BELT.x0 + 10, 0, 2);
    ln(g, BELT.x1 - 14, BELT.y + 10, BELT.x1 - 10, 0, 2);
    rr(g, BELT.x0, BELT.y, BELT.x1 - BELT.x0, 10, 5);
    inkFill(g, C.steel, 1.6);
    for (let x = BELT.x0 + 10; x < BELT.x1 - 4; x += 22) {
      circle(g, x, BELT.y + 5, 3);
      inkFill(g, C.paper, 1.1);
      ln(g, x, BELT.y + 5, x + Math.cos(spin) * 3, BELT.y + 5 + Math.sin(spin) * 3, 1, C.ink);
    }
  }
  function crate(g, x, a, bad) {
    if (a <= 0) {
      return;
    }
    const y = BELT.y - CRATE.h;
    g.save();
    g.globalAlpha *= a;
    g.translate(x, y + CRATE.h);
    g.rotate(bad * Math.sin(bad * 50) * 0.03);
    rr(g, -CRATE.w / 2, -CRATE.h, CRATE.w, CRATE.h, 3);
    inkFill(g, C.wood, 1.6);
    ln(g, -CRATE.w / 2 + 3, -CRATE.h + 4, CRATE.w / 2 - 3, -4, 1.1, C.umber);
    rr(g, -14, -CRATE.h / 2 - 7, 28, 14, 3);
    inkFill(g, C.paper, 1.2);
    text(g, 'v43', 0, -CRATE.h / 2 + 3.5, 9.5, C.ink);
    g.restore();
  }
  function lever(g, ang) {
    const tip = tipAt(ang);
    ln(g, PIVOT[0], PIVOT[1], tip[0], tip[1], 3.4, C.ink);
    circle(g, tip[0], tip[1], 5.5);
    inkFill(g, '#f28b82', 1.5);
    rr(g, PIVOT[0] - 22, PIVOT[1] - 2, 44, 24, 4);
    inkFill(g, C.steel, 1.6);
    circle(g, PIVOT[0], PIVOT[1], 3);
    inkFill(g, C.paper, 1.2);
    text(g, 'rollback', PIVOT[0], PIVOT[1] + 15, 8.5, C.ink);
  }
  function smoke(g, x, y, k, t) {
    if (k <= 0) {
      return;
    }
    for (let i = 0; i < 3; i++) {
      const p = (t * 0.7 + i / 3) % 1;
      g.save();
      g.globalAlpha *= k * Math.sin(Math.PI * p) * 0.9;
      circle(g, x - 8 + i * 7 + Math.sin(p * 6 + i) * 4, y - p * 34, 4 + p * 6);
      inkFill(g, '#e8e8e8', 1.2, '#9a9a9a');
      g.restore();
    }
  }

  SC['ops-rollback'] = {
    dur: 8.5,
    width: 460,
    label: 'A new release crate rides in and the status board turns red with rising errors, so a stick figure calmly pulls the rollback lever and the board goes back to the last good version.',
    draw(g, S) {
      const T = S.on ? S.u * this.dur : -1;
      const t = S.t;
      let x = HOME, gait = { ph: 0, amp: 0 };
      let pose = breathe(P({ hF: [12, -60], hB: [-4, -52] }), t);
      let crateX = CRATE.out, crateA = 0, ver = 'v42 live', squish = 1, bad = 0, err = 0, okK = 0, ang = UP, smokeK = 0, spin = 0, hmK = 0, dust = 0;
      const chin = P({ hF: [10, -96], head: [7, -116], hB: [-4, -54] });
      if (T < 0) {
        pose = mix(pose, chin, pulse(t, 6.4, 2.6, 2.2));
      } else {
        const fade = 1 - seg(T, this.dur - 0.5, this.dur);
        const inK = E.soft(seg(T, 0.2, 1.6));
        const outK = E.soft(seg(T, 4.3, 5.5));
        crateX = lerp(lerp(CRATE.out + 10, CRATE.park, inK), CRATE.out + 10, outK);
        crateA = seg(T, 0.2, 0.6) * (1 - seg(T, 5.1, 5.5));
        spin = (inK - outK) * 14;
        const f1 = seg(T, 1.6, 1.9), f2 = seg(T, 4.5, 4.8);
        squish = f2 > 0 ? Math.abs(Math.cos(Math.PI * f2)) : Math.abs(Math.cos(Math.PI * f1));
        const bad43 = f1 >= 0.5 && f2 < 0.5;
        ver = bad43 ? 'v43 live' : 'v42 live';
        bad = bad43 ? 0.5 + seg(T, 1.75, 4.6) * 0.5 : 0;
        err = seg(T, 1.9, 2.6) * (1 - E.soft(seg(T, 4.7, 5.4)));
        smokeK = seg(T, 2.0, 2.4) * (1 - seg(T, 4.3, 4.8));
        hmK = seg(T, 2.4, 2.6) * (1 - seg(T, 3.2, 3.4));
        okK = seg(T, 5.0, 5.4) * fade;
        const pull = E.soft(seg(T, 3.75, 4.2));
        const back = E.soft(seg(T, 7.4, 8.0));
        ang = lerp(lerp(UP, DOWN, pull), UP, back);

        const ws = T < 4.6 ? walkSeg(T, 3.1, 3.55, HOME, AT) : walkSeg(T, 4.8, 5.3, AT, HOME);
        x = ws.x;
        gait = T < 4.6 ? ws : { ph: -ws.ph, amp: ws.amp, stride: ws.stride };
        const look = E.soft(seg(T, 0.3, 0.8)) * (1 - E.soft(seg(T, 2.2, 2.5)));
        const think = E.soft(seg(T, 2.3, 2.6)) * (1 - E.soft(seg(T, 2.9, 3.15)));
        const grab = E.soft(seg(T, 3.5, 3.75)) * (1 - E.soft(seg(T, 4.35, 4.6)));
        dust = E.soft(seg(T, 5.4, 5.65)) * (1 - E.soft(seg(T, 6.8, 7.1)));
        pose = mix(pose, P({ hF: [12, -60], hB: [-4, -52], head: [9, -115] }), look);
        pose = mix(pose, chin, think);
        pose = mix(pose, P({ hF: lp(tipAt(ang), x, 0, 1), hB: [-6, -54], head: [5, -116], chest: [-1 - 3 * pull, -90] }), grab);
        const rub = Math.sin(T * 26) * 4;
        pose = mix(pose, P({ hF: [16 + rub, -66], hB: [14 - rub, -62], head: [7, -115] }), dust);
      }
      pose = legs(pose, gait.ph, gait.amp, { arms: false, stride: gait.stride });

      board(g, ver, squish, bad, err, okK);
      conveyor(g, spin);
      crate(g, crateX, crateA, bad > 0.5 ? seg(T, 1.9, 4.2) : 0);
      lever(g, ang);
      const J = fig(g, pose, x, 0, { wave: S.wave, wt: S.wt });
      smoke(g, crateX, BELT.y - CRATE.h - 6, smokeK, t);
      bubble(g, x + 22, -134, 'hm.', hmK, { tail: -14 });
      if (dust > 0.5) {
        const h = J.w.handF;
        sparks(g, h[0] + 4, h[1] - 2, (T * 2.2) % 1, 8, 4, C.muted);
      }
    },
  };
})();
