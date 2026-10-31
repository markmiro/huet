import { amounts } from "./classes";
import { textEnd } from "./color";
import type { Surface } from "./steps";
import { resolveTheme, themeVariables, type BackgroundOptions, type ResolvedTheme, type Theme } from "./theme";

/** Neutral contrast steps, written as `--huet-0` … `--huet-100` on each surface: the class amounts. */
export const contrastSteps = amounts;

/** `--huet-<step>`: each contrast step away from `background`. */
export function stepVariables(theme: ResolvedTheme, background: Surface): Record<string, string> {
  return Object.fromEntries(
    contrastSteps.map((step) => [`--huet-${step}`, theme.step(background, step).hex]),
  );
}

export interface ThemeCssOptions extends BackgroundOptions {
  /** The rule's selector. Defaults to `:root`. */
  selector?: string;
}

/**
 * A CSS rule with a theme's colors on one background, for pages that render
 * on the server, at build time, or without JavaScript. It sets the role colors
 * (`--huet-background`, `--huet-foreground`, `--huet-muted`, `--huet-border`
 * and one per hue, which `huet/styles.css`, `huet/tailwind.css` and the Shiki
 * theme use) and the neutral contrast steps `--huet-0`, `--huet-5`, `--huet-10`, `--huet-20` … `--huet-100`
 * (`mountTheme` writes the same variables on each nested surface). For
 * light and dark modes, write one rule per mode:
 *
 *   themeCss(theme, { background: 1 }) +
 *   themeCss(theme, { background: 0, selector: ".dark" })
 *
 * Nested `huet-bg-*` surfaces need `mountTheme`, which works out each color
 * against its parent.
 */
export function themeCss(theme: Theme, { selector = ":root", ...options }: ThemeCssOptions = {}) {
  const resolved = resolveTheme(theme, options);
  const lightText = textEnd(resolved.background, resolved.dark, resolved.light) === resolved.light;
  const values: Record<string, string> = {
    "color-scheme": lightText ? "dark" : "light",
    ...themeVariables(resolved.tokensOn(resolved.root)),
    ...stepVariables(resolved, resolved.root),
  };
  const body = Object.entries(values)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");
  return `${selector} {\n${body}\n}\n`;
}
