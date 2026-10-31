import { hues, type Hue } from "./theme";
export const steps = [0, 5, 10, 25, 50, 75, 100] as const;
export type Surface = (typeof steps)[number] | Hue;
type LegacyClass =
  | `huet-surface-${Surface}`
  | "huet-text"
  | "huet-muted"
  | "huet-border"
  | "huet-focus"
  | `huet-text-${Hue}`;
const legacyClasses: readonly LegacyClass[] = Object.freeze([
  ...steps.map((x) => `huet-surface-${x}` as const),
  ...hues.map((x) => `huet-surface-${x}` as const),
  "huet-text",
  "huet-muted",
  "huet-border",
  "huet-focus",
  ...hues.map((x) => `huet-text-${x}` as const),
]);
/** The amounts classes take: Tailwind's 11 shades on Huet's 0–100 scale, plus both ends. */
export const amounts = [0, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 100] as const;
export type Amount = (typeof amounts)[number];
export const rampNames = ["gray", "red", "yellow", "green", "blue", "purple", "white"] as const;
export type RampName = (typeof rampNames)[number];
export type ColorProperty = "bg" | "text" | "border" | "outline";
type ReferenceProperty = ColorProperty | `bg/${Exclude<ColorProperty, "bg">}`;
export type RelativeClass = `huet-${ReferenceProperty}-${Amount | `${RampName}-${Amount}`}`;
/** Explicit-amount classes also take Tailwind variants: `hover:huet-bg-20`, `md:focus:huet-text-80`. */
export type HuetClass = LegacyClass | RelativeClass | `${string}:${RelativeClass}`;
export interface ColorClass {
  property: ColorProperty;
  ownBackground: boolean;
  amount: number;
  ramp?: RampName;
}
export function parseColorClass(value: string): ColorClass | undefined {
  const match = /^huet-(bg\/)?(bg|text|border|outline)-(?:(gray|red|yellow|green|blue|purple|white)-)?(0|[1-9]\d?|100)$/.exec(value);
  if (!match || (match[1] && match[2] === "bg") || !amounts.includes(Number(match[4]) as Amount)) return;
  return { property: match[2] as ColorProperty, ownBackground: !!match[1],
    ramp: match[3] as RampName | undefined, amount: Number(match[4]) };
}
/**
 * The number a background class's Tailwind utility writes to `--huet-state`.
 * scripts/tailwind-utilities.mjs uses the same formula.
 */
export function stateKey({ ramp, amount }: ColorClass): number {
  return (ramp ? rampNames.indexOf(ramp) + 1 : 0) * 101 + amount;
}
/** The custom property mountTheme writes for a text, border or outline class. */
export function classVariable(base: string): string {
  return "--" + base.replace("/", "-");
}
const relativeClasses: RelativeClass[] = [];
for (const property of ["bg", "text", "border", "outline", "bg/text", "bg/border", "bg/outline"] as const)
  for (const ramp of [undefined, ...rampNames])
    for (const amount of amounts)
      relativeClasses.push(`huet-${property}-${ramp ? ramp + "-" : ""}${amount}` as RelativeClass);
export const classes: readonly HuetClass[] = Object.freeze([...legacyClasses, ...relativeClasses]);
const known = new Set<string>(classes);
const legacy = new Set<string>(legacyClasses);
export interface ClassToken {
  /** Tailwind variants including the final colon, e.g. `md:hover:`. Empty without variants. */
  variants: string;
  base: string;
  important: boolean;
}
/** Split Tailwind variants (`hover:`, `[&>svg]:`, `data-[x=y]:`) and `!` from a class. */
export function parseClassToken(name: string): ClassToken {
  let depth = 0, end = 0;
  for (let i = 0; i < name.length; i++) {
    if (name[i] === "[" || name[i] === "(") depth++;
    else if (name[i] === "]" || name[i] === ")") depth--;
    else if (name[i] === ":" && !depth) end = i + 1;
  }
  let base = name.slice(end);
  // Tailwind v4 writes important as a suffix; v3's prefix form still parses.
  const important = /^!|!$/.test(base);
  if (important) base = base.replace(/^!|!$/, "");
  return { variants: name.slice(0, end), base, important };
}
export function isHuetClass(value: string): value is HuetClass {
  if (known.has(value)) return true;
  const { variants, base, important } = parseClassToken(value);
  return !important && !!variants && !legacy.has(base) && known.has(base) && classError(value) === undefined;
}
const propertyOf = (name: string) => parseColorClass(name)?.property ??
  (!known.has(name) ? undefined :
    name.startsWith("huet-surface-") ? "bg" :
    name === "huet-border" ? "border" :
    name === "huet-focus" ? "outline" : "text");
/** Variant segments of `md:hover:`; brackets and parentheses may contain colons. */
function segments(variants: string): string[] {
  const result: string[] = [];
  let depth = 0, start = 0;
  for (let i = 0; i < variants.length; i++) {
    if (variants[i] === "[" || variants[i] === "(") depth++;
    else if (variants[i] === "]" || variants[i] === ")") depth--;
    else if (variants[i] === ":" && !depth) {
      result.push(variants.slice(start, i));
      start = i + 1;
    }
  }
  return result;
}
/** Variants that style a child or pseudo-element instead of the element with the class. */
const elsewhere = /^(?:\*|\*\*|before|after|placeholder|file|marker|selection|first-line|first-letter|backdrop|details-content)$|^\[.*&(?:\s|_|>|\+|~|::)/;
const replacements: Record<string, string> = {
  "huet-text": "text-huet-fg",
  "huet-muted": "text-huet-muted",
  "huet-border": "border-huet-border",
  ...Object.fromEntries(hues.map((hue) => [`huet-text-${hue}`, `text-huet-${hue}`])),
};
/** The closest class amount, rounding ties down. */
const nearest = (amount: number) =>
  amounts.reduce((a, b) => (Math.abs(b - amount) < Math.abs(a - amount) ? b : a));
/** Tailwind background utilities that paint a Huet color: bg-huet-blue, bg-(--huet-blue), bg-[var(--huet-blue)]. */
const tailwindBackground = /^bg-(?:huet-([\w-]+?)|\((?:color:)?--huet-([\w-]+)\)|\[(?:color:)?var\(--huet-([\w-]+)\)\])(?:\/.*)?$/;
/** Why a single class token isn't a Huet class, with what to write instead. */
function classError(name: string): string | undefined {
  if (known.has(name)) return;
  const { variants, base } = parseClassToken(name);
  const background = tailwindBackground.exec(base);
  if (background) {
    const token = background[1] ?? background[2] ?? background[3];
    const suggestion = (hues as readonly string[]).includes(token) ? `huet-bg-${token}-20` :
      token === "fg" || token === "foreground" ? "huet-bg-100" : token === "background" ? "huet-bg-0" : "huet-bg-20";
    return `Tailwind background utilities paint colors Huet can't track, so colors inside would be solved against the wrong background: ${name}. Use a Huet background class, e.g. "${variants}${suggestion}".`;
  }
  if (!/(?:^|:|!)huet-/.test(name)) return;
  const opacity = /^(.+)\/(?:\d+|\[[^\]]*\]|\([^)]*\))$/.exec(base);
  if (opacity && known.has(opacity[1]))
    return `Huet classes don't take opacity modifiers: ${name}. A see-through color no longer has the contrast Huet chose for it. Use a lower amount instead, e.g. "${variants}${opacity[1].replace(/\d+$/, "10")}".`;
  const amount = /^(huet-(?:bg\/)?(?:bg|text|border|outline)-(?:[a-z]+-)?)(\d+)$/.exec(base);
  if (amount && !known.has(base) && Number(amount[2]) <= 100 && known.has(amount[1] + nearest(Number(amount[2])))) {
    const value = Number(amount[2]);
    const below = [...amounts].reverse().find((x) => x < value), above = amounts.find((x) => x > value);
    return `Huet amounts are ${amounts.join(", ")}: ${name}. Use "${variants}${amount[1]}${below}" or "${variants}${amount[1]}${above}".`;
  }
  if (!known.has(base)) return `Unknown Huet class: ${name}`;
  if (!variants) return;
  if (segments(variants).some((x) => !x)) return `Empty Tailwind variant in ${name}`;
  if (base === "huet-focus")
    return `Use "huet-focus" alone: it already applies only on :focus-visible. For another outline with a variant, use "${variants}huet-outline-100".`;
  if (base.startsWith("huet-surface-"))
    return `Tailwind variants work on huet-bg-AMOUNT classes, not huet-surface-*: ${name}. Use an amount, e.g. "${variants}huet-bg-${/\d+$/.test(base) ? nearest(Number(base.slice(13))) : `${base.slice(13)}-20`}".`;
  if (legacy.has(base))
    return `Tailwind variants work on explicit-amount classes, not ${base}: ${name}. Use "${variants}huet-text-60" or the token utility "${variants}${replacements[base]}".`;
  const outside = segments(variants).find((x) => elsewhere.test(x));
  if (propertyOf(base) === "bg" && outside)
    return `Background variants must style the element with the class: ${name}. "${outside}:" styles a child or pseudo-element, whose background Huet can't track. Put "${base}" on that element instead.`;
}
/** Check a literal class list; unrelated layout classes are allowed. */
export function validateClasses(value: string): string[] {
  const names = value.trim().split(/\s+/);
  const errors = names.map(classError).filter((x) => x !== undefined);
  const seen = new Map<string, string>();
  for (const name of names) {
    const { variants, base } = parseClassToken(name);
    const property = propertyOf(base);
    if (!property) continue;
    const key = variants + property, other = seen.get(key);
    const what = property === "bg" ? "background" : property;
    if (other) errors.push(variants
      ? `Use one Huet ${what} class per variant: ${other} and ${name} both apply on "${variants}"`
      : `Use one Huet ${what} class per element: ${other} and ${name} conflict`);
    else seen.set(key, name);
  }
  return errors;
}
