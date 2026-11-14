// Common Shade: the colour language, shared by tools/normalise-colours.js (which snaps existing styles to it) and
// tools/check-colours.js (which fails on drift). Every colour has one meaning:
//   ink, --grey-700, --grey-500   text, rules and hairlines (--line, --line-strong)
//   --orange                      brand and action: buttons, link underlines, highlights
//   --ember (+ -deep, -50)        heat and harm: what drives a cycle, limits
//   --break (+ -deep, -50)        a fix: what breaks a cycle, examples
//   --amber                       caution: "watch for", provisional
//   --ev-strong, --ev-mid, --ev-limited, --ev-guide   evidence strength, the same scale on every page (solutions,
//                                 the evidence map, briefs): strongest, moderate, limited, guidance or concept
// The map's own colours and legend, the live-heat warning bands, the pop-ups, print and films keep their own.
"use strict";
// exact token values: a hard-coded copy of one becomes the token
const EXACT = { "#16202b": "--ink", "#faf7f2": "--canvas", "#f26430": "--orange", "#b8401a": "--ember", "#8f3212": "--ember-deep", "#fbe9df": "--ember-50",
  "#17703a": "--break", "#0f5229": "--break-deep", "#e8f3eb": "--break-50", "#e6dfd4": "--line", "#c9c2b6": "--line-strong", "#39424d": "--grey-700",
  "#5e6570": "--grey-500", "#f5a623": "--amber", "#1f7a70": "--teal", "#2e6f95": "--blue", "#f7f0e6": "--sand-50", "#f2e7d9": "--sand-100", "#1d6e64": "--ev-teal" };
// near-duplicates: retired, each mapped to the token it was meant to be (darker where needed, so text keeps AA)
const NEAR = { "#1f6f4a": "--break", "#e8622c": "--orange", "#9a3a12": "--ember-deep", "#2f5d8a": "--blue", "#5b6670": "--grey-500", "#4a5560": "--grey-700",
  "#7a6f63": "--grey-500", "#6b737c": "--grey-500", "#3e4650": "--grey-700", "#ddd5c8": "--line", "#e2ddd5": "--line", "#ece6dc": "--line", "#e2ddd3": "--line", "#c9c2b8": "--line-strong" };
const VALUE = { "--ink": "#16202B", "--canvas": "#FAF7F2", "--orange": "#F26430", "--ember": "#B8401A", "--ember-deep": "#8F3212", "--ember-50": "#FBE9DF", "--break": "#17703A",
  "--break-deep": "#0F5229", "--break-50": "#E8F3EB", "--line": "#E6DFD4", "--line-strong": "#C9C2B6", "--grey-700": "#39424D", "--grey-500": "#5E6570", "--amber": "#F5A623",
  "--teal": "#1F7A70", "--blue": "#2E6F95", "--sand-50": "#F7F0E6", "--sand-100": "#F2E7D9", "--ev-teal": "#1D6E64" };
const FILES = ["styles.css", "growing/growing.css", "heat-tools/heat-tools.css", "social-protection/sp.css", "how-heat-became-visible/visibility.css", "heat-network/network.css"];
const SKIP = /(^|[\s,.#>-])(svg|node|edge|map|zoom|key__|legend|now-c|warn|wbgt|csn|csx|csp|invite|cs-tip|site-menu)\b|@font-face|^:root|^@/i;
const skip = sel => SKIP.test(sel) || sel.includes(":root");
module.exports = { EXACT, NEAR, VALUE, FILES, SKIP, skip };
