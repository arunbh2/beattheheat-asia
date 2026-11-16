// Common Shade: every check a change runs, in order, as data. tools/check-all.js runs this list, `--list` prints it, and
// CLAUDE.md ("Every change", step 3) names only the runner, so the list lives in one place. A new tools/check-*.js file
// must be added here or to EXCLUDED with a reason, or check-all fails (so no check is silently never run).
//   name     short name for --only and the summary
//   cmd      the command, run from the repository root
//   server   needs the local server on port 8765 (check-all starts one if none answers)
//   slow     opens every page in a browser; left out by --fast
//   guards   what a failure means, in one line
"use strict";
const CHECKS = [
  { name: "voice", cmd: "node tools/check-voice.js", guards: "no instructing voice, no words that suggest wrongdoing, no em dashes, on every page" },
  { name: "data", cmd: "node tools/check-data.js", guards: "knowledge-base records keep their schema and sources" },
  { name: "build-data", cmd: "node tools/build-data.js --check", guards: "data.js matches data/core; no typed counts in the menu; homepage story rules" },
  { name: "hap", cmd: "node tools/check-hap-archive.js", guards: "the India heat action plan archive and its catalogue" },
  { name: "living-evidence", cmd: "node tools/living-evidence/check.js", guards: "the weekly evidence review's screen and records" },
  { name: "agent-files", cmd: "node tools/check-agent-files.js", guards: "the machine-readable files, Markdown twins and packs" },
  { name: "heat-tools", cmd: "node tools/check-heat-tools.js", guards: "the Heat Tool Finder's records, filters and pages" },
  { name: "heat-network", cmd: "node tools/check-heat-network.js", guards: "the heat network finder's facets and pages" },
  { name: "city-heat", cmd: "node tools/check-city-heat.js", guards: "the heat-stress formula, its copy and its checked source" },
  { name: "city-districts", cmd: "node tools/check-city-districts.js", guards: "the district picture and its geometry" },
  { name: "city-history", cmd: "node tools/check-city-history.js", guards: "heat over time: statistics and station rules" },
  { name: "signals", cmd: "node tools/check-signals.js", guards: "the Signals tracking model, cards and anchors" },
  { name: "signals-sync", cmd: "node tools/signals-sync.js --check", guards: "Signals' derived fields and check records are up to date" },
  { name: "sof", cmd: "node tools/check-sof.js", guards: "State of the field: edition rules, sealed ledger, drafts kept off the site" },
  { name: "media", cmd: "node tools/check-media.js", guards: "How heat is reported: unique records, quotes, links, downloads" },
  { name: "stripes", cmd: "node tools/check-stripes.js", guards: "no accent stripes outside the allowed list" },
  { name: "cards", cmd: "node tools/check-cards.js", guards: "the shared card scale" },
  { name: "type", cmd: "node tools/check-type.js", guards: "the type scale and the 12px floor" },
  { name: "colours", cmd: "node tools/check-colours.js", guards: "colour meanings and the link style" },
  { name: "weight", cmd: "node tools/check-weight.js", guards: "the speed and media budgets (record a deliberate change with --update, by hand)" },
  { name: "contrast", cmd: "node tools/check-contrast.js", server: true, slow: true, guards: "WCAG AA contrast on every rendered page" },
  { name: "targets", cmd: "node tools/check-targets.js", server: true, slow: true, guards: "WCAG 2.2 touch target size on every rendered page at 390px" },
  { name: "site", cmd: "node tools/check-site.js", slow: true, tracked: true, guards: "every tracked page loads at 375px and 1280px without errors or sideways scroll, and reflows at 320px with text at 200%" },
];
// check scripts that are deliberately not in the list, with the reason
const EXCLUDED = {
  "check-links.js": "needs the open internet; runs on GitHub (.github/workflows/check-links.yml)",
};
module.exports = { CHECKS, EXCLUDED };
