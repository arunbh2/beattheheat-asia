/* The heat network finder: the shared words and logic. One file, read by the page builder (tools/build-heat-network.js),
   the data writer (research/2026-11/heat-network/apply.js), the check (tools/check-heat-network.js) and the page script
   (heat-network/network.js), so the page, the filters, the spreadsheet and the check never disagree.
   Rules: every filter narrows (AND between filters); nothing is loosened to fill an empty result; nothing is ranked or
   scored, and order is the order of the list. A place is where the listed work is, as the listing itself says. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.HNCore = factory();
}(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  // South and Southeast Asia, the region this site covers, in alphabetical order
  const REGION = [["AF", "Afghanistan"], ["BD", "Bangladesh"], ["BT", "Bhutan"], ["BN", "Brunei"], ["KH", "Cambodia"], ["IN", "India"], ["ID", "Indonesia"], ["LA", "Laos"], ["MY", "Malaysia"], ["MV", "Maldives"],
    ["MM", "Myanmar"], ["NP", "Nepal"], ["PK", "Pakistan"], ["PH", "Philippines"], ["SG", "Singapore"], ["LK", "Sri Lanka"], ["TH", "Thailand"], ["TL", "Timor-Leste"], ["VN", "Viet Nam"]];
  const BEYOND = [["AU", "Australia"], ["CN", "China"], ["GR", "Greece"], ["HK", "Hong Kong"], ["JP", "Japan"], ["SL", "Sierra Leone"]];
  const COUNTRY = Object.fromEntries(REGION.concat(BEYOND)), IN_REGION = new Set(REGION.map(c => c[0]));
  const SCALE = { city: "One city or district", subnational: "One state or province", country: "One country", "multi-country": "Several countries", regional: "Across the region", global: "Global", unstated: "Place not stated in the listing" };
  const TYPE = { government: "Government body", weather: "Weather service", health: "Health body", city: "City or district government", multilateral: "UN or multilateral body",
    network: "Network or alliance", redcross: "Red Cross or Red Crescent", ngo: "Non-profit organisation", worker: "Worker organisation", employer: "Employer",
    research: "Research body", finance: "Insurer, lender or finance body", funder: "Funder", company: "Company", standards: "Standards body", media: "Media" };
  const TYPES = Object.keys(TYPE).map(k => [k, TYPE[k]]).sort((a, b) => a[1].localeCompare(b[1]));
  const LINK = { work: "", home: "The link opens the organisation's homepage, not a page about its heat work.", third: "The link opens a page about this work published by someone else." };
  // place filter values beyond a country code
  const WIDE = "_wide", BEYOND_V = "_beyond", NONE = "_none";
  const PLACE_EXTRA = [[WIDE, "Across the region or global"], [BEYOND_V, "Beyond the region"], [NONE, "Place not stated in the listing"]];

  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = s => String(s || "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[’']/g, "").replace(/[^a-z0-9]+/g, " ").trim();
  const isWide = f => !f.countries.length && (f.scale === "regional" || f.scale === "global");
  const placeWords = f => f.countries.length ? f.countries.map(c => COUNTRY[c] || c).join(", ") : SCALE[f.scale] || "";

  const KEYS = ["country", "action", "part", "type", "q", "wide"];
  function emptyState() { return { country: "", action: "", part: "", type: "", q: "", wide: false }; }
  // the address is the state. Unknown values are dropped, so a stale or mistyped link still opens the full list.
  function parseState(search, known) {
    const p = new URLSearchParams(String(search || "").replace(/^\?/, "")), s = emptyState(), k = known || {};
    const c = p.get("country") || ""; if (COUNTRY[c] && IN_REGION.has(c) || PLACE_EXTRA.some(x => x[0] === c)) s.country = c;
    const a = p.get("action") || ""; if (!k.actions || k.actions.includes(a)) s.action = /^[a-z0-9_-]{1,40}$/.test(a) ? a : "";
    const pt = p.get("part") || ""; if (["demand", "supply", "platform"].includes(pt)) s.part = pt;
    const t = p.get("type") || ""; if (TYPE[t]) s.type = t;
    s.q = (p.get("q") || "").slice(0, 80).trim();
    s.wide = p.get("wide") === "1" && IN_REGION.has(s.country);
    return s;
  }
  function toQuery(s) {
    const p = new URLSearchParams();
    ["country", "action", "part", "type", "q"].forEach(k => { if (s[k]) p.set(k, s[k]); });
    if (s.wide && IN_REGION.has(s.country)) p.set("wide", "1");
    const q = p.toString(); return q ? "?" + q : "";
  }
  // r: { c: [codes], s: scale, p: part, t: type, l: [lever ids], h: text to search }
  function placeMatch(r, s) {
    if (!s.country) return true;
    if (s.country === WIDE) return isWide({ countries: r.c, scale: r.s });
    if (s.country === NONE) return !r.c.length && r.s === "unstated";
    if (s.country === BEYOND_V) return r.c.some(c => !IN_REGION.has(c));
    return r.c.includes(s.country) || (s.wide && isWide({ countries: r.c, scale: r.s }));
  }
  function test(r, s) {
    if (!placeMatch(r, s)) return false;
    if (s.action && !r.l.includes(s.action)) return false;
    if (s.part && r.p !== s.part) return false;
    if (s.type && r.t !== s.type) return false;
    if (s.q) { const h = r.h, words = norm(s.q).split(" ").filter(Boolean); if (!words.every(w => h.includes(w))) return false; }
    return true;
  }
  const count = (records, s) => records.filter(r => test(r, s)).length;
  const active = s => ["country", "action", "part", "type", "q"].filter(k => s[k]);
  const csvCell = v => { let t = String(v == null ? "" : v); if (/^[=+\-@\t\r]/.test(t)) t = "'" + t; return /[",\r\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; };

  return { REGION, BEYOND, COUNTRY, IN_REGION, SCALE, TYPE, TYPES, LINK, PLACE_EXTRA, WIDE, BEYOND_V, NONE, KEYS, esc, norm, isWide, placeWords, emptyState, parseState, toQuery, placeMatch, test, count, active, csvCell };
}));
