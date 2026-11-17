// 404 state: a figure searches around a "404" signpost with a flashlight, finds nothing, shrugs and points home
// Load after stick.js. Use as <stick-scene scene="state-404" play="view"></stick-scene>.
(function () {
  const SC = (window.SCENES = window.SCENES || {});
  const R = window.RIG;
  const { C, E, P, mix, legs, walkSeg, fig, inkFill, rr, ln, text, seg, breathe, pulse, poly, sxv, lerp, floatText } = R;

  const POST = 40, BOARD = { x: 2, y: -164, w: 76, h: 36 };
  const HOME_SIGN = -150;
  const HOME = -70, PEEK = -14;
  const BEAM_LEN = 84, BEAM_HALF = 0.26;

  function signpost(g) {
    ln(g, POST, BOARD.y + BOARD.h, POST, 0, 4.4);
    ln(g, POST, BOARD.y + BOARD.h, POST, 0, 2.2, C.wood);
    rr(g, BOARD.x, BOARD.y, BOARD.w, BOARD.h, 4);
    inkFill(g, C.paper, 1.7);
    text(g, '404', BOARD.x + BOARD.w / 2, BOARD.y + 25, 17, C.ink);
  }
  function homeSign(g, glow) {
    const x = HOME_SIGN;
    ln(g, x, -52, x, 0, 3.6);
    ln(g, x, -52, x, 0, 1.6, C.wood);
    const y0 = -70, y1 = -50;
    poly(g, [[x - 26, (y0 + y1) / 2], [x - 16, y0], [x + 22, y0], [x + 22, y1], [x - 16, y1]], true);
    inkFill(g, glow > 0 ? `rgba(253,230,138,${glow.toFixed(3)})` : C.paper, 1.5);
    text(g, 'home', x + 3, y0 + 14, 9.5, C.ink);
  }
  function aimPose(base, a, reachK) {
    const r = lerp(24, 33, reachK);
    return P({ hF: [3 + Math.cos(a) * r, -88 + Math.sin(a) * r], hB: [-4, -52] }, base);
  }
  function flashlight(g, hand, ang, beam) {
    const c = Math.cos(ang), s = Math.sin(ang);
    const lens = [hand[0] + c * 7, hand[1] + s * 7];
    if (beam > 0) {
      const a0 = ang - BEAM_HALF, a1 = ang + BEAM_HALF;
      const grad = g.createRadialGradient(lens[0], lens[1], 2, lens[0], lens[1], BEAM_LEN);
      grad.addColorStop(0, `rgba(252,211,77,${(0.6 * beam).toFixed(3)})`);
      grad.addColorStop(1, 'rgba(253,230,138,0)');
      g.beginPath();
      g.moveTo(lens[0] - s * 2.6, lens[1] + c * 2.6);
      g.arc(lens[0], lens[1], BEAM_LEN, a0, a1);
      g.lineTo(lens[0] + s * 2.6, lens[1] - c * 2.6);
      g.closePath();
      g.fillStyle = grad;
      g.fill();
    }
    g.save();
    g.translate(hand[0], hand[1]);
    g.rotate(ang);
    rr(g, -4, -2.6, 10, 5.2, 1.5);
    inkFill(g, '#3a3a3a', 1.2);
    rr(g, 5, -3.6, 3.4, 7.2, 1);
    inkFill(g, beam > 0.2 ? C.butterHi : C.faint, 1.1);
    g.restore();
  }

  function idleLook(base, t) {
    const glance = pulse(t, 6.5, 2.2, 1.8);
    const look = pulse(t, 6.5, 4.6, 1.6);
    const aim = 0.55 - 0.4 * look + 0.15 * glance;
    let pose = aimPose(base, aim, look * 0.6);
    pose = mix(pose, P({ head: [-4, -116] }, pose), glance);
    pose = mix(pose, P({ head: [6, -115] }, pose), look);
    return { pose, aim };
  }

  SC['state-404'] = {
    dur: 7,
    width: 380,
    label: 'A stick figure searches around a 404 signpost with a flashlight, finds nothing, shrugs and points to a sign that says home.',
    draw(g, S) {
      const T = S.on ? S.u * this.dur : -1;
      const t = S.t;
      let x = HOME, gait = { ph: 0, amp: 0 }, sx = 1;
      let aim = 0.55, reachK = 0, beam = 0.35, homeGlow = 0, qK = 0;
      let pose = breathe(P({ hF: [12, -60], hB: [-4, -52] }), t);
      const rest = pose;
      if (T < 0) {
        const id = idleLook(rest, t);
        pose = id.pose;
        aim = id.aim;
      } else {
        const fade = 1 - seg(T, this.dur - 0.45, this.dur);
        const turnL = E.soft(seg(T, 0.3, 0.55)) * (1 - E.soft(seg(T, 1.35, 1.6)));
        const turnL2 = E.soft(seg(T, 5.05, 5.3)) * (1 - E.soft(seg(T, 6.65, 6.95)));
        sx = sxv(1 - 2 * Math.max(turnL, turnL2));
        const ws = T < 4 ? walkSeg(T, 2.3, 3.0, HOME, PEEK) : walkSeg(T, 6.0, 6.7, PEEK, HOME);
        x = ws.x;
        gait = ws;
        const up = E.soft(seg(T, 0, 0.3));
        const sweepL = E.soft(seg(T, 0.55, 1.35));
        const sweepR = E.soft(seg(T, 1.6, 2.3));
        const peek = E.soft(seg(T, 3.0, 3.3)) * (1 - E.soft(seg(T, 4.0, 4.25)));
        const shrug = E.back(seg(T, 4.2, 4.6)) * (1 - E.soft(seg(T, 4.9, 5.1)));
        const point = E.soft(seg(T, 5.3, 5.55)) * (1 - E.soft(seg(T, 6.0, 6.2)));
        aim = lerp(0.55, 0, up);
        if (T >= 0.55 && T < 1.35) {
          aim = lerp(0, -0.35 + Math.sin(sweepL * Math.PI * 2) * 0.22 + sweepL * 0.3, E.soft(seg(T, 0.55, 0.75)));
        }
        if (T >= 1.35 && T < 1.6) {
          aim = -0.05;
        }
        if (T >= 1.6 && T < 3.0) {
          aim = lerp(-0.05, 0.2, sweepR) - Math.sin(sweepR * Math.PI) * 0.45;
          aim = lerp(aim, 0.3, E.soft(seg(T, 2.3, 3.0)));
        }
        if (T >= 3.0) {
          aim = lerp(0.3, 0.32 + Math.sin(T * 5) * 0.12, peek);
        }
        if (T >= 5.1) {
          aim = lerp(0.3, 0.55, E.soft(seg(T, 5.1, 6.9)));
          if (point > 0) {
            aim = lerp(aim, -0.05, point);
          }
        }
        if (T >= 4.2) {
          aim = lerp(aim, -0.5, shrug);
        }
        reachK = Math.max(up * (1 - E.soft(seg(T, 4.0, 4.3))), peek);
        beam = lerp(0.35, 1, up * (1 - E.soft(seg(T, 4.1, 4.4))));
        pose = aimPose(pose, aim, reachK);
        pose = mix(pose, P({ chest: [6, -86], hip: [-2, -57], head: [16, -106], kF: [26, -30], kB: [10, -30] }, pose), peek);
        const shrugPose = P({ hF: [22, -90], hB: [-20, -90], head: [0, -118], chest: [0, -92], ef: 1, eb: 0.5 });
        pose = mix(pose, shrugPose, shrug);
        pose = mix(pose, P({ hF: [44, -88], hB: [-4, -54], head: [9, -116] }), point);
        const from = 1 - E.soft(seg(T, 0, 0.35));
        if (from > 0) {
          const id = idleLook(rest, t);
          pose = mix(pose, id.pose, from);
          aim = lerp(aim, id.aim, from);
        }
        qK = seg(T, 4.35, 5.25);
        homeGlow = E.soft(seg(T, 5.45, 5.7)) * (1 - E.soft(seg(T, 6.4, 6.9))) * fade;
      }
      pose = legs(pose, gait.ph, gait.amp, { arms: false, stride: gait.stride });

      signpost(g);
      homeSign(g, homeGlow);
      const J = fig(g, pose, x, 0, { sx, wave: S.wave, wt: S.wt });
      const worldAim = sx > 0 ? aim : Math.PI - aim;
      flashlight(g, J.w.handF, worldAim, beam);
      floatText(g, '?', J.w.head[0] - 14 * Math.sign(sx), J.w.head[1] - 14, qK, C.ink, 13);
    },
  };
})();
