import { useSyncExternalStore } from "react";
import type { ThemeConfig } from "huet/config";

// Astro islands and page scripts share this module.
let current: ThemeConfig | null = null;
const listeners = new Set<() => void>();

export function publishTheme(config: ThemeConfig) {
  current = config;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Calls `listener` with the configurator's theme now (if loaded) and after every change. */
export function subscribeTheme(listener: (config: ThemeConfig) => void) {
  if (current) listener(current);
  return subscribe(() => listener(current!));
}

/** The configurator's current theme, or null until it has loaded. */
export function useThemeConfig() {
  return useSyncExternalStore(subscribe, () => current, () => null);
}
