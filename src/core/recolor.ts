import { oklabFromRgb, rgbFromOklab, toOklab, type Triple } from "./color";
import { defaultColors, hues, type Hue } from "./theme";

/*
  A theme's ramps form a coordinate system for colors:

  - `t` is the position along the neutral dark → light ramp (OKLab lightness).
  - Chroma is measured from the neutral ramp at that position and expressed as
    a weighted sum of the two neighboring hue anchors (red/yellow, yellow/green,
    …). A weight of 1 means "as colorful as this theme's anchor".

  Recoloring decomposes each pixel in a source theme and recomposes it in a
  target theme, so grays follow the target's neutral ramp, reds become the
  target's red, and so on. The mapping is a fixed function of RGB, so it can be
  baked into a 3D lookup table once per theme and applied cheaply (or on a GPU).
*/

/** The parts of a theme that define its color coordinates. */
export interface Palette {
  dark?: string;
  light?: string;
  colors?: Partial<Record<Hue, string>>;
}

export interface Coordinates {
  /** Position on the dark → light ramp: 0 is dark, 1 is light. */
  t: number;
  /** Neighboring hue ramps and their weights (1 = anchor chroma). */
  weights: Partial<Record<Hue, number>>;
}

export interface RecolorOptions {
  /** The theme the image is assumed to be in. Defaults to Huet's default theme. */
  source?: Palette;
  /** 0 keeps the original color, 1 fully adopts the target theme. */
  strength?: number;
  /**
   * Flip the lightness coordinate. Off by default so light stays light and
   * dark stays dark; meant for UI screenshots shown in an opposite-polarity
   * theme, since inverted photos read as negatives.
   */
  invert?: boolean;
  /**
   * How much a tinted neutral ramp also tints saturated colors. At 1 (the
   * default), chroma is added on top of the neutral ramp, so a yellow-tinted
   * ramp turns blue skies teal. At 0, the tint fades out as colors approach
   * anchor saturation, keeping hues closer to the theme's anchors.
   */
  tint?: number;
}

interface Frame {
  dark: Triple;
  light: Triple;
  /** OKLab (a, b) chroma vectors of each hue anchor, in `hues` order. */
  a: Float64Array;
  b: Float64Array;
}

function frame({ dark = "#000000", light = "#ffffff", colors }: Palette): Frame {
  const anchors = hues.map((hue) => toOklab(colors?.[hue] ?? defaultColors[hue]));
  return {
    dark: toOklab(dark),
    light: toOklab(light),
    a: Float64Array.from(anchors, (x) => x[1]),
    b: Float64Array.from(anchors, (x) => x[2]),
  };
}

/** Express OKLab colors in a palette's ramp coordinates. */
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
  const [dL, da, db] = source.dark,
    [lL, la, lb] = source.light;
  const span = lL - dL || 1;
  const out = { t: 0, i0: 0, i1: 0, w0: 0, w1: 0 };
  return ([L, a, b]: Triple) => {
    const t = (L - dL) / span;
    // Chroma relative to the (possibly tinted) neutral ramp at this lightness.
    const ca = a - (da + t * (la - da)),
      cb = b - (db + t * (lb - db));
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

/** Coordinates of a color in a palette's ramps (useful for inspecting a pixel). */
export function coordinatesOf(
  [r, g, b]: Triple,
  source: Palette = {},
): Coordinates {
  const { t, i0, i1, w0, w1 } = decomposer(frame(source))(oklabFromRgb(r, g, b));
  const weights: Partial<Record<Hue, number>> = {};
  if (w0 > 1e-6) weights[hues[i0]] = w0;
  if (w1 > 1e-6) weights[hues[i1]] = (weights[hues[i1]] ?? 0) + w1;
  return { t, weights };
}

/** Map gamma-encoded sRGB channels (0–1) from the source theme into the target theme. */
export function recolorer(target: Palette, options: RecolorOptions = {}) {
  const strength = options.strength ?? 1,
    tint = options.tint ?? 1;
  if (!(strength >= 0 && strength <= 1))
    throw new RangeError("strength must be between 0 and 1");
  if (!(tint >= 0 && tint <= 1)) throw new RangeError("tint must be between 0 and 1");
  const decompose = decomposer(frame(options.source ?? {}));
  const to = frame(target);
  const [dL, da, db] = to.dark,
    [lL, la, lb] = to.light;
  return (r: number, g: number, b: number): Triple => {
    const lab = oklabFromRgb(r, g, b);
    const { t: position, i0, i1, w0, w1 } = decompose(lab);
    const t = options.invert ? 1 - position : position;
    const neutral = tint + (1 - tint) * Math.max(0, 1 - w0 - w1);
    const mapped: Triple = [
      dL + t * (lL - dL),
      neutral * (da + t * (la - da)) + w0 * to.a[i0] + w1 * to.a[i1],
      neutral * (db + t * (lb - db)) + w0 * to.b[i0] + w1 * to.b[i1],
    ];
    if (strength === 1) return rgbFromOklab(mapped);
    return rgbFromOklab(
      lab.map((v, i) => v + (mapped[i] - v) * strength) as unknown as Triple,
    );
  };
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
      pixels[p + c] = (c0 + (c1 - c0) * fb) * 255 + 0.5;
    }
  }
}

/** Apply a transform to every pixel directly (reference implementation). */
export function applyTransform(pixels: Uint8ClampedArray, transform: Transform) {
  for (let p = 0; p < pixels.length; p += 4) {
    const x = transform(pixels[p] / 255, pixels[p + 1] / 255, pixels[p + 2] / 255);
    pixels[p] = x[0] * 255 + 0.5;
    pixels[p + 1] = x[1] * 255 + 0.5;
    pixels[p + 2] = x[2] * 255 + 0.5;
  }
}

/** Serialize as an Adobe/Resolve `.cube` LUT, usable by ffmpeg's `lut3d` filter. */
export function toCube(lut: Float32Array, size: number, title = "Huet theme"): string {
  const lines = [`TITLE "${title.replace(/"/g, "'")}"`, `LUT_3D_SIZE ${size}`];
  for (let i = 0; i < lut.length; i += 3)
    lines.push(`${lut[i].toFixed(6)} ${lut[i + 1].toFixed(6)} ${lut[i + 2].toFixed(6)}`);
  return lines.join("\n") + "\n";
}
