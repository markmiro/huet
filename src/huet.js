import chroma from "chroma-js";
import React, { useContext } from "react";
import mapValues from "lodash/mapValues";

const ThemeContext = React.createContext();

/*
  TODO:
  Additional settings:
  - tint colors with the gray
*/

function createClamp(min, max) {
  return n => Math.max(min, Math.min(max, n));
}

// function createTransform([aMin, aMax], [bMin, bMax]) {
//   const aRange = aMax - aMin;
//   const bRange = bMax - bMin;
//   return i => {
//     const normalized = (i - aMin) / aRange; // from 0 to 1 now
//     return normalized * bRange + bMin;
//   };
// }

function getMinMax(ctx, ramp) {
  if (ramp.mode === "direct") throw new Error("Direct mode ramps not allowed");

  // Neutral ramps don't have min and max limitations
  if (ramp.isNeutral) {
    return {
      min: ramp.startL,
      max: ramp.endL
    };
  }

  const midpoint = (ramp.startL + ramp.endL) / 2;
  if (ctx.bgLightness < midpoint) {
    return {
      min: ctx.bgLightness,
      max: ctx.maxColorLightness
    };
  } else {
    return {
      min: ctx.minColorLightness,
      max: ctx.bgLightness
    };
  }
}

function relativeColor(ctx, ramp, contrast = 100, a = 100) {
  let scaleValue;

  if (ramp.mode === "direct") {
    scaleValue =
      (ctx.bgLightness - ctx.ramps.gray.startL) /
      (ctx.ramps.gray.endL - ctx.ramps.gray.startL);
  } else {
    // TODO: Causes flicker
    // const { min, max } = getMinMax(ctx, ramp);
    // let direction;
    // if (
    //   ctx.bgLightness - contrast >= min &&
    //   ctx.bgLightness + contrast <= max
    // ) {
    //   switch (ctx.contrastDirection) {
    //     case "darker":
    //       direction = -1;
    //       break;
    //     case "lighter":
    //       direction = 1;
    //       break;
    //     case "flipflop":
    //       direction = ctx.bgLightness > ctx.bgLightnessAbove ? -1 : +1;
    //       break;
    //     case "zigzag":
    //     default:
    //       direction = ctx.bgLightness > ctx.bgLightnessAbove ? 1 : -1;
    //   }
    // } else {
    // }

    const { min, max } = getMinMax(ctx, ramp);

    // At 50 in a black to white scale, the highest contrast is 50.
    // This means contrast of 100 is also 50.
    // By normalizing we make sure there's always a visible difference
    // between 50 and 100 and all the colors in between.
    //              | ctx.bgLightness
    //  __0 _.5 __1 | Math.abs(.5 - ctx.bgLightness/100)
    //  _.5 __0 _.5 | $_ + .5
    //  __1 _.5 __1 |
    const normalizedLightness =
      (ctx.bgLightness - ctx.ramps.gray.startL) /
      (ctx.ramps.gray.endL - ctx.ramps.gray.startL);
    const contrastNormalizer = ctx.normalizeContrastToContext
      ? ramp === ctx.ramps.gray
        ? Math.abs(0.5 - normalizedLightness) + 0.5
        : (max - min) / 100
      : 1;

    const contrastRescale =
      ctx.rescaleContrastToGrayRange && ramp === ctx.ramps.gray
        ? (ctx.ramps.gray.endL - ctx.ramps.gray.startL) / 100
        : 1;

    const colorContrastRescale =
      ctx.rescaleColorContrastToGrayRange && ramp !== ctx.ramps.gray
        ? (ctx.ramps.gray.endL - ctx.ramps.gray.startL) / 100
        : 1;

    const midpoint = (ramp.startL + ramp.endL) / 2;
    const direction = ctx.bgLightness < midpoint ? 1 : -1;
    const clamp = createClamp(min, max);
    const targetLightness = clamp(
      ctx.bgLightness +
        contrast *
          direction *
          ctx.contrastMultiplier *
          contrastNormalizer *
          contrastRescale *
          colorContrastRescale
    );

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
  const bgLightness = getLightness(ramps.gray.scale(theme.bgScaleValue));
  return createCtxWrapper({
    // TODO: putting above because it can get overwritten
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
