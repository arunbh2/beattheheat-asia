// how-photo: three ways to show photosynthesis for a year 5 science page (leaf kitchen, solar plant, thirsty plant)
(function () {
  const SC = (window.SCENES = window.SCENES || {});
  const R = window.RIG;
  const { C, E, P, FS, mix, fig, inkFill, rr, ln, text, seg, breathe, pulse, lp, sparks, circle, lerp, clamp, floatText, L2, arcPt } = R;

  const TAU = Math.PI * 2;
  const REST = P({ hF: [12, -60], hB: [-4, -52] });
  const GREEN = '#bfe5c4', GREEN_INK = '#2f855a', ROOM = '#f2faf3', ROOM_INK = '#a7d8b0';

  // ---------------------------------------------------------------- shared
  function sun(g, x, y, r, k, t) {
    g.save();
    g.translate(x, y);
    for (let i = 0; i < 10; i++) {
      const a = (i * TAU) / 10 + t * 0.35;
      ln(g, Math.cos(a) * (r + 4), Math.sin(a) * (r + 4), Math.cos(a) * (r + 8 + 6 * k), Math.sin(a) * (r + 8 + 6 * k), 2, C.amber);
    }
    circle(g, 0, 0, r * (1 + 0.08 * k));
    inkFill(g, C.butterHi, 1.6);
    g.restore();
  }
  function cloud(g, x, y, s) {
    g.save();
    g.translate(x, y);
    g.scale(s, s);
    g.beginPath();
    g.arc(-16, 4, 12, Math.PI * 0.5, Math.PI * 1.5);
    g.arc(-4, -6, 15, Math.PI, Math.PI * 1.85);
    g.arc(14, -1, 13, Math.PI * 1.25, Math.PI * 0.5);
    g.closePath();
    inkFill(g, C.paper, 1.6);
    g.restore();
  }
  function bubble(g, x, y, r, label, alpha) {
    if (alpha <= 0 || r < 1) {
      return;
    }
    g.save();
    g.globalAlpha *= alpha;
    circle(g, x, y, r);
    inkFill(g, 'rgba(255,255,255,0.92)', 1.4);
    g.beginPath();
    g.arc(x, y, Math.max(0.5, r - 3.5), Math.PI * 1.1, Math.PI * 1.45);
    g.lineWidth = 1.4;
    g.strokeStyle = '#c9c9c9';
    g.stroke();
    text(g, label, x, y + r * 0.32, r * 0.85, C.ink);
    g.restore();
  }
  function bang(g, x, y, k) {
    if (k <= 0 || k >= 1) {
      return;
    }
    const z = E.back(clamp(k * 3, 0, 1));
    g.save();
    g.globalAlpha *= 1 - seg(k, 0.75, 1);
    g.translate(x, y);
    g.scale(z, z);
    text(g, '!', 0, 0, 17, C.ink);
    g.restore();
  }
  function happyEyes(g, head, k) {
    if (k <= 0) {
      return;
    }
    g.save();
    g.globalAlpha *= k;
    for (const dx of [-2.4, 2.8]) {
      g.beginPath();
      g.arc(head[0] + dx, head[1], 1.7, Math.PI * 1.1, Math.PI * 1.9);
      g.lineWidth = 1.3;
      g.strokeStyle = C.paper;
      g.stroke();
    }
    g.restore();
  }
  function stream(g, pts, w) {
    if (w <= 0.05) {
      return;
    }
    R.strokePath(g, pts, 2.4 + 2 * w, C.ink);
    R.strokePath(g, pts, 0.4 + 2 * w, '#dcecf8');
  }
  // Watering can, held by its top handle at the origin; spout to the right.
  const CAN_SPOUT = [26, -2];
  function wcan(g, h, a, s) {
    g.save();
    g.translate(h[0], h[1]);
    g.rotate(a);
    g.scale(s, s);
    ln(g, 9, 13, 24, -1, 3.6, C.ink);
    ln(g, 9, 13, 24, -1, 1.6, C.steel);
    R.poly(g, [[22, -3], [28, -6], [29, 1]], true);
    inkFill(g, C.steel, 1.2);
    g.beginPath();
    g.moveTo(-6, 6);
    g.quadraticCurveTo(0, -3, 6, 6);
    g.lineWidth = 2.6;
    g.strokeStyle = C.ink;
    g.stroke();
    rr(g, -11, 5, 22, 17, 3);
    inkFill(g, C.steel, 1.6);
    g.restore();
  }
  const spoutOf = (h, a, s) => [h[0] + (CAN_SPOUT[0] * Math.cos(a) - CAN_SPOUT[1] * Math.sin(a)) * s, h[1] + (CAN_SPOUT[0] * Math.sin(a) + CAN_SPOUT[1] * Math.cos(a)) * s];
  const bez = (a, c, b, k) => [lerp(lerp(a[0], c[0], k), lerp(c[0], b[0], k), k), lerp(lerp(a[1], c[1], k), lerp(c[1], b[1], k), k)];

  // ---------------------------------------------------------------- kitchen: the leaf as a kitchen, the figure as chef
  const KFX = -45;
  const POT = { x: 20, rim: -46 };
  const LADLE = [-12, -70];
  const SUN_K = [-192, -156];
  const SUGAR = [124, -11];
  const CATCH = P({ hF: [12, -132], hB: [-4, -52], head: [-3, -118], chest: [-2, -90] });
  const TOSS = P({ hF: [34, -104], head: [8, -115] });
  const POURK = P({ hB: [34, -96], head: [8, -114], chest: [2, -90] });
  const REL_K = [KFX + 34 * FS, -104 * FS];
  const NOSE = [KFX + 26, -103];

  function room(g) {
    g.beginPath();
    g.moveTo(-200, -92);
    g.bezierCurveTo(-120, -205, 120, -205, 214, -96);
    g.bezierCurveTo(120, 8, -120, 12, -200, -92);
    g.closePath();
    inkFill(g, ROOM, 2, ROOM_INK);
    ln(g, -200, -92, -222, -66, 2.6, ROOM_INK);
    for (const [x0, y0, x1, y1] of [[-60, -150, -86, -172], [40, -152, 18, -178], [130, -132, 112, -158], [-60, -32, -84, -16], [40, -30, 18, -10], [130, -54, 112, -32]]) {
      ln(g, x0, y0, x1, y1, 1.6, ROOM_INK);
    }
  }
  function cauldron(g, glow, bub, t) {
    ln(g, POT.x - 20, -10, POT.x - 25, 0, 2.4);
    ln(g, POT.x + 20, -10, POT.x + 25, 0, 2.4);
    g.beginPath();
    g.moveTo(POT.x - 32, POT.rim);
    g.bezierCurveTo(POT.x - 36, -2, POT.x + 36, -2, POT.x + 32, POT.rim);
    g.closePath();
    inkFill(g, '#3a3a3a', 1.6);
    g.beginPath();
    g.ellipse(POT.x, POT.rim, 32, 7, 0, 0, TAU);
    g.fillStyle = '#e4eef6';
    g.fill();
    if (glow > 0) {
      g.save();
      g.globalAlpha *= glow;
      g.fillStyle = C.butterHi;
      g.fill();
      g.restore();
    }
    g.lineWidth = 1.8;
    g.strokeStyle = C.ink;
    g.stroke();
    if (bub > 0) {
      for (let i = 0; i < 4; i++) {
        const k = (t * 1.6 + i / 4) % 1;
        g.save();
        g.globalAlpha *= bub * (1 - k);
        circle(g, POT.x - 18 + i * 12, POT.rim - 3 - k * 16, 2.4 + i % 2);
        inkFill(g, C.paper, 1);
        g.restore();
      }
    }
  }
  function puff(g, x, y, z, label) {
    if (z <= 0.02) {
      return;
    }
    g.save();
    g.translate(x, y);
    g.scale(z, z);
    g.beginPath();
    g.arc(-11, 3, 9, Math.PI * 0.5, Math.PI * 1.5);
    g.arc(0, -4, 11, Math.PI, Math.PI * 2);
    g.arc(11, 3, 9, Math.PI * 1.5, Math.PI * 0.5);
    g.closePath();
    inkFill(g, '#ececec', 1.4);
    text(g, label, 0, 6, 10, C.ink);
    g.restore();
  }
  function chefHat(g, head, lean) {
    g.save();
    g.translate(head[0], head[1] - 6);
    g.rotate(lean);
    rr(g, -6.5, -4, 13, 5, 1.5);
    inkFill(g, C.paper, 1.3);
    g.beginPath();
    g.arc(-4.5, -8, 4.6, Math.PI * 0.6, Math.PI * 1.7);
    g.arc(0, -11, 5.4, Math.PI * 1.15, Math.PI * 1.85);
    g.arc(4.5, -8, 4.6, Math.PI * 1.3, Math.PI * 0.4);
    g.closePath();
    inkFill(g, C.paper, 1.3);
    g.restore();
  }
  function sugarCube(g, x, y, rot, alpha) {
    if (alpha <= 0) {
      return;
    }
    g.save();
    g.globalAlpha *= alpha;
    g.translate(x, y);
    g.rotate(rot);
    rr(g, -11, -11, 22, 22, 3);
    inkFill(g, C.paper, 1.8);
    R.poly(g, [[-11, -6], [-6, -11], [11, -11], [11, -6]], false);
    g.lineWidth = 1;
    g.strokeStyle = C.faint;
    g.stroke();
    for (const [dx, dy] of [[-4, 2], [3, -2], [4, 5], [-3, -5]]) {
      circle(g, dx, dy, 0.9);
      g.fillStyle = C.soft;
      g.fill();
    }
    g.restore();
  }

  SC['how-photo-kitchen'] = {
    dur: 6.6,
    width: 460,
    label: 'Inside a leaf kitchen, a stick-figure chef pours in water, catches a sunbeam, wafts in carbon dioxide and stirs the pot; a sugar cube pops out and an oxygen bubble floats up for the chef to sniff.',
    draw(g, S) {
      const T = S.on ? S.u * this.dur : -1;
      const t = S.t;
      let pose = breathe(REST, t);
      let top = LADLE, canA = 0, flow = 0, beam = 0, ball = null, co2 = null, glow = 0, bub = 0, sugar = null, sugarA = 0, o2 = null, eyesK = 0, ahh = 0, sunK = 0.2;
      if (T < 0) {
        const st = pulse(t, 6.5, 2.2, 2.4);
        top = [LADLE[0] + Math.cos(t * 5) * 5 * st, LADLE[1] + Math.sin(t * 5) * 2 * st];
        pose = mix(pose, P({ hF: lp(top, KFX, 0, 1), head: [7, -114] }, pose), st);
      } else {
        const fade = 1 - seg(T, 6.0, 6.6);
        const pour = E.soft(seg(T, 0.15, 0.45)) * (1 - E.soft(seg(T, 1.15, 1.45)));
        pose = mix(pose, P({ hB: POURK.hB, head: POURK.head, chest: POURK.chest }, pose), pour);
        canA = 0.75 * E.soft(seg(T, 0.45, 0.6)) * (1 - E.soft(seg(T, 1.05, 1.2)));
        flow = Math.min(1, seg(T, 0.55, 0.62) * 1) * (1 - seg(T, 0.98, 1.06));

        const up = E.soft(seg(T, 1.2, 1.5)) * (1 - E.soft(seg(T, 1.78, 2.08)));
        pose = mix(pose, P({ hF: CATCH.hF, head: CATCH.head, chest: CATCH.chest }, pose), up);
        const toss = E.soft(seg(T, 1.78, 2.08)) * (1 - E.soft(seg(T, 2.12, 2.4)));
        pose = mix(pose, P({ hF: TOSS.hF, head: TOSS.head }, pose), toss);
        beam = seg(T, 1.3, 1.55) * (1 - seg(T, 1.55, 1.85));
        sunK = 0.2 + 0.8 * Math.sin(Math.PI * seg(T, 1.25, 1.9));
        if (T >= 1.55 && T < 2.06) {
          ball = { hand: true };
        } else if (T >= 2.06 && T < 2.42) {
          ball = { p: arcPt(REL_K, [POT.x, POT.rim - 2], 30, E.in(seg(T, 2.06, 2.42))) };
        }

        const fan = E.soft(seg(T, 2.35, 2.55)) * (1 - E.soft(seg(T, 2.85, 3.0)));
        pose = mix(pose, P({ hF: [28 + Math.sin(T * 20) * 6, -98], head: [8, -115] }, pose), fan);
        if (T >= 2.0 && T < 3.1) {
          const k = E.soft(seg(T, 2.0, 2.85));
          const p = L2([250, -128], [POT.x + 8, -88], k);
          const sink = seg(T, 2.85, 3.1);
          co2 = { x: lerp(p[0], POT.x, sink), y: lerp(p[1] + Math.sin(T * 6) * 3, POT.rim - 2, sink), z: 1 - E.in(sink) };
        }

        const grip = E.soft(seg(T, 3.0, 3.25)) * (1 - E.soft(seg(T, 3.95, 4.2)));
        const st = seg(T, 3.2, 3.95) * (1 - seg(T, 3.9, 3.98));
        top = [LADLE[0] + Math.cos(T * 11) * 7 * st, LADLE[1] + Math.sin(T * 11) * 2.5 * st];
        pose = mix(pose, P({ hF: lp(top, KFX, 0, 1), head: [9, -113], chest: [3, -89] }, pose), grip);
        glow = (0.35 * seg(T, 2.38, 2.5) + 0.65 * seg(T, 3.2, 3.95)) * fade;
        bub = seg(T, 3.2, 3.4) * (1 - seg(T, 4.6, 5.0));

        if (T >= 4.0) {
          const k = seg(T, 4.0, 4.45);
          const p = arcPt([POT.x, POT.rim - 6], SUGAR, 70, k);
          const bounce = Math.sin(Math.PI * seg(T, 4.45, 4.7)) * 7;
          sugar = { x: p[0], y: p[1] - bounce, rot: (1 - k) * 3.2 };
          sugarA = fade;
        }
        if (T >= 4.6 && T < 5.45) {
          const k = E.soft(seg(T, 4.65, 5.3));
          const p = bez([POT.x, POT.rim - 12], [POT.x - 4, -128], NOSE, k);
          o2 = { x: p[0], y: p[1], z: E.back(seg(T, 4.6, 4.8)) * (1 - seg(T, 5.3, 5.45)) };
        }
        const sniff = E.soft(seg(T, 4.95, 5.3)) * (1 - E.soft(seg(T, 5.75, 6.05)));
        pose = mix(pose, P({ head: [9, -118], chest: [3, -90] }, pose), sniff);
        eyesK = seg(T, 5.3, 5.4) * (1 - seg(T, 5.85, 5.95));
        ahh = seg(T, 5.35, 6.0);
      }

      room(g);
      sun(g, SUN_K[0], SUN_K[1], 15, sunK, t);
      cauldron(g, glow, bub, t);
      ln(g, POT.x - 8, POT.rim + 3, top[0], top[1], 3.4, C.ink);
      ln(g, POT.x - 8, POT.rim + 3, top[0], top[1], 1.5, C.wood);
      let canHand = null;
      const J = fig(g, pose, KFX, 0, {
        wave: S.wave,
        wt: S.wt,
        behind: (gg, JJ) =>
          R.held(gg, JJ, (hF, hB) => {
            canHand = hB;
            wcan(gg, hB, canA, 1);
          }),
      });
      chefHat(g, J.w.head, (pose.head[0] - pose.chest[0]) * 0.02);
      happyEyes(g, J.w.head, eyesK);
      if (beam > 0) {
        const from = [SUN_K[0] + 12, SUN_K[1] + 10], to = J.w.handF;
        const end = L2(from, to, Math.min(1, beam * 2));
        g.save();
        g.globalAlpha *= Math.min(1, beam * 3);
        ln(g, from[0], from[1], end[0], end[1], 7.5, C.amber);
        ln(g, from[0], from[1], end[0], end[1], 5, C.butterHi);
        g.restore();
      }
      if (ball) {
        const p = ball.hand ? [J.w.handF[0], J.w.handF[1] - 5] : ball.p;
        circle(g, p[0], p[1], 5.5);
        inkFill(g, C.butterHi, 1.4);
        sparks(g, p[0], p[1], (t * 2) % 1, 9, 4, C.amber);
      }
      if (flow > 0 && canHand) {
        const sp = spoutOf(canHand, canA, 1);
        stream(g, [sp, [sp[0] + 4, sp[1] + 6], [sp[0] + 6, POT.rim]], flow);
      }
      if (co2) {
        puff(g, co2.x, co2.y, co2.z, 'CO2');
      }
      if (sugar) {
        sugarCube(g, sugar.x, sugar.y, sugar.rot, sugarA);
        g.save();
        g.globalAlpha *= sugarA * seg(T, 4.5, 4.8);
        text(g, 'sugar', SUGAR[0], 18, 11, C.umber);
        g.restore();
      }
      sparks(g, SUGAR[0], SUGAR[1] - 16, seg(T, 4.45, 5.0), 14, 6, C.amber);
      if (o2) {
        bubble(g, o2.x, o2.y, 11 * o2.z, 'O2', o2.z > 0.05 ? 1 : 0);
      }
      sparks(g, NOSE[0], NOSE[1], seg(T, 5.3, 5.7), 10, 5, C.muted);
      floatText(g, 'ahh', J.w.head[0] + 18, J.w.head[1] - 14, ahh, C.umber, 11);
    },
  };

  // ---------------------------------------------------------------- solar: leaves like solar panels charge a battery, the plant shoots up
  const SFX = -78;
  const SP = { x: -10, top: -40 };
  const SUN_S = [165, -146];
  const H0 = 62, H1 = 126;
  const SLEAVES = [[0.32, 1], [0.62, 1], [0.9, -1]];
  const WATERP = P({ hF: [34, -80], hB: [-4, -54], head: [8, -114] });
  const STARTLE = P({ hF: [14, -96], hB: [8, -98], head: [3, -120], chest: [-4, -90] });

  function pot(g, x, top, w, h) {
    R.poly(g, [[x - w / 2, top], [x + w / 2, top], [x + w / 2 - 6, top + h], [x - w / 2 + 6, top + h]], true);
    inkFill(g, '#e8c3a5', 1.8);
    rr(g, x - w / 2 - 3, top - 2, w + 6, 8, 2);
    inkFill(g, '#e8c3a5', 1.6);
  }
  function battery(g, x, y, lev, pop) {
    rr(g, x - 17, y - 8, 34, 16, 3);
    inkFill(g, C.paper, 1.5);
    rr(g, x + 17, y - 3.5, 3, 7, 1);
    inkFill(g, C.ink, 1);
    for (let i = 0; i < 4; i++) {
      const k = clamp(lev - i, 0, 1);
      if (k <= 0) {
        continue;
      }
      g.save();
      g.globalAlpha *= k;
      rr(g, x - 14 + i * 7.5, y - 5, 6, 10, 1);
      g.fillStyle = i === 3 && pop > 0 ? C.butterHi : '#58b26b';
      g.fill();
      g.restore();
    }
  }
  function panel(g, x, y, th, glint) {
    g.save();
    g.translate(x, y);
    g.rotate(th);
    ln(g, 0, 0, 7, 0, 2.6, GREEN_INK);
    rr(g, 7, -7.5, 28, 15, 3);
    inkFill(g, GREEN, 1.6, GREEN_INK);
    ln(g, 16.3, -7, 16.3, 7, 1, GREEN_INK);
    ln(g, 25.6, -7, 25.6, 7, 1, GREEN_INK);
    ln(g, 8, 0, 34, 0, 1, GREEN_INK);
    if (glint > 0) {
      g.save();
      g.globalAlpha *= glint;
      ln(g, 11, 4, 17, -4, 2, C.paper);
      g.restore();
    }
    g.restore();
  }
  function solarPlant(g, H, tilt, glint, sway) {
    const base = [SP.x, SP.top], tip = [SP.x + sway, SP.top - H];
    const ctrl = [SP.x - 5, SP.top - H * 0.5];
    const at = (f) => bez(base, ctrl, tip, f);
    R.strokePath(g, Array.from({ length: 12 }, (_, i) => at(i / 11)), 3.4, GREEN_INK);
    SLEAVES.forEach(([f, side], i) => {
      const p = at(f);
      const th = side > 0 ? lerp(0.32, -0.62, tilt) : lerp(Math.PI - 0.32, Math.PI + 0.62, tilt);
      panel(g, p[0], p[1], th, glint * (0.6 + 0.4 * Math.sin(i * 2 + glint * 6)));
    });
    g.save();
    g.translate(tip[0], tip[1]);
    for (const s of [-1, 1]) {
      g.beginPath();
      g.ellipse(s * 6, -2, 7, 3.6, s * -0.5, 0, TAU);
      inkFill(g, GREEN, 1.4, GREEN_INK);
    }
    g.restore();
  }

  SC['how-photo-solar'] = {
    dur: 6.2,
    width: 460,
    label: 'The sun comes out from behind a cloud, a plant tilts its solar-panel leaves to it and charges a battery, then shoots up past the surprised stick figure holding a tiny watering can.',
    draw(g, S) {
      const T = S.on ? S.u * this.dur : -1;
      const t = S.t;
      let pose = breathe(REST, t);
      let cloudX = SUN_S[0], tilt = 0, lev = 0, H = H0, glint = 0, rays = 0, canA = 0, drops = 0, bangK = 0, pop = 0;
      const sway = Math.sin(t * 1.3) * 2;
      if (T < 0) {
        const pk = pulse(t, 6, 2.4, 2);
        pose = mix(pose, P({ hF: [18, -76], head: [6, -112] }, pose), pk);
        canA = -0.25 * pk;
      } else {
        const back = E.soft(seg(T, 5.6, 6.2));
        cloudX = lerp(SUN_S[0], 272, E.soft(seg(T, 0.2, 1.1)) * (1 - back));
        tilt = E.soft(seg(T, 1.0, 1.5)) * (1 - back);
        rays = seg(T, 1.3, 1.5) * (1 - seg(T, 2.9, 3.1));
        glint = rays;
        lev = (seg(T, 1.5, 1.75) + seg(T, 1.85, 2.1) + seg(T, 2.2, 2.45) + seg(T, 2.55, 2.8)) * (1 - E.soft(seg(T, 3.05, 3.4)));
        pop = seg(T, 2.55, 2.8) * (1 - seg(T, 3.0, 3.1));
        H = lerp(H0, H1, E.back(seg(T, 3.05, 3.45)) * (1 - back));
        const water = E.soft(seg(T, 1.9, 2.25)) * (1 - E.soft(seg(T, 3.05, 3.2)));
        pose = mix(pose, P({ hF: WATERP.hF, head: WATERP.head }, pose), water);
        canA = 0.8 * E.soft(seg(T, 2.2, 2.4)) * (1 - E.soft(seg(T, 3.0, 3.15)));
        drops = seg(T, 2.35, 3.0);
        const jump = E.soft(seg(T, 3.08, 3.35)) * (1 - E.soft(seg(T, 4.3, 4.7)));
        pose = mix(pose, P({ hF: STARTLE.hF, hB: STARTLE.hB, head: STARTLE.head, chest: STARTLE.chest }, pose), jump);
        const look = E.soft(seg(T, 4.3, 4.7)) * (1 - E.soft(seg(T, 5.4, 5.8)));
        pose = mix(pose, P({ hF: [10, -96], head: [6, -119] }, pose), look);
        bangK = seg(T, 3.1, 3.75);
      }

      sun(g, SUN_S[0], SUN_S[1], 20, rays, t);
      cloud(g, cloudX, SUN_S[1] + 2, 1.35);
      if (rays > 0) {
        g.save();
        g.globalAlpha *= rays * 0.9;
        g.setLineDash([4, 5]);
        g.lineDashOffset = -t * 30;
        for (const f of [0.32, 0.62, 0.9]) {
          const y = SP.top - H * f;
          ln(g, SUN_S[0] - 18, SUN_S[1] + 12, SP.x + 22, y - 6, 1.6, C.amber);
        }
        g.restore();
      }
      solarPlant(g, H, tilt, glint, sway);
      pot(g, SP.x, SP.top, 56, 40);
      battery(g, SP.x, SP.top + 20, lev, pop);
      let hand = null;
      const J = fig(g, pose, SFX, 0, {
        wave: S.wave,
        wt: S.wt,
        held: (gg, JJ) =>
          R.held(gg, JJ, (hF) => {
            hand = hF;
            wcan(gg, [hF[0], hF[1] - 3], canA, 0.6);
          }),
      });
      if (drops > 0 && drops < 1 && hand) {
        const sp = spoutOf([hand[0], hand[1] - 3], canA, 0.6);
        for (let i = 0; i < 3; i++) {
          const k = (drops * 3 + i / 3) % 1;
          g.save();
          g.globalAlpha *= Math.min(1, (1 - drops) * 5);
          g.beginPath();
          g.ellipse(sp[0] + 2, lerp(sp[1] + 2, SP.top - 2, k), 1.6, 2.4, 0, 0, TAU);
          inkFill(g, '#dcecf8', 1);
          g.restore();
        }
      }
      sparks(g, SP.x + 22, SP.top + 12, seg(T, 2.8, 3.3), 10, 5, C.amber);
      sparks(g, SP.x, SP.top - H1 - 8, seg(T, 3.3, 3.9), 16, 7, GREEN_INK);
      bang(g, J.w.head[0] + 14, J.w.head[1] - 12, bangK);
    },
  };

  // ---------------------------------------------------------------- straw: the plant drinks through a straw, sunbathes, burps O2, then flowers
  const WFX = -104;
  const STOOL = { x0: -88, x1: 30, y: -40 };
  const GX = WFX + 28;
  const WP = { x: -18, top: -74 };
  const BUD_H = 64;
  const SUN_W = [150, -148];
  const HOLD = P({ hF: [20, -80], hB: [-4, -52] });
  const PLACE = P({ hF: lp([GX, -56], WFX, 0, 1), hB: [-4, -54], head: [9, -112], chest: [4, -88] });
  const CHEER = P({ hF: [14, -132], hB: [-10, -130], head: [3, -118] });
  const GIGGLE = P({ hF: [18, -88], hB: [-4, -54], head: [4, -114] });

  function stool(g) {
    ln(g, STOOL.x0 + 8, STOOL.y, STOOL.x0 + 2, 0, 2.4);
    ln(g, STOOL.x1 - 8, STOOL.y, STOOL.x1 - 2, 0, 2.4);
    rr(g, STOOL.x0, STOOL.y, STOOL.x1 - STOOL.x0, 6, 2);
    inkFill(g, C.wood, 1.6);
  }
  function glass(g, cx, by, lev, bend) {
    const w = 18, h = 30;
    const path = () => R.poly(g, [[cx - w / 2, by - h], [cx + w / 2, by - h], [cx + w / 2 - 2, by], [cx - w / 2 + 2, by]], true);
    const straight = [[cx + 2, by - 6], [cx + 4, by - h - 14], [cx + 6, by - h - 22]];
    const bent = [[cx + 2, by - 6], [cx + 6, by - h - 12], [lerp(cx, WP.x - 10, 0.55), by - h - 18], [WP.x - 10, WP.top + 4]];
    const pts = bend <= 0 ? straight : [straight[0], L2(straight[1], bent[1], bend), L2(straight[2], bent[2], bend), L2(straight[2], bent[3], bend)];
    R.strokePath(g, pts, 4.2, C.ink);
    R.strokePath(g, pts, 2.2, '#f4a7a7');
    path();
    g.fillStyle = 'rgba(255,255,255,0.85)';
    g.fill();
    if (lev > 0) {
      g.save();
      path();
      g.clip();
      g.fillStyle = '#d6e8f6';
      g.fillRect(cx - w, by - h * 0.85 * lev, w * 2, h);
      g.restore();
    }
    path();
    inkFill(g, null, 1.7);
    return pts;
  }
  function flowerPlant(g, lean, leafUp, squash, bloom, shades, t, shadesA) {
    const base = [WP.x, WP.top];
    const h = BUD_H * (1 - 0.14 * squash);
    const tip = [WP.x + lean * 26, WP.top - h + Math.abs(lean) * 4];
    const ctrl = [WP.x + lean * 4, WP.top - h * 0.55];
    const at = (f) => bez(base, ctrl, tip, f);
    R.strokePath(g, Array.from({ length: 12 }, (_, i) => at(i / 11)), 3.4, GREEN_INK);
    const lp0 = at(0.42);
    for (const s of [-1, 1]) {
      const a = s > 0 ? lerp(-0.25, -1.1, leafUp) : lerp(Math.PI + 0.25, Math.PI + 1.1, leafUp);
      g.save();
      g.translate(lp0[0], lp0[1]);
      g.rotate(a + Math.sin(t * 1.4 + s) * 0.04);
      g.beginPath();
      g.ellipse(13, 0, 13, 5.6, 0, 0, TAU);
      inkFill(g, GREEN, 1.5, GREEN_INK);
      ln(g, 2, 0, 22, 0, 1, GREEN_INK);
      g.restore();
    }
    g.save();
    g.translate(tip[0], tip[1]);
    g.rotate(lean * 0.4);
    g.scale(1 + squash * 0.18, 1 - squash * 0.14);
    if (bloom > 0) {
      const z = E.back(bloom);
      for (let i = 0; i < 6; i++) {
        const a = (i * TAU) / 6;
        g.save();
        g.rotate(a);
        g.beginPath();
        g.ellipse(0, -9 * z, 5.2 * z, 9 * z, 0, 0, TAU);
        inkFill(g, C.butterHi, 1.4);
        g.restore();
      }
    }
    g.beginPath();
    g.moveTo(0, -12 + 4 * bloom);
    g.quadraticCurveTo(10, -6, 7, 4);
    g.quadraticCurveTo(0, 8, -7, 4);
    g.quadraticCurveTo(-10, -6, 0, -12 + 4 * bloom);
    inkFill(g, bloom > 0.5 ? C.amber : GREEN, 1.5, bloom > 0.5 ? C.ink : GREEN_INK);
    if (shades > 0 && shadesA > 0) {
      g.save();
      g.globalAlpha *= Math.min(1, shades * 2) * shadesA;
      g.translate(0, -(1 - shades) * 30);
      for (const dx of [-3.8, 4.2]) {
        rr(g, dx - 3.4, -5, 6.8, 5, 2);
        inkFill(g, C.ink, 1);
      }
      ln(g, -0.4, -3.6, 0.8, -3.6, 1.2, C.ink);
      g.restore();
    }
    g.restore();
    return tip;
  }

  SC['how-photo-straw'] = {
    dur: 6.5,
    width: 460,
    label: 'A stick figure gives a potted plant a glass of water with a straw; the plant slurps it up, sunbathes in sunglasses, burps out an oxygen bubble, then grows a flower.',
    draw(g, S) {
      const T = S.on ? S.u * this.dur : -1;
      const t = S.t;
      let pose = breathe(HOLD, t);
      let onStool = false, lev = 1, bend = 0, lean = 0, leafUp = 0, squash = 0, bloom = 0, shades = 0, shadesA = 1, sunK = 0.1, o2 = null, flowK = 0;
      const slurps = [], burp = { k: 0 };
      if (T < 0) {
        const pk = pulse(t, 6, 2.2, 1.8);
        pose = mix(pose, P({ hF: [22, -86], head: [8, -114] }, pose), pk);
      } else {
        const back = E.soft(seg(T, 5.9, 6.4));
        const place = E.soft(seg(T, 0.15, 0.6)) * (1 - E.soft(seg(T, 0.65, 0.95)));
        const fetch = E.soft(seg(T, 5.45, 5.85)) * (1 - E.soft(seg(T, 5.9, 6.3)));
        pose = mix(pose, PLACE, Math.max(place, fetch));
        onStool = T >= 0.6 && T < 5.85;
        bend = E.soft(seg(T, 0.6, 0.9)) * (1 - E.soft(seg(T, 5.45, 5.75)));
        lev = lerp(1, 0.08, seg(T, 1.0, 2.0));
        lev = lerp(lev, 1, seg(T, 5.9, 6.4));
        flowK = seg(T, 1.0, 2.0);
        slurps.push(seg(T, 1.05, 1.6), seg(T, 1.55, 2.1));
        sunK = 0.1 + 0.9 * E.soft(seg(T, 1.9, 2.3)) * (1 - back);
        shades = E.soft(seg(T, 2.1, 2.45));
        shadesA = 1 - seg(T, 4.1, 4.3);
        const bathe = E.soft(seg(T, 2.35, 2.9)) * (1 - E.soft(seg(T, 3.3, 3.5)));
        lean = 0.5 * bathe;
        leafUp = Math.max(seg(T, 1.2, 1.8) * 0.3, bathe) * (1 - back);
        squash = Math.sin(Math.PI * seg(T, 3.4, 3.62));
        burp.k = seg(T, 3.58, 4.2);
        if (T >= 3.55 && T < 4.6) {
          const k = seg(T, 3.55, 4.45);
          o2 = { x: WP.x + 6 + Math.sin(k * 7) * 4, y: lerp(WP.top - BUD_H - 16, -172, E.out3(k)), z: E.back(seg(T, 3.55, 3.75)) * (1 - seg(T, 4.45, 4.6)) };
        }
        const gig = E.soft(seg(T, 3.6, 3.85)) * (1 - E.soft(seg(T, 4.2, 4.45)));
        pose = mix(pose, P({ hF: [GIGGLE.hF[0], GIGGLE.hF[1] + Math.sin(T * 30) * 1.5], head: GIGGLE.head }, pose), gig);
        bloom = E.soft(seg(T, 4.35, 4.8)) * (1 - back);
        const cheer = E.soft(seg(T, 4.75, 5.0)) * (1 - E.soft(seg(T, 5.2, 5.45)));
        pose = mix(pose, CHEER, cheer);
      }

      sun(g, SUN_W[0], SUN_W[1], 18 + sunK * 3, sunK, t);
      if (sunK > 0.3) {
        g.save();
        g.globalAlpha *= (sunK - 0.3) / 0.7 * (1 - bloom * 0.6);
        g.setLineDash([4, 5]);
        g.lineDashOffset = -t * 30;
        for (const dy of [-8, 6, 20]) {
          ln(g, SUN_W[0] - 20, SUN_W[1] + 14, WP.x + 30, WP.top - BUD_H + 10 + dy, 1.6, C.amber);
        }
        g.restore();
      }
      stool(g);
      const tip = flowerPlant(g, lean, leafUp, squash, bloom, shades, t, shadesA);
      pot(g, WP.x, WP.top, 46, 34);
      if (flowK > 0 && flowK < 1) {
        for (let i = 0; i < 3; i++) {
          const k = (flowK * 4 + i / 3) % 1;
          const y = lerp(WP.top - 4, tip[1] + 10, k);
          circle(g, lerp(WP.x, tip[0], k) + 0.5, y, 1.8);
          inkFill(g, '#d6e8f6', 0.9);
        }
      }
      if (onStool) {
        const pts = glass(g, GX, STOOL.y, lev, bend);
        if (flowK > 0 && flowK < 1) {
          for (let i = 0; i < 2; i++) {
            const pp = R.partial(pts, ((flowK * 5 + i / 2) % 1) * 0.98 + 0.01);
            const p = pp[pp.length - 1];
            circle(g, p[0], p[1], 1.6);
            inkFill(g, '#d6e8f6', 0.9);
          }
        }
      }
      const J = fig(g, pose, WFX, 0, {
        wave: S.wave,
        wt: S.wt,
        held: (gg, JJ) =>
          R.held(gg, JJ, (hF) => {
            if (!onStool) {
              glass(gg, hF[0], hF[1] + 15, lev, 0);
            }
          }),
      });
      slurps.forEach((k, i) => floatText(g, 'slurp', GX + 22 + i * 14, -112 - i * 8, k, C.umber, 10));
      if (o2) {
        bubble(g, o2.x, o2.y, 12 * o2.z, 'O2', o2.z > 0.05 ? 1 : 0);
      }
      sparks(g, WP.x + 6, -172, seg(T, 4.45, 4.85), 12, 6, C.muted);
      floatText(g, 'burp!', tip[0] + 44, tip[1] - 4, burp.k, C.ink, 12);
      sparks(g, tip[0], tip[1] - 6, seg(T, 4.7, 5.3), 20, 7, C.amber);
      floatText(g, 'hehe', J.w.head[0] - 16, J.w.head[1] - 14, seg(T, 3.65, 4.4), C.umber, 10);
    },
  };
})();
