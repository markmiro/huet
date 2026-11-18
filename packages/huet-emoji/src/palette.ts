/*
  Color fonts in the COLR format paint their glyphs from a palette, stored in
  the font's CPAL table. Browsers can swap those colors from CSS
  (`@font-palette-values`), but have no API to read them, so Huet reads the
  table from the font file.

  The file is one of three containers: a plain sfnt (TTF or OTF), WOFF (each
  table compressed with zlib), or WOFF2 (all tables in one Brotli stream).
*/

/** How a font file compresses its tables: zlib in WOFF, Brotli in WOFF2. */
export type FontCompression = "deflate" | "brotli";

export interface ReadFontPaletteOptions {
  /** Which of the font's palettes to read. Defaults to 0, the one browsers paint with. */
  palette?: number;
  /**
   * Decompresses a WOFF or WOFF2 font's tables, for runtimes where
   * `DecompressionStream` can't. Chromium has no Brotli there, so it can't
   * read WOFF2 without this.
   */
  decompress?: (bytes: Uint8Array, format: FontCompression) => Uint8Array | Promise<Uint8Array>;
}

/** Whether this runtime can decompress a format with `DecompressionStream`. */
export function canDecompress(format: FontCompression) {
  try {
    new DecompressionStream(format as CompressionFormat);
    return true;
  } catch {
    return false;
  }
}

async function streamDecompress(bytes: Uint8Array, format: FontCompression) {
  if (!canDecompress(format))
    throw new Error(
      format === "brotli"
        ? "this runtime can't decompress WOFF2 (Brotli) from a script. Read the palette from a WOFF or TTF copy of the font, or ahead of time with `npx huet-emoji palette <font file>`."
        : "this runtime can't decompress WOFF fonts from a script",
    );
  const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(new DecompressionStream(format as CompressionFormat));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

// WOFF2 names common tables by index. Only the ones up to CPAL matter here.
const woff2Tags =
  "cmap head hhea hmtx maxp name OS/2 post cvt  fpgm glyf loca prep CFF  VORG EBDT EBLC gasp hdmx kern LTSH PCLT VDMX vhea vmtx BASE GDEF GPOS GSUB EBSC JSTF MATH CBDT CBLC COLR CPAL"
    .match(/.{4} ?/g)!
    .map((tag) => tag.slice(0, 4));

const tagAt = (bytes: Uint8Array, at: number) => String.fromCharCode(bytes[at], bytes[at + 1], bytes[at + 2], bytes[at + 3]);

/** A font file's CPAL table, or null when it has none. */
async function cpalOf(bytes: Uint8Array, decompress: NonNullable<ReadFontPaletteOptions["decompress"]>) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const signature = tagAt(bytes, 0);
  if (signature === "wOF2") {
    let at = 48,
      offset = 0,
      found: [number, number] | undefined;
    const base128 = () => {
      let value = 0;
      for (;;) {
        const byte = bytes[at++];
        value = value * 128 + (byte & 127);
        if (!(byte & 128)) return value;
      }
    };
    for (let i = 0, count = view.getUint16(12); i < count; i++) {
      const flags = bytes[at++];
      let tag = woff2Tags[flags & 63];
      if ((flags & 63) === 63) {
        tag = tagAt(bytes, at);
        at += 4;
      }
      let length = base128();
      // glyf and loca are transformed by default; other tables only when flagged.
      const transformed = tag === "glyf" || tag === "loca" ? flags >> 6 === 0 : flags >> 6 !== 0;
      if (transformed) length = base128();
      if (tag === "CPAL") found = [offset, length];
      offset += length;
    }
    if (!found) return null;
    const tables = await decompress(bytes.subarray(at, at + view.getUint32(20)), "brotli");
    return tables.subarray(found[0], found[0] + found[1]);
  }
  const woff = signature === "wOFF";
  // TrueType outlines, CFF outlines ("OTTO"), and Apple's "true".
  if (!woff && signature !== "\0\x01\0\0" && signature !== "OTTO" && signature !== "true")
    throw new TypeError("not a TTF, OTF, WOFF or WOFF2 font file");
  for (let i = 0, count = view.getUint16(woff ? 12 : 4); i < count; i++) {
    const at = (woff ? 44 : 12) + i * (woff ? 20 : 16);
    if (tagAt(bytes, at) !== "CPAL") continue;
    if (!woff) return bytes.subarray(view.getUint32(at + 8), view.getUint32(at + 8) + view.getUint32(at + 12));
    const stored = bytes.subarray(view.getUint32(at + 4), view.getUint32(at + 4) + view.getUint32(at + 8));
    // A table that didn't shrink is stored as is.
    return view.getUint32(at + 8) < view.getUint32(at + 12) ? decompress(stored, "deflate") : stored;
  }
  return null;
}

const hex = (value: number) => value.toString(16).padStart(2, "0");

/**
 * Read a color font's palette from its file (TTF, OTF, WOFF or WOFF2): one
 * `#rrggbb` color per palette entry, or `#rrggbbaa` for entries with alpha, in
 * the order `@font-palette-values` numbers them. Pass the result as a font's
 * `colors` to `mountFonts` or `fontPaletteCss`.
 *
 * Throws when the file has no palette. Bitmap and SVG color fonts, such as
 * Apple Color Emoji, have none and can't be themed this way.
 */
export async function readFontPalette(
  font: ArrayBuffer | Uint8Array,
  { palette = 0, decompress = streamDecompress }: ReadFontPaletteOptions = {},
): Promise<string[]> {
  const bytes = font instanceof Uint8Array ? font : new Uint8Array(font);
  let cpal: Uint8Array | null;
  try {
    cpal = await cpalOf(bytes, decompress);
  } catch (error) {
    // Reads past the end of the file.
    if (error instanceof RangeError) throw new TypeError("the font file is cut short or corrupt", { cause: error });
    throw error;
  }
  if (!cpal)
    throw new TypeError(
      "the font has no color palette (no CPAL table). Only COLR color fonts have one: bitmap and SVG color fonts can't be themed.",
    );
  const view = new DataView(cpal.buffer, cpal.byteOffset, cpal.byteLength);
  const entries = view.getUint16(2),
    palettes = view.getUint16(4);
  if (!Number.isInteger(palette) || palette < 0 || palette >= palettes)
    throw new RangeError(`the font has ${palettes} palette${palettes === 1 ? "" : "s"}, so there is no palette ${palette}`);
  // Each palette starts at an index into one shared array of BGRA records.
  const first = view.getUint32(8) + view.getUint16(12 + palette * 2) * 4;
  const colors: string[] = [];
  for (let i = 0; i < entries; i++) {
    const at = first + i * 4;
    const alpha = cpal[at + 3];
    colors.push(`#${hex(cpal[at + 2])}${hex(cpal[at + 1])}${hex(cpal[at])}${alpha < 255 ? hex(alpha) : ""}`);
  }
  return colors;
}
