#!/usr/bin/env node
// Common Shade: one voice for section headings and subheadings (the owner's decision, November 2026). Section headings
// (h2) and subheadings and card titles (h3) are Hanken bold, 22px and 18px. Anton capitals stay for page titles and the
// homepage's story heads; Newsreader stays the reading voice for ledes and quotes. Rewrites, in place, the rules listed
// in tools/type-rules.js HEADINGS. Safe to run again.
//   node tools/heading-voice.js [--dry]
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), T = require("./type-rules.js"), dry = process.argv.includes("--dry");
const want = Object.entries(T.HEADINGS).flatMap(([size, sels]) => sels.map(s => [s, size]));
const ends = (sel, s) => sel.split(",").some(part => { const p = part.trim().replace(/\s+/g, " "); return p === s || p.endsWith(" " + s) || p.endsWith(">" + s) || p.endsWith("> " + s); });
let n = 0; const seen = new Set();
for (const rel of T.FILES) {
  const f = path.join(ROOT, rel); let t = fs.readFileSync(f, "utf8"); const before = t;
  t = t.replace(/([^{}]{1,600})\{([^{}]{0,2500})\}/g, (all, selRaw, body) => {
    const sel = selRaw.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").trim();
    const hit = want.find(([s]) => ends(sel, s)); if (!hit) return all;
    if (/:hover|:focus|::|:not\(/.test(sel)) return all;
    let b = body; const size = hit[1];
    
    if (/font-family\s*:/.test(b)) b = b.replace(/font-family\s*:\s*[^;}]+/g, "font-family: var(--font-body)"); else b = b.replace(/\s*;?\s*$/, "; font-family: var(--font-body) ");
    if (!/text-transform\s*:/.test(b)) b = b.replace(/\s*;?\s*$/, "; text-transform: none ");
    if (/font-weight\s*:/.test(b)) b = b.replace(/font-weight\s*:\s*[^;}]+/g, "font-weight: 700"); else b = b.replace(/\s*;?\s*$/, "; font-weight: 700 ");
    b = b.replace(/text-transform\s*:\s*uppercase/g, "text-transform: none");
    b = b.replace(/\s*letter-spacing\s*:\s*[^;}]+;?/g, ";");
    if (/font-size\s*:/.test(b)) b = b.replace(/font-size\s*:\s*(clamp\([^;}]*\)|[^;}]+)/, `font-size: var(--fs-${size})`); else b = b.replace(/\s*;?\s*$/, `; font-size: var(--fs-${size}) `);
    b = b.replace(/line-height\s*:\s*[^;}]+/g, "line-height: 1.15").replace(/;\s*;/g, ";").replace(/^\s*;/, " ");
    if (b !== body) { n++; seen.add(hit[0]); }
    return selRaw + "{" + b + "}";
  });
  if (!dry && t !== before) fs.writeFileSync(f, t);
}
console.log(`${dry ? "would change" : "changed"} ${n} rule(s); headings without a rule found: ${want.filter(([s]) => !seen.has(s)).map(x => x[0]).join(", ") || "none"}`);
