// Drawings for the short films: line art in the site's style, faceless stick figures only.
// Big scenes use a 520 × 520 box (ground at y = 470); card icons use 300 × 150.
// Classes: o = orange line, of = orange fill, g = green line (what helps), w = white fill.
// Animation classes (in, fade, grow, drop, slide, unfurl, pulse, sway) are defined in the page; --d sets the delay.
"use strict";

// a standing figure with its feet at (x, y); arms: "down", "up", "push", "shade", "carry"
const fig = (x, y = 470, s = 1, arms = "down", cls = "") => {
  const h = v => (v * s).toFixed(1), X = n => (x + n * s).toFixed(1), Y = n => (y - n * s).toFixed(1);
  const A = { down: `M${X(0)} ${Y(128)} L${X(-26)} ${Y(84)} M${X(0)} ${Y(128)} L${X(26)} ${Y(84)}`,
    up: `M${X(0)} ${Y(128)} L${X(-30)} ${Y(178)} M${X(0)} ${Y(128)} L${X(30)} ${Y(178)}`,
    push: `M${X(0)} ${Y(128)} L${X(40)} ${Y(104)} M${X(0)} ${Y(128)} L${X(36)} ${Y(96)}`,
    shade: `M${X(0)} ${Y(128)} L${X(-34)} ${Y(170)} M${X(0)} ${Y(128)} L${X(24)} ${Y(86)}`,
    carry: `M${X(0)} ${Y(128)} L${X(-22)} ${Y(168)} M${X(0)} ${Y(128)} L${X(22)} ${Y(168)}` }[arms];
  return `<g class="${cls}"><circle cx="${X(0)}" cy="${Y(166)}" r="${h(20)}"/><path d="M${X(0)} ${Y(146)} V${Y(70)} L${X(-20)} ${Y(0)} M${X(0)} ${Y(70)} L${X(20)} ${Y(0)} ${A}"/></g>`;
};
const sun = (cx = 420, cy = 100, r = 50, d = ".3s") => `<g class="fade" style="--d:${d}"><circle class="of pulse" cx="${cx}" cy="${cy}" r="${r}"/>` +
  `<path class="o" d="${[0, 45, 90, 135, 180, 225, 270, 315].map(a => { const t = a * Math.PI / 180, r1 = r + 16, r2 = r + 36;
    return `M${(cx + r1 * Math.cos(t)).toFixed(0)} ${(cy + r1 * Math.sin(t)).toFixed(0)} L${(cx + r2 * Math.cos(t)).toFixed(0)} ${(cy + r2 * Math.sin(t)).toFixed(0)}`; }).join(" ")}"/></g>`;
const haze = (x, y, d = "1.4s") => `<path class="o fade sway" style="--d:${d}" d="M${x} ${y} q14 -10 28 0 t28 0 t28 0 M${x + 20} ${y + 34} q14 -10 28 0 t28 0 t28 0"/>`;
const ground = `<path d="M30 470 H500"/>`;

const SCENES = {
  sun: () => sun(330, 210, 110, ".2s") + `<g class="in" style="--d:.6s">${ground}${fig(160)}</g>` + haze(250, 400, "1.2s"),
  city: () => sun(430, 90, 46) + `<g class="in" style="--d:.5s">${ground}<path d="M60 470 V250 H140 V470 M160 470 V180 H250 V470 M270 470 V300 H340 V470 M360 470 V220 H450 V470"/>` +
    `<path d="M85 290 h30 M85 340 h30 M85 390 h30 M185 220 h40 M185 270 h40 M185 320 h40 M185 370 h40 M290 340 h30 M290 390 h30 M385 260 h40 M385 310 h40 M385 360 h40" opacity=".45"/></g>` + haze(160, 130, "1.4s"),
  moon: () => `<g class="fade" style="--d:.2s"><path class="of" d="M400 60 a62 62 0 1 0 50 104 a50 50 0 1 1 -50 -104 Z"/><circle class="of" cx="200" cy="80" r="4"/><circle class="of" cx="290" cy="130" r="3"/><circle class="of" cx="120" cy="150" r="3"/></g>` +
    `<g class="in" style="--d:.6s">${ground}<path d="M80 470 V380 M440 470 V380 M80 410 H440 M80 380 H140"/><circle cx="170" cy="365" r="20"/><path d="M190 375 H400 Q420 375 420 392 V410"/></g>` +
    `<g class="fade" style="--d:1.6s"><rect x="460" y="230" width="22" height="150" rx="11"/><circle class="of" cx="471" cy="390" r="22"/><rect class="of grow" style="--d:2s" x="466" y="270" width="10" height="110"/></g>` + haze(220, 300, "2.2s"),
  vendor: () => sun(420, 90, 44) + `<g class="in" style="--d:.5s">${ground}${fig(140, 470, 1, "push")}<path d="M190 400 H380 V440 H190 Z M200 440 v0"/><circle cx="220" cy="455" r="15"/><circle cx="350" cy="455" r="15"/>` +
    `<path d="M200 400 q22 -26 44 0 q22 -26 44 0 q22 -26 44 0 q22 -26 44 0"/><path d="M180 330 H390 L370 300 H200 Z" class="o"/></g>` +
    `<g><circle class="of drop" style="--d:2.4s" cx="300" cy="230" r="16"/><circle class="of drop" style="--d:3s" cx="340" cy="220" r="16"/><circle class="of" cx="380" cy="230" r="16"/></g>`,
  house: () => sun(420, 80, 40) + `<g class="in" style="--d:.5s">${ground}<path d="M110 470 V300 H410 V470 M90 305 L260 210 L430 305"/><path class="o" d="M96 300 L260 212 L424 300" stroke-width="10"/>` +
    `<rect x="160" y="360" width="60" height="110"/><rect x="290" y="350" width="70" height="50"/>${fig(320, 470, .62, "down")}</g>` +
    `<path class="o fade sway" style="--d:1.6s" d="M180 180 q12 -12 0 -26 q-12 -14 0 -28 M260 160 q12 -12 0 -26 q-12 -14 0 -28 M340 180 q12 -12 0 -26 q-12 -14 0 -28"/>`,
  factory: () => `<g class="in" style="--d:.4s">${ground}<path d="M50 470 V260 L130 210 V260 L210 210 V260 L290 210 V260 L370 210 V470 M370 470 V180 H420 V470 M410 470 H50"/><path d="M380 180 V120 H410 V180"/>` +
    `<path d="M80 300 H340 V370 H80 Z" opacity=".5"/>${fig(140, 470, .7, "push")}${fig(260, 470, .7, "push")}</g>` +
    `<path class="o fade sway" style="--d:1.4s" d="M180 410 q12 -10 24 0 t24 0 M100 430 q12 -10 24 0 t24 0 M260 430 q12 -10 24 0 t24 0"/>` +
    `<g class="fade" style="--d:2s"><rect x="450" y="200" width="22" height="150" rx="11"/><circle class="of" cx="461" cy="360" r="22"/><rect class="of grow" style="--d:2.4s" x="456" y="230" width="10" height="120"/></g>`,
  school: () => sun(440, 80, 40) + `<g class="in" style="--d:.5s">${ground}<path d="M80 470 V280 H380 V470 M60 285 L230 200 L400 285"/><path d="M230 200 V130 M230 130 h50 v30 h-50" class="o"/>` +
    `<rect x="195" y="380" width="70" height="90"/><path d="M110 320 h50 v40 h-50 Z M300 320 h50 v40 h-50 Z"/></g>` +
    `<g class="fade" style="--d:1.5s">${fig(440, 470, .62, "down")}</g><path class="o fade" style="--d:2.2s" d="M200 400 L260 450 M260 400 L200 450"/>`,
  clinic: () => `<g class="in" style="--d:.4s">${ground}<path d="M90 470 V230 H370 V470 M90 230 H370"/><rect x="195" y="380" width="70" height="90"/>` +
    `<path class="o" d="M230 260 V330 M195 295 H265" stroke-width="16"/></g><g class="fade" style="--d:1.3s">${fig(420, 470, .8)}${fig(470, 470, .62)}</g>` + sun(440, 90, 36, "1s"),
  bell: () => `<g class="in" style="--d:.4s"><path d="M200 330 Q200 190 260 180 Q320 190 320 330 L340 360 H180 Z"/><path d="M240 380 q20 26 40 0"/><path d="M260 180 V160"/></g>` +
    `<path class="o fade" style="--d:1.2s" d="M150 220 q-24 40 0 80 M370 220 q24 40 0 80 M120 200 q-40 60 0 120 M400 200 q40 60 0 120"/>` +
    `<g class="in" style="--d:1.8s"><rect x="150" y="430" width="70" height="26" rx="6"/><rect class="w" x="225" y="430" width="70" height="26" rx="6"/><rect class="of" x="300" y="430" width="70" height="26" rx="6"/></g>`,
  power: () => sun(440, 80, 38) + `<g class="in" style="--d:.4s">${ground}<path d="M150 470 L200 160 L250 470 M170 340 H230 M160 400 H240 M185 250 H215 M120 190 H280 M200 160 V130"/><path d="M280 190 Q360 230 440 200"/></g>` +
    `<path class="of fade" style="--d:1.4s" d="M330 270 L300 340 H330 L310 400 L370 320 H340 L360 270 Z"/>` +
    `<g class="fade" style="--d:2s"><path d="M410 470 V400 Q410 380 430 380 H470 Q490 380 490 400 V470"/><path class="o" d="M450 300 q-24 34 0 50 q24 -16 0 -50 Z"/></g>`,
  glacier: () => sun(430, 90, 40) + `<g class="in" style="--d:.4s">${ground}<path d="M30 470 L170 220 L250 340 L330 200 L500 470"/><path class="w" d="M140 274 L170 220 L200 266 L180 280 L160 268 Z M300 252 L330 200 L370 266 L345 280 L322 262 Z"/></g>` +
    `<g><path class="o drop" style="--d:2s" d="M330 300 q-10 16 0 24 q10 -8 0 -24 Z"/><path class="o drop" style="--d:2.7s" d="M170 300 q-10 16 0 24 q10 -8 0 -24 Z"/></g><path class="o fade" style="--d:1.6s" d="M60 450 Q160 430 260 450 T460 450"/>`,
  ac: () => sun(440, 80, 40) + `<g class="in" style="--d:.4s">${ground}<path d="M110 470 V140 H330 V470"/>` +
    [180, 240, 300, 360, 420].map((y, i) => `<rect x="${i % 2 ? 200 : 140}" y="${y - 20}" width="60" height="34"/><path d="M${i % 2 ? 210 : 150} ${y - 3} h40" opacity=".5"/>`).join("") + `</g>` +
    `<path class="o fade sway" style="--d:1.4s" d="M350 200 h50 m-12 -10 l12 10 l-12 10 M350 300 h70 m-12 -10 l12 10 l-12 10 M350 400 h50 m-12 -10 l12 10 l-12 10"/>`,
  tree: () => sun(450, 70, 36) + `<g class="in" style="--d:.4s">${ground}<path d="M160 470 V320 M160 380 L120 340 M160 360 L200 330"/><circle cx="160" cy="260" r="90"/></g>` +
    `<path class="o fade" style="--d:1.4s" d="M60 470 Q160 440 270 470"/><g class="fade" style="--d:1.8s">${fig(200, 470, .7)}</g><g class="fade" style="--d:2.4s">${fig(380, 470, .7, "shade")}</g>` + haze(350, 250, "2.6s"),
  network: () => {
    const N = [[120, 140], [260, 90], [400, 150], [90, 300], [250, 260], [420, 320], [170, 420], [340, 430]], E = [[0, 1], [1, 2], [0, 4], [1, 4], [2, 5], [3, 4], [4, 5], [3, 6], [4, 7], [6, 7], [5, 7], [0, 3]];
    return `<g class="fade" style="--d:.4s">${E.map(([a, b]) => `<path d="M${N[a][0]} ${N[a][1]} L${N[b][0]} ${N[b][1]}" opacity=".5"/>`).join("")}</g>` +
      N.map(([x, y], i) => `<circle class="${i === 4 ? "of" : "w"} in" style="--d:${(.6 + i * .2).toFixed(1)}s" cx="${x}" cy="${y}" r="${i === 4 ? 30 : 20}"/>`).join(""); },
  chain: () => `<g class="in" style="--d:.4s">` + [[80, "moon"], [200, ""], [320, ""], [440, ""]].map(([x], i) => `<circle cx="${x}" cy="260" r="46" class="${i === 0 ? "of" : "w"}"/>`).join("") +
    `<path d="M126 260 H154 M246 260 H274 M366 260 H394"/></g><path class="g fade" style="--d:2s" d="M250 200 L270 320" stroke-width="12"/>` +
    `<g class="fade" style="--d:1s"><path d="M80 350 v40 M200 350 v40 M320 350 v40 M440 350 v40" opacity=".35"/></g>`,
  shade: () => sun(440, 70, 36) + `<g class="in" style="--d:.4s">${ground}<path d="M80 200 V470 M420 200 V470"/></g><path class="of unfurl" style="--d:.9s" d="M50 190 Q250 110 450 190 L450 212 Q250 136 50 212 Z"/>` +
    `<g class="fade" style="--d:1.6s">${fig(160, 470, .8)}${fig(255, 470, .62)}${fig(350, 470, .8)}</g>`,
  coins: () => `<g class="in" style="--d:.4s">${ground}` + [0, 1, 2, 3, 4].map(i => `<ellipse cx="160" cy="${450 - i * 26}" rx="60" ry="16" class="w"/>`).join("") + `</g>` +
    `<g class="in" style="--d:1s">` + [0, 1, 2].map(i => `<ellipse cx="340" cy="${450 - i * 26}" rx="60" ry="16" class="w"/>`).join("") + `</g>` +
    `<g><ellipse class="of drop" style="--d:2.2s" cx="340" cy="300" rx="44" ry="12"/></g><path class="o fade" style="--d:1.6s" d="M230 260 Q250 200 300 210 M288 196 l12 14 l-16 8"/>`,
  team: () => `<g class="fade" style="--d:1s">${fig(110, 470, .75)}${fig(260, 470, .75)}${fig(410, 470, .75)}</g><g class="in" style="--d:.4s">${ground}<path class="w" d="M120 380 H400 V396 H120 Z"/><path d="M150 396 V470 M370 396 V470"/></g>` +
    `<g class="fade" style="--d:1.8s"><path d="M260 120 V40 M260 40 h70 v40 h-70" class="o"/><circle class="of" cx="295" cy="60" r="8"/></g>`,
  news: () => `<g class="in" style="--d:.4s"><rect class="w" x="90" y="90" width="300" height="360" rx="10"/><path d="M120 140 H360" stroke-width="14"/><path d="M120 190 H240 M120 220 H240 M120 250 H240 M120 280 H240 M270 190 H360 M270 220 H360 M120 330 H360 M120 360 H360 M120 390 H300" opacity=".5"/>` +
    `<rect x="270" y="240" width="90" height="60" class="o"/></g><g class="in" style="--d:1.4s"><circle cx="390" cy="330" r="58" class="w"/><path d="M432 372 L480 420" stroke-width="14"/></g>`,
  check: () => `<g class="in" style="--d:.4s"><rect class="w" x="120" y="90" width="280" height="360" rx="14"/><path d="M200 90 V70 H320 V90"/>` +
    [0, 1, 2, 3, 4].map(i => `<rect x="160" y="${150 + i * 56}" width="28" height="28" rx="5"/><path d="M210 ${164 + i * 56} H360" opacity=".5"/>`).join("") + `</g>` +
    [0, 1, 2].map(i => `<path class="g fade" style="--d:${1.4 + i * .5}s" d="M164 ${164 + i * 56} l10 10 l18 -22"/>`).join(""),
  calendar: () => sun(450, 70, 34) + `<g class="in" style="--d:.4s"><rect class="w" x="60" y="140" width="400" height="300" rx="14"/><path d="M60 200 H460 M130 120 v40 M390 120 v40"/></g>` +
    [0, 1, 2, 3, 4, 5, 6].map(i => `<rect class="${i >= 2 && i <= 5 ? "of" : ""} fade" style="--d:${(1 + i * .25).toFixed(2)}s" x="${80 + i * 54}" y="240" width="40" height="40" rx="6"/>`).join("") +
    `<path d="M80 330 H440 M80 380 H440" opacity=".3"/>`,
  map: () => `<g class="in" style="--d:.4s"><path d="M80 160 L200 120 L320 160 L440 120 V400 L320 440 L200 400 L80 440 Z M200 120 V400 M320 160 V440"/></g>` +
    [[150, 260], [260, 300], [380, 230], [300, 380]].map(([x, y], i) => `<g class="in" style="--d:${(1 + i * .4).toFixed(1)}s"><path class="of" d="M${x} ${y} q-22 -30 -22 -46 a22 22 0 0 1 44 0 q0 16 -22 46 Z"/><circle class="w" cx="${x}" cy="${y - 46}" r="8"/></g>`).join(""),
  people: () => sun(450, 70, 36) + `<g class="in" style="--d:.4s">${ground}</g><path class="of unfurl" style="--d:.8s" d="M60 260 Q160 220 260 260 L260 274 Q160 236 60 274 Z"/><path class="fade" style="--d:.8s" d="M80 270 V470 M240 270 V470"/>` +
    `<g class="fade" style="--d:1.4s">${fig(160, 470, .8)}</g><g class="fade" style="--d:1.9s">${fig(380, 470, .8, "shade")}</g>` + haze(320, 260, "2.4s"),
};

const ICONS = {
  drop: `<path class="o" d="M150 30 q-50 60 -50 86 a50 50 0 0 0 100 0 q0 -26 -50 -86 Z"/>`,
  moon: `<path class="of" d="M170 20 a56 56 0 1 0 46 96 a46 46 0 1 1 -46 -96 Z"/><path d="M70 140 h160" opacity=".4"/>`,
  days: [0, 1, 2, 3, 4].map(i => `<rect class="${i > 0 ? "of" : ""}" x="${40 + i * 46}" y="50" width="36" height="60" rx="6"/>`).join(""),
  shade: `<path class="of" d="M50 50 Q150 0 250 50 L250 62 Q150 14 50 62 Z"/><path d="M70 60 V146 M230 60 V146"/>${fig(150, 146, .5)}`,
  bell: `<path d="M120 112 Q120 40 150 34 Q180 40 180 112 L192 126 H108 Z"/><path class="o" d="M90 60 q-14 26 0 52 M210 60 q14 26 0 52"/>`,
  home: `<path d="M80 146 V80 H220 V146 M66 84 L150 30 L234 84"/><path class="o" d="M70 82 L150 32 L230 82" stroke-width="8"/><rect x="130" y="104" width="40" height="42"/>`,
  pay: `<ellipse cx="110" cy="120" rx="44" ry="12"/><ellipse cx="110" cy="98" rx="44" ry="12"/><ellipse class="of" cx="110" cy="76" rx="44" ry="12"/><path class="o" d="M180 90 h60 m-14 -12 l14 12 l-14 12"/>`,
  decide: `<path d="M150 30 V130 M100 130 H200 M80 54 H220"/><path d="M100 54 L74 106 H126 Z M200 54 L174 106 H226 Z"/><circle class="of" cx="150" cy="30" r="8"/>`,
  check: `<circle cx="130" cy="80" r="46"/><path d="M164 114 L210 146" stroke-width="10"/><path class="g" d="M108 80 l14 14 l26 -30"/>`,
  tree: `<circle cx="150" cy="60" r="44"/><path d="M150 104 V146 M90 146 H210"/><path class="o" d="M70 146 Q150 124 230 146"/>`,
  fan: `<circle cx="150" cy="70" r="50"/><path class="o" d="M150 70 q-30 -30 0 -44 q20 20 0 44 q40 -10 40 20 q-26 6 -40 -20 q-6 40 -36 30 q4 -26 36 -30"/><path d="M150 120 V146 M120 146 H180"/>`,
  plans: `<rect x="96" y="20" width="108" height="126" rx="8"/><path d="M118 52 h64 M118 78 h64 M118 104 h40" opacity=".55"/><path class="g" d="M118 52 l0 0"/>`,
  work: `<path class="of" d="M60 40 Q150 0 240 40 L240 50 Q150 12 60 50 Z"/>${fig(110, 146, .5)}${fig(190, 146, .5, "carry")}`,
  school: `<path d="M70 146 V70 H230 V146 M56 74 L150 26 L244 74"/><rect x="130" y="100" width="40" height="46"/>`,
  clinic: `<path d="M80 146 V50 H220 V146"/><path class="o" d="M150 66 V114 M126 90 H174" stroke-width="12"/>`,
  city: `<path d="M50 146 V60 H100 V146 M120 146 V30 H180 V146 M200 146 V80 H250 V146"/>`,
  ward: `<path d="M60 30 H240 V140 H60 Z M120 30 V140 M180 30 V140 M60 84 H240"/><circle class="of" cx="150" cy="56" r="10"/>`,
  state: `<path d="M110 20 L170 34 L210 80 L190 140 L120 130 L90 80 Z"/><circle class="of" cx="150" cy="80" r="10"/><circle cx="120" cy="100" r="6"/><circle cx="180" cy="60" r="6"/>`,
  rules: `<rect x="90" y="20" width="120" height="126" rx="8"/><path d="M110 50 h80 M110 76 h80 M110 102 h50" opacity=".55"/>${fig(250, 146, .4)}`,
  eye: `<path d="M50 80 Q150 10 250 80 Q150 150 50 80 Z"/><circle class="of" cx="150" cy="80" r="24"/>`,
};

module.exports = { SCENES, ICONS };
