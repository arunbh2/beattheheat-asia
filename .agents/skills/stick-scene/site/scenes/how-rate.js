// Rate limiting pitches for the "How to use it" section: a bouncer, a token bucket and a turnstile.
// Load after stick.js. Use as <stick-scene scene="how-rate-bouncer" play="view"></stick-scene>.
(function () {
  const SC = (window.SCENES = window.SCENES || {});
  const R = window.RIG;
  const { C, E, P, mix, fig, inkFill, rr, ln, text, seg, breathe, pulse, lp, sparks, tickBadge, circle, lerp, arcPt, poly, bubble, floatText } = R;

  const RED_INK = C.redInk, GREEN = '#dafbe1', GREEN_INK = C.greenInk, RED = '#ffebe9';
  const REST = { hF: [12, -60], hB: [-4, -52] };
  const bump = (T, a, b, c, d) => E.soft(seg(T, a, b)) * (1 - E.soft(seg(T, c, d)));
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mixCol = (a, b, k) => {
    if (k <= 0) {
      return a;
    }
    if (k >= 1) {
      return b;
    }
    const A = hex(a), B = hex(b);
    return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',')})`;
  };
  // A request envelope standing on its bottom edge at (x, yb).
  function env(g, x, yb, o) {
    const opt = o || {};
    const a = opt.a ?? 1;
    if (a <= 0) {
      return;
    }
    const w = 24, h = 16, sq = opt.sq || 0;
    g.save();
    g.globalAlpha *= a;
    g.translate(x, yb);
    g.rotate(opt.rot || 0);
    const sc = (opt.s || 1) * 1.3;
    g.scale(sc * (1 + sq * 0.22), sc * (1 - sq * 0.22));
    rr(g, -w / 2, -h, w, h, 2);
    inkFill(g, opt.fill || C.paper, 1.4, opt.ink || C.ink);
    g.beginPath();
    g.moveTo(-w / 2 + 1.5, -h + 1.5);
    g.lineTo(0, -h * 0.42);
    g.lineTo(w / 2 - 1.5, -h + 1.5);
    g.strokeStyle = opt.ink || C.ink;
    g.lineWidth = 1.2;
    g.stroke();
    if (opt.token > 0) {
      g.save();
      g.translate(-w / 2 + 6, -h + 5.5);
      g.scale(opt.token, opt.token);
      circle(g, 0, 0, 4);
      inkFill(g, C.steel, 1.2);
      g.restore();
    }
    g.restore();
  }
  const hopY = (k, n, hgt) => -Math.abs(Math.sin(Math.PI * k * (n || 1))) * (hgt ?? 6);

  // ------------------------------------------------------------ bouncer: one in per click, the pushy one gets a hand and a 429
  const DOOR = { x: -214, w: 50, h: 96 };
  const DC = DOOR.x + DOOR.w / 2;
  const PLQ = { x: DC - 38, y: -146, w: 76, h: 40 };
  const BX = -132;
  const QX0 = -94, QSP = 40;
  const ENT = [0.4, 0.95, 1.5, 2.05, 2.6], ED = 0.5;
  const PK = 7;
  const STOP = [-98, -86];
  const FOLD = P({ hF: [16, -76], hB: [12, -74] });

  function door(g, s) {
    rr(g, DOOR.x, -DOOR.h, DOOR.w, DOOR.h, 3);
    inkFill(g, '#2b2b2b', 1.8);
    ln(g, DOOR.x - 6, 0, DOOR.x + DOOR.w + 6, 0, 3, C.ink);
    rr(g, PLQ.x, PLQ.y, PLQ.w, PLQ.h, 5);
    inkFill(g, C.paper, 1.6);
    const cx = PLQ.x + 13, cy = PLQ.y + 13;
    circle(g, cx, cy, 7);
    inkFill(g, C.paper, 1.3);
    ln(g, cx, cy, cx + Math.cos(s.clock) * 5.5, cy + Math.sin(s.clock) * 5.5, 1.4, C.ink);
    text(g, '5/min', PLQ.x + PLQ.w / 2 + 9, PLQ.y + 17, 11, C.ink);
    for (let i = 0; i < 5; i++) {
      const x = PLQ.x + 14 + i * 12, y = PLQ.y + 31, k = s.dots[i];
      circle(g, x, y, 3.4);
      inkFill(g, C.paper, 1.2);
      if (k > 0) {
        circle(g, x, y, 3.4 * E.back(Math.min(1, k)));
        inkFill(g, s.red > 0.5 ? RED_INK : C.ink, 1.2, s.red > 0.5 ? RED_INK : C.ink);
      }
    }
  }
  function clicker(g, J) {
    const h = J.w.handF;
    rr(g, h[0] - 3, h[1] - 9, 8, 11, 2);
    inkFill(g, C.steel, 1.2);
    circle(g, h[0] + 1, h[1] - 9, 1.8);
    inkFill(g, C.ink, 0.8);
  }

  SC['how-rate-bouncer'] = {
    dur: 7,
    width: 460,
    label: 'A stick figure bouncer lets request envelopes into a club one at a time, clicking a counter up to five a minute. When a pushy envelope jumps the line, the bouncer holds up a hand, it bounces off with a 429 and goes back to wait its turn.',
    draw(g, S) {
      const T = S.on ? S.u * this.dur : -1;
      const t = S.t;
      let pose = breathe(FOLD, t);
      let e = 0, dots = [0, 0, 0, 0, 0], red = 0, clock = -Math.PI / 2, push = null, pushRot = 0, pushSq = 0, pushRed = 0, clicks = [];
      if (T < 0) {
        pose = mix(pose, P({ hF: [16, -76], hB: [12, -74], head: [10, -114] }), pulse(t, 6.2, 2.4, 2));
      } else {
        for (let i = 0; i < 5; i++) {
          e += E.soft(seg(T, ENT[i], ENT[i] + ED));
          const off = 0.08 * (4 - i);
          dots[i] = seg(T, ENT[i] + 0.42, ENT[i] + 0.5) * (1 - seg(T, 6.15 + off, 6.25 + off));
          clicks.push(seg(T, ENT[i] + 0.28, ENT[i] + 0.55));
        }
        clock = -Math.PI / 2 + Math.PI * 2 * E.soft(seg(T, 0.2, 6.3));
        red = bump(T, 3.58, 3.65, 4.2, 4.4);
        const out = seg(T, 3.3, 3.6), back = seg(T, 3.68, 4.2);
        const base = [QX0 + (PK - e) * QSP, 0];
        if (T >= 3.3 && T < 4.2) {
          push = T < 3.6 ? arcPt(base, STOP, 34, E.out(out)) : T < 3.68 ? STOP : arcPt(STOP, base, 28, back);
          pushRot = -back * Math.PI * 2 * (T >= 3.68 ? 1 : 0);
        }
        pushSq = Math.sin(Math.PI * seg(T, 3.6, 3.72)) * 1.2 + Math.sin(Math.PI * seg(T, 4.2, 4.38)) * 0.9;
        pushRed = seg(T, 3.55, 3.62) * (1 - seg(T, 4.4, 4.8));

        const ready = bump(T, 0.1, 0.35, 2.95, 3.2);
        let jab = 0;
        for (let i = 0; i < 5; i++) {
          jab += bump(T, ENT[i] + 0.25, ENT[i] + 0.3, ENT[i] + 0.33, ENT[i] + 0.45);
        }
        const stop = bump(T, 3.3, 3.5, 4.05, 4.35);
        const smug = bump(T, 4.35, 4.65, 5.6, 6.0);
        pose = mix(pose, P({ hF: [22, -80 + jab * 3], hB: [-4, -54], head: [8 + jab, -116 + jab * 1.5] }), ready);
        pose = mix(pose, P({ hF: lp([STOP[0] - 11, STOP[1] - 8], BX, 0, 1), hB: [-4, -54], head: [6, -116], chest: [3, -90] }), stop);
        pose = mix(pose, P({ hF: [16, -76], hB: [12, -74], head: [1, -119] }), smug);
      }

      door(g, { dots, red, clock });
      const J = fig(g, pose, BX, 0, { wave: S.wave, wt: S.wt });
      if (T >= 0 && T < 3.3) {
        clicker(g, J);
      }
      for (let k = 0; k < 18; k++) {
        const q = k - e;
        if (q < -1 || (k === PK && push)) {
          continue;
        }
        let x, y, a = 1, s = 1;
        if (q >= 0) {
          x = QX0 + q * QSP;
          y = hopY(q);
          a = 1 - seg(x, 95, 190);
        } else {
          const u = q + 1;
          x = lerp(DC, QX0, u);
          y = hopY(u, 3);
          a = seg(u, 0, 0.35);
          s = 0.8 + 0.2 * seg(u, 0, 0.5);
        }
        const isP = k === PK;
        env(g, x, y, { a, s, sq: isP ? pushSq : 0, fill: isP ? mixCol('#ffffff', RED, pushRed) : C.paper, ink: isP && pushRed > 0.5 ? RED_INK : C.ink });
      }
      if (push) {
        env(g, push[0], push[1], { rot: pushRot, sq: pushSq, fill: mixCol('#ffffff', RED, pushRed), ink: pushRed > 0.5 ? RED_INK : C.ink });
      }
      for (const k of clicks) {
        if (k > 0 && k < 0.3) {
          sparks(g, J.w.handF[0] + 1, J.w.handF[1] - 12, k / 0.3, 7, 3, C.muted);
        }
      }
      sparks(g, STOP[0] - 8, STOP[1] - 10, seg(T, 3.6, 4.0), 12, 5, RED_INK);
      floatText(g, '429', STOP[0] + 12, STOP[1] - 26, seg(T, 3.6, 4.5), RED_INK, 13);
      sparks(g, PLQ.x + PLQ.w / 2, PLQ.y - 2, seg(T, 6.2, 6.75), 16, 7, GREEN_INK);
    },
  };

  // ------------------------------------------------------------ bucket: a token per request; when it runs dry, wait for the next drip
  const BF = -102;
  const BELT = { x0: -88, x1: 238, y: -56 };
  const SLOT = [-64, -20, 24];
  const TUB = { cx: -64, top: -112, bot: -90, w: 28 };
  const POST = -36;
  const SPOUT = [TUB.cx, -150];
  const discY = (i) => TUB.bot - 5 - i * 6;
  const LAND = [4.05, 5.45, 6.85];
  const STAMP = [SLOT[0] - 6, -71];
  const PLAN = [
    { start: 270, slot: 0, grab: 0.8, stuck: 1.3, fly: 1.5 },
    { start: 320, slot: 1, grab: 1.75, stuck: 2.25, fly: 2.45 },
    { start: 370, slot: 2, grab: 4.1, stuck: 4.6, fly: 4.8 },
  ];

  function rig(g, spin) {
    ln(g, POST, 0, POST, -166, 2.6, C.ink);
    ln(g, POST, -160, SPOUT[0] - 4, -160, 4.5, C.ink);
    ln(g, POST, -160, SPOUT[0] - 4, -160, 2.4, C.steel);
    rr(g, SPOUT[0] - 5, -164, 10, 13, 2);
    inkFill(g, C.steel, 1.4);
    rr(g, SPOUT[0] - 3, -172, 6, 8, 2);
    inkFill(g, C.steel, 1.2);
    ln(g, TUB.cx - 12, TUB.bot, POST, TUB.bot, 3, C.ink);
    ln(g, POST, TUB.bot + 14, POST - 12, TUB.bot, 1.8, C.ink);
    ln(g, BELT.x0 + 14, BELT.y + 8, BELT.x0 + 10, 0, 2.2);
    ln(g, BELT.x1 - 40, BELT.y + 8, BELT.x1 - 36, 0, 2.2);
    rr(g, BELT.x0, BELT.y, BELT.x1 - BELT.x0, 9, 4.5);
    inkFill(g, C.steel, 1.6);
    for (let x = BELT.x0 + 9; x < BELT.x1 - 4; x += 24) {
      circle(g, x, BELT.y + 4.5, 2.6);
      inkFill(g, C.paper, 1);
      ln(g, x, BELT.y + 4.5, x + Math.cos(spin) * 2.6, BELT.y + 4.5 + Math.sin(spin) * 2.6, 1, C.ink);
    }
  }
  function disc(g, x, y, s) {
    g.save();
    g.translate(x, y);
    g.scale(s || 1, s || 1);
    g.beginPath();
    g.ellipse(0, 0, 11, 4, 0, 0, Math.PI * 2);
    inkFill(g, C.steel, 1.4);
    g.restore();
  }
  function tub(g, discs) {
    const { cx, top, bot, w } = TUB;
    poly(g, [[cx - w / 2, top], [cx + w / 2, top], [cx + w / 2 - 4, bot], [cx - w / 2 + 4, bot]], true);
    inkFill(g, '#f5f5f5', 1.6);
    for (let i = 0; i < 2; i++) {
      if (discs[i] > 0) {
        disc(g, cx, discY(i), E.back(Math.min(1, discs[i])));
      }
    }
    ln(g, cx - w / 2 - 2, top, cx + w / 2 + 2, top, 2.2, C.ink);
  }

  SC['how-rate-bucket'] = {
    dur: 7,
    width: 460,
    label: 'A tap drips tokens into a bucket at a steady rate. A burst of three request envelopes rides in, and a stick figure sticks a token on each to send it through. The bucket runs dry on the third, so the figure shrugs and waits for the next drip, then stamps it.',
    draw(g, S) {
      const T = S.on ? S.u * this.dur : -1;
      const t = S.t;
      let pose = breathe(P(REST), t);
      let bead = 0.25, drop = -1, discs = [1, 1], envs = [], inF = 0, waitK = 0, spin = 0, plink = 0, dig = 0;
      if (T < 0) {
        pose = mix(pose, P({ ...REST, head: [5, -119] }), pulse(t, 6.4, 2.6, 1.8));
      } else {
        bead = lerp(0.25, 1, seg(T, 0, LAND[0] - 0.2));
        for (let i = 0; i < 3; i++) {
          if (T >= LAND[i] - 0.2 && T < LAND[i]) {
            drop = seg(T, LAND[i] - 0.2, LAND[i]);
          }
          if (T >= LAND[i] - 0.2) {
            bead = seg(T, LAND[i] - 0.2, LAND[i] + 1.2);
          }
        }
        const took = (i) => PLAN[i].grab + 0.2;
        discs = [
          T < took(1) ? 1 : T >= LAND[0] && T < took(2) ? seg(T, LAND[0], LAND[0] + 0.15) : T >= LAND[1] ? seg(T, LAND[1], LAND[1] + 0.15) : 0,
          T < took(0) ? 1 : T >= LAND[2] ? seg(T, LAND[2], LAND[2] + 0.15) : 0,
        ];
        plink = seg(T, LAND[0], LAND[0] + 0.4);
        const burst = E.out3(seg(T, 0.1, 0.8));
        const sh1 = E.soft(seg(T, 1.6, 1.9)), sh2 = E.soft(seg(T, 2.55, 2.85));
        spin = burst * 18 + (sh1 + sh2) * 4;
        for (let i = 0; i < 3; i++) {
          const pl = PLAN[i];
          let x = lerp(pl.start, SLOT[pl.slot], burst);
          let y = hopY(burst, 6, 4);
          if (i >= 1) {
            x = lerp(x, SLOT[pl.slot - 1], sh1);
            y += hopY(sh1, 1, 5);
          }
          if (i === 2) {
            x = lerp(x, SLOT[0], sh2);
            y += hopY(sh2, 1, 5);
          }
          const fk = seg(T, pl.fly, pl.fly + 0.6);
          let pos = [x, BELT.y + y];
          if (fk > 0) {
            pos = arcPt([SLOT[0], BELT.y], [262, -205], 40, E.in(fk));
          }
          envs.push({ pos, rot: -fk * 0.6, token: seg(T, pl.stuck - 0.05, pl.stuck + 0.05), tick: seg(T, pl.stuck + 0.02, pl.stuck + 0.3) * (1 - seg(T, pl.fly + 0.1, pl.fly + 0.3)), a: fk >= 1 ? 0 : 1 });
          if (T >= pl.grab + 0.22 && T < pl.stuck) {
            inF = 1;
          }
        }
        waitK = seg(T, 3.3, 3.45) * (1 - seg(T, 3.95, 4.1));
        dig = Math.sin(T * 30) * 3 * bump(T, 2.95, 3.0, 3.1, 3.18);

        const grab = (i) => P({ hF: lp([TUB.cx - 7, discY(i) - 1], BF, 0, 1), hB: [-4, -54], head: [8, -117], chest: [3, -90] });
        const slap = P({ hF: lp(STAMP, BF, 0, 1), hB: [-4, -54], head: [9, -113], chest: [4, -89] });
        const step = (a, i) => {
          pose = mix(pose, grab(i), bump(T, a, a + 0.22, a + 0.27, a + 0.45));
          pose = mix(pose, slap, bump(T, a + 0.27, a + 0.5, a + 0.6, a + 0.85));
        };
        step(PLAN[0].grab, 1);
        step(PLAN[1].grab, 0);
        const g3 = grab(0);
        g3.hF = [g3.hF[0] + dig, g3.hF[1]];
        pose = mix(pose, g3, bump(T, 2.75, 2.95, 3.12, 3.3));
        pose = mix(pose, P({ hF: [22, -66], hB: [12, -66], head: [3, -118], chest: [0, -92] }), bump(T, 3.2, 3.4, 3.7, 3.9));
        pose = mix(pose, P({ ...REST, head: [6, -121] }), bump(T, 3.7, 3.85, 3.98, 4.12));
        step(PLAN[2].grab, 0);
        pose = mix(pose, P({ ...REST, head: [5, -118] }), bump(T, 5.0, 5.3, 5.8, 6.2));
      }

      rig(g, spin);
      tub(g, discs);
      if (bead > 0) {
        g.save();
        g.translate(SPOUT[0], SPOUT[1] + 2 + bead * 3);
        g.scale(bead, bead);
        g.beginPath();
        g.ellipse(0, 0, 7, 2.6, 0, 0, Math.PI * 2);
        inkFill(g, C.steel, 1.2);
        g.restore();
      }
      if (drop >= 0) {
        disc(g, SPOUT[0], lerp(SPOUT[1] + 5, discY(0), E.in(drop)), 1);
      }
      sparks(g, TUB.cx, TUB.top - 2, plink, 14, 5, C.muted);
      const J = fig(g, pose, BF, 0, { wave: S.wave, wt: S.wt });
      if (inF) {
        disc(g, J.w.handF[0] + 2, J.w.handF[1] + 2, 0.8);
      }
      for (const v of envs) {
        if (v.a > 0) {
          env(g, v.pos[0], v.pos[1], { rot: v.rot, token: v.token });
          tickBadge(g, v.pos[0], v.pos[1] - 32, v.tick, 8, GREEN, GREEN_INK);
        }
      }
      bubble(g, BF - 34, -122, 'wait', waitK, { tail: 28, size: 10 });
    },
  };

  // ------------------------------------------------------------ turnstile: one through per tick; a jumper gets plucked out of the air
  const TX = -20;
  const HUB = [TX, -30];
  const AF = -72;
  const TQ0 = TX + 30, TSP = 38, EXIT = TX - 98;
  const TICK = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5], TD = 0.4;
  const HK = 5;
  const CATCH = [TX - 20, -82];
  const DROP = [TX - 14, -76];
  const SIGN = { x: TX - 6, y: -150, w: 50, h: 22 };

  function turnstile(g, rot, lamp) {
    ln(g, TX + 10, -6, TX + 10, SIGN.y + SIGN.h, 2.4, C.ink);
    rr(g, SIGN.x, SIGN.y, SIGN.w, SIGN.h, 5);
    inkFill(g, C.paper, 1.6);
    text(g, '1/s', SIGN.x + 18, SIGN.y + 15, 11, C.ink);
    circle(g, SIGN.x + SIGN.w - 11, SIGN.y + SIGN.h / 2, 6);
    inkFill(g, mixCol(C.paper, '#8fd19e', lamp), 1.4, lamp > 0.3 ? GREEN_INK : C.ink);
    rr(g, TX - 8, -42, 26, 42, 4);
    inkFill(g, C.steel, 1.6);
    for (let i = 0; i < 3; i++) {
      const a = rot + (i * Math.PI * 2) / 3 + Math.PI / 2;
      const tip = [HUB[0] + Math.cos(a) * 26, HUB[1] + Math.sin(a) * 26];
      ln(g, HUB[0], HUB[1], tip[0], tip[1], 4.2, C.ink);
      ln(g, HUB[0], HUB[1], tip[0], tip[1], 1.8, C.steel);
    }
    circle(g, HUB[0], HUB[1], 5);
    inkFill(g, C.paper, 1.4);
  }
  function tpos(q) {
    if (q >= 0) {
      const x = TQ0 + q * TSP;
      return [x, hopY(q), 1 - seg(x, 120, 210)];
    }
    if (q >= -1) {
      const u = q + 1;
      return [lerp(EXIT, TQ0, u), hopY(u, 3), 1];
    }
    const x = EXIT + (q + 1) * 80;
    return [x, hopY(q, 3), 1 - seg(EXIT - x, 40, 100)];
  }

  SC['how-rate-turnstile'] = {
    dur: 7,
    width: 460,
    label: 'Request envelopes line up at a turnstile that turns once a second, and a stick figure attendant waves one through on each tick. One envelope tries to hop over, so the attendant plucks it out of the air and drops it back in line.',
    draw(g, S) {
      const T = S.on ? S.u * this.dur : -1;
      const t = S.t;
      let pose = breathe(P(REST), t);
      let e = 0, rot = 0, lamp = 0, hop = null, hopRot = 0, hopSq = 0, hopRed = 0, wag = 0;
      if (T < 0) {
        pose = mix(pose, P({ ...REST, head: [10, -115] }), pulse(t, 6, 2.4, 1.8));
      } else {
        for (const ti of TICK) {
          e += E.soft(seg(T, ti, ti + TD));
          rot -= E.back(seg(T, ti, ti + TD * 0.8)) * ((Math.PI * 2) / 3);
          lamp = Math.max(lamp, bump(T, ti - 0.02, ti + 0.05, ti + 0.25, ti + 0.45));
        }
        const bp = tpos(HK - e);
        const base = [bp[0], bp[1]];
        if (T >= 3.0 && T < 4.6) {
          if (T < 3.35) {
            hop = arcPt(base, CATCH, 44, E.out(seg(T, 3.05, 3.35)));
          } else if (T < 3.95) {
            hop = [CATCH[0], CATCH[1] + Math.sin(T * 30) * 1.2];
            hopRot = Math.sin(T * 26) * 0.14;
          } else if (T < 4.25) {
            hop = [lerp(CATCH[0], DROP[0], E.soft(seg(T, 3.95, 4.25))), lerp(CATCH[1], DROP[1], E.soft(seg(T, 3.95, 4.25)))];
          } else {
            hop = arcPt(DROP, base, 46, seg(T, 4.25, 4.55));
          }
          if (T >= 4.55) {
            hop = null;
          }
        }
        hopSq = Math.sin(Math.PI * seg(T, 2.95, 3.08)) * 1.1 + Math.sin(Math.PI * seg(T, 4.55, 4.72)) * 1.1;
        hopRed = seg(T, 3.05, 3.15) * (1 - seg(T, 4.55, 4.95));

        let wave = 0;
        for (const ti of [TICK[0], TICK[1], TICK[2], TICK[5]]) {
          wave += bump(T, ti - 0.05, ti + 0.12, ti + 0.25, ti + 0.45);
        }
        const grab = hop && T < 4.25 ? [hop[0] - 14, hop[1] - 9] : [DROP[0] - 14, DROP[1] - 9];
        const pluck = bump(T, 3.12, 3.35, 4.22, 4.4);
        wag = bump(T, 4.4, 4.6, 5.0, 5.25);
        pose = mix(pose, P({ hF: [26, -74], hB: [-4, -54], head: [9, -115] }), wave);
        pose = mix(pose, P({ hF: lp(grab, AF, 0, 1), hB: [-4, -54], head: [6, -118], chest: [3, -90] }), pluck);
        pose = mix(pose, P({ hF: [22 + Math.sin(T * 16) * 4, -100], hB: [-4, -54], head: [4, -117] }), wag);
      }

      turnstile(g, rot, lamp);
      fig(g, pose, AF, 0, { wave: S.wave, wt: S.wt });
      for (let k = -4; k < 16; k++) {
        if (k === HK && hop) {
          continue;
        }
        const p = tpos(k - e);
        const isH = k === HK;
        env(g, p[0], p[1], { a: p[2], sq: isH ? hopSq : 0, fill: isH ? mixCol('#ffffff', RED, hopRed) : C.paper, ink: isH && hopRed > 0.5 ? RED_INK : C.ink });
      }
      if (hop) {
        env(g, hop[0], hop[1], { rot: hopRot, sq: hopSq, fill: mixCol('#ffffff', RED, hopRed), ink: hopRed > 0.5 ? RED_INK : C.ink });
      }
    },
  };
})();
