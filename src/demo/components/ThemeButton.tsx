import { useState } from "react";
import {
  EmbeddedThemeConfigurator,
  type EmbeddedThemeConfiguratorMode,
} from "huet-react";
import type { ThemeConfig } from "huet/config";
import { publishTheme } from "./themeStore";

const modes: EmbeddedThemeConfiguratorMode[] = ["contrast", "outlined", "blended"];
const storageKey = "huet-demo:themeButton";

function savedMode(): EmbeddedThemeConfiguratorMode {
  const saved = localStorage.getItem(storageKey);
  return modes.find((mode) => mode === saved) ?? "contrast";
}

function onChange(config: ThemeConfig) {
  for (const el of document.querySelectorAll("[data-theme-name]"))
    el.textContent = config.name ?? "Untitled";
  publishTheme(config);
}

/**
 * The embedded theme configurator, with a switch for its button style. It
 * themes the page's `#page` root.
 */
export default function ThemeButton() {
  const [mode, setMode] = useState(savedMode);
  return (
    <div className="flex items-center gap-2 px-2 py-1 text-sm">
      <label className="flex items-center gap-2">
        Theme button
        <select
          value={mode}
          onChange={(event) => {
            const next = event.target.value as EmbeddedThemeConfiguratorMode;
            localStorage.setItem(storageKey, next);
            setMode(next);
          }}
          className="huet-bg-0 huet-border-30 rounded border px-1 py-0.5"
        >
          {modes.map((option) => (
            <option key={option} value={option}>
              {option[0].toUpperCase() + option.slice(1)}
            </option>
          ))}
        </select>
      </label>
      <EmbeddedThemeConfigurator mode={mode} target="#page" onChange={onChange} />
    </div>
  );
}
