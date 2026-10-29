import { useSyncExternalStore } from "react";
import type { ThemeConfig } from "../../colorModel";

// Astro islands are separate React roots that share this module.
let current: ThemeConfig | null = null;
const listeners = new Set<() => void>();

export function publishTheme(config: ThemeConfig) {
  current = config;
  for (const listener of listeners) listener();
}

/** The configurator's current theme, or null until it has loaded. */
export function useThemeConfig() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => current,
    () => null,
  );
}
