// Common Shade Reels: vertical films (1080 × 1920) for social channels. Each scene has its narration ("|" splits it into
// beats that cue the headline and captions), a headline per beat, an optional source line, and a drawing (scene.js).
// Every fact is listed with its source in SCRIPT.md and comes from a record the site already cites.
"use strict";
const DEBT_REST = [
  { art: "vendor", say: "A street vendor can't stop to rest. | Stopping means losing the day's sales.",
    head: ["", "Stopping costs today's income"],
    src: "In a 2024 survey of 721 Delhi street vendors, 49% lost income in heatwaves. Greenpeace India and National Hawkers Federation" },
  { art: "ill", say: "Then the heat makes him ill. | Days of work are lost, and treatment costs money.",
    head: ["", "Illness takes more days"],
    src: "Heat harmed health and cut incomes and working hours across five cities in Nepal and Bangladesh. Red Cross and Red Crescent, 2026" },
  { art: "loan", say: "A loan fills the gap. | Now, on the next hot day, rest costs even more.",
    head: ["", "Now rest costs even more"],
    src: "Heat pushed some households towards high-interest loans. Red Cross and Red Crescent, 2026" },
  { art: "cycle", say: "Heat, lost income, debt, no rest. | Shade, paid rest and income support could make rest possible, if they reach people in time.",
    head: ["A cycle that feeds itself", "Protection can make rest possible"],
    src: "The evidence on this cycle is still emerging. Heat income insurance has been piloted with women informal workers in India (ICMIF, 2024)" },
  { art: "close", say: "See what could break the cycle. | Beat the heat dot Asia.",
    head: ["See what could break the cycle", "See what could break the cycle"], url: "beattheheat.asia" },
];
const OPEN = {
  a: { art: "bill", say: "The heatwave ends. | The debt doesn't.", head: ["The heatwave ends.", "The debt doesn't."], big: true },
  b: { art: "why", say: "Why can't this worker just take a break?", head: ["Why can't this worker just take a break?"], big: true },
  c: { art: "week", say: "One hot week. | How long does it take to pay back?", head: ["One hot week.", "How long does it take to pay back?"], big: true },
};
const REELS = {
  "reel-debt": { title: "The heatwave ends. The debt doesn't.", scenes: [OPEN.a, ...DEBT_REST] },
  "reel-debt-why": { title: "Why can't this worker just take a break?", scenes: [OPEN.b, ...DEBT_REST] },
  "reel-debt-week": { title: "One hot week. How long does it take to pay back?", scenes: [OPEN.c, ...DEBT_REST] },
  "reel-cooling": { title: "You built a cooling centre. Can she use it?", scenes: [
    { art: "centre", say: "You built a cooling centre. | Can she use it?", head: ["You built a cooling centre.", "Can she use it?"], big: true },
    { art: "night", say: "It's open in the day. | But her home stays hottest at night.", head: ["Open in the day.", "Her home is hottest at night."],
      src: "Older people's homes in a Kolkata informal settlement stayed hotter than outdoors, especially at night. Weitz and others, 2022" },
    { art: "walk", say: "It's close. | But she can't walk that far in the heat.", head: ["It's close.", "Too far to walk in the heat."],
      src: "Living alone and limited mobility keep many older people from help. Common Shade, who is at risk" },
    { art: "phone", say: "An alert went out. | But she has no phone.", head: ["An alert went out.", "She has no phone."],
      src: "Warnings that rely on phones and apps can miss older people. Common Shade, who is at risk" },
    { art: "ride", say: "A ride there, | and a neighbour who checks in, | can make it reachable.", head: ["A ride there.", "A knock on the door.", "Now it is within reach."],
      src: "How much cooling centres protect depends on who can reach them. A 2025 review found no study yet that measured health outcomes for users. UKHSA" },
    { art: "ask", say: "Who can use the protection you planned? | Try the exercise at beat the heat dot Asia.",
      head: ["Who can actually use it?", "Who can actually use it?"], url: "beattheheat.asia/intersections" },
  ] },
};
module.exports = REELS;
