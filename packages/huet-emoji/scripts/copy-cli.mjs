import { copyFile } from "node:fs/promises";
await copyFile("scripts/cli.mjs", "dist/cli.mjs");
