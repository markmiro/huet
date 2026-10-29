import chroma from "chroma-js";
import Color from "../Color";
import Theme from "../Theme";
import baseConfig from "../private/baseThemeConfig";
import type { ColorModel } from "../colorModel";

/** Use the same solver as the original API, without importing React. */
export function relativeRoot(background: string, colors: Record<string, string>,
  neutral: { colors: readonly string[]; colorModel: ColorModel },
  contrastMultiplier = 1, custom = true) {
  if (!Number.isFinite(contrastMultiplier) || contrastMultiplier < 0 || contrastMultiplier > 1)
    throw new RangeError("contrast must be between 0 and 1");
  // Middle stops become palette entries so the gray ramp can reference them by name.
  const middle = Object.fromEntries(neutral.colors.slice(1, -1).map((color, i) => [`stop${i}`, color]));
  const theme = new Theme({
    ...baseConfig,
    pallet: {
      ...baseConfig.pallet, ...colors, ...middle,
      black: neutral.colors[0], white: neutral.colors[neutral.colors.length - 1],
    },
    // The default dark/light theme keeps the original solver ramp unchanged.
    ramps: custom ? {
      ...baseConfig.ramps,
      gray: { colors: ["black", ...Object.keys(middle), "white"], colorModel: neutral.colorModel },
    } : baseConfig.ramps,
    contrastMultiplier,
  });
  return new Color({ theme, lab: chroma(background).lab(), ramp: theme.ramps.gray });
}
