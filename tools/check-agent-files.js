// Common Shade: checks the machine-readable doors (tools/build-agent-files.js). Each failure says what to fix.
//   node tools/check-agent-files.js
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), SITE = "https://beattheheat.asia";
let bad = 0; const ok = m => console.log("  ok  ", m), no = m => { bad++; console.log("  FAIL", m); };
const read = f => fs.readFileSync(path.join(ROOT, f), "utf8"), has = f => fs.existsSync(path.join(ROOT, f));
const jsonOf = f => { try { return JSON.parse(read(f)); } catch (e) { no(`${f} is missing or not valid JSON. Run node tools/build-static.js.`); return null; } };
const onSite = (u, from) => { const p = String(u).startsWith(SITE) ? u.slice(SITE.length) : null; return p === null || p === "/" || has(p.split("#")[0].replace(/\/$/, "/index.html").replace(/^\//, "")) || has(p.replace(/^\//, "")); };

for (const f of [".well-known/ard.json", ".well-known/api-catalog", ".well-known/tdmrep.json", "openapi.json", "sitemap.json"]) jsonOf(f) && ok(`${f} is valid JSON`);
const ard = jsonOf(".well-known/ard.json");
if (ard) { const dead = Object.entries(ard).filter(([k, v]) => typeof v === "string" && v.startsWith(SITE) && !onSite(v)).map(([k]) => k);
  dead.length ? no(`ard.json points to files that do not exist: ${dead.join(", ")}`) : ok("every address in ard.json exists"); }
const api = jsonOf("openapi.json");
if (api) { api.openapi === "3.1.0" ? ok("openapi.json is OpenAPI 3.1") : no("openapi.json is not version 3.1.0");
  const miss = Object.keys(api.paths).filter(p => !has(p.replace(/^\//, "")));
  miss.length ? no(`openapi.json lists paths with no file: ${miss.join(", ")}. Fix ENDPOINTS in tools/for-ai-text.js.`) : ok(`all ${Object.keys(api.paths).length} openapi.json paths exist`);
  const noEx = Object.entries(api.paths).filter(([p, v]) => !Object.values(v.get.responses["200"].content)[0].example).length;
  ok(`${Object.keys(api.paths).length - noEx} of ${Object.keys(api.paths).length} paths carry an example`); }
const sec = read(".well-known/security.txt"), exp = (sec.match(/^Expires:\s*(.+)$/m) || [])[1];
/^Contact:\s*\S+/m.test(sec) && exp && new Date(exp) > new Date(Date.now() + 30 * 864e5) ? ok("security.txt has Contact and an Expires more than 30 days away") : no("security.txt needs a Contact line and an Expires date more than 30 days ahead. Run node tools/build-static.js.");
const home = read("index.html"), d = ((home.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "").length;
d >= 50 && d <= 170 ? ok(`home meta description is ${d} characters`) : no(`home meta description is ${d} characters; 50 to 170 reads well in search results. Edit index.html.`);
const sm = [...read("sitemap.xml").matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace(SITE, "")).filter(u => u.endsWith("/") && has(u.replace(/^\//, "") + "index.html"));
const noTwin = sm.filter(u => !has(u.replace(/^\//, "") + "index.md")), noLink = sm.filter(u => !read(u.replace(/^\//, "") + "index.html").includes('type="text/markdown"'));
noTwin.length ? no(`pages without a Markdown twin: ${noTwin.slice(0, 5).join(", ")}`) : ok(`${sm.length} pages have a Markdown twin`);
noLink.length ? no(`pages without the twin link in the head: ${noLink.slice(0, 5).join(", ")}`) : ok("every page links its twin in the head");
/<feed[^>]*Atom|<feed xmlns="http:\/\/www.w3.org\/2005\/Atom"/.test(read("feed.xml")) && (read("feed.xml").match(/<entry>/g) || []).length ? ok("feed.xml is an Atom feed with entries") : no("feed.xml has no entries. Check data/site/growth.json.");
has("_config.yml") && /\.well-known/.test(read("_config.yml")) ? ok("_config.yml lets GitHub Pages publish /.well-known/") : no("_config.yml must include .well-known or GitHub Pages hides it.");
/Sitemap:/.test(read("robots.txt")) ? ok("robots.txt names the sitemap") : no("robots.txt has no Sitemap line.");
const imgs = (home.match(/<img\b[^>]*>/g) || []).filter(t => !/\balt=/.test(t));
imgs.length ? no(`${imgs.length} home-page image(s) have no alt attribute`) : ok("every home-page image has an alt attribute");
console.log(bad ? `agent files check: ${bad} failing` : "agent files check passed");
process.exit(bad ? 1 : 0);
