import chroma from "chroma-js";
import React, { useContext } from "react";

const ThemeContext = React.createContext();

/*
  TODO:
  Additional settings:
  - tint colors with the gray
*/

function createClamp(min, max) {
  return n => Math.max(min, Math.min(max, n));
}

function getMinMax(ctx, ramp) {
  if (ramp.mode === "direct") throw new Error("Direct mode ramps not allowed");
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
  let returnColor;

  if (ramp.mode === "direct") {
    // returnColor = ramp.scale(ctx.bgLightness / 100);
    returnColor = ramp.scale(
      (ctx.bgLightness - ctx.ramps.gray.startL) /
        (ctx.ramps.gray.endL - ctx.ramps.gray.startL)
    );
  } else {
    const { min, max } = getMinMax(ctx, ramp);
    const clamp = createClamp(min, max);

    // TODO: Causes flicker
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
    const midpoint = (ramp.startL + ramp.endL) / 2;
    const direction = ctx.bgLightness < midpoint ? 1 : -1;

    // At 50 in a black to white scale, the highest contrast is 50.
    // This means contrast of 100 is also 50.
    // By normalizing we make sure there's always a visible difference
    // between 50 and 100 and all the colors in between.
    //  __0 _50 100 | Math.abs(50 - ctx.bgLightness)
    //  _50 __0 _50 | $_ / 50
    //  __1 __0 __1 | 1 - $_
    //  __0 __1 __0 | $_ / 2
    //  __0 _.5 __0 | 1 - $_
    //  __1 _.5 __1
    const contrastNormalizer = ctx.avoidClipping
      ? 1 - (1 - Math.abs(50 - ctx.bgLightness) / 50) / 2
      : 1;

    const contrastRescale = ctx.rescaleContrastToGrayRange
      ? (ctx.ramps.gray.endL - ctx.ramps.gray.startL) / 100
      : 1;

    const targetLightness = clamp(
      ctx.bgLightness +
        contrast *
          direction *
          ctx.contrastMultiplier *
          contrastNormalizer *
          contrastRescale
    );

    // Rescale targetLightness from ramp range to 0-1
    // const min2 = Math.max(ramp.startL, ctx.ramps.gray.startL);
    // const max2 = Math.min(ramp.endL, ctx.ramps.gray.endL);
    const scaleValue =
      (targetLightness - ramp.startL) / (ramp.endL - ramp.startL);

    returnColor = ramp.scale(scaleValue);
  }

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

function color(ctx, col, a) {
  return chroma(col)
    .set("hcl.c", `*${ctx.saturationContrastMultiplier}`)
    .alpha(a * ctx.contrastMultiplier);
}

function contrastFunctions(ctx) {
  return {
    value: ctx,
    contextValue: ctx,
    darkColor: ({ ramp = "gray", alpha }) =>
      color(ctx, ctx.ramps[ramp].scale(0), alpha),
    contrast: (contrast = 100, { ramp = "gray", alpha } = {}) =>
      relativeColor(ctx, ctx.ramps[ramp], contrast, alpha)
  };
}

function useTheme() {
  const ctx = useContext(ThemeContext);
  return contrastFunctions(ctx);
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

function createRamp(colorOrColors, options) {
  const finalColors = Array.isArray(colorOrColors)
    ? colorOrColors
    : ["#000000", colorOrColors, "#ffffff"];
  return createRampWithScale(
    chroma
      .scale(finalColors)
      .mode("lab")
      .correctLightness(),
    options
  );
}

function getLightness(color) {
  // return chroma(color).luminance() * 100;
  return Math.max(0, chroma(color).get("lab.l"));
}

export default {
  createRamp,
  createDirectRampWithScale,
  createRampWithScale,
  getLightness,
  // funcs for context
  contrastFunctions,
  useTheme,
  ThemeContext
};
