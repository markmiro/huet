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
export declare function canDecompress(format: FontCompression): boolean;
/**
 * Read a color font's palette from its file (TTF, OTF, WOFF or WOFF2): one
 * `#rrggbb` color per palette entry, or `#rrggbbaa` for entries with alpha, in
 * the order `@font-palette-values` numbers them. Pass the result as a font's
 * `colors` to `mountFonts` or `fontPaletteCss`.
 *
 * Throws when the file has no palette. Bitmap and SVG color fonts, such as
 * Apple Color Emoji, have none and can't be themed this way.
 */
export declare function readFontPalette(font: ArrayBuffer | Uint8Array, { palette, decompress }?: ReadFontPaletteOptions): Promise<string[]>;
