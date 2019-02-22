import chroma from "chroma-js";
/*
  Maybe we can allow the pallet to be generated:
  - Pick min and max lightness
  - Pick base color
*/

const hueStart = 20; // Gets us blues and greens that have 0 in the R in RGB
const l = 50; // Doesn't really matter which value we put here
const c = 60; // Over about 40 leads to colors in blue range to veer off

/* eslint-disable no-sparse-arrays */
const colorLabels = ["red", "yellow", "green", , "blue", "purple"]; // skip teal
const hueUnit = 360 / colorLabels.length;

const palletColors = colorLabels.reduce(
  (acc, label, i) => ({
    ...acc,
    [label]: chroma.hcl(hueUnit * i + hueStart, c, l).hex()
  }),
  {}
);

const ramps = colorLabels.reduce(
  (acc, label) => ({
    ...acc,
    [label]: { colors: ["black", label, "white"] }
  }),
  {}
);

export default {
  id: 0,
  name: "Base",
  pallet: {
    black: "#000000",
    white: "#ffffff",
    ...palletColors
  },
  ramps: {
    gray: {
      colorModel: "lab"
    },
    white: {
      colors: ["white", "black"],
      classes: [0, 0.7, 1],
      mode: "direct",
      isNeutral: true
    },
    ...ramps
  },
  bgRamp: "gray",
  bgRampValue: 1,
  startSignalLightness: 0.49,
  endSignalLightness: 0.49,
  contrastMultiplier: 1,
  signalSaturationMultiplier: 1,
  rescaleSaturationToGrayRange: false,
  rescaleContrastToGrayRange: true
};

/*
Ramp modes:
- furthest
- signal
- punched
- constant
- direct
*/
