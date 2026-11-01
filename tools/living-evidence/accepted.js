// Living evidence: the studies a reviewer has signed off in data/evidence/inbox/*.json, shaped like the Evidence
// map's own records (data/core/EVIDENCE.json), with the extracted fields kept alongside. Used by tools/build-pages.js
// (the Evidence map) and tools/living-evidence/check.js. Pending and rejected candidates never leave the inbox.
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", ".."), INBOX = path.join(ROOT, "data", "evidence", "inbox");
const LOOPS = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "core", "LOOPS.json"), "utf8")).map(l => l.id);
// the grade a reviewer gives, and how the Evidence map describes it (the map grades from these words)
const GRADE = { peer: "Peer-reviewed study", preprint: "Preprint, awaiting review by other researchers", official: "Agency report", model: "Modelling study", other: "Working paper or research report" };

function load() {
  const problems = [], accepted = [], counts = { pending: 0, accept: 0, reject: 0, weeks: 0 };
  if (!fs.existsSync(INBOX)) return { accepted, problems, counts };
  for (const f of fs.readdirSync(INBOX).filter(f => /^\d{4}-W\d{2}\.json$/.test(f)).sort()) {
    let j; try { j = JSON.parse(fs.readFileSync(path.join(INBOX, f), "utf8")); } catch (e) { problems.push(`${f}: not valid JSON (${e.message})`); continue; }
    counts.weeks++;
    for (const c of j.candidates || []) {
      const d = c.decision, at = `${f}: "${String(c.title).slice(0, 60)}"`;
      if (!["pending", "accept", "reject"].includes(d)) { problems.push(`${at}: decision is "${d}"; use accept, reject or pending`); continue; }
      counts[d]++;
      if (d !== "accept") continue;
      const r = c.review || {}, cycles = String(r.cycle || "").split(/[,;\s]+/).filter(Boolean);
      const miss = [];
      if (!cycles.length) miss.push("cycle"); cycles.filter(id => !LOOPS.includes(id)).forEach(id => miss.push(`cycle "${id}" (not a cycle id)`));
      if (!r.finding || r.finding.trim().length < 20) miss.push("finding (one or two sentences in the reviewer's words)");
      if (!GRADE[r.grade]) miss.push(`grade (one of ${Object.keys(GRADE).join(", ")})`);
      if (!r.where) miss.push("where");
      if (!/^https?:\/\//.test(c.url || "")) miss.push("url");
      if (/—/.test(JSON.stringify(r))) miss.push("an em dash in the review (use a plain hyphen)");
      if (miss.length) { problems.push(`${at}: accepted but missing ${miss.join(", ")}`); continue; }
      const year = String(c.date || "").slice(0, 4);
      accepted.push({ cycles, week: j.week, study: {
        by: [c.first_author, c.venue].filter(Boolean).join(", ") + (year ? `, ${year}` : ""), title: c.title, url: c.url, type: GRADE[r.grade], where: r.where,
        scale: r.sample_size ? `Sample: ${r.sample_size}` : "", limit: r.limit || "", finding: r.finding.trim(),
        living: { week: j.week, grade: r.grade, sample_size: r.sample_size || "", effect_size: r.effect_size || "", unit_cost: r.unit_cost || "",
          agro_climatic_zone: r.agro_climatic_zone || "", failure_modes: r.failure_modes || "", streams: c.streams || [] } } });
    }
  }
  return { accepted, problems, counts };
}
module.exports = { load, GRADE, LOOPS };
