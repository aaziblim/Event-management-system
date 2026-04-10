import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const [, , command, ...rawArgs] = process.argv;

if (!command) {
  console.error("Usage: node scripts/next-webpack-compat.mjs <dev|build|start> [args]");
  process.exit(1);
}

// Next 15.x has no --webpack flag. Webpack is the default when Turbopack flags are omitted.
const args = rawArgs.filter((arg) => arg !== "--webpack");

if (rawArgs.includes("--webpack")) {
  console.log("[next-webpack-compat] '--webpack' detected. Running Next.js in default webpack mode.");
}

const nextBin = require.resolve("next/dist/bin/next");
const result = spawnSync(process.execPath, [nextBin, command, ...args], {
  stdio: "inherit",
  env: process.env,
});

if (typeof result.status === "number") {
  process.exit(result.status);
}

process.exit(1);
