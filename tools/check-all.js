#!/usr/bin/env node
// Common Shade: runs every check a change needs (the list is tools/checks.js) and prints one summary.
//   node tools/check-all.js            every check, in order (build first with node tools/build-static.js)
//   node tools/check-all.js --fast     leave out the slow browser checks (contrast, targets, site): a partial run
//   node tools/check-all.js --only voice,media    just these checks: a partial run
//   node tools/check-all.js --list     print the list and what each check guards
//   node tools/check-all.js --build    build the site first
//   node tools/check-all.js --stage    run git add -A before the site check (it reads tracked pages only)
//   node tools/check-all.js --bail     stop at the first failure
// It starts the local server on port 8765 for the checks that need it when nothing answers there, checks that a server
// already answering is serving this repository, and stops a server it started. It never stages files unless asked: if
// there are untracked pages, the site check is reported as incomplete, not passed. It never runs check-weight --update.
// Results: pass, pass with notes (a check passed but printed notes, such as a link a publisher blocks), fail, incomplete
// or skipped. The exit code is 0 when every check that ran passed and none was incomplete; a --fast or --only run says
// it is partial, so it is never mistaken for the full set.
"use strict";
const fs = require("fs"), path = require("path"), http = require("http"), { spawn, spawnSync, execFileSync } = require("child_process");
const { CHECKS, EXCLUDED } = require("./checks.js");
const ROOT = path.join(__dirname, ".."), PORT = 8765, a = process.argv.slice(2), has = f => a.includes(f);
const val = f => { const i = a.indexOf(f); return i > -1 ? a[i + 1] : null; };
// on GitHub Actions: each check in its own folded log group, failures and notes as annotations, a table in the run summary
const GH = !!process.env.GITHUB_ACTIONS, gh = s => { if (GH) console.log(s); };
const ghText = s => String(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");

if (has("--list")) {
  for (const c of CHECKS) console.log(`${c.name.padEnd(16)} ${c.cmd}${c.server ? "  [needs server]" : ""}${c.slow ? "  [slow]" : ""}\n${" ".repeat(17)}${c.guards}`);
  console.log(`\nNot run here: ${Object.entries(EXCLUDED).map(([f, w]) => `${f} (${w})`).join("; ")}`);
  process.exit(0);
}

// every check script is listed or excluded with a reason, so a new check cannot be silently left out
const listed = new Set(CHECKS.map(c => (c.cmd.match(/tools\/([\w/.-]+\.js)/) || [])[1]).filter(Boolean).map(f => path.basename(f)));
const unlisted = fs.readdirSync(path.join(ROOT, "tools")).filter(f => /^check-.*\.js$/.test(f) && f !== "check-all.js" && !listed.has(f) && !EXCLUDED[f]);
if (unlisted.length) { console.error(`check-all: ${unlisted.join(", ")} ${unlisted.length > 1 ? "are" : "is"} in neither tools/checks.js nor its EXCLUDED list. Add each to CHECKS, or to EXCLUDED with a reason.`); process.exit(1); }

const only = val("--only") ? val("--only").split(",").map(s => s.trim()).filter(Boolean) : null;
if (only) { const bad = only.filter(n => !CHECKS.some(c => c.name === n)); if (bad.length) { console.error(`check-all: no check named ${bad.join(", ")}. See node tools/check-all.js --list`); process.exit(1); } }
const run = CHECKS.filter(c => (!only || only.includes(c.name)) && !(has("--fast") && c.slow));
const partial = !!only || has("--fast");

const get = (u, ms = 3000) => new Promise(res => { const r = http.get(u, s => { let d = ""; s.on("data", x => d += x); s.on("end", () => res({ status: s.statusCode, body: d })); }); r.on("error", () => res(null)); r.setTimeout(ms, () => { r.destroy(); res(null); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let server = null;
const stop = () => { if (server) { try { server.kill(); } catch (e) {} server = null; } };
process.on("SIGINT", () => { stop(); process.exit(130); });

(async () => {
  const t0 = Date.now(), results = [];
  try {
    if (has("--build")) { console.log("building: node tools/build-static.js"); const b = spawnSync("node", ["tools/build-static.js"], { cwd: ROOT, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 }); if (b.status !== 0) { console.error((b.stdout + b.stderr).trim().split("\n").slice(-15).join("\n")); console.error("check-all: the build failed; nothing was checked."); process.exit(1); } }
    // the local server, for the checks that read rendered pages over http
    if (run.some(c => c.server)) {
      const probe = "/tools/checks.js", mine = fs.readFileSync(path.join(ROOT, "tools", "checks.js"), "utf8");
      let r = await get(`http://localhost:${PORT}${probe}`);
      if (r && r.body !== mine) { console.error(`check-all: something on port ${PORT} is not serving this repository (${probe} differs). Stop it, then run this again.`); process.exit(1); }
      if (!r) {
        server = spawn("python3", ["-m", "http.server", String(PORT), "--bind", "127.0.0.1", "--directory", ROOT], { stdio: "ignore" });
        for (let i = 0; i < 40 && !(r = await get(`http://localhost:${PORT}${probe}`, 1000)); i++) await sleep(250);
        if (!r || r.body !== mine) { stop(); console.error(`check-all: could not start the local server on port ${PORT} (python3 -m http.server).`); process.exit(1); }
        console.log(`started the local server on port ${PORT}; it stops when the checks finish`);
      }
    }
    // the site check reads tracked pages only: stage on request, otherwise say which pages it would miss
    let untracked = [];
    if (run.some(c => c.tracked)) {
      if (has("--stage")) execFileSync("git", ["add", "-A"], { cwd: ROOT });
      untracked = execFileSync("git", ["ls-files", "--others", "--exclude-standard", "--", "*index.html"], { cwd: ROOT }).toString().split("\n").filter(Boolean).filter(f => !f.startsWith("print/") && !f.startsWith("tools/"));
    }
    for (const c of run) {
      const s = Date.now();
      if (GH) gh(`::group::${c.name}: ${c.cmd}`); else process.stdout.write(`${c.name.padEnd(16)} `);
      const p = spawnSync(c.cmd, { cwd: ROOT, shell: true, encoding: "utf8", maxBuffer: 256 * 1024 * 1024, env: Object.assign({}, process.env, { FORCE_COLOR: "0" }) });
      const out = ((p.stdout || "") + (p.stderr || "")).trim(), lines = out.split("\n").filter(l => l.trim()), last = (lines[lines.length - 1] || "").trim();
      let state = p.status === 0 ? "pass" : "fail";
      if (state === "pass" && lines.some(l => /^\s*(note|warn|warning)\b|\bBLOCKED\b/i.test(l))) state = "pass with notes";
      if (state !== "fail" && c.tracked && untracked.length) state = "incomplete";
      const secs = ((Date.now() - s) / 1000).toFixed(1);
      results.push({ c, state, last, lines, secs });
      if (GH) { console.log(out); gh("::endgroup::"); console.log(`${c.name.padEnd(16)} ${state.padEnd(16)} ${secs.padStart(6)}s  ${last.slice(0, 110)}`); }
      else console.log(`${state.padEnd(16)} ${secs.padStart(6)}s  ${last.slice(0, 110)}`);
      if (state === "fail") gh(`::error title=${c.name} failed::${ghText(lines.slice(-6).join("\n"))}%0ARerun: ${c.cmd}`);
      if (state === "pass with notes") gh(`::warning title=${c.name} passed with notes::${ghText(lines.filter(l => /^\s*(note|warn|warning)\b|\bBLOCKED\b/i.test(l)).slice(0, 5).join("\n"))}`);
      if (state === "incomplete") gh(`::error title=${c.name} incomplete::untracked pages were skipped`);
      if (state === "fail" && has("--bail")) break;
    }
    // the summary
    const fails = results.filter(r => r.state === "fail"), inc = results.filter(r => r.state === "incomplete"), skipped = CHECKS.filter(c => !results.some(r => r.c === c));
    for (const r of fails) console.log(`\n--- ${r.c.name} failed (${r.c.guards}). Its last lines:\n${r.lines.slice(-15).join("\n")}\nRerun: ${r.c.cmd}`);
    if (inc.length) console.log(`\n--- site: incomplete. ${untracked.length} untracked page${untracked.length > 1 ? "s" : ""} would be skipped (${untracked.slice(0, 5).join(", ")}${untracked.length > 5 ? ", ..." : ""}). Stage them (git add -A, or --stage), then run the site check again.`);
    const counts = ["pass", "pass with notes", "fail", "incomplete"].map(s => [s, results.filter(r => r.state === s).length]).filter(([, n]) => n).map(([s, n]) => `${n} ${s}`).join(", ");
    console.log(`\ncheck-all: ${counts}${skipped.length ? `, ${skipped.length} skipped (${skipped.map(c => c.name).join(", ")})` : ""} in ${((Date.now() - t0) / 1000).toFixed(0)}s.${partial || skipped.length ? " A partial run, not a full pass." : ""}`);
    if (GH && process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Checks${partial ? " (a partial run: " + (has("--fast") ? "the browser checks run locally" : "selected checks") + ")" : ""}\n\n| Check | Result | Time | Last line |\n|---|---|---|---|\n${results.map(r => `| ${r.c.name} | ${r.state} | ${r.secs}s | ${r.last.replace(/\|/g, "/").slice(0, 120)} |`).join("\n")}\n`);
    if (has("--build")) { const st = execFileSync("git", ["status", "--short"], { cwd: ROOT }).toString().split("\n").filter(Boolean); if (st.length) console.log(`The build left ${st.length} changed file${st.length > 1 ? "s" : ""} (git status --short).`); }
    process.exitCode = fails.length || inc.length ? 1 : 0;
  } finally { stop(); }
})();
