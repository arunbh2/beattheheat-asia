#!/usr/bin/env node
// Common Shade: snaps existing card, note, row and panel styles to the shared scale in tools/card-rules.js, in place,
// so every class keeps its name and no page builder changes. Run one step at a time and look at the pages after each:
//   node tools/normalise-cards.js --radius     corner radii to --r-sm, --r-md, --r-lg
//   node tools/normalise-cards.js --colours    near-identical off-whites and the near-twin hairline to their tokens
//   node tools/normalise-cards.js --shadows    static cards flat; shadows stay on what floats (fixed, sticky) and on hover
//   node tools/normalise-cards.js --padding    box padding to the three steps
// Add --dry to list the changes without writing.
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), R = require("./card-rules.js");
const a = process.argv.slice(2), dry = a.includes("--dry"), step = k => a.includes("--" + k);
let n = 0; const log = {};
const note = (k, s) => { log[k] = (log[k] || 0) + 1; n++; if (a.includes("--verbose")) console.log(k, s); };
for (const rel of R.FILES) {
  const f = path.join(ROOT, rel); let t = fs.readFileSync(f, "utf8"); const before = t;
  t = t.replace(/([^{}]{1,600})\{([^{}]{0,2500})\}/g, (all, selRaw, body) => {
    const sel = selRaw.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").trim();
    if (R.skip(sel) || /^@|^:root/.test(sel)) return all;
    let b = body;
    const isBox = /(^|[;{\s])(border\s*:|background(-color)?\s*:|box-shadow\s*:)/.test(b);
    if (step("radius")) b = b.replace(/border-radius\s*:\s*([^;}]+)/g, (m, v) => {
      const parts = v.trim().split(/\s+/); if (parts.some(p => !/^(\d+(\.\d+)?px|0)$/.test(p))) return m;
      const mapped = parts.map(p => { const px = parseFloat(p); return px <= 4 ? p : R.RADIUS[Math.round(px)] || p; });
      if (mapped.join(" ") === parts.join(" ")) return m;
      note("radius", sel); return m.replace(v.trim(), mapped.length === 1 || new Set(mapped).size === 1 && mapped.every(x => x === mapped[0]) ? mapped[0] : mapped.join(" "));
    });
    if (step("colours")) b = b.replace(/#[0-9a-fA-F]{6}\b/g, h => { const to = R.COLOUR[h.toLowerCase()]; if (!to) return h; note("colour", sel); return to; });
    if (step("shadows")) {
      const floats = /position\s*:\s*(fixed|sticky)/.test(b) || /:hover|:focus|is-open|is-on|\[open\]|dialog|popover|::backdrop|tooltip|tip\b|bar\b|-bar|__bar/.test(sel);
      if (!floats) b = b.replace(/box-shadow\s*:\s*var\(--shadow-[12]\)/g, m => { note("shadow", sel); return "box-shadow: none"; });
    }
    if (step("padding") && isBox) b = b.replace(/(^|[;{\s])padding\s*:\s*([^;}]+)/, (m, pre, v) => {
      const k = R.PAD_MAP[v.trim()]; if (!k) return m; note("padding", sel); return `${pre}padding: ${R.PAD[k]}`;
    });
    return b === body ? all : selRaw + "{" + b + "}";
  });
  if (!dry && t !== before) fs.writeFileSync(f, t);
}
console.log(`${dry ? "would change" : "changed"} ${n}:`, JSON.stringify(log));
