// life: pancakes — pour the batter, let it brown, flip it high, catch it, slide it onto the stack
(function () {
  const SC = (window.SCENES = window.SCENES || {});
  const R = window.RIG;
  const { C, E, P, FS, mix, fig, inkFill, rr, ln, text, seg, breathe, pulse, lp, sparks, bubble, floatText, circle, wline, lerp, clamp, held } = R;

  const FIGX = -10;
  const STOVE = { x0: 20, x1: 98, y: -50 };
  const BURNER = FIGX + 55;
  const TABLE = { x: FIGX - 62, w: 58, y: -40 };
  const BATTER = '#f6e3b4', GOLD = '#e8b25c', BROWN = '#c98a3a', PAN = '#2f2f2f', PAN_IN = '#4a4a4a';
  const PK = { rx: 13, ry: 3.6 };
  const IDLE_STACK = 3;

  const REST = P({ hF: [24, -69], hB: [-6, -56] });
  const WATCH = P({ hF: [24, -69], hB: [-6, -56], head: [9, -114], chest: [3, -89] });
  const POUR = P({ hF: [24, -69], hB: [34, -100], head: [8, -115], chest: [3, -89] });
  const WIND = P({ hF: [22, -64], hB: [-6, -56], head: [6, -115], chest: [2, -89] });
  const TOSS = P({ hF: [28, -86], hB: [-10, -60], head: [3, -118] });
  const CARRY = P({ hF: [23, -92], hB: [-6, -56], head: [6, -116] });
  const TILT = P({ hF: [22, -104], hB: [-6, -56], head: [8, -114], chest: [3, -89] });

  function stove(g, t, flame) {
    rr(g, STOVE.x0, STOVE.y, STOVE.x1 - STOVE.x0, -STOVE.y, 4);
    inkFill(g, C.paper, 1.6);
    rr(g, STOVE.x0 - 3, STOVE.y - 1, STOVE.x1 - STOVE.x0 + 6, 6, 2);
    inkFill(g, C.steel, 1.5);
    for (let i = 0; i < 3; i++) {
      circle(g, STOVE.x0 + 14 + i * 12, STOVE.y + 13, 3);
      inkFill(g, C.paper, 1.2);
    }
    rr(g, STOVE.x0 + 10, STOVE.y + 22, STOVE.x1 - STOVE.x0 - 20, 22, 3);
    inkFill(g, '#f3f3f3', 1.3);
    ln(g, STOVE.x0 + 22, STOVE.y + 26, STOVE.x1 - 22, STOVE.y + 26, 2.4, C.ink);
    for (let i = 0; i < 4; i++) {
      const fx = BURNER - 12 + i * 8;
      const h = (3.5 + Math.sin(t * 13 + i * 2) * 1.2) * flame;
      if (h <= 0.3) {
        continue;
      }
      g.beginPath();
      g.moveTo(fx - 2.4, STOVE.y - 1);
      g.quadraticCurveTo(fx - 1, STOVE.y - 1 - h, fx, STOVE.y - 1 - h * 1.5);
      g.quadraticCurveTo(fx + 1, STOVE.y - 1 - h, fx + 2.4, STOVE.y - 1);
      inkFill(g, C.butterHi, 1, C.amber);
    }
  }

  function pancakeShape(g, x, y, sx, sy, col, edge) {
    g.beginPath();
    g.ellipse(x, y + 1.6 * Math.abs(sy), PK.rx * sx, PK.ry * Math.abs(sy) + 0.01, 0, 0, Math.PI * 2);
    inkFill(g, edge, 1.1, C.umber);
    g.beginPath();
    g.ellipse(x, y, PK.rx * sx, PK.ry * Math.abs(sy) + 0.01, 0, 0, Math.PI * 2);
    inkFill(g, col, 1.2, C.umber);
  }

  function mixCol(a, b, k) {
    const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
    const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
    return `rgb(${pa.map((v, i) => Math.round(lerp(v, pb[i], clamp(k, 0, 1)))).join(',')})`;
  }

  function table(g) {
    ln(g, TABLE.x - TABLE.w / 2 + 8, TABLE.y + 4, TABLE.x - TABLE.w / 2 + 3, 0, 2.2);
    ln(g, TABLE.x + TABLE.w / 2 - 8, TABLE.y + 4, TABLE.x + TABLE.w / 2 - 3, 0, 2.2);
    rr(g, TABLE.x - TABLE.w / 2, TABLE.y, TABLE.w, 5, 2);
    inkFill(g, C.wood, 1.5);
    g.beginPath();
    g.ellipse(TABLE.x, TABLE.y - 2, 20, 4.5, 0, 0, Math.PI * 2);
    inkFill(g, C.paper, 1.4);
  }
  const stackY = (i) => TABLE.y - 6 - i * 4.4;

  function stack(g, n, topA, butterY) {
    for (let i = 0; i < n; i++) {
      g.save();
      if (i === n - 1) {
        g.globalAlpha *= topA;
      }
      pancakeShape(g, TABLE.x, stackY(i), 1, 1, GOLD, BROWN);
      g.restore();
    }
    rr(g, TABLE.x - 4, butterY - 4, 8, 4.5, 1.2);
    inkFill(g, C.butter, 1.1, C.amber);
  }

  function panAt(g, hand, sx, tilt, cake) {
    g.save();
    g.translate(hand[0], hand[1]);
    g.scale(sx, 1);
    g.rotate(tilt);
    ln(g, -3, -1, 17, 3, 4.4, C.ink);
    ln(g, -2, -1, 15, 2.6, 2, C.wood);
    g.beginPath();
    g.moveTo(16, 3);
    g.lineTo(52, 3);
    g.quadraticCurveTo(51, 10, 46, 10);
    g.lineTo(22, 10);
    g.quadraticCurveTo(17, 10, 16, 3);
    inkFill(g, PAN, 1.4);
    g.beginPath();
    g.ellipse(34, 3, 18, 3.2, 0, 0, Math.PI * 2);
    inkFill(g, PAN_IN, 1.4);
    if (cake) {
      cake(g);
    }
    g.restore();
  }

  function jug(g, hand, tilt, pourK) {
    g.save();
    g.translate(hand[0], hand[1]);
    g.rotate(tilt);
    g.beginPath();
    g.moveTo(2, -4);
    g.lineTo(16, -4);
    g.lineTo(19, -7);
    g.lineTo(17, 10);
    g.quadraticCurveTo(16, 13, 13, 13);
    g.lineTo(5, 13);
    g.quadraticCurveTo(2, 13, 2, 10);
    g.closePath();
    inkFill(g, C.paper, 1.4);
    g.save();
    g.clip();
    g.fillStyle = BATTER;
    g.fillRect(0, 2 + 4 * pourK, 22, 14);
    g.restore();
    g.beginPath();
    g.moveTo(2, -1);
    g.quadraticCurveTo(-4, 2, 2, 8);
    g.lineWidth = 1.6;
    g.strokeStyle = C.ink;
    g.stroke();
    g.restore();
    return [hand[0] + Math.cos(tilt) * 19 - Math.sin(tilt) * -7, hand[1] + Math.sin(tilt) * 19 + Math.cos(tilt) * -7];
  }

  SC['life-pancake'] = {
    dur: 8.6,
    width: 400,
    label: 'A stick figure pours batter into a pan, lets the pancake brown, flips it high in the air, catches it, and slides it onto a growing stack of pancakes.',
    draw(g, S) {
      const T = S.on ? S.u * this.dur : -1;
      const t = S.t;
      let pose = breathe(REST, t);
      let sx = 1, tilt = 0, jugTilt = 0, pourK = 0, stream = 0, cakeR = 0, brown = 0, bubbles = 0;
      let fly = null, slide = null, inPan = false, flipped = false, n = IDLE_STACK, topA = 1, plus = 0, steamK = 0.5, shake = 0;
      let butterY = stackY(IDLE_STACK - 1) - 3, flame = 1, yum = 0;

      if (T < 0) {
        shake = Math.sin(t * 30) * 1.6 * pulse(t, 6, 2.5, 0.9);
        pose = P({ hF: [24 + shake, -69], hB: pose.hB, head: pose.head, chest: pose.chest }, pose);
        steamK = 0.5 + pulse(t, 6, 2.5, 1.4) * 0.6;
      } else {
        const up = E.soft(seg(T, 0.1, 0.55)) * (1 - E.soft(seg(T, 1.45, 1.85)));
        pose = mix(pose, POUR, up);
        jugTilt = 1.05 * E.soft(seg(T, 0.45, 0.7)) * (1 - E.soft(seg(T, 1.3, 1.55)));
        pourK = seg(T, 0.55, 1.35);
        stream = seg(T, 0.6, 0.7) * (1 - seg(T, 1.3, 1.4));
        cakeR = E.out3(seg(T, 0.65, 1.4));
        inPan = T >= 0.65;
        const watch = E.soft(seg(T, 1.8, 2.1)) * (1 - E.soft(seg(T, 3.0, 3.25)));
        pose = mix(pose, WATCH, watch);
        brown = seg(T, 1.4, 3.1);
        bubbles = seg(T, 1.7, 2.0) * (1 - seg(T, 3.0, 3.2));
        steamK = 0.5 + 0.8 * seg(T, 1.2, 1.8) * (1 - seg(T, 3.3, 3.6));

        const wind = E.soft(seg(T, 3.15, 3.45)) * (1 - E.in(seg(T, 3.45, 3.6)));
        const toss = E.out3(seg(T, 3.45, 3.62)) * (1 - E.soft(seg(T, 3.75, 4.1)));
        pose = mix(pose, WIND, wind);
        pose = mix(pose, TOSS, toss);
        const look = E.soft(seg(T, 3.5, 3.8)) * (1 - E.soft(seg(T, 4.2, 4.5)));
        pose = mix(pose, P({ hF: pose.hF, hB: pose.hB, head: [2, -119], chest: [-1, -90] }), look);
        if (T >= 3.55 && T < 4.4) {
          fly = seg(T, 3.55, 4.4);
          inPan = false;
        }
        flipped = T >= 3.95;
        const land = seg(T, 4.4, 4.7);

        const lift = E.soft(seg(T, 4.7, 5.0)) * (1 - E.soft(seg(T, 6.7, 7.0)));
        pose = mix(pose, CARRY, lift);
        const turn = E.soft(seg(T, 4.85, 5.3)) * (1 - E.soft(seg(T, 6.25, 6.7)));
        sx = turn < 0.5 ? 1 : -1;
        if (Math.abs(sx) < 0.08) {
          sx = sx < 0 ? -0.08 : 0.08;
        }
        const tiltK = E.soft(seg(T, 5.35, 5.6)) * (1 - E.soft(seg(T, 5.95, 6.2)));
        pose = mix(pose, TILT, tiltK);
        tilt = 0.32 * tiltK;
        if (T >= 5.5 && T < 5.95) {
          slide = seg(T, 5.5, 5.95);
          inPan = false;
        }
        if (T >= 5.95) {
          inPan = false;
          n = IDLE_STACK + 1;
        }
        const reset = seg(T, 8.0, 8.55);
        topA = n > IDLE_STACK ? 1 - reset : 1;
        if (reset >= 1) {
          n = IDLE_STACK;
          topA = 1;
        }
        butterY = stackY(IDLE_STACK - 1) - 3 - 4.4 * E.back(seg(T, 6.0, 6.3)) * (1 - E.soft(reset));
        plus = seg(T, 6.0, 6.9);
        yum = seg(T, 7.0, 7.2) * (1 - seg(T, 7.8, 8.0));
        const proud = E.soft(seg(T, 7.0, 7.3)) * (1 - E.soft(seg(T, 7.7, 8.0)));
        pose = mix(pose, P({ hF: pose.hF, hB: [-12, -60], head: [-3, -117], chest: [-2, -90] }), proud);
        if (land > 0 && land < 1) {
          bubbles = 0;
        }
        S.st.land = land;
      }

      table(g);
      stack(g, n, topA, butterY);
      stove(g, t, flame);

      const cakeCol = flipped ? mixCol(GOLD, BROWN, 0.25) : mixCol(BATTER, '#f0d79b', brown);
      const edgeCol = flipped ? BROWN : mixCol('#e9cf94', GOLD, brown);
      const landK = S.st.land || 0;
      const squash = T >= 4.4 && T < 4.7 ? 1 + Math.sin(Math.PI * landK) * 0.25 : 1;
      const drawCake = (gg) => {
        if (!inPan || cakeR <= 0) {
          return;
        }
        pancakeShape(gg, 34, 1, cakeR * squash, cakeR / squash, cakeCol, edgeCol);
        if (bubbles > 0) {
          for (let i = 0; i < 4; i++) {
            const k = (t * 1.3 + i * 0.27) % 1;
            gg.save();
            gg.globalAlpha *= bubbles * Math.sin(Math.PI * k);
            circle(gg, 27 + i * 5, 0.5 + (i % 2) * 1.2, 0.9 + k * 0.5);
            inkFill(gg, null, 0.8, C.umber);
            gg.restore();
          }
        }
      };

      let handNow = null;
      const J = fig(g, pose, FIGX, 0, {
        sx,
        wave: S.wave,
        wt: S.wt,
        behind: (gg, J0) => held(gg, J0, (hF) => {
          handNow = hF;
          panAt(gg, hF, sx, tilt, drawCake);
        }),
        mid: (gg, J0) => held(gg, J0, (hF, hB) => {
          const sp = jug(gg, hB, jugTilt, pourK);
          if (stream > 0) {
            const bottom = hF[1] + 2;
            ln(gg, sp[0], sp[1], sp[0] + 1, lerp(sp[1], bottom, stream), 2.6, '#e2c98a');
            ln(gg, sp[0], sp[1], sp[0] + 1, lerp(sp[1], bottom, stream), 1.4, BATTER);
          }
        }),
      });
      const hand = handNow || J.w.handF;
      const panCx = hand[0] + 34 * sx;

      for (let i = 0; i < 3; i++) {
        const k = (t * 0.7 + i / 3) % 1;
        const x = panCx - 8 + i * 8;
        g.save();
        g.globalAlpha *= Math.sin(Math.PI * k) * clamp(steamK, 0, 1) * 0.8;
        const pts = [];
        for (let j = 0; j < 5; j++) {
          pts.push([x + Math.sin(j * 1.4 + t * 3 + i) * 1.8, hand[1] - 6 - k * 22 - j * 4]);
        }
        wline(g, pts, 1.3, '#a3a3a3', 0.3, i);
        g.restore();
      }

      if (fly != null) {
        const base = [hand[0] + 34, hand[1] + 2];
        const h = 100;
        const y = base[1] - Math.sin(Math.PI * fly) * h;
        const x = base[0] + Math.sin(Math.PI * fly) * 6;
        const spin = Math.PI * 2 * E.sm(fly);
        const under = spin > Math.PI * 0.5 && spin < Math.PI * 1.5;
        g.save();
        g.translate(x, y);
        g.rotate(spin);
        pancakeShape(g, 0, 0, 1, 1, under ? mixCol(GOLD, BROWN, 0.25) : cakeCol, BROWN);
        g.restore();
      }
      if (slide != null) {
        const p0 = [hand[0] + sx * (34 * Math.cos(tilt) - Math.sin(tilt)), hand[1] + 34 * Math.sin(tilt) + Math.cos(tilt)];
        const p1 = [TABLE.x, stackY(IDLE_STACK)];
        const p = R.arcPt(p0, p1, 10, E.in(slide));
        pancakeShape(g, p[0], p[1], 1, 1, mixCol(GOLD, BROWN, 0.25), BROWN);
      }

      floatText(g, '+1', TABLE.x, stackY(IDLE_STACK) - 14, plus, C.amber, 11);
      sparks(g, TABLE.x, stackY(IDLE_STACK) - 8, seg(T, 5.95, 6.5), 14, 5, C.amber);
      bubble(g, FIGX - 24, -126, 'ta-da!', yum, { tail: 18 });
    },
  };
})();
