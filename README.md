# huet

Color utilities that are defined by **contrast**, not by palette. Instead of `bg-gray-100 text-gray-900`, you write `bg-5%` ("a surface 5% away from whatever I'm on") and text automatically picks the readable direction. Change the theme (including to a mid-gray page) and everything stays readable, hues stay recognizable, and nothing re-renders.

Made for utility apps and first versions of products: you get a decent, consistent, themeable UI without designing a palette.

- Works with any framework or none: it's CSS. Vite + React, Vue, Svelte, Astro or plain HTML.
- A Tailwind CSS v4 plugin, plus a prebuilt stylesheet if you don't use Tailwind.
- Static class names, so Tailwind IntelliSense, `eslint-plugin-better-tailwindcss` and `prettier-plugin-tailwindcss` work.
- Nesting works in pure CSS: a `bg-5%` card inside a `bg-5%` card is 5% further away again.
- Live theme changes are a style recalculation. No React context, no re-rendering.

## Install

```sh
npm install huet
```

### With Tailwind CSS v4

```css
@import "tailwindcss";
@plugin "huet/tailwind";

/* Optional: remove Tailwind's palette, so only huet colors exist (and linters flag bg-gray-100). */
@theme { --color-*: initial; }
```

### Without Tailwind

```js
import "huet/huet.css"; // every class, default theme
```

`hover:` and other variants need Tailwind. Everything else is the same.

## Classes

| Class | Meaning |
| --- | --- |
| `bg-{n}%` | A surface `n`% contrast away from the parent background. Its text becomes readable automatically. |
| `text-{n}%` | Text at `n`% contrast. `text-100%` is the default on every surface. |
| `border-{n}%` `outline-{n}%` `ring-{n}%` `divide-{n}%` | Edges, measured against what's *behind* the element. |
| `fill-{n}%` `stroke-{n}%` `placeholder-{n}%` `accent-{n}%` `caret-{n}%` `decoration-{n}%` | Same idea for the other color properties. |
| `{root}-{hue}-{n}%` | The same in a hue: `text-red-100%`, `bg-blue-10%`, `border-green-50%`. |
| `hue-{hue}` | Sets the hue for this element and everything inside it, so `bg-10%`, `text-60%` etc. become that hue. `hue-neutral` resets it. |

`n` is 0 to 100 in steps of 5. Default hues: `red`, `yellow`, `green`, `blue`, `purple`.

Rough guide:

| Amount | Typical use |
| --- | --- |
| 5–10% | cards, hover states, tints (`hue-red bg-10%` is an error banner) |
| 15–30% | borders, dividers, inputs |
| 50–60% | muted text, placeholders, icons |
| 100% | body text, solid buttons (`bg-100%`, `bg-blue-100%`) |

```html
<div class="bg-5% border border-15% rounded p-4">
  <h2>Card</h2>
  <p class="text-60%">Muted text</p>
  <input class="bg-0% border border-25% placeholder-50%" placeholder="Email" />
  <button class="bg-blue-100% hover:bg-blue-90%">Save</button>
  <div class="hue-red bg-10% border border-30%">Something went wrong.</div>
</div>
```

`border-*` only sets the color. Use Tailwind's `border` (or your own CSS) for the width.

## Themes

A theme is a small, JSON-serializable object:

```ts
{
  dark: "#000000",   // dark end of the neutral ramp
  light: "#ffffff",  // light end
  bg: 1,             // page background: 0 = dark end, 1 = light end. 0.5 is mid-gray.
  contrast: 1,       // multiplies every amount. 0.5 looks disabled, 1.5 is high contrast.
  hues: { red: "#e5484d", blue: "oklch(0.6 0.19 255)" }, // replaces the default hues
}
```

Every field is optional. Colors can be hex, `rgb()`, `oklch()` or `oklab()`.

**In CSS**, as plugin options (unknown keys are hues):

```css
@plugin "huet/tailwind" { dark: #1d2a3a; light: #e8f0ff; bg: 0.95; red: #e5484d; teal: #12a594; }
```

**Shared between JS and CSS**: put the theme in a module and point `@plugin` at a one-line file.

```ts
// theme.ts
export const theme = { dark: "#1d2a3a", light: "#e8f0ff", hues: { red: "#e5484d", teal: "#12a594" } };

// huet.ts
import huet from "huet/tailwind";
import { theme } from "./theme";
export default huet(theme);
```

```css
@plugin "./huet.ts";
```

**At runtime** (dark mode, theme pickers, sliders):

```ts
import { applyTheme } from "huet";

applyTheme(document.documentElement, theme);   // full theme
applyTheme(document.documentElement, { bg: 0 }); // merges onto what was applied before
```

**Per subtree**: any element with `data-theme` starts a fresh theme. Named themes come from the `themes` option (JS) or from `applyTheme(element, ...)`. The two public variables can also be set from CSS:

```html
<aside data-theme style="--huet-bg: 0.1">Dark sidebar on a light page</aside>
<fieldset class="[--huet-contrast:0.5]">Looks disabled</fieldset>
```

## JavaScript API

```ts
import { applyTheme, createTheme, resolve, buildCss, themeVars } from "huet";
```

- `applyTheme(element, theme)` writes the theme's CSS variables onto an element.
- `createTheme(input, base?)` fills in defaults and validates.
- `resolve(classLists, theme?)` gives the colors CSS would produce, as hex. Use it for canvas, charts, emails and tests: `resolve(["bg-5%", "text-red-100%"]).text`.
- `themeVars(theme)` returns the CSS variables as an object (for SSR or inline styles).
- `buildCss(theme?, { themes? })` generates the standalone stylesheet.

## Linting and editors

Tailwind IntelliSense picks up the plugin automatically: completions, hover and conflict warnings.

```js
// eslint.config.js
import betterTailwind from "eslint-plugin-better-tailwindcss";

export default [
  {
    plugins: { "better-tailwindcss": betterTailwind },
    settings: { "better-tailwindcss": { entryPoint: "src/app.css" } }, // the file with @plugin "huet/tailwind"
    rules: betterTailwind.configs["recommended-error"].rules,
  },
];
```

This flags unknown classes (`bg-7%`, `bg-pink-10%`, `bg-red-500` once the palette is removed) and conflicts (`bg-5% bg-10%`). `prettier-plugin-tailwindcss` sorts huet classes like any other.

## How it works

Every background is a position on the theme's neutral ramp, measured in perceptual (toe-corrected OKLab) lightness. A class moves some distance from its parent's position:

1. **Direction**: toward whichever end gives text more contrast. The switch point sits between where APCA and WCAG say light and dark text tie.
2. **Distance**: a curve that is linear for small amounts (a 25% border looks the same on white and on mid-gray) and lands exactly on the far end at 100%.
3. **Hues**: pulled toward their own lightness, so red stays red on mid-gray, but never below a contrast floor.
4. **Chroma**: small amounts get a small chroma budget, so `bg-red-10%` is a tint everywhere.

The CSS does this math with registered custom properties, `color-mix(in oklab)`, `pow()` and container style queries for nesting. `src/engine.ts` is the readable reference; `src/css.ts` is a line-by-line transcription, and a browser test checks they agree.

Requires container style queries, `@property`, `color-mix()` and `pow()`: Chrome/Edge 120+ and Safari 18+. Firefox needs container style queries for custom properties, which it hadn't shipped when this was written; verify before relying on it.

## Development

```sh
npm install
npm run dev           # demo: kitchen sink + mid-gray comparison grid
npm test              # unit tests
npm run test:browser  # computed colors in Chromium vs the JS engine
npm run build         # dist/ + demo
```

The previous React implementation is in `legacy/` (`npm --prefix legacy install && npm run legacy`).
