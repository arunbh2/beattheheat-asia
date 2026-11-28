// Puts the one site navigation (tools/site-nav.js) on every page, the home page included: header, menu panels, search,
// paths by role, the path card on pages that are a stop on a path, and the footer with its citation.
// Safe to run again: everything it adds sits between <!--csn--> markers and is replaced, not duplicated.
"use strict";
const fs = require("fs");
const path = require("path");
const NAV = require("./site-nav.js");
const SHARE = require("./share-text.js");
const ROOT = path.join(__dirname, "..");
// the live ticker: same look as the home page's, with its rules copied from styles.css so it also works on the light text pages
const STYLES = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
const TICKER_CSS = ".ticker{--canvas:#FAF7F2;--orange:#F26430;--gutter:clamp(16px,3.5vw,40px);font-family:\"Hanken Grotesk\",\"Segoe UI\",Roboto,Arial,sans-serif;line-height:1.4}" +
  (STYLES.match(/\/\* live temperature ticker, above the header \*\/[\s\S]*?\.ticker__lv--2 \{[^}]*\}/) || [""])[0];
const V = (fs.readFileSync(path.join(ROOT, "index.html"), "utf8").match(/styles\.css\?v=(\d+)/) || [, "1"])[1];
const TICKER = `<div class="ticker" id="cs-ticker" role="region" aria-label="Live temperatures in Asian cities" hidden>
  <a class="ticker__k" href="/#heat-now"><span class="ticker__dot" aria-hidden="true"></span>Live</a>
  <div class="ticker__view"><div class="ticker__track" id="cs-ticker-track"></div></div>
  <button type="button" class="ticker__pause" id="cs-ticker-pause" aria-pressed="false">Pause</button>
</div>
`;
const NOSCRIPT = `<noscript><style>.csn__gb,.csn__tools{display:none!important}.csn__gl{display:inline-flex;align-items:center;height:40px;padding:0 14px;font-weight:700}@media (max-width:960px){.csn__main{display:block!important;flex:1 0 100%;height:auto}.csn__groups{flex-wrap:wrap;height:auto}.csn__groups>li{height:auto}}</style></noscript>`;
const UPDATED = new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" });
// pages that show no date of addition or update (the owner's decision for the El Niño guide, November 2026)
const UNDATED = new Set(["/el-nino-and-cities/", "/print/el-nino-worksheet/", "/el-nino/", "/print/el-nino-briefing/"]);
// every page's share record, for the build's coverage note
const SHARED = [];
const SHARE_JS = `/share.js?v=${V}`;
// pages with no share panel: the error page (its tags stay, so a pasted broken link still previews calmly)
const NO_SHARE = /^\/404\//;
const SKIP = new Set(["node_modules", ".git", "research", "tools", "docs", "images", "media", "feeds"]);

function pages(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory() && !(dir === ROOT && SKIP.has(e.name)) && !(e.name === "node_modules" || e.name === ".git")) pages(path.join(dir, e.name), out);
    else if (e.name === "index.html" && dir !== ROOT) out.push(path.join(dir, e.name));
  }
  return out;
}

const strip = s => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const decode = s => s.replace(/&amp;/g, "&").replace(/&#39;|&rsquo;/g, "’").replace(/&quot;/g, '"');

// when each page's own content last changed (not the menu, the footer or the build date), so a returning reader can be
// told, gently, that a page has changed since their last visit. Kept in data/site/page-versions.json.
const crypto = require("crypto");
const VERS_FILE = path.join(ROOT, "data", "site", "page-versions.json");
const VERS = fs.existsSync(VERS_FILE) ? JSON.parse(fs.readFileSync(VERS_FILE, "utf8")) : {};
const TODAY = new Date().toISOString().slice(0, 10);
function changedOn(pathname, html) {
  const m = html.match(/<main[\s\S]*<\/main>/); if (!m) return "";
  const body = m[0].replace(/<!--csn-->[\s\S]*?<!--\/csn-->/g, "").replace(/<script[\s\S]*?<\/script>/g, "").replace(/\s+/g, " ");
  const h = crypto.createHash("sha1").update(body).digest("hex").slice(0, 16), v = VERS[pathname];
  if (!v || v.hash !== h) VERS[pathname] = { hash: h, changed: v ? TODAY : "2026-10-01" };
  return VERS[pathname].changed;
}
const descOf = html => { const d = html.match(/<meta name="description" content="([^"]*)"/); if (!d) return ""; const t = decode(d[1]).replace(/&#x27;/g, "’");
  const first = t.split(/(?<=[.!?])\s+/)[0]; return first.length > 30 ? first : t; };
const NO_END = /^\/(print\/|404\/|join\/)/;

function titleOf(html) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  let t = h1 ? strip(h1[1]) : "";
  if (!t || t.length > 70) {
    const tt = html.match(/<title>([\s\S]*?)<\/title>/);
    t = tt ? strip(tt[1]).replace(/\s*\|\s*Common Shade\s*$/, "") : t;
  }
  t = decode(t);
  return t.length > 70 ? t.slice(0, 67).replace(/\s+\S*$/, "") + "…" : t;
}

function apply(file, pn) {
  let html = fs.readFileSync(file, "utf8");
  const pathname = pn || "/" + path.relative(ROOT, path.dirname(file)).split(path.sep).join("/") + "/";
  // what this page offers when shared, read before an earlier run is undone (tools/share-text.js)
  // (folders that start with a dot are not served by GitHub Pages: their own tags are left alone)
  const unserved = /^\/\./.test(pathname), noShare = unserved || NO_SHARE.test(pathname), share = SHARE.resolve(pathname, html);
  if (!noShare) SHARED.push(share);
  // undo an earlier run
  html = html.replace(/<!--csn-->[\s\S]*?<!--\/csn-->\n?/g, "");
  if (!unserved) html = SHARE.stripSocial(html);
  const title = titleOf(html);

  // styles, the small menu script and the one set of social tags, once, in the head
  html = html.replace("</head>", () => `<!--csn--><style id="csn-css">${NAV.CSS}\n${TICKER_CSS}</style>${NOSCRIPT}${unserved ? "" : SHARE.head(share, noShare ? "" : SHARE_JS)}<!--/csn-->\n</head>`);
  // "Share this page" just under the page title (the same button closes the page, in the ending)
  // a printable sheet keeps the sheet itself clean: its button joins the page tools above the sheet
  const tools = /^\/print\/./.test(pathname) && /<nav class="tools"[^>]*>[\s\S]*?<\/nav>/.test(html);
  if (!noShare && tools) html = html.replace(/(<nav class="tools"[^>]*>[\s\S]*?)(<\/nav>)/, (m, a, b) => `${a}<!--csn-->${SHARE.BUTTON("top")}<!--/csn-->${b}`);
  else if (!noShare) html = html.replace(/(<main[\s\S]*?<h1\b[\s\S]*?<\/h1>)/, m => `${m}<!--csn--><p class="cs-sh-top">${SHARE.BUTTON("top")}</p><!--/csn-->`);

  // the header: replace the page's old site header if it has one, otherwise put it straight after <body> (or its skip link)
  const head = `<!--csn-->${TICKER}${NAV.header(pathname, title)}<!--/csn-->`;
  const mainAt = html.search(/<main[\s>]/);
  const hAt = html.search(/<header[\s>]/);
  if (hAt > -1 && (mainAt === -1 || hAt < mainAt)) {
    const end = html.indexOf("</header>", hAt) + "</header>".length;
    html = html.slice(0, hAt) + head + html.slice(end);
  } else {
    html = html.replace(/(<body[^>]*>\s*(?:<a class="skip-link"[^>]*>[\s\S]*?<\/a>\s*)?)/, m => `${m}${head}\n`);
  }
  // a skip link for pages that have none
  if (!/class="(skip-link|csn-skip)"/.test(html.replace(/<!--csn-->[\s\S]*?<!--\/csn-->/g, ""))) {
    if (!/<main[^>]*\bid=/.test(html)) html = html.replace(/<main(?=[\s>])/, '<main id="main"');
    const id = (html.match(/<main[^>]*\bid="([^"]+)"/) || [, "main"])[1];
    html = html.replace(/(<body[^>]*>)/, `$1\n<!--csn--><a class="csn-skip" href="#${id}">Skip to the content</a><!--/csn-->`);
  }
  // the site map, just above the page's own footer line (or at the end)
  // on a page that is a stop on a path, the path card opens the main content (shown only to readers on that path)
  const cards = NAV.pathCards(pathname);
  if (cards) html = html.replace(/(<main[^>]*>)/, m => `${m}\n<!--csn-->${cards}<!--/csn-->`);
  // the page's own content date, for the "changed since your last visit" note
  const changed = changedOn(pathname, html);
  html = html.replace(/<body([^>]*?)(\sdata-changed="[^"]*")?>/, `<body$1 data-changed="${changed}">`);
  const end = NO_END.test(pathname) ? "" : NAV.ending(pathname, title, descOf(html));
  // every page: the invitation (join.js, unless the page loads it itself) and the exit card (everything.js)
  const pops = later([...(/<script[^>]+src="\/join\.js/.test(html) ? [] : [`/join.js?v=${V}`]), `/everything.js?v=${V}`]);
  const foot = `<!--csn-->${end}${NAV.footer(pathname, title, UNDATED.has(pathname) ? "" : UPDATED)}<script>${NAV.JS}</script><script src="/ticker.js?v=${V}" defer></script>${pops}<!--/csn-->\n`;
  // a printable sheet carries its own footer inside the A4 sheet; the site footer goes after the sheet, never inside it
  const fAt = /^\/print\//.test(pathname) ? -1 : html.lastIndexOf("<footer");
  // (inserted with a function, never a replacement string: "$$" in the menu script would otherwise collapse to "$")
  html = fAt > -1 && fAt > mainAt ? html.slice(0, fAt) + foot + html.slice(fAt) : html.replace(/<\/body>/, () => foot + "</body>");
  fs.writeFileSync(file, html);
}

// scripts for cards that appear only after a while (the invitation, the exit card) load once the page has finished
// loading, so they never compete with what a reader sees first on a slow phone (and stay out of check-weight's first load)
const later = srcs => `<script>addEventListener("load",function(){setTimeout(function(){${JSON.stringify(srcs)}.forEach(function(s){var e=document.createElement("script");e.src=s;document.body.appendChild(e)})},2500)})</script>`;

// the home page: the same header replaces its own (its live ticker stays where it is), and the same footer
function applyHome() {
  const file = path.join(ROOT, "index.html");
  // keep the header's place: the old header the first time, the marker of our own header after that
  let html = fs.readFileSync(file, "utf8").replace(/<!--csn--><header class="csn"[\s\S]*?<\/header><!--\/csn-->/, "<!--csn-header-->")
    ;
  const share = SHARE.resolve("/", html); SHARED.push(share);
  html = SHARE.stripSocial(html.replace(/<!--csn-->[\s\S]*?<!--\/csn-->\n?/g, ""));
  html = html.replace("</head>", () => `<!--csn--><style id="csn-css">${NAV.CSS}</style>${NOSCRIPT}${SHARE.head(share, SHARE_JS)}<!--/csn-->\n</head>`);
  const head = `<!--csn-->${NAV.header("/", "The map of extreme heat")}<!--/csn-->`;
  const hAt = html.search(/<header class="site-header"/);
  if (html.includes("<!--csn-header-->")) html = html.replace("<!--csn-header-->", () => head);
  else if (hAt > -1) { const end = html.indexOf("</header>", hAt) + "</header>".length; html = html.slice(0, hAt) + head + html.slice(end); }
  const fAt = html.lastIndexOf("<footer");
  // the home page's opening stays as the owner set it (docs/homepage-opening.md): its share button closes the page
  const foot = `<!--csn--><div class="cs-sh-home">${SHARE.BUTTON("end")}</div>${NAV.footer("/", "Extreme heat, in one map", UPDATED)}<script>${NAV.JS}</script>${later([`/everything.js?v=${V}`])}<!--/csn-->\n`;
  html = fAt > -1 ? html.slice(0, fAt) + foot + html.slice(fAt) : html.replace("</body>", () => foot + "</body>");
  fs.writeFileSync(file, html);
}

module.exports = function buildNav() {
  const list = pages(ROOT);
  list.forEach(f => apply(f));
  if (fs.existsSync(path.join(ROOT, "404.html"))) apply(path.join(ROOT, "404.html"), "/404/");
  applyHome();
  fs.writeFileSync(VERS_FILE, JSON.stringify(Object.fromEntries(Object.entries(VERS).sort()), null, 1) + "\n");
  console.log("Navigation on", list.length, "pages");
  // the pages the menu marks "New" (first published after the latest State of the field edition's cut-off), also for machines
  const F = require("./page-firsts.js"), names = {}; NAV.GROUPS.forEach(g => g.items.forEach(([u, t, d]) => { names[u] = [t, d]; }));
  console.log(`Menu marks ${F.fresh.size} page(s) new since ${F.editionName || "no edition"}`);
  if (F.fresh.size && fs.existsSync(path.join(ROOT, "llms.txt"))) fs.appendFileSync(path.join(ROOT, "llms.txt"), `\n## New since ${F.editionName} of State of the field\n\n${[...F.fresh].map(u => `- [${names[u][0]}](https://beattheheat.asia${u}): ${names[u][1].replace(/\{[a-z_]+\}/g, "").trim()}; first published ${F.firsts[u]}`).join("\n")}\n`);
  // share coverage: a page with no written message is shared with its description, and named here so the gap is seen
  const by = k => SHARED.filter(r => r.source === k);
  console.log(`Share this page on ${SHARED.length} pages: ${by("page").length} written messages, ${by("family").length} from their family's pattern, ${by("fallback").length} using the page description`);
  for (const r of by("fallback")) console.warn(`  warning: no share message for ${r.pathname}; add one to data/site/share.json (it is shared with its description for now)`);
};
if (require.main === module) module.exports();
