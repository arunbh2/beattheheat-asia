/**
 * Builds src/data/capitals.json and docs/CAPITALS_COVERAGE.md from Natural Earth (public domain).
 * Source: ne_10m_populated_places_simple and ne_10m_admin_0_countries, natural-earth-vector (VERSION file read at build).
 * Every inclusion or exclusion below is an editorial rule written in CAPITALS_COVERAGE.md, never a silent edit.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, ".."), CACHE = join(ROOT, "scripts/.cache");
const NE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master";
const get = (file: string) => {
  const p = join(CACHE, file); mkdirSync(CACHE, { recursive: true });
  if (!existsSync(p)) execFileSync("curl", ["-sSfL", "-o", p, `${NE}/geojson/${file}`]);
  return JSON.parse(readFileSync(p, "utf8"));
};
const version = (() => { try { return execFileSync("curl", ["-sSfL", `${NE}/VERSION`]).toString().trim(); } catch { return "unknown"; } })();

type P = Record<string, any>;
const places: P[] = get("ne_10m_populated_places_simple.geojson").features.map((f: any) => f.properties);
const countries: P[] = get("ne_10m_admin_0_countries.geojson").features.map((f: any) => f.properties);
const byA3 = new Map(countries.map(c => [c.ADM0_A3, c]));
// Natural Earth uses SSD for South Sudan in populated places and SDS in admin-0; this joins the two.
const A3_ALIAS: Record<string, string> = { SSD: "SDS" };

// --- editorial rules (each one is listed in the coverage report) ---
const EXCLUDE_PRIMARY: Record<string, string> = {
  "MMR|Yangon": "Natural Earth's own note says 'Former capital'; Naypyidaw is listed as the capital.",
  "ZAF|Johannesburg": "Natural Earth gives no capital function for this row; Pretoria, Cape Town and Bloemfontein carry South Africa's executive, legislative and judicial roles.",
};
const INCLUDE_ALT: Record<string, string> = {
  "SWZ|Lobamba": "Legislative and royal capital",
  "NLD|The Hague": "Seat of government",
  "LKA|Sri Jayawardenepura Kotte": "Legislative capital",
  "TZA|Dodoma": "Official capital",
  "MYS|Putrajaya": "Administrative capital",
  "BEN|Porto-Novo": "Official capital",
  "CHL|Valparaíso": "Seat of the national legislature",
};
const EXCLUDE_ALT_REASON = "Natural Earth lists this row as an alternative capital without a current national capital function that this release can verify (historic, former, seasonal or claimed). Left out pending editorial review.";
const RENAMES: Record<string, { name: string; note: string }> = {
  "KAZ|Nur-Sultan": { name: "Astana", note: "Natural Earth lists this city as Nur-Sultan; it was renamed Astana in 2022." },
};
const ROLE_FROM_CAPIN = (s: string | null) => !s ? "National capital" :
  /^De facto/.test(s) ? "De facto capital" : /^Administrative/.test(s) ? "Administrative capital" : /^Judicial/.test(s) ? "Judicial capital" :
  /^Legislative/.test(s) ? "Legislative capital" : /^Official and/.test(s) ? "Official and administrative capital" : /^Official/.test(s) ? "Official capital" : "National capital";

const slug = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const included: any[] = [], excluded: { name: string; country: string; reason: string }[] = [];

for (const p of places) {
  if (!/^Admin-0 capital/.test(p.featurecla)) continue;
  const key = `${p.adm0_a3}|${p.name}`, alt = p.featurecla === "Admin-0 capital alt";
  if (!alt && EXCLUDE_PRIMARY[key]) { excluded.push({ name: p.name, country: p.adm0name, reason: EXCLUDE_PRIMARY[key] }); continue; }
  if (alt && !INCLUDE_ALT[key]) { excluded.push({ name: p.name, country: p.adm0name, reason: EXCLUDE_ALT_REASON }); continue; }
  const c = byA3.get(A3_ALIAS[p.adm0_a3] || p.adm0_a3);
  const rename = RENAMES[key];
  const name = rename ? rename.name : p.name;
  const neType: string = c ? c.TYPE : "Unmatched";
  const notes: string[] = [];
  if (rename) notes.push(rename.note);
  if (neType === "Disputed") notes.push("Natural Earth classifies this entity as disputed. Shown as listed in Natural Earth; this is the source's classification, not a position of this platform.");
  if (neType === "Dependency" || neType === "Lease") notes.push(`Natural Earth classifies this as a ${neType.toLowerCase()}, not a sovereign state.`);
  included.push({
    id: `${(p.adm0_a3 as string).toLowerCase()}-${slug(name)}`,
    name, country: p.adm0name as string,
    isoA3: c && c.ISO_A3 && c.ISO_A3 !== "-99" ? c.ISO_A3 : null,
    neA3: p.adm0_a3 as string,
    lat: Math.round(p.latitude * 1e5) / 1e5, lon: Math.round(p.longitude * 1e5) / 1e5,
    capitalRole: alt ? INCLUDE_ALT[key] : ROLE_FROM_CAPIN(p.capin),
    entityType: neType,
    notes,
  });
}
included.sort((a, b) => a.country.localeCompare(b.country) || a.name.localeCompare(b.name));
const ids = new Set<string>(); for (const c of included) { if (ids.has(c.id)) throw new Error("duplicate id " + c.id); ids.add(c.id); }

// sovereign states or countries in Natural Earth with no capital row at all
const withCap = new Set(included.map(c => A3_ALIAS[c.neA3] || c.neA3));
const noRow = countries.filter(c => (c.TYPE === "Sovereign country" || c.TYPE === "Country") && !withCap.has(c.ADM0_A3))
  .map(c => ({ name: c.ADMIN as string, type: c.TYPE as string })).sort((a, b) => a.name.localeCompare(b.name));

const provenance = {
  sourceName: "Natural Earth 1:10m Populated Places and Admin-0 Countries",
  sourceUrl: "https://www.naturalearthdata.com/downloads/10m-cultural-vectors/",
  datasetVersion: `natural-earth-vector ${version}`, licensedUse: "Public domain (Natural Earth terms of use)",
  temporalKind: "static_estimate", spatialResolution: "Point location of the city as mapped at 1:10m scale",
  caveat: "A single point per city, used to sample gridded weather. Not a municipal or metropolitan boundary.",
};
writeFileSync(join(ROOT, "src/data/capitals.json"), JSON.stringify({ generatedAt: new Date().toISOString().slice(0, 10), provenance, capitals: included }, null, 1) + "\n");

const by = (t: string) => included.filter(c => c.entityType === t).length;
const md = `# Capitals coverage

Generated by \`scripts/build-capitals.ts\` on ${new Date().toISOString().slice(0, 10)} from **Natural Earth ${version}** (public domain):
1:10m Populated Places (\`featurecla\` = "Admin-0 capital" and "Admin-0 capital alt") joined to 1:10m Admin-0 Countries.

## What is plotted

**${included.length} capital points** for **${new Set(included.map(c => c.neA3)).size} Natural Earth Admin-0 entities**.

| Natural Earth entity type | Points |
|---|---|
| Sovereign country | ${by("Sovereign country")} |
| Country (constituent country or special status) | ${by("Country")} |
| Sovereignty | ${by("Sovereignty")} |
| Disputed | ${by("Disputed")} |
| Dependency or lease | ${by("Dependency") + by("Lease")} |
| Unmatched to Admin-0 | ${by("Unmatched")} |

Countries with more than one capital function get one point per function, each labelled with its role
(for example Pretoria, administrative; Cape Town, legislative; Bloemfontein, judicial).

This is **not** a claim to cover "all capitals". Capitals are a navigation layer, not a representative sample of where heat harms people.

## Editorial decisions

### Rows left out
| City | Natural Earth country | Reason |
|---|---|---|
${excluded.map(e => `| ${e.name} | ${e.country} | ${e.reason} |`).join("\n")}

### Alternative-capital rows included, with the role shown
${Object.entries(INCLUDE_ALT).map(([k, v]) => `- ${k.split("|")[1]} (${k.split("|")[0]}): ${v}`).join("\n")}

### Name corrections
${Object.entries(RENAMES).map(([k, v]) => `- ${k.split("|")[1]} → **${v.name}**: ${v.note}`).join("\n")}

### Joins
- South Sudan is coded \`SSD\` in Populated Places and \`SDS\` in Admin-0 Countries; the two are joined explicitly.

## Entities with no capital point
These Natural Earth sovereign states or countries have no capital row in the source, and none is invented here:

${noRow.map(n => `- ${n.name} (${n.type})`).join("\n")}

Notes: Nauru has no official capital. Special administrative regions and constituent countries without a row are not national capitals.

## Naming and status policy
Country and place names, and the disputed or dependent status shown in a dossier, are Natural Earth's labels.
They are shown as the source's classification and are not a position taken by this platform.
Corrections are made through the editorial workflow (\`EDITORIAL_WORKFLOW.md\`) and recorded here.
`;
writeFileSync(join(ROOT, "docs/CAPITALS_COVERAGE.md"), md);
console.log(`capitals: ${included.length} included, ${excluded.length} excluded, ${noRow.length} entities without a row; Natural Earth ${version}`);
