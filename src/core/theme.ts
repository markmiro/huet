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
export interface ThemeOptions {
  /** Global contrast multiplier for explicit relative-color classes: 0–1. */
  contrast?: number;
  /** Ramp endpoints. These also bound neutral foreground colors. */
  dark?: string;
  light?: string;
  /** Position on the OKLab ramp: 0 is dark, 1 is light. */
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
  const dark = options.dark ?? "#000000",
    light = options.light ?? "#ffffff";
  rgb(dark);
  rgb(light);
  if (luminance(dark) > luminance(light))
    throw new RangeError("dark must be darker than light");
  const background = mix(dark, light, options.background ?? 1);
  const colors = Object.freeze({ ...defaults, ...options.colors });
  for (const color of Object.values(colors)) rgb(color);
  const neutral = Array.from({ length: 257 }, (_, i) =>
    candidate(mix(dark, light, i / 256)),
  );
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
      color = mix(parent, end, amount / 100);
      if (amount !== 0 && fullTextRange && !readable(luminance(color))) {
        // Nudge to the nearest readable point on this same perceptual path.
        // Never escape the configured endpoints to manufacture contrast.
        let distance = Infinity;
        for (let i = 0; i <= 256; i++) {
          const sample = mix(parent, end, i / 256);
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
  const relative = relativeRoot(dark, light, background, colors, options.contrast);
  return Object.freeze({ background, dark, light, colors, tokens, surface, relative });
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
