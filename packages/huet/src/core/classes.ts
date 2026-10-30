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
export type Amount = Enumerate<101>;
type Enumerate<N extends number, A extends number[] = []> =
  A["length"] extends N ? A[number] : Enumerate<N, [...A, A["length"]]>;
export const rampNames = ["gray", "red", "yellow", "green", "blue", "purple", "white"] as const;
export type RampName = (typeof rampNames)[number];
export type ColorProperty = "bg" | "text" | "border" | "outline";
type ReferenceProperty = ColorProperty | `bg/${Exclude<ColorProperty, "bg">}`;
export type RelativeClass = `huet-${ReferenceProperty}-${Amount | `${RampName}-${Amount}`}`;
export type HuetClass = LegacyClass | RelativeClass;
export interface ColorClass {
  property: ColorProperty;
  ownBackground: boolean;
  amount: number;
  ramp?: RampName;
}
export function parseColorClass(value: string): ColorClass | undefined {
  const match = /^huet-(bg\/)?(bg|text|border|outline)-(?:(gray|red|yellow|green|blue|purple|white)-)?(0|[1-9]\d?|100)$/.exec(value);
  if (!match || (match[1] && match[2] === "bg")) return;
  return { property: match[2] as ColorProperty, ownBackground: !!match[1],
    ramp: match[3] as RampName | undefined, amount: Number(match[4]) };
}
const relativeClasses: RelativeClass[] = [];
for (const property of ["bg", "text", "border", "outline", "bg/text", "bg/border", "bg/outline"] as const)
  for (const ramp of [undefined, ...rampNames])
    for (let amount = 0; amount <= 100; amount++)
      relativeClasses.push(`huet-${property}-${ramp ? ramp + "-" : ""}${amount}` as RelativeClass);
export const classes: readonly HuetClass[] = Object.freeze([...legacyClasses, ...relativeClasses]);
const known = new Set<string>(classes);
export function isHuetClass(value: string): value is HuetClass {
  return known.has(value);
}
const propertyOf = (name: string) => parseColorClass(name)?.property ??
  (!known.has(name) ? undefined :
    name.startsWith("huet-surface-") ? "bg" :
    name === "huet-border" ? "border" :
    name === "huet-focus" ? "outline" : "text");
/** Split Tailwind variants (`hover:`, `[&>svg]:`, `data-[x=y]:`) from the class. */
function splitVariants(name: string): [variants: string, base: string] {
  let depth = 0, end = 0;
  for (let i = 0; i < name.length; i++) {
    if (name[i] === "[" || name[i] === "(") depth++;
    else if (name[i] === "]" || name[i] === ")") depth--;
    else if (name[i] === ":" && !depth) end = i + 1;
  }
  return [name.slice(0, end), name.slice(end)];
}
const tokens = "huet-fg, huet-muted, huet-border, huet-red, huet-yellow, huet-green, huet-blue, huet-purple";
/** Why a single class token isn't a Huet class, with what to write instead. */
function classError(name: string): string | undefined {
  if (known.has(name) || !/(?:^|:)huet-/.test(name)) return;
  const [variants, base] = splitVariants(name);
  if (!variants || !known.has(base)) return `Unknown Huet class: ${name}`;
  const property = propertyOf(base);
  const instead =
    base === "huet-focus" ? `Use "huet-focus" alone: it already applies only on :focus-visible.` :
    property === "outline" ? `For an outline only with that variant, use "${base} ${variants}outline-2": ${base} sets only the outline color, and the variant turns the outline on.` :
    property === "bg" ? `Changing a Huet background with a variant isn't supported yet. Keep "${base}" without the variant.` :
    `For a color only with that variant, use a Tailwind token utility from huet/tailwind.css, e.g. "${variants}${property}-huet-blue" (tokens: ${tokens}).`;
  return `Huet classes don't support Tailwind variants yet: ${name}. ${instead}`;
}
/** Check a literal class list; unrelated layout classes are allowed. */
export function validateClasses(value: string): string[] {
  const names = value.trim().split(/\s+/);
  const errors = names.map(classError).filter((x) => x !== undefined);
  const properties = new Set<string>();
  for (const name of names) {
    const property = propertyOf(name);
    if (!property) continue;
    if (properties.has(property)) errors.push(property === "bg" ? "Use one Huet surface class per element" : `Use one Huet ${property} class per element`);
    properties.add(property);
  }
  return errors;
}
