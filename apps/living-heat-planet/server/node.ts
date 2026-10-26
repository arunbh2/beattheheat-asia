/**
 * Standalone server: the API under /api and the built app from dist/ (or the repo copy).
 * PORT, OPEN_METEO_BASE (e.g. a customer endpoint) and OPEN_METEO_APIKEY are read from the environment; keys stay server-side.
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize } from "node:path";
import { createApi } from "./routes.ts";

const base = process.env.OPEN_METEO_BASE || undefined, key = process.env.OPEN_METEO_APIKEY;
const fetchImpl = key ? ((url: string, init?: { signal?: AbortSignal }) => fetch(url + `&apikey=${encodeURIComponent(key)}`, init)) : undefined;
const api = createApi({ client: { baseUrl: base, fetchImpl: fetchImpl as never } });
const ROOT = process.env.STATIC_DIR || join(import.meta.dirname, "../dist");
const TYPES: Record<string, string> = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".bin": "application/octet-stream", ".woff2": "font/woff2", ".woff": "font/woff", ".svg": "image/svg+xml" };

createServer(async (req, res) => {
  const url = req.url || "/";
  if (url.startsWith("/api/")) { const r = await api(req.method || "GET", url); res.writeHead(r.status, r.headers); res.end(JSON.stringify(r.body)); return; }
  let file = normalize(join(ROOT, decodeURIComponent(url.split("?")[0])));
  if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
  try { if ((await stat(file)).isDirectory()) file = join(file, "index.html"); res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" }); res.end(await readFile(file)); }
  catch { res.writeHead(404, { "content-type": "text/plain" }).end("Not found"); }
}).listen(Number(process.env.PORT || 8787), () => console.log(`Living Heat Planet on http://localhost:${process.env.PORT || 8787}`));
