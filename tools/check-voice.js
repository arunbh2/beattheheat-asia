// Humility check: no page speaks in an instructing voice. Reads every built page's visible text and fails on any
// phrase in data/schema/tone.json voice.hold, unless the sentence contains a voice.allow phrase (a law, a physical
// limit or a quoted headline). Link text is skipped: it carries other people's headlines in their own words.
//   node tools/check-voice.js
"use strict";
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const ROOT = path.join(__dirname, ".."), { voice } = require("../data/schema/tone.json");
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const hold = new RegExp(`\\b(${voice.hold.map(esc).join("|")})\\b`, "i");
const suspicion = voice.suspicion ? new RegExp(`\\b(${voice.suspicion.hold.map(esc).join("|")})\\b`, "i") : null;
const pages = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "*.html"], { cwd: ROOT }).toString().split("\n")
  .filter(f => f && !/^(media|tools|research|node_modules)\//.test(f));
const found = [];
for (const f of pages) {
  const text = fs.readFileSync(path.join(ROOT, f), "utf8")
    .replace(/<(script|style|template|noscript)[\s\S]*?<\/\1>/gi, " ").replace(/<a\b[\s\S]*?<\/a>/gi, " ")
    .replace(/<[^>]+>/g, " ").replace(/&nbsp;|&#160;/g, " ").replace(/&[a-z#0-9]+;/gi, "'").replace(/\s+/g, " ");
  for (const s of text.split(/(?<=[.?!;])\s+/)) {
    const m = s.match(hold);
    if (m && !voice.allow.some(a => s.includes(a))) found.push(`${f}: "${m[1]}" in: ${s.trim().slice(0, 160)}`);
    const q = suspicion && s.match(suspicion);
    if (q) found.push(`${f}: "${q[1]}" suggests wrongdoing, in: ${s.trim().slice(0, 160)}`);
  }
}
if (found.length) { console.error(`voice check: ${found.length} instructing phrases\n` + found.join("\n")); process.exit(1); }
console.log(`voice check: ${pages.length} pages, no instructing voice and no words that suggest wrongdoing`);
