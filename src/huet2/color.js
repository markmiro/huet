import chroma from "chroma-js";

function getMinMax(theme, ramp) {
  if (ramp.config.isNeutral) {
    return [ramp.startL, ramp.endL];
  }

  const min = Math.max(ramp.startL, theme.ramps.gray.startL);
  const max = Math.min(ramp.endL, theme.ramps.gray.endL);
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
    if (ramp.config.mode !== "colored") throw new Error("Not allowed");
    return Color.fromColor({
      theme: this.theme,
      bgColor: this,
      ramp,
      contrast
    });
  }

  direct(ramp) {
    if (ramp.config.mode !== "direct") throw new Error("Not allowed");
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
    const theme = bgColor.theme;
    const [min, max] = getMinMax(theme, ramp);
    const [bgMin, bgMax] = getMinMax(theme, bgColor.ramp);

    // __0 _.5 __1
    const normalizedLightness = (bgColor.lightness - bgMin) / (bgMax - bgMin);
    // __1 _.5 __1
    const contrastNormalizer =
      theme.rescaleContrastToGrayRange || ramp !== theme.ramps.gray
        ? Math.abs(0.5 - normalizedLightness) + 0.5
        : 1;
    const contrastRescale = (max - min) / 100;
    const midpoint = (min + max) / 2;
    const direction = bgColor.lightness < midpoint ? 1 : -1;
    const colorContrastMinMax =
      ramp === theme.ramps.gray
        ? 1
        : bgColor.lightness < midpoint
        ? theme.maxColorLightness / 100
        : 1 - theme.minColorLightness / 100;

    const contrastMultiplier =
      ramp === theme.ramps.gray || theme.contrastMultiplier < 1
        ? theme.contrastMultiplier
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
      theme.contrastMultiplier < 1
        ? theme.contrastMultiplier
        : (colorContrastNormalizer + contrast) / 100;
    hex = chroma
      .lab(
        bgL + (fgL - bgL) * 1,
        bgA + (fgA - bgA) * abContrast,
        bgB + (fgB - bgB) * abContrast
      )
      .hex();

    return new Color({
      theme,
      bgColor,
      hex,
      ramp
    });
  }

  static fromColorDirect({ bgColor, ramp }) {
    const theme = bgColor.theme;
    let hex = ramp(
      (bgColor.lightness - theme.ramps.gray.startL) /
        (theme.ramps.gray.endL - theme.ramps.gray.startL)
    );
    hex = chroma
      .mix(bgColor.hex, hex, Math.min(theme.contrastMultiplier, 1), "lab")
      .hex();

    return new Color({
      theme,
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
