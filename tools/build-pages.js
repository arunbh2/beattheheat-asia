// Builds the pages that hold the site together: the four group hubs, paths by role, State of the field,
// How Common Shade sees heat, Cite and reuse, the 404 page, and the search index. Words come from data/site and
// data/kb; build-nav.js then adds the shared header and footer. Run by build-static.js before build-nav.js.
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, ".."), SITE = "https://beattheheat.asia";
const NAV = require("./site-nav.js");
const NAVJ = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "site", "nav.json"), "utf8"));
const PATHS = NAV.PATHS;
const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const V = (fs.readFileSync(path.join(ROOT, "index.html"), "utf8").match(/styles\.css\?v=(\d+)/) || [, "1"])[1];
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, "data.js"), "utf8") + ";this.D={GLOSSARY,LOOPS,LIVE_CITIES,CITY_PROFILES,HEATWAVES,ORGANISATIONS,ORG_ROLES,SYSTEMS,EVIDENCE,LEVERS}", ctx);
const D = ctx.D;
const MONTH = new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" });

function page(slug, title, desc, body, extraHead = "") {
  const url = `${SITE}/${slug ? slug + "/" : ""}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)} · Common Shade</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="theme-color" content="#16202B">
  <link rel="canonical" href="${url}">
  <link rel="license" href="https://creativecommons.org/licenses/by/4.0/">
  <meta property="og:type" content="website"><meta property="og:site_name" content="Common Shade">
  <meta property="og:url" content="${url}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
  <meta property="og:image" content="${SITE}/images/social-share-cs.jpg"><meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400&display=swap">
  <link rel="stylesheet" href="/styles.css?v=${V}">${extraHead}
</head>
<body class="cs-pg">
  <a class="skip-link" href="#main">Skip to the content</a>
  <main id="main" tabindex="-1">
${body}
  </main>
  <footer class="wkp-foot"><div class="container"><p>Common Shade · Text: <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0<span class="visually-hidden"> (opens in a new tab)</span></a> · <a href="/sources/">All sources</a></p></div></footer>
</body>
</html>
`;
}
const write = (slug, html) => { const dir = path.join(ROOT, slug); fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, "index.html"), html); };
const hero = (k, h, p) => `<header class="pg-hero"><div class="container"><p class="eyebrow">${esc(k)}</p><h1 class="pg-h1">${h}</h1>${p ? `<p class="pg-lede">${p}</p>` : ""}</div></header>`;
const pathsFor = url => PATHS.paths.filter(p => p.stops.some(s => s.url === url)).map(p => p.short);

// ---- the four group hubs ----
for (const g of NAVJ.groups) {
  const all = [g.lead.concat([0]), ...g.items];
  const card = ([u, t, d]) => { const who = pathsFor(u); return `<li><a class="hub-card" href="${u}"><b>${esc(t)}</b><span>${esc(d)}</span>${who.length ? `<small>On the path for: ${esc(who.join(", "))}</small>` : ""}</a></li>`; };
  const onPaths = PATHS.paths.filter(p => p.stops.some(s => all.some(i => i[0] === s.url)));
  const body = `${hero(g.h, esc(g.h), esc(g.intro))}
    <section class="container hub">
      <a class="hub-lead" href="${g.lead[0]}"><span class="eyebrow">Start with</span><b>${esc(g.lead[1])}</b><span>${esc(g.lead[2])}</span><span class="hub-go">Open <span aria-hidden="true">→</span></span></a>
      <h2 class="hub-h">The core pages</h2>
      <ul class="hub-grid">${g.items.filter(i => i[3] === 1).map(card).join("")}</ul>
      ${g.items.some(i => i[3] === 2) ? `<h2 class="hub-h">Also in ${esc(g.h)}</h2><ul class="hub-grid hub-grid--quiet">${g.items.filter(i => i[3] === 2).map(card).join("")}</ul>` : ""}
      ${onPaths.length ? `<h2 class="hub-h">Paths through this group</h2><p class="hub-p">Short, guided routes for each kind of reader. Choose one, and the site points you to your next stop.</p><ul class="hub-paths">${onPaths.map(p => `<li><a href="/paths/${p.id}/"><b>${esc(p.label)}</b><span>${esc(p.card)}</span></a></li>`).join("")}</ul>` : ""}
    </section>`;
  write(g.hub.replace(/^\/|\/$/g, ""), page(g.hub.replace(/^\/|\/$/g, ""), g.h, `${g.h} on Common Shade: ${g.intro}`, body));
}

// ---- paths by role ----
write("paths", page("paths", "Paths by role", "Short, guided routes through Common Shade for funders, city teams, health workers, employers, community organisations, national governments and researchers.",
  `${hero("Paths by role", "Find your way in", "Common Shade is large on purpose. You do not need all of it. Each path is five or so stops, each answering one question your work asks. Your choice stays in this browser, and you can leave a path at any time.")}
    <section class="container hub"><ul class="hub-paths hub-paths--big">${PATHS.paths.map(p => `<li><a href="/paths/${p.id}/"><b>${esc(p.label)}</b><span>${esc(p.card)}</span><small>${p.stops.length} stops</small></a></li>`).join("")}</ul></section>`));
for (const p of PATHS.paths) {
  const stops = p.stops.map((s, i) => `<li class="path-stop"><span class="path-n">${i + 1}</span><div><h2><a href="${s.url}">${esc(s.q)}</a></h2><p>${esc(s.why)}</p>
      ${s.read.length ? `<p class="path-read"><b>Read first:</b> ${s.read.map(([a, t]) => `<a href="${s.url}${a}">${esc(t)}</a>`).join(" · ")}</p>` : ""}${s.do ? `<p class="path-read"><b>Then:</b> <a href="${s.do[0]}">${esc(s.do[1])}</a></p>` : ""}</div></li>`).join("");
  write(`paths/${p.id}`, page(`paths/${p.id}`, `${p.label}: a path through Common Shade`, `${p.card} A guided path for ${p.label.toLowerCase()}.`,
    `${hero("Paths by role", esc(p.label), esc(p.card))}
    <section class="container hub"><p class="path-start"><a class="hub-go hub-go--btn" href="${p.stops[0].url}" data-csn-setpath="${p.id}">Follow this path <span aria-hidden="true">→</span></a> <span>Your next stop will appear at the top of each page.</span></p>
      <ol class="path-list">${stops}<li class="path-stop path-stop--end"><span class="path-n">✓</span><div><h2><a href="${PATHS.end.url}">${esc(PATHS.end.q)}</a></h2><p>${esc(p.join)} ${esc(PATHS.end.why)}</p></div></li></ol>
      <p class="hub-p"><a href="/paths/">All paths</a></p></section>`));
}

// ---- State of the field: written each month from data/kb/_changes.json ----
const changesF = path.join(ROOT, "data", "kb", "_changes.json");
const changes = fs.existsSync(changesF) ? JSON.parse(fs.readFileSync(changesF, "utf8")) : [];
const BRIEFS = path.join(ROOT, "data", "site", "briefs");
const briefs = fs.existsSync(BRIEFS) ? fs.readdirSync(BRIEFS).filter(f => f.endsWith(".json")).sort().reverse().map(f => JSON.parse(fs.readFileSync(path.join(BRIEFS, f), "utf8"))) : [];
const brief = b => `<article class="sof">
      <p class="eyebrow">${esc(b.month_label)}</p><h2 class="sof-h">${esc(b.headline)}</h2>
      <div class="sof-grid">${(b.sections || []).map(s => `<section class="sof-card"><p class="sof-k">${esc(s.k)}</p><h3>${esc(s.h)}</h3><p>${esc(s.p)}</p>${s.links ? `<p class="sof-links">${s.links.map(([u, t]) => `<a href="${esc(u)}">${esc(t)}</a>`).join(" · ")}</p>` : ""}</section>`).join("")}</div>
      ${b.note ? `<p class="hub-p">${esc(b.note)}</p>` : ""}</article>`;
write("whats-new", page("whats-new", "State of the field", "A monthly note on extreme heat in South and Southeast Asia: where money moved, what the evidence added, which questions grew in importance, and what changed on Common Shade.",
  `${hero("News and evidence", "State of the field", "Each month: where money for protection moved, one opportunity the evidence supports, one question worth answering, and what changed here. Written from the knowledge base, under the same rules as everything else: careful, sourced, and clear about what is known, inferred or uncertain.")}
    <section class="container hub">
      ${briefs.length ? briefs.map(brief).join("") : `<div class="sof-empty"><p class="eyebrow">Coming next</p><h2 class="sof-h">The first brief arrives with the first monthly update</h2><p>Until then, the latest additions are listed below.</p></div>`}
      <h2 class="hub-h">What changed in the knowledge base</h2>
      ${changes.length ? `<ul class="sof-log">${changes.map(c => `<li><b>${esc(c.month)}</b>: ${c.published.length} new or updated ${c.published.length === 1 ? "record" : "records"}${c.held ? `, ${c.held} held back for checking` : ""}. ${c.published.slice(0, 6).map(r => esc(r.title)).join("; ")}${c.published.length > 6 ? "…" : ""}</li>`).join("")}</ul>` : `<p class="hub-p">No monthly updates yet. Records will appear here as they pass the site’s seven checks.</p>`}
    </section>`));

// ---- How Common Shade sees heat ----
const IDEAS = [
  ["Heat is a system, not a single hazard", "One hot night costs sleep; lost sleep costs a shift; a lost shift costs a repayment. The map follows these links, so protection can be aimed where a cycle breaks.", "/#explore", "The map"],
  ["Protection is held up together", "A shaded rest point needs land, water, someone to open it and money to keep it going, and each belongs to a different body. Protection reaches people only when every part holds.", "/together/", "Make it work together"],
  ["The missing middle", "The damage of heat is widely reported. The question asked less often is how protection is organised, paid for and kept going: who pays, who decides, who checks.", "/how-heat-is-reported/", "How heat is reported"],
  ["Known, inferred, uncertain", "Every claim says what kind of evidence stands behind it. Measured and official findings are known; models and projections are inferred; reports not yet confirmed are uncertain.", "/sources/", "Sources and references"],
  ["Built together, open to correction", "Common Shade is built with the people who use it. When something here is wrong, unfair or unclear, we say sorry, correct it in the open and keep a record of what changed.", "/corrections/", "Corrections"],
  ["A gap is a task to solve together", "Where the research found nothing, the site says so plainly. A gap describes what we found, never a fault of any country, city or organisation.", "/heat-network/", "The heat network"],
];
const STANDARDS = [
  ["Every claim is sourced", "Each figure links to the publication it comes from, and new sources keep an archived copy, so a claim can be checked even if a page moves."],
  ["Evidence is labelled honestly", "Projections are never presented as facts. Where reports differ, the site shows both and explains why."],
  ["A careful, diplomatic voice", "No blame, no political positions, no ranking of countries, cities or organisations, and no individuals named in the site’s own text."],
  ["A humble voice", "The site describes what helps, what it depends on and who could act. It does not instruct anyone: the people closest to the heat know their places best."],
  ["Listing is not endorsement", "Organisations, businesses and funders appear because of their published work, not as partners, and never in order of merit."],
  ["Checked before publishing", "New research passes seven checks before it appears: structure, sourcing, evidence, tone, a reviewer’s note, consistency with what is already published, and a test of every page."],
  ["Kept current, with history", "The knowledge base is updated monthly. Older figures are marked as superseded, not deleted, so changes can be traced."],
];
write("approach", page("approach", "How Common Shade sees heat", "The ideas behind Common Shade, and the standards every page follows: sourced, honest about evidence, careful in tone, and kept current.",
  `${hero("News and evidence", "How Common Shade sees heat", "A shared map for everyone working to protect people from extreme heat in South and Southeast Asia. These are the ideas it is built on, and the standards it holds itself to.")}
    <section class="container hub">
      <h2 class="hub-h">Six ideas</h2>
      <ol class="idea-list">${IDEAS.map(([h, p, u, t], i) => `<li><span class="path-n">${i + 1}</span><div><h3>${esc(h)}</h3><p>${esc(p)}</p><p class="path-read"><a href="${u}">${esc(t)} <span aria-hidden="true">→</span></a></p></div></li>`).join("")}</ol>
      <h2 class="hub-h" id="standards">How we check facts</h2>
      <ul class="hub-grid hub-grid--plain">${STANDARDS.map(([h, p]) => `<li class="std"><b>${esc(h)}</b><span>${esc(p)}</span></li>`).join("")}</ul>
      <h2 class="hub-h">An open collaborative</h2>
      <p class="hub-p">Common Shade is free to use, share and adapt under CC BY 4.0. It grows with the people who use it: corrections, studies, plans and data are welcome, and contributions are credited. <a href="/join/">Help build Common Shade</a> · <a href="/cite/">Cite and reuse</a></p>
    </section>`));

// ---- Evidence map: how sure we are, cycle by cycle; where evidence is stronger than the funding we traced; the learning agenda ----
{
  const RS = path.join(ROOT, "research", "2026-10"), RJ = f => JSON.parse(fs.readFileSync(path.join(RS, f), "utf8"));
  const LSTAT = fs.existsSync(path.join(RS, "link-status.json")) ? RJ("link-status.json") : {};
  const ok = u => u && LSTAT[u] !== "FAIL";
  // grades of evidence, from each study's own description of itself
  const GRADES = [["peer", "Peer-reviewed", /peer-reviewed/i], ["model", "Modelled or projected", /projection|modelling|model|estimate/i], ["official", "Official and agency", /agency|government|commission/i],
    ["other", "Other studies and reports", /survey|working paper|research|investigation|institute|industry|university/i], ["news", "News reports", /news|press/i]];
  const gradeOf = t => { const peer = /peer-reviewed/i.test(t) && !/modelling/i.test(t); if (peer) return "peer"; if (/reported by the press|news/i.test(t)) return "news"; const g = GRADES.slice(1).find(([, , re]) => re.test(t)); return g ? g[0] : "other"; };
  const ASIA = /India|Bangladesh|Nepal|Pakistan|Sri Lanka|Thailand|Bangkok|Indonesia|Jakarta|Philippines|Los Baños|Viet|Cambodia|Malaysia|Singapore|Ahmedabad|Delhi|Dhaka|Myanmar|Lao|Asia/i;
  const EVS = D.EVIDENCE, LV = D.LEVERS, LQ = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "site", "learning.json"), "utf8")).questions;
  const cyc = D.LOOPS.map(l => { const st = (EVS[l.id] || []).map(s => ({ ...s, g: gradeOf(s.type), asia: ASIA.test(s.where || "") }));
    return { l, st, peer: st.filter(s => s.g === "peer").length, asia: st.filter(s => s.asia).length, q: LQ.filter(q => q.loop === l.id) }; })
    .sort((a, b) => (a.l.evidence === "emerging" ? 0 : 1) - (b.l.evidence === "emerging" ? 0 : 1) || a.peer + a.asia - (b.peer + b.asia));
  const nStudies = cyc.reduce((s, c) => s + c.st.length, 0), nEmerging = cyc.filter(c => c.l.evidence === "emerging").length;
  // solutions and their best evidence, and traced funding, per lever
  const RANKS = ["evaluated", "measured", "guidance", "reported", "test", "concept"];
  const SOLS = [["passive_solutions.json", "passive_solutions"], ["active_solutions.json", "active_solutions"], ["policy_and_finance_solutions.json", "policy_and_finance_solutions"]]
    .flatMap(([f, k]) => { const j = RJ(f); return j[k] || []; });
  const DEALS = RJ("economy/deals.json");
  const bestOf = s => { const st = [...(s.evidence || []).filter(e => e.source && ok(e.source.url)).map(e => e.status), ...(s.examples || []).map(e => e.status)]; return RANKS.find(r => st.includes(r)) || ""; };
  const lev = LV.map(v => { const ss = SOLS.filter(s => (s.levers || []).includes(v.id)); return { v, sols: ss.length, strong: ss.filter(s => /evaluated|measured/.test(bestOf(s))).length, money: DEALS.filter(d => (d.levers || []).includes(v.id)).length }; });
  const shown = lev.filter(x => x.sols || x.money).sort((a, b) => b.strong - a.strong || a.money - b.money), unseen = lev.filter(x => !x.sols && !x.money);
  const gap = x => x.strong >= 3 && x.money <= 1;
  const maxS = Math.max(...shown.map(x => x.strong)), maxM = Math.max(...shown.map(x => x.money));
  const square = s => `<a class="evm-sq evm-sq--${s.g}"${ok(s.url) ? ` href="${esc(s.url)}" target="_blank" rel="noopener"` : ""} title="${esc(s.type + " · " + (s.where || ""))}"><span class="visually-hidden">${esc(s.type)}, ${esc(s.where || "")}</span></a>`;
  write("evidence-map", page("evidence-map", "Evidence map", `How sure we are, cycle by cycle: ${nStudies} studies graded by kind, where evidence looks stronger than the funding we traced, and ${LQ.length} questions nobody has answered yet.`,
    `${hero("News and evidence", "How sure are we?", "A map of what the evidence shows firmly, what it suggests, and what nobody has measured yet. It ranks our knowledge, never any country, city or organisation.")}
    <section class="container hub">
      <nav class="sol-jump" aria-label="On this page"><a href="#cycles">Cycle by cycle</a> · <a href="#stronger">Stronger evidence, little funding traced</a> · <a href="#questions">Questions nobody has answered yet</a> · <a href="#method">How we graded</a></nav>
      <h2 class="hub-h" id="cycles">Cycle by cycle</h2>
      <p class="hub-p">${D.LOOPS.length} vicious cycles, ${nStudies} studies. ${nEmerging} cycles rest on evidence that is still emerging; they come first. Each square is one study, coloured by its kind; select a cycle to see every study and the limits it states.</p>
      <ul class="evm-key" aria-label="Kinds of evidence">${GRADES.map(([g, n]) => `<li><i class="evm-sq evm-sq--${g}"></i>${esc(n)}</li>`).join("")}<li><i class="evm-asia">A</i>From South or Southeast Asia</li></ul>
      <div class="evm-rows">${cyc.map(c => `<details class="evm-row" id="ev-${c.l.id}"><summary>
          <span class="evm-name">${esc(c.l.name)}</span><span class="evm-chip evm-chip--${c.l.evidence}">${c.l.evidence === "established" ? "Well established" : "Evidence emerging"}</span>
          <span class="evm-sqs">${c.st.map(s => `<i class="evm-sq evm-sq--${s.g}">${s.asia ? "A" : ""}</i>`).join("")}</span>
          <span class="evm-meta">${c.st.length} ${c.st.length === 1 ? "study" : "studies"} · ${c.peer} peer-reviewed · ${c.asia} from the region</span></summary>
        <div class="evm-body"><p>${esc(c.l.summary)}</p><ul class="evm-studies">${c.st.map(s => `<li><span class="evm-g evm-g--${s.g}">${esc(GRADES.find(g => g[0] === s.g)[1])}</span> <b>${ok(s.url) ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>` : esc(s.title)}</b> <span class="sol-note">${esc(s.by)} · ${esc(s.where || "")} · ${esc(s.scale || "")}</span><br><span class="evm-limit">Its limit: ${esc(s.limit || "")}</span></li>`).join("")}</ul>
          ${c.q.length ? `<p class="evm-qlink">Open question: <a href="#${c.q[0].id}">${esc(c.q[0].q)}</a></p>` : ""}<p class="path-read"><a href="/#loop-${c.l.id}">See this cycle on the map <span aria-hidden="true">→</span></a></p></div></details>`).join("")}</div>

      <h2 class="hub-h" id="stronger">Stronger evidence, little funding traced</h2>
      <p class="hub-p">For each action that breaks cycles: on the left, how many solutions in our library have been measured in a study or independently evaluated; on the right, how many pieces of funding we traced. Our funding trace covers public announcements, mostly investment in businesses; public budgets, which pay for much of this work, are not in it. So a short bar on the right means <i>we have not traced</i> funding, not that none exists.</p>
      <div class="evm-fly" role="table" aria-label="Measured or evaluated solutions, and pieces of funding traced, for each action">
        <div class="evm-fly-h" role="row"><span role="columnheader">Measured or evaluated solutions</span><span role="columnheader">Action</span><span role="columnheader">Pieces of funding traced</span></div>
        ${shown.map(x => `<div class="evm-fly-r${gap(x) ? " is-gap" : ""}" role="row"><span class="evm-fly-l" role="cell"><b>${x.strong}</b><i style="width:${(x.strong / maxS * 100).toFixed(1)}%"></i></span><span class="evm-fly-n" role="cell">${esc(x.v.title)}${gap(x) ? `<em>Stronger evidence, little funding traced</em>` : ""}</span><span class="evm-fly-rt" role="cell"><i style="width:${(x.money / maxM * 100).toFixed(1)}%"></i><b>${x.money}</b></span></div>`).join("")}
      </div>
      <p class="sol-note">Not shown, because our library has no solution or funding for them yet: ${unseen.map(x => esc(x.v.title)).join(", ")}. <a href="/solutions/">The solutions library</a> · <a href="/heat-economy/flows/">Follow the money</a></p>

      <h2 class="hub-h" id="questions">Questions nobody has answered yet</h2>
      <p class="hub-p">A learning agenda, drawn from the limits the studies above state about themselves. Each question is sized so that one well-designed study could move it. The suggested approach and scale are ours, offered for discussion; researchers and funders closer to each place will know better.</p>
      <ol class="evm-qs">${LQ.filter(q => q.status === "open").map(q => `<li class="evm-q" id="${esc(q.id)}"><p class="evm-q-k">${esc((D.LOOPS.find(l => l.id === q.loop) || {}).name || "")} · <span class="evm-chip evm-chip--emerging">Uncertain</span></p><h3>${esc(q.q)}</h3>
          <dl><dt>What we have</dt><dd>${esc(q.have)} <a href="#ev-${esc(q.loop)}">The studies</a></dd><dt>What could answer it <span class="sol-note">(our suggestion)</span></dt><dd>${esc(q.could)}</dd><dt>Scale</dt><dd>${esc(q.scale)}</dd></dl></li>`).join("")}</ol>
      <p class="hub-p">Know of a study that answers one of these, or a better question? <a href="/corrections/">Tell us</a>, and we will add it with credit.</p>

      <h2 class="hub-h" id="method">How we graded</h2>
      <ul class="hub-grid hub-grid--plain">
        <li class="std"><b>From each study’s own description</b><span>Each study is grouped by how it describes itself: peer-reviewed, official or agency, modelled or projected, other studies and reports, or news. A model is never counted as a measurement.</span></li>
        <li class="std"><b>Well established or evidence emerging</b><span>A well-established cycle has been widely documented as a whole. Where evidence is emerging, each link is evidenced, but the full cycle has been studied less.</span></li>
        <li class="std"><b>A ranking of knowledge only</b><span>Thin evidence describes what research has not yet reached. It says nothing about any country, city or organisation.</span></li>
        <li class="std"><b>Open to correction</b><span>If a study is missing or graded wrongly, <a href="/corrections/">please tell us</a>.</span></li>
      </ul>
    </section>`));
}

// ---- Corrections: data/site/corrections.json plus any knowledge-base record that carries a correction note ----
const CORR = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "site", "corrections.json"), "utf8")).entries;
const KBD = path.join(ROOT, "data", "kb");
const kbCorr = fs.existsSync(KBD) ? fs.readdirSync(KBD).filter(f => f.endsWith(".json") && !f.startsWith("_"))
  .flatMap(f => JSON.parse(fs.readFileSync(path.join(KBD, f), "utf8"))).filter(r => r.correction)
  .map(r => ({ date: r.changed || r.added, where: [r.title], what: r.correction, change: r.summary, sorry: r.sorry || "" })) : [];
const allCorr = [...CORR, ...kbCorr].sort((a, b) => String(b.date).localeCompare(String(a.date)));
const fmtDate = d => /^\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : /^\d{4}-\d{2}$/.test(d) ? new Date(d + "-01T00:00:00Z").toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }) : esc(d);
write("corrections", page("corrections", "Corrections", "Common Shade is built together. When something here is wrong, unfair or unclear, we say sorry, correct it in the open and record what changed.",
  `${hero("News and evidence", "Corrections", "Common Shade is built together, and it will sometimes be wrong. When it is, we say sorry, correct it in the open, and keep the record here.")}
    <section class="container hub">
      <ol class="corr-steps">
        <li><span class="path-n">1</span><div><h3>Tell us</h3><p>A wrong figure, an unfair description, a broken link, a missing voice or a better source. Anyone can raise it, and no correction is too small.</p></div></li>
        <li><span class="path-n">2</span><div><h3>We check it with you</h3><p>We look at the evidence together, and where we got it wrong, we say so plainly.</p></div></li>
        <li><span class="path-n">3</span><div><h3>We correct it in the open</h3><p>The page changes, the change is listed below, and older figures are kept as superseded, so anyone can trace what changed and why.</p></div></li>
      </ol>
      <p class="corr-cta"><a class="hub-btn" href="/join/#join-form">Suggest a correction <span aria-hidden="true">→</span></a></p>
      <h2 class="hub-h" id="log">What we have corrected</h2>
      ${allCorr.length ? `<ol class="corr-log">${allCorr.map(c => `<li class="corr"><p class="corr-d">${fmtDate(c.date)} · ${(c.where || []).map(esc).join(", ")}</p><p><b>What was wrong.</b> ${esc(c.what)}</p><p><b>What changed.</b> ${esc(c.change)}</p>${c.sorry ? `<p class="corr-sorry">${esc(c.sorry)}</p>` : ""}</li>`).join("")}</ol>` : `<p class="hub-p">No corrections yet.</p>`}
    </section>`));

// ---- Cite and reuse ----
const DATA = [["LOOPS", "The 21 vicious cycles"], ["CONSEQUENCES", "The 87 consequences of heat"], ["LINKS", "Every link between them"], ["LEVERS", "The 29 actions that break cycles"], ["CITY_PROFILES", "Twelve city profiles"], ["HEATWAVES", "Ten heatwaves, 1998 to 2026"], ["ORGANISATIONS", "The heat network’s organisations"], ["GLOSSARY", "The glossary"]];
write("cite", page("cite", "Cite and reuse", "How to cite Common Shade and reuse its content and data, free under CC BY 4.0.",
  `${hero("News and evidence", "Cite and reuse", "Everything on Common Shade is free to use, share and adapt under CC BY 4.0, with credit. Here is how to cite it, and where to find the data.")}
    <section class="container hub">
      <h2 class="hub-h">How to cite</h2>
      <p class="hub-p">Every page carries a ready citation at its foot. For the site as a whole:</p>
      <blockquote class="cite-box">Common Shade. <i>Extreme heat in South and Southeast Asia: a shared map of consequences, cycles and protection.</i> beattheheat.asia. Updated ${esc(MONTH)}. CC BY 4.0.</blockquote>
      <p class="hub-p">When you cite a figure, please cite its original source too: each one is linked where it appears, and listed in <a href="/sources/">Sources and references</a>.</p>
      <h2 class="hub-h">The data</h2>
      <p class="hub-p">The content behind the map is open, as plain JSON files, one for each part. They are updated as the knowledge base grows.</p>
      <ul class="hub-grid hub-grid--quiet">${DATA.map(([f, t]) => `<li><a class="hub-card" href="/data/core/${f}.json"><b>${esc(t)}</b><span>data/core/${f}.json</span></a></li>`).join("")}</ul>
      <p class="hub-p">The rules every record follows are in <a href="/data/schema/records.json">data/schema/records.json</a>, and the full text of the site is in <a href="/llms-full.txt">one plain-text file</a>.</p>
      <h2 class="hub-h">Films and images</h2>
      <p class="hub-p">The films and drawings may be shared and shown with credit to Common Shade. The narration voice is LibriTTS (CC BY 4.0), via Piper.</p>
    </section>`));

// ---- 404 ----
fs.writeFileSync(path.join(ROOT, "404.html"), page("", "Page not found", "This page could not be found on Common Shade.",
  `${hero("Not found", "This page has moved, or never was", "Try search, choose a path by role, or start from one of the four groups.")}
    <section class="container hub">
      <p class="path-start"><button type="button" class="hub-go hub-go--btn" data-csn-search>Search the site</button> <button type="button" class="hub-go hub-go--btn hub-go--quiet" data-csn-paths>Choose a path by role</button></p>
      <ul class="hub-paths">${NAVJ.groups.map(g => `<li><a href="${g.hub}"><b>${esc(g.h)}</b><span>${esc(g.intro)}</span></a></li>`).join("")}</ul>
    </section>`).replace('<link rel="canonical" href="https://beattheheat.asia/">', ""));

// ---- the search index: pages, places, cycles, glossary terms, heatwaves and organisations ----
function searchIndex() {
  const out = [], seen = new Set();
  const add = (u, t, d, g, w = 0, k = "") => { if (seen.has(u + t)) return; seen.add(u + t); out.push({ u, t, d: String(d || "").slice(0, 140), g, w, k }); };
  const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).forEach(e => {
    if (e.isDirectory() && !/^(node_modules|\.git|research|tools|data|media|images|feeds|print|docs)$/.test(e.name)) walk(path.join(dir, e.name));
    else if (e.name === "index.html") {
      const s = fs.readFileSync(path.join(dir, e.name), "utf8"), u = "/" + path.relative(ROOT, dir).split(path.sep).join("/") + (dir === ROOT ? "" : "/");
      const t = (s.match(/<title>([\s\S]*?)<\/title>/) || [, ""])[1].replace(/\s*[·|]\s*Common Shade\s*$/, "").replace(/&amp;/g, "&").trim();
      const d = (s.match(/name="description" content="([^"]*)"/) || [, ""])[1].replace(/&amp;/g, "&").replace(/&quot;/g, '"');
      const g = NAV.groupOf(u.replace(/^\/$/, "/"));
      add(u.replace(/\/+/g, "/"), t, d, "Pages", 3, g ? g.h : "");
    } });
  walk(ROOT);
  D.LIVE_CITIES.forEach(c => { const p = D.CITY_PROFILES.find(x => x.id === c.id); add(`/cities/${c.id}/`, `${c.name}, ${c.country}`, p ? p.tagline : "", "Places", 2.5, "city"); });
  D.LOOPS.forEach(l => add(`/loops/#${l.id}`, l.name, l.summary || l.desc || "", "Vicious cycles", 2, "cycle loop"));
  D.GLOSSARY.forEach(g => add(`/glossary/#${g.id}`, g.term, g.text, "Glossary", 2, "term definition"));
  D.HEATWAVES.forEach(h => add(`/heatwaves/#${h.id}`, h.title || h.place, `${h.when || ""} ${h.place || ""}`.trim(), "Heatwaves", 1.5, "heatwave"));
  D.ORGANISATIONS.forEach(o => add(`/heat-network/#${o.role || ""}`, o.name, o.does || "", "Organisations", 1, "organisation"));
  NAVJ.groups.forEach(g => add(g.hub, g.h, g.intro, "Pages", 3.5));
  PATHS.paths.forEach(p => add(`/paths/${p.id}/`, `Path: ${p.label}`, p.card, "Paths by role", 3, "path role"));
  fs.writeFileSync(path.join(ROOT, "search-index.json"), JSON.stringify(out));
  return out.length;
}
const n = searchIndex();
console.log(`pages: 4 hubs, ${PATHS.paths.length + 1} path pages, State of the field, approach, cite, 404; search index of ${n} entries`);
