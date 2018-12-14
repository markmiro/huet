import chroma from "chroma-js";
import huet from "./huet";

const darkestGray = "#333333";
const lightestGray = "#aaaaaa";

let gray = huet.createRampWithScale(
  chroma.scale([darkestGray, lightestGray]).correctLightness(),
  // .gamma(0.7) // TODO: enable when we can get this working on colors too
  { isNeutral: true }
);

const youtubeGray = huet.createRamp(["#121212", "#ffffff"], {
  isNeutral: true
});
const tintedBlueGray = huet.createRamp(["#414753", "#ffffff"], {
  isNeutral: true
});
const beigeGray = huet.createRamp(["#5b4128", "#fff9f3"], { isNeutral: true });

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
    white: huet.createDirectRampWithScale(
      chroma.scale([lightestGray, darkestGray]).classes([0, 0.7, 1]),
      { isNeutral: true }
    ),
    red: huet.createRamp([darkestGray, "#f73748", lightestGray]),
    green: huet.createRamp([darkestGray, "#3c962a", lightestGray]),
    blue: huet.createRamp([darkestGray, "#3087d6", lightestGray]),
    gold: huet.createRamp([darkestGray, "#c86c00", lightestGray]),
    purple: huet.createRamp([darkestGray, "#a46ad3", lightestGray])
  },
  bgScaleValue: 1,
  minColorLightness: 20,
  maxColorLightness: 80,
  contrastMultiplier: 1,
  saturationContrastMultiplier: 1,
  rescaleContrastToGrayRange: false,
  avoidClipping: true,
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
