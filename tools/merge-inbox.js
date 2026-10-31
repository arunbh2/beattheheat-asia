// Publishes a month of research: every record in data/inbox/YYYY-MM/ that passes all seven gates joins the knowledge base;
// anything that fails waits in data/inbox/held/YYYY-MM.json with its reasons, and nothing doubtful reaches the site.
//   node tools/merge-inbox.js 2026-11              merge, rebuild, check the site (gate 7), write the report
//   node tools/merge-inbox.js 2026-11 --dry-run    show what would happen, change nothing
// Needs data/inbox/YYYY-MM/link-check.json ({ url: "OK" | "REDIRECT" | "BLOCKED" | "FAIL" }) from the link checker.
"use strict";
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const { check, readDir, KB, INBOX } = require("./check-data");
const ROOT = path.join(__dirname, ".."), REPORTS = path.join(ROOT, "data", "reports");
const month = process.argv[2], dry = process.argv.includes("--dry-run");
if (!/^\d{4}-\d{2}$/.test(month || "")) { console.error("usage: node tools/merge-inbox.js YYYY-MM [--dry-run]"); process.exit(2); }

const dir = path.join(INBOX, month), recs = readDir(dir);
const lf = path.join(dir, "link-check.json"), links = fs.existsSync(lf) ? JSON.parse(fs.readFileSync(lf, "utf8")) : {};
const kb = readDir(KB), res = check(recs, kb, { inbox: true, links });
const byId = new Map(res.map(x => [x.id, x]));
// a record whose sources were held back cannot go live either
let changed = true;
while (changed) { changed = false;
  for (const r of recs) { const x = byId.get(r.id); if (x.hold.length) continue;
    const lost = (r.sources || []).filter(s => byId.has(s) && byId.get(s).hold.length);
    if (lost.length) { x.hold.push(`its source was held back: ${lost.join(", ")}`); changed = true; } } }
const pass = recs.filter(r => !byId.get(r.id).hold.length), held = recs.filter(r => byId.get(r.id).hold.length);

const strip = r => { const { _file, review, ...rest } = r; return { ...rest, added: month, changed: month }; };
const files = {};   // data/kb/<type>.json -> records
for (const f of fs.existsSync(KB) ? fs.readdirSync(KB).filter(f => f.endsWith(".json") && !f.startsWith("_")) : [])
  files[f] = JSON.parse(fs.readFileSync(path.join(KB, f), "utf8"));
const before = JSON.stringify(files);
for (const r of pass) {
  const f = `${r.type}.json`; files[f] = files[f] || [];
  if (r.replaces) for (const list of Object.values(files)) { const old = list.find(x => x.id === r.replaces);
    if (old) { old.status = "superseded"; old.changed = month; old.superseded_by = r.id; } }
  files[f].push(strip(r));
}
for (const f of Object.keys(files)) files[f].sort((a, b) => a.id.localeCompare(b.id));

const report = [`# Knowledge base update, ${month}`, "", `${pass.length} ${pass.length === 1 ? "record" : "records"} published, ${held.length} held back.`, "",
  "## Published", ...pass.map(r => `- **${r.title}** (${r.type}, ${r.evidence})${r.replaces ? `, replacing ${r.replaces}` : ""}`), "",
  "## Held back, with reasons", ...held.map(r => `- **${r.title || r.id}** (${r.id}): ${byId.get(r.id).hold.join("; ")}`), "",
  "## Flags the reviewer answered", ...pass.filter(r => byId.get(r.id).review.length).map(r => `- ${r.id}: ${byId.get(r.id).review.join("; ")} — ${(r.review || {}).addresses || ""}`)].join("\n");

if (dry) { console.log(report); process.exit(0); }
fs.mkdirSync(KB, { recursive: true });
const write = () => { for (const [f, list] of Object.entries(files)) fs.writeFileSync(path.join(KB, f), JSON.stringify(list, null, 1) + "\n"); };
const restore = () => { const old = JSON.parse(before); for (const f of Object.keys(files)) { if (old[f]) fs.writeFileSync(path.join(KB, f), JSON.stringify(old[f], null, 1) + "\n"); else fs.rmSync(path.join(KB, f), { force: true }); } };
write();
// gate 7: the knowledge base is sound, the site builds and every page works; otherwise put everything back
try {
  execFileSync(process.execPath, [path.join(__dirname, "check-data.js")], { stdio: "inherit" });
  execFileSync(process.execPath, [path.join(__dirname, "build-static.js")], { stdio: "inherit" });
  if (!process.env.SKIP_SITE_CHECK) execFileSync(process.execPath, [path.join(__dirname, "check-site.js")], { stdio: "inherit" });
} catch (e) { restore(); console.error("Gate 7 failed: nothing was published. The knowledge base is as it was."); process.exit(1); }

fs.mkdirSync(path.join(INBOX, "held"), { recursive: true });
if (held.length) fs.writeFileSync(path.join(INBOX, "held", `${month}.json`), JSON.stringify(held.map(r => ({ ...r, _held: byId.get(r.id).hold })), null, 1) + "\n");
fs.mkdirSync(REPORTS, { recursive: true });
fs.writeFileSync(path.join(REPORTS, `${month}.md`), report + "\n");
const log = path.join(KB, "_changes.json"), changes = fs.existsSync(log) ? JSON.parse(fs.readFileSync(log, "utf8")) : [];
changes.unshift({ month, published: pass.map(r => ({ id: r.id, type: r.type, title: r.title, replaces: r.replaces || null })), held: held.length });
fs.writeFileSync(log, JSON.stringify(changes, null, 1) + "\n");
console.log(`${month}: ${pass.length} published, ${held.length} held. Report: data/reports/${month}.md`);
