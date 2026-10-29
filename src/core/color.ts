/** Opaque sRGB inputs keep the initial API deterministic in browsers and on servers. */
export type Triple = readonly [number, number, number];
const clamp = (x: number) => Math.max(0, Math.min(1, x));
export function rgb(hex: string): Triple {
  if (!/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(hex))
    throw new TypeError(`Expected an opaque hex color, got ${hex}`);
  const h =
    hex.length === 4
      ? hex
          .slice(1)
          .split("")
          .map((c) => c + c)
          .join("")
      : hex.slice(1);
  return [0, 2, 4].map(
    (i) => parseInt(h.slice(i, i + 2), 16) / 255,
  ) as unknown as Triple;
}
const linear = (v: number) =>
  v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
const gamma = (v: number) =>
  v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
export function luminance(hex: string): number {
  const [r, g, b] = rgb(hex).map(linear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrastRatio(a: string, b: string): number {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
// OKLab conversion matrices: https://bottosson.github.io/posts/oklab/
export function toOklab(hex: string): Triple {
  const [r, g, b] = rgb(hex).map(linear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
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
/** Map into sRGB by reducing chroma, preserving OKLCH hue and lightness. */
export function fromOklab([L, a, b]: Triple): string {
  L = clamp(L);
  let channels = fromLab([L, a, b]);
  const fits = (xs: number[]) => xs.every((x) => x >= -1e-7 && x <= 1 + 1e-7);
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
  return (
    "#" +
    channels
      .map((v) =>
        Math.round(clamp(gamma(v)) * 255)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
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
