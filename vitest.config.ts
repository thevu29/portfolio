import { fileURLToPath } from "node:url";
// CommonJS bundle: no named ESM exports.
import nextEnv from "@next/env";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Same .env files as Next (cv.ts reads contact details from env).
nextEnv.loadEnvConfig(process.cwd());

export default defineConfig({
  plugins: [react()],
  test: {
    // Components default to jsdom; PDF tests opt into node per file.
    environment: "jsdom",
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    setupFiles: ["./vitest.setup.ts"],
    restoreMocks: true,
    unstubGlobals: true,
    alias: {
      "@/": fileURLToPath(new URL("./src/", import.meta.url)),
    },
  },
});
