# Framework-independent Huet: first pass

## Assumptions made

1. “49% / 51%” means the old LAB ramp position around its midpoint. I reproduced those exact backgrounds (`#747474`, `#797979`) and also tested OKLab 49/51% and sRGB 49/51% so the fix is not tied to that interpretation.
2. Readability takes priority over exact color choice. Text roles use contrast ratios; numeric surface requests use OKLab interpolation and may move to a nearby readable point. Explicit root backgrounds are respected.
3. Endpoints are intentional constraints. A narrow range can remain low contrast. The solver does not escape a blue/white or muted ramp by secretly adding black.
4. Preserve the existing React API while introducing `huet/core` as an independent opt-in entry point. This makes the first pass reviewable without rewriting every old example.
5. Use typed JavaScript configuration as a single source of truth and emit CSS variables for all frameworks, CSS/Tailwind, and canvas/chart consumers. A CSS configuration parser is deferred.
6. Start with five named signal hues, seven surface steps, opaque hex colors, no alpha, and no framework adapters. Custom anchors are supported; arbitrary new hue names and generated build-time configuration are deferred.
7. Use `huet-*` classes to avoid collisions with Tailwind's `h-*` height utilities. Keep the vocabulary finite and export its type/manifest plus a small literal-token checker.
8. Use a small DOM adapter for relative surface inheritance. CSS handles inherited tokens and ordinary text; JavaScript handles surface boundaries and theme changes. This is a pragmatic first pass, not a claim that a future CSS-only design is impossible.

## What was wrong

The legacy neutral algorithm used a LAB midpoint to choose direction, then rescaled the requested lightness distance according to the background's position. This is not the same as measuring contrast between the actual rendered sRGB colors. At the midpoint, secondary labels and borders could have very little contrast even with a black-to-white ramp.

The corrected legacy neutral path samples the existing ramp and measures its final sRGB luminance. Its familiar amounts now have useful anchors: 25 → 3:1, 50 → 4.5:1, 100 → strongest endpoint. Unattainable requests use the best ramp sample. The subsequent semantic correction also updates signal ramps; direct ramp logic is retained. Samples/luminances are cached per ramp, so each color does not repeat gamut conversion work.

| Legacy gray background | Secondary before | Secondary after | Border before | Border after |
| ---------------------- | ---------------: | --------------: | ------------: | -----------: |
| 49%, `#747474`         |           2.33:1 |          4.56:1 |        1.56:1 |       3.00:1 |
| 51%, `#797979`         |           2.53:1 |          4.52:1 |        1.58:1 |       3.02:1 |

These values measure `Color.contrast(50)` and `Color.contrast(25)` against the original background, not an accessibility audit of every legacy component. Raw values are in [measurements.json](screenshots/measurements.json).

## Screenshots

The before images came from the original committed implementation at `c77e701ba5261a0d95ab80332eee078cc9602235`, in an isolated temporary checkout. Before/after use the same 1280×800 viewport and scroll the original page to “Form.” The new lab uses a 1280px desktop viewport and a 390px mobile viewport.

The collaborative browser saved the initial evidence, then its screenshot operation repeatedly timed out. The final sharp captures and browser assertions use isolated Playwright Chromium, without the user's browser color overrides.

- [49% before](screenshots/legacy-49-before.png) / [49% after](screenshots/legacy-49-after.png)
- [51% before](screenshots/legacy-51-before.png) / [51% after](screenshots/legacy-51-after.png)
- New implementation: [49%](screenshots/lab-gray49.png), [51%](screenshots/lab-gray51.png), [white and blue](screenshots/lab-blue.png), [light](screenshots/lab-light.png), [dark](screenshots/lab-dark.png), [paper](screenshots/lab-paper.png), [low contrast](screenshots/lab-soft.png)
- [Keyboard focus](screenshots/lab-focus.png) / [mobile with a dynamically inserted surface](screenshots/lab-mobile.png)

Regenerate the current implementation's evidence with:

```sh
HUET_SCREENSHOTS=docs/screenshots npm run test:browser
```

Ordinary browser-test runs write to ignored `test-results/screenshots` instead.

## Semantic direction correction

The first pass solved each semantic hue independently. Because each ramp reaches a given contrast at different positions, this could put some hues above and others below the same background. Both semantic text and fills now use a single polarity derived from the contrast of that background against the configured endpoints. Ties choose dark. Every hue is restricted to that side, including fallback candidates; degenerate ranges can return the background rather than reverse direction. The group can still flip as the slider crosses the shared threshold.

The initial shared-polarity correction still forced legacy semantic text toward 4.5:1 and ignored the signal-lightness controls. The subsequent [Color Contrast investigation](color-contrast.md) replaces that legacy signal solver with relative OKLab interpolation, restores both controls, and scales saturation with strength. This deliberately trades the legacy semantic ratio guarantee for visible hue near middle gray. The standalone core retains its earlier contrast-target policy; that is a separate policy choice from this focused legacy-demo correction.

No backgrounds, padding, or other UI changes were retained as a workaround; the original form markup is unchanged.

Regression coverage includes 1,001 background positions for five core palettes, 101 positions for normal/inverted legacy ramps, and live browser slider sweeps. Updated alert screenshots show all five rows: [49%](screenshots/legacy-alerts-49.png) and [51%](screenshots/legacy-alerts-51.png).

## New engine

The core uses OKLab for interpolation and OKLCH hue-preserving chroma reduction to fit sRGB. Contrast is measured after rounding to the actual emitted opaque hex value. Text targets 7:1 (primary) and 4.5:1 (secondary/signals); borders target 3:1 against both adjacent surfaces. A candidate that cannot reach a target falls back to the best available contrast within the permitted ramp.

A branded ramp can have an unreadable middle even if its two endpoints contrast well with each other. For example, a blue endpoint may be too light for dark text on a medium-blue fill, while white is also insufficient. Generated numeric surfaces are nudged to the nearest readable position on their original path; colored fills are filtered for readable foregrounds before selecting their contrast against the parent. This intentionally sacrifices some continuous surface freedom. Explicit root backgrounds and zero-change surfaces are not moved. Narrow ramps remain intentionally low contrast.

Colored text close to mid-gray may become very pale/dark; saturated colored fills and readable foregrounds are solved separately. That distinction avoids forcing every blue button to look nearly white just to achieve text contrast against the page itself.

No React import is reachable from `huet/core`. Theme changes set variables only on the root and managed surfaces. The DOM adapter does not replace content, rerender framework components, or listen to its own style writes. It handles insertion, removal, class changes, reparenting, ownership transfer between independent roots, and cleanup. Tokens/surfaces have bounded per-theme caches.

The packed core was approximately 3 KB gzipped during this pass, plus a small stylesheet. The package archive still contains the legacy React implementation and its source maps; the tiny core entry point is not the size of the entire archive.

## Verification

- TypeScript check, library build (ESM/CJS and declarations), and both Vite demo builds pass.
- 31 unit/integration tests: sRGB/OKLab conversion references, all 256 sRGB grays, 49/51% interpretations, narrowed/identical endpoints, hue retention, readable branded surfaces, DOM lifecycle/SSR adoption, cleanup/ownership transfer, static vocabulary, and real Tailwind v4 compilation.
- Six Chromium browser tests: measured rendered control/text colors across six full-range presets; intentionally low-contrast theme rendering; keyboard focus; mobile overflow; input preservation; dynamic nested surfaces; original React screenshots; a large-tree update; and a full background-slider sweep checking semantic text and fill polarity.
- A packed tarball installed into a fresh Vite app without installing React. ESM and CommonJS imports both worked; CSS exports built; the CLI accepted valid classes and rejected a misspelling with exit status 1.
- Separate temporary consumer builds and browser smoke checks covered React 19.3.1, Vue 3.5.44, Svelte 5.57.2, and Astro 7.4.2. All mounted, nested, rethemed, and retained edited input values. React's render counter stayed at one. These were integration smoke checks, not exhaustive framework/version matrices; the checked-in reproducible suites cover the core and standalone browser demo.
- A local Chromium run updated 1,000 surfaces containing 10,000 ordinary text elements in about 7 ms of synchronous JavaScript. This excludes deferred browser layout/paint and is an observation, not a performance guarantee. The benchmark checks node identity and content preservation.

The existing Tachyons `*zoom` minification warning and React icon `defaultProps` warnings remain confined to the old demo. Chromium was tested here; Safari and Firefox visual verification remain future work.

## Why not only CSS?

Modern CSS provides useful pieces. `color-mix()` can interpolate perceptually and custom properties inherit through ordinary DOM trees. But interpolation alone does not select readable colors along a branded ramp, preserve signal hues, or resolve all the parent-relative surface behavior in this API.

The currently documented `contrast-color()` chooses black or white. That is useful, but it does not implement constrained blue/white endpoints or named signal ramps. The first pass keeps the algorithm in a small browser/server-compatible core and uses CSS for the resulting values. The choice avoids introducing an experimental CSS-only nesting protocol before its behavior is verified across browsers.

Sources consulted: [Tailwind theme namespaces and inline variables](https://tailwindcss.com/docs/theme), [Tailwind custom utilities](https://tailwindcss.com/docs/adding-custom-styles), [MDN contrast-color()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/contrast-color), [CSS custom property inheritance](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties), and [Ottosson's OKLab derivation/conversion matrices](https://bottosson.github.io/posts/oklab/).
