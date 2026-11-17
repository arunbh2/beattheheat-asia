// Rollback pitches for the "How to use it" section: three ways to show a rollback saving a bad deploy.
// Load after stick.js. Use as <stick-scene scene="how-rollback-lever" play="view"></stick-scene>.
(function () {
  const SC = (window.SCENES = window.SCENES || {});
  const R = window.RIG;
  const { C, E, P, mix, legs, walkSeg, fig, inkFill, rr, ln, text, seg, breathe, pulse, lp, sparks, tickBadge, circle, lerp, wline, arcPt, poly, partial, strokePath, floatText } = R;

  const RED = '#ffebe9', GREEN = '#dafbe1', RED_INK = C.redInk, GREEN_INK = C.greenInk, GREY = '#a3a3a3', TAPE = '#4a4a4a';
  const REST = { hF: [12, -60], hB: [-4, -52] };
  const CHIN = P({ hF: [10, -96], head: [7, -116], hB: [-4, -54] });
  const ALARM = P({ hF: [18, -84], hB: [6, -80], head: [1, -117], chest: [-2, -90], hang: 0 });

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
  const bump = (T, a, b, c, d) => E.soft(seg(T, a, b)) * (1 - E.soft(seg(T, c, d)));
  function puff(g, x, y, k, r) {
    if (k <= 0 || k >= 1) {
      return;
    }
    g.save();
    g.globalAlpha *= Math.sin(Math.PI * k) * 0.85;
    const rad = (r || 4) + k * 6, cy = y - k * 26;
    for (const [dx, dy, f] of [[-rad * 0.6, 1, 0.75], [rad * 0.6, 1.5, 0.7], [0, -rad * 0.35, 1]]) {
      circle(g, x + dx, cy + dy, rad * f);
      inkFill(g, '#f0f0f0', 1, '#bdbdbd');
    }
    g.restore();
  }

  // ------------------------------------------------------------ lever: the board panics, one big heave flips it back to v42
  const FX = -150, FHOME = -182;
  const PIV = [-90, -58];
  const PED = { x: -98, y: -66, w: 44, h: 66 };
  const LEN = 50, UP = -0.75, DOWN = -1.6;
  const B = { x: 12, y: -156, w: 180, h: 100 };
  const BCY = B.y + B.h / 2;
  const tipAt = (a) => [PIV[0] + Math.sin(a) * LEN, PIV[1] - Math.cos(a) * LEN];

  function lever(g, ang) {
    const tip = tipAt(ang);
    ln(g, PIV[0], PIV[1], tip[0], tip[1], 5, C.ink);
    ln(g, PIV[0], PIV[1], tip[0], tip[1], 2.2, C.steel);
    circle(g, tip[0], tip[1], 7);
    inkFill(g, C.steel, 1.6);
    rr(g, PED.x, PED.y, PED.w, PED.h, 5);
    inkFill(g, C.paper, 1.7);
    circle(g, PIV[0], PIV[1], 4);
    inkFill(g, C.paper, 1.4);
    const cx = PED.x + PED.w / 2 + 3, cy = PED.y + 40;
    R.arcArrow(g, cx, cy, 9, Math.PI * 2.3, Math.PI * 1.05, { lw: 1.9 });
  }
  function cable(g) {
    g.beginPath();
    g.moveTo(PED.x + PED.w, -8);
    g.bezierCurveTo(-30, -2, -20, -14, B.x + 2, -10);
    g.strokeStyle = '#bdbdbd';
    g.lineWidth = 1.6;
    g.stroke();
  }
  // One face of the sign. bad: v43 with a flashing panel and an error line that shoots out of the top.
  function face(g, s) {
    rr(g, B.x, B.y, B.w, B.h, 7);
    inkFill(g, s.bg, 1.8);
    g.save();
    g.translate(B.x + 34, B.y + 22);
    g.scale(1, Math.max(0.04, s.tagSq));
    rr(g, -24, -11, 48, 22, 6);
    inkFill(g, s.tint, 1.4, s.tagInk);
    text(g, s.ver, 0, 4.2, 12, s.tagInk);
    g.restore();
    const x0 = B.x + 16, x1 = B.x + B.w - 16, y0 = B.y + B.h - 16;
    ln(g, x0, y0 + 6, x1, y0 + 6, 1, C.faint);
    const pts = [];
    for (let i = 0; i <= 14; i++) {
      const k = i / 14;
      pts.push([lerp(x0, x1, k), y0 - 3 + Math.sin(i * 1.9) * 1.6 - s.climb * Math.pow(k, 2.6)]);
    }
    wline(g, pts, 2.3, s.lineCol, 0.3, 3);
    if (s.climb > 20) {
      const a = pts[pts.length - 2], b = pts[pts.length - 1];
      R.arrowHead(g, b, Math.atan2(b[1] - a[1], b[0] - a[0]), 7, 2.3, s.lineCol);
    }
    tickBadge(g, B.x + B.w - 24, B.y + 22, s.okK, 12, GREEN, GREEN_INK);
  }
  function sign(g, theta, shake, front, back) {
    ln(g, B.x - 5, BCY, B.x - 14, 0, 2.4);
    ln(g, B.x + B.w + 5, BCY, B.x + B.w + 14, 0, 2.4);
    const c = Math.cos(theta);
    const showBack = Math.floor((theta + Math.PI / 2) / Math.PI) % 2 === 1;
    g.save();
    g.translate(shake, BCY);
    g.scale(1, Math.max(0.03, Math.abs(c)));
    g.translate(0, -BCY);
    face(g, showBack ? back : front);
    g.restore();
    for (const x of [B.x - 5, B.x + B.w + 5]) {
      circle(g, x, BCY, 3.6);
      inkFill(g, C.paper, 1.4);
    }
  }

  SC['how-rollback-lever'] = {
    dur: 7,
    width: 460,
    label: 'A status board flips to v43, flashes red and its error line shoots off the top. A stick figure does a double-take, spits on its hands and heaves a big lever, the board spins over to a calm green v42, and the figure dusts off its hands.',
    draw(g, S) {
      const T = S.on ? S.u * this.dur : -1;
      const t = S.t;
      let pose = breathe(P(REST), t);
      let x = FHOME, hop = 0, gait = { ph: 0, amp: 0 };
      let tagSq = 1, is43 = false, climb = 0, flash = 0, shake = 0, theta = 0, good = 0, okK = 0, ang = UP, bang = 0, spit = 0;
      if (T < 0) {
        pose = mix(pose, CHIN, pulse(t, 6.2, 2.4, 2.2));
      } else {
        const fade = 1 - seg(T, this.dur - 0.5, this.dur);
        const f1 = seg(T, 0.2, 0.5);
        tagSq = Math.abs(Math.cos(Math.PI * f1));
        is43 = f1 >= 0.5;
        climb = 50 * E.soft(seg(T, 0.5, 1.4)) + 60 * E.out3(seg(T, 1.5, 1.75));
        const alarmOn = seg(T, 0.9, 1.1);
        const tf = E.out3(seg(T, 3.4, 4.05));
        theta = tf * Math.PI * 3;
        const calm = theta > Math.PI / 2 ? 0 : 1;
        flash = alarmOn * calm * (0.5 + 0.5 * Math.sin(T * 18));
        shake = Math.sin(T * 55) * 1.8 * alarmOn * (1 - seg(T, 3.3, 3.5));
        good = seg(T, 3.9, 4.1) * fade;
        okK = seg(T, 3.95, 4.4) * fade;
        bang = seg(T, 1.1, 1.6);
        spit = seg(T, 1.68, 1.95);
        const wig = Math.sin(seg(T, 2.85, 3.1) * Math.PI * 3) * 0.06;
        const pull = E.soft(seg(T, 3.1, 3.45));
        ang = lerp(lerp(UP, DOWN, pull) - wig, UP, E.back(seg(T, 3.95, 4.45)));

        const ws = T < 4.5 ? walkSeg(T, 2.2, 2.65, FHOME, FX) : walkSeg(T, 5.45, 5.95, FX, FHOME);
        x = ws.x;
        gait = T < 4.5 ? ws : { ph: -ws.ph, amp: ws.amp, stride: ws.stride };
        hop = Math.sin(Math.PI * seg(T, 1.05, 1.35)) * 7;
        const glance = bump(T, 0.45, 0.65, 0.75, 0.9);
        const away = bump(T, 0.75, 0.9, 0.98, 1.08);
        const take = bump(T, 1.0, 1.15, 1.35, 1.55);
        const toMouth = bump(T, 1.45, 1.68, 1.85, 2.0);
        const rubK = bump(T, 1.85, 2.0, 2.15, 2.3);
        const rub = Math.sin(T * 30) * 4;
        const grab = bump(T, 2.6, 2.85, 3.75, 4.0);
        const heave = bump(T, 2.8, 3.05, 3.7, 4.0);
        const tremble = Math.sin(T * 40) * 0.8 * seg(T, 2.85, 2.9) * (1 - seg(T, 3.1, 3.15));
        const dust = bump(T, 4.2, 4.45, 5.0, 5.3);
        const brush = Math.sin(T * 22) * 5;
        pose = mix(pose, P({ ...REST, head: [10, -116] }), glance);
        pose = mix(pose, P({ ...REST, head: [-3, -116] }), away);
        pose = mix(pose, ALARM, take);
        pose = mix(pose, P({ hF: [9, -100], hB: [7, -98], head: [7, -114], chest: [2, -90], hang: 0 }), toMouth);
        pose = mix(pose, P({ hF: [17 + rub, -76], hB: [13 - rub, -74], head: [6, -115], hang: 0 }), rubK);
        const knob = lp(tipAt(ang), x, 0, 1);
        pose = mix(pose, P({ hF: knob, hB: [knob[0] - 2, knob[1] + 3], head: [5, -115], hang: 0 }), grab);
        const lean = 0.35 + 0.65 * pull;
        pose = mix(pose, P({ hF: knob, hB: [knob[0] - 2, knob[1] + 3], head: [-14 * lean + tremble, -116 + 6 * lean], chest: [-10 * lean + tremble, -90 + 4 * lean], hip: [-3, -57], fF: [17, -2.5], fB: [-15, -2.5], kF: [14, -32], kB: [-4, -32], hang: 0 }), heave);
        pose = mix(pose, P({ hF: [14 + brush, -66], hB: [10 - brush, -64], head: [3, -119], chest: [-1, -90] }), dust);
      }
      pose = legs(pose, gait.ph, gait.amp, { arms: false, stride: gait.stride });

      const front = {
        bg: mixCol('#ffffff', C.red, flash * 0.8),
        tagSq,
        ver: is43 ? 'v43' : 'v42',
        tint: is43 ? RED : '#ffffff',
        tagInk: is43 ? RED_INK : C.ink,
        climb,
        lineCol: mixCol(GREY, RED_INK, seg(climb, 0, 12)),
        okK: 0,
      };
      const back = {
        bg: '#ffffff',
        tagSq: 1,
        ver: 'v42',
        tint: mixCol('#ffffff', GREEN, good),
        tagInk: mixCol(C.ink, GREEN_INK, good),
        climb: 0,
        lineCol: mixCol(GREY, GREEN_INK, good),
        okK,
      };
      cable(g);
      sign(g, theta, shake, front, back);
      lever(g, ang);
      const J = fig(g, pose, x, -hop, { wave: S.wave, wt: S.wt, floor: 0 });
      if (bang > 0 && bang < 1) {
        g.save();
        g.globalAlpha *= Math.sin(Math.PI * bang);
        text(g, '!', J.w.head[0] + 6, J.w.head[1] - 16 - bang * 6, 22, RED_INK);
        g.restore();
      }
      if (spit > 0 && spit < 1) {
        const m = [J.w.head[0] + 6, J.w.head[1] + 4];
        for (let i = 0; i < 3; i++) {
          const k = seg(spit, i * 0.12, 0.7 + i * 0.12);
          if (k > 0 && k < 1) {
            const p = arcPt(m, [J.w.handF[0] + i * 2, J.w.handF[1] - 2], 6, k);
            circle(g, p[0], p[1], 1.4);
            inkFill(g, C.sky, 0.8, '#7a8a99');
          }
        }
      }
      sparks(g, B.x + B.w - 24, B.y + 16, seg(T, 4.0, 4.6), 20, 7, GREEN_INK);
    },
  };

  // ------------------------------------------------------------ tape: it spews ribbon, the figure winds it back in with a pencil
  const TX = -172, TAT = -64;
  const K = { x: -32, y: -160, w: 176, h: 104 };
  const KC = K.x + K.w / 2, KB = K.y + K.h;
  const HUB = [[KC - 36, K.y + 63], [KC + 36, K.y + 63]];
  const KOK = [K.x + K.w - 36, K.y + 24];
  const WIND = [-38, -95];
  const PLEN = 54;

  function arrows(g, x, y, dir, a) {
    if (a <= 0) {
      return;
    }
    g.save();
    g.globalAlpha *= a;
    g.fillStyle = C.ink;
    for (let i = 0; i < 2; i++) {
      const ox = x + (i - 0.5) * 9;
      poly(g, [[ox + 5 * dir, y], [ox - 4 * dir, y - 5.5], [ox - 4 * dir, y + 5.5]], true);
      g.fill();
    }
    g.restore();
  }
  function hub(g, x, y, rot) {
    circle(g, x, y, 9.5);
    inkFill(g, C.paper, 1.5);
    for (let i = 0; i < 6; i++) {
      const a = rot + (i * Math.PI) / 3;
      ln(g, x + Math.cos(a) * 4.2, y + Math.sin(a) * 4.2, x + Math.cos(a) * 8.5, y + Math.sin(a) * 8.5, 1.6, C.ink);
    }
    circle(g, x, y, 2.2);
    inkFill(g, C.ink, 1);
  }
  const ktf = (s, p) => {
    const dx = p[0] - KC, dy = p[1] - KB, c = Math.cos(s.tilt), n = Math.sin(s.tilt);
    return [KC + dx * c - dy * n + s.shake, KB + dx * n + dy * c - s.hop];
  };
  function cassette(g, s) {
    const lA = ktf(s, [K.x + 46, KB]), lB = ktf(s, [K.x + K.w - 46, KB]);
    ln(g, lA[0], lA[1], K.x + 32, 0, 2.2);
    ln(g, lB[0], lB[1], K.x + K.w - 32, 0, 2.2);
    g.save();
    g.translate(KC + s.shake, KB - s.hop);
    g.rotate(s.tilt);
    g.translate(-KC, -KB);
    rr(g, K.x, K.y, K.w, K.h, 10);
    inkFill(g, C.paper, 1.9);
    for (const [cx, cy] of [[K.x + 8, K.y + 8], [K.x + K.w - 8, K.y + 8], [K.x + 8, KB - 8], [K.x + K.w - 8, KB - 8]]) {
      circle(g, cx, cy, 1.8);
      inkFill(g, C.paper, 1);
    }
    const L = { x: K.x + 16, y: K.y + 10, w: K.w - 32, h: 28 };
    rr(g, L.x, L.y, L.w, L.h, 6);
    inkFill(g, s.tint, 1.4);
    g.save();
    rr(g, L.x + 1, L.y + 1, L.w - 2, L.h - 2, 5);
    g.clip();
    const base = L.y + L.h / 2 + 4.2;
    text(g, 'v42', KC, base - s.p * 22, 12, s.ink42);
    text(g, 'v43', KC, base + (1 - s.p) * 22, 12, RED_INK);
    g.restore();
    arrows(g, L.x + L.w - 20, L.y + L.h / 2, 1, s.ff);
    const W = { x: KC - 62, y: K.y + 45, w: 124, h: 36 };
    rr(g, W.x, W.y, W.w, W.h, 11);
    inkFill(g, '#f3f3f3', 1.4);
    g.save();
    rr(g, W.x + 1, W.y + 1, W.w - 2, W.h - 2, 10);
    g.clip();
    const rads = [18 - 6 * s.tape, 12 + 6 * s.tape];
    for (let i = 0; i < 2; i++) {
      circle(g, HUB[i][0], HUB[i][1], rads[i]);
      inkFill(g, TAPE, 1.2);
    }
    g.restore();
    hub(g, HUB[0][0], HUB[0][1], s.rot);
    hub(g, HUB[1][0], HUB[1][1], s.rot + 0.5);
    poly(g, [[K.x + 50, KB], [K.x + 62, KB - 15], [K.x + K.w - 62, KB - 15], [K.x + K.w - 50, KB]], false);
    g.strokeStyle = C.ink;
    g.lineWidth = 1.5;
    g.stroke();
    circle(g, KC - 26, KB - 7.5, 2.8);
    inkFill(g, C.paper, 1.2);
    circle(g, KC + 26, KB - 7.5, 2.8);
    inkFill(g, C.paper, 1.2);
    g.restore();
    tickBadge(g, KOK[0], KOK[1], s.okK, 11, GREEN, GREEN_INK);
  }
  // A tangle of ribbon hanging out of the bottom of the cassette and piling on the floor; k is how much is out.
  function ribbon(g, s, k, t) {
    if (k <= 0.01) {
      return;
    }
    const ex = ktf(s, [KC - 6, KB]);
    const pts = [];
    const N = 220, n = Math.max(2, Math.round(N * k));
    for (let i = 0; i <= n; i++) {
      const u = i / N;
      let bx, by;
      if (u < 0.22) {
        bx = ex[0] + Math.sin(u * 22) * 5;
        by = lerp(ex[1], -12, u / 0.22);
      } else {
        const v = (u - 0.22) / 0.78;
        bx = ex[0] + Math.sin(v * 6.5) * 46 + v * 26;
        by = -12 - 7 * Math.abs(Math.sin(v * 9));
      }
      const r = (u < 0.22 ? 3 : 5) + 6 * (0.5 + 0.5 * Math.sin(u * 17) * Math.sin(u * 5.3 + 1));
      const a = u * 70 + Math.sin(u * 13) * 2 + Math.sin(t * 5 + u * 8) * 0.25;
      pts.push([bx + Math.cos(a) * r, Math.min(-2, by + Math.sin(a) * r * 0.8)]);
    }
    strokePath(g, pts, 1.5, TAPE);
  }
  function pencil(g, hand, a, len) {
    if (len <= 1) {
      return;
    }
    g.save();
    g.translate(hand[0], hand[1]);
    g.rotate(a);
    const back = Math.min(7, len * 0.15), body = len - back - 8;
    rr(g, -back, -2.8, back + body, 5.6, 1.5);
    inkFill(g, C.paper, 1.3);
    rr(g, -back - 4, -2.8, 4.5, 5.6, 1.5);
    inkFill(g, '#d4d4d4', 1.2);
    poly(g, [[body, -2.8], [body + 8, 0], [body, 2.8]], true);
    inkFill(g, C.wood, 1.2);
    poly(g, [[body + 5, -1], [body + 8, 0], [body + 5, 1]], true);
    g.fillStyle = C.ink;
    g.fill();
    g.restore();
  }

  SC['how-rollback-tape'] = {
    dur: 7,
    width: 460,
    label: 'A big cassette fast-forwards to a red v43 and spews a tangle of tape. A stick figure pulls a pencil from its pocket, winds the tape back in, and the cassette pops back into place on a green v42.',
    draw(g, S) {
      const T = S.on ? S.u * this.dur : -1;
      const t = S.t;
      let pose = breathe(P(REST), t);
      let x = TX, gait = { ph: 0, amp: 0 };
      let p = 0, tape = 0, spin = 0, red = 0, green = 0, okK = 0, ff = 0, shake = 0, tilt = 0, hop = 0, spew = 0;
      let penOut = 0, penUp = 0, penIn = 0, windA = 0, ding = 0;
      if (T < 0) {
        pose = mix(pose, CHIN, pulse(t, 6.4, 2.6, 2.2));
      } else {
        const fade = 1 - seg(T, this.dur - 0.5, this.dur);
        const fK = E.soft(seg(T, 0.15, 0.8)), rK = E.soft(seg(T, 3.3, 4.45));
        tape = fK - rK;
        spin = fK * 9 - rK * (9 + Math.PI * 6);
        p = E.soft(seg(T, 0.3, 0.75)) - E.soft(seg(T, 4.1, 4.45));
        red = seg(T, 0.7, 0.9) * (1 - seg(T, 4.2, 4.45));
        green = seg(T, 4.45, 4.65) * fade;
        okK = seg(T, 4.6, 5.0) * fade;
        ff = seg(T, 0.1, 0.25) * (1 - seg(T, 0.7, 0.85)) * (0.6 + 0.4 * Math.abs(Math.sin(T * 12)));
        spew = E.out3(seg(T, 0.8, 1.6)) * (1 - E.soft(seg(T, 3.3, 4.35)));
        const pop = seg(T, 4.45, 4.85);
        tilt = 0.075 * E.back(seg(T, 0.8, 1.0)) * (1 - E.back(pop));
        hop = Math.sin(Math.PI * seg(T, 4.45, 4.75)) * 9;
        shake = Math.sin(T * 70) * 1.4 * seg(T, 0.8, 0.85) * (1 - seg(T, 1.3, 1.6));

        const ws = T < 4.9 ? walkSeg(T, 2.15, 3.05, TX, TAT) : walkSeg(T, 5.0, 5.75, TAT, TX);
        x = ws.x;
        gait = T < 4.9 ? ws : { ph: -ws.ph, amp: ws.amp, stride: ws.stride };
        const alarm = bump(T, 0.85, 1.05, 1.25, 1.45);
        const pocket = bump(T, 1.45, 1.7, 1.75, 1.95) + bump(T, 5.7, 5.95, 6.1, 6.35);
        const holdUp = bump(T, 1.75, 2.1, 2.95, 3.25) + bump(T, 4.5, 4.75, 5.7, 5.95);
        windA = bump(T, 3.0, 3.3, 4.4, 4.6);
        penOut = E.soft(seg(T, 1.75, 2.05)) * (1 - E.soft(seg(T, 5.95, 6.25)));
        penUp = bump(T, 2.05, 2.3, 5.55, 5.8);
        penIn = bump(T, 2.95, 3.25, 4.45, 4.65);
        ding = seg(T, 2.25, 2.7);
        const look = bump(T, 4.3, 4.5, 4.8, 5.0);
        const ang = T * Math.PI * 2 * 3.2;
        const wv = [WIND[0] + Math.cos(ang) * 5 * windA, WIND[1] + Math.sin(ang) * 5 * windA];
        pose = mix(pose, ALARM, alarm);
        pose = mix(pose, P({ hF: [6, -57], hB: [-4, -52], head: [8, -113] }), pocket);
        pose = mix(pose, P({ hF: [22, -98], hB: [-4, -54], head: [9, -116] }), holdUp);
        pose = mix(pose, P({ hF: lp(wv, x, 0, 1), hB: [-4, -54], head: [9, -114], chest: [3, -90] }), windA);
        pose = mix(pose, P({ hF: [22, -98], hB: [-4, -54], head: [4, -118] }), look);
      }
      pose = legs(pose, gait.ph, gait.amp, { arms: false, stride: gait.stride });

      const ks = {
        p,
        tape,
        rot: t * 1.4 + spin,
        tint: mixCol(mixCol('#ffffff', RED, red), GREEN, green),
        ink42: mixCol(C.ink, GREEN_INK, green),
        ff,
        shake,
        tilt,
        hop,
        okK,
      };
      ribbon(g, ks, spew, t);
      cassette(g, ks);
      const J = fig(g, pose, x, 0, { wave: S.wave, wt: S.wt });
      if (penOut > 0) {
        const h = J.w.handF;
        const pk = [J.w.hip[0] + 5, J.w.hip[1] + 3];
        const d = Math.hypot(pk[0] - h[0], pk[1] - h[1]);
        let a = Math.atan2(pk[1] - h[1], pk[0] - h[0]);
        let len = Math.min(PLEN, d + 2) * (penOut < 1 ? Math.min(1, d / 8) : 1);
        if (penOut >= 1 || d > PLEN) {
          len = PLEN;
        }
        a = lerp(a, -1.2, penUp);
        const tip = ktf(ks, HUB[0]);
        const at = Math.atan2(tip[1] - h[1], tip[0] - h[0]);
        a = lerp(a, at, penIn);
        len = lerp(len, Math.hypot(tip[0] - h[0], tip[1] - h[1]) + 10, penIn);
        pencil(g, h, a, len);
        if (ding > 0 && ding < 1) {
          sparks(g, h[0] + Math.cos(-1.2) * PLEN, h[1] + Math.sin(-1.2) * PLEN - 4, ding, 10, 5, C.muted);
        }
      }
      sparks(g, KOK[0], KOK[1] - 4, seg(T, 4.6, 5.2), 18, 7, GREEN_INK);
    },
  };

  // ------------------------------------------------------------ swap: haul the smoking v43 out of the slot, bin it, click v42 back in
  const CAB = { x: -6, y: -72, w: 140, h: 72 };
  const CW = 52, CH = 44, CX = 24;
  const SEAT = -76, SUNK = SEAT + CH, RAISED = -84;
  const LAMP = [CAB.x + CAB.w - 32, CAB.y + 36];
  const SOK = [LAMP[0], CAB.y - 20];
  const BIN = { x: -212, w: 56, h: 54 };
  const BINC = BIN.x + BIN.w / 2;
  const HOME = -112, AT = -18;
  const top = (c) => c[1] - CH / 2;

  function cabinet(g, lampFill, lampInk, glow) {
    rr(g, CAB.x, CAB.y, CAB.w, CAB.h, 6);
    inkFill(g, C.paper, 1.8);
    rr(g, CX - CW / 2 - 4, CAB.y - 2, CW + 8, 6, 3);
    inkFill(g, '#2b2b2b', 1.4);
    for (let i = 0; i < 3; i++) {
      ln(g, CAB.x + 14, CAB.y + 26 + i * 9, CAB.x + 60, CAB.y + 26 + i * 9, 1.4, C.faint);
    }
    if (glow > 0) {
      g.save();
      g.globalAlpha *= glow;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        ln(g, LAMP[0] + Math.cos(a) * 16, LAMP[1] + Math.sin(a) * 16, LAMP[0] + Math.cos(a) * 22, LAMP[1] + Math.sin(a) * 22, 1.6, lampInk);
      }
      g.restore();
    }
    circle(g, LAMP[0], LAMP[1], 12);
    inkFill(g, lampFill, 1.7, lampInk);
  }
  function crate(g, c, rot, label, labelInk, tint, crack) {
    g.save();
    g.translate(c[0], c[1]);
    g.rotate(rot);
    rr(g, -CW / 2, -CH / 2, CW, CH, 3);
    inkFill(g, C.wood, 1.7);
    ln(g, -CW / 2 + 6, -CH / 2 + 3, -CW / 2 + 6, CH / 2 - 3, 1.2, '#c9b28f');
    ln(g, CW / 2 - 6, -CH / 2 + 3, CW / 2 - 6, CH / 2 - 3, 1.2, '#c9b28f');
    if (crack > 0) {
      strokePath(g, partial([[-CW / 2 + 3, -CH / 2], [-15, -10], [-20, -4], [-12, 2]], crack), 1.8, RED_INK);
      strokePath(g, partial([[CW / 2 - 5, -CH / 2], [16, -9], [21, -3], [14, 3]], crack), 1.8, RED_INK);
    }
    rr(g, -15, -CH / 2 + 3, 30, 15, 3);
    inkFill(g, tint, 1.3, labelInk);
    text(g, label, 0, -CH / 2 + 14.5, 11, labelInk);
    g.restore();
  }
  function bin(g, lid) {
    const x0 = BIN.x, x1 = BIN.x + BIN.w, y0 = -BIN.h;
    poly(g, [[x0, y0], [x1, y0], [x1 - 5, 0], [x0 + 5, 0]], true);
    inkFill(g, C.steel, 1.7);
    for (let i = 1; i < 4; i++) {
      const fx = x0 + (BIN.w / 4) * i;
      ln(g, fx, y0 + 8, lerp(fx, BINC, 0.1), -6, 1.2, '#b8bcc2');
    }
    g.save();
    g.translate(x0 - 2, y0);
    g.rotate(lid);
    rr(g, 0, -6, BIN.w + 4, 6, 3);
    inkFill(g, C.steel, 1.6);
    rr(g, BIN.w / 2 - 6, -10, 12, 5, 2);
    inkFill(g, C.steel, 1.3);
    g.restore();
  }

  SC['how-rollback-swap'] = {
    dur: 7,
    width: 460,
    label: 'A cracked, smoking v43 crate drops into the live slot and the light turns red. A stick figure hauls it out and tosses it over its shoulder into a bin, the old v42 crate springs up, and one push clicks it in and the light turns green.',
    draw(g, S) {
      const T = S.on ? S.u * this.dur : -1;
      const t = S.t;
      let x = AT, gait = { ph: 0, amp: 0 };
      x = HOME;
      let pose = breathe(P(REST), t);
      let y42 = SEAT, c43 = null, rot43 = 0, crack = 0, bad = 0, good = 0, okK = 0, lid = 0, smoke = 0, binPuff = 0, effort = 0;
      if (T < 0) {
        pose = mix(pose, CHIN, pulse(t, 6.2, 2.4, 2.2));
      } else {
        const fade = 1 - seg(T, this.dur - 0.5, this.dur);
        const fall = E.in(seg(T, 0.2, 0.5));
        const push = E.out(seg(T, 0.5, 0.65));
        const spring = E.back(seg(T, 3.1, 3.4));
        const press = E.in(seg(T, 3.75, 3.9));
        y42 = lerp(lerp(lerp(SEAT, SUNK, push), RAISED, spring), SEAT, press);
        const seated = lerp(lerp(-280, SEAT - CH, fall), SEAT, push);
        const jig = Math.sin(T * 45) * 1.3 * seg(T, 2.2, 2.3) * (1 - seg(T, 2.7, 2.8));
        const rise = E.soft(seg(T, 2.3, 2.75)) * 4;
        const fly = seg(T, 2.8, 3.55);
        const start = [CX + jig, seated - rise];
        c43 = fly > 0 ? arcPt(start, [BINC, -24], 100, fly) : start;
        rot43 = -fly * Math.PI * 2;
        if (T < 0.2 || fly >= 1) {
          c43 = null;
        }
        crack = seg(T, 0.65, 0.85);
        smoke = seg(T, 0.7, 0.9);
        bad = seg(T, 0.62, 0.72) * (1 - seg(T, 3.85, 3.9));
        good = seg(T, 3.88, 4.0) * fade;
        okK = seg(T, 3.95, 4.4) * fade;
        const u = T - 3.42;
        lid = u > 0 ? -1.3 * Math.exp(-u * 4.5) * Math.abs(Math.cos(u * 12)) * seg(u, 0, 0.04) : 0;
        binPuff = seg(T, 3.55, 4.4);
        effort = seg(T, 2.2, 2.3) * (1 - seg(T, 2.7, 2.8));

        const ws = T < 4.6 ? walkSeg(T, 1.1, 1.95, HOME, AT) : walkSeg(T, 5.25, 6.1, AT, HOME);
        x = ws.x;
        gait = T < 4.6 ? ws : { ph: -ws.ph, amp: ws.amp, stride: ws.stride };
        const alarm = bump(T, 0.7, 0.95, 1.05, 1.25);
        const grab = bump(T, 1.9, 2.15, 2.7, 2.85);
        const strain = bump(T, 2.1, 2.35, 2.72, 3.0);
        const tremble = Math.sin(T * 40) * 0.9 * effort;
        const toss = bump(T, 2.7, 3.08, 3.2, 3.62);
        const peek = bump(T, 3.3, 3.58, 4.05, 4.3);
        const reach = bump(T, 3.5, 3.75, 4.0, 4.25);
        const pump = E.back(seg(T, 4.25, 4.55)) * (1 - E.soft(seg(T, 4.75, 5.05)));
        const hold = start;
        const gF = lp([hold[0] - CW / 2 + 5, top(hold) + 5], x, 0, 1);
        const gB = lp([hold[0] - CW / 2 + 3, top(hold) + 12], x, 0, 1);
        pose = mix(pose, ALARM, alarm);
        pose = mix(pose, P({ hF: gF, hB: gB, head: [8, -115], chest: [3, -90] }), grab);
        pose = mix(pose, P({ hF: gF, hB: gB, head: [-5 + tremble, -112], chest: [-3 + tremble, -88], hip: [-2, -58], fF: [16, -2.5], fB: [-14, -2.5], kF: [14, -32], kB: [-4, -32] }), strain);
        pose = mix(pose, P({ hF: [-8, -132], hB: [-14, -127], head: [-4, -116], chest: [-4, -89] }), toss);
        pose = mix(pose, P({ ...REST, head: [10, -114], chest: [2, -90] }), peek);
        pose = mix(pose, P({ hF: lp([CX - CW / 2 + 6, top([CX, y42]) - 1], x, 0, 1), hB: [-4, -54], head: [10, -114], chest: [4, -89] }), reach);
        pose = mix(pose, P({ hF: [16, -122], hB: [-4, -54], head: [4, -118] }), pump);
      }
      pose = legs(pose, gait.ph, gait.amp, { arms: false, stride: gait.stride });

      const blink = 0.55 + 0.45 * Math.abs(Math.sin(t * 9));
      crate(g, [CX, y42], 0, 'v42', mixCol(C.ink, GREEN_INK, good), mixCol('#ffffff', GREEN, good), 0);
      if (c43) {
        crate(g, c43, rot43, 'v43', RED_INK, RED, crack);
      }
      cabinet(g, bad > 0.5 ? '#f28b82' : mixCol(GREEN, '#8fd19e', good), bad > 0.5 ? RED_INK : GREEN_INK, bad > 0.5 ? blink : good);
      bin(g, lid);
      if (c43 && smoke > 0) {
        for (let i = 0; i < 3; i++) {
          puff(g, c43[0] - 10 + i * 10, c43[1] - CH / 2 - 2, ((t * 0.9 + i / 3) % 1) * smoke, 3);
        }
      }
      puff(g, BINC, -60, binPuff, 7);
      fig(g, pose, x, 0, { wave: S.wave, wt: S.wt });
      if (effort > 0) {
        sparks(g, CX - 8, top([CX, SEAT]) - 6, (t * 2.5) % 1, 12, 4, C.muted);
      }
      floatText(g, 'clunk', BINC, -74, seg(T, 3.45, 4.1), C.muted, 10);
      floatText(g, 'click', CX + 4, -118, seg(T, 3.9, 4.5), GREEN_INK, 10);
      tickBadge(g, SOK[0], SOK[1], okK, 11, GREEN, GREEN_INK);
      sparks(g, LAMP[0], LAMP[1] - 6, seg(T, 3.9, 4.5), 22, 7, GREEN_INK);
    },
  };
})();
