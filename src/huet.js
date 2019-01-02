import chroma from "chroma-js";
import React, { useContext } from "react";
import mapValues from "lodash/mapValues";

const ThemeContext = React.createContext();

function getMinMax(ctx, ramp) {
  if (ramp.isNeutral) {
    return [ramp.startL, ramp.endL];
  }

  const min = Math.max(ramp.startL, ctx.ramps.gray.startL);
  const max = Math.min(ramp.endL, ctx.ramps.gray.endL);
  return [min, max];
}

function relativeColor(ctx, ramp, contrast = 100, a = 100) {
  let returnColor;

  if (ramp.mode === "direct") {
    returnColor = ramp.scale(
      (ctx.bgLightness - ctx.ramps.gray.startL) /
        (ctx.ramps.gray.endL - ctx.ramps.gray.startL)
    );
    returnColor = chroma.mix(
      ctx.color,
      returnColor,
      Math.min(ctx.contrastMultiplier, 1),
      "lab"
    );
  } else {
    const [min, max] = getMinMax(ctx, ramp);
    const [bgMin, bgMax] = getMinMax(ctx, ctx.bgRamp);

    // __0 _.5 __1
    const normalizedLightness = (ctx.bgLightness - bgMin) / (bgMax - bgMin);
    // __1 _.5 __1
    const contrastNormalizer =
      ctx.rescaleContrastToGrayRange || ramp !== ctx.ramps.gray
        ? Math.abs(0.5 - normalizedLightness) + 0.5
        : 1;
    const contrastRescale = (max - min) / 100;
    const midpoint = (min + max) / 2;
    const direction = ctx.bgLightness < midpoint ? 1 : -1;
    const colorContrastMinMax =
      ramp === ctx.ramps.gray
        ? 1
        : ctx.bgLightness < midpoint
        ? ctx.maxColorLightness / 100
        : 1 - ctx.minColorLightness / 100;

    const contrastMultiplier =
      ramp === ctx.ramps.gray || ctx.contrastMultiplier < 1
        ? ctx.contrastMultiplier
        : 1;

    const targetLightness =
      ctx.bgLightness +
      contrast *
        direction *
        contrastMultiplier *
        contrastNormalizer *
        colorContrastMinMax *
        contrastRescale;

    // Rescale targetLightness from ramp range to 0-1
    let scaleValue =
      (targetLightness - ramp.startL) / (ramp.endL - ramp.startL);

    returnColor = ramp.scale(scaleValue);
    returnColor._targetLightness = targetLightness;
    returnColor._scaleValue = scaleValue;

    const [bgL, bgA, bgB] = chroma(ctx.color).lab();
    const [fgL, fgA, fgB] = chroma(returnColor).lab();
    const colorContrastNormalizer = Math.abs(0.5 - normalizedLightness) * 2;
    const abContrast =
      ctx.contrastMultiplier < 1
        ? ctx.contrastMultiplier
        : (colorContrastNormalizer + contrast) / 100;
    returnColor = chroma.lab(
      bgL + (fgL - bgL) * 1,
      bgA + (fgA - bgA) * abContrast,
      bgB + (fgB - bgB) * abContrast
    );
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

  returnColor.context = {
    ...ctx,
    color: returnColor,
    bgRamp: ramp,
    bgLightnessAbove: ctx.bgLightness,
    bgLightness: returnColor._lightness
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

  // TODO: Add a link that shows how to resolve this error
  if (!ctx) {
    throw new Error("Set a ThemeContext in a parent for it to be available");
  }
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
  useTheme,
  ThemeContext
};
