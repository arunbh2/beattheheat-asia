// Common Shade: the type scale, shared by tools/normalise-type.js (which snaps existing styles to it) and
// tools/check-type.js (which fails on drift). Seven roles from the site's own tokens in styles.css (:root):
//   display   Anton capitals, fluid (--fs-display or a clamp)      page titles, homepage story heads
//   h2        Hanken bold 22px (--fs-22)                          section headings
//   h3        Hanken bold 18px (--fs-18)                          subheadings
//   body      Hanken 16px (--fs-16), line-height 1.55             running text
//   secondary Hanken 14px (--fs-14), line-height 1.5              meta, captions, card summaries
//   label     Hanken bold capitals 12px (--fs-12), --label-track  eyebrows, tags, evidence labels
//   editorial Newsreader 18-22px                                  ledes, quotes, pull lines (a reading voice, not headings)
// Nothing is smaller than 12px. Big numbers and display type above 28px (1.75rem) keep their own size.
"use strict";
const TOKENS = { 12: "var(--fs-12)", 14: "var(--fs-14)", 16: "var(--fs-16)", 18: "var(--fs-18)", 22: "var(--fs-22)", 28: "var(--fs-28)" };
// a font size in px -> the step it belongs to; label rules (uppercase) always take 12px
function step(px, isLabel) {
  if (isLabel && px <= 14) return 12;
  if (px < 12.5) return 12;            // the floor
  if (px < 15) return 14;              // 12.5-14.9: secondary (13px is not a step; rounding up keeps it readable)
  if (px < 17) return 16;              // 15-16.9: body
  if (px < 20.5) return 18;            // 17-20.4: subheading, lead
  if (px < 25) return 22;              // 20.5-24.9: section heading
  if (px <= 30) return 28;             // 25-30
  return null;                         // larger: display and big numbers keep their own size
}
// line-height (unitless) -> three values; below 1 is display type and stays
function leading(v) { if (v < 1) return null; if (v < 1.3) return "1.15"; if (v < 1.45) return "1.4"; return "1.55"; }
const FILES = ["styles.css", "growing/growing.css", "heat-tools/heat-tools.css", "social-protection/sp.css", "how-heat-became-visible/visibility.css", "heat-network/network.css"];
// never touched: the map and its drawn labels, the site menu, the pop-ups, print and films
const SKIP = /(^|[\s,.#>-])(svg|text|tspan|node|edge|map|zoom|key__|legend|tick|axis|chart|csn|csx|csp|invite|cs-tip|site-menu|visually-hidden|sr-only|ticker|brand|wordmark)\b|@font-face|^:root|^@/i;
const skip = sel => SKIP.test(sel);
// section headings (22px) and subheadings and card titles (18px) that were set in Anton or Newsreader, moved to Hanken
// bold by tools/heading-voice.js. The homepage's story heads and components keep Anton; page titles (h1) keep Anton.
const HEADINGS = {
  22: [".hub-h", ".lv-h", ".wk-h", ".wk-h--wide", ".fa-h2", ".ht-h2", ".pm__h", ".mx-h", ".sg-h2", ".sp-h2", ".tg-h", ".sof-h", ".join-h", ".he-start__h", ".sol-gh", ".he-shelf", ".cty-s h2", ".br-s h2", ".guide-sec h2", ".who-head h2", ".cool__h", ".atrisk__h", ".cool-value__h", ".refs__group h2", ".he-shelf--big"],
  18: [".md-h3", ".cty-s h3", ".cty-city h3", ".lv-card h3", ".rf-co h3", ".pl-ct h3", ".hap-doc__t", ".org__name", ".evm-q h3", ".sof-card h3", ".tg-outside h3", ".rf-side h3", ".rf-rib__s h3", ".bp-ct h3", ".he-role h3", ".sg-h", ".he-aud__card h3", ".he-seg h3", ".lc-reader h3", ".sol-pkg h3"]
};
module.exports = { TOKENS, step, leading, FILES, SKIP, skip, HEADINGS };
