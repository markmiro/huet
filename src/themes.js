import chroma from "chroma-js";
import huet from "./huet";

let gray = huet._createRampWithChromaScale(
  chroma.scale(["#000000", "#ffffff"])
  // .gamma(0.7) // TODO: enable when we can get this working on colors too
);

// let gray = huet._createRampWithChromaScale(
//   chroma
//     .scale(["#000000", "#555555", "#999999", "ffffff"])
//     .domain([0, 0.5, 0.51, 1])
// );
const youtubeGray = huet.createRamp(["#121212", "#ffffff"]);
const tintedBlueGray = huet.createRamp(["#414753", "#ffffff"]);
const beigeGray = huet.createRamp(["#5b4128", "#fff9f3"]);

const crazyRamps = {
  red: huet.createRamp("#ff0000"),
  green: huet.createRamp("#00ff00"),
  blue: huet.createRamp("#0000ff"),
  cyan: huet.createRamp("#00ffff"),
  gold: huet.createRamp("#ffff00"),
  purple: huet.createRamp("#ff00ff")
};

/*
  Maybe we can allow the pallet to be generated:
  - Pick min and max lightness
  - Pick base color

  pallets: {
    default: {
      white: '#ffffff',
      black: '#000000',
      base: '#ff0000',
    },
  },
  themes: {
    default: {
      ramps: {
        neutral: {
          colors: ['$.pallets.default.white', '$.pallets.default.black'],
          classes: [0, 0.7, 1],
          gamma: 1,
          correctLightness: true,
          mode: 'hcl', // lrgb, lab
          bezier: false,
          direct,
        },
      },
      contrastMultiplier: 1,
      saturationContrastMultiplier: 1,
    },
    highContrast: {
      mode: 'highContrast',
    },
  },
*/

const shared = {
  ramps: {
    gray,
    white: gray,
    white: huet._createRampWithChromaScale(
      chroma.scale(["#ffffff", "#000000"]).classes([0, 0.7, 1]),
      { mode: "direct" }
    ),
    red: huet.createRamp("#f73748"),
    green: huet.createRamp("#3c962a"),
    blue: huet.createRamp("#3087d6"),
    gold: huet.createRamp("#c86c00"),
    purple: huet.createRamp("#a46ad3")
  },
  bgLightness: gray.lightL,
  bgLightnessAbove: gray.lightL,
  minColorLightness: 20,
  maxColorLightness: 80,
  contrastMultiplier: 1,
  saturationContrastMultiplier: 1,
  contrastDirection: "zigzag"
};

const themes = {
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
    name: "High Contrast",
    ramps: {
      ...shared.ramps,
      ...crazyRamps,
      white: huet._createRampWithChromaScale(
        chroma.scale(["#000000", "#ffffff"])
        // .gamma(0.7) // TODO: enable when we can get this working on colors too
      ),
      gold: huet.createRamp("#ff9900")
    },
    mode: "highContrast",
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
      red: huet._createRampWithChromaScale(
        chroma.scale(["#ff0000", "#ff9999", "#ff0000"])
      ),
      blue: huet.createRamp(["#104892", "#065fd4", "#73b0ff"])
    },
    bgLightness: youtubeGray.lightL,
    bgLightnessAbove: youtubeGray.lightL,
    contrastDirection: "lighter"
  },
  beige: {
    ...shared,
    name: "Beige",
    ramps: {
      ...shared.ramps,
      gray: beigeGray
    },
    bgLightness: beigeGray.darkL,
    bgLightnessAbove: beigeGray.darkL
  }
};

window.themes = themes;
window.huet = huet;
window.chroma = chroma;

export default themes;
