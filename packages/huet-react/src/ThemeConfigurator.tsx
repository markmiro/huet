import React, { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { mountTheme } from "huet";
import { mountImages } from "huet/images";
import {
  baseThemeConfig,
  parseThemeConfig,
  Theme,
  type ThemeConfig,
} from "huet/config";

import { ThemeConfiguratorContext } from "./context";
import Themer from "./Themer";
import ErrorBoundary from "./private/ErrorBoundary";
import usePersistentState from "./private/persistentState";
import imageSettings from "./private/imageSettings";
import themeFor from "./private/themeFor";

type Target = string | HTMLElement;

export interface ThemeConfiguratorProps {
  /**
   * An element or selector to theme through Huet classes such as
   * `huet-bg-10`. Leave it out to apply the theme yourself, for example with
   * `mountTheme(root, themeFromConfig(config))` in `onChange`.
   */
  target?: Target;
  /** The theme, for a controlled configurator. Edits call `onChange`. */
  value?: ThemeConfig;
  /**
   * The starting theme when uncontrolled. The configurator saves edits in
   * localStorage and restores them on reload.
   */
  defaultValue?: ThemeConfig;
  /**
   * Called with the edited theme. When uncontrolled, it is also called once on
   * mount with the restored theme.
   */
  onChange?: (config: ThemeConfig) => void;
}

function resolve(target: Target) {
  const el =
    typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (!el) throw new Error(`Huet: no element matches ${String(target)}`);
  return el;
}

/** Applies the configured theme to `target` with Huet's class-based styles. */
function useThemeTarget(target: Target | undefined, config: ThemeConfig) {
  const theme = useMemo(() => themeFor(config), [config]);
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
  const settings = imageSettings(config);
  const latestSettings = useRef(settings);
  latestSettings.current = settings;
  const images = useRef<ReturnType<typeof mountImages>>(undefined);
  useLayoutEffect(() => {
    if (!target || !settings.enabled) return;
    images.current = mountImages(resolve(target), latest.current, {
      ...latestSettings.current, hoverOriginal: true,
    });
    return () => {
      images.current?.destroy();
      images.current = undefined;
    };
  }, [target, settings.enabled]);
  useLayoutEffect(() => {
    images.current?.update(theme, latestSettings.current);
  }, [theme, settings.tint, settings.strength]);
}

type WithChildren = { children?: React.ReactNode };

function Panel({
  target,
  config,
  setConfig,
  children,
}: WithChildren & {
  target?: Target;
  config: ThemeConfig;
  setConfig: React.Dispatch<React.SetStateAction<ThemeConfig>>;
}) {
  const theme = useMemo(() => new Theme(config), [config]);
  useThemeTarget(target, config);
  return (
    <ThemeConfiguratorContext.Provider value={[theme, setConfig]}>
      {children}
    </ThemeConfiguratorContext.Provider>
  );
}

function Controlled({
  value,
  onChange,
  target,
  children,
}: Required<Pick<ThemeConfiguratorProps, "value">> &
  ThemeConfiguratorProps &
  WithChildren) {
  const latest = useRef(value);
  latest.current = value;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const setConfig = useCallback<React.Dispatch<React.SetStateAction<ThemeConfig>>>(
    (action) => {
      const next = typeof action === "function" ? action(latest.current) : action;
      if (next !== latest.current) onChangeRef.current?.(next);
    },
    [],
  );
  return (
    <Panel target={target} config={value} setConfig={setConfig}>
      {children}
    </Panel>
  );
}

function Uncontrolled({
  defaultValue = baseThemeConfig,
  onChange,
  target,
  children,
}: ThemeConfiguratorProps & WithChildren) {
  const [config, setConfig] = usePersistentState("theme", defaultValue, parseThemeConfig);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  useLayoutEffect(() => onChangeRef.current?.(config), [config]);
  return (
    <Panel target={target} config={config} setConfig={setConfig}>
      {children}
    </Panel>
  );
}

/**
 * Holds the edited theme, controlled or saved in localStorage, applies it to
 * `target`, and shares it with `children` through ThemeConfiguratorContext.
 */
export function ConfiguratorRoot({
  componentName,
  children,
  ...props
}: ThemeConfiguratorProps & WithChildren & { componentName: string }) {
  return (
    <ErrorBoundary componentName={componentName}>
      {props.value ? (
        <Controlled {...props} value={props.value}>
          {children}
        </Controlled>
      ) : (
        <Uncontrolled {...props}>{children}</Uncontrolled>
      )}
    </ErrorBoundary>
  );
}

/**
 * A floating theme editor, fixed to the bottom-right corner of the viewport.
 * It renders into its own container on `document.body` with its own scoped
 * styles, so it needs no CSS import.
 */
export default function ThemeConfigurator(props: ThemeConfiguratorProps) {
  return (
    <ConfiguratorRoot componentName="Theme Configurator" {...props}>
      <Themer />
    </ConfiguratorRoot>
  );
}
