#!/usr/bin/env node
// Common Shade: snaps hard-coded colours to the palette in tools/colour-rules.js, in place.
//   node tools/normalise-colours.js --near    retired near-duplicates -> the token they were meant to be
//   node tools/normalise-colours.js --exact   hard-coded copies of a token's exact value -> the token (no visible change)
// Inside a var() fallback the token's own value is written instead, so fallbacks agree with the tokens. Add --dry.
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), C = require("./colour-rules.js");
const a = process.argv.slice(2), dry = a.includes("--dry"), on = k => a.includes("--" + k);
let n = 0; const log = {};
for (const rel of C.FILES) {
  const f = path.join(ROOT, rel); let t = fs.readFileSync(f, "utf8"); const before = t;
  t = t.replace(/([^{}]{1,600})\{([^{}]{0,2500})\}/g, (all, selRaw, body) => {
    const sel = selRaw.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").trim();
    if (C.skip(sel)) return all;
    const b = body.replace(/(var\(--[\w-]+\s*,\s*)?(#[0-9a-fA-F]{6})\b/g, (m, fb, hex) => {
      const h = hex.toLowerCase(), tok = (on("near") && C.NEAR[h]) || (on("exact") && C.EXACT[h]); if (!tok) return m;
      log[on("near") && C.NEAR[h] ? "near" : "exact"] = (log[on("near") && C.NEAR[h] ? "near" : "exact"] || 0) + 1; n++;
      return fb ? fb + C.VALUE[tok] : `var(${tok})`;
    });
    return b === body ? all : selRaw + "{" + b + "}";
  });
  if (!dry && t !== before) fs.writeFileSync(f, t);
}
console.log(`${dry ? "would change" : "changed"} ${n}:`, JSON.stringify(log));
