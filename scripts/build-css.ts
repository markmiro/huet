/*
  Writes dist/huet.css: every class with the default theme, for projects without Tailwind.
*/
import { mkdirSync, writeFileSync } from "node:fs";
import { buildCss } from "../src/static.ts";

mkdirSync("dist", { recursive: true });
const css = buildCss();
writeFileSync("dist/huet.css", css);
console.log(`dist/huet.css: ${(css.length / 1024).toFixed(0)} KB`);
