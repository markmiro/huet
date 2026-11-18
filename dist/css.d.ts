import { Theme } from 'huet';
/** A color font and its palette, as `readFontPalette` reads it. */
export interface ColorFont {
    /** The `font-family` name the page's `@font-face` rule gives the font. */
    family: string;
    /** The font's palette: `#rrggbb` or `#rrggbbaa`, one per palette entry. */
    colors: readonly string[];
}
/** How strongly color fonts take on a theme, each from 0 to 1. Both default to 1. */
export interface FontSettings {
    /** 0 keeps the font's own colors and 1 (the default) fully adopts the theme. */
    strength?: number;
    /** How much a tinted neutral ramp also tints saturated colors. Defaults to 1. */
    tint?: number;
}
export interface FontPaletteCssOptions extends FontSettings {
    /** The palette's name, a dashed identifier for `font-palette`. Defaults to `--huet-fonts`. */
    name?: string;
}
/** Maps palette colors into a theme, like Huet maps an SVG's fills. Alpha is kept. */
export declare function paletteMapper(theme: Theme, { strength, tint }?: FontSettings): (color: string) => string;
/**
 * A `@font-palette-values` rule that repaints one color font in a theme, for
 * pages that render on the server or at build time. Every palette color is
 * mapped like an image pixel: grays follow the theme's neutral ramp, and
 * colors follow its hues. Put `font-palette: --huet-fonts` (or your `name`) on
 * the themed element, and text in that font takes the theme, emoji included.
 * In the browser, `mountFonts` does both and follows theme changes.
 *
 * Call it once per font and join the results. At strength 0 it returns an
 * empty string, so the font keeps its own colors.
 */
export declare function fontPaletteCss(theme: Theme, { family, colors }: ColorFont, { name, ...settings }?: FontPaletteCssOptions): string;
