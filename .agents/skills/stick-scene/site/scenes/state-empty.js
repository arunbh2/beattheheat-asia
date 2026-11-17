// Inbox zero: the figure tosses the last envelope into the archive box, a tick pops, and it leans back with a mug
// Load after stick.js. Use as <stick-scene scene="state-empty" play="view"></stick-scene>.
(function () {
  const SC = (window.SCENES = window.SCENES || {});
  const R = window.RIG;
  const { C, E, P, mix, legs, walkSeg, fig, inkFill, rr, ln, text, seg, breathe, pulse, sparks, tickBadge, arcPt, lerp, lp } = R;

  const TOP = -64;
  const TRAY = { x: -46, y: -76, w: 40, h: 12 };
  const BOX = { x: 96, y: -40, w: 56, h: 40 };
  const ME = -86, AT = -64;
  const ENV_IN = [TRAY.x + TRAY.w / 2, TRAY.y - 3];
  const ENV_OUT = [BOX.x + BOX.w / 2, BOX.y + 6];

  function table(g) {
    ln(g, -34, TOP, -38, 0, 2.2);
    ln(g, 32, TOP, 36, 0, 2.2);
    rr(g, -52, TOP - 5, 98, 5, 2);
    inkFill(g, C.wood, 1.5);
  }
  function trayBack(g) {
    rr(g, TRAY.x + 3, TRAY.y - 4, TRAY.w - 6, 6, 1.5);
    inkFill(g, C.chip, 1.2);
  }
  function trayFront(g) {
    rr(g, TRAY.x, TRAY.y, TRAY.w, TRAY.h, 2);
    inkFill(g, C.paper, 1.5);
    text(g, 'inbox', TRAY.x + TRAY.w / 2, TRAY.y + 9, 8.5, C.muted);
  }
  function box(g, bump) {
    const sq = Math.sin(Math.PI * bump) * 3;
    const y = BOX.y + sq, h = BOX.h - sq;
    rr(g, BOX.x, y, BOX.w, h, 3);
    inkFill(g, C.wood, 1.6);
    ln(g, BOX.x - 3, y, BOX.x + BOX.w + 3, y, 2.2);
    text(g, 'archive', BOX.x + BOX.w / 2, y + h / 2 + 4, 9, C.umber);
  }
  function envelope(g, x, y, rot) {
    g.save();
    g.translate(x, y);
    g.rotate(rot);
    rr(g, -10, -7, 20, 14, 1.5);
    inkFill(g, C.paper, 1.3);
    g.beginPath();
    g.moveTo(-9, -6);
    g.lineTo(0, 1);
    g.lineTo(9, -6);
    g.lineWidth = 1.1;
    g.strokeStyle = C.ink;
    g.stroke();
    g.restore();
  }
  function mug(g, h, tilt, steam, t) {
    g.save();
    g.translate(h[0], h[1]);
    g.rotate(tilt);
    rr(g, -2, -11, 10, 11, 2);
    inkFill(g, C.paper, 1.4);
    g.beginPath();
    g.arc(-2, -5.5, 3.2, Math.PI / 2, Math.PI * 1.5);
    g.lineWidth = 1.4;
    g.strokeStyle = C.ink;
    g.stroke();
    ln(g, -1, -9, 7, -9, 1.6, '#9a6b3c');
    g.restore();
    if (steam <= 0) {
      return;
    }
    for (let i = 0; i < 2; i++) {
      const k = (t * 0.45 + i * 0.5) % 1;
      const bx = h[0] + 1 + i * 4, by = h[1] - 14 - k * 16;
      g.save();
      g.globalAlpha *= steam * Math.sin(Math.PI * k) * 0.8;
      g.beginPath();
      for (let j = 0; j <= 6; j++) {
        const yy = by - j * 1.8;
        const xx = bx + Math.sin(j * 1.1 + t * 2 + i) * 1.8;
        if (j === 0) {
          g.moveTo(xx, yy);
        } else {
          g.lineTo(xx, yy);
        }
      }
      g.lineWidth = 1.3;
      g.strokeStyle = C.soft;
      g.stroke();
      g.restore();
    }
  }

  SC['state-empty'] = {
    dur: 6,
    width: 380,
    label: 'A stick figure tosses the last envelope from its inbox tray into an archive box, a tick pops up, and it leans back with a mug of coffee.',
    draw(g, S) {
      const T = S.on ? S.u * this.dur : -1;
      const t = S.t;
      const HOLD = P({ hF: [12, -60], hB: [12, -72] });
      const SIP = P({ hF: [12, -62], hB: [15, -96], head: [-3, -116], chest: [-2, -90] });
      const LEAN = P({ hF: [10, -62], hB: [12, -94], head: [-13, -112], chest: [-8, -88], hip: [-1, -59] });
      let pose = breathe(HOLD, t);
      let x = ME, gait = { ph: 0, amp: 0 };
      let envK = -1, envPos = null, envRot = 0, bump = 0, tickK = 0, sipK = 0, steam = 0.6, spark = 0;
      if (T < 0) {
        sipK = pulse(t, 6, 2.4, 2);
        pose = mix(pose, breathe(SIP, t), sipK);
        pose = mix(pose, P({ head: [5, -116] }, pose), pulse(t, 6, 4.8, 1) * 0.6);
      } else {
        const fade = 1 - seg(T, this.dur - 0.45, this.dur);
        const ws = T < 1.8 ? walkSeg(T, 0.3, 0.7, ME, AT) : walkSeg(T, 2.2, 2.7, AT, ME);
        x = ws.x;
        gait = ws;
        const reach = E.soft(seg(T, 0.7, 1.0));
        const wind = E.soft(seg(T, 0.98, 1.2));
        const flick = E.soft(seg(T, 1.2, 1.42));
        const settle = E.soft(seg(T, 1.8, 2.3));
        const lean = E.soft(seg(T, 2.9, 3.4)) * (1 - E.soft(seg(T, 5.0, 5.6)));
        const GRAB = P({ hF: lp([ENV_IN[0] - 4, ENV_IN[1] - 2], AT, 0, 1), hB: [12, -72], head: [9, -114], chest: [4, -89] });
        const WIND = P({ hF: [-28, -60], hB: [12, -72], head: [5, -116], chest: [-2, -90], ef: 0 });
        const FLICK = P({ hF: [36, -100], hB: [12, -72], head: [9, -116], chest: [3, -90] });
        pose = mix(pose, GRAB, reach);
        pose = mix(pose, WIND, wind);
        pose = mix(pose, FLICK, flick);
        pose = mix(pose, breathe(HOLD, t), settle);
        pose = mix(pose, breathe(LEAN, t), lean);
        if (T < 1.0) {
          const drop = E.in(seg(T, 0, 0.4));
          const bounce = Math.sin(Math.PI * seg(T, 0.4, 0.6)) * 3;
          envPos = [ENV_IN[0], lerp(-160, ENV_IN[1], drop) - bounce];
          envRot = lerp(-0.5, -0.08, drop);
        } else if (T < 1.42) {
          envK = 1;
        } else if (T < 2.25) {
          const k = seg(T, 1.42, 2.25);
          envPos = arcPt([AT + 32, -90], ENV_OUT, 60, k);
          envRot = k * 5;
        }
        bump = seg(T, 2.25, 2.55);
        spark = seg(T, 2.25, 2.85);
        tickK = seg(T, 2.5, 2.9) * fade;
        sipK = lean;
        steam = lerp(0.6, 1, lean);
      }
      pose = legs(pose, gait.ph, gait.amp, { arms: false, stride: gait.stride });

      table(g);
      trayBack(g);
      if (envPos && T < 1.0) {
        envelope(g, envPos[0], envPos[1], envRot);
      }
      trayFront(g);
      box(g, bump);
      if (envPos && T >= 1.42) {
        g.save();
        g.beginPath();
        g.rect(-200, -200, 400, 200 + BOX.y);
        g.clip();
        envelope(g, envPos[0], envPos[1], envRot);
        g.restore();
      }
      const J = fig(g, pose, x, 0, { wave: S.wave, wt: S.wt });
      if (envK === 1) {
        envelope(g, J.w.handF[0] + 2, J.w.handF[1] - 3, -0.2);
      }
      const mh = J.w.handB;
      mug(g, [mh[0] - 1, mh[1] + 4], -0.35 * sipK, steam * (1 - sipK * 0.6), t);
      sparks(g, ENV_OUT[0], BOX.y - 6, spark, 14, 5);
      tickBadge(g, TRAY.x + TRAY.w + 6, TRAY.y - 14, tickK, 8);
    },
  };
})();
