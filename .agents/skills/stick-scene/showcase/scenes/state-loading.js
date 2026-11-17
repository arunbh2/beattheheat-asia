// Loading state: the figure turns a crank, a progress bar fills, a bell dings, the bar resets, forever
// Load after stick.js. Use as <stick-scene scene="state-loading"></stick-scene>.
(function () {
  const SC = (window.SCENES = window.SCENES || {});
  const R = window.RIG;
  const { C, E, P, fig, inkFill, rr, ln, text, seg, breathe, pulse, lp, sparks, circle, tw, TAU } = R;

  const M = { x: -40, y: -122, w: 116, h: 86 };
  const AXLE = [M.x - 9, M.y + 50];
  const CRANK_R = 12;
  const BAR = { x: M.x + 12, y: M.y + 32, w: M.w - 24, h: 12 };
  const GEAR = [M.x + M.w - 24, M.y + 66];
  const BELL = [M.x + M.w - 22, M.y];
  const ME = -76;
  const LOOP = 4.6, FILL = 4.0;

  function gear(g, x, y, a) {
    g.save();
    g.translate(x, y);
    g.rotate(a);
    g.beginPath();
    for (let i = 0; i < 16; i++) {
      const ang = (i / 16) * TAU, r = i % 2 ? 7 : 10;
      g.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
    }
    g.closePath();
    inkFill(g, C.butterSoft, 1.2);
    circle(g, 0, 0, 2.4);
    inkFill(g, C.paper, 1);
    g.restore();
  }
  function bell(g, wig) {
    g.save();
    g.translate(BELL[0], BELL[1]);
    g.rotate(Math.sin(wig * Math.PI * 6) * 0.35 * (1 - wig));
    g.beginPath();
    g.moveTo(-8, 0);
    g.quadraticCurveTo(-7, -12, 0, -12);
    g.quadraticCurveTo(7, -12, 8, 0);
    g.closePath();
    inkFill(g, wig > 0 && wig < 1 ? C.butterHi : C.butter, 1.4);
    circle(g, 0, -13.5, 1.8);
    inkFill(g, C.ink, 1);
    g.restore();
  }
  function machine(g, fill, flash, a, t) {
    ln(g, M.x + 16, M.y + M.h, M.x + 10, 0, 2.2);
    ln(g, M.x + M.w - 16, M.y + M.h, M.x + M.w - 10, 0, 2.2);
    rr(g, M.x, M.y, M.w, M.h, 6);
    inkFill(g, C.paper, 1.7);
    const dots = '.'.repeat(Math.floor(t * 2.5) % 4);
    const x0 = M.x + M.w / 2 - (tw(g, 'loading...', 9.5)) / 2;
    text(g, 'loading' + dots, x0, M.y + 20, 9.5, C.muted, 'left');
    rr(g, BAR.x, BAR.y, BAR.w, BAR.h, BAR.h / 2);
    inkFill(g, C.chip, 1.4);
    if (fill > 0.01) {
      g.save();
      g.globalAlpha *= flash;
      rr(g, BAR.x + 2, BAR.y + 2, Math.max(BAR.h - 4, (BAR.w - 4) * fill), BAR.h - 4, (BAR.h - 4) / 2);
      g.fillStyle = C.butterHi;
      g.fill();
      g.restore();
    }
    ln(g, M.x + 14, M.y + 62, M.x + 50, M.y + 62, 2, C.faint);
    ln(g, M.x + 14, M.y + 70, M.x + 38, M.y + 70, 2, C.faint);
    gear(g, GEAR[0], GEAR[1], -a * 0.9);
    rr(g, AXLE[0], AXLE[1] - 3, 9, 6, 1.5);
    inkFill(g, C.steel, 1.2);
  }

  SC['state-loading'] = {
    dur: LOOP,
    width: 360,
    loopOnly: true,
    label: 'A stick figure turns a crank on a small machine while a progress bar fills up, a bell dings, and the bar starts again.',
    draw(g, S) {
      const t = S.t;
      const l = ((t % LOOP) + LOOP) % LOOP;
      const a = t * TAU * 0.7;
      const knob = [AXLE[0] + Math.cos(a) * CRANK_R, AXLE[1] + Math.sin(a) * CRANK_R];
      const k = seg(l, 0, FILL);
      const fill = k * 0.6 + E.io(k) * 0.4;
      const flash = 1 - seg(l, LOOP - 0.25, LOOP);
      const ding = seg(l, FILL, FILL + 0.55);
      const look = pulse(t, LOOP * 2, FILL - 0.3, 1.2);
      const sway = Math.cos(a) * 1.6;
      let pose = breathe(P({
        hF: lp(knob, ME, 0, 1),
        hB: [-4, -54],
        chest: [2 + sway, -90],
        hip: [sway * 0.4, -59],
        head: [6 + sway, -115],
        fF: [8, -2.5],
      }), t);
      pose.head = [pose.head[0] + look * 4, pose.head[1] - look * 3];

      machine(g, fill, flash, a, t);
      bell(g, ding);
      ln(g, AXLE[0], AXLE[1], knob[0], knob[1], 3);
      circle(g, AXLE[0], AXLE[1], 2.6);
      inkFill(g, C.paper, 1.2);
      circle(g, knob[0], knob[1], 3.4);
      inkFill(g, C.wood, 1.2);
      fig(g, pose, ME, 0, { wave: S.wave, wt: S.wt });
      sparks(g, BELL[0], BELL[1] - 16, ding, 12, 5, C.amber);
    },
  };
})();
