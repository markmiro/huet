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

function setAtPath(map, path, value) {
  let running = map;
  for (let i = 0; i < path.length; i++) {
    const key = path[i];
    if (i === path.length - 1) {
      running.set(key, value);
    } else {
      running.set(key, new Map());
      running = running.get(key);
    }
  }
}

function getAtPath(map, path) {
  let running = map;
  for (let i = 0; i < path.length; i++) {
    const key = path[i];
    if (!running.has(key)) return;
    running = running.get(key);
  }
  return running;
}

window.cached = new Map();
window.cachedSize = 0;
window.cacheMiss = 0;
window.cacheHit = 0;
const cache = {
  set(path, value) {
    setAtPath(window.cached, path, value);
    window.cachedSize++;

    if (window.cached.size > 150) {
      const iter = window.cached.keys();
      for (let i = 0; i < 20; i++) {
        window.cached.delete(iter.next().value);
      }
    }
  },
  get(path) {
    return getAtPath(window.cached, path);
  }
};

export class BaseColor {
  constructor(lab) {
    if (!lab) {
      throw new Error("`lab` is required");
    }
    this.lab = lab;
  }

  alpha(a) {
    return chroma
      .lab(...this.lab)
      .alpha(a)
      .hex();
  }

  toString() {
    return chroma.lab(...this.lab).hex();
  }
}

export default class Color extends BaseColor {
  constructor({ theme, bgColor = null, lab, ramp = null, baseRamp = null }) {
    super(lab);
    if (!theme) {
      throw new Error("`theme` is required");
    }

    if (baseRamp && (!("startL" in baseRamp) || !("endL" in baseRamp))) {
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
  static fromTheme(theme) {
    if (!(theme instanceof Theme)) {
      throw new Error('Need to give me a Theme instance, not a "theme config"');
    }
    const ramp = theme.ramps[theme.bgRamp];
    const lab = ramp(theme.bgRampValue);
    return new Color({
      theme,
      bgColor: null,
      lab,
      ramp,
      baseRamp: ramp
    });
  }

  contrast(contrastAmount = 100, ramp = this.baseRamp) {
    if (ramp.config.mode === "direct") {
      return this.direct(ramp);
    }

    const cachedColor = cache.get([this.lab, contrastAmount, ramp]);

    if (cachedColor) {
      window.cacheHit++;
      return cachedColor;
    } else {
      window.cacheMiss++;
    }

    const { theme } = this;
    const isRootBaseRamp = ramp === theme.ramps[theme.bgRamp];

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

      if (
        (theme.rescaleContrastToGrayRange && isRootBaseRamp) ||
        (theme.rescaleContrastToSignalRange && !isRootBaseRamp)
      ) {
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

    let targetLightness =
      this.lightness + contrastAmount * basicMultiplier * advancedMultiplier;

    // Rescale targetLightness from ramp range to 0-1
    let scaleValue =
      (targetLightness - ramp.startL) / (ramp.endL - ramp.startL);

    const [bgL, bgA, bgB] = this.lab;
    const [fgL, fgA, fgB] = ramp(scaleValue);

    const abContrastMultiplier =
      isRootBaseRamp || theme.contrastMultiplier > 1
        ? 1
        : theme.contrastMultiplier;

    const abSaturationMultiplier =
      isRootBaseRamp || theme.signalSaturationMultiplier > 1
        ? 1
        : theme.signalSaturationMultiplier;

    // `ab` in abContrast refers to the A and B axes of the LAB color space
    const abContrast =
      (theme.rescaleSaturationToGrayRange ? contrastAmount / 100 : 1) *
      abContrastMultiplier *
      abSaturationMultiplier;

    const signalSaturationMultiplier =
      theme.signalSaturationMultiplier > 1 && !isRootBaseRamp
        ? Math.max(
            1,
            theme.signalSaturationMultiplier *
              (contrastAmount / 100) *
              Math.min(theme.contrastMultiplier, 1)
          )
        : 1;

    const l = bgL + (fgL - bgL) * 1; // Read this as just `fgL`
    const a = (bgA + (fgA - bgA) * abContrast) * signalSaturationMultiplier;
    const b = (bgB + (fgB - bgB) * abContrast) * signalSaturationMultiplier;

    const finalLab = [l, a, b];

    const color = new Color({
      theme,
      bgColor: this,
      lab: finalLab,
      ramp
    });

    cache.set([this.lab, contrastAmount, ramp], color);

    return color;
  }

  direct(ramp) {
    if (ramp.config.mode !== "direct") throw new Error("Not allowed");

    const { theme, baseRamp } = this;
    const [fgL, fgA, fgB] = ramp(
      (this.lightness - baseRamp.startL) / (baseRamp.endL - baseRamp.startL)
    );
    const [bgL, bgA, bgB] = this.lab;
    const mix = Math.min(theme.contrastMultiplier, 1);

    const lab = [
      bgL + (fgL - bgL) * mix,
      bgA + (fgA - bgA) * mix,
      bgB + (fgB - bgB) * mix
    ];

    return new Color({
      theme,
      bgColor: this,
      lab,
      ramp
    });
  }

  base(ramp) {
    return new Color({
      theme: this.theme,
      bgColor: this.bgColor,
      lab: this.lab,
      ramp: this.ramp,
      baseRamp: ramp
    });
  }

  alpha(amount) {
    return chroma
      .lab(...this.lab)
      .alpha(amount * this.theme.contrastMultiplier)
      .hex();
  }

  shadowColor(alpha = 1) {
    return chroma
      .lab(this.theme.ramps.gray(0))
      .alpha(this.theme.contrastMultiplier * alpha);
  }

  _getMinMax(ramp) {
    const rootBaseRamp = this.theme.ramps[this.theme.bgRamp];
    // We're not requiring a ramp because we want the `contrast` method to work
    // even if the parent Color instance has just a hex and a theme. This allows us to
    // use our ramps on top of any background color.
    if (!ramp || ramp.config.mode === "direct") {
      return [rootBaseRamp.startL, rootBaseRamp.endL];
    }

    // if (ramp === rootBaseRamp) {
    //   return [ramp.startL, ramp.endL];
    // }

    const min = Math.max(ramp.startL, rootBaseRamp.startL);
    const max = Math.min(ramp.endL, rootBaseRamp.endL);
    return [min, max];
  }
}

export function getLightness(color) {
  // Sometimes we get small negative numbers, so we clamp with Math.max
  return Math.max(0, chroma(color).get("lab.l"));
}
