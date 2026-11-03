import { fromLightness, fromOklab, lightness, toOklab } from "../../../packages/huet/src/core/color";

/*
  Fur for one element, drawn on a 2D canvas behind its label, in the color
  set by the element's `--fur-color`: a little darker in the shadows and
  between hairs, lighter where the light catches the tips.

  Cost: an element is a cached frame until it's hovered. Only the hovered
  element animates, so the live budget is one element at a time.
*/

/** How far, in CSS px, the fur can reach past the element's box, at a `--fur-scale` of 1. */
const halo = 32;
/** Lightness steps in the palette, and in the sheen's. */
const levels = 24;
const sheenLevels = 4;
/** Curves for the poof's rise and fall, from 0 to 1. Some overshoot, then come back. */
export const eases = {
  linear: (t: number) => t,
  /** Speeds up steadily, like something dropping. */
  gravity: (t: number) => t * t,
  "ease-in": (t: number) => t ** 3,
  "ease-out": (t: number) => 1 - (1 - t) ** 3,
  "ease-in-out": (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2),
  "back-out": (t: number) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2,
  "elastic-out": (t: number) =>
    t <= 0 ? 0 : t >= 1 ? 1 : 2 ** (-10 * t) * Math.sin(((10 * t - 0.75) * 2 * Math.PI) / 3) + 1,
};
export type Ease = keyof typeof eases;
/** Where along `ease` (0–1) the curve first reaches `f`, by bisection. */
function easeInverse(ease: (t: number) => number, f: number) {
  let lo = 0, hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (ease(mid) < f) lo = mid;
    else hi = mid;
  }
  return hi;
}

/**
 * Every fur on the page shares these. Change them, then call `refreshFur`
 * (or `regrowFur` for the ones marked "regrows", which change the hairs
 * themselves).
 */
export const settings = {
  /** Palette: where its middle sits (L*, 0–1, from the color), how far it reaches below and above that. */
  shift: -0.13,
  darker: 0.4,
  lighter: 0.22,
  /** Hairs per area (regrows). */
  density: 1.65,
  /** Hair length. Changing it grows or shrinks the hairs with the hover spring. */
  length: 0.8,
  thickness: 0.75,
  /** How much hairs curl (regrows). */
  curl: 0.95,
  /** How much hairs droop under their weight. */
  droop: 0.4,
  /** How much hair lengths vary, 0 all the same (regrows). */
  lengthVariation: 1,
  /** How much hair directions vary from the combed flow (regrows). */
  messiness: 1,
  /** How far hairs along the outline lean out, making the fuzzy edge (regrows). */
  fuzz: 2,
  /**
   * How far from the button's edge the fur starts, in px at scale 1 (regrows):
   * above 0 the outline hairs and the fur's body sit out past the edge, below
   * 0 they move in, eating into the button.
   */
  distance: 0,
  /** Tip width relative to the root. */
  taper: 0.31,
  /** How many hairs catch the light (regrows). */
  sheen: 0.1,
  /** Where the band of shine sits, 0 at the top to 1 at the bottom, and how far it spreads (regrows). */
  sheenPosition: 0.1,
  sheenSpread: 0.32,
  /** How dark the hairs along the top edge are, turned away from the light; also keeps the shine off it (regrows). */
  edgeShadow: 0,
  /**
   * The soft shadow on the page under the button: how dark it is (0 to 1),
   * its blur and how far it drops (px at scale 1), and its width relative
   * to the button's.
   */
  shadow: 0.16,
  shadowBlur: 9,
  shadowDrop: 0,
  shadowWidth: 1,
  /** On wide-gamut screens, how far colors move out toward the more vivid colors sRGB can't show (0 to 1). */
  vividness: 0,
  /** How far the hairs stand at rest, with no hover: 0 is combed flat, 1 standing up. */
  static: 0,
  /** How much further the hairs stand when hovered, on top of `static` (up to 1). */
  hover: 0.35,
  /** The hover spring: how fast it moves (rad/s) and its damping ratio (lower bounces more, 1 doesn't overshoot). */
  hoverSpeed: 22,
  hoverDamping: 0.9,
  /**
   * Hovering out (without a click playing): the fur falls at `leaveFallSpeed`
   * along `leaveEase`, then lands and wobbles out like
   * e^(−settle·t)·cos(bounce·t).
   */
  leaveFallSpeed: 1.55,
  leaveEase: "gravity" as Ease,
  leaveSettle: 1.4,
  leaveBounce: 5.5,
  /** How much the hairs sway while hovered. */
  sway: 0.05,
  /**
   * How much longer the hairs grow as they rise to the hover lift: 0.5 makes
   * them half as long again (regrows, to make room).
   */
  hoverStretch: 0,
  /** How much lighter the fur gets as it rises to the hover lift, in L* (0–1); below 0 darkens. */
  hoverLight: 0.05,
  /**
   * A click poofs the fur up by `poofHeight` over `poofRise` seconds, hangs
   * there for `poofHold` seconds, then falls at `poofFallSpeed` back to
   * where it rests (hovered, or flat if the pointer has left). It lands with
   * whatever speed the fall curve ends with, overshoots, and wobbles out like
   * e^(−settle·t)·cos(bounce·t).
   */
  poofHeight: 0.53,
  /** How much longer still the hairs grow at the top of a click, on top of `hoverStretch` (regrows). */
  clickStretch: 0,
  /** How much lighter still a click makes the fur, on top of `hoverLight`, springing back with the click. */
  clickLight: 0,
  poofRise: 0.13,
  poofSettle: 3.1,
  poofBounce: 15,
  /** The curve of the poof's rise. */
  poofEase: "ease-out" as Ease,
  /** Seconds the fur hangs at the top of the poof. */
  poofHold: 0,
  /**
   * How fast the fall back down goes, and its curve. Speeds are in lift per
   * second: a full drop from upright (1) to flat (0) takes 1 ÷ speed seconds,
   * and a shorter drop takes proportionally less.
   */
  poofFallSpeed: 1.45,
  poofFallEase: "gravity" as Ease,
  /** How strongly the pointer brushes the hairs. */
  brush: 1.05,
  /** How brushed hairs spring back: speed (rad/s) and damping ratio (lower bounces more). */
  brushSpeed: 6,
  brushDamping: 0.32,
};
export type FurSettings = typeof settings;
export type EaseSetting = "poofEase" | "poofFallEase" | "leaveEase";
export type NumericSetting = { [K in keyof FurSettings]: FurSettings[K] extends number ? K : never }[keyof FurSettings];
export const defaultSettings: Readonly<FurSettings> = { ...settings };
/** Named starting points for the settings. The first is the default. */
export const presets: Record<string, Readonly<FurSettings>> = {
  /** Dense, short, neat fur with a springy click. */
  Plush: defaultSettings,
  /** Thin, long, curly, droopy hair with lots of shine and a softer click. */
  Shaggy: {
    ...defaultSettings,
    shift: -0.12,
    darker: 0.4,
    lighter: 0.22,
    density: 1.25,
    length: 0.95,
    thickness: 0.3,
    curl: 1.7,
    droop: 2.05,
    lengthVariation: 1.4,
    messiness: 2.3,
    fuzz: 2,
    taper: 1,
    sheen: 4,
    sheenPosition: 0.21,
    sheenSpread: 0.05,
    edgeShadow: 0.47,
    static: 0,
    hover: 0.34,
    hoverSpeed: 7.5,
    hoverDamping: 0.5,
    leaveFallSpeed: 1.15,
    leaveEase: "gravity",
    leaveSettle: 1.4,
    leaveBounce: 5.5,
    sway: 0.05,
    hoverStretch: 0,
    hoverLight: 0,
    poofHeight: 0.19,
    clickStretch: 0,
    poofRise: 0.16,
    poofSettle: 2.5,
    poofBounce: 7.5,
    poofEase: "ease-in-out",
    poofHold: 0.06,
    poofFallSpeed: 0.9,
    poofFallEase: "gravity",
    brush: 1.05,
    brushSpeed: 4.5,
    brushDamping: 0.32,
  },
  /** Sparse, thick, glossy strands, with a smooth, bounce-free hover and click that brighten, then darken. */
  Teddy: {
    ...defaultSettings,
    shift: -0.11,
    darker: 0.36,
    lighter: 0.12,
    density: 0.8,
    length: 0.4,
    thickness: 2.05,
    curl: 0.25,
    droop: 0,
    lengthVariation: 1,
    messiness: 2.5,
    fuzz: 0,
    distance: 0,
    taper: 0.58,
    sheen: 2.7,
    sheenPosition: 0.3,
    sheenSpread: 0.25,
    edgeShadow: 0,
    shadow: 0.16,
    shadowBlur: 9,
    shadowDrop: 0,
    shadowWidth: 1,
    vividness: 0,
    static: 0,
    hover: 0.34,
    hoverSpeed: 22,
    hoverDamping: 0.95,
    leaveFallSpeed: 0.8,
    leaveEase: "ease-out",
    leaveSettle: 3.7,
    leaveBounce: 0,
    sway: 0.14,
    hoverStretch: 0,
    hoverLight: 0.09,
    poofHeight: 0.29,
    clickStretch: 0.37,
    clickLight: -0.1,
    poofRise: 0.15,
    poofSettle: 11.7,
    poofBounce: 0,
    poofEase: "ease-out",
    poofHold: 0,
    poofFallSpeed: 1.35,
    poofFallEase: "ease-out",
    brush: 1.05,
    brushSpeed: 6,
    brushDamping: 0.32,
  },
  // Bristle is set aside for now: too close to Teddy.
  // /** Sparse, thick, straight, glossy strands that stand out messily. */
  // Bristle: {
  //   ...defaultSettings,
  //   shift: -0.11,
  //   darker: 0.36,
  //   lighter: 0.12,
  //   density: 0.8,
  //   length: 0.4,
  //   thickness: 2.05,
  //   curl: 0.25,
  //   droop: 0,
  //   lengthVariation: 1,
  //   messiness: 2.5,
  //   fuzz: 0,
  //   distance: 0,
  //   taper: 0.58,
  //   sheen: 2.7,
  //   sheenPosition: 0.3,
  //   sheenSpread: 0.25,
  //   edgeShadow: 0,
  //   shadow: 0.16,
  //   shadowBlur: 9,
  //   shadowDrop: 0,
  //   shadowWidth: 1,
  //   vividness: 0,
  //   static: 0,
  //   hover: 0.34,
  //   hoverSpeed: 22,
  //   hoverDamping: 0.45,
  //   leaveFallSpeed: 1.3,
  //   leaveEase: "gravity",
  //   leaveSettle: 2,
  //   leaveBounce: 3,
  //   sway: 0.14,
  //   hoverStretch: 0,
  //   hoverLight: 0.05,
  //   poofHeight: 0.29,
  //   clickStretch: 0,
  //   clickLight: 0.06,
  //   poofRise: 0.15,
  //   poofSettle: 3.1,
  //   poofBounce: 15,
  //   poofEase: "ease-out",
  //   poofHold: 0,
  //   poofFallSpeed: 1.35,
  //   poofFallEase: "gravity",
  //   brush: 1.05,
  //   brushSpeed: 6,
  //   brushDamping: 0.32,
  // },
  /** Curly, messy fur that stands up on its own, with a springy, rippling hover and click. */
  Fluffy: {
    ...defaultSettings,
    shift: -0.18,
    darker: 0.31,
    lighter: 0.17,
    density: 1,
    length: 0.95,
    thickness: 0.8,
    curl: 0.9,
    droop: 0,
    lengthVariation: 2,
    messiness: 1.35,
    fuzz: 0,
    distance: 0,
    taper: 0.31,
    sheen: 2.5,
    sheenPosition: 0.71,
    sheenSpread: 0.23,
    edgeShadow: 0,
    shadow: 0.16,
    shadowBlur: 9,
    shadowDrop: 0,
    shadowWidth: 1,
    vividness: 0,
    static: 0.6,
    hover: 0.1,
    hoverSpeed: 26.5,
    hoverDamping: 0.45,
    leaveFallSpeed: 1.3,
    leaveEase: "gravity",
    leaveSettle: 3.2,
    leaveBounce: 6,
    sway: 0.14,
    hoverStretch: 0.1,
    hoverLight: 0.07,
    poofHeight: 0.55,
    clickStretch: 0.34,
    clickLight: -0.08,
    poofRise: 0.13,
    poofSettle: 3.3,
    poofBounce: 10,
    poofEase: "ease-out",
    poofHold: 0,
    poofFallSpeed: 1.2,
    poofFallEase: "gravity",
    brush: 2.2,
    brushSpeed: 14.5,
    brushDamping: 0.3,
  },
  /** Very short, thick, neat pile that grows out long when hovered or clicked. */
  Velvet: {
    ...defaultSettings,
    shift: 0,
    darker: 0.37,
    lighter: 0.12,
    density: 0.8,
    length: 0.15,
    thickness: 2.2,
    curl: 0.25,
    droop: 0,
    lengthVariation: 1,
    messiness: 0,
    fuzz: 0,
    taper: 0.32,
    sheen: 1.2,
    sheenPosition: 0.04,
    sheenSpread: 0.52,
    edgeShadow: 0.21,
    vividness: 0.38,
    static: 0.32,
    hover: 0.68,
    hoverSpeed: 12.5,
    hoverDamping: 0.45,
    leaveFallSpeed: 0.9,
    leaveEase: "gravity",
    leaveSettle: 4.1,
    leaveBounce: 3,
    sway: 0.14,
    hoverStretch: 0.83,
    hoverLight: 0,
    poofHeight: 1.29,
    clickStretch: 0.59,
    poofRise: 0.11,
    poofSettle: 3.1,
    poofBounce: 15,
    poofEase: "ease-out",
    poofHold: 0,
    poofFallSpeed: 1.35,
    poofFallEase: "gravity",
    brush: 2.6,
    brushSpeed: 3,
    brushDamping: 0.6,
  },
  /** Long, sparse, messy strands that sway a lot and barely react to a click. */
  Mane: {
    ...defaultSettings,
    shift: 0,
    darker: 0.46,
    lighter: 0.17,
    density: 0.7,
    length: 2.22,
    thickness: 1,
    curl: 0.25,
    droop: 0,
    lengthVariation: 1,
    messiness: 2.2,
    fuzz: 0,
    taper: 0.32,
    sheen: 0.1,
    sheenPosition: 0.04,
    sheenSpread: 0.52,
    edgeShadow: 0.21,
    vividness: 0.38,
    static: 0.19,
    hover: 0.17,
    hoverSpeed: 17,
    hoverDamping: 0.45,
    leaveFallSpeed: 0.9,
    leaveEase: "gravity",
    leaveSettle: 4.1,
    leaveBounce: 3,
    sway: 0.23,
    hoverStretch: 0.1,
    hoverLight: 0,
    poofHeight: 0.17,
    clickStretch: 0.05,
    poofRise: 0.11,
    poofSettle: 3.1,
    poofBounce: 15,
    poofEase: "ease-out",
    poofHold: 0,
    poofFallSpeed: 1.35,
    poofFallEase: "gravity",
    brush: 0.45,
    brushSpeed: 6.5,
    brushDamping: 0.6,
  },
  // Sprout is set aside for now: not enough action.
  // /** Smooth and almost bald at rest; the hairs shoot out on hover, and further on a click. */
  // Sprout: {
  //   ...defaultSettings,
  //   shift: 0,
  //   darker: 0.28,
  //   lighter: 0.5,
  //   density: 0.3,
  //   length: 0.03,
  //   thickness: 1.95,
  //   curl: 0,
  //   droop: 0,
  //   lengthVariation: 0,
  //   messiness: 0,
  //   fuzz: 0,
  //   distance: 0,
  //   taper: 1,
  //   sheen: 3.6,
  //   sheenPosition: 0.07,
  //   sheenSpread: 0.05,
  //   edgeShadow: 0.75,
  //   shadow: 0.11,
  //   shadowBlur: 9.5,
  //   shadowDrop: -3,
  //   shadowWidth: 0.97,
  //   vividness: 1,
  //   static: 0.76,
  //   hover: 1,
  //   hoverSpeed: 30,
  //   hoverDamping: 0.4,
  //   leaveFallSpeed: 0.85,
  //   leaveEase: "gravity",
  //   leaveSettle: 4.1,
  //   leaveBounce: 3,
  //   sway: 0.27,
  //   hoverStretch: 4,
  //   hoverLight: 0.06,
  //   poofHeight: 1.5,
  //   clickStretch: 1.5,
  //   clickLight: -0.1,
  //   poofRise: 0.03,
  //   poofSettle: 3.1,
  //   poofBounce: 14.5,
  //   poofEase: "ease-out",
  //   poofHold: 0.04,
  //   poofFallSpeed: 3.6,
  //   poofFallEase: "ease-out",
  //   brush: 2.45,
  //   brushSpeed: 7,
  //   brushDamping: 0.15,
  // },
  /** Sparse, thick, very messy glossy curls set into the button, like tinsel, with slow, gentle motion that darkens on hover and click. */
  Tinsel: {
    ...defaultSettings,
    shift: -0.11,
    darker: 0.16,
    lighter: 0.5,
    density: 0.35,
    length: 1.04,
    thickness: 1.85,
    curl: 1.25,
    droop: 0.1,
    lengthVariation: 2,
    messiness: 3,
    fuzz: 0,
    distance: -6,
    taper: 0.55,
    sheen: 1.8,
    sheenPosition: 0.81,
    sheenSpread: 0.17,
    edgeShadow: 0,
    shadow: 0,
    shadowBlur: 9,
    shadowDrop: 0,
    shadowWidth: 1,
    vividness: 1,
    static: 0.47,
    hover: 0.05,
    hoverSpeed: 22,
    hoverDamping: 0.5,
    leaveFallSpeed: 0.4,
    leaveEase: "ease-in-out",
    leaveSettle: 1.4,
    leaveBounce: 5.5,
    sway: 0.05,
    hoverStretch: 0.32,
    hoverLight: -0.08,
    poofHeight: 0.23,
    clickStretch: 0,
    clickLight: -0.15,
    poofRise: 0.17,
    poofSettle: 2.5,
    poofBounce: 3,
    poofEase: "ease-in-out",
    poofHold: 0,
    poofFallSpeed: 0.3,
    poofFallEase: "ease-out",
    brush: 0.1,
    brushSpeed: 4.5,
    brushDamping: 0.32,
  },
  /** A few thick, tightly curled, pointed strands that spring up on hover and stretch out on a click. */
  Coil: {
    ...defaultSettings,
    shift: 0,
    darker: 0.15,
    lighter: 0.12,
    density: 0.2,
    length: 0.5,
    thickness: 2,
    curl: 2.25,
    droop: 0,
    lengthVariation: 2,
    messiness: 1.9,
    fuzz: 0,
    distance: 0,
    taper: 1,
    sheen: 0.6,
    sheenPosition: 0.38,
    sheenSpread: 0.65,
    edgeShadow: 0.48,
    shadow: 0.2,
    shadowBlur: 19,
    shadowDrop: -1,
    shadowWidth: 0.97,
    vividness: 1,
    static: 0.58,
    hover: 1,
    hoverSpeed: 28,
    hoverDamping: 0.55,
    leaveFallSpeed: 0.6,
    leaveEase: "ease-out",
    leaveSettle: 4.1,
    leaveBounce: 3,
    sway: 0.3,
    hoverStretch: 1.35,
    hoverLight: 0.05,
    poofHeight: 1,
    clickStretch: 0.86,
    clickLight: -0.04,
    poofRise: 0.12,
    poofSettle: 4.6,
    poofBounce: 9.5,
    poofEase: "ease-out",
    poofHold: 0.05,
    poofFallSpeed: 1.9,
    poofFallEase: "ease-out",
    brush: 0.75,
    brushSpeed: 8,
    brushDamping: 1.05,
  },
  /** Long, thin, glossy hairs that droop heavily, with no shadow and a slow, gentle hover and click. */
  Mustache: {
    ...defaultSettings,
    shift: -0.07,
    darker: 0.28,
    lighter: 0.29,
    density: 0.4,
    length: 0.85,
    thickness: 0.65,
    curl: 0,
    droop: 3,
    lengthVariation: 1.15,
    messiness: 2.3,
    fuzz: 0.4,
    distance: 0,
    taper: 0.64,
    sheen: 2.8,
    sheenPosition: 0.28,
    sheenSpread: 0.26,
    edgeShadow: 0.63,
    shadow: 0,
    shadowBlur: 9,
    shadowDrop: 0,
    shadowWidth: 1,
    vividness: 0,
    static: 0,
    hover: 0.1,
    hoverSpeed: 10,
    hoverDamping: 0.6,
    leaveFallSpeed: 0.2,
    leaveEase: "ease-out",
    leaveSettle: 1.6,
    leaveBounce: 0,
    sway: 0.25,
    hoverStretch: 0.95,
    hoverLight: 0.04,
    poofHeight: 0.25,
    clickStretch: 0.11,
    clickLight: -0.1,
    poofRise: 0.09,
    poofSettle: 1,
    poofBounce: 0,
    poofEase: "ease-in-out",
    poofHold: 0,
    poofFallSpeed: 0.2,
    poofFallEase: "ease-out",
    brush: 0,
    brushSpeed: 2,
    brushDamping: 0.1,
  },
};


const mounted = new Set<{ refresh: () => void; regrow: () => void }>();
/** Redraws every fur with the current settings. */
export function refreshFur() {
  for (const fur of mounted) fur.refresh();
}
/** Grows every fur's hairs again, for settings that change the hairs themselves. */
export function regrowFur() {
  for (const fur of mounted) fur.regrow();
}

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

// Reads any CSS color as hex by drawing it.
const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
function hexOf(css: string) {
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = "#000";
  probe.fillStyle = css;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

/**
 * The color's hue at L* `L` (0–1), with `saturation` times its chroma (1 is
 * the color's own) around `middle`. Shadows get slightly more chroma, as color pools in the shade, and
 * highlights keep nearly all of it, so the light doesn't wash the fur out.
 * Yellows warm toward orange in the shade instead of going olive, as yellow
 * fur does. Colors past sRGB lose chroma to fit.
 */
function shadeOf(color: string, L: number, middle: number, saturation: number): Lab {
  const [, a, b] = toOklab(color);
  const depth = clamp((middle - L) / 0.2, 0, 1);
  const k = saturation * (L < middle ? 1 + 0.6 * (middle - L) : 1);
  let hue = Math.atan2(b, a);
  const degrees = (hue * 180) / Math.PI;
  if (degrees > 60 && degrees < 125) hue -= ((22 * Math.PI) / 180) * depth * smoothstep(125, 95, degrees);
  const chroma = Math.hypot(a, b) * k;
  return [fromLightness(clamp(L, 0, 1)), chroma * Math.cos(hue), chroma * Math.sin(hue)];
}

type Lab = [number, number, number];
type Gamut = "srgb" | "display-p3";

/** OKLab to linear-light sRGB, unclamped, so colors past sRGB come out below 0 or above 1. */
function linearSrgb([L, a, b]: Lab): Lab {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}
/** Linear sRGB to linear Display P3. */
const linearP3 = ([r, g, b]: Lab): Lab => [
  0.8224621 * r + 0.177538 * g,
  0.0331941 * r + 0.9668058 * g,
  0.0170827 * r + 0.0723974 * g + 0.9105199 * b,
];
const linearIn = (lab: Lab, gamut: Gamut) => (gamut === "srgb" ? linearSrgb(lab) : linearP3(linearSrgb(lab)));
const fitsIn = (lab: Lab, gamut: Gamut) => linearIn(lab, gamut).every((v) => v >= -1e-6 && v <= 1 + 1e-6);
/** The most chroma a lightness and hue can have in a gamut, as a fraction of `lab`'s chroma (0 if none). */
function room(lab: Lab, gamut: Gamut) {
  if (Math.hypot(lab[1], lab[2]) < 1e-5) return 1;
  let lo = 0, hi = 4;
  for (let i = 0; i < 18; i++) {
    const mid = (lo + hi) / 2;
    if (fitsIn([lab[0], lab[1] * mid, lab[2] * mid], gamut)) lo = mid;
    else hi = mid;
  }
  return lo;
}
const encode = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);

// Wide gamut needs a P3 screen.
const wideScreen = matchMedia("(color-gamut: p3)");
/** Whether to use wide gamut, where the screen supports it. */
export const display = { wide: true };
/** What this screen supports, for showing in the panel. */
export const support = () => ({ wide: wideScreen.matches });
const gamutNow = (): Gamut => (display.wide && wideScreen.matches ? "display-p3" : "srgb");

/**
 * Writes an OKLab color for the canvas. On a wide gamut, `vivid` (0–1) moves
 * its chroma out toward the wider gamut's edge as far as it is toward sRGB's,
 * so a vivid sRGB color becomes as vivid as the screen can show. Colors past
 * the gamut lose chroma to fit.
 */
function paint(lab: Lab, gamut: Gamut, vivid: number): string {
  let c = lab;
  if (gamut !== "srgb" && vivid > 0) {
    const spread = room(c, gamut) / Math.max(1e-3, room(c, "srgb"));
    const k = 1 + clamp(vivid, 0, 1) * (Math.min(spread, 3) - 1);
    if (k > 1) c = [c[0], c[1] * k, c[2] * k];
  }
  const fit = room(c, gamut);
  if (fit < 1) c = [c[0], c[1] * fit, c[2] * fit];
  if (gamut === "srgb") return fromOklab(c);
  const [r, g, b] = linearIn(c, gamut).map((v) => encode(clamp(v, 0, 1)).toFixed(4));
  return `color(display-p3 ${r} ${g} ${b})`;
}

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

interface Strands {
  n: number;
  x: Float32Array; y: Float32Array;
  /** Unit direction the hair lies in at rest, and how far it leans out of the outline. */
  restX: Float32Array; restY: Float32Array; leanX: Float32Array; leanY: Float32Array;
  /** Unit direction it stands toward: out of the outline, or (in the middle) toward the viewer. */
  standX: Float32Array; standY: Float32Array;
  len: Float32Array; curl: Float32Array; phase: Float32Array;
  rim: Float32Array;
  /** How far the pointer has brushed each hair, and how fast that's changing. */
  bendX: Float32Array; bendY: Float32Array; bendVX: Float32Array; bendVY: Float32Array;
  /** Each frame's curve per hair: root, then the cubic's three points. */
  curve: Float32Array;
  /** Hair indices by palette level, underfur first, then the longer guard hairs. */
  groups: Uint32Array[][];
  /** A few light hairs that catch the light, by sheen level, drawn last. */
  sheen: Uint32Array[];
}

/**
 * Grows hairs over a w × h rounded rectangle, offset by `pad` for the canvas
 * margin. At a `scale` of 2 the hairs are twice as long and thick, and there
 * are fewer per area, so each one shows.
 */
function grow(w: number, h: number, radius: number, seed: number, scale: number, pad: number): Strands {
  const random = rng(seed);
  const cx = w / 2, cy = h / 2, r = Math.min(radius, w / 2, h / 2);
  // Signed distance to the rounded rectangle: negative inside.
  const sdf = (x: number, y: number) => {
    const qx = Math.abs(x - cx) - (w / 2 - r), qy = Math.abs(y - cy) - (h / 2 - r);
    return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
  };
  // The fur's outline, moved out (or in) from the button's by `distance`.
  const off = settings.distance * scale, reach = Math.max(0, off);
  const max = Math.round(((w * h) / scale ** 1.6 + ((w + h) * 7) / scale) * settings.density);
  const f = () => new Float32Array(max);
  const s = {
    x: f(), y: f(), restX: f(), restY: f(), leanX: f(), leanY: f(), standX: f(), standY: f(),
    len: f(), curl: f(), phase: f(), rim: f(),
    bendX: f(), bendY: f(), bendVX: f(), bendVY: f(), curve: new Float32Array(max * 8),
  };
  const lists: number[][][] = [0, 1].map(() => Array.from({ length: levels }, () => []));
  const sheen: number[][] = Array.from({ length: sheenLevels }, () => []);
  let n = 0;
  for (let tries = 0; n < max && tries < max * 4; tries++) {
    const x = random() * (w + 4 + reach * 2) - 2 - reach, y = random() * (h + 4 + reach * 2) - 2 - reach;
    const d = sdf(x, y) - off;
    if (d > 0.5) continue;
    const rim = smoothstep(-9 * scale, 0, d);
    // Denser along the outline, where the fuzz shows.
    if (random() > 0.4 + 0.6 * rim) continue;
    const gx = sdf(x + 0.5, y) - sdf(x - 0.5, y), gy = sdf(x, y + 0.5) - sdf(x, y - 0.5);
    const g = Math.hypot(gx, gy) || 1;
    const outX = gx / g, outY = gy / g;
    // Hairs lie along the surface, combed away from the middle and down: the
    // part of "outward and down" that runs along the surface. On top they flow
    // sideways, on the ends and bottom they hang, and in the top middle they
    // lie down rather than stand up. Mirrored across the middle.
    const fromX = x - cx, fromY = y - cy;
    const side = Math.tanh(fromX / (12 * scale));
    const wantX = side * 0.6, wantY = 1;
    const along = wantX * outX + wantY * outY;
    let ax = (wantX - along * outX) * 1.4;
    let ay = (wantY - along * outY) * 1.4 + 0.3;
    const al = Math.hypot(ax, ay) || 1;
    ax /= al; ay /= al;
    const swirl = side * 0.2 * Math.sin((Math.abs(fromX) * 0.05 + y * 0.035) / scale) + 0.5 * settings.messiness * (random() - 0.5);
    s.restX[n] = ax * Math.cos(swirl) - ay * Math.sin(swirl);
    s.restY[n] = ax * Math.sin(swirl) + ay * Math.cos(swirl);
    // Outline hairs lean out a little to make the fuzzy edge; least on top, so it doesn't bristle.
    const lean = 0.32 * settings.fuzz * rim * (0.25 + 0.75 * smoothstep(-1, 0.2, outY));
    s.leanX[n] = outX * lean; s.leanY[n] = outY * lean;
    const stand = random() * Math.PI * 2;
    const guard = random() < 0.3 + 0.3 * rim ? 1 : 0;
    s.x[n] = x + pad; s.y[n] = y + pad;
    s.standX[n] = outX * rim + Math.cos(stand) * (1 - rim);
    s.standY[n] = outY * rim + Math.sin(stand) * (1 - rim);
    // Average length, plus a random part scaled by `lengthVariation`.
    const vary = (spread: number) => (random() - 0.5) * spread * settings.lengthVariation;
    const base = (guard ? 9.5 + vary(5) : 5.5 + vary(3)) + rim * (4 + vary(4));
    // Relative to `length`, which is applied as the hairs are drawn so it can animate.
    s.len[n] = Math.max(1, base) * scale;
    s.curl[n] = (random() * 2 - 1) * (guard ? 0.9 : 0.6) * settings.curl;
    s.phase[n] = random() * Math.PI * 2;
    s.rim[n] = rim;
    // Soft light from above: a little lighter on top, a little darker
    // underneath and toward the ends. Guard hairs catch slightly more of it.
    const px = fromX / (w / 2), py = fromY / (h / 2);
    const occlusion = rim * Math.max(0, py) * 0.15;
    // The top edge, where the surface turns away from the light: it can be in
    // shadow, like the rim of a lit ball, rather than catching the shine.
    const topEdge = rim * smoothstep(-0.2, -0.9, outY) * clamp(settings.edgeShadow, 0, 1);
    const shade = clamp(0.6 - 0.18 * py - 0.06 * px * px - occlusion - 0.4 * topEdge + (random() - 0.5) * 0.32 + (guard ? 0.06 : -0.08), 0, 1);
    // Sheen: a few hairs catch the light, most in a soft band across the button
    // at `sheenPosition` (0 top, 1 bottom), `sheenSpread` wide, and some along
    // the top edge unless it's in shadow.
    const center = clamp(settings.sheenPosition, 0, 1) * 2 - 1, spread = Math.max(0.03, settings.sheenSpread);
    const band = Math.exp(-((py - center) ** 2) / (2 * spread * spread));
    const shine = (0.14 * band + 0.04 * smoothstep(0.4, -0.9, py) * rim * (1 - topEdge)) * settings.sheen;
    if (random() < shine) sheen[Math.floor(random() * sheenLevels)].push(n);
    else lists[guard][Math.round(shade * (levels - 1))].push(n);
    n++;
  }
  return {
    n, ...s,
    groups: lists.map((gs) => gs.map((list) => Uint32Array.from(list))),
    sheen: sheen.map((list) => Uint32Array.from(list)),
  };
}

export function mountFur(button: HTMLElement) {
  // The canvas, remade when the color setup changes, since a canvas's color
  // space and depth are fixed once its context exists.
  let canvas!: HTMLCanvasElement, ctx!: CanvasRenderingContext2D;
  let setup = "";
  function makeCanvas() {
    const gamut = gamutNow();
    setup = gamut;
    const next = document.createElement("canvas");
    next.className = "fur-canvas";
    next.setAttribute("aria-hidden", "true");
    ctx = next.getContext("2d", { colorSpace: gamut })!;
    if (canvas) canvas.replaceWith(next);
    else button.prepend(next);
    canvas = next;
  }
  makeCanvas();

  // `--fur-scale` sizes the hairs; `pad` is the canvas margin they can reach into.
  let scale = 1, pad = halo;
  let w = 0, h = 0, radius = 0, dpr = 1;
  let strands: Strands | null = null;
  let palette: string[] = [], sheenPalette: string[] = [];
  let undercoat: [string, string] = ["#000", "#000"];
  // Spring state: `lift` 0 is combed flat, 1 is standing up.
  let lift = clamp(settings.static, 0, 1), velocity = 0, target = lift, hovering = false;
  // A click's poof: which stage it's in and for how long, where the rise
  // started and peaks, and whether the landing uses the poof's bounce.
  let stage: "rise" | "hold" | "fall" | "leave" | null = null, stageTime = 0;
  let riseFrom = 0, risePeak = 0, leaveFrom = 0;
  // How stretched a click has the hairs, 0 to 1: it rises and holds with the
  // click, then springs back on the click's landing spring (`recoil`), so the
  // hairs snap back, overshoot a little shorter and wobble out.
  let poof = 0, poofFrom = 0, poofVelocity = 0, recoil = false;
  // The hair length being drawn, springing toward `settings.length` when it changes.
  let grown = settings.length, growth = 0;
  // The rest a fall is heading for; when it changes mid-fall, the fall carries on from where it is.
  let fallTarget = NaN;
  // Which spring settles the fur: hovering in, a click's landing, or hovering out's landing.
  let spring: "hover" | "click" | "leave" = "hover";
  let pointerX = -1e3, pointerY = -1e3, brushing = 0;
  let frame = 0, last = 0, time = 0;

  const seed = [...(button.textContent ?? "")].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);

  // The button's color, and the fur's shades for each amount of hover and
  // click lightening, worked out as they're first needed and kept until the
  // colors or settings change. Steps of 0.001 L* are too small to see, so
  // slow fades don't step; each new step costs a fraction of a millisecond.
  let surface = "#000";
  const shades = new Map<number, { palette: string[]; sheen: string[]; undercoat: [string, string] }>();

  function readColors() {
    const style = getComputedStyle(button);
    // The button's color, even once its flat background is hidden.
    surface = hexOf(style.getPropertyValue("--fur-color").trim() || style.backgroundColor);
    shades.clear();
    useShades(0);
    button.toggleAttribute("data-fur-ready", true);
  }

  /** Switches to the shades lightened by `light` (L*, 0–1), working them out the first time. */
  function useShades(light: number) {
    const key = Math.round(light * 1000);
    let set = shades.get(key);
    if (!set) {
      if (shades.size > 2000) shades.clear();
      set = shadesAt(key / 1000);
      shades.set(key, set);
    }
    palette = set.palette;
    sheenPalette = set.sheen;
    undercoat = set.undercoat;
  }

  function shadesAt(light: number) {
    const Ls = lightness(surface);
    const middle = clamp(Ls + settings.shift + light, 0.05, 0.95);
    const low = Math.max(0.02, middle - settings.darker), high = Math.min(0.97, middle + settings.lighter);
    // Level 0.6 of the way up is the middle, so most of the fur reads as the button's color.
    const at = (u: number) => (u < 0.6 ? middle - ((0.6 - u) / 0.6) * (middle - low) : middle + ((u - 0.6) / 0.4) * (high - middle));
    const gamut = gamutNow();
    const color = (u: number) => paint(shadeOf(surface, at(u), middle, 1), gamut, settings.vividness);
    return {
      palette: Array.from({ length: levels }, (_, i) => color(i / (levels - 1))),
      undercoat: [color(0.46), color(0.3)] as [string, string],
      // Sheen: lighter than the brightest fur, with some of its color, so it reads as light on the hair.
      sheen: Array.from({ length: sheenLevels }, (_, i) =>
        paint(shadeOf(surface, Math.min(0.97, high + 0.03 + 0.02 * i), middle, 0.8), gamut, settings.vividness)),
    };
  }

  /**
   * How much the fur is lightened now: by `hoverLight` as far as it has
   * risen toward the hover lift (with the hover's own timing), and by
   * `clickLight` as far through a click as it is (with the click's rise,
   * hang and spring-back). The hover part stops at the hover lift, so a
   * click's extra lift doesn't also brighten it, however small the hover lift.
   */
  function lightNow() {
    if (!settings.hoverLight && !settings.clickLight) return 0;
    const base = clamp(settings.static, 0, 1), hoverTop = Math.min(1, base + settings.hover);
    const hovered = hoverTop - base > 1e-3 ? clamp((lift - base) / (hoverTop - base), 0, 1) : 0;
    return settings.hoverLight * hovered + settings.clickLight * clamp(poof, -0.5, 1);
  }

  /**
   * Room around the button for the hairs at their longest: the halo fits
   * hairs up to length 1.4, and grows for longer ones and for the stretch
   * of hovering and clicking.
   */
  const padFor = (scale: number) =>
    Math.round(Math.max(
      halo * scale * Math.max(1, settings.length / 1.4) * (1 + Math.max(0, settings.hoverStretch) + Math.max(0, settings.clickStretch)) + Math.max(0, settings.distance) * scale,
      // And for the shadow: its drop, blur and height below the button, and its width past the sides.
      (Math.max(0, settings.shadowDrop) + 2 * Math.max(0, settings.shadowBlur) + 10) * scale,
      (Math.max(0, settings.shadowWidth - 1) * w * 0.46) + 2 * Math.max(0, settings.shadowBlur) * scale,
    ));

  function layout() {
    const b = button.getBoundingClientRect();
    const style = getComputedStyle(button);
    w = b.width; h = b.height;
    scale = parseFloat(style.getPropertyValue("--fur-scale")) || 1;
    pad = padFor(scale);
    Object.assign(canvas.style, { inset: `-${pad}px`, width: `calc(100% + ${pad * 2}px)`, height: `calc(100% + ${pad * 2}px)` });
    radius = parseFloat(style.borderTopLeftRadius) || 0;
    dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = Math.round((w + pad * 2) * dpr);
    canvas.height = Math.round((h + pad * 2) * dpr);
    strands = grow(w, h, radius, seed, scale, pad);
  }

  /** Works out every hair's curve for this frame into `strands.curve`. */
  function shape(s: Strands) {
    const c = s.curve;
    // Below 0 (a bounce swinging past rest), the hairs press flatter than they lie.
    const up = Math.max(-0.5, lift);
    const sway = reduceMotion.matches ? 0 : settings.sway * Math.min(1, Math.abs(up) * 3);
    const near = 2 * (22 * scale) ** 2;
    const base = clamp(settings.static, 0, 1);
    // Stretch: hovering stretches hairs as they rise from rest to the hover
    // lift (and a little past it in a bouncy overshoot, unless a click plays).
    // A click stretches them further along its own rise and fall, `poof`, so
    // it works even when the fur already stands fully upright.
    const hoverTop = Math.min(1, base + settings.hover);
    // The click's part only adds to the hover's, so a click always stretches
    // further than hovering (until its spring-back overshoots).
    const clicked = settings.clickStretch * clamp(poof, -0.5, 1);
    const stretchAt = (l: number) => {
      const hovered = hoverTop - base > 1e-3 ? (l - base) / (hoverTop - base) : 0;
      return settings.hoverStretch * clamp(hovered, 0, 1.3) + clicked;
    };
    for (let i = 0; i < s.n; i++) {
      const dx = s.x[i] - pointerX, dy = s.y[i] - pointerY;
      // A little higher right under the pointer.
      let l = up;
      if (hovering) l += 0.12 * Math.exp(-(dx * dx + dy * dy) / near);
      const L = Math.min(1, l);
      const a = sway * Math.sin(time * 2.2 + s.phase[i]);
      let tx = (s.restX[i] + s.leanX[i]) * (1 - L) + s.standX[i] * L + s.bendX[i] - s.restY[i] * a;
      let ty = (s.restY[i] + s.leanY[i]) * (1 - L) + s.standY[i] * L + s.bendY[i] + s.restX[i] * a;
      const tl = Math.hypot(tx, ty) || 1;
      tx /= tl; ty /= tl;
      const r = s.rim[i];
      // Outline hairs reach out as they stand; middle ones point at you, so they look shorter.
      const len = s.len[i] * grown * (1 + stretchAt(l)) * (1 + r * 0.3 * l - (1 - r) * 0.35 * L);
      const curl = s.curl[i] * (1 - 0.5 * L);
      // Hairs droop under their weight until they stand.
      const droop = 0.2 * settings.droop * (1 - L) * len;
      const px = -ty, py = tx;
      const x0 = s.x[i], y0 = s.y[i], k = i * 8;
      c[k] = x0; c[k + 1] = y0;
      c[k + 2] = x0 + tx * len * 0.34;
      c[k + 3] = y0 + ty * len * 0.34;
      c[k + 4] = x0 + tx * len * 0.68 + px * curl * len * 0.3;
      c[k + 5] = y0 + ty * len * 0.68 + py * curl * len * 0.3 + droop * 0.4;
      c[k + 6] = x0 + tx * len * 0.92 + px * curl * len * 0.55;
      c[k + 7] = y0 + ty * len * 0.92 + py * curl * len * 0.55 + droop;
    }
  }

  // Each hair is stroked as `pieces` stretches of its curve, each a little
  // thinner than the last. Their flat ends meet along the same direction, so
  // the hair narrows in small steps with no bead where the pieces join.
  const pieces = 4, stride = (pieces + 1) * 4;
  // Bernstein weights for the point, and the slope, at each join.
  const joins = Array.from({ length: pieces + 1 }, (_, j) => {
    const t = j / pieces, u = 1 - t;
    return [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t, 3 * u * u, 6 * u * t, 3 * t * t];
  });
  // Each hair's point and slope at every join, worked out on the first piece.
  let ends = new Float32Array(0);

  function joinsOf(c: Float32Array, i: number) {
    const k = i * 8, e = i * stride;
    const x0 = c[k], y0 = c[k + 1], x1 = c[k + 2], y1 = c[k + 3];
    const x2 = c[k + 4], y2 = c[k + 5], x3 = c[k + 6], y3 = c[k + 7];
    for (let j = 0; j <= pieces; j++) {
      const [b0, b1, b2, b3, d0, d1, d2] = joins[j], q = e + j * 4;
      ends[q] = b0 * x0 + b1 * x1 + b2 * x2 + b3 * x3;
      ends[q + 1] = b0 * y0 + b1 * y1 + b2 * y2 + b3 * y3;
      ends[q + 2] = d0 * (x1 - x0) + d1 * (x2 - x1) + d2 * (x3 - x2);
      ends[q + 3] = d0 * (y1 - y0) + d1 * (y2 - y1) + d2 * (y3 - y2);
    }
  }

  /**
   * Strokes every hair, narrowing from root to tip by `taper`: darker root
   * pieces, then lighter tip pieces. Only the very tip gets a round end.
   */
  function strokeHairs(s: Strands) {
    const c = s.curve, top = levels - 1, third = 1 / (3 * pieces);
    if (ends.length < s.n * stride) ends = new Float32Array(s.n * stride);
    const taper = clamp(settings.taper, 0.05, 1);
    for (let p = 0; p < pieces; p++) {
      const tip = p >= pieces / 2;
      ctx.lineCap = p === pieces - 1 ? "round" : "butt";
      ctx.globalAlpha = tip ? 0.75 : 1;
      const narrow = 1 - (1 - taper) * (p / (pieces - 1));
      for (let g = 0; g < 2; g++) {
        ctx.lineWidth = (g ? 1.1 : 0.95) * scale * settings.thickness * narrow;
        s.groups[g].forEach((group, level) => {
          if (!group.length) return;
          ctx.strokeStyle = tip ? palette[Math.min(top, level + 1)] : palette[Math.max(0, level - 1)];
          ctx.beginPath();
          for (const i of group) {
            if (p === 0) joinsOf(c, i);
            // The stretch of the curve between two joins, as its own cubic.
            const a = i * stride + p * 4, b = a + 4;
            const ax = ends[a], ay = ends[a + 1], bx = ends[b], by = ends[b + 1];
            ctx.moveTo(ax, ay);
            ctx.bezierCurveTo(
              ax + ends[a + 2] * third, ay + ends[a + 3] * third,
              bx - ends[b + 2] * third, by - ends[b + 3] * third,
              bx, by,
            );
          }
          ctx.stroke();
        });
      }
    }
    ctx.globalAlpha = 1;
    ctx.lineCap = "round";
  }

  /** Strokes the sheen hairs: thin and translucent, so they read as light catching the fur. */
  function strokeSheen(s: Strands) {
    const c = s.curve;
    ctx.lineWidth = 0.7 * scale * settings.thickness;
    ctx.globalAlpha = 0.35;
    s.sheen.forEach((group, level) => {
      if (!group.length) return;
      ctx.strokeStyle = sheenPalette[level];
      ctx.beginPath();
      for (const i of group) {
        const k = i * 8;
        ctx.moveTo(c[k], c[k + 1]);
        ctx.bezierCurveTo(c[k + 2], c[k + 3], c[k + 4], c[k + 5], c[k + 6], c[k + 7]);
      }
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
  }

  function draw() {
    if (!strands || !palette.length) return;
    const s = strands;
    useShades(lightNow());
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w + pad * 2, h + pad * 2);
    // A soft shadow on the page underneath, so the fur sits on it. Skipped
    // when off, since a blur is one of the costlier things to draw.
    if (settings.shadow > 0) {
      ctx.filter = `blur(${Math.max(0, settings.shadowBlur) * scale}px)`;
      ctx.fillStyle = `rgba(0, 0, 0, ${clamp(settings.shadow, 0, 1)})`;
      ctx.beginPath();
      ctx.ellipse(pad + w / 2, pad + h + (settings.shadowDrop - 1) * scale, w * 0.46 * Math.max(0.05, settings.shadowWidth), Math.min(10 * scale, h * 0.2), 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // The undercoat: the shade deep in the fur, between the hairs.
    // Follows the fur's outline, `distance` out from the button's. Dense fur
    // hides the body's edge a little inside the outline; sparse fur would
    // leave a gap between it and the hairs, so the body reaches out to where
    // they grow, with a softer edge.
    const sparse = 1 - clamp(settings.density, 0, 1);
    const rr = Math.min(radius, w / 2, h / 2);
    const inset = Math.min((3 - settings.distance - 5 * sparse) * scale, Math.min(w, h) / 2 - 1);
    const depth = ctx.createLinearGradient(0, pad, 0, pad + h);
    depth.addColorStop(0, undercoat[0]);
    depth.addColorStop(1, undercoat[1]);
    ctx.fillStyle = depth;
    ctx.filter = `blur(${(2.5 + 2 * sparse) * scale}px)`;
    ctx.beginPath();
    ctx.roundRect(pad + inset, pad + inset, w - inset * 2, h - inset * 2, Math.max(0, rr - inset));
    ctx.fill();
    ctx.filter = "none";
    ctx.lineCap = "round";
    shape(s);
    strokeHairs(s);
    strokeSheen(s);
  }

  /** Springs each brushed hair back toward where it lies; returns whether any is still moving. */
  function relax(dt: number) {
    if (!strands || brushing <= 0) return false;
    const s = strands;
    // Springy, so brushed hair bounces back up rather than lying flat like wet fur.
    const k = settings.brushSpeed ** 2, damping = 2 * settings.brushSpeed * settings.brushDamping;
    let moving = 0;
    for (let i = 0; i < s.n; i++) {
      let bx = s.bendX[i], by = s.bendY[i], vx = s.bendVX[i], vy = s.bendVY[i];
      if (bx === 0 && by === 0 && vx === 0 && vy === 0) continue;
      vx += (-k * bx - damping * vx) * dt;
      vy += (-k * by - damping * vy) * dt;
      bx += vx * dt;
      by += vy * dt;
      if (Math.abs(bx) + Math.abs(by) + Math.abs(vx) + Math.abs(vy) < 0.002) bx = by = vx = vy = 0;
      else moving++;
      s.bendX[i] = bx; s.bendY[i] = by; s.bendVX[i] = vx; s.bendVY[i] = vy;
    }
    brushing = moving;
    return moving > 0;
  }

  function tick(now: number) {
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60);
    last = now;
    time += dt;
    if (reduceMotion.matches) {
      lift = target;
      velocity = 0;
      stage = null;
      poof = 0;
      poofVelocity = 0;
      recoil = false;
      grown = settings.length;
      growth = 0;
    } else if (stage === "rise") {
      // Up to the peak, along the rise curve.
      stageTime += dt;
      const duration = Math.max(0.01, settings.poofRise);
      const ease = eases[settings.poofEase] ?? eases["ease-out"];
      const u = Math.min(1, stageTime / duration);
      lift = riseFrom + (risePeak - riseFrom) * ease(u);
      poof = poofFrom + (1 - poofFrom) * ease(u);
      velocity = 0;
      if (u >= 1) {
        stage = "hold";
        stageTime = 0;
      }
    } else if (stage === "hold") {
      // Hang at the top.
      stageTime += dt;
      lift = risePeak;
      poof = 1;
      velocity = 0;
      if (stageTime >= settings.poofHold) {
        stage = "fall";
        stageTime = 0;
        fallTarget = NaN;
        recoil = true;
        poofVelocity = 0;
      }
    } else if (stage === "fall" || stage === "leave") {
      // Down to where the fur rests now, along the fall curve: a click's fall
      // from its peak, or hovering out from wherever the fur was. The fall
      // keeps the same speed however far it goes, so a long drop (to flat)
      // takes longer than a short one (back to hovering).
      const click = stage === "fall";
      const from = click ? risePeak : leaveFrom;
      const speed = Math.max(0.05, click ? settings.poofFallSpeed : settings.leaveFallSpeed);
      const ease = eases[click ? settings.poofFallEase : settings.leaveEase] ?? eases.gravity;
      const duration = Math.max(0.01, Math.abs(target - from) / speed);
      if (target !== fallTarget) {
        // Just started, or the rest changed mid-fall (the pointer left or came
        // back): carry on from where the fur is now, at the same speed.
        const f = Math.abs(target - from) < 1e-6 ? 1 : clamp((lift - from) / (target - from), 0, 1);
        stageTime = easeInverse(ease, f) * duration;
        fallTarget = target;
      }
      stageTime += dt;
      const u = Math.min(1, stageTime / duration);
      lift = from + (target - from) * ease(u);
      if (u >= 1) {
        stage = null;
        spring = click ? "click" : "leave";
        // Land with the curve's final speed, so a curve that ends moving
        // (like gravity) overshoots and bounces.
        velocity = ((target - from) * (ease(1) - ease(0.98))) / (0.02 * duration);
        // A fall keeps its speed however short it is, so a short drop would
        // land as hard as a long one and dip far below where the fur rests
        // (with static, nearly flat). Land softly enough to dip at most half
        // the drop. Below flat the hairs only press a little flatter, so that
        // part of the dip is left alone, and falls to flat bounce as before.
        if (velocity < 0) {
          const a = click ? settings.poofSettle : settings.leaveSettle;
          const b = click ? settings.poofBounce : settings.leaveBounce;
          const dip = -velocity / Math.sqrt(a * a + b * b);
          const room = 0.5 * Math.abs(target - from) + Math.max(0, dip - target);
          if (dip > room) velocity *= room / dip;
        }
      } else velocity = 0;
    } else {
      // A landing wobbles with its own settle and bounce, even if the target
      // changes on the way (the pointer leaves). Hovering in uses the hover spring.
      let k: number, damping: number;
      if (spring === "hover") {
        const w = settings.hoverSpeed;
        k = w * w;
        damping = 2 * w * settings.hoverDamping;
      } else {
        const a = spring === "click" ? settings.poofSettle : settings.leaveSettle;
        const b = spring === "click" ? settings.poofBounce : settings.leaveBounce;
        k = a * a + b * b;
        damping = 2 * a;
      }
      // Small steps, so stiff springs stay stable at low frame rates.
      const steps = Math.ceil(dt * 240);
      for (let i = 0; i < steps; i++) {
        velocity += (k * (target - lift) - damping * velocity) * (dt / steps);
        lift += velocity * (dt / steps);
      }
    }
    if (recoil) {
      // The click's stretch springs back on its own, even once the fur has
      // landed, with the click's landing settle and bounce.
      const a = settings.poofSettle, b = settings.poofBounce;
      const k = a * a + b * b, damping = 2 * a;
      const steps = Math.ceil(dt * 240);
      for (let i = 0; i < steps; i++) {
        poofVelocity += (-k * poof - damping * poofVelocity) * (dt / steps);
        poof += poofVelocity * (dt / steps);
      }
      if (Math.abs(poof) < 0.002 && Math.abs(poofVelocity) < 0.01) {
        poof = 0;
        poofVelocity = 0;
        recoil = false;
      }
    }
    if (!reduceMotion.matches && (grown !== settings.length || growth !== 0)) {
      // Grow or shrink toward the length setting, on the hover spring.
      const w = settings.hoverSpeed, k = w * w, damping = 2 * w * settings.hoverDamping;
      const steps = Math.ceil(dt * 240);
      for (let i = 0; i < steps; i++) {
        growth += (k * (settings.length - grown) - damping * growth) * (dt / steps);
        grown += growth * (dt / steps);
      }
      if (Math.abs(settings.length - grown) < 0.002 && Math.abs(growth) < 0.002) {
        grown = settings.length;
        growth = 0;
      }
    }
    const moving = relax(dt);
    draw();
    const settled = stage === null && !recoil && growth === 0 && grown === settings.length && Math.abs(target - lift) < 0.002 && Math.abs(velocity) < 0.002 && !moving;
    if (settled) spring = "hover";
    if (settled && (!hovering || reduceMotion.matches)) {
      lift = target;
      draw();
      frame = 0;
      last = 0;
      return;
    }
    frame = requestAnimationFrame(tick);
  }
  const run = () => {
    if (!frame) frame = requestAnimationFrame(tick);
  };
  const aim = () => {
    const rest = clamp(settings.static, 0, 1);
    target = hovering || button.matches(":focus-visible") ? Math.min(1, rest + settings.hover) : rest;
    run();
  };
  /** Plays the click poof. */
  const startPoof = () => {
    if (reduceMotion.matches) return;
    stage = "rise";
    stageTime = 0;
    riseFrom = lift;
    poofFrom = Math.max(0, poof);
    poofVelocity = 0;
    recoil = false;
    // Capped where the hairs look fully upright: higher would just hang there
    // unseen and make the visible part of the fall look sudden. Hang time
    // controls the pause instead.
    risePeak = Math.max(lift, Math.min(1, Math.max(lift, target) + settings.poofHeight));
    spring = "click";
    run();
  };

  let lastX = 0, lastY = 0;
  const local = (event: PointerEvent) => {
    const rect = button.getBoundingClientRect();
    pointerX = event.clientX - rect.left + pad;
    pointerY = event.clientY - rect.top + pad;
  };
  button.addEventListener("pointerenter", (event) => {
    local(event);
    lastX = pointerX; lastY = pointerY;
    hovering = true;
    // Coming back while hovering out: rise again with the hover spring.
    if (stage === "leave" || spring === "leave") {
      stage = null;
      spring = "hover";
    }
    aim();
  });
  // Brushing: hairs near the pointer are pushed the way it moves, then spring back.
  button.addEventListener("pointermove", (event) => {
    local(event);
    if (!strands || reduceMotion.matches) return;
    let mx = pointerX - lastX, my = pointerY - lastY;
    lastX = pointerX; lastY = pointerY;
    const speed = Math.hypot(mx, my);
    if (speed < 0.01) return;
    // A fast flick (like leaving quickly) shouldn't comb the fur flat.
    const most = 16 * scale;
    if (speed > most) { mx *= most / speed; my *= most / speed; }
    // Movement is measured relative to the hair size, so big fur brushes like small fur.
    mx /= scale; my /= scale;
    // While a click plays, brush only lightly, so its bounce shows.
    const clicking = stage === "rise" || stage === "hold" || stage === "fall" || spring === "click";
    const s = strands, reach = 34 * scale, push = 0.09 * settings.brush * (clicking ? 0.3 : 1);
    for (let i = 0; i < s.n; i++) {
      const dx = s.x[i] - pointerX, dy = s.y[i] - pointerY;
      const d2 = dx * dx + dy * dy;
      if (d2 > reach * reach * 4) continue;
      const f = Math.exp(-d2 / (2 * reach * reach)) * push;
      s.bendVX[i] += mx * f * 4;
      s.bendVY[i] += my * f * 4;
      const v = Math.hypot(s.bendVX[i], s.bendVY[i]);
      if (v > 8) { s.bendVX[i] *= 8 / v; s.bendVY[i] *= 8 / v; }
      // Keep a brushed hair from folding over completely.
      const b = Math.hypot(s.bendX[i], s.bendY[i]);
      if (b > 1.1) { s.bendX[i] *= 1.1 / b; s.bendY[i] *= 1.1 / b; }
    }
    brushing = 1;
    run();
  });
  button.addEventListener("pointerleave", () => {
    hovering = false;
    pointerX = pointerY = -1e3;
    aim();
    // A click plays out on its own (its fall heads for the new rest);
    // otherwise hovering out falls and lands with its own settings.
    if (stage === null && !reduceMotion.matches && Math.abs(lift - target) > 0.002) {
      stage = "leave";
      stageTime = 0;
      leaveFrom = lift;
      fallTarget = NaN;
    }
  });
  button.addEventListener("pointerdown", (event) => {
    local(event);
    startPoof();
  });
  button.addEventListener("keydown", (event) => {
    if (event.repeat || (event.key !== "Enter" && event.key !== " ")) return;
    startPoof();
  });
  button.addEventListener("focus", () => {
    if (!button.matches(":focus-visible") || hovering) return;
    aim();
  });
  button.addEventListener("blur", aim);

  const refresh = () => {
    if (setup !== gamutNow()) {
      makeCanvas();
      layout();
    } else if (padFor(scale) !== pad) layout();
    readColors();
    draw();
    // Settings may have moved where the fur rests or hovers: spring there.
    aim();
  };
  const regrow = () => {
    layout();
    refresh();
  };
  new ResizeObserver(regrow).observe(button);
  const handle = { refresh, regrow };
  mounted.add(handle);
  return handle;
}
