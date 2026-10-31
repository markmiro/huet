import { useLayoutEffect, useRef, useState } from "react";
import { mountTheme } from "huet";
import { mountImages, mountSvgs } from "huet/images";
import {
  EmbeddedThemeConfigurator,
  type EmbeddedThemeConfiguratorMode,
} from "huet-react";
import { setDemoTheme, themeApplied, themeName, useDemoTheme } from "./themeStore";

const modes: EmbeddedThemeConfiguratorMode[] = ["contrast", "outlined", "blended"];
const backgrounds = [0, 0.25, 0.75, 1];
const storageKey = "huet-demo:themeButton";

function savedMode(): EmbeddedThemeConfiguratorMode {
  const saved = localStorage.getItem(storageKey);
  return modes.find((mode) => mode === saved) ?? "contrast";
}

const selectClass = "huet-bg-0 huet-border-30 rounded border px-1 py-0.5";

/**
 * Themes `#page` and recolors its `img[data-huet-recolor]` and
 * `svg[data-huet-recolor]` with the demo's theme. Image strength 0 means image
 * theming is off, so the originals show; `mountSvgs` handles SVG strength 0.
 */
function usePageTheme() {
  const { theme, background, themes } = useDemoTheme();
  const colors = useRef<ReturnType<typeof mountTheme>>(undefined);
  const images = useRef<ReturnType<typeof mountImages>>(undefined);
  const svgs = useRef<ReturnType<typeof mountSvgs>>(undefined);
  useLayoutEffect(() => {
    const page = document.getElementById("page")!;
    if (colors.current) colors.current.update(theme, { background });
    else colors.current = mountTheme(page, theme, { background });
    if (theme.images?.strength === 0) {
      images.current?.destroy();
      images.current = undefined;
    } else if (images.current) images.current.update(theme);
    else images.current = mountImages(page, theme, { hoverOriginal: true });
    if (svgs.current) svgs.current.update(theme);
    else svgs.current = mountSvgs(page, theme);
    for (const el of document.querySelectorAll("[data-theme-name]")) el.textContent = themeName(theme);
    themeApplied({ theme, background });
    // The theme's name can change with the list, as when it's saved or renamed
  }, [theme, background, themes]);
  useLayoutEffect(
    () => () => {
      colors.current?.destroy();
      images.current?.destroy();
    },
    [],
  );
}

/**
 * The page's background, the embedded theme configurator, and a switch for
 * its button style. It themes the page with whatever the configurator picks.
 */
export default function ThemeButton() {
  const [mode, setMode] = useState(savedMode);
  const { theme, background, themes } = useDemoTheme();
  usePageTheme();
  return (
    <div className="flex items-center gap-2 px-2 py-1 text-sm">
      <label className="flex items-center gap-2">
        Background
        <select
          value={background}
          onChange={(event) => setDemoTheme({ background: Number(event.target.value) })}
          className={selectClass}
        >
          {backgrounds.map((value) => (
            <option key={value} value={value}>
              {value * 100}%
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        Theme button
        <select
          value={mode}
          onChange={(event) => {
            const next = event.target.value as EmbeddedThemeConfiguratorMode;
            localStorage.setItem(storageKey, next);
            setMode(next);
          }}
          className={selectClass}
        >
          {modes.map((option) => (
            <option key={option} value={option}>
              {option[0].toUpperCase() + option.slice(1)}
            </option>
          ))}
        </select>
      </label>
      <EmbeddedThemeConfigurator
        mode={mode}
        value={theme}
        onChange={(next) => setDemoTheme({ theme: next })}
        themes={themes}
        onThemesChange={(next) => setDemoTheme({ themes: next })}
        background={background}
        onBackgroundChange={(next) => setDemoTheme({ background: next })}
      />
    </div>
  );
}
