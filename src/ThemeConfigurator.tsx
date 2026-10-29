import React, { useContext, useLayoutEffect, useMemo, useRef } from "react";

import { ThemeConfiguratorContext } from "./Body";
import type { ThemeConfig } from "./colorModel";
import { mountTheme } from "./core/dom";
import { themeFromConfig } from "./core/fromConfig";
import Theme from "./Theme";
import Themer from "./Themer";
import ErrorBoundary from "./private/ErrorBoundary";
import baseThemeConfig from "./private/baseThemeConfig";
import { parseThemeConfig } from "./private/isThemeConfig";
import usePersistentState from "./private/persistentState";

type Target = string | HTMLElement;
type OnThemeChange = (config: ThemeConfig) => void;

function resolve(target: Target) {
  const el =
    typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (!el) throw new Error(`Huet: no element matches ${String(target)}`);
  return el;
}

/** Applies the configured theme to `target` with Huet's class-based styles. */
function useThemeTarget(
  target: Target | undefined,
  config: ThemeConfig,
  onThemeChange?: OnThemeChange,
) {
  const theme = useMemo(() => themeFromConfig(config), [config]);
  const latest = useRef(theme);
  latest.current = theme;
  const mount = useRef<ReturnType<typeof mountTheme>>(undefined);
  // Remount only when the target changes. Theme changes go through update().
  useLayoutEffect(() => {
    if (!target) return;
    const current = mountTheme(resolve(target), latest.current);
    mount.current = current;
    return () => {
      current.destroy();
      mount.current = undefined;
    };
  }, [target]);
  useLayoutEffect(() => mount.current?.update(theme), [theme]);
  const onChange = useRef(onThemeChange);
  onChange.current = onThemeChange;
  useLayoutEffect(() => onChange.current?.(config), [config]);
}

function Standalone({
  target,
  initialThemeConfig,
  onThemeChange,
}: {
  target?: Target;
  initialThemeConfig: ThemeConfig;
  onThemeChange?: OnThemeChange;
}) {
  const [config, setConfig] = usePersistentState(
    "theme",
    initialThemeConfig,
    parseThemeConfig,
  );
  const theme = useMemo(() => new Theme(config), [config]);
  useThemeTarget(target, config, onThemeChange);
  return (
    <ThemeConfiguratorContext.Provider value={[theme, setConfig]}>
      <Themer />
    </ThemeConfiguratorContext.Provider>
  );
}

function Nested({
  target,
  onThemeChange,
}: {
  target?: Target;
  onThemeChange?: OnThemeChange;
}) {
  const [theme] = useContext(ThemeConfiguratorContext)!;
  useThemeTarget(target, theme.config, onThemeChange);
  return <Themer />;
}

/**
 * The theme editor panel. Inside `<Body>`, it edits Body's theme. Elsewhere it
 * keeps its own saved theme. Either way, `target` (an element or selector)
 * gets the theme through Huet classes such as `huet-bg-10`. `onThemeChange`
 * receives the config on mount and after every edit.
 */
export default function ThemeConfigurator({
  target,
  initialThemeConfig = baseThemeConfig,
  onThemeChange,
}: {
  target?: Target;
  initialThemeConfig?: ThemeConfig;
  onThemeChange?: OnThemeChange;
}) {
  const isInsideBody = useContext(ThemeConfiguratorContext) !== null;
  return (
    <ErrorBoundary componentName="Theme Configurator">
      {isInsideBody ? (
        <Nested target={target} onThemeChange={onThemeChange} />
      ) : (
        <Standalone
          target={target}
          initialThemeConfig={initialThemeConfig}
          onThemeChange={onThemeChange}
        />
      )}
    </ErrorBoundary>
  );
}
