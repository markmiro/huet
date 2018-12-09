import chroma from "chroma-js";
import React, { useContext } from "react";

const ThemeContext = React.createContext();

const highContrastYellow = createRamp(["#000000", "#ffff00", "#ffffff"]);

/*
  Adjacent elements having contrast issues. Arguably not as big a
  deal at nested since adjacent items are in the same component.
  Workaround is to make one of the colors based on the other.

  One solution is to get all the colors used in a given layer and then
  try to base their color on their relationships as much as possible to
  differentiate between them.

  In some ways, this problem is actually worth solving since it affects
  the visual heirarchy within a view.

  Additional settings:
  - tint primaries with the gray

  Additional features
  - Make contrast shift the hues too so we get yellow at #FFFF00
*/

function createClamp(min, max) {
  return n => Math.max(min, Math.min(max, n));
}

const clamp = createClamp(0, 100);

// TODO: figure out contrast multiplier when moved to zero
// TODO: differnces between dark colors are overestimated commpared to differences
// between light colors. Contrast 10 looks good when light colors but not dark colors
export function contrastLightnessAgainst({
  bgLightness = 100,
  desiredContrast = 100,
  bgLightnessAbove = 100,
  contrastDirection = "zigzag",
  min = 0,
  max = 100
}) {
  // Map contrast scale to gray scale range and contrast multiplier
  // Check if can can go darker
  // Check if can go lighter
  // If either, then use a setting to figure out what to do
  // If only one, then just use that one way
  // If neither, then,
  const darkestDesired = bgLightness - desiredContrast;
  const lightestDesired = bgLightness + desiredContrast;

  // [        ]
  // min    max
  //
  // |                              |
  // darkestDesired   lightestDesired
  //
  // ^
  // final return value (sometimes multiple possibilities can happen)

  if (darkestDesired >= min && lightestDesired <= max) {
    // [ | | ]
    //   ^ ^
    switch (contrastDirection) {
      case "lighter":
        return lightestDesired;
      case "darker":
        return darkestDesired;
      case "flipflop":
        // TODO: or equal?
        return bgLightness > bgLightnessAbove
          ? darkestDesired
          : lightestDesired;
      case "zigzag":
      default:
        // TODO: or equal?
        return bgLightness > bgLightnessAbove
          ? lightestDesired
          : darkestDesired;
    }
  } else if (darkestDesired <= min && lightestDesired >= max) {
    // | [ ] |
    //   ^ ^
    return Math.abs(min - darkestDesired) < Math.abs(lightestDesired - max)
      ? min
      : max;
  } else if (darkestDesired >= min && darkestDesired <= max) {
    // [ | ] |
    //   ^
    return darkestDesired;
  } else if (lightestDesired >= min && lightestDesired < max) {
    // | [ | ]
    //     ^
    return lightestDesired;
  } else if (darkestDesired > max) {
    // [ ] | |
    //   ^
    return max;
  } else if (lightestDesired < min) {
    // | | [ ]
    //     ^
    return min;
  }
  throw new Error("Should not happen");
}

function rescaledContrast(contrast, ramp) {
  return (contrast / 100) * (ramp.lightL - ramp.darkL);
}

function relativeLightness(ctx, ramp, desiredContrast) {
  if (ramp.isMirror) {
    if (ctx.bgLightness < 33.3 || ctx.bgLightness > 66.7) {
      return 100;
    } else {
      return 50;
    }
  }

  const finalContrast = ctx.highContrast
    ? desiredContrast
      ? 100
      : 0
    : desiredContrast * ctx.contrastMultiplier;

  let min;
  let max;
  const midpoint = (ramp.darkL + ramp.lightL) / 2;
  if (ctx.bgLightness < midpoint) {
    min = ctx.bgLightness;
    max = ctx.maxColorLightness;
  } else {
    min = ctx.minColorLightness;
    max = ctx.bgLightness;
  }

  const lightness = contrastLightnessAgainst({
    desiredContrast: finalContrast,
    bgLightness: ctx.bgLightness,
    bgLightnessAbove: ctx.bgLightnessAbove,
    contrastDirection: ctx.contrastDirection,
    min:
      ramp === highContrastYellow
        ? 20
        : ramp === ctx.ramps.gray
        ? ramp.darkL
        : min,
    max:
      ramp === highContrastYellow
        ? 90
        : ramp === ctx.ramps.gray
        ? ramp.lightL
        : max
  });

  return clamp(lightness);
}

function relativeColor(ctx, ramp, contrast = 100, a = 100) {
  if (ctx.highContrast && ramp === ctx.ramps.gray && contrast === 100) {
    ramp = highContrastYellow;
  }
  const l = relativeLightness(ctx, ramp, contrast);
  if (ctx.saturationContrastMultiplier === 1 && a === 100) {
    return ramp.scale(l);
  }
  return ramp
    .scale(l)
    .set("hcl.c", `*${ctx.saturationContrastMultiplier}`)
    .alpha(a);
}

function relativeColorToAnother(ctx, ramp, contrast, relativeToColor) {
  const modifiedCtx = { ...ctx, bgLightness: getLightness(relativeToColor) };
  return relativeColor(modifiedCtx, ramp, contrast);
}

function color(ctx, col, a) {
  return chroma(col)
    .set("hcl.c", `*${ctx.saturationContrastMultiplier}`)
    .alpha(a * ctx.contrastMultiplier);
}

function contrastFunctions(ctx) {
  return {
    value: ctx,
    plainColor({ ramp = "gray", at = 0, alpha }) {
      return color(ctx, ctx.ramps[ramp].scale.domain([0, 100])(at), alpha);
    },
    contrast(contrast = 100, { ramp = "gray", alpha } = {}) {
      const theRamp = ctx.ramps[ramp];
      const color = relativeColor(ctx, theRamp, contrast, alpha);
      color._contrast = contrast; // for debugging
      color._ramp = theRamp; // for debugging
      // TODO: don't recalculate this again
      color._bgLightness = relativeLightness(ctx, theRamp, contrast);
      color.contrast = (contrast, { ramp2 } = {}) =>
        relativeColorToAnother(
          ctx,
          ctx.ramps[ramp2 || "gray"],
          contrast,
          color
        );

      color.forwardContext = children => {
        const newContextValue = {
          ...ctx,
          color,
          bgLightnessAbove: ctx.bgLightness,
          bgLightness: color._bgLightness
        };

        return children ? (
          <ThemeContext.Provider value={newContextValue}>
            {children}
          </ThemeContext.Provider>
        ) : null;
      };
      return color;
    }
  };
}

function useTheme() {
  const ctx = useContext(ThemeContext);
  return contrastFunctions(ctx);
}

function _createRampWithChromaScale(scale, adjust = false) {
  const darkL = Math.round(getLightness(scale(0)));
  const lightL = Math.round(getLightness(scale(100)));
  let rampSettings = {};
  if (adjust) {
    if (Math.round(darkL) === Math.round(lightL)) {
      rampSettings = {
        scale: scale.domain([0, 100]),
        darkL: getLightness(scale(0)),
        lightL: getLightness(scale(0)),
        isMirror: true
      };
    } else {
      rampSettings = {
        scale: scale
          .domain([darkL, lightL])
          .mode("hcl")
          .correctLightness(),
        darkL,
        lightL
      };
    }
  }
  return {
    mode: "chroma",
    colors: [scale(0), scale(100)],
    darkL,
    lightL,
    scale,
    ...rampSettings
  };
}

function createRamp(colors) {
  return {
    ..._createRampWithChromaScale(chroma.scale(colors), true),
    colors
  };
}

function getLightness(color) {
  return chroma(color).get("hcl.l");
}

export default {
  createRamp,
  _createRampWithChromaScale,
  getLightness,
  // funcs for context
  contrastFunctions,
  useTheme,
  ThemeContext
};
