#!/usr/bin/env node
// Intentionally lexical: checks literal huet-* tokens in supplied source files.
import { readFile } from "node:fs/promises";
import { validateClasses } from "./index.js";
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
    // Variants include named groups (group-hover/card:) and brackets ([&>svg]:).
    for (const match of source.matchAll(
      /(?<![\w-])(?:(?:[\w*-]*\[[^\]\s"'`]*\]|[\w*-]+)(?:\/[\w-]+)?:)*huet-[\w/.-]+(?:\$\{)?/g,
    )) {
      const errors = match[0].endsWith("${")
        ? [`Dynamic Huet class: ${match[0]}`]
        : validateClasses(match[0]);
      if (!errors.length) continue;
      const line = source.slice(0, match.index).split("\n").length;
      for (const error of errors) console.error(`${file}:${line}: ${error}`);
      failed = true;
    }
  } catch (error) {
    console.error(`${file}: ${error.message}`);
    failed = true;
  }
}
process.exitCode = failed ? 1 : 0;
