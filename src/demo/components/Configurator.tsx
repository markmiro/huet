import ThemeConfigurator from "../../ThemeConfigurator";
import type { ThemeConfig } from "../../colorModel";
import { publishTheme } from "./themeStore";

function onThemeChange(config: ThemeConfig) {
  for (const el of document.querySelectorAll("[data-theme-name]"))
    el.textContent = config.name ?? "Untitled";
  publishTheme(config);
}

/** Themes the page's `#page` root. */
export default function Configurator() {
  return <ThemeConfigurator target="#page" onThemeChange={onThemeChange} />;
}
