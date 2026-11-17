// idea: tech debt is a tower of crates; ship fast and it leans, it wobbles, a refactor brace straightens it
(function () {
  const SC = (window.SCENES = window.SCENES || {});
  const R = window.RIG;
  const { C, E, P, mix, legs, walkSeg, fig, inkFill, rr, ln, text, seg, breathe, pulse, lp, sparks, tickBadge, arcPt, lerp } = R;

  const BENCH = { x: -150, w: 60, top: -40 };
  const PLANK = { w: 84, h: 13 };
  const PILE = { w: 50, h: 22 };
  const TOWER = { x: 92, w: 56, h: 24 };
  const BASE_CRATES = ['auth', 'api'];
  const DEBT = ['quick fix', 'hack', 'todo'];
  const LEAN = [7, 15, 24];
  const TILT = [0.03, 0.06, 0.1];
  const BRACE_TOP = [TOWER.x - TOWER.w / 2 - 4, -80];
  const BRACE_FOOT = [BRACE_TOP[0] - Math.sqrt(PLANK.w * PLANK.w - 80 * 80), 0];
  const BRACE_MID = [(BRACE_TOP[0] + BRACE_FOOT[0]) / 2, (BRACE_TOP[1] + BRACE_FOOT[1]) / 2];
  const BRACE_ANG = Math.atan2(BRACE_TOP[1] - BRACE_FOOT[1], BRACE_TOP[0] - BRACE_FOOT[0]);
  const HOME = -102, AT = 22;
  const THROW = (i) => 0.25 + i * 1.0;
  const LAND = (i) => THROW(i) + 0.9;

  const REST = P({ hF: [12, -60], hB: [-4, -52] });
  const CHIN = P({ hF: [10, -96], head: [7, -116], hB: [-4, -54] });
  const HOLD = P({ hF: [20, -74], hB: [14, -70], head: [5, -116] });
  const TOSS = P({ hF: [30, -118], hB: [24, -112], head: [8, -118], chest: [3, -91] });
  const WHOA = P({ hF: [14, -114], hB: [4, -110], head: [-6, -114], chest: [-3, -90] });
  const EASY = P({ hF: [36, -90], hB: [30, -86], head: [6, -114], chest: [2, -90] });
  const CARRY = P({ hF: [20, -72], hB: [10, -70], head: [6, -116] });
  const CHEER = P({ hF: [14, -132], hB: [-10, -130], head: [3, -118] });

  function crate(g, cx, by, w, h, label, rot, fill) {
    g.save();
    g.translate(cx, by);
    g.rotate(rot || 0);
    rr(g, -w / 2, -h, w, h, 2.5);
    inkFill(g, fill || '#ead2a4', 1.6);
    ln(g, -w / 2 + 4, -h + 4, -w / 2 + 4, -4, 1.1, '#b8925a');
    ln(g, w / 2 - 4, -h + 4, w / 2 - 4, -4, 1.1, '#b8925a');
    text(g, label, 0, -h / 2 + 3.5, 8.5, C.umber);
    g.restore();
  }

  function plank(g, cx, cy, ang, a) {
    if (a <= 0) {
      return;
    }
    g.save();
    g.globalAlpha *= a;
    g.translate(cx, cy);
    g.rotate(ang);
    rr(g, -PLANK.w / 2, -PLANK.h / 2, PLANK.w, PLANK.h, 2);
    inkFill(g, C.wood, 1.6);
    if (Math.abs(ang) > Math.PI / 2) {
      g.rotate(Math.PI);
    }
    text(g, 'refactor', 0, 3, 7.5, C.umber);
    g.restore();
  }

  function bench(g) {
    const x0 = BENCH.x - BENCH.w / 2, x1 = BENCH.x + BENCH.w / 2;
    ln(g, x0 + 6, BENCH.top + 4, x0 + 2, 0, 2.2);
    ln(g, x1 - 6, BENCH.top + 4, x1 - 2, 0, 2.2);
    ln(g, x0 + 5, -16, x1 - 5, -16, 1.4, '#bdbdbd');
    rr(g, x0, BENCH.top, BENCH.w, 5, 2);
    inkFill(g, C.wood, 1.5);
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

  SC['idea-tech-debt'] = {
    dur: 9.6,
    width: 460,
    label: 'A stick figure quickly stacks crates marked quick fix, hack and todo onto a tower so it leans and wobbles, then slides in a refactor brace that straightens it.',
    draw(g, S) {
      const T = S.on ? S.u * this.dur : -1;
      const t = S.t;
      let x = HOME, face = 1, gait = { ph: 0, amp: 0 };
      let pose = breathe(REST, t);
      let step = 0, held = -1, flying = -1, flyK = 0, sway = 0, slip = 0, straight = 0, fade = 1;
      let bang = 0, sweat = 0, tickK = 0, plankA = 1, plankHeld = 0, braceK = 0, braceA = 0, pileBack = 0;
      const taken = [false, false, false];
      const landed = [0, 0, 0];

      if (T < 0) {
        pose = mix(pose, CHIN, pulse(t, 6, 2, 2.2));
      } else {
        fade = 1 - seg(T, 8.9, 9.45);
        step = T < 3.4 ? 1 : T < 5.6 ? 2 : T < 8.5 ? 3 : 0;

        for (let i = 0; i < 3; i++) {
          const a = THROW(i);
          const reachK = E.soft(seg(T, a, a + 0.25)) * (1 - E.soft(seg(T, a + 0.28, a + 0.5)));
          if (T >= a && T < a + 0.35) {
            face = -1;
          }
          const pileTop = BENCH.top - PLANK.h - (2 - i) * PILE.h - PILE.h / 2;
          pose = mix(pose, P({ hF: lp([BENCH.x + 20, pileTop], x, 0, -1), hB: lp([BENCH.x + 16, pileTop + 6], x, 0, -1), head: [9, -114], chest: [3, -90] }), reachK);
          pose = mix(pose, HOLD, E.soft(seg(T, a + 0.28, a + 0.52)) * (1 - E.soft(seg(T, a + 0.55, a + 0.7))));
          pose = mix(pose, TOSS, E.soft(seg(T, a + 0.52, a + 0.72)) * (1 - E.soft(seg(T, a + 0.8, a + 1.0))));
          taken[i] = T >= a + 0.3;
          if (T >= a + 0.3 && T < a + 0.62) {
            held = i;
          }
          if (T >= a + 0.62 && T < LAND(i)) {
            flying = i;
            flyK = seg(T, a + 0.62, LAND(i));
          }
          landed[i] = T >= LAND(i) ? 1 : 0;
        }

        const wob = E.soft(seg(T, 3.4, 3.8)) * (1 - E.soft(seg(T, 5.0, 5.6)));
        sway = Math.sin((T - 3.4) * Math.PI * 2 * 1.4) * wob;
        slip = E.out3(seg(T, 4.15, 4.4));
        pose = mix(pose, WHOA, E.back(seg(T, 4.12, 4.52)) * (1 - E.soft(seg(T, 4.75, 5.0))));
        pose = mix(pose, EASY, E.soft(seg(T, 4.8, 5.05)) * (1 - E.soft(seg(T, 5.35, 5.6))));
        bang = seg(T, 4.25, 4.4) * (1 - seg(T, 5.2, 5.4));
        sweat = seg(T, 4.4, 5.3);

        const reachPlank = E.soft(seg(T, 5.6, 5.85)) * (1 - E.soft(seg(T, 5.9, 6.1)));
        if (T >= 5.6 && T < 5.95) {
          face = -1;
        }
        pose = mix(pose, P({ hF: lp([BENCH.x + 26, BENCH.top - 5], x, 0, -1), hB: lp([BENCH.x + 20, BENCH.top - 4], x, 0, -1), head: [10, -112], chest: [5, -88] }), reachPlank);
        plankHeld = T >= 5.9 && T < 6.95 ? 1 : 0;
        plankA = T < 5.9 ? 1 : 0;
        pose = mix(pose, CARRY, E.soft(seg(T, 5.95, 6.2)) * (1 - E.soft(seg(T, 7.05, 7.35))));

        const w1 = walkSeg(T, 6.15, 6.95, HOME, AT);
        const w2 = walkSeg(T, 8.5, 9.3, AT, HOME);
        const ws = T < 7.5 ? w1 : w2;
        x = ws.x;
        gait = ws;
        if (T >= 8.5 && T < 9.3) {
          face = -1;
        }

        braceK = E.soft(seg(T, 6.95, 7.45));
        braceA = T >= 6.95 ? fade : 0;
        const push = E.soft(seg(T, 6.95, 7.3)) * (1 - E.soft(seg(T, 7.85, 8.05)));
        pose = mix(pose, P({ hF: lp([BRACE_MID[0] - 3, BRACE_MID[1] - 4], x, 0, 1), hB: lp([BRACE_MID[0] - 6, BRACE_MID[1] + 6], x, 0, 1), head: [10, -112], chest: [5, -88] }), push);
        straight = E.soft(seg(T, 7.3, 7.9));
        tickK = seg(T, 7.85, 8.25) * fade;
        pose = mix(pose, CHEER, E.soft(seg(T, 7.85, 8.3)) * (1 - E.soft(seg(T, 8.32, 8.6))));

        pileBack = seg(T, 8.9, 9.45);
        if (pileBack > 0) {
          plankA = pileBack;
        }
      }
      pose = legs(pose, gait.ph, gait.amp, { arms: false, stride: gait.stride });
      setStep(g, step);

      bench(g);
      plank(g, BENCH.x, BENCH.top - PLANK.h / 2, 0, plankA);
      for (let i = 0; i < 3; i++) {
        const a = taken[i] ? pileBack : 1;
        if (a <= 0) {
          continue;
        }
        g.save();
        g.globalAlpha *= a;
        crate(g, BENCH.x, BENCH.top - PLANK.h - (2 - i) * PILE.h, PILE.w, PILE.h, DEBT[i], 0);
        g.restore();
      }

      const k = 1 - straight;
      BASE_CRATES.forEach((s, i) => {
        crate(g, TOWER.x + sway * i * 1.2, -i * TOWER.h, TOWER.w, TOWER.h, s, sway * 0.01 * i, '#f1e3c4');
      });
      for (let i = 0; i < 3; i++) {
        if (!landed[i]) {
          continue;
        }
        const lvl = i + 2;
        const land = LAND(i);
        const bounce = Math.sin(Math.PI * seg(T, land, land + 0.18)) * 3;
        const top = i === 2;
        const dx = (LEAN[i] + (top ? slip * 9 : 0)) * k + sway * lvl * 2.2;
        const rot = (TILT[i] + (top ? slip * 0.1 : 0)) * k + sway * 0.02 * lvl;
        g.save();
        g.globalAlpha *= fade;
        crate(g, TOWER.x + dx, -lvl * TOWER.h - bounce, TOWER.w, TOWER.h, DEBT[i], rot);
        g.restore();
      }

      const J = fig(g, pose, x, 0, { sx: face, wave: S.wave, wt: S.wt });
      const hf = J.w.handF, hb = J.w.handB;
      const hand = [(hf[0] + hb[0]) / 2, (hf[1] + hb[1]) / 2];
      if (held >= 0) {
        crate(g, hand[0], hand[1] + 8, PILE.w, PILE.h, DEBT[held], 0);
      }
      if (flying >= 0) {
        const lvl = flying + 2;
        const p = arcPt([hand[0], hand[1] + 6], [TOWER.x + LEAN[flying], -lvl * TOWER.h], 46, E.soft(flyK));
        crate(g, p[0], p[1], lerp(PILE.w, TOWER.w, flyK), lerp(PILE.h, TOWER.h, flyK), DEBT[flying], lerp(0, TILT[flying], flyK) - Math.sin(Math.PI * flyK) * 0.25);
      }
      if (plankHeld) {
        plank(g, hand[0] + 12, hand[1] + 2, 0, 1);
      }
      if (braceA > 0) {
        const cx = lerp(hand[0] + 12, BRACE_MID[0], braceK);
        const cy = lerp(hand[1] + 2, BRACE_MID[1], braceK);
        plank(g, cx, cy, lerp(0, BRACE_ANG, braceK), braceA);
      }

      if (bang > 0) {
        const z = E.back(Math.min(1, bang * 1.4));
        g.save();
        g.translate(x + 12, -126);
        g.scale(z, z);
        text(g, '!', 0, 0, 16, C.redInk);
        g.restore();
      }
      if (sweat > 0 && sweat < 1) {
        g.save();
        g.globalAlpha *= 1 - sweat;
        const sx = x - 14, sy = -112 + sweat * 14;
        g.beginPath();
        g.moveTo(sx, sy - 5);
        g.quadraticCurveTo(sx + 3.2, sy, sx, sy + 2.2);
        g.quadraticCurveTo(sx - 3.2, sy, sx, sy - 5);
        inkFill(g, C.sky, 1.1, '#6b8fb3');
        g.restore();
      }
      if (sway !== 0) {
        const a = Math.abs(sway);
        for (let i = 0; i < 2; i++) {
          const yy = -100 - i * 10;
          g.save();
          g.globalAlpha *= a;
          ln(g, TOWER.x + 76 + i * 4, yy, TOWER.x + 84 + i * 4, yy - 3, 1.3, '#9a9a9a');
          g.restore();
        }
      }
      tickBadge(g, TOWER.x + TOWER.w / 2 + 6, -5 * TOWER.h - 4, tickK, 8);
      sparks(g, TOWER.x, -5 * TOWER.h - 6, seg(T, 7.85, 8.45), 16, 7, C.amber);

      const labels = [[BENCH.x, '1  ship fast'], [TOWER.x - 72, '2  it wobbles'], [TOWER.x + 82, '3  pay it down']];
      labels.forEach(([lx, s], i) => {
        text(g, s, lx, 18, 9.5, step === i + 1 ? C.ink : '#a8a8a8');
      });
    },
  };
})();
