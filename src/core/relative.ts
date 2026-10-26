import chroma from "chroma-js";
import Color from "../Color";
import Theme from "../Theme";
import baseConfig from "../private/baseThemeConfig";

/** Use the same solver as the original API, without importing React. */
export function relativeRoot(dark: string, light: string, background: string,
  colors: Record<string, string>, contrastMultiplier = 1) {
  if (!Number.isFinite(contrastMultiplier) || contrastMultiplier < 0 || contrastMultiplier > 1)
    throw new RangeError("contrast must be between 0 and 1");
  const theme = new Theme({
    ...baseConfig,
    pallet: { ...baseConfig.pallet, ...colors, black: dark, white: light },
    contrastMultiplier,
  });
  return new Color({ theme, lab: chroma(background).lab(), ramp: theme.ramps.gray });
}
