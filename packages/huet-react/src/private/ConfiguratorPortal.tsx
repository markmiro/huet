import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { ThemeConfig } from "huet/config";
import css from "../configurator.css?inline";
import { mountTheme } from "huet";
import { themeFromConfig } from "huet/config";

/** One shared stylesheet, so consumers don't import any CSS. */
export function injectStyles() {
  if (document.head.querySelector("style[data-huet-configurator-styles]")) return;
  const style = document.createElement("style");
  style.setAttribute("data-huet-configurator-styles", "");
  style.textContent = css;
  document.head.append(style);
}

/**
 * Renders the panel into its own `<div data-huet-configurator>` on
 * document.body. The scoped styles in configurator.css only apply there, and
 * the host's transforms or overflow can't break the panel's `position: fixed`.
 * The container is a Huet root, so `huet-*` classes inside it resolve against
 * `themeConfig`.
 */
export default function ConfiguratorPortal({
  themeConfig,
  children,
}: {
  themeConfig: ThemeConfig;
  children?: React.ReactNode;
}) {
  // Created in an effect rather than during render, so StrictMode's double
  // effects append and remove it in pairs. Children render once it's in the
  // page, so their layout effects (e.g. scrolling to the selected theme) work.
  const [container, setContainer] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => {
    injectStyles();
    const el = document.createElement("div");
    el.setAttribute("data-huet-configurator", "");
    document.body.append(el);
    setContainer(el);
    return () => el.remove();
  }, []);

  const theme = useMemo(() => themeFromConfig(themeConfig), [themeConfig]);
  const latest = useRef(theme);
  latest.current = theme;
  const mount = useRef<{ theme: typeof theme; update(next: typeof theme): void }>(
    undefined,
  );
  useLayoutEffect(() => {
    if (!container) return;
    const current = mountTheme(container, latest.current);
    mount.current = { theme: latest.current, update: current.update };
    return () => {
      current.destroy();
      mount.current = undefined;
    };
  }, [container]);
  useLayoutEffect(() => {
    const current = mount.current;
    if (!current || current.theme === theme) return;
    current.theme = theme;
    current.update(theme);
  }, [theme]);

  // Legacy `Color.alpha()` scales alpha by the theme's contrast multiplier.
  // Shadows read this so they match.
  useLayoutEffect(() => {
    container?.style.setProperty(
      "--huet-configurator-contrast",
      String(themeConfig.contrastMultiplier),
    );
  }, [container, themeConfig.contrastMultiplier]);

  return container ? createPortal(children, container) : null;
}
