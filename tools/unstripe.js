#!/usr/bin/env node
// Common Shade: replaces one-sided accent stripes (a thick coloured border down one edge of a card, note or tile) with
// the site's quieter pattern: a hairline border all round in a soft version of the same colour and, for notes, a light
// tint of it behind the text. The colour keeps its meaning (green example, amber caution, ember limit) without the bar.
// Quotes keep a thin neutral rule. Section rules, map legend samples, connectors, menu and selection states, print
// handouts, films and the pop-ups are never touched: see KEEP below and tools/check-stripes.js, which uses the same list.
//   node tools/unstripe.js --dry <selector-part> ...   list what would change
//   node tools/unstripe.js <selector-part> ...         change only rules whose selector contains one of these
//   node tools/unstripe.js --rest                      change every remaining stripe outside KEEP
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const FILES = ["styles.css", "growing/growing.css", "heat-tools/heat-tools.css", "how-heat-became-visible/visibility.css", "social-protection/sp.css", "script.js", "tools/site-nav.js"];
const { KEEP, QUOTE, keepReason } = require("./stripe-rules.js");
const args = process.argv.slice(2), dry = args.includes("--dry"), rest = args.includes("--rest"), want = args.filter(a => !a.startsWith("--"));
const SIDE = /border-(left|right|top|bottom)\s*:\s*(\d+(?:\.\d+)?)px\s+solid\s+([^;}"'`]+?)\s*(?=;|}|$)/gi;
const WIDTH = /border-(left|right|top|bottom)-width\s*:\s*(\d+(?:\.\d+)?)px/gi;
let changed = 0; const log = [], files = {};
for (const rel of FILES) {
  const f = path.join(ROOT, rel); let t = fs.readFileSync(f, "utf8"); const before = t;
  t = t.replace(/([^{}]{1,600})\{([^{}]{0,2000})\}/g, (all, selRaw, body) => {
    const sel = selRaw.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").trim();
    const stripes = [...body.matchAll(SIDE)].filter(m => parseFloat(m[2]) >= 2 && !/transparent/i.test(m[3]));
    const widths = [...body.matchAll(WIDTH)].filter(m => parseFloat(m[2]) >= 2);
    if (!stripes.length && !widths.length) return all;
    if (keepReason(sel, rel)) return all;
    const isQuote = QUOTE.some(q => sel.includes(q));
    if (!rest && !want.some(w => sel.includes(w))) return all;
    let b = body;
    if (isQuote) {   // quotes: a thin neutral rule, the convention readers know
      stripes.forEach(m => { b = b.replace(m[0], `border-${m[1]}: 2px solid #C9BFB1`); });
      log.push(`${rel}  ${sel.slice(-70)}  quote rule made neutral`); changed++; return selRaw + "{" + b + "}";
    }
    const m = stripes[0], col = m ? m[3].trim() : "var(--line)", side = m ? m[1] : widths[0][1];
    stripes.forEach(x => { b = b.replace(new RegExp("\\s*" + x[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*;?"), ""); });
    widths.forEach(x => { b = b.replace(x[0], `border-${x[1]}-width: 1px`); });
    const minified = !/\n/.test(body) && !/; /.test(body);   // keep each file's own style
    const sep = minified ? ";" : "; ", add = [];
    const hasFull = /(^|[;{\s])border\s*:/.test(b), hasBg = /(^|[;{\s])background(-color)?\s*:/.test(b);
    if (!hasFull) add.push(`border:1px solid var(--line,#E6DFD4)`, `border-color:color-mix(in srgb,${col} 34%,var(--line,#E6DFD4))`);
    if (!hasBg && (side === "left" || side === "right")) add.push(`background:color-mix(in srgb,${col} 7%,transparent)`);
    if (side === "left" || side === "right") {
      if (!/(^|[;{\s])padding\s*:/.test(b)) { b = b.replace(/\s*padding-(left|right)\s*:\s*[^;}]+;?/g, ""); add.push("padding:10px 14px"); }
      else b = b.replace(/padding\s*:\s*([^;}]+)/, (p, v) => /(^|\s)0(px)?(\s|$)/.test(v.trim()) ? "padding:10px 14px" : p);
    }
    if (!/border-radius\s*:/.test(b)) add.push("border-radius:var(--r-sm,10px)");
    else b = b.replace(/border-radius\s*:\s*0\s+([^\s;]+)\s+\1\s+0(?=\s*(;|$))/, "border-radius:$1").replace(/border-radius\s*:\s*([^\s;]+)\s+0\s+0\s+\1(?=\s*(;|$))/, "border-radius:$1");
    b = b.replace(/\s*;\s*$/, "").replace(/^\s*/, minified ? "" : " ");
    const out = (b.trim() ? b.replace(/\s*$/, "") + sep : (minified ? "" : " ")) + add.join(sep) + (minified ? "" : "; ");
    log.push(`${rel}  ${sel.slice(-70)}  ${side} ${m ? m[2] + "px " + col : "width"} -> hairline${!hasBg && (side === "left" || side === "right") ? " + tint" : ""}`); changed++;
    return selRaw + "{" + out.replace(/;\s*;/g, ";").replace(/; $/, minified ? "" : "; ") + (minified ? "" : "") + "}";
  });
  if (!dry && t !== before) fs.writeFileSync(f, t);
  files[rel] = dry ? before : t;
}
// pass 2: variants that recolour one side of a changed card (a type colour, an empty state, a hover) recolour the whole
// hairline instead, so no one-sided coloured edge is left behind
const bases = new Set([...log.map(l => ((l.split("  ")[1] || "").match(/\.[a-z][\w-]*/i) || [])[0]).filter(Boolean), ...want.map(w => (w.match(/^\.[a-z][\w-]*/i) || [])[0]).filter(Boolean)]);
for (const rel of FILES) {
  const f = path.join(ROOT, rel); let t = dry ? files[rel] : fs.readFileSync(f, "utf8"); const before = t;
  t = t.replace(/([^{}]{1,600})\{([^{}]{0,2000})\}/g, (all, selRaw, body) => {
    const sel = selRaw.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").trim();
    if (keepReason(sel, rel) || ![...bases].some(c => new RegExp(c.replace(".", "\\.") + "(--[\\w-]+)?(?![\\w-])").test(sel))) return all;
    if (!/border-(left|right|top|bottom)-color\s*:/.test(body)) return all;
    const nb = body.replace(/border-(left|right|top|bottom)-color\s*:\s*([^;}]+)/g, (m, side, c) => /:hover|:focus/.test(sel) ? `border-color:${c.trim()}` : `border-color:color-mix(in srgb,${c.trim()} 34%,var(--line,#E6DFD4))`);
    if (nb !== body) { log.push(`${rel}  ${sel.slice(-70)}  variant recoloured all round`); changed++; }
    return selRaw + "{" + nb + "}";
  });
  if (!dry && t !== before) fs.writeFileSync(f, t);
}
console.log(log.join("\n")); console.log(`${dry ? "would change" : "changed"} ${changed} rule(s)`);
