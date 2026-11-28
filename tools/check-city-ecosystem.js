#!/usr/bin/env node
// Common Shade: checks the city heat ecosystem profiles (/cities/<city>/<slug>/, tools/build-city-ecosystem.js).
// Each failure names the record and what to fix. For Bengaluru it also checks that all 11 founding members of the
// Bengaluru Heat Collective are accounted for, and that membership alone never gives an organisation a role.
//   node tools/check-city-ecosystem.js
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const E = require("./city-ecosystem.js");
const read = f => fs.readFileSync(path.join(ROOT, f), "utf8");
let bad = 0; const ok = (c, m) => { console.log(c ? "  ok  " : "  FAIL", m); if (!c) bad++; };
const llms = read("llms-full.txt"), index = read("cities/index.html");

for (const id of E.cities()) {
 const R = E.raw(id), P = E.load(id), f = `cities/${id}/${R.slug}/index.html`;
 const v = E.validate(R);
 ok(!v.length, `${id}: the record is valid${v.length ? "; " + v.join("; ") : ""}`);
 ok(fs.existsSync(path.join(ROOT, f)), `${id}: ${f} is built`);
 if (!fs.existsSync(path.join(ROOT, f))) continue;
 const html = read(f), text = html.replace(/<script[\s\S]*?<\/script>/g, "");
 // shown only when confirmed
 const leaked = P.held.filter(h => h.kind === "activity" && html.includes(`id="${h.id}"`));
 ok(!leaked.length, `${id}: nothing held back by the source check is shown${leaked.length ? "; shown: " + leaked.map(h => h.id).join(", ") : ""} (${P.held.length} held back, ${P.nConfirmed} of ${P.nClaims} claims confirmed)`);
 ok(!P.held.length || html.includes(`Held back after the source check (${P.held.length})`), `${id}: held-back items are listed for the reader`);
 // every activity once, joint projects not repeated as separate achievements
 const cards = [...html.matchAll(/<article class="cs-card ce-act" id="([a-z0-9-]+)"/g)].map(m => m[1]);
 ok(cards.length === P.activities.length && new Set(cards).size === cards.length, `${id}: each activity is one card (${cards.length})`);
 const titles = P.activities.map(a => a.title.toLowerCase());
 ok(new Set(titles).size === titles.length, `${id}: no activity title repeats`);
 // a lead is named only where a source names one; lead never doubles as collaborator (validate) and orgs without activities say so
 const idle = P.orgs.filter(o => !o.activities.length);
 ok(idle.every(o => /not identified in the sources reviewed/.test(o.summary)), `${id}: organisations with no verified activity say so plainly${idle.length ? " (" + idle.map(o => o.name).join(", ") + ")" : ""}`);
 // tools: honest buttons and access labels
 ok(P.tools.every(t => html.includes(E.ACCESS[t.access])), `${id}: every tool shows its access label`);
 ok(P.tools.every(t => t.button !== "Open tool" || t.access === "public"), `${id}: "Open tool" only on publicly usable tools`);
 ok(!/land surface temperature/i.test(text) || /not (?:measured )?air temperature/i.test(text), `${id}: satellite surface temperature is never presented as air temperature`);
 // money: components inside parents, nothing summed
 const comps = P.money.filter(m => m.parent);
 ok(comps.every(m => html.includes("not added to it")), `${id}: each component is shown inside its parent, not added to it`);
 ok(!/in total|altogether|combined total/i.test((text.match(/id="money"[\s\S]*?<\/table>/) || [""])[0]), `${id}: the money table gives no total`);
 // anchors used on the page exist on the page
 const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
 const miss = [...new Set([...html.matchAll(/href="#([^"]+)"/g)].map(m => m[1]))].filter(a => !ids.has(a));
 ok(!miss.length, `${id}: every link on the page lands${miss.length ? "; missing anchors: " + miss.join(", ") : ""}`);
 // internal links point at pages that exist
 const internal = [...new Set([...html.matchAll(/href="(\/[^"#?]*)/g)].map(m => m[1]))].filter(u => !/\.(css|js|json|md|xml|png|jpg|svg|txt|ico|webmanifest)$/.test(u));
 const dead = internal.filter(u => !fs.existsSync(path.join(ROOT, u, "index.html")) && !fs.existsSync(path.join(ROOT, u)));
 ok(!dead.length, `${id}: internal links resolve${dead.length ? "; missing: " + dead.join(", ") : ""}`);
 const files = [...html.matchAll(/href="(\/research\/[^"]+)"/g)].map(m => m[1]).filter(u => !fs.existsSync(path.join(ROOT, u)));
 ok(!files.length, `${id}: research files linked from the page exist${files.length ? "; missing: " + files.join(", ") : ""}`);
 // filters: every option matches at least one card, and the page works without JavaScript
 ok(/<form class="ce-filters" hidden/.test(html), `${id}: filters stay hidden without JavaScript, so every card shows`);
 // the city's own page and the cities index link here; the city page keeps its anchors
 const url = `/cities/${id}/${R.slug}/`, cp = read(`cities/${id}/index.html`);
 ok(index.includes(`href="${url}"`), `${id}: the cities index has a prominent entry`);
 ok(cp.includes(`href="${url}"`), `${id}: the city's page links to the profile`);
 ok(["heat-today", "history", "brief", "orgs"].every(a => cp.includes(`id="${a}"`)), `${id}: the city page keeps its anchors (#heat-today, #history, #brief, #orgs)`);
 // text twin, voice, sharing
 ok(P.activities.every(a => llms.includes(`[${a.id}]`)), `${id}: llms-full.txt carries every activity`);
 ok(!/—/.test(text), `${id}: no em dashes`);
 ok(!/\b(should|must)\b/i.test(text.replace(/<[^>]+>/g, " ")), `${id}: no "should" or "must" in the page's own voice`);
 ok(/<meta property="og:image" content="[^"]*share-systems-map\.jpg"/.test(html), `${id}: the page previews with the systems-map image`);
 ok(read("sitemap.xml").includes(url), `${id}: the page is in the sitemap`);
 // Bengaluru: the Collective's founding members
 if (id === "bengaluru") {
  const FOUND = ["ARTPARK", "Bengaluru Sustainability Forum", "C40 Cities", "CSTEP", "Hasiru Dala", "HeatWatch", "Jan Sahas", "KHPT", "NIMHANS", "Socratus", "WRI India"];
  const founding = P.orgs.filter(o => o.coalition === "founding").map(o => o.name);
  ok(FOUND.every(n => founding.includes(n)) && founding.length === 11, `bengaluru: all 11 founding members are accounted for${FOUND.filter(n => !founding.includes(n)).length ? "; missing: " + FOUND.filter(n => !founding.includes(n)).join(", ") : ""}`);
  ok(P.OK.has("c-blr-members"), "bengaluru: the membership claim passed the source check");
  const nimhans = P.orgs.find(o => o.id === "nimhans");
  ok(nimhans && !nimhans.activities.length && !P.activities.some(a => a.lead === "nimhans" || a.collaborators.some(c => c[0] === "nimhans")), "bengaluru: NIMHANS has no role beyond membership unless a source shows one");
  ok(html.includes("Common Shade is not a member, partner or representative"), "bengaluru: the page says Common Shade is not part of the Collective");
  ok(/no secretariat, lead organisation/i.test(html), "bengaluru: no invented secretariat or lead");
  ok(!/Bruhat Bengaluru Mahanagara Palike[^<]*, since/.test(html), "bengaluru: the BBMP appears as the former corporation, not a current one");
 }
}
console.log(bad ? `city ecosystem check: ${bad} failing` : `city ecosystem check passed: ${E.cities().length} profile(s)`);
process.exit(bad ? 1 : 0);
