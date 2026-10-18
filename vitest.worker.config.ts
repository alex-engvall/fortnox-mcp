import { cloudflareTest } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: "./apps/worker/wrangler.jsonc" },
      miniflare: { d1Databases: ["DB"] },
    }),
  ],
  test: { include: ["tests/worker/**/*.test.ts"] },
});
