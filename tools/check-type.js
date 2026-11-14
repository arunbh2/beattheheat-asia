// Common Shade: keeps type on the shared scale (tools/type-rules.js). Fails, naming file, line and selector, on a font
// size under 12px, on a px or rem size off the steps (use var(--fs-12), --fs-14, --fs-16, --fs-18, --fs-22, --fs-28;
// display type and big numbers above 28px, clamp() and em sizes are free), and on small capitals that do not use
// --label-track. The map's drawn labels, the menu, the pop-ups, print and films are out of scope.
//   node tools/check-type.js
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), T = require("./type-rules.js");
const bad = [], px = v => { const m = String(v).trim().match(/^(\d*\.?\d+)(rem|px)$/); return m ? parseFloat(m[1]) * (m[2] === "rem" ? 16 : 1) : null; };
for (const rel of T.FILES) {
  const t = fs.readFileSync(path.join(ROOT, rel), "utf8");
  for (const m of t.matchAll(/([^{}]{1,600})\{([^{}]{0,2500})\}/g)) {
    const sel = m[1].replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").trim(), body = m[2];
    if (T.skip(sel)) continue;
    const at = `${rel}:${t.slice(0, m.index).split("\n").length + (m[1].match(/\n/g) || []).length}  ${sel.slice(-60)}`;
    for (const f of body.matchAll(/font-size\s*:\s*([\d.]+(?:rem|px))/g)) {
      const p = px(f[1]);
      if (p < 12) bad.push(`${at}  font-size ${f[1]} is under the 12px floor: use var(--fs-12)`);
      else if (p <= 28) bad.push(`${at}  font-size ${f[1]} is off the scale: use var(--fs-${T.step(p, false)})`);
    }
    const display = /font-family\s*:\s*(var\(--font-display\)|["']?Anton)/i.test(body);
    if (/text-transform\s*:\s*uppercase/.test(body) && !display && /letter-spacing\s*:/.test(body) && !/letter-spacing\s*:\s*(var\(--label-track\)|0\b|normal)/.test(body))
      bad.push(`${at}  small capitals with their own letter-spacing: use var(--label-track)`);
  }
}
if (bad.length) { console.log(bad.map(b => "  FAIL " + b).join("\n")); console.log(`type check: ${bad.length} value(s) off the scale. node tools/normalise-type.js --floor --labels --sizes snaps them; the scale is in tools/type-rules.js.`); process.exit(1); }
console.log(`type check passed: ${T.FILES.length} stylesheets keep to the type scale, the 12px floor and one label spacing`);
