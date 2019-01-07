import chroma from "chroma-js";

/*
  Rationale:
  We want colors to context-dependent. This means there's really no such thing
  as "red" with a specific hex value. Instead, we want to be able to say we want
  a red that *stands out* from the background color by a certain amount. The properties
  of how to make a red stand out, and what "red" really means is defined by the theme.

  In the theme, the "red" would be defined as a "ramp" that specifies the boundaries
  of what's allowed for the color. However, this doesn't mean we'll always pick one of these
  colors. We'll pick a color that's on the plane between the ramp of the color you want and the
  ramp of the parent color.
*/

// ---

export class BaseColor {
  constructor(hex) {
    this.hex = hex;
  }

  alpha(a) {
    return chroma(this.hex)
      .alpha(a)
      .hex();
  }

  toString() {
    return this.hex;
  }
}

export default class Color extends BaseColor {
  constructor({ theme, bgColor, hex, ramp }) {
    super(hex);
    // TODO: consider making this private so there aren't two ways of getting a theme:
    // 1) From a color
    // 2) From a useContext(ThemeContext)
    // Also consider making `ThemeContext` only available internally to Huet
    this.theme = theme;
    this.bgColor = bgColor;
    this.ramp = ramp;
    this.lightness = getLightness(hex);
  }

  static fromTheme(theme) {
    const ramp = theme.ramps[theme.bgRamp];
    const hex = ramp(theme.bgRampValue).hex;
    return new Color({
      theme,
      bgColor: null,
      hex,
      ramp
    });
  }

  contrast(contrast = 100, ramp = this.theme.ramps.gray) {
    if (ramp.config.mode === "direct") {
      console.warn(
        'You should be using the "direct" method instead since the "contrast" parameter won\'t do anything here'
      );
      return this.direct(ramp);
    }

    const { theme } = this;

    const [min, max] = getMinMax(theme, ramp);
    const [bgMin, bgMax] = getMinMax(theme, this.ramp);

    // __0 _.5 __1
    const normalizedLightness = (this.lightness - bgMin) / (bgMax - bgMin);
    // __1 _.5 __1
    const contrastNormalizer =
      theme.rescaleContrastToGrayRange || ramp !== theme.ramps.gray
        ? Math.abs(0.5 - normalizedLightness) + 0.5
        : 1;
    const contrastRescale = (max - min) / 100;
    const midpoint = (min + max) / 2;
    const direction = this.lightness < midpoint ? 1 : -1;
    const colorContrastMinMax =
      ramp === theme.ramps.gray
        ? 1
        : this.lightness < midpoint
        ? theme.maxColorLightness / 100
        : 1 - theme.minColorLightness / 100;

    const contrastMultiplier =
      ramp === theme.ramps.gray || theme.contrastMultiplier < 1
        ? theme.contrastMultiplier
        : 1;

    const targetLightness =
      this.lightness +
      contrast *
        direction *
        contrastMultiplier *
        contrastNormalizer *
        colorContrastMinMax *
        contrastRescale;

    // Rescale targetLightness from ramp range to 0-1
    let scaleValue =
      (targetLightness - ramp.startL) / (ramp.endL - ramp.startL);

    let hex = ramp(scaleValue).hex;

    const [bgL, bgA, bgB] = chroma(this.hex).lab();
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
      bgColor: this,
      hex,
      ramp
    });
  }

  direct(ramp) {
    if (ramp.config.mode !== "direct") throw new Error("Not allowed");

    const { theme } = this;
    let hex = ramp(
      (this.lightness - theme.ramps.gray.startL) /
        (theme.ramps.gray.endL - theme.ramps.gray.startL)
    ).hex;
    hex = chroma
      .mix(this.hex, hex, Math.min(theme.contrastMultiplier, 1), "lab")
      .hex();

    return new Color({
      theme,
      bgColor: this,
      hex,
      ramp
    });
  }

  alpha(amount) {
    return chroma(this.hex)
      .alpha(amount * this.theme.contrastMultiplier)
      .hex();
  }
}

function getMinMax(theme, ramp) {
  if (ramp.config.isNeutral) {
    return [ramp.startL, ramp.endL];
  }

  const min = Math.max(ramp.startL, theme.ramps.gray.startL);
  const max = Math.min(ramp.endL, theme.ramps.gray.endL);
  return [min, max];
}

export function rampOrDefault(theme, ramp) {
  return ramp || theme.ramps.gray;
}

export function getLightness(color) {
  // Sometimes we get small negative numbers, so we clamp with Math.max
  return Math.max(0, chroma(color).get("lab.l"));
}
