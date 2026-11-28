// Common Shade: the words a page offers when a visitor shares it, and the Open Graph and Twitter tags in its head.
// One record per page, resolved here and nowhere else:
//   1. data/site/share.json "pages": an editor's message (and optional title or description), checked against the page;
//   2. a family of generated pages (cities, countries, tool profiles, paths, printable sheets): a message built from
//      that page's own record, in words written once below;
//   3. otherwise the page's own description, then its title, and the page is named in the build output so the gap shows.
// Every page uses the one preview image of the systems map (share.json "image"); a State of the field edition keeps its
// own card (tools/sof-card.js), the owner's earlier choice. tools/build-nav.js writes the tags and the share data,
// share.js builds the links in the browser, tools/check-share.js checks it all.
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const SITE = "https://beattheheat.asia";
const S = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "site", "share.json"), "utf8"));
const CAT = (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, "data", "heat-tools", "catalogue.json"), "utf8")); } catch (e) { return { records: [] }; } })();
const PATHS = require("./site-nav.js").PATHS;

const dec = s => String(s || "").replace(/&amp;/g, "&").replace(/&#39;|&#x27;|&rsquo;/g, "’").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const lc1 = s => s.charAt(0).toLowerCase() + s.slice(1);
const IMAGE = Object.assign({}, S.image, { url: SITE + S.image.path });

// printable sheets point back to the full page they summarise (shown in the panel; the sheet keeps its own address)
function parentOf(p) {
  let m;
  if ((m = p.match(/^\/print\/city-([a-z]+)\/$/))) return `/cities/${m[1]}/`;
  if (/^\/print\/actions-/.test(p)) return "/practical-actions/";
  if (/^\/print\/cooling-/.test(p)) return "/cooling-options/";
  return { "/print/el-nino-briefing/": "/el-nino/", "/print/paying-for-protection/": "/paying-for-protection/", "/print/heatwaves/": "/heatwaves/", "/print/el-nino-worksheet/": "/el-nino-and-cities/" }[p] || "";
}

// families: one sentence pattern each, filled from the page's own record
function family(p, title) {
  let m;
  if ((m = p.match(/^\/cities\/([a-z]+)\/$/))) {
    const city = (title.match(/^Extreme heat in (.+?):/) || [])[1]; if (!city) return null;
    return `How extreme heat shows up in ${city}: the state of its heat action plan, the vicious cycles the evidence ties to the city, who is hit hardest, and who is already working on protection there.`;
  }
  if ((m = p.match(/^\/print\/city-([a-z]+)\/$/))) {
    const city = (title.match(/^Extreme heat in (.+)$/) || [])[1]; if (!city) return null;
    return `A printable one-page brief on extreme heat in ${city}: the vicious cycles the evidence ties to the city, who heat hits hardest, a worked plan to learn from, who is already at work, and questions for its heat plan.`;
  }
  if ((m = p.match(/^\/countries\/([a-z-]+)\/$/))) {
    const c = (title.match(/^(.+?): heat country snapshot$/) || [])[1]; if (!c) return null;
    const the = c === "Philippines" ? "the Philippines" : c;
    return `A snapshot of extreme heat in ${the}: national plans and law, heat warnings, rules for heat at work, cooling, money for protection, and who is working on it, with every point linked to its source.`;
  }
  if ((m = p.match(/^\/heat-tools\/([a-z0-9_]+)\/$/))) {
    const r = CAT.records.find(x => x.id === m[1]); if (!r) return null;
    const by = r.origin === "external" ? `, from ${r.provider}` : ", from Common Shade";
    return `${r.name}${by}: ${lc1(r.summary.replace(/\.$/, ""))}. Its Heat Tool Finder profile says what it needs, what it gives and what it cannot tell you. A listing, not an endorsement.`;
  }
  if ((m = p.match(/^\/living-knowledge\/for\/([a-z]+)\/$/))) {
    const g = (require("../living-knowledge/lk-core.js").STAKE.find(x => x[0] === m[1]) || [])[1]; if (!g) return null;
    return `What ${g.toLowerCase()} could do with each documented local practice for living with heat: one suggestion per practice, its kind of evidence and what it depends on. Printable.`;
  }
  if ((m = p.match(/^\/living-knowledge\/([a-z0-9-]+)\/$/))) {
    let r = null; try { r = JSON.parse(require("fs").readFileSync(require("path").join(__dirname, "..", "living-knowledge", "practices.json"), "utf8")).practices.find(x => x.id === m[1]); } catch (e) { return null; }
    if (!r) return null;
    return `${r.title}: a local practice for living with heat, with where it is documented, what kind of evidence exists, where it stops working and what it takes to keep it usable.`;
  }
  if ((m = p.match(/^\/opportunities\/([a-z0-9-]+)\/$/))) {
    // the listing itself, from the hub's data file (tools/build-opportunities.js), not parsed from the page title
    let it = null; try { it = JSON.parse(require("fs").readFileSync(require("path").join(__dirname, "..", "opportunities", "opportunities.json"), "utf8")).items.find(x => x.id === m[1]); } catch (e) { return null; }
    if (!it) return null;
    return `${it.title}, at ${it.org_name}: listed on Heat Opportunities with why it matters for heat, the deadline as published and a link to the official listing. Read the official listing before applying.`;
  }
  if ((m = p.match(/^\/paths\/([a-z]+)\/$/))) {
    const r = PATHS.paths.find(x => x.id === m[1]); if (!r) return null;
    return `A short guided path through Common Shade for ${lc1(r.label)}. ${r.card} A handful of stops, each answering one question you are likely to be asked.`;
  }
  if ((m = title.match(/^Practical actions: (.+?)(?: \((\d) of (\d)\))?$/)) && /^\/print\/actions-/.test(p)) {
    const part = m[2] ? ` (part ${m[2]} of ${m[3]})` : "";
    return `A printable one-page sheet of practical actions against extreme heat for ${lc1(m[1])}${part}: what to do, who acts, what it takes to run, what could stop it, and what each action only works with.`;
  }
  if ((m = title.match(/^Cooling options: (.+)$/)) && /^\/print\/cooling-/.test(p)) {
    return `A printable one-page sheet on cooling options for ${lc1(m[1])}: what to build or change, what keeps each option working, what the evidence says, and where to find the sources.`;
  }
  return null;
}

// the page's own head, read before the tags are rewritten (on a second run the values come from our own block,
// so the result is the same)
function own(html) {
  const g = re => { const m = html.match(re); return m ? dec(m[1]) : ""; };
  return {
    ogTitle: g(/<meta property="og:title" content="([^"]*)"/), ogType: g(/<meta property="og:type" content="([^"]*)"/),
    ogImage: g(/<meta property="og:image" content="([^"]*)"/), ogImageAlt: g(/<meta property="og:image:alt" content="([^"]*)"/),
    desc: g(/<meta name="description" content="([^"]*)"/),
    title: g(/<title>([\s\S]*?)<\/title>/).replace(/\s*[|·–-]\s*Common Shade\s*$/, "").trim(),
    canonical: g(/<link rel="canonical" href="([^"]*)"/)
  };
}

// one record for one page
function resolve(pathname, html) {
  const o = own(html), e = S.pages[pathname] || {};
  const title = e.title || o.ogTitle || o.title || "Common Shade";
  const description = e.description || o.desc || title;
  const fam = e.text ? null : family(pathname, title);
  const text = e.text || fam || description;
  const source = e.text ? "page" : fam ? "family" : "fallback";
  // a State of the field edition keeps its own share card; every other page shows the systems map
  const sof = /\/whats-new\/\d{4}-\d{2}\/card\.png$/.test(o.ogImage);
  const image = sof ? { url: o.ogImage, width: 1200, height: 630, type: "image/png", alt: o.ogImageAlt || title } : IMAGE;
  const url = /^https:\/\/beattheheat\.asia\//.test(o.canonical) ? o.canonical : SITE + pathname;
  const print = /^\/print\/./.test(pathname);
  return { pathname, title, description, text, source, url, type: o.ogType || "website", image, print, parent: print ? parentOf(pathname) : "", keep: (S.keep || {})[pathname] || [] };
}

// the one authoritative set of social tags, and the data the share panel reads
function head(r, js) {
  const i = r.image;
  const data = js ? { title: r.title, text: r.text, url: r.url, js } : null;
  if (data && r.keep.length) data.keep = r.keep;
  if (data && r.print) { data.print = true; if (r.parent) data.parent = r.parent; }
  return `<meta property="og:type" content="${esc(r.type)}"><meta property="og:site_name" content="Common Shade"><meta property="og:url" content="${esc(r.url)}">` +
    `<meta property="og:title" content="${esc(r.title)}"><meta property="og:description" content="${esc(r.description)}">` +
    `<meta property="og:image" content="${esc(i.url)}"><meta property="og:image:type" content="${i.type}"><meta property="og:image:width" content="${i.width}"><meta property="og:image:height" content="${i.height}"><meta property="og:image:alt" content="${esc(i.alt)}">` +
    `<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(r.title)}"><meta name="twitter:description" content="${esc(r.description)}"><meta name="twitter:image" content="${esc(i.url)}"><meta name="twitter:image:alt" content="${esc(i.alt)}">` +
    (data ? `<script type="application/json" id="cs-share-data">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>` : "");
}
// remove every Open Graph and Twitter tag a page builder wrote, so only ours remain
const stripSocial = html => html.replace(/[ \t]*<meta (?:property="og:[^"]*"|name="twitter:[^"]*")[^>]*>[ \t]*\n?/g, "");

// the button, the same on every page and in both places (defined with the menu, which shows it)
const BUTTON = require("./site-nav.js").SHARE_BUTTON;

module.exports = { SITE, S, IMAGE, resolve, head, stripSocial, family, parentOf, BUTTON, own };
