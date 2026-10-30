import { ThemeConfigurator } from "huet-react";
import type { ThemeConfig } from "huet/config";
import { publishTheme } from "./themeStore";

function onChange(config: ThemeConfig) {
  for (const el of document.querySelectorAll("[data-theme-name]"))
    el.textContent = config.name ?? "Untitled";
  publishTheme(config);
}

/** Themes the page's `#page` root. */
export default function Configurator() {
  return <ThemeConfigurator target="#page" onChange={onChange} />;
}
