/** Opaque sRGB inputs keep the initial API deterministic in browsers and on servers. */
export type Triple = readonly [number, number, number];
const clamp = (x: number) => Math.max(0, Math.min(1, x));
export function rgb(hex: string): Triple {
  if (!/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(hex))
    throw new TypeError(`Expected an opaque hex color, got ${hex}`);
  const n = parseInt(hex.slice(1), 16);
  if (hex.length === 4)
    return [((n >> 8) & 15) / 15, ((n >> 4) & 15) / 15, (n & 15) / 15];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
const linear = (v: number) =>
  v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
const gamma = (v: number) =>
  v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
/*
  A six-digit hex has 256 values per channel, so what the solver needs of each
  one is looked up. A theme measures thousands of colors, every time it's edited.
*/
const linearOf = Float64Array.from({ length: 256 }, (_, i) => linear(i / 255));
const apcaOf = Float64Array.from({ length: 256 }, (_, i) => (i / 255) ** 2.4);
/** The 24 bits of a six-digit hex color, or -1 for anything else. */
function bitsOf(hex: string): number {
  if (hex.length !== 7 || hex.charCodeAt(0) !== 35) return -1;
  let bits = 0;
  for (let i = 1; i < 7; i++) {
    const code = hex.charCodeAt(i);
    const digit =
      code >= 48 && code <= 57 ? code - 48
      : code >= 97 && code <= 102 ? code - 87
      : code >= 65 && code <= 70 ? code - 55
      : -1;
    if (digit < 0) return -1;
    bits = (bits << 4) | digit;
  }
  return bits;
}
export function luminance(hex: string): number {
  const bits = bitsOf(hex);
  if (bits >= 0) return luminanceOfBits(bits);
  const [r, g, b] = rgb(hex).map(linear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
/*
  CIE lightness L* (0–1) of a color with OKLab lightness L, treating L³ as its
  luminance (exact for neutrals). Above the toe, L* is an affine function of
  OKLab L. Near black, OKLab's cube root is infinitely steep: sRGB 0 → 1 spans
  6.7% of OKLab's lightness range but 0.27% of L*'s.
*/
export const lightnessToe = 6 / 29;
export const lightnessOf = (L: number) =>
  L > lightnessToe ? 1.16 * L - 0.16 : (24389 / 2700) * L ** 3;
export const fromLightness = (v: number) =>
  v > 0.08 ? (v + 0.16) / 1.16 : Math.cbrt((v * 2700) / 24389);
/** CIE lightness L* of a color, from 0 (black) to 1 (white). */
export function lightness(hex: string): number {
  return lightnessOf(toOklab(hex)[0]);
}
/** APCA's screen luminance, with its soft clamp near black. */
export function apcaY(hex: string): number {
  const bits = bitsOf(hex);
  if (bits >= 0) return apcaYOfBits(bits);
  const [r, g, b] = rgb(hex);
  let y = 0.2126729 * r ** 2.4 + 0.7151522 * g ** 2.4 + 0.072175 * b ** 2.4;
  if (y < 0.022) y += (0.022 - y) ** 1.414;
  return y;
}
/**
 * APCA lightness contrast (Lc) of `text` on `background`, using the APCA-W3
 * 0.0.98G-4g constants. Positive for dark text on a lighter background,
 * negative for light text on a darker one. Black on white is about 106.
 *
 * Above Lc 7.3 this matches the reference. Below it, the reference reports 0;
 * here it falls continuously to 0, so small targets on narrow ramps are still
 * reachable.
 */
export function apca(text: string, background: string): number {
  return apcaFromY(apcaY(text), apcaY(background));
}
/** `apca` from the `apcaY` of the text (`t`) and the background (`b`). */
export function apcaFromY(t: number, b: number): number {
  if (Math.abs(b - t) < 0.0005) return 0;
  const sapc = b > t
    ? (b ** 0.56 - t ** 0.57) * 1.14
    : (b ** 0.65 - t ** 0.62) * 1.14;
  return Math.sign(sapc) * Math.max(0, Math.abs(sapc) - 0.027) * 100;
}
/**
 * A background's APCA luminance with the powers `apcaFromY` raises it to.
 * Measuring many colors against one background then raises each to one power,
 * or to none when the text's powers are known too.
 */
export interface ApcaBackground {
  y: number;
  /** Under darker text, and under lighter text. */
  p56: number;
  p65: number;
}
export const apcaBackground = (y: number): ApcaBackground => ({ y, p56: y ** 0.56, p65: y ** 0.65 });
/**
 * Unsigned Lc of text with APCA luminance `t` on `background`: the same number
 * as `Math.abs(apcaFromY(t, background.y))`. `t57` and `t62` are `t ** 0.57`
 * and `t ** 0.62`, for text that's measured on many backgrounds.
 */
export function lcOn(background: ApcaBackground, t: number, t57?: number, t62?: number): number {
  if (Math.abs(background.y - t) < 0.0005) return 0;
  const sapc = background.y > t
    ? (background.p56 - (t57 ?? t ** 0.57)) * 1.14
    : (background.p65 - (t62 ?? t ** 0.62)) * 1.14;
  return Math.max(0, Math.abs(sapc) - 0.027) * 100;
}
/** How readable `color` is on `background`, as an unsigned Lc. */
export const contrast = (background: string, color: string) =>
  Math.abs(apca(color, background));
/**
 * The endpoint that text on `background` steps toward: whichever of `dark`
 * and `light` reads better on it by APCA. Ties go to `dark`. Every color on a
 * background (text, roles, signal hues and nested surfaces) shares this side.
 */
export function textEnd(background: string, dark: string, light: string): string {
  return contrast(background, light) > contrast(background, dark) ? light : dark;
}
// OKLab conversion matrices: https://bottosson.github.io/posts/oklab/
/** Gamma-encoded sRGB channels (0–1) to OKLab. */
export function oklabFromRgb(r: number, g: number, b: number): Triple {
  return oklabFromLinear(linear(r), linear(g), linear(b));
}
function oklabFromLinear(r: number, g: number, b: number): Triple {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}
export function toOklab(hex: string): Triple {
  const bits = bitsOf(hex);
  if (bits >= 0) return oklabFromLinear(linearOf[bits >> 16], linearOf[(bits >> 8) & 255], linearOf[bits & 255]);
  return oklabFromRgb(...rgb(hex));
}
/**
 * CIE LCH of an sRGB hex, as CSS `lch()` reads it: D50 white, Bradford-adapted
 * from sRGB's D65. Returns [L* (0–100), C*, h (degrees)]. L* depends only on
 * luminance, so colors that share it share their APCA contrast.
 */
export function toLch(hex: string): Triple {
  const [r, g, b] = rgb(hex).map(linear);
  const x = (0.4360747 * r + 0.3850649 * g + 0.1430804 * b) / 0.96422;
  const y = 0.2225045 * r + 0.7168786 * g + 0.0606169 * b;
  const z = (0.0139322 * r + 0.0971045 * g + 0.7141733 * b) / 0.82521;
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t + 16) / 116);
  const [fx, fy, fz] = [f(x), f(y), f(z)];
  const A = 500 * (fx - fy), B = 200 * (fy - fz);
  return [116 * fy - 16, Math.hypot(A, B), ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360];
}
/** Linear sRGB channels of a CIE LCH color (D50), unclipped: out of gamut, some fall outside 0–1. */
export function linearRgbFromLch(L: number, C: number, H: number): Triple {
  const fy = (L + 16) / 116;
  const fx = fy + (C * Math.cos((H * Math.PI) / 180)) / 500;
  const fz = fy - (C * Math.sin((H * Math.PI) / 180)) / 200;
  const inverse = (t: number) => (t ** 3 > 216 / 24389 ? t ** 3 : (116 * t - 16) / (24389 / 27));
  const x = inverse(fx) * 0.96422, y = L > 8 ? fy ** 3 : L / (24389 / 27), z = inverse(fz) * 0.82521;
  return [
    3.1338561 * x - 1.6168667 * y - 0.4906146 * z,
    -0.9787684 * x + 1.9161415 * y + 0.033454 * z,
    0.0719453 * x - 0.2289914 * y + 1.4052427 * z,
  ];
}
/** The most CIE chroma an sRGB color of lightness `L` and hue `H` can have. */
export function maxLchChroma(L: number, H: number): number {
  let lo = 0, hi = 200;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (linearRgbFromLch(L, mid, H).every((v) => v >= 0 && v <= 1)) lo = mid;
    else hi = mid;
  }
  return lo;
}
// Linear sRGB channels of the last OKLab color converted. The solver converts
// thousands of colors each time a theme is edited, so they aren't arrays.
let linearR = 0, linearG = 0, linearB = 0;
function linearFromOklab(L: number, a: number, b: number) {
  // Cubed by multiplying: about twice as fast as `** 3`, and fitting a color
  // into sRGB does this twenty times over.
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b,
    m_ = L - 0.1055613458 * a - 0.0638541728 * b,
    s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ * l_ * l_,
    m = m_ * m_ * m_,
    s = s_ * s_ * s_;
  linearR = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  linearG = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  linearB = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
}
const fits = () =>
  linearR >= -1e-7 && linearR <= 1 + 1e-7 && linearG >= -1e-7 && linearG <= 1 + 1e-7 && linearB >= -1e-7 && linearB <= 1 + 1e-7;
/** Leaves an OKLab color's linear sRGB channels, after reducing its chroma until they fit. */
function intoGamut(L: number, a: number, b: number) {
  linearFromOklab(L, a, b);
  if (fits()) return;
  let low = 0,
    high = 1;
  for (let i = 0; i < 20; i++) {
    const mid = (low + high) / 2;
    linearFromOklab(L, a * mid, b * mid);
    if (fits()) low = mid;
    else high = mid;
  }
  linearFromOklab(L, a * low, b * low);
}
/**
 * Map into gamma-encoded sRGB channels (0–1) by reducing chroma, preserving
 * OKLCH hue and lightness.
 */
export function rgbFromOklab([L, a, b]: Triple): Triple {
  intoGamut(clamp(L), a, b);
  return [clamp(gamma(linearR)), clamp(gamma(linearG)), clamp(gamma(linearB))];
}
/** `rgbFromOklab`, written into `out` at `offset`. */
export function writeRgbFromOklab(out: Float32Array, offset: number, L: number, a: number, b: number) {
  intoGamut(clamp(L), a, b);
  out[offset] = clamp(gamma(linearR));
  out[offset + 1] = clamp(gamma(linearG));
  out[offset + 2] = clamp(gamma(linearB));
}
const hexBytes = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
/** `fromOklab` as the 24 bits of its hex, for colors that are measured rather than shown. */
export function bitsFromOklab(L: number, a: number, b: number): number {
  intoGamut(clamp(L), a, b);
  return (
    (Math.round(clamp(gamma(linearR)) * 255) << 16) |
    (Math.round(clamp(gamma(linearG)) * 255) << 8) |
    Math.round(clamp(gamma(linearB)) * 255)
  );
}
export const hexOfBits = (bits: number) =>
  "#" + hexBytes[bits >> 16] + hexBytes[(bits >> 8) & 255] + hexBytes[bits & 255];
/** `apcaY` of a color as 24 bits. */
export function apcaYOfBits(bits: number): number {
  const y = 0.2126729 * apcaOf[bits >> 16] + 0.7151522 * apcaOf[(bits >> 8) & 255] + 0.072175 * apcaOf[bits & 255];
  return y < 0.022 ? y + (0.022 - y) ** 1.414 : y;
}
/** `luminance` of a color as 24 bits. */
export function luminanceOfBits(bits: number): number {
  return 0.2126 * linearOf[bits >> 16] + 0.7152 * linearOf[(bits >> 8) & 255] + 0.0722 * linearOf[bits & 255];
}
export function fromOklab(lab: Triple): string {
  return hexOfBits(bitsFromOklab(lab[0], lab[1], lab[2]));
}
export function mix(a: string, b: string, amount: number): string {
  if (!Number.isFinite(amount) || amount < 0 || amount > 1)
    throw new RangeError("Mix amount must be between 0 and 1");
  const x = toOklab(a),
    y = toOklab(b);
  if (amount === 0) return a;
  if (amount === 1) return b;
  return fromOklab(
    x.map((v, i) => v + (y[i] - v) * amount) as unknown as Triple,
  );
}
