# huet

Relative UI colors and themed images from one theme, for any framework. Choose a theme, then give each element a ramp and a contrast amount in its class name, such as `huet-bg-blue-20`. Huet works out the actual colors from the element's parent background, and recolors images to match. Layout stays with your framework or Tailwind.

For a React theme editor that drives these themes, see [`huet-react`](https://www.npmjs.com/package/huet-react).

## Install

```sh
pnpm add huet   # or: npm install huet
```

| Entry point | Contents |
| --- | --- |
| `huet` | `createTheme`, `mountTheme`, class validation |
| `huet/images` | `mountImages`, `mountSvgs`, `recolorImage`, and the lower-level recoloring functions |
| `huet/config` | The theme config format that `huet-react` and exported theme files use, and `themeFromConfig` |
| `huet/styles.css` | Huet's class styles |
| `huet/tailwind.css` | The same styles as a Tailwind v4 bridge |
| `huet/forms.css` | Optional minimal styles for native form controls, drawn from the theme |

`huet/core` is an alias of `huet`. Huet doesn't depend on React or any other framework.

## Minimal setup

```ts
import { createTheme, mountTheme } from "huet";
import "huet/styles.css";

const theme = createTheme({
  dark: "#233b91",
  light: "#ffffff",
  background: 1,
});
const colors = mountTheme(document.querySelector<HTMLElement>("#app")!, theme);

// Update CSS variables without rerendering framework components.
colors.update(createTheme({ dark: "#233b91", background: 0 }));
// On unmount:
// colors.destroy();
```

```html
<div id="app">
  <section class="huet-bg-gray-20">
    <h2>Workspace</h2>
    <p class="huet-text-60">Manage your profile.</p>
    <input class="huet-bg-10 huet-bg/border-60" aria-label="Email" />
    <p class="huet-text-red-100">Invalid email address</p>
    <button class="huet-bg-blue-20">Save changes</button>
  </section>
</div>
```

Huet supplies colors. Add padding, border widths/styles, focus behavior, radii, and layout yourself. Mount after the root exists. Ordinary wrapper elements do not break background inheritance. Newly inserted, removed, reparented, or reclassified elements update automatically. One mount per independent DOM tree; dispose on unmount.

## Class syntax

`huet-PROPERTY-[RAMP-]AMOUNT`

| Part | Values |
| --- | --- |
| Property | `bg`, `text`, `border`, `outline` |
| Ramp (optional) | `gray`, `red`, `yellow`, `green`, `blue`, `purple`, `white` |
| Amount | `0`, `5`, `10`, `20`, `30`, `40`, `50`, `60`, `70`, `80`, `90`, `95`, `100` |

Examples: `huet-bg-blue-20`, `huet-text-100`, `huet-border-red-60`, `huet-outline-blue-80`.

Amounts use the original 0–100 relative contrast scale, not Tailwind shades, opacity, or contrast ratios. The 13 amounts are Tailwind's 11 steps (50, 100, 200 … 900, 950 become 5, 10, 20 … 90, 95) plus both ends, but they measure distance from the parent's background, not a fixed lightness: on a dark parent, `huet-bg-10` is lighter than the parent. Zero matches the reference background; 100 requests the full available ramp strength. Equal steps in amount are equal steps in CIE L* lightness, toward whichever end of the ramp text reads better against (measured with [APCA](https://github.com/Myndex/apca-w3)). Omitting the ramp uses the inherited base ramp (gray for `createTheme`). Choosing a blue background does not automatically switch that base ramp to blue. The `white` ramp preserves the original direct-ramp behavior: it chooses a discrete color from the background, ignoring the local amount.

The classes use the same `Color.contrast()` solver as Huet's original React API, including the neutral/semantic ramp corrections and stable global contrast fade.

### What colors are relative to

By default, every explicit property is relative to the nearest parent background. Setting a background automatically supplies foreground contrast 100 against that new background. An explicit text class overrides that automatic foreground.

```html
<!-- Text and border explicitly reference the parent background. -->
<button class="huet-bg-blue-20 huet-text-100 huet-border-red-60">Save</button>

<!-- Text and border explicitly reference this button's own background. -->
<button class="huet-bg-blue-20 huet-bg/text-100 huet-bg/border-red-60">Save</button>
```

`bg/text`, `bg/border`, and `bg/outline` preserve the original `bg/fg`, `bg/b`, and `bg/o` reference semantics. Class ordering does not matter: the background is resolved first. Without an explicit background, the own-background and parent references are equivalent. Use one class per color property. Referencing other properties as a source is not supported in this first class API.

### Static checking

Use literal class names. Every amount and built-in ramp is statically recognized, with or without [Tailwind variants](#tailwind-variants):

```ts
import { validateClasses, type HuetClass } from "huet";
const background = "huet-bg-blue-20" satisfies HuetClass;
const hover = "hover:huet-bg-blue-30" satisfies HuetClass;
validateClasses("p-4 huet-text-blu-100"); // Unknown Huet class
validateClasses("huet-text-60 huet-bg/text-100"); // Conflicting text classes
validateClasses("huet-bg-10 hover:huet-bg-20"); // Fine: one background per variant
validateClasses("huet-bg-25"); // Not an amount; suggests huet-bg-20 or huet-bg-30
validateClasses("hover:huet-bg-20/50"); // Opacity modifiers aren't supported; says what to use instead
validateClasses("bg-huet-blue"); // A background Huet can't track; suggests huet-bg-blue-20
```

```sh
npx huet check src/App.vue src/Card.svelte src/Page.tsx
```

The CLI checks literal tokens, including comments/strings, and exits nonzero for unknown classes. It is a lexical checker, not a framework parser. Pass explicit files or shell-expanded globs. `validateClasses()` also detects conflicting properties: one class per property for each variant chain, so `hover:huet-text-60 hover:huet-bg/text-80` conflict but `huet-text-60 hover:huet-text-100` don't. Dynamically constructed names and arbitrary ramp names are not supported yet. To compute a color for any other amount, use `theme.relative.contrast()` (see [Shared colors](#shared-colors-and-theme-updates)).

These are errors, and each message says what to write instead:

- Amounts other than the 13 above, such as `huet-bg-25`. The message names the two closest amounts.
- Opacity modifiers, such as `huet-bg-20/50`. A see-through color no longer has the contrast Huet chose for it; use a lower amount.
- Background variants that style another element or a pseudo-element, such as `*:huet-bg-10`, `[&>li]:huet-bg-10` or `before:huet-bg-10`. Put the class on that element instead.
- Variants on the first-pass classes (`huet-surface-*`, `huet-text`, `huet-muted`, `huet-border`, `huet-focus`, `huet-text-HUE`). Use an explicit amount (`hover:huet-bg-20`) or a [token utility](#tailwind-v4) (`hover:text-huet-muted`).

`mountTheme()` checks every class in the tree before writing any colors. An invalid class at mount throws and leaves the tree unchanged. An invalid class added later is reported as an uncaught error, colors stay as they were, and the root gets a `data-huet-error` attribute with the messages until the class is fixed.

## Tailwind v4

Use this CSS entry instead of importing `huet/styles.css` separately:

```css
@import "tailwindcss";
@import "huet/tailwind.css";
```

```html
<section class="huet-bg-20 rounded-lg p-6">
  <p class="huet-text-60 mb-4">Manage your profile.</p>
  <input class="huet-bg-10 huet-bg/border-60 border rounded px-3 py-2" />
  <button class="huet-bg-blue-20 rounded px-4 py-2">Save</button>
</section>
```

This bridge clears Tailwind's color namespace and keeps layout/spacing utilities. Huet's CSS lives in the `components` layer, and every explicit-amount class is also a Tailwind utility. To retain Tailwind's default colors, import `huet/styles.css` instead; you then can't use variants on Huet classes. Backgrounds must be managed by Huet for its relative calculations to track them. Tailwind background utilities that paint a Huet color (`bg-huet-blue`, `bg-(--huet-background)`, `bg-[var(--huet-muted)]`) are errors in `validateClasses()`, `huet check` and `mountTheme()`, because colors nested inside would be solved against the wrong background. Use `huet-bg-*` instead. Other color utilities may use the tokens, with opacity too: `text-huet-blue/50` works, but the translucent color no longer has the contrast Huet chose for it. Arbitrary CSS backgrounds are not tracked.

### Tailwind variants

Explicit-amount classes take any Tailwind variant, including stacked, custom and arbitrary ones:

```html
<a class="huet-text-60 hover:huet-text-100">Docs</a>
<button class="huet-bg-blue-20 hover:huet-bg-blue-30 aria-pressed:huet-bg-blue-50 huet-outline-blue-80 focus-visible:outline-2">
  Save
</button>
<div class="group huet-bg-10 hover:huet-bg-20">
  <p class="huet-text-60">Recomputed for the card's hover background</p>
  <span class="group-hover:huet-bg-blue-40 [&>svg]:huet-bg/text-80"><svg>…</svg></span>
</div>
```

- A background variant changes everything the background affects. When the card above is hovered, its text color, the tokens inside it (`text-huet-muted`, `border-huet-border`, …) and every Huet class nested inside it switch to the colors for the hover background. `mountTheme()` computes each color for each background state in advance, and CSS picks the active one, so hovering runs no JavaScript.
- A variant changes when and where a class applies, not what it is relative to. A class resolves against the background of the element it's written on: the parent's background, or the element's own with `bg/`. For a child or pseudo-element drawn over the element's own background, use the `bg/` form: `[&>svg]:huet-bg/text-80`, `placeholder:huet-bg/text-50`.
- Important works in either position: `huet-bg-20!` or `!huet-bg-20`.
- Each color is computed for every combination of background states above it. More than 256 combinations for one element is an error. Variant backgrounds nested several deep multiply quickly.
- Variants need `huet/tailwind.css`. Tailwind emits only the utilities a project uses. Without Tailwind, use classes without variants.

## Form controls

Native form controls ignore page colors in places: checkboxes, slider tracks, progress bars and date pickers keep the browser's light or dark look whatever your theme is. `huet/forms.css` gives them a minimal style drawn from the nearest Huet surface. Import it, then add `data-huet-forms` to any container:

```css
@import "huet/forms.css"; /* after tailwindcss and huet/tailwind.css, if you use them */
```

```html
<form data-huet-forms>
  <input type="text" placeholder="Name" />
  <input type="range" />
  <label><input type="checkbox" role="switch" /> Notifications</label>
  <button type="submit">Save</button>
</form>
```

It styles every part of each control, not just the outer box:

| Control | Parts |
| --- | --- |
| Text fields, textareas, selects | Border, placeholder, autofill colors, select chevron, multi-select highlight, and in Chromium the dropdown list (`appearance: base-select`) |
| Number, search, date and time inputs | Spin buttons, clear button, calendar and clock icons, datalist arrow, the highlighted part of a date |
| Checkboxes, radios, switches | Box, check, indeterminate dash, dot; `<input type="checkbox" role="switch">` (or Safari's `switch` attribute) gets a track and thumb |
| Range sliders | Track, filled part of the track, thumb, in Chromium, Safari and Firefox |
| Progress bars, meters | Track and value, an animated indeterminate state, and meters' good, fair and poor values in the theme's green, yellow and red |
| Color and file inputs, buttons, fieldsets | Swatch and frame, the file button, a filled submit button, the fieldset border |

Lines (borders and unfilled tracks) use the surface's border color, or the control's `huet-border-*` class. Fills (checks, thumbs, filled tracks, switches, the submit button) use the text color, so `huet-text-blue-100` on a control or its label makes it blue. Progress and meter tracks use a softer version of the line color. Disabled controls and their labels mix their text and line colors 55% over the background, so a disabled slider's fill stays stronger than its track. Disabled fields keep that faded outline, and disabled buttons get a flat fill instead of a border; invalid fields (`:user-invalid` or `aria-invalid="true"`) get the theme's red border. The rules are in the `base` cascade layer with zero-specificity selectors inside the scope, so Huet classes and Tailwind utilities on a control still win.

Popups the browser draws itself, such as the date picker, the color picker and datalist suggestions, follow the page's `color-scheme`, not the theme. Set `color-scheme: dark` on dark themes so they match.

The example demos' [Forms page](https://markmiro.github.io/huet/forms.html) shows every control with the styles on and off.

## Shared colors and theme updates

JavaScript is the source of truth. Endpoints, neutral ramp stops, and semantic overrides accept opaque `#rgb` or `#rrggbb`. `background` is a position from 0 to 1 along the neutral ramp (OKLab unless you choose another [color model](#multi-hue-ramps)). `contrast` is a global multiplier from 0 to 1 for the new relative classes; it preserves enabled color choices and fades them together.

```ts
const theme = createTheme({
  dark: "#233b91",
  light: "#fff",
  background: 1,
  contrast: 1,
  colors: { red: "#d14457" },
});

// Same calculations as huet-bg-blue-20 and its automatic text:
const root = theme.relative;
const button = root.contrast(20, root.theme.ramps.blue);
const buttonBackground = button.hex;
const buttonText = button.contrast(100).hex;

// Reduce global contrast without switching nested colors' light/dark sides.
colors.update(createTheme({ dark: "#233b91", contrast: 0.5 }));
```

Read inherited CSS variables with `getComputedStyle()` when a chart needs the actual mounted colors. Directly editing variables does not rerun the solver; use `update()`.

## Multi-hue ramps

`dark` and `light` make a straight OKLab ramp. A theme like Sunset (navy to yellow) loses its in-between hues on that line, and its midtones turn muddy. To change that, pass a `neutral` ramp, which has the same shape as a theme config's `ramps.gray`. `colors` lists the stops, darkest first. `colorModel` sets how to interpolate between them. Hue-based models such as `hcl` travel around the hue wheel:

```ts
import { createTheme, mountTheme } from "huet";
import "huet/styles.css";

// Sunset: navy → purple → pink → orange → yellow
const sunset = createTheme({
  neutral: { colors: ["#242744", "#ffe173"], colorModel: "hcl" },
  background: 0,
});

// Astro: near-black → mauve → peach → white
const astro = createTheme({
  neutral: { colors: ["#040816", "#ffb980", "#ffffff"], colorModel: "hcl" },
  background: 0,
});

const colors = mountTheme(document.querySelector<HTMLElement>("#app")!, sunset);
colors.update(astro); // switch themes later without rerendering
```

```html
<div id="app">
  <section class="huet-bg-30">
    <h2>Mauve panel</h2>
    <p class="huet-text-60">Secondary text is tinted along the same ramp.</p>
    <aside class="huet-bg-50">A warmer callout, relative to the panel</aside>
  </section>
</div>
```

You keep using the same classes. Only the theme changes. The ramp affects:

- the root `background` position
- every neutral class (no ramp name, or `gray`): `huet-bg-30`, `huet-text-60`, `huet-bg/border-40`, …
- the preset `foreground`, `muted`, and `border` tokens, plus `huet-surface-N` surfaces that start on the ramp

Neutral classes sample this ramp even inside colored surfaces. Semantic ramps (`red`, `blue`, …) keep their own hue.

| `colorModel` | Path between stops |
| --- | --- |
| `oklab` (default), `lab`, `lrgb`, `rgb` | Straight line. Hues blend through gray when they are far apart. |
| `hcl` / `lch`, `oklch`, `hsl`, `hsv`, `hsi` | Around the hue wheel, keeping colors saturated in the middle |

Pass either `neutral` or `dark`/`light`, not both. The first and last stops become `theme.dark` and `theme.light`. Themes without `neutral` produce the same output as earlier releases. `theme.ramp(t)` returns the hex color at any position (0–1), which is useful for drawing a matching gradient or chart scale:

```ts
const gradient = `linear-gradient(to right, ${Array.from({ length: 17 }, (_, i) => astro.ramp(i / 16)).join(", ")})`;
```

To use a theme from the [`huet-react`](https://www.npmjs.com/package/huet-react) configurator (a `ThemeConfig`, such as an exported theme file) as is, pass it to `themeFromConfig`:

```ts
import { mountTheme } from "huet";
import { themeFromConfig } from "huet/config";
mountTheme(document.querySelector("#app")!, themeFromConfig(exportedTheme));
```

To turn one into `createTheme` options by hand instead, replace each name in `ramps.gray.colors` with its `pallet` hex value (Astro's `["black", "gray", "white"]` becomes `["#040816", "#ffb980", "#ffffff"]`), then keep `colorModel` as is. See [multi-hue ramps](https://github.com/markmiro/huet/blob/master/docs/color-models.md) for before/after screenshots. The [lab demo](https://markmiro.github.io/huet/lab.html) includes Sunset and Astro presets, a middle-stop control, and a color-model picker.

## Themed images

`huet/images` recolors images into a theme. Each pixel is read as a position on Huet's default ramps (lightness along the neutral ramp, plus weights on the two nearest hue ramps) and written back at the same position in your theme. Grays follow your neutral ramp, and greens become your green.

```ts
import { createTheme, mountTheme } from "huet";
import { mountImages } from "huet/images";

const sunset = createTheme({ neutral: { colors: ["#242744", "#ffe173"], colorModel: "hcl" } });
const colors = mountTheme(document.body, sunset);
const images = mountImages(document.body, sunset, { hoverOriginal: true });

// Switch themes later: update both mounts.
const paper = createTheme({ dark: "#302723", light: "#f1e4cd" });
colors.update(paper);
images.update(paper);
// On unmount: images.destroy() removes the canvases and shows the original images.
```

```html
<img data-huet-recolor src="/photo.jpg" alt="" />
```

`mountImages` draws each matching image, recolored, into a `<canvas>` inserted right after it, and hides the `<img>` (`display: none`). The image's `src` and `srcset` are left alone. The canvas copies the image's `class` and inline `style` and gets `role="img"` with the image's `alt` as its label; later changes to `class`, `alt`, and `title` carry over. Size images with CSS, since `width` and `height` attributes don't carry over. `mountImages` picks up images that are added later or whose `src` changes, and it waits for `srcset` to choose a size first. Options:

| Option | Default | Effect |
| --- | --- | --- |
| `selector` | `img[data-huet-recolor]` | Which images to recolor |
| `strength` | `1` | 0 keeps the original, 1 fully adopts the theme |
| `tint` | `1` | How much a tinted neutral ramp also shifts saturated colors |
| `invert` | `false` | Flip lightness, for UI screenshots shown in an opposite-polarity theme |
| `source` | Huet's default ramps | The theme the images are assumed to be in |
| `hoverOriginal` | `false` | Show the original while the pointer is over the image |
| `lutSize` | `17` | Size of the lookup table each theme is baked into |
| `renderer` | `"gpu"` | `"gpu"` renders with WebGL2 and falls back to the CPU without it; `"cpu"` always uses the CPU. `hasGpu()` tells you which one `"gpu"` gets |

Images whose original hasn't been recolored yet are hidden (`visibility: hidden`, so layout doesn't shift) until the recolored copy is ready to paint, so the original never flashes. Theme updates redraw the canvases in place, at most once per frame, so a dragged slider doesn't queue work. Images more than a screen away from the viewport are redrawn when they scroll near it; `await images.ready()` draws them right away. Once an image is handled, it gets `data-huet-recolored`, set to `"original"` if it couldn't be read. Server-rendered pages can paint images before the script runs; to hide them from the first paint while mounted, add:

```css
img[data-huet-recolor]:not([data-huet-recolored]) { visibility: hidden; }
```

Rendering runs on the GPU (WebGL2) and falls back to the CPU. The browser must be able to read the pixels, so cross-origin images need CORS headers and a `crossorigin` attribute. Images it can't read are shown as they are, without a canvas. `<picture>` sources are not recolored.

### Inline SVGs

`mountSvgs` recolors inline SVGs with the same mapping, and keeps them as vectors:

```ts
import { mountSvgs } from "huet/images";

const svgs = mountSvgs(document.body, sunset); // recolors <svg data-huet-recolor>
svgs.update(paper);
```

Solid fills, strokes, and gradient stops are mapped, including the black that SVG paints by default. Their alpha is kept, as are `none`, paint servers (`url(#gradient)`), and `opacity`, `fill-opacity`, and `stop-opacity`. Paints that use `currentColor` or a CSS variable, whether declared on the element or inherited, are left alone, since the page's CSS already themes them. Mapped colors are written where the original came from: as presentation attributes (`fill="…"`) for attribute and default paints, so the page's CSS rules, `:hover` included, still outrank them, and as inline styles for paints set in CSS. They go on the SVG, on elements that declare their own paint, and on gradient stops; children that inherit a paint follow their parent. Each update maps the original paints, so switching themes never compounds. SVGs added later, or whose paints change, are recolored at the next frame, and removed or opted-out SVGs get their own styles back, as does every SVG on `destroy()`. `await svgs.ready()` applies pending changes right away. Options are `selector` (default `svg[data-huet-recolor]`), `strength`, `tint`, `invert`, and `source`, as for images.

To find CSS-driven paints, `mountSvgs` reads the page's stylesheets, matching rules in document order with `!important` ones first; it doesn't compare specificity or cascade layers, and it can't read cross-origin stylesheets, whose paints count as solid colors. A change to an ancestor's `class` rescans the SVGs, but changes to ancestors' inline styles or to stylesheets are picked up at the next update.

For canvases, video frames, or your own pipeline, use the lower-level functions:

- `recolorImage(source, theme, options?, canvas?)` draws a decoded image or canvas into a recolored canvas.
- `recolorer(palette, options?)` returns the per-pixel `(r, g, b) => [r, g, b]` mapping.
- `buildLut` / `applyLut` bake that mapping into a 3D lookup table and apply it to `ImageData`.
- `toCube` exports the table as a `.cube` file for ffmpeg, Resolve, or Photoshop.
- `coordinatesOf` / `rampColor` read a pixel's ramp coordinates, or the color at a coordinate.
- `paletteOf(theme)` converts a `createTheme` result into the palette these functions take.

The [image recolor demo](https://markmiro.github.io/huet/recolor.html) compares renderers and themes. The example demos' [Images page](https://markmiro.github.io/huet/images.html) recolors a photo and screenshot gallery into whichever theme you pick in the theme configurator.

## Code blocks

`huetShikiTheme()` is a [Shiki](https://shiki.style) theme whose token colors are Huet variables instead of hex values, e.g. `var(--huet-code-keyword, var(--huet-red))`. Highlight once, at build time or on the server, and the mounted theme colors every block. `update()` re-themes them without re-highlighting. `huetShikiTransformer()` puts a Huet background class on each `<pre>` (`huet-bg-5` by default), so tokens are solved for readable contrast against the block itself. Use `huet-bg-0` to `huet-bg-20` for a block on the page's side of the ramp, or `huet-bg-80` to `huet-bg-100` for the opposite side, such as dark code on a light page.

```js
// astro.config.mjs: Markdown and MDX code blocks
import { huetShikiTheme, huetShikiTransformer } from "huet";

export default defineConfig({
  markdown: {
    shikiConfig: { theme: huetShikiTheme(), transformers: [huetShikiTransformer({ surface: "huet-bg-90" })] },
  },
});
```

Rows marked with Shiki's `// [!code ++]` and `// [!code --]` notation (from `@shikijs/transformers`) get green and red Huet backgrounds nested in the block, and their tokens are solved against the row. `// [!code highlight]` rows are left for a CSS highlighter tint; see the docs. Astro's `<Code>` component takes the same `theme` and `transformers` props. Shiki isn't a dependency of `huet`; the theme is a plain object. See [code blocks](https://github.com/markmiro/huet/blob/master/docs/code-blocks.md) for the token roles and overrides, and the example demos' [Code page](https://markmiro.github.io/huet/code.html).

React, Vue, Svelte, and Astro lifecycle examples are in [framework integration](https://github.com/markmiro/huet/blob/master/docs/frameworks.md). Portals and shadow roots require independent mounts. The DOM adapter runs only in a browser; SSR can compute colors through `theme.relative` and emit matching styles before mounting.

## Compatibility and limits

The first-pass `huet-surface-*`, `huet-muted`, `huet-focus`, and amount-free text/border classes remain supported so existing examples keep working. They use preset roles, as do `theme.tokens()` and `theme.surface()`. They are not equivalent to the new explicit-amount classes. Prefer the new syntax for new projects; do not mix old and new classes for the same property. The [lab demo](https://markmiro.github.io/huet/lab.html) demonstrates those presets.

Preset roles aim for APCA lightness contrast (Lc) 90 (foreground), 60 (muted) and 30 (border). On a background that can't reach Lc 90, such as anywhere on a narrow ramp, they keep those proportions of the contrast that's available instead, so the three stay distinct. Muted and border step from the surface toward the text's endpoint along the neutral ramp's shape, so on a colored surface they start in its hue and pass through the ramp's hues. Explicit neutral classes such as `huet-text-60` stay on the base ramp there. Lc values are design targets, not an accessibility conformance claim: APCA is still a draft.

Relative contrast preserves the intended ramp and hue; it does not promise a fixed contrast at every strength/background. Explicitly low strengths and narrow endpoint ranges stay low contrast. The algorithm supports opaque backgrounds only; gradients, images, alpha compositing, arbitrary CSS backgrounds, and independent CSS color overrides are not tracked. Theme changes still require browser style/paint work.

See [Color Contrast findings](https://github.com/markmiro/huet/blob/master/docs/color-contrast.md) for algorithm decisions.

## License

MIT
