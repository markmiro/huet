import chroma from "chroma-js";
import mapValues from "map-values"; // saved 20KB when bundling
import { getLightness, BaseColor } from "./Color";
import baseConfig from "./private/baseThemeConfig";

const allowed = [
  "name",
  "pallet",
  "ramps",
  "bgRamp",
  "bgRampValue",
  "startSignalLightness",
  "endSignalLightness",
  "contrastMultiplier",
  "saturationMultiplier",
  "rescaleSaturationToGrayRange",
  "rescaleContrastToSignalRange",
  "rescaleContrastToGrayRange"
];

export default class Theme {
  /**
   * Creates a theme instance from a themeConfig
   * @param {Object} config
   */
  constructor(config = baseConfig) {
    this.config = config;
    Object.keys(config).forEach(key => {
      if (!allowed.includes(key)) {
        throw new Error(`${key} isn't allowed in Theme`);
      }
      this[key] = config[key];
    });

    const ramps = mapValues(config.ramps, ramp => createRamp(config, ramp));
    this.ramps = ramps;
  }
}

// ---

function createRamp(themeConfig, rampConfig) {
  const config = {
    ...defaultRampConfig,
    ...rampConfig
  };

  // TODO: if ramp is a "colored", then convert it based on the min and max colors.
  const hexColors = config.colors.map(colorName => {
    if (colorName in themeConfig.pallet) {
      return themeConfig.pallet[colorName];
    }
    throw new Error(`Couldn't find color "${colorName}" in themeConfig.pallet`);
  });

  const scale = chroma.scale(hexColors);
  if (config.colorModel) scale.mode(config.colorModel);
  if (config.classes) scale.classes(config.classes);

  let ramp;
  switch (config.mode) {
    case "direct":
      ramp = createDirectRampWithScale(scale);
      break;
    case "colored":
    default:
      if (config.correctLightness) scale.correctLightness();
      ramp = createRampWithScale(scale);
      break;
  }
  ramp.config = config;
  return ramp;
}

// Don't want to expose the underlying chroma-js stuff to the user.
// The chroma-js scale is a function but also allows chaining and has fields.
function wrapScaleFunc(scale) {
  return n => new BaseColor(scale(n).hex());
}

function createRampWithScale(scale) {
  let scaleFunc = wrapScaleFunc(scale);
  scaleFunc.startL = getLightness(scale(0));
  scaleFunc.endL = getLightness(scale(1));
  return scaleFunc;
}

function createDirectRampWithScale(scale) {
  return wrapScaleFunc(scale);
}

const defaultRampConfig = {
  colors: ["black", "white"],
  colorModel: "lab", // lrgb, lab
  correctLightness: true,
  mode: "colored"
};
