import chroma from "chroma-js";
import Theme from "./Theme";

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
    if (!hex) {
      throw new Error("`hex` is required");
    }
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
  constructor({ theme, bgColor = null, hex, ramp = null, baseRamp = null }) {
    super(hex);
    if (!theme) {
      throw new Error("`theme` is required");
    }

    if (baseRamp && (!"startL" in baseRamp || !"endL" in baseRamp)) {
      throw new Error("`baseRamp` can't be a direct ramp");
    } else if (
      !baseRamp &&
      !(bgColor && !bgColor.baseRamp) &&
      !theme.ramps.gray
    ) {
      throw new Error("No baseRamp");
    }
    // TODO: consider making this private so there aren't two ways of getting a theme:
    // 1) From a color
    // 2) From a useContext(ThemeContext)
    // Also consider making `ThemeContext` only available internally to Huet
    this.theme = theme;
    this.bgColor = bgColor;
    this.ramp = ramp;
    this.baseRamp =
      baseRamp || (bgColor && bgColor.baseRamp) || theme.ramps.gray;
    this.lightness = getLightness(hex);
  }

  // TODO: consider removing `bgRamp` and `bgRampValue from theme
  static fromTheme(theme) {
    if (!(theme instanceof Theme)) {
      throw new Error('Need to give me a Theme instance, not a "theme config"');
    }
    const ramp = theme.ramps[theme.bgRamp];
    const hex = ramp(theme.bgRampValue).hex;
    return new Color({
      theme,
      bgColor: null,
      hex,
      ramp,
      baseRamp: ramp
    });
  }

  contrast(contrastAmount = 100, ramp = this.baseRamp) {
    if (ramp.config.mode === "direct") {
      console.warn(
        'You should be using the "direct" method instead since the "contrast" parameter won\'t do anything here'
      );
      return this.direct(ramp);
    }

    const { theme } = this;
    const baseRamp = this.bgColor ? this.bgColor.baseRamp : theme.ramps.gray;

    const [min, max] = this._getMinMax(ramp);
    const [bgMin, bgMax] = this._getMinMax(this.ramp);

    // __0 _.5 __1
    const normalizedLightness = (this.lightness - bgMin) / (bgMax - bgMin);
    // __1 _.5 __1
    const contrastNormalizer =
      theme.rescaleContrastToGrayRange || ramp !== baseRamp
        ? Math.abs(0.5 - normalizedLightness) + 0.5
        : 1;
    const contrastRescale = (max - min) / 100;
    const midpoint = (min + max) / 2;
    const direction = this.lightness < midpoint ? 1 : -1;
    const colorContrastMinMax =
      ramp === baseRamp
        ? 1
        : this.lightness < midpoint
        ? theme.maxColorLightness / 100
        : 1 - theme.minColorLightness / 100;

    const contrastMultiplier =
      ramp === baseRamp || theme.contrastMultiplier < 1
        ? theme.contrastMultiplier
        : 1;

    const targetLightness =
      this.lightness +
      contrastAmount *
        direction *
        contrastMultiplier *
        contrastNormalizer *
        colorContrastMinMax *
        contrastRescale;

    // Rescale targetLightness from ramp range to 0-1
    let scaleValue =
      (targetLightness - ramp.startL) / (ramp.endL - ramp.startL);

    let hex = ramp(scaleValue).hex;

    /*
    TODO:
    The problem with abContrast is that sometimes the starting differenence between fgAB and bgAB
    is small and sometimes it's large. What we'd like to do is to adjust by just the amount where there is
    a difference. The problem, though is figuring this out what the maxiumum possible AB difference could be
    and normalize to that.

    Most ramps start at the gray dark value, then shoot out to their "perfect" color value before
    coming back into the gray light values.

    The "middle" where there is the most contrast between the "gray" and the colored ramp is based on
    where that "perfect" color is in it's own ramp. It might be 50% between the dark gray and light gray.
    It might be 90% between dark gray and light gray.

    So to figure this out, we'd need to get the scale value of the "perfect" color. This would be our midpoint.
    We'd probably want to calculate this value as part of the startL, endL calculations.

    This also means we'd probably want to limit ramps to just 3 colors unless they're direct ramps. We might even
    want to forget about the concept of ramps altogether too. Or, we'd want to allow a user's theme to range from
    just using ramps directly to being completely "managed". Managed mode will effectively only allow you to set the hues
    you want to use and the min and max lightness of the colors.

    Maybe we can compare the distance between the AB of both fg and bg and compare the L between them too.
    We want to do our fancy math when the difference between the AB stuff is bigger than that of the L value since
    this would mean that the the AB difference is too high for the desired contrast

    We might want to keep the min and max color lightness set to the same value and be the average or mean
    lightness of all "perfect" color lightnesses.
    */
    const [bgL, bgA, bgB] = chroma(this.hex).lab();
    const [fgL, fgA, fgB] = chroma(hex).lab();
    // const abDelta = Math.sqrt(Math.pow(bgA - fgA, 2) + Math.pow(bgB - fgB, 2));
    // const lDelta = Math.abs(bgL - fgL);
    const colorContrastNormalizer = Math.abs(0.5 - normalizedLightness) * 2;
    // `ab` in abContrast refers to the A and B axes of the LAB color space
    const abContrast =
      theme.contrastMultiplier < 1
        ? theme.contrastMultiplier
        : (colorContrastNormalizer + contrastAmount) / 100;
    hex = chroma
      .lab(
        bgL + (fgL - bgL) * 1, // Read this as just `fgL`
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

    const { theme, baseRamp } = this;
    let hex = ramp(
      (this.lightness - baseRamp.startL) / (baseRamp.endL - baseRamp.startL)
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

  base(ramp) {
    return new Color({
      theme: this.theme,
      bgColor: this.bgColor,
      hex: this.hex,
      ramp: this.ramp,
      baseRamp: ramp
    });
  }

  alpha(amount) {
    return chroma(this.hex)
      .alpha(amount * this.theme.contrastMultiplier)
      .hex();
  }

  _getMinMax(ramp) {
    const { baseRamp } = this;
    // We're not requiring a ramp because we want the `contrast` method to work
    // even if the parent Color instance has just a hex and a theme. This allows us to
    // use our ramps on top of any background color.
    if (!ramp || ramp.config.mode === "direct") {
      return [baseRamp.startL, baseRamp.endL];
    }

    if (ramp.config.isNeutral) {
      return [ramp.startL, ramp.endL];
    }

    const min = Math.max(ramp.startL, baseRamp.startL);
    const max = Math.min(ramp.endL, baseRamp.endL);
    return [min, max];
  }
}

export function getLightness(color) {
  // Sometimes we get small negative numbers, so we clamp with Math.max
  return Math.max(0, chroma(color).get("lab.l"));
}
