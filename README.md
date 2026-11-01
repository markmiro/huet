# huet-react

A floating theme editor for [Huet](https://www.npmjs.com/package/huet) themes, for React apps. Pick from preset themes, edit the base colors (the neutral ramp), hues, contrast, signal lightness and image settings, and import or export themes as JSON. Its controls are built on [Base UI](https://base-ui.com).

[Try it in the demo](https://markmiro.github.io/huet/) (the theme button in the header, or the panel in the bottom-right corner).

## Install

```sh
pnpm add huet huet-react   # or: npm install huet huet-react
```

`huet` is a peer dependency, so your app and the configurator share one copy. React 18 or later is required.

## Use

The configurator edits a Huet `Theme` and hands each edit to `onChange`. Your page applies it, with the same functions it uses without the configurator, and stores it wherever it likes:

```tsx
import { useLayoutEffect, useRef, useState } from "react";
import { mountTheme, themes, type Theme } from "huet";
import { mountImages } from "huet/images";
import { ThemeConfigurator } from "huet-react";
import "huet/styles.css"; // styles for the huet-* classes on your page

export function App() {
  const [theme, setTheme] = useState<Theme>(themes.Base);
  const [dark, setDark] = useState(false);
  const background = dark ? 0 : 1;

  const page = useRef<HTMLElement>(null);
  const mounts = useRef<{ colors: ReturnType<typeof mountTheme>; images: ReturnType<typeof mountImages> }>(undefined);
  useLayoutEffect(() => {
    if (!mounts.current) {
      mounts.current = {
        colors: mountTheme(page.current!, theme, { background }),
        images: mountImages(page.current!, theme), // recolors <img data-huet-recolor>
      };
    } else {
      mounts.current.colors.update(theme, { background });
      mounts.current.images.update(theme);
    }
  }, [theme, background]);

  return (
    <>
      <main ref={page} className="huet-bg-5">
        <p className="huet-text-60">Secondary text</p>
        <button className="huet-bg-blue-20" onClick={() => setDark(!dark)}>
          Dark mode
        </button>
      </main>
      <ThemeConfigurator
        value={theme}
        onChange={setTheme}
        background={background}
        onBackgroundChange={(next) => setDark(next < 0.5)}
      />
    </>
  );
}
```

To keep the theme across reloads, save it yourself and check it with `checkTheme` from `huet` when you load it.

## Props

| Prop | Type | Effect |
| --- | --- | --- |
| `value` | `Theme` | The theme being edited. |
| `onChange` | `(theme: Theme) => void` | Called with every edit, and when a theme is picked from `themes`. |
| `themes` | `Record<string, Theme>` | The themes to pick from, by name. Defaults to Huet's presets (`themes` from `huet`). A `value` that matches none of them is listed first as "Custom". |
| `onThemesChange` | `(themes: Record<string, Theme>) => void` | Called with a new list when someone saves an edited theme as new, renames, removes or imports one. Leave it out and the list is fixed: imports replace the current theme instead. |
| `background` | `number` | Where your page's background sits on the theme's neutral ramp, from 0 (dark) to 1 (light, the default). The configurator previews themes on it. It isn't part of the theme, so your page's light/dark switch sets it. |
| `onBackgroundChange` | `(background: number) => void` | Called when someone moves the editor's Background slider, which snaps to 0, 5, 10, 15, 20, 25, 49 and 51% and the same from the top (75–100%). Leave it out to hide the slider. |

The panel remembers only its own UI state (which tab is open, whether it's collapsed) in localStorage.

## Embedded theme configurator

`EmbeddedThemeConfigurator` is the configurator behind a compact button you place anywhere in your layout, such as a toolbar. The button shows a mini map of the current theme: the theme's colors as dots, from highest to lowest contrast, over a pill of its gray ramp. Clicking it opens the configurator in a popover with two tabs:

- **Themes**: `themes` as a simple list, each on your page's background. Import a theme, reset edits, and, with `onThemesChange`, save edits as a new theme or remove one.
- **Edit Theme**: the same editor as `ThemeConfigurator`.

```tsx
import { EmbeddedThemeConfigurator } from "huet-react";

<EmbeddedThemeConfigurator value={theme} onChange={setTheme} background={background} mode="contrast" />;
```

It takes the same props as `ThemeConfigurator`, plus:

| Prop | Type | Effect |
| --- | --- | --- |
| `mode` | `"contrast" \| "outlined" \| "blended"` | `contrast` (default) inverts the button, so it's dark on light themes and light on dark ones. `outlined` gives it a full-contrast border. `blended` has no border until it's open. |
| `side`, `align` | `"top" \| "right" \| "bottom" \| "left"`, `"start" \| "center" \| "end"` | Where the popover opens. Defaults to below, aligned to the end. |
| `style` | `CSSProperties` | Inline styles for the wrapper, such as margins. Use this rather than a class: the wrapper resets its styles (see [Styling](#styling)), which overrides layered utilities such as Tailwind's. |

Give a picker and a configurator the same `value` and `onChange`, and they stay in sync.

## Styling

The panel renders into its own `<div data-huet-configurator>` on `document.body` and injects its own scoped, `hc:`-prefixed styles, so it needs no CSS import and works next to your own Tailwind (layered or prefixed differently). Your page's element selectors don't reach it, though more specific selectors such as `#app button` still can. It renders nothing where you place it, so put it anywhere in your tree.

The configurator only runs in the browser. With server rendering, render it on the client only (for example as an Astro `client:only="react"` island or a Next.js `dynamic(..., { ssr: false })` import).

## License

MIT
