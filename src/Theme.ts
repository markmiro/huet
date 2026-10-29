import chroma from "chroma-js";
import mapValues from "map-values";

import type { Lab, Ramp, RampConfig, RampInput, ThemeConfig } from "./colorModel";
import { rampModes } from "./colorModel";
import { getLightness } from "./Color";
import baseConfig from "./private/baseThemeConfig";

export { rampModes };
export type { RampMode } from "./colorModel";

const allowed = [
  "id",
  "name",
  "pallet",
  "ramps",
  "bgRamp",
  "bgRampValue",
  "startSignalLightness",
  "endSignalLightness",
  "contrastMultiplier",
  "rescaleContrastToGrayRange",
];

const defaultRampConfig: RampConfig = {
  colors: ["black", "white"],
  colorModel: "lab",
  correctLightness: true,
  mode: rampModes.FURTHEST,
};

export default class Theme {
  config: ThemeConfig;
  id?: number;
  name?: string;
  pallet: Record<string, string>;
  ramps: Record<string, Ramp>;
  bgRamp: string;
  bgRampValue: number;
  startSignalLightness: number;
  endSignalLightness: number;
  contrastMultiplier: number;
  rescaleContrastToGrayRange: boolean;

  /**
   * Creates a theme instance from a themeConfig
   */
  constructor(config: ThemeConfig = baseConfig) {
    this.config = config;
    for (const key of Object.keys(config)) {
      if (!allowed.includes(key)) {
        throw new Error(`${key} isn't allowed in Theme`);
      }
    }

    this.id = config.id;
    this.name = config.name;
    this.pallet = config.pallet;
    this.bgRamp = config.bgRamp;
    this.bgRampValue = config.bgRampValue;
    this.startSignalLightness = config.startSignalLightness;
    this.endSignalLightness = config.endSignalLightness;
    this.contrastMultiplier = config.contrastMultiplier;
    this.rescaleContrastToGrayRange = config.rescaleContrastToGrayRange;
    this.ramps = mapValues(config.ramps, (ramp: RampInput) =>
      createRamp(config, ramp)
    );
  }
}

function createRamp(themeConfig: ThemeConfig, rampConfig: RampInput): Ramp {
  const config: RampConfig = {
    ...defaultRampConfig,
    ...rampConfig,
    colors: rampConfig.colors ?? defaultRampConfig.colors,
    colorModel: rampConfig.colorModel ?? defaultRampConfig.colorModel,
    correctLightness:
      rampConfig.correctLightness ?? defaultRampConfig.correctLightness,
    mode: rampConfig.mode ?? defaultRampConfig.mode,
  };

  const hexColors = config.colors.map((colorName) => {
    if (colorName in themeConfig.pallet) {
      return themeConfig.pallet[colorName];
    }
    throw new Error(`Couldn't find color "${colorName}" in themeConfig.pallet`);
  });

  const scale = chroma.scale(hexColors);
  if (config.colorModel) scale.mode(config.colorModel);
  if (config.classes) scale.classes(config.classes);

  let ramp: Ramp;
  switch (config.mode) {
    case rampModes.DIRECT:
      ramp = createDirectRampWithScale(scale);
      break;
    case rampModes.SIGNAL:
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
function wrapScaleFunc(scale: chroma.Scale): (amount: number) => Lab {
  return (amount) => scale(amount).lab();
}

function createRampWithScale(scale: chroma.Scale): Ramp {
  const scaleFunc = wrapScaleFunc(scale) as Ramp;
  scaleFunc.startL = getLightness(scale(0));
  scaleFunc.endL = getLightness(scale(1));
  return scaleFunc;
}

function createDirectRampWithScale(scale: chroma.Scale): Ramp {
  return wrapScaleFunc(scale) as Ramp;
}

/*
Ramp modes:
- furthest
- signal
- constant?
- direct
*/
