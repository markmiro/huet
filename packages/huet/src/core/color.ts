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
export function luminance(hex: string): number {
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
// Themes measure the same few thousand colors over and over, so keep them.
const apcaYs = new Map<string, number>();
/** APCA's screen luminance, with its soft clamp near black. */
export function apcaY(hex: string): number {
  let y = apcaYs.get(hex);
  if (y !== undefined) return y;
  const [r, g, b] = rgb(hex);
  y = 0.2126729 * r ** 2.4 + 0.7151522 * g ** 2.4 + 0.072175 * b ** 2.4;
  if (y < 0.022) y += (0.022 - y) ** 1.414;
  if (apcaYs.size >= 8192) apcaYs.clear();
  apcaYs.set(hex, y);
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
  (r = linear(r)), (g = linear(g)), (b = linear(b));
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
  return oklabFromRgb(...rgb(hex));
}
function fromLab([L, a, b]: Triple): number[] {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}
/**
 * Map into gamma-encoded sRGB channels (0–1) by reducing chroma, preserving
 * OKLCH hue and lightness.
 */
const fits = ([r, g, b]: number[]) =>
  r >= -1e-7 && r <= 1 + 1e-7 && g >= -1e-7 && g <= 1 + 1e-7 && b >= -1e-7 && b <= 1 + 1e-7;
export function rgbFromOklab([L, a, b]: Triple): Triple {
  L = clamp(L);
  let channels = fromLab([L, a, b]);
  if (!fits(channels)) {
    let low = 0,
      high = 1;
    for (let i = 0; i < 20; i++) {
      const mid = (low + high) / 2;
      if (fits(fromLab([L, a * mid, b * mid]))) low = mid;
      else high = mid;
    }
    channels = fromLab([L, a * low, b * low]);
  }
  return [clamp(gamma(channels[0])), clamp(gamma(channels[1])), clamp(gamma(channels[2]))];
}
const hexBytes = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
export function fromOklab(lab: Triple): string {
  const [r, g, b] = rgbFromOklab(lab);
  return "#" + hexBytes[Math.round(r * 255)] + hexBytes[Math.round(g * 255)] + hexBytes[Math.round(b * 255)];
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
