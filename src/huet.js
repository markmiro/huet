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
  if (min === max) {
    if (bgLightness < 33.3 || bgLightness > 66.7) {
      return 100;
    } else {
      return 50;
    }
  }

  // Map contrast scale to gray scale range and contrast multiplier
  // Check if can can go darker
  // Check if can go lighter
  // If either, then use a setting to figure out what to do
  // If only one, then just use that one way
  // If neither, then,
  const darkestDesired = bgLightness - desiredContrast;
  const lightestDesired = bgLightness + desiredContrast;

  if (darkestDesired >= min && lightestDesired <= max) {
    // [ | • | ]
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
  } else if (darkestDesired < min && lightestDesired > max) {
    return min - darkestDesired < lightestDesired - max ? min : max;
  } else if (darkestDesired >= min && darkestDesired < max) {
    // | • [ | ]
    return darkestDesired;
  } else if (lightestDesired >= min && darkestDesired < max) {
    // | • [ | ]
    return lightestDesired;
  } else if (darkestDesired > max) {
    // [] | • |
    return max;
  } else if (lightestDesired < min) {
    // | • | [ ]
    return min;
  }

  // console.log("sort");

  // const darkestDesiredFromMin = Math.abs(darkestDesired - min);
  // const darkestDesiredFromMax = Math.abs(darkestDesired - max);
  // const lightestDesiredFromMin = Math.abs(lightestDesired - min);
  // const lightestDesiredFromMax = Math.abs(lightestDesired - max);

  // const sorted = [
  //   darkestDesiredFromMin,
  //   darkestDesiredFromMax,
  //   lightestDesiredFromMin,
  //   lightestDesiredFromMax
  // ].sort((a, b) => a - b);

  // const smallest = sorted[0];

  // switch (smallest) {
  //   case darkestDesiredFromMin:
  //   case darkestDesiredFromMax:
  //     return darkestDesired;
  //   case lightestDesiredFromMin:
  //   case lightestDesiredFromMax:
  //   default:
  //     return lightestDesired;
  // }

  if (darkestDesired > max) {
    // [] | • |
    return max;
  } else if (lightestDesired < min) {
    // | • | [ ]
    return min;
  } else if (darkestDesired < min) {
    // | [ ] • |
    return min;
  } else {
    // | • [ ] |
    return max;
  }
}

function rescaledContrast(ctx, contrast) {
  const rescaled =
    (contrast / 100) * (ctx.ramps.gray.lightL - ctx.ramps.gray.darkL);
  return clamp(rescaled * ctx.contrastMultiplier);
}

function relativeLightness(ctx, ramp, desiredContrast) {
  return contrastLightnessAgainst({
    desiredContrast: rescaledContrast(ctx, desiredContrast),
    bgLightness: ctx.bgLightness,
    bgLightnessAbove: ctx.bgLightnessAbove,
    contrastDirection: ctx.contrastDirection,
    min:
      ramp === ctx.ramps.gray
        ? ramp.darkL
        : Math.max(ctx.minColorLightness, ramp.darkL),
    max:
      ramp === ctx.ramps.gray
        ? ramp.lightL
        : Math.min(ctx.maxColorLightness, ramp.lightL)
  });
}

function relativeColor(ctx, ramp, contrast = 100, a = 100) {
  if ("bgLightness" in ctx) {
    const l = relativeLightness(ctx, ramp, contrast);
    if (ctx.saturationContrastMultiplier === 1 && a === 100) {
      return ramp.scale(l);
    }
    return ramp
      .scale(l)
      .set("hcl.c", `*${ctx.saturationContrastMultiplier}`)
      .alpha(a);
  } else {
    relativeColor(
      { ...ctx, bgLightness: getLightness(ctx) },
      ctx.ramps.gray,
      100
    );
  }
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

function useTheme() {
  const ctx = useContext(ThemeContext);
  return {
    value: ctx,
    plainColor({ ramp = "gray", at = 0, alpha }) {
      return color(ctx, ctx.ramps[ramp].scale.domain([0, 100])(at), alpha);
    },
    contrast(contrast = 100, { ramp = "gray", alpha } = {}) {
      const theRamp = ctx.ramps[ramp];
      const color = relativeColor(ctx, theRamp, contrast, alpha);
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
          // TODO: don't recalculate this again
          bgLightness: relativeLightness(ctx, theRamp, contrast)
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

function _createRampWithChromaScale(scale) {
  let darkL = Math.round(getLightness(scale(0)));
  let lightL = Math.round(getLightness(scale(1)));
  if (Math.round(darkL) === Math.round(lightL)) {
    scale.domain([0, 100]).classes(3);
    darkL = 0;
    lightL = 100;
  } else {
    scale
      .domain([darkL, lightL])
      .mode("hcl")
      .correctLightness();
  }
  return {
    mode: "chroma",
    darkL,
    lightL,
    colors: [scale(0), scale(100)],
    scale
  };
}

function createRamp(colors) {
  return {
    ..._createRampWithChromaScale(chroma.scale(colors)),
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
  useTheme,
  ThemeContext
};
