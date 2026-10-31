// Puts the one site navigation (tools/site-nav.js) on every page, the home page included: header, menu panels, search,
// paths by role, the path card on pages that are a stop on a path, and the footer with its citation.
// Safe to run again: everything it adds sits between <!--csn--> markers and is replaced, not duplicated.
"use strict";
const fs = require("fs");
const path = require("path");
const NAV = require("./site-nav.js");
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
const NOSCRIPT = `<noscript><style>.csn__gb,.csn__tools{display:none!important}.csn__gl{display:inline-flex;align-items:center;height:40px;padding:0 14px;font-weight:700}@media (max-width:960px){.csn__main{display:block!important}}</style></noscript>`;
const UPDATED = new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" });
const SKIP = new Set(["node_modules", ".git", "research", "tools", "docs", "images", "media", "feeds"]);

function pages(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory() && !SKIP.has(e.name)) pages(path.join(dir, e.name), out);
    else if (e.name === "index.html" && dir !== ROOT) out.push(path.join(dir, e.name));
  }
  return out;
}

const strip = s => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const decode = s => s.replace(/&amp;/g, "&").replace(/&#39;|&rsquo;/g, "’").replace(/&quot;/g, '"');

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
  // undo an earlier run
  html = html.replace(/<!--csn-->[\s\S]*?<!--\/csn-->\n?/g, "");
  const title = titleOf(html);

  // styles and the small menu script, once, in the head
  html = html.replace("</head>", `<!--csn--><style id="csn-css">${NAV.CSS}\n${TICKER_CSS}</style>${NOSCRIPT}<!--/csn-->\n</head>`);

  // the header: replace the page's old site header if it has one, otherwise put it straight after <body> (or its skip link)
  const head = `<!--csn-->${TICKER}${NAV.header(pathname, title)}<!--/csn-->`;
  const mainAt = html.search(/<main[\s>]/);
  const hAt = html.search(/<header[\s>]/);
  if (hAt > -1 && (mainAt === -1 || hAt < mainAt)) {
    const end = html.indexOf("</header>", hAt) + "</header>".length;
    html = html.slice(0, hAt) + head + html.slice(end);
  } else {
    html = html.replace(/(<body[^>]*>\s*(?:<a class="skip-link"[^>]*>[\s\S]*?<\/a>\s*)?)/, `$1${head}\n`);
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
  if (cards) html = html.replace(/(<main[^>]*>)/, `$1\n<!--csn-->${cards}<!--/csn-->`);
  const foot = `<!--csn-->${NAV.footer(pathname, title, UPDATED)}<script>${NAV.JS}</script><script src="/ticker.js?v=${V}" defer></script><!--/csn-->\n`;
  const fAt = html.lastIndexOf("<footer");
  html = fAt > -1 && fAt > mainAt ? html.slice(0, fAt) + foot + html.slice(fAt) : html.replace(/<\/body>/, foot + "</body>");
  fs.writeFileSync(file, html);
}

// the home page: the same header replaces its own (its live ticker stays where it is), and the same footer
function applyHome() {
  const file = path.join(ROOT, "index.html");
  // keep the header's place: the old header the first time, the marker of our own header after that
  let html = fs.readFileSync(file, "utf8").replace(/<!--csn--><header class="csn"[\s\S]*?<\/header><!--\/csn-->/, "<!--csn-header-->")
    .replace(/<!--csn-->[\s\S]*?<!--\/csn-->\n?/g, "");
  html = html.replace("</head>", `<!--csn--><style id="csn-css">${NAV.CSS}</style>${NOSCRIPT}<!--/csn-->\n</head>`);
  const head = `<!--csn-->${NAV.header("/", "The map of extreme heat")}<!--/csn-->`;
  const hAt = html.search(/<header class="site-header"/);
  if (html.includes("<!--csn-header-->")) html = html.replace("<!--csn-header-->", head);
  else if (hAt > -1) { const end = html.indexOf("</header>", hAt) + "</header>".length; html = html.slice(0, hAt) + head + html.slice(end); }
  const fAt = html.lastIndexOf("<footer");
  const foot = `<!--csn-->${NAV.footer("/", "Extreme heat, in one map", UPDATED)}<script>${NAV.JS}</script><!--/csn-->\n`;
  html = fAt > -1 ? html.slice(0, fAt) + foot + html.slice(fAt) : html.replace("</body>", foot + "</body>");
  fs.writeFileSync(file, html);
}

module.exports = function buildNav() {
  const list = pages(ROOT);
  list.forEach(f => apply(f));
  if (fs.existsSync(path.join(ROOT, "404.html"))) apply(path.join(ROOT, "404.html"), "/404/");
  applyHome();
  console.log("Navigation on", list.length, "pages");
};
if (require.main === module) module.exports();
