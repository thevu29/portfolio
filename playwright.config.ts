import { defineConfig, devices } from "@playwright/test";
// CommonJS bundle: no named ESM exports.
import nextEnv from "@next/env";

// Specs import cv.ts, which reads contact details from env.
nextEnv.loadEnvConfig(process.cwd());

const PORT = 3100;

// Runs against the production build: `pnpm build` first.
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `pnpm exec next start -p ${PORT}`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
  },
});
