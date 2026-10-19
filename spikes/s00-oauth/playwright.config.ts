import { tmpdir } from "node:os";
import { join } from "node:path";
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./browser",
  testMatch: "*.spec.ts",
  outputDir:
    process.env.PROBE_BROWSER_OUTPUT ??
    join(tmpdir(), "fortnox-s00-browser-results"),
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:8794",
    headless: true,
    launchOptions: process.env.PROBE_CHROMIUM_PATH
      ? { executablePath: process.env.PROBE_CHROMIUM_PATH }
      : {},
  },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "node --import tsx browser/harness.ts",
    url: "http://127.0.0.1:8794/",
    reuseExistingServer: false,
  },
});
