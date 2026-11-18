# huet-emoji

Color emoji in a [Huet](https://www.npmjs.com/package/huet) theme, as ordinary text. You bring an emoji font, and `huet-emoji` repaints it in your theme: grays follow the theme's neutral ramp and colors follow its hues, the same way `huet/images` recolors photos and SVGs. The emoji stay selectable text, with no wrappers, images or canvases. It works for any other color font with a palette too.

## Install

```sh
pnpm add huet huet-emoji   # or: npm install huet huet-emoji
```

`huet` is a peer dependency. `huet-emoji` ships no font.

## Use

**1. Load an emoji font.** Download one that has a palette (see [fonts that work](#fonts-that-work)) and declare it. Put it first in your font stack, and limit it to emoji with `unicode-range` so it leaves letters and digits to your text font:

```css
@font-face {
  font-family: "Twemoji";
  src: url("/fonts/Twemoji.woff2") format("woff2");
  unicode-range: U+200D, U+FE0F, U+20E3, U+231A-23FF, U+2600-27BF, U+2B05-2B55, U+1F000-1FAFF, U+E0020-E007F;
}
body { font-family: "Twemoji", system-ui, sans-serif; }
```

In Tailwind v4, set the stack once: `@theme { --font-sans: "Twemoji", ui-sans-serif, system-ui, sans-serif; }`. The range above is also exported as `emojiRange`.

**2. Read the font's palette once**, into a JSON file:

```sh
npx huet-emoji palette public/fonts/Twemoji.woff2 > src/twemoji-palette.json
```

**3. Mount it** next to your theme:

```ts
import { mountTheme, themes } from "huet";
import { mountFonts } from "huet-emoji";
import colors from "./twemoji-palette.json";

const root = document.querySelector<HTMLElement>("#app")!;
const theme = mountTheme(root, themes.Sunset);
const fonts = mountFonts(root, themes.Sunset, { fonts: [{ family: "Twemoji", colors }] });

// Switch themes later: update both.
theme.update(themes.Paperback);
fonts.update(themes.Paperback);
// On unmount: fonts.destroy() puts the font's own colors back.
```

Your markup doesn't change. Emoji typed in text and in inputs take the theme, because the browser draws them from the font's palette, which `mountFonts` overrides with [`@font-palette-values`](https://developer.mozilla.org/docs/Web/CSS/@font-palette-values). It writes one `<style>` and an inline `font-palette` on `root`, which the text inside inherits.

### Without the build step

Leave out `colors`, and `mountFonts` finds the font's file through your `@font-face` rule and reads the palette in the browser:

```ts
const fonts = mountFonts(root, theme, { fonts: ["Twemoji"] });
await fonts.ready(); // optional: resolves once every font is themed
```

Two things to know:

- **Chromium can't read WOFF2 this way**, since it has no Brotli decoder available to scripts. Firefox and Safari can. List a WOFF or TTF source in the rule as well (`src: url(a.woff2) format("woff2"), url(a.woff) format("woff")`) and `mountFonts` reads the first one it can, or pass `colors` as above. WOFF is about half again as large as WOFF2.
- **The emoji show their own colors until the palette is read.** With `colors`, they're themed from the first paint.

If no stylesheet `mountFonts` can read declares the font (a cross-origin stylesheet, or a `FontFace` made in JavaScript), give the file as `{ family, src }`.

## Fonts that work

A font needs the COLR format, which paints glyphs from a palette. Fonts that store emoji as bitmaps or SVG have no palette, so they can't be themed. That includes Apple Color Emoji: system emoji stay as they are unless you load a font over them.

| Font | Format | Chrome, Firefox | Safari (WebKit) |
| --- | --- | --- | --- |
| [Twemoji, Mozilla build](https://github.com/mozilla/twemoji-colr/releases) (covers Emoji 14) | COLRv0 | Themed | Themed |
| [Twemoji, Nerixyz build](https://github.com/Nerixyz/twemoji-colr-font/releases) (covers Emoji 17) | COLRv0 | Themed | Themed |
| [OpenMoji](https://github.com/hfg-gmuend/openmoji/tree/master/font/OpenMoji-color-glyf_colr_0) | COLRv0 | Themed | Themed |
| [Noto Color Emoji](https://github.com/googlefonts/noto-emoji/tree/main/2D/fonts) (`Noto-COLRv1.ttf`) | COLRv1 | Themed | Blank |

Safari doesn't draw COLRv1 fonts. If you want one anyway, add `tech(color-COLRv1)` to its `src`, so Safari skips it and falls through to the next font in the stack. Emoji a font doesn't cover fall back to the system's emoji, unthemed.

Check each font's license before you ship it. Twemoji's art is CC BY 4.0, which asks for attribution.

### Fonts split across files

A palette belongs to a font family. Font services often split one family into many files with `unicode-range` (Google Fonts serves Noto Color Emoji as eleven), and each file numbers its colors differently, so one palette can't fit them all. `mountFonts` reports this as an error. Host the font as one file, or give each file its own family name and list them all.

## Other color fonts

Any COLR font works the same way, such as a display face with layered colors:

```ts
mountFonts(root, theme, {
  fonts: [
    { family: "Twemoji", colors: twemojiColors },
    { family: "Nabla", colors: nablaColors },
  ],
});
```

Fonts with several palettes are read from palette 0. Pick another with `npx huet-emoji palette font.woff2 --palette 2`, or `{ family, palette: 2 }` when the browser reads it.

## Strength and tint

`mountFonts` and `fontPaletteCss` take the same two settings as Huet's images, each from 0 to 1:

```ts
const fonts = mountFonts(root, theme, { fonts: ["Twemoji"], strength: 0.6, tint: 0 });
fonts.update(theme, { strength: 1 }); // new settings with an update
```

`strength` 0 keeps the font's own colors and 1 (the default) fully adopts the theme. `tint` (default 1) is how much a tinted neutral ramp also tints saturated colors. They are options here, not part of the `Theme`.

Emoji colors can carry meaning, and a theme changes them: ❤️ follows the theme's red, and skin tones shift with its neutral ramp and its red and yellow. Lower `strength` or `tint` if that matters for your content.

## Server rendering

`fontPaletteCss` returns the rule as a string, so a page can paint themed emoji before any script runs:

```ts
import { themeCss, themes } from "huet";
import { fontPaletteCss } from "huet-emoji";
import colors from "./twemoji-palette.json";

const css = themeCss(themes.Sunset) + fontPaletteCss(themes.Sunset, { family: "Twemoji", colors });
// <style>{css}</style>, and font-palette: --huet-fonts on the themed element
```

Pass `{ name: "--sidebar" }` for a second theme on the same page. `mountFonts` uses its own palette name per mount, so it can take over from the server's rule.

## API

| Export | What it does |
| --- | --- |
| `mountFonts(root, theme, { fonts, strength?, tint? })` | Themes the listed fonts under `root` (an element or `document`). Returns `update(theme, settings?)`, `ready()` and `destroy()`. |
| `fontPaletteCss(theme, { family, colors }, { name?, strength?, tint? })` | One `@font-palette-values` rule as a string |
| `readFontPalette(bytes, { palette?, decompress? })` | A font file's palette as `#rrggbb` strings (`#rrggbbaa` for entries with alpha). Reads TTF, OTF, WOFF and WOFF2. |
| `emojiRange` | The `unicode-range` above, as a string |
| `npx huet-emoji palette <font file> [--palette <index>]` | Prints a font's palette as JSON |

A font that can't be read keeps its own colors, and `mountFonts` raises an error for it through `reportError`, without stopping the other fonts.

## Limits

- **Keycaps stay system emoji.** The range leaves out digits, `#` and `*`, so 1️⃣ isn't drawn by the emoji font. A few emoji that double as text symbols outside the emoji blocks (©, ®, ™, ℹ, ↔, ▶) are left to your text font the same way.
- **Symbols inside the emoji blocks become emoji.** Characters such as ❤, ☀ and ✔ are drawn by the emoji font with or without the emoji variation selector.
- **The emoji font must come first** in `font-family`. Safari otherwise draws emoji with Apple Color Emoji before it reaches your font.
- **`font-palette` is the browser feature underneath**: Chrome 101, Firefox 107 and Safari 15.4 or later. Older browsers show the font's own colors.
