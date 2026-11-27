// Common Shade: what the wet-bulb wall and Heat futures may say, and which checked records they draw on.
//   passed(key)  true when every term staged for that source (data/inbox/2026-11-heat-interactives/sources.json) was found
//                by verify-sources.yml (link-check.json); a study card or claim reaches a page only then
//   src(key)     the staged record { title, publisher, year, url, kind }
//   levers(ids), loops(ids)  the site's own checked action and vicious-cycle records (data.js), for linking
// Used by tools/build-wet-bulb-wall.js, tools/build-heat-futures.js and their checks.
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, ".."), DIR = path.join(ROOT, "data", "inbox", "2026-11-heat-interactives");
const SRC = JSON.parse(fs.readFileSync(path.join(DIR, "sources.json"), "utf8"));
const LC = fs.existsSync(path.join(DIR, "link-check.json")) ? JSON.parse(fs.readFileSync(path.join(DIR, "link-check.json"), "utf8")) : {};
const TERMS = LC._terms || {};
const BY = Object.fromEntries(SRC.map(s => [s.keys[0], s]));
function passed(key) {
  const s = BY[key]; if (!s) return false;
  const t = TERMS[s.url]; if (!t) return false;
  return s.expect.every(e => t[e] === true);
}
const src = key => BY[key] || null;
const checkedOn = () => { try { return require("child_process").execFileSync("git", ["log", "-1", "--format=%cs", "--", path.join(DIR, "link-check.json")], { cwd: ROOT }).toString().trim(); } catch (e) { return ""; } };
let D = null;
function data() {
  if (D) return D;
  const c = {}; vm.createContext(c);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "data.js"), "utf8") + ";this.D={LOOPS,LEVERS,LIVE_CITIES}", c);
  return (D = c.D);
}
const levers = ids => ids.map(id => data().LEVERS.find(l => l.id === id)).filter(Boolean);
const loops = ids => ids.map(id => data().LOOPS.find(l => l.id === id)).filter(Boolean);
const report = () => SRC.map(s => ({ key: s.keys[0], ok: passed(s.keys[0]), missing: s.expect.filter(e => !(TERMS[s.url] || {})[e]) }));
module.exports = { passed, src, levers, loops, data, report, checkedOn, SRC };
