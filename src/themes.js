import { hsluvToHex } from "hsluv";
import chroma from "chroma-js";
import huet from "./huet";

const min = 0;
const medium = 55;
const max = 100;

let gray = huet._createRampWithChromaScale(
  chroma.scale(["#000000", "#ffffff"]).gamma(0.5)
);
const youtubeGray = huet.createRamp(["#121212", "#ffffff"]);
const tintedBlueGray = huet.createRamp(["#414753", "#ffffff"]);
const cubeHelixGray = huet._createRampWithChromaScale(
  chroma
    .cubehelix()
    .rotations(3)
    .scale()
    .padding(0.1)
);

const youtubeColors = {
  youtubeRed: huet.createRamp(["#ff0000", "#ff9999", "#ff0000"]),
  youtubeBlue: huet.createRamp(["#104892", "#065fd4", "#73b0ff"])
};

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
      ...youtubeColors,
      red: gray,
      green: gray,
      blue: gray
    },
    bgLightness: gray.lightL,
    bgLightnessAbove: gray.lightL,
    ...shared
  },
  tintedBlue: {
    name: "Tinted Blue",
    ramps: {
      gray: tintedBlueGray,
      ...youtubeColors,
      ...colors
    },
    bgLightness: tintedBlueGray.lightL,
    bgLightnessAbove: tintedBlueGray.lightL,
    ...shared
  },
  basic: {
    name: "Basic Muted",
    ramps: {
      gray,
      ...youtubeColors,
      ...colors
    },
    bgLightness: gray.lightL,
    bgLightnessAbove: gray.lightL,
    ...shared
  },
  cubehelix: {
    name: "Cubehelix",
    ramps: {
      gray: cubeHelixGray,
      ...youtubeColors,
      ...colors
    },
    bgLightness: gray.darkL,
    bgLightnessAbove: gray.darkL,
    ...shared
  },
  crazy: {
    name: "RGB / CMYK Boundaries",
    ramps: {
      gray: gray,
      ...youtubeColors,
      red: huet.createRamp(["#010000", "#ff0000", "#fffefe"]),
      green: huet.createRamp(["#000100", "#00ff00", "#fefffe"]),
      blue: huet.createRamp(["#000001", "#0000ff", "#fefeff"]),
      cyan: huet.createRamp(["#000101", "#00ffff", "#feffff"]),
      yellow: huet.createRamp(["#010100", "#ffff00", "#fffffe"]),
      magenta: huet.createRamp(["#010001", "#ff00ff", "#fffeff"])
    },
    bgLightness: gray.darkL,
    bgLightnessAbove: gray.darkL,
    ...shared
  },
  crazy2: {
    name: "RGB / CMYK Boundaries 2",
    ramps: {
      gray: gray,
      ...youtubeColors,
      red: huet.createRamp(["#000000", "#ff0000", "#ffffff"]),
      green: huet.createRamp(["#000000", "#00ff00", "#ffffff"]),
      blue: huet.createRamp(["#000000", "#0000ff", "#ffffff"]),
      cyan: huet.createRamp(["#000000", "#00ffff", "#ffffff"]),
      yellow: huet.createRamp(["#000000", "#ffff00", "#ffffff"]),
      magenta: huet.createRamp(["#000000", "#ff00ff", "#ffffff"])
    },
    bgLightness: gray.lightL,
    bgLightnessAbove: gray.lightL,
    ...shared
  },
  youtube: {
    name: "YouTube",
    ramps: {
      gray: youtubeGray,
      ...youtubeColors,
      ...colors
    },
    bgLightness: youtubeGray.lightL,
    bgLightnessAbove: youtubeGray.lightL,
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
