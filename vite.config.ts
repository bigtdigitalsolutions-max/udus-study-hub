// @lovable.dev/vite-tanstack-config already in
// or the app will break with duplicate plugins
// - TanStack devtools (dev-only, first), tan
// nitro (build-only using cloudflare as a
// React/TanStack dedupe, error logger plug
// You can pass additional config via defineCon
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  plugins: [
    // Service worker plugin removed to prevent build errors
  ],
  tanstackStart: {
    // Redirect TanStack Start's bundled server
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
