// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Detect if building for Vercel or standard Node server
const preset = process.env.VERCEL ? "vercel" : (process.env.NITRO_PRESET || "node-server");

export default defineConfig({
  nitro: { preset },
  tanstackStart: {
    server: { entry: "server" },
  },
});
