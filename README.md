<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/logo/huet-logo-dark.svg" />
    <img src="docs/logo/huet-logo.svg" alt="Huet logo" width="96" height="96" />
  </picture>
</p>

# Huet

Relative UI colors and themed images from one theme. Choose a theme, then give each element a ramp and a contrast amount in its class name, such as `huet-bg-blue-25`. Huet works out the actual colors from the element's parent background, and recolors images to match.

[Demo](https://markmiro.github.io/huet/)

| Package | What it is |
| --- | --- |
| [`huet`](packages/huet) | The theming library, for any framework: `createTheme`, `mountTheme`, Huet classes, Tailwind v4 bridge, themed images (`huet/images`) and form controls (`huet/forms.css`) |
| [`huet-react`](packages/huet-react) | `<ThemeConfigurator>`, a floating React panel for picking and editing themes |

## Quick start

```sh
pnpm add huet               # theming, any framework
pnpm add huet-react         # optional: the React theme configurator
```

Until they are on npm, every push to `master` builds both packages and commits them to the [`dist`](https://github.com/markmiro/huet/tree/dist) and [`dist-react`](https://github.com/markmiro/huet/tree/dist-react) branches, so you can install them from GitHub without building anything:

```sh
pnpm add github:markmiro/huet#dist
pnpm add github:markmiro/huet#dist-react    # optional
# or: npm install …, bun add …
```

Your lockfile pins the exact commit; each commit message names the `master` commit it was built from. Run `pnpm update huet huet-react` (or your package manager's equivalent) to pick up newer builds.

```ts
import { createTheme, mountTheme } from "huet";
import { mountImages } from "huet/images";
import "huet/styles.css";

const theme = createTheme({ dark: "#233b91", light: "#ffffff", background: 1 });
const root = document.querySelector<HTMLElement>("#app")!;
const colors = mountTheme(root, theme);
const images = mountImages(root, theme); // recolors <img data-huet-recolor>

// Later: switch themes without rerendering
const paper = createTheme({ dark: "#302723", light: "#f1e4cd" });
colors.update(paper);
images.update(paper);
```

```html
<div id="app">
  <section class="huet-bg-20">
    <p class="huet-text-60">Manage your profile.</p>
    <button class="huet-bg-blue-25">Save changes</button>
    <img data-huet-recolor src="/photo.jpg" alt="" />
  </section>
</div>
```

```tsx
import { ThemeConfigurator } from "huet-react";

<ThemeConfigurator target="#app" />;
```

The [`huet` README](packages/huet/README.md) covers class syntax, Tailwind, multi-hue ramps and themed images. The [`huet-react` README](packages/huet-react/README.md) covers the configurator's props, including a controlled `value`/`onChange` mode. Lifecycle examples for React, Vue, Svelte and Astro are in [framework integration](docs/frameworks.md).

## Repository layout

| Path | Contents |
| --- | --- |
| `packages/huet` | The `huet` package |
| `packages/huet-react` | The `huet-react` package |
| `src/demo` | The demo site, built with Astro, Tailwind and Huet classes. It imports the packages like an app would. |
| `tests` | Browser tests (Playwright) against the demo site |
| `docs` | Design notes and screenshots |

In the workspace, each package's `exports` point at its TypeScript source, so the demo and tests run without a build. `publishConfig` swaps in the built `dist/` files when a package is packed or published.

## Development and checks

```sh
pnpm install
pnpm dev                     # demo site
pnpm typecheck
pnpm test                    # unit tests for both packages
pnpm exec playwright install chromium
pnpm test:browser
pnpm build:packages          # builds packages/*/dist
pnpm build                   # builds the demo site into dist-demo
```

## Publishing

Both packages are versioned together. Use pnpm, which applies `publishConfig` and replaces `workspace:^` with the real version.

```sh
pnpm login
# Bump "version" in packages/huet/package.json and packages/huet-react/package.json
pnpm -r publish --dry-run    # builds each package and lists its files
pnpm -r publish              # pnpm asks for your 2FA code
```

## License

MIT
