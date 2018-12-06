import { hsluvToHex } from "hsluv";
import chroma from "chroma-js";
import huet from "./huet";

const min = 0;
const medium = 55;
const max = 100;

let gray = huet.createRamp(["#000000", "#ffffff"]);
const youtubeGray = huet.createRamp(["#121212", "#ffffff"]);
const tintedBlueGray = huet.createRamp(["#414753", "#ffffff"]);
const cubeHelixGray = huet._createRampWithChromaScale(
  chroma
    .cubehelix()
    .rotations(3)
    .scale()
    .padding(0.1)
);

const colors = {
  red: huet.createRamp([
    hsluvToHex([10, 90, min]),
    hsluvToHex([10, 90, medium]),
    hsluvToHex([10, 90, max])
  ]),
  green: huet.createRamp([
    hsluvToHex([125, 90, min]),
    hsluvToHex([125, 90, medium]),
    hsluvToHex([125, 60, max])
  ]),
  blue: huet.createRamp([
    hsluvToHex([248, 90, min]),
    hsluvToHex([248, 90, medium]),
    hsluvToHex([248, 90, max])
  ]),
  gold: huet.createRamp([
    hsluvToHex([34, 100, min]),
    hsluvToHex([34, 100, medium]),
    hsluvToHex([34, 100, max])
  ]),
  purple: huet.createRamp([
    hsluvToHex([285, 65, min]),
    hsluvToHex([285, 65, medium]),
    hsluvToHex([285, 65, max])
  ]),
  bronze: huet.createRamp([
    hsluvToHex([20, 65, medium]),
    hsluvToHex([20, 65, 20]),
    hsluvToHex([20, 65, medium])
  ])
};

const shared = {
  minColorLightness: 20,
  maxColorLightness: 80,
  contrastMultiplier: 1,
  saturationContrastMultiplier: 1,
  contrastDirection: "zigzag"
};

export default {
  grayscale: {
    name: "Grayscale",
    ramps: {
      gray,
      red: gray,
      green: gray,
      blue: gray
    },
    bgLightness: gray.light.l,
    bgLightnessAbove: gray.light.l,
    ...shared
  },
  tintedBlue: {
    name: "Tinted Blue",
    ramps: {
      gray: tintedBlueGray,
      ...colors
    },
    bgLightness: tintedBlueGray.light.l,
    bgLightnessAbove: tintedBlueGray.light.l,
    ...shared
  },
  basic: {
    name: "Basic Muted",
    ramps: {
      gray,
      ...colors
    },
    bgLightness: gray.light.l,
    bgLightnessAbove: gray.light.l,
    ...shared
  },
  cubehelix: {
    name: "Cubehelix",
    ramps: {
      gray: cubeHelixGray,
      ...colors
    },
    bgLightness: gray.dark.l,
    bgLightnessAbove: gray.dark.l,
    ...shared
  },
  crazy: {
    name: "RGB / CMYK Boundaries",
    ramps: {
      gray: gray,
      red: huet.createRamp(["#010000", "#ff0000", "#fffefe"]),
      green: huet.createRamp(["#000100", "#00ff00", "#fefffe"]),
      blue: huet.createRamp(["#000001", "#0000ff", "#fefeff"]),
      cyan: huet.createRamp(["#000101", "#00ffff", "#feffff"]),
      yellow: huet.createRamp(["#010100", "#ffff00", "#fffffe"]),
      magenta: huet.createRamp(["#010001", "#ff00ff", "#fffeff"])
    },
    bgLightness: gray.dark.l,
    bgLightnessAbove: gray.dark.l,
    ...shared
  },
  crazy2: {
    name: "RGB / CMYK Boundaries 2",
    ramps: {
      gray: gray,
      red: huet.createRamp(["#000000", "#ff0000", "#ffffff"]),
      green: huet.createRamp(["#000000", "#00ff00", "#ffffff"]),
      blue: huet.createRamp(["#000000", "#0000ff", "#ffffff"]),
      cyan: huet.createRamp(["#000000", "#00ffff", "#ffffff"]),
      yellow: huet.createRamp(["#000000", "#ffff00", "#ffffff"]),
      magenta: huet.createRamp(["#000000", "#ff00ff", "#ffffff"])
    },
    bgLightness: gray.light.l,
    bgLightnessAbove: gray.light.l,
    ...shared
  },
  youtube: {
    name: "YouTube",
    ramps: {
      gray: youtubeGray,
      ...colors,
      blue: huet.createRamp(["#104892", "#065fd4", "#73b0ff"]),
      red: huet.createRamp(["#cc0000", "#ff0000", "#ff767f"])
    },
    bgLightness: youtubeGray.light.l,
    bgLightnessAbove: youtubeGray.light.l,
    ...shared,
    contrastDirection: "lighter"
  }
};

/* TODO: add default modes:
  - basic (just black to white and some basic colors)
  - dark (just invert whatever their base mode is)
  - print (use flipflop and the basic gray scale)
  - highContrast
  - lowContrast
  - https://developer.mozilla.org/en-US/docs/Web/CSS/@media/light-level
  - https://developer.mozilla.org/en-US/docs/Web/CSS/@media/color-gamut
  - hdr (a mode for taking advantage of hdr),
  - disabled
*/

// export default ThemeContext;
