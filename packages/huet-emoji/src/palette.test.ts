import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { readFontPalette } from "./palette";

const fixture = (name: string) => new Uint8Array(readFileSync(new URL(`./fixtures/${name}`, import.meta.url)));

/** A font file with only a CPAL table: each palette is a list of [r, g, b, a]. */
function fontWith(palettes: number[][][], tag = "CPAL") {
  const entries = palettes[0].length;
  const header = 12 + palettes.length * 2;
  const table = new Uint8Array(header + palettes.length * entries * 4);
  const view = new DataView(table.buffer);
  view.setUint16(2, entries);
  view.setUint16(4, palettes.length);
  view.setUint16(6, palettes.length * entries);
  view.setUint32(8, header);
  palettes.forEach((colors, p) => {
    view.setUint16(12 + p * 2, p * entries);
    // Color records are stored blue first.
    colors.forEach(([r, g, b, a], i) => table.set([b, g, r, a], header + (p * entries + i) * 4));
  });
  const file = new Uint8Array(12 + 16 + table.length);
  const directory = new DataView(file.buffer);
  directory.setUint32(0, 0x00010000);
  directory.setUint16(4, 1);
  file.set(Array.from(tag, (char) => char.charCodeAt(0)), 12);
  directory.setUint32(12 + 8, 28);
  directory.setUint32(12 + 12, table.length);
  file.set(table, 28);
  return file;
}

afterEach(() => vi.unstubAllGlobals());

describe("readFontPalette", () => {
  it("reads the same palette from TTF, WOFF and WOFF2", async () => {
    const ttf = await readFontPalette(fixture("twemoji-subset.ttf"));
    expect(ttf).toHaveLength(20);
    for (const color of ttf) expect(color).toMatch(/^#[0-9a-f]{6}$/);
    // Twemoji's heart red.
    expect(ttf).toContain("#dd2e44");
    expect(await readFontPalette(fixture("twemoji-subset.woff"))).toEqual(ttf);
    expect(await readFontPalette(fixture("twemoji-subset.woff2"))).toEqual(ttf);
    // An ArrayBuffer, as fetch gives, reads the same.
    expect(await readFontPalette(fixture("twemoji-subset.ttf").buffer)).toEqual(ttf);
  });

  it("reads the chosen palette and keeps alpha", async () => {
    const font = fontWith([
      [[255, 0, 0, 255], [0, 128, 255, 128]],
      [[1, 2, 3, 255], [4, 5, 6, 0]],
    ]);
    expect(await readFontPalette(font)).toEqual(["#ff0000", "#0080ff80"]);
    expect(await readFontPalette(font, { palette: 1 })).toEqual(["#010203", "#04050600"]);
    await expect(readFontPalette(font, { palette: 2 })).rejects.toThrow("the font has 2 palettes, so there is no palette 2");
  });

  it("decompresses with the given function instead of DecompressionStream", async () => {
    const { brotliDecompressSync } = await import("node:zlib");
    const formats: string[] = [];
    vi.stubGlobal("DecompressionStream", undefined);
    const colors = await readFontPalette(fixture("twemoji-subset.woff2"), {
      decompress(bytes, format) {
        formats.push(format);
        return brotliDecompressSync(bytes);
      },
    });
    expect(formats).toEqual(["brotli"]);
    expect(colors).toHaveLength(20);
  });

  it("explains what it can't read", async () => {
    await expect(readFontPalette(fontWith([[[0, 0, 0, 255]]], "glyf"))).rejects.toThrow(/no color palette \(no CPAL table\)/);
    await expect(readFontPalette(new TextEncoder().encode("<!doctype html>"))).rejects.toThrow("not a TTF, OTF, WOFF or WOFF2 font file");
    await expect(readFontPalette(fixture("twemoji-subset.ttf").subarray(0, 40))).rejects.toThrow("cut short or corrupt");
    // Chromium has no Brotli in DecompressionStream.
    vi.stubGlobal(
      "DecompressionStream",
      class {
        constructor() {
          throw new TypeError("Unsupported compression format");
        }
      },
    );
    await expect(readFontPalette(fixture("twemoji-subset.woff2"))).rejects.toThrow(/can't decompress WOFF2 .*npx huet-emoji palette/);
  });
});
