#!/usr/bin/env node
// Common Shade: adds NDMA's roof cooling guide for house owners to Cool by design (data/core/LEVERS.json). Its link did not open
// for the checker on GitHub; the terms were checked on the copy the owner supplied (roofguide-check.md). A repeat run stops.
//   node research/2026-11/heat-india-policy/apply-roofguide.js
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", "..", ".."), F = path.join(ROOT, "data", "core", "LEVERS.json");

// readable JSON: short arrays of plain values on one line, everything else indented
function ser(v, ind = "") {
  const next = ind + "  ";
  if (Array.isArray(v)) {
    if (!v.length) return "[]";
    if (v.every(x => x === null || typeof x !== "object")) { const one = JSON.stringify(v); if (one.length < 110) return one; }
    return "[\n" + v.map(x => next + ser(x, next)).join(",\n") + "\n" + ind + "]";
  }
  if (v && typeof v === "object") {
    const ks = Object.keys(v); if (!ks.length) return "{}";
    return "{\n" + ks.map(k => next + JSON.stringify(k) + ": " + ser(v[k], next)).join(",\n") + "\n" + ind + "}";
  }
  return JSON.stringify(v);
}
if (!fs.existsSync(path.join(__dirname, "roofguide-check.md"))) { console.error("Nothing written: roofguide-check.md is missing"); process.exit(1); }
const URL = "https://ndma.gov.in/sites/default/files/PDF/Guidelines/Cool-Roof-Handbook.pdf";
const G = { by: "National Disaster Management Authority, India, 2021", url: URL,
  title: "House Owners' Guide to Alternate Roof Cooling Solutions: the roof contributes up to 70% of a building's heat gain, and the guide sets out low-cost roof cooling for existing homes, from cool roof paint and green net shading to inverted earthen pots and mud phuska" };
const lev = JSON.parse(fs.readFileSync(F, "utf8")), v = lev.find(x => x.id === "coolbydesign");
if (!v) { console.error("Nothing written: no lever coolbydesign"); process.exit(1); }
if ((v.guides || []).some(g => g.url === URL)) { console.error("Nothing written: the guide is already listed"); process.exit(1); }
v.guides.push(G); fs.writeFileSync(F, ser(lev) + "\n");
console.log("added NDMA's roof cooling guide to Cool by design");
