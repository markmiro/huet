# huet-react

A floating theme editor for [Huet](https://www.npmjs.com/package/huet) themes, for React apps. Pick from preset themes, edit the palette, ramps, and background, and import or export themes as JSON. The theme is applied to your page through Huet classes as you edit.

[Try it in the demo](https://markmiro.github.io/huet/) (bottom-right corner).

## Install

```sh
pnpm add huet huet-react   # or: npm install huet huet-react
```

`huet` is a peer dependency, so your app and the configurator share one copy. React 18 or later is required.

## Use

Theme an element and let the configurator remember the theme in localStorage:

```tsx
import { ThemeConfigurator } from "huet-react";
import "huet/styles.css"; // styles for the huet-* classes on your page

export function App() {
  return (
    <>
      <main id="app" className="huet-bg-5">
        <p className="huet-text-60">Secondary text</p>
        <button className="huet-bg-blue-25">Save</button>
      </main>
      <ThemeConfigurator target="#app" />
    </>
  );
}
```

Or control the theme yourself, for example to store it on the server or to theme images as well:

```tsx
import { useState } from "react";
import { mountTheme } from "huet";
import { mountImages } from "huet/images";
import { baseThemeConfig, themeFromConfig, type ThemeConfig } from "huet/config";
import { ThemeConfigurator } from "huet-react";

const root = document.querySelector<HTMLElement>("#app")!;
const initial = themeFromConfig(baseThemeConfig);
const colors = mountTheme(root, initial);
const images = mountImages(root, initial); // recolors <img data-huet-recolor>

export function ThemeEditor() {
  const [config, setConfig] = useState<ThemeConfig>(baseThemeConfig);
  return (
    <ThemeConfigurator
      value={config}
      onChange={(next) => {
        setConfig(next);
        const theme = themeFromConfig(next);
        colors.update(theme);
        images.update(theme);
      }}
    />
  );
}
```

## Props

| Prop | Type | Effect |
| --- | --- | --- |
| `target` | `HTMLElement \| string` | An element or selector to theme through Huet classes. It can't be `body` or `html`, because the panel itself lives in `body`. Leave it out to apply the theme yourself in `onChange`. |
| `value` | `ThemeConfig` | The theme, for a controlled configurator. Edits call `onChange` instead of being saved. |
| `defaultValue` | `ThemeConfig` | The starting theme when uncontrolled. Defaults to Huet's base theme. Edits are saved in localStorage and restored on reload. |
| `onChange` | `(config: ThemeConfig) => void` | Called with the edited theme. When uncontrolled, it is also called once on mount with the restored theme. |

`ThemeConfig` is the format the configurator edits and exports. `themeFromConfig` from `huet/config` turns it into a theme for `mountTheme` and `mountImages`.

## Embedded theme picker

`EmbeddedThemeConfigurator` is a compact theme picker you place anywhere in your layout, such as a toolbar. Its button shows a mini map of the current theme: the theme's colors as dots, from highest to lowest contrast, over a pill of its gray ramp. Clicking it opens a popover of saved themes.

```tsx
import { EmbeddedThemeConfigurator } from "huet-react";

<EmbeddedThemeConfigurator target="#app" mode="contrast" />;
```

It takes the same `target`, `value`, `defaultValue`, and `onChange` props as `ThemeConfigurator`, plus:

| Prop | Type | Effect |
| --- | --- | --- |
| `mode` | `"contrast" \| "outlined" \| "blended"` | `contrast` (default) inverts the button, so it's dark on light themes and light on dark ones. `outlined` gives it a full-contrast border. `blended` has no border until it's open. |
| `side`, `align` | Radix Popover placement | Where the popover opens. Defaults to below, aligned to the end. |
| `style` | `CSSProperties` | Inline styles for the wrapper, such as margins. Use this rather than a class: the wrapper resets its styles (see [Styling](#styling)), which overrides layered utilities such as Tailwind's. |

Uncontrolled pickers and configurators on one page share the saved theme, so they stay in sync. Give only one of them a `target`.

## Styling

The panel renders into its own `<div data-huet-configurator>` on `document.body` and injects its own scoped, `hc:`-prefixed styles, so it needs no CSS import and works next to your own Tailwind (layered or prefixed differently). Your page's element selectors don't reach it, though more specific selectors such as `#app button` still can. It renders nothing where you place it, so put it anywhere in your tree.

The configurator only runs in the browser. With server rendering, render it on the client only (for example as an Astro `client:only="react"` island or a Next.js `dynamic(..., { ssr: false })` import).

## License

MIT
