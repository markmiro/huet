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
  if (ramp === ctx.ramps.gray) {
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
    returnColor = ramp.scale(ctx.bgLightness / 100);
  } else {
    const { min, max } = getMinMax(ctx, ramp);
    const clamp = createClamp(min, max);
    const contrastAdder = ctx.bgLightness < 50 ? contrast : -contrast;

    returnColor = ramp.scale(
      clamp(ctx.bgLightness + contrastAdder * ctx.contrastMultiplier) / 100
    );
  }

  if (ctx.saturationContrastMultiplier !== 1 || a !== 100) {
    returnColor = returnColor
      .set("hcl.c", `*${ctx.saturationContrastMultiplier}`)
      .alpha(a);
  }

  returnColor._contrast = contrast; // for debugging
  returnColor._ramp = ramp; // for debugging
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
      color,
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
function createRampWithScale(scale) {
  return {
    colors: scale.colors(),
    startL: getLightness(scale(0)),
    endL: getLightness(scale(1)),
    scale
  };
}

function createDirectRampWithScale(scale) {
  return {
    colors: scale.colors(),
    scale,
    mode: "direct"
  };
}

function createRamp(colorOrColors) {
  const finalColors = Array.isArray(colorOrColors)
    ? colorOrColors
    : ["#000000", colorOrColors, "#ffffff"];
  return {
    ...createRampWithScale(
      chroma
        .scale(finalColors)
        .mode("hcl")
        .correctLightness()
    )
  };
}

function getLightness(color) {
  // return chroma(color).luminance();
  return chroma(color).get("hcl.l");
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
