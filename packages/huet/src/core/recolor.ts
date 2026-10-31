import {
  fromLightness, lightnessOf as lightness, lightnessToe as toe,
  oklabFromRgb, rgbFromOklab, toOklab, type Triple,
} from "./color";
import { colorFilter } from "./filters";
import { checkTheme, defaultColors, hues, neutralRampOf, rampOptionsOf, type Hue, type Theme } from "./theme";

/*
  A theme's ramps form a coordinate system for colors:

  - `t` is the position along the neutral dark → light ramp, measured in CIE
    lightness (see `lightness` below).
  - Chroma is measured from the neutral ramp at that position and expressed as
    a weighted sum of the two neighboring hue anchors (red/yellow, yellow/green,
    …). A weight of 1 means "as colorful as this theme's anchor".

  Recoloring decomposes each pixel in a source theme and recomposes it in a
  target theme, so grays follow the target's neutral ramp, reds become the
  target's red, and so on. The mapping is a fixed function of RGB, so it can be
  baked into a 3D lookup table once per theme and applied cheaply (or on a GPU).
*/

/** The theme images are assumed to be in when no `source` is given: black to white. */
const defaultSource: Theme = { neutral: ["#000000", "#ffffff"] };

export interface Coordinates {
  /** Position on the dark → light ramp: 0 is dark, 1 is light. */
  t: number;
  /** Neighboring hue ramps and their weights (1 = anchor chroma). */
  weights: Partial<Record<Hue, number>>;
}

export interface RecolorOptions {
  /** The theme the image is assumed to be in. Defaults to black to white with Huet's default hues. */
  source?: Theme;
  /**
   * Flip the lightness coordinate. Off by default so light stays light and
   * dark stays dark; meant for UI screenshots shown in an opposite-polarity
   * theme, since inverted photos read as negatives.
   */
  invert?: boolean;
  /**
   * A CSS `filter` the image is shown with, such as `grayscale(1)`. Its color
   * functions run before recoloring, so the result can be shown without the
   * filter, which would otherwise wash out the theme. Other functions, like
   * `blur()`, are ignored.
   */
  filter?: string;
}
// How strongly, and with how much of the neutral ramp's tint, come from the
// target theme's `images` (or `svgs`). At tint 1 (the default), chroma is added on top of
// the neutral ramp, so a yellow-tinted ramp turns blue skies teal. At 0, the
// tint fades out as colors approach anchor saturation, keeping hues closer to
// the theme's anchors.

/*
  CIE lightness L* (0–1) of a color with OKLab lightness L, treating L³ as its
  luminance (exact for neutrals). Above the toe, L* is an affine function of
  OKLab L, so mappings there are unchanged. Near black, OKLab's cube root is
  infinitely steep: sRGB 0 → 1 spans 6.7% of the lightness range (0.27% in
  L*). Lifting a ramp's dark end would turn that invisible step into a band.
  The conversions live in ./color, shared with the contrast solver.
*/
/*
  OKLab's a and b come from the same cube roots, so near-black colors read as
  far more colorful than they look: (8, 0, 0) would become a visible red once
  lifted onto a navy ramp. Like CIELAB's a* and b*, measure chroma through the
  same toe: below it, lightness grows like L³ instead of L, so chroma is scaled
  by (L / toe)² on the way in and unscaled at the output lightness.
*/
const vividness = (L: number) => (L < toe ? (L / toe) ** 2 : 1);

interface Frame {
  /** CIE lightness of the neutral ramp's dark and light ends. */
  low: number;
  high: number;
  /** OKLab (a, b) of the neutral ramp at lightness position t (shared result). */
  neutralAt: (t: number) => readonly [number, number];
  /** OKLab (a, b) chroma vectors of each hue anchor, in `hues` order. */
  a: Float64Array;
  b: Float64Array;
}

const frames = new Map<string, Frame>();
function frame(theme: Theme): Frame {
  const key = JSON.stringify(theme);
  let cached = frames.get(key);
  if (cached) return cached;
  checkTheme(theme);
  const { colors } = theme;
  const { ramp } = neutralRampOf(rampOptionsOf(theme));
  // Sample the neutral ramp, which may pass through middle stops or travel
  // around the hue wheel, and index it by lightness: a gray lands on the ramp
  // color with the same relative lightness.
  const n = 257;
  const v = new Float64Array(n),
    ra = new Float64Array(n),
    rb = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const [L, a, b] = toOklab(ramp(i / (n - 1)));
    // Keep lightness non-decreasing so every lightness has one ramp color.
    v[i] = Math.max(lightness(L), i ? v[i - 1] : 0);
    ra[i] = a;
    rb[i] = b;
  }
  const low = v[0],
    high = v[n - 1];
  const out: [number, number] = [0, 0];
  const neutralAt = (t: number) => {
    const target = low + t * (high - low);
    let lo = 0,
      hi = n - 1;
    if (target <= low) hi = 0;
    else if (target >= high) lo = n - 1;
    else
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (v[mid] < target) lo = mid;
        else hi = mid;
      }
    const f = v[hi] > v[lo] ? (target - v[lo]) / (v[hi] - v[lo]) : 0;
    out[0] = ra[lo] + f * (ra[hi] - ra[lo]);
    out[1] = rb[lo] + f * (rb[hi] - rb[lo]);
    return out;
  };
  const anchors = hues.map((hue) => toOklab(colors?.[hue] ?? defaultColors[hue]));
  cached = {
    low,
    high,
    neutralAt,
    a: Float64Array.from(anchors, (x) => x[1]),
    b: Float64Array.from(anchors, (x) => x[2]),
  };
  if (frames.size >= 64) frames.clear();
  frames.set(key, cached);
  return cached;
}


/** Express OKLab colors in a theme's ramp coordinates. */
function decomposer(source: Frame) {
  const n = hues.length;
  const angle = (i: number) => Math.atan2(source.b[i], source.a[i]);
  const order = Array.from({ length: n }, (_, i) => i).sort(
    (x, y) => angle(x) - angle(y),
  );
  // Each sector spans two hue anchors adjacent on the hue circle. Inverting
  // the 2×2 basis once lets every pixel be decomposed with a few multiplies.
  const sectors = order.map((i0, k) => {
    const i1 = order[(k + 1) % n];
    const [a0, b0, a1, b1] = [source.a[i0], source.b[i0], source.a[i1], source.b[i1]];
    const det = a0 * b1 - a1 * b0;
    return { i0, i1, det, m: [b1 / det, -a1 / det, -b0 / det, a0 / det] };
  });
  const { low, high } = source;
  const span = high - low || 1;
  const out = { t: 0, i0: 0, i1: 0, w0: 0, w1: 0 };
  return ([L, a, b]: Triple) => {
    const t = (lightness(L) - low) / span;
    // Chroma relative to the (possibly tinted) neutral ramp at this lightness.
    const [na, nb] = source.neutralAt(t);
    const v = vividness(L);
    const ca = (a - na) * v,
      cb = (b - nb) * v;
    out.t = t;
    out.w0 = out.w1 = 0;
    if (ca * ca + cb * cb < 1e-10) return out;
    for (const { i0, i1, det, m } of sectors) {
      // A positive determinant means the anchors are less than 180° apart.
      if (det <= 1e-12) continue;
      const w0 = m[0] * ca + m[1] * cb,
        w1 = m[2] * ca + m[3] * cb;
      if (w0 >= -1e-9 && w1 >= -1e-9) {
        Object.assign(out, { i0, i1, w0: Math.max(0, w0), w1: Math.max(0, w1) });
        return out;
      }
    }
    // Anchors leave a gap of 180° or more: project onto the closest anchor.
    let best = -Infinity;
    for (let i = 0; i < n; i++) {
      const size = source.a[i] ** 2 + source.b[i] ** 2;
      const w = (ca * source.a[i] + cb * source.b[i]) / (size || 1);
      const fit = w * Math.sqrt(size);
      if (fit > best) Object.assign(out, { i0: i, i1: i, w0: Math.max(0, w), w1: 0 }), (best = fit);
    }
    return out;
  };
}

/** Coordinates of a color in a theme's ramps (useful for inspecting a pixel). */
export function coordinatesOf(
  [r, g, b]: Triple,
  source: Theme = defaultSource,
): Coordinates {
  const { t, i0, i1, w0, w1 } = decomposer(frame(source))(oklabFromRgb(r, g, b));
  const weights: Partial<Record<Hue, number>> = {};
  if (w0 > 1e-6) weights[hues[i0]] = w0;
  if (w1 > 1e-6) weights[hues[i1]] = (weights[hues[i1]] ?? 0) + w1;
  return { t, weights };
}

/**
 * Map gamma-encoded sRGB channels (0–1) from the source theme into the target
 * theme, with the target's `images` settings, or its `svgs` settings for SVGs.
 */
export function recolorer(target: Theme, options: RecolorOptions = {}, media: "images" | "svgs" = "images") {
  const to = frame(target);
  const strength = target[media]?.strength ?? 1,
    tint = target[media]?.tint ?? 1;
  if (!(strength >= 0 && strength <= 1))
    throw new RangeError("strength must be between 0 and 1");
  if (!(tint >= 0 && tint <= 1)) throw new RangeError("tint must be between 0 and 1");
  const decompose = decomposer(frame(options.source ?? defaultSource));
  const filtered = options.filter ? colorFilter(options.filter).apply : null;
  const { low, high } = to;
  return (r: number, g: number, b: number): Triple => {
    if (filtered) [r, g, b] = filtered(r, g, b);
    const lab = oklabFromRgb(r, g, b);
    const { t: position, i0, i1, w0, w1 } = decompose(lab);
    const t = options.invert ? 1 - position : position;
    const neutral = tint + (1 - tint) * Math.max(0, 1 - w0 - w1);
    const L = fromLightness(low + t * (high - low));
    const k = 1 / Math.max(vividness(L), 1e-6);
    const [na, nb] = to.neutralAt(t);
    const mapped: Triple = [
      L,
      neutral * na + k * (w0 * to.a[i0] + w1 * to.a[i1]),
      neutral * nb + k * (w0 * to.b[i0] + w1 * to.b[i1]),
    ];
    if (strength === 1) return rgbFromOklab(mapped);
    return rgbFromOklab(
      lab.map((v, i) => v + (mapped[i] - v) * strength) as unknown as Triple,
    );
  };
}

/** A color on a theme's neutral ramp, or on a hue ramp at anchor chroma. */
export function rampColor(theme: Theme, t: number, hue?: Hue): Triple {
  const { low, high, neutralAt, a, b } = frame(theme);
  const i = hue ? hues.indexOf(hue) : -1;
  const [na, nb] = neutralAt(t);
  return rgbFromOklab([
    fromLightness(low + t * (high - low)),
    na + (i >= 0 ? a[i] : 0),
    nb + (i >= 0 ? b[i] : 0),
  ]);
}

export type Transform = (r: number, g: number, b: number) => Triple;

/**
 * Sample a transform on a size³ RGB lattice. Red varies fastest, matching
 * both the `.cube` format and WebGL's 3D texture layout.
 */
export function buildLut(transform: Transform, size = 33): Float32Array {
  const lut = new Float32Array(size ** 3 * 3);
  let o = 0;
  for (let b = 0; b < size; b++)
    for (let g = 0; g < size; g++)
      for (let r = 0; r < size; r++) {
        const x = transform(r / (size - 1), g / (size - 1), b / (size - 1));
        lut[o++] = x[0];
        lut[o++] = x[1];
        lut[o++] = x[2];
      }
  return lut;
}

/** Apply a LUT in place to RGBA pixels with trilinear interpolation. Alpha is kept. */
export function applyLut(pixels: Uint8ClampedArray, lut: Float32Array, size: number) {
  // Per-byte lattice index and fraction, shared by all three axes.
  const index = new Int32Array(256),
    frac = new Float32Array(256);
  for (let v = 0; v < 256; v++) {
    const x = (v / 255) * (size - 1);
    index[v] = Math.min(size - 2, Math.floor(x));
    frac[v] = x - index[v];
  }
  const sy = size * 3,
    sz = size * size * 3;
  for (let p = 0; p < pixels.length; p += 4) {
    const r = pixels[p],
      g = pixels[p + 1],
      b = pixels[p + 2];
    const fr = frac[r],
      fg = frac[g],
      fb = frac[b];
    const base = index[r] * 3 + index[g] * sy + index[b] * sz;
    for (let c = 0; c < 3; c++) {
      const o = base + c;
      const c00 = lut[o] + (lut[o + 3] - lut[o]) * fr;
      const c10 = lut[o + sy] + (lut[o + sy + 3] - lut[o + sy]) * fr;
      const c01 = lut[o + sz] + (lut[o + sz + 3] - lut[o + sz]) * fr;
      const c11 = lut[o + sy + sz] + (lut[o + sy + sz + 3] - lut[o + sy + sz]) * fr;
      const c0 = c00 + (c10 - c00) * fg,
        c1 = c01 + (c11 - c01) * fg;
      // Uint8ClampedArray rounds on assignment; adding 0.5 would bias up a level.
      pixels[p + c] = (c0 + (c1 - c0) * fb) * 255;
    }
  }
}

/** Apply a transform to every pixel directly (reference implementation). */
export function applyTransform(pixels: Uint8ClampedArray, transform: Transform) {
  for (let p = 0; p < pixels.length; p += 4) {
    const x = transform(pixels[p] / 255, pixels[p + 1] / 255, pixels[p + 2] / 255);
    pixels[p] = x[0] * 255;
    pixels[p + 1] = x[1] * 255;
    pixels[p + 2] = x[2] * 255;
  }
}

/** Serialize as an Adobe/Resolve `.cube` LUT, usable by ffmpeg's `lut3d` filter. */
export function toCube(lut: Float32Array, size: number, title = "Huet theme"): string {
  const lines = [`TITLE "${title.replace(/"/g, "'")}"`, `LUT_3D_SIZE ${size}`];
  for (let i = 0; i < lut.length; i += 3)
    lines.push(`${lut[i].toFixed(6)} ${lut[i + 1].toFixed(6)} ${lut[i + 2].toFixed(6)}`);
  return lines.join("\n") + "\n";
}
