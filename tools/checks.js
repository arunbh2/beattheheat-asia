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
  { name: "enso", cmd: "node tools/check-enso.js", guards: "the El Niño pages: one outlook record, the same status sentences on every page, forecast periods, probabilities, anchors and the tools route" },
  { name: "nav-coverage", cmd: "node tools/check-nav-coverage.js", guards: "every top-level page is in the menu or footer, every menu link exists, and each section lists its further pages under More in" },
  { name: "market-heat", cmd: "node tools/check-market-heat.js", guards: "Heat in markets: every card carries the fields Compare and Shortlist read, only confirmed claims, its own shortlist key, the worksheet and the llms-full.txt twin" },
  { name: "equity", cmd: "node tools/check-equity.js", guards: "Health and equity: the shared taxonomy, solutions labels (includes / names it / not assessed), the heat plan provision review, reach panels on funding and Signals, the four health and equity pages and kept anchors" },
  { name: "wet-bulb", cmd: "node tools/check-wet-bulb.js", guards: "The wet-bulb wall: the calculation against CoolProp, its physics, the weather adapter on synthetic records, page wording and its sources" },
  { name: "heat-futures", cmd: "node tools/check-heat-futures.js", guards: "Heat futures: projected data and its re-read, the protection model, climate and protection kept apart, shared links, wording and sources" },
  { name: "brand", cmd: "node tools/check-brand.js", guards: "Brand & Media (/brand/): logo files match the logo's code, the logo pack holds only them, every film and file linked exists, copy links are public, the official channels appear once in every footer" },
  { name: "share", cmd: "node tools/check-share.js", guards: "Share this page: WhatsApp and LinkedIn links and their encoding, one page-specific set of social tags on every page, share messages, the systems-map preview image" },
  { name: "funding", cmd: "node tools/check-funding.js", guards: "funding landscape, open calls and careers: status and freshness rules, matching, CSV safety, data and pages" },
  { name: "signals-sync", cmd: "node tools/signals-sync.js --check", guards: "Signals' derived fields and check records are up to date" },
  { name: "sof", cmd: "node tools/check-sof.js", guards: "State of the field: edition rules, sealed ledger, drafts kept off the site" },
  { name: "media", cmd: "node tools/check-media.js", guards: "How heat is reported: unique records, quotes, links, downloads" },
  { name: "heat-assembly", cmd: "node tools/check-heat-assembly.js", guards: "The Heat Assembly: budget, staff and consent rules, delayed effects, replay, the lesson's design guards, words and sources" },
  { name: "stripes", cmd: "node tools/check-stripes.js", guards: "no accent stripes outside the allowed list" },
  { name: "cards", cmd: "node tools/check-cards.js", guards: "the shared card scale" },
  { name: "type", cmd: "node tools/check-type.js", guards: "the type scale and the 12px floor" },
  { name: "colours", cmd: "node tools/check-colours.js", guards: "colour meanings and the link style" },
  { name: "weight", cmd: "node tools/check-weight.js", guards: "the speed and media budgets (record a deliberate change with --update, by hand)" },
  { name: "plan-file", cmd: "node tools/check-plan-file.js", server: true, slow: true, guards: "/plan/ saves the whole plan to a file and opens it back unchanged; a stranger's file is refused" },
  { name: "contrast", cmd: "node tools/check-contrast.js", server: true, slow: true, guards: "WCAG AA contrast on every rendered page" },
  { name: "targets", cmd: "node tools/check-targets.js", server: true, slow: true, guards: "WCAG 2.2 touch target size on every rendered page at 390px" },
  { name: "equity-ui", cmd: "node tools/check-equity-ui.js", server: true, slow: true, guards: "health and equity features in a browser: solutions equity filter and reset, plan equity check persistence, plan review filter and comparison, tabs by keyboard, worker comparison, 360px" },
  { name: "interactives-ui", cmd: "node tools/check-interactives-ui.js", server: true, slow: true, guards: "the wet-bulb wall and heat futures in a browser: controls, keyboard, synthetic city weather and its failure states, links, export and print" },
  { name: "share-ui", cmd: "node tools/check-share-ui.js", server: true, slow: true, guards: "the share panel in a browser: message, links, copying when allowed and refused, cancelling, keyboard, sections, printable sheets, 360 and 390px" },
  { name: "site", cmd: "node tools/check-site.js", slow: true, tracked: true, guards: "every tracked page loads at 375px and 1280px without errors or sideways scroll, and reflows at 320px with text at 200%" },
];
// check scripts that are deliberately not in the list, with the reason
const EXCLUDED = {
  "check-links.js": "needs the open internet; runs on GitHub (.github/workflows/check-links.yml)",
};
module.exports = { CHECKS, EXCLUDED };
