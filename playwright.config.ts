import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  testMatch: ["**/*.spec.ts"],
  reporter: [["list"], ["html", { outputFolder: "__reports__/e2e-report" }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    headless: true,
  },
  // Démarre Next.js automatiquement pour l’e2e
  webServer: {
    command: "PORT=3000 npm run dev",
    url: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120000,
  },
});
