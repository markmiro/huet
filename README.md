# Huet

Relative UI colors for utility apps. Choose a theme, then specify a ramp and contrast amount in class names. Layout stays with your framework or Tailwind. The framework-independent entry point is `huet/core`; the original React API remains at `huet`.

## Install this unreleased branch

These changes have not been published to npm.

```sh
# In this repo
npm ci
npm run build:lib
npm pack

# In your app, using the actual path to the generated archive
npm install /path/to/huet/huet-1.0.0-beta.3.tgz
```

The core bundles its color calculations and does not require React. React peers are optional and only needed for the original entry point.

## Minimal setup

```ts
import { createTheme, mountTheme } from "huet/core";
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
    <button class="huet-bg-blue-25">Save changes</button>
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
| Amount | Every whole number from `0` through `100` |

Examples: `huet-bg-blue-25`, `huet-text-100`, `huet-border-red-60`, `huet-outline-blue-80`.

Amounts use the original 0–100 relative contrast scale, not Tailwind shades, opacity, or literal WCAG ratios. Zero matches the reference background; 100 requests the full available ramp strength. Omitting the ramp uses the inherited base ramp (gray for `createTheme`). Choosing a blue background does not automatically switch that base ramp to blue. The `white` ramp preserves the original direct-ramp behavior: it chooses a discrete color from the background, ignoring the local amount.

The new classes call the **same `Color.contrast()` solver as the original API**, including the neutral/semantic ramp corrections and stable global contrast fade.

### What colors are relative to

By default, every explicit property is relative to the nearest parent background. Setting a background automatically supplies foreground contrast 100 against that new background. An explicit text class overrides that automatic foreground.

```html
<!-- Text and border explicitly reference the parent background. -->
<button class="huet-bg-blue-25 huet-text-100 huet-border-red-60">Save</button>

<!-- Text and border explicitly reference this button's own background. -->
<button class="huet-bg-blue-25 huet-bg/text-100 huet-bg/border-red-60">Save</button>
```

`bg/text`, `bg/border`, and `bg/outline` preserve the original `bg/fg`, `bg/b`, and `bg/o` reference semantics. Class ordering does not matter: the background is resolved first. Without an explicit background, the own-background and parent references are equivalent. Use one class per color property. Referencing other properties as a source is not supported in this first class API.

### Static checking

Use literal class names. All integer amounts and built-in ramps are statically recognized:

```ts
import { validateClasses, type HuetClass } from "huet/core";
const background = "huet-bg-blue-25" satisfies HuetClass;
validateClasses("p-4 huet-text-blu-100"); // Unknown Huet class
validateClasses("huet-text-60 huet-bg/text-100"); // Conflicting text classes
```

```sh
npx huet check src/App.vue src/Card.svelte src/Page.tsx
```

The CLI checks literal tokens, including comments/strings, and exits nonzero for unknown classes. It is a lexical checker, not a framework parser. Pass explicit files or shell-expanded globs. `validateClasses()` also detects conflicting properties. Decimal amounts, dynamically constructed names, arbitrary ramp names, and variants such as `hover:huet-bg-blue-25` are not supported yet.

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
  <button class="huet-bg-blue-25 rounded px-4 py-2">Save</button>
</section>
```

This bridge clears Tailwind's color namespace and keeps layout/spacing utilities. Huet's CSS lives in the `components` layer. To retain Tailwind's default colors, import `huet/styles.css` instead. Backgrounds must be managed by Huet for its relative calculations to track them. Tailwind opacity modifiers and arbitrary CSS backgrounds are not tracked.

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

// Same calculations as huet-bg-blue-25 and its automatic text:
const root = theme.relative;
const button = root.contrast(25, root.theme.ramps.blue);
const buttonBackground = button.hex;
const buttonText = button.contrast(100).hex;

// Reduce global contrast without switching nested colors' light/dark sides.
colors.update(createTheme({ dark: "#233b91", contrast: 0.5 }));
```

Read inherited CSS variables with `getComputedStyle()` when a chart needs the actual mounted colors. Directly editing variables does not rerun the solver; use `update()`.

## Multi-hue ramps

`dark` and `light` make a straight OKLab ramp. A theme like Sunset (navy to yellow) loses its in-between hues on that line, and its midtones turn muddy. To change that, pass a `neutral` ramp, which has the same shape as the legacy React `ramps.gray` config. `colors` lists the stops, darkest first. `colorModel` sets how to interpolate between them. Hue-based models such as `hcl` travel around the hue wheel:

```ts
import { createTheme, mountTheme } from "huet/core";
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

To port a legacy React theme, replace each name in `ramps.gray.colors` with its `pallet` hex value (Astro's `["black", "gray", "white"]` becomes `["#040816", "#ffb980", "#ffffff"]`), then keep `colorModel` as is. See [multi-hue ramps](docs/color-models.md) for before/after screenshots. The lab demo (`/lab.html`) includes Sunset and Astro presets, a middle-stop control, and a color-model picker.

React, Vue, Svelte, and Astro lifecycle examples are in [framework integration](docs/frameworks.md). Portals and shadow roots require independent mounts. The DOM adapter runs only in a browser; SSR can compute colors through `theme.relative` and emit matching styles before mounting.

## Compatibility and limits

The first-pass `huet-surface-*`, `huet-muted`, `huet-focus`, and amount-free text/border classes remain supported so existing examples keep working. They use preset roles, as do `theme.tokens()` and `theme.surface()`. They are not equivalent to the new explicit-amount classes. Prefer the new syntax for new projects; do not mix old and new classes for the same property. The old `/lab.html` remains a demonstration of those presets; `/` is the original React demo.

Relative contrast preserves the intended ramp and hue; it does not promise fixed accessibility ratios at every strength/background. Explicitly low strengths and narrow endpoint ranges stay low contrast. The algorithm supports opaque backgrounds only; gradients, images, alpha compositing, arbitrary CSS backgrounds, and independent CSS color overrides are not tracked. Theme changes still require browser style/paint work.

See [Color Contrast findings](docs/color-contrast.md) for algorithm decisions and [legacy React documentation](docs/legacy-react.md) for the original API.

## Development and checks

```sh
npm run dev
npm run typecheck
npm test
npx playwright install chromium
npm run test:browser
npm run build:lib
npm run build
```
