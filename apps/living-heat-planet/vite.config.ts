import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { createApi } from "./server/routes.ts";

/** Serves /api/* from server/routes.ts in `vite dev` and `vite preview`, so local runs use the real proxy. */
function api(): Plugin {
  const handle = createApi();
  const mw = async (req: { url?: string; method?: string }, res: { statusCode: number; setHeader(k: string, v: string): void; end(b: string): void }, next: () => void) => {
    if (!req.url?.startsWith("/api/")) return next();
    const r = await handle(req.method || "GET", req.url); res.statusCode = r.status;
    Object.entries(r.headers ?? {}).forEach(([k, v]) => res.setHeader(k, v)); res.end(JSON.stringify(r.body));
  };
  return { name: "lhp-api", configureServer: s => { s.middlewares.use(mw as never); }, configurePreviewServer: s => { s.middlewares.use(mw as never); } };
}

export default defineConfig(({ mode }) => ({
  // the static copy for BeatTheHeat.Asia is built with --mode static into the site's own folder
  base: mode === "static" ? "/living-heat-planet/" : "/",
  plugins: [react(), api()],
  build: { outDir: mode === "static" ? "../../living-heat-planet" : "dist", emptyOutDir: true, chunkSizeWarningLimit: 1200 },
  test: { environment: "jsdom", include: ["tests/unit/**/*.test.{ts,tsx}"] },
}));
