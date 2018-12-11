import chroma from "chroma-js";
import React, { useContext } from "react";

const ThemeContext = React.createContext();

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

function getMinMax(ctx, ramp) {
  if (ramp === ctx.ramps.gray) {
    return {
      min: ramp.darkL,
      max: ramp.lightL
    };
  }
  const midpoint = (ramp.darkL + ramp.lightL) / 2;
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

function relativeLightness(ctx, ramp, desiredContrast) {
  const lightness = contrastLightnessAgainst({
    desiredContrast: desiredContrast * ctx.contrastMultiplier,
    bgLightness: ctx.bgLightness,
    bgLightnessAbove: ctx.bgLightnessAbove,
    contrastDirection: ctx.contrastDirection,
    ...getMinMax(ctx, ramp)
  });
  return clamp(lightness);
}

function lightnessToScaleValue(ramp, lightness) {
  return (lightness - ramp.darkL) / (ramp.lightL - ramp.darkL);
}

function relativeColor(ctx, ramp, contrast = 100, a = 100) {
  // 0 => no contrast
  // 1+ => black to white and vice versa
  // 100 => yellow if bg = black, brown if bg = white
  // ? gray if text?

  let returnColor;

  if (ctx.mode === "highContrast" && ramp === ctx.ramps.gray) {
    const scale = chroma.scale(["#000000", "#ffff99", "#ffffff"]);
    switch (contrast) {
      case 100:
        returnColor = ctx.bgLightness > 50 ? scale(0.2) : scale(0.5);
        break;
      case 0:
        returnColor = ctx.bgLightness > 50 ? scale(1) : scale(0);
        break;
      default:
        returnColor = ctx.bgLightness < 50 ? scale(1) : scale(0);
    }
  } else {
    const scaleValue =
      ramp.mode === "direct"
        ? ctx.bgLightness / 100
        : lightnessToScaleValue(ramp, relativeLightness(ctx, ramp, contrast));

    if (ctx.saturationContrastMultiplier === 1 && a === 100) {
      returnColor = ramp.scale(scaleValue);
    } else {
      returnColor = ramp
        .scale(scaleValue)
        .set("hcl.c", `*${ctx.saturationContrastMultiplier}`)
        .alpha(a);
    }
  }

  returnColor._contrast = contrast; // for debugging
  returnColor._ramp = ramp; // for debugging
  returnColor._lightness = getLightness(returnColor); // TODO: stop using this for real work

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
    darkColor({ ramp = "gray", alpha }) {
      return color(ctx, ctx.ramps[ramp].scale(0), alpha);
    },
    contrast(contrast = 100, { ramp = "gray", alpha } = {}) {
      const theRamp = ctx.ramps[ramp];
      const color = relativeColor(ctx, theRamp, contrast, alpha);
      color.contrast = (contrast2, { ramp } = {}) =>
        relativeColor(
          {
            ...ctx,
            bgLightnessAbove: ctx.bgLightness,
            bgLightness: color._lightness
          },
          ctx.ramps[ramp || "gray"],
          contrast2
        );

      color.forwardContext = children => {
        const newContextValue = {
          ...ctx,
          color,
          bgLightnessAbove: ctx.bgLightness,
          bgLightness: color._lightness
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

// if bg is 0 then we translate this directly 0 on this scale and so on
function _createRampWithChromaScale(scale, rest) {
  const sortedColors = scale
    .colors()
    .sort((a, b) => getLightness(a) - getLightness(b));
  return {
    colors: scale.colors(),
    darkL: getLightness(sortedColors[0]),
    lightL: getLightness(sortedColors[sortedColors.length - 1]),
    scale,
    ...rest
  };
}

function createRamp(colorOrColors) {
  const finalColors = Array.isArray(colorOrColors)
    ? colorOrColors
    : ["#000000", colorOrColors, "#ffffff"];
  return {
    ..._createRampWithChromaScale(
      chroma
        .scale(finalColors)
        .mode("hcl")
        .correctLightness(),
      true
    )
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
