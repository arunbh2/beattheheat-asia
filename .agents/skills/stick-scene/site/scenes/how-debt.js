// how: three ways to say "pay down tech debt" — a leaning tower restacked, a backpack of rocks set down, weeds pulled from a flower
(function () {
  const SC = (window.SCENES = window.SCENES || {});
  const R = window.RIG;
  const { C, E, P, FS, STRIDE, mix, legs, walkSeg, fig, inkFill, rr, ln, text, seg, breathe, pulse, lp, sparks, tickBadge, arcPt, lerp, L2, clamp, hash, shift, wline, circle, star } = R;

  const REST = P({ hF: [12, -60], hB: [-4, -52] });
  const CHIN = P({ hF: [10, -96], head: [7, -116], hB: [-4, -54] });
  const CHEER = P({ hF: [14, -132], hB: [-10, -130], head: [3, -118] });

  // idle gestures fade out over the first moment of an action so it never starts mid-gesture
  // walk ease with a long even middle, so fast walks don't whip the legs
  const trap = (k) => (k < 0.25 ? (8 / 3) * k * k : k > 0.75 ? 1 - (8 / 3) * (1 - k) * (1 - k) : (4 / 3) * (k - 0.125));
  const idleK = (S) => (S.on ? 1 - E.sm(seg(S.u, 0, 0.07)) : 1);

  function hexMix(a, b, k) {
    const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
    const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
    return `rgb(${pa.map((v, i) => Math.round(lerp(v, pb[i], k))).join(',')})`;
  }

  // ---------------------------------------------------------------- tower: quick fixes slapped on, the top one tips, a leaping save, tap-tap them straight, stomp it solid
  (function () {
    const BW = 52, BB = 26, BH = 22, TX = -70, X0 = -14, DIVE_X = 50;
    const BASE_H = BB * 3;
    const QDX = [6, 15], QROT = [0.08, 0.17];
    const FALL = [0.05, 0.6], CATCH = [0.4, 0.92], SLAP = [0.45, 0.96], REL = [0.7, 1.12];
    const TIP = 1.95, FLY = 2.18, GRAB = 2.51, PLACE = 4.23;
    const TAPS = [[4.43, 4.55], [4.71, 4.83]];
    const SLAM = 5.4;
    const G_UP = [26, -10];

    const UP = P({ hF: [20, -124], hB: [14, -121], head: [4, -117] });
    const EASY = P({ hF: [30, -96], hB: [24, -92], head: [-2, -115], chest: [-2, -90] });
    const DUCK = P({ hip: [2, -50], chest: [0, -78], head: [3, -99], kF: [22, -30], kB: [14, -30], hF: [12, -116], hB: [-4, -114] });
    const AIR = P({ hip: [0, -56], chest: [6, -86], head: [10, -110], fF: [14, -24], fB: [-20, -20], kF: [24, -44], kB: [-4, -40], hF: [24, -124], hB: [16, -123] });
    const LAND = P({ hip: [0, -50], chest: [4, -80], head: [8, -104], kF: [22, -30], kB: [14, -30], hF: [22, -118], hB: [14, -116] });
    const CARRY = P({ hF: [22, -100], hB: [16, -97], head: [2, -117] });
    const CROUCH = P({ hip: [0, -48], chest: [3, -78], head: [6, -102], kF: [22, -28], kB: [14, -28], hF: [16, -112], hB: [10, -110] });
    const JUMP = P({ fF: [6, -14], fB: [-4, -12], kF: [22, -40], kB: [14, -40], hF: [20, -128], hB: [14, -126], head: [4, -118] });

    const slot = (q, dx) => [TX + (dx ?? QDX[q]), -BASE_H - q * BH - BH / 2];
    const handsW = (pose, x, face) => [x + ((pose.hF[0] + pose.hB[0]) / 2) * FS * face, ((pose.hF[1] + pose.hB[1]) / 2) * FS];
    const CATCH_W = (() => {
      const h = handsW(AIR, (X0 + DIVE_X) / 2, 1);
      return [h[0], h[1] - 30 - 12];
    })();
    const TIP_W = [slot(1)[0] + 4, slot(1)[1] - 34];

    function block(g, c, rot, fill, la, w, h) {
      g.save();
      g.translate(c[0], c[1]);
      g.rotate(rot);
      rr(g, -(w || BW) / 2, -(h || BH) / 2, w || BW, h || BH, 3);
      inkFill(g, fill, 1.7);
      if (la > 0) {
        g.globalAlpha *= la;
        text(g, 'quick fix', 0, 3.6, 9.5, C.ink);
      }
      g.restore();
    }
    const quick = (g, c, rot) => block(g, c, rot, C.butter, 1);
    function column(g, heights, alpha) {
      if (alpha <= 0) {
        return;
      }
      g.save();
      g.globalAlpha *= alpha;
      let y = 0;
      for (const h of heights) {
        block(g, [TX, y - h / 2], 0, C.paper, 0, BW, h);
        y -= h;
      }
      g.restore();
    }

    SC['how-debt-tower'] = {
      dur: 6.7,
      width: 460,
      label: 'A stick figure slaps quick fix blocks onto a steady tower until it leans and the top one tips off; the figure leaps to catch it, taps every block straight, then jumps and stomps the tower back down solid, and a tick pops up.',
      draw(g, S) {
        const T = S.on ? S.u * this.dur : -1;
        const t = S.t;
        let x = X0, y = 0, face = -1, gait = { ph: 0, amp: 0 };
        let pose = breathe(REST, t);
        pose = mix(pose, CHIN, pulse(t, 6.5, 1.5, 2.2) * idleK(S));
        let sway = 0, creak = 0, tickK = 0, sweat = -1, held = null, heldRot = 0, grip = G_UP, squash = 0, merged = 0;
        const on = [0, 0], dx = QDX.slice(), rot = QROT.slice(), fix = [0, 0];
        const falling = [];
        let tipping = -1, flying = -1;
        if (T >= 0) {
          pose = mix(pose, UP, E.soft(seg(T, 0, 0.3)));
          for (let i = 0; i < 2; i++) {
            const hT = [slot(i)[0] + G_UP[0], slot(i)[1] - G_UP[1]];
            const sp = P({ hF: lp(hT, x, 0, -1), hB: lp([hT[0] + 4, hT[1] + 3], x, 0, -1), chest: [4, -89], head: [9, -114] });
            const back = i < 1 ? E.soft(seg(T, REL[i], REL[i] + 0.16)) : 0;
            pose = mix(pose, sp, E.soft(seg(T, SLAP[i], REL[i])) * (1 - back));
            if (T >= FALL[i] && T < CATCH[i]) {
              falling.push([i, seg(T, FALL[i], CATCH[i])]);
            }
            if (T >= CATCH[i] && T < REL[i]) {
              held = i;
              heldRot = QROT[i] * E.soft(seg(T, SLAP[i], REL[i]));
            }
            on[i] = T >= REL[i] ? 1 : 0;
          }
          pose = mix(pose, EASY, E.soft(seg(T, 1.2, 1.45)) * (1 - E.soft(seg(T, 1.9, 2.08))));
          pose = mix(pose, DUCK, E.soft(seg(T, 1.92, 2.12)));

          const amp = 0.015 * on[0] + 0.035 * on[1];
          const calm = 1 - E.soft(seg(T, 2.3, 3.0));
          sway = on[0] ? amp * Math.sin((T - REL[0]) * Math.PI * 2 * (1.6 + 0.5 * on[1])) * Math.min(1, (T - REL[0]) * 5) * calm : 0;
          creak = seg(T, 1.2, 1.3) * (1 - seg(T, 2.2, 2.4));

          if (T >= TIP && T < FLY) {
            tipping = E.in(seg(T, TIP, FLY));
            on[1] = 0;
          } else if (T >= FLY && T < GRAB) {
            flying = seg(T, FLY, GRAB);
            on[1] = 0;
          } else if (T >= GRAB && T < PLACE) {
            on[1] = 0;
          }

          if (T >= 2.23 && T < 3.35) {
            face = 1;
          }
          if (T >= 2.23) {
            const k = seg(T, 2.23, 2.79);
            x = lerp(X0, DIVE_X, E.soft(k));
            y = -Math.sin(Math.PI * k) * 30;
            pose = mix(pose, AIR, E.soft(seg(T, 2.23, 2.47)));
            pose = mix(pose, LAND, E.soft(seg(T, 2.59, 2.81)));
          }
          if (T >= GRAB && T < PLACE) {
            held = 1;
            heldRot = 0;
            grip = L2([0, -12], G_UP, E.soft(seg(T, 3.03, 3.33)));
          }
          sweat = T >= 2.81 && T < 3.28 ? seg(T, 2.81, 3.28) : -1;
          pose = mix(pose, CARRY, E.soft(seg(T, 3.03, 3.33)));
          if (T >= 3.35) {
            const ws = walkSeg(T, 3.35, 3.98, DIVE_X, X0, 0, trap);
            x = ws.x;
            gait = ws;
          }

          const place = [slot(1, 7)[0] + G_UP[0], slot(1, 7)[1] - G_UP[1]];
          pose = mix(pose, P({ hF: lp(place, x, 0, -1), hB: lp([place[0] + 4, place[1] + 3], x, 0, -1), chest: [4, -89], head: [8, -115] }), E.soft(seg(T, 3.98, 4.18)));
          if (T >= PLACE) {
            on[1] = 1;
            dx[1] = 7;
            rot[1] = 0.06;
          }

          let tapPose = null;
          for (let q = 0; q < 2; q++) {
            const [c1, c2] = TAPS[q];
            fix[q] = 0.5 * E.out(seg(T, c1, c1 + 0.06)) + 0.5 * E.out(seg(T, c2, c2 + 0.06));
            dx[q] *= 1 - fix[q];
            rot[q] *= 1 - fix[q];
            const bump = Math.max(Math.sin(Math.PI * seg(T, c1 - 0.08, c1 + 0.06)) ** 2, Math.sin(Math.PI * seg(T, c2 - 0.08, c2 + 0.06)) ** 2);
            const edge = [TX + dx[q] + BW / 2 + 1 + 8 * (1 - bump), slot(q)[1]];
            const tp = P({ hF: lp(edge, x, 0, -1), hB: lp([place[0] + 4, place[1] + 3], x, 0, -1), chest: [4, -89], head: [9, -114] });
            tapPose = q === 0 ? tp : mix(tapPose, tp, E.soft(seg(T, c1 - 0.2, c1 - 0.08)));
          }
          pose = mix(pose, tapPose, E.soft(seg(T, PLACE, 4.39)));
          pose = mix(breathe(REST, t), pose, 1 - E.soft(seg(T, 4.88, 5.16)));

          // stomp it solid: crouch, jump, slam both hands on top, the stack packs down
          squash = E.sm(seg(T, SLAM - 0.02, SLAM + 0.14));
          const bounce = Math.sin(Math.PI * seg(T, SLAM + 0.12, SLAM + 0.34)) ** 2 * 0.05;
          merged = E.soft(seg(T, SLAM + 0.12, SLAM + 0.26));
          const topY = -lerp(BASE_H + 2 * BH, BASE_H, squash) * (1 + bounce * squash);
          y = -24 * E.sm(seg(T, 5.1, 5.34)) * (1 - E.sm(seg(T, SLAM - 0.06, SLAM + 0.14)));
          pose = mix(pose, CROUCH, E.soft(seg(T, 4.9, 5.12)) * (1 - E.soft(seg(T, 5.12, 5.28))));
          pose = mix(pose, JUMP, E.soft(seg(T, 5.1, 5.28)));
          const slamP = P({ hF: lp([TX + 20, topY - 1], x, y, -1), hB: lp([TX + 12, topY - 1], x, y, -1), chest: [5, -88], head: [10, -112] });
          pose = mix(pose, slamP, E.soft(seg(T, 5.24, SLAM + 0.02)));
          pose = mix(pose, breathe(REST, t), E.soft(seg(T, 5.7, 6.05)));
          tickK = seg(T, SLAM + 0.2, SLAM + 0.45) * (1 - seg(T, 6.2, 6.5));
        }
        pose = legs(pose, gait.ph, gait.amp, { arms: false, stride: gait.stride });

        // tower: the steady base, plus whatever has been slapped on
        if (T < SLAM || T < 0) {
          column(g, [BB, BB, BB], 1);
          g.save();
          g.translate(TX, -BASE_H);
          g.rotate(sway);
          g.translate(-TX, BASE_H);
          for (let q = 0; q < 2; q++) {
            if (on[q]) {
              block(g, slot(q, dx[q]), rot[q], hexMix(C.butter, C.paper, fix[q]), 1 - fix[q]);
            }
          }
          g.restore();
        } else {
          const H = lerp(BASE_H + 2 * BH, BASE_H, squash);
          const k = H / (BASE_H + 2 * BH);
          const bounce = 1 + Math.sin(Math.PI * seg(T, SLAM + 0.12, SLAM + 0.34)) ** 2 * 0.05 * squash;
          column(g, [BB, BB, BB, BH, BH].map((h) => h * k * bounce), 1 - merged);
          column(g, [BB, BB, BB].map((h) => h * bounce), merged);
          const dust = seg(T, SLAM + 0.08, SLAM + 0.6);
          if (dust > 0 && dust < 1) {
            g.save();
            g.globalAlpha *= 1 - E.in(dust);
            for (const d of [-1, 1]) {
              for (let j = 0; j < 3; j++) {
                const r = 4 + E.out(dust) * (4 + j * 1.5);
                circle(g, TX + d * (BW / 2 + 4 + E.out(dust) * 18 + j * 7), -r * 0.7, r);
                inkFill(g, '#f3f3f3', 1.2, C.soft);
              }
            }
            g.restore();
          }
        }
        if (creak > 0) {
          const s = Math.sin(t * 30) > 0 ? 1 : -1;
          g.save();
          g.globalAlpha *= creak;
          for (const [cx, cy] of [[TX - BW / 2 - 6, -BASE_H], [TX + BW / 2 + 8, -BASE_H - BH + sway * 40]]) {
            wline(g, [[cx, cy - 6], [cx + 3 * s, cy - 2], [cx - 3 * s, cy + 2], [cx, cy + 6]], 1.3, C.ink, 0.3, 3);
          }
          g.restore();
        }
        for (let i = 0; i < 2; i++) {
          const k = seg(T, REL[i], REL[i] + 0.3);
          if (k > 0 && k < 1) {
            const c = slot(i);
            sparks(g, c[0] - BW / 2 - 4, c[1] + 6, k, 9, 3);
            sparks(g, c[0] + BW / 2 + 4, c[1] + 6, k, 9, 3);
          }
        }
        sparks(g, TX, -BASE_H - 16, seg(T, SLAM + 0.15, SLAM + 0.7), 18, 7);
        tickBadge(g, TX, -BASE_H - 20, tickK, 11, C.butter, C.ink);

        const J = fig(g, pose, x, y, { sx: face, floor: 0, wave: S.wave, wt: S.wt });

        for (const [i, k] of falling) {
          const to = handsW(UP, X0, -1);
          const c = [to[0] - G_UP[0], to[1] + G_UP[1]];
          quick(g, L2([c[0], -215], c, E.in(k)), (1 - k) * 0.4);
        }
        if (held !== null) {
          const m = [(J.w.handF[0] + J.w.handB[0]) / 2, (J.w.handF[1] + J.w.handB[1]) / 2];
          quick(g, [m[0] + grip[0] * face, m[1] + grip[1]], heldRot);
        }
        if (tipping >= 0) {
          quick(g, L2(slot(1), TIP_W, E.out(tipping)), lerp(QROT[1], 0.6, tipping));
        }
        if (flying >= 0) {
          quick(g, arcPt(TIP_W, CATCH_W, 22, flying), lerp(0.6, Math.PI * 2, flying));
        }
        if (sweat >= 0) {
          const h = J.w.head;
          const p = arcPt([h[0] - 6, h[1] - 8], [h[0] - 20, h[1] + 4], 10, sweat);
          g.save();
          g.globalAlpha *= 1 - E.in(sweat);
          g.beginPath();
          g.moveTo(p[0], p[1] - 5);
          g.quadraticCurveTo(p[0] + 3.5, p[1], p[0], p[1] + 2.5);
          g.quadraticCurveTo(p[0] - 3.5, p[1], p[0], p[1] - 5);
          inkFill(g, C.paper, 1.2);
          g.restore();
        }
      },
    };
  })();

  // ---------------------------------------------------------------- backpack: rocks pile on, the walk slows, set them down, walk off light
  (function () {
    const HOME = -170, EXIT = 280, ENTER = -265, VMAX = 175, DEC = 0.6;
    const LANDS = [0.6, 1.1, 1.6];
    const WORDS = ['hack', 'todo', 'temp'];
    const ROCK = [[32, 19], [30, 18], [31, 17]];
    const UNLOAD = [2.69, 2.57, 2.45];
    const DT = 1 / 240;
    const PACK = '#fde68a';

    function vAt(T) {
      if (T < 2.4) {
        let v = 78 * E.soft(seg(T, 0, 0.35));
        v = lerp(v, 50, E.soft(seg(T, LANDS[0], LANDS[0] + 0.3)));
        v = lerp(v, 28, E.soft(seg(T, LANDS[1], LANDS[1] + 0.3)));
        v = lerp(v, 11, E.soft(seg(T, LANDS[2], LANDS[2] + 0.3)));
        return v * (1 - E.soft(seg(T, 2.0, 2.4)));
      }
      return VMAX * E.soft(seg(T, 3.32, 3.72));
    }
    const XT = [];
    let exitT = 0;
    {
      let xx = HOME;
      for (let i = 0; i < 8 / DT; i++) {
        XT.push(xx);
        xx += vAt(i * DT) * DT;
        if (!exitT && xx > EXIT) {
          exitT = i * DT;
        }
      }
    }
    const DEC_D = (VMAX * DEC) / 2;
    const CRUISE = (HOME - ENTER - DEC_D) / VMAX;
    const RE = exitT + 0.06, RE_LEN = CRUISE + DEC;
    const DUR = RE + RE_LEN + 0.3;
    const xAt = (T) => {
      const f = clamp(T / DT, 0, XT.length - 1);
      const i = Math.floor(f);
      return lerp(XT[i], XT[Math.min(XT.length - 1, i + 1)], f - i);
    };
    const STOP = xAt(2.4);
    const GROUND = [[STOP - 76, -10], [STOP - 61, -29], [STOP - 46, -10]];

    const STRAPS = P({ hF: [9, -78], hB: [4, -76] });
    const LOADS = [
      P({ chest: [5, -86], head: [11, -110], hip: [1, -55], hF: [12, -78], hB: [7, -76] }),
      P({ chest: [9, -80], head: [17, -103], hip: [2, -50], hF: [15, -72], hB: [10, -70] }),
      P({ chest: [14, -73], head: [23, -95], hip: [3, -45], hF: [19, -65], hB: [14, -63] }),
    ];
    const SQUAT = P({ hip: [-4, -40], chest: [4, -71], head: [10, -96], kF: [24, -22], kB: [14, -22], hF: [22, -34], hB: [14, -32] });
    const STRETCH = P({ hF: [14, -132], hB: [-10, -130], head: [2, -119] });

    function packFrame(pose) {
      const vx = pose.chest[0] - pose.hip[0], vy = pose.chest[1] - pose.hip[1];
      const l = Math.hypot(vx, vy) || 1;
      const u = [vx / l, vy / l];
      const nb = [u[1], -u[0]];
      const c = L2(pose.hip, pose.chest, 0.6);
      return { c: [c[0] + nb[0] * 16, c[1] + nb[1] * 16], ang: Math.atan2(u[1], u[0]) + Math.PI / 2 };
    }
    const rockLocal = (i) => [-15 + i * 1.5, -21 - 6 - i * 16];
    const toPack = (pf, p) => {
      const c = Math.cos(pf.ang), s = Math.sin(pf.ang);
      return [pf.c[0] + p[0] * c - p[1] * s, pf.c[1] + p[0] * s + p[1] * c];
    };
    const toWorld = (p, x, y) => [x + p[0] * FS, (y || 0) + p[1] * FS];

    function puff(g, px, py, k, r, dir) {
      if (k <= 0 || k >= 1) {
        return;
      }
      g.save();
      g.globalAlpha *= 1 - E.in(k);
      for (let j = 0; j < 3; j++) {
        const rr2 = r * (0.5 + E.out(k) * (0.7 + j * 0.2));
        circle(g, px + dir * (j - 1) * r * 0.9 - dir * k * 10, py - rr2 * 0.7 - j * 1.5, rr2);
        inkFill(g, '#f3f3f3', 1.2, C.soft);
      }
      g.restore();
    }
    function drop(g, p, a) {
      if (a <= 0) {
        return;
      }
      g.save();
      g.globalAlpha *= a;
      g.beginPath();
      g.moveTo(p[0], p[1] - 6.5);
      g.quadraticCurveTo(p[0] + 4.5, p[1], p[0], p[1] + 3);
      g.quadraticCurveTo(p[0] - 4.5, p[1], p[0], p[1] - 6.5);
      inkFill(g, '#ffffff', 1.3);
      g.restore();
    }

    function rock(g, i, rot, alpha, sc) {
      if (alpha <= 0) {
        return;
      }
      const [w, h] = ROCK[i];
      g.save();
      g.globalAlpha *= alpha;
      g.rotate(rot);
      g.scale(sc, sc);
      g.beginPath();
      const n = 14;
      for (let j = 0; j <= n; j++) {
        const a = (j / n) * Math.PI * 2;
        const r = 1 + (hash(i * 31 + (j % n)) - 0.5) * 0.14;
        const px = Math.cos(a) * (w / 2) * r, py = Math.sin(a) * (h / 2) * r * (Math.sin(a) > 0 ? 0.9 : 1);
        if (j === 0) {
          g.moveTo(px, py);
        } else {
          g.lineTo(px, py);
        }
      }
      g.closePath();
      inkFill(g, '#e7e5e4', 1.6);
      text(g, WORDS[i], 0, 3.4, 9.5, C.ink);
      g.restore();
    }

    SC['how-debt-backpack'] = {
      dur: DUR,
      width: 460,
      label: 'A stick figure walks with a backpack while rocks labelled hack, todo and temp drop into it, slowing the walk to a crawl, then sets the rocks down and walks off light and quick.',
      draw(g, S) {
        const T = S.on ? S.u * this.dur : -1;
        const t = S.t;
        let x = HOME, y = 0, gait = { ph: 0, amp: 0 }, v = 0;
        let pose = breathe(REST, t);
        pose = mix(pose, STRAPS, pulse(t, 6, 1.4, 1.8) * idleK(S));
        const inPack = [0, 0, 0], fallK = [-1, -1, -1], offK = [-1, -1, -1], onGround = [0, 0, 0];
        let groundA = 1, show = true, light = 0;
        if (T >= 0) {
          pose = mix(pose, STRAPS, E.soft(seg(T, 0, 0.3)) * (1 - E.soft(seg(T, 2.85, 3.15))));
          let loaded = pose;
          for (let i = 0; i < 3; i++) {
            loaded = mix(loaded, LOADS[i], E.soft(seg(T, LANDS[i], LANDS[i] + 0.3)));
          }
          pose = mix(pose, loaded, 1 - E.soft(seg(T, 2.15, 2.4)));
          for (let i = 0; i < 3; i++) {
            const b = Math.sin(Math.PI * seg(T, LANDS[i], LANDS[i] + 0.3)) ** 2;
            pose = shift(pose, 0, b * (3 + i * 2), ['head', 'chest', 'hip', 'hF', 'hB']);
          }
          const squat = E.soft(seg(T, 2.15, 2.45)) * (1 - E.soft(seg(T, 2.98, 3.18)));
          pose = mix(pose, SQUAT, squat);
          const stretch = E.soft(seg(T, 2.98, 3.24)) * (1 - E.soft(seg(T, 3.38, 3.72)));
          pose = mix(pose, STRETCH, stretch);
          y = -Math.sin(Math.PI * seg(T, 3.0, 3.36)) * 16;

          if (T < RE) {
            x = xAt(T);
            v = (xAt(T + 0.02) - xAt(T - 0.02)) / 0.04;
            gait = { ph: (x - HOME) / (STRIDE * 2 * FS), amp: clamp(v / 10, 0, 1) };
          } else {
            const tt = Math.min(T - RE, RE_LEN);
            const d = Math.max(0, tt - CRUISE);
            x = ENTER + VMAX * Math.min(tt, CRUISE) + VMAX * d - (VMAX / DEC / 2) * d * d;
            v = VMAX * (1 - d / DEC);
            gait = { ph: (x - ENTER) / (STRIDE * 2 * FS), amp: clamp(v / 10, 0, 1) };
          }
          light = clamp((v - 50) / 150, 0, 1) * E.soft(seg(T, 3.45, 3.9));
          if (light > 0) {
            const sw = Math.sin(gait.ph * Math.PI * 2) * 12;
            pose = mix(pose, P({ hF: [18 + sw * 0.45, -54], hB: [2 - sw, -56], head: [3, -118] }), light);
          }
          show = x < EXIT && x > ENTER;

          for (let i = 0; i < 3; i++) {
            if (T >= LANDS[i] - 0.4 && T < LANDS[i]) {
              fallK[i] = seg(T, LANDS[i] - 0.4, LANDS[i]);
            }
            if (T >= LANDS[i] && T < UNLOAD[i]) {
              inPack[i] = 1;
            }
            if (T >= UNLOAD[i] && T < UNLOAD[i] + 0.32) {
              offK[i] = seg(T, UNLOAD[i], UNLOAD[i] + 0.32);
            }
            if (T >= UNLOAD[i] + 0.32) {
              onGround[i] = 1;
            }
          }
          groundA = 1 - E.soft(seg(T, RE + 0.1, RE + 0.6));
        }
        pose = legs(pose, gait.ph, gait.amp, { arms: false, stride: gait.stride });
        const pf = packFrame(pose);

        for (let i = 0; i < 3; i++) {
          if (onGround[i]) {
            g.save();
            g.translate(GROUND[i][0], GROUND[i][1]);
            rock(g, i, [0.04, -0.06, 0.08][i], groundA, 1);
            g.restore();
          }
        }

        if (light > 0.2 && show) {
          g.save();
          g.globalAlpha *= (light - 0.2) / 0.8;
          for (let j = 0; j < 3; j++) {
            const y = -88 + j * 20;
            ln(g, x - 34 - j * 4, y, x - 52 - j * 6, y, 1.5, C.soft);
          }
          g.restore();
        }

        let J = null;
        if (show) {
          J = fig(g, pose, x, y, {
            floor: 0,
            wave: S.wave,
            wt: S.wt,
            behind: (gg) => {
              gg.save();
              gg.translate(pf.c[0], pf.c[1]);
              gg.rotate(pf.ang);
              for (let i = 2; i >= 0; i--) {
                if (inPack[i]) {
                  gg.save();
                  const p = rockLocal(i);
                  gg.translate(p[0], p[1]);
                  gg.scale(1 / FS, 1 / FS);
                  rock(gg, i, [0.05, -0.07, 0.04][i], 1, 1);
                  gg.restore();
                }
              }
              rr(gg, -13, -21, 26, 42, 6);
              inkFill(gg, PACK, 1.8);
              ln(gg, -13, -9, 13, -9, 1.5);
              rr(gg, -7, 2, 14, 11, 3);
              inkFill(gg, null, 1.4);
              gg.restore();
            },
            mid: (gg, J) => {
              const top = toPack(pf, [11, -18]);
              const bot = toPack(pf, [11, 12]);
              const sh = J.sh;
              gg.strokeStyle = C.ink;
              gg.lineWidth = 2;
              gg.lineCap = 'round';
              gg.beginPath();
              gg.moveTo(top[0], top[1]);
              gg.quadraticCurveTo(sh[0] + 3, sh[1] - 6, sh[0] + 6, sh[1] + 10);
              gg.quadraticCurveTo(sh[0] + 5, sh[1] + 22, bot[0], bot[1]);
              gg.stroke();
            },
          });
        }

        for (let i = 0; i < 3; i++) {
          if (fallK[i] >= 0) {
            const to = toWorld(toPack(pf, rockLocal(i)), x, y);
            const from = [to[0] + 28, -215];
            g.save();
            const p = L2(from, to, E.in(fallK[i]));
            g.translate(p[0], p[1]);
            rock(g, i, (1 - fallK[i]) * 0.6, 1, 1);
            g.restore();
          }
          if (offK[i] >= 0) {
            const from = toWorld(toPack(pf, rockLocal(i)), x, y);
            const p = arcPt(from, GROUND[i], 10, E.in(offK[i]));
            g.save();
            g.translate(p[0], p[1]);
            rock(g, i, lerp(0, [0.04, -0.06, 0.08][i], offK[i]), 1, 1);
            g.restore();
          }
        }
        if (T >= 0) {
          for (let i = 0; i < 3; i++) {
            const k = seg(T, LANDS[i], LANDS[i] + 0.45);
            const xl = xAt(LANDS[i]);
            puff(g, xl - 8, 0, k, 5 + i * 2, -1);
            puff(g, xl + 12, 0, k, 5 + i * 2, 1);
            if (J && k > 0 && k < 0.5) {
              const top = toWorld(toPack(packFrame(pose), rockLocal(i)), x, y);
              sparks(g, top[0], top[1] - 8, k * 2, 12, 5);
            }
          }
          puff(g, STOP - 4, 0, seg(T, 3.3, 4.0), 10, -1);
          if (J) {
            for (let j = 0; j < 3; j++) {
              const a = 1.7 + j * 0.22;
              const k = seg(T, a, a + 0.4);
              if (k > 0 && k < 1) {
                const h = J.w.head;
                drop(g, arcPt([h[0] + 7, h[1] - 6], [h[0] + 20 + j * 3, h[1] + 10], 9, k), 1 - E.in(k));
              }
            }
          }
        }
      },
    };
  })();

  // ---------------------------------------------------------------- weeds: pull one, another sneaks up behind, double-take, yank both, the flower shoots up and the bee comes back
  (function () {
    const HOME = -120, FLOWER = 55, S0 = -18;
    const WA = { x: -2, h: 56, seed: 0.7 }, WC = { x: 14, h: 62, seed: 2.9 }, WB = { x: -48, h: 54, seed: 5.1 };
    const BED = [-92, 150];
    const SOIL = '#e3d3bd';
    const BEE_OFF = [250, -200];

    const LEAN = { head: [10, -113], chest: [4, -89] };
    const STARTLE = P({ hF: [22, -100], hB: [8, -78], head: [-3, -118], chest: [-2, -91] });

    function bed(g) {
      g.beginPath();
      g.moveTo(BED[0], 0);
      g.bezierCurveTo(BED[0] + 30, -8, BED[1] - 30, -8, BED[1], 0);
      g.closePath();
      inkFill(g, SOIL, 1.5);
      for (let i = 0; i < 9; i++) {
        const px = lerp(BED[0] + 20, BED[1] - 20, i / 8) + (hash(i) - 0.5) * 10;
        g.fillStyle = '#b89b78';
        g.beginPath();
        g.arc(px, -2.5 - hash(i + 9) * 2, 0.9, 0, Math.PI * 2);
        g.fill();
      }
    }

    function weed(g, w, k, lifted, rot) {
      if (k <= 0) {
        return;
      }
      const H = w.h * E.out3(k);
      g.save();
      g.rotate(rot || 0);
      const top = [Math.sin(w.seed) * 4, -H];
      const pts = [];
      for (let j = 0; j <= 6; j++) {
        const f = j / 6;
        pts.push([top[0] * f + Math.sin(f * 7 + w.seed) * 2.2, -H * f]);
      }
      wline(g, pts, 2, C.ink, 0.6, w.seed);
      const pairs = Math.max(1, Math.round(4 * k));
      for (let j = 0; j < pairs; j++) {
        const f = 0.22 + j * 0.2;
        const p = [top[0] * f, -H * f];
        const L = (9 + (j % 2) * 3) * Math.min(1, k * 1.4);
        for (const d of [-1, 1]) {
          g.beginPath();
          g.moveTo(p[0], p[1]);
          g.lineTo(p[0] + d * L * 0.55, p[1] - L * 0.15);
          g.lineTo(p[0] + d * L, p[1] - L * 0.55);
          g.lineTo(p[0] + d * L * 0.45, p[1] - L * 0.42);
          g.closePath();
          inkFill(g, '#d6d6d6', 1.3);
        }
      }
      if (lifted > 0) {
        g.globalAlpha *= lifted;
        for (let j = -1; j <= 1; j++) {
          wline(g, [[0, 0], [j * 4, 6], [j * 7, 12 + Math.abs(j) * 2]], 1.2, C.ink, 0.4, w.seed + j);
        }
      }
      g.restore();
    }
    const topOf = (w) => [w.x + Math.sin(w.seed) * 4, -2 - w.h];

    function flower(g, h, t) {
      const L = lerp(44, 124, h);
      const droop = Math.max(0, 1 - h) * 2.2;
      const sway = Math.sin(t * 1.6) * 0.03 * clamp(h, 0, 1);
      const pts = [[FLOWER, -3]];
      let ang = 0;
      for (let i = 1; i <= 16; i++) {
        const f = i / 16;
        ang = droop * E.sm(seg(f, 0.35, 1)) + sway * f;
        const pr = pts[i - 1];
        pts.push([pr[0] + Math.sin(ang) * (L / 16), pr[1] - Math.cos(ang) * (L / 16)]);
      }
      const head = pts[16];
      const leafY = -3 - L * 0.3;
      for (const d of [-1, 1]) {
        g.save();
        g.translate(FLOWER, leafY + (d > 0 ? 6 : 0));
        g.rotate(d * (0.9 + Math.max(0, 1 - h) * 0.5));
        g.beginPath();
        g.ellipse(0, -9, 4, 9, 0, 0, Math.PI * 2);
        inkFill(g, C.paper, 1.4);
        g.restore();
      }
      R.strokePath(g, pts, 2.4, C.ink);
      const open = clamp(h, 0, 1);
      const pr = lerp(4, 12, h);
      const fill = hexMix('#ece6cf', C.butter, open);
      g.save();
      g.translate(head[0], head[1]);
      g.rotate(ang);
      const n = 7;
      for (let i = 0; i < n; i++) {
        const pa = (i / n) * Math.PI * 2 * (0.35 + 0.65 * open) - Math.PI / 2 - Math.PI * (1 - open) * 0.35;
        g.save();
        g.rotate(pa + Math.PI / 2);
        g.beginPath();
        g.ellipse(0, -pr * 0.95, pr * 0.42, pr * 0.72, 0, 0, Math.PI * 2);
        inkFill(g, fill, 1.4);
        g.restore();
      }
      circle(g, 0, 0, lerp(3, 5.5, open));
      inkFill(g, C.amber, 1.4);
      g.restore();
      return head;
    }

    function bee(g, p, dir, t) {
      g.save();
      g.translate(p[0], p[1]);
      g.scale(dir, 1);
      const f = Math.abs(Math.sin(t * 46));
      for (const wx of [-1.5, 2]) {
        g.beginPath();
        g.ellipse(wx, -5, 2.6, 4 * (0.4 + 0.6 * f), wx < 0 ? -0.4 : 0.3, 0, Math.PI * 2);
        inkFill(g, 'rgba(255,255,255,0.9)', 1);
      }
      g.beginPath();
      g.ellipse(0, 0, 6.5, 4.3, 0, 0, Math.PI * 2);
      inkFill(g, C.butter, 1.3);
      ln(g, -1.5, -3.8, -1.5, 3.8, 1.4);
      ln(g, 2, -3.6, 2, 3.6, 1.4);
      ln(g, -6.5, 0, -9, 0, 1.2);
      g.restore();
    }
    const orbit = (head, t) => [head[0] + Math.cos(t * 1.7) * 28, head[1] - 32 + Math.sin(t * 3.4) * 5];

    SC['how-debt-weeds'] = {
      dur: 5.7,
      width: 460,
      label: 'Weeds sprout around a flower and the bee flies off; a stick figure pulls one, another sneaks up behind it, it does a double-take, yanks the last two out at once, and the flower shoots up and blooms as the bee comes back.',
      draw(g, S) {
        const T = S.on ? S.u * this.dur : -1;
        const t = S.t;
        let x = HOME, y = 0, face = 1, gait = { ph: 0, amp: 0 };
        let pose = breathe(REST, t);
        pose = mix(pose, P({ hF: [10, -62], hB: [-6, -56], head: [9, -115], chest: [2, -90] }), pulse(t, 6.5, 1.8, 2.4) * idleK(S));
        let h = 1, beeLeave = 0, beeBack = 1, bang = 0;
        const grow = { A: 0, C: 0, B: 0 };
        let heldA = -1, heldBC = -1, flingA = -1, flingBC = -1;
        if (T >= 0) {
          grow.A = T < 1.37 ? seg(T, 0.0, 0.8) : 0;
          grow.C = T < 2.87 ? seg(T, 0.2, 1.0) : 0;
          grow.B = T < 2.87 ? E.sm(seg(T, 1.3, 2.05)) : 0;
          const base = 1 - 0.85 * E.soft(seg(T, 0.15, 1.0)) + 0.08 * E.soft(seg(T, 1.6, 1.9)) - 0.06 * E.soft(seg(T, 1.6, 2.1));
          h = lerp(base, 1, E.back(seg(T, 3.2, 3.85)));
          beeLeave = E.in(seg(T, 0.1, 0.8));
          beeBack = T < 3.85 ? 0 : E.soft(seg(T, 3.85, 4.7));

          const w1 = walkSeg(T, 0.35, 1.15, HOME, S0, 0, trap);
          const w2 = walkSeg(T, 4.4, 5.25, S0, HOME, 0, trap);
          const ws = T < 3 ? w1 : w2;
          x = ws.x;
          gait = ws;
          if ((T >= 1.95 && T < 2.12) || (T >= 2.3 && T < 3.4) || (T >= 4.4 && T < 5.25)) {
            face = -1;
          }

          // pull the first weed
          const tA = topOf(WA);
          const reachA = E.soft(seg(T, 1.12, 1.35)) * (1 - E.soft(seg(T, 1.57, 1.8)));
          const yankA = E.soft(seg(T, 1.35, 1.57)) * (1 - E.soft(seg(T, 1.57, 1.8)));
          pose = mix(pose, P(Object.assign({ hF: lp(tA, x, 0, 1), hB: [-4, -56] }, LEAN)), reachA);
          pose = mix(pose, P({ hF: lp([tA[0] + 8, tA[1] - 28], x, 0, 1), hB: [-6, -60], head: [3, -118], chest: [-1, -90] }), yankA);
          if (T >= 1.35 && T < 1.57) {
            heldA = seg(T, 1.35, 1.57);
          }
          if (T >= 1.57 && T < 2.05) {
            flingA = seg(T, 1.57, 2.05);
          }

          // double-take: glance back, look away, snap back with a hop
          const jump = E.soft(seg(T, 2.25, 2.45)) * (1 - E.soft(seg(T, 2.5, 2.78)));
          pose = mix(pose, STARTLE, jump);
          y = -Math.sin(Math.PI * seg(T, 2.3, 2.52)) * 8;
          bang = seg(T, 2.3, 2.4) * (1 - seg(T, 2.7, 2.85));

          // one big yank: front hand on the sneaky weed, back hand on the last one
          const tB = topOf(WB), tC = topOf(WC);
          const reach2 = E.soft(seg(T, 2.62, 2.87)) * (1 - E.soft(seg(T, 3.12, 3.4)));
          const yank2 = E.soft(seg(T, 2.87, 3.1)) * (1 - E.soft(seg(T, 3.12, 3.4)));
          pose = mix(pose, P({ hF: lp(tB, x, 0, -1), hB: lp(tC, x, 0, -1), head: [6, -114], chest: [2, -89] }), reach2);
          pose = mix(pose, P({ hF: lp([tB[0] - 8, tB[1] - 30], x, 0, -1), hB: lp([tC[0] + 8, tC[1] - 30], x, 0, -1), head: [-3, -118], chest: [-2, -90] }), yank2);
          if (T >= 2.87 && T < 3.12) {
            heldBC = seg(T, 2.87, 3.12);
          }
          if (T >= 3.12 && T < 3.62) {
            flingBC = seg(T, 3.12, 3.62);
          }
          const cheer = E.soft(seg(T, 3.5, 3.85)) * (1 - E.soft(seg(T, 3.95, 4.3)));
          pose = mix(pose, CHEER, cheer);
        }
        pose = legs(pose, gait.ph, gait.amp, { arms: false, stride: gait.stride });

        bed(g);
        const head = flower(g, h, t);
        const sp = seg(T, 3.6, 4.4);
        if (sp > 0 && sp < 1) {
          for (let i = 0; i < 4; i++) {
            const a = -Math.PI / 2 + (i - 1.5) * 0.9;
            const k = clamp(sp * 1.4 - i * 0.12, 0, 1);
            const z = Math.sin(Math.PI * k);
            if (z > 0) {
              R.star(g, head[0] + Math.cos(a) * 26, head[1] + Math.sin(a) * 22, 5 * z, 4, 0.35);
              inkFill(g, C.butter, 1.1);
            }
          }
        }
        sparks(g, head[0], head[1] - 12, seg(T, 3.55, 4.1), 20, 7);
        for (const [key, w] of [['A', WA], ['C', WC], ['B', WB]]) {
          if (grow[key] > 0) {
            g.save();
            g.translate(w.x, -2);
            const sneak = key === 'B' ? Math.sin(t * 7) * 0.09 * grow.B : Math.sin(t * 5 + w.seed) * 0.04;
            weed(g, w, grow[key], 0, sneak);
            g.restore();
          }
        }

        const J = fig(g, pose, x, y, { sx: face, floor: 0, wave: S.wave, wt: S.wt });

        const hang = (w, hand, k) => {
          g.save();
          g.translate(hand[0] - Math.sin(w.seed) * 4, hand[1] + w.h);
          weed(g, w, 1, k, 0);
          g.restore();
        };
        const fling = (w, from, to, k, spin) => {
          g.save();
          g.globalAlpha *= 1 - E.in(k);
          const p = L2(from, to, E.out(k));
          g.translate(p[0], p[1]);
          weed(g, w, 1, 1, k * spin);
          g.restore();
        };
        if (heldA >= 0) {
          hang(WA, J.w.handF, heldA);
        }
        if (flingA >= 0) {
          const from = [WA.x + 8, -30];
          fling(WA, from, [from[0] + 34, from[1] - 120], flingA, 0.9);
        }
        if (heldBC >= 0) {
          hang(WB, J.w.handF, heldBC);
          hang(WC, J.w.handB, heldBC);
        }
        if (flingBC >= 0) {
          const fb = [WB.x - 8, -32], fc = [WC.x + 8, -32];
          fling(WB, fb, [fb[0] - 40, fb[1] - 120], flingBC, -0.9);
          fling(WC, fc, [fc[0] + 40, fc[1] - 120], flingBC, 0.9);
        }
        if (bang > 0) {
          const hd = J.w.head;
          g.save();
          g.globalAlpha *= bang;
          g.translate(hd[0] + 4, hd[1] - 22);
          g.scale(0.6 + 0.4 * E.back(bang), 0.6 + 0.4 * E.back(bang));
          text(g, '!', 0, 0, 18, C.ink);
          g.restore();
        }

        const home = orbit(head, t);
        if (beeLeave < 1 || beeBack > 0) {
          let p = home, dir = Math.sin(t * 1.7) > 0 ? -1 : 1;
          if (T >= 0 && beeBack <= 0) {
            p = L2(home, BEE_OFF, beeLeave);
            dir = beeLeave > 0.05 ? 1 : dir;
          } else if (T >= 0 && beeBack < 1) {
            p = arcPt([-250, -190], home, -30, beeBack);
            dir = 1;
          }
          bee(g, p, dir, t);
        }
      },
    };
  })();
})();
