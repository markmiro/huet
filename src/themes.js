import chroma from "chroma-js";
import huet from "./huet";

let gray = huet.createRampWithScale(
  chroma.scale(["#000000", "#ffffff"])
  // .gamma(0.7) // TODO: enable when we can get this working on colors too
);

// let gray = huet.createRampWithScale(
//   chroma
//     .scale(["#000000", "#555555", "#999999", "ffffff"])
//     .domain([0, 0.5, 0.51, 1])
// );

// let gray = huet.createRampWithScale(
//   chroma
//     .scale([
//       chroma.hcl(0, 0, 50),
//       chroma.hcl(0, 0, 75),

//       chroma.hcl(0, 0, 75),
//       chroma.hcl(0, 0, 100),

//       chroma.hcl(0, 0, 0),
//       chroma.hcl(0, 0, 25),

//       chroma.hcl(0, 0, 25),
//       chroma.hcl(0, 0, 50)
//     ])
//     .domain([0, 0.25, 0.25, 0.5, 0.5, 0.75, 0.75, 1]),
//   { mode: "direct" }
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

const red = "#f73748";

const shared = {
  ramps: {
    gray,
    white: gray,
    white: huet.createDirectRampWithScale(
      chroma.scale(["#ffffff", "#000000"]).classes([0, 0.7, 1])
    ),
    red: huet.createRamp(red),
    green: huet.createRamp("#3c962a"),
    blue: huet.createRamp("#3087d6"),
    gold: huet.createRamp("#c86c00"),
    purple: huet.createRamp("#a46ad3")
  },
  bgScaleValue: 1,
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
    bgScaleValue: 1
  },
  crazy: {
    ...shared,
    name: "RGB / CMYK Boundaries",
    ramps: {
      ...shared.ramps,
      ...crazyRamps
    },
    bgScaleValue: 1
  },
  youtube: {
    ...shared,
    name: "YouTube",
    ramps: {
      ...shared.ramps,
      gray: youtubeGray,
      red: huet.createRampWithScale(
        chroma.scale(["#ff0000", "#ff9999", "#ff0000"])
      ),
      blue: huet.createRamp(["#104892", "#065fd4", "#73b0ff"])
    },
    bgScaleValue: 1,
    contrastDirection: "lighter"
  },
  beige: {
    ...shared,
    name: "Beige",
    ramps: {
      ...shared.ramps,
      gray: beigeGray
    },
    bgScaleValue: 0
  }
};

window.themes = themes;
window.huet = huet;
window.chroma = chroma;

export default themes;
