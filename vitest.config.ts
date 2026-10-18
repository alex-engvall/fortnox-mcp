import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/core/**/*.test.ts", "tests/node/**/*.test.ts"],
    testTimeout: 10_000,
  },
});
