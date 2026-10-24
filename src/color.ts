/** OKLab triple: lightness 0..1, a, b. */
export type Oklab = [l: number, a: number, b: number];

const srgbToLinear = (c: number) =>
  c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
const linearToSrgb = (c: number) =>
  c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;

export function rgbToOklab([r, g, b]: [number, number, number]): Oklab {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

export function oklabToRgb([L, A, B]: Oklab): [number, number, number] {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    linearToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Parses the color formats a theme is likely to use: hex, rgb(), oklch() and oklab().
 * Anything fancier should be converted before it reaches Huet.
 */
export function parseColor(input: string): Oklab {
  const str = input.trim().toLowerCase();
  const hex = str.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (hex) {
    const h = hex[1].length === 3 ? [...hex[1]].map((c) => c + c).join("") : hex[1];
    return rgbToOklab([0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as [
      number,
      number,
      number,
    ]);
  }
  const fn = str.match(/^(rgb|oklch|oklab)a?\(([^)]*)\)$/);
  if (fn) {
    const parts = fn[2]
      .split(/[\s,/]+/)
      .filter(Boolean)
      .map((p) => (p.endsWith("%") ? parseFloat(p) / 100 : parseFloat(p)));
    if (parts.length >= 3 && parts.slice(0, 3).every(Number.isFinite)) {
      const [x, y, z] = parts;
      if (fn[1] === "rgb") {
        const scale = (v: number, raw: string) => (raw.endsWith("%") ? v : v / 255);
        const raw = fn[2].split(/[\s,/]+/).filter(Boolean);
        return rgbToOklab([scale(x, raw[0]), scale(y, raw[1]), scale(z, raw[2])]);
      }
      if (fn[1] === "oklab") return [x, y, z];
      const h = (z * Math.PI) / 180;
      return [x, y * Math.cos(h), y * Math.sin(h)];
    }
  }
  throw new Error(`Huet can't parse the color "${input}". Use hex, rgb(), oklch() or oklab().`);
}

export function toHex(lab: Oklab): string {
  return (
    "#" +
    oklabToRgb(lab)
      .map((c) => Math.round(clamp01(c) * 255).toString(16).padStart(2, "0"))
      .join("")
  );
}

const round = (n: number, digits = 4) => Number(n.toFixed(digits));

export function toCss(lab: Oklab): string {
  return `oklab(${round(lab[0])} ${round(lab[1])} ${round(lab[2])})`;
}

export function mix(a: Oklab, b: Oklab, t: number): Oklab {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

export function chroma(lab: Oklab): number {
  return Math.hypot(lab[1], lab[2]);
}

export function hue(lab: Oklab): number {
  const h = (Math.atan2(lab[2], lab[1]) * 180) / Math.PI;
  return h < 0 ? h + 360 : h;
}

// Björn Ottosson's "toe" makes OKLab lightness track CIELAB L* in the darks,
// so equal steps look equal in dark themes too.
const K1 = 0.206;
const K2 = 0.03;
const K3 = (1 + K1) / (1 + K2);
export const TOE = { k1: K1, k2: K2, k3: K3 };

export function toe(l: number): number {
  const x = K3 * l - K1;
  return 0.5 * (x + Math.sqrt(x * x + 4 * K2 * K3 * l));
}

export function toeInv(lr: number): number {
  return (lr * lr + K1 * lr) / (K3 * (lr + K2));
}

/** Relative luminance (Y) of an OKLab color, after clipping to sRGB. */
export function luminance(lab: Oklab): number {
  const [r, g, b] = oklabToRgb(lab).map((c) => srgbToLinear(clamp01(c)));
  return 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
}

/** APCA lightness contrast (Lc) of text on a background. Sign encodes polarity. */
export function apca(text: Oklab, background: Oklab): number {
  const clampBlack = (y: number) => (y < 0.022 ? y + (0.022 - y) ** 1.414 : y);
  const yt = clampBlack(luminance(text));
  const yb = clampBlack(luminance(background));
  if (Math.abs(yb - yt) < 0.0005) return 0;
  if (yb > yt) {
    const s = (yb ** 0.56 - yt ** 0.57) * 1.14;
    return s < 0.1 ? 0 : (s - 0.027) * 100;
  }
  const s = (yb ** 0.65 - yt ** 0.62) * 1.14;
  return s > -0.1 ? 0 : (s + 0.027) * 100;
}

/** WCAG 2 contrast ratio. Handy in tests because everyone knows the thresholds. */
export function wcag(a: Oklab, b: Oklab): number {
  const ya = luminance(a);
  const yb = luminance(b);
  return (Math.max(ya, yb) + 0.05) / (Math.min(ya, yb) + 0.05);
}
