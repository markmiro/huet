import chroma from "chroma-js";

import type { Lab, Ramp, RampConfig, RampInput, ThemeConfig } from "./colorModel";
import { rampModes } from "./colorModel";
import { getLightness } from "./Color";
import baseConfig from "./private/baseThemeConfig";
import { rampKeys } from "./private/rampKeys";

export { rampModes };
export type { RampMode } from "./colorModel";

const allowed = [
  "images",
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
    this.ramps = Object.fromEntries(
      Object.entries(config.ramps).map(([name, ramp]) => [name, createRamp(config, ramp)]),
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

  const key = JSON.stringify([hexColors, config]);
  let sampler = samplers.get(key);
  if (!sampler) {
    if (samplers.size >= 256) samplers.clear();
    samplers.set(key, (sampler = createSampler(hexColors, config)));
  }
  const { sample, startL, endL } = sampler;
  // Don't want to expose the underlying chroma-js stuff to the user.
  const ramp = ((amount: number) => [...sample(amount)] as Lab) as Ramp;
  if (config.mode !== rampModes.DIRECT) Object.assign(ramp, { startL, endL });
  ramp.config = config;
  rampKeys.set(ramp, key);
  return ramp;
}

type Sampler = { sample: (amount: number) => Lab; startL?: number; endL?: number };
/**
 * Editing a theme rebuilds every ramp, though usually only one color changed.
 * Ramps with the same colors and settings share a sampler, which remembers
 * the chroma-js scale's samples.
 */
const samplers = new Map<string, Sampler>();

function createSampler(hexColors: string[], config: RampConfig): Sampler {
  const scale = chroma.scale(hexColors);
  if (config.colorModel) scale.mode(config.colorModel);
  if (config.classes) scale.classes(config.classes);
  if (config.mode !== rampModes.DIRECT && config.correctLightness)
    scale.correctLightness();
  const samples = new Map<number, Lab>();
  const sample = (amount: number) => {
    let lab = samples.get(amount);
    if (!lab) {
      if (samples.size >= 4096) samples.clear();
      samples.set(amount, (lab = scale(amount).lab()));
    }
    return lab;
  };
  if (config.mode === rampModes.DIRECT) return { sample };
  return { sample, startL: getLightness(scale(0)), endL: getLightness(scale(1)) };
}

/*
Ramp modes:
- furthest
- signal
- constant?
- direct
*/
