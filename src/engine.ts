import { mix, toHex, toeInv, type Oklab } from "./color.ts";
import { NEUTRAL, defaultTheme, derive, type Derived, type Ramp, type Theme } from "./theme.ts";

/*
  The model, in one place. The CSS in `css.ts` is a transcription of these functions.

  Every background is a *position* p on the theme's neutral ramp (0 = dark end, 1 = light end),
  measured in toe-corrected OKLab lightness so equal steps look equal in light and dark themes.

  A color "N% contrast" away from a background at p:
  1. Direction: toward whichever end gives text more contrast (the theme's `flip` point). It
     depends only on the position, never on the parent, so contrast always wins over
     consistency.
  2. Distance: a curve that is linear at small amounts (a 10% border looks the same on white
     and on mid-gray) but always lands exactly on the far end at 100%.
  3. Hues: pulled toward their key color's lightness, but never above the neutral contrast and
     never below a floor (half of it on white/black, more when there's less room). That's what
     keeps red red on a mid-gray page without making it unreadable.
  4. Chroma: small amounts get a chroma budget, so a 10% red tint is a tint on any background.
*/

/** Amount at which a hue may use its full chroma at a given lightness. */
export const TINT = 0.3;

export interface State {
  pos: number;
  dir: number;
}

const clamp = (min: number, value: number, max: number) => Math.max(min, Math.min(value, max));
/** CSS can't branch, so steps are written as clamp(0, x * BIG, 1). Mirror that exactly. */
const step = (x: number) => clamp(0, x * 1e6, 1);

/** +1 if things on a background at `pos` get lighter, -1 if they get darker. */
export function dirAt(pos: number, d: Derived): number {
  return 1 - 2 * step(pos - d.flip);
}

export function rootState(theme: Theme): State {
  return { pos: theme.bg, dir: dirAt(theme.bg, derive(theme)) };
}

export function amount(percent: number, contrast: number): number {
  return clamp(0, (percent / 100) * contrast, 1);
}

/** New position for something `x` (0..1) contrast away from `s`, on ramp `ramp`. */
export function target(s: State, x: number, ramp: Ramp): number {
  const avail = ((1 + s.dir) / 2) * (1 - s.pos) + ((1 - s.dir) / 2) * s.pos;
  const delta = avail * (1 - Math.pow(1 - x, 1 / avail));
  // The less room there is, the less contrast a hue may give up to stay close to its key color.
  const floor = 1 - (1 - ramp.floor) * avail;
  const dist = clamp(floor * delta, s.dir * (ramp.p - s.pos), delta);
  return clamp(0, s.pos + s.dir * dist, 1);
}

/** The color at position `p` on `ramp`, with chroma limited by the amount `x`. */
export function colorAt(p: number, x: number, ramp: Ramp, d: Derived): Oklab {
  const l = toeInv(d.lrd + p * (d.lrw - d.lrd));
  const tn = clamp(0, (l - d.ld) / (d.lw - d.ld), 1);
  const t1 = clamp(0, (l - d.ld) / (ramp.l - d.ld), 1);
  const t2 = clamp(0, (l - ramp.l) / (d.lw - ramp.l), 1);
  const tent = Math.max(0.001, Math.min(t1, 1 - t2));
  const s = clamp(0, x / (TINT * tent), 1);
  const neutral = mix(d.dark, d.light, tn);
  const hued = mix(mix(d.dark, ramp.color, t1), d.light, t2);
  return mix(neutral, hued, s);
}

export function surface(s: State, x: number, ramp: Ramp, d: Derived): State {
  const pos = target(s, x, ramp);
  return { pos, dir: dirAt(pos, d) };
}

// ---------------------------------------------------------------------------
// Class names → colors. Same grammar as the CSS utilities.

export const ROOTS = [
  "bg",
  "text",
  "border",
  "outline",
  "ring",
  "divide",
  "fill",
  "stroke",
  "placeholder",
  "accent",
  "caret",
  "decoration",
] as const;
export type Root = (typeof ROOTS)[number];

/** Roots drawn at the element's edge, so they contrast with what's behind the element. */
export const EDGE_ROOTS: ReadonlySet<Root> = new Set(["border", "outline", "ring", "divide"]);

export const AMOUNTS: readonly number[] = Array.from({ length: 21 }, (_, i) => i * 5);

export type Parsed =
  | { kind: "color"; root: Root; hue: string | null; amount: number }
  | { kind: "hue"; hue: string };

const CLASS = new RegExp(`^(${ROOTS.join("|")})-(?:([a-z][a-z0-9]*)-)?(\\d+)%$`);

/** Parses one Huet class. Returns null for anything that isn't one (Tailwind classes, typos). */
export function parseClass(name: string, theme: Theme = defaultTheme): Parsed | null {
  const hueMatch = name.match(/^hue-([a-z][a-z0-9]*)$/);
  if (hueMatch) {
    const hue = hueMatch[1];
    return hue === NEUTRAL || hue in theme.hues ? { kind: "hue", hue } : null;
  }
  const m = name.match(CLASS);
  if (!m) return null;
  const amt = Number(m[3]);
  const hue = m[2] ?? null;
  if (!AMOUNTS.includes(amt)) return null;
  if (hue !== null && hue !== NEUTRAL && !(hue in theme.hues)) return null;
  return { kind: "color", root: m[1] as Root, hue, amount: amt };
}

export type Resolved = Partial<Record<Root, string>> & { text: string };

interface Context {
  state: State;
  under: State | null;
  base: string;
  contrast: number;
}

/**
 * Resolves the colors of the innermost element in a stack of class lists (outermost first),
 * exactly as the CSS would. Useful for canvas/charts and for checking the CSS in tests.
 *
 *   resolve(["bg-50%", "hue-red bg-10%", "text-100%"]).text // "#…"
 */
export function resolve(
  stack: readonly string[],
  theme: Theme = defaultTheme,
  options: { contrast?: number } = {}
): Resolved {
  const d = derive(theme);
  const rampOf = (hue: string | null, base: string) => {
    const name = hue ?? base;
    return name === NEUTRAL ? d.neutral : d.ramps[name];
  };
  let ctx: Context = {
    state: rootState(theme),
    under: null,
    base: NEUTRAL,
    contrast: options.contrast ?? theme.contrast,
  };
  let out: Resolved = { text: "" };

  for (const classList of stack) {
    const parsed = classList
      .split(/\s+/)
      .filter(Boolean)
      .map((c) => parseClass(c, theme))
      .filter((p): p is Parsed => p !== null);
    const next: Context = { ...ctx, under: null };
    for (const p of parsed) if (p.kind === "hue") next.base = p.hue;

    out = { text: "" };
    const bg = parsed.find((p) => p.kind === "color" && p.root === "bg");
    if (bg && bg.kind === "color") {
      const x = amount(bg.amount, next.contrast);
      const ramp = rampOf(bg.hue, next.base);
      next.under = ctx.state;
      next.state = surface(ctx.state, x, ramp, d);
      out.bg = toHex(colorAt(next.state.pos, x, ramp, d));
    }

    const textClass = parsed.find((p) => p.kind === "color" && p.root === "text");
    const textAmount = textClass && textClass.kind === "color" ? textClass.amount : 100;
    const textHue = textClass && textClass.kind === "color" ? textClass.hue : null;
    out.text = colorFor(next.state, textAmount, rampOf(textHue, next.base), next.contrast, d);

    for (const p of parsed) {
      if (p.kind !== "color" || p.root === "bg" || p.root === "text") continue;
      const from = EDGE_ROOTS.has(p.root) ? (next.under ?? next.state) : next.state;
      out[p.root] = colorFor(from, p.amount, rampOf(p.hue, next.base), next.contrast, d);
    }
    ctx = next;
  }
  return out;
}

function colorFor(s: State, percent: number, ramp: Ramp, contrast: number, d: Derived): string {
  const x = amount(percent, contrast);
  return toHex(colorAt(target(s, x, ramp), x, ramp, d));
}
