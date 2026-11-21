#!/usr/bin/env node
// Common Shade: keeps the derived parts of Signals in step with their sources. Run after editing data/site/signals.json.
//   node tools/signals-sync.js          writes data/site/signals-checks.json and the derived fields in signals.json
//   node tools/signals-sync.js --check  changes nothing; exits 1, naming what is out of step, if a write would change anything
// 1. data/site/signals-checks.json: for every source url a signal cites, the checks this repository holds:
//    content checks (data/inbox/<batch>/link-check.json: status and which expected terms were found) and link checks
//    (research/*/link-status.json: the page opened, nothing more). Each is dated by the commit that recorded it.
// 2. In signals.json, each commitment's "stage" and "history" are rewritten from its deliverables (tools/signals-model.js
//    legacy()), so older readers of the file keep working and nothing is typed twice. The file is re-serialised in one style.
"use strict";
const fs = require("fs"), path = require("path"), cp = require("child_process"), SM = require("./signals-model.js");
const ROOT = path.join(__dirname, ".."), F = path.join(ROOT, "data/site/signals.json"), FC = path.join(ROOT, "data/site/signals-checks.json");
const CHECK = process.argv.includes("--check"), today = new Date().toISOString().slice(0, 10);
const gitDate = f => { try { return cp.execSync(`git log -1 --format=%cs -- "${f}"`, { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch (e) { return ""; } };

// the sentence of the checked page that holds a term, so a reader sees the evidence itself: kept only when it reads as
// prose (six words or more, not a run of menu labels) and cut to about 280 characters around the term
// A sentence the site's voice check would flag (an instructing word, a word suggesting wrongdoing, an em dash) is passed
// over for another holding the same term: quoted or not, it would read as the site's voice.
const TONE = require("../data/schema/tone.json").voice, rx = a => new RegExp(`\\b(${a.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "i");
const VOICE = [rx(TONE.hold), ...(TONE.suspicion ? [rx(TONE.suspicion.hold)] : [])];
function passages(around, terms) {
  const norm = x => String(x).toLowerCase().replace(/\s+/g, " "), out = {};
  const sentences = around.join(" ").replace(/\s+/g, " ").split(/(?<=[.!?])\s+(?=[A-Z0-9"“(])/);
  for (const t of terms) {
    if (t.length < 5 || /^[\d.,%\s]+$/.test(t)) continue;   // a bare number or a short code finds menus and headlines, not the claim
    const k = norm(t), hit = sentences.find(x => { const n = norm(x), w = x.split(" ").filter(Boolean); if (!n.includes(k) || w.length < 6 || w.slice(0, 5).every(y => /^[A-Z]/.test(y)) || /-->|sign in|log in|cookie|subscribe|accessible mode/i.test(x) || x.includes("\u2014") || VOICE.some(v => v.test(x))) return false;
      const caps = w.filter(y => /^[A-Z]/.test(y)).length / w.length; return caps < 0.5 && /[a-z]{3,}\s[a-z]{2,}\s[a-z]{2,}/.test(x); });
    if (!hit) continue;
    // tidy page furniture only (link labels, stray spaces); the source's words are unchanged
    let q = hit.replace(/\(link is external\)/gi, "").replace(/\s+([,.;:!?])/g, "$1").replace(/(\d) (st|nd|rd|th)\b/g, "$1$2").replace(/\s+/g, " ").trim();
    if (q.length > 300) { const i = norm(q).indexOf(k), a = Math.max(0, i - 130), z = Math.min(q.length, i + k.length + 130); q = (a ? "…" : "") + q.slice(a, z).trim() + (z < q.length ? "…" : ""); }
    out[t] = q;
  }
  return out;
}
function checks(D) {
  const want = new Set(D.signals.flatMap(s => (s.sources || []).map(x => x.url))), urls = {};
  const add = (u, r) => { if (want.has(u)) (urls[u] = urls[u] || []).push(r); };
  const inbox = path.join(ROOT, "data/inbox");
  for (const b of fs.readdirSync(inbox).sort()) {
    const f = path.join(inbox, b, "link-check.json"); if (!fs.existsSync(f)) continue;
    const J = JSON.parse(fs.readFileSync(f, "utf8")), T = J._terms || {}, when = gitDate(path.relative(ROOT, f)) || b.slice(0, 7);
    const xf = path.join(inbox, b, "_excerpts.json"), X = fs.existsSync(xf) ? Object.values(JSON.parse(fs.readFileSync(xf, "utf8"))) : [];
    for (const [u, v] of Object.entries(J)) if (/^https?:/.test(u)) { const terms = (typeof v === "string" ? T[u] : v.found) || {}, ex = X.find(x => x.url === u);
      const rec = { kind: "content", batch: b, checked: when, status: typeof v === "string" ? v : v.status, terms };
      const ps = ex ? passages(ex.around || [], Object.keys(terms).filter(t => terms[t])) : {}; if (Object.keys(ps).length) rec.passages = ps;
      add(u, rec); }
  }
  const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : e.name === "link-status.json" ? [path.join(d, e.name)] : []);
  for (const f of walk(path.join(ROOT, "research")).sort()) {
    let J; try { J = JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { continue; }
    const when = gitDate(path.relative(ROOT, f)), at = path.relative(ROOT, path.dirname(f));
    for (const [u, v] of Object.entries(J)) if (v && typeof v === "object" && v.status) add(u, { kind: "link", batch: at, checked: when, status: v.status });
  }
  for (const u of Object.keys(urls)) urls[u].sort((a, b) => (a.kind + a.checked + a.batch).localeCompare(b.kind + b.checked + b.batch));
  return { about: "Generated by tools/signals-sync.js from data/inbox/*/link-check.json (content checks: status and expected terms found) and research/**/link-status.json (link checks: the page opened). Dated by the commit that recorded each check. Do not edit by hand.", urls: Object.fromEntries(Object.keys(urls).sort().map(u => [u, urls[u]])) };
}
// one serialisation style for signals.json: top-level keys one per line, each record's fields one per line, small objects inline
function ser(D) {
  const j = v => JSON.stringify(v), L = ["{"];
  const keys = Object.keys(D);
  keys.forEach((k, ki) => {
    const end = ki < keys.length - 1 ? "," : "";
    if (k === "signals" || k === "groups") {
      L.push(` ${j(k)}: [`);
      D[k].forEach((s, si) => {
        const f = Object.keys(s), body = f.map((fk, fi) => {
          const e = fi < f.length - 1 ? "," : "", v = s[fk];
          if (fk === "deliverables") return `   "deliverables": [\n${v.map((d, di) => {
            const dk = Object.keys(d);
            return `    {\n${dk.map((x, xi) => { const ee = xi < dk.length - 1 ? "," : ""; return x === "milestones" || x === "events" ? `     ${j(x)}: [\n${d[x].map(m => `      ${j(m)}`).join(",\n")}\n     ]${ee}` : `     ${j(x)}: ${j(d[x])}${ee}`; }).join("\n")}\n    }${di < v.length - 1 ? "," : ""}`;
          }).join("\n")}\n   ]${e}`;
          if (Array.isArray(v) && v.length && typeof v[0] === "object") return `   ${j(fk)}: [\n${v.map(x => `    ${j(x)}`).join(",\n")}\n   ]${e}`;
          return `   ${j(fk)}: ${j(v)}${e}`;
        }).join("\n");
        L.push(`  {\n${body}\n  }${si < D[k].length - 1 ? "," : ""}`);
      });
      L.push(` ]${end}`);
    } else if (Array.isArray(D[k])) L.push(` ${j(k)}: [\n${D[k].map(x => `  ${j(x)}`).join(",\n")}\n ]${end}`);
    else L.push(` ${j(k)}: ${j(D[k])}${end}`);
  });
  L.push("}"); return L.join("\n") + "\n";
}
const D = JSON.parse(fs.readFileSync(F, "utf8")), C = checks(D);
for (const s of D.signals) if (s.kind === "commitment" && s.deliverables) {
  const g = SM.legacy(s, C, today), order = Object.keys(s), out = {};
  // keep "stage" and "history" where they were in the record, rewritten from the deliverables
  for (const k of order) out[k] = k === "stage" ? g.stage : k === "history" ? g.history : s[k];
  if (!("stage" in out)) out.stage = g.stage; if (!("history" in out)) out.history = g.history;
  Object.keys(s).forEach(k => delete s[k]); Object.assign(s, out);
}
const nextS = ser(D), nextC = JSON.stringify(C, null, 1) + "\n";
const curS = fs.readFileSync(F, "utf8"), curC = fs.existsSync(FC) ? fs.readFileSync(FC, "utf8") : "";
// in --check mode, check records are compared without their commit dates, and without the order those dates give them:
// a shallow clone (as on GitHub) dates every record by its one commit, which reorders records that share a URL
const strip = s => { if (!s) return ""; const J = JSON.parse(s);
  return JSON.stringify(Object.keys(J.urls || {}).sort().map(u => [u, J.urls[u].map(r => { const o = Object.assign({}, r); delete o.checked; return JSON.stringify(o); }).sort()])); };
if (CHECK) {
  const bad = [];
  if (nextS !== curS) bad.push("data/site/signals.json: stage, history or formatting differ from what the deliverables give");
  if (strip(nextC) !== strip(curC)) bad.push("data/site/signals-checks.json: the check records have changed");
  if (bad.length) { console.log(bad.map(b => "  FAIL " + b).join("\n") + "\n  Fix: node tools/signals-sync.js"); process.exit(1); }
  console.log("signals sync: derived fields and check records are up to date");
} else {
  fs.writeFileSync(F, nextS); fs.writeFileSync(FC, nextC);
  console.log(`signals sync: ${Object.keys(C.urls).length} source urls with check records; ${D.signals.filter(s => s.deliverables).length} commitments' stage and history derived`);
}
