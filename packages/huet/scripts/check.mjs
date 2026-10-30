#!/usr/bin/env node
// Intentionally lexical: checks literal huet-* tokens in supplied source files.
import { readFile } from "node:fs/promises";
import { isHuetClass } from "./index.js";
const [command, ...files] = process.argv.slice(2);
if (command !== "check" || !files.length) {
  console.error(
    "Usage: huet check file.html [Component.tsx Component.vue Component.svelte ...]",
  );
  process.exit(2);
}
let failed = false;
for (const file of files) {
  try {
    const source = await readFile(file, "utf8");
    for (const match of source.matchAll(
      /(?<![\w-])(?:[\w-]+:)*huet-[\w/.-]+(?:\$\{)?/g,
    )) {
      if (isHuetClass(match[0])) continue;
      const line = source.slice(0, match.index).split("\n").length;
      console.error(
        `${file}:${line}: Unknown or dynamic Huet class: ${match[0]}`,
      );
      failed = true;
    }
  } catch (error) {
    console.error(`${file}: ${error.message}`);
    failed = true;
  }
}
process.exitCode = failed ? 1 : 0;
