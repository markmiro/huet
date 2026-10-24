import plugin from "tailwindcss/plugin";

import {
  baseRules,
  colorUtility,
  hueUtility,
  hueValues,
  utilityValues,
  type ThemesOption,
} from "./css.ts";
import { ROOTS } from "./engine.ts";
import { createTheme, type Theme, type ThemeInput } from "./theme.ts";

export type HuetOptions = ThemeInput & ThemesOption;

const KNOWN = new Set(["dark", "light", "bg", "contrast", "hues", "themes"]);

/**
 * Accepts a theme object from JS, or flat options from CSS:
 *
 *   @plugin "huet/tailwind" { dark: #1b1b1f; light: #fff; red: #e13639; blue: #1e6fd9; }
 *
 * Unknown keys are hue names. Giving any hues replaces the default hues.
 */
export function toTheme(options: Record<string, unknown> = {}): Theme {
  const flatHues = Object.fromEntries(
    Object.entries(options)
      .filter(([key, value]) => !KNOWN.has(key) && typeof value === "string")
      .map(([key, value]) => [key, value as string])
  );
  const hues = (options.hues as Record<string, string> | undefined) ??
    (Object.keys(flatHues).length ? flatHues : undefined);
  return createTheme({
    dark: options.dark as string | undefined,
    light: options.light as string | undefined,
    bg: options.bg === undefined ? undefined : Number(options.bg),
    contrast: options.contrast === undefined ? undefined : Number(options.contrast),
    hues,
  });
}

/**
 * Tailwind CSS v4 plugin.
 *
 *   @import "tailwindcss";
 *   @plugin "huet/tailwind";
 *   @theme { --color-*: initial; }   // optional: drop Tailwind's palette so only Huet colors exist
 */
type HuetPlugin = ReturnType<typeof plugin.withOptions<HuetOptions | undefined>>;

const huet: HuetPlugin = plugin.withOptions<HuetOptions | undefined>((options) => {
  const theme = toTheme(options as Record<string, unknown> | undefined);
  return ({ addBase, matchUtilities }) => {
    addBase(baseRules(theme, options ?? {}));
    // A type no arbitrary value matches, so `text-[5%]` stays Tailwind's font size.
    const type = "huet";
    matchUtilities(
      Object.fromEntries(ROOTS.map((root) => [root, (value: string) => colorUtility(root, value, theme) ?? {}])),
      { values: utilityValues(theme), type }
    );
    matchUtilities({ hue: (value: string) => hueUtility(value, theme) ?? {} }, { values: hueValues(theme), type });
  };
});

export default huet;
