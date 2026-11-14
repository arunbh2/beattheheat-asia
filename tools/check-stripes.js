// Common Shade: fails on a new accent stripe, a thick coloured edge down one side of a card, note or tile, which reads
// as template filler. Use a hairline border all round, a light tint and a text label instead (tools/unstripe.js does it).
// Section rules, legend keys, connectors, states, quotes, pop-ups, print handouts and films are allowed: the list, with
// the reason for each, is in tools/stripe-rules.js.
//   node tools/check-stripes.js
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), { QUOTE, KEEP_FILES, keepReason } = require("./stripe-rules.js");
const SKIP_DIRS = /^(node_modules|\.git|media|research|data|packs|images|\.claude|\.agents)$/;
const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f), rel = path.relative(ROOT, p).split(path.sep).join("/"), s = fs.statSync(p);
    if (s.isDirectory()) { if (!SKIP_DIRS.test(f)) walk(p); continue; }
    if (/\.(css|js)$/.test(f) && rel !== "data.js" && !/\.min\.js$/.test(f) && !KEEP_FILES.some(k => rel.startsWith(k))) files.push(rel);
  }
})(ROOT);
const bad = [];
for (const rel of files) {
  const t = fs.readFileSync(path.join(ROOT, rel), "utf8");
  if (!/border-(left|right|top|bottom)/.test(t)) continue;
  for (const m of t.matchAll(/([^{}]{1,600})\{([^{}]{0,2000})\}/g)) {
    const sel = m[1].replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").trim();
    const hits = [...m[2].matchAll(/border-(left|right|top|bottom)(-width)?\s*:\s*(\d+(?:\.\d+)?)px(\s+(solid|dashed|dotted|double)\s*([^;}"'`]*))?/gi)]
      .filter(x => parseFloat(x[3]) >= 2 && !/transparent/i.test(x[6] || ""));
    if (!hits.length || keepReason(sel, rel)) continue;
    if (QUOTE.some(q => sel.includes(q)) && hits.every(x => parseFloat(x[3]) <= 2)) continue;   // quotes: a thin neutral rule
    bad.push(`${rel}:${t.slice(0, m.index + m[0].indexOf("{")).split("\n").length}  ${sel.slice(-70)}  ${hits[0][0].trim()}`);
  }
}
if (bad.length) {
  console.log(bad.map(b => "  FAIL " + b).join("\n"));
  console.log(`stripe check: ${bad.length} accent stripe(s). Use a hairline border all round, a light tint and a text label (node tools/unstripe.js <selector> does it), or, if the line is a section rule, legend key, connector or state, add it with its reason to tools/stripe-rules.js.`);
  process.exit(1);
}
console.log(`stripe check passed: ${files.length} stylesheets and scripts, no accent stripes outside the allowed list`);
