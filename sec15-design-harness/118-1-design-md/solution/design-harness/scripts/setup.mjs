#!/usr/bin/env node
// Install the runtime dependencies (playwright-core for refs:capture and lint:web, @google/design.md for design-md) next to the harness code.
// Plugins installed from git get this automatically; a local-path plugin runs in place and needs it once.
import { spawnSync } from "node:child_process";
import { HARNESS } from "./lib.mjs";

console.log(`설치: ${HARNESS}`);
const run = spawnSync("npm", ["install", "--omit=dev", "--no-fund", "--no-audit"], { cwd: HARNESS, stdio: "inherit" });
process.exit(run.status ?? 1);
