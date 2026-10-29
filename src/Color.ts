import chroma from "chroma-js";
import { fromOklab, toOklab, luminance } from "./core/color";

import type { Lab, Ramp } from "./colorModel";
import Theme from "./Theme";
import Cache from "./private/cache";
import { mixSignal } from "./private/mixSignal";
import { fadeColor } from "./private/fadeColor";

const cache = new Cache();
const enabledThemes = new WeakMap<Theme, Theme>();
const enabledColors = new WeakMap<Color, { color: Color; origin: string }>();
const rampSamples = new WeakMap<Ramp, { lab: Lab; luminance: number }[]>();
function samplesFor(ramp: Ramp) {
  let samples = rampSamples.get(ramp);
  if (!samples) {
    samples = Array.from({ length: 257 }, (_, i) => {
      const lab = ramp(i / 256);
      return { lab, luminance: chroma(chroma.lab(...lab).hex()).luminance() };
    });
    rampSamples.set(ramp, samples);
  }
  return samples;
}
if (typeof window !== "undefined") {
  window.cache = cache;
}

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
  lab: Lab;
  hex: string;

  constructor(lab: Lab) {
    if (!lab) {
      throw new Error("`lab` is required");
    }
    this.lab = lab;
    this.hex = chroma.lab(...this.lab).hex();
  }

  alpha(a: number) {
    // TODO: maybe just do string ops to do #RRGGBBAA
    return chroma(this.hex).alpha(a).hex();
  }

  toString() {
    return this.hex;
  }
}

export interface ColorOptions {
  theme: Theme;
  bgColor?: Color | null;
  lab: Lab;
  ramp?: Ramp | null;
  baseRamp?: Ramp | null;
}

export default class Color extends BaseColor {
  theme: Theme;
  bgColor: Color | null;
  ramp: Ramp | null;
  baseRamp: Ramp;
  lightness: number;

  constructor({
    theme,
    bgColor = null,
    lab,
    ramp = null,
    baseRamp = null,
  }: ColorOptions) {
    super(lab);
    if (!theme) {
      throw new Error("`theme` is required");
    }

    if (
      baseRamp &&
      (baseRamp.startL === undefined || baseRamp.endL === undefined)
    ) {
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
    this.lightness = lab[0];
  }

  // TODO: consider removing `bgRamp` and `bgRampValue from theme
  static fromTheme(theme: Theme) {
    if (!(theme instanceof Theme)) {
      throw new TypeError(
        'Need to give me a Theme instance, not a "theme config"',
      );
    }
    const ramp = theme.ramps[theme.bgRamp];
    const lab = ramp(theme.bgRampValue);
    return new Color({
      theme,
      bgColor: null,
      lab,
      ramp,
      baseRamp: ramp,
    });
  }

  contrast(contrastAmount = 100, ramp: Ramp = this.baseRamp): Color {
    if (this.theme.contrastMultiplier >= 0 && this.theme.contrastMultiplier < 1) {
      return cache.at([this, "fadeContrast", contrastAmount, ramp], () =>
        this.fadeEnabled(ramp, (color, mapped) => color.contrast(contrastAmount, mapped)));
    }
    if (ramp.config.mode === "direct") {
      return this.direct(ramp);
    }

    // Two parent colors (in hex) may be the same, but we still gotta compare the base ramps, hence caching on `this.baseRamp`
    return cache.at([this.hex, this.baseRamp, contrastAmount, ramp], () => {
      const { theme } = this;
      const isRootBaseRamp = ramp === theme.ramps[theme.bgRamp];

      // Neutral contrast must be measured after gamut mapping, not inferred
      // from which side of LAB 50 the background occupies. Signal ramps use
      // the shared-polarity contrast solver below.
      if (
        isRootBaseRamp &&
        theme.rescaleContrastToGrayRange &&
        contrastAmount >= 0
      ) {
        const amount = Math.max(0, Math.min(1, contrastAmount / 100 * theme.contrastMultiplier));
        if (amount === 0) return this;
        let best = ramp(0),
          bestRatio = 0;
        let chosen: Lab | undefined,
          chosenRatio = Infinity;
        const samples = samplesFor(ramp);
        const bgLuminance = chroma(this.hex).luminance();
        const endpointRatio = (value: number) =>
          (Math.max(bgLuminance, value) + 0.05) / (Math.min(bgLuminance, value) + 0.05);
        const low = Math.min(samples[0].luminance, samples[samples.length - 1].luminance);
        const high = Math.max(samples[0].luminance, samples[samples.length - 1].luminance);
        const lighter = endpointRatio(high) > endpointRatio(low);
        // Strength spans this background's available range. Fixed targets
        // (3, 4.5, 21) exhausted middle-tone ramps long before strength 100.
        const available = Math.max(endpointRatio(low), endpointRatio(high));
        if (available <= 1 + 1e-10) return this;
        const target = available ** amount;
        // Choose polarity once for the background, not again for each amount.
        // Otherwise nearest-ratio selection can alternate black/light/dark.
        for (const { lab, luminance } of samples) {
          if (lighter ? luminance < bgLuminance : luminance > bgLuminance) continue;
          const ratio =
            (Math.max(bgLuminance, luminance) + 0.05) /
            (Math.min(bgLuminance, luminance) + 0.05);
          if (ratio > bestRatio) {
            best = lab;
            bestRatio = ratio;
          }
          if (ratio >= target && ratio < chosenRatio) {
            chosen = lab;
            chosenRatio = ratio;
          }
        }
        return new Color({ theme, bgColor: this, lab: chosen ?? best, ramp });
      }

      if (ramp.config.mode === "furthest" && theme.rescaleContrastToGrayRange && contrastAmount >= 0) {
        const amount = Math.max(0, Math.min(1, contrastAmount / 100 * theme.contrastMultiplier));
        if (amount === 0) return this;
        const root = theme.ramps[theme.bgRamp];
        const rootEnds = [0, 1].map(n => chroma.lab(...root(n)).hex())
          .sort((a, b) => luminance(a) - luminance(b));
        const lighter = chroma.contrast(this.hex, rootEnds[1]) >
          chroma.contrast(this.hex, rootEnds[0]);
        const ends = [0, 1].map(n => chroma.lab(...ramp(n)).hex())
          .sort((a, b) => luminance(a) - luminance(b));
        const target = ends[lighter ? 1 : 0];
        // A neutral overlay is still relative to the actual colored surface.
        // Sampling the gray ramp directly discards its hue even at amount 0.
        const onSide = lighter
          ? luminance(target) >= luminance(this.hex)
          : luminance(target) <= luminance(this.hex);
        const hex = onSide ? mixSignal(this.hex, target, amount) : this.hex;
        return new Color({ theme, bgColor: this, lab: chroma(hex).lab(), ramp });
      }

      if (ramp.config.mode === "signal" && theme.rescaleContrastToGrayRange && contrastAmount >= 0) {
        const amount = Math.max(0, Math.min(1, contrastAmount / 100 * theme.contrastMultiplier));
        if (amount === 0) return this;
        const root = theme.ramps[theme.bgRamp];
        const ends = [0, 1].map(n => chroma.lab(...root(n)).hex())
          .sort((a, b) => luminance(a) - luminance(b));
        const [dark, light] = ends;
        const lighter = chroma.contrast(this.hex, light) > chroma.contrast(this.hex, dark);
        const position = lighter ? theme.endSignalLightness : theme.startSignalLightness;
        const anchor = chroma.lab(...ramp(position)).hex();
        const [anchorL, a, b] = toOklab(anchor);
        const low = toOklab(dark)[0], high = toOklab(light)[0];
        if (Math.abs(high - low) < 1e-7) return this;
        const [bgL] = toOklab(this.hex);
        const fraction = Math.max(0, Math.min(1,
          lighter ? (anchorL - low) / (high - low) : (high - anchorL) / (high - low)));
        // The configured signal is an endpoint-relative anchor, not an
        // absolute lightness offset and not a mandatory WCAG text ratio.
        // At black/white this reproduces the configured anchor. In between,
        // scale its lightness distance to the remaining room on the chosen side.
        const endL = lighter ? high : low;
        let targetL = bgL + (endL - bgL) * fraction;
        let target = fromOklab([targetL, a, b]);
        const onSide = (hex: string) => lighter
          ? luminance(hex) >= luminance(this.hex)
          : luminance(hex) <= luminance(this.hex);
        // Custom anchors can change luminance at equal OKLab lightness.
        // Move toward the shared endpoint rather than reversing one hue.
        for (let i = 0; i < 24 && !onSide(target); i++) {
          targetL = (targetL + endL) / 2;
          target = fromOklab([targetL, a, b]);
        }
        if (!onSide(target)) target = this.hex;
        // All channels travel together, spaced by proportional contrast
        // so low strengths do not collapse into black.
        let hex = mixSignal(this.hex, target, amount);
        if (theme.rescaleSaturationToGrayRange) {
          const [l, x, y] = toOklab(hex);
          const [, bx, by] = toOklab(this.hex);
          hex = fromOklab([l, bx + (x - bx) * amount, by + (y - by) * amount]);
        }
        if (!onSide(hex)) hex = this.hex;
        return new Color({ theme, bgColor: this, lab: chroma(hex).lab(), ramp });
      }

      const [min, max] = this._getMinMax(ramp);
      const [bgMin, bgMax] = this._getMinMax(this.ramp);
      const normalizedLightness = (this.lightness - bgMin) / (bgMax - bgMin); // __0 _.5 __1

      // BASICS ---

      const basicMultiplier = (() => {
        const midpoint = (min + max) / 2;
        const direction = this.lightness < midpoint ? 1 : -1;
        const contrastRescale = (max - min) / 100;
        return direction * contrastRescale;
      })();

      // ADVANCED ---

      const advancedMultiplier = (() => {
        let contrastMultiplier = 1;
        let contrastNormalizer = 1;
        let colorContrastMinMax = 1;

        if (isRootBaseRamp || theme.contrastMultiplier < 1) {
          contrastMultiplier = theme.contrastMultiplier;
        }

        if (theme.rescaleContrastToGrayRange && isRootBaseRamp) {
          contrastNormalizer = Math.abs(normalizedLightness - 0.5) + 0.5; // __1 _.5 __1
        }

        if (!isRootBaseRamp) {
          const midpoint = (min + max) / 2;
          colorContrastMinMax =
            this.lightness < midpoint
              ? theme.endSignalLightness
              : 1 - theme.startSignalLightness;
        }

        return contrastMultiplier * contrastNormalizer * colorContrastMinMax;
      })();

      // PUT IT ALL TOGETHER ---

      const targetLightness =
        this.lightness + contrastAmount * basicMultiplier * advancedMultiplier;

      // Rescale targetLightness from ramp range to 0-1
      const scaleValue =
        (targetLightness - (ramp.startL ?? Number.NaN)) /
        ((ramp.endL ?? Number.NaN) - (ramp.startL ?? Number.NaN));

      const [bgL, bgA, bgB] = this.lab;
      const [fgL, fgA, fgB] = ramp(scaleValue);

      const abContrastMultiplier =
        isRootBaseRamp || theme.contrastMultiplier > 1
          ? 1
          : theme.contrastMultiplier;

      // `ab` in abContrast refers to the A and B axes of the LAB color space
      const abContrast =
        (theme.rescaleSaturationToGrayRange ? contrastAmount / 100 : 1) *
        abContrastMultiplier;

      const l = bgL + (fgL - bgL) * 1; // Read this as just `fgL`
      const a = bgA + (fgA - bgA) * abContrast;
      const b = bgB + (fgB - bgB) * abContrast;

      const finalLab: Lab = [l, a, b];

      return new Color({
        theme,
        bgColor: this,
        lab: finalLab,
        ramp,
      });
    });
  }

  direct(ramp: Ramp): Color {
    if (this.theme.contrastMultiplier >= 0 && this.theme.contrastMultiplier < 1) {
      return cache.at([this, "fadeDirect", ramp], () =>
        this.fadeEnabled(ramp, (color, mapped) => color.direct(mapped)));
    }
    return cache.at([this.hex, ramp], () => {
      if (ramp.config.mode !== "direct") throw new Error("Not allowed");

      const { theme, baseRamp } = this;
      const [fgL, fgA, fgB] = ramp(
        (this.lightness - (baseRamp.startL ?? Number.NaN)) /
          ((baseRamp.endL ?? Number.NaN) - (baseRamp.startL ?? Number.NaN)),
      );
      const [bgL, bgA, bgB] = this.lab;
      const mix = Math.min(theme.contrastMultiplier, 1);

      const lab: Lab = [
        bgL + (fgL - bgL) * mix,
        bgA + (fgA - bgA) * mix,
        bgB + (fgB - bgB) * mix,
      ];

      return new Color({
        theme,
        bgColor: this,
        lab,
        ramp,
      });
    });
  }

  private fadeEnabled(ramp: Ramp, resolve: (color: Color, mapped: Ramp) => Color): Color {
    let enabledTheme = enabledThemes.get(this.theme);
    if (!enabledTheme) {
      enabledTheme = new Theme({ ...this.theme.config, contrastMultiplier: 1 });
      enabledThemes.set(this.theme, enabledTheme);
    }
    const mapRamp = (value: Ramp | null): Ramp | null => {
      if (!value) return null;
      const key = Object.keys(this.theme.ramps).find(key => this.theme.ramps[key] === value);
      return key === undefined ? value : enabledTheme!.ramps[key];
    };
    const state = enabledColors.get(this) ?? {
      color: new Color({
        theme: enabledTheme, lab: this.lab,
        ramp: mapRamp(this.ramp), baseRamp: mapRamp(this.baseRamp),
      }),
      origin: this.hex,
    };
    const enabled = resolve(state.color, mapRamp(ramp)!);
    const hex = fadeColor(state.origin, enabled.hex, this.theme.contrastMultiplier);
    const result = new Color({ theme: this.theme, bgColor: this, lab: chroma(hex).lab(), ramp });
    // Even equal rounded colors need distinct reference states: their children
    // can have different enabled colors. Never key these by displayed hex.
    enabledColors.set(result, { color: enabled, origin: state.origin });
    return result;
  }

  base(ramp: Ramp) {
    const result = new Color({
      theme: this.theme,
      bgColor: this.bgColor,
      lab: this.lab,
      ramp: this.ramp,
      baseRamp: ramp,
    });
    const state = enabledColors.get(this);
    if (state) {
      const key = Object.keys(this.theme.ramps).find(key => this.theme.ramps[key] === ramp);
      const mapped = key === undefined ? ramp : state.color.theme.ramps[key];
      enabledColors.set(result, { color: state.color.base(mapped), origin: state.origin });
    }
    return result;
  }

  override alpha(amount: number) {
    return chroma
      .lab(...this.lab)
      .alpha(amount * this.theme.contrastMultiplier)
      .hex();
  }

  shadowColor(alpha = 1) {
    return chroma
      .lab(...this.theme.ramps.gray(0))
      .alpha(this.theme.contrastMultiplier * alpha);
  }

  _getMinMax(ramp: Ramp | null): [number, number] {
    const rootBaseRamp = this.theme.ramps[this.theme.bgRamp];
    // We're not requiring a ramp because we want the `contrast` method to work
    // even if the parent Color instance has just a hex and a theme. This allows us to
    // use our ramps on top of any background color.
    if (!ramp || ramp.config.mode === "direct") {
      return [
        rootBaseRamp.startL ?? Number.NaN,
        rootBaseRamp.endL ?? Number.NaN,
      ];
    }

    const min = Math.max(
      ramp.startL ?? Number.NaN,
      rootBaseRamp.startL ?? Number.NaN,
    );
    const max = Math.min(
      ramp.endL ?? Number.NaN,
      rootBaseRamp.endL ?? Number.NaN,
    );
    return [min, max];
  }
}

export function getLightness(color: chroma.Color | string) {
  // Sometimes we get small negative numbers, so we clamp with Math.max
  return Math.max(0, chroma(color).get("lab.l"));
}
