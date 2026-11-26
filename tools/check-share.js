#!/usr/bin/env node
// Common Shade: checks "Share this page" and the social tags on every public page. Each failure says what to fix.
//   1. the link-building code in share.js (the same file the page runs): WhatsApp and LinkedIn links, encoding of line
//      breaks, &, #, % and "El Niño", the production address, tracking parameters dropped, a #section only when asked
//   2. the messages in data/site/share.json and the family patterns in tools/share-text.js: every page has one, each is
//      about 25 to 45 words, no two pages share one, and they keep the site's voice
//   3. every built public page: exactly one set of Open Graph and Twitter tags, page-specific title and description,
//      og:url equal to the page's canonical URL, the systems-map image as an absolute https URL, the share data the panel
//      reads, and both share buttons (hidden until the script runs)
//   4. the preview image itself: a JPEG of 1200 x 630, small enough for WhatsApp, reachable by crawlers
//   node tools/check-share.js
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const C = require("../share.js"), T = require("./share-text.js");
let bad = 0, notes = 0;
const ok = (c, m) => { if (c) console.log("  ok  ", m); else { bad++; console.log("  FAIL", m); } };
const note = m => { notes++; console.log("  note ", m); };
const read = f => fs.readFileSync(path.join(ROOT, f), "utf8");
const dec = s => s.replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

// ---- 1. the link-building code ----
const U = "https://beattheheat.asia/el-nino/";
const m1 = C.message("El Niño & heat: 100% #ready?\nSecond line", U);
ok(m1 === "El Niño & heat: 100% #ready?\nSecond line\n\n" + U, "the message is the text, a blank line, then the link");
const wa = C.whatsapp("El Niño & heat: 100% #ready?\nSecond line", U);
ok(wa.startsWith("https://wa.me/?text=") && !/wa\.me\/\d/.test(wa), "WhatsApp link has no phone number, so the visitor chooses the contact");
ok(/El%20Ni%C3%B1o%20%26%20heat%3A%20100%25%20%23ready%3F%0ASecond%20line%0A%0Ahttps%3A%2F%2Fbeattheheat\.asia%2Fel-nino%2F$/.test(wa), "WhatsApp text is fully percent-encoded: ñ, &, %, #, ?, line breaks and the URL");
ok(decodeURIComponent(wa.slice(20)) === m1, "decoding the WhatsApp link gives back the exact message");
ok(C.message("See " + U + " now", U) === "See " + U + " now", "a link the visitor already typed into the message is not added twice");
ok(C.message("   ", U) === U, "an emptied message still shares the link");
ok(C.linkedin(U) === "https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fbeattheheat.asia%2Fel-nino%2F", "LinkedIn link carries only the encoded page URL (no unsupported title or summary)");
ok(C.shareUrl(U, "http://localhost:8765/el-nino/?utm_source=x&fbclid=y#faq") === U, "the shared link is the production address, without tracking parameters or an unrequested #section");
ok(C.shareUrl(U, "https://preview.example/el-nino/#faq", { hash: "#faq" }) === U + "#faq", "a #section is kept only when the visitor asks for it");
ok(C.shareUrl("https://beattheheat.asia/whats-new/", "https://beattheheat.asia/whats-new/?role=funder&utm_medium=x", { keep: ["role"] }) === "https://beattheheat.asia/whats-new/?role=funder", "a deliberate view parameter the page keeps survives; others are dropped");
ok(C.shareUrl(U, U, { hash: "#\"><script>" }) === U, "a malformed #fragment is refused");

// ---- 2. the messages ----
const S = T.S;
const VOICE = /\bshould\b|\bmust\b|—/i;
for (const [p, e] of Object.entries(S.pages)) {
  const f = p === "/" ? "index.html" : p.slice(1) + "index.html";
  if (!fs.existsSync(path.join(ROOT, f))) { ok(false, `data/site/share.json names ${p}, which is not a built page (remove the entry or fix the path)`); continue; }
}
ok(Object.values(S.pages).every(e => e.text && !VOICE.test(e.text + (e.title || "") + (e.description || ""))), "the written messages keep the site's voice (no 'should', 'must' or em dash)");

// ---- 3. every built public page ----
const list = [];
(function walk(d) {
  for (const e of fs.readdirSync(path.join(ROOT, d), { withFileTypes: true })) {
    const r = d ? d + "/" + e.name : e.name;
    if (e.isDirectory()) { if (!/^\.|^(node_modules|research|tools|docs|images|media|feeds|data)$/.test(e.name) || d) { if (!/^\./.test(e.name) && e.name !== "node_modules") walk(r); } }
    else if (e.name === "index.html") list.push(r);
  }
})("");
const sitemap = fs.existsSync(path.join(ROOT, "sitemap.xml")) ? read("sitemap.xml") : "";
const texts = new Map(), recs = [];
let pagesOk = 0;
for (const f of list) {
  const html = read(f), p = "/" + f.replace(/index\.html$/, "");
  if (!/<header class="csn"/.test(html)) continue;                                  // not a site page (a film frame, a template)
  const head = html.slice(0, html.indexOf("</head>"));
  const one = re => (head.match(re) || []).length === 1;
  const get = re => { const m = head.match(re); return m ? dec(m[1]) : ""; };
  const probs = [];
  for (const k of ["og:type", "og:site_name", "og:url", "og:title", "og:description", "og:image", "og:image:type", "og:image:width", "og:image:height", "og:image:alt"]) if (!one(new RegExp(`<meta property="${k}" content="[^"]*">`, "g"))) probs.push(`${k} not exactly once`);
  for (const k of ["twitter:card", "twitter:title", "twitter:description", "twitter:image", "twitter:image:alt"]) if (!one(new RegExp(`<meta name="${k}" content="[^"]*">`, "g"))) probs.push(`${k} not exactly once`);
  const ogUrl = get(/<meta property="og:url" content="([^"]*)"/), canon = get(/<link rel="canonical" href="([^"]*)"/), img = get(/<meta property="og:image" content="([^"]*)"/);
  if (!/^https:\/\/beattheheat\.asia\//.test(ogUrl)) probs.push(`og:url is not an absolute production URL (${ogUrl})`);
  if (canon && canon !== ogUrl) probs.push(`og:url (${ogUrl}) differs from the canonical URL (${canon})`);
  if (!/^https:\/\/beattheheat\.asia\/\S+\.(jpg|png)$/.test(img)) probs.push(`og:image is not an absolute https image URL (${img})`);
  else if (!fs.existsSync(path.join(ROOT, img.replace("https://beattheheat.asia/", "")))) probs.push(`og:image points to a missing file (${img})`);
  if (/localhost|127\.0\.0\.1|github\.io|preview/.test(get(/<meta property="og:url" content="([^"]*)"/) + img)) probs.push("a local or preview host in the tags");
  if (!/<meta name="twitter:card" content="summary_large_image">/.test(head)) probs.push("twitter:card is not summary_large_image");
  // the tags sit only in the one block the navigation build writes
  const outside = html.replace(/<!--csn-->[\s\S]*?<!--\/csn-->/g, "");
  if (/<meta (property="og:|name="twitter:)/.test(outside)) probs.push("social tags outside the build's block (a page builder still writes its own)");
  if (p !== "/404/") {
    let d = null; try { d = JSON.parse(get(/<script type="application\/json" id="cs-share-data">([\s\S]*?)<\/script>/)); } catch (e) {}
    if (!d) probs.push("no share data for the panel");
    else {
      if (d.url !== ogUrl) probs.push("share data URL differs from og:url");
      if (!d.text || !d.title || !/^\/share\.js\?v=\d+$/.test(d.js || "")) probs.push("share data incomplete");
      const r = T.resolve(p, html); recs.push(r);
      const w = C.words(d.text);
      if (w < 20 || w > 50) probs.push(`share message is ${w} words (aim for 25 to 45; edit data/site/share.json or the family in tools/share-text.js)`);
      if (VOICE.test(d.text)) probs.push("share message uses 'should', 'must' or an em dash");
      if (texts.has(d.text)) probs.push(`share message is the same as ${texts.get(d.text)}'s`); else texts.set(d.text, p);
      if (r.source === "fallback") note(`${p} has no written share message; it uses its description (add one to data/site/share.json)`);
    }
    const buttons = (html.match(/data-cs-share hidden/g) || []).length;
    if (buttons < 1) probs.push("no share button");
    if (!/^\/(print\/|join\/)/.test(p) && p !== "/" && buttons < 2) probs.push("missing one of the two share buttons (near the title, and at the end)");
  }
  if (probs.length) ok(false, `${p}: ${probs.join("; ")}`); else pagesOk++;
}
ok(pagesOk > 150, `${pagesOk} public pages carry one complete, page-specific set of social tags and the share controls`);
const titles = new Map(); let dupT = [];
for (const r of recs) { if (titles.has(r.title)) dupT.push(`${r.pathname} and ${titles.get(r.title)}`); titles.set(r.title, r.pathname); }
ok(!dupT.length, "every page shares its own title" + (dupT.length ? ` (same title: ${dupT.join("; ")})` : ""));
const sys = recs.filter(r => r.image.url === T.IMAGE.url).length, sof = recs.filter(r => /whats-new\/\d{4}-\d{2}\/card\.png$/.test(r.image.url)).length;
ok(sys + sof === recs.length, `every page previews with the systems map (${sys}), except State of the field editions, which keep their own card (${sof})`);
ok(recs.every(r => !r.url.includes("#") && (r.pathname === "/" || r.url !== "https://beattheheat.asia/")), "the shared image never redirects a page's link to the homepage or the map");
if (sitemap) ok(recs.filter(r => !r.print).every(r => sitemap.includes(`<loc>${r.url}</loc>`) || r.pathname === "/signals/all/"), "each page's shared URL is the URL the sitemap lists");

// ---- 4. the image ----
const IMG = path.join(ROOT, S.image.path.slice(1)), buf = fs.existsSync(IMG) ? fs.readFileSync(IMG) : null;
let dims = null;
if (buf && buf[0] === 0xFF && buf[1] === 0xD8) for (let i = 2; i < buf.length - 9;) {
  if (buf[i] !== 0xFF) { i++; continue; }
  const mk = buf[i + 1], len = buf.readUInt16BE(i + 2);
  if (mk >= 0xC0 && mk <= 0xC3) { dims = [buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5)]; break; }
  i += 2 + len;
}
ok(!!buf && S.image.type === "image/jpeg" && !!dims, `${S.image.path} exists and is a JPEG (render it with tools/share-image/render.js)`);
ok(dims && dims[0] === S.image.width && dims[1] === S.image.height && dims[0] === 1200 && dims[1] === 630, `the preview image is 1200 x 630, as its tags say (${dims ? dims.join(" x ") : "unreadable"})`);
ok(buf && buf.length < 300 * 1024, `the preview image is under 300 KB, so WhatsApp shows it (${buf ? Math.round(buf.length / 1024) : "?"} KB)`);
ok(S.image.alt && S.image.alt.length > 40, "the preview image has alternative text describing the map");
const robots = fs.existsSync(path.join(ROOT, "robots.txt")) ? read("robots.txt") : "";
ok(!/^Disallow:\s*\/(images\/?)?\s*$/m.test(robots), "robots.txt lets crawlers fetch the preview image");
ok(fs.existsSync(path.join(ROOT, "tools", "share-image", "card.html")) && fs.existsSync(path.join(ROOT, "tools", "share-image", "render.js")), "the image keeps its editable source (tools/share-image/card.html) and its export script");

console.log(bad ? `share check: ${bad} failing` : `share check passed: ${pagesOk} pages with one set of social tags, ${texts.size} distinct share messages, the systems-map preview image${notes ? `, ${notes} notes` : ""}`);
process.exit(bad ? 1 : 0);
