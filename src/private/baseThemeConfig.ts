import chroma from "chroma-js";

import type { ThemeConfig } from "../colorModel";

/*
  Maybe we can allow the pallet to be generated:
  - Pick min and max lightness
  - Pick base color
*/

const hueStart = 20; // Gets us blues and greens that have 0 in the R in RGB
const l = 50; // Doesn't really matter which value we put here
const c = 60; // Over about 40 leads to colors in blue range to veer off

// Six hue slots, with teal (index 3) left empty so the remaining hues stay spaced.
const colorStops: ReadonlyArray<readonly [number, string]> = [
  [0, "red"],
  [1, "yellow"],
  [2, "green"],
  [4, "blue"],
  [5, "purple"],
];
const hueUnit = 360 / 6;

const palletColors = Object.fromEntries(
  colorStops.map(([i, label]) => [
    label,
    chroma.hcl(hueUnit * i + hueStart, c, l).hex(),
  ])
);

const ramps = Object.fromEntries(
  colorStops.map(([, label]) => [
    label,
    { colors: ["black", label, "white"], mode: "signal" as const },
  ])
);

const baseThemeConfig: ThemeConfig = {
  id: 0,
  name: "Base",
  pallet: {
    black: "#000000",
    white: "#ffffff",
    ...palletColors,
  },
  ramps: {
    gray: {
      colorModel: "lab",
    },
    white: {
      colors: ["white", "black"],
      classes: [0, 0.7, 1],
      mode: "direct",
    },
    ...ramps,
  },
  bgRamp: "gray",
  bgRampValue: 1,
  startSignalLightness: 0.49,
  endSignalLightness: 0.49,
  contrastMultiplier: 1,
  rescaleSaturationToGrayRange: false,
  rescaleContrastToGrayRange: true,
};

export default baseThemeConfig;
