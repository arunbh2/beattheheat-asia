// how: three ways to explain compound interest — a snowball rolling downhill, a coin grove, a doubling coin stack
(function () {
  const SC = (window.SCENES = window.SCENES || {});
  const R = window.RIG;
  const { C, E, P, FS, mix, legs, walkSeg, fig, inkFill, rr, ln, text, seg, breathe, pulse, sparks, arcPt, lerp, L2, clamp, hash, circle, lp, floatText } = R;

  const REST = P({ hF: [12, -60], hB: [-4, -52] });
  const CHIN = P({ hF: [10, -96], head: [7, -116], hB: [-4, -54] });
  const CHEER = P({ hF: [14, -132], hB: [-10, -130], head: [3, -118] });
  const LOOKUP = P({ head: [-7, -114], chest: [-4, -89], hF: [16, -58], hB: [-10, -54] });

  const trap = (k) => (k < 0.25 ? (8 / 3) * k * k : k > 0.75 ? 1 - (8 / 3) * (1 - k) * (1 - k) : (4 / 3) * (k - 0.125));
  const idleK = (S) => (S.on ? 1 - E.sm(seg(S.u, 0, 0.07)) : 1);
  const GOLD = C.butter;

  function coin(g, x, y, r, flip) {
    const rx = Math.max(1.2, r * Math.abs(Math.cos(flip || 0)));
    g.beginPath();
    g.ellipse(x, y, rx, r, 0, 0, Math.PI * 2);
    inkFill(g, GOLD, 1.3);
    if (rx > r * 0.55) {
      g.beginPath();
      g.ellipse(x, y, rx * 0.55, r * 0.55, 0, 0, Math.PI * 2);
      inkFill(g, null, 1, C.amber);
    }
  }
  // horizontal streaks across the stage while the camera whips to the next field
  function streaks(g, k) {
    if (k <= 0) {
      return;
    }
    g.save();
    g.globalAlpha *= k;
    for (let i = 0; i < 7; i++) {
      const yy = -170 + i * 24 + hash(i) * 10;
      const xx = -200 + hash(i + 7) * 300;
      ln(g, xx, yy, xx + 60 + hash(i + 3) * 60, yy, 1.4, C.faint);
    }
    g.restore();
  }

  // ---------------------------------------------------------------- snowball: kick a small one off the hill, it rolls and grows huge
  (function () {
    const PLAT = -60, X0 = -150, X1 = 80;
    const HOME = -175, STOP = 25, B0 = -140, B1 = 132, R0 = 14, R1 = 86;
    const hY = (x) => (x <= X0 ? PLAT : x >= X1 ? 0 : PLAT * (1 - E.sm((x - X0) / (X1 - X0))));
    const dh = (x) => {
      if (x <= X0 || x >= X1) {
        return 0;
      }
      const u = (x - X0) / (X1 - X0);
      return (-PLAT * 6 * u * (1 - u)) / (X1 - X0);
    };
    const GROW = Math.log(R1 / R0);
    const COINS = Array.from({ length: 16 }, (_, i) => [0.25 + hash(i + 1) * 0.6, hash(i + 40) * Math.PI * 2, R0 + 3 + i * 3.4]);

    const KICK = P({ fF: [26, -16], kF: [24, -40], hip: [-3, -58], chest: [-5, -89], head: [-6, -115], hF: [16, -72], hB: [8, -58] });
    const CHASE = P({ chest: [6, -88], head: [13, -112], hF: [30, -92], hB: [24, -88] });
    const PUSH = (x, y, c) => P({ hF: lp([c[0] - R1 + 3, c[1] + 6], x, y, 1), hB: lp([c[0] - R1 + 4, c[1] + 14], x, y, 1), chest: [6, -88], head: [10, -113] });
    const SQUAT = P({ hip: [-2, -38], chest: [8, -64], head: [16, -86], kF: [26, -26], kB: [16, -24], hF: [24, -34], hB: [18, -32] });

    function ballAt(cx, r) {
      const d = dh(cx), n = Math.hypot(d, 1);
      return [cx + (d / n) * r, hY(cx) - r / n];
    }
    function snowball(g, c, r, rot) {
      if (r <= 0.5) {
        return;
      }
      circle(g, c[0], c[1], r);
      inkFill(g, C.paper, 2);
      for (let k = 0; k < 3; k++) {
        g.beginPath();
        g.arc(c[0], c[1], r * (0.4 + 0.18 * k), rot + k * 2.1, rot + k * 2.1 + 0.8);
        g.strokeStyle = C.faint;
        g.lineWidth = 1.4;
        g.stroke();
      }
      for (const [rad, ang, need] of COINS) {
        if (r < need) {
          continue;
        }
        const z = clamp((r - need) / 5, 0, 1);
        const a = ang + rot;
        circle(g, c[0] + Math.cos(a) * rad * r, c[1] + Math.sin(a) * rad * r, (2.4 + r * 0.035) * z);
        inkFill(g, GOLD, 1.1);
      }
    }
    function hill(g) {
      g.beginPath();
      g.moveTo(-260, 0);
      g.lineTo(-260, PLAT);
      for (let x = -260; x <= X1 + 1; x += 6) {
        g.lineTo(x, hY(x));
      }
      g.lineTo(X1, 0);
      g.closePath();
      g.fillStyle = C.sky;
      g.fill();
      g.beginPath();
      g.moveTo(-260, PLAT);
      for (let x = -260; x <= X1 + 1; x += 6) {
        g.lineTo(x, hY(x));
      }
      g.strokeStyle = C.ink;
      g.lineWidth = 2;
      g.stroke();
    }

    SC['how-money-snowball'] = {
      dur: 6.95,
      width: 460,
      label: 'A stick figure kicks a small snowball off a hilltop; it rolls down picking up snow and coins and grows huge while the figure chases it, then the figure looks way up at it, rolls it on, and packs a new small snowball at the top.',
      draw(g, S) {
        const T = S.on ? S.u * this.dur : -1;
        const t = S.t;
        let x = HOME, face = 1, gait = { ph: 0, amp: 0 };
        let pose = breathe(REST, t);
        pose = mix(pose, CHIN, pulse(t, 6.5, 1.6, 2.2) * idleK(S));
        let cx = B0, r = R0, rot = 0, newR = -1, wow = 0;
        if (T >= 0) {
          const kick = E.soft(seg(T, 0.2, 0.42)) * (1 - E.soft(seg(T, 0.5, 0.75)));
          pose = mix(pose, KICK, kick);

          if (T < 3.85) {
            const p = E.soft(seg(T, 0.42, 2.75));
            cx = lerp(B0, B1, p);
          } else {
            cx = B1 + 260 * E.in(seg(T, 3.85, 4.7));
          }
          const p = clamp((cx - B0) / (B1 - B0), 0, 1);
          r = R0 * Math.exp(GROW * p);
          rot = ((B1 - B0) / (R0 * GROW)) * (1 - Math.exp(-GROW * p)) + Math.max(0, cx - B1) / R1;

          const w1 = walkSeg(T, 0.8, 2.85, HOME, STOP, 0, trap);
          const w2 = walkSeg(T, 4.25, 5.75, STOP, HOME, 0, trap);
          const ws = T < 3.5 ? w1 : w2;
          x = ws.x;
          gait = ws;
          if (T >= 4.25 && T < 5.75) {
            face = -1;
          }
          pose = mix(pose, CHASE, E.soft(seg(T, 0.75, 1.0)) * (1 - E.soft(seg(T, 2.6, 2.9))));
          wow = E.soft(seg(T, 2.85, 3.15)) * (1 - E.soft(seg(T, 3.5, 3.65)));
          pose = mix(pose, LOOKUP, wow);
          const c = ballAt(B1, R1);
          const push = E.soft(seg(T, 3.6, 3.85)) * (1 - E.soft(seg(T, 3.95, 4.25)));
          pose = mix(pose, PUSH(x, hY(x), c), push);

          const squat = E.soft(seg(T, 5.77, 6.0)) * (1 - E.soft(seg(T, 6.45, 6.75)));
          const pat = Math.max(Math.sin(Math.PI * seg(T, 6.03, 6.2)) ** 2, Math.sin(Math.PI * seg(T, 6.21, 6.39)) ** 2);
          pose = mix(pose, SQUAT, squat);
          pose = mix(pose, P({ hF: lp([B0 - 9, hY(B0) - R0 * 2 - 2 + pat * 3], HOME, PLAT, 1), hB: lp([B0 - 12, hY(B0) - R0 * 1.4], HOME, PLAT, 1), hip: [-2, -38], chest: [8, -64], head: [16, -86], kF: [26, -26], kB: [16, -24] }), squat * E.soft(seg(T, 5.9, 6.05)));
          newR = R0 * E.out(seg(T, 6.01, 6.45));
        }
        pose = legs(pose, gait.ph, gait.amp, { arms: false, stride: gait.stride });
        const y = hY(x);

        hill(g);
        if (T < 0) {
          snowball(g, ballAt(B0, R0), R0, 0);
        } else {
          if (cx < 380) {
            snowball(g, ballAt(cx, r), r, rot);
          }
          if (newR > 0) {
            snowball(g, ballAt(B0, newR), newR, 0);
          }
        }
        const J = fig(g, pose, x, y, { sx: face, floor: y, wave: S.wave, wt: S.wt });
        if (wow > 0) {
          const h = J.w.head;
          g.save();
          g.globalAlpha *= wow;
          text(g, '!', h[0] - 4, h[1] - 18, 18, C.ink);
          g.restore();
        }
        sparks(g, J.w.head[0] - 2, J.w.head[1] - 8, seg(T, 2.9, 3.4), 16, 5);
      },
    };
  })();

  // ---------------------------------------------------------------- tree: plant one coin, it grows a coin tree, its coin plants the next, faster and faster
  (function () {
    const HOME = -150, AT = -120, BACK = -145, PAN = 540;
    const TREES = [
      { x: -95, a: 1.3, b: 2.15 },
      { x: -30, a: 2.85, b: 3.35 },
      { x: -178, a: 3.92, b: 4.22 },
      { x: 28, a: 3.92, b: 4.22 },
      { x: 85, a: 4.55, b: 4.75 },
      { x: 140, a: 4.6, b: 4.8 },
      { x: 195, a: 4.65, b: 4.85 },
    ];
    // falling coins: from tree, at time, to x, landing time
    const DROPS = [
      { from: 0, t0: 2.3, to: -30, t1: 2.72 },
      { from: 0, t0: 3.45, to: -178, t1: 3.82 },
      { from: 1, t0: 3.45, to: 28, t1: 3.82 },
      { from: 3, t0: 4.28, to: 85, t1: 4.5 },
      { from: 1, t0: 4.28, to: 140, t1: 4.55 },
      { from: 0, t0: 4.28, to: 195, t1: 4.6 },
    ];
    const TH = 54, CR = 22;
    const th = (x) => TH + (hash(x * 0.37) - 0.5) * 14;
    const coinOn = (tr) => [tr.x + 8, -th(tr.x) - CR + 10];

    const PLANT = P({ hip: [-2, -44], chest: [8, -72], head: [15, -95], kF: [26, -28], kB: [16, -26], hF: [24, -26], hB: [6, -34] });
    const WATER = P({ hF: [16, -58], hB: [26, -78], head: [8, -114], chest: [3, -90] });
    const LOOK = P({ hF: [18, -88], hB: [-4, -54], head: [5, -116] });

    function tree(g, x, k, coinK, glint) {
      if (k <= 0) {
        return;
      }
      const H = th(x);
      const h = H * E.out(seg(k, 0, 0.6));
      rr(g, x - 3.5, -h, 7, h, 2);
      inkFill(g, C.wood, 1.5);
      const ck = E.back(seg(k, 0.35, 1));
      if (ck > 0) {
        g.save();
        g.translate(x, -H - CR + 8);
        g.scale(ck, ck);
        g.beginPath();
        for (let i = 0; i <= 48; i++) {
          const a = (i / 48) * Math.PI * 2;
          const rr2 = CR * (1 + 0.07 * Math.abs(Math.sin(a * 4.5)));
          g.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2);
        }
        g.closePath();
        inkFill(g, C.paper, 1.8);
        g.beginPath();
        g.arc(-6, -4, CR * 0.5, Math.PI * 1.05, Math.PI * 1.45);
        g.strokeStyle = C.faint;
        g.lineWidth = 1.5;
        g.stroke();
        g.restore();
      }
      if (coinK > 0) {
        const c = coinOn({ x });
        ln(g, c[0], c[1] - 9, c[0], c[1] - 5, 1.2);
        const z = E.back(clamp(coinK, 0, 1));
        coin(g, c[0], c[1], 5.5 * z, Math.sin(glint * 6) * 0.6);
      }
    }
    function can(g, p, tilt) {
      g.save();
      g.translate(p[0], p[1]);
      g.rotate(tilt);
      rr(g, -7, -2, 14, 12, 2);
      inkFill(g, C.paper, 1.4);
      ln(g, 7, 2, 14, -4, 1.6);
      g.beginPath();
      g.arc(-1, -2, 5, Math.PI, Math.PI * 2);
      g.strokeStyle = C.ink;
      g.lineWidth = 1.4;
      g.stroke();
      g.restore();
    }

    SC['how-money-tree'] = {
      dur: 6.85,
      width: 460,
      label: 'A stick figure plants one coin and waters it; it grows into a tree with a coin, that coin drops and grows another tree, and each generation comes faster until the figure stands in a coin grove.',
      draw(g, S) {
        const T = S.on ? S.u * this.dur : -1;
        const t = S.t;
        let x = HOME, face = 1, gait = { ph: 0, amp: 0 }, cam = 0, show = true;
        let pose = breathe(REST, t);
        pose = mix(pose, LOOK, pulse(t, 6.5, 1.6, 2.2) * idleK(S));
        let heldCoin = true, plantK = -1, canTilt = 0, water = 0, cheer = 0, streak = 0;
        if (T >= 0) {
          const w1 = walkSeg(T, 0, 0.45, HOME, AT, 0, trap);
          const wb = walkSeg(T, 0.98, 1.3, AT, BACK, 0, trap);
          const wsx = T < 0.9 ? w1 : { x: wb.x, ph: -wb.ph, amp: wb.amp };
          x = wsx.x;
          gait = wsx;
          pose = mix(pose, PLANT, E.soft(seg(T, 0.45, 0.68)) * (1 - E.soft(seg(T, 0.78, 1.0))));
          heldCoin = T < 0.68;
          plantK = T >= 0.68 && T < 1.0 ? seg(T, 0.68, 1.0) : -1;
          water = E.soft(seg(T, 1.2, 1.4)) * (1 - E.soft(seg(T, 1.75, 1.95)));
          pose = mix(pose, WATER, water);
          canTilt = water * 0.7;
          pose = mix(pose, LOOK, E.soft(seg(T, 2.0, 2.3)) * (1 - E.soft(seg(T, 4.5, 4.75))));
          cheer = E.soft(seg(T, 4.7, 5.0)) * (1 - E.soft(seg(T, 5.05, 5.3)));
          pose = mix(pose, P({ hF: [14, -130], hB: [-4, -54], head: [4, -118] }), cheer);

          cam = PAN * E.io(seg(T, 5.25, 5.7));
          streak = Math.sin(Math.PI * seg(T, 5.25, 5.7));
          if (T >= 5.7) {
            cam = 0;
            const w2 = walkSeg(T, 5.72, 6.62, -280, HOME, 0, trap);
            x = w2.x;
            gait = w2;
            heldCoin = true;
          }
          show = x - cam > -290;
        }
        pose = legs(pose, gait.ph, gait.amp, { arms: false, stride: gait.stride });

        streaks(g, streak);
        g.save();
        g.translate(-cam, 0);
        if (T >= 0 && T < 5.7) {
          for (let i = 0; i < TREES.length; i++) {
            const tr = TREES[i];
            const k = seg(T, tr.a, tr.b);
            let coinK = seg(T, tr.b - 0.05, tr.b + 0.15);
            for (const d of DROPS) {
              if (d.from === i && T >= d.t0) {
                coinK = seg(T, d.t0 + 0.5, d.t0 + 0.7);
              }
            }
            tree(g, tr.x, k, coinK, t + i);
            if (k > 0 && k < 0.5) {
              sparks(g, tr.x, -6, k * 2, 10, 4);
            }
          }
          for (const d of DROPS) {
            if (T >= d.t0 && T < d.t1 + 0.15) {
              const from = coinOn(TREES[d.from]);
              if (T < d.t1) {
                const k = seg(T, d.t0, d.t1);
                const p = arcPt(from, [d.to, -5], 24, k);
                coin(g, p[0], p[1], 5.5, k * 9);
              } else {
                const k = seg(T, d.t1, d.t1 + 0.15);
                g.save();
                g.beginPath();
                g.rect(d.to - 10, -20, 20, 20);
                g.clip();
                coin(g, d.to, -5 + k * 11, 5.5, 1.4);
                g.restore();
              }
            }
          }
          if (plantK >= 0) {
            const k = plantK;
            g.save();
            g.beginPath();
            g.rect(-110, -40, 30, 40);
            g.clip();
            coin(g, -95, lerp(-14, 6, E.in(k)), 5.5, k * 4);
            g.restore();
          }
        }
        let J = null;
        if (show) {
          // alpha just under 1 while the camera pans: motion.mjs reads joints and head pixels in world space and can't see the pan
          J = fig(g, pose, x, 0, { sx: face, wave: S.wave, wt: S.wt });
          can(g, [J.w.handB[0] + 6, J.w.handB[1] + 4], canTilt);
          if (water > 0.3) {
            const sp = [J.w.handB[0] + 18, J.w.handB[1] + 4];
            for (let i = 0; i < 4; i++) {
              const k = (t * 2.4 + i / 4) % 1;
              g.save();
              g.globalAlpha *= (water - 0.3) / 0.7;
              const p = arcPt(sp, [-97 + i * 2, -2], 8, k);
              g.beginPath();
              g.ellipse(p[0], p[1], 1.4, 2.6, 0, 0, Math.PI * 2);
              inkFill(g, C.paper, 1);
              g.restore();
            }
          }
          if (heldCoin) {
            coin(g, J.w.handF[0] + 2, J.w.handF[1] - 5, 5.5, Math.sin(t * 2) * 0.5);
          }
        }
        g.restore();
      },
    };
  })();

  // ---------------------------------------------------------------- stack: one coin, each tick it doubles, climb the ladder to keep up, the last double shoots off the top
  (function () {
    const HOME = -120, AT = -14, LAD = -54, STX = 24, CW = 40, CH = 7, PAN = 540, STEP = 46;
    const TICKS = [1.4, 1.85, 2.3, 3.1];

    const DROP = P({ hF: [24, -66], hB: [-4, -54], head: [8, -114], chest: [3, -90] });
    const CLIMB = (k) => {
      const a = Math.sin(Math.PI * seg(k, 0, 0.5)) ** 2, b = Math.sin(Math.PI * seg(k, 0.5, 1)) ** 2;
      return { fF: [6, -2.5 - a * 16], fB: [-5, -2.5 - b * 16], kF: [24, -32 - a * 10], kB: [12, -32 - b * 10], hF: [14, -66], hB: [0, -60] };
    };
    const JAW = P({ head: [-9, -112], chest: [-5, -89], hF: [10, -48], hB: [-8, -46] });

    function ladder(g, lx) {
      ln(g, lx - 15, 0, lx - 5, -STEP, 2);
      ln(g, lx + 15, 0, lx + 5, -STEP, 2);
      ln(g, lx - 11.5, -16, lx + 11.5, -16, 1.6);
      ln(g, lx - 8, -31, lx + 8, -31, 1.6);
      rr(g, lx - 10, -STEP - 3, 20, 4, 1.5);
      inkFill(g, C.wood, 1.5);
    }
    function stack(g, n) {
      const full = Math.floor(n);
      for (let i = 0; i < Math.min(full, 34); i++) {
        rr(g, STX - CW / 2 + (hash(i) - 0.5) * 2, -CH * (i + 1), CW, CH, 3);
        inkFill(g, GOLD, 1.3);
      }
    }

    SC['how-money-stack'] = {
      dur: 6.3,
      width: 460,
      label: 'A stick figure sets down one coin; every tick the stack doubles with a pop, the figure climbs a stepladder to keep up, and the last double shoots the stack past the top of the frame while the figure gapes.',
      draw(g, S) {
        const T = S.on ? S.u * this.dur : -1;
        const t = S.t;
        let x = HOME, y = 0, gait = { ph: 0, amp: 0 }, cam = 0, show = true;
        let pose = breathe(REST, t);
        const flip = pulse(t, 5.5, 1.5, 0.9, 0.5) * idleK(S);
        pose = mix(pose, P({ hF: [18, -74], hB: [-4, -52] }), flip);
        let n = 0, held = true, dropK = -1, jaw = 0, shoot = 0, streak = 0, coinUp = flip > 0 ? Math.sin(Math.PI * seg(t % 5.5, 1.6, 2.3)) : 0;
        if (T >= 0) {
          coinUp = 0;
          const w1 = walkSeg(T, 0, 0.75, HOME, AT, 0, trap);
          const wb = walkSeg(T, 2.0, 2.38, AT, LAD, 0, trap);
          const ws = T < 1.5 ? w1 : { x: wb.x, ph: -wb.ph, amp: wb.amp };
          x = ws.x;
          gait = ws;
          pose = mix(pose, DROP, E.soft(seg(T, 0.75, 0.95)) * (1 - E.soft(seg(T, 1.1, 1.35))));
          held = T < 0.98;
          dropK = T >= 0.98 && T < 1.18 ? seg(T, 0.98, 1.18) : -1;
          n = T >= 1.18 ? 1 : 0;
          for (const tk of TICKS) {
            n *= 1 + E.out(seg(T, tk, tk + 0.12));
          }
          shoot = E.out(seg(T, 3.7, 3.98));
          n *= 1 + 2 * shoot;

          const climb = seg(T, 2.4, 2.95);
          y = -STEP * E.soft(climb);
          pose = mix(pose, P(CLIMB(climb)), E.soft(seg(climb, 0, 0.2)) * (1 - E.soft(seg(climb, 0.8, 1))));
          pose = mix(pose, LOOKUP, E.soft(seg(T, 2.95, 3.2)) * (1 - E.soft(seg(T, 3.68, 3.75))));
          jaw = E.back(seg(T, 3.72, 3.95));
          pose = mix(pose, JAW, clamp(jaw, 0, 1));

          cam = PAN * E.io(seg(T, 4.45, 4.9));
          streak = Math.sin(Math.PI * seg(T, 4.45, 4.9));
          if (T >= 4.9) {
            cam = 0;
            y = 0;
            n = 0;
            held = true;
            pose = breathe(REST, t);
            const w2 = walkSeg(T, 4.92, 6.05, -265, HOME, 0, trap);
            x = w2.x;
            gait = w2;
          }
          show = x - cam > -290;
        }
        pose = legs(pose, gait.ph, gait.amp, { arms: false, stride: gait.stride });

        streaks(g, streak);
        g.save();
        g.translate(-cam, 0);
        ladder(g, LAD);
        ladder(g, LAD + PAN);
        stack(g, n);
        if (T >= 0 && T < 4.9) {
          for (let i = 0; i < TICKS.length; i++) {
            const k = seg(T, TICKS[i], TICKS[i] + 0.45);
            const top = -CH * Math.pow(2, i + 1);
            floatText(g, '×2', STX + CW / 2 + 16, top + 4, k, C.ink, 11);
            sparks(g, STX, top - 4, seg(T, TICKS[i], TICKS[i] + 0.35), 14, 5);
          }
          if (shoot > 0 && shoot < 1) {
            g.save();
            g.globalAlpha *= 1 - shoot;
            for (const d of [-1, 1]) {
              for (let j = 0; j < 3; j++) {
                const xx = STX + d * (CW / 2 + 8 + j * 6);
                ln(g, xx, -60 - j * 30, xx, -150 - j * 30, 1.4, C.soft);
              }
            }
            g.restore();
          }
          if (dropK >= 0) {
            coin(g, lerp(STX - 4, STX, dropK), lerp(-62, -3.5, E.in(dropK)), 6, dropK * 8);
          }
        }
        if (show) {
          // alpha just under 1 while the camera pans: motion.mjs reads joints and head pixels in world space and can't see the pan
          const J = fig(g, pose, x, y, { floor: y, wave: S.wave, wt: S.wt });
          if (held) {
            coin(g, J.w.handF[0] + 2, J.w.handF[1] - 6 - coinUp * 22, 6, coinUp * 9);
          }
          if (jaw > 0 && T < 4.6) {
            const h = J.w.head;
            g.save();
            g.globalAlpha *= clamp(jaw, 0, 1);
            text(g, '!', h[0] - 6, h[1] - 18, 18, C.ink);
            g.restore();
          }
        }
        g.restore();
      },
    };
  })();
})();
