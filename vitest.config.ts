import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = fileURLToPath(new URL("./", import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: "node", // default: node (component tests will opt-in to jsdom)
    include: ["unit-tests/**/*.test.ts"],
    exclude: ["e2e/**", "node_modules/**", "dist/**", ".next/**"],
    setupFiles: ["tests/setup.ts"],
    coverage: {
      provider: "v8",
      reportsDirectory: "__reports__/coverage",
      reporter: ["text", "html", "json-summary"],
    },
    testTimeout: 20000,
    hookTimeout: 20000,
    retry: 0,
  },
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "."),
    },
  },
});
