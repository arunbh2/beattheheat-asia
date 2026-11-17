// learn: the water cycle — the sun lifts steam off a pond, it gathers into a cloud, it rains, the pond fills up again
(function () {
  const SC = (window.SCENES = window.SCENES || {});
  const R = window.RIG;
  const { C, E, P, mix, fig, inkFill, ln, text, seg, breathe, pulse, lp, sparks, bubble, circle, wline, lerp, clamp, hash } = R;

  const BLUE = '#8ec5e8', BLUE_INK = '#3b7fae', CLOUD_GREY = '#e6ecf1', MUD = '#d8c9a8';
  const SUN = { x: -133, y: -148, r: 13 };
  const POND = { x: -23, y: 1, rx: 56, ry: 7 };
  const CLOUD = { x0: -23, x1: 104, y: -158, s: 0.8 };
  const FIGX = 135;
  const RAIN = { a: 3.0, b: 5.6, per: 0.55, v: 300, n: 26, span: 92 };
  const PUFFS = [[-32, 2, 13], [-15, -9, 17], [6, -13, 16], [25, -4, 14], [38, 4, 10], [-2, 4, 14], [18, 5, 12]];

  const REST = P({ hF: [12, -60], hB: [-4, -52] });
  const CHIN = P({ hF: [10, -96], head: [7, -116], hB: [-4, -54] });
  const PALM = P({ hF: [12, -60], hB: [28, -70], head: [6, -118], eb: -1 });
  const UP = P({ hF: [10, -88], hB: [-4, -54], head: [3, -117] });

  function sun(g, t, rays, dim) {
    const n = 9;
    for (let i = 0; i < n; i++) {
      const a = t * 0.25 + (i / n) * Math.PI * 2;
      const r0 = SUN.r + 4, r1 = SUN.r + 4 + 7 * rays;
      if (rays > 0.02) {
        ln(g, SUN.x + Math.cos(a) * r0, SUN.y + Math.sin(a) * r0, SUN.x + Math.cos(a) * r1, SUN.y + Math.sin(a) * r1, 1.6, C.amber);
      }
    }
    circle(g, SUN.x, SUN.y, SUN.r);
    inkFill(g, C.butterHi, 1.6);
    if (dim > 0) {
      g.save();
      g.globalAlpha *= dim * 0.6;
      circle(g, SUN.x, SUN.y, SUN.r - 0.8);
      g.fillStyle = C.paper;
      g.fill();
      g.restore();
    }
  }

  function pond(g, level, t) {
    const rx = POND.rx * (0.5 + 0.5 * level), ry = POND.ry * (0.55 + 0.45 * level);
    if (level < 0.99) {
      g.beginPath();
      g.ellipse(POND.x, POND.y, POND.rx, POND.ry, 0, 0, Math.PI * 2);
      g.fillStyle = '#f1ead9';
      g.fill();
      g.setLineDash([3, 3]);
      g.lineWidth = 1.2;
      g.strokeStyle = MUD;
      g.stroke();
      g.setLineDash([]);
    }
    g.beginPath();
    g.ellipse(POND.x, POND.y, rx, ry, 0, 0, Math.PI * 2);
    inkFill(g, BLUE, 1.5, BLUE_INK);
    for (let i = 0; i < 2; i++) {
      const k = (t * 0.4 + i * 0.5) % 1;
      g.save();
      g.globalAlpha *= Math.sin(Math.PI * k) * 0.8;
      const cx = POND.x - rx * 0.3 + i * rx * 0.55;
      ln(g, cx - 6 - k * 4, POND.y - 1 + i, cx + 6 + k * 4, POND.y - 1 + i, 1.2, C.paper);
      g.restore();
    }
  }

  function steam(g, k, conv, cx) {
    if (k <= 0) {
      return;
    }
    for (let i = 0; i < 5; i++) {
      const ph = (k * 2.2 + i * 0.21) % 1;
      const x0 = POND.x - 34 + i * 17;
      const pts = [];
      for (let j = 0; j <= 6; j++) {
        const y = -6 - ph * 96 - j * 5;
        const x = lerp(x0, cx + (i - 2) * 9, conv * seg(-y, 30, 120)) + Math.sin(j * 1.3 + i + k * 14) * 2.4;
        pts.push([x, y]);
      }
      g.save();
      g.globalAlpha *= Math.sin(Math.PI * ph) * Math.min(1, k * 6) * Math.min(1, (1 - k) * 8);
      wline(g, pts, 1.5, BLUE_INK, 0.3, i);
      g.restore();
    }
  }

  function cloud(g, x, y, s, grey, a) {
    if (s <= 0.01 || a <= 0) {
      return;
    }
    g.save();
    g.globalAlpha *= a;
    g.translate(x, y);
    g.scale(s * CLOUD.s, s * CLOUD.s);
    for (const [px, py, r] of PUFFS) {
      circle(g, px, py, r);
      g.lineWidth = 3.2;
      g.strokeStyle = C.ink;
      g.stroke();
    }
    for (const [px, py, r] of PUFFS) {
      circle(g, px, py, r);
      g.fillStyle = grey > 0 ? CLOUD_GREY : C.paper;
      g.fill();
    }
    g.restore();
  }

  function umbrella(g, hand, rot, open) {
    g.save();
    g.translate(hand[0], hand[1]);
    g.rotate(rot);
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(0, -2);
    g.lineTo(0, 4);
    g.arc(-4, 4, 4, 0, Math.PI, false);
    g.lineWidth = 2.4;
    g.strokeStyle = C.ink;
    g.stroke();
    ln(g, 0, 0, 0, -54, 1.8, C.ink);
    const w = 5 + 27 * open, h = 3 + 15 * open, rim = -36 + 2 * (1 - open);
    if (open < 0.15) {
      g.beginPath();
      g.moveTo(0, -12);
      g.quadraticCurveTo(-4.5, -30, 0, -50);
      g.quadraticCurveTo(4.5, -30, 0, -12);
      inkFill(g, C.butter, 1.3);
      ln(g, 0, -20, 2.6, -28, 1, C.umber);
    } else {
      const apex = rim - h;
      g.beginPath();
      g.moveTo(-w, rim);
      g.bezierCurveTo(-w, rim - h * 0.9, -w * 0.45, apex, 0, apex);
      g.bezierCurveTo(w * 0.45, apex, w, rim - h * 0.9, w, rim);
      const sc = 4;
      for (let i = sc - 1; i >= 0; i--) {
        const xa = -w + (2 * w * i) / sc;
        const xm = -w + (2 * w * (i + 0.5)) / sc;
        g.quadraticCurveTo(xm, rim - 4 * open, xa, rim);
      }
      g.closePath();
      inkFill(g, C.butter, 1.5);
      for (const f of [-0.5, 0, 0.5]) {
        ln(g, 0, apex, f * w, rim - 2.5 * open, 1, C.umber);
      }
      ln(g, 0, apex, 0, apex - 4, 1.8, C.ink);
    }
    g.restore();
  }

  function canopyY(cx, x, open) {
    const w = 5 + 27 * open, h = 3 + 15 * open;
    const d = (x - cx) / w;
    if (Math.abs(d) > 1) {
      return null;
    }
    return { w, top: -h * Math.sqrt(1 - d * d) };
  }

  SC['learn-water-cycle'] = {
    dur: 8.2,
    width: 420,
    label: 'The sun warms a pond and steam rises, the steam gathers into a cloud, the cloud drifts over and rains, the stick figure opens an umbrella just in time, and the pond fills back up.',
    draw(g, S) {
      const T = S.on ? S.u * this.dur : -1;
      const t = S.t;
      let pose = breathe(REST, t);
      let level = 1, steamK = 0, conv = 0, cloudS = 0, cloudX = CLOUD.x0, cloudA = 1, grey = 0;
      let rays = 1, dim = 0, flip = 0, open = 0, uh = 0, labels = [0, 0, 0], sunBack = 0;

      if (T < 0) {
        pose = mix(pose, PALM, pulse(t, 6.4, 2.6, 1.8));
      } else {
        steamK = seg(T, 0.2, 2.5);
        conv = E.soft(seg(T, 1.3, 2.3));
        level = 1 - 0.65 * E.soft(seg(T, 0.3, 2.2)) + 0.65 * E.soft(seg(T, 3.4, 5.4));
        rays = 1 + 0.5 * Math.sin(Math.PI * seg(T, 0.2, 2.2));
        cloudS = E.back(seg(T, 1.7, 2.5));
        cloudX = lerp(CLOUD.x0, CLOUD.x1, E.soft(seg(T, 2.6, 4.9)));
        grey = T > 2.9 && T < 5.9 ? 1 : 0;
        cloudS *= 1 - E.in(seg(T, 5.8, 6.4));
        cloudX += 30 * seg(T, 5.8, 6.4);
        dim = E.soft(seg(T, 3.0, 3.4)) * (1 - E.soft(seg(T, 5.9, 6.3)));
        rays *= 1 - dim;
        sunBack = seg(T, 6.0, 6.6);

        const watch = E.soft(seg(T, 0.6, 1.0)) * (1 - E.soft(seg(T, 2.3, 2.7)));
        pose = mix(pose, CHIN, watch);
        const look = E.soft(seg(T, 3.0, 3.3)) * (1 - E.soft(seg(T, 3.5, 3.7)));
        pose = mix(pose, P({ hF: [12, -60], hB: [-4, -54], head: [1, -118] }), look);
        uh = seg(T, 3.05, 3.25) * (1 - seg(T, 3.75, 3.95));
        const raise = E.soft(seg(T, 3.5, 3.8)) * (1 - E.soft(seg(T, 6.95, 7.35)));
        pose = mix(pose, UP, raise);
        flip = E.soft(seg(T, 3.55, 3.85)) * (1 - E.soft(seg(T, 6.95, 7.3)));
        open = E.back(seg(T, 3.85, 4.1)) * (1 - E.soft(seg(T, 6.7, 6.95)));
        const palm = E.soft(seg(T, 6.15, 6.4)) * (1 - E.soft(seg(T, 6.65, 6.9)));
        pose = mix(pose, P({ hF: pose.hF, hB: [28, -72], head: [5, -118], eb: -1 }), palm);

        labels = [
          seg(T, 0.4, 0.7) * (1 - seg(T, 2.0, 2.3)),
          seg(T, 2.0, 2.3) * (1 - seg(T, 3.0, 3.3)),
          seg(T, 3.3, 3.6) * (1 - seg(T, 5.4, 5.7)),
        ];
      }

      sun(g, t, rays, dim);
      sparks(g, SUN.x, SUN.y - SUN.r - 4, sunBack, 16, 7, C.amber);
      pond(g, level, t);
      steam(g, steamK, conv, CLOUD.x0);
      cloud(g, cloudX, CLOUD.y, cloudS, grey, cloudA);

      const J = fig(g, pose, FIGX, 0, { sx: -1, wave: S.wave, wt: S.wt });
      const hand = J.w.handF;
      umbrella(g, hand, Math.PI * (1 - flip), open);

      if (T >= RAIN.a) {
        const fall = 0.5;
        for (let i = 0; i < RAIN.n; i++) {
          const ph = hash(i * 3.7 + 1);
          const off = (hash(i * 1.9 + 7) - 0.5) * RAIN.span;
          const n = Math.floor((T - RAIN.a - ph * RAIN.per) / RAIN.per);
          if (n < 0) {
            continue;
          }
          const spawn = RAIN.a + ph * RAIN.per + n * RAIN.per;
          if (spawn > RAIN.b) {
            continue;
          }
          const age = T - spawn;
          const sx = lerp(CLOUD.x0, CLOUD.x1, E.soft(seg(spawn, 2.6, 4.9))) + off;
          const y0 = CLOUD.y + 10;
          let stop = 0;
          const cy = canopyY(hand[0], sx, open);
          const canopyOn = open > 0.6 && flip > 0.9 && cy;
          if (canopyOn) {
            stop = hand[1] - 36 + cy.top;
          }
          const y = y0 + age * RAIN.v;
          if (y - 6 > stop + 0.01) {
            if (age < fall + 0.14 && y - stop < 26) {
              const k = clamp((y - stop) / 26, 0, 1);
              g.save();
              g.globalAlpha *= 1 - k;
              ln(g, sx - 3 - k * 3, stop - 1 - k * 3, sx - 5 - k * 3, stop - 3 - k * 4, 1.2, BLUE_INK);
              ln(g, sx + 3 + k * 3, stop - 1 - k * 3, sx + 5 + k * 3, stop - 3 - k * 4, 1.2, BLUE_INK);
              g.restore();
            }
            continue;
          }
          ln(g, sx + 1, y - 7, sx, y, 1.5, BLUE_INK);
        }
      }

      const tag = (s, x, y, a) => {
        if (a <= 0) {
          return;
        }
        g.save();
        g.globalAlpha *= a;
        text(g, s, x, y, 9.5, BLUE_INK);
        g.restore();
      };
      tag('evaporate', POND.x, 22, labels[0]);
      tag('condense', CLOUD.x0 - 64, CLOUD.y + 6, labels[1]);
      tag('rain', cloudX - 52, CLOUD.y + 30, labels[2]);
      bubble(g, FIGX + 26, -126, 'uh-oh', uh, { tail: -24 });
    },
  };
})();
