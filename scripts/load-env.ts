// Loads .env files exactly like `next dev/build` do. Import it first: ESM
// evaluates imports in order, so modules after it see the variables.
// CommonJS bundle: no named ESM exports.
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());
