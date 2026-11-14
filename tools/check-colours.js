// Common Shade: keeps colour to its meanings (tools/colour-rules.js). Fails, naming file, line and selector, on:
//   - a retired near-duplicate colour (use the token it was meant to be)
//   - an evidence label (solutions tags, evidence map squares, brief labels) coloured outside the shared strength scale
//     (--ev-strong, --ev-mid, --ev-limited, --ev-guide, plus white, ink and --line-strong for neutral chips)
//   - a missing house link style (links take the colour around them with an orange underline, never the default blue)
// Contrast is checked on rendered pages by tools/check-contrast.js.
//   node tools/check-colours.js
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), C = require("./colour-rules.js");
const bad = []; let hard = 0;
const EVIDENCE = /\.(ev-tag--|evm-sq--|evm-g--|br-k--)/, NEUTRAL = /^(#fff|#ffffff|var\(--(ink|line-strong|line|white)[^)]*\)|transparent|inherit|none)$/i;
for (const rel of C.FILES) {
  const t = fs.readFileSync(path.join(ROOT, rel), "utf8");
  for (const m of t.matchAll(/([^{}]{1,600})\{([^{}]{0,2500})\}/g)) {
    const sel = m[1].replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").trim(), body = m[2];
    if (C.skip(sel)) continue;
    const at = `${rel}:${t.slice(0, m.index).split("\n").length + (m[1].match(/\n/g) || []).length}  ${sel.slice(-60)}`;
    for (const h of body.match(/#[0-9a-fA-F]{6}\b/g) || []) { hard++; const k = h.toLowerCase(); if (C.NEAR[k]) bad.push(`${at}  ${h} is a retired near-duplicate: use var(${C.NEAR[k]})`); }
    if (EVIDENCE.test(sel)) for (const d of body.matchAll(/(?:^|[;\s])(color|background|background-color|border-color)\s*:\s*([^;}]+)/g)) {
      const v = d[2].trim(); if (/var\(--ev-(strong|mid|limited|guide)\)/.test(v) || NEUTRAL.test(v)) continue;
      bad.push(`${at}  ${d[1]}: ${v} is outside the evidence strength scale: use var(--ev-strong), --ev-mid, --ev-limited or --ev-guide`);
    }
  }
}
const css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
if (!/(^|\n)a\s*\{[^}]*color\s*:\s*inherit[^}]*text-decoration-color\s*:\s*var\(--orange\)/.test(css)) bad.push("styles.css  the base link rule (a { color: inherit; text-decoration-color: var(--orange) }) is missing: links would fall back to the browser's blue");
if (bad.length) { console.log(bad.map(b => "  FAIL " + b).join("\n")); console.log(`colour check: ${bad.length} problem(s). node tools/normalise-colours.js --near --exact snaps colours to the palette in tools/colour-rules.js.`); process.exit(1); }
console.log(`colour check passed: no retired near-duplicates, evidence labels on one strength scale, house link style in place (${hard} hard-coded colours remain, in one-off art and in the map, menu and pop-ups)`);
