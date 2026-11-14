// Common Shade: renders every page in the sitemap at 390px and checks every piece of text against WCAG AA (4.5:1, or
// 3:1 for large text: 24px, or 18.66px bold). Text on a solid background is measured from the styles; text on a
// gradient or image is measured from the pixels behind it (the most common colour in its box, text hidden). Needs a
// local server: python3 -m http.server 8765, then
//   node tools/check-contrast.js [--base http://localhost:8765] [--list]
// Fails, naming page, element and ratio, on any text below AA. The map's drawn labels, hidden text and print are out of scope.
"use strict";
const fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const ROOT = path.join(__dirname, ".."), a = process.argv.slice(2);
const BASE = a.includes("--base") ? a[a.indexOf("--base") + 1] : "http://localhost:8765";
const urls = [...fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8").matchAll(/<loc>https:\/\/beattheheat\.asia([^<]*)<\/loc>/g)].map(m => m[1]).filter(u => u.endsWith("/") && !u.startsWith("/print/"));
const lum = c => { const v = c.slice(0, 3).map(x => { x /= 255; return x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4); }); return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]; };
const ratio = (x, y) => { const p = lum(x), q = lum(y); return (Math.max(p, q) + .05) / (Math.min(p, q) + .05); };
(async () => {
  const b = await chromium.launch(), c = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  await c.addInitScript(() => { try { sessionStorage.setItem("cs-invite-seen", "1"); } catch (e) {} });
  const p = await c.newPage(), fails = []; let measured = 0, sampled = 0;
  for (const u of urls) {
    try { await p.goto(BASE + u, { waitUntil: "load", timeout: 30000 }); await p.waitForTimeout(150); } catch (e) { continue; }
    const r = await p.evaluate(() => {
      const parse = s => { const m = s.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/); if (m) return [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]];
        const n = s.match(/color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)/); return n ? [n[1] * 255, n[2] * 255, n[3] * 255, n[4] === undefined ? 1 : +n[4]] : null; };
      const blend = (f, bg) => [0, 1, 2].map(i => f[i] * f[3] + bg[i] * (1 - f[3]));
      const out = []; let id = 0;
      for (const el of document.querySelectorAll("body *")) {
        if (!el.offsetParent || el.closest("svg, .visually-hidden, .sr-only, [aria-hidden=true]")) continue;
        const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(" "); if (!/[A-Za-z0-9]{2}/.test(own)) continue;
        const s = getComputedStyle(el); if (s.visibility === "hidden" || +s.opacity === 0) continue;
        const fc = parse(s.color); if (!fc) continue;
        const rect = el.getBoundingClientRect(); if (rect.width < 4 || rect.height < 4) continue;
        let stack = [], unknown = false;
        for (let e = el; e; e = e.parentElement) { const t = getComputedStyle(e);
          if (t.backgroundImage !== "none") { unknown = true; break; }
          const k = parse(t.backgroundColor); if (k && k[3] > 0) { stack.push(k); if (k[3] >= 1) break; } }
        let bg = null; if (!unknown) { bg = [255, 255, 255]; for (let i = stack.length - 1; i >= 0; i--) bg = blend(stack[i], bg); }
        const size = parseFloat(s.fontSize), large = size >= 24 || (+s.fontWeight >= 700 && size >= 18.66);
        el.dataset.ccId = ++id;
        out.push({ id, fc, bg, need: large ? 3 : 4.5, cls: (typeof el.className === "string" && el.className.split(" ")[0]) || el.tagName.toLowerCase(), text: own.slice(0, 40), y: rect.top + scrollY, h: rect.height });
      }
      return out;
    });
    for (const e of r) {
      let bg = e.bg;
      if (!bg) {   // gradient or image: hide the text, screenshot its box, take the most common colour
        try {
          const el = p.locator(`[data-cc-id="${e.id}"]`);
          await p.evaluate(() => { if (!document.getElementById("cc-hide")) { const st = document.createElement("style"); st.id = "cc-hide"; st.textContent = "[data-cc-sampling]::before,[data-cc-sampling]::after,[data-cc-sampling] *{visibility:hidden!important}"; document.head.appendChild(st); } });
          await el.evaluate(n => { n.dataset.ccColor = n.style.color; n.style.color = "transparent"; n.dataset.ccSampling = "1"; });
          const buf = await el.screenshot({ timeout: 3000 }); await el.evaluate(n => { n.style.color = n.dataset.ccColor; delete n.dataset.ccSampling; });
          bg = await p.evaluate(async b64 => { const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode(); const cv = document.createElement("canvas"); cv.width = img.width; cv.height = img.height;
            const x = cv.getContext("2d"); x.drawImage(img, 0, 0); const d = x.getImageData(0, 0, cv.width, cv.height).data, m = {}; let best = null, bn = 0;
            for (let i = 0; i < d.length; i += 16) { const k = (d[i] >> 3) + "," + (d[i + 1] >> 3) + "," + (d[i + 2] >> 3); m[k] = (m[k] || 0) + 1; if (m[k] > bn) { bn = m[k]; best = [d[i], d[i + 1], d[i + 2]]; } } return best; }, buf.toString("base64"));
          sampled++;
        } catch (err) { continue; }
      }
      if (!bg) continue;
      const f = [0, 1, 2].map(i => e.fc[i] * e.fc[3] + bg[i] * (1 - e.fc[3])), cr = ratio(f, bg); measured++;
      if (cr < e.need - 0.005) fails.push(`${u}  .${e.cls}  "${e.text}"  ${cr.toFixed(2)}:1 (needs ${e.need}:1)${e.bg ? "" : " [on gradient or image]"}`);
    }
  }
  await b.close();
  if (a.includes("--list") || fails.length) console.log(fails.map(x => "  FAIL " + x).join("\n"));
  console.log(fails.length ? `contrast check: ${fails.length} text element(s) below WCAG AA` : `contrast check passed: ${measured} text elements on ${urls.length} pages meet WCAG AA (${sampled} measured from pixels)`);
  process.exit(fails.length ? 1 : 0);
})();
