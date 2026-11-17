// Savings jar: the figure flicks coins into a jar, the "bike" goal fills, and a bike rolls in
// Load after stick.js. Use as <stick-scene scene="money-savings" play="view"></stick-scene>.
(function () {
  const SC = (window.SCENES = window.SCENES || {});
  const R = window.RIG;
  const { C, E, P, mix, legs, fig, inkFill, rr, ln, text, seg, breathe, pulse, sparks, arcPt, lerp, circle, tickBadge } = R;

  const TOP = -56;
  const JAR = { x: -46, w: 48, y: -120 };
  const MOUTH = [JAR.x + JAR.w / 2, JAR.y - 4];
  const TAG = { x: 14, y: -114, w: 52, h: 30 };
  const ME = -104;
  const BIKE_X = 142;
  const TOSSES = [0.7, 1.7, 2.7];
  const BASE_COINS = 2;
  const GOAL = 5;

  function shelf(g) {
    ln(g, -50, TOP, -54, 0, 2.2);
    ln(g, 64, TOP, 68, 0, 2.2);
    rr(g, -62, TOP - 5, 140, 5, 2);
    inkFill(g, C.wood, 1.5);
  }
  function coin(g, x, y, r, rot) {
    g.save();
    g.translate(x, y);
    g.scale(Math.max(0.2, Math.abs(Math.cos(rot || 0))), 1);
    circle(g, 0, 0, r);
    inkFill(g, C.butterHi, 1.3);
    circle(g, 0, 0, r * 0.55);
    g.lineWidth = 0.9;
    g.strokeStyle = C.amber;
    g.stroke();
    g.restore();
  }
  function jarPath(g) {
    const x = JAR.x, w = JAR.w, b = TOP - 5;
    g.beginPath();
    g.moveTo(x + 8, JAR.y);
    g.lineTo(x + w - 8, JAR.y);
    g.lineTo(x + w - 8, JAR.y + 6);
    g.quadraticCurveTo(x + w, JAR.y + 8, x + w, JAR.y + 18);
    g.lineTo(x + w, b - 4);
    g.quadraticCurveTo(x + w, b, x + w - 4, b);
    g.lineTo(x + 4, b);
    g.quadraticCurveTo(x, b, x, b - 4);
    g.lineTo(x, JAR.y + 18);
    g.quadraticCurveTo(x, JAR.y + 8, x + 8, JAR.y + 6);
    g.closePath();
  }
  function levelY(n) {
    return TOP - 5 - 3 - n * 9;
  }
  function jar(g, n, glint) {
    jarPath(g);
    g.fillStyle = 'rgba(238,242,246,0.55)';
    g.fill();
    g.save();
    jarPath(g);
    g.clip();
    const top = levelY(n);
    rr(g, JAR.x, top, JAR.w, TOP - top, 0);
    g.fillStyle = C.butter;
    g.fill();
    for (let row = 0; row < 7; row++) {
      const y = TOP - 9 - row * 8;
      if (y < top + 2) {
        break;
      }
      for (let i = 0; i < 4; i++) {
        const cx = JAR.x + 8 + i * 11 + (row % 2) * 5;
        g.beginPath();
        g.ellipse(cx, y, 5, 2, 0, 0, Math.PI * 2);
        g.lineWidth = 1;
        g.strokeStyle = C.amber;
        g.stroke();
      }
    }
    ln(g, JAR.x, top, JAR.x + JAR.w, top, 1.3, C.amber);
    g.restore();
    jarPath(g);
    g.lineWidth = 1.7;
    g.strokeStyle = C.ink;
    g.stroke();
    rr(g, JAR.x + 6, JAR.y - 5, JAR.w - 12, 6, 2);
    inkFill(g, C.steel, 1.5);
    g.save();
    g.globalAlpha *= 0.5 + glint * 0.5;
    ln(g, JAR.x + 7, JAR.y + 20, JAR.x + 7, JAR.y + 38, 2, C.paper);
    g.restore();
  }
  function tag(g, prog, done) {
    ln(g, JAR.x + JAR.w - 7, JAR.y + 3, TAG.x + 6, TAG.y + 4, 1, C.muted);
    g.save();
    g.translate(TAG.x, TAG.y);
    g.rotate(0.06);
    rr(g, 0, 0, TAG.w, TAG.h, 4);
    inkFill(g, C.paper, 1.4);
    circle(g, 6, 5, 1.8);
    inkFill(g, C.paper, 0.9);
    text(g, 'goal: bike', TAG.w / 2 + 3, 12, 8.5, C.ink);
    rr(g, 6, 18, TAG.w - 12, 6, 3);
    inkFill(g, C.chip, 1);
    if (prog > 0) {
      rr(g, 6, 18, (TAG.w - 12) * prog, 6, 3);
      inkFill(g, done > 0 ? C.greenInk : C.butterHi, 1, C.ink);
    }
    g.restore();
    tickBadge(g, TAG.x + TAG.w, TAG.y + 2, done, 6.5);
  }
  function bike(g, x, roll, a) {
    if (a <= 0) {
      return;
    }
    const r = 13, y = -r - 1;
    const back = [x - 22, y], front = [x + 22, y];
    const crank = [x - 2, y], seat = [x - 10, y - 24], head = [x + 14, y - 24];
    g.save();
    g.globalAlpha *= a;
    for (const w of [back, front]) {
      circle(g, w[0], w[1], r);
      inkFill(g, 'rgba(255,255,255,0.6)', 1.8);
      for (let i = 0; i < 3; i++) {
        const ang = roll + (i * Math.PI) / 3;
        ln(g, w[0] - Math.cos(ang) * r * 0.85, w[1] - Math.sin(ang) * r * 0.85, w[0] + Math.cos(ang) * r * 0.85, w[1] + Math.sin(ang) * r * 0.85, 0.9, C.muted);
      }
    }
    g.lineJoin = 'round';
    g.beginPath();
    g.moveTo(back[0], back[1]);
    g.lineTo(crank[0], crank[1]);
    g.lineTo(head[0], head[1] + 4);
    g.lineTo(seat[0], seat[1] + 2);
    g.closePath();
    g.lineWidth = 2.6;
    g.strokeStyle = C.redInk;
    g.stroke();
    ln(g, back[0], back[1], seat[0], seat[1] + 2, 2.6, C.redInk);
    ln(g, crank[0], crank[1], seat[0], seat[1], 2.4, C.redInk);
    ln(g, front[0], front[1], head[0] - 2, head[1] - 4, 2.4, C.ink);
    ln(g, head[0] - 6, head[1] - 5, head[0] + 2, head[1] - 7, 2.4, C.ink);
    rr(g, seat[0] - 7, seat[1] - 2, 13, 4, 2);
    inkFill(g, C.ink, 1);
    circle(g, crank[0], crank[1], 3);
    inkFill(g, C.paper, 1.3);
    g.restore();
  }

  SC['money-savings'] = {
    dur: 8,
    width: 420,
    label: 'A stick figure drops coins into a savings jar, the bike goal fills up, and a new bicycle rolls in while it cheers.',
    draw(g, S) {
      const T = S.on ? S.u * this.dur : -1;
      const t = S.t;
      let pose = breathe(P({ hF: [12, -60], hB: [-4, -52] }), t);
      let n = BASE_COINS, bikeX = 230, bikeA = 0, done = 0, flying = null, clinkK = -1, clinkN = 0;
      const glint = pulse(t, 3.7, 1, 0.6);
      if (T < 0) {
        pose = mix(pose, P({ hF: [10, -96], head: [9, -114], hB: [-4, -54] }), pulse(t, 6.2, 2.4, 2.2));
      } else {
        const fade = 1 - seg(T, this.dur - 0.5, this.dur);
        for (let i = 0; i < TOSSES.length; i++) {
          const a = TOSSES[i];
          const dip = E.soft(seg(T, a - 0.35, a - 0.12)) * (1 - E.soft(seg(T, a - 0.12, a)));
          const flick = E.soft(seg(T, a - 0.08, a + 0.05)) * (1 - E.soft(seg(T, a + 0.35, a + 0.6)));
          pose = mix(pose, P({ hF: [10, -50], hB: [-4, -52], head: [5, -114] }), dip);
          pose = mix(pose, P({ hF: [30, -100], hB: [-4, -54], head: [9, -116] }), flick);
          const k = seg(T, a, a + 0.42);
          if (k > 0 && k < 1) {
            flying = { k, i };
          }
          if (T >= a + 0.42) {
            n = BASE_COINS + i + 1;
            clinkK = seg(T, a + 0.42, a + 0.8);
            clinkN = i;
          }
        }
        const cheer = E.back(seg(T, 4.42, 4.95)) * (1 - E.soft(seg(T, 6.4, 6.8)));
        const bounce = Math.abs(Math.sin((T - 4.5) * 9)) * 3 * seg(T, 4.6, 4.8) * (1 - seg(T, 6.0, 6.4));
        pose = mix(pose, P({ hF: [22, -128 - bounce], hB: [-14, -126 - bounce], head: [2, -117 - bounce * 0.5] }), cheer);
        done = seg(T, 3.3, 3.7) * fade;
        const roll = E.out3(seg(T, 3.6, 4.7));
        bikeX = lerp(230, BIKE_X, roll);
        bikeA = seg(T, 3.6, 4.0) * fade;
        n = Math.round(lerp(BASE_COINS, n, fade));
      }
      pose = legs(pose, 0, 0, { arms: false });

      const prog = n / GOAL;
      shelf(g);
      jar(g, n, glint);
      tag(g, prog, done);
      bike(g, bikeX, -(bikeX - 230) / 13, bikeA);
      const J = fig(g, pose, ME, 0, { wave: S.wave, wt: S.wt });
      if (flying) {
        const from = J.w.handF;
        const p = arcPt([from[0] + 2, from[1] - 4], MOUTH, 22, E.sm(flying.k));
        coin(g, p[0], p[1], 5, flying.k * 9);
      }
      if (clinkK > 0 && clinkK < 1) {
        sparks(g, MOUTH[0], levelY(BASE_COINS + clinkN + 1) - 4, clinkK, 12, 5, C.amber);
        R.floatText(g, '+1', MOUTH[0] - 30, JAR.y - 2, clinkK, C.amber, 11);
      }
      sparks(g, bikeX + 14, -60, seg(T, 4.7, 5.3), 14, 5);
    },
  };
})();
