import chroma from "chroma-js";
import huet from "./huet";

let gray = huet._createRampWithChromaScale(
  chroma.scale(["#000000", "#ffffff"]).domain([0, 100])
  // .gamma(0.7) // TODO: enable when we can get this working on colors too
);
const youtubeGray = huet.createRamp(["#121212", "#ffffff"]);
const tintedBlueGray = huet.createRamp(["#414753", "#ffffff"]);

const crazyRamps = {
  red: huet.createRamp(["#000000", "#ff0000", "#ffffff"]),
  green: huet.createRamp(["#000000", "#00ff00", "#ffffff"]),
  blue: huet.createRamp(["#000000", "#0000ff", "#ffffff"]),
  cyan: huet.createRamp(["#000000", "#00ffff", "#ffffff"]),
  gold: huet.createRamp(["#000000", "#ffff00", "#ffffff"]),
  purple: huet.createRamp(["#000000", "#ff00ff", "#ffffff"])
};

const shared = {
  ramps: {
    gray,
    white: huet._createRampWithChromaScale(
      chroma
        .scale(["#000000", "#ffffff"])
        .domain([0, 100])
        .classes([0, 10, 100])
    ),
    red: huet.createRamp(["#000000", "#f73748", "#ffffff"]),
    green: huet.createRamp(["#000000", "#327922", "#ffffff"]),
    blue: huet.createRamp(["#000000", "#3087d6", "#ffffff"]),
    gold: huet.createRamp(["#000000", "#c86c00", "#ffffff"]),
    purple: huet.createRamp(["#000000", "#a46ad3", "#ffffff"])
  },
  bgLightness: gray.lightL,
  bgLightnessAbove: gray.lightL,
  minColorLightness: 20,
  maxColorLightness: 80,
  contrastMultiplier: 1,
  saturationContrastMultiplier: 1,
  contrastDirection: "zigzag"
};

export default {
  basic: {
    ...shared,
    name: "Basic"
  },
  tintedBlue: {
    ...shared,
    name: "Tinted Blue",
    ramps: {
      ...shared.ramps,
      gray: tintedBlueGray
    },
    bgLightness: tintedBlueGray.lightL,
    bgLightnessAbove: tintedBlueGray.lightL
  },
  highContrast: {
    ...shared,
    highContrast: true,
    name: "High Contrast",
    ramps: {
      ...shared.ramps,
      gray: huet._createRampWithChromaScale(
        chroma
          .scale(["#000000", "#ffffff"])
          .domain([0, 100])
          .classes(2)
      ),
      ...crazyRamps,
      gold: huet.createRamp(["#000000", "#ff9900", "#ffffff"])
    },
    bgLightness: 50,
    bgLightnessAbove: 50,
    minColorLightness: 50,
    maxColorLightness: 70,
    globalStyles: {
      fontWeight: "bold"
    }
  },
  crazy: {
    ...shared,
    name: "RGB / CMYK Boundaries",
    ramps: {
      ...shared.ramps,
      ...crazyRamps
    },
    bgLightness: gray.lightL,
    bgLightnessAbove: gray.lightL
  },
  youtube: {
    ...shared,
    name: "YouTube",
    ramps: {
      ...shared.ramps,
      gray: youtubeGray,
      red: huet.createRamp(["#ff0000", "#ff9999", "#ff0000"]),
      blue: huet.createRamp(["#104892", "#065fd4", "#73b0ff"])
    },
    bgLightness: youtubeGray.lightL,
    bgLightnessAbove: youtubeGray.lightL,
    contrastDirection: "lighter"
  }
};
