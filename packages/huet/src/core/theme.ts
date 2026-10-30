import chroma from "chroma-js";
import { relativeRoot } from "./relative";
import {
  contrast,
  fromOklab,
  luminance,
  mix,
  rgb,
  textEnd,
  toOklab,
  type Triple,
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
export const defaultColors: Readonly<Record<Hue, string>> = {
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
/**
 * APCA lightness contrast (Lc) the preset roles aim for. Signal hues aim for the
 * muted level, and colored fills for the border level against their parent.
 */
const roles = { foreground: 90, muted: 60, border: 30 } as const;
/** The candidate nearest the target without falling short, or the strongest one. */
function select(
  background: string,
  candidates: readonly Candidate[],
  target: number,
): string {
  let best = candidates[0].color,
    bestLc = -1,
    nearest = "",
    nearestLc = Infinity;
  for (const { color } of candidates) {
    const lc = contrast(background, color);
    if (lc > bestLc) {
      best = color;
      bestLc = lc;
    }
    if (lc >= target && lc < nearestLc) {
      nearest = color;
      nearestLc = lc;
    }
  }
  return nearest || best;
}
/** The first step along a path that reaches the target. */
const first = (steps: readonly string[], measure: (color: string) => number, target: number) =>
  steps.find((color) => measure(color) >= target - 1e-9);
/** The step that measures highest. */
const strongest = (steps: readonly string[], measure: (color: string) => number) =>
  steps.reduce((a, b) => (measure(b) > measure(a) ? b : a));
/** Validate a theme's neutral ramp and return a sampler for it. */
export function neutralRampOf(options: Pick<ThemeOptions, "dark" | "light" | "neutral">) {
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
  return { custom, stops, dark, light, colorModel, ramp };
}
export function createTheme(options: ThemeOptions = {}) {
  const { custom, stops, dark, light, colorModel, ramp } = neutralRampOf(options);
  const background = ramp(options.background ?? 1);
  const colors = Object.freeze({ ...defaultColors, ...options.colors });
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
  /** The neutral ramp in OKLab at any position, between the precomputed samples. */
  const rampLab = (t: number): Triple => {
    const x = t * 256,
      i = Math.min(255, Math.floor(x)),
      f = x - i;
    return neutralLab[i].map((v, k) => v + (neutralLab[i + 1][k] - v) * f) as unknown as Triple;
  };
  // Neutral surfaces follow the ramp's path (and its hues) when they start on it.
  // Colored parents follow the same shape from the ramp position with their
  // lightness, offset by their own color. The hue and chroma of that offset
  // last until close to the endpoint, so steps on a blue surface stay blue
  // rather than graying as they darken or lighten.
  const path = (parent: string, end: string) => {
    const to = end === dark ? 0 : 1;
    const from = custom ? positionOf(parent) : undefined;
    if (from !== undefined)
      return (amount: number) =>
        amount === 0 ? parent : ramp(from + (to - from) * amount);
    const x = toOklab(parent);
    let start = 0;
    neutralLab.forEach(([L], i) => {
      if (Math.abs(L - x[0]) < Math.abs(neutralLab[start][0] - x[0])) start = i;
    });
    const origin = neutralLab[start];
    return (amount: number) => {
      if (amount === 0) return parent;
      if (amount === 1) return end;
      const base = rampLab(start / 256 + (to - start / 256) * amount);
      const fade = [1 - amount, 1 - amount ** 3, 1 - amount ** 3];
      return fromOklab(base.map((v, i) => v + (x[i] - origin[i]) * fade[i]) as unknown as Triple);
    };
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
  // textEnd resolves ties toward dark so every semantic color crosses over together.
  const semanticCandidates = (bg: string, hue: Hue) => {
    const bgL = luminance(bg);
    const lighter = textEnd(bg, dark, light) === light;
    const candidates = ramps[hue].filter((x) =>
      lighter ? x.luminance >= bgL : x.luminance <= bgL,
    );
    // Degenerate/narrow ramps may have no sample on the requested side.
    // Returning the background is preferable to silently reversing polarity.
    return candidates.length ? candidates : [candidate(bg)];
  };
  // The Lc between the endpoints, in whichever direction is weaker. Narrow ramps
  // deliberately lower the signal hues' targets along with it.
  const range = Math.min(contrast(dark, light), contrast(light, dark));
  const budget = Math.min(1, range / roles.foreground);
  const cache = new Map<string, Readonly<Tokens>>();
  const tokens = (bg = background, adjacent = bg): Readonly<Tokens> => {
    rgb(bg);
    rgb(adjacent);
    const key = bg + adjacent;
    const cached = cache.get(key);
    if (cached) return cached;
    // Roles step from the background toward the endpoint text reads best against
    // (by APCA), so they share the text's side. On a colored surface they keep its hue.
    const end = textEnd(bg, dark, light);
    const stepsTo = (endpoint: string) => {
      const toward = path(bg, endpoint);
      return Array.from({ length: 257 }, (_, i) => toward(i / 256));
    };
    const steps = stepsTo(end);
    const onBg = (color: string) => contrast(bg, color);
    // Where the background can't reach Lc 90, the roles keep their proportions of
    // what it can reach, so they stay distinct and ordered on narrow ramps.
    const fg = Math.min(onBg(end), roles.foreground);
    const share = (role: number) => (fg * role) / roles.foreground;
    // A border also outlines the surface against its parent. When the text's side
    // can't reach the target against both, the other side may.
    const outline = (color: string) => Math.min(onBg(color), contrast(adjacent, color));
    let border = first(steps, outline, share(roles.border));
    if (border === undefined) {
      const other = stepsTo(end === light ? dark : light);
      border = first(other, outline, share(roles.border)) ?? strongest([...steps, ...other], outline);
    }
    const result = Object.freeze({
      background: bg,
      foreground: first(steps, onBg, fg) ?? end,
      muted: first(steps, onBg, share(roles.muted)) ?? end,
      border,
      ...Object.fromEntries(
        hues.map((hue) => [hue, select(bg, semanticCandidates(bg, hue), roles.muted * budget)]),
      ),
    }) as Readonly<Tokens>;
    // Bound caches for continuously changing backgrounds.
    if (cache.size >= 512) cache.clear();
    cache.set(key, result);
    return result;
  };
  const surfaceCache = new Map<string, string>();
  // A fill is readable when muted-level text fits on it on one side or the other.
  const fullTextRange = range >= roles.muted;
  const readable = (color: string) =>
    Math.max(contrast(color, dark), contrast(color, light)) >= roles.muted;
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
        ? directional.filter((x) => readable(x.color))
        : directional;
      color = select(
        parent,
        allowed.length ? allowed : directional,
        roles.border * budget,
      );
    } else {
      const toward = path(parent, textEnd(parent, dark, light));
      color = toward(amount / 100);
      if (amount !== 0 && fullTextRange && !readable(color)) {
        // Nudge to the nearest readable point on this same perceptual path.
        // Never escape the configured endpoints to manufacture contrast.
        let distance = Infinity;
        for (let i = 0; i <= 256; i++) {
          const sample = toward(i / 256);
          const gap = Math.abs(i / 256 - amount / 100);
          if (gap < distance && readable(sample)) {
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
