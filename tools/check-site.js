// Gate 7: the built site works. Serves the repository locally and opens every page at phone and desktop width,
// failing on script errors, sideways scrolling or pages that do not load.
//   node tools/check-site.js            all pages
//   node tools/check-site.js glossary/  pages whose path starts with these prefixes
// Needs Playwright with Chromium (PW=path to the playwright module, if it is not installed locally).
"use strict";
const http = require("http"), fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const ROOT = path.join(__dirname, "..");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".mp4": "video/mp4", ".vtt": "text/vtt", ".woff2": "font/woff2", ".ttf": "font/ttf", ".xml": "application/xml", ".txt": "text/plain" };
const pages = execFileSync("git", ["ls-files", "*index.html"], { cwd: ROOT }).toString().split("\n").filter(Boolean)
  .filter(f => !f.startsWith("print/") && !f.startsWith("tools/")).map(f => f.replace(/index\.html$/, ""))
  .filter(p => process.argv.length < 3 || process.argv.slice(2).some(x => p.startsWith(x)));
const server = http.createServer((req, res) => {
  let f = path.join(ROOT, decodeURIComponent(req.url.split("?")[0])); if (f.endsWith("/")) f += "index.html";
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(res);
});
server.listen(0, async () => {
  const port = server.address().port, { chromium } = require(process.env.PW || "playwright"), b = await chromium.launch(), bad = [];
  for (const w of [375, 1280]) {
    const p = await b.newPage({ viewport: { width: w, height: 800 } }); let errs = [];
    p.on("pageerror", e => errs.push(e.message)); await p.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());   // nothing leaves this machine
    for (const pg of pages) { errs = [];
      const r = await p.goto(`http://127.0.0.1:${port}/${pg}`, { waitUntil: "load" }).catch(e => ({ status: () => 0 }));
      const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth).catch(() => 0);
      // on a phone, nothing large may capture touch: a swipe that lands on it would stop the page from scrolling
      const trap = w > 500 ? "" : await p.evaluate(() => { const A = innerWidth * innerHeight; for (const e of document.querySelectorAll("body *")) { const t = getComputedStyle(e).touchAction;
        if (t === "none" || t === "pinch-zoom" || (t.includes("pan-x") && !t.includes("pan-y"))) { const r = e.getBoundingClientRect(); if (r.width * r.height > 0.3 * A) return `${e.tagName.toLowerCase()}${e.className && typeof e.className === "string" ? "." + e.className.split(" ")[0] : ""} (touch-action: ${t})`; } } return ""; }).catch(() => "");
      if (!r || r.status() !== 200 || ov > 1 || trap || errs.length) bad.push(`${w}px /${pg}: ${r && r.status() !== 200 ? "status " + r.status() + " " : ""}${ov > 1 ? "scrolls sideways " + ov + "px " : ""}${trap ? "blocks scrolling on touch: " + trap + " " : ""}${errs.join(" | ")}`); }
    await p.close();
  }
  await b.close(); server.close();
  bad.forEach(x => console.log("FAIL", x)); console.log(`site check: ${pages.length} pages at two widths, ${bad.length} problems`);
  process.exit(bad.length ? 1 : 0);
});
