// Puts the one site navigation (tools/site-nav.js) on every page except the home page, which has its own.
// Safe to run again: everything it adds sits between <!--csn--> markers and is replaced, not duplicated.
"use strict";
const fs = require("fs");
const path = require("path");
const NAV = require("./site-nav.js");
const ROOT = path.join(__dirname, "..");
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

function apply(file) {
  let html = fs.readFileSync(file, "utf8");
  const pathname = "/" + path.relative(ROOT, path.dirname(file)).split(path.sep).join("/") + "/";
  // undo an earlier run
  html = html.replace(/<!--csn-->[\s\S]*?<!--\/csn-->\n?/g, "");
  const title = titleOf(html);

  // styles and the small menu script, once, in the head
  html = html.replace("</head>", `<!--csn--><style id="csn-css">${NAV.CSS}</style><!--/csn-->\n</head>`);

  // the header: replace the page's old site header if it has one, otherwise put it straight after <body> (or its skip link)
  const head = `<!--csn-->${NAV.header(pathname, title)}<!--/csn-->`;
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
  const foot = `<!--csn-->${NAV.footer(pathname)}<script>${NAV.JS}</script><!--/csn-->\n`;
  const fAt = html.lastIndexOf("<footer");
  html = fAt > -1 && fAt > mainAt ? html.slice(0, fAt) + foot + html.slice(fAt) : html.replace(/<\/body>/, foot + "</body>");
  fs.writeFileSync(file, html);
}

// the home page keeps its own header and menu; it gets the shared site map at the foot
function applyHome() {
  const file = path.join(ROOT, "index.html");
  let html = fs.readFileSync(file, "utf8").replace(/<!--csn-->[\s\S]*?<!--\/csn-->\n?/g, "");
  html = html.replace("</head>", `<!--csn--><style id="csn-css">${NAV.CSS}</style><!--/csn-->\n</head>`);
  const fAt = html.lastIndexOf("<footer");
  const foot = `<!--csn-->${NAV.footer("/").replace('href="#top"', 'href="#home-top"')}<!--/csn-->\n`;
  html = fAt > -1 ? html.slice(0, fAt) + foot + html.slice(fAt) : html.replace("</body>", foot + "</body>");
  fs.writeFileSync(file, html);
}

module.exports = function buildNav() {
  const list = pages(ROOT);
  list.forEach(apply);
  applyHome();
  console.log("Navigation on", list.length, "pages");
};
if (require.main === module) module.exports();
