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
/** Check a literal class list; unrelated layout classes are allowed. */
export function validateClasses(value: string): string[] {
  const names = value.trim().split(/\s+/);
  const errors = names
    .filter((x) => /(?:^|:)huet-/.test(x) && !known.has(x))
    .map((x) => `Unknown Huet class: ${x}`);
  const properties = new Set<string>();
  for (const name of names) {
    const property = parseColorClass(name)?.property ??
      (!known.has(name) ? undefined :
        name.startsWith("huet-surface-") ? "bg" :
        name === "huet-border" ? "border" :
        name === "huet-focus" ? "outline" : "text");
    if (!property) continue;
    if (properties.has(property)) errors.push(property === "bg" ? "Use one Huet surface class per element" : `Use one Huet ${property} class per element`);
    properties.add(property);
  }
  return errors;
}
