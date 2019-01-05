import chroma from "chroma-js";

function getMinMax(ctx, ramp) {
  if (ramp.isNeutral) {
    return [ramp.startL, ramp.endL];
  }

  const min = Math.max(ramp.startL, ctx.ramps.gray.startL);
  const max = Math.min(ramp.endL, ctx.ramps.gray.endL);
  return [min, max];
}

export default class Color {
  constructor({ theme, bgColor, hex, ramp }) {
    this.theme = theme;
    this.bgColor = bgColor;
    this.hex = hex;
    this.ramp = ramp;
    this.lightness = getLightness(hex);
  }

  contrast(contrast = 100, ramp = this.theme.ramps.gray) {
    if (ramp.mode !== "colored") throw new Error("Not allowed");
    return Color.fromColor({
      theme: this.theme,
      bgColor: this,
      ramp,
      contrast
    });
  }

  direct(ramp) {
    if (ramp.mode !== "direct") throw new Error("Not allowed");
    return Color.fromColorDirect({
      theme: this.theme,
      bgColor: this,
      ramp
    });
  }

  alpha(amount) {
    return chroma(this.hex)
      .alpha(amount * this.theme.contrastMultiplier)
      .hex();
  }

  toString() {
    return this.hex;
  }

  // ---

  static fromColor({ bgColor, ramp, contrast }) {
    const ctx = bgColor.theme;
    const [min, max] = getMinMax(ctx, ramp);
    const [bgMin, bgMax] = getMinMax(ctx, bgColor.ramp);

    // __0 _.5 __1
    const normalizedLightness = (bgColor.lightness - bgMin) / (bgMax - bgMin);
    // __1 _.5 __1
    const contrastNormalizer =
      ctx.rescaleContrastToGrayRange || ramp !== ctx.ramps.gray
        ? Math.abs(0.5 - normalizedLightness) + 0.5
        : 1;
    const contrastRescale = (max - min) / 100;
    const midpoint = (min + max) / 2;
    const direction = bgColor.lightness < midpoint ? 1 : -1;
    const colorContrastMinMax =
      ramp === ctx.ramps.gray
        ? 1
        : bgColor.lightness < midpoint
        ? ctx.maxColorLightness / 100
        : 1 - ctx.minColorLightness / 100;

    const contrastMultiplier =
      ramp === ctx.ramps.gray || ctx.contrastMultiplier < 1
        ? ctx.contrastMultiplier
        : 1;

    const targetLightness =
      bgColor.lightness +
      contrast *
        direction *
        contrastMultiplier *
        contrastNormalizer *
        colorContrastMinMax *
        contrastRescale;

    // Rescale targetLightness from ramp range to 0-1
    let scaleValue =
      (targetLightness - ramp.startL) / (ramp.endL - ramp.startL);

    let hex = ramp(scaleValue);

    const [bgL, bgA, bgB] = chroma(bgColor).lab();
    const [fgL, fgA, fgB] = chroma(hex).lab();
    const colorContrastNormalizer = Math.abs(0.5 - normalizedLightness) * 2;
    const abContrast =
      ctx.contrastMultiplier < 1
        ? ctx.contrastMultiplier
        : (colorContrastNormalizer + contrast) / 100;
    hex = chroma
      .lab(
        bgL + (fgL - bgL) * 1,
        bgA + (fgA - bgA) * abContrast,
        bgB + (fgB - bgB) * abContrast
      )
      .hex();

    return new Color({
      theme: ctx,
      bgColor,
      hex,
      ramp
    });
  }

  static fromColorDirect({ bgColor, ramp }) {
    const ctx = bgColor.theme;
    let hex = ramp(
      (bgColor.lightness - ctx.ramps.gray.startL) /
        (ctx.ramps.gray.endL - ctx.ramps.gray.startL)
    );
    hex = chroma
      .mix(bgColor, hex, Math.min(ctx.contrastMultiplier, 1), "lab")
      .hex();

    return new Color({
      theme: ctx,
      bgColor,
      hex,
      ramp
    });
  }

  static fromTheme(theme) {
    const hex = theme.ramps.gray(theme.bgRampValue);
    return new Color({
      theme,
      bgColor: null,
      hex,
      ramp: theme.ramps[theme.bgRamp]
    });
  }
}

export function getLightness(color) {
  // Sometimes we get small negative numbers, so we clamp with Math.max
  return Math.max(0, chroma(color).get("lab.l"));
}
