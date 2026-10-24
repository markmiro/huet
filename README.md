# Huet

Relative UI colors for utility apps. Choose two ramp endpoints; Huet adapts surfaces, text, borders, and named colors to their surroundings. Layout stays with your framework or Tailwind.

This branch contains a **first pass at a framework-independent API** under `huet/core`. The original React API remains at `huet`; see [legacy documentation](docs/legacy-react.md). Nothing has been published to npm by this change.

## Try it

```sh
npm ci
npm run dev
```

Open `/lab.html` for the new plain-JavaScript contrast lab, or `/` for the original React example. The lab includes legacy 49% / 51% gray, white-and-blue, light/dark, narrow ramps, editable endpoints, and nested surfaces.

To install this unreleased implementation in another Vite project:

```sh
# In this repo
npm run build:lib
npm pack
# In your app, using the actual path to the generated archive
npm install /path/to/huet/huet-1.0.0-beta.3.tgz
```

The core has no runtime dependencies and does not require React. React peers are optional and only needed for the legacy entry point.

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

// A theme update writes CSS variables, without rerendering framework components.
colors.update(createTheme({ dark: "#233b91", background: 0 }));
// On unmount:
// colors.destroy();
```

```html
<section class="huet-surface-10">
  <h2>Workspace</h2>
  <p class="huet-muted">Secondary text with measured contrast.</p>
  <input
    class="huet-surface-5 huet-border huet-focus"
    aria-label="Workspace name"
  />
  <button class="huet-surface-blue huet-focus">Save changes</button>
</section>
```

Huet supplies colors and a focus indicator; add your own padding, border widths, radii, typography, and layout. Mount after the root exists. One mount per independent DOM tree; dispose on unmount. Ordinary wrapper elements are transparent to surface inheritance. Newly inserted, removed, reparented, or reclassified surfaces update automatically.

## The complete class vocabulary

| Class                                       | Meaning                                                                                                                                              |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `huet-surface-0/5/10/25/50/75/100`          | Choose **one** numeric suffix, e.g. `huet-surface-25`. Move that percentage from the parent background toward the higher-contrast endpoint in OKLab. |
| `huet-surface-red/yellow/green/blue/purple` | Choose one hue, e.g. `huet-surface-blue`. A colored surface with its own foreground tokens.                                                          |
| `huet-text`                                 | Primary text: aim for 7:1, or the best the ramp permits.                                                                                             |
| `huet-muted`                                | Secondary text: aim for 4.5:1.                                                                                                                       |
| `huet-text-red/yellow/green/blue/purple`    | A named text hue: aim for 4.5:1 on full-range themes.                                                                                                |
| `huet-border`                               | Control border: aim for 3:1 against the surface and its parent. Set border width/style yourself.                                                     |
| `huet-focus`                                | An inset keyboard-focus outline, checked against the element's own background.                                                                       |

A numeric surface amount requests a **perceptual interpolation percentage**, not a WCAG ratio. If that point leaves neither theme endpoint readable, Huet nudges it to the nearest readable point on the same path. Colored fills also prioritize readable foregrounds. Explicit root backgrounds and `huet-surface-0` are preserved. Border and foreground roles are solved separately. A 5% surface can be subtle without making its text or boundary subtle.

Use one surface class per element. Use full literal class names, not `huet-surface-${amount}`. `HuetClass`, `classes`, `isHuetClass`, and `validateClasses` expose the same finite vocabulary for TypeScript and lint integrations:

```ts
import { validateClasses, type HuetClass } from "huet/core";
const surface = "huet-surface-25" satisfies HuetClass;
validateClasses("p-4 huet-text-blu"); // ['Unknown Huet class: huet-text-blu']
```

The package also includes a small literal-token checker:

```sh
npx huet check src/App.vue src/Card.svelte src/Page.tsx
```

It reports invalid `huet-*` tokens with file/line locations and exits nonzero. It is a lexical checker (including comments/strings), not a framework parser or ESLint plugin. Pass explicit files or shell-expanded globs. Dynamic construction and variants such as `hover:huet-surface-25` are intentionally unsupported. `validateClasses()` additionally catches multiple surface classes in a class list.

## Tailwind v4

```css
@import "tailwindcss";
@import "huet/tailwind.css";
```

This opt-in bridge clears Tailwind's `--color-*` namespace, registers Huet's inherited color tokens with `@theme inline`, and leaves spacing, layout, typography, and other utilities available. Huet's surface rules live in the `components` layer, below Tailwind utilities.

```html
<div class="huet-surface-10 rounded-lg p-6">
  <p class="text-huet-muted">Secondary text</p>
  <a class="text-huet-fg hover:text-huet-blue underline" href="/settings"
    >Settings</a
  >
  <input
    class="huet-surface-5 border border-huet-border huet-focus rounded px-3 py-2"
  />
</div>
```

Use `huet-surface-*` to change backgrounds. Tailwind can technically generate `bg-huet-*`, but those classes do **not** establish a relative surface; using them can invalidate descendant contrast. Tailwind variants on text/border tokens work normally. Its opacity modifiers also compile, but reduce contrast: they are outside Huet's readability guarantees. To keep Tailwind's palette instead of replacing it, import `huet/styles.css` and define only the `@theme inline` aliases you want.

## Shared theme values

JavaScript configuration is the source of truth in this pass. Inputs are opaque `#rgb` or `#rrggbb`; `background` is an OKLab ramp position from 0 to 1. All semantic text and colored fills choose the same light/dark side of a given background; hues do not flip independently. The five signal anchors can be overridden with `colors: { blue: '#0066cc' }`.

```ts
const theme = createTheme({ dark: "#233b91", light: "#fff" });
const tokens = theme.tokens();
const panel = theme.surface(tokens.background, 25);
const panelTokens = theme.tokens(panel, tokens.background);
// Use these same concrete colors in canvas, charts, or SSR output.
```

`themeVariables(tokens)` returns the CSS custom properties used by the DOM adapter:
`--huet-background`, `--huet-foreground`, `--huet-muted`, `--huet-border`, and `--huet-{red,yellow,green,blue,purple}`. Read these with `getComputedStyle()` if a chart needs the currently inherited values. Directly editing these variables does not rerun the solver; use `update()` to change a theme.

For SSR you can serialize `themeVariables()` into inline styles, including nested surfaces computed with `theme.surface()`. The DOM adapter itself runs only in a browser. See [framework integration examples](docs/frameworks.md).

## Design choices and limits

- **Measured contrast, perceptual ramps.** OKLab controls interpolation; sRGB relative luminance controls contrast. Gamut mapping reduces chroma while retaining OKLCH hue/lightness.
- **Deliberate low contrast stays deliberate.** Neutral colors stay on your endpoint ramp. Unattainable targets use the best available candidate, rather than silently substituting black/white. Named colors use the endpoint lightness range and reduce their target for narrow themes.
- **Mid-gray has physical limits.** At some backgrounds neither endpoint can reach 7:1. With black/white endpoints, ordinary text reaches at least 4.5:1 across the entire sRGB gray range. Colored text may become almost white/black near the crossover; you cannot simultaneously insist on saturated text and 4.5:1 everywhere. Colored fills aim for 3:1, with their foreground checked independently.
- **Small DOM adapter, no context provider.** CSS inherits tokens. JavaScript visits surface boundaries, caches colors, and resolves relative nesting. It does not inspect every text node, subscribe React components, or replace nodes. Theme changes still cause browser style/paint work; this is not a zero-cost update.
- **Opaque surfaces only.** Arbitrary CSS backgrounds, gradients, opacity, background images, and alpha compositing are not tracked. Do not layer those onto managed surfaces and expect guarantees.
- **DOM boundaries are explicit.** Portals and shadow roots need independent mounts; overlapping theme roots are rejected. Responsive/hover surface classes and custom hue names are deferred.
- **First-pass compatibility.** The old React API is retained, with its neutral midpoint algorithm corrected. Signal ramps now share one light/dark direction per background and solve against measured contrast. Direct ramps keep their old behavior. The new core is a separate opt-in entry point, not a complete migration of every old demo.

Read the [implementation notes and screenshot evidence](docs/first-pass.md) for assumptions, verification, and remaining tradeoffs.

## Checks

```sh
npm run typecheck
npm test
npx playwright install chromium
npm run test:browser
npm run build:lib
npm run build
```

The original demo retains its existing Tachyons minification and React icon deprecation warnings. The new lab is independent of those packages.
