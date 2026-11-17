// lesson: binary search — check the middle card, drop the half that can't hold 42, find it in 3 looks
(function () {
  const SC = (window.SCENES = window.SCENES || {});
  const R = window.RIG;
  const { C, E, P, mix, legs, walkSeg, fig, inkFill, rr, ln, text, seg, breathe, pulse, lp, sparks, tickBadge, bubble } = R;

  const GREEN = '#dafbe1', GREEN_INK = '#1a7f37';
  const NUMS = [3, 8, 15, 23, 31, 42, 57, 61, 78, 90];
  const CX = (i) => -144 + i * 32;
  const TOP = -36, CW = 24, CH = 32;
  const TABLE = { x0: -166, x1: 166 };
  const SIGN = { x: -242, y: -134, w: 52, h: 28 };
  const CNT = { x: 236, y: -134, w: 64, h: 40 };
  const HOME = -196;
  const LOOKS = [
    { i: 4, at: CX(4) - 14 },
    { i: 7, at: CX(7) - 14 },
    { i: 5, at: CX(5) - 14 },
  ];

  const REST = P({ hF: [12, -60], hB: [-4, -52] });
  const CHIN = P({ hF: [10, -96], head: [7, -116], hB: [-4, -54] });
  const LIFT = P({ hF: [30, -104], hB: [-4, -54], head: [4, -116] });
  const CHEER = P({ hF: [14, -132], hB: [-10, -130], head: [3, -118] });

  function grabPose(i, x) {
    return P({ hF: lp([CX(i) - CW / 2 - 1, TOP - CH / 2], x, 0, 1), hB: [-4, -54], head: [9, -114], chest: [3, -90], ef: 0.35 });
  }

  function card(g, cx, by, n, o) {
    g.save();
    g.translate(cx, by);
    g.globalAlpha *= 1 - 0.62 * o.grey;
    g.scale(o.s, o.s * (1 - 0.6 * o.tip));
    rr(g, -CW / 2, -CH, CW, CH, 3);
    if (o.green > 0) {
      inkFill(g, C.paper, 1.6);
      g.save();
      g.globalAlpha *= o.green;
      rr(g, -CW / 2, -CH, CW, CH, 3);
      inkFill(g, GREEN, 1.8, GREEN_INK);
      g.restore();
    } else {
      inkFill(g, C.paper, 1.6);
    }
    text(g, String(n), 0, -CH / 2 + 3.5, 10, o.green > 0.5 ? GREEN_INK : C.ink);
    g.restore();
  }

  function table(g) {
    ln(g, TABLE.x0 + 12, TOP + 4, TABLE.x0 + 6, 0, 2.2);
    ln(g, TABLE.x1 - 12, TOP + 4, TABLE.x1 - 6, 0, 2.2);
    ln(g, TABLE.x0 + 10, -12, TABLE.x1 - 10, -12, 1.4, '#bdbdbd');
    rr(g, TABLE.x0, TOP, TABLE.x1 - TABLE.x0, 5, 2);
    inkFill(g, C.wood, 1.5);
  }

  function sign(g) {
    ln(g, SIGN.x, SIGN.y + SIGN.h, SIGN.x, 0, 2.2);
    rr(g, SIGN.x - SIGN.w / 2, SIGN.y, SIGN.w, SIGN.h, 4);
    inkFill(g, C.butter, 1.6);
    text(g, 'find 42', SIGN.x, SIGN.y + 18.5, 11, C.ink);
  }

  function counter(g, n, pop, a) {
    ln(g, CNT.x, CNT.y + CNT.h, CNT.x, 0, 2.2);
    rr(g, CNT.x - CNT.w / 2, CNT.y, CNT.w, CNT.h, 4);
    inkFill(g, C.paper, 1.6);
    g.save();
    g.globalAlpha *= a;
    const z = 1 + Math.sin(Math.PI * pop) * 0.25;
    g.translate(CNT.x, CNT.y + 17);
    g.scale(z, z);
    text(g, `${n} look${n === 1 ? '' : 's'}`, 0, 0, 11, C.ink);
    g.restore();
    text(g, '10 cards', CNT.x, CNT.y + 31, 8.5, C.muted);
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

  SC['lesson-binary-search'] = {
    dur: 9.4,
    width: 560,
    label: 'A stick figure looks for 42 in a row of sorted cards: it checks the middle card, drops the half that is too small, then the half that is too big, and finds 42 in 3 looks instead of 10.',
    draw(g, S) {
      const T = S.on ? S.u * this.dur : -1;
      const t = S.t;
      let x = HOME, face = 1, gait = { ph: 0, amp: 0 };
      let pose = breathe(REST, t);
      let step = 0, held = -1, looks = 0, pop = 0, cntA = 1, greenK = 0, tickK = 0, said = ['', 0];
      const grey = NUMS.map(() => 0);

      if (T < 0) {
        pose = mix(pose, CHIN, pulse(t, 6, 2, 2.2));
      } else {
        step = T < 3.0 ? 1 : T < 5.45 ? 2 : T < 8.25 ? 3 : 0;
        const back = seg(T, 8.25, 8.9);

        const w = [
          walkSeg(T, 0.15, 1.15, HOME, LOOKS[0].at),
          walkSeg(T, 3.05, 3.65, LOOKS[0].at, LOOKS[1].at),
          walkSeg(T, 5.5, 6.0, LOOKS[1].at, LOOKS[2].at),
          walkSeg(T, 8.25, 9.2, LOOKS[2].at, HOME),
        ];
        const ws = T < 3.05 ? w[0] : T < 5.5 ? w[1] : T < 8.25 ? w[2] : w[3];
        x = ws.x;
        gait = ws;
        if ((T >= 5.5 && T < 6.0) || (T >= 8.25 && T < 9.2)) {
          face = -1;
        }

        const beats = [
          { at: 1.15, down: 2.35, i: 0, word: 'too small' },
          { at: 3.65, down: 4.85, i: 1, word: 'too big' },
          { at: 6.0, down: 7.0, i: 2, word: 'found it!' },
        ];
        beats.forEach((b) => {
          const L = LOOKS[b.i];
          const reachK = E.soft(seg(T, b.at, b.at + 0.25)) * (1 - E.soft(seg(T, b.down + 0.3, b.down + 0.5)));
          const liftK = E.soft(seg(T, b.at + 0.25, b.at + 0.6)) * (1 - E.soft(seg(T, b.down, b.down + 0.3)));
          pose = mix(pose, grabPose(L.i, x), reachK);
          pose = mix(pose, LIFT, liftK);
          if (T >= b.at + 0.25 && T < b.down + 0.3) {
            held = L.i;
          }
          if (T >= b.at + 0.45) {
            looks = b.i + 1;
          }
          pop = Math.max(pop, seg(T, b.at + 0.45, b.at + 0.75));
          const k = seg(T, b.at + 0.6, b.at + 0.8) * (1 - seg(T, b.down - 0.1, b.down + 0.05));
          if (k > 0) {
            said = [b.word, k];
          }
        });

        for (let i = 0; i <= 4; i++) {
          grey[i] = E.soft(seg(T, 2.7 + i * 0.07, 3.0 + i * 0.07));
        }
        for (let i = 7; i <= 9; i++) {
          grey[i] = E.soft(seg(T, 5.15 + (i - 7) * 0.07, 5.45 + (i - 7) * 0.07));
        }
        for (let i = 0; i < grey.length; i++) {
          grey[i] *= 1 - back;
        }
        greenK = seg(T, 6.5, 6.75) * (1 - back);
        tickK = seg(T, 6.7, 7.0) * (1 - back);

        const cheer = E.back(seg(T, 7.4, 7.95)) * (1 - E.soft(seg(T, 7.95, 8.2)));
        pose = mix(pose, CHEER, cheer);

        cntA = Math.abs(1 - 2 * back);
        if (back >= 0.5) {
          looks = 0;
        }
      }
      pose = legs(pose, gait.ph, gait.amp, { arms: false, stride: gait.stride });
      setStep(g, step);

      sign(g);
      counter(g, looks, pop, cntA);
      const J = fig(g, pose, x, 0, { sx: face, wave: S.wave, wt: S.wt });
      table(g);
      NUMS.forEach((n, i) => {
        if (i === held) {
          return;
        }
        card(g, CX(i), TOP, n, { grey: grey[i], tip: grey[i], green: i === 5 ? greenK : 0, s: 1 });
        if (i === 5) {
          tickBadge(g, CX(i) + CW / 2, TOP - CH, tickK, 6.5, GREEN, GREEN_INK);
        }
      });
      if (held >= 0) {
        const hand = J.w.handF;
        const s = 1 + 0.15 * seg(-hand[1], -TOP + CH / 2, 91);
        const cx = hand[0] + (CW / 2 + 1) * s, by = hand[1] + (CH / 2) * s;
        card(g, cx, by, NUMS[held], { grey: 0, tip: 0, green: held === 5 ? greenK : 0, s });
        if (held === 5) {
          tickBadge(g, cx + (CW / 2) * s, by - CH * s, tickK, 6.5, GREEN, GREEN_INK);
        }
      }

      sparks(g, CX(5) + 10, TOP - CH - 10, seg(T, 7.5, 8.1), 14, 5, GREEN_INK);
      bubble(g, x - 26, -124, said[0], said[1], { tail: 26 });

      const labels = [[-170, '1  look in the middle'], [0, '2  drop half'], [170, '3  found it']];
      labels.forEach(([lx, s], i) => {
        text(g, s, lx, 18, 9.5, step === i + 1 ? C.ink : '#a8a8a8');
      });
    },
  };
})();
