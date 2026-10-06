// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import path from "node:path";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";


// Detect if building for Vercel or standard Node server
const isVercel = Boolean(process.env.VERCEL);
const preset = isVercel ? "vercel" : (process.env.NITRO_PRESET || "node-server");

export default defineConfig({
  nitro: {
    preset,
    ...(isVercel
      ? {
          output: {
            dir: path.resolve(process.cwd(), ".vercel/output"),
            serverDir: path.resolve(process.cwd(), ".vercel/output/functions/__server.func"),
            publicDir: path.resolve(process.cwd(), ".vercel/output/static"),
          },
        }
      : {}),
  },
  tanstackStart: {
    server: { entry: "server" },
  },
});

