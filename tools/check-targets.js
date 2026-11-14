// Common Shade: touch targets. Renders every page in the sitemap at 390px (a phone) and checks each standalone link,
// button and control against WCAG 2.2 target size (2.5.8, AA): its tap area is at least 24 by 24px, or a 24px circle on
// its centre touches no other target. The tap area counts an invisible ::after layer (the site's way to grow a target
// without moving anything: position absolute, negative inset). Links inside a sentence, unstyled native checkboxes and
// radios, the drawn map points (the map's nodes, the Atlas markers, each also listed as text) and the pop-ups are exempt, as WCAG allows or as the owner decided. Needs a local server:
// python3 -m http.server 8765, then
//   node tools/check-targets.js [--base http://localhost:8765] [--page /] [--list]
// Fails, naming page, element, size and a fix, on any target that is too small and too close to its neighbours.
"use strict";
const fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const ROOT = path.join(__dirname, ".."), a = process.argv.slice(2);
const BASE = a.includes("--base") ? a[a.indexOf("--base") + 1] : "http://localhost:8765";
const only = a.includes("--page") ? a[a.indexOf("--page") + 1] : null;
const urls = only ? [only] : [...fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8").matchAll(/<loc>https:\/\/beattheheat\.asia([^<]*)<\/loc>/g)].map(m => m[1]).filter(u => u.endsWith("/") && !u.startsWith("/print/"));
(async () => {
  const b = await chromium.launch(), c = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: "reduce" });
  await c.addInitScript(() => { try { sessionStorage.setItem("cs-invite-seen", "1"); } catch (e) {} });
  const p = await c.newPage(), fails = []; let checked = 0, small = 0;
  for (const u of urls) {
    try { await p.goto(BASE + u, { waitUntil: "load", timeout: 30000 }); await p.waitForTimeout(150); } catch (e) { continue; }
    const r = await p.evaluate(() => {
      const TEXT = /^(P|LI|SPAN|SMALL|FIGCAPTION|TD|DD|DT|EM|B|STRONG|CITE|Q|LABEL|BLOCKQUOTE)$/;
      const inSentence = e => { const s = getComputedStyle(e).display; if (!/^inline/.test(s) || /flex|grid/.test(s)) return false; const t = e.parentElement; if (!t || !TEXT.test(t.tagName)) return false;
        return t.textContent.replace(/\s+/g, " ").trim().length > e.textContent.replace(/\s+/g, " ").trim().length + 3; };
      const box = e => { const r = e.getBoundingClientRect(); let L = r.left, T = r.top, R = r.right, B = r.bottom; const s = getComputedStyle(e, "::after");
        if (s.content !== "none" && s.position === "absolute") { const v = k => parseFloat(s[k]); if (!isNaN(v("top"))) T = Math.min(T, r.top + v("top")); if (!isNaN(v("bottom"))) B = Math.max(B, r.bottom - v("bottom")); if (!isNaN(v("left"))) L = Math.min(L, r.left + v("left")); if (!isNaN(v("right"))) R = Math.max(R, r.right - v("right")); }
        return { L, T, R, B, w: R - L, h: B - T }; };
      const t = [];
      for (const e of document.querySelectorAll("a[href],button,summary,input,select,textarea,[role=button],[role=link],[tabindex='0']")) {
        const r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1) continue; const s = getComputedStyle(e); if (s.visibility === "hidden" || s.pointerEvents === "none") continue;
        if (e.closest("svg,.atl-map,.invite,.csn-new,.cs-tip,.cse,[data-cs-pop],[inert],[aria-hidden=true],.visually-hidden,.sr-only,.csn-vh")) continue;
        if (e.tagName === "INPUT" && /checkbox|radio/.test(e.type) && s.appearance !== "none") continue;   // a user agent control
        const x = box(e); t.push({ e, x, ok: x.w >= 23.5 && x.h >= 23.5, sent: inSentence(e) });
      }
      const out = []; let n = 0;
      for (const k of t) { if (k.sent) continue; n++; if (k.ok) continue;
        const cx = (k.x.L + k.x.R) / 2, cy = (k.x.T + k.x.B) / 2;
        const clash = t.some(o => o !== k && !o.e.contains(k.e) && !k.e.contains(o.e) && (() => { const dx = Math.max(o.x.L - cx, 0, cx - o.x.R), dy = Math.max(o.x.T - cy, 0, cy - o.x.B);
          if (o.ok || o.sent) return Math.hypot(dx, dy) < 12; const ox = (o.x.L + o.x.R) / 2, oy = (o.x.T + o.x.B) / 2; return Math.hypot(ox - cx, oy - cy) < 24 || Math.hypot(dx, dy) < 12; })());
        const name = k.e.tagName.toLowerCase() + (typeof k.e.className === "string" && k.e.className.trim() ? "." + k.e.className.trim().split(/\s+/)[0] : "") + (k.e.parentElement && typeof k.e.parentElement.className === "string" && k.e.parentElement.className ? " in ." + k.e.parentElement.className.trim().split(/\s+/)[0] : "");
        out.push({ name, text: (k.e.textContent || k.e.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim().slice(0, 32), w: Math.round(k.x.w), h: Math.round(k.x.h), clash });
      }
      return { n, out };
    });
    checked += r.n; small += r.out.length;
    for (const f of r.out) if (f.clash) fails.push(`${u}  ${f.name}  "${f.text}"  ${f.w}x${f.h}px, too close to a neighbour`);
  }
  await b.close();
  if (fails.length) console.log(fails.map(x => "  FAIL " + x).join("\n") + "\n  fix: give it a tap area of at least 24px, with min-height or an invisible ::after layer (position: absolute; inset: -10px -4px), as in styles.css \"Tap areas\"");
  console.log(fails.length ? `target check: ${fails.length} touch target(s) under 24px and too close to their neighbours` : `target check passed: ${checked} standalone touch targets on ${urls.length} page(s) meet WCAG 2.2 target size (${small} under 24px are spaced far enough apart)`);
  process.exit(fails.length ? 1 : 0);
})();
