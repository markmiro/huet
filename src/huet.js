import chroma from "chroma-js";
import React, { useContext } from "react";
import mapValues from "lodash/mapValues";

const ThemeContext = React.createContext();

function createTransform([aMin, aMax], [bMin, bMax]) {
  const aRange = aMax - aMin;
  const bRange = bMax - bMin;
  return i => {
    const normalized = (i - aMin) / aRange; // from 0 to 1 now
    return normalized * bRange + bMin;
  };
}

function getMinMax(ctx, ramp) {
  if (ramp.isNeutral) {
    return [ramp.startL, ramp.endL];
  }

  const min = Math.max(ramp.startL, ctx.ramps.gray.startL);
  const max = Math.min(ramp.endL, ctx.ramps.gray.endL);
  return [min, max];
}

function relativeColor(ctx, ramp, contrast = 100, a = 100) {
  let scaleValue;

  if (ramp.mode === "direct") {
    scaleValue =
      (ctx.bgLightness - ctx.ramps.gray.startL) /
      (ctx.ramps.gray.endL - ctx.ramps.gray.startL);
  } else {
    const [min, max] = getMinMax(ctx, ramp);
    const [bgMin, bgMax] = getMinMax(ctx, ctx.bgRamp);
    // At 50 in a black to white scale, the highest contrast is 50.
    // This means contrast of 100 is also 50.
    // By normalizing we make sure there's always a visible difference
    // between 50 and 100 and all the colors in between.
    //              | ctx.bgLightness
    //  __0 _.5 __1 | Math.abs(.5 - ctx.bgLightness/100)
    //  _.5 __0 _.5 | $_ + .5
    //  __1 _.5 __1 |
    const normalizedLightness = (ctx.bgLightness - bgMin) / (bgMax - bgMin);
    const contrastNormalizer = Math.abs(0.5 - normalizedLightness) + 0.5;
    const contrastRescale = (max - min) / 100;
    const midpoint = (min + max) / 2;
    const direction = ctx.bgLightness < midpoint ? 1 : -1;

    const targetLightness =
      ctx.bgLightness +
      contrast *
        direction *
        ctx.contrastMultiplier *
        contrastNormalizer *
        contrastRescale;

    // Rescale targetLightness from ramp range to 0-1
    scaleValue = (targetLightness - ramp.startL) / (ramp.endL - ramp.startL);
  }

  let returnColor = ramp.scale(scaleValue);

  if (ctx.saturationContrastMultiplier !== 1 || a !== 100) {
    returnColor = returnColor
      .set("hcl.c", `*${ctx.saturationContrastMultiplier}`)
      .alpha(a);
  }

  returnColor._ramp = ramp; // for debugging
  returnColor._contrast = contrast; // for debugging
  returnColor._lightness = getLightness(returnColor); // TODO: stop using this for real work

  returnColor.contrast = (contrast2, { ramp } = {}) =>
    relativeColor(
      {
        ...ctx,
        bgLightnessAbove: ctx.bgLightness,
        bgLightness: returnColor._lightness
      },
      ctx.ramps[ramp || "gray"],
      contrast2
    );

  returnColor.forwardContext = children => {
    const newContextValue = {
      ...ctx,
      color: returnColor,
      bgRamp: ramp,
      bgLightnessAbove: ctx.bgLightness,
      bgLightness: returnColor._lightness
    };

    return children ? (
      <ThemeContext.Provider value={newContextValue}>
        {children}
      </ThemeContext.Provider>
    ) : null;
  };

  return returnColor;
}

function getLightness(color) {
  // return chroma(color).luminance() * 100;
  return Math.max(0, chroma(color).get("lab.l"));
}

function color(ctx, col, a) {
  return chroma(col)
    .set("hcl.c", `*${ctx.saturationContrastMultiplier}`)
    .alpha(a * ctx.contrastMultiplier);
}

function createCtxWrapper(ctx) {
  return {
    contextValue: ctx,
    darkColor: ({ ramp = "gray", alpha }) =>
      color(ctx, ctx.ramps[ramp].scale(0), alpha),
    contrast: (contrast = 100, { ramp = "gray", alpha } = {}) =>
      relativeColor(ctx, ctx.ramps[ramp], contrast, alpha)
  };
}

function createTheme(theme) {
  const ramps = mapValues(theme.ramps, ramp => createRamp(theme, ramp));
  const bgColor = ramps.gray.scale(theme.bgScaleValue);
  const bgLightness = getLightness(bgColor);
  return createCtxWrapper({
    // TODO: putting above because it can get overwritten
    color: bgColor,
    bgRamp: ramps.gray,
    bgLightness,
    bgLightnessAbove: bgLightness,
    ...theme,
    ramps
  });
}

function useTheme() {
  const ctx = useContext(ThemeContext);
  return createCtxWrapper(ctx);
}

// if bg is 0 then we translate this directly 0 on this scale and so on
function createRampWithScale(scale, { isNeutral = false } = {}) {
  return {
    startL: getLightness(scale(0)),
    endL: getLightness(scale(1)),
    scale,
    isNeutral
  };
}

function createDirectRampWithScale(scale, { isNeutral = false } = {}) {
  return {
    scale,
    mode: "direct",
    isNeutral
  };
}

const defaultRampConfig = {
  colors: ["black", "white"],
  colorModel: "lab", // lrgb, lab
  correctLightness: true,
  mode: "colored" // we don't actually read this
};

// TODO: try to bake in things like the contrastMultiplier so
// it is only calculated once
// TODO: consider wrapping scales in a more opaque structure to avoid
// it being mutated by consumer as we do here
function createRamp(theme, rampConfig) {
  const config = {
    ...defaultRampConfig,
    ...rampConfig
  };
  const hexColors = config.colors.map(colorName => theme.pallet[colorName]);
  const scale = chroma.scale(hexColors);
  const rampOptions = { isNeutral: config.isNeutral };
  if (config.colorModel) scale.mode(config.colorModel);
  if (
    !config.isNeutral &&
    config.mode !== "direct" &&
    (theme.minColorLightness || theme.maxColorLightness)
  ) {
    const left = theme.minColorLightness / 100;
    const right = 1 - theme.maxColorLightness / 100;
    scale.padding([left, right]);
  }
  if (config.classes) scale.classes(config.classes);
  switch (config.mode) {
    case "direct":
      return createDirectRampWithScale(scale, rampOptions);
    default:
      if (config.correctLightness) scale.correctLightness();
      return createRampWithScale(scale, rampOptions);
  }
}

export default {
  getLightness,
  // funcs for context
  createTheme,
  createCtxWrapper,
  useTheme,
  ThemeContext
};
