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
vm.runInContext(fs.readFileSync(path.join(ROOT, "data.js"), "utf8") + ";this.D={GLOSSARY,LOOPS,LIVE_CITIES,CITY_PROFILES,HEATWAVES,ORGANISATIONS,ORG_ROLES,SYSTEMS,EVIDENCE,LEVERS,PACKAGES,INSTITUTIONS,ACTION_SETTINGS,ACTION_HORIZONS,EVIDENCE_STATUS,LOOP_GROUPS,CITY_HAP,LIVE_NOTE}", ctx);
const D = ctx.D;
// published knowledge-base records (data/kb), so each month's verified research reaches the pages that draw it
const KB_DIR = path.join(ROOT, "data", "kb");
const KB = fs.existsSync(KB_DIR) ? fs.readdirSync(KB_DIR).filter(f => f.endsWith(".json") && !f.startsWith("_")).flatMap(f => JSON.parse(fs.readFileSync(path.join(KB_DIR, f), "utf8"))).filter(r => r.status === "current") : [];
const KBID = Object.fromEntries(fs.existsSync(KB_DIR) ? fs.readdirSync(KB_DIR).filter(f => f.endsWith(".json") && !f.startsWith("_")).flatMap(f => JSON.parse(fs.readFileSync(path.join(KB_DIR, f), "utf8"))).map(r => [r.id, r]) : []);
const srcOf = r => { const x = KBID[(r.sources || [])[0]]; return x ? [x.publisher ? `${x.publisher}: ${x.title}` : x.title, x.url] : null; };
const PLACE = p => /^country-/.test(p) ? p.slice(8).split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ").replace("Viet Nam", "Viet Nam") : { "region-asia": "Asia", "region-south-asia": "South Asia", "region-southeast-asia": "Southeast Asia", "region-global": "Global" }[p] || p.replace(/^city-/, "");
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

const PEOPLE = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "site", "people.json"), "utf8"));
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
  const EVS = D.EVIDENCE, LV = D.LEVERS, LQ = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "site", "learning.json"), "utf8")).questions
    .concat(KB.filter(r => r.type === "question").map(r => ({ id: r.id, loop: (r.cycles || [])[0] || "", status: "open", q: r.question, have: r.summary, could: r.would_answer_it, scale: r.scale || "To be sized" })));
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
        <div class="evm-body"><p>${esc(c.l.summary)}</p>${(x => x ? `<figure class="cs-person"><svg viewBox="0 0 56 56" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 14 Q28 2 50 14" stroke="#F26430" stroke-width="3.4"/><circle cx="28" cy="22" r="5.5"/><path d="M28 27.5 V40 M28 40 L22 52 M28 40 L34 52 M28 31 L20 37 M28 31 L36 37"/></g></svg><figcaption><b>${esc(x.who)}</b><p>${esc(x.story)}</p><small>${esc(PEOPLE.note)}</small></figcaption></figure>` : "")(PEOPLE.people.find(q => q.loop === c.l.id))}<ul class="evm-studies">${c.st.map(s => `<li><span class="evm-g evm-g--${s.g}">${esc(GRADES.find(g => g[0] === s.g)[1])}</span> <b>${ok(s.url) ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>` : esc(s.title)}</b> <span class="sol-note">${esc(s.by)} · ${esc(s.where || "")} · ${esc(s.scale || "")}</span><br><span class="evm-limit">Its limit: ${esc(s.limit || "")}</span></li>`).join("")}</ul>
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

// ---- Who holds it up: for each action, the four roles protection depends on (permits, pays, delivers, checks) ----
{
  const ROLE4 = [["permits", "Permits", "Owns the site, sets the rule or gives the approval."], ["pays", "Pays", "Funds it at the start, and keeps paying while it runs."],
    ["delivers", "Delivers", "Runs it day to day, where people are."], ["checks", "Checks", "Measures, reviews and advises, so it keeps working and reaches people."]];
  // our reading of the parts each kind of body usually plays; real arrangements differ from place to place
  const TYPICAL = { nat: ["permits", "pays"], city: ["permits", "pays", "delivers"], health: ["permits", "delivers"], met: ["delivers"], employers: ["pays", "delivers"], workers: ["checks"],
    utilities: ["permits", "delivers"], water: ["delivers"], agri: ["delivers"], schools: ["permits", "delivers"], insurers: ["permits", "pays"], funders: ["pays"], community: ["delivers", "checks"], intl: ["checks"] };
  // the part each group of organisations in the heat network plays, from the kind of work it publishes
  const GROUP_ROLE = { asia: "permits", funders: "pays", finance: "pays", lending: "pays", ground: "delivers", cooling: "delivers", research: "checks", global: "checks" };
  const PK = D.PACKAGES;
  const LV = D.LEVERS.map(l => ({ id: l.id, t: l.title, x: l.text, who: l.who, pk: (PK.find(p => p.levers.includes(l.id)) || {}).id || "other" }));
  const ORGS = D.ORGANISATIONS.map(o => ({ id: o.id, n: o.name, u: o.url, d: o.does, g: o.role, r: GROUP_ROLE[o.role] || "checks", lv: o.levers }));
  const INST = Object.fromEntries(D.INSTITUTIONS.map(i => [i.id, [i.name, i.desc]]));
  const GROUPS = Object.fromEntries(D.ORG_ROLES.map(r => [r.id, r.name]));
  const DATA = { roles: ROLE4, typical: TYPICAL, levers: LV, orgs: ORGS, inst: INST, groups: GROUPS, packages: [...PK.map(p => [p.id, p.title]), ["other", "Other actions"]] };
  write("who-holds-it", page("who-holds-it", "Who holds it up", "For protection from heat to reach people, someone has to permit it, pay for it, deliver it and check it. Choose an action to see the kinds of body involved and the organisations already at work.",
    `${hero("Act", "Who holds it up", "For protection to reach people, someone has to permit it, pay for it, deliver it and check it. Choose an action to see who could hold each part, and where we have not yet found anyone.")}
    <section class="container hub who">
      <p class="who-disc">The organisations shown are those whose published work relates to each action. Inclusion does not imply partnership, affiliation or endorsement, and nothing here judges how well anyone does their part.</p>
      <div class="who-grid">
        <nav class="who-pick" aria-label="Choose an action"><label class="who-sel"><span class="fl-lbl">Choose an action</span><select data-who-select></select></label><div class="who-list" data-who-list></div></nav>
        <div class="who-main" data-who-main aria-live="polite"></div>
        <aside class="who-side" data-who-side aria-live="polite"></aside>
      </div>
      <noscript><p class="hub-p">This view needs JavaScript. <a href="/heat-network/">The heat network</a> lists every organisation as text.</p></noscript>
      <h2 class="hub-h">How to read this</h2>
      <ul class="hub-grid hub-grid--plain">
        <li class="std"><b>Kinds of body: our reading</b><span>Which kinds of body usually permit, pay, deliver and check is our reading of the solutions library and worked plans. Real arrangements differ from place to place.</span></li>
        <li class="std"><b>Named organisations: published work</b><span>Each organisation is placed by the kind of work it publishes, and links to it. A gap means we have not found anyone yet, not that nobody is doing it.</span></li>
        <li class="std"><b>No scores, no comparisons</b><span>Counts describe our research, not anyone’s performance. Organisations are never ranked against each other.</span></li>
        <li class="std"><b>Help fill the gaps</b><span>If you hold one of these parts, or know who does, <a href="/corrections/">please tell us</a> and we will add it with credit.</span></li>
      </ul>
      <p class="hub-p"><a href="/together/">Make it work together</a>: agree who does what in one place · <a href="/heat-network/">The heat network</a>: every organisation · <a href="/worked-plans/">Worked plans</a></p>
    </section>
    <script>window.WHO=${JSON.stringify(DATA).replace(/</g, "\\u003c")};</script><script src="/who-holds-it/holds.js?v=${V}" defer></script>`));
}

// ---- Build protection: assemble actions for one place, or sketch a portfolio across places ----
{
  const edgeLoops = lv => { const l = D.LEVERS.find(x => x.id === lv); return l ? D.LOOPS.filter(o => o.path.some((n, i) => n === l.edge[0] && o.path[(i + 1) % o.path.length] === l.edge[1])).map(o => o.id) : []; };
  const SETS = D.ACTION_SETTINGS.map(s => ({ id: s.id, n: s.name, sh: s.short, i: s.intro, start: (s.problems || []).map(p => (p.cards || [])[0]).filter(Boolean) }));
  const CARDS = D.ACTION_SETTINGS.flatMap(s => s.cards.map(c => ({ id: s.id + ":" + c.id, s: s.id, t: c.title, w: c.what, p: c.protects, who: c.who, run: c.running, stop: c.stops, need: c.worksIf,
    lv: c.lever, ev: c.status, h: c.horizon, loops: edgeLoops(c.lever), src: c.evidence && c.evidence.source ? [c.evidence.source.label, c.evidence.source.url] : null, et: c.evidence ? c.evidence.text : "" })));
  const DATA = { sets: SETS, cards: CARDS, loops: D.LOOPS.map(l => ({ id: l.id, n: l.name, g: l.group })), groups: D.LOOP_GROUPS.map(g => [g.id, g.name]),
    inst: Object.fromEntries(D.INSTITUTIONS.map(i => [i.id, i.name])), ev: Object.fromEntries(Object.entries(D.EVIDENCE_STATUS).map(([k, v]) => [k, [v.name, v.text]])),
    hz: D.ACTION_HORIZONS.map(h => [h.id, h.name]), levers: Object.fromEntries(D.LEVERS.map(l => [l.id, l.title])) };
  write("build", page("build", "Build protection", "Choose a place, add practical actions, and see which cycles of heat they could help interrupt, what they depend on, who acts and what they cannot fix. Or sketch a portfolio across places.",
    `${hero("Act", "Build protection", "Choose a place, add actions, and see which cycles they could help interrupt, what each depends on, and what they leave untouched. Nothing here is a recommendation: it is a way to think a package through, together.")}
    <section class="container hub bp">
      <div class="bp-tabs" role="tablist" aria-label="Mode"><button type="button" role="tab" aria-selected="true" data-mode="place">Build for one place</button><button type="button" role="tab" aria-selected="false" data-mode="folio">Sketch a portfolio</button></div>
      <div data-bp-app aria-live="polite"></div>
      <noscript><p class="hub-p">This builder needs JavaScript. Every action is also on <a href="/practical-actions/">Practical actions, as text</a>.</p></noscript>
      <h2 class="hub-h">How to read this</h2>
      <ul class="hub-grid hub-grid--plain">
        <li class="std"><b>Could help interrupt, never will fix</b><span>A cycle turns green when an action works on one of its links. Whether it breaks in a real place depends on everything listed under what it depends on.</span></li>
        <li class="std"><b>Evidence shown for every piece</b><span>Each action carries its evidence level, from design concept to independently evaluated, with its source.</span></li>
        <li class="std"><b>No recommendations</b><span>The portfolio view shows balance and blind spots. It never recommends an organisation or a grantee.</span></li>
        <li class="std"><b>Saved in the address</b><span>Your package lives in the page address, so you can bookmark it or share it. Nothing is sent to us.</span></li>
      </ul>
      <p class="hub-p"><a href="/practical/">Practical actions</a> · <a href="/who-holds-it/">Who holds it up</a> · <a href="/together/">Make it work together</a> · <a href="/plan/">Plan a response</a></p>
    </section>
    <script>window.BP=${JSON.stringify(DATA).replace(/</g, "\\u003c")};</script><script src="/build/bp.js?v=${V}" defer></script>`));
}

// ---- Atlas: where and when heat has changed what places do ----
{
  // approximate centres for each heatwave on the drawn map, and how wide an area it covered (map units)
  const HWPOS = { odisha1998: [20.5, 85.0, 3], ap2003: [16.5, 80.0, 3], ahmedabad2010: [23.0, 72.6, 2], southasia2015: [24.5, 74.0, 7], sea2016: [15.5, 101.5, 6],
    southasia2022: [28.0, 73.5, 7], asia2023: [20.0, 95.0, 9], asia2024: [18.0, 92.0, 12], india2024: [27.0, 78.5, 5], southasia2026: [27.0, 73.0, 7] };
  const KINDMAP = { plan: "plan", law: "rule", rule: "rule", role: "role", programme: "programme", finance: "programme" };
  const MS = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "site", "milestones.json"), "utf8")).milestones
    .concat(KB.filter(r => r.type === "milestone" && r.lat != null && r.lon != null && KINDMAP[r.kind]).map(r => ({ id: r.id, year: +String(r.date).slice(0, 4), kind: KINDMAP[r.kind],
      place: (r.places || []).map(PLACE).join(", "), lat: r.lat, lon: r.lon, title: r.title, text: r.summary, source: srcOf(r), link: ["/whats-new/", "What changed this month"] })));
  const HW = D.HEATWAVES.filter(h => HWPOS[h.id]).map(h => ({ id: h.id, y: h.year, when: h.when, place: h.place, t: h.title, toll: h.toll, what: h.what, changed: h.changed,
    src: h.sources && h.sources[0] ? [h.sources[0].label, h.sources[0].url] : null, lat: HWPOS[h.id][0], lon: HWPOS[h.id][1], r: HWPOS[h.id][2] }));
  const missing = D.HEATWAVES.filter(h => !HWPOS[h.id]).map(h => h.id);
  if (missing.length) throw new Error("atlas: no map position for heatwave " + missing.join(", "));
  const CITIES = D.LIVE_CITIES.map(c => { const p = D.CITY_PROFILES.find(x => x.id === c.id) || { hap: {} }; return { id: c.id, n: c.name, c: c.country, lat: c.lat, lon: c.lon, st: p.hap.status, tx: p.hap.text, warn: c.warn ? [c.warn.label, c.warn.url] : null }; });
  const ATL = { hw: HW, ms: MS, cities: CITIES, hap: D.CITY_HAP, note: D.LIVE_NOTE, y0: 1998, y1: Math.max(...HW.map(h => h.y), ...MS.map(m => m.year)) };
  write("atlas", page("atlas", "Atlas of Asia's heat", "Where, and when, heat has changed what places do: ten heatwaves since 1998 and the plans, rules and roles that followed, on a drawn map of South and Southeast Asia.",
    `${hero("Understand heat", "Atlas of Asia’s heat", "Where, and when, heat has changed what places do. Drag the timeline, or press play, to watch heatwaves arrive and the plans that came after.")}
    <section class="container hub atl" data-atl>
      <div class="atl-layers" role="group" aria-label="Show on the map">
        <label><input type="checkbox" data-layer="hw" checked> <i class="atl-k atl-k--hw"></i>Heatwaves</label>
        <label><input type="checkbox" data-layer="ms" checked> <i class="atl-k atl-k--ms"></i>Plans, rules and roles</label>
        <label><input type="checkbox" data-layer="city"> <i class="atl-k atl-k--city"></i>City heat plans today</label>
        <label><input type="checkbox" data-layer="live"> <i class="atl-k atl-k--live"></i>Heat right now</label>
      </div>
      <div class="atl-grid">
        <div class="atl-mapwrap"><div class="atl-map" data-atl-map><img src="/images/asia-map.svg" alt="" width="1000" height="721" class="atl-base"></div>
          <p class="atl-year" aria-live="polite"><b data-atl-year></b><span data-atl-line></span></p></div>
        <aside class="atl-side" data-atl-side aria-live="polite"></aside>
      </div>
      <div class="atl-time">
        <button type="button" class="atl-play" data-atl-play aria-label="Play the years">Play</button>
        <div class="atl-track"><input type="range" min="${ATL.y0}" max="${ATL.y1}" step="1" value="${ATL.y1}" data-atl-range aria-label="Year"><div class="atl-ticks" data-atl-ticks aria-hidden="true"></div></div>
      </div>
      <noscript><p class="hub-p">The Atlas needs JavaScript. <a href="/heatwaves/">Heatwaves that shaped Asia</a> and <a href="/worked-plans/">Worked plans</a> tell the same story as text.</p></noscript>
      <h2 class="hub-h">How to read this</h2>
      <ul class="hub-grid hub-grid--plain">
        <li class="std"><b>Approximate places</b><span>Heatwaves are drawn as areas around where they were worst; the map has no borders and is not a political map.</span></li>
        <li class="std"><b>A milestone is a step, not a score</b><span>Each marks something done, with its source. It says nothing about how well it worked, or about places not shown.</span></li>
        <li class="std"><b>Heat right now is an estimate</b><span>${esc(D.LIVE_NOTE)}</span></li>
        <li class="std"><b>Missing a step?</b><span>Plans and rules are added each month. If one is missing, <a href="/corrections/">please tell us</a>.</span></li>
      </ul>
      <p class="hub-p"><a href="/heatwaves/">Heatwaves that shaped Asia</a> · <a href="/worked-plans/">Worked plans</a> · <a href="/cities/">Cities</a> · <a href="/countries/">Countries</a></p>
    </section>
    <script>window.ATL=${JSON.stringify(ATL).replace(/</g, "\\u003c")};</script><script src="/atlas/atlas.js?v=${V}" defer></script>`));
}

// ---- Corrections: data/site/corrections.json plus any knowledge-base record that carries a correction note ----
const CORR = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "site", "corrections.json"), "utf8")).entries;
const KBD = path.join(ROOT, "data", "kb");
const kbCorr = fs.existsSync(KBD) ? fs.readdirSync(KBD).filter(f => f.endsWith(".json") && !f.startsWith("_"))
  .flatMap(f => JSON.parse(fs.readFileSync(path.join(KBD, f), "utf8"))).filter(r => r.correction)
  .map(r => ({ date: r.changed || r.added, where: [r.title], what: r.correction, change: r.summary, sorry: r.sorry || "", credit: r.credit || "" })) : [];
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
      ${allCorr.length ? `<ol class="corr-log">${allCorr.map(c => `<li class="corr"><p class="corr-d">${fmtDate(c.date)} · ${(c.where || []).map(esc).join(", ")}</p><p><b>What was wrong.</b> ${esc(c.what)}</p><p><b>What changed.</b> ${esc(c.change)}</p>${c.sorry ? `<p class="corr-sorry">${esc(c.sorry)}</p>` : ""}${c.credit ? `<p class="corr-credit">With thanks to ${esc(c.credit)}, who pointed it out.</p>` : ""}</li>`).join("")}</ol>` : `<p class="hub-p">No corrections yet.</p>`}
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

// ---- Paying when heat strikes: risk finance for heat (research/2026-10/riskfin, read by tools/riskfin-data.js) ----
{
  const RF = require("./riskfin-data.js");
  const SLUG = "paying-when-heat-strikes", DIRD = path.join(ROOT, SLUG, "data");
  const PEOPLE = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "site", "people.json"), "utf8"));
  const person = id => PEOPLE.people.find(p => p.loop === id);
  const loopName = id => (D.LOOPS.find(l => l.id === id) || {}).name || id;
  const SNAPSLUG = { Bangladesh: "bangladesh", India: "india", Indonesia: "indonesia", Nepal: "nepal", Philippines: "philippines", "Sri Lanka": "sri-lanka", Thailand: "thailand" };
  const LBY = Object.fromEntries(RF.LAYERS.map(l => [l.id, l]));
  const HEAT = { yes: "Heat in its cover", partly: "Heat partly covered", no: "Heat not covered", unclear: "Heat cover unclear" };
  const STATUS = { active: "Active", pilot: "Pilot", ended: "Ended", paused: "Paused", unclear: "Status unclear" };
  const MKIND = { payout: "Payout", disbursement: "Money given out", limit: "Cover limit", sum_insured: "Sum insured", bond_size: "Bond size", credit_line: "Credit line", budget: "Budget", premium: "Premium" };
  const TKIND = { forecast: "Forecast trigger", action: "Action trigger", payout: "Payout trigger", declaration: "Declared event" };
  const REGION = { sa: "South Asia", sea: "Southeast Asia", elsewhere: "Outside the region, for comparison" };
  const INCL = { informal_workers: "Informal workers", women: "Women", older_people: "Older people", disabled_people: "Disabled people", migrants: "Migrants", poorest: "The poorest" };
  const EVL = { concept: "Concept", test: "Test", reported: "Reported", guidance: "Guidance", measured: "Measured", evaluated: "Evaluated" };
  const num = s => { const n = Number(String(s).replace(/,/g, "")); return isFinite(n) && String(s).trim() !== "" ? n.toLocaleString("en-GB", { maximumFractionDigits: n < 100 ? 2 : 0 }) : String(s); };
  const money = m => m && m.amount ? `${esc(m.currency || "")} ${esc(num(m.amount))}${m.usd && m.currency !== "USD" ? ` <small>(about US$${esc(num(m.usd))})</small>` : ""}` : "";
  const xl = (s, t) => s ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(t || s.label)}<span class="visually-hidden"> (opens in a new tab)</span></a>${s.archive ? ` <a class="rf-arch" href="${esc(s.archive)}" target="_blank" rel="noopener">archived copy<span class="visually-hidden"> (opens in a new tab)</span></a>` : ""}` : "";
  const kv = (k, v) => v ? `<p class="rf-kv"><b>${esc(k)}</b> ${v}</p>` : "";

  // per-layer counts, of the records we documented: never a measure of the world, and never money added up
  const LS = RF.LAYERS.map(l => { const s = RF.schemes.filter(x => x.layer === l.id); return Object.assign({}, l, {
    n: s.length, heat: s.filter(x => x.heat === "yes").length, part: s.filter(x => x.heat === "partly").length, paid: s.filter(x => x.paid === "paid").length,
    never: s.filter(x => x.paid === "never").length, inst: RF.instruments.filter(i => i.layer === l.id).map(i => ({ n: i.n, d: i.def, sp: i.speed, lim: i.limits, poor: i.poorest })),
    seg: s.map(x => ({ id: x.id, n: x.n, h: x.heat, p: x.paid })) }); });

  // one card per scheme: "did it pay, and when?" first, then the trigger, the money in its kind, and who it reaches
  const card = s => {
    const L = LBY[s.layer] || { short: s.layer };
    const pays = s.payouts.length ? `<ul class="rf-pays">${s.payouts.map(p => `<li><span class="rf-money"><i>${esc(MKIND[p.kind] || p.kind || "Money")}</i> ${money(p) || "amount not traced"}</span><span>${esc(p.date || "date not traced")}${p.recipients ? ` · ${esc(p.recipients)}` : ""}</span>${p.days ? `<span class="rf-clock">How fast: ${esc(p.days)}</span>` : ""}${p.src ? `<span class="rf-src">${xl(p.src, "Source")}</span>` : ""}</li>`).join("")}</ul>` : "";
    const incl = Object.keys(INCL).filter(k => s.inclusion[k] != null).map(k => { const v = String(s.inclusion[k] || ""), nv = !v || /^not verified$/i.test(v); return `<li class="${nv ? "is-nv" : ""}"><b>${INCL[k]}</b><span>${nv ? "Not verified" : esc(v)}</span></li>`; }).join("");
    return `<li class="rf-card" data-layer="${s.layer}" data-paid="${s.paid}" data-region="${s.region}" data-heat="${s.heat}" data-id="${esc(s.id)}" id="s-${esc(s.id)}">
      <details><summary>
        <span class="rf-card__top"><span class="rf-chip rf-chip--${s.layer}">${esc(L.short)}</span><span class="rf-heat rf-heat--${s.heat}">${esc(HEAT[s.heat] || HEAT.unclear)}</span></span>
        <b class="rf-card__n">${esc(s.n)}</b>
        <span class="rf-card__where">${esc(s.countries.join(", "))} · ${esc(STATUS[s.status] || s.status)}</span>
        <span class="rf-paid rf-paid--${s.paid}"><i aria-hidden="true"></i>${esc(RF.PAYS[s.paid])}</span>
      </summary><div class="rf-card__body">
        ${s.covered ? kv("Who or what it protects", esc(s.covered)) : ""}
        ${s.heatWhy ? kv("Heat, in its own words", esc(s.heatWhy)) : ""}
        ${s.trigger.metric ? `<div class="rf-trig"><p class="rf-trig__k">${esc(TKIND[s.trigger.kind] || "Trigger")}</p><p><b>${esc(s.trigger.metric)}</b>${s.trigger.threshold ? `. ${esc(s.trigger.threshold)}` : ""}</p>${s.trigger.data ? `<p class="rf-muted">Data: ${esc(s.trigger.data)}</p>` : ""}${s.trigger.window ? `<p class="rf-muted">Window: ${esc(s.trigger.window)}</p>` : ""}</div>` : ""}
        <h4 class="rf-h4">Did it pay, and when?</h4>${pays || `<p class="rf-muted">${s.paid === "never" ? "Our sources record that it has not been triggered. That is a finding, not a failure: a trigger set for rare years may rightly stay quiet." : s.paid === "activated" ? "Sources describe it as activated or paying, but we could not trace an amount and a date we could rely on." : "We could not find a reliable record either way. A missing record is not evidence that nothing was paid."}</p>`}
        ${s.size ? kv(MKIND[s.size.kind] || "Size", `${money(s.size)}${s.size.year ? ` <small>(${esc(s.size.year)})</small>` : ""}${s.size.scope ? ` <small>${esc(s.size.scope)}</small>` : ""}`) : ""}
        ${s.enrol.length ? kv("Reach, as reported", s.enrol.map(e => `${esc(num(e.number))} ${esc(e.unit || "")} (${esc(e.year)})`).join("; ")) : ""}
        ${s.premiumBy ? kv("Who pays the premium or cost", esc(s.premiumBy)) : ""}
        ${s.basis ? kv("Where the trigger and the harm could part ways", esc(s.basis)) : ""}
        ${s.fallback ? kv("If the trigger misses", esc(s.fallback)) : ""}
        ${incl ? `<h4 class="rf-h4">Who it reaches</h4><ul class="rf-incl">${incl}</ul>` : ""}
        ${s.protection ? kv("Protection for people covered", esc(s.protection)) : ""}
        ${s.evidence.length ? `<ul class="rf-ev">${s.evidence.map(e => `<li><span class="rf-evl rf-evl--${esc(e.status)}">${esc(EVL[e.status] || e.status)}</span> ${esc(e.text)}</li>`).join("")}</ul>` : ""}
        ${s.providers.length ? kv("Who is involved", s.providers.map(p => esc(p.n)).join(", ")) : ""}
        ${s.sources.length ? `<p class="rf-srcs"><b>Sources</b> ${s.sources.map(x => xl(x)).join(" · ")}</p>` : ""}
      </div></details></li>`;
  };
  const sch = RF.schemes.slice().sort((a, b) => ({ sa: 0, sea: 1, elsewhere: 2 }[a.region] - { sa: 0, sea: 1, elsewhere: 2 }[b.region]) || ({ paid: 0, activated: 1, never: 2, unknown: 3 }[a.paid] - { paid: 0, activated: 1, never: 2, unknown: 3 }[b.paid]));

  // the three triggers, and the two clocks after them, each with a real example from the research
  const byId = id => RF.schemes.find(s => s.id === id) || {};
  const eap = byId("bd-dhaka-eap"), js = byId("jansahas_digit_2025"), lao = byId("lao_seadrif_2025"), bdc = byId("bd_heat");
  const RIB = [
    { k: "warning", h: "A warning", p: "A weather service says dangerous heat is coming. It tells people to take care, and starts nothing on its own.", ex: `In Dhaka, readiness begins on a forecast ${esc((eap.trigger || {}).window || "").split(";")[0].replace(/^Readiness lead/i, "").trim()} ahead.`, src: (eap.sources || [])[0] },
    { k: "action", h: "An action trigger", p: "A threshold agreed in advance gives permission, and money, to act: cash, water, cooling, outreach.", ex: `Dhaka’s Early Action Protocol: ${esc((eap.trigger || {}).threshold || "")}. First activated in April 2024.`, src: (bdc.sources || [])[0] },
    { k: "payout", h: "A payout trigger", p: "A contract pays when a measured index crosses its line, whether or not a person was harmed.", ex: `A worker cover in Noida, India: ${esc(((js.trigger || {}).threshold || "").split(".")[0])}.`, src: (js.sources || [])[0] },
    { k: "treasury", h: "Money reaches an institution", p: "A ministry, agency or organisation receives the funds. This clock is the one most often reported.", ex: `A regional pool paid Lao PDR US$2 million ${esc(((lao.payouts || [])[0] || {}).days || "").split(";")[0]}, for floods rather than heat.`, src: ((lao.payouts || [])[0] || {}).src },
    { k: "person", h: "Money reaches a person", p: "The clock that matters most to someone losing a day’s pay, and the one we could least often see.", ex: `In Dhaka in 2024, households received BDT 5,000 each; the dates they received it are not in our sources.`, src: (bdc.sources || [])[0] }];
  const ribbon = `<ol class="rf-rib">${RIB.map((r, i) => `<li class="rf-rib__s rf-rib__s--${r.k}"><span class="rf-rib__n">${i + 1}</span><h3>${r.h}</h3><p>${r.p}</p><p class="rf-rib__ex">${r.ex}${r.src ? ` <span class="rf-src">${xl(r.src, "Source")}</span>` : ""}</p></li>`).join("")}</ol>`;
  const FAM = RF.triggers.filter(t => t.module === 6);

  // country by country: the layers we found, the gap, and an idea labelled for what it is
  const CO = Object.keys(RF.layersByCountry).filter(c => !/ASEAN/.test(c)).sort((a, b) => RF.layersByCountry[b].length - RF.layersByCountry[a].length || a.localeCompare(b));
  const coSlug = c => c.toLowerCase().replace(/[^a-z]+/g, "-");
  const RULE = Object.fromEntries(RF.rules.map(r => [r.country.replace(/^Vietnam$/, "Viet Nam"), r]));
  const coPanel = c => { const rows = RF.layersByCountry[c].slice().sort((a, b) => RF.LAYERS.findIndex(l => l.id === a.layer) - RF.LAYERS.findIndex(l => l.id === b.layer)); const r = RULE[c];
    return `<section class="rf-co" id="country-${coSlug(c)}" data-co="${coSlug(c)}" aria-labelledby="co-${coSlug(c)}"><h3 id="co-${coSlug(c)}">${esc(c)}</h3>
      <ol class="rf-co__stack">${rows.map(x => `<li class="rf-co__row rf-co__row--${x.layer}"><span class="rf-chip rf-chip--${x.layer}">${esc((LBY[x.layer] || {}).short || x.layer)}</span><div><b>${esc(x.inst)}</b> <span class="rf-heat rf-heat--${esc(x.heat)}">${esc(HEAT[x.heat] || HEAT.unclear)}</span>
        ${x.holder ? `<p class="rf-muted">Held by ${esc(x.holder)}</p>` : ""}${x.trigger ? kv("How it is released", esc(x.trigger)) : ""}${x.lastMile ? kv("How it reaches people", esc(x.lastMile)) : ""}
        ${x.gap ? `<p class="rf-gap"><b>What we could not find</b> ${esc(x.gap)}</p>` : ""}${x.idea ? `<p class="rf-idea"><b>An idea, inferred</b> ${esc(x.idea)}</p>` : ""}${x.src ? `<p class="rf-src">${xl(x.src, "Source")}</p>` : ""}</div></li>`).join("")}</ol>
      ${r ? `<div class="rf-rules"><p class="rf-trig__k">The rules, in brief${r.authority ? ` · ${esc(r.authority)}` : ""}</p>${kv("Index-based (parametric) cover", esc(r.parametric))}${kv("Small-sum insurance", esc(r.micro))}${kv("Selling through worker groups and phones", esc(r.distribution))}${kv("Protection for buyers", esc(r.protection))}${r.src ? `<p class="rf-src">${xl(r.src, "Source")}</p>` : ""}</div>` : ""}
      ${SNAPSLUG[c] ? `<p class="rf-muted"><a href="/countries/${SNAPSLUG[c]}/">The ${esc(c)} country snapshot</a> · plans, warnings, work rules and money beyond risk finance.</p>` : ""}</section>`; };

  // who takes part, by side, so no one is ranked
  const SIDES = [["demand", "Who seeks protection", "Governments, cities, worker groups and humanitarian agencies that hold the risk and want cover or ready money."], ["platform", "Who connects and sets rules", "Regulators, pools, partnerships and facilities that make arrangements possible and fair."], ["supply", "Who supplies cover, money and know-how", "Insurers, reinsurers, brokers, development banks, funders and researchers."]];
  const TYPE = t => String(t || "other").replace(/_/g, " ").replace(/^mga$/, "managing agent").replace(/^mdb$/, "development bank");
  const who = SIDES.map(([k, h, p]) => { const a = RF.actors.filter(x => x.side === k); const types = {}; a.forEach(x => { types[TYPE(x.type)] = (types[TYPE(x.type)] || 0) + 1; });
    return `<article class="rf-side rf-side--${k}"><p class="rf-side__n">${a.length}</p><h3>${h}</h3><p>${p}</p><p class="rf-types">${Object.entries(types).sort((x, y) => y[1] - x[1]).map(([t, n]) => `<span>${esc(t)} <b>${n}</b></span>`).join("")}</p>
      <details class="rf-more"><summary>See all ${a.length}</summary><ul>${a.sort((x, y) => x.n.localeCompare(y.n)).map(x => `<li>${x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.n)}<span class="visually-hidden"> (opens in a new tab)</span></a>` : esc(x.n)}${x.role ? `<span>${esc(x.role)}</span>` : ""}</li>`).join("")}</ul></details></article>`; }).join("");

  // the dataset, for anyone to reuse: one JSON file and plain spreadsheets, money kept in its kind
  fs.mkdirSync(DIRD, { recursive: true });
  const csv = (rows, cols) => [cols.join(","), ...rows.map(r => cols.map(c => { const v = r[c] == null ? "" : Array.isArray(r[c]) ? r[c].join("; ") : String(r[c]); return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v; }).join(","))].join("\n") + "\n";
  const DSET = { title: "Paying when heat strikes: heat risk finance in South and Southeast Asia", publisher: "Common Shade", url: `${SITE}/${SLUG}/`, licence: "CC BY 4.0", checked: RF.checked, disclaimer: RF.disclaimer,
    rules: ["Money is kept in its kind: premiums, cover limits, payouts and budgets are never added together.", "Warning, action and payout triggers are kept apart.", "Every scheme records whether it paid, and when; 'never triggered' is a valid finding.", "Known, inferred and uncertain are kept distinct.", "Links that failed our link check are left out."],
    layers: RF.LAYERS, schemes: RF.schemes, instruments: RF.instruments, triggers: RF.triggers, data_infrastructure: RF.data, country_layers: RF.layersByCountry, rules_by_country: RF.rules, actors: RF.actors, evidence_of_effect: RF.effects, not_verified: RF.unverified, sources: RF.sources };
  fs.writeFileSync(path.join(DIRD, "heat-risk-finance.json"), JSON.stringify(DSET, null, 1));
  const flat = RF.schemes.map(s => ({ id: s.id, name: s.n, layer: s.layer, instrument: s.inst, countries: s.countries, status: s.status, heat_covered: s.heat, did_it_pay: RF.PAYS[s.paid], trigger_kind: s.trigger.kind, trigger_metric: s.trigger.metric, trigger_threshold: s.trigger.threshold,
    size_kind: s.size ? s.size.kind : "", size_amount: s.size ? s.size.amount : "", size_currency: s.size ? s.size.currency : "", payouts: s.payouts.map(p => `${p.kind}: ${p.currency} ${p.amount} (${p.date})`), basis_risk: s.basis, fallback: s.fallback, sources: s.sources.map(x => x.url) }));
  const FILES = [["schemes.csv", csv(flat, Object.keys(flat[0])), "Every scheme, with whether it paid"], ["instruments.csv", csv(RF.instruments, ["id", "n", "layer", "level", "def", "pays", "gets", "speed", "good", "limits", "basis", "poorest"]), "The kinds of instrument"],
    ["country-layers.csv", csv(Object.entries(RF.layersByCountry).flatMap(([c, r]) => r.map(x => Object.assign({ country: c }, x, { src: x.src ? x.src.url : "" }))), ["country", "layer", "inst", "holder", "heat", "trigger", "lastMile", "gap", "idea", "src"]), "Country by country"],
    ["actors.csv", csv(RF.actors, ["n", "side", "type", "role", "geo", "url"]), "Who takes part"], ["triggers.csv", csv(RF.triggers, ["metric", "good", "weak", "humid", "asia", "used"]), "Ways to measure heat for a trigger"],
    ["sources.csv", csv(RF.sources, ["label", "url", "status", "archive", "module"]), "Every source, with its link check"]];
  FILES.forEach(([f, c]) => fs.writeFileSync(path.join(DIRD, f), c));

  const P1 = person("protection"), P2 = person("reactive");
  const tot = { n: RF.schemes.length, heat: RF.schemes.filter(s => s.heat === "yes").length, paid: RF.schemes.filter(s => s.paid === "paid").length, never: RF.schemes.filter(s => s.paid === "never").length };
  const CHIP = (k, v, t, on) => `<button type="button" class="rf-f${on ? " is-on" : ""}" data-f="${k}" data-v="${v}" aria-pressed="${on ? "true" : "false"}">${t}</button>`;
  const RFD = { L: LS.map(l => ({ id: l.id, name: l.name, short: l.short, when: l.when, text: l.text, n: l.n, heat: l.heat, part: l.part, paid: l.paid, never: l.never, inst: l.inst, seg: l.seg })) };

  write(SLUG, page(SLUG, "Paying when heat strikes", "Which layer of money could carry heat? Insurance, pools, credit, forecast-based funds and social protection for extreme heat in South and Southeast Asia: what exists, whether it paid, and when.",
    `<header class="rf-hero"><div class="container rf-hero__in">
      <div class="rf-hero__txt"><p class="eyebrow">Fund and build</p><h1 class="pg-h1">Paying when heat strikes</h1>
      <p class="pg-lede">Most money set aside for disasters was designed for floods, storms and earthquakes, which break things that can be counted. Heat mostly takes income, health and working days, quietly. This section gathers what exists to pay when heat arrives, and asks, gently, one question.</p>
      <p class="rf-q">Which layer could carry heat?</p>
      <ul class="rf-facts"><li><b>${tot.n}</b><span>schemes and arrangements we documented</span></li><li><b>${tot.heat}</b><span>name heat in their cover</span></li><li><b>${tot.paid}</b><span>with a payment we could trace, amount and date</span></li></ul>
      <p class="rf-note">Counts are of what we documented, not of everything that exists. Money is never added up across kinds.</p></div>
      <svg class="rf-hero__art" viewBox="0 0 320 240" aria-hidden="true" focusable="false"><g fill="none" stroke="#16202B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="252" cy="44" r="20" fill="#F5A623" stroke="#F5A623"/><path d="M252 10v-6M252 84v-6M218 44h-6M292 44h-6M228 20l-4-4M276 68l4 4M276 20l4-4" stroke="#F5A623"/>
        <path d="M40 96 Q160 70 280 96 L280 104 Q160 80 40 104 Z" fill="#2E6F95" stroke="#2E6F95" opacity=".55"/><path d="M50 122 Q160 100 270 122 L270 130 Q160 110 50 130 Z" fill="#C98A12" stroke="#C98A12" opacity=".7"/>
        <path d="M60 148 Q160 128 260 148 L260 156 Q160 138 60 156 Z" fill="#F26430" stroke="#F26430"/><path d="M70 172 Q160 156 250 172 L250 180 Q160 166 70 180 Z" fill="#B8401A" stroke="#B8401A" opacity=".85"/><path d="M80 194 Q160 180 240 194 L240 202 Q160 190 80 202 Z" fill="#1F7A70" stroke="#1F7A70"/>
        <path d="M10 236H310" opacity=".4"/><circle cx="120" cy="208" r="6"/><path d="M120 214v12M120 226l-6 10M120 226l6 10M120 218l-9 6"/><circle cx="200" cy="208" r="6"/><path d="M200 214v12M200 226l-6 10M200 226l6 10M200 218l9 6"/><circle cx="160" cy="214" r="4"/><path d="M160 218v9M160 227l-4 9M160 227l4 9"/></g></svg>
    </div></header>
    <nav class="container rf-jump" aria-label="On this page"><a href="#layers">The layers</a><a href="#did-it-pay">Did it pay, and when?</a><a href="#triggers">Three triggers</a><a href="#countries">Country by country</a><a href="#who">Who takes part</a><a href="#know">What we know</a><a href="#data">The data</a></nav>

    <section class="container rf-sec rf-people" aria-label="Two cycles this section is about">
      <article class="rf-person"><p class="rf-person__k">The <a href="/loops/#protection">${esc(loopName("protection").replace(/^The /, "").toLowerCase())}</a></p><p class="rf-person__who">${esc(P1.who)}</p><p>${esc(P1.story)}</p></article>
      <article class="rf-person"><p class="rf-person__k">The <a href="/loops/#reactive">${esc(loopName("reactive").replace(/^The /, "").toLowerCase())}</a></p><p class="rf-person__who">${esc(P2.who)}</p><p>${esc(P2.story)}</p></article>
      <p class="rf-note">${esc(PEOPLE.note)} Money arranged before heat arrives is one way these two cycles could be eased.</p>
    </section>

    <section class="container rf-sec" id="layers" aria-labelledby="layers-h">
      <p class="eyebrow">Layers of shade</p><h2 class="hub-h" id="layers-h">The layers of protection</h2>
      <p class="hub-p">Money for a bad season can be held in layers, like canopies one above another. The ones closest to people carry the heat of most years; the higher ones open only for rarer, harder years. Each strip below is one scheme we documented: filled where heat is in its cover, open where it is not. Where the shade has holes, heat reaches people as lost pay and illness.</p>
      <div class="rf-can" data-rf-can>
        <div class="rf-can__stage"><svg class="rf-can__svg" viewBox="0 0 800 520" role="img" aria-labelledby="can-t can-d" data-rf-svg><title id="can-t">Five layers of protection above people</title><desc id="can-d">A drawing of five layered canopies. Choose how hard a heat season is to see which layers open, and select a layer to read about it.</desc></svg>
          <div class="rf-sev" role="radiogroup" aria-label="How hard a heat season?">
            <span class="rf-sev__k">How hard a heat season?</span>
            <button type="button" role="radio" aria-checked="true" data-sev="1">Most years</button><button type="button" role="radio" aria-checked="false" data-sev="2">A hard year</button><button type="button" role="radio" aria-checked="false" data-sev="3">A rare, extreme year</button>
          </div>
          <p class="rf-can__cap" data-rf-cap aria-live="polite"></p>
        </div>
        <aside class="rf-can__side" data-rf-side aria-live="polite"></aside>
      </div>
      <p class="rf-note">A picture of how layered protection is meant to work, drawn from the schemes we documented. It is not a measurement of the protection gap, which we could not put a reliable number on.</p>
      <noscript><ul class="hub-grid hub-grid--plain">${LS.map(l => `<li class="std"><b>${esc(l.name)}</b><span>${esc(l.text)} ${l.n} schemes documented, ${l.heat} with heat in their cover, ${l.paid} with a traced payment.</span></li>`).join("")}</ul></noscript>
    </section>

    <section class="container rf-sec" id="did-it-pay" aria-labelledby="pay-h">
      <p class="eyebrow">Every scheme, one honest question</p><h2 class="hub-h" id="pay-h">Did it pay, and when?</h2>
      <p class="hub-p">Open any scheme to see its trigger, the money in its own kind, how fast it moved, where the trigger and the harm could part ways, and who it reaches. <i>Never triggered</i> is a finding, not a failure.</p>
      <div class="rf-filters" data-rf-filters>
        <div role="group" aria-label="Layer"><span>Layer</span>${CHIP("layer", "all", "All", true)}${RF.LAYERS.map(l => CHIP("layer", l.id, esc(l.short))).join("")}</div>
        <div role="group" aria-label="Did it pay?"><span>Did it pay?</span>${CHIP("paid", "all", "All", true)}${CHIP("paid", "paid", "Paid, traced")}${CHIP("paid", "activated", "Activated")}${CHIP("paid", "never", "Never triggered")}${CHIP("paid", "unknown", "Not known")}</div>
        <div role="group" aria-label="Where"><span>Where</span>${CHIP("region", "all", "All", true)}${CHIP("region", "sa", "South Asia")}${CHIP("region", "sea", "Southeast Asia")}${CHIP("region", "elsewhere", "Elsewhere, for comparison")}</div>
        <label class="rf-only"><input type="checkbox" data-rf-heat> Only schemes with heat in their cover</label>
      </div>
      <p class="rf-count" data-rf-count aria-live="polite">${sch.length} schemes</p>
      <ul class="rf-cards" data-rf-cards>${sch.map(card).join("")}</ul>
      <p class="rf-empty" data-rf-empty hidden>No scheme matches all of these. Try fewer filters.</p>
    </section>

    <section class="rf-band" id="triggers" aria-labelledby="trig-h"><div class="container rf-sec">
      <p class="eyebrow">Kept apart, on purpose</p><h2 class="hub-h" id="trig-h">Three triggers, and two clocks</h2>
      <p class="hub-p">A warning, a decision to act and a contract that pays are different things, set by different people for different reasons. After a payout trigger, two more clocks run: until money reaches an institution, and until it reaches a person. A fast payment to a treasury can still be a slow one for a family.</p>
      ${ribbon}
      <h3 class="rf-h3">Ways to measure heat for a trigger</h3>
      <p class="hub-p">No single measure sees all of heat. Each one catches some harm and can miss another.</p>
      <ul class="rf-fam">${FAM.map(t => `<li><details><summary><b>${esc(t.metric)}</b>${t.humid ? `<span>Humid heat: ${esc(t.humid)}</span>` : ""}</summary>${kv("What it does well", esc(t.good))}${kv("What it can miss", esc(t.weak))}${kv("Data in Asia", esc(t.asia))}${kv("Used in", esc(t.used))}</details></li>`).join("")}</ul>
      <h3 class="rf-h3">How long the data takes</h3>
      <ul class="rf-lat">${RF.data.map(x => `<li><b>${esc(x.n)}</b><span>${esc(x.latency)}</span>${x.caveat ? `<small>${esc(x.caveat)}</small>` : ""}</li>`).join("")}</ul>
    </div></section>

    <section class="container rf-sec" id="hard" aria-labelledby="hard-h">
      <p class="eyebrow">Why heat is different</p><h2 class="hub-h" id="hard-h">Seven things that make heat hard to finance</h2>
      <ol class="rf-hard">${RF.challenges.map((c, i) => `<li><span class="path-n">${i + 1}</span><div><h3>${esc(c.c)}</h3>${c.design ? `<p><b>What has been tried.</b> ${esc(c.design)}</p>` : ""}${c.gap ? `<p class="rf-muted"><b>Still open.</b> ${esc(c.gap)}</p>` : ""}</div></li>`).join("")}</ol>
    </section>

    <section class="container rf-sec" id="countries" aria-labelledby="co-h">
      <p class="eyebrow">Place by place</p><h2 class="hub-h" id="co-h">Country by country</h2>
      <p class="hub-p">The layers we found in each place, what we could not find, and ideas the researchers inferred. A gap describes what our search found, never a fault, and an idea is a possibility, not a recommendation.</p>
      <div class="rf-co-tabs" role="tablist" aria-label="Choose a country" data-rf-cotabs>${CO.map((c, i) => `<button type="button" role="tab" aria-selected="${i ? "false" : "true"}" aria-controls="country-${coSlug(c)}" data-co-t="${coSlug(c)}">${esc(c)} <small>${RF.layersByCountry[c].length}</small></button>`).join("")}</div>
      <div class="rf-co-panels">${CO.map(coPanel).join("")}</div>
    </section>

    <section class="container rf-sec" id="who" aria-labelledby="who-h">
      <p class="eyebrow">Many hands</p><h2 class="hub-h" id="who-h">Who takes part</h2>
      <p class="hub-p">${RF.actors.length} organisations appear in the research. Listing is not endorsement, partnership or ranking. <a href="/who-holds-it/">Who holds it up</a> shows who could permit, pay for, deliver and check each action.</p>
      <div class="rf-sides">${who}</div>
    </section>

    <section class="container rf-sec" id="effect" aria-labelledby="eff-h">
      <p class="eyebrow">What changed for people</p><h2 class="hub-h" id="eff-h">What the evidence says about effect</h2>
      <p class="hub-p">Few of these arrangements have been studied for what they changed in people’s lives. Here is what has, each with how it was studied. Some come from outside Asia, or from other hazards, and are shown because they teach something about timing.</p>
      <ul class="rf-eff">${RF.effects.map(e => `<li><span class="rf-evl rf-evl--${esc(e.status)}">${esc(EVL[e.status] || e.status)}</span><h3>${esc(e.n)}</h3><p class="rf-muted">${esc([e.place, e.date].filter(Boolean).join(" · "))}</p>${e.result ? `<p>${esc(e.result)}</p>` : ""}${e.limits ? `<p class="rf-muted"><b>Limits.</b> ${esc(e.limits)}</p>` : ""}${e.src ? `<p class="rf-src">${xl(e.src, "Source")}</p>` : ""}</li>`).join("")}</ul>
    </section>

    <section class="rf-band rf-band--sand" id="know" aria-labelledby="know-h"><div class="container rf-sec">
      <p class="eyebrow">Known, inferred, uncertain</p><h2 class="hub-h" id="know-h">What we know, what we infer, and what we are unsure of</h2>
      <div class="rf-kiu">${RF.narrative.map(x => `<article><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p><dl><dt class="k">Known</dt><dd>${esc(x.known)}</dd><dt class="i">Inferred</dt><dd>${esc(x.inferred)}</dd><dt class="u">Uncertain</dt><dd>${esc(x.uncertain)}</dd></dl>${x.id === "gap" ? `<p class="rf-gap"><b>Our own check</b> We have not yet been able to open the cited table and confirm these regional figures ourselves, so they are shown as the research reported them, with its caveats. They cover all disasters, not heat.</p>` : ""}</article>`).join("")}</div>
      <details class="rf-more rf-nv"><summary>What we could not verify, and left out (${RF.unverified.length})</summary><p class="hub-p">Things that were reported, claimed or likely, but that we could not confirm from a source we could open. They are not on this page as facts. If you can help confirm one, <a href="/corrections/">please tell us</a>.</p><ul>${RF.unverified.map(u => `<li><b>${esc(u.item)}</b>${u.why && u.why !== u.item ? `<span>${esc(u.why)}</span>` : ""}</li>`).join("")}</ul></details>
    </div></section>

    <section class="container rf-sec" id="data" aria-labelledby="data-h">
      <p class="eyebrow">Open to everyone</p><h2 class="hub-h" id="data-h">The data, to download and reuse</h2>
      <p class="hub-p">Everything on this page, free under CC BY 4.0. Money stays in its kind, the three triggers stay apart, and every source carries the result of our link check.</p>
      <ul class="rf-dl"><li><a href="/${SLUG}/data/heat-risk-finance.json" download><b>Everything, as one file</b><span>heat-risk-finance.json</span></a></li>${FILES.map(([f, , t]) => `<li><a href="/${SLUG}/data/${f}" download><b>${esc(t)}</b><span>${f}</span></a></li>`).join("")}</ul>
      <blockquote class="cite-box">Common Shade. <i>Paying when heat strikes: heat risk finance in South and Southeast Asia.</i> beattheheat.asia/${SLUG}/. Checked ${esc(new Date(RF.checked + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }))}. CC BY 4.0.</blockquote>
      <p class="rf-disc">${esc(RF.disclaimer)} Figures are as reported by their sources on the date checked; amounts are in the currency reported, with a US dollar figure only where the source gave one.</p>
      <p class="hub-p">Something here wrong, out of date or unfair? We would be grateful to <a href="/corrections/">hear it</a>, and we will correct it in the open.</p>
      <p class="hub-p"><a href="/finance/">Paying for protection</a> · <a href="/heat-economy/flows/">Follow the money</a> · <a href="/loops/#protection">The protection-gap loop</a> · <a href="/loops/#reactive">The reactive-spending loop</a> · <a href="/countries/">Countries</a></p>
    </section>
    <script>window.RF=${JSON.stringify(RFD).replace(/</g, "\\u003c")};</script><script src="/${SLUG}/rf.js?v=${V}" defer></script>`));
}

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
