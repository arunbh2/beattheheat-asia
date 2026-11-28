#!/usr/bin/env node
// Common Shade: the guides by setting (one place each, in depth: factories, markets, cotton, and those to come).
// One list, read by every page that points to them, so each new setting guide appears everywhere at once:
//   - Plan a response, step 2 (hand-written plan/index.html, between <!--sg:plan--> markers)
//   - Practical actions, interactive (practical/index.html, between <!--sg:practical--> markers) and as text
//   - the Act hub ("Guides by setting", taken out of "Also in Act" so no card shows twice)
//   - the Evidence map ("Gaps by setting", each guide's own "what is not known" section)
// Titles and descriptions come from data/site/nav.json, so the menu and these links never differ.
// tools/check-setting-guides.js confirms each guide is linked from all of these, and that its anchors exist.
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");

// short: the setting in a few words; lib and gaps: anchors on the guide's own page
const GUIDES = [
  { url: "/factory-heat/", short: "Factories", lib: "#library", gaps: "#gaps" },
  { url: "/market-heat/", short: "Markets and street vending", lib: "#library", gaps: "#gaps" },
  { url: "/cotton-and-heat/", short: "Cotton, from field to gin", lib: "#protections", gaps: "#evidence" },
];

const NAV = () => JSON.parse(fs.readFileSync(path.join(ROOT, "data/site/nav.json"), "utf8"));
function list() {
  const items = NAV().groups.flatMap(g => g.items);
  return GUIDES.map(x => {
    const it = items.find(i => i[0] === x.url);
    if (!it) throw new Error(`tools/setting-guides.js: ${x.url} is not in data/site/nav.json. Add it to the menu first.`);
    return { ...x, title: it[1], desc: it[2] };
  });
}
const URLS = GUIDES.map(x => x.url);
const H = { plan: "Guides by setting", gaps: "Gaps by setting" };

const links = (esc, href) => list().map(g => `<a href="${href(g)}">${esc(g.short)}</a>`).join(" · ");
// the line on Plan a response and on Practical actions
const line = (esc, lead) => `${esc(lead)}: ${links(esc, g => g.url)}.`;
// the Evidence map: each guide's own gaps section
const gapsPara = esc => `<p class="hub-p"><b>${H.gaps}.</b> Each guide to one setting states plainly what is not known there, measure by measure: ${links(esc, g => g.url + g.gaps)}.</p>`;
const lineText = (SITE, lead) => `${lead}: ${list().map(g => `${g.title} (${SITE}${g.url})`).join("; ")}.`;

// fill the hand-written pages between their markers
const BLOCKS = esc => ({
  "plan/index.html": { plan: ` ${line(esc, "In depth, " + H.plan.toLowerCase())}` },
  "practical/index.html": { practical: `<p class="pa-start__alt">${line(esc, "Or go deeper into one place, with a plan and a library of measures")}</p>` },
});
function fill(esc) {
  Object.entries(BLOCKS(esc)).forEach(([f, keys]) => {
    const file = path.join(ROOT, f), html = fs.readFileSync(file, "utf8");
    let out = html;
    Object.entries(keys).forEach(([k, block]) => {
      const re = new RegExp(`<!--sg:${k}-->[\\s\\S]*?<!--/sg:${k}-->`);
      if (!re.test(out)) throw new Error(`${f}: no <!--sg:${k}--> ... <!--/sg:${k}--> markers for the guides by setting (tools/setting-guides.js)`);
      out = out.replace(re, `<!--sg:${k}-->${block}<!--/sg:${k}-->`);
    });
    if (out !== html) fs.writeFileSync(file, out);
  });
}

module.exports = { GUIDES, URLS, H, list, line, gapsPara, lineText, fill };
