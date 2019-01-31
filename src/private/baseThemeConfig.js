import chroma from "chroma-js";
/*
  Maybe we can allow the pallet to be generated:
  - Pick min and max lightness
  - Pick base color
*/

const hueStart = 20; // Gets us blues and greens that have 0 in the R in RGB
const l = 50; // Doesn't really matter which value we put here
const c = 40; // Over about 45 leads to colors in blue range to
const colorLabels = ["red", "gold", "green" /*skip teal*/, , "blue", "purple"];
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
  name: "Default",
  pallet: {
    black: "#000000",
    white: "#ffffff",
    ...palletColors
  },
  ramps: {
    gray: {
      isNeutral: true
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
  minColorLightness: 45,
  maxColorLightness: 65,
  contrastMultiplier: 1,
  saturationMultiplier: 1.75,
  rescaleContrastToGrayRange: true
};
