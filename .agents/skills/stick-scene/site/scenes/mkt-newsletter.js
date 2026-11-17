// Newsletter sign-up: the figure writes its email on a card, posts it, the flag pops up and a welcome plane flies back
// Load after stick.js. Use as <stick-scene scene="mkt-newsletter" play="view"></stick-scene>.
(function () {
  const SC = (window.SCENES = window.SCENES || {});
  const R = window.RIG;
  const { C, E, P, mix, legs, walkSeg, fig, inkFill, rr, ln, text, seg, breathe, pulse, lp, sparks, plane, circle, lerp, sxv, typed, pole } = R;

  const BOX = { x: 72, y: -102, w: 62, h: 32 };
  const DOOR = [BOX.x, BOX.y + 18];
  const FLAG = [BOX.x + BOX.w - 8, BOX.y + 11];
  const HOME = -116, AT = 38;
  const FLAG_RED = '#f28b82';
  const EMAIL = 'you@…';

  function mailbox(g, flagK) {
    pole(g, [BOX.x + BOX.w / 2, BOX.y + BOX.h], [BOX.x + BOX.w / 2, 0], 6);
    g.beginPath();
    g.moveTo(BOX.x, BOX.y + BOX.h);
    g.lineTo(BOX.x, BOX.y + 12);
    g.quadraticCurveTo(BOX.x, BOX.y, BOX.x + 12, BOX.y);
    g.lineTo(BOX.x + BOX.w - 12, BOX.y);
    g.quadraticCurveTo(BOX.x + BOX.w, BOX.y, BOX.x + BOX.w, BOX.y + 12);
    g.lineTo(BOX.x + BOX.w, BOX.y + BOX.h);
    g.closePath();
    inkFill(g, C.steel, 1.7);
    ln(g, BOX.x + 7, BOX.y + 5, BOX.x + 7, BOX.y + BOX.h - 3, 1.2);
    circle(g, BOX.x + 3.5, DOOR[1], 1.8);
    inkFill(g, C.paper, 1);
    text(g, 'news', BOX.x + 25, BOX.y + 26, 8.5, C.muted);
    const a = lerp(Math.PI, Math.PI * 1.5, E.back(flagK));
    const tip = [FLAG[0] + Math.cos(a) * 24, FLAG[1] + Math.sin(a) * 20];
    ln(g, FLAG[0], FLAG[1], tip[0], tip[1], 2.2);
    g.save();
    g.translate(tip[0], tip[1]);
    g.rotate(a + Math.PI);
    rr(g, -1, -7, 11, 8, 1.5);
    inkFill(g, FLAG_RED, 1.3, C.redInk);
    g.restore();
    circle(g, FLAG[0], FLAG[1], 2.2);
    inkFill(g, C.paper, 1.1);
  }
  function card(g, x, y, rot, k) {
    g.save();
    g.translate(x, y);
    g.rotate(rot);
    rr(g, -17, -11, 34, 22, 2);
    inkFill(g, C.butter, 1.3);
    text(g, typed(EMAIL, k), -13, 3, 8.5, C.umber, 'left');
    g.restore();
  }
  function heart(g, x, y, k) {
    if (k <= 0) {
      return;
    }
    const z = E.back(k);
    g.save();
    g.translate(x, y);
    g.scale(z, z);
    g.beginPath();
    g.moveTo(0, 5);
    g.bezierCurveTo(-9, -1, -6, -9, 0, -4);
    g.bezierCurveTo(6, -9, 9, -1, 0, 5);
    g.closePath();
    inkFill(g, FLAG_RED, 1.3, C.redInk);
    g.restore();
  }

  SC['mkt-newsletter'] = {
    dur: 8.5,
    width: 400,
    label: 'A stick figure writes its email on a card, drops it in a mailbox, the flag pops up, and a paper plane with a welcome flies back into its hand.',
    draw(g, S) {
      const T = S.on ? S.u * this.dur : -1;
      const t = S.t;
      let x = HOME, sx = 1, gait = { ph: 0, amp: 0 };
      let pose = breathe(P({ hF: [12, -60], hB: [-4, -52] }), t);
      let writing = 0, typedK = 0, cardIn = -1, cardHand = 0, flagK = 0, planeK = 0, caught = 0, heartK = 0, welcomeK = 0;
      if (T < 0) {
        pose = mix(pose, P({ hF: [10, -96], head: [7, -116], hB: [-4, -54] }), pulse(t, 6, 2.2, 2.2));
      } else {
        const fade = 1 - seg(T, this.dur - 0.5, this.dur);
        const segs = [walkSeg(T, 1.7, 2.6, HOME, AT), walkSeg(T, 3.75, 4.75, AT, HOME)];
        const ws = T < 3.5 ? segs[0] : segs[1];
        x = ws.x;
        gait = ws;
        sx = T < 4.8 ? sxv(Math.cos(Math.PI * E.soft(seg(T, 3.45, 3.75)))) : sxv(-Math.cos(Math.PI * E.soft(seg(T, 4.8, 5.05))));
        writing = E.soft(seg(T, 0.05, 0.3)) * (1 - E.soft(seg(T, 1.35, 1.6)));
        typedK = seg(T, 0.3, 1.3);
        const scrib = Math.sin(T * 34) * 2 * seg(T, 0.3, 1.3) * (1 - seg(T, 1.25, 1.3));
        pose = mix(pose, P({ hB: [20, -72], hF: [26 + scrib, -76 + Math.cos(T * 21) * 1.5], head: [9, -112], chest: [3, -90] }), writing);
        const carry = E.soft(seg(T, 1.4, 1.65)) * (1 - E.soft(seg(T, 2.55, 2.75)));
        pose = mix(pose, P({ hF: [18, -68], hB: [-4, -52] }), carry);
        const reach = E.soft(seg(T, 2.6, 2.9)) * (1 - E.soft(seg(T, 3.15, 3.4)));
        pose = mix(pose, P({ hF: lp([DOOR[0] - 4, DOOR[1]], x, 0, 1), hB: [-4, -54], head: [9, -114], chest: [4, -89] }), reach);
        const raise = E.soft(seg(T, 5.25, 5.6)) * (1 - E.soft(seg(T, 7.2, 7.6)));
        pose = mix(pose, P({ hF: [26, -114], hB: [-4, -54], head: [6, -118] }), raise);
        cardHand = T < 1.5 ? 1 : T < 2.95 ? 2 : 0;
        cardIn = seg(T, 2.95, 3.25);
        flagK = seg(T, 3.3, 3.65) * (1 - seg(T, 7.3, 7.8));
        planeK = seg(T, 4.95, 5.85);
        caught = T >= 5.85 ? 1 - seg(T, 7.6, 8.0) : 0;
        heartK = seg(T, 5.9, 6.25) * (1 - seg(T, 7.1, 7.4));
        welcomeK = seg(T, 6.0, 6.3) * (1 - seg(T, 7.1, 7.4));
        typedK *= fade;
      }
      pose = legs(pose, gait.ph, gait.amp, { arms: false, stride: gait.stride });

      mailbox(g, flagK);
      const J = fig(g, pose, x, 0, { sx, wave: S.wave, wt: S.wt });
      const hF = J.w.handF, hB = J.w.handB;
      if (cardHand === 1) {
        card(g, hB[0] + 10, hB[1] - 4, -0.15, typedK);
        ln(g, hF[0] - 2, hF[1] + 3, hF[0] + 5, hF[1] - 9, 2.4, C.amber);
        R.frontArm(g, J);
      }
      if (cardHand === 2) {
        card(g, hF[0] + 8, hF[1] - 2, 0, 1);
        R.frontArm(g, J);
      }
      g.save();
      g.beginPath();
      g.rect(BOX.x - 300, -200, 300, 200);
      g.clip();
      if (cardIn >= 0 && cardIn < 1 && T >= 2.95) {
        card(g, lerp(DOOR[0] - 4, DOOR[0] + 22, E.in(cardIn)), DOOR[1], 0, 1);
      }
      g.restore();
      sparks(g, FLAG[0], FLAG[1] - 30, seg(T, 3.4, 3.95), 12, 5, C.redInk);
      const catchAt = [hF[0] + 4, hF[1] - 2];
      plane(g, [DOOR[0] - 6, DOOR[1] - 4], catchAt, planeK, 56, 1.1);
      if (caught > 0) {
        g.save();
        g.globalAlpha *= caught;
        plane(g, [catchAt[0] + 20, catchAt[1] + 2], catchAt, 0.98, 0, 1.1);
        g.restore();
      }
      heart(g, hF[0] + 2, hF[1] - 22, heartK);
      if (welcomeK > 0) {
        g.save();
        g.globalAlpha *= welcomeK;
        text(g, 'welcome!', hF[0] + 14, hF[1] - 18, 11, C.redInk, 'left');
        g.restore();
      }
    },
  };
})();
