import chroma from "chroma-js";

import { fromOklab, toOklab, type Triple } from "./color";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * A ramp from `dark` through `colors` to `light`, in OKLab. Its lightness runs
 * evenly from one end to the other. Its hue and chroma come from the nearest
 * colors, in lightness order, so a palette that shifts hue as it darkens, such
 * as amber's yellow to brown, keeps that shift. Past the darkest and lightest
 * colors, the chroma lasts until close to the ends, then meets them, like
 * Huet's steps on a colored surface. Colors that don't fit in sRGB lose chroma
 * and keep their hue and lightness.
 *
 * The configurator draws each hue's ramp this way, and pages that place their
 * own colors on a theme (an accent, a chart palette) use the same ramp, so the
 * configurator shows what the page paints.
 */
export function rampThrough(dark: string, light: string, colors: readonly string[] = []) {
  [dark, light] = [chroma(dark).hex(), chroma(light).hex()];
  const [low, ...lowAb] = toOklab(dark),
    [high, ...highAb] = toOklab(light);
  // Only colors strictly between the ends: one outside them would fold the ramp back.
  const anchors = colors
    .map((color) => toOklab(chroma(color).hex()))
    .filter(([L]) => L > low && L < high)
    .sort((x, y) => x[0] - y[0]);
  /** The OKLab a and b at lightness `L`. */
  const ab = (L: number): [number, number] => {
    const toward = (from: Triple, end: number[], t: number): [number, number] => [
      lerp(from[1], end[0], t),
      lerp(from[2], end[1], t),
    ];
    if (!anchors.length) return toward([low, ...lowAb] as unknown as Triple, highAb, (L - low) / (high - low));
    const first = anchors[0],
      last = anchors[anchors.length - 1];
    if (L <= first[0]) return toward(first, lowAb, ((first[0] - L) / (first[0] - low)) ** 3);
    if (L >= last[0]) return toward(last, highAb, ((L - last[0]) / (high - last[0])) ** 3);
    const i = anchors.findIndex(([l]) => l >= L);
    const [below, above] = [anchors[i - 1], anchors[i]];
    return toward(below, [above[1], above[2]], (L - below[0]) / (above[0] - below[0]));
  };
  /** The ramp's color at OKLab lightness `L` (0–1), clamped to its ends. */
  const at = (L: number) => {
    if (!(L > low)) return dark;
    if (L >= high) return light;
    return fromOklab([L, ...ab(L)]);
  };
  /** The color `t` of the way from dark (0) to light (1). */
  const sample = (t: number) => at(lerp(low, high, t));
  return Object.assign(sample, {
    at,
    /** The colors the ramp passes through, ends included, darkest first. */
    stops: Object.freeze([dark, ...anchors.map((lab) => fromOklab(lab)), light]),
  });
}
export type RampThrough = ReturnType<typeof rampThrough>;
