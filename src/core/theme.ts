import chroma from "chroma-js";
import { relativeRoot } from "./relative";
import {
  contrastRatio,
  fromOklab,
  luminance,
  mix,
  rgb,
  toOklab,
} from "./color";
export const hues = ["red", "yellow", "green", "blue", "purple"] as const;
export type Hue = (typeof hues)[number];
/** Interpolation spaces for the neutral ramp. Hue-based models (hcl/lch/oklch/hsl) travel around the hue wheel. */
export const colorModels = ["oklab", "oklch", "lab", "lch", "hcl", "lrgb", "rgb", "hsl", "hsv", "hsi"] as const;
export type ColorModel = (typeof colorModels)[number];
/** A neutral ramp in the shape of the legacy `ramps.gray` config. */
export interface NeutralRamp {
  /** Two or more stops, darkest first. The first and last are the endpoints. */
  colors: readonly string[];
  /** How the ramp interpolates between its stops. Defaults to OKLab. */
  colorModel?: ColorModel;
}
export interface ThemeOptions {
  /** Global contrast multiplier for explicit relative-color classes: 0–1. */
  contrast?: number;
  /** Ramp endpoints. These also bound neutral foreground colors. */
  dark?: string;
  light?: string;
  /** Full neutral ramp: stops and color model. Use instead of `dark`/`light`. */
  neutral?: NeutralRamp;
  /** Position on the neutral ramp: 0 is dark, 1 is light. */
  background?: number;
  /** Replace anchors, retaining their hue while adapting lightness/chroma. */
  colors?: Partial<Record<Hue, string>>;
}
export interface Tokens {
  background: string;
  foreground: string;
  muted: string;
  border: string;
  red: string;
  yellow: string;
  green: string;
  blue: string;
  purple: string;
}
const defaults: Record<Hue, string> = {
  red: "#d14457",
  yellow: "#9d6f00",
  green: "#298830",
  blue: "#0082dc",
  purple: "#a359b9",
};
type Candidate = { color: string; luminance: number };
const candidate = (color: string): Candidate => ({
  color,
  luminance: luminance(color),
});
const ratioOf = (a: number, b: number) =>
  (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
/** Choose a readable candidate nearest to the background, or the best available. */
function select(
  background: string,
  candidates: readonly Candidate[],
  target: number,
  adjacent = background,
): string {
  let best = candidates[0].color,
    bestRatio = 0,
    nearest = "",
    nearestRatio = Infinity;
  const bgL = luminance(background),
    adjacentL = luminance(adjacent);
  for (const { color, luminance: value } of candidates) {
    const ratio = Math.min(ratioOf(bgL, value), ratioOf(adjacentL, value));
    if (ratio > bestRatio) {
      best = color;
      bestRatio = ratio;
    }
    if (ratio >= target && ratio < nearestRatio) {
      nearest = color;
      nearestRatio = ratio;
    }
  }
  return nearest || best;
}
export function createTheme(options: ThemeOptions = {}) {
  const custom = options.neutral !== undefined;
  if (custom && (options.dark !== undefined || options.light !== undefined))
    throw new TypeError("Pass either neutral.colors or dark/light, not both");
  const stops = Object.freeze([
    ...(options.neutral?.colors ?? [options.dark ?? "#000000", options.light ?? "#ffffff"]),
  ]);
  if (stops.length < 2) throw new RangeError("neutral.colors needs at least two colors");
  for (const color of stops) rgb(color);
  const dark = stops[0],
    light = stops[stops.length - 1];
  if (luminance(dark) > luminance(light))
    throw new RangeError("dark must be darker than light");
  const colorModel = options.neutral?.colorModel ?? "oklab";
  if (!colorModels.includes(colorModel))
    throw new TypeError(`Unknown color model: ${colorModel}`);
  // Without a neutral ramp, keep the original two-point OKLab path exactly.
  const scale = chroma.scale([...stops]).mode(colorModel);
  const ramp = (t: number): string => {
    if (!Number.isFinite(t) || t < 0 || t > 1)
      throw new RangeError("Mix amount must be between 0 and 1");
    return custom ? scale(t).hex() : mix(dark, light, t);
  };
  const background = ramp(options.background ?? 1);
  const colors = Object.freeze({ ...defaults, ...options.colors });
  for (const color of Object.values(colors)) rgb(color);
  const neutral = Array.from({ length: 257 }, (_, i) =>
    candidate(ramp(i / 256)),
  );
  const neutralLab = neutral.map((x) => toOklab(x.color));
  /** Ramp position of a color that lies on the neutral ramp, if any. */
  const positionOf = (color: string): number | undefined => {
    const [L, a, b] = toOklab(color);
    let best = -1,
      distance = Infinity;
    neutralLab.forEach(([x, y, z], i) => {
      const d = Math.hypot(L - x, a - y, b - z);
      if (d < distance) [best, distance] = [i, d];
    });
    return distance < 0.01 ? best / 256 : undefined;
  };
  // Neutral surfaces follow the ramp's path (and its hues) when they start on it.
  // Colored parents fall back to a straight OKLab mix toward the endpoint.
  const path = (parent: string, end: string) => {
    const from = custom ? positionOf(parent) : undefined;
    if (from === undefined) return (amount: number) => mix(parent, end, amount);
    const to = end === dark ? 0 : 1;
    return (amount: number) =>
      amount === 0 ? parent : ramp(from + (to - from) * amount);
  };
  const low = toOklab(dark)[0],
    high = toOklab(light)[0];
  const ramps = Object.fromEntries(
    hues.map((hue) => {
      const [, a, b] = toOklab(colors[hue]);
      // Keep signal identity independent of the primary endpoint hue.
      return [
        hue,
        Array.from({ length: 257 }, (_, i) =>
          candidate(fromOklab([low + ((high - low) * i) / 256, a, b])),
        ),
      ];
    }),
  ) as Record<Hue, Candidate[]>;
  // Polarity belongs to the background, never to an individual hue or role.
  // Resolve ties toward dark so every semantic color crosses over together.
  const semanticCandidates = (bg: string, hue: Hue) => {
    const bgL = luminance(bg);
    const lighter = contrastRatio(bg, light) > contrastRatio(bg, dark);
    const candidates = ramps[hue].filter((x) =>
      lighter ? x.luminance >= bgL : x.luminance <= bgL,
    );
    // Degenerate/narrow ramps may have no sample on the requested side.
    // Returning the background is preferable to silently reversing polarity.
    return candidates.length ? candidates : [candidate(bg)];
  };
  const cache = new Map<string, Readonly<Tokens>>();
  const tokens = (bg = background, adjacent = bg): Readonly<Tokens> => {
    rgb(bg);
    rgb(adjacent);
    const key = bg + adjacent;
    const cached = cache.get(key);
    if (cached) return cached;
    const available = Math.max(
      contrastRatio(bg, dark),
      contrastRatio(bg, light),
    );
    // Narrow ramps deliberately lower the contrast budget, including signal colors.
    const budget = Math.min(1, (contrastRatio(dark, light) - 1) / 6);
    const result = Object.freeze({
      background: bg,
      foreground: select(bg, neutral, Math.min(7, available)),
      muted: select(bg, neutral, Math.min(4.5, available)),
      border: select(bg, neutral, 3, adjacent),
      ...Object.fromEntries(
        hues.map((hue) => [hue, select(bg, semanticCandidates(bg, hue), 1 + 3.5 * budget)]),
      ),
    }) as Readonly<Tokens>;
    // Bound caches for continuously changing backgrounds.
    if (cache.size >= 512) cache.clear();
    cache.set(key, result);
    return result;
  };
  const surfaceCache = new Map<string, string>();
  const darkL = luminance(dark),
    lightL = luminance(light);
  const fullTextRange = contrastRatio(dark, light) >= 4.5;
  const readable = (value: number) =>
    Math.max(ratioOf(value, darkL), ratioOf(value, lightL)) >= 4.5;
  const surface = (parent: string, amount: number | Hue): string => {
    const key = parent + ":" + amount;
    const cached = surfaceCache.get(key);
    if (cached) return cached;
    let color: string;
    if (typeof amount === "string") {
      if (!hues.includes(amount)) throw new TypeError(`Unknown hue: ${amount}`);
      // Require readable text on a colored fill before optimizing its contrast
      // against the parent. Some branded ramps have an unreadable middle band.
      const directional = semanticCandidates(parent, amount);
      const allowed = fullTextRange
        ? directional.filter((x) => readable(x.luminance))
        : directional;
      const budget = Math.min(1, (contrastRatio(dark, light) - 1) / 6);
      color = select(
        parent,
        allowed.length ? allowed : directional,
        1 + 2 * budget,
      );
    } else {
      const end =
        contrastRatio(parent, dark) >= contrastRatio(parent, light)
          ? dark
          : light;
      const toward = path(parent, end);
      color = toward(amount / 100);
      if (amount !== 0 && fullTextRange && !readable(luminance(color))) {
        // Nudge to the nearest readable point on this same perceptual path.
        // Never escape the configured endpoints to manufacture contrast.
        let distance = Infinity;
        for (let i = 0; i <= 256; i++) {
          const sample = toward(i / 256);
          const gap = Math.abs(i / 256 - amount / 100);
          if (gap < distance && readable(luminance(sample))) {
            color = sample;
            distance = gap;
          }
        }
      }
    }
    if (surfaceCache.size >= 512) surfaceCache.clear();
    surfaceCache.set(key, color);
    return color;
  };
  const neutralRamp: Readonly<Required<NeutralRamp>> = Object.freeze({ colors: stops, colorModel });
  const relative = relativeRoot(background, colors, neutralRamp, options.contrast, custom);
  return Object.freeze({
    background, dark, light, neutral: neutralRamp, colors, ramp, tokens, surface, relative,
  });
}
export type HuetTheme = ReturnType<typeof createTheme>;
/** The same properties can be serialized into SSR markup or used by any framework. */
export function themeVariables(
  tokens: Readonly<Tokens>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(tokens).map(([key, value]) => [`--huet-${key}`, value]),
  );
}
