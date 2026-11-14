#!/usr/bin/env node
// Common Shade: snaps existing type to the scale in tools/type-rules.js, in place: each class keeps its name and no
// page builder changes. Run one step at a time and look at the pages after each.
//   node tools/normalise-type.js --floor     any font size under 12px becomes 12px
//   node tools/normalise-type.js --labels    small capitals (uppercase rules) take one recipe: 12px, bold, --label-track
//   node tools/normalise-type.js --sizes     every px or rem font size snaps to a step (display above 28px stays)
//   node tools/normalise-type.js --leading   unitless line-heights snap to 1.15, 1.4 or 1.55 (below 1 stays)
//   node tools/normalise-type.js --track     faint letter-spacing on ordinary text is removed
// Add --dry to list without writing, --verbose to see each rule.
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), T = require("./type-rules.js");
const a = process.argv.slice(2), dry = a.includes("--dry"), on = k => a.includes("--" + k);
let n = 0; const log = {};
const note = (k, s) => { log[k] = (log[k] || 0) + 1; n++; if (a.includes("--verbose")) console.log(k.padEnd(8), s); };
const px = v => { const m = String(v).trim().match(/^(\d*\.?\d+)(rem|px)$/); return m ? parseFloat(m[1]) * (m[2] === "rem" ? 16 : 1) : null; };
for (const rel of T.FILES) {
  const f = path.join(ROOT, rel); let t = fs.readFileSync(f, "utf8"); const before = t;
  t = t.replace(/([^{}]{1,600})\{([^{}]{0,2500})\}/g, (all, selRaw, body) => {
    const sel = selRaw.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").trim();
    if (T.skip(sel)) return all;
    let b = body;
    const display = /font-family\s*:\s*(var\(--font-display\)|["']?Anton)/i.test(b);
    const isLabel = /text-transform\s*:\s*uppercase/i.test(b) && !display;
    if (on("floor")) b = b.replace(/font-size\s*:\s*([\d.]+(?:rem|px))/g, (m, v) => { const p = px(v); if (p !== null && p < 12) { note("floor", sel); return "font-size: var(--fs-12)"; } return m; });
    if (on("labels") && isLabel) {
      b = b.replace(/font-size\s*:\s*([\d.]+(?:rem|px)|var\(--fs-1[24]\))/g, (m, v) => { const p = px(v); if (p === null ? /--fs-14/.test(v) : p <= 14) { note("label", sel); return "font-size: var(--fs-12)"; } return m; });
      b = b.replace(/font-weight\s*:\s*(600|800|900)/g, () => { note("label-wt", sel); return "font-weight: 700"; });
      b = b.replace(/letter-spacing\s*:\s*[^;}]+/g, m => { if (/var\(--label-track\)/.test(m)) return m; note("label-ls", sel); return "letter-spacing: var(--label-track)"; });
    }
    if (on("sizes")) b = b.replace(/font-size\s*:\s*([\d.]+(?:rem|px))/g, (m, v) => { const p = px(v); if (p === null) return m; const s = T.step(p, isLabel); if (!s) return m; note("size", sel); return `font-size: ${T.TOKENS[s]}`; });
    if (on("leading")) b = b.replace(/line-height\s*:\s*(\d*\.?\d+)(?=\s*[;}!]|\s*$)/g, (m, v) => { const l = T.leading(parseFloat(v)); if (!l || l === v) return m; note("leading", sel); return `line-height: ${l}`; });
    if (on("track") && !isLabel && !display) b = b.replace(/\s*letter-spacing\s*:\s*(0?\.0[1-4]em|0?\.0[1-4]rem|0\.[1-6]px)\s*;?/g, m => { note("track", sel); return ";"; }).replace(/^;/, "");
    return b === body ? all : selRaw + "{" + b.replace(/;\s*;/g, ";") + "}";
  });
  if (!dry && t !== before) fs.writeFileSync(f, t);
}
console.log(`${dry ? "would change" : "changed"} ${n}:`, JSON.stringify(log));
