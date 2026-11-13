// Common Shade: the machine-readable doors, in one place. Everything an agent or crawler looks for at a standard address,
// written from what the site really has (no endpoint is described unless the file exists):
//   /.well-known/ard.json, /.well-known/api-catalog (RFC 9727), /.well-known/security.txt (RFC 9116), /.well-known/tdmrep.json,
//   /openapi.json (OpenAPI 3.1, the open data files as read-only GETs, with examples), /sitemap.json, /agents.txt, /auth.md,
//   /terms-of-use.md, /feed.xml (Atom, from data/site/growth.json), and a Markdown twin (index.md) beside every page in sitemap.xml.
// It also adds one small block to the head of every page (between <!--agent--> markers, safe to run again): the Markdown
// twin, the feed, the colour scheme, the referrer policy, the date the page last changed, and speculation rules that start
// fetching a page of this site the moment a reader presses on a link to it (prefetch only, never prerender: no script of the
// next page runs early, so visit counts stay true). Pages over 1 MB and files are left out, so a cancelled tap costs little
// data. Browsers without support, and Chrome with Data Saver on, ignore the rules.
// GitHub Pages cannot set HTTP headers, negotiate content (Accept: text/markdown) or run a server, so none of that is claimed
// here; the twins are the static answer. Runs last in tools/build-static.js, after build-nav.js.
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), SITE = "https://beattheheat.asia";
const T = require("./for-ai-text.js");
const TODAY = new Date().toISOString().slice(0, 10);
const w = (rel, s) => { const f = path.join(ROOT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
const json = o => JSON.stringify(o, null, 2) + "\n";
const dec = s => s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
const xml = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// ---- the pages: every <loc> of sitemap.xml that has a file ----
const urls = [...fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace(SITE, ""));
const fileOf = u => path.join(ROOT, u.replace(/^\//, ""), "index.html");
const pages = urls.filter(u => u.endsWith("/") && fs.existsSync(fileOf(u)));
const VERS = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "site", "page-versions.json"), "utf8"));

// ---- HTML to Markdown, no dependencies: the page's own words, headings, links, lists and tables ----
function toMd(html) {
  const m = html.match(/<main[\s\S]*<\/main>/); let s = m ? m[0] : html;
  s = s.replace(/<!--[\s\S]*?-->/g, "").replace(/<(script|style|svg|noscript|template|button|form|select|nav|dialog)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/<[^>]+\bhidden\b[^>]*>[\s\S]*?<\/(div|section|p|span)>/gi, "")
    .replace(/<span class="visually-hidden">[\s\S]*?<\/span>/g, "")
    .replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, n, t) => `\n\n${"#".repeat(+n)} ${t}\n\n`)
    .replace(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, h, t) => { const x = t.replace(/<[^>]+>/g, "").trim(); return x ? `[${x}](${h.startsWith("/") ? SITE + h : h})` : ""; })
    .replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, "**$2**").replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, "*$2*")
    .replace(/<img\b[^>]*alt="([^"]+)"[^>]*>/gi, "[Image: $1]")
    .replace(/<\/dt>/gi, "**: ").replace(/<li\b[^>]*>/gi, "\n- ").replace(/<\/(tr)>/gi, "\n").replace(/<\/(td|th)>/gi, " | ")
    .replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|section|article|header|footer|ul|ol|dl|dd|figure|figcaption|blockquote|details|summary|table)>/gi, "\n\n")
    .replace(/<(dt)\b[^>]*>/gi, "\n**").replace(/<[^>]+>/g, "");
  return dec(s).replace(/[ \t]+\n/g, "\n").replace(/\n[ \t]+/g, "\n").replace(/[ \t]{2,}/g, " ").replace(/\n-[ ]?\n+(#+ )?/g, (_, h) => "\n- " + (h ? "" : "")).replace(/\n{3,}/g, "\n\n").trim();
}
let twins = 0;
const HEAVY = pages.filter(u => u !== "/" && fs.statSync(fileOf(u)).size > 1e6).map(u => u + "*");
const PREFETCH = `<script type="speculationrules">${JSON.stringify({ prefetch: [{ where: { and: [{ href_matches: "/*" }, { not: { href_matches: ["/*.*", ...HEAVY] } }, { not: { selector_matches: "[download],[target=_blank],[rel~=nofollow]" } }] }, eagerness: "conservative" }] })}</script>`;
const head = (u, html) => {
  const ver = VERS[u] ? VERS[u].changed : TODAY;
  return `<!--agent--><link rel="alternate" type="text/markdown" href="${u}index.md"><link rel="alternate" type="application/atom+xml" title="What changed on Common Shade" href="/feed.xml">${u === "/" ? `<link rel="api-catalog" href="/.well-known/api-catalog">` : ""}<meta name="color-scheme" content="light"><meta name="referrer" content="strict-origin-when-cross-origin"><meta property="article:modified_time" content="${ver}">${PREFETCH}<!--/agent-->`;
};
for (const u of pages) {
  const f = fileOf(u); let html = fs.readFileSync(f, "utf8");
  html = html.replace(/<!--agent-->[\s\S]*?<!--\/agent-->/g, "").replace("</head>", head(u, html) + "\n</head>");
  fs.writeFileSync(f, html);
  const title = ((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || u).replace(/\s*·\s*Common Shade\s*$/, "");
  const desc = dec((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "");
  w(path.join(u, "index.md"), `---\ntitle: "${dec(title).replace(/"/g, "'")}"\nurl: ${SITE}${u}\nupdated: ${(VERS[u] || { changed: TODAY }).changed}\nlicence: CC BY 4.0\n---\n\n${desc ? `> ${desc}\n\n` : ""}${toMd(html)}\n\n---\nHuman edition: ${SITE}${u} · Corrections: ${SITE}/corrections/ · All pages as one file: ${SITE}/llms-full.txt\n`);
  twins++;
}

// ---- OpenAPI 3.1: the open files, read-only, with real examples taken from the files themselves ----
const mime = { JSON: "application/json", text: "text/plain", XML: "application/xml", HTML: "text/html" };
const sample = (p, fmt) => {
  const f = path.join(ROOT, p); if (!fs.existsSync(f) || !fs.statSync(f).isFile()) return undefined;
  const raw = fs.readFileSync(f, "utf8");
  if (fmt === "JSON") { try { const j = JSON.parse(raw); const x = Array.isArray(j) ? j.slice(0, 1) : j;
    const t = JSON.stringify(x); if (t.length <= 1200) return x;
    if (!Array.isArray(j) && typeof j === "object") { const o = {}; for (const [k, v] of Object.entries(j)) { if (JSON.stringify(v).length <= 200) o[k] = v; if (Object.keys(o).length >= 4) break; } return o; } } catch (e) {} return undefined; }
  return raw.split("\n").slice(0, 6).join("\n").slice(0, 600);
};
const paths = {};
for (const [p, what, fmt] of T.ENDPOINTS.filter(e => !e[0].endsWith("/"))) {
  const ex = sample(p, fmt), ctype = mime[fmt] || "text/plain";
  paths[p] = { get: { operationId: "get" + p.replace(/[^a-zA-Z0-9]+(.)?/g, (_, c) => (c || "").toUpperCase()), summary: what, description: `${what}. A plain static file: no key, no login.`, tags: [fmt === "JSON" ? "data" : "guides"],
    responses: { "200": { description: "The file.", content: { [ctype]: Object.assign({ schema: fmt === "JSON" ? { type: ["object", "array"] } : { type: "string" } }, ex !== undefined ? { example: ex } : {}) } } } } };
}
w("openapi.json", json({
  openapi: "3.1.0",
  info: { title: "Common Shade open files", version: TODAY, summary: "Read-only files about extreme heat in South and Southeast Asia.", description: "Common Shade is a static website. There is no server API: these are the open files it publishes, each a plain GET. Text, data and films are CC BY 4.0. Cite the original source of any figure as well; the sources are listed at /sources/.", license: { name: "CC BY 4.0", url: "https://creativecommons.org/licenses/by/4.0/" }, contact: { name: "Corrections and questions", url: SITE + "/corrections/" }, termsOfService: SITE + "/privacy/" },
  servers: [{ url: SITE, description: "Production (GitHub Pages)" }],
  security: [],
  tags: [{ name: "data", description: "Open JSON data" }, { name: "guides", description: "Guides to the site for AI systems, and the sitemap" }],
  paths,
  externalDocs: { description: "For AI agents", url: SITE + "/for-ai/" }
}));

// ---- discovery files ----
const exp = new Date(Date.now() + 300 * 864e5).toISOString().slice(0, 10) + "T00:00:00.000Z";
const feed = SITE + "/feed.xml";
w(".well-known/ard.json", json({
  version: "0.91", name: "beattheheat.asia", description: "Agent interface directory for Common Shade, a free evidence base on extreme heat in South and Southeast Asia. A static website: open files, no server API, no login.",
  openapi: SITE + "/openapi.json", llmstxt: SITE + "/llms.txt", llms_full: SITE + "/llms-full.txt", sitemap: SITE + "/sitemap.xml", sitemap_json: SITE + "/sitemap.json", api_catalog: SITE + "/.well-known/api-catalog",
  for_ai: SITE + "/for-ai/", record: SITE + "/for-ai.json", feed, agents_txt: SITE + "/agents.txt", authentication: { type: "none", note: "Everything is open to read; see " + SITE + "/auth.md" }, license: "CC BY 4.0", terms: SITE + "/terms-of-use.md", privacy: SITE + "/privacy/", security: SITE + "/.well-known/security.txt"
}));
w(".well-known/api-catalog", json({ linkset: [{ anchor: SITE + "/.well-known/api-catalog", "service-desc": [{ href: SITE + "/openapi.json", type: "application/vnd.oai.openapi+json" }], "service-doc": [{ href: SITE + "/for-ai/", type: "text/html" }], item: [{ href: SITE + "/openapi.json" }] },
  { anchor: SITE + "/openapi.json", "service-desc": [{ href: SITE + "/openapi.json", type: "application/vnd.oai.openapi+json" }], "service-doc": [{ href: SITE + "/for-ai/", type: "text/html" }, { href: SITE + "/llms.txt", type: "text/plain" }], status: [{ href: SITE + "/feed.xml", type: "application/atom+xml" }] }] }));
w(".well-known/security.txt", `# Common Shade is a static website with no accounts or servers. Reports of a problem with the site, a broken link or a wrong figure are welcome.\nContact: ${SITE}/corrections/\nExpires: ${exp}\nPreferred-Languages: en\nCanonical: ${SITE}/.well-known/security.txt\nPolicy: ${SITE}/privacy/\n`);
w(".well-known/tdmrep.json", json([{ location: "/", "tdm-reservation": 0, "tdm-policy": SITE + "/terms-of-use.md" }]));
w("sitemap.json", json({ name: "Common Shade", url: SITE + "/", updated: TODAY, license: "CC BY 4.0", pages: pages.map(u => ({ url: SITE + u, markdown: SITE + u + "index.md", updated: (VERS[u] || { changed: TODAY }).changed })), also: { xml: SITE + "/sitemap.xml", llms: SITE + "/llms.txt" } }));
w("agents.txt", `# Common Shade: what automated readers may do here.\n# Human-readable version: ${SITE}/for-ai/ · structured: ${SITE}/for-ai.json\n\nUser-agent: *\nAllow: /\nAuthentication: none\nRate: please keep to a gentle pace (a few requests a second at most)\nLicence: CC BY 4.0, credit Common Shade and cite the original source of a figure\nTraining: allowed\nSearch: allowed\nAnswers: allowed\nActions: none offered (read-only; nothing to buy, submit or sign)\nGuides: ${SITE}/llms.txt\nOpenAPI: ${SITE}/openapi.json\nCatalog: ${SITE}/.well-known/ard.json\nCorrections: ${SITE}/corrections/\n`);
w("auth.md", `# Authentication\n\nCommon Shade (${SITE}) needs none. It is a static, read-only website: every page and file is open, and there is no login, key, token or OAuth flow. Nothing here asks an agent to act on anyone's behalf.\n\n- Open files: ${SITE}/openapi.json\n- Guide for agents: ${SITE}/for-ai/\n- Privacy: ${SITE}/privacy/\n`);
w("terms-of-use.md", `# Terms of use\n\nCommon Shade (${SITE}) shares what it knows freely.\n\n- **Text, data and films:** CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Reuse them, including for search, answers and training, and credit Common Shade with a link.\n- **Code:** MIT licence.\n- **Sources:** when you quote a figure, cite its original source as well. Each is linked where it appears and listed at ${SITE}/sources/.\n- **What it is:** evidence to help people think and plan. It is not medical, legal or financial advice and not an emergency service. Linking to an organisation implies no partnership or endorsement. Illustrative numbers are labelled illustrative.\n- **Gentle use:** please keep requests to a gentle pace so the site stays quick for people on slow networks.\n- **Privacy:** ${SITE}/privacy/\n- **Corrections:** ${SITE}/corrections/\n`);

// ---- Atom feed: every reviewed change on Common Shade, newest first ----
const G = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "site", "growth.json"), "utf8")).entries.slice().sort((a, b) => String(b.added).localeCompare(String(a.added)));
w("feed.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom">\n  <title>What changed on Common Shade</title>\n  <subtitle>Each reviewed change to the free evidence base on extreme heat in South and Southeast Asia</subtitle>\n  <link href="${feed}" rel="self" type="application/atom+xml"/>\n  <link href="${SITE}/growing/" rel="alternate" type="text/html"/>\n  <id>${SITE}/</id>\n  <updated>${G.length ? G[0].added : TODAY}T00:00:00Z</updated>\n  <rights>CC BY 4.0</rights>\n${G.slice(0, 30).map(e => `  <entry>\n    <title>${xml(e.title)}</title>\n    <link href="${SITE}/growing/#${xml(e.id)}" rel="alternate" type="text/html"/>\n    <id>${SITE}/growing/#${xml(e.id)}</id>\n    <updated>${e.added}T00:00:00Z</updated>\n    <summary>${xml(e.why)}</summary>\n  </entry>`).join("\n")}\n</feed>\n`);

// ---- robots.txt, llms.txt and the sitemap point to them ----
const add = (file, marker, text) => { const f = path.join(ROOT, file); let s = fs.readFileSync(f, "utf8"); const i = s.indexOf(marker); if (i >= 0) { const j = s.indexOf("\n## ", i + marker.length); s = s.slice(0, i) + (j >= 0 ? s.slice(j + 1) : ""); } fs.writeFileSync(f, s.replace(/\n*$/, "\n\n") + text + "\n"); };
add("llms.txt", "## Machine-readable files", `## Machine-readable files\n\n- [OpenAPI description of the open files](${SITE}/openapi.json)\n- [Agent directory](${SITE}/.well-known/ard.json) and [API catalog](${SITE}/.well-known/api-catalog)\n- [Atom feed of changes](${feed}), [JSON sitemap](${SITE}/sitemap.json), [agents.txt](${SITE}/agents.txt)\n- A Markdown twin of every page: add index.md to its address, for example ${SITE}/for-ai/index.md\n- [Privacy and terms](${SITE}/privacy/), [terms-of-use.md](${SITE}/terms-of-use.md), [auth.md](${SITE}/auth.md)`);
console.log(`agent files: ${twins} Markdown twins, openapi.json (${Object.keys(paths).length} paths), ard.json, api-catalog, security.txt, tdmrep.json, sitemap.json, agents.txt, auth.md, terms-of-use.md, feed.xml`);
