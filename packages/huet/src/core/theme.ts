import chroma from "chroma-js";
import { stepper, type Surface } from "./steps";
import {
  apcaBackground,
  apcaY,
  apcaYOfBits,
  bitsFromOklab,
  contrast,
  hexOfBits,
  lcOn,
  luminanceOfBits,
  luminance,
  mix,
  rgb,
  textEnd,
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
   * dimmed or disabled UI, and so do images and SVGs that `mountImages` and
   * `mountSvgs` recolor. Above 1, explicit amounts such as `huet-text-60`
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
/**
 * A color a signal hue can take, with its APCA luminance for Lc, its relative
 * luminance for polarity, and the powers APCA raises its luminance to: a
 * candidate is measured on every surface.
 */
type Candidate = { color: string; y: number; luminance: number; y57: number; y62: number };
const candidateOf = (color: string, y: number, luminance: number): Candidate => ({
  color, y, luminance, y57: y ** 0.57, y62: y ** 0.62,
});
const candidate = (color: string) => candidateOf(color, apcaY(color), luminance(color));
/**
 * APCA lightness contrast (Lc) the preset roles aim for. Signal hues aim for the
 * muted level, and colored fills for the border level against their parent.
 */
const roles = { foreground: 90, muted: 60, border: 30 } as const;
/**
 * The candidate nearest the target without falling short, or the strongest one.
 * With `side`, only candidates on that side of the background's luminance
 * count, and the background itself stands in when there are none.
 */
function select(
  background: string,
  candidates: readonly Candidate[],
  target: number,
  side?: { lighter: boolean; luminance: number },
): string {
  const bg = apcaBackground(apcaY(background));
  let best: string | undefined,
    bestLc = -1,
    nearest = "",
    nearestLc = Infinity;
  for (const x of candidates) {
    if (side && (side.lighter ? x.luminance < side.luminance : x.luminance > side.luminance)) continue;
    const value = lcOn(bg, x.y, x.y57, x.y62);
    if (value > bestLc) {
      best = x.color;
      bestLc = value;
    }
    if (value >= target && value < nearestLc) {
      nearest = x.color;
      nearestLc = value;
    }
  }
  return nearest || (best ?? background);
}
/** A path sampled at 257 evenly spaced steps, on demand. */
interface Steps {
  /** Step `i`'s color. */
  color: (i: number) => string;
  /** Step `i`'s APCA luminance. */
  y: (i: number) => number;
  /** The Lc of step `i` on the background the path starts from. */
  lc: (i: number) => number;
  /**
   * Whether every step after the first is at least as far from the background
   * in luminance as the step before it, so its Lc only grows along the path.
   */
  rising: boolean;
}
const pathSteps = 257;
/** A step's strength, by its path and index. */
type Measure = (steps: Steps, i: number) => number;
/** The first step along a path that reaches the target. */
function first(steps: Steps, measure: Measure, target: number) {
  for (let i = 0; i < pathSteps; i++)
    if (measure(steps, i) >= target - 1e-9) return steps.color(i);
}
/**
 * `first`, for a measure that only grows from step 1 on: the same step, found
 * by bisecting rather than sampling the path all the way there.
 */
function firstRising(steps: Steps, measure: Measure, target: number) {
  if (measure(steps, 0) >= target - 1e-9) return steps.color(0);
  let low = 1,
    high = pathSteps;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (measure(steps, middle) >= target - 1e-9) high = middle;
    else low = middle + 1;
  }
  return low < pathSteps ? steps.color(low) : undefined;
}
/** The step along any of the paths that measures highest. */
function strongest(paths: readonly Steps[], measure: Measure) {
  let best = paths[0].color(0),
    bestValue = measure(paths[0], 0);
  for (const steps of paths)
    for (let i = 0; i < pathSteps; i++) {
      const value = measure(steps, i);
      if (value > bestValue) [best, bestValue] = [steps.color(i), value];
    }
  return best;
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
/** Solvers by everything but the background, most recent last. */
const solvers = new Map<string, ReturnType<typeof createSolver>>();
/** The solver behind `resolveTheme`. Internal: tests exercise it directly. */
export function createTheme(options: ThemeOptions = {}) {
  const neutralOf = neutralRampOf(options);
  const { custom, stops, colorModel } = neutralOf;
  const colors = Object.freeze({ ...defaultColors, ...options.colors });
  for (const color of Object.values(colors)) rgb(color);
  // Only the page background and `root` depend on where the background sits.
  // The configurator resolves one theme on many backgrounds, and a page, its
  // images and the configurator each resolve the theme being edited, so they
  // all share one solver and its caches.
  const key = JSON.stringify([colorModel, custom, stops, colors, options.contrast, options.signalLightness]);
  let solver = solvers.get(key);
  if (solver) solvers.delete(key);
  else {
    solver = createSolver(options, neutralOf, colors);
    if (solvers.size >= 32) solvers.delete(solvers.keys().next().value!);
  }
  solvers.set(key, solver);
  const { tokens, steps, ...rest } = solver;
  const background = solver.ramp(options.background ?? 1);
  return Object.freeze({
    background,
    ...rest,
    /** Role colors on `bg`, the page background by default, beside `adjacent`. */
    tokens: (bg = background, adjacent = bg) => tokens(bg, adjacent),
    root: steps.surfaceOf(background),
    step: steps.step,
    surfaceOf: steps.surfaceOf,
    derive: steps.derive,
  });
}
/** Everything about a theme that's the same on every background. */
function createSolver(
  options: ThemeOptions,
  neutralOf: ReturnType<typeof neutralRampOf>,
  colors: Readonly<Record<Hue, string>>,
) {
  const { custom, stops, dark, light, colorModel } = neutralOf;
  // Everything about the neutral ramp follows from these
  const neutralKey = `${colorModel}:${custom}:${stops}`;
  const { ramp } = shared(`ramp:${neutralKey}`, () => neutralOf);
  const hueKeys = Object.fromEntries(
    hues.map((hue) => [hue, `${neutralKey}:${colors[hue]}`]),
  ) as Record<Hue, string>;
  const neutralLab = shared(`neutral:${neutralKey}`, () =>
    Array.from({ length: 257 }, (_, i) => toOklab(ramp(i / 256))),
  );
  // Whether red, green and blue each only grow along the neutral ramp, as on
  // most ramps. Then so does luminance, at any two positions, which is what
  // lets a path along the ramp be bisected.
  const channelsRise = custom && shared(`rising:${neutralKey}`, () => {
    let last = 0;
    for (let i = 0; i <= 256; i++) {
      const bits = parseInt(ramp(i / 256).slice(1, 7), 16);
      if ((bits >> 16) < (last >> 16) || ((bits >> 8) & 255) < ((last >> 8) & 255) || (bits & 255) < (last & 255))
        return false;
      last = bits;
    }
    return true;
  });
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
  // Neutral surfaces follow the ramp's path (and its hues) when they start on it.
  // Colored parents follow the same shape from the ramp position with their
  // lightness, offset by their own color. The hue and chroma of that offset
  // last until close to the endpoint, so steps on a blue surface stay blue
  // rather than graying as they darken or lighten.
  const path = (parent: string, end: string) => {
    const to = end === dark ? 0 : 1;
    const from = custom ? positionOf(parent) : undefined;
    if (from !== undefined)
      return Object.assign(
        (amount: number) => (amount === 0 ? parent : ramp(from + (to - from) * amount)),
        { onRamp: true },
      );
    const x = toOklab(parent);
    let start = 0;
    neutralLab.forEach(([L], i) => {
      if (Math.abs(L - x[0]) < Math.abs(neutralLab[start][0] - x[0])) start = i;
    });
    const origin = neutralLab[start];
    /** The path's color strictly between its ends, as 24 bits. */
    const bits = (amount: number) => {
      // The neutral ramp in OKLab at this position, between the precomputed
      // samples, plus the parent's offset from the ramp. No arrays: a scan
      // samples a path a couple of hundred times.
      const position = (start / 256 + (to - start / 256) * amount) * 256,
        i = Math.min(255, Math.floor(position)),
        f = position - i;
      const [L0, a0, b0] = neutralLab[i],
        [L1, a1, b1] = neutralLab[i + 1];
      const keep = 1 - amount ** 3;
      return bitsFromOklab(
        L0 + (L1 - L0) * f + (x[0] - origin[0]) * (1 - amount),
        a0 + (a1 - a0) * f + (x[1] - origin[1]) * keep,
        b0 + (b1 - b0) * f + (x[2] - origin[2]) * keep,
      );
    };
    return Object.assign(
      (amount: number) => (amount === 0 ? parent : amount === 1 ? end : hexOfBits(bits(amount))),
      { bits },
    );
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
          Array.from({ length: 257 }, (_, i) => {
            const bits = bitsFromOklab(low + ((high - low) * i) / 256, a, b);
            return candidateOf(hexOfBits(bits), apcaYOfBits(bits), luminanceOfBits(bits));
          }),
        ),
      ];
    }),
  ) as Record<Hue, Candidate[]>;
  // Polarity belongs to the background, never to an individual hue or role.
  // textEnd resolves ties toward dark so every semantic color crosses over together.
  const sideOf = (bg: string) => ({ lighter: textEnd(bg, dark, light) === light, luminance: luminance(bg) });
  const semanticCandidates = (bg: string, hue: Hue) => {
    const { lighter, luminance: bgL } = sideOf(bg);
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
      // A scan measures every step on its way, and shows one. So a step's
      // luminance comes straight from its channels where it can, and its
      // hex is only written when it's asked for.
      const colors: (string | undefined)[] = [];
      const ys = new Float64Array(pathSteps).fill(-1);
      const bits = new Int32Array("bits" in toward ? pathSteps : 0);
      const sample = (i: number) => {
        const amount = i / (pathSteps - 1);
        // The ends are the colors as given, which may not be six-digit hex.
        if ("bits" in toward && i > 0 && i < pathSteps - 1) return (ys[i] = apcaYOfBits((bits[i] = toward.bits(amount))));
        return (ys[i] = apcaY((colors[i] = toward(amount))));
      };
      const y = (i: number) => (ys[i] >= 0 ? ys[i] : sample(i));
      const color = (i: number) => {
        if (ys[i] < 0) sample(i);
        return (colors[i] ??= hexOfBits(bits[i]));
      };
      // The roles scan a path once each, from the start, and measure every step on the way.
      const on = apcaBackground(apcaY(bg));
      const measured = new Float64Array(pathSteps).fill(-1);
      // Step 0 is the background itself, which may sit a little off the ramp,
      // on either side of step 1. From there the ramp only moves away.
      const rising = channelsRise && "onRamp" in toward && (endpoint === dark ? y(1) <= on.y : y(1) >= on.y);
      steps = {
        color,
        y,
        lc: (i: number) => (measured[i] >= 0 ? measured[i] : (measured[i] = lcOn(on, y(i)))),
        rising,
      };
      if (paths.size >= 512) paths.clear();
      paths.set(key, steps);
    }
    return steps;
  };
  const cache = new Map<string, Readonly<Tokens>>();
  const tokens = (bg: string, adjacent: string): Readonly<Tokens> => {
    rgb(bg);
    rgb(adjacent);
    const key = bg + adjacent;
    const cached = cache.get(key);
    if (cached) return cached;
    let side: ReturnType<typeof sideOf> | undefined;
    const result = Object.freeze({
      ...shared(`${neutralKey}|${bg}|${adjacent}`, () => neutralRoles(bg, adjacent), roleTokens, 4096),
      ...Object.fromEntries(
        hues.map((hue) => [
          hue,
          shared(
            `${hueKeys[hue]}|${bg}`,
            // As `semanticCandidates`, without a list of them for every hue on every surface
            () => select(bg, ramps[hue], roles.muted * budget, (side ??= sideOf(bg))),
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
    const onBg: Measure = (path, i) => path.lc(i);
    // Where the background can't reach Lc 90, the roles keep their proportions of
    // what it can reach, so they stay distinct and ordered on narrow ramps.
    const fg = Math.min(contrast(bg, end), roles.foreground);
    const share = (role: number) => (fg * role) / roles.foreground;
    // A border also outlines the surface against its parent. When the text's side
    // can't reach the target against both, the other side may.
    const beside = apcaBackground(apcaY(adjacent));
    const outline: Measure =
      adjacent === bg ? onBg : (path, i) => Math.min(path.lc(i), lcOn(beside, path.y(i)));
    const reach = steps.rising ? firstRising : first;
    // Against the parent, Lc only grows if the path moves away from it too.
    const outlineRises = adjacent === bg || (end === dark ? beside.y >= steps.y(1) : beside.y <= steps.y(1));
    let border = (steps.rising && outlineRises ? firstRising : first)(steps, outline, share(roles.border));
    if (border === undefined) {
      const other = stepsTo(bg, end === light ? dark : light);
      border = first(other, outline, share(roles.border)) ?? strongest([steps, other], outline);
    }
    return {
      background: bg,
      foreground: reach(steps, onBg, fg) ?? end,
      muted: reach(steps, onBg, share(roles.muted)) ?? end,
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
  return { dark, light, neutral: neutralRamp, colors, ramp, tokens, tokensOn, surface, steps };
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
