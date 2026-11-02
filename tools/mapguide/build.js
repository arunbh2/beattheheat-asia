#!/usr/bin/env node
// Writes the words of the map guide film (tools/mapguide/map-guide.narration.json) with every count read from the
// map's data, so the film never says a typed number. Each scene is one line; "|" splits it into beats, and each beat
// is one caption. The voice reads "beat the heat dot Asia"; the captions show the address as written.
//   node tools/mapguide/build.js
"use strict";
const fs = require("fs"), path = require("path");
const core = f => JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "data", "core", f + ".json"), "utf8"));
const n = { harms: core("CONSEQUENCES").length, systems: core("SYSTEMS").length, loops: core("LOOPS").length, levers: core("LEVERS").length };
const words = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
const say = x => words[x] || String(x);

const scenes = [
  "One heatwave never causes just one problem. | It sets off a chain.",
  `This is the Common Shade map. | Extreme heat sits in the centre. | Around it, ${say(n.systems)} systems, from water and food to health and work. | Each dot is a harm, ${n.harms} in all, each with its sources.`,
  "Tap a dot, such as power cuts. | The map lights up what feeds it, | and what it sets in motion.",
  "Each harm opens a card: what happens, the evidence behind it, | and the cycles it is caught in.",
  "Some links curve back on themselves. These are vicious cycles. | Cooling demand heats the city, | and a hotter city needs even more cooling.",
  "The green marks are levers: actions that can cut a link. | Each one shows who can act, how soon it works, and where it has been tried.",
  `Switch on a package of actions, and see which of the ${n.loops} cycles it could help interrupt. | It is a guide for thinking, not a forecast: real effects depend on reach and quality.`,
  "Start with the harm you see. | Follow the lines. | Find the lever within reach. | Explore the map at beat the heat dot Asia.",
];
const out = {
  voice: { model: "en-us-libritts-high", speaker: 599, length_scale: 1, licence: "LibriTTS (CC BY 4.0), via the Piper voice en-us-libritts-high" },
  counts: n,
  scenes,
  captions: scenes.map(s => s.split("|").map(b => b.trim().replace("beat the heat dot Asia", "beattheheat.asia"))),
};
fs.writeFileSync(path.join(__dirname, "map-guide.narration.json"), JSON.stringify(out, null, 1) + "\n");
console.log("map guide words:", scenes.length, "scenes,", scenes.join(" ").split(/\s+/).length, "words; counts", JSON.stringify(n));
