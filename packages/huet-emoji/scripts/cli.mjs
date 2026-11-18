#!/usr/bin/env node
// Reads a color font's palette ahead of time, for `colors` in mountFonts and fontPaletteCss.
import { readFile } from "node:fs/promises";
import { brotliDecompressSync, inflateSync } from "node:zlib";
import { readFontPalette } from "./palette.js";

const [command, ...rest] = process.argv.slice(2);
const flag = rest.indexOf("--palette");
const palette = flag < 0 ? 0 : Number(rest[flag + 1]);
const files = rest.filter((_, i) => flag < 0 || (i !== flag && i !== flag + 1));
if (command !== "palette" || files.length !== 1 || !Number.isInteger(palette)) {
  console.error("Usage: huet-emoji palette <font file> [--palette <index>] > palette.json");
  process.exit(2);
}
try {
  const colors = await readFontPalette(await readFile(files[0]), {
    palette,
    decompress: (bytes, format) => (format === "brotli" ? brotliDecompressSync(bytes) : inflateSync(bytes)),
  });
  console.log(JSON.stringify(colors));
} catch (error) {
  console.error(`${files[0]}: ${error.message}`);
  process.exitCode = 1;
}
