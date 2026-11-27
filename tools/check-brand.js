#!/usr/bin/env node
// Common Shade: checks /brand/ ("Brand & Media") and the official channels. Each failure says what to fix.
//   1. logo files: every file data/site/brand.json names exists, the SVGs match the logo's own code (tools/site-nav.js
//      MARK and the favicon), the PNGs keep transparency where promised
//   2. the logo pack: holds exactly the catalogue's logo files and a README, nothing else (no drafts, no legacy image)
//   3. the page: one card per logo, image and film, links to files that exist, copy buttons that carry public https
//      URLs (never a local path), the finder, the "All video links" list, the channels, title, description, canonical
//   4. films: each one exists, has a duration read from the file, a related page that exists, and no film is listed twice
//   5. the shared footer: the channels and the Brand & Media link appear exactly once on every page that has a footer
//   node tools/check-brand.js
"use strict";
const fs = require("fs"), path = require("path"), zlib = require("zlib");
const ROOT = path.join(__dirname, "..");
const B = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "site", "brand.json"), "utf8"));
const BR = require("./build-brand.js"), M = require("./media-meta.js");
let bad = 0; const ok = (c, m) => { console.log(c ? "  ok  " : "  FAIL", m); if (!c) bad++; };
const has = f => fs.existsSync(path.join(ROOT, f));
const read = f => fs.readFileSync(path.join(ROOT, f), "utf8");

// ---- 1. logo files ----
for (const l of B.logos) for (const f of [l.svg, l.png].filter(Boolean)) ok(has(f), `${f} exists (${/\.png$/.test(f) ? "run node tools/brand/render.js" : "run node tools/build-static.js"})`);
for (const [f, make] of Object.entries(BR.SVGS)) ok(has(f) && read(f) === make(), `${f} matches the logo's own code (rebuild if the mark changed)`);
for (const l of B.logos.filter(l => l.png && has(l.png))) {
  const b = fs.readFileSync(path.join(ROOT, l.png));
  ok(b.readUInt32BE(0) === 0x89504E47 && b[25] === 6, `${l.png} is a PNG with an alpha channel`);
}
ok(B.logos.every(l => !/social-share-cs|draft/i.test((l.svg || "") + (l.png || ""))), "no legacy or draft file is offered as a logo");

// ---- 2. the pack ----
const zipf = path.join(ROOT, BR.PACK);
ok(fs.existsSync(zipf), `${BR.PACK} exists`);
if (fs.existsSync(zipf)) {
  const z = fs.readFileSync(zipf), names = [];
  const e = z.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06])), n = z.readUInt16LE(e + 10); let at = z.readUInt32LE(e + 16);
  for (let i = 0; i < n; i++) {
    const nl = z.readUInt16LE(at + 28), xl = z.readUInt16LE(at + 30), cl = z.readUInt16LE(at + 32), name = z.toString("utf8", at + 46, at + 46 + nl), lo = z.readUInt32LE(at + 42);
    const meth = z.readUInt16LE(lo + 8), cs = z.readUInt32LE(lo + 18), us = z.readUInt32LE(lo + 22), off = lo + 30 + z.readUInt16LE(lo + 26) + z.readUInt16LE(lo + 28);
    const data = meth === 8 ? zlib.inflateRawSync(z.subarray(off, off + cs)) : z.subarray(off, off + cs);
    names.push(name);
    const src = B.logos.flatMap(l => [l.svg, l.png]).filter(Boolean).find(f => "common-shade-logo-pack/" + path.basename(f) === name);
    if (src) ok(data.length === us && data.equals(fs.readFileSync(path.join(ROOT, src))), `pack entry ${name} is byte-identical to ${src}`);
    at += 46 + nl + xl + cl;
  }
  const want = ["common-shade-logo-pack/README.txt", ...B.logos.flatMap(l => [l.svg, l.png]).filter(Boolean).filter(has).map(f => "common-shade-logo-pack/" + path.basename(f))].sort();
  ok(JSON.stringify(names.slice().sort()) === JSON.stringify(want), `the pack holds exactly the catalogue's logo files and a README (${names.length} entries)`);
}

// ---- 3. the page ----
const html = has("brand/index.html") ? read("brand/index.html") : "";
ok(!!html, "brand/index.html exists");
const C = BR.catalogue();
ok(/<title>Brand &amp; Media · Common Shade<\/title>/.test(html), "the page title is “Brand & Media”");
ok(/<link rel="canonical" href="https:\/\/beattheheat\.asia\/brand\/">/.test(html), "canonical URL is https://beattheheat.asia/brand/");
ok(/<meta property="og:url" content="https:\/\/beattheheat\.asia\/brand\/">/.test(html) && (html.match(/property="og:image"/g) || []).length === 1, "one set of social tags, og:url equal to the canonical URL");
ok(has("sitemap.xml") && read("sitemap.xml").includes("<loc>https://beattheheat.asia/brand/</loc>"), "the sitemap lists /brand/");
for (const id of ["logos", "colours", "assets", "videos", "social", "usage"]) ok(html.includes(`id="${id}"`) && html.includes(`href="#${id}"`), `section #${id} exists and the in-page menu links to it`);
const hrefs = [...html.matchAll(/(?:href|src)="(\/[^"#?]*\.(?:svg|png|jpg|webp|zip|mp4|vtt|json))"/g)].map(m => m[1]);
const missing = [...new Set(hrefs)].filter(h => !has(h.slice(1)));
ok(missing.length === 0, `every file the page links exists${missing.length ? ": missing " + missing.slice(0, 5).join(", ") : ""}`);
const copies = [...html.matchAll(/data-bm-copy="([^"]*)"/g)].map(m => m[1]);
ok(copies.length > 0 && copies.every(u => /^https:\/\/beattheheat\.asia\/|^https:\/\/www\.(instagram|facebook|linkedin)\.com\/|^#[0-9A-F]{6}$/i.test(u)), `every copy button carries a public URL or a hex code (${copies.length} buttons)`);
ok(!/file:\/\/|localhost|\/home\//.test(html), "no local paths on the page");
ok((html.match(/class="bm-card bm-logo"/g) || []).length === C.logos.length, `one card per logo version (${C.logos.length})`);
ok((html.match(/class="bm-vid"/g) || []).length === C.videos.length, `one card per film (${C.videos.length})`);
ok(html.includes("<details class=\"bm-all\">") && (html.match(/<details class="bm-all">[\s\S]*?<\/details>/)[0].match(/<li>/g) || []).length === C.videos.length, "“All video links” lists every film");
ok(!/<video\b/.test(html.replace(/<dialog[\s\S]*?<\/dialog>/, "")) && !/<iframe/.test(html) && !/autoplay/.test(html), "no player, iframe or autoplay loads with the page");
for (const s of B.social) ok(html.includes(`href="${s.url.replace(/&/g, "&amp;")}"`), `${s.name} links to the supplied address`);

// ---- 4. films ----
const files = new Set(); let dup = 0;
for (const v of C.videos) { if (files.has(v.file)) dup++; files.add(v.file); }
ok(dup === 0, "no film is listed twice");
ok(C.videos.every(v => v.seconds > 0 && v.sound), "every film has a duration and a sound track, read from its file");
const pageOk = u => { const p = u.replace(/#.*$/, "").replace(/^\//, ""); return has(p ? p + "index.html" : "index.html"); };
const badPages = C.videos.filter(v => !v.pages.every(p => pageOk(p.url)));
ok(badPages.length === 0, `every film's related page exists${badPages.length ? ": " + badPages.slice(0, 3).map(v => v.id).join(", ") : ""}`);
ok(C.videos.every(v => !v.captionsUrl || has(v.captionsUrl.replace("https://beattheheat.asia/", ""))), "every captions link points to a file that exists");
ok(C.videos.every(v => !/^media\/(hero|launch|reels|social)\//.test(v.file)), "background loops, the launch film and unplaced reels stay out of the library");
ok(C.assets.every(a => !/social-share-cs/.test(a.file)), "the superseded preview image is not offered");

// ---- 5. the shared footer ----
let pages = 0, wrong = [];
(function walk(d) {
  for (const e of fs.readdirSync(path.join(ROOT, d), { withFileTypes: true })) {
    const r = d ? d + "/" + e.name : e.name;
    if (e.isDirectory()) { if (!/^\./.test(e.name) && e.name !== "node_modules" && !(d === "" && /^(research|tools|docs|media|images|data|feeds)$/.test(e.name))) walk(r); }
    else if (e.name === "index.html") {
      const t = read(r); if (!/<nav class="csf"/.test(t)) continue; pages++;
      const n = (t.match(/class="csf__social"/g) || []).length, l = (t.match(/<a href="\/brand\/">Brand &amp; Media<\/a>/g) || []).length;
      if (n !== 1 || l < 1 || B.social.some(s => (t.split(`href="${s.url}"`).length - 1) !== (r === "brand/index.html" ? 2 : 1))) wrong.push(r);
    }
  }
})("");
ok(pages > 150 && wrong.length === 0, `the channels and the Brand & Media link appear once in the footer of all ${pages} pages${wrong.length ? "; check " + wrong.slice(0, 4).join(", ") : ""}`);

console.log(bad ? `brand check: ${bad} failing` : `brand check passed: ${C.logos.length} logo versions, ${C.assets.length} images, ${C.videos.length} films, ${B.social.length} channels`);
process.exit(bad ? 1 : 0);
