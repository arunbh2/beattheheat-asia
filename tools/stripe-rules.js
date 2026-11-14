// Common Shade: which one-sided borders are allowed, and why. Shared by tools/unstripe.js (which leaves these alone)
// and tools/check-stripes.js (which fails on any other). A selector is kept when it contains one of the parts below.
// Everything else that draws a thick coloured edge down one side of a card, note or tile is an accent stripe: the site
// uses a hairline border all round, a light tint and a text label instead.
"use strict";
const KEEP = [
  // section rules: the thin dark line above a section, part of the site's editorial style (the owner's decision)
  ["rule", [".stats", ".toolbar", ".panel__h", ".lgroup__h", ".web-list", "=.site-footer", ".refs__group h2", ".fin-table", ".fa-when", ".sg-h3", ".cool-trap", ".atrisk__barriers li", ".traits li", ".method__grid", ".sg-step__l"]],
  ["heading rule", ["h2"]],
  // drawings: legend samples, timeline and step connectors, progress tracks, icons
  ["legend or drawing", [".key__line", ".wk-key", ".conn__type", ".gw-ico", ".gw-key", ".wayin__stop", ".jn-steps", ".rf-rib", ".sg-track", ".hv-list"]],
  // states that tell a reader where they are or what is chosen
  ["state", [".header-nav", ".is-also", ".site-menu", ".csn__gb", ".bp-card.is-on", ".csn-d__res", ".csn__links", ":focus", "[aria-current", ":target"]],
  // the pop-ups are not touched (the owner's standing rule)
  ["pop-up", [".csx__g", ".csp", ".csx", ".invite"]]
];
const QUOTE = [".he-quote", ".cite-box", ".fa-relay blockquote", ".gw-finding", ".hv-q", "blockquote"];
// whole files that are out of scope: printed handouts keep side markers (they survive black-and-white printing), films
// draw their own frames, and the pop-up scripts are not touched
const KEEP_FILES = ["tools/build-print.js", "tools/explainers/", "tools/shorts/", "tools/films/", "tools/launch/", "tools/mapguide/", "everything.js", "tools/build-everything.js", "heatweek.js", "together.js", "tools/build-static.js"];
function keepReason(sel, file) {
  if (KEEP_FILES.some(k => (file || "").startsWith(k))) return "file out of scope";
  const s = sel.replace(/\/\*[\s\S]*?\*\//g, " ").trim();
  for (const [why, parts] of KEEP) for (const p of parts) {
    if (p === "h2" ? /(^|[\s,>])h2\s*$/.test(s) : p[0] === "=" ? s === p.slice(1) : s.includes(p)) return why;
  }
  return "";
}
module.exports = { KEEP, QUOTE, KEEP_FILES, keepReason };
