// Common Shade: the cooling vest. An outdoor cleaner sweeps in the heat, puts on a cooling vest from its stand and the heat
// eases a little; a blank badge shows where the vest covers it; the vest goes back on the stand and the heat returns.
// An illustrative drawing of a checked finding (Heat-safe work, "Watch for": Oxfam America, 2026), not a scene from it.
// No words in the canvas: the page's caption carries the sentence and its source. Colours come from the site's tokens.
// Load after stick.js. Use as <stick-scene scene="cooling-vest" play="click" no-font></stick-scene>.
(function () {
  const SC = (window.SCENES = window.SCENES || {});
  const R = window.RIG;
  const { E, P, mix, legs, walkSeg, fig, inkFill, rr, ln, seg, breathe, pulse, lp, lerp, circle } = R;

  // the site's colour tokens, read from the page (fallbacks only for previews without the site's stylesheet)
  const FALL = { '--ink': '#16202B', '--ember': '#B8401A', '--ember-50': '#FBE9DF', '--break': '#17703A', '--break-50': '#E8F3EB', '--grey-500': '#5E6570', '--line-strong': '#C9C2B6' };
  let TOK = null;
  const tok = (k) => {
    if (!TOK) {
      TOK = {};
      const cs = typeof getComputedStyle === 'function' ? getComputedStyle(document.documentElement) : null;
      for (const key of Object.keys(FALL)) TOK[key] = ((cs && cs.getPropertyValue(key)) || '').trim() || FALL[key];
    }
    return TOK[k];
  };

  const HOME = -40, AT = 66;
  const STAND = 104, HOOK = [92, -116];
  const SUN = [-148, -156];

  function sun(g, t) {
    circle(g, SUN[0], SUN[1], 11);
    inkFill(g, tok('--ember-50'), 1.6, tok('--ember'));
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + t * 0.15, r0 = 16, r1 = 22;
      ln(g, SUN[0] + Math.cos(a) * r0, SUN[1] + Math.sin(a) * r0, SUN[0] + Math.cos(a) * r1, SUN[1] + Math.sin(a) * r1, 1.6, tok('--ember'));
    }
  }

  // wavy lines of heat rising beside the head; k = how strong (1 full, lower when the vest is on)
  function heat(g, x, t, k) {
    g.save();
    g.globalAlpha *= k;
    for (let i = 0; i < 3; i++) {
      const bx = x - 22 + i * 22, ph = t * 2.2 + i * 1.9;
      g.beginPath();
      for (let j = 0; j <= 12; j++) {
        const y = -120 - j * 3 - ((t * 9 + i * 7) % 6);
        const xx = bx + Math.sin(ph + j * 0.7) * 2.4;
        if (j === 0) g.moveTo(xx, y); else g.lineTo(xx, y);
      }
      g.lineWidth = 1.7;
      g.lineCap = 'round';
      g.strokeStyle = tok('--ember');
      g.stroke();
    }
    g.restore();
  }

  function stand(g) {
    ln(g, STAND, 0, STAND, HOOK[1] - 4, 2.4);
    ln(g, STAND - 9, 0, STAND + 9, 0, 2.4);
    ln(g, STAND, HOOK[1] - 4, HOOK[0], HOOK[1] - 4, 2.2);
    ln(g, HOOK[0], HOOK[1] - 4, HOOK[0], HOOK[1] + 1, 1.8);
  }

  // the vest: a soft shape with a V neck, centred on (cx, cy), turned by ang, h tall
  function vest(g, cx, cy, ang, h) {
    g.save();
    g.translate(cx, cy);
    g.rotate(ang);
    const w = 17;
    rr(g, -w / 2, -h / 2, w, h, 4);
    inkFill(g, tok('--break-50'), 1.6, tok('--break'));
    ln(g, -4, -h / 2 + 0.5, 0, -h / 2 + 7, 1.4, tok('--break'));
    ln(g, 4, -h / 2 + 0.5, 0, -h / 2 + 7, 1.4, tok('--break'));
    ln(g, -w / 2 + 3, h * 0.12, w / 2 - 3, h * 0.12, 1.2, tok('--break'));
    g.restore();
  }

  // a blank badge: an outline only, no mark
  function badge(g, cx, cy, ang, dashed) {
    g.save();
    g.translate(cx, cy);
    g.rotate(ang);
    if (dashed) g.setLineDash([2, 2]);
    rr(g, -6.5, -4.6, 13, 9.2, 2);
    g.lineWidth = 1.6;
    g.strokeStyle = tok('--grey-500');
    g.stroke();
    g.restore();
  }

  // the broom: the handle runs from just above the grip down to the bristles at a fixed point on the ground
  function broom(g, grip, bot) {
    let d = [bot[0] - grip[0], bot[1] - grip[1]];
    const l = Math.hypot(d[0], d[1]) || 1;
    d = [d[0] / l, d[1] / l];
    const top = [grip[0] - d[0] * 12, grip[1] - d[1] * 12];
    ln(g, top[0], top[1], bot[0], bot[1], 2.2, tok('--ink'));
    g.beginPath();
    g.moveTo(bot[0] - 4, bot[1]);
    g.lineTo(bot[0] + 4, bot[1]);
    g.lineTo(bot[0] + 8, -0.5);
    g.lineTo(bot[0] - 8, -0.5);
    g.closePath();
    inkFill(g, tok('--line-strong'), 1.4, tok('--ink'));
  }

  SC['cooling-vest'] = {
    dur: 7.4,
    width: 380,
    label: 'An outdoor cleaner sweeping in the heat puts on a cooling vest from a stand, then takes it off again and hangs it back up because it covers the badge on their shirt.',
    draw(g, S) {
      const T = S.on ? S.u * this.dur : -1;
      const t = S.t;
      let x = HOME, gait = { ph: 0, amp: 0 };
      let vestK = 0, carry = -1, heatK = 1, peek = 0, reachK = 0, oneK = 0, sweepAmp = 3, glance = 0;
      if (T < 0) {
        glance = pulse(t, 6, 2.5, 1.6);   // a glance up at the sun
      } else {
        // out to the stand, back to sweep, out again, home (stepping backwards on the way home, still facing right)
        const spans = [[0.1, 1.0, HOME, AT], [2.5, 3.3, AT, HOME], [4.6, 5.4, HOME, AT], [6.3, 7.1, AT, HOME]];
        let wi = spans.findIndex(([a, b]) => T >= a && T <= b);
        if (wi < 0) wi = T < 2.5 ? 0 : T < 4.6 ? 1 : T < 6.3 ? 2 : 3;
        const [a, b, x0, x1] = spans[wi];
        const ws = walkSeg(T, a, b, x0, x1);
        x = ws.x;
        gait = ws.dir < 0 ? { ph: -ws.ph, amp: ws.amp, stride: ws.stride } : ws;
        reachK = E.soft(seg(T, 1.05, 1.45)) * (1 - E.soft(seg(T, 1.6, 2.0))) + E.soft(seg(T, 5.45, 5.8)) * (1 - E.soft(seg(T, 6.0, 6.25)));
        oneK = E.soft(seg(T, 0.95, 1.1)) * (1 - E.soft(seg(T, 2.15, 2.4))) + E.soft(seg(T, 5.35, 5.5)) * (1 - E.soft(seg(T, 6.15, 6.3)));
        vestK = E.soft(seg(T, 1.9, 2.15)) * (1 - E.soft(seg(T, 5.5, 5.75)));
        carry = T > 1.4 && T < 1.95 ? seg(T, 1.45, 1.95) : T > 5.5 && T < 6.05 ? 1 - seg(T, 5.55, 6.05) : -1;
        heatK = 1 - 0.32 * vestK;
        sweepAmp = T > 3.3 && T < 4.6 ? 3 + 4 * E.soft(seg(T, 3.3, 3.6)) * (1 - E.soft(seg(T, 4.3, 4.6))) : 0;
        peek = T > 3.6 && T < 4.45 ? Math.max(pulse(T, 10, 3.7, 0.32), pulse(T, 10, 4.05, 0.32)) : 0;
      }
      // the broom: the grip above the back hand, the bristles on the ground ahead; with one hand it leans close by
      const sw = Math.sin(t * 3.2) * sweepAmp;
      const grip = [x + 12, -63];
      const bot = [lerp(x + 40 + sw, x + 14, oneK), -5];
      const along = (k) => [lerp(grip[0], bot[0], k), lerp(grip[1], bot[1], k)];
      let pose = breathe(P({ hB: lp(grip, x, 0, 1), hF: lp(along(0.36), x, 0, 1), head: [6, -114], hang: 0 }), t);
      pose = mix(pose, P({ hB: lp(grip, x, 0, 1), hF: lp(along(0.36), x, 0, 1), head: [3, -119], hang: 0 }), glance);
      const free = P({ hB: lp(grip, x, 0, 1), hF: [12, -64], head: [6, -115], hang: 0 });
      pose = mix(pose, free, oneK * (1 - reachK));
      pose = mix(pose, P({ hB: lp(grip, x, 0, 1), hF: lp([HOOK[0] - 1, HOOK[1] + 6], x, 0, 1), head: [9, -117], chest: [3, -90], hang: 0 }), reachK);
      pose = legs(pose, gait.ph, gait.amp, { arms: false, stride: gait.stride });

      sun(g, t);
      stand(g);
      if (vestK <= 0.02 && carry < 0) vest(g, HOOK[0], HOOK[1] + 16, 0, 28);

      const J = fig(g, pose, x, 0, {
        wave: S.wave, wt: S.wt,
        held: (gg, J0) => R.held(gg, J0, (hf) => {
          const c = J0.W(J0.chest), h = J0.W(J0.hip);
          const len = Math.hypot(c[0] - h[0], c[1] - h[1]);
          const mid = [lerp(h[0], c[0], 0.55), lerp(h[1], c[1], 0.55)];
          const ang = Math.atan2(c[0] - h[0], -(c[1] - h[1]));
          const bd = [lerp(h[0], c[0], 0.7) + 5, lerp(h[1], c[1], 0.7)];
          if (vestK < 0.98) badge(gg, bd[0], bd[1], ang, false);
          if (carry >= 0) {
            const k = E.soft(carry);
            vest(gg, lerp(hf[0] + 2, mid[0], k), lerp(hf[1] + 13, mid[1], k), ang * k, lerp(28, len + 8, k));
          } else if (vestK > 0.02) {
            vest(gg, mid[0], mid[1], ang, len + 8);
            if (peek > 0.02) { gg.save(); gg.globalAlpha *= peek; badge(gg, bd[0], bd[1], ang, true); gg.restore(); }
          }
          broom(gg, grip, bot);
        }),
      });
      heat(g, J.w.head[0], t, heatK);
    },
  };
})();
