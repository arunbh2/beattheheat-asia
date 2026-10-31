// Builds the glossary explainers (tools/explainers/specs.js) as 1920 × 1080 pages in the style of the
// first glossary films: logo header, burned-in captions, a progress bar, dark hooks and light diagrams.
//   node tools/explainers/build.js [id]
// Run it once to write <id>.narration.json, voice it with tools/films/narrate.py, then run it again:
// the second pass reads <id>.timing.json so every diagram moves on the word that names it.
"use strict";
const fs = require("fs"), path = require("path");
const { SCENES } = require("../shorts/art");
const SPECS = require("./specs");
const CSS = fs.readFileSync(path.join(__dirname, "explainer.css"), "utf8");
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const rich = s => esc(s).replace(/\*(.+?)\*/g, "<em>$1</em>");   // *word* is highlighted in orange
const VOICE = { model: "en-us-libritts-high", speaker: 599, length_scale: 1.0, licence: "LibriTTS (CC BY 4.0), via the Piper voice en-us-libritts-high" };
const MARK = (c = "#16202B") => `<svg width="40" height="31" viewBox="0 0 26 20"><path d="M2.5 8 Q13 -1 23.5 8" fill="none" stroke="#F26430" stroke-width="4" stroke-linecap="round"/><path d="M6.5 7 V18.5 M19.5 7 V18.5" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/></svg>`;
const T = t => `--t:${t.toFixed(2)}s`;
const num = (v, o = {}) => `<span data-count data-to="${v}" data-from="${o.from ?? 0}" data-t="${o.t.toFixed(2)}" data-dur="${o.dur ?? 1.4}" data-dec="${o.dec ?? 0}" data-pre="${esc(o.pre ?? "")}" data-suf="${esc(o.suf ?? "")}">${esc((o.pre ?? "") + v + (o.suf ?? ""))}</span>`;
const value = (p, t) => p.count != null ? num(p.count, { ...p, t }) : esc(p.v);

// ---- diagrams; at(k) is the time the k-th caption line of the scene starts ----
const C = {
  panels: (d, at) => `<div class="zone"><div class="panels">${d.items.map((p, i) => {
    const t = at(p.at ?? i), op = d.ops && i > 0 ? `<div class="op fade" style="${T(t - .2)}">${esc(d.ops[i - 1])}</div>` : "";
    return `${op}<div class="panel in" style="${T(t)}${p.border ? `;border-color:${p.border}` : ""}">${p.art ? `<svg viewBox="0 0 300 170">${p.art}</svg>` : ""}<div class="pl">${esc(p.label)}</div>` +
      `<div class="pv${p.count == null && String(p.v).length > 5 ? " pv--word" : ""}" style="color:${p.color || "var(--orange)"}">${value(p, t + .3)}</div>${p.note ? `<div class="pn">${esc(p.note)}</div>` : ""}</div>`; }).join("")}</div></div>`,
  scale: (d, at) => { const W = 1680, x = v => (v - d.min) / (d.max - d.min) * W;
    return `<div class="zone"><div class="scale fade" style="${T(at(d.at ?? 0))}"><div class="bar" style="background:linear-gradient(90deg,${d.colors.join(",")})"></div>` +
      (d.ticks || []).map(v => `<span class="tk" style="left:${x(v)}px">${v}${d.unit || ""}</span>`).join("") +
      (d.zones || []).map(z => `<div class="zn fade" style="left:${x(z.from)}px;width:${x(z.to) - x(z.from)}px;border-color:${z.color};${T(at(z.at ?? 0) + .2)}"><span class="zl" style="color:${z.color}">${esc(z.label)}</span></div>`).join("") +
      (d.marks || []).map(m => `<div class="mk mk--${m.up ? "up" : "down"} slide" style="left:${x(m.v)}px;--from:${-x(m.v)}px;${T(at(m.at ?? 0))}"><i style="background:${m.color || "var(--ink)"}"></i><span class="stem"></span><b style="color:${m.color || "inherit"}">${esc(m.label)}<small>${esc(m.sub || "")}</small></b></div>`).join("") + `</div></div>`; },
  bars: (d, at) => { const max = d.max || Math.max(...d.rows.map(r => r.n));
    return `<div class="zone"><div class="bars">${d.rows.map((r, i) => { const t = at(r.at ?? i);
      return `<div class="br in" style="${T(t)}"><span>${esc(r.label)}</span><div class="track"><div class="fill grow-x" style="width:${Math.max(.6, r.n / max * 100)}%;background:${r.color || "var(--orange)"};${T(t + .2)}"></div></div><span class="v" style="color:${r.color || "var(--orange)"}">${value(r, t + .2)}</span></div>`; }).join("")}</div></div>`; },
  stats: (d, at) => `<div class="zone"><div class="stats">${d.items.map((s, i) => { const t = at(s.at ?? i);
    return `<div class="st in" style="border-color:${s.color || "var(--ink)"};${T(t)}"><div class="n" style="color:${s.color || "inherit"}">${value(s, t + .2)}</div><div class="l">${esc(s.label)}</div></div>`; }).join("")}</div></div>`,
  flow: (d, at) => `<div class="zone"><div class="flow">${d.steps.map((s, i) => { const t = at(s.at ?? i);
    return `${i ? `<svg class="arw fade" viewBox="0 0 70 40" style="${T(t - .1)}"><path d="M6 20 H58 M46 8 L60 20 L46 32" fill="none" stroke="#F26430" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>` : ""}` +
      `<div class="fl in${s.hot ? " fl--hot" : ""}${s.good ? " fl--good" : ""}" style="${T(t)}"><b>${esc(s.k || String(i + 1).padStart(2, "0"))}</b><span>${esc(s.text)}</span></div>`; }).join("")}</div></div>`,
  grid: (d, at) => `<div class="zone"><div class="grid">${d.items.map((g, i) => `<div class="gi pop" style="${T(at(g.at ?? 0) + i * (d.step ?? .35))}"><b>${String(i + 1).padStart(2, "0")}</b><span>${esc(g.text)}</span></div>`).join("")}</div></div>`,
  squares: (d, at) => `<div class="zone zone--sq"><div class="sq" style="${d.n > 30 ? "gap:10px;max-width:1400px" : ""}">${Array.from({ length: Math.ceil(d.n) }, (_, i) => `<i class="pop${i < d.hot ? " h" : ""}${d.n % 1 && i === Math.ceil(d.n) - 1 ? " half" : ""}" style="${d.n > 30 ? "width:56px;height:56px;border-radius:10px;border-width:3px;" : ""}${T(at(i < d.hot ? d.hotAt ?? 1 : 0) + Math.min(i * .015 * (d.n > 30 ? 1 : 4), 1.5))}"></i>`).join("")}</div>` +
    `<div class="leg fade" style="${T(at(d.hotAt ?? 1) + .5)}"><span><i style="background:var(--orange);border-color:var(--orange)"></i>${esc(d.hotLabel)}</span><span><i style="background:#fff"></i>${esc(d.restLabel)}</span></div></div>`,
  cycle: (d, at) => { const n = d.nodes.length, RX = 560, RY = 200, cx = 840, cy = 255;
    const pos = i => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + RX * Math.cos(a), cy + RY * Math.sin(a)]; };
    const arc = i => { const a0 = -Math.PI / 2 + (i + .18) * 2 * Math.PI / n, a1 = -Math.PI / 2 + (i + .82) * 2 * Math.PI / n;
      return `M${cx + RX * Math.cos(a0)} ${cy + RY * Math.sin(a0)} A${RX} ${RY} 0 0 1 ${cx + RX * Math.cos(a1)} ${cy + RY * Math.sin(a1)}`; };
    return `<div class="zone art"><svg viewBox="0 0 1680 510" style="inset:0;width:1680px;height:510px">` +
      d.nodes.map((_, i) => `<path class="${d.brk === i ? "g" : "o"} draw" style="--len:700;${T(at(d.at ?? 0) + .2 + i * .3)}" d="${arc(i)}" stroke-width="8"/>`).join("") +
      (d.brk != null ? `<g class="pop" style="${T(at(d.brkAt ?? 1))}"><circle class="gf" cx="${pos(d.brk + .5)[0]}" cy="${pos(d.brk + .5)[1]}" r="30"/><path d="M${pos(d.brk + .5)[0] - 12} ${pos(d.brk + .5)[1]} l9 9 l16 -18" stroke="#fff" stroke-width="7"/></g>` : "") +
      `</svg>${d.nodes.map((t, i) => { const [x, y] = pos(i); return `<div class="fl in" style="position:absolute;left:${x - 160}px;top:${y - 60}px;width:320px;min-height:120px;padding:18px 20px;${T(at(d.at ?? 0) + i * .3)}"><span style="margin:0;font-size:28px">${esc(t)}</span></div>`; }).join("")}` +
      (d.center ? `<div class="fade" style="position:absolute;left:${cx - 170}px;top:${cy - 40}px;width:340px;text-align:center;font:400 46px/1 Anton;text-transform:uppercase;${T(at(d.at ?? 0) + .8)}">${esc(d.center)}</div>` : "") +
      (d.brkLabel ? `<div class="fade" style="position:absolute;left:0;top:40px;width:560px;font:700 34px/1.3 Hanken;color:var(--green);${T(at(d.brkAt ?? 1) + .2)}">${esc(d.brkLabel)}</div>` : "") + `</div>`; },
  art: (d, at) => `<div class="art"><svg viewBox="0 0 520 520" style="right:150px;top:${d.top ?? 230}px;width:${d.size ?? 700}px;height:${d.size ?? 700}px">${(SCENES[d.name])().replace(/style="--d:([\d.]+)s"/g, (m, x) => `style="${T(at(d.at ?? 0) + +x)}"`)}</svg></div>`,
  svg: (d, at) => `<div class="art"><svg viewBox="${d.box || "0 0 1680 520"}" style="left:120px;top:${d.top ?? 380}px;width:${d.w ?? 1680}px;height:${d.h ?? 520}px">${d.draw(at, T)}</svg></div>`,
  clock: (d, at) => { const r = 200, c = 2 * Math.PI * r, cx = 1340, cy = 600, t = at(d.at ?? 0);
    return `<div class="art"><svg viewBox="0 0 1920 1080" style="inset:0;width:1920px;height:1080px"><circle cx="${cx}" cy="${cy}" r="${r}" style="stroke:rgba(22,32,43,.08);stroke-width:56px"/>` +
      `<circle class="draw" cx="${cx}" cy="${cy}" r="${r}" transform="rotate(-90 ${cx} ${cy})" style="stroke:var(--ink);stroke-width:56px;--len:${c};stroke-dasharray:${c * d.work / 60} ${c};${T(t)}"/>` +
      `<circle class="draw" cx="${cx}" cy="${cy}" r="${r}" transform="rotate(${-90 + 360 * d.work / 60} ${cx} ${cy})" style="stroke:var(--green);stroke-width:56px;--len:${c};stroke-dasharray:${c * (60 - d.work) / 60} ${c};${T(at(d.restAt ?? 1))}"/>` +
      `<text x="${cx}" y="${cy - 10}" text-anchor="middle" style="font:400 120px Anton;fill:var(--ink)">60</text><text x="${cx}" y="${cy + 50}" text-anchor="middle">minutes</text>` +
      `<text class="fade" x="${cx - 420}" y="${cy - 120}" style="font:400 64px Anton;fill:var(--ink);${T(t + .4)}">${d.work} MIN</text><text class="fade" x="${cx - 420}" y="${cy - 70}" style="${T(t + .4)}">${esc(d.workLabel)}</text>` +
      `<text class="fade" x="${cx + 260}" y="${cy - 230}" style="font:400 64px Anton;fill:var(--green);${T(at(d.restAt ?? 1) + .4)}">${60 - d.work} MIN</text><text class="fade" x="${cx + 260}" y="${cy - 180}" style="${T(at(d.restAt ?? 1) + .4)}">${esc(d.restLabel)}</text></svg></div>`; },
};

function scene(s, i, start, dur, beats, isLast) {
  const at = k => start + (beats[Math.min(k, beats.length - 1)] ?? .4);
  const dark = s.type === "hook" || s.type === "end" || s.dark;
  let h = `<section class="s${dark ? " s--dark on-dark" : ""}${isLast ? " s--last" : ""}" style="--start:${start.toFixed(2)}s;--dur:${dur.toFixed(2)}s">`;
  h += `<div class="hd"><span class="logo">${MARK(dark ? "#F6E7D7" : "#16202B")}COMMON SHADE</span><span class="lab">${esc(s.label || "Plain-language glossary")}</span></div>`;
  if (s.type === "hook") h += `<svg class="rings" viewBox="0 0 1000 1000">${[0, 1.5, 3, 4.5].map(o => `<circle class="ring" style="${T(start + o)}" cx="500" cy="500" r="480" stroke-width="5"/>`).join("")}<circle class="fade" style="${T(start)}" cx="500" cy="500" r="90" fill="#F26430" stroke="none" opacity=".9"/></svg><p class="q in" style="${T(at(0) - .2)}">${rich(s.q)}</p>`;
  if (s.type === "show" && s.dark && !s.d) h += `${s.k ? `<p class="k in" style="${T(start + .2)}">${esc(s.k)}</p>` : ""}<p class="hero-n pop" style="${T(at(0))}">${esc(s.title.replace(/\*/g, ""))}</p>${s.sub ? `<p class="hero-sub in" style="${T(at(0) + .6)}">${rich(s.sub)}</p>` : ""}`;
  else if (s.type === "term" || s.type === "show") h += `${s.k ? `<p class="k in" style="${T(start + .2)}">${esc(s.k)}</p>` : ""}<p class="t${s.small ? " t--sm" : ""} in" style="${T(start + .3)}">${rich(s.title)}</p>${s.sub ? `<p class="sub in" style="${T(start + .7)}">${rich(s.sub)}</p>` : ""}`;
  if (s.type === "statement") h += `<p class="big in" style="${T(at(0) - .1)}">${rich(s.line)}</p>${s.sub ? `<p class="big-sub in" style="${T(at(s.subAt ?? 1))}">${rich(s.sub)}</p>` : ""}`;
  if (s.type === "end") h += `<div class="end-mark in" style="${T(start + .3)}">${MARK("#F6E7D7").replace('width="40" height="31"', 'width="150" height="116"')}COMMON SHADE</div><p class="end-line in" style="${T(start + .8)}">${rich(s.line)}</p><p class="end-url fade" style="${T(start + 1.3)}">${esc(s.url || "beattheheat.asia/glossary")}</p>`;
  if (s.d) h += C[s.d.kind](s.d, at);
  if (s.src) h += `<p class="src fade" style="${T(start + 1)}">Source: ${esc(s.src)}</p>`;
  return h + `</section>`;
}

const only = process.argv[2];
for (const f of SPECS.filter(f => !only || f.id === only)) {
  const tf = path.join(__dirname, f.id + ".timing.json");
  const timing = fs.existsSync(tf) ? JSON.parse(fs.readFileSync(tf, "utf8")) : null;
  fs.writeFileSync(path.join(__dirname, f.id + ".narration.json"), JSON.stringify({ voice: VOICE, scenes: f.scenes.map(s => s.say.join(" | ")) }, null, 1) + "\n");
  let t = 0; const S = f.scenes.map((s, i) => { const tm = timing && timing.scenes[i];
    const r = tm ? { start: tm.start, dur: tm.dur, beats: tm.beats } : { start: t, dur: 7, beats: s.say.map((_, k) => .5 + k * 2.6) }; t += r.dur; return r; });
  const total = timing ? timing.total : t;
  const caps = f.scenes.flatMap((s, i) => s.say.map((line, k) => { const b0 = S[i].start + S[i].beats[k], b1 = k + 1 < s.say.length ? S[i].start + S[i].beats[k + 1] : S[i].start + S[i].dur;
    return `<p style="--t:${(b0 - .05).toFixed(2)}s;--d:${(b1 - b0).toFixed(2)}s">${esc(line)}</p>`; }));
  const html = `<!DOCTYPE html>
<!-- Glossary explainer: ${esc(f.term)}. Generated by tools/explainers/build.js from specs.js; edit there.
     Rendered frame by frame by tools/explainers/render.js. Drawn, faceless figures only. -->
<html lang="en"><head><meta charset="UTF-8"><title>${esc(f.term)}</title><style>${CSS}</style></head>
<body style="--total:${total.toFixed(2)}s">
${f.scenes.map((s, i) => scene(s, i, S[i].start, S[i].dur, S[i].beats, i === f.scenes.length - 1)).join("\n")}
<div class="cap">${caps.join("")}</div><div class="prog"></div>
<script>
// numbers count up on cue; the renderer calls tick(ms) on every frame
window.tick = function (ms) { var t = ms / 1000; document.querySelectorAll("[data-count]").forEach(function (el) {
  var a = +el.dataset.from, b = +el.dataset.to, k = Math.max(0, Math.min(1, (t - +el.dataset.t) / +el.dataset.dur)), e = 1 - Math.pow(1 - k, 3), v = a + (b - a) * e, d = +el.dataset.dec;
  el.textContent = el.dataset.pre + v.toLocaleString("en-GB", { minimumFractionDigits: d, maximumFractionDigits: d }) + el.dataset.suf; }); };
</script>
</body></html>
`;
  fs.writeFileSync(path.join(__dirname, f.id + ".html"), html);
}
console.log("explainers: built", SPECS.filter(f => !only || f.id === only).length);
