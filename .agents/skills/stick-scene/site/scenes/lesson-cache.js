// lesson: caching — the first request walks all the way to the database, a copy goes on the cache shelf, the next one is instant
(function () {
  const SC = (window.SCENES = window.SCENES || {});
  const R = window.RIG;
  const { C, E, P, mix, legs, walkSeg, fig, inkFill, rr, ln, text, seg, breathe, pulse, lp, sparks, tickBadge, pill, arcPt, circle, lerp } = R;

  const GREEN = '#dafbe1', GREEN_INK = '#1a7f37', MISS = '#ffebe9', MISS_INK = '#cf222e';
  const DESK = { x0: -262, x1: -196, top: -46 };
  const TICKET = { x: -238, w: 42, h: 18 };
  const DFILE = [-207, DESK.top];
  const TIMER = [-229, -104];
  const SHELF = { x0: -154, x1: -108, top: -80 };
  const SFILE = [-131, SHELF.top];
  const DB = { x: 176, y: -158, w: 88 };
  const DRAWER = { y: -94, h: 34 };
  const HOME = -170, AT_DB = 150;

  const REST = P({ hF: [12, -60], hB: [-4, -52] });
  const CHIN = P({ hF: [10, -96], head: [7, -116], hB: [-4, -54] });
  const READ = P({ hF: [12, -60], hB: [-4, -52], head: [10, -112], chest: [4, -89] });
  const CARRY = P({ hF: [18, -72], hB: [-4, -54], head: [6, -116] });
  const TOSS = P({ hF: [30, -70], hB: [-4, -54], head: [9, -113], chest: [4, -89] });
  const NOD = P({ hF: [12, -60], hB: [-4, -52], head: [8, -112] });
  // The two walks are stretched by `extra` seconds; every other beat keeps its length and just shifts later.
  const SLOW = [[1.7, 2.8, 0.4], [3.35, 4.55, 0.4]];
  function beatTime(tn) {
    let off = 0;
    for (const [a, b, extra] of SLOW) {
      if (tn < a + off) {
        return tn - off;
      }
      if (tn < b + off + extra) {
        return a + ((tn - a - off) * (b - a)) / (b - a + extra);
      }
      off += extra;
    }
    return tn - off;
  }
  // Speeds up, cruises, slows down: a lower top speed than E.soft over the same time, so the long walks stay a walk.
  const RAMP = 0.2;
  function cruise(k) {
    const up = (q) => q / 2 - (RAMP / (2 * Math.PI)) * Math.sin((Math.PI * q) / RAMP);
    const total = 1 - RAMP;
    if (k <= RAMP) {
      return up(k) / total;
    }
    if (k >= 1 - RAMP) {
      return 1 - up(1 - k) / total;
    }
    return (RAMP / 2 + (k - RAMP)) / total;
  }

  function file(g, cx, by, s, fill, a) {
    if (a <= 0) {
      return;
    }
    g.save();
    g.globalAlpha *= a;
    g.translate(cx, by);
    g.scale(s, s);
    g.beginPath();
    g.moveTo(-8, 0);
    g.lineTo(-8, -20);
    g.lineTo(3, -20);
    g.lineTo(8, -15);
    g.lineTo(8, 0);
    g.closePath();
    inkFill(g, fill, 1.4);
    ln(g, 3, -20, 3, -15, 1.1);
    ln(g, 3, -15, 8, -15, 1.1);
    text(g, '#7', 0, -5, 7.5, C.ink);
    g.restore();
  }

  function desk(g) {
    ln(g, DESK.x0 + 8, DESK.top + 4, DESK.x0 + 4, 0, 2.2);
    ln(g, DESK.x1 - 8, DESK.top + 4, DESK.x1 - 4, 0, 2.2);
    rr(g, DESK.x0, DESK.top, DESK.x1 - DESK.x0, 5, 2);
    inkFill(g, C.wood, 1.5);
  }

  function ticket(g, k, a, tickK) {
    if (k <= 0 || a <= 0) {
      return;
    }
    const cx = lerp(-300, TICKET.x, E.out3(k));
    g.save();
    g.globalAlpha *= a * Math.min(1, k * 3);
    rr(g, cx - TICKET.w / 2, DESK.top - TICKET.h, TICKET.w, TICKET.h, 3);
    inkFill(g, C.paper, 1.5);
    text(g, 'user #7', cx, DESK.top - 6, 8.5, C.ink);
    tickBadge(g, cx - TICKET.w / 2 + 2, DESK.top - TICKET.h - 2, tickK, 6, GREEN, GREEN_INK);
    g.restore();
  }

  function shelf(g) {
    ln(g, SHELF.x0 + 4, SHELF.top + 4, SHELF.x0, 0, 2.2);
    ln(g, SHELF.x1 - 4, SHELF.top + 4, SHELF.x1, 0, 2.2);
    rr(g, SHELF.x0 + 2, -38, SHELF.x1 - SHELF.x0 - 4, 4, 1.5);
    inkFill(g, C.wood, 1.3);
    rr(g, SHELF.x0 - 2, SHELF.top, SHELF.x1 - SHELF.x0 + 4, 5, 2);
    inkFill(g, C.wood, 1.5);
    text(g, 'cache', (SHELF.x0 + SHELF.x1) / 2, -52, 9, C.muted);
  }

  function database(g, open, t) {
    const x = DB.x, w = DB.w;
    rr(g, x, DB.y, w, -DB.y, 4);
    inkFill(g, C.steel, 1.7);
    ln(g, x, DB.y + 20, x + w, DB.y + 20, 1.3);
    text(g, 'database', x + w / 2 - 6, DB.y + 14, 9.5, C.ink);
    for (let i = 0; i < 2; i++) {
      circle(g, x + w - 14 + i * 6, DB.y + 10, 1.8);
      g.fillStyle = (Math.floor(t * 2.5 + i) % 2) ? '#8fd19e' : '#cfcfcf';
      g.fill();
    }
    [-134, DRAWER.y, -54].forEach((y, i) => {
      rr(g, x + 6, y, w - 12, DRAWER.h, 3);
      inkFill(g, C.paper, 1.3);
      rr(g, x + w / 2 - 12, y + 8, 24, 7, 1.5);
      inkFill(g, '#f0f0f0', 1);
      ln(g, x + w / 2 - 8, y + 25, x + w / 2 + 8, y + 25, 2.4);
      if (i === 1 && open > 0) {
        const p = open * 18;
        rr(g, x - p, y + 2, p + 6, DRAWER.h - 4, 2);
        inkFill(g, C.paper, 1.4);
        ln(g, x - p - 3, y + 10, x - p - 3, y + DRAWER.h - 10, 2.4);
        file(g, x - p + 9, y + 6, 0.8, C.paper, open);
      }
    });
  }

  function timer(g, s, col, a) {
    if (a <= 0) {
      return;
    }
    g.save();
    g.globalAlpha *= a;
    const [cx, cy] = TIMER;
    rr(g, cx - 24, cy - 9, 48, 18, 9);
    inkFill(g, C.paper, 1.3);
    circle(g, cx - 13, cy + 1, 5);
    inkFill(g, C.paper, 1.3);
    ln(g, cx - 13, cy - 4, cx - 13, cy - 7, 1.4);
    ln(g, cx - 13, cy + 1, cx - 11, cy - 2, 1.2);
    text(g, s, cx + 6, cy + 3.5, 9.5, col);
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

  SC['lesson-cache'] = {
    dur: 9.4,
    width: 560,
    label: 'A request for user 7 finds the cache shelf empty, so a stick figure walks all the way to the database and back in 1.2 seconds, keeps a copy on the cache shelf, and answers the next request for user 7 from the shelf in 0.01 seconds.',
    draw(g, S) {
      const T = S.on ? beatTime(S.u * this.dur) : -1;
      const t = S.t;
      let x = HOME, face = 1, gait = { ph: 0, amp: 0 };
      let pose = breathe(REST, t);
      let step = 0, tk1 = 0, tk1A = 1, tk1Tick = 0, tk2 = 0, tk2A = 1, tk2Tick = 0;
      let open = 0, carry = '', toss1 = 0, toss2 = 0, desk1A = 0, desk2A = 0, shelfA = 0, missK = 0, hitK = 0;
      let timerS = '', timerCol = C.ink, timerA = 0;

      if (T < 0) {
        pose = mix(pose, CHIN, pulse(t, 6, 2, 2.2));
      } else {
        step = T < 4.8 ? 1 : T < 6.1 ? 2 : T < 7.9 ? 3 : 0;
        const reset = seg(T, 7.9, 8.4);

        const w1 = walkSeg(T, 1.7, 2.8, HOME, AT_DB, null, cruise);
        const w2 = walkSeg(T, 3.35, 4.55, AT_DB, HOME, null, cruise);
        const ws = T < 3.2 ? w1 : w2;
        x = ws.x;
        gait = ws;
        if ((T >= 0.35 && T < 0.95) || (T >= 3.35 && T < 5.05) || (T >= 6.95 && T < 8.0)) {
          face = -1;
        }

        tk1 = seg(T, 0.1, 0.45);
        tk1A = 1 - seg(T, 5.7, 6.0);
        pose = mix(pose, READ, E.soft(seg(T, 0.4, 0.6)) * (1 - E.soft(seg(T, 0.8, 0.95))));
        const reachEmpty = E.soft(seg(T, 1.0, 1.25)) * (1 - E.soft(seg(T, 1.4, 1.6)));
        pose = mix(pose, P({ hF: lp([SFILE[0] - 4, SFILE[1] - 8], x, 0, 1), hB: [-4, -54], head: [9, -113], chest: [3, -90] }), reachEmpty);
        missK = seg(T, 1.1, 1.3) * (1 - seg(T, 1.55, 1.7));

        open = E.soft(seg(T, 2.75, 3.0)) * (1 - E.soft(seg(T, 3.2, 3.45)));
        const reachDb = E.soft(seg(T, 2.8, 3.05)) * (1 - E.soft(seg(T, 3.1, 3.3)));
        pose = mix(pose, P({ hF: lp([DB.x - 18 + 9, DRAWER.y + 2], x, 0, 1), hB: [-4, -54], head: [9, -113], chest: [3, -90] }), reachDb);
        const carryK = E.soft(seg(T, 3.1, 3.3)) * (1 - E.soft(seg(T, 4.55, 4.7)));
        pose = mix(pose, CARRY, carryK);
        if (T >= 3.05 && T < 4.65) {
          carry = 'db';
        }
        pose = mix(pose, TOSS, E.soft(seg(T, 4.55, 4.7)) * (1 - E.soft(seg(T, 4.85, 5.0))));
        toss1 = seg(T, 4.65, 4.85);
        desk1A = (T >= 4.85 ? 1 : 0) * tk1A;
        tk1Tick = seg(T, 4.85, 5.1);

        timerA = seg(T, 1.3, 1.5) * (1 - seg(T, 5.7, 6.0));
        timerS = `${lerp(0, 1.2, seg(T, 1.5, 4.85)).toFixed(1)}s`;
        timerCol = T >= 4.85 ? MISS_INK : C.ink;

        if (T >= 4.9 && T < 5.4) {
          carry = 'copy';
        }
        const reachShelf = E.soft(seg(T, 5.05, 5.35)) * (1 - E.soft(seg(T, 5.5, 5.75)));
        pose = mix(pose, P({ hF: lp([SFILE[0] - 6, SFILE[1] - 10], x, 0, 1), hB: [-4, -54], head: [9, -113], chest: [3, -90] }), reachShelf);
        shelfA = (T >= 5.4 ? 1 : 0) * (1 - reset);

        tk2 = seg(T, 6.15, 6.5);
        tk2A = 1 - reset;
        const grab = E.soft(seg(T, 6.6, 6.8)) * (1 - E.soft(seg(T, 6.85, 6.95)));
        pose = mix(pose, P({ hF: lp([SFILE[0] - 6, SFILE[1] - 10], x, 0, 1), hB: [-4, -54], head: [9, -113], chest: [3, -90] }), grab);
        if (T >= 6.8 && T < 7.05) {
          carry = 'copy';
        }
        hitK = seg(T, 6.75, 6.95) * (1 - seg(T, 7.6, 7.85));
        pose = mix(pose, TOSS, E.soft(seg(T, 6.95, 7.05)) * (1 - E.soft(seg(T, 7.2, 7.35))));
        toss2 = seg(T, 7.05, 7.2);
        desk2A = (T >= 7.2 ? 1 : 0) * tk2A;
        tk2Tick = seg(T, 7.2, 7.45);
        pose = mix(pose, NOD, E.soft(seg(T, 7.35, 7.5)) * (1 - E.soft(seg(T, 7.6, 7.8))));
        if (T >= 6.1) {
          timerA = seg(T, 7.2, 7.35) * (1 - reset);
          timerS = '0.01s';
          timerCol = GREEN_INK;
        }
      }
      pose = legs(pose, gait.ph, gait.amp, { arms: false, stride: gait.stride });
      setStep(g, step);

      desk(g);
      shelf(g);
      database(g, open, t);
      timer(g, timerS, timerCol, timerA);
      ticket(g, tk1, tk1A, tk1Tick);
      ticket(g, tk2, tk2A, tk2Tick);
      file(g, DFILE[0], DFILE[1], 1, C.paper, desk1A);
      file(g, DFILE[0], DFILE[1], 1, C.butter, desk2A);
      file(g, SFILE[0], SFILE[1], 1, C.butter, shelfA);

      const J = fig(g, pose, x, 0, { sx: face, wave: S.wave, wt: S.wt });
      const hand = J.w.handF;
      if (carry) {
        file(g, hand[0] + face * 3, hand[1] + 10, 0.9, carry === 'db' ? C.paper : C.butter, 1);
      }
      [[toss1, C.paper], [toss2, C.butter]].forEach(([k, col]) => {
        if (k <= 0 || k >= 1) {
          return;
        }
        const p = arcPt([hand[0], hand[1] + 10], DFILE, 14, E.soft(k));
        file(g, p[0], p[1], 0.9 + 0.1 * k, col, 1);
      });

      if (missK > 0) {
        g.save();
        g.globalAlpha *= missK;
        pill(g, SFILE[0], SFILE[1] - 16, 'miss', MISS, MISS_INK, 8.5);
        g.restore();
      }
      if (hitK > 0) {
        g.save();
        g.globalAlpha *= hitK;
        pill(g, SFILE[0], SFILE[1] - 34, 'hit', GREEN, GREEN_INK, 8.5);
        g.restore();
      }
      sparks(g, SFILE[0], SFILE[1] - 26, seg(T, 5.4, 5.95), 12, 5, C.amber);

      const labels = [[-205, '1  miss'], [-50, '2  keep a copy'], [95, '3  hit']];
      labels.forEach(([lx, s], i) => {
        text(g, s, lx, 18, 9.5, step === i + 1 ? C.ink : '#a8a8a8');
      });
    },
  };
})();
