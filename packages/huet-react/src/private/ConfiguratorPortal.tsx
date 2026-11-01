import React, { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import css from "../configurator.css?inline";
import { mountTheme, type Theme } from "huet";
import { PortalContainerContext } from "./ui/portal";

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
 * `theme` on `background`.
 */
export default function ConfiguratorPortal({
  theme,
  background,
  children,
}: {
  theme: Theme;
  background: number;
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

  const latest = useRef({ theme, background });
  latest.current = { theme, background };
  const mount = useRef<ReturnType<typeof mountTheme>>(undefined);
  useLayoutEffect(() => {
    if (!container) return;
    const current = mountTheme(container, latest.current.theme, latest.current);
    mount.current = current;
    return () => {
      current.destroy();
      mount.current = undefined;
    };
  }, [container]);
  useLayoutEffect(() => mount.current?.update(theme, { background }), [theme, background]);

  // Shadows scale their opacity by the theme's contrast, as the previews do.
  useLayoutEffect(() => {
    container?.style.setProperty("--huet-configurator-contrast", String(theme.contrast ?? 1));
  }, [container, theme.contrast]);

  return container
    ? createPortal(<PortalContainerContext.Provider value={container}>{children}</PortalContainerContext.Provider>, container)
    : null;
}
