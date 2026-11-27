// Common Shade: /brand/, "Brand & Media". The logo files, colours and fonts, shareable images, every narrated film the
// site shows, and the official social channels, with practical notes on use.
// Sources, never copied: data/site/brand.json (names, uses, roles, rights wording, channels); the logo's own code
// (MARK in tools/site-nav.js and the favicon), from which the SVG files are written; styles.css :root (colour values
// and font stacks); and the records that place each film on the site (data.js blocks, tools/shorts/shorts.js,
// tools/explainers/site.js, the homepage film). Sizes, dimensions and durations are read from the files
// (tools/media-meta.js). The PNG logo files come from tools/brand/render.js and are committed.
// Writes brand/index.html, brand/catalogue.json, brand/files/*.svg and brand/common-shade-logo-pack.zip.
// Called by build-pages.js; tools/check-brand.js checks the result.
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm"), zlib = require("zlib");
const ROOT = path.join(__dirname, ".."), SITE = "https://beattheheat.asia";
const M = require("./media-meta.js");
const B = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "site", "brand.json"), "utf8"));
const SLUG = "brand", PACK = "brand/common-shade-logo-pack.zip";
const abs = f => `${SITE}/${f.replace(/^\//, "")}`;
const exists = f => fs.existsSync(path.join(ROOT, f));
const sizeOf = f => fs.statSync(path.join(ROOT, f)).size;

// ---- the logo, from its own code ----
const NAVSRC = fs.readFileSync(path.join(__dirname, "site-nav.js"), "utf8");
const MARK = (NAVSRC.match(/const MARK = `([^`]+)`/) || [])[1];
const PAGES_SRC = fs.readFileSync(path.join(__dirname, "build-pages.js"), "utf8");
const ICON = decodeURIComponent(((PAGES_SRC.match(/<link rel="icon" href="data:image\/svg\+xml,([^"]+)"/) || [])[1] || "")).replace(/'/g, '"');
function markSvg(posts) {
  if (!MARK) throw new Error("build-brand: MARK not found in tools/site-nav.js");
  const inner = MARK.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "").replace(/ class="[^"]*"/g, "").replace(/currentColor/g, posts);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 20" width="260" height="200">${inner}</svg>\n`;
}
const SVGS = {
  "brand/files/common-shade-symbol-light-bg.svg": () => markSvg("#16202B"),
  "brand/files/common-shade-symbol-dark-bg.svg": () => markSvg("#F6E7D7"),
  "brand/files/common-shade-app-icon.svg": () => { if (!/^<svg/.test(ICON)) throw new Error("build-brand: favicon not found in tools/build-pages.js"); return ICON.replace("<svg ", '<svg width="512" height="512" ') + "\n"; }
};

// ---- colours and fonts, from styles.css ----
const CSS = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
const ROOTCSS = (CSS.match(/:root\s*\{([\s\S]*?)\}/) || [, ""])[1];
const token = t => { const m = ROOTCSS.match(new RegExp(t.replace(/-/g, "\\-") + "\\s*:\\s*([^;]+);")); return m ? m[1].trim() : null; };

// ---- the films, from the records that place them ----
function films() {
  const c = {}; vm.createContext(c);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "data.js"), "utf8") + ";this.D={SECTION_FILMS,GLOSSARY,LOOPS,HEATWAVE_DAY,STALLS,FINANCE}", c);
  const D = c.D, home = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const anchor = id => (id && home.includes(`id="${id}"`) ? `/#${id}` : "/");
  const first = (s, n = 220) => { s = String(s || "").replace(/\*/g, "").trim(); if (s.length <= n) return s; const cut = s.slice(0, n), dot = cut.lastIndexOf(". "); return dot > 80 ? cut.slice(0, dot + 1) : cut.replace(/\s+\S*$/, "") + "…"; };
  const out = [];
  const add = (r) => { r.file = r.file.replace(/^\//, "").replace(/\?.*$/, ""); out.push(r); };
  // the homepage film
  const fm = home.match(/<h2 id="film-title"[^>]*>([^<]+)</), fs0 = (home.match(/<source src="(media\/extreme-heat-wicked-problem\.mp4)[^"]*"/) || [])[1];
  if (fs0) add({ id: "film-wicked-problem", collection: "films", title: fm ? fm[1].trim() : "Extreme heat is a wicked problem", text: "The site’s opening film: why extreme heat is a wicked problem, with harms that feed one another across health, work, homes and services.", file: fs0, pages: [["/", "The map of extreme heat"]], captionsNote: "" });
  D.SECTION_FILMS.forEach(f => add({ id: `film-${f.id}`, collection: "films", title: f.title, text: first(f.text), file: f.video, pages: [[anchor(f.back && f.back.act), "On the homepage"]] }));
  const L = D.FINANCE && D.FINANCE.lenders;
  if (L && L.video) add({ id: "film-heat-and-lenders", collection: "films", title: L.title, text: first(L.intro), file: L.video.src, poster: L.video.poster, vtt: L.video.captions, pages: [["/paying-for-protection/", "Paying for protection"]] });
  require("./explainers/site.js").forEach(f => add({ id: `explainer-${f.id}`, collection: "page-explainers", title: f.watch || f.term, text: first(((f.scenes || [])[0] || {}).q || f.label), file: `media/explainers/${f.id}.mp4`, pages: [["/" + f.page.replace(/index\.html$/, ""), ""]], captionsNote: "Captions in the picture" }));
  require("./shorts/shorts.js").forEach(f => add({ id: `short-${f.id}`, collection: "page-shorts", title: f.title, text: first((s0 => s0.sub || s0.say || s0.p || "")(((f.scenes || [])[0] || {}))), file: `media/shorts/${f.id}.mp4`, pages: [["/" + f.page.replace(/index\.html$/, ""), ""]] }));
  D.GLOSSARY.filter(g => g.video).forEach(g => add({ id: `glossary-${g.id}`, collection: "glossary", title: g.term, text: first(g.text), file: g.video, pages: [[`/glossary/#${g.id}`, "Glossary"]], captionsNote: fs.existsSync(path.join(__dirname, "explainers", g.id + ".html")) ? "Captions in the picture" : "" }));
  D.LOOPS.filter(l => l.video).forEach(l => add({ id: `cycle-${l.id}`, collection: "cycles", title: l.name, text: first(l.summary), file: l.video, pages: [[`/loops/#${l.id}`, "Vicious cycles"]] }));
  D.HEATWAVE_DAY.filter(h => h.video).forEach(h => add({ id: `day-${h.time.replace(":", "")}`, collection: "day", title: `${h.time}: ${h.title}`, text: first(`${h.who}. ${h.text}`), file: h.video, pages: [[anchor("day"), "On the homepage"]] }));
  D.STALLS.filter(s => s.video).forEach(s => add({ id: `stall-${s.id}`, collection: "stalls", title: s.name, text: first(s.sign), file: s.video, pages: [[anchor("stalls"), "On the homepage"]] }));
  // facts from the files
  const seen = new Set(), recs = [];
  for (const r of out) {
    if (seen.has(r.file) || !exists(r.file)) continue; seen.add(r.file);
    const v = M.video(path.join(ROOT, r.file)) || {}, base = r.file.replace(/\.mp4$/, "");
    const poster = [r.poster, base + ".jpg", base.replace(/-16x9$/, "") + "-poster.jpg", base + "-poster.jpg"].find(p => p && exists(p)) || "";
    const vtt = [r.vtt, base + ".en.vtt", base.replace(/-16x9$/, "") + ".en.vtt"].find(p => p && exists(p)) || "";
    const narrated = vtt || fs.existsSync(path.join(__dirname, "explainers", path.basename(base) + ".narration.json")) || fs.existsSync(path.join(__dirname, "shorts", path.basename(base) + ".timing.json")) || fs.existsSync(path.join(__dirname, "films", path.basename(base) + ".narration.json"));
    recs.push({
      id: r.id, collection: r.collection, title: r.title, description: r.text,
      file: r.file, url: abs(r.file), poster: poster ? abs(poster) : "", posterPath: poster,
      duration: v.duration ? M.clock(v.duration) : "", seconds: v.duration ? Math.round(v.duration) : null,
      width: v.width || null, height: v.height || null, sound: !!v.audio, bytes: sizeOf(r.file), format: "MP4 (H.264)",
      language: narrated ? "English" : "",
      captions: vtt ? "Captions file (English, WebVTT)" : (r.captionsNote || "Not stated"), captionsUrl: vtt ? abs(vtt) : "",
      transcript: "", hosting: "Self-hosted on beattheheat.asia", download: true,
      pages: r.pages.map(([u, t]) => ({ url: u, title: t || pageTitle(u) }))
    });
  }
  return recs;
}
function pageTitle(u) {
  const f = path.join(ROOT, u.replace(/#.*$/, "").replace(/^\//, ""), "index.html");
  if (!fs.existsSync(f)) return u;
  const t = (fs.readFileSync(f, "utf8").match(/<title>([\s\S]*?)<\/title>/) || [, u])[1];
  return t.replace(/\s*[·|–-]\s*Common Shade\s*$/, "").replace(/&amp;/g, "&").replace(/&#39;|&rsquo;/g, "’").trim();
}

// ---- a deterministic ZIP (stored entries, fixed date), so the pack only changes when its files do ----
const CRC = (() => { const t = new Int32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c; } return b => { let c = -1; for (const x of b) c = t[(c ^ x) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; }; })();
function zip(entries) {
  const parts = [], cen = []; let off = 0;
  const DATE = ((2026 - 1980) << 9) | (11 << 5) | 1, TIME = 0;
  for (const [name, data] of entries) {
    const n = Buffer.from(name), crc = CRC(data), def = zlib.deflateRawSync(data, { level: 9 }), useDef = def.length < data.length, body = useDef ? def : data;
    const lh = Buffer.alloc(30); lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0x0800, 6); lh.writeUInt16LE(useDef ? 8 : 0, 8); lh.writeUInt16LE(TIME, 10); lh.writeUInt16LE(DATE, 12);
    lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(body.length, 18); lh.writeUInt32LE(data.length, 22); lh.writeUInt16LE(n.length, 26); lh.writeUInt16LE(0, 28);
    parts.push(lh, n, body);
    const ch = Buffer.alloc(46); ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(0x0800, 8); ch.writeUInt16LE(useDef ? 8 : 0, 10); ch.writeUInt16LE(TIME, 12); ch.writeUInt16LE(DATE, 14);
    ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(body.length, 20); ch.writeUInt32LE(data.length, 24); ch.writeUInt16LE(n.length, 28); ch.writeUInt32LE(off, 42);
    cen.push(ch, n); off += 30 + n.length + body.length;
  }
  const cd = Buffer.concat(cen), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10); end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(off, 16);
  return Buffer.concat([...parts, cd, end]);
}

// the catalogue records (also used by the check)
function catalogue() {
  const logos = B.logos.map(l => {
    const files = [l.svg, l.png].filter(Boolean).filter(exists).map(f => { const i = M.image(path.join(ROOT, f)) || {}; return { path: f, url: abs(f), format: /\.svg$/.test(f) ? "SVG" : "PNG", type: i.type, width: i.width, height: i.height, bytes: sizeOf(f) }; });
    return Object.assign({ type: "logo", rights: "logo" }, l, { files, preview: (files.find(f => f.format === "PNG") || files[0] || {}).path || "" });
  }).filter(l => l.files.length);
  const assets = B.assets.filter(a => exists(a.file)).map(a => { const i = M.image(path.join(ROOT, a.file)) || {}; return Object.assign({ type: "image" }, a, { url: abs(a.file), format: (i.type || "").replace("image/", "").replace("svg+xml", "svg").toUpperCase(), mime: i.type, width: i.width, height: i.height, bytes: sizeOf(a.file) }); });
  return { logos, assets, videos: films() };
}

module.exports = function brand({ page, write, esc, hero, V }) {
  for (const [f, make] of Object.entries(SVGS)) { fs.mkdirSync(path.join(ROOT, path.dirname(f)), { recursive: true }); fs.writeFileSync(path.join(ROOT, f), make()); }
  const C = catalogue();
  const missing = B.logos.flatMap(l => [l.svg, l.png]).filter(Boolean).filter(f => !exists(f));
  if (missing.length) console.log("  brand: logo files not rendered yet (run node tools/brand/render.js):", missing.join(", "));

  // the logo pack: only the verified current logo files, and a short README
  const packFiles = C.logos.flatMap(l => l.files.map(f => f.path));
  const readme = [
    "Common Shade logo pack", "======================", "",
    "The current Common Shade logo files, from https://beattheheat.asia/brand/", "",
    ...C.logos.map(l => `${l.title}\n  ${l.use}\n  Files: ${l.files.map(f => `${path.basename(f.path)} (${f.format}${f.width ? `, ${f.width} x ${f.height}` : ""}${l.transparent ? ", transparent background" : ""})`).join("; ")}`), "",
    "Colours", ...B.colours.logo.map(c => `  ${c.name} ${token(c.token)}: ${c.role}`), "",
    "Using the logo", ...B.usage.map(u => "  - " + u), "",
    "Rights", "  " + B.rights.logo, "  " + B.rights.formal, "",
    `Questions: ${SITE}${B.contact.url}`, ""
  ].join("\n");
  fs.writeFileSync(path.join(ROOT, PACK), zip([["common-shade-logo-pack/README.txt", Buffer.from(readme)], ...packFiles.map(f => ["common-shade-logo-pack/" + path.basename(f), fs.readFileSync(path.join(ROOT, f))])]));

  // the public catalogue
  const pub = { about: "Common Shade brand and media catalogue. Generated by tools/build-brand.js from data/site/brand.json and the files themselves.", page: `${SITE}/${SLUG}/`, pack: abs(PACK),
    logos: C.logos.map(l => ({ id: l.id, title: l.title, use: l.use, background: l.background, transparent: l.transparent, rights: B.rights.logo, files: l.files.map(f => ({ url: f.url, format: f.format, width: f.width, height: f.height, bytes: f.bytes })) })),
    colours: [...B.colours.logo.map(c => ({ group: "logo", name: c.name, hex: token(c.token), token: c.token, role: c.role })), ...B.colours.interface.map(c => ({ group: "interface", name: c.name, hex: token(c.token), token: c.token, role: c.role }))],
    fonts: B.fonts.map(f => ({ name: f.name, stack: token(f.token), role: f.role, source: f.url, licence: B.font_licence.name })),
    images: C.assets.map(a => ({ id: a.id, title: a.title, description: a.description, url: a.url, format: a.format, width: a.width, height: a.height, bytes: a.bytes, rights: B.rights.content })),
    videos: C.videos.map(v => ({ id: v.id, collection: v.collection, title: v.title, description: v.description, url: v.url, poster: v.poster, duration: v.duration || null, language: v.language || null, captions: v.captions, captions_url: v.captionsUrl || null, hosting: v.hosting, pages: v.pages.map(p => SITE + p.url), bytes: v.bytes, rights: B.rights.content })),
    social: B.social.map(s => ({ platform: s.name, label: s.label, url: s.url })) };
  fs.writeFileSync(path.join(ROOT, SLUG, "catalogue.json"), JSON.stringify(pub, null, 1) + "\n");

  // ---- the page ----
  const copyBtn = (url, what) => `<button type="button" class="bm-copy" data-bm-copy="${esc(url)}" hidden>Copy ${esc(what)}</button>`;
  const ext = (u, t) => `<a href="${esc(u)}" target="_blank" rel="noopener">${t}<span class="visually-hidden"> (opens in a new tab)</span></a>`;
  const sz = n => M.bytes(n);
  const logoCard = l => `<li class="bm-card bm-logo" id="logo-${l.id}">
      <div class="bm-prev bm-prev--${l.background}"><img src="/${esc(l.preview)}" alt="${esc(l.title)}: the Common Shade logo${l.background === "dark" ? " in cream and orange" : l.background === "light" ? " in ink and orange" : ""}" loading="lazy" decoding="async"${(() => { const f = l.files.find(x => x.path === l.preview); return f && f.width ? ` width="${f.width}" height="${f.height}"` : ""; })()}></div>
      <div class="bm-body"><h3 class="bm-h">${esc(l.title)}</h3><p class="bm-p">${esc(l.use)}</p>
      <p class="bm-meta">${l.transparent ? "Transparent background" : "Solid tile with rounded corners"}${l.background === "light" ? " · for light backgrounds" : l.background === "dark" ? " · for dark backgrounds" : ""}</p>
      <ul class="bm-files">${l.files.map(f => `<li><a class="bm-dl" href="/${esc(f.path)}" download="${esc(path.basename(f.path))}">Download ${f.format}<span class="visually-hidden">: ${esc(l.title)}</span></a> <span class="bm-meta">${f.format === "SVG" ? `vector, scales to any size` : `${f.width} × ${f.height} px`} · ${sz(f.bytes)}</span> ${copyBtn(f.url, `${f.format} link`)}</li>`).join("")}</ul></div></li>`;
  const swatch = (c, g) => { const hex = token(c.token); return `<li class="bm-sw"><span class="bm-chip" style="background:${esc(hex)}" aria-hidden="true"></span><div><b>${esc(c.name)}</b> <code>${esc(hex)}</code><span class="bm-meta">${esc(c.role)}</span>${copyBtn(hex, `${c.name} hex code`)}</div></li>`; };
  const assetCard = a => `<li class="bm-card bm-asset" id="asset-${a.id}"><div class="bm-prev bm-prev--photo"><img src="/${esc(a.file)}" alt="Preview of ${esc(a.title)}" loading="lazy" decoding="async" width="${a.width}" height="${a.height}"></div>
      <div class="bm-body"><h3 class="bm-h">${esc(a.title)}</h3><p class="bm-p">${esc(a.description)}</p><p class="bm-meta">${esc(a.format)} · ${a.width} × ${a.height} px · ${sz(a.bytes)} · CC BY 4.0, credit Common Shade</p>
      <p class="bm-row"><a class="bm-dl" href="/${esc(a.file)}" download="common-shade-${esc(path.basename(a.file))}">Download ${esc(a.format)}<span class="visually-hidden">: ${esc(a.title)}</span></a> ${copyBtn(a.url, "link")}</p></div></li>`;
  const COLL = Object.fromEntries(B.videos.collections.map(c => [c.id, c]));
  const vidCard = v => `<li class="bm-vid" id="v-${esc(v.id)}" data-c="${esc(v.collection)}">
      <div class="bm-poster">${v.posterPath ? `<img src="/${esc(v.posterPath)}" alt="" loading="lazy" decoding="async" width="${v.width || 1920}" height="${v.height || 1080}">` : ""}${v.duration ? `<span class="bm-len">${v.duration}</span>` : ""}</div>
      <div class="bm-body"><p class="bm-k">${esc(COLL[v.collection].name)}</p><h3 class="bm-h">${esc(v.title)}</h3>${v.description ? `<p class="bm-p">${esc(v.description)}</p>` : ""}
      <p class="bm-meta">${[v.duration, v.language, v.captions === "Not stated" ? "Captions: not stated" : v.captions].filter(Boolean).map(esc).join(" · ")}</p>
      <p class="bm-row"><a class="bm-watch" href="/${esc(v.file)}" data-bm-watch${v.captionsUrl ? ` data-vtt="${esc(v.captionsUrl.replace(SITE, ""))}"` : ""}>Watch video<span class="visually-hidden">: ${esc(v.title)}</span></a> <a href="${esc(v.pages[0].url)}">Read the related page<span class="visually-hidden">: ${esc(v.pages[0].title)}</span></a>${v.captionsUrl ? ` <a href="/${esc(v.captionsUrl.replace(SITE + "/", ""))}">Captions file<span class="visually-hidden"> for ${esc(v.title)}</span></a>` : ""} ${copyBtn(v.url, "video link")}</p></div></li>`;
  const socialIcon = id => ({
    instagram: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.3" cy="6.7" r="1.2" fill="currentColor"/></svg>`,
    facebook: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z" fill="currentColor"/></svg>`,
    linkedin: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7.5 10v6.5M7.5 7.2v.1M11 16.5V10m0 3c0-2 1.2-3 2.7-3s2.3 1 2.3 3v3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
  }[id] || "");
  const counts = B.videos.collections.map(c => [c, C.videos.filter(v => v.collection === c.id).length]).filter(([, n]) => n);
  const toc = [["logos", "Logos"], ["colours", "Colours and fonts"], ["assets", "Images and materials"], ["videos", "Video library"], ["social", "Official channels"], ["usage", "Using these files"]];
  const body = `${hero("About this site", esc(B.title), esc(B.intro))}
  <div class="container bm">
    <nav class="bm-toc" aria-label="On this page"><ul>${toc.map(([id, t]) => `<li><a href="#${id}">${t}</a></li>`).join("")}</ul></nav>

    <section id="logos" aria-labelledby="logos-h"><h2 class="hub-h" id="logos-h">Logos</h2>
      <p class="hub-p">The canopy and two posts: shade held up together. These are the versions the site and its films use, drawn from the site’s own code.</p>
      <p class="bm-pack"><a class="btn" href="/${PACK}" download="common-shade-logo-pack.zip">Download logo pack<span class="visually-hidden">: every logo file below and a README</span></a> <span class="bm-meta">ZIP · ${packFiles.length} files and a README · ${sz(sizeOf(PACK))}</span> ${copyBtn(abs(PACK), "pack link")}</p>
      <ul class="bm-grid bm-grid--logos">${C.logos.map(logoCard).join("")}</ul>
      <p class="bm-meta">Not available: ${B.logo_gaps.map(esc).join(" ")}</p>
    </section>

    <section id="colours" aria-labelledby="colours-h"><h2 class="hub-h" id="colours-h">Colours and fonts</h2>
      <p class="hub-p">Read from the site’s own style sheet, so these values are the ones in use. The logo uses three of them; the interface uses each colour for one meaning.</p>
      <h3 class="bm-sub">In the logo</h3><ul class="bm-sws">${B.colours.logo.map(c => swatch(c, "logo")).join("")}</ul>
      <h3 class="bm-sub">In the interface</h3><ul class="bm-sws">${B.colours.interface.map(c => swatch(c, "ui")).join("")}</ul>
      <h3 class="bm-sub">Fonts</h3>
      <ul class="bm-fonts">${B.fonts.map(f => `<li class="bm-font"><span class="bm-font__s" style="font-family:${esc(token(f.token))}">${f.name === "Anton" ? "COMMON SHADE" : "Shade held up together"}</span><b>${esc(f.name)}</b><span class="bm-meta">${esc(f.role)}</span><span class="bm-meta">Stack: <code>${esc(token(f.token))}</code></span> ${ext(f.url, `${esc(f.name)} on Google Fonts`)}</li>`).join("")}</ul>
      <p class="bm-meta">All three are free under the ${ext(B.font_licence.url, esc(B.font_licence.name))}. Get them from Google Fonts; they are not included in the pack.</p>
    </section>

    <section id="assets" aria-labelledby="assets-h"><h2 class="hub-h" id="assets-h">Images and materials</h2>
      <ul class="bm-grid">${C.assets.map(assetCard).join("")}</ul>
      <ul class="bm-dests">${B.destinations.map(d => `<li class="bm-card bm-dest"><h3 class="bm-h">${esc(d.title)}</h3><p class="bm-p">${esc(d.description)}</p><a href="${esc(d.url)}">${esc(d.label)} <span aria-hidden="true">→</span></a></li>`).join("")}</ul>
    </section>

    <section id="videos" aria-labelledby="videos-h"><h2 class="hub-h" id="videos-h">Video library</h2>
      <p class="hub-p">Every narrated film the site shows, ${C.videos.length} in all, each hosted on this site. A film plays only when you press Watch.</p>
      <form class="bm-find" role="search" aria-label="Find a film" hidden onsubmit="return false">
        <label for="bm-q">Search by title or topic</label><input id="bm-q" type="search" autocomplete="off" spellcheck="false">
        <fieldset class="bm-chips"><legend>Collection</legend><label class="bm-chipl"><input type="radio" name="bm-c" value="" checked> All (${C.videos.length})</label>${counts.map(([c, n]) => `<label class="bm-chipl"><input type="radio" name="bm-c" value="${c.id}"> ${esc(c.name)} (${n})</label>`).join("")}</fieldset>
        <p class="bm-count"><span data-bm-count role="status" aria-live="polite">${C.videos.length} films</span> <button type="button" class="bm-reset" data-bm-reset hidden>Show all films</button></p>
      </form>
      <ul class="bm-vids">${C.videos.map(vidCard).join("")}</ul>
      <p class="bm-empty" data-bm-empty hidden>No film matches. <button type="button" class="bm-reset" data-bm-reset2>Show all films</button></p>
      <details class="bm-all"><summary>All video links (${C.videos.length})</summary>
        ${counts.map(([c]) => `<h3 class="bm-sub">${esc(c.name)}</h3><ul>${C.videos.filter(v => v.collection === c.id).map(v => `<li><a href="/${esc(v.file)}">${esc(v.title)}</a>${v.duration ? ` · ${v.duration}` : ""} · <span class="bm-url">${esc(v.url)}</span></li>`).join("")}</ul>`).join("")}
        <p class="bm-meta">The whole list, with sizes, captions and related pages, is also a file: <a href="/${SLUG}/catalogue.json">catalogue.json</a>.</p>
      </details>
    </section>

    <section id="social" aria-labelledby="social-h"><h2 class="hub-h" id="social-h">Official channels</h2>
      <ul class="bm-social">${B.social.map(s => `<li class="bm-card bm-soc"><span class="bm-soc__i">${socialIcon(s.id)}</span><div><b>${esc(s.name)}</b><span class="bm-meta">${esc(s.label)}</span></div><a class="bm-visit" href="${esc(s.url)}" target="_blank" rel="noopener me">Visit<span class="visually-hidden"> ${esc(s.label)} (opens in a new tab)</span></a> ${copyBtn(s.url, `${s.name} link`)}</li>`).join("")}</ul>
      <p class="bm-meta">Links only: the site loads nothing from these services until you choose to visit.</p>
    </section>

    <section id="usage" aria-labelledby="usage-h"><h2 class="hub-h" id="usage-h">Using these files</h2>
      <div class="cs-note cs-note--limit"><p class="cs-note__label">Practical notes, not formal guidelines</p><p>${esc(B.rights.formal)}</p></div>
      <ul class="bm-usage">${B.usage.map(u => `<li>${esc(u)}</li>`).join("")}</ul>
      <h3 class="bm-sub">Rights and credit</h3>
      <p class="hub-p">${esc(B.rights.content)} ${esc(B.rights.voice)}</p>
      <p class="hub-p">${esc(B.rights.logo)}</p>
      <p class="hub-p">Linking to an organisation implies no partnership or endorsement. See <a href="/cite/">Cite and reuse</a> for ready citations and <a href="/privacy/">Privacy and terms</a> for the full terms.</p>
      <p class="hub-p">${esc(B.contact.note)} <a href="${esc(B.contact.url)}">${esc(B.contact.label)}</a>.</p>
    </section>
  </div>
  <dialog class="bm-player" aria-labelledby="bm-player-h"><div class="bm-player__in"><div class="bm-player__top"><h2 id="bm-player-h" class="bm-player__h"></h2><form method="dialog"><button class="bm-player__x" aria-label="Close the film">Close</button></form></div><div class="bm-player__frame"></div><p class="bm-player__links"></p></div></dialog>`;
  write(SLUG, page(SLUG, B.title, B.description, body, `\n  <link rel="stylesheet" href="/brand/brand.css?v=${V}"><script src="/brand/brand.js?v=${V}" defer></script>`));
  console.log(`brand: ${C.logos.length} logo versions (${packFiles.length} files in the pack), ${C.assets.length} images, ${C.videos.length} films, ${B.social.length} channels`);
};
module.exports.catalogue = catalogue;
module.exports.SVGS = SVGS;
module.exports.token = token;
module.exports.PACK = PACK;
