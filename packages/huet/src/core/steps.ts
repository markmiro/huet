import chroma from "chroma-js";
import { fromOklab, lightness, luminance, mix, rgb, textEnd, toOklab } from "./color";

/*
  The solver behind explicit amounts: `huet-bg-25`, `huet-text-red-100`,
  `huet-bg/border-60` and the `--huet-<step>` variables. Each one is a step of
  some amount away from a parent surface, on the neutral ramp, toward a hue, or
  (for `white`) picked by the parent's position on the ramp.

  This reproduces the original `Color.contrast()` exactly for the ramps Huet
  classes use, so its colors and their tests carry over unchanged.
*/

/** A color, with the CIELAB lightness the `white` ramp reads. */
interface Shade {
  hex: string;
  L: number;
}

/** A background that further steps are taken from. */
export interface Surface extends Shade {
  /** This surface at full contrast. Contrast below 1 fades it toward `origin`. */
  readonly full: Shade;
  /** The root background that contrast below 1 fades toward. */
  readonly origin: string;
}

/** `gray` (the neutral ramp, the default), a hue, or `white`. */
export type StepRamp = "gray" | "red" | "yellow" | "green" | "blue" | "purple" | "white";

/** Where each hue's step aims by default, as a position on its dark → hue → light ramp. */
const defaultSignalLightness = { onLight: 0.49, onDark: 0.49 };
/** OKLab chroma distance from the neutral ramp below which a parent counts as neutral. */
const minTint = 0.004;
/** The `white` ramp's bands: light, then dark past 70% of the way up the ramp. */
const whiteClasses = [0, 0.7, 1];

const shadeOf = (lab: chroma.Color | [number, number, number]): Shade => {
  const values = Array.isArray(lab) ? lab : lab.lab();
  return { hex: chroma.lab(...values).hex(), L: values[0] };
};
/** A hex color as the solver stores it: through CIELAB and back. */
const shadeOfHex = (hex: string) => shadeOf(chroma(hex).lab());

/**
 * Travel along the same OKLab path, spacing strengths by equal CIE L* steps.
 * Raw OKLab interpolation crushes small steps near black, because OKLab's
 * lightness is steep there. L* is linear in luminance near black, so equal
 * strength steps look about equally far apart on either polarity.
 */
function mixSignal(background: string, target: string, amount: number) {
  if (amount === 0) return background;
  if (amount === 1) return target;
  const bgL = lightness(background), endL = lightness(target);
  if (Math.abs(endL - bgL) < 1e-10) return mix(background, target, amount);
  const lighter = endL > bgL;
  const desired = bgL + (endL - bgL) * amount;
  let low = 0, high = 1, best = background;
  let error = Math.abs(desired - bgL);
  // Select on the actual rounded sRGB path, retaining its hue/chroma scaling.
  for (let i = 0; i < 18; i++) {
    const middle = (low + high) / 2;
    const color = mix(background, target, middle);
    const value = lightness(color);
    const distance = Math.abs(value - desired);
    if (distance < error) { best = color; error = distance; }
    if (lighter ? value < desired : value > desired) low = middle;
    else high = middle;
  }
  return best;
}

/**
 * A fade in linear light keeps luminance ordering, so fading a parent and its
 * child by the same amount can't reverse their contrast polarity.
 */
function fade(origin: string, full: string, amount: number) {
  if (amount === 0) return origin;
  if (amount === 1) return full;
  const linear = (v: number) => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
  const gamma = (v: number) => v <= .0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - .055;
  const a = rgb(origin).map(linear), b = rgb(full).map(linear);
  return "#" + a.map((v, i) => Math.round(Math.max(0, Math.min(1,
    gamma(v + (b[i] - v) * amount))) * 255).toString(16).padStart(2, "0")).join("");
}

export interface StepOptions {
  /** The neutral ramp's colors, darkest first. */
  neutral: readonly string[];
  colorModel: string;
  /** Hue anchors. */
  colors: Readonly<Record<string, string>>;
  /** Scales every amount, from 0 to 2. */
  contrast?: number;
  /** Where hue steps aim on light and dark backgrounds. */
  signalLightness?: { onLight: number; onDark: number };
}

export function stepper({ neutral, colorModel, colors, contrast = 1, signalLightness = defaultSignalLightness }: StepOptions) {
  if (!Number.isFinite(contrast) || contrast < 0 || contrast > 2)
    throw new RangeError("contrast must be between 0 and 2");
  const dark = neutral[0], light = neutral[neutral.length - 1];
  const neutralScale = chroma.scale([...neutral]).mode(colorModel as chroma.InterpolationMode).correctLightness();
  const samples = Array.from({ length: 257 }, (_, i) => {
    const shade = shadeOf(neutralScale(i / 256));
    return { ...shade, lightness: lightness(shade.hex), oklab: toOklab(shade.hex) };
  });
  const [darkEnd, lightEnd] = [samples[0], samples[256]].sort((a, b) => a.lightness - b.lightness);
  const ends = [samples[0].hex, samples[256].hex].sort((a, b) => luminance(a) - luminance(b));
  // CIELAB lightness of the neutral ramp's ends, which place a color on it
  const startL = Math.max(0, neutralScale(0).get("lab.l"));
  const endL = Math.max(0, neutralScale(1).get("lab.l"));
  const white = chroma.scale([light, dark]).mode("lab").classes(whiteClasses);
  const anchors = new Map<string, string>();
  /** The hue's full-strength target on its ramp, for steps toward the light or dark end. */
  const anchorOf = (hue: string, lighter: boolean) => {
    const key = `${hue}:${lighter}`;
    let anchor = anchors.get(key);
    if (!anchor) {
      if (!(hue in colors)) throw new TypeError(`Unknown ramp: ${hue}`);
      const ramp = chroma.scale([dark, colors[hue], light]).mode("lab").correctLightness();
      const position = lighter ? signalLightness.onDark : signalLightness.onLight;
      anchors.set(key, (anchor = shadeOf(ramp(position)).hex));
    }
    return anchor;
  };

  /** Whether a parent is off the neutral ramp, such as a blue surface. */
  const isTinted = (parent: Shade) => {
    const bgL = lightness(parent.hex);
    let nearest = samples[0];
    for (const sample of samples)
      if (Math.abs(sample.lightness - bgL) < Math.abs(nearest.lightness - bgL)) nearest = sample;
    const [, a, b] = toOklab(parent.hex);
    // Backgrounds sampled from the theme's own ramp sit within 0.002 of these samples
    return Math.hypot(a - nearest.oklab[1], b - nearest.oklab[2]) >= minTint;
  };

  /**
   * Equal L* steps along the neutral ramp toward the end text reads better
   * against. On a colored parent, the steps keep its tint, fading it out by
   * the end of the ramp, so gray on a blue card is a deeper or paler blue.
   */
  const neutralStep = (parent: Shade, amount: number): Shade => {
    const lighter = textEnd(parent.hex, darkEnd.hex, lightEnd.hex) === lightEnd.hex;
    const bgL = lightness(parent.hex);
    // Strength spans this background's available range in equal L* steps.
    const available = Math.abs((lighter ? lightEnd : darkEnd).lightness - bgL);
    if (available <= 1e-10) return parent;
    const target = available * amount;
    let best = samples[0], bestDistance = -1;
    let chosen: (typeof samples)[number] | undefined, chosenDistance = Infinity;
    for (const sample of samples) {
      if (lighter ? sample.lightness < bgL : sample.lightness > bgL) continue;
      const distance = Math.abs(sample.lightness - bgL);
      if (distance > bestDistance) [best, bestDistance] = [sample, distance];
      if (distance >= target && distance < chosenDistance) [chosen, chosenDistance] = [sample, distance];
    }
    const step = chosen ?? best;
    if (!isTinted(parent)) return { hex: step.hex, L: step.L };
    // Keep the parent's color most of the way, then blend into the ramp's own
    // color (its end at 100), like the role colors on a colored surface.
    const keep = 1 - amount ** 3;
    const [, a, b] = toOklab(parent.hex);
    const [L, rampA, rampB] = step.oklab;
    return shadeOfHex(fromOklab([L, rampA + (a - rampA) * keep, rampB + (b - rampB) * keep]));
  };

  /** A step toward the hue's anchor, on the same side as the neutral ramp's text end. */
  const hueStep = (parent: Shade, hue: string, amount: number): Shade => {
    const [darkHex, lightHex] = ends;
    const lighter = textEnd(parent.hex, darkHex, lightHex) === lightHex;
    const [anchorL, a, b] = toOklab(anchorOf(hue, lighter));
    const low = toOklab(darkHex)[0], high = toOklab(lightHex)[0];
    if (Math.abs(high - low) < 1e-7) return parent;
    const [bgL] = toOklab(parent.hex);
    const fraction = Math.max(0, Math.min(1,
      lighter ? (anchorL - low) / (high - low) : (high - anchorL) / (high - low)));
    // The anchor is relative to the ends: at black or white it's the anchor
    // itself, and in between its distance scales to the room left on that side.
    const endOklabL = lighter ? high : low;
    let targetL = bgL + (endOklabL - bgL) * fraction;
    let target = fromOklab([targetL, a, b]);
    const onSide = (hex: string) => lighter
      ? luminance(hex) >= luminance(parent.hex)
      : luminance(hex) <= luminance(parent.hex);
    // Custom anchors can change luminance at equal OKLab lightness.
    // Move toward the shared end rather than reversing one hue.
    for (let i = 0; i < 24 && !onSide(target); i++) {
      targetL = (targetL + endOklabL) / 2;
      target = fromOklab([targetL, a, b]);
    }
    if (!onSide(target)) target = parent.hex;
    let hex = mixSignal(parent.hex, target, amount);
    if (!onSide(hex)) hex = parent.hex;
    return shadeOfHex(hex);
  };

  /** The `white` ramp: a band picked by the parent's position on the neutral ramp. */
  const whiteStep = (parent: Shade): Shade => shadeOf(white((parent.L - startL) / (endL - startL)));

  /** A step at full strength scale `multiplier`. */
  const solve = (parent: Shade, amount: number, ramp: StepRamp, multiplier: number): Shade => {
    if (ramp === "white") return whiteStep(parent);
    const fraction = Math.max(0, Math.min(1, (amount / 100) * multiplier));
    if (fraction === 0) return parent;
    return ramp === "gray" ? neutralStep(parent, fraction) : hueStep(parent, ramp, fraction);
  };

  const surfaceOf = (hex: string): Surface => {
    const shade = shadeOfHex(hex);
    return { ...shade, full: shade, origin: shade.hex };
  };

  /** `full` (a color at full contrast) as shown at the theme's contrast. */
  const shown = (parent: Surface, full: string) =>
    contrast >= 1 ? full : fade(parent.origin, full, contrast);

  return {
    /** A background to take steps from, such as the page. */
    surfaceOf,
    shown,
    /** A surface whose full-contrast color comes from elsewhere, such as `huet-surface-*`. */
    derive(parent: Surface, full: string): Surface {
      const fullShade = shadeOfHex(full);
      if (contrast >= 1) return { ...fullShade, full: fullShade, origin: parent.origin };
      return { ...shadeOfHex(shown(parent, full)), full: fullShade, origin: parent.origin };
    },
    /** The color `amount` (0–100) away from `parent`, scaled by the theme's contrast. */
    step(parent: Surface, amount: number, ramp: StepRamp = "gray"): Surface {
      if (contrast >= 1) {
        const shade = solve(parent, amount, ramp, contrast);
        return { ...shade, full: shade, origin: parent.origin };
      }
      // Below 1, step at full contrast, then fade toward the root background.
      // Parents and children fade together, so they keep their light/dark sides.
      const full = solve(parent.full, amount, ramp, 1);
      return { ...shadeOfHex(fade(parent.origin, full.hex, contrast)), full, origin: parent.origin };
    },
  };
}

export type Stepper = ReturnType<typeof stepper>;
