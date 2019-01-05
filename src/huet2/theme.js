import chroma from "chroma-js";
import mapValues from "lodash/mapValues";
import { getLightness } from "./color";

export function createTheme(themeConfig) {
  const ramps = mapValues(themeConfig.ramps, ramp =>
    createRamp(themeConfig, ramp)
  );
  return {
    ...themeConfig,
    ramps
  };
}

// ---

// TODO: try to bake in things like the contrastMultiplier so
// it is only calculated once
// TODO: consider wrapping scales in a more opaque structure to avoid
// it being mutated by consumer as we do here
function createRamp(themeConfig, rampConfig) {
  const config = {
    ...defaultRampConfig,
    ...rampConfig
  };
  const hexColors = config.colors.map(
    colorName => themeConfig.pallet[colorName]
  );
  const scale = chroma.scale(hexColors);
  const rampOptions = { isNeutral: config.isNeutral };
  if (config.colorModel) scale.mode(config.colorModel);
  if (config.classes) scale.classes(config.classes);
  switch (config.mode) {
    case "direct":
      return createDirectRampWithScale(scale, rampOptions);
    case "colored":
    default:
      if (config.correctLightness) scale.correctLightness();
      return createRampWithScale(scale, rampOptions);
  }
}

// TODO: ramp should just be a function and have props for startL and endL and isNeutral
// if bg is 0 then we translate this directly 0 on this scale and so on
function createRampWithScale(scale, { isNeutral = false } = {}) {
  let scaleFunc = n => scale(n).hex();
  scaleFunc.startL = getLightness(scale(0));
  scaleFunc.endL = getLightness(scale(1));
  scaleFunc.mode = "colored";
  scaleFunc.isNeutral = isNeutral;
  return scaleFunc;
}

function createDirectRampWithScale(scale, { isNeutral = false } = {}) {
  let scaleFunc = n => scale(n).hex();
  scaleFunc.mode = "direct";
  scaleFunc.isNeutral = isNeutral;
  return scaleFunc;
}

const defaultRampConfig = {
  colors: ["black", "white"],
  colorModel: "lab", // lrgb, lab
  correctLightness: true
};
