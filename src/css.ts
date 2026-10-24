import { TOE } from "./color.ts";
import { AMOUNTS, EDGE_ROOTS, ROOTS, TINT, type Root } from "./engine.ts";
import { NEUTRAL, createTheme, themeVars, type Theme, type ThemeInput } from "./theme.ts";

/*
  CSS transcription of engine.ts. Read that file first; the names line up.

  Every utility is `params + block`. Params are a few custom properties that differ per class
  (amount, hue). The block is the same for every class of a root and does the math.

  Nesting without JavaScript: every surface (`bg-*`) reads its parent's position from one of two
  slots (a/b) and writes its own position into the other. Which slot to read is decided by a
  container style query on `--huet-p`, the parity its parent published. A custom property can't
  read its parent's value directly (that's what the future `inherit()` is for), so two slots avoid
  the cycle. Everything else simply reads `--huet-pos` / `--huet-dir`.
*/

/** CSS-in-JS in the shape Tailwind's plugin API accepts. */
export interface CssInJs {
  [key: string]: string | CssInJs;
}

const BIG = 1000000;
const { k1, k2, k3 } = TOE;
const v = (name: string) => `var(--huet-${name})`;

interface RampRef {
  c: string;
  p: string;
  l: string;
  f: string;
}

const hueRamp = (hue: string): RampRef => ({
  c: v(`hue-${hue}`),
  p: v(`hue-${hue}-p`),
  l: v(`hue-${hue}-l`),
  f: v(`hue-${hue}-f`),
});

const BASE: RampRef = { c: v("base"), p: v("base-p"), l: v("base-l"), f: v("base-f") };

/** The ramp a root's block reads: whatever its params point at. */
const paramRamp = (ns: string): RampRef => ({
  c: v(`${ns}-hue`),
  p: v(`${ns}-hue-p`),
  l: v(`${ns}-hue-l`),
  f: v(`${ns}-hue-f`),
});

/** engine.target(): writes `--huet-{ns}-a`, `-d` and `out` (the new position). */
function targetDecls(ns: string, P: string, D: string, X: string, r: RampRef, out: string): CssInJs {
  const a = v(`${ns}-a`);
  const d = v(`${ns}-d`);
  return {
    [`--huet-${ns}-a`]: `calc((1 + ${D}) / 2 * (1 - ${P}) + (1 - ${D}) / 2 * ${P})`,
    [`--huet-${ns}-d`]: `calc(${a} * (1 - pow(1 - ${X}, 1 / ${a})))`,
    [out]: `clamp(0, ${P} + ${D} * clamp((1 - (1 - ${r.f}) * ${a}) * ${d}, ${D} * (${r.p} - ${P}), ${d}), 1)`,
  };
}

/** engine.colorAt(): writes `--huet-{ns}-r`, `-l`, `-s` and returns the color expression. */
function colorDecls(ns: string, P: string, X: string, r: RampRef): [CssInJs, string] {
  const lr = v(`${ns}-r`);
  const l = v(`${ns}-l`);
  const s = v(`${ns}-s`);
  const t1 = `clamp(0, (${l} - ${v("ld")}) / (${r.l} - ${v("ld")}), 1)`;
  const t2 = `clamp(0, (${l} - ${r.l}) / (${v("lw")} - ${r.l}), 1)`;
  const tn = `clamp(0, (${l} - ${v("ld")}) / (${v("lw")} - ${v("ld")}), 1)`;
  const decls: CssInJs = {
    [`--huet-${ns}-r`]: `calc(${v("lrd")} + ${P} * (${v("lrw")} - ${v("lrd")}))`,
    [`--huet-${ns}-l`]: `calc((${lr} * ${lr} + ${k1} * ${lr}) / (${k3.toFixed(6)} * (${lr} + ${k2})))`,
    [`--huet-${ns}-s`]: `clamp(0, ${X} / (${TINT} * max(0.001, min(${t1}, 1 - ${t2}))), 1)`,
  };
  const neutral = `color-mix(in oklab, ${v("dark")}, ${v("light")} calc(${tn} * 100%))`;
  const hued = `color-mix(in oklab, color-mix(in oklab, ${v("dark")}, ${r.c} calc(${t1} * 100%)), ${v("light")} calc(${t2} * 100%))`;
  return [decls, `color-mix(in oklab, ${neutral}, ${hued} calc(${s} * 100%))`];
}

const amountExpr = (amount: string) => `clamp(0, ${amount} * ${v("contrast")}, 1)`;

/** A full "color some amount away from position P" computation in namespace `ns`. */
function colorBlock(ns: string, P: string, D: string, amount: string, r: RampRef): [CssInJs, string] {
  const X = v(`${ns}-x`);
  const [cDecls, color] = colorDecls(ns, v(`${ns}-p`), X, r);
  return [
    {
      [`--huet-${ns}-x`]: amountExpr(amount),
      ...targetDecls(ns, P, D, X, r, `--huet-${ns}-p`),
      ...cDecls,
    },
    color,
  ];
}

/**
 * The element's text color. Emitted by every rule that can change it (root, bg-*, hue-*,
 * text-*) and identical in all of them, so declaration order never matters. `text-*` params
 * are registered as non-inherited, so the fallbacks mean "100% in the base hue".
 */
function textBlock(): CssInJs {
  const r: RampRef = {
    c: `var(--huet-text-hue, ${BASE.c})`,
    p: `var(--huet-text-hue-p, ${BASE.p})`,
    l: `var(--huet-text-hue-l, ${BASE.l})`,
    f: `var(--huet-text-hue-f, ${BASE.f})`,
  };
  const [decls, color] = colorBlock("fg", v("pos"), v("dir"), "var(--huet-text-amount, 1)", r);
  return { ...decls, color };
}

/** engine.dirAt() */
const dirAt = (P: string) => `calc(1 - 2 * clamp(0, (${P} - ${v("flip")}) * ${BIG}, 1))`;

export const PARITY_QUERIES = ["@container style(--huet-p: 0)", "@container style(--huet-p: 1)"] as const;

function surfaceBlock(): CssInJs {
  const r = paramRamp("bg");
  const X = v("bg-x");
  const slot = (from: "a" | "b", to: "a" | "b", parity: number): CssInJs => ({
    "--huet-p": String(parity),
    "--huet-under-pos": v(`pos-${from}`),
    "--huet-under-dir": dirAt(v(`pos-${from}`)),
    ...targetDecls("bg", v(`pos-${from}`), v("under-dir"), X, r, `--huet-pos-${to}`),
    "--huet-pos": v(`pos-${to}`),
  });
  const [cDecls, color] = colorDecls("bg", v("pos"), X, r);
  return {
    "--huet-bg-x": amountExpr(v("bg-amt")),
    [PARITY_QUERIES[0]]: slot("a", "b", 1),
    [PARITY_QUERIES[1]]: slot("b", "a", 0),
    "--huet-dir": dirAt(v("pos")),
    ...cDecls,
    "background-color": color,
    ...textBlock(),
  };
}

const COLOR_PROPERTY: Record<Exclude<Root, "bg" | "text" | "divide" | "placeholder">, string> = {
  border: "border-color",
  outline: "outline-color",
  ring: "--tw-ring-color",
  fill: "fill",
  stroke: "stroke",
  accent: "accent-color",
  caret: "caret-color",
  decoration: "text-decoration-color",
};

/** The shared math for one root. Every class of that root uses exactly this block. */
export function rootBlock(root: Root): CssInJs {
  if (root === "bg") return surfaceBlock();
  if (root === "text") return textBlock();
  const edge = EDGE_ROOTS.has(root);
  const P = edge ? `var(--huet-under-pos, ${v("pos")})` : v("pos");
  const D = edge ? `var(--huet-under-dir, ${v("dir")})` : v("dir");
  const [decls, color] = colorBlock(root, P, D, v(`${root}-amt`), paramRamp(root));
  if (root === "divide") return { ":where(& > :not(:last-child))": { ...decls, "border-color": color } };
  if (root === "placeholder") return { ...decls, "&::placeholder": { color } };
  return { ...decls, [COLOR_PROPERTY[root]]: color };
}

/** Parses a utility value such as `25%`, `red-25%` or `neutral-25%`. */
export function parseValue(value: string, theme: Theme): { hue: string | null; amount: number } | null {
  const m = value.match(/^(?:([a-z][a-z0-9]*)-)?(\d+)%$/);
  if (!m) return null;
  const amount = Number(m[2]);
  const hue = m[1] ?? null;
  if (!AMOUNTS.includes(amount)) return null;
  if (hue !== null && hue !== NEUTRAL && !(hue in theme.hues)) return null;
  return { hue, amount };
}

export const amountParam = (root: Root, amount: number): CssInJs => ({
  [root === "text" ? "--huet-text-amount" : `--huet-${root}-amt`]: String(amount / 100),
});

/** Hue params for a root. `null` means "the inherited base hue". */
export function hueParams(root: Root, hue: string | null): CssInJs {
  if (root === "text") {
    // `initial` falls back to the base hue, but still declares the same properties as
    // `text-{hue}-*`, so linters see `text-5% text-red-5%` as a conflict.
    const r: RampRef = hue === null ? { c: "initial", p: "initial", l: "initial", f: "initial" } : hueRamp(hue);
    return { "--huet-text-hue": r.c, "--huet-text-hue-p": r.p, "--huet-text-hue-l": r.l, "--huet-text-hue-f": r.f };
  }
  const r = hue === null ? BASE : hueRamp(hue);
  return { [`--huet-${root}-hue`]: r.c, [`--huet-${root}-hue-p`]: r.p, [`--huet-${root}-hue-l`]: r.l, [`--huet-${root}-hue-f`]: r.f };
}

/** CSS for one color utility, e.g. `colorUtility("bg", "red-25%", theme)`. */
export function colorUtility(root: Root, value: string, theme: Theme): CssInJs | null {
  const parsed = parseValue(value, theme);
  if (!parsed) return null;
  return { ...amountParam(root, parsed.amount), ...hueParams(root, parsed.hue), ...rootBlock(root) };
}

export function hueDecls(hue: string): CssInJs {
  const r = hueRamp(hue);
  return { "--huet-base": r.c, "--huet-base-p": r.p, "--huet-base-l": r.l, "--huet-base-f": r.f };
}

/** `hue-{name}`: sets the default hue for the element and everything inside it. */
export function hueUtility(hue: string, theme: Theme): CssInJs | null {
  if (hue !== NEUTRAL && !(hue in theme.hues)) return null;
  return { ...hueDecls(hue), ...textBlock() };
}

export function hueNames(theme: Theme): string[] {
  return [NEUTRAL, ...Object.keys(theme.hues)];
}

/** Every valid value for a color root, for editor autocomplete and lint rules. */
export function utilityValues(theme: Theme): Record<string, string> {
  const values: Record<string, string> = {};
  for (const hue of [null, ...hueNames(theme)]) {
    for (const amount of AMOUNTS) {
      const key = hue === null ? `${amount}%` : `${hue}-${amount}%`;
      values[key] = key;
    }
  }
  return values;
}

export function hueValues(theme: Theme): Record<string, string> {
  return Object.fromEntries(hueNames(theme).map((h) => [h, h]));
}

const MATH_NAMESPACES = ["bg", "fg", ...ROOTS.filter((r) => r !== "bg" && r !== "text")];

/** `@property` registrations. Typed numbers keep the math from being re-expanded at every use. */
export function propertyRules(): CssInJs {
  const rules: CssInJs = {};
  const reg = (name: string, syntax: string, inherits: boolean, initial?: string) => {
    rules[`@property --huet-${name}`] = {
      syntax: `"${syntax}"`,
      inherits: String(inherits),
      ...(initial === undefined ? {} : { "initial-value": initial }),
    };
  };
  reg("p", "<integer>", true, "0");
  reg("bg", "<number>", true, "1");
  reg("contrast", "<number>", true, "1");
  for (const name of ["pos", "pos-a", "pos-b"]) reg(name, "<number>", true, "1");
  reg("dir", "<number>", true, "-1");
  for (const name of ["under-pos", "under-dir", "text-amount", "text-hue", "text-hue-p", "text-hue-l", "text-hue-f"]) {
    reg(name, "*", false);
  }
  for (const ns of MATH_NAMESPACES) {
    // ::placeholder can only see inherited properties of its input.
    for (const k of ["x", "a", "d", "p", "r", "l", "s"]) reg(`${ns}-${k}`, "<number>", ns === "placeholder", "0");
  }
  return rules;
}

/** Resets nesting state and paints the background. Applied to `:root` and every `[data-theme]`. */
function resetBlock(): CssInJs {
  const neutral = hueRamp(NEUTRAL);
  const [cDecls, color] = colorDecls("bg", v("pos"), "1", neutral);
  return {
    "--huet-p": "0",
    "--huet-pos-a": v("bg"),
    "--huet-pos": v("pos-a"),
    "--huet-dir": dirAt(v("pos")),
    ...hueDecls(NEUTRAL),
    ...cDecls,
    "background-color": color,
    ...textBlock(),
  };
}

export interface ThemesOption {
  /** Extra themes, applied with `data-theme="name"`. Each one starts from the main theme. */
  themes?: Record<string, ThemeInput>;
}

/** Base styles: property registrations, theme variables and the root reset. */
export function baseRules(theme: Theme, options: ThemesOption = {}): CssInJs {
  const rules: CssInJs = { ...propertyRules(), ":root": themeVars(theme) };
  for (const [name, input] of Object.entries(options.themes ?? {})) {
    rules[`[data-theme="${name}"]`] = themeVars(createTheme(input, theme));
  }
  rules[":root, [data-theme]"] = resetBlock();
  return rules;
}
