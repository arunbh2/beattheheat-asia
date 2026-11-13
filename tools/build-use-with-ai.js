// Common Shade: /use-with-ai/ ("Use Common Shade with your own AI") and the evidence packs in /packs/. Package 1 of the
// AI-in-system-mapping brief. The site runs no AI service: a reader brings their own assistant or notebook tool and loads
// a pack, a plain-text file of the site's own words and sources for one country, one vicious cycle or one action, with
// starter questions. Countries reuse each country page's Markdown twin word for word; cycles and actions are assembled
// from the map's data with every source. Two steps, because the country twins exist only at the end of the build:
//   require("./build-use-with-ai.js").page({ page, write, esc, hero, D })   from build-pages.js (the page, llms-full)
//   require("./build-use-with-ai.js").packs()                               from build-static.js, after the twins
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, ".."), SITE = "https://beattheheat.asia", SLUG = "use-with-ai", DIR = "packs";
const TITLE = "Use Common Shade with your own AI";
const LEDE = "Bring the evidence into the assistant or notebook tool you already use. Each pack is one plain-text file of the site's own words and sources, for one country, one vicious cycle or one action, with questions to start from.";
const WARN = "An assistant can be wrong, even with a good pack in front of it. The sources in each pack are the authority: check any answer you rely on against them.";
const USES = [
  ["Load a pack into a notebook tool", "Notebook tools that answer only from the files you give them are a good fit. Add one pack, or a few, and ask your questions there."],
  ["Ask an assistant grounded in it", "Paste the pack, or attach it, and ask the assistant to answer only from the pack and to name the source behind each point."],
  ["Check the answer against the sources", "Every pack ends with its sources. Open the ones an answer rests on. Each pack also carries the evidence labels: known, inferred or uncertain."]
];
const PRIVACY = "Packs are plain files on this site. Loading one into an AI service sends its text to that service under that service's terms; Common Shade sends nothing about you anywhere.";
const Q = {
  country: n => [`What does extreme heat already do to people in ${n}, according to this pack, and how sure is each point?`, `Which plans, warnings and rules for heat exist in ${n}, and which have been evaluated?`, `Who could act on heat in ${n}, and who could pay?`, `What does this pack say is still unknown or unmeasured in ${n}?`, `If I work in one city in ${n}, which parts of this pack apply, and what would I still need to find out locally?`, `Which sources would I read first to check the strongest claim here?`],
  cycle: n => [`Explain "${n}" step by step, with the source for each link.`, `Who is hit hardest by this cycle, according to the pack?`, `Which actions could interrupt it, and what do they depend on?`, `What would have to be true for one of these links to fail in my place?`, `Which studies support this cycle, and what limits do they state about themselves?`, `What is still uncertain about this cycle?`],
  action: n => [`What is "${n}", who would carry it out, and over what time?`, `Which vicious cycles could it help interrupt, and how?`, `What does it depend on to work, and what side effects are noted?`, `What examples does the pack give, and what do their sources show?`, `How would progress be measured?`, `What would I need to find out before proposing this in my place?`]
};

function data() {
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "data.js"), "utf8") + ";this.D={LOOPS,LEVERS,CONSEQUENCES,EVIDENCE,INSTITUTIONS}", ctx);
  const L = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "core", "LEVERS.json"), "utf8")), LV = Array.isArray(L) ? L : L.levers;
  ctx.D.WATCH = Object.fromEntries(LV.filter(l => l.watch).map(l => [l.id, l.watch]));
  return ctx.D;
}
const COUNTRIES = () => fs.readdirSync(path.join(ROOT, "countries"), { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name).sort();
const nameOf = slug => slug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
const edgeLoops = (D, l) => D.LOOPS.filter(o => o.path.some((n, i) => n === l.edge[0] && o.path[(i + 1) % o.path.length] === l.edge[1]));
function list(D) {
  return {
    country: COUNTRIES().map(s => ({ id: s, name: nameOf(s), file: `/${DIR}/country-${s}.txt`, page: `/countries/${s}/` })),
    cycle: D.LOOPS.map(l => ({ id: l.id, name: l.name, file: `/${DIR}/cycle-${l.id}.txt`, page: `/loops/#${l.id}` })),
    action: D.LEVERS.map(l => ({ id: l.id, name: l.title, file: `/${DIR}/action-${l.id}.txt`, page: `/actions/#${l.id}` }))
  };
}

// ---- the page ----
function page({ page, write, esc, hero, D }) {
  const P = list(D);
  const grp = (k, anchor, h, intro) => `<section class="hub-sec" id="${anchor}"><h2 class="hub-h">${esc(h)} <small>(${P[k].length})</small></h2><p class="hub-p">${esc(intro)}</p>
    <ul class="hub-grid hub-grid--quiet">${P[k].map(p => `<li><a class="hub-card" href="${p.file}" download><b>${esc(p.name)}</b><span>Evidence pack, plain text</span></a></li>`).join("")}</ul></section>`;
  const body = `${hero("News and evidence", TITLE, esc(LEDE))}
    <section class="container hub">
      <ul class="hub-grid hub-grid--plain">${USES.map(([h, p]) => `<li class="std"><b>${esc(h)}</b><span>${esc(p)}</span></li>`).join("")}</ul>
      <p class="hub-p"><b>${esc(WARN)}</b></p>
      <p class="hub-p">${esc(PRIVACY)} For the whole site at once, there is <a href="/llms-full.txt">one plain-text file</a>. How AI is used to build Common Shade is set out on <a href="/approach/#ai">How Common Shade sees heat</a>.</p>
      ${grp("country", "countries", "Countries", "Each country pack is the country snapshot, word for word: plans, warnings, rules at work, cooling, money, cities and who is working on it.")}
      ${grp("cycle", "cycles", "Vicious cycles", "Each cycle pack holds the cycle, each link in it with its source, the studies behind it with the limits they state, and the actions that could interrupt it.")}
      ${grp("action", "actions", "Actions", "Each action pack holds what the action is, who acts, how it is measured, examples with sources, side effects to watch for, and the cycles it could interrupt.")}
    </section>`;
  write(SLUG, page(SLUG, TITLE, "Evidence packs on extreme heat in South and Southeast Asia, one plain-text file per country, vicious cycle and action, to load into the AI assistant or notebook tool you already use.",
    body));
  // the same words in llms-full.txt
  const f = path.join(ROOT, "llms-full.txt"); let t = fs.readFileSync(f, "utf8"); const i = t.indexOf("## " + TITLE);
  if (i >= 0) { const j = t.indexOf("\n## ", i + 5); t = t.slice(0, i) + (j >= 0 ? t.slice(j + 1) : ""); }
  fs.writeFileSync(f, t.replace(/\n*$/, "\n\n") + [`## ${TITLE}`, `${SITE}/${SLUG}/`, LEDE, ...USES.map(([h, p]) => `- ${h}: ${p}`), WARN, PRIVACY,
    `Packs: ${P.country.length} countries, ${P.cycle.length} vicious cycles and ${P.action.length} actions, each at ${SITE}/${DIR}/<kind>-<id>.txt, for example ${SITE}${P.cycle[0].file}`].join("\n\n") + "\n");
  return P;
}

// ---- the packs ----
function packs() {
  const D = data(), P = list(D), TODAY = new Date().toISOString().slice(0, 10);
  const out = path.join(ROOT, DIR); fs.mkdirSync(out, { recursive: true });
  for (const f of fs.readdirSync(out)) if (/\.txt$/.test(f)) fs.unlinkSync(path.join(out, f));   // rebuilt whole, so a removed item leaves no stale pack
  const one = x => String(x || "").replace(/\s+/g, " ").trim();
  const C = Object.fromEntries(D.CONSEQUENCES.map(c => [c.id, { ...c, label: one(c.label), desc: one(c.desc) }])), INST = Object.fromEntries(D.INSTITUTIONS.map(i => [i.id, i.name]));
  const head = (kind, p, url) => [`Common Shade evidence pack: ${p.name}`, `${kind} · ${url} · built ${TODAY}`,
    "Licence: CC BY 4.0. Credit Common Shade and link to beattheheat.asia; cite each figure's original source too.",
    "", "HOW TO USE THIS PACK", "Load it into a notebook tool, or give it to an assistant and ask it to answer only from this pack and to name the source behind each point. " + WARN,
    "Evidence labels used across Common Shade: known (measured in a study or set out in an official record), inferred (models and projections), uncertain (reports not yet confirmed).",
    "", "QUESTIONS TO START WITH", ...Q[kind === "Country" ? "country" : kind === "Vicious cycle" ? "cycle" : "action"](p.name).map(q => `- ${q}`), "", "CONTENT", ""];
  const srcs = [];
  const seen = new Set();   // one line per address, however many labels point at it
  const src = s => { if (s && s.url && !seen.has(s.url)) { seen.add(s.url); srcs.push(`- ${s.label || (s.by && s.title ? `${s.by}: ${s.title}` : s.title || s.by)}: ${s.url}`); } return s && s.url ? s.url : ""; };
  // the site's own text uses a plain hyphen; a sentence that already ends in a full stop gets no second one
  const write = (file, lines) => fs.writeFileSync(path.join(ROOT, file), lines.join("\n").replace(/—/g, "-").replace(/\.\.(?=\s|$)/g, ".") + "\n");
  let bytes = 0;
  for (const p of P.country) {
    const md = fs.readFileSync(path.join(ROOT, "countries", p.id, "index.md"), "utf8").replace(/^---[\s\S]*?---\n/, "");
    write(p.file, [...head("Country", p, SITE + p.page), md.trim()]);
  }
  for (const p of P.cycle) {
    srcs.length = 0; seen.clear(); const l = D.LOOPS.find(x => x.id === p.id);
    const body = [`${l.name}`, l.summary, `Evidence for the cycle as a whole: ${l.evidence}.`, "", "THE LINKS IN THE CYCLE",
      ...l.path.map((n, i) => { const c = C[n], nx = C[l.path[(i + 1) % l.path.length]]; return c ? `- ${c.label}${nx ? `, which leads to ${nx.label.toLowerCase()}` : ""}: ${c.desc}${(c.sources || []).map(s => ` [${src(s)}]`).join("")}` : `- ${n}`; }),
      "", "STUDIES BEHIND IT", ...((D.EVIDENCE[l.id] || []).map(s => `- ${s.by}: ${s.title}. ${s.finding || ""} Where: ${s.where || "not stated"}. Limit it states: ${s.limit || "not stated"}. [${src(s)}]`)),
      "", "ACTIONS THAT COULD INTERRUPT IT", ...D.LEVERS.filter(v => edgeLoops(D, v).includes(l)).map(v => `- ${v.title}: ${v.text}${(D.WATCH[v.id] || []).map(w => ` Watch for: ${w.text}${(w.sources || []).map(s => ` [${src(s)}]`).join("")}`).join("")}`)];
    write(p.file, [...head("Vicious cycle", p, SITE + p.page), ...body, "", "SOURCES", ...[...new Set(srcs)]]);
  }
  for (const p of P.action) {
    srcs.length = 0; seen.clear(); const v = D.LEVERS.find(x => x.id === p.id);
    const body = [v.title, v.text, `Who could act: ${(v.who || []).map(w => INST[w] || w).join(", ")}.`, `Over what time: ${v.when}.`, `How progress could be measured: ${v.measure}.`,
      "", "EXAMPLE", `${v.example || "None recorded yet."}${(v.exampleSources || []).map(s => ` [${src(s)}]`).join("")}`,
      ...(D.WATCH[v.id] ? ["", "WATCH FOR", ...D.WATCH[v.id].map(w => `- ${w.text}${(w.sources || []).map(s => ` [${src(s)}]`).join("")}`)] : []),
      "", "VICIOUS CYCLES IT COULD HELP INTERRUPT", ...edgeLoops(D, v).map(o => `- ${o.name}: ${o.summary}`),
      ...((v.guides || []).length ? ["", "GUIDES", ...v.guides.map(g => `- ${g.by}: ${g.title} [${src(g)}]`)] : [])];
    // an action with no example or guide of its own says so, and points to the sources of the cycles it touches
    const own = [...new Set(srcs)]; srcs.length = 0; seen.clear();
    if (!own.length) edgeLoops(D, v).forEach(o => o.path.forEach(n => (C[n] && C[n].sources || []).forEach(src)));
    write(p.file, [...head("Action", p, SITE + p.page), ...body, "", "SOURCES", ...(own.length ? own : ["- None recorded for this action yet: no example or guide is on the map for it.", "", "SOURCES FOR THE CYCLES IT COULD HELP INTERRUPT", ...[...new Set(srcs)]])]);
  }
  for (const f of fs.readdirSync(out)) bytes += fs.statSync(path.join(out, f)).size;

  // one line on the pages each pack comes from, between markers so a rebuild replaces it
  const line = (file, words, href) => { const f = path.join(ROOT, file); if (!fs.existsSync(f)) return console.warn(`packs: no page at ${file}`);
    let s = fs.readFileSync(f, "utf8").replace(/\n?\s*<!--pack-->[\s\S]*?<!--\/pack-->/, ""); const at = s.lastIndexOf("</main>"); if (at < 0) return;
    fs.writeFileSync(f, s.slice(0, at).replace(/\s*$/, "") + `\n  <!--pack--><section class="container hub" aria-label="Use with your own AI"><p class="hub-p"><b>Use this with your own AI.</b> ${words} <a href="${href}">Use Common Shade with your own AI <span aria-hidden="true">→</span></a></p></section><!--/pack-->\n  ` + s.slice(at)); };
  P.country.forEach(p => line(`countries/${p.id}/index.html`, `This snapshot is also an evidence pack: <a href="${p.file}" download>${p.name}, plain text</a>, with questions to start from.`, `/${SLUG}/#countries`));
  line("loops/index.html", "Each vicious cycle is also an evidence pack, with every link's source and questions to start from.", `/${SLUG}/#cycles`);
  line("actions/index.html", "Each action is also an evidence pack, with examples, sources and questions to start from.", `/${SLUG}/#actions`);
  console.log(`packs: ${P.country.length} countries, ${P.cycle.length} cycles, ${P.action.length} actions (${Math.round(bytes / 1024)} KB in all)`);
}
module.exports = { page, packs, list, data, TITLE, SLUG, DIR };
