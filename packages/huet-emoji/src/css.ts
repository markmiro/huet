import type { Theme } from "huet";
import { recolorer } from "huet/images";

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

const fraction = (name: string, value: number | undefined) => {
  if (value !== undefined && !(typeof value === "number" && value >= 0 && value <= 1))
    throw new RangeError(`${name} must be a number from 0 to 1, got ${JSON.stringify(value)}`);
};

/** Maps palette colors into a theme, like Huet maps an SVG's fills. Alpha is kept. */
export function paletteMapper(theme: Theme, { strength = 1, tint = 1 }: FontSettings = {}) {
  fraction("strength", strength);
  fraction("tint", tint);
  // Fonts take their own settings, not the theme's image settings.
  const map = recolorer({ ...theme, images: { strength, tint } });
  const mapped = new Map<string, string>();
  return (color: string) => {
    const parts = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/i.exec(color);
    if (!parts)
      throw new TypeError(`palette colors must be #rrggbb or #rrggbbaa, as readFontPalette returns them, got ${JSON.stringify(color)}`);
    const key = parts.slice(1, 4).join("");
    let rgb = mapped.get(key);
    if (!rgb) {
      const [r, g, b] = parts.slice(1, 4).map((channel) => parseInt(channel, 16) / 255);
      rgb = map(r, g, b)
        .map((value) => Math.round(Math.min(1, Math.max(0, value)) * 255).toString(16).padStart(2, "0"))
        .join("");
      mapped.set(key, rgb);
    }
    return `#${rgb}${parts[4] ?? ""}`;
  };
}

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
export function fontPaletteCss(
  theme: Theme,
  { family, colors }: ColorFont,
  { name = "--huet-fonts", ...settings }: FontPaletteCssOptions = {},
) {
  if (!/^--[\w-]+$/.test(name)) throw new TypeError(`name must be a dashed identifier such as --huet-fonts, got ${JSON.stringify(name)}`);
  const toTheme = paletteMapper(theme, settings);
  if (settings.strength === 0 || !colors.length) return "";
  const overrides = colors.map((color, index) => `${index} ${toTheme(color)}`).join(", ");
  return `@font-palette-values ${name} {\n  font-family: ${JSON.stringify(family)};\n  override-colors: ${overrides};\n}\n`;
}
