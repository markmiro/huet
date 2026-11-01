import { isEqual } from "lodash-es";
import React, { useEffect, useMemo, useRef } from "react";
import { themes as presets, type Theme } from "huet";
import { resolveTheme } from "huet/internal";

import { ThemeConfiguratorContext } from "./context";
import Themer from "./Themer";
import ErrorBoundary from "./private/ErrorBoundary";
import usePersistentState, { asString } from "./private/persistentState";

export interface ThemeConfiguratorProps {
  /** The theme being edited. */
  value: Theme;
  /**
   * Called with every edit, and when a theme is picked from `themes`. Apply
   * the theme yourself, with `mountTheme`, `themeCss` or `recolorImage`.
   */
  onChange: (theme: Theme) => void;
  /** The themes to pick from, by name. Defaults to Huet's presets. */
  themes?: Readonly<Record<string, Theme>>;
  /**
   * Called with a new list when someone saves, renames, removes or imports a
   * theme. Leave it out for a fixed list.
   */
  onThemesChange?: (themes: Record<string, Theme>) => void;
  /**
   * Where your page's background sits on the theme's neutral ramp, from 0
   * (dark) to 1 (light). The configurator previews themes on it. It isn't
   * part of the theme, so a light/dark switch on your page sets it. Defaults to 1.
   */
  background?: number;
  /** Called when someone picks a background in the configurator. Leave it out to hide the picker. */
  onBackgroundChange?: (background: number) => void;
}

/** `base`, or `base 2`, `base 3`, … whichever isn't in `themes` yet. */
function freeName(themes: Readonly<Record<string, Theme>>, base: string) {
  let name = base;
  for (let i = 2; name in themes; i++) name = `${base} ${i}`;
  return name;
}

/** Shares the edited theme with `children` through ThemeConfiguratorContext. */
export function ConfiguratorRoot({
  value,
  onChange,
  themes = presets,
  onThemesChange,
  background = 1,
  onBackgroundChange,
  children,
}: ThemeConfiguratorProps & { children?: React.ReactNode }) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const callbacks = useRef({ onThemesChange, onBackgroundChange });
  callbacks.current = { onThemesChange, onBackgroundChange };
  const canEditList = onThemesChange !== undefined;
  const canSetBackground = onBackgroundChange !== undefined;
  const name = useMemo(
    () => Object.entries(themes).find(([, listed]) => isEqual(listed, value))?.[0],
    [themes, value],
  );
  // The last listed theme picked, so edits to it can be reset. It's saved with
  // the panel's state, so Reset still works after a reload.
  const [lastPicked, setLastPicked] = usePersistentState("themer:editedFrom", "", asString);
  useEffect(() => {
    if (name !== undefined) setLastPicked(name);
  }, [name, setLastPicked]);
  const editedFrom = name === undefined && lastPicked in themes ? lastPicked : undefined;
  const state = useMemo(
    () => ({
      theme: value,
      // Throws a descriptive error for an invalid theme, which the boundary shows
      resolved: resolveTheme(value, { background }),
      setTheme: (theme: Theme) => onChangeRef.current(theme),
      themes,
      background,
      name,
      editedFrom,
      reset: () => {
        if (editedFrom !== undefined) onChangeRef.current(themes[editedFrom]);
      },
      setBackground: canSetBackground
        ? (next: number) => callbacks.current.onBackgroundChange?.(next)
        : undefined,
      list: canEditList
        ? {
            saveAsNew: () => {
              const saved = freeName(themes, `${editedFrom ?? "Custom"} Copy`);
              callbacks.current.onThemesChange?.({ [saved]: value, ...themes });
              setLastPicked(saved);
            },
            create: () => {
              const created = freeName(themes, "New Theme");
              // First, so `name` finds it rather than the theme it copies
              callbacks.current.onThemesChange?.({ [created]: value, ...themes });
              setLastPicked(created);
            },
            update: (updated: string, theme: Theme) => {
              callbacks.current.onThemesChange?.({ ...themes, [updated]: theme });
              setLastPicked(updated);
            },
            remove: (removed: string) => {
              const { [removed]: _, ...rest } = themes;
              callbacks.current.onThemesChange?.(rest);
              // Removing the picked theme picks the first one left
              const [first] = Object.values(rest);
              if (removed === name && first) onChangeRef.current(first);
            },
            rename: (from: string, to: string) => {
              if (!to || to === from || to in themes) return;
              // Same order, new key
              callbacks.current.onThemesChange?.(
                Object.fromEntries(Object.entries(themes).map(([key, theme]) => [key === from ? to : key, theme])),
              );
              setLastPicked(to);
            },
            add: (added: string, theme: Theme) => {
              const saved = freeName(themes, added);
              callbacks.current.onThemesChange?.({ [saved]: theme, ...themes });
              onChangeRef.current(theme);
            },
          }
        : undefined,
    }),
    [value, themes, background, name, editedFrom, canEditList, canSetBackground, setLastPicked],
  );
  return (
    <ThemeConfiguratorContext.Provider value={state}>{children}</ThemeConfiguratorContext.Provider>
  );
}

/**
 * A floating theme editor, fixed to the bottom-right corner of the viewport.
 * It renders into its own container on `document.body` with its own scoped
 * styles, so it needs no CSS import.
 */
export default function ThemeConfigurator(props: ThemeConfiguratorProps) {
  return (
    <ErrorBoundary componentName="Theme Configurator">
      <ConfiguratorRoot {...props}>
        <Themer />
      </ConfiguratorRoot>
    </ErrorBoundary>
  );
}
