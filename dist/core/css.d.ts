import { Surface } from './steps';
import { BackgroundOptions, ResolvedTheme, Theme } from './theme';
/** Neutral contrast steps, written as `--huet-0` … `--huet-100` on each surface: the class amounts. */
export declare const contrastSteps: readonly [0, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 100];
/** `--huet-<step>`: each contrast step away from `background`. */
export declare function stepVariables(theme: ResolvedTheme, background: Surface): Record<string, string>;
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
export declare function themeCss(theme: Theme, { selector, ...options }?: ThemeCssOptions): string;
