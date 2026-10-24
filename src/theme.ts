import { apca, mix, parseColor, toCss, toe, toeInv, wcag, type Oklab } from "./color.ts";

/** What you write. Every field is optional; missing fields come from `defaultTheme`. */
export interface ThemeInput {
  /** The dark end of the neutral ramp. Text on a light page uses this at full contrast. */
  dark?: string;
  /** The light end of the neutral ramp. */
  light?: string;
  /** Page background as a position on the neutral ramp: 0 = `dark`, 1 = `light`. */
  bg?: number;
  /** Multiplies every contrast amount. 1 is normal, 0.5 looks disabled, 1.5 is high contrast. */
  contrast?: number;
  /** Accent colors by name. Each becomes `bg-{name}-*`, `text-{name}-*`, `hue-{name}`, ... */
  hues?: Record<string, string>;
}

/** A complete, validated theme. JSON-serializable, so it can be shared between CSS and JS. */
export interface Theme {
  dark: string;
  light: string;
  bg: number;
  contrast: number;
  hues: Record<string, string>;
}

export const defaultTheme: Theme = Object.freeze({
  dark: "#000000",
  light: "#ffffff",
  bg: 1,
  contrast: 1,
  hues: Object.freeze({
    red: "oklch(0.62 0.21 25)",
    yellow: "oklch(0.8 0.16 85)",
    green: "oklch(0.64 0.17 150)",
    blue: "oklch(0.6 0.19 255)",
    purple: "oklch(0.6 0.2 305)",
  }),
}) as Theme;

export const NEUTRAL = "neutral";
const RESERVED = new Set([NEUTRAL, "inherit", "current", "transparent", "initial", "unset"]);
const NAME = /^[a-z][a-z0-9]*$/;

/**
 * Fills in defaults and validates. Pass the result anywhere a theme is expected.
 * `base` lets named themes override only a few fields of another theme.
 */
export function createTheme(input: ThemeInput = {}, base: Theme = defaultTheme): Theme {
  const theme: Theme = {
    dark: input.dark ?? base.dark,
    light: input.light ?? base.light,
    bg: input.bg ?? base.bg,
    contrast: input.contrast ?? base.contrast,
    hues: { ...(input.hues ?? base.hues) },
  };
  parseColor(theme.dark);
  parseColor(theme.light);
  if (!(theme.bg >= 0 && theme.bg <= 1)) throw new Error(`Huet: bg must be between 0 and 1, got ${theme.bg}`);
  if (!(theme.contrast >= 0)) throw new Error(`Huet: contrast must be 0 or more, got ${theme.contrast}`);
  for (const [name, color] of Object.entries(theme.hues)) {
    if (!NAME.test(name)) throw new Error(`Huet: hue names must be lowercase letters/digits, got "${name}"`);
    if (RESERVED.has(name)) throw new Error(`Huet: "${name}" is reserved and can't be a hue name`);
    parseColor(color);
  }
  return theme;
}

/** One ramp: dark end → key color → light end, addressed by lightness position. */
export interface Ramp {
  name: string;
  color: Oklab;
  /** Position of the key color on the neutral ramp (0..1, toe-corrected lightness). */
  p: number;
  /** OKLab lightness of the key color, kept strictly between the ramp ends. */
  l: number;
  /** Smallest share of neutral contrast the hue keeps when pulled toward its key color. */
  floor: number;
}

export interface Derived {
  dark: Oklab;
  light: Oklab;
  /** OKLab lightness of the ends. */
  ld: number;
  lw: number;
  /** Toe-corrected lightness of the ends; positions are linear in this space. */
  lrd: number;
  lrw: number;
  /** Background position where text switches from light to dark (APCA and WCAG ties, averaged). */
  flip: number;
  neutral: Ramp;
  ramps: Record<string, Ramp>;
}

/** How far a hue may drift from its key color to gain contrast (share of neutral contrast). */
export const SIGNAL_FLOOR = 0.5;

const cache = new WeakMap<Theme, Derived>();

export function derive(theme: Theme): Derived {
  const hit = cache.get(theme);
  if (hit) return hit;
  let dark = parseColor(theme.dark);
  let light = parseColor(theme.light);
  if (dark[0] > light[0]) [dark, light] = [light, dark];
  const ld = dark[0];
  const lw = Math.max(light[0], ld + 0.01);
  const lrd = toe(ld);
  const lrw = toe(lw);

  const lAt = (p: number) => toeInv(lrd + p * (lrw - lrd));
  const neutralAt = (p: number) => mix(dark, light, (lAt(p) - ld) / (lw - ld));
  const posOf = (l: number) => (toe(l) - lrd) / (lrw - lrd);

  // Where light and dark text tie. Bisection is plenty: the gap is monotonic.
  const tie = (metric: (fg: Oklab, bg: Oklab) => number) => {
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      const bg = neutralAt(mid);
      if (Math.abs(metric(light, bg)) > Math.abs(metric(dark, bg))) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  };
  // APCA alone flips late (white text on #929292); WCAG alone flips early. Split the difference.
  const flip = (tie(apca) + tie(wcag)) / 2;

  const rampFor = (name: string, color: Oklab, floor: number): Ramp => {
    const margin = 0.02 * (lw - ld);
    const l = Math.min(lw - margin, Math.max(ld + margin, color[0]));
    return { name, color, l, p: posOf(l), floor };
  };

  const derived: Derived = {
    dark,
    light,
    ld,
    lw,
    lrd,
    lrw,
    flip,
    neutral: rampFor(NEUTRAL, neutralAt(0.5), 1),
    ramps: Object.fromEntries(
      Object.entries(theme.hues).map(([name, c]) => [name, rampFor(name, parseColor(c), SIGNAL_FLOOR)])
    ),
  };
  cache.set(theme, derived);
  return derived;
}

const num = (n: number) => String(Number(n.toFixed(5)));

/**
 * The CSS custom properties that define a theme. Set them on any element with
 * `data-theme` (or `:root`) to theme that subtree. Changing them is just a style
 * recalc, so live theme editing doesn't re-render anything.
 */
export function themeVars(theme: Theme | ThemeInput = defaultTheme): Record<string, string> {
  const t = isTheme(theme) ? theme : createTheme(theme);
  const d = derive(t);
  const vars: Record<string, string> = {
    "--huet-bg": num(t.bg),
    "--huet-contrast": num(t.contrast),
    "--huet-dark": toCss(d.dark),
    "--huet-light": toCss(d.light),
    "--huet-ld": num(d.ld),
    "--huet-lw": num(d.lw),
    "--huet-lrd": num(d.lrd),
    "--huet-lrw": num(d.lrw),
    "--huet-flip": num(d.flip),
  };
  for (const ramp of [d.neutral, ...Object.values(d.ramps)]) {
    vars[`--huet-hue-${ramp.name}`] = toCss(ramp.color);
    vars[`--huet-hue-${ramp.name}-p`] = num(ramp.p);
    vars[`--huet-hue-${ramp.name}-l`] = num(ramp.l);
    vars[`--huet-hue-${ramp.name}-f`] = num(ramp.floor);
  }
  return vars;
}

const applied = new WeakMap<HTMLElement, Theme>();

/**
 * Writes `themeVars` onto an element. Works in every framework (or none).
 * Partial input is merged onto the theme last applied to that element, so
 * `applyTheme(el, { bg: 0.2 })` only moves the background. Returns the full theme.
 */
export function applyTheme(element: HTMLElement, theme: Theme | ThemeInput): Theme {
  const previous = applied.get(element);
  const next = isTheme(theme) ? theme : createTheme(theme, previous ?? defaultTheme);
  const vars = themeVars(next);
  if (previous) {
    for (const key of Object.keys(themeVars(previous))) if (!(key in vars)) element.style.removeProperty(key);
  }
  for (const [key, value] of Object.entries(vars)) element.style.setProperty(key, value);
  applied.set(element, next);
  return next;
}

function isTheme(value: Theme | ThemeInput): value is Theme {
  return (
    typeof value.dark === "string" &&
    typeof value.light === "string" &&
    typeof value.bg === "number" &&
    typeof value.contrast === "number" &&
    typeof value.hues === "object"
  );
}
