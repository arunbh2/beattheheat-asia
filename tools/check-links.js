#!/usr/bin/env node
/* Common Shade: check that a list of outside links still answers.
   Run on GitHub (.github/workflows/check-links.yml), where outside sites can be reached, before new research is
   added to the site. Prints one line per link, "OK", "REDIRECT" or "FAIL", then a summary.
   Many publishers refuse automated requests (401/403/429) though the page works in a browser; those are reported
   as "BLOCKED" so an editor can open them by hand rather than drop them.
   Usage: node tools/check-links.js research/urls-to-check.txt */
const fs = require("fs");
const file = process.argv[2] || "research/urls-to-check.txt";
const urls = [...new Set(fs.readFileSync(file, "utf8").split(/\r?\n/).map(s => s.trim()).filter(s => /^https?:\/\//.test(s)))];
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";
async function check(u) {
  for (const method of ["HEAD", "GET"]) {
    try {
      const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 25000);
      const r = await fetch(u, { method, redirect: "follow", signal: ctl.signal, headers: { "User-Agent": UA, "Accept": "text/html,application/pdf,*/*" } });
      clearTimeout(t); try { await r.body?.cancel(); } catch (e) {}
      if (r.ok) return [r.redirected && new URL(r.url).host !== new URL(u).host ? "REDIRECT" : "OK", r.status, r.url];
      if (method === "HEAD" && [400, 403, 404, 405, 406, 429, 500, 501, 503].includes(r.status)) continue;
      return [[401, 403, 429, 999].includes(r.status) ? "BLOCKED" : "FAIL", r.status, r.url];
    } catch (e) { if (method === "GET") return ["FAIL", e.name === "AbortError" ? "timeout" : (e.cause && e.cause.code) || e.message, u]; }
  }
}
(async () => {
  const out = [], q = urls.slice(); let n = 0;
  await Promise.all(Array.from({ length: 10 }, async () => { while (q.length) { const u = q.shift(); const [s, code, final] = await check(u); out.push({ u, s, code, final }); if (++n % 100 === 0) console.log(`  …${n}/${urls.length}`); } }));
  out.sort((a, b) => a.s.localeCompare(b.s) || a.u.localeCompare(b.u));
  for (const r of out) console.log(`LINK ${r.s} ${r.code} ${r.u}${r.s === "REDIRECT" ? " -> " + r.final : ""}`);
  const c = out.reduce((m, r) => (m[r.s] = (m[r.s] || 0) + 1, m), {});
  console.log("SUMMARY " + JSON.stringify(c));
})();
