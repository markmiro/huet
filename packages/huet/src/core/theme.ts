import chroma from "chroma-js";
import { stepper, type Surface } from "./steps";
import {
  apcaFromY,
  apcaY,
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
/**
 * A Huet theme: its colors, and how strongly explicit contrast amounts apply.
 * It's plain JSON, so presets, saved themes and the configurator all use this
 * one shape. Where the page background sits (light, dark, or in between) isn't
 * part of a theme: pass `background` when you render it.
 */
export interface Theme {
  /** The neutral ramp: two or more colors, darkest first. */
  neutral: readonly string[];
  /** How the neutral ramp blends between its colors. Defaults to `"oklab"`. */
  colorModel?: ColorModel;
  /** Anchors for the signal hues. Missing hues use Huet's defaults. */
  colors?: Partial<Record<Hue, string>>;
  /**
   * From 0 to 2, defaulting to 1. Below 1, every color fades toward the page
   * background, role colors (`huet-text`, `huet-muted`, …) included, for
   * dimmed or disabled UI. Above 1, explicit amounts such as `huet-text-60`
   * reach full contrast sooner: at 2, at half the amount.
   */
  contrast?: number;
  /**
   * Where explicit hue classes such as `huet-text-red-100` aim at full
   * strength, as a position on each hue's dark → hue → light ramp, from 0 to
   * 1: `onLight` on light backgrounds and `onDark` on dark ones. Both default
   * to 0.49. Role colors such as `huet-text-red` are chosen for readability
   * instead.
   */
  signalLightness?: { onLight: number; onDark: number };
  /**
   * How images take on the theme. `strength` 0 keeps the originals and 1 (the
   * default) fully adopts the theme. `tint` (0–1, default 1) is how much a
   * tinted neutral ramp also tints saturated colors.
   */
  images?: RecolorSettings;
  /** How inline SVGs take on the theme, set apart from `images`. Strength 0 leaves them as they are. */
  svgs?: RecolorSettings;
}

/** How strongly images or SVGs take on a theme, each from 0 to 1. Both default to 1. */
export interface RecolorSettings {
  strength?: number;
  tint?: number;
}

const themeKeys: readonly string[] = ["neutral", "colorModel", "colors", "contrast", "signalLightness", "images", "svgs"];
const legacyKeys = ["pallet", "ramps", "bgRamp", "bgRampValue", "contrastMultiplier"];
const isColor = (value: unknown) => typeof value === "string" && chroma.valid(value);

/** Throws a descriptive error unless `value` is a valid Huet theme. */
export function checkTheme(value: unknown): asserts value is Theme {
  const fail = (message: string): never => {
    throw new TypeError(`Invalid Huet theme: ${message}`);
  };
  if (typeof value !== "object" || value === null || Array.isArray(value))
    fail(`expected an object like { neutral: ["#000000", "#ffffff"] }, got ${JSON.stringify(value)}`);
  const theme = value as Record<string, unknown>;
  const keys = Object.keys(theme);
  if (keys.some((key) => legacyKeys.includes(key)))
    fail(
      "this is the old ThemeConfig format (pallet, ramps, bgRampValue, ...). " +
        "Themes are now { neutral, colorModel, colors, contrast }, and the background is passed when rendering.",
    );
  const unknown = keys.filter((key) => !themeKeys.includes(key));
  if (unknown.length)
    fail(`unknown field${unknown.length > 1 ? "s" : ""} ${unknown.join(", ")}. Themes have ${themeKeys.join(", ")}.`);
  const { neutral, colorModel, colors, contrast } = theme;
  if (!Array.isArray(neutral) || neutral.length < 2)
    fail(`neutral must be an array of two or more colors, darkest first, got ${JSON.stringify(neutral)}`);
  for (const color of neutral as unknown[])
    if (!isColor(color)) fail(`neutral has ${JSON.stringify(color)}, which isn't a color`);
  const stops = neutral as string[];
  const [darkest, lightest] = [stops[0], stops[stops.length - 1]];
  // Same measure as the solver, which can't build a ramp that runs backwards
  if (luminance(chroma(darkest).hex("rgb")) > luminance(chroma(lightest).hex("rgb")))
    fail(`neutral runs darkest first, but its first color ${darkest} is lighter than its last color ${lightest}`);
  if (colorModel !== undefined && !colorModels.includes(colorModel as ColorModel))
    fail(`colorModel must be one of ${colorModels.join(", ")}, got ${JSON.stringify(colorModel)}`);
  if (colors !== undefined) {
    if (typeof colors !== "object" || colors === null || Array.isArray(colors))
      fail(`colors must be an object like { red: "#d14457" }, got ${JSON.stringify(colors)}`);
    for (const [hue, color] of Object.entries(colors as object)) {
      if (!hues.includes(hue as Hue)) fail(`colors.${hue} isn't a hue. Hues are ${hues.join(", ")}.`);
      if (!isColor(color)) fail(`colors.${hue} is ${JSON.stringify(color)}, which isn't a color`);
    }
  }
  if (contrast !== undefined && !(typeof contrast === "number" && contrast >= 0 && contrast <= 2))
    fail(`contrast must be a number from 0 to 2, got ${JSON.stringify(contrast)}`);
  const fraction = (value: unknown) => typeof value === "number" && value >= 0 && value <= 1;
  const { signalLightness } = theme as Record<string, Record<string, unknown> | undefined>;
  if (signalLightness !== undefined) {
    const keys = Object.keys(signalLightness ?? {});
    if (typeof signalLightness !== "object" || signalLightness === null || keys.sort().join() !== "onDark,onLight"
      || !fraction(signalLightness.onLight) || !fraction(signalLightness.onDark))
      fail(`signalLightness must be { onLight, onDark }, each from 0 to 1, got ${JSON.stringify(signalLightness)}`);
  }
  for (const field of ["images", "svgs"]) {
    const settings = theme[field] as Record<string, unknown> | null | undefined;
    if (settings === undefined) continue;
    if (typeof settings !== "object" || settings === null || Object.keys(settings).some((key) => key !== "strength" && key !== "tint")
      || (settings.strength !== undefined && !fraction(settings.strength)) || (settings.tint !== undefined && !fraction(settings.tint)))
      fail(`${field} must be { strength, tint }, each from 0 to 1, got ${JSON.stringify(settings)}`);
  }
}

/** The ramp options for the engine. Two-stop OKLab ramps use the exact plain mix. */
export function rampOptionsOf({ neutral, colorModel = "oklab" }: Theme) {
  return neutral.length === 2 && colorModel === "oklab"
    ? { dark: neutral[0], light: neutral[1] }
    : { neutral: { colors: neutral, colorModel } };
}

/** Where the page background sits on a theme's neutral ramp. */
export interface BackgroundOptions {
  /** 0 is the dark end of the neutral ramp and 1 the light end. Defaults to 1. */
  background?: number;
}

/** A theme resolved against a background: the solver Huet renders with. */
export function resolveTheme(theme: Theme, { background = 1 }: BackgroundOptions = {}) {
  checkTheme(theme);
  if (typeof background !== "number" || !(background >= 0 && background <= 1))
    throw new RangeError(
      `Huet: background must be a number from 0 (dark) to 1 (light), got ${JSON.stringify(background)}`,
    );
  return createTheme({
    ...rampOptionsOf(theme),
    colors: theme.colors,
    contrast: theme.contrast,
    signalLightness: theme.signalLightness,
    background,
  });
}

export interface ThemeOptions {
  /** Global contrast multiplier for explicit relative-color classes: 0–2. */
  contrast?: number;
  /** Where explicit hue classes aim. See `Theme`. */
  signalLightness?: { onLight: number; onDark: number };
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
/** A color with its APCA luminance, for Lc. */
type Step = { color: string; y: number };
/** A step with its sRGB relative luminance too, for polarity. */
type Candidate = Step & { luminance: number };
const step = (color: string): Step => ({ color, y: apcaY(color) });
const candidate = (color: string): Candidate => ({
  ...step(color),
  luminance: luminance(color),
});
/** Unsigned Lc of a color on a background with APCA luminance `bgY`. */
const lc = (bgY: number, { y }: Step) => Math.abs(apcaFromY(y, bgY));
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
  const bgY = apcaY(background);
  let best = candidates[0].color,
    bestLc = -1,
    nearest = "",
    nearestLc = Infinity;
  for (const x of candidates) {
    const value = lc(bgY, x);
    if (value > bestLc) {
      best = x.color;
      bestLc = value;
    }
    if (value >= target && value < nearestLc) {
      nearest = x.color;
      nearestLc = value;
    }
  }
  return nearest || best;
}
/** Samples a path at 257 evenly spaced steps, on demand. */
type Steps = (i: number) => Step;
const pathSteps = 257;
/** The first step along a path that reaches the target. */
function first(steps: Steps, measure: (step: Step) => number, target: number) {
  for (let i = 0; i < pathSteps; i++)
    if (measure(steps(i)) >= target - 1e-9) return steps(i).color;
}
/** The step along any of the paths that measures highest. */
function strongest(paths: readonly Steps[], measure: (step: Step) => number) {
  let best = paths[0](0),
    bestValue = measure(best);
  for (const steps of paths)
    for (let i = 0; i < pathSteps; i++) {
      const value = measure(steps(i));
      if (value > bestValue) [best, bestValue] = [steps(i), value];
    }
  return best.color;
}
/**
 * Work that depends only on a few strings, shared between themes. Dragging one
 * color rebuilds the theme many times a second, and most of it stays the same:
 * a new hue leaves the neutral ramp and the other hues alone.
 */
const samples = new Map<string, unknown>(),
  roleTokens = new Map<string, unknown>();
function shared<T>(key: string, build: () => T, cache = samples, size = 64): T {
  if (cache.has(key)) return cache.get(key) as T;
  const value = build();
  if (cache.size >= size) cache.clear();
  cache.set(key, value);
  return value;
}
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
  // chroma-js caches a scale's colors by t to four decimals, so their hex
  // codes can be cached the same way. It's the same color, without the
  // conversion chroma-js repeats on every call.
  const hexes: string[] = [];
  const ramp = (t: number): string => {
    if (!Number.isFinite(t) || t < 0 || t > 1)
      throw new RangeError("Mix amount must be between 0 and 1");
    return custom ? (hexes[Math.floor(t * 10000)] ??= scale(t).hex()) : mix(dark, light, t);
  };
  return { custom, stops, dark, light, colorModel, ramp };
}
/** The solver behind `resolveTheme`. Internal: tests exercise it directly. */
export function createTheme(options: ThemeOptions = {}) {
  const neutralOf = neutralRampOf(options);
  const { custom, stops, dark, light, colorModel } = neutralOf;
  // Everything about the neutral ramp follows from these
  const neutralKey = `${colorModel}:${custom}:${stops}`;
  const { ramp } = shared(`ramp:${neutralKey}`, () => neutralOf);
  const background = ramp(options.background ?? 1);
  const colors = Object.freeze({ ...defaultColors, ...options.colors });
  for (const color of Object.values(colors)) rgb(color);
  const hueKeys = Object.fromEntries(
    hues.map((hue) => [hue, `${neutralKey}:${colors[hue]}`]),
  ) as Record<Hue, string>;
  const neutralLab = shared(`neutral:${neutralKey}`, () =>
    Array.from({ length: 257 }, (_, i) => toOklab(ramp(i / 256))),
  );
  /** Ramp position of a color that lies on the neutral ramp, if any. */
  const positionOf = (color: string): number | undefined => {
    const [L, a, b] = toOklab(color);
    // Compares squared distances: the same nearest sample, without Math.hypot.
    let best = -1,
      distance = Infinity;
    for (let i = 0; i < neutralLab.length; i++) {
      const [x, y, z] = neutralLab[i];
      const d = (L - x) ** 2 + (a - y) ** 2 + (b - z) ** 2;
      if (d < distance) [best, distance] = [i, d];
    }
    return distance < 0.01 ** 2 ? best / 256 : undefined;
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
        shared(`hue:${hueKeys[hue]}`, () =>
          Array.from({ length: 257 }, (_, i) =>
            candidate(fromOklab([low + ((high - low) * i) / 256, a, b])),
          ),
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
  // Steps are computed as far as they're read, and shared by surfaces on the
  // same background.
  const paths = new Map<string, Steps>();
  const stepsTo = (bg: string, endpoint: string): Steps => {
    const key = bg + endpoint;
    let steps = paths.get(key);
    if (!steps) {
      const toward = path(bg, endpoint);
      const computed: Step[] = [];
      steps = (i) => (computed[i] ??= step(toward(i / (pathSteps - 1))));
      if (paths.size >= 512) paths.clear();
      paths.set(key, steps);
    }
    return steps;
  };
  const cache = new Map<string, Readonly<Tokens>>();
  const tokens = (bg = background, adjacent = bg): Readonly<Tokens> => {
    rgb(bg);
    rgb(adjacent);
    const key = bg + adjacent;
    const cached = cache.get(key);
    if (cached) return cached;
    const result = Object.freeze({
      ...shared(`${neutralKey}|${bg}|${adjacent}`, () => neutralRoles(bg, adjacent), roleTokens, 4096),
      ...Object.fromEntries(
        hues.map((hue) => [
          hue,
          shared(
            `${hueKeys[hue]}|${bg}`,
            () => select(bg, semanticCandidates(bg, hue), roles.muted * budget),
            roleTokens,
            4096,
          ),
        ]),
      ),
    }) as Readonly<Tokens>;
    // Bound caches for continuously changing backgrounds.
    if (cache.size >= 512) cache.clear();
    cache.set(key, result);
    return result;
  };
  /** The neutral roles on `bg`, which don't depend on the signal hues. */
  function neutralRoles(bg: string, adjacent: string) {
    // Roles step from the background toward the endpoint text reads best against
    // (by APCA), so they share the text's side. On a colored surface they keep its hue.
    const end = textEnd(bg, dark, light);
    const steps = stepsTo(bg, end);
    const bgY = apcaY(bg),
      adjacentY = apcaY(adjacent);
    const onBg = (step: Step) => lc(bgY, step);
    // Where the background can't reach Lc 90, the roles keep their proportions of
    // what it can reach, so they stay distinct and ordered on narrow ramps.
    const fg = Math.min(contrast(bg, end), roles.foreground);
    const share = (role: number) => (fg * role) / roles.foreground;
    // A border also outlines the surface against its parent. When the text's side
    // can't reach the target against both, the other side may.
    const outline = (step: Step) => Math.min(onBg(step), lc(adjacentY, step));
    let border = first(steps, outline, share(roles.border));
    if (border === undefined) {
      const other = stepsTo(bg, end === light ? dark : light);
      border = first(other, outline, share(roles.border)) ?? strongest([steps, other], outline);
    }
    return {
      background: bg,
      foreground: first(steps, onBg, fg) ?? end,
      muted: first(steps, onBg, share(roles.muted)) ?? end,
      border,
    };
  }
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
  // Explicit amounts. Plain OKLab ramps keep the original solver's CIELAB ramp.
  const steps = stepper({
    neutral: stops,
    colorModel: custom ? colorModel : "lab",
    colors,
    contrast: options.contrast,
    signalLightness: options.signalLightness,
  });
  const root = steps.surfaceOf(background);
  /**
   * Role colors on `bg` (beside `parent`), as shown. They're chosen for
   * readability at full contrast, then fade with the theme's contrast below 1
   * like every other color, so a low-contrast theme dims evenly.
   */
  const tokensOn = (bg: Surface, parent: Surface = bg): Readonly<Tokens> => {
    const full = tokens(bg.full.hex, parent.full.hex);
    if ((options.contrast ?? 1) >= 1) return full;
    return Object.freeze(Object.fromEntries(
      Object.entries(full).map(([key, value]) => [key, key === "background" ? bg.hex : steps.shown(bg, value)]),
    )) as Readonly<Tokens>;
  };
  return Object.freeze({
    background, dark, light, neutral: neutralRamp, colors, ramp, tokens, tokensOn, surface,
    root, step: steps.step, surfaceOf: steps.surfaceOf, derive: steps.derive,
  });
}
export type ResolvedTheme = ReturnType<typeof createTheme>;
/** Role tokens as `--huet-*` custom properties. */
export function themeVariables(
  tokens: Readonly<Tokens>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(tokens).map(([key, value]) => [`--huet-${key}`, value]),
  );
}
