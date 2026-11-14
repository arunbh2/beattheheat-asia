// Common Shade: the shared scale for cards, notes, rows and panels, used by tools/normalise-cards.js (which snaps
// existing styles to it) and tools/check-cards.js (which fails on new values off the scale). Everything a box looks like
// comes from the site's own tokens in styles.css (:root): corners --r-sm 10px, --r-md 14px, --r-lg 22px and pills;
// fills white, --canvas and --sand-50 (plus the meaning tints); one hairline --line and a stronger --line-strong.
"use strict";
// corner radius in px -> token. Up to 4px is left alone (tags, bars, chart marks); 50% and 999px are circles and pills.
const RADIUS = { 5: "var(--r-sm)", 6: "var(--r-sm)", 7: "var(--r-sm)", 8: "var(--r-sm)", 9: "var(--r-sm)", 10: "var(--r-sm)", 11: "var(--r-sm)",
  12: "var(--r-md)", 13: "var(--r-md)", 14: "var(--r-md)", 15: "var(--r-md)", 16: "var(--r-md)", 17: "var(--r-md)", 18: "var(--r-md)",
  19: "var(--r-lg)", 20: "var(--r-lg)", 21: "var(--r-lg)", 22: "var(--r-lg)", 24: "var(--r-lg)", 26: "var(--r-lg)", 28: "var(--r-lg)" };
// near-identical off-whites and tints -> the token they were meant to be
const COLOUR = { "#fbf8f3": "var(--canvas)", "#fdf8f1": "var(--canvas)", "#f6f3ee": "var(--sand-50)", "#f3f8f4": "var(--break-50)", "#ece6dc": "var(--line)" };
// padding pairs -> the three steps
const PAD = { compact: "var(--pad-compact)", std: "var(--pad-std)", roomy: "var(--pad-roomy)" };
const PAD_MAP = { "10px 12px": "compact", "10px 14px": "compact", "12px 14px": "compact", "12px 16px": "compact", "14px 16px": "compact",
  "14px 18px": "std", "16px 16px": "std", "16px 18px": "std", "18px 18px": "std", "16px 20px": "std", "18px 16px": "std",
  "18px 20px": "roomy", "20px 22px": "roomy", "20px 24px": "roomy", "22px 24px": "roomy", "22px 22px": "roomy", "24px 24px": "roomy" };
// files in scope, and what is never touched: the pop-ups (the owner's rule), the site menu, print handouts and films
const FILES = ["styles.css", "growing/growing.css", "heat-tools/heat-tools.css", "social-protection/sp.css", "how-heat-became-visible/visibility.css", "heat-network/network.css"];
const SKIP_SEL = [".invite", ".csx", ".csp", ".csn", ".cs-tip", ".site-menu", "@font-face"];
const skip = sel => SKIP_SEL.some(s => sel.includes(s)) || sel.includes(":root");
// things that float over the page or draw a real object keep their shadow: map controls and pins, the phone mock-up
const KEEP_SHADOW = [".zoom", ".mx-pin", ".pl-sms__phone", ".sol-bar", ".ht-bar"];
module.exports = { RADIUS, COLOUR, PAD, PAD_MAP, FILES, SKIP_SEL, KEEP_SHADOW, skip };
