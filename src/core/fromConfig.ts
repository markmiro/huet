import chroma from "chroma-js";
import Color from "../Color";
import Theme from "../Theme";
import type { ThemeConfig } from "../colorModel";
import { luminance } from "./color";
import { createTheme, hues, type ColorModel, type HuetTheme } from "./theme";

/**
 * Builds a core theme from a configurator theme config.
 * Relative classes (`huet-bg-10`, `huet-text-red-100`, ...) resolve with the
 * full config, so they match `<Block contrast="...">` exactly. Role tokens
 * (`huet-text`, `huet-muted`, ...) come from the config's background ramp,
 * palette hues and background position.
 */
export function themeFromConfig(config: ThemeConfig): HuetTheme {
  const root = Color.fromTheme(new Theme(config));
  const ramp = config.ramps[config.bgRamp] ?? {};
  const stops = (ramp.colors ?? ["black", "white"]).map((name) =>
    chroma(config.pallet[name]).hex(),
  );
  // Core neutral ramps run dark to light.
  const reversed = luminance(stops[0]) > luminance(stops[stops.length - 1]);
  const colors = Object.fromEntries(
    hues.filter((hue) => hue in config.pallet).map((hue) => [hue, chroma(config.pallet[hue]).hex()]),
  );
  const base = createTheme({
    neutral: {
      colors: reversed ? stops.reverse() : stops,
      colorModel: (ramp.colorModel ?? "lab") as ColorModel,
    },
    background: reversed ? 1 - config.bgRampValue : config.bgRampValue,
    colors,
  });
  return Object.freeze({ ...base, background: root.hex, relative: root });
}
