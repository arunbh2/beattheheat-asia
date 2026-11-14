// Common Shade: keeps cards, notes, rows and panels on the shared scale (tools/card-rules.js). Fails, naming the file,
// line and selector, on a corner radius off the scale (use var(--r-sm), var(--r-md), var(--r-lg), a pill or a circle;
// up to 4px is fine for tags and marks), on one of the retired near-identical off-whites, and on a drop shadow on a card
// that does not float. The pop-ups, the site menu, print handouts and films are out of scope.
//   node tools/check-cards.js
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), R = require("./card-rules.js");
const bad = [];
for (const rel of R.FILES) {
  const t = fs.readFileSync(path.join(ROOT, rel), "utf8");
  for (const m of t.matchAll(/([^{}]{1,600})\{([^{}]{0,2500})\}/g)) {
    const sel = m[1].replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").trim(), body = m[2];
    if (R.skip(sel) || /^@|^:root/.test(sel)) continue;
    const at = `${rel}:${t.slice(0, m.index).split("\n").length + (m[1].match(/\n/g) || []).length}  ${sel.slice(-60)}`;
    for (const r of body.matchAll(/border-radius\s*:\s*([^;}]+)/g)) {
      const off = r[1].trim().split(/\s+/).filter(p => /^\d+(\.\d+)?px$/.test(p) && parseFloat(p) > 4 && parseFloat(p) < 999);
      if (off.length) bad.push(`${at}  border-radius ${r[1].trim()}: use var(--r-sm), var(--r-md) or var(--r-lg)`);
    }
    for (const h of body.match(/#[0-9a-fA-F]{6}\b/g) || []) if (R.COLOUR[h.toLowerCase()]) bad.push(`${at}  ${h}: use ${R.COLOUR[h.toLowerCase()]}`);
    const floats = /position\s*:\s*(fixed|sticky)/.test(body) || /:hover|:focus|is-open|is-on|\[open\]|dialog|popover|::backdrop|tooltip|tip\b|bar\b|-bar|__bar/.test(sel) || R.KEEP_SHADOW.some(k => sel.includes(k));
    if (!floats && /box-shadow\s*:\s*var\(--shadow-[12]\)/.test(body)) bad.push(`${at}  drop shadow on a card that does not float: cards are flat; use the hairline`);
  }
}
if (bad.length) { console.log(bad.map(b => "  FAIL " + b).join("\n")); console.log(`card check: ${bad.length} value(s) off the shared scale. node tools/normalise-cards.js --radius --colours --shadows snaps them; the scale is in tools/card-rules.js.`); process.exit(1); }
console.log(`card check passed: ${R.FILES.length} stylesheets keep to the shared corners, surfaces and flat cards`);
