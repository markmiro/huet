import { useSyncExternalStore } from "react";
import { checkTheme, themes, type Theme } from "huet";

/*
  The demo's theme and background. Huet leaves storing them to the page, so
  this module does it: Astro islands and page scripts share it, and it saves
  both in localStorage.
*/

export interface DemoTheme {
  theme: Theme;
  /** Where the page background sits on the theme's neutral ramp: 0 dark, 1 light. */
  background: number;
  /** The themes to pick from, by name, including any saved in the configurator. */
  themes: Record<string, Theme>;
}

const storageKey = "huet-demo:theme";
const fallback: DemoTheme = { theme: themes.Base, background: 1, themes };

function load(): DemoTheme {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return fallback;
  try {
    const { theme, background, themes: list = themes } = JSON.parse(saved);
    checkTheme(theme);
    for (const listed of Object.values(list)) checkTheme(listed);
    if (!(background >= 0 && background <= 1)) throw new RangeError(`background is ${background}`);
    return { theme, background, themes: list };
  } catch (error) {
    // A theme saved by an older demo, or edited by hand
    console.error("Huet demo: the saved theme is invalid, so it was reset.", error);
    localStorage.removeItem(storageKey);
    return fallback;
  }
}

let current: DemoTheme | null = null;
const listeners = new Set<() => void>();

function get() {
  return (current ??= load());
}

export function setDemoTheme(changes: Partial<DemoTheme>) {
  current = { ...get(), ...changes };
  localStorage.setItem(storageKey, JSON.stringify(current));
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// What Configurator.tsx has mounted on the page, which page scripts follow
type Applied = Pick<DemoTheme, "theme" | "background">;
let applied: Applied | null = null;
const appliedListeners = new Set<(state: Applied) => void>();

/** Called by Configurator.tsx once the page shows `state`. */
export function themeApplied(state: Applied) {
  applied = state;
  for (const listener of appliedListeners) listener(state);
}

/** Calls `listener` once the page is themed (now, if it is), and after every change. */
export function subscribeTheme(listener: (state: Applied) => void) {
  if (applied) listener(applied);
  appliedListeners.add(listener);
  return () => {
    appliedListeners.delete(listener);
  };
}

export function useDemoTheme() {
  return useSyncExternalStore(subscribe, get, () => fallback);
}

/** The listed theme a theme matches, or "Custom". */
export function themeName(theme: Theme) {
  const json = JSON.stringify(theme);
  return Object.entries(get().themes).find(([, listed]) => JSON.stringify(listed) === json)?.[0] ?? "Custom";
}
