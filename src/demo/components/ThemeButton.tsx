import { useLayoutEffect, useRef } from "react";
import { mountTheme } from "huet";
import { mountImages, mountSvgs } from "huet/images";
import { mountFonts } from "huet-emoji";
import { EmbeddedThemeConfigurator } from "huet-react";
import { setDemoTheme, themeApplied, themeName, useDemoTheme } from "./themeStore";
import twemojiPalette from "../assets/fonts/twemoji-demo.palette.json";

/**
 * Themes `#page` and recolors its `img[data-huet-recolor]`,
 * `svg[data-huet-recolor]` and text set in Twemoji with the demo's theme.
 * Image strength 0 means image theming is off, so the originals show;
 * `mountSvgs` handles SVG strength 0.
 */
function usePageTheme() {
  const { theme, background, themes } = useDemoTheme();
  const colors = useRef<ReturnType<typeof mountTheme>>(undefined);
  const images = useRef<ReturnType<typeof mountImages>>(undefined);
  const svgs = useRef<ReturnType<typeof mountSvgs>>(undefined);
  const fonts = useRef<ReturnType<typeof mountFonts>>(undefined);
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
    // Only the Images page has text in the emoji font. A new palette lays out
    // the text that could use it again, so other pages go without one. The
    // palette was read ahead of time, so emoji never show unthemed.
    if (fonts.current) fonts.current.update(theme);
    else if (page.querySelector(".emoji-text"))
      fonts.current = mountFonts(page, theme, { fonts: [{ family: "Twemoji", colors: twemojiPalette }] });
    const name = themeName(theme);
    // Left alone while a theme is dragged, so the page's observers have nothing to look at
    for (const el of document.querySelectorAll("[data-theme-name]")) if (el.textContent !== name) el.textContent = name;
    themeApplied({ theme, background });
    // The theme's name can change with the list, as when it's saved or renamed
  }, [theme, background, themes]);
  useLayoutEffect(
    () => () => {
      colors.current?.destroy();
      images.current?.destroy();
      fonts.current?.destroy();
    },
    [],
  );
}

/**
 * The embedded theme configurator, at the right end of the header. It themes
 * the page with whatever the configurator picks, including the page's
 * background from its Edit Theme tab.
 */
export default function ThemeButton() {
  const { theme, background, themes } = useDemoTheme();
  usePageTheme();
  return (
    <div className="ml-auto px-2 py-1 text-sm">
      <EmbeddedThemeConfigurator
        mode="outlined"
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
